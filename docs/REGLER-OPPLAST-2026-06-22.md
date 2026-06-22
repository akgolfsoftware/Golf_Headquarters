# Regler låst opp — 2026-06-22

Anders oppdaget at flere «låste beslutninger» har stått som hard constraint uten at han bevisst
låste dem — og at de er grunnen til at appen avvek fra Claude Design-fasiten. Han har låst opp
**4 regel-klynger**. Dette dokumentet styrer prosessen: hver klynge har STATUS, hva som trengs,
og besluttede verdier (fylles inn).

> Loopen er PÅ PAUSE til verdiene er satt — å bygge videre mot gamle antakelser ville vært bortkastet.

## STYRENDE REGEL (Anders 2026-06-22): ALLE SIDER SÅ LIK HANDOVER SOM MULIG
Ny hovedinstruks: bygg/strammer HVER skjerm til å være **visuelt så lik Claude Design-handover-fasiten
som mulig** — layout, kort-stil, farger, typografi, rekkefølge. MEN bruk alltid **korrekte
forretningsverdier** (300 ikke 299, ekte abonnement-modell, ekte data, ingen fabrikering). Der fasit-tall
er forretningsmessig feil (299, PRO årlig, Visa-kort), behold riktig verdi men match det visuelle.
Loop-mandatet endres fra «verifiser + behold app der den avviker» → «AKTIVT stram alle skjermer mot
fasit-utseendet (med korrekte verdier)». Skjermer som allerede er piksel-like (Auth, forelder-hjem)
står; skjermer som er innholds-korrekte men visuelt ulike (f.eks. abonnement) skal visuelt re-portes.

---

## 1. Tema-toggle  ·  STATUS: låst opp, venter verdi
- **Var låst som:** PlayerHQ alltid lyst, AgencyOS alltid mørkt, INGEN toggle.
- **Designkonsekvens av låsen:** ingen lys/mørk-bytte noe sted.
- **Trenger fra Anders:** Vil du ha en bruker-toggle (lys/mørk) — og på begge produkter, eller bare ett? Eller bare bytte standard-temaet for et produkt?
- **BESLUTTET (2026-06-22, oppdatert):** Anders presiserte: **AgencyOS skal kunne være BÅDE lys OG mørk.** → BYGD: lys/mørk-toggle i AgencyOS-topbaren (sol/måne-ikon), tema persistert i cookie `ak-admin-theme` (leses server-side i AdminShell → ingen flash), standard = mørk. PlayerHQ forblir lyst (ikke endret). Coach-chrome-variablene (sidebar/topbar) er faste forest i `@theme inline` → lys AgencyOS = mørk forest-sidebar + lyst arbeidsområde. Komponenter: src/components/admin/admin-theme-toggle.tsx + admin-shell.tsx + agencyos-topbar.tsx.
- **LYS-MODUS-QA BESTÅTT ✅ (2026-06-22):** verifisert rent i lys på 9 AgencyOS-skjermer: cockpit, stall, handlingssenter, spiller-detalj, tester, runder, okonomi, kalender, grupper. Konsistent forest-sidebar + lyst innhold, lesbar tekst/aksenter. Eneste mindre polish-punkt: handlingssenter-header-bånd litt flatt grått i lys (ikke ødelagt — kan tokeniseres ved en senere lys-polish-runde).

## 2. Abonnement & pris  ·  STATUS: låst opp, venter verdi
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

- **FYS: VENTER FORTSATT på Anders' formel.** Helse-tall forblir «—» til FYS-resultatformelen (rå testresultat → score/nivå) kommer.

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
