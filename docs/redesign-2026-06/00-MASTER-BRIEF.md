# AK Golf HQ — Master-brief for nytt design (Claude Design)

> **Dette er et HELT NYTT visuelt design.** Det erstatter den gamle brief-pakka (`docs/design-brief/`) som sa «behold + utbedre». Den regelen gjelder ikke lenger.
> **Eneste låste visuelle element: lime #D1F843.** Alt annet — mørkt/lyst, bakgrunnsfarger, typografi, komponentstil, layout — er åpent for nytenkning. Mål: et verdensledende design.
> **Laget:** 17. juni 2026.

---

## 0. Aller viktigst — STILL SPØRSMÅL

Eieren (Anders) ønsker at du **stiller så mange spørsmål som overhodet mulig** før og under designarbeidet. Ikke anta. Når noe er uklart, når det finnes flere tolkninger, eller når et visuelt valg kan påvirke hvordan en funksjon oppfører seg — **spør**.

**Spesielt om Workbench:** Anders designer Workbench-flyten selv (funksjoner, hva-er-hva, hva-gjør-hva er i ferd med å bli ferdig hos ham). Du skal **ikke overstyre eller motsi** den funksjonaliteten. Der dette briefet eller et designforslag kan kollidere med Workbench slik Anders bygger den — **still spørsmål til Anders først**, ikke velg selv.

---

## 1. Mandatet

1. **Nytt visuelt språk, fritt.** Du står fritt til å foreslå et helt nytt uttrykk. Behold kun lime som signaturfarge.
2. **Funksjon og struktur er i hovedsak bestemt** — det er det VISUELLE og rekkefølge/hierarki som er ditt rom. Hva en skjerm GJØR og hva som hører hjemme hvor, ligger fast (se §4 og skjerm-settet). Endrer du på funksjon: spør.
3. **Lanseringsklart, ikke skisse.** Ekte innholdsstruktur, alle tilstander (innhold/tomt/laster/feil), responsivt.
4. **Flyt før skjerm.** Hver skjerm svarer på «hva er neste steg». **Ingen døde knapper** — hver knapp har en destinasjon (se flyt-inventar).
5. **≤ 2 trykk for kjernehandlinger.** Spiller: start dagens økt ≤2 trykk, logg resultat 1 trykk. Coach: planlegg & tildel til gruppe ≤2 trykk, handle på forespørsel inline.
6. **Rik komponent-variasjon (høyt prioritert av eieren).** Mange, visuelt sterke varianter for å vise ulik data og innhold — ikke ett kjedelig kort gjentatt. Kule komponenter er et eksplisitt mål.

---

## 2. Hva AK Golf HQ er

Hele plattformen for AK Golf Group — elite golf-coaching og prestasjonsanalyse. Ankeret: **«DataGolf møter The Athletic, hvis de møttes på Linear.»** Datadrevet, rolig, presist. Tall er helter. Aldri gymsalg-hype.

Fire produkter + en offentlig statistikk-plattform, alle under samme tak og samme designsystem:

| Flate | Rute | Enhet | Tema (anbefalt) | Hvem |
|---|---|---|---|---|
| **PlayerHQ** | `/portal` | **mobil-først** (90 % mobil) | **lyst** | Spilleren — «hva gjør JEG i dag» |
| **AgencyOS** | `/admin` | **desktop-først** (+ full mobil) | **mørkt** | Coach/admin — «hvem trenger MEG» |
| **Forelderportal** | `/forelder` | mobil + desktop | lyst | Foreldre — lesemodus, innsyn |
| **Marketing** | `/` (akgolf.no) | desktop + mobil | lyst, editorial | Salg/lead |
| **Stats-plattform** | `/stats` | desktop + mobil | eget uttrykk | Offentlig golf-database (eget spor) |

**Workbench** er en delt planleggings-kjerne i både PlayerHQ og AgencyOS (Anders designer den selv).

---

## 3. Tema-anbefaling (mørkt vs. lyst)

Ikke ett tema for hele plattformen — **riktig tema per kontekst**:

- **PlayerHQ → lyst.** Spilleren bruker appen ute, ofte i sollys (range, første tee). Lyst er mer lesbart i sol. Legg gjerne mørke, premium foto-hero-er og datakort *inni* det lyse temaet for «wow» uten å miste lesbarhet.
- **AgencyOS → mørkt.** Coachen sitter innendørs i svingstudio/desktop med tette tabeller. Mørkt «kontrolltårn» er penere og mindre slitsomt der.
- **Forelder → lyst.** Rolig, enkelt, ikke-teknisk.
- **Lime binder lyst og mørkt sammen** til ett merke.

> **NB:** Anders skal teste 3 designretninger (mørk, lys, terminal) på telefonen før endelig valg av tema. Inntil han har valgt: behandle tema som åpent og **spør** hvis et skjermforslag forutsetter ett bestemt tema.

---

## 4. Låste produktbeslutninger (funksjon/IA — IKKE endre, design rundt)

Dette er forretnings-/IA-regler, ikke designvalg. De overstyrer alt visuelt.

- **Navn:** Coach-appen heter **AgencyOS** — aldri «CoachHQ».
- **Planlegging = Workbench.** «Planlegge» er ÉTT trykkpunkt til Workbench (ikke en meny av kort), for både coach og spiller. Workbench har tre zoom-nivåer: **År (Gantt) → Uke → Økt**. Bibliotek (maler, drills, turneringer) hentes inn FRA Workbench. *(Anders designer detaljene — spør ved tvil.)*
- **Analyse samlet.** Analysere + TrackMan + Runder + SG + Tester er ÉN flate med faner — ikke separate moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Demo-navn (alltid fulle navn):** spiller = **Øyvind Rohjan** (initialer ØR, HCP 4,2), coach = **Anders Kristiansen**. Avatar-initialer avledes fra navnet. NB: ekte coach «Markus Røinås Pedersen» på markedssider beholdes.
- **Abonnement:** gratis (prøveperiode / coaching-pakke / gruppe) eller 300 kr/mnd. «Performance / Performance Pro» er **coaching-pakker, ikke app-nivåer** — vis dem aldri som app-nivå. **ELITE vises ALDRI.**
- **Tier-pill i hero:** «PlayerHQ · {tier}» (+ «· HCP {hcp}» på desktop). `{tier}` = GRATIS eller PRO.
- **FYS-testresultater:** vis plassholder-tall. Ingen hardkodede referanseverdier (formelen er ikke låst).

---

## 5. Skjerm-settet du designer (det konsoliderte settet)

Full liste: `skjerm-inventar-konsolidering.md` (på Drive: AK Golf Group → software → akgolf-hq). Kort: **404 ruter er ryddet til ~150–180 unike skjermer** — legacy (hele gamle `/portal/mal/*`), redirects og dubletter er fjernet. Design KUN det rene settet.

| Spor | Unike skjermer | Start-prioritet |
|---|---|---|
| PlayerHQ | ~55–65 | 1 (kjerne, mobil) |
| AgencyOS | ~45–55 | 2 |
| Forelderportal | ~11 | 3 |
| Auth/onboarding | ~14 | 4 |
| Marketing (u/stats) | ~15 | 5 |
| Stats-plattform | ~30 | eget spor, senere |

---

## 6. Kjerne-brukerflyter (≤ 2 trykk)

**Spiller (PlayerHQ):**
- Hjem → se dagens økt → start (≤2 trykk). Logg resultat = 1 trykk.
- Hjem → Planlegge = ett trykk inn i Workbench (ikke en kort-meny).
- Analyse: én flate, faner for SG/Runder/TrackMan/Tester.
- Coach-kontakt: melding/spørsmål/notat fra coach samlet.

**Coach (AgencyOS):**
- Cockpit «hvem trenger meg nå» → handle på en spiller/forespørsel inline.
- Planlegg & tildel plan/test til en gruppe ≤2 trykk.
- Innboks/forespørsler/godkjenninger samlet til ett handlingssenter.

**Forelder:** innsyn (barnets uke, økonomi, samtykke) — lesemodus, ingen handling på vegne av barn.

---

## 7. Komponent-mandat (rik variasjon — eierens topp-ønske)

Bygg et **rikt galleri** med mange varianter for å vise data/innhold. Minst disse familiene, hver med flere varianter:

- **Tall/KPI:** KPI-kort, stat-celle, KPI-ring, delta-tall (fortegn + farge + retning), ghost-number.
- **Grafer:** søyle, linje, radar, sparkline, donut, heatmap, strokes-gained-barer (positiv grønn / negativ rød mot benchmark).
- **Tabeller:** tett sorterbar med sticky header + nullstate; kompakt liste-tabell.
- **Tid/plan:** uke-grid, måned-grid, år-Gantt, periode-tidslinje, dag-planner, heatmap-kalender.
- **Kort:** standardkort, feature-kort (foto-gradient), insight-kort, turnerings-kort, hub-kort.
- **Hero:** foto-hero (m/ gradient), side-hero, detalj-hero.
- **Status:** badge/pill (ok/advarsel/haster/info/nøytral/lime), pulse-dot, presence-dot.
- **Handling:** knapp (alle størrelser/varianter), quick-action, filter-pill-bar, action-list, kø-rad/-liste, itinerary-rad.
- **Domene:** pyramide-progresjon (Fysisk→Teknisk→Golfslag→Spill→Turnering), shot-map, club-metric-grid, test-matrise, scorecard.
- **Tilstander (på HVER dataflate):** innhold · tomt (EmptyState m/ neste-handling) · laster (skeleton-puls, aldri spinner) · feil.

---

## 8. Designfilosofi (gjelder alle retninger)

- **Tall er helter.** KPI/statistikk i JetBrains Mono, tabulært, norsk format (komma-desimal, mellomrom-tusenskille, «48,3 %», 24t-tid `14:30`).
- **Lime er signatur, aldri tapet.** Kun signatur-øyeblikk (primær-CTA, aktiv tilstand, KPI-puls, fokus). Aldri lime tekst på lime flate (mørk tekst på lime).
- **Foto, ikke fyll.** Atmosfærisk golffoto med gradient-lag i hero — aldri solid-farge-hero.
- **Bevegelse rask og rolig.** 150–250 ms, ease-out. Skeleton-puls, ikke spinners.
- **Norsk bokmål**, «du»-tiltale. Ingen emoji — kun Lucide-ikoner (24px, 1.5px stroke).

---

## 9. Definisjon av «lanseringsklar» (per skjerm)

- [ ] Bygget av komponent-biblioteket (ingen duplikat-komponent).
- [ ] Alle tilstander: innhold · tomt · laster · feil.
- [ ] Responsiv på riktig enhet.
- [ ] Kjernehandling ≤ 2 trykk, tydelig neste steg, **ingen døde knapper**.
- [ ] Norsk bokmål, riktig tall-/casing-format, ingen emoji, kun Lucide-ikoner.
- [ ] Følger låste beslutninger (§4). Ved tvil mot Workbench: **spurt Anders**.
