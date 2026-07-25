# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ) med Supabase Postgres. Alt av forretningslogikk er norsk bokmål.

## Start her — les disse filene først
- **`docs/platform/NORDSTJERNE.md`** — produktets nordstjerne. Alltid gjeldende målbilde.
- **`docs/platform/STATUS-NÅ.md`** — hva er levert/ikke levert akkurat nå.
- **`docs/MASTER-SKJERMPLAN.md`** — autoritativ liste over hver skjerm + 6 haker (Design · Mobil · Desktop · Koblet til ektedata · Test flyt · Verdi).
- **`docs/platform/BUSINESS-RULES.md`** — forretningsregler som ikke kan utledes fra kode (abonnement, booking, GDPR, dual-track, demo-data, tema m.fl.).
- **`docs/platform/DATA-FLOW.md`** — komplett datamodell (tabeller, felter, relasjoner, server actions, API).
- **`docs/platform/AGENTIC-OS.md`** — agent-systemet: regler, hooks, kommandoer, prosjektkart.
- **`docs/platform/TESTING.md`** — testinfrastruktur og plan.

## Detaljerte regler (`.claude/rules/`)
- `arkitektur.md` — produkter, ruter, mappestruktur.
- `gotchas.md` — kjente feller (Prisma 7, Next.js 16 proxy, Supabase pooler, zod). Les FØR koding.
- `beslutninger.md` — ALLE låste beslutninger (juni–juli 2026): invarianter-aldri-sperrer, AgencyOS-navnet, navne-kanon, Workbench-planlegging, analyse-samling, abonnement 299/gratis, FYS-avventing. **Designlåser er bevisst tømt 2026-07-25** — nytt komplett designsystem utvikles i Open Design; ingen designkanon er låst inntil videre. Les FØR produktbeslutninger — ved konflikt vinner `docs/platform/BUSINESS-RULES.md`.

## Harde invarianter (brytes aldri)
1. **Anbefalinger sperrer aldri:** ingenting i appen blokkerer trening. Aldri «kan ikke brytes»-kode/tekst.
2. ~~Farger kun fra designtokens~~ **(fjernet 2026-07-25):** hex-gate og 8pt-grid er avviklet — nytt
   designsystem utvikles i Open Design. Farge- og spacingvalg er fritt inntil det landes.
3. **Norsk bokmål i all UI-tekst.**
4. **Lucide-ikoner** — aldri emoji i UI. Kun `ui/`-primitiver + `golfdata/`-komponenter + v2-mønstre.
5. **Domenelogikk kun i `src/lib/domain/`** — aldri i komponenter.
6. **`as unknown as T` er forbudt** for forretningskritiske data — bruk zod-schemas (`lib/validation/`).
7. **`main` er porten.** Arbeid skjer i branch + PR. **Aldri push til main uten eksplisitt «ja» fra Anders** —
   unntak: dokument-/regelendringer Anders eksplisitt har bedt om i samtalen kan gå rett til main.
   (Håndheves av PreToolUse-hook: `git push` blokkeres til bekreftelse, alt på main blokkeres alltid.)
8. **Enkelhet (2026-07-21):** behold alle funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å forstå = feil design. (Produktprinsipp — uavhengig av hvilket designsystem som gjelder.)

## MASTER-SKJERMPLAN (produktplanen)

`docs/MASTER-SKJERMPLAN.md` er den autoritative listen over hver skjerm som skal bygges/kobles. Hver rad har
6 haker: Design · Mobil · Desktop · Koblet til ektedata · Test flyt · Verdi.

Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i SAMME commit. En skjerm er
ikke ferdig før alle 6 er grønne. Oppdater dashboard-tallene + endringsloggen når du fullfører/endrer skjermer.

## Stack
- Next.js 16.2.6 (App Router, Turbopack, TS strict) + React 19 + Vercel.
- Prisma 7 + Supabase Postgres (RLS) — Supabase Auth (Google + e-post/passord).
- Tailwind CSS v4 (CSS-first `@theme`, ingen config-fil) — uttrykk via `globals.css`.
- Inter + Familjen Grotesk (display) + JetBrains Mono via `next/font/google`. Inter Tight er deprecated — lastes kun for legacy-flater. Lucide React — eneste ikon-bibliotek. npm.
- Serwist (`@serwist/next`, `sw.ts`, App Router-støtte, `register: true` default i runtime) — PWA med offline.
- Stripe (checkout/portal/webhook), Resend (e-post), Anthropic AI (ai-coach/ai-plan), DataGolf (PGA-data), web-push, Mapbox (banekart), Google Calendar/Gmail/Drive + Notion (OAuth).

## Mappestruktur
```
src/
├── app/            # App Router
│   ├── page.tsx              # Marketing (landing)
│   ├── (marketing)/          # Offentlige sider (layout med markeds-header)
│   ├── auth/                 # login/signup/callback/onboarding
│   ├── portal/               # PlayerHQ (spiller-appen)
│   │   ├── (legacy)/         # V13-flater under migrering til v2 (route groups: (golf) (sport) (dev))
│   │   └── …v2-hovedflater   # Hjem/planlegge/gjennomføre/analysere/meg
│   ├── admin/                # AgencyOS (coach/admin)
│   ├── forelder/             # Foreldreportal (lese-først)
│   ├── booking/              # Booking-flyt (klient/stripe retur)
│   ├── api/                  # REST-endepunkter (cron, webhooks, trackman, booking, public)
│   └── layout.tsx            # Fonts, metadata, PWA-manifest
├── components/     # ui/ (primitiver) · v2/ (kanon) · marketing/ · shared/
│                   # (golfdata+legacy borte Fase 4–5, se docs/opprydding/) · layout/ · ui-v2/
├── lib/            # domain/ (ferdigheter) · auth · db.ts · stripe · resend · validations
├── proxy.ts        # Next 16 «middleware» — auth-guards (proxy.ts, ikke middleware.ts)
└── app/globals.css # Tailwind v4-tema
prisma/
├── schema.prisma   # User · TrainingPlan · TrainingPlanSession · Round → Shot → HoleScore ·
│                   # Subscription · Booking · Lead · CoachAvailability · TestDefinition/TestResult ·
│                   # DrillMal/OktMal · TrackManSession/TrackManShot · SeasonPlan · PeriodBlock
├── migrations/     # Kjørte SQL-migrasjoner
├── seed.ts         # Utviklingsseed (demo-spiller)
└── seed-screentest.ts # Skjermbilde-spiller (Øyvind Rohjan, screentest@akgolf.test)
scripts/            # seed-screentest · seed-screentest-coach · drill-qa · retag-drill-kategorier
docs/               # design/ (Claude Code-mockups) · skjermtekst/ (copy-kilde) · platform/ · metode/ · process/
e2e/                # Playwright e2e + rapporter (auth-guard, portal, admin, mobil, api-contract)
```

## Arbeidsregler
1. **Ikke be om tillatelse for små endringer** — typoverifisering, lint, feilretting.
2. **Be Anders før:** dependencies, DB-migrasjoner (`prisma migrate dev` KUN på Anders' eksplisitte forespørsel), rute-endringer som fjerner URLer, nye features, større refaktoreringer.
3. **Kjør alltid typecheck + lint før commit:** `npm run build` (eller `tsc --noEmit` + `eslint src`); denne repoen må bygge rent uten warnings.
4. **Git:** branch (`feature/...`, `fix/...`) → commit → push (uten å spørre) → åpne PR og spør Anders om main.
   (Unntak: dokument-/regelendringer Anders eksplisitt har bedt om kan gå rett til main.)
5. **Token-filer:** ingen låst token-kanon per nå (designlåser tømt 2026-07-25) — men ikke opprett nye parallelle token-systemer; vent på Open Design.
6. **Følg gotchas-listen** (`.claude/rules/gotchas.md`) — Prisma 7 driver adapter, `pg.Pool`, zod ved API-grenser, norsk dato/valuta, proxy.ts ikke middleware.ts.

## Verifikasjons-pipeline
```bash
npm run verify                       # FULL sjekk før commit (prisma validate+generate, tsc --noEmit,
                                      # eslint --quiet, action-auth-gate, build)
```
Tilsvarer: `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src && node scripts/check-action-auth.mjs && npm run build`.
`npm run dev` skal starte uten warnings.

## Tester
- Enhetstester: `npm test` (node:test + tsx, `src/lib/**/*.test.ts`) — domenelogikk (sg, hcp, ak-kategori, fys-score, plan-builder m.fl.).
- e2e: `npm run test:e2e` (Playwright, `e2e/`) — auth-guard, IDOR, portal, admin, mobil, PWA, a11y.
- CI kjører begge — se `.github/workflows/ci.yml`.

## CI/CD
- **`ci.yml`** kjører på hver PR og push til main: `prisma generate` → `tsc --noEmit` → `eslint` →
  action-auth-gate → enhetstester → `npm run build` → Playwright e2e. Dummy env-verdier — trenger ingen
  secrets. Playwright-browser-caches for fart.
- **Vercel:** git-integrasjon på `main` (produksjon) og PR (preview). Push til `main` deployer automatisk —
  ALDRI `vercel deploy --prod` manuelt (har overskrevet prod med feil branch). Erstatter den gamle
  `deploy.yml`-pipelinen (fjernet 10. juli 2026).

Hooks i `.claude/settings.json` håndhever dette deterministisk (blokkerer sensitive filer,
krever bekreftelse for schema/main, kjører eslint etter edits) — se `.claude/hooks/`.

## Agenter
Se `docs/platform/AGENTIC-OS.md` for full oversikt. Kjernen:
- **Kommando** (`/kommando`) — chat med alle agenter (autonomi 1–3, KommandoTask DB-persistert).
- **Cron-agenter** — 50+ spesialiserte agenter (`src/lib/agents/`), trigges via `/api/cron/[agent]`.
- **AGENT-BRIEF.md** — agent-onboarding (skal leses av enhver ny agent før arbeid).
- **Ingen agent endrer kode direkte** — agenter produserer forslag til PR; menneske merger.

## Secrets
Alle i `.env.local` (gitignored) + Vercel env. ALDRI commit secrets — ikke engang midlertidig.
Rotasjon: se `docs/process/SECRETS.md`.
