import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
test('local-transactions: rollback leaves no partial record or job; commit preserves pending work', () => {
  const db = new DatabaseSync(':memory:')
  try {
    db.exec('CREATE TABLE records(id TEXT PRIMARY KEY); CREATE TABLE jobs(id TEXT PRIMARY KEY, state TEXT)')
    db.exec("BEGIN; INSERT INTO records VALUES('synthetic-a'); INSERT INTO jobs VALUES('synthetic-a','pending')")
    assert.throws(() => db.exec("INSERT INTO records VALUES('synthetic-a')"))
    db.exec('ROLLBACK')
    assert.equal(db.prepare('SELECT count(*) AS n FROM records').get()!.n, 0)
    assert.equal(db.prepare('SELECT count(*) AS n FROM jobs').get()!.n, 0)
    db.exec("BEGIN; INSERT INTO records VALUES('synthetic-a'); INSERT INTO jobs VALUES('synthetic-a','pending'); COMMIT")
    assert.equal(db.prepare('SELECT count(*) AS n FROM records').get()!.n, 1)
    assert.equal(db.prepare('SELECT state FROM jobs').get()!.state, 'pending')
  } finally { db.close() }
})
