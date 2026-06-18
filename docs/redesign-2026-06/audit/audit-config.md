# Audit — config & teknisk gjeld

> Fase 1, sveip 4 av redesign-porteringen (`docs/redesign-2026-06/30-PORTERINGSPLAN.md`).
> Kartlegger config + teknisk gjeld med fokus på hva som må endres for hybrid-designsystemet.
> Skrevet 2026-06-17. Ingenting endret — kun kartlagt.

---

## globals.css i dag (token-struktur) + migrasjons-delta til hybrid

**Fil:** `src/app/globals.css` (452 linjer, 181 CSS-variabler). **Konvensjon:** Tailwind v4 CSS-first — INGEN `tailwind.config.ts`. Tokens defineres som CSS-variabler og mappes til utilities via `@theme inline`.

### Slik er fila bygd i dag (4 lag)

1. **`:root` (lyst tema, default)** — semantiske shadcn-tokens som **HSL-trippel uten `hsl()`-wrapper** (`--primary: 164 100% 17.3%`). Grupper: Surfaces, Brand, Neutrals, Feedback, Chart-tokens (`--chart-1..6`), Form/fokus, `--radius`.
2. **`.dark` (mørkt tema)** — samme token-navn, overskrevet. Aktiveres via `.dark`-klasse. I dark er `--primary` = lime (lime blir primær i mørkt).
3. **`@theme inline`** — mapper hver `--token` til en Tailwind-farge via `--color-x: hsl(var(--x))`. Her ligger også: radius-skala, font-familier, **pyramide-tokens** (`--pyr-fys..turn` rå hex + `--color-pyr-*`-aliaser + track-versjoner), wireframe-radius (`--radius-card/pill/btn/tier`), sidebar/chip-farger (rå hex), 8 avatar-gradienter, **et stort "Cockpit / Design package"-blokk** med ~50 rå-hex-tokens (`--color-brand-*`, `--color-surface-*`, `--color-ink-*`, `--color-line-*`, `--color-rail-*`, skygger `--shadow-*`, ease/duration).
4. **Base + utility-CSS** — `@layer base` border-default, iOS-font-fix, safe-area-utilities, `::selection`, typografi-helpers (`.h-display`, `.h1`–`.h3`, `.eyebrow`, `.kpi-value` osv.) speilet fra design-skill, og `@import "../styles/v2/patterns.css"`.

### Migrasjons-delta til hybrid (`15-DESIGN-SPRAK-TOKENS.md`)

Den store endringen er **konvensjons-skiftet + to nye, mer komplette paletter**. Det er ikke en farge-for-farge swap; det er en restrukturering.

**1. Format-skifte: HSL-trippel → rå HEX (STØRST risiko)**
Hybrid-spec oppgir alt som hex (`--cream #FAFAF7`, `--ink #0A1F17`). Dagens fil bruker HSL-trippel + `hsl(var(--x))`-wrapping i `@theme`. To valg:
- (a) Konverter hybrid-hex til HSL-trippel og behold dagens `hsl(var())`-mønster (minst forstyrrelse for shadcn-komponenter i `ui/`), eller
- (b) Bytt til hex + `@theme inline { --color-x: var(--x) }` (matcher spec direkte, men rører hver shadcn-primitiv).
- **Anbefaling:** (a) — behold HSL-trippel-konvensjonen, oversett hybrid-hex til HSL. Lavest blast-radius mot `src/components/ui/`.

**2. Lyst tema (PlayerHQ/Marketing/Forelder) — utvides**
Hybrid har FLERE nøytraler enn i dag: `--cream`, `--cream-2`, `--sand`, `--sand-deep`, `--paper`, `--border`, `--border-soft`, `--ink`, `--muted`, `--muted-2`. I dag finnes ~motpartene spredt (`--background`, `--secondary`, `--muted`, `--border` + duplikater i Cockpit-blokket `--color-surface-*`/`--color-ink-*`). **Delta:** legg til `cream-2`, `sand-deep`, `border-soft`, `muted-2` som ekte tokens; konsolider Cockpit-duplikatene inn i disse (de er i dag en parallell sannhet).
- BEHOLDES uendret (verdiene matcher allerede spec): `#FAFAF7`, `#F1EEE5`, `#FFFFFF`, `#E5E3DD`, `#0A1F17`, `#5E5C57`, forest `#005840`.

**3. Mørkt tema (AgencyOS) — byttes HELT ut til "Terminal mørk"**
Dette er det største innholds-deltaet. Hybrid innfører en 5-trinns terminal-bakgrunnsstige + egne linje-/tekst-/status-farger:
- Bakgrunner: `--t-bg #07100C`, `--t-bg-1 #0A1410`, `--t-bg-2 #0D1A14`, `--t-bg-3 #11221A`, `--t-bg-4 #16291F`.
- Linjer: `--t-line #1C2C23`, `--t-line-2 #243A2E`, `--t-line-soft rgba(180,225,195,.035)`.
- Tekst: `--t-fg #EAF2EC`, `--t-fg-2 #9DB0A4`, `--t-fg-3 #5E726A`.
- Status mørk: `--t-up #4FD08A`, `--t-down #F0683E`, `--t-warn #E8B43C`, `--t-info #5AA9F0` + lime-flater `--lime-bg`/`--lime-bg-2`.
- **Delta:** dagens `.dark`-verdier (forest-baserte `#0F2A22`/`#163027`/`#2B4F42`) er IKKE den nye terminal-stigen. Hele `.dark`-blokken skrives på nytt. NB: dagens `.dark` setter `--primary` = lime; hybrid sier lime er KRYDDER, aldri store flater — verifiser at primær-CTA-flater i AgencyOS ikke fyller stort med lime.

**4. LÅST (rør ALDRI) — verifisert mot spec, matcher i dag:**
- Lime: `--lime #D1F843` (+ nye `--lime-deep #B9E022`, `--lime-dim #A9CF2E` må legges til; finnes ikke i dag).
- Pyramide-akser (mode-invariant): `pyr-fys #005840` → `pyr-tek #B8852A` → `pyr-slag #2563EB` → `pyr-spill #D1F843` → `pyr-turn #A32D2D`. Identisk med dagens `--pyr-*`. **Beholdes 1:1.**
- Status lys: `--ok #1A7D56`, `--warn #B8852A`, `--down #A32D2D`, `--info #2563EB`. Matcher dagens `--success`/`--warning`/`--destructive`/`--info`.

**5. Radius — skala endres**
Hybrid: `sm 8 · md 14 · lg 20 · xl 28 · full 999`. I dag: `--radius: 1rem` (16px) med md = calc(−4)=12, sm = calc(−8)=8, pluss wireframe-radius `card 16/pill 20/btn 8/tier 10`. **Delta:** md 12→14, lg 16→20, ny xl 28. Påvirker alle `rounded-md/lg`-flater + must oppdatere `design-tokens.ts`-speilet.

**6. Skygger — nye navn/verdier**
Hybrid: `--sh-sm/md/lg/forest`. I dag: `--shadow-card/card-hover/deck`. **Delta:** legg til hybrid-skygge-tokens (særlig `--sh-forest` for forest-glow); behold eller alias de gamle.

**7. Bevegelse + typografi — i hovedsak beholdes**
Fonter (Inter / Inter Tight / JetBrains Mono via `next/font`) og motion-verdier (150–250 ms ease-out) matcher allerede. Ingen font-bytte. Typografi-helperne (`.h-display`, `.eyebrow`, `.kpi-value`) holder, men sjekk casing/tabular-nums-regler mot spec.

**8. Bakgrunns-tekstur — ny**
Hybrid vil ha subtile radial-gradienter (lys) + knapt synlig rutenett (mørk, `--t-line-soft`). I dag finnes `.grain` i `patterns.css`. **Delta:** legg til gradient-bakgrunn for lys + rutenett-hint for mørk.

**Oppsummert delta:** behold lime + pyramide + status-farger + fonter; konverter format-konvensjon (eller behold HSL); utvid lys palett med 4 nøytraler; **skriv `.dark` helt om til terminal-stigen**; juster radius-skala; konsolider det parallelle "Cockpit / Design package"-hex-blokket (i dag duplikat-sannhet) inn i de semantiske tokens for å unngå at redesignet drar med seg gammel dobbel-definisjon.

---

## design-tokens.ts (hva oppdateres)

**Fil:** `src/lib/design-tokens.ts` — TS-speil av globals.css, brukt i JS (charts/Recharts, animasjoner). Kun 3 filer importerer fra den i dag (lav blast-radius). Den definerer IKKE egne farger (refererer `hsl(var(--x))`) UNNTATT `pyramidColors` som er rå hex.

Må oppdateres i takt med globals.css:
- **`colors`-objektet:** hvis hybrid legger til lys-nøytraler (`cream-2`, `sand`, `sand-deep`, `border-soft`, `muted-2`) og terminal-mørk-tokens (`t-bg-*`, `t-fg-*`, `t-line-*`), bør de speiles her hvis charts/JS skal bruke dem. Minst: ny status-mørk (`t-up/t-down`) hvis Recharts skal fargelegge mørkt AgencyOS riktig.
- **`pyramidColors`:** UENDRET (matcher hybrid 1:1) — bekreft kommentaren peker på riktig kilde.
- **`radius`-objektet:** OPPDATERES — i dag `sm 8 · md 12 · lg 16 · xl 20 · 2xl 24`. Hybrid: `sm 8 · md 14 · lg 20 · xl 28` (+ full 999). md/lg/xl-verdiene avviker → må rettes ellers blir JS-speilet feil.
- **`motion`:** sannsynligvis uendret (150–250 ms ease-out matcher).
- **`fonts`/`typography`:** uendret (samme tre fonter).
- **`chartPalette`:** verifiser at chart-1..6 fortsatt gir mening i ny terminal-mørk palett (kontrast mot `--t-bg-*`).

---

## Build/config-filer (status)

| Fil | Status | Merknad for redesign |
|---|---|---|
| `next.config.ts` | OK | `turbopack.root = import.meta.dirname` satt (påkrevd per CLAUDE.md). MDX + Serwist PWA + Supabase image-host + ~70 redirects + security-headers. Berøres ikke av token-migrasjon. Redirect-listen henger sammen med rute-opprydding (annen sveip). |
| `prisma.config.ts` | OK | Prisma 7-mønster: schema `provider`-only, `datasource.url = env("DIRECT_URL")`, laster `.env.local` eksplisitt. Ikke berørt av redesign. |
| `package.json` | OK | Next 16.2.6, React 19.2.4, Prisma 7.8, Tailwind v4, zod 4, lucide-react 1.14. `build = prisma generate && next build`. Ingen `tailwind.config` (CSS-first). Ingen design-/token-byggesteg å endre. |
| `tsconfig.json` | OK | strict, `noEmit`, `moduleResolution: bundler`, alias `@/* → ./src/*`, ekskluderer `node_modules` + `_archive`. |
| `eslint.config.mjs` (flat) | OK + relevant | Flat config (`eslint/config`) på toppen av `eslint-config-next` core-web-vitals + typescript. **Drift-vern via `no-restricted-syntax`:** blokkerer hardkodet hex + off-grid spacing (p-3/5/7/9) — MEN kun scoped til `src/components/v2/**` og `(internal)/design-system-v2/**`. **Redesign-konsekvens:** når nye komponenter bygges utenfor `v2/`, fanger linten IKKE hardkodet hex. Vurder å utvide glob-en til `athletic/` + portede skjermer for å håndheve "ingen hardkodet hex"-gaten (port-plan Fase 2/5). |
| `postcss.config.mjs` | OK | Kun `@tailwindcss/postcss`. Standard Tailwind v4-oppsett. |
| **oxlint** | FINNES IKKE | Ingen oxlint i repoet — kun ESLint. (Sveip-spørsmålet nevnte eslint/oxlint; svar: kun eslint.) |
| `src/proxy.ts` | OK | Next 16 "proxy" (gml. middleware), nodejs-runtime. Bygger CSP m/ nonce, auth-guard på `/portal`+`/admin`+`/intern`, innboks-redirects, skjuler prototype-stats-sider i prod. **CSP `style-src 'unsafe-inline'`** kreves av Tailwind v4 + inline CSS-vars — relevant: redesign må ikke innføre eksterne style-kilder uten å oppdatere CSP. Ikke berørt av token-bytte i seg selv. |
| `vercel.json` | OK | 15+ cron-jobber (plan-watcher, benchmark-sync, datagolf-sync, turneringer-*, cleanup-* m.m.). Ikke designrelevant. |

---

## Scripts (aktiv vs engangs)

**Mappe:** `scripts/` — ~70 filer. Tre roller. Ingen er en del av app-runtime; alle er CLI/utility.

### Aktive (referert fra package.json / cron / LaunchAgent)
- `skjerm-kart.ts` → `npm run kart` (master-skjermplan-generator). **Relevant for redesign** (skjerm-status).
- `design-index.mjs` → `npm run design-index` (lokal klikkbar design-oversikt; `public/design-handover` er gitignored/lokal).
- `meg-tilbakeskriving/run.ts` → `npm run meg:tilbakeskriving` (+ egen `launchagent`, `migration.sql`, `destiller.ts`, `skriv-*.ts` — Meg-assistenten).
- `meg-index-vaults.ts` → kjørt via `meg-index.sh` + `com.akgolf.meg-index.plist` (LaunchAgent, planlagt). Logg `meg-index.log` (1,4 MB) ligger i mappa.
- `run-benchmark-sync.ts` → relatert til cron `benchmark-sync` (DataGolf-fasiter, mandager).
- `_env.ts` → delt env-preload (MÅ importeres før `@/lib/prisma` i tsx-scripts, jf. memory).

### Aktive shot-/QA-scripts (manuell kjøring, men løpende verktøy)
- **Design-porting-screenshots (kjernen i porting-gaten):** `app-shot.mjs`, `design-shot.mjs`, `design-shot-meg-undersider.mjs`, `agencyos-shot.mjs`, `auth-shot.mjs`, `public-shot.mjs`, `shot-forside.mjs`, `shot-screens.mjs`, `shot-rest.mjs`, `shot-gated2.mjs`. **`redesign-shot.mjs` (datert i dag, 2026-06-17)** — skyter `design-retninger/E-komponent-lab.html` fra Drive; nyeste, knyttet direkte til redesign-arbeidet.
- QA/koblings-sjekk: `kobling-playerhq.mjs`, `kobling-agencyos.mjs`, `bygg-kobling-test.mjs`, `qa-links.sh`, `smoke-test.sh`, `security-lint.sh`, `audit-portal-links.ts`, `audit-portal-stubs.ts`, `audit-rls.ts`, `audit-stripe.ts`, `verify-live-session.ts`, `check-services.ts`.

### Engangs / historiske (import, seed, migrering, dedupe — trygge å arkivere)
- Import (datostemplet, ferdig brukt): `add-players-2026-05-13.ts`, `import-beta-users.ts`, `import-clippd-college.ts`, `import-from-notion.ts`, `import-gjgt.ts`, `import-norske-turneringer.ts`, `import-players.ts`, `import-tournaments.ts`, `batch-import-gfgk-2026.ts`, `bootstrap-turneringer.ts`.
- Seed: `seed-*.ts` (anders-spiller, baner, design-koblinger, physical-exercises/-templates, screentest(+coach), stall-detalj, test-definitions, wagr-benchmark, `_seed-wagr-koblinger.ts`).
- Dedupe/cleanup/migrering: `dedupe-player-names.ts`, `dedupe-tournament-data.ts`, `cleanup-tournaments.ts`, `fix-demo-oyvind.ts`, `reset-auth-passwords.ts`, `reimport-stripe.ts`, `review-name-variants.ts`, `create-storage-buckets.ts`.
- Scrape (eksterne data): `scrape-golfbox.ts`, `scrape-golfstat-ncaa.ts`, `scrape-wagr-rounds.ts`.
- Asset-generering (kjørt, output committet): `generate-icons.mjs`, `generate-pwa-splash.mjs`.
- Design-inventar (eldre, mai): `extract-design-inventory.ts`, `extract-routes.ts`.

> **Redesign-relevant:** shot-/diff-scriptene (særlig `redesign-shot.mjs`, `app-shot.mjs`, `design-shot.mjs`) er motoren i porting-gaten og skal beholdes/vedlikeholdes. Engangs-import/seed-scriptene er kandidater for opprydding i en annen sveip (struktur & død kode), ikke her. `meg-index.log` (1,4 MB i scripts/) er en logg som ikke bør ligge i scripts-mappa.

---

## Tester (hva finnes, dekning)

**Runner:** `node:test` via `tsx` (IKKE vitest — vitest brekker CI, jf. memory). Kommando: `npm test` (`tsx --conditions=react-server --test src/lib/__tests__/*.test.ts ...`).

**Enhetstester:** 32 `*.test.ts` under `src/lib/__tests__/`. Dekning er ren **domene-/lib-logikk**, ikke UI/komponenter:
- Domene: `domain/sg`, `domain/hcp`, `domain/plan-effectiveness`, `domain/cs-progression`, `domain/pyramid-weighting`.
- AI: `ai/caddie`, `ai/daily-brief`, `ai/sg-interpretation`, `ai/performance-peaking`, `ai/vinn-tilbake`, `ai/plan-revision`, `ai/agents-index`.
- Meg-assistent: `meg/*` (router, access, tools×4, briefs, pending, ollama, embeddings) + `meg-env`, `meg-telegram`, `meg-classify-schema`.
- Øvrig: `test-scoring`, `stripe-webhook`, `plan-template-schema`, `rate-limit`, `calendar-result`, `feature-flags`, `training/korrelasjon`, `training/volum`.

**E2E:** 5 Playwright-specs i `e2e/` (`npm run e2e`): `auth-guard`, `auth-redirect`, `booking-drop-in`, `credit-booking`, `marketing`.

**Dekningshull relevant for redesign:** Ingen visuell-regresjon/komponent-tester. Designsystemet (tokens, athletic-komponenter) har **null automatisert testdekning** — kvalitetssikringen hviler helt på porting-gatens manuelle screenshot-diff + brand-enforcer-agent. Token-migrasjon brekker derfor ikke noen test (ingen test leser farger), men gir heller ingen sikkerhetsnett — visuell verifisering må gjøres manuelt per porting-plan Fase 2.

---

## tsc/build-resultat (warnings/feil)

Kjørt 2026-06-17 på `main`.

- **`npx tsc --noEmit`: PASS** — 0 feil, 0 output (rent).
- **`npm run build` (prisma generate && next build): PASS** — exit 0. `✓ Compiled successfully in 28.0s`. Full rute-tabell generert (marketing/portal/admin/stats/api).

**Warnings (ingen er byggefeil):**
1. **Serwist + Turbopack-advarsel** — `[@serwist/next] WARNING: ... doesn't support Turbopack`. Kjent/forventet (PWA service-worker-plugin støtter ikke Turbopack ennå). Build lykkes uansett. Kan dempes med `SERWIST_SUPPRESS_TURBOPACK_WARNING=1`. Ikke designrelevant.
2. **`[google-calendar] freebusy failed ... invalid_grant`** (mange linjer) — RUNTIME-datahenting under prerender av statiske sider; utløpt Google Calendar-token (fail-closed, jf. memory "GCal fail-closed"). IKKE en byggefeil; Anders må re-autorisere i prod før go-live. Ikke designrelevant.

Konklusjon: ts-/build-fundamentet er grønt før redesign starter. Ingen tekniske blokkerere; warnings er kjente og uavhengige av token-migrasjonen.
