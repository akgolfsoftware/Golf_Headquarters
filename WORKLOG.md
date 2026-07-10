# WORKLOG — AK Golf HQ

> Kronologisk oversikt over arbeid utført per sesjon.
> Nyeste øverst.

---

## 2026-07-09/10 — Natt: v2-redesign bygget inn i appen (redesign/v2, worktree akgolf-hq-v2natt)

**Branch:** `redesign/v2` (worktree `/Users/anderskristiansen/Developer/akgolf-hq-v2natt`, main-repo
aldri rørt) · 8 commits (N1–N8), fra `9d76fe23` til `b64a1cbb`.

### N1–N8 — hva ble bygget

1. **N1** `d08be1c7` — route-group-split (gammel UI → `(legacy)`) + PlayerHQ-kjerne (Hjem, Plan,
   Gjør, Analysere, Meg) byttet til v2 på ekte adresser (`/portal/...`).
2. **N2** `c4244346` — PlayerHQ-satellitter byttet til ekte ruter + nye ruter for datagolf,
   fysisk, utviklingsplan.
3. **N3** `900f487b` — AgencyOS byttet til ekte ruter (cockpit, stall, spillerdetalj, drift,
   talent, forretning).
4. **N4** `f1dd8186` — aktiverte CTA-er, Workbench-handlinger, hjelpesystem, tab-rekkefølge,
   sentence-case på akse-chips.
5. **N5** `b358362d` — mobilpass: agenda-visninger for Workbench/kalendere, kort-lister i stedet
   for tabeller (375px, ingen horisontal scroll).
6. **N6** `197a88ad` — markedssidene i v2: split, kjerneskjermer, innholdssider, juridisk, kataloger.
7. **N7** `1b866e85` — offentlig stats-seksjon i v2: delt stats-skall + familie-bytter.
8. **N8** `b64a1cbb` (denne økten) — natt-forsegling: PWA-ikoner (nye app-ikonsett), levende
   v2-login koblet til ekte auth, AgencyOS e-post-innboks (`/admin/innboks-epost` + `lib/innboks/`
   + `api/inbox/inbound` + additiv `innboks_epost`-tabell via `scripts/migrate-innboks-epost-2026-07-10.ts`),
   og full fjerning av `(v2preview)/`-mappen (109 skjermer) nå som alt er koblet på ekte adresser.

### Verifikasjon (N8, kjørt i worktree)
- `npx prisma validate` — OK
- `npx prisma generate` — OK (Prisma 7.8.0)
- `npx tsc --noEmit` — 0 feil
- `node scripts/check-no-hex.mjs` — OK etter at `src/app/manifest.ts` sitt web-manifest-krav om
  literal hex (kan ikke referere CSS-variabler; verdien speiler `--v2-bg`) ble dokumentert med
  kommentar og lagt i baseline (`--update`)
- `npm run build` — grønn, 277 statiske/dynamiske ruter generert
- `npm test` — 342/342 grønne (59 suiter), ingen relatert til natt-endringene feilet
- Røyktest på port 3901: `/`, `/coaching`, `/priser`, `/stats`, `/stats/spillere`, `/auth/login` → 200.
  `/portal`, `/admin/agencyos`, `/forelder` → 307 til `/auth/login` (korrekt, ikke innlogget).
  Dev-logg uten runtime-feil eller advarsler.

### Commits, push, deploy
- Commit `b64a1cbb feat(v2): night finish — PWA icons, live v2 login, AgencyOS email inbox, remove v2preview`
- Push: `git push -u origin redesign/v2` — ny branch på GitHub
- Deploy: `vercel deploy --yes --scope akgolfgroup-netizens-projects` fra worktreet (kopierte
  `.vercel/project.json` fra hovedrepoet siden worktreet manglet prosjekt-lenke) →
  **Preview:** https://akgolf-f66ow5ws5-akgolfgroup-netizens-projects.vercel.app (READY)

### Gap / hoppet over (ikke natt-blokkerende)
- Noen `V2*.tsx`-komponenter (`LoginV2`, `HjemV2`, `GjorV2`, `AnalysereV2`, `PlanV2`, `MegV2`,
  `MegAbonnementV2`, `SignupV2`) har doc-kommentarer øverst som fortsatt viser til den nå slettede
  `(v2preview)/v2-*`-stien. Ikke funksjonelt (ingen kode-referanser, kun kommentartekst) — ikke
  rettet nå (kirurgisk-endring-prinsippet: utenfor denne oppgavens scope), men bør ryddes neste
  gang noen av de filene røres.
- `docs/MASTER-SKJERMPLAN.md` sine 6 haker for de nylig ekte-koblede skjermene (auth-bølge,
  markedssider, stats, mobilpass) er ikke oppdatert i denne økten — gjenstår som eget steg.

### Gjenstående manuell UAT (Anders)
- Logg inn i live v2-login på preview-URL-en og bekreft full auth-flyt (innlogging → PlayerHQ/AgencyOS/Forelder).
- Test AgencyOS e-post-innboks med en ekte innkommende e-post (webhook `/api/inbox/inbound`) —
  ikke testet med ekte leverandør i denne økten, kun kode-/skjemaverifisert.
- Visuell sjekk av PWA-ikonene på faktisk telefon (hjemskjerm-installasjon), inkl. maskable-varianter.
- Klikk gjennom markedssider + stats-seksjonen på mobil for å bekrefte at N5/N6/N7-mobilpasset
  henger sammen visuelt (kun automatisert røyktest kjørt, ikke visuell gjennomgang).

---

## 2026-06-12 — UX-arkitektur: full kartlegging + konsolideringsanalyse (docs/ux-arkitektur)

**Branch:** `docs/ux-arkitektur` · Ingen kodeendringer — kun dokumentasjon.

### Hva ble gjort
Komplett UX-/IA-kartlegging av hele plattformen (~403 `page.tsx` på 6 overflater), bygd på faktisk
kodelesing via 7 parallelle kartleggingsagenter + egen verifikasjon av strukturpåstander.
**v2.0 — erstatter en tidligere grunnere v1.0 (anslåtte tall, «forelder ikke implementert» — feil).**

- 🆕 `docs/ux-arkitektur.md` (v2.0) — beslutningsklar plan: Del 1 (skjermtelling per overflate),
  Del 2 (4 persona-flyter med trykktelling + feilveier), Del 3 (gap-analyse), Del 4 (konsolidering:
  7 mekaniske M1–M7 + 10 design-D1–D10), Del 5 (målbilde: nav-tre før/etter, skjermtall 403→~307,
  trykkbudsjett-tabell, topp-5 prioriterte endringer).
- 🆕 `docs/ux/0{1-4}-kartlegging-*.md` — fulle rutetabeller per overflate (marketing+stats, playerhq,
  coachhq, forelder+auth+live).

### Fem strukturfunn (verifisert i kode)
1. **Rute-konsolidering halvferdig:** `next.config.ts` har ~50 redirects som har valgt kanon, men
   skyggefilene ligger igjen (`admin/facilities`, `admin/locations`, `portal/tren/kalender`,
   `portal/trackman`, `admin/analytics`). Mekanisk opprydding, null UX-risiko.
2. **AgencyOS nav-brudd:** desktop-sidebar (`agencyos-sidebar.tsx`) ≠ mobil-skuff (`mobile-drawer.tsx`)
   → 13 ruter usynlige på desktop. `admin/sidebar.tsx` er død. `_tab-nav.tsx` rendres ikke → 5 skjermer
   uoppnåelige. Hub-sider sidebaren hopper forbi → ~10 verktøy foreldreløse.
3. **Dobbeltimplementert kjerne:** Live Session i 2 versjoner på samme URL (monolitt 1755 l vs
   rute-splittet med ekte PAUSED/ABANDONED) — hovedinngangen bruker monolitten som ikke persisterer
   avbrudd → hengende ACTIVE-økter. TrackMan ×3, statistikk ×3, innstillinger ×3.
4. **Stripe-hull i begge ender:** gjestebooking→kvittering = login-blindvei; cancel→marketing;
   ekte checkout-wizard foreldreløs; suksess/feil fanges ikke.
5. **Stats (45 skjermer) mangler nav-skjelett** — hub lenker ~13, resten foreldreløse.

### Happy-path-budsjetter (alle truffet i dag)
spiller start-økt 2✓, logg resultat 1✓, coach godkjenn 2✓, forelder neste-økt 0✓, besøkende betalt
booking 4 skjermer✓. Gjelden ligger i nav-reachability og feilveiene, ikke i trykktallene.

### Merk
Regelfila Anders refererte til (`.claude/rules/design-system.md`) finnes ikke — vurdert mot faktisk
fasit: CLAUDE.md-tokens + `docs/design-system-lint.md` + `.claude/rules/design-porting-gate.md`.

### Commit
`docs: ux-arkitektur med konsolideringsanalyse og trykkbudsjett`

---

## 2026-06-11 — Meg tilbakeskrivings-pipeline (feature/meg-tilbakeskriving)

**Branch:** `feature/meg-tilbakeskriving`

### Hva ble gjort

Daglig pipeline som destillerer Meg-Telegram-logger og skriver dem tilbake til Anders' kunnskapslagre.

- 🆕 `scripts/meg-tilbakeskriving/run.ts` — orkestrering: henter uprosesserte rader fra Meg-Supabase,
  grupperer per dag (Oslo-tid), destillerer via Claude, skriver til begge hjernelagrene,
  markerer rader prosessert (aldri ved feil), skriver kjøre-rapport.
- 🆕 `scripts/meg-tilbakeskriving/destiller.ts` — Claude API-kall med tool_use:
  returnerer `dagsnotat` (maks 200 ord), `varige_monstre` (array tema+innhold) og `stoy_antall`.
  Bruker `MEG_MODEL_SMART` (default: `claude-sonnet-4-6`).
- 🆕 `scripts/meg-tilbakeskriving/skriv-ak-brain.ts` — appender `## Fra Meg`-seksjon til
  `$AK_BRAIN_PATH/YYYY-MM-DD.md`. Idempotent: hopper over hvis seksjonen allerede finnes.
- 🆕 `scripts/meg-tilbakeskriving/skriv-second-brain.ts` — skriver markdown-filer med YAML-frontmatter
  til `$AK_SECOND_BRAIN_PATH/meg-monstre/`, kjører `git add + commit + push`.
  Håndterer "nothing to commit" trygt. Kaster ved git push-feil.
- 🆕 `scripts/meg-tilbakeskriving/migration.sql` — `ALTER TABLE me_log ADD COLUMN IF NOT EXISTS destilled_at TIMESTAMPTZ`
  + sparse index. Kjøres én gang i Supabase SQL Editor.
- 🆕 `scripts/meg-tilbakeskriving/launchagent/no.akgolf.meg-tilbakeskriving.plist` — LaunchAgent
  kl. 21:30, logg til `scripts/meg-tilbakeskriving.log`.
- 🆕 `scripts/meg-tilbakeskriving/README.md` — installasjonssteg for Anders (ikke-teknisk).
- `package.json` — nytt script `"meg:tilbakeskriv": "tsx scripts/meg-tilbakeskriving/run.ts"`.

### Idempotens-garanti

- Rader med `destilled_at != NULL` hentes aldri.
- Ved enhver feil i destillering eller skriving: raden forblir uprosessert til neste kjøring.
- ak-brain: sjekker `## Fra Meg` før skriving — dobbelt-kjøring safe.
- second-brain: `git commit` med "nothing to commit" er en OK-tilstand, ikke feil.

### Env-variabler (ingen nye — alt finnes i .env.local)

Bruker `MEG_SUPABASE_URL`, `MEG_SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.
Valgfritt: `AK_BRAIN_PATH`, `AK_SECOND_BRAIN_PATH`, `MEG_MODEL_SMART`.

### Verifikasjon

- `npx tsc --noEmit` — 0 feil

### Installasjonssteg gjenstår (Anders gjør selv)

1. Kjør `migration.sql` i Supabase SQL Editor
2. Test: `npm run meg:tilbakeskriv`
3. Installer LaunchAgent (se README.md)

---

## 2026-06-10 — AgencyOS Fase 3: desktop-fasit-paritet (design/agencyos)

**Branch:** `design/agencyos` · Pulje A–D ferdig (20 skjermer, 0 avvik via kritiker-gate), Pulje E bygges.

### KOORDINERING → PlayerHQ-sporet (design/komplett) — globals.css er endret

Fire delte endringer som påvirker portal-flatene ved merge:
1. **`* { border-color }` flyttet inn i `@layer base`** — den lå unlayered og overstyrte ALLE
   border-fargeklasser (border-primary, border-accent, …) i hele appen. Nå virker de.
   Portal-kode som har border-fargeklasser vil vise dem for første gang.
2. **`input/textarea/select { font-size:16px }` flyttet inn i `@layer base`** — samme mekanisme;
   tekststørrelse-utilities på inputs virker nå (iOS-zoom-vernet består som base-default).
3. **`.dark`-tokens satt til fasit-paletten** (success #56C59A, info #84A9FF, border #2B4F42,
   secondary/muted = card, muted-fg #9CA39E, destructive #F2908C) — påvirker kun mørke flater (admin).
4. **Nye chip/tint-tokens i @theme** (--color-chip-*, --color-alert-coral, coach-sidebar-justeringer).

→ PlayerHQ bør re-screenshotte sine 5 godkjente mobilskjermer etter merge (særlig pga. 1 og 2).
Demo-databasen: coach-demo-data ligger nå på EGEN Øyvind (oyvind-rohjan@stall.akgolf.test) —
screentest@akgolf.test er verifisert urørt (en tidlig lekkasje ble reversert samme dag).
## 2026-06-10 (del 2) — Benchmark-autosync: DataGolf hver mandag 08:00

**Branch:** `feature/benchmark-autosync` (etter merge av PR #8 til main)

### Go-live av v1-fasitene
- PR #8 merget til main.
- Seed KJØRT mot prod: `npx tsx prisma/scripts/seed-ngf-test-protocols.ts` — 21 tester
  oppdatert, benchmarks aktive i tester-matrisen. Seed utvidet med `benchmarks_key`
  i protocol (stabil id for autosync; DB-navn avviker fra batteri-navn).

### Autosync-motor
- 🆕 `src/lib/admin/benchmark-sync.ts` — cron-agent `benchmark-sync`:
  henter DataGolf skill ratings (PGA + Korn Ferry) via eksisterende
  `@/lib/datagolf/client`, regner ankere (PGA topp 40 etter SG total, PGA-snitt,
  KFT-snitt) og skalerer nivåstigene med drift fra kalibrert baseline.
  - **Auto:** Driver Basic (driving_dist) + Driver Gate (driving_acc)
  - **Følger:** CHS skygger driver-lengde-driften (~1:1)
  - **Statisk:** PEI-/putt-testene (referanseverdier uten ukentlig kilde) røres ikke
  - Første kjøring per test = kalibrering (baseline lagres, ingenting endres).
    Drift ≤ 3 % → skrives automatisk med kilde-stempel `datagolf-auto-<dato>`.
    Drift > 3 % eller brutt stige → `benchmarks_pending` i protocol, venter godkjenning.
  - Telegram-rapport til Anders etter hver kjøring (MEG_TELEGRAM_*-env, gjenbruk av
    Meg-botens kanal). Bevisst egen liten send-funksjon — `@/lib/meg/telegram` er
    `server-only` og kan ikke importeres fra tsx-scripts.
- 🆕 `src/lib/admin/benchmark-sync-schema.ts` — zod for `benchmarks_sync` (baseline,
  baselineLevels, lastRun) og `benchmarks_pending`; monotoni-validering; avrunding.
- Cron registrert: `src/app/api/cron/[agent]/route.ts` + `vercel.json`
  `0 6 * * 1` UTC = mandag **08:00 norsk sommertid** (07:00 vintertid — Vercel-cron
  følger UTC, ikke norsk klokke).
- 🆕 `scripts/run-benchmark-sync.ts` — manuell kjøring fra terminal (import "./_env").

### Godkjenningsside i CoachHQ
- 🆕 `/admin/tester/benchmarks` (`page.tsx` + `actions.ts`) — viser alle fasit-tester
  med synk-modus (AUTO / FØLGER DRIVER / REFERANSE), kilde-stempel og nivåstige;
  ventende justeringer vises med gammel → ny per nivå + Godkjenn / Avvis;
  «Kjør synk nå»-knapp bruker samme motor som cronen. Auth: COACH/ADMIN.
  - Godkjenn = skriv foreslåtte nivåer + re-kalibrer baseline.
  - Avvis = behold dagens nivåer, re-kalibrer mot nye råverdier (ellers ville samme
    forslag kommet tilbake hver mandag).

### Verifisert live mot prod-DB
- Kalibreringskjøring: 3 tester kalibrert, Telegram levert ✓
- Andre kjøring: «unchanged» på alle (ratio 1,0) ✓
- Guardrail-test: baseline kunstig forskjøvet 10 % → `pending (9,84 %)`, live fasit
  URØRT, Telegram varslet ✓ — deretter nullstilt og rekalibrert rent
- `npx tsc --noEmit` 0 feil · ESLint 0 feil · `npm run build` grønn

### Drift
- DataGolf nede en mandag → kjøringen feiler trygt, forrige fasit gjelder, feil synlig
  i Telegram-melding/cron-logg. Ingen handling nødvendig.

---

## 2026-06-10 — Benchmarks i NGF-testbatteriet (DataGolf-fasiter v1)

**Branch:** `feature/test-benchmarks`

### Hva ble gjort
- `prisma/seed-data/ngf-test-battery.json` — 12 av 20 tester fikk strukturert `benchmarks`-felt
  (unit/direction/source + 7-nivås stige PGA topp 40 → Scratch, med confidence
  measured/reference/estimated per DataGolf-fasittabellen). 8 tester (Nærspill Gate,
  VISA Express, Putt Gate, Putt Speed Control + de 4 fysiske) fikk `benchmarks: null` +
  `benchmarks_note` (norm kommer i v2). `benchmarks_detail` lagt på 8-Ball Variation
  (PGA-forventning per slagtype) og Putt 1-3m (PGA hullprosent per avstand).
- Fritekst-korreksjon: «PEI < 0.06 (Top 40 avg)» var feil — 6 % er PGA-SNITT, ikke topp 40.
  `pga_benchmark`-tekster oppdatert i JSON + seed-protokollene så de samsvarer med fasit-tallene.
- `prisma/scripts/seed-ngf-test-protocols.ts` — leser nå batteriet fra JSON, validerer
  (kjente id-er + monotont ordnet nivåstige, kaster ved feil) og merger
  `benchmarks`/`benchmarks_note`/`benchmarks_detail` inn i `protocol`-JSON ved alle tre
  skrivesteder. NB: matching skjer på test-**id** (identisk id-sett i JSON og PROTOCOLS) —
  name-feltene avviker bevisst mellom filene ("Inspill Basic" vs DB-navnet "Inspill Basis").
- 🆕 `src/lib/admin/test-benchmarks.ts` — zod-validert lesing av `protocol.benchmarks`
  (JSON-blob-gotcha: aldri blind cast), retningsbevisst nivåberegning (`achievedLevel`),
  tooltip-stige (`ladderText`), norsk tallformat. PEI-ratio (≤ 1,5) normaliseres til prosent
  før sammenligning siden gamle scores kan være lagret som 0,057 i stedet for 5,7.
- `src/lib/admin/tester-matrix-data.ts` — `MatrixCell` har nå `benchmark` (beste oppnådde
  nivå + ladder); enhet/retning hentes fra benchmarks når de finnes; `noTargets` settes kun
  når INGEN tester har benchmarks (fallback). For å holde fila under 300 linjer ble hjelpere
  flyttet mekanisk ut: 🆕 `tester-matrix-format.ts` (format/utledning) og
  🆕 `tester-matrix-types.ts` (typer, re-eksportert fra data-fila så importer ikke brekker).
- 🆕 `src/components/admin/tester/nivaa-badge.tsx` — kompakt nivå-chip (PGA fremhevet,
  «U/SCR» dempet), tooltip med hele nivåstigen. Registrert i `docs/component-library.md`.
- `src/components/admin/tester/tester-oversikt.tsx` + `src/app/admin/tester/map-tester-oversikt.ts`
  — badge rendres ved siden av verdien i målte celler, ny nivå-legende (erstatter
  over/nær/under-legenden som ville vært misvisende uten per-test mål), footer-attribusjon
  **«Data powered by DataGolf»** (lisenskrav). Umålte celler uendret. Den eldre, ukoblede
  `tester-matrix.tsx` er bevisst ikke endret (siden bruker v10 `TesterOversikt`).

### Seed — IKKE kjørt i denne sesjonen (bevisst)
Kjøres som eget, bevisst steg når branchen er godkjent:
```bash
npx tsx prisma/scripts/seed-ngf-test-protocols.ts
```
Scriptet validerer batteriet før det skriver, og er idempotent (update på navn-match).
Før seed er kjørt viser matrisen fallback-tilstanden (nøytral «målt», noTargets-varsel).

### Verifikasjon
- `npx prisma validate` ✓ · `npx prisma generate` ✓ · `npx tsc --noEmit` 0 feil ·
  ESLint 0 feil på endrede filer · `npm run build` grønn
- Logikk-test (tsx): alle 12 benchmarks validerer mot zod; CHS 118→PGA-snitt, 121→topp 40,
  95→U/SCR; Inspill 6,5→CHA, ratio 0,055→PGA; Putt 58→CHA, 63→PGA — retning + normalisering OK
- Nettleser-test av badge krever seedet DB + coach-innlogging — gjøres etter seed-kjøring

### Commit
`feat: benchmarks i NGF-testbatteriet (DataGolf-fasiter v1)`

---

## 2026-05-16 — Fase 2: Admin-konsolidering

**Branch:** `feat/admin-konsolidering`

### Fase 2.1 — Hub + AgencyOS-fusjon
- `src/app/admin/page.tsx` — ren redirect til `/admin/agencyos`
- `src/components/admin/sidebar.tsx` — fjernet "AgencyOS"-oppføring, omdøpt rute til "Hub" som peker til `/admin/agencyos`
- Resultat: én "Hub"-oppføring i sidemenyen, AgencyOS-utseendet er nå Hub

### Fase 2.2 — Spillere + Trener-tavle-fusjon
- 🆕 `src/components/admin/spillere-tabs.tsx` — tab-bar [Tabell | Tavle]
- `src/app/admin/elever/page.tsx` — `<SpillereTabs aktiv="tabell" />` lagt til
- `src/app/admin/board/page.tsx` — `<SpillereTabs aktiv="tavle" />` lagt til, eyebrow oppdatert til "Tavle"-modus
- `src/components/admin/sidebar.tsx` — fjernet "Trener-tavle"-oppføring; "Spillere" peker til `/admin/elever` med tab-toggle
- Resultat: én "Spillere"-oppføring, brukeren kan veksle mellom Tabell og Tavle med tab

### Fase 2.3 — Mapbox på anlegg
- `prisma/schema.prisma` — `Location` utvidet med `latitude` + `longitude` (begge nullable)
- 🆕 `prisma/migrations/20260516000004_location_coords/migration.sql`
- `npm install mapbox-gl @types/mapbox-gl`
- 🆕 `src/components/admin/anlegg-mapbox.tsx` — klient-komponent som:
  - Bruker `mapboxgl` med lyst light-v11-style
  - Faller tilbake til "token mangler"-placeholder hvis `NEXT_PUBLIC_MAPBOX_TOKEN` ikke er satt
  - Henter koordinater fra DB; faller tilbake til navn-basert mapping (Fredrikstad, Drøbak, Miklagard, etc.)
  - Markers med popup (navn, adresse)
  - Klikk på marker scroller til tilsvarende LocationCard via `data-loc-id`
- `src/app/admin/anlegg/page.tsx` — erstattet `MapStub` med `<AnleggMapbox locations={…} />`, fjernet `MapStub`-funksjonen
- Klar når token legges inn

### Verifikasjon
- `npx tsc --noEmit` — 0 feil
- Visuelt verifisert: /admin redirecter til /admin/agencyos, "Hub" i meny, Tabell/Tavle-toggle på Spillere-sidene, Mapbox-placeholder vises på /admin/anlegg

### Commit
`feat: sprint 2 — admin-konsolidering (Hub, Spillere, Mapbox)`


---

## 2026-05-16 — Fase 1: Sprint 1 (rask QoL + UI-pussing)

**Branch:** `main`

### Fase 1.1 — Tekst-endringer
- `src/app/portal/mal/runder/ny-runde-modal.tsx` — `Felt label="Skår"` → `"Score"`
- `src/app/portal/tren/tester/page.tsx` — fane "NGF-standard" → "Team Norway"
- `src/app/portal/meg/utstyrsbag/page.tsx` — `Min utstyrsbag` → `Mitt utstyr`
- `src/app/portal/coach/layout.tsx` — sub-nav norske tegn: "Ovelser" → "Øvelser", "Onske om okt" → "Ønske om økt", "Book okt" → "Book økt"
- `src/app/portal/coach/ovelser/ny/page.tsx` + `[id]/rediger/page.tsx` — eyebrow/titleItalic norsk-tegn-fiks

### Fase 1.2 — Profilbilde-flyt
Verifisert at `src/components/shared/avatar-upload.tsx` + `src/lib/storage/avatar.ts` virker. Anders kan klikke avataren på `/portal/meg` og laste opp eget bilde via UI.

### Fase 1.3 — Test-sortering + filter
- 🆕 `src/components/portal/tester-liste.tsx` — ny klient-fil med:
  - Sortering TEK → SLAG → FYS → SPILL → TURN (custom rekkefølge)
  - Filter: Kategori (Alle/TEK/SLAG/FYS/SPILL/TURN), Status (Alle/Aldri tatt/Tatt), Sortér (Kategori/Sist tatt/Navn)
  - Søkefelt med onChange + tekst-match
- `src/app/portal/tren/tester/page.tsx` — server-side henter data, sender til klient-komponent som serialiserbare props

### Fase 1.4 — Utvidede SG-felter
- `prisma/schema.prisma` — `Round` utvidet med 16 nye nullable Float-felter (sgTee, sgApp200–50, sgChip/Pitch/Lob/Bunker, sgPutt0_3–40plus)
- `prisma/migrations/20260516000003_add_granular_sg/migration.sql` — manuell SQL-migrasjon
- `src/app/portal/mal/runder/actions.ts` — `RoundInput` utvidet med alle 16 felter
- `src/app/portal/mal/runder/ny-runde-modal.tsx` — fire kollapsbare under-grupper: Tee / Approach (per distanse) / Nærspill (Chip/Pitch/Lob/Bunker) / Putt (per distanse)

### Fase 1.5 — Gruppe-snarveier i kalender
- 🆕 `src/components/admin/gruppe-snarveier.tsx` — server-komponent som henter `Group`-modellen og rendrer chips med lenke til `/admin/elever?group={id}`. Fallback til hardkodet WANG/GFGK Junior.
- `src/app/admin/calendar/page.tsx` — erstattet `PyramideLegendCard` med `<GruppeSnarveier>` i sidebar. Fjernet `PyramideLegendCard`-funksjonen.

### Verifikasjon
- `npx tsc --noEmit` — 0 feil
- Lint — ingen nye feil i endrede filer (pre-existing problemer beholdt)
- Visuelt verifisert: Team Norway-fane, sortering, filter, "Mitt utstyr", Score-label, utvidet SG-modal, GruppeSnarveier i admin-kalender

### Commit
`feat: sprint 1 — tekst-pussing, test-filter, granulær SG, gruppe-snarveier`

---

## 2026-05-16 — Fase 0: Bug-fiks på `/portal/coach/ovelser`

**Branch:** `feature/coachhq-rebrand`

Sentry-feil `Event handlers cannot be passed to Client Component props.` Server Component (`page.tsx`) sendte inline JSX med `onClick`-handlers som `actions`-prop til `<ExerciseCard>` (client).

Løst ved å lage `src/components/portal/exercise-card-actions.tsx` (client) som tar serialiserbar string-id og bygger event handlers internt. Norsk-tegn-fiks i samme fil.

Commit: `fix: client component boundary på ovelser-siden`

---
