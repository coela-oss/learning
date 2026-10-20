import test from 'node:test'
import assert from 'node:assert/strict'
import { collect } from '../observations/collect.ts'
import { publicAddress } from '../observations/network-policy.ts'
import { source, policy, response, dependencies } from './observation-fixture.ts'
test('collector hashes exact bounded bytes and pins a public address', async () => {
  const result = await collect([source], dependencies(async (url, ip, signal) => {
    assert.equal(url.href, source.url); assert.equal(ip.address, '8.8.8.8'); assert.equal(signal.aborted, false)
    return response('synthetic')
  }), policy)
  assert.equal(result[0]!.status, 'observed'); assert.match(result[0]!.digest!, /^[a-f0-9]{64}$/)
  assert.equal(result[0]!.checkedAt, '2026-10-20T00:00:00.000Z')
})
test('collector rejects private/reserved DNS results, including expanded and mapped IPv6', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '100.64.0.1',
    '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:0db8:0:0::1', '2002:7f00:1::']) {
    assert.equal(publicAddress(ip), false, ip)
    const deps = dependencies(async () => { throw Error('must not request') })
    deps.lookup = async () => [{ address: ip, family: ip.includes(':') ? 6 : 4 }]
    assert.equal((await collect([source], deps, policy))[0]!.status, 'network-blocked')
  }
})
test('collector bounds response bytes, compressed content, redirects and HTTP failures', async () => {
  const cases = [
    [response('x'.repeat(33)), 'too-large'],
    [response('x', 200, { 'content-length': '33' }), 'too-large'],
    [response('x', 200, { 'content-encoding': 'gzip' }), 'unsupported'],
    [response('x', 200, { 'content-type': 'application/octet-stream' }), 'unsupported'],
    [response('', 302, { location: 'https://127.0.0.1/private' }), 'redirect-blocked'],
    [response('', 404), 'unavailable']
  ] as const
  for (const [reply, status] of cases) assert.equal((await collect([source], dependencies(async () => reply), policy))[0]!.status, status)
})
test('collector cancels a hanging request/body and never stores raw errors', async () => {
  const hanging = dependencies(async () => new Promise(() => {}))
  assert.equal((await collect([source], hanging, { ...policy, timeoutMs: 5 }))[0]!.status, 'timeout')
  const body = response(); body.body = { [Symbol.asyncIterator]: () => ({ next: async () => new Promise(() => {}) }) }
  assert.equal((await collect([source], dependencies(async () => body), { ...policy, timeoutMs: 5 }))[0]!.status, 'timeout')
  const failed = await collect([source], dependencies(async () => { throw Error('PRIVATE_LEARNING_CANARY') }), policy)
  assert.ok(!JSON.stringify(failed).includes('PRIVATE_LEARNING_CANARY'))
})
test('collector rejects duplicate or unapproved targets and bounds retries', async () => {
  await assert.rejects(collect([source, source], dependencies(), policy))
  await assert.rejects(collect([{ ...source, url: 'https://private.invalid/', allowed: ['https://private.invalid/'] }], dependencies(), policy))
  let attempts = 0
  await collect([source], dependencies(async () => { attempts++; return response('', 503) }), { ...policy, retries: 1 })
  assert.equal(attempts, 2)
})
