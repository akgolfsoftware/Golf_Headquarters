# Claude Design – kanoniske eksportpakker

Dette er de nyeste komplette eksportene som var tilgjengelige lokalt 2. oktober 2026. De er lagt i GitHub slik at Grok og andre kodeøkter kan hente samme designkilde som Claude Design, også uten direkte tilgang til `claude.ai`.

## Pakker

| Pakke | Claude Design-kilde | Brukes for |
|---|---|---|
| `precision-athletics-2026-10-02.zip` | AK Golf Precision Athletics (`7d7c2994`) | Felles Precision Athletics-design, PlayerHQ og AgencyOS |
| `team-norway-app-delivery-2026-10-02.zip` | Team Norway App (`bc3e41fc`), med Team Norway-designsystem (`3416f258`) | `/team-norway/*` |
| `wang-golf-ui-prototype-2026-10-02.zip` | WANG Golf UI prototype (`6cfa623c`), med WANG-designsystem (`3580374e`) | `/team-wang/*` |

## Regler for bruk

- Les designkildene før en skjerm porteres.
- Bruk riktig prosjekt for riktig område: Precision, Team Norway eller WANG.
- Ikke bruk gamle Train-lock- eller Paper-filer som visuell fasit.
- Behold funksjon, server actions, tilgangskontroll og lagring fra appen.
- Kontroller hver ferdig skjerm i 390 × 844 og 1440 × 880 før den kalles ferdig.
- Bruk bare syntetiske eksempeldata i skjermbilder og tester.

ZIP-filene er kildepakker og skal ikke redigeres direkte. Ved ny Claude Design-eksport skal den gamle pakken beholdes som historikk, og den nye få dato i filnavnet og oppføring her.

## Kontrollsummer

Kontroller at filen ikke er endret etter eksport med:

```sh
shasum -a 256 docs/design-exports/claude-design/*.zip
```

```text
7c2c711720f0272a4bd9f3f2a006122d529949815d9910ab067b954eb83de8d7  precision-athletics-2026-10-02.zip
3f5a4c7d9ffc6a348a426fe49d034b5dc33a0278e3dede4f21d662aa02b0ad12  team-norway-app-delivery-2026-10-02.zip
7da7d9ab1b62d61ac6b01e1a22875b47d597a54e7da7adde4ed91794391b7b6d  wang-golf-ui-prototype-2026-10-02.zip
```
