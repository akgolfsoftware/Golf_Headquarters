# Design-prompt 05 — `/stats/spillere` norsk spillerbase, søk

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/spillere` — søkbar database over 1 500+ norske golfspillere
**Bruker:**
1. Foreldre (søker barnet sitt)
2. Talentscouts / forbund (filtrerer alder + klubb + ranking)
3. Spillere selv (sammenligner med jevnaldrende)
4. SEO-trafikk (Google → "Viktor Hovland golf-resultater")
**Hovedoppdrag:** Føles som en seriøs talent-database (FotMob for golf), ikke en Excel-tabell.

---

## Datakilder

```typescript
const SPILLERE: Array<{
  slug: string;                // "viktor-hovland-1997"
  navn: string;
  fodselsAr: number | null;
  klubb: string | null;        // parses fra bio "Klubb: X"
  tier: string;                // "amateur" | "junior" | "college" | "pro-pga"
  antallTurneringer: number;
  besteSnittScore: number | null;  // beste år
  wagrRank: number | null;
  countryFlag: "NO";
  // Computed
  ar: number;                  // computed from fodselsAr
}> = [ ... ];

// Globale tall:
totalSpillere: 1500+
totalTurneringer: 1173
totalDeltakerRader: 14296
```

Search params:
- `?q=` — fritekst-søk
- `?aar=2005` — filtrer fødselsår
- `?kjonn=M|F`
- `?klubb=oslo`
- `?tier=college`

---

## Designoppdrag

### 1. Hero — sentre for søk, ikke marketing

Liten hero. Søket er hovedperson.

- Eyebrow: "AK GOLF STATS · NORSK GOLFDATABASE"
- Headline (kortere enn på de andre sidene): "Alle norske *golfspillere*. Ett sted."
- Sub: "1 500+ spillere · 14 000+ turneringsresultater siden 2016 · oppdateres månedlig"

### 2. SEARCH BAR — full bredde, sentral

Den viktigste interaksjonen. Designe stort, oppmuntre til klikk.

- Stor input (h-14, font-display ~20px)
- Søkeikon venstre, lite "⌘K"-hint høyre
- Placeholder: "Søk etter navn — for eksempel 'Viktor Hovland' eller 'Bærum GK'..."
- Border får lime-glow når focus
- Autocomplete-dropdown med top 5 matches: navn + alder + klubb
- Søk kjøres med GET (server-rendered) — ikke client-state

### 3. Filter-strip — sub-søk

Direkte under search bar. Pill-baserte filters:

```
ÅRGANG:   [Alle] [2005] [2006] [2007] [2008] [2009] [Mer ▾]
KJØNN:    [Alle] [Gutt] [Jente]
TIER:     [Alle] [Junior] [Amatør] [College] [Pro]
KLUBB:    [Alle norske] [Bærum GK] [Oslo GK] [GFGK] ... [Søk klubb ▾]
```

- Aktiv chip: `bg-foreground text-background`
- Inaktiv: `bg-secondary text-muted-foreground`
- "Mer ▾" åpner en compact-meny med alle muligheter (Combobox-style)

### 4. Statistikk-strøk

Etter filter-strip. Subtil, mono-baserte tall:

```
1 547 spillere     |    14 296 resultater     |    Siden 2016
Total i databasen        Brutto rundeskårer        Tidligste data
```

Vis hvor mange treff filtrene gir: "Viser 47 av 1 547 spillere".

### 5. RESULTAT-VISNING — to modi: kort-grid OG tabell

Tab-toggle eller view-switcher i toppen av results:

**Modi 1: KORT-GRID (default på mobile, valgbar på desktop)**

3 kolonner desktop, 1 mobile. Hvert spillerkort:

```
┌────────────────────────────┐
│  ◇                         │
│  Viktor Hovland            │
│  29 år · Oslo Golfklubb    │
│                            │
│  PRO PGA · WAGR # —        │
│                            │
│  Beste år: 67.2 (2024)     │
│  142 turneringer            │
│                            │
│  Se profil →               │
└────────────────────────────┘
```

- Initial-glyph eller flagg-glyph øverst venstre
- Navn (font-display, 18px)
- Alder + klubb (muted)
- Tier som chip i lime-pille
- 2 KPI-statistikker (beste år + antall turneringer)
- Hover: border-glow + scale 1.01

**Modi 2: TABELL (default på desktop hvis filtrert til mange)**

DataGolf-stil dense tabell:

```
#    Navn                Klubb              Tier      Beste år    Turneringer
1    Viktor Hovland      Oslo GK            PRO       67.2 (2024)  142
2    Kristoffer Reitan   Oslo GK            PRO       69.8 (2023)  98
...
```

- Sticky header
- Klikk navn → /stats/spillere/[slug]
- Sortable kolonner (clickbare headers)
- Pagination: 50 per side
- Mobile: 4 kolonner (drop "Klubb" og "Tier")

### 6. "Norske topp 20"-modul — pre-curated leaderboard

Hvis brukeren IKKE søker, vis en redaksjonell topp-20:

- Eyebrow: "AKKURAT NÅ"
- Headline: "Topp 20 norske spillere"
- Subtittel: "Sortert etter WAGR-rank — pro-spillere først, deretter amatører"
- Compact tabell med 20 rader
- Klikkbart per navn

Denne skjules hvis bruker har søkt (q !== "").

### 7. "Talent på vei opp" — discovery-seksjon

Ny seksjon for discovery — viktig for SEO og engasjement.

- Headline: "Talent vi *følger med på*" (italic på "følger")
- 3-4 spillerkort med "trending"-badge (lime, øverst venstre)
- Hver kort har:
  - Navn (font-display)
  - 1 KPI: "Forbedring 2023→2024: −3.2 strokes"
  - 1-linje editorial-tekst: "Forbedret seg mer enn 92% av jevnaldrende"
  - "Se profil →"

Manuelt kuratert liste i Code (kan starte med 4 spillere, oppdateres månedlig).

### 8. Mersalg-bånd — bruker-tilpasset

Forest-bakgrunn. Tema: bli en del av databasen.

- Headline: "Vil *du* være i databasen?"
- Tekst: "Spiller du Srixon Tour, OLYO eller Norges Cup? Du er sannsynligvis allerede her. Spillere som vil logge egne runder og se sin egen SG-profil over tid, gjør det i PlayerHQ."
- 2 CTA-knapper:
  - "Sjekk om jeg er her" (åpner search bar)
  - "Prøv PlayerHQ gratis" (link til /playerhq)

### 9. Personvern-strøk

Liten, nede på siden. Diskret men tydelig:

- "Alle resultater her er hentet fra offentlige turneringer publisert av forbundene."
- "Er du, eller har du foreldreansvar for, en spiller som ikke ønsker å være i databasen? Klikk her for å be om sletting →" (mailto)

---

## Mobile-tilpasning

- Søk-input: full bredde, mindre høyde (h-12)
- Filter-strip: horizontal scroll
- Tabell forsvinner, bare kort-grid (1-kolonne)
- "Talent på vei opp": 1 kort per "skjerm", horizontal scroll med snap

## Mikrointeraksjoner

- Søke-input: lime-glow på focus, autocomplete-dropdown med smooth slide-down
- Filter-chip: instant tilbakemelding ved klikk (URL-endring + server-fetch)
- Spillerkort: liten "→"-indikator fader inn på hover
- "Trending"-badge: subtil puls-animasjon (2s loop)

---

## Inspirasjon

1. **fotmob.com** — fotball-spillerdatabase, kort-grid + tabell, profilvisning
2. **datagolf.com/player-search** — autocomplete, tier-chips
3. **espn.com/college-football/recruiting** — talent-database med rangeringer

## Output

- Komplett sketch (alt-i-én)
- Søke-bar i isolasjon (focused state)
- 1 spillerkort i 3 tier-varianter (Pro/Amatør/Junior/College)
- "Talent på vei opp"-kort i isolasjon
- Mobile-flow
