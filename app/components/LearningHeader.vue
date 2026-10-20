<script setup lang="ts">
const { language, path } = useLearning()
const other = computed(() => language.value === 'en' ? 'ja' : 'en')
const hasTranslation = computed(() => !path.value.startsWith('/lessons/') || learning.lessons.some(
  l => l.id === path.value.split('/').at(-1) && l.language === other.value))
</script>
<template>
  <header>
    <NuxtLink class="brand" :to="learningPath(language)">Coela <span>Learning</span></NuxtLink>
    <nav aria-label="Primary">
      <NuxtLink :to="learningPath(language)">{{ language === 'en' ? 'Explore & search' : '分野・検索' }}</NuxtLink>
      <NuxtLink v-if="hasTranslation" :to="learningPath(other, path === '/' ? '' : path)" :lang="other" :hreflang="other">
        {{ other === 'ja' ? '日本語' : 'English' }}
      </NuxtLink>
      <span v-else>{{ language === 'en' ? 'Translation unavailable' : '翻訳未作成' }}</span>
    </nav>
  </header>
</template>
