# Claude Design-prompter: TURNERINGSPLANLEGGER

> Lim inn felles designspec fra `00-shared-spec.md` øverst i hver prompt.

---

## Prompt 2.1 — Turneringskalender (sesongoversikt)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Turneringskalender — sesongoversikt
URL: /admin/turneringer eller /portal/tren/turneringer
Bruker: Coach Anders eller spiller Markus

### Layout — tre-panel som kalenderen

#### PlanSidebar (280px)
- **Spiller-filter** (CoachHQ): Alle 6 spillere med checkboxes
- **Tour-filter:** ☑ Olyo Tour · ☑ Srixon Tour · ☑ Garmin Norges Cup · ☑ Titleist Østland · ☑ WAGR · ☐ Klubbturnering
- **Status-filter:** ☑ Påmeldt · ☑ Vurderer · ☐ Tidligere · ☐ Avlyst
- **A/B-prioritering:** "Vis kun A-turneringer (5)"
- **Kommende:** Liste over neste 5 turneringer med dato + tour-badge

### Hovedinnhold

#### Header
- Eyebrow: "COACHHQ · TURNERINGER · SESONG 2026"
- Tittel: "Sesongen har *83 turneringer.*" (italic på tallet+ord)
- Sub: "23 av Markus' spillere er påmeldt. 12 har A-prioritet. Neste: Oslo Open om 13 dager."
- Actions: [+ Manuell turnering] [Importer fra GolfBox] [WAGR-sync]

#### Tour-strip (chips med teller)
- Olyo Tour: 18 turneringer · 3 påmeldt
- Srixon Tour: 12 · 2 påmeldt
- Garmin Norges Cup: 15 · 1 påmeldt
- Titleist Østland: 9 · 4 påmeldt
- WAGR: 28 · 0 påmeldt
- Klubbturnering: 1 · 1 påmeldt

#### Kalender-grid (årsvisning)
12 måneder horisontalt, hver måned er en kolonne:
- Måneds-headers øverst: Jan, Feb, Mar, ... Des
- Vertikal liste under hver måned med turnerings-kort

Hver turnering vises som **kompakt kort** med:
```
┌──────────────────────────────┐
│ ● Oslo Open · WAGR           │  ← Lime dot for A-prio
│ 18-20 juli · Oslo GK         │
│ ☑ Påmeldt · 4 spillere       │
└──────────────────────────────┘
```

**Status-prikker:**
- ● Lime (#D1F843) — Påmeldt A-prio
- ◐ Halv lime — Vurderer (A/B)
- ○ Grå — Påmeldt B-prio
- ✕ Rød — Avlyst

**Tour-badges (8px chips):**
- OLYO (lyseblå)
- SRX (lilla)
- GNC (oransje)
- TÖT (gull)
- WAGR (mørk grønn)
- KLB (grå)

### Realistiske eksempel-turneringer (15 stk)

| Måned | Turnering | Tour | Status (Markus) |
|---|---|---|---|
| Mar | Vinter-cup Bossum | KLB | ✓ A |
| Apr | Olyo Mosjøen | OLYO | ✓ A |
| Mai | Garmin Hauger | GNC | ◐ Vurderer A |
| Mai | Titleist Tjøme | TÖT | ✓ B |
| Jun | Srixon Drøbak | SRX | ◐ Vurderer A |
| Jun | Olyo Bærum | OLYO | ✓ A |
| Jul | **Oslo Open** | WAGR | ✓ A |
| Jul | Garmin Trondheim | GNC | ○ B |
| Aug | Titleist Larvik | TÖT | ✓ A |
| Aug | NM Junior | WAGR | ✓ A |
| Sep | Olyo Final | OLYO | ✓ A |
| Sep | Srixon Tour Final | SRX | ◐ Vurderer A |
| Okt | Garmin Final | GNC | ○ B |
| Okt | Bossum Klubbmesterskap | KLB | ✓ A |
| Nov | Indoor-cup | KLB | — |

### KPI-strip øverst
4 kort:
- 23 påmeldt · 8 A-prio
- 12 venter A/B-beslutning
- 4 WAGR-events
- Neste: 13 dager

Lever én HTML-fil.
```

---

## Prompt 2.2 — Turnerings-detalj

```
[LIM INN 00-shared-spec.md]

## Skjerm: Turneringsdetalj
URL: /admin/turneringer/[id] (eller /portal/tren/turneringer/[id])

### Header
- Eyebrow: "TURNERING · WAGR · OSLO OPEN"
- Tittel: "Oslo Open *2026.*"
- Sub: "18-20 juli · Oslo GK Bogstad · 54 hull stroke play"
- Status-pill: ◉ PÅMELDT (lime) eller ◐ VURDERER (gull)
- Actions: [Påmeld spiller] [A/B-prioriter] [Avmeld]

### KPI-strip (4 kort)
- Påmeldt: 4 av 6 spillere
- Inntil deadline: 12 dager (13. juli)
- Forrige år: 2 deltakere
- Pris-pott: 50 000 kr · WAGR-poeng 12

### Hoved-grid (2 kolonner)

#### Venstre — Detaljer + spiller-liste

**Turnerings-info:**
- Format: Stroke play, 54 hull (18-18-18)
- Klasse: A, B, C, Junior
- Greenfee: 800 kr
- Påmeldingsavgift: 250 kr
- Caddie tillatt: Ja
- WAGR-status: Ranking event (+12 poeng for vinner)
- Forrige år: Vinner Henrik N (-7) — Markus deltok ikke

**Min spillere — påmeldingsmatrise:**

| Spiller | Klasse | Prioritet | Status | Coach-vurdering |
|---|---|---|---|---|
| Markus R | A | A ◉ | ✓ Påmeldt | "Skarp form, treningsuke før" |
| Emma S | A | A ◉ | ✓ Påmeldt | "Mental peak, godt klar" |
| Joachim T | A | B ◐ | ⊘ Vurderer | "Skade-flagg, beslutning om 5 dager" |
| Henrik N | A | A ◉ | ✓ Påmeldt | "Tidsforsvarer, sterkt motivert" |
| Lina H | B | A ◉ | ✓ Påmeldt | "Første WAGR-event" |
| Mads R | B | — | ○ Ikke aktuell | "Hopper over — fokus på Olyo" |

Hver rad har:
- Check-toggle for å endre status
- A/B-radio for prioritering
- "Notat" felt for coach-vurdering (inline edit)

#### Høyre — Tidslinje + neste steg

**Forberedelses-tidslinje** (Markus eksempel):
```
i dag         Påmeldt ✓
─────         Pyramide-justering aktivert (Caddie)
om 5d         Site-visit anbefales
om 8d         Treningsuke (TEK-fokus)
om 10d        Mental-prep økt
om 12d        AVREISE
om 13-15d     TURNERING (3 dager)
om 18d        Debrief + retrospektiv
```

**Caddie-anbefalinger:**
- "Treningsuke før: TEK 40% + SPILL 30% + TURN 30%" [Aktiver]
- "Mental-økt 10 dager før" [Planlegg]
- "Site-visit 5 dager før" [Bestill green]
- "Reise: Avreise 17. juli kl 14:00" [Sett påminnelse]

**A/B-beslutnings-CTA** (kun hvis spiller har ◐):
"Joachim T — beslutning innen 13. juli. [A-prioriter ◉] [B-prioriter ○] [Avmeld]"

### Editorial moment
Tittel: 36px med italic Instrument Serif på "*2026*"

Lever én HTML-fil.
```

---

## Prompt 2.3 — Påmelding A/B-vurdering

```
[LIM INN 00-shared-spec.md]

## Skjerm: A/B-vurderings-modal
Når Anders trykker "Vurderer A/B" på en spiller for en turnering.

### Header
- Eyebrow: "OSLO OPEN · 18-20 JULI"
- Tittel: "A/B for *Joachim T.*"
- Sub: "Beslutning anbefalt innen 13. juli (5 dager)"
- Lukk-knapp

### Layout — to-kolonne split 60/40

#### VENSTRE — Vurderings-faktorer

**Form (siste 30 dager):**
- SG total: -0.4 (gul, trending nedover)
- HCP-trend: 12.4 → 12.7 (gul)
- Antall runder: 4 (under snitt)
- Test-resultater: 1 av 3 forfalt
→ Score: 5.5/10

**Helse:**
- Skade-flagg: AKTIVT (ankel, 2 uker)
- Treningstillstand: Begrenset
- Mental: "OK" (siste sjekk-in)
→ Score: 4/10

**Strategi:**
- A-prio: 6 av 12 så langt
- Volum-belastning: 87% av kapasitet
- Sesongmål: Topp 20 i Olyo Tour (krever 8 A-prio)
- Olyo Final om 11 uker (kritisk)
→ Score: 6/10

**Praktisk:**
- Reise: 1 time bil
- Cost: 1 050 kr (greenfee + påmelding)
- Konflikt med trening: Ingen
→ Score: 8/10

#### HØYRE — Anbefaling + CTA

**Total score: 5.9/10**

**Caddie-anbefaling:**
> "B-prioritet anbefales. Skaden er fortsatt fersk, og Olyo Final om 11 uker veier tyngre. Hvis ankel er smertefri innen 12. juli, vurder å oppgradere til A."

**Tre alternativer (radio):**
- ◉ A-prio (vinne / topp 5 målsetning)
- ○ B-prio (full deltakelse, ingen press) ← Caddie-anbefaling
- ○ Avmeld (fokus på rehab + Olyo Final)

**Spiller-input:**
"Joachim har sagt: 'Vil gjerne spille hvis ankel er ok'"

### Footer
- [Avbryt]
- [Send til spiller for samtykke] (sekundær)
- [Bekreft B-prio] (primær)

### Etter beslutning — bekreftelses-skjerm
Banner: "✓ B-prio for Joachim. Treningsplan justert. Caddie sender bekreftelse til spiller."

Lever én HTML-fil.
```

---

## Prompt 2.4 — WAGR-import og benchmark

```
[LIM INN 00-shared-spec.md]

## Skjerm: WAGR-benchmark
URL: /admin/talent/wagr-benchmark

### Header
- Eyebrow: "TALENT · WAGR-BENCHMARK"
- Tittel: "Hvor står *Markus R* i WAGR?"
- Sub: "Sammenlign med 12 423 amateurs verden over"

### Layout

#### Hero — Markus' posisjon
Stor kort, full bredde, 200px høyde:
- Stort tall: "**#1 247**" globalt
- Pil opp: "+82 plasser siste 90 dager"
- Region: "#4 Norge · #28 Norden"
- WAGR-poeng: 23.4

#### Sammenlignings-grid (4 kort)

**1. Jevnaldrende (HCP ±2)**
- Du: #1 247
- Snitt din alder (16): #2 850
- "Du ligger 1 603 plasser over snittet"
- Mini-trend-graf

**2. Norge-topp 10 16-årige**
Liste:
1. Sondre M (#412)
2. Lars K (#723)
3. Markus R (#1 247) ← DU
4. Ola B (#1 891)
5. ...

**3. Beste turneringer i år**
- Bossum Klubbmesterskap: -8 (won, +5.2 WAGR)
- Olyo Mosjøen: -3 (T5, +2.1 WAGR)
- Garmin Hauger: +2 (T12, +0.8 WAGR)

**4. Neste opprykk**
- Til topp 1000 globalt: trenger 4.2 WAGR-poeng
- Lett: Vinn Olyo Final (+8.0)
- Sannsynlig: Topp 5 på 2 A-events

#### Komparator (full bredde)
Sammenlign Markus med peer-gruppe på 5 dimensjoner:

| Dimensjon | Markus | Peer-snitt | Topp 100 |
|---|---|---|---|
| SG Total | -0.3 | -1.2 | +1.8 |
| Driver-distanse | 287y | 268y | 295y |
| FIR % | 64% | 58% | 74% |
| GIR % | 51% | 47% | 68% |
| Putts/runde | 32.1 | 33.4 | 28.2 |

Radar-chart med 5 akser.

### Import-status
Footer-banner:
"Siste WAGR-import: 6. mai 2026 · Neste auto-import: 13. mai 2026 · [Manuell import nå]"

Lever én HTML-fil.
```
