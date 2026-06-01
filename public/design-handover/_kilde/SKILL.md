---
name: ak-golf-hq-design
description: Use this skill to generate well-branded interfaces and assets for AK Golf HQ — the golfcoaching-plattform for AK Golf Group (PlayerHQ /portal, CoachHQ /admin, Marketing akgolf.no, Booking). Editorial sport-analytics aesthetic with forest #005840 + lime #D1F843 + cream #FAFAF7. Norsk bokmål copy. Contains locked design tokens, brand assets, typography, and UI-kit components for prototyping and production.
user-invocable: true
---

# AK Golf HQ — Design Skill

This skill packages the AK Golf HQ design system. It's locked: never invent new fonts, colors, or spacing trinn outside what's defined here.

## What to read

1. **`README.md`** — the master reference. Read this first. Covers content fundamentals (norsk bokmål tone, casing, forbidden språk), visual foundations (palette, type, motion, imagery), and iconography.
2. **`colors_and_type.css`** — the locked design tokens as CSS custom properties. Import this in any HTML prototype.
3. **`assets/`** — 7 SVG logo variants (mono / on-light / on-dark / on-green).
4. **`fonts/`** — self-hosted brand fonts (Inter, Inter Tight, JetBrains Mono).
5. **`ui_kits/<product>/index.html`** — high-fidelity React-port for each surface. Read these for component patterns.
6. **`preview/*.html`** — small cards demonstrating individual tokens and components. Use as visual reference.

## How to use this skill

**If creating a throwaway visual artifact** (slide, mock, exploration HTML):
- Import `colors_and_type.css` at the top of your file
- Copy logos from `assets/` into your output if needed
- Use the locked semantic tokens (`var(--primary)`, `var(--accent)`, etc.) — never inline new hex values
- Follow the conventions in the relevant `ui_kits/<product>/` for the surface you're imitating
- Write Norwegian bokmål copy by default; English for golf jargon (Strokes Gained, Tour, etc.)

**If working on production code in the AK Golf monorepo**:
- The CSS tokens here mirror the Tailwind v4 `@theme` block. Components in `src/components/athletic/` are the source of truth — gjenbruk dem.
- Lucide-react is the only icon library. 1.5px stroke. No emoji.
- 8pt-grid is strict — `p-3`, `p-5`, `p-7` are forbudt.
- Editorial italic via `<em className="font-normal italic text-primary">` inside Inter Tight headings. Never serif.

## Surface decisions

| Surface         | Where           | Tone           | Density        |
|-----------------|-----------------|----------------|----------------|
| Marketing       | `akgolf.no`     | Editorial, photo-led | Generous |
| Booking         | `/booking`      | Functional, focused  | Compact  |
| PlayerHQ        | `/portal`       | Personal, mobile     | Dense    |
| CoachHQ         | `/admin`        | Bloomberg / Linear   | Maximally dense |

## When the user asks for something

If the request is concrete (e.g. "make a hero for [section]") — just build it. Pull patterns from the matching UI kit and the visual-foundations section of README.

If the request is vague — ask:
1. Which surface (Marketing / Booking / PlayerHQ / CoachHQ)?
2. Mobile or desktop first?
3. What real data should the artifact show (vs. demo data)?

## Hard rules — never break

1. No new fonts. Inter / Inter Tight / JetBrains Mono. Period.
2. No new hex values. Only the semantic tokens or the named primitives.
3. No emoji in UI. Use Lucide.
4. No multiple variants of the same thing. Levér én løsning.
5. No serif italic. Inter Tight italic is the signature.
6. No `p-3`/`p-5`/`p-7`/`p-9`. 8pt-grid only.
