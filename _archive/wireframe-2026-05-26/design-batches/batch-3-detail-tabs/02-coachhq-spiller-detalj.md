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

## Når du er ferdig

Lim design-link tilbake til Claude Code.
