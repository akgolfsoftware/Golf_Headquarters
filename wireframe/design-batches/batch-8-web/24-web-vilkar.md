# AK Golf Web — Brukervilkår

## Identitet

- **Produkt:** Web
- **URL:** `/vilkar`
- **Arketype:** Web — legal long-form
- **HTML-referanse:** `wireframe/screen-deck/web/vilkar.html`
- **Audit:** `wireframe/audit/web-vilkar.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Vilkar for bruk av tjenestene + appen. Definerer rettigheter og plikter
mellom AK Golf Group og kunder. Linker fra checkout og signup. Maa veere
juridisk solid men lesbar.

## Layout — UNIKT

Samme grunn-layout som /personvern:
- Subhero (kort, 64px)
- Sticky TOC venstre
- Long-form content sentrert max 720px
- Footer

### 1. Subhero (#0A1F18 gradient, 64px)

- Eyebrow: `BRUKERVILKAR`
- H1: `*Spillereglene*. For begge.`
- Sub: `Sist oppdatert: 10. mai 2026.`

### 2. TOC (sticky, 280px venstre)

1. Avtalen
2. Vare tjenester
3. Pris og betaling
4. Avbestilling og refusjon
5. Brukerprofil og innhold
6. Akseptert atferd
7. Immaterielle rettigheter
8. Ansvarsfraskrivelse
9. Endringer i vilkar
10. Tvister og loving

### 3. Long-form content (narrow 720px)

Per seksjon:
- H2 (Inter Tight 28px italic accent)
- Body (Inter 16px, line-height 1.7)
- Numererte/punkt-lister
- Tabeller hvor relevant

**Hovedpunkter:**

**Avtalen** — Mellom AK Golf Group AS (org. 920 117 824) og bruker.

**Tjenester** — 1:1 coaching, junior, talent, voksen-abonnement, bedrift, klubb, anlegg-leie.

**Pris og betaling** — Maanedlig eller per okt, Stripe-betaling, MVA inkludert.

**Avbestilling og refusjon**
- Abonnement: kan avbestilles nar som helst, lopper ut maaneden
- 1:1: avbestilling >24t = full refusjon, 12-24t = 50%, <12t = 0%
- Sykdom med doc: 100% refusjon

**Resterende seksjoner:** standard.

### 4. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| TOC-lenke | default, hover, active section |
| Inline lenke | default, hover (lime) |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full vilkar-side i lyst tema
2. Mobil <=640px — TOC blir collapsible
3. TOC i scroll-state (seksjon 4 aktiv)

## Ikke-mål

- Ikke designe forskjellige vilkar per tjeneste
- Ikke include accept-checkbox-flyt (det er paa checkout)

## Når du er ferdig

Lim design-link tilbake.
