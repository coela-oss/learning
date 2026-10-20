import test from 'node:test'
import assert from 'node:assert/strict'
type State = 'outside' | 'pending' | 'present' | 'unknown'
function transition(state: State, event: 'request' | 'observed' | 'timeout'): State {
  if (event === 'observed') return 'present'
  if (event === 'request' && state === 'outside') return 'pending'
  if (event === 'timeout' && state === 'pending') return 'unknown'
  return state
}
test('observed-state: an intent or timeout does not establish observed participation', () => {
  assert.equal(transition('outside', 'request'), 'pending')
  assert.equal(transition('pending', 'timeout'), 'unknown')
  assert.equal(transition('unknown', 'request'), 'unknown')
  assert.equal(transition('unknown', 'observed'), 'present')
})
