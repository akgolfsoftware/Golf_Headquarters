# AK Golf Platform — CoachHQ — Talent-pipeline

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/talent`
- **Arketype:** C — Detail + tabs (5 tabs, kanban + drawer)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/talent.html`
- **Audit:** `wireframe/audit/coachhq-talent.md`
- **Tilhørende modaler:** `ManualPromoteModal`, `ChangeCategoryModal`, `ConfirmPromotionModal`, `TalentDetailDrawer`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Talent-pipeline er coachens strategiske view av hvilke spillere som skal opp/ned i kategori. Agentene anbefaler — coach godkjenner. 14 spillere fordelt på A1/A2/A3-pipeline-rader, drag-drop mellom rader. Hver spiller-card har "Detalj" (→ 360-profil) og "Endre" (→ ChangeCategoryModal).

## Header-blokk — UNIKT

- **H1:** `Talent-pipeline` (Geist 32px)
- **Subtittel:** *"Hvem er klar for løft, hvem trenger en pause."* (Instrument Serif italic editorial-fragment)
- **Stat-pills (4):** `14 i pipeline` · `3 promo-kandidater` · `2 risiko` · `Sist endret: 8. mai`
- **Primary CTA:** `+ Manuell endring` (åpner ManualPromoteModal)
- **Sekundær:** `Eksporter` (popover-meny: PDF / CSV)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Pipeline** (default) | Kanban med 3 rader (A1/A2/A3) |
| **Promosjoner** | Kommende anbefalte promosjoner |
| **Risiko** | Spillere som agent flagger som risiko (skade/burnout/inaktivitet) |
| **Talent-tester** | Test-resultater filtrert på pipeline-spillere |
| **Historikk** | Tidslinje siste 12 måneders endringer |

## Layout — Pipeline-tab (default)

3 horisontale kanban-rader:

### A1 — Elite (3 spillere + 2 promo-kandidater)
- Markus Roinås Pedersen (Elite, +2,4) — current
- Lina Hellesund (Elite, 4,1) — current
- Nora Vik (Elite, 5,8) — current
- **Anders Nedrum** (5,2) — promo-kandidat (accent strip)
- **Mia Berg** (4,9) — promo-kandidat

### A2 — Pro (5 spillere + 1 risiko)
- Henrik Nilsen (Pro, 8,7)
- Emma Solberg (Pro, 8,7)
- Mads Rønning (Pro, 9,4)
- **Joachim Tangen** (Pro, 14,2) — risiko-warning (skadet 18d)
- ... +1 til (klikk for å vise)

### A3 — Free (4 spillere)
- Anna Karlsen (Free, 16,8)
- Lise Sandberg (Free, 19,5)
- ... +2 til

## Talent-card design

- Avatar (32px) + navn (Geist 14px)
- HCP (JetBrains Mono høyre)
- Mini-pyramide (5 prikker — størrelse = volum siste 4u)
- 2 knapper: `Detalj` (link til 360) · `Endre` (åpner ChangeCategoryModal)
- Drag-handle på venstre kant (hover viser ⋮⋮)
- States: default, hover (lift), promo (accent strip topp), risiko (destructive strip)

## Drag-drop

- Kort kan dras mellom rader
- Drop-zone får accent-border + bg ved hover
- Hvis drag fra A2 → A1: agent-warning-toast "Markus Henriksen er ikke klar (Pyramid-test mangler)"
- Drop = åpner `ConfirmPromotionModal` med agent-rasjonale

## Talent-detail-drawer (åpen på selected)

Når kort klikkes (utenom knappene): drawer åpner med:
- Avatar + navn (større)
- Top-stats: HCP, SG, plan-fremdrift, peak
- Pyramide siste 4u
- 2 primary knapper: `Godkjenn promotion til A1` (åpner ConfirmPromotion) · `Utsett · vurder neste mnd` (toast)
- Link: `Se 360-profil →`

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip (5 stk) | default, hover, active |
| Talent-card | default, hover (lift), drag-active (rotert 2deg), drop-target |
| `Detalj`-knapp | default, hover, klikk → 360-profil |
| `Endre`-knapp | default, hover, klikk → ChangeCategoryModal |
| Drop-zone | default, hover (accent dotted border) |
| Agent-warning-toast | slide-in, auto-dismiss 5s |
| Drawer-rader | klikk → ConfirmPromotion eller toast |

## Empty / loading / error

- **Empty A-kategori:** "Ingen i A1 ennå" + dempet ikon
- **Empty totalt:** "Pipeline tom. Inviter første spiller →"
- **Drag-error:** Toast "Kan ikke flytte til A1 uten Pyramid-test bestått"
- **Loading:** 5 skeleton-cards per rad

## Eksempel-data

- **A1:** Markus, Lina, Nora (current Elite) + 2 promo-kandidater
- **A2:** 5 Pro-spillere + 1 skadet
- **A3:** 4 Free-spillere
- **Promo-kandidat:** Anders Nedrum (5,2 HCP, 12 økter siste mnd)

## Ønsket output fra Claude Design

1. Lyst tema, Pipeline-tab default
2. Mørkt tema, samme
3. Drag-state: ett kort midt i flytting fra A2 til A1
4. Drawer åpen på Anders Nedrum (promo-kandidat)
5. Risiko-warning visible på Joachim Tangen
6. Tab-bytte til Risiko
7. Mobil ≤640px — kanban-rader horisontal scroll, kort 240px

## Ikke-mål

- Ikke designe `ManualPromoteModal`, `ConfirmPromotionModal` (egne pakker)
- Ikke designe pipeline-konfig (regler for promo)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
