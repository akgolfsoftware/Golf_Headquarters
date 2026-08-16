# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ) med Supabase Postgres. Alt av forretningslogikk er norsk bokmål.

> Stistrukturen under er verifisert mot filsystemet 2026-07-26. Ved tvil: sjekk filen faktisk finnes
> før du stoler på en lenke — dokumentkartet har flyttet på seg flere ganger.

## Master
Fullstendig regelverk og begrunnelse: docs/ak-master.md. Ved konflikt mellom
CLAUDE.md og ak-master.md vinner ak-master.md.

## Start her — les disse filene først
- **`docs/platform/NORDSTJERNE.md`** — produktets nordstjerne. Alltid gjeldende målbilde.
- **`docs/platform/AGENT-BRIEF.md`** — agent-onboarding: stack, eksakte versjoner, prosjektkart. Les FØR arbeid.
- **`docs/STATUS-NÅ.md`** — hva er levert/ikke levert akkurat nå. (Ligger i `docs/`, ikke `docs/platform/`.)
- **`docs/port/fasit-liste-paper.md`** — designdekning: hvilke skjermer har Paper-fasit, hvilke mangler.
- **`docs/port/plan-designport-alle-skjermer.md`** — porteringsplan, status per bølge og ferdig-definisjon per skjerm.
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
analyse-samling, abonnement 299/gratis, FYS-avventing. **Design (LÅST 2026-07-31, OVERSTYRT 2026-08-03
— se invariant 2 under):** Claude Design-prosjektet **«AK Golf HQ — Claude Paper»** (`605a48cc`, hentet
via `claude-design`-MCP-verktøyet) er designfasit; full port til `src/` kjører nå aktivt, se
`docs/port/plan-designport-alle-skjermer.md`. Ved konflikt vinner `docs/platform/BUSINESS-RULES.md`.

## Harde invarianter (brytes aldri)
1. **Anbefalinger sperrer aldri:** ingenting i appen blokkerer trening. Aldri «kan ikke brytes»-kode/tekst.
2. **Claude Paper vinner alltid (LÅST 2026-08-03/05).** Claude Design-prosjektet «AK Golf HQ — Claude
   Paper» (`605a48cc`, skjermer i `fase1/`) er eneste designfasit — for design OG produksjonskode.
   Full porten kjører nå, skjerm for skjerm, per `docs/port/plan-designport-alle-skjermer.md`.
   Tidsplanen fra 31.07 («C, smalt» til etter piloten) er **overstyrt** og skal ikke følges.
   Mangler skjermen fasit: `docs/port/monsterdokument-paper.md` er eneste designkilde.
   **Sier et dokument, en skill eller en kodekommentar noe annet enn Paper-fasiten, vinner
   Paper-fasiten — og dokumentet skal rettes, ikke følges.** Hex-gaten for Presis forblir borte.
3. **Norsk bokmål i all UI-tekst.**
4. **Lucide-ikoner** — aldri emoji i UI. Primitiver fra `components/ui/` + `v2/`-mønstre.
5. **Domenelogikk kun i `src/lib/domain/`** — aldri i komponenter.
6. **`as unknown as T` er forbudt** for forretningskritiske data — bruk zod-schemas (`src/lib/validation/schemas.ts`).
7. **`main` er porten.** Arbeid skjer i branch + PR. **Aldri push til main uten eksplisitt «ja» fra Anders** —
   unntak: dokument-/regelendringer Anders eksplisitt har bedt om i samtalen kan gå rett til main.
   (Håndheves av PreToolUse-hook — se Hooks under.)
8. **Enkelhet (2026-07-21):** behold alle funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å
   forstå = feil design. (Produktprinsipp — uavhengig av hvilket designsystem som gjelder.)

## Skjermarbeid (gjeldende prosess)

**Designfasit:** Claude Paper — Claude Design-prosjektet `605a48cc` er **originalen**.
**Arbeidsfasiten er det lokale speilet `designsystem/paper/`** (254 HTML: `fase1/` + `fase2/` +
`jarvis/`) — det er den du leser, differ og sammenligner mot. Speilet gjelder så lenge
`designsystem/paper/SYNC-STATUS.md` viser at det er målt mot siste zip fra Anders (nå: zip
levert 16.08.2026 21:11, 839 filer — 0 avvik).
**Opprett aldri en parallell kopi av fasiten** (`docs/port/paper/` e.l.) — to kopier av samme HTML
er to sannheter om samme skjerm, og alle `docs/port/`-dokumentene peker allerede hit med
`designsystem/paper/…`-stier. Speilet skal være byte-identisk med zip-en; ligger det interne
duplikater INNE i speilet (f.eks. `design_handoff_rutefasit_agenticos/docs-port/rutefasit.md`),
er de en del av leveransen og skal stå — men de **styrer ingenting**. Ved motstrid gjelder
`docs/port/`-versjonen, aldri speilets kopi.

**Resynk skjer når Anders leverer ny zip, ikke før hver skjerm.** Den gamle regelen krevde henting
via `claude-design`-MCP før hver sammenligning. Den koblingen er ikke tilgjengelig i alle økter, så
regelen sendte arbeidet inn i en blindvei og sådde tvil om det ene som faktisk virker. Endret
12.08.2026 etter Anders' beslutning. Er MCP-en tilgjengelig og du er i tvil: verifiser gjerne — men
det er ikke et krav for å jobbe.

**Dekningsregnskap:** `docs/port/fasit-liste-paper.md` — hvilke skjermer har fasit, hvilke må designes uten.

**Plan og rekkefølge:** `docs/port/PORTPLAN.md` — én sesjon per mal-fasit, avhengighetsrekkefølge,
og hva som blokkerer hva. Kvalitetsporten er skjermbilde-gaten rett under + `PAPER-ZIP-CHECKLIST.md`.
(`docs/port/plan-designport-alle-skjermer.md` er **UTGÅTT 12.08.2026** — den er stemplet slik i
egen header og listet som erstattet i `docs/port/GYLDIGHET.md`. CLAUDE.md pekte på den som
gjeldende kvalitetsport frem til 17.08; ikke gjeninnfør den henvisningen.)

**Skjermbilde-gaten:** ingen skjerm-PR merges uten at Anders har SETT skjermen. Skjermbilde i samtalen
(synlig fra iPhone), mobil 390px alltid først, deretter desktop, lys OG mørk, fasit-utsnittet ved siden av,
alle fire tilstander (Suksess/Tom/Laster/Feil), maks én oransje handling, og klikk-verifisert — ikke bare
fotografert.

(Den gamle `docs/MASTER-SKJERMPLAN.md` med 6 haker per skjerm er slettet 05.08.2026 — hakene var satt mot et
avviklet designprosjekt. Ligger i git-historikken.)

### Kontrakten — slik bygges en rute fra en mal-fasit
Flyttet hit fra `docs/port/rutefasit.md` 16.08.2026. **Gjelder alltid, skal aldri gjentas i en prompt.**

1. Finn ruten i `docs/port/rutefasit.md`. Åpne **mal-fasiten** (`designsystem/paper/…`) side om side m390 + d1280.
2. Bygg malen 1:1; **avvikslinjen** er ALT som skiller ruten fra malen. Står det ikke der, finnes det ikke.
3. Tilstander arves fra malens riggbar (tom/laster/feil er tegnet — bruk dem, aldri fake data).
4. **Én-linje-testen:** klarer du ikke beskrive rutens avvik i én setning, STOPP — ruten trenger egen fasit.
   Meld den, ikke improviser.
5. Skjermen er ferdig når variant-raden er ført i `PP-W*-VARIANTS` med m390 + d1280-skjermbilde
   (i tillegg til skjermbilde-gaten over).

### Claude-følelsen (bindende for alle varianter)
Flyttet hit fra `docs/port/rutefasit.md` 16.08.2026. Målet er at plattformen kjennes som Claude
desktop/mobil: samtale først, artefakter ved siden, kommando under fingrene.

- **Chat-først:** `/portal` ER samtalen (fasit `playerhq-chat-*`); konsollen er samtale + artefaktkolonne
  (PP-2.1-briefen). En variantrute bygger aldri en oppslagstavle der malen har en samtale.
- **Composer:** festet spørrefelt nederst på alle desktop-flater, mobil kun Hjem (komponent `Composer`).
  Varianter fjerner den aldri.
- **⌘K overalt:** CommandPalette (S6 «Alt») er inngangen til alt uten meny-plass — varianter lenker dit
  i stedet for å legge til nav.
- **Artefaktkolonnen:** detaljpanelet til høyre (380 px) forklarer og avgjør valgt sak — galleriets
  hovedfunn var at den manglet. Master–detalj-varianter fyller panelet, aldri en ny side.
- **Mobil = app:** 430 px-kolonne, TabBar, BottomSheet i stedet for modal, 44 px trykkflater. Ingen
  desktop-tabell presset inn i 390 px — bruk malens mobiltilstand.
- **Skall-monopol (F1):** ingen rute bygger egen header/nav/chrome. Avvik = bug.
- **Paper:** papir/blekk, maks én clay-CTA per skjerm, Poppins/Lora/Plex Mono, alle tall mono med
  komma-desimal, norsk bokmål, aldri emoji.

**Porteringsrekkefølge og sesjonsinndeling:** `docs/port/PORTPLAN.md` — én sesjon per mal-fasit,
aldri per rute.

## Stack
- **Next.js 16.2.6** (App Router, Turbopack, TS strict) + **React 19.2.4** + Vercel. Node 24 i CI.
- **Prisma 7.8** + `@prisma/adapter-pg` + **Supabase** Postgres (RLS) — Supabase Auth (Google + e-post/passord).
- **Tailwind CSS v4** (CSS-first `@theme`, ingen config-fil) — uttrykk via `src/app/globals.css`.
- **Fonter (re-verifisert mot kode 2026-08-16 — fontporten er GJENNOMFØRT):**
  Paper-fasiten er **Poppins** (UI/titler) + **Lora** (prosa/AI-svar) + **IBM Plex Mono** (tall). Alle tre
  lastes i `src/app/layout.tsx` og eksponeres som `--font-poppins`/`--font-lora`/`--font-ibm-plex-mono`,
  videre som `--p-font-sans`/`--p-font-serif`/`--p-font-mono` i `src/styles/paper-tokens.css`.
  De globale tokenene (`--font-sans`/`--font-display`/`--font-mono` i `globals.css`) OG de scoped
  stylesheetene (`golfdata-tokens.css`, `onboarding.css`, wizardene) leser alle Paper-fontene;
  `--font-ui` er broet til `var(--p-ui)` (Poppins). Tidligere avvikslister her (hubs.css,
  admin-hero/player-hero m.fl.) gjaldt filer som ikke lenger finnes — ikke gjenopprett dem.
  Kjente småresten (ufarlige): `teknisk-plan.css:16` har Inter kun som *fallback* bak
  `var(--font-sans)`; `klubb-wizard.tsx:676` har én `fontFamily="Inter"` i en SVG-illustrasjon;
  `src/components/planlegge-v2/` er død kode uten konsumenter (slettes i PP-B5).
  **Inter Tight er fjernet** — ikke gjeninnfør. Bygg nytt mot Paper-fasiten (dvs. de globale tokenene,
  aldri `--font-familjen-grotesk`/`--font-jetbrains-mono`/`--font-inter` direkte i ny kode).
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

Strukturkartet bor i `docs/platform/AGENT-BRIEF.md` §Mappestruktur (flyttet dit 2026-08-16
— den fila eier agent-konteksten). Kort: fire produkter (marketing, booking, PlayerHQ under
`portal/`, AgencyOS under `admin/`) + flere top-level-flater — sjekk filsystemet før du
oppretter nye ruter.

## Arbeidsregler
1. **Ikke be om tillatelse for små endringer** — typoverifisering, lint, feilretting.
2. **Be Anders før:** dependencies, DB-migrasjoner, rute-endringer som fjerner URLer, nye features, større
   refaktoreringer.
3. **Kjør `npm run verify` før commit** — repoet må bygge rent uten warnings.
4. **Git:** branch (`feature/...`, `fix/...`) → commit → push (uten å spørre) → åpne PR og spør Anders om main.
   (Unntak: dokument-/regelendringer Anders eksplisitt har bedt om kan gå rett til main.)
   **Grenen slettes når PR-en merges** (`gh pr merge --delete-branch`) — ellers gror lista igjen.
   **Parkert arbeid arkiveres, slettes aldri:** `git tag -a arkiv/<gren> <gren> -m "..."` + `git push
   origin --tags`, så slett grenen. Taggen bevarer alt; hent tilbake med
   `git switch -c <gren> arkiv/<gren>`. Ryddet 06.08.2026: 17 grener → 6, ti arkivert som tagger.
   **`git branch --merged` lyver** her (squash-merge) — sjekk `gh pr list --head <gren> --state all`.
5. **Token-filer:** ingen låst token-kanon per nå (designlåser tømt 2026-07-25) — men ikke opprett nye
   parallelle token-systemer; vent på Open Design.
6. **Følg gotchas-listen** (`.claude/rules/gotchas.md`) — Prisma 7 driver adapter, `pg.Pool`, zod ved
   API-grenser, Oslo-tid via `uke-helpers.ts`, `proxy.ts` ikke `middleware.ts`.
7. **Feillogg (ny praksis 2026-08-06):** kostet noe i økten ekstra tid (feilslått antagelse, gjentatt feil,
   fasit-avvik) — legg én linje i `docs/feillogg.md` (format øverst i filen), lagt inn av `/pr` ved behov.
   Ingen feil i økten: ikke rør filen. Formålet er å finne mønstre over tid, ikke logge hver økt.
8. **Token-økonomi (2026-08-06):** se `.claude/rules/gotchas.md` §Token-økonomi — korte versjon: aldri
   la lange kommandoer (build/test/`npm ci`) strømme rått inn i samtalen (redirect til fil, tail/grep),
   grep i store dokumenter fremfor å lese dem hele, stol på PR-webhooks fremfor å polle GitHub Actions.
   Senker ALDRI kvalitetsgaten (`npm run verify` er fortsatt obligatorisk) — kun hvordan output håndteres.

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
