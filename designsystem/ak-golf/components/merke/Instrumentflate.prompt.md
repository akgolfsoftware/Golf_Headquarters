Instrumentflate legger rutenettet under en seksjon.

```jsx
<Instrumentflate som="section" style={{ padding: 'var(--ak-r-10) 0' }}>
  <h2>Vi begynner med et tall.</h2>
</Instrumentflate>
```

- Aldri under brødtekst i lange partier — legg den på seksjonen, ikke på avsnittet.
- Aldri rutenett med tall på aksene. Da er det en påstand, og tallene må være målt.
- Én flate har sjelden mer enn ett instrumentelement.
- Trenger flaten en egen bakgrunnsfarge, bruk `backgroundColor` — ikke
  `background`-kortformen. Komponenten setter rutenettet sist, så den tåler det,
  men `backgroundColor` sier tydeligere hva som skjer.
