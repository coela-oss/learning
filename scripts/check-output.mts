import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { domains } from '../learning/domains.ts'
import { loadLessons } from '../learning/load.ts'
const root = '.output/public'
const restricted = ['PRIVATE_LEARNING_CANARY', 'provenance/', 'internalNotes', 'sourceMappingURL=']
let total = 0
function inspect(path: string) {
  for (const file of readdirSync(path, { withFileTypes: true })) {
    const name = join(path, file.name)
    if (file.isDirectory()) { inspect(name); continue }
    assert.ok(!file.isSymbolicLink(), 'Output symlink')
    assert.ok(!name.endsWith('.map') && !/\/(provenance|tests|topics|maintenance)\//.test(name), 'Restricted output path')
    const content = readFileSync(name); total += content.length
    assert.ok(!/(?:\/home\/[^\s"<>]+|[A-Z]:\\Users\\|https?:\/\/[^\s"<>]+\.internal\b)/i.test(content.toString()), 'Environment reference')
    for (const marker of restricted) assert.ok(!content.includes(Buffer.from(marker)), `Restricted content in ${name}`)
  }
}
inspect(root)
assert.ok(total < 30 * 1024 * 1024, 'Unexpected output growth')
for (const prefix of ['', '/ja']) {
  for (const domain of domains) assert.ok(readFileSync(`${root}${prefix}/domains/${domain.id}/index.html`).length)
}
for (const lesson of loadLessons(process.cwd(), new Date().toISOString().slice(0, 10))) {
  const prefix = lesson.language === 'en' ? '' : '/ja'
  const html = readFileSync(`${root}${prefix}/lessons/${lesson.id}/index.html`, 'utf8')
  assert.ok(html.includes(lesson.title) && html.includes('noindex, nofollow'))
}
console.log(`Static route and restricted-output checks passed (${total} bytes). This is not access control.`)
