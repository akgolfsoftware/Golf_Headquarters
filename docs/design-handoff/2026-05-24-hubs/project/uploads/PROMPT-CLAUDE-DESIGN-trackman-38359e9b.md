# Claude.ai Design-prompt — TrackMan-mål per kølle

> **Bruk:** Lim inn hele under linjen i ny samtale på claude.ai (Sonnet 4.6 / Opus 4.7).
> Claude lager Artifact for TrackMan-mål-skjermen i AK Golf HQ.

---

# PROMPT (kopier alt under denne linjen)

Du skal designe **TrackMan-mål-skjermen** for AK Golf HQ sin Teknisk Utviklingsplan-modul. Lever som React Artifact (single-file, kun `react` + `lucide-react` + Tailwind).

## Kontekst

AK Golf Academy bygger elite-amatører og topjuniorer (WANG Toppidrett, GFGK Junior, college-bound spillere). En del av spillerens **Tekniske Utviklingsplan** er **kølle-spesifikke TrackMan-mål** — kølle for kølle setter coach målet for hva spilleren skal oppnå denne perioden.

Dette er et eget skjerm i AK Golf HQ — `/portal/tren/teknisk-plan/[id]/trackman` for spiller og `/admin/spillere/[id]/teknisk-plan/trackman` for coach. Skjermen viser **én plan med 12-14 køller** og deres respektive mål-tall.

## Hva TrackMan måler — målingene som matter

**Ball-data** (det viktigste for resultat):
| Måling | Enhet | Hva det betyr |
|--------|-------|---------------|
| Ball Speed | mph | Hovedmål for fart fra slag |
| Smash Factor | ratio | Ball speed / Club speed — kvalitet av treff |
| Launch Angle | grader | Vinkel ballen forlater face |
| Spin Rate | rpm | Backspin — påvirker høyde og roll |
| Spin Axis | grader | Sidespinn — påvirker dispersion |
| Carry Distance | m | Avstand i luften |
| Total Distance | m | Carry + roll |
| Apex Height | m | Høyeste punkt i flight |
| Land Angle | grader | Vinkel inn mot bakken — påvirker stop |
| Side (Dispersion) | m | Sidekast fra target line |

**Klubb-data** (det tekniske som forklarer ball-dataen):
| Måling | Enhet | Hva det betyr |
|--------|-------|---------------|
| Club Speed | mph | Køllehastighet ved impact |
| Attack Angle | grader | Vinkel kølla beveger seg ved impact (positiv = upward) |
| Club Path | grader | Innenfra/utenfra mot target line |
| Face Angle | grader | Faces forhold til target line |
| Face to Path | grader | Face-vinkel relativ til club path (forklarer ball-flight curve) |
| Dynamic Loft | grader | Faktisk loft ved impact |
| Strike Pattern | x/y | Hvor på face-en treffet skjer |

**Konsistens-målinger** (over flere slag):
- Standard avvik per måling
- "Dispersion ellipse" — 95% konfidens-område for landing
- Smash Factor consistency
- Repeatability score (0-100)

## Kølle-spesifikke benchmarks (realistiske tall for ulike nivå)

Bruk denne tabellen som demo-data — alle tall er fra **scratch-amatør / college-spiller nivå** (HCP +1 til 4):

### Driver
- Ball Speed: **165-172 mph**
- Smash: **≥1.45**
- Launch: **10-12°**
- Spin: **2200-2700 rpm**
- Attack Angle: **+2 til +5°** (upward strike)
- Spin Axis: **±2°** (minimalt sidespinn)
- Carry: **245-265 m**
- Total: **270-290 m**

### 3-tre / Hybrid
- Ball Speed: **155-162 mph**
- Smash: **≥1.40**
- Launch: **12-14°**
- Spin: **3200-3800 rpm**
- Carry: **220-240 m**

### 5-jern
- Ball Speed: **140-148 mph**
- Smash: **≥1.38**
- Launch: **15-17°**
- Spin: **5500-6500 rpm**
- Carry: **175-190 m**
- Dispersion (std): **< 12 m**

### 7-jern
- Ball Speed: **128-135 mph**
- Smash: **≥1.42**
- Launch: **18-20°**
- Spin: **6500-7500 rpm**
- Carry: **145-160 m**
- Dispersion (std): **< 8 m**
- Land Angle: **48-52°**

### 9-jern
- Ball Speed: **115-122 mph**
- Smash: **≥1.32**
- Launch: **22-26°**
- Spin: **8000-9000 rpm**
- Carry: **115-128 m**
- Dispersion (std): **< 6 m**

### PW (pitching wedge)
- Ball Speed: **105-112 mph**
- Smash: **≥1.28**
- Launch: **25-28°**
- Spin: **9000-10500 rpm**
- Carry: **95-108 m**
- Land Angle: **48-54°**
- Dispersion (std): **< 5 m**

### 56°/58° Sand wedge
- Ball Speed: **80-95 mph**
- Spin: **9500-11000 rpm**
- Launch: **30-35°**
- Carry-kontroll: **40m, 60m, 80m** (3 standard avstander)

### Putter
- Roll → Distance kontroll på 3m / 5m / 10m / 20m
- Face angle ved impact: **< 1° avvik**
- Ball roll: **< 6 inches skid**
- Pace consistency: **< 5% varians**

## Skjermen som skal designes

**Layout: 12-kolonne grid**

### Topp-header
- Crumb: PlayerHQ › Markus R.P. › Teknisk plan › TrackMan-mål
- Italic h1: "TrackMan-mål · vår 2026" (ev. "vår 2026" i primary)
- Meta-rad: Spiller / Coach / Periode / Sist målt
- 4 KPI-kort: Antall køller med mål · Oppnådd / På vei / Ikke begynt

### Hoved-innhold (3-kolonne på desktop, stack på mobil)

**Kolonne 1: Kølle-velger (sidebar venstre)**
Liste over alle køller med mini-status:
- Driver — På vei (ball speed 76% av mål)
- 3-tre — Oppnådd ✓
- 5-jern — På vei
- **7-jern — Oppnådd ✓** (valgt, fremhevet)
- 9-jern — På vei
- PW — Ikke begynt
- SW — Ikke begynt
- Putter — Ikke begynt

Hver rad: kølle-navn + mini progress-dot + status-tekst.

**Kolonne 2-3: Detail for valgt kølle (7-jern)**

Topp-card:
- Kølle-navn stort (italic font-serif)
- Status-pill (Oppnådd ✓ med grønn)
- Sist målt: "i dag · 14:22 · Mulligan studio"
- "Antall slag i snitt-data: 47" (mono)

**Primær måling (stor card, fremhevet):**
- "Hovedmål: Smash Factor"
- Stor verdi: 1.43 (font-mono, 48px)
- Mål-tekst: "Mål ≥1.42 — oppnådd!"
- Stor progress-bar (grønn, fylt)
- Trend-arrow: ▲ +0.02 siste 30 dager

**Sekundære målinger (2x3 grid med små cards):**
Hver card:
- Måling-navn (label)
- Stor verdi (font-mono)
- Mål-range
- Progress-bar (kort)
- Status (i mål / under / over)

For 7-jern:
- Ball Speed: 132.4 mph / 128-135 (✓)
- Spin Rate: 7 100 / 6500-7500 rpm (✓)
- Launch: 19.1° / 18-20° (✓)
- Attack Angle: -3.2° / -2 til -4° (✓)
- Carry: 152 m / 145-160 m (✓)
- Dispersion (std): 6.8 m / < 8 m (✓)

**Trend-graf (full bredde):**
- Line chart med siste 30 dagers daglig snitt for primær måling
- X-akse: dato
- Y-akse: Smash Factor (1.30 til 1.50)
- Horisontal stiplet linje på mål-verdi (1.42)
- Zone-shading: grønn over mål, rød under
- Tooltips på hover (vis dato + verdi + antall slag)

**Dispersion-visualisering:**
- 2D-plot: x = side, y = avstand fra target
- Hvert slag = liten dot (med opacity for older shots)
- Ellipse for 95% konfidens
- "Center deviation: 1.2m" stat

**Coach-kommentar:**
- Hvis coach har lagt kommentar på denne køllen, vis chat-stil bubble
- "Anders K: Bra utvikling siste 2 uker. Smash-faktor stabil over 1.42. Neste fokus: redusere dispersion (std)."

### Action-bar (bunn)
- "Sett nytt mål" (coach kan justere benchmarks)
- "Importer TrackMan-økt" (last opp ny CSV)
- "Eksporter rapport" (PDF for spiller)
- "Forrige kølle" / "Neste kølle"

## Designsystem (kort)

- **Primær**: #005840 (forest)
- **Accent**: #D1F843 (lime) — for "oppnådd"-status
- **Surface**: #FAFAF7 (cream)
- **Cards**: #FFFFFF med 1px border #E5E3DD
- **Typografi**: Inter (sans), Inter Tight italic (display/hero), JetBrains Mono (tall + labels)
- **Status-farger**:
  - Oppnådd: emerald-500
  - På vei: amber-500 (ochre)
  - Ikke begynt: stone-400
- **Ingen emojis** — bruk Lucide-ikoner (Activity, TrendingUp, Target, Check, Clock, ArrowRight, etc.)

## Tekniske krav

- **Single-file React** (`export default function`)
- **TypeScript** med proper typing for målinger
- **Inline dummy-data** for 8 køller (Driver, 3-tre, 5-jern, 7-jern, 9-jern, PW, SW, Putter)
- **Tailwind** for all styling
- **Responsive** — kolonner stacker på mobil
- **Lucide-ikoner** kun

## Bonus om du har tid

- Mini-simulering av "live data" — knapp som randomiserer dispersion-plot
- Hover-states på trend-graf med tooltips
- Toggle mellom "Snitt siste 7 dager" / "Siste økt" / "Beste 10 slag"

Klar? Lag Artifact og vis meg.
