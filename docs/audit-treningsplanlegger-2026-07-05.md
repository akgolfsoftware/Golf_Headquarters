# Audit — Treningsplanlegger (Workbench), driller/øvelser og tester

Dato: 2026-07-05. Ren gjennomgang (kode + data + 313 automatiserte tester + delvis manuell sjekk). Ingen fiks gjort — kun rapportert, per avtale.

## Helhetsbilde

Alt av Workbench, driller og tester er reelt bygget og koblet til ekte data — ikke stubbed skjermer. `npx tsc --noEmit` = 0 feil. `npm test` = **313/313 grønne** (56 suiter: workbench-matte, compliance, AK-formel-invarianter, CSRF, GDPR-samtykke, level-gaps m.m.). Men gjennomgangen fant flere konkrete bugs — noen alvorlige — under overflaten.

---

## HØY prioritet — bør fikses

### 1. Dupliserte økter i ukevisningen (Workbench)
**Fil:** `src/lib/workbench/merge-week-sessions.ts:69-70`

Koden som slår sammen gamle (`TrainingPlanSession`) og nye (`TrainingSessionV2`) økter for uke-visningen, dedupliker på feil felt:

```ts
const v1Ids = new Set(v1Sessions.map((s) => s.id));
const v2Rows = v2Sessions.map(v2ToWeekRow).filter((row) => !v1Ids.has(row.id));
```

`TrainingSessionV2.id` er sin egen uavhengige id (cuid) — den er ALDRI lik V1-øktens id. Koblingen mellom en økt og sitt «speil» går via feltet `generertFraId`, som finnes men aldri sjekkes her. Resultat: **enhver økt opprettet/flyttet/duplisert i Workbench vises to ganger** i uken — dette gir feil timetall, feil antall økter, og feil «på plan»-prosent (adherence), fordi de teller den samme økten dobbelt. Testen som skulle dekke dette (`merge-week-sessions.test.ts`) tester feil scenario (later som om V2 kan arve V1s id) og fanger derfor ikke bugen.

**Konsekvens for deg:** tallene coach og spiller ser i ukevisningen (timer trent, adherence-%) kan være kunstig for høye.

### 2. Coach kan se og redigere hvilken som helst spillers Workbench
**Fil:** `src/app/admin/spillere/[id]/workbench/page.tsx:30-33`

Siden sjekker kun at brukeren HAR rollen COACH/ADMIN — ikke at akkurat DEN coachen faktisk er tilordnet spilleren i URL-en. Samme mangel finnes i alle handlinger som kalles derfra (flytt/legg til/fjern økt, drill-CRUD, bruk mal). I dag med kun deg (ADMIN, ser alt) og Markus (én COACH) er skaden trolig ingen, men det er en strukturell hull som blir reelt i det øyeblikket dere har flere coacher med adskilte spillerlister.

### 3. Spiller kan se/endre en HVILKEN SOM HELST annen spillers drill via lenke
**Filer:** `src/lib/portal-drilldetalj/drill-detalj-data.tsx`, `src/app/portal/drills/[id]/actions.ts`, `src/app/portal/drills/actions.ts`

Selve drill-biblioteket (listen) filtrerer riktig på eierskap/synlighet, men å åpne en drill DIREKTE på url (`/portal/drills/<id>`) eller kalle handlinger på den (registrer mestring, rate, del med coach, be om i plan) sjekker ALDRI om drillen faktisk tilhører/er synlig for den innloggede brukeren. En spiller som gjetter/får tak i en id fra en annen spillers private drill kan se den og trigge handlinger på den.

### 4. Coach-opprettede driller blir synlige for ALLE spillere (ikke bare egne)
**Fil:** `src/app/admin/drills/actions.ts` (`createDrill`/`updateDrill`/`duplicateDrill`) + `src/lib/portal-drills/drills-data.ts:143-152`

Når en coach oppretter en drill settes aldri `source`/`visibility` — den faller til schema-default (`SYSTEM`/`PRIVATE`), som ved et uhell matcher den ubetingede «vis alle SYSTEM-driller»-regelen i spillerens bibliotek-spørring. Konsekvens: alt coach lager i dag vises til absolutt alle spillere, ikke bare sine egne — stikk i strid med kommentaren i koden som beskriver at det skal være begrenset.

### 5. Mestringslogg på drill-siden er død — feiler alltid
**Fil:** `src/app/portal/drills/[id]/mestrings-logg-client.tsx` + `actions.ts`

«Registrer mestrings-økt» og rating-knappene på en drill-detaljside kaller `prisma.drillMestringsLogg`/`prisma.drillRating` — **modeller som ikke finnes i databaseskjemaet** (kommentert som «planlagt i neste migrasjon»). En vakt-funksjon fanger dette og viser i stedet meldingen «Denne funksjonen aktiveres i en kommende oppdatering» — så det krasjer ikke, men **hele funksjonen er blindpanel i dag**. Den er dessuten koblet til feil datamodell — den ekte logg-modellen (`DrillLogV2`) brukes kun i selve live-økten, aldri her.

---

## MEDIUM prioritet

### 6. «Legg til kalender»-knappen på drill-siden lyver
**Fil:** `src/app/portal/drills/[id]/drill-client.tsx:33-37`

Knappen viser `alert('"..." lagt til i kalenderen. Velg dag og tid neste skritt.')` — men gjør ingenting. Ingenting lagres. Bekreftet i koden: kommentaren sier eksplisitt «Server actions kobles på senere — foreløpig router-navigasjon + alert».

### 7. «Start økt med denne drill» mister valget stille
Samme fil, linje 26-30: navigerer til `/portal/ny-okt?drill=<id>`, men `src/app/portal/ny-okt/page.tsx` leser aldri `?drill=`-parameteren (bekreftet — ingen `searchParams`-håndtering i filen). Spilleren trykker knappen, kommer til ny-økt-veiviseren, men drill-valget er borte uten varsel.

### 8. Manglende transaksjoner ved samtidige endringer (race conditions)
`src/lib/workbench/v2-sync.ts` (`upsertV2ForPlanSession`), `session-actions.ts` (`coachDuplicateWeek`) og `apply-template-actions.ts` gjør «sjekk om finnes → opprett»-mønster uten databasetransaksjon. Hvis coach og spiller endrer samme uke samtidig (eller en handling feiler midtveis), kan det oppstå duplikate V2-rader (forverrer punkt 1) eller en halvferdig duplisert uke uten rollback.

### 9. Admin-siden for driller har et filter-panel som aldri vises
`src/app/admin/drills/drill-filter-bar.tsx` er bygget (søk, environment, NGF-range, MORAD-filter) men importeres/rendres ingen steder — siden filtrerer i praksis kun på kategori.

---

## LAV prioritet / opprydding

- **Dødkode i tester-modulen** (`src/app/portal/tren/tester/actions.ts` + `[testId]/scorekort.tsx`): gammel gjennomføringsflyt uten tilgangssjekk og med klient-beregnet score (usikker hvis den noensinne kobles til en rute igjen ved en feiltakelse). Ikke i bruk i dag — bør slettes, ikke la ligge.
- **`TestSession`-modellen** i databasen brukes aldri av noen skjerm — dødt skjema for en «live scoring»-arkitektur som aldri ble koblet til UI.
- **Scoring-motoren** for tester leser hardkodet feltnavn `"ok"`/`"sunket"` fra scorekort-svar — hvis en testprotokoll bruker et annet feltnavn, gir det stille 0 poeng uten feilmelding. Bør krysjekkes mot faktiske seed-protokoller.
- **`TestAssignment`**: hvis en spiller får flere åpne test-tildelinger for samme test, lukkes kun den eldste ved gjennomføring — resten blir hengende «åpne» for alltid. Sjelden i praksis.
- **`/portal/tren/ovelser`**: siden er ryddet til redirect, men `createCustomExercise`-handlingen bak «Legg til øvelse»-knappen (fortsatt aktiv UI) oppdaterer en sti som umiddelbart omdirigerer bort — virkningsløst, bør peke til `/portal/drills`.

---

## Ting som er bekreftet RIKTIG (ingen bug)

- Drag-drop-datomatematikken i Workbench (uke-bytte, midnatt, klemming av offset) — korrekt og godt testet.
- AK-formel-sanering (L-fase/miljø/CS-nivå/PR-press/P-posisjoner) — korrekt.
- SG-gap-beregning (finner svakeste kategori) — korrekt.
- Compliance/adherence-formelen selv (etter forrige fiks, commit a3be5389) — korrekt, men rammes indirekte av dupliseringsbuggen over (kun i Workbench, ikke i Stallen som har egen uavhengig beregning).
- Test-tilgang (privat/coach-godkjent/akademi-synlighet) — korrekt håndhevet i de AKTIVE test-rutene.
- Benchmark-autosync fra DataGolf + godkjenn/avvis-flyt — ekte, ikke visuell stub.
- `repType`-volumsystemet (svinger/baller/tid/sett-reps) — riktig felt vises for riktig type, både i visning og redigering.
- Fysisk-drill-feltene på `TrainingDrillV2` — alle i aktiv bruk, ingen døde schema-felt.
- 313/313 automatiserte tester grønne, TypeScript 0 feil.

---

## Teknisk plan / Fys-plan — prioriteringsvurdering

Du ba om en vurdering av om disse to kjente designhullene bør prioriteres nå.

**Konklusjon: kan fortsatt vente — lav hastegrad.** Begrunnelse:
- Spilleren opplever ALDRI en dødlenke: `/portal/tren/teknisk-plan` og `/portal/tren/fys-plan` omdirigerer automatisk til en ferdig, designet fane inne i Workbench.
- Datamodellen (TechnicalPlan, FysiskPlan m.m.) er moden og ikke i endring.
- Det er ikke «bygg fra scratch» — det finnes allerede ~3300 (teknisk plan) + ~1600 (fys-plan) linjer fungerende kode. Gjenstår er å porte utseendet til v13-designsystemet, ikke ny funksjonalitet.
- **Det reelle gjenværende hullet er admin-siden** (`/admin/teknisk-plan`) — den har ingen tilsvarende Workbench-erstatning og mangler v13-design. Hvis noe skal prioriteres, er det denne.

---

## Metode
- Kodelesning av all Workbench-, drill- og test-logikk (lib + routes + Prisma-schema).
- `npx tsc --noEmit`, `npm test` (prosjektets ekte testkommando — Node sitt innebygde test-runner via tsx, ikke Jest).
- Kryssjekk av funn mot faktisk skjema (`prisma/schema.prisma`) for å bekrefte/avkrefte antakelser.
- Manuell klikk-gjennom i nettleser ble PÅBEGYNT (startet dev-server, ryddet en 22 timer gammel forlatt server-prosess), men kunne ikke fullføres uten innloggingsdata for spiller-testbrukeren — ingen dev-bypass for innlogging finnes. Si fra om du vil at jeg gjør en visuell runde med faktiske testbruker-innloggingsdata.
