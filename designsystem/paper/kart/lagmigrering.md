# Lagmigrering — 35 filer, 175 klasser inn i @layer

**Status: FULLFØRT 28.07.2026.** Alle tre grupper migrert — **0 ulagrede filer i hele biblioteket** [målt], fra 35 filer / 175 klasser. Tilordninger og utfall: `kart/gruppe0-tilordning.md`, `gruppe1-tilordning.md`, `gruppe2-tilordning.md`.

Gjenstår i denne leveransen: det avsluttende opprydningssteget nederst (de tre midlertidige reglene) og verifisering av Modal/BottomSheet som funksjon.

**Rekkefølge i Fase A:** lagmigrering → template-omskriving → Port A-krav 2 (craft, verifikatør) → Familie 2.
Mot templatene er rekkefølgen ikke valgfri: migreringen endrer kaskadeposisjon for klasser templatene bruker, så en omskriving først må gjøres om igjen — eller den blir pikselfasit for 60 skjermer basert på en kaskade som ikke lenger gjelder. Mot Familie 2 er begrunnelsen den andre: hver av de ~23 skjemakomponentene ville ellers bygges på en kaskade der halve biblioteket kan overkjøre den, og feilklassen vokser lineært med antall komponenter bygget etterpå.

## Provenansregel for dette dokumentet

Hvert tall her er merket **[målt]**, **[telt]** eller **[anslag]**. Regelen kom fra spesimenkortene og er utvidet hit 28.07.2026, fordi to premisser i den forrige versjonen av dette dokumentet var oppgitt som målte uten å være det: «46 klasser i viz.jsx» (faktisk **6** [målt]) og «tre-fire filer» (faktisk **35** [målt]). Et feil premiss koster mest i et planleggingsdokument — det ble skrevet normativt inn og styrte gruppeinndelingen. Samme feilklasse som høydeanslaget i spesimenkortene.

## Målt utgangspunkt

Kjørt 28.07.2026 med `guidelines/lagsjekk.mjs` mot alle 55 komponentfiler med CSS.

| | Antall | Kilde |
|---|---|---|
| Filer helt lagret | 20 | [målt] |
| Filer uten `@layer` i det hele tatt | 35 | [målt] |
| Filer med `@layer` men klasser utenfor blokken | **0** | [målt] |
| Ulagrede klassedeklarasjoner | 175 | [målt] |
| Største enkeltfil | 9 (`ProgramLadder`) | [målt] |
| Median per fil | 5 | [målt] |

**Delelinjen er skarp og forklarer alt:** de 20 lagrede er *alle* bygget i steg 7, etter at skjelettet fantes. De 35 ulagrede er *alt* fra steg 2, 3 og 4. Unntakene i steg 7 — `Avatar`, `StatusBadge`, `SectionLabel` — ble skrevet før skjelettet ble opprettet, i samme steg.

**Ingen fil har rester utenfor blokken.** Feilmodusen er binær: enten har filen lag og er ryddig, eller den har ingen. Det gjør migreringen mekanisk per fil, og er grunnen til at bolker er trygt.

Den flate profilen (median 5) er hva som gjør batching riktig her: ingen fil er stor nok til å fortjene egen runde, og alle 35 har identisk transformasjon.

## Gruppe 0 — Familie 1s uleverte lag (**MIGRERT 28.07.2026**)

`primitives/Avatar.jsx` (6) · `primitives/StatusBadge.jsx` (8) · `primitives/SectionLabel.jsx` (1) · `actions/Button.jsx` (5) — **20 klasser** [målt].

Tilordningen ble skrevet ned på forhånd i `kart/gruppe0-tilordning.md` og asserteres mot faktisk lagmedlemskap: **alle fire filer stemmer** (Avatar base 1 / modifier 5 · StatusBadge base 2 / modifier 6 · SectionLabel base 1 · Button base 1 / container 2 / modifier 4), 0 klasser utenfor lag. Tilstandsmatrisen ligger i `guidelines/gruppe0-tilstander.card.html`.

**Berøringsgulvet måtte løses i samme operasjon.** `@media (pointer: coarse)` satte tidligere `height: 44px` direkte. Lagdelt ville `--sm` i `akhq-modifier` vunnet over container-laget og gitt 32 px hitbox på mobil — en tilgjengelighetsregresjon skapt av migreringen selv. Løst med prinsippets unntak: `height: max(var(--h), var(--floor))`, `--floor` settes i container-laget, `--sm` setter bare `--h`. Gulvet holder uansett modifikator.

Egen gruppe av to grunner. De er **blader under alt som kommer**: Avatar og StatusBadge er inne i ListRow, SectionLabel er inne i PageHeader og SectionHeader, Button er inne i Panel, PageHeader, ConfirmDialog, DropdownMenu, StickyActionBar, EmptyState og Banner. Og de er **restanser fra et steg som er meldt kodeferdig** — ikke gammel gjeld, men manglende leveranse i Familie 1.

`Button` er i tillegg blokkerende: `danger`-varianten måtte legges i Buttons egen ulagrede CSS fordi en regel i ConfirmDialogs `akhq-base` tapte mot den. Flytt `danger` inn i `akhq-base` i samme operasjon; da kan konsumenter igjen style Button fra sine egne lag.

## Gruppe 1 — datafamilien og progress (**MIGRERT 28.07.2026**)

`data/viz.jsx` (6) · `data/NowNext.jsx` (8) · `data/AiRecap.jsx` (5) · `data/KpiStripe.jsx` (5) · `data/KpiCard.jsx` (4) · `data/StatusCircleRow.jsx` (5) · `actions/OneThingNow.jsx` (6) · `actions/Chip.jsx` (4) · `progress/ProgramLadder.jsx` (9) · `progress/GoalProgress.jsx` (7) · `progress/PercentileGauge.jsx` (7) · `progress/DotMatrix.jsx` (6) · `progress/ScoreGauge.jsx` (6) · `progress/PersonalBest.jsx` (4) — **82 klasser** [målt].

**`viz.jsx` migreres først i gruppen — begrunnelsen er avhengighet, ikke størrelse.** Den forrige begrunnelsen var at den var den tyngste filen (46 klasser), og det tallet var feil: den har **6** [målt]. Rekkefølgen ble derfor etterprøvd på nytt i stedet for arvet, siden en rekkefølge arvet fra et feil tall er samme feilklasse som tallet.

Den nye begrunnelsen er målt: **20 komponentfiler importerer `Region` og `ensureCss` fra `data/viz.jsx`** [målt] — hele datafamilien, hele golfviz og hele progress. `Region` eier de fire datatilstandene (fylt, tom, laster, feil), og `.akhq-empty`, `.akhq-error`, `.akhq-skel`, `.akhq-lab`, `.akhq-val`, `.akhq-card` injiseres av den, ikke av konsumentene. Migreres en konsument først, ligger dens lagrede regler under `viz.jsx` sine ulagrede — som er hele feilklassen migreringen skal fjerne, gjenskapt i miniatyr.

`golfviz/viz.jsx` og `progress/viz.jsx` er rene re-eksportfiler på 73 tegn uten egen CSS [målt] — de trenger ingen migrering, men bekrefter at `data/viz.jsx` er det reelle midtpunktet.

Tilordning og utfall: `kart/gruppe1-tilordning.md`. Alle 14 filer 0 klasser utenfor lag [målt]. `KpiStripe` og `OneThingNow` fikk sine viewport-hybrider konvertert til `@container` i samme operasjon (terskel 520 px, wrapper eier containeren), og `Chip`s berøringsgulv over på `max(var(--h), var(--floor))` — samme latente feil som Button.

**Gjenstår: gruppe 2** (73 klasser). Merk lærdommen fra gruppe 1: `Rail`, `Topbar` og `TabBar` har viewport-spørringer mot egen struktur, og en `@media`→`@container`-konvertering krever da en wrapper som eier containeren. Regn wrapperklassene inn i tilordningen på forhånd.

## Gruppe 2 — golfviz, navigasjon, overlays, forms (**MIGRERT 28.07.2026**)

`golfviz/` GappingChart (7) · PuttLab (7) · PyramidProgress (6) · SgBreakdown (6) · HoleStrip (4) · SkillRadarLive (3) · TrendBand (3) · DispersionMap (2) — 38.
`navigation/` Rail (5) · Topbar (5) · TabBar (2) · Breadcrumbs (1) — 13.
`overlays/` BottomSheet (5) · Modal (5) — 10.
`forms/` Input (6) · Toggle (4) · SegmentControl (2) — 12.
**73 klasser** [målt].

`Modal` og `BottomSheet` skal i samme operasjon konverteres til `useOverlayLayer` med `modal: true` — de har egne halvferdige fokusfeller fra steg 4, som er nøyaktig det fokuskontrakten finnes for å forhindre.

`forms/`-filene er tre komponenter fra steg 2 som Familie 2 skal bygge videre på. Å migrere dem her sparer en omgang i steg 8.

## Nedskrevet prediksjon måles på synlighet, ikke på treffsikkerhet

Gruppe 1s tilordning forutså ikke `.akhq-stripe-c` og `.akhq-now-c`. **Det er regelen som virker, ikke et feilslag.** Poenget med å skrive tilordningen ned på forhånd er ikke å treffe — det er at en overraskelse blir *synlig som* overraskelse, med en grunn som må skrives ned. Uten prediksjonen hadde to nye klasser bare ligget i diffen, umulige å skille fra planlagt arbeid, og innsikten («en `@media`→`@container`-konvertering av en komponents egen layout krever en wrapper») hadde ingen kommet frem til.

Så: et avvik fra tilordningen er et **normalt og forventet utfall**. Kravet er at det dokumenteres med begrunnelse i tilordningsfilen og, der det generaliserer, føres videre som forhåndskrav til neste gruppe. Et avvik som ikke skrives ned er den eneste feilen her.

## Verifiseringskrav

**Tilordningen skrives ned FØR migreringen, per fil.** En sjekk skrevet etter handlingen dokumenterer bare det som skjedde. For hver fil: hvilke klasser til `akhq-base`, hvilke til `akhq-container`, hvilke til `akhq-modifier`.

1. **Lagmedlemskap per klasse asserteres, ikke bare at klassen er lagret.** En klasse som havner i `akhq-modifier` i stedet for `akhq-base` gir identisk teller men endret kaskade. `guidelines/lagsjekk.mjs` sammenligner faktisk lag mot nedskrevet forventning per klasse.
2. **Null visuell endring måles på TILSTANDER, ikke bare moduser og bredder.** To moduser × to bredder er en stikkprøve av standardtilstanden. Lagflytting endrer spesifisitetsforhold, og de viser seg i `:hover`, `:focus-visible`, `[disabled]`, feil og laster. Før/etter skal dekke tilstandene for hver komponent med tilstandsspesifikk CSS. Samme usynlighetsklasse som flush-buggen.
3. **Målinger leses etter reload** — verifikatørens ansvar, ikke forfatterens (rollefordelingen i readme).

## Avsluttende steg: rydd bort reglene som bare fantes for halvlagdelt tilstand

Tre regler i `guidelines/komponentskjelett.md` er svar på **ett midlertidig forhold** — at ulagret CSS vinner over lagret, og at 175 av 312 klassenavn var ulagrede. Migreringen fjerner forholdet. Da må reglene revideres i samme leveranse, ikke stå igjen som ritualer uten årsak.

Regler som overlever sin begrunnelse er det som gjør et designsystem uleselig etter to år: ingen husker hvorfor de finnes, så ingen tør fjerne dem. Derfor skrives opprydningen ned nå, mens begrunnelsene er ferske.

| Regel | Etter migreringen | Handling |
|---|---|---|
| **Unikt klasseprefiks per komponent** | I hovedsak unødvendig som *kaskade*-vern — alle regler er lagret, og lag + spesifisitet oppfører seg forutsigbart. Beholdes som ren **lesbarhetskonvensjon**, nedgradert fra bindende til anbefalt. | Omskriv med ny begrunnelse: navnet skal si hvilken fil regelen bor i. Fjern kaskadeargumentet. |
| **Grep mot `guidelines/klasseinventar.md` før lagring** | I hovedsak unødvendig. En kollisjon mellom to lagrede regler er en vanlig, feilsøkbar spesifisitetskonflikt — ikke en stille utradering. | Nedgrader til frivillig sjekk ved generiske navn. Behold generatoren som oversikt, men ut av kortkravene. |
| **Aldri style en annen komponents element fra egen fil** | **Blir stående** — med **ny begrunnelse**. I dag: regelen matcher og virker likevel ikke. Etterpå: eierskap og gjenfinnbarhet — leter du etter hvorfor en knapp er rød, skal svaret ligge i `Button.jsx`. | Skriv om begrunnelsen. Behold som bindende. |

Den tredje var den verste av de tre feilklassene: en navnekollisjon gir en selektor som *ikke finnes* å feilsøke, mens kryssfil-styling gir en selektor som **matcher og likevel ikke virker** — usynlig uten at man kjenner lagreglene fra før.

**Ferdigmeldingsbetingelse: OPPFYLT 28.07.2026.** Alle tre revidert i `guidelines/komponentskjelett.md`: prefiksregelen nedgradert til anbefalt med gjenfinnbarhet som begrunnelse, inventar-grepen nedgradert til frivillig sjekk ved generiske navn, kryssfil-regelen beholdt som bindende med eierskap i stedet for kaskade som begrunnelse. Ingen regel står igjen med kaskadeargumentet.

## Etter migreringen kan lagsjekken skjerpes

**Skjerpet 28.07.2026.** `guidelines/lagsjekk.mjs` returnerer nå `ok: false` på enhver komponentfil med CSS utenfor `@layer` — den er en stående portsjekk for komponenter som ikke er skrevet ennå, ikke en engangsmåling. Familie 2 starter derfor på et bibliotek der lagbrudd er en målbar feil fra første fil, og skjelettet gir riktig struktur som standardtilstand.
