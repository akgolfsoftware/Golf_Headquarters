# Claude Design-brief — AK Golf HQ Workbench (komplett)

> **Til Claude Design.** Dette er en komplett, kode-verifisert brief for å designe hele Workbench.
> Workbench er planleggingskjernen i AK Golf HQ — **én motor, to flater**: coach i **AgencyOS (mørkt)**
> og spiller i **PlayerHQ (lyst)**. Samme komponent, to skins. Mat coach-skjermene til AgencyOS-prosjektet
> og spiller-skjermene til PlayerHQ-prosjektet. Lever produksjonsklart, én løsning per skjerm, alle fire
> tilstander (innhold/tom/laster/feil). Norsk bokmål i all UI-tekst (æ/ø/å). Aldri emoji — kun Lucide.

---

## 0. Kjernen: hva Workbench gjør

Coachen (og spilleren) bygger trening her. Hele plattformens IP — **AK-formelen / MORAD** — lever i hver
økt og hver drill. Workbench koder treningen langs seks metodikk-akser, planlegger den på en tidslinje fra
år ned til enkelt-drill, og publiserer den til spilleren. Alt nedstrøms (benchmark, signal-loop, AI Coach)
leser disse øktdataene.

**Designmål:**
- **Coach (AgencyOS mørk):** Bloomberg/Linear-tetthet. Kontroll, oversikt, hurtig koding. Maks informasjon.
- **Spiller (PlayerHQ lys):** klarhet og ro. «Hva skal jeg gjøre i dag?» Lese, ikke redigere.

---

## 1. De to flatene — eksakte tokens (LÅST)

### AgencyOS (coach, mørkt — `.dark`)
| Rolle | HEX | Token |
|---|---|---|
| Side-bakgrunn | `#0A0B0A` | `bg-background` |
| Tekst primær | `#F0F0F0` | `text-foreground` |
| Tekst sekundær | `#A6A8A3` | `text-muted-foreground` |
| Tile/kort | `#171817` | `bg-card` |
| Tile hevet | `#1E1F1D` | `bg-secondary` |
| Panel (mørkest) | `#141513` | `bg-muted` |
| Border/hårstrek | `#262725` | `border-border` |
| Lime (accent/primary) | `#D1F843` | `bg-accent` / `bg-primary` |
| Tekst på lime | `#0A140C` | `text-accent-foreground` |
| OK | `#4FD08A` | `text-success` |
| Advarsel | `#E8B43C` | `text-warning` |
| Feil/haster | `#F0683E` | `text-destructive` |
| Info | `#5AA9F0` | `text-info` |

### PlayerHQ (spiller, lyst — `:root`)
| Rolle | HEX | Token |
|---|---|---|
| Side-bakgrunn | `#FAFAF7` | `bg-background` |
| Tekst primær | `#0A1F17` | `text-foreground` |
| Tekst sekundær | `#5E5C57` | `text-muted-foreground` |
| Kort | `#FFFFFF` | `bg-card` |
| Primær (CTA, forest) | `#005840` | `bg-primary` |
| Tekst på primær (lime) | `#D1F843` | `text-primary-foreground` |
| Accent (lime, badges) | `#D1F843` | `bg-accent` |
| Sand/chips | `#F1EEE5` | `bg-secondary` |
| Border | `#E5E3DD` | `border-border` |

### Felles, låst
- **Fonter:** Inter (UI) · Inter Tight (`font-display`, titler/hero) · JetBrains Mono (`font-mono`, tall, eyebrows, AK-koder).
- **Ikoner:** kun Lucide, 24px, 1.5px stroke, `currentColor`. Ingen emoji.
- **Spacing:** 8pt-grid. AgencyOS kan tettne til 12/14px på data-flater (`p-3`, `gap-3`). PlayerHQ luftigere, mobil-først (`max-w-[430px]`).
- **Lime-disiplin:** lime = aktiv / NÅ / valgt / primær handling — aldri dekor, aldri stor flate. På lyst: aldri lime-på-lys; primær CTA = forest med lime tekst.
- **Hver skjerm:** innhold / tom / laster / feil — alltid.

---

## 2. IA — to akser

Workbench har to navigasjonsakser som vises samtidig i et **panel**:

**A) HubTabRail — 7 faner (mono-caps pills, aktiv = lime):**
`Teknisk plan · Sesongmål · Maler · Standardøkter ‖ Gantt (År) · Uke · Økt`
(separator før Gantt — venstre = «hva», høyre = «når».)

**B) Zoom-rail — 5 nivåer:** `Årsplan → År → Måned → Uke → Dag/Økt`
Zoom styrer tidslinje-granularitet. Gantt-fanen = Årsplan-zoom; Uke-fanen = Uke-zoom; Økt-fanen = Dag-zoom.

**Panel-anatomi (begge flater):**
- **Above-panel hero** (desktop): eyebrow (`AK GOLF HQ · WORKBENCH · {coach/spiller}`) + display-tittel + lead.
- **Topbar:** spiller-avatar/navn (+ for coach: spiller-velger/roster), zoom-switcher-pills, handlinger (Ny økt, AI-periodiser, Publiser).
- **HubTabRail** (44px, scrollbar på mobil).
- **Body:** venstre PaletteSidebar (kun coach) · senter zoom-visning · høyre Inspector (når noe er valgt).
- **Statusbar (bunn):** ukens volum per akse + totalt.
- **Mobil:** MobileTopbar (ordmerke + ikon-handlinger) + MobileZoomRail + bunn-ark for palette/inspektør.

---

## 3. AK-formelen — metodikk-kjernen (designet MÅ vise dette riktig)

Hver økt OG hver drill kodes langs **seks akser**. Vis dem som mono-chips (eyebrow-stil), klikkbare for coach:

| Akse | Hva | Verdier |
|---|---|---|
| **Pyramide** | Del av spillet | FYS · TEK · SLAG · SPILL · TURN (egne farger: FYS forest, TEK amber, SLAG blå, SPILL lime, TURN rød) |
| **L-fase** | Læringssteg | L_KROPP → L_ARM → L_KØLLE → L_BALL → L_AUTO |
| **CS** | Køllehastighet | CS50 · CS60 · CS70 · CS80 · CS90 · CS100 |
| **Miljø (M)** | Hvor «ekte» arena | M0 (studio) → M5 (turnering) |
| **Press (PR)** | Presset | PR1 (ingen) → PR5 (maks) |
| **P-posisjon** | MORAD svingposisjon (multi) | P1 → P10 (kan velge flere) |

I tillegg, for visning: **Praksis** (Blokk/Variasjon/Komparativ/Test) og — kun for FYS — FYS-type + intensitetssone.

**«Formel-linje»:** en kompakt mono-streng som oppsummerer en økts koding, f.eks.
`TEK · Innspill 100–150 m · M2 · PR2 · CS80 · L-Ball · Blokk`. Vis den nederst på Økt-detalj.

---

## 4. Skjerm-for-skjerm (de 7 fanene + 5 zoom)

For hver: hva som vises, nøkkel-komponenter, tilstander, og **per-flate-delta** (coach mørk / spiller lys).

### 4.1 Teknisk plan (`tek`)
- L-fase-periodisert teknisk utviklingsplan per spiller: posisjoner (P1.0–P10.0), oppgaver med AK-koding, diagnostiske mål (Baseline→Mål), track-status (PÅ_VEI/STAGNERER/FERDIG).
- **Coach:** kan redigere mål/oppgaver. **Spiller:** lese-visning + egen fremgang.
- States: tom («ingen teknisk plan ennå» — ærlig empty), innhold, laster, feil.

### 4.2 Sesongmål (`seson`)
- Spillerens aktive mål (HCP, SG-mål, milepæler) med fremgang/progress-ring per akse.
- **Coach:** redigerer. **Spiller:** ser fremgang.

### 4.3 Maler (`maler`)
- Kortgrid av plan-maler (GRUNN/SPES/TURN-fase-ikon, bruksteller, match-%-plassholder).
- **Coach:** «+ Ny mal», «Rediger» per kort, «Bruk» → legger malens økter i uka. **Spiller:** kun «Legg i plan».
- States: tom, grid, laster.

### 4.4 Standardøkter (`std`)
- Palette av gjenbrukbare standardøkter (drill-program-maler), hver kodet med AK-formel-chips.
- **Coach:** dra inn i uka, «+ Ny standardøkt», rediger. **Spiller:** «Legg i plan».

### 4.5 Gantt / Årsplan / År / Måned (zoom-aksen)
- **Årsplan (Gantt):** periodiseringsbånd over sesongen — perioder (Grunn/Spes/Turn/Eval/Ferie), belastning, turneringer. Klikk periode → inspektør.
- **År:** 12 måneder, klikk → måned. **Måned:** dager + turneringer + ukesummer, klikk dag → dag.
- **Coach:** redigerer perioder/faser. **Spiller:** ser planen.

### 4.6 Uke (`uke` / Uke-zoom) — HOVEDFLATEN
- **Time-grid (07–22)** med 7 dagskolonner. Økt-kort posisjonert på klokkeslett, fargekodet per pyramide-akse. Overlappende økter får side-by-side lanes m/ grip-håndtak.
- **Coach:** dra fra PaletteSidebar/Standardøkter inn på dag+tid; flytt mellom dager; klikk → Inspector. FORRIGE/NESTE uke.
- **Spiller:** ser ukeplanen, klikker en økt for detalj. Ingen dra-redigering.
- **KPI-strip** over griddet: volum per akse + antall økter (+ «—» for adherence/SG til datamodell finnes).
- **Innsiktsstripe:** «Hvorfor denne uka» (gruppe-/plan-innsikt).
- States: **tom** = «Ingen plan»-onboarding (kun inneværende uke); fylt = griddet; laster; feil.

### 4.7 Økt (`okt` / Dag-zoom) — ØKT-DETALJ (mye nytt her)
Dette er den dypeste flaten — designet komplett:
- **Hero:** «Kommende»-chip, dag, økt-tittel, AK-sub (område · pyramide · dag), varighet.
- **Coach hurtighandlinger:** Varighet · Intensitet · Mål · Notat (ikon-rad). Bane/Range-modus-toggle.
- **Drill-program (ekte drills):** liste av drill-rader. Hver rad:
  - nummer + øvelsesnavn + reps/sett.
  - **per-drill AK-formel-chips** (L-fase, CS, miljø, press) — klikkbare for coach (åpner verdivelger), lese for spiller. Pluss P-posisjon som multi-chips (P6 ×, P7 ×) + «+ P».
  - slett (coach).
  - **«Legg til øvelse»** (coach) → søke-modal i øvelsesbiblioteket → velg → drill arver øktas AK-default.
- **Fordeling:** kompakt visning av hvordan drill-kodene fordeler seg per akse (L-fase · CS · miljø · press · P-pos) — i dag tally («L_BALL ×2 · L_AUTO ×1»), **mål: mini-stablet bar per akse** (design dette).
- **Coach-notat + SG-kobling**-paneler (coach).
- **Formel-linje** (mono) nederst.
- **«Start økt nå»** (primær, lime/forest).
- States: tom (ingen drills — «legg til øvelser»), fylt, laster, «lagre økta først» (usynket økt).

---

## 5. Rolle-forskjeller (samme komponent, to moduser)

| Affordance | Coach (AgencyOS mørk) | Spiller (PlayerHQ lys) |
|---|---|---|
| Spiller-velger (roster) | Ja (bytt hvem du planlegger for) | Nei (statisk avatar) |
| PaletteSidebar (dra-inn-økter) | Ja | Nei |
| AK-formel-chips (økt + drill) | **Redigerbar** (åpner verdivelger) | **Lese-visning** (samme chips, ikke klikkbare) |
| Drill-CRUD (legg til/slett/rediger) | Ja | Nei (ser drill-lista) |
| Mal-/standardøkt-redigering | Ja | Kun «Legg i plan» |
| Publiser plan | Ja | Ser plan-status + «Godta» |
| Dra-drop i uke-grid | Ja | Nei |

Spilleren skal **aldri** se redigeringsaffordances. Chips renderes likt, men uten klikk-tilstand/«+».

---

## 6. Komponenter (gjenbruk athletic/, design disse Workbench-spesifikke)

Gjenbruk: AthleticHero, AthleticEyebrow, AthleticAvatar, AthleticBadge, KpiStrip, kalendere.
Workbench-spesifikke (design mørk + lys variant der relevant):
- **HubTabRail** (7 pills) · **MobileZoomRail** · **Topbar/MobileTopbar**.
- **Uke time-grid** med posisjonerte økt-kort + overlapp-lanes.
- **Inspector** (høyre panel / mobil bunn-ark): AK-formel-chips + gjentakelse + handlinger.
- **DimPicker** (verdivelger-modal for én AK-akse, single + multi).
- **Drill-rad** (øvelse + reps + per-drill AK-chips + slett).
- **Øvelses-velger** (søke-modal i biblioteket).
- **DrillFordeling** (mini-stablet bar per akse — designet ferskt her).
- **Periodiserings-bånd** (Årsplan/Gantt).
- **KPI-strip** + **Innsiktsstripe** + **Statusbar** (volum per akse).

---

## 7. Datakontrakt (så designet viser ekte felt, ikke påfunn)

- **Økt** (`TrainingPlanSession`, kanon): tittel, tid, varighet, pyramide, + **AK-formel: lFase, miljo (M0–M5), csNivaa (CS50–CS100), pressureLevel (PR1–PR5), pPosisjoner (P1–P10)**. Status (PLANLAGT m.fl.).
- **Drill** (`SessionDrill`): øvelse (fra `ExerciseDefinition`), reps/sett, csTarget, + **samme AK-formel per drill**. Arver øktas default, kan overstyres.
- KPI som ennå mangler datamodell (adherence, SG-gevinst): vis ærlig «—», ikke oppdiktede tall.

---

## 8. Hva som ALLEREDE er bygd (fasit å matche) vs. designmål

**Bygd og live (design MÅ matche dette, ikke finne opp nytt):**
- 7 hub-faner + 5 zoom · uke time-grid med dra-drop (coach) · Inspector med AK-chips (role-gatet) · Økt-detalj med ekte drill-CRUD, øvelses-velger, per-drill AK-chips, og fordeling (tally).

**Designmål (forbedre/fullføre):**
- Fordeling som **mini-stablet bar per akse** (i dag tally).
- **Spiller 360-fordeling** (vis drill-fordeling også utenfor Økt-detalj).
- Reps/sett-redigering inline i drill-raden.
- Helhetlig visuell polering av uke-grid + Økt-detalj i begge tema.

**Ikke design (utenfor scope nå):** status-enum-endring, modell-konsolidering, IA-omlegging, nye funksjoner (benchmark/signal/dispersion).

---

## 9. Leveranse fra Claude Design
Per skjerm (de 7 fanene + 5 zoom + Økt-detalj + drill-rad + fordeling + Inspector + øvelses-velger):
mørk coach-variant **og** lys spiller-variant (der spiller ser flaten), alle fire tilstander, mobil + desktop.
Følg token-tabellene i §1 eksakt. Lime kun som aksent. Lever produksjonsklart — ett forslag, lås.
