Accordion er `<details>`/`<summary>` med chevron som roterer. Ingen React-tilstand — nettleseren eier åpningen.

```jsx
<Accordion name="posisjoner" items={[
  { id: "p1", title: "P1 · Adresse", meta: "har fasit", body: "Ballposisjon og vektfordeling …" },
  { id: "p2", title: "P2 · Takeaway", body: "Klubbhode utenfor hendene …" }
]} />
```

- `name` gjør gruppen eksklusiv via nettleserens egen `details name`-oppførsel. Utelat den når flere skal kunne stå åpne samtidig (FAQ).
- Ingen `aria-expanded` eller `role` — `<details>` har semantikken innebygd, og å legge ARIA på toppen gjør den verre.
- Kroppen er Lora prosa i `--muted`. Er innholdet en liste av rader, hører ListGroup der, ikke fritekst.
- Rammen ligger på `<details>`, og siste element har ingen strek — samme konvensjon som ListGroup og KeyValueGrid.
- `summary` har 44px minimumshøyde i alle bredder; dette er et trykkmål i alle sammenhenger, ikke bare på touch.
- Bruk aldri Accordion til å skjule noe brukeren trenger for å ta en beslutning. Skjuler du valideringsfeilen som blokkerer publisering, er det en Banner, ikke et sammenleggbart panel.
