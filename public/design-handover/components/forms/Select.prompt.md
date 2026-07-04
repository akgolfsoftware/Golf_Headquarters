# Select

Tilpasset dropdown. Kontrollert: value + onChange.

## Bruk
```jsx
<FormField label="Lokasjon">
  <Select
    options={[
      { value: "gfgk",     label: "GFGK" },
      { value: "miklagard", label: "Miklagard" },
      { value: "mulligan",  label: "Mulligan" },
    ]}
    value={lokasjon}
    onChange={setLokasjon}
    placeholder="Velg lokasjon"
  />
</FormField>
```
