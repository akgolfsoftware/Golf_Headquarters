# Prompt 01 — Profil rediger (modal)

## Hensikt
La spilleren oppdatere personalia, profilbilde, kontakt og klubb-tilknytning uten å forlate profilsiden.

## Trigger
Knappen `Rediger profil` på `/portal/meg/profil` (toppkort, høyre side). Lukkes med Esc, X-knapp eller backdrop-klikk.

## Layout
Sentrert modal, 560px bred på desktop, full-screen sheet på mobil. Header med tittel `Rediger profil` og X-ikon. Innhold scroller. Footer er sticky med `Avbryt` (secondary) og `Lagre endringer` (primary).

## Komponenter
- Avatar-blokk: rund 96px med "Bytt bilde"-overlay (Lucide `camera` 20px)
- Form-grid 2 kolonner på desktop, 1 på mobil
- Section-headere i Inter Tight 16px uppercase letter-spacing 0.08em
- Inline validering: grønn check ved gyldig, rød tekst under felt ved feil
- Sticky footer med beskyttende `bg-card/95 backdrop-blur`

## Eksempel-data
- Navn: Markus Roenas Pedersen
- E-post: markus.rp@example.com
- Telefon: +47 412 33 555
- Fødselsdato: 12.04.2008
- Klubb: Gamle Fredrikstad GK
- HCP: +3,5 (read-only — synket fra GolfBox)
- Adresse: Storgata 14, 1606 Fredrikstad

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (HCP), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
- `navn` text required min 2
- `epost` email required + format-validering
- `telefon` tel required norsk format
- `fodselsdato` date required
- `klubb` select (forhåndsutfylt fra brukeren)
- `adresse` text optional
- `profilbilde` file upload jpg/png maks 5MB
- HCP-felt er disabled med tooltip "Synket fra GolfBox"

## Submit / actions
- Lagre: PATCH `/api/portal/profile` → success toast "Profil oppdatert" → modal lukkes
- Avbryt: hvis dirty form, vis bekreftelses-mini-modal "Forkast endringer?"
- Feilhåndtering: inline + samlet error-banner øverst hvis API feiler

## Tekniske krav
- Single HTML-fil, inline CSS, Google Fonts via `<link>`
- Inline SVG for alle ikoner
- Norsk datoformat `dd.mm.yyyy` i input mask
- Maks-bredde 560px desktop, h-full mobil
- Trap focus i modal når åpen
