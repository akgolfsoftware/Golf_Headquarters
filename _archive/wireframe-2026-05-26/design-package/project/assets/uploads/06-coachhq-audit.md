# AK Golf Platform — CoachHQ — Revisjonslogg (audit)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/audit`
- **Arketype:** G — Other (timeline + filter)
- **Tier-gating:** Admin (capability `audit.read`)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/audit.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `AuditEventDetailModal`, `ExportAuditModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Revisjonslogg er complience- og sikkerhetsverktøyet — viser **alle endringer** i systemet (hvem gjorde hva, når). Eksempler: ny spiller registrert, plan publisert, fakturafritak gitt, agent-konfig endret, rolle endret. Brukes når Anders må undersøke "hvem endret denne fakturaen?" eller når GDPR-forespørsel kommer ("vis alt om denne brukeren").

## Layout — UNIKT for denne skjermen

### Vertikal timeline

- Sentral 2px linje (border-color)
- Hver event som card til venstre/høyre alternerende (på desktop), eller alle venstre (mobil)
- Sticky dato-header per dag: `11. mai 2026` (sticky bar over events fra den dagen)

### Event-card

Hver card:
- **Event-ikon** (Lucide, 24px) i sirkel på timeline-linja:
  - Create — `Plus` (accent)
  - Update — `Pencil` (primary)
  - Delete — `Trash2` (destructive)
  - Auth — `KeyRound` (gold)
  - Agent — `Bot` (secondary)
- **Klokkeslett** (Geist Mono): `14:32:18`
- **Action-tekst** (1 linje): `Anders Kristiansen oppdaterte plan "Sommer-toppform" for Markus Roinaas Pedersen`
- **Diff-snippet** (collapsed by default, "Vis endring →" til highlight):
  ```
  - varighet: 6 uker
  + varighet: 8 uker
  ```
- **Meta-rad nederst:** IP-adresse · enhet (Mac · Chrome 134) · CBAC-rolle (Hovedcoach)

### Right-rail: filter-summary

- "Viser 47 events siste 7 dager"
- "Top aktører: Anders K (28), Sara P (12), Periodiserings-agent (7)"
- "Top entiteter: Plan (18), Spiller (12), Booking (10)"

## KPI-strip (4 kort)

1. Events siste 7d: 1 247
2. Aktive aktører: 8 (5 mennesker, 3 agenter)
3. Slett-events: 12 (alle med årsak loggført)
4. Sikkerhets-events: 3 (mislyktede login)

## Filter-bar — UNIKT

- Søk: "Søk aktør, entitet eller action"
- Chip: Action-type (Create / Update / Delete / Auth / Agent)
- Chip: Aktør (Anders / Sara / Tom / Agent X / API)
- Chip: Entitet (Spiller / Plan / Booking / Faktura / Konfig)
- Periode-velger: dropdown + datepicker
- Primary CTA: `Eksporter →` → `ExportAuditModal` (CSV / JSON for GDPR)

## Klikkbare elementer

| Element | States |
|---|---|
| Event-card | default, hover (ring), klikk → `AuditEventDetailModal` (full diff + raw JSON) |
| Vis endring-link | default, hover, expanded (diff synlig) |
| Aktør-link | default, hover, klikk → filter til kun den aktøren |
| Entitet-link | default, hover, klikk → åpne entiteten i sin egen view |
| Eksporter-CTA | default, hover, loading, success (download) |

## Empty / loading / error

- **Empty (ingen events i periode):** "Ingen events i denne perioden. Prøv et bredere tidsvindu."
- **Loading:** Skeleton timeline med pulserende cards
- **Error (tilgang nektet):** "Du har ikke tilgang til revisjonslogg. Be admin om `audit.read`-capability."

## Ønsket output fra Claude Design

1. Lyst tema, timeline med ~10 events fra 2 dager
2. Mørkt tema, samme
3. En event med diff-snippet expanded
4. Filter aktivt: Action=Delete (viser kun slett-events)
5. Mobil ≤640px — alle events venstre-justert, ikoner mindre, diff-snippet mer kompakt

## Ikke-mål

- Ikke designe `AuditEventDetailModal`, `ExportAuditModal` (egen batch)
- Ikke designe GDPR-data-export-flyten (egen sub-flow)
- Ikke designe alarms/alerts på audit-events

## Når du er ferdig

Lim design-link tilbake til Claude Code.
