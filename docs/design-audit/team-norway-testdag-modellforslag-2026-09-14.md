# Team Norway — testdag, modellforslag (14.09.2026)

Konkret, minst mulig normalisert modell for «testdag». Additiv — ingen endring av eksisterende tabeller utover det som er beskrevet i egen `recordedById`-lapp (trenerføring). Ingen databasekommando kjørt; dette er kildekode klar for review, ikke migrert noe sted.

## To nye tabeller

**TestDay** (testdagen selv)
- `id`
- `groupId` — FK `Group` (team-norway-gruppen; gjenbruker eksisterende gruppemodell, ikke en ny TN-spesifikk tabell)
- `coachId` — FK `User`, opprettet av
- `title` — String
- `location` — String?
- `scheduledAt` — DateTime (dato/sted er tittel+lokasjon+tidspunkt, ikke egne fritekstfelt)
- `protocolId` — String (versjonert katalog-id, samme format som `tn-v3-<id>` brukt i dag — IKKE en ny protokollmodell)
- `status` — enum `TestDayStatus { PLANNED ACTIVE COMPLETED CANCELLED }`
- `createdAt` / `updatedAt`

**TestDayParticipant** (kø-raden per spiller)
- `id`
- `testDayId` — FK `TestDay`, `onDelete: Cascade`
- `playerId` — FK `User`
- `order` — Int (rekkefølge i køen, satt ved opprettelse fra aktive gruppemedlemmer)
- `status` — enum `TestDayParticipantStatus { PENDING DONE SKIPPED ABSENT }`
- `sessionId` — String? (peker på eksisterende `TestSession.id` mens den pågår)
- `resultId` — String? (peker på eksisterende `TestResult.id` når fullført — dette ER koblingen til «tildeling/resultat»)
- `@@unique([testDayId, playerId])`
- `@@unique([testDayId, order])` (revisjonssikker rekkefølge — ingen to deltakere kan dele plass)

## Hvorfor ikke mer

- Selve forsøkene/målingene bruker EKSISTERENDE `TestSession`/`TestResult` uendret (utover `recordedById`, se egen lapp) — testdagen er et tynt kø-/statuslag over dem, ikke en parallell resultatmodell.
- Ingen JSON-fritekstmodell (f.eks. i `GroupSchedule.description`) — én rad per deltaker gir ekte spørrbarhet, unik-constraints og fortsett/gjenåpne uten å parse tekst.
- `protocolId` er en streng (samme mønster som dagens `tn-v3-<id>`), ikke en FK til en ny protokolltabell — protokollversjonering er allerede løst i `TN_VERSION`/katalogen.

## Reise dekket av modellen

- **Opprett:** coach velger gruppe (implisitt team-norway), tittel, sted, tidspunkt, protokoll, aktive deltakere → `TestDay` PLANNED + `TestDayParticipant`-rader PENDING i valgt rekkefølge.
- **Kø/gjennomføring:** coach åpner testdagen → ser neste PENDING-deltaker → fører test (via trenerførings-actionen, se egen lapp) → `TestDayParticipant.status = DONE` + `resultId` satt → neste i køen.
- **Hopp over / ikke møtt:** setter status `SKIPPED`/`ABSENT` uten resultat, køen går videre.
- **Fortsett/gjenåpne:** `TestDay.status = ACTIVE` inntil alle deltakere er DONE/SKIPPED/ABSENT → da `COMPLETED`. Å åpne testdagen på nytt fra en annen økt/enhet leser ganske enkelt `TestDayParticipant`-radene — ingen egen «lagre kø-posisjon»-mekanisme trengs.

## Status i denne leveransen

Ikke implementert som skjema i denne runden — kun beskrevet her for review, per instruks. `recordedById` (trenerføring) er en separat, mindre lapp og forberedes som additiv kildekode i samme økt. Fellestesting-skjermen (TN-03-integrasjonen) bygges i denne omgangen over EKSISTERENDE `TestAssignment`/`TestResult`-tilstand (kø-lignende, men uten `TestDay`-persistens) inntil denne modellen er avstemt og eventuelt tatt inn.
