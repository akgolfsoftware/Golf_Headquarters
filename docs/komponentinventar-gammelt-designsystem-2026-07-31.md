# Komponentinventar — gammelt designsystem (2026-07-31)

Skrevet før sletting av utgåtte design-dokumenter. Formålet er ett eneste:
**ingen komponent skal gå tapt fordi den gamle kanonen ble ryddet bort.**

Kilde: Claude Design-prosjektet **«AK Golf HQ Design System»**
(`bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`) — den avviklede v2-kanonen, retning C «Presis».
Fasit i dag er **«AK Golf HQ — Claude Paper»** (`605a48cc-81e8-44bd-94d2-07d50a97370a`).

Det gamle prosjektet slettes IKKE. Det blir stående som referanse for hva en komponent
skal GJØRE. Utseendet skal ikke kopieres — alt bygges på nytt i Claude Papers
Anthropic-uttrykk (samme standard som de 74 leverte komponentene).

**Dekning ved skriving: 5/223 skjermer · 74/151 komponenter.** Ingenting under er ferdig.

---

## 1 · Hva det gamle prosjektet inneholder

124 komponenter i 13 grupper, hver med `.jsx` + `.d.ts` + `.prompt.md`:

| Gruppe | Antall | Komponenter |
|---|---|---|
| calendar | 8 | AgendaRow · DayStrip · MaanedKalender · Periodeplan · TidsGrid · Tidslinje · UkeKalender · VisningsVelger |
| core | 8 | Button · Card · DataPreview · Eyebrow · Icon · StatusDot · Tag · ThemeToggle |
| data | 21 | AkseFordelingsBar · BarChart · CompareChart · DataTable · DeltaIndikator · Heatmap · HeroTall · HullStripe · KpiTile · LengdeAvvik · LoadChart · PPositionRail · PercentileBar · Progress · Pyramid · PyramideFasett · Radar · RingGauge · SGTrend · Sparkline · StatStrip |
| domain | 27 | AKFormelChip · AnbefalingsKort · BarnProgresjonKort · BenchmarkBadge · BookingKort · BookingVeiviser · DeltakerListe · DiffKort · FakturaRad · FleksMerke · FokusSpillerBlokk · KvitteringKort · LFaseBadge · Laeringstrapp · LiveBar · LiveStatus · NivaStige · OektKort · OppgaveKort · SGSplittKort · SamtykkKort · SpillerKort · TestResultatKort · TidsVelger · TurneringNedtelling · VarselRad · VelvaereKort |
| feedback | 5 | AiTipCard · HjelpPopover · ListRow · MeldingsTraad · ValidationChip |
| forms | 12 | Checkbox · CodeInput · Combobox · DatePicker · FormField · Input · Radio · SegmentedTabs · Select · Slider · Textarea · Toggle |
| golfdata | 14 | DiagnoseKort · GappingChart · KategoriKravKort · LaunchWindowKort · NesteFokusKort · PuttModellKort · Scorekort · SgKategoriBar · SgTotalKort · SgTrend · SlagLekkasjeKart · SpillerTilstandKort · StrikeSmashKort · TigerFiveKort |
| kategori | 3 | KategoriFjell · KategoriStige · TidsPyramide |
| marketing | 1 | FeaturedCard |
| nav | 4 | BottomNav · FAB · NavRail · SpillerGruppeVeksler |
| overlays | 8 | Banner · Drawer · KommandoPalett · Modal · Popover · Sheet · Toast · Tooltip |
| structure | 9 | Accordion · Avatar · Divider · EmptyState · FilterPills · KanbanKolonne · Pagination · Skeleton · Stepper |
| trackman | 4 | DispersionPlot · KolleStatKort · TrackmanSammendrag · TrajectoryPlot |

I tillegg: 4 templates (agencyos-dashboard, auth-skjerm, forelder-skjerm, playerhq-skjerm)
og 7 token-filer. Disse erstattes i sin helhet av Claude Paper og skal ikke gjenbrukes.

## 2 · Kalendervisningene (eksplisitt sjekket)

De sju kalenderkomponentene er dekket av **bølge P4** i
`kart/status-til-komplett-2026-07-31.md` (Claude Paper): UkeKalender · MaanedKalender ·
AgendaRow · DayStrip · Tidslinje · Periodeplan · VisningsVelger.
`TidsGrid` er allerede levert i Claude Paper under navnet **`TimeGrid`**.
Bølge P4 er blokkert av `DatePicker` (levert i natt) og blokkerer selv S4 Kalender.

## 3 · Kryss-sjekk: 124 gamle mot Claude Paper (74 levert + 77 planlagt)

**113 av 124 er dekket** — enten levert, planlagt i en bølge, eller navnendret.
Navnendringene som er verifisert:

`TidsGrid`→`TimeGrid` · `Input`→`TextInput` · `SegmentedTabs`→`SegmentControl` ·
`Card`→`Panel` · `Tag`→`Chip` · `StatusDot`→`StatusBadge` · `Eyebrow`→`SectionLabel` ·
`NavRail`→`Rail` · `Sheet`→`BottomSheet` · `KommandoPalett`→`CommandPalette` ·
`BottomNav`→`TabBar` · `ValidationChip`→`FieldMessage` · `HullStripe`→`HoleStrip` ·
`Radar`→`SkillRadarLive` · `Progress`→`ProgressBar` · `RingGauge`→`ScoreGauge` ·
`Pyramid`/`TidsPyramide`→`PyramidProgress` · `HeroTall`/`KpiTile`→`KpiCard` ·
`StatStrip`→`KpiStripe` · `PercentileBar`→`PercentileGauge` ·
`SgKategoriBar`/`SGSplittKort`→`SgBreakdown` · `Laeringstrapp`/`KategoriStige`→`ProgramLadder` ·
`SgTrend`/`SGTrend`→`TrendBand` · `VarselRad`→`ListRow` · `OppgaveKort`→`QueueCard` ·
`AnbefalingsKort`→`AiTipCard` · `TidsVelger`→`DatePicker` · `DispersionPlot`→`DispersionMap` (K10-utvidelse).

### Dekket som template-komposisjon, ikke som komponent

Fire gamle komponenter er i Claude Paper-planen ført som «~15 P8-artefaktkomposisjoner»
— altså maler, ikke biblioteksskomponenter: `FakturaRad` · `KvitteringKort` ·
`TestResultatKort` · `SamtykkKort` · `BookingKort` · `BookingVeiviser`.
Det er en bevisst omklassifisering, ikke et hull — men den må bekreftes når malene bygges.

### ⚠ Tre reelle hull — står ikke i noen bølge og ikke i noen mal

| Komponent | Hva den gjør | Hvor den trengs |
|---|---|---|
| **BarnProgresjonKort** | Foreldrevendt progresjonsvisning for ett barn | Foreldreportalen (11 ruter) |
| **DeltakerListe** | Deltakere på en gruppeøkt/samling | AgencyOS grupper, GFGK/WANG-flater |
| **FokusSpillerBlokk** | Coachens «hvem trenger meg nå»-blokk | AgencyOS cockpit/stall |

Disse tre må enten legges inn i en bølge eller bevisst avskrives. Ubesluttet per 31.07.

## 4 · Regel videre

Ingen fil fra det gamle prosjektet kopieres. For hver komponent som bygges på nytt:
les den gamle `.prompt.md` for å forstå oppgaven og datakontrakten, bygg deretter
fra bunnen i Claude Paper-uttrykket med full filtrippel, spesimenkort, målt gulv,
assertions sett feile og portene P1–P7.
