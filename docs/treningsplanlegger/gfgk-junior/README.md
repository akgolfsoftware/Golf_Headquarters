# GFGK Junior — treningsplanlegger-notater

Del av [treningsplanlegger-prosjektet](../spec-design.md).

## Status
- Grupper: gfgkjunior.no bruker **Mini · Basis · Utvikling · Elite**; basen bruker enum
  `GFGK_MINI / GFGK_BREDDE / GFGK_JENTER / GFGK_ELITE`. Mapping må bekreftes 1:1.
- `src/app/team-gfgk/` finnes, men er **håndskrevet** (leser `./data.ts`) — en foreldremøte-
  presentasjon, ikke en løpende oversikt.
- gfgkjunior.no må lokaliseres (repo/tilgang) før den kobles til data (jobb C).

## Å avklare
- Beholdes team-gfgk-presentasjonen ved siden av ny åpen side, eller erstattes?
- Hvor ligger gfgkjunior.no-koden, og hvordan mates den (peke om vs lese-API)?
