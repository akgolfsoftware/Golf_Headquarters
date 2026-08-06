# Restanse — hva som gjenstår til full designsystem-standard

Skrevet 30.07.2026 (cowork-økt), lagret i prosjektet fra Claude Code s.d.
Erstatter ikke `kart/arbeidsordre-komplett-system-2026-07-29.md` — den definerer
skjermsporet. Dette dokumentet definerer **systemsporet**: hva som skal til før
biblioteket selv holder standarden, og hele den gamle kanonen er portet inn.

Alt merket **[målt]** er lest fra filsystemet i begge prosjekter denne økta.
Alt merket **[anslag]** er klassifisering gjort på navn og familie, ikke på kildelesing.

Eiers beslutninger 30.07.2026:
1. **Hele den gamle kanonen portes** — alle 124 komponenter, ikke bare det Fase B1 krever.
2. **Bolk 0 først** — gulvet lukkes før skala.
3. **De ni utsatte seksjonene besluttes nå**, mot forslagene i avsnitt 5.

---

## 1 · Hva standarden faktisk krever

Standarden er ikke en stilguide. Den er syv porter som allerede er skrevet inn i
`readme.md`, og som hver komponent må gjennom. Status per port:

| Port | Krav | Status |
|---|---|---|
| **P1 · Token-troskap** | `akhq-tokens.css` verbatim, ingen tokens lagt til, fjernet eller omdøpt | grønn [målt: én tokenfil, kopiert fra uploads] |
| **P2 · Filtrippel** | hver komponent har `.jsx` + `.d.ts` + `.prompt.md` | grønn for 63/63 [målt] |
| **P3 · Kaskadelag** | `@layer akhq-base, akhq-container, akhq-modifier`, ingen ulagrede klassenavn | grønn [målt 29.07: 350 klassenavn, 0 ulagrede; 345 beregnet etter dagens rettinger] |
| **P4 · Tilgjengelighetsgulv** | 44 px treffmål med `max()`, kontrast, synlig fokus | **tre åpne avvik** — se Bolk 0 |
| **P5 · Fokuskontrakt** | ti punkter, delt kode i `overlay-focus.jsx`, ingen egne fokusfeller | **ett åpent avvik** — BottomSheet uten fokuserbar node [målt: 0 treff i riggen] |
| **P6 · Spesimenkort** | begge moduser × alle tilstander × to containerbredder for alt som legger om | **restanse** — KpiCard, KpiStripe, ListRow, StatusBadge har viewport-hybrider igjen |
| **P7 · Craft mot referanse** (Port A-krav 2) | squint-test og tetthet mot `agencyos-dashboard-claude-paper.html`, **verifikatøren alene** | **aldri utført av noen som kunne se den** |

Fire av syv porter er åpne. Ingen av dem er store — men P7 kan ikke lukkes av meg,
og P4/P5 er gulv som ikke skal kunne underskrides arkitektonisk.

---

## 2 · Bolk 0 — gulvet (gjøres først, seks punkter)

Dette er hele restansen som står mellom systemet og en revisjonsren tilstand.
Rekkefølgen er den de skal gjøres i.

**0.1 · `guidelines/gulvregel.md` skrives.** Finnes ikke [målt]. Regelen om 44 px
`max()`-gulv, `--floor: 0`-assertionen og unntakslisten lever i dag spredt i readme
og i tre kortfiler. Én fil, med aktør per punkt, og med unntakslisten som en navngitt
liste — ikke som stilltiende aksept.

**0.2 · `SkipLink` 38,9 px [målt] — avgjøres, ikke aksepteres.** Den er kun synlig ved
tastaturfokus og treffes aldri av grov peker. Anbefaling: **navngitt unntak** i
`gulvregel.md` med begrunnelsen skrevet ut, ikke heving til 44 px — en hevet SkipLink
dytter sidens toppinnhold uten å beskytte noen.

**0.3 · `Topbar` sitt søkefelt måler 20,9 px og har ingen `.akhq-`-klasse [målt].**
Nytt funn 30.07, ikke i revisjonens 14. To feil i én: den underskrider gulvet, og den
er stilet uten klassenavn, altså usynlig for klasseinventaret og for lagmigreringen.
Rettes med egen klasse i `akhq-base` og gulv via `max()`.

**0.4 · `BottomSheet` fokuserbar node.** Fokuskontraktens punkt 2 svikter stille:
laget har ingenting å fokusere og ingen `tabindex="-1"` på seg selv [målt: 0 treff].
Fikses i komponenten, ikke i hooken.

**0.5 · Riggen inn i portsjekkene.** `kart/revisjon-gulv-rigg.html` refererte en slettet
komponent og viste tom side i stillhet — hele måleapparatet var dødt mens det så levende ut.
Riggen skal ha selvtest etter samme krav som alle andre sjekker: kjent feilende variant,
oppnåelig grønt, og `ok: false` når instrumentet ikke målte noe.

**0.6 · Viewport-hybridene i KpiCard, KpiStripe, ListRow, StatusBadge.** Fire blad-komponenter
har interne `@media`-regler der de skal ha `@container`. Readme sier de tas «sammen med
template-omskrivingen» — den er ikke utført, så de står fortsatt.

Bolk 0 er lukket når riggen kjører grønt med selvtest, og `gulvregel.md` navngir hvert unntak.

---

## 3 · Portmatrise — gammel kanon (124) inn i Claude Paper (63)

Filtellingene er [målt] i begge prosjekter. Klassifiseringen «finnes / mangler /
komposisjon» er [anslag] der den bygger på navn.

**Sum:** 124 komponenter i `bb9b2b1d` [målt] · 63 i `605a48cc` [målt] ·
**42 av de gamle er allerede dekket** under nytt navn [anslag] ·
**82 fra gammel kanon gjenstår** [anslag] · **+6 som ikke finnes i noen kanon**
(Composer, StatusBar, QueueCard, ProvenanceDisclosure, YearTimeline, VideoScrubber).
**Restansen er 88 poster** [anslag]. Av dem er ca. 15 komposisjoner som skal bli
templates, ikke komponenter — netto **ca. 73 nye komponenter**.

### 3.1 Allerede dekket — navneoversettelse (ingen bygging, kun verifisering)

| Gammel | Ny | Merknad |
|---|---|---|
| `Card` | `Panel` | panel-literalen skrives aldri på nytt |
| `Eyebrow` | `SectionLabel` | mono 10/600 versal |
| `Tag` / `StatusDot` | `StatusBadge` | `kind="tag"` er permanent fargeløs |
| `Input` | `TextInput` + `FormField` | `Input` slettet 29.07 i begge |
| `SegmentedTabs` | `SegmentControl` | |
| `TidsGrid` | `TimeGrid` | |
| `BottomNav` | `TabBar` | |
| `NavRail` | `Rail` | 64 px, alltid mørk |
| `Sheet` | `BottomSheet` | «Panel og Sheet divergerer aldri» leses som Panel/BottomSheet |
| `KpiTile` / `HeroTall` | `KpiCard` | |
| `StatStrip` | `KpiStripe` | container query alt implementert |
| `PercentileBar` | `PercentileGauge` | |
| `RingGauge` | `ScoreGauge` | |
| `Progress` | `ProgressBar` | |
| `Pyramid` / `TidsPyramide` | `PyramidProgress` | FYS/TEK/SLAG/SPILL/TURN |
| `Radar` | `SkillRadarLive` | |
| `HullStripe` | `HoleStrip` | |
| `SgKategoriBar` | `SgBreakdown` / `SgBar` | OTT/APP/ARG/PUTT |
| `SGTrend` / `SgTrend` | `TrendBand` | **verifiser at den faktisk dekker SG-trend** |
| `KategoriStige` | `ProgramLadder` | AK-stigen |
| `DispersionPlot` | `DispersionMap` | mangler baseline + hit-rate (K10) |
| `DeltaIndikator` | absorbert i `KpiCard` | delta med retning og grunnlag |
| `ValidationChip` | `FieldMessage` | |
| `ListRow`, `Accordion`, `Avatar`, `EmptyState`, `Button`, `Icon`, `ThemeToggle`, `Checkbox`, `Textarea`, `Toggle`, `FormField`, `Modal`, `Toast`, `Banner`, `Sparkline`, `GappingChart` | samme navn | |

### 3.2 Gjenstår — per familie, med bølge

**Bølge P1 — skallet og gulvet (blokkerer alt annet, 9 komponenter)**
`Composer` (K6) · `StatusBar` (K7) · `CommandPalette` (K5, gammel `KommandoPalett`) ·
`Popover` · `Tooltip` · `Drawer` · `Divider` · `Skeleton` · `FAB`.
Skallet kan ikke rendres komplett uten de tre første [målt: 0 filer].
`Popover`/`Tooltip`/`Drawer` er de siste overlay-konsumentene av fokuskontrakten —
bygges sammen, ikke spredt.

**Bølge P2 — skjema komplett (6 komponenter)**
`Select` · `Combobox` · `Radio` · `Slider` · `DatePicker` · `CodeInput`.
`DatePicker` er avhengigheten under hele kalenderfamilien. `CodeInput` blokkerer Auth-familien.

**Bølge P3 — struktur og tabell (6 komponenter)**
`DataTable` (K9, sorterbar kolonneheader — blokkerer LedgerTable, BudgetVarianceRow,
RankedInsightList) · `Pagination` · `Stepper` · `FilterPills` · `KanbanKolonne` · `TabSet` (K8).
`DataTable` er den dyreste enkeltkomponenten i restansen [anslag] og den eneste som
blokkerer en hel skjermfamilie (økonomi/rapport).

**Bølge P4 — kalenderfamilien (7 komponenter)**
`UkeKalender` · `MaanedKalender` · `AgendaRow` · `DayStrip` · `Tidslinje` ·
`Periodeplan` · `VisningsVelger`.
Denne familien får flest modifikatorer av alle — den skal arve kaskadelagene, ikke
kjede `:not()`. `Periodeplan` er GRUNN/SPESIALISERING/TURNERING og har ingen
motpart i noe generisk bibliotek.

**Bølge P5 — datavisualisering (9 komponenter)**
`BarChart` · `CompareChart` · `Heatmap` · `LoadChart` · `AkseFordelingsBar` ·
`LengdeAvvik` · `PPositionRail` · `PyramideFasett` · `KategoriFjell`.
`PPositionRail` (P1.0–P10.0) er MORAD-arven og har ingen erstatning — den er faglig
kjerne, ikke pynt. `LoadChart` er lastestyring mot de 13 invariantene.

**Bølge P6 — golfdata (11 komponenter)**
`SgTotalKort` · `TigerFiveKort` · `DiagnoseKort` · `KategoriKravKort` ·
`LaunchWindowKort` · `NesteFokusKort` · `PuttModellKort` · `Scorekort` ·
`SlagLekkasjeKart` · `SpillerTilstandKort` · `StrikeSmashKort`.
`PuttModellKort` overlapper delvis `PuttLab` — avklares ved bygging [anslag].
`KategoriKravKort` er A–K-kravene og de 20 testprotokollene.

**Bølge P7 — TrackMan (3 komponenter)**
`TrackmanSammendrag` · `KolleStatKort` · `TrajectoryPlot`, pluss utvidelse av
`DispersionMap` med baseline og hit-rate (K10).
Dette er TrackMan Truth Layer i UI. Bølgen har direkte strategisk vekt.

**Bølge P8 — domene (27 gamle, ca. 12 blir komponenter, ca. 15 blir templates)** [anslag]
Komponent: `SpillerKort` · `OektKort` · `AKFormelChip` · `LFaseBadge` · `NivaStige` ·
`BenchmarkBadge` · `FleksMerke` · `LiveStatus` · `LiveBar` · `DiffKort` ·
`TurneringNedtelling` · `VelvaereKort`.
Template/komposisjon (bygges i `templates/`, ikke `components/`):
`AnbefalingsKort` · `BarnProgresjonKort` · `BookingKort` · `BookingVeiviser` ·
`DeltakerListe` · `FakturaRad` · `FokusSpillerBlokk` · `KvitteringKort` ·
`Laeringstrapp` · `OppgaveKort` · `SGSplittKort` · `SamtykkKort` ·
`TestResultatKort` · `TidsVelger` · `VarselRad`.
Skillet følger skjermregelen: er den en rad eller et kort satt sammen av ListRow,
Panel og KeyValueGrid, er den en komposisjon — ikke en ny klasse i inventaret.

**Bølge P9 — resten (10 komponenter)**
`QueueCard` + `ProvenanceDisclosure` (K1, «Hvorfor?»-kravet) · `YearTimeline` (K11,
årshjul) · `VideoScrubber` (K12, MORAD-videoanalyse) · `MeldingsTraad` ·
`HjelpPopover` · `AiTipCard` · `DataPreview` · `FeaturedCard` · `SpillerGruppeVeksler`.

### 3.3 Regel som gjelder hele porten

Ingenting fra `bb9b2b1d` kopieres som stil. Tokens, fonter (Inter/Newsreader/Familjen
Grotesk), farger og hex-verdier derfra er **avviklet**. Det som portes er
**anatomien** — hvilke data komponenten viser, hvilke handlinger den har, hvordan
den legger om. Alt uttrykkes på nytt i Poppins/Lora/IBM Plex Mono og
`akhq-tokens.css`. Samme regel som for referanse-HTML-en.

Hver portet komponent leveres med full trippel, spesimenkort i begge moduser × alle
tilstander × to containerbredder, og går gjennom P1–P6. P7 krysses av verifikatør.

---

## 4 · Rekkefølge — systemspor og skjermspor parallelt

```
Bolk 0 (gulvet, 6 punkter)
   ↓
Bølge P1 (skall) ────────────────► Fase B1.1 PlayerHQ Analyse kan starte
   ↓                                    (golfviz finnes allerede)
Bølge P2 (skjema) ─────────────► Fase B4 Auth kan starte
   ↓
Bølge P7 (TrackMan) ───────────► Fase B1.2 PlayerHQ TrackMan
   ↓
Bølge P4 (kalender) ───────────► Fase B1.4 Workbench
   ↓
Bølge P3 (tabell) ─────────────► Fase B3 økonomi/rapport
   ↓
Bølge P5, P6, P8, P9 ──────────► Fase B2, B3 resten
```

Skjermsporet måles mot **223** (readmens nevner etter at klubbflatene gikk ut).
Systemsporet måles mot **151** (63 finnes + 88 gjenstår) [anslag].
Begge tall rapporteres i `kart/` etter samme [målt]-disiplin.
Dekning i dag: **2 av 223 skjermer (0,9 %)** [målt 29.07] ·
**63 av 151 komponenter (42 %)** [anslag].

---

## 5 · De ni utsatte seksjonene — innholdsforslag til beslutning

Forslag per seksjon, bygget på funksjonskartet og den gamle kanonens ui_kits-skjermer.
**Ingenting designes før hver rad er godkjent eller avvist.** Åpne beslutninger er
samlet i `kart/beslutningsliste-seksjoner.md`-sporet nederst.

### 5.1 `ko` — køen
**Forslag:** blandet kø, coaching og drift i samme liste, sortert på hva som taper mest
på å vente. Rader: godkjenn ukeplan · CaddieDraft til gjennomlesing · øktforespørsel ·
ubetalt faktura over forfall · manglende politiattest · samtykke som utløper.
Hver rad har avsender (menneske eller agent), alder, og én primærhandling.
Agenter er avsendere, aldri destinasjoner.
**Komponenter:** `QueueCard` + `ProvenanceDisclosure` + `ListGroup` + `ConfirmDialog`.
**Beslutning som trengs:** skal køen kunne utsettes (snooze), og i så fall — forsvinner
raden, eller får den en synlig «utsatt til»-tilstand?

### 5.2 `okonomi`
**Forslag:** ett selskap om gangen med konserntotal øverst — fem regnskap side om side
er uleselig på telefon, og telefonen er der spørsmålet stilles. Faner: Resultat ·
Fakturaer · Timegrunnlag · Budsjett mot faktisk.
**Komponenter:** `DataTable` (blokkerende) + `KpiStripe` + `FakturaRad`-komposisjon.
**Beslutning:** skal timegrunnlag → faktura være ett trykk fra øktloggen, eller en
egen godkjenningsrunde? Anbefaling: godkjenningsrunde — en økt kan endres etter at den er logget.

### 5.3 `booking`
**Forslag:** tre innganger — coach booker for spiller, spiller booker selv i PlayerHQ,
og drop-in mot Mulligan-simulatorene. Veiviser i fire steg: hva · hvem · når · bekreft.
**Komponenter:** `BookingVeiviser`-template + `TimeGrid` + `Stepper` + `DatePicker`.
**Beslutning:** skal avbestillingsfrist og gebyr være synlig i steg 4, eller først i kvitteringen?

### 5.4 `kalender`
**Forslag:** fire visninger — dag, uke, måned, år (årshjul). Uke er standard på desktop,
dag på mobil. Perioder (GRUNN/SPESIALISERING/TURNERING) vises som bakgrunnsbånd i
måned- og årsvisning, ikke som hendelser.
**Komponenter:** hele Bølge P4 + `YearTimeline`.
**Beslutning:** skal kalenderen vise alle fem selskap samtidig med farge per selskap,
eller filtrere til ett? Anbefaling: filtrer, med «alle» som eksplisitt valg.

### 5.5 `drift`
**Forslag:** dagens drift på én flate — simulatorbelegg nå, dagens økter med oppmøte,
åpne adgangssaker, vedlikeholdslogg. Ikke en meny, en tilstand.
**Komponenter:** `StatusBar` + `StatusCircleRow` + `ListGroup` + `LiveStatus`.
**Beslutning:** hører varelager (Skarpnord Golf Products) i drift, eller er det en egen flate?
Anbefaling: egen flate — annen kadens, andre roller.

### 5.6 `plan`
**Forslag:** planhierarkiet som én flate med tre nivåer: årsplan → periodeplan → ukeplan,
med øktplan som artefakt i panel. Versjonering synlig: utkast, publisert, endret siden publisering.
**Komponenter:** `Periodeplan` + `DiffKort` + `Composer` + `StickyActionBar`.
**Beslutning:** hvem kan publisere en ukeplan til spiller — kun eier, eller også Markus
for junior? Dette er en rolle-/CBAC-beslutning før det er en designbeslutning.

### 5.7 `stall-plus`
**Forslag:** stall sortert etter hvem som trenger deg, ikke alfabetisk. Sorteringssignal:
dager siden sist økt · avvik mot plan · åpne LIFE-koder · lastavvik mot invariantene.
Per spiller: dashboard, analyse, fremgang, tester.
**Komponenter:** `SpillerKort` + `FokusSpillerBlokk` + `SpillerTilstandKort` + `Tidslinje`.
**Beslutning:** skal «trenger deg»-signalet være synlig som begrunnelse på kortet
(«9 dager siden sist»), eller kun som sorteringsrekkefølge? Anbefaling: synlig —
en usynlig sortering blir ikke stolt på.

### 5.8 `agenticos`
**Forslag:** kjøringsoversikt, ikke agentmeny. Liste over kjøringer med agent, utløser,
varighet, utfall og lenke til artefaktet den produserte. Feilede kjøringer øverst.
**Komponenter:** `ListGroup` + `ProvenanceDisclosure` + `AiRecap` + `StatusBadge`.
**Beslutning:** skal en kjøring kunne startes manuelt herfra, eller er flaten kun lesing?
Anbefaling: kun lesing pluss «kjør på nytt» — å starte fra bunn hører i køen.

### 5.9 Fullskjerm-familien (ikke i utsatt-lista, men udesignet i alle kanoner)
Live økt · runde-føring · testgjennomføring · feiring. Egen chrome uten TabBar og
uten Rail. Dette er et nytt komposisjonsmønster, ikke nye komponenter.
**Beslutning:** hvordan avsluttes en fullskjerm-flate — eksplisitt «Avslutt økt»
med bekreftelse, eller autolagring med diskré exit? Anbefaling: eksplisitt, med
ConfirmDialog. En økt som forsvinner er coachingdata som forsvinner.

---

## 6 · Det som ikke kan lukkes herfra

**Port A-krav 2 (craft mot referanse)** er verifikatørens alene og er aldri utført av
noen som kunne se rendret output. Den kan ikke lukkes fra denne siden, og systemet kan
ikke meldes ferdig uten den. Det er den ene porten som krever at eier — eller en
verifikatør med rendret side — ser de to flatene side om side mot
`uploads/agencyos-dashboard-claude-paper.html`.
