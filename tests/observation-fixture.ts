import type { Address, Dependencies, Policy, Reply, SourceTarget } from '../observations/types.ts'
export const source: SourceTarget = { id: 'fixture-source', url: 'https://vuejs.org/api/composition-api-lifecycle',
  allowed: ['https://vuejs.org/api/composition-api-lifecycle'] }
export const policy: Policy = { timeoutMs: 30, maxBytes: 32, concurrency: 2, retries: 0, redirects: 2 }
export const address: Address = { address: '8.8.8.8', family: 4 }
export function response(text = 'synthetic', status = 200, headers: Record<string, string> = {}): Reply {
  return { status, headers: { 'content-type': 'text/plain', ...headers },
    body: (async function* () { yield Buffer.from(text) })(), close() {} }
}
export function dependencies(request: Dependencies['request'] = async () => response()): Dependencies {
  return { now: () => new Date('2026-10-20T00:00:00Z'), lookup: async () => [address], request }
}
