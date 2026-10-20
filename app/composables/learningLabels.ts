import type { Language } from '../../learning/types'
const labels: Record<string, [string, string]> = {
  'current-practice': ['Current practice', '現在の実践'], research: ['Research', '研究中'],
  historical: ['Historical experiment', '過去の実験'], reviewed: ['Evidence reviewed', '根拠確認済み'],
  'review-needed': ['Review needed', '見直しが必要'], unknown: ['Unverified', '未確認'],
  'synthetic-test': ['Synthetic exercise executed', '合成例を実行'],
  'documentation-review': ['Documentation reviewed', '資料を確認'],
  'not-executed': ['Not executed', '未実行']
}
export const learningLabel = (key: string, language: Language) => labels[key]?.[language === 'en' ? 0 : 1] ?? key
