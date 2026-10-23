import { execFile, execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { operationLock } from '../observations/operation-lock.ts'
const root = fileURLToPath(new URL('..', import.meta.url)), args = process.argv.slice(2)
let release: (() => void) | undefined
let phase = 'admission'
try {
  if (args.length > 1) throw Error('Usage: pnpm observe [reviewed-baseline.json]')
  release = operationLock(root)
  phase = 'source_identity'
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', timeout: 3000, maxBuffer: 1024 }).trim()
  execFileSync('git', ['diff', '--exit-code', 'HEAD', '--'], { cwd: root, timeout: 3000, maxBuffer: 16384, stdio: 'pipe' })
  if (!/^[a-f0-9]{40}$/.test(source)) throw Error('Invalid source')
  phase = 'worker'
  const result = await new Promise<{ code: number; stdout: string }>(resolve => {
    execFile(process.execPath, ['--max-old-space-size=128', fileURLToPath(new URL('./collect-worker.mts', import.meta.url)), ...args],
      { cwd: root, encoding: 'utf8', timeout: 120000, killSignal: 'SIGKILL', maxBuffer: 16384,
        env: { LANG: 'C.UTF-8', LEARNING_SOURCE_SHA: source } }, (error, stdout) => resolve({ code: error ? 2 : 0, stdout }))
  })
  if (!result.stdout.trim()) throw Error('Worker stopped without a completed receipt')
  const summary: unknown = JSON.parse(result.stdout)
  console.log(JSON.stringify(result.code ? { state: 'worker_failed_inspect_run', summary, remoteWrites: false } : summary))
  process.exitCode = result.code
} catch (error) {
  const rawCode = (error as NodeJS.ErrnoException).code
  const errorCode = typeof rawCode === 'string' && /^[A-Z_0-9]{2,30}$/.test(rawCode) ? rawCode : 'validation_refused'
  console.error(JSON.stringify({ phase, errorCode, state: 'collector_not_complete', localStateRequiresInspection: true, remoteWrites: false }))
  process.exitCode = 2
} finally {
  try { release?.() } catch { process.exitCode = 2; console.error(JSON.stringify({ state: 'lock_changed_inspect_local_state', remoteWrites: false })) }
}
