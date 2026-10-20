import assert from 'node:assert/strict'
import { domainIds, type Lesson } from './types.ts'
import { record, text, texts, date, integer } from './guards.ts'
import { officialHosts } from './source-policy.ts'
const fields = ['id', 'domain', 'language', 'title', 'summary', 'objectives', 'prerequisites',
  'related', 'status', 'revision', 'translatedFrom', 'applicability', 'verifiedAt', 'evidence',
  'reviewer', 'reviewStatus', 'reviewDue', 'reviewTriggers', 'sources', 'sections', 'exercise', 'limitations']
export function validateLesson(value: unknown, today: string): Lesson {
  const d = record(value, fields)
  for (const key of ['id', 'title', 'summary']) text(d[key])
  assert.match(String(d.id), /^[a-z][a-z0-9-]{2,60}$/)
  assert.ok(domainIds.includes(d.domain as Lesson['domain']), 'Unknown domain')
  assert.ok(d.language === 'en' || d.language === 'ja', 'Unknown language')
  assert.ok(['current-practice', 'research', 'historical'].includes(String(d.status)), 'Unknown practice')
  integer(d.revision)
  if (d.language === 'en') assert.equal(d.translatedFrom, null, 'English is canonical')
  else integer(d.translatedFrom)
  for (const key of ['objectives', 'prerequisites', 'reviewTriggers', 'limitations']) texts(d[key])
  assert.ok(Array.isArray(d.related) && d.related.length <= 20)
  d.related.forEach(text)
  assert.ok(['synthetic-test', 'documentation-review', 'not-executed'].includes(String(d.evidence)))
  assert.ok(d.reviewStatus === 'reviewed' || d.reviewStatus === 'pending')
  date(d.reviewDue)
  if (d.verifiedAt !== null) { date(d.verifiedAt); assert.ok(d.verifiedAt <= today, 'Future verification') }
  if (d.reviewer !== null) text(d.reviewer)
  if (d.reviewStatus === 'reviewed') {
    assert.ok(d.reviewer && d.verifiedAt && d.evidence !== 'not-executed', 'False verification')
    assert.ok(String(d.reviewDue) >= String(d.verifiedAt), 'Review predates verification')
  }
  if (d.status === 'current-practice') assert.equal(d.reviewStatus, 'reviewed', 'Unreviewed recommendation')
  assert.ok(Array.isArray(d.applicability) && d.applicability.length > 0 && d.applicability.length <= 10)
  for (const item of d.applicability) {
    const v = record(item, ['name', 'range', 'verifiedVersion']); text(v.name); text(v.range)
    if (v.verifiedVersion !== null) text(v.verifiedVersion)
  }
  assert.ok(Array.isArray(d.sources) && d.sources.length > 0 && d.sources.length <= 10)
  for (const item of d.sources) {
    const s = record(item, ['title', 'url', 'basis']); text(s.title); text(s.url); text(s.basis)
    const url = new URL(String(s.url))
    assert.ok(url.protocol === 'https:' && officialHosts.has(url.hostname) && !url.username && !url.password
      && !url.port && !url.search && !url.hash, 'Unapproved source URL')
  }
  assert.ok(Array.isArray(d.sections) && d.sections.length > 0 && d.sections.length <= 12)
  for (const item of d.sections) {
    const s = record(item, ['title', 'paragraphs']); text(s.title); texts(s.paragraphs)
  }
  const exercise = record(d.exercise, ['instruction', 'expected', 'command'])
  text(exercise.instruction); text(exercise.expected)
  if (exercise.command !== null) {
    text(exercise.command)
    assert.match(String(exercise.command), /^pnpm test$/)
  }
  return value as Lesson
}
