<script setup lang="ts">
import { search } from '../../learning/search'
import type { Domain, Language, Practice } from '../../learning/types'
const props = defineProps<{ language: Language }>()
const query = ref(''), domain = ref<Domain | ''>(''), practice = ref<Practice | ''>(''), version = ref('')
const versions = [...new Set(learning.lessons.flatMap(l => l.applicability.map(v => `${v.name} ${v.range}`)))]
const results = computed(() => search(learning.lessons, props.language, query.value, domain.value, practice.value, version.value))
</script>
<template>
  <section aria-labelledby="search-title">
    <h2 id="search-title">{{ language === 'en' ? 'Find a lesson' : '教材を探す' }}</h2>
    <form class="filters" role="search" @submit.prevent>
      <label>{{ language === 'en' ? 'Search' : '検索' }}<input v-model="query" type="search" maxlength="200" :placeholder="language === 'en' ? 'A topic or question' : 'トピック・疑問'" /></label>
      <label>{{ language === 'en' ? 'Domain' : '分野' }}<select v-model="domain"><option value="">{{ language === 'en' ? 'All' : 'すべて' }}</option><option v-for="d in learning.domains" :key="d.id" :value="d.id">{{ d.title[language] }}</option></select></label>
      <label>{{ language === 'en' ? 'Practice' : '位置付け' }}<select v-model="practice"><option value="">{{ language === 'en' ? 'All' : 'すべて' }}</option><option value="current-practice">Current practice</option><option value="research">Research</option><option value="historical">Historical</option></select></label>
      <label>{{ language === 'en' ? 'Applicability' : '適用対象' }}<select v-model="version"><option value="">{{ language === 'en' ? 'All' : 'すべて' }}</option><option v-for="v in versions" :key="v">{{ v }}</option></select></label>
    </form>
    <p role="status">{{ results.length }} {{ language === 'en' ? 'matching lessons' : '件の教材' }}</p>
    <div class="lesson-list">
      <NuxtLink v-for="lesson in results" :key="lesson.id" class="lesson-card" :to="learningPath(language, `/lessons/${lesson.id}`)">
        <span class="badge">{{ learningLabel(lesson.status, language) }}</span><h3>{{ lesson.title }}</h3><p>{{ lesson.summary }}</p>
      </NuxtLink>
    </div>
  </section>
</template>
