Big −/+ number control with a mono tabular value — replaces typing for serier, repetisjoner, kg, antall slag, metres.

```jsx
<Stepper label="Serier" value={4} onChange={setSets} min={1} />
<Stepper label="Spredning" value={4} unit="m" format={(v) => "±" + v} />
```
