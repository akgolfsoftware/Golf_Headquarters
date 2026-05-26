# Prompt 18 — Logg test-resultat modal

## Hensikt

I `/portal/tren/tester/[testId]` klikker Markus "Logg nytt resultat". Modal åpnes med dynamiske felter basert på test-type (chip-distance, putt-accuracy, drive-carry etc.).

## Trigger

CTA "Logg resultat" på test-detalj.

## Layout

- Modal 580 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 24 px "Logg *chip-distance 15m*" italic.
- Test-info-card secondary:
  - Dato (auto = i dag, kan endres)
  - Sted/fasilitet Select
  - Forrige resultat (referanse, JetBrains Mono)
- Dynamiske felt (basert på test-type):
  - Hovedmetric tall-input (stor 32 px), enhet (m/cm/% etc.)
  - Sekundære metrics (opp til 3) — small inputs
- Forhold-blokk:
  - Vind Select (stille/lett/moderat/sterk)
  - Underlag Select (hard/normal/myk/våt)
  - Temperatur tall-input (°C)
- Notat textarea
- Foto-upload (valgfritt)
- Bunn:
  - Primær forest "Lagre resultat"
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `Input`, `Select`, `Textarea`, `DatePicker`, `FileInput`, `Button`
- Lucide: X, Target, Wind, Thermometer, Camera, TrendingUp

## Eksempel-data

```
Test: Chip-distance 15 m
Forrige: 13.8 m snitt (12. mai)
Dato: 19. mai, GFGK chip-green
Vind: lett
Underlag: hard
Temp: 18 °C
Resultat: 14.6 m snitt over 10 slag
```

## Branding-krav

- JetBrains Mono store tall for hovedmetric.
- Lime aksent når ny verdi er bedre enn siste.
- Norsk bokmål.

## Tilstander

- **Bedre enn forrige**: lime trend-arrow + "+0.8 m".
- **Pending**: spinner.
- **Suksess**: lukkes + toast + evt. milepæl-modal trigger.
