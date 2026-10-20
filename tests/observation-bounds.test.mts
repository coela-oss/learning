import test from 'node:test'
import assert from 'node:assert/strict'
import { collect } from '../observations/collect.ts'
import { source, policy, response, dependencies } from './observation-fixture.ts'
test('collector closes responses and bounds active requests and redirect loops', async () => {
  let active = 0, peak = 0, closed = 0
  const list = Array.from({ length: 6 }, (_, i) => ({ ...source, id: String(i), url: `${source.url}/${i}`, allowed: [`${source.url}/${i}`] }))
  const deps = dependencies(async () => {
    active++; peak = Math.max(peak, active)
    await new Promise(resolve => setTimeout(resolve, 2))
    const reply = response(); reply.close = () => { active--; closed++ }; return reply
  })
  await collect(list, deps, { ...policy, timeoutMs: 100 })
  assert.equal(peak, 2); assert.equal(closed, 6); assert.equal(active, 0)
  let calls = 0
  const loop = dependencies(async () => { calls++; return response('', 302, { location: source.url }) })
  assert.equal((await collect([source], loop, policy))[0]!.status, 'redirect-blocked')
  assert.equal(calls, 3)
  await assert.rejects(collect(list, deps, { ...policy, concurrency: 3 }))
})
