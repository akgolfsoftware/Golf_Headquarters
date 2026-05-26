# Mini-batch coachhq-D - Spesial

**2 skjermer i denne mini-batchen.** Felles moenster: spesialiserte
detail-flater -- talent-pipeline (strategisk kategori-justering) og
spiller-detalj light (rask oversikt). Markus Roinaas Pedersen og Henrik
Nilsen er referansespillere, Anders Kristiansen er hovedcoach.

**Generer begge skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for CoachHQ-skjermer

- **Sidebar:** TO-LAGS. Smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI enkelt-lag lys sidebar.
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Anders" eller "Welcome back"). Eksempel: *"Hvem er klar for loeft, hvem trenger en pause."*
- **Referanse-personer:**
  - Hovedcoach: Anders Kristiansen (NGF Trener IV)
  - Spillere: Markus Roinaas Pedersen (Kat A, Elite, +2,4), Henrik Nilsen (Kat B, Pro, 8,7), Anna Karlsen (Free, 16,8), Mads Roenning (Pro, 9,4), Lise Sandberg (Free, 19,5), Joachim Tangen (Pro, 14,2, skadet)
- **Pyramide-farger:** FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`.
- **Lower-is-better metrics** (HCP, score): Nedgang = success-groenn.
- **Higher-is-better metrics** (SG, distanse, antall oekter, badges): Motsatt.
- **Tabular nums** (JetBrains Mono) paa alle HCP-, score-, dato- og prosent-kolonner.
- **Komma som desimal** (12,4), **mellomrom som tusenseparator** (1 600 kr).
- **Maks 3 lime-elementer** synlig per skjerm. **Maks 1 italic** Instrument Serif per skjerm.
- 8pt-grid (8/16/24/32/40/48/64), Lucide-ikoner stroke 1.75.

---

## Pakker i denne mini-batchen

---

## Pakke 1/2: Talent-pipeline

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

---

## Pakke 2/2: Spiller-detalj (light)

# AK Golf Platform — CoachHQ — Spiller-detalj (light)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/elever/:id/light`
- **Arketype:** C — Detail + tabs (light, 6 tabs)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/spiller-detalj.html`
- **Audit:** `wireframe/audit/coachhq-spiller-detalj.md`
- **Tilhørende modaler:** `BookSessionModal`, `SendMessageModal`, `ChangeCategoryModal`, `MarkInjuredModal`, `SendParentUpdateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Lett-versjon av spillerprofilen. Brukes når coach vil ha rask oversikt uten å laste hele 360-viewet — typisk fra hurtigsøk eller når de scroller gjennom flere spillere etter hverandre. Lenken `Se 360-profil →` tar dem til full deep-dive.

## Header-blokk — UNIKT

- **Avatar:** 64px sirkel
- **H1:** `Henrik Nilsen`
- **Subtittel:** `Kategori B · Pro · 19 år · Coach: Anders K`
- **Stat-pills (4):** `HCP 8,7` · `Sist trent: i går` · `Plan-fremdrift: 58 %` · `2 åpne agent-action`
- **Primary CTA:** `Book økt`
- **Sekundær:** `Se 360-profil →` (link, ikke knapp)

## Tab-strip (6 tabs)

| Tab | Innhold |
|---|---|
| **Status** (default) | 4 stat-rich-cards + foreldre-rad + agent-strip |
| **Plan** | Mini plan-card med fase-fremdrift |
| **Sessions** | Siste 8 økter som liste |
| **Tester** | Liste over tester (kun siste forsøk) |
| **Tournaments** | Kommende + siste 3 |
| **Notater** | Siste 5 notater |

## Layout — Status-tab (default)

Asymmetrisk:
- **4 stat-rich-cards (12-col):** HCP / SG / Økter (12u) / Plan-fremdrift — hver klikkbar → StatDetailDrawer
- **Pyramide-mini (6-col):** Donut med 5 lag, klikk-segment → PyramidTierDetailDrawer
- **Heatmap-stripe (6-col):** 8 uker × 5 områder
- **Foreldre-card (6-col):** "Foresatte: Anne Nilsen + Jan Nilsen" med tlf-link (klikk = `tel:`) + `Send foreldre-oppdatering`-knapp
- **Agent-strip (6-col):** "Periodisering-agent foreslår TEK-økning" + `Avvis` / `Godkjenn`

## Quick-actions (sticky bottom-strip)

5 knapper: `Send melding` · `Book økt` · `Endre plan` · `Endre kategori` · `Marker skadet`

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-rad (6 stk) | default, hover, active (2px stripe) |
| Stat-rich-card | default, hover (lift), klikk → drawer |
| Pyramide-tier (5 lag) | default, hover, klikk → drawer |
| Foreldre-tlf | default, hover (underline), klikk → `tel:` |
| Agent-strip-knapper | default, hover, loading (spinner) |
| Quick-action knapper | default, hover, modal-trigger |

## Empty / loading / error

- **Empty (ny spiller):** "Ingen aktivitet ennå. Lag første plan →"
- **Skadet-state:** Header får destructive-bånd over: "⚠ Skadet siden 22.04 — anslagsvis tilbake 12.05"
- **Pulse for "aktiv nå":** Grønn dot ved siste-aktivitet hvis <5 min

## Eksempel-data

- **Spiller:** Henrik Nilsen, B-kategori Pro
- **HCP:** 8,7
- **Foresatte:** Anne Nilsen (+47 481 22 309), Jan Nilsen
- **Agent-forslag:** "Øk TEK-volum 28 → 34 % før Sørlandsåpent"

## Ønsket output fra Claude Design

1. Lyst tema, Status-tab med Henrik
2. Mørkt tema, samme
3. Skadet-state (header med destructive-bånd)
4. Tab-bytte til Sessions
5. Hover på quick-action `Marker skadet`
6. Mobil ≤640px — quick-actions blir bottom-sheet drawer

## Ikke-mål

- Ikke designe quick-action-modalene (egne pakker)
- Ikke designe 360-profil (egen pakke 01)
