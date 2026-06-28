# Teknisk utviklingsplan — plan + Claude Design-prompt (2026-06-28)

> Fra Anders' spec. Bygger på eksisterende kode (TechnicalPlan → TechnicalPlanPosition → PositionTask
> + PositionTaskTmGoal + PositionTaskLog + varianter A/B + PeriodBlock — se ak-formel-review). Markerer
> tydelig hva som FINNES vs er NYTT/utvidelse.

## 1. Konsept (filosofi som styrer designet)
Målet med en teknisk utviklingsplan er å gjøre svingbevegelsen **repeterbar over tid**. Det avgjørende er
**hvordan spilleren leverer kølle til ball** — **posisjoner (P-systemet) er verktøyet, ikke målet**. Planen
lages ut fra spillerens **nå-situasjon** og er **alltid linket til all TrackMan-data** spilleren legger inn.

## 2. Skjermer + flyt

### 2.1 Opprett teknisk plan
Felt (alltid, som standard): **navn, målsetting, startdato, sluttdato**, relevant info.
- **Scope:** type slag, avstand, grunnslag vs spesialslag.
- **Presisjonsnivå:** **Standard** (P1–P10) eller **Advanced** (finere, desimal P1.1–P1.9 mellom hele tall;
  for nærspill brytes P-systemet ned — f.eks. chip: P2 = baksving, videre P1.1…P1.9 → P2).

### 2.2 Plan-oversikt (hovedskjerm)
- **Tidslinje-komponent (øverst):** planens varighet visuelt mot **årsplan, periodisering og konkurranser**.
- **Nåsituasjon-blokk:** gjennomsnitt, TrackMan-data, SG-statistikk, **bilder og videoer**.
- **Posisjoner:** liste over alle P-er (P0–P10 standard, eller advanced desimal), hver med antall oppgaver +
  fremdrift + hovedfokus-markør.

### 2.3 Legg til oppgave (egen skjerm)
- Velg **P-posisjon** (auto-fyll P1, legg til flere, f.eks. P2).
- **Beskrivelse:** tekst + bilde + enkel video (lagres).
- **Målbar metrikk i posisjonen:** f.eks. «hofterotasjon 45° i P4 (toppen av baksving)».
- **Film-vinkel å sjekke fra:** Face on · Down the line · Rear view · (flere).
- **Rep-mål per fase/utstyr:** f.eks. «bare kropp 1500x», uten ball lav fart, med ball … i de tre fartene
  DRY/LAV/FULL.
- **AK-formel-koding:** L-fase, fart-sone (kalibrert mph der relevant), miljø, press, kølle. Knyttet TrackMan-mål.

### 2.4 Spiller-workbench · teknisk trening
- Når spiller får plan fra coach ELLER planlegger selv og velger **teknisk trening**, vises ALLTID den
  **oppdaterte tekniske planen for alle slag** — alle **uferdige** tekniske oppgaver er tilgjengelige.
- Logger spiller f.eks. **500 reps «bare kropp, uten ball»**, oppdateres fremdriften **automatisk** i den tekniske planen.

## 3. Datamodell — finnes vs nytt
**FINNES (gjenbruk):** `TechnicalPlan` (start/slutt/status/PeriodBlock/varianter A-B), `TechnicalPlanPosition`
(P-nummer, hovedfokus), `PositionTask` (beskrivelse, AK-formel-koding, rep-mål DRY/LAV/FULL, slagType, køller),
`PositionTaskTmGoal` (TrackMan-mål), `PositionTaskLog` (logget rep → fremdrift), `TechnicalPlanClubTarget`, audit.
**NYTT / UTVIDELSE:**
- `planNivaa` (STANDARD | ADVANCED) på TechnicalPlan + støtte for desimal P-nummer (P1.1–P1.9 …) i advanced.
- Scope-felt: shotType/avstand + grunnslag vs spesialslag.
- `nåsituasjon`-blokk (snapshot: snitt/TM/SG + media-referanser).
- Oppgave-felt: **film-vinkel** (enum FACE_ON/DOWN_THE_LINE/REAR/…), **strukturert posisjons-metrikk**
  (f.eks. {parameter: «hofterotasjon», verdi: 45, enhet: «grader», pPos: «P4»}) i stedet for kun fritekst,
  og **media** (bilde/video) på oppgave-beskrivelse.
- Eksplisitt **tidslinje-komponent** plan ↔ årsplan/periodisering/konkurranser (data finnes; visningen er ny).
- Auto-oppdatering workbench → plan ved rep-logging (logg finnes; koblingen «teknisk trening henter uferdige oppgaver» forsterkes).

## 4. Claude Design — komplett startprompt (kodeklar)

```
Oppdrag: Design KODEKLARE AgencyOS-skjermer (mørkt terminal-tema) for TEKNISK UTVIKLINGSPLAN.
Følg handover-grade: INGEN stubs, gå rett til kodeklare skjermer, ALLE tilstander (normal/tom/laster/feil/lang tekst),
DESKTOP + MOBIL, eksakte tokens, realistisk AK-demo-data, norsk bokmål. Hvis en eksisterende skjerm ikke er 100%
handover-klar, rett den i denne runden.
Tokens: bg #0A0B0A · tile #171817 · linje #1B1C1A · tekst #F0F0F0 · dempet #7E807A · lime #D1F843 (KUN signal).
Fonter Inter / Inter Tight / JetBrains Mono. Lucide. 8pt-grid. ADHD: én ting i fokus, «hva nå» åpenbart.

KONSEPT (styrer alt): En teknisk utviklingsplan gjør svingbevegelsen REPETERBAR over tid. Det avgjørende er
HVORDAN spilleren leverer kølle til ball — P-posisjoner er VERKTØYET, ikke målet. Planen lages ut fra spillerens
NÅ-SITUASJON og er ALLTID linket til TrackMan-data.

SKJERMER:
1. OPPRETT PLAN: navn · målsetting · startdato · sluttdato · relevant info · SCOPE (type slag, avstand,
   grunnslag vs spesialslag) · PRESISJONSNIVÅ Standard (P1–P10) eller Advanced (desimal P1.1–P1.9 for nærspill).
2. PLAN-OVERSIKT (hovedskjerm):
   - TIDSLINJE øverst: planens varighet visuelt mot ÅRSPLAN + PERIODISERING (GRUNN/SPES/TURN/EVAL/FERIE) + KONKURRANSER.
   - NÅSITUASJON-blokk: gjennomsnitt · TrackMan-data · SG-statistikk · bilder · videoer.
   - POSISJONER: liste P0–P10 (eller advanced desimal), hver med antall oppgaver, fremdriftsbar og hovedfokus-markør.
3. LEGG TIL OPPGAVE (egen skjerm): velg P (auto P1, legg til flere) ·
   beskrivelse (tekst + bilde + enkel video, lagres) ·
   MÅLBAR METRIKK i posisjonen (f.eks. «hofterotasjon 45° i P4») ·
   FILM-VINKEL (Face on · Down the line · Rear view) ·
   REP-MÅL per fase/utstyr (f.eks. «bare kropp 1500x», uten ball, med ball) i tre farter (DRY/LAV/FULL) ·
   AK-formel-koding (L-fase · fart-sone m/ mph · miljø · press · kølle) · knyttet TrackMan-mål.
4. SPILLER-WORKBENCH · TEKNISK TRENING: viser ALLTID oppdatert teknisk plan — alle UFERDIGE tekniske
   oppgaver på tvers av alle slag. Spiller logger reps (f.eks. 500 «bare kropp, uten ball») → fremdrift
   oppdateres AUTOMATISK i planen. Vis tydelig hva som gjenstår vs fullført.

Lever alle fire kodeklart, alle tilstander, desktop + mobil. P-posisjoner er verktøy — gjør planens MÅL
(repeterbar levering) synlig, ikke bare en liste posisjoner.
```
