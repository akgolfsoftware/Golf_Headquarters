# PlayerHQ i nytt design — utkast

Status: **utkast. Pakke 3 Plan og Workbench, pakke 4 Øvelser og teknikk, pakke 5 Runder og pakke 7 Kommunikasjon er godkjent 14.10, pakke 9 IUP og gameplan 15.10; pakke 2 Treningsøkta er utkast 1; de andre skjermene venter på port 7.** Målestokk: [designbrevet 13.10](../designbrev-2026-10-13.md).
Hver skjerm publiseres som privat Artifact til Anders, med «Dagens design»-knapp for sammenligning.

## Plan (Anders 14.10.2026: «Ok»)

| Pakke | Skjermer | Status | Lenke |
|---|---|---|---|
| 1 Grunnmur | `felles/felles.css`, `felles/felles.js`, dagens design for alle PH-skjermer | Ferdig 14.10 | — |
| — | PH-01 I dag (utkast 4) | Utkast | https://claude.ai/artifact/8qmhVSf3pQ5L5xUpKuKTmP |
| — | PH-16 Stats (utkast 1) | Utkast | https://claude.ai/artifact/4EfjmFK426xVYoPy5SzbBC |
| 3 Plan og Workbench | PH-10, PH-11, PH-11-AR, -NY, -PER, -PERSKJEMA, -MND, -MNDSKJEMA, -MAL (+IUP), -GJENTA | **Godkjent 14.10** (port 7, Anders), utkast 2 i `plan.html` | https://claude.ai/artifact/BqJqEsLH34JGA8reJaWDWi |
| 2 Treningsøkta | PH-03, PH-04, PH-05, PH-06, PH-07 (lyst tema også i Live, Anders 14.10), `treningsokt.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/Aa2FmsQCfzVb9KDeS5gxUQ |
| 4 Øvelser og teknikk | PH-12, PH-13 (+ øvelse, break-tabell), PH-TP-01 (+ utkast fra coach), `ovelser.html` | **Godkjent 14.10** (port 7, Anders), utkast 1 | https://claude.ai/artifact/8uJAzvbeaaSTCp9jsNZKTR |
| 5 Runder | PH-RD-01–09, PH-18 (PH-08/09 dekkes av RD), `runder.html`, lyst også ute på banen | **Godkjent 14.10** (port 7, Anders), utkast 2 med farge | https://claude.ai/artifact/WubERezBPiponAixBHRoem |
| 6 Stats i dybden | PH-14 (+ én test), PH-15 (Wedge Gate), PH-15-TN (8-ball med poeng og PEI, Nærspill Gate), PH-17 (Trening, TrackMan: økter, én økt, alle køller), Resultater, `stats-dybde.html` | **Godkjent 14.10** (port 7, Anders), utkast 6 med spredning på green | https://claude.ai/artifact/TCAjvtfCSbP55GXGq2UNcL |
| 7 Kommunikasjon | PH-21 Innboks (+ meldinger), PH-22 Caddie, PH-23 Booking (+ book time, bekreftet, flytt og avbestill), `kommunikasjon.html` | **Godkjent 14.10** (port 7, Anders), utkast 2 | https://claude.ai/artifact/2Dtxo3nS4rwN2yBaaRTpTD |
| 8 Meg | PH-24 (+ profil, fasiliteter, utstyr, helse, foreldre), PH-25 (+ innstillinger), PH-27 (+ under 16), `meg.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/3LLqsVrsgjq5KxwysoGxg3 |
| 9 IUP og gameplan | PH-IUP-01 (+ levert), PH-IUP-02 (+ levert), PH-20 (+ hull), `iup.html` | **Godkjent 15.10** (port 7, Anders), utkast 1 | https://claude.ai/artifact/6ALZka6wvTpvKvnboZXb5E |
| 10 Samleside | Alle lenker på én side, designbrevet oppdatert | | |

Rekkefølgen er 3 først (Anders minst fornøyd med Workbench). Én fersk økt per pakke.
Hva hver skjerm skal inneholde: `docs/design-handoff/regler/skjermliste.md` og vedtakene i
`.claude/rules/beslutninger.md`. Dagens innhold: `kilder/dagens-register/*.jsx` og `screenshots/<ID>-390.jpg` / `-1440.jpg`.

**Skjermbildene av dagens design ligger utenfor Git** (AGENTS.md: lokale skjermbilder aldri i Git). Ved oppstart i en ny
arbeidsgren: `cp -R ~/Developer/akgolf-hq/screenshots/utkast-playerhq/ docs/design-system/utkast-playerhq/screenshots/`.
De ble tatt 14.10.2026 fra skjermregisteret (Precision 3.1.0-l), 43 skjermer i 390 og 1440 px.

## Slik lages en skjerm

1. Ny fil i denne mappen, f.eks. `plan.html`. Mal: `stats.html` (laget av `kilder/lag-stats.py`).
2. `<link rel="stylesheet" href="felles/felles.css">` og egen `<style>` bare for det skjermen trenger.
3. Skjermen ligger i `<template id="skjerm"><div class="app" data-fane="plan"><main class="innhold">…</main></div></template>`.
   `felles.js` bygger topplinje, sidemeny og bunnmeny. Undersider: `data-skall="tilbake" data-tilbake="Plan"`.
4. `<script src="felles/felles.js"></script><script>AKUtkast.start({for:{mob:'screenshots/PH-10-390.jpg',pc:'screenshots/PH-10-1440.jpg'}})</script>`.
   Valgfritt `etter: function (app, tilstand) {}` for skjermens egen oppførsel. Ingen natt: live-økt og runde er lyse (vedtak 14.10).
   Flere skjermer i én fil: `AKUtkast.start({ skjermer: { id: { mal, for, etter, tom, laster, feil } } })` med
   velger `data-skjerm`, lenker `data-gaa` og tilstandsvelger `data-tilstand` (tom, laster, feil). Mal: `plan.html`.
5. Kontroll: `NODE_PATH=<hovedrepo>/node_modules node kilder/sjekk.js $PWD/plan.html <ut>` gir skjermbilder
   (mobil, PC) og måler sidelengs rulling i 390 og 360 px. Se på bildene før publisering.
6. Publiser med Artifact: `file_path` = skjermfila, `root` = denne mappen, `files` = `felles/*` og bildene den bruker.

## Faste grep (designbrevet)

- Ett stort tall per flate (`.hoved strong`, IBM Plex Mono), trend som pille (`.trend.opp/.ned`).
- Farge betyr akse: `--fys --tek --slag --spill --turn`. Grønt/rødt bare status. Rust bare det som avslutter eller sletter.
- Fylte øktkort i aksefargen (`.okt.slag` osv.) med bilde per treningsområde fra `bilder/`. FYS-bildet er Unsplash
  (Victor Freitas) til AK Golf har egne bilder fra styrkerommet.
- Grå småtekst sparsomt: høyst én kildelinje per kort, i vanlig skrift. Kilde og dato der appen påstår noe om spilleren.
- Bilder aldri med tekst oppå.
- Bevegelse: `.tegn` (linjer tegnes), `.vokse` (søyler), `[data-til]` (stolper fylles), `[data-tell]` (tall teller opp),
  trykk gir `scale(.97)`. Alt slås av ved «reduser bevegelse».
- Alle plannivåer henger sammen (Anders 14.10, beslutning i `.claude/rules/beslutninger.md`): endres årsplan, periode, måned, uke eller økt, oppdateres resten.
  Nedover: periode og måned gir ukene nye timer fra og med denne uka; uker som er gått, røres ikke. Oppover: økter teller
  i uka, måneden, perioden og året. I `plan.html`: `lagrePeriode`, månedsskjemaets Lagre, `EGNE` og `lagtInn`.
- Aldri sidelengs rulling. Ord fra `docs/treningsplanlegging.md` («up and down», Målsetning, Gjennomført, Stats).
- Demodata: Øyvind Rohjan, Kategori C, mandag 5. oktober kl. 14:20, uke 41, 48 t 10 min av 52 t 20 min siste 4 uker (uke 37–40).
  Uka er 0 min av 14 t 5 min før dagens økter. Årsplanen i `plan.html` (`PERIODER`, `MANEDER`) er fasit for timetallene;
  andre skjermer skal stemme med den.

## Åpent hos Anders

- Spill-elementer (plan-rekke, personlig rekord, lukk ringen): ikke avgjort. Utkastene har dem bak en av/på-knapp.
- Grunnmurens klasse `.spill` (spill-elementer) kolliderte med aksen SPILL. Rettet i `felles.css`; bør få eget navn ved neste opprydding.
- `idag.html` er laget før grunnmuren og har sin egen stilkopi. Flyttes over når I dag endres neste gang.
