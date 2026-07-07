---
name: cvboost-audit
description: The CVBoost audit contract — how to fetch the profile, the rubric for the 6 criteria, report structure, hart publishing, and the exact issue-comment format the status page parses.
---
## Input shape (URL-based)

The issue body carries a **Profil:** URL and, optionally, a **## Profil complet** block
(full profile text the user pasted).

**First step, always:** fetch the public data with `cvboost-li-fetch "<url>"`. It emits
name, full headline, current company, education, location, and the public summary — for
any profile, from this worker's residential IP (the web app can't fetch it: LinkedIn
999-blocks the datacenter IP, so fetching is the worker's job).

- If a **## Profil complet** block is present, audit it as the primary source; the
  `cvboost-li-fetch` output is a cross-check.
- If only the public fetch is available, audit what you can (Titre fully; Cohérence
  partially, from headline + companies + schools). For criteria you cannot judge from
  public data (À propos, Expériences detail, Compétences, Réseau), assign a neutral 50
  and state in that criterion: "Non évaluable depuis le profil public — pour un score
  précis, relancez en collant le texte complet (Ctrl+A / Ctrl+C sur votre profil)."
  Never invent content that is not in the input.
- Note near the top of the report whether it was based on the public profile only or on
  the full pasted text.

## The rubric (score each /100, justify by quoting the profile)

- **Titre** — searchable keywords + impact. Penalize: bare job title, buzzword soup, no value proposition.
- **À propos** — a pitch that convinces in 3-5 lines. Penalize: third-person, generic passion statements, no numbers, walls of text.
- **Expériences** — quantified, result-oriented. Penalize: responsibility lists with no outcomes, no metrics, unexplained gaps.
- **Compétences** — visible, aligned with the target role. Penalize: 50 unfocused skills, missing the profile's obvious core stack.
- **Réseau** — activity that reflects expertise. If the input gives no signal, say so and score 50 (neutral) rather than inventing.
- **Cohérence** — one credible narrative from title to last experience. Penalize contradictions and positioning drift.

Global score = weighted: Titre 20%, À propos 20%, Expériences 25%, Compétences 15%, Réseau 5%, Cohérence 15%. Round to integer.

## Report structure (audits/<n>.md, in French)

# Audit LinkedIn — #<n>
_(one line: audit basé sur le profil public / sur le texte complet fourni)_
**Score global : NN/100**
| Critère | Score | — table of 6
## Diagnostic (exactly 3 sentences)
## Analyse par critère (one ### per criterion: justification + 1 quick win)
## Plan d'action (5-8 items, ordered by impact, each starting with a verb)
Footer: généré par un agent autonome mago · cvboost.intrane.fr

## HTML report for hart

Self-contained: ONE file, all CSS in a <style> tag, system-ui font, no external URLs
(fonts/images/scripts) — hart's CSP blocks them. Simple layout: score badge, 6
horizontal bars (width = score%), diagnosis, actions. French. Mobile-friendly
(max-width 720px, margin auto).

## Delivery contract (the status page parses this — format matters)

1. hart publish FIRST, then PR (body includes `Closes #<n>`), then the issue comment.
2. The issue comment must contain these two lines exactly (no bold, no backticks):
   PR: https://github.com/javimosch/cvboost-audits/pull/<pr>
   Artifact: https://hart.intrane.fr/a/cvboost/audit-<n>
3. Touch ONLY audits/<n>.md in the PR. The HTML file is NOT committed — it only goes to hart.
4. hart returns JSON; use the `url` field verbatim.
