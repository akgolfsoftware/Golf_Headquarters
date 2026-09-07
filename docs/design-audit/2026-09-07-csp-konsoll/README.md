# CSP-konsoll etter fiks — 07.09.2026

Bevis for at loading.tsx-chunken ikke lenger blokkeres av CSP (oppfølging av
skjermbilde-gate A0, `../2026-09-05/skjermbilde-gate-a0/README.md` punkt 5).

`montasje-csp-konsoll.jpg` er tatt mot Vercel-previewen av grenen
`fix/csp-loading-boundary-nonce` (commit `219ae649`), innlogget som
`coachtest@akgolf.test`, Chromium 1280×900. Per rute: skjermbilde, alle
konsollmeldinger (uredigert utover maskering av spiller-id og nonce) og
`requestfailed`-lista.

| Rute | CSP-brudd | Blokkerte forespørsler | Konsollmeldinger |
|---|---|---|---|
| `/admin/analyse` | 0 | 0 | 0 |
| `/admin/analyse?fane=spiller` | 0 | 0 | 0 |
| `/admin/analyse?fane=etterlevelse` | 0 | 0 | 0 |
| `/admin/spillere/[id]` | 0 | 0 | 0 |

`ERR_ABORTED` på `?_rsc=`-forespørsler er avbrutte Next-prefetch, ikke feil
(samme som i A0).

Samme kjøring mot prod (main, uten fiksen) ga «Loading the script
'…/1shk0l6mskz71.js' violates the following Content Security Policy directive»
på alle fire rutene — `tests/e2e/csp-konsoll.spec.ts` er rød der og grønn her.

Rotårsak, regel og feilsøkingsoppskrift: `.claude/rules/gotchas.md`
§Next 16.3 loading.tsx-nonce.
