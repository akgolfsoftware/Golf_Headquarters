# Golf Shot Analytics

_Started 2026-05-16 15:50 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "AK Golf HQ_Main"
User is viewing file: 07-kalender-maaned.html
Current date is now May 16, 2026
</system-info>

<pasted_text name="Pasted text (91 lines)">
Du er en senior UI/UX-designer for AK Golf PlayerHQ. Lag et komplett skjermdesign (wireframe + komponentbeskrivelse) for visning av én importert TrackMan Multi Group Report i spillerprofilen.

---

## Kontekst

Spilleren har lastet opp en HTML-rapport fra TrackMan. Rapporten inneholder:
- Sesjonsnavn: "Test 4i", dato: 2026-03-19
- 10 køllegrupper: 4Iron (3 slag), 5Iron (8), 6Iron (5), 7Iron (5), 8Iron (5), 9Iron (5), 58Wedge (5), 54Wedge (5), 50Wedge (5), PitchingWedge (5) = 51 slag
- Per kølle, per slag: ClubSpeed (mph), ClubPath (°), SwingDir (°), LowPoint (cm/A-B), FaceAngle (°), BallSpeed (mph), FaceToPath (°), SmashFactor, TotalDistance (m), LaunchDir (°)
- Per kølle: én Gjennomsnitt-rad + én Konsistens-rad (standard avvik)

URL: /portal/mal/trackman/[sessionId]
Eksisterende TrackMan-side (/portal/mal/trackman/) viser trender på tvers av mange økter. Denne nye siden viser én økt i detalj.

---

## Designsystem (BRUK STRENGT)

**Farger (HSL-tokens):**
- Background: #FAFAF7 (lys), #0F2A22 (mørk)
- Card: #FFFFFF / #163027
- Primary: #005840 (CTA, aktiv tilstand)
- Accent: #D1F843 (highlight, badges)
- Muted-foreground: #5E5C57 (sekundær tekst)
- Border: #E5E3DD

**Typografi:**
- Instrument Serif italic → store overskrifter, editorial headings
- Geist → all UI-tekst, tabeller
- Geist Mono tabular-nums → alle tall og KPI-verdier

**Spacing:** 8pt-grid. Bruk: 8, 16, 24, 32, 40, 48, 64px.
**Radius:** Cards = 16px, inputs/knapper = 12px, badges = 9999px (pill)
**Ikoner:** Lucide React, 24px, 1.5px stroke, currentColor

---

## Skjermstruktur (5 seksjoner, topp til bunn)

### 1. SESSION HEADER
Enkel, luftig top-seksjon.
- Venstre: Instrument Serif italic 32px → «Test 4i»
- Under: Geist 13px muted → «TrackMan Multi Group · 19. mars 2026 · 51 slag · 10 køllegrupper»
- Badge: «html-import» pill (muted bakgrunn)
- Høyre: «Tilbake til trenden →»-lenke + «Be om coach-vurdering»-knapp (border-knapp)

### 2. KØLLE-VELGER (horisontalt scrollbart bånd)
Samme mønster som eksisterende bag picker, men tilpasset importert data.
- 10 kort, én per kølle, i fast rekkefølge: 4i → PW
- Hver card: øverst en farge-stripe (jern = #1A7D56, wedge = #B8852A)
- Kortnavn bold (f.eks. «7i»), under: avg total distance i Geist Mono stort («174 m»), under: antall slag monospace liten («5 slag»)
- Aktiv/valgt: primary grønn bakgrunn, hvit tekst, accent stripe
- Klikk på kølle → oppdaterer seksjone 3 og 4

### 3. KPI-STRIP (4 kort i rad, for valgt kølle)
Metric cards med sparkline. Vist for aktiv kølle (f.eks. 7Iron):
- «Avg Club Speed» → 91.5 mph
- «Avg Ball Speed» → 127.2 mph
- «Avg Total Dist.» → 174.4 m (primærtall, størst)
- «Smash Factor» → 1.39
Hver card: label mono 10px uppercase, verdi mono 26px bold, unit 13px muted. Ingen sparkline nødvendig (kun én økt = én datapunkt).

### 4. SLAG-TABELL (per valgt kølle, f.eks. 7Iron)
Kompakt datatabell med fast width-layout.

Kolonner (venstre → høyre):
| # | Club Speed | Club Path | Swing Dir. | Low Point | Face Ang. | Ball Speed | Face/Path | Smash | Total | Launch Dir. |
|---|---|---|---|---|---|---|---|---|---|---|

- Slag-rader: #1–#5, ren hvit/card bakgrunn, hover = secondary
- **Gjennomsnitt-rad**: tykk topp-border, `bg-primary/5`, bold tekst, «AVG» badge i primary farge
- **Konsistens-rad** (std.avvik): lys grå bakgrunn, «σ»-badge, alle tall i muted-foreground. NB: Low Point konsistens beholder A/B-suffiks.
- Kolonneheadere: mono 9.5px uppercase tracking, sticky top, secondary bakgrunn
- Total Distance-kolonnen: alltid highlighted med primary-farget tekst

Visuell indikator for Low Point-suffix: «A» = etter impact (normalt) = grønn dot, «B» = før impact = amber dot

### 5. KRYSSØKT SAMMENLIGNING (alle køllegrupper, full bredde)
Én tabell som viser alle 10 køllegrupper side om side. Kolonner:
Kølle | Slag | Avg Club Speed | Avg Ball Speed | Avg Total Dist. | Smash | Face Angle | Face/Path

- Køllenavn venstre, color-dot for type (jern/wedge)
- Highest total distance per rad → primary farget
- Klikk på rad → hopper opp til §3+4 for den køllen
- Under tabellen: kursiv liten tekst → «Alle distanser normalisert til 15°C, havnivå»

---

## Layout (desktop)

</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="AK Golf HQ_Main (design system)">
[Design System] This project uses the **AK Golf HQ_Main** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.
    
    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/`. Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# AK Golf HQ — Design System

A complete brand + UI system for **AK Golf HQ**, a Norwegian golf training and coaching platform. The product helps amateur and serious golfers train smarter through personalized programs, while giving coaches tools to manage players, schedules, and analytics.

## Source materials

This system was built from two uploaded references — **v2 is the current spec**:

- `uploads/design-system-v2.md` — **current Sprint 0 spec** (Den gjeldende). Token-list + UX rules + anti-AI rules + tier system + pyramide colors + forbidden legacy tokens. Authoritative when v1 conflicts.
- `uploads/branding-style-guide.html` — visual rendering of all tokens (logos, type, components, motion). Use as visual cross-reference.

**Source-of-truth hierarchy** (per v2): `branding-style-guide.html` → `design-system.md` → `globals.css` → this design system. Heritage Grid (M3) tokens are **DEPRECATED**.

No codebase, no Figma URL, and **no logo SVG files** were attached. The style guide referenced filenames like `logos/ak-golf-logo-primary-on-light.svg` but the actual files are missing — see the **Caveats** section below.

## Products represented

The system serves three surfaces. Names below are the ones used inside the brand guide:

1. **PlayerHQ** — the player-facing app. Light theme on warm cream `#FAFAF7`. White sidebar with primary-green active state. Editorial italic greeting at top (*"Onsdag, Markus. To dager siden sist."*). Training plans, bookings, stats, profile.
2. **CoachHQ** — the coach-facing app. **Dark rail** (`#061210`) with five icon-only nav slots, plus a light cream secondary nav. Lime accent for active rail items. Dashboard, players, schedule (timeplan), analytics, programs.
3. **Landing** — marketing pages. Pure black hero (`#0A0A0A`), white display type, lime CTA. Used for the entrypoint and any high-impact dark moment.

## File index

| Path | What it is |
|---|---|
| `README.md` | This file. Brand context + foundations + iconography. |
| `colors_and_type.css` | All design tokens as CSS variables, plus semantic type classes. |
| `SKILL.md` | Cross-compatible skill manifest for Claude Code / Agent Skills. |
| `assets/logos/` | 7 wordmark variants + 1 favicon mark. **Placeholders** — see Caveats. |
| `preview/` | Card-sized HTML files registered to the Design System tab. |
| `ui_kits/player-hq/` | PlayerHQ UI kit — interactive dashboard recreation. |
| `ui_kits/coach-hq/` | CoachHQ UI kit — coach dashboard with dark rail. |
| `ui_kits/landing/` | Marketing landing page recreation. |
| `uploads/branding-style-guide.html` | Original style guide (visual reference). |
| `uploads/design-system-v2.md` | **Current Sprint 0 spec** — authoritative tokens + rules. |

---

## CONTENT FUNDAMENTALS

### Language

The product is **Norwegian (Bokmål)** first. UI strings, navigation labels, and all in-app copy are written in Norwegian. Examples lifted from the style guide:

- Greeting: *"Onsdag, Markus. To dager siden sist."* (editorial italic — observation, not address)
- Nav: *Dashboard, Treningsplan, Bookinger, Statistikk, Profil* (PlayerHQ); *Spillere, Timeplan, Analyser, Programmer* (CoachHQ)
- Drill names: *Putting drill, Nærspill-økt, Ukentlig mål*
- Tagline: *"Tren smartere. Spill bedre."*
- Hero copy: *"AK Golf gir deg personlig treningsplan, data-drevet coaching og verktøyene du trenger for å ta spillet ditt til neste nivå."*
- CTA: *"Kom i gang"*

When generating new copy, write in Norwegian Bokmål by default. Use English only for international/marketing surfaces if explicitly asked.

### Tone & voice

- **Editorial, not chummy.** Per anti-AI rule #9: **never** use *"Welcome back, [Name]!"* or *"God morgen, Henrik"*. Instead, write contextual italic fragments that **observe** rather than greet.
- **Maks 1 italic-element per skjerm.** Reserve italic Inter Tight for the single editorial moment.
- **Coach-like.** Direct, action-oriented, focused on improvement.
- **Confident but not loud.** No exclamation marks, no emoji, no hype words.
- **Du-form for the user.** Norwegian "du" — informal, direct.
- **Sentence case for everything.** Headings, button labels, nav items, pill labels.
- **No emoji.** None of the source materials use emoji; do not introduce them.

### Editorial greeting examples

The greeting should feel like a sentence overheard, not a welcome banner:

| Surface | Example | Why |
|---|---|---|
| PlayerHQ Hjem | *"Onsdag, Markus. To dager siden sist."* | Observation about cadence, not address. |
| PlayerHQ Hjem (fresh) | *"Klar for putte-økt?"* | Situation-specific cue. |
| CoachHQ Dashboard | *"Onsdag morgen. 38 spillere venter."* | State of the day, not "Hi coach!". |
| Stats screen | *"Sju runder denne måneden."* | Reflective, sets context. |

### Examples

| Bra (good) | Unngå (avoid) |
|---|---|
| Onsdag, Markus. To dager siden sist. | God morgen, Henrik 👋 / Welcome back! |
| Tren smartere. Spill bedre. | 🏌️ Level up your game! |
| Du har 3 økter igjen denne uken | You've got 3 sessions left this week, friend! |
| Putting drill — 25 % | Putting Drill — 25% Complete ✓ |
| Kom i gang | Get Started Now → |

### Numerics

- **JetBrains Mono with `tabular-nums`** for KPIs, deltas, percentages, dates, scores.
- Decimal separator follows Norwegian convention: comma in display strings (e.g. `12,4`) but the style guide samples actually use a period (`12.4`) — match the source exactly when in doubt.
- Positive deltas show in **status-success green** (e.g. `+2.3`); never in lime.

---

## VISUAL FOUNDATIONS

### Colors

The palette is **deep forest green + warm cream + a single lime accent**. Lime is the brand's signature — used sparingly and never on large fills.

- **Brand**: Forest green `#005840` (primary), Lime `#D1F843` (accent), Accent-on `#0A1F18` (text on lime).
- **Surface**: A warm cream system — `#FAFAF7` (body), `#F5F2EA` (sand/inset), `#FFFFFF` (cards). The cream is *intentionally* warm — never use pure neutral grays for surfaces.
- **Ink**: `#0A1F18` (a near-black with a green undertone, never pure `#000`), `#5E5C57`, `#9C9990`, `#C4C0B8`.
- **Status**: Forest-toned greens for success (not lime!), warm ochre for warning, brick red for danger.
- **Dark surfaces**: `#0A0A0A` for landing hero, `#061210` for the CoachHQ rail.

See `colors_and_type.css` for the full list.

### Typography

Three families, all from Google Fonts — **no font substitutions needed**.

- **Inter Tight** — display family. Used for headings, hero, section titles. The brand signature is **italic Inter Tight 36px** for editorial greetings (*"Onsdag, Markus. To dager siden sist."*).
- **Inter** — body and UI. 15px regular for prose, 14px medium for buttons, 12px medium uppercase with `0.04em` tracking for labels.
- **JetBrains Mono** — KPIs, numbers, deltas, code. Always with `font-variant-numeric: tabular-nums`.

Letter-spacing is **negative** for display sizes (`-0.02em` to `-0.03em`) and **positive** (`0.04em`) for uppercase labels.

### Spacing & layout

- 4px base. Most padding lands at 12 / 16 / 20 / 24 / 32 / 48px.
- Page-level horizontal padding is **48px** on desktop, dropping to 20px on mobile.
- Sections separate via 56px vertical padding + a hairline `--line-soft` divider, not heavy backgrounds.
- Grids use generous `gap` (16–24px); never margin hacks. Always flex/grid with explicit gap.

### Backgrounds

- **No gradients on surfaces.** The only gradient in the system is the lime progress-fill (`#D1F843 → #C2EE2F`).
- **No hand-drawn illustrations.** No textures, no patterns.
- **No full-bleed photography in the style guide.** The system is type- and component-driven; if hero imagery is needed, expect crisp golf course or training environment photos with cool/neutral grading (placeholders OK until provided).
- The dark hero (`#0A0A0A`) is **flat black**, not a gradient.

### Corners & shape

- **20px** for cards (`--radius-card`). The system's defining radius — soft but not pillowy.
- **12px** for buttons and interactive controls (`--radius-control`).
- **10px** for small inset chips/icons in the dark rail.
- **8px** for tight elements (motion-spec chip, tag chip).
- **100px** (pill) for badges, week-pills, progress-track.
- **50%** circle for avatars and streak dots.

### Borders

- Hairline `1px solid --line` (`#E5E3DD`) on cards and most surfaces.
- `--line-soft` (`#EFEDE6`) for hairline dividers between sections.
- Borders are warm (slightly cream) to match the surface system, never cool gray.
- The CoachHQ rail uses **no border**, just contrasting fill against the cream nav.

### Shadows & elevation

Two-stop shadow system, both very soft:

- `--shadow-card`: resting state. `0 1px 3px rgba(10,31,24,0.06), 0 1px 2px rgba(10,31,24,0.04)`.
- `--shadow-card-hover`: lifted state. `0 4px 12px rgba(10,31,24,0.08), 0 2px 4px rgba(10,31,24,0.04)`.

Note the alpha is keyed to **`rgba(10,31,24, …)`** — the ink color, not pure black. This keeps shadows feeling warm.

The lime "today" streak dot uses a 3px **outer glow** in `--accent-fill` instead of a drop shadow:
```css
box-shadow: 0 0 0 3px var(--accent-fill);
```

### Motion

A small, opinionated motion vocabulary. **One easing. Three durations.**

- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (sharp ease-out). Used for *everything*. No bounces, no springs, no overshoots.
- **Durations**: `120ms` (micro: hover, color swaps), `200ms` (short: shadow tweens, route hints), `320ms` (large: card entrance, page transitions).
- **Card entrance**: fade + 20px slide-up.
- **No looping animations**, no skeleton shimmers in the source — though shimmers would fit (use the cream tonality).

### Hover states

- **Primary button**: shifts to `--brand-primary-hover` (darker forest).
- **Accent button**: shifts to `--brand-accent-hover` (slightly more saturated lime).
- **Ghost button**: gains `--surface-alt` background and `--ink-disabled` border.
- **Sidebar item**: gains `--surface-alt` background.
- **Primary button extra polish**: at hover, gains a soft glow `0 4px 16px rgba(0,88,64,0.2)`.

### Press / active states

- Buttons **scale to 0.97** with 120ms transition. This is the only "interactive" transform in the system.
- No color change on press; the scale alone signals it.

### Transparency & blur

- Lime is used as **transparency** in three tiers: `0.12`, `0.25`, `0.30` for `--accent-bg`, `--accent-fill`, `--sidebar-coach-active` respectively.
- Forest green appears as transparency in `--sidebar-player-active` (`rgba(0,88,64,0.08)`).
- **No `backdrop-filter: blur()`** in the source. The system favors solid surfaces.

### Cards

Three-tier hierarchy:

1. **Flush** — transparent background, no border, no shadow. For inline content that doesn't need separation.
2. **Standard** — white fill, `1px --line` border, `--shadow-card`. The default.
3. **Featured** — `--accent-bg` (12% lime tint) fill, `1px --line` border, `--shadow-card-hover`. For CTAs and highlighted cards.

All three: `--radius-card` (20px), 24px padding.

### Lime usage rules (critical)

The single most-violated rule. **Lime is for accent, not fill.**

✅ **Riktig (right)** — CTA buttons, active pills, today's streak dot, progress-bar fill, positive deltas (+2.3).

❌ **Feil (wrong)** — Large background fills, body text in lime, every badge in lime, gradients with lime, icons in lime (use primary green instead), logos placed on lime (no variant has enough contrast).

---

## ICONOGRAPHY

### System

The brand uses **[Lucide](https://lucide.dev)** icons exclusively. Stroke `1.75`, round line caps, round line joins. No icon font, no sprite, no custom illustrations.

```
stroke-width: 1.75
stroke-linecap: round
stroke-linejoin: round
fill: none
```

### Sizes

- **18px** — standard inline (sidebar items, button leading icon, list bullets).
- **20px** — section headers, dark-rail nav (CoachHQ).
- **24px** — hero, large CTA, page-level icons.

### Color

Icons are stroked in `currentColor` and inherit text color. Common pairings:

- `--ink` — default UI icons.
- `--ink-muted` — secondary affordances.
- `--brand-primary` — active sidebar item (PlayerHQ).
- `--brand-accent` — active rail icon (CoachHQ dark rail).
- `#FFFFFF` (with 0.5 alpha) — inactive dark-rail icons.

### Loading

For prototypes inside this system, load Lucide via the official CDN:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="calendar"></i>
<script>lucide.createIcons();</script>
```

Or for static SVG inline use, copy from <https://lucide.dev/icons>.

### What is *not* used

- **No emoji.** Anywhere.
- **No Unicode pictographs** (★ ✓ ✗ ➜). Use real Lucide icons for check, cross, arrow, star.
- **No mixed icon sets.** Don't pair Lucide with Heroicons, Phosphor, etc.
- **No filled-style icons.** All Lucide icons used are stroke-only.

---

## PYRAMIDE COLORS — training-layer system

Five official AK Golf training layers with their own color tokens. Used in `PyramideRinger` (5 nested arcs) and pyramide-progress-bars on session cards.

| Layer | Token | Hex | Meaning |
|---|---|---|---|
| **FYS** | `--pyr-fys` | `#005840` | Fysisk fundament (physical foundation) |
| **TEK** | `--pyr-tek` | `#1A7D56` | Teknikk (technique) |
| **SLAG** | `--pyr-slag` | `#D1F843` | Slagprogresjon (shot progression) |
| **SPILL** | `--pyr-spill` | `#B8852A` | Banespill (course play) |
| **TURN** | `--pyr-turn` | `#5E5C57` | Turnering (tournament) |

These colors are **only** used inside the pyramide system. Don't repurpose `--pyr-spill` (ochre) as a generic warning color — use `--status-warning` for that.

---

## TIER SYSTEM (PlayerHQ)

| Tier | Accent | Token | Use |
|---|---|---|---|
| **Gratis** | Neutral gray | `--tier-gratis` (`#9C9990`) | Default. Basic features only. |
| **Pro** | Primary green | `--tier-pro` (`#005840`) | Most-common paid tier. |
| **Elite** | Accent lime | `--tier-elite` (`#D1F843`) | Top-tier. |

**Tier-gating pattern.** Locked features render at **40% opacity** with a Lucide `Lock` icon and a CTA: *"Oppgrader til Pro"* / *"Oppgrader til Elite"*.

---

## NORWEGIAN UX CONVENTIONS

- **Language:** Bokmål with æ, ø, å spelled correctly throughout.
- **Decimal separator:** comma — `78,5` not `78.5`. (The branding-style-guide samples occasionally use a period; v2 spec wins — use comma.)
- **Date:** *"7. mai 2026"* (long) or `07.05.26` (short).
- **Time:** 24-hour — `14:00`, never `2:00 PM`.
- **Fractions over percent:** prefer *"12/16 økter"* to *"75 %"* for completion counts.
- **No emoji** — Lucide icons only.

---

## ANTI-AI RULES (must follow)

These guardrails prevent the system from drifting into generic LLM-design territory. From v2 spec:

1. **Flat avatar colors.** No gradients on avatars — use solid brand fills with white initials.
2. **Asymmetric grid layouts.** Avoid uniform 3×1 / 4×1 grids; mix column spans.
3. **No `translateY(-3px)` hover on everything.** Reserve lift for cards that genuinely warrant it.
4. **Max 1–2 eyebrows per screen.** Don't pill-spam.
5. **Varied section layouts on landing.** Alternate split / centered / full-width — don't repeat the same hero pattern down the page.
6. **Reduced pill density.** Pills are precious; use one or two per row, not five.
7. **No ambient-glow decorations.** No blurred lime blobs floating behind heroes.
8. **Stronger typographic contrast** between hierarchy levels.
9. **Never** *"Welcome back, [Name]!"* — use the italic editorial greeting (*"God morgen, Henrik"*).

---

## FORBIDDEN LEGACY TOKENS (Heritage Grid M3 — DEPRECATED)

Reject any of these and use the replacement instead.

| Forbidden | Replacement |
|---|---|
| `#154212` (Heritage primary) | `#005840` (`--brand-primary`) |
| `#d2f000` (Heritage accent) | `#D1F843` (`--brand-accent`) |
| `#fdf9f0` (Heritage surface) | `#FAFAF7` (`--surface`) |
| `#1c1c16` (Heritage on-surface) | `#0A1F18` (`--ink`) |
| DM Sans | Inter / Inter Tight |
| Material Symbols | lucide-react |
| `--hg-*` tokens | (removed entirely) |
| `--color-portal-*` tokens | (removed entirely) |

---

## Caveats & known gaps

- **Logo files are wordmark placeholders.** The original style guide referenced 7 SVGs in `logos/` but those files were not uploaded. I generated typographic wordmarks ("AK·GOLF") in Inter Tight using the brand colors. **Please upload the real logo files** (any of: SVG, AI, PNG @2x) to `assets/logos/` and they will drop in cleanly — filenames already match the references.
- **No codebase or Figma was provided.** UI kits are recreations from the style guide screenshots/component definitions, not from production code. Component layouts (especially data tables, filter UIs, modals, settings pages) are inferred and should be cross-checked.
- **Norwegian copy.** All UI strings are in Bokmål, lifted from or matched to the style guide. If the product also has English/other locales, please share those strings.
- **Photography & illustrations.** The style guide has none — UI kits use solid surfaces and avatar initials. If hero photos exist (course shots, player portraits) please upload them.

---

## How to use this system

1. **For prototypes / mocks** — link `colors_and_type.css`, drop in Lucide via CDN, use the JSX components in `ui_kits/<surface>/` as starting points.
2. **For production code** — read `colors_and_type.css` for tokens; copy variable names verbatim. Match the type ramp, motion vocabulary, and lime-usage rules.
3. **For slide decks / external materials** — pull logos from `assets/logos/`, use forest green + cream + lime, set headings in Inter Tight italic for warm/personal moments.

When in doubt, refer to `uploads/branding-style-guide.html` — it is the single source of truth.

</design-system-guide>

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s) (`/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/assets/tokens.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/coachhq-A/wizard.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/coachhq-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/colors_and_type.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/modal-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/playerhq-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/screens/_shared/arketype-e.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/screens/_shared/arketype-f-player.css`, and 11 more). The 140 custom properties it defines are:

--accent, --accent-bg, --accent-fill, --accent-hover, --accent-on, --accent-soft, --border, --brand-accent, --brand-accent-hover, --brand-accent-on, --brand-primary, --brand-primary-deep, --brand-primary-dk, --brand-primary-hover, --brand-primary-soft, --canvas, --card, --coach-nav-active, --coach-nav-bg, --coach-rail-bg, --coach-rail-ink, --danger, --danger-bg, --duration-large, --duration-micro, --duration-short, --e-bg, --e-bg-soft, --e-border, --e-deep, --e-fg, --e-gold, --e-green, --e-grey, --e-lime, --e-muted, --e-muted-2, --e-pyr-fys, --e-pyr-slag, --e-pyr-spill, --e-pyr-tek, --e-pyr-turn, --e-red, --e-surface, --e-surface-2, --ease-out, --font-body, --font-display, --font-mono, --font-sans, --font-tight, --g-accent, --g-bg, --g-bg-alt, --g-card, --g-danger, --g-fg, --g-line, --g-line-soft, --g-muted, --g-primary, --g-primary-hover, --g-subtle, --g-success, --g-warning, --ink, --ink-disabled, --ink-muted, --ink-subtle, --landing-hero-bg, --landing-hero-text, --line, --line-soft, --nav-active, --nav-bg, --paper, --phase-base, --phase-comp, --phase-prep, --phase-specific, --phase-taper, --pyr-fys, --pyr-slag, --pyr-spill, --pyr-tek, --pyr-turn, --r-button, --r-card, --r-input, --r-pill, --radius-btn, --radius-card, --radius-chip, --radius-control, --radius-input, --radius-pill, --radius-tight, --rail-bg, --shadow-accent-glow, --shadow-card, --shadow-card-hover, --shadow-pop, --shadow-rim, --shadow-soft, --sidebar-coach-active, --sidebar-coach-nav-bg, --sidebar-coach-rail-bg, --sidebar-player-active, --sidebar-player-bg, --sidebar-player-border, --space-1, --space-10, --space-12, --space-16, --space-2, --space-3, --space-4, --space-5, --space-6, --space-8, --status-danger, --status-danger-bg, --status-success, --status-success-bg, --status-warning, --status-warning-bg, --success, --success-bg, --surface, --surface-alt, --surface-card, --tier-elite, --tier-gratis, --tier-pro, --tracking-base, --tracking-label, --tracking-snug, --tracking-tight, --warning, --warning-bg

Only use `var(--*)` names from that list. Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Bygget `14b-trackman-okt-detalj.html` — én komplett PlayerHQ-skjerm med alle fem seksjoner fra spec'en:

1. **Session header** — italic Instrument Serif «Test *4i*», meta-rad, html-import pill + 2 type-tellere, «Tilbake til trenden» + «Be om coach-vurdering» CTA
2. **Køllevelger** — 10 horisontale kort (4i→58°) med jern/wedge-stripe, 7i aktiv (primary grønn + accent stripe)
3. **KPI-strip** — 4 kort for 7-jern, Total Distance som hero-kort (større, primary-farge), σ + range under hver verdi
4. **Slag-tabell** — 11 kolonner × 5 slag + AVG-rad (primary topp-border, badge) + σ-rad (lys grå, ±-prefiks), Low Point med A/B-dot, Total-kolonnen alltid primary, A/B-legend i foot
5. **Krysstabell** — alle 10 grupper, color-dot per type, 7i highlighted som current, beste total/rad markert med accent-dot, segmented switcher (Snitt / σ / Beste slag), kursiv normalisering-footer

Visuelt vokabular matcher `final/14-trackman.html` (PlayerHQ light shell, samme tokens, Instrument Serif italic + Geist Mono tabular-nums).

## User

Mobile (< 768px):
- KPI-kort: 2 × 2 grid
- Slag-tabell: horisontalt scrollbar, sticky første kolonne (#)
- Sammenligningstabell: skjul Face Angle + Face/Path, vis bare Kølle / Slag / Total

---

## UX-detaljer

- **Ingen tomme states** — siden vises bare når session finnes
- **Loading**: skjelett-animasjon på KPI-kort og tabell mens data lastes
- **Aktiv kølle**: huskes i URL query param `?club=7i` — kan deles / bookarkes
- **«Total Distance»** er alltid primær-metrisk — størst font, alltid synlig
- **Konsistens-tall**: tooltip ved hover → «Lavere er bedre. σ < 2 m = høy konsistens.»
- **Datokilde**: footer note → «Importert fra TrackMan Multi Group Report · HTML-kilde»

---

## Tone og stil

Editorial, profesjonell, datadrevet. Ikke «dashboard-grøt». Luftig spacing. 
Bruk Instrument Serif italic kun for sesjonsnavnet i toppen. Alt annet = Geist.
Ingen emojier. Ingen runding-ikoner. Lucide-ikoner der ikon trengs (Activity, ChevronLeft/Right, Info).

## Assistant

_[tool: str_replace_edit]_

Adding the mobile artboard and adjusting CTA style + footer note per spec.

_[tool: str_replace_edit]_

_[tool: read_file]_

Now adding a mobile artboard.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

La til mobilskjerm (artboard 02) som dekker spec-kravene:

- **KPI** kollapser til 2×2 (Total Distance og Smash spenner full bredde)
- **Slag-tabell** scroller horisontalt med sticky `#`-kolonne (gjelder også AVG- og σ-rader)
- **Sammenligningstabell** forenklet — kun Kølle / Slag / Total, accent-prikk på beste rad
- Header: italic «Test *4i*», meta + alle tre pills, full-bredde border-CTA «Be om coach-vurdering»
- Køllestrip horizontal scroll med smalere kort (84px)

Også justert desktopen: «Be om coach-vurdering» er nå border-knapp (per spec), «Last ned PDF» degradert til ghost, og lagt til footer-note «Importert fra TrackMan Multi Group Report · HTML-kilde · ?club=7i».

