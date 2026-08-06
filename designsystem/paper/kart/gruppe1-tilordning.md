# Gruppe 1 — tilordning, skrevet før migrering

**Skrevet 28.07.2026, før en linje ble endret.** Alle tall **[målt]** med `guidelines/lagsjekk.mjs`.

14 filer, **82 klasser** [målt]: `data/viz.jsx` (6) · `NowNext` (8) · `AiRecap` (5) · `KpiStripe` (5) · `KpiCard` (4) · `StatusCircleRow` (5) · `actions/OneThingNow` (6) · `Chip` (4) · `progress/ProgramLadder` (9) · `GoalProgress` (7) · `PercentileGauge` (7) · `DotMatrix` (6) · `ScoreGauge` (6) · `PersonalBest` (4).

## Funn ved kartleggingen: gruppen er nesten ren base

**Bare `Chip` har modifikatorklasser** (`--selected`, `--static`) [målt]. De 13 andre har utelukkende grunnklasser med bindestrek-delelementer (`akhq-nn-title`, `akhq-xp-fill`). Det betyr at gruppe 1 i hovedsak er en mekanisk innpakning, og at risikoen er konsentrert i tre filer med spørringer:

| Fil | Spørring | Til lag | Merknad |
|---|---|---|---|
| `KpiStripe` | `@media (max-width:640px)` | container | **Konverteres til `@container`** — viewport-hybriden fra restanselisten. Stripen står i paneler og i PlayerHQs 430 px-kolonne. |
| `OneThingNow` | `@media (max-width:640px)` | container | Samme konvertering. |
| `OneThingNow` | `@media (prefers-reduced-motion:reduce)` | container | **Blir `@media`** — brukerpreferanse er ikke containerbredde. Hører i container-laget som «tilpasning til omgivelse», sammen med `pointer: coarse`. |
| `Chip` | `@media (pointer:coarse)` | container | Berøringsgulvet. **Sjekk om den setter `height` direkte** — i så fall samme nesten-regresjon som Button, og den må over på `max(var(--h), var(--floor))`. |

## Tilordningsprinsipp (uendret fra gruppe 0)

- **akhq-base** — grunnform og delelementer, og tilstander av grunnformen.
- **akhq-container** — `@container`, `@media (pointer: coarse)`, `@media (prefers-*)`: alt der komponenten svarer på omgivelsen.
- **akhq-modifier** — eksplisitte forfattervalg: alt med `--` i navnet.

`@keyframes` (`akhq-skel` i viz, `akhq-pulse` i OneThingNow) legges i `akhq-base`. Keyframes har ingen kaskade og påvirkes ikke av lag, men skal ligge i en blokk så lagsjekken ikke ser dem som ulagret CSS.

## `viz.jsx` migreres først — begrunnelsen er avhengighet, ikke størrelse

**20 filer importerer `Region` og `ensureCss` fra `data/viz.jsx`** [målt]. `Region` injiserer `.akhq-skel`, `.akhq-empty`, `.akhq-error`, `.akhq-lab`, `.akhq-val`, `.akhq-card` — migreres en konsument først, ligger dens lagrede regler under `viz.jsx` sine ulagrede, altså feilklassen migreringen skal fjerne, gjenskapt i miniatyr.

`.akhq-card` er verdt en merknad: den brukes **bare av KpiCard**, ikke av templatene, som håndruller sine paneler. Panel-komponenten erstatter den i template-omskrivingen. Den migreres uendret nå — å slå den sammen med `.akhq-panel` er en designbeslutning, ikke en lagflytting, og hører ikke i denne leveransen.

## Verifisering

1. `node guidelines/lagsjekk.mjs` — 0 klasser utenfor lag i alle 14.
2. Lagmedlemskap per klasse mot tabellen over, assertert maskinelt.
3. **Null visuell endring på tilstander**: hver av de 14 i fylt / tom / laster / feil (alle bruker `Region`), Chip i default / selected / static / hover / focus.
4. `KpiStripe` og `OneThingNow` legger om ved **containerbredde**, ikke vindusbredde: verifiseres i to containerbredder, 860 og 430, i samme wrapper-mønster som PageHeader-kortet.
5. Chips berøringsgulv: samme `--floor`-stand-in som gruppe 0, siden coarse pointer ikke kan simuleres (`kart/fase-d-enhetsverifisering.md` post 1).

## Utfall (28.07.2026) — assertert

Alle 14 filer: **0 klasser utenfor lag** [målt]. Lagmedlemskap per fil: viz 6/0/0 · NowNext 8/0/0 · AiRecap 5/0/0 · **KpiStripe 6/2/0** · KpiCard 4/0/0 · StatusCircleRow 5/0/0 · **OneThingNow 7/3/0** · **Chip 2/1/3** · ProgramLadder 9/0/0 · GoalProgress 7/0/0 · PercentileGauge 7/0/0 · DotMatrix 6/0/0 · ScoreGauge 6/0/0 · PersonalBest 4/0/0 (base/container/modifier).

### Avvik fra tilordningen: to klasser jeg ikke forutså

`.akhq-stripe-c` og `.akhq-now-c` — layoutnøytrale wrappere (`container-type: inline-size; min-width: 0`, ellers ingen egen boks). **Tilordningen sa «konverteres til `@container`» uten å ta høyde for at det innebærer en DOM-endring:** et element kan ikke query seg selv, og begge komponentene legger om sin *egen* grid — KpiStripe bytter `grid-auto-flow`, OneThingNow bytter `grid-template-columns`. Wrapperen må eie containeren. Samme løsning som ListGroup, og samme systemregel: container-type på forelderen, aldri på elementet som legger om.

Avviket står her fordi en tilordning som stilles om underveis uten å skrives ned er verdiløs som forhåndssjekk. Lærdom til gruppe 2: **en `@media`→`@container`-konvertering av en komponents egen layout krever en wrapper — regn den inn i tilordningen, ikke oppdag den under koding.** Gjelder `Rail`, `Topbar` og `TabBar` i gruppe 2, som alle har viewport-spørringer mot egen struktur.

### Chip hadde samme latente feil som Button — pluss en nuanse

`@media (pointer: coarse)` satte `min-height: 44px`, mens `--static` setter `height: 22px`. Ulagret vant spørringen på kilderekkefølge; lagdelt ville `--static` i `akhq-modifier` vunnet og gitt 22 px treffmål på berøring. Over på `max(var(--h), var(--floor))` som Button.

**Nuansen:** `--static` skal *ikke* ha berøringsgulv. Den er `cursor: default` — en etikett, ikke et treffmål — så den nuller `--floor` eksplisitt. Det er første tilfelle der tilgjengelighetsgulvet *skal* kunne slås av av en modifikator, og grunnen er at elementet ikke er interaktivt. Gulvet gjelder treffmål, ikke alle bokser.

`--static` ble samtidig omskrevet fra direkte egenskaper til variabler (`--h`, `--pad-x`, `--fam`, `--fs`, `--fw`, `--bgc`, `--fgc`, `--cur`), som lagmønsteret krever: modifikatoren setter variabler, base deklarerer egenskapen én gang.

### Terskelvalg for de to konverterte

Begge var `@media (max-width: 640px)`. **Omregnet til 520 px container, ikke oversatt.** Begrunnelse: begge står inne i paneler, så forelderens polstringsbidrag (Panel gir 38 px ved md, 34 ved sm, 4 ved flush+bleed) er allerede trukket fra containerbredden. 640 px vindu tilsvarer grovt 560–600 px container i AgencyOS-oppsettet; 520 px er valgt for at to-kolonnepaneler *ikke* skal legge om, bare virkelig smale spalter — samme resonnement som Panels 480 px.

**Intervallet skal dokumenteres, ikke terskelen alene:** i PlayerHQs 430 px-kolonne blir stripens container 392 px ved standard panel og 426 ved flush+bleed — begge under 520, altså stables den i hele spennet. I AgencyOS' hovedspalte (~860) er containeren ~822 og den stables aldri. Ingen konfigurasjon lander nær terskelen, som er med hensikt.
