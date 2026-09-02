Faktarad setter to til fire målte tall side om side.

```jsx
<Faktarad poster={[
  { etikett: 'Testprotokoller', verdi: '20' },
  { etikett: 'Økter i snitt', verdi: '22', note: 'per spiller per sesong' },
  { etikett: 'Dispersion', verdi: '6,8', enhet: 'm', fremhevet: true, note: 'Trackman · 18.08.2026' }
]} />
```

Maks ett `fremhevet` tall. Hvert tall som gjelder en spiller skal ha note med dato og kilde.
