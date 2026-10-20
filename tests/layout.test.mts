import test from 'node:test'
import assert from 'node:assert/strict'
type Child = { id: string; height: number }
function layout(width: number | null, children: readonly Child[]) {
  if (width === null) return { state: 'pending' as const, positions: [] }
  let y = 0
  return { state: 'measured' as const, positions: children.map(child => {
    const position = { id: child.id, x: 0, y }; y += child.height + 8; return position
  }) }
}
test('measured-layout: identity survives missing measurement; computation is deterministic', () => {
  const children = [{ id: 'child-a', height: 20 }, { id: 'child-b', height: 30 }]
  const before = structuredClone(children)
  assert.deepEqual(layout(null, children), { state: 'pending', positions: [] })
  assert.deepEqual(layout(100, children).positions.map(p => p.y), [0, 28])
  assert.deepEqual(layout(100, children), layout(100, children))
  assert.deepEqual(children, before)
})
