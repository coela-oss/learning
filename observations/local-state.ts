import assert from 'node:assert/strict'
import { closeSync, constants, fstatSync, lstatSync, mkdirSync, openSync, readSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
export const storageLimit = 2 * 1024 * 1024
export const runLimit = 16
export const runBytes = 128 * 1024
export function stateDirectory(root: string): string {
  let path = root
  for (const segment of ['.local', 'observations']) {
    path = join(path, segment)
    try { mkdirSync(path, { mode: 0o700 }) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    }
    const info = lstatSync(path)
    assert.ok(info.isDirectory() && !info.isSymbolicLink() && (info.mode & 0o077) === 0, 'Observation directory must be physical and private')
  }
  return path
}
export function readJson(path: string, limit = runBytes): unknown {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const info = fstatSync(fd)
    assert.ok(info.isFile() && info.nlink === 1 && info.size <= limit, 'Invalid observation file')
    const bytes = Buffer.alloc(limit + 1)
    let size = 0
    while (size < bytes.length) {
      const count = readSync(fd, bytes, size, bytes.length - size, null)
      if (!count) break
      size += count
    }
    assert.ok(size <= limit, 'Observation file exceeds budget')
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, size)))
  } finally { closeSync(fd) }
}
export function inventory(directory: string) {
  let bytes = 0, entries = 0, runs = 0
  function scan(path: string, depth: number) {
    assert.ok(depth <= 1, 'Unexpected nested observation state')
    for (const name of readdirSync(path)) {
      assert.ok(++entries <= 128, 'Observation entry budget exhausted')
      const info = lstatSync(join(path, name))
      assert.ok(!info.isSymbolicLink(), 'Linked observation state')
      if (info.isDirectory()) { runs++; scan(join(path, name), depth + 1) }
      else {
        assert.ok(info.isFile() && info.nlink === 1 && info.size <= runBytes, 'Unsupported observation state')
        bytes += info.size
      }
    }
  }
  scan(directory, 0)
  assert.ok(bytes <= storageLimit, 'Observation storage budget exhausted')
  return { bytes, runs, entries }
}
export function admitRun(directory: string): void {
  const used = inventory(directory)
  assert.ok(used.runs < runLimit && used.bytes + runBytes <= storageLimit, 'Observation retention budget exhausted; review local state')
}
export function writeJson(path: string, value: unknown): void {
  const text = JSON.stringify(value, null, 2) + '\n'
  assert.ok(Buffer.byteLength(text) <= runBytes, 'Observation output exceeds budget')
  writeFileSync(path, text, { mode: 0o600, flag: 'wx' })
}
