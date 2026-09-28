# Teknisk plan — PlayerHQ, AgencyOS og analyse (27.09.2026)

Designpass bestilt av Anders 27.09.2026. Bygger på AK Golf Precision Athletics uten ny visuell retning: grafitt primær, lyst tema som standard, natt bare i Live og slagregistrering ute, rust bare signal (maks én), brutto score, «—» for manglende verdi, Caddie/Jarvis lager utkast og mennesket godkjenner.

Kilde i kode: `akgolfsoftware/Golf_Headquarters@main` (se `github.md`). Lest for dette passet: `docs/platform/AGENT-BRIEF.md`, `BUSINESS-RULES.md`, `docs/design-system/design-autoritet.md`, `designsystem/README.md`, `docs/design-system/skjermliste-precision-athletics.md`, `src/app/portal/analysere/page.tsx`, `src/app/admin/analyse/page.tsx`, `src/lib/admin/analyse/faner.ts`, `src/components/workbench/wb-drag.ts`, nav i `src/components/v2/shell.tsx` (`PLAYERHQ_NAV`, `AGENCYOS_NAV`), rundeskjema og tilgang (forrige kontroll).

## 0. Status: kode, design, mangler

| Område | Finnes i kode | Finnes i design (før 27.09) | Mangler i design → laget nå | Mangler i kode | Produktspørsmål |
|---|---|---|---|---|---|
| Tilbake-navigasjon | Hardkodede lenker («← Alle runder») | Enkeltknapper i PageHeader | BackBar til forrige kontekst i alle detaljskjermer (historikk, ellers `parent`) | Historikkbasert tilbake, dirty-guard | — |
| Ulagrede endringer | Nei | Nei | ConfirmDialog «unsaved» før bortnavigering | `beforeunload` + router-guard | — |
| Angre | Nei (toast sier «angre», gjør ikke) | Nei | UndoToast etter flytt, slett, publiser, dupliser, legg til, avvis | Server-side angre innen 8 s eller reverserende handling | — |
| Workbench dra | Native HTML5 (kilder → uke), pointer-dra av økter, ingen touch, ingen tastatur | Pointer-dra mellom dager | Tastatur (piler/Enter), MoveSheet (dag/uke/serie), ConflictSheet (volum, turnering), Dupliser, angre, bekreft publisering | Tastatur, konfliktsjekk, serie, dupliser, angre | — |
| Øktbygger | Liste med opp/ned | Opp-knapp | Tre deler (oppvarming/hoveddel/avslutning), dra fra bank, sortering, Flytt-ark, arbeidskrav som slippmål | Delstruktur i økt, dra fra bank | Skal arbeidskrav lagres per økt eller per øvelse? (anbefalt: per økt, som i designet) |
| Kalender | Lag (`?lag=`), ingen flytting i coach-kalender | Flytt i kit | Dra i ukevisning + Flytt-ark + konflikt (overlapp, tilgjengelighet) + angre | Flytting med varsel til spiller | — |
| Kø | Faner, ingen prioritet | Faner | Sorter prioritet (dra/tastatur/Flytt), angre etter godkjenn/avvis | Lagret prioritet per coach | — |
| Stall | Tabell | Tabell | Velg flere → Legg i gruppe / Tildel plan / Send melding (ingen dra, tilgang synlig) | Bulk-handlinger | — |
| Øktark spiller | Fast rekkefølge | Fast | Endre rekkefølge som forslag til coach, første øvelse låst | Forslag-status på rekkefølge | — |
| Treningsanalyse spiller | `/portal/analysere` = TrackMan-hub + historikk | PH-16/17/18 (SG, TrackMan, runder) | PH-A01–A08 | Alle åtte | Rute: egne undersider eller faner på `/portal/analysere`? (anbefalt: faner, jf. «Analyse samlet») |
| Innsikt coach | `/admin/analyse` faner Spiller/Stall/Etterlevelse | AG-09 | AG-A01–A08 | Oversikt, gruppe uten rangering, datakvalitet, tiltak, rapport, Caddie-forslag | — |

Uavklarte produktbeslutninger som blokkerer lansering: **0**. De to spørsmålene over har en anbefaling Codex kan bygge etter.

## 1. Byggerekkefølge før lansering

1. **Grunnmur (uke 1):** `precision-tokens.css`, lyst tema i `/admin`, `NavigationProvider` (historikk, `back()`, dirty-guard, undo-kø), `BackBar`, `ActionBar`, `ConfirmDialog`, `UndoToast`.
2. **Analysekomponenter (uke 1–2):** `SourceBadge`, `DataQualityBadge`, `PeriodSelector`, `FilterChips`, `TrendChart`, `AxisVolumeBars`, `DistributionPlot`, `ChartTable`, `InsightCard`, `EvidenceDrawer`, `EmptyAnalysisState`. Felles formatering: `fmtSg`, `fmtMissing`.
3. **Dra-og-slipp-kjerne (uke 2):** `@dnd-kit/core` + `@dnd-kit/sortable` (pointer + touch + tastatursensor) bak egne komponenter `SortableList`, `DropZone`, `MoveSheet`, `ConflictSheet`. Én server-kontrakt `moveSession` (se §5).
4. **AgencyOS Workbench og Øktbygger (uke 2–3):** AG-11/PH-11 og AG-14 Øktbygger.
5. **PlayerHQ treningsanalyse (uke 3–4):** PH-A01 → PH-A08. Datalastere i `src/lib/portal-analyse/`.
6. **AgencyOS Innsikt (uke 4–5):** AG-A01 → AG-A08 som faner på `/admin/analyse`.
7. **Resten (uke 5):** Kalender-flytt (AG-05), Kø-prioritet (AG-02), Stall bulk (AG-07), Øktark rekkefølge (PH-03), PH-18-gjennomgang (krever skjemaendring, se codex §8).

## 2. Skjermer som endres

ID-er er prosjektets egne. Anders' liste brukte andre nummer; koblingen står i parentes.

**PlayerHQ**
- PH-01 I dag (PH-01) — BackBar ikke nødvendig (fanerot). Innsikt fra PH-A01 kan vises som ett InsightCard.
- PH-02 Gjør nå + PH-10 Plan: uke (PH-02 Plan) — Flytt + konflikt fantes; nå med UndoToast.
- PH-03 Øktark (PH-03) — BackBar til Gjør nå, «Endre rekkefølge» (forslag til coach, første låst).
- PH-04/05 Live (PH-04/05) — ingen dra. Pause, angre siste registrering, avslutt med bekreftelse. Uendret.
- PH-11 Workbench (spiller) — tastatur, Flytt-ark, konflikt, dupliser, angre. Spillerens endringer = forslag.
- PH-14/15 Tester (PH-11 Tester) — PH-A07 viser utvikling og gyldighet.
- PH-16 Analyse-hub (PH-10 Analyse) — ny inngang «Treningsanalyse» → PH-A01.
- PH-18 Runder (PH-18) — etter-runden-gjennomgang (fra før), rundeanalyse i PH-A06.
- PH-20 Gameplan (PH-20) — uendret, eksempeldata.
- PH-21 Coach-kontakt (PH-21) — BackBar.
- PH-24/25 Meg, abonnement (PH-23 Profil, PH-25 Låst) — BackBar; låst-tilstand fra forrige pass.
- **Nye:** PH-A01 Oversikt · A02 Belastning · A03 Øktkvalitet · A04 Slagdata · A05 Nærspill og putting · A06 Runder · A07 Tester · A08 Datagrunnlag.

**AgencyOS**
- AG-01 Hjem (AG-01) — uendret; «Innsikt» nytt menypunkt.
- AG-02 Kø (AG-11 Kø/godkjenninger) — Sorter prioritet, angre etter godkjenn/avvis. Godkjenn/avvis aldri ved dra.
- AG-04 Innboks (AG-02 Innboks) — BackBar fra detaljer; ellers uendret.
- AG-05 Kalender (AG-03 Kalender) — dra i uke, Flytt-ark, konflikt, angre.
- AG-07 Stall (AG-05 Stall) — Velg flere, bulk-handlinger, synlig tilgangsregel.
- AG-08 Spiller 360 (AG-08 Spillerprofil) — BackBar til Stall.
- AG-11 Workbench (AG-07 Workbench) — som PH-11 + bekreft publisering til spiller/gruppe.
- AG-14 Øktbygger (AG-10 Øktbygger/øvelsesbank) — deler, dra fra bank, arbeidskrav, Flytt-ark, bekreft publisering, angre.
- AG-19 Caddie/Jarvis (AG-19) — forslagene fra analyse samles i AG-A08.
- **Rapporter (AG-14 Rapporter hos Anders)** = AG-A07.
- **Nye:** AG-A01 Oversikt · A02 Spilleranalyse samlet · A03 Grupper · A04 Plan mot faktisk · A05 Datakvalitet · A06 Tiltaksverksted · A07 Rapportbygger · A08 Caddie-forslag.

## 3. Nye felleskomponenter (kontrakter)

Kilde: `components/interaction/*.d.ts` og `components/analysis/*.d.ts` i dette prosjektet. Codex porterer til `src/components/precision/`.

| Komponent | Viktigste props | Merknad |
|---|---|---|
| BackBar | `to`, `onBack`, `trail?`, `actions?` | `to` = navnet på forrige kontekst. 44 px treff. |
| ActionBar | `primary`, `secondary?`, `destructive?`, `status: idle/dirty/saving/saved/error/conflict`, `statusMeta?`, `sticky?` | Mobil: `sticky` over tab-baren. Desktop: i PageHeader/inspector. |
| ConfirmDialog | `kind: destructive/publish/unsaved`, `consequences[]`, `onConfirm`, `onCancel`, `onSecondary?` | Publisering til spiller/gruppe går alltid hit. |
| UndoToast | `message`, `meta`, `onUndo`, `duration=8000` | Én om gangen, nederst over tab-baren. |
| SortableList | `items[{id,label}]`, `renderItem(item, {handle, moveButton, dragging, lifted, locked})`, `onReorder(ids)`, `onMove?`, `locked[]` | Tre veier: dra, tastatur (Mellomrom–piler–Mellomrom, Esc), Flytt-knapp. `aria-live` kunngjør plass. |
| DropZone | `label`, `accept[]`, `onDrop(id)`, `valid`, `reason`, `empty` | Tilstander: idle (stiplet), over (2 px grafitt), ugyldig (rust stiplet + grunn). |
| MoveSheet | `item`, `targets[{id,label,meta,reason,warn,disabled}]`, `scope?`, `note?`, `onConfirm` | Ikke-dra-alternativet. Konflikt vises per mål før valg. |
| ConflictSheet | `conflicts[{kind: kalender/volum/belastning/tilgang/versjon, text, meta}]`, `options[{id,label,description}]` | Første valg er primær. |
| SourceBadge | `source`, `kind`, `date`, `n`, `unit`, `period`, `est` | Uten kilde: «KILDE MANGLER». |
| DataQualityBadge | `level: god/tynn/mangler/utdatert/manuell`, `have`, `need`, `unit`, `age` | `tynn`/`mangler` stenger «forbedring»-tekst. |
| PeriodSelector | `value`, `options`, `compare`, `compareOptions` | Bryter linje. |
| FilterChips | `options[{value,label,axis?}]`, `value[]`, `single?`, `allLabel` | Tom liste = Alle. |
| InsightCard | `kind`, `title`, `cause`, `evidence[[l,v]]`, `recommendation`, `source`, `quality`, `actions[]` (min. 1), `onEvidence`, `draft` | Rust bare `kind="haster"`. |
| EvidenceDrawer | `rows[{label,value,source,date,n}]`, `method`, `uncertainty`, `missing[]` | Tabell, ikke graf. |
| EmptyAnalysisState | `have`, `need`, `unit`, `action`, `secondary` | «X av Y · Z til før analysen vises». |
| TrendChart | `series[{label, values:(number|null)[]}]` (maks 2), `labels`, `symmetric=true`, `zero`, `goal`, `format` | `null` = brudd. SG: symmetrisk skala og tykk nullinje. |
| AxisVolumeBars | `rows[{label, parts:{fys,tek,slag,spill,turn}|null, plan}]` | Farge = akse. Planstrek grafitt. |
| DistributionPlot | `points[{x,y}]`, `range`, `xLabel`, `yLabel` | Tekstsammendrag (n, snitt, SD) alltid. |
| ChartTable | `chart`, `columns`, `rows`, `caption` | Graf ↔ tabell, ett trykk. |

**Utvides:** `Metric` (legg til `n`, `source`, `date` i stedet for fri `meta`), `DataTable` (valgfri avkrysningskolonne for bulk), `Sheet` (`dirty` → ConfirmDialog ved lukk), `PageHeader` (plass for `BackBar` over kicker).

## 4. Datafelter analysen krever

- Økt: `plannedMin`, `actualMin`, `status: planlagt/gjennomført/hoppet_over/avbrutt`, `skipReason`, `rpe (1–10)`, `form (1–5)`, `axes{fys..turn: min}`, `source`, `loggedAt`.
- Uke (beregnet): `plannedMin`, `actualMin`, `acwr`, `acuteLoad`, `chronicLoad`, `weeksMissing[]`.
- TrackMan: per slag `club`, `carry`, `offline`, `ballSpeed`, `clubSpeed`, `spinAxis` (null når ikke målt), per økt `bay`, `importedAt`. Labels på engelsk med stor forbokstav (Carry, Club speed, Spin axis).
- Putting: `distanceFt`, `made`, `context: økt/runde`. Soner 0–3, 3–6, 6–10, 10–20, 20+ ft. Referanse per kategori A–K.
- Runde: `grossScore`, `par`, `sg{ott,app,arg,putt,total}` (null = —), `source: golfbox/manuell/annen_app`, `sourceDate`, `reviewStatus`.
- Test: `value`, `unit`, `betterIs: low/high`, `valid`, `invalidReason`, `takenAt`, `nextAt`.
- Kilde: `kind`, `lastSyncAt`, `count`, `level`, `missing[]`.
- Coach: `followUpFlag: belastning/trend/gjennomforing/datamangel` + `why`, gruppesnitt (ikke per spiller i gruppevisning), import `status: importert/til_kontroll/feilet/mulig_dublett` + `errorCode`, tiltak `status: utkast/publisert/trukket_tilbake`, `createdBy: caddie/coach`.
- Minste datagrunnlag før trend/«forbedring»: 8 økter, 3 runder, 50 slag per kølle, 40 putter, 2 tester.

## 5. Dra-og-slipp: hva bygges med bibliotek, hva med Flytt-ark

**Bibliotek:** `@dnd-kit/core` + `@dnd-kit/sortable`. Erstatter native HTML5 i `wb-drag.ts` (ingen touch, ingen tastatur). Sensorer: Pointer (avstand 6 px), Touch (forsinkelse 200 ms, toleranse 6 px), Keyboard (Mellomrom/piler). Announcements på norsk.

| Flate | Dra (desktop) | Dra (touch) | Alternativ |
|---|---|---|---|
| Workbench uke (AG-11/PH-11) | Økt mellom dager | Nei — trykk økt → «Flytt …» | Tastatur ←/→, Enter = MoveSheet (dag, neste uke, bare denne/hele serien), Dupliser |
| Øktbygger (AG-14) | Bank → del, sortering i del, mellom deler, arbeidskrav → mål | Sortering med håndtak | «+» med valgt del, Flytt-ark mellom deler |
| Kalender (AG-05) | Hendelse til ny dag/tid (30 min raster) | Nei | Arket «Flytt» med tider og konflikt per tid |
| Kø (AG-02) | Prioritet | Håndtak | Flytt-ark med plass; godkjenn/avvis bare med knapp |
| Rapportbygger (AG-A07) | Seksjonsrekkefølge | Håndtak | Flytt-ark |
| Stall (AG-07) | **Nei** | **Nei** | Velg flere → Legg i gruppe/Tildel plan (tilgangsregel vises) |
| Øktark spiller (PH-03) | Egen rekkefølge (forslag) | Håndtak | Tastatur; første øvelse låst |
| Plan/I dag spiller (PH-10) | **Nei** | **Nei** | «Flytt» + konfliktark (fantes) |
| Live (PH-04–08) | **Nei** | **Nei** | Pause, angre siste registrering, avslutt |

**Serverkontrakt `moveSession`:** `{ sessionId, toDate, toTime?, scope: "one" | "series", copy?: boolean, clientVersion }` → `{ ok, session, conflicts: Conflict[], undoToken }`. Konflikt returneres før skriving når `force` mangler. `undo(undoToken)` gyldig i 8 s. `clientVersion` gir `versjon`-konflikt ved samtidig endring.

## 6. Tilstander som må implementeres

| Tilstand | Mønster | Hvor |
|---|---|---|
| Data | Innhold | Alle |
| Tom | EmptyState / EmptyAnalysisState med neste handling | Alle |
| Laster | Mono-setning, ingen spinner | Alle |
| Feil | ErrorState: hva gikk galt, hva er trygt, feilkode i mono, Prøv igjen | Alle |
| Delvis data | DataQualityBadge `tynn` + «—» i celler + «U36 IKKE REGISTRERT» | Analyse |
| Offline | Offline-stripe (SY-01), lokal kø, «sendes når nettet er tilbake» | Live, registrering, Workbench |
| Lesetilgang | Knapper skjult, «Bare lesetilgang» i PageHeader-meta | Innsyn, forelder, TALENT |
| Lagrer | ActionBar `saving`, knapp `loading` | Alle skjema |
| Lagret | ActionBar `saved` + klokkeslett | Alle skjema |
| Konflikt | ConflictSheet / ActionBar `conflict` | Flytt, samtidig redigering |
| Angre | UndoToast 8 s | Flytt, slett, publiser, dupliser, legg til, avvis |
| Dra over / slipp | DropZone `over`/`invalid`, SortableList slipplinje | Dra-flater |

## 7. Testplan

- **Bredder:** 390, 768, 1024, 1280, 1440. `scrollWidth === clientWidth` på `html` og `main`. Ingen `overflow-x: auto` som faktisk ruller.
- **Tastatur:** hver dra-flate kan fullføres uten mus: Tab til håndtak, Mellomrom, piler, Mellomrom; Esc avbryter. Enter på Workbench-håndtak åpner MoveSheet. Fokus tilbake til flyttet element.
- **Touch:** 44 px håndtak, ingen dra i Stall, Plan og Live. Lang-trykk 200 ms i Øktbygger/Kø.
- **Lang norsk tekst:** «Nærspill og putting», «Etter-runden-gjennomgang», spiller «Henrik Dahl-Johannessen» — bryter linje, ingen klipp.
- **Null/manglende data:** hver analyse-skjerm med `parts: null`, `sg: null`, 0 slag → «—», aldri 0; trend stopper ved brudd.
- **Negative SG:** −1,5 og +1,5 samme visuelle lengde. Fortegn og komma («−0,8», «+0,4», «±0,0»).
- **Tilbake:** dyplenke → BackBar til `parent`; navigert → til forrige skjerm. Dirty skjema → ConfirmDialog.
- **Angre:** flytt → angre gir eksakt tidligere tilstand (dag, tid, rekkefølge).
- **Playwright:** port `ui_kits/audit.html`-sjekkene (bredde, én rust, ingen hurtigknapp i PlayerHQ) til `tests/visual/`.

## 8. Kontroll i designprosjektet

- Tilbake/lukk/avbryt: BackBar i alle ikke-rot-skjermer i PlayerHQ og AgencyOS via `parent` eller historikk. Alle ark har Lukk og Avbryt; skjema med endringer spør før lukking (AG-A06).
- Ikke-dra-alternativ: SortableList har alltid tastatur + Flytt-knapp; Workbench, Kalender, Øktbygger, Kø og Rapport har MoveSheet.
- Audit: se `overlevering/codex.md` §9.

## 9. Workbench-hull rettet 27.09.2026 — fysisk plan og turneringsmodul

Anders fant at Workbench manglet en komplett fysisk plan og en komplett turneringsmodul. Begge er nå egne underflater av Workbench (samme motor for coach og spiller) med egne ID-er:

| ID | Flate | Rute (forslag) | Rolle |
|---|---|---|---|
| AG-WB-FYS | Workbench · fysisk plan | `/admin/workbench/[playerId]?pille=fys` | Coach, spiller- eller gruppemodus |
| AG-WB-TURN | Workbench · turneringer | `/admin/workbench/[playerId]?pille=turn` | Coach |
| PH-WB-FYS | Fysisk plan (spiller) | `/portal/tren/fys-plan` | Les og gjennomfør |
| PH-WB-TURN | Turneringsplan (spiller) | `/portal/tren/turneringer/[id]` | Les, kryss av, evaluer |

Innganger: AG-11 (knappene «Fysisk plan» og «Turneringer»), PH-10 Plan (samme), PH-01 I dag (kort «Neste turnering»), AG-A04 Plan mot faktisk (handlinger), AG-A06 Tiltaksverksted (tiltak kan legges i fysisk plan).

### Fysisk plan
- **Blokk:** navn, mål, uker (6-ukers standard, fritt 4–8), deload-uke, testuke, status (utkast/publisert), kilde og dato. Flere blokker i rekkefølge (Styrke · grunn → Kraft · overgang).
- **Ukevolum:** plan minutter, plan tonnasje, faktisk minutter per uke. Deload og testuke merket.
- **Økter:** Styrke, Kondisjon, Bevegelighet/skadeforebygging, med dag, tid og varighet. Øktene ligger også i ukeplanen som FYS og peker til blokken.
- **Øvelse:** navn, område (underkropp, overkropp, kjerne, kondisjon, bevegelighet, skadeforebygging), serier, reps, kg, RIR, hvile, tempo; for kondisjon varighet og sone/intensitet. Motorikk tvinges ikke inn for FYS.
- **Planlagt mot gjennomført:** sett × reps · kg per øvelse, tonnasje, minutter, RPE og dagsform. Manglende registrering «—» og «Delvis».
- **Handlinger:** Legg til fysisk blokk, Legg til øvelse, Kopier uke, Juster progresjon, Flytt økt, Lagre delvis, Lagre, Publiser til spiller (bekreft), Angre.
- **Dra:** desktop kan dra en fysisk økt mellom dager. Sett, reps og kg endres bare med stepper. Mobil: Flytt-ark. Turneringsdag gir konfliktark.
- **Spiller (PH-WB-FYS):** ser blokk og uke, registrerer sett/reps/kg med stepper, lagrer delvis eller fullfører. Endrer ikke coachens plan.

### Turneringsmodul
- **Årsplan/periode:** liste over turneringer i perioden med uke, dato, bane og type (Trenings-, Utviklings-, Prestasjonsturnering). Konflikter i programmet vises øverst (tre turneringer på tre uker, skoleprøve dagen før).
- **Turnering:** navn, datoer, bane, tee, antall runder, turneringsuke, kilde (GolfBox eller manuell) og status.
- **Forberedelse:** dag for dag i turneringsuka: trening, innspillsrunde, treningsrunde, reise, utstyr, ernæring, søvn/restitusjon, lettere FYS. Hvert punkt kan være synlig eller skjult for spiller.
- **Turneringsdager:** runde 1–4 med dag, tee-tid, start og rutine.
- **Mål og strategi:** prosessmål, resultatmål (brutto), strategi, lenke til gameplan (PH-20, eksempeldata).
- **Etter turnering:** runder med brutto score og til par, SG der det finnes («—» ellers), kilde og dato per runde (GolfBox, manuell, annen app), plassering, coachens evaluering, «Lag tiltak».
- **Handlinger:** Legg til turnering (fra terminliste eller manuelt), Velg turnering, Legg inn forberedelse, Flytt, Lagre delvis, Lagre, Publiser plan (bekreft), Trekk tilbake (bekreft), Angre.
- **Dra:** desktop drar forberedelse mellom dager; turneringsdager er ugyldige mål. Treningsrunde tre dager før eller forberedelse på reisedag gir konfliktark. Mobil: Flytt-ark.
- **Spiller (PH-WB-TURN):** forberedelse dag for dag med egen avkrysning, mål og strategi, etter-turnering med brutto per runde, kilde og notat, lagre delvis eller send til coach.

### Datakontrakter
- `PhysicalBlock { id, playerId|groupId, name, goal, weeks: number[], deloadWeek?, testWeek?, status: "utkast"|"publisert", createdBy, createdAt }`
- `PhysicalWeek { blockId, week, plannedMin, plannedTonnage, doneMin|null, doneTonnage|null, tag?: "deload"|"test" }`
- `PhysicalSession { id, blockId, date, time, kind: "styrke"|"kondisjon"|"bevegelighet", minutes, workbenchSessionId }` — samme økt som FYS i `WorkbenchSession`.
- `PhysicalExercise { id, sessionId, name, area, sets?, reps?, kg?, rir?, rest?, tempo?, durationMin?, zone? }`
- `PhysicalLog { exerciseId, sets|null, reps|null, kg|null, minutes|null, rpe?, form?, status: "delvis"|"fullført", loggedAt }`
- `Tournament { id, name, type: "trening"|"utvikling"|"prestasjon", startDate, endDate, course, tee?, rounds, source: "golfbox"|"manuell"|"wagr"|"datagolf", sourceDate, status }`
- `TournamentPrep { id, tournamentId, date, kind: "trening"|"innspillsrunde"|"treningsrunde"|"reise"|"utstyr"|"ernæring"|"søvn"|"fys", text, minutes?, visibleToPlayer: boolean }`
- `TournamentRound { tournamentId, round, date, teeTime?, start?, gross|null, par, sg: {ott,app,arg,putt,total}|null, source, sourceDate }`
- `TournamentGoals { tournamentId, process: string[], result?, strategy? }` og `TournamentEvaluation { tournamentId, place?, coachNote?, playerNote?, status }`
- Konflikt fra `moveSession` utvides med `kind: "turnering"` og `"skole"`.

### Kalender (AG-05)
Turneringsdager og reise vises som lag «Turnering» i coachkalenderen. Flytting av fysisk økt eller forberedelse inn på turneringsdag gir samme konfliktark som i Workbench.

### Audit 27.09.2026
Målrettet, 390/768/1024/1280/1440, data/tom/laster/feil:
- PlayerHQ PH-01, PH-03, PH-10, PH-11, PH-WB-FYS, PH-WB-TURN × lyst/natt = 240 tilfeller, 0 avvik.
- AgencyOS AG-05, AG-11, AG-A04, AG-A06, AG-WB-FYS, AG-WB-TURN = 120 tilfeller. Første kjøring fant 8 klippinger (dagkolonner for smale på 768 og 1024 i begge nye skjermer). Rettet: 7 kolonner bare fra 1280, ellers kolonner som bryter linje. Andre kjøring 0 avvik.
- Sjekket: horisontal rulling og klipping, høyst én rust, hurtigknapp bare i AgencyOS. Tilbake (BackBar til AG-11/PH-10), Avbryt, Lagre delvis, Lagre og Publiser finnes i begge coachskjermer; Lagre delvis og Fullfør/Send i spillerskjermene.
- **Ikke automatisk verifisert:** dra over / slipp / ugyldig mål, ConflictSheet, UndoToast, stepper-interaksjon, sticky ActionBar på mobil over toast, delvis-tilstand utover de registrerte dataene. Kontrollert for hånd i katalogen, ikke regnet som godkjent.

### Produktspørsmål
1. Skal fysisk plan kunne gis til en hel gruppe med individuelle kg (prosent av 1RM), eller bare felles program? Anbefalt: felles program, individuelle kg per spiller.
2. Skal spilleren selv kunne legge til egne turneringer, eller bare coach? Anbefalt: spilleren kan foreslå, coach godkjenner.
3. Skal forelder se turneringsplanen (reise, ernæring, søvn)? Anbefalt: ja, lesetilgang for spillere under 18.

### Byggerekkefølge (tillegg)
Etter Workbench-kjernen (trinn 4): 4a Fysisk plan (datamodell → AG-WB-FYS → PH-WB-FYS), 4b Turneringsmodul (datamodell → AG-WB-TURN → PH-WB-TURN → kalenderlag). Begge krever skjemaendring og må godkjennes av Anders før migrering.
