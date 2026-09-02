Toppnav er topplinja utenpå produktet.

```jsx
<Toppnav aktiv="/junior" lenker={[{href:'/coaching',tekst:'Coaching'},{href:'/junior',tekst:'Junior'}]}
  handling={<Knapp storrelse="sm">Book kartleggingsøkt</Knapp>} />
<Toppnav mobil onMeny={aapne} />
```

Én handling til høyre. 80 px høy på Mac, 64 px på mobil.
