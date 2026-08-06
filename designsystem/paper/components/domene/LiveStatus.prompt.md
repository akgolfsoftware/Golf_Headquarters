# LiveStatus

Direkte-merket. Rolig puls i oliven — aldri oransje, aldri rød.

```jsx
<LiveStatus timeLabel="12:41" dataOdId="okt-live" />
<LiveStatus mode="pause" timeLabel="48 min" />
<LiveStatus mode="slutt" />
```

- Pulsen er Skeletons rolige opacity-rytme (2 s alternate) — puls + oransje
  er OneThingNows kombinasjon og røres ikke. `prefers-reduced-motion` i
  tokens stopper pulsen globalt.
- Tre lukkede tilstander: live (oliven puls), pause (--mid, stille),
  slutt (--border, stille). Tekstene er faste norske ord.
- `role="status"` — skjermleser får tilstandsskiftet annonsert.
- `inverse`-varianten (for LiveBar) bor i DENNE filen — eierskapsregelen:
  ingen konsument styler .akhq-lstat fra sin egen fil.
