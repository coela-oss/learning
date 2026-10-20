<script setup lang="ts">
import type { Language } from '../../learning/types'
defineProps<{ language: Language }>()
</script>
<template>
  <section class="intro">
    <p class="eyebrow">Explore · Understand · Verify</p>
    <h1>{{ language === 'en' ? 'Build understanding, one boundary at a time.' : '境界を知り、理解を積み重ねる。' }}</h1>
    <p>{{ language === 'en' ? 'Practical explanations, small exercises and evidence you can examine. Choose a domain or search a question.' : '解説・小さな演習・確認可能な根拠から学ぶ。分野を選ぶか、疑問を検索してください。' }}</p>
  </section>
  <section aria-labelledby="domains-title">
    <h2 id="domains-title">{{ language === 'en' ? 'Learning domains' : '学習分野' }}</h2>
    <div class="domains">
      <NuxtLink v-for="domain in learning.domains" :key="domain.id" class="domain-card" :to="learningPath(language, `/domains/${domain.id}`)">
        <h3>{{ domain.title[language] }}</h3><p>{{ domain.scope[language] }}</p>
        <span>{{ learning.lessons.filter(l => l.domain === domain.id && l.language === language).length }} {{ language === 'en' ? 'lessons' : '教材' }} →</span>
      </NuxtLink>
    </div>
  </section>
  <SearchPanel :language="language" />
</template>
