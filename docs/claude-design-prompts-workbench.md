# Claude Design Prompts — Workbench

**Opprettet:** 2026-05-25
**Bruk:** Lime inn én av disse i Claude Design (claude.ai/design) for å få pixel-perfekt HTML

---

## Felles designsystem-prefiks (lim inn øverst i hver prompt)

```
DESIGN SYSTEM (AK Golf HQ — etablert):

COLORS:
- Background: #FAFAF7
- Card: #FFFFFF
- Foreground: #0A1F17
- Muted-fg: #5E5C57
- Border: #E5E3DD
- Primary: #005840 (dark forest green)
- Primary-fg: #D1F843 (lime accent, text on primary)
- Accent: #D1F843 (lime, used for highlights + badges)
- Accent-fg: #0A1F17

PYRAMID COLORS (5 axes):
- FYS: #005840 (forest green) - physical
- TEK: #B8852A (warm amber) - technique
- SLAG: #2563EB (calm blue) - shot work
- SPILL: #D1F843 (lime) - game play
- TURN: #A32D2D (deep red) - tournament

STATUS COLORS:
- Success: #1A7D56
- Warning: #B8852A
- Destructive: #A32D2D
- Info: #2563EB

FONTS:
- Inter (body, UI default) — 14px-16px regular
- Inter Tight (headings, display) — bold for h1-h2, italic for luxury editorial accent
- JetBrains Mono (numbers, eyebrows, code) — tabular-nums

BORDER RADIUS:
- 16px on cards/panels
- 12px on buttons/inputs
- 8px on badges/tags
- 999px (pill) on CTAs and status-pills

SPACING (8pt grid):
- Use p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px)
- Gap: gap-2, gap-3, gap-4, gap-6
- NO p-3, p-5, p-7 (not 8pt-aligned)

ICONS:
- Lucide line-icons ONLY (stroke-width 1.5-1.75)
- NO emojis anywhere

TONE:
- Norwegian Bokmål (æ, ø, å)
- "du"-form, NOT "brukeren"
- Active voice ("Logg din runde", NOT "Logging av runde")
- Maks 8 ord på CTA-knapper
- Eyebrows: UPPERCASE mono 10px, letter-spacing 0.10em
- Numbers: JetBrains Mono with tabular-nums

VIBE:
- Premium Scandinavian minimal
- Luxury editorial (NOT sporty/loud)
- Quiet confidence
- Like fine architecture, not like a sports app
```

---

# PLAYER WORKBENCH — 3 VARIANTER

## Variant A — Stack-layout (mobile-first)

**Bruk:** Spillere som primært bruker iPhone for å gjennomføre trening.

```
[FELLES DESIGNSYSTEM-PREFIKS — se topp av dokumentet]

PAGE: PlayerHQ Workbench — Variant A (Stack-layout, mobile-first)
URL: /portal (default for spillere)
Viewport: iPhone 14 Pro (393×852) as primary, but works on iPad + desktop

INFORMASJONS-ARKITEKTUR (vertikal stack):

1. HERO (top, sticky)
   - Eyebrow: "PLAYERHQ · PRO" (mono uppercase 10px lime accent)
   - Big greeting: "Hei, *Markus*." with "Markus" in Inter Tight italic primary green
   - Sub-line: "A1 · HCP -2.1 ↗ +0.3 · 21 dager til Sørlandsåpent"
   - Mini wellness (only if wearable connected): "Energi 7/10 · Søvn 8.2t · HRV 67 ↗"
   - Big avatar (80×80, green circle, lime border, PRO-pill bottom-right)

2. KALENDER-WIDGET (full bredde)
   - Eyebrow: "I DAG"
   - Horizontal time axis 05:00-24:00 (scrollable horizontally on mobile)
   - 5 pyramid-colored session blocks
   - "NÅ 09:42"-vertical-line marker with badge
   - Past sessions opacity-50, hover back to normal
   - Touch on block → opens detail bottom-sheet (mobile) or popover (desktop)

3. AI-INNSIKT (3-card row)
   - Eyebrow: "AI-INNSIKT"
   - 3 cards horizontal scrollable on mobile, 3-col grid on desktop
   - Each card has Sparkles/TrendingUp/Target icon + eyebrow + body + small CTA
   - Card 1: "HANDLING — Du har trent 2x TEK denne uka. Foreslår FYS i morgen 08:00."
   - Card 2: "OBSERVASJON — SG-PUTT -1.4 siste 5 runder. Gate-drill anbefalt."
   - Card 3: "MÅL — HCP -2 i 30 dager → 14 dager igjen. Du er på sporet."

4. UKAS PROGRESJON (kort)
   - Eyebrow: "UKAS PROGRESJON"
   - 5 horizontal progress bars (one per pyramid-axis)
   - Each bar shows: faktisk% with color + ideal-marker (vertical line)
   - "Over"/"Under"-tag if diff > 5pp
   - Below: ukens-stats row: "3 økter · 5t · 8 drillsr · 1 runde · 2 tester"
   - Anbefaling-tekst: "Mer SPILL + TEK denne uka"

5. SNARVEIER (8-grid)
   - Eyebrow: "SNARVEIER"
   - 4-kol grid på desktop, 2-kol på mobile
   - 8 button-cards: Logg runde · Start økt · Ny booking · Ny test · Last opp video · Spør coach · Se kalender · Innstillinger
   - Each card 80×80 minimum (touch target)
   - Icon + label centered
   - Hover: lift -2px + border-primary

6. TRENINGSKOMPISER (kun hvis kompiser invitert)
   - Eyebrow: "TRENINGSKOMPISER"
   - Vertical list, each row:
     - Avatar (32px) + name + time + place + status-pill
     - "Bli med →"-CTA if INVITED
   - Footer: "+ Inviter en kompis"-CTA

7. NESTE TURNERING (countdown card)
   - Eyebrow: "NESTE TURNERING"
   - Title: "Sørlandsåpent"
   - Sub: "28. mai - 30. mai · Kristiansand GK · 54 huller"
   - HUGE countdown: "21 DAGER" (Inter Tight 60px, mono number)
   - Forberedelse-checklist (4 items, ✓/○):
     - Plan oppdatert ✓
     - Reise booket ✓
     - Bane-recon (1 uke før) ○
     - Mental forberedelse ○
   - "Se turnering →"-link nederst

8. VELVÆRE (kun hvis wearable koblet)
   - Eyebrow: "VELVÆRE"
   - 4-col grid på desktop, 2-col mobile
   - Energi (dots 1-10), Søvn (timer), HRV (mph + trend), Stress (lav/mid/høy)
   - Footer: "Sist sync: 2 min · [Sync Garmin →]"

9. BOTTOM PAD for navigation bar (mobile)

LAYOUT-DETAILS:
- Max-width container: 768px on mobile, 1024px on tablet, 1280px on desktop
- Gap mellom sections: 24px (gap-6)
- Padding container: 16px mobile, 24px desktop
- Sticky topbar with hamburger menu + brand on mobile

INTERAKSJONER:
- Calendar block hover → popover with drill details + actions
- AI-card hover → subtle lift + shadow
- Snarvei click → instant navigate
- Turnering card click → /portal/tren/turneringer/[id]

ULIKT FRA VARIANT B + C:
- Vertical stack (everything top-to-bottom)
- Optimized for thumb-reach on iPhone
- No sidebar — uses hamburger sheet
- Bigger tap targets (56px buttons)
```

---

## Variant B — Editorial luxury layout

**Bruk:** Spillere som primært bruker iPad/desktop og forventer premium-følelse.

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: PlayerHQ Workbench — Variant B (Editorial luxury)
URL: /portal
Viewport: iPad portrait (810px) primary, scales to desktop

VISJON:
"Fine architecture digital. Like opening a hardcover Kinfolk magazine."
Negative space + bold typography + minimal data per fold.

LAYOUT:

1. EDITORIAL HERO (60vh på desktop, 50vh på iPad)
   - Solid #FAFAF7 background
   - Center-aligned content vertically
   - Top: tiny eyebrow "PLAYERHQ · DAG 142"
   - Massive heading (Inter Tight italic, 96px desktop / 56px mobile):
     "*Hei, Markus.*"
     Centered, color primary green
   - Sub-line below: "21 dager til Sørlandsåpent" (Inter Tight regular, 24px)
   - Below that, a single thin horizontal line (border-border)
   - Below line: small stats row: "A1 · HCP -2.1 ↗ +0.3 · Sesongstart -134d"

2. EDITORIAL SECTION 1: "I DAG"
   - Large section title: "I dag" (Inter Tight 48px, left-aligned)
   - Underline thin
   - Below: clean horizontal timeline (no axis numbers, just session blocks)
   - Each session block is a small editorial card with:
     - Time as large mono number (24px)
     - Title as Inter Tight regular (18px)
     - Brief description (1 line)
     - "Open →"-link mute
   - Generous spacing between cards (40px gap)

3. AI ESSAY (replaces "AI-Innsikt cards")
   - Like reading a paragraph in The New York Times Magazine
   - Eyebrow: "FRA CADDIE — IDAG"
   - Large body text (Inter 18px, max-w-prose / 65ch):
     "Du har trent fokus på TEK denne uka. SG-PUTT viser -1.4 siste fem
      runder. Caddie foreslår en gate-drill 50cm i morgen 08:00 — det
      vil bygge på dagens SLAG-arbeid."
   - Signature line: "— Caddie · 2 min siden"
   - Two minimal links nederst: "Aksepter forslag" · "Avvis"

4. EDITORIAL SECTION 2: "UKENS BALANSE"
   - Title + sub
   - Pyramide visualisert som elegant horisontal bar-chart, ikke standard percent-bars
   - Each axis as a "column" with mark-line for ideal vs actual
   - Below: prose-style "Anbefaling: Mer SPILL + TEK denne uka."

5. EDITORIAL SECTION 3: "NESTE"
   - Tournament card as full-width hero block
   - Large countdown number "21" (mono 144px Inter Tight bold)
   - Below: "DAGER TIL SØRLANDSÅPENT" mono uppercase
   - Below: subtitle "Kristiansand Golfklubb · 28-30. mai"
   - Forberedelse-checklist as compact 4-item list
   - "Se hele forberedelsen →"

6. EDITORIAL FOOTER
   - 3-col grid:
     - "Trenings-kompiser" (2-3 partners listed)
     - "Velvære" (4 indicators, eller "Koble enhet"-CTA)
     - "Snarveier" (4 mini buttons)
   - Less data-dense than Variant A
   - Generous whitespace

DESIGN-DETAILS:
- Background never breaks from #FAFAF7
- Card-borders avoid: use whitespace + section dividers
- Section dividers: thin 1px line in border color
- Each section feels like a "spread" in print
- Max font-size on hero is 96px desktop (compared to Variant A's 36px)
- All numbers are Inter Tight bold OR JetBrains Mono — never both at once
- No icons in section headings (purely typographic)
- Lucide icons only on small actions/links

ULIKT FRA VARIANT A + C:
- Editorial / magazine-feel
- Massive typography, generous whitespace
- "AI-Innsikt" rendres som prose (essay) not cards
- No competing data-dense visualizations
- Less scannable, more contemplative
- Better suited for desktop/iPad than iPhone (mobile becomes vertical scroll)
```

---

## Variant C — Dashboard data-dense

**Bruk:** Power-spillere (PRO+) som vil se all sin data øyeblikkelig på desktop.

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: PlayerHQ Workbench — Variant C (Dashboard data-dense)
URL: /portal
Viewport: Desktop 1440×900 primary, scales down to mobile

VISJON:
"Bloomberg Terminal for golf — every datapoint at a glance, but tasteful."
Multi-pane layout, compact density, professional analyst-feel.

LAYOUT (Desktop):

┌──────────────────────────────────────────────────────────────┐
│ TOP BAR (sticky)                                              │
│ [AVA] Markus R.P. · A1 · HCP -2.1 ↗ · Søknd Open 21d        │
│              [Settings] [Notifications] [Search ⌘K]           │
├──────────────────────────────────────────────────────────────┤
│ 3-col grid main area                                          │
│                                                                │
│ ┌─────────────┐ ┌─────────────────┐ ┌────────────────────┐   │
│ │ KPI-PANEL   │ │ KALENDER (3d)   │ │ AI INSIGHTS        │   │
│ │ HCP, SG,    │ │ I dag · I morgen│ │ 3 stacked actions  │   │
│ │ Tester,     │ │ Overmorgen      │ │ with priority      │   │
│ │ Plan%       │ │                 │ │ ordering           │   │
│ │             │ │ Multiple events │ │                    │   │
│ └─────────────┘ │ per day visible │ │                    │   │
│                  │                 │ │                    │   │
│ ┌─────────────┐ │                 │ └────────────────────┘   │
│ │ WELLNESS    │ │                 │                           │
│ │ HRV chart,  │ │                 │ ┌────────────────────┐   │
│ │ sleep,      │ │                 │ │ NEXT TOURNAMENT    │   │
│ │ stress      │ └─────────────────┘ │ countdown + prep   │   │
│ └─────────────┘                     └────────────────────┘   │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ PYRAMIDE-FORDELING (uke) — large horizontal data viz     │ │
│ │ FYS 35% [bar] ideal 30% (over 5pp)                       │ │
│ │ TEK 40% [bar] ideal 30% (over 10pp)                      │ │
│ │ ...                                                       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ HCP-UTVIKLING (12 mnd) — sparkline + key dates           │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────┐ │
│ │ TRENINGS-   │ │ FYS-PLAN    │ │ TESTER     │ │ BANER    │ │
│ │ KOMPISER    │ │ THIS WEEK   │ │ OVERDUE    │ │ TOP 5    │ │
│ └─────────────┘ └─────────────┘ └────────────┘ └──────────┘ │
└──────────────────────────────────────────────────────────────┘

KEY DESIGN PRINCIPLES:
- Dense but never cramped (8pt-grid strict)
- Every card is 200-280px height
- Multiple data-vis per fold (sparkline, bars, KPI cards)
- Use accent (#D1F843) sparingly for "live" or "important" indicators
- Use mono everywhere for numbers
- Hover states: subtle shadow + border-primary
- Mini-charts: 60px height max
- Always show units (mph, %, kg, t)

KPI-PANEL (top-left):
- 4×2 grid of mini KPIs
- Each cell: eyebrow + big mono number + delta-pill
- HCP -2.1 (↑0.3)
- SG-Total +1.2 (↑0.4 vs PGA)
- Plan-adherence 87% (↑12pp)
- Tester 12/36 (3 overdue)
- Runder denne mnd: 12
- Drillsr/uke: 47
- TM-snitt 105mph
- Mål 75% mot

KALENDER (center):
- 3-day mini calendar (I dag, I morgen, Overmorgen)
- Each day column with session blocks
- Pyramid-color blocks compact
- Click → opens detail

AI-INSIGHTS (right):
- 3 stacked horizontal cards (less dramatic than Variant A grid)
- Each compact: 80px height
- Priority-sorted (kritisk → middels → lav)

WELLNESS (bottom-left):
- Mini HRV sparkline (7-day)
- Sleep avg + delta
- Stress traffic-light
- All connected to compact KPIs

PYRAMIDE-PANEL (full-width):
- Side-by-side bars per axis
- Ideal-vs-actual on same row
- Below: ukens stats row

HCP-UTVIKLING:
- 12-month sparkline (200px height)
- Key event markers (turnering wins, injury, plan-start)
- Hover shows exact date + HCP

ULIKT FRA VARIANT A + B:
- Maximum data density (Bloomberg/analyst-style)
- Best for desktop, secondary for tablet, last on mobile
- Mobile becomes scroll-list (cards stack)
- Less white space, more information per square inch
- Quantitative-focused user (vs Variant A's task-focused, Variant B's contemplative)
- For PRO-tier or competitive amateurs
```

---

# COACH WORKBENCH (INDIVIDUELT) — 3 VARIANTER

## Variant A — Tab-basert (klassisk)

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench INDIVIDUELT — Variant A (Tab-basert)
URL: /admin/agencyos?modus=individuelt&spiller=<id>
Viewport: Desktop 1440×900 primary

INFORMASJONS-ARKITEKTUR:

1. TOP-BAR (sticky, full-bredde)
   - Left: "← Tilbake til oversikt"-link
   - Center: Spillervelger (combobox with search)
     - Show: avatar + name + HCP
     - Dropdown with all players visible to this coach
   - Right: Modus-toggle "Individuelt | Gruppe"

2. SPILLER-HERO (full-bredde card)
   - Avatar 80px (lime border, PRO-pill if applicable)
   - Right of avatar: name (Inter Tight italic, 32px), tier-pill, HCP-trend, neste turnering
   - Top-right: 3 CTAs (vertical stack on mobile, horizontal desktop):
     - "Send melding" (outline primary)
     - "Ny økt" (primary green + lime text)
     - "Generer plan (AI)" (accent variant — lime bg + dark text)

3. KEY METRICS (4-card row, full width)
   - SG-Total +1.2 (↑0.4 trend)
   - Plan-adherence 87% (↑12pp)
   - Tester (overdue) 2 (warning amber)
   - Aktive mål 3/4 (●●●○)
   - Each card 200×120 minimum
   - Each card clickable → relevant detail panel

4. AI-CADDIE-CHAT (collapsible card)
   - Eyebrow: "CADDIE · KONTEKST MARKUS R.P."
   - Toggle [Vis | Skjul ▼]
   - When expanded: 60vh tall card with:
     - Chat history (user-right, assistant-left)
     - Suggestion-pills: "Foreslå drills" · "Sjekk fremgang" · "Lag plan-revisjon"
     - Input field (full-width) with Send-button
   - When collapsed: just title + last message preview

5. TABS (sticky below caddie-chat)
   - 5 tabs: [I dag] [Plan] [Analyse] [Coach-notater (12)] [Kommunikasjon (3)]
   - Active tab: bottom-border primary
   - Inactive: muted-fg with hover
   - URL-state: ?tab=plan

6. TAB CONTENT (varies)

   TAB: "I dag"
   - Today's sessions for spiller (list of cards)
   - Each card: time + title + place + status-pill
   - Actions: Endre tid · Avlys · Open
   - Empty: "Ingen økter planlagt i dag for Markus"

   TAB: "Plan"
   - Aktive plan-card (big)
   - Adherence-graph (4 uker)
   - Ukas-økter-liste with status
   - Bottom CTAs: Generer ny plan · Eksportér · Rediger

   TAB: "Analyse"
   - HCP-utvikling-graf (12 mnd, line chart)
   - SG 4-cards (OTT/APP/ARG/PUTT) with benchmark
   - Pyramide-fordeling (siste 30d)
   - Siste tester liste

   TAB: "Coach-notater"
   - "+ Ny notat"-CTA top-right
   - Search input
   - List of notes (each with date, title, content snippet, tags)
   - Click note → expand inline or open modal

   TAB: "Kommunikasjon"
   - Stats row: "12 sendt · 8 svart · 2 uleste"
   - Filter pills: "Alle | Spørsmål | Beskjeder | Plan-godkjenninger"
   - List of messages (threaded)

LAYOUT-DETAILS:
- Max-width container: 1280px
- Gap between major sections: 24px
- Cards: white bg, 16px radius, 1px border, p-6 padding
- KPI numbers: Inter Tight bold 32px, mono tabular-nums

ULIKT FRA VARIANT B + C:
- Tab-driven navigation (familiar pattern)
- Most flexible — coach can deep-dive in any direction
- Conservative on visual flair
- Best for coaches who want power without learning curve
```

---

## Variant B — Split-view (vertikal todeling)

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench INDIVIDUELT — Variant B (Split-view)
URL: /admin/agencyos?modus=individuelt&spiller=<id>
Viewport: Desktop 1440×900 (krever bred skjerm)

VISJON:
"Mac Finder / Notion-style split. Spiller-profil left, dynamic content right."

LAYOUT:

┌──────────────────────────────────────────────────────────────┐
│ TOP BAR (full bredde)                                         │
│ Spillervelger · Modus-toggle · Actions                        │
├────────────────────────┬─────────────────────────────────────┤
│ LEFT PANEL (320px)     │ RIGHT PANEL (1120px)                │
│ STICKY, scrollable     │ Dynamic content based on selection  │
│                        │                                      │
│ [Avatar 100px]         │ ┌─────────────────────────────────┐ │
│ Markus R.P.            │ │ ANALYTICS / CHAT / PLAN /       │ │
│ A1 · HCP -2.1 ↗       │ │ NOTES / COMMUNICATION           │ │
│                        │ │                                  │ │
│ [Send melding]         │ │ (full-bredde panel content)     │ │
│ [Ny økt]               │ │                                  │ │
│ [Generer plan]         │ │                                  │ │
│                        │ │                                  │ │
│ ─────────────          │ │                                  │ │
│ NAVIGASJON             │ │                                  │ │
│ ○ Oversikt             │ │                                  │ │
│ ● Analyse              │ │                                  │ │
│ ○ Treningsplan         │ │                                  │ │
│ ○ Tester               │ │                                  │ │
│ ○ Coach-notater (12)   │ │                                  │ │
│ ○ Kommunikasjon (3)    │ │                                  │ │
│ ○ Caddie-chat          │ │                                  │ │
│                        │ │                                  │ │
│ ─────────────          │ │                                  │ │
│ NØKKELTALL             │ │                                  │ │
│ SG-Total: +1.2         │ │                                  │ │
│ Plan-adh: 87%          │ │                                  │ │
│ Tester: 2 overdue      │ │                                  │ │
│ Mål: 3/4               │ │                                  │ │
│                        │ │                                  │ │
└────────────────────────┴─────────────────────────────────────┘

NAVIGASJONSOPPFØRSEL:
- Click på item i left panel → endre right panel content
- Right panel viser tab content som tar opp hele bredden
- URL-state: ?view=analyse&spiller=X
- Animation: subtle fade between right-panel content
- Left panel always shows player context (sticky)

LEFT PANEL DETAILS (320px):
- Avatar circle (lime border)
- Name in Inter Tight bold (24px)
- Brief stats line
- 3 primary action buttons (full-width)
- Navigation menu (vertical, 7 items)
- Bottom-section with key numbers

RIGHT PANEL — ANALYSE (eksempel):
- Big HCP-utvikling chart (full-width, 240px height)
- 4 SG-cards in grid
- Pyramide-bar chart
- Tester list (compact rows)

RIGHT PANEL — CADDIE-CHAT:
- Full-bredde chat interface
- 80vh tall
- Bottom input sticky
- Suggested-prompts as pills at top

ULIKT FRA VARIANT A + C:
- Persistent context (player always visible)
- Better for "deep-dive on one player" workflow
- Krever bred skjerm (1280px+)
- Mobile becomes Variant A style (tabs) automatically
- iPad portrait → collapsed left panel becomes drawer
- More like a desktop app (Notion, Linear, Figma) than a website
- Best for coaches who spend HOURS per session per player
```

---

## Variant C — Editorial command center

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench INDIVIDUELT — Variant C (Editorial command center)
URL: /admin/agencyos?modus=individuelt&spiller=<id>

VISJON:
"NYT editorial × Bloomberg terminal. Newspaper-style 'today's player'-page
 with command-line for power-actions."

LAYOUT:

┌──────────────────────────────────────────────────────────────────┐
│ HEADER (editorial newspaper feel)                                  │
│ "PLAYER OF THE HOUR" eyebrow                                       │
│ MARKUS R.P. (huge Inter Tight italic, 96px)                       │
│ "A1 amateur · -2.1 HCP · 21 days to peak"                         │
├──────────────────────────────────────────────────────────────────┤
│ COMMAND LINE / CADDIE-CHAT (sticky, narrow)                       │
│ [⌘ Spør Caddie om Markus...                              ▶ Send] │
│ Suggestion-chips: "drills" "tests" "plan" "compare"               │
├──────────────────────────────────────────────────────────────────┤
│ HEADLINE STORY (today's most important thing)                     │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ❶ DAGENS HOVEDPUNKT                                          │ │
│ │ "Markus' SG-PUTT er -1.4 siste fem runder — akutt fokus     │ │
│ │  bør være putting denne uka."                                │ │
│ │                                                                │ │
│ │ Recommendation: 3 gate-drill-økter × 30min                   │ │
│ │ [Implementer i plan] [Diskuter med Markus]                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ 3-COLUMN GRID (smaller stories)                                   │
│ ┌─────────────┬──────────────┬───────────────┐                   │
│ │ ❷ PLAN      │ ❸ FREMGANG   │ ❹ KOMMUNIK.   │                   │
│ │ Status: 87% │ HCP -10.3    │ 2 uleste msg  │                   │
│ │ adherence   │ siste 12 mnd │ Spør om plan  │                   │
│ │             │              │               │                   │
│ │ [Detaljer→] │ [Detaljer→]  │ [Detaljer→]   │                   │
│ └─────────────┴──────────────┴───────────────┘                   │
│                                                                    │
│ FEATURE SECTION: ANALYSE                                          │
│ Section title "Innsikt" (Inter Tight 48px, italic)                │
│ - HCP-graf full-width                                              │
│ - SG-radar mid                                                     │
│ - Pyramide-fordeling                                              │
│                                                                    │
│ SIDEBAR (bottom, full-width)                                      │
│ Notes-feed: 3 latest coach-notes (chronological)                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

KEY DESIGN MOMENTS:
- Player-name HUGE (newspaper masthead-style)
- "Headline story" approach — AI pre-curates the most important thing today
- Command line at top — Caddie always accessible (⌘K-like)
- Numbered sections (❶❷❸❹) for hierarchy
- Editorial typography (Inter Tight italic for storytelling)
- Less navigation, more "today's narrative"
- Notes-feed like newspaper "letters to editor" section

ULIKT FRA VARIANT A + B:
- Storytelling format (not data-grid)
- AI curates priority (vs coach choosing)
- Command line replaces tabs
- Less for power-users, more for "what should I focus on today"
- Best for coaches who manage 10+ players (helps them prioritize)
- Most innovative — risk of taking longer to learn
```

---

# COACH WORKBENCH (GRUPPE) — 3 VARIANTER

## Variant A — Tabell-view (klassisk admin)

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench GRUPPE — Variant A (Tabell-view)
URL: /admin/agencyos?modus=gruppe&gruppe=<id>

INFORMASJONS-ARKITEKTUR:

1. TOP BAR (sticky)
   - Tilbake-link · Gruppevelger · Modus-toggle

2. GRUPPE-HERO
   - Gruppenavn: "WANG Toppidrett U16" (Inter Tight italic 32px)
   - Sub: "12 spillere · 3 coacher · Neste samling 28. mai"
   - CTAs: "Ny samling" · "Send melding til alle" · "Eksportér rapport"

3. DAGLIG BRIEF (AI-generert)
   - Card med eyebrow "DAGENS BRIEF · 2026-05-25 · 06:00"
   - 200-ord tekst-blokk fra Caddie
   - "Re-generer"-knapp + "Forklar mer"

4. KEY GROUP METRICS (4 cards)
   - Snitt HCP-utvikling: -1.2 strokes/3 mnd
   - Aktive flagg: 5
   - Snitt SG-Total: -3.4 (B1)
   - Snitt plan-adherence: 78%

5. AKTIVE FLAGG (warning panel)
   - 3-5 cards som rødt-flagger kritiske spillere
   - Eks: "Markus R.P.: SG-PUTT -1.6 (akutt) — foreslå 4 ukers fokus"
   - Each flag → click → drill-ned til individuell-view

6. SPILLERENS UKA TABELL (hovedinnholdet)

   ┌──────┬──────────┬────────┬─────────┬─────────┬───────┬──────────┐
   │ Spil │ Status   │ Plan%  │ HCP     │ Siste   │ Tester│ Aksjon   │
   │      │          │ (uka)  │ trend   │ runde   │ overdue│         │
   ├──────┼──────────┼────────┼─────────┼─────────┼───────┼──────────┤
   │ AVA  │ ●● Aktiv │ 100%   │ -2.1 ↗ │ 8.2.SG  │ 0     │ [Åpne →] │
   │ AVA  │ ●● Aktiv │ 67%    │ +3.0 ↘ │ 12.4.SG │ 2 ⚠   │ [Åpne →] │
   │ AVA  │ ○ Tom    │ 0%     │ 5.0 ?  │ —       │ 3 ⚠⚠  │ [Åpne →] │
   │ ...  │          │        │        │         │       │          │
   └──────┴──────────┴────────┴─────────┴─────────┴───────┴──────────┘

   - Sortable per kolonne
   - Filter: Status (Aktiv/Inaktiv/Skadet)
   - Search: navn
   - Click hele rad → drill-ned til individuell-view (Variant A av Coach Individuelt)

7. KOMMENDE GRUPPE-ØKTER
   - Mini-kalender (uke-view) med samlinger + fellestrening
   - "Ny samling +"-CTA

8. LAG-RESULTATER (data viz)
   - Stall-pyramide-snitt (5-akse bar chart)
   - Snitt HCP-utvikling line chart
   - Sammenligning mellom spillere

ULIKT FRA VARIANT B + C:
- Tabell-fokus (klassisk for admin)
- Sortable + filterable data
- Best for klubb-admin med 20+ spillere
- Tett informasjons-tetthet
- Mobile: tabell blir kort-stack
```

---

## Variant B — Card-grid (visuelt)

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench GRUPPE — Variant B (Card-grid)
URL: /admin/agencyos?modus=gruppe&gruppe=<id>

VISJON:
"Pinterest of players — visual overview, each spiller as a tile."

LAYOUT:

1. TOP BAR + GRUPPE-HERO (samme som Variant A)

2. DAGLIG BRIEF (kompakt — kun 50 ord, full versjon i drawer)

3. AKTIVE FLAGG (3 store cards horizontal)

4. SPILLER-GRID (hovedinnholdet)

   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │ [AVA stor]      │ │ [AVA stor]      │ │ [AVA stor]      │
   │ Markus R.P.     │ │ Sofie L.        │ │ Tobias H.       │
   │ A1 · HCP -2.1↗  │ │ A2 · HCP +3.0↘  │ │ B1 · HCP 5.0 ? │
   │                 │ │                 │ │                 │
   │ ●● Aktiv        │ │ ⚠ Trenger oppfølg│ │ ○ Inaktiv 30d  │
   │ Plan: 100%      │ │ Plan: 67%       │ │ Plan: 0%        │
   │ SG: +1.2 ↗      │ │ SG: -2.4 ↘     │ │ SG: —           │
   │                 │ │                 │ │                 │
   │ [Åpne profil →] │ │ [Åpne →]        │ │ [Vinn tilbake]  │
   └─────────────────┘ └─────────────────┘ └─────────────────┘

   - 3-col grid på desktop, 2-col tablet, 1-col mobile
   - Each card ~280px height
   - Click → drill-ned til individuell-view
   - Hover: lift -4px + border-primary
   - Cards med flagg har rød border-left (4px)

5. SAMLINGER-KALENDER (full-width)

6. STALL-PYRAMIDE (full-width data viz)

ULIKT FRA VARIANT A + C:
- Visuelt orientert (bilde-grid)
- Best for små grupper (5-15 spillere)
- Mindre data per card, mer plass for visualisering
- Klikk-vennlig: hele cardet er klikkbart
- Tablet/mobile fungerer naturlig (grid kollapser)
- Følelse: "møte stallen min" vs "lese rapport"
```

---

## Variant C — Pyramide-fokus (data-viz tung)

```
[FELLES DESIGNSYSTEM-PREFIKS]

PAGE: CoachHQ Workbench GRUPPE — Variant C (Pyramide-fokus)
URL: /admin/agencyos?modus=gruppe&gruppe=<id>

VISJON:
"AK Golf's signature pyramide-modell som hovedinngang. Alt navigasjon
 fra pyramiden."

LAYOUT:

1. TOP BAR + COMPACT HERO

2. SENTRAL STALL-PYRAMIDE (60vh på desktop, fyller skjermen)

   ┌─────────────────────────────────────────────────────┐
   │              STALL-PYRAMIDE (12 spillere)            │
   │                                                       │
   │                  ┌─────┐                              │
   │                  │ TURN│ 5% (mål 5%)                  │
   │                  └─────┘                              │
   │              ┌──────────────┐                         │
   │              │   SPILL      │ 15% (mål 10%) +5pp      │
   │              └──────────────┘                         │
   │         ┌────────────────────┐                        │
   │         │      SLAG          │ 20% (mål 25%) -5pp     │
   │         └────────────────────┘                        │
   │    ┌─────────────────────────────┐                    │
   │    │         TEK                  │ 30% (mål 30%) OK   │
   │    └─────────────────────────────┘                    │
   │ ┌────────────────────────────────────┐                │
   │ │            FYS                      │ 30% (mål 30%) │
   │ └────────────────────────────────────┘                │
   │                                                       │
   │ Trend siste 30d: FYS↓ TEK↑ SLAG↓ SPILL↑ TURN→         │
   └─────────────────────────────────────────────────────┘

   - Click på en akse → filter spiller-listen til de som mangler i den aksen
   - Hover → tooltip med detaljer
   - Each level proportional to actual %
   - Color-coded per akse

3. SIDE-BY-SIDE: AKTIVE FLAGG + SPILLER-LISTE
   - Left (40%): Aktive flagg (3-5 prioriterte)
   - Right (60%): Spiller-liste filtrert av pyramide-klikk
     - Compact rows (avatar + name + HCP + status)
     - Click → drill ned

4. UKAS GRUPPE-ØKTER (compact horizontal kalender)

5. KEY GROUP NUMBERS (4 KPIs i en rad)

ULIKT FRA VARIANT A + B:
- AK Golf-signatur pyramide som hovedfokus
- Best for å forstå gruppe-balansen på et blikk
- Filtrert navigasjon (pyramide-akse → relevante spillere)
- Mest visuelt unikt — ingen andre golf-apper har dette
- Krever forklaring til nye brukere (læringskurve)
- Best for klubb som tror på pyramide-tilnærmingen
```

---

# BRUK + ANBEFALING

## Hvordan bruke dette dokumentet

1. **Velg variant per workbench-type** (3 valg å gjøre):
   - Player Workbench: A, B eller C?
   - Coach Individuelt: A, B eller C?
   - Coach Gruppe: A, B eller C?

2. **Lim inn én prompt om gangen** i Claude Design

3. **Iterér på resultatet** med Claude Design — refine tekst, fjern/legg til seksjoner

4. **Eksportér til HTML** når fornøyd

5. **Send til implementering** — vi koder pixel-perfekt mot HTML-en

## Min anbefaling per brukstilfelle

### Hvis du vil...

| Mål | Anbefalt kombo |
|---|---|
| Beta-test enkelt + skalerbart | Player A + Coach Ind A + Coach Gruppe A |
| Premium luxury-feel | Player B + Coach Ind C + Coach Gruppe B |
| Maximum data-tetthet | Player C + Coach Ind B + Coach Gruppe A |
| AK Golf-merkevare-signatur | Player A + Coach Ind C + Coach Gruppe C |
| Coach med mange spillere | Player A + Coach Ind C + Coach Gruppe A |
| Coach med dypde-fokus | Player A + Coach Ind B + Coach Gruppe B |

## Tekniske notater

- Alle prompts antar designsystemet ovenfor er fastlagt
- Claude Design bør respektere 8pt-grid + Lucide-only + tre fonter
- Hvis Claude Design avviker fra spec — re-iterer
- Eksport: HTML for forhåndsvisning, JSON for variabler
