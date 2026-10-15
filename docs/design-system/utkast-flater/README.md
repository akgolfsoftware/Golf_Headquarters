# Øvrige flater i nytt design — utkast

Status: **utkast 1 tegnes 15.10.2026. Ingen gruppe er godkjent ennå.** Målestokk: [designbrevet 13.10](../designbrev-2026-10-13.md).
Bestilling (Anders 15.10): «Tegn nå alle resterende skjermer.» Samme metode som [PlayerHQ-utkastene](../utkast-playerhq/README.md)
og [AgencyOS-utkastene](../utkast-agencyos/README.md): én HTML-fil og én PR per gruppe, publisert som privat Artifact til Anders.

## Pakkeplan

| Gruppe | Skjermer | Fil | Status | Lenke |
|---|---|---|---|---|
| 0 Grunnmur | `felles/flater.css`, `felles/flater.js` (skall: forelder, offentlig, gfgk, konto, epost, system), `kilder/sjekk-alle.js` | — | Ferdig 15.10 | — |
| 1 Forelder | FO-01 (+ ukerapport), FO-02 (+ utviklingsprofil), FO-03 (+ bekreftet), FO-04, FO-05 (+ deling), FO-06 (coach og innstillinger) | `forelder.html` | **Utkast 1** (15.10), venter på port 7 | https://claude.ai/artifact/XFq2WsW4DFkducF38Fj7KY |
| 2 Innlogging og oppstart | AU-01 (+ logget ut), AU-02 (+ sjekk e-post), AU-03 (glemt, nytt), AU-04 alle sju steg, fødselsdato for eksisterende spillere og forelder, AU-05 (forelder godkjenner, opptak, spiller venter), AU-06 (+ spiller) | `innlogging.html` | **Utkast 1** (15.10), venter på port 7 | https://claude.ai/artifact/72u3oF9w8Ggb6qAuXFhzdx |
| 3 Offentlig booking | BK-01 (+ pauset), BK-02 (tid, opplysninger, betaling), BK-03 (gjest og appbruker) | `booking.html` | **Utkast 1** (15.10), venter på port 7 | https://claude.ai/artifact/CoZHQC9iWy9DGCSWraGFcS |

Hva hver skjerm skal inneholde: `docs/design-handoff/regler/skjermliste.md` (avsnittene Forelder, Konto, Booking, Statistikk,
GFGK Junior og system) og vedtakene i `.claude/rules/beslutninger.md`. Ord: `docs/treningsplanlegging.md`.

## Grunnmuren

- `felles/felles.css` og `bilder/` er **lenker** til PlayerHQ-grunnmuren. Samme tokens, kort, knapper, øktkort og bevegelse.
- `felles/flater.css` legger til skallene og felles byggeklosser (lister, tellere, valgkort, avkrysning, dialog, steglinje).
- `felles/flater.js` bygger skallet etter `data-skall` på `.app`:
  - **forelder:** hamburgermeny på mobil, topplinje med fire mål (I dag · Barn · Booking · Økonomi) og «Mer» på PC (vedtak 23.09).
  - **offentlig:** menyen fra markedssidene (Coaching · Junior · Priser · Om oss · Kontakt), «Logg inn» og «Book time», og bunnen med lenkene fra `MarkedFot`.
  - **gfgk:** GFGK Junior-meny og egen bunn. **konto** og **system:** bare logo. **epost:** ingen ramme, bare malen.

## Slik lages en skjerm

1. Ny fil i denne mappen. `<link>` til `felles/felles.css` og `felles/flater.css`, og `<script src="felles/flater.js">`.
2. Skjermen ligger i `<template id="x"><div class="app" data-skall="forelder" data-aktiv="idag"><main class="innhold">…</main></div></template>`.
   Undersider får `data-tilbake="Barn"` og `data-tilbake-gaa="barn"`.
3. `AKFlate.start({ start: 'x', skjermer: { x: { etter, tom, laster, feil } } })`. `AKFlate.menyMaal` kobler menypunkter til skjermer.
4. Kontroll: `NODE_PATH=<hovedrepo>/node_modules node kilder/sjekk-alle.js $PWD/forelder.html <ut>` går gjennom alle skjermer og tilstander,
   måler sidelengs rulling i 390 og 360 px og tar skjermbilder i mobil og PC. Se på bildene før publisering.
5. Publiser med Artifact: `files` med `felles/*` og bildene hentet fra `../utkast-playerhq/` (lenkene følges ikke ved publisering).

## Faste grep

- Grafitt primærknapp. Rust bare som signal, høyst én per skjerm (frist som haster, det som sletter eller avslutter).
- Farge betyr akse: FYS · TEK · SLAG · SPILL · TURN. Fylte øktkort. Grønt og rødt bare status.
- Ett stort tall per flate i IBM Plex Mono. Manglende tall vises som «—». Priser er merket «Eksempel».
- Bare syntetiske data. Forelder: Kari Rohjan med Øyvind (17, Kategori C) og Ingrid (13). Mandag 5. oktober, uke 41.

## Åpent hos Anders (samlet)

- **Belastningsvarsel (ACWR) for forelder:** tallet regnes ikke ut i appen. Tegnet som «—» med forklaring.
- **Avslå deling:** vanlig knapp med kvittering og angre, ikke dialog.
- **BankID:** plassholder merket «Kommer».
- **De fem standardplanene:** innholdet per kategori er ikke skrevet. Aksefordelingen på kortene er merket «Eksempel».
- **Teknikktesten** har ingen nivåskala. Bare største svakhet vises.
- **Samtykkealder i booking:** publisert tekst sier under 18, PlayerHQ bruker 16. Beholdt til Anders avgjør.
- **Vipps** er tegnet som valg ved siden av kort. Ikke avgjort.
