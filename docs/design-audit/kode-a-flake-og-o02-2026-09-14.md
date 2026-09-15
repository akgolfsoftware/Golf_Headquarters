# KODE-A · P0-flake rettet, O02-gruppeplan og R-I godkjenninger, 14.09.2026

Gren: `claude/kode-a-kode-b-masterplan-rvq63p`. Ingen visuell portering, ingen migrasjon
mot noen delt base, ingen produksjonsdata, ingen betaling, ingen utrulling.

## 1. Flaken i `spillerreise-innlogget.spec.ts` er rettet — og prøvd under den
betingelsen den oppsto i

**Symptomet** (loggført i tre leveranser 13.–14.09, aldri rettet): siste test
«tillatt coach ser økta; uvedkommende avvises uten innhold» feilet av og til på ett
steg — en fremmed spiller ble ikke sendt videre fra `/portal/live/p0-wb-okt/summary`
innen 20 s. Den feilet i full pakke, ikke alene.

**Årsaken er ventetid, ikke oppførsel.** Avvisningen skjer ved redirect til
`/portal/planlegge` eller `/portal/planlegge/workbench`. Første gang `next dev` treffer
en av de rutene, kompilerer den den. Prøven ventet på redirecten med Playwrights
standard expect-grense på 20 s (`tests/p0/playwright.config.ts`), mens resten av fila
bruker 90 s for navigasjon (`ventPaSti`). I full pakke ligger kompileringen etter ti
andre tester og kommer sent — derfor feilet den bare der.

**Tre minste endringer i spec-fila. Ingen produktkode er rørt.**

1. `REDIRECT_TIMEOUT = 90_000` brukes på URL- og overskriftsventingen i `expectAvvist`,
   samme grense som `ventPaSti` ellers i fila.
2. `varmOppAvvisningsMaal()` besøker begge målrutene én gang per uvedkommende rolle, før
   avvisningsløkka. Dette er testrigg: kompileringen skjer da under navigasjonsgrensen
   (90 s), ikke under expect-grensen. Selve prøven bruker fortsatt bare ekte redirect fra
   live-ruta — det er ingen `goto` som reparasjon av en ødelagt navigasjon.
3. Testgrensen hevet 360 s → 600 s, slik at tolv redirect-steg med 90 s tålegrense ikke
   kan velte testen før selve påstanden rekker å feile med en lesbar melding.

**Bevis.** Isolert HQ-Supabase på 54421/54422 og Next på 3010, samme rigg som P0-TEST
(`npm run test:p0-test`). Arbeidskopien har ingen `.env*`-fil, så riggens egen sperre mot
live-nøkler holdt uten omvei.

| Kjøring | Omfang | Resultat |
|---|---|---|
| Bare spec-fila | 4 tester | **4 passed (3,3 min)** |
| Full P0-pakke | 11 tester, alle fire spec-filer | **11 passed (6,0 min)** |
| Full P0-pakke, ny stack (15.09 kl. 05) | 11 tester, alle fire spec-filer | **11 passed (6,9 min)** |

Den fulle pakken er nettopp betingelsen flaken oppsto i. Den er grønn etter fiksen, og
den andre fulle kjøringen ble gjort på en nyoppsatt stack etter at containeren hadde
startet på nytt — altså ikke på en varm cache fra den første.

**Ærlig begrensning:** tre kjøringer, ikke tjue. En tidsbestemt flake kan ikke bevises
borte av et endelig antall grønne kjøringer — men årsaken er forstått og fjernet, ikke
maskert med en blind retry. `retries: 0` i konfigurasjonen er beholdt med vilje.

## 1b. Full kvalitetsgate kjørt lokalt

`npm run verify` (15.09) — `verify:static` + `npm test` + `npm run build` + serwist —
avsluttet med kode 0. Byggingen produserte samme precache-manifest som Vercel-byggingen:
**527 URL-er, 11,6 MB**. Det er den samme byggingen Vercel fullførte uten feil før den
falt på sitt eget `process-and-upload-routes`-steg, og det er grunnlaget for at
Vercel-statusen på PR #890 er avvist som ikke denne PR-ens. Repoets egen `verify`-sjekk
i GitHub Actions er også grønn på samme commit.

## 2. O02-rest: gruppeplan uten dublett og uten bortfall av spillerens egne økter

Masterplanen har båret denne resten siden PR #866. Den rene dedup-regelen
(`gruppeplan-dedup.ts`) hadde 18 tester fra før; **handlingen som bruker regelen hadde
ingen.** Det er hullet: en regel kan være riktig og likevel ikke bli brukt.

Ny fil `src/lib/__tests__/workbench/apply-template-gruppe-dedup.test.ts` kaller
`coachApplyTemplateToGroup` med mocket database og låser fem ting (6 tester, alle grønne):

- Første utrulling oppretter gruppeøktene, stemplet med gruppa.
- Re-kjøring av **samme** gruppe oppretter ingenting, rapporterer ingenting og lar de
  eksisterende radene stå — stille idempotens.
- **Spillerens egen økt i samme tidsrom:** gruppeøkta hoppes og rapporteres som
  KRYSSKILDE, og spillerens rad blir liggende urørt — ikke slettet, ikke overskrevet,
  ikke omstemplet til gruppa. Dette er selve «uten bortfall»-kravet.
- En annen gruppes økt i samme tidsrom behandles likt.
- Spillerens egen økt **uten** ekte tidsoverlapp stopper ikke gruppeøkta. Ingen falsk
  dedup — WANG morgen og GFGK kveld samme dag er legitimt.

**Ærlig begrensning:** dette er komponentprøvd mot en mocket Prisma-klient som speiler
spørringen i handlingen, ikke en innlogget reise mot ekte base. Koden var korrekt fra før
— testen er regresjonsvern, ikke en feilretting. O02-raden bør derfor leses som «regelen
er nå låst i test», ikke som «gruppeplan er ferdig prøvd som brukerreise».

## 3. R-I: søskentest for godkjenningsflaten

Målt 14.09: 55 `"use server"`-filer under `src/app/admin`, 6 med søskentest. Denne
leveransen tar den mest følsomme av de udekkede — `admin/(legacy)/approvals/actions.ts`
(5 handlinger). Den kjører `acceptAndApplyPlanAction`, som endrer spillerens plan, og
varsler spilleren.

Ny fil `src/app/admin/(legacy)/approvals/actions.test.ts`, 5 tester, alle grønne:

- Spiller og forelder avvises på alle fem handlinger — ingen plan-handling kjøres, ingen
  skriving til `PlanAction`, ingen varsel sendt.
- En **annen coachs** sak er `not-found` for godkjenn, avslå og «be om mer info».
- Tom eller for kort begrunnelse/spørsmål stopper før noe skrives.
- Bunkegodkjenning spør bare etter saker coachen eier eller ueide saker, og godkjenner
  ikke en annen coachs sak.
- Tom id-liste gjør ingenting og treffer ikke basen.

Koden hadde disse portene fra før. Testene er regresjonsvern.

**Rest:** 48 admin-mutasjonsfiler mangler fortsatt søskentest. De største uten:
`tournaments/actions.ts` (12 handlinger), `(legacy)/plan-templates/actions.ts` (10),
`(legacy)/anlegg/location-actions.ts` (6), `(legacy)/bookinger/actions.ts` (5).

## Det som IKKE er gjort i KODE-A

- **A2 · innlogget dekning for P03 (ny/rediger/flytt).** Serverreglene er prøvd fra før
  (PR #871). En innlogget spec ville krevd nye seed-økter og nye stabile velgere i
  Plan-skjermen; det er ikke gjort, og en spec som ikke er kjørt er ikke bevis.
- Visuell godkjenning, D0, portering eller noe som forutsetter en valgt designpakke.
- Stripe, betaling, Caddie AI-svar og TrackMan foto (KODE-B og KODE-C).

## Miljø brukt for bevisene

Docker-daemon og Supabase CLI måtte etableres i denne økten; de er ikke en del av repoet.
Skjemaet ble lagt på den tomme, lokale basen med `prisma migrate diff --from-empty`
kjørt gjennom `psql` (5 442 linjer ren `CREATE`, null `DROP` — verifisert før kjøring),
ikke med `prisma db push`. 196 tabeller, samme tall som tidligere lokale kontroller.
Ingen delt eller hostet base er rørt.

## Ikke påstått

- At flaken er umulig å se igjen. To grønne fulle kjøringer er ikke et bevis på fravær.
- At gruppeplan eller godkjenninger er prøvd som innlogget brukerreise.
- At noe her er visuelt godkjent, lansert eller produksjonsverifisert.
