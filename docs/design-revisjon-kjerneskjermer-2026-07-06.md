# Design-revisjon — PlayerHQ + AgencyOS kjerneskjermer mot v13

**Dato:** 2026-07-06 · **Metode:** kildekode-lesing (ikke visuell screenshot-diff — skjermene krever
innlogging). Sjekket mot `public/design-handover/CLAUDE.md` (terminologi/tokens/tema), `PORTING.md`
(komponentfamilier) og `.claude/rules/design-produktbeslutninger.md` (bevisste unntak).
**Ingenting er fikset** — dette er kun revisjon, klar for prioritering.

## Kort oppsummert

- **Ingen terminologi-brudd funnet noe sted** (ingen "kortspill", "CoachHQ", "ELITE", "øving", emoji, eller sperre-språk som "brudd"/"overstyr"/"krever begrunnelse").
- Mønsteret er konsekvent: skjermer bygget **etter** 4. juli bruker `athletic/golfdata`-familien og matcher v13. Skjermer bygget **før** det bruker en eldre, men fortsatt token-ren, komponentfamilie (`agencyos/ui`, `AthleticCard`, gamle shadcn-tokens).
- **Én reell feil funnet:** feil pris i Meg-skjermen (se under).
- **Én mistenkelig placeholder-verdi:** falsk "88 %"-tall i Stall.

## PlayerHQ

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| **Hjem** | DELVIS | Alt matcher v13 unntatt underkomponenten `WeekProgress` (seksjon «Plan denne uka»), som fortsatt bruker gamle `AthleticCard` i stedet for golfdata `Card`. Liten jobb. |
| **Analyse** | ✅ MATCHER | Ingen handling. |
| **Gjennomføre** | ✅ MATCHER | Ingen handling. |
| **Planlegge** (→ Workbench) | ⬜ TRENGER FULL RE-DESIGN | Hele `WorkbenchHybrid`-stacken (7 hub-faner, uke-tidsgrid m.m.) er bygget på en egen, eldre komponentarkitektur — ikke golfdata i det hele tatt. Størst jobb av alle 13 skjermer. |
| **Meg** | 🔧 TRENGER TOKEN-/KOMPONENTBYTTE | Struktur er god, men: (1) **feil pris «300 kr/mnd» — skal være 299 kr** (kanon-brudd, konkret bug); (2) lime brukt som ikon-bakgrunnstint på lys flate (grensetilfelle mot «aldri lime på lys»-regelen, bør sjekkes visuelt); (3) gamle tokens/inline `var(--color-primary)` i stedet for golfdata-scope. |

## AgencyOS

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| **Cockpit** (`/admin/agencyos`) | DELVIS | Token-disiplin er god (ingen rå hex), men bruker et eget, skreddersydd komponentsett (KpiStrip/TimelineCard/QueueCard) — ikke golfdata-familien. Kan være bevisst (annet formål enn spillerkort), men bør bekreftes. |
| **Stall** (`/admin/stall`) | 🔧 TRENGER TOKEN-/KOMPONENTBYTTE | **Hardkodede `rgba()`-farger** i stedet for tokens (brudd på designsystem-regel). **Falsk "88 %"-adherence-tall vises som ekte** — koden sier selv «ikke i schema ennå». Bruker ikke `SpillerTilstandKort`. Dette er skjermen som trengte re-komponering per forrige design-prompt. |
| **Innboks** | ✅ MATCHER | Ren tokens, golfdata er ikke relevant for meldings-UI. |
| **Godkjenninger** | ✅ MATCHER | Ren tokens og terminologi. |
| **Spiller-detalj** | DELVIS | Eldre `agencyos/ui`-komponenter, men tokens/terminologi er rene. |
| **Kalender** | DELVIS | Samme mønster. |
| **Drillbank** | DELVIS | Samme mønster. |
| **Plans** | DELVIS | Samme mønster. Kanban-uten-drag-and-drop er et dokumentert, bevisst unntak — ikke et avvik. |

## Anbefalt prioritering (min vurdering, ikke bestemt)

1. **Fiks prisbuggen i Meg** (300→299 kr) — 5 minutter, ekte feil, bør rettes uansett.
2. **Stall** — fjern falskt 88%-tall (vis ærlig tomtilstand i stedet) + bytt rgba-hardkoding til tokens. Liten/middels jobb, og dette er skjermen som uansett trengte re-design (fra forrige prompt til Claude Design).
3. **Planlegge/Workbench** — den store jobben. Bør vente til Bølge 2 (datamodell) er på plass siden Workbench uansett bygges om da.
4. Resten (Cockpit, Spiller-detalj, Kalender, Drillbank, Plans, Hjem/WeekProgress) — token-rene, fungerer, kan vente til en generell komponent-migrering til golfdata-familien.

## Metodenotat

Tre bakgrunnsagenter ble først spawnet for denne revisjonen, men gjorde ikke jobben (de trodde feilaktig de skulle vente på andre bakgrunnsagenter). Etter et korrigerende dytt leverte to av dem faktiske funn; resten (Cockpit, Stall, Innboks, Godkjenninger, Hjem, Meg) ble sjekket direkte av hovedøkten. Alle funn over er verifisert mot faktisk kildekode med filsti-bevis, ikke antatt.
