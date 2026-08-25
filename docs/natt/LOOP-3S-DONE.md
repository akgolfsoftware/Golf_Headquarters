# LOOP 3S — DONE (25.08.2026)

Spiller Start / Fullfør / Hopp over på en publisert Workbench-økt.
Bølge 1, loop 3S av 14. Gren `claude/agency-workbench-uke-ui-c4d2a4`. Ikke merget.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | grønn |
| `npm test` | 1595/1595 |
| Nye ruter i byggutdraget | `ƒ /portal/tren/wb` og `ƒ /portal/tren/wb/[sessionId]` |

**Manuell klikk-test er IKKE utført.** Krever innlogging som spiller i en
kjørende app — Claude skriver aldri Anders' passord (skjermbilde-gaten).
Flyten spiller → se økt → Start → Fullfør står derfor uverifisert i
nettleser; koden er typesjekket, testet og bygget, ikke klikket.

## Hva som ble bygget

Loop 3 («I dag ← loadPlayerDay», full integrasjon i chat-først-siden
`PortalChatHjem`) er en egen, ikke-startet loop. Denne loopen bygde i
stedet en egen, minimal spiller-flate ved siden av — samme mønster som
Loop 2 la Agency-Workbench ved siden av det gamle systemet:

| Fil | Hva |
|---|---|
| `src/lib/workbench/wb-actions.ts` | **Ny action** `loadPlayerSession(sessionId)` — spillerens eget økt-ark. Filtrerer PÅ STATUS i tillegg til eierskap: DRAFT er aldri synlig, selv om spilleren selv eier raden (samme invariant som `loadPlayerDay`, men her mot direkte URL-tilgang på én økt) |
| `src/components/portal/workbench/OktArk.tsx` | Klientkomponent — viser økt, øvelser, status. Start (PUBLISHED→IN_PROGRESS), Fullfør (IN_PROGRESS→COMPLETED), Hopp over (PUBLISHED/IN_PROGRESS→SKIPPED). Kaller `wb-actions` direkte, `WbResultat` → toast (sonner) ved feil, lokal state oppdateres fra returnert økt |
| `src/app/portal/(fullscreen)/tren/wb/[sessionId]/page.tsx` | Økt-arket. `requirePortalUser({ allow: ["PLAYER"] })` → `loadPlayerSession`. Tre tilstander: Feil (kort norsk + implisitt «Prøv igjen» via nettleser-reload), «Fant ikke økten» (dekker både faktisk manglende og DRAFT-skjult — identisk svar, lekker ikke at et utkast finnes), innhold |
| `src/app/portal/(fullscreen)/tren/wb/[sessionId]/loading.tsx` | Skjelett |
| `src/app/portal/(fullscreen)/tren/wb/[sessionId]/error.tsx` | `V2Feil` for uventede feil (Prisma nede o.l.) |
| `src/app/portal/(fullscreen)/tren/wb/page.tsx` | Midlertidig liste over dagens Workbench-økter (`loadPlayerDay`) med lenke til hver økt-ark — inngangen Loop 3 senere skal erstatte med ekte «I dag»-integrasjon |
| `src/app/portal/(fullscreen)/tren/wb/loading.tsx`, `error.tsx` | Samme mønster |
| `src/lib/domain/workbench/labels.ts` | Nye norske strenger: `completeSession`, `skipSession`, `sessionNotFoundTitle/Body`, `sessionCompletedTitle`, `sessionSkippedTitle`, `backToToday` |

## Hvorfor egen flate, ikke `PortalChatHjem`

`docs/natt/README.md` deler «I dag ← loadPlayerDay» (Loop 3) og «Økt-ark +
start/complete» (Loop 3S) i to separate loops. `PortalChatHjem` er en dyp,
chat-først skjerm bygget helt på den GAMLE modellen
(`getGjennomforeData` → `TrainingPlanSession`/`TrainingSessionV2`) — å koble
om datakilden der er nettopp Loop 3-jobben, ikke denne. Denne loopen holdt
seg til sitt eget oppdrag (økt-arket) og la til en minimal, midlertidig
liste for at flyten skal være manuelt testbar før Loop 3 kobler
`loadPlayerDay` inn i den ekte «I dag»-siden.

## Sikkerhet

`loadPlayerSession` er strengere enn den eksisterende `loadSession`
(coach-siden): den lar KUN spilleren selv se sin egen rad, og filtrerer i
tillegg DRAFT/SCHEDULED/CANCELLED bort — selv om spilleren teknisk eier
raden og en direkte URL til en DRAFT-økt ville passert `loadSession`s
eierskaps-sjekk. «Finnes ikke» og «er DRAFT» gir identisk svar, så URL-en
alene kan ikke brukes til å se om coachen har et utkast liggende.

## Ikke gjort (bevisst, anti-scope)

- Ingen drill-nivå rep-logging (live-runde-mønsteret i `(fullscreen)/live/`
  har dette for den gamle modellen — ikke del av dette oppdraget).
- Ingen integrasjon i `PortalChatHjem`/composer/dock — Loop 3.
- Ingen godkjenning av coach-/gruppeforslag — Loop 3T.
- `startSession`/`completeSession`/`skipSession` i `wb-actions.ts` er urørt
  (allerede bygget i Loop 1); ingen endring i status-maskinens overganger.

## Neste

Loop 3T (Godta/Avvis + ikke delta). Loop 3 («I dag ← loadPlayerDay») er
fortsatt åpen og bør prioriteres for å erstatte den midlertidige listen
over.
