# Teknisk rute- og tilstandskart

Opprettet 12.09.2026. Dette er et funksjonskart, ikke et designkart. Ingen farger, fonter, tokens eller komponentutseende. D1 (rute → visuelt mønster) venter på D0.

Målt mot `src/app/**/page.tsx` 12.09.2026: **479 sideruter**. Tidligere inventar sa 480; differansen er én fil, ikke 479 ferdige skjermer. I tillegg: 103 `loading.tsx`, 93 `error.tsx`, 7 `not-found.tsx`, 26 `layout.tsx`. API-ruter er ikke telt her.

## Prefiks → produktflate

| Prefiks | Sideruter | Flate |
|---|---|---|
| `/portal` | 171 | PlayerHQ |
| `/admin` | 162 | AgencyOS |
| `/team-norway` | 5 | Team Norway |
| `/team-wang` | 4 | WANG |
| `/forelder` | 16 | Forelder |
| `/innsyn` | 11 | Delt innsyn |
| `/auth`, `/booking`, `/inviter`, `/onboard` | 22 | Inngang og booking |
| Marked/offentlig (`/`, `/stats`, `/coacher`, …) | 50 | Marked |
| Øvrig | 38 | GFGK, intern, demos, system |

## Hovedreiser → primæradresser

| Reise | Primæradresser | Teknisk bevis |
|---|---|---|
| J02 I dag → Plan → økt → Live → oppsummering | `/portal`, `/portal/planlegge`, `/portal/live/[sessionId]/*` | PR #845 |
| J04 coach behov → plan → oppfølging | `/admin/agencyos`, `/admin/spillere`, `/admin/workbench/[playerId]`, `/admin/queue` | PR #847 (åpen) |
| J05 test tildeles → føres → historikk | `/team-norway`, `/portal/tren/tester/team-norway` | PR #849 (åpen) |
| J06 WANG uke → økt → elev/IUP | `/team-wang`, `/team-wang/coach`, `/team-wang/coach/iup/[elevId]` | PR #850 (åpen) |
| J13 Caddie-forslag → valg | AgencyOS-kø, `godkjennOgUtforCaddieDraft` | PR #846 |
| Øvrige J01, J03, J07–J12, J14–J17 | Se [dekningsregisteret](masterplan-dekning-2026-09-12.md) | Ikke lukket |

## Tilstander som må kartlegges per rute (ikke gjort her)

Tom, lastende, feil, tomt søk, tilgangsavslag, nettfeil, konflikt, bekreftelse, ark/dialog, opplasting, betaling hos leverandør, varsling. `loading.tsx` og `error.tsx` finnes på mange ruter, men det er ikke bevis for at alle tilstander er dekket eller sett.

## Ikke påstått

- P0-DEKNING bestått.
- D1 bestått. Den krever valgt Claude-pakke.
- At 479 ruter er 479 unike design.
