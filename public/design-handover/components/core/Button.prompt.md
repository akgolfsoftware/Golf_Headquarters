Pill button for any action; reach for it whenever the user clicks to do something.

```jsx
<Button variant="primary">Start gratis prøve</Button>
<Button variant="signal" iconLeft="zap">Tildel plan</Button>
<Button variant="secondary" size="sm">Avbryt</Button>
<Button variant="ghost" iconLeft="chevron-left">Tilbake</Button>
<Button variant="primary" iconLeft="plus" aria-label="Ny økt" />   {/* icon-only */}
```

- **variant**: `primary` (white pill / dark text — the default action), `signal` (lime pill — the single loud action; use sparingly), `secondary` (hairline outline), `ghost`, `destructive` (filled red).
- **size**: `sm` 32px · `md` 40px · `lg` 48px. `block` for full width.
- **iconLeft / iconRight**: a Lucide name string or a React node. Omit children for an icon-only button.
- One primary per view. Lime signal is a signal, not a default — don't fill a screen with it.
