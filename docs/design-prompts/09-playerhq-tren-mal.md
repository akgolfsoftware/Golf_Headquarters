# Claude Design-prompter: PLAYERHQ TREN & MÅL (9 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.
> Disse skjermene er for **PlayerHQ** — spillerens egen flate.
> Bruker: Markus R., 16 år, A1-spiller, HCP 4.2, medlem i AK Golf Academy.

---

## PlayerHQ-shell (gjelder alle 9 skjermer)

- **Tema:** Lyst (`--background: #FAFAF7`).
- **Sidebar:** Mørk, 240px bred, `bg: #061210`, lime accent på aktiv modul.
- **Sidebar-moduler:** Hjem · Tren · Mål · Statistikk · Utfordringer · Profil · Varsler.
- **Topbar:** 64px høy, hvit, med søk + varsel-bjelle + Markus' avatar (40px, sirkulær).
- **Sub-nav (Tren):** Oversikt · Årsplan · Turneringer · Kalender · Øvelser · Tester.
- **Sub-nav (Mål):** Mål · Statistikk · Leaderboard · Milepæler · Achievements.
- **PageHeader:** eyebrow (mono 11px uppercase) → tittel (Inter Tight 36px med 1 italic Instrument Serif) → sub (16px muted).
- **Aldri "Velkommen tilbake"** — bruk observasjon: "Onsdag, Markus. To dager siden sist."

---

## Prompt 9.1 — Trening-oversikt

```
Du er senior UI/UX-designer for AK Golf HQ. Design TRENING-OVERSIKT for PlayerHQ — Markus' startpunkt for daglig trening.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Trening-oversikt
URL: /portal/tren
Bruker: Markus R., 16 år, A1, HCP 4.2

### Layout
- Venstre: PlayerHQ-sidebar (mørk, 240px). "Tren" aktiv (lime accent).
- Topbar 64px, hvit.
- Sub-nav (Tren): Oversikt (aktiv) · Årsplan · Turneringer · Kalender · Øvelser · Tester.
- Hovedinnhold flex-1, padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · TREN · ONSDAG 13. MAI"
- Tittel: "Onsdag, *Markus.*"
- Sub: "To dager siden sist. 47 økter denne måneden."

### Dagens økt-kort (full bredde, framtredende)
- Bakgrunn: var(--card), ramme 1px, radius 16px, padding 32px.
- Venstre kolonne:
  - Tidschip: "I DAG 14:30 — 15:45" (mono 11px uppercase).
  - Pyramide-pill: TEK (#005840 bg, hvit tekst).
  - Tittel: "Driver gate-test + jernkonsistens 7i" (Inter Tight 24px).
  - Sub: "75 min · M2 simulator · Random-praksis · 4 komponenter".
  - Komponent-chips: "Bunn av sving", "Tempo", "Klubbvinkel", "Treff-konsistens".
- Høyre kolonne:
  - Stor CTA: "Start nå" (primary, 48px høyde, kun synlig hvis <30 min til start).
  - Tid igjen: "Starter om 12 min" (mono, 14px, accent-farge).
  - Sekundær: "Se økt-detaljer" (ghost-knapp).

### Denne uka (full bredde)
- Eyebrow: "DENNE UKEN · UKE 19".
- 7-dagers strip, horisontalt: man 12 / tir 13 / ons 14 / tor 15 / fre 16 / lør 17 / søn 18.
- Hver dag-kolonne (120px bred):
  - Dato (mono, 14px).
  - Stablede pyramide-blokker for økter den dagen (samme farge-system).
  - Tomme dager: stiplet ramme + "Fri".
- I dag (ons 14): tykk lime ring rundt kolonnen.
- Eksempel-økter:
  - Man 12: TEK 60 min + FYS 45 min (utført, krysset av).
  - Tir 13: SPILL 90 min M3 (utført).
  - Ons 14: TEK 75 min M2 (nå).
  - Tor 15: FYS 60 min styrke + SLAG 60 min M2.
  - Fre 16: Hvile.
  - Lør 17: SPILL 4t M4 (bane Bogstad).
  - Søn 18: TEK 45 min M1 + SLAG 60 min M2.

### KPI-strip (3 kort, asymmetrisk grid 2-1-1)
1. **Streak**
   - Tall: 12 dager (mono 32px, accent-farge).
   - Sub: "Rekord 18. Slått siste tirsdag-mål.".
   - Mini-flammeikon (Lucide flame, currentColor).
2. **Denne uka**
   - Tall: 4 økter (mono 32px).
   - Sub: "3 av 7 dager. Plan: 6.".
3. **Snitt suksess 30d**
   - Tall: 78% (mono 32px).
   - Sub: "+4pp vs forrige periode. Innenfor mål.".

### Caddie-tips (lyst kort)
- Eyebrow: "CADDIE".
- Tekst: "Du har trent 38% TEK siste 30 dager. Anders har satt opp ekstra Random-praksis fredag for å feste det."

### Editorial moment
"*Markus*" italic Instrument Serif.

Lever én HTML-fil med inline CSS. Realistisk dummy-data. Ingen emoji.
```

---

## Prompt 9.2 — Årsplan (player-versjon)

```
Du er senior UI/UX-designer for AK Golf HQ. Design PLAYER-ÅRSPLAN — Markus' egen, lese-modus.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Årsplan (player-versjon)
URL: /portal/tren/aarsplan
Bruker: Markus R.

### Forskjell fra coach-versjon
- Kun Markus' rad — ikke 6 spillere.
- Ingen redigering (lese-modus). Drag og "Ny periode" finnes ikke.
- Klikk uke → ukesdetalj-modal nederst i visningen.

### Layout
- PlayerHQ-sidebar 240px. "Tren" aktiv.
- Topbar 64px.
- Sub-nav: Oversikt · Årsplan (aktiv) · Turneringer · Kalender · Øvelser · Tester.
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · TREN · ÅRSPLAN 2026".
- Tittel: "Sesongen *2026.*"
- Sub: "Anders' plan for deg. Klikk en uke for å se detaljer."

### Filter-strip (chips)
- Pyramide: alle 5 chips med fargestripe (FYS/TEK/SLAG/SPILL/TURN). Alle aktive.
- Periode: "Hele året" (default) · Q1 · Q2 · Q3 · Q4.

### Gantt-tabell
- Grid: én rad, 52 uke-kolonner.
- Måneds-headers øverst (Jan/Feb/.../Des).
- Uke-numre under (1-52).
- Rad-høyde 64px (litt høyere enn coach-versjon for fokus).

**Periodeblokker for Markus:**
- Uke 1-8: GRUNN (#003B2A, hvit tekst, label "Grunn").
- Uke 9-11: EVAL (#5E5C57, label "Eval").
- Uke 12-22: SPESIALISERING (#005840, label "Spesialisering").
- Uke 23-24: FERIE (diagonal-stripet, ingen tekst).
- Uke 25-37: TURNERING (#D1F843, **#0A1F18-tekst**, label "Turnering").
- Uke 38-44: EVAL.
- Uke 45-52: GRUNN.

**TurneringMarker (diamant #D1F843 med #0A1F18 stroke):**
- Uke 21: "Oslo Open Junior".
- Uke 27: "Srixon Tour stop 3".
- Uke 31: "WAGR Bogstad".
- Uke 34: "NM Junior".

Hover-tooltip per uke: "Uke 19 · 13.-19. mai · Spesialisering · 5 økter planlagt".

### Ukesdetalj-modal (nederst i visningen — vis som "åpen state")
Klikk uke 19 åpner et kort med:
- Tittel: "Uke 19 · Spesialisering · 5 økter".
- 5 økt-rader:
  1. Man 12. mai · TEK · Driver gate-test · 60 min.
  2. Tir 13. mai · SPILL · Bane-sim 9 hull · 90 min.
  3. Ons 14. mai · TEK · 7i konsistens · 75 min.
  4. Tor 15. mai · FYS · Styrke underkropp · 60 min.
  5. Lør 17. mai · SPILL · Bane Bogstad · 4t.
- Lenke: "Se ukesdetalj →".

### Editorial moment
"*2026*" italic Instrument Serif.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.3 — Turneringer (player-versjon)

```
Du er senior UI/UX-designer for AK Golf HQ. Design TURNERINGER for PlayerHQ — Markus' egne påmeldinger + foreslåtte.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Turneringer (player-versjon)
URL: /portal/tren/turneringer
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Tren" aktiv.
- Sub-nav: ... Turneringer (aktiv) ...
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · TURNERINGER · SESONG 2026".
- Tittel: "Sesong *2026.*"
- Sub: "4 påmeldte · 3 foreslått av Anders · 12 vurderer."

### KPI-strip (4 kort)
1. Påmeldte: 4 (mono 32px).
2. A-turneringer: 2 av 4 (mono).
3. WAGR-poeng samlet: 22 (mono).
4. Neste deadline: 12 dager — Oslo Open Junior.

### Hoved-grid (2 kolonner)

**Venstre (60%) — Mine påmeldinger**
- Eyebrow: "PÅMELDT (4)".
- 4 kort vertikalt:
  1. **Oslo Open Junior**
     - Eyebrow: "WAGR · A-PRIORITET".
     - Tittel: "Oslo Open Junior" (Inter Tight 18px).
     - Dato: "18.-20. juli · Oslo GK Bogstad".
     - Status-pill: PÅMELDT (lime).
     - Stats: "WAGR 12 poeng · 54 hull stroke play · Forrige år: T9".
     - CTA: "Se detaljer →".
  2. **Srixon Tour Stop 3** — A · 14.-16. juni · Larvik GK · PÅMELDT.
  3. **NM Junior** — A · 24.-26. august · Miklagard · PÅMELDT.
  4. **Klubbmesterskap GFGK** — B · 7.-8. juli · GFGK · PÅMELDT.

**Høyre (40%) — Foreslått av Anders**
- Eyebrow: "FORESLÅTT (3)".
- 3 kort:
  1. **Olyo Tour Stop 2** — A · 5.-7. juni · Drøbak GK · Anders: "God test før Oslo Open".
  2. **Titleist Østland #4** — B · 28. juni · Borre GK.
  3. **Garmin Norges Cup #3** — A · 19.-21. juli · Hauger GK.
  - Per kort: "Påmeld" (primary CTA) + "Drøft med Anders" (ghost).

### Tidligere turneringer (full bredde, kollapset under)
- Eyebrow: "TIDLIGERE 2026 (2)".
- Tabell:
  | Dato | Turnering | Plassering | Score | SG total | WAGR |
  |---|---|---|---|---|---|
  | 12. apr | Vinterserien Solastrand | T4 | +2 / 75-71 | +1.8 | 4 |
  | 26. mar | Mulligan Indoor Open | T2 | -3 / 67-68 | +2.1 | — |

### Editorial moment
"*2026*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.4 — Øvelser-bibliotek (player)

```
Du er senior UI/UX-designer for AK Golf HQ. Design ØVELSER-BIBLIOTEK for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Øvelser-bibliotek (player)
URL: /portal/tren/ovelser
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Tren" aktiv.
- Sub-nav: ... Øvelser (aktiv) ...
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · ØVELSER · 248 TILGJENGELIGE".
- Tittel: "Øvelses-*biblioteket.*"
- Sub: "Filtrer på pyramide, område og praksistype. 12 favoritter."

### Filter-rad (sticky øverst i innhold)
- Søkefelt (full bredde 480px): "Søk øvelse..." (Lucide search-ikon).
- Pyramide-chips (5 stk med fargestripe): FYS · TEK · SLAG · SPILL · TURN. Klikkbare, multi-select.
- Praksistype-chips (4 stk): B (blå) · R (oransje) · K (rød) · S (lilla).
- Toggle: "Kun mine favoritter" (off).
- Sortering: "Mest brukt ▾" / "Nyeste" / "A-Å".

### Liste-grid (3 kolonner, gap 24px)

12 øvelses-kort:

**Eksempler:**
1. ★ **Driver gate-test**
   - Thumbnail 16:9 (mørk bakgrunn, mono-tekst "VIDEO 2:14").
   - Pyramide-pill: TEK.
   - Tittel: "Driver gate-test".
   - Sub: "Konsistens · 15 min · M2".
   - Stats-rad: "Brukt 22 ganger · Sist 3. mai".
   - Favoritt-stjerne (fylt, accent).
2. **7-jern konsistens-pyramide**
   - Pyramide: TEK.
   - "Treff-konsistens · 20 min · M2 · Brukt 18×".
3. ★ **Chip ladder 5-15m**
   - Pyramide: SLAG.
   - "Distanse-kontroll · 15 min · M2/M3 · Brukt 14×".
4. **Putt-gate 3 ft**
   - SLAG. "Start-linje · 10 min · M2 · Brukt 28×".
5. **9-shot variabilitet**
   - TEK. "Klubbvinkel · 30 min · M2 · Brukt 8×".
6. **Tempo-trener 3:1**
   - TEK. "Tempo · 15 min · M1 · Brukt 12×".
7. **Bane-sim 9 hull random klubb**
   - SPILL. "Beslutning · 90 min · M3 · Brukt 6×".
8. **PNF stretch hamstring**
   - FYS. "Bevegelighet · 10 min · M0 · Brukt 9×".
9. ★ **Knebøy med tempo 3-0-1**
   - FYS. "Styrke · 30 min · M0 · Brukt 24×".
10. **Pre-shot rutine drill**
    - SPILL. "Mentalt · 10 min · M2/M4 · Brukt 11×".
11. **Random klubb-skifte**
    - TEK. "Tilpasning · 20 min · M2 · Brukt 7×".
12. **Lag-konkurranse putting**
    - SPILL. "Press · 30 min · M2 · Brukt 4×".

### Coach-notat-banner (over grid)
- Lyst kort, eyebrow "FRA ANDERS":
- "Driver gate-test og 7-jern pyramide er prioritet før Oslo Open. Begge ligger som favoritt for deg."

### Editorial moment
"*biblioteket*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.5 — Øvelse-detalj (player)

```
Du er senior UI/UX-designer for AK Golf HQ. Design ØVELSE-DETALJ for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Øvelse-detalj (player)
URL: /portal/tren/ovelser/driver-gate-test
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Tren" aktiv.
- Sub-nav: ... Øvelser (aktiv) ...
- Innhold padding 32px, max-width 1100px sentrert.

### Breadcrumb
"Tren / Øvelser / Driver gate-test" (mono 12px, muted).

### PageHeader
- Eyebrow: "ØVELSE · TEK · KONSISTENS".
- Tittel: "Driver *gate-test.*"
- Sub: "Konsistens · 15 min · M2 simulator · Brukt 22 ganger".
- Pyramide-pill (TEK) + favoritt-stjerne 24px (fylt accent).

### Action-rad
- "Legg til neste økt" (primary).
- "Marker som favoritt ★" (toggle).
- "Del med venn" (ghost).

### Hoved-grid (2 kolonner: 60/40)

**Venstre — Video + beskrivelse**
- Video-spiller 16:9 (mørk bakgrunn, play-ikon sentrert, varighet "2:14" mono nede til høyre).
- Eyebrow: "BESKRIVELSE".
- Brødtekst (Geist 16px, line-height 1.6):
  "Driver gate-test måler hvor presist du treffer drivern. Sett opp to alignment-pinner cirka 15 cm bredere enn klubbhodet på begge sider av ballen, parallellt med target-linjen. Slå 10 baller. Mål antall som passerer gjennom 'gaten' uten kontakt med pinnene."
- H3: "Hvordan utføre".
- Nummerert liste:
  1. Sett opp alignment-pinner i M2 simulator.
  2. Velg samme target (260m fairway, smal).
  3. Slå 10 baller med 90 sek mellom hver.
  4. Logg antall innom gaten.
  5. Mål: 7+/10 før Oslo Open Junior.
- H3: "Tips".
- Punktliste:
  - Fokus på tempo, ikke kraft.
  - Hvis du sliter: åpne gaten 5 cm og bygg konsistens først.
  - Random-variant: skift driver-shape (draw/cut/straight) hver 3. ball.

**Høyre — Stats + coach-notat**
- Kort "Dine resultater":
  - Snitt 30d: 6.4/10 (mono 24px).
  - Best: 9/10 (3. mai).
  - Trend: ↗ +1.2 vs forrige måned.
  - Mini-sparkline siste 10 forsøk.
- Kort "Personlig fra Anders" (lyst kort med accent-stripe):
  - Eyebrow: "COACH-NOTAT · 3. MAI".
  - Tekst: "Markus — fokus på bakswing-tempo. Du akselererer for tidlig når presset er på. Filmet svingen din i M2 etter siste test, se kommentar i forrige live-økt."
  - Lenke: "Se filmen →".
- Relaterte øvelser (3 kort, mini):
  - Tempo-trener 3:1.
  - 9-shot variabilitet.
  - Random klubb-skifte.

### Editorial moment
"*gate-test*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.6 — Statistikk SG

```
Du er senior UI/UX-designer for AK Golf HQ. Design STATISTIKK SG for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Statistikk SG
URL: /portal/mal/statistikk
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Mål" aktiv.
- Sub-nav (Mål): Mål · Statistikk (aktiv) · Leaderboard · Milepæler · Achievements.
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · STATISTIKK · STROKES GAINED".
- Tittel: "Hvor *slår du* tid?"
- Sub: "30 dager · 8 runder · vs peer A1-spillere 16-18 år."

### Periode-velger (chips)
30d (aktiv) · 90d · Sesong · Karriere.

### SG-kategori-kort (4 kort, full bredde, 4-kol grid)

**1. SG OTT (Off The Tee)**
- Bakgrunn: var(--card), ramme, padding 24px.
- Eyebrow: "OFF THE TEE".
- Stort tall: +0.32 (mono 36px, accent-farge).
- Sub: "per runde · 30d".
- Mini-sparkline 200×60px, lime tone, trend opp.
- Peer-sammenligning: "Peer A1: +0.18 · Du ligger #4 av 12."
- Klikk: "Drill-down →" (ghost-knapp).

**2. SG APP (Approach)**
- Tall: -0.12 (mono, destructive-farge).
- Sparkline ned.
- Peer: "Peer A1: +0.05 · #9 av 12."
- Klikk: "Drill-down →".

**3. SG ARG (Around the Green)**
- Tall: +0.18 (mono, accent).
- Sparkline flat-opp.
- Peer: "Peer A1: +0.10 · #5 av 12.".

**4. SG PUTT**
- Tall: +0.05 (mono, gul/varselfarge for flat).
- Sparkline flat.
- Peer: "Peer A1: +0.12 · #8 av 12.".

### Total SG-graf (full bredde, 400px høyde)
- Linjegraf siste 30 dager, daglig SG total.
- Y-akse: -2.0 til +3.0.
- Punkter på runde-dager (8 stk).
- Hover: "12. mai · Bogstad · SG total +1.4 · OTT +0.5 / APP -0.2 / ARG +0.6 / PUTT +0.5".
- Snitt-linje stiplet på +0.43 (accent).

### Drill-down (vis som åpen seksjon under for APP — den svake)
- Eyebrow: "SG APP · DETALJER".
- Tabell:
  | Distanse | Slag | Snitt SG | Peer A1 | Δ |
  |---|---|---|---|---|
  | 50-100m | 18 | +0.08 | +0.10 | -0.02 |
  | 100-150m | 22 | -0.18 | +0.04 | -0.22 |
  | 150-200m | 14 | -0.22 | -0.05 | -0.17 |
  | 200m+ | 6 | +0.04 | -0.12 | +0.16 |
- Caddie-banner: "Approach 100-200m drar deg ned. Anders har lagt inn 3× M3-økter i uke 20 for å feste det."

### Editorial moment
"*slår du*" italic.

Lever én HTML-fil. SVG-grafer med realistisk variasjon.
```

---

## Prompt 9.7 — Leaderboard

```
Du er senior UI/UX-designer for AK Golf HQ. Design LEADERBOARD for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Leaderboard
URL: /portal/mal/leaderboard
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Mål" aktiv.
- Sub-nav: ... Leaderboard (aktiv) ...
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · LEADERBOARD".
- Tittel: "Hvor *står du?*"
- Sub: "Sammenlign med peer-gruppen din. Anonymisert under topp 10."

### Filter-rad
- Scope-tabs: Klubb (12) · Akademi (47) · Nasjonalt (312) · Globalt (WAGR 18.4k). "Akademi" aktiv.
- Metric-velger (dropdown): "Strokes Gained total ▾" (alternativer: HCP-utvikling · SG OTT · SG APP · SG ARG · SG PUTT · Antall runder · Snittscore).
- Periode: 30d · 90d (aktiv) · Sesong · Karriere.
- Aldersfilter: "16-18 år A1" (chip, lukkbar).

### Topp 10 (hovedtabell)
- Tabell, mono-tall, hover-rad highlight.
- Markus' rad uthevet (lime venstre-border 4px, lett accent bg).
- Kolonner: # · Spiller · Klubb · HCP · SG 90d · Trend · Runder.

```
#1   Sofie K.       Borre GK       +1.2   +0.92   ▲ +0.21   14
#2   Henrik N.      GFGK           +2.4   +0.74   ▲ +0.08   11
#3   Jonas A.       Oslo GK        +3.1   +0.58   ▼ -0.04   18
#4   Markus R.      GFGK           +4.2   +0.43   ▲ +0.12   8   ← du
#5   Lina H.        GFGK           +3.1   +0.41   ▲ +0.06   9
#6   Spiller_06     (skjult)       +5.4   +0.32   ▲ +0.04   12
#7   Spiller_07     (skjult)       +4.8   +0.28   ▼ -0.02   10
#8   Spiller_08     (skjult)       +5.1   +0.21   ▲ +0.09   7
#9   Spiller_09     (skjult)       +6.2   +0.18   ▼ -0.01   13
#10  Spiller_10     (skjult)       +5.8   +0.14   ▼ -0.03   9
```

### Din rangering (kort under, framtredende)
- Bakgrunn: var(--card), accent-stripe.
- Eyebrow: "DIN POSISJON".
- Stort tall: #4 av 47 (mono 36px).
- Sub: "Topp 9% av Akademi A1-gruppen. +2 plasser siste 30 dager."
- Mini-trendgraf 200×60px (rangering over tid, mindre = bedre).

### Sammenlignings-radar (full bredde, 360px høyde)
- Radar-chart: 5 akser (SG OTT · SG APP · SG ARG · SG PUTT · HCP-trend).
- To overlapp:
  - Markus (lime, fylt 30% opacity).
  - Peer A1-snitt (grå, stiplet).
- Legend nede.

### Editorial moment
"*står du?*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.8 — Milepæler

```
Du er senior UI/UX-designer for AK Golf HQ. Design MILEPÆLER for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Milepæler
URL: /portal/mal/milepaeler
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Mål" aktiv.
- Sub-nav: ... Milepæler (aktiv) ...
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · MILEPÆLER · 17 OPPNÅDD".
- Tittel: "Reisen *så langt.*"
- Sub: "Fra HCP 28 i 2022 til HCP 4.2 i dag. 1182 dager."

### KPI-strip (4 kort)
1. Oppnådde milepæler: 17 (mono 32px).
2. Nåværende HCP: 4.2 (mono 32px, accent).
3. WAGR-poeng samlet: 22 (mono).
4. Neste milepæl: HCP 3.9 (mono, sub: "0.3 unna").

### Tidslinje (vertikal, sentrert, full bredde)
- Linje 2px lime fra topp til bunn.
- Punkter (12px diameter accent) for hver milepæl, vekslende venstre/høyre.
- Hver milepæl-blokk (240px bred):
  - Dato (mono 12px, muted).
  - Tittel (Inter Tight 18px).
  - Sub (Geist 14px, muted).
  - Badge-ikon (Lucide).

**Milepæler å vise (12 stk, nyeste øverst):**
1. **3. mai 2026** — "Første WAGR-poeng" — "T9 Oslo Open Junior · +12 poeng".
2. **12. apr 2026** — "T4 vinterserien" — "Solastrand · -1 over 36 hull".
3. **26. mar 2026** — "T2 Mulligan Indoor Open" — "Beste indoor-resultat hittil".
4. **18. feb 2026** — "HCP 4.2" — "Ned fra 4.7 på 6 uker".
5. **22. des 2025** — "Første runde under par" — "GFGK · -2 (70)".
6. **10. okt 2025** — "Vant klubbmesterskap junior" — "GFGK · 144 over 36".
7. **5. aug 2025** — "Første A-prioritet turnering" — "Srixon Tour stop 4".
8. **14. juni 2025** — "HCP 6.0" — "Sub-singel · 2 år tidligere enn plan".
9. **30. mai 2025** — "100 økter denne sesongen" — "Streak: 14 dager".
10. **12. apr 2025** — "Eagle på par 5" — "GFGK hull 7 · 3-jern fra 215m".
11. **8. sep 2024** — "HCP 9.0" — "Første gang single-digit".
12. **15. mai 2022** — "Startet hos AK Golf Academy" — "HCP 28 · 14 år gammel".

### Neste milepæl (full bredde-kort, framtredende)
- Eyebrow: "NESTE".
- Tittel: "HCP 3.9" (Inter Tight 28px).
- Progress-bar: 85% (lime).
- Sub: "Trenger 2 buffer-runder under HCP 4.0. Anders har planlagt 4 muligheter de neste 5 ukene."
- CTA: "Se planen →".

### Editorial moment
"*så langt*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 9.9 — Mål-detalj

```
Du er senior UI/UX-designer for AK Golf HQ. Design MÅL-DETALJ for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Mål-detalj
URL: /portal/mal/goal/oslo-open-topp-5
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Mål" aktiv.
- Sub-nav: Mål (aktiv) · ...
- Innhold padding 32px, max-width 1100px.

### Breadcrumb
"Mål / Topp 5 i Oslo Open Junior" (mono 12px, muted).

### PageHeader
- Eyebrow: "MÅL · A-PRIORITET · 67 DAGER IGJEN".
- Tittel: "Topp 5 i *Oslo Open Junior.*"
- Sub: "Sett 14. februar 2026 · Frist: 20. juli 2026 · Status: I rute."
- Status-pill: ◉ I RUTE (lime).
- Actions: "Rediger" (ghost) · "Avbryt mål" (destructive ghost).

### Progress-card (full bredde)
- Eyebrow: "FREMDRIFT".
- Stort tall: 64% (mono 48px, accent).
- Progress-bar 12px høyde, lime.
- Under bar: tre milepæler markert:
  - "HCP under 4.0" (✓ oppnådd 18. feb).
  - "SG APP over +0.10" (◐ 60% — er på -0.12 nå).
  - "2 topp-10 i kvalifiserings-turneringer" (◐ 1 av 2 — T9 Oslo Open).
- Caddie-tekst nede: "Du er foran skjema på HCP, men SG APP holder deg tilbake. Approach-trening uke 19-22 er kritisk."

### Hoved-grid (2 kolonner: 60/40)

**Venstre — Relaterte økter**
- Eyebrow: "RELATERTE ØKTER (12)".
- Liste, hver rad:
  - Dato (mono).
  - Pyramide-pill.
  - Tittel.
  - Varighet · CS · suksess-rate.
- Eksempler:
  1. 13. mai · TEK · Driver gate-test · 75 min · CS 76 · 80%.
  2. 10. mai · SPILL · Bane Bogstad pre-test · 4t · CS 82 · 72%.
  3. 8. mai · SLAG · Approach 100-150m · 60 min · CS 70 · 65%.
  4. 6. mai · TEK · 7i konsistens · 75 min · CS 78 · 84%.
  5. 4. mai · FYS · Styrke + bevegelighet · 45 min.
  6. ... (7 til, scrollbar).

**Høyre — Coach-kommentarer**
- Eyebrow: "KOMMENTARER FRA ANDERS".
- 4 kommentar-bobler (kronologisk, nyeste øverst):
  1. **12. mai** — "Approach holder oss tilbake. La inn 3 M3-økter i uke 20. Bli flink her, så er topp 5 realistisk."
  2. **5. mai** — "T9 i Solastrand er solid. Press-håndtering så bra ut på siste 9. Bygg videre."
  3. **22. apr** — "HCP-målet er nådd 8 uker før plan. Vi fokuserer alt på SG APP til Oslo Open."
  4. **14. feb** — "Realistisk mål gitt utviklingen din. La oss bygge planen rundt approach + putting under press."
- Input-felt nederst: "Skriv kommentar..." (read-only her, Anders sin kanal).

### Editorial moment
"*Oslo Open Junior*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```
