# Gruppeflyt — designuavhengig kontroll 01.10.2026

Arbeidsgren: `codex/gruppe-publisering-2026-10-01`. Utgangspunkt: `89b757464`
(Workbench til spillerens statistikk). Ingen merge, push, deploy eller hostet databaseendring.

## Levert kode

- `src/lib/workbench/group-session-actions.ts`: gruppeoriginal, lagring/redigering,
  lesing, atomisk publisering og tilbaketrekking. Bruker eksisterende Workbench-tabeller.
- `src/lib/workbench/group-scope.ts`: eksisterende regel for gruppeeier, aktivt
  COACH-medlem og ADMIN; arkiverte grupper kan ikke redigeres. ASSISTANT gir ikke gruppeendring.
- `src/lib/workbench/gruppe-periode-actions.ts` og `apply-template-actions.ts`:
  den konkrete gruppen kontrolleres før årsplan/malutrulling. Slettede brukere utelates.
- `src/app/admin/grupper/[id]/workbench/page.tsx`: samme gruppeavgrensning ved sideinnlasting.
- `src/lib/workbench/wb-actions.ts` og `wb-session-write.ts`: egne planendringer løsriver
  gruppekopier; tilbaketrukket gruppeinnhold skjules også for generelle planhandlinger.
  En gruppekopi opprettes ikke som en ny V2-økt ved individuell redigering.
- `src/app/admin/grupper/[id]/actions.ts`: utmelding og fjerning av lenket planinnhold
  skjer samlet. Publisering og utmelding bruker samme lokale transaksjonslås.
- `tests/local-users/group-journeys.test.ts`: faktiske handlinger med Prisma/SQL og
  syntetiske data. Eksisterende malutrullingsprøve er tilpasset den nye gruppevakten.

## Handlingskontrakt for valgt design

| Handling | Kode | Kontrakt |
|---|---|---|
| Last gruppeplan | `loadGroupWorkbenchSessions(groupId)` | Bare gruppeoriginaler, etter gruppe- og rettighetsvakt |
| Ny gruppeøkt | `saveGroupWorkbenchSession(input)` | `groupId`, stabil `requestId` (UUID), dato, startminutt, varighet, tittel, pyramide og øvelser |
| Rediger gruppeøkt | Samme lagringshandling | Bruk lagret `sessionId` i stedet for `requestId`; send `expectedUpdatedAt` for å avvise foreldet redigering |
| Publiser utvalg | `publishGroupWorkbenchSessions({groupId, sessionIds})` | Hele utvalget lykkes eller rulles tilbake; kun aktive, ikke-slettede PLAYER-mottakere innmeldt før øktstart |
| Trekk tilbake utvalg | `withdrawGroupWorkbenchSessions({groupId, sessionIds})` | Urørte, ikke-startede kopier skjules. Pågående, avsluttet og eget innhold består |

En stabil forespørsels-ID gjenbrukes når lagringen prøves igjen. En ny, separat økt må
få en ny ID. Originalen eies av coachen og har aldri spillerens gjennomføringsdata.
Hver spiller får en fast økt-ID og opphavsreferanse til originalen. Spillerens egen
ID følger videre gjennom Plan, Live, resultat og Stats. Nye forsøk gir ingen ekstra kopi.

Lagret endring gjør originalen til utkast. Mottakernes tidligere publiserte innhold
består til ny publisering. Uendret lagringsforsøk beholder publiseringsstatus.
Oppmøte/fravalg og gjennomføring påvirker ikke originalen. Planendring gjør kopien
permanent egen (`localOverride`). Et valgt fravalg via sletting kommer ikke tilbake
ved neste publisering. Ingen automatisk e-post, betaling, AI eller ekte eksternt varsel brukes.

## Kontrollgrunnlag

- Separat lokal database `ak-hq-gruppe-20261001`, kun `127.0.0.1:55722`.
  Testen kontrollerer vertsnavn, port, databasenavn og databaseidentitet før skriving.
- Skjemaet ble etablert fra dagens Prisma-skjema i denne tomme databasen.
  Ingen appmigrasjon eller skjemaendring inngår i diffen. Lokale tabeller har RLS
  aktivert og ingen offentlige tillatelser. Dette er ikke bevis på hostede RLS-regler.
- Testen oppretter egne syntetiske personer/grupper, og rydder bare sine egne rader.
  Innlogget forespørselsidentitet og Next-cache er testgrenser. Eierskaps- og
  rettighetsspørringer, publisering, gjennomføring og statistikk bruker den faktiske databasen.
- Kjøring: Node 24, `node --import tsx --conditions=react-server
  --experimental-test-module-mocks --test tests/local-users/group-journeys.test.ts`,
  med databasevariabler fra det separate, ignorerte testmiljøet.
- Databaseprøver: **23 av 23 bestått**, ingen feil eller utelatte prøver.
  Private kjøringslogger ligger under `.codex/environments/gruppe/`, som ikke inngår i Git.
- Full `npm run verify` med Node 24.14.0: **exit 0**, 3 876 enhetstester og 14
  komponenttester, ingen feil eller utelatte prøver. Prisma-validering, TypeScript,
  ESLint, statiske kontroller, Next.js 16.3.3-bygg og Serwist bestått.
- `npm run prosjekt:sjekk` og `git diff --check` bestått. Ingen CI-kjøring for denne
  lokale grenen; ingen ny visuell kontroll eller produksjonskontroll.

Prøvene dekker mottakere, eier/aktiv trener/admin, utmeldt/slettet/sent innmeldt bruker,
uvedkommende spiller og coach, tilbakekalt rettighet, feil/blandet utvalg, samtidig
publisering, feil i lagret øvelse, status, samme ID, egne avvik, fravalg, tilbaketrekking,
utmelding, gjennomføring og resultat/statistikk. Seriesletting bevarer fravalg; gruppeoriginaler
avviser generelle spillerhandlinger. Eget øvelsestillegg bevarer eksisterende øvelse-ID-er.

## Sikkerhet og personvern

1. Gruppeoriginaler bruker gruppe- og rettighetsvakt ved hver handling. Fremmed trener,
   hjelpetrener, spiller og tilbakekalt rettighet er avvist i databaseprøvene. Spillerens
   lesing, skriving, gjennomføring og resultat bruker eksisterende eierskapsvakter.
2. Ingen nye logger, eksterne AI-kall eller offentlige mottakerlister. Bare syntetiske
   personer brukes i prøvene. Det lokale testmiljøets hemmeligheter og logger er ignorert.
3. Eksisterende innloggings-, tilgangs- og foreldresamtykkevakt er beholdt. Innlogging og
   samtykke er ikke prøvd med ekte nettlesersesjon her. Datakartet er oppdatert; unntaket
   for manglende full Workbench-eksport/anonymisering er eksplisitt dokumentert under.

## Avgrensning og rester

- Serverflyten er klargjort for valgt Precision-design. Den nye gruppeøktsflyten er
  ikke bundet til den eksisterende årsplansskjermen, og er ikke prøvd gjennom
  innloggede nettleserklikk. Nettleserinnlogging, mobil/desktop og visuell godkjenning
  er derfor ikke dokumentert av denne kontrollen.
- Årsplan- og malutrullingens eksisterende modeller består. De er ikke automatisk
  migrert til den nye gruppeoriginalen. De må kobles til riktig handling ved den
  bestilte skjermintegrasjonen; ikke bygg en ny parallell meny.
- Kontoeksport/anonymisering dekker fortsatt ikke hele Workbench. Dette er et
  bevisst dokumentert overgangsunntak også for gruppekopiene, og må lukkes før
  produksjonsbruk av den nye flyten. Ingen konto-/GDPR-moduler er overtatt fra
  andre samtidige oppgaver her.
- Lokal kontroll er ikke CI-, produksjons- eller leverandørbevis.
