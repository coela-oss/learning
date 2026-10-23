import { createHash } from 'node:crypto'
import { loadLessons } from '../learning/load.ts'
import { snapshot } from '../learning/detect.ts'
import { targets } from '../observations/targets.ts'
import { collect } from '../observations/collect.ts'
import { officialTransport } from '../observations/https-transport.ts'
import { report } from '../observations/report.ts'
import { defaultPolicy } from '../observations/types.ts'
import { readJson } from '../observations/local-state.ts'
import { reserve, seal } from '../observations/run-store.ts'
let phase = 'baseline'
try {
  const [baseline] = process.argv.slice(2), started = new Date()
  if (process.argv.length > 3 || !/^[a-f0-9]{40}$/.test(process.env.LEARNING_SOURCE_SHA ?? '')) throw Error('Invalid admission')
  const lessons = loadLessons(process.cwd(), started.toISOString().slice(0, 10)), selected = targets(lessons)
  const before = snapshot(baseline ? readJson(baseline) : { observedAt: started.toISOString().slice(0, 10), observations: [] },
    new Set(selected.map(item => item.url)))
  if (before.observedAt > started.toISOString().slice(0, 10)) throw Error('Future baseline')
  phase = 'reservation'
  const run = reserve(process.cwd()), requests: Array<{ url: string; httpStatus: number | null; allowedRedirect: boolean | null; errorCode: string | null }> = []
  const allowed = new Set(selected.flatMap(item => item.allowed))
  phase = 'collection'
  const observed = await collect(selected, { ...officialTransport, async request(url, address, signal) {
    if (requests.length >= 96) throw Error('Request budget exhausted')
    const request = { url: url.href, httpStatus: null as number | null, allowedRedirect: null as boolean | null, errorCode: null as string | null }
    requests.push(request)
    let reply
    try { reply = await officialTransport.request(url, address, signal) }
    catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      request.errorCode = typeof code === 'string' && /^[A-Z_0-9]{2,64}$/.test(code) ? code : 'request_failed'
      throw error
    }
    request.httpStatus = reply.status
    if ([301, 302, 303, 307, 308].includes(reply.status)) {
      try { request.allowedRedirect = allowed.has(new URL(reply.headers.location ?? '', url).href) }
      catch { request.allowedRedirect = false }
    }
    return reply
  } }, defaultPolicy)
  // Evaluate freshness at completion; the old start time marked later requests expired.
  const completed = new Date(), result = report(lessons, observed, before, completed)
  phase = 'seal'
  seal(run.path, result, { source: process.env.LEARNING_SOURCE_SHA, startedAt: started.toISOString(),
    completedAt: completed.toISOString(), policy: defaultPolicy, requests,
    baselineSha256: baseline ? createHash('sha256').update(JSON.stringify(before)).digest('hex') : null,
    remoteWrites: false, credentialsUsed: false, lessonMetadataChanged: false })
  const failures = observed.filter(item => item.status !== 'observed').length
  console.log(JSON.stringify({ state: failures ? 'observed_partial_review_required' : 'observed_review_required',
    run: run.id, sources: observed.length, requests: requests.length, failures,
    pendingReviews: result.reviewItems.length, baselineAccepted: false, remoteWrites: false }))
} catch (error) {
  const rawCode = (error as NodeJS.ErrnoException).code
  const errorCode = typeof rawCode === 'string' && /^[A-Z_0-9]{2,30}$/.test(rawCode) ? rawCode : 'validation_refused'
  console.error(JSON.stringify({ phase, errorCode, state: 'collector_stopped', localRunMayExist: true, remoteWrites: false }))
  process.exitCode = 2
}
