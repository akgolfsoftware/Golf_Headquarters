# R-I fortsettelse — coach-profil, e-postmaler, tjenester, agent-feedback og Google-kalender søskentester 16.09.2026

Gren: `claude/r-i-batch6-2026-09-16`, gren fra samme punkt som PR #904 (oppå main etter PR #903) — de to grenene dekker ulike filer i det samme 27-fils gapet og overlapper ikke.

## Bakgrunn

Fortsettelse av R-I-gapet: 27 admin-mutasjonsfiler manglet søskentest per forrige leveranse (`handlingstilgang-team-grupper-turnering-kobling-plans-klubb-2026-09-16.md`). Denne batchen (parallell med batch 5/PR #904) dekker fem andre filer fra samme liste: selvbetjent coach-profil, delte admin-ressurser uten per-coach eierskap (e-postmaler, tjenestetyper), agent-feedback-capabilityen og Google-kalender-broen.

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 55 tester totalt:

- **`src/app/admin/(legacy)/profile/actions.ts`** (9 tester) — `oppdaterCoachProfil` oppdaterer ALLTID den innloggede coachens egen bruker (`me.id`, aldri en id fra klienten), så vernet er rollegrensen og valideringen, ikke et eierskapslag. Dekker feltvalidering (navn, e-post, bio, hcp), at e-post som allerede er tatt av en ANNEN bruker avvises, og at eksisterende `preferences`-JSON slås sammen med nye chip-felt i stedet for å overskrives.
- **`src/app/admin/(legacy)/email-templates/actions.ts`** (10 tester) — e-postmaler er en delt admin-ressurs uten per-coach eierskap; vernet er rollegrensen alene. Dekker slug-normaliseringen i `createTemplate` (kun a-z0-9, aldri lagret tom).
- **`src/app/admin/(legacy)/services/actions.ts`** (12 tester) — tjenestetyper (priser/varighet vist på booking-siden) er samme mønster. Dekker `createService` sin unik-slug-logikk (kolliderende slug appender `-2`, `-3` osv.). **Funn utenfor R-I-scope, notert men ikke rettet:** `lagSlug()` sin NFD-normalisering strippes FØR å/æ/å-erstatningsreglene rekker å kjøre, så «på» blir til slug-fragmentet «pa», ikke «paa» — kosmetisk avvik i slug-generering, ikke en tilgangskontrollfeil, derfor ikke rettet i denne leveransen.
- **`src/app/admin/agents/[agentId]/actions.ts`** (9 tester) — `gisFeedback` krever `Capability.USE_AGENTS` (G6), men IKKE fanget i try/catch her (ulikt `caddie/dashbord/actions.ts`) — en COACH uten granted USE_AGENTS får et kastet unntak, ikke `{ok:false}`. Dekker også at kommentarfeltet trimmes og kappes til 1000 tegn, og lagres som `null` (ikke tom streng) når det er tomt.
- **`src/app/admin/kalender/google-actions.ts`** (15 tester) — selve eierskapsvalideringen mot Google ligger i `google-calendar-rediger.ts` (mocket som ekstern avhengighet); denne filens ansvar er rollegrensen og input-validering, og at den ALLTID sender den innloggede brukerens EGEN id videre til de underliggende Google-kallene — aldri en id fra klienten. Testet eksplisitt for alle fire handlinger (`opprettGoogleHendelse`, `oppdaterGoogleHendelse`, `slettGoogleHendelse`, `hentKalendervalg`).

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 9/9, 10/10, 12/12, 9/9, 15/15 bestått (55/55 totalt)
- Full `npm run verify`: grønt. `npm test`: 3042 tester bestått, 0 feil (målt mot main FØR batch 5/PR #904 var flettet — se merknad om parallelle grener under). `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

### Merknad om parallelle grener

Denne batchen ble bygget parallelt med batch 5 (PR #904) fra samme utgangspunkt i main, for å utnytte ventetiden mens PR #904 sin CI kjørte. Filvalget ble bevisst holdt disjunkt fra batch 5-listen (verifisert mot `git diff`-inventaret før arbeidet startet), så det er ingen duplisert testdekning. `docs/MASTERPLAN-GJENSTAAENDE.md`-raden for R-I vil kreve manuell sammenslåing av de to batch-oppføringene ved fletting av den PR-en som kommer sist, siden begge redigerer samme rad.

## Gjenstår

Fra dette gapets ståsted (27 filer, uavhengig av batch 5): 22 admin-mutasjonsfiler mangler fortsatt søskentest. Kombinert med batch 5 (når begge er flettet): 17. Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
