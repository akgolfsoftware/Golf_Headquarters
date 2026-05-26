# Design-prompt 06 — `/stats/spillere/[slug]` spillerprofil

> Les `00-master-brief.md`.

**Side:** Profilside for én norsk spiller (~1 500 mulige slugs)
**Bruker:**
1. Spilleren selv ("hva har jeg gjort i karrieren?")
2. Foreldre (følger barnets utvikling)
3. Talentscouts (vurderer for college / forbund)
4. SEO-trafikk (Google → spillernavn)
**Hovedoppdrag:** Føles som **en seriøs spillerprofil** (à la basketball-reference.com eller The Athletic).

---

## Datakilder

```typescript
const SPILLER = {
  slug: "viktor-hovland-1997",
  navn: "Viktor Hovland",
  fodselsAr: 1997,
  klubb: "Oslo Golfklubb",
  tier: "pro-pga",
  wagrRank: null,
  dataGolfId: 12345,           // PGA-link mulig
  bio: "WAGR snittscore: 17å=70.5, 18å=70.2, ... · University of Oklahoma",
};

const RESULTATER: Array<{   // ~50-200 rader per spiller
  dato: Date;
  turnering: string;
  tour: string;               // "srixon" | "olyo" | "ngc" | "ostlandstour" | "pga" | "ncaa-d1-m"
  posisjon: number | null;
  totalScore: number | null;
  rounds: Array<{ n: number; score: number; par: string }>;
}> = [ ... ];

// Aggregate:
const STATS = {
  perAar: { 2018: { snitt: 72.1, antall: 14 }, ... },
  beste: { score: 65, turnering: "...", dato: ... },
  totalt: { runder: 287, turneringer: 87, tourer: 5 },
};
```

---

## Designoppdrag

### 1. Hero — editorial spillerprofil

Stor, dedikert hero som spiller hovedpersonen.

**Layout (desktop):**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   [VH]   VIKTOR HOVLAND                                    │
│   stor   29 år · Oslo Golfklubb · 🇳🇴 PGA Tour            │
│   initial                                                  │
│                                                            │
│           Pro siden 2019 · University of Oklahoma          │
│                                                            │
│   ─────────────────────────────────────────                │
│                                                            │
│   142 TURNERINGER   |   287 RUNDER   |   BESTE: 63 (2024)  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- Initial-glyph 96x96 lime sirkel (forest tekst)
- Navn i Inter Tight italic eller bold (decision: italic for editorial feel) — 56px
- Sub-info: alder, klubb, tier-badge med Lucide-icon
- Tag-row: "Pro siden 2019" osv (chips)
- 3 store mono KPI-tall under separator

**Mobile:** Stables, initial-glyph blir mindre (64x64)

### 2. Tab-navigasjon

Sticky tab-bar like under hero:

```
[ Resultater ]  Trend  Sammenlign  Stats
```

4 tabs. Aktiv tab: bunn-border i lime + foreground tekst.
Tabs er **server-rendered** med separate URL-er (?tab=resultater) for SEO.

### 3. TAB 1: Resultater (default)

**Sub-navigasjon innen tab:** Filter-chips for tour:
```
[ Alle ] [ PGA Tour ] [ Srixon ] [ OLYO ] [ NGC ] [ Østlands ] [ NCAA ] [ WAGR ]
```

**Hovedinnhold:** Kronologisk liste, gruppert per år. Hvert resultat:

```
┌─────────────────────────────────────────────────────────┐
│  2024 · 14. JUNI                                        │
│  PGA Tour · U.S. Open                                   │
│  Pinehurst No. 2, North Carolina                        │
│                                                         │
│  R1  R2  R3  R4    TOTAL    POSISJON                    │
│  69  68  72  70    279       T-12                       │
└─────────────────────────────────────────────────────────┘
```

- Dato og tour: mono caps eyebrow
- Turnering: font-display, 18px
- Sted: muted
- Rundsscorer: BIG mono tall, hver runde
- Total + posisjon: mono, lime hvis topp-10, default ellers
- Klikkbar (åpner turneringsside `/turneringer/[slug]` hvis offentlig)

Hvis spilleren har mange resultater (>20), implementer "Vis flere"-paginering (50 per side).

### 4. TAB 2: Trend

Score-progresjonsgraf over tid + statistikk-tabeller.

**Section A: Hovedgrafen — Snittscore per år**

Linjegraf (recharts):
- X-akse: år
- Y-akse: snittscore (lavere = bedre, invertert hvis det føles bedre)
- Linje for spillerens snittscore (forest, 3px)
- Skygget area under linjen (forest med 20% opacity)
- Optionalt: norsk snitt for samme aldersgruppe (lime stiplet)
- Hover-tooltip: "2024: 70.5 over 28 runder"

**Section B: Per år-statistikk**

Tabell:
```
År    Runder    Snitt    Beste    Tourer
2024  28        70.5     65       PGA, Korn Ferry, Euro
2023  31        71.2     67       PGA, Korn Ferry
2022  35        72.4     68       Korn Ferry, NCAA
...
```

**Section C: Per tour-statistikk**

Sektor/donut-chart med antall runder per tour, eller bar-chart horisontalt.

### 5. TAB 3: Sammenlign

Bygg på SG-sammenligning-konseptet, men sammenligning av to norske spillere.

- Hero: "Sammenlign Viktor Hovland med ..."
- Søke-input med autocomplete på alle norske spillere
- Når valgt: vis side-by-side stats-tabell og linjegraf

For MVP kan denne være enkel (bare statistikk-tabell + linje-overlay). Senere kan vi utvide.

### 6. TAB 4: Stats

Tett DataGolf-stil statistikk-tabell. Hvis spilleren har DataGolf-ID (er pro), vis:
- Sg Total per år
- SG: OTT / APP / ARG / PUTT
- Drive distance, fairway %, GIR, putt-rate
- WAGR-rank historisk (line-graf)

Hvis ingen DataGolf-data (amatør/junior), vis enkel beregnet statistikk:
- Antall topp-10
- Snitt per tour
- Personlige rekorder (laveste runde, lengste cut-streak, osv)

### 7. "Spilleren i én setning"-blokk

Editorial sammendrag, plassert etter tabs (eller før, som hero-extension):

Et AI-generert sammendrag på 2-3 setninger basert på dataen:

> *"Viktor er en av norske golfs mest prominente proffer. Med en gjennomsnittlig score på 70.5 i 2024 over 28 PGA Tour-runder, ligger han i topp 15% av Tour-spillere. Han forbedret seg dramatisk fra 2022 (72.4) til 2024 (70.5) — en av de mest produktive utviklingskurver i nyere norsk golf."*

Genereres server-side med en enkel mal — ikke ekte AI ennå, men kan utvides.

Layout: Italic Inter Tight, 24px, sentrert max-width-600px, med subtil grein-divider over og under.

### 8. Mersalg-bånd — kontekstuelt

Forest-bakgrunn. Tema: din egen profil.

- Headline: "Vil *du* ha en slik profil?"
- Tekst: "Hvis du spiller på en av tourerne vi tracker, har du sannsynligvis allerede én. Hvis du vil følge utvikling, mål og runder over tid — det er PlayerHQ."
- CTA: "Prøv PlayerHQ gratis"

### 9. GDPR-strøk

Bunn av siden, diskret:

- "Er dette deg, og du vil at profilen slettes? [Klikk her]" (mailto-lenke)
- "Resultater hentet fra offentlige turneringer · Sist oppdatert: {dato}"

---

## Mobile-tilpasning

- Hero: initial-glyph mindre, navn 36px
- Tab-bar: horizontal scroll med snap (lik shadcn Tabs)
- Resultater: kort blir tighter, rundsscores i 3 columns + posisjon stables
- Trend-graf: smaller, men full bredde
- Statistikktabeller: horizontal scroll der nødvendig

## Mikrointeraksjoner

- Navn-glyph: subtil scale 1.02 pulse på page-load
- KPI-tall: count-up når i view
- Tab-bytte: smooth color transition
- Resultat-kort: hover gir liten lime-glow på venstre kant
- Trend-graf: line draws fra venstre til høyre over 800ms ved første render

---

## Inspirasjon

1. **basketball-reference.com** — spillerprofiler, tabs, kronologisk data
2. **theathletic.com NFL player profiles** — editorial hero, "spilleren i én setning"
3. **datagolf.com/player-profile** — tett tabular stats per spiller

## Output

- Komplett page-sketch
- Hero i isolasjon (3 tier-varianter: PRO, COLLEGE, JUNIOR)
- Tab-bar med states
- 1 resultat-kort i alle 3 tour-varianter (PGA, Srixon, NCAA)
- Trend-tab komplett (graf + tabell)
- Editorial "i én setning"-blokk
