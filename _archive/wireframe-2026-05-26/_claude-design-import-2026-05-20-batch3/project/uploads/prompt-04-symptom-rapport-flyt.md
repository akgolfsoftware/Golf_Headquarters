# Prompt 04 — Symptom-rapport (multi-step flyt)

## Hensikt
La spilleren logge et helseproblem som ikke er en akutt skade — typisk gjentakende smerte, stivhet, eller redusert kapasitet — slik at coach og medisinsk team kan følge med.

## Trigger
CTA `Legg til symptom` på `/portal/meg/helse`. Annerledes enn batch 1 prompt-08 (akutt skade) — dette er løpende symptom-tracking.

## Layout
Multi-step modal/route på `/portal/meg/helse/legg-til-symptom`. Tre steg: (1) Kroppskart + område, (2) Intensitet/varighet, (3) Trigger + notat. Progress topp, "Tilbake"/"Neste".

## Komponenter
- Steg 1: SVG-kroppskart for/bak-toggle, klikkbare regioner (skulder, rygg, kne, ankel, håndledd, hofte). Valgt region får lime-fyll.
- Steg 2: VAS-skala 0–10 (drag-slider med fargegradient cream → lime → destructive), varighet-toggle (akutt < 1 uke / kronisk > 1 uke), tidspunkt-radio (kun-trening / kun-spill / alltid)
- Steg 3: Trigger-multiselect (svingbevegelse, sittende, gå, løft, bøy, kveld, morgen), tekstfelt for fri-notat (maks 500 tegn), "Be om time med fysio"-checkbox
- Sticky footer: Tilbake (ghost) + Neste/Lagre symptom (primary)

## Eksempel-data
- Markus R.P. — 18 år
- Område: høyre skulder, fremre del
- Intensitet: 4/10
- Varighet: 2 uker (kronisk)
- Tidspunkt: kun-spill
- Trigger: svingbevegelse, kveld
- Notat: "Begynner å kjenne det etter range-økt på 60+ baller, særlig drivere."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (steg-titler), Inter (UI), JetBrains Mono (VAS-tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
- `omrade` enum required (fra kroppskart)
- `side` enum venstre/høyre/midt required
- `vas` int 0-10 required
- `varighet` enum akutt/kronisk required
- `tidspunkt` enum trening/spill/alltid required
- `triggere` multiselect optional
- `notat` text optional max 500
- `be_om_fysio` boolean default false

## Submit / actions
- Lagre symptom: POST `/api/portal/health/symptoms` → toast + redirect til helse-side med ny rad
- Hvis `be_om_fysio = true`: opprett oppgave til medisinsk team

## Tekniske krav
- Single HTML, inline CSS + SVG kroppskart inline, Google Fonts
- Touch-vennlig slider (44px min høyde)
- Norsk bokmål
- A11y: ARIA labels på alle kropps-regioner ("Høyre skulder, foran")
