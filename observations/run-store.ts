import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { admitRun, inventory, readJson, runBytes, stateDirectory, writeJson } from './local-state.ts'
import { reviewMarkdown, reviewSnapshot, type report } from './report.ts'
export function reserve(root: string) {
  const directory = stateDirectory(root)
  admitRun(directory)
  const id = `run-${randomUUID()}`, path = join(directory, id)
  mkdirSync(path, { mode: 0o700 })
  return { id, path }
}
export function seal(path: string, result: ReturnType<typeof report>, receipt: Record<string, unknown>) {
  const values = { 'report.json': JSON.stringify(result, null, 2) + '\n',
    'review.md': reviewMarkdown(result), 'snapshot.json': JSON.stringify(reviewSnapshot(result), null, 2) + '\n' }
  const files: Record<string, string> = {}
  let bytes = 0
  for (const [name, value] of Object.entries(values)) {
    bytes += Buffer.byteLength(value)
    assert.ok(bytes <= runBytes - 16384, 'Observation run exceeds budget')
    writeFileSync(join(path, name), value, { mode: 0o600, flag: 'wx' })
    files[name] = createHash('sha256').update(value).digest('hex')
  }
  const metadata = { ...receipt, schema: 'coela-learning-observation-run/v1', files, sealed: true, baselineAccepted: false }
  assert.ok(Buffer.byteLength(JSON.stringify(metadata, null, 2) + '\n') <= 16384, 'Observation receipt exceeds budget')
  writeJson(join(path, 'receipt.json'), metadata)
}
export function list(root: string) {
  const directory = stateDirectory(root), used = inventory(directory)
  const records = readdirSync(directory).filter(name => /^run-/.test(name)).map(id => {
    try {
      const { receipt } = inspectRun(root, id)
      return { run: id, state: 'sealed', completedAt: receipt.completedAt ?? null }
    } catch { return { run: id, state: 'held', completedAt: null } }
  })
  return { ...used, records, directory, remoteWrites: false }
}
export function inspectRun(root: string, id: string) {
  assert.match(id, /^run-[a-f0-9-]{36}$/)
  const directory = stateDirectory(root)
  inventory(directory) // Refuse links/nested state before reading a run.
  const path = join(directory, id), receipt = readJson(join(path, 'receipt.json')) as Record<string, unknown>
  assert.equal(receipt.schema, 'coela-learning-observation-run/v1')
  assert.equal(receipt.sealed, true)
  assert.deepEqual(readdirSync(path).sort(), ['receipt.json', 'report.json', 'review.md', 'snapshot.json'])
  const files = receipt.files as Record<string, string>
  assert.deepEqual(Object.keys(files).sort(), ['report.json', 'review.md', 'snapshot.json'])
  for (const [name, digest] of Object.entries(files)) {
    assert.equal(createHash('sha256').update(readFileSync(join(path, name))).digest('hex'), digest, 'Altered observation run')
  }
  return { path, receipt }
}
export function removeRun(root: string, id: string): void {
  const { path } = inspectRun(root, id)
  // Explicit removal addresses exactly one sealed generated run. Unknown files
  // are retained, and no recursive deletion or automatic baseline promotion runs.
  for (const name of ['report.json', 'review.md', 'snapshot.json', 'receipt.json']) unlinkSync(join(path, name))
  // Directory removal is deliberately separate from recursive deletion.
  rmdirSync(path)
}
