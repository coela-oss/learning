import catalog from '../../.generated/catalog.json'
import type { DomainInfo } from '../../learning/domains'
import type { Freshness, Language, Lesson } from '../../learning/types'
export const learning = catalog as {
  domains: DomainInfo[]; lessons: Lesson[]; reviews: Record<string, Freshness>
}
export const learningPath = (language: Language, path = '') => `${language === 'en' ? '' : '/ja'}${path}` || '/'
export function useLearning() {
  const route = useRoute()
  const segments = computed(() => route.path.split('/').filter(Boolean))
  const language = computed<Language>(() => segments.value[0] === 'ja' ? 'ja' : 'en')
  const path = computed(() => '/' + (language.value === 'ja' ? segments.value.slice(1) : segments.value).join('/'))
  return { language, path }
}
