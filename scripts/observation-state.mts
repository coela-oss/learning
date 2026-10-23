import { fileURLToPath } from 'node:url'
import { list, removeRun } from '../observations/run-store.ts'
import { operationLock } from '../observations/operation-lock.ts'
const root = fileURLToPath(new URL('..', import.meta.url)), [command, id, ...extra] = process.argv.slice(2)
let release: (() => void) | undefined
try {
  if (extra.length || !['status', 'remove'].includes(command ?? '') || (command === 'status' ? !!id : !id)) throw Error('Invalid operation')
  release = operationLock(root)
  if (command === 'remove') removeRun(root, id!)
  console.log(JSON.stringify({ state: command === 'remove' ? 'one_sealed_run_removed' : 'local_inventory', ...list(root) }))
} catch {
  console.error(JSON.stringify({ state: 'local_state_refused', remoteWrites: false }))
  process.exitCode = 2
} finally {
  try { release?.() } catch { process.exitCode = 2; console.error(JSON.stringify({ state: 'lock_changed_inspect_local_state', remoteWrites: false })) }
}
