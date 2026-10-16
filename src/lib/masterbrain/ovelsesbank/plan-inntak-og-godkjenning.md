# Øvelsesbank — plan for inntak, godkjenning og agent-innhenting

Status: GODKJENT RAMME 2026-08-03 (Anders bestilte flyt + agent-plan denne datoen).
Selve godkjenningsrundene er ikke startet.

## Målbilde

Én kanonisk øvelsesbank i Masterbrain som (1) alle agenter i AK Golf HQ henter fra,
(2) bare inneholder drills med gyldig AK-formel v2, (3) bare inneholder drills Anders
har godkjent, og (4) vokser kontrollert gjennom en fast inntaksflyt.

## Flyten — fem steg

```
KILDE → kandidater/ → formel-påføring → Anders godkjenner → godkjent/ → sync til akgolf-hq
```

### Steg 1 — Inntak til kandidater/
Alt nytt havner i `kandidater/`, aldri rett i `godkjent/`. Krav ved inntak:
- Følger drill-skjemaet (samme feltsett som dagens 895: navn, beskrivelse, disiplin,
  skillArea, kategori-spenn, utstyr, varighet, intensitet, kilde, tags).
- **Kilde er obligatorisk.** En drill uten sporbar kilde (bok, KB, coach-notat,
  transkripsjon) avvises ved inntak. AI-fabrikkerte drills er forbudt.
- Duplikat-sjekk mot både `kandidater/` og `godkjent/` (navn + beskrivelse-likhet).

### Steg 2 — Formel-påføring
AK-formel v2 er låst mot AK Golf HQ sin operative fasit:
19 områdekoder, putting i fot, golfslag i meter, FYS/BANE uten avstandsenhet,
og A=verdensklasse→K=nybegynner.

- Hver kandidat får AK-formel foreslått automatisk fra feltene den har
  (disiplin/skillArea → område, kategori-spenn → kategori, osv.).
- Kandidater med gamle kategoriverdier som `L` må normaliseres til A-K før Anders
  kan godkjenne dem.
- Hver kandidat skal ha fasilitetsprofil før godkjenning:
  `environment`, `fasilitetKrav`, `maaleutstyr`, `longestShotM`,
  `longestShotKind` og `minimumFacilityLengthM`.
- `longestShotM` er lengste slag/rull/kast øvelsen krever. Appen skal ikke
  anbefale øvelsen hvis spillerens tilgjengelige fasilitet er kortere enn
  `minimumFacilityLengthM`.
- Drills der formelen ikke kan settes trygt, flagges `TRENGER_MANUELL_FORMEL`.
- Formel-påføring er maskinelt forslag — den godkjennes sammen med drillen i steg 3.

### Steg 3 — Godkjenning (kun Anders)
- Godkjenningsside i AgencyOS: pulje per disiplin (wedger 155, putting 131, approach
  125, nærspill 124, drills-raw 115, driver 114, elite 85, SG-range 46).
- Per drill: godkjenn / avvis / juster (inkl. formelen). Ett trykk per handling,
  fungerer på mobil.
- Beslutningen lagres med dato. Avviste drills flyttes til `kandidater/avvist/`
  med begrunnelse — de gjeninntas ikke uten ny vurdering.

### Steg 4 — Publisering til godkjent/
Godkjente drills skrives til `godkjent/` (én JSON per disiplin) med felt for
godkjenningsdato, formel og fasilitetsprofil. `godkjent/` er fasit. CI-vakten
validerer skjema, AK-formel v2 og fasilitetskrav på alt i `godkjent/`.

### Steg 5 — Sync til akgolf-hq (obligatorisk, alltid)
- Retningen er **Masterbrain → akgolf-hq**. Appen henter drills fra `godkjent/`.
- Seed-filene i `akgolf-hq/prisma/seed-data/` fases ut som kilde; appens
  import-skript pekes hit. (Egen oppgave i akgolf-hq-repoet.)
- Enhver endring i `godkjent/` utløser sync i samme arbeidsøkt — aldri utsatt.

## Hvordan agenter finner nye øvelser

Fire innhentingskanaler, i prioritert rekkefølge. Felles for alle: output er
kandidater med kilde — aldri fasit, aldri fabrikkert.

### Kanal 1 — Coaching-hverdagen (kontinuerlig, høyest verdi)
Coaching-session-pipelinen (voice memo → transkripsjon → Notion/ak-second-brain)
skannes for øvelser Anders faktisk bruker med spillere. En agent leser nye
transkripsjoner ukentlig og fremmer øvelser som nevnes men mangler i banken, med
transkripsjonen som kilde. Dette fanger Anders' egen metodikk uten at han må skrive.

### Kanal 2 — Eksisterende ubehandlede kilder (engangs-innhøsting)
- **931 MORAD-øvelser** seedet i wang-toppidrett-repoet (kun 17 i bruk) — dedup mot
  de 895 og fremm resten som kandidater.
- **Mac O'Grady-korrespondansen i Notion Mail** (2013–2015) — primærkilde på
  P-posisjonsnivå, aldri systematisk ingestet.
- **2 074 MORAD-transkripsjonsfiler** i ak-second-brain (`raw/morad-transcripts-v2/`).
- **FYS-øvelsesbanken** i wang-toppidrett (16 øvelser med dose/1RM/cue) — dekker
  bankens tynneste område (FYS 4,9 %).
- Spilldag-biblioteket i ak-second-brain (10 komplette SPILL/TURN-formater).

### Kanal 3 — Læringsloggen (feedback-loop, finnes allerede)
`akgolf-hq/scripts/laeringslogg-til-masterbrain.ts` skriver ukas godkjente og
avviste øvelsesforslag tilbake hit. Settes på fast kjøring. Mønstre i avvisningene
brukes til å stramme inntakskravene.

### Kanal 4 — Ekstern research (ved behov, strengest krav)
Research-agenter (bøker, studier, anerkjente coacher) kan foreslå kandidater kun med
navngitt kilde på samme nivå som dagens (Pelz, Utley, Fawcett). Kjøres kun på
eksplisitt bestilling fra Anders — aldri autonomt.

## Evaluering og kvalitetsmål

- **Dekningsmål:** ingen av de 19 områdekodene under 3 % av banken (i dag: FYS 4,9 %,
  TURN 3,7 % — begge må opp).
- **Variasjonsmål:** BLOKK-andelen ned fra 77,9 % — flere RANDOM/KONKURRANSE-drills.
- **Eval-kobling:** `drill_exists`-dimensjonen i holdout-settet aktiveres når
  `godkjent/` får innhold; 20/25-taket ryker og full score blir mulig.
- QA-skriptet fra akgolf-hq (0 ERROR / 16 WARN ved import) porteres hit og kjøres
  i CI på alt nytt i `kandidater/` og `godkjent/`.

## Avhengigheter

1. Godkjenningssiden i AgencyOS må bygges (egen oppgave i akgolf-hq).
2. Appens import fra `ovelsesbank/godkjent/` må kobles på når første batch er godkjent.
3. RAG må embeddes på nytt når tekstkunnskap endres; vanlig sync kopierer bare filer.
