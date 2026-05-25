# 12 — Prototype-prompt (lim inn i Claude Design)

**Versjon:** 2026-05-25 v3 (LIVING athletic editorial)

Dette er den endelige prompten du sender til Claude Design (claude.ai/design)
for å få 2 fullt interaktive prototyper.

**Kopier ALT under linja og lim inn i Claude Design.**

---

```
═══════════════════════════════════════════════════════════════
AK GOLF HQ — INTERAKTIVE PROTOTYPER v3 (LIVING athletic editorial)
═══════════════════════════════════════════════════════════════

Bygg to fullt interaktive prototyper basert på dokumentasjonen i
prosjektet. Stilen vi treffer er en hybrid mellom Linear, Whoop og
Notion — den må PULSE og LEVE, ikke være et statisk dashboard.

KRITISK FØRST — les disse to filene før noe annet:
  → 13-ATHLETIC-EDITORIAL.md (visuell retning + "Living app"-seksjon)
  → 14-WORKBENCH-V2-SPEC.md (kanonisk implementasjons-eksempel)

ETTER DEM, les resten:
  → 00-INDEX.md, 01-BRANDING.md, 02-DESIGN-SYSTEM.md,
    03-TONE-OF-VOICE.md, 04-COMPONENT-INVENTORY.md,
    05-LAYOUT-PATTERNS.md, 06-INTERACTIONS.md, 07-ACCESSIBILITY.md,
    08-DEMO-DATA.md, 09-PLAYERHQ-SCREENS.md, 10-COACHHQ-SCREENS.md,
    11-ROUTES-AND-AUTH.md

═══════════════════════════════════════════════════════════════
VISUELL RETNING — IKKE FORHANDLINGSBART
═══════════════════════════════════════════════════════════════

Stil: LIVING ATHLETIC EDITORIAL
- Linear: typografi-hierarki + mikro-detaljer + ghost-tall + context-linjer
- Whoop: athletic data-drama + display-tall + pulse-animasjoner
- Notion: rolig editorial-rytme + clean cards + hover-løft
- Tracksmith: photo-led editorial moments
- IKKE generisk SaaS-dashboard
- IKKE crypto-luxury (svart-gull)
- IKKE old-school golf (PGA Tour-stil)

DE 7 GRUNNPILARENE:

1. LEVENDE TALL — useCountUp ved scroll-inn
   Alle KPI teller fra 0 til verdi (HCP, økter, drills, runder, tester,
   SG-tall). Bruk scroll/resize-listener, ikke IntersectionObserver
   (upålitelig i iframes). Trigger ved 95% av viewport. Ease-out cubic
   800ms. Respekter prefers-reduced-motion.

   Brukes IKKE på tournament-countdown (signaturmoment — skal være
   ferdig fra start).

2. PROGRESS-BAR STAGGER FILL
   I WeekProgressCard fyller pyramide-barene seg fra 0% til verdi:
   - Stagger 80ms per akse (FYS → TEK → SLAG → SPILL → TURN)
   - Duration 1200ms per bar
   - Ease-out cubic
   - Scroll-trigget

3. HERO PARALLAX + GRAIN
   - Hero-img skalerer 1.0 → 1.05 ved scroll (subtil)
   - Grain-overlay 3% opacity for taktil premium-følelse
   - Respekter prefers-reduced-motion

4. PULSE-ANIMASJONER
   - .live-bar-dot (1.4s loop)
   - .itin-pulse "Pågår nå"-pill (1.4s loop)
   - .itin-now-dot NÅ-markør (1.6s loop)
   - .hero-trend-pulse HCP-pil (2s loop)

5. ITINERARY-STIL CALENDAR (IKKE horisontal Gantt)
   Vertikal magasin-agenda:
   - Grid 76px (time) | 26px (rail+dot) | 1fr (card)
   - Hvert kort: 5px venstre-stripe + tinted bg via color-mix(in oklab)
   - State-pills: Fullført / Pågår nå (pulse) / Planlagt
   - Active får accent ring: box-shadow 0 0 0 3px rgba(209,248,67,0.25)
   - NÅ-markør: stiplet rød horisontal linje mellom kort
   - Hover: -translate-y-2px + shadow-md

6. COLOR-MIX TINTED BACKGROUNDS
   Bruk moderne CSS for perseptuelt riktig fargeblanding:
   color-mix(in oklab, var(--pyr-fys) 16%, var(--card))

   Ikke rgba(0,88,64,0.16) — oklab gir bedre kontrast.

7. DATA-STORYTELLING (kontekst-linjer)
   Hvert tall får context-linje i 11px lime mono:
   - "+1 vs forrige uke" (accent)
   - "2 over mål" (accent)
   - "beste på 3 mnd" (accent)
   - "3 forfaller" (critical, rød)

   Aldri vis et tall uten kontekst.

═══════════════════════════════════════════════════════════════
ABSOLUTT KRAV (teknisk)
═══════════════════════════════════════════════════════════════

1. RESPONSIVE — verifisert på iPhone (393px) + Desktop (1440px)
   (Ikke krav om 5 viewports — det dobler arbeidet uten å gi
   tilsvarende verdi. iPad/wide blir verifisert med responsive
   design.)

2. KUN LIGHT TEMA i første runde (ingen dark mode-toggle)

3. PlayerHQ-hjem skal MATCHE workbench-v2-spec:
   - Hero: PlayerHeroImage med foto + parallax + grain + MASSIV hilsen
   - LiveBar over hero med tickende klokke
   - Itinerary-stil Calendar (ikke horisontal Gantt)
   - 6+ seksjoner med SectionHeader (med ghost-tall 01, 02, 03)
   - Dark moment: NextTournamentCountdown med 220-280px lime
   - Editorial photo-divider mellom seksjoner
   - CoachMessagePreview mellom AI-Insights og Ukas progresjon
   - Reference: live på akgolf.no/portal

4. INGEN UBRUKTE SKJERMER — hver skjerm må være tilgjengelig fra
   navigasjon, knapper, modaler eller wizards

5. ALLE KNAPPER MÅ VÆRE AKTIVE:
   - Enten gjør noe konkret (navigerer, åpner modal, toggler state,
     sender form med mock-success)
   - Eller eksplisitt DISABLED med tooltip
   - INGEN "døde" knapper

6. "?"-HJELP-POPUPS på alle komplekse handlinger og termer:
   Pyramide-vekting, Strokes Gained, RAG-kontekst, Eval-score,
   Foreldresamtykke, etc.

7. DUPLIKAT-HÅNDTERING (stopp-punkt):
   Hvis du finner skjermer med samme funksjon men ulike varianter:
   STOPP og vis screenshots side-by-side. Spør Anders.

═══════════════════════════════════════════════════════════════
DEMO-DATA (konsistent overalt)
═══════════════════════════════════════════════════════════════

HOVEDSPILLER: Øyvind Rohjan
- A1-nivå · HCP -2.1 (+0.3 siste 30d · beste på 3 mnd)
- Tier: PRO · HomeClub: GFGK
- Neste turnering: Sørlandsåpent 28-30. mai (21 dager unna)
- Aktiv plan: "Vår 2026 — Spesialisering" (uke 5/8 · adherence 87%)
- SG: OTT +0.8, APP +0.4, ARG -0.2, PUTT -1.4

DEMO-COACH: Anders Kristiansen (Head Coach)
DEMO-FORELDER: Anders Pedersen (forelder til Markus R.P.)

ØKTER I DAG (5 stk):
- 07:00 FYS · Morgentrening · Performance Studio · 3 drills · Fullført
- 08:30 TEK · Sving-mekanikk · Driving range · 5 drills · PÅGÅR NÅ
  (current time 09:42)
- 11:00 SLAG · Avstandskontroll · Grønt-felt · 4 drills · Planlagt
- 14:00 SPILL · 9-hull · Bane · 1 drill · Planlagt
- 17:00 TURN · Mental forberedelse · Performance Studio · 2 drills · Planlagt

LIVEBAR-DATA:
- Nå (ticker hvert sek)
- Neste · TEK · om 1t 18min (eller annet)
- GFGK · 14°C · sol

UKAS PROGRESJON:
- FYS 18% (mål 20% — under)
- TEK 35% (mål 30% — over)
- SLAG 12% (mål 20% — under)
- SPILL 18% (mål 15% — ok)
- TURN 17% (mål 15% — ok)

UKAS STATS:
- 4 økter (+1 vs forrige uke) — HERO TILE
- 2 runder (2 over mål)
- 12 drills (beste på 3 mnd)
- 3 tester (3 forfaller — critical)

AI-INSIGHTS (3 stk, HANDLING i midten):
- OBSERVASJON: "Sving-tempo har gått fra 3.0 til 2.7. Trenger jobbing."
- HANDLING (lifted, midten): "Putting-økt 30 min anbefales — du har ikke
  trent putting siste 10 dager"
- MÅL: "60% mot HCP -2.5-målet før Sørlandsåpent"

ANDRE SPILLERE (08-DEMO-DATA.md):
- Markus Roinaas Pedersen (B1, junior 14 år)
- Sofie Larsen (A2, junior 16 år)
- Tobias Hansen (B2, junior 13 år)
- Liam Simensen (junior 11 år)
- Aksel Eilefsen (junior 11 år, inaktiv 30d)

═══════════════════════════════════════════════════════════════
1. PLAYERHQ-PROTOTYPE
═══════════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: Workbench (Øyvind Rohjan)

PLAYERHQ-HJEM-LAYOUT (eksakt rekkefølge):

1. LiveBar (sticky topp)
   ● Live · Nå 09:42:23 · Neste TEK om 1t 18min · GFGK 14°C sol

2. PlayerHeroImage (440px desktop / 340px mobile)
   - Bg: AK-Golf-Academy-1.webp + parallax + grain
   - Pill PRO + "PlayerHQ · Sesong 2026"
   - "Hei, *Øyvind*." 110-130px desktop / 64-72px mobile
   - Meta: Nivå A1 · HCP -2.1 ↑+0.3 · 21 dager til Sørlandsåpent
   - Hvis økt starter <30 min: alert-pill "Starter om 18 min"

3. SectionHeader "01" + I dag
   Itinerary-stil Calendar (5 sessions med NÅ-linje)

4. EditorialDivider
   AK-Golf-Academy-22.webp · "Dag 147 · Uke 21 av 52"
   "Sørlandsk vind. 14°C. Sol fra vest fram til 17:00."

5. CoachMessagePreview
   Anders K · "Bra jobba med putting i går..." · for 12 min siden

6. SectionHeader "02" + AI-Innsikt
   AiInsightsRow (HANDLING lifted i midten)

7. SectionHeader "03" + Ukas progresjon
   WeekProgressCard (asymmetrisk 1 hero + 3 compact stats)

8. SectionHeader "04" + Snarveier
   QuickActions (1 feature dark moment + 6 standard)

9. EditorialDivider
   AK-Golf-Academy-44.webp · "Tre dager til konkurranse"

10. SectionHeader "05" + Turnering + velvære (2-grid)
    NextTournamentCountdown (220-280px lime, blurred course bg)
    + WellnessIndicators

11. FAB (mobile only)

ALLE prosjekt-skjermer som hører til PlayerHQ må brukes (se
09-PLAYERHQ-SCREENS.md, ~100 skjermer).

═══════════════════════════════════════════════════════════════
2. COACHHQ-PROTOTYPE
═══════════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: AgencyOS (Anders Kristiansen som logget-inn coach)

Hero på CoachHQ-hjem: AK-Golf-Academy-2.webp eller -7.webp (coach-fokus).
Samme athletic editorial-mønster som PlayerHQ, men:
- "Hei, Anders." istedenfor "Hei, Øyvind."
- Top-stats: antall spillere, økter i dag, ventende godkjenninger
- Itinerary viser dagens coaching-økter (med spiller-avatar i hvert kort)
- AI-Insights tilpasset coach (mest om spiller-progresjon)
- Quick Actions: Ny økt for spiller / Send melding / Lag plan / Godkjenn ventende

═══════════════════════════════════════════════════════════════
LEVERANSER
═══════════════════════════════════════════════════════════════

To selvstendige HTML-bundles:

1. playerhq-prototype.zip
   - index.html starter på login
   - Workbench matcher v3-spec eksakt (alle 7 living-pilarer)
   - Itinerary Calendar (ikke horisontal Gantt)
   - LiveBar tickende + parallax + grain + ghost-tall + context-linjer

2. coachhq-prototype.zip
   - Samme struktur

PLUS RAPPORTER (.md i hver bundle):
- coverage-report.md (hvor er hver skjerm koblet?)
- duplikater-valg.md
- viewport-coverage.md (mobile + desktop ✓ per skjerm)
- button-coverage.md
- help-popups.md
- components-inventory.md
- tokens-mapping.md
- routes-mapping.md
- prisma-mapping.md
- server-actions-spec.md
- auth-guard-matrix.md
- animations-spec.md
- athletic-editorial-conformance.md
  ↳ NY krav: hver skjerm verifisert mot 7 living-pilarer (count-up,
    stagger, parallax, pulse, itinerary, color-mix, data-storytelling)

═══════════════════════════════════════════════════════════════
LIVING APP-SJEKKLISTE PER SKJERM
═══════════════════════════════════════════════════════════════

For HVER skjerm verifiser:

ATHLETIC EDITORIAL (basis):
[ ] SectionHeader med lime accent-strek + ghost-tall (01, 02...)
[ ] Display-tall (Inter Tight bold + tabular-nums)
[ ] Minst ett dark moment ELLER photo-hero
[ ] Cards rounded-2xl (20px)
[ ] Pyramide-pills med funksjonsbaserte farger
  (primary/warning/info/accent/destructive)
[ ] Mono uppercase eyebrows (tracking-[0.14-0.16em])
[ ] CTAs pill-form med uppercase tracking
[ ] Mobile-versjon stacker korrekt + FAB der relevant
[ ] Ingen "AK GOLF"-tekst
[ ] Ingen emojier (kun Lucide)

LIVING APP (v3 tillegg):
[ ] useCountUp på alle KPI-tall (count-up ved scroll-inn)
[ ] Progress-bar stagger fill (80ms forsinkelse per element)
[ ] Hero parallax 1.0 → 1.05 + grain overlay 3%
[ ] Pulse-animasjon på live-prikker (LiveBar, NÅ-markør, "Pågår nå")
[ ] Itinerary-stil Calendar (ikke horisontal Gantt)
[ ] color-mix(in oklab, ...) for tinted bgs
[ ] Data-storytelling — hvert tall har context-linje
[ ] LiveBar med tickende klokke (oppdaterer hvert sekund)
[ ] EditorialDivider mellom minst 2 seksjoner
[ ] Active-state får accent ring (box-shadow 3px rgba(209,248,67,0.25))

PHOTO-HERO (når brukt):
[ ] Bruker AK-Golf-Academy-{N}.webp
[ ] Dark gradient + grain-overlay 3%
[ ] Min-h 340/440 (mobile/desktop)
[ ] rounded-2xl shadow-xl
[ ] Italic display-fornavn 110-130px desktop med text-accent

DARK MOMENT (når brukt):
[ ] bg-foreground rounded-2xl shadow-xl
[ ] text-background for innhold
[ ] text-accent for CTA + countdown-tall
[ ] CTA: bg-accent rounded-full pill

═══════════════════════════════════════════════════════════════
VIKTIGE STILREGLER (re-statert)
═══════════════════════════════════════════════════════════════

- Ingen reelle API-kall. Mock data via localStorage.
- Konsistent state mellom viewports.
- Norsk bokmål, "du"-form, ingen emojier.
- Lucide-ikoner kun (stroke 1.5-1.75).
- LIVING athletic editorial-stil (Linear + Whoop + Notion).
- Maks 8 ord på CTA-knapper.
- Eyebrows: UPPERCASE mono 10px, letter-spacing 0.14em.
- Numbers: JetBrains Mono ELLER Inter Tight bold + tabular-nums.
- Light tema kun.
- 8pt-grid (p-2, p-4, p-6, p-8 — ikke p-3, p-5, p-7).
- Border radius: rounded-2xl (20px) for cards + heros + dark moments,
  rounded-md (12px) for buttons, rounded-sm (8px) for badges,
  rounded-full for pills.
- Aldri hardkodede hex-farger (alltid token).
- Aldri "AK GOLF"-tekst i sidebar (bruk SidebarBrand).
- Photography-led der hero gir mening.
- Respekter prefers-reduced-motion på ALLE animasjoner.

═══════════════════════════════════════════════════════════════
ANTI-EKSEMPLER (ikke gjør dette)
═══════════════════════════════════════════════════════════════

- Tailwind UI starter-templates (for generic SaaS)
- Bleacher Report / ESPN (for loud)
- Crypto-luxury (svart-gull)
- PGA Tour-site (gammeldags golf)
- Stripe Dashboard (for clean uten karakter)
- Statisk tall uten count-up
- IntersectionObserver (ufullstendig i iframes — bruk scroll/resize)
- rgba() for tinted bgs (bruk color-mix oklab)
- Horisontal Gantt-Calendar (bruk itinerary)
- Tall uten kontekst-linje

═══════════════════════════════════════════════════════════════
INSPIRASJON
═══════════════════════════════════════════════════════════════

Når i tvil, åpne disse URL-ene:

- Linear: https://linear.app/method  (typografi + ghost-tall + dark moments)
- Whoop: https://www.whoop.com/the-locker/  (athletic photography + display-tall)
- Notion: https://www.notion.so/product  (clean cards + editorial-rytme)
- Tracksmith: https://www.tracksmith.com/journal  (photo-led editorial)

═══════════════════════════════════════════════════════════════
END OF SPEC v3
═══════════════════════════════════════════════════════════════
```

---

## Slik bruker du prompten

1. **Last opp foto-biblioteket** først — alle 41 `AK-Golf-Academy-*.webp` fra `/public/images/akgolf/`
2. **Last opp alle 15 MD-filer** til Claude Design-prosjektet
3. **Kopier hele blokken over** ("AK GOLF HQ — INTERAKTIVE PROTOTYPER v3...")
4. **Lim inn i Claude Design**
5. **Vent på duplikater-spørringer** + svar
6. **Få levering:** 2 bundles + 13 rapporter (inkl. ny athletic-editorial-conformance.md)

---

## Verifikasjons-kriterium

Når du åpner playerhq-prototype.zip og navigerer til workbench:
- LiveBar tikker øverst (klokke oppdaterer hvert sekund)
- Stats teller opp fra 0 når du scroller forbi dem
- Pyramide-barer fyller seg med stagger
- Hero har subtil parallax + grain
- Itinerary viser dagens 5 økter med NÅ-linje midt i
- "Pågår nå"-pill pulserer på aktive økten
- Pyramide-pills og itinerary-kort har color-mix tinted bg
- Hvert tall har context-linje (+1 vs forrige uke, etc)
- Tournament-countdown er 220-280px lime
- EditorialDivider mellom seksjoner med foto + stamp + line

Hvis ett av disse mangler → ikke deploy. Send tilbake.

---

## Verdier å sjekke mot hvis Claude Design er usikker

| Element | Verdi |
|---|---|
| Hero-tittel desktop | 110-130px Inter Tight bold italic |
| Hero-tittel mobile | 64-72px |
| Tournament countdown | 220-280px desktop / 140-180px mobile |
| Stats hero-tile | 80-96px |
| Stats compact | 40-48px |
| Context-linje | 11px lime mono uppercase |
| Eyebrow tracking | 0.14-0.16em |
| Pill tracking | 0.10em |
| Card radius | 20px (rounded-2xl) |
| Button radius | 12px (rounded-md) |
| Card padding | 24-28px (p-6 / p-7) |
| Section gap mobile | 40px (space-y-10) |
| Section gap desktop | 48px (space-y-12) |
| LiveBar height | 32-40px |
| Itinerary row min-h | 96px |
| Itinerary time col | 76px |
| Itinerary rail col | 26px |
| Active-state shadow | 0 0 0 3px rgba(209,248,67,0.25) |
| Hero parallax max | scale(1.05) |
| Grain opacity | 3% |
| useCountUp duration | 800ms |
| Progress bar fill | 1200ms |
| Progress bar stagger | 80ms |
| Pulse loop (live-dot) | 1.4s |
| Pulse loop (NÅ-dot) | 1.6s |
| Pulse loop (HCP-pil) | 2s |
