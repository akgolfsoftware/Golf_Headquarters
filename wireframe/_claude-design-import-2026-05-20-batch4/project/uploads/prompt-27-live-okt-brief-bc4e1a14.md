# Prompt 27 — Live økt: pre-brief (fullscreen)

## Hensikt
Siste skritt før spilleren starter en live-økt — bekrefte mål, sjekke utstyr, mentalt fokus. Skapes spesifikt for fokus-modus med få elementer.

## Trigger
Trykk `Start økt` på `/portal/tren/[sessionId]`. URL: `/portal/(fullscreen)/live/[sessionId]/brief`.

## Layout
Fullscreen, ingen sidemargin. Mørkt tema preferert (forest bakgrunn, cream tekst) for fokus. Layout: vertikal stack sentrert maks-bredde 640px.

## Komponenter
- Topp-bar: "Avbryt"-link øverst venstre (cream/60), klokke øverst høyre (mono)
- Stor tittel: Inter Tight 40px "Wedge-presisjon 50–80m"
- Underoverskrift: Instrument Serif italic 22px "Tre mål for de neste 60 minuttene"
- 3 mål-kort (vertikal stack): hver med ikon (Lucide target) + målbeskrivelse + sjekkboks "Forstått"
- Utstyrssjekk: "Har du alt klart?" med 5 sjekkbokser (PW, GW, SW, LW, alignment sticks)
- Stort mentalt-spørsmål: "Hva er ditt fokus akkurat nå?" — fri-tekst-felt (eller chip-velger: tempo, balanse, tålmodighet, tillit)
- Stor primary CTA nederst: `Start (60min)` — lime, full-bredde, 64px høyde
- "Hopp over"-ghost-link under (cream/60)

## Eksempel-data
- Økt: Wedge-presisjon 50–80m
- Coach: Hans Brennum
- Mål 1: Treff GIR 7/10 fra 60m
- Mål 2: Konsistens i tempo
- Mål 3: Identifisere mønster i misser
- Utstyr-sjekk: alle haket
- Mentalt fokus valgt: "Tempo"

## Branding
- AK Golf design system mørkt: bg `#0F2A22` (forest-mørk), tekst cream, accent lime, muted #9D9C95
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (klokke/tid), Instrument Serif italic (underoverskrift)
- Lucide-ikoner stroke 1.75 (target, check, clock, x)
- Norsk bokmål, ingen emojier
- Generøs whitespace — fokus-design

## Form-felter
- 3 sjekkbokser for mål-forståelse
- 5 sjekkbokser for utstyr
- Mentalt fokus (text eller chip)

## Submit / actions
- `Start` → routes til live-økt-logger (allerede dokumentert separat) eller `/portal/(fullscreen)/live/[sessionId]/tapper`
- `Avbryt` → tilbake til økt-detalj
- `Hopp over` → start uten brief-bekreftelse

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Fullscreen API ikke nødvendig — bruk full viewport
- Generøs spacing 32–48px
- A11y: høy kontrast, store touch-targets (min 44px)
- Skjul system-UI på mobil (`viewport-fit=cover`)
