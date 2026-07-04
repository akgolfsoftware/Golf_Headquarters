Anbefalings-kort; bruk for ALLE AI-forslag — ghost-økter, overstyringsdialogens AI-fiks, fleks-flytens AI-vindu.

```jsx
<AnbefalingsKort
  kontekst="Uke 25 · Øyvind"
  hvorfor="Øyvind taper −1,4 SG på innspill 150–175 m og ligger under TEK-minstekravet."
  hva="Bytt lørdagens fulle runde med 1,5 t innspillsarbeid + 1 t face-to-path (CS60)."
  effekt="Plan-kvalitet 72 → 87; TEK-andel 13 % → 17 %; ACWR 1,22 → 1,14."
  hvorforNaa="Siste uke før Taper — endringen rekker å virke før kretsspillet."
  onBruk={aksepter}
  onAvvis={forkast}
  onJuster={åpneIWorkbench}
/>
```

- **Anbefalingskontrakten (kanon):** alltid alle fire felter i fast rekkefølge —
  Hvorfor / Hva / Forventet effekt / Hvorfor nå. Aldri utelat et felt.
- «Bruk forslag» er primærhandling (signal-fylt); «Avvis» sekundær ghost; **onJuster** valgfri tekstlenke.
- **kompakt** for innbygging i overstyringsdialog og fleks-flyt (mindre padding/tekst).
- Temanøytral — fungerer på mørk og lys flate.
