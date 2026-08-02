> **ARKIVERT 2026-07-17** (berget fra PR #40): forslaget om å fysisk kollapse
> `/portal/mal/*` og `/portal/tren/*` til faner ble ALDRI gjennomført — v2-kanon
> (det levende Claude Design-prosjektet) bygger dem som egne, kryss-lenkede
> rute-familier. Beholdt kun som historikk — ikke bygg mot dette.

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

## Bøtte 1 — Engelsk/norsk rute-dubletter → ALLEREDE GJORT (verifisert 8. juli)

Sjekket i kode: **alle de ekte dublettene er allerede `permanentRedirect`-stubber** fra
tidligere arbeid — ingen sletting trengs, og lenker/bokmerker bevares. Bekreftet:
`calendar→kalender`, `approvals→godkjenninger`, `messages→innboks`, `kommunikasjon→innboks`,
`finance→okonomi`, `caddie→agencyos/caddie`, `plans/templates→plan-templates`,
`portal/analyse→analysere`, `portal/stats→statistikk`, `tren/ovelser→drills`.

**Korreksjon:** `/admin/analyse` og `/admin/analysere` er IKKE dubletter — de er to ulike
skjermer (`analyse` = Stall-analyse, nav-lenket; `analysere` = Innsikt-hub m/ `/compliance`,
nådd fra søk + spiller-detalj). `/admin/lag-snitt` er kanon; `/admin/stats`/`analytics`/
`locations`/`facilities`/`godkjenn-portal` finnes ikke som sider. Så Bøtte 1 er en no-op i
kode. Eneste gjenstående: MASTER-SKJERMPLAN teller redirect-stubbene som «–»-skjermer — de
skal merkes «redirect», ikke «å redesigne» (bokføring, ikke kode).

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

## Status + beslutninger

- **Bøtte 1: FERDIG** (allerede redirects, verifisert 8. juli — Anders ga grønt lys, viste seg å være gjort).
- **Bøtte 2 (Analyse samlet): IKKE gjort** — `/portal/mal/*` = 24 ekte skjermer, 0 redirects. Disse skal foldes til Analysere-faner. Størst enkelt-gevinst.
- **Bøtte 3 (Planlegge→Workbench): DELVIS** — `/portal/tren/*` = 21 sider, 4 alt redirects, 17 igjen å folde til Workbench.

Beslutninger til deg (før byggingen av Bøtte 2/3):
1. **Bøtte 2/3 er LÅST** — bekreft at `/portal/mal` (24) + `/portal/tren` (17) skal *foldes* (SG-Hub hører til Analysere-fanene), ikke redesignes separat. (Anbefaling: følg de låste beslutningene.)
2. **Rekkefølge:** ta Bøtte 2 (mal→Analysere) eller Bøtte 3 (tren→Workbench) først? (Anbefaling: Bøtte 2 — størst kollaps, og Analysere-fanene finnes alt.)
3. **Bokføring:** skal jeg oppdatere MASTER-SKJERMPLAN nå (merke redirect-stubber + foldings-kandidater) så «å redesigne»-tallet blir ærlig (~50, ikke 295)?

Når du har svart, oppdaterer jeg MASTER-SKJERMPLAN (marker dubletter/foldinger), og
redesign-planen får en presis ~50-skjermers liste i stedet for 295.
