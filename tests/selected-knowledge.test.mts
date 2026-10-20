import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { DatabaseSync, backup } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('record identity survives a content revision while its byte digest changes', () => {
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex')
  const before = { id: 'synthetic-record', revision: 1, body: 'first' }
  const after = { ...before, revision: 2, body: 'second' }
  assert.equal(before.id, after.id)
  assert.notEqual(digest(before.body), digest(after.body))
  assert.equal(digest('first'), digest(before.body))
  assert.notEqual(JSON.stringify({ a: 1, b: 2 }), JSON.stringify({ b: 2, a: 1 }))
  const linked = new Map<string, string>()
  assert.equal(linked.get(digest(before.body)), undefined)
})

test('a transfer acknowledgement or wrong destination digest does not verify completion', () => {
  type State = 'pending' | 'accepted' | 'unknown' | 'verified'
  const observe = (state: State, expected: string, actual: string | null): State =>
    actual === expected ? 'verified' : state
  assert.equal(observe('accepted', 'synthetic-digest-a', null), 'accepted')
  assert.equal(observe('unknown', 'synthetic-digest-a', 'synthetic-digest-b'), 'unknown')
  assert.equal(observe('unknown', 'synthetic-digest-a', 'synthetic-digest-a'), 'verified')
})

test('an independently opened SQLite backup retains its explicit earlier revision', async () => {
  const root = mkdtempSync(join(tmpdir(), 'learning-restore-'))
  const source = new DatabaseSync(':memory:')
  let restored: DatabaseSync | undefined
  try {
    source.exec('CREATE TABLE records(revision INTEGER PRIMARY KEY, body TEXT)')
    source.prepare('INSERT INTO records VALUES (?, ?)').run(1, 'synthetic-first')
    const file = join(root, 'snapshot.sqlite')
    await backup(source, file)
    source.prepare('INSERT INTO records VALUES (?, ?)').run(2, 'synthetic-second')
    restored = new DatabaseSync(file, { readOnly: true })
    assert.equal(restored.prepare('SELECT max(revision) AS n FROM records').get()!.n, 1)
    assert.equal(source.prepare('SELECT max(revision) AS n FROM records').get()!.n, 2)
    assert.equal(restored.prepare('SELECT body FROM records WHERE revision=1').get()!.body, 'synthetic-first')
  } finally {
    restored?.close()
    source.close()
    rmSync(root, { recursive: true, force: true })
  }
})

test('portable view data round-trips and report text stays outside interpreted markup', () => {
  const view = { nodes: [{ id: 'parent' }, { id: 'child', parent: 'parent', x: 0, y: 40 }],
    edges: [], viewport: { x: 0, y: 0, zoom: 1 } }
  assert.deepEqual(JSON.parse(JSON.stringify(view)), view)
  const escapeText = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  assert.equal(escapeText('<script>&value</script>'), '&lt;script&gt;&amp;value&lt;/script&gt;')
  assert.equal(escapeText('ordinary text'), 'ordinary text')
})
