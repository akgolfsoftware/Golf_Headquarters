# Prompt 02 — Oppgrader til Pro (multi-step flyt)

## Hensikt
Konvertere gratis-bruker til Pro-abonnent (300 kr/mnd) gjennom en strukturert 3-stegs flyt med tydelig verdi-fortelling.

## Trigger
CTA `Oppgrader til Pro` på `/portal/meg/abonnement`, paywall-sheets, eller låst funksjonalitet. Også fra command-palette.

## Layout
Full-screen modal/route på `/portal/meg/abonnement/oppgrader-pro`. Tre steg: (1) Verdi-presentasjon, (2) Bekreft plan + faktureringsadresse, (3) Betalingsmetode + bekreft. Progress-bar topp (3 prikker forest/cream). "Tilbake"-link øverst venstre.

## Komponenter
- Stegindikator: tre prikker + numerering "Steg 2 av 3"
- Verdikort grid: 6 fordeler med Lucide-ikoner (sparkles, target, video, calendar, bar-chart, users)
- Plan-summary-kort med pris/mnd + total/år
- Stripe Card Element-placeholder (kort, utløp, CVC)
- Trygghets-row: "Avbryt når som helst · 30 dagers angrerett"
- Final CTA: `Bekreft og start Pro — 300 kr/mnd`

## Eksempel-data
- Spiller: Markus R.P.
- Nåværende plan: Gratis
- Ny plan: Pro 300 kr/mnd
- Første faktura: 19. juni 2026
- Inkludert: AI-coach, 4 coaching-credits, videoanalyse, ubegrenset historikk

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (steg-titler), Inter (UI), JetBrains Mono (priser), Instrument Serif italic ("Pro" badge sparsom)
- Lucide-ikoner stroke 1.75
- Lime-badge `Pro` med forest-tekst i top-bar
- Norsk bokmål, ingen emojier

## Form-felter (steg 2-3)
- `faktureringsnavn` text required
- `adresse` text required
- `postnummer` text 4 siffer required
- `poststed` text required
- `kortnummer` Stripe Element required
- `utløp` MM/YY required
- `cvc` 3 siffer required

## Submit / actions
- Steg 1 `Fortsett` → Steg 2
- Steg 2 `Fortsett til betaling` → Steg 3
- Steg 3 `Bekreft og start Pro` → POST `/api/portal/subscriptions/upgrade` → success-route `/portal/meg/abonnement/velkommen-pro`
- Feil: rød banner "Kortet ble avvist. Prøv et annet kort."

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Stripe-elementene er placeholders med riktig styling, ikke ekte JS-integrasjon
- Norsk valutaformat: `300 kr/mnd`, `3 600 kr/år`
- Min 8pt-grid på alle padding/margin
- A11y: tab-rekkefølge gjennom steg, ARIA-live på stegskifte
