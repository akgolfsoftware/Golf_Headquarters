# Status — hva som mangler før designsystemet er KOMPLETT (31.07.2026)

Skrevet fra Claude Code på eiers ordre, etter morgenrapporten (`kart/fremdrift-fase2.md`).
«Komplett» betyr her: samme standard som de 74 leverte komponentene og de 5 leverte
templatene holder i dag — full filtrippel, spesimenkort (begge moduser × alle tilstander ×
to containerbredder), `@layer`, målt gulv, assertions sett feile, P1–P6 grønne, P7 av
verifikatør. Tall merket [målt] er fra morgenrapporten; resten er restansens [anslag].

## Totalbildet

| Spor | Ferdig | Gjenstår | Totalt |
|---|---|---|---|
| Komponenter | 74 (49 %) | **77** | 151 |
| Hi-fi-skjermer (templates) | 5 (2,2 %) | **~30 maler** som dekker de 218 resterende rutene | 223 ruter / ~35 maler |
| Wireframes | alle | 0 (venter kun på eiers review) | — |
| Porter P1–P6 på levert arbeid | grønne [målt] | 3 restpunkter (se §3) | — |
| Port P7 (craft, verifikatør) | 2 gamle templates | **alle 3 nye templates + alle 8 nye komponenter + alt fremtidig** | — |

## 1 · De 77 komponentene som gjenstår, per bølge

**Bølge P1 — rest (3):** `Popover` · `Tooltip` · `Drawer`. De siste tre
fokuskontrakt-konsumentene; bygges sammen, deler `useOverlayLayer`.

**Bølge P2 — skjema (6):** `Select` · `Combobox` · `Radio` · `Slider` · `DatePicker` ·
`CodeInput`. Blokkerer: `DatePicker` → hele kalenderfamilien + snooze-tidsvalget;
`CodeInput` → Auth-malen.

**Bølge P3 — struktur/tabell (6):** `DataTable` · `Pagination` · `Stepper` ·
`FilterPills` · `KanbanKolonne` · `TabSet` (K8). `DataTable` er dyrest i hele restansen
og blokkerer økonomi-/rapportfamilien (S11, S13).

**Bølge P4 — kalender (7):** `UkeKalender` · `MaanedKalender` · `AgendaRow` · `DayStrip` ·
`Tidslinje` · `Periodeplan` · `VisningsVelger`. Blokkerer S4 Kalender og deler av Workbench.

**Bølge P5 — datavisualisering (9):** `BarChart` · `CompareChart` · `Heatmap` · `LoadChart` ·
`AkseFordelingsBar` · `LengdeAvvik` · `PPositionRail` · `PyramideFasett` · `KategoriFjell`.
`PPositionRail` er MORAD-kjernen (P1.0–P10.0) — ingen generisk erstatning finnes.

**Bølge P6 — golfdata (11):** `SgTotalKort` · `TigerFiveKort` · `DiagnoseKort` ·
`KategoriKravKort` · `LaunchWindowKort` · `NesteFokusKort` · `PuttModellKort` · `Scorekort` ·
`SlagLekkasjeKart` · `SpillerTilstandKort` · `StrikeSmashKort`.

**Bølge P7 — TrackMan (3 + 1 utvidelse):** `TrackmanSammendrag` · `KolleStatKort` ·
`TrajectoryPlot` + utvidelse av `DispersionMap` med baseline/hit-rate (K10).
Blokkerer PlayerHQ TrackMan og Live-økt (S7/S8).

**Bølge P8 — domene (12 komponenter):** `SpillerKort` · `OektKort` · `AKFormelChip` ·
`LFaseBadge` · `NivaStige` · `BenchmarkBadge` · `FleksMerke` · `LiveStatus` · `LiveBar` ·
`DiffKort` · `TurneringNedtelling` · `VelvaereKort`. (De ~15 øvrige P8-postene er
komposisjoner som blir templates — telles i skjermsporet, ikke her.)

**Bølge P9 — rest (8):** `YearTimeline` (K11) · `VideoScrubber` + `PositionMarker` (K12) ·
`MeldingsTraad` · `HjelpPopover` · `AiTipCard` · `DataPreview` · `FeaturedCard` ·
`SpillerGruppeVeksler`. (QueueCard + ProvenanceDisclosure er levert.)

**K-nummer med åpen beslutning (2):**
- **K2 `StatTile`/`StatRow`** — avklart som innramming av `KpiCard`/`KpiStripe`, men
  beslutningen «eier komponenten kort-chromen, eller konsumenten?» er ikke tatt.
- **K3 `SessionCard` + K4 `BudgetBar`** — ikke påbegynt; blokkerer S5 Workbench (hi-fi 4).

Sum: 3+6+6+7+9+11+4+12+8 = 66 navngitte + K2-innramming + K3 + K4 + øvrige
P8-avklaringer ≈ **77** (matcher 151 − 74).

## 2 · De ~30 skjermmalene som gjenstår (hi-fi 4 → slutt)

I porteringsrekkefølge fra masterordren:

| # | Skjerm | Blokkeres av |
|---|---|---|
| 4 | S5 Workbench (tre soner) | K3 `SessionCard`, K4 `BudgetBar` |
| 5 | S4 Kalender | bølge P4 |
| 6 | S6 Alt/indeks | ingenting — `CommandPalette` finnes nå |
| 7 | PlayerHQ Analyse (5 faner) | ingenting — golfviz finnes; første ekte test av 9 ubrukte komponenter |
| 8 | PlayerHQ TrackMan | bølge P7 |
| 9 | Gjør/økt + fullskjerm-malen | fullskjerm-chrome (nytt komposisjonsmønster, [natt 9] eksplisitt exit) |
| 10 | Liste+detalj-malen (~30 PHQ-ruter) | ingenting |
| 11 | Meg/innstillinger-malen (~25 ruter) | ingenting |
| 12 | PlayerHQ Workbench | K3/K4 + PHQ-variant |
| 13 | Foreldreportal-malen (11 ruter) | ingenting |
| 14 | Auth-malen (12 ruter) | `CodeInput` (bølge P2) |
| 15+ | Gameplan/baneguide · PHQ kalender · booking [natt 3] · coach-hub · S7 Live-økt · S8 TrackMan-analyse · S9 Testkjøring · S10 Videoanalyse · S11 Økonomi · S12 Booking-belegg · S13 Varelager · S15 Årshjul · spillerprofil full flate · ~15 P8-artefaktkomposisjoner (Faktura, Testresultat, Samtykke, Booking-veiviser m.fl.) | P3/P4/P5/P6/P7-bølgene + `YearTimeline`/`VideoScrubber` |

S14 marketing-editor er fortsatt utenfor runden (egen produktbeslutning).

## 3 · Restpunkter på ALLEREDE levert arbeid (må lukkes for å holde standarden)

1. **Måling mot fersk bundel** [første oppgave neste tur]: BottomSheet-fokusnoden (0.4),
   `.akhq-search-in`, de tre templatene rendret med ekte komponenter (ikke
   skjelett-plassholdere), ListRow-vakten (0 falske positive), 9/9 skillelinjer,
   `role="list"`-attributtene.
2. **Assertions-falsifisering ikke kjørt** for `queue.card.html` og `shell.card.html` —
   kravet «sett feile først» står åpent for nattens 8 komponenter.
3. **P7 craft-porten** — utestående for ALT levert i natt (3 templates + 8 komponenter),
   og for alt fremtidig. Kan kun lukkes av verifikatør/eier med rendret side mot
   referansen. Dette er den ene porten som aldri kan lukkes av forfatteren.

## 4 · Beslutninger som ligger hos eier (blokkerer deler av løpet)

1. Review av wireframe-galleriene (`kart/wf/`) — porten før hi-fi 4+.
2. De ni [natt]-beslutningene — godkjenn eller omgjør (tre har underoppfølging:
   utsatte køraders plassering, standardselskap i kalender, etterkontroll ved delegert
   publisering).
3. K2-beslutningen (kort-chrome: komponent eller konsument).
4. P7-verifisering av nattens leveranser.

## 5 · Ærlig estimat

Med standarden ufravikelig (og det er den): bølge P1-rest + P2 er 1–2 økter; P3–P7 er
de tunge fag-bølgene; P8/P9 + ~30 maler er hoveddelen av gjenstående volum. Dette er
**flere døgns autonomt arbeid**, ikke én natt — og hver økt trenger en P7-runde fra
eier for at «komplett» skal bety noe. Fremdrift rapporteres alltid som
«Dekning x/223 · y/151», aldri som «ferdig» før begge nevnere er fulle.
