# AK Golf Web — Junior Academy

## Identitet

- **Produkt:** Web
- **URL:** `/junior`
- **Arketype:** Web — landing med mørk hero (foreldre-pitch)
- **HTML-referanse:** `wireframe/screen-deck/web/junior.html`
- **Audit:** `wireframe/audit/web-junior.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Junior-programmet (7-17 ar) selges til foreldre, ikke barn. Tone-of-voice
ma vaere trygg, faglig, og focusere pa "barnet utvikler seg + har det goy".
Pris: 1 200 kr/mnd inkluderer alt.

## Layout — UNIKT

### 1. Mørk hero (#0A0A0A, 120px+140px)

- Eyebrow (mono lime): `JUNIOR ACADEMY · 7-17 AR`
- H1 (84px): `*Goey golf*. Skikkelig coaching.`
- Sub: `2 okter i uka. Helg-camps. Foreldre-app. Alt inkludert for 1 200 kr/mnd.`
- Specs-rad (mono): `48 BARN I 2026 · 4 GRUPPER · BOSSUM + DROBAK GK`
- CTAs: `Meld pa →` (lime) + `Bestill provetime →` (outline)

### 2. Hvorfor junior hos AK Golf (lys, 96px, grid-3)

3 cards:
- **Goey forst, alvor sa** — Vi gjor golf goey, sa kommer prestasjonen av seg selv
- **Faglig basis** — Jenter og gutter trener separat etter 12 ar (nyere forskning)
- **Foreldre-portal** — Du foelger med pa fremgang i appen

### 3. Hva far barnet (lys-sand, 96px, grid-2)

6 cards:
- **2 trenings-okter/uke** — Etter skoletid, 90 min hver
- **Coach Julie (12-17)** eller **Coach Sara (7-11)** — Spesialister pa alder
- **Camp i sommerferien** — 4 dager intensiv (inkludert)
- **Baneturnering hver mnd** — 9-hulls med premier
- **Eget utstyr-tilpasning** — Mizuno-fitting 1x/aar
- **PlayerHQ-app for barnet** — Logg runder, oeve, tester

### 4. Aldersgrupper (lys, 96px)

4 grupper i tabell:

| Gruppe | Alder | Coach | Anlegg | Tid |
|---|---|---|---|---|
| Mini | 7-9 | Sara | Bossum (sommer) | Tirsdag 17:00, Lørdag 10:00 |
| Junior | 10-12 | Sara | Bossum + Mulligan | Onsdag 17:00, Lørdag 11:00 |
| Talent jr | 13-15 | Julie | Drobak + Mulligan | Mandag 17:30, Torsdag 17:30 |
| Senior jr | 16-17 | Julie | Drobak + Mulligan | Tirsdag 18:00, Fredag 17:00 |

### 5. Foreldre sier (lys-sand, 64px)

3 sitater fra foreldre:
- *"Datteren min gleder seg til hver onsdag pa Bossum. Det sier alt."* — Linda Solberg
- *"Beste investeringen for sonnen min."* — Per Hansen
- *"Sara er fantastisk med 8-aaringer. De ler hele tiden, og laerer."* — Kari Mobakken

### 6. Pris (lys, 96px, sentrert)

Stort pris-display:
- `1 200 kr/mnd` (mono 48px)
- `alt inkludert. ingen skjulte kostnader.`
- Bullets:
  - 2 okter/uke
  - Sommercamp
  - Manedsturneringer
  - PlayerHQ-app
  - Foreldre-portal
  - Ingen binding

CTA: `Meld pa →` (lime full bredde max 400px)

### 7. Slik melder du pa (lys-sand, 64px)

3 stegs:
1. Fyll ut skjema
2. Vi ringer for kort introsamtale
3. Forste okt innen 1 uke

### 8. FAQ (lys, 64px)

6 vanligste foreldre-sporsmal.

### 9. Mørkt CTA-band

`Klart for forste okt?` -> `Meld pa →` (lime) + `Bestill provetime gratis →` (outline)

### 10. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hero CTA | default, hover, active, focus |
| Aldersgruppe-rad | default, hover (subtle bg-shift), klikk -> mer info |
| Sitat | static |
| Pris-CTA | default, hover (scale 1.02), active |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full junior-side i lyst tema
2. Mobil <=640px — alt stables
3. Hover pa "Talent jr"-rad
4. Pris-CTA i hover

## Ikke-mål

- Ikke designe pamelding-skjema (egen sub-side)
- Ikke include kalender-widget

## Når du er ferdig

Lim design-link tilbake.
