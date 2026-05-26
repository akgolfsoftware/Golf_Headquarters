# Design-prompt 28 — `/stats/turneringer/[slug]` — Turneringsdetalj (forbedring)

> Les `00-master-brief.md`.

**Side:** Detaljside per turnering (eksisterer på `/turneringer/[slug]`, kan flyttes/forbedres)
**Datakilde:** Tournament + alle PublicPlayerEntry knyttet til den
**Hovedoppdrag:** Bygg den ut til "turneringsprofil" — datatungt og emotionelt.

URL: `/stats/turneringer/[slug]` eller behold på `/turneringer/[slug]`

---

## Data tilgjengelig

```typescript
const TURNERING = {
  slug, navn, shortName, startDate, endDate, status,
  tour, location, country, courseId, course: { name, slope, cr },
  sourceOrigin, purseUsd, tier,
  winnerName, officialUrl,
  norskeAntall,

  // Deltakere (PublicPlayerEntry)
  alleDeltakere: Array<{
    slug, navn, country, position, totalScore, rounds (JSON), status
  }>,

  // Computed
  norskeDeltakere: number,
  topp3: Array<{ navn, score, posisjon }>,
  rekord_score: number | null,

  // Hvis flerårig turnering (NGC #1, OLYO Øst 1...): historiske vinnere
  historiskeVinnere: Array<{ aar, vinner, score }>,
};
```

---

## Designoppdrag

### 1. Hero — turneringens identitet

```
PGA TOUR · KONKURRANSE · 14-16 JUNI 2026

The Memorial Tournament
                                                  Muirfield Village GC
                                                  Dublin, Ohio · USA
                                                  $20M purse

STATUS: IN PROGRESS                              [ Live leaderboard ↗ ]
```

- Eyebrow med tour + datoer
- Stor turneringsnavn (font-display 56px)
- Sub: location + purse
- Status-pille (lime hvis aktiv, varm sand hvis kommende, default hvis ferdig)
- "Live leaderboard"-knapp til DataGolf/PGA Tour

### 2. KPI-strip

```
DELTAKERE       NORSKE             KORTESTE RUNDE     KOMMET LANGT
142             2                  -7 (R1)            John Smith T-1
```

Live-data hvis turneringen pågår.

### 3. NORSKE I AKSJON — fremtredende seksjon

Hvis turneringen har norske deltakere, en stor highlight:

```
NORSKE DELTAKERE

  Viktor Hovland     R1 69 (-3)    T-5
  Kristoffer Reitan  R1 73 (+1)    T-34

         [ Følg live på DataGolf ↗ ]
```

### 4. LEADERBOARD — full tabular

DataGolf-stil dense:

```
POS    SPILLER              RUNDER          TOTALT    TO PAR    LAND
1      Scottie Scheffler   68-67-66-69    270       -18       USA
T-2    Rory McIlroy        69-66-68-69    272       -16       NIR
T-5    Viktor Hovland      69-72-70-67    278       -10       NOR ★
...
```

- Norske spillere får 🇳🇴-glyph + lime row-bakgrunn
- Klikkbart per spiller (intern hvis norsk, ellers ekstern)
- Sortable kolonner
- Sticky header

### 5. EDITORIAL "OM TURNERINGEN"

2-3 paragraphs:
- Historikk (når startet, hvem som dominerte historisk)
- Banen (om Muirfield, dens karakteristikker)
- Pakt med stas (slope, par, lengde)

For norske amatør-turneringer: tilsvarende editorial om turneringens betydning.

### 6. HISTORISKE VINNERE (hvis flerårig)

```
TIDLIGERE VINNERE

2025  Scottie Scheffler   -17
2024  Patrick Cantlay     -18
2023  Jon Rahm            -16
...
```

### 7. BANE-info

Hvis vi har bane-data:
- Slope / CR / Par-detaljer
- Mini-kart eller statisk bilde
- Lenke til `/stats/baner/[slug]`

### 8. ROUNDS-detalj (per spiller-klikk)

Inline expand når bruker klikker på en rad:

```
  Viktor Hovland (R1-R4)
  Hull 1: par 4, score 4 (par)
  Hull 2: par 5, score 4 (birdie) ●
  Hull 3: par 3, score 3 (par)
  ...
```

(Hvis vi har hole-by-hole data, ellers bare runde-scorer.)

### 9. RELATERTE TURNERINGER

Footer-strip:
- "Forrige uke: Korn Ferry Tour" — link
- "Neste uke: U.S. Open"
- "Andre PGA Tour denne sesongen"

### 10. Mersalg

Kontekstuelt:

**For PGA-turneringer:**
> "Vil du sammenligne deg med spillere i feltet? Bruk SG-sammenligning →"

**For norske amatør-turneringer:**
> "Skal du spille selv i en lignende turnering? PlayerHQ logger runder + SG → bli en del av leaderboards i fremtiden."

---

## Mobile-tilpasning
- Hero kompakt
- Leaderboard: 4 kolonner (drop "Land")
- Norske i aksjon: full-bredde kort

## Mikrointeraksjoner
- Live-status-pille: subtil pulse hvis "IN PROGRESS"
- Tabell-rad: hover gir 4px lift hvis klikkbar
- Norske rad: lime border highlight på hover

## Inspirasjon
- pgatour.com/leaderboards (per turnering)
- DataGolf tournament page
- The Athletic tournament coverage

## Output
- Komplett page-sketch
- 3 status-varianter (UPCOMING / IN_PROGRESS / COMPLETED)
- Norske-deltakere-pattern
- Mobile-flow

## Implementasjon-notater
- Eksisterer som /turneringer/[slug] — kan utvides eller flyttes
- Live-data via DataGolf hver 30 min under aktive turneringer
- ISR med revalidate 1800 (30 min) for aktive, 86400 for ferdige
- OpenGraph per turnering
