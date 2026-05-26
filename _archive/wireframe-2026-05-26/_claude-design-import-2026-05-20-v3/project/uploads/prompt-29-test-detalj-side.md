# Prompt 29 — Test-detalj side

## Hensikt
Vise alle historiske målinger for en spesifikk test (f.eks. CMJ, dypknebøy, Y-balance, 90-graders push-up), med trend over tid og normverdier.

## Trigger
Klikk på test-rad i `/portal/tren/tester`. URL: `/portal/tren/tester/[id]`.

## Layout
Standard portal-page, maks-bredde 960px. Header: test-navn + back-link + "Logg ny måling"-CTA. Body: 4 seksjoner.

## Komponenter
- Header: test-navn (Inter Tight 32px), kategori-chip (Fysisk / Teknisk / Mental), beskrivelse 2 linjer
- KPI-row 4 kort: Siste verdi · Snitt 30 dager · PR · Norm for U18 gutter
- Trend-graf stor: linjegraf siste 12 målinger med dato-akse + PR-markør + norm-band (lime tint)
- Tabell historikk: alle målinger med kolonner Dato/Verdi/Endring/Sted/Notat (rader klikkbare → drawer med detaljer)
- Norm-info-kort: "U18 gutter elite: 56cm · gjennomsnitt: 48cm · ditt nivå: 54cm (over gjennomsnitt)"
- Sticky bunn på mobil: "Logg ny måling" primary

## Eksempel-data
- Test: Counter Movement Jump (CMJ)
- Kategori: Fysisk
- Beskrivelse: "Maksimal vertikal hopphøyde fra rett stående med motbevegelse"
- Siste verdi: 54 cm (18.05.2026)
- Snitt 30 dager: 52,4 cm
- PR: 56 cm (12.04.2026)
- Norm U18 elite: 56, snitt 48
- 12 målinger siste 6 mnd
- Trend: stigende +4cm siden januar

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall), Instrument Serif italic (sparsom — test-beskrivelse)
- Lucide-ikoner stroke 1.75 (activity, trending-up, award, info, plus)
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — kun visning.

## Submit / actions
- "Logg ny måling" → routes til prompt-18 fra batch 1 (test logg modal)
- Klikk på rad → drawer med detaljer for den målingen
- Tre-prikker → eksporter test-historikk

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG for linjegraf + Lucide
- Tabular-nums på alle tall i tabell
- Norsk tall (54 cm, 1 245 ms)
- A11y: SVG-grafen har aria-label + tabell-fallback
