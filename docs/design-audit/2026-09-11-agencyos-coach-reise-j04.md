# AgencyOS coach-reise (J04) — kartlegging og kontrollert bevis, 2026-09-11

Branch: `claude/agencyos-coach-journey-ovihra`. Oppdrag: gjøre coachens sammenhengende
reise fra AgencyOS-hjem → spillerliste → spillerkort → Workbench → publisering →
oppfølging (J04) faktisk sammenhengende og funksjonell, uten å refaktorere eller
slå sammen eksisterende datamodeller.

**Ærlig oppsummering på forhånd:** J04-reisen var, ved gjennomgang, allerede i
det alt vesentlige BYGGET og koblet sammen — STEG 15 (grillingen runde 6),
D3 (Spiller 360) og de tidligere Workbench-øktene har allerede levert en ekte,
datadrevet kjede. Denne økten fant ÉN konkret, verifiserbar kontekst-bug i den
kjeden (filter/søk/valgt spiller i Stall-lista overlevde ikke navigasjon) og
rettet den, med tester. Resten av rapporten er en kartlegging av hva som
allerede virker, hva som er dokumentert avvik fra før, og hva som IKKE er
verifisert i denne økten (Anders har ikke sett dette).

## Kartlegging — reisen slik den faktisk er koblet i dag

| Steg | Rute | Auth-vakt | Datakilde | Skriving | Status |
|---|---|---|---|---|---|
| 1. Hjem | `/admin/agencyos` (`src/app/admin/agencyos/page.tsx`) | `requirePortalUser({allow:["ADMIN","COACH"]})` | `loadDailyBrief` + `lastGodkjenninger` (samme tall/spørring som `/admin/ko`) | ingen | Ekte data, ingen demo-tall |
| 2. Spillerliste | `/admin/spillere` (`src/app/admin/spillere/page.tsx`) | samme guard | `loadStallen` (`src/lib/admin/stallen-data.ts`), coach-scopet | ingen (filter/søk er klient) | **Rettet i denne økten** — se under |
| 3. Spillerkort | `/admin/spillere/[id]` | `coachScopedPlayerWhere(user)` + `notFound()` | `lastSpillerOversikt`, `loadSpillerProfilPanel`, runder/mål/permisjoner via Prisma | ingen på selve siden | Allerede konsolidert (D3, 03.09.2026) — Oversikt-bento + Arbeidsvisning (`?vis=360`) + faner til Plan/Analyse/Tester |
| 4. Workbench | `/admin/workbench/[playerId]` | samme `coachScopedPlayerWhere` + `notFound()` | `loadWeek`/`loadMonth`/`loadYear`/`loadSources` (`src/lib/workbench/wb-actions.ts`) | `createSession`, `moveSession`, `addDrill`, `reorderDrills`, `deleteSession` m.fl. — alle via `hentMedTilgang` (samme tilgangssjekk per kall) | Uke er redigerflate, måned/år er leseflater (dokumentert bevisst i filhodet) |
| 5. Publisering | `publishSessions()` i samme fil | tilgang re-sjekket per økt i transaksjonen | — | `prisma.$transaction` med `updatedAt`-optimistisk låsing — hele utvalget avbrytes atomisk om én økt er endret av andre siden lasting | **Verifisert testet** (se under) — ingen navigasjon skjer ved publisering, coach blir stående i samme uke |
| 6. Retur til samme spiller/utvalg | — | — | — | — | Workbench: ja (ingen redirect ved publish). Stall-lista: **rettet i denne økten** |

## Funnet og rettet: filter/søk/valgt spiller i Stall-lista overlevde ikke navigasjon

**Symptom (verifisert ved kodelesing, ikke skjermbilde):** `TrainLockStall.tsx`
holdt `filter`, `sok` og `valgtId` i ren `useState` uten kobling til URL-en.
`/admin/spillere/page.tsx` er `export const dynamic = "force-dynamic"` — en
server-komponent som kjører `loadStallen` på nytt ved hver lasting. Når coachen
filtrerte (f.eks. «WANG») eller søkte, klikket en spillerrad (→
`/admin/spillere/[id]`) og deretter gikk tilbake, remonterte klientkomponenten
fra bunnen av med default-tilstand (filter «Alle», tomt søk). Dette bryter
direkte kravet «coach filtrerer … og beholder konteksten» (steg 2) og «coach
kommer tilbake til samme … utvalg» (steg 6).

**Fiks:** ny fil `src/lib/admin/stall-url-state.ts` — rene
`lesStallUrlState`/`skrivStallUrlState`-funksjoner (parse/serialize av
`f`/`q`/`v`-query-parametre, fail-closed på ugyldig filter). `TrainLockStall.tsx`
leser starttilstand fra `useSearchParams()` ved mount og skriver tilbake med
**`window.history.replaceState`** — bevisst IKKE `router.replace()`, fordi en
Next-navigasjon på hvert tastetrykk i søkefeltet ville trigget en ny
`loadStallen`-spørring mot databasen for hver bokstav (siden er force-dynamic).
`replaceState` endrer kun det som står i adresselinjen/historikk-oppføringen —
ingen refetch, og ingen ny history-rad (nettleserens «tilbake» går fortsatt rett
ut av Stallen, ikke gjennom hvert filtervalg ett om gangen).

Siden er pakket i `<Suspense>` i `page.tsx` — Next krever en Suspense-grense
rundt enhver `useSearchParams()`-forbruker, også på en `force-dynamic`-side;
uten den feiler prerender-steget i build. Verifisert: `npm run build` (del av
`npm run verify`) fullførte grønt med denne endringen inne.

**Konsekvens for coachen:** filtervalg (Alle/Akademi/WANG/GFGK/Stille), søketekst
og hvilken spiller som er valgt i desktop-detaljpanelet overlever nå navigasjon
til spillerkortet og tilbake — inkludert et faktisk delbart/kopierbart URL-format
(`?f=wang&q=ole&v=p_123`).

## Tester

Nye: `src/lib/admin/stall-url-state.test.ts` — 9 enhetstester (rundtur
parse↔serialize, fail-closed på ugyldig filter, tom `v=` → `null`, default gir
tom query-string, bevarer fremmede query-parametre).

Kjørt underveis (node:test via tsx, prosjektets faktiske testløper — IKKE
vitest, som feiler stille på disse filene fordi de bruker
`node:test`s `mock.module`):

```
npx tsx --test src/lib/admin/stall-url-state.test.ts
→ 9 pass / 0 fail

npx tsx --conditions=react-server --experimental-test-module-mocks --test \
  src/lib/auth/coach-scope-idor.test.ts src/lib/workbench/publish-atomic.test.ts \
  src/lib/agencyos/skall-ia.test.ts
→ 19 pass / 0 fail
```

Full `npm test` (2380 tester i `src/**/*.test.ts` + `tests/komponenter/*.test.ts`):

```
tests 2376, suites 250, pass 2376, fail 0
test:komponenter: tests 4, pass 4, fail 0
EXIT:0
```

Full `npm run verify` (prisma validate/generate, tsc --noEmit, eslint --quiet src,
seks prosjekt-vaktscript, `npm run prosjekt:sjekk`, kontrast-/fasitdekning-sjekk,
`npm run build`):

```
EXIT:0
```

De eneste feilmeldingene i verify-loggen er `prisma:error … Can't reach database
server at 127.0.0.1:5432` under `next build`s statiske datainnsamling — forventet
i denne sandkassen (ingen lokal Postgres tilgjengelig), påvirker ikke build-
resultatet (EXIT:0), og er uendret av denne PR-en.

**Merk (miljø):** `node_modules` var tomt ved øktstart (0 pakker) — `npm ci` måtte
kjøres først (1018 pakker, ~46 s) før noen tester kunne kjøre i det hele tatt.
Uten det ville `@prisma/adapter-pg` og `next` manglet og gitt falske
modul-ikke-funnet-feil, ikke ekte testfeil.

## Tilgangskontroll — bevis og grense

**Verifisert (unit-nivå, uten DB):** `coach-scope-idor.test.ts` tester selve
`coachScopedPlayerWhere`-spørringsbyggeren direkte mot produksjonskoden (ikke et
speil) — bekrefter at COACH-scope alltid inneholder `coachId`-filteret og aldri
lekker en annen coachs id, og at ADMIN-scope er bevisst bredere (ingen
`coachId`-lås). Både `/admin/spillere/[id]/page.tsx` og
`/admin/workbench/[playerId]/page.tsx` bruker nøyaktig denne funksjonen i
`prisma.user.findFirst({ where: { AND: [coachScopedPlayerWhere(user), { id }] } })`
etterfulgt av `notFound()` hvis spilleren ikke matcher — samme mønster begge
steder, verifisert ved kodelesing.

**IKKE verifisert i denne økten (ingen DB-tilgang i sandkassen):** en ekte
HTTP-forespørsel fra en innlogget COACH mot en spiller utenfor egen stall, for å
se at responsen faktisk blir 404 i praksis (ikke bare at where-klausulen er
korrekt konstruert). Dette er et kjent, dokumentert gap i denne økten, ikke en
påstått verifisert 403/404.

## Avvik fra spesifikasjonen / IKKE gjort i denne økten

1. **Rail-IA (Cockpit·Innboks·Stall·Kalender·Workbench+Mer, 02.09-prototypen)
   ER IKKE re-bygget.** `AGENCYOS_NAV` (7 punkter: Cockpit·Innboks·Kalender·
   Stall·Workbench·Innsikt·Oppsett — `src/components/v2/shell.tsx`) er det
   faktiske skallet alle J04-rutene bruker i produksjon i dag.
   `AGENCYOS_SKALL_TABS` (Stall·Workbench·Kø·Jarvis·Meg — 5 punkter, `src/lib/
   agencyos/skall-ia.ts`) — det gamle AX-01-settet beslutningen 09.09.2026
   reverserte — brukes ikke av noen av de fem J04-rutene, kun av to isolerte
   sider (`/admin/plans`, `/admin/okter`). Verken det gjeldende 7-punkts-settet
   eller det utgåtte 5-punkts-settet er identisk med 02.09-prototypens seks
   destinasjoner (Cockpit·Innboks·Stall·Kalender·Workbench + Mer-ark). Å bygge
   om selve skallet var en betydelig, egen jobb — oppdraget ba eksplisitt om at
   designavklaring ikke skal blokkere funksjonelt arbeid, så dette dokumenteres
   som avvik i stedet for å bygges nå. **Ingen kode i denne PR-en endrer
   skallet/railen.**
2. **Ingen ekte, innlogget browser-test er kjørt.** Sandkassen har ingen
   tilgjengelig database (`127.0.0.1:5432` uoppnåelig), så verken Playwright
   mot en kjørende dev-server eller et faktisk skjermbilde av appen var mulig.
   Alt arbeid i denne økten er derfor **kodelest + enhetstestet + full
   build/typecheck/lint verifisert** — IKKE innlogget-testet, IKKE visuelt
   sammenlignet mot Train-lock-fasit, og definitivt IKKE sett av Anders.
3. **Ingen ny visuell testrigg (390/834/1440, lys/mørk, 200 % zoom) ble bygget.**
   Uten en kjørbar app i sandkassen ville en slik rigg ikke gitt reelle bevis —
   den ville kun bekreftet at komponenten monteres uten å krasje, noe
   `tsc`/`eslint`/`build` allerede gjør mer pålitelig for denne endringen.
4. **Resten av J04-kjeden (steg 1, 3, 4, 5) ble kartlagt og funnet allerede
   koblet sammen med ekte data og fungerende tilstander** (tom/lasting/feil
   finnes i `WorkbenchFeil.tsx`, `loading.tsx`/`error.tsx` per rute) — ingen
   endring var nødvendig der i denne gjennomgangen. Dette er ikke det samme som
   at hvert av disse fire stegene er uttømmende testet i denne økten; de er lest
   og funnet konsistente med spesifikasjonen, ikke instrumentert med nye tester.

## Filer endret

- `src/lib/admin/stall-url-state.ts` (ny) — rene URL-tilstandsfunksjoner
- `src/lib/admin/stall-url-state.test.ts` (ny) — 9 enhetstester
- `src/components/admin/v2/TrainLockStall.tsx` — leser/skriver filter/søk/valgt
  spiller via URL i stedet for kun lokal state
- `src/app/admin/spillere/page.tsx` — `<Suspense>`-grense rundt komponenten

Ingen databaseskjema, migrasjoner, betaling, e-post, seed/import, `vercel.json`,
`vercel.ts`, AgenticOS/Jarvis, Team Norway, WANG, TrackMan eller booking er rørt.

## Gjenstående (ærlig, ikke oppfunnet som løst)

- Rail-IA-avviket i punkt 1 over — krever en egen, bevisst beslutning om
  hvorvidt `AGENCYOS_NAV` skal bygges om mot 02.09-prototypens seks
  destinasjoner, eller om 7-punkts-settet består som en egen, akseptert
  variant. Ikke noe denne økten kan avgjøre på egen hånd.
- Ekte innlogget/visuell verifisering av hele J04-kjeden (krever kjørende DB +
  dev-server/Playwright, utilgjengelig i denne sandkassen).
- Steg 6 («ser hva som ble publisert») er verifisert for Workbench-siden i seg
  selv (ingen redirect, samme uke), men er IKKE verifisert som synlig endring i
  Stall-lista eller på spillerkortet rett etter publisering (ville krevd en
  ekte publiseringstest mot en levende database).
