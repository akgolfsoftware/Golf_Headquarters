# Audit Marketing + Forelder + Auth + Onboard + Internal — 2026-05-24

## Partisjon
Marketing + Forelder + Auth (m/onboarding + guardian-consent) + Internal + Legal (under marketing) + Inviter + Demo + Rot

> Merknad: Det finnes ingen separat `(legal)`-rute-gruppe. Personvern/vilkar/cookies ligger under `(marketing)` (samme layout). Det finnes heller ingen toppnivå `onboard/`, `login/` eller `signup/` — alt onboard-/auth-arbeid skjer under `src/app/auth/*`.

## Sammendrag
- Totalt utenom demo: 41
- OK: 23
- Mock/Bug/Mangler: 8
- Form/Action: 7
- Internt: 3
- Rot/Feilside: 3
- Demo-ruter (listet, ikke statusaudit): ~190

## Topp 10 prioriterte fixes

1. `auth/samtykke-venter/samtykke-venter-klient.tsx` — komplett inline-hex (#FAFAF7, #FFFFFF, #005840, #D1F843, #B8852A, #5E5C57, etc.). Skal bruke tokens.
2. `auth/guardian-consent/[token]/page.tsx` linje 67-69 — inline `Instrument Serif`-font og `color: "#005840"`. Strider mot CLAUDE.md (kun 3 fonter tillatt) og token-regelen.
3. `forelder/page.tsx` linje 369, 376-380 — `shadow-[...rgba(0,88,64,0.18)]` og inline `Instrument Serif` + hex `#005840` i ForelderHero.
4. `auth/login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `check-email/page.tsx` — mangler `export const metadata`. Auth-sider bør i det minste ha `<title>` + `robots: noindex`.
5. `forelder/coach/page.tsx` — mock-meldinger (MOCK_MELDINGER); ingen DB-kobling. Markert mock.
6. `forelder/bookinger/page.tsx` — MOCK_BOOKINGER, ingen DB-kobling.
7. `forelder/okonomi/page.tsx` — MOCK_FAKTURAER, ingen DB-kobling.
8. `forelder/innstillinger/page.tsx` — mock-state, ikke koblet til varslings-preferanser.
9. `(marketing)/booking/[slug]/bekreft/page.tsx` — mangler `generateMetadata`; bør ha `robots: noindex`.
10. `inviter/forelder/[token]/page.tsx` — mangler metadata + `robots: noindex` (token-side, skal ikke indekseres).

## Per rute (gruppert etter område)

### Marketing (akgolf.no — bruker `(marketing)/layout.tsx`)
| Rute | Status | Layout/Shell | SEO | Merknader |
|---|---|---|---|---|
| `/` | OK | marketing | Ja | Brand-gradient (tillatt) |
| `/anlegg` | OK | marketing | Ja | — |
| `/anlegg/[slug]` | OK | marketing | Ja (statisk title) | Brand-gradient |
| `/blogg` | OK | marketing | Ja | — |
| `/blogg/[slug]` | OK | marketing | Ja (generateMetadata) | static params |
| `/booking` | OK | marketing | Ja | — |
| `/booking/[slug]` | OK | marketing | Ja (generateMetadata) | BOOKING_ACTIVE-flag |
| `/booking/[slug]/bekreft` | Bug | marketing | Mangler | Ingen metadata |
| `/booking/kvittering/[bookingId]` | OK | marketing | Ja (noindex) | — |
| `/cases` | OK | marketing | Ja | — |
| `/coacher` | OK | marketing | Ja | — |
| `/coacher/[slug]` | OK | marketing | Ja (statisk) | — |
| `/coaching` | OK | marketing | Ja | — |
| `/cookies` | OK | marketing (legal) | Ja | — |
| `/faq` | OK | marketing | Ja | — |
| `/jobb` | OK | marketing | Ja | — |
| `/junior` | OK | marketing | Ja | — |
| `/kontakt` | OK | marketing | Ja | Form-rute |
| `/om-oss` | OK | marketing | Ja | — |
| `/personvern` | OK | marketing (legal) | Ja | — |
| `/playerhq` | OK | marketing | Ja | — |
| `/priser` | OK | marketing | Ja | — |
| `/suksess` | OK | marketing | Ja | — |
| `/treningsfilosofi` | OK | marketing | Ja | — |
| `/turneringer` | OK | marketing | Ja (canonical) | ISR 30 min |
| `/turneringer/[slug]` | OK | marketing | Ja (generateMetadata) | ISR 15 min |
| `/vilkar` | OK | marketing (legal) | Ja | — |

### Forelder-portal (egen layout, krever PARENT)
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/forelder` | Bug | forelder-layout | Inline `Instrument Serif`-font, hex `#005840` |
| `/forelder/barn` | OK | forelder-layout | DB-koblet |
| `/forelder/barn/[childId]` | OK | forelder-layout | DB-koblet |
| `/forelder/bookinger` | Mock | forelder-layout | MOCK_BOOKINGER |
| `/forelder/coach` | Mock | forelder-layout | MOCK_MELDINGER |
| `/forelder/fakturaer` | OK | forelder-layout | DB-koblet |
| `/forelder/innstillinger` | Mock | forelder-layout | Mangler DB-binding |
| `/forelder/okonomi` | Mock | forelder-layout | MOCK_FAKTURAER |
| `/forelder/samtykke` | Form | forelder-layout | Server action |
| `/forelder/ukerapport` | OK | forelder-layout | Aggregert mock til WeeklyReport finnes |
| `/forelder/varsler` | OK | forelder-layout | Read-mode, prefs i Spor 1 |

### Auth (innlogging, glemt-passord, samtykke, onboarding)
| Rute | Status | Shell | SEO | Merknader |
|---|---|---|---|---|
| `/auth/login` | Form | Ingen layout, center-shell | Mangler | — |
| `/auth/signup` | Form | Ingen layout, center-shell | Mangler | "AK Golf"-tekstlogo i header |
| `/auth/forgot-password` | Form | Ingen layout, center-shell | Mangler | — |
| `/auth/reset-password` | Form | Ingen layout, center-shell | Mangler | — |
| `/auth/check-email` | OK | Ingen layout | Mangler | "AK Golf"-tekstlogo |
| `/auth/onboarding` | Redirect/Wizard | OnboardingShell | dynamic | — |
| `/auth/onboarding/forelder` | Wizard | OnboardingShell | — | SVG inneholder hex (akseptabelt i SVG-asset) |
| `/auth/guardian-consent/[token]` | Bug | Ingen | Mangler | Hex `#005840`, Instrument Serif inline, `AK GOLF · FORELDRESAMTYKKE` (tekst-eyebrow, ikke logo — OK-mønster) |
| `/auth/samtykke-venter` | Bug | Klient | Mangler | Hel side bygd med inline hex-styles |

### Onboard
Ingen separat `src/app/onboard/*`. Onboarding ligger under `src/app/auth/onboarding/*` (over).

### Internal (designsystem og demoer)
| Rute | Status | Merknader |
|---|---|---|
| `/design-system` | Internt | Mangler auth-gate |
| `/detail-pattern-demo` | Internt | Mal for detalj-sider |

### Legal
Ingen separat `(legal)`-mappe. Personvern/Vilkar/Cookies ligger under `(marketing)` (samme footer/header). Markert som OK i Marketing-tabellen.

### Inviter (forelder-invitasjoner)
| Rute | Status | Merknader |
|---|---|---|
| `/inviter/forelder/[token]` | Form | Mangler metadata + noindex |

### Demo-ruter
~190 demo-sider funnet (top-level `*-demo`-mapper). Ikke statusaudit. Liste:

`360-demo, agent-feedback-demo, agent-pipeline-overview-demo, ai-plan-demo, akgolf-anlegg-demo, akgolf-anlegg-detalj-demo, akgolf-bedrift-demo, akgolf-blogg-demo, akgolf-blogg-post-demo, akgolf-coach-profil-demo, akgolf-coacher-demo, akgolf-cookies-demo, akgolf-faq-demo, akgolf-forside-demo, akgolf-junior-demo, akgolf-kontakt-demo, akgolf-mulligan-demo, akgolf-om-demo, akgolf-personvern-demo, akgolf-priser-demo, akgolf-suksess-demo, akgolf-tjenester-demo, akgolf-vilkar-demo, akgolf-wang-demo, analytics-v2-dark-demo, analytics-v2-demo, auth-bankid-demo, auth-glemt-demo, auth-logget-ut-demo, auth-login-demo, auth-org-demo, avatar-upload-demo, baner-demo, book-session-*-demo (8), booking-*-demo (10), bookinger-demo, bulk-approve-demo, cbac-matrise-demo, challenge-detail-demo, coach-*-demo (5), coachhq-*-demo (7), coaching-*-demo (3), comparison-demo, daglig-brief-*-demo (2), design-tokens-demo, drill-challenge-*-demo (7), edge-*-demo (6), editplan-demo, elever-demo, email-templates-demo, facility-detail-*-demo (4), fasiliteter-*-demo (2), foreldre-*-demo (5), godkjenninger-demo, grupper-demo, innstillings-layout-demo, kalender-*-demo (3), kapasitet-*-demo (2), klubb-*-demo (6), lag-snitt-demo, leaderboard-*-demo (3), live-*-demo (20+), lokasjoner-demo, mal-detalj-demo, meldinger-demo, message-detail-*-demo (7), newplan-demo, notater-detalj-demo, notif-taksonomi-demo, notification-*-demo (6), ny-okt-demo, okter-demo, onboarding-*-demo (5), onskeligokt-demo, oppfolgingsko-demo, payment-*-demo (6), periodiserings-agent-demo, plan-*-demo (9), playerhq-*-demo (10), rapporter-*-demo (2), reschedule-*-demo (4), revisjonslogg-*-demo (2), round-detail-demo, round-insight-demo, sesjon-opptak-demo, settings-*-demo (4), spiller-detalj-light-demo, talent-*-demo (12), team-demo, teknisk-plan-demo, template-selector-demo, test-detalj-demo, tilgang-demo, tilstander-demo, tjenester-demo, trackman-demo, trackman-import-demo, tren-kalender-demo, treningsdetalj-demo, treningsplaner-demo, turneringer-demo, video-upload-*-demo (5)`

Anbefaling: flytte alle demo-ruter under en `(internal)/demos/`-gruppe og auth-gate dem før produksjon.

### Rot (page.tsx, error.tsx, not-found.tsx)
| Rute | Status | Merknader |
|---|---|---|
| `/` (rot) | Redirect (via marketing-gruppe) | `(marketing)/page.tsx` er det effektive rot-view |
| `error.tsx` | OK | Bruker tokens, ingen hex |
| `not-found.tsx` | OK | Har metadata, bruker tokens |

---

## Tverrgående funn

### Hardkodet hex / inline-styles utenfor tokens
- **Verste:** `auth/samtykke-venter/samtykke-venter-klient.tsx` — hele filen er inline `style={{...}}` med hex (`#FAFAF7`, `#FFFFFF`, `#E5E3DD`, `#005840`, `#D1F843`, `#B8852A`, `#5E5C57`, `#0A1F17`, `#9C9990`, `#2C7D52`, `#A32D2D`). Bør re-skrives med Tailwind + tokens.
- **`auth/guardian-consent/[token]/page.tsx`:** linje 67-69 (Instrument Serif + `#005840`), linje 152 (`#B8852A`).
- **`forelder/page.tsx`:** linje 369 (shadow rgba), 376-380 (Instrument Serif + `#005840`).
- **`auth/login/login-form.tsx`:** Google-knapp SVG har `#4285F4` / `#34A853` (akseptabelt for Google-merket).
- **`auth/onboarding/forelder/forelder-wizard.tsx`:** SVG-faktura-mockup med `#D1F843`-fill og `AK GOLF · FAKTURA`-tekst (mockup, akseptabelt).
- **`auth/onboarding/actions.ts` + `(marketing)/kontakt/actions.ts`:** Inline-hex i HTML-emails (akseptabelt — email-klienter støtter ikke CSS-variabler).
- **Marketing brand-gradienter:** rgba med `#D1F843`/`#005840` i hero-seksjoner — eksplisitt tillatt av CLAUDE.md.

### Fonter
- Brudd: Inline `'Instrument Serif', serif` i `forelder/page.tsx` og `auth/guardian-consent/[token]/page.tsx`. CLAUDE.md tillater kun 3 fonter (Inter / Inter Tight / JetBrains Mono).

### "AK GOLF"-tekst
- `auth/guardian-consent/[token]/page.tsx` linje 60: `AK GOLF · FORELDRESAMTYKKE` — eyebrow-mønster (akseptabelt da det ikke er logo-erstatning).
- `auth/onboarding/forelder/forelder-wizard.tsx`: SVG-mockup, akseptabelt.
- `auth/signup/page.tsx`, `auth/check-email/page.tsx`: tekstlogo `AK Golf` i header — ikke "AK GOLF" (lowercase med italic), avviker fra plattform-mønsteret (logo + SidebarBrand) men er konsistent for auth-skjermer.

### SEO-mangler (auth + inviter)
- Auth-sider mangler `metadata`-eksport: `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/check-email`, `/auth/onboarding`, `/auth/onboarding/forelder`, `/auth/guardian-consent/[token]`, `/auth/samtykke-venter`.
- Token-/skjema-sider bør ha `robots: { index: false, follow: false }`.
- Bekreft-siden under booking (`/booking/[slug]/bekreft`) mangler metadata.
- Inviter-siden (`/inviter/forelder/[token]`) mangler metadata + noindex.

### Mock-data i forelder-portalen
Fire av elleve forelder-ruter er mock: `/forelder/coach`, `/forelder/bookinger`, `/forelder/okonomi`, `/forelder/innstillinger`. Resten er DB-koblet.

### Lucide-bruk
Konsistent gjennomgående. Ingen Heroicons/Phosphor/React Icons funnet.

### Norsk bokmål
Konsistent æ/ø/å. Engelske termer (`Performance`, `PRO`, `Pro`, `head coach`) brukes som etablerte produktnavn — OK.

### Forbudte komponenter
Ingen `CoachhqStubsShell` eller `Coming soon`-stubs funnet i partisjonen.
