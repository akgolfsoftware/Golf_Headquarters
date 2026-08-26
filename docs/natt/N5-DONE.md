# N5 — Team Norway som egen organisasjon (DONE)

Dato: 2026-08-26. Gren: `claude/n5-team-norway-org` (fra `origin/main`, commit `8b6e44c5`).

## Oppgaven

Koble Team Norway INN i den allerede ferdigbygde samtykke-/ekstern-leser-stakken
(plan T8, levert 16.08) — ikke bygge ny mekanisme. Gruppemedlemskap er aldri
delingsgrunnlag alene; kun eksplisitt `DelingsSamtykke` åpner innsyn for en
ekstern leser (Team Norway-/WANG-trener).

## Hva som ble endret

### 1. `src/lib/domain/grupper.ts`
- `KanoniskGruppeSlug` har fått `"team-norway"`.
- `KanoniskGruppe.program` er nå `PlayerProgram | null` (var påkrevd
  `PlayerProgram`) — Team Norway er ikke et AK Golf-coachingprogram, så det
  finnes ingen naturlig `PlayerProgram`-verdi for gruppen. **Ingen ny
  PlayerProgram-enum-verdi er lagt til** — det ville krevd en `ALTER TYPE …
  ADD VALUE`-migrasjon OG en ripple-effekt til `PROGRAM_BUCKET`
  (`src/lib/domain/program-bucket.ts`, en ekshaustiv `Record<PlayerProgram,
  …>`) og flere skjemaer/dropdowns som bruker enumet for
  program-innmelding. Det er utenfor scope for denne oppgaven — Team Norway
  sine medlemmer er allerede innmeldt i sitt vanlige program (WANG/GFGK/
  Academy) et annet sted; Team Norway-gruppen er et RENT delings-lag oppå.
- `KanoniskGruppe.kind` har fått en tredje verdi, `"ekstern"` — betyr
  organisasjonen eies ikke av AK Golf; innsyn går KUN via
  `EksternLeserGruppe` + `DelingsSamtykke`.
- Nytt felt `KanoniskGruppe.managedByAkGolf: boolean`. Dette var tidligere
  implisitt hardkodet `true` for alle grupper inne i
  `scripts/bootstrap-kanoniske-grupper-2026-08-16.ts` — nødvendig å gjøre
  eksplisitt fordi Team Norway MÅ ha `managedByAkGolf: false`
  (`aktivtAkGruppeMedlemskapWhere` gir gratis full PlayerHQ-tilgang til
  aktive spiller-medlemmer i `managedByAkGolf`-grupper — å sette Team Norway
  til `true` ville gitt ethvert Team Norway-medlem gratis abonnement bare
  ved å stå i gruppen, som er en helt egen forretningsbeslutning verken
  oppgaven eller GDPR-standpunktet ba om).
- Team Norway lagt inn:
  `{ slug: "team-norway", navn: "Team Norway Golf", program: null, level: null, kind: "ekstern", managedByAkGolf: false }`.

### 2. Ekte DB-rad: KUN forberedt, IKKE kjørt
`KANONISKE_GRUPPER` er en TS-konstant — for at Team Norway skal fungere i
prod trengs en faktisk `Group`-rad (slug `team-norway`) å knytte
`EksternLeserGruppe`/`GroupMember` mot. Skrev
**`scripts/bootstrap-team-norway-2026-08-26.ts`**, samme idempotente
tre-trinns mønster som `bootstrap-kanoniske-grupper-2026-08-16.ts`
(slug → navn → opprett), men som EGET script — bevisst IKKE lagt inn i det
gamle scriptet, fordi det scriptet hardkoder `managedByAkGolf: true`
ubetinget for alt det rører (det er en datert historisk migrering for de
opprinnelige 8 gruppene). Kjøring av det gamle scriptet uendret på Team
Norway ville satt `managedByAkGolf: true` feilaktig.
**Scriptet er IKKE kjørt mot prod-databasen i denne økten** — det krever
`DIRECT_URL` mot ekte prod og er en bevisst handling Anders bør gjøre (eller
godkjenne kjørt) utenfor en isolert worktree-økt. Kjør med:
```
npx tsx scripts/bootstrap-team-norway-2026-08-26.ts
```

### 3. Verifisert: ekstern-leser-stakken er GENERISK, ingen org-allowliste
Gjennomgått `src/lib/auth/ekstern-leser-scope.ts` og
`src/app/admin/(legacy)/team/ekstern-leser-actions.ts` (admin-opprettelse av
ekstern leser). Ingen hardkodet liste over gruppe-slugs/navn noe sted —
begge tar en vilkårlig `groupId`. Ingenting å utvide.

Ny test **`src/lib/auth/ekstern-leser-scope.test.ts`** (mock av
`@/lib/prisma`, mønster fra `slett-eksterne-data.dryrun.test.ts`), spesifikt
for Team Norway:
- Spiller MED gyldig `TEST_RESULTATER`-samtykke mot Team Norway-gruppen →
  `eksternLeserSpillerIder`/`harEksternLeserTilgang` gir tilgang.
- Spiller UTEN samtykke, men med aktivt PLAYER-medlemskap i SAMME gruppe →
  `harEksternLeserTilgang` returnerer `false` — spilleren er usynlig for
  treneren selv om medlemskapet er aktivt. **Begge retninger er dermed
  bevist av tester**, ikke bare «gir tilgang».
- Samtykke er per scope: samtykke til `TEST_RESULTATER` gir IKKE `STATS`.

### 4. Ny ren funksjon: `src/lib/domain/deling/dekningsgrad.ts`
`beregnDekningsgrad({ gruppemedlemmer, samtykketUserIds }) → { totalt, samtykket, prosentSamtykket }`.
Regnestykke-kilden for «4 av 11 har gitt samtykke» i coach-UI — teller ALDRI
spillere uten samtykke som ikke-eksisterende, og en samtykke-id utenfor
gruppens faktiske medlemmer (f.eks. gammelt samtykke fra en utmeldt spiller)
blåser ikke opp `totalt`. Ingen IO. Tester i samme mappe:
`dekningsgrad.test.ts` (0 %, delvis 4/11=36 %, 100 %, 0 medlemmer, duplikater,
samtykke-id utenfor medlemslisten).

### 5. `src/lib/domain/grupper.test.ts`
Oppdatert fra 8 til 9 kanoniske grupper; nye assertions for `kind: "ekstern"`,
`program: null` og `managedByAkGolf: false` kun for Team Norway, og
`managedByAkGolf: true`/`program` non-null for alle de andre åtte.

## Ikke rørt (bevisst, per oppgavens avgrensning)
- `selection_criteria`/`selection_scores`/`selection_decisions`/
  `uttak_sessions` — ingen nye Prisma-modeller lagt til.
- `PlayerProgram`-enumet — ingen `ALTER TYPE`, ingen migrasjon.
- `scripts/bootstrap-kanoniske-grupper-2026-08-16.ts` — historisk, urørt.

## Verifikasjon
- `npx tsc --noEmit`: grønn.
- `npm test` (node:test, `tsx --conditions=react-server
  --experimental-test-module-mocks`): 1657/1657 grønn, inkl. de 3 nye
  ekstern-leser-testene og de 6 nye dekningsgrad-testene.
- `npm run verify` (prisma validate/generate, tsc, eslint, check-action-auth,
  check-token-gap, check-critical-imports, `npm run build` inkl. Next-build +
  serwist): grønn, exit 0.
- Merknad: worktreets `node_modules` manglet ved første forsøk (fjernet av
  noe utenfor denne økten — se `.claude/rules/gotchas.md`
  «Annen økts worktree kan forsvinne»); `npm ci` gjenopprettet det før
  verify ble kjørt på nytt.

## Gjenstår (utenfor N5, til Anders)
1. Kjør `bootstrap-team-norway-2026-08-26.ts` mot prod for å faktisk opprette
   `Group`-raden (eller la et senere script/PR gjøre det).
2. Admin-UI for å opprette ekstern leser + koble spillere til Team Norway
   som gruppe, og spiller-UI for selve samtykke-avkrysningen — begge finnes
   allerede generisk (T8), men er ikke spesifikt testet i denne økten fra
   admin-siden.
3. Dekningsgrad-tallet (`beregnDekningsgrad`) er kun domenefunksjonen — ingen
   UI viser den ennå.
