# Design-prompt 01 — `/stats` hub-landing

> Les `00-master-brief.md` for brand/tokens/tone før du starter.

**Side:** `akgolf.no/stats` — øvre innfartsåren til hele Stats-produktet
**Bruker:** Foreldre, spillere, trenere, talentscouts. Norsk publikum først, men engelske ord (PGA, SG, putt) er ok.
**Hovedoppdrag:** På 5 sekunder skal besøker forstå at dette er Norges beste gratis golf-statistikkverktøy.

---

## Datakilder (alt er live fra DB)

```
norskeIAksjon: number          // antall norske spillere som spiller en pro-turnering denne uka
kommendeTurneringer: number    // antall turneringer neste 30 dager
sisteSyncDato: Date            // siste DataGolf-oppdatering (vises som "for 2 timer siden")
```

Pluss 4 statiske modul-tekster (Turneringer, PGA Tour Stats, Norsk spillerbase, SG-sammenligning).

## Bruker-flow

```
Lander → ser hero → forstår de 4 verktøyene → klikker ett → utforsker
                                            ↓
                                  Subtil PlayerHQ-CTA underveis
```

---

## Designoppdrag

### 1. Hero — editorial, ikke marketing

Erstatt nåværende hero med en som matcher The Athletic / DataGolf:

- **Pre-headline (eyebrow):** Mono caps "AK GOLF STATS" med liten lime-prikk eller logo-glyph
- **Headline:** Stor Inter Tight italic-aksent. To linjer max.
  Eksempel: `"All statistikken. *Gratis. Alltid.*"`
- **Sub:** Maks 2 setninger, ~18px, neutral muted-foreground
- **Live data-strip** plassert UNDER hero (ikke i hero) som tre KPI-bokser:
  - "X norske i aksjon denne uka" (Flag-ikon, mono store tall)
  - "Y kommende turneringer" (Trophy)
  - "Oppdatert {relativ tid}" (Zap)
- **CTA:** Én primær ("Se ukens turneringer →") + én sekundær ("Utforsk alle verktøy ↓"). Begge `rounded-md`, 8pt-grid spacing.

**Visuell ambisjon:** Hero skal kjennes som forsiden av en sportsavis. Bruk varm off-white bakgrunn med subtil bakgrunns-illustrasjon (golfbane-kontur, faded ut til 8% opasitet, plassert nederst-høyre — kan bruke Lucide `Flag`-ikon i 600px størrelse roterert ~15°).

### 2. "Norske i aksjon" — full-bredde strøk under hero

Ny seksjon — viktig nok til å være rett etter hero, før moduler. Dette er produktets bevis på relevans.

- Mono eyebrow: "DENNE UKEN"
- Headline: "Norske spillere i aksjon" (Inter Tight, semibold)
- Horizontal scroll-strip på mobile, grid på desktop
- Hver spillerkort:
  - Flagg-glyph (SVG, ikke emoji)
  - Spillerens navn (font-display)
  - Turnering hen spiller (muted)
  - Live-posisjon hvis aktivt: "T-12 · -4" (mono, lime hvis under par, default hvis over)
  - "Live-leaderboard →" (mini-knapp som åpner i ny fane)
- Hvis 0 norske denne uka: vis en stille fallback ("Tomt slot i kalenderen — neste uke er PGA Tour-mester")
- **Lenke til full liste:** `/stats/norske` (kan stub-es)

### 3. 4 modul-kort — bento, ikke uniformt grid

Ikke et 2x2 grid med identiske kort. **Bento-layout:**

```
┌──────────────────────────┬──────────────┐
│ Turneringer (stor)       │ PGA Stats    │
│ Hero-bilde av turnering  │ (medium)     │
│ Live "X spiller i dag"   │              │
├──────────────────────────┼──────────────┤
│ Norsk spillerbase        │ SG-sammenlign│
│ (medium)                 │ (stor)       │
│                          │ Radar-preview│
└──────────────────────────┴──────────────┘
```

Hvert kort:
- Lucide-ikon i 48x48 lime/forest sirkel
- Tittel (Inter Tight)
- 2-linjers tekst
- Live-tall hvor relevant ("1 173 turneringer · oppdatert daglig")
- Hover-state: subtil border-glow + ikon-skift fra outline til fill
- Klikkbart hele kortet — pil i hjørnet

**Variasjon mellom kortene:**
- **Turneringer**: foto/illustrasjon av leaderboard
- **PGA Stats**: sparkline av topp 5 drive distance
- **Spillerbase**: ansiktsstack (3-4 placeholder-avatarer)
- **SG-sammenlign**: minimal radar-snippet (4 punkter, ikke fully drawn)

### 4. Mersalg-bånd #1 — midt på siden

Forest-bakgrunn (`bg-primary text-primary-foreground`). 2-kolonne grid:

**Venstre (2/3):**
- Mono eyebrow lime: "PlayerHQ"
- Headline: "Vil du følge *dine egne* tall?" (italic på "dine egne")
- 2-linjers tekst om PlayerHQ
- Primær CTA: "Prøv gratis i 30 dager →" (bg-background text-foreground)
- Sekundær: "Se priser" (border-only)

**Høyre (1/3):**
- Liten card med "Inkludert i abonnement":
  - Lime prikker + 6 fordeler
  - Bunn: mono lime "300 kr/mnd · Gratis under beta"

### 5. "Slik bruker treneren det" — 3 stegs storytelling

Editorial seksjon som bygger bro mellom gratis stats og betalt verktøy. Tre kort horisontalt:

| Steg | Tittel | Tekst |
|---|---|---|
| 01 | Mål svakhet | SG-profilen viser hvor strokene tapes |
| 02 | Bygg drillen | Coach lager treningsplan målrettet svakheten |
| 03 | Følg utvikling | SG-trenden viser om treningen virker |

Hvert steg har:
- Mono nummer i lime
- Liten Lucide-ikon
- Tittel (font-display)
- 2-linjers tekst
- Subtil connector-linje mellom kortene (horisontal line med prikk)

Under stegene: card med "Vil du jobbe med en av våre coacher? Vi har plass til nye spillere på AK Golf Academy i 2026." + CTA til `/coaching`.

### 6. Bunn-CTA

Soft secondary-bakgrunn. Sentrert layout:
- Headline: "Klar for å bli *bedre*?" (italic, font-display)
- 1-linje sub
- To CTAer side ved side: "Start PlayerHQ gratis" (primær) + "Se norske i aksjon" (secondary)
- Footnote: "Ingen kredittkort nødvendig. Avslutt når du vil."

---

## Mobile-tilpasning

- Hero blir én kolonne, hero-illustrasjon flyttes til bunn av hero-seksjonen som dekor
- KPI-strip blir 3 stablede kort
- "Norske i aksjon" får horizontal scroll med snap-points
- Bento-grid blir 1-kolonne stack
- Mersalg-bånd: kolonner stables, "Inkludert"-kortet kommer over CTA-knappene

## Mikrointeraksjoner

- KPI-tall: count-up-animasjon når de scroller inn i view (0 → faktisk tall over 600ms)
- Modul-kort: ikon roterer 5° + lime-glød på hover
- "Norske i aksjon"-strip: scroll-snap på mobile, smooth scroll med pil-knapper på desktop
- CTA-knapper: pil flytter seg 4px til høyre på hover

---

## Inspirasjon (eksplisitt)

1. **theathletic.com** — editorial italic headlines, varm off-white, generøs whitespace
2. **datagolf.com/predictions** — KPI-strip-pattern, mono-fonts for tall
3. **linear.app/homepage** — moderne SaaS-hero med subtil bakgrunns-grafikk

## Output

Lever 3 visuelle skisser av hero alene (varianter A/B/C), så plukker vi én. Resten av siden kan leveres som én komplett skisse.
