import { createHash } from 'node:crypto'
import { snapshot } from '../learning/detect.ts'
import type { Lesson } from '../learning/types.ts'
import type { Observation } from './types.ts'
export interface ReviewItem { id: string; sourceId: string; lessonIds: string[]; reason: string; decision: 'pending' }
export function report(lessons: Lesson[], observations: Observation[], baseline: unknown, now: Date) {
  const urls = new Set(lessons.flatMap(l => l.sources.map(s => s.url)))
  const before = snapshot(baseline, urls)
  if (before.observedAt > now.toISOString().slice(0, 10)) throw Error('Baseline is in the future')
  const seen = new Set<string>(), items: ReviewItem[] = []
  const normalized = observations.map(value => {
    if (!urls.has(value.url) || seen.has(value.url)) throw Error('Unknown or duplicate observation')
    if (value.digest !== null && (!/^[a-f0-9]{64}$/.test(value.digest)
      || !['observed', 'unchanged'].includes(value.status))) throw Error('Inconsistent observation')
    seen.add(value.url)
    const time = Date.parse(value.checkedAt)
    const expired = !Number.isFinite(time) || time > now.getTime() || now.getTime() - time > 86400000
    const previous = before.observations.find(o => o.url === value.url)
    const unchanged = !expired && value.digest !== null && previous?.digest === value.digest && previous.available
    const current = { ...value, status: expired ? 'expired' as const : unchanged ? 'unchanged' as const : value.status }
    if (!unchanged || expired) {
      const reason = expired ? 'observation-expired' : value.digest ? 'source-changed-or-new' : value.status
      items.push({ id: createHash('sha256').update(`${value.sourceId}:${reason}:${value.digest ?? ''}`).digest('hex'),
        sourceId: value.sourceId, lessonIds: [...new Set(lessons.filter(l => l.sources.some(s => s.url === value.url)).map(l => l.id))],
        reason, decision: 'pending' })
    }
    return current
  })
  for (const url of urls) if (!seen.has(url)) throw Error('Incomplete observation set')
  return { observedAt: now.toISOString().slice(0, 10), observations: normalized, reviewItems: items }
}
export function reviewSnapshot(result: ReturnType<typeof report>) {
  return { observedAt: result.observedAt, observations: result.observations.map(o => ({
    url: o.url, digest: o.status === 'expired' ? null : o.digest,
    available: ['observed', 'unchanged'].includes(o.status) && o.digest !== null
  })) }
}
export function reviewMarkdown(result: ReturnType<typeof report>): string {
  return ['# Source observation review', '', 'Detection is not editorial approval. No lesson date was changed.', '',
    ...result.observations.map(o => `- ${o.sourceId}: ${o.status}`), '',
    ...result.reviewItems.map(i => `- Pending ${i.id}: ${i.reason}; lessons: ${i.lessonIds.join(', ')}`)].join('\n') + '\n'
}
