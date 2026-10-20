# Front end-analyse: PlayerHQ og AgencyOS (20.10.2026)

Hva som er målt: stilarkene under `src/styles/`, skallene i `src/components/precision/`, komponentene i `src/components/portal/precision/` og `src/components/admin/precision/`, og utkastene i `docs/design-system/utkast-playerhq/` og `utkast-agencyos/`. Tallene er fra main (363d1ac0e). Ikke målt: hver enkelt skjerm i nettleser.

## Hovedfunn

Designet (Precision Athletics) er riktig valgt og ser bra ut i utkastene. Problemet er ikke utseendet, men at **det samme designet er bygget tre ganger i koden**, og at hver skjerm har fått sitt eget stilark. Det gjør hver designendring dyr: en justering av en knapp, et kort eller en farge må gjøres på 30–60 steder.

| Lag | Klasseprefiks | Stilark | Komponentfiler | Hvem |
|---|---|---|---|---|
| Precision-porten (sept.–okt.) | `.pa-root`, `.pa-btn`, `.pa-card` | `precision-athletics.css` (1 088 linjer, 1 197 tokens) + `precision-komponenter.css` + 16 `precision-a*.css` | 61 | PlayerHQ og AgencyOS, eldre skjermer |
| PlayerHQ nytt design (13.10) | `.phn`, `.phn-*` | `playerhq-ny.css` + 27 `playerhq-ny-*.css` | 125 | PlayerHQ |
| AgencyOS nytt design (13.10) | `.agn`, `.agn-s` | `agencyos-ny.css` + 9 `agencyos-ny-*.css` | 47 | AgencyOS |

I tillegg importerer 105 sider under `/portal` og `/admin` fortsatt gamle v2- eller TrainLock-komponenter.

### 1. Tokens er definert tre ganger, med tre navnesett

Samme farge `#141413` heter `--graphite-900` i Precision, `--phn-g900` i PlayerHQ og `--graphite-900` igjen (men i et nytt scope) i AgencyOS. Rust heter `--signal`, `--phn-rust` og `--rust`. Hjørner heter `--radius`, ikke noe i PlayerHQ (harde tall), og `--r1`–`--r6` i AgencyOS.

Konsekvens: Anders' beslutning «SLAG er mint i WANG» kostet én PR fordi WANG har ett tokensett. En tilsvarende beslutning i PlayerHQ og AgencyOS («TEK skal bli litt mørkere») vil kreve endring i tre filer og kontroll av 30 skjermfiler.

Skallet `playerhq-ny-skall.css` bruker ikke tokens i det hele tatt: 12 hex-verdier og 5 `var()`.

### 2. Hver skjerm har sitt eget stilark og sine egne byggeklosser

Målt i `playerhq-ny-*.css` og `agencyos-ny-*.css`:

| Byggekloss | Antall ulike klassedefinisjoner |
|---|---|
| Kort | 34 |
| Knapp | 12 varianter av «knapp» + `.pa-btn` + `.agn-s .knapp` |
| Tom tilstand | 9 (`.tom`, `.tomt`, `.phn-m-tomt`, `.phn-tom-dag`, `.phn-om-tom` …) |
| Pille / status | 7 |
| Hjørneradius | 10 ulike verdier (2, 3, 4, 5, 6, 8, 10, 12, 16, 999 px) |
| Skriftstørrelse | 20 ulike (11, 11.5, 12, 12.5, 13, 13.5, 14 … 52 px) |
| Brytepunkt for PC | 14 ulike (600, 640, 700, 768, 900, 960, 1000, 1024, 1025, 1064, 1080, 1100, 1101, 1280 px) |
| Maks innholdsbredde | 6 ulike (1 024–1 320 px) |

`pa.tsx` har allerede delte React-komponenter (Knapp, StatusPille, TomTilstand, FeilTilstand, Sidehode, Meta, Tall, AkseMerke). Av 117 PlayerHQ-skjermer i nytt design bruker **9** dem. 108 skriver sin egen markup. De nye skjermene har 1 069 `style={{…}}` inline.

Konsekvens for brukeren: kort ser litt ulike ut fra side til side (10 mot 12 px hjørner, 16 mot 18 px padding), og PC-layouten slår inn ved ulik bredde avhengig av hvilken side du er på. På en iPad i 1 024 px vil noen sider vise mobilvisning og andre PC-visning.

### 3. To generasjoner Precision lever side om side

De 16 `precision-a*.css`-skjermene (AgencyOS AG-02 til AG-24 fra september) bruker `.pa-card` og `.pa-btn` med `--radius: 8px` og `--shadow-card: none`. De nye `.agn-s`-skjermene bruker 12 px hjørner og egne kort. Begge heter «Precision Athletics», men ser ikke helt like ut. Coachen ser dette når hen går fra Cockpit (nytt) til Grupper eller Tester (gammel port).

### 4. Det som er bra og bør beholdes

- Grafitt primærknapp, rust bare som signal, farge betyr akse: gjennomført i alle tre lag.
- 44 px treffflate, `:focus-visible` med 3 px ring, `prefers-reduced-motion`: på plass.
- `.phn` bruker container-spørringer (ikke bare media), som er riktig for en side inni et skall.
- Menyvariant C i AgencyOS og sidemenyen i PlayerHQ er ferdig og målt.
- Utkastene (`utkast-*/`) er gode wireframes: ett tall per flate, økta ett trykk unna, tilstandene Tom/Laster/Feil tegnet.

## Forslag, rangert etter effekt per token

Rekkefølgen er valgt slik at det billigste med størst effekt kommer først. Alt er additivt; ingen skjerm må skrives om for at steg 1–3 skal virke.

### Forslag 1: Ett tokensett, tre alias-lag (ca. 150 linjer, én PR)

Flytt alle grunnverdier til én blokk på `:root` (ikke `.pa-root`), og la `.phn` og `.agn-s` beholde sine navn som alias som peker til de felles:

```css
:root { --ak-g900:#141413; --ak-rust:#9b2415; --ak-akse-tek:#b8852a; --ak-r-kort:12px; … }
.pa-root { --graphite-900:var(--ak-g900); --signal:var(--ak-rust); … }
.phn     { --phn-g900:var(--ak-g900); --phn-rust:var(--ak-rust); … }
.agn, .agn-s { --graphite-900:var(--ak-g900); --rust:var(--ak-rust); … }
```

Ingen skjerm endres, ingen visuell endring, men fra nå av er en fargebeslutning én linje. Samtidig: bytt de 12 hex-verdiene i `playerhq-ny-skall.css` til tokens.

Mål på ferdig: `grep -c "#[0-9a-f]\{6\}" src/styles/playerhq-ny*.css src/styles/agencyos-ny*.css` går fra 300+ til under 20 (bare `#fff` i fylte kort).

**Gjort 20.10 i PR #1467.** Målt: 109 hex-forekomster på 78 linjer før, 32 forekomster på 20 linjer etter; resten mangler token (banekart, diagramtinter, TN-navy). Skjermbilder før/etter er pikselidentiske.

### Forslag 2: Lås fire tall som regel (ca. 20 linjer + vakt)

Velg én verdi for hver og legg dem som token i steg 1:

| Hva | Anbefalt | Hvorfor |
|---|---|---|
| Kort-hjørne | 12 px | Mest brukt (152 treff) og i utkastene |
| Knapp-hjørne | 8 px | Precision-fasit |
| PC-brytepunkt | 900 px container / 1 024 px media | 900 er utkastets valg; 1 024 er skallets |
| Maks innholdsbredde | 1 200 px | Precision `--content-max` |

Legg en liten vakt i `npm run verify` som feiler på nye `@media (min-width:` med andre verdier enn de to. Det hindrer at tallet 15 dukker opp.

**Gjort 20.10 i PR #1467.** Tokenene heter `--ak-r-kort`, `--ak-r-knapp`, `--ak-bryt-pc-container`, `--ak-bryt-pc-media`, `--ak-innhold-maks` i `src/styles/ak-tokens.css`; vakten er `scripts/check-brytepunkt.mjs` (600, 900 og 1024 px tillatt, dagens 1280 i `agencyos-ny-workbench.css` hvitelistet). Ingen eksisterende skjerm har fått nytt brytepunkt.

### Forslag 3: Fem delte byggeklosser som alle tre lag bruker (ca. 200 linjer)

Ikke rør eksisterende skjermer. Lag fem klasser uten prefiks-scope, definert én gang i et nytt `src/styles/ak-byggeklosser.css`, og la nye skjermer og rettepakker bruke dem:

- `.ak-kort` (ramme, 12 px, hvit, 16/18 px padding)
- `.ak-knapp` med `.pri` / `.sek` / `.rust` / `.stor`
- `.ak-pille` med `.ok` / `.varsel` / `.akse-*`
- `.ak-tom` (tom tilstand: ikon, én setning, én handling)
- `.ak-sek-topp` (seksjonshode med tittel til venstre og kilde/handling til høyre)

`pa.tsx` får samme navn på sine komponenter, slik at React-koden og CSS-en peker samme sted. Når en gammel skjerm uansett åpnes for retting, byttes dens egne kort/knapp til de delte.

### Forslag 4: Wireframe-regel for nye skjermer (0 kode, bare en side i README)

Utkastene er gode, men hver pakke tegner sitt eget kort og sin egen knapp i `<style>`-blokken. Legg i `utkast-playerhq/README.md` og `utkast-agencyos/README.md`: «En skjerm tegnes bare med klassene i `felles/felles.css`. Egen `<style>` er bare for det som er unikt for skjermen (tidslinjen, donuten, kalenderrutenettet).» Det gjør porteringen billigere, fordi porteringsøkta ikke trenger å skrive 150 linjer CSS per skjerm.

### Forslag 5: Slå sammen de 27 PlayerHQ-stilarkene til tre (gjøres når forslag 1–3 står)

`playerhq-ny.css` (felles) · `playerhq-ny-idag-plan-okt.css` (treningskjeden) · `playerhq-ny-stats-meg.css` (resten). Samme for AgencyOS: `agencyos-ny.css` + `agencyos-ny-skjermer.css`. Importeres i skallet én gang, ikke i 117 komponentfiler. Dette er større (flytting av 4 000 linjer) og bør vente til de delte byggeklossene finnes, ellers flyttes bare duplikatene.

## Hva jeg ikke anbefaler

- **Ikke skriv om de 61 eldre Precision-skjermene (`.pa-card`) nå.** De virker. Når forslag 1 står, får de samme farger som resten automatisk.
- **Ikke lag et fjerde lag.** Ingen ny klasse-prefiks, ingen ny tokenfil ved siden av. Alt nytt går inn i det felles settet.
- **Ikke rør skjermregisteret i disse PR-ene** (gotchas §Arbeidsmåte).

## Anbefalt rekkefølge

1. Forslag 1 + 2 i én PR (lav risiko, ingen visuell endring, verify grønn er beviset).
2. Forslag 3 i én PR, brukt første gang på neste rettepakke.
3. Forslag 4 i README-ene samme dag.
4. Forslag 5 når 10+ skjermer bruker de delte klassene.
