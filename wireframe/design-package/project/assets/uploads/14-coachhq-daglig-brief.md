# AK Golf Platform — CoachHQ — Daglig brief

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/daglig-brief`
- **Arketype:** G — Other (morgen-rapport, sekvensielt narrativ)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/daglig-brief.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `BriefSettingsModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Daglig brief er Anders' morgen-rapport. Genereres automatisk hver morgen kl 06:30 og sendes som e-post + tilgjengelig i CoachHQ. Forskjellig fra dashboard (live-data) — brief er en **statisk øyeblikks-rapport** for *i dag*: hvilke spillere har trent i går, hva agentene anbefaler, dagens timeplan, hva som krever oppmerksomhet.

## Layout — UNIKT for denne skjermen

### Header

- Hero italic: *"Onsdag 11. mai. 6 økter på timeplanen."*
- Subtitle: `Brief generert kl 06:32 · Oppdatert nå`
- Aksjons-rad: `Send som e-post →`, `Skriv ut`, `Settings →`

### Sekvensielt narrativ (vertikalt stablet)

#### Seksjon 1: I går
- "5 spillere trente i går (Markus R, Emma S, Lina H, Joachim T, Mads R)"
- "1 hoppet over: Lise S (skadet, fortsatt restitusjon)"
- Pyramide-summary for gårsdagen som donut: TEK 38% / SLAG 22% / FYS 18% / SPILL 12% / TURN 10%
- "Beste prestasjon: Markus R fikk +2,4 SG-tot på simulator-økt"

#### Seksjon 2: Dagens timeplan
- Timeline-bar (06:00–22:00) med dagens 6 events som blokker
- Liste under: Klokkeslett + spiller + type + lokasjon
- "Travleste vindu: 14:00–17:00 (3 økter samtidig — sjekk Studio 1+2 belegg)"

#### Seksjon 3: Agentenes anbefalinger
- 3 venter på godkjenning (lenke til `/admin/approvals`)
- "Periodiserings-agent foreslår pauseuke for Markus R før Sørlandsåpent"
- "Deload-agent: 2 spillere viser tegn på overbelastning"

#### Seksjon 4: Krever oppmerksomhet
- 2 oppgaver i oppfølgings-køen er nye
- 1 faktura forfalt (Joachim T, 2 400 kr)
- Snart utløper: 2 treningsplaner (Emma S 14. mai, Lina H 18. mai)

#### Seksjon 5: Ukens prioritet (hvis mandag)
- Periodiserings-status: "Uke 19/26 i sommer-makrosyklus. Fokus: tek-volum opp 12%"
- Dropdown for å se neste ukers fokus

#### Seksjon 6: Tall i går (KPI-strip)
- 4 kort: Inntekt i går / Antall økter / Belegg / Nye approvals

## Filter-bar — IKKE for denne (statisk rapport)

## Klikkbare elementer

| Element | States |
|---|---|
| Send som e-post | default, hover, loading, success (toast "Sendt til {epost}") |
| Skriv ut | default, hover, klikk → window.print() |
| Settings | default, hover, klikk → `BriefSettingsModal` |
| Approvals-link | default, hover, klikk → `/admin/approvals` |
| Faktura-link | default, hover, klikk → `/admin/finance/invoices/:id` |
| Donut-pyramide | hover (per-segment tooltip) |
| Timeline-event | hover (tooltip), klikk → `/admin/sessions/:id` |

## Empty / loading / error

- **Empty (helt ny coach):** "Brief genereres etter første dag med data. Tom brief: 'Velkommen — i morgen begynner det'"
- **Loading (genererer):** Skeleton-seksjoner med pulserende
- **Generation-error:** "Kunne ikke generere brief. Prøv igjen kl 07:00 →"

## Ønsket output fra Claude Design

1. Lyst tema, full brief
2. Mørkt tema, samme
3. Print-vennlig variant (lyst, ingen sidebar, mer luft)
4. Empty (ny coach uten data)
5. Mobil ≤640px — alle seksjoner stables 1-kolonne, ingen sticky

## Ikke-mål

- Ikke designe `BriefSettingsModal` (egen batch)
- Ikke designe e-post-template-rendering (egen design-fase)
- Ikke designe historikk-view over brief

## Når du er ferdig

Lim design-link tilbake til Claude Code.
