# AK Golf Platform — CoachHQ — Oppfølgings-kø

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/oppfolgingsko`
- **Arketype:** G — Other (board / kanban-style triage)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/oppfolgingsko.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MarkDoneModal`, `SnoozeModal`, `EscalateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Oppfølgings-kø er Anders' "ting jeg må følge opp"-køen. Forskjellig fra Godkjenninger (agent-anbefalinger) — dette er ad-hoc-oppgaver: spillere som ikke har trent på 14 dager, foreldre som har spurt om noe, fakturaer som mangler oppfølging, leads som har spurt om coaching. Hver oppgave kan markeres ferdig, snoozes, eller eskaleres.

## Layout — UNIKT for denne skjermen

Board-style med 4 kolonner:

### Kolonner

1. **Nytt** (innkommende) — count-badge accent
2. **I gang** (jeg jobber med dette nå)
3. **Venter på svar** (ekstern blokkering)
4. **Snoozed** (collapsed by default)

### Oppgave-card

Hver oppgave:
- **Type-ikon** øverst-venstre (Lucide):
  - Inaktiv-spiller — `UserMinus`
  - Foreldre-spørsmål — `MessageCircle`
  - Faktura-oppfølging — `Receipt`
  - Lead — `Sparkles`
- **Tittel** (Geist 14px medium): `"Markus Roinaas P har ikke trent på 14 dager"`
- **Subtitle** (muted 12px): `"Sist økt: 27. april · Plan utløper 15. mai"`
- **Spiller/lead-avatar** (24px) nederst-venstre
- **Severity-pill** høyre-bunn: `Lav` (muted) / `Middels` (gold) / `Høy` (destructive) / `Kritisk` (destructive + pulse)
- **Aksjons-rad** (kun ved hover): `Markert ferdig`, `Snooze`, `Eskaler`

### Drag-drop

Cards kan dras mellom kolonner. Drop-zone: accent-border + bg ved hover.

### Right-rail: oppsummering

- "Snitt-tid å løse: 2 dager"
- "Mest forsinket: 'Lead Kari Olsen' — 8 dager"
- "Oppgaver siste 30d: 47 (43 løst, 3 eskalert, 1 droppet)"

## KPI-strip (4 kort, øverst)

1. Nytt: 7
2. I gang: 4
3. Venter: 3
4. Snoozed: 12 (kommer tilbake når snooze-tid er ute)

## Filter-bar — UNIKT

- Søk: "Søk oppgave eller spiller"
- Chip: Type (Inaktiv / Foreldre / Faktura / Lead / Annet)
- Chip: Severity (Lav / Middels / Høy / Kritisk)
- Chip: Tilordnet (Anders / Sara / Tom / Ingen)
- Sort: Severity / Eldste / Nyeste
- Primary CTA: `+ Ny oppgave` → quick-modal

## Klikkbare elementer

| Element | States |
|---|---|
| Oppgave-card | default, hover (lift + aksjons-rad synlig), drag-active (rotert 2deg), drop-target |
| Markert ferdig | default, hover, klikk → `MarkDoneModal` (med valgfri kommentar) |
| Snooze | default, hover, klikk → `SnoozeModal` (1d/3d/1uke/egendefinert) |
| Eskaler | default, hover, klikk → `EscalateModal` (velg mottaker + årsak) |
| Kolonne-header | default, count-badge, klikk → filter til kun den kolonnen |
| Spiller-avatar | default, hover, klikk → `/admin/elever/:id` |

## Empty / loading / error

- **Empty per kolonne:** "Ingen oppgaver i {kolonne}" + dempet ikon
- **Empty totalt:** "Tom kø — bra jobba!" med Lucide `CheckCircle2` accent
- **Loading:** 3 skeleton cards per kolonne
- **Drag-error:** Toast "Kunne ikke flytte oppgaven. Prøv igjen."

## Ønsket output fra Claude Design

1. Lyst tema, alle 4 kolonner med oppgaver
2. Mørkt tema, samme
3. Hover på en card med aksjons-rad synlig
4. Drag-state — kort midt i flytting fra "Nytt" → "I gang"
5. Empty totalt
6. Mobil ≤640px — 1 kolonne av gangen, swipe mellom (chip-bar øverst)

## Ikke-mål

- Ikke designe `MarkDoneModal`, `SnoozeModal`, `EscalateModal` (egen batch)
- Ikke designe oppgave-historikk-view
- Ikke designe automatiske oppgave-genererings-regler

## Når du er ferdig

Lim design-link tilbake til Claude Code.
