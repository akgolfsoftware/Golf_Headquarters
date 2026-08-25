# SYNC-STATUS — train-lock

| | |
|---|---|
| Kilde-zip | `Player HQ Train lock (5).zip` (levert av Anders 25.08.2026, ~11:14) |
| SHA-256 (zip, første 32 tegn) | `9b5098cd58a4f0b493c1cb4fd9fbaf35` |
| Utpakket | 25.08.2026 med `ditto` (UTF-8-filnavn bevart — Ø/ø korrekt) |
| Filer i zip | 188 |
| Filer i denne mappen | 181 (180 skjerm-/støttefiler + `.thumbnail`) |

## Bevisst holdt UTENFOR repoet

Repoet er **offentlig**. Zipens `uploads/`-mappe (7 filer) er derfor IKKE committet:
Team Norway-protokoll-xlsx (inneholder levende Office Forms-lenker til TN junior-evaluering
+ NGF-protokolldetaljer), fire Pinterest-inspirasjonsbilder, RESTERENDE-SKJERMER-PROMPT.md
og en referanse-HTML. Alt ligger lokalt i
`claude-cowork/akgolf-hq/innkommende/train-lock-uploads-2026-08-25/` (via `~/Documents/Claude/`).

## Resynk-prosedyre (ny zip fra Anders)

1. `ditto -x -k <ny zip> designsystem/train-lock/` (ALDRI vanlig `unzip` — ødelegger æøå i filnavn).
2. Flytt `uploads/` ut til cowork-innkommende (ny datert mappe) FØR commit — offentlig repo.
3. Oppdater denne fila (zip-navn, sha, filantall) og README-familietabellen ved nye ID-er.
