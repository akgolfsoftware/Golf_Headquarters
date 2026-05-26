# AK Golf Platform — CoachHQ — Grupper (utvidet)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/groups`
- **Arketype:** F — Settings + profile (group-management)
- **Tier-gating:** Pro+ (Free får 2 grupper, Pro 10, Elite ubegrenset)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/groups.html`
- **Audit:** `wireframe/audit/coachhq-groups.md`
- **Tilhørende modaler:** `NewGroupModal`, `EditGroupModal`, `BulkAssignModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Grupper er **logiske samlinger av spillere** — WANG Toppidrett juniorlag, GFGK damelag, AK Academy elite, sommer-camp 2026. I batch-2 var dette en ren liste; her utvides det med:
- Drag-drop spiller-tilordning
- Gruppe-statistikk (snitt-HCP, snitt-progresjon, neste felles økt)
- Felles plan-generering (én plan kan tildeles hele gruppa)
- Sub-grupper (f.eks. "WANG Junior" har sub "WANG Junior A" og "WANG Junior B")

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Split-view: liste til venstre, gruppe-detalj til høyre.

### Venstre kolonne: Gruppe-tre

Hierarkisk liste (kollapsbart):
- WANG Toppidrett (24 spillere) [+]
  - WANG Junior A (12)
  - WANG Junior B (8)
  - WANG Senior (4)
- GFGK Junior Academy (18 spillere)
- AK Academy Elite (8 spillere)
- Sommer-camp 2026 (16 spillere — forfaller om 28d)
- Damelag GFGK (12 spillere)

Hver gruppe har:
- Ikon (gruppe-spesifikt eller default `Users`)
- Navn + spiller-tall
- Active-marker hvis valgt (accent venstre-border)

CTA bunn: `+ Ny gruppe` → `NewGroupModal`

### Høyre kolonne: Gruppe-detalj (når gruppe valgt)

#### Header
- Gruppe-navn (Geist 24px) + edit-pencil-ikon
- Beskrivelse (italic muted)
- KPI-pills: "12 spillere", "Snitt HCP: 8,4", "Aktiv plan: 'Sommer-toppform'"

#### Tabs
**Spillere | Planer | Økter | Innstillinger**

#### Tab Spillere
Tabell med spiller-rader (avatar + navn + HCP + status). Drag-drop:
- Dra spiller mellom grupper (i venstre tre)
- "+ Legg til spillere" → `BulkAssignModal` (multi-select fra full spillerliste)

#### Tab Planer
Liste over planer som er tildelt gruppa (kanban-mini eller liste).
- "+ Tildel plan til hele gruppa" — primary CTA

#### Tab Økter
Mini-kalender (uke-view) med gruppe-økter markert.

#### Tab Innstillinger
Skjema med:
- Navn (input)
- Beskrivelse (textarea)
- Coach-ansvarlig (dropdown — fra team)
- Sub-gruppe-håndtering (toggle: "Tillat sub-grupper")
- Foreldre-tilgang (toggle: "Foreldre kan se gruppe-økter")
- Slett gruppe (destructive farezone)

## KPI-strip (4 kort)

1. Totalt antall grupper: 5 + 3 sub
2. Største gruppe: WANG (24 spillere)
3. Spillere uten gruppe: 4
4. Forfallende grupper (sommer-camp etc.): 1

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Gruppe-rad (venstre) | default, hover, active (accent border + bg) |
| Gruppe-expand [+/–] | default, hover, klikk → toggle children |
| Spiller-rad (høyre) | default, hover, drag-active (rotert + skygge), klikk → spiller-detalj |
| Drop-target gruppe | default, drag-over (accent border + bg/30) |
| Tab-bar | default, hover, active (underline accent) |
| "+ Tildel plan" | default, hover, klikk → modal med plan-velger |
| Slett gruppe | default, hover destructive, klikk → confirm "Sletter gruppa, ikke spillerne" |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty (ingen grupper):** Hero "Lag din første gruppe →" med 3 forslag-templates: "Junior-gruppe / Senior-gruppe / Camp"
- **Empty (gruppe uten spillere):** "Ingen spillere ennå. Legg til →"
- **Tier-gate Free:** Banner "Pro: Lag flere enn 2 grupper → Oppgrader" når man prøver å lage #3
- **Drag-error:** Toast "Kan ikke flytte spiller til samme gruppe"

## Ønsket output fra Claude Design

1. Lyst tema, full skjerm med "WANG Junior A" valgt (Spillere-tab aktiv)
2. Mørkt tema, "AK Academy Elite" valgt
3. Drag-state: spiller midt i å bli flyttet fra én gruppe til annen
4. Tab Innstillinger åpen med farezone synlig
5. Empty-state (ny coach, ingen grupper)
6. Mobil ≤640px — gruppe-tre blir dropdown øverst, gruppe-detalj full bredde

## Ikke-mål

- Ikke designe `NewGroupModal`, `EditGroupModal`, `BulkAssignModal` (egen batch)
- Ikke designe gruppe-chat (egen Pro-feature)
- Ikke designe gruppe-leaderboard (separat fra mål-leaderboard)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
