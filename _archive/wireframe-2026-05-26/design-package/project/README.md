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
