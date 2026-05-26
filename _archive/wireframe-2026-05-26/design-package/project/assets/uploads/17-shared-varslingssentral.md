# AK Golf Platform — Shared — Varslingssentral

## Identitet

- **Produkt:** Shared (CoachHQ + PlayerHQ)
- **URL:** `/varsler` (begge produkter)
- **Arketype:** G — Other (kronologisk varsel-feed)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/varslingssentral.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NotificationDetailModal`, `MarkAllReadConfirm`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Varslingssentralen er den fulle varsel-historikken — alt som har trigget en in-app/e-post/push siste 30 dager. Topbar-notifikasjons-icon viser kun de 5 siste; her ser du alle. Brukes for å gjenfinne en glemt varsel eller dykke ned i hva som har skjedd. Samme struktur for både coach og spiller, men ulikt innhold.

## Layout — UNIKT for denne skjermen

### Header

- Hero italic: *"Alt som har skjedd."*
- Subtitle: `47 varsler siste 30 dager · 3 uleste`
- Aksjons-rad: `Marker alle som lest`, `Innstillinger →` (til notif-prefs)

### Filter-bar

- Chip: Status (Alle / Uleste / Lest)
- Chip: Type (System / Plan / Booking / Agent / Beskjed / Fakturering)
- Chip: Periode (I dag / 7d / 30d / Alle)
- Søk: "Søk varsel"

### Vertikal feed

Kronologisk, gruppert per dag med sticky dato-header.

Hvert varsel som rad:
- **Type-ikon** venstre (Lucide, 20px) i sirkel:
  - System — `Settings` (muted)
  - Plan — `ClipboardList` (primary)
  - Booking — `Calendar` (gold)
  - Agent — `Bot` (secondary)
  - Beskjed — `MessageCircle` (accent)
  - Fakturering — `Receipt` (destructive hvis forfalt)
- **Tittel** (Geist 14px medium): "Periodiserings-agent har en ny anbefaling for Markus R"
- **Body-snippet** (1 linje, muted): "Foreslår pauseuke før Sørlandsåpent..."
- **Tidsstempel** (Mono, høyre): `14:32` (i dag) eller `12. mai 09:18`
- **Ulest-prikk** (accent) til høyre hvis ulest
- **Aksjon** (vises på hover): `Åpne →` (knapp), eller direkte til relevant view

### Right-rail: oppsummering

- "3 uleste"
- "Mest aktive type: Agent (12)"
- "Snitt-respons: 1t 24m"

## KPI-strip — IKKE for denne (rolig listevisning)

## Klikkbare elementer

| Element | States |
|---|---|
| Varsel-rad | default, hover (bg-shift), ulest (bold + accent-bg/5), klikk → relevant view eller `NotificationDetailModal` |
| Marker alle som lest | default, hover, klikk → `MarkAllReadConfirm` |
| Filter-chip | default, hover, selected (count-badge) |
| Innstillinger-link | default, hover, klikk → `/meg/notif` (PlayerHQ) eller `/admin/settings/notif` (CoachHQ) |
| Type-ikon | tooltip "Agent-varsel" |

## Empty / loading / error

- **Empty (ingen varsler):** "Ingen varsler ennå. Når noe skjer, vises det her."
- **Empty (alle lest):** "Alt lest. Bra jobba!" (sentrert, accent CheckCircle)
- **Empty (filter-treff null):** "Ingen treff for filteret. Tilbakestill →"
- **Loading:** 8 skeleton-rader
- **Mark-all-read-error:** Inline rød tekst + retry

## Ønsket output fra Claude Design

1. Lyst tema, full feed med 3 uleste + 12 lest
2. Mørkt tema, samme
3. Hover på en ulest rad
4. Empty (alle lest)
5. CoachHQ-variant (med to-lags sidebar) og PlayerHQ-variant (med tab-bar mobil)
6. Mobil ≤640px — full bredde feed, filter blir bottom-sheet, right-rail nedi

## Ikke-mål

- Ikke designe `NotificationDetailModal`, `MarkAllReadConfirm` (egen batch)
- Ikke designe notif-preferences (det er settings, batch 6)
- Ikke designe push-tillatelse-onboarding

## Når du er ferdig

Lim design-link tilbake til Claude Code.
