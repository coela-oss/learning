# Manual official-source observation policy

Owner: coela-oss/learning maintainers, through the repository's ordinary PR
review. This policy closes the operational definition in #5; public website
hosting remains #4. The collector reuses existing source allowlists, DNS/IP
validation, TLS hostname verification, streaming hashes and review-event logic.
It is not a new monitoring service, content authority or execution grant.

## Execution and limits

Use the existing Node 24.22.1+ runtime and `pnpm observe` from a clean accepted
source checkout on the local operator workstation. No daemon, cron, scheduled
Action, background browser, model, provider credential or notification is
installed. Normal cadence is manual weekly review, plus an explicitly initiated
review after a relevant source/advisory change. There is no automatic schedule
or automatic retry of a failed overall run.

The parent admits one operation per checkout, gives the child a 128 MiB V8 old
space limit, clears inherited environment credentials and terminates it after
120 seconds, including unresolved DNS work. This is a heap/elapsed bound, not a
claim of an OS RSS sandbox or same-user isolation. Streams are hashed without
retaining response bodies. The existing default policy allows at most 16 unique
sources, two concurrent requests, five seconds per source attempt, 512 KiB per
body, one transient retry and two explicitly allowlisted redirects. At most 96
HTTP hops are possible; the current catalog selects ten sources. HTTP client
refusals (including 403/404) are not retried; 5xx/network failures may consume the
single transient retry. No authentication escalation, cookies or proxy tokens
are used. Unknown redirect destinations are refused rather than added to trust.

## Local evidence and retention

`pnpm observe [REVIEWED_BASELINE.json]` reserves a new UUID directory below
`.local/observations/`, then writes `report.json`, `review.md`, `snapshot.json`
and a final `receipt.json`. The receipt binds source commit, times, policy,
request URLs/statuses, baseline digest and exact output hashes. Bodies, cookies,
credentials and raw network exceptions are not saved. A receipt is sealed only
after all output writes complete; termination can leave a held/unsealed run.

Storage admits at most 16 run directories and 2 MiB aggregate state, at most
128 KiB per run. Existing legacy/unknown files count against the budget. The
collector refuses before network access if the quota, directory privacy or
physical-file checks fail. It never silently truncates history or recursively
removes unknown state. Keep directories 0700 and files 0600; an unexpected
existing permission or link is refused instead of automatically changed.

Use `pnpm observe:status` to inspect sealed/held run IDs and capacity. Retain
unreviewed or failed evidence until disposition; normally remove obsolete raw
runs after 14 days using `pnpm observe:remove RUN_ID`. Removal addresses exactly
one intact, sealed generated run and refuses altered, incomplete, linked or
extra files. Copy a baseline selected for continued comparison into a separately
retained private operator file before removing its original run. Baselines are
not automatically selected or rotated. The operator retains the current
reviewed baseline and, if useful, its predecessor until an explicit replacement.
If capacity is exhausted, review/removal is required; collection stops.

A stale `active.lock` after parent/process termination blocks collection and
cleanup. Inspect the recorded PID and private run state, verify no owner process
remains, and remove only that stale lock. There is no unsafe automatic PID kill,
lock takeover or replay. Ordinary completion removes only its own lock identity.

## Editorial review and notifications

Observation is not editorial approval. Check each HTTP outcome, supported
redirect, byte/hash change and affected English/Japanese lesson. A blocked URL,
403/404, timeout, unsupported response or missing source remains an explicit
review item, with no fabricated digest or healthy baseline. Partial evidence is
retained; do not promote it to a complete successful baseline. Compare original
sources before changing any applicability, verifiedAt, reviewDue, reviewer,
recommendation or translation. Such edits require a separately reviewed content
PR, with actual evidence/date; a successful build or unchanged body hash does
not renew verification.

Review IDs are deterministic from source ID, reason and observed digest, with
affected lesson IDs deduplicated across languages. Repeated identical outcomes
refer to the same review item, while changed content creates a new candidate.
The last reviewed baseline remains authoritative for comparison until the
operator explicitly chooses another snapshot. A future-dated baseline is refused.

Notifications are disabled. JSON/Markdown on the local workstation are the only
review destinations. No email, Teams, Slack, GitHub issue spam or third-party
message is sent. Enabling a schedule or a real recipient requires a concrete
new policy/authorization; no missing destination is treated as an active service.

## Acceptance boundary

Synthetic tests cover collection limits, failure/status retention, completion-time
freshness, duplicates, store quotas, locking, non-overwrite, scoped removal and
non-promotion. Owner CI also runs typecheck, lesson/exercise tests, static
production generation and exclusion scans. Heavy builds stay in hosted CI.
One bounded real collection is reviewed separately and recorded privately, with
only sanitized counts/statuses in the issue. It cannot declare a deployed site,
a healthy unavailable source, or changed lesson evidence. No observation or
private local report enters the public website/search bundle.
