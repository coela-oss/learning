import { createHash } from 'node:crypto'
import type { Lesson } from '../learning/types.ts'
import type { SourceTarget } from './types.ts'
export function targets(lessons: readonly Lesson[]): SourceTarget[] {
  return [...new Set(lessons.flatMap(l => l.sources.map(s => s.url)))].sort().map(url => ({
    id: createHash('sha256').update(url).digest('hex').slice(0, 24), url,
    allowed: [url, ...(url === 'https://www.rfc-editor.org/rfc/rfc9700.html'
      ? ['https://www.rfc-editor.org/info/rfc9700/'] : [])]
  }))
}
