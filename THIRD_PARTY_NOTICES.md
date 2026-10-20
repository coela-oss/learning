# Third-party patch notices

The original lesson/content licenses do not replace the licenses of dependency
code appearing in patch context or modified source. Keep this notice, the
upstream license files and the patch provenance together when redistributing
this source candidate or its patches.

## braces 3.0.3

Copyright (c) 2014-present, Jon Schlinkert. Licensed under MIT.
The complete upstream notice and terms are retained in
[LICENSES/braces-3.0.3.txt](LICENSES/braces-3.0.3.txt).
[Upstream source](https://github.com/micromatch/braces).

The local patch adds a bounded depth/cycle guard and integrates it into parse,
compile, expand and stringify. It contains context from upstream code.
The new guard and modifications are original MIT code; existing upstream rights
and attribution remain in force. This is a local mitigation, not an upstream
release or a declaration that all advisories are resolved.

## node-forge 1.4.0

Copyright (c) 2010, Digital Bazaar, Inc. All rights reserved.
The upstream package offers BSD-3-Clause or GPL-2.0. This candidate uses the
BSD-3-Clause option. The complete upstream license file, including its original
choice of terms, is retained unchanged in
[LICENSES/node-forge-1.4.0.txt](LICENSES/node-forge-1.4.0.txt).
[Upstream source](https://github.com/digitalbazaar/forge).

The local patch changes `lib/rsa.js` to reject nested AlgorithmIdentifier
parameters in RSA DigestInfo. It contains upstream context. Local modifications: Copyright 2026 Coela, provided under BSD-3-Clause for this
patch; original upstream notices remain.
The unchanged upstream license file does not apply GPL terms to original lesson
content or unrelated application code.

## Source verification

[third-party/patches.json](third-party/patches.json) records exact package
versions, official npm tarballs and integrity, license and patch SHA256 values,
modified upstream paths and original-file SHA256 values. A null original hash
marks a newly added file. License bytes were compared with integrity-verified
upstream npm archives, not inferred from package-directory names.

Retain other dependencies' own notices when distributing their code. This file
records these two local patches, not a complete dependency-license inventory or
permission to reuse unrelated third-party materials.
