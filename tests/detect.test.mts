import test from 'node:test'
import assert from 'node:assert/strict'
import { loadLessons } from '../learning/load.ts'
import { detect, snapshot } from '../learning/detect.ts'
const lessons = loadLessons(process.cwd(), '2026-10-20')
const urls = new Set(lessons.flatMap(l => l.sources.map(s => s.url)))
const base = { observedAt: '2026-10-16', observations: [...urls].map(url => ({ url, digest: 'a'.repeat(64), available: true })) }
test('source detection creates review items, never promotes evidence or ignores missing observations', () => {
  const before = structuredClone(lessons), old = snapshot(base, urls)
  assert.deepEqual(detect(lessons, old, old), [])
  const changed = structuredClone(base); changed.observations[0]!.digest = 'b'.repeat(64)
  assert.ok(detect(lessons, old, snapshot(changed, urls)).some(e => e.reason === 'source-changed'))
  assert.equal(detect(lessons, old, snapshot({ ...base, observations: [] }, urls)).length, lessons.filter(l => l.language === 'en').length)
  assert.deepEqual(lessons, before)
})
test('source observations reject unknown URLs, duplicate entries, stale dates and invalid digests', () => {
  assert.throws(() => snapshot({ ...base, observations: [{ ...base.observations[0], url: 'https://private.invalid/' }] }, urls))
  assert.throws(() => snapshot({ ...base, observations: [base.observations[0], base.observations[0]] }, urls))
  assert.throws(() => snapshot({ ...base, observations: [{ ...base.observations[0], digest: 'wrong' }] }, urls))
  assert.throws(() => detect(lessons, snapshot(base, urls), snapshot({ ...base, observedAt: '2026-10-15' }, urls)))
})
