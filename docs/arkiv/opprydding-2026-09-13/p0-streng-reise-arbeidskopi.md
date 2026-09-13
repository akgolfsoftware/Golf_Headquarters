# P0 — streng innlogget reise 13.09.2026

Utgangspunkt: `bcd9812a038e0fe002781b96876032115fb8dce8`. Egen gren `codex/p0-streng-reise-2026-09-13`. Dette notatet beskriver testkorreksjonen. Første strenge nettleserkjøring ga 1/4 bestått; modellspesifikk testforventning er deretter rettet. Korrigert kjøring bestod deretter alle fire prøver på 3,1 minutter (kode 0).

## Endring

- Fjernet automatisk direkte navigasjon etter feilet V2-start og etter nettleserens feilside. Feil i produktnavigasjonen skal nå feile prøven.
- Alle tre øktmodeller går fra innlogget I dag via Plan, valgt kalenderøkt og produktets Start økt-lenke. V2/eldre gjenåpnes gjennom Til planen og Se oppsummering. Workbench bruker Se recap fra I dag.
- Slagtall kontrolleres eksakt i kortet Slag registrert. V2-repetisjoner kontrolleres i samme definisjonsrad som etiketten Repetisjoner; treffforholdet kontrolleres eksakt.
- To uvedkommende roller besøker hovedrute, brief, modellens aktive side og summary direkte. Det kreves eksakt forventet adresse, HTTP 200, synlig Plan/Workbench og fravær av øktinnhold. Generell feilside eller vilkårlig omdirigering gir ikke grønt. Dette er 24 avvisningsbesøk; skrivehandlinger er ikke dekket av denne pakken.
- Vellykkede og feilede reiser får lokale spor under `/tmp/ak-hq-p0-streng-playwright-results`. Spor starter først etter innlogging og avsluttes før neste rolle logger inn. De kan inneholde lokale økttokens og skal aldri legges i Git eller deles eksternt.
- Runneren avviser opptatt port 3010 før stack/seed, og kontrollerer porten igjen før Next-start. Den gamle lsof/SIGTERM-blokken som drepte alle treff på porten er fjernet.
- Next/seed/nettleser arver kun navngitte systemvariabler, lokale Supabase-verdier og seedens navngitte P0-felt. Eksterne betalings-, e-post- og AI-nøkler arves ikke. Runneren avviser `.env`, `.env.local`, `.env.development` og `.env.development.local`, siden Next ellers laster dem automatisk.

## Kilde for forventet navigasjon og avslag

- `src/components/portal/v2/PlanV2.tsx`: kalenderknapp velger økt; detaljfeltets lenke bruker `session.href` og statusstyrt Start økt/Se oppsummering.
- `src/lib/portal/session-hrefs.ts` og `src/lib/portal-live/live-route.ts`: modell og status bestemmer brief/active/tapper/summary.
- `src/app/portal/(fullscreen)/live/[sessionId]/page.tsx`: manglende eierskap går til Workbench.
- `brief/page.tsx`: uvedkommende V2 går til Plan; Workbench/eldre går til Workbench.
- `active/page.tsx`: uvedkommende V2 går til Plan. `tapper/page.tsx`: uvedkommende Workbench/eldre går til Workbench.
- `summary/page.tsx`: uvedkommende V2/eldre går til Plan; Workbench går til Workbench.
- `src/components/portal/live/SessionSummary.tsx`: eget Slag registrert-kort for tapper; Repetisjoner/Markert som treff for V2.

Kun modellens relevante aktive side inngår: V2 active, Workbench/eldre tapper. Modeller med feil type-ID på den andre aktive siden er ikke nye autorisasjonsbevis.

## Utført kontroll

- `node --check scripts/p0-test-innlogget-reise.mjs`: bestått.
- ESLint begrenset til de tre endrede kodefilene: bestått.
- TypeScript uten filskriving, begrenset til de to Playwright-filene og nødvendige importer: bestått.
- `git diff --check`: bestått.
- Hovedagenten gjennomførte koordinert lokal seed og nettleserprøve: 4/4 bestått på 3,1 minutter, kode 0. Full `npm run verify`, commit og push er ikke kjørt i denne arbeidskopien; integrasjonseieren kjører samlet kvalitetskontroll.

## Første strenge nettleserkjøring

Hovedagentens koordinerte kjøring avsluttet med kode 1: **én bestått og tre feilet**. V2 fulgte Plan → brief → active → summary → produktlenke for gjenåpning uten navigasjonsomvei og bestod. Workbench og eldre plan feilet fordi testhjelperen feilaktig forventet hovedruten i Start økt-lenken; produktet bruker allerede `/brief`. Coach-prøven feilet deretter fordi Workbench-økten ikke var gjennomført.

Testforventningen er rettet med eksplisitt modell: V2 planlagt bruker hovedruten, Workbench/eldre planlagt bruker `/brief`, og alle fullførte bruker `/summary`. Kilder: `src/lib/portal/workbench-week.ts`, `src/lib/portal/plan-week.ts` og `src/lib/portal/session-hrefs.ts`. Selve produktklikket og eksakt kontroll av ankomst er beholdt; ingen goto, fallback eller utvidet adresseuttrykk er lagt til. Den rettede pakken ble kjørt på nytt med samme runner: **4/4 bestått på 3,1 minutter**, avslutningskode 0. Alle tre produktreiser og 24 avvisningsbesøk bestod. Ingen navigasjonsomvei ble lagt til. Resultatet gjelder dette isolerte testutgangspunktet med firefilers retting, og må bekreftes mot samlet kandidat etter integrasjon.

## Koordinert kjøring

Kjør fra denne arbeidskopien når hovedagenten har frigitt stack/port. Forutsetter installerte avhengigheter/generert Prisma-klient, Docker, eksisterende HQ-stackkonfigurasjon i `/tmp/ak-hq-supabase-local`, HQ-skjema på 54422 og lokal Supabase CLI. Ingen miljøfiler fra produksjon skal kopieres inn.

```sh
node scripts/p0-test-innlogget-reise.mjs
```

Runneren bruker 54421/54422, seeder kun syntetiske roller/økter, starter Next på 3010 med `VEDLIKEHOLD=0` og `BOOKING_ACTIVE=false`, kjører fire Chromium-prøver med én arbeider og ingen gjentakelser, og stopper sin egen Next-prosess. Dette er desktop-funksjonsbevis, ikke visuell godkjenning, mobilbevis eller lanseringsvedtak. En eventuell appfeil skal dokumenteres og rettes separat; ingen navigasjonsomvei skal gjeninnføres.
