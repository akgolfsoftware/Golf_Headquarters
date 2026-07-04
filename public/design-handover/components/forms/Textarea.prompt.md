# Textarea

Flerlinje tekstinndata med valgfri tegneller.

## Bruk
```jsx
<FormField label="Notat">
  <Textarea
    value={notat} onChange={setNotat}
    placeholder="Legg til notat…"
    rows={4} maxLength={500}
  />
</FormField>
```
