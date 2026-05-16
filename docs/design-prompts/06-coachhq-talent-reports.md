# Claude Design-prompter: COACHHQ TALENT + RAPPORTER (5 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.

---

## Prompt 6.1 — Talent-oversikt

```
Du er senior UI/UX-designer for AK Golf HQ. Design TALENT-oversikten — Anders' bibliotek over talent-spillere på tvers av klubber og regioner.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Talent-oversikt

URL: /admin/talent
Bruker: Coach Anders

### Layout — tre-panel
CoachHQ sidebar + TalentSidebar 280px + Innhold (kort-grid)

### TalentSidebar (280px)

#### Filter-blokk 1: Region
Chips (multi-select):
- ☑ Østfold (12)
- ☑ Akershus (8)
- ☐ Oslo (4)
- ☐ Vestfold (2)
- ☐ Telemark (1)

#### Filter-blokk 2: Aldersgruppe
Range-slider: 12 ── 18 år (15.5 valgt midt)

#### Filter-blokk 3: Status
- ◉ Alle (27)
- ◯ Aktiv coaching (9)
- ◯ Scouting (12)
- ◯ Arkiv (6)

#### Filter-blokk 4: HCP-bånd
Chips: [+5 til 0 (3)] [0 til 4 (8)] [4 til 10 (11)] [10+ (5)]

#### Filter-blokk 5: WAGR-rangering
- Topp 100 Norge: 4
- Topp 500 Norge: 12
- Ikke rangert: 11

#### Action-knapper bunn
- [+ Ny talent] (primary)
- [Importer fra WAGR →]

### Hovedinnhold

#### Header
- Eyebrow: `COACHHQ · TALENT · 27 SPILLERE`
- Tittel: "Neste *generasjon.*"
- Sub: "9 i aktiv coaching · 12 under scouting · 6 i arkiv · sist oppdatert WAGR i går"

#### KPI-strip (5 kort, mono-tall)
1. Aktive talenter: 9 / 27
2. Snitt HCP: 4.2 (-0.8 siste 90d)
3. Snitt alder: 15.5 år
4. Milepæler nådd i mai: 14
5. NGF-rangering topp-100: 4 spillere

#### Sort-rad
Sorter etter: [HCP ▾] [WAGR-rangering] [Sist evaluert] [Milepæler] [Navn A-Z]
Visnings-toggle: [Kort-grid] [Tabell]

#### Talent-kort-grid (3 kolonner × 3 rader = 9 aktive vist, rest grå nederst)

Hver kort 380×400px:

**Header-rad:**
- Profilbilde 56×56 sirkel
- Navn (Geist 16px medium) + alder mono
- Region/klubb (muted 12px)
- Status-pill mono 10px (AKTIV/SCOUT/ARKIV)

**Mini radar-chart (240×140px):**
5 dimensjoner, fargede labels:
- FYS (#003B2A)
- TEKNIKK (#005840)
- TAKTIKK (#2A7D5A)
- MENTAL (#B7C97D)
- MOTIVASJON (#D1F843)
Verdier 0-10 plottet som polygon.

**KPI-rad (3 mono-tall):**
- HCP: 4.2
- WAGR: #142 NOR
- SG: +1.2

**Milepæl-snippet (1 linje):**
"✓ Sub-par 9 hull · siste 14. april"

**Action-rad:**
[Åpne profil →] [Endre status]

**9 talent-kort, varierte data:**

1. **Markus Roinås-Pedersen** · 16 år · GFGK · AKTIV
   - HCP 4.2 · WAGR #142 · SG +1.2
   - Radar: FYS 7 / TEK 8 / TAK 7 / MEN 6 / MOT 9
   - Milepæl: "✓ Sub-par 9 hull · 14. april"

2. **Emma Sørli** · 15 år · GFGK · AKTIV
   - HCP 8.1 · WAGR #284 · SG +0.4
   - Radar: 6/7/6/8/8
   - Milepæl: "✓ Første turneringsseier U16 · 28. april"

3. **Joachim Toresen** · 14 år · Borre GK · AKTIV
   - HCP 12.4 · WAGR ikke rangert · SG -0.6
   - Radar: 5/6/5/4/7 (skade-flagg rød prikk)
   - Milepæl: "Mål: Sub-80 hele runden"

4. **Lina Hansen** · 17 år · GFGK · AKTIV
   - HCP 3.1 · WAGR #98 · SG +1.8
   - Radar: 8/9/8/7/9
   - Milepæl: "✓ NGF U18 finalist · 12. april"

5. **Mads Risberg** · 13 år · Onsøy GK · SCOUT
   - HCP 15.2 · WAGR ikke rangert · SG -1.4
   - Radar: 4/5/4/5/8
   - Milepæl: "Mål: HCP under 10 i 2026"

6. **Henrik Nilsen** · 16 år · GFGK · AKTIV
   - HCP 2.4 · WAGR #74 · SG +2.1
   - Radar: 8/9/9/8/8
   - Milepæl: "✓ Topp-3 NM U16 · 5. mai"

7. **Sara Lundgren** · 14 år · Larvik GK · SCOUT
   - HCP 6.8 · WAGR #312 · SG +0.2
   - Radar: 6/7/6/6/7
   - Milepæl: "Under vurdering siden 1. mars"

8. **Oliver Holm** · 17 år · Asker GK · SCOUT
   - HCP 1.8 · WAGR #58 · SG +2.4
   - Radar: 9/8/8/7/6 (motivasjon-bekymring dempet rød)
   - Milepæl: "✓ NGF U18 vinner 2025"

9. **Mia Bø** · 15 år · Bærum GK · AKTIV
   - HCP 5.4 · WAGR #198 · SG +0.9
   - Radar: 7/7/7/7/9
   - Milepæl: "✓ Junior Solheim Cup-camp · 22. april"

#### Arkiv-rad (6 kort, mindre, dempet 60% opacity, grid 6 kolonner)
Hvert kort 180×120 — kun navn, HCP, "Arkivert dato".

### Editorial moment
Eyebrow: `COACHHQ · TALENT`
Tittel: "Neste *generasjon.*"

Lever som én HTML-fil med all inline CSS. Komplette dummy-data.
```

---

## Prompt 6.2 — Talent-spillerprofil

```
[LIM INN 00-shared-spec.md]

## Skjerm: Talent-spillerprofil

URL: /admin/talent/markus-roinas-pedersen

### Layout — tre-panel
CoachHQ sidebar + ProfilSidebar 280px + Hovedinnhold

### ProfilSidebar (280px)

#### Identitets-blokk
- Profilbilde 120×120 sirkel sentrert
- Navn: "Markus Roinås-Pedersen" (Geist 16px medium, sentrert)
- Sub: "16 år · GFGK · AKTIV siden mars 2024"
- Status-pill: AKTIV COACHING (lime)

#### Kontakt-blokk
- E-post: markus@gmail.com (kopier-ikon)
- Telefon: +47 412 34 567
- Forelder: Anne Roinås (lenke)

#### Quick-stats mono
- HCP: 4.2 (-0.8 90d)
- WAGR: #142 NOR / #4 218 verden
- NGF U18: #18
- SG (siste 30d): +1.2
- Runder spilt 2026: 18

#### Snarveier
- [Åpne i PlayerHQ →]
- [Send melding]
- [Booke økt]
- [Eksporter rapport (PDF)]

### Hovedinnhold

#### Header
- Eyebrow: `COACHHQ · TALENT · MARKUS R`
- Tittel: "Når talentet *trenger en plan.*"
- Sub: "Helhetlig vurdering oppdatert 5. mai 2026 av Anders K"

#### Tab-strip
[Oversikt] [Radar] [Milepæler] [Ressurser] [Notater]
"Oversikt" aktiv (2px underline).

#### Stor radar-chart-kort (full bredde, 600×500px)

**Header:** "Helhetsvurdering · 5 dimensjoner" + "Sist evaluert 5. mai 2026"

**Radar-chart (480×440px sentrert):**
5 dimensjoner med store farge-labels:
- FYSISK (top, #003B2A) — verdi 7
- TEKNIKK (top-høyre, #005840) — verdi 8
- TAKTIKK (bunn-høyre, #2A7D5A) — verdi 7
- MENTAL (bunn-venstre, #B7C97D) — verdi 6
- MOTIVASJON (top-venstre, #D1F843) — verdi 9

Polygon med 0.2 opacity fyll, 2px lime stroke, prikker på hjørner.
Skalaer 0-10 som konsentriske polygoner, dempet linjer.

**Sub-detalj per dimensjon (5 mini-kort under, kolonne-grid):**

1. **Fysisk** · 7/10
   - Styrke 8 · Kondisjon 6 · Bevegelighet 7 · Power 7
   - Forrige eval: 6.5 (+0.5)
   - "Underkropps-styrke har økt etter STYRKE-fokus i mars."

2. **Teknikk** · 8/10
   - Set-up 8 · Sving 8 · Strike 9 · Konsistens 7
   - Forrige eval: 7.5 (+0.5)
   - "Approach 100-150m suksess 81% (mål: 75%)."

3. **Taktikk** · 7/10
   - Banestrategi 7 · Risk-management 6 · Klubbvalg 8 · Vær-respons 7
   - Forrige eval: 6 (+1)
   - "Stor forbedring etter SLAG-fokus uke 12-18."

4. **Mental** · 6/10 ⚠
   - Press-håndtering 5 · Konsentrasjon 7 · Recovery 6 · Selvtillit 7
   - Forrige eval: 6 (0)
   - "Press-håndtering henger igjen. Foreslår mental coach 1× / mnd."

5. **Motivasjon** · 9/10
   - Drift 10 · Engasjement 9 · Mål-klarhet 9 · Familiestøtte 8
   - Forrige eval: 9 (0)
   - "Stabil høy. Driver hele utviklingen."

#### Milepæl-tidslinje (full bredde-kort)

**Header:** "Milepæler · siste 12 måneder" + [+ Legg til milepæl]

Horizontal tidslinje med markører:

```
Mai 24 ─── Aug 24 ─── Nov 24 ─── Feb 25 ─── Mai 25 ─── Aug 25 ─── Nov 25 ─── Feb 26 ─── Mai 26
   ●          ●          ●          ●          ●          ●          ●          ●          ●
```

Hver markør har popup-kort (vis 4 åpne nedenfor):

1. **14. april 2026** · ✓ Sub-par 9 hull
   - "Første gang -2 på Bossum back 9. Med driver, ikke 3-trek."
2. **28. mars 2026** · ✓ Topp-10 NGF Tour leg 1
   - "Plassering 8 av 64 spillere. SG +1.4."
3. **15. feb 2026** · ✓ HCP under 5
   - "Fra 5.4 til 4.8 etter SPESIALISERING-perioden."
4. **12. nov 2025** · ✓ Junior Solheim Cup-camp invitert
   - "1 av 12 norske 16-årige jenter (gutter inkludert)."

**Kommende milepæler (forecast, lyst grå):**
5. **18-20. juli 2026** · Oslo Open U18 (mål: topp 5)
6. **August 2026** · NM U18 (mål: finale)
7. **Sept 2026** · HCP under 3 (forecast: 60% sannsynlig)

#### Ressurs-bibliotek (kort-grid 3 kolonner)

**Header:** "Ressurser · 12 dokumenter og lenker"

6 kort vist:

1. **PDF · Treningsplan SPESIALISERING uke 19-30**
   - Lagt til 5. mai · Anders K
   - [Last ned] [Åpne]
2. **Video · Putting-drill 3m konsistens**
   - YouTube · 8:42 · Anders' kanal
   - [Spill av]
3. **Notion · Sesongmål 2026**
   - Sist endret 3. mai · Markus + Anders
   - [Åpne i Notion]
4. **PDF · TPI Movement Assessment**
   - Lagt til 15. mars · Henrik S
   - [Last ned]
5. **Link · WAGR-profil**
   - wagr.com/markus-r-p
   - [Åpne ekstern]
6. **PDF · Mental coaching · sesjon 1**
   - Lagt til 12. mars · Maria K (ekstern)
   - [Last ned]

[+ Last opp ressurs] [+ Legg til lenke]

### Editorial moment
Eyebrow: `COACHHQ · TALENT · MARKUS R`
Tittel: "Når talentet *trenger en plan.*"

Lever som én HTML-fil.
```

---

## Prompt 6.3 — WAGR-import

```
[LIM INN 00-shared-spec.md]

## Skjerm: WAGR-import

URL: /admin/talent/wagr-import

### Layout
CoachHQ sidebar + innhold (ingen midt-panel)

### Innhold

#### Header
- Eyebrow: `COACHHQ · TALENT · WAGR-IMPORT`
- Tittel: "Rangeringen *fra verden.*"
- Sub: "World Amateur Golf Ranking · CSV-import · siste import 12. april 2026"

#### Steg-indikator (4 steg, horizontal)
```
●━━━━━━●━━━━━━○━━━━━━○
Last opp · Forhåndsvis · Bekreft · Ferdig
```
Steg 2 aktiv (mørk grønn fyll). Steg 1 ✓ (lime). Steg 3-4 dempet.

#### Steg 1-blokk (ferdig, kollapset)
Tittel + ✓-ikon: "✓ CSV lastet opp · wagr-export-2026-05-08.csv · 247 rader · 4.2 MB"
[Endre fil] (link)

#### Steg 2-blokk (aktiv, åpen)

**Header:** "Forhåndsvis import"

**Sammenligning-kort (full bredde):**

Statistikk-rad mono:
- Rader i CSV: 247
- Nye spillere: 8
- Oppdateringer: 19
- Uendret: 220
- Konflikter: 3 ⚠
- Ignorert (utenfor norske spillere-filter): 24

**Filter-rad:**
- ☑ Kun norske spillere (NOR)
- Alders-filter: 12-18 år (range)
- Min. rangering: [verden #5000 ▾]

**Mapping-tabell (kollapsbar):**
```
CSV-felt           →  Database-felt
─────────────────────────────────────────
Player Name        →  fulltNavn (split etter mellomrom)
Country            →  land (filter NOR)
Birth Date         →  fodselsdato
World Rank         →  wagrVerden
Country Rank       →  wagrLand
Events Counted     →  wagrEventTeller
Points             →  wagrPoeng
```

**Diff-tabell (sticky header, 8 rader vist):**

| Spiller | Type | WAGR før → etter | Endring |
|---|---|---|---|
| Markus Roinås-Pedersen | OPPDATERING | #168 → #142 | +26 ↑ |
| Lina Hansen | OPPDATERING | #112 → #98 | +14 ↑ |
| Henrik Nilsen | OPPDATERING | #82 → #74 | +8 ↑ |
| Oliver Holm | OPPDATERING | #62 → #58 | +4 ↑ |
| Sara Lundgren | OPPDATERING | #298 → #312 | -14 ↓ |
| Aksel Bergstrøm | NY SPILLER | — → #421 | nybegynner |
| Vilde Knutsen | NY SPILLER | — → #389 | nybegynner |
| Sofie Lund | NY SPILLER | — → #467 | nybegynner |
| Jonas Berg | ⚠ KONFLIKT | duplikat-navn | krever beslutning |
| Mia Bø | OPPDATERING | #201 → #198 | +3 ↑ |
| Emma Sørli | OPPDATERING | #298 → #284 | +14 ↑ |
| ... | | | |

Endring-pills: +X ↑ lime, -X ↓ rød/oransje.

**Konflikt-håndtering-blokk (gul varselsbg):**

"⚠ 3 konflikter krever beslutning:"

1. **Jonas Berg** — to spillere matcher navn + alder
   - Database: Jonas Berg (Asker GK · f. 12.03.2010)
   - CSV: Jonas Berg (Oslo GK · f. 12.03.2010)
   - Velg: [Slå sammen] [Behold begge] [Ignorer CSV]

2. **Lars Hansen** — eksisterer i database men fjernet fra WAGR
   - Velg: [Marker som inaktiv WAGR] [Slett WAGR-felt] [Ignorer]

3. **Maria Aas** — alder mismatch (CSV sier 17, database 18)
   - Velg: [Bruk CSV] [Behold database] [Manuelt]

**Sammenligning-graf (kort, full bredde):**
Bar-chart: Top-20 norske 16-17-åringer rangert, hver med to barer (før import / etter import). Lett shift opp eller ned for hver spiller — visualiserer bevegelse.

#### Action-rad bunn (sticky)
- [← Tilbake] (sekundær)
- "Importerer 27 endringer + 8 nye spillere"
- [Bekreft import] (primary, lime accent på hover) — disabled hvis konflikter ikke løst

#### Steg 3-4 (dempet, ikke aktiv ennå)
- Bekreft: "Sammendrag før commit"
- Ferdig: "Suksess + lenke til oppdatert talent-oversikt"

### Editorial moment
Eyebrow: `COACHHQ · TALENT · WAGR-IMPORT`
Tittel: "Rangeringen *fra verden.*"

Lever som én HTML-fil.
```

---

## Prompt 6.4 — Lag-snitt

```
[LIM INN 00-shared-spec.md]

## Skjerm: Lag-snitt

URL: /admin/lag-snitt

### Layout — tre-panel
CoachHQ sidebar + LagSidebar 280px + Innhold

### LagSidebar (280px)

#### Gruppe-velger
Chips (multi-select, alle valgt by default):
- ☑ A1 (3 spillere)
- ☑ A2 (3 spillere)
- ☑ A3 (3 spillere)

#### Periode-velger
Chips: [Siste 7d] [30d] [90d] [Sesong] [Egendefinert] — "30d" aktiv

#### Metrikk-velger (radio-style)
- ◉ HCP-utvikling
- ◯ SG totalt
- ◯ SG: Putt
- ◯ SG: Approach
- ◯ SG: Off-tee
- ◯ SG: Around-green
- ◯ Runder per uke
- ◯ Treningstid per uke

#### Sammenlignings-modus
- ☑ Vis benchmark (norsk junior-snitt)
- ☑ Vis trendlinjer
- ☐ Vis enkeltspillere

### Hovedinnhold

#### Header
- Eyebrow: `COACHHQ · LAG-SNITT · SISTE 30 DAGER`
- Tittel: "Hvor *gruppen står.*"
- Sub: "9 spillere fordelt på 3 grupper · sammenlignet med norsk U18-snitt"

#### KPI-strip (5 kort, gruppe-fordelt)

Hver kort har 3 mono-tall (A1 / A2 / A3) i kolonne:

1. **Snitt HCP**
   - A1: 3.2
   - A2: 6.5
   - A3: 12.1
2. **Δ siste 30d**
   - A1: -0.3
   - A2: -0.5
   - A3: -0.8
3. **SG totalt**
   - A1: +1.6
   - A2: +0.4
   - A3: -0.8
4. **Runder/uke**
   - A1: 3.2
   - A2: 2.8
   - A3: 2.1
5. **Treningstid/uke**
   - A1: 18.4 t
   - A2: 14.2 t
   - A3: 9.8 t

#### Hovedgraf (full bredde-kort, 720×400px)

**Header:** "HCP-utvikling · siste 30 dager"

Linje-graf med:
- X-akse: datoer (8. apr → 8. mai), 30 dagspunkter
- Y-akse: HCP-skala (0 til 16, lavere er bedre)
- 3 linjer (gruppe-snitt):
  - A1: mørk grønn (#005840), 2.5px solid
  - A2: medium grønn (#2A7D5A), 2.5px solid
  - A3: lyst grønn (#B7C97D), 2.5px solid
- Benchmark-linje: stiplet grå "Norsk U18-snitt HCP 8.4"
- Datapunkter på linjene (sirkler) — tooltip på hover

Y-akse mono-labels, X-akse mono datoer.

**Annotasjoner på grafen:**
- Pil ved 12. april: "A2 snittet steg etter TURN-blokk"
- Pil ved 28. april: "Lina (A1) NGF U18-finale → -0.4 HCP"

#### Sammenlignings-tabell (full bredde, sticky header)

| Metrikk | A1-snitt | A2-snitt | A3-snitt | Norsk U18 | Beste i gruppe |
|---|---|---|---|---|---|
| HCP | 3.2 | 6.5 | 12.1 | 8.4 | Henrik N (A1) · 2.4 |
| SG totalt | +1.6 | +0.4 | -0.8 | 0.0 | Henrik N · +2.1 |
| SG Putt | +0.4 | +0.1 | -0.2 | 0.0 | Lina H · +0.8 |
| SG App | +0.6 | +0.2 | -0.3 | 0.0 | Markus R · +0.9 |
| SG Tee | +0.3 | +0.0 | -0.2 | 0.0 | Henrik N · +0.7 |
| SG ArG | +0.3 | +0.1 | -0.1 | 0.0 | Lina H · +0.5 |
| Runder/uke | 3.2 | 2.8 | 2.1 | 2.4 | Henrik N · 3.8 |
| Trening/uke | 18.4t | 14.2t | 9.8t | 11.2t | Lina H · 22.4t |

Alle tall mono. Bedre-enn-benchmark markert med lyst grønn cell-bg. Dårligere med lyst rød.

#### Per-gruppe-trender (3 kort i rad)

**A1 (Henrik N, Lina H, Markus R):**
- Pyramide-fordeling pie-chart (mini)
- "Sterkt sammensveiset gruppe. Felles fokus: approach 100-150m."
- Trend: -0.3 HCP/30d (forventer -1.0 i sesong)

**A2 (Emma S, Mia B, Sara L):**
- Mini pie-chart
- "Større variasjon. Mia trekker snittet ned, Sara opp."
- Trend: -0.5 HCP/30d

**A3 (Joachim T, Mads R, Aksel B):**
- Mini pie-chart
- "Volum lavere. Joachims skade preger gjennomsnittet."
- Trend: -0.8 HCP/30d (raskere %, men fra høyere start)

#### Forecast-kort (full bredde)

**Header:** "Forecast · sluttsesongen 2026"

Tre prognose-bånd (60% CI):
- A1: HCP 1.8 - 2.6 (snitt 2.2)
- A2: HCP 4.5 - 5.8 (snitt 5.1)
- A3: HCP 9.2 - 11.0 (snitt 10.1)

Mini-tekst: "Basert på siste 90d trend, sesongmål nås for A1 og A2. A3 trenger justert volum."

### Editorial moment
Eyebrow: `COACHHQ · LAG-SNITT`
Tittel: "Hvor *gruppen står.*"

Lever som én HTML-fil.
```

---

## Prompt 6.5 — Rapporter

```
[LIM INN 00-shared-spec.md]

## Skjerm: Rapporter

URL: /admin/reports

### Layout — tre-panel
CoachHQ sidebar + RapportSidebar 280px + Innhold

### RapportSidebar (280px)

#### Filter-blokk 1: Type
Chips: [Alle 42] [Ukentlig 18] [Månedlig 12] [Sponsor 6] [Sesong 4] [Ad-hoc 2]

#### Filter-blokk 2: Mottaker
- ☑ Egne rapporter (Anders)
- ☑ Spillere
- ☑ Foreldre
- ☐ Sponsorer
- ☐ Eksterne (NGF, WANG)

#### Filter-blokk 3: Periode
[Siste 7d] [30d] [90d] [Egendefinert]

#### Filter-blokk 4: Status
- ☑ Generert 38
- ☑ Sendt 32
- ☑ Lest 28
- ☐ Feilet 1
- ☐ Utkast 3

#### Action-knapper
- [+ Generer ny rapport] (primary)
- [Planlegg automatisk →]

### Hovedinnhold

#### Header
- Eyebrow: `COACHHQ · RAPPORTER · SISTE 90 DAGER`
- Tittel: "Tallene som *forteller historien.*"
- Sub: "42 rapporter generert · 32 sendt · 4 sponsor-rapporter pendende"

#### KPI-strip (4 kort)
1. Generert siste 30d: 14
2. Total sendt: 32 (76%)
3. Snitt åpningsrate: 87%
4. Estimert tidsbesparelse: 28 t/mnd

#### Kommende automatiske rapporter (kort, full bredde)

**Header:** "Planlagte rapporter · neste 7 dager"

Liste-rader:
1. **Søndag 11. mai 18:00** — Ukentlig coaching-rapport (6 spillere + foreldre) · 12 mottakere
2. **Mandag 12. mai 09:00** — Sponsor-rapport Q1 Skarpnord (utkast klar) · 3 mottakere
3. **Onsdag 14. mai 07:00** — Månedlig WANG-rapport (alle 3 toppidrett-spillere) · 1 mottaker
4. **Søndag 18. mai 18:00** — Ukentlig (neste uke) · 12 mottakere

[Endre planlagt →]

#### Rapport-tabell (full bredde, sticky header)

| Tittel | Type | Periode | Mottaker | Generert | Status | Handlinger |
|---|---|---|---|---|---|---|
| Ukentlig coaching · uke 18 · Markus R | UKENTLIG | 28. apr - 4. mai | Markus + mor | 5. mai 18:02 | ✓ Lest 11:32 i går | [Åpne] [Send på nytt] |
| Ukentlig coaching · uke 18 · Emma S | UKENTLIG | 28. apr - 4. mai | Emma + mor | 5. mai 18:02 | ✓ Lest | [Åpne] |
| Ukentlig coaching · uke 18 · Joachim T | UKENTLIG | 28. apr - 4. mai | Joachim + mor | 5. mai 18:02 | ✓ Sendt | [Åpne] |
| Månedlig coaching · april · 6 spillere | MÅNEDLIG | 1.-30. april | Anders' eget arkiv | 1. mai 06:00 | ✓ Generert | [Åpne] [Eksporter PDF] |
| Sponsor-rapport Q1 · Skarpnord | SPONSOR | Jan-mar 2026 | Skarpnord Invest | 12. april 14:20 | ✓ Lest 18. apr | [Åpne PDF] |
| Sponsor-rapport Q1 · TrackMan | SPONSOR | Jan-mar 2026 | TrackMan Norge | 12. april 14:20 | ✓ Sendt | [Åpne PDF] |
| Sesongstart-rapport · A1-gruppen | SESONG | 1. jan - 31. mar | Coach-arkiv | 5. april | ✓ Generert | [Åpne] |
| Ukentlig coaching · uke 17 · Markus R | UKENTLIG | 21.-27. april | Markus + mor | 28. april | ✓ Lest | [Åpne] |
| Ad-hoc · WAGR-bevegelse Henrik N | AD-HOC | 30 dager | Anders | 8. mai 09:15 | ✓ Generert | [Åpne] |
| Månedlig WANG · april | MÅNEDLIG | 1.-30. april | Bjørn Lund (WANG) | 1. mai 07:00 | ✓ Lest | [Åpne PDF] |
| Sponsor-rapport Q1 · NGF region Øst | SPONSOR | Jan-mar 2026 | NGF | 12. april | ✗ E-post bouncet | [Send på nytt] |

(Vis ~12 rader synlig, "Last flere"-link nederst.)

Status-pills:
- ✓ Lest: lime bg
- ✓ Sendt: lyst grønn
- ✓ Generert: grå
- ✗ Feilet: rød

#### Forhåndsvisning-panel (vises som inline ekspandert kort under tabellen — rapport-rad valgt)

**Header (mono eyebrow):** `FORHÅNDSVISNING · UKENTLIG COACHING · UKE 18 · MARKUS R`

**Tittel:** "Ukas trening, *kort fortalt.*" (Inter Tight 28px + italic)

**Sub:** "28. april - 4. mai 2026 · 6 økter · 14t 12min trent"

**Innhold (mock PDF-render, hvit kort 720×900px):**

```
─────────────────────────────────────
AK GOLF ACADEMY · UKENTLIG RAPPORT
Markus R · Uke 18 · 2026
─────────────────────────────────────

UKAS HØYDEPUNKT
Tirsdag 30. april: Gate-test 150m
Strike-rate 87% · launch-vinkel 16°
"Stabilt nivå, klart bedre enn forrige uke."

NØKKELTALL
Treningstid:    14t 12min  (+2t vs uke 17)
Antall økter:   6           (mål: 5-7)
Snitt CS:       73          (innenfor sone)
SG (siste 30d): +1.2        (+0.4 vs forrige)

PYRAMIDE-FORDELING
FYS  12%  ████░░░░░░
TEK  38%  ████████░░
SLAG 27%  ███████░░░
SPILL 18% █████░░░░░
TURN  5%  █░░░░░░░░░

NESTE UKE (uke 19)
- TEK-fokus fortsetter (approach 100-150m)
- SLAG-økt bunker tirsdag
- SPILL 18-hull Bossum lørdag
- Mål: SG-test fredag

COACH-NOTAT (Anders)
"Markus er der han skal være på vei mot Oslo
Open. Strikkene er rene, fokus framover er
mental press-håndtering."
─────────────────────────────────────
Generert 5. mai 2026 · ak@akgolfgroup.com
```

**Action-rad under preview:**
- [Last ned PDF] [Send på nytt] [Rediger og send] [Slett]

### Editorial moment
Eyebrow: `COACHHQ · RAPPORTER`
Tittel: "Tallene som *forteller historien.*"

Lever som én HTML-fil med tabell + preview-panel sammen.
```
