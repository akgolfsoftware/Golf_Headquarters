@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Hele plattformen for AK Golf Group. Ett monorepo, ett Next.js-prosjekt, fire produkter (Marketing, Booking, PlayerHQ, AgencyOS).

> **NORDSTJERNEN (les FØRST — målet vi aldri glemmer):** [`docs/platform/NORDSTJERNE.md`](docs/platform/NORDSTJERNE.md) — hva appen skal være for spiller/coach/forelder/forretning, de to loopene, planleggings-pyramiden, tilgangsskillet, interaksjons- og sikkerhetsprinsippene.
> **Start her:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md). Nåstatus: `docs/STATUS-NÅ.md`. Uavklart: `docs/AAPNE-SPORSMAAL.md`. Gamle `PLATFORM.md` er arkivert — ikke bruk den.
> **Masterplan (styringsdokument):** [`plans/skjermplan-master.md`](plans/skjermplan-master.md) eier scope, bølgerekkefølge og beslutninger for hele appen — alle økter refererer den; detaljplaner per bølge lages i plan-mode mot faktisk repo-tilstand.

## Detaljerte regler (`.claude/rules/`)
- `arkitektur.md` — produkter, ruter, mappestruktur.
- `design-system-regel.md` — designkanon v2 (retning C). **Fasit:** `docs/design-system/FASIT.md` + Claude Design-prosjektet. golfdata/v13 = overgang.
- `gotchas.md` — kjente feller (Prisma 7, Next.js 16 proxy, Supabase pooler, zod). Les FØR koding.
- `beslutninger.md` — ALLE låste beslutninger (juni–juli 2026): invarianter-aldri-sperrer, AgencyOS-navnet, tema, navne-kanon, Workbench-planlegging, analyse-samling, abonnement 299/gratis, FYS-avventing, design-kilde, skjermtekst-kilde. Les FØR produktbeslutninger — ved konflikt vinner `docs/platform/BUSINESS-RULES.md`.
- Domene-regler (Agentic OS, 2026-07-19): `mulligan-drift.md`, `wang-toppidrett.md`, `gfgk-junior.md`, `admin-tripletex.md` — Anders' driftsdomener utenfor appkoden. Relevante KUN for agent-økter som håndterer disse domenene; ignorer dem under ren kodeutvikling.

## Harde invarianter (aldri brytes — detaljer i rules-filene)
1. **Anbefalinger sperrer aldri:** ingenting i appen blokkerer trening. Aldri «kan ikke brytes»-kode/tekst.
2. **Farger kun fra designtokens** — aldri rå hex (håndheves av `check-no-hex` + ESLint). 8pt-grid i v2.
3. **Norsk bokmål (æ, ø, å) i all UI-tekst.** Copy hentes fra `docs/skjermtekst/`, aldri diktes.
4. **Lucide-ikoner, aldri emoji i UI.** Kun `ui/`-primitiver + `golfdata/` (overgang) + v2-mønstre.
5. **Domenelogikk kun i `src/lib/domain/`** (SG, HCP, FYS, CS, pyramide) — aldri reberegnes i komponenter/ruter.
6. **JSON fra Prisma valideres med zod** — `as unknown as T` er forbudt for forretningskritiske data.
7. **Main er portet:** aldri merge/push til main uten Anders' eksplisitte «ja» i samtalen.

## FØR DU RØRER EN SKJERM — `docs/MASTER-SKJERMPLAN.md` (LÅST regel)
Autoritativ liste over hver skjerm + 6 haker (Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker).
Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i SAMME commit. En skjerm er
ikke ferdig før alle 6 er grønne. Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista. Oppdater
dashboard-tallene + endringsloggen når du fullfører/endrer skjermer.

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)
- Next.js 16 (App Router, TypeScript strict, Turbopack), React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts`)
- Inter + Familjen Grotesk (display) + JetBrains Mono via `next/font/google`. Inter Tight er deprecated — lastes kun for legacy-flater. Kanon: `.claude/rules/design-system-regel.md`. Lucide React — eneste ikon-bibliotek. npm.
- Testrammeverk: `node:test` via `tsx --test` (enhetstester i `src/lib/**/*.test.ts`) + Playwright (e2e). vitest/jest er IKKE installert.

## Kjernelogikk og miljø
- **Domenelogikk** bor i `src/lib/domain/`: `sg.ts` (Strokes Gained, Broadie + Team Norway IUP-kalibrert),
  `hcp.ts`, `fys-score.ts`, `cs-progression.ts`, `pyramid-weighting.ts`, `ak-kategori.ts`/`spiller-kategori.ts`, `rules/`.
- **Miljøvariabler** valideres ved oppstart i `src/lib/env.ts`. Se `.env.example` for full liste.
  `tsx`-scripts utenfor Next-runtime (i `scripts/`) MÅ `import "./_env"` FØR `@/lib/prisma` (ESM-importrekkefølge).
- **API-ruter** (`src/app/api/`) er organisert per domene (`admin/`, `portal/`, `auth/`, `stripe/`, `cron/`,
  `ai-plan/`, `caddie/`, `mcp/` m.fl.) — speiler produktinndelingen i `arkitektur.md`, ikke REST-ressurser.

## Kommandoer
```bash
npm run dev                          # dev-server, http://localhost:3000 (skal starte uten warnings)
npm run build                        # prisma generate + next build + serwist (PWA service worker)
npm run lint                         # eslint

npm test                             # alle enhetstester (src/lib/**/*.test.ts)
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/auth/minor.test.ts   # ÉN testfil

npm run e2e                          # Playwright e2e (e2e/*.spec.ts + tests/e2e/*.spec.ts)
npx playwright test e2e/auth-guard.spec.ts    # kjør ÉN e2e-fil
npm run test:e2e:ui                  # Playwright UI-modus (debug)
npm run test:all                     # enhetstester + e2e

npm run verify                       # FULL sjekk før commit (prisma validate+generate, tsc --noEmit,
                                      # eslint --quiet, check-no-hex, build)
```

## Modell og effort
Standardmodell for dette prosjektet: **Fable 5.** Effort er spaken, ikke modellbytte —
**xhigh** for kritisk/vanskelig arbeid (arkitektur, invarianter, sikkerhet), **high** som
default, **medium/low** for rutinejobb (opprydding, dokumentflytting, små tekstendringer).

## Språk
All UI-tekst på norsk bokmål med æ, ø, å. Kommentarer kan være engelsk eller norsk — konsistent innenfor en fil.

## Arbeidsregler
1. **Plan Mode først** for alt ikke-trivielt.
2. **Implementer aldri uten godkjent plan.**
3. **Pek på eksisterende mønstre** (AthleticCard, lib-helpere) — bygg ikke på nytt det som finnes.
4. **Stopp og spør ved usikkerhet.** Aldri gjett.
5. **Aldri lag nye token-filer eller wireframe-mapper.** Unntak (2026-07-09): v2-redesignets tokens —
   `tokens/v2/` i designprosjektet og porten derfra til `src/styles/` — er godkjent av Anders.
6. **Feil → `.claude/rules/gotchas.md`.**

## Git-arbeidsflyt — GODKJENNINGSPORT for main (Anders' beslutning 2026-07-13)
Anders er ikke utvikler og skal ikke skrive git-kommandoer. Claude håndterer git — men main er portet:

1. **Alt arbeid skjer på gren.** Commit (Conventional Commits på engelsk) og push GRENEN
   fortløpende etter hver fullført oppgave — ikke spør om bekreftelse på det.
2. **ALDRI merge eller push til main uten Anders' eksplisitte «ja» i samtalen.** Gjelder også
   `git push origin HEAD:main`, PR-merge via `gh`, og merge av andre grener inn i main.
   Main er det som er live i appen — porten er Anders' kontroll på hva som slippes.
3. **Når en leveranse er klar:** åpne en Pull Request mot main (`gh pr create`) med
   klarspråk-beskrivelse av hva den gjør for appen + Vercel forhåndsvisnings-lenken, oppsummer
   for Anders og spør om det skal til main. Først etter «ja»: merge, push, bekreft.
   **PR-lista ER Anders' port-oversikt** (github.com/akgolfsoftware/Golf_Headquarters/pulls)
   — alt som venter på godkjenning skal stå der som PR, ingenting venter som løs gren.
4. **Unntak:** dokument-/regelendringer Anders eksplisitt har bedt om i samtalen kan gå rett til main.

Stopp og spør før destruktive operasjoner: `--force`, `reset --hard`, `rebase main`, sletting av remote branches.
Etter push: oppsummer på norsk hva som ble gjort.
Hooks i `.claude/settings.json` håndhever dette deterministisk (blokkerer sensitive filer,
krever bekreftelse for schema/main, kjører eslint + hex-gate etter edits) — se `.claude/hooks/`.

## Verifikasjon (kjør før hver commit)
```bash
npm run verify
```
Tilsvarer: `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src && node scripts/check-no-hex.mjs && npm run build`
(`check-no-hex.mjs` håndhever at farger kommer fra designtokens). `npm run dev` skal starte uten warnings.

## CI/CD (GitHub Actions, `.github/workflows/`)
- **`ci.yml`** kjører på hver PR og push til main: `prisma generate` → `tsc --noEmit` → `eslint` →
  hex-gate → enhetstester → `npm run build` → Playwright e2e. Dummy env-verdier — trenger ingen
  ekte secrets. `husky`/`lint-staged` kjører samme gate (eslint + tsc) på staged filer i pre-commit.
- **`deploy.yml` (Actions) er MANUELL** (`workflow_dispatch`), IKKE trigget av push til main. MEN:
  prod-deploy skjer likevel automatisk via **Vercels git-integrasjon** — push til main auto-deployer
  til akgolf-hq.vercel.app (kjør ALDRI `vercel deploy --prod` manuelt). Main-porten er deploy-porten.
- `playwright.yml`, `scrape-gjgt.yml`, `scrape-golfbox.yml` er egne workflows — sjekk filene ved behov.

## Sesjons-minne (hvor var vi sist)
Native auto memory (Anthropic, på) husker automatisk på denne maskinen. Cross-machine state ligger i
`~/ak-brain/prosjekter/akgolf-hq.md` — lastes automatisk ved øktstart (SessionStart-hook) og oppdateres
ved øktslutt (`/lagre-sesjon` + SessionEnd-hook).
