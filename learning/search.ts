import type { Domain, Language, Lesson, Practice } from './types.ts'
export function search(lessons: readonly Lesson[], language: Language, query: string,
  domain: Domain | '', practice: Practice | '', version: string): Lesson[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return lessons.filter(lesson => lesson.language === language && (!domain || lesson.domain === domain)
    && (!practice || lesson.status === practice)
    && (!version || lesson.applicability.some(v => `${v.name} ${v.range}` === version))
    && words.every(word => [lesson.title, lesson.summary, ...lesson.objectives,
      ...lesson.sections.flatMap(s => [s.title, ...s.paragraphs])].join(' ').toLocaleLowerCase().includes(word)))
}
