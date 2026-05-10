# AK Golf Web — For bedrifter

## Identitet

- **Produkt:** Web
- **URL:** `/for-bedrifter`
- **Arketype:** Web — landing med mørk hero (B2B-pitch)
- **HTML-referanse:** `wireframe/screen-deck/web/for-bedrifter.html`
- **Audit:** `wireframe/audit/web-for-bedrifter.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

B2B-pitch til bedrifter. Selger gruppe-coaching, kundeevents og firma-medlemskap
til Mulligan Indoor. Malgruppe: HR, marketing, salgsledere som vil bruke golf
som relasjonsbygging eller medarbeider-perk.

## Layout — UNIKT

### 1. Mørk hero (#0A0A0A, 120px+140px)

- Eyebrow (mono lime): `FOR BEDRIFTER`
- H1 (84px): `Golf som *konkurransefortrinn*.`
- Sub: `Kundeevents, medarbeider-perks og lederutvikling — vi skreddersyr for bedriften din.`
- Specs-rad (mono): `5+ ANSATTE · FRA 8 000 KR/MND · 30+ BEDRIFTER`
- CTAs: `Snakk med oss →` (lime) + `Last ned brosjyre (PDF)` (outline white)

### 2. Tre bruksomraader (lys, 96px)

`Hva bruker bedrifter oss til?`
3 cards:

**Kundeevents**
- Helkvelder pa Mulligan Indoor for 8-24 gjester
- Coaching + simulator-konkurranse + bevertning
- Branded med firma-logo
- Fra 12 000 kr/event

**Medarbeider-perk**
- Firma-abonnement: 5+ ansatte far Pro-tilgang
- 1:1-okter rabattert
- Manedlig bedrifts-turnering
- Fra 8 000 kr/mnd

**Lederutvikling**
- Sportstrening-prinsipper for ledergrupper
- 6 mnd program med Anders
- Mental fokus + prestasjonscoaching
- Fra 60 000 kr/program

### 3. Eksempler (lys-sand, 96px, grid-2)

4 case-mini-cards med firma-navn (anonymisert eller godkjent):

**Tech-firma (50 ansatte)** — Quarterly events + 8 abonnement
**Konsulent-selskap (15 ansatte)** — Medarbeider-perk + lederprogram
**Bank-region (200 medarbeidere)** — Aarlig kundeevent + 12 abonnement
**Eiendomsutvikler (8 ansatte)** — Lederutvikling 6 mnd

### 4. Slik fungerer det (lys, 96px)

4-stegs prosess:
1. **Behovsamtale (30 min)** — Hva trenger dere?
2. **Skreddersydd tilbud (1 uke)** — Vi designer noe som passer
3. **Kickoff** — Forste event eller okt
4. **Lopende dialog** — Vi justerer underveis

### 5. Pris-modell (lys-sand, 64px)

3 pakker som tabell:

| Pakke | Ansatte | Innhold | Pris |
|---|---|---|---|
| Smaa | 5-15 | Pro-abonnement + 4 events/aar | Fra 8 000 kr/mnd |
| Medium | 15-50 | Smaa + dedikert coach + 8 events | Fra 18 000 kr/mnd |
| Stor | 50+ | Skreddersydd | Pris pa forespoersel |

### 6. Sitater (lys, 64px)

2 sitater fra HR/marketing-ledere:
- *"Vart kundeevent pa Mulligan ble nevnt i 6 maneder etterpa."*
- *"Tilbudet vi gir ansatte gir oss en fordel ved rekruttering."*

### 7. FAQ (lys, 64px)

6 vanligste bedrift-sporsmal.

### 8. Mørkt CTA-band

`Klar for samtale?` -> `Snakk med oss →` (lime) + `+47 482 35 700` (outline)

### 9. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hero CTA | default, hover, active, focus |
| Bruksomraade-card | default, hover (lift) |
| Eksempel-card | default, hover (lift + ring) |
| Pakke-rad | default, hover |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full bedrift-side i lyst tema
2. Mobil <=640px — alle grid-er stables
3. Hover pa "Medarbeider-perk"-card
4. Pakke-tabell-rad i hover

## Ikke-mål

- Ikke include online booking-kalender
- Ikke include faktura-forhandling

## Når du er ferdig

Lim design-link tilbake.
