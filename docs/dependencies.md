# Dependency mitigations

The Learning owner uses public `@nuxtjp/dependency-security@0.2.0` for installed
graph traversal, fixed-version policy and behavioral backport checks. The local
test delegates to its API; it does not maintain a second resolver or RSA/brace
regression suite. No unpublished package or local source fallback is required.

`pnpm-workspace.yaml` remains the sole package-manager configuration. Its
overrides explicitly project the public package's `policy` export; the generic
configuration CLI refuses workspace YAML and is not bypassed. After changes run
`pnpm install --frozen-lockfile --ignore-scripts`, `pnpm test`, tools/application
type checks and static generation in owner CI. The check traverses active
dependencies; stale inactive store entries are not evidence of a selected patch.

The original Learning patches and exact provenance remain under `patches/` and
`third-party/patches.json`. Their SPDX/license notices are retained. These patches
precede common tooling and remain valid inputs to its behavior tests; adopting the
shared checker does not relicense their context or replace attribution.

Registry audit can still report underlying braces/node-forge releases despite
reviewed backports. Run `pnpm audit --json` separately; specific regression cases
are not proof of an advisory-free graph. Node runtime fixes are separate from
registry dependencies. A fixed upstream dependency must be reviewed and pass this
owner's real type/build tests before removing a patch.

This tooling change does not update lesson evidence dates, perform source
observations, select hosting or authorize website publication (parent #4).
