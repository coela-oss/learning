// Deliberate allowlist: preservation notes and provenance are never globbed.
export const lessonFiles = [
  'topics/ui/lessons/measured-layout.en.json',
  'topics/ui/lessons/measured-layout.ja.json',
  'topics/data/lessons/local-transactions.en.json',
  'topics/data/lessons/local-transactions.ja.json',
  'topics/network/lessons/observed-state.en.json',
  'topics/network/lessons/observed-state.ja.json',
  'topics/security/lessons/authorization-boundaries.en.json',
  'topics/security/lessons/authorization-boundaries.ja.json',
  'topics/ai/lessons/suggestions-and-evidence.en.json',
  'topics/ai/lessons/suggestions-and-evidence.ja.json',
  'topics/engineering/lessons/verifiable-claims.en.json',
  'topics/engineering/lessons/verifiable-claims.ja.json',
  'topics/foundations/lessons/record-and-content-identity.en.json',
  'topics/foundations/lessons/record-and-content-identity.ja.json',
  'topics/software/lessons/accepted-and-verified-transfer.en.json',
  'topics/software/lessons/accepted-and-verified-transfer.ja.json',
  'topics/cloud/lessons/snapshot-and-restore-evidence.en.json',
  'topics/cloud/lessons/snapshot-and-restore-evidence.ja.json',
  'topics/ui/lessons/portable-views-and-safe-reports.en.json',
  'topics/ui/lessons/portable-views-and-safe-reports.ja.json'
] as const
