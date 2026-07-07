# AK Golf HQ — Agent Brief

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
  athletic/        Branded AK Golf-komponenter. golfdata/ (v13) er gjeldende kilde;
                   resten av athletic/ er vedlikeholdsmodus (design-system-regel.md)
  shared/          Utility-komponenter (cookie-banner, cmd-palette, mobile-nav)
  admin*/          AgencyOS-spesifikke komponenter
  portal*/         PlayerHQ-spesifikke komponenter

src/lib/
  design-tokens.ts TS-speil av globals.css (kun for charts — ikke definer farger her)
  prisma.ts        Prisma-klient
  utils.ts         cn()
  supabase/        Supabase-helpers
  domain/sg.ts     SG-beregning (Broadie + Team Norway IUP-kalibrert)

docs/
  MASTER-SKJERMPLAN.md   Autoritativ skjermstatus — LES FØR skjerm-arbeid
  platform/              Agent-kontekst (denne filen)

public/design-handover/  GJELDENDE design-fasit (4. juni 2026)
wireframe/               ARKIV — ikke les eller importer herfra
```

---

## Designsystem

- **Tokens:** `src/app/globals.css` — HSL-trippel uten `hsl()`-wrapper, shadcn-konvensjon.
- **TS-speil for charts:** `src/lib/design-tokens.ts` — kun les herfra.
- **Komponenter:** bruk `src/components/athletic/golfdata/` (v13) for ny golf-UI; gamle `athletic/` er vedlikeholdsmodus (se `.claude/rules/design-system-regel.md`). Sjekk ALLTID hva som finnes FØR du lager noe nytt.
- **Spacing:** 8pt-grid. Kun `p-2/4/6/8/10/12/16`. Unntaket er data-tette flater (dashboards, tabeller) som bruker `p-3/gap-3/py-2.5` der design-handover-HTML gjør det.
- **Fonter:** Inter (`font-sans`), Familjen Grotesk (`font-display`) — Inter Tight er utgående, JetBrains Mono (`font-mono`). INGEN andre fonter. Kanon: `.claude/rules/design-system-regel.md`.

**FORBUDT:** hardkode hex-verdier, lage ny `tokens.css`, importere fra `wireframe/`, lage `tokens.ts` i komponent-mapper.

---

## Låste beslutninger (ikke diskuter — bare følg)

- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt navn — aldri i ny UI-tekst.
- **Tema:** PlayerHQ alltid **lyst**, AgencyOS alltid **mørkt** (`.dark`). Ingen toggle.
- **Planlegging → Workbench:** ÉN inngangspunkt. Ikke en meny av 6 kort. Workbench har **fem nivå**: årsplan → periodisering → måned → uke → økt.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner.
- **Demo-navn:** Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Fulle navn alltid. Gamle navn (Markus Berg, Magnus, Andreas Kragerud) skal bort. NB: ekte coach «Markus Røinås Pedersen» på markedssider beholdes.
- **ELITE vises aldri i UI** — dødt Prisma-enum.
- **Abonnement:** Gratis (prøveperiode / coaching-pakke / gruppe) eller 300 kr/mnd. Performance / Performance Pro er coaching-pakker, ikke app-nivåer.
- **FYS-resultatformel:** avventer grønt lys fra Anders — vis plassholder-tall.
- **Avatar-initialer:** avledes fra ekte navn i DB, aldri hardkodet.
- **Design under aktiv utvikling (2026-07-03):** Ingen låst design-kilde akkurat nå — gjeldende design bygges hos Claude Design og leveres som ny zip-handover. Referanser til `wireframe/`, `design-package/`, `design-files-v2/` eller gamle arkiver er uansett forbudt i produksjonsfiler — fjernes eller oppdateres ved første touch av filen. Se `CLAUDE.md`.

### Design-porting-unntak (diff-agenter skal ikke flagge disse — full liste i `.claude/rules/design-produktbeslutninger.md`)

- PlayerHQ-hjem hero: profilbilde + tier-pill øverst (ikke dato-eyebrow + vær fra designet).
- Tier-pill-tekst: «PlayerHQ · {tier}» (ikke «Performance Pro»).
- Undersider mobil-topbar: global PortalShell-topbar (ikke sub-topbar med tilbake-pil).
- Knappestil: `rounded-full` pill + mono 12px bold uppercase (godkjent app-bredt mønster).
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

## Kvalitetsgate per skjerm (ingen snarvei — prosessen skrives på nytt når ny handover kommer)

Ingen låst design-kilde akkurat nå (se `CLAUDE.md`), så steg 1 kan ikke kjøres før neste zip-handover er
mottatt. Når den kommer: pakk ut til `docs/design-handover-YYYY-MM-DD/`, bygg fra den (element-liste først),
screenshot med Playwright (PlayerHQ 430px, AgencyOS ~1280px, full-page), spawn en adversarial diff-subagent
som FINNER avvik (ikke bekrefter), fiks til 0 avvik, og merk ferdig i `docs/MASTER-SKJERMPLAN.md` — alle 6
haker grønne: **Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker**.

---

## Verifikasjon (kjør før hver commit)

```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
```
