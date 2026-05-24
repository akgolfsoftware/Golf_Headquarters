# Prompt 11 — Ny meldingstråd (compose)

## Hensikt
La spilleren starte ny samtale med sin coach eller annet teammedlem (fysio, mentor).

## Trigger
CTA `Ny melding` på `/portal/coach` eller `/portal/coach/melding`. URL: `/portal/coach/melding/ny`.

## Layout
Full-page route, maks-bredde 720px sentrert. Header med "Tilbake"-pil og tittel "Ny melding". Body: mottaker-velger, emne, body-editor, vedlegg. Sticky send-bar i bunn.

## Komponenter
- Mottaker-velger: avatar-grid med team-medlemmer (coach, sub-coach, fysio, mentor). Klikk for å velge — kun én om gangen. Lime ring rundt valgt.
- Emne-felt: text input, plassholder "Hva gjelder det?"
- Body-editor: enkel rik-text (bold, kursiv, list, link, bilde) toolbar over textarea
- Vedlegg-row under: drag-drop område + "Velg fra galleri", thumbnail-preview
- Sticky bottom-bar: utkast-status (auto-save), Avbryt, Send (primary lime)
- Foreslåtte snutter: 3 "Hurtig-emner" som chips (Spørsmål om økt · Be om feedback · Skadeoppdatering)

## Eksempel-data
- Markus R.P.
- Tilgjengelige mottakere: Hans Brennum (hovedcoach), Linn Knutsen (fysio), Espen Søvik (mentor)
- Valgt: Hans Brennum
- Emne: "Spørsmål om gårsdagens videoanalyse"
- Body: "Hei Hans, jeg så på videoen og lurer på posisjonen ved P3..."
- Vedlegg: screenshot.png (240KB)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI/body), JetBrains Mono (timestamp), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (chevron-left, paperclip, image, send, x)
- Norsk bokmål, ingen emojier

## Form-felter
- `mottaker_id` UUID required
- `emne` text required min 3 max 100
- `body` rich-text required min 10
- `vedlegg` files optional, opptil 5

## Submit / actions
- Auto-save utkast hvert 5. sek (POST `/api/portal/messages/drafts`)
- Send: POST `/api/portal/messages` → redirect til `/portal/coach/melding/[id]`
- Avbryt: hvis utkast eksisterer, spør "Lagre som utkast?"

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Tegnteller på emne
- Mobile: send-bar er sticky, mottaker-velger kollapses til select
- A11y: send-knapp disabled til mottaker + emne + body er fylt
