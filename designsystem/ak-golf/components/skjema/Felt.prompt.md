Felt er AK Golfs eneste inntastingsflate — tekst, e-post, tall, dato og flerlinje i samme komponent.

```jsx
<Felt merkelapp="Barnets alder" enhet="år" type="number" paakrevd
      hjelp="Vi bruker alderen til å finne riktig gruppe." />
<Felt merkelapp="E-post" feil="Skriv e-postadressen med @." />
<Felt merkelapp="Litt om erfaringen" flerlinje />
```

- Høyde 44 px (trykkflate). Kant `--ak-linje-hard`, blekk ved fokus, `--ak-feil` ved feil.
- `maalt` setter mono — bruk den bare når verdien faktisk er en måling.
- Feiltekst er en instruksjon: «Skriv e-postadressen med @», ikke «Ugyldig e-post».
