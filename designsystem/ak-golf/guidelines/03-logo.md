# 3 · Logoen

Merket er en `ak`-ligatur i tekstfargen `#1F1D1A` med en signalrød sirkel
`#B83217` over k-en (`#E8654A` på mørk flate). Sirkelen er ballen. Den er det
eneste fargede elementet, og den bærer hele merkets identitet i én form.

Filene ligger i `public/logos/`, nitten filer, alle vektor:

| Fil | Brukes på |
|---|---|
| `ak-golf-logo-primary-on-light.svg` | Betonggrå og hvit flate — **standardvalget** |
| `ak-golf-logo-primary-on-dark.svg` | Mørk flate |
| `ak-golf-logo-white-on-dark.svg` | Foto og film, mørk bakgrunn |
| `ak-golf-logo-white-mono.svg` | Én farge, hvit — brodering, gravering, trykk |
| `ak-golf-logo-black-mono.svg` | Én farge, sort — faks, stempel, avis |
| `ak-golf-logo-primary-mono.svg` | Én farge, signalrød |
| `ak-golf-logo-white-on-green.svg` | Historisk. **Bruk ikke i nytt materiell** |
| `ak-golf-merke-kvadrat.svg` | Profilbilder — 78 % dekning, skarpe hjørner |
| `ak-golf-favicon.svg` | Nettleserfane — 94 % dekning, leses ned til 16 px |
| `ak-golf-laas-<variant>[-pa-morkt].svg` | Logo + virksomhetsnavn, låst sammen. Fem varianter × lys/mørk = ti filer |

## Klaringssone

Rundt logoen skal det være fritt rom tilsvarende **halve logoens høyde** på
alle fire sider. Ingenting går inn i den sonen: ikke tekst, ikke kant, ikke et
bildeutsnitt, ikke en annen logo.

## Minstestørrelse

| Flate | Minste bredde |
|---|---|
| Skjerm | 24 px |
| Trykk | 12 mm |

Under det forsvinner ballen, og merket blir en uleselig bokstavklump.

## Aldri

- Aldri endre farge på ligaturen eller ballen utover variantene over.
- Aldri strekke, skjeve, rotere eller legge skygge på logoen.
- Aldri legge logoen på et fotoparti som gjør ballen utydelig — flytt den, eller
  bruk hvit variant med et mørkt sjikt under.
- Aldri sette logoen rett ved siden av en annen logo uten klaringssone mellom.
- Aldri bygge et nytt merke ved å sette et ord etter logoen. Virksomhetsnavn
  settes i IBM Plex Sans 400 ved siden av, adskilt av en hårlinje — se `09-varianter.md`.

## Familien — bygget 31.08.2026

Anders bestemte: **rydd, ikke tegn om.** Ligaturen og ballen er uendret. Det som
ble laget er tre nye typer filer, avledet fra nøyaktig samme former:

**`ak-golf-merke-kvadrat.svg`** — kvadratisk, til profilbilder på plattformer som
beskjærer. Merket dekker 78 % av flaten og er optisk sentrert. **Skarpe hjørner
med vilje:** plattformen runder selv, og en innebygd radius ville blitt rundet to
ganger.

**`ak-golf-favicon.svg`** — 94 % dekning på betonggrå flate. Valgt etter test av fire
utkast på 16, 20, 32, 48 og 180 px, mot lys, mørk og hvit fanebakgrunn.
Utslagsgivende: **mørk strek på lys flate holder seg lesbar der lys-på-mørk
tetter seg igjen.** Den lyse flaten gjør dessuten at ikonet fungerer på en mørk
fane, der en gjennomsiktig versjon ville forsvunnet.

**`ak-golf-laas-<variant>.svg`** — fem varianter (`academy`, `junior-academy`,
`hq`, `products`, `organisasjon`), hver i lys og mørk utgave. Teksten er
konvertert til former, så filene ikke er avhengige av at IBM Plex Sans er
installert. Oppbyggingen står i `09-varianter.md`.

## Det som fortsatt kan gjøres

Ingenting som haster. To ting hvis merket skal ut i trykk i stort format:

- **PNG-eksporter** i faste størrelser for flater som ikke tar SVG (enkelte
  sosiale plattformer, e-postsignaturer).
- **Pantone- og CMYK-verdier** for signalrødt og tekstfargen, hvis det skal
  trykkes på annet enn digitaltrykk. Utgangsverdier står i masterens readme §7.
  Skal måles av trykkeriet mot et fysisk prøvetrykk, ikke konverteres
  matematisk fra RGB.
