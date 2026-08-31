Tabell. Sett `align: 'right'` på alle tallkolonner — de får da mono og tabulære siffer. `highlightRow` markerer «deg» med rød kantstripe.

```jsx
<DataTable
  columns={[{key:'navn',label:'Utøver'},{key:'wagr',label:'WAGR',align:'right'}]}
  rows={rows}
  highlightRow={2}
/>
```