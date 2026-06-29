# Auth + internal/misc — skjermkort (kode-verifisert 2026-06-29)

11 ekte auth-ruter (login/signup/BankID/glemt-passord/onboarding/foreldresamtykke) + en lang hale av internal/misc/dev-ruter (`/kommando`, `/meg`, `/onboard`, `/inviter`, `/team-gfgk`, `/dev-banekart`, `/intern/komponenter/*`, `(internal)/demos/*`). DEL 1 = fulle kort for auth. DEL 2 = tabell for resten (gjeld, ikke produkt).

**Auth-mekanisme (verifisert mot `src/proxy.ts`):** Next.js 16-proxyen (`proxy()`, ikke `middleware()`) refresher Supabase SSR-sesjonen (`updateSession`, `src/proxy.ts:105`), setter CSP-nonce, og beskytter KUN paths som starter med `/portal`, `/admin` eller `/intern` (`src/proxy.ts:107-110`) via `supabase.auth.getUser()` → uten bruker: redirect til `/auth/login?next=…` (`src/proxy.ts:130-135`). Proxyen stopper kun UAUTENTISERTE; rolle-gating skjer i RSC/layout (`src/proxy.ts:139-141`). `/auth/*` skal være offentlig (er ikke i `erBeskyttet`) — kun `auth/layout.tsx` setter `robots: noindex/nofollow` (`src/app/auth/layout.tsx:7-9`).

**Tverrgående funn (auth):**
1. **To visuelle motpoler i auth selv.** login/signup/forgot/reset deler «terminal-lys»-fasiten: mørk `.dark`-flate med inline-gradient `linear-gradient(160deg,#0A1410,#07100C)` + svakt grid + «ak»-lime-lettermerke (`login/page.tsx:14-15`, `signup/page.tsx:18-19`, `forgot-password/page.tsx:12-13`, `reset-password/page.tsx:12-13`). check-email og bankid/logget-ut bryter dette med lyst kort / cream-bakgrunn + «AK Golf»-ordmerke (`check-email/page.tsx:6-9`, `bankid/page.tsx`, `logget-ut/page.tsx`). Visuell drift.
2. **`?subscribe=` finnes IKKE** (0 treff i `src/app/auth/`). Signup leser i stedet `?epost=` → prefyller e-postfeltet (`signup/page.tsx:13-15`, `signup-form.tsx:54,61`). Gjeste-bro fra booking går via `epost`, ikke `subscribe`. Ingen `subscribe`-param droppes — den parameteren brukes ikke i auth-laget på denne branchen.
3. **Ingen e-postverifiserings-handler.** `verifyOtp` = 0 treff i hele `src/`. Signup sender Supabase-`signUp` og ruter til `/auth/check-email` (statisk «sjekk innboksen»-kort) hvis ingen session returneres (`signup-form.tsx:111-116`). Selve bekreftelses-callbacken (token-bytte) finnes ikke som egen rute her — antas håndtert av Supabase + `/api/auth/oauth-callback` (kun OAuth verifisert).
4. **COACH/ADMIN auto-rutes IKKE til `/admin`** fra `/portal`. `portal/page.tsx:18-19` redirecter PARENT → `/forelder` og GUEST → `/admin/kalender`, men COACH og ADMIN faller gjennom og lander på spiller-hjem. (Onboarding-`isComplete`-grenen ruter riktig: `onboarding/page.tsx:17`.) Sannsynlig hull — coach/admin som åpner `/portal` ser PlayerHQ-hjem i stedet for sin egen flate.
5. **`safeRedirectPath`-vern på `?next=`** brukes konsekvent i login (`login-form.tsx:40,48,68`) — ingen open-redirect.

---

## DEL 1 — Auth-ruter (fulle kort)

### /auth/login
- Fil: `src/app/auth/login/page.tsx` (form i `./login-form.tsx`) · Flate: Auth (offentlig, mørk terminal-lys) · Rolle/gating: ingen — offentlig (`auth/layout.tsx` setter kun `robots: noindex`).
- Jobb: Logge inn med e-post/passord eller Google OAuth.
- Data vist (felt → kilde): statisk hero «Tren på det du *trenger*» + undertekst (`login/page.tsx:36-41`); `?next=`-param → `safeRedirectPath(searchParams.get("next"),"/portal")` (`login-form.tsx:40`). Ingen Prisma.
- Handlinger: klient-`handleSubmit` → `supabase.auth.signInWithPassword` (`login-form.tsx:31`) → push til `next`; Google → `supabase.auth.signInWithOAuth({provider:"google"})` med `redirectTo=/api/auth/oauth-callback?next=…` (`login-form.tsx:50-54`). Apple-OAuth-funksjon finnes men er ubrukt/TODO (`login-form.tsx:63-65`). Ingen server actions. Eksterne kall: Supabase Auth (+ Google).
- Tilstander: loading (`loading`-state + Suspense `h-64`-fallback, `login/page.tsx:46`) — finnes; error (`role="alert"`, oversatt feiltekst `oversettAuthFeil`, `login-form.tsx:166-173,251-257`) — finnes; success = redirect (ingen egen UI); empty — n/a.
- Komponenter: lokal `LoginForm` (`./login-form.tsx`, håndbygd, inline `GoogleLogo`-SVG); `AthleticBadge` (`@/components/athletic/badge`). Ingen athletic-shell — alt inline.
- Flyt: inngang fra proxy-redirect (`?next=`) + «Registrer deg» (`/auth/signup`) + «Glemt passordet?» (`/auth/forgot-password`). Neste: `next`-mål (default `/portal`).
- AK-domene vist: ingen.
- Designfil-referanse: `Auth Innlogging (terminal-lys).dc.html` (page-kommentar) + `Auth Innlogging (hybrid).dc.html` (form-kommentar, `login-form.tsx:13`).
- Nåværende designkvalitet + problemer: ferdig terminal-fasit. Token-disiplin-brudd: hardkodet inline `background: linear-gradient(160deg,#0A1410,#07100C)` (`login/page.tsx:15`) + hex-fallbacks i `text-[var(--t-fg,#EAF2EC)]`/`var(--t-fg-2,#9DB0A4)` + `var(--t-line-soft,rgba(...))`. Hardkodet `rgba(0,88,64,0.10)` i focus-shadow på inputs.
- Redesign-prioritet: P3

### /auth/signup
- Fil: `src/app/auth/signup/page.tsx` (form i `./signup-form.tsx`) · Flate: Auth (offentlig, mørk terminal-lys) · Rolle/gating: ingen — offentlig.
- Jobb: Opprette konto med valg av medlemskap + rolle (spiller/foresatt).
- Data vist (felt → kilde): `?epost=`-param → `SignupForm defaultEmail` prefyller e-post (`signup/page.tsx:13-15,49`; `signup-form.tsx:61`). Pakke-/rolle-lister hardkodet i klient (`PACKAGES`/`ROLES`, `signup-form.tsx:13-52`). Ingen Prisma.
- Handlinger: klient-`handleSubmit` → validering (passord ≥ 8, like, vilkår godtatt, `signup-form.tsx:72-83`) → `supabase.auth.signUp({email,password,options.data:{role,tier:"PRO",package,monthlyCredits,firstName,lastName}})` (`signup-form.tsx:87-100`). Ved `data.session` → push `/auth/onboarding`; ellers → push `/auth/check-email` (`signup-form.tsx:111-116`). Ingen server actions. Eksternt: Supabase Auth.
- Tilstander: loading (`loading`-state, knapp «Oppretter…», `signup-form.tsx:294`) — finnes; error (`role="alert"` + `oversettAuthFeil`, `signup-form.tsx:277-284,365-373`) — finnes; success = redirect; empty — n/a.
- Komponenter: lokal `SignupForm` + intern `Felt`-helper; `AthleticButton`, `AthleticBadge`; Lucide `ArrowRight/Check/Lock/Mail/User`. Bruker Prisma-enums `UserRole`, `Tier` fra `@/generated/prisma/client`.
- Flyt: inngang fra booking-gjestebro (`?epost=`) + login «Registrer deg». Neste: `/auth/onboarding` (session) eller `/auth/check-email`.
- AK-domene vist: coaching-pakker Performance Pro (2 220 kr/4 økter) / Performance (1 200 kr/2 økter) / PlayerHQ (300 kr, «1. måned gratis») — NB: alle skrives med `tier: "PRO"` i metadata uansett pakke (`signup-form.tsx:93`). «PlayerHQ_ONLY» = app-tilgang.
- Designfil-referanse: `Auth Registrering og passord (terminal-lys).dc.html` (page-kommentar).
- Nåværende designkvalitet + problemer: ferdig, rik form (pakkevalg + rolle + samtykke). Samme terminal-fasit-hardkoding som login (inline gradient + hex-fallbacks). **Merk regel-konflikt:** pakkepris-/tier-visning er én av de fire opplåste regel-klyngene (2026-06-22) — verdiene her (2 220/1 200/300 kr) er ennå ikke bekreftet som låste.
- Redesign-prioritet: P3 (form ferdig; verifiser pris/tier-tekst mot låst beslutning)

### /auth/check-email
- Fil: `src/app/auth/check-email/page.tsx` · Flate: Auth (offentlig, LYST kort) · Rolle/gating: ingen.
- Jobb (statisk): Bekreftelses-skjerm «Sjekk innboksen din» etter signup.
- Data vist (felt → kilde): ingen — helt statisk tekst + lenker (`/auth/signup`, `/auth/login`).
- Handlinger: ingen server actions / eksterne kall. Kun `<Link>`-navigasjon.
- Tilstander: kun success-skall (statisk). loading/empty/error — MANGLER (ikke relevant; ingen data).
- Komponenter: ingen — håndbygd kort. Bruker semantiske tokens (`bg-card`, `text-muted-foreground`, `border-border`).
- Flyt: lander hit fra signup uten session (`signup-form.tsx:115`). Neste: tilbake til signup/login.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype (eldre håndbygd kort).
- Nåværende designkvalitet + problemer: ferdig men **inkonsistent** med terminal-fasiten — lyst `from-background to-secondary/40`-kort + «AK *Golf*»-ordmerke (`check-email/page.tsx:5-9`) i stedet for mørk flate + «ak»-lime-merke som login/signup. Visuell drift.
- Redesign-prioritet: P2 (bring i tråd med terminal-auth-fasiten)

### /auth/bankid
- Fil: `src/app/auth/bankid/page.tsx` · Flate: Auth (offentlig, cream) · Rolle/gating: ingen.
- Jobb (stub): Vise BankID-pålogging som visuelt skall — funksjon kommer post-BETA.
- Data vist (felt → kilde): ingen — statisk skjerm, komponent rendres med defaults (page-kommentar `bankid/page.tsx:8-9`).
- Handlinger: ingen.
- Tilstander: kun statisk start-skall — loading/empty/error MANGLER (ikke-funksjonell stub).
- Komponenter: `BankIdSkjerm` (`@/components/auth/bankid-skjerm`).
- Flyt: ingen aktiv flyt (placeholder). `metadata.description` sier «bruk e-post/passord eller Google for nå» (`bankid/page.tsx:18-19`).
- AK-domene vist: ingen.
- Designfil-referanse: `ph-auth.jsx → ABankID` (page-kommentar `bankid/page.tsx:5`).
- Nåværende designkvalitet + problemer: ferdig som placeholder. Cream-bakgrunn avviker fra login/signup mørk terminal — men bevisst stub.
- Redesign-prioritet: P3 (stub, ikke-funksjonell)

### /auth/forgot-password
- Fil: `src/app/auth/forgot-password/page.tsx` (form i `./forgot-form.tsx`) · Flate: Auth (offentlig, mørk terminal-lys) · Rolle/gating: ingen.
- Jobb: Be om passord-tilbakestillingslenke (steg 1 send e-post → steg 2 bekreftelse, begge i ForgotForm, page-kommentar `forgot-password/page.tsx:7`).
- Data vist (felt → kilde): page rendrer kun «ak»-merke + `ForgotForm`; teksten eies av formen (UVERIFISERT — form-fil ikke lest i detalj).
- Handlinger: passord-reset-utsendelse i `ForgotForm` (antatt `supabase.auth.resetPasswordForEmail`) — UVERIFISERT (form-fil ikke lest).
- Tilstander: steg 1/steg 2 nevnt i page-kommentar; konkrete loading/error-states UVERIFISERT (i form).
- Komponenter: lokal `ForgotForm` (`./forgot-form.tsx`).
- Flyt: inngang fra login «Glemt passordet?». Neste: e-post → `/auth/reset-password` (via Supabase-lenke).
- AK-domene vist: ingen.
- Designfil-referanse: samme «Auth Registrering og passord»-stil (page-kommentar).
- Nåværende designkvalitet + problemer: ferdig terminal-fasit (samme inline gradient + hex-fallbacks som login). Form-intern kvalitet UVERIFISERT.
- Redesign-prioritet: P3

### /auth/reset-password
- Fil: `src/app/auth/reset-password/page.tsx` (form i `./reset-form.tsx`) · Flate: Auth (offentlig, mørk terminal-lys) · Rolle/gating: ingen (Supabase-token i URL, håndteres i ResetForm — page-kommentar `reset-password/page.tsx:7`).
- Jobb: Sette nytt passord etter e-postlenke.
- Data vist (felt → kilde): statisk hero «Sett nytt passord» / «Velg et passord på minst 8 tegn.» (`reset-password/page.tsx:31-36`). Token leses i form (UVERIFISERT).
- Handlinger: nytt-passord-lagring i `ResetForm` (antatt `supabase.auth.updateUser`) — UVERIFISERT (form-fil ikke lest).
- Tilstander: UVERIFISERT (i form).
- Komponenter: lokal `ResetForm` (`./reset-form.tsx`).
- Flyt: lander hit via Supabase-e-postlenke fra forgot-password. Neste: login/portal (UVERIFISERT).
- AK-domene vist: ingen.
- Designfil-referanse: terminal-fasit (login/signup-stil, page-kommentar).
- Nåværende designkvalitet + problemer: ferdig terminal-fasit (samme inline-hardkoding). Form-intern UVERIFISERT.
- Redesign-prioritet: P3

### /auth/logget-ut
- Fil: `src/app/auth/logget-ut/page.tsx` · Flate: Auth (offentlig, cream v10-fasit) · Rolle/gating: ingen.
- Jobb (statisk): Bekrefte utlogging + tilbud om å logge inn igjen.
- Data vist (felt → kilde): statiske lenke-props — hjem `/`, logg inn `/auth/login`, marketing `/`, feedback `post@akgolf.no` (`logget-ut/page.tsx:26-31`). Ingen DB.
- Handlinger: ingen server actions; kun navigasjon via komponent-lenker.
- Tilstander: kun success-skall — loading/empty/error MANGLER (ikke relevant).
- Komponenter: `LoggetUtSkjerm` (`@/components/auth/logget-ut`) — v10-fasit, byttet fra håndduplikat 3. juni for å fjerne drift (page-kommentar `logget-ut/page.tsx:11-13`).
- Flyt: lander hit etter logg-ut-handling. Neste: login eller marketing.
- AK-domene vist: ingen.
- Designfil-referanse: `public/design-handover/_screens/au-loggetut.png` (v10, page-kommentar `logget-ut/page.tsx:5`).
- Nåværende designkvalitet + problemer: ferdig. Cream-bakgrunn (avvik fra mørk terminal, men dette er v10-fasit — bevisst).
- Redesign-prioritet: P3

### /auth/onboarding
- Fil: `src/app/auth/onboarding/page.tsx` (wizard i `./onboarding-wizard.tsx`, actions i `./actions.ts`) · Flate: Auth / onboarding (cream `bg-background`) · `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()` (innlogget kreves, `onboarding/page.tsx:9`). Auto-redirect ved fullført: PARENT → `/forelder`, COACH/ADMIN → `/admin`, ellers `/portal` (`onboarding/page.tsx:14-19`). PARENT (uferdig) → `/auth/onboarding/forelder` (`onboarding/page.tsx:22-24`).
- Jobb: P7 state-machine onboarding-wizard for spiller; auto-resume til riktig steg.
- Data vist (felt → kilde): `getOnboardingState(user)` + `getResumeStep(user)` (`@/lib/auth/onboarding-state`) → `initialStep` (`onboarding/page.tsx:3,26`). Wizard-data fra user-state.
- Handlinger: server actions i `./actions.ts` (skriver onboarding-fremdrift til `User.preferences` — antatt, fil ikke lest i detalj) · klient-wizard-steg i `OnboardingWizard`. Eksterne kall: ingen.
- Tilstander: resume/complete-redirect håndtert i RSC. Wizard-interne loading/empty/error UVERIFISERT (tung klientkomponent).
- Komponenter: lokal `OnboardingWizard` (`./onboarding-wizard.tsx`). Ingen mørk gradient-ramme (cream-flate, page-kommentar `onboarding/page.tsx:28-29`).
- Flyt: inngang fra signup (session) eller direkte etter innlogging. Neste: portal/admin/forelder etter fullført.
- AK-domene vist: UVERIFISERT (wizard-intern — spiller-profilsteg antatt).
- Designfil-referanse: `ph-auth.jsx → AOnboarding` (page-kommentar `onboarding/page.tsx:28`).
- Nåværende designkvalitet + problemer: ferdig fasit (wizard direkte på cream); wizard-interne states UVERIFISERT — egen gjennomgang anbefalt.
- Redesign-prioritet: P3 (verifiser wizard-intern separat)

### /auth/onboarding/forelder
- Fil: `src/app/auth/onboarding/forelder/page.tsx` (wizard i `./forelder-wizard.tsx`) · Flate: Auth / onboarding (forelder, `OnboardingShell`-ramme).
- Rolle/gating: `requirePortalUser()` (innlogget, `forelder/page.tsx:6`). Beholder `OnboardingShell` (i motsetning til spiller-onboarding som er flyttet til ren cream).
- Jobb: Onboarding-wizard for forelder-rolle.
- Data vist (felt → kilde): ingen i page — alt i `ForelderWizard` (UVERIFISERT).
- Handlinger: i `ForelderWizard` (UVERIFISERT — fil ikke lest).
- Tilstander: UVERIFISERT (wizard-intern).
- Komponenter: `OnboardingShell` (`@/components/onboarding/onboarding-shell`) + lokal `ForelderWizard` (`./forelder-wizard.tsx`).
- Flyt: inngang fra `/auth/onboarding` ved PARENT-rolle. Neste: `/forelder` (antatt).
- AK-domene vist: UVERIFISERT.
- Designfil-referanse: ingen eksplisitt (bruker delt `OnboardingShell`).
- Nåværende designkvalitet + problemer: halvferdig — bruker eldre `OnboardingShell`-ramme mens spiller-onboarding er flyttet til ny cream-fasit. Mulig drift mot ny onboarding-stil.
- Redesign-prioritet: P2

### /auth/guardian-consent/[token]
- Fil: `src/app/auth/guardian-consent/[token]/page.tsx` (form i `./guardian-consent-form.tsx`, actions i `./actions.ts`) · Flate: Auth (offentlig, token-basert, lyst kort) · `dynamic = "force-dynamic"`.
- Rolle/gating: ingen innlogging — token-validert (GDPR art. 8 / P17 foreldresamtykke, page-kommentar `guardian-consent/[token]/page.tsx:3-6`). Forelder klikker e-postlenke.
- Jobb: Forelder bekrefter samtykke for mindreårig spiller → aktiverer spiller-konto + ParentRelation.
- Data vist (felt → kilde): `prisma.parentInvitation.findUnique({where:{token},include:{player:{...}}})` (`guardian-consent/[token]/page.tsx:25-39`) → `player {name,email,dateOfBirth,requiresGuardianConsent,guardianConsentGivenAt}`; spilleralder via `calculateAge(dateOfBirth)` (`page.tsx:50`); avledet `expired`/`alreadyAccepted`/`alreadyConsented` (`page.tsx:44-48`).
- Handlinger: server actions i `./actions.ts` (samtykke-bekreftelse — skriver `guardianConsentGivenAt` + ParentRelation, antatt) kalt fra `GuardianConsentForm` · `notFound()` ved ugyldig token (`page.tsx:41`). Eksterne kall: ingen (kun Prisma).
- Tilstander: not-found (ugyldig token) — finnes; **expired**-kort (`ExpiredCard`, `page.tsx:75,139`) — finnes; **success/already-consented**-kort (`SuccessCard`, `page.tsx:77,158`) — finnes; ellers skjema. Solid state-dekning. loading — ikke relevant (server-render).
- Komponenter: lokal `GuardianConsentForm` + inline `ExpiredCard`/`SuccessCard`; Lucide `Shield/Check/AlertTriangle`. Semantiske tokens.
- Flyt: inngang fra e-postlenke. Neste: ved suksess → `/forelder` («Gå til foreldreportal», `page.tsx:170`).
- AK-domene vist: ingen golf-domene (GDPR-flyt).
- Designfil-referanse: ingen prototype (håndbygd).
- Nåværende designkvalitet + problemer: ferdig — pen, full state-dekning. Mindre: redundant inline `style={{ color: "hsl(var(--warning))" }}` på AlertTriangle som allerede har `text-warn` (`page.tsx:142-145`).
- Redesign-prioritet: P3

### /auth/samtykke-venter
- Fil: `src/app/auth/samtykke-venter/page.tsx` (klient i `./samtykke-venter-klient.tsx`) · Flate: Auth — venterom (S-13) · `dynamic = "force-dynamic"`.
- Rolle/gating: innlogget kreves via `getCurrentUserRaw()` (IKKE `getCurrentUser` — ville loopet hit, page-kommentar `samtykke-venter/page.tsx:22-24`). Redirect: ikke innlogget → `/auth/login`; samtykke gitt → `/forelder`·`/admin`·`/portal` etter rolle (`page.tsx:28-35`).
- Jobb: Vise venterom + resend-invitasjon + logg ut for mindreårig spiller som venter på foreldresamtykke.
- Data vist (felt → kilde): `user.name`; siste aktive `prisma.parentInvitation.findFirst({playerId,acceptedAt:null,expiresAt>now})` → `email` (`page.tsx:38-46`).
- Handlinger: redirect-greining via `isAwaitingGuardianConsent(user)` i RSC (`page.tsx:31`). Resend/logg-ut-handlinger i `SamtykkeVenterKlient` (UVERIFISERT — fil ikke lest). Eksterne kall: ingen (Prisma).
- Tilstander: redirect-greining i RSC; klient-interne states UVERIFISERT.
- Komponenter: lokal `SamtykkeVenterKlient` (`./samtykke-venter-klient.tsx`).
- Flyt: lander hit via `requirePortalUser`-gaten når `requiresGuardianConsent && !guardianConsentGivenAt`. Neste: portal/forelder/admin når samtykke gitt.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet + problemer: UVERIFISERT visuelt (rendres i klient-komponent, ikke lest). Logikk-laget ferdig.
- Redesign-prioritet: P2 (verifiser klient-komponent for visuell kvalitet)

---

## DEL 2 — Internal / misc / dev (gjeld, ikke produkt)

> Disse er ikke fulle skjermkort. Felles: ingen er produkt-flater for sluttbruker — de er kommandosenter (`/kommando`), assistent-dashbord (`/meg`), onboarding-spor (`/onboard`), token-accept (`/inviter`), offentlig deck (`/team-gfgk`), dev-verktøy (`/dev-banekart`) og mock-galleri/demoer (`/intern`, `(internal)`).
>
> **Gating-status verifisert på branch `docs/design-inventar`:** `/intern` ER proxy-beskyttet (krever innlogget, `src/proxy.ts:110`) men har **ingen `intern/layout.tsx`** og **ingen rolle-gate** i `intern/komponenter/page.tsx` — enhver innlogget bruker når galleriet. `(internal)/layout.tsx` er ADMIN-only (`requirePortalUser({allow:["ADMIN"]})`, `(internal)/layout.tsx:15`). **`/dev-banekart` har INGEN gate i det hele tatt** (ikke proxy-beskyttet, ingen RSC-guard, ingen env-sjekk — `dev-banekart/page.tsx`). Den «gating på annen branch» som ble nevnt har IKKE landet her: dev-banekart + /intern er fortsatt ugated/under-gated på denne branchen.

| Rute | Fil | Formål | Anbefaling |
|---|---|---|---|
| `/kommando` | `src/app/kommando/page.tsx` | AK Agency OS kommandosenter-dashboard (KPI + AI-agenter + I dag + oppgaver), ekte DB-data | behold (ADMIN-gated i `kommando/layout.tsx` via `canAccessMissionControl()` → ellers `redirect("/")`) |
| `/kommando/agenter` | `src/app/kommando/agenter/page.tsx` | AI-chat mot 4 modeller, ny `conversationId` per besøk | behold (ADMIN-gated, layout) |
| `/kommando/kalender` | `src/app/kommando/kalender/page.tsx` | Måneds-/uke-kalender med ekte bookinger + oppgavefrister | behold (ADMIN-gated) |
| `/kommando/oppgaver` | `src/app/kommando/oppgaver/page.tsx` | Brukerens oppgaver koblet til prosjekter | behold (ADMIN-gated) |
| `/kommando/prosjekter` | `src/app/kommando/prosjekter/page.tsx` | Prosjektliste med oppgavetelling | behold (ADMIN-gated) |
| `/kommando/team` | `src/app/kommando/team/page.tsx` | Agent-team (sekvensielle AI-kjøringer), siste 10 runs | behold (ADMIN-gated) |
| `/meg` | `src/app/meg/page.tsx` | Telegram-assistent-dashboard (brief/BEKREFT/logg), ekte data | behold — men gate ligger i page (`getCurrentUser` + `role!=="ADMIN"` → `notFound()`), IKKE i `meg/layout.tsx`. Eksplisitt v1, venter på Claude Design-runde |
| `/onboard/coach` | `src/app/onboard/coach/page.tsx` | 4-stegs coach-onboarding, resume fra `preferences` | behold (gated `requirePortalUser({allow:["COACH","ADMIN"]})`; ferdig → `/admin`). Rydd «Coach HQ»-kommentar |
| `/onboard/klubb` | `src/app/onboard/klubb/page.tsx` | 5-stegs klubb-onboarding | behold (gated `requirePortalUser({allow:["ADMIN","COACH"]})`; ferdig → `/admin`). IKKE proxy-beskyttet — gate i page |
| `/inviter/forelder/[token]` | `src/app/inviter/forelder/[token]/page.tsx` | Offentlig accept-side for forelder-invitasjon (`parentInvitation.findUnique`, status: ugyldig/brukt/utløpt/ok) | behold, men **harmoniser** med `/auth/guardian-consent/[token]` — to forelder-flater med ulik visuell tyngde. IKKE proxy-beskyttet (token-validert) |
| `/team-gfgk` | `src/app/team-gfgk/page.tsx` | Offentlig statisk slide-deck for GFGK-foreldremøte (egen `deck.css`, snapshot golf-data) | behold (bevisst offentlig, `robots: noindex` i layout) — men verifiser at golf-data er brutto. Lever utenfor designsystem (`deck.css`) |
| `/dev-banekart` | `src/app/dev-banekart/page.tsx` | Midlertidig dev-verktøy: verifiser banekart-rendering Onsøy GK (`prisma.bane` + holes + geojson) | **gate eller slett** — offentlig uautentisert dev-rute i prod-bygg (ingen gate på denne branchen). Page-kommentar sier «slett når `/portal/baneguide/[baneId]` er portet» |
| `/intern/komponenter` | `src/app/intern/komponenter/page.tsx` | Indeks over 7 komponent-verifiseringsdemoer (mock) | **gate (rolle) eller fjern** før lansering — kun proxy-auth, ingen rolle-gate; galleri-tekst sier selv «fjernes eller gates før launch» |
| `/intern/komponenter/agency-kit` | `…/agency-kit/page.tsx` | Demo: AgencySidebar + DataTable + indicators (mock) | gate/fjern (intern, ikke redesign-mål) |
| `/intern/komponenter/daglig-brief` | `…/daglig-brief/page.tsx` | Demo: 3-kol AgencyOS-dashboard mot preview-PNG (mock) | gate/fjern |
| `/intern/komponenter/forelder` | `…/forelder/page.tsx` | Demo: MinorGate/ApprovalCard/MessageComposer (mock). Bruker forbudt demo-navn «Coach Andreas» | gate/fjern + rydd navn |
| `/intern/komponenter/hull-analyse` | `…/hull-analyse/page.tsx` | Demo: top-down hull-kart med kategori-markører (PlayerHQ) | gate/fjern |
| `/intern/komponenter/inbox-tester` | `…/inbox-tester/page.tsx` | Demo: FilterPillBar + Inbox-kit + TestMatrix (mock) | gate/fjern |
| `/intern/komponenter/spiller-panel` | `…/spiller-panel/page.tsx` | Demo: 400px PlayerDetailPanel (mock Øyvind Rohjan) | gate/fjern |
| `/intern/komponenter/team-bookinger` | `…/team-bookinger/page.tsx` | Demo: TeamRosterList/PlanMalCard/InlineBookingForm (mock). Bruker forbudt navn «Andreas Kragerud» | gate/fjern + rydd navn |
| `/demos/plan-bygger` | `src/app/(internal)/demos/plan-bygger/page.tsx` | Pilot: AgencyOS plan-bygger steg 4 (pyramide-allokering, 100% mock) | **port til Workbench / avvikle** — bygget fra FORBUDT `wireframe/design-files-v2/` + hardkodet hex. ADMIN-gated (gruppe-layout) |
| `/demos/plan-bygger/[steg]` | `src/app/(internal)/demos/plan-bygger/[steg]/page.tsx` | Pilot: full 6-stegs plan-bygger-wizard (1444 linjer, mock) | port til Workbench / avvikle (forbudt kilde) |
| `/demos/newplan/[steg]` | `src/app/(internal)/demos/newplan/[steg]/page.tsx` | Pilot: NewPlan modal-flyt 4 steg (823 linjer, mock) | avvikle (forbudt kilde) |
| `/demos/ny-okt/[steg]` | `src/app/(internal)/demos/ny-okt/[steg]/page.tsx` | Pilot: PlayerHQ ny-økt-wizard 6 steg (983 linjer, mock) | avvikle (forbudt kilde) |
| `/demos/trackman-import/[steg]` | `src/app/(internal)/demos/trackman-import/[steg]/page.tsx` | Pilot: TrackMan-import 3-stegs modal (421 linjer) | avvikle (forbudt kilde) |
| `/design-system` | `src/app/(internal)/design-system/page.tsx` | Designsystem-dokumentasjon v1 (tokens + komponenter) | behold (ADMIN-gated verktøy, er selv referansen) |
| `/design-system-v2` | `src/app/(internal)/design-system-v2/page.tsx` | Designsystem V2-galleri (25 komponenter, migrasjons-fasit) | behold (ADMIN-gated verktøy) |
