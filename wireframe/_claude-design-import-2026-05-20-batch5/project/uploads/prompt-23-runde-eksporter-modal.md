# Prompt 23 — Eksporter runder (modal)

## Hensikt
La spilleren laste ned runde-historikk som CSV eller PDF for arkivering, deling med trener, eller dataanalyse.

## Trigger
"Eksporter"-knapp på `/portal/mal/runder`. URL/modal: `/portal/mal/runder/eksporter`.

## Layout
Sentrert modal 480px. Header "Eksporter runder". Body: format-velger, periode-velger, kolonne-velger. Footer: Avbryt + Last ned (primary).

## Komponenter
- Format-radio (kort-stil): CSV (Lucide table) · PDF rapport (Lucide file-text)
- Periode-radio: Siste 10 runder · Siste 30 dager · Siste 90 dager · Hele 2026 · Egendefinert (åpner dato-range-picker)
- Kolonne-checkboxes (kun for CSV): Dato · Bane · Score · FIR · GIR · Putts · Vær · Partnere · Notater · Coach-kommentar
- For PDF: stil-radio: Kompakt (1 side) · Detaljert (én side per runde) · Statistikk-rapport
- Preview-block: "Genererer 1 PDF (12 sider, ~ 2.4MB)" eller "Genererer 1 CSV (47 rader)"
- Footer: Avbryt + Last ned (primary lime)

## Eksempel-data
- Markus R.P. — 47 runder registrert i 2026
- Valgt format: PDF
- Valgt periode: Hele 2026
- Stil: Statistikk-rapport
- Estimert størrelse: 8 sider, 2.1MB

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall/dato), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (table, file-text, download, calendar)
- Norsk bokmål, ingen emojier

## Form-felter
- `format` enum csv/pdf required
- `periode` enum required
- `dato_fra`, `dato_til` date (kun ved egendefinert)
- `kolonner` multi-select (kun CSV)
- `stil` enum (kun PDF)

## Submit / actions
- Last ned: POST `/api/portal/rounds/export` → returnerer fil (presigned URL eller direct download)
- Toast: "Eksport ferdig — sjekk Nedlastinger"

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Preview-block oppdaterer estimat real-time
- A11y: trap focus, esc lukker
- Norsk bokmål, norsk filnavn `markus-rp-runder-2026.csv`
