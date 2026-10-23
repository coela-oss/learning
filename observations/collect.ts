import assert from 'node:assert/strict'
import { readSource } from './read.ts'
import { approvedUrl, validatePolicy } from './network-policy.ts'
import { SourceFailure, defaultPolicy, type Dependencies, type Observation, type Outcome, type Policy, type SourceTarget } from './types.ts'
const failures = new Set<Outcome>(['unavailable', 'timeout', 'too-large', 'redirect-blocked', 'unsupported', 'network-blocked'])
async function one(target: SourceTarget, deps: Dependencies, policy: Policy): Promise<Observation> {
  const base = { sourceId: target.id, url: target.url, checkedAt: deps.now().toISOString() }
  for (let attempt = 0; attempt <= policy.retries; attempt++) {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const result = await Promise.race([readSource(target, deps, policy, controller.signal),
        new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('timeout')) }, policy.timeoutMs) })])
      return { ...base, status: 'observed', ...result }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      const status: Outcome = controller.signal.aborted ? 'timeout' : failures.has(message as Outcome) ? message as Outcome : 'unavailable'
      const httpStatus = error instanceof SourceFailure ? error.httpStatus : null
      if (attempt < policy.retries && status === 'unavailable' && (httpStatus === null || httpStatus >= 500)) continue
      return { ...base, status, digest: null, httpStatus, lastModified: null }
    } finally { if (timer) clearTimeout(timer); controller.abort() }
  }
  throw Error('Attempt limit')
}
export async function collect(targets: readonly SourceTarget[], deps: Dependencies,
  policy: Policy = defaultPolicy): Promise<Observation[]> {
  validatePolicy(policy)
  assert.ok(targets.length > 0 && targets.length <= 16 && new Set(targets.map(t => t.url)).size === targets.length, 'Invalid source count or duplicate')
  for (const target of targets) approvedUrl(target.url, target)
  const results: Observation[] = new Array(targets.length)
  let index = 0
  await Promise.all(Array.from({ length: Math.min(policy.concurrency, targets.length) }, async () => {
    while (index < targets.length) { const current = index++; results[current] = await one(targets[current]!, deps, policy) }
  }))
  return results
}
