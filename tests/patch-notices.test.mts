import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
interface Entry { name: string; version: string; selectedLicense: string; licenseFile: string
  licenseSha256: string; patchFile: string; patchSha256: string; integrity: string }
function entries(): Entry[] {
  const value: unknown = JSON.parse(readFileSync('third-party/patches.json', 'utf8'))
  assert(value && typeof value === 'object' && 'schema' in value && value.schema === 'learning-patch-notices-v1')
  assert('packages' in value && Array.isArray(value.packages))
  return value.packages as Entry[]
}
function check(entry: Entry, read: (path: string) => Buffer = readFileSync): void {
  assert.match(entry.licenseFile, /^LICENSES\/[a-z0-9.-]+\.txt$/)
  assert.equal(entry.patchFile, `patches/${entry.name}@${entry.version}.patch`)
  assert(['MIT', 'BSD-3-Clause'].includes(entry.selectedLicense))
  assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]+=*$/)
  for (const [path, hash] of [[entry.licenseFile, entry.licenseSha256], [entry.patchFile, entry.patchSha256]]) {
    assert.match(hash!, /^[a-f0-9]{64}$/)
    assert.equal(createHash('sha256').update(read(path!)).digest('hex'), hash)
  }
}
test('every shipped dependency patch retains its exact upstream license and reviewed provenance', () => {
  const packages = entries()
  assert.deepEqual(packages.map(entry => entry.patchFile).sort(), readdirSync('patches').filter(p => p.endsWith('.patch')).map(p => `patches/${p}`).sort())
  for (const entry of packages) check(entry)
  assert.match(readFileSync('THIRD_PARTY_NOTICES.md', 'utf8'), /BSD-3-Clause option/)
})
test('changed patch or license bytes cannot satisfy the recorded attribution evidence', () => {
  for (const entry of entries()) for (const changed of [entry.patchFile, entry.licenseFile]) {
    assert.throws(() => check(entry, path => path === changed ? Buffer.from('changed') : readFileSync(path)))
  }
})
