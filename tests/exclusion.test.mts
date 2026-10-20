import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { lessonFiles } from '../learning/catalog.ts'
import { loadLessons } from '../learning/load.ts'
test('only explicitly reviewed lesson files enter the catalog; preservation and arbitrary JSON stay excluded', () => {
  const root = mkdtempSync(join(tmpdir(), 'learning-boundary-'))
  try {
    for (const file of lessonFiles) { mkdirSync(dirname(join(root, file)), { recursive: true }); copyFileSync(file, join(root, file)) }
    mkdirSync(join(root, 'provenance'))
    writeFileSync(join(root, 'provenance/private.json'), '{"internalNotes":"PRIVATE_LEARNING_CANARY"}')
    writeFileSync(join(root, 'topics/ui/lessons/unapproved.json'), '{"summary":"PRIVATE_LEARNING_CANARY"}')
    const rendered = JSON.stringify(loadLessons(root, '2026-10-20'))
    assert.ok(!rendered.includes('PRIVATE_LEARNING_CANARY'))
    assert.equal(JSON.parse(rendered).length, lessonFiles.length)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
