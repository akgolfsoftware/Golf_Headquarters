SectionLabel er den ene etiketten: mono 10px/600, sporing .1em, versaler, `--muted`. Alt som ser slik ut skal være denne komponenten — kicker i PageHeader, etikett i ListGroup, gruppeoverskrift over et rutenett.

```jsx
<SectionLabel>Mandag 27. juli · uke 31</SectionLabel>
<SectionLabel as="div" id="grp-kilder">Kilder</SectionLabel>
```

- Etiketten er ikke en overskrift. Navngir den en gruppe, gi den `id` og koble med `aria-labelledby` — ikke gjør den til `<h3>` for å «få semantikk».
- Ingen egen margin. Avstanden eies av forelderen (PageHeader gir 8px under kickeren, ListGroup gir 8px).
- Datakomponentenes interne `.akhq-lab` (sporing .08em) er samme idé i mindre skala og konsolideres inn hit når datafamilien revideres. Ikke bland dem i ny kode: bruk SectionLabel.
