# Claude Design-prompter — Elite Fase 2

Generert 2026-06-01. Tre verdensledende differensiatorer for tour-spillere:
**Video-analyse · Dispersjon-motor (DECADE-stil) · Mental prestasjonspsykologi.**

Hver blokk er klar til å lime inn i Claude Design. Samme disiplin: maks 3 skjermer per runde,
ÉN versjon per skjerm, lås. Lim inn fellesblokken ØVERST i økten først.

---

## Felles kontekst — lim inn ØVERST i Claude Design-økten

```
Designsystemet er LÅST. Hold deg til det:
- "DataGolf møter The Athletic, på Linear." Editorial sport-analytics.
- Farger: forest #005840 (primær), lime #D1F843 (kun signatur/aksent), cream #FAFAF7
  (sidebg, ikke hvit — hvit er kort), forest #0F2A22 (dark-mode bg). Pyramide-akser:
  pyr-fys/tek/slag/spill/turn. Ingen nye hex.
- Fonter: Inter (UI) · Inter Tight (display + editorial italic på <em>, text-primary) ·
  JetBrains Mono (alle tall, eyebrows, KPI). Ingen andre.
- 8pt-grid. Radius 8/12/16/20/24/full. Lucide-ikoner 1.5px. INGEN emoji, ingen unicode-symboler.
- Norsk bokmål (æ ø å). Engelske golfbegreper står (Strokes Gained, SG, dispersion, carry,
  expected value). Tall: komma-desimal, mellomrom tusenskille, "48 %". 24-t klokke. Meter.
- Tone: datadrevet, tall først, tørr/direkte, ingen hype-ord.
- Match tettheten og kort-stilen til eksisterende PlayerHQ + AgencyOS-previewer.
- Dette er PRO-verktøy for tour-spillere (tenk Hovland/Reitan). Tett, presist, ekspert-nivå.
  Ikke nybegynnervennlig — tetthet og presisjon foran håndholding.
- ÉN versjon per skjerm, lås. Maks 3 skjermer per runde.

Spillernavn-kanon: bruk ÉN konsekvent form gjennom alle skjermer. Lås før du tegner.
```

---

# RUNDE 50 — Video-analyse (3 skjermer)

Svingverktøyet. I dag har vi kun opplasting — dette er selve analysen.

## 50.1 — Video-analyse (én sving, frame-by-frame + annotering)

```
Tegn "Video-analyse" — dyp analyse av én svingvideo. PlayerHQ-kontekst (/portal/analysere/video).

Layout: to-kolonne. VENSTRE (flex 2): stor videospiller (16:9, mørk ramme), under den
en transport-rad: ◄ forrige frame · play/pause · ► neste frame · hastighetsvelger
(0,1× / 0,25× / 0,5× / 1×) i mono. Under transporten: en P-posisjon-tidslinje (P1–P10)
som en horisontal skala med markører — aktiv P-posisjon highlightet i lime, scrubber-hode
som JetBrains Mono frame-teller (f.eks. "frame 042 / 180").

HØYRE (flex 1, 320px): to stablede kort:
  1. VERKTØY-kort — tegne-verktøy som ikon+label-rad: Linje · Vinkel · Sirkel · Tekst
     (Lucide: minus, triangle, circle, type). Aktivt verktøy med lime venstrekant.
     Fargevelger (forest/lime/destructive) for annotering.
  2. COACH-KOMMENTAR-kort — tråd: avatar + tid + tekstboble. Editorial italic på nøkkelord.

Topp-strip: eyebrow "VIDEO-ANALYSE" (mono caps) + tittel "Driver · 28. mai · P4-topp"
(Inter Tight) + to handlingsknapper høyre: "Sammenlign med pro" (outline) + "Del med coach"
(primary forest).

Annoteringer tegnes DIREKTE på videoframen (linje/vinkel/sirkel-overlay i lime/forest).
Mobil: høyre-kolonne blir bottom-sheet, verktøy som horisontal ikon-rad over videoen.
```

## 50.2 — Video sammenligning (side-ved-side, synkronisert)

```
Tegn "Video sammenligning" — to svinger side-ved-side med synkronisert avspilling.

Layout: to like videoruter side-ved-side (hver med egen mono-label over: "Min sving · 28. mai"
og "Pro-modell · referanse"). EN delt transport-rad UNDER begge som styrer begge samtidig
(synkronisert scrubbing) — markert med en lime "SYNK"-pill. To toggles: "Synk av/på" og
"Overlay" (legg video B oppå A semi-transparent for direkte sammenligning).

Under videoene: en sammenlignings-stripe — to rader nøkkel-metrikker side-ved-side
(JetBrains Mono): Club Path, Face Angle, Attack Angle, Tempo — med diff-kolonne (lime hvis
nærmere modell, destructive hvis lenger fra). Eyebrow "DELTA MOT MODELL".

Velger øverst: dropdown for video A og video B (mine datoer eller pro-bibliotek).
Mobil: videoene stables vertikalt, delt transport under begge, overlay-modus prioritert.
```

## 50.3 — Coach video-review (coach annoterer og sender)

```
Tegn "Coach video-review" — coachens versjon (/admin/spillere/[id]/video).

Layout: samme analyse-canvas som 50.1, MEN venstre skinne (240px) er en spiller-video-liste
(thumbnails gruppert per kølle/dato, ulest coach-markør). Hoved: video + annotering.
Høyre: "Send til spiller"-kort — coach skriver kommentar, fester den til valgt frame/P-posisjon,
"Send"-knapp (primary). Sendte kommentarer vises i spillerens Workbench.

Topp: spiller-hero-strip (avatar + navn + HCP + WANG/GFGK). En "neste uleste"-snarvei.
Mobil: video-liste blir en horisontal scroll-strip øverst.
```

---

# RUNDE 51 — Dispersjon-motor (3 skjermer)

DECADE-stil strategi. Den unike konkurransefordelen — hvor sikter jeg gitt min spredning.

## 51.1 — Sikte-planlegger (kjernen — expected value)

```
Tegn "Sikte-planlegger" — DECADE-stil strategiverktøy. Tour-nivå. (/portal/mal/sg-hub/strategi)

Layout: to-kolonne. VENSTRE (flex 2): et stilisert hull/target sett ovenfra — fairway/green
i dempet forest-grønn, hazards tydelig (vann = dempet blå med skravur, bunker = sand-beige,
OB = rød stiplet). Spillerens DISPERSJONS-OVAL (68%/95% ellipse) tegnet over landingsområdet
i forest med lav opacity-fyll. Flagg-markør. Et drabart SIKTE-PUNKT (lime fokusring).
Når sikte-punktet flyttes: et EXPECTED-VALUE-VARMEKART vises over mulige aim-punkter
(grønn = lav forventet score, rød = høy). Anbefalt sikte annotert: "Sikt 4m venstre for flagg
— forventet 2,9 slag, unngår bunker" (callout-kort).

HØYRE (flex 1): tre kort:
  1. DIN SPREDNING — Lateral σ, Distanse σ, miss-tendens (JetBrains Mono, mono-eyebrow).
  2. KØLLE + KONFIDENS — kølle-dropdown, 68%/95%-toggle.
  3. RESULTAT — forventet score for valgt sikte vs naivt "sikt på flagg" (diff i lime).
"Lagre game plan"-knapp (primary) nederst.

Topp: eyebrow "SIKTE-PLANLEGGER" + tittel "Hull 7 · 165 m · 7-jern".
Mobil: hull-grafikk full bredde, kort som stablet liste under.
```

## 51.2 — Dispersjon-oversikt (per kølle)

```
Tegn "Dispersjon-oversikt" — spillerens spredningsmønster per kølle. (/portal/analysere/dispersjon)

Layout: grid av kølle-kort (Driver, 3-tre, hybrid, jern, wedger, putter). Hvert kort:
mono-eyebrow med kølle + et lite scatter-plot (slag-punkter) med dispersjons-oval over,
under: carry-snitt + lateral σ + distanse σ (JetBrains Mono). Miss-tendens som liten
retnings-indikator (pil).

Under grid-en: en full tabell — kølle · snitt-carry (m) · lateral σ · distanse σ · miss-tendens ·
antall slag (sample size). Sorterbar. Eyebrow "ALLE KØLLER".

Filter øverst: tidsperiode (siste 30/90 dager / sesong), kun TrackMan vs alle.
Klikk kølle-kort → zoom til stort spredningsmønster (drawer eller egen visning).
Mobil: kølle-kort i 2-kol grid, tabell horisontal scroll.
```

## 51.3 — Game plan / digital yardage-book (hull-for-hull)

```
Tegn "Game plan" — digital yardage-book for én bane, hull-for-hull. (/portal/booking/anlegg/[id]/strategi)

Layout: venstre skinne (180px) = hull-liste 1–18 med par + lengde, aktivt hull highlightet.
Hoved: valgt hull i detalj — samme hull-grafikk-stil som 51.1 (sett ovenfra, hazards),
men her med FERDIG anbefaling: optimal kølle fra tee + sikte + "plays-like"-distanse
(vind/høyde-justert, JetBrains Mono). Pin-posisjon-velger (front/midt/bak).
Høyre kort: hull-strategi-notat (coach kan legge inn), forventet score, største risiko.

Topp: bane-navn + dato + værforhold-strip (vind retning/styrke, temp) gjenbrukt fra
ConditionsSlider-mønsteret. "Eksporter game plan"-knapp (PDF).
Mobil: hull-liste blir horisontal stepper øverst.
```

---

# RUNDE 52 — Mental prestasjonspsykologi (3 skjermer)

Undervurdert overalt. Mest skjema-basert, men høy verdi.

## 52.1 — Mental-hub

```
Tegn "Mental-hub" — spillerens mentale dashboard. (/portal/mental)

Layout: to-kolonne topp. VENSTRE-kort "DAGENS LOGG": fire raske skalaer (Humør, Fokus,
Arousal, Selvtillit) som 5-prikks rad (utfylte prikker i forest, lime på valgt). "Logg →"-knapp.
HØYRE-kort "MENTAL-FERDIGHETER": en radar/pentagon (Fokus, Selvtillit, Resiliens, Ro,
Motivasjon) i forest-linjer med lime-fyll lav opacity, forrige periode som stiplet referanse.

Under (full bredde): en innsikt-stripe — "PRE-SHOT RUTINE: 87 % konsistens siste 5 runder"
og "PRESSURE: score 2,1 slag bedre når arousal = 3/5" (JetBrains Mono tall, editorial-italic
nøkkelord). To handlingsknapper: "Skriv dagbok" + "Ny vurdering".

Nederst: trend-linje — mental-state over tid (siste 30 dager), valgbar metrikk.
Topp: eyebrow "MENTAL" + greeting "I dag".
Mobil: kortene stables, radar full bredde.
```

## 52.2 — Konkurranse-dagbok + pre-shot rutine

```
Tegn "Konkurranse-dagbok" — pre/post-runde refleksjon + rutine-tracking. (/portal/mental/dagbok)

Layout: venstre = tidslinje av dagbok-oppføringer (dato + turnering + humør-prikk + utdrag).
Hoved: valgt oppføring i to deler:
  PRE-RUNDE: mål for runden, fokus-ord (chips), forventet arousal (skala).
  POST-RUNDE: hva gikk bra / hva gikk dårlig (to tekstfelt), følelse (skala), én læring.
Et "PRE-SHOT RUTINE"-kort: spillerens definerte rutine-steg (nummerert liste), og etter
runden: "Hvor konsistent fulgte du den?" (%-slider) + korrelasjon rutine% ↔ score (mini-graf).

Topp: eyebrow "DAGBOK" + "Sørlandsåpent · 14. juni". "Ny oppføring"-knapp.
Mobil: tidslinje blir dropdown, oppføring full bredde.
```

## 52.3 — Coach mental-innsyn

```
Tegn "Coach mental-innsyn" — coachens read-only oversikt over spillerens mentale trend.
(/admin/spillere/[id]/mental)

Layout: spiller-hero-strip øverst. Hoved: mental-ferdigheter-radar (samme som 52.1) +
trend-linjer per dimensjon. En "FLAGG"-stripe: AI/regel-baserte signaler — "Selvtillit har
falt 3 perioder på rad", "Arousal høy før siste 2 turneringer". Coach kan feste en kommentar
(går til spillerens mental-hub) men IKKE redigere spillerens logg.

Tone: respektfull, signal ikke overvåking. Mono-eyebrows, dempet. Personvern-merknad nederst.
Mobil: radar + flagg stablet.
```

---

## Etter at du har tegnet alle 9 skjermene i Claude Design

1. Eksporter hver skjerm som HTML til `public/design-handover/elite/`
   (f.eks. `video-analyse.html`, `sikte-planlegger.html`, `mental-hub.html` ...)
2. Gi meg beskjed — jeg leser dem, lager oppdatert manifest-kobling, og bygger:
   datamodell (Prisma) → komponenter → skjermer → ekte data → visuell verifikasjon.

**Rekkefølge for bygging:** Video (Runde 50) → Dispersjon (Runde 51) → Mental (Runde 52).
