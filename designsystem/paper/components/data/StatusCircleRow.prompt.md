> **PENSJONERT.** Bruk `ListRow leading="status"` i en `ListGroup`. Geometrien er identisk (36px-sirkel, rutenettet `36px minmax(0,1fr) auto`), men ListGroup eier skillelinjene, og ListRow gir kategorimerke, lukket hale-union og korrekt interaktivitet. StatusCircleRow står kun til templatene er skrevet om — ikke bruk den i nye skjermer.

Sjekkliste-rader med 36px statussirkel (Dropset-mønsteret): fylt hake / aktiv ring / tom.

```jsx
<StatusCircleRow items={[
  { title: "Oppvarming", meta: "10 baller · wedge", status: "done", right: "8 min" },
  { title: "Approach 40–70 m", meta: "3 × 10 baller", status: "active", right: "22 min" },
  { title: "Putting 2–3 m", status: "todo", right: "15 min" },
]} />
```
