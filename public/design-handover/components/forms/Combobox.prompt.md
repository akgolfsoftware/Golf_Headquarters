# Combobox

Søkbar select. Skriv for å filtrere alternativer.

## Bruk
```jsx
<FormField label="Spiller">
  <Combobox
    options={spillere.map(s => ({ value: s.id, label: s.navn }))}
    value={spillerId}
    onChange={setSpillerId}
    placeholder="Søk etter spiller…"
  />
</FormField>
```
