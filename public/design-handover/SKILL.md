---
name: ak-golf-design
description: Use this skill to generate well-branded interfaces and assets for AK Golf HQ — a Norwegian data-driven golf-coaching platform — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, logos, imagery, reusable components and full UI kits (PlayerHQ player app, AgencyOS coach cockpit, Marketing site) for prototyping in the modern dark sports-analysis aesthetic.
user-invocable: true
---

Read the `readme.md` file in this skill first — it carries the company context,
content fundamentals, visual foundations and iconography rules — then explore the
other files.

- **Foundations** live in `tokens/` (CSS custom properties + `@font-face`) and are
  documented as specimen cards in `guidelines/`. The single CSS entry point is
  `styles.css` — link it and you get every token + the three webfonts.
- **Components** live in `components/<group>/` as React (`.jsx` + `.d.ts` +
  `.prompt.md`). Read a component's `.prompt.md` for what it is, a usage example and
  its variants. Screens are COMPOSED from these components per their contracts and
  verified against the state gallery (`guidelines/tilstander.html`).
- **Templates** live in `templates/<slug>/` — copyable starting scaffolds.

If you are creating visual artifacts (slides, mocks, throwaway prototypes), copy the
assets you need out of `assets/` and produce static HTML for the user to view —
load `styles.css` for tokens, and either reuse the component source or write simple
token-driven HTML. If you are working in production code, copy the assets and follow
the rules here to design as an expert in this brand.

**Hard rules (non-negotiable):**
1. Only three fonts: Inter, Familjen Grotesk, JetBrains Mono.
2. Dark graphite is home for data/execution; light cream is marketing/onboarding only.
3. **Lime `#D1F843` is the only accent — a signal, never a large fill or page background.**
4. All numbers in JetBrains Mono, tabular.
5. Lucide icons at 1.5px stroke. **No emoji, anywhere.**
6. All UI copy in Norwegian bokmål; golf terms (Strokes Gained, Tour, TrackMan) in English.
7. Status colors are lime / coral / grey only — no amber, no blue, no purple.

If the user invokes this skill without other guidance, ask what they want to build,
ask a few focused questions, then act as an expert AK Golf designer who outputs HTML
artifacts *or* production code, depending on the need.
