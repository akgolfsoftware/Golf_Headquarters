# R-I fortsettelse — testtildeling, agent-kjøring, GDPR-moderering, kalender-drills og ny turnering søskentester 16.09.2026

Gren: `claude/r-i-batch7-2026-09-16`, rebaset mot main etter PR #905. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 17 admin-mutasjonsfiler manglet søskentest per forrige leveranse (`handlingstilgang-profile-email-templates-services-agents-google-kalender-2026-09-16.md`). Denne batchen prioriterte den mest sikkerhetskritiske gjenstående filen i hele serien (GDPR-moderering/anonymisering) og tre filer med ekte per-coach eierskap.

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 57 tester totalt:

- **`src/app/admin/(legacy)/tester/tildel/[spillerId]/actions.ts`** (12 tester) — filens egen kommentar dokumenterer motivasjonen: «rolle-sjekk alene lot en coach tildele test — og sende varsel — til en hvilken som helst bruker-id.» Dekker eierskapsporten (`coachScopedPlayerWhere`) pluss tre forretningsregler: en blokkert Team Norway-protokoll avvises med sin egen melding, en PRIVATE custom-test opprettet av en ANNEN coach avvises for COACH (men ikke ADMIN), og en ugyldig frist avvises.
- **`src/app/admin/agents/[agentId]/run-actions.ts`** (16 tester) — to vernlag for begge handlinger (`kjorPlanRevisjon`, `kjorPeaking`): `Capability.USE_AGENTS` (kastes ufanget hvis COACH mangler grant) og ekte per-coach eierskap (`harCoachTilgangTilSpiller`, fanget som `{ok:false}`). En COACH uten tilgang til spilleren som eier planen/turneringen avvises selv om capability-gaten er bestått. Testet også at et unntak fra selve agent-kjøringen fanges som `{ok:false}` med feilmeldingen.
- **`src/app/admin/(legacy)/stats/moderering/actions.ts`** (17 tester) — den mest sikkerhetskritiske filen i R-I-serien så langt: `utforGdprSletting` utfører faktisk GDPR-anonymisering. Dekker rollegrensen og alle status-/type-vaktene: en sak som ikke er GDPR_SLETTING avvises, en GDPR-sak i OPEN-status (må godkjennes først) avvises, en allerede EXECUTED sak avvises, og — den viktigste regelen — sletting av en coach-/admin-konto avvises eksplisitt («Coach-/admin-kontoer kan ikke GDPR-slettes herfra»).
- **`src/app/admin/kalender/drill-actions.ts`** (5 tester) — ren lesevisning uten per-coach eierskap (redigering skjer i Workbench, ikke her — dokumentert i filens eget filhode). Dekker fallback-logikken for planlagte reps (`repetitions ?? repAntall ?? 0`) og at faktiske reps hentes fra siste logg.
- **`src/app/admin/tournaments/ny/actions.ts`** (7 tester) — delt admin-ressurs uten per-coach eierskap, samme mønster som `tournaments/actions.ts`. Dekker zod-krysssjekkene i wizard-skjemaet (sluttdato før startdato, påmeldingsfrist etter startdato) og at wizard-felt uten egne Tournament-kolonner pakkes riktig inn i `notes`-JSON-blobben.

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 12/12, 16/16, 17/17, 5/5, 7/7 bestått (57/57 totalt)
- Full `npm run verify`: grønt, kjørt på nytt etter rebase mot main med PR #905 flettet. `npm test`: 3167 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

## Gjenstår

12 admin-mutasjonsfiler mangler fortsatt søskentest (17 minus de 5 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige 12 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
