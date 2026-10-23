import { createHash } from 'node:crypto'
import { approvedUrl, publicAddress } from './network-policy.ts'
import { SourceFailure, type Dependencies, type Observation, type Policy, type SourceTarget } from './types.ts'
export async function readSource(target: SourceTarget, deps: Dependencies, policy: Policy,
  signal: AbortSignal): Promise<Pick<Observation, 'digest' | 'httpStatus' | 'lastModified'>> {
  let next = target.url
  for (let redirects = 0; redirects <= policy.redirects; redirects++) {
    const url = approvedUrl(next, target)
    const addresses = await deps.lookup(url.hostname)
    if (!addresses.length || addresses.length > 16 || addresses.some(a => !publicAddress(a.address))) throw Error('network-blocked')
    signal.throwIfAborted()
    const reply = await deps.request(url, addresses[0]!, signal)
    try {
      if ([301, 302, 303, 307, 308].includes(reply.status)) {
        next = new URL(reply.headers.location ?? '', url).href
        if (!target.allowed.includes(next) || redirects === policy.redirects) throw new SourceFailure('redirect-blocked', reply.status)
        continue
      }
      if (reply.status !== 200) throw new SourceFailure('unavailable', reply.status)
      if (!/^(text\/(html|plain)|application\/json)(;|$)/i.test(reply.headers['content-type'] ?? '')
        || !['', 'identity'].includes(reply.headers['content-encoding'] ?? '')) throw new SourceFailure('unsupported', reply.status)
      const length = reply.headers['content-length'] ?? ''
      if (length && (!/^\d+$/.test(length) || Number(length) > policy.maxBytes)) throw new SourceFailure('too-large', reply.status)
      let size = 0
      const hash = createHash('sha256')
      for await (const chunk of reply.body) {
        if (!(chunk instanceof Uint8Array)) throw new SourceFailure('unsupported', reply.status)
        signal.throwIfAborted(); size += chunk.byteLength
        if (size > policy.maxBytes) throw new SourceFailure('too-large', reply.status)
        hash.update(chunk)
      }
      const modified = Date.parse(reply.headers['last-modified'] ?? '')
      return { digest: hash.digest('hex'), httpStatus: reply.status,
        lastModified: Number.isFinite(modified) ? new Date(modified).toISOString() : null }
    } finally { reply.close() }
  }
  throw Error('redirect-blocked')
}
