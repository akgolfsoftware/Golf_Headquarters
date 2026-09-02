Fordeling viser hvordan målingene fordeler seg — for å svare på «hvor jevn er hen», ikke «hvor langt slår hen».

```jsx
<Fordeling etikett="Carry, 7-jern" enhet="m" kilde="Trackman" dato="18.08.2026"
  verdier={[128.4, 131.0, 133.2, /* … */]} bredde={2}
  forklaring="To av tre slag innenfor fire meter av snittet." />
```

- Snittet er det ene signalrøde elementet. Båndet er ett standardavvik, skrevet med tall under.
- Ingen kurve tegnet over søylene: kurven ville vært en antakelse om normalfordeling.
- Uten `kilde` og `dato` rendres ikke diagrammet.
