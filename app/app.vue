<script setup lang="ts">
const { language } = useLearning()
useHead({ htmlAttrs: { lang: language } })
</script>
<template>
  <a class="skip" href="#main">{{ language === 'en' ? 'Skip to content' : '本文へ' }}</a>
  <LearningHeader />
  <main id="main" tabindex="-1"><NuxtPage /></main>
  <footer>Coela Learning · {{ language === 'en' ? 'Learning notes with explicit evidence and limits.' : '根拠と適用範囲を明記した学習資料。' }}</footer>
</template>
