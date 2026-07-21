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
- **Tema:** dagens bygde oppførsel er fasit (`BUSINESS-RULES.md` §Tema per produkt): PlayerHQ fast lyst,
  AgencyOS lys/mørk-bryter med standard mørk. «PlayerHQ alltid lyst» som HARD regel ble opphevet
  2026-07-09 i påvente av v2; retning C er valgt, men en eksplisitt ny tema-strategi per app er ikke
  dokumentert etter valget — ikke endre tema-oppførsel uten Anders' beskjed.
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle
  navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene,
  ikke bytt ham ut.
- **Enkelhet og færrest trykk (2026-07-21):** Behold alle funksjoner, men minst mulig trykk og
  super enkelt UI. Vanskelig å forstå = feil design (ikke «brukeren er dum»). Én primær CTA per
  skjerm; 5-sekunders-test; tom tilstand med én vei videre. Full tekst: `docs/design-system/FASIT.md` §3.
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
- **Design-kilde (oppdatert 9. juli 2026 — v2-REDESIGN PÅGÅR):** kanon-kilden er fortsatt det LEVENDE
  Claude Design-prosjektet («AK Golf HQ Design System»,
  `claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`) via DesignSync — men målbildet er nå
  **v2-generasjonen** (`ui_kits/v2/` + `tokens/v2/`) som designes per
  `~/.claude/plans/breezy-forging-brook.md`. **Retning C er valgt (2026-07-11) og fase 6 pågår:**
  gjenværende skjermer porteres til v2 bølge for bølge, én skjerm per commit, master-skjermplanens
  haker i samme commit. v13/golfdata (`src/components/athletic/golfdata/`) er OVERGANGS-LAG:
  vedlikehold OK, nye flater bygges mot godkjent v2-mockup. `public/design-handover/` er stale og
  skal ikke brukes. Full regel: `.claude/rules/design-system-regel.md`. **Designdommer:**
  `.claude/skills/ak-designekspert` (gap meldes, ikke improviseres).
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm +
  design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i
  produksjonsfiler — disse er slettet fra prosjektet.
- **Skill-rensing (2026-07-19, Agentic OS):** generiske design-skills (`frontend-design`,
  `design-vendor`) er fjernet fra repoets `.claude/skills/` — kanon-kollisjon med
  design-system-regelen. Kun `ak-designekspert` dømmer design; `webapp-testing` beholdes for e2e.
