# AK Golf HQ — Agent Brief

> **Nordstjernen:** [`NORDSTJERNE.md`](NORDSTJERNE.md) — hva appen SKAL være
> (fire ansikter, de to loopene, planleggings-pyramiden, tilgangsskillet,
> interaksjons- og sikkerhetsprinsippene). Les den før du bygger noe nytt.

## Hva dette er

AK Golf HQ er en monorepo-plattform som samler fire produkter under ett Next.js-prosjekt: en marketing-site, en booking-flyt, **PlayerHQ** (spillerportal) og **AgencyOS** (coach-admin). Plattformen betjener Anders Kristiansen (coach/eier) og spillerne hans på tvers av AK Golf Academy, WANG Toppidrett og GFGK. Det som skiller den fra generiske coaching-apper er det integrerte Strokes Gained-analysesystemet, teknisk utviklingsplan med TrackMan-kobling og AI-basert planlegging via Workbench.

---

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)

- **Next.js 16** — App Router, TypeScript strict, Turbopack. MÅ ha `turbopack: { root: import.meta.dirname }` i `next.config.ts`, ellers feiler CSS-resolve lokalt.
- **React 19**
- **Prisma 7** — connection-strings i `prisma.config.ts`, IKKE i `schema.prisma`. Runtime krever `@prisma/adapter-pg`.
- **Supabase** — Postgres + Auth + Realtime. Shared Pooler (IPv4, transaction pooler).
- **Tailwind CSS v4** — CSS-first via `@theme` i `globals.css`. INGEN `tailwind.config.ts`.
- **shadcn/ui** — UI-primitiver i `src/components/ui/`.
- **Lucide React** — eneste icon-bibliotek. INGEN emojis i UI.
- **npm** — pakkebehandler.
- **Testrammeverk** — `node:test` via `tsx --test`. vitest er IKKE installert.

---

## Mappestruktur

(Flyttet hit fra CLAUDE.md 2026-08-16 — denne filen eier strukturkartet.)

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
│                   # v2/tokens.ts = TS-speil av CSS-variablene — les herfra i TS/charts,
│                   # definer aldri farger der
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
                    # natt/ (gjeldende lanseringsspor) · skjermtekst/ (copy-kilde) ·
                    # design-system/TEMA-LYS-MORK.md (tema-oppførsel i kode) ·
                    # gdpr/ · juridisk/ · sikkerhet/ · arkiv/ (inkl. paper-port)
designsystem/train-lock/  # GJELDENDE designfasit for PlayerHQ, AgencyOS, Forelder
designsystem/paper/       # ARKIV — aldri bygg-fasit, aldri few-shot (se DEPRECATED.md)
tests/e2e/          # Én samlet e2e-suite (32 specs, siden 2026-08-03): a11y, PWA, ruter, meta/OG,
                    # offline, ikoner + auth-guard, IDOR, booking, workbench (fra gamle e2e/)
```

Slettede mapper det ikke skal letes etter: `public/design-handover/`, `wireframe/`.

---

## Designsystem

- **Designfasit:** Train-lock (`designsystem/train-lock/`) for ALLE skjermer i PlayerHQ,
  AgencyOS og Forelder. Les `DESIGN-SYSTEM.md` → `SCREEN-INDEX.md` → `PORTING.md`.
  Claude Paper (`designsystem/paper/`) er ARKIV — aldri bygg-fasit, aldri few-shot.
  Gammel Paper-plan: `docs/arkiv/paper-port/`. Ved konflikt **vinner Train-lock**.
- **Tokens (ny kode):** `--tl-*` i `src/styles/train-lock-tokens.css`, TS-speil `TL` i
  `src/lib/v2/train-lock.ts`. Scene `#000000` / lys `#FFFFFF`. Fullført = warm `#B85C3D`.
- **Tokens (utgående):** `--p-*` (`src/styles/paper-tokens.css`) og `T` (`src/lib/v2/tokens.ts`)
  lever i runtime for usportede rester og marketing. Ikke importer `T` i ny skjermkode.
  `--v2-*` i `globals.css` peker fortsatt på `--p-*` — det er bro, ikke fasit.
- **Komponenter:** primitiver fra `src/components/ui/` + `v2/`-mønstre; `athletic/golfdata/`
  er overgangslag. Sjekk ALLTID hva som finnes FØR du lager noe nytt.
- **Fonter (live i `src/app/layout.tsx`):** Poppins (UI/titler) · Lora (prosa) · IBM Plex Mono
  (tall). Inter / Familjen Grotesk / JetBrains Mono / Inter Tight er FJERNET — ikke gjeninnfør.
- **Ferdig-definisjon:** skjermbilde-gaten i `CLAUDE.md` §Skjermarbeid.

**FORBUDT:** lage ny `tokens.css`, importere fra `wireframe/` eller `designsystem/paper/`,
lage `tokens.ts` i komponent-mapper, cream `#FAF9F5` / clay-CTA / Presis-skog/lime i produktflater.

---

## Låste beslutninger (ikke diskuter — bare følg)

- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt navn — aldri i ny UI-tekst.
- **Tema:** mørk default på `/portal` og `/admin` (`src/lib/v2/tema-default.ts`). `/auth`
  og `/forelder` er lys default. Cookie `ak-v2-tema` vinner over defaulten. Landingssider alltid lyse.
- **Planlegging → Workbench:** ÉN inngangspunkt. Ikke en meny av 6 kort. Workbench har **fem nivå**: årsplan → periodisering → måned → uke → økt.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner.
- **Demo-navn:** Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Fulle navn alltid. Gamle navn (Markus Berg, Magnus, Andreas Kragerud) skal bort. NB: ekte coach «Markus Røinås Pedersen» på markedssider beholdes.
- **ELITE vises aldri i UI** — dødt Prisma-enum.
- **Abonnement:** Gratis (prøveperiode / coaching-pakke / gruppe) eller 299 kr/mnd. Performance / Performance Pro er coaching-pakker, ikke app-nivåer.
- **FYS-resultatformel:** avventer grønt lys fra Anders — vis plassholder-tall.
- **Avatar-initialer:** avledes fra ekte navn i DB, aldri hardkodet.
- **Design-kilden ER låst (oppdatert 2026-08-25):** Train-lock — for alle PlayerHQ/AgencyOS-skjermer.
  (05.08-låsen på Claude Paper er supersedert.) Referanser til `wireframe/`, `design-package/`, `design-files-v2/`, `public/design-handover/`
  eller andre gamle arkiver er forbudt i produksjonsfiler — fjernes ved første touch av filen.

### Design-porting-unntak (diff-agenter skal ikke flagge disse)

Listen under er fra Presis-æraen og gjaldt den gamle fasiten. **Utgått 2026-08-05** — den forrige
lenken gikk dessuten til `.claude/rules/design-produktbeslutninger.md`, som ikke finnes.
Gjeldende avvikshåndtering: kontrakten + skjermbilde-gaten i `CLAUDE.md` §Skjermarbeid.
Beholdt kun som historikk:

- PlayerHQ-hjem hero: profilbilde + tier-pill øverst (ikke dato-eyebrow + vær fra designet).
- Tier-pill-tekst: «PlayerHQ · {tier}» (ikke «Performance Pro»).
- Undersider mobil-topbar: global PortalShell-topbar (ikke sub-topbar med tilbake-pil).
- Knappestil: `rounded-full` pill + mono 12px bold uppercase. **Utgått** — Train-lock:
  én hvit (lys: sort) primær per skjerm, radius-card 20 / pill 999.
- AgencyOS-initialer: «ØR» for Øyvind Rohjan (fasit hardkodet «MB» — levning fra gammelt navn).
- Konkrete tekstinnhold (meldinger, oppgavetekster) er data, ikke design-avvik.

---

## Kjente fallgruver

- **Turbopack CSS-resolve:** `next.config.ts` MÅ ha `turbopack: { root: import.meta.dirname }`.
- **next.config.ts export-form:** filen eksporterer `withSerwist(withMDX(nextConfig))` — IKKE `nextConfig` direkte. Aldri erstatt export-formen. Legg nye config-felter inn i `nextConfig`-objektet, ikke på utsiden.
- **Prisma 7:** DB-url i `prisma.config.ts` → `datasource.url = env("DIRECT_URL")`. Runtime: `DATABASE_URL` via pgbouncer. `prisma.config.ts` MÅ laste `.env.local` med `dotenv.config({ path: ".env.local" })`.
- **Next.js 16 middleware heter `proxy.ts`**, ikke `middleware.ts`. Kun nodejs runtime, ikke edge.
- **tsx-scripts:** MÅ `import "./_env"` FØR `@/lib/prisma`, ellers feiler DB-tilkobling (ESM import-rekkefølge).
- **JSON-blobs fra Prisma:** bruk `zod safeParse` — aldri `as unknown as <Type>` for forretningskritiske data.
- **Supabase RLS:** alle nye tabeller MÅ ha `ENABLE RLS` i samme migrasjon, ellers lekkasje via PostgREST.
- **Two live-session tracks:** Spor A (`TrainingPlanSession`, `/portal/live`) og Spor B (`TrainingSessionV2`, `/admin/live` + workbench) sameksisterer bevisst — ikke merge uoppfordret.

---

## Kvalitetsgate per skjerm (ingen snarvei)

Fasiten er Train-lock (`designsystem/train-lock/`, 196 skjermfiler). Mangler fasit for
skjermen: STOPP og spør Anders — ikke fall tilbake til Paper.
Deretter: bygg fra fasiten (element-liste først), screenshot med Playwright (PlayerHQ 430px,
AgencyOS ~1280px, full-page), spawn en adversarial diff-subagent som FINNER avvik (ikke bekrefter),
og fiks til 0 avvik. En skjerm regnes som ferdig først når
skjermbilde-gaten i `CLAUDE.md` §Skjermarbeid er oppfylt og Anders har sett skjermbildet.

---

## Andre referansedokumenter (ikke duplisert her)

- `docs/gdpr/behandlingsregister.md` — GDPR-behandlingsregister
- `docs/sikkerhet/action-audit.md` — sikkerhetsrevisjon av agent-handlinger
- `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` — norsk UI-copy-kilde
- `docs/integrasjoner/whoop-garmin-oppsett.md` — Whoop/Garmin-oppsett

## Verifikasjon (kjør før hver commit)

```bash
npm run verify
```
