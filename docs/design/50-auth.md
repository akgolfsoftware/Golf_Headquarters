# Auth + topp-nivå-flater — skjermkort (kode-verifisert 2026-06-29)

35 ruter på tvers av sterkt blandede temaer: 11 auth-ruter (login/signup/BankID/glemt-passord/onboarding/foreldresamtykke), 6 `/kommando`-ruter (personlig AI-kommandosenter, ADMIN-only), 1 `/meg` (Telegram-assistent-dashboard), 2 `/onboard`-ruter (coach/klubb), 1 `/inviter`-rute, 1 `/team-gfgk` (offentlig foreldremøte-deck), 1 `/dev-banekart` (midlertidig dev-verktøy), 7 `/intern/komponenter`-demoer (mock-galleri) og 6 `(internal)`-demoer + 2 design-system-sider.

Dominerende mønster: to motpoler. Auth-flatene er ferdig-portede «terminal-lys»-fasiter (mørk forest-gradient, lime «ak»-merke). Alt under `/intern` og `(internal)` er **mock-data-pilotskjermer/komponentgallerier bygget fra arkiverte `wireframe/design-files-v2/`-kilder** (eksplisitt forbudt design-kilde per `design-porting-gate.md`) — disse er teknisk gjeld og bør gates/fjernes/ports før lansering.

**VIKTIG auth-mekanisme (verifisert mot `src/proxy.ts`):** Proxy-en (Next.js 16, kjører `proxy()` ikke `middleware()`) beskytter KUN `/portal`, `/admin`, `/intern` (linje 107-110) via Supabase `getUser()`. **Den beskytter IKKE** `/kommando`, `/meg`, `/onboard`, `/inviter`, `/team-gfgk`, `/dev-banekart`, `/auth/*` eller `(internal)`-gruppen. Disse må gate i RSC/layout selv (de fleste gjør det) — unntak: `/team-gfgk` og `/dev-banekart` er reelt offentlige; `/auth/*` skal være offentlige. Rolle-gate for `/intern` og `(internal)` skjer i `(internal)/layout.tsx` (ADMIN-only via `requirePortalUser`), IKKE i proxy-en (proxy stopper kun uautentiserte).

---

## Auth-flater

### /auth/login
- Fil: `src/app/auth/login/page.tsx` (form i `./login-form.tsx`)
- Flate: Auth (offentlig)
- Rolle/gating: Ingen — offentlig. `auth/layout.tsx` setter kun `robots: noindex`.
- Jobb: Logge inn med e-post/passord eller Google OAuth.
- Data vist: Statisk hero-tekst; `?next=`-param leses i LoginForm (UVERIFISERT detalj — ikke lest form-fil).
- Komponenter: Lokal `LoginForm` (Suspense-wrappet). Ingen athletic-komponenter — alt håndbygd inline.
- Layout og hierarki: Sentrert `max-w-[400px]`-kolonne. «ak»-lettermerke (lime) → hero «Tren på det du *trenger*» → undertekst → skjema rett på flaten (ingen kort). Primær CTA i LoginForm.
- Tilstander: loading via Suspense-fallback (`h-64`-blokk). Empty/error/success ligger i LoginForm (UVERIFISERT).
- Interaksjoner: skjema-submit → Supabase auth (per fil-kommentar).
- AK-domene vist: ingen.
- Designfil-referanse: «Auth Innlogging (terminal-lys).dc.html» (nevnt i fil-kommentar).
- Nåværende designkvalitet: ferdig. Mørk terminal-fasit med hardkodet inline gradient `#0A1410→#07100C` og fallback-hex i `var(--t-fg,#EAF2EC)` — bevisst terminal-tema-token-sett, men hardkodede farger i page-fil avviker fra token-disiplin.
- Redesign-prioritet: P3

### /auth/signup
- Fil: `src/app/auth/signup/page.tsx` (form i `./signup-form.tsx`)
- Flate: Auth (offentlig)
- Rolle/gating: Ingen — offentlig.
- Jobb: Opprette konto (gratis, ingen binding).
- Data vist: `?epost=`-param prefyller e-postfelt (gjeste-bro fra booking) → `SignupForm defaultEmail`.
- Komponenter: Lokal `SignupForm`.
- Layout og hierarki: Identisk skall som login — «ak»-merke → hero «Lag konto» + «Start gratis. Ingen binding.» → skjema.
- Tilstander: i SignupForm (UVERIFISERT).
- Interaksjoner: submit → Supabase-registrering.
- AK-domene vist: ingen.
- Designfil-referanse: «Auth Registrering og passord (terminal-lys).dc.html».
- Nåværende designkvalitet: ferdig (samme terminal-fasit som login).
- Redesign-prioritet: P3

### /auth/bankid
- Fil: `src/app/auth/bankid/page.tsx`
- Flate: Auth (offentlig)
- Rolle/gating: Ingen.
- Jobb (stub): Vise BankID-pålogging som visuelt skall — funksjon kommer post-BETA.
- Komponenter: `BankIdSkjerm` fra `@/components/auth/bankid-skjerm`.
- Tilstander: kun statisk start-skall. Ingen loader.
- Designfil-referanse: ph-auth.jsx → ABankID (per fil-kommentar).
- Nåværende designkvalitet: ferdig som placeholder. Cream-bakgrunn (avviker fra login/signup mørk terminal).
- Redesign-prioritet: P3 — stub, ikke-funksjonell.

### /auth/check-email
- Fil: `src/app/auth/check-email/page.tsx`
- Flate: Auth (offentlig)
- Rolle/gating: Ingen.
- Jobb (stub): Bekreftelses-skjerm «Sjekk innboksen din» etter signup.
- Komponenter: Ingen — håndbygd kort. Bruker semantiske tokens (`bg-card`, `text-muted-foreground`, `border-border`).
- Layout: Sentrert hvitt kort på `from-background to-secondary/40`-gradient. Lenker til /auth/signup (prøv igjen) + /auth/login (tilbake).
- Designfil-referanse: ingen prototype (eldre håndbygd kort).
- Nåværende designkvalitet: ferdig, men **inkonsistent** med terminal-fasiten — bruker «AK *Golf*»-ordmerke + lyst kort, ikke «ak»-lime-merke + mørk flate som login/signup/forgot/reset. Visuell drift.
- Redesign-prioritet: P2 — bringe i tråd med terminal-auth-fasiten.

### /auth/forgot-password
- Fil: `src/app/auth/forgot-password/page.tsx` (form i `./forgot-form.tsx`)
- Flate: Auth (offentlig)
- Rolle/gating: Ingen.
- Jobb: Be om passord-tilbakestillingslenke (steg 1 send e-post, steg 2 bekreftelse i ForgotForm).
- Komponenter: Lokal `ForgotForm`.
- Layout: Terminal-fasit-skall (mørk gradient + «ak»-merke), skjema rett på flaten. Ingen egen hero-tekst i page (ForgotForm eier teksten).
- Designfil-referanse: samme «Auth Registrering og passord»-stil.
- Nåværende designkvalitet: ferdig (terminal-fasit).
- Redesign-prioritet: P3

### /auth/reset-password
- Fil: `src/app/auth/reset-password/page.tsx` (form i `./reset-form.tsx`)
- Flate: Auth (offentlig)
- Rolle/gating: Ingen (Supabase-token i URL, håndteres i ResetForm).
- Jobb: Sette nytt passord etter e-postlenke.
- Komponenter: Lokal `ResetForm`.
- Layout: Terminal-fasit-skall + hero «Sett nytt passord» / «Velg et passord på minst 8 tegn.» → skjema.
- Designfil-referanse: terminal-fasit (login/signup-stil).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /auth/logget-ut
- Fil: `src/app/auth/logget-ut/page.tsx`
- Flate: Auth (offentlig)
- Rolle/gating: Ingen.
- Jobb (stub): Bekrefte utlogging + tilbud om å logge inn igjen.
- Data vist: Statiske lenker — hjem `/`, logg inn `/auth/login`, marketing `/`, feedback `post@akgolf.no`.
- Komponenter: `LoggetUtSkjerm` fra `@/components/auth/logget-ut` (v10-fasit, byttet fra håndduplikat 3. juni for å fjerne drift).
- Designfil-referanse: `public/design-handover/_screens/au-loggetut.png` (v10).
- Nåværende designkvalitet: ferdig. Cream-bakgrunn (igjen avvik fra mørk terminal — men dette er v10-fasit, bevisst).
- Redesign-prioritet: P3

### /auth/onboarding
- Fil: `src/app/auth/onboarding/page.tsx` (wizard i `./onboarding-wizard.tsx`)
- Flate: Auth / onboarding
- Rolle/gating: `requirePortalUser()` (innlogget kreves). Auto-redirect: ferdig onboarding → /portal · /admin · /forelder etter rolle; PARENT → /auth/onboarding/forelder.
- Jobb: P7 state-machine onboarding-wizard for spiller; auto-resume til riktig steg via `getResumeStep(user)`.
- Data vist: `initialStep` = resume-steg fra user-state.
- Komponenter: Lokal `OnboardingWizard`. Ingen mørk gradient-ramme (cream `bg-background`).
- Tilstander: resume/complete-redirect håndtert i RSC. Wizard-interne states UVERIFISERT.
- Designfil-referanse: ph-auth.jsx → AOnboarding (fil-kommentar).
- Nåværende designkvalitet: ferdig (fersk fasit, wizard direkte på cream).
- Redesign-prioritet: P3

### /auth/onboarding/forelder
- Fil: `src/app/auth/onboarding/forelder/page.tsx` (wizard i `./forelder-wizard.tsx`)
- Flate: Auth / onboarding (forelder)
- Rolle/gating: `requirePortalUser()` (innlogget). Beholder `OnboardingShell`-rammen (i motsetning til spiller-onboarding).
- Jobb: Onboarding-wizard for forelder-rolle.
- Komponenter: `OnboardingShell` (`@/components/onboarding/onboarding-shell`) + lokal `ForelderWizard`.
- Designfil-referanse: ingen eksplisitt (bruker delt OnboardingShell).
- Nåværende designkvalitet: halvferdig — bruker eldre OnboardingShell-ramme mens spiller-onboarding er flyttet til ny cream-fasit. Mulig drift mot ny onboarding-stil.
- Redesign-prioritet: P2

### /auth/guardian-consent/[token]
- Fil: `src/app/auth/guardian-consent/[token]/page.tsx` (form i `./guardian-consent-form.tsx`)
- Flate: Auth (offentlig, token-basert) — GDPR art. 8 / P17 foreldresamtykke
- Rolle/gating: Ingen innlogging — token-validert. Forelder klikker e-postlenke.
- Jobb: Forelder bekrefter samtykke for mindreårig spiller → aktiverer spiller-konto + ParentRelation.
- Data vist (felt → kilde): `invitation` + `invitation.player {name,email,dateOfBirth,requiresGuardianConsent,guardianConsentGivenAt}` via `prisma.parentInvitation.findUnique`. Spilleralder via `calculateAge(dateOfBirth)`.
- Komponenter: Lokal `GuardianConsentForm` + inline `ExpiredCard` / `SuccessCard`. Lucide `Shield/Check/AlertTriangle`. Semantiske tokens.
- Layout og hierarki: `max-w-2xl`, sentrert header med Shield-ikon + eyebrow «AK GOLF · FORELDRESAMTYKKE» → hero «Bekreft *samtykke*» → status-greining (utløpt/allerede-gitt/skjema) → GDPR-info-seksjon → lenker /personvern + /vilkar.
- Tilstander: `notFound()` ved ugyldig token; **expired**-kort; **success/already-consented**-kort; ellers skjema. Solid state-dekning.
- AK-domene vist: ingen golf-domene (GDPR-flyt).
- Designfil-referanse: ingen prototype (håndbygd).
- Nåværende designkvalitet: ferdig — pen, godt strukturert, full state-dekning. Merk: én inline `style={{ color: "hsl(var(--warning)) }}` på AlertTriangle (redundant med className).
- Redesign-prioritet: P3

### /auth/samtykke-venter
- Fil: `src/app/auth/samtykke-venter/page.tsx` (klient i `./samtykke-venter-klient.tsx`)
- Flate: Auth — venterom (S-13) for mindreårig som venter på foreldresamtykke
- Rolle/gating: Innlogget kreves via `getCurrentUserRaw()` (IKKE `getCurrentUser` — ville loopet). Redirect: ikke innlogget → /auth/login; samtykke gitt → /forelder · /admin · /portal etter rolle.
- Jobb: Vise venterom + resend-invitasjon + logg ut for spiller som venter på samtykke.
- Data vist: `user.name`; siste aktive `parentInvitation.email` (acceptedAt null, ikke utløpt).
- Komponenter: Lokal `SamtykkeVenterKlient`.
- Tilstander: redirect-greining i RSC (`isAwaitingGuardianConsent`). `force-dynamic`.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: UVERIFISERT visuelt (rendres i klient-komponent, ikke lest). Logikk-laget er ferdig.
- Redesign-prioritet: P2 (verifiser klient-komponent for visuell kvalitet)

---

## /inviter

### /inviter/forelder/[token]
- Fil: `src/app/inviter/forelder/[token]/page.tsx` (form i `./form.tsx`)
- Flate: Offentlig accept-side for forelder-invitasjon
- Rolle/gating: Ingen — token-validert. IKKE beskyttet av proxy (`/inviter` ikke i `erBeskyttet`).
- Jobb: Verifisere invitasjons-token og rendre registreringsskjema for ny forelder.
- Data vist: `prisma.parentInvitation.findUnique` + `player.name`. Status utledet: ugyldig / brukt / utløpt (med formatert dato) / ok.
- Komponenter: Lokal `AksepterForm`. `Intl.DateTimeFormat("nb-NO")`. Semantiske tokens.
- Layout: `max-w-md`, eyebrow «AK Golf · Foreldreinvitasjon» → hero «Bli *forelder* i AK Golf» → status-melding eller skjema.
- Tilstander: ugyldig/brukt/utløpt/ok — full greining. Ingen loading/error utover dette.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype (håndbygd).
- Nåværende designkvalitet: ferdig men **enklere/eldre stil** enn guardian-consent (samme funksjonsområde, ulik visuell tyngde). Mulig konsolidering med guardian-consent.
- Redesign-prioritet: P2 — to forelder-invitasjons-/samtykke-flater med ulik stil bør harmoniseres.

---

## /kommando (AK Agency OS — personlig kommandosenter, ADMIN-only)

> Felles for alle 6: gates i `kommando/layout.tsx` via `canAccessMissionControl()` (ADMIN-only, ellers `redirect("/")`). Alltid `.dark` terminal-tema (ingen toggle — «Etappe 1»). Egen `KommandoRail`-sidebar + header «AK · AGENCY OS». IKKE beskyttet av proxy.ts — kun layout-gaten. Egne demo-prototyper finnes ikke (net-new modul, plan i `docs/ak-agency-os-plan.md`).

### /kommando
- Fil: `src/app/kommando/page.tsx`
- Flate: Kommando (dashboard)
- Rolle/gating: ADMIN (layout + `canAccessMissionControl()` i page).
- Jobb: Kommandosenter-oversikt — KPI-strip + paneler (AI-agenter, I dag, Agent-team, Oppgaver).
- Data vist (felt → kilde): åpne oppgaver/AI-kjøringer/prosjekter-count + recentTasks (`kommandoTask`/`kommandoMessage`/`kommandoProject`); dagens bookinger (`booking` CONFIRMED/PENDING); dagens frister (`kommandoTask.dueAt`); siste agent-run + steg-progress (`kommandoAgentRun`/`kommandoAgentStep`). Modell-liste fra `KOMMANDO_MODELS` + `kommandoModelReady`.
- Komponenter: `KpiStrip`, `KpiCard`, `AthleticBadge` (athletic). Resten håndbygde seksjoner med tokens.
- Layout: `KpiStrip cols={4}` → `lg:grid-cols-2` med 4 seksjoner (AI-agenter, I dag, Agent-team full bredde, Oppgaver full bredde). Hver seksjon har «Åpne →»-lenke til undermodul.
- Tilstander: empty-states per panel («Ingen avtaler…», «Ingen kjøringer enda», «Ingen åpne oppgaver»). Ingen loading/error.
- AK-domene vist: ingen golf-domene (forretnings-/AI-drift). Bookinger via serviceType-navn.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig, ekte DB-data (ingen dummy). Konsistent terminal-tetthet.
- Redesign-prioritet: P3

### /kommando/agenter
- Fil: `src/app/kommando/agenter/page.tsx`
- Flate: Kommando (AI-chat)
- Rolle/gating: ADMIN (layout-gate).
- Jobb: Chat mot 4 modeller. Server genererer ny `conversationId` (randomUUID) per besøk.
- Komponenter: `AgentChat` (`@/components/kommando/agent-chat`).
- Layout: `max-w-3xl`, full-skjerm chat.
- Tilstander: i AgentChat (UVERIFISERT).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: UVERIFISERT (logikk i klient-komponent). `force-dynamic`.
- Redesign-prioritet: P3

### /kommando/kalender
- Fil: `src/app/kommando/kalender/page.tsx`
- Flate: Kommando (kalender)
- Rolle/gating: ADMIN.
- Jobb: Måneds-/uke-kalender med ekte bookinger + oppgavefrister.
- Data vist: `booking` (måned, CONFIRMED/PENDING) + `kommandoTask` (dueAt i måned). Bygger `MonthDayCell[]` + `WeekEvent[]` på server.
- Komponenter: `CalendarViews` (`@/components/kommando/calendar-views`) + athletic `calendars`-typer (`MonthDayCell`, `WeekEvent`).
- Layout: `max-w-4xl`, måned-tittel (capitalize) → CalendarViews → mono-fotnote med dagnavn.
- Tilstander: tomme celler hvis ingen hendelser. Ingen loading/error.
- AK-domene vist: ingen (bookinger via serviceType-navn).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig, ekte data, gjenbruker athletic-kalenderkomponenter.
- Redesign-prioritet: P3

### /kommando/oppgaver
- Fil: `src/app/kommando/oppgaver/page.tsx`
- Flate: Kommando (oppgaver)
- Rolle/gating: ADMIN.
- Jobb: Liste + administrere brukerens oppgaver, koblet til prosjekter.
- Data vist: `kommandoTask` (alle, sortert status/created) + aktive `kommandoProject` for kobling.
- Komponenter: `TaskList` (`@/components/kommando/task-list`).
- Layout: `max-w-2xl`, tittel «Oppgaver» → TaskList.
- Tilstander: i TaskList.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (logikk i klient-komponent).
- Redesign-prioritet: P3

### /kommando/prosjekter
- Fil: `src/app/kommando/prosjekter/page.tsx`
- Flate: Kommando (prosjekter)
- Rolle/gating: ADMIN.
- Jobb: Liste prosjekter med oppgavetelling.
- Data vist: `kommandoProject` (alle) + `kommandoTask.groupBy(projectId)` for telling.
- Komponenter: `ProjectList` (`@/components/kommando/project-list`).
- Layout: `max-w-2xl`, tittel «Prosjekter» → ProjectList.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /kommando/team
- Fil: `src/app/kommando/team/page.tsx`
- Flate: Kommando (agent-team)
- Rolle/gating: ADMIN.
- Jobb: Flere AI-er jobber sekvensielt på én oppgave; output fra ett steg mates til neste. Viser siste 10 kjøringer med steg.
- Data vist: aktive `kommandoProject` + siste 10 `kommandoAgentRun` + `kommandoAgentStep` (orderIndex/model/role/status/output).
- Komponenter: `AgentTeam` (`@/components/kommando/agent-team`).
- Layout: `max-w-3xl`, tittel + lead → AgentTeam.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

---

## /meg (Telegram-assistent-dashboard, ADMIN-only)

### /meg
- Fil: `src/app/meg/page.tsx`
- Flate: Meg-assistent (egen toppnivå-rute, IKKE /portal/meg som er profil)
- Rolle/gating: `getCurrentUser()` + `user.role !== "ADMIN"` → `notFound()`. **Layout (`meg/layout.tsx`) har INGEN egen gate** — gaten ligger i page. `.dark`-tema fra layout. IKKE beskyttet av proxy.
- Jobb (v1): Dashboard for Meg-assistenten — siste morgenbrief, ventende BEKREFT-bekreftelser, siste logg. Input skjer via Telegram.
- Data vist (felt → kilde): `hentBriefer/hentVentende/hentNylige` fra `@/lib/meg/read` (subject = `adminSubject()`). KIND_LABEL mapper morgenbrief/kveldsjournal/loftesjekk/crm_nudge.
- Komponenter: `AthleticEyebrow`, `AthleticBadge` (athletic). Resten håndbygde kort.
- Layout: `max-w-2xl`, header «Hei, {fornavn}» → seksjoner: Siste brief / Venter på BEKREFT (med urgent-badge-count) / Siste logg.
- Tilstander: empty-states per seksjon («Ingen briefer ennå…», «Ingenting venter…», «Ingen logg ennå»). `force-dynamic`.
- AK-domene vist: ingen golf-domene (CRM/assistent).
- Designfil-referanse: ingen prototype — fil-kommentar sier polert versjon bygges etter Claude Design-prompter (Google Drive `inbox/meg-assistent-design-prompter.md`).
- Nåværende designkvalitet: halvferdig (eksplisitt «funksjonell v1», venter på design-runde).
- Redesign-prioritet: P1 — eksplisitt merket som ufullført, venter på dedikert design.

---

## /onboard (coach/klubb-onboarding)

> Begge gates via `requirePortalUser`, bruker delt `OnboardingShell`. IKKE proxy-beskyttet (`/onboard` ikke i `erBeskyttet`) — gaten ligger i page via `requirePortalUser`. State lagres i `User.preferences`.

### /onboard/coach
- Fil: `src/app/onboard/coach/page.tsx` (wizard i `./coach-wizard.tsx`)
- Flate: Onboarding (coach)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`. Ferdig (stepCompleted ≥ 4 / completedAt) → redirect /admin.
- Jobb: 4-stegs coach-onboarding. Resume-steg fra `preferences.coachOnboarding.stepCompleted`.
- Data vist: `user.name/email/phone` prefyller wizard. State `lesPreferences(user)`.
- Komponenter: `OnboardingShell` + lokal `CoachWizard`.
- Tilstander: resume/complete-redirect i RSC. `force-dynamic`.
- AK-domene vist: ingen.
- Designfil-referanse: ingen eksplisitt (delt shell).
- Nåværende designkvalitet: UVERIFISERT visuelt (wizard i klient-komponent). Merknad: kommentar sier «Coach HQ» (gammelt navn for AgencyOS) — terminologi-drift.
- Redesign-prioritet: P2

### /onboard/klubb
- Fil: `src/app/onboard/klubb/page.tsx` (wizard i `./klubb-wizard.tsx`)
- Flate: Onboarding (klubb)
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`. Ferdig (≥5 / completedAt) → redirect /admin.
- Jobb: 5-stegs klubb-onboarding (en klubb signerer via hovedkontakt). Resume fra `preferences.klubbOnboarding`.
- Data vist: `user.name/email` prefyller kontakt-felt.
- Komponenter: `OnboardingShell` + lokal `KlubbWizard`.
- Tilstander: resume/complete-redirect. `force-dynamic`.
- Designfil-referanse: ingen eksplisitt.
- Nåværende designkvalitet: UVERIFISERT visuelt.
- Redesign-prioritet: P2

---

## /team-gfgk (offentlig foreldremøte-presentasjon)

### /team-gfgk
- Fil: `src/app/team-gfgk/page.tsx` (presentasjon i `./_components/presentation.tsx`, data i `./data.ts`, egen `./deck.css`)
- Flate: Marketing/presentasjon (offentlig deck) — **foreldreløs** (ingen app-nav lenker hit; delt som direkte URL)
- Rolle/gating: **Ingen — fullt offentlig.** Layout setter kun `robots: noindex/nofollow`. IKKE proxy-beskyttet.
- Jobb: Statisk slide-deck for GFGK-foreldremøte — «Differensiering i elitegruppa» + komplett resultatoversikt sesong 2025–2026.
- Data vist: Statisk `GFGK_DATA` (auto-generert snapshot fra Claude Design-handover `data.js`) — spillere med club/birthYear/rang/tournaments/rounds/avg18/avgToPar/vsField/best/worst.
- Komponenter: Lokal `Presentation`. Egen `deck.css` (utenfor designsystem-tokens).
- AK-domene vist: golf-resultatdata (snitt-score, vs-field, brutto-score-statistikk per spiller).
- Designfil-referanse: Claude Design-handover (data.js-kilde, presentasjonen er portet derfra).
- Nåværende designkvalitet: UVERIFISERT visuelt (Presentation-komponent ikke lest). Egen `deck.css` betyr at den lever utenfor designsystemet — potensiell token-drift.
- Redesign-prioritet: P3 — engangs-deck, lav strategisk verdi, men verifiser at golf-data er brutto (ikke netto).

---

## /dev-banekart (midlertidig dev-verktøy)

### /dev-banekart
- Fil: `src/app/dev-banekart/page.tsx`
- Flate: Dev-verktøy (banekart-fundament fase 1) — **foreldreløs**, eksplisitt midlertidig
- Rolle/gating: **Ingen gate.** IKKE proxy-beskyttet (`/dev-banekart` ikke i `erBeskyttet`). Offentlig URL — **sikkerhetsmerknad: ingen auth på en dev-rute, bør gates eller fjernes.**
- Jobb (stub): Verifisere banekart-rendering for Onsøy GK. Slettes når `/portal/baneguide/[baneId]` er portet.
- Data vist: `prisma.bane` (slug onsoy-golfklubb) + holes (holeNumber/par/tee+green lat/lng) + geojson.
- Komponenter: `CourseMap` (`@/components/baneguide/course-map`).
- Tilstander: «Onsøy ikke importert ennå»-melding hvis bane/koordinater mangler. `force-dynamic`.
- AK-domene vist: bane-/hull-geometri.
- Designfil-referanse: ingen — fil-kommentar sier ekte skjermer bygges via design-porting-gate under /portal/baneguide.
- Nåværende designkvalitet: stygg/dev — bevisst rå verifiseringsside.
- Redesign-prioritet: P0 (ryddesak) — slett/erstatt eller minst gate; offentlig uautentisert dev-rute i prod-bygg.

---

## /intern/komponenter (komponent-galleri — mock-data, intern)

> `/intern` ER proxy-beskyttet (krever innlogget). Det finnes **ingen** `intern/layout.tsx` med rolle-gate — kun proxy-ens auth-sjekk. Alle under er mock-data-demoer; galleri-page sier eksplisitt «fjernes eller gates før launch».

### /intern/komponenter
- Fil: `src/app/intern/komponenter/page.tsx`
- Flate: Intern (galleri-indeks)
- Rolle/gating: Kun proxy-auth (innlogget). **Ingen rolle-gate** — enhver innlogget bruker når den (modul-merknad sier bør gates).
- Jobb: Indeks over 7 komponent-verifiseringsdemoer (mock-data) med lenker til hver.
- Data vist: Statisk `demos[]`-array (slug/title/desc/bolk).
- Komponenter: Håndbygd grid med Lucide `ArrowUpRight`. Tokens brukt.
- Designfil-referanse: ingen.
- Nåværende designkvalitet: ferdig som internt verktøy, men **bør gates/fjernes** før lansering.
- Redesign-prioritet: P0 (ryddesak — gate eller fjern, ikke redesign).

### /intern/komponenter/agency-kit
- Fil: `src/app/intern/komponenter/agency-kit/page.tsx` (client)
- Flate: Intern demo (Bolk 1) — mock-data
- Jobb (demo): Vise `AgencySidebar` + `DataTable` (sortering/seleksjon) + indicators isolert.
- Komponenter: `AgencySidebar`, `DataTable`, `Pagination`, `StatusPill`, `RoleBadge`, `PeriodeTag`, `SeverityDot` (athletic). Mock nav-grupper.
- AK-domene vist: rolle-badges/periode-tags (demo).
- Nåværende designkvalitet: ferdig demo (mock).
- Redesign-prioritet: P0 (intern, ikke redesign-mål).

### /intern/komponenter/daglig-brief
- Fil: `src/app/intern/komponenter/daglig-brief/page.tsx`
- Flate: Intern demo (Pulje D) — mock-data «r35-dashboard.png» (NÅ = ons 28. mai 11:24)
- Jobb (demo): 3-kolonne AgencyOS-dashboard (timeline · innboks · fokus-spillere) + KPI-strip portert til tokens.
- Komponenter: Mange Lucide-ikoner, håndbygd. Isolert (ingen admin-sidebar).
- AK-domene vist: timeline/innboks/spiller-fokus (mock).
- Nåværende designkvalitet: ferdig demo (troskapstest mot preview-PNG).
- Redesign-prioritet: P0 (intern).

### /intern/komponenter/forelder
- Fil: `src/app/intern/komponenter/forelder/page.tsx` (client)
- Flate: Intern demo (Bolk 3) — mock-data
- Jobb (demo): `MinorGate` (GDPR), `ApprovalCard`, `MessageComposer`, `ReadReceiptList`.
- Komponenter: `@/components/forelder/*` (minor-gate, approval-card, parent-comm).
- AK-domene vist: ingen golf-domene. Demo-navn bruker «Coach Andreas» (ikke kanon Anders Kristiansen) + «Øyvind» — mock-data-drift.
- Nåværende designkvalitet: ferdig demo (mock).
- Redesign-prioritet: P0 (intern).

### /intern/komponenter/hull-analyse
- Fil: `src/app/intern/komponenter/hull-analyse/page.tsx`
- Flate: Intern demo (PlayerHQ hull-analyse)
- Jobb (demo): Top-down hull-kart med kategori-markører langs shot-path (Tee→Innspill→Nærspill→Putt).
- Komponenter: `HoleAnalysis` (`@/components/hole-analysis/hole-analysis`).
- AK-domene vist: SG per sone, kategori-markører (CS-soner).
- Nåværende designkvalitet: ferdig demo. `max-w-[440px]` (PlayerHQ-mobilbredde).
- Redesign-prioritet: P0 (intern).

### /intern/komponenter/inbox-tester
- Fil: `src/app/intern/komponenter/inbox-tester/page.tsx` (client)
- Flate: Intern demo (Bolk 2 coach-arbeidsflyt) — mock-data
- Jobb (demo): `FilterPillBar` + Inbox-kit (rad/batch/expand) + `TestMatrix` (fargekodede celler).
- Komponenter: `@/components/admin/inbox/inbox-kit`, `@/components/athletic/data/test-matrix`, `FilterPillBar`.
- AK-domene vist: test-matrise (NGF/test-celler, mock).
- Nåværende designkvalitet: ferdig demo (mock).
- Redesign-prioritet: P0 (intern).

### /intern/komponenter/spiller-panel
- Fil: `src/app/intern/komponenter/spiller-panel/page.tsx` (client)
- Flate: Intern demo (Bolk 2b) — mock-data Øyvind Rohjan
- Jobb (demo): 400px slide-over `PlayerDetailPanel` — KPI, pyramide faktisk-vs-plan, uke-grid.
- Komponenter: `PlayerDetailPanel` (`@/components/admin/player/player-detail-panel`).
- AK-domene vist: pyramide (fys/tek/slag/spill/turn faktisk+plan), SG-trend, kategori (KONK).
- Nåværende designkvalitet: ferdig demo (mock; bruker kanon ØR-initialer).
- Redesign-prioritet: P0 (intern).

### /intern/komponenter/team-bookinger
- Fil: `src/app/intern/komponenter/team-bookinger/page.tsx` (client)
- Flate: Intern demo (Bolk 2b) — mock-data
- Jobb (demo): `TeamRosterList` (CBAC-roller), `PlanMalCard` (pyr-dist), `InlineBookingForm`.
- Komponenter: `@/components/admin/team/team-kit`, `@/components/admin/bookings/booking-form-kit`.
- AK-domene vist: periode-tags (GRUNN/SPES/TURN), pyramide-distribusjon per mal.
- Nåværende designkvalitet: ferdig demo. **Mock-navn bruker døde demo-personer** («Andreas Kragerud» = forbudt gammelt coach-navn per CLAUDE.md navne-kanon) — bør ryddes.
- Redesign-prioritet: P0 (intern).

---

## (internal)-gruppe (ADMIN-only demoer + design-system)

> Alle gates i `(internal)/layout.tsx` via `requirePortalUser({ allow: ["ADMIN"] })` + gul «INTERN — KUN UTVIKLING»-banner. **Demoene er bygget fra `wireframe/design-files-v2/` — eksplisitt FORBUDT design-kilde** per `.claude/rules/design-porting-gate.md`. De er pilotskjermer med mock-data for Øyvind Rohjan.

### /demos/plan-bygger
- Fil: `src/app/(internal)/demos/plan-bygger/page.tsx`
- Flate: (internal) pilot — AgencyOS Plan-bygger steg 4 (statisk)
- Rolle/gating: ADMIN (gruppe-layout).
- Jobb (pilot): Pyramide-allokasjons-skjerm (5 sliders FYS/TEK/SLAG/SPILL/TURN sum=100%) med agent-forslag-stripe + spiller/periode/turneringer-sidekort.
- Data vist: 100% hardkodet mock (Øyvind Rohjan, Kategori A, HCP +2,4, SG-tall).
- Komponenter: Helt håndbygd (lokale `StepCard/PhaseCard/SliderBlock/StatRow`). **Mange hardkodede hex via `var(--x,#hex)`-fallbacks** — token-disiplin-brudd.
- AK-domene vist: pyramide-allokering, L-faser (Base/Forb/Spes/Taper/Peak), SG-arg, kategori, HCP.
- Designfil-referanse: **`wireframe/design-files-v2/coachhq-A/02-plan-bygger.html` (FORBUDT kilde)**.
- Nåværende designkvalitet: ferdig pilot men bygget fra arkivert/forbudt design-kilde + hardkodet hex. Teknisk gjeld.
- Redesign-prioritet: P1 — funksjonen (plan-bygger) skal egentlig bo i Workbench (låst beslutning); denne pilot-ruten bør avvikles/ports dit.

### /demos/plan-bygger/[steg]
- Fil: `src/app/(internal)/demos/plan-bygger/[steg]/page.tsx` (1444 linjer)
- Flate: (internal) pilot — full 6-stegs plan-bygger-wizard
- Rolle/gating: ADMIN. `[steg]` validert «1»–«6», ellers `notFound()`.
- Jobb (pilot): Hele 6-stegs wizard (Spiller→Periode→Faser→Pyramide→Økt-skjelett→Bekreft).
- Data vist: hardkodet mock (Øyvind R. mot Sørlandsåpent 2026).
- Designfil-referanse: **`wireframe/design-files-v2/coachhq-A/...` (FORBUDT)**.
- Nåværende designkvalitet: ferdig pilot fra forbudt kilde, stor håndbygd fil. Gjeld.
- Redesign-prioritet: P1 (samme som over — hører til Workbench).

### /demos/newplan/[steg]
- Fil: `src/app/(internal)/demos/newplan/[steg]/page.tsx` (823 linjer)
- Flate: (internal) pilot — NewPlan modal-flyt (4 steg)
- Rolle/gating: ADMIN. `[steg]` 1–4.
- Jobb (pilot): NewPlan-modal-wizard (mock Øyvind mot Sørlandsåpent).
- Designfil-referanse: **`wireframe/design-files-v2/modaler-A/01..04-newplan-steg*.html` (FORBUDT)**.
- Nåværende designkvalitet: ferdig pilot fra forbudt kilde. Gjeld.
- Redesign-prioritet: P1.

### /demos/ny-okt/[steg]
- Fil: `src/app/(internal)/demos/ny-okt/[steg]/page.tsx` (983 linjer)
- Flate: (internal) pilot — PlayerHQ Ny-økt-wizard (6 steg)
- Rolle/gating: ADMIN. `[steg]` 1–6.
- Jobb (pilot): Spiller lager egen TEK-økt på Mulligan Studio 2 (mock Øyvind).
- Designfil-referanse: **`wireframe/design-files-v2/playerhq-C/01-06-ny-okt-steg-*.html` (FORBUDT)**.
- Nåværende designkvalitet: ferdig pilot fra forbudt kilde. Gjeld.
- Redesign-prioritet: P1.

### /demos/trackman-import/[steg]
- Fil: `src/app/(internal)/demos/trackman-import/[steg]/page.tsx` (421 linjer)
- Flate: (internal) pilot — PlayerHQ TrackMan-import (3-stegs modal)
- Rolle/gating: ADMIN. `[steg]` 1–3, ellers `notFound()`.
- Jobb (pilot): TrackMan-import-flyt (last opp fil/bilde → bekreft).
- Komponenter: Håndbygd, backdrop `rgba(10,31,24,0.5)`.
- Designfil-referanse: **`wireframe/design-files-v2/modaler-D/d03–d05-trackman-import-*.html` (FORBUDT)**.
- Nåværende designkvalitet: ferdig pilot fra forbudt kilde. Gjeld.
- Redesign-prioritet: P1.

### /design-system
- Fil: `src/app/(internal)/design-system/page.tsx`
- Flate: (internal) — designsystem-dokumentasjon (v1)
- Rolle/gating: ADMIN.
- Jobb: Vise alle tokens + komponenter (badge/button/eyebrow/KPI/progress/tabs/skeleton/empty/inputs osv.).
- Komponenter: Importerer bredt fra athletic + ui (`AthleticBadge/Button/Eyebrow`, `KPICard`, `ProgressBar/Ring`, `Tab`-familie, `Skeleton`, `EmptyState`, `Input/Select/Radio/Switch/Checkbox/Breadcrumb`).
- Designfil-referanse: ingen (er selv referansen).
- Nåværende designkvalitet: ferdig dokumentasjonsside (levende referanse).
- Redesign-prioritet: P3 (verktøy, ikke produkt-skjerm).

### /design-system-v2
- Fil: `src/app/(internal)/design-system-v2/page.tsx` (client)
- Flate: (internal) — designsystem V2 «Living Athletic Editorial»
- Rolle/gating: ADMIN.
- Jobb: Vise alle 25 V2-komponenter med alle varianter (visuell fasit brukt under migrasjon Bølger 1-5).
- Komponenter: `LiveBar`, `Topbar`, `PhotoHero`, `DetailHero`, `PageHero`, `StatTile`, `PyramidBar`, `SgBar`, `HcpDelta`, `ItineraryList/Row`, `NowLine`, `InsightCard`, `PartnerCard`, `TournamentCard`, `WellnessCard`, `QuickAction`, `CoachMessage(Detail)`, `SectionHeader`, `PhotoDivider`, `GhostNumber`, `StubModal` + `useNowTime`-hook.
- Designfil-referanse: ingen (er selv fasit).
- Nåværende designkvalitet: ferdig referanse-galleri.
- Redesign-prioritet: P3 (verktøy).

---

## Tverrgående funn (for orkestrator)

1. **Auth-mekanisme-konflikt bekreftet:** `src/proxy.ts` beskytter kun `/portal`, `/admin`, `/intern`. `/kommando`, `/meg`, `/onboard`, `/inviter`, `/team-gfgk`, `/dev-banekart`, `(internal)` er IKKE proxy-beskyttet — de gater (eller ikke) selv i RSC/layout. To reelt offentlige uten gate: `/team-gfgk` (bevisst deck) og **`/dev-banekart` (utilsiktet — P0 sikkerhet/rydding)**.
2. **To visuelle motpoler:** ferdige terminal-lys-auth-fasiter vs. mock-data-piloter bygget fra **forbudt `wireframe/design-files-v2/`-kilde** (alle `(internal)/demos/*`). Disse bryter `design-porting-gate.md` sin låste kilde-regel og har hardkodet hex.
3. **Foreldreløse/internt-merkede ruter:** alt `/intern/komponenter/*` (galleri sier «fjernes eller gates før launch», ingen rolle-gate utover proxy-auth), alle `(internal)/demos/*`, `/team-gfgk`, `/dev-banekart`.
4. **Navne-kanon-drift i mock-data:** `team-bookinger` («Andreas Kragerud»), `forelder` («Coach Andreas») bruker forbudte gamle demo-navn; `coach`-onboarding-kommentar sier «Coach HQ» (gammelt navn for AgencyOS).
5. **Auth-intern inkonsistens:** `/auth/check-email` bruker lyst kort + «AK Golf»-ordmerke i stedet for terminal-fasit-skallet (mørk + «ak»-lime) som login/signup/forgot/reset deler. To forelder-flater (`/inviter/forelder/[token]` vs `/auth/guardian-consent/[token]`) har ulik visuell tyngde for overlappende formål.
6. **Eksplisitt ufullført:** `/meg` (v1, venter på Claude Design-runde) = P1.
