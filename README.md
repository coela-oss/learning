# Coela Learning

[日本語](README.ja.md)

A learning site for reusable information and communication technology knowledge.
Explore foundations, software, UI, data, networks, security, cloud, AI and
engineering practice. English and Japanese have separate lesson pages.

Lessons explain objectives, prerequisites, concepts, synthetic examples,
verification, limitations and public sources. Current practice, research and
historical patterns are distinct. Evidence dates describe actual review, not a
successful build or an automatically renewed recommendation.

## Development

Use the existing Node 24 and pnpm toolchain:

```sh
pnpm install --offline --frozen-lockfile --ignore-scripts
pnpm test
pnpm typecheck
pnpm generate
pnpm dev
```

Offline installation requires an existing dependency cache. Development binds to
loopback. Static output is `.output/public`; no deployment is configured.
The source collector is manual: `pnpm observe` makes real public-source requests
and is separate from the synthetic test suite. It never approves content changes.

## Publication status

Source publication and site hosting are separate. Only the selected generic educational source belongs in this repository; hosting and observation schedules require separate owner acceptance.
Original educational content uses [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Application code and reusable code snippets use MIT; see [license scope](LICENSE).
Existing third-party notices in dependency patches must be retained.
See [coding and publication rules](docs/publication-rules.md).
Known dependency advisories and patch verification are described in
[dependency mitigations](docs/dependencies.md).
No preservation notes, private provenance, production configuration or inherited
private Git history are part of this candidate.

[Third-party patch notices](THIRD_PARTY_NOTICES.md) retain exact upstream licenses,
local modification descriptions and integrity-bound provenance.

## Manual source review

[Observation policy and operator commands](docs/source-observation-policy.md)
define runtime, elapsed/heap/request/storage limits, evidence retention,
explicit cleanup, editorial ownership and disabled notifications. `pnpm observe`
keeps per-run sealed evidence locally; `pnpm observe:status` reports capacity.
Source collection does not approve a lesson or select a new baseline.
