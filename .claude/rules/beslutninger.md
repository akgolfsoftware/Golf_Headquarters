# Låste beslutninger — AK Golf HQ

Flyttet fra rot-CLAUDE.md 2026-07-19 (modulariserings-beslutning, Agentic OS Steg 2).
Gjelder til Anders endrer dem.

> **Fasit-kilde:** `docs/platform/BUSINESS-RULES.md`. Listen under er sammendrag — ved konflikt
> vinner BUSINESS-RULES.md. Ikke dupliser nye regler hit.

> ⚠ **Oppdatert 2026-07-06** (historikk: `docs/REGLER-OPPLAST-2026-06-22.md`): av de 4 regel-klyngene
> som ble låst opp 2026-06-22 er 3 nå **avklart og bygget** — tema-toggle (AgencyOS lys/mørk-bryter),
> abonnement/pris (299 kr/mnd, ingen årlig) og cockpit stall-SG/plan-etterlevelse. Kun **FYS-formel +
> A–K-nivåtall** har gjenstående deltråder (onboarding steg 6 + drill-retag) — ikke håndhev den som låst.

## Beslutningene (juni–juli 2026)

- **Invarianter er anbefalinger, aldri sperrer:** ingenting i appen blokkerer trening. Avvik fra
  plan/regel vises i klarspråk til brukeren; sterkt avvik varsler coach. Aldri skriv «kan ikke
  brytes»-kode eller -tekst — se `plans/skjermplan-master.md` prinsipp 3 for fasit.
- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Tema/design (TØMT 2026-07-25, tidsplan LÅST 2026-07-31):** Gamle Presis/FASIT-låser er
  fortsatt avviklet. **Ny tidsplan (Anders 2026-07-31):** (1) **App/pilot nå = C, smalt** —
  behold Inter/Familjen Grotesk/JetBrains Mono og v2-tokens; innfør kun `--handling` `#D97757`
  for «Én ting nå» (maks én per skjerm). (2) **Claude Paper** er designfasit i Open Design +
  speil (`designsystem/paper/` på `chore/paper-speil-lokal`) — bygg videre der. (3) **Full
  Paper-port til `src/`** først etter at FØR/UNDER/ETTER-piloten er evaluert. Se
  `docs/gjenstaaende-plan-2026-07-31.md` §1.1 og `docs/for-under-etter-spec.md` §2.
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle
  navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene,
  ikke bytt ham ut.
- **Enkelhet og færrest trykk (2026-07-21, fortsatt gjeldende produktprinsipp):** Behold alle
  funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å forstå = feil design
  (ikke «brukeren er dum»). Én primær CTA per skjerm; 5-sekunders-test; tom tilstand med én vei videre.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt**
  dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate
  moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement (ingen tier-nivåer):** PlayerHQ-tilgang er gratis eller 299 kr/mnd. **Gratis** hvis:
  1 mnd prøveperiode, ELLER coaching-pakke (Performance / Performance Pro), ELLER gruppe via AK Golf.
  **299 kr/mnd** for alle andre. «Performance / Performance Pro» er **coaching-pakker** (antall
  økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum — vis aldri i UI).
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod
  referanseverdier før Anders gir grønt lys.
- **Design-kilde (oppdatert 2026-07-31):** Presis/v2-kanonen er avviklet som *ny* designkilde.
  **Claude Paper** (Open Design `be6bdcb8-…` / Claude Design `605a48cc`) er designfasit for
  videre designarbeid. **Produksjonskode** følger fortsatt v2-tokens + C, smalt (`--handling`)
  til post-pilot. `docs/design-system/` og `docs/redesign-v2/` er SLETTET 2026-07-31 (git-historikk);
  kun `docs/design-system/TEMA-LYS-MORK.md` står som tema-beskrivelse av *kode*.
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm +
  design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i
  produksjonsfiler — disse er slettet fra prosjektet.
- **Skill-rensing (2026-07-19, Agentic OS):** generiske design-skills (`frontend-design`,
  `design-vendor`) er fjernet fra repoets `.claude/skills/`. **Oppdatering 2026-07-25:** også
  `ak-designekspert` og `ak-design-evolution` er fjernet — de var låst til den gamle kanonen.
  `webapp-testing` beholdes for e2e.
