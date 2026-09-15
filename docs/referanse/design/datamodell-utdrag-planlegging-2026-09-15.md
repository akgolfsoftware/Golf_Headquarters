# Datamodell-utdrag — det som allerede finnes i koden (15.09.2026)

Lest direkte fra `prisma/schema.prisma` i AK Golf HQ. Ingen spillerdata, kun feltnavn.
Bruk feltnavnene som de er når prototypen viser data; foreslå nye felt bare der det står «mangler».

## Fasilitet (spillerens treningssteder) — `PlayerFacility`

| Felt | Type | Betyr |
|---|---|---|
| name | tekst | «GFGK range», «Treningslokalet», «Hjemme» |
| type | KLUBBANLEGG · SIMULATOR · TRENINGSSENTER · HJEMME | |
| isIndoor | ja/nei | |
| capabilities | liste av: RADAR · MAT_NET · BUNKER · KAMERA · PUTTING_GREEN_KORT · PUTTING_GREEN_LANG · SHORT_GAME_AREA · DRIVING_RANGE · BANE · SIMULATOR · VEKTSTANG · TRAPBAR · LOPEBANE · MED_BALL | hva stedet har |
| rangeLengdeM | tall (meter) | f.eks. 200 |
| maksPuttLengdeM | tall (meter, vises i fot) | f.eks. 15 |
| radarMerke | tekst | TrackMan · FlightScope · R10 · Mevo+ |
| notes | tekst | |

Øvelser i biblioteket (`ExerciseDefinition.fasilitetKrav`) har samme liste som krav. Tomt krav = kan gjøres overalt.
**Mangler:** gruppetid (`GroupSchedule`) har kun `location` som fritekst, ingen kobling til fasilitet.

## Øvelse i en økt — dose (`TrainingDrillV2` / `SessionDrill`)

| Felt | Betyr |
|---|---|
| durationMinutes | minutter på øvelsen |
| repType | SVINGER_UTEN_BALL · BALLER_SLATT · TID · SETT_REPS |
| repAntall | antall svinger eller baller |
| repMinutter | minutter (når repType = TID) |
| repSett / repReps | sett og reps per sett (styrke) |
| planRepsUtenBall | planlagte reps uten ball |
| planRepsLavFart | planlagte reps i lav hastighet |
| planRepsAuto | planlagte reps i automatikk |
| innslagType · omraadeKode · motorikk · belastning · press · dimensjon · sandTrinn | AK-formelen (fem akser + dimensjon) |
| positionTaskId | kobling til teknisk oppgave (P-posisjon) — reps logges automatisk mot oppgaven |

Øvelsesbiblioteket har standardverdier: `defaultRepsUtenBall / defaultRepsLavFart / defaultRepsAuto`, `defaultSets / defaultReps`, `durationMin`.
**Mangler:** coachens økt-modell (`WorkbenchDrill`) har bare tittel, varighet og formel — dosen må inn der (arbeidslisten OW-3c).

## Gruppe

| Modell | Felt | Betyr |
|---|---|---|
| Group | hovedcoachId | én hovedcoach |
| GroupMember | role: PLAYER · ASSISTANT · COACH, endedAt | medlemskap med rolle |
| GroupSchedule | title, startAt, endAt, location (fritekst), recurring WEEKLY/NONE, kind SAMLING/HELDAGSSAMLING/null, maxParticipants | faste gruppetider |
| WorkbenchSession | groupId, sourceGroupSessionId, hiddenByPlayer, needsPlayerApproval, approvalStatus, seriesId | økt med gruppeopphav; spilleren kan skjule («ikke delta») |
| GroupPeriodBlock | lPhase, startDate, endDate, focus, weeklyVolMin/Max, weeklySessionBudget | gruppens årsplan; rulles ut til hver spillers PeriodBlock |

Regel (bestemt 30.08.2026): gruppeøkta planlegges i grupperegi, men lagres i hver spillers plan med alle detaljer. Endring i gruppeøkta går til alle som ikke har endret sin kopi.
**Mangler:** delt økt med blokker (start/slutt per blokk, ansvarlig coach per blokk). Ingen modell, ingen skjerm.

## Teknisk utviklingsplan (P1–P10)

| Modell | Felt | Betyr |
|---|---|---|
| TechnicalPlan | navn, status DRAFT/ACTIVE/ARCHIVED, startDato, sluttDato, periodBlockId, planVariant A/B | planen, kan knyttes til periode |
| TechnicalPlanPosition | pNummer «P1.0»–«P10.0», navn, sortOrder, hovedfokus | én rad per P-posisjon |
| PositionTask | tittel, beskrivelse, bildeUrl, videoUrl, pyramide, omraade, koller[], kategori TEKNISK/TAKTISK/MENTALT/SOSIALT, repsMaalDry/Lav/Full, repsGjortDry/Lav/Full, status PENDING/ACTIVE/DONE/ARCHIVED, trackStatus PAA_VEI/STAGNERER/FERDIG/INAKTIV/AVSLAATT, diagnosticMetrics, estimatedCompleteAt | oppgaven under en P-posisjon, med tekst, bilde, video og reps-mål per steg |
| PositionTaskTmGoal | metric, klubb, baselineValue/From/Date/N, targetValue, targetType PRIMARY/SECONDARY/CAUSAL/HIT_RATE, comparison LESS_THAN/GREATER_THAN/RANGE/EQUAL, rangeMax, protocol ROLLING_WINDOW/BEST_OF_N/STREAK/SESSION_GATE, windowSize, requiredHits, corridorMin/Max, currentHits, currentBatchSize, inTarget, progressPct | TrackMan-mål på oppgaven: «8 av 10 slag med Club Path innenfor −2 til +2» |
| PositionTaskLog | reps, hastighet DRY/LAV/FULL, belastning, trackmanShotId, sessionV2Id | hver rep eller hvert TrackMan-slag logget mot oppgaven |
| TechnicalPlanClubTarget | status OPPNAADD/PAA_VEI_KT/IKKE_BEGYNT | mål per kølle |
| PlanSuggestion | type NEW_TASK/ARCHIVE_TASK/RE_PRIORITIZE/CHANGE_CUE/ADJUST_GOAL/ADD_CLUB_TARGET, status PENDING/ACCEPTED/REJECTED/EDITED | forslag coach godkjenner |
| TrackManShot | positionTaskId, matchSource auto-club/auto-drill/manual, matchConfidence | hvert slag kan knyttes til en oppgave |

Reps-stegene heter DRY/LAV/FULL her og UTEN_BALL/LAV_HAST/AUTO i øvelsene. Samme tre steg. Vis alltid «Uten ball · Lav hastighet · Automatikk».
**Mangler:** flyt fra TrackMan-økt eller PEI-test til forslag om oppgaver per P (test → plan). Gruppebank av oppgaver per P og kategori.

## Tester

PEI = nærhet delt på lengde, lavere er bedre. Spilleren ser 21 protokoller (liste i masteren kap. 10). `TestAssignment` er én spiller om gangen — testdag for gruppe finnes ikke.
