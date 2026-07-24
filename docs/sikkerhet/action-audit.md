# Server-action auth audit (KS-1) — 2026-07-24

> Resultat av full skann av alle `"use server"`-filer i `src/app/` som del av
> kvalitetsplanens KS-1. Oppdater når nye action-filer legges til
> (`npm run check:action-auth` er gaten).

## Metode

1. Fant alle filer med `"use server"` (124).
2. Klassifiserte etter om de importerer/kaller en kjent auth-helper
   (`getCurrentUser`, `requirePortalUser`, `assertCanViewPlayerData`,
   `ensurePlanAccess`, lokal `krevCoach`, m.fl.).
3. Separat sjekk: muterende Prisma-kall uten auth.

## Resultat

| Klasse | Antall | Handling |
|---|---|---|
| (a) Sjekker rolle/eierskap selv | ~115 | OK — migrert til delte guards der lokal `krevCoach`/`krevAdmin` var duplisert |
| (b) Arver via helper den kaller | inkl. i (a) | `assertCanViewPlayerData`, `ensurePlanAccess`, m.fl. |
| (c) Usikret mutasjon | **1** | `admin/grupper/.../skoledata/actions.ts` — **lukket** med `requireCoachActionUser` |
| Bevisst offentlig (token/skjema) | 3 | guardian-consent, inviter/forelder, marketing/kontakt — utenfor admin/portal-gate |

## Ny kanon

`src/lib/auth/action-guards.ts`:

| API | Bruk |
|---|---|
| `requireCoachActionUser()` | AgencyOS-mutasjoner (erstatter lokal `krevCoach`) |
| `requireAdminActionUser()` | Kun-ADMIN (klubb, wipe, API-nøkler) |
| `requireSpillerActionUser()` | PlayerHQ-mutasjoner + samtykke |
| `requireParentActionUser()` | Forelder-portal |
| `coachAction` / `spillerAction` / `adminAction` | HOF for nye actions |
| `publicAction()` | Markør for bevisst offentlige filer |

## Gate

`scripts/check-action-auth.mjs` — kjøres i `npm run verify`. Feiler hvis en
ny `"use server"`-fil under `src/app/admin` eller `src/app/portal` mangler
auth-import.

## Tester

- Enhet: `src/lib/auth/action-guards.test.ts` (unauthenticated / forbidden /
  consent / HOF).
- E2E (side-nivå): `e2e/auth-guard.spec.ts` — PLAYER redirectes fra `/admin/*`
  (layout). Action-nivå dekkes av enhetstestene over (layout kjører ikke for
  actions — det er hele poenget med KS-1).
