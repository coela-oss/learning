import test from 'node:test'
import assert from 'node:assert/strict'
import { loadLessons } from '../learning/load.ts'
import { freshness } from '../learning/freshness.ts'
import { search } from '../learning/search.ts'
const lessons = loadLessons(process.cwd(), '2026-10-20')
const en = lessons.find(l => l.id === 'local-transactions' && l.language === 'en')!
test('expired evidence, version changes and upstream signals require review without changing verification', () => {
  const before = structuredClone(en)
  assert.equal(freshness(en, en, '2028-01-01').state, 'review-needed')
  assert.equal(freshness(en, en, '2026-10-16', { 'Node.js': '24.16.0' }).state, 'review-needed')
  for (const reason of ['source-changed', 'security-advisory', 'example-failed', 'broken-link'] as const) {
    assert.equal(freshness(en, en, '2026-10-16', {}, [{ lessonId: en.id, reason, detail: 'Synthetic detection' }]).state, 'review-needed')
  }
  assert.deepEqual(en, before)
})
test('unknown evidence cannot become verified because time or a build passed', () => {
  const pending = { ...en, status: 'research' as const, verifiedAt: null, reviewer: null, reviewStatus: 'pending' as const, evidence: 'not-executed' as const }
  assert.equal(freshness(pending, pending, '2026-10-16').state, 'unknown')
})
test('translation lag is separate from practice and does not rewrite the translation', () => {
  const ja = lessons.find(l => l.id === en.id && l.language === 'ja')!
  assert.equal(freshness(ja, { ...en, revision: 2 }, '2026-10-16').state, 'review-needed')
  assert.equal(ja.translatedFrom, 1)
})
test('search respects language, practice, domain and applicability', () => {
  assert.equal(search(lessons, 'en', 'rollback', 'data', 'current-practice', 'Node.js 24.x node:sqlite').length, 1)
  assert.equal(search(lessons, 'en', 'rollback', 'ui', '', '').length, 0)
  assert.equal(search(lessons, 'ja', '', '', '', '').length, lessons.filter(l => l.language === 'ja').length)
})
