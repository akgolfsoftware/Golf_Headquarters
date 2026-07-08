# Redesign-konsolidering — «redesign færre, tettere skjermer»

**Dato:** 2026-07-08 · **Status:** beslutnings-notat, venter på Anders' avklaringer.
Forankret i [`plans/redesign-plan.md`](redesign-plan.md), [`plans/skjermplan-master.md`](skjermplan-master.md)
og de låste beslutningene i CLAUDE.md.

## Hovedtall: 368 rader → ~50 kanoniske skjermer

MASTER-SKJERMPLAN har 368 skjermrader, hvorav **295 står på gammel look (–)**. Men det
tallet er kraftig oppblåst. Designprosjektets `ui_kits/`-mockup-er definerer den KANONISKE
skjermlista — det *tiltenkte* settet — og det er ~50 skjermer:

| Produkt | Kanoniske skjermer (ui_kits-mockup finnes) | Ca. |
|---|---|---|
| PlayerHQ | home · analyse · mal · sg-hub · live · runder · rundelogg · fysisk · baneguide · meg · uke | ~11 |
| AgencyOS | dashboard · workbench · stall · spillere · analyse · live · kalender · drills · plans · talent · trackman · turneringer · okonomi · org · godkjenninger · innboks · triage · caddie · fysisk · styring · agent-team · utviklingsplan · kart | ~23 |
| Marketing | forside · coaching · anlegg · booking · playerhq · priser · stats | 7 |
| Forelder | hjem · barn · faktura · meg · samtykke | 5 |
| Auth | login · signup · bankid · onboarding | 4 |
| **Sum** | | **~50** |

**Konklusjon:** vi skal redesigne ~50 skjermer, ikke 295. Resten er dubletter, låst
sammenslåing, eller legacy/interne ruter. Under er de fire konsoliderings-bøttene.

## Bøtte 1 — Engelsk/norsk rute-dubletter (SLETT engelsk variant)

Appen har begge språk som separate ruter for samme skjerm. Norsk er kanon (CLAUDE.md).
Slett/redirect engelsk → norsk:

| Behold (norsk) | Slett/redirect (dublett) |
|---|---|
| `/admin/analysere` | `/admin/analyse` · `/admin/analytics` |
| `/admin/kalender` | `/admin/calendar` |
| `/admin/anlegg` | `/admin/locations` · `/admin/facilities` |
| `/admin/godkjenninger` | `/admin/godkjenn-portal` · `/admin/approvals` |
| `/admin/kommunikasjon` (el. innboks) | `/admin/messages` |
| `/admin/lag-snitt` | `/admin/stats` (per-årgang) |
| `/portal/analysere` | `/portal/analyse` |
| `/portal/statistikk` | `/portal/stats` |

Grovt anslag: **~12–15 ruter forsvinner** her alene, uten tap av funksjon.

## Bøtte 2 — Låst «Analyse samlet» (fold inn i Analysere-faner)

CLAUDE.md (låst): «Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate
moduler». Min golf (`/portal/analysere`, ✓) har allerede fane-strukturen. Da skal disse
IKKE redesignes som egne skjermer — de blir faner:

- `/portal/mal/*` (**26 rader** — SG-hub, runder, trackman, putting under «mål»)
- `/portal/statistikk/*` · `/portal/trackman` · `/portal/stats`

Grovt: **~30 rader** kollapser til fanene i Analysere. SG-Hub (der R1 «stoppet») hører
HIT — ikke en egen redesign.

## Bøtte 3 — Låst «Planlegge → Workbench» (ett trykkpunkt)

CLAUDE.md (låst): «All planlegging går gjennom Workbench. Planlegge er ett trykkpunkt.»
Disse blir Workbench, ikke egne skjermer:

- `/portal/tren/*` (**20 rader** — årsplan, teknisk-plan, fys-plan, tester, øvelser)
- `/portal/planlegge` · `/portal/ny-okt` · `/portal/onskeligokt`

Grovt: **~24 rader** kollapser til Workbench.

## Bøtte 4 — Legacy / interne / redirect-ruter (fjern eller ignorer)

- `/portal/(fullscreen)/*` (9) — live-økt-fullskjerm, egne stater, ikke egne redesign.
- `/portal/coach/*` (12) — mange er allerede løftet (bølge D3); resten kryssjekkes.
- `/admin/talent/*` (11) · `/admin/spillere/*` (9) · `/admin/plans/*` (7) — detalj-/underruter av kanoniske huber, arver hub-designet.
- Diverse redirect-only + `/inviter` + interne test-flater.

## Netto redesign-omfang (anslag etter konsolidering)

| | Rader i dag (–) | Etter konsolidering |
|---|---|---|
| PlayerHQ | 132 | **~11 kanoniske** (+ detaljstater arver) |
| AgencyOS | ~140 | **~23 kanoniske** |
| Marketing | 19 | **~7** |
| Forelder | 11 | **~5** |
| Auth | 6 | **~4** |
| **Sum** | **~295** | **~50 skjermer å faktisk redesigne** |

## Beslutninger jeg trenger fra deg (før redesign-bygging)

1. **Bøtte 1 (slett engelsk-dubletter):** grønt lys til å slette/redirecte de ~12–15 engelske rutene? (Anbefaling: ja — norsk er allerede kanon.)
2. **Bøtte 2/3 er allerede LÅST** — jeg trenger bare bekreftelse på at SG-Hub + /portal/mal + /portal/tren skal *foldes*, ikke redesignes separat. (Anbefaling: følg de låste beslutningene.)
3. **Rekkefølge:** når settet er ~50 — start redesign på PlayerHQ-kanon (analyse/mal-fanene) eller AgencyOS-kanon (workbench/stall)? (Anbefaling: fullfør PlayerHQ-fanene først — nærmest ferdig.)

Når du har svart, oppdaterer jeg MASTER-SKJERMPLAN (marker dubletter/foldinger), og
redesign-planen får en presis ~50-skjermers liste i stedet for 295.
