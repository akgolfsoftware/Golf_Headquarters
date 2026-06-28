# Teknisk plan — komplett byggeplan + Claude Design-prompt (2026-06-28)

> Samler alt: oppgradering av dagens skjermer + de 4 nye delene + koblinger til eksisterende funksjoner.
> Ett dokument klart for design (Claude Design) og koding (Claude Code). Bygger på audit + review + forbedring +
> videreutvikling (egne docs). Additive DB-endringer per gotchas.md.

## 1. Konsept (styrer alt)
Den tekniske planen gjør svingbevegelsen **repeterbar over tid**. Det avgjørende er **hvordan kølle leveres til
ball** — **P-posisjoner er verktøyet, ikke målet**. Modellen er en levende loop: **data foreslår → coach godkjenner
→ spiller trener → TrackMan beviser → agent varsler stagnasjon.**

## 2. Status — finnes vs nytt (verifisert mot kode)
**~70 % finnes alt** (modeller + admin/spiller-ruter + workbench-kobling): TechnicalPlan→Position→Task, media
(bildeUrl/videoUrl), «Baseline→Mål»-metrikk, AK-formel-koding, rep-mål 3 farter, TrackMan-kobling, auto-oppdatert
fremdrift, TrainingCamp, periodBlock-kobling. **Nytt:** 4 deler + integrasjonene under.

## 3. Byggeplan (faset — verdi etter hver fase)

### Fase 0 — Gjør dagens skjermer handover-klare
- **Token-migrering:** fjern ~28 hardkodede hex + cream-rester (#EFEDE6) i teknisk-plan.css/oppgave-modal.css →
  designsystem-tokens (pyramide-farger → `--pyr-*`). Korrekt i `.dark` (AgencyOS) OG lyst (PlayerHQ).
- Alle tilstander (tom plan/ingen oppgaver/laster/feil/lang tekst) + mobil + 8pt + lime kun som signal.
- UX: løft planens **MÅL + repeterbarhet-fremdrift** over selve P-lista.

### Fase 1 — De 4 nye delene
1. **planNivaa STANDARD/ADVANCED + desimal-P:** toggle på planen. Advanced lar coach bryte en P ned i finere trinn
   (P1.1–P1.9), vist innrykket. `pNummer` er alt fri streng → minimal modell-endring.
2. **Film-vinkel:** `filmVinkel` på oppgaven (FACE_ON/DOWN_THE_LINE/REAR…) + kobling til video-opplasting.
3. **Plan-scope:** slagtype/avstand + grunnslag vs spesialslag på plan-nivå → sammendrag + foreslår relevante P/områder.
4. **Nåsituasjon + tidslinje:** nåsituasjon-snapshot (snitt/TM/SG/media) øverst + tidslinje (gjenbruk
   `year-plan-gantt`) mot periodisering + `TournamentEntry` + `TrainingCamp`.

### Fase 2 — Integrasjoner (gjør planen levende)
1. **Data → foreslåtte oppgaver:** TrackMan-drift / SG-krise / svake tester → foreslå konkrete `PositionTask`
   («faceAngle åpen → P6/P7») via `PlanAction` → godkjenn-kø.
2. **Lukk loopen:** live-økt-logg → auto-oppdatering → TrackMan-import måler om endringen sitter (mål-protokoll
   ROLLING_WINDOW/STREAK) → agent flagger **STAGNERER** til Handlingssenter.
3. **Periodisering/konkurranse/belastning:** respekter periode-regler (store endringer i GRUNN, ikke i TURNERING;
   CS-tak per fase), tim tekniske endringer mot konkurranser, og mat tekniske rep-volum inn i belastnings-monitoren.
4. **AI-utkast + drill/video:** `ai-plan/generate.ts` lager utkast fra nå-situasjon; agent-team/øvelsesbank finner
   drills + video per P-oppgave; koble oppgave → `ExerciseDefinition`.
5. **Benchmark + gruppe + mål:** vis levering vs kategori A–K/WAGR; bruk en plan som **mal på en gruppe** (bulk,
   godkjenn-kø); knytt til **sesongmål** (`Goal`) som ruller opp til Utøver-360 + cockpit.

## 4. Datamodell-endringer (additivt, CREATE TABLE/ALTER via db execute per gotchas)
- `TechnicalPlan`: + `planNivaa` (STANDARD|ADVANCED) · + `maalsetting` (Text) · + `scope` (Json: slagtyper/avstand/grunn-spesial)
  · + `nasituasjon` (Json eller relasjon: snitt/TM/SG-snapshot + media-refs).
- `PositionTask`: + `filmVinkel` (String[]/enum) · + `drillId` (kobling til `ExerciseDefinition`, valgfri).
- Gjenbruk: `pNummer` (fri streng) for desimal-P · `PositionTaskTmGoal` for bevis · `PlanAction` for forslag ·
  `PositionTaskLog` for auto-oppdatering. Ny kilde-merking på forslag (TM/SG/TEST) der relevant.

## 5. Verifikasjon
Hver skjerm gjennom design-gaten: **bygg → uavhengig kritikk → 0 avvik**. `prisma validate/generate`, `tsc`, `eslint`,
`next build` grønt før commit. DB additivt.

## 6. KOMPLETT CLAUDE DESIGN-PROMPT (lim inn)

```
Oppdrag: Design KODEKLARE AgencyOS-skjermer (mørkt terminal-tema) for den VIDEREUTVIKLEDE TEKNISKE PLANEN.
Handover-grade: INGEN stubs, gå rett til kodeklare skjermer, ALLE tilstander (normal/tom/laster/feil/lang tekst),
DESKTOP + MOBIL, eksakte tokens, realistisk AK-demo-data, norsk bokmål. Dagens teknisk-plan-skjermer bruker hardkodede
hex + lys-tema-rester — RETT dem i denne runden til designsystem-tokens (korrekt i mørkt).
Tokens: bg #0A0B0A · tile #171817 · linje #1B1C1A · tekst #F0F0F0 · dempet #7E807A · lime #D1F843 (KUN signal).
Pyramide-farger som tokens: FYS #005840 · TEK #B8852A · SLAG #2563EB · SPILL #D1F843 · TURN #A32D2D.
Fonter Inter / Inter Tight / JetBrains Mono. Lucide. 8pt-grid. ADHD: én ting i fokus, «hva nå» åpenbart.

KONSEPT: Repeterbar levering av kølle til ball. P-posisjoner er VERKTØYET, ikke målet. Data foreslår → coach
godkjenner → spiller trener → TrackMan beviser → agent varsler stagnasjon.

SKJERMER:
1. OPPRETT/REDIGER PLAN: navn · MÅLSETTING · startdato · sluttdato · SCOPE (slagtype/avstand, grunnslag vs
   spesialslag) · PRESISJONSNIVÅ Standard (P1–P10) eller Advanced (bryt P ned i desimaltrinn P1.1–P1.9 for nærspill).
2. PLAN-OVERSIKT (hovedskjerm, token-riktig mørkt):
   - TOPP: planens MÅL + «repeterbarhet»-fremdrift (hvor stabil er leveringen nå vs mål) — størst element, ikke P-lista.
   - NÅSITUASJON-snapshot: gjennomsnitt · TrackMan-data · SG-statistikk · bilder/video.
   - TIDSLINJE: planen mot ÅRSPLAN + PERIODISERING (GRUNN/SPES/TURN/EVAL/FERIE) + KONKURRANSER + TRENINGSSAMLINGER.
   - POSISJONER: P0–P10 (Advanced: desimal-underposisjoner innrykket), hver med oppgaver, fremdriftsbar, hovedfokus-markør.
   - FORESLÅTTE OPPGAVER (fra data): kort fra TrackMan/SG/test, f.eks. «faceAngle drifter åpen → oppgave P6», med GODKJENN/AVVIS.
3. OPPGAVE (legg til/rediger, egen skjerm): velg P (auto P1, Advanced desimal) · beskrivelse (tekst + bilde + video) ·
   MÅLBAR METRIKK baseline → mål (f.eks. «hofterotasjon 45° i P4») · FILM-VINKEL (Face on · Down the line · Rear) ·
   REP-MÅL per fase/utstyr i 3 farter DRY/LAV/FULL (f.eks. «bare kropp 1500x») · AK-formel-koding (L-fase · fart-sone
   m/ mph · miljø · press · kølle) · KOBLE TIL DRILL fra øvelsesbanken · knyttet TrackMan-mål.
4. SPILLER-WORKBENCH · TEKNISK TRENING: viser ALLTID oppdatert plan — alle UFERDIGE tekniske oppgaver på tvers av
   alle slag. Logg reps → fremdrift AUTO-oppdateres. Etter TrackMan-import: vis om endringen SITTER (mål-protokoll)
   + tydelig STAGNASJON-varsel der den ikke gjør det.
5. GRUPPE / AI: bruk en plan som MAL på en hel gruppe (bulk, godkjenn-kø per spiller) · AI-UTKAST av teknisk plan
   fra spillerens nå-situasjon (coach redigerer/godkjenner).

Lever alle kodeklart, alle tilstander, desktop + mobil. Gjør planens MÅL (repeterbar levering) synlig — ikke bare en P-liste.
```
