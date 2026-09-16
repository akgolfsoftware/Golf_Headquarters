# R-I fortsettelse — team, grupper, turnering-kobling, plans og klubbinnstillinger søskentester 16.09.2026

Gren: `claude/r-i-batch4-2026-09-16`, oppå main etter PR #902. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 32 admin-mutasjonsfiler manglet søskentest per forrige leveranse (`handlingstilgang-varsler-foresporsler-caddie-queue-calendar-2026-09-16.md`). Denne batchen prioriterte capability-/eierskaps-tunge filer: staff-invitasjon, gruppe-CRUD, den største gjenstående filen (`turnering-kobling/actions.ts`, 4 handlinger), en fil med dokumentert historisk IDOR-sårbarhet (`(legacy)/plans/actions.ts`), og en ren ADMIN-only-klynge (`(legacy)/klubb/innstillinger/actions.ts`).

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 78 tester totalt:

- **`src/app/admin/(legacy)/team/actions.ts`** (11 tester) — `inviterCoach` har to lag: `Capability.INVITE_USERS` (G6, utenfor COACH-defaulten, fanget i try/catch som `{ok:false}`) og en ekstra regel filen selv håndhever: kun ADMIN kan tildele ekstra capabilities ved invitasjon — en COACH med INVITE_USERS skal ikke kunne gi bort tilganger hen ikke selv styrer. Testet også at capabilities allerede i COACH-defaulten ikke skrives som overflødig override, og at e-postutsending er best-effort (fraværende `RESEND_API_KEY` gir `epostSendt:false`, ikke feil).
- **`src/app/admin/grupper/actions.ts`** (18 tester) — gruppe-CRUD gated på `Capability.MANAGE_GROUPS` (i COACH-defaulten). Testet at en COACH med capabiliteten eksplisitt REVOKEt (override) avvises selv om rollen i seg selv er tillatt — capability-gaten er reell, ikke bare et rollealias. Dekker også validering (ukjent/myk-slettet coachId, tomt navn) og at databasefeil fanges som norske feilmeldinger for alle tre handlinger (`createGroup`, `deleteGroup`, `bootstrapGfgkJuniorGrupper`).
- **`src/app/admin/spillere/[id]/turnering-kobling/actions.ts`** (17 tester, den største filen i denne batchen) — alle fire handlinger krever ekte per-coach eierskap (`assertCoachTilgangTilSpiller`). Dekker forretningsregelen i `koblePublicPlayer`: en turneringsspiller allerede koblet til en ANNEN bruker avvises med klartekstmelding («Allerede koblet til X. Løsne der først.»), ikke krasj — og at speiling av eksisterende resultater (`mirrorTournamentResultForLinkedUser`) kun kjører for entries som faktisk har data (hopper over tomme DNF-rader).
- **`src/app/admin/(legacy)/plans/actions.ts`** (16 tester) — filens egen kommentar dokumenterer en tidligere reell sårbarhet: «`deletePlan` hadde INGEN eierskapssjekk — enhver coach kunne slette en hvilken som helst spillers treningsplan ved å bytte planId.» `planIScope()` (bygget på `coachScopedPlayerWhere`) er fellesporten som nå dekker alle fire handlinger (`togglePlanActive`, `dupliserPlan`, `createPlan`, `deletePlan`). Testen bekrefter IDOR-vernet for alle fire, og at ADMIN (som ser alle coachede spillere) slipper gjennom der en vanlig COACH avvises.
- **`src/app/admin/(legacy)/klubb/innstillinger/actions.ts`** (16 tester) — ren ADMIN-only-klynge: tre handlinger via `requireAdminActionUser`, én (`lagreClubSettings`) via `requirePortalUser({allow:["ADMIN"]})`. COACH avvist på alle fire. Dekker `lagreClubSettings` sin upsert-logikk (oppdater eksisterende singleton-rad kontra opprett ny) og at tomme tekstfelt lagres som `null`, ikke tomme strenger (`Prisma.JsonNull`-sentinelen mockes separat fra selve prisma-klienten).

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 11/11, 18/18, 17/17, 16/16, 16/16 bestått (78/78 totalt)
- Full `npm run verify`: grønt. `npm test`: 2987 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

### Avvik underveis

`turnering-kobling/actions.test.ts` sin første versjon av «avviser ukjent spiller»-testen for `foreslaPublicPlayers` traff eierskapssjekken (`assertCoachTilgangTilSpiller`) før «spiller ikke funnet»-grenen, siden test-spilleren ikke var i coachens eide-sett. Rettet ved å gi test-coachen eierskap til akkurat den ukjente spiller-iden, slik at testen faktisk isolerer «ikke funnet»-grenen fra eierskapsgrenen.

Testfiler i mapper med hakeparenteser måtte som før kjøres isolert fra egen mappe ved manuell kjøring — påvirker ikke `npm test` sitt glob-mønster i den fulle verify-kjøringen.

## Gjenstår

27 admin-mutasjonsfiler mangler fortsatt søskentest (32 minus de 5 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige 27 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
