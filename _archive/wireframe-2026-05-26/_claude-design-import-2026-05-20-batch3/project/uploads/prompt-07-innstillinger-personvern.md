# Prompt 07 — Personvern-innstillinger

## Hensikt
GDPR-compliance: gi spilleren kontroll over datadeling, profil-synlighet, eksport og rett til sletting.

## Trigger
`/portal/meg/innstillinger/personvern`.

## Layout
Standard portal-side, maks-bredde 720px. Header "Personvern og data". Body i tre seksjoner: (1) Synlighet, (2) Datadeling, (3) Dine rettigheter (GDPR-actions).

## Komponenter
- Seksjon 1 Synlighet: 4 toggles
  - Profil synlig på leaderboard
  - HCP synlig for klubbkamerater
  - Vis "Sist aktiv"
  - La andre invitere meg til utfordringer
- Seksjon 2 Datadeling: 3 toggles
  - Del data med tilkoblet coach
  - Anonymisert bruk for produkt-forbedring
  - Markedsføring og personlige tilbud
- Seksjon 3 GDPR: tre kort
  - "Last ned dataene mine" → genererer ZIP
  - "Rett feil i opplysninger" → e-post til support
  - "Slett kontoen min permanent" → destructive flyt

## Eksempel-data
- Markus R.P., 18 år (myndig nok til selv å håndtere personvern)
- Profil synlig: PÅ
- HCP synlig: PÅ
- Sist aktiv: AV
- Coach-deling: PÅ (Hans Brennum)
- Sist data-eksport: aldri
- Konto opprettet: 19. januar 2026

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843, destructive #A32D2D)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (datoer), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (lock, eye, eye-off, download, edit, trash)
- Norsk bokmål, ingen emojier

## Form-felter
- 7 toggles for synlighet/deling
- 3 action-knapper for GDPR-rettigheter

## Submit / actions
- Toggle: PATCH `/api/portal/privacy/preferences` (auto-save)
- Last ned data: POST `/api/portal/me/export-data` → e-post med lenke innen 24 t
- Rett feil: åpner e-postklient med pre-utfylt mailto: til support
- Slett kontoen: åpner destructive flyt (egen prompt — onboarding-flyt har sletting i siste steg)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Alle GDPR-actions skal logges (TODO comment om audit-log)
- Norsk bokmål, formelle setninger der det handler om rettigheter
- A11y: tydelige aria-describedby som forklarer konsekvens av hver toggle
