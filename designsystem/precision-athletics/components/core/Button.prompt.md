The one button: graphite primary for the main action, rust `signal` only when the action carries real consequence or urgency.

```jsx
<Button variant="primary" icon="play">Start økt</Button>
<Button variant="secondary">Avbryt</Button>
<Button variant="signal" size="xl" fullWidth>Avslutt økt</Button>
```

- One `primary` per surface. `signal` max one per screen.
- Labels are verbs in sentence case, 2–3 words.
- `size="xl"` (56px) for outdoor/night use.
- `loading` swaps the label for a mono sentence ("Lagrer …") — no spinner.
