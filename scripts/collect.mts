import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { loadLessons } from '../learning/load.ts'
import { targets } from '../observations/targets.ts'
import { collect } from '../observations/collect.ts'
import { officialTransport } from '../observations/https-transport.ts'
import { report, reviewMarkdown, reviewSnapshot } from '../observations/report.ts'
const [baseline] = process.argv.slice(2)
assert.ok(process.argv.length <= 3, 'Usage: pnpm observe [baseline.json]')
const now = new Date(), lessons = loadLessons(process.cwd(), now.toISOString().slice(0, 10))
const before: unknown = baseline ? JSON.parse(readFileSync(baseline, 'utf8'))
  : { observedAt: now.toISOString().slice(0, 10), observations: [] }
const observed = await collect(targets(lessons), officialTransport)
const result = report(lessons, observed, before, now)
mkdirSync('.local/observations', { recursive: true, mode: 0o700 })
const name = now.toISOString().replaceAll(':', '-')
writeFileSync(`.local/observations/${name}.json`, JSON.stringify(result, null, 2) + '\n', { mode: 0o600, flag: 'wx' })
writeFileSync(`.local/observations/${name}.md`, reviewMarkdown(result), { mode: 0o600, flag: 'wx' })
writeFileSync(`.local/observations/${name}.snapshot.json`, JSON.stringify(reviewSnapshot(result), null, 2) + '\n', { mode: 0o600, flag: 'wx' })
console.log(`Saved ${observed.length} source observations and ${result.reviewItems.length} pending reviews locally.`)
