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
  athletic/        Branded AK Golf-komponenter — ALLTID gjenbruk herfra
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
- **Komponenter:** Se `src/components/athletic/index.ts` for komplett liste — ALLTID sjekk der FØR du lager noe nytt. Mappen har 30+ entries inkludert subkataloger (`calendars/`, `editorial/`, `itinerary/`, `shell/`, `cards/`, `data/`, `patterns/`, `modals/`, `hero/` m.fl.).
- **Spacing:** 8pt-grid. Kun `p-2/4/6/8/10/12/16`. Unntaket er data-tette flater (dashboards, tabeller) som bruker `p-3/gap-3/py-2.5` der design-handover-HTML gjør det.
- **Fonter:** Inter (`font-sans`), Inter Tight (`font-display`), JetBrains Mono (`font-mono`). INGEN andre fonter.

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
- **Design-kilde (LÅST):** All design-referanse i kode, kommentarer, commits og prompts **MÅ** peke til gjeldende `public/design-handover/` (juni 2026+ eller nyere). Referanser til `wireframe/`, `design-package/`, `design-files-v2/` eller gamle arkiver er forbudt i produksjonsfiler. De skal fjernes eller oppdateres ved første touch av filen. Bruk kun gjeldende design-handover som fasit. Se `.claude/rules/design-porting-gate.md` for full regel.

### Design-porting-unntak (diff-agenter skal ikke flagge disse)

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

## Kvalitetsgate per skjerm (ingen snarvei)

1. Bygg fra design-kilde (`public/design-handover/AK Golf HQ Design System/`) — lag element-liste først.
2. Screenshot med Playwright (PlayerHQ 430px, AgencyOS ~1280px, full-page).
3. Adversarial diff — spawn egen subagent som FINNER avvik (ikke bekrefter).
4. Fiks alle avvik, re-screenshot, loop til 0 avvik.
5. Merk ferdig i `docs/MASTER-SKJERMPLAN.md` — alle 6 haker grønne: **Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker**.

---

## Verifikasjon (kjør før hver commit)

```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
```
