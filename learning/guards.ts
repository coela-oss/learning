import assert from 'node:assert/strict'
export function record(value: unknown, fields: readonly string[]): Record<string, unknown> {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Expected record')
  const data = value as Record<string, unknown>
  assert.deepEqual(Object.keys(data).sort(), [...fields].sort(), 'Unknown or missing fields')
  return data
}
export function text(value: unknown): asserts value is string {
  assert.ok(typeof value === 'string' && value.trim().length > 0 && value.length <= 8000, 'Invalid text')
  assert.ok(!/(?:file:\/\/|localhost|127\.0\.0\.1|\/home\/|[A-Z]:\\|github\.com\/[^/]+\/(?:private|internal)(?:[\/\s]|$))/i.test(value), 'Restricted reference')
}
export function texts(value: unknown): asserts value is string[] {
  assert.ok(Array.isArray(value) && value.length > 0 && value.length <= 30, 'Expected bounded text list')
  value.forEach(text)
}
export function date(value: unknown): asserts value is string {
  text(value)
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) === value, 'Invalid date')
}
export function integer(value: unknown): asserts value is number {
  assert.ok(Number.isSafeInteger(value) && Number(value) > 0, 'Invalid revision')
}
