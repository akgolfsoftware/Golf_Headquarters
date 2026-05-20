# Prompt 28 — Live økt: summary (fullscreen)

## Hensikt
Umiddelbar oppsummering rett etter live-økt er ferdig — vis hva som ble logget, la spilleren reflektere, og foreslå neste steg.

## Trigger
Når spilleren trykker "Avslutt økt" i live-økt-logger. URL: `/portal/(fullscreen)/live/[sessionId]/summary`.

## Layout
Fullscreen mørkt tema (samme som prompt-27). Layout: vertikal stack maks-bredde 720px sentrert. Scrollbar.

## Komponenter
- Topp-bar: klokke + lukk-knapp
- Tittel: Inter Tight 36px "Økt fullført"
- Underoverskrift: Instrument Serif italic 22px "Slik gikk det"
- Stat-grid 3-kolonne KPI-kort: Varighet · Antall shots · Mål oppnådd (x/3)
- "Slik gikk det mot målene"-seksjon: 3 mål-rader med progress-bar og resultat
  - Mål 1 "GIR 7/10 fra 60m": 8/10 — overoppfylt (lime check)
  - Mål 2 "Konsistens i tempo": 6/10 — delvis (gul-aktig muted)
  - Mål 3 "Mønster i misser": Mønster funnet — bekreftet (lime check)
- Highlights-row: 3 small kort
  - Beste shot: 62m PW, 4m fra pin
  - Verste tendens: 12% misser mot venstre
  - PR mulig: "Hadde du 9 GIR, ville det vært ny PR"
- Refleksjon-tekstfelt: "Hva tar du med deg?" — 3 chip-forslag + fri-tekst (300 tegn)
- Stemning-VAS 1–10: "Hvordan føltes økten?"
- Action-row:
  - `Send til coach` (primary lime) — POST melding
  - `Lukk og fortsett` (ghost) — return til portal-hjem

## Eksempel-data
- Økt: Wedge-presisjon 50–80m, 60 min
- Antall shots: 78
- Mål oppnådd: 2,5/3
- Beste shot: 62m PW, 4m fra pin
- Verste mønster: 12% misser venstre
- Refleksjon: "Tempoet ble bedre da jeg pustet ut på baksving."
- Stemning: 8/10

## Branding
- AK Golf design system mørkt: bg `#0F2A22`, cream tekst, lime accent
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall), Instrument Serif italic (underoverskrift, sparsom)
- Lucide-ikoner stroke 1.75 (check, x, target, trending-up, send)
- Norsk bokmål, ingen emojier

## Form-felter
- `refleksjon` text optional max 300
- `stemning` int 1-10 optional

## Submit / actions
- "Send til coach" → POST `/api/portal/sessions/[id]/finalize` med refleksjon + send melding
- "Lukk" → POST finalize uten melding → redirect `/portal/hjem`

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide + progress-bar SVG
- Generøs spacing
- A11y: aria-labels på VAS-slider
- Norsk bokmål
