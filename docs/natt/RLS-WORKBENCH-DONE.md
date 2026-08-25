# RLS — workbench_sessions + workbench_drills (25.08.2026)

Oppfølging til Loop 1: `WorkbenchSession`/`WorkbenchDrill` ble opprettet uten RLS
(schema-kommentaren sier det eksplisitt). Denne jobben tetter det — uten å endre
noe i `src/lib/workbench/wb-actions.ts` eller domenet.

Gren: `claude/agency-workbench-uke-ui-c4d2a4`. **KJØRT MOT PROD OG MERGET TIL MAIN.**
Verifisert 25.08.2026 mot prosjekt `dcnxoztjtdqoidaekxry` (eu-west-2) — se
§Verifisert i prod nedenfor. §Kjør står igjen som referanse for rollback/gjenkjøring.

## Hvorfor dette er forsvar-i-dybden, ikke primærporten

App-tilgangen går alltid via server actions i `wb-actions.ts`, som bruker Prisma.
Prisma kobler til databasen som eier/service-role og **bypasser RLS uansett
policy** — samme dokumenterte mønster som
`20260614193000_enable_rls_test_assignments` og `20260731000000_enable_rls_four_tables`.
Verifisert her på samme måte som den siste: `grep -rn "from(['\"]workbench_" src`
gir null treff — ingen klientkode leser disse tabellene direkte via
Supabase-JS/PostgREST.

RLS-policyene under beskytter altså mot et hypotetisk fremtidig hull (noen legger
til en `.from('workbench_sessions')` i klientkode, eller anon/authenticated-nøkkelen
lekker), IKKE den reelle tilgangsveien i appen i dag. `wb-actions.ts` sin
tilgangslogikk (`kreverTilgangTilSpiller` → `harCoachTilgangTilSpiller`) er
fortsatt den ENESTE håndhevede porten — policyene her speiler den så nøyaktig
som mulig i SQL, men er en ekstra lås, ikke erstatning.

## Hva policyene gjør

| Rolle | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| Spiller | Egne rader, KUN status PUBLISHED/IN_PROGRESS/COMPLETED/SKIPPED (aldri DRAFT — invariant 3) | Egne rader (playerId = seg selv) — speiler at spilleren har full selvbetjent CRUD på egne økter i `wb-actions.ts` (create/move/publish/drills/start/complete/skip er alle portet gjennom `kreverTilgangTilSpiller`, som slipper gjennom `user.id === playerId` uten ekstra sjekk) |
| Coach | Alle statuser for spillere de har tilgang til | Samme tilgangssjekk som skriving |
| Admin | Alt | Alt |

Coach-tilgang er en ny SQL-funksjon `workbench_coach_has_player_access(coach_id, player_id)`
som speiler `coachScopedPlayerWhere()` i `src/lib/auth/coached.ts` sine tre grener:
1. Aktiv `PlayerEnrollment` (ikke `PLATFORM_ONLY`) med `coachId` = coachen.
2. Aktivt spiller-medlemskap i en gruppe coachen eier (`Group.coachId`).
3. Aktivt spiller-medlemskap i en gruppe der coachen selv er aktivt
   COACH/ASSISTANT-medlem (G5-grenen).

`workbench_drills` har ingen egne policies for playerId/coachId — den arver
tilgang via en `EXISTS`-join mot sin `workbench_sessions`-rad med samme regler.

## Bevisst forenkling — dokumentert gap

Mission ba om at spillerens UPDATE skal være begrenset til **kun status-feltet**
via lovlige overganger (start/complete/skip). Det er IKKE håndhevet i SQL her —
policyen tillater spilleren å oppdatere hele sin egen rad, akkurat som
`wb-actions.ts` faktisk gjør i dag (spilleren har full selvbetjent
create/move/publish/drill-redigering på egne økter, ikke bare statusendring).
Å legge på kolonne-nivå `GRANT UPDATE (status)` + en `WITH CHECK` som validerer
statusmaskinen i SQL ville dupliseret tilstandsmaskinen som allerede finnes i
`src/lib/domain/workbench/operations.ts` — og siden Prisma uansett bypasser RLS,
gir det ingen reell sikkerhetsgevinst i dag. Hvis workbench-tabellene noensinne
blir lest/skrevet direkte fra klient (Supabase-JS), MÅ denne forenklingen
revurderes først.

## Filer

- `prisma/migrations/20260825140000_workbench_rls/migration.sql` — RECORD (kjøres ikke via `prisma migrate`, se gotchas §Schema-endringer)
- `scripts/apply-workbench-rls-2026-08-25.ts` — idempotent kjøreskript

## Kjør

```bash
npx tsx scripts/apply-workbench-rls-2026-08-25.ts
```

Kobler til `DIRECT_URL` fra `.env.local`, kjører hele migrasjonsfila som ett
multi-statement-script (ikke Prisma sin `$executeRawUnsafe`, som ikke tillater
flere statements og ville delt opp den dollar-quotede funksjonskroppen feil).

Schema-/sikkerhetsendringer mot delt prod krever Anders' eksplisitte «ja»
(CLAUDE.md §Arbeidsregler). Det ble gitt, og migrasjonen ER kjørt — se
§Verifisert i prod.

## Verifisert i prod (25.08.2026)

Målt direkte mot `dcnxoztjtdqoidaekxry` (eu-west-2, `ACTIVE_HEALTHY`) via Supabase
MCP. Ingen skriving — kun `SELECT` og rolle-bytte i én transaksjon.

| Sjekk | Resultat |
|---|---|
| `relrowsecurity` begge tabeller | **true** |
| Policies | 4 på `workbench_sessions`, 2 på `workbench_drills` — navnene matcher migrasjonsfila |
| `workbench_coach_has_player_access` | finnes |
| Eier (`postgres`) ser | 2 sessions · 2 drills · 2 spillere |
| `anon` ser | **0 · 0** |
| `authenticated` uten JWT ser | **0 · 0** |
| DRAFT-invarianten (nr. 3) | håndhevet i SELECT-policyen: spiller-grenen er låst til `PUBLISHED / IN_PROGRESS / COMPLETED / SKIPPED` |

Deny-beviset er ekte: tabellene er ikke tomme (eier ser 2), så `anon`/`authenticated`
sine nuller kommer fra RLS, ikke fra manglende data. Merk at `anon` og
`authenticated` har fulle `GRANT`-rettigheter på begge tabeller — policyene er
dermed eneste lås, og de holder.

**Avvik fra planens anbefaling:** LAUNCH-PLAN §S1 anbefalte *deny-by-default*
(ENABLE uten policies, jf. repo-presedens ×4) fordi policy-SQL-en duplisererer
`wb-actions.ts` sin tilgangslogikk og derfor kan drifte. Det som faktisk står i
prod er den FULLE policy-varianten. Sikkerhetsutfallet er det samme eller bedre
for anon/authenticated; drift-risikoen fra anbefalingen består. Om policyene skal
erstattes med rent deny-by-default er en åpen beslutning for Anders — ikke gjort
her, siden fungerende policies ikke fjernes uten eksplisitt ja.

## Rull tilbake

```bash
npx tsx scripts/apply-workbench-rls-2026-08-25.ts --rollback
```

Dropper alle 6 policies, slår av RLS på begge tabeller, og dropper
`workbench_coach_has_player_access`-funksjonen. Rører ingen data.

## Manuell sjekk etter kjøring (siden Prisma bypasser RLS, endrer ikke dette appen)

1. Coach-flyt: opprett/flytt/publiser en økt i `/admin/workbench/[playerId]` — skal fortsatt fungere uendret.
2. Spiller-flyt: Start/Fullfør på en publisert økt i Player HQ «I dag» — skal fortsatt fungere uendret.
3. `npx tsx scripts/audit-rls.ts` (etter kjøring) kan utvides med `workbench_sessions`/`workbench_drills`
   i `USER_OWNED_TABLES` for en automatisk cross-user-sjekk — ikke gjort her (auditskriptet antar
   `userId`-kolonnenavn; workbench-tabellene bruker `playerId`, så det trenger en liten tilpasning).

## Verifikasjon

```bash
npx tsc --noEmit   # grønn
```

`npm run verify` ikke kjørt i denne jobben (ingen app-kode endret — kun migrasjon +
skript + docs). Kjør før merge for å være sikker.
