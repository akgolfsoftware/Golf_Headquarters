# Regler låst opp — 2026-06-22

Anders oppdaget at flere «låste beslutninger» har stått som hard constraint uten at han bevisst
låste dem — og at de er grunnen til at appen avvek fra Claude Design-fasiten. Han har låst opp
**4 regel-klynger**. Dette dokumentet styrer prosessen: hver klynge har STATUS, hva som trengs,
og besluttede verdier (fylles inn).

> **Status 2026-07-06: 3 av 4 er avklart OG bygget** — tema-toggle, abonnement/pris og cockpit
> stall-SG/plan-etterlevelse er ferdige (se seksjon 1, 2, 4 under). Kun **FYS-formel + A–K-nivåtall**
> (seksjon 3) har en liten gjenstående deltråd: onboarding steg 6 + drill-retag-beslutning. De
> bekreftede verdiene er nå foldet inn i `docs/platform/BUSINESS-RULES.md` selv — denne fila er
> historikk/prosess-spor, ikke lenger gjeldende fasit for de tre ferdige klyngene.

## FASIT-SWEEP STATUS (2026-06-22) — høyverdi-arbeid FERDIG
Adversarial diff per mest-sett skjerm. FIKSET reelle avvik: PlayerHQ Hjem («Hva er nytt»-feed),
PlayerHQ Analyse (SG-stripe), AgencyOS cockpit (greeting-hero «God morgen, {coach}»), AgencyOS stall
(tittel «Stallen»). VERIFISERT korrekte (ingen fiks — dokumenterte unntak): PlayerHQ Gjennomføre
(program-hub korrekt; drill-runner=live-rute L-1), PlayerHQ Meg (undersider M-1, settings-IA-forskjell
akseptert), Marketing/priser (300 ikke fasitens 299, rikere enn mockup). Skjønn brukt: bevisste
app-forbedringer (stall 360°-panel, Caddie-panel) beholdt, ikke fjernet for å matche enklere fasit.
GJENSTÅR (flagget, lav-prio/venter Anders): A-3 cockpit SG-ticker (krever per-spiller SG-query, dekorativ),
L-1 drill-runner-re-port, Planlegge/Workbench (kun visuell skin). Sweepens hovedmål er nådd.

## STYRENDE REGEL (Anders 2026-06-22): ALLE SIDER SÅ LIK HANDOVER SOM MULIG
Ny hovedinstruks: bygg/strammer HVER skjerm til å være **visuelt så lik Claude Design-handover-fasiten
som mulig** — layout, kort-stil, farger, typografi, rekkefølge. MEN bruk alltid **korrekte
forretningsverdier** (300 ikke 299, ekte abonnement-modell, ekte data, ingen fabrikering). Der fasit-tall
er forretningsmessig feil (299, PRO årlig, Visa-kort), behold riktig verdi men match det visuelle.
Loop-mandatet endres fra «verifiser + behold app der den avviker» → «AKTIVT stram alle skjermer mot
fasit-utseendet (med korrekte verdier)». Skjermer som allerede er piksel-like (Auth, forelder-hjem)
står; skjermer som er innholds-korrekte men visuelt ulike (f.eks. abonnement) skal visuelt re-portes.

---

## 1. Tema-toggle  ·  STATUS: AVKLART OG BYGGET (historikk — les ikke som eneste fasit)

> **Gjeldende fasit 2026-07-23:** `docs/design-system/TEMA-LYS-MORK.md` + `BUSINESS-RULES.md` § Tema.  
> Cookie er nå **`ak-v2-tema`** (ikke `ak-admin-theme`). PlayerHQ **alltid lys** (B28 i V2Shell). AgencyOS mørk default + bryter.

- **Var låst som:** PlayerHQ alltid lyst, AgencyOS alltid mørkt, INGEN toggle.
- **Designkonsekvens av låsen:** ingen lys/mørk-bytte noe sted.
- **BESLUTTET (2026-06-22, oppdatert 2026-07):** AgencyOS = lys **og** mørk (standard mørk). PlayerHQ = fast lys.  
  Implementasjon i v2: cookie `ak-v2-tema`, `data-v2-tema` på `<html>`, layout-script før paint, V2Shell B28.
- **LYS-MODUS-QA BESTÅTT ✅ (2026-06-22):** AgencyOS i lys på nøkkel-skjermer (historisk notat).

## 2. Abonnement & pris  ·  STATUS: AVKLART på nytt 2026-07-07

> **NY BESLUTNING (Anders, 2026-07-07):** månedspris = **299 kr/mnd** (endrer 2026-06-22-beslutningen
> under; migrert i hele appen + BUSINESS-RULES samme dag). Årsabonnement fortsatt ikke besluttet.
> Historikken under beholdes uendret som dokumentasjon.
- **Var låst som:** kun «gratis eller 300 kr/mnd», ingen nivåer, «PRO årlig» finnes ikke, ingen Stripe-kort-visning, ELITE forbudt.
- **Designkonsekvens av låsen:** Priser/Abonnement viser IKKE fasitens «299 kr + PRO årlig 2 690 + Visa ••• 4242».
- **Trenger fra Anders:** (a) månedspris (299 eller 300?), (b) årspris + skal årlig finnes (2 690?), (c) skal app-planer (Gratis/PRO/PRO-årlig) vises som i fasiten, (d) Stripe-kort/last4-visning (krever live Stripe — bak hardt stopp).
- **BESLUTTET (2026-06-22):** Modellen = **dagens app** (ikke fasitens 299/årlig): **Performance** = 2×20 min coaching + gratis PlayerHQ; **Performance Pro** = 4×20 min coaching + gratis PlayerHQ; **kun PlayerHQ** = **300 kr/mnd**. INGEN 299, INGEN «PRO årlig 2690», INGEN fabrikert Stripe-kort.
- **VISUELT RE-PORTET ✅ (/portal/meg/abonnement):** forest «DITT ABONNEMENT»-kort (alltid forest nå, også for gratis-via-coaching) + PLANER-liste (Gratis «Nå» / Kun PlayerHQ 300 kr) — matcher fasitens layout med korrekte verdier. Verifisert mobil 430px. GJENSTÅR (lav): /(marketing)/priser + /forelder/okonomi er allerede korrekte; vurder visuell stramming ved fasit-sweep.

## 3. FYS-formel + A–K-nivåtall  ·  STATUS: låst opp, venter verdi (størst)
- **Var låst som:** FYS-resultatformel + A–K 11 snittscore-grenser parkert → «—»-plassholdere.
- **Designkonsekvens av låsen:** Helse viser «—»; Statistikk-diagnose + Onboarding steg 6 ikke bygd som fasit; nivå/neste-nivå-motor frakoblet.
- **Trenger fra Anders:** (a) de **11 A–K snittscore-grensene** (tallene), (b) **FYS-resultatformelen** (hvordan rå testresultat → score/nivå). Disse kan ikke gjettes — Claude kan hjelpe å designe dem hvis ønsket.
- **A–K: MOTTATT + BYGD ✅ (2026-06-22).** Anders ga tabellen. Formel: `src/lib/domain/ak-kategori.ts` (6 node:test grønne). Grense [min,max): 72→C, 80→G, 100→K.
  - **✅ Statistikk diagnose-først FERDIG** (B-1 løst): «SITT NIVÅ NÅ» + «LUKK DISSE» live, snittscore fra inneværende-sesong runder. Brukervendt — uavhengig av drill-backend.
  - **⚠ BACKEND-INTEGRASJON FLAGGET (A-2, BYGGELOGG):** context.ts/drill-filtering (`kategoriFraHcp`→snittscore) IKKE gjort — gammelt HCP-A–L og nytt snittscore-A–K gir ulik bokstav (Øyvind E vs B), og drill min/maxKategori-tagger er satt under gammel betydning. Krever Anders' beslutning om drill-retag før migrering. AI-plan står trygt på HCP til da.
  - **GJENSTÅR:** Onboarding steg 6 nivå (trenger SeasonStat-modell + test-bruker), nivå/talent-hint.
- **SNITTSCORE-KILDE — BESLUTTET (Anders 2026-06-22): SESONG-BASERT.**
  - Inneværende sesong (kalenderår) er rammen → bestemmer dagens A–K-kategori.
  - Onboarding lar spiller laste inn historikk **opptil 3 sesonger tilbake** (forrige sesong + hittil i år + eldre hvis data finnes). Manuell innlasting ved profil-opprettelse.
  - Inneværende sesong oppdateres automatisk når spiller logger runder i appen.
  - Formålet: vise **progresjon over tid** (A–K/snittscore sesong-for-sesong — god/dårlig utvikling).
  - **Implikasjon (krever datamodell):** trengs en per-sesong snittscore-lagring (ny `SeasonStat`-tabell ELLER JSON-felt på User: {sesongÅr → snittscore, antallRunder}). I dag finnes kun `User.prevSeasonAvgScore` (ett felt). Schema-beslutning utestår — bekreft tilnærming før migrasjon.
  - **Byggeplan:** (a) STRAKS: diagnose-skjerm («SITT NIVÅ NÅ») bruker inneværende-sesong snittscore = snitt brutto score fra runder spilt i år → `kategoriFraSnittscore`. Funker nå for spillere med runder. (b) FØLGER: SeasonStat-modell + onboarding 3-sesong-innlasting + progresjons-visning.

- **FYS: MOTTATT + FORMEL BYGD + WIRET ✅ (2026-06-22).** Anders ga vektene (markløft 100% · benkpress 100% · stille lengde 50% · ballkast 16,6% · CHS 100%) + 2 valg: styrkeløft relativt til kroppsvekt, poeng relativt til stallen (beste=100). Formel: `src/lib/domain/fys-score.ts` (justertVerdi + delscore + fysScore + byggStallSpenn), 7 node:test grønne. Ingen hardkodede referanser (stall-relativ, selvkalibrerende).
  - **✅ DATALAG:** RÅverdiene (kg/cm/mph) ligger i `TestResult.score` per testens scoringRule (ingen schema-endring nødvendig); kroppsvekt i siste `HealthEntry.weightKg`. Datafunksjon `src/lib/fys-data.ts` (`hentFysScore`) henter hele stallens råverdier → byggStallSpenn → fysScore. Seed `scripts/seed-fys-testdata.ts` ga 5 spillere realistiske FYS-baselines (Øyvind elite=100, Mathias 90, Jørgen 84, Leander 80, Erik 73; spillere uten tester = ærlig «—»).
  - **✅ HELSE-SKJERM:** `/portal/meg/helse` viser nå FYS-score-KPI (0–100, «{n}/5 tester») i stedet for «—»-readiness; fasit-layout beholdt. «Formel ikke låst»-disclaimer fjernet; ny disclaimer forklarer FYS-score + at kun Belastning/HRV fortsatt er plassholdere. Verifisert mobil 430px (app-shot: FYS-SCORE 100 for Øyvind).
  - **COACH-SIDE (AgencyOS) — VURDERT, IKKE BYGD (fasit-troskap):** Spiller-detalj 360° (`/admin/spillere/[id]`) og coach-tester (`/admin/spillere/[id]/tester`) er tro fasit-porter UTEN FYS-score-slot — coach-tester viser bevisst **dekning** (tester målt/tilgjengelig), ikke en 0–100 ferdighetsskala (eksplisitt i komponent-kommentaren). Å bolte på en FYS-KPI der ville brutt «så lik handover som mulig». Hvor en coach-vendt FYS-score evt. skal inn er en **Claude Design-beslutning**, ikke en autonom tilføyelse. FYS-scorens fasit-hjem er PlayerHQ Helse (ferdig).
  - **GJENSTÅR (lav-prio):** v1 er stall-relativ; faste mål-verdier (per test el. A–K-kategori) kan erstatte normaliseringen senere uten å endre vektene — påvirker ikke vektene.

## 4. Cockpit stall-SG + plan-etterlevelse  ·  STATUS: låst opp, venter scope-bekreftelse
- **Var låst som:** placeholders «—» («til formelen er låst»).
- **Designkonsekvens av låsen:** cockpit-KPIene STALL-SG + PLAN-ADHERENCE tomme.
- **Trenger fra Anders:** bekreft beregning: stall-SG = snitt sgTotal alle aktive spilleres runder siste 30 d (gjenbruk av /admin/runder-tallet); plan-etterlevelse = fullførte/planlagte økter siste 30 d. Spm: 30-dagers vindu OK? Alle spillere eller kun elite?
- **BESLUTTET (2026-06-22):** **30 dager, ALLE spillere.** Stall-SG = snitt sgTotal alle spilleres runder siste 30 d (gjenbruk /admin/runder-definisjonen). Plan-etterlevelse = fullførte/planlagte TrainingPlanSession siste 30 d.
- **BYGD + VERIFISERT ✅:** cockpit viser nå «STALL-SG +0,8» + «PLAN-ADHERENCE 52 %» (ekte data). «—» kun hvis ingen data. Kode: daily-brief-data.tsx (3 spørringer) + agency-cockpit.tsx (kpis5).

---

## Konsekvens når verdiene er satt
Disse skjermene må da bygges om for å MATCHE fasiten (de er i dag «låst-korrekte», ikke fasit-like):
- Abonnement → /portal/meg/abonnement, /(marketing)/priser, /forelder/okonomi
- FYS → /portal/meg/helse, FYS-testskjermer
- A–K → /portal/statistikk (diagnose-først), /onboard steg 6, nivå/talent-hint
- Cockpit → /admin/agencyos (2 KPIer)
- Tema → globalt (toggle-komponent + begge produkter)

Etter at verdiene er bekreftet: oppdater BUSINESS-RULES.md + CLAUDE.md med de NYE reglene, fjern
opplåsings-banneret, og gjenoppta loopen med ombygging mot fasit.
