# Prompt: PlayerHQ Dashboard — Sports Editorial v1

> Lim inn `design.md` først som design system-kontekst. Deretter denne prompten.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `docs/design-prompts/sports-editorial/design.md`
3. Trykk Enter to ganger
4. Lim inn PROMPTEN under (alt fra og med `---` til slutten)
5. Lagre output som `_outputs/sports-editorial/01-playerhq-dashboard.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design —
kollisjonen mellom Players Tribune, ESPN The Magazine og The Athletic.

Du har akkurat fått hele design-systemet (over). Følg det strengt — spesielt:
- Instrument Serif italic er hovedstemme (bruk OFTE, ikke maks 1 per skjerm)
- Magazine spread-feel, ikke uniform dashboard-grid
- Editorial tone: observerende italic-fragmenter, aldri "Velkommen tilbake"
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)

# SKJERM: PlayerHQ Dashboard

URL: `/portal`
Bruker: **Markus Røinås Pedersen**, 16 år, HCP 4,2 (i dag), A1-spiller på WANG
Toppidrett Fredrikstad. Hjemmebane: Gamle Fredrikstad GK (GFGK).

Markus' første spørsmål når han åpner dashboardet:
*"Hvor står jeg akkurat nå, og hva trenger jeg å gjøre i dag?"*

Han åpner det daglig, 1-3 ganger. Hver gang vil han ha:
- En følelse av momentum (er jeg på vei opp eller ned?)
- Dagens plan (er det noe jeg må gjøre nå?)
- Coach-stemme (har Anders sagt noe nytt?)
- En enkelt vakker innsikt han kan dele med pappa

---

## Dato- og kontekstdetaljer å bruke

- **I dag:** Onsdag 16. mai 2026, kl 07:31
- **Sesong:** Tidlig vår, like før norsk turneringssesong (Olyo Cup om 4 uker)
- **Forrige uke:** Tre runder på GFGK, beste 69 (−3), HCP fra 4,4 → 4,2
- **Strakk:** 12 dager med planlagt trening fullført
- **Form:** Stigende — siste 30 dager +1,8 i SG total

## Realistiske data å bruke

**HCP-trend siste 12 mnd:** 6,1 → 5,8 → 5,5 → 5,2 → 4,9 → 5,1 → 4,8 → 4,6 →
4,5 → 4,4 → 4,3 → 4,2

**SG total breakdown siste 90 dager:**
- OTT: +0,42
- APP: −0,18 (svakeste)
- ARG: +0,67
- PUTT: +0,93 (sterkeste)
- TOTAL: +1,84

**Dagens økt** (kl 09:00, om 1t 29min):
- Tittel: "TEK Approach 150-180m"
- Pyramide: TEK
- Lokasjon: GFGK Range
- Varighet: 75 min
- Drills: 4 stk

**Denne ukens plan** (Onsdag → Søndag):
- Ons 16. mai: TEK Approach 150-180m · 75 min
- Tor 17. mai: HVILE (17. mai-fridag)
- Fre 18. mai: FYS Styrke + Mobilitet · 60 min
- Lør 19. mai: SPILL 18 hull GFGK · 4t
- Søn 20. mai: SLAG Range-blokk · 90 min

**Siste coach-melding** (fra Anders, sendt i går kl 19:42):
*"Markus — så på Trackman-økta di. Hofta er fortsatt rask på toppen.
La oss gjøre slow-motion mandag. Bra arbeid i går."*

**Topp 3 milepæler å fremheve:**
1. WAGR-rangering: #1247 globalt, opp 89 plasser siden januar
2. Første runde under par: 69 (−3) på GFGK, 11. mai 2026
3. Olyo Cup-kvalifisering: bekreftet 14. mai, første WAGR-event

**Neste turnering:** Olyo Cup, Bossum, 13.-15. juni 2026 (4 uker unna)

## Layout — magazine spread (ikke dashboard-grid)

### Spread 1 — Cover (top)

Som magasin-cover. Full-bredde.

- **Eyebrow** (caption-størrelse, uppercase Geist, tracking 0.1em):
  "AK GOLF HQ · UTGAVE 47 · ONSDAG 16. MAI 2026 · 07:31"
  med en pulserende grønn (#16A34A) live-prikk

- **Cover-tittel** (Instrument Serif italic, 96-112px):
  ```
  Markus —
  *nesten i mål.*
  ```
  (Med "nesten i mål" i italic, "Markus —" i regular Instrument Serif)

- **Lead-paragraf** (Geist 18-20px, max-width 540px):
  "HCP 4,2 i dag. Ned 1,8 siden januar — ditt beste 12-måneders trekk på fire år.
  En måned igjen til Olyo Cup. Her er hva som teller nå."

- **Photo til høyre** (4:5 portrait, hvis ikke ekte foto: bruk solid forest-green
  flate med liten italic-tekst "Markus, GFGK, mai 2026") — feel: golden-hour
  på rangen, frosset action.

### Spread 2 — Dagens økt (klokken tikker)

Med spread-feel: 8-col + 4-col.

**Venstre 8-col:**
- Eyebrow: "I DAG · 09:00 — OM 1 TIME 29 MIN"
- Italic Instrument Serif (40-48px): "*150-180m mot smal grønn.*"
- Beskrivelse (Geist 16px): "75 min · 4 drills · TEK Approach. Anders har lagt
  inn slow-motion-segment på drill 3."
- Primær CTA: stor forest-green pill-knapp "Åpne øktplan" + sekundær "Start
  live-modus" (kun synlig hvis <30 min til start)

**Høyre 4-col:**
- En stor stat block:
  ```
  12          ← JetBrains Mono 96px (count-up)
  DAGER PÅ RAD I TRENING

  *Lengste strakk siden i fjor sommer.*
  *Ikke bryt nå.*
  ```

### Spread 3 — Form-trekket (pull quote-break)

Full-bredde pull-quote:

```
*"Markus har truffet et plateauet på 150-180m approach.*
*Vi prøver smal grønn-drill neste uke for å bryte gjennom."*

— ANDERS KRISTIANSEN, COACH · 15. MAI 19:42
```

Med liten forest-green accent-strek (3-4px, 96px lang) til venstre.

### Spread 4 — Performance-spread (data som annotasjon)

Magasin-spread: 6-col stort tall + 6-col annotasjoner.

**Venstre 6-col — HCP-trend graf:**
- Stor SVG line-graph (12 mnd, 12 datapunkter)
- Linje tegnes inn med stroke-dashoffset på load (1200ms)
- I dag-punkt markert med stor sirkel + label "4,2 I DAG"
- Hover viser tooltip med dato + verdi
- Y-akse: ingen rutenett, kun start/slutt-tall
- X-akse: månedsforkortelser, JetBrains Mono caption
- Tittel over: italic "*HCP siste 12 måneder*"

**Høyre 6-col — SG breakdown:**
- 4 horisontale bars (OTT, APP, ARG, PUTT)
- Hver bar: pyramide-fargen for kategorien (#005840 TEK, etc. — eller bruk
  én forest-gradient hele veien for harmoni)
- Tall til høyre i JetBrains Mono: +0,42 / −0,18 / +0,67 / +0,93
- Annotasjons-pil pekende på APP-baren med italic: "*Her ligger
  forbedrings-rommet — neste fokus.*"
- Total nederst: TOTAL +1,84 (større, JetBrains Mono 32px)

### Spread 5 — Denne uka (TOC-stil sidebar eller spread)

Editorial table of contents:

```
DENNE UKA — 16. → 22. MAI

01  Ons 16. mai     *TEK Approach 150-180m*           09:00 — 75 min
02  Tor 17. mai     *Hvile* — 17. mai                  —
03  Fre 18. mai     *FYS Styrke + Mobilitet*           16:00 — 60 min
04  Lør 19. mai     *18 hull, GFGK*                    08:00 — 4 t
05  Søn 20. mai     *SLAG Range-blokk*                 11:00 — 90 min
```

Hver rad har italic Instrument Serif på tittelen. Pyramide-prikk (4px) til
venstre i pyramide-fargen. Hover: rad får forest-green understrek.

### Spread 6 — Milepæler (callouts)

3 editorial-cards i en row, men IKKE like brede — magasin-feel.

**Card 1 (bred):**
- Eyebrow: "PROGRESJON"
- Italic headline (Instrument Serif 28-32px): "*WAGR #1247 globalt.*"
- Body: "Opp 89 plasser siden januar. Nesten på topp-1000."
- Tiny photo (1:1) av WAGR-logo eller golf-globe-grafikk

**Card 2 (smal):**
- Eyebrow: "FØRSTEMINUTTEN"
- Italic: "*69 (−3).*"
- Body: "Første runde under par. GFGK, 11. mai."

**Card 3 (medium):**
- Eyebrow: "PÅ HORISONTEN"
- Italic: "*Olyo Cup. 4 uker.*"
- Body: "Første WAGR-event. Bossum 13.-15. juni."
- Liten countdown-chip: "27 dager"

### Spread 7 — Coach voice (avskjeds-blokk)

Som en redaktør-spalte nederst:

```
[24px AVATAR av Anders]   ANDERS KRISTIANSEN, HEAD COACH

*"Bra arbeid i går. Slow-motion mandag —*
*vi tar hoftearbeidet fra topp."*

[Send-melding-knapp, sekundær]    [Se Anders' planer for uka]
```

### Footer / colophon

```
AK GOLF HQ · Utgave 47 · Onsdag 16. mai 2026 · Trykket digitalt fra Fredrikstad
```
Caption-størrelse, Geist 10-11px, muted-foreground.

## Interaktivitet (alle må fungere)

- **Count-up animasjon** på "12 dager" stat (0 → 12, 800ms ease-out)
- **HCP-linje tegnes inn** med stroke-dashoffset (1200ms ease-out)
- **SG bars fade-up stagger** (50ms forskjøvet, 400ms varighet)
- **Pull-quote scale-up** fra 0.96 → 1.0 på load
- **Editorial cards fade-up stagger** på load
- **Hover på "Denne uka"-rad:** forest-green understrek glir inn fra venstre
- **Hover på editorial card:** lett løft (translateY -2px) + skygge
- **Pulserende grønn live-prikk** ved siden av tidspunkt i header
- **Coach-melding "Send" og "Se Anders' planer"**: hover → forest-green fyll +
  hvit tekst

## Command palette (⌘K / Ctrl+K)

20+ kommandoer i kategorier:

**Handlinger**
- Start live-økt nå
- Logg runde
- Send melding til Anders
- Pause dagens plan
- Marker som ferdig
- Eksporter HCP-grafer som PDF

**Navigasjon**
- Gå til Trening
- Gå til Mål
- Gå til Coach
- Gå til Meg
- Åpne årsplan
- Se kalender denne uka

**Sammenlign**
- Markus vs HCP-mål 3,5
- Denne uka vs forrige uke
- Form-trend 30/90/365 dager
- Sammenlign med Hovland-data
- Sammenlign med Olyo Cup-vinnere

**Analyse**
- Vis full SG-breakdown
- Per-kølle Trackman-data
- WAGR-historikk

**Coach**
- Ping Anders (rask melding)
- Be om tilbakemelding på siste runde
- Se Anders' planer for neste 4 uker

**Hjelp**
- Snarveier
- Om tier (Pro 300 kr/mnd)
- Send tilbakemelding

⌘K åpner palette med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke.

## Output

Komplett HTML-fil, 1440×900 viewport, lagt til:
- Tailwind CDN
- Google Fonts: Instrument Serif (italic + regular), Geist (variable), JetBrains Mono
- Lucide-ikoner inline SVG
- Alle animasjoner fungerer
- Realistisk data (ikke "Lorem ipsum")
- Norsk gjennomgående
- Command palette fungerer

Etter levering, gi kort oppsummering (under 200 ord):
1. Hvilke 3 designvalg gjør skjermen tydeligere?
2. Hvilke ville blitt løftet i neste iterasjon?
3. Hva er du usikker på (hvor trenger du Anders' input)?
