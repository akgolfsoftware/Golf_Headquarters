# Workbench v0.12 — kartlegging mot kode

Skrevet 16.09.2026. Underlag for Bølge 1 i designpakken «AK Golf HQ Design v0.4.17».
Fasit: `AgencyOS Workbench v0.12.dc.html`. `selectedForBuilding: false` — ingenting her
er en bestilling om å bygge.

Dette dokumentet svarer på ett spørsmål: **hvor mye av Workbench v0.12 kan faktisk kobles
til ekte data i dag, og hva kan det ikke?** Det er lest ut av `prisma/schema.prisma` og
`src/lib/workbench/` 16.09.2026, ikke gjengitt fra designpakken.

## 0. Sammendrag for den som bare leser ett avsnitt

De fem AK-aksene (K2) finnes i modellen og passer designet. Kaskaden år → periode → måned
→ uke → økt finnes som skjermer. **Dosen per øvelse (K5) og koblingen plan → økt (K8)
finnes bare i den GAMLE øktmodellen, ikke i den nye.** Migreringen OW-3 flytter Workbench
fra den gamle til den nye. Skjer det uten at feltene blir med, mister Workbench
tellemåte, reps, L-trapp og teknisk-plan-kobling — funksjoner som finnes i dag.
Se §3, som er det viktigste i dokumentet.

## 1. Skjerm → fil

Kaskadenivåene i prototypen mot det som finnes i appen i dag.

| Nivå i v0.12 | Finnes som | Rute |
| --- | --- | --- |
| Årsplan | `src/components/workbench/YearGrid.tsx` | `/admin/workbench/[playerId]?vis=aar` |
| Periode | `src/components/workbench/YearPeriodePanel.tsx` | samme, panel i årsvisningen |
| Måned | `src/components/workbench/MonthGrid.tsx` | `?vis=maned` |
| Uke | `src/components/workbench/WeekGrid.tsx`, `WorkbenchUke.tsx` | `?vis=uke` (standard) |
| Økt | `src/components/workbench/SessionInspector.tsx`, `DrillListEditor.tsx` | panel i ukevisningen |
| Ny økt | `src/components/workbench/CreateSessionModal.tsx` | dialog |
| Publisering | `src/components/workbench/PublishConfirmDialog.tsx` | dialog |
| Kildepanel | `src/components/workbench/SourcesPanel.tsx` | panel |
| Stall (dag) | `src/components/workbench/StallDagV2.tsx` | panel |
| Gruppeuke (K6) | `src/app/admin/grupper/[id]/workbench/` | `/admin/grupper/[id]/workbench` |
| Min kalender (CAL-01…04) | `src/app/admin/kalender/` | `/admin/kalender` |
| Teknisk plan (K8) | ingen egen flate | — |
| Live-oversikt (WB-11) | `src/app/admin/(fullscreen)/agencyos/live/[sessionId]/` | — |

Årsvisning og månedsvisning er i dag **leseflater** (`WorkbenchLeseflate.tsx`): klikk på dag
eller uke åpner uken, og det redigeres ikke der. Prototypen redigerer periodefordelingen
direkte i årsnivået. Det er en reell forskjell i oppførsel, ikke bare i utseende.

## 2. Det som passer

**K2 · de fem aksene.** `AKFormel` i `src/lib/domain/workbench/types.ts` har `pyramid`,
`area`, `motorikk`, `belastning`, `press` og en lesbar `label`. Det er nøyaktig de fem
aksene designet krever, med samme regel om at motorikk bare gjelder fullsving.

**Aksefargene.** Prototypen definerer dem selv:
`PYR = { FYS: bla-600, TEK: grafitt-800, SLAG: rust-600, SPILL: grafitt-400, TURN: amber-600 }`.
Ingen av dem er grønne. Appens `--v2-ax-fys` (#1a7745) og `--v2-ax-spill` (#5a7200) ER
grønne, og overstyres i `AK_SCOPE` — ellers ville Workbench brutt regelen «ingen grønn
statusfarge». `--v2-ax-*` leses i dag ikke av noen komponent i `src/`.

**Periodetypene.** `src/lib/workbench/perioder.ts` har åtte: GRUNN · SPESIAL · TURNERING ·
EVALUERING · TESTUKE · FERIE · TRENINGSSAMLING · HELDAGSSAMLING. Årsplanen i prototypen
tegner fire og viser testuke, ferie og samling som egne lag. Det er et bevisst designvalg,
ikke et hull — men de fire må mappes mot åtte, ikke erstatte dem.

**Øktbudsjettet.** FYS · TEK · SLAG · SPILL · TURN stemmer med `SessionBudgetSchema`.

**K8 · oppslaget plan → økt.** `src/lib/workbench/teknisk-oppgave-sok.ts` gir coach-scopet
tittelsøk i `positionTask` med `pNummer` tilbake. Søket har ekte kodedekning.

## 3. Det som ikke passer — og hvorfor det haster

Appen har i dag **to øktmodeller**, og de er ikke like rike.

| | Gammel: `TrainingPlanSession` + `SessionDrill` | Ny: `WorkbenchSession` + `WorkbenchDrill` |
| --- | --- | --- |
| Fem AK-akser | egne kolonner | i `akFormel` (JSON) |
| Tellemåte (`repType`) | ✅ | ❌ |
| Reps/volum (`repAntall`, `repMinutter`, `repSett`, `repReps`) | ✅ | ❌ |
| L-trapp (`planRepsUtenBall`, `planRepsLavFart`, `planRepsAuto`) | ✅ | ❌ |
| Kobling til teknisk oppgave (`positionTaskId`) | ✅ | ❌ |
| Varighet per øvelse | ✅ | ✅ |

`WorkbenchDrill` har seks felt: `title`, `description`, `durationMinutes`, `akFormel`,
`techniqueFocus`, `sourceId`, `sortOrder`. Dosen finnes ikke der, verken som kolonne eller
inne i `akFormel` — `AKFormel`-typen inneholder bare de fem aksene og en etikett.

Koden som faktisk bærer dose i dag — `drill-actions.ts`, `duplicate-week.ts`,
`session-update.ts` — leser og skriver mot `trainingPlanSession` og `sessionDrill`.

**Konsekvensen:** OW-3 ([`ow-3-en-oekt-modell-2026-09-16.md`](./ow-3-en-oekt-modell-2026-09-16.md))
flytter Workbench fra den gamle modellen til den nye. `WorkbenchSession` har allerede fått
de additive feltene fra den gamle økten (`planId`, `rationale`, `skillArea`,
`pressureLevel`, `pPosisjoner`, `maalsetning`, `liveSnapshot`, `lFase`, `miljo`, `csNivaa`).
**Det tilsvarende er ikke gjort på drill-nivå.** Blir ikke dosefeltene med over, mister
Workbench tellemåte, reps, L-trapp og teknisk-plan-kobling — funksjoner som virker i dag.

Dette er et spørsmål til eier, ikke noe design kan avgjøre. Det står her fordi det ble
funnet under kartleggingen, ikke fordi kartleggingen skulle svare på det.

## 4. Felt v0.12 tegner som ikke finnes noe sted

Designpakken merker disse som forslag selv. Kartleggingen bekrefter det.

| Felt | Krav | Status i schema |
| --- | --- | --- |
| `% av 1RM`, `RIR`, `muskelgruppe` | K5 styrke | Finnes ikke |
| Sone `S1`–`S5`, segmentaktivitet | K5 kondisjon | Finnes ikke |
| Intensitet 1–10 per øvelse i økta | K5 | Finnes bare på `ExerciseDefinition.intensitet` — altså på øvelsen i biblioteket, ikke på øvelsen slik den er lagt inn i en økt |
| `blokkStart`, `blokkSlutt`, `ansvarligCoachId` | K7 delt økt | Finnes ikke |
| Rangelengde, lengste putt, radar, kapabiliteter på sted | K4 | Finnes i `PlayerFacility`, men `spiller-steder.ts` leser bare id · navn · inne/ute |

**Regelen som gjelder når et felt mangler:** vis «ukjent». Ikke 0, ikke tom, ikke et
oppdiktet felt. Det er fasitens egen regel og den gjelder her.

For K4 er det ikke et skjemaproblem, bare en loader som leser for lite — det kan utvides
uten databaseendring.

## 5. Avvik i oppførsel, ikke i data

- **Utkast-trinnet ved kopiert uke (K3).** `duplicate-week.ts` oppretter kopiene direkte
  som `PLANNED`. Prototypens «forrige uke ligger stiplet som utkast, ett trykk bekrefter,
  ett angrer» finnes ikke i koden.
- **Årsnivå som redigeringsflate.** Se §1.
- **Teller mot mål.** Søket etter tekniske oppgaver finnes; tellingen av reps og
  TrackMan-slag mot oppgavens mål gjør det ikke.

## 6. Tokenlaget

Lagt inn 16.09.2026, før resten av bygget:

- `src/styles/ak-hq-tokens.css` — tokens v0.4.3, kopi av den genererte fila i designpakken.
  Importert i `globals.css`. Endrer null piksler av seg selv.
- `src/components/workbench/wb-ak-scope.ts` — `AK_SCOPE`, som mapper `--ak-*` inn på
  `--v2-*`/`--color-*` lokalt på Workbench-roten. Samme metode som `TL_SCOPE`.
- `src/app/layout.tsx` — Archivo (400/500/600) og Oswald (500/600/700) lastet med
  `next/font/google`. Archivo har bevisst ikke 700; fontgjennomgangen fant at det ga
  kunstig fet skrift.

`npm run verify:static` er grønn etter endringen.

## 7. Hva dette dokumentet ikke er

Ingen skjerm er bygget om. Ingen databaseendring er gjort eller foreslått som bestilling.
Ingen flate er app-testet mot fasiten. Rutene i §1 er lest ut av filstrukturen, ikke
klikket gjennom i en innlogget app.
