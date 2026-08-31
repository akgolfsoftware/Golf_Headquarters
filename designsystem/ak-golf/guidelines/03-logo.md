# 3 · Logoen

Merket er en `ak`-ligatur i blekk `#141413` med en clay-sirkel `#B85C3D` over
k-en. Sirkelen er ballen. Den er det eneste fargede elementet, og den bærer hele
merkets identitet i én form.

Filene ligger i `public/logos/`, sju varianter, alle vektor:

| Fil | Brukes på |
|---|---|
| `ak-golf-logo-primary-on-light.svg` | Krem og hvit flate — **standardvalget** |
| `ak-golf-logo-primary-on-dark.svg` | Blekk og mørk flate |
| `ak-golf-logo-white-on-dark.svg` | Foto og film, mørk bakgrunn |
| `ak-golf-logo-white-mono.svg` | Én farge, hvit — brodering, gravering, trykk |
| `ak-golf-logo-black-mono.svg` | Én farge, sort — faks, stempel, avis |
| `ak-golf-logo-primary-mono.svg` | Én farge, clay |
| `ak-golf-logo-white-on-green.svg` | Historisk. **Bruk ikke i nytt materiell** |

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
  settes i Poppins 500 ved siden av, adskilt av en hårlinje — se `10-varianter.md`.

## Tilstanden i dag, og hva som gjenstår

Filene er ekte vektor med solide former, og skalerer rent. Det som mangler er
ikke kvaliteten, men **familien**: det finnes ingen kvadratisk variant til
profilbilder, ingen favicon-optimalisert versjon der ballen fortsatt leses på
16 px, og ingen horisontal låsning der virksomhetsnavnet er en del av filen.

**Anbefaling:** rydd, ikke tegn om. Merket fungerer. Å tegne det om koster tid
og risikerer å miste den ene tingen som er distinkt — ballen som prikk over
k-en. Det som trengs er tre nye filer, ikke en ny logo:

1. `ak-golf-merke-kvadrat.svg` — kun ligatur og ball, kvadratisk ramme
2. `ak-golf-favicon.svg` — ballen forstørret så den overlever 16 px
3. `ak-golf-laas-<variant>.svg` — logo + virksomhetsnavn som én låst fil, per variant

**Dette er Anders' beslutning** (STEG 18.5). Sier han «tegn om», er utgangspunktet
at ballen består og ligaturen får jevnere strekvekt.
