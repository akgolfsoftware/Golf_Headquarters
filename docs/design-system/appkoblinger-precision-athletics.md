# Eksisterende appkoblinger for Precision Athletics

Kontrollert på nytt 01.10.2026 mot hovedcheckout `c8e97c66be98e09c6707381f17cefbcdc8451ddb`. De 15 opprinnelige appobservasjonene har uendrede kildebytes; alle 18 unike kildefiler samsvarer med denne committen. Git-banen AGTP01Oppgaveskjema.tsx er rettet fra feil skrivemåte i det eldre registeret. Arbeidskopien står på `110b4ec8f7d960fd1748b8f87babebde80cd764b`; den er ikke appens nåværende fasit. [JSON-registeret](appkoblinger-precision-athletics.json) har aktuelle linjer/kontrollsummer og bevarer 110-baseline som historikk. Ingen innlogget appreise, backend- eller visuell godkjenning er utført. Prototypekartets opprinnelige 38 rader og eksportidentitet beholdes separat.

| Knapp eller inngang | Faktisk appmål / handling | Hva Grok må bevare eller rette |
|---|---|---|
| I dag / Plan / Stats / Meg | `/portal` / `/portal/planlegge` / `/portal/analysere` / `/portal/meg` | Nåværende Stats heter Analyse. Behold eksisterende funksjoner mens valgt skjermprofil bygges. |
| Start / Se økta på et øktkort | `/portal/live/{sessionId}` fordeler etter modell og status | Samme valgte økt-ID gjennom før-start, Live og oppsummering. Skill v2, plan og Workbench. |
| Start økt · v2 | `/active`, der `startSession` brukes | Kontroller egen spiller/tilgang, abonnement og status. |
| Start økt · plan/Workbench | `startPlanSession` → `/tapper` | Bruk riktig modell; ikke erstatt alle startknapper med v2-handlingen. |
| Avslutt og lagre · v2 | `completeSession` → `/summary` | Fullføring er forskjellig fra lagring av ettervurdering. Bevar reps, øvelses-ID-er, tid og feilstatus. |
| Lagre etter økta | Dagens `SessionSummary` kaller `lagreDineOrd` | Ny vurdering må kobles uttrykkelig. Separat `lagreSpillerVurdering` krever kvalitet 1–5 og valgfri RPE 1–10. Avstem designfelter/skala; sRPE beregnes fra serverens tid. |
| Ny oppgave / Rediger | Samme AG-10-rute med `?oppgave=ny` eller `?oppgave={taskId}` | Bevar spiller og plan; tom oppgave må ha tom forhåndsvisning. |
| Lagre oppgave | `lagreOppgave(planId,f)` og samme taskId etter første lagring | Gjentatt lagring oppdaterer samme oppgave. Koden har denne oppførselen; mellomprototypen hadde duplisering. |
| Publiser til spiller | `publiserTekniskPlan(planId)` setter hele planen ACTIVE | Dette er ikke publisering av en bestemt oppgaverevisjon. Gapet må løses konkret før ny flyt bygges. |
| Legg i økt | `/admin/workbench/{playerId}` | Dagens lenke mister taskId. Viderefør valgt oppgave og velg måløkt/uke. `addDrillFromSource` tar `sessionId` og `tek:{taskId}`, men denne reisen er ikke koblet. |
| Før/etter · velg oppgave | `/for-og-na?oppgave={taskId}` | Eksisterende bildeUrl/videoUrl er enkeltfelter. To daterte før/etter-spor og opplastingshandlinger er fortsatt et gap. |

[Workbench-registeret](../design-audit/workbench-appkoblinger-2026-09-30.json) er kontrollert mot samme hovedcheckout: 20 aktuelle kildefiler og 47 kildeankre. Siden 4b-baseline er 10 filer endret, 11 ankere flyttet og fire erstattet. Coachruten monterer nå AG11Workbench/FYS/TURN, og spillerens oppretting delegerer til createWbSession. Historiske fjerninger i 4b og 110-kilder er derfor historikk; de gir ingen instruks om gjeninnføring. Den nye delegaten og aktive skjermreisen må kontrolleres ved bygging.

## Krav til samme objekt gjennom hele reisen

Skill skjerm-ID fra øktmodell og faktisk rute. En FYS-skjerm i designet beviser ikke at `/portal/live/{sessionId}/fysisk` finnes; slik rute ble ikke funnet. Bruk eksisterende øktinngang og spesifiser hvor den fysiske visningsvarianten hører hjemme.

For hvert oppgavekort: spiller-ID + plan-ID + taskId → skjema/før-etter/Workbench → valgt sessionId → publisering → samme spillerobjekt. Feil, avbryt, Tilbake og omlasting skal bevare eller uttrykkelig avvise konteksten. Publisering av plan, økt og oppgaverevisjon er forskjellige handlinger.

Behold kildeobservasjonene når et nytt designmål velges. Før den endelige [navigasjonskontrakten](knapp-og-skjermkart.md) får `appRoute` og `codeBinding`, registreres valgt referanse, konkret binding og kontrollbevis. Ikke fyll null-felter ut fra denne tabellen alene.
