# Implementeringskart — Landingssider + Booking + Forelder + Auth

> **Kilde:** `60-HANDOFF-SKJERMKART.md`, `61-DEKNINGSMATRISE.md`, eksisterende page.tsx-filer, Prisma-modeller og actions-filer.
> **Scope:** Kun NY-HYBRID-skjermer for produktene Marketing, Forelderportal og Auth.
> **Tema-default:** Marketing + Forelder + Auth → lyst (PlayerHQ-palett). AgencyOS-kort i Auth Innlogging → `.dark`.
> **Laget:** 17. juni 2026.

---

## Per skjerm (Handoff → page.tsx → knapper+destinasjon → data → komponenter)

---

### MARKETING (5 NY-HYBRID-skjermer)

---

#### M-1 — Marketing Hjem

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Marketing Hjem (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/(marketing)/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — gammel athletic-stil (ikke hybrid) |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Book coaching» / primær CTA | `/(marketing)/booking` | Finnes |
| «Prøv gratis» / PlayerHQ-seksjon | `/auth/signup` | Finnes |
| «Les mer» per coaching-pakke | `/(marketing)/coaching` | MÅ kobles — side finnes, ingen lenke fra hjem |
| «Se cases» / suksesshistorier | `/(marketing)/cases` | MÅ kobles |
| «Coacher» / team-seksjon | `/(marketing)/coacher` | MÅ kobles |
| «Kontakt oss» / footer | `/(marketing)/kontakt` | Trolig finnes — verifiser under porting |
| Topnav-lenker (Coaching, Priser, PlayerHQ, Coacher, Kontakt) | Respektive ruter | Delvis — verifiser alle 5 |

**Datakilde:**
- Ingen Prisma-kall nødvendig på forside (statisk innhold + coaching-pakker hardkodet eller fra ServiceType).
- Valgfritt: `prisma.serviceType.findMany()` for ekte pakke-info (finnes: `Booking`-modell + `ServiceType`).

**Kit-komponenter:**
`PhotoHero`, `FeaturedCard`, `AthleticCard`, `KpiCard`, `SectionHeader`, `Button`, marketing-`Topnav`, `Footer`

---

#### M-2 — Marketing Cases

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Marketing Cases (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/(marketing)/cases/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — gammel athletic-stil |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Book coaching» / CTA på bunnen | `/(marketing)/booking` | MÅ kobles — ikke i dagens cases-side |
| «Les mer per case» | Ingen detalj-rute designet | Ikke nødvendig i Bølge 1 |
| Topnav (standard) | Respektive ruter | Arves fra layout |

**Datakilde:**
- Statisk (cases er hardkodet array i dagens side). Kan beholdes — ingen Prisma-modell for cases.
- Turneringsliste: valgfritt fra `prisma.tournament.findMany()` (modellen finnes).

**Kit-komponenter:**
`PageHero`, `FeaturedCard`, `AthleticCard`, `TournamentCard`, `SectionHeader`, `Button`, `Footer`

**Merknad:** Gammel `/suksess`-rute er `REDIRECT/LEGACY` — fjernes, peker til `/cases`.

---

#### M-3 — Marketing Coacher

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Marketing Coacher (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/(marketing)/coacher/page.tsx` + `src/app/(marketing)/coacher/[slug]/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — begge filer eksisterer |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Book time med [coach]» per coach-kort | `/(marketing)/booking?trener=[slug]` | MÅ kobles — booking eksisterer, coach-filter trolig ikke wiret |
| Coach-kort → detalj | `/(marketing)/coacher/[slug]` | Finnes (DELVIS i handoff) |
| «Book tid her» på anlegg-seksjon | `/(marketing)/booking?lokasjon=[slug]` | MÅ kobles |

**Datakilde:**
- `prisma.user.findMany({ where: { role: "COACH" } })` — coaches finnes i DB.
- `prisma.location.findMany()` — Location-modell (linje 702 i schema).
- **NB:** Markus Røinås Pedersen er EKTE coach — ikke demo-spiller. Behold.

**Kit-komponenter:**
`PageHero`, `FeaturedCard` (coach-kort m/ foto), `AthleticCard`, `SectionHeader`, `Button`, `Footer`

---

#### M-4 — Marketing Kontakt

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Marketing Kontakt (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/(marketing)/kontakt/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — har `KontaktForm` og `actions.ts` |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Send» / kontaktskjema | `server action → kontakt/actions.ts` | Finnes (`actions.ts` eksisterer) |
| 4 pakke-alternativer i select | ingen navigasjon — form-felt | Finnes |
| Suksess-tilstand etter innsending | Inline-feedback (toast/inline) | MÅ implementeres — ikke designet, men logisk nødvendig |

**Datakilde:**
- Ingen Prisma (kontaktskjema → e-post via Resend). `actions.ts` finnes.

**Kit-komponenter:**
`PageHero`, `SectionHeader`, `AthleticCard`, `Button` (primary «Send»), Lucide-ikoner (MapPin, Phone, Mail, Clock)

**Merknad:** Suksess-tilstand etter innsending er ikke designet i handoffen — bruk inline-banner eller toast.

---

### MARKETING BOOKING (4 NY-HYBRID-skjermer — TRENGER-DESIGN, men actions/server-side finnes)

> Disse er merket `TRENGER-DESIGN` i dekningsmatrisen — de har ikke `.dc.html` i handoffen.
> Actions og page.tsx-filer eksisterer allerede. Batch MA-6 er Claude Design-oppgaven.
> Kartet gjelder eksisterende implementering som skal re-skinnes / kobles.

---

#### MB-1 — Marketing Booking startside

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen (TRENGER-DESIGN → Claude Design batch MA-6) |
| **Mål page.tsx** | `src/app/(marketing)/booking/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — bruker `prisma.serviceType` |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Velg» per tjeneste-kort | `/(marketing)/booking/[slug]` | Finnes |
| Coach-filter | `?trener=[slug]` query-param | Finnes |
| Lokasjon-filter | `?lokasjon=[slug]` query-param | Finnes |

**Datakilde:**
- `prisma.serviceType.findMany()` — finnes og aktivt.
- `prisma.location.findMany()` — finnes.

**Kit-komponenter (for MA-6):** `AthleticCard`, `SectionHeader`, `PageHero`, `Button`, `SessionScheduler`

---

#### MB-2 — Marketing Booking tidspunkt-velger

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen (TRENGER-DESIGN → Claude Design batch MA-6) |
| **Mål page.tsx** | `src/app/(marketing)/booking/[slug]/page.tsx` |
| **Tema** | Lyst |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Velg tid» i SessionScheduler | `/(marketing)/booking/[slug]/bekreft?time=[iso]` | Trolig finnes — verifiser |
| «Tom kalender / kalender utilgjengelig» | EmptyState (fail-closed per gotcha) | MÅ implementeres — GCal fail-closed gjelder |

**Datakilde:**
- Google Calendar availability (lib/google-calendar.ts — fail-closed ved feil, se MEMORY: GCal fail-closed 2026-06-15).

---

#### MB-3 — Marketing Booking bekreft

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen (TRENGER-DESIGN → MA-6) |
| **Mål page.tsx** | `src/app/(marketing)/booking/[slug]/bekreft/page.tsx` |
| **Tema** | Lyst |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Bekreft booking» | `server action → booking/actions.ts` → `/booking/kvittering/[id]` | Finnes |
| «Tilbake» | `/(marketing)/booking/[slug]` | MÅ kobles |

**Datakilde:** Stripe-betaling (`lib/stripe.ts`) + `prisma.booking.create()`.

---

#### MB-4 — Marketing Booking kvittering

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen (TRENGER-DESIGN → MA-6) |
| **Mål page.tsx** | `src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx` |
| **Tema** | Lyst |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Opprett gratis konto» | `/auth/signup` | MÅ kobles |
| «Legg til kalender» | Kalender-lenke (Google/Apple) | MÅ implementeres |
| «Avbestill» | `server action → cancelBooking()` i `booking/actions.ts` | Finnes |
| «Til forsiden» | `/` | MÅ kobles |

**Datakilde:** `prisma.booking.findUnique({ where: { id } })`.

---

### FORELDERPORTAL (8 NY-HYBRID-skjermer)

---

#### F-1 — Forelderportal Hjem

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Hjem (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — ekte Prisma-data via `hentForelderOversikt()` |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Bunnav Hjem (aktiv) | `/forelder` | Finnes |
| Bunnav Barn | `/forelder/barn` | MÅ kobles — finnes men bunnav-lenke ukjent |
| Bunnav Bookinger | `/forelder/bookinger` | MÅ kobles |
| Bunnav Fakturaer | `/forelder/fakturaer` | MÅ kobles |
| «Se alle bookinger» på booking-liste | `/forelder/bookinger` | MÅ kobles |
| «Se ukerapport» på coach-notat | `/forelder/ukerapport` | MÅ kobles |

**Datakilde:**
- `lib/forelder.ts` → `hentForelderOversikt()` — finnes, henter KPI, kommende, fakturaer.
- `ParentRelation` + `Booking` + `Invoice` modeller.

**Kit-komponenter:**
`Greeting`, `KpiStrip`, `KpiCard`, `FeaturedCard`, `AthleticCard`, Bunnav (4 faner)

**Merknad:** Forelderportalen er alltid lese-modus. Ingen handlinger på vegne av barnet.

---

#### F-2 — Forelderportal Barn-profil

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Barn-profil (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/barn/page.tsx` (liste) + `src/app/forelder/barn/[childId]/page.tsx` (detalj) |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — begge filer eksisterer |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Bunnav Barn (aktiv) | `/forelder/barn` | Bunnav-komponent MÅ kobles på alle forelder-sider |
| Barn-rad → detalj | `/forelder/barn/[childId]` | MÅ kobles (om liste-side er implementert) |
| «Se ukerapport» | `/forelder/ukerapport?childId=[id]` | MÅ kobles |

**Datakilde:**
- `hentBarnForForelder(parentUserId)` fra `lib/forelder.ts` — finnes.
- `prisma.user.findUnique({ where: { id: childId } })` for detalj.
- `PyramidProgress`: krever `prisma.pyramidAssessment` eller tilsvarende — verifiser at modell finnes.
- `GoalProgress`: krever mål-data — sjekk `prisma.goal`.

**Kit-komponenter:**
`DetailHero`, `KpiStrip`, `KpiCard`, `PyramidProgress`, `GoalProgress`, `Avatar`, Bunnav

---

#### F-3 — Forelderportal Bookinger

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Bookinger (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/bookinger/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — full implementering med ekte Prisma-data |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Filter-chips (Kommende/Historikk/Turnering) | Kun filter-state (ikke navigasjon) | MÅ kobles — chips er dekorative i design, men bør filtrere liste |
| Bunnav Bookinger (aktiv) | `/forelder/bookinger` | MÅ kobles |

**Datakilde:**
- `prisma.booking.findMany()` via `ParentRelation` — finnes og aktivt.
- `Booking` + `ServiceType` + `Location` + `User` (coach) modeller.

**Kit-komponenter:**
`SectionHeader`, `AthleticCard` (booking-rad), `Badge` (status), Bunnav, filter-chips (ny komponent eller inline)

**Merknad:** Eksisterende side er godt implementert — primært re-skin til hybrid-stil.

---

#### F-4 — Forelderportal Fakturaer

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Fakturaer (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/fakturaer/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — side eksisterer |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Last ned PDF» per faktura | Server action / Stripe-invoice-URL | MÅ kobles |
| Bunnav Fakturaer (aktiv) | `/forelder/fakturaer` | MÅ kobles |

**Datakilde:**
- `prisma.invoice.findMany({ where: { userId: childId } })` — `Invoice`-modell (verifiser at den finnes under et av barna).
- Stripe-invoice-URL fra `Invoice.stripeId` via `lib/stripe.ts`.

**Kit-komponenter:**
`KpiCard` (store mono-tall), `AthleticCard` (faktura-rad), `Badge` (Betalt/Venter), Bunnav

---

#### F-5 — Forelderportal Samtykke

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Samtykke (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/samtykke/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — med `actions.ts` (`lagreSamtykker`) |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Toggle per samtykke | `server action → lagreSamtykker()` | Finnes |
| «Lagre endringer» / eksplisitt lagring | `server action → lagreSamtykker()` | Finnes |
| GDPR-handlinger («Slett data») | Kontakt-e-post eller dedikert server action | MÅ kobles — ingen sletting-action i dag |

**Datakilde:**
- `prisma.user.findUnique()` → `preferences`-felt (JSON-blob med samtykker).
- `ParentRelation.approved` for barn-tilknytning.
- `lagreSamtykker()` server action finnes i `forelder/samtykke/actions.ts`.

**Kit-komponenter:**
`SectionHeader`, `SettingsList`, Toggle (shadcn Switch), `Badge` (samtykke-status), `Button`

**Merknad:** Toggle er custom CSS i designet — bytt med shadcn Switch for konsistens.

---

#### F-6 — Forelderportal Ukerapport

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Forelderportal Ukerapport (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/forelder/ukerapport/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — side eksisterer |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Forrige uke» / «Neste uke» | Uke-query-param (`?uke=25`) | MÅ kobles |
| Bunnav Barn (aktiv på Barn-fanen) | `/forelder/barn` | MÅ kobles |

**Datakilde:**
- Coach-notat: `prisma.coachNote.findFirst({ where: { playerId, createdAt: { gte: ukeStart } } })`.
- Aktivitetslogg: `prisma.trainingSession.findMany()` for uken.
- KpiStrip: beregnet fra trenings-data (økt-tid, drills fullført, SG-delta).
- GoalProgress: `prisma.goal` per barn.

**Kit-komponenter:**
`SectionHeader`, `AthleticCard` (coach-notat-kort), `KpiStrip`, `KpiCard`, `GoalProgress`, `Badge` (PB-chip, lime), aktivitets-listekomponent, Bunnav

---

### AUTH (7 NY-HYBRID-skjermer)

---

#### A-1 — Auth Innlogging

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Auth Innlogging (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/auth/login/page.tsx` (PlayerHQ-tab), `src/app/auth/signup/page.tsx`, `src/app/auth/onboarding/page.tsx`, `src/app/onboard/coach/page.tsx` |
| **Tema** | Lyst (PlayerHQ + Onboarding) · `.dark` (AgencyOS-kort) |
| **Finnes i dag** | Ja — alle 4 page.tsx finnes |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Logg inn» (e-post + passord) | `server action → Supabase auth signIn` | Finnes |
| «Logg inn med Google» | Supabase OAuth | Finnes |
| «Har ikke konto? Registrer deg» | `/auth/signup` | Finnes |
| «Glemt passord?» | `/auth/forgot-password` | Finnes |
| Onboarding wizard «Neste» (steg 1–4) | `server action → onboarding/actions.ts` → `/portal` | Finnes |
| AgencyOS-login-knapp | Supabase signIn (COACH-rolle) | Finnes |
| «AgencyOS-konto? Logg inn her» | AgencyOS-tab (inlines) | Finnes |

**Datakilde:**
- Supabase auth — ingen Prisma direkte i login-flyt.
- Onboarding: `onboarding/actions.ts` → `prisma.user.create()` med rolle.

**Kit-komponenter:**
`AuthCard` (lys + mørk variant), Tabs (PlayerHQ/AgencyOS), `WizardShell` (4 steg), `Button` (primary), `GoalProgress` (steg-indikator), Input

---

#### A-2 — Auth Reset Passord (forgot → check-email → reset)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Auth Reset Passord (hybrid).dc.html` |
| **Mål page.tsx** | `src/app/auth/forgot-password/page.tsx`, `src/app/auth/check-email/page.tsx`, `src/app/auth/reset-password/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — alle 3 finnes |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Send tilbakestillingslenke» | `server action → Supabase resetPasswordForEmail` | Finnes (forgot-skjerm.tsx) |
| «Send på nytt» (check-email) | Same server action med e-post fra state | MÅ kobles — verifiser at check-email-siden har «Send på nytt»-knapp |
| «Tilbake til innlogging» | `/auth/login` | MÅ kobles |
| Reset-password-form (steg 3) | `server action → Supabase updateUser` | Finnes (reset-password/page.tsx) |

**Datakilde:** Kun Supabase auth — ingen Prisma.

**Kit-komponenter:**
`AuthCard` (variant), `Button` (primary «Send», sekundær «Tilbake»), Input (e-post, passord)

**Merknad:** Reset-password-skjermen (`/auth/reset-password`) er DELVIS i handoffen — porte som ny side med passord-input + bekreft-passord.

---

#### A-3 — Auth Onboarding (wizard 4 steg)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Auth Innlogging (hybrid).dc.html` (wizard-seksjonen) |
| **Mål page.tsx** | `src/app/auth/onboarding/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Neste» per steg (1–4) | Intra-wizard state | Finnes (`onboarding/actions.ts`) |
| «Ferdig» (steg 4) | `/portal` | Finnes |
| «Hopp over» (valgfrie steg) | Neste steg | MÅ kobles — uklart om alle steg har «hopp over» |

**Datakilde:**
- `onboarding/actions.ts` → `prisma.user.update()` (rolle, navn, HCP).

**Kit-komponenter:**
`WizardShell`, `GoalProgress` (steg-indikator), `AuthCard`, Input, `Button`

---

#### A-4 — Coach Onboarding

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Auth Innlogging (hybrid).dc.html` (AgencyOS-kort-seksjonen) |
| **Mål page.tsx** | `src/app/onboard/coach/page.tsx` |
| **Tema** | `.dark` (AgencyOS-kort) |
| **Finnes i dag** | Ja |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Opprett coach-konto» | `server action → Supabase signUp` + `prisma.user.create({ role: COACH })` | Finnes |
| «Har allerede konto? Logg inn» | `/auth/login` | MÅ kobles |

**Datakilde:** Supabase auth + `prisma.user.create()`.

**Kit-komponenter:**
`AuthCard` (mørk variant `.dark`), `Button` (primary), Input

---

#### A-5 — Forelder-onboarding (TRENGER-DESIGN → Claude Design AU-1)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen — TRENGER-DESIGN (batch AU-1) |
| **Mål page.tsx** | `src/app/auth/onboarding/forelder/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — stub |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Wizard steg 1–4 «Neste» | Intra-wizard | MÅ implementeres |
| «Ferdig» (steg 4) | `/forelder` | MÅ kobles |
| Steg 2 søk barn: nullresultat | EmptyState «Barn ikke funnet» | MÅ implementeres |

**Datakilde:**
- `prisma.user.findMany({ where: { requiresGuardianConsent: true } })` — søk barn.
- `prisma.parentRelation.create()` ved kobling.

---

#### A-6 — Guardian Consent (invitasjonslenke)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen — TRENGER-DESIGN (batch AU-1) |
| **Mål page.tsx** | `src/app/auth/guardian-consent/[token]/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — full implementering med `confirmGuardianConsent()` |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Godta» | `server action → confirmGuardianConsent({ token, guardianName })` → `/forelder` eller `/auth/signup` | Finnes (full server action) |
| «Avslå» | `/` (eller steng tab) | MÅ kobles — ingen avslå-action i dag |
| Token ugyldig/utløpt | EmptyState «Kontakt coachen» | MÅ implementeres |

**Datakilde:**
- `prisma.parentInvitation.findUnique({ where: { token } })` — finnes.
- `confirmGuardianConsent()` i `guardian-consent/[token]/actions.ts` — fullstendig implementert.

**Kit-komponenter (for AU-1):**
`AuthCard`, `SettingsList` (samtykke-punkter), `Button` (primær «Godta», sekundær «Avslå»), `Avatar`, EmptyState

---

#### A-7 — Samtykke venter

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen — TRENGER-DESIGN (batch AU-1) |
| **Mål page.tsx** | `src/app/auth/samtykke-venter/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — stub |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Send på nytt» | `server action → resend invitation email` | MÅ implementeres — ingen re-send action i dag |
| Auto-redirect ved godkjenning | `/portal` | MÅ implementeres (polling eller realtime) |

**Datakilde:**
- `prisma.parentInvitation.findFirst({ where: { playerId: user.id, acceptedAt: null } })`.
- `PulseDot` (vente-animasjon).

**Kit-komponenter (for AU-1):**
`AuthCard`, `Button` (sekundær «Send på nytt»), `PulseDot`, EmptyState

---

#### A-8 — Klubb-onboarding (TRENGER-DESIGN → Claude Design AU-2)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen — TRENGER-DESIGN (batch AU-2) |
| **Mål page.tsx** | `src/app/onboard/klubb/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — med `onboard/klubb/actions.ts` |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| Wizard steg 1–4 «Neste» | Intra-wizard | `onboard/klubb/actions.ts` finnes |
| «Ferdig» (steg 4) | `/admin` | MÅ kobles |

**Datakilde:** `prisma.user.create()` + `prisma.location.create()` (Location-modell finnes).

---

#### A-9 — Forelder-invitasjonslenke (TRENGER-DESIGN → Claude Design AU-2)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | Ingen — TRENGER-DESIGN (batch AU-2) |
| **Mål page.tsx** | `src/app/inviter/forelder/[token]/page.tsx` |
| **Tema** | Lyst |
| **Finnes i dag** | Ja — stub |

**Knapper / handlinger:**

| Knapp/handling | Destinasjon | Status |
|---|---|---|
| «Opprett konto» | `/auth/signup?role=forelder&token=[token]` | MÅ kobles |
| «Jeg har allerede konto» | `/auth/login?redirect=/forelder` | MÅ kobles |
| Token ugyldig | EmptyState «Kontakt coach» | MÅ implementeres |

**Datakilde:**
- `prisma.parentInvitation.findUnique({ where: { token } })` — finnes.

---

## Forelderportal bunnav — FELLES MÅ-KOBLE

Bunnavigasjonen med 4 faner (Hjem / Barn / Bookinger / Fakturaer) gjelder alle 6 forelderportal-sider.
I dag er bunnav-komponenten ikke synlig i alle sider. Sjekk `src/components/forelder/sidebar.tsx` og `forelder-hjem.tsx`.

| Fane | Rute | Aktiv på |
|---|---|---|
| Hjem | `/forelder` | F-1 |
| Barn | `/forelder/barn` | F-2, F-6 (ukerapport) |
| Bookinger | `/forelder/bookinger` | F-3 |
| Fakturaer | `/forelder/fakturaer` | F-4 |

Samtykke (`/forelder/samtykke`) og Ukerapport (`/forelder/ukerapport`) er IKKE i bunnav — separat inngang.

---

## Døde knapper som MÅ kobles ved porting

Samlet liste (prioritert — de som er mest foreldreportal/marketing-kritiske øverst):

| # | Knapp / handling | Fra side | MÅ peke til |
|---|---|---|---|
| 1 | «Prøv gratis» / PlayerHQ-seksjon | Marketing Hjem | `/auth/signup` |
| 2 | «Les mer» per coaching-pakke | Marketing Hjem | `/(marketing)/coaching` |
| 3 | «Se cases» / suksesshistorier | Marketing Hjem | `/(marketing)/cases` |
| 4 | «Coacher» / team-seksjon | Marketing Hjem | `/(marketing)/coacher` |
| 5 | Alle topnav-lenker (Coaching/Priser/PlayerHQ/Coacher/Kontakt) | Marketing Hjem | Respektive ruter |
| 6 | «Book coaching» / CTA | Marketing Cases | `/(marketing)/booking` |
| 7 | «Book time med [coach]» per coach-kort | Marketing Coacher | `/(marketing)/booking?trener=[slug]` |
| 8 | «Book tid her» (anlegg-seksjon) | Marketing Coacher | `/(marketing)/booking?lokasjon=[slug]` |
| 9 | Suksess-tilstand etter kontaktskjema | Marketing Kontakt | Inline-banner (ny) |
| 10 | Bunnav Hjem → Barn → Bookinger → Fakturaer | Alle forelder-sider | Respektive ruter |
| 11 | «Se alle bookinger» | Forelder Hjem | `/forelder/bookinger` |
| 12 | «Se ukerapport» | Forelder Hjem | `/forelder/ukerapport` |
| 13 | Filter-chips (Kommende/Historikk/Turnering) | Forelder Bookinger | Filter-state (ikke navigasjon) |
| 14 | «Last ned PDF» per faktura | Forelder Fakturaer | Stripe invoice-URL via `lib/stripe.ts` |
| 15 | «Forrige/Neste uke» uke-nav | Forelder Ukerapport | `?uke=[N]` query-param |
| 16 | GDPR «Slett data» | Forelder Samtykke | Server action (ny — finnes ikke) |
| 17 | «Avslå» samtykke-invitasjon | Guardian Consent | Server action avslå (finnes ikke) |
| 18 | «Send på nytt» invitasjon | Samtykke venter | Server action re-send (finnes ikke) |
| 19 | «Opprett konto» | Forelder-invitasjonslenke | `/auth/signup?role=forelder&token=[token]` |
| 20 | «Jeg har allerede konto» | Forelder-invitasjonslenke | `/auth/login?redirect=/forelder` |
| 21 | «Tilbake til innlogging» | Auth Reset Passord | `/auth/login` |
| 22 | «Send på nytt» reset-e-post | Auth Check Email | Same server action (verifiser tilstand) |
| 23 | «Hopp over» valgfrie wizard-steg | Auth Onboarding | Neste steg (verifiser at alle steg har det) |
| 24 | «Har allerede konto? Logg inn» | Coach Onboarding | `/auth/login` |
| 25 | «Booking bekreftet: Legg til kalender» | Booking kvittering | Google/Apple kalender-lenke (ny) |
| 26 | «Til forsiden» | Booking kvittering | `/` |
| 27 | «Opprett gratis konto» | Booking kvittering | `/auth/signup` |

**Totalt: 27 identifiserte døde / ukoblede knapper.**

---

## Nyttige eksisterende actions / lib-filer

| Fil | Innhold | Brukes av |
|---|---|---|
| `src/app/(marketing)/booking/actions.ts` | `cancelBooking()`, `rescheduleBooking()` | Booking kvittering |
| `src/app/forelder/samtykke/actions.ts` | `lagreSamtykker()` | Forelder Samtykke |
| `src/app/auth/guardian-consent/[token]/actions.ts` | `confirmGuardianConsent()` | Guardian Consent |
| `src/app/auth/onboarding/actions.ts` | Onboarding-wizard actions | Auth Onboarding |
| `src/app/onboard/klubb/actions.ts` | Klubb-onboarding actions | Klubb Onboarding |
| `src/lib/forelder.ts` | `hentBarnForForelder()`, `hentForelderOversikt()` | Alle forelder-sider |
| `src/lib/google-calendar.ts` | GCal-tilgjengelighet (fail-closed) | Booking tidspunkt-velger |
| `src/lib/stripe.ts` | Stripe-klient | Booking + Fakturaer |

---

## Prisma-modeller brukt

| Modell | Linjenr (schema.prisma) | Brukes av |
|---|---|---|
| `ParentInvitation` | 642 | Guardian Consent, Samtykke venter, Forelder-invitasjon |
| `ParentRelation` | 662 | Alle forelder-sider |
| `Location` | 702 | Booking, Coacher (anlegg) |
| `Booking` | 718 | Forelder Bookinger, Marketing Booking-flyt |
| `Facility` | 2311 | Anlegg-sider (TRENGER-DESIGN) |
| `User` (PARENT/COACH) | — | Auth-flyter, forelder-sider |
| `Invoice` | — (verifiser) | Forelder Fakturaer |
| `ServiceType` | — | Marketing Booking startside |

---

## Skjermer ikke inkludert (utenfor scope for dette kartet)

Disse er NY-HYBRID for **Marketing** men mangler `.dc.html` (TRENGER-DESIGN — sendes til Claude Design):
- `/(marketing)/coaching`, `/priser`, `/playerhq`, `/junior` → Claude Design batch MA-1
- `/(marketing)/om-oss`, `/faq`, `/jobb`, `/treningsfilosofi` → Claude Design batch MA-2
- `/(marketing)/anlegg`, `/anlegg/[slug]` → Claude Design batch MA-3
- `/(marketing)/blogg`, `/blogg/[slug]` → Claude Design batch MA-4
- `/(marketing)/turneringer`, `/turneringer/[slug]` → Claude Design batch MA-5
- `/(marketing)/cookies`, `/personvern`, `/vilkar` → Claude Design batch MA-7
- `/auth/onboarding/forelder`, `/auth/guardian-consent/[token]`, `/auth/samtykke-venter` → Claude Design batch AU-1
- `/onboard/klubb`, `/inviter/forelder/[token]` → Claude Design batch AU-2
- `/forelder/varsler`, `/forelder/innstillinger`, `/forelder/coach` → Claude Design batch FO-1
