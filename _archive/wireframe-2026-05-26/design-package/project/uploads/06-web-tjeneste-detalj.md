# AK Golf Web — Tjeneste-detalj

## Identitet

- **Produkt:** Web
- **URL:** `/tjenester/[slug]` (eks. `/tjenester/1-1-coaching`)
- **Arketype:** Web — long-form sales-side
- **HTML-referanse:** `wireframe/screen-deck/web/tjeneste-detalj.html`
- **Audit:** `wireframe/audit/web-tjeneste-detalj.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Detaljside for én tjeneste. Komplett salgs-narrative: hva tjenesten er,
hvem den er for, hva som inkluderes, pris, social proof, FAQ, CTA. Bruker
1:1-coaching som referanse-template — same skal fungere for alle 8 tjenester.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px, asymmetrisk)

Venstre (60%):
- Eyebrow: `1:1 COACHING`
- H1: `Personlig coaching som *gir resultater*.`
- Sub: `60-90 minutter. TrackMan eller utendørs. Anders eller en spesialist-coach.`
- Specs-rad (mono): `60-90 MIN · TRACKMAN · ALLE NIVÅER`

Høyre (40%): Pris-card (sticky):
- Pris (32px): `1 600 kr`
- Sub: `per time, alt inkludert`
- Bullets: 60-90 min · TrackMan-data · Skriftlig oppsummering · Plan etter
- CTA: `Book intro →` (lime full-bredde)
- Sub-CTA: `Spørsmål? Ring 482 35 700`

### 2. Hva er inkludert (lys, 96px)

`Hva får du?` 6 cards i grid-3:
- **Pre-økt-samtale (10 min)** — Vi snakker om mål, utfordringer, fokus
- **TrackMan-økt (60 min)** — Du slår, vi måler. Carry, spinrate, smash, AoA
- **Video-analyse** — Slow-motion fra 2 vinkler, side-by-side med modell
- **Skriftlig oppsummering** — Send på epost samme dag, key takeaways
- **Personlig plan** — Hva du skal trene på neste 2 uker
- **Oppfølging** — Sjekk inn på epost etter 7 dager

### 3. Hvem passer det for (lys-sand, 64px)

3 personas:
- **Begynneren** — Du har spilt < 1 år, vil ha riktig grunnlag
- **Voksen-amatør** — HCP 10-25, vil bryte gjennom platået
- **Konkurranse-spiller** — HCP < 10, sikter mot turneringer eller ranking

### 4. Slik fungerer det (lys, 96px)

4-stegs prosess:
1. **Book** — Ring eller bruk kontaktskjema
2. **Intro-samtale** — 15 min på telefon, gratis
3. **Forste okt** — Pa Mulligan Indoor eller GFGK Range
4. **Plan + oppfølging** — Du får skriftlig plan + invitt til neste okt

### 5. Testimonials (lys-sand, 64px)

3 sitater fra spillere som har brukt 1:1:
- *"Anders ser ting i svingen min ingen andre har sett pa 10 ar."* — Tor Erik K.
- *"En time her er verdt 5 timer alene pa range."* — Lina H.
- *"Best brukte 1 600 kr pa 12 maneder."* — Hanne S.

### 6. FAQ (lys, 64px)

8 sporsmal med expand/collapse:
- Hva er forskjellen pa 1:1 og abonnement?
- Kan jeg velge coach?
- Hva hvis jeg ikke har TrackMan-erfaring?
- Refunderes okter ved sykdom?
- Tilbyr dere video-coaching online?
- Hva med utstyr — har jeg behov for noe?
- Kan jeg booke flere okter pa rad?
- Hvordan betaler jeg?

### 7. Mørkt CTA-band

`Klar til å starte?` -> `Book intro →` (lime) + `Se alle tjenester →` (outline)

### 8. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Sticky pris-card | follows scroll until footer |
| Pris-card CTA | default, hover (scale 1.02), active, focus |
| Steg-card | default, hover (lift) |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

- **404 ukjent slug:** redirect til /tjenester
- **Loading:** SSR

## Ønsket output fra Claude Design

1. 1:1-coaching i lyst tema, full side
2. Mobil <=640px — sticky pris-card blir bunn-bar (sticky bottom)
3. FAQ med 2 åpne rader
4. Variant: Junior Academy med samme template (annerledes pris, persona, prosess)

## Ikke-mål

- Ikke include kalender-widget for booking (lenker til /kontakt)
- Ikke designe checkout-flyt

## Når du er ferdig

Lim design-link tilbake.
