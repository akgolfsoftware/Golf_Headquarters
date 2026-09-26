# Rundeplan — alle skjermer i AK Golf Precision Athletics

Claude Code styrer Claude Design-prosjektet «AK Golf Precision Athletics» (`7d7c2994`) via Chrome,
én runde om gangen. Skjermtypene står i [skjermlista](skjermliste-precision-athletics.md) (også
lagt i prosjektet som `skjermliste.md`). Beslutning: [beslutninger.md](../../.claude/rules/beslutninger.md)
§PRECISION ATHLETICS.

## Slik sendes en runde

- Lim inn hele bestillingen med en paste-hendelse i ProseMirror-feltet (`ClipboardEvent('paste')`),
  deretter trykk Send. **Aldri** skriv den med tastetrykk: Enter sender første linje alene.
- Hver runde avsluttes med `ui_kits/audit.html` og null avvik. Kontroller selv etterpå: les minst én
  skjermfil og se at den bruker tokens, ikke hardkodede farger.
- Hver skjerm har tilstandene Data, Tom, Laster og Feil, bredde 390/768/1024/1280 (1440 for AgencyOS),
  og lyst tema (natt der skjermlista sier det).

## Runder

| Runde | Innhold | Status |
|---|---|---|
| 1 | Fullfør designsystemet: tokenisere AgencyOS-skjermer, slå sammen AgencyOS-kits, flytte WANG til `_utenfor/`, 11 nye komponenter, `guidelines/buttons.html`, readme | Ferdig 26.09 — 210 tilfeller, 0 avvik |
| 2 | PlayerHQ PH-01–09 + felles skjermkatalog (velger for skjerm/bredde/tema/tilstand) + `oversikt.html` | Ferdig 26.09 — 478 tilfeller totalt, 0 avvik. Katalog: `ui_kits/playerhq/index.html`, oversikt: `oversikt.html` |
| 3 | PlayerHQ PH-10–15 (plan, Workbench, planbygger, øvelser, tester) + rettelse: runde med 9 hull, «Registrer runde» fra I dag | Ferdig 26.09 — 670 tilfeller totalt, 0 avvik. Åpne spørsmål: «Venter på coach» mangler i ordmasteren; dra-håndtak 32 px (under 44 px) |
| 4 | PlayerHQ PH-16–20 (analyse, TrackMan, runder, mål og talent, gameplan) + rettelser: dra-håndtak 44 px, konflikt ved økt oppå opptatt tid, «Venter på coach» og 10-slagsregelen merket uavklart | Sendt 26.09 — kjører |
| 5 | PlayerHQ PH-21–26 (coach, Caddie, booking, Meg, abonnement, utenfor banen) | |
| 6 | AgencyOS AG-01–06 (Hjem, Kø, oppfølgingskø, innboks, kalender, booking) | |
| 7 | AgencyOS AG-07–12 (stall, spiller 360, analyse, teknisk plan, Workbench, øktark) | |
| 8 | AgencyOS AG-13–18 (live-tavle, plan og maler, tester, grupper, turneringer, TrackMan) | |
| 9 | AgencyOS AG-19–24 (Caddie/Jarvis, økonomi, oppgaver, innsikt, oppsett, drift) | |
| 10 | Forelder FO-01–06 og konto AU-01–06 | |
| 11 | Booking BK-01–03, GFGK Junior GJ-01–02, system SY-01 | |
| 12 | Statistikk ST-01–06 | |
| 13 | Samlet gjennomgang: hele `audit.html`, oversikt.html komplett, readme og overlevering til Codex | |

Etter hver runde: oppdater statuskolonnen her. Port 7 (Anders har sett skjermen) føres i
`oversikt.html` i prosjektet.
