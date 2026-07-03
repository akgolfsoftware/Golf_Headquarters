# Fase-spesifikasjon — AgencyOS 10/10 (V1, Fase 0–5)

> **To lesere, ett dokument.** Hver fase har **Design-brief** (for Claude Design — skjermer, datakomponenter,
> states, nye komponenter) og **Bygg-brief** (for koding — datamodell, server-actions, logikk). Da kan design
> og koding gå parallelt. Video-verktøy (#7, #13) ligger i V2 og er ikke her.
>
> Bygger på `funksjonsforslag-10-10-agencyos.md` + `implementeringsplan-agencyos.md` + `funksjonskart-agencyos.md`.
> Generert 2026-06-30. Krever Anders' ja før koding.

---

# DEL A — Delt design-kontekst (les én gang, gjelder alle faser)

**Alle skjermene under er AgencyOS (trener) = MØRKT tema.** Unntak merkes (PlayerHQ-datainntak i Fase 1 = lyst).

## Tokens (verifisert mot `src/app/globals.css`, `.dark`)
| Rolle | HEX | Token |
|---|---|---|
| Side-bakgrunn (nær-svart, varm) | `#0A0B0A` | `bg-background` |
| Tekst primær | `#F0F0F0` | `text-foreground` |
| Tekst sekundær | `#A6A8A3` | `text-muted-foreground` |
| Tile / kort | `#171817` | `bg-card` |
| Tile hevet | `#1E1F1D` | `bg-secondary` |
| Panel (mørkest innhold) | `#141513` | `bg-muted` |
| Hårstrek / border | `#262725` | `border-border` |
| Lime (accent/primary i mørk) | `#D1F843` | `bg-accent` / `bg-primary` |
| Tekst på lime | `#0A140C` | `text-accent-foreground` |
| OK / suksess | `#4FD08A` | `text-success` |
| Advarsel | `#E8B43C` | `text-warning` |
| Feil / haster | `#F0683E` | `text-destructive` |
| Info | `#5AA9F0` | `text-info` |

**Lime-disiplin (hard regel):** lime = aktiv/NÅ/haster eller primær handling — aldri dekor. Aldri lime tekst på lime flate; bruk `text-accent-foreground` (#0A140C) på lime.

## Fonter, ikoner, spacing
- **Inter** (UI/brødtekst) · **Inter Tight** (`font-display`, hero/titler) · **JetBrains Mono** (`font-mono`, KPI-tall, eyebrows).
- Ikoner: **kun Lucide**, 24px, 1.5px stroke, `currentColor`. Ingen emoji.
- Spacing: 8pt-grid. Data-tette flater (dashboards/tabeller) kan bruke 12/14px (`p-3`, `gap-3`) — Bloomberg-tetthet er ønsket i AgencyOS.

## Gjenbruk FØRST (ikke bygg på nytt)
Komponentbibliotek + hva som finnes: se [`komponenter.md`](komponenter.md). Branded i `src/components/athletic/`,
shadcn-primitiver i `src/components/ui/`. Kalender/tidslinje (39 komponenter) er et eget delsystem — gjenbruk.

## IA-rammen — de 13 hubene (skjermene lever her)
Cockpit · Stall · Spiller 360 · Workbench · Drift · Innsikt · Innboks · Turneringer · Talent · Økonomi · AI-senter · Arbeidsflyt · Oppsett.
Regler: **Cockpit = se / Innboks = gjøre**, Stall = én liste m/briller, Workbench = bibliotek + plan-fra-spiller,
rolle-filtrert (COACH ser ~8, ADMIN alle), mobil = 5 huber + «Mer».

## Porting-gate (gjelder hver skjerm Claude Design leverer)
Ingen låst gate-regel akkurat nå (fjernet 2026-07-03 — design under aktiv utvikling, se `CLAUDE.md`). Når ny
handover kommer: skriv gaten på nytt (bygg fra design-kilde, screenshot, adversarial diff, fiks til 0 avvik).
De dokumenterte AgencyOS-unntakene lever videre i
[`.claude/rules/design-produktbeslutninger.md`](../../.claude/rules/design-produktbeslutninger.md) — stående
beslutninger, uavhengig av handover. Hver skjerm leveres med states: **tom / laster / feil / fylt**.

## Nye komponenter som må DESIGNES (samlet katalog — detaljeres per fase)
| Komponent | Fase | Kort |
|---|---|---|
| Benchmark-scrubber | 1 | Dra et nivå → se percentil/slag-gap |
| Fordelings-radar (violin per akse) | 1 | Spiller mot kohort-fordeling, 5 SG-akser |
| Approach-varmestige | 1 | Innspill-benchmark per avstandsbøtte (50–200+ m) |
| Nivå-score-badge (5 nivåer) | 2 | «Trenger arbeid → Tour-nivå» over rå SG |
| «Hva-jobbe-med»-kort | 2 | Prioritert svakhet → matchende driller |
| Signal-feed / trigger-kort | 3 | Hardt signal + foreslått handling |
| Plan-diff-preview | 3 | Før/etter når et forslag endrer planen |
| Wellness-logg + ACWR-graf | 5 | Daglig sjekk + belastningskurve |
| Live-puls | 5 | Sanntid: vinnersannsynlighet/live-SG |
| Dispersion-banekart | 5 | Spredning + strategi-mål per spiller |

---

# DEL B — Fasene

## Fase 0 — Fundament & opprydding  *(S)*

**Mål:** Rydde grunnen — datakobling, IA-lås, datamodell-plan. Lite ny UI.

### Design-brief
- **Ingen nye skjermer.** Leveranse her er at Claude Design får IA-fasiten låst: de 13 hubene + 5 justeringer som bindende rammeverk, og token/komponent-konteksten over. Claude Design kan parallelt begynne på **Cockpit**- og **Stall**-skjermene (de endrer seg minst av nye data og er naturlige startpunkt).

### Bygg-brief
- Bytt HQ-lesere til Intelligence-API (`src/lib/intelligence/client.ts`); bekreft `dashboard`-schema fylt.
- Lås IA skriftlig (oppdater MASTER-SKJERMPLAN/ux-arkitektur med 13-hub-modellen).
- Planlegg additive datamodell-endringer for Fase 1–5 (én oversikt): benchmark-cache, signal-terskler, wellness, dispersion. Alt via `db execute` (jf. `gotchas.md` — `migrate dev`/`db push` er blokkert).

**Ferdig når:** HQ leser benchmarks fra Intelligence-API, IA er låst, datamodell-endringene er kartlagt additivt.

---

## Fase 1 — Benchmark-motor + datainntak  *(M)*  → #2, #6

**Mål:** Hver spiller plasseres på en percentil-kurve mot ekte DataGolf-fordeling, per kategori og nivå.

### Design-brief
**Hub: Innsikt + Spiller 360 (mørkt).** Datainntak-skjermene (#6) er PlayerHQ = **lyst**.

| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Innsikt → Benchmark (ny fane) | Stall-liste: hver spiller per SG-akse som percentil + slag-gap til neste nivå | data-tett tabell + **benchmark-scrubber** + **fordelings-radar** | tom (ingen runder) / laster / fylt |
| Spiller 360 → Benchmark-blokk | Én spiller: 5 akser (Driving/Approach/Around/Putting/Total) som percentil + violin mot kohort | **fordelings-radar**, **approach-varmestige** | tom / fylt |
| PlayerHQ → Runde-logg (lyst) | Selvbetjent registrering: fairway%/GIR%/putts → auto-SG-preview | skjema (ui/input), live SG-preview-kort | tom / utfylt / lagret / feil |

**Nye komponenter (detalj):**
- **Benchmark-scrubber:** horisontal akse klubb→PGA; dra håndtak → kort viser «percentil X, N slag unna». Lime håndtak (aktiv). Mono-tall.
- **Fordelings-radar:** 5-akset, violin/fordeling per akse, spiller-punkt + kohort-median overlay. Ikke lime som dekor — lime kun for spillerens punkt.
- **Approach-varmestige:** vertikal stige med avstandsbøtter (50–75 … 200+ m), farge = over/under benchmark (success/warning/destructive-toner).

### Bygg-brief
- **Datamodell (additivt):** `benchmark_cache` (userId, kategori, nivå, percentil, slag-gap, beregnetAt); evt. `round_log` for selvbetjent runde.
- **Motor:** `lib/intelligence/benchmark.ts` — gitt spillerens SG + nivå → percentil mot `dashboard`-fordeling + slag-gap. Nivå-adaptiv referansekohort.
- **#6 inntak:** server-action `loggRunde` (fairway/GIR/putts → SG-beregning), GolfBox-score→SG-importer.
- **Komponent-data:** charts leser kun fra `lib/design-tokens.ts` (ingen hardkodet hex).

**Ferdig når:** Coachen ser hver spiller som percentil per kategori med slag-gap, fra ekte data; spiller kan logge runde → SG.

---

## Fase 2 — Innsikt-laget: hva-jobbe-med + nivå-score  *(M)*  → #1, #3

**Mål:** Gjør tallene til handling og gjør dem lesbare.

### Design-brief
**Hub: Spiller 360 + Innsikt + Cockpit/AI-senter (mørkt).**

| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Spiller 360 → «Fokus nå»-blokk | Auto-prioritert svakhet (størst slag-gap) + 2–3 matchende driller | **«Hva-jobbe-med»-kort** + drill-tiles (gjenbruk) | tom (for lite data) / fylt |
| Innsikt → Nivå-kolonne i tabell | Hver akse som **nivå-score-badge** (5 nivåer) ved siden av rå SG | **nivå-score-badge** | fylt |
| Cockpit → Caddie-proaktiv-stripe | «Øyvind: jobb innspill 150–175 m» som proaktivt forslag | action-list (gjenbruk) + Caddie-kort | tom (alt ajour) / forslag |

**Nye komponenter (detalj):**
- **Nivå-score-badge:** 5 nivåer (Trenger arbeid · På vei · Solid · Elite · Tour-nivå) — fargestige fra muted → lime. Lesbar tekst, mono om tall.
- **«Hva-jobbe-med»-kort:** tittel (svakhet) + slag-gap + avstand/kategori + knapp «Legg driller i plan» (→ Workbench).

### Bygg-brief
- **Logikk:** `lib/coaching/focus.ts` — fra benchmark-gap (Fase 1) → rangert svakhetsliste → match mot drill-bibliotek (kategori/avstand).
- **Nivå-score:** ren funksjon SG/percentil → ett av 5 nivåer (terskler dokumenteres; **FYS-formel er ikke låst** — hold referanseverdier som config, ikke hardkod).
- **Caddie proaktiv:** utvid `kjorCaddieProaktiv` til å emittere fokus-forslag per spiller.

**Ferdig når:** For en spiller ser coachen «jobb med X» + driller, og et lesbart nivå per område; Caddie foreslår uten å bli spurt.

---

## Fase 3 — Adaptiv signal-loop  *(M)*  → #4

**Mål:** Lukk kodehullet — forslag som faktisk endrer planen.

### Design-brief
**Hub: Cockpit + Innboks + Workbench (mørkt).**

| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Cockpit → Signal-sone | Aktive triggere (SG-drop, stagnasjon, tomrom, turnering nær) | **signal-feed / trigger-kort** | tom (rolig) / signaler |
| Innboks → Godkjenning-type | Plan-forslag fra signal: godta/tilpass/avvis med **plan-diff-preview** | godkjenn-kø (gjenbruk) + **plan-diff-preview** | tom / venter / behandlet |
| Workbench → endret plan | Etter godkjenning: planen viser endringen (ikke bare status) | uke time-grid (gjenbruk) | — |

**Ny komponent:** **plan-diff-preview** — før/etter side ved side (hvilke økter/fokus endres), additive=success, fjernet=destructive-tone.

### Bygg-brief
- **Datamodell:** `signal_threshold` (type, terskel, vindu) + bruk eksisterende `Signal`/`PlanAction`.
- **Triggere:** `lib/signals/triggers.ts` — SG-drop −0,3×2 perioder; HCP-stagnasjon >8 uker; treningstomrom >14 d; turnering <3 uker → modus; ny skade.
- **Ekte planendring:** fiks `acceptPlanAction` til å *anvende* `PlanAdjustmentProposal` på planen (A3-hullet), ikke bare sette status.
- **Business-rules:** maks 2 hovedfokus/periode; ingen sving-endring i konkurransefase uten override; eval-intervall ≥8 uker — håndhev i plan-motoren.

**Ferdig når:** Et signal → forslag → coach godkjenner → planen endres faktisk, med diff-preview.

---

## Fase 4 — Forretning: ekte Stripe  *(M, kan starte fra dag én)*  → #5

**Mål:** Økonomi-flata viser ekte betalinger og kan fakturere.

### Design-brief
**Hub: Økonomi + Drift (mørkt).**

| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Økonomi (slå sammen `agencyos/okonomi` + `okonomi`) | MRR/innbetalt/utestående fra ekte Stripe + fakturatabell | KPI-strip + tabell (gjenbruk) | tom / fylt |
| Drift → pakke→betaling→roster | Sammenhengende: kjøp pakke → betaling → påmelding | wizard (gjenbruk) | steg-states |

Få nye komponenter — primært ekte data inn i eksisterende KPI/tabell. **Ingen Stripe-kortdetaljer i UI** (jf. tidligere regel-opplåsing — avklar visning med Anders).

### Bygg-brief
- Stripe live-nøkler (env), webhook for betalingsstatus, fakturautsending (Resend).
- MRR/utestående fra ekte `Payment`-data, ikke seed.
- Slå sammen de to økonomi-rutene til én kanonisk.

**Ferdig når:** Ekte betalinger vises, faktura kan sendes.

---

## Fase 5 — Differensierende delspor  *(L, parallelle, tas ett og ett)*  → #8–#12

**Mål:** Moat-løft uten avhengighet av kjernekjeden.

### Design-brief (per delspor)
| # | Hub | Skjerm/blokk | Nye komponenter | States |
|---|---|---|---|---|
| #8 MORAD-Caddie | AI-senter | Caddie-svar med MORAD-checkpoints/sitater | (utvid chat-bobler m/ kilde-sitat) | tom / svar / feil |
| #9 Helse/belastning | Spiller 360 + Cockpit | Daglig wellness-blokk + belastningskurve + risiko-varsel | **wellness-logg** (input) + **ACWR-graf** | tom / logget / risiko |
| #10 Live/ukeresultat | Cockpit + Talent | Live-puls + ukeresultat-liste (norske spillere) | **live-puls** + resultat-liste (gjenbruk) | før event / live / etter |
| #11 Dispersion | Innsikt + Workbench | Spredningskart + strategi-mål per spiller | **dispersion-banekart** (Mapbox/OSM) | tom / kart |
| #12 Drill-discovery | Workbench | AI-foreslåtte driller i godkjenn-kø | forslags-kø (gjenbruk) | tom / forslag |

### Bygg-brief (per delspor)
- **#8:** koble Caddie til MORAD-vektorlager (RAG) + CIO-er.
- **#9:** `wellness_log` (userId, dato, søvn/sårhet/stress), ACWR-beregning (akutt/kronisk last), terskel-varsel.
- **#10:** fiks mandagslast (GitHub Actions deaktivert → alternativ scheduler), wire DataGolf live, push-varsler.
- **#11:** banedata (Mapbox + OSM, jf. baneguide-dispersion-plan), dispersion-beregning per spiller.
- **#12:** fullfør web/YT-søk → AI-drill → godkjenn → ingest-loop.

**Ferdig når:** Hvert delspor levert og verifisert isolert.

---

## Arbeidsdeling design ↔ kode
- **Claude Design** kan starte umiddelbart på **Cockpit** og **Stall** (Fase 0-kontekst holder), så ta fasene i rekkefølge: Benchmark-skjermer (1) → Fokus/nivå (2) → Signal/diff (3) → Økonomi (4) → delspor (5).
- **Koding** følger samme rekkefølge bakfra: datamodell + motor per fase, så kobler vi designet på når det er klart.
- Hver ny komponent designes mot token-tabellen i Del A og gjenbruker athletic/ui der mulig.

## Neste steg
1. Du godkjenner faseinnholdet (eller justerer).
2. Jeg lager en konkret nummerert byggeplan for **Fase 0** (maks 10 steg) + de samlede additive datamodell-endringene, og venter på ja før koding.
3. Dette dokumentet kan gis til Claude Design som komplett skjerm-/komponent-brief.
