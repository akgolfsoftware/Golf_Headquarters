# 6 · Rom og geometri

Fasit i kode: `designsystem/ak-golf/tokens/rom.css`.

## Romskalaen

4-basis: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.

Hvert avstandsmål i merket er ett av disse tallene. Er svaret «22 px», er det
feil — velg 20 eller 24.

Regelen finnes fordi luft er den billigste måten å se dyr ut på, og den første
tingen som ryker når noen har dårlig tid. Et system som ikke beskytter luften,
mister den.

| Mellom | Mobil | Mac |
|---|---|---|
| To seksjoner | 96 px | 128 px |
| Tittel og innhold | 24 px | 32 px |
| To kort | 16 px | 24 px |
| Ikon og tekst | 8 px | 8 px |

## Radius

Merket er **rolig, ikke rundt**. Jo større flaten er, desto mindre skal hjørnet
merkes.

| Token | Verdi | Brukes på |
|---|---|---|
| `--ak-hjorne-sm` | 6 px | Knapp, merkelapp, skjemafelt |
| `--ak-hjorne-md` | 10 px | Kort |
| `--ak-hjorne-lg` | 16 px | Panel, stor flate |
| `--ak-hjorne-pill` | 999 px | **Kun** knapper og filter-piller |

Aldri pill på et kort. Aldri 16 px på en knapp.

## Dybde

Tre nivåer. Skyggene er varme — bygget på blekk, ikke svart, så de ikke blir
grå flekker på kremen.

| Token | Brukes på |
|---|---|
| `--ak-loft-1` | Kort som ligger i ro |
| `--ak-loft-2` | Kort som kan trykkes, hover |
| `--ak-loft-3` | Panel, dialog, det som ligger over alt annet |

Trenger noe et fjerde nivå, er det egentlig et eget lag — ikke en dypere skygge.

## Trykkflate

Alt som kan trykkes er minst **44 × 44 px** på mobil, også når det ser mindre ut.
Merket leses stående, ofte på et treningsfelt, ofte med hansker.

## Rutenettet

Romskalaen og instrumentets rutenett henger sammen: ruten er **56 px**, som er
7 × 8 — samme 8-basis som all annen avstand. Det er derfor innhold kan legge
seg på rutenettet uten at noe må justeres med en halv piksel.

Se `11-instrumentet.md`.
