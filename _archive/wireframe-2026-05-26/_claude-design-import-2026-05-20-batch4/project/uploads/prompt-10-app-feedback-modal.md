# Prompt 10 — App-feedback (modal)

## Hensikt
Samle generell tilbakemelding fra spillere: ros, ris, feature-ønsker. Lav-friksjon, ikke et support-ticket.

## Trigger
Profil-meny → "Gi tilbakemelding", eller liten "feedback"-knapp i bunn av kalender/dashboard. Også etter en milepæl (i feiringen).

## Layout
Sentrert modal 480px. Header "Hva synes du om PlayerHQ?". Body: NPS-vurdering 0–10 som klikk-grid, fri-tekst-felt, type-radio. Footer: Avbryt + Send (primary).

## Komponenter
- NPS-grid: 11 ruter (0–10), 36px hver, hover lime, valgt forest med cream-tall
- Etter NPS-valg vises kontekst-spørsmål dynamisk:
  - 0–6: "Hva burde vi forbedre?"
  - 7–8: "Hva mangler for å gi 10?"
  - 9–10: "Hva liker du best?"
- Type-radio (chips): Bug · Forslag · Ros · Spørsmål
- Textarea (500 tegn) med tegnteller
- Anonym-checkbox: "Send anonymt" (default av)
- Footer: Avbryt + Send

## Eksempel-data
- Markus R.P.
- NPS: 9
- Type: Forslag
- Tekst: "Hadde vært kult å kunne dele PR-en min direkte til Instagram-story med stats påklistret"
- Anonym: av
- App-versjon: 0.9.4
- Side hvor feedback ble sendt: `/portal/statistikk`

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (NPS-tall), Instrument Serif italic (sparsom — tittel-ord "tilbakemelding")
- Lucide-ikoner stroke 1.75
- NPS-tall i JetBrains Mono 18px
- Norsk bokmål, ingen emojier

## Form-felter
- `nps` int 0-10 required
- `type` enum bug/forslag/ros/spørsmål required
- `tekst` text optional max 500
- `anonym` boolean default false

## Submit / actions
- POST `/api/portal/feedback` → modal lukkes → toast "Takk for tilbakemeldingen!"
- Hvis NPS 9–10 og ikke anonym: vis "Vil du dele opplevelsen offentlig?"-tilbud (App Store-review-prompt)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Modal med backdrop blur
- Tegnteller live på textarea
- A11y: NPS-grid har korrekt aria-label per tall + radiogruppe-rolle
- Send-knapp disabled til NPS og type er valgt
