# R-I fortsettelse — API-nøkler, forelderinvitasjon, meldinger, tilgjengelighet og øktgjennomføring søskentester 16.09.2026

Gren: `claude/r-i-batch5-2026-09-16`, oppå main etter PR #903. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 27 admin-mutasjonsfiler manglet søskentest per forrige leveranse (`handlingstilgang-team-grupper-turnering-kobling-plans-klubb-2026-09-16.md`). Denne batchen prioriterte den mest sikkerhetskritiske gjenstående filen (API-nøkler), tre filer med ekte per-coach eierskap, og en fil med et dokumentert to-lags eierskapsmønster inni en transaksjon.

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 68 tester totalt:

- **`src/app/admin/(legacy)/settings/api/actions.ts`** (10 tester) — sikkerhetskritisk: `createApiKey` er hardkodet ADMIN-only via en manuell `role !== "ADMIN"`-sjekk (avviker fra resten av kodebasens `requireAdminActionUser`-mønster, verdt å teste direkte). `revokeApiKey` har en annen regel: eier ELLER ADMIN kan tilbakekalle. Testet eksplisitt at hemmeligheten ALDRI lagres i klartekst — kun SHA-256-hashen (64 hex-tegn) skrives til databasen, og at den returnerte `secret` avviker fra `hashedKey`.
- **`src/app/admin/(legacy)/spillere/[id]/profil/actions.ts`** (9 tester) — filens egen kommentar dokumenterer motivasjonen: «rolle-sjekk alene er ikke nok — uten coach-scoping kunne en coach koble en vilkårlig e-post som forelder til en hvilken som helst spiller, og invitasjonen sendes faktisk ut.» Dekker eierskapsporten (`coachScopedPlayerWhere`) pluss forretningsreglene: ugyldig e-post, dobbel åpen invitasjon til samme e-post, og at e-postutsending er best-effort (invitasjonen består selv om Resend feiler).
- **`src/app/admin/(legacy)/messages/actions.ts`** (14 tester) — to ulike eierskapsmekanismer i samme fil: `sendMelding` sjekker `tråd.coachId !== me.id && role !== ADMIN` INNI transaksjonen (en COACH som ikke eier tråden avvist, ADMIN unntatt), mens `sendMeldingTilSpiller` bruker det vanlige `assertCoachTilgangTilSpiller`-mønsteret og enten gjenbruker en eksisterende DIRECT-tråd eller oppretter en ny.
- **`src/app/admin/(legacy)/availability/actions.ts`** (18 tester) — `updateSlot`/`deleteSlot` har ekte per-coach eierskap (`slot.coachId !== user.id && role !== ADMIN`); `addSlot` oppretter alltid på egen coachId. Dekker også forretningsreglene: manglende ukedag/dato, sluttid før starttid, og no-dobbeltsted-vernet (en coach kan ikke være tilgjengelig på to anlegg samtidig i overlappende tidsvindu).
- **`src/app/admin/gjennomfore/okter/[id]/actions.ts`** (17 tester) — begge handlinger krever `harCoachTilgangTilSpiller`, men feilen fanges try/catch INNI handlingen og returneres som `{ok:false}` — kun rollegrensen (`requirePortalUser`, utenfor try/catch) kaster. Dekker `startOkt` sin idempotens-/entydig-treff-logikk grundig: allerede koblet booking gjenbruker samme live-økt, nøyaktig én ledig PLANNED-kandidat kobles, mens 0 ELLER FLERE kandidater aldri gjettes — faller trygt tilbake til en frisk økt med nøytrale defaults. Testet også at en kandidat allerede koblet til en ANNEN booking filtreres bort riktig.

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 10/10, 9/9, 14/14, 18/18, 17/17 bestått (68/68 totalt)
- Full `npm run verify`: grønt. `npm test`: 3055 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

## Gjenstår

22 admin-mutasjonsfiler mangler fortsatt søskentest (27 minus de 5 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige 22 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
