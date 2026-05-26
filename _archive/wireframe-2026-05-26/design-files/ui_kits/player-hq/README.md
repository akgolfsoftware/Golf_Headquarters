# PlayerHQ UI Kit

Player-facing dashboard recreation. Light theme, white sidebar with primary-green active state, italic Inter Tight greeting.

## Screens
- `index.html` — dashboard with KPI row, this-week schedule, drill progress, next-booking featured card, 14-day streak, coach link.

## Component vocabulary
- **Sidebar (PlayerHQ variant)** — white bg, hairline border, 12px-radius nav pills, active state uses `rgba(0,88,64,.08)` + primary green text.
- **Greeting** — `Inter Tight 36px italic` — the only italic moment per screen.
- **Stat card** — KPI in JetBrains Mono with positive deltas in `--status-success` (never lime).
- **Session row** — flush row with a 4px colored stripe on the left, indicating session type.
- **Featured booking** — the only `accent-bg` card, with `shadow-card-hover`.
- **Streak grid** — 7-col with day labels; today gets the lime + outer-ring glow.

Components are inline (single-file) for fast preview. Refactor into JSX when wiring real data.
