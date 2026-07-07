# worker/ — the mago side of CVBoost

These files run on the audit **worker** (rbm21, company `co-cvboost`), not in the web app.

| file | deploys to |
|---|---|
| `cvboost-li-fetch` | `/usr/local/bin/cvboost-li-fetch` — logged-out LinkedIn public-profile crawl (name, headline, companies, education). Runs on rbm21's **residential** IP because LinkedIn 999-blocks dk1's datacenter IP. |
| `auditor.md` | `co-cvboost/.mago/agents/auditor.md` — the audit agent (claude/sonnet, implements). Fetches via `cvboost-li-fetch`, scores 6 criteria, publishes to hart, opens the PR. |
| `SKILL.md` | `co-cvboost/.mago/skills/cvboost-audit/SKILL.md` — rubric, report template, delivery contract (the `PR:` / `Artifact:` issue-comment format the status page parses). |

The worker runs `mago serve --relay --supervise -C /root/co-cvboost` (see the deploy notes
in the top-level README). A `reviewer` agent (also in `.mago/agents/`) squash-merges PRs.

Flow: issue (label `cvboost` + `project:cvboost-audits`) → webhook → relay → auditor tick →
`cvboost-li-fetch <url>` (+ any pasted text) → `audits/<n>.md` + hart artifact → PR →
reviewer merges → issue comment `PR:` / `Artifact:` → the app's status page shows all three.
