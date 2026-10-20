import test from 'node:test'
import assert from 'node:assert/strict'
import { loadLessons } from '../learning/load.ts'
import { detect, snapshot } from '../learning/detect.ts'
import { targets } from '../observations/targets.ts'
import { collect } from '../observations/collect.ts'
import { report, reviewMarkdown, reviewSnapshot } from '../observations/report.ts'
import { policy, dependencies } from './observation-fixture.ts'
test('source collection feeds existing review schema; unchanged/changed/failure/expired are distinct and idempotent', async () => {
  const lessons = loadLessons(process.cwd(), '2026-10-20'), before = structuredClone(lessons)
  const observed = await collect(targets(lessons), dependencies(), policy), now = new Date('2026-10-20T00:00:00Z')
  const initial = report(lessons, observed, { observedAt: '2026-10-20', observations: [] }, now)
  assert.equal(initial.reviewItems.length, targets(lessons).length)
  const baseline = reviewSnapshot(initial), urls = new Set(baseline.observations.map(o => o.url))
  const same = report(lessons, observed, baseline, now)
  assert.ok(same.observations.every(o => o.status === 'unchanged')); assert.equal(same.reviewItems.length, 0)
  assert.deepEqual(detect(lessons, snapshot(baseline, urls), snapshot(reviewSnapshot(same), urls)), [])
  const changed = structuredClone(observed); changed[0]!.digest = 'b'.repeat(64)
  const review = report(lessons, changed, baseline, now)
  assert.deepEqual(review, report(lessons, changed, baseline, now))
  assert.ok(review.reviewItems[0]!.lessonIds.length > 0); assert.ok(reviewMarkdown(review).includes('Pending'))
  const unavailable = structuredClone(observed); unavailable[0]!.digest = null; unavailable[0]!.status = 'unavailable'
  assert.equal(report(lessons, unavailable, baseline, now).reviewItems[0]!.reason, 'unavailable')
  assert.ok(report(lessons, observed, baseline, new Date('2026-10-22')).reviewItems.every(i => i.reason === 'observation-expired'))
  assert.throws(() => report(lessons, observed.slice(1), baseline, now))
  assert.deepEqual(lessons, before)
})
