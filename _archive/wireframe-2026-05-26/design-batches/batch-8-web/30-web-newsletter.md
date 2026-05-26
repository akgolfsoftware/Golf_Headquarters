# AK Golf Web — Newsletter-signup (komponent + landing)

## Identitet

- **Produkt:** Web (komponent + standalone-side)
- **URL:** `/nyhetsbrev` (standalone) + brukes pa /index, /blogg, /blogg/[slug], footer
- **Arketype:** Web — signup-form
- **HTML-referanse:** `wireframe/screen-deck/web/newsletter.html`
- **Audit:** `wireframe/audit/web-newsletter.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva komponenten er for

Newsletter-signup er den primaere ikke-konverterings-CTA. Bygger epost-liste
for senere konvertering. Innhold: 1 epost/mnd med beste blogg-artikkel +
oppsummering. Skal eksistere i 4 varianter (mini-footer, blogg-CTA, mid-page-band,
standalone landing).

## Layout — UNIKT

### Variant A — Mini (i footer)

Allerede beskrevet i `28-web-footer-mega.md`. Email-input + Abonner-knapp.

### Variant B — Mid-page CTA-band (mørkt #0A1F18)

Sentrert i band, padding 80px:
- Eyebrow (mono lime): `NYHETSBREV`
- H2 italic: `Faa neste artikkel i innboksen.`
- Sub: `1 epost i maneden. Beste artikkel + ekspert-tips. Aldri spam.`
- Form (sentrert, max 480px):
  - Email-input (mørk variant)
  - Abonner-knapp (lime pill, til hoyre eller under)
- Mikro-tekst under: `Avmeldng nar som helst. GDPR-paatrykt.`

### Variant C — Blogg-artikkel inline-CTA (lys-sand)

Vises midt i blogg-artikkel etter ~50% scroll. Card med:
- Eyebrow: `LIKER DU DETTE?`
- H3 (Inter Tight 22px): `Faa nye artikler i innboksen.`
- Sub: `1 epost/mnd. 1 minutt aa lese.`
- Form: Email + Abonner

### Variant D — Standalone landing (`/nyhetsbrev`)

Egen full side:

**1. Subhero (#0A1F18 gradient, 80px)**
- Eyebrow: `NYHETSBREV`
- H1: `Lytt med pa *innsiden*.`
- Sub: `1 epost/mnd. Coaching-innsikt, TrackMan-data, og hva vi tenker pa.`

**2. Hva far du (lys, 96px, narrow 720px)**
3-stegs forklaring:
- 1 epost i maneden — Aldri mer
- Beste blogg-artikkel + 3 quick-tips
- Innsikt fra Anders du ikke ser pa SoMe

**3. Signup-form (lys, 64px, sentrert max 480px)**
- Felt 1: Fornavn (text)
- Felt 2: Epost (email, required)
- Felt 3 (optional): Hva interesserer deg mest? (select: Junior / Voksen-coaching / Talent / TrackMan-data / Generelt)
- Submit: `Meld meg pa →` (lime full bredde)
- Mikro-tekst: GDPR + avmeldings-info

**4. Eksempel-utgaver (lys-sand, 64px)**
3 forrige nyhetsbrev-thumbnails som social proof:
- Mai 2026: "AoA-analyse + 3 tips"
- April 2026: "Markus' vei til +0.4"
- Mars 2026: "Hva kjennetegner gode amatorer"

CTA: `Se alle tidligere utgaver →`

**5. Footer**

## Klikkbare elementer

| Element | States |
|---|---|
| Email-input | default, focus, valid, error, with-text, clear-button |
| Fornavn-input | default, focus, with-text |
| Select dropdown | default, focus, open, item-hover, selected |
| Abonner-knapp | default, hover (scale 1.02), active, loading (spinner), success, disabled |
| Eksempel-utgave-thumbnail | default, hover (lift), klikk -> arkiv |

## Empty / loading / error

- **Submit loading:** Knapp blir `Sender...` med spinner
- **Submit success:** Form erstattes med:
  - CheckCircle2 lime
  - H3: `Tusen takk! Sjekk innboksen din.`
  - Sub: `Vi har sendt en bekreftelses-epost. Klikk lenken for aa fullfore.`
- **Submit error:** Toast `Noe gikk galt. Proev igjen.`
- **Email duplikat:** Inline `Du er allerede paameldt :)`
- **Ugyldig epost:** Inline rod `Vennligst skriv inn en gyldig epost`

## Ønsket output fra Claude Design

Alle 4 varianter pluss states:

1. **Variant A** (footer mini) — beskrevet i 28
2. **Variant B** (mørkt CTA-band) — sentrert i band
3. **Variant C** (blogg-artikkel inline-CTA) — lys-sand card
4. **Variant D** (standalone /nyhetsbrev) — full side
5. Submit success-state (form erstattet med thank-you)
6. Mobil <=640px — alle varianter stables (knapp under input)

## Ikke-mål

- Ikke include avansert segmentering (kun en `interesse`-felt)
- Ikke designe "unsubscribe"-flyt (haandteres av Mailchimp/lignende)
- Ikke include double-opt-in-konfirmasjon-side (egen sub)

## Når du er ferdig

Lim design-link tilbake.
