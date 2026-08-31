Tekst- og tallfelt. Bruk `type="number"` for alt som måles — feltet setter da mono og tabulære tall automatisk. `suffix` for enhet.

```jsx
<Input label="Snittscore" type="number" suffix="slag" value={v} onChange={setV} />
<Input label="Klubb" hint="Registrert medlemsklubb" />
```