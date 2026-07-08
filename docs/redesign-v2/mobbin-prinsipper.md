# Mobbin-prinsipper — v2-redesign (9. juli 2026)

Destillert fra 48 Mobbin-referanser (2 sveip) + Anders' 8 referansebilder.
Referansebiblioteket ligger i øktens scratchpad; appene er notert per prinsipp.
Mobbin brukes KUN for komposisjon/flyt — aldri kode, aldri fremmede farger.

## Felles (alle retninger, låst av Anders' bilder)

1. **Monokrom base, ÉN aksent.** Nesten alt er gråtoner; aksenten (lime på mørk /
   forest på lys) brukes kun på det viktigste datamomentet per skjerm.
2. **Store tall er heltene.** Nøkkeltall i JetBrains Mono, 32–56 px, med liten
   enhet/label i caps under eller ved. (Workouts, Sleep Score, Eight Sleep, Fey.)
3. **Prikk-/heatmap-teksturer** for frekvens/konsistens (Workouts-kalenderen,
   OKX/Kraken-heatmaps) — golf-bruk: treningsuker, økt-frekvens, stall-aktivitet.
4. **Delta som chip** (▲/▼ + tall i liten pille med svak tonet bakgrunn), aldri
   løs tekst. (Fey, Kraken, Gentler Streak.)
5. **AI-innsikt som stille recap-chip/kort** med ikon + 1–2 setninger — aldri
   ropende banner. (Eight Sleep «Autopilot recap», Fey news-hero.)
6. **Personlig hilsen** øverst på hjem-flater («God morgen, Øyvind.») — Fey, Asana,
   Mixpanel, Rooune.
7. **Dag-/periodevelger som piller** nær heroen (Focus Score, Strava, adidas).
8. **Rader > kort for lister:** kompakte rader med meta-chips og hover, ikke
   kort-i-kort. (Asana, ClickUp, Height, Linear-idiomet.)

## Retning A «Rolig» (Mixpanel · GitBook · Qatalog · Withings · Rooune)

- Sjenerøse marger (24–32 px), luftig linjehøyde, få og myke flater.
- Seksjoner uten ramme, skilt med tynne hårlinjer og caps-etiketter.
- Store rolige overskrifter; dataviz nedtonet (tynn strek, ingen fyll-støy).
- Mørk oversettelse: myk grafitt, lav kontrast på rammer, aksent kun på ett tall.

## Retning B «Terminal» (Fey · Kraken · OKX · Bloomberg-idiomet)

- Venstre-rail + tette paneler; alt kompakt (8–12 px padding, 12–13 px tekst).
- Tabeller med mono-tall, høyrestilte kolonner, delta-chips per rad.
- Heatmap-/treemap-blokker som sekundær visning; multi-serie trendgraf i heroen.
- Seksjonshoder i 9–10 px caps mono; hårlinjer overalt, ingen skygger.
- Lime = eneste signal (opp/ned bruker data-viz-grønn/-rød, aldri lime).

## Retning C «Presis premium» (Asana · ClickUp · Ultrahuman · Apple Fitness · One Day)

- App-chrome med sidebar + grupperte rad-lister m/ meta-chips (Linear-følelse).
- Hero-fliser med diger display-tall (44–56 px) og svak gradient-tint i flaten
  (Ultrahuman) — tint fra forest, aldri fremmedfarge.
- Avrundede store kort (r 18–22), tydelige CTA-piller, ring-/segmentmålere.
- Mellomting i tetthet: strammere enn A, romsligere enn B.

## Skjermtype-mønstre (til fase 5-bølgene)

- **Analysehub:** tittel + periodepiller → understrek-faner → mørkt hero-tall m/
  trend → fordeling label·bar·%·verdi m/ kolonnehoder → rolige drill-down-rader.
- **Coach-cockpit:** hilsen → KPI-rad (klikkbar) → «trenger deg nå»-kø som rader
  m/ alvorlighets-chip → dagens timer (tidslinje) → stall-aktivitet (heatmap/bars).
- **Pivot/filter (trening):** filterchips m/ aktiv-tilstand + Nullstill → hero-tall
  for utvalget m/ delta vs forrige periode → sammenlign-rader m/ dimensjonsvelger.
- **Per-enhet-analyse (TrackMan/kølle):** enhetsliste = velger (rad-klikk) → hero
  med valgbare parametere (chips styrer hvilke tall som vises).
- **Benchmark (tester):** verdi på gradient-/nivåskala m/ markør + percentil-tekst
  («bedre enn 78 %») + nivå-badge.
