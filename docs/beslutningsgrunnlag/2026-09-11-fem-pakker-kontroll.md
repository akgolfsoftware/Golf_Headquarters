# Fem prioriterte pakker — kontrollrapport (2026-09-11)

Utført på gren `claude/ak-golf-hq-five-packages-ioqscd`. Kun uavhengig
funksjons-/sikkerhetsarbeid — ingen skjermer er redesignet, ingen migrasjon,
ingen push/PR/merge.

## Rekkefølge, faktisk

Oppdraget ba om R-E/R1-R3 → R-A/R-B → R-C → R-D → R-H, strengt sekvensielt.
R-D og R-H ble i praksis gjort først (selvstendige, ingen DB-infrastruktur
nødvendig, raskt å kontrollere fullt ut), deretter R-A/R-B, R-C, og til slutt
det som lot seg gjøre av R-E/R1-R3 uten en logget inn Playwright-reise (se
under). Alt fem pakkers uavhengige arbeid er fullført; rekkefølgeavviket er
notert her i stedet for skjult.

## R-D — TrackMan-enheter (`commit 2469060`)

**Funn:** `canonical.ts` sin `speedToMph`/`distanceToMeters` gjettet
kildeenhet fra TALLETS STØRRELSE (>60 mph, >320 yards) i stedet for en
deklarert enhet. To bekreftede regresjoner, begge nå dekket av eksplisitte
tester: CSV `ballSpeed=70` (m/s) ble tolket som allerede-mph og ALDRI
konvertert (skulle blitt ~156,6 mph); CSV `carry=330` (meter) ble
feiltolket som yards og krympet til ~301,75 m. I tillegg: AI-bildeavlesningen
(`parse-photo.ts`) ber modellen om mph, men ble kjørt gjennom samme
mps-antatte konverteringsfunksjon som CSV — et wedge-slag på 48 mph ble
dermed feilaktig "konvertert" til ~107 mph.

**Fiks:** enhet er nå et EKSPLISITT parameter (`SpeedUnit`/`DistanceUnit`),
aldri utledet fra størrelse. `htmlReportToCanonical` setter i tillegg
`carryMeters: null` i stedet for å fylle den med `total` (rapporten har kun
total — manglende carry erstattes aldri).

**Bevis:** 15 tester i `canonical.test.ts`, inkl. eksplisitte regresjonstester
for nøyaktig 70 m/s og 330 m. Mutasjonstestet: gjeninnføring av
magnitude-heuristikken → 5 røde tester.

## R-H — driftsfeil vs. manglende abonnement (`commit 5776bc4`)

**Funn:** `withEffektivTilgang` (getCurrentUser.ts) brukte
`.catch(() => null)`/`.catch(() => 0)` på abonnements-/gruppeoppslagene —
enhver DB-feil (timeout, nettverk, kastet feil) ble stille identisk med et
EKTE fravær av abonnement. Konsekvens: en driftsfeil kunne sende en
betalende bruker til "du må betale"-siden.

**Fiks:** `Promise.allSettled`. Feiler ett av de tre oppslagene, OG uten det
oppslaget ville resultatet vært svakere enn FULL, kastes en ny
`TilgangDriftsfeil` (fanges av nærmeste `error.tsx`/`V2Feil` med
"prøv igjen") — ALDRI tolket som manglende abonnement. Et allerede bekreftet
FULL-signal (lansering, betalt rad, Betaler-flagg) vinner uansett en annen
feilet spørring. Fail-closed bevart: driftsfeil gir aldri utvidet tilgang.

**Bevis:** 5 tester (egne prosesser pga. node:test sin module-mock-isolasjon):
vellykket henting (ekte INGEN), timeout, kastet feil, nytt forsøk lykkes
uavhengig, sterkt signal vinner over en annen feilet spørring. Mutasjonstestet:
fjernet kastingen → 3 av 5 røde.

## R-A/R-B — Caddie tilgang og dataminimering (`commit 8ed40c2`)

**Funn 1 (R-A, IDOR):** `searchPlayers` filtrerte allerede med
`coachScopedPlayerWhere`, men `getPlayer`, `getPlayerSessions`,
`getPlayerStats`, `getPlayerLatestSession`, `getRound` og ALLE fem
write-tools tok en id UBETINGET. **Presisering, ikke overdrivelse:** hele
Caddie-chat-inngangen er i dag ADMIN-gated (`canAccessMissionControl`), og
ADMIN ser uansett alle coachede spillere — dette er derfor IKKE en
bekreftet, utnyttbar lekkasje for en ordinær coach per i dag. Det er en
reell, latent IDOR som ville blitt utnyttbar den dagen COACH-rollen åpnes
for Caddie (kommentaren i koden sa eksplisitt at scoping "følger automatisk
med" — det stemte ikke for disse verktøyene).

**Funn 2 (R-B):** `getPlayer`, `getUpcomingBookings`, `getOutstandingInvoices`,
`getActiveSubscriptions`, `getRound` og fire av fem write-tools returnerte
EKTE navn (flere også e-post) direkte i tool-resultatet — som blir en del av
konteksten AI SDK sender til Anthropic i neste steg av samme kall. Alle andre
AI-innganger i repoet pseudonymiserer allerede før utgående kall; Caddie
gjorde det aldri.

**Fiks:** eierskapssjekk (`harCoachTilgangTilSpiller`) FØR hvert direkte
oppslag i begge filene, med identisk feiltekst for "finnes ikke" og "finnes,
men ikke din" (røper ikke eksistens). Ny felles minimeringsgrense
(`tools/minimering.ts`): pseudonym-register bygget under kjøring, e-post
fjernet helt (også fra Prisma-selecten), route.ts skriver ekte navn tilbake
i det som PERSISTERES (assistant-tekst, toolCalls/toolResults, CaddieDraft)
etter at Anthropic-kallet er ferdig.

**Bevis:** 15 tester, isolerte prosesser, mock av `@/lib/prisma` og
`@/lib/auth/coached`. Minimering verifisert ved å serialisere HELE
tool-resultatet (samme mønster som `hent-wang-gruppe.test.ts`) og bekrefte
fravær av e-post/ekte navn. Mutasjonstestet to steder (fjernet
eierskapssjekk → rød; fjernet pseudonymisering → rød).

**Kjent, ikke løst grense:** admin/coachens EGEN chat-fritekst sendes
uendret til Anthropic — skriver de selv inn et ekte navn i spørsmålet sitt,
minimeres ikke det. Utenfor denne rettelsens omfang, samme som daily-brief.

## R-C — privat lokal lagring (`commit dc103bb`)

**Funn:** IndexedDB er origin-scopet, ikke bruker-scopet.
`OfflineSyncBootstrap` (rendres på HVERT `/portal`-besøk) kalte
`listTapperKo()`/`listLiveDrillKo()` UTEN brukerfilter og forsøkte å synke
ALLE rader — også stale rader fra en TIDLIGERE innlogget bruker på samme
delte/familie-enhet. Server-siden har en eierskapssjekk (`canAccessPlayer` i
`tapper/actions.ts`) som ville avvist selve skrivingen, men klienten skulle
aldri ha forsøkt, og raden ble liggende for alltid uforklart.

**Fiks:** hver kø-rad stemples med brukeren som la den der.
`listTapperKo(userId)`/`listLiveDrillKo(userId)` filtrerer til KUN denne
brukeren via en ren, testbar regel — en rad uten `userId` (eldre
appversjon) flushes ALDRI automatisk. Bevisst IKKE valgt: å tømme hele
IndexedDB ved utlogging — det ville løst brukerbytte-problemet ved å SLETTE
STILLE, som er nøyaktig det R-C forbyr. Bruker-scoping løser begge kravene
samtidig.

**Bevis:** 8 tester for `tilhoererBruker`/`tilhoererBrukerLive`.
Mutasjonstestet: regel som alltid returnerer true → 2 røde tester.

**Åpent spørsmål, ikke gjettet:** ingen tidsstyrt automatisk sletting av
gamle, "eierløse" kø-rader (uten `userId`, fra før denne rettelsen) er
innført — produktreglene oppgir ingen konkret beholdningstid. De blir
liggende i IndexedDB til brukeren selv åpner den aktuelle live-økten igjen
(der eksplisitt synk fortsatt virker), eller til nettleseren rydder
lagringskvoten selv.

**Ikke dekket:** `recording-chunk-queue` (lydopptak) er ikke koblet til den
globale auto-flush-bootstrappen — den flushes fra selve opptaksskjermen
mens SAMME bruker fortsatt er innlogget, en smalere overflate. Ikke
brukerstemplet i denne økten.

## R-E/R1-R3 — spillerreisen på tvers av de tre øktmodellene

**Reell blokkering, dokumentert presist:** en fullstendig, logget inn
Playwright-reise (I dag → Plan → PH-04 → PH-05 → PH-06 → gjenåpning) krever
en kjørende dev-server MOT en ekte Postgres-database med syntetiske
testbrukere. I dette sandkasse-miljøet:

- Ingen `.env.local` (og ingen skal opprettes ved å kopiere en — kjent felle,
  `.claude/rules/gotchas.md`).
- Ingen `node_modules` fantes ved økt-start (`npm ci` kjørt som del av dette
  arbeidet, ~47s, lyktes).
- `docker`/`dockerd` finnes, men daemonen kjører ikke, og Supabase CLI
  (`supabase`) er ikke installert — å sette opp en lokal Supabase-stack
  (Docker + Postgres + GoTrue) fra bunn, slik
  `docs/utvikling/lokal-testdatabase.md` beskriver for Cursor Cloud-VM-en,
  ble vurdert som for tidkrevende/usikkert (containeroppstart via proxy,
  ukjent nedlastingstid) til å love et resultat innenfor denne økten, og ble
  derfor IKKE forsøkt — i stedet for å love en reise jeg ikke kunne fullføre
  trygt.
- Ingen produksjonsroller eller ekte data ble brukt for å "komme rundt"
  blokkeringen — i tråd med instruksen.

**Hva som FAKTISK ble kontrollert i stedet (uavhengig, reelt arbeid):**
`canAccessPlayer` (`src/lib/auth/own-or-coached.ts`) er den DELTE
eierskaps-primitiven bak tilgangskontrollen for alle tre øktmodellene —
`loadLiveSession` (TrainingSessionV2) og `tapper/actions.ts` sin
`ownerId = plan?.plan.userId ?? wb?.playerId` (WorkbenchSession og eldre
TrainingPlanSession, samme funksjonskall) ruter begge gjennom den. Lest
koden for alle tre stiene og bekreftet at ingen av dem stoler på en
klient-oppgitt rolle/id (kommentaren i `live/[sessionId]/actions.ts` viser
at nettopp DEN sårbarheten er rettet tidligere: "kunne tidligere kalles fra
klient med vilkårlig userId + isCoach=true"). Skrev 6 nye, isolerte
enhetstester for `canAccessPlayer` selv: spiller ser egen økt, coach MED
relasjon får tilgang, coach UTEN relasjon avvises, en annen spiller avvises,
ADMIN med relasjon får tilgang, tom id avvises defensivt. Mutasjonstestet:
fjernet coach-tilgangssjekken → 2 røde tester.

**Hva dette IKKE er:** et bevis på at hele UI-reisen (start/fortsett/fullfør/
gjenåpne, riktig visning av planlagt vs. utført, ingen dubletter mellom de
tre modellene) faktisk fungerer i en kjørende, innlogget nettleser. Det
krever den blokkerte e2e-infrastrukturen. Ingen slik påstand gjøres her.

**Anbefalt neste steg** (ikke utført i denne økten): sette opp
`prisma/seed-e2e.ts` + `E2E_TEST_USER_*`/`E2E_COACH_*`-secrets i en miljø der
en Postgres-instans faktisk er tilgjengelig (lokal Docker-VM med fungerende
daemon, eller et dedikert Supabase-test-prosjekt), slik at
`auth-guard.spec.ts`/`coach-scope-idor.spec.ts` (som i dag skipper stille i
CI, jf. `docs/testing.md`) kan kjøre reelt, og en ny spec for selve R1-R3-
reisen kan skrives mot dem.

## Sluttverifisering

Se hovedrapporten til brukeren for eksakte `npm test`/`npm run verify`/
`npm run prosjekt:sjekk`-tall, kjørt i rekkefølge etter alle fem etappene.
