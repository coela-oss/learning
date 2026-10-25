import test from 'node:test'
import assert from 'node:assert/strict'
import { verifyProject } from '@nuxtjp/dependency-security'

test('the public shared security suite checks the actual installed learning graph', () => {
  const result = verifyProject(process.cwd())
  assert.equal(result.exitCode, 0, result.stdout + result.stderr)
})
