# Design-revisjon — PlayerHQ + AgencyOS kjerneskjermer mot v13

**Dato:** 2026-07-06 · **Metode:** kildekode-lesing (ikke visuell screenshot-diff — skjermene krever
innlogging). Sjekket mot `public/design-handover/CLAUDE.md` (terminologi/tokens/tema), `PORTING.md`
(komponentfamilier) og `.claude/rules/design-produktbeslutninger.md` (bevisste unntak).
**Ingenting er fikset** — dette er kun revisjon, klar for prioritering.

## Kort oppsummert

- **Ingen terminologi-brudd funnet noe sted** (ingen "kortspill", "CoachHQ", "ELITE", "øving", emoji, eller sperre-språk som "brudd"/"overstyr"/"krever begrunnelse").
- Mønsteret er konsekvent: skjermer bygget **etter** 4. juli bruker `athletic/golfdata`-familien og matcher v13. Skjermer bygget **før** det bruker en eldre, men fortsatt token-ren, komponentfamilie (`agencyos/ui`, `AthleticCard`, gamle shadcn-tokens).
- **Rettet 2026-07-06 (ettersyn):** denne revisjonen tok selv feil på to punkter. (1) Meg-skjermens «300 kr/mnd» er IKKE en bug — 300 kr er den låste, riktige prisen (`docs/platform/BUSINESS-RULES.md`, Anders' beslutning 2026-06-22). Det er `public/design-handover/CLAUDE.md` sitt «299 kr»-tall som er feil og ikke skal kopieres inn i appen. (2) Stall sin SG→pyramide-databug var allerede FIKSET samme kveld (commit `a3be5389`, 2026-07-05 22:35) — se oppdatert Stall-rad under.
- **Én mistenkelig placeholder-verdi (fortsatt reell):** falsk "88 %"-tall i Stall — se Stall-rad.

## PlayerHQ

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| **Hjem** | DELVIS | Alt matcher v13 unntatt underkomponenten `WeekProgress` (seksjon «Plan denne uka»), som fortsatt bruker gamle `AthleticCard` i stedet for golfdata `Card`. Liten jobb. |
| **Analyse** | ✅ MATCHER | Ingen handling. |
| **Gjennomføre** | ✅ MATCHER | Ingen handling. |
| **Planlegge** (→ Workbench) | ⬜ TRENGER FULL RE-DESIGN | Hele `WorkbenchHybrid`-stacken (7 hub-faner, uke-tidsgrid m.m.) er bygget på en egen, eldre komponentarkitektur — ikke golfdata i det hele tatt. Størst jobb av alle 13 skjermer. |
| **Meg** | 🔧 TRENGER TOKEN-/KOMPONENTBYTTE | Struktur er god. «300 kr/mnd» er RIKTIG og skal IKKE endres (se rettelse øverst). Gjenstår: (1) lime brukt som ikon-bakgrunnstint på lys flate (grensetilfelle mot «aldri lime på lys»-regelen, bør sjekkes visuelt); (2) gamle tokens/inline `var(--color-primary)` i stedet for golfdata-scope. |

## AgencyOS

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| **Cockpit** (`/admin/agencyos`) | DELVIS | Token-disiplin er god (ingen rå hex), men bruker et eget, skreddersydd komponentsett (KpiStrip/TimelineCard/QueueCard) — ikke golfdata-familien. Kan være bevisst (annet formål enn spillerkort), men bør bekreftes. |
| **Stall** (`/admin/stall`) | 🔧 TRENGER TOKEN-/KOMPONENTBYTTE | **SG→pyramide-databuggen er FIKSET** (commit `a3be5389`, 2026-07-05 — verifisert i `src/lib/admin/stallen-data.ts:308-364`: ekte per-akse treningsminutter, ingen SG-avledet fake, ingen hardkodet 88 %). Gjenstår: **hardkodede `rgba()`-farger** i stedet for tokens, og bytte til `SpillerTilstandKort` i stedet for egendefinerte kort. |
| **Innboks** | 🔧 TRENGER TOKEN-/KOMPONENTBYTTE | Bruker `AdminHero` (stor marketing-stil hero) i stedet for samme `AgPageHead`-idiom som Cockpit/Stall/Godkjenninger — inkonsistent med resten av AgencyOS. `admin-hero.tsx` hardkoder også fontnavn som streng i stedet for å bruke `font-display`-tokenet. |
| **Godkjenninger** | ✅ MATCHER | Ren tokens og terminologi. |
| **Spiller-detalj** | DELVIS | Eldre `agencyos/ui`-komponenter, men tokens/terminologi er rene. |
| **Kalender** | DELVIS | Samme mønster. |
| **Drillbank** | DELVIS | Samme mønster. |
| **Plans** | DELVIS | Samme mønster. Kanban-uten-drag-and-drop er et dokumentert, bevisst unntak — ikke et avvik. |

## Anbefalt prioritering (min vurdering, ikke bestemt)

1. **Stall — rgba→token-bytte** — SG→pyramide-databuggen og det falske 88%-tallet er allerede fikset (commit `a3be5389`); gjenstår kun hardkodet `rgba()` → tokens + bytte til `SpillerTilstandKort`.
2. **Innboks** — bytt `AdminHero` til samme `AgPageHead`-idiom som resten av AgencyOS, fjern hardkodet fontstreng.
3. **Planlegge/Workbench** — den store jobben. Bør vente til Bølge 2 (datamodell) er på plass siden Workbench uansett bygges om da.
4. Resten (Cockpit, Godkjenninger, Spiller-detalj, Kalender, Drillbank, Plans, Hjem/WeekProgress) — token-rene, fungerer, kan vente til en generell komponent-migrering til golfdata-familien.

*(Meg-skjermens pris var aldri en reell bug — se rettelse øverst i dokumentet — og er derfor fjernet fra prioriteringslisten.)*

## Metodenotat

Tre bakgrunnsagenter ble først spawnet for denne revisjonen, men gjorde ikke jobben (de trodde feilaktig de skulle vente på andre bakgrunnsagenter). Etter et korrigerende dytt leverte to av dem faktiske funn; resten (Cockpit, Stall, Innboks, Godkjenninger, Hjem, Meg) ble sjekket direkte av hovedøkten. Alle funn over er verifisert mot faktisk kildekode med filsti-bevis, ikke antatt.
