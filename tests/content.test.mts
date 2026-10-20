import test from 'node:test'
import assert from 'node:assert/strict'
import { loadLessons } from '../learning/load.ts'
import { validateLesson } from '../learning/validate.ts'
import { validateRelationships } from '../learning/relationships.ts'
const lessons = loadLessons(process.cwd(), '2026-10-20')
const base = lessons.find(l => l.id === 'local-transactions' && l.language === 'en')!
const mutations: Record<string, (d: Record<string, unknown>) => void> = {
  'extra private metadata': d => { d.internalNotes = 'restricted' },
  'missing prerequisites': d => { delete d.prerequisites },
  'missing applicability': d => { d.applicability = [] },
  'missing sources': d => { d.sources = [] },
  'unreviewed recommendation': d => { d.reviewStatus = 'pending' },
  'false execution evidence': d => { d.evidence = 'not-executed' },
  'future verification': d => { d.verifiedAt = '2099-01-01' },
  'invalid calendar date': d => { d.verifiedAt = '2026-02-30' },
  'unknown domain': d => { d.domain = 'legacy-org' },
  'English marked as translation': d => { d.translatedFrom = 1 },
  'empty exercise outcome': d => { d.exercise = { instruction: 'Try', expected: '', command: null } },
  'restricted source': d => { d.sources = [{ title: 'Private', url: 'https://example.invalid/private-source', basis: 'No' }] },
  'internal environment path': d => { d.summary = ['', 'home', 'synthetic', 'project'].join('/') }
}
for (const [name, mutate] of Object.entries(mutations)) test(`schema rejects ${name}`, () => {
  const value = structuredClone(base) as unknown as Record<string, unknown>; mutate(value)
  assert.throws(() => validateLesson(value, '2026-10-16'))
})
test('relationship validation rejects missing canonical, duplicates and dangling links', () => {
  assert.throws(() => validateRelationships(lessons.filter(l => l.language !== 'en')))
  assert.throws(() => validateRelationships([...lessons, base]))
  assert.throws(() => validateRelationships([{ ...base, related: ['missing'] }]))
  const ja = lessons.find(l => l.id === base.id && l.language === 'ja')!
  assert.throws(() => validateRelationships([base, { ...ja, translatedFrom: 99 }]))
})
