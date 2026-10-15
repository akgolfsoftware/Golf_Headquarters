# AgencyOS i nytt design — utkast

Status: **utkast. Ingen pakke er godkjent ennå.** Målestokk: [designbrevet 13.10](../designbrev-2026-10-13.md).
Samme metode som [PlayerHQ-utkastene](../utkast-playerhq/README.md): én HTML-fil og én PR per pakke, publisert som privat Artifact til Anders.
AgencyOS kan være roligere enn PlayerHQ, men Cockpit skal vise hvem som trenger coachen med farge, ikke bare tekst (designbrevet punkt 5).

## Plan

| Pakke | Skjermer | Status | Lenke |
|---|---|---|---|
| 0 Grunnmur | `felles/agencyos.css`, `felles/agencyos.js`, `felles/demo.js` | Ferdig 14.10 | — |
| 1 Cockpit og Innboks | AG-01, AG-04 (+ sak, haster, oppfølging), `cockpit.html` | **Utkast 1** (15.10), venter på port 7 | https://claude.ai/artifact/Hb2VAqh6Sr9GxCs5bagRyK |
| 2 Stall og Spiller 360 | AG-07, AG-08 (+ faner), AG-A02, AG-A04, AG-A06, `stall.html` | | |
| 3 Kalender og Booking | AG-05 (+ uke, måned, år, assistant coach), AG-06 (+ ny booking), `kalender.html` | | |
| 4 Workbench coach | AG-11, AG-11-GRUPPE-AR, AG-WB-FYS, AG-WB-TURN, AG-14, `workbench.html` | | |
| 5 Live coachingøkt | AG-13 (+ uten samtykke), AG-12, `live.html` | | |
| 6 Teknisk plan og runder | AG-10, AG-TP-01, AG-TP-02, AG-RD-01, AG-RD-02, `teknisk.html` | | |
| 7 Mer | AG-15, AG-16, AG-A03, AG-20 (bare head coach), AG-23, `mer.html` | | |
| 8 Jarvis og Caddie | AG-19, AG-A08, AG-A05, `jarvis.html` | | |
| 9 Samleside | Alle lenker på én side, `samleside.html` | | |

Hva hver skjerm skal inneholde: `docs/design-handoff/regler/skjermliste.md` og vedtakene i `.claude/rules/beslutninger.md`.
Ord: `docs/treningsplanlegging.md` §2.6 og §22. Det finnes ingen skjermbilder av dagens AgencyOS i registeret, så utkastene har ingen «Dagens design»-knapp.

## Grunnmuren

- `felles/felles.css` og `bilder/` er **lenker** til PlayerHQ-grunnmuren. Samme tokens, kort, knapper, øktkort og bevegelse.
- `felles/agencyos.css` legger til AgencyOS-skallet og felles byggeklosser (tellere, lister, ark, dialog, faner, bryter).
- `felles/agencyos.js` bygger skallet: **sidemeny på PC** (Cockpit · Innboks · Stall · Kalender · Workbench · Mer, coach nederst),
  **hamburgermeny på mobil**, **bjelle** på alle skjermer, og **hurtigknappen** med fem handlinger på alle skjermer:
  Ny økt i Workbench · Ny melding til spiller · Registrer runde · Spør Jarvis · Ny booking (vedtak 22.09 og 28.09).
  Hurtigknappen er 56 x 56 grafitt med radius `--r2`, kan dras, holdes 8 px fra kantene, og under 5 px bevegelse er et trykk.
- `felles/demo.js` er fasit for demodata: stallen (14 spillere), dagens kalender og etterlevelsen. Alle pakkene leser herfra.

## Slik lages en skjerm

1. Ny fil i denne mappen. `<link>` til `felles/felles.css` og `felles/agencyos.css`, og `<script>` til `felles/demo.js` og `felles/agencyos.js`.
2. Skjermen ligger i `<template id="x"><div class="app" data-fane="cockpit"><main class="innhold">…</main></div></template>`.
   Undersider får `data-tilbake="Stall"` (og `data-tilbake-gaa="stall"` for lenke til en skjerm i samme fil).
3. `AKAgency.start({ start: 'x', skjermer: { x: { etter, tom, laster, feil } } })`. Velgere på siden: `data-skjerm`, `data-bredde`, `data-tilstand`.
4. Kontroll: ingen sidelengs rulling i 390 og 360 px, ingen JS-feil, alle tilstander. Se på bildene før publisering.
5. Publiser med Artifact: `root` = denne mappen, `files` med `felles/felles.css` og bildene hentet fra `../utkast-playerhq/` (lenkene følges ikke ved publisering).

## Faste grep

- Grafitt primærknapp. Rust bare som signal, høyst én per skjerm (det som haster, sletter eller avslutter).
- Farge betyr akse: FYS · TEK · SLAG · SPILL · TURN. Fylte øktkort. Grønt og rødt bare status.
- Ett stort tall per flate i IBM Plex Mono. Manglende tall vises som «—».
- Jarvis forbereder og sender aldri. Alt som forlater huset krever coachens trykk på Send.
- Oppgaver kommer bare fra Notion. Økonomi vises bare for head coach.
- Demodata: coach Anders Kristiansen, spiller Øyvind Rohjan. Mandag 5. oktober kl. 08:20, uke 41.
