# 11 — Routes & Auth

Next.js App Router-struktur + rolle-guards for hele plattformen.

---

## Roller (UserRole enum)

| Rolle | Beskrivelse | Standard rute |
|---|---|---|
| `PLAYER` | Spiller (Pro eller Gratis) | `/portal` |
| `COACH` | Coach | `/admin` |
| `ADMIN` | Head Coach + admin-rettigheter | `/admin` |
| `PARENT` | Forelder med koblet barn | `/forelder` |
| `GUEST` | Begrenset tilgang (kalender-bare) | `/admin/kalender` |

---

## Rolle-guard-matrise

### PlayerHQ (`/portal/*`)
- **Tillatte roller:** `PLAYER`
- **Hva skjer hvis annet:**
  - `COACH`/`ADMIN` → redirect til `/admin`
  - `PARENT` → redirect til `/forelder`
  - `GUEST` → redirect til `/admin/kalender`
  - Ingen rolle → redirect til `/auth/login`

### CoachHQ (`/admin/*`)
- **Tillatte roller:** `COACH`, `ADMIN`
- **Spesielle ruter:**
  - `/admin/settings/*` → kun `ADMIN`
  - `/admin/agents/*` → kun `ADMIN`
  - `/admin/audit-log/*` → kun `ADMIN`
  - `/admin/team` → kun `ADMIN`

### Foreldreportal (`/forelder/*`)
- **Tillatte roller:** `PARENT`
- **Krav:** Må ha minst 1 koblet barn (via ParentRelation)
- **Hvis ingen barn:** Vis "Vent på invitasjon"-side

### Auth (`/auth/*`)
- Offentlig — alle kan se
- `robots: noindex` (krever ikke offentlig SEO)

### Marketing (`/`, `/(marketing)/*`)
- Offentlig
- `/(marketing)/booking/*` — kan bookes uten auth (gjest-flyt)
- SEO-optimalisert

---

## Komplett rute-struktur

```
src/app/
├── (marketing)/                 # Public marketing
│   ├── page.tsx                 # Forside
│   ├── booking/
│   │   ├── [slug]/page.tsx      # Tjeneste-detalj
│   │   └── kvittering/[bookingId]/page.tsx
│   ├── coacher/
│   │   ├── page.tsx             # Coach-liste
│   │   └── [slug]/page.tsx      # Coach-profil
│   ├── turneringer/
│   │   ├── page.tsx             # Norske golf-turneringer (NGF + DataGolf)
│   │   └── [slug]/page.tsx
│   ├── anlegg/[slug]/page.tsx
│   ├── blogg/[slug]/page.tsx
│   ├── stats/sg-sammenlign/     # SG-sammenlign-verktøy
│   ├── personvern/page.tsx
│   ├── vilkar/page.tsx
│   └── cookies/page.tsx

├── auth/
│   ├── layout.tsx               # robots noindex
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── verify-email/page.tsx
│   ├── callback/route.ts        # OAuth callback
│   ├── onboarding/
│   │   ├── page.tsx             # Spiller-onboarding
│   │   └── forelder/page.tsx    # Forelder-onboarding
│   ├── guardian-consent/[token]/page.tsx
│   ├── samtykke-venter/page.tsx
│   └── bekreft/page.tsx

├── onboard/
│   ├── spiller/page.tsx
│   ├── coach/page.tsx           # Coach-onboarding 4 steg
│   └── klubb/page.tsx           # Klubb-onboarding 5 steg

├── portal/                      # PlayerHQ (auth: PLAYER)
│   ├── layout.tsx               # Sidebar + topbar
│   ├── page.tsx                 # Workbench
│   ├── planlegge/
│   ├── gjennomfore/
│   ├── analysere/
│   ├── coach/
│   ├── talent/
│   ├── meg/                     # Profil + innstillinger
│   ├── booking/
│   ├── tren/                    # FYS-plan, drills, tester
│   ├── mal/                     # SG-hub, runder, mål
│   ├── (fullscreen)/            # Ingen sidebar/topbar
│   │   ├── live/[sessionId]/
│   │   └── test/[testId]/
│   ├── varsler/page.tsx
│   └── reach/page.tsx

├── admin/                       # CoachHQ (auth: COACH/ADMIN)
│   ├── layout.tsx               # Sidebar + topbar
│   ├── page.tsx                 # Redirect til /agencyos
│   ├── agencyos/
│   │   ├── page.tsx             # Hovedside (5 tabs)
│   │   ├── caddie/
│   │   └── ...
│   ├── stall/page.tsx           # Hub
│   ├── spillere/
│   ├── grupper/
│   ├── talent/
│   ├── planlegge/page.tsx       # Hub
│   ├── plans/
│   ├── tournaments/
│   ├── drills/
│   ├── gjennomfore/page.tsx     # Hub
│   ├── kalender/
│   ├── bookinger/
│   ├── anlegg/
│   ├── analysere/page.tsx       # Hub
│   ├── tester/
│   ├── godkjenninger/
│   ├── lag-snitt/
│   ├── organisasjon/page.tsx    # Hub
│   ├── team/
│   ├── settings/
│   ├── integrasjoner/
│   ├── agents/                  # AI-agenter
│   ├── audit-log/
│   ├── coach-workbench/page.tsx # NY individuell coach-flate
│   └── workspace/

├── forelder/                    # Foreldreportal (auth: PARENT)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── barn/[childId]/page.tsx
│   ├── bookinger/page.tsx
│   ├── coach/page.tsx
│   ├── okonomi/page.tsx
│   └── innstillinger/page.tsx

├── inviter/
│   └── forelder/[token]/page.tsx

├── (internal)/                  # Kun ADMIN-rolle
│   ├── layout.tsx               # Auth-gate
│   ├── design-system/page.tsx
│   ├── detail-pattern-demo/page.tsx
│   └── demos/                   # Alle demo-ruter
│       ├── newplan/[steg]/
│       ├── ny-okt/[steg]/
│       ├── plan-bygger/[steg]/
│       └── trackman-import/[steg]/

└── api/                         # API routes
    ├── upload/route.ts
    ├── cron/[agent]/route.ts
    ├── push/subscribe/route.ts
    ├── notion/oauth/...
    └── admin/...
```

---

## Auth-flow

### 1. Innlogging
```
/auth/login → POST credentials
→ Suppabase Auth verifies
→ Cookie satt
→ Redirect basert på rolle:
   PLAYER → /portal
   COACH/ADMIN → /admin
   PARENT → /forelder
   GUEST → /admin/kalender
```

### 2. Onboarding (ny bruker)
```
/auth/signup → opprett Supabase auth + Prisma User
→ E-post-verifisering sendt
→ Bruker klikker link → /auth/verify-email
→ Redirect til /onboard/spiller
→ Wizard (8 steg)
→ Profile.onboardingCompleted = true
→ Redirect til /portal
```

### 3. Foreldresamtykke (<16 år)
```
Ungdom registrerer → Profile.requiresGuardianConsent = true
→ Trigger: ParentInvitation opprettes
→ E-post sendt til foreldre
→ Foreldre klikker link → /auth/guardian-consent/[token]
→ Foreldre godkjenner (eller avslår)
→ Profile.guardianConsentGivenAt = now()
→ Ungdom kan nå logge inn
```

### 4. Glemt passord
```
/auth/forgot-password → e-post sendt med reset-link
→ Bruker klikker link → /auth/reset-password
→ Nytt passord → Supabase Auth updates
→ Redirect til /auth/login
```

### 5. 2FA (TOTP)
```
/portal/meg/sikkerhet/2fa → start enroll
→ QR-kode + secret vises
→ Bruker scanner med authenticator app
→ Input 6-sifret kode → verify
→ Backup-koder vises
→ Faktoren markeres som verified
```

---

## Server-side auth-helpers

```ts
// src/lib/auth/requirePortalUser.ts
export async function requirePortalUser(opts?: {
  allow?: UserRole[];
}): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (opts?.allow && !opts.allow.includes(user.role)) {
    redirect(roleHomeRoute(user.role));
  }
  return user;
}

// Bruk i page.tsx:
const user = await requirePortalUser({ allow: ["PLAYER"] });
// Hvis brukeren ikke er PLAYER → redirect til riktig hjem-rute
```

---

## Middleware (src/proxy.ts)

Next.js 16 har omdøpt `middleware.ts` til `proxy.ts`. Den kjører på hver request og refresher Supabase sesjon.

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}
```

---

## URL-state og deeplinking

### Coach Workbench
```
/admin/coach-workbench
?modus=individuelt|gruppe
&spiller=<spillerId>
&gruppe=<gruppeId>
&tab=idag|plan|analyse|notater|kommunikasjon
```

### PlayerHQ
```
/portal/tren/turneringer/[id]?tab=resultater
/portal/mal/runder?period=siste-30d
```

### Global søk
```
/portal/?search=open  → trigger Cmd+K modal ved page load
```

---

## Redirects (i next.config.ts)

```ts
async redirects() {
  return [
    { source: "/admin/elever", destination: "/admin/spillere", permanent: true },
    { source: "/admin/elever/:path*", destination: "/admin/spillere/:path*", permanent: true },
    // ... 17 redirects totalt for slettede duplikater
  ];
}
```

---

## API-rate-limiting

Vercel Edge rate-limit (planlagt — ikke implementert ennå):
- `/auth/*` → 60 requests/min per IP
- `/api/booking/*` → 10 requests/min per IP
- `/api/admin/*` → 100 requests/min (krever auth)
