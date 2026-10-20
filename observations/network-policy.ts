import assert from 'node:assert/strict'
import { BlockList, isIP } from 'node:net'
import { officialHosts } from '../learning/source-policy.ts'
import type { Policy, SourceTarget } from './types.ts'
export function approvedUrl(value: string, target: SourceTarget): URL {
  const url = new URL(value)
  assert.ok(officialHosts.has(url.hostname) && target.allowed.includes(url.href) && url.protocol === 'https:' && !url.username
    && !url.password && !url.port && !url.hash && !url.search && !isIP(url.hostname), 'network-blocked')
  return url
}
export function publicAddress(value: string): boolean {
  if (isIP(value) === 4) {
    const [a = 0, b = 0, c = 0] = value.split('.').map(Number)
    return a > 0 && a < 224 && a !== 10 && a !== 127 && !(a === 169 && b === 254)
      && !(a === 172 && b >= 16 && b <= 31) && !(a === 192 && b === 168)
      && !(a === 100 && b >= 64 && b <= 127) && !(a === 198 && (b === 18 || b === 19))
      && !(a === 192 && (b === 0 || (b === 88 && c === 99)))
      && !(a === 198 && b === 51 && c === 100) && !(a === 203 && b === 0 && c === 113)
  }
  if (isIP(value) !== 6) return false
  const global = new BlockList(), reserved = new BlockList()
  global.addSubnet('2000::', 3, 'ipv6')
  reserved.addSubnet('2001::', 23, 'ipv6')
  reserved.addSubnet('2001:db8::', 32, 'ipv6')
  reserved.addSubnet('2002::', 16, 'ipv6')
  return global.check(value, 'ipv6') && !reserved.check(value, 'ipv6')
}
export function validatePolicy(policy: Policy) {
  for (const [key, cap] of Object.entries({ timeoutMs: 10000, maxBytes: 1048576, concurrency: 2, retries: 1, redirects: 2 })) {
    const value = policy[key as keyof Policy]
    assert.ok(Number.isSafeInteger(value) && value >= (key === 'retries' || key === 'redirects' ? 0 : 1) && value <= cap, 'Invalid bounded policy')
  }
}
