# Prompt 35 — Onboarding (første login)

## Hensikt
Lede nye brukere gjennom de essensielle oppsettstegene første gang de logger inn i PlayerHQ, slik at appen blir umiddelbart nyttig.

## Trigger
Auto første gang en spiller logger inn (sjekk `user.onboardedAt = null`). Kan også startes manuelt fra innstillinger "Gå gjennom onboarding på nytt".

## Layout
Full-screen modal/route som dekker hele viewport. 6 steg med progress-bar topp og "Hopp over"-link øverst høyre. Hver steg er sentrert kort 560px.

## Komponenter
- Progress-bar topp: 6 prikker med tall, aktiv = forest, fullført = lime check
- "Hopp over"-link øverst høyre (cream/60)
- Per steg: stort heading (Inter Tight 36px), kort beskrivelse, illustrasjon (inline SVG), form eller chips, primary CTA nederst

## Steg 1 — Velkommen
- Tittel "Velkommen til PlayerHQ"
- Underoverskrift italic "La oss sette opp din profil — det tar 90 sekunder"
- SVG: stilisert golf-flag eller logo
- CTA `Kom i gang` (lime)

## Steg 2 — Profil-basics
- "Hvem er du på banen?"
- Felter: Navn (pre-utfylt fra auth), fødselsdato, kjønn, klubb (søkbar)

## Steg 3 — Golf-nivå
- "Hva er ditt nivå?"
- HCP-felt (eller koble GolfBox)
- Spille-erfaring: <1 år · 1-3 år · 3-5 år · 5+ år
- Treningsfrekvens: 1-2 / 3-4 / 5+ økter per uke

## Steg 4 — Mål
- "Hva vil du oppnå?"
- Multi-select chips: Senke HCP · Forberede konkurranse · Spille mer konsekvent · Ha det gøy · Kvalifisere til lag · Bli pro
- Tekstfelt: "Beskriv ditt viktigste mål for sesongen"

## Steg 5 — Koble coach (valgfritt)
- "Har du en coach?"
- Søkbar coach-velger (eller "Jeg har ingen coach ennå")
- Hvis valgt: send tilkoblings-forespørsel automatisk

## Steg 6 — Notifikasjoner
- "Hvordan vil du varsles?"
- 3 toggles: Push på telefon · E-post · Daglig oppsummering
- Final CTA `Fullfør og start utforskning`

## Eksempel-data
- Markus R.P. (om førstegangs)
- Navn: Markus Roenas Pedersen
- HCP: +3,5 (synket fra GolfBox)
- Klubb: Gamle Fredrikstad GK
- Mål: Senke HCP + Forberede konkurranse
- Tekstmål: "Topp 10 NM Junior 2026"
- Coach: Hans Brennum (forespørsel sendt)
- Varsler: push på, e-post på

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (HCP/tall), Instrument Serif italic (underoverskrifter)
- Lucide-ikoner stroke 1.75 (target, user, trophy, users, bell, check)
- Norsk bokmål, ingen emojier
- Bakgrunn: cream med subtle gradient

## Form-felter
- Som listet per steg

## Submit / actions
- Hvert steg `Fortsett` → lagre data + neste steg
- Final `Fullfør` → POST `/api/portal/onboarding/complete` → marker `onboardedAt` → redirect `/portal/hjem` med velkomst-toast
- "Hopp over" → spør "Sikker? Du kan fortsette senere" — hvis ja, marker minimal data + redirect

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG illustrasjoner + Lucide
- Progress-bar oppdaterer animert
- A11y: dialog-rolle, trap focus per steg, ARIA-live på steg-skifte
- Mobile: full-bleed, steg fyller hele skjermen
- Norsk bokmål, vennlig og oppmuntrende tone
