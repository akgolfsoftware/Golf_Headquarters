# Design-prompt 19 — `/portal/stats` — PlayerHQ stats-dashboard (innlogget)

> Les `00-master-brief.md`.

**Side:** `akgolf.no/portal/stats` — innlogget PlayerHQ-bruker
**Bruker:** PlayerHQ-abonnent eller gratis-konto-bruker som har logget runder
**Hovedoppdrag:** Bli "appen min" — siden brukeren åpner først hver mandag. Skap "klikk for å holde abonnementet"-vane.

---

## Datakilder

```typescript
const PORTAL_STATS = {
  user: { id, name, tier, profileImageUrl },

  // Aggregert fra logged rounds
  totalRunder: 41,
  totalRunderSiste30Dager: 8,
  snittScoreSiste30: 73.2,
  snittScoreSiste90: 74.1,

  // SG-fordeling (estimert eller beregnet fra runder)
  sgTotal: -2.1,
  sgPerKategori: { ott: -0.4, app: -1.5, arg: -0.5, putt: -0.3 },

  // Sammenligning mot Tour
  vsTour: { total: -2.1, ott: -0.4, ... },

  // Bestseason / personal records
  besteRunde: { score, dato, bane, til_par },
  besteSesong: { aar, snitt, antall },

  // Trend
  scoreTrend30Dager: Array<{ dato, score }>,
  sgTrend90Dager: Array<{ dato, sgTotal }>,

  // Insights (AI-genererte eller heuristic-baserte)
  topInsights: Array<{
    kategori,
    type: "warning" | "celebrate" | "info",
    tittel,
    tekst,
    cta?: { tekst, href },
  }>,

  // Sammenligning med peers
  peerComparison: {
    snittPeer: 75.4,           // gjennomsnitt for liknende profil
    rangering: 47,             // av peers
    totalPeers: 142,
  },

  // Neste turnering (hvis bruker har påmelding)
  nesteTurnering: Turnering | null,
};
```

---

## Designoppdrag

**Filosofi:** PlayerHQ er en "dashboard", men trenger ikke være Excel. Det skal være varmt, motiverende, og ALDRI overveldende. Mest-brukte info øverst, dypere ned ettersom du scroller.

### 1. Hero — personlig + tidsbasert

```
God morgen, Anders.
                                          Mandag 25. mai

Du spilte 3 runder forrige uke. Snittet ditt 
forbedret seg 0.8 strokes mot uka før.

         [ Se siste runde → ]    [ Logg ny runde ]
```

- Stort velkomst på top (font-display, italic på fornavn i lime)
- Dato høyre topp
- Kontekstualisert sub (basert på aktivitet)
- 2 CTA-er: én myk (informasjon), én aktiv (handling)

**Variants for tom-state:**

```
Hei Anders.

Du har ikke logget en runde ennå. La oss starte i dag.

         [ Logg første runde → ]
```

### 2. KPI-strip — øvers

```
SISTE 30 DAGER       SISTE RUNDE         BESTE I 2026
73.2                 71 (Bærum)          65 (12. mai)
↓ 0.9 fra forrige    -1 to par           -7 to par
```

Mono caps eyebrows, BIG mono tall, sub med endring/kontekst.

### 3. Score-trend — recharts linjegraf

Linje over siste 30 dager. X = dato, Y = score (invertert). Hover = detalj.

Subtle annoteringer:
- Dotted line for målsette (hvis bruker har satt mål)
- Lime prikker på beste runder
- Tooltip viser runde-detaljer

### 4. SG-PROFIL — vs Tour-snittet

Inline radar-chart (samme som /stats/sg-sammenlign men forenklet):

- Lite radar (300x300)
- Dine 4 SG-kategorier (forest)
- Tour-snitt (0-linje, lime stiplet)
- Under: "Ditt største gap: Innspill (-1.5)" → klikkbar lenke som åpner full sammenligning

### 5. INSIGHTS — AI-stil rekommandasjoner

Stack av insight-cards. Hver insight har:
- Type-ikon (warning = orange, celebrate = lime, info = subtle)
- Tittel (font-display)
- 2-linjers tekst
- Optional CTA (lenke eller knapp)

Eksempler:
```
🎯 CELEBRATE
"Du har forbedret deg 0.9 strokes på 30 dager"
"Det er bedre enn 78% av nordmenn på din HCP. Hva endret du?"

⚠️ WARNING
"Du har ikke logget innspill-data på 14 dager"
"SG: APP er ditt største gap. Logg klubb + avstand for hver innspill."
→ Logg neste runde med klubbvalg

ℹ️ INFO
"Du har en turnering på lørdag — Srixon Tour 6"
→ Se forhåndsvisning av banen
```

Vis 3-5 insights, sortert etter prioritet.

### 6. KOMMENDE TURNERINGER

Hvis brukeren har påmeldinger:

```
DIN PLAN

Lørdag 31. mai      Srixon Tour 6
                    Bærum GK · 3 runder

                    18 norske påmeldt · Du er #5 i ranking
                    
                    [ Forberedelse → ]
```

### 7. SIST SPILT — kronologisk runde-liste

```
SISTE RUNDER

12. mai · Bærum GK · 71 (-1)         Beste i mai
6. mai · Oslo GK · 75 (+3)
4. mai · GFGK · 73 (+1)
...

                                     [ Alle runder → ]
```

Hver rad er klikkbar → åpner runde-detalj.

### 8. SAMMENLIGNING med peers

Liten card med:

```
DU vs ANDRE MED LIKNENDE PROFIL

Din snittscore:   73.2
Peer-snitt:       75.4

Du er #47 av 142 i din kohort.

                       [ Se hele kohorten → ]
```

Lenker til `/stats/aargang/[år]` eller en lignende side.

### 9. MERSALG (kondisjonell)

**Hvis bruker er GRATIS-konto:**

```
Du har 14 dager igjen av Pro-prøving.

Hva du får i Pro:
• Automatisk SG-beregning
• AI-coach-tips
• Treningsplaner mot ditt største gap

         [ Fortsett til 300 kr/mnd ]
         [ Avbryt prøving ]
```

**Hvis bruker er PRO:**

```
Du har vært Pro siden 12. januar.

Statistikk siden da:
• 41 runder logget
• SG forbedret med 1.2 strokes
• 3 turneringer spilt
```

### 10. NAVIGASJON til andre stats-tools

Footer-strip:

- "Sammenlign deg med Rory →" (/stats/sg-sammenlign)
- "Se PGA Tour-stats" (/stats/pga)
- "Norsk spillerbase" (/stats/spillere)
- "Quiz" (/stats/quiz)

---

## Mobile-tilpasning

- Hero: navn-greeting på én linje
- KPI-strip: 3 stack
- Score-trend: full bredde, kortere høyde
- SG-radar: smaller (240x240)
- Insights: cards stables med snap-scroll
- Kommende turneringer: card stables

## Mikrointeraksjoner

- Hero-greeting: navn fader inn med subtil scale-up (300ms)
- KPI-tall: count-up ved page-load
- Score-trend: linje tegnes inn
- SG-radar: punkter dra ut fra senter med stagger
- Insight-cards: skyves inn vertikalt med stagger 100ms

---

## Empty-states

**Hvis 0 runder logget:**
- Hero blir mer "onboarding-aktig"
- KPI-strip viser tomme placeholders
- Stor CTA: "Logg første runde →"
- Tilbud til å bruke `/stats/sg-sammenlign` for å se SG-profil uten runde-data

**Hvis 1-3 runder logget:**
- Score-trend skjules (for lite data)
- Erstattes med "Logg 5+ runder for å se trend"

---

## Inspirasjon

1. **strava.com/dashboard** — autentisert sport-dashboard
2. **whoop.com/journal** — wellness-data med insights og trends
3. **stripe.com/dashboard** — clean SaaS-dashboard
4. **PlayerHQ-eksisterende home** — bygg på det som finnes

## Output

- Komplett page-sketch
- Hero med 2 variants (med data / empty)
- Insight-card-pattern i 3 typer (warning, celebrate, info)
- SG-radar i mini-format
- Mobile-flow

---

## Implementasjon-notater

- Krever auth via `requirePortalUser`
- Insights kan først være regelbaserte (heuristic), senere AI-genererte
- Server-rendered for at "siste runde"-data ikke skal flicke ved load
- Cache med revalidate 600 (10 min) — friskt nok for daglig bruk
