# Vedlegg 04 — Kartlegging: Foreldreportal + Auth + Live Session + diverse

> Detaljert Del 1-rutetabell. Hører til [docs/ux-arkitektur.md](../ux-arkitektur.md). Trykk telt i
> faktisk kode (knapper / `Link href`).

---

## A) Live Session (isolert fullskjerm, `portal/(fullscreen)/*`)

**Strukturfunn — to parallelle spiller-live-implementasjoner på samme URL-tre:**
1. **Monolitt** — `live/[sessionId]/page.tsx` → `live-shell.tsx` (1755 linjer, alt-i-én `useReducer`).
   **Dette treffer entry-knappene** (`/portal/live/[id]`-rot).
2. **Rute-splittet** — `/brief`, `/active`, `/logger`, `/summary` (egne pages) med `loadLiveSession`,
   `liveSnapshot`-autosave og `actions.ts` (start/pause/resume/abandon/complete). Den nyere,
   status-bevisste varianten — men praktisk talt foreldreløs (entry-lenker peker på roten).

| Rute | Ene jobb | Primærhandling | Trykk fra inngang | Auth | Datakilder |
|---|---|---|---|---|---|
| `live/[sessionId]/page.tsx` (+`live-shell`) | Kjør hele økta intro→summary i én flate | Start økt / Logg rep | 2 | PLAYER/COACH/ADMIN, blokk GRATIS | trainingPlanSession+drills |
| `live/[sessionId]/brief` | Pre-økt brief + «fortsett pågående» | Start | (intern) | samme | loadLiveSession |
| `live/[sessionId]/active`+`/logger` | Rep-logging (deler `LiveActive`) | Logg rep | — | samme | loadLiveSession |
| `live/[sessionId]/summary` | Oppsummering + feedback | Lagre/avslutt | — | samme | loadLiveSession |
| `live/[sessionId]/tapper` | Minimal tap-logg på range | Tap | egen inngang (**foreldreløs**) | samme | trainingPlanSession |
| `(fullscreen)/tren/page.tsx` | Workbench (planlegging) | — | — | requirePortalUser | — |
| `test/[testId]/live`+`/summary` | Live test-scoring | (mockup) | 1 | **INGEN auth-guard** | **statisk mockup** |
| `admin/live/[sessionId]/{brief,active,summary}` | Coach følger økt i sanntid | Send melding | (fra spiller-detalj) | COACH/ADMIN | `trainingSessionV2` (Spor B) |

**Live-state (`actions.ts`):** `SessionStatus` = `PLANNED·ACTIVE·PAUSED·COMPLETED·ABANDONED·SKIPPED·
CANCELLED`. `startSession()` håndterer alle eksplisitt: PLANNED→ACTIVE (init snapshot), PAUSED→{paused},
COMPLETED→`/summary`, ABANDONED→`/brief?avbrutt=1` (toast), SKIPPED/CANCELLED→`/portal/tren`.
`pause/resume` lagrer/leser `liveSnapshot`; `abandon` fryser delvis logg atomisk (`$transaction`). **Solid.**

**MEN monolitten ignorerer dette:** pause er kun klient-state (`TOGGLE_PAUSE`, `live-shell.tsx:199`),
kaller aldri `pauseLiveSession`/`abandonLiveSession`. «Avbryt»/«Avslutt» = `<Link href="/portal/tren">`
(linje 541) — ingen ABANDONED-skriving. Lukker du fanen i ACTIVE henger status ACTIVE for alltid.
Offline-banner er kosmetisk.

**Live-isolasjon:** Spiller-live ER isolert (`(fullscreen)/layout.tsx` = ren `min-h-dvh` uten chrome).
**ALDRI konsolider inn i annen skjerm.** Coach-live (`admin/live/*`) kjører i AdminShell, Spor B,
read-only — bevisst separat spor.

---

## B) Foreldreportal (`forelder/*`) — gate PARENT

Nav: `forelder/sidebar.tsx` (10 oppføringer). Inngang = `/forelder` (0 trykk).

| Rute | Ene jobb | Primærhandling | Trykk | Datakilder | Nav ut |
|---|---|---|---|---|---|
| `/forelder` | Barnets status + kommende økter/bookinger | (innsyn) | **0** | hentForelderOversikt (logCount, booking, økter, payment) | barn, bookinger |
| `/forelder/barn`(+`/[childId]`) | Velg/se barn-detalj | Åpne barn | 1 | child-relasjoner | barn-detalj |
| `/forelder/bookinger` | Barnets bookinger | — | 1 | booking | — |
| `/forelder/okonomi` | **Sammendrag** abonnement+utestående | — | 1 | subscription+payment | fakturaer |
| `/forelder/fakturaer` | **Full** betalingshistorikk | — | 1 | payment | — |
| `/forelder/coach` | Barnets coach + kontakt | — | 1 | coach-relasjon | — |
| `/forelder/ukerapport` | Ukentlig rapport | — | 1 | logger | — |
| `/forelder/varsler` | Varsler | — | 1 | notifications | — |
| `/forelder/samtykke` | GDPR-samtykke | Godkjenn | 1 | consent | — |
| `/forelder/innstillinger` | Innstillinger | — | 1 | user | — |

**Funn:** Sunnest av alle overflater. Neste-økt synlig på **0 trykk** (`oversikt.tsx:335`). Tom-state
finnes (`fokusBarn:null`). `okonomi`/`fakturaer` er bevisst sammendrag+full (ikke dublett, men kan slås
til fane-flate — D9). **Ingen Stripe-handling i forelder** — kun lesevisning.

---

## C) Auth / Onboarding / Stripe

| Rute | Ene jobb | Primærhandling | Auth | Nav ut |
|---|---|---|---|---|
| `/auth/{login,signup,forgot-password,reset-password,check-email}` | Standard auth | Logg inn/Send | åpen | onboarding/portal |
| `/auth/onboarding` | 7-stegs spiller-onboarding (state-maskin) | Neste | requirePortalUser | `/portal` (rolle-basert) |
| `/auth/onboarding/forelder` | Forelder-onboarding | Neste | PARENT-redirect | `/forelder` |
| `/auth/guardian-consent/[token]` | Verge godkjenner mindreårig | Godkjenn | token | samtykke-venter |
| `/auth/samtykke-venter` | Mindreårig venter på verge | (poll) | innlogget | portal når godkjent |
| `/auth/{bankid,logget-ut}` | BankID / utlogget | — | åpen | login |
| `/onboard/{coach,klubb}`, `/inviter/forelder/[token]` | Invitasjons-onboarding | Godta | token | respektiv portal |

**Stripe — to separate flyter:**
- **Abonnement** (`api/stripe/checkout/route.ts`): innlogget bruker, `mode:"subscription"`,
  success→`/portal/meg/abonnement?ok=1`, **cancel→`/coaching?cancelled=1`** (marketing — funn D).
- **Booking (gjest)** (`(marketing)/booking/[slug]/bekreft/actions.ts:117`): `mode:"payment"`,
  gjestebooking (ingen konto), success→`/booking/kvittering/[bookingId]`, cancel→`/booking/[slug]`.
  Feil: `setError` inline i `bekreft-form.tsx:58`; kvittering har `pending-refresh` som poller til
  webhook setter CONFIRMED.
- **Webhook** (`api/stripe/webhook/route.ts`): booking-mode → CONFIRMED synkront; subscription-mode →
  status→tier+credits.

**Onboarding-redirect** (`onboarding/page.tsx:14`): ferdig→rolle-basert. 7 steg (fasit har 5 — bevisst).

---

## D) Diverse topp-ruter

| Rute | Ene jobb | Auth | Flagg |
|---|---|---|---|
| `/meg`(+`layout`) | Personlig assistent-dashboard (Anders) | `page.tsx` gater ADMIN via `notFound` | `layout.tsx` har INGEN gate (kun page). Separat fra `/portal/meg`. |
| `/team-gfgk` | Statisk GFGK-presentasjon | **INGEN auth** | Public. Bør verifiseres/gates (D10). |
| `/offline` | PWA offline-fallback | ingen | OK |
| `/intern/komponenter/*` (7) | Komponent-galleri (mock) | **INGEN auth** | Egen kommentar: «bør gates eller fjernes». **Publikt tilgjengelig (D10).** |
| `/(internal)/*` (demos, design-system) | Dev-demoer | **ADMIN-gated** + dev-banner | Riktig gated ✓ |

---

## Del 2-flytene (denne overflatens bidrag)

### Spiller live: app-åpning → start dagens økt = **2 trykk ✓**; logg ett resultat = **1 ✓**
```
/portal [Start dagens økt] → LIVE INTRO [Start økt/Space] → ACTIVE [Logg rep]=+1
FEILVEI tom plan: «Ingen drills» + tilbake ✓ | GRATIS: redirect abonnement ✓
FEILVEI PAUSED/avbrutt: rute-splittet HAR håndtering ✓; MONOLITT (hovedinngang) IKKE ✗
  (gjenåpning PAUSED: resumeLiveSession kun i rute-splittet flyt)
```
Inngangs-inkonsistens: Gjennomføre-fanens `startHref`=`/portal/gjennomfore/[id]` (ekstra hopp) vs
hjemmets direkte `/portal/live/[id]`.

### Forelder: innlogging → barnets neste økt = **0 trykk ✓**
```
LOGIN→(PARENT)→/forelder: KPI + «Kommende» synlig umiddelbart ✓
FEILVEI ikke PARENT: rolle-redirect ✓ | mindreårig: samtykke-venter ✓ | ingen barn: fokusBarn:null ✓
```

### Besøkende: landing → betalt booking = **4 app-skjermer ✓** (+ Stripe-side)
```
/booking → /booking/[slug] → /booking/[slug]/bekreft → [Betal]→Stripe → /booking/kvittering/[id]
FEILVEI feilet betaling: cancel_url→/booking/[slug] ✓; inline-feil ✓
MANGLER: gjestebooking lager ingen konto → kvittering lenker /portal/meg/bookinger (login-vegg) ✗
```

---

## Prod-flagg (umiddelbar oppmerksomhet)
1. `intern/komponenter/*` + `team-gfgk` mangler auth-gate.
2. `test/[testId]/live` er mockup uten data/auth, men lenket i prod.
3. Monolitt-live setter aldri ABANDONED → hengende ACTIVE-økter i DB.
