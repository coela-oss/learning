export const domainIds = ['foundations', 'software', 'ui', 'data', 'network',
  'security', 'cloud', 'ai', 'engineering'] as const
export type Domain = typeof domainIds[number]
export type Language = 'en' | 'ja'
export type Practice = 'current-practice' | 'research' | 'historical'
export interface Source { title: string; url: string; basis: string }
export interface Applicability { name: string; range: string; verifiedVersion: string | null }
export interface Section { title: string; paragraphs: string[] }
export interface Lesson {
  id: string
  domain: Domain
  language: Language
  title: string
  summary: string
  objectives: string[]
  prerequisites: string[]
  related: string[]
  status: Practice
  revision: number
  translatedFrom: number | null
  applicability: Applicability[]
  verifiedAt: string | null
  evidence: 'synthetic-test' | 'documentation-review' | 'not-executed'
  reviewer: string | null
  reviewStatus: 'reviewed' | 'pending'
  reviewDue: string
  reviewTriggers: string[]
  sources: Source[]
  sections: Section[]
  exercise: { instruction: string; expected: string; command: string | null }
  limitations: string[]
}
export interface ReviewEvent {
  lessonId: string
  reason: 'source-changed' | 'security-advisory' | 'example-failed' | 'broken-link'
  detail: string
}
export interface Freshness { state: 'reviewed' | 'review-needed' | 'unknown'; reasons: string[] }
