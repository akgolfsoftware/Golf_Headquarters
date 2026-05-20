# Prompt 12 — Kølle-bygger modal

## Hensikt

`/portal/meg/utstyrsbag` er i dag en stub (40 linjer). Markus skal kunne legge til hver kølle med merke, modell, loft, shaft-info. Modalen brukes både ved "Legg til kølle" og "Rediger".

## Trigger

CTA "Legg til kølle" eller klikk på eksisterende kølle-rad på utstyrsbag-side.

## Layout

- Modal 640 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 24 px "Ny *kølle* i bagen" (italic).
- Visuell type-velger (horisontal scroll piller):
  - Driver, 3-wood, 5-wood, hybrid, 3i–9i, PW, AW, SW, LW, putter
  - Aktiv = lime, andre = forest stroke
- Skjema:
  - Merke Select (Titleist, TaylorMade, Callaway, Ping, Mizuno, Srixon, Cleveland, Cobra, Honma, Annet)
  - Modell tekst-input
  - Loft tall-input (grader) — JetBrains Mono
  - Shaft Select (Regular/Stiff/X-Stiff/Tour)
  - Lengde tall-input (tommer)
  - Kjøpsdato DatePicker (valgfritt)
  - Notat textarea
- Foto-upload-rute (drag-drop) for ID-foto av køllen
- Bunn:
  - Primær forest "Lagre kølle"
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `Select`, `Input`, `Textarea`, `DatePicker`, `Button`, `FileInput`
- Lucide: X, Camera, Upload, Trash2 (på edit-modus)

## Eksempel-data

```
Type: 7-iron
Merke: Mizuno
Modell: JPX 923 Tour
Loft: 33°
Shaft: Project X 6.0 Stiff
Lengde: 36.75"
Kjøpt: april 2025
```

## Branding-krav

- Lime aktiv type-pill.
- JetBrains Mono for loft/lengde.
- Norsk bokmål.

## Tilstander

- **Redigér-modus**: "Slett kølle"-knapp nederst venstre, destructive outline.
- **Pending**: spinner.
- **Suksess**: lukkes + tilbake til bag-vy med ny kølle høyligned.
