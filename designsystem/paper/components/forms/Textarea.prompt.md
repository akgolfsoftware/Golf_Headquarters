Naken flerlinjekontroll for øktnotater, kommentarer og fritekst.

```jsx
<FormField label="Notat fra økten" dataOdId="felt-notat">
  <Textarea rows={3} defaultValue="Slår høyre-venstre på lange jern. Følg opp P6." />
</FormField>
```

- Grensen mot `TextInput`: skal brukeren skrive mer enn noen få ord, er det denne.
- `resize: vertical` er bevisst — brukeren kan gjøre den høyere, aldri bredere. Horisontal endring
  bryter kolonnen den står i.
- `rows` setter starthøyden, ikke maksimum.

## Bindende beslutninger

**Ingen `--floor`.** Høyden er alltid godt over 44px. Et gulv her ville konkurrert med `--min`
i stedet for å beskytte et treffmål — og et gulv som ikke beskytter noe er et gulv ingen forstår.
