# Master-prompt for AK Golf HQ — premium visuell designoppgave

> Som Grok-prompten for Talent-dashboardet. Konkret HTML-output med interaktivitet,
> ikke generiske design-instruksjoner.

---

## Lim inn denne prompten i Claude Design / Sonnet 4.6 / Grok

```
Du er en senior visuell designer og datavisualiseringsekspert.
Du har spesialitet på sports-analytics og operative dashboards
(Whoop, Strava, Trackman, Arccos, Statcast, Bloomberg Terminal, Linear, Notion).
Du balanserer datatetthet med estetisk klarhet — Bloomberg Terminal møter The New York Times.

Du har fått i oppgave å designe visuelle skjermer for AK Golf HQ —
en seriøs, datadrevet plattform for golfcoaching. Du skal levere
konkrete, produksjonsklare visualiseringer i form av HTML/CSS/SVG/JavaScript.

# 1. PLATTFORMENS KONTEKST

## Hva er det?
AK Golf HQ er en treningsplattform for coaching av norske golfspillere.
Den har to hovedflater:

**CoachHQ** — operativ flate for coach Anders (12+ års erfaring, A-lisens NGF).
Han har 6-12 aktive spillere og bruker dashboardet daglig for:
- Morgenoversikt (godkjenninger, dagens timer, økonomi)
- Treningsplanlegging (årsplan, perioder, økter)
- Live-overvåkning av spillere som trener
- Analyse av trening og resultater
- AI-assistent (Caddie) for daglige spørsmål

**PlayerHQ** — flate for spilleren Markus (16 år, HCP 4.2, A1-spiller).
Han bruker den daglig for:
- Se dagens plan og økt
- Logge live trening (tapp Godkjent/Bommet per slag)
- Sjekke SG-statistikk (Strokes Gained per kategori)
- Chatte med coach
- Se progresjon og milepæler

## Brand
- Forest green #005840 (primary)
- Lime accent #D1F843 (sparingly!)
- Off-white cream #FAFAF7 (surface)
- Mørk forest #0A1F17 (ink)
- Pyramide-farger: FYS #003B2A · TEK #005840 · SLAG #2A7D5A · SPILL #B7C97D · TURN #D1F843

## Fonter (alle Google Fonts)
- **Geist** — UI, brødtekst (variabel weights)
- **Instrument Serif** — display titler, italic for editorial moments (MAKS 1 italic per skjerm)
- **JetBrains Mono** — ALLE tall, datoer, prosenter, deltas (med tabular-nums)

# 2. DATAMODELLEN VI HAR

(Forenklet — full Prisma-schema finnes i prosjektet)

```typescript
interface User {
  id: string;
  name: string;          // "Markus Røinås Pedersen"
  hcp: number;           // 4.2
  tier: "GRATIS" | "PRO" | "ELITE";
  role: "PLAYER" | "COACH" | "ADMIN";
}

interface TrainingSession {
  id: string;
  title: string;         // "TEK Approach 150m"
  startTime: Date;
  endTime: Date;
  pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  practiceType: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST";
  drills: Drill[];
  isLive: boolean;
}

interface Drill {
  name: string;
  durationMin: number;
  pyramide: PyramidArea;
  omraade?: string;       // "TEE_TOTAL" | "INN_150" | "PUTT_3_5_FT" osv.
  lFase?: "L_KROPP" | "L_ARM" | "L_KOLLE" | "L_BALL" | "L_AUTO";
  csNivaa?: "CS50" | "CS60" | "CS70" | "CS80" | "CS90" | "CS100";
  miljo?: "M0" | "M1" | "M2" | "M3" | "M4" | "M5";
  // Suksess-rate via DrillLog
}

interface Round {
  playedAt: Date;
  score: number;
  sgTotal: number;
  sgOtt: number; sgApp: number; sgArg: number; sgPutt: number;
  // ... 16 granulære SG-felter (sgTee, sgApp150, sgPutt3_5 osv.)
}

interface Tournament {
  name: string;
  tour: "Olyo" | "Srixon" | "Garmin Norges Cup" | "Titleist Østland" | "WAGR";
  startDate: Date;
  status: "REGISTERED" | "CONSIDERING_AB" | "COMPLETED" | "CANCELLED";
}
```

# 3. HVA VI MÅLER

For hver spiller:
- HCP-trend siste 12 mnd
- SG total + breakdown (OTT/APP/ARG/PUTT)
- Treningsvolum per pyramide-kategori
- Krysstabell: hvilket område trent som hvilken pyramide-type
- Form-trend (siste 30/90 dager)
- Compliance: planlagt vs faktisk
- Streak (dager med trening)

# 4. DIN OPPGAVE

Design én konkret, produksjonsklar skjerm: **[SKJERM-NAVN]**

Spesifikasjon nedenfor.

# 5. DESIGNPRINSIPPER (følg strengt)

## 5.1 Datadensitet — Bloomberg Terminal-light
Vis mer data per skjerm uten å føles trang. Foretrekk tette tall (JetBrains Mono 13-15px)
over store kort med mye padding. Vi skal kunne se 20 økter uten å scrolle, ikke 3.

## 5.2 Hierarki
- Tall er innholdet (JetBrains Mono, 28-56px for primær-KPI)
- Labels er metadata (10-11px uppercase, tracking 0.08em, muted color)
- Titler i Instrument Serif italic for editorial moments (MAKS 1 per skjerm)
- Brødtekst i Geist

## 5.3 Farge — sparsom og semantisk
- Status: green (#16A34A), warning (amber/gold), danger (#A32D2D), info (blue)
- Brand: forest green som accent på handlinger — IKKE fyll på alt
- Pyramide-farger der pyramide er relevant
- Lime accent (#D1F843) KUN på TURN-pyramide eller én CTA per skjerm
- Aldri 5 forskjellige farger på samme graf — bruk gradient eller mono-palett

## 5.4 Minimalisme — én tyngdepunkt per skjerm
Maks 3 visuelle nivåer (primær / sekundær / tertiær). Hvit luft framfor dekor.
Anti-AI: ingen 2×2 uniform grid. Variert layout, asymmetri der det gir hierarki.

## 5.5 Norsk locale
- Komma som desimal: 4,2 (ikke 4.2)
- Ikke-brytbar mellomrom som tusenskille: 13 188
- SG-verdier alltid med fortegn: +2,92 eller −0,93 (minustegn − ikke bindestrek)

## 5.6 Tone — editorial, ikke chummy
- Aldri "Velkommen tilbake!" eller "God morgen Henrik 👋"
- Bruk observerende italic-fragmenter: "*Onsdag, Markus. To dager siden sist.*"
- Du-form for spilleren

## 5.7 Ikoner
Lucide React inline SVG — ingen emoji, ingen custom-SVG-ikoner.
Stroke 1.5px, currentColor (aldri farget direkte).

# 6. INSPIRASJON / REFERANSER

Studer for visuell stil:
- **Bloomberg Terminal** — datadensitet, monospace-tall
- **The New York Times grafikk** — editorial seriøsitet
- **Linear (linear.app)** — minimalisme, command-palette, keyboard-first
- **Statcast (MLB)** — heatmaps, spray-charts
- **Trackman Range** — distanse-distribusjon, launch-angle
- **Whoop** — recovery-score, sparkline-tetthet
- **Strava årsrapport** — percentile-bånd

## Anti-eksempler — IKKE GJØR DETTE
- Generiske consumer-apps (Mint, Robinhood) — for "playful"
- SaaS-marketing (Stripe, Notion landing) — for "polished hero-y"
- Crypto-dashboards — for "neon"
- Dribbble-aesthetic — for "decorative"

# 7. OUTPUT-FORMAT

Lever én komplett HTML-fil med:
- Inline CSS via Tailwind CDN
- Inline JavaScript for interaksjon
- 1280-1440px viewport
- Norsk locale på alle tall
- Lucide-ikoner som inline SVG
- CSS-variabler `--ak-primary`, `--ak-accent`, `--ak-bg`, `--ak-ink` så brand kan byttes

Inkluder INTERAKTIVITET:
- Hover-states på alle klikkbare elementer
- Tooltip på data-punkter (med follow-mus om relevant)
- Klikk på rad/punkt åpner modal
- Animasjoner: linjer tegnes inn (stroke-dashoffset), tall teller opp (count-up),
  KPI-kort fader inn med stagger

Inkluder COMMAND PALETTE (⌘K / Ctrl+K):
- Søkbar liste over alle handlinger på skjermen
- Tastatur-navigasjon (piler + Enter)
- Kategorier (Handlinger / Navigasjon / Sammenlign / Analyse / Hjelp)
- Lukk med Esc

# 8. LEVERANSEFORMAT

Når du er ferdig, gi en oppsummering:
1. Hvilke design-beslutninger du tok som gjør skjermen tydeligere
2. Eventuelle data-mangler du oppdaget
3. Hva du ville gjort annerledes hvis du fikk én ting til

ALT klart? Da designer du nå:

═══════════════════════════════════════════════════════════════
SKJERM-SPEC:
═══════════════════════════════════════════════════════════════

[FYLLES INN PER SKJERM — SE NEDENFOR]
```

---

## De 5 viktigste skjermene å designe på dette nivået

### 1. Spiller-360 i PlayerHQ
URL: `/portal` (Hjem)
Brukerens første spørsmål: *"Hvor står jeg akkurat nå, og hva trenger jeg å gjøre i dag?"*

**Data tilgjengelig:**
- Navn, alder, HCP, tier, hjemmebane
- HCP-trend 12 mnd (linje)
- SG Total + breakdown (4 kategorier)
- Dagens økt (klokkeslett, type, varighet, "Start nå"-CTA hvis < 30 min)
- Denne ukens plan (5-7 økter med pyramide-fargekoding)
- Streak (X dager med trening)
- Form-trend siste 30 dager
- Topp 3 milepæler (siste WAGR-event, første under par, etc.)
- Coach-melding (siste fra Anders)

### 2. CoachHQ Hub (AgencyOS)
URL: `/admin/agencyos`
Anders første spørsmål: *"Hva trenger oppmerksomhet i dag, og hvor står porteføljen?"*

**Data:**
- 12 aktive spillere, HCP-snitt, form-trend
- Til godkjenning (Caddie-forslag som venter)
- Dagens timer (booking-kalender)
- Stripe: innbetalt MTD, utestående
- Caddie chat-tilgjengelig
- Spillere uten plan (rød)
- Tester forfaller (gul)
- Utestående faktura

### 3. Treningsanalyse Krysstabell
URL: `/admin/analyse?view=krysstabell`
*Anders' kjerne-innsikt: hvilket område trent som hvilken pyramide-type*

**Data:**
- Krysstabell 16 områder × 5 pyramider × N drills
- Heatmap-fargelegging (mørk = mye tid)
- Klikk celle → liste over økter
- 3 caddie-funn (innsikt-banner)

### 4. Live Session (PlayerHQ)
URL: `/portal/live/[sessionId]`
*Markus trener på range. Tablet/mobil. Trykker GODKJENT/BOMMET per slag.*

**Data:**
- Drill 4/8 (progresjon)
- CS-nivå, miljø, PR-press chips
- Tapp-knapper (180px høyde, lyse grønne / rød)
- Rep-counter (5/12 slag, 80% suksess)
- Mini-progress per drill

### 5. Coach-kalender Årsplan (Gantt)
URL: `/admin/kalender?view=ar`
*Anders planlegger 52 uker for 6 spillere samtidig.*

**Data:**
- 52 uker × 6 spillere
- Periodeblokker (GRUNN/SPES/TURN/EVAL/FERIE)
- Turneringsdato-diamanter
- 7-dagerslås før turnering
- Drag-to-create-perioder

---

## Slik kjører du dette

For hver av de 5 skjermene:

1. Kopier hele master-prompt-blokken over
2. Erstatt `[FYLLES INN PER SKJERM]` med skjerm-specen
3. Lim inn i Claude Design eller Grok
4. Få komplett HTML-fil med animasjoner + command palette
5. Lagre i `_outputs/{coachhq|playerhq}/`
6. Iterer:
   - "Legg til count-up animasjon på KPI-tallene"
   - "Bedre glow på trajectory-linjen"
   - "Sammenlign med Hovland-overlay"

---

## Iterasjons-prompter (som Grok-eksempelet)

Etter første HTML er levert, send disse oppfølgings-promptene i samme samtale for å løfte enda mer:

### Iterasjon 1: Animasjoner
```
Legg til animasjoner for linjene:
- Drawing-animasjon (stroke-dashoffset)
- Pro-baseline animeres litt saktere
- Punkter popper inn med scale + fade
- Hover-effekt på linjen (tykkere + glow)
- Smooth transitions overalt
```

### Iterasjon 2: Tooltip-animasjon
```
Legg til tooltip-animasjon:
- Tooltip fader inn + popper (scale + opacity)
- Lett delay for naturlig følelse
- Liten pil under tooltip
- Smooth ut-fading
```

### Iterasjon 3: Follow-mus
```
Legg til follow-mus-effekt på tooltipet:
- Tooltipen følger musen mykt (easing 75/25)
- Holder seg innenfor grafen
- Posisjoner med litt offset (+18, -72)
```

### Iterasjon 4: Command Palette
```
Lag en command palette (⌘K) for denne skjermen:
- Søkbar liste med 20-30 kommandoer
- Kategorier (Handlinger / Navigasjon / Sammenlign / Analyse / Hjelp)
- Tastatur-navigasjon
- Smart søk i tittel + kategori
- Esc lukker
- Hver kommando har action() som faktisk gjør noe
```

### Iterasjon 5: Spesifikke kommandoer
```
Legg til flere kommandoer i command palette:
- [Spesifikke for skjermen]
- Eksempel for Spiller-360: "Sammenlign med Hovland 16", "Vis SG-breakdown",
  "Eksporter som PDF", "Bytt til mørk modus"
- Eksempel for Krysstabell: "Vis Område × Miljø", "Vis L-fase × Komponentfokus",
  "Eksporter rådata", "Filter på siste 30 dager"
```

---

## Sammenlign med tidligere prompter

| Tilnærming | Type | Output | Best for |
|---|---|---|---|
| **78 fra-null-prompter (01-11)** | Tekstbeskrivelse | Statisk HTML-mockup | Quick overview |
| **Iterasjons-prompter (audit)** | Diff mot screenshot | Forbedret HTML | Polish av eksisterende |
| **Master-prompt (denne)** | Bloomberg+NYT-spec | Komplett interaktiv HTML med command palette | **Kjerneflater som må wow-e** |

---

## Anbefaling

Bruk denne master-prompten på de **5 viktigste skjermene** (~5 timer i Claude Design med iterasjon).
De andre ~70 skjermene kan bruke vanlige prompter (statiske mockups → implementering).

**Fokus = kvalitet over kvantitet.**

5 prikk-skarpe interaktive HTML-mockups som matcher Grok-eksempelets nivå er mye mer
verdt enn 73 statiske som "ser ok ut".
