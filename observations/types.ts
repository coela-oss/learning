export interface SourceTarget { id: string; url: string; allowed: readonly string[] }
export interface Address { address: string; family: 4 | 6 }
export interface Reply {
  status: number
  headers: Readonly<Record<string, string | undefined>>
  body: AsyncIterable<Uint8Array>
  close(): void
}
export interface Dependencies {
  lookup(host: string): Promise<Address[]>
  request(url: URL, address: Address, signal: AbortSignal): Promise<Reply>
  now(): Date
}
export type Outcome = 'observed' | 'unchanged' | 'unavailable' | 'timeout' |
  'too-large' | 'redirect-blocked' | 'unsupported' | 'network-blocked' | 'expired'
export interface Observation {
  sourceId: string; url: string; checkedAt: string; status: Outcome
  digest: string | null; httpStatus: number | null; lastModified: string | null
}
export interface Policy { timeoutMs: number; maxBytes: number; concurrency: number; retries: number; redirects: number }
export const defaultPolicy: Policy = { timeoutMs: 5000, maxBytes: 524288, concurrency: 2, retries: 1, redirects: 2 }

export class SourceFailure extends Error {
  readonly httpStatus: number
  constructor(code: Outcome, httpStatus: number) {
    super(code); this.name = 'SourceFailure'; this.httpStatus = httpStatus
  }
}
