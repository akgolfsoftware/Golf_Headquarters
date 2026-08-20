# AK Golf HQ — Claude Paper

Masterdesignsystemet for AK Golf HQ. Varmt papir (#FAF9F5) i lys modus, varmt blekk (#141413) i mørk — aldri ren sort/hvit, aldri kald grå, aldri rød. To produktflater: **AgencyOS** (desktop-først coach/byrå-verktøy, papirflatet sidemeny 232 px, body 13,5 px) og **PlayerHQ** (mobil-først spillerapp, 430 px-kolonne, body 14 px).

## Hvor står hva

| Dokument | Innhold | Leses av |
|---|---|---|
| **`PORT-README.md`** | Porteringskontrakten. Hva som er fasit, hva som er stillas, bruddpunkt, tema, ikon- og token-oversettelse. | Claude Code, **først** |
| **`DESIGN-FASIT.md`** | Produktfasiten: tokens, typografi, farge, moduser, språk, datasemantikk, fokuskontrakt, ikoner, komponentindeks. | Claude Code + design |
| **`PROSESS.md`** | Arbeidsregler inne i Claude Design: roller, målekrav, kaskadelag, kortkrav. **Gjelder ikke kodeporten.** | Design |
| `kart/` | Ordrer, revisjoner, restanser, rapporter. Historikk — ikke fasit. | Ved behov |

Denne fila er kun inngangen. Endrer du en regel, endrer du den i ett av de tre dokumentene over — ikke her.

## Hva som er fasit

- **Fasit er `fase1/` + `fase2/`.** Ingenting annet.
- `export/design-zip/` og `design_handoff_rutefasit_agenticos/` er **slettet 20.08.2026** (Anders’ regel 17.08: erstattede dokumenter slettes — repo-speilet og git bevarer). `uploads/` er **kopi/utgått** og skal aldri brukes som sammenligningsgrunnlag. Hver av dem har en stempellinje øverst som sier det samme.
- **Telling (målt 18.08.2026):** `fase1/` har **34** skjermfiler (workbench-mobil slettet 20.08 — m390 bor nå i `workbench-desktop.html`) og `fase2/` har **61** — til sammen **95 skjermfiler**. Tallet **208** som har vært i omløp er totalen for alle HTML-filer i prosjektet inkludert `components/`, `guidelines/` og `templates/`, og er ikke et skjermtall.
- Av de 61 fase2-filene er **38 MAL-filer** (lenker `w3/w4/w5-base.css`) og **23 selvstendige**. Hver fil er stemplet med `FIDELITET:` på første linje.

## Indeks
- `styles.css` — global inngang (importerer fonts + tokens).
- `tokens/` — `akhq-tokens.css` (verbatim baseline), `fonts.css` (Google Fonts: Poppins, Lora, IBM Plex Mono).
- `assets/` — logo-SVG-er.
- `guidelines/` — spesimenkort (Farger/Typografi/Rom og form/Brand) + `card-support.css` (dok-hjelper som scoper dark-tokens for side-ved-side-kort — ikke for konsumenter) + logoregler.
- `components/` — se Komponenter over; hver mappe har .jsx + .d.ts + .prompt.md + spesimenkort.
- `templates/` — eksempelskjermer (steg 5): `agencyos-dashboard/AgencyosDashboard.dc.html` (coach-dashboard, rail + topbar + Én ting nå + KPI-stripe + fire paneler) og `playerhq-idag/PlayerhqIdag.dc.html` (spillerens dagsskjerm, 430 px-kolonne + tab-bar). Hver mappe har `ds-base.js` som laster `styles.css` + `_ds_bundle.js`; konsumenter endrer kun `base`-linjen.
- Kommer: `SKILL.md`.

## Komponentindeks (alle eksporterte navn)
Generert fra `_ds_bundle.js`. Alle nås som `window.AKGolfHQClaudePaper_605a48.<Navn>`.

- **actions** — Button · Chip · FAB · OneThingNow
- **calendar** — AgendaRow · BudgetBar · DayStrip · MaanedKalender · Periodeplan · SessionCard · Tidslinje · TimeGrid · UkeKalender · VisningsVelger · VISNINGER · YearTimeline
- **data** — AiRecap · AiTipCard · DataPreview · DataTable · KpiCard · KpiStripe · NowNext · Region · StatusCircleRow
- **datavis** — AkseFordelingsBar · BarChart · CompareChart · Heatmap · KategoriFjell · LengdeAvvik · LoadChart · PPositionRail · PyramideFasett
- **domene** — AKFormelChip · BenchmarkBadge · DiffKort · FleksMerke · LFaseBadge · LFASER · LiveBar · LiveStatus · NivaStige · OektKort · SpillerKort · TurneringNedtelling · VelvaereKort
- **feedback** — Banner · Callout · EmptyState · Skeleton · TONES
- **forms** — AkFormelVelger · AkFormelLinje · Checkbox · CodeInput · Combobox · DatePicker · FieldMessage · FormField · Radio · RadioGroup · SearchField · SegmentControl · Select · Slider · TextInput · Textarea · Toggle
- **golfdata** — DiagnoseKort · KategoriKravKort · LaunchWindowKort · NesteFokusKort · PuttModellKort · Scorekort · SgTotalKort · SlagLekkasjeKart · SpillerTilstandKort · StrikeSmashKort · TigerFiveKort
- **golfviz** — DispersionMap · GappingChart · HoleStrip · PuttLab · PyramidProgress · SgBar · SgBreakdown · SkillRadarLive · Sparkline · TrendBand
- **layout** — Accordion · CardGrid · Divider · FeaturedCard · FilterPills · KanbanKolonne · KeyValueGrid · ListGroup · ListRow · PageHeader · Pagination · Panel · SectionHeader · Stepper · StickyActionBar
- **navigation** — Breadcrumbs · Icon · QuickLinkBar · Rail · RailIcons · SkipLink · SpillerGruppeVeksler · TabBar · TabPanel · Tabs · ThemeToggle · Topbar
- **overlays** — BottomSheet · ConfirmDialog · Drawer · DropdownMenu · HjelpPopover · Modal · Popover · Toast · Tooltip
- **primitives** — Avatar · SectionLabel · StatusBadge
- **progress** — DotMatrix · GoalProgress · PercentileGauge · PersonalBest · ProgramLadder · ProgressBar · ScoreGauge
- **queue** — ProvenanceDisclosure · QueueCard
- **shell** — CommandPalette · Composer · MeldingsTraad · StatusBar
- **trackman** — KolleStatKort · TrackmanSammendrag · TrajectoryPlot
- **video** — PositionMarker · VideoScrubber

Full komponentbeskrivelse med regler per familie står i `DESIGN-FASIT.md`.
