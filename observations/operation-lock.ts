import assert from 'node:assert/strict'
import { closeSync, fstatSync, lstatSync, openSync, unlinkSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { stateDirectory } from './local-state.ts'
export function operationLock(root: string): () => void {
  const file = join(stateDirectory(root), 'active.lock')
  const fd = openSync(file, 'wx', 0o600), identity = fstatSync(fd)
  writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }) + '\n')
  return () => {
    try {
      const current = lstatSync(file)
      assert.ok(!current.isSymbolicLink() && current.ino === identity.ino && current.dev === identity.dev, 'Observation lock changed')
      unlinkSync(file)
    } finally { closeSync(fd) }
  }
}
