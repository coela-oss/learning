<script setup lang="ts">
import type { Lesson } from '../../learning/types'
const props = defineProps<{ lesson: Lesson }>()
const en = computed(() => props.lesson.language === 'en')
const review = computed(() => learning.reviews[`${props.lesson.id}:${props.lesson.language}`]!)
const related = computed(() => props.lesson.related.map(id => learning.lessons.find(l => l.id === id && l.language === props.lesson.language)
  ?? learning.lessons.find(l => l.id === id && l.language === 'en')!))
</script>
<template>
  <article>
    <nav aria-label="Breadcrumb"><NuxtLink :to="learningPath(lesson.language)">{{ en ? 'All domains' : '全分野' }}</NuxtLink> / <NuxtLink :to="learningPath(lesson.language, `/domains/${lesson.domain}`)">{{ learning.domains.find(d => d.id === lesson.domain)!.title[lesson.language] }}</NuxtLink></nav>
    <div class="intro"><p class="eyebrow">{{ learningLabel(lesson.status, lesson.language) }} · {{ learningLabel(review.state, lesson.language) }}</p><h1>{{ lesson.title }}</h1><p>{{ lesson.summary }}</p></div>
    <p v-if="review.reasons.length" class="notice">{{ review.reasons.join(' · ') }}</p>
    <section><h2>{{ en ? 'Learning objectives' : '学習目的' }}</h2><ul><li v-for="item in lesson.objectives" :key="item">{{ item }}</li></ul></section>
    <section><h2>{{ en ? 'Before you begin' : '前提知識・適用対象' }}</h2><ul><li v-for="item in lesson.prerequisites" :key="item">{{ item }}</li></ul>
      <ul><li v-for="v in lesson.applicability" :key="v.name">{{ v.name }}: {{ v.range }} · {{ en ? 'Exercise version' : '確認対象版' }}: {{ v.verifiedVersion ?? 'unverified' }}</li></ul>
    </section>
    <section v-for="section in lesson.sections" :key="section.title"><h2>{{ section.title }}</h2><p v-for="p in section.paragraphs" :key="p">{{ p }}</p></section>
    <section class="exercise"><h2>{{ en ? 'Try it and check' : '合成例・確認方法' }}</h2><p>{{ lesson.exercise.instruction }}</p><code v-if="lesson.exercise.command">{{ lesson.exercise.command }}</code><p><strong>{{ en ? 'Expected:' : '期待結果：' }}</strong> {{ lesson.exercise.expected }}</p></section>
    <section><h2>{{ en ? 'Limits and open questions' : '制約・未検証範囲' }}</h2><ul><li v-for="item in lesson.limitations" :key="item">{{ item }}</li></ul></section>
    <section><h2>{{ en ? 'Evidence and review' : '根拠と見直し' }}</h2>
      <dl><dt>{{ en ? 'Last evidence review' : '実際の最終確認日' }}</dt><dd>{{ lesson.verifiedAt ?? (en ? 'Not verified' : '未確認') }}</dd><dt>{{ en ? 'Evidence' : '確認種別' }}</dt><dd>{{ learningLabel(lesson.evidence, lesson.language) }} · {{ lesson.reviewer ?? 'pending' }}</dd><dt>{{ en ? 'Review due' : '見直し期限' }}</dt><dd>{{ lesson.reviewDue }}</dd></dl>
      <ul><li v-for="trigger in lesson.reviewTriggers" :key="trigger">{{ trigger }}</li></ul>
      <ul><li v-for="source in lesson.sources" :key="source.url"><a :href="source.url" rel="noreferrer">{{ source.title }}</a><p>{{ source.basis }}</p></li></ul>
    </section>
    <section v-if="related.length"><h2>{{ en ? 'Continue learning' : '関連する学習' }}</h2><ul><li v-for="item in related" :key="item.id"><NuxtLink :to="learningPath(item.language, `/lessons/${item.id}`)">{{ item.title }}{{ item.language !== lesson.language ? ' (English)' : '' }}</NuxtLink></li></ul></section>
  </article>
</template>
