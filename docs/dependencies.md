# Dependency mitigations

The npm audit database reports High advisories for the underlying braces 3.0.3
and node-forge 1.4.0 versions. This candidate carries reviewed source patches;
do not describe the dependency graph as advisory-free or dismiss those alerts.

`pnpm-workspace.yaml` is the explicit owner of patch paths and overrides. The
frozen lockfile binds patch hashes. Lifecycle scripts stay disabled during
installation; patch application must still be verified rather than inferred
from directory names or a successful install.

The mitigation tests resolve the exact patched versions named in the lockfile,
then verify normal behavior and rejection of deeply nested/cyclic brace inputs
and nested RSA AlgorithmIdentifier parameters. Stale patched cache directories
cannot satisfy this selection. An independent snapshot installation must pass
these tests, typecheck and static generation before publication.

Retain patches and regression tests until an upstream update is reviewed through
the repository's normal dependency PR flow. Test coverage establishes these
specific mitigation cases, not the absence of all dependency vulnerabilities.

Redistributed patch context retains upstream terms and change attribution; see
[third-party patch notices](../THIRD_PARTY_NOTICES.md). The recorded license and
patch hashes are checked by the normal test suite.
