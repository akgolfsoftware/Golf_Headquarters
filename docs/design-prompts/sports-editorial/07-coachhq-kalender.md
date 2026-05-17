# Prompt: CoachHQ Kalender Årsplan — Sports Editorial × 3 enheter

> Lim inn `design.md` (Sports Editorial design system) FØRST som kontekst.
> Deretter denne prompten. Claude Design leverer én HTML-fil med desktop,
> iPad og iPhone stablet vertikalt.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet 4.6 eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn prompten under (alt fra og med `---` til slutten)
5. Claude Design leverer komplett HTML
6. Lagre som `_outputs/07-coachhq-kalender.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-coaching. Du
designer nå CoachHQ Kalender (Årsplan-visning) — en **52-ukers Gantt** for
6 elite-spillere. Tonen er **referansetabell møter redaksjonell tidslinje**:
tenk *"Atlas-spread fra et golf-magasin"* snarere enn ren prosjekt-Gantt.
Anders skal se hele året på ett oppslag — perioder, turneringer, kollisjoner
— og handle på det. Atlas-arketypen (referansetabell editorial-stil) er
ankeret, Field Notes (marginalia om periode-overganger) holder typografien
levende rundt rutenettet.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (også her — i italic-headlines,
  periode-glyfer, marginalia)
- Typografi-glyfer som ikoner (ikke SVG-tegninger). Pyramide-tags er
  uppercase italic, periode-typer settes som tekst-glyfer
- Atlas-arketypen er sentral — full-bredde referansetabell med hairline-
  rader, ingen vertikale gridlines i typisk Gantt-stil. Vi tegner ukene
  som hairline-tics, ikke som solid grid
- Forest green som signatur, lime KUN på turnerings-markører + 7-dagerslås
- Norsk locale (komma desimal, ikke-brytbar mellomrom, "U" + uke-nummer for
  ukeforkortelse, "Jan/Feb/..." for måneder)
- Editorial tone — observerende italic-fragmenter i marginalia, aldri
  "Klikk her" eller "Detaljer"
- Coach-tonen er **kuratert + handlekraftig**: italic-headlines for periode-
  observasjoner, JetBrains Mono for uker og varighet, korte verb-CTA-er

# SKJERM: CoachHQ Kalender Årsplan (3 enheter)

URL: `/admin/kalender?view=ar`

## Demo-bruker (faktiske data)

**Anders Kristiansen**
- Yrke: Head Coach, AK Golf Academy
- Visning: Årsplan 2026 (52 uker × 6 elite-spillere)
- Hjemmebane: Gamle Fredrikstad GK (GFGK)

Brukerspørsmål når Anders åpner Årsplan:
*"Hvor er hver spiller i sin årssyklus, og hvor kolliderer perioder med
turneringer?"*

Tone: Anders trenger ikke å bli forklart hva en Gantt er — han trenger å se
**syklusen** og **kollisjonene**. Skjermen er hans årshjul, men trykket som
forsiden på en referansetabell — Atlas-spread fra et coaching-magasin.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026 — uke 20
- **Visning:** Hele 2026, uke 1 → uke 52
- **Aktive spillere i Årsplan:** 6 (de 6 mest aktive turnerings-spillerne)
- **Periodeforekomster total:** 38 perioder fordelt på 6 spillere
- **Turneringer i 2026:** 6 markerte konkurranser
- **Kollisjoner avdekket:** 2 perioder der ferie/EVAL overlapper turnerings-uke
- **7-dagerslås aktivert:** 6 (én per turnering — uken før låses for store
  endringer)

### Periode-typer (5 totalt)

| Type | Hex | Tekstfarge | Glyf-stil |
|---|---|---|---|
| GRUNN | #003B2A | #FAFAF7 | italic uppercase, JBM-uke-tall lyst |
| SPESIALISERING | #005840 | #FAFAF7 | italic uppercase, JBM lyst |
| TURNERING | #D1F843 | **#0A1F18** | italic uppercase mørk, JBM mørk |
| EVALUERING | #5E5C57 | #FAFAF7 | italic uppercase, JBM lyst |
| FERIE | diagonal-stripet (#F1EEE5 base, #E5E3DD striper 45°) | #5E5C57 | italic uppercase muted |

Diagonal-stripet ferie tegnes som `repeating-linear-gradient(45deg, #F1EEE5
0, #F1EEE5 6px, #E5E3DD 6px, #E5E3DD 12px)`.

### De 6 aktive spillerne (rekkefølge fra topp til bunn i Gantt)

| Spiller | HCP | Status | Profilbilde-init |
|---|---|---|---|
| Øyvind Rohjan | +3,5 | Tour-aspirant, European Amateur U24 | ØR |
| Sofie Larsen | +0,8 | NM-medalje, jenter 16-17 | SL |
| Lars Hansen | +1,2 | Junior elite, GFGK-talent | LH |
| Ida Bjørklund | 5,5 | Junior, jenter U16 | IB |
| Markus R. Pedersen | 4,2 | 16 år, stigende form | MP |
| Tora Eriksen | 1,8 | Senior dame, konkurranseaktiv | TE |

### Spillernes 52-ukers perioder

**Øyvind Rohjan (+3,5)** — fokus tour-prep, lang turneringssesong
- U1–U8 — SPESIALISERING (vinter-tek, pre-sesong)
- U9–U44 — TURNERING (lang sammenhengende konkurransesesong)
- U28–U30 — FERIE (overlap inni turneringsblokken, bevisst pause-uke etter
  European Amateur)
- U45–U48 — EVALUERING (post-sesong)
- U49–U52 — GRUNN (gjenoppbygging, off-season)

**Sofie Larsen (+0,8)**
- U1–U10 — GRUNN
- U11–U17 — SPESIALISERING
- U18–U36 — TURNERING
- U37–U42 — EVALUERING

**Lars Hansen (+1,2)**
- U1–U6 — SPESIALISERING
- U7–U44 — TURNERING (full sesong)
- U45–U48 — EVALUERING
- U49–U52 — GRUNN

**Ida Bjørklund (5,5)** — mest variert
- U1–U12 — GRUNN
- U13–U19 — SPESIALISERING
- U20–U32 — TURNERING
- U33–U35 — FERIE (bevisst sommerstopp)
- U36–U40 — TURNERING (re-entry på høstturneringer)
- U41–U44 — EVALUERING
- U45–U52 — GRUNN

**Markus R. Pedersen (4,2)**
- U1–U14 — GRUNN
- U15–U20 — SPESIALISERING
- U21–U34 — TURNERING
- U35–U38 — EVALUERING
- U39–U52 — GRUNN

**Tora Eriksen (1,8)**
- U1–U4 — SPESIALISERING
- U5–U44 — TURNERING (lengste sesong)
- U28–U30 — FERIE (overlap, bevisst pause samme uker som Øyvind)
- U45–U49 — EVALUERING
- U50–U52 — GRUNN

### Turneringsmarkører (gul diamant ●◆ over riktig uke)

Diamant er en 10px rotert firkant med #D1F843 fyll + 1px #0A1F18 border,
plassert ABSOLUTT over uke-kolonnen, ca 12px over toppen av rad 1.

| Uke | Turnering | Datoer |
|---|---|---|
| U20 | Klubbmesterskap GFGK | 17.-19. mai |
| U21 | Garmin Norges Cup R1, Hauger GK | 23.-24. mai |
| U22 | Olyo Cup, Bossum | 13.-15. juni |
| U24 | European Amateur, Halmstad | 15.-18. juni |
| U28 | Garmin Norges Cup R2, Oslo GK | 12.-14. juli |
| U28 | Srixon Cup, Larvik | 11.-13. juli |

Når flere turneringer i samme uke (U28): to diamanter stables vertikalt
med 4px gap.

### 7-dagerslås (2px gul border-left)

Uken FØR hver turnering har en 2px solid #D1F843 venstre-border som strekker
seg fra topp til bunn av Gantt-tabellen. Dette varsler at endringer i denne
uken krever ekstra godkjenning. Plasseres på:
- U19 (før klubbmesterskap U20)
- U20 (før Norges Cup R1 U21)
- U21 (før Olyo U22)
- U23 (før European Amateur U24)
- U27 (før Norges Cup R2 + Srixon U28)

### Avdekkede kollisjoner

1. **Øyvind U28–U30 FERIE inni TURNERING-blokk U9–U44**
   Italic-marginalia: *"Bevisst — pause etter European Amateur. Ingen
   turneringer plassert disse ukene."*
2. **Ida U33–U35 FERIE mellom to TURNERING-perioder**
   Italic-marginalia: *"Sommerstopp. Re-entry uke 36 — sjekk Trackman før."*

### Pyramide-volum-graf (stablet bar, 52 uker)

Under Gantt-tabellen: én stablet søyle per uke (52 søyler), høyde ca 64px
(desktop) / 48px (iPad) / skippes på iPhone. Hver søyle viser pyramide-
fordelingen aggregert over de 6 spillerne i den uken.

Eksempel-fordeling (uke 20 — vi er i TURNERING-tung periode for 4 av 6):
- FYS 8%, TEK 18%, SLAG 22%, SPILL 22%, TURN 30%

Eksempel-fordeling (uke 49 — alle i GRUNN/EVAL):
- FYS 28%, TEK 32%, SLAG 22%, SPILL 14%, TURN 4%

Pyramide-fargene fra design.md seksjon 3. Klikk på en søyle åpner side-
panelet for den uken (alle 6 spillere + aggregert volum).

### Side-panel (vises når periode klikket)

Eksempel når Anders klikker Markus' TURNERING-blokk uke 38:
- Sticky høyre-panel, 400-480px bred (desktop/iPad). På iPhone: full-screen
  slide-fra-bunn.
- Header: `MARKUS PEDERSEN · TURN U16-38`
- Subhead italic: *"14 uker turnering. Endte med Klubbmesterskap GFGK U34."*
- Periode-metadata:
  - Start: 12.04.2026 (U16)
  - Slutt: 20.09.2026 (U38)
  - Varighet: 23 uker / 161 dager
  - Pyramide-vekt: SPILL 32%, TURN 28%, TEK 22%, SLAG 14%, FYS 4%
  - Antall turneringer i blokken: 2
- Caddie-observasjon (italic):
  *"Markus har lengste TURN-blokk i porteføljen. Vurder en mini-EVAL i U28
  før Klubbmesterskapet."*
- 3 pull-tabs:
  - `Endre periode →` (primary)
  - `Splitt i to →` (secondary)
  - `Slett periode` (destructive)

### Editorial tone — kalender-perspektiv (åpningslinjer)

- *"52 uker. 6 spillere. Hvor svikter syklusen?"*
- *"Tre kollisjoner i juni-juli. To bevisste."*
- *"Øyvind har 36 uker turnering. Ida 18."*
- *"Lime varsler — turnerings-uke nærmer seg."*

---

## STRUKTUR — 6 spreads kombinert

Coach-tonen er **operativ + redaksjonell + referansetabell-tung**. Atlas-
arketypen er ankeret (full-bredde Gantt). Field Notes (marginalia om
periode-overganger) holder typografien levende rundt rutenettet.

Bruk **6 spread-arketyper** fra design.md seksjon 12:

1. **Cover (Arketype A, variant Hverdag, kompakt)** — italic-tittel om
   årssyklusen
2. **Toolbar-strip (sticky, modifisert Stat block + filter-chips)** — år,
   filter, layout, ny periode
3. **Atlas — Gantt-tabell (Arketype H, sentral)** — 52 uker × 6 spillere
4. **Pyramide-volum (Data Story + 18.4 stacked bar)** — 52 stablede søyler
5. **Field Notes — kollisjons-marginalia (Arketype E)** — italic
   observasjoner om de 2 avdekkede kollisjonene
6. **Side-panel som åpner mot Markus-periode** — vises som overlay, ikke
   inline

Footer/kolofon nederst.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (240-260px — vi trenger plass til
Gantt). Gantt er **veldig bred** (52 × 22px = 1144px) og trenger så mye
horisontal plass som mulig.

**Sidebar TOC (smal):**
```
AK GOLF HQ · COACH
Utgave 048 · 17.05

01  Hub
02  Spillere
03  Bookinger
04  Stripe
05  Caddie
06  Sportsplan-lab
07  Tester
●  Kalender (Årsplan)

VISNINGER
↳ Dag
↳ Uke
↳ Måned
●  År ←

  Anders Kristiansen
  Head Coach · A-lisens
```

**Main content (max 1180px — vi trenger plass til Gantt):**

### Spread 1 — Cover (12-col, kompakt)

Atlas-feel — referanseforside, ikke hero-cover.

- Eyebrow: `● COACHHQ · KALENDER · ÅRSPLAN 2026 · U20 · SØN 17.05`
  pulserende grønn live-prikk
- Cover-tittel (Instrument Serif italic, 64px — kompakt for ref-spread):
  ```
  52 uker, 6 spillere.
  *Hvor svikter syklusen?*
  ```
- Lead-paragraf (Geist 16px, max-width 640px):
  *"Tre kollisjoner avdekket i juni-juli — to er bevisste hvile-uker, én
  krever en samtale. Seks turneringer markert. Uken før hver låst for
  endringer."*
- Høyre side (3-col): mini-stempel
  ```
  38
  PERIODER · 2026
  *6 turneringer · 2 kollisjoner.*
  ```

### Spread 2 — Toolbar (sticky, 12-col)

Sticky topp under masthead, full-bredde. Hairline-border bunn.

Layout: venstre 6-col med år + filter, høyre 6-col med layout + ny periode.

```
─────────────────────────────────────────────────────────────
  ÅR  [◀ 2026 ▶]      FILTER  [Alle 6 spillere ▾]  [Alle perioder ▾]    LAYOUT  [Gantt ●] [Liste ○]      [+ Ny periode →]
─────────────────────────────────────────────────────────────
```

- År-velger: pill-form, JBM 14px tabular-nums, chevron venstre/høyre
- Filter-chips: 2 dropdowns (spillere, periode-typer)
- Layout-toggle: segmented control 2-valg (Gantt aktiv / Liste)
- Ny periode CTA: primary pull-tab høyre med Lucide `Plus` 16px

Alle pull-tabs S-size (32px høy). Padding 12-16px hver side av toolbar.

### Spread 3 — Atlas (Gantt-tabell, 12-col)

Bakgrunn: cream-newsprint #ECE9DF (Atlas-arketype). Full-bredde.

**Tabell-struktur:**
- Venstre kolonne (fast, 200px): Spillerinfo (avatar 32px + navn + HCP)
- Hovedrutenett (1080px): 52 uke-kolonner à 20-22px

**Toppen — uke-header:**

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│          │   ◆        ◆◆      ◆◆       ◆◆                                    │ ← Turnerings-diamanter
│          │   ║         ║       ║        ║                                    │ ← 7-dagerslås (2px gul venstre-border)
│ 2026     │  U1 U2 U3 ... U20 U21 U22 ... U28 ... U52                       │ ← Uke-tall (JBM 10px)
│          │  Jan       Feb     Mar     Apr   Mai      ...                    │ ← Måned-tags hver 4. uke
├──────────┼─────────────────────────────────────────────────────────────────┤
```

Detaljer header:
- Måned-tag plasseres over uke der måneden starter (Geist 10px caps tracking
  0.1em), centered over 4-5 uker
- Uke-tall: `U1`, `U2`, ..., `U52` i JBM 10px, alle 22px brede, centered
- Turnerings-diamant (◆): 10px rotert square #D1F843 + 1px ink border,
  plasseres absolutt 12px over uke-header, centered over riktig uke
- 7-dagerslås (║): 2px solid #D1F843 venstre-border som strekker seg fra
  uke-header ned gjennom hele Gantt-rutenettet
- I dag-markør (U20): vertikal stiplet linje 1px forest, full høyde med
  liten italic-tag øverst "*i dag*"

**Rad-struktur per spiller (6 rader):**

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│ [ØR] ØYVIND ROHJAN │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ HCP +3,5 · Tour    │ SPES U1-8   TURN U9-44 ──────────── EVAL EVAL GRUN... │
│                    │             ░ FERIE U28-30 ░                         │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ [SL] SOFIE LARSEN  │ ████████████ ▓▓▓▓▓▓▓▓ ░░░░░░░░░░░░░ EVAL EVAL ...    │
│ HCP +0,8           │ GRUNN U1-10  SPES U11-17  TURN U18-36   EVAL ...     │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ [LH] LARS HANSEN   │ ▓▓▓▓▓ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ EVAL GRUN │
│ HCP +1,2           │ SPES   TURN U7-44 ────────────────────── EVAL GRUNN  │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ [IB] IDA BJØRKLUND │ █████████████ ▓▓▓▓▓▓▓ ░░░░░░░░░ /// ░░░░░░ EVAL GRU │
│ HCP 5,5            │ GRUNN U1-12   SPES   TURN U20-32 FERIE TURN EVAL GRU │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ [MP] MARKUS R. P.  │ █████████████████ ▓▓▓▓▓▓ ░░░░░░░░░░░░░ EVAL ███████ │
│ HCP 4,2            │ GRUNN U1-14       SPES   TURN U21-34    EVAL GRUNN  │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ [TE] TORA ERIKSEN  │ ▓▓▓▓ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ EVAL GRUN │
│ HCP 1,8            │ SPES TURN U5-44 ──────────────────────── EVAL GRUNN │
│                    │             ░ FERIE U28-30 ░                        │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

**Periode-blokker (specs):**
- Høyde: 40px per rad (8pt-grid)
- Padding spiller-info-kolonne: 12px 16px
- Avatar: 32px sirkel, initial i Instrument Serif på forest-flate
- Navn: Geist 500 13px
- HCP + status: Tiny (10px Geist caps tracking 0.1em) muted-fg
- Periodeblokk-hjørner: radius-xs (2px) — tabular feel, ikke kort-feel
- Innskrift i periodeblokk:
  - Hvis blokken er bred nok (≥4 uker / 88px): italic Instrument Serif 11px
    + JBM-uke-tall 10px, format `SPES U1-8` eller `TURN U9-44`
  - Hvis trang (<4 uker): kun forkortelse + uke-start, eks `SPES U1`
- Ferie-blokk overlapper TURNERING-blokken: stripet pattern legges OVER
  TURN-blokken i samme rad (z-index 2 over base), centered vertikalt med
  4px topp/bunn-inset slik at TURN-fargen så vidt synes under

**Hairline-rader:**
- Mellom rader: 1px solid var(--ak-border) (subtilt — newsprint-bunn gir
  allerede separasjon)
- Ingen vertikale uke-gridlines (Atlas-prinsipp — ren tabell-feel)
- Unntak: i dag-markør (U20) får vertikal stiplet 1px forest gjennom hele
  Gantt-høyden

**Hover/klikk-states:**
- Hover periodeblokk: scale(1.02), brightness(1.05), shadow-1
- Klikk: åpne side-panel høyre (se spread 6)
- Hover uke-kolonne (alle rader): bg cream 50% alpha vertikalt
- Klikk diamant: tooltip med turnerings-navn + datoer + spillere som
  deltar

### Spread 4 — Pyramide-volum-graf (Data Story, 12-col)

Bakgrunn: cream-warm #F5EFE2 (overgang fra Atlas-newsprint til Field Notes-
warm).

```
EYEBROW: PYRAMIDE-VOLUM · 52 UKER · AGGREGERT 6 SPILLERE

[52 stablede søyler à 20-22px bred, 64px høy, FYS bunn → TURN topp]

U1 ──────── U20 ──────── U52
          (i dag)

LEGEND:  [FYS] [TEK] [SLAG] [SPILL] [TURN]
```

- Hver søyle 20-22px bred (samme bredde som Gantt-uke-kolonne så de
  ligger justert vertikalt under Gantt)
- 5 pyramide-fargene stables fra bunn (FYS mørkest) til topp (TURN lyst lime)
- Hover på søyle: tooltip med uke-nummer + prosentvise fordeling per
  pyramide
- Stiplet vertikal forest-linje på U20 (i dag-markør)
- Annotasjons-pil med SVG (stroke-dashoffset animasjon) som peker fra
  italic-tekst ned mot uke 28 (turneringspeak):
  *"Uke 28 — TURN dominerer. Norges Cup R2 + Srixon overlapp."*
- Annotasjon nr 2 ned mot uke 49:
  *"Uke 49 — alle i GRUNN/EVAL. Reset-uke før neste sesong."*

Legend nederst: 5 chip-rader med pyramide-fargen + label.

### Spread 5 — Field Notes (Kollisjons-marginalia, 8+4)

Bakgrunn: cream-warm #F5EFE2 (Field Notes-arketype). Italic-tunge
observasjoner om de 2 avdekkede kollisjonene + Caddie-observasjon.

**Venstre 8-col:**

```
FELTNOTATER — KOLLISJONER & OVERGANGER

*Tre overlapp i juni-juli. To bevisste. Én å passe på.*

─────────────────────────────────────────────

01  ØYVIND ROHJAN · U28-30
    Ferie inni TURN-blokk U9-44
    *Bevisst — pause etter European Amateur.*
    *Ingen turneringer plassert disse ukene.*
    Markert: 12.05.2026 · Status: godkjent

02  IDA BJØRKLUND · U33-35
    Ferie mellom to TURN-perioder
    *Sommerstopp. Re-entry uke 36 —*
    *sjekk Trackman før neste turnering.*
    Markert: 14.05.2026 · Status: godkjent

03  TORA ERIKSEN · U28-30
    Ferie inni TURN-blokk U5-44
    *Speilet Øyvinds pause — bevisst.*
    *To av seks tar pause samme uker.*
    Markert: 12.05.2026 · Status: godkjent
```

Hver rad: rad-nummer i JBM 28px venstre, italic-fragment i Instrument
Serif 16px hovedstemme, metadata i Tiny caps muted-fg.

**Høyre 4-col — Caddie-marginalia:**

```
        ↘
   *Caddie observerer:*

   *Markus har lengste TURN-*
   *blokk i porteføljen — 14*
   *uker uten EVAL-vindu.*

   *Vurder en mini-EVAL i U28*
   *før Klubbmesterskap U34.*

   ──

   *Tora har 40 uker TURN —*
   *mest av alle. Sjekk*
   *belastnings-score U22.*
```

Med SVG-pil (stroke-dashoffset 1200ms) fra teksten ned mot Markus-raden
i Gantt-spread over.

### Spread 6 — Side-panel (overlay, ikke inline)

Vises NÅR Anders klikker en periodeblokk. På desktop: slide-fra-høyre,
400-480px bred, full høyde. Backdrop-blur over Gantt.

```
┌──────────────────────────────────────┐
│  ← Tilbake                            │
│                                       │
│  MARKUS PEDERSEN                     │
│  *TURN U16-38*                        │
│                                       │
│  14 uker turnering.                  │
│  *Endte med Klubbmesterskap GFGK U34.*│
│                                       │
│  ───                                  │
│                                       │
│  PERIODE-METADATA                    │
│                                       │
│  Start          12.04.2026 · U16     │
│  Slutt          20.09.2026 · U38     │
│  Varighet       23 uker · 161 dager  │
│  Turneringer    2                    │
│                                       │
│  ───                                  │
│                                       │
│  PYRAMIDE-VEKT                       │
│                                       │
│  SPILL  ████████████ 32%             │
│  TURN   ██████████   28%             │
│  TEK    ████████     22%             │
│  SLAG   █████        14%             │
│  FYS    █            4%              │
│                                       │
│  ───                                  │
│                                       │
│  CADDIE-OBSERVASJON                  │
│                                       │
│  *Markus har lengste TURN-blokk i*   │
│  *porteføljen. Vurder en mini-EVAL*  │
│  *i U28 før Klubbmesterskapet.*      │
│                                       │
│  ───                                  │
│                                       │
│  [Endre periode →]                   │
│  [Splitt i to →]                     │
│  [Slett periode]                     │
└──────────────────────────────────────┘
```

Panel-specs:
- Header padding 24-32px
- Hairlines 1px var(--ak-border) mellom seksjoner
- Periode-metadata som dl/dt/dd-stil, JBM på alle tall
- Pyramide-vekt-bars: 18.3 horizontal bar chart
- Caddie-observasjon: italic Instrument Serif 16px
- 3 pull-tabs nederst: primary (forest), secondary (border), destructive

### Kolofon nederst:
```
COACHHQ · KALENDER · Utgave 048 · Søndag 17. mai 2026 · Trykket digitalt fra Fredrikstad
Redaktør: Anders Kristiansen · Head Coach · A-lisens NGF · AK Golf Group AS
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Padding 24-32px hver side. Gantt er
fortsatt utfordringen — vi har 960px innholdsbredde, og 52 × 20px = 1040px.
**Strategi: komprimer uke-bredden til 16-18px og paginer-knapp for å se
spillere 4 ad gangen** (vise 4 spillere → klikk "Vis neste 2 spillere" for
å bytte til de 2 nederste + 2 fra topp).

```
┌──────────────────────────────────────────────────────────┐
│ COACHHQ · KALENDER · ÅR 2026 · U20         🔍 ⌘         │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HUB] [SPILLERE] [BOOKING] [STRIPE] [CADDIE] [KAL ●]    │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (52px italic-tittel "52 uker, 6 spillere.")        │
│                                                            │
│ TOOLBAR (kompakt — år+filter venstre, ny periode høyre)  │
│ ─ Visning: [Alle 6 ▾] [Pag. 1/2 ◀▶]                     │
│                                                            │
│ ATLAS — GANTT (full-bredde, 4 spillere ad gangen)        │
│ — Uke-bredde 18px, 52×18=936px                           │
│ — Spillere 1-4 vises, paginer for 5-6                    │
│ — Diamanter + 7-dagerslås beholdes                       │
│                                                            │
│ PAGINER: [● 4 av 6] [○ 2 av 6]                          │
│ [◀ Forrige spillere] [Neste spillere →]                  │
│                                                            │
│ PYRAMIDE-VOLUM-GRAF (kompakt, 48px høy)                  │
│                                                            │
│ FIELD NOTES (kollisjoner, 2-col komprimert)              │
│                                                            │
│ KOLOFON                                                   │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 52px (var 64)
- Toolbar: kompakt en linje med pagineringsindikator
- Gantt: 4 spillere ad gangen, uke-bredde 18px (komprimert fra 22px)
- **Paginerings-knapp under Gantt**: viser hvilke spillere som er aktive
  (Øyvind, Sofie, Lars, Ida) + neste-knapp som scroller til (Lars, Ida,
  Markus, Tora) — 2 spillers overlap for kontinuitet
- Pyramide-volum: 48px høyde (var 64)
- Field Notes: kompakt 2-col, 3 kollisjons-rader stables
- Side-panel: full-screen modal i stedet for slide-høyre
- Touch-targets min 44px (periodeblokk = full rad-høyde tap)
- ⌘K → søke-ikon

**Alternativ for iPad — vertikal Gantt:** Hvis paginering føles for
tungvint, kan vi i fremtidig iterasjon snu Gantt 90° (uker vertikalt,
spillere horisontalt). For denne første versjonen: paginering.

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Single column. Padding 16-20px hver side.

**Gantt på iPhone fungerer IKKE — 52 uker × 6 spillere er minimum 1144px
bredt og vil bli ulesbart hvis vi krymper til 360px.**

**I stedet leverer vi tre komplementære visninger:**

1. **Mini-årshjul** (sirkulær graf, 52 uker som "klokke") — visuell
   oversikt
2. **Per-spiller drill-down** — liste over 6 spillere, tap åpner deres
   personlige 52-ukers tidslinje (vertikal, stablet)
3. **Kommende perioder-liste** — flat liste av neste 8 ukers periode-
   overganger på tvers av alle spillere

```
┌─────────────────────────┐
│ KALENDER · ÅR 2026  🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● COACHHQ · KALENDER    │
│   ÅRSPLAN 2026 · U20    │
│                          │
│ 52 uker.                 │ ← Cover-tittel 40px
│ *Seks spillere.*         │
│ *Tre kollisjoner.*       │
│                          │
│ ─────                    │
│                          │
│ MINI-ÅRSHJUL             │
│                          │
│      ●◆●                 │
│    ●     ●               │ ← Sirkulær graf,
│   ●  U20 ●               │   52 uker som klokke-
│  ●   I    ●              │   posisjoner. Du står
│   ●  DAG ●               │   på U20 (mai),
│    ●     ●               │   markert med stor
│      ●●●                 │   forest-prikk.
│                          │   Diamanter for
│  *Mai · Uke 20*          │   turneringer rundt
│  *Klubbmesterskap GFGK*  │   sirkelen.
│                          │
│  Neste turnering om      │
│  *6 dager · 23. mai*     │
│  Norges Cup R1, Hauger   │
│                          │
│ ─────                    │
│                          │
│ KOMMENDE OVERGANGER      │
│                          │
│ ●●●●● U21 · OM 7 DAGER   │
│ ALLE · 7-dagerslås start │
│ *Norges Cup R1.*         │
│                          │
│ ●●●●○ U22 · OM 14 DAGER  │
│ Øyvind, Sofie, Tora      │
│ *Olyo Cup · Bossum.*     │
│                          │
│ ●●●○○ U24 · OM 28 DAGER  │
│ Øyvind                   │
│ *European Amateur.*      │
│                          │
│ ●●●○○ U28 · OM 56 DAGER  │
│ Øyvind, Tora             │
│ *FERIE-uke (bevisst).*   │
│                          │
│ ─────                    │
│                          │
│ SPILLERE                 │
│ (tap for tidslinje)      │
│                          │
│ ┌─────────────────────┐  │
│ │ [ØR] ØYVIND ROHJAN  │  │
│ │ HCP +3,5            │  │
│ │ Nå: TURN U9-44      │  │
│ │ *Tour-aspirant*     │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ┌─────────────────────┐  │
│ │ [SL] SOFIE LARSEN   │  │
│ │ HCP +0,8            │  │
│ │ Nå: TURN U18-36     │  │
│ │ *NM-medalje*        │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ┌─────────────────────┐  │
│ │ [LH] LARS HANSEN    │  │
│ │ HCP +1,2            │  │
│ │ Nå: TURN U7-44      │  │
│ │ *Junior elite*      │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ┌─────────────────────┐  │
│ │ [IB] IDA BJØRKLUND  │  │
│ │ HCP 5,5             │  │
│ │ Nå: TURN U20-32     │  │
│ │ *Junior jenter*     │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ┌─────────────────────┐  │
│ │ [MP] MARKUS R. P.   │  │
│ │ HCP 4,2             │  │
│ │ Nå: SPES U15-20     │  │
│ │ *Stigende form*     │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ┌─────────────────────┐  │
│ │ [TE] TORA ERIKSEN   │  │
│ │ HCP 1,8             │  │
│ │ Nå: TURN U5-44      │  │
│ │ *Senior dame*       │  │
│ │                  →  │  │
│ └─────────────────────┘  │
│                          │
│ ─────                    │
│                          │
│ FELTNOTATER · CADDIE     │
│                          │
│ *Markus har lengste*     │
│ *TURN-blokk — 14 uker.*  │
│ *Vurder mini-EVAL U28.*  │
│                          │
│ *Tora har 40 uker TURN.* │
│ *Sjekk belastning U22.*  │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ [+ Ny periode →]         │ ← Sticky CTA over tab-bar
├─────────────────────────┤
│ 🏠 👥 📅 💳 🤖           │ ← Bottom tab-bar 56px
└─────────────────────────┘
```

**Per-spiller-tidslinje (når Anders tap-er en spiller-card):**

Full-screen drill-down. Vertikal tidslinje, 52 uker stables nedover. Hver
uke som 56px rad med periode-fargen + uke-tall + periode-tag. Diamanter
inline ved turnerings-uker. 7-dagerslås som gul border-left fortsatt.

```
┌─────────────────────────┐
│ ← TILBAKE      ØYVIND  │
├─────────────────────────┤
│                          │
│ ØYVIND ROHJAN            │
│ *Tour-aspirant · HCP+3,5*│
│                          │
│ 2026 · 52 uker           │
│                          │
│ ─────                    │
│                          │
│ ▓▓ U1   SPES             │
│ ▓▓ U2   SPES             │
│ ...                      │
│ ▓▓ U8   SPES             │
│ ──                       │
│ ▒▒ U9   TURN             │
│ ▒▒ U10  TURN             │
│ ...                      │
│ ▒▒ U20  TURN ● i dag    │
│ ◆ ▒▒ U22  TURN · Olyo   │
│ ◆ ▒▒ U24  TURN · Eur Am │
│ ...                      │
│ //  U28  FERIE           │
│ //  U29  FERIE           │
│ //  U30  FERIE           │
│ ▒▒ U31  TURN             │
│ ...                      │
│ ▒▒ U44  TURN             │
│ ── EVAL ── GRUNN ──      │
│ ▓▓ U45  EVAL             │
│ ...                      │
│ ▓▓ U52  GRUNN            │
│                          │
└─────────────────────────┘
```

**Mini-årshjul (specs):**
- SVG sirkel, viewBox 0 0 320 320, sentrert i ~280px container
- 52 ticks rundt sirkelen (hver 6,9°), 4px lange forest-streker fra
  ytterring 140 til 144 radius
- Måned-tags i Tiny caps caps inni sirkelen (Jan, Feb, ..., Des) på
  riktig posisjon, italic-stil
- I dag-markør (U20): 12px forest-fylt sirkel + animert ring
- Turnerings-diamanter (◆): 8px rotert squares utenfor ringen ved riktig
  uke, lime-fyll
- Sentrum: Cover-tittel "*Mai · Uke 20*" italic 18px + sub-tag
- Hover/tap på diamant: tooltip med turneringsnavn

**Tilpasninger fra desktop:**
- Cover-tittel: 40px (var 64)
- Lead body: 15px (var 16)
- Ingen Gantt — tre komplementære visninger
- Mini-årshjul som primær overblikk
- Kommende overganger-liste (8 neste uker)
- Per-spiller drill-down via card-tap
- Sticky bunn: "+ Ny periode →" CTA
- Side-panel: full-screen modal slide-fra-bunn

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Gantt-render** (desktop/iPad): perioder fade-up med stagger venstre→høyre
  (20ms delay per uke, 800ms total) — gir feel av tidsliner som tegnes
- **7-dagerslås gul border** tegnes inn (200ms ease-out, etter Gantt)
- **Turnerings-diamanter** scale-pop 0.4 → 1.0 stagger (50ms delay/diamant)
- **Mini-årshjul** (iPhone): ticks tegnes med stroke-dashoffset (1200ms),
  i dag-markøren scale-pop sist
- **Pyramide-volum-søyler**: stables nedenfra med stagger (10ms/søyle,
  height 0 → final)
- **Hover periodeblokk**: scale(1.02) + brightness(1.05) + shadow-1
- **Klikk periodeblokk**: side-panel slide-fra-høyre (desktop/iPad) eller
  fra-bunn (iPhone), 300ms ease-out
- **Hover diamant**: tooltip med turneringsnavn + datoer + spillere som
  deltar, scale-pop 0.96 → 1.0
- **Hover uke-kolonne** (desktop/iPad): cream 50% alpha bg vertikalt
  gjennom hele Gantt
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Pulserende live-prikk** i eyebrow (2s loop)
- **Inline confirmation** når periode endres: forest accent-strek fade-in
  venstre for endret rad + italic-callout *"Periode oppdatert."*
  (300ms fade, dwell 2s)
- **Mini-årshjul i dag-markør**: pulserende ring (2s loop)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon.

**20+ KALENDER-spesifikke kommandoer** i kategorier:

**Visninger**
- Vis Årsplan
- Vis Måned (mai 2026)
- Vis Uke (U20)
- Vis Dag (i dag)
- Bytt til Liste-visning
- Bytt til Gantt-visning

**Filtrer**
- Vis kun Øyvind
- Vis kun elite-spillere (HCP < +2)
- Vis kun TURNERING-perioder
- Vis kun FERIE-perioder
- Vis kun kollisjoner
- Vis 7-dagerslås-uker
- Reset filtre

**Naviger**
- Hopp til uke 20 (i dag)
- Hopp til uke 22 (Olyo Cup)
- Hopp til uke 24 (European Amateur)
- Hopp til uke 28 (Norges Cup R2)
- Hopp til U52 (årets slutt)
- Hopp til U1 (årets start)

**Handlinger**
- Ny periode for Øyvind
- Ny periode for Markus
- Ny turnering 2026
- Aktiver 7-dagerslås for U22
- Eksporter Årsplan som PDF
- Del Årsplan med spiller (lese-tilgang)
- Marker kollisjon U28-30 som bevisst

**Periode-typer**
- Sett alle inn i GRUNN (off-season U49-U52)
- Bulk-flytt SPES → start uke 8
- Lag standardmal: 12 GRUNN + 7 SPES + 18 TURN + 4 EVAL

**Sammenligning**
- Sammenlign Øyvinds 2026 med 2025
- Sammenlign Markus vs Lars (samme alder)
- Vis total TURN-uker per spiller

**Kollisjoner & Caddie**
- Vis alle kollisjoner
- Be Caddie foreslå optimal periodisering
- Be Caddie sjekke belastning U22

**Hjelp & innstillinger**
- Snarveier
- Bytt år
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke. Vis "Sist brukt"-seksjon øverst
med Anders' 3 mest brukte kommandoer.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:900px; overflow:hidden;">
    <!-- Desktop layout -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:768px; overflow:hidden;">
    <!-- iPad layout -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone layout -->
  </div>
</section>
```

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPad-utgave —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility, ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående
- All interaktivitet fungerer (Gantt-render, diamant-tooltip, side-panel
  slide-in, mini-årshjul stroke-dashoffset)

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker Årsplan-en** — hvordan Atlas-arketypen
   bevares uten å bli "Gantt-software", og hvordan typografien holder
   datatettheten lesbar
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
   (særlig: hvordan kan vi unngå iPad-paginering? er mini-årshjul nok
   verdi på iPhone, eller burde vi heller stable mini-Gantt vertikalt?)
3. **Hva du er usikker på** — hvor trenger du Anders' input?
