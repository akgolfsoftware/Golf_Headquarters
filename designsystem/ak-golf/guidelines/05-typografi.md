# 5 · Typografi

Fasit i kode: `designsystem/ak-golf/tokens/type.css`.

Én familie, tre roller. **Ingen fjerde font.** Fastsatt 01.09.2026 (verkstedet).

| Font | Bærer | Hvorfor |
|---|---|---|
| **IBM Plex Sans Condensed** | Overskrifter. Alt som skal dominere en flate | Kondensert, får plass til flere tegn per linje på 390 px |
| **IBM Plex Sans** | Brødtekst, knapper, skjema | Tettere enn Poppins — tekst som brøt til tre linjer klarer seg på to |
| **IBM Plex Mono** | **Alt som er målt** | Se under |

## Hvorfor IBM Plex

To grunner, begge praktiske.

**Kondensert display får plass til flere tegn per linje på 390 px.** Mobil
er merkets viktigste flate — det er der en forelder skanner mens hun står på
et treningsfelt. En bred grotesk i 72 px sprenger den skjermen; Plex Sans
Condensed gjør det ikke. Målt 01.09.2026: hero-linjen gikk fra fire til tre
linjer.

**Én familie holder flaten rolig.** Display, brødtekst og mono er tegnet
sammen, med samme x-høyde og samme temperament. Plex ble testet mot Archivo
Narrow + Poppins (valget fram til kvelden 01.09): Plex Sans er tettere, og
brødtekst som brøt til tre linjer i Poppins klarer seg på to.

Archivo Narrow, Poppins og Lora er ute av merket. Produktskjermene i
PlayerHQ, AgencyOS og Forelder bruker fortsatt Poppins gjennom Train-lock —
det er en annen fasit og røres ikke av dette kapitlet.

## Lora er ute

Serifen bar «det som skal leses langsomt» — ingress og sitat. Den rollen
finnes ikke lenger. En serif sier *les langsomt*; instrumentet sier *her er
tallet*. Det er ikke plass til begge stemmene i samme merke.

Ingressen settes nå i IBM Plex Sans 400 på 21 px. Sitatet settes i IBM Plex
Sans Condensed 600, ikke i kursiv serif.

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
| IBM Plex Sans Condensed | 600, 700 |
| IBM Plex Sans | 400, 500, 600 |
| IBM Plex Mono | 400, 500 |

**700 er kun Plex Sans Condensed.** Brødtekstfonten går aldri over 600 —
i 700 blir den klumpete på 15 og 17 px.

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
