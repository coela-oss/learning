<script setup lang="ts">
import type { DomainInfo } from '../../learning/domains'
import type { Language } from '../../learning/types'
const props = defineProps<{ domain: DomainInfo; language: Language }>()
const lessons = computed(() => learning.lessons.filter(l => l.domain === props.domain.id && l.language === props.language))
</script>
<template>
  <nav aria-label="Breadcrumb"><NuxtLink :to="learningPath(language)">{{ language === 'en' ? 'All domains' : '全分野' }}</NuxtLink></nav>
  <section class="intro"><p class="eyebrow">{{ language === 'en' ? 'Learning domain' : '学習分野' }}</p>
    <h1>{{ domain.title[language] }}</h1><p>{{ domain.scope[language] }}</p>
  </section>
  <div v-if="lessons.length" class="lesson-list">
    <NuxtLink v-for="lesson in lessons" :key="lesson.id" class="lesson-card" :to="learningPath(language, `/lessons/${lesson.id}`)">
      <span class="badge">{{ learningLabel(lesson.status, language) }}</span><h2>{{ lesson.title }}</h2><p>{{ lesson.summary }}</p>
    </NuxtLink>
  </div>
  <p v-else class="notice">{{ language === 'en' ? 'No reviewed lesson is available in this domain yet. Its scope is reserved; no implementation or course coverage is implied.' : 'この分野の教材はまだありません。対象範囲を定義した段階です。' }}</p>
</template>
