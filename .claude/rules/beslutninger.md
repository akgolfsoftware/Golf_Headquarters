# Låste beslutninger — AK Golf HQ

Flyttet fra rot-CLAUDE.md 2026-07-19 (modulariserings-beslutning, Agentic OS Steg 2).
Gjelder til Anders endrer dem.

> **Eierskap (avklart av Anders 2026-08-03):** `docs/platform/BUSINESS-RULES.md` eier
> **produkt- og forretningsregler** — for slike er listen under sammendrag, og ved konflikt
> vinner BUSINESS-RULES.md. Denne fila eier **arbeids- og designprosess-beslutninger**
> (bl.a. Enkelhet/færrest trykk, Skjermtekst som copy-kilde, design-tidsplanen, skill-rensing)
> — de står KUN her og har ingen motpart i BUSINESS-RULES. Ikke dupliser regler på tvers.

> ⚠ **Oppdatert 2026-07-06** (historikken lever i git): av de 4 regel-klyngene
> som ble låst opp 2026-06-22 er 3 nå **avklart og bygget** — tema-toggle (AgencyOS lys/mørk-bryter),
> abonnement/pris (299 kr/mnd, ingen årlig) og cockpit stall-SG/plan-etterlevelse. Kun **FYS-formel +
> A–K-nivåtall** har gjenstående deltråder (onboarding steg 6 + drill-retag) — ikke håndhev den som låst.

## Beslutningene (august 2026)

- **Navigasjon følger Paper: FIRE PlayerHQ-faner (Anders 2026-08-05).** «I dag · Plan ·
  Analyse · Meg» — per `fase1/KONTRAKT.md` §10. Fanen **«Gjør» utgår som egen fane**;
  gjennomføring (live-økt, runde, test) åpnes fra Hjem eller Plan, ikke fra bunn-navigasjonen.
  Koden har i dag fem faner i `src/components/v2/shell.tsx` (`PORTAL_TABS`) og må bygges om.
  Bakgrunn: navnene spriker i tre kilder (KONTRAKT §10 · fasit-HTML · `kodeordre-agencyos.md`),
  og skallet ligger på hver eneste skjerm — spriket måtte lukkes før skjerm-PR-ene kunne kjøre.
  AgencyOS-railen avklares tilsvarende når steg 8 starter (koden: Hjem/Stall/Kalender/Kø/Innsikt).
- **Kort-ramme (K2): golfdata-kortene er rammeløse (Anders 2026-08-05).** `Panel` eier flaten;
  kortene er innholdslag uten egen ramme. Dette er allerede byggets standard i alle 12
  golfdata-komponenter, så beslutningen bekrefter tilstanden framfor å endre den. Aldri legg
  ramme på et golfdata-kort som ligger i et Panel — det gir dobbel kant.
- **LFaseBadge tas IKKE i bruk (Anders 2026-08-05).** Den viser de 5 L-fasene, som er
  AK-formel v1. v2 (bekreftet 2026-08-03) har ikke L-faser. Appen har allerede riktig
  erstatning: de tre motorikk-stegene i `src/lib/ak-formel-visning.ts` (Vei B). Komponenten
  blir liggende ubrukt i Paper-biblioteket — ikke plasser den på noen flate.
- **AK-formel v2 — press-navnene følger Paper (Anders 2026-08-05):** `ALENE · OBSERVERT ·
  KONKURRANSE · TURNERING` (hvem som ser på), IKKE appens gamle `FRI · KRAV · UTFORDRING ·
  KONKURRANSE`. Fire nivåer begge steder, så det er ren omdøping.
  **Motorikk-stegene er allerede riktige:** Paper skriver `UTEN_BALL / LAV_HAST / AUTO`, appens
  Vei B har `UTEN_BALL / LAV_HASTIGHET / AUTO` — samme tre steg, kun `LAV_HAST`-skrivemåten
  skiller. Full v2-formel: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks.
  `TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE` (kilde: `fase1/workbench-mobil.html`).
  Databasen beholder de finkornede enum-verdiene — `ak-formel-visning.ts` er fortsatt broen.
- **Design-fasit er Claude Paper 1:1 (Anders 2026-08-04):** skjermene skal bli **slik de er
  designet i Claude Design-prosjektet «AK Golf HQ — Claude Paper»** (`605a48cc`, hentet via
  `claude-design`-MCP-verktøyet — det er den levende kilden) — layout, informasjonsarkitektur og
  interaksjonsmønster, ikke bare farger/tokens. `designsystem/paper/fase1/` i repoet er et lokalt
  speil av samme mappe, brukt kun til rask lesing/diff; det er IKKE kilden og kan henge etter (var
  25 av 33 skjermer 05.08.2026 — sjekk alltid mot Claude Design-prosjektet direkte før du stoler på
  at speilet er ajour). Bakgrunn: steg 7 PR1–PR4 ble merget med riktige
  tokens men feil skall («Én ting nå» manglet på alle fire, Hjem manglet artefaktkolonne/tom
  tilstand, Planlegge hadde 5 konkurrerende CTA-er). Full avviksliste og ombyggingsplan:
  `docs/port/plan-designport-alle-skjermer.md` §Avvik.
- **Skjermbilde-gate (Anders 2026-08-04, FAST REGEL — presisert samme dag):** ingen skjerm-PR
  i designporten merges uten at Anders har SETT skjermen. Konkret leveranse per ferdig skjerm:
  (1) faktisk skjermbilde av den kjørende appen (Vercel-preview, innlogget testbruker med ekte
  data) — **sendes direkte i samtalen** slik at det er synlig fra iPhone (Anders jobber ofte
  remote fra mobil; en GitHub-lenke alene er ikke nok), (2) mobil **390px** ALLTID (det er
  førsteinntrykket på iPhone) + desktop 1280px, (3) lys OG mørk modus (kjent felle:
  primary=accent-kollisjonen), (4) fasitens tilsvarende skjerm ved siden av. CI måler typer og
  bygg — ikke layout. Dette tetter hullet som lot PR1–PR4 passere som «ferdige».
  Ferdig-definisjonen per skjerm står i `docs/port/plan-designport-alle-skjermer.md`
  §Ferdig-definisjon.
- **Tester planlegges i Workbench, resultat syncer til TalentHQ (Anders 2026-08-04):** spilleren
  legger tester inn i planen sin via Workbench (fasiten `workbench-mobil.html` har allerede
  «Testbatteriet» som eget ark med egen Tester-seksjon per økt — design finnes, kode mangler).
  Når en test gjennomføres og logges (`/portal/tren/tester/[testId]/gjennomfor`), skal resultatet
  synces direkte til TalentHQ (`/portal/talent/*` — 5 skjermer, live men skjult fra meny siden
  D1 2026-07-15). Sync-koblingen TestResult → TalentHQ finnes ikke i kode i dag og må bygges.
  Uavklart: hvilke av de 36 testprotokollene i DB spilleren skal se (Anders nevner 21, CANON
  sier 20) — spør før noe ryddes. **Fasit for test-gjennomføringsskjermen finnes nå**
  (`playerhq-test-gjennomfor.html`, levert 2026-08-04, viser TN Putt Gate) — men avklaringen over
  blokkerer fortsatt PR-en, se `kart/status-gjennomfore-2026-08-04.md` i Claude Design-prosjektet.
- **AI-laget samles på ÉN adresse (Anders 2026-08-04, Fase 1):** fasiten
  `agencyos-agenticos.html` bygges som ny samleflate som erstatter spredningen over
  `/admin/agent-team`, `/admin/agents`, `/admin/godkjenninger` og AI-panelet på konsollen —
  de gamle adressene blir redirects dit. Kun redesign av agent-team alene er IKKE beslutningen.
- **Turneringsplanlegging inn i Workbench (Anders 2026-08-04, Fase 1):** fasiten
  `workbench-turnering.html` bygges som del av `WorkbenchV2` (coach planlegger turnering samme
  sted som trening) — ikke som ombygging av `/admin/tournaments`.
- **Fase 2 av designporten kjøres i ny økt med Sonnet 5 (Anders 2026-08-04):** token-effektivt,
  uten irrelevante skills/plugins/gammel kontekst. Fase 1-plan + rekkefølge:
  `docs/port/plan-designport-alle-skjermer.md` §Fase 1-planlegging. Mønsterdokument for skjermer
  uten fasit: `docs/port/monsterdokument-paper.md`.
- **DataGolf-skjermene skal inn i PlayerHQ (Anders 2026-08-04):** i dag ligger de under
  marketing (`/stats/*` — spillere, turneringer, sg-sammenlign, verktøy m.fl.); `/portal/stats`
  er kun en redirect ut av portalen, og `/portal/datagolf` er én enkelt side. Skjermene skal
  finnes i PlayerHQ. Omfang/plassering (egen flate vs. faner i Analyse) er ikke avgjort — legges
  inn i porteringsplanens steg 7-omfang som egen avklaring.

## Beslutningene (juni–juli 2026)

- **Invarianter er anbefalinger, aldri sperrer:** ingenting i appen blokkerer trening. Avvik fra
  plan/regel vises i klarspråk til brukeren; sterkt avvik varsler coach. Aldri skriv «kan ikke
  brytes»-kode eller -tekst.
- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Tema/design (TØMT 2026-07-25, tidsplan LÅST 2026-07-31, OVERSTYRT 2026-08-03):** Gamle
  Presis/FASIT-låser er fortsatt avviklet. Tidsplanen fra 31.07 sa full Paper-port til `src/`
  skulle vente til FØR/UNDER/ETTER-piloten var evaluert — **Anders overstyrte dette eksplisitt
  2026-08-03** etter at steg 1–6 + steg 7 PR1 allerede var merget på løpende «ja» per PR.
  Full skjermport kjører nå aktivt per `docs/port/plan-designport-alle-skjermer.md` (10 steg,
  én PR per skjerm/steg, aldri merge til main uten Anders' «ja»). `designsystem/paper/` er et
  lokalt speil hentet ned i repoet 02.08.2026 (PR #254, ikke lenger kun på `chore/paper-speil-lokal`)
  — men speilet er IKKE kilden og oppdateres ikke automatisk; Claude Design-prosjektet `605a48cc`
  (via `claude-design`-MCP) er alltid fasiten. Se også `docs/gjenstaaende-plan-2026-07-31.md` §1.1
  (historisk — skrevet før overstyringen) og `docs/for-under-etter-spec.md` §2 for historikken.
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
