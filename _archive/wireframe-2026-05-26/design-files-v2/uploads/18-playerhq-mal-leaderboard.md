# AK Golf Platform — PlayerHQ — Leaderboard

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/leaderboard`
- **Arketype:** B — List + filter (rangert tabell + tab-variant)
- **Tier-gating:** **Pro/Elite.** Free ser full lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-leaderboard.html`
- **Audit:** `wireframe/audit/playerhq-mal-leaderboard.md`
- **Tilhørende modaler:** `LeaderboardModal` (utvidet view)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Tabular nums (JetBrains Mono) på alle rang-/score-kolonner. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren — uthevet med «deg»-pill.

## Spec — hva skjermen er for

Leaderboard er Markus' konkurransedrivende sammenligning mot venner, klubb og hele plattformen. Han ser hvor han ligger på ukens SG, antall økter og badges. Skjermen er ukentlig destinasjon for motivasjon — «hvor er jeg på topplisten?» Fungerer som kraftig oppgrader-driver for Free-brukere som vil se sine egne tall.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«#7 av 24 i klubben, Markus.»* Sub: «Uke 19 (5–11. mai) · +2 plasseringer fra forrige uke»
- **Tabs øverst (segmentert kontroll, 320px bred):**
  - **Venner** (8) — folk Markus har lagt til
  - **Klubb** (24) — GFGK-medlemmer — default
  - **Globalt** (Topp 100 i Norge)
- **«Din rang»-card** (sticky, like under tabs):
  - Rang-tall stort: «#7» (JetBrains Mono 48px)
  - Avatar Markus 40px
  - Navn + HCP («Markus · 12,4»)
  - Pill-rad: «↑ +2 denne uka» (accent)
  - Knapp «Se mine stats →» (sekundær)
- **Tabell-rader (Topp 20):**
  - Rad-høyde 56px
  - Markus-rad uthevet: accent-bg-tint + venstre accent-stripe + «deg»-pill etter navn
  - Kol 1: Rang (JetBrains Mono 18px tabular) — topp-3 har medalje-emoji erstattet med lucide `Trophy`/`Medal` i pyramide-farge
  - Kol 2: Avatar 32px + navn (Inter Tight 14px) + sub: klubb (muted 11px)
  - Kol 3: HCP (JetBrains Mono 14px tabular)
  - Kol 4: Ukens SG: «+0,8» (farget — positiv accent, negativ destructive subtil)
  - Kol 5: Antall økter denne uka: «12»
  - Kol 6: Badges-rad: opptil 3 lucide-ikoner (`Flame` streak, `Target` test-master, `TrendingUp` momentum)
  - Kol 7: «Detaljer →»-link → `LeaderboardModal` (utvidet)

## Filter-bar — UNIKT

- Søk: «Søk spiller …»
- Chip: **Periode** — Denne uka (default) · Måned · Sesongen
- Chip: **Metric** — SG total · Økter · Streak · Tester · Badges
- Chip: **HCP-range** — 0–10 · 11–20 · 21–36
- Sort: Rang (default, basert på valgt metric) · Navn · HCP
- Ingen primary CTA (Markus deltar automatisk)

## Klikkbare elementer

Se `wireframe/audit/playerhq-mal-leaderboard.md`. UNIKT:

| Element | States |
|---|---|
| Tab-toggle (Venner/Klubb/Globalt) | default, hover, active, count-badge |
| «Din rang»-card | default, hover, sticky shadow ved scroll |
| Spiller-rad | default, hover (subtil bg-shift), klikk → `LeaderboardModal` |
| Markus-rad | static highlight (accent-bg-tint + venstre stripe) — kan ikke klikke seg vekk |
| «deg»-pill | static (accent-fyll, primary tekst) |
| Topp-3-medalje-ikon | tooltip («Gull/Sølv/Bronse uka») |
| Badge-ikon | tooltip per badge («7-dagers streak» etc.) |
| Periode-chip | endrer alle kolonner ved skift |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Sammenlign deg med Pro →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Venner-tab tom:** «Ingen venner lagt til. Inviter en venn →»
- **Empty rang (ny bruker uten data):** «Du må logge minst én økt for å rangeres»
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Leaderboard er en Pro-feature»
  - 3 fordeler (sammenlign med klubb, ukens topp-spillere, badges og streaks)
  - CTA «Oppgrader til Pro →»
- **Loading:** «Din rang»-skeleton + 5 grå rader
- **Error:** Per-tabell retry

## Ønsket output fra Claude Design

1. Klubb-tab lyst tema (Pro — Markus uthevet på rang #7)
2. Venner-tab lyst tema (Pro — 8 venner, Markus #3)
3. Free — full lock-overlay
4. Mørkt tema (Klubb-tab)
5. Hover på spiller-rad
6. Empty Venner-tab
7. Mobil ≤640px — kompaktet tabell (rang + avatar + navn + metric, resten i row-actions-meny)

## Ikke-mål

- Ikke designe `LeaderboardModal` (utvidet view — egen pakke)
- Ikke designe `UpgradeToProModal` (Tier-1 kritisk modal — egen pakke)
- Ikke implementere ekte ranking-algoritme — bruk plausible eksempel-data
