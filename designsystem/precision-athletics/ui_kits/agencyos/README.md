## Skjermkatalog AG (runde 6–7)

- AG-07–AG-12 (runde 7): `data-ag2.js`. AG-11 bruker samme motor som PH-11 (`window.PHQ_WB` med `coach`-prop: stall-velger, gruppemodus, Publiser). Hurtighandlingen «Ny økt i Workbench» åpner AG-11.

- `katalog.html` + `screen.html`: AG-01–AG-06, bredde 390/768/1024/1280/1440, tilstand Data/Tom/Laster/Feil. Valg huskes i localStorage (`ag-cat-ui`).
- `ag-parts.jsx` (`window.AGQ`): skall (NavRail ≥1024, MenuBar + NavDrawer under), Page, EvCard (nøytralt kort med aksestripe, delt ved flere akser), Draft-merke, Gate for tilstander, `price(svc, rate)` — pris fra ServiceType, aldri fast tekst.
- `../_shared/Hurtigknapp.jsx` (`window.AK_FAB`, alias `AOS_FAB`): én delt modul for AgencyOS og PlayerHQ (28.09), med bjelle, montert i skallet (både katalogen og `index.html`). 56 × 56 grafitt, radius 2, dras fritt, klemmes 8 px fra kant, <5 px = trykk, menyen snur ved kant, posisjon i `aos-fab`. Fire handlinger: Ny økt i Workbench · Ny melding til spiller · Registrer runde · Spør Jarvis. Aldri på PlayerHQ.
- `data-ag.js`: bare demodata. Hovedspiller Tobias Lindvik, coach Anders Kristiansen.
- Jarvis forbereder, sender ingenting. Alt som går til et menneske er utkast med Send/Godkjenn.

# AgencyOS UI kit (/admin)

One kit, one shell (`ui_kits/_shared/KitShell.jsx`): NavRail 56 above 1024 px, MenuBar + NavDrawer below. Toast via `window.AOA.toast(text, meta)`.

| Nav | Page id | File |
|---|---|---|
| Hjem | `hjem` | `Cockpit.jsx` — «Én ting nå», AgenticOS-forslag, stalloverblikk |
| Innboks | `innboks` | inline in `index.html` (EmptyState — screen drawn next round) |
| Kalender | `kalender` · `treningsuke` | `Kalender.jsx` (timeplan, booking, klippekort, flytt time) · `CalendarScreen.jsx` |
| Stall | `stall` | `StallScreen.jsx` + Inspector |
| Workbench | `workbench` · `oktbygger` | `PlanEngine.jsx` + `PlanParts.jsx` + `ExerciseComposer.jsx` · `OktBygger.jsx` |
| Kø | `godkjenninger` | `Godkjenninger.jsx` |
| Caddie | `caddie` | `Caddie.jsx` |

Shared: `Parts.jsx` (`window.AOA`), `data.js` (`AOS_PLAYERS`), `data-admin.js` (`AOA_DATA`), `planmotor-data.js` (`PM`). Standalone: `planmotor.html`, `drillvelger.html`.

Rule 1 applies: every Godkjenn / Publiser / Legg til is graphite primary. Rust only for the Kø counter, ACWR over 1,50 and klippekort that is empty.
