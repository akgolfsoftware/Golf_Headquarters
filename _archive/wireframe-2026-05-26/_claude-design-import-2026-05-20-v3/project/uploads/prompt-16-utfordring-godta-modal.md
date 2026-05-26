# Prompt 16 — Godta utfordring modal

## Hensikt

I `/portal/utfordringer/[id]` har Markus to knapper "Godta" og "Avslå". "Godta"-modalen lar ham velge tidsrom for fullføring og bekrefte innsats.

## Trigger

Klikk "Godta utfordring" på utfordring-detalj.

## Layout

- Modal 540 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 26 px "Godta *Trackman 7-Iron carry*?" italic på navnet.
- Utfordring-sammendrag-card secondary:
  - Coach-avatar + navn
  - Mål: "162 m carry på 7-iron, 5 av 10 baller"
  - Tidsfrist (default fra coach): "Innen 7 dager"
  - Belønning: 50 XP + lime "Trackman-mester"-badge
- Tidsfrist-velger (custom): pill-rad "3 dager / 7 dager / 14 dager / Egendefinert"
- Sjekkbokser:
  - "Jeg har TrackMan-tilgang denne uka"
  - "Jeg har planlagt minst 2 sessions"
- Notat-felt (valgfritt): "Strategi for hvordan du vil løse den"
- Bunn:
  - Primær forest "Godta og start"
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `RadioGroup`, `Checkbox`, `Textarea`, `Button`
- Lucide: X, Trophy, Calendar, Target, Award

## Eksempel-data

```
Utfordring: Trackman 7-iron carry
Coach: Anders K
Mål: 162 m × 5/10
Foreslått frist: 7 dager
XP: 50
Badge: Trackman-mester
```

## Branding-krav

- Lime aksent på XP-tall + valgt frist.
- JetBrains Mono for tall.
- Norsk bokmål.

## Tilstander

- **Pending**: spinner.
- **Suksess**: lukkes + redirect til `/portal/utfordringer/[id]?status=aktiv` med toast.
