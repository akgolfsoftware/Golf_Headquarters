# AK Golf Web — For klubber (B2B)

## Identitet

- **Produkt:** Web
- **URL:** `/for-klubber`
- **Arketype:** Web — landing med mørk hero (B2B-pitch)
- **HTML-referanse:** `wireframe/screen-deck/web/for-klubber.html`
- **Audit:** `wireframe/audit/web-for-klubber.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

B2B-pitch til golfklubber. Selger sportsplan + coach-utvikling + AI-coach
plattform. Malgruppen er klubb-styrer og daglig leder. Konvertering = book
introduksjons-mote, ikke direkte signering.

## Layout — UNIKT

### 1. Mørk hero (#0A0A0A, 120px+140px)

- Eyebrow (mono lime): `FOR GOLFKLUBBER`
- H1 (84px): `Vi bygger *Norges sterkeste* klubber.`
- Sub: `Sportsplan, coach-utvikling og AI-coach-plattform — komplett pakke for klubber som vil heve nivaet.`
- Specs-rad (mono): `4 KLUBBER I DAG · BOSSUM · GFGK · DROBAK · 1 KOMMENDE`
- CTAs: `Book mote →` (lime) + `Last ned brosjyre (PDF)` (outline white)

### 2. Hva vi tilbyr (lys, 96px)

`Tre soyler. En komplett pakke.`
3 store cards (numrert 01/02/03):

**01 Sportsplan**
- Skreddersydd 12-24 mnd plan for junior, voksen, talent
- Alders-tilpassede oevelser, periodisering, tester
- Workshop med klubb-coachene 2x/aar
- Levering: PDF + lopende oppfolging

**02 Coach-utvikling**
- 6 mnd mentor-program for klubb-coaches
- Shadow-okter med Anders + tilbakemelding
- AI-coach-verktoy for daglig bruk
- Sertifiseringskurs (NGF-godkjent)

**03 AK Golf HQ-plattform**
- Hver klubbmedlem far PlayerHQ-app
- Klubb-coach far CoachHQ-tilgang
- Felles spillerprofil pa tvers
- Branded for klubben (white-label option)

### 3. Resultater fra eksisterende klubber (lys-sand, 96px)

3 klubb-cards:

**GFGK (Gamle Fredrikstad)**
- 380 medlemmer, samarbeid siden 2018
- 4 NGF-poeng-spillere utviklet
- Junior-medlemskap +47% siste 3 ar
- Sitat fra sportssjef

**Bossum (Drobak)**
- 240 medlemmer, samarbeid siden 2022
- 12 spillere fra HCP 14+ til < 10
- Brukt som test-anlegg for AI-coach

**Drobak GK**
- 320 medlemmer, samarbeid siden 2024
- 100% av junior-trenere sertifisert
- Sitat fra daglig leder

### 4. Pris-modell (lys, 96px)

`Hva koster det?`
Tabell med 3 pakker:

| Pakke | Innhold | Pris |
|---|---|---|
| Basis | Sportsplan + 4 workshops/aar | 80 000 kr/aar |
| Pluss | Basis + coach-mentoring + plattform | 180 000 kr/aar |
| Premium | Pluss + dedikert coach + branded plattform | Skreddersydd |

CTA: `Snakk om hva som passer →`

### 5. Prosess (lys-sand, 96px)

5-stegs prosess:
1. **Mote (90 min)** — Vi forstaar klubben
2. **Tilbud (1 uke)** — Skreddersydd plan
3. **Avtale (1 uke)** — Vi signerer
4. **Onboarding (4 uker)** — Sportsplan + plattform satt opp
5. **Lopende (12+ mnd)** — Vi leverer + maaler resultater

### 6. FAQ (lys, 64px)

8 vanligste klubb-sporsmal.

### 7. Mørkt CTA-band

`Klar for et mote?` -> `Book 90 min mote →` (lime) + `Send oss epost →` (outline)
Sub: `Vi reiser til klubben. Ingen binding pa motet.`

### 8. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hero CTA "Book mote" | default, hover, active, focus |
| Brosjyre-CTA | klikk -> last ned PDF |
| Pakke-rad | default, hover (subtle bg-shift) |
| Klubb-card | default, hover (lift) |
| Steg-card | default, hover |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full B2B-side i lyst tema
2. Mobil <=640px — alle grid-er stables
3. Hover pa "Pluss"-pakke-rad
4. PDF-download CTA i hover

## Ikke-mål

- Ikke include online-signing
- Ikke include klubb-portal-login (egen kommende produkt)

## Når du er ferdig

Lim design-link tilbake.
