# 5 · Typografi

Fasit i kode: `designsystem/ak-golf/tokens/type.css`.

Tre fonter, låst av Anders 25.08.2026. **Ingen fjerde font, noensinne.**

| Font | Bærer | Hvorfor |
|---|---|---|
| **Poppins** | Titler, brødtekst, knapper, alt som skal leses raskt | Nøytral, geometrisk, holder på små størrelser |
| **Lora** | Ingress, sitat, det som skal leses langsomt | Gir tekst en stemme uten å rope |
| **IBM Plex Mono** | **Alt som er målt** — tall, etiketter, dato, kilde | Se under |

## Mono er merkets viktigste regel

Et tall som kommer fra en måling settes i mono. Et tall som ikke kommer fra en
måling settes ikke i mono.

Det er ikke en stilpreferanse. Det er TruthLayer gjort synlig: står det i mono,
er det etterprøvbart, med dato og kilde. Står det ikke i mono, er det en
påstand. En leser trenger aldri å lære regelen for at den skal virke — men den
som bryter den, undergraver det ene løftet merket har.

**Estimater merkes som estimat i teksten**, selv når de står i mono.

## Skalaen

Kvart-oktav (1,19), avrundet til hele piksler. Ni trinn.

| Token | Størrelse | Rolle |
|---|---|---|
| `--ak-t-11` | 11 px | Caps-etikett — **kun mono**, med `0.2em` sperring |
| `--ak-t-13` | 13 px | Bildetekst, fotnote |
| `--ak-t-15` | 15 px | Brødtekst, tett |
| `--ak-t-17` | 17 px | Brødtekst, standard |
| `--ak-t-21` | 21 px | Ingress — ofte Lora |
| `--ak-t-26` | 26 px | Seksjonstittel |
| `--ak-t-33` | 33 px | Sidetittel |
| `--ak-t-42` | 42 px | Hero, mobil |
| `--ak-t-58` | 58 px | Hero, Mac |

Trenger du et tiende trinn, er problemet layouten — ikke skalaen.

## Vekter

400, 500 og 600. **Aldri 700 eller tyngre.** Poppins i 700 blir klumpete og
begynner å ligne på et sportsmerke som roper. AK Golf roper ikke.

## Regler som holder teksten lesbar

- Brødtekst stopper på **65 tegn** (`--ak-lesebredde`), uansett skjermbredde.
- Linjeavstand: 1,5 for brødtekst, 1,12 fra 26 px og opp, 1,65 for Lora.
- Sperring: `-0.03em` på hero, `-0.02em` på titler, `0` på brødtekst,
  `0.2em` på caps-etiketter.
- Titler får `text-wrap: balance`.
- Tall som står i kolonne får `font-variant-numeric: tabular-nums`.
- **Aldri caps på en hel setning.** Caps er for etiketter på tre ord eller
  mindre.
