# Tilgang og avgrensning i AgencyOS (05.10.2026)

Rollemodell (fra koden): `ADMIN` = head coach, `COACH` = assistant coach. «Coachens spillere» er
`coachScopedPlayerWhere` / `harCoachTilgangTilSpiller` (`src/lib/auth/coached.ts`): ADMIN ser alle
coachede spillere, COACH bare egne (aktiv enrollment, egen gruppe eller gruppe der coachen er aktivt
COACH-/ASSISTANT-medlem). Selvbetjente spillere er usynlige for begge. Bookinger: `coachBookingScope`.
Grupper: `editableGroupWhere` (redigere) og ny `gruppeInnsynWhere` (lese).

Metode: statisk lesing av alle `src/app/admin/**/page.tsx` med ID i adresse, alle `"use server"`-filer
(admin, workbench, lib, innsyn, portal/coach, team-norway) og alle `src/app/api/**/route.ts`. Ikke kjørt
mot DB. `src/components/wang/`, `src/app/team-wang/` og AG17–AG24-demodata er utenfor omfang.

Tellinger: 48 handlinger/sider/søkeflater uten spiller- eller ressurs-sjekk funnet og rettet i denne
PR-en (48 uten sjekk før, 0 etter for disse). Restpunktene under «Åpent» (ca. 45 handlinger, mest globale
ressurser som krever en policybeslutning) er ikke rettet.

## Rettet i denne PR-en

| Fil | Handling | Før | Etter |
|---|---|---|---|
| `src/app/admin/runder/page.tsx` | rundeanalyse (liste + telling) | ingen scope: assistant coach så alles runder | `rundeScopeWhere` (`src/lib/admin/runder-scope.ts`) |
| `src/app/admin/trackman/page.tsx` | TrackMan-liste og video | alle spilleres økter og videoer | `coachScopedPlayerWhere` |
| `src/app/admin/trackman/[sessionId]/page.tsx` | økt-detalj | kun rolle | `harCoachTilgangTilSpiller` ellers 404 |
| `src/app/admin/agencyos/live/[sessionId]/page.tsx` | live-økt | kun rolle | `kanSeLiveOkt` (egen økt eller spiller i stall) |
| `src/app/admin/gjennomfore/okter/[id]/page.tsx` | øktark | `findUnique` på id | `coachBookingScope` |
| `src/app/admin/plans/[planId]/page.tsx` | gammel plan-adresse | åpen redirect som røpet eier-id | innlogging + stall-sjekk |
| `src/app/admin/grupper/[id]/arsplan/page.tsx` | gruppens årsplan | kun capability | `gruppeInnsynWhere` |
| `src/app/admin/grupper/[id]/arsplan/skoledata/page.tsx` + `actions.ts` `importerSkoledata` | skoledata | `groupId` ikke sjekket | `editableGroupWhere` / `canEditGroup` |
| `src/app/api/recording/start/route.ts` (bookingId) | start opptak | uten tjenestecoach slapp enhver COACH gjennom | + `harCoachTilgangTilSpiller` |
| `src/lib/ai-plan/generate.ts` (`iterationOf`) | AI-plan (begge ruter) | annen spillers forslag kunne leses | `where: { id, userId }` |
| `src/lib/workbench/ovelse-sok.ts` `hentOktKomponist` | les økt | alle ikke-spillere (også forelder) | plan-eier eller coach med tilgang |
| `src/lib/workbench/fys-turnering-actions.ts` `lagreTurneringsrunde` | skriv runde | `roundId` ikke bundet til plan | bundet til `planId` |
| samme fil `opprettTurneringsplan` | ny turneringsplan | `tournamentEntryId` ikke validert | må tilhøre spilleren |
| `src/lib/workbench/wb-actions.ts` `createSession`, `createSessionSeries` | ny økt | `groupId` ikke validert | `canEditGroup` |
| `src/app/admin/(legacy)/calendar/actions.ts` `moveSession`, `cancelSession` | flytt/avlys booking | enhver coach, alle bookinger | `coachBookingScope` |
| samme fil `opprettOktPaaTid` (+ `createSessionFromCalendar`, `bookIKalender`) | book økt | enhver coachet spiller | coachet spiller krever stall-tilgang (leads er bevisst unntak, jf. `coached.ts`) |
| `src/app/admin/kalender/booking-actions.ts` `hentBookingValg` | spillerliste (500) | alle spillere | ikke-coachede + egne (head coach alle) |
| `src/app/admin/agencyos/uka/actions.ts` `flyttBookingTilDag`, `flyttBookingTilTid` | flytt booking | kun rolle | `coachBookingScope` |
| `src/app/admin/(legacy)/approvals/actions.ts` (5 handlinger) | godkjenn/avvis/mer info | `coachId = null` åpnet for alle spillere | + `user: coachScopedPlayerWhere` |
| `src/app/admin/tournaments/actions.ts` `addResult`, `deleteResult`, `meldPaSpillere`, `fjernPamelding`, `oppdaterPrioritet`, `sendFellesmelding` | resultat, påmelding, melding | kun rolle | `assertCoachTilgangTilSpiller` / scope på mottakere |
| `src/app/admin/kalender/drill-actions.ts` `hentKalenderDrills` | les økt | kun rolle | egen økt eller spiller i stall |
| `src/lib/actions/test-shot-actions.ts` (5 handlinger) | testslag | ingen innlogging i det hele tatt | `assertCanViewPlayerData` på testresultatets eier |
| `src/app/innsyn/talent/discovery/actions.ts` `leggTilITalent` | talent-tracking | enhver bruker-ID | `harCoachTilgangTilSpiller` |
| `src/lib/agents/plan-action-tilgang.ts` + `actions.ts` | godta/avvis forslag | ADMIN uten stall-sjekk (selvbetjente) | ADMIN må også ha stall-tilgang |
| `src/components/portal/workbench/invite-actions.ts` `inviterSpiller` | inviter til økt | mål-bruker ikke validert | aktiv PLAYER + coach må ha tilgang |
| `src/app/admin/(legacy)/stats/moderering/actions.ts` (3 handlinger) | godkjenn/avvis/utfør GDPR-sletting | enhver coach kunne anonymisere en bruker | `requireAdminActionUser` (som innboks/GDPR allerede krever) |
| `src/app/api/admin/search/route.ts` + `global-search-modal.tsx` | søketreff Økonomi/Rapporter | vist for alle coacher | skjult for assistant coach |

## Økonomi bare for head coach (punkt 3)

Allerede på main fra før: `okonomi/page.tsx` bruker `harTilgangTilOkonomi` (bare ADMIN), menyen
`AOS_MER.bareHeadCoach` og `synligeMer(false)` skjuler punktet, `/admin/finance`, `/admin/okonomi` og
`/admin/reports` redirecter dit. Head coach er `ADMIN` — modellert i `UserRole`, ikke gjettet. Lagt til her:
søk (Cmd+K og søke-API) viser ikke Økonomi/Rapporter for COACH (`filtrerHeadCoachBare`, testet).

## Åpent (ikke rettet, trenger beslutning eller egen runde)

Globale ressurser som enhver coach kan endre (policy: skal dette være bare head coach?):
`services/actions.ts` (create/update/delete pris), `anlegg/location-actions.ts` (6), `tournaments/actions.ts`
`updateTournament`/`deleteTournament`/`mergeTurneringer`/`unmergeTurnering`, `tester/benchmarks/actions.ts` (3),
`email-templates/**` (6), `plan-templates/actions.ts` (egen-malsjekk mangler på ~8 handlinger, inkl.
selvgodkjenning av `approved`), `settings/periode-navn/actions.ts` (2), `lib/actions/drills-actions.ts`
(`oppdater`/`slett` øvelse uten eier), `lib/innboks/actions.ts` (felles postboks), `lib/admin-marketing/actions.ts`.

Spiller-relaterte restpunkter:
- `lib/agencyos/live-okt-actions.ts`: coach avgrenses til `coachId` på økta, ikke til spillerens stall; ADMIN uten scope.
- `foresporsler/actions.ts`: forespørsel med `coachId = null` kan besvares av enhver coach.
- `gjennomfore/okter/[id]/actions.ts`: `startOkt`/`kansellerBooking` hopper over spillersjekk når `booking.userId` er null.
- `innsyn/talent/wagr-import/actions.ts`: `importerWagrSpiller` (kobling via e-post), `slettWagrSnapshot`, `synkWagrNaa`.
- `api/upload/route.ts`: staff kan skrive til en annen coachs spillers sti i player-buckets.
- `api/admin/coach-ai/route.ts`: klientbygd spillerkontekst sendes til AI (kjent, kommentert i koden).
- `api/coach/ai-chat/route.ts`: `body.sessionId` eierskaps-sjekkes ikke ved `coachingSession.update`.
- `api/admin/reports/[type]`: scopet, men COACH kan eksportere spillere/runder/økter selv om «Rapporter» er skjult i menyen — bør Rapporter være bare head coach?
- `workbench/drill-actions.ts`, `wb-drill-write.ts`: `exerciseId`/`positionTaskId` valideres ikke mot øvelsesbankens synlighet (`bankOvelseWhere`); `templateId` har ingen eier-/godkjenningssjekk.
- `kalender/hendelse/[id]` og kalenderens hendelseliste viser alle coachers hendelser (tittel, notat) — antatt delt kalender.
- `bookinger/ny`: spillerlisten er bevisst uavgrenset (lead-flyt, jf. `coached.ts`).
- Eksport-actions (`exportBriefReport`, `exportAnalyticsReport`, `exportTournamentsReport`): scope må ligge i `/api/exports/*` — ikke gjennomgått.

Utenfor omfang: `src/app/team-wang/`, `src/components/wang/`, AG17–AG24-demodata.
