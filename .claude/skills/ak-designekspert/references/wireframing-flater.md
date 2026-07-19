# Wireframing og responsive flater — 390 / 834 / 1280+ (kanon)

Regelverket for hvordan enhver komponent og skjerm designes på tvers av mobil, iPad og desktop.
En skjerm som bare er tegnet i én bredde er en skisse, ikke et design.

## Breakpoint-kanon (design mot DISSE, ikke vilkårlige bredder)

| Ramme | Bredde | Representerer | Fasit for |
|---|---|---|---|
| **Mobil** | 390 px | iPhone (spillernes primærflate) | PlayerHQ, Forelder |
| **iPad** | 834 px portrett / 1194 px landskap | Coach på range/simulator, forelder på sofaen | Coach-i-felt-flater |
| **Desktop** | 1280 px | Standard laptop | Marketing, PlayerHQ desktop |
| **AgencyOS full** | 1680 px | Coach-kontrolltårn | AgencyOS-arbeidsflater |

## Wireframe-først-prosessen (obligatorisk før hi-fi)

1. **Gråtone-wireframe i alle relevante bredder FØRST** — bokser + etiketter, ingen farger/ikoner.
   Wireframen skal avgjøre: soneinndeling, hierarki (hva ser øyet først), nav-plassering, og
   reflow-strategien mellom breddene. Feil her kan ikke fikses med hi-fi-polering (jf. jernregelen).
2. **5-sekunderstesten på wireframen** — består den ikke i gråtoner, består den aldri i farger.
3. Deretter hi-fi i begge moduser. Wireframe → hi-fi er en énveisdør: endrer du soner i hi-fi, gå
   tilbake til wireframen.

## Fasit-bredde per produkt (hvilken bredde som VINNER ved konflikt)

- **PlayerHQ + Forelder: mobile-first.** 390 px er fasiten; desktop er berikelse (mer luft, to
  kolonner), aldri en annen informasjonsarkitektur. Spilleren står på rangen med telefonen.
- **AgencyOS: desktop-first.** 1680 px er fasiten (Linear-tetthet, kontrolltårn); mobil er en
  triage-visning — de 4 viktigste nav-punktene + Mer-ark, aldri full featureparitet presset inn.
- **Marketing: alle bredder likeverdige** — trafikk kommer fra begge.
- **iPad er ALDRI «stor mobil» eller «liten desktop»** — den har egne regler (under).

## Nav-transformasjon (låst mønster, aldri improviser)

| Bredde | Navigasjon |
|---|---|
| 390 | Bunn-nav, maks 5 punkter (PlayerHQ) / 4 + «Mer»-ark (AgencyOS), safe-area-padding |
| 834 portrett | Bunn-nav beholdes (tommel-avstand på nettbrett holdt i hendene) |
| 1194 landskap + desktop | Smal ikon-rail venstre (aldri bred sidemeny — Anders 9. juli) |

## Reflow-grammatikk per komponentklasse

- **KPI-/tallstriper:** 4–6 kort på rad (desktop) → 2×2-grid (iPad) → horisontal scroll-snap
  ELLER 2×2 (mobil). Aldri stable 6 KPI-kort vertikalt på mobil.
- **Tabeller (coach-lister):** full tabell (desktop/iPad landskap) → kortliste med primærtall +
  2–3 nøkkelfelt (mobil). Kolonner som forsvinner skal være nåbare via radens detaljvisning.
- **Split-view / mester-detalj:** side-ved-side (desktop, iPad landskap) → liste med push-navigasjon
  til detalj (mobil, iPad portrett). Konfig-med-preview: split (desktop) → tabs Konfig/Preview (mobil).
- **Popover (hover-stats):** popover (desktop) → bottom-sheet (mobil/iPad touch). Aldri popover
  forankret til fingeren.
- **Grid-trapp:** `grid-cols-1` (390) → `md:grid-cols-2` (834) → `lg:grid-cols-3/4` (1280+).
  Kort skal aldri bli bredere enn ~640 px innhold — da deles sonen.
- **Kalender:** måned/uke (desktop) → uke default (iPad) → dagsliste med ukestripe (mobil).
- **Modaler:** sentrert dialog (desktop) → fullskjerm-sheet fra bunn (mobil).

## iPad-reglene (den glemte flaten — nå påkrevd)

- **Brukskontekst:** coachen står PÅ RANGEN i sollys med iPad — lys modus må holde premium-nivå
  (jf. visuelt-sprak.md), touch-mål ≥ 44 px, kritiske handlinger nåbare med tommel på kantene.
- **To-panels mester-detalj er iPad-ens styrke:** spillerliste venstre + detalj høyre i landskap
  (stallen, godkjenninger, testresultater). Bruk den — ikke servér mobil-layouten i blowup.
- **Hybrid input:** både touch og pekepenn/tastatur — hover-effekter skal ha touch-ekvivalent
  (interaksjonsstandarder.md regel 1), fokusring alltid synlig.
- **Rotasjon:** begge orienteringer skal fungere; landskap er primær for coach-arbeid.

## Tetthet per bredde (samme data, ulik komposisjon)

- Desktop coach: Linear-tetthet — mye informasjon, lav støy, rad-hover avslører handlinger.
- Mobil spiller: ro — ett hovedtall, kontekst under, resten ett trykk unna.
- Regelen «tetthet vs. ro» i mesterens-prosess.md avgjøres altså AV BREDDEN, ikke bare av flaten.

## Leveransedefinisjon (når er en skjerm «tegnet ferdig»?)

En skjerm-mockup er komplett når den finnes i: **(1)** 390 px, **(2)** 834 px der flaten brukes på
iPad (alle coach-flater + forelder), **(3)** 1280/1680 px — × begge moduser × alle tilstander
(tom/laster/feil/full). Mangler én av dimensjonene: meld det som rest, ikke som ferdig.
