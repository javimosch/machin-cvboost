# machin-cvboost

**CVBoost** — free LinkedIn profile audits, performed **in public by an autonomous
[mago](https://mago.intrane.fr) agent**. A single static [machin](https://github.com/javimosch/machin)
(MFL) binary: SSR marketing site + JSON API + its own wasm client. No Node, no bundler.

Live at **cvboost.intrane.fr** (French market).

## How it works

```
Visitor pastes profile ──▶ POST /api/audit ──▶ GitHub issue (javimosch/cvboost-audits, public)
GitHub webhook ──▶ mago relay ──▶ worker co-cvboost (rbm21)
   auditor agent: score 6 criteria → audits/<n>.md → hart publish → PR + issue comment
Status page /audit/<n> polls issue/PR/artifact links — the workflow IS the product demo.
```

Free for users; every audit is a traceable issue → PR → HTML artifact. It's a live
showcase of the mago workflow (that's the marketing strategy).

## Build & run

Needs `machin` (v0.57.0+) and `zig` (the C→wasm compiler).

```sh
./build.sh                     # → ./app.wasm and ./cvboost
./cvboost                      # serves http://localhost:48120/
./cvboost --port 8080 --base-url https://cvboost.intrane.fr
```

## Layout

```
src/models.src   # shared schema: the 6 audit criteria (server + wasm client)
src/server.src   # SSR pages (/, /audit), SEO (robots/sitemap/OG), audit API
src/styles.src   # the page CSS
src/client.src   # wasm client (M2: live status page polling)
src/machweb.src  src/flags.src  src/reactive.src   # vendored frameworks
web/host.js      # generic JS host, embedded at build time
```

Started from [boilerplate-cli-ui-machin-isomorphic](https://github.com/javimosch/boilerplate-cli-ui-machin-isomorphic).

## License

MIT

## Deploy (production)

- **App**: dk1 `/home/dk1/cvboost-app/` (static binary + app.wasm), exposed at
  **cvboost.intrane.fr** via hotify-cli (Traefik + Cloudflare + Let's Encrypt).
  `CVBOOST_GH_TOKEN` in the hotify app command. Build: `machin build server.mfl --static -o cvboost-static`.
- **Worker**: rbm21 `/root/co-cvboost` (`bash run.sh` → `mago serve --relay --supervise`),
  agents `auditor` (sonnet, implements) + `reviewer` (sonnet, reviews), skill `cvboost-audit`.
- **Audits repo**: [javimosch/cvboost-audits](https://github.com/javimosch/cvboost-audits) (public).
- **Artifacts**: hart.intrane.fr, owner `cvboost`, artifact `audit-<issue>`.
