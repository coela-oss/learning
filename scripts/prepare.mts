import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { loadLessons } from '../learning/load.ts'
import { domains } from '../learning/domains.ts'
import { freshness } from '../learning/freshness.ts'
const today = new Date().toISOString().slice(0, 10)
const lessons = loadLessons(process.cwd(), today)
const vue = createRequire(import.meta.url)('vue/package.json') as { version: string }
const reviews = Object.fromEntries(lessons.map(lesson => {
  const canonical = lessons.find(l => l.id === lesson.id && l.language === 'en')!
  return [`${lesson.id}:${lesson.language}`, freshness(lesson, canonical, today,
    { Vue: vue.version, 'Node.js': process.versions.node })]
}))
mkdirSync('.generated', { recursive: true })
writeFileSync('.generated/catalog.json', JSON.stringify({ domains, lessons, reviews }) + '\n')
console.log(`Validated ${lessons.length} lesson pages; evidence dates were not changed.`)
