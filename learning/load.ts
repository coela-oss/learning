import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { lessonFiles } from './catalog.ts'
import { validateLesson } from './validate.ts'
import { validateRelationships } from './relationships.ts'
export function loadLessons(root: string, today: string) {
  const lessons = lessonFiles.map(file => validateLesson(JSON.parse(readFileSync(resolve(root, file), 'utf8')), today))
  validateRelationships(lessons)
  return lessons
}
