import test from 'node:test'
import assert from 'node:assert/strict'
import { loadLessons } from '../learning/load.ts'
test('authorization example: authenticated identity cannot authorize a different scope', () => {
  const permit = (workspace: string, action: string, expires: number, now: number) =>
    workspace === 'synthetic-a' && action === 'read' && now < expires
  assert.equal(permit('synthetic-b', 'read', 20, 10), false)
  assert.equal(permit('synthetic-a', 'write', 20, 10), false)
  assert.equal(permit('synthetic-a', 'read', 20, 20), false)
  assert.equal(permit('synthetic-a', 'read', 20, 10), true)
})
test('interpretation example: a proposed deadline stays unresolved without timezone and date', () => {
  const proposal = { source: 'synthetic-message', kind: 'ai-suggestion', deadline: null }
  assert.equal(proposal.deadline, null)
  assert.notEqual(proposal.kind, 'verified-fact')
  assert.equal('executionGrant' in proposal, false)
})
test('documentation example: unexecuted integration cannot be reported as passed', () => {
  type Evidence = { unit: 'passed' | 'failed'; integration: 'not-run' | 'passed' | 'failed' }
  const describe = (e: Evidence) => e.integration === 'passed' ? 'integration passed' : 'integration unverified'
  assert.equal(describe({ unit: 'passed', integration: 'not-run' }), 'integration unverified')
  assert.equal(describe({ unit: 'passed', integration: 'failed' }), 'integration unverified')
})
test('selected lessons retain separate locales, explicit evidence and public references', () => {
  const lessons = loadLessons(process.cwd(), '2026-10-20')
  for (const id of ['authorization-boundaries', 'suggestions-and-evidence', 'verifiable-claims']) {
    const pair = lessons.filter(l => l.id === id)
    assert.deepEqual(pair.map(l => l.language).sort(), ['en', 'ja'])
    assert.ok(pair.every(l => l.evidence === 'synthetic-test' && l.limitations.length > 0))
  }
})
