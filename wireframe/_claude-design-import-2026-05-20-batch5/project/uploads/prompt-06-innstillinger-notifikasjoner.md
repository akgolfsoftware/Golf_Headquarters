# Prompt 06 — Notifikasjons-innstillinger

## Hensikt
La spilleren styre alle typer varsler — kanal (push/e-post/SMS) og frekvens (umiddelbart/daglig/aldri).

## Trigger
`/portal/meg/innstillinger` → kort "Notifikasjoner" → `/portal/meg/innstillinger/notifikasjoner`.

## Layout
Standard portal-side, maks-bredde 720px. Header "Notifikasjoner", muted "Velg hva og hvordan du vil bli varslet". Body: matrise-table med varseltype som rader og kanal som kolonner. Sticky save-bar i bunn (vises kun ved dirty form).

## Komponenter
- "Pause alle"-toggle øverst med varighet-select (1 t / 4 t / til i morgen)
- Matrise-table med rader for hver kategori, kolonner: Push (Lucide bell), E-post (Lucide mail), SMS (Lucide message-circle)
- Hver celle: toggle-switch (forest/cream)
- Frekvens-radio per rad: Umiddelbart · Daglig oppsummering · Aldri
- Sticky footer ved dirty: "Du har ulagrede endringer" + Avbryt + Lagre
- Test-varsel-knapp nederst: "Send testvarsel" (ghost)

## Kategorier (rader)
1. Nye coach-meldinger
2. Booking-bekreftelser
3. Booking-påminnelser (24t før)
4. Coach-feedback på økt
5. AI-coach forslag
6. Mål-progresjon (ukentlig)
7. Utfordringer fra venner
8. Familie/foreldre-aktivitet
9. Faktura og betalinger
10. Nyhetsbrev fra AK Golf

## Eksempel-data
- Markus R.P.: push på for kategori 1, 2, 3, 4. SMS av overalt. E-post kun på 7, 9.
- Pause: AV
- Sist endret: 14. mai 2026

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Toggle-switch: 36x20px, forest når on, line når off
- Norsk bokmål, ingen emojier

## Form-felter
- 10 rader × 3 kanaler = 30 toggles
- 10 frekvens-radio-grupper
- 1 pause-toggle + varighet-select

## Submit / actions
- Auto-save på toggle-bytte (debounced 800ms) — viser "Lagret" mini-toast
- "Lagre"-knappen i sticky-bar er backup hvis auto-save feiler
- Endpoint: PATCH `/api/portal/notifications/preferences`

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Responsiv: matrisen blir kollapsbar accordion på mobil (én rad = ett kort)
- A11y: korrekte aria-checked på toggles, fieldset/legend for radio-grupper
- Testvarsel-knapp: viser dummy push-notifikasjon nederst
