# Gren-opprydding 2026-07-26

Gjenopprett en slettet gren med: `git branch <navn> <sha>` + `git push origin <navn>`
GitHub beholder også slettede grener i ca. 90 dager (kan gjenopprettes fra PR-siden).

## Merget i main (innholdet ligger i main)
```
agent/overnight-ai-conquest-2026-07-09                       0e413cc2
claude/agencyos-grupper-crud                                 c4a366bb
claude/b8a-anlegg-admin                                      b54d7a2b
claude/blissful-gates-763ac3                                 02bc3cb1
claude/bolge-b-agencyos                                      bfc31765
claude/bulk-sweep-verify                                     c64e42a8
claude/byggerunde-bcd-parallell                              98a5503b
claude/byggerunde-d2-d5                                      8e1fead6
claude/byggerunde-g-booking                                  8552d566
claude/claude-md-docs-j8g0sc                                 5bba9aad
claude/claude-md-docs-mseo3v                                 a9ca08f9
claude/cool-tereshkova-03d37f                                2695e9ea
claude/cranky-austin-831861                                  08384b77
claude/d5-og-skjermhale                                      e8ba317b
claude/datajobber-d5-d7                                      6cb2fdce
claude/decade-navnefjerning                                  16d93822
claude/focused-meitner-088053                                fed2a2d0
claude/frosty-ramanujan-d7dae5                               96b31e63
claude/gameplan-baneliste-og-modus                           769c4051
claude/gameplan-interaktiv-modus                             d3633299
claude/golfbox-trackman-onboarding-cleanup                   45d3d646
claude/kommando-route-cleanup                                a3dd1440
claude/lansering-sweep                                       3f59f134
claude/m2-workbench-mobil                                    fd9cbe5b
claude/master-skjermplan-verifisering-2026-07-14             86f2b7ef
claude/melding-vedlegg-composer                              8b357bcc
claude/mobil-m3                                              1c09bb0d
claude/periode-fordeling                                     ced99e73
claude/port-trackman-v2                                      c9c8a137
claude/portal-ny-melding-v2                                  9c2d26bb
claude/push-varsler                                          88064149
claude/recent-project-updates-fmcadf                         225a0b6e
claude/reskin-auth-screens                                   5b21922d
claude/rest-shotmap-moderering                               4f258bd5
claude/siste-kodejobber                                      7d89ed71
claude/skjermplan-fase0-reconciliation                       2be0661e
claude/supabase-london-cutover                               2a3ea32c
claude/uat-bolk5-verifisering                                c67845dc
claude/venner-b39                                            596eb7bd
claude/workbench-touch-dnd-migrering                         ea22c6ae
claude/workbench-v4-standard-pro                             0a1d0863
cursor/design-forbedring-plattform-5979                      d0aad65f
cursor/designsystem-verdensklasse-5979                       8cb9a93c
cursor/ferdigstill-ak-golf-hq-5979                           d76dac67
cursor/ks1-server-action-authz-5979                          53ba2aa4
cursor/kvalitetsplan-verdensklasse-5979                      0e944e6c
design/b-pass-playerhq-agencyos                              5e0e240b
feat/ds-fase-f-pr2                                           ab7786b0
feat/ds-fase-f-pr3                                           f69d9fc8
feature/gfgk-treningsplan                                    e3fbb983
feature/live-coach-session                                   26f456a9
feature/wang-aarsplan                                        41470dd3
fix/lansering-p0                                             3f57beee
fix/supabase-region-og-gotcha                                ceedb9d0
opprydding/fase5                                             46abfbbb
opprydding/gap-fyll                                          907d8aaa
opprydding/token-konvergens                                  0fcb2d2c
polish/finpuss                                               a2d54c6a
worktree-agent-a5cbde94e463c1007                             6b3ce922
worktree-agent-ac2134870b2a6a4c6                             0d10672e
worktree-agent-ae5bbc0aa785a4a3e                             d849d8b9
```

## Umerget, men verifisert uten effekt (merge ville ikke endret main)
```
claude/agentic-os-analysis-nuzd4s                            85186b7b
claude/avatar-feil-prod                                      dc33bf8f
claude/gfgk-junior-golf-site-8fxqw0                          4d418d3e
claude/revert-til-dcnx-database                              e2a0de05
claude/safe-area-topp-0719                                   e0904a10
claude/test-coverage-analysis-9s94fu                         ce2879c8
docs/workbench-gotcha-note                                   5efe4f19
fix/kjopsvei-og-betalingsdato                                e1f12c9f
```

## Runde 2 — 2026-07-27 (triage av «parallelle implementasjoner»-grenene)

Full triage-dokumentasjon: hver gren er diff-verifisert mot main (89a30166) fil for fil,
IKKE bare merge-tree. Beslutning: Anders 2026-07-27 («D3: gjør din anbefaling» + «slett
unødvendige grener»).

### Innholdet ligger i main (merget under annet PR-nummer)
```
claude/workbench-gjenta-okt                                  4fa45d4a   # = PR #101, siden utvidet (gjentaStegUker, WorkbenchV2.tsx:1874)
claude/workbench-kalender-0523                               5a5fc281   # = PR #96, nå fasit i src/lib/calendar/notion-grid.ts (låst 05–23)
chore/designregel-rydding-2026-07-25                         1c0db531   # = PR #141 (squash baba5f33); gren-tip ville RULLET TILBAKE Fase F-temaskript + CLAUDE.md (#158)
```

### Duplikat av funksjon som finnes i main i annen form
```
claude/d3-fokus-spillere                                     e54c16d8   # PR #69 CLOSED; main har alt via PR #66: FokusSpillere.tsx + CoachPinnedPlayer (schema.prisma:4734) + pin-actions. Grenen ville laget duplikat-tabell coach_fokus_pins. Unik rest (inaktivitets-signal 10+ dager + enhetstester) bevisst ikke tatt inn — kan gjenskapes uten grenen.
claude/agencyos-design-audit-mh9uem                          a2fe0f40   # v13-æra (13. juli). Temafiksene finnes i main via color-mix (core.tsx:709, kalender.tsx:34). Rest til bølge 14 lime-audit: accent-token lys modus (designbeslutning → Open Design), overlays.tsx:274–275 rgb(34,37,34), «Full = lime»-copy (AdminBookingerV2.tsx:333).
```
