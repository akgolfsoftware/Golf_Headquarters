@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Hele plattformen for AK Golf Group. Ett monorepo, ett Next.js-prosjekt, fire produkter (Marketing, Booking, PlayerHQ, AgencyOS).

> **Start her:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md). Nåstatus: `docs/STATUS-NÅ.md`. Uavklart: `docs/AAPNE-SPORSMAAL.md`. Gamle `PLATFORM.md` er arkivert — ikke bruk den.

## Detaljerte regler (`.claude/rules/`)
- `arkitektur.md` — produkter, ruter, mappestruktur.
- `designsystem.md` — tokens, komponenter, typografi, spacing, ikoner (ÉN kilde til sannhet).
- `gotchas.md` — kjente feller (Prisma 7, Next.js 16 proxy, Supabase pooler, zod). Les FØR koding.
- `design-porting-gate.md` — LÅST gate for porting av skjermer fra design-handover.

## FØR DU RØRER EN SKJERM — `docs/MASTER-SKJERMPLAN.md` (LÅST regel)
Autoritativ liste over hver skjerm + 6 haker (Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker).
Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i SAMME commit. En skjerm er
ikke ferdig før alle 6 er grønne. Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista. Oppdater
dashboard-tallene + endringsloggen når du fullfører/endrer skjermer.

## Låste beslutninger (juni 2026 — gjelder til Anders endrer dem)
> **Fasit-kilde:** `docs/platform/BUSINESS-RULES.md`. Listen under er sammendrag — ved konflikt vinner BUSINESS-RULES.md. Ikke dupliser nye regler hit.

> ⚠ **2026-06-22 — ANDERS HAR LÅST OPP 4 REGEL-KLYNGER.** Disse gjelder IKKE lenger som hard
> constraint — de blokkerte designet fra å bli slik Anders ville. Verdier under avklaring, se
> `docs/REGLER-OPPLAST-2026-06-22.md`:
> 1. **Tema-toggle** (var: ingen toggle, fast lys/mørk per produkt)
> 2. **Abonnement & pris** (var: kun 300 kr/mnd, ingen nivåer, ingen Stripe-kort-visning)
> 3. **FYS-formel + A–K-nivåtall** (var: «—»-plassholdere til formel låst)
> 4. **Cockpit stall-SG + plan-etterlevelse** (var: «—»-plassholdere)
> Ikke håndhev de fire som låst før nye verdier er bekreftet. De andre punktene under står.

- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Tema (oppdatert 2026-06-22):** PlayerHQ alltid **lyst**. AgencyOS har **lys/mørk-toggle** (sol/måne i topbar, cookie `ak-admin-theme`, standard mørk) — Anders vil ha AgencyOS i begge moduser. (Var: «AgencyOS alltid mørkt, ingen toggle» — opphevet.)
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Alltid fulle navn. (Gamle: Magnus / Markus R.P. / Markus Berg / Anders Berg / Andreas Kragerud — skal bort.) NB: EKTE coach «Markus Røinås Pedersen» på markedssidene — IKKE bytt han ut med demo-spilleren.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt** dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement (ingen tier-nivåer):** PlayerHQ-tilgang er gratis eller 300 kr/mnd. **Gratis** hvis: 1 mnd prøveperiode, ELLER coaching-pakke (Performance / Performance Pro), ELLER gruppe via AK Golf. **300 kr/mnd** for alle andre. «Performance / Performance Pro» er **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum — vis aldri i UI).
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod referanseverdier før Anders gir grønt lys.
- **Ferskt design:** `docs/design-handover-2026-06-24/` (Claude Design-handover, juni) er gjeldende — knapp→skjerm-kart (`NAVIGASJON-knapp-til-rute.md`), prompt, billedkatalog (`SKJERMER.md`), tokens. Interaktivt `NAV-DIAGRAM.html` + `screens/`-PNG-er på Google Drive («Final AK Golf HQ»). Eldre `public/design-handover/...` (4. juni) finnes ikke lenger; `docs/design-handoff-komplett/` (mai) er arkiv.

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)
- Next.js 16 (App Router, TypeScript strict, Turbopack), React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts`)
- Inter + Inter Tight + JetBrains Mono via `next/font/google`. Lucide React — eneste ikon-bibliotek. npm.

## Språk
All UI-tekst på norsk bokmål med æ, ø, å. Kommentarer kan være engelsk eller norsk — konsistent innenfor en fil.

## Arbeidsregler
1. **Plan Mode først** for alt ikke-trivielt.
2. **Implementer aldri uten godkjent plan.**
3. **Pek på eksisterende mønstre** (AthleticCard, lib-helpere) — bygg ikke på nytt det som finnes.
4. **Stopp og spør ved usikkerhet.** Aldri gjett.
5. **Aldri lag nye token-filer eller wireframe-mapper.**
6. **Feil → `.claude/rules/gotchas.md`.**

## Git-arbeidsflyt — Claude Code håndterer dette
Anders er ikke utvikler og skal ikke skrive git-kommandoer. Etter hver fullført oppgave: stage, commit
(Conventional Commits på engelsk), push til main. Ikke spør om bekreftelse på trivielle commits.
Stopp og spør før destruktive operasjoner: `--force`, `reset --hard`, `rebase main`, sletting av remote branches.
Etter push: oppsummer på norsk hva som ble gjort.

## Verifikasjon (kjør før hver commit)
```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
```
`npm run dev` skal starte uten warnings.

## Sesjons-minne (hvor var vi sist)
Native auto memory (Anthropic, på) husker automatisk på denne maskinen. Cross-machine state ligger i
`~/ak-brain/prosjekter/akgolf-hq.md` — lastes automatisk ved øktstart (SessionStart-hook) og oppdateres
ved øktslutt (`/lagre-sesjon` + SessionEnd-hook).
