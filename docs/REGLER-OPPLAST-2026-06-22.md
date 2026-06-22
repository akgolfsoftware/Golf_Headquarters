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
- **BESLUTTET (2026-06-22):** Behold fast standard (PlayerHQ lyst / AgencyOS mørkt) — men IKKE som ufravikelig låst regel. Ingen bruker-toggle nå. Dette matcher fasiten uansett (fasiten er lys PlayerHQ / mørk AgencyOS). **Ingen kodeendring nødvendig — kun regel-status endret.**

## 2. Abonnement & pris  ·  STATUS: låst opp, venter verdi
- **Var låst som:** kun «gratis eller 300 kr/mnd», ingen nivåer, «PRO årlig» finnes ikke, ingen Stripe-kort-visning, ELITE forbudt.
- **Designkonsekvens av låsen:** Priser/Abonnement viser IKKE fasitens «299 kr + PRO årlig 2 690 + Visa ••• 4242».
- **Trenger fra Anders:** (a) månedspris (299 eller 300?), (b) årspris + skal årlig finnes (2 690?), (c) skal app-planer (Gratis/PRO/PRO-årlig) vises som i fasiten, (d) Stripe-kort/last4-visning (krever live Stripe — bak hardt stopp).
- **BESLUTTET (2026-06-22):** Modellen = **dagens app** (ikke fasitens 299/årlig): **Performance** = 2×20 min coaching + gratis PlayerHQ; **Performance Pro** = 4×20 min coaching + gratis PlayerHQ; **kun PlayerHQ** = **300 kr/mnd**. INGEN 299, INGEN «PRO årlig 2690», INGEN fabrikert Stripe-kort. → **Innholdet er allerede korrekt.** Eneste oppgave: stram det VISUELLE mot fasit-layouten (forest «DITT ABONNEMENT»-kort, plan-kort-stil) MED disse riktige verdiene.

## 3. FYS-formel + A–K-nivåtall  ·  STATUS: låst opp, venter verdi (størst)
- **Var låst som:** FYS-resultatformel + A–K 11 snittscore-grenser parkert → «—»-plassholdere.
- **Designkonsekvens av låsen:** Helse viser «—»; Statistikk-diagnose + Onboarding steg 6 ikke bygd som fasit; nivå/neste-nivå-motor frakoblet.
- **Trenger fra Anders:** (a) de **11 A–K snittscore-grensene** (tallene), (b) **FYS-resultatformelen** (hvordan rå testresultat → score/nivå). Disse kan ikke gjettes — Claude kan hjelpe å designe dem hvis ønsket.
- **STATUS (2026-06-22): VENTER FORTSATT på Anders' faktiske tall.** Låst opp, men kan ikke bygges/matche fasitens tall uten (a) de 11 grensene + (b) FYS-formelen. Til de kommer: Statistikk-diagnose, Onboarding steg 6 og Helse-tall forblir «—»/plassholder. Anders gir tallene, eller ber Claude foreslå et utkast å reagere på.

## 4. Cockpit stall-SG + plan-etterlevelse  ·  STATUS: låst opp, venter scope-bekreftelse
- **Var låst som:** placeholders «—» («til formelen er låst»).
- **Designkonsekvens av låsen:** cockpit-KPIene STALL-SG + PLAN-ADHERENCE tomme.
- **Trenger fra Anders:** bekreft beregning: stall-SG = snitt sgTotal alle aktive spilleres runder siste 30 d (gjenbruk av /admin/runder-tallet); plan-etterlevelse = fullførte/planlagte økter siste 30 d. Spm: 30-dagers vindu OK? Alle spillere eller kun elite?
- **BESLUTTET (2026-06-22):** **30 dager, ALLE spillere.** Stall-SG = snitt sgTotal alle spilleres runder siste 30 d (gjenbruk /admin/runder-definisjonen). Plan-etterlevelse = fullførte/planlagte TrainingPlanSession siste 30 d. Bygg fra ekte data, erstatt «—» i cockpit. KLAR TIL Å BYGGE.

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
