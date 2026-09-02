Skjelett viser hvor mye som kommer, mens det lastes. Bruk det i stedet for en snurrer overalt der innholdet har kjent form.

```jsx
<div aria-busy="true">
  <Skjelett form="tittel" bredde="60%" />
  <Skjelett form="tall" />
  <Skjelett linjer={3} />
</div>
```

- Samme form og radius som det som kommer. Et tall får `form="tall"`, ikke tre linjer.
- Maks én puls på flaten; under `prefers-reduced-motion` står den stille.
- Fjern skjelettet i det innholdet er der — aldri la begge stå.
