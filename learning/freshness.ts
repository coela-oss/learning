import type { Freshness, Lesson, ReviewEvent } from './types.ts'
export function freshness(lesson: Lesson, canonical: Lesson, today: string,
  versions: Readonly<Record<string, string>> = {}, events: readonly ReviewEvent[] = []): Freshness {
  const reasons: string[] = []
  if (lesson.reviewStatus !== 'reviewed' || !lesson.verifiedAt) reasons.push('No completed evidence review')
  if (lesson.reviewDue < today) reasons.push('Evidence review is due')
  if (lesson.translatedFrom !== null && lesson.translatedFrom !== canonical.revision) reasons.push('Translation is behind English')
  for (const version of lesson.applicability) {
    if (versions[version.name] && versions[version.name] !== version.verifiedVersion) {
      reasons.push(`Version changed: ${version.name}`)
    }
  }
  for (const event of events) if (event.lessonId === lesson.id) reasons.push(`${event.reason}: ${event.detail}`)
  return { state: reasons.length ? (lesson.verifiedAt ? 'review-needed' : 'unknown') : 'reviewed', reasons }
}
