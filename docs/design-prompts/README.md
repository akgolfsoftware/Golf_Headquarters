# Claude Design-prompter for AK Golf HQ

Komplett samling av eksakte prompter for å designe alle nye skjermer i Claude Design.

## Slik bruker du dem

1. Åpne Claude Design (claude.ai med design-mode)
2. Velg én skjerm fra fillistene under
3. Kopier hele prompten inkludert felles designspec (00-shared-spec.md) øverst
4. Send til Claude — du får én HTML-fil med inline CSS, klar til Anders-review

## Filer

| Fil | Antall skjermer | Hva |
|---|---|---|
| `00-shared-spec.md` | — | Felles designspec som limes øverst i HVER prompt |
| `01-treningsplanlegger.md` | 12 | Årsplan, Måned, Uke, Dag, PeriodeModal, VolumResept, FasteAvtaler, RepeterendeMønstre, Betingelser, SessionEditor, FysDrillEditor, MalBibliotek |
| `02-turneringsplanlegger.md` | 4 | TurneringsKalender, TurneringsDetalj, ABVurdering, WAGRBenchmark |
| `03-live-session.md` | 5 | LiveAktiv (tablet+mobil), PauseModal, Oppsummering, GodkjentBommetAnimasjon, CoachOvervåkning |
| `04-treningsanalyse.md` | 6 | Oversikt, Krysstabell (VIKTIGST), Trender, SG-kobling, FYS-progresjon, Plan vs Faktisk |

**Total: 27 skjermer**

## Anbefalt rekkefølge

1. **Krysstabell** (4.2) først — Anders' kjerne-innsikt. Hvis denne ikke fungerer visuelt, må vi tenke om.
2. **Årsplan** (1.1) — selve fundamentet for hele planleggeren.
3. **Live session aktiv** (3.1) — kritisk for spilleren, høy frekvens-bruk.
4. **Turneringskalender** (2.1) — sentral oversikt for Anders.
5. Resten i naturlig rekkefølge.

## Estimater

- ~5-10 minutter per skjerm i Claude Design
- Total designtid: 2-4 timer (kan batch-kjøres)

## Etter design er ferdig

Lever HTML-filene til Claude Code med:
> "Implementer skjermen fra `<filnavn>.html` i `/admin/...` som Next.js Server Component, følg eksisterende mønster i `wireframe/design-files-v2/final/`."
