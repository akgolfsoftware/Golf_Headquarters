# Prompt 08 — Integrasjoner

## Hensikt
Koble PlayerHQ til eksterne systemer (TrackMan, GolfBox, Strava, Apple Health, Garmin) slik at data flyter inn automatisk.

## Trigger
`/portal/meg/innstillinger/integrasjoner`.

## Layout
Standard portal-side, maks-bredde 720px. Header "Integrasjoner" med muted "Koble til eksterne tjenester for å samle data". Body: grid 2 kolonner på desktop, 1 på mobil. Hver integrasjon er et kort.

## Komponenter
- Integrasjons-kort: logo/ikon 40px, navn, status-badge (Tilkoblet/Ikke tilkoblet), beskrivelse 2 linjer, primary CTA `Koble til` eller secondary `Administrer`
- Status-badge: forest dot = tilkoblet, muted dot = ikke tilkoblet
- "Sist synket"-tekst i mono når tilkoblet
- "Last inn på nytt"-icon-knapp (Lucide refresh)
- Help-link nederst: "Får du ikke koblet til?"

## Integrasjoner
1. **GolfBox** — handicap, registrerte runder, klubb-medlemskap (Tilkoblet)
2. **TrackMan Range/Performance Studio** — shot-data fra økter (Tilkoblet)
3. **TrackMan Connect** — personlige range-økter (Ikke tilkoblet)
4. **Strava** — kondisjon, løpe-/sykkel-økter (Ikke tilkoblet)
5. **Apple Health / Helse** — søvn, hvilepuls, HRV (Tilkoblet)
6. **Garmin Connect** — daglige steg, treningsintensitet (Ikke tilkoblet)
7. **Spotify** — playlister til træningsøkter (Ikke tilkoblet)
8. **Google Calendar / Apple Calendar** — synk av økter (Ikke tilkoblet)

## Eksempel-data
- Markus R.P.
- GolfBox sist synket: 19.05.2026 kl 08:23 — siste registrert runde 18.05
- TrackMan Performance Studio: sist synket 14.05 kl 16:45, 47 shots
- Apple Health: sist synket 19.05 kl 06:00 — søvn 7t 12m, HRV 64ms

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (datoer/tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Bruk merkenes brand-farger sparsomt — kun på 24px logo i kortet, alt annet AK Golf-palett
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — OAuth-flow åpnes ved klikk.

## Submit / actions
- "Koble til" → åpner OAuth-popup til provider, ved suksess → toast "Koblet til X"
- "Administrer" → drawer som viser data-typer, sist synket, "Koble fra"-CTA (destructive ghost)
- "Last inn på nytt" → POST `/api/portal/integrations/[provider]/sync` → toast med antall nye rader

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide + monogram-SVG for hvert merke (sett dem som inline path, 24px)
- Norsk dato/klokke-format
- A11y: kortene er `<button>` eller `<a>` med tydelig aria-label
