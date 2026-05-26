# Prompt 09 — Kontakt support

## Hensikt
Strukturert support-skjema: spilleren melder inn problem, AK Golf får riktig info første gang.

## Trigger
`/portal/meg/help/kontakt-support`. Også fra hjelp-artikkel-bunn "Fikk du ikke svar?".

## Layout
Standard portal-side, maks-bredde 640px sentrert. Header "Kontakt support". Body: kategori-velger øverst, deretter dynamiske felter. Sticky submit-bar i bunn på mobil.

## Komponenter
- Intro-tekst: "Vi svarer vanligvis innen 4 timer på hverdager"
- Kategori-radio (kort-stil 2x3 grid):
  1. Booking/betaling — Lucide credit-card
  2. Coach-meldinger — Lucide message-circle
  3. App-feil/bug — Lucide alert-octagon
  4. Konto/login — Lucide key
  5. Data/synk — Lucide refresh
  6. Annet — Lucide help-circle
- Felter: emne (text), beskrivelse (textarea, 1000 tegn), vedlegg (drag-drop, opptil 3 filer), "Tillat support å se profilen min"-checkbox
- Auto-vedlegg: app-versjon, OS, sist innlogget — vises som kollapsbart "Tekniske detaljer" (lest av support)
- Submit: primary `Send melding`
- Footer-link: "Vil du heller chatte? Åpne live-chat"

## Eksempel-data
- Markus R.P.
- Kategori valgt: App-feil/bug
- Emne: "Live-økt fryser når jeg starter time-på"
- Beskrivelse: "I går kveld krasjet appen tre ganger når jeg trykket Start på en putting-økt. Iphone 15 Pro, iOS 18.4."
- Vedlegg: skjermbilde-1.png, skjermbilde-2.png
- App-versjon: 0.9.4
- OS: iOS 18.4
- Sist innlogget: 19.05.2026 kl 14:12

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tekniske detaljer), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
- `kategori` enum required
- `emne` text required min 5 max 100
- `beskrivelse` textarea required min 20 max 1000
- `vedlegg` files optional, jpg/png/pdf, maks 10MB hver, maks 3 stk
- `tillat_profil_innsyn` boolean default false

## Submit / actions
- POST `/api/portal/support/tickets` → success-side med ticket-ID og forventet svartid
- E-post-bekreftelse automatisk
- Failure: rød banner med retry

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Tegnteller på textarea (live)
- Drag-drop-vedlegg med preview-thumbnails
- A11y: progress-feedback ved opplasting (ARIA-live)
- Norsk bokmål, høflig tone i mikrokopi
