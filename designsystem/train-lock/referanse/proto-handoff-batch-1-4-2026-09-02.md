# HANDOFF-oppføringer for den klikkbare prototypen, batch 1–4 (02.09.2026)

> Fire seksjoner fra Claude Design-prosjektets HANDOFF.md (zip 05.09.2026), tatt ut her fordi zip-ens HANDOFF ellers mangler repoets rettelser fra 03.09. Flettes inn i `designsystem/train-lock/HANDOFF.md` i fase 1 økt 8 (designport-planen). Prototypen selv er ikke synket inn — se `PROTOTYPE-PLAN-2026-09-02.md`.

## 02.09.2026 — Klikkbar prototype, batch 4 (`proto/`)

- `proto/registry.js` er nå kilden for hvilke skjermer som finnes. Ny skjerm: skriv `S <ID>.dc.html`, legg ID i registeret, regenerer ladderne i de tre skallene. Skallene har faste `name="S <ID>"` (aldri navn i `{{ }}` — det brøt monteringen i batch 3).
- 10 nye skjermer: WB-05 måned (dag-rutenett med kategoriprikker, ACWR-kurve, pyramide), WB-06 årsplan (fasebånd uke 1–52, turneringer og tester), P-02 økt-editor (drill-tidslinje + fasett-inspektør 380 på bred flate), A-04 øvelsesbank, A-03 ny drill (ark), WB-09 grupper, JV-01 Jarvis-kø, JV-02 utkast med kilder, AG-19 coach-varsler, P-07 spillerens nye økt (ark).
- Jarvis-grammatikk: utkastets foreslåtte økter står i `target` blå — samme regel som merge-diffen (blå = ikke publisert ennå, venter på coachens ja). Kildestyrke er tekst, ikke farge: «Sterk kilde» / «Tynn kilde».
- Kategorifargene i måned/årsplan: sand = slag og teknikk, grå = fys, warm = spill og turnering. Ingen ny farge.
- AG-19 varsler leser spillerens faktiske tilstand — fullført økt og merget uke dukker opp øverst.
- Neste: batch 5 — Foreldreportalen på tre skall, AgenticOS, Fys, Spiller 360, drift-tilstander.

## 02.09.2026 — Klikkbar prototype, batch 3 (`proto/`)

- Navigasjonen er nå **rolledrevet**: `tabsFor(role)` i `proto-core.js` bygger dock (iPhone), tab bar (iPad 834), skinne (iPad 1180) og rail (Mac) fra samme liste. Coach får 5 faner — dock krymper padding automatisk. Ikoner og etiketter bor ett sted.
- 15 nye coach-skjermer: Cockpit (AG-01), Innboks (AG-03), Stall (AG-04), Kalender (KA-03), Workbench uke (WB-02); ark AG-05 Mer, AG-08 spiller-ark/panel, AG-10 Merge-diff, WB-03 publiser; artefakt AG-09 live-tavle; huber AG-06 Plan, AG-07 Innsikt, AG-12 Innsikt stall, AG-18 Oppsett, EC-01 Økonomi.
- **Demo-sløyfen virker:** Merge (AG-10) eller Publiser (WB-03) setter `published` → bytt rolle til Spiller, og varsel-arket viser «Anders publiserte ny økt». Motsatt vei: spillerens fullførte økt vises i coachens Cockpit («Øyvind i dag · fullført») og i spiller-arket. Merget kø-kort blir warm hake, køtelleren går 3 → 2.
- Merge-diffen bruker `target` blå på det coachen godkjenner, gjennomstreket mute på det gamle — eneste sted blått bærer «trenerens intensjon» i en diff.
- AG-09 live-tavle: 20 gate-putter som sand/grå/tom ruter, ingen rød.
- Neste: batch 4 — Workbench i dybden (måned, årsplan, økt-editor, drill, kilder) og Jarvis/AgenticOS.

## 02.09.2026 — Klikkbar prototype, batch 2 (`proto/`)

- Skallene monterer nå skjermer **generisk** (`<dc-import name="{{ screenName }}">`) — ny skjerm = én fil `S <ID>.dc.html` + én linje i `SCREENS`/`SHEETS`/`ARTS` i `proto-core.js`. Ingen skall-redigering per skjerm.
- 18 nye skjermer: Analyse-treet (PH-11/12/13/14/15, PH-21, DG-01, TE-09), Meg-barn (ME-01–04, PH-18), booking (BO-02 → BO-01 → BO-03, PH-09) og varsel-ark (PH-20). Alle har bred variant (to kolonner) for iPad/Mac via `wide`/`mac`.
- Tilstand: DataGolf-fane, valgt booking-luke (forplantes til bekreftelse og Mine bookinger som «NY» i warm), samtykke-brytere (teller «x av 3 på» i Meg). Varsel «TrackMan-økt importert» hopper til PH-14 via ny handling `open:<ID>` (lukk ark + push).
- I dag fikk to 44-px runde knapper (book, varsler) til høyre for tittelen — ingen ny CTA, hvit primær er fortsatt «Start økt».
- Fargegrammatikk: alle nye stolper/kurver/prikker i `shot`; sentrum på TrackMan-spredning er `target` stiplet ring; bekreftet booking er warm ring-hake.
- Neste: batch 3 — coach-skallet (Cockpit, Innboks, Stall, Kalender, Workbench-rot) + Mer-ark.

## 02.09.2026 — Klikkbar prototype, batch 1 (`proto/`)

- Beslutning fra eier: alle tre roller · iPad både 1180 (skinne) og 834 (tab bar) · lys modus fra start · egne tegninger per skjerm på iPad/Mac (ikke gjenbruk av telefon-kolonne) · navigasjon + tilstandsendring.
- Arkitektur: tre skall-DC-er + skjerm-DC-er uten bezel + `proto-core.js` (ruter/reducer). Trykkflater bærer `data-go` (push), `data-sheet` (ark/panel), `data-art` (artefakt), `data-tab`, `data-back`, `data-close`, `data-action`. Skallet bestemmer presentasjonen: PH-04 er ark på iPhone, sentrert kort på iPad, panel 380 på Mac — samme fil.
- Tema er CSS-variabler satt på rammen (`data-theme`); verdiene er nøyaktig lock-tokens mørk/lys. `shot/target/warm/avatar` er konstante i begge.
- Tilstandsendring som virker: onboarding 1–3 → I dag; Start økt → Live med tellende Treff/Kant/Bom (siste tapper hvit, 12 baller avslutter automatisk) → Økt ferdig med faktiske tall og mål-tekst (under mål = mute, aldri rød) → I dag viser FULLFØRT med warm hake og «Se recap»; Analyse «I vindu i dag» leser samme tall; prikk-måneden fyller 22. Ukjente mål viser «Ikke tegnet i prototypen ennå» + skjerm-ID i stedet for blank flate.
- Fargegrammatikk håndhevet i prototypen: SG-stolper og 8-ukers spark er `shot`-sand, negativ 0.4; fremdriftsbar i Nå-kort er hierarki (hvit).
- Neste: batch 2 (Analyse-tre, Meg-barn, booking på tre skall), deretter coach-skallet.

