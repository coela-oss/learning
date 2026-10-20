<script setup lang="ts">
const { language, path } = useLearning()
const lesson = computed(() => learning.lessons.find(l => l.language === language.value && path.value === `/lessons/${l.id}`))
const domain = computed(() => learning.domains.find(d => path.value === `/domains/${d.id}`))
if (path.value !== '/' && !lesson.value && !domain.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
const title = computed(() => lesson.value?.title ?? domain.value?.title[language.value] ?? 'Coela Learning')
useHead({ title, link: computed(() => {
  const english = path.value === '/' ? '/' : path.value
  const translated = !lesson.value || learning.lessons.some(l => l.id === lesson.value?.id && l.language === 'ja')
  return [{ rel: 'canonical', href: learningPath(language.value, path.value === '/' ? '' : path.value) },
    { rel: 'alternate' as const, hreflang: 'en', href: english },
    ...(translated ? [{ rel: 'alternate' as const, hreflang: 'ja', href: learningPath('ja', path.value === '/' ? '' : path.value) }] : [])]
}) })
</script>
<template>
  <LessonArticle v-if="lesson" :lesson="lesson" />
  <DomainPage v-else-if="domain" :domain="domain" :language="language" />
  <LearningHome v-else :language="language" />
</template>
