Hint forklarer et ord eller et ikon når pekeren eller fokuset står på det. Det som MÅ leses, står i teksten — ikke i et hint.

```jsx
<Hint tekst="Forholdet mellom hvor køllebladet peker og hvor køllehodet går">
  <abbr style={{ textDecoration: 'underline dotted' }}>Face to Path</abbr>
</Hint>
```

- Ett barn, og det må kunne få fokus (knapp, lenke, `tabIndex=0`) — ellers når ikke tastaturbrukeren hintet.
- Én linje. Bryter teksten, er det ikke et hint lenger.
- På mobil finnes ikke hover: hintet kommer ved trykk/fokus. Design for at det ikke ble lest.
