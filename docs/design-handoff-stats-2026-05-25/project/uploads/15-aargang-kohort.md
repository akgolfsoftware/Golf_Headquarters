# Design-prompt 15 — `/stats/aargang/[aar]` — Kohort-explorer

> Les `00-master-brief.md`.

**Side:** Alle norske spillere fra et bestemt fødselsår
**Bruker:** Foreldre ("hvordan ligger barnet an mot jevnaldrende?") · Talentscouts · Spillere selv ("hvem er kullets beste?")
**Hovedoppdrag:** Talent-development-fokus — vise progression-kurver innenfor en årgang.

URL: `/stats/aargang/2009` (eller `/stats/kohort/2009` — bestem)

---

## Datakilder

```typescript
const KOHORT = {
  aar: 2009,
  alder: 17,                          // computed: 2026 - 2009

  totalSpillere: 87,                  // antall i denne årgangen i vår DB
  totalRunder: 2 487,
  totalTurneringer: 142,

  // Topp 10 etter snittscore 2025 (siste hele sesong)
  topp10SisteSesong: Array<{ slug, navn, klubb, snitt, antall }>,

  // Topp 5 mest aktive
  mestAktive: Array<{ slug, navn, antallTurneringer }>,

  // Snittscore-distribusjon (histogram)
  scoreDistribusjon: Array<{ bin: "70-72", antall: 5 }>,

  // Tour-fordeling
  tourFordeling: { srixon: 47, olyo: 32, ngc: 8, ostlandstour: 22 },

  // Forbedring fra forrige år
  storstForbedring: Array<{ slug, navn, diff }>,  // de som forbedret mest

  // Klubb-distribusjon
  klubber: Array<{ klubb, antall }>,

  // Til sammenligning: tidligere kohorter
  sammenlignTidligereKohort: {
    kohort2008: { snittPaaAlder17: 75.4, topp10Snitt: 71.2 },
    kohort2007: { ... },
  },

  // College / WAGR-prospect
  collegeBundne: Array<{ slug, navn, university, division }>,  // hvor mange har commitet
  wagrInne: Array<{ slug, navn, wagrRank }>,
};
```

---

## Designoppdrag

### 1. Hero — "møt 2009-årgangen"

```
ÅRGANG 2009 · 17 år gamle nå

Norges
2009-talenter.
```

- Eyebrow med årgang + alder
- Headline italic på "talenter"
- Sub: "87 norske spillere født i 2009. Vi tracker dem alle siden første Srixon-turneringen i 2018."

### 2. KPI-strip

```
SPILLERE      RUNDER       TURNERINGER     COLLEGE-COMMITS
87            2 487        142             3
```

### 3. "Toppen av kohorten" — featured leaderboard

```
TOPP 10 ETTER SNITTSCORE 2025

#  Spiller            Klubb           Snitt    Antall
1  Anders Halvorsen   Oslo GK         68.5     28
2  Maria Olsen        Bærum GK        69.2     24
3  ...
```

Klikkbart per spiller, link til `/stats/spillere/[slug]`.

### 4. Score-distribusjon — histogram

Recharts histogram visualisering:

```
Antall spillere
   ▆
  ██
 ███
████   ▆
██████ ██
70-72  72-74  74-76  76-78  78-80  80+
```

X-akse: snittscore-bøtter. Y-akse: antall spillere.

Annotering:
- "Norsk snitt 17-åringer: 76.5"
- "Tour-snitt: 70.5"

### 5. "Hvor kommer talentet fra?" — klubb-fordeling

Donut-chart eller horisontal bar-chart med klubber:

```
Bærum GK      ████████ 12
Oslo GK       ███████ 11
GFGK          ████ 6
Stavanger GK  ███ 5
...
[Resten]      ████████████ 53
```

Klikkbart per klubb (lenke til `/stats/baner/[slug]` hvis vi har).

### 6. "Tour-aktivitet" — hva spiller de?

Stacked horisontal bar:

```
SRIXON TOUR   ████████████ 53%
OLYO ØST      ███████ 32%
ØSTLANDSTOUR  █████ 22%
NGC           ██ 8%
COLLEGE       █ 3%
```

### 7. Sammenlikning med tidligere kohorter — graf

Linjegraf som viser **utvikling av snittscore** for kohorten 2009 sammenlignet med 2008 og 2007 ved samme alder:

X-akse: alder (14, 15, 16, 17, 18, 19, 20)
Y-akse: kohort-snitt
Linjer: 2009 (current), 2008 (1 år eldre), 2007 (2 år eldre)

Insight under: "2009-kohorten ligger 0.8 strokes bedre enn 2007-kohorten var ved samme alder."

### 8. "Største forbedring siste år"

Tabell:

```
#  Spiller            2024 snitt   2025 snitt   Endring
1  Sofie Lund         78.2         73.4         −4.8
2  Marius Olsen       76.5         72.8         −3.7
...
```

### 9. "College-commits" — featured

Editorial card hvis det er noen som har commitet til college:

```
COLLEGE-COMMITS FRA 2009-KOHORTEN

Anders Halvorsen → University of Denver (D1)
Maria Olsen     → Stanford University (D1)
Petter Hagen    → Texas Tech (D1)

[Se hele college-pipelinen →]
```

### 10. "Spillere å følge med på" — kuratert

Curated picks (manuelt av redaksjonen). 3-4 spillere med:
- Foto/initial
- Navn + klubb
- 1-linjes "watch list reasoning" 
- "Se profil →"

### 11. Mersalg

Tema: "Er ditt barn med?"

> "Er ditt barn i denne årgangen og ikke i listen? Det betyr at vi ikke har resultater fra dem. PlayerHQ logger runder, så ditt barn automatisk havner i statistikken."

### 12. Andre kohorter — navigasjon

Footer-strip:

```
← 2008 årgang        Du er på 2009        2010 årgang →
```

Pluss "Velg en annen årgang" dropdown.

---

## Mobile-tilpasning

- KPI-strip blir 2x2 grid
- Tabeller får 3 kolonner (drop "Antall" eller "Klubb")
- Donut-chart → horisontal bar-chart (lettere på små skjermer)
- "College commits" + "Watch list" stables vertikalt

## Mikrointeraksjoner

- Histogram: bars fader in stagger 50ms hver
- Linjegraf: linjer tegnes inn fra venstre til høyre
- Donut/bar: segmenter får hover-highlight + tooltip med eksakte tall

---

## Inspirasjon

1. **transfermarkt.com/spielereigentum** — "alle spillere født i år X"
2. **theathletic.com NFL Draft class profiles** — kohort-fokuserte editorial sider
3. **collegegolfreport.com class of 2026** — golf-spesifikk kohort-fokus

## Output

- Komplett page-sketch
- Histogram + donut-chart i isolasjon
- Linjegraf med 3 kohorter
- "Watch list"-card-pattern
- Mobile-flow

---

## Stretch — kohort-oversikt

Lag en `/stats/aargang` (uten år) som er en index-side: "Velg en årgang" med visuell tidslinje fra 2000-2012, hver med antall spillere + topp-3 talent. Det gir SEO-magnet for "[år]-årgangen golf".
