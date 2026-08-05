# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ) med Supabase Postgres. Alt av forretningslogikk er norsk bokmål.

> Stistrukturen under er verifisert mot filsystemet 2026-07-26. Ved tvil: sjekk filen faktisk finnes
> før du stoler på en lenke — dokumentkartet har flyttet på seg flere ganger.

## Start her — les disse filene først
- **`docs/platform/NORDSTJERNE.md`** — produktets nordstjerne. Alltid gjeldende målbilde.
- **`docs/platform/AGENT-BRIEF.md`** — agent-onboarding: stack, eksakte versjoner, prosjektkart. Les FØR arbeid.
- **`docs/STATUS-NÅ.md`** — hva er levert/ikke levert akkurat nå. (Ligger i `docs/`, ikke `docs/platform/`.)
- **`docs/MASTER-SKJERMPLAN.md`** — autoritativ liste over hver skjerm + 6 haker (Design · Mobil · Desktop · Koblet til ektedata · Test flyt · Verdi).
- **`docs/platform/BUSINESS-RULES.md`** — forretningsregler som ikke kan utledes fra kode (abonnement, booking, GDPR, dual-track, demo-data, tema m.fl.).
- **`docs/platform/DATA-MODEL.md`** — datamodell (tabeller, felter, relasjoner, server actions, API).
- **`docs/testing.md`** — testinfrastruktur og plan.
- **`docs/runbook.md`** — driftsrunbook (inkl. §2.5 «kompromittert secret» og rotasjonsliste).

## Detaljerte regler (`.claude/rules/`)
Sju filer, alle aktive: `arkitektur.md` (produkter, ruter, mappestruktur) · `gotchas.md` (kjente feller —
**les FØR koding**) · `beslutninger.md` (låste beslutninger juni–juli 2026) · `mulligan-drift.md` ·
`wang-toppidrett.md` · `gfgk-junior.md` · `admin-tripletex.md` (de fire siste er Anders' virksomhets-domener,
ikke kode).

`beslutninger.md` dekker: invarianter-aldri-sperrer, AgencyOS-navnet, navne-kanon, Workbench-planlegging,
analyse-samling, abonnement 299/gratis, FYS-avventing. **Designport-sperrer (LÅST 2026-08-04):**
les `docs/port/sperre-og-beslutninger.md` før AgencyOS-konsoll / nye tokens / `/traad`.
**Design (LÅST 2026-08-04):** Claude Paper 1:1 er fasit for all skjerm-port
(`designsystem/paper/fase1/` + tokens). Pilot-unntaket «bare v2 + oransje» er opphevet for
designport-arbeid. Operativ lås (P0/KOMMER-kommandoer, `/traad`-eierskap, schema-hull):
`docs/port/sperre-og-beslutninger.md`. Ved produktkonflikt vinner `docs/platform/BUSINESS-RULES.md`.

## Harde invarianter (brytes aldri)
1. **Anbefalinger sperrer aldri:** ingenting i appen blokkerer trening. Aldri «kan ikke brytes»-kode/tekst.
2. **Design tidsplan (2026-07-31, OVERSTYRT 2026-08-03):** Anders overstyrte eksplisitt «full Paper-port
   først etter pilot» — full porten kjører nå, skjerm for skjerm, per `docs/port/plan-designport-alle-skjermer.md`
   (steg 1–6 + steg 7 PR1 i main, steg 7 PR2+ pågår). Hex-gaten for Presis forblir borte — ikke gjenopprett
   uten ny beslutning.
3. **Norsk bokmål i all UI-tekst.**
4. **Lucide-ikoner** — aldri emoji i UI. Primitiver fra `components/ui/` + `v2/`-mønstre.
5. **Domenelogikk kun i `src/lib/domain/`** — aldri i komponenter.
6. **`as unknown as T` er forbudt** for forretningskritiske data — bruk zod-schemas (`src/lib/validation/schemas.ts`).
7. **`main` er porten.** Arbeid skjer i branch + PR. **Aldri push til main uten eksplisitt «ja» fra Anders** —
   unntak: dokument-/regelendringer Anders eksplisitt har bedt om i samtalen kan gå rett til main.
   (Håndheves av PreToolUse-hook — se Hooks under.)
8. **Enkelhet (2026-07-21):** behold alle funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å
   forstå = feil design. (Produktprinsipp — uavhengig av hvilket designsystem som gjelder.)

## MASTER-SKJERMPLAN (produktplanen)

`docs/MASTER-SKJERMPLAN.md` er den autoritative listen over hver skjerm som skal bygges/kobles. Hver rad har
6 haker: Design · Mobil · Desktop · Koblet til ektedata · Test flyt · Verdi.

Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i SAMME commit. En skjerm er
ikke ferdig før alle 6 er grønne. Oppdater dashboard-tallene + endringsloggen når du fullfører/endrer skjermer.

## Stack
- **Next.js 16.2.6** (App Router, Turbopack, TS strict) + **React 19.2.4** + Vercel. Node 24 i CI.
- **Prisma 7.8** + `@prisma/adapter-pg` + **Supabase** Postgres (RLS) — Supabase Auth (Google + e-post/passord).
- **Tailwind CSS v4** (CSS-first `@theme`, ingen config-fil) — uttrykk via `src/app/globals.css`.
- **Fonter:** Inter (UI/brødtekst) + Familjen Grotesk (eneste display-font) + JetBrains Mono (KPI/tabulære tall),
  alle via `next/font/google`. **Inter Tight er fjernet** (Fase 3, 2026-07-07) — ikke gjeninnfør.
- **Lucide React** — eneste ikon-bibliotek. **npm** — pakkebehandler.
- **Serwist 9** (`@serwist/next` + `@serwist/cli`) — PWA/offline. SW bygges av et eget `serwist build`-steg
  ETTER `next build` (se `serwist.config.mjs` + gotchas: Turbopack kjører aldri webpack-pluginen).
- **zod 4** (validering), **Recharts** (grafer), **@dnd-kit** (drag-drop i Workbench), **date-fns**, **rrule**,
  **sonner** (toasts), **MDX** (`@next/mdx`, blogg), **@react-pdf/renderer** (PDF-eksport).
- **Integrasjoner:** Stripe (checkout/portal/webhook), Resend (e-post), Anthropic (`@ai-sdk/anthropic` + AI SDK 6),
  OpenAI, DataGolf (PGA-data), web-push, Mapbox (banekart), Google Calendar/Gmail/Drive (`googleapis`) + Notion,
  Upstash Redis (rate limiting), Vercel Blob (filer), Vercel Analytics/Speed Insights.
- **Testramme:** `node:test` via `tsx --test` + Playwright. **vitest er IKKE installert.**

## Mappestruktur

Størrelsesorden: ~449 `page.tsx`-ruter, ~161 filer med server actions, 158 Prisma-modeller, 81 migrasjoner,
110 enhetstest-filer, 54 agent-filer. Sjekk filsystemet før du oppretter nye ruter — det finnes flere
top-level-mapper enn de fire «offisielle» produktene.

```
src/
├── app/            # App Router — ~449 ruter
│   ├── page.tsx              # Marketing (landing)
│   ├── (marketing)/          # Offentlige sider (layout med markeds-header)
│   ├── (internal)/           # Interne demoer/labs — ikke prod-flater
│   ├── auth/  onboard/  inviter/   # Auth-flyter, onboarding, invitasjoner
│   ├── portal/               # PlayerHQ (spiller-appen)
│   │   ├── (legacy)/         # Eldre flater under migrering
│   │   ├── (fullscreen)/     # Fullskjerm-moduser (live/gjennomføring)
│   │   └── …hovedflater      # planlegge · gjennomfore · analysere · meg · trackman · gameplan m.fl.
│   ├── admin/                # AgencyOS (coach/admin) — agencyos (cockpit), grupper,
│   │                         # godkjenninger, kalender, innboks, finance, agent-team m.fl.
│   ├── forelder/             # Foreldreportal (lese-først)
│   ├── booking-flyt          # /booking under (marketing) + /portal/booking + /admin/bookinger
│   ├── team-wang/  team-gfgk/  gfgk-junior/   # Klubb-/skolespesifikke flater
│   ├── kommando/  meg/  intern/  offline/     # Agent-chat, personlig, intern, PWA-offline
│   ├── api/                  # REST (cron, webhooks, trackman, booking, public)
│   ├── sw.ts                 # Serwist service worker-kilde
│   └── layout.tsx            # Fonter, metadata, PWA-manifest
├── components/
│   ├── ui/                   # 21 primitiver (shadcn-basert): button, dialog, sheet, popover,
│   │                         # dropdown-menu, tabs, toast, input, kpi-card, progress-ring …
│   ├── v2/                   # Delte v2-primitiver (shell, kalender, datavis, hjelp, domene …)
│   ├── athletic/             # Kun to undermapper igjen: golfdata/ (v13, overgangslag) + calendars/
│   ├── shared/               # Utility-komponenter (cookie-banner, cmd-palette, mobile-bottom-nav)
│   └── admin/ portal/ marketing/ forelder/ coachhq/ hubs/ workbench-hybrid/ planlegge-v2/
│       sg-hub/ gameplan/ fys-plan/ teknisk-plan/ turneringer/ kommando/ meg/ …
├── lib/            # domain/ (ferdighetslogikk — SG, hcp, ak-kategori, fys-score, pyramide) ·
│                   # validation/schemas.ts · auth · prisma.ts · stripe · email · agents/ ·
│                   # workbench/ · uke-helpers.ts (Oslo-tid) · scrapers/ · trackman/ · portal-*/ · admin-*/
├── proxy.ts        # Next 16 «middleware» — auth-guards (proxy.ts, IKKE middleware.ts)
└── app/globals.css # Tailwind v4-tema
prisma/
├── schema.prisma   # 158 modeller: User · TrainingPlan(+Session) · Round → Shot → HoleScore ·
│                   # Subscription · Booking · Lead · CoachAvailability · TestDefinition/TestResult ·
│                   # DrillMal/OktMal · TrackManSession/TrackManShot · SeasonPlan · PeriodBlock · KommandoTask …
├── migrations/     # 81 kjørte SQL-migrasjoner
├── sql/  scripts/  seed-data/
└── seed.ts · seed-drills.ts · seed-gfgk-facilities.ts …
scripts/            # Engangs-/driftsscript: seed-screentest*.ts (Øyvind Rohjan) · drill-qa ·
                    # retag-drill-kategorier · check-action-auth.mjs · audit-rls · …
docs/               # platform/ (NORDSTJERNE, AGENT-BRIEF, BUSINESS-RULES, DATA-MODEL, PLATFORM-PRD) ·
                    # design-system/TEMA-LYS-MORK.md (tema i kode) · Paper-fasit: designsystem/paper/fase1/ ·
                    # gdpr/ · juridisk/ · sikkerhet/ · arkiv/
tests/e2e/          # Én samlet e2e-suite (32 specs, siden 2026-08-03): a11y, PWA, ruter, meta/OG,
                    # offline, ikoner + auth-guard, IDOR, booking, workbench (fra gamle e2e/)
```

## Arbeidsregler
1. **Ikke be om tillatelse for små endringer** — typoverifisering, lint, feilretting.
2. **Be Anders før:** dependencies, DB-migrasjoner, rute-endringer som fjerner URLer, nye features, større
   refaktoreringer.
3. **Kjør `npm run verify` før commit** — repoet må bygge rent uten warnings.
4. **Git:** branch (`feature/...`, `fix/...`) → commit → push (uten å spørre) → åpne PR og spør Anders om main.
   (Unntak: dokument-/regelendringer Anders eksplisitt har bedt om kan gå rett til main.)
5. **Token-filer:** ingen låst token-kanon per nå (designlåser tømt 2026-07-25) — men ikke opprett nye
   parallelle token-systemer; vent på Open Design.
6. **Følg gotchas-listen** (`.claude/rules/gotchas.md`) — Prisma 7 driver adapter, `pg.Pool`, zod ved
   API-grenser, Oslo-tid via `uke-helpers.ts`, `proxy.ts` ikke `middleware.ts`.

## Verifikasjons-pipeline
```bash
npm run verify && npm test    # FULL sjekk før commit — dekker hele CI-jobben «verify»
```
`verify` = `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src &&
node scripts/check-action-auth.mjs && npm run build`.
`npm run build` = `prisma generate && next build && serwist build serwist.config.mjs` (rekkefølgen er kritisk —
precache-manifestet globber `.next/`-output).

CI-jobben «verify» kjører nøyaktig de samme stegene som `npm run verify`, pluss `npm test` (enhetstester).
Kjører du begge lokalt har du dekket hele jobben. Hold dem synkronisert: legger du et steg i `ci.yml`, legg det
i `verify` også (og motsatt). Den gamle hex-gaten var ute av synk på denne måten og er fjernet 2026-07-26.

`npm run dev` skal starte uten warnings.

Andre nyttige script: `npm run kart` (skjermkart) · `npm run qa:drills` · `npm run retag:drills[:apply]` ·
`npm run db:seed` · `npm run test:all`.

## Tester
- **Enhetstester:** `npm test` — `tsx --conditions=react-server --experimental-test-module-mocks --test
  'src/lib/**/*.test.ts'` (110 filer): domenelogikk (sg, hcp, ak-kategori, fys-score, plan-builder m.fl.).
- **e2e:** `npm run test:e2e` (Playwright). Én mappe siden 2026-08-03: `tests/e2e/*.spec.ts` (32 specs —
  smoke: a11y, PWA, ruter, meta/OG + auth-guard, IDOR, booking, workbench fra gamle `e2e/`).
  Prosjekter: chromium + webkit. Lokalt auto-startes dev-serveren; i CI antas appen å kjøre allerede
  (`PLAYWRIGHT_BASE_URL`).

## CI/CD
- **`ci.yml`** — PR-gaten. Kjører på **enhver** PR (ingen base-filter, så stablede PR-er dekkes også)
  + push til main + manuelt: `npm ci` → `prisma generate` → `tsc --noEmit` → `eslint` →
  `check:action-auth` → `npm test` → `npm run build`. Alle steg blokkerende. Dummy env-verdier, ingen
  secrets nødvendig.
- **`playwright.yml`** — prod-røyktest, **ikke** en PR-gate. Kjører etter push til main (og manuelt mot
  valgfri `base_url`) mot `https://akgolf-hq.vercel.app`, chromium + webkit.
- **`scrape-golfbox.yml` / `scrape-gjgt.yml`** — planlagte turneringsscrapere.
- **`deploy.yml`** — finnes fortsatt, men er **kun `workflow_dispatch`** (manuell, siden 2026-07-05). Deploy
  skal være en bevisst handling, ikke en bivirkning.
- **Vercel:** git-integrasjon på `main` (produksjon) og PR (preview). Push til `main` deployer automatisk —
  ALDRI `vercel deploy --prod` manuelt (har overskrevet prod med feil branch; blokkeres også av hook).
- **Region:** `vercel.json` har `"regions": ["lhr1"]` for å matche Supabase eu-west-2. Ikke endre uten å
  flytte databasen — se gotchas.

## Hooks (`.claude/settings.json` → `.claude/hooks/`)
Håndheves deterministisk, uavhengig av hva modellen tror:
- **`beskytt.mjs`** (PreToolUse på fil-verktøy + Bash):
  - *Nivå 1 — deny:* `.env*`-filer (unntatt `.env.example`) og PII. Røres aldri av agenter.
  - *Nivå 2 — ask:* `prisma/schema.prisma`, `src/lib/env.ts` og andre schema-/auth-/deploy-kritiske filer.
  - *Main-porten — ask:* `git push … main` krever Anders' eksplisitte «ja» i samtalen.
  - *Deny:* `prisma migrate dev` og `prisma db push` (begge ødelagte her — bruk kirurgisk `db execute`,
    se gotchas §Schema-endringer), manuell prod-deploy, force-push, remote-grensletting, `.env.local`-kommandoer.
- **`kvalitet.mjs`** (PostToolUse på Edit/Write): kjører eslint på endret `.ts`/`.tsx` og rapporterer feil
  tilbake umiddelbart. (Hex-gaten ble fjernet herfra 2026-07-25 — men lever fortsatt i CI, se over.)
- **`logg.mjs`** (logging) og **`varsle-telegram.mjs`** (Stop-varsel til Anders).
- **lint-staged + husky** kjører `eslint --max-warnings 0` + `tsc --noEmit` ved commit.

## Skills (`.claude/skills/`)
`agencyos-arkitektur` (les FØR admin-kode) · `agenticos` + `agenticos-cockpit` (agent-systemet) ·
`verify-og-commit` (kvalitetsgate + commit/push) · `prompt-engineer` + `ak-prompt-master` ·
`mobbin-inspo` (designinspo) · `webapp-testing` (Playwright).
Generiske design-skills og de gamle kanonlåste design-skillene er bevisst fjernet (2026-07-19/25).

## Agenter
- **Kommando** (`/kommando`, `src/lib/kommando/`) — chat med alle agenter (autonomi 1–3, `KommandoTask`
  DB-persistert).
- **Cron-agenter** — 54 filer i `src/lib/agents/` (booking-alerts, churn-radar, daily-brief, availability-monitor,
  drill-forslag m.fl.), trigges via `/api/cron/[agent]` + dedikerte cron-ruter.
- **`docs/platform/AGENT-BRIEF.md`** — agent-onboarding; skal leses av enhver ny agent før arbeid.
- **Ingen agent endrer kode direkte** — agenter produserer forslag til PR; menneske merger.

## Secrets
Alle i `.env.local` (gitignored) + Vercel env. Mal: `.env.example`. **ALDRI commit secrets** — ikke engang
midlertidig; `beskytt.mjs` blokkerer tilgang til `.env*` helt.
Rotasjon og håndtering av kompromittert secret: `docs/runbook.md` §2.5.
