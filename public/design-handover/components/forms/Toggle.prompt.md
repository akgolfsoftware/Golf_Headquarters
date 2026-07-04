Switch for binary settings; lime when on, grey when off.

```jsx
const [on, setOn] = React.useState(true);
<Toggle checked={on} onChange={setOn} />
<Toggle checked={false} disabled />
```

- **size**: `sm` | `md`. Pair with a label/row yourself. Calm 200ms slide.
