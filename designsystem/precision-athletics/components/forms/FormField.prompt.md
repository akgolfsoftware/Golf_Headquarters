Wrap any control to get label, hint, required mark and an error that is **text, not only colour**.

```jsx
<FormField label="E-post til forelder" hint="Brukes til samtykke under 16 år." required error={err && "E-postadressen mangler @."}>
  <TextInput type="email" value={v} onChange={(e) => setV(e.target.value)} />
</FormField>
<FormField label="Antall slag" hint="Nærspill telles i slag."><Stepper value={n} onChange={setN} /></FormField>
```

- Error copy says what is wrong and how to fix it, in one sentence. No "Ugyldig".
- Required mark is the word PÅKREVD in mono caps — not a red asterisk.
- Enumerable values use ChoicePill/Segmented inside FormField, never free text.
