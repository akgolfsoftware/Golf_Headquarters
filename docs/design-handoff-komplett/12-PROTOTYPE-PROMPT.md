# 12 — Prototype-prompt (lim inn i Claude Design)

Dette er den endelige prompten du sender til Claude Design (claude.ai/design) for å få 2 fullt interaktive prototyper i athletic editorial-stil.

**Versjon:** 2026-05-25 v2 (athletic editorial)
**Kopier ALT under linja og lim inn i Claude Design.**

---

```
═══════════════════════════════════════════════════════════════
AK GOLF HQ — INTERAKTIVE PROTOTYPER v2 (athletic editorial)
═══════════════════════════════════════════════════════════════

Bygg to fullt interaktive prototyper basert på dokumentasjonen
i prosjektet.

KRITISK FØRST: les disse to filene før noe annet, fordi de
overstyrer all annen vurdering:
  → 13-ATHLETIC-EDITORIAL.md (visuell retning)
  → 14-WORKBENCH-V2-SPEC.md (kanonisk implementasjons-eksempel)

ETTER DEM, les resten:
  → 00-INDEX.md
  → 01-BRANDING.md
  → 02-DESIGN-SYSTEM.md
  → 03-TONE-OF-VOICE.md
  → 04-COMPONENT-INVENTORY.md
  → 05-LAYOUT-PATTERNS.md
  → 06-INTERACTIONS.md
  → 07-ACCESSIBILITY.md
  → 08-DEMO-DATA.md
  → 09-PLAYERHQ-SCREENS.md
  → 10-COACHHQ-SCREENS.md
  → 11-ROUTES-AND-AUTH.md

═══════════════════════════════════════════════════════════════
VISUELL RETNING — IKKE FORHANDLINGSBART
═══════════════════════════════════════════════════════════════

Stil: ATHLETIC EDITORIAL
- En hybrid mellom atletikk-app (Zonixx, Whoop, Strava Pro)
  og editorial magasin (Kinfolk, Cereal)
- IKKE "luxury editorial" alene (for stiv)
- IKKE "ren sport-app" alene (for loud)

DE 5 GRUNNPILARENE:

1. PHOTOGRAPHY-LED HERO
   - Bruk AK Golf Academy-foto som bakgrunn på PlayerHQ-hjem hero,
     coach-profil, anlegg-detalj, drill-bibliotek hero, marketing-forside
   - Foto-filer: /public/images/akgolf/AK-Golf-Academy-{1-44}.webp
     (manglende: 36, 37, 41)
   - Dark gradient overlay: from-black/85 via-black/55 to-black/20
     + bg-gradient-to-t from-black/60 via-transparent to-transparent
   - Tekst på hero: italic display Inter Tight + lime accent på fornavn

2. DARK MOMENTS PÅ LYS BASE
   - Default bg-background (cream #FAFAF7)
   - Selektivt 1-2 dark moments per skjerm med bg-foreground (#0A1F17)
     og hvit tekst
   - Dark moments brukes for: countdown (NextTournamentCountdown),
     highlight-action (QuickActions primary tile), hero-CTA
   - Aldri mer enn 2 dark moments per skjerm — det tipper balansen

3. DISPLAY-TALL (ALLTID TABULAR-NUMS)
   - Countdown: text-[80px] sm:text-[120px] leading-[0.85] font-display
     font-bold tabular-nums
   - KPI-stats: text-3xl font-display font-bold tabular-nums
   - HCP/SG: text-base sm:text-lg font-mono tabular-nums
   - Eyebrows: font-mono text-[10px] uppercase tracking-[0.14em]

4. EDITORIAL SECTION DIVIDERS
   - Mellom alle seksjoner: <SectionHeader> med lime accent-strek
     (h-px w-8 bg-accent) + eyebrow + display 2xl/3xl tittel +
     valgfri description + valgfri CTA-pill
   - Aldri direkte section→section uten rytme
   - Spacing mellom seksjoner: space-y-10 lg:space-y-12 (40-48px)

5. TYPE-SPESIFIKKE FARGER
   - AI-Insights: HANDLING=accent (lime), OBSERVASJON=info (blå),
     MAAL=primary (forest)
   - Pyramide-pills: FYS=primary, TEK=warning, SLAG=info,
     SPILL=accent, TURN=destructive
   - IKKE bruk text-pyr-slag (lime tekst på hvit = WCAG fail)

═══════════════════════════════════════════════════════════════
ABSOLUTT KRAV (teknisk)
═══════════════════════════════════════════════════════════════

1. PIXEL-PERFECT på 5 viewports for BÅDE PlayerHQ og CoachHQ:
   - iPhone 14 Pro (393×852)
   - iPad portrait (810×1080)
   - iPad landscape (1180×820)
   - Desktop (1440×900)
   - Desktop wide (1920×1080)

2. KUN LIGHT TEMA i første runde (ingen dark mode-toggle)

3. PlayerHQ-hjem skal MATCHE workbench-v2-implementasjonen:
   - Hero: PlayerHeroImage-mønster med foto + dark gradient
   - 6+ seksjoner med SectionHeader
   - Dark moment: NextTournamentCountdown med 120px lime-tall
   - Highlight-action: Quick Actions Ny booking-tile som dark moment
   - Reference: live på akgolf.no/portal eller src/app/portal/page.tsx

4. INGEN UBRUKTE SKJERMER — hver skjerm i 09-PLAYERHQ-SCREENS.md
   og 10-COACHHQ-SCREENS.md må være tilgjengelig fra navigasjon,
   knapper, modaler eller wizards

5. ALLE KNAPPER MÅ VÆRE AKTIVE:
   - Enten gjør noe konkret (navigerer, åpner modal, toggler state,
     sender form med mock-success)
   - Eller eksplisitt DISABLED med tooltip ("Tilgjengelig i full versjon")
   - INGEN "døde" knapper

6. "?"-HJELP-POPUPS på alle komplekse handlinger og termer:
   - Pyramide-vekting, Strokes Gained, RAG-kontekst, Eval-score,
     Foreldresamtykke, m.fl.
   - Format: HelpCircle-ikon → popup med tittel + 2-4 setninger
   - Lukk via X, Esc eller klikk utenfor

7. DUPLIKAT-HÅNDTERING (stopp-punkt):
   - Hvis du finner skjermer med samme funksjon men ulike varianter:
     STOPP og vis screenshots side-by-side (mobile + desktop)
   - Spør Anders hvilken som skal brukes
   - IKKE gjett eller velg automatisk

═══════════════════════════════════════════════════════════════
DEMO-DATA (kritisk for konsistens)
═══════════════════════════════════════════════════════════════

HOVEDSPILLER: Øyvind Rohjan
- A1-nivå
- HCP: -2.1 (forbedring +0.3 siste 30 dager)
- Tier: PRO
- HomeClub: GFGK
- Neste turnering: Sørlandsåpent 28-30. mai (21 dager unna i prototypen)
- Aktiv plan: "Vår 2026 — Spesialisering" (uke 5/8)
- Plan-adherence: 87%
- SG-data: OTT +0.8, APP +0.4, ARG -0.2, PUTT -1.4

DEMO-COACH: Anders Kristiansen (Head Coach)
DEMO-FORELDER: Anders Pedersen (forelder til Markus R.P.)

ANDRE SPILLERE (komplett spec i 08-DEMO-DATA.md):
- Markus Roinaas Pedersen (B1, junior 14 år)
- Sofie Larsen (A2, junior 16 år)
- Tobias Hansen (B2, junior 13 år)
- Liam Simensen (junior 11 år)
- Aksel Eilefsen (junior 11 år, inaktiv 30d)

REGEL: Bruk samme spiller/tall overalt — konsistent gjennom hele
prototypen.

═══════════════════════════════════════════════════════════════
1. PLAYERHQ-PROTOTYPE
═══════════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: Workbench (med Øyvind Rohjan som logget-inn)

PlayerHQ-hjem MÅ matche workbench-v2-spec:
- Hero: PlayerHeroImage med AK-Golf-Academy-1.webp + dark gradient
  + italic "Hei, Øyvind." med lime accent
- Section: Calendar med pyramide-fargede øktblokker (4px venstre-stripe)
- Section: AI-Innsikt 3-grid med type-spesifikke ikon-sirkler
- Section: Ukas progresjon med pyramide-bars + 4 stat-tiles
- Section: Snarveier 4×2 grid med Ny booking som dark moment
- Section: Tren sammen (empty state hvis 0 partners)
- Section: 2-grid Turnering (dark moment, 120px lime) + Velvære
- FAB på mobile only

ALLE viewports pixel-perfekt.

ALLE prosjekt-skjermer som hører til PlayerHQ må brukes (se
09-PLAYERHQ-SCREENS.md):
- ~100 skjermer
- 8 toppnivå-seksjoner (Auth + 7 hub-områder)
- 6 wizards (Ny økt, Ny booking, Ny test, Logg runde, Egen-test,
  Egen-challenge)
- 13 modaler
- 7 fullscreen-ruter (Live-økt + Test-utførelse)

FUNKSJONALITET (alle viewports):
- Bottom-nav (mobile) / Sidebar (desktop) bytter mellom 7 seksjoner
- Wizards fungerer steg-for-steg med tilbake-/fortsett-knapper
- Modaler åpner og kan lukkes (Cmd+K søk, Invite-friend, Ny notat, etc.)
- Tabs bytter content
- Live-økt-flyt: brief → active → logger → tapper → summary
- Test-flyt: katalog → tildelt → live → summary
- Drill-detail som slide-in panel (desktop), full-screen modal (mobile)
- "?"-popups overalt på komplekse handlinger
- Tilbake-knapp (ChevronLeft) i Breadcrumb fungerer

═══════════════════════════════════════════════════════════════
2. COACHHQ-PROTOTYPE
═══════════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: AgencyOS (med Anders Kristiansen som logget-inn coach)

ALLE viewports pixel-perfekt — INKLUDERT iPhone (coach på golfbane).

Hero på CoachHQ-hjem kan bruke AK-Golf-Academy-2.webp eller -7.webp
(coach-fokus). Samme athletic editorial-mønster som PlayerHQ:
- Stort hero med foto + dark gradient
- SectionHeader mellom alle seksjoner
- 1-2 dark moments per skjerm
- Display-tall i KPI

ALLE prosjekt-skjermer som hører til CoachHQ må brukes (se
10-COACHHQ-SCREENS.md):
- ~133 skjermer
- 7 toppnivå-seksjoner (Auth + 6 hub-områder)
- Coach Workbench med modus-toggle (individuelt ⇄ gruppe)
- 12 modaler
- Live-økt-coach-view (3 sider)

FUNKSJONALITET (alle viewports):
- 6 toppnivå-hubs klikkbare: Oversikt · Stall · Planlegge ·
  Gjennomføre · Innsikt · Admin
- Spillervelger (Øyvind Rohjan øverst, søkbar combobox)
- Modus-toggle (individuelt ⇄ gruppe) endrer URL + innhold
- Caddie-chat med Øyvind-kontekst (mock-svar etter 500ms)
- 5 tabs per spiller (I dag · Plan · Analyse · Notater · Kommunikasjon)
- Plan-bygger med drag-drop (touch + maus)
- Kalender uke/måned
- AI-trening admin-skjermer
- "?"-popups overalt

═══════════════════════════════════════════════════════════════
LEVERANSER
═══════════════════════════════════════════════════════════════

To selvstendige HTML-bundles:

1. playerhq-prototype.zip
   - index.html starter på login
   - Alle ~100 skjermer + assets
   - Fungerer på alle 5 viewports
   - Konsistent state mellom mobile og desktop (localStorage)
   - PlayerHQ-hjem matcher workbench-v2-spec eksakt

2. coachhq-prototype.zip
   - Samme struktur

PLUS 13 RAPPORTER (.md i hver bundle):
- coverage-report.md (hvor er hver skjerm koblet?)
- duplikater-valg.md (Anders' valg + begrunnelse)
- viewport-coverage.md (✓ per 5 viewports per skjerm)
- button-coverage.md (aktiv/disabled per knapp)
- help-popups.md ("?"-popup-innhold per skjerm)
- components-inventory.md (alle gjentakende komponenter)
- tokens-mapping.md (fargenavn-mapping)
- routes-mapping.md (skjerm → Next.js path)
- prisma-mapping.md (skjerm → Prisma-modeller)
- server-actions-spec.md (alle handlinger + signatur)
- auth-guard-matrix.md (rolle per skjerm)
- animations-spec.md (timing + easing)
- athletic-editorial-conformance.md (NY — hver skjerm verifisert
  mot 13-ATHLETIC-EDITORIAL.md sjekkliste)

PLUS _archive/-mappe med skjermer som ble valgt bort.

═══════════════════════════════════════════════════════════════
PROSESS
═══════════════════════════════════════════════════════════════

1. Les 13-ATHLETIC-EDITORIAL.md FIRST
2. Les 14-WORKBENCH-V2-SPEC.md (kanonisk eksempel)
3. Les resten av referanse-filene
4. Skann hele prosjektet rekursivt — list alle HTML-filer
5. Identifiser ALLE duplikater + funksjons-likheter
6. STOPP — vis screenshots av varianter (mobile + desktop)
7. Spør Anders per duplikat/likhets-spørsmål
8. Når valgt → bygg prototypene
9. Test på alle 5 viewports
10. Verifiser hver skjerm mot athletic editorial-sjekklisten:
    - Har SectionHeader mellom seksjoner?
    - Bruker display-tall der det matter?
    - Har 1-2 dark moments per skjerm?
    - Cards er rounded-2xl?
    - Pyramide-pills bruker primary/warning/info/accent/destructive?
11. Lever begge bundles + 13 rapporter

═══════════════════════════════════════════════════════════════
KOMPONENT-NAVNGIVNING (for hand-off til Claude Code)
═══════════════════════════════════════════════════════════════

Hver skjerm i prototypen skal være merket med:
- Foreslått Next.js App Router path (eks: /portal/tren/[sessionId])
- Hovedkomponent-navn (eks: SesjonDetalj)
- Hvilke shared komponenter brukes (særlig SectionHeader, PlayerHeroImage)
- Hvilke nye komponenter må lages

Dette gjør Claude Code sin implementering 5-10× raskere.

═══════════════════════════════════════════════════════════════
ATHLETIC EDITORIAL — STIL-SJEKKLISTE PER SKJERM
═══════════════════════════════════════════════════════════════

For HVER skjerm verifiser:

VISUELT:
[ ] Har minst én SectionHeader med lime accent-strek
[ ] Bruker display-tall (Inter Tight bold + tabular-nums) for KPI
[ ] Har minst ett dark moment ELLER photo-hero
[ ] Cards er rounded-2xl (ikke rounded-lg = 16px ikke 12px)
[ ] Bruker pyramide-pills med funksjonsbaserte farger
[ ] Mono uppercase eyebrows overalt (tracking-[0.14em])
[ ] CTAs er pill-form med uppercase tracking-[0.08em–0.10em]
[ ] Mobile-versjon stacker korrekt + FAB der relevant
[ ] Ingen "AK GOLF"-tekst (bruk SidebarBrand)
[ ] Ingen emojier (kun Lucide-ikoner)

PHOTO-HERO (når brukt):
[ ] Bruker faktisk AK-Golf-Academy-{N}.webp
[ ] Dark gradient: from-black/85 via-black/55 to-black/20
+ secondary gradient bottom: from-black/60 via-transparent
[ ] Min-h 340/440px (mobile/desktop)
[ ] rounded-2xl shadow-xl
[ ] Italic display-fornavn med text-accent

DARK MOMENT (når brukt):
[ ] bg-foreground rounded-2xl shadow-xl
[ ] text-background for innhold
[ ] text-accent for CTA + countdown-tall
[ ] CTA: bg-accent text-accent-foreground rounded-full pill

═══════════════════════════════════════════════════════════════
VIKTIGE STILREGLER (re-statert)
═══════════════════════════════════════════════════════════════

- Ingen reelle API-kall. Mock data via localStorage.
- Konsistent state mellom viewports.
- Norsk bokmål, "du"-form, ingen emojier.
- Lucide-ikoner kun (stroke 1.5-1.75).
- Athletic editorial-stil (Strategy C: dark moments på lys base).
- Maks 8 ord på CTA-knapper.
- Eyebrows: UPPERCASE mono 10px, letter-spacing 0.14em.
- Numbers: JetBrains Mono ELLER Inter Tight bold, med tabular-nums.
- Light tema kun (ingen dark mode-toggle i denne runden).
- 8pt-grid (p-2, p-4, p-6, p-8 — ikke p-3, p-5, p-7).
- Border radius: rounded-2xl (16px) for cards + heros + dark moments,
  rounded-md (12px) for buttons, rounded-sm (8px) for badges,
  rounded-full for pills.
- Aldri hardkodede hex-farger (alltid token).
- Aldri "AK GOLF"-tekst i sidebar (bruk SidebarBrand).
- Photography-led der hero gir mening.

═══════════════════════════════════════════════════════════════
END OF SPEC
═══════════════════════════════════════════════════════════════
```

---

## Slik bruker du prompten

1. **Lim inn referanse-MD-filene** i Claude Design-prosjektet først (00-INDEX → 14-WORKBENCH-V2-SPEC)
2. **Last opp foto-biblioteket** — alle 41 AK-Golf-Academy-*.webp fra `/public/images/akgolf/`
3. **Kopier hele blokken over** ("AK GOLF HQ — INTERAKTIVE PROTOTYPER v2...")
4. **Lim inn i Claude Design**
5. **Vent på duplikater-spørringer** — svar når du blir spurt
6. **Få leveringen** (2 bundles + 13 rapporter)
7. **Test prototypene** end-to-end på iPhone + iPad + desktop
8. **Verifiser PlayerHQ-hjem** mot live akgolf.no/portal — skal matche pixel for pixel
9. **Send tilbake til Claude Design** hvis noe må justeres

Når godkjent → tilbake til meg så implementerer jeg.

---

## Forventet output-kvalitet

**Verifikasjonskriterium:** Når du åpner playerhq-prototype.zip og navigerer til workbench, skal det ikke være mulig å se forskjell på prototypen og live akgolf.no/portal — bortsett fra at det er statisk HTML i stedet for live data.

Hvis det er forskjell:
- Mangler photo-hero? → fiks
- Mangler 120px countdown? → fiks
- Mangler SectionHeader-rytme? → fiks
- Cards med rounded-lg i stedet for rounded-2xl? → fiks
- Tekst-pyr-slag som lime på hvit? → bytt til pyramid-pills-mønsteret

Hver feil må logges i `athletic-editorial-conformance.md` med før/etter-screenshot.
