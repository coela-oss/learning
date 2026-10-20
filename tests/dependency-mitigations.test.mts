import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
function patched(name: string): unknown {
  const lock = readFileSync('pnpm-lock.yaml', 'utf8')
  const block = lock.split(`\n  ${name}@`)[1]
  const hash = block?.match(/\n    hash: ([a-f0-9]{64})\n/)?.[1]
  assert.ok(hash, 'Expected patch hash in the reviewed lockfile')
  const entries = readdirSync('node_modules/.pnpm').filter(p => p.startsWith(`${name}@`) && p.includes(`patch_hash=${hash}`))
  assert.equal(entries.length, 1, `Exactly one patched ${name} is required`)
  return require(resolve('node_modules/.pnpm', entries[0]!, 'node_modules', name)) as unknown
}
test('patched braces bounds nested patterns and external ASTs while preserving normal expansion', () => {
  interface Braces {
    expand(input: string | object): string[]
    compile(input: object): string
    stringify(input: object): string
  }
  const braces = patched('braces') as Braces
  assert.deepEqual(braces.expand('{a,b}'), ['a', 'b'])
  assert.throws(() => braces.expand('{'.repeat(100) + 'a' + '}'.repeat(100)))
  const cyclic: { type: string; nodes: unknown[] } = { type: 'root', nodes: [] }
  cyclic.nodes.push(cyclic)
  for (const operation of [braces.expand, braces.compile, braces.stringify]) assert.throws(() => operation(cyclic))
})
test('patched RSA verifier rejects nested AlgorithmIdentifier parameters', () => {
  interface Asn1 { create(cls: number, type: number, constructed: boolean, value: unknown): unknown
    toDer(value: unknown): { getBytes(): string }; oidToDer(value: string): { getBytes(): string } }
  interface Digest { update(value: string): Digest; digest(): { bytes(): string } }
  interface Forge {
    asn1: Asn1; md: { sha256: { create(): Digest } }
    pki: { rsa: { generateKeyPair(options: { bits: number }): {
      privateKey: { sign(value: Digest | string, scheme?: string): string }
      publicKey: { verify(digest: string, signature: string): boolean }
    } } }
  }
  const forge = patched('node-forge') as Forge
  const keys = forge.pki.rsa.generateKeyPair({ bits: 1024 }) // Ephemeral synthetic test key only.
  const md = () => forge.md.sha256.create().update('synthetic verification input')
  assert.equal(keys.publicKey.verify(md().digest().bytes(), keys.privateKey.sign(md())), true)
  const asn = forge.asn1
  const sequence = (value: unknown[]) => asn.create(0, 16, true, value)
  const malformed = sequence([sequence([
    asn.create(0, 6, false, asn.oidToDer('2.16.840.1.101.3.4.2.1').getBytes()),
    sequence([asn.create(0, 5, false, '')])
  ]), asn.create(0, 4, false, md().digest().bytes())])
  const signature = keys.privateKey.sign(asn.toDer(malformed).getBytes(), 'NONE')
  let accepted = false
  try { accepted = keys.publicKey.verify(md().digest().bytes(), signature) } catch { /* Rejection is expected. */ }
  assert.equal(accepted, false)
})
