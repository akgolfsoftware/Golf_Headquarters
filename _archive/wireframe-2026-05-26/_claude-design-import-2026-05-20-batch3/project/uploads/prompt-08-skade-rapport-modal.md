# Prompt 08 — Rapporter skade modal

## Hensikt

Når Markus klikker "Legg til skade" i `/portal/meg/helse`, åpnes en modal som lar ham logge skade med lokasjon, alvorlighetsgrad og varighet — synes for coach.

## Trigger

Klikk på CTA "Rapporter ny skade" på `/portal/meg/helse`.

## Layout

- Modal 640 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 24 px "Ny *skade-rapport*".
- Visuell kropp-velger (SVG-kropp foran/bak, klikkbare regioner):
  - Hode/nakke, skulder, albue, hånd, rygg, hofte, kne, ankel
  - Aktiv region farges lime, andre forest stroke
  - Toggle mellom forfra/bakfra
- Skala-velger: 1–10 skala (knappe-rad), 1 = mild, 10 = sterk
- Type-select: muskel, ledd, sene, anatomisk, annet
- Dato-velger: "Når startet det?" — DatePicker, max=i dag
- Forventet varighet: pill-velger "1–3 dager / 1 uke / 2–4 uker / >1 mnd / usikker"
- Status-toggle: "Påvirker treningen" `Switch`
- Notat: textarea 4 rader "Beskriv hva som skjedde"
- Bunn:
  - Primær forest "Logg skade"
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `DatePicker`, `Select`, `RadioGroup`, `Switch`, `Textarea`, `Button`
- Lucide: X, AlertTriangle, Activity, Calendar, FileText

## Eksempel-data

```
Region: høyre skulder, foran
Skala: 4/10
Type: muskel
Start: 18. mai
Varighet: 1 uke
Påvirker trening: ja
Notat: "Stivt etter Trackman-økt i går"
```

## Branding-krav

- Lime aksent på aktiv kropps-region.
- Skala-knapper med tabular nums.
- Norsk bokmål.

## Tilstander

- **Pending**: spinner.
- **Suksess**: toast "Skade logget. Coach varslet."
- **Coach-notifikasjon**: automatisk varsel til hovedcoach.
