import assert from 'node:assert/strict'
import type { Lesson, ReviewEvent } from './types.ts'
import { date, record, text } from './guards.ts'
interface Observation { url: string; digest: string | null; available: boolean }
interface Snapshot { observedAt: string; observations: Observation[] }
export function snapshot(value: unknown, sources: Set<string>): Snapshot {
  const data = record(value, ['observedAt', 'observations']); date(data.observedAt)
  assert.ok(Array.isArray(data.observations) && data.observations.length <= 30)
  const seen = new Set<string>()
  for (const row of data.observations) {
    const item = record(row, ['url', 'digest', 'available']); text(item.url)
    assert.ok(sources.has(item.url) && !seen.has(item.url), 'Unknown or duplicate source')
    seen.add(item.url)
    assert.equal(typeof item.available, 'boolean')
    if (item.digest !== null) assert.match(String(item.digest), /^[a-f0-9]{64}$/)
    if (item.available) assert.ok(item.digest, 'Available observation needs digest')
  }
  return value as Snapshot
}
export function detect(lessons: Lesson[], previous: Snapshot, observed: Snapshot): ReviewEvent[] {
  assert.ok(observed.observedAt >= previous.observedAt, 'Observation predates baseline')
  const events: ReviewEvent[] = []
  for (const lesson of lessons.filter(l => l.language === 'en')) {
    for (const source of lesson.sources) {
      const before = previous.observations.find(o => o.url === source.url)
      const after = observed.observations.find(o => o.url === source.url)
      if (!after || !after.available) events.push({ lessonId: lesson.id, reason: 'broken-link', detail: 'Source unavailable or not observed; review required' })
      else if (!before?.digest || before.digest !== after.digest) events.push({ lessonId: lesson.id, reason: 'source-changed', detail: 'Source digest changed or no baseline exists; review required' })
    }
  }
  return events
}
