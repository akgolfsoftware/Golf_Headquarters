# R-I fullført — siste 12 filer søskentester 16.09.2026

Gren: `claude/r-i-batch8-final-2026-09-16`, oppå main etter PR #907. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Siste leveranse i R-I-kodekontrollen (søskentester for admin-mutasjonsfiler uten dekning): 12 filer gjenstod per forrige leveranse (`handlingstilgang-tildel-run-actions-moderering-drill-tournament-ny-2026-09-16.md`). Alle 12 er nå dekket — dette lukker R-I-gapet i sin helhet.

## Hva som er gjort

Tolv nye testfiler, samme mønster som resten av R-I-serien (`node:test` + `mock.module`), 124 tester totalt:

- **`src/app/admin/(legacy)/agents/actions.ts`** (7) — Mission Control-agentkjøring er ADMIN-only (ikke COACH). Ruteren gir `ok:false` for ukjent agentnavn og fanger unntak fra agent-funksjonen.
- **`src/app/admin/(legacy)/analytics/actions.ts`** (7) — eksport-placeholder, `getCurrentUser` brukt manuelt (ikke delt guard). Dekker slug-logikk per scope (stall/kategori/spillere).
- **`src/app/admin/(legacy)/brief/actions.ts`** (6) — samme mønster som analytics. **Funn notert, ikke rettet:** filnavn-slug fra coachens navn dropper æ helt (ikke til "ae") pga. NFD-normaliseringens rekkefølge — samme klasse avvik som funnet i `services/actions.ts` i forrige batch, kosmetisk, ikke en tilgangskontrollfeil.
- **`src/app/admin/(legacy)/email-templates/[id]/rediger/actions.ts`** (15) — fire handlinger, delt ressurs uten per-coach eierskap.
- **`src/app/admin/(legacy)/settings/calendar/actions.ts`** (15) — alt selv-scopet (alltid `user.id`), men `oppdaterSubscriptions` har et eksplisitt IDOR-vern: hver subscription-id i input MÅ finnes i brukerens EGEN Google-tilkobling. Dekker også watch-oppsett/stopp-logikken.
- **`src/app/admin/(legacy)/stats/overview/actions.ts`** (5) — `sjekkDbHelse` er ADMIN-only read-only DB-ping.
- **`src/app/admin/(legacy)/tester/benchmarks/actions.ts`** (12) — DataGolf-fasit-godkjenning. Dekker at godkjenning/avvisning er stille no-ops når testen mangler pending-forslag, og at en IKKE-MONOTON foreslått nivåstige aldri skrives.
- **`src/app/admin/agencyos/uka/actions.ts`** (15) — to søsterhandlinger (flytt booking til dag/til tid) uten per-coach eierskap. Dekker status-guard (fullført/kansellert), kollisjonsvern, og at ren dato («YYYY-MM-DD») tolkes som LOKAL dag.
- **`src/app/admin/godkjenninger/del-digest-action.ts`** (7) — «Del ukesdigest» deler kun med spillere i coachens EGET scope (`coachScopedPlayerWhere`). Dekker entall/flertall-formulering i svaret.
- **`src/app/admin/grupper/[id]/arsplan/skoledata/actions.ts`** (8) — capability-gate `EDIT_GROUP_PLANS`. Dekker hele linje-parseren (dato/kategori/trinn/tittel-validering) og at ugyldige linjer rapporteres uten å stoppe import av gyldige.
- **`src/app/admin/settings/periode-navn/actions.ts`** (10) — delt ressurs, `normaliserNavn`/`ukjenteNavn` (rene funksjoner) importert direkte. Dekker at «ukjente navn»-beregningen ekskluderer navn som allerede har lagret mapping.
- **`src/app/admin/tester/foreslatte/actions.ts`** (17) — capability-gate `MANAGE_TESTS`. Dekker den viktigste regelen i filen: en custom-test med LOGGEDE RESULTATER slettes ALDRI ved avvisning, den settes PRIVATE i stedet.

Ingen produksjonskode i disse 12 filene ble endret — alle var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle 12 testfiler kjørt isolert: 7/7, 7/7, 6/6, 15/15, 15/15, 5/5, 12/12, 15/15, 7/7, 8/8, 10/10, 17/17 bestått (124/124 totalt)
- Full `npm run verify`: grønt. `npm test`: 3291 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- **Verifisert etterpå:** `grep -rl "^\"use server\"" src/app/admin` minus filer med `.test.ts`-tvilling = 0 filer. Alle 53 admin-mutasjonsfiler har nå søskentest.
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

## Samlet for hele R-I-serien (14.–16.09.2026)

44 admin-mutasjonsfiler manglet søskentest ved start av serien (14.09.2026). Over ni leveranser (PR #896, #899, #902, #903, #904, #905, #907, og denne) er alle 53 filer nå dekket med totalt ~730 nye tester. Se lenkekjeden i `docs/MASTERPLAN-GJENSTAAENDE.md` §Kodekontroll · R-I for hver enkelt leveranse.

## Ikke påstått

- At noen av de 53 filene mangler faktisk tilgangskontroll — ingen produksjonskode er endret i hele serien.
- At alle handlingsflater i appen (inkludert `src/lib`, `src/components`, portal-siden) har søskentest — R-I har dekket `src/app/admin` spesifikt.
- Innlogget Next-/database-reise for noen av filene i denne leveransen.
- Visuell godkjenning, D0 eller lanseringsklar app.
