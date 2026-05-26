# Design-prompt 27 — `/stats/sok` — Global søk

> Les `00-master-brief.md`.

**Side:** Universalt søk på tvers av hele Stats-produktet
**Datakilde:** Aggregert søk mot PublicPlayer + Tournament + Klubb + PgaPlayerSeason
**Hovedoppdrag:** "Cmd+K"-følelse — én input som finner alt. Hovedinngangsdør for power-users.

---

## Data tilgjengelig

```typescript
const SOK = (query: string) => {
  return {
    norskeSpillere: Array<PublicPlayer>,    // matcher PublicPlayer.name
    pgaSpillere: Array<PgaPlayerSeason>,    // matcher playerName
    klubber: Array<Klubb>,                  // matcher klubb-navn
    turneringer: Array<Tournament>,         // matcher Tournament.name
    artikler: Array<BlogPost>,              // matcher blogg-tittel/innhold
  };
};
```

URL: `/stats/sok?q=hovland` (delbart)

Også: Cmd+K modal som kan åpnes fra alle Stats-sider.

---

## Designoppdrag

### Modus 1 — Dedikert side `/stats/sok`

### 1. Hero
- Eyebrow: "AK GOLF STATS · SØK"
- Headline: "Søk *alt*."
- Sub: "Spillere, turneringer, klubber, artikler — alt i én søkeboks."

### 2. STOR søke-input

Sentral, BIG:

```
┌──────────────────────────────────────────────┐
│ 🔍  Søk navn, klubb, turnering...            │
└──────────────────────────────────────────────┘
                                            ⌘K
```

- Auto-focus ved page-load
- Live-resultater under (debounced 200ms)

### 3. RESULTATER — gruppert per type

```
SØKERESULTATER FOR "hovland"

NORSKE SPILLERE (3)
   • Viktor Hovland · Pro PGA · Oslo GK
   • Petter Hovland · 17 år · Stavanger GK
   • Fredrik Hovland · 22 år · Bærum GK

PGA TOUR-SPILLERE (1)
   • Viktor Hovland · #15 i SG Total

KLUBBER (0)

TURNERINGER (0)

ARTIKLER (2)
   • "Viktor Hovland 2024 sesongoversikt" · 4. jan 2026
   • "Norges pro-spillere på PGA Tour" · 12. feb 2026
```

Hver gruppe:
- Mono caps header med antall treff
- Maks 5 vises, "Se alle (12) →"
- Hver rad: ikon + navn (font-display) + sub-info (muted)
- Klikk → relevant detalj-side

### 4. INGEN treff — tom-state

```
INGEN TREFF FOR "abc"

Sjekk for skrivefeil, eller prøv:
• Mindre spesifikt søk
• Søk bare etter etternavn
• Søk på klubb

POPULÆRE SØK:
• Hovland · Norske college · Bærum GK · Srixon Tour
```

### 5. EMPTY-state — ingen søk ennå

```
Begynn å skrive for å søke.

POPULÆRE SØK NÅ:
• Anders Halvorsen
• Bærum Golfklubb
• Srixon Tour 5
• PGA Tour 2026
```

### 6. Filter (avansert)

Til høyre, mindre sidebar:
```
TYPE:           [Alle] Spillere · Klubber · Turneringer · Artikler
TIER:           [Alle] Pro · College · Junior · Amatør
ÅR:             [Alle] 2026 · 2025 · 2024
```

URL-syntese: `?q=hovland&type=norske&year=2026`

---

### Modus 2 — Cmd+K modal (overlay)

Tilgjengelig fra alle Stats-sider:

```
┌──────────────────────────────────────────────┐
│                                              │
│  🔍 [   hovland                        ⌘K ]  │
│                                              │
│  ▸ Viktor Hovland  · Pro PGA                 │
│  ▸ Petter Hovland  · 17 år · Stavanger GK   │
│  ▸ Fredrik Hovland · 22 år · Bærum GK       │
│                                              │
│  Linear-style kommando-palett:               │
│  ▸ Gå til /stats/spillere                    │
│  ▸ Gå til /stats/pga                         │
│  ▸ Start ny SG-sammenligning                 │
│                                              │
│  ESC for å lukke                             │
└──────────────────────────────────────────────┘
```

- Triggered av Cmd+K (Mac) eller Ctrl+K (Win)
- Lyseforest bakgrunn med blur backdrop
- Tastatur-navigasjon (↑↓ Enter)
- Live-resultater debounced

### Mobile-tilpasning
- Cmd+K modal: blir fullscreen
- Filter-sidebar: blir collapsed bottom-sheet
- Tabell-resultater: forenklet, ett trefftype om gangen

### Mikrointeraksjoner
- Tastatur: ↑↓ Enter for å navigere
- Hover-rad: lime row-highlight
- Søke-input: lime border-glow på focus
- "Loading"-spinner: subtil 4-dotted-spinner

## Inspirasjon
- linear.app cmd+K (gull standard)
- algolia DocSearch
- raycast.com command palette

## Output
- `/stats/sok` dedikert side
- Cmd+K modal i isolasjon
- Resultat-grupperings-pattern
- Tom-state og empty-state
- Mobile-flow

## Implementasjon-notater
- Postgres full-text search (FTS) eller bare ILIKE-spørringer
- Debounced live search
- URL-syntese for delbar søkeresultat
- Sitemap utelater dette
- Cmd+K modal kan brukes også i PlayerHQ/CoachHQ (gjenbrukbar)
