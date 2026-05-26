# AK Golf Platform — PlayerHQ — Mål-leaderboard (utvidet)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/mal/leaderboard`
- **Arketype:** G — Other (rank-list med visuelle podiums + filter)
- **Tier-gating:** Pro-låst (Free ser blurred preview)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-leaderboard.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `ChallengeDetailModal`, `JoinChallengeModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Mål-leaderboard er sosiale konkurranser blant AK Golf-spillere. Eksempler: "Mest treningsvolum mai", "Lavest snitt-putts juni", "Flest runder Q2". Markus kan se hvor han ligger sammenlignet med andre, joine pågående challenges, og se sin egen historikk. Pro-feature for å bygge community.

Forskjellig fra batch-2-leaderboard (kun list) — dette er utvidet med podium-visualisering, challenge-detaljer og join-flow.

## Layout — UNIKT for denne skjermen

### Hero podium (top 3)

Visuelt podium med 3 plasser:
- **2. plass** (venstre, lavere) — sølv-pill, avatar 64px, navn, score
- **1. plass** (midt, høyest) — gull-pill, avatar 80px, krone-ikon `Crown`, navn, score
- **3. plass** (høyre, lavest) — bronze-pill, avatar 64px

Bak podium: subtil bg-pattern (diagonal lime-stripes 5%).

### Aktiv challenge (banner)

Sticky øverst:
- Challenge-navn: *"Mai-volum 2026"*
- Periode: `1.–31. mai · 18 dager igjen`
- Mottaker: 47 spillere
- Markus' rang: `12 / 47` med trend-pil (`↑ opp 3 plasser denne uka`)

### Leaderboard-tabell

Kolonner:
| Kolonne | Innhold |
|---|---|
| Rang | "#1", "#2"... — toppen får krone, top 3 farget pill |
| Spiller | Avatar + navn (Markus' rad highlightet med accent-bg) |
| Score | Hovedmetric (Mono): "12t 30m" |
| Δ siste 7d | Trend-pil + tall: "+2,1t" |
| Antall økter | "8" |

Topp 10 vises, så Markus' rad alltid synlig (selv om han er #12).

### Challenge-velger (tabs)

Øverst: `Aktive (3) / Kommende (2) / Fullført (12)`. Hver tab viser en liste over challenges Markus kan se eller har vært med på.

### Right-rail: din historikk

- "Beste rang: #4 (april 2026)"
- "Totalt joined: 8 challenges"
- "Vunnet: 1 (Mars-putts 2026)"
- Knapp: `Lag egen challenge →` (Pro-feature)

## KPI-strip (4 kort)

1. Aktive challenges: 3
2. Markus' beste rang siste 30d: 12 / 47
3. Antall AK-spillere på leaderboard: 47
4. Premier delt ut MTD: 1 (gjennomsnittlig premie: T-skjorte + 1 mnd Pro)

## Filter-bar — UNIKT

- Chip: Tier-grupper (Mine venner / Min kategori / Alle)
- Chip: Periode (Aktiv / Forrige måned / All-time)
- Sort: Rang / Δ siste 7d / Antall økter

## Klikkbare elementer

| Element | States |
|---|---|
| Podium-plass | hover (zoom 1.05), klikk → spiller-profil-popover |
| Challenge-banner | klikk → `ChallengeDetailModal` |
| Leaderboard-rad | hover (bg-shift), klikk → spiller-profil (begrenset av personvern) |
| Markus' rad | alltid highlightet (accent-bg + border-left) |
| Challenge-tab | default, hover, active (underline accent) |
| Lag egen challenge (Pro) | default Pro, Free viser låst-state |

## Empty / loading / error

- **Empty (ingen challenges):** "Ingen aktive challenges. Spør Anders om å lage en →"
- **Empty (du er ikke med):** "Du er ikke med i denne challengen. Join nå →" CTA
- **Free-tier-låst:** Hele leaderboard er blurred ut + sentrert tier-gate "Se hvor du ligger med Pro · Oppgrader →"
- **Loading:** Skeleton podium + 10 skeleton-rader

## Ønsket output fra Claude Design

1. Lyst tema, full leaderboard "Mai-volum" med podium + 10 rader (Markus #12)
2. Mørkt tema, samme
3. Challenge-tab "Fullført" valgt (viser historikk)
4. Free-tier-låst (blurred preview)
5. ChallengeDetailModal åpen
6. Mobil ≤640px — podium kompakt, leaderboard kort-layout, right-rail bottom-sheet

## Ikke-mål

- Ikke designe `ChallengeDetailModal`, `JoinChallengeModal` (egen batch)
- Ikke designe lag-egen-challenge-wizard (egen sub-flow)
- Ikke designe premie-utdeling-flyt

## Når du er ferdig

Lim design-link tilbake til Claude Code.
