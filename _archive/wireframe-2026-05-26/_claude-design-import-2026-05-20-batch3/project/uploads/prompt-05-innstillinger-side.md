# Prompt 05 — Innstillinger (rot-side)

## Hensikt
Sentral hub for alle bruker-innstillinger i PlayerHQ. Lenker videre til underseksjoner uten å overvelde.

## Trigger
Profil-meny → "Innstillinger", eller direkte URL `/portal/meg/innstillinger`.

## Layout
Standard portal-side: header med tittel "Innstillinger" og kort beskrivelse. Body er en single-column liste med seksjonskort som lenker til underseksjoner. Maks-bredde 720px sentrert.

## Komponenter
- Page-header: Inter Tight 32px "Innstillinger", muted-tekst "Tilpass appen til deg"
- Seksjonskort (6 stk): hver med ikon, tittel, beskrivelse, ChevronRight høyre. Hover: lett forest-tint.
- Footer-link: "Slett konto permanent" (destructive ghost, liten)
- Account-block topp: avatar 48px + navn + e-post + "Rediger profil"-knapp (link til prompt-01)

## Seksjoner (kort)
1. **Notifikasjoner** — Lucide `bell` — "Velg hvilke varsler du vil ha"
2. **Personvern** — Lucide `lock` — "Synlighet, data og GDPR"
3. **Integrasjoner** — Lucide `plug` — "TrackMan, GolfBox, Strava"
4. **Språk og region** — Lucide `globe` — "Norsk bokmål · Europa/Oslo"
5. **Sikkerhet** — Lucide `shield` — "Passord og 2FA"
6. **Apparater og økter** — Lucide `monitor` — "Logget inn fra"

## Eksempel-data
- Markus R.P., markus.rp@example.com
- Avatar fra profilbilde-upload
- Språk: Norsk bokmål
- Region: Europa/Oslo
- Antall aktive økter: 2 (denne Mac + iPhone)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75, 24px på kort
- Kort: bg-card, border-line, radius 12px, padding 24px
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — kun navigasjon.

## Submit / actions
- Hvert kort er en link til underseksjon
- "Slett konto permanent" → åpner bekreftelses-flyt (egen prompt)
- "Rediger profil" → prompt-01-modal

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG ikoner
- Responsiv: kortene stables på mobil (allerede single-column)
- Bevart fokus-ring forest 2px på alle interaktive elementer
