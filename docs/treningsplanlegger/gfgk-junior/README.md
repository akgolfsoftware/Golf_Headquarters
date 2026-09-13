# GFGK Junior — treningsplanlegger-notater

Del av treningsplanlegger-prosjektet. Vokabular: `docs/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md`.

## Status
- Grupper: gfgkjunior.no bruker **Mini · Basis · Utvikling · Elite**; basen bruker enum
  `GFGK_MINI / GFGK_BREDDE / GFGK_JENTER / GFGK_ELITE`. Mapping må bekreftes 1:1.
- `src/app/team-gfgk/` er stengt med `notFound()`. Det statiske spillerdata-
  settet ble fjernet fra dagens kildekode 13.09.2026 etter personvernkontroll.
- gfgkjunior.no må lokaliseres (repo/tilgang) før den kobles til data (jobb C).

## Å avklare
- Før eventuell gjenåpning av team-gfgk: avklar tilgang, samtykke og minste
  nødvendige datautvalg.
- Hvor ligger gfgkjunior.no-koden, og hvordan mates den (peke om vs lese-API)?
