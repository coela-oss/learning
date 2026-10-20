import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { loadLessons } from '../learning/load.ts'
import { detect, snapshot } from '../learning/detect.ts'
const [baseline, observation] = process.argv.slice(2)
assert.ok(baseline && observation && process.argv.length === 4, 'Usage: pnpm review baseline.json observed.json')
const lessons = loadLessons(process.cwd(), new Date().toISOString().slice(0, 10))
const urls = new Set(lessons.flatMap(l => l.sources.map(s => s.url)))
const before = snapshot(JSON.parse(readFileSync(baseline, 'utf8')), urls)
const after = snapshot(JSON.parse(readFileSync(observation, 'utf8')), urls)
const events = detect(lessons, before, after)
mkdirSync('.local', { recursive: true, mode: 0o700 })
writeFileSync('.local/review-items.json', JSON.stringify({ observedAt: after.observedAt, events }, null, 2) + '\n', { mode: 0o600 })
console.log(`${events.length} review items saved locally. No lesson, verification date or recommendation was changed.`)
