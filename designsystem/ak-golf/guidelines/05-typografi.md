# 5 · Typografi

Fasit i kode: `designsystem/ak-golf/tokens/type.css`.

Tre fonter. **Ingen fjerde.**

| Font | Bærer | Hvorfor |
|---|---|---|
| **Archivo Narrow** | Overskrifter. Alt som skal dominere en flate | Kondensert grotesk. Teknisk uten å være kald |
| **Poppins** | Brødtekst, knapper, skjema | Nøytral, holder på små størrelser |
| **IBM Plex Mono** | **Alt som er målt** | Se under |

## Hvorfor Archivo Narrow

Valget ble tatt 01.09.2026 av en praktisk grunn: **kondensert type får plass
til flere tegn per linje på 390 px.** Mobil er merkets viktigste flate — det
er der en forelder skanner mens hun står på et treningsfelt. En bred grotesk
i 72 px sprenger den skjermen; Archivo Narrow gjør det ikke.

Den ble testet mot Archivo, Barlow Condensed, Oswald, Saira Condensed, Chivo
og Anton, i norsk tekst med Æ, Ø og Å. Oswald og Anton er for mye plakat.
Chivo og Archivo er for brede for mobil. Barlow mangler autoritet i store
grader.

## Lora er ute

Serifen bar «det som skal leses langsomt» — ingress og sitat. Den rollen
finnes ikke lenger. En serif sier *les langsomt*; instrumentet sier *her er
tallet*. Det er ikke plass til begge stemmene i samme merke.

Ingressen settes nå i Poppins 400 på 21 px. Sitatet settes i Archivo Narrow
600, ikke i kursiv serif.

## Mono er merkets viktigste regel

Et tall som kommer fra en måling settes i mono. Et tall som ikke gjør det,
settes ikke i mono.

Det er ikke stil — det er løftet gjort synlig. Står det i mono, er det
etterprøvbart, med dato og kilde. Står det ikke i mono, er det en påstand.
**Estimater merkes som estimat i teksten**, selv når de står i mono.

## Skalaen

Ti trinn. Displayen går høyere enn før, fordi kondensert type tåler det.

| Token | Størrelse | Rolle |
|---|---|---|
| `--ak-t-11` | 11 px | Caps-etikett — **kun mono**, `0.2em` sperring |
| `--ak-t-13` | 13 px | Bildetekst, fotnote |
| `--ak-t-15` | 15 px | Brødtekst, tett |
| `--ak-t-17` | 17 px | Brødtekst, standard |
| `--ak-t-21` | 21 px | Ingress |
| `--ak-t-26` | 26 px | Seksjonstittel, mobil |
| `--ak-t-34` | 34 px | Seksjonstittel |
| `--ak-t-48` | 48 px | Sidetittel |
| `--ak-t-72` | 72 px | Hero, mobil |
| `--ak-t-112` | 112 px | Hero, Mac |

## Vekter

| Font | Vekter |
|---|---|
| Archivo Narrow | 600, 700 |
| Poppins | 400, 500, 600 |
| IBM Plex Mono | 400, 500 |

**700 er kun Archivo Narrow.** Poppins i 700 blir klumpete — det var grunnen
til regelen før, og den gjelder fortsatt for brødtekstfonten.

## Regler som holder teksten lesbar

- Display fra 48 px og opp har linjeavstand **0,94** — linjene skal låse seg
  til hverandre og bli en blokk, ikke en liste.
- Brødtekst er 1,5 og stopper på **65 tegn**, uansett skjermbredde.
- Sperring: `-0.035em` på display, `-0.02em` på titler, `0` på brødtekst,
  `0.2em` på caps-etiketter (`0.24em` på mørk flate, der lyset spiser
  mellomrommene).
- Display settes i **VERSALER** når den står alene som utsagn. I løpende
  overskrifter over brødtekst settes den normalt.
- **Aldri caps på en hel setning i brødtekst.** Caps er for display og for
  etiketter på tre ord eller mindre.
- Tall i kolonne får `font-variant-numeric: tabular-nums`.
