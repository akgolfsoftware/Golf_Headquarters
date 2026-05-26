# Prompt 22 — Runde-detalj (shot-by-shot)

## Hensikt
Vise alle detaljer fra én registrert runde: hull-for-hull, statistikk, vær, partnere, notater.

## Trigger
Klikk på runde-rad i `/portal/mal/runder` eller via varsel. URL: `/portal/mal/runder/[id]`.

## Layout
Standard portal-page, maks-bredde 960px. Header: tittel (bane + dato) + back-link + tre-prikker-meny (rediger, slett, eksporter, del). Body: 4 seksjoner.

## Komponenter
- Top-summary-row: 4 KPI-kort (Score, FIR%, GIR%, Putts) — JetBrains Mono tall, muted label
- Bane-meta-kort: kart-thumbnail (Lucide map-pin), bane-navn, tee, slope/CR, vær-ikoner, partnere som chips
- Hull-tabell: 18 rader (eller grid 9+9), kolonner Hull/Par/Score/FIR/GIR/Putts. Score-celler farges: birdie+ lime, par cream, bogey muted, dobbel+ destructive tint.
- Trend-grafer (3 stk): Score per hull (linje), Cumulative over par (areal), Putts per hull (søyle). Bruk inline SVG, ikke biblio.
- Notat-kort med spillerens eget notat + coach-kommentar (hvis lagt til)
- Footer: "Sammenlign med tidligere runder på samme bane"-link

## Eksempel-data
- Runde-ID: r_8021
- Bane: Larvik GK · Hvit · slope 134 · CR 71,5
- Dato: 18.05.2026
- Score: 73 (+1)
- Front 9: 36 (+0), Back 9: 37 (+1)
- FIR: 11/14 (78%)
- GIR: 13/18 (72%)
- Putts: 30 (1,67 snitt)
- Birdies: 3, pars: 13, bogeys: 1, dbl-bogey: 1
- Værforhold: sol, vind 4m/s
- Partnere: Tim, Espen
- Notat: "God runde, kun ett trippel-bogey på 14."
- Coach-kommentar: "Sterk FIR — bygger videre på driver-jobben fra forrige uke."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (all score/statistikk), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
Ingen.

## Submit / actions
- Tre-prikker → Rediger (prompt-23), Slett (med bekreftelse), Eksporter (prompt-23), Del
- "Sammenlign"-link → routes til `/portal/mal/runder?filter=bane:larvik-gk`

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG for grafer + ikoner
- Norsk dato/tall
- Hull-tabell scroller horisontalt på mobil
- A11y: tabell med korrekte th/scope-attributter
