# Gruppe 2 — tilordning, skrevet før migrering

**Skrevet 28.07.2026, før en linje ble endret.** Alle tall **[målt]**.

17 filer med CSS, **73 klasser** [målt]. `golfviz/Sparkline.jsx` har ingen egen CSS og trenger ingen migrering [målt].

## Korreksjon av forhåndsantakelsen fra gruppe 1

`kart/lagmigrering.md` sa at `Rail`, `Topbar` og `TabBar` ville trenge wrappere fordi de har viewport-spørringer mot egen struktur. **Det er feil, og korrigeres her før migreringen.** Systemregelen (beslutning 36) sier: *viewport-bruddpunkt styrer skallet, container query styrer komponentene.* Rail, Topbar og TabBar **er** skallet — railens bredde, topbarens polstring og søkefeltets synlighet er skallbeslutninger som skal følge vindusbredden, ikke en container. De beholder `@media` med rette.

Antakelsen kom fra å generalisere gruppe 1s wrapper-behov til «alle viewport-spørringer», uten å skille skall fra komponent. Prediksjonen gjorde feilen synlig før den ble kodet, som er poenget med å skrive den ned.

**Konsekvens:** ingen wrappere i gruppe 2. `@media (max-width: …)` i Rail og Topbar flyttes til `akhq-container`-laget uendret — laget betyr «tilpasning til omgivelse», og vindusbredde er en omgivelse for skallet.

## Berøringsgulv: fem filer setter høyde direkte

Alle fem har samme latente feil som Button og Chip [målt]:

| Fil | I dag | Risiko lagdelt | Til |
|---|---|---|---|
| `Rail` | `@media coarse{.akhq-rail-item{min-height:48px}}` | ingen modifikator konkurrerer i dag | `--floor: 48px` |
| `Topbar` | `@media coarse{.akhq-theme{min-height:44px;height:44px}}` | ingen i dag | `--floor: 44px` |
| `Input` | `@media coarse{.akhq-input{height:44px}}` | `--error` finnes; setter ikke høyde i dag | `--floor: 44px` |
| `Toggle` | `@media coarse{.akhq-toggle{min-height:44px}}` | `--disabled` finnes | `--floor: 44px` |
| `SegmentControl` | `@media coarse{.akhq-seg-btn{min-height:40px}}` | ingen i dag | `--floor: 40px` |

**«Ingen modifikator konkurrerer i dag» er ikke et argument for å la det stå.** Familie 2 legger til varianter på nettopp Input, Toggle og SegmentControl (`FormField`, `SelectField`, `NumberInput`, `SegmentedControl` med tettere modus), og en av dem vil sette høyde. Da er gulvet borte, usynlig på desktop. Alle fem over på `max(var(--h), var(--floor))` nå.

Alle fem får også `[data-coarse-test]`-kroken i samme lag, siden coarse pointer ikke kan simuleres (`kart/fase-d-enhetsverifisering.md` post 1).

## Modal og BottomSheet over på `useOverlayLayer`

Begge har egne fokusfeller fra steg 4 — nøyaktig det fokuskontrakten finnes for å forhindre. Konverteres i samme operasjon, med `modal: true` (inert + scroll-lås), som er den ene delen ingen av dem har i dag. Dette er en **oppførselsendring**, ikke en lagflytting, og skal derfor verifiseres som funksjon: fokusfelle, Escape lukker øverste lag, retur til utløser, klikk utenfor på scrim, `inert` på søsknene.

## Tilordningsprinsipp (uendret)

- **akhq-base** — grunnform, delelementer, tilstander av grunnformen.
- **akhq-container** — `@container`, `@media (pointer: coarse)`, `@media (max-width)` for skallkomponenter, `@media (prefers-*)`.
- **akhq-modifier** — alt med `--` i navnet: `akhq-input--error`, `akhq-toggle--disabled`.

## Forventet fordeling

| Fil | base | container | modifier |
|---|---|---|---|
| GappingChart | 7 | 0 | 0 |
| PuttLab | 7 | 0 | 0 |
| PyramidProgress | 6 | 0 | 0 |
| SgBreakdown | 6 | 0 | 0 |
| HoleStrip | 4 | 0 | 0 |
| SkillRadarLive | 3 | 0 | 0 |
| TrendBand | 3 | 0 | 0 |
| DispersionMap | 2 | 0 | 0 |
| Rail | 5 | 2 | 0 |
| Topbar | 5 | 2 | 0 |
| TabBar | 2 | 0 | 0 |
| Breadcrumbs | 1 | 0 | 0 |
| BottomSheet | 5 | 0 | 0 |
| Modal | 5 | 0 | 0 |
| Input | 5 | 1 | 1 |
| Toggle | 3 | 1 | 1 |
| SegmentControl | 2 | 2 | 0 |

## Verifisering

1. `node guidelines/lagsjekk.mjs` — 0 klasser utenfor lag i alle 17, og **0 i hele biblioteket** etter denne gruppen.
2. Lagmedlemskap per klasse mot tabellen over.
3. Tilstander: Input i default / fokus / error / disabled, Toggle i av / på / disabled, SegmentControl i alle segmenter, Rail og Topbar i lys og mørk.
4. Berøringsgulv for alle fem, via `[data-coarse-test]` i container-laget — med riggens selvtest, som skiller manglende regel fra regelbrudd.
5. Modal og BottomSheet: fokuskontrakten som funksjon, ikke som kildelesing.

## Utfall (28.07.2026) — assertert

Alle 17 filer: **0 klasser utenfor lag** [målt]. Og sveipet over hele biblioteket: **0 ulagrede filer** i alle ti mapper [målt]. Lagmigreringen er fullført — fra 35 filer / 175 klasser til null.

### To avvik fra tilordningen

**1. Topbar fikk 5/3/0, ikke 5/2/0.** Min prediksjon telte *spørringer* (to `@media`), ikke *klasser*. Container-laget inneholder tre: `.akhq-topbar` (polstring), `.akhq-search` (skjules under 980 px) og `.akhq-theme` (berøringsgulv). Tellefeil i prediksjonen, ikke i koden — men den skal stå, siden en tilordning som stilles om i stillhet ikke er en forhåndssjekk.

**2. Modal og BottomSheet hadde ikke «halvferdige fokusfeller» — de hadde INGEN.** Tilordningen sa halvferdige, arvet fra en antakelse om steg 4. Faktisk innhold før konverteringen [målt]: `onClick` på scrim, `aria-modal="true"`, og ingenting annet. Ingen Escape, ingen fokusfelle, ingen retur til utløser, ingen `inert`. `aria-modal="true"` var altså en **påstand om modalitet uten noe som håndhevet den** — verre enn en halvferdig felle, fordi attributtet får en revisjon til å se riktig ut.

Konvertert til `useOverlayLayer` med `modal: true`, som gir alle ti punkter i kontrakten. Samtidig rettet: `aria-label={title}` byttet til `aria-labelledby` mot tittelens `id` — en dialog med synlig tittel skal peke på den, ikke duplisere teksten i et attributt. `aria-label` beholdes bare som fallback når `title` mangler, siden `role="dialog"` uten tilgjengelig navn er en feil i seg selv.

### Skallkorreksjonen holdt

Ingen wrappere i gruppe 2, som forutsagt etter korreksjonen. Rail beholder `@media (max-width: 640px)` for railbredden og Topbar for søkefeltet — begge er skallbeslutninger. `@media`-reglene ligger nå i `akhq-container`-laget, som betyr «tilpasning til omgivelse»; vindusbredde *er* omgivelsen for et skall.

### Berøringsgulv: fem filer over på `max()`

Rail (`--floor: 48px`), Topbar (44), Input (44), Toggle (44), SegmentControl (40). Alle med `[data-coarse-test]`-krok i samme lag og samme vekt som `pointer: coarse`-spørringen. Ingen av dem hadde en konkurrerende modifikator i dag — men Familie 2 legger til varianter på nettopp Input, Toggle og SegmentControl, og gulvet ville forsvunnet usynlig på desktop.

## Migreringsfeil funnet ved verifisering — fem døde variabler og én WCAG-regresjon

**Rotårsak:** migreringsskriptet *prependerte* `--var:…;prop:var(--var);` i regelen uten å fjerne den originale hardkodede egenskapen. Den ligger senere i samme regel og vinner, så variabelen ble død — og container-laget som setter den fikk ingen effekt.

| Regel | Egenskap 2× | Konsekvens |
|---|---|---|
| `.akhq-rail` | `width` | railen sluttet å smalne under 640 px — funksjonell regresjon i skallet |
| `.akhq-rail-item` | `min-height` | `--floor: 48px` dødt |
| `.akhq-topbar` | `padding` | polstringen endret seg ikke under 980 px |
| `.akhq-theme` | `height` | `--floor: 44px` dødt |
| `.akhq-seg` | `padding` | `--pad` uvirksom |

**Verre, egen årsak: `Toggle` fikk `min-height: max(auto, 44px)`.** `auto` er ikke en lengde, så hele deklarasjonen er ugyldig CSS og forkastes — målt `min-height: auto` og 20 px høyde med `--floor: 44px` aktivt. Før migreringen ga `@media (pointer: coarse){min-height: 44px}` 44 px. **Det er en reell WCAG 2.5.5-regresjon innført av migreringen**, i motsatt retning av nesten-regresjonen gruppe 0 fanget. Rettet til `min-height: var(--floor)` — høyden kommer fra innholdet, så gulvet skal stå alene uten `max()`.

### Hvorfor lagsjekken var grønn

`lagsjekk.mjs` måler **lagmedlemskap**, og medlemskapet var riktig i alle 17 filer. En egenskap deklarert to ganger i samme regel er usynlig for den sjekken — «0 klasser utenfor lag» var sant mens variabelplumbingen var død. Tredje gang i denne økten at en sjekk måler en annen egenskap enn den man tror.

**Tiltak:** `finnDuplikater()` er lagt til i `guidelines/lagsjekk.mjs` som stående sjekk, med en liste over legitime progressive fallbacks (`height: 100vh; height: 100dvh`). Sveip over hele biblioteket etter rettelsen: **ett treff, og det er `.akhq-rail`s bevisste `100vh/100dvh`-fallback** [målt] — altså ingen gjenstående duplikater.

### Duplikatsjekken lukket bare halve klassen

En migrert regel kan dø stille på **to** måter, og `finnDuplikater()` fanger bare den ene:

1. **Overskrevet av en gjenglemt original** — to deklarasjoner der én skulle stå. Fem tilfeller i gruppe 2.
2. **Forkastet fordi den ikke parser** — `min-height: max(auto, 44px)`. Ingen duplikat, ingen feilmelding, bare en egenskap som aldri fantes. Dette var den eneste ekte WCAG-regresjonen i runden, og duplikatsjekken ville aldri sett den.

`finnUgyldige()` er derfor lagt til ved siden av: `CSS.supports(prop, value)` over hver deklarasjon, pluss en parentesbalanse-sjekk. Vendorprefikser hvitlistes.

**Selvtestet mot kjente feilende varianter** [målt 28.07.2026], siden en sjekk ingen har sett feile er en sjekk ingen vet virker:

| Deklarasjon | supports | Fanget av |
|---|---|---|
| `min-height: max(auto,44px)` | false | supports ✓ |
| `width: 44` (manglende enhet) | false | supports ✓ |
| `padding: var(--s3` (uavsluttet) | **true** | parentesbalanse ✓ |
| `min-height: max(var(--h),var(--floor))` | true | — (gyldig) |
| `color: color-mix(in srgb,…)` | true | — (gyldig) |
| `-webkit-backdrop-filter: blur(10px)` | false | hvitlistet |

**Målt begrensning verdt å kjenne:** `CSS.supports` returnerer `true` for alt som inneholder `var()`, uansett hvor ødelagt resten er. Uten parentesbalansen ville en uavsluttet `var(` gått rett gjennom.

Sveip over hele biblioteket etter rettelsen: **1880 deklarasjoner sjekket, ett treff — `-webkit-backdrop-filter`, altså hvitlistet** [målt]. Ingen gjenstående ugyldige.

### Tredje stille død: udeklarert variabel

`var(--x)` der `--x` aldri er deklarert **parser**, `CSS.supports` sier **true**, parentesene **balanserer** — og deklarasjonen kastes likevel ved computed-value time, uten spor. Det er presis den failure-moden en lagmigrering kan innføre: variabelen deklareres i ett lag, konsumenten leser den fra et sted den ikke er synlig.

`finnUdeklarerte()` + `samleDeklarasjoner()` er lagt til i `guidelines/lagsjekk.mjs`. Med de tre sammen dekker sveipet **alle tre** måtene en migrert regel kan dø stille:

| Død | Fanges av | Eksempel fra gruppe 2 |
|---|---|---|
| Overskrevet av gjenglemt original | `finnDuplikater()` | `.akhq-rail{width:var(--w);width:64px}` |
| Uparsebar, forkastet | `finnUgyldige()` | `min-height:max(auto,44px)` |
| Udeklarert, kastet ved computed value | `finnUdeklarerte()` | ingen — sveipet er rent |

**Selvtesten avdekket en forutsetning som ville gjort sjekken ubrukelig.** Første kjøring leste bare `styles.css` som deklarasjonskilde og flagget **45 gyldige tokens** som udeklarerte — fordi `styles.css` er 111 tegn og inneholder ingen tokens, bare `@import "tokens/fonts.css"` og `@import "tokens/akhq-tokens.css"`. Deklarasjonsmengden må bygges fra hele `@import`-closuren, slik kompilatoren gjør.

Det er samme feilklasse som Port A-krav 1 hadde før dekningsmatrisen: **en sjekk med feil nevner**. Og 45 falske positiver er verre enn ingen sjekk — den slags larm får ekte funn til å bli oversett.

Sveip med riktig closure: **94 deklarerte, 931 referanser (19 med fallback), 0 udeklarerte** [målt].

**Lærdom for fremtidige mekaniske migreringer:** et skript som legger til en variabelbasert deklarasjon må *erstatte* den gamle, ikke stå foran den. Og sjekken som porterer arbeidet må måle utfallet (er variabelen i bruk?), ikke bare formen (ligger regelen i et lag?).
