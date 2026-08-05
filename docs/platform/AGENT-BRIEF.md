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

```
src/app/
  (marketing)/     Marketing og public stats (akgolf.no)
  admin/           AgencyOS — coachens kontrolltårn (/admin/*)
  portal/          PlayerHQ — spillerportal (/portal/*)
  booking/         Offentlig booking-flyt
  auth/            Innlogging, registrering, BankID, onboarding
  api/             Route handlers
  globals.css      ENESTE kilde for design-tokens

  # Merk: denne listen er ikke uttømmende. Andre top-level app-mapper
  # som finnes i kodebasen inkluderer blant annet: forelder/, onboard/,
  # inviter/, intern/, team-gfgk/, meg/, fullscreen/.
  # Sjekk filsystemet (src/app/) før du oppretter nye ruter for å unngå
  # konflikter med eksisterende mønstre.

src/components/
  ui/              shadcn-primitiver (Button, Dialog, Input, Tabs, etc.)
  athletic/        Branded AK Golf-komponenter. golfdata/ (v13) er overgangslag;
                   resten av athletic/ er vedlikeholdsmodus
  shared/          Utility-komponenter (cookie-banner, cmd-palette, mobile-nav)
  admin*/          AgencyOS-spesifikke komponenter
  portal*/         PlayerHQ-spesifikke komponenter

src/lib/
  v2/tokens.ts     TS-speil (T) av CSS-variablene — les herfra i TS/charts, definer aldri farger her
  prisma.ts        Prisma-klient
  utils.ts         cn()
  supabase/        Supabase-helpers
  domain/sg.ts     SG-beregning (Broadie + Team Norway IUP-kalibrert)

docs/
  port/                  Designport: fasit-liste-paper.md (designdekning) +
                         plan-designport-alle-skjermer.md (plan + ferdig-definisjon)
                         — LES FØR skjerm-arbeid
  platform/              Agent-kontekst (denne filen)

designsystem/paper/      Lokalt SPEIL av Paper-fasiten (fase1/ + guidelines/ + components/).
                         Speilet er ikke kilden — Claude Design 605a48cc er alltid fasit.
public/design-handover/  SLETTET 2026-07 — fantes ikke lenger, ikke let etter den
wireframe/               SLETTET — ikke les eller importer herfra
```

---

## Designsystem

- **Tokens:** `src/app/globals.css` — HSL-trippel uten `hsl()`-wrapper, shadcn-konvensjon.
- **TS-speil for charts:** `src/lib/v2/tokens.ts` (objektet `T`) — kun les herfra. Den gamle
  `src/lib/design-tokens.ts` finnes ikke lenger.
- **Komponenter:** primitiver fra `src/components/ui/` + `v2/`-mønstre; `athletic/golfdata/` er overgangslag i vedlikeholdsmodus. Sjekk ALLTID hva som finnes FØR du lager noe nytt.
- **Designfasit (LÅST — Paper vinner alltid, Anders 2026-08-03):** Claude Design-prosjektet
  «AK Golf HQ — Claude Paper» (`605a48cc`, skjermer i `fase1/`) er eneste designfasit. Full port
  til `src/` kjører NÅ. Den gamle tidsplanen «C, smalt til etter piloten» (31.07) er **overstyrt**
  og skal ikke følges. Mangler skjermen fasit: `docs/port/monsterdokument-paper.md` er eneste
  designkilde. Plan + ferdig-definisjon: `docs/port/plan-designport-alle-skjermer.md`.
  Ved konflikt mellom et dokument og Paper-fasiten **vinner Paper-fasiten**.
- **Farger/flater:** Paper-tokens (`--p-*` i `src/styles/paper-tokens.css`), som `--v2-*` peker på
  etter steg 5A. Aksent `#D97757` har monopol på «Én ting nå» — maks én per skjerm.
- **Fonter:** Paper-fasiten er Poppins (UI/titler) · Lora (prosa/AI-svar) · IBM Plex Mono (tall).
  Koden bruker fortsatt Inter / Familjen Grotesk / JetBrains Mono — fontbyttet er ikke gjennomført
  ennå (åpent punkt i porten). Inter Tight er FJERNET — ikke gjeninnfør.

**FORBUDT:** lage ny `tokens.css`, importere fra `wireframe/`, lage `tokens.ts` i komponent-mapper.

---

## Låste beslutninger (ikke diskuter — bare følg)

- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt navn — aldri i ny UI-tekst.
- **Tema:** PlayerHQ alltid **lyst**, AgencyOS alltid **mørkt** (`.dark`). Ingen toggle.
- **Planlegging → Workbench:** ÉN inngangspunkt. Ikke en meny av 6 kort. Workbench har **fem nivå**: årsplan → periodisering → måned → uke → økt.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner.
- **Demo-navn:** Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Fulle navn alltid. Gamle navn (Markus Berg, Magnus, Andreas Kragerud) skal bort. NB: ekte coach «Markus Røinås Pedersen» på markedssider beholdes.
- **ELITE vises aldri i UI** — dødt Prisma-enum.
- **Abonnement:** Gratis (prøveperiode / coaching-pakke / gruppe) eller 299 kr/mnd. Performance / Performance Pro er coaching-pakker, ikke app-nivåer.
- **FYS-resultatformel:** avventer grønt lys fra Anders — vis plassholder-tall.
- **Avatar-initialer:** avledes fra ekte navn i DB, aldri hardkodet.
- **Design-kilden ER låst (oppdatert 2026-08-05):** Claude Paper. Setningen «ingen låst design-kilde
  akkurat nå — leveres som ny zip-handover» sto her frem til 05.08 og er **utgått**; det kommer ingen
  zip. Referanser til `wireframe/`, `design-package/`, `design-files-v2/`, `public/design-handover/`
  eller andre gamle arkiver er forbudt i produksjonsfiler — fjernes ved første touch av filen.

### Design-porting-unntak (diff-agenter skal ikke flagge disse)

Listen under er fra Presis-æraen og gjaldt den gamle fasiten. **Utgått 2026-08-05** — den forrige
lenken gikk dessuten til `.claude/rules/design-produktbeslutninger.md`, som ikke finnes.
Gjeldende avvikshåndtering står i `docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon.
Beholdt kun som historikk:

- PlayerHQ-hjem hero: profilbilde + tier-pill øverst (ikke dato-eyebrow + vær fra designet).
- Tier-pill-tekst: «PlayerHQ · {tier}» (ikke «Performance Pro»).
- Undersider mobil-topbar: global PortalShell-topbar (ikke sub-topbar med tilbake-pil).
- Knappestil: `rounded-full` pill + mono 12px bold uppercase. **Utgått** — Paper bruker `--r-sm` 8px
  og 13px knappetekst.
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

Fasiten er Claude Paper i Claude Design `605a48cc` (skjermer i `fase1/`, lokalt speil i
`designsystem/paper/`) — hent den derfra. Mangler skjermen fasit: `docs/port/monsterdokument-paper.md`.
Deretter: bygg fra fasiten (element-liste først), screenshot med Playwright (PlayerHQ 430px,
AgencyOS ~1280px, full-page), spawn en adversarial diff-subagent som FINNER avvik (ikke bekrefter),
og fiks til 0 avvik. En skjerm regnes som ferdig først når
ferdig-definisjonen i `docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon er oppfylt og
Anders har sett skjermbildet.

---

## Verifikasjon (kjør før hver commit)

```bash
npm run verify
```
