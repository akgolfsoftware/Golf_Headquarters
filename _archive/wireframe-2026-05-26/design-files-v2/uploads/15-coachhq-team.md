# AK Golf Platform — CoachHQ — Team (utvidet)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/team`
- **Arketype:** F — Settings + profile (team-management — mer enn liste)
- **Tier-gating:** Pro+ (Free får 1 coach + Anders, Pro får 5, Elite ubegrenset)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/team.html`
- **Audit:** `wireframe/audit/coachhq-team.md`
- **Tilhørende modaler:** `InviteCoachModal`, `EditCoachRoleModal`, `RevokeCoachModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Team er hvor Anders styrer alle coach-assistenter i AK Golf Academy. I batch-2 var dette en enkel liste — her utvides det med:
- Workload-fordeling (hvem coacher hvor mange spillere)
- Kapabilitets-overstyring per coach
- Vakt-rotasjon (hvem er på vakt denne uka — for varsler/akutt-bookinger)
- Performance-stats (siste 30d)

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. To-fane-toggle: **Team-medlemmer** | **Vakt-rotasjon**.

### Fane: Team-medlemmer

#### KPI-strip (4 kort)

1. Team-størrelse: 4 av 5 (Pro)
2. Snitt-spillere per coach: 9,5
3. Coaches på vakt nå: 1 (Sara)
4. Pending invitasjoner: 1

#### Tabell (utvidet fra batch-2)

| Coach | Rolle | Spillere | Workload | Tilgjengelig | Vakt | Aksjoner |
|---|---|---|---|---|---|---|
| Anders Kristiansen (du) | Hovedcoach | 22 | 88% | Mandag–Fredag | Ja (alltid) | "Du" |
| Sara Larsen | Coach | 12 | 60% | Mandag–Lørdag | Mandag denne uka | "..." |
| Tom Nilsen | Coach | 4 | 20% | Tirsdag, Torsdag | Nei | "..." |
| (Pending) | Coach | – | – | – | – | "Send invitasjon på nytt" |

Kolonne `Workload` har visuell bar (0–100%) med fargekoder:
- 0–40% = muted
- 40–80% = accent
- 80–100% = warning (overarbeidet)

Kolonne `Vakt` viser "Mandag–Fredag" eller spesifikk dag.

#### Side-panel: Coach-detalj (klikk på rad)

Slide-in fra høyre med:
- Avatar + navn + rolle
- Spillere-liste (mini, 5 første + "…12 til")
- Capabilities (override-info)
- Stats siste 30d:
  - Sesjoner gjennomført: 28
  - Snitt rating fra spillere: 4,7/5
  - Plan-godkjenninger respondert <24t: 92%
- Knapper: "Endre rolle →" / "Endre kapabiliteter →" / "Send melding →" / "Suspender" (destructive)

### Fane: Vakt-rotasjon

Uke-kalender (samme grid som Bookinger), men hver dag har en "vakt-pill" øverst som viser hvem som har vakt:

- Mandag: Sara
- Tirsdag: Tom
- Onsdag: Anders
- Torsdag: Tom
- Fredag: Sara
- Lørdag: Anders
- Søndag: – (ingen vakt — auto-svar "Vi er tilbake mandag")

Drag-drop: Anders kan dra coach-pill mellom dager for å bytte vakt.

CTA: `+ Recurring vakt-regel` (f.eks. "Sara har vakt hver mandag i 4 uker")

### Farezone

- "Eksporter team-data (CSV)" — secondary
- "Slett team-medlem (GDPR)" — destructive (krever confirm + sletter all coaching-historikk på 90 dager)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Coach-rad | default, hover, klikk → side-panel slide-in |
| Workload-bar | hover viser tooltip "12 spillere, 18 timer/uke booket" |
| Vakt-pill (i kalender) | default, drag-active (rotert 2deg), drop-target |
| "..."-meny | [Endre rolle] [Endre vakt] [Suspender (destructive)] |
| Pending-rad | annerledes bg, "Send på nytt"-knapp inline |
| Suspender | default, hover destructive, klikk → `RevokeCoachModal` |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Tier-gate Free:** Banner "Pro: Inviter flere coaches → Oppgrader" når man prøver å invitere #2
- **Empty (kun Anders):** Hero-tekst "Du jobber alene foreløpig. Inviter en assistent →"
- **Overarbeid (>80%):** Warning på coach-rad: "Sara har 88% workload — vurder omfordeling"

## Ønsket output fra Claude Design

1. Lyst tema, fane Team-medlemmer (4 coaches synlig + 1 pending)
2. Mørkt tema, fane Vakt-rotasjon (uke-kalender med vakter)
3. Side-panel åpent på Sara (full coach-detalj)
4. Workload >80% warning-state
5. Tier-gate-banner for Free
6. Mobil ≤640px — tabell blir kort-stack, vakt-rotasjon blir 1-dag-view

## Ikke-mål

- Ikke designe `InviteCoachModal`, `EditCoachRoleModal`, `RevokeCoachModal` (egen batch)
- Ikke designe coach-onboarding-flyt (egen wizard, batch-4)
- Ikke designe coach-rating-system (egen prosjekt)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
