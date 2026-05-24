# Prompt — Reach, Statistikk-sammenligning og Recording (3 skjermer)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf — Reach, Statistikk-sammenligning og Recording (3 skjermer i én fil)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

Tre skjermer som dekker tre svært ulike use-cases i AK Golf-plattformen — koblet av at de alle handler om innsikt og tillit:

| # | Rute | Navn | Persona |
|---|---|---|---|
| 1 | `/portal/reach` | Spiller-reach (hva coach har sett av meg) | Markus (spiller) |
| 2 | `/portal/statistikk/sammenlign` | Statistikk-sammenligning (radar + kvartiler) | Markus (spiller) |
| 3 | `/admin/recording` | Recording-hub (sesjonsopptak) | Anders (coach) |

**Personas:**
- Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK
- Anders Kristiansen — Head Coach AK Golf Academy
- Tone Berg — Markus' mor (referert)

**Hvorfor disse tre sammen:** Reach bygger tillit ("coach følger faktisk med på meg"). Statistikk-sammenligning gir spilleren objektiv evaluering. Recording er coach-verktøyet som genererer innholdet som reach og statistikk bygger på.

## Layout (felles)

Følger TPK05-mønster: Linear sidebar + topbar + hero per skjerm + innhold + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): 
  - Skjerm 1-2: "AK GOLF / PLAYERHQ · PRO" + Markus-avatar + nav-grupper (HJEM / TRENING / INNSIKT [Reach + Statistikk-sammenlign aktiv]) 
  - Skjerm 3: "AK GOLF / COACHHQ · PRO" + Anders-avatar + nav-grupper (DAGLIG / OPERASJON / VERKTØY [Recording aktiv] / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb dynamisk per skjerm + role-toggle (kun spiller-skjermer)

### Skjerm-separator (mellom hver section)
Forest-stripe 32px med mono uppercase: `SKJERM N / 3 · /rute · NAVN`

---

## SKJERM 1 — `/portal/reach` — Spiller-reach (hva har Anders sett av meg)

### Hva skjermen gjør
Read-only versjon av coach-reach-konseptet — viser Markus hvor mye Anders faktisk har engasjert seg med profilen hans de siste 30 dagene. Bygger tillit ("jeg er ikke glemt"). Subtilt nudge for Anders til å være aktiv.

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `REACH · ANDERS HAR SETT PÅ DEG · 47 GANGER · SISTE 30 DAGER`
- Title Inter Tight 32px: `Coach Anders ` + Instrument Serif italic `*følger med*` + ` på deg`
- 3 actions rounded-pill høyre:
  1. `Spør Anders om noe` (lime, primary)
  2. `Be om mer feedback` (forest)
  3. `Eksporter rapport` (outline)

### Tillits-strip (60px under hero, lime accent)
> **47 interaksjoner siste 30 dager** — Anders har åpnet profilen din, kommentert runder, foreslått drills og sett på utvikling. Reach-rapporten under viser deg nøyaktig hva.

### KPI-rad (120px, 4-col grid)
4 kort, hver med Inter Tight mono stor + mono sub:

1. **Innlogginger på din profil** (cream card med Lucide Eye)
   - Stor: `23` mono Inter Tight 40px
   - Sub: "Anders åpnet din profil siste 30 dager"
   - Mini-trend: sparkline (lime kurve) viser daglig
2. **Runder/økter sett** (cream card med Lucide PlayCircle)
   - Stor: `12`
   - Sub: "Runder og økter han har gått gjennom"
3. **Kommentarer + meldinger** (cream card med Lucide MessageCircle)
   - Stor: `8`
   - Sub: "Spesifikke tilbakemeldinger til deg"
4. **Plan-justeringer** (cream card med Lucide Edit3)
   - Stor: `4`
   - Sub: "Endringer Anders har gjort i din plan"

### Reach-timeline (700px, full bredde)
Vertikal timeline med engasjements-events, nyeste øverst. Hver event er et kort:

**Event-kort-struktur**:
- **Venstre 80px**: Dato mono "20. mai 14:23" + dag-i-uka small
- **Senter ikon**: Lucide-ikon (Eye / Edit3 / MessageCircle / PlayCircle / Sparkles) i sirkel
- **Hovedinnhold**:
  - Action-tittel Inter Tight 16px
  - Beskrivelse 2-3 linjer Inter 14px
  - Mini-action-rad nederst (om relevant)

**Eksempel-events (15 stk, nyeste øverst):**

1. **20. mai 14:23** · Anders kommenterte din runde fra Mandalkrysset
   - "Bra iron-spill på hull 11 og 17. Putting på hull 5 — vi må trene mer på 2-3m. La meg legge inn 2 økter til denne uka."
   - Action: `Se kommentaren` (outline)

2. **20. mai 09:15** · Anders justerte ukens plan
   - "La til 'Putting <2,5m' to ganger denne uka — pre-Sørlandsåpent."
   - Action: `Se ny plan` (lime)

3. **19. mai 21:04** · Anders så på din TrackMan-data
   - "Gikk gjennom 7-jern-data fra dagens økt — distance gapping ser bra ut, ball-flight konsistens har bedret seg."

4. **19. mai 18:30** · Anders foreslo en drill
   - "Iron-progresjon 5-PW — la den i din 'i morgen'-liste"
   - Action: `Se drillen` (outline)

5. **18. mai 11:22** · Anders åpnet din statistikk-sammenligning
   - "Sammenlignet din SG-data mot A1-benchmark. Brukte 6 minutter."

6. **17. mai 16:45** · Anders ringte deg
   - "12 minutter samtale om Sørlandsåpent-forberedelse"
   - Sub: Mini-notater: "Diskuterte: course management hull 4, 11, 17. Putting <3m. Mental forberedelse R1."

7. **16. mai 09:00** · Anders booket deg på Performance Studio
   - "Privat time onsdag 21. mai 09:00-10:00 — TEK iron-progresjon"
   - Action: `Se booking` (outline)

8. **15. mai 22:18** · Anders så på din årsplan
   - "Gikk gjennom konkurranseperiode-status. Brukte 4 minutter."

9. **15. mai 14:00** · Anders skrev privat-notat om deg
   - "Markus er 78% klar for Sørlandsåpent — fokus siste 3 uker: putting <2,5m, course management Mandalkrysset, mental rutine."
   - Sub: "Dette ble synlig for deg etter samtykke 14:23"

10. **14. mai 10:30** · Anders kommenterte din vekt-trening
    - "Bra konsistens — fortsett med samme volum. Føler du deg sliten? Si fra."

11. **13. mai 19:15** · Anders så på din runde fra GFGK
    - "Gikk gjennom alle 18 hull. 6 minutter."

12. **12. mai 08:45** · Anders sendte deg melding
    - "Ser du har lagt inn 5 økter forrige uke — flott jobba. Husk å logge søvn også."

13. **11. mai 13:20** · Anders så på din SG-trend
    - "Tjekket SG-Total siste 6 mnd. 3 minutter."

14. **10. mai 16:00** · Anders justerte din kategori-benchmark
    - "Flyttet deg fra A2 til A1 i benchmark-sammenligning — HCP er nå +3,5"

15. **9. mai 11:00** · Anders åpnet din turnerings-plan
    - "Gikk gjennom Sørlandsåpent + NM Slag forberedelse. 8 minutter."

**Show more** knapp nederst: "Vis 32 eldre interaksjoner" (outline)

### Sub-section: Hva Anders IKKE har sett (transparens, 120px)
Subtil cream-card med Lucide Info:
> "Disse områdene har Anders ikke åpnet siste 30 dager: dine FYS-økter, din søvn-logg, dine ernærings-notater. Det betyr ikke at de er uviktige — be ham se på dem om du ønsker fokus her."
> CTA: `Be Anders se på FYS` (outline) · `Spør om søvn-feedback` (outline)

### Coach-tilgjengelighet-strip (60px, forest accent)
> **Anders' tilgjengelighet denne uka:** Mandag-torsdag 09:00-17:00 · Fredag 09:00-14:00 · Helger: kun akutt.
> Svartid melding: typisk 4 timer (hverdager).
> CTA: `Send melding nå` (lime)

### Footer skjerm 1 (sticky)
- Venstre: `47 interaksjoner siste 30 dager · sist i dag 14:23`
- Senter: `Du er 1 av 38 spillere · gjennomsnittlig reach: 32 per spiller`
- Høyre: `Spør Anders` (lime)

---

## SKJERM 2 — `/portal/statistikk/sammenlign` — Statistikk-sammenligning

### Hva skjermen gjør
Sammenligner Markus (A1, HCP +3,5) mot kategori-benchmark og DataGolf-benchmark. Custom SVG-grafer: radar (multi-axis), kvartil-plot, percentile-rank per metric.

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `STATISTIKK-SAMMENLIGN · MARKUS R.P. · A1 · HCP +3,5 · VS KATEGORI`
- Title Inter Tight 32px: `Hvor ` + Instrument Serif italic `*står du*` + ` mot kategorien`
- 4 actions: `Bytt benchmark` (forest) · `Tidsperiode: siste 6 mnd` (outline) · `Eksporter PDF` (outline) · `Del med Anders` (lime)

### Sammenlignings-velger (60px under hero)
3 grupper:
1. **Benchmark**: A1 NGF (default) · A1 Internasjonalt · DataGolf PGA-kvartil 4 · Tilpasset (dropdown)
2. **Periode**: Siste 30 dager · Siste 90 dager · **Siste 6 mnd** (default) · Sesong · Siste 12 mnd (segmented)
3. **Visning**: Radar · Kvartiler · Percentile (segmented, default radar)

### Hovedseksjon: Multi-axis radar chart (600×600px, sentrert)
Custom SVG-radar med 5 akser (Strokes Gained-kategoriene):
- **SG-Total** (topp)
- **SG-OTT** (off-the-tee, topp-høyre)
- **SG-APP** (approach, bunn-høyre)
- **SG-ARG** (around-green, bunn-venstre)
- **SG-PUTT** (putting, topp-venstre)

**Skala**: −2,0 (sentrum) til +2,0 (ytterst), med konsentriske ringer hver 0,5

**To overlay**:
- **Markus** (lime polygon med 50% fyll, lime border 2px, lime markører)
- **A1-benchmark** (forest stiplet polygon, ingen fyll, forest markører)

**Verdier (Markus vs A1-snitt):**
| Akse | Markus | A1 snitt | Delta |
|---|---|---|---|
| SG-Total | +0,8 | E (0,0) | +0,8 |
| SG-OTT | +1,2 | +0,3 | +0,9 |
| SG-APP | +0,5 | +0,2 | +0,3 |
| SG-ARG | −0,1 | +0,1 | −0,2 |
| SG-PUTT | +0,2 | −0,4 | +0,6 |

**Aksen-labels**: Inter Tight 14px på ytterkant, mono-verdi under hver label

**Legend nedenfor radar** (40px):
- Lime sirkel + "Markus R.P. (du)"
- Forest stiplet sirkel + "A1-snitt (n=147 spillere)"
- "Større polygon = bedre"

### Innsikt-strip (lime accent, 80px under radar)
> **Anders sier:** Du er sterkest fra tee (SG-OTT +0,9 over kategori) og putting (+0,6). Around-green er svakeste område (−0,2). Anbefaling: 30% av kommende økter på chip/pitch under 30m.
> CTA: `Be om plan for ARG` (lime) · `Se ARG-drills` (outline)

### Sub-section 1: Kvartil-plot per SG-metric (full bredde, 400px)
5 horisontale kvartil-plots, én per SG-metric:

**Hvert plot**:
- Venstre kolonne 120px: Label `SG-OTT` mono uppercase + Markus' verdi `+1,2`
- Bar resten av bredden: 4 kvartiler (Q1 cream, Q2 cream-mid, Q3 forest-light, Q4 forest) med tydelige skille-streker
- Markus' posisjon: lime sirkel (16px) på bar-en med dropper-linje
- Høyre: Percentile mono uppercase `94. PERCENTIL`

**Verdier:**
| Metric | Markus | Percentile | Sub-text |
|---|---|---|---|
| SG-Total | +0,8 | 87. percentil | "Topp 13% av A1" |
| SG-OTT | +1,2 | 94. percentil | "Topp 6% av A1" |
| SG-APP | +0,5 | 76. percentil | "Topp 24% av A1" |
| SG-ARG | −0,1 | 42. percentil | "Litt under medianen" |
| SG-PUTT | +0,2 | 82. percentil | "Topp 18% av A1" |

### Sub-section 2: DataGolf PGA-sammenligning (cream card, 200px)
Tittel: "Hvor du ville stått i DataGolf PGA-kvartil-data"
- Tabell-rad: Hver SG-metric med Markus' verdi og hvilken PGA-kvartil det tilsvarer
  - SG-Total +0,8 → ville være Q3 (PGA-snitt-spiller, plassering 60-90 i FedEx)
  - SG-OTT +1,2 → Q4 (PGA topp 30 - eksepsjonelt for amatør)
  - SG-APP +0,5 → Q3 (PGA-snitt)
  - SG-ARG −0,1 → Q1 (under PGA-snitt)
  - SG-PUTT +0,2 → Q2 (litt over PGA-snitt)
- Mikrokopi: "DataGolf-data n=24 mnd, alle PGA Tour-spillere 2024-2026"

### Sub-section 3: Trend-graf (full bredde, 300px)
SG-Total over tid (siste 6 mnd, daglig):
- X-akse: dato (mono "des — mai")
- Y-akse: SG-Total (−1,0 til +2,0)
- Markus-linje (lime, 2px) med data-punkter
- A1-benchmark-linje (forest stiplet, konstant ved E)
- Highlight-områder: turnerings-uker (lime svak bakgrunn)
- Markus' trend: positiv, fra +0,2 til +0,8 over 6 mnd
- Annotering på topp: "Sørlandsåpent 16. juni" pin

### Sub-section 4: Hvor du må jobbe (forest card)
Tittel: "Anders' fokus for Markus de neste 6 ukene"
3 punkter med expandable detalj:
1. **SG-ARG** −0,1 → mål +0,3 — "Chip/pitch under 30m + bunkerflukt fra dårlig lie"
2. **SG-PUTT** +0,2 → mål +0,5 — "Putting <2,5m konsistens (Mandalkrysset-greener er små)"
3. **SG-APP konsistens** — "Reduser variabilitet på 7-PW (du har spikes)"

### Footer skjerm 2 (sticky)
- Venstre: `SG-Total +0,8 · 87. percentil av A1 (n=147)`
- Senter: `Trend siste 6 mnd: +0,6 forbedring`
- Høyre: `Del med Anders` (outline) · `Be om handlingsplan` (lime)

---

## SKJERM 3 — `/admin/recording` — Recording-hub (sesjonsopptak)

### Hva skjermen gjør
Coach-verktøy for å se og bruke alle sesjonsopptak (video + audio). Liste over opptak med filter, video-spiller med transkripsjon, AI-genererte highlights, og drill-anbefalinger basert på opptaket.

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `RECORDING · 184 OPPTAK · 23 DENNE UKA · 142 TIMER TOTALT`
- Title Inter Tight 32px: `Sesjonsopptak ` + Instrument Serif italic `*biblioteket*`
- 4 actions: `+ Nytt opptak` (lime) · `Importer fra TrackMan` (forest) · `Filtre` (outline) · `Eksporter` (outline)

### Filter-bar (60px)
5 grupper:
1. **Spiller**: Alle · Markus · Joachim · Emma · Henrik · Ida + 33 andre (avatar-pills, multiselect)
2. **Dato**: I dag · Denne uka · Siste 30 dager · Sesong · Tilpasset (segmented)
3. **Disiplin**: Alle · FYS · TEK · SLAG · SPILL · TURN (pills)
4. **Type**: Alle · Privat · Gruppe · Bane · Studio · Range (pills)
5. **AI-flagget**: Alle · Med highlights · Med drill-anbefalinger · Med konsept-tags (pills)

### Layout: 2-col split (40% liste + 60% spiller)

#### Venstre kolonne (40%): Opptaks-liste

##### Liste-header (40px)
- Søk-input "Søk i opptak..." med Lucide Search
- Sortering-dropdown: Nyeste først · Eldste · Lengste · Mest sett

##### Opptaks-cards (én per rad, ~120px hver)
Hvert kort (12px radius, hvit bg, border):

**Topp-rad** (32px):
- Venstre: Spiller-avatar + navn "Markus R.P."
- Senter: Disciplin-pill (TEK / SLAG)
- Høyre: Dato + varighet mono "20. mai · 47 min"

**Hovedrad** (60px):
- Venstre 80×60px: Video-thumbnail (forest gradient + Lucide Play sentralt + duration-overlay nederst høyre)
- Senter: 
  - Tittel Inter Tight 14px: "Iron-progresjon 5-PW + putting"
  - Sub mono 11px: "Performance Studio · Anders + Markus"
  - Tags-rad mono: "#iron #putting #mandalkrysset"
- Høyre 40px: AI-flagger-ikoner stacked (Sparkles for highlights, Target for drills, Tag for konsepter)

**Status-rad** (16px, mini-strip):
- "AI-highlights: 8 funnet · 3 drill-anbefalinger · 12 konsept-tags" mono 10px

**Hover**: lime venstre-border (4px) + skygge
**Selected**: lime venstre-border (4px solid) + lime svak bg-tint

**Eksempel-data (12 opptak synlig, nyeste øverst):**

1. **20. mai · 47 min** · Markus R.P. · TEK · "Iron-progresjon 5-PW + putting" — AI: 8 highlights, 3 drills (VALGT)
2. **20. mai · 22 min** · Joachim T. · SLAG · "Putting <3m drilling"
3. **19. mai · 90 min** · Markus R.P. · SPILL · "Course management hull 4-11-17 Mandalkrysset"
4. **19. mai · 30 min** · Emma S. · TEK · "Driver tempo og lower body"
5. **18. mai · 60 min** · Gruppe A1 · TEK · "Iron-presisjon 4 spillere"
6. **17. mai · 45 min** · Henrik V. · SLAG · "Bunker fra dårlig lie"
7. **17. mai · 12 min** · Markus R.P. · TURN · "Pre-shot rutine vs press"
8. **16. mai · 60 min** · Markus R.P. · SPILL · "9-hullsbanen scenario-trening"
9. **15. mai · 38 min** · Ida M. · TEK · "Tempo med metronom"
10. **15. mai · 25 min** · Sigrid B. · SLAG · "Chip-stige"
11. **14. mai · 75 min** · Junior-gruppe · TEK · "Putting-klinikk"
12. **13. mai · 90 min** · Markus R.P. · TEK · "Iron-progresjon 7-PW (forrige uke)"

**Show more**: "Vis 23 eldre opptak" (outline)

#### Høyre kolonne (60%): Video-spiller + transkripsjon

##### Video-spiller (16:9, 540×304px placeholder)
- Forest bakgrunn med stilisert "Markus i swing" SVG-figur
- Center play-knapp (Lucide PlayCircle 80px, lime fyll)
- Bunn-kontroller (40px):
  - Play/Pause · Hopp ±10s · Progress-bar (lime fyllt 23%) · Time mono "10:54 / 47:23"
  - Hastighet (1x) · Volum · Fullscreen
- Top-overlay (24px): Mono uppercase "Markus R.P. · 20. mai 14:00 · Performance Studio"

##### Tabs under spiller (40px)
3 tabs (segmented): **TRANSKRIPSJON** (default) · **HIGHLIGHTS** · **DRILL-ANBEFALINGER**

##### TAB: Transkripsjon (default, scrollable)
Vertikal liste med tidsstempler + tekst:

```
10:23  ANDERS — La oss starte med 7-jernet. Tre svinger først bare for å lese tempo.
10:31  MARKUS — Greit.
11:04  ANDERS — Ok, det første var litt fort. Hør på TrackMan-tempoet — 0.82, vi vil ned mot 0.75.
11:18  MARKUS — Jeg kjente det. Den ble litt tynn.
11:24  ANDERS — Ikke tynn — bare litt over. La oss prøve igjen, men denne gangen tenker du gjennom hele baksvingen.
12:05  ANDERS — Der! Mye bedre. Tempo 0.76, ball-flight høyre-til-venstre 3 yards.
12:18  ANDERS — La oss gjenta 5 ganger til.
[...]
17:42  MARKUS — Føler det er noe med backswingen, jeg får ikke til å holde høyrearmen.
17:55  ANDERS — Ja, jeg ser det. Vi går til hjelpemiddel-stangen. Hold den her, og kjenn motstanden.
```

Sticky-søk øverst i transkripsjons-tabben: "Søk i transkripsjon..." (mono input)

**Annoteringer**: Klikk på tidsstempel hopper i video til det punktet.

##### TAB: Highlights (AI-generert)
Kort-grid med 8 highlights, hver et minutt-langt klipp:

1. **11:04 — 11:50** · "Tempo-justering 7-jern" · AI-confidence 92% — "Tydelig forklaring + utførelse + bekreftelse"
2. **12:05 — 12:20** · "Første gode swing — tempo 0.76" · 88%
3. **17:42 — 18:30** · "Backswing-problem identifisert" · 95%
4. **22:15 — 23:00** · "Mental rutine-snakk" · 78%
5. **28:40 — 29:25** · "PW distance-test" · 91%
6. **35:10 — 36:00** · "Putting-overgang" · 85%
7. **40:22 — 41:10** · "Coach-feedback siste swing" · 87%
8. **45:30 — 46:15** · "Markus' egen refleksjon" · 82%

Hvert kort: tidsstempel-range mono, tittel Inter Tight 14px, AI-confidence-prosent, "Spill av" knapp + "Klipp ut" knapp + "Send til Markus" knapp.

##### TAB: Drill-anbefalinger (AI)
3 anbefalte drills basert på opptaket:

1. **Iron-progresjon 5-PW** (TEK · 8 min · Middels)
   - "Basert på 7-jern-tempo-problem 11:04 — drillen bygger tempo-konsistens"
   - CTA: "Legg til i Markus' plan" (lime) · "Se drillen" (outline)
2. **Backswing-hjelpemiddel-stang** (TEK · 12 min · Lett)
   - "Basert på backswing-problem 17:42 — gjentakelse av Anders' hjelpemiddel"
   - CTA: "Legg til i plan" (lime) · "Se drillen" (outline)
3. **Tempo-metronom-trening** (TEK · 5 min · Lett)
   - "Bygger på samme tema: tempo 0.75 konsistens"
   - CTA: "Legg til i plan" (lime) · "Se drillen" (outline)

### Konsept-tags-strip (bunn av høyre kolonne, 60px)
AI-genererte tags fra opptaket:
- `#tempo` · `#iron-progresjon` · `#backswing` · `#høyrearm-hold` · `#metronom` · `#7-jern` · `#PW-distance` · `#mental-rutine`
- CTA: `Søk alle opptak med #tempo` (link) · `Legg til manuell tag` (outline)

### AI-coach-strip (60px, lime accent over hele bredden)
> **AI-analyse av opptaket:** Markus' hovedutfordring i denne sesjonen var tempo-variabilitet i iron-spill (8 av 22 swinger med tempo > 0,80). Backswing-problem identifisert 17:42 — det er samme mønster jeg så i opptak 13. mai. Anbefaling: legg inn 2 fokus-økter på tempo + backswing-stabilitet før Sørlandsåpent.
> CTA: `Generer plan-forslag` (lime) · `Lag intern-notat` (forest)

### Footer skjerm 3 (sticky)
- Venstre: `Spiller: Markus R.P. · 47 min · 8 highlights · 3 drill-anbefalinger`
- Senter: `184 opptak totalt · 142 timer · 23 denne uka`
- Høyre: `Marker som behandlet` (outline) · `Send sammendrag til Markus` (lime)

---

## Felles modaler

### Modal: + Nytt opptak (skjerm 3)
- Spiller / gruppe (søk-multiselect)
- Type (radio: Privat / Gruppe / Bane / Studio / Range)
- Lokasjon (dropdown med fasiliteter)
- Dato + tid (datovelger)
- Disciplin (multiselect pills)
- Upload-felt (drag-drop for video + audio-fil) eller "Start opptak nå" (live-modus med kamera-tilgang)
- AI-prosessering checkbox (default på): "Generer transkripsjon + highlights + drill-anbefalinger automatisk"
- CTA: `Last opp` (lime) · `Avbryt` (outline)

### Modal: Be om handlingsplan (skjerm 2)
- Pre-fylt melding: "Hei Anders, jeg ser jeg ligger lavt på SG-ARG (−0,1, 42. percentil). Kan vi lage en konkret plan for de neste 6 ukene som fokuserer her?"
- CTA: `Send` (lime) · `Avbryt` (outline)

### Modal: Spør Anders (skjerm 1)
- Tom melding-tekstfelt
- Quick-suggestion-pills: "Hvorfor har vi ikke fokusert på FYS?" · "Hva tenker du om Sørlandsåpent?" · "Trenger jeg mer søvn-fokus?"
- CTA: `Send` (lime) · `Avbryt` (outline)
- Garanti-mikrokopi: "Anders svarer typisk innen 4 timer på hverdager"

---

## Tilstander å vise

For demo-formål: alle 3 skjermer rendres med default-state og data fylt inn. Ikke vis modaler åpne. Skjerm 3 har første opptak valgt (Markus 20. mai TEK-økt) med transkripsjons-tab aktiv.

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, dato, klokkeslett, SG-data, percentiler, tidsstempler)
- Instrument Serif italic sparsomt — én italic-frase per hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## SVG-grafer (custom-tegnet)

- **Skjerm 1**: Sparkline-trends i KPI-kort (lime kurve, daglig)
- **Skjerm 2**: 
  - Multi-axis radar chart 600×600 med 5 akser, 2 overlays (Markus lime, A1-benchmark forest stiplet)
  - Kvartil-plots horisontale (5 stk, 60px hver)
  - Trend-graf SG-Total over tid (600×300)
- **Skjerm 3**: 
  - Video-spiller placeholder (forest bg, stilisert SVG-figur av golfer)
  - Audio-waveform mini under video-spilleren (lime/forest streker)

## Tekniske krav

- Single self-contained `.html` med alle 3 skjermer
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Custom SVG-grafer (radar, kvartiler, trend, sparklines)
- Sticky filter-bar i opptaks-liste
- Tabs i video-detalj
- ~2600–3200 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- SG-metrikker uppercase med bindestrek: SG-Total, SG-OTT, SG-APP, SG-ARG, SG-PUTT
- Tall norsk format: `+3,5`, `+0,8`, `−0,1` (minus-tegn ikke bindestrek)
- Percentiler: `87. percentil`, `topp 13%`
- Klokkeslett 24h: `14:23`, `09:00`
- Dato: `20. mai 2026`
- Varighet: `47 min`, `10:54 / 47:23` (video)
- Antall: `n=147 spillere`
- Tidsstempler i transkripsjon: `11:04` (uten sekunder)

Output: én komplett HTML-fil med alle 3 skjermer i samme dokument, separert med forest-stripe-separators. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
