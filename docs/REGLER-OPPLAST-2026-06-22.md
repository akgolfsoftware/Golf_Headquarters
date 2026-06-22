# Regler låst opp — 2026-06-22

Anders oppdaget at flere «låste beslutninger» har stått som hard constraint uten at han bevisst
låste dem — og at de er grunnen til at appen avvek fra Claude Design-fasiten. Han har låst opp
**4 regel-klynger**. Dette dokumentet styrer prosessen: hver klynge har STATUS, hva som trengs,
og besluttede verdier (fylles inn).

> Loopen er PÅ PAUSE til verdiene er satt — å bygge videre mot gamle antakelser ville vært bortkastet.

---

## 1. Tema-toggle  ·  STATUS: låst opp, venter verdi
- **Var låst som:** PlayerHQ alltid lyst, AgencyOS alltid mørkt, INGEN toggle.
- **Designkonsekvens av låsen:** ingen lys/mørk-bytte noe sted.
- **Trenger fra Anders:** Vil du ha en bruker-toggle (lys/mørk) — og på begge produkter, eller bare ett? Eller bare bytte standard-temaet for et produkt?
- **Besluttet verdi:** _(fylles inn)_

## 2. Abonnement & pris  ·  STATUS: låst opp, venter verdi
- **Var låst som:** kun «gratis eller 300 kr/mnd», ingen nivåer, «PRO årlig» finnes ikke, ingen Stripe-kort-visning, ELITE forbudt.
- **Designkonsekvens av låsen:** Priser/Abonnement viser IKKE fasitens «299 kr + PRO årlig 2 690 + Visa ••• 4242».
- **Trenger fra Anders:** (a) månedspris (299 eller 300?), (b) årspris + skal årlig finnes (2 690?), (c) skal app-planer (Gratis/PRO/PRO-årlig) vises som i fasiten, (d) Stripe-kort/last4-visning (krever live Stripe — bak hardt stopp).
- **Besluttet verdi:** _(fylles inn)_

## 3. FYS-formel + A–K-nivåtall  ·  STATUS: låst opp, venter verdi (størst)
- **Var låst som:** FYS-resultatformel + A–K 11 snittscore-grenser parkert → «—»-plassholdere.
- **Designkonsekvens av låsen:** Helse viser «—»; Statistikk-diagnose + Onboarding steg 6 ikke bygd som fasit; nivå/neste-nivå-motor frakoblet.
- **Trenger fra Anders:** (a) de **11 A–K snittscore-grensene** (tallene), (b) **FYS-resultatformelen** (hvordan rå testresultat → score/nivå). Disse kan ikke gjettes — Claude kan hjelpe å designe dem hvis ønsket.
- **Besluttet verdi:** _(fylles inn)_

## 4. Cockpit stall-SG + plan-etterlevelse  ·  STATUS: låst opp, venter scope-bekreftelse
- **Var låst som:** placeholders «—» («til formelen er låst»).
- **Designkonsekvens av låsen:** cockpit-KPIene STALL-SG + PLAN-ADHERENCE tomme.
- **Trenger fra Anders:** bekreft beregning: stall-SG = snitt sgTotal alle aktive spilleres runder siste 30 d (gjenbruk av /admin/runder-tallet); plan-etterlevelse = fullførte/planlagte økter siste 30 d. Spm: 30-dagers vindu OK? Alle spillere eller kun elite?
- **Besluttet verdi:** _(fylles inn)_

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
