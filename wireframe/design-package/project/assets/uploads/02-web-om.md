# AK Golf Web — Om

## Identitet

- **Produkt:** Web
- **URL:** `/om`
- **Arketype:** Web — subhero + editorial long-form
- **HTML-referanse:** `wireframe/screen-deck/web/om.html`
- **Audit:** `wireframe/audit/web-om.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Om-siden bygger merkevare-tillit. Forteller hvem AK Golf er, hvor det
kommer fra, hvorfor det finnes. Konverterer ikke direkte, men reduserer
friksjon for senere konvertering. Anders Kristiansen sin personlige historie
er hjertet i siden — han er merkevaren.

## Layout — UNIKT

### 1. Subhero (#0A1F18 -> #143027 gradient, 80px)

- Eyebrow (mono lime): `OM AK GOLF`
- H1 (Inter Tight 56px): `Vi bygger Norges *beste* coaching-miljø.`
- Sub: `Fra 1:1-økter på Bossum til talent-utvikling for landslagskandidater. Drevet av data, hjertet i Fredrikstad.`

### 2. Anders' historie (lys, 96px, asymmetrisk 2-kol)

Venstre (40%): Stort portrett (avatar-circle 240px med initial "AK" hvis ikke bilde)
Høyre (60%):
- Eyebrow: `GRUNNLEGGER`
- H2 (italic): `Anders Kristiansen.`
- 4 paragraffer: PGA-coach siden 2008, 16 år erfaring, jobbet med 200+ spillere
  fra junior til Challenge Tour. Bygget AK Golf Academy 2020. CEO i AK Golf Group.
- Sitat (Inter Tight italic 22px): *"Coaching er ikke å fortelle folk hva de skal gjøre. Det er å hjelpe dem se hva de allerede vet."*

### 3. Verdier (lys, 96px)

3 cards:
- **Data over magefølelse** — Hver beslutning støttes av målbare data fra TrackMan, Foresight og runde-statistikk
- **Sannhet over komfort** — Vi sier det vi mener. Konstruktiv ærlighet er raskere enn høflig dans
- **Lange spor over raske wins** — Vi bygger spillere over år, ikke uker

### 4. Tidslinje (lys-sand #F5F4EE, 96px)

Vertikal tidslinje med 6 milepæler:
- 2008 — Anders blir PGA-coach
- 2018 — Starter samarbeid med GFGK
- 2020 — AK Golf Academy etableres
- 2022 — Mulligan Indoor åpner i Fredrikstad
- 2024 — Talent-program lanseres
- 2026 — AK Golf HQ-plattformen i drift

### 5. Team-teaser (lys, 96px)

`Vi er fem dedikerte.`
4 mini-coach-cards i grid (Anders + Julie Solem + Markus + Sara) med
`Se hele teamet →` som leder til `/coaches`.

### 6. Mørkt CTA-band

`Vil du bli en del av historien?` -> `Bli spiller →` + `Bli coach →`

### 7. Mega-footer

## Klikkbare elementer

| Element | States |
|---|---|
| Tidslinje-milepæl | default, hover (lime accent prikk vokser) |
| Coach-card | default, hover, klikk -> coach-profil |
| Sitat | static |

## Empty / loading / error

Statisk innhold — ingen empty/loading-states.

## Ønsket output fra Claude Design

1. Full side i lyst tema
2. Mobil <=640px — tidslinje blir vertikal stack med datoer venstre
3. Hover på tidslinje-milepæl

## Ikke-mål

- Ikke vise alle coach-detaljer (egen `/coaches`)
- Ikke vise alle case-studies (egen `/cases`)

## Når du er ferdig

Lim design-link tilbake.
