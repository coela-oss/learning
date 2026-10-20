# Coding and publication rules

- Use typed interfaces and meaningful responsibility boundaries. TypeScript is
  strict; keep new source files below 120 lines where practical.
- Do not embed customer identities, tenant/account/project IDs, personal paths,
  private repository URLs, real email addresses, credentials or production hosts.
  Pass deployment-specific settings through a validated configuration boundary.
- Protocol identifiers, dependency versions, upstream citations, bounded resource
  constants and documented synthetic test values are legitimate literals.
  Classify them; do not replace safety limits with unrestricted configuration.
- Coela is the publisher brand. Upstream project names identify sources; neither
  a citation nor a synthetic exercise implies upstream endorsement.
- Keep example identities synthetic and non-operational. Test-only private keys
  must never become defaults, fallback credentials or production trust anchors.
- Validate the explicit lesson catalog; do not glob arbitrary documents into the
  website or search index. Exclude private observations, maps and local state.
- Run content/exercise tests, typecheck and static generation. Review all source,
  fixtures, configuration, licenses and dependency patches before publishing.
  A generated-output scan alone does not approve repository publication.
- Keep evidence dates and applicability honest. Report failed and unexecuted
  checks separately; do not turn research into recommended practice automatically.
- Observe public sources only through the bounded allowlist transport. Keep
  observation reports local; scheduling and notification require separate policy.
- Keep `private: true` in package.json: a public source repository does not
  require publishing this application to npm.
- Do not copy the private parent history into a public repository. Publication,
  repository naming and hosting are reviewed operations after candidate approval.
