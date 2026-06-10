# Claude Design-prompts — Workbench (mobil), Teknisk plan, Økt-visning & Live-økt

> Samlet runde (2026-06-07). Lim inn riktig prompt i riktig Claude Design-prosjekt.
> Hold AgencyOS og PlayerHQ adskilt. Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**.

## Sannhets-regel (begge apper)
- **Motor** (data, modeller, server-actions, hva som virker) → koden / PLATFORM.md er fasit. Gjenbruk — bygg aldri datalaget på nytt.
- **Struktur og utseende** → slank design + Anders' låste beslutninger.
- Tema: PlayerHQ alltid lyst, AgencyOS alltid mørkt. Kun Lucide, ingen emoji, 8pt-grid, mono-tall.

---

# 1 — Mobil-Workbench (full funksjonsparitet med desktop)

Krav: alt desktop-Workbench kan, skal mobilen kunne. Ingenting fjernes — kun layout/berøring legges om. Hver prompt avslutter med en **paritets-tabell** (desktop-funksjon → hvor på mobil).

## 1A — PlayerHQ-prosjektet (lys, spiller-visning)

```
Kjør — bygg den mobil-optimaliserte spiller-Workbench med full funksjonsparitet.

1. RENAME: Samme grep som AgencyOS. Gjør den fulle fler-fils-renamen — hver
   skjerm har sin egen hardkodede kopi, så shared-data.js alene holder ikke.
   Bytt alt synlig: Markus Berg → Øyvind Rohjan, Markus → Øyvind, "MB" → "ØR",
   markus@akgolf.no → oyvind@akgolf.no. Behold interne slug-er (id:"markus-berg",
   id:"mb") urørt — oppslagsnøkler, vises aldri. Coach = Anders Kristiansen (uendret).

2. MODUS-CHIPS: Behold alle fem (Treningsplan · Årsplan · Fysplan · Mål · Drills).
   Ikke trim. Full paritet med desktop — ingenting fjernes, kun layout legges om.

3. PARITET: Start med å liste HVER funksjon i desktop-Workbench (alle moduser,
   uke-/dagsvisning, økt-inspector med alle felt, pyramide-fordeling, aggregater,
   drill-bibliotek med video/steg/notater, mål-redigering, dra-og-slipp, start-økt,
   turnering-detalj). Bygg så mobilen så HVER funksjon finnes. Dra-og-slipp =
   langtrykk for å flytte økt mellom dager.

4. PLAYERHQ-SEMANTIKK: Lyst tema, mobil-først (430px). «Planlegge» i bunn-navet
   åpner denne rett (ingen kortmeny). Coach-låste felter vises som låst (ikke
   redigerbart). Coach-endringer propagerer hit — vis «oppdatert av Anders».

5. Lever paritets-sjekken til slutt: tabell «desktop-funksjon → hvor på mobil»,
   så vi ser svart på hvitt at ingen funksjon mangler.

Kun Lucide, ingen emoji, 8pt-grid, mono-tall. Legg fram kort plan før du bygger.
```

## 1B — AgencyOS-prosjektet (mørk, coach = master)

```
Kjør — bygg den mobil-optimaliserte coach-Workbench med full funksjonsparitet.

1. RENAME: Gjør den fulle fler-fils-renamen (hver skjerm har sin egen kopi, så
   shared-data.js alene holder ikke). Bytt alt synlig: Markus Berg → Øyvind Rohjan,
   Markus → Øyvind, "MB" → "ØR", markus@akgolf.no → oyvind@akgolf.no. Behold
   interne slug-er (id:"markus-berg", id:"mb") urørt. Coach = Anders Kristiansen.

2. MODUS-CHIPS: Behold alle fem (Treningsplan · Årsplan · Fysplan · Mål · Drills).
   Ikke trim. Full paritet med desktop — ingenting fjernes, kun layout legges om.

3. PARITET: Start med å liste HVER funksjon i desktop coach-Workbench: 3-kolonne-
   innholdet (sidebar / uke-rutenett / inspector), alle moduser, økt-inspector med
   alle felt, pyramide-balanse + avviks-varsel, coach-handlinger (notat, video,
   oppgave, melding, godkjenn/eskaler, rediger), spiller↔gruppe-veksler, fokus-pin,
   dra-og-slipp, turnering-detalj. Bygg så mobilen så HVER funksjon finnes.
   Dra-og-slipp = langtrykk for å flytte økt mellom dager.

4. AGENCYOS-SEMANTIKK: Mørkt tema (.dark), ~390px-først. Coachens verktøy —
   åpnes ved å trykke på en spiller HVOR SOM HELST → rett inn i hans Workbench.
   Sticky header: ← tilbake · spillernavn + ØR-avatar · spiller↔gruppe-veksler ·
   uke-stepper · pyramide-balanse m/avviks-badge. Coach = master: redigering i
   bunn-skuffen propagerer til spillerens PlayerHQ-Workbench — vis «sendt til Øyvind».

5. Lever paritets-sjekken til slutt: tabell «desktop-funksjon → hvor på mobil».

Bruk «AgencyOS», aldri «CoachHQ». Kun Lucide, ingen emoji, 8pt-grid, mono-tall.
Legg fram kort plan før du bygger.
```

---

# 2 — Teknisk plan (endre og forbedre teknikk)

Spiller-flaten finnes nesten ferdig i koden; **coach-builderen er den store jobben**. Video-diagnosen er en NY funksjon (ikke i motoren ennå) — Claude Design tegner UI, datalag kobles ved handoff.

## 2A — AgencyOS-prosjektet (coach diagnostiserer og endrer teknikk)

```
Design de tekniske-plan-skjermene for AgencyOS (mørkt tema, coach = master).
Dette er der coachen DIAGNOSTISERER og ENDRER teknikk. Bruk motoren som finnes
i koden/PLATFORM.md — bygg ALDRI datalaget på nytt. Demo-spiller = Øyvind Rohjan,
coach = Anders Kristiansen.

MOTOR (eksisterer — gjenbruk):
TechnicalPlan → TechnicalPlanPosition (P1.0–P10.0) → PositionTask → logs + tmGoals.
- P-posisjoner: P1.0 Adresse · P2.0 Takeaway · P3.0 V.arm parallell · P4.0 Topp ·
  P5.0 Transisjon · P6.0 Halvveis ned · P7.0 Impact · P8.0 Tidlig oppfølging ·
  P9.0 Kølle parallell · P10.0 Finish.
- PositionTask-felt: tittel, beskrivelse, bilde/video, pyramide (TEK), område (SG),
  køller, MORAD: lFase (L_KROPP→L_ARM→L_KOLLE→L_BALL→L_AUTO), cs (CS50–CS100),
  miljø (M0–M5), press (PR1–PR5), rep-mål Dry/Lav/Full (mål + gjort),
  status (PENDING/ACTIVE/DONE/ARCHIVED), trackStatus (PÅ VEI/STAGNERER/FERDIG/INAKTIV).
- TM-mål «Mekanisme 6»: metric, baseline, target, progress%, i mål?
- Treff-rate «Mekanisme 7»: protokoll ROLLING_WINDOW · BEST_OF_N · STREAK · SESSION_GATE,
  korridor min–maks, vindu, krav (X av Y), nåværende treff/streak/best.
- ClubTargets per kølle. PlanSuggestion (AI Caddie-forslag). Audit-logg.
Actions: createTask, updateTaskBasics, deleteTask, reorderPositions, reorderTasks, logReps.

SKJERM 0 — VIDEO-DIAGNOSE (NY funksjon, ikke i motoren ennå — tegn UI-en):
Inngangen til all teknikk-endring. Coachen:
- Laster opp / tar opp svingvideo i to vinkler: DTL (down-the-line) og FO (face-on).
- Scrubber til en P-posisjon; tidslinjen har markører for P1.0–P10.0.
- Sammenligner mot referanse (side-ved-side eller overlegg), tegner enkle
  annotasjoner (linje/vinkel) og markerer hvilken P som AVVIKER + kort notat
  («P4: høyre albue opp/ut — skal være ned/inn») og cue-ord (1–3 ord).
- Fra en flagget P → «Opprett oppgave» som åpner oppgave-modalen FORHÅNDSUTFYLT
  med den P-posisjonen (og forslag til L-fase/CS ut fra spillerkategori).
Vis tidligere diagnoser som en logg (dato, vinkel, flagget P, miniatyr).

SKJERM 1 — Oversikt (/admin/teknisk-plan): tabell per spiller (avatar, navn, HCP,
klubb · aktiv plan · TEK-økter · TEK fullført · åpne). + «Ny teknisk plan-mal».

SKJERM 2 — Plan-builder (/admin/teknisk-plan/[spillerId] / [planId]) — HOVEDFLATEN:
- Hode: plan-navn + periode, oppgave-/P-antall, sist oppdatert. «Ny oppgave».
- Venstre: P-posisjonene som kollapsible rader (dra-og-slipp prioritet, hovedfokus
  = lime-stripe). Inni hver P: oppgave-kort med tag-rad (TEK · område · kølle · L-fase ·
  CS · M · PR) + tre reps-søyler (Dry/Lav/Full, gjort/mål). Flagget-fra-diagnose vises
  med en liten video-markør på P-raden.
- Høyre sidebar: PlanSummary (status, progress%, reps, aktive P, est. ferdig) ·
  TrackMan-mål (kølle · metric · status) · Pyramide-fordeling · Coach-aktivitet (audit).
- OPPGAVE-MODAL (opprett/rediger) med seksjoner: Beskrivelse · Kategorisering
  (pyramide+SG+køller) · MORAD (L/CS/M/PR) · Media (diagnose-klipp + cue-ord) ·
  Rep-mål per hastighet · TM-mål (Mekanisme 6) · Treff-rate (Mekanisme 7, velg protokoll
  + korridor + krav) · Linkede drills.

TEKNIKK-ENDRINGS-FLYTEN skjermen må støtte (AK-metodikk):
Video-diagnose (DTL/FO → hvilken P avviker) → opprett posisjonsoppgave fra P →
progresjon L_KROPP→L_AUTO med stigende CS → blocked→random → treff-rate avgjør når
endringen «sitter» (trackStatus FERDIG) → ny video-diagnose bekrefter → neste fokus.
Vis AI Caddie-forslag (PlanSuggestion) som godkjenn/avvis-kort. Coach-redigering
propagerer til spillerens PlayerHQ — vis «sendt til Øyvind».

REGLER: «AgencyOS», aldri «CoachHQ». Mørkt tema. Kun Lucide, ingen emoji, 8pt-grid,
mono-tall. Legg fram kort plan før du bygger.
```

## 2B — PlayerHQ-prosjektet (spiller jobber med teknikken)

```
Design de tekniske-plan-skjermene for PlayerHQ (lyst tema, mobil-først 430px).
Spilleren GJENNOMFØRER og LOGGER teknikk-arbeidet; coachen eier strukturen.
Bruk motoren i koden/PLATFORM.md — bygg ALDRI datalaget på nytt. Spiller = Øyvind Rohjan,
coach = Anders Kristiansen.

MOTOR (samme som AgencyOS — gjenbruk): TechnicalPlan → Posisjon (P1.0–P10.0) →
PositionTask → logs/tmGoals. Felter: MORAD (L-fase L_KROPP→L_AUTO, CS50–CS100, M, PR),
rep-mål Dry/Lav/Full, status/trackStatus, TM-mål (Mekanisme 6), treff-rate (Mekanisme 7).
Action spilleren bruker: logReps (Dry/Lav/Full).

SKJERM 1 — Oversikt (/portal/tren/teknisk-plan): planene gruppert per periode-fase.
Per plan-kort: navn + periode, status, oppgave-/P-antall, samlet reps current/target i
tre hastigheter, progress%, ukentlig snitt, est. ferdig, forfatter. «Åpne plan».

SKJERM 2 — Plan-detalj (/portal/tren/teknisk-plan/[planId]):
- P-posisjonene som kollapsible rader (hovedfokus øverst). Inni hver P: oppgave-kort
  med tag-rad (TEK · område · kølle · L-fase · CS · M · PR) + tre reps-søyler (Dry/Lav/Full).
- Trykk på en oppgave → bunn-skuff: beskrivelse, cue-ord, VIDEO (se bevegelsen),
  rep-mål, og «Logg reps» (Dry/Lav/Full med +/-), treff-rate-status (X av Y treff,
  streak), TM-mål-progresjon. Coach-eide felter er LÅST (kan ikke redigeres).
- Diagnose-visning (les-modus): på en oppgave kan spilleren se coachens diagnose-klipp
  (DTL/FO) med den markerte P-posisjonen og cue-ordet — så han forstår HVORFOR han
  jobber med dette. Spilleren kan ikke endre diagnosen, bare se den.
- Høyre/under: PlanSummary, TrackMan-mål, Pyramide-fordeling, Coach-aktivitet
  («oppdatert av Anders»).

SPILLER-SEMANTIKK: Spilleren kan logge reps og se framdrift, men ikke endre struktur/
mål (det gjør coachen, og det propagerer hit). Skjermen skal gjøre det åpenbart hvor
i L-fase-progresjonen man er, og hvor nær treff-raten «sitter».

REGLER: Åpnes fra «Gjennomføre/Tren». Lyst tema, mobil-først. Kun Lucide, ingen emoji,
8pt-grid, mono-tall. Legg fram kort plan før du bygger.
```

---

# 3 — Økt-visning & Live-økt (alle Workbench-felter følger økten)

Det som settes i Workbench skal følge økten hele veien — inn i brief-visningen og videre inn i live-økten — så pyramide-område, ferdighet, miljø, lærefase, CS-mål og press alltid er synlige der treningen skjer.

## 3A — PlayerHQ-prosjektet

```
Fyll ut Økt-visning og Live-økt i PlayerHQ (lyst tema, mobil-først) slik at de
viser ALLE planleggings-punktene fra Workbench — ikke bare tittel + drills. Bruk
motoren i koden/PLATFORM.md — bygg ALDRI datalaget på nytt. Spiller = Øyvind Rohjan.

MOTOR (eksisterer — gjenbruk):
TrainingPlanSession + SessionDrill → ExerciseDefinition + TrainingPlanSessionLog.
Alt under er felt som ALLEREDE settes i Workbench og MÅ vises på begge skjermene:
- Identitet: tittel, dato/tid, varighet (durationMin).
- Pyramide-område: FYS/TEK/SLAG/SPILL/TURN — fargekodet chip (samme farger som Workbench).
- Område/ferdighet (skillArea): Utslag · Tilnærming · Nærspill · Putting · Spill.
- Miljø (environment): Range · Bane · Studio · Hjem · Simulator · Gym.
- Lærefase (L-fase): L_KROPP→L_ARM→L_KOLLE→L_BALL→L_AUTO.
- CS-mål (klubbhastighet): CS-nivå for økten.
- Press-nivå: PR1–PR5.
- Begrunnelse (rationale): coachens «hvorfor» for økten.
- Køller (clubsPracticed).
- Drills (SessionDrill, i rekkefølge): navn, beskrivelse/video, serier×reps (repsSets/
  sets/reps), CS-mål per drill (csTarget), notater.

SKJERM A — ØKT-VISNING (brief før start, åpnes når man trykker en økt-rad):
- Topp: tittel, dato/tid, varighet, status, pyramide-område-chip.
- «Klassifiserings-blokk»: alle feltene over som lesbare chips/rader (område, miljø,
  L-fase, CS-mål, press) + begrunnelse fra coach + køller.
- Drill-liste i rekkefølge med serier×reps + CS-mål; trykk en drill → video/steg.
- Stor «Start økt»-knapp → går til Live-økt. Ferdige økter åpnes i lese-modus med loggen.

SKJERM B — LIVE-ØKT (fullskjerm-overlay, kjører økten):
- Behold klassifiserings-chipsene synlige hele tiden (område, L-fase, CS-mål, press) så
  spilleren har konteksten foran seg.
- Gå gjennom drills i rekkefølge: per drill vis mål (serier×reps, CS-mål) + logg GJORT
  (reps/serier) + oppnådd CS + notat. Timer per drill/økt. Marker drill ferdig.
- Avslutning: logg følelse/rating (1–5), totale reps, fri notat → lagres til
  TrainingPlanSessionLog. Vis kort oppsummering (gjort vs mål, pyramide-treff).
- Live-state følger dagens oppførsel (Spor A: reps holdes i økt-state/sessionStorage) —
  ikke løs persistens-gapet i prototypen, gjenspeil dagens flyt.

REGLER: Åpnes fra «Gjennomføre». Coach-satte felter er lese-info (spilleren logger bare
gjennomføring). Lyst tema, mobil-først. Kun Lucide, ingen emoji, 8pt-grid, mono-tall.
Legg fram kort plan før du bygger.
```

## 3B — Tillegg til AgencyOS-prompten (coachens øktvisning)

```
Coachens økt-visning (AgencyOS, mørkt) skal vise NØYAKTIG de samme planleggings-
punktene fra Workbench (pyramide-område, ferdighetsområde, miljø, L-fase, CS-mål,
press, begrunnelse, køller, drills m/serier+reps+CS) + spillerens logg etter
fullføring (rating, gjort vs mål, notat) + coach-handlinger (kommentar/feedback).
Samme felter, mørkt tema, coach kan gi tilbakemelding (coachFeedback).
```

# 4 — Workbench-modusene (detalj + alle under-knapper)

Status mot kode: **Treningsplan · Mål · Ny økt** er data-drevet; **Årsplan ·
Periodisering · Fysplan** mangler redigerings-knappene (kun visning i dag). Coach
(AgencyOS) bygger; PlayerHQ-noten = hva spilleren ser.

## 4.1 Årsplan — AgencyOS-prosjektet

```
Bygg ut Årsplan-modusen i coach-Workbench (AgencyOS, mørkt). Gjenbruk motoren
(PLATFORM.md) — bygg ALDRI datalaget på nytt. Spiller = Øyvind Rohjan.

MOTOR: TrainingPlan (år) · Tournament · TournamentEntry · YearPhase/perioder ·
YearMilestone (turnering/test/review-flagg). Gantt-komponenten finnes
(year-plan-gantt.tsx) — visning er der, redigerings-knappene MANGLER.

SKJERM: 12-måneders gantt + sesong-tre i sidebar (perioder → uker, «nå»-uke markert).
Periode-blokker farget per intensitet (base/build/peak/recovery), turneringsflagg
på tidslinjen.

UNDER-KNAPPER som skal finnes og virke:
- «Legg til turnering» → velg fra turneringskalender (Tournament) → legg på
  tidslinjen som milestone + opprett TournamentEntry for spilleren.
- Trykk en turnering på tidslinjen → FULL Turnering-detalj (ikke et halvt sammendrag).
- «Ny periode» / trykk en periode → åpner Periode-editor (se modus 4.2).
- Dra periode-blokk for å flytte/endre lengde (oppdaterer start/slutt).
- Ekspander/kollaps perioder i sesong-treet.
- «Planlegg mot [turnering]» → genererer/justerer periodisering frem mot peak-dato.

REGLER: «AgencyOS», mørkt. Coach = master, endringer propagerer til PlayerHQ.
Kun Lucide, ingen emoji, 8pt-grid, mono-tall. Kort plan før bygg.
```
PlayerHQ-note: Spilleren ser samme gantt/sesong-tre i les-modus + kan trykke en turnering → full Turnering-detalj. Ingen redigering.

## 4.2 Periodisering — AgencyOS-prosjektet

```
Bygg ut Periodisering i coach-Workbench (AgencyOS, mørkt). Gjenbruk motoren.

MOTOR: PeriodBlock/periode + actions createPeriod/updatePeriod/deletePeriod
(finnes). EditPeriodeModal finnes med: tittel, startdato, sluttdato, hovedmål,
NOTATER, og fokusfordeling-sliders FYS/TEK/SLAG/SPILL/TURN (sum MÅ være 100%).

SKJERM: periode-tidslinje (Grunn → Spesialisering → Turnering) der hver periode
er en blokk med navn, ukespenn og fokusfordeling.

UNDER-KNAPPER som skal finnes og virke:
- «Ny periode» → åpner editor-modalen (alle feltene over).
- Trykk en periode → rediger (samme modal). «Lagre» / «Slett».
- Fokus-sliders: dra → tall oppdateres, sum-validering 100% (vis avvik hvis ikke).
- Fase-type-velger på perioden: Grunnperiode · Spesialisering · Turnering
  (BUILD/STAB/TEST/TRANSFER/PERFORM som underfase hvis relevant).
- Dra periode-grensene på tidslinjen for å endre lengde (start/slutt).
- «Bruk mal» → periode-template (f.eks. «A1 Turnering 12 uker»).
- Vis ideell pyramide-fordeling for valgt kategori×periode som referanse mot
  spillerens faktiske fokus.

REGLER: «AgencyOS», mørkt. Propagerer til PlayerHQ. Kun Lucide, ingen emoji.
Kort plan før bygg.
```
PlayerHQ-note: Spilleren ser periodene + fokusfordeling i les-modus. Ingen redigering.

## 4.3 Treningsplan (uke/dag) — begge prosjekter

```
Wir alle under-knapper i Treningsplan-modusen (uke-/dagsvisning). Gjenbruk motoren
(TrainingPlanSession + drills). Spiller = Øyvind Rohjan.

VISNING: uke-grid (MAN–SØN × tidsrader) + dag-visning, økt-blokker farget per
pyramide-område, «nå»-strek i dag-kolonnen.

UNDER-KNAPPER:
- «Ny økt» → Ny-økt-bygger (se modus 4.6).
- Trykk en økt → Økt-visning med ALLE Workbench-felter (pyramide-område, ferdighet,
  miljø, L-fase, CS-mål, press, begrunnelse, køller, drills) — se del 3.
- Dra økt → flytt til annen dag/tid (oppdaterer scheduledAt).
- «Logg økt» → logg gjennomføring (CS, reps, rating).
- (PlayerHQ) «Be om tilpasning» → sender forespørsel til coach.
- (AgencyOS) coach-handlinger på økt: rediger, kommenter, godkjenn.
- «AI-foreslå uke» → AI-genererer uke-forslag (aiSuggestWeek).

Tema per app (lyst PlayerHQ / mørkt AgencyOS). Kun Lucide, ingen emoji. Kort plan før bygg.
```

## 4.4 Fysplan — AgencyOS-prosjektet

```
Bygg ut Fysplan i coach-Workbench (AgencyOS, mørkt). I dag kun visning — bygg
redigerings-knappene. Gjenbruk fys-modellen.

VISNING: øvelses-tabell (desktop) / kort-stack (mobil). Kolonner per øvelse:
Øvelse · Sett · Reps (min–maks) · Hvile (sek) · %1RM · RIR + logg-felter
(oppnådd kg, RIR, sett, reps/sett).

UNDER-KNAPPER som skal finnes og virke:
- «Legg til øvelse» → velg fra øvelsesbibliotek → sett/reps/hvile/%1RM/RIR.
- Trykk en øvelse → rediger. «Slett øvelse».
- Dra for å endre rekkefølge.
- Uke-/blokk-struktur: legg øvelser i ukerader.
- Vis kobling til FYS-pyramide-andel for spilleren.

REGLER: «AgencyOS», mørkt. Propagerer til PlayerHQ. Kun Lucide, ingen emoji. Kort plan før bygg.
```
PlayerHQ-note: Spilleren ser øvelsene og LOGGER oppnådd belastning (kg + RIR + sett) per rad. Kan ikke endre selve programmet.

## 4.5 Mål — begge prosjekter

```
Bygg Mål-modusen komplett (Workbench). I dag finnes opprett-modal + sidebar-strip;
mål-detalj og «merk oppnådd» MANGLER. Gjenbruk Goal-modellen. Spiller = Øyvind Rohjan.

MOTOR: Goal { tittel, kategori (OUTCOME/PROCESS), type (HCP_TARGET · SG_AREA ·
ROUNDS_PER_MONTH · FREE_TEXT), targetValue, targetDate, status (ACTIVE/ACHIEVED/
ABANDONED), payload }. Action createGoal finnes.

SKJERMER/KNAPPER:
- Mål-liste: kort med navn, kategori, fremgangsbar (farget per område), %/dager igjen.
- «Nytt mål» → modal (tittel, kategori, type, målverdi, måldato, beskrivelse).
- Trykk et mål → MÅL-DETALJ (ny): framdrift over tid, knytning til økter/SG,
  delmål, historikk.
- «Merk som oppnådd» / «Avslutt mål» → endrer status.
- (AgencyOS) coach kan opprette/justere mål for spilleren (propagerer).
- (PlayerHQ) spilleren ser mål + framdrift; kan opprette egne prosess-mål.

Tema per app. Kun Lucide, ingen emoji, mono-tall. Kort plan før bygg.
```

## 4.6 Ny økt (bygger) — begge prosjekter

```
Bygg Ny-økt-byggeren komplett (Workbench-modal/wizard). Gjenbruk motoren
(TrainingPlanSession + SessionDrill + drill-bibliotek). Spiller = Øyvind Rohjan.

STEG/FELTER (alle skal virke):
1. Tema (chip-rad, påkrevd): FYS · TEK · SLAG · SPILL · TURN (auto-foreslått av AI hvis tilgjengelig).
2. Tittel (auto-fylles hvis drill velges).
3. Dato/tid (datetime) + 4. Varighet (min, default 60).
5. Sted/fasilitet (velg anlegg/bay, hjemme, annet).
6. Drill-søk & velg → fyller tittel/varighet/disiplin; legg flere drills i rekkefølge,
   hver med serier×reps + CS-mål.
7. Fokus-notat (begrunnelse).
8. Lenk mål (checkbox over aktive mål).
9. Logg-modus: BLOKK · RANDOM · KONKURRANSE · SPILL-TEST.
«Opprett» → økten legges i uka og åpnes i Økt-visning med alle felt.

(AgencyOS) coach bygger økten for spilleren (propagerer). (PlayerHQ) spilleren kan
bygge egen økt. Tema per app. Kun Lucide, ingen emoji. Kort plan før bygg.
```

---

## Handoff-noter (mine, ikke til Claude Design)
- **Video-diagnose** = ny funksjon, mangler datalag (klipp-lagring + P-markør + kobling til PositionTask). Skal noteres i master-skjermplanen.
- **Treff-rate «Mekanisme 7»** = felt finnes i Prisma (PositionTaskTmGoal, HIT_RATE-protokoller), men beregnings-logikken er ikke implementert ennå.
- **Live-økt Spor A** persistens-gap (reps i sessionStorage, ikke DB) løses i kode-fasen, ikke i prototypen.
- **Manglende Workbench-detalj-skjermer** (kun visning i dag, redigering mangler): årsplan-redigering (legg til/åpne turnering, dra periode), periodisering (drag-grenser + template), fysplan (legg til/rediger/slett øvelse), mål-detalj + «merk oppnådd». Skal spores i `docs/MASTER-SKJERMPLAN.md`.
