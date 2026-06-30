# AK Golf HQ — Design System

> Elite golf-coaching & performance-analysis platform for **AK Golf Group**.
> Anchor: **"DataGolf meets The Athletic, if they'd met on Linear."** Data-driven, calm, precise. Numbers are heroes. Never gym-sales hype.
> Direction: **HYBRID** — editorial-light for the player, terminal-dark for the coach, bound by one locked signature: **lime `#D1F843`**.
> Language: **Norwegian bokmål, "du"-address.** No emoji. Lucide icons only.

---

## 1 · What AK Golf HQ is

One platform for AK Golf Group: elite golf coaching and performance analytics. Four products plus a public stats platform, all under one roof and one design system:

| Surface | Route | Device | Theme | Who |
|---|---|---|---|---|
| **PlayerHQ** | `/portal` | mobile-first (90 % mobile) | **light** | The player — "what do *I* do today" |
| **AgencyOS** | `/admin` | desktop-first (+ full mobile) | **dark / terminal** | Coach / admin — "who needs *me*" |
| **Forelderportal** | `/forelder` | mobile + desktop | light | Parents — read-only insight |
| **Marketing** | `/` (akgolf.no) | desktop + mobile | light, editorial | Sales / lead |
| **Stats** | `/stats` | desktop + mobile | own expression | Public golf database (separate track) |

**Workbench** is a shared planning core inside both PlayerHQ and AgencyOS. *Anders (the owner) designs the Workbench flow himself* — skin it visually, never override its function. When a design choice could collide with Workbench, **ask Anders first**.

### The hybrid in one sentence
- **PlayerHQ (light, mobile):** reads like a premium sports magazine — warm cream ground, legible in sun — but charged with "terminal energy" in the data moments: mono numbers, hairline rules, tight KPI cells, electric lime, an SG ticker.
- **AgencyOS (dark, desktop):** the coach's Bloomberg terminal — near-black forest, dense data, lime as the *only* signal on active rows / positive deltas. The background grid is **barely visible** (a hint, not a net); hairlines organize the data.
- **Lime binds the two expressions into one brand.**

### Locked product decisions (IA — do not change, design around)
- Coach app is **AgencyOS** — never "CoachHQ".
- **Planning = Workbench.** "Plan" is ONE tap into Workbench (not a menu of cards), for both coach and player. Zoom levels: **Year (Gantt) → Week → Session**.
- **Analysis is one surface with tabs:** Analyse + TrackMan + Rounds + SG + Tests. Goals live in Overview, edited in Workbench.
- **Subscription:** GRATIS (free) or PRO (300 kr/mnd). "Performance / Performance Pro" are *coaching packages, not app tiers*. **"ELITE" is never shown.**
- Tier pill in hero: `PlayerHQ · {tier}` (+ `· HCP {hcp}` on desktop), `{tier}` = GRATIS or PRO.
- FYS test results = placeholder numbers (the formula is not locked).

### Demo names (always full names)
- Player = **Øyvind Rohjan** (initials ØR, HCP 4,2)
- Coach = **Anders Kristiansen**
- Real coach **Markus Røinås Pedersen** is kept on marketing pages.

---

## 2 · Sources given

This system was built from a handover pack (all Norwegian). The visual source of truth is the chosen **Hybrid** mockup + interactive component lab:

- **Live reference:** `https://akgolf-redesign.vercel.app` (cards "D · Hybrid" and "E · Komponent-lab").
- `uploads/D-hybrid.html` / `.png` — the full hybrid mockup. **Exact token + component CSS lifted from here.**
- `uploads/E-komponent-lab.html` / `.png` — 18 interactive, gamified components (data-viz, gamification, Notion-style views).
- `uploads/10-MASTER-BRIEF.md` — full product spec, philosophy, locked decisions.
- `uploads/15-DESIGN-SPRAK-TOKENS.md` — exact tokens (the basis of `tokens/`).
- `uploads/20-KOMPONENT-SPEC.md` — complete component library spec.
- `uploads/40-SKJERM-INVENTAR.md` / `50-FLYT-DODE-KNAPPER.md` / `60-WORKBENCH-NOTAT.md` — screen set, dead-button map, Workbench note.
- `uploads/eksisterende-*.png` — screenshots of today's ~80 AK components (hero, dataviz, calendars, cards, lists, shell, primitives).
- `uploads/inspirasjon-*.png` — mood references (dark, lime, glass, rich data-viz). Mood, not spec.
- Drive: `AK Golf Group → software → akgolf-hq` (referenced; reader access not assumed).

> The reader is not assumed to have access to these — paths/links are stored here in case they do.

---

## 3 · Content fundamentals

**Language & address.** Norwegian bokmål, informal **"du"**. Sentence-case headings ("God morgen, Øyvind." / "Strokes gained *i dybden*"). Eyebrows and KPI labels are **MONO CAPS** ("SISTE 10 RUNDER", "SG PER KATEGORI").

**Tone.** Calm, precise, expert. The number is the hero and the reward — never hype, never exclamation-mark energy. "Elite-gamification, never Candy Crush." Reward language is mastery / progress / percentile / streak / "next level" — for serious athletes. Examples from the product: *"To økter står på planen."* · *"Strokes gained i dybden"* · *"Hvem trenger meg nå"* · *"Ikke bryt kjeden"* (don't break the chain) · *"topp 12 %"*.

**Numbers & casing (Norwegian, always in JetBrains Mono, tabular).**
- Comma decimal: `48,3` · `72,4` · HCP `4,2`
- Space thousand-separator: `1 240 m` · `142k`
- Percent after a space: `48 %` · `82 %`
- 24-hour time: `14:30`
- Signed deltas with direction + color: `+1,7` (lime/green up), `−0,4` (red down).

**No emoji. Ever.** Iconography is Lucide only (see §6). Italic `<em>` inside a display heading is an *editorial accent* rendered in forest (light) or lime (dark) — that is the one expressive flourish.

**Every data surface ships all four states:** content · empty (with a next action) · loading (skeleton pulse, never a spinner) · error. **No dead buttons** — every button has a destination; core actions ≤ 2 taps with a clear "next step".

---

## 4 · Visual foundations

**Colors.** Warm editorial neutrals (cream `#FAFAF7`, never pure white; sand, paper) with a deep **forest** axis (`#005840`/`#00402F`) and the locked **lime** `#D1F843`. Terminal expression is a near-black forest stack (`#07100C` → `#16291F`) with hairline edges. **Lime is spice, never wallpaper:** primary CTA, active state, KPI pulse, focus, positive delta. Never large lime fields; never lime text on lime (dark text on lime). Status: up/ok green, down/urgent red, warn amber, info blue — with dedicated terminal variants (brighter, on 10 % tinted backgrounds).

**Type.** Inter (UI/body), Inter Tight (display/hero, tight `-0.035em` tracking, editorial italics), JetBrains Mono (all numbers, eyebrows, labels — always tabular-nums). Big confident display, generous negative tracking; small mono caps for structure.

**Backgrounds & texture.** Light: subtle radial gradients — forest ~6 % top-right, lime ~10 % top-left — washed over cream. **No flat color heroes:** hero units are atmospheric golf imagery under a dark gradient (in mockups, a layered forest radial-gradient stands in for photography). Terminal: a barely-visible grid (`rgba(180,225,195,.035)`, 32px) — a hint only; hairlines do the structural work. Players' light screens carry a faint 30px dot/line grid too (`rgba(10,31,23,.045)`).

**Cards.** Light: `--paper` fill, `1px --border`, radius `--r-lg` (20px), soft shadow `--sh-md`. Forest "session" cards use a `150deg` forest gradient, `--sh-forest` glow, and a lime radial bloom in the corner. Terminal cards: `--t-bg-2/3` fill, `--t-line-2` edge, radius 8px, the grid overlay. Coach KPI cells are hairline-divided grids, not separate cards.

**Borders & hairlines.** 1px everywhere; hairlines (`--border-soft` light, `--t-line-soft` dark) divide rows, cells, KPI strips, timeline items. Tables and KPI strips lean on hairlines instead of boxes.

**Radii.** `8 / 14 / 20 / 28 / 999`. Buttons and pills are fully rounded (`--r-full`); cards `--r-lg`; hero `--r-xl`; small chips/terminal cards `--r-sm`.

**Shadows.** Light, low, warm-tinted (`rgba(10,31,23,…)`): `--sh-sm` for resting cards, `--sh-md` default, `--sh-lg` for elevated/terminal windows, `--sh-forest` for the green session card. Terminal leans on borders + the grid, not big shadows.

**Motion.** 150–250 ms, ease-out in. **Progress animates** — bars fill, numbers count up, the percentile needle climbs, the mastery ring fills and pulses on level-up. **Skeleton pulse/shimmer, never a spinner.** Pulse-dot for live data (`ak-pulse`). Nothing over 400 ms outside a hero reveal. `prefers-reduced-motion` respected globally.

**Hover / press.** Hover: lime CTA → `--lime-deep`; terminal surfaces lift one step (`--t-bg-3` → `--t-bg-4`); cards lift `translateY(-2px)` + stronger shadow; rows tint with `--lime-bg` or `--t-bg-3`. Focus: lime ring. Active rows / "me" rows get a `--lime-bg` wash.

**Transparency & blur.** Used sparingly: glassy tier-pill over hero photos (`rgba(...,.14)` + `blur(8px)`), sticky top bars in the lab (`color-mix(... 78%)` + `blur(14px)`), lime tints as `rgba(209,248,67,.10/.16)` for soft surfaces.

**Imagery vibe.** Atmospheric, cool-green golf imagery under dark protection-gradients (so white text + lime read). Avatars are duotone-toward-forest with a lime gradient ring; initials in lime mono on `--forest-deep`.

**Layout rules.** Mobile shell: sticky status bar + top bar, sticky bottom nav. Terminal shell: 54px icon rail + 46px header + global ticker bar, then a multi-column cockpit. Max content width 1320px, 24px gutters.

---

## 5 · Theming

Light is the default (`:root`). Switch any subtree to the coach terminal expression with `data-theme="terminal"`:

```html
<body data-theme="terminal"> … </body>      <!-- AgencyOS -->
<div data-theme="terminal"> …card… </div>    <!-- a single dark card on a light page -->
```

Build against the **semantic aliases** (`--surface-card`, `--text-strong`, `--accent`, `--brand`, `--signal-up`, …) so a component works in both expressions. Raw palette tokens (`--cream`, `--forest`, `--lime`, `--t-bg-*`) remain available for expression-specific work.

---

## 6 · Iconography

- **System:** [Lucide](https://lucide.dev) — the only icon set. Stroke `1.5px`, nominal `24px` (scales down to 18/21px in dense UI). No icon font is bundled; load Lucide from CDN (`lucide@latest`) and render with `data-lucide="..."` + `lucide.createIcons()`, or use inline `<svg>` with `stroke-width="1.5"`.
- **No emoji, ever.** No unicode-glyph icons. Deltas use mono characters `▲ / ▼` (or signed numbers), not emoji.
- **No hand-drawn / improvised SVG iconography** — use real Lucide glyphs. (Decorative SVG like rings, sparklines, radar and dispersion plots are data-viz, not icons, and are drawn in components.)
- Common glyphs in product: `home`, `calendar`, `bar-chart-3`, `target`, `zap`, `bell`, `search`, `chevron-right`, `play`, `plus`, `sun`, `moon`, `flag`, `users`, `inbox`, `activity`, `trophy`.
- No photographic imagery was supplied (hero units use CSS gradients standing in for atmospheric golf photography). The **logo** is the AK lettermark — a stylized A·K monogram with the lime ball — supplied as SVG in `assets/logos/`:
  - `ak-golf-primary-on-light.svg` (forest mark + lime ball) · `ak-golf-primary-on-dark.svg` (lime mark) · `ak-golf-white-on-green.svg` · `ak-golf-white-on-dark.svg` · `ak-golf-primary-mono.svg` · `ak-golf-black-mono.svg` · `ak-golf-white-mono.svg`. Use the on-light variant on cream, the on-dark/lime variant on the terminal, white-on-green on forest fills. See `assets/logo.card.html`.

---

## 7 · Index — what's in this system

**Foundations** (`styles.css` → `tokens/`)
- `tokens/colors.css` — palette, semantic aliases, `[data-theme="terminal"]` scope, pyramid axes.
- `tokens/typography.css` — font families + type scale.
- `tokens/spacing.css` — spacing, radius, shadows.
- `tokens/motion.css` — durations, easings, keyframes, reduced-motion.
- `tokens/base.css` — resets, page atmosphere, `.mono` / `.eyebrow` helpers.

**Specimen cards** (Design System tab) — `guidelines/` (Type, Colors, Spacing, Brand groups).

**Components** (`components/<group>/`) — see each `*.prompt.md`:
- `core/` — Button, Badge, Avatar, Eyebrow
- `data/` — KpiCard, KpiRing, SgBar, PyramidProgress, StatTable
- `gamification/` — MasteryRing, StreakTracker
- `feedback/` — StatusPill, EmptyState, Skeleton

**UI kits** (`ui_kits/<product>/`)
- `playerhq/` — light mobile player app (home, analyse, …)
- `agencyos/` — dark terminal coach cockpit

**Templates** (`templates/<slug>/` — copy-ready starting points for consuming projects)
- `playerhq-screen/` — PlayerHQ player home screen (light editorial).
- `agencyos-cockpit/` — AgencyOS coach cockpit (dark terminal).

**Assets** — `assets/` (logo treatment card; Lucide loaded from CDN).

**Skill** — `SKILL.md` (Agent-Skills compatible).
