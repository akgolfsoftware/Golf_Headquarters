@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Hele plattformen for AK Golf Group. Ett monorepo, ett Next.js-prosjekt, fire produkter (Marketing, Booking, PlayerHQ, AgencyOS).

> **NORDSTJERNEN (les FØRST — målet vi aldri glemmer):** [`docs/platform/NORDSTJERNE.md`](docs/platform/NORDSTJERNE.md) — hva appen skal være for spiller/coach/forelder/forretning, de to loopene, planleggings-pyramiden, tilgangsskillet, interaksjons- og sikkerhetsprinsippene.
> **Start her:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md). Nåstatus: `docs/STATUS-NÅ.md`. Uavklart: `docs/AAPNE-SPORSMAAL.md`. Gamle `PLATFORM.md` er arkivert — ikke bruk den.
> **Masterplan (styringsdokument):** [`plans/skjermplan-master.md`](plans/skjermplan-master.md) eier scope, bølgerekkefølge og beslutninger for hele appen — alle økter refererer den; detaljplaner per bølge lages i plan-mode mot faktisk repo-tilstand.

## Detaljerte regler (`.claude/rules/`)
- `arkitektur.md` — produkter, ruter, mappestruktur.
- `design-system-regel.md` — ÉN designkanon (8. juli 2026): det levende Claude Design-prosjektet, hentet via DesignSync. Ingen unntak, ingen "andre lag" for driftsskjermer.
- `gotchas.md` — kjente feller (Prisma 7, Next.js 16 proxy, Supabase pooler, zod). Les FØR koding.

## FØR DU RØRER EN SKJERM — `docs/MASTER-SKJERMPLAN.md` (LÅST regel)
Autoritativ liste over hver skjerm + 6 haker (Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker).
Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i SAMME commit. En skjerm er
ikke ferdig før alle 6 er grønne. Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista. Oppdater
dashboard-tallene + endringsloggen når du fullfører/endrer skjermer.

## Låste beslutninger (juni 2026 — gjelder til Anders endrer dem)
> **Fasit-kilde:** `docs/platform/BUSINESS-RULES.md`. Listen under er sammendrag — ved konflikt vinner BUSINESS-RULES.md. Ikke dupliser nye regler hit.

> ⚠ **2026-06-22:** 4 regel-klynger er låst OPP (ikke lenger hard constraint) — tema-toggle,
> abonnement/pris-nivåer, FYS-formel/A–K-tall, cockpit stall-SG/plan-etterlevelse. Verdier
> under avklaring, se `docs/REGLER-OPPLAST-2026-06-22.md`. Ikke håndhev disse fire som låst
> før nye verdier er bekreftet — resten av lista under står fast.

- **Invarianter er anbefalinger, aldri sperrer:** ingenting i appen blokkerer trening. Avvik fra
  plan/regel vises i klarspråk til brukeren; sterkt avvik varsler coach. Aldri skriv «kan ikke
  brytes»-kode eller -tekst — se `plans/skjermplan-master.md` prinsipp 3 for fasit.
- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Tema (OPPHEVET 2026-07-09, v2-redesign):** «PlayerHQ alltid lyst»-regelen er opphevet — tema-strategi per app avgjøres av Anders i v2-retningsvalget (fase 3, `~/.claude/plans/breezy-forging-brook.md`). Anders' referansebilder er overveiende mørke. Inntil valget: ikke håndhev lys/mørk som regel; eksisterende skjermer beholder dagens oppførsel.
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene, ikke bytt ham ut.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt** dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement (ingen tier-nivåer):** PlayerHQ-tilgang er gratis eller 299 kr/mnd. **Gratis** hvis: 1 mnd prøveperiode, ELLER coaching-pakke (Performance / Performance Pro), ELLER gruppe via AK Golf. **299 kr/mnd** for alle andre. «Performance / Performance Pro» er **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum — vis aldri i UI).
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod referanseverdier før Anders gir grønt lys.
- **Design-kilde (oppdatert 9. juli 2026 — v2-REDESIGN PÅGÅR):** kanon-kilden er fortsatt det LEVENDE Claude Design-prosjektet («AK Golf HQ Design System», `claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`) via DesignSync — men målbildet er nå **v2-generasjonen** (`ui_kits/v2/` + `tokens/v2/`) som designes per `~/.claude/plans/breezy-forging-brook.md`. v13/golfdata (`src/components/athletic/golfdata/`) er OVERGANGS-LAG: vedlikehold OK, nye store flater venter på v2-retningsvalget. `public/design-handover/` er stale og skal ikke brukes. Full regel: `.claude/rules/design-system-regel.md`. **Designdommer:** `.claude/skills/ak-designekspert` (gap meldes, ikke improviseres).
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm + design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i produksjonsfiler — disse er slettet fra prosjektet.

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)
- Next.js 16 (App Router, TypeScript strict, Turbopack), React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts`)
- Inter + Familjen Grotesk (display) + JetBrains Mono via `next/font/google`. Inter Tight er deprecated — lastes kun for legacy-flater. Kanon: `.claude/rules/design-system-regel.md`. Lucide React — eneste ikon-bibliotek. npm.
- Testrammeverk: `node:test` via `tsx --test` (enhetstester i `src/lib/**/*.test.ts`) + Playwright (e2e). vitest/jest er IKKE installert.

## Kjernelogikk og miljø
- **Domenelogikk** (matte/forretningsregler brukt på tvers av PlayerHQ og AgencyOS) bor i `src/lib/domain/`:
  `sg.ts` (Strokes Gained, Broadie + Team Norway IUP-kalibrert), `hcp.ts`, `fys-score.ts`, `cs-progression.ts`,
  `pyramid-weighting.ts`, `ak-kategori.ts`/`spiller-kategori.ts`, `rules/`. Gjenbruk disse — ikke regn ut SG/HCP
  på nytt i en komponent eller API-rute.
- **Miljøvariabler** valideres ved oppstart i `src/lib/env.ts`. Kritiske (appen starter ikke uten): Supabase-URL/nøkler,
  `DATABASE_URL`, `DIRECT_URL`. Se `.env.example` for full liste. `tsx`-scripts utenfor Next-runtime (i `scripts/`)
  MÅ `import "./_env"` FØR `@/lib/prisma`, ellers feiler DB-tilkoblingen (ESM-importrekkefølge).
- **API-ruter** (`src/app/api/`) er organisert per domene (`admin/`, `portal/`, `auth/`, `stripe/`, `cron/`, `ai-plan/`,
  `caddie/`, `mcp/` m.fl.) — speiler produktinndelingen i `arkitektur.md`, ikke REST-ressurser.

## Kommandoer
```bash
npm run dev                          # dev-server, http://localhost:3000 (skal starte uten warnings)
npm run build                        # prisma generate + next build + serwist (PWA service worker)
npm run lint                         # eslint

npm test                             # alle enhetstester (src/lib/**/*.test.ts)
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/auth/minor.test.ts   # kjør ÉN testfil

npm run e2e                          # Playwright e2e (e2e/*.spec.ts + tests/e2e/*.spec.ts)
npx playwright test e2e/auth-guard.spec.ts    # kjør ÉN e2e-fil
npm run e2e:ui                       # Playwright UI-modus (debug)
npm run test:all                     # enhetstester + e2e

npm run verify                       # FULL sjekk før commit (prisma validate+generate, tsc --noEmit,
                                      # eslint --quiet, check-no-hex, build) — se Verifikasjon under
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
5. **Aldri lag nye token-filer eller wireframe-mapper.** Unntak (2026-07-09): v2-redesignets tokens — `tokens/v2/` i designprosjektet og porten derfra til `src/styles/` — er godkjent av Anders.
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

## Verifikasjon (kjør før hver commit)
```bash
npm run verify
```
Tilsvarer: `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src && node scripts/check-no-hex.mjs && npm run build`
(`check-no-hex.mjs` håndhever at farger kommer fra designtokens, ikke rå hex-verdier). `npm run dev` skal starte uten warnings.

## Sesjons-minne (hvor var vi sist)
Native auto memory (Anthropic, på) husker automatisk på denne maskinen. Cross-machine state ligger i
`~/ak-brain/prosjekter/akgolf-hq.md` — lastes automatisk ved øktstart (SessionStart-hook) og oppdateres
ved øktslutt (`/lagre-sesjon` + SessionEnd-hook).
