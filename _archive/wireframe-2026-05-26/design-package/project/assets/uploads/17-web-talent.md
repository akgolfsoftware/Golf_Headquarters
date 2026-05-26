# AK Golf Web — Talent-program

## Identitet

- **Produkt:** Web
- **URL:** `/talent`
- **Arketype:** Web — landing med mørk hero (talent-pitch)
- **HTML-referanse:** `wireframe/screen-deck/web/talent.html`
- **Audit:** `wireframe/audit/web-talent.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Talent-programmet er hjertet i AK Golf Academy. Gratis for utvalgte 14-22-aaringer
som sikter mot NGF-rangering, college eller pro-tour. Skal posisjoneres som
selektivt og prestisjefylt — ikke noe alle kan kjope seg inn i.

## Layout — UNIKT

### 1. Mørk hero (#0A0A0A, 120px+140px)

- Eyebrow (mono lime): `TALENT-PROGRAM · INVITE-ONLY`
- H1 (84px): `*De beste*. Vi finner dem.`
- Sub: `Norges mest selektive talent-program for golfere 14-22 ar. Gratis for de utvalgte.`
- Specs-rad (mono): `8 SPILLERE I PROGRAMMET · 4 NGF-RANGERTE · GRATIS FOR UTVALGTE`
- CTAs: `Soek seleksjon →` (lime) + `Hva kreves?` (outline)

### 2. Hva er talent-programmet (lys, 96px, narrow 880px)

Editorial long-form (3-4 paragraffer):
- Bakgrunn — startet 2024, finansiert av Skarpnord Invest
- Filosofi — vi tror norske talenter ikke trenger aa reise utenlands
- Hva inkluderes — alt: coaching, plattform, fysio, mental, reise til turneringer
- Forpliktelse fra spiller — 6 dager/uke trening, fokus pa skole + golf

### 3. Hva inkluderer programmet (lys-sand, 96px, grid-3)

6 cards:
- **Coaching (alt)** — 1:1 med Anders + spesialister, 4-6 okter/uke
- **TrackMan + Foresight** — Ubegrenset tilgang Mulligan
- **Fysio + styrke** — Samarbeid med Olympiatoppen Sor-Norge
- **Mental coaching** — Sportspsykolog 1x/maned
- **Tournament-stotte** — Reise + entry-fee opp til 80 000 kr/aar
- **WANG-skoleplass** — Skole-tilbud i Fredrikstad

### 4. Spillerne i programmet (lys, 96px)

`8 spillere — alle ekte.`
8 spiller-mini-cards med foto + alder + HCP + kort progresjon-statistikk.
Eksempler:
- Markus R. Pedersen — 22 ar — HCP +0.4 (fra 14 i 2024)
- Lina Hellesund — 17 ar — HCP 4.1 (fra 8.2 i 2024)
- Mads Roenning — 19 ar — HCP +1 (fra 6 i 2024)
- ... + 5 til

CTA: `Se alle suksesshistorier →`

### 5. Soeknads-prosess (lys-sand, 96px)

5-stegs prosess:
1. **Soknad (online)** — Kort skjema, video-clip av sving
2. **Screening (Anders)** — Vi inviterer 30 til screening-okt
3. **Tryout-helg** — 12 inviteres til 2 dager pa Mulligan
4. **Beslutning** — 2-4 nye spillere tas opp/aar
5. **Onboarding** — Forste 4 uker satt opp

### 6. Krav (lys, 64px)

Sjekk-liste hva vi ser etter:
- HCP < 8 ved soknad (idealt)
- 14-22 ar
- Forpliktelse 6 dager/uke trening
- Skole eller fulltids golf
- Norge-bosatt

### 7. FAQ (lys, 64px)

6 vanligste talent-sporsmal.

### 8. Mørkt CTA-band

`Tror du har det som kreves?` -> `Send soknad →` (lime) + `Snakk med Anders forst →` (outline)

### 9. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hero CTA "Soek seleksjon" | default, hover, active, focus |
| Spiller-card | default, hover, klikk -> case-detalj |
| Steg-card | default, hover |
| Krav-sjekkliste | static |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full talent-side i lyst tema
2. Mobil <=640px — grid-3 blir 1-kol
3. Hover pa Markus-card

## Ikke-mål

- Ikke designe soknads-skjema (egen sub-side eller modal)
- Ikke include online video-upload

## Når du er ferdig

Lim design-link tilbake.
