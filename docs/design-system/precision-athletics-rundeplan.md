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
| 4 | PlayerHQ PH-16–20 (analyse, TrackMan, runder, mål og talent, gameplan) + rettelser: dra-håndtak 44 px, konflikt ved økt oppå opptatt tid, «Venter på coach» og 10-slagsregelen merket uavklart | Ferdig 26.09 — 830 tilfeller totalt, 0 avvik. Uavhengig kontroll avbrutt, kjøres i runde 5 |
| 5 | PlayerHQ PH-21–26 (coach, Caddie, booking, Meg, abonnement, utenfor banen) + fargeregel i hele systemet, toppliste PH-19 | Ferdig 26.09 — 1 022 tilfeller totalt, 0 avvik. Fargeregelen i readme (regel 4) og `guidelines/farge.html`; Workbench i AgencyOS kontrollert av Claude Code. Uavhengig kontroll av runde 4–5 avbrutt to ganger, kjøres i runde 6. Åpne spørsmål: klippekort bare for privattime 60 min? Break-tabellen er modell, ikke måling |
| 6 | AgencyOS AG-01–06 (Hjem, Kø, oppfølgingskø, innboks, kalender, booking) + hurtigknapp i skallet, «Løst» som egen status, bekreft/avvis booking, tellemåling av hardkodede farger | Ferdig 26.09 — 1 142 tilfeller totalt, 0 avvik. Katalog: `ui_kits/agencyos/katalog.html`. Hardkodede farger: marked 31 → 0, toppidrett 23 → 0 (nye `--course-*`-tokens), øvrige kits 0 (Claude Designs egen telling, ikke kontrollert av Claude Code: filene kan ikke leses fra Chrome). Uavhengig kontroll av runde 4–6 kjørt; én visningsfeil i katalogene rettet. Retting etterpå: klipp = Performance (2/mnd) og Performance Pro (4/mnd), «Følg med» avklart, timepris 950 kr merket demodata. Kartleggingsøkt er fjernet (beslutning 26.09). «Simulator-klippekort» i Forelder-kitet står urørt |
| 7 | AgencyOS AG-07–12 (stall, spiller 360, analyse, teknisk plan, Workbench, øktark) | Ferdig 26.09 — AgencyOS AG-01–12: 240 tilfeller, 0 avvik; PH-11 32 tilfeller, 0 avvik. Hardkodede farger 0 i alle kits. «Kopier forrige uke» er standard også i PH-11. Etterlevelse = gjennomført mot planlagt tid siste fire uker (beslutning 26.09). PS-01 strøket 27.09: én spillerprofil (AG-08) |
| 8 | AgencyOS AG-13–18 (live-tavle, plan og maler, tester, grupper, turneringer, TrackMan) | Ferdig 26.09 — 140 tilfeller, 0 avvik (nye skjermer + AG-11). Hardkodede farger 0 i alle kits. Øvelsesredigering etter AK-formel v2 med ordene fra `docs/ordbok.md` (Automatikk; belastning = miljø). AK-stigen fire trinn, Knøtt og WANG ved siden av. DataGolf bare for Anders |
| 9 | AgencyOS AG-19–24 (Caddie/Jarvis, økonomi, oppgaver, innsikt, oppsett, drift) + retting: kartleggingsøkt fjernet, etterlevelse avklart | Ferdig 26.09 — AG-01–24: 480 tilfeller, 0 avvik; PH-16, PH-23 og marked: 69 tilfeller, 0 avvik. Hardkodede farger 0. Kartleggingsøkt: 0 treff i hele prosjektet. Etterlevelse samme tall i AG-07/08/09 og PH-16. Økonomi er demodata i Tripletex-format (merket); WANG-kostnad «Omtrentlig demotall». Faktura beholdes 5 år ved sletting (Anders bekreftet). Alle 24 AgencyOS-skjermtyper tegnet |
| 10 | Forelder FO-01–06 og konto AU-01–06 | Ferdig 26.09 — FO og AU 192 tilfeller, 0 avvik; AG-01/11/20 på nytt 60 tilfeller, 0 avvik (felles skall). Kataloger: `ui_kits/forelder/katalog.html`, `ui_kits/konto/katalog.html`. Hardkodede farger 0. Etterlevelse i ukerapporten = samme tall som AgencyOS. Avklart: «under 16» (hvem samtykker) og «født 2008» (hvem vises åpent) er to ulike regler; innsyn viser bare samtykkede |
| 11 | Booking BK-01–03, GFGK Junior GJ-01–02, system SY-01 | Ferdig 26.09 — FO, AU, BK, GJ og SY: 288 tilfeller, 0 avvik. Hardkodede farger 0. Ett felles skjermoppsett `ui_kits/_shared/screen.html` for forelder, konto, booking, GFGK og system (kopiene slettet). Gratis avbestilling til 24 t før = `src/lib/booking/policy.ts`. Åpent: skal offentlig booking bekreftes av coach eller automatisk? Vipps bare vist som valg |
| 12 | Statistikk ST-01–06 | Ferdig 26.09 — 96 tilfeller, 0 avvik. Katalog: `ui_kits/statistikk/katalog.html`. Hardkodede farger 0. Født 2008 eller senere uten samtykke og manglende fødselsår filtreres bort i søk, lister og leaderboard. Kohortsammenligning i ST-05 byttet til PGA-spillere (coachverktøy, ikke offentlig). Persentil bare i ST-05 for PGA-tall. Alle 74 skjermtyper tegnet |
| 13 | Retting etter runde 12 + samlet kontroll av alle 74 skjermtyper | Ferdig 27.09 — 1 696 tilfeller, 0 avvik (PH lyst og natt, AG fem bredder, øvrige fire bredder, alle fire tilstander). Hardkodede farger 0 i alle kits. Dødlenker 0. Ekte spillernavn («Øyvind») byttet ut; øvrige demonavn sjekket mot spillerregisteret i ak-second-brain: ingen treff. Plassering merket «Rangert etter snitt brutto». Offentlig booking merket «Uavklart: coach eller automatisk» |
| 14 | oversikt.html komplett (74 rader, kolonne for port 7), readme, ord på tvers, nye etternavn | Ferdig 27.09 — 1 701 tilfeller, 0 avvik. P-posisjoner samlet til P1.0–P10.0 (40 forekomster). «Compliance» → «Etterlevelse». Magnus/Line Kristiansen fikk annet etternavn |
| 15 | Overlevering til Codex: `overlevering/codex.md` + `tokens.css`, per skjermtype, uavklarte beslutninger, byggerekkefølge; ordmaster til P1.0–P10.0 | Ferdig 27.09 — `overlevering/codex.md` + `index.html` + `tokens.css` (lyst i `:root`, natt i `[data-theme="night"]`). 74 skjermtyper beskrevet med datebehov, åtte byggetrinn, 16 uavklarte punkter. Ordmaster og `ak-vocabulary.js` bruker P1.0–P10.0; endrede skjermer 290 tilfeller, 0 avvik |
| 16 | Booking bekreftes automatisk (beslutning 27.09): BK-03 og PH-23 uten ventestatus, PlayerHQ-tilbud til gjest. E-postene EP-01 bekreftelse, EP-02 endret time, EP-03 påminnelse, EP-04 avbestilling, EP-05 takk etter coachingtime, EP-06 oppfølging | Ferdig 27.09 — 160 tilfeller, 0 avvik. Katalog `ui_kits/epost/katalog.html` |
| 17 | Retting: takk innen 24 t, én oppfølging etter 14 dager, appbooking automatisk, gjestebookinger hentes inn på kontoen, kontolenke uten e-post | Ferdig 27.09 — 124 tilfeller, 0 avvik, 80 lenker i overleveringen virker. 2 uavklarte igjen |
| 18 | Én spillerprofil (AG-08, PS-01 strøket), ST-05 bare ekte Data Golf-tall | |

Etter hver runde: oppdater statuskolonnen her. Port 7 (Anders har sett skjermen) føres i
`oversikt.html` i prosjektet.
