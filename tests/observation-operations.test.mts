import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { collect } from '../observations/collect.ts'
import { report } from '../observations/report.ts'
import { targets } from '../observations/targets.ts'
import { loadLessons } from '../learning/load.ts'
import { operationLock } from '../observations/operation-lock.ts'
import { admitRun, readJson, runLimit, stateDirectory } from '../observations/local-state.ts'
import { inspectRun, removeRun, reserve, seal } from '../observations/run-store.ts'
import { dependencies, policy, response, source } from './observation-fixture.ts'
function fixture(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'learning-operations-'))
  try { run(root) } finally { rmSync(root, { recursive: true, force: true }) }
}
test('receipt-sealed runs are private, immutable and explicitly removed without touching another run', async () => {
  const lessons = loadLessons(process.cwd(), '2026-10-24'), before = structuredClone(lessons)
  const observed = await collect(targets(lessons), dependencies(), policy)
  const result = report(lessons, observed, { observedAt: '2026-10-20', observations: [] }, new Date('2026-10-20T00:00:01Z'))
  fixture(root => {
    const run = reserve(root), other = reserve(root)
    seal(run.path, result, { source: 'a'.repeat(40) })
    assert.equal(inspectRun(root, run.id).receipt.baselineAccepted, false)
    assert.equal(statSync(join(run.path, 'receipt.json')).mode & 0o077, 0)
    assert.throws(() => seal(run.path, result, {}))
    removeRun(root, run.id)
    assert.deepEqual(readdirSync(stateDirectory(root)), [other.id])
  })
  assert.deepEqual(lessons, before)
})
test('altered, incomplete, linked and unknown run state is held instead of recursively deleted', async () => {
  const lessons = loadLessons(process.cwd(), '2026-10-20')
  const result = report(lessons, await collect(targets(lessons), dependencies(), policy),
    { observedAt: '2026-10-20', observations: [] }, new Date('2026-10-20T00:00:00Z'))
  fixture(root => {
    const run = reserve(root)
    assert.throws(() => removeRun(root, run.id))
    seal(run.path, result, {})
    const file = join(run.path, 'review.md'), original = readFileSync(file)
    writeFileSync(file, 'altered')
    assert.throws(() => removeRun(root, run.id), /Altered/)
    writeFileSync(file, original); writeFileSync(join(run.path, 'unknown'), 'retain')
    assert.throws(() => removeRun(root, run.id))
    assert.equal(readFileSync(join(run.path, 'unknown'), 'utf8'), 'retain')
    symlinkSync(join(run.path, 'report.json'), join(run.path, 'linked'))
    assert.throws(() => admitRun(stateDirectory(root)), /Linked/)
  })
})
test('run/entry/byte quotas and physical-directory checks refuse before a new run is reserved', () => fixture(root => {
  const directory = stateDirectory(root)
  for (let n = 0; n < runLimit; n++) mkdirSync(join(directory, `held-${n}`), { mode: 0o700 })
  assert.throws(() => reserve(root), /retention budget/)
  assert.equal(readdirSync(directory).length, runLimit)
  writeFileSync(join(directory, 'oversized'), Buffer.alloc(131073))
  assert.throws(() => admitRun(directory), /Unsupported/)
}))
test('operation lock excludes concurrent collection/cleanup and preserves an unknown lock', () => fixture(root => {
  const release = operationLock(root)
  assert.throws(() => operationLock(root), /EEXIST/)
  release()
  const again = operationLock(root); again()
  symlinkSync(root, join(stateDirectory(root), 'active.lock'))
  assert.throws(() => operationLock(root), /EEXIST/)
}))
test('baseline reads reject oversized and linked files; reports reject future baselines', () => fixture(root => {
  const file = join(root, 'baseline.json'); writeFileSync(file, Buffer.alloc(131073))
  assert.throws(() => readJson(file), /Invalid observation file/)
  symlinkSync(file, join(root, 'linked.json')); assert.throws(() => readJson(join(root, 'linked.json')))
  assert.throws(() => report(loadLessons(process.cwd(), '2026-10-24'), [],
    { observedAt: '2026-10-25', observations: [] }, new Date('2026-10-24T00:00:00Z')), /future/)
}))
test('HTTP failures retain status, client refusals are not retried and successful late observations stay fresh at completion', async () => {
  for (const httpStatus of [403, 404, 503]) {
    let calls = 0
    const result = await collect([source], dependencies(async () => { calls++; return response('', httpStatus) }), { ...policy, retries: 1 })
    assert.equal(result[0]!.httpStatus, httpStatus)
    assert.equal(result[0]!.digest, null)
    assert.equal(calls, httpStatus === 503 ? 2 : 1)
  }
  const lessons = loadLessons(process.cwd(), '2026-10-24'), deps = dependencies()
  deps.now = () => new Date('2026-10-24T00:00:01Z')
  const observed = await collect(targets(lessons), deps, policy)
  const result = report(lessons, observed, { observedAt: '2026-10-24', observations: [] }, new Date('2026-10-24T00:00:02Z'))
  assert.ok(result.observations.every(item => item.status === 'observed'))
  const repeated = report(lessons, observed, { observedAt: '2026-10-24', observations: [] }, new Date('2026-10-24T00:00:03Z'))
  assert.deepEqual(result.reviewItems.map(item => item.id), repeated.reviewItems.map(item => item.id))
})
