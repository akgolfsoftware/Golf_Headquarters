Counter next to a nav item, tab or heading.

```jsx
<Badge count={9} tone="signal" label="venter på godkjenning" />   // Kø — needs the coach
<Badge count={18} label="spillere" />                              // informational
```

- Rust (`signal`) only when the number is work waiting for the coach. Max one rust per screen.
- Axis codes are not counts — use AxisBadge.
