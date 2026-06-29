# Auth — skjerm- & interaksjons-inventar (`/auth`)

> READ-ONLY. Hver påstand `fil:linje`. `login` er fullt element-verifisert (format-fasit); øvrige
> skjemaer (`signup`/`forgot`/`reset`) følger samme ko-lokaliserte mønster (`<rute>/<form>.tsx`).

## Skjermer
| id | Rute | Fil | Jobb | Arketype | Gating | Tilstander | Prioritet |
|---|---|---|---|---|---|---|---|
| auth.login | `/auth/login` | `src/app/auth/login/page.tsx:1` → `login-form.tsx:17` | Logg inn (e-post/passord + Google) | fluid-editorial (sentrert kort) | offentlig | error ✓, loading ✓ | P0 |
| auth.signup | `/auth/signup` | `src/app/auth/signup/page.tsx:1` → `signup-form.tsx` | Registrer ny bruker | fluid-editorial | offentlig | error/loading (UVERIFISERT linje) | P0 |
| auth.forgot | `/auth/forgot-password` | `src/app/auth/forgot-password/page.tsx:1` → `forgot-form.tsx` | Be om tilbakestilling | fluid-editorial | offentlig | error/loading (UVERIFISERT) | P0 |
| auth.reset | `/auth/reset-password` | `src/app/auth/reset-password/page.tsx:1` → `reset-form.tsx` | Sett nytt passord | fluid-editorial | token | error/loading (UVERIFISERT) | P1 |
| auth.check-email | `/auth/check-email` | `src/app/auth/check-email/page.tsx:1` | «Sjekk e-posten» bekreftelse | fluid-editorial | offentlig | statisk | P2 |
| auth.bankid | `/auth/bankid` | `src/app/auth/bankid/page.tsx:14` → `@/components/auth/bankid-skjerm` | BankID-innlogging | fluid-editorial | offentlig | (UVERIFISERT) | P0 |
| auth.onboarding | `/auth/onboarding` | `src/app/auth/onboarding/page.tsx:1` | Spiller-onboarding (8 steg) | wizard | auth | steg-state (UVERIFISERT) | P1 |
| auth.onboarding.forelder | `/auth/onboarding/forelder` | `src/app/auth/onboarding/forelder/page.tsx:1` | Forelder-onboarding | wizard | auth | (UVERIFISERT) | P2 |
| auth.guardian-consent | `/auth/guardian-consent/[token]` | `src/app/auth/guardian-consent/[token]/page.tsx:1` | Foreldresamtykke via token | fluid-editorial | token | (UVERIFISERT) | P1 |
| auth.samtykke-venter | `/auth/samtykke-venter` | `src/app/auth/samtykke-venter/page.tsx:1` | «Venter på samtykke» | fluid-editorial | auth | statisk | P2 |
| auth.logget-ut | `/auth/logget-ut` | `src/app/auth/logget-ut/page.tsx:1` | Bekreftet utlogget | fluid-editorial | offentlig | statisk | P2 |
| auth.inviter-forelder | `/inviter/forelder/[token]` | `src/app/inviter/forelder/[token]/page.tsx:1` | Foreldre-invitasjon via token | fluid-editorial | token | statisk | P2 |

## Elementer — `auth.login` (fullt verifisert, `login-form.tsx`)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| login.input.email | input (email) | E-post | native input | client (setEmail) | default/focus/invalid | fullbredde | `login-form.tsx:99` |
| login.input.password | input (password) | Passord | native input | client (setPassword) | default/focus/invalid | fullbredde, `pr-11` | `login-form.tsx:125` |
| login.btn.toggle-pw | icon-button | Vis/Skjul passord | native button + `Eye`/`EyeOff` | client (toggle showPassword) | default/pressed/hover/focus | absolutt h. i feltet | `login-form.tsx:139` |
| login.link.forgot | link | Glemt passordet? | next/link | route → `/auth/forgot-password` | default/hover/focus | høyrejustert | `login-form.tsx:157` |
| login.alert.error | slot (alert) | (dynamisk feiltekst) | `AthleticBadge variant=urgent` + tekst | none (vises ved error) | vises/skjult | fullbredde | `login-form.tsx:166` |
| login.btn.submit | button (submit) | Logg inn / «Logger inn…» | native button (pill, lime) | server-action: `supabase.auth.signInWithPassword` → route `next`\|`/portal` | default/disabled/loading/focus | fullbredde | `login-form.tsx:176` |
| login.btn.google | button | Fortsett med Google | native button (pill, outline) + GoogleLogo | external: `signInWithOAuth(google)` | default/disabled/loading/hover/focus | fullbredde | `login-form.tsx:195` |
| login.link.signup | link | Registrer deg | next/link | route → `/auth/signup` | default/hover/focus | sentrert | `login-form.tsx:210` |
| login.divider | slot | «eller» | span + hairlines | none | — | fullbredde | `login-form.tsx:186` |

**Verifiserte tilstander (login):** `loading` (knapp disabled + «Logger inn…», `:178/182`), `error`
(alert + `aria-invalid` på inputs, `:166`), passord vis/skjul-toggle (`:128/146`). Apple-OAuth finnes i
kode men er TODO/ubrukt (`login-form.tsx:63-80`).

> Øvrige auth-skjemaer (`signup-form`, `forgot-form`, `reset-form`, `bankid-skjerm`) er ikke åpnet i
> denne kjøringen → elementene deres er `UVERIFISERT` til de leses. Samme format som over brukes.
