# AK Golf brand-design

Use this skill to generate well-branded interfaces and assets for AK Golf HQ — a Norwegian golf training & coaching platform — for production work or throwaway prototypes/mocks/decks.

## Quickstart

1. Read `README.md` for brand context, content fundamentals, visual foundations, and iconography rules.
2. Link `colors_and_type.css` for all design tokens (CSS variables) and semantic type classes.
3. For component starting points, copy from `ui_kits/<surface>/` — three surfaces:
   - `ui_kits/player-hq/` — light, premium fitness feel
   - `ui_kits/coach-hq/` — light + dark rail, professional/structured
   - `ui_kits/landing/` — dark editorial hero + light sections
4. Logos live in `assets/logos/` — pick the variant matching the background.

## Hard rules

- **Lime is for accent.** Max 3 lime elements visible per screen. Never as background fill, body text, or every badge.
- **One italic moment per screen** — Inter Tight italic for personal greeting only.
- **No emoji, no Unicode pictographs.** Lucide icons (stroke 1.75) for everything.
- **Norwegian Bokmål** for UI strings unless explicitly told otherwise.
- **No gradients except** the lime progress-fill (`#D1F843 → #C2EE2F`).
- **No bouncy/spring motion.** One easing: `cubic-bezier(0.16, 1, 0.3, 1)`. Three durations: 120/200/320ms.
- **Avatars: flat colors, never gradients.**
- **Asymmetric layouts.** Avoid uniform 3-column grids on landing; vary section rhythm.
- **Forbidden legacy tokens:** `#154212`, `#d2f000`, `#fdf9f0`, `#1c1c16`, DM Sans, Material Symbols. Use the Sprint 0 tokens in `colors_and_type.css`.

## Output mode

- For visual artifacts (slides, mocks, throwaway prototypes): copy assets out of this skill folder and produce static HTML the user can view directly.
- For production code: copy variable names verbatim from `colors_and_type.css`, follow the type ramp and motion vocabulary exactly.
- If the user invokes this skill bare, ask what surface (PlayerHQ / CoachHQ / Landing) and what they want to build.
