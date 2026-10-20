import assert from 'node:assert/strict'
import type { Lesson } from './types.ts'
export function validateRelationships(lessons: Lesson[]) {
  const entries = new Map<string, Lesson>()
  for (const lesson of lessons) {
    const key = `${lesson.id}:${lesson.language}`
    assert.ok(!entries.has(key), 'Duplicate lesson language')
    entries.set(key, lesson)
  }
  for (const lesson of lessons) {
    const canonical = entries.get(`${lesson.id}:en`)
    assert.ok(canonical, 'Missing English canonical lesson')
    assert.equal(canonical.domain, lesson.domain, 'Translation domain mismatch')
    assert.equal(canonical.status, lesson.status, 'Translation practice mismatch')
    if (lesson.translatedFrom !== null) assert.ok(lesson.translatedFrom <= canonical.revision, 'Future translation')
    for (const id of lesson.related) {
      assert.ok(id !== lesson.id && entries.has(`${id}:en`), 'Broken internal lesson reference')
    }
  }
}
