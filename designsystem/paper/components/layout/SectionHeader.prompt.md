SectionHeader står over en gruppe paneler eller lister, på siden — ikke inne i et Panel.

```jsx
<SectionHeader title="Spillere som trenger øye" count={4}
  action={<a href="#alle">Alle 12 →</a>} />
<div style={{display:"grid",gap:"var(--s4)"}}>…paneler…</div>
```

- **Grensen mot Panel:** har innholdet én flate, bruk `Panel title`. Er det flere paneler eller en liste som skal ha felles overskrift, bruk SectionHeader utenfor dem.
- **Grensen mot SectionLabel:** SectionLabel er en mono versaletikett, ikke en overskrift — den navngir en gruppe visuelt og kobles med `aria-labelledby`. SectionHeader er en ekte `<h2>`/`<h3>` i dokumentets hierarki. Trenger du bare en etikett over en ListGroup, er `ListGroup label` nok.
- `level` følger disposisjonen: `h2` under PageHeaders `h1`, `h3` når seksjonen ligger under en annen `h2`. Nivået er semantikk, ikke størrelse — **størrelsen er alltid 22/600**, seksjonstrinnet i type-skalaen (`readme.md`: 32/600 side · 22/600 seksjon · 16/500 korttittel · 14,5/600 paneltittel).
- Trinnet er ikke forhandlingsbart: med 16px ville seksjonsoverskriften ligget 1,5px over paneltittelen den står over, og hierarkiet side → seksjon → panel ville kollapset. 22/600 er nettopp hullet skalaen har for dette nivået.
- Telleren er mono 12px med `tabular-nums`, og skal være antallet i gruppen, ikke et måltall. Er tallet en verdi (kroner, slag, prosent), hører det i innholdet.
- `action` tar én ting, som i Panel: en «… →»-lenke eller én ghost-knapp.
