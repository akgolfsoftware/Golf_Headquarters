@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Hele plattformen for AK Golf Group. Ett monorepo, ett Next.js-prosjekt, fire produkter (Marketing, Booking, PlayerHQ, AgencyOS).

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
- **Tema (oppdatert 2026-06-22):** PlayerHQ alltid **lyst**. AgencyOS har **lys/mørk-toggle** (sol/måne i topbar, cookie `ak-admin-theme`, standard mørk) — Anders vil ha AgencyOS i begge moduser. (Var: «AgencyOS alltid mørkt, ingen toggle» — opphevet.)
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene, ikke bytt ham ut.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt** dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement (ingen tier-nivåer):** PlayerHQ-tilgang er gratis eller 299 kr/mnd. **Gratis** hvis: 1 mnd prøveperiode, ELLER coaching-pakke (Performance / Performance Pro), ELLER gruppe via AK Golf. **299 kr/mnd** for alle andre. «Performance / Performance Pro» er **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum — vis aldri i UI).
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod referanseverdier før Anders gir grønt lys.
- **Design-kilde (LÅST, oppdatert 8. juli 2026):** det LEVENDE Claude Design-prosjektet («AK Golf HQ Design System», `claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet direkte via DesignSync — ZIP-en fra bruker er fasit-handover. Skjermer KOMPONERES fra `src/components/athletic/golfdata/` per prosjektets `prompt.md`-kontrakter — se `.claude/rules/design-system-regel.md`. **Designdommer:** `.claude/skills/ak-designekspert` dømmer alt komponert mot verdensklasse (gap meldes, ikke improviseres).
- **Grok Build + Fable 5 (token-besparende):** Bruk docs/fable-ak-style.md (prose-stil fra Fable 5_System_Prompt.md + AK invariants). Referer filer, targeted reads/edits, ingen full dump av ZIP eller Fable. Kombiner Fable prose (naturlige avsnitt, minimal lists) med AK kanon for alle forklaringer og generering.
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm + design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i produksjonsfiler — disse er slettet fra prosjektet.

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)
- Next.js 16 (App Router, TypeScript strict, Turbopack), React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts`)
- Inter + Familjen Grotesk (display) + JetBrains Mono via `next/font/google`. Inter Tight er deprecated — lastes kun for legacy-flater. Kanon: `.claude/rules/design-system-regel.md`. Lucide React — eneste ikon-bibliotek. npm.

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
