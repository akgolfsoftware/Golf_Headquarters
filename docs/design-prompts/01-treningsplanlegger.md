# Claude Design-prompter: TRENINGSPLANLEGGER

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.

---

## Prompt 1.1 — Årsplan (Gantt 52 uker)

```
Du er senior UI/UX-designer for AK Golf HQ. Design ÅRSPLAN-skjermen for treningsplanleggeren — det øverste planleggingsnivået.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Årsplan

URL: /admin/kalender?view=ar
Bruker: Coach Anders, ser sin egen portefølje på 6 spillere

### Layout — tre-panel
- Venstre: CoachHQ dark sidebar 256px (mørk #061210, lime accent på aktiv)
- Midt: PlanSidebar 280px (hvit, scrollbar)
- Høyre: Hovedinnhold flex-1

### CoachHQ sidebar-innhold
Liste over moduler: Hub · Kalender · Forespørsler · Spillere · Treningsplaner · Anlegg · Tjenester · Turneringer · Analytics · Rapporter · Økonomi · Team · Innstillinger. "Kalender" er aktiv (lime accent-streck venstre).

### PlanSidebar-innhold (280px)
1. **Mini-kalender 3 måneder** med fargede prikker på dager med økter (pyramide-farger)
2. **Spillere** — checkbox-liste:
   - ☑ Markus R (lime dot)
   - ☑ Emma S
   - ☑ Joachim T
   - ☐ Lina H (inaktiv)
   - ☐ Mads R
   - ☐ Henrik N
3. **Pyramide-filter** — 5 sjekkbokser med fargestripe: FYS, TEK, SLAG, SPILL, TURN
4. **Praksistype-filter** — 4 chips: B, R, K, S
5. **CapacityLoad-bar** — "Belastning denne uka: 78%" med grønn bar
6. **Myelin-tracker** — 5 rader (FYS 2d, TEK 4d, SLAG 1d, SPILL 12d ⚠, TURN 28d 🔴) — bruk fargede tall, ikke emoji
7. **Aktiv periode** — "Spesialisering · uke 12-22 · 8 uker igjen"

### Hovedinnhold

#### Header-rad
- Visningsvelger (tabs): ÅR · MÅNED · UKE · DAG (ÅR aktiv med 2px underline #005840)
- I dag-knapp + navigasjon-piler (← År 2026 →)
- Spillervelger dropdown ("Alle 6 spillere ▾")
- Eksporter-knapp + Ny periode-knapp

#### Gantt-tabell
- Grid: `160px repeat(52, minmax(18px, 1fr))` — én rad per spiller, 52 uke-kolonner
- Rad-høyde: 52px
- Måneds-headers øverst (Jan/Feb/Mar/... — 4-5 uker per måned)
- Uke-numre under (1-52)

**6 spillere som rader:**
- Markus R (HCP 4.2, A1)
- Emma S (HCP 8.1, A2)
- Joachim T (HCP 12.4, B-fokus, skade-flagg)
- Lina H (HCP 3.1, A1)
- Mads R (HCP 15.2, A3)
- Henrik N (HCP 2.4, A1)

**Per spiller — periodeblokker:**
- Uke 1-8: GRUNN (#003B2A bg, hvit tekst)
- Uke 9-11: EVALUERING (#5E5C57)
- Uke 12-22: SPESIALISERING (#005840)
- Uke 23-24: FERIE (diagonal-stripet bakgrunn, ingen tekst)
- Uke 25-37: TURNERING (#D1F843, **#0A1F18-tekst**, ikke hvit)
- Uke 38-44: EVALUERING
- Uke 45-52: GRUNN

**Spesialeffekter:**
- TurneringMarker (diamant #D1F843 med stroke #0A1F18) på spesifikke uker — markerer kommende turneringer. Tooltip på hover: "Oslo Open · 18-20. juli"
- 7-dagerslås før turnering: 2px gul border-left på uke
- Skade-flagg på Joachim: rød pulserende prikk øverst-høyre på raden uke 23

#### Footer
- Tekst: "Drag for å lage ny periode. Klikk eksisterende periode for å redigere."
- Legend: pyramide-farger med labels

### Editorial moment
Eyebrow: `COACHHQ · KALENDER · ÅRSPLAN`
Tittel (Inter Tight 36px): "Sesongen *2026.*" — `*2026*` er italic Instrument Serif

### Komponenter som må vises
- Active live-økt i toppraden (pulserende lime ring) hvis Markus har LIVE-økt nå

Lever som én HTML-fil med all inline CSS. Komplette dummy-data — gjør den så realistisk at jeg kan vise den til Anders direkte.
```

---

## Prompt 1.2 — Månedsplan

```
[LIM INN 00-shared-spec.md]

## Skjerm: Månedsplan
URL: /admin/kalender?view=maaned

### Layout
Samme tre-panel som årsplan (CoachHQSidebar + PlanSidebar + innhold).

### Hovedinnhold

#### Header
- Visningsvelger ÅR · MÅNED (aktiv) · UKE · DAG
- Måned-navigasjon: ← Mai 2026 →
- Spillervelger ("Markus R ▾") — kun én spiller om gangen i månedsvisning
- Pyramide-fordelingsbar 200px under: 5 segmenter som viser planlagt vs default for måneden. Pulser segmenter med >10% avvik

#### Kalender-grid
`grid-template-columns: repeat(7, 1fr)` — alle kolonner like brede
Ukedager øverst: Man / Tir / Ons / Tor / Fre / Lør / Søn

35 celler (5 uker), min-height 120px hver:
- Dag-nummer øverst venstre
- Today: #D1F843 sirkel rundt nummer
- Helger: lett #F1EEE5-bakgrunn
- Andre måned: #9D9C95 grå tekst

Per celle, opptil 4 økt-chips (kompakt SessionCard):
- 3px pyramide-fargestripe venstre kant
- Tittel + tid (eks: "Putting drill — 09:00")
- Maks 18 tegn med ellipsis
- Hvis flere økter: "+3 til" chip — klikk åpner popover med dagens fulle liste

#### Spesielle visningselementer
- **Baseuke:** 2px gul venstrekant på uke 19 (markerer "ukesmal Anders har lagret")
- **Turneringsuker:** bakgrunn #FFFBEB på uke 28 (Oslo Open)
- **LIVE-økt** i dag (8. mai 10:00): 2px solid #D1F843 border + pulserende prikk øverst-høyre + "NÅ"-badge

### Realistisk uke-eksempel (Markus, uke 19)
- Man 5: TEK-økt 09:00 (Putting drill) + FYS 17:00 (styrke)
- Tir 6: SLAG-økt 14:00 (Driver gate-test)
- Ons 7: WANG Toppidrett 08:00 (TEK, fast avtale ikon)
- Tor 8 (i dag): LIVE-økt 10:00 (TEK approach 150m) + Coach-session 14:00
- Fre 9: SLAG 09:00 + FYS 17:00
- Lør 10: SPILL 09:00 (18 hull Bossum)
- Søn 11: hvile

### Editorial moment
Eyebrow: `COACHHQ · KALENDER · MÅNED`
Tittel: "Mai *strammer seg.*" (italic på "strammer seg")

Lever som én HTML-fil med inline CSS.
```

---

## Prompt 1.3 — Ukeplan

```
[LIM INN 00-shared-spec.md]

## Skjerm: Ukeplan
URL: /admin/kalender?view=uke

### Hovedinnhold

#### Header
- Visningsvelger ÅR · MÅNED · UKE (aktiv) · DAG
- "Uke 19 · 5-11. mai 2026"
- Spillervelger
- KapasitetsLoad-bar (8px høyde, full bredde): grønn 78% planlagt vs TAK

#### Time-grid
`grid-template-columns: 64px repeat(7, 1fr)` — første kolonne for klokkeslett

- Tid-skala vertikal: 06:00 → 22:00, 56px per time
- 7 dag-kolonner
- Today-kolonne (Tor 8. mai): bakgrunn #005840 (mørk grønn, hvit tekst i header — IKKE lime)
- Helger: lett grå bakgrunn

#### Økt-blokker
- Plassert proporsjonalt med varighet (1 time = 56px)
- 3px pyramide-fargestripe venstre kant
- Tittel + tid + spiller-initialer
- Drag-handle ved hover
- Klikk åpner SessionEditor-modal

#### LIVE-økt (Markus, Tor 10:00-11:30 — TEK approach)
- 2px solid #D1F843 border rundt blokken
- Pulserende #D1F843 prikk øverst-høyre
- "NÅ"-badge: bg-accent, tekst "27 min igjen"
- Mini-progress: "Drill 4/8 · 81%"

#### Spesielle elementer
- **Myelin-banner** over grid: "TURN er kald — 28 dager siden sist trent" med "Legg til økt"-CTA (kun hvis 1+ rødt område)
- **Turneringslås-banner:** "Oslo Open om 7 dager. Uka er låst — endre med [Lås opp manuelt]" (hvis innenfor 7-dagerslås)
- **Regelbrudd-flagg** på enkelte økter (2px rød kant + alert-triangle): "TEK-volum overstiger period-default (38% vs 28%)"

### Realistisk dag-utfylling
**Torsdag 8. mai (today, full dag):**
- 09:00-09:30 FYS Stretching (Joachim T, lyst grønn)
- 10:00-11:30 **LIVE TEK Approach 150m** (Markus R, lime border)
- 12:00-13:00 Lunsj-blokk (grå, opaque)
- 14:00-14:45 Coach 1-1 (Emma S, SLAG mørk grønn)
- 15:30-17:00 SLAG Gruppe-økt WANG (3 spillere, mørk grønn stripe)
- 17:30-18:30 FYS Styrke (Markus R)

### Editorial moment
Eyebrow: `COACHHQ · KALENDER · UKE 19`
Tittel: "Uka *våkner.*"

Lever som én HTML-fil.
```

---

## Prompt 1.4 — Dagsplan

```
[LIM INN 00-shared-spec.md]

## Skjerm: Dagsplan
URL: /admin/kalender?view=dag

### Layout
Samme tre-panel.

### Hovedinnhold

#### Stor dato-hero (full bredde, 200px høyde)
- Dato i Inter Tight 72px: "Torsdag 8. mai 2026"
- Editorial sub i Instrument Serif italic 18px: "Andre dag siden Anders kjørte 1-1 med Markus."
- PyramideBar 240px under (planlagt fordeling i dag): 30% FYS, 45% TEK, 15% SLAG, 5% SPILL, 5% TURN

#### Action-strip
- KPI-chips: "6 økter i dag · 4t 45min planlagt · 1 LIVE nå · 0 regelbrudd"
- Knapper: + Ny økt | Eksporter | Lås dag

#### Tidsakse (én kolonne, full bredde minus 48px padding)
Vertikal liste med tids-merker venstre og økt-blokker:

```
06:00 ────────
07:00 ────────
08:00 ──┬─────  ← Tom-slot, klikk for å legge til
08:30 ──┴─ FYS Stretching · Joachim T · 30 min
09:00 ────────
10:00 ──┬─ ★ LIVE · TEK Approach 150m · Markus R · 90 min
10:30 ──┤   Drill 4/8 · 81% suksess · 27 min igjen
11:00 ──┤   [SE LIVE →]
11:30 ──┴─
12:00 ──── (lunsj-blokk grå)
13:00 ────────
14:00 ──┬─ SLAG · Coach 1-1 Emma S · 45 min
14:45 ──┴─
15:30 ──┬─ TEK · Gruppe WANG (3 spillere) · 90 min
17:00 ──┴─
17:30 ──┬─ FYS · Styrke Markus R · 60 min
18:30 ──┴─
19:00 ────────
20:00 ────────
```

**LIVE-blokk-styling:** 2px solid #D1F843 + pulserende prikk + større padding (vis full drill-progress)

#### Footer-rad
- Notater-felt for dagen (Anders' refleksjon)
- "Marker dagen som ferdig" toggle

### Editorial moment
Eyebrow: `COACHHQ · KALENDER · TORSDAG 8. MAI`
Tittel: 72px dato (uten italic her) — italic ligger i sub-linja

Lever som én HTML-fil.
```

---

## Prompt 1.5 — Periode-modal (drag-to-create)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Periode-modal
Vises som overlay på ÅRSPLAN når Anders har dragd over uke 12-22 for spilleren Markus R.

### Layout
Modal max-width 1100px, sentrert, mørk bakdrop (rgba(0,0,0,0.4)).
Radius 20px, hvit bakgrunn.

### Header
- Tittel: "Ny periode for *Markus R*" (italic på navn)
- Sub: "Uke 12-22 · 11 uker"
- Lukk-knapp (×) øverst-høyre

### To-kolonne layout (split 60/40)

#### VENSTRE — Skjema

**1. Periodetype** (5 kort, 3+2 layout):
- GRUNN (#003B2A) — stor kort 1/3 bredde
- SPESIALISERING (#005840) — stor — VALGT (lime border)
- TURNERING (#D1F843, mørk tekst) — stor
- EVALUERING (#5E5C57) — liten 1/2
- FERIE (diagonal-stripet) — liten 1/2

Hvert kort viser: ikon + navn + "Default pyramide: 40% TEK / 30% SLAG / 15% SPILL / 10% FYS / 5% TURN"

**2. Periodenavn** (input): "Spesialisering Sommer 2026"

**3. Datoer** (to SmartDateInput):
- Fra: "12. mai 2026 (uke 19)" + datepicker
- Til: "27. juli 2026 (uke 30)" + datepicker
- Auto-tekst under: "11 uker · 77 dager · slutt 2 uker før Oslo Open"

**4. Pyramide-override** (5 number-inputs i grid):
- FYS [10] %
- TEK [40] % ⚠ over default
- SLAG [30] %
- SPILL [15] %
- TURN [5] %
- Sum: 100% ✓ (grønn) — eller rød hvis ikke 100

**5. Notat** (textarea): "Markus skal fokusere på approach 100-150m og bunker-spill før Oslo Open"

#### HØYRE — Constraints-panel (leser fra getPeriodeConstraints)

**Header:** "Regler for SPESIALISERING"

**1. Volum-TAK (med bar)**
- P-fase TAK: 18 timer/uke
- Periodetype TAK: 22 t/uke
- Effektiv: 18 t (P-fase begrenser)
- Bar: 18 timer planlagt = 100%

**2. Tillatte L-faser** (chips, grønne aktive):
✓ L-KROPP · ✓ L-ARM · ✓ L-KOLLE · ✓ L-BALL · ✓ L-AUTO

**3. CS-maks gauge** (halvsirkel, 0-100%)
Verdi: 85%
"Spesialisering tillater opp til 85% CS før overbelastning"

**4. Advarsler** (accordion-rader, IKKE store mørke blokker):
▸ TEK 40% > period-default 30% (+10pp)
  → "Spesialisering forventer balansert SLAG-TEK. Skal jeg justere?"
▸ Turnering Oslo Open om 13 uker
  → "Anbefal å sette TURN-blokk uke 27-28"

### Footer
- [Avbryt] (sekundær, venstre)
- [Lagre periode] (primær, høyre, full grønn)

### Success-state (etter lagring)
Banner øverst i modalen: "✓ Periode lagret. Klar for å sette ukesvolum-resept?" + [Sett ukesvolum →]

Lever som én HTML-fil med både input-state og success-state-variant.
```

---

## Prompt 1.6 — Volum-resept-editor

```
[LIM INN 00-shared-spec.md]

## Skjerm: PeriodVolumeRecipeEditor
Modal som åpnes etter periode er opprettet.

### Layout
Modal max-width 1280px (bredere). To-kolonne 60/40.

### Header
- Tittel: "Ukesvolum for *Spesialisering Sommer 2026*"
- Sub: "Markus R · 11 uker · 18 t/uke TAK"

### VENSTRE — Resept-editor

**Hjelpetekst:** "Tegn typisk uke. Vi genererer 11 uker × 12 økter = 132 økter automatisk."

**Tabell — én rad per pyramide:**

| Pyramide | Antall/uke | Varighet (min) | FYS-type | Muskelgrupper | Preferert ukedag | Tid |
|---|---|---|---|---|---|---|
| FYS | 3 | 60 | STYRKE | UNDERKROPP/OVERKROPP rotasjon | Man/Ons/Fre | 17:00 |
| TEK | 4 | 90 | — | — | Tir/Tor | 09:00 |
| SLAG | 3 | 75 | — | — | Tir/Tor/Lør | 14:00 |
| SPILL | 1 | 240 | — | — | Lør | 09:00 |
| TURN | 1 | 60 | — | — | Søn | 10:00 |

**Total uke:** 12 økter · 16.25 t (under 18t TAK ✓)

Hver rad er redigerbar med number-input og dropdown.

**FYS-rotasjon-velger** (utvidet rad når FYS er valgt):
- Sett 3 muskelgrupper i rotasjon: [Underkropp] [Overkropp] [Core]
- "Rotasjon: Uke 1 underkropp / Uke 2 overkropp / Uke 3 core / Uke 4 underkropp..."

### HØYRE — Forhåndsvisning

**"Typisk uke (auto-generert):"**

Mini-kalender 7 dager × 16 timer (06-22), med generert økt-blokker:
- Mandag: FYS 17:00 (Styrke underkropp)
- Tirsdag: TEK 09:00 (90 min) + SLAG 14:00 (75 min)
- Onsdag: FYS 17:00 (Styrke overkropp)
- Torsdag: TEK 09:00 (90 min) + SLAG 14:00
- Fredag: FYS 17:00 (Styrke core)
- Lørdag: SLAG 09:00 + SPILL 14:00 (18 hull)
- Søndag: TURN 10:00 (1-1 coaching)

**Sammendrag-kort:**
- Total ukentlig: 16.25 t / 18 t TAK
- Pyramide-fordeling: 11% FYS / 37% TEK / 23% SLAG / 25% SPILL / 4% TURN
- Match med period-default (40/30/15/10/5): Mostly OK, TEK 3pp under

### Footer
- [Avbryt]
- [Forhåndsvis 11 uker →] (åpner ny visning som viser auto-gen)
- [Lagre og generer] (primær, lime accent)

### Etter generering-state (alternative skjerm)
Banner: "✓ 132 økter generert på 3.2 sekunder. Klikk en uke for å se."
+ Mini-årsplan som viser 11 ukers fordeling

Lever som én HTML-fil med begge stater.
```

---

## Prompt 1.7 — Faste avtaler (LockedAnchor)

```
[LIM INN 00-shared-spec.md]

## Skjerm: LockedAnchorEditor
Modal som lar coach legge inn faste avtaler som ALDRI flyttes (WANG Toppidrett, Olympiatoppen, etc.)

### Header
- Tittel: "Faste avtaler — *Markus R*"
- Sub: "Disse økt-tidene er låst. Bulk-generator unngår kollisjoner."

### To-kolonne 50/50

#### VENSTRE — Liste over eksisterende

3 kort:
1. **WANG Toppidrett · TEK**
   - Man/Ons/Fre 08:00-10:00
   - 1. august 2025 → 30. juni 2026
   - Status: Aktiv (toggle on)
   - 144 forekomster
   - [Rediger] [Slett]
2. **Olympiatoppen test · TEK**
   - Lørdag 13:00-15:00
   - 12. mai 2026 (engangs)
   - Status: Aktiv
3. **Personlig sjekk hos coach Anders · SLAG**
   - Tirsdag 14:00-14:45
   - 1. mai → 30. juni 2026 (ukentlig)
   - 9 forekomster

#### HØYRE — Ny avtale-skjema

**Felter:**
- Navn: [WANG Toppidrett]
- Pyramide: [TEK ▾] (med fargevisning)
- Ukedag: chips [Man][Tir][Ons][Tor][Fre][Lør][Søn] — multi-select
- Start-tid: [08:00] Slutt-tid: [10:00] (auto-beregner varighet 120 min)
- Fra-dato: [01.08.2025] Til-dato: [30.06.2026] (SmartDateInput)
- Beskrivelse (textarea): "TEK-fokus, treningssamling med peer-gruppe"
- FYS-detaljer (kun hvis pyramide=FYS):
  - Treningstype: [STYRKE ▾]
  - Muskelgruppe: [UNDERKROPP ▾]

**Kollisjons-varsel** (under skjemaet):
⚠ Kollisjon: Tirsdag 14:00 - Markus har "Personlig sjekk" allerede
→ "Skal jeg flytte den eksisterende?"

### Footer
- [Avbryt] [Lagre avtale]

Lever som én HTML-fil med liste + skjema, med real-feel kollisjons-varsel.
```

---

## Prompt 1.8 — Repeterende mønstre (RecurringPattern)

```
[LIM INN 00-shared-spec.md]

## Skjerm: RecurringPatternEditor
Modal for å definere rrule-baserte mønstre (mer fleksibelt enn LockedAnchor).

### Header
- Tittel: "Repeterende mønstre — *Markus R*"
- Sub: "Mer fleksible enn faste avtaler. Bulk-generator bruker disse som lag 2."

### Layout
Liste øverst + skjema nederst.

### Liste (3 mønstre)
1. **Morgenstretch · FYS**
   - Daglig 07:00-07:30 (30 min)
   - 1. mai → 31. august 2026
   - Bevegelighet-rotasjon
   - rrule: FREQ=DAILY;COUNT=123
2. **Putting på vei hjem · TEK**
   - Mandag, Onsdag 17:30-18:00 (30 min)
   - Hele sesongen
3. **Bunker-økt søndag · SLAG**
   - Hver 2. søndag 11:00-12:00
   - Sommerperiode

### Skjema
**Rrule-velger som chips:**
- Frekvens: ◉ Daglig ◯ Ukentlig ◯ Annenhver uke ◯ Månedlig ◯ Tilpasset
- Ukedager (kun hvis ukentlig+): [Man][Tir]...
- Antall: "100 ganger" eller "Til 31. august"

**Visuell rrule-forhåndsvisning:**
Mini-kalender 1 måned som viser markerte dager med fargeprikker — viser eksakt hvilke dager mønsteret treffer.

Eks: "FREQ=WEEKLY;BYDAY=MO,WE" → mandag og onsdag i mai har lime prikk.

**Detaljer:**
- Start-tid: [07:00]
- Varighet: [30 min]
- Pyramide: [FYS ▾]
- Beskrivelse: "Daglig stretching 15-30 min, fokus på hofter og rygg"

### Footer
- [Avbryt] [Lagre mønster]

Lever én HTML-fil.
```

---

## Prompt 1.9 — Betingelser (ConditionalRules)

```
[LIM INN 00-shared-spec.md]

## Skjerm: ConditionalRulesPanel
Modal for regler som modifiserer økt-generering basert på betingelser.

### Header
- Tittel: "Betingelser — *Markus R*"
- Sub: "Regler som påvirker bulk-generator. F.eks. 'TEK etter konkurranse' eller 'Deload etter 4 uker'."

### Liste av regler (kort-grid 2 kolonner)

**1. TEK etter konkurranse**
- Type: TEK_ETTER_KONKURRANSE
- Toggle: ON (lime)
- Parametere: "Auto-legg til 1× TEK-økt mandag etter hver helg-konkurranse"
- Påvirker: 3 økter siste 30d
- [Rediger] [Slett]

**2. Deload uke 4**
- Type: DELOAD
- Toggle: ON
- Parametere: "Hver 4. uke reduseres FYS-volum med 40%"
- Påvirker: 1 økt-uke i mai
- [Rediger]

**3. Skade-justering**
- Type: SKADE_ADJUST
- Toggle: OFF (grå)
- Parametere: "Hopp over SLAG hvis skade-flagg er aktivt"
- [Aktivér]

**4. Vær-respons**
- Type: VAER_RESPONS
- Toggle: OFF
- Parametere: "Hvis regn forventet > 80%, flytt SPILL til simulator"

**5. Peer-rotasjon**
- Type: PEER_GRUPPE
- Toggle: OFF
- Parametere: "Hvis ≥3 i samme gruppe er ledige, foreslå gruppe-økt"

**6. Tester forfaller**
- Type: TEST_PAAMINNE
- Toggle: ON
- Parametere: "30 dager før test forfaller, planlegg test-økt"

### Footer
- "Aktive regler påvirker 4 spillere i porteføljen din"
- [+ Ny regel] (åpner ny modal)

### Editorial moment
Tittel: "Reglene som *jobber for deg.*"

Lever som én HTML-fil.
```

---

## Prompt 1.10 — SessionEditor + GolfDrillEditor

```
[LIM INN 00-shared-spec.md]

## Skjerm: SessionEditor (full modal)
For å redigere én økt med flere drills.

### Header
- Tittel: "TEK Approach 150m" — input redigerbar
- Sub: "Markus R · Torsdag 8. mai 10:00 · 90 min"
- Pyramide-velger (5 chip-knapper): FYS · TEK ◉ · SLAG · SPILL · TURN

### Hoved-layout: tre seksjoner stablet vertikalt

#### Seksjon 1 — Økt-metadata
4 felter i én rad:
- Varighet: [90 min ▾]
- Miljø: [M2 - simulator ▾]
- Praksistype: [BLOKK ▾] (chips B/R/K/S)
- Drill-logg-intervall: [Hver 5. drill ▾]

Notat-textarea: "Fokus på distansekontroll, prøv ny set-up med kort ball"

#### Seksjon 2 — Drill-liste (drag-sortable)

3 drills:
**Drill 1: Set-up sjekk** (10 min, 0 reps)
- Pyramide: TEK
- L-fase: L-KROPP
- CS: CS50 (50% av maks)
- Miljø: M0 (statisk)
- PR-press: PR1 (lav)
- P-posisjoner: [P1, P2] (chips)
- Komponentfokus: "Brystrotasjon i takeaway"
- Slow-motion: ON ◉

**Drill 2: Gate-test 150m** (50 min, 8 reps)
- Pyramide: TEK
- L-fase: L-BALL
- CS: CS80
- Miljø: M2 (simulator)
- PR-press: PR3
- P-posisjoner: [P5, P6, P7]
- Komponentfokus: "Strike-konsistens"
- Slow-motion: OFF

**Drill 3: Variant-runde** (30 min, 12 reps)
- Pyramide: SLAG
- L-fase: L-AUTO
- CS: CS90
- Miljø: M3 (bane-simulering)
- PR-press: PR4
- LIFE-kode: "LIFE-N12"

[+ Legg til drill]

#### Seksjon 3 — Bunn-rad
- [Avbryt]
- [Lagre som mal]
- [Lagre]

### Sidebar høyre (240px)
Panel med:
- "Periode-constraints"
- "TEK-tillatt: 0-50% TEK-vol"
- "Denne økten: 60 min TEK"
- "Volum-status: 4 t / 8 t plan denne uka"
- "Match med periode: ✓"

Lever én HTML-fil.
```

---

## Prompt 1.11 — FysDrillEditor

```
[LIM INN 00-shared-spec.md]

## Skjerm: FysDrillEditor
Variant av SessionEditor når pyramide = FYS. Feltene endrer seg helt.

### Header
- Tittel: "FYS Styrke underkropp"
- Sub: "Markus R · Mandag 12. mai 17:00 · 60 min"
- Pyramide-velger: FYS ◉ (lime accent)

### Drill-felter (helt annerledes fra Golf-modus)

**Drill 1: Knebøy 4×8 @ 80%**
- Treningstype: [STYRKE ▾] (chips: STYRKE/KONDISJON/BEVEGELIGHET/POWER/STABILITET)
- Muskelgruppe: [UNDERKROPP ▾]
- Øvelse: "Knebøy" (autocomplete)
- Sett × Reps: [4] × [8]
- Vekt: [80] kg ELLER [80] % av 1RM (toggle)
- Tempo: [3-1-2-0] (eksentrisk-pause-konsentrisk-pause)
- Pause: [180] sek

**Drill 2: Markløft 5×3 @ 85%**
- Treningstype: STYRKE
- Muskelgruppe: UNDERKROPP + RYGG
- Øvelse: "Markløft"
- Sett × Reps: [5] × [3]
- Vekt: [120] kg
- Tempo: [2-0-1-1]
- Pause: [240] sek

**Drill 3: Sled-push 6×20m**
- Treningstype: POWER
- Muskelgruppe: UNDERKROPP
- Øvelse: "Sled push"
- Sett: [6]
- Distanse: [20] m
- Pause: [60] sek

**Drill 4: Foam roller 10 min**
- Treningstype: BEVEGELIGHET
- Type: DYNAMISK
- Varighet: [10] min
- Hold-tid: [—] (kun for STATISK)

### Kondisjon-variant
For KONDISJON-drills:
- Aktivitet: [Sykling ▾] (dropdown: løp/sykling/svømming/ro)
- Varighet: [45 min]
- Intensitets-sone: [3 ▾] (1-5 chips med fargefilter)
- Distanse: [30] km (valgfri)

### Periode-constraints sidebar
- "FYS-tillatt: 10-15% FYS-vol"
- "Periode-anbefaling: Spesialisering → STYRKE 3×/uke, BEVEGELIGHET 2×/uke"

Lever én HTML-fil med 4 drill-varianter (styrke + power + bevegelighet + kondisjon).
```

---

## Prompt 1.12 — Mal-bibliotek (DrillMal + OktMal)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Mal-bibliotek
URL: /admin/mal-bibliotek
Brukes som popup når Anders trykker "Bruk mal" i SessionEditor.

### Layout
- Full-skjerm dialog (95% bredde)
- Topptab: [Drill-maler] [Økt-maler]

### Filter-rad
- Søk: "Søk i 247 maler..."
- Pyramide-filter: chips FYS/TEK/SLAG/SPILL/TURN
- Kategori-filter: "Alle / Putting / Approach / Drive / Wedge / FYS-styrke ..."
- Favoritter: ★ Vis kun favoritter
- Sortering: "Mest brukt / Sist brukt / Nyest / Navn A-Z"

### Drill-mal-grid (3 kolonner)

Hver mal-kort:
```
┌─────────────────────────────────┐
│ ★ Favoritt              [Bruk →]│
│                                 │
│ Approach gate-test 150m         │
│ TEK · L-BALL · CS80             │
│                                 │
│ "Standard gate-drill for 150m   │
│  approach. Strike + retning."   │
│                                 │
│ ✦ Brukt 47x · sist 3. mai      │
└─────────────────────────────────┘
```

**12 eksempel-maler (varierte pyramider):**
1. ★ Approach gate-test 150m (TEK)
2. ★ Putt 3m konsistens (TEK)
3. Driver gate-test (SLAG)
4. ★ Bunker basis (SLAG)
5. Chip 15m landingspunkt (SLAG)
6. Wedge variant 50-100m (SLAG)
7. ★ Knebøy 4×8 (FYS)
8. Markløft 5×3 (FYS)
9. Bevegelighets-flow 15min (FYS)
10. 9-hull bane-test (SPILL)
11. ★ Putting-game "21" (SPILL)
12. Turnering-prep mental (TURN)

### Coach-egne maler-fane
Toggle øverst: "Alle maler (247) / Mine maler (32) / Globale maler (215)"

### Footer
- "[Lim inn] importerer mal → SessionEditor"

Lever én HTML-fil.
```
