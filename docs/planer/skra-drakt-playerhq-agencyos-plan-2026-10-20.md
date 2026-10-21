# Skrå-drakten i PlayerHQ og AgencyOS: veien videre

Laget 20.10.2026 etter at Anders godkjente I dag og Cockpit («Dette er bra»).
Beslutning: `.claude/rules/beslutninger.md` §PLAYERHQ OG AGENCYOS FÅR SKRÅ-DRAKTEN (punkt 4 og 5).
Fasit for drakten: `docs/design-system/utkast-skra/index.html` og de to skjermene i appen.

## 1. Det som er ferdig

| Del | Hvor | PR |
|---|---|---|
| Tokens (flate, skygger, hjørner 18/14, kutt, bevegelse) | `src/styles/ak-tokens.css` | #1554 |
| Byggeklosser: SkraTopp, SkraStat, SkraFlyt, SkraKort, SkraTom, SkraHelt | `src/components/precision/skra/` | #1554, denne |
| I dag (PlayerHQ) | `PH01IDag.tsx` | #1554, denne |
| Cockpit (AgencyOS) | `AG01Cockpit.tsx` | #1554, denne |
| Sidemenyene i PlayerHQ og AgencyOS | `playerhq-ny-skall.css`, `agencyos-ny.css` | #1556 |

**Grepene Anders har godkjent, og som gjelder hver skjerm:**
- Topp med ekte AK Golf-bilde i farger og skrått kutt. Hinnen er mørk bak teksten og slipper banen fram til høyre.
- Fire tall i glass i toppen, og bare tall som finnes i dataene. Mangler et tall, vises «—».
- **Ett hovedkort** over begge kolonnene, med det som gjelder nå. Det står rent i aksefargen og **har aldri bilde** (Anders 20.10: bildene i hovedkortet «ble feil»).
- Hvite kort med myk skygge på lysegrå flate, i to kolonner på PC (1,55 : 1). Kolonnene skal bli omtrent like lange, og ingen kolonne skal stå tom. Mobil viser én kolonne i fast rekkefølge (`Plass`).
- Aksefarge der den betyr noe: øktkort, aksemerker og søyler. Rust er fortsatt bare signal.
- På PC slutter kortene 92 px fra høyre kant, så hurtigknappen aldri dekker innhold. Bunnluften gjør at siste kort kan rulles fri.

## 2. Slik går hver pakke (fast oppskrift)

1. **Skisse:** svart-hvit plassering, mobil og PC, publisert som artefakt. Innholdet hentes fra det godkjente utkastet i `docs/design-system/utkast-playerhq/` eller `utkast-agencyos/` og fra skjermlista `docs/design-handoff/regler/skjermliste.md`. Ingen nye funksjoner.
2. **Anders sier ok** eller retter skissen. Ingen bygging før det.
3. **Bygg** med byggeklossene. Klossene endres ikke i en pakke. Trengs noe nytt i dem, blir det en egen liten PR først.
4. **Mål** med `node tests/visual/precision/maal.mjs <ID> --bredder 390,1280`. Kravet er ingen sidelengs rulling, treffmål på 44 px og ingen konsollfeil. Se på bildene «vindu-topp» og «vindu-bunn».
5. **Send skjermbilder** til Anders (390 og 1280, slik han ser skjermen) og vent på ja.
6. **`npm run verify`**, deretter PR med auto-merge. Én PR per pakke.

Hver pakke er én økt (maks 2 timer). Pakker som ikke rører de samme filene, kan gå samtidig (maks 3).

## 3. Pakkene, i rekkefølge

### PlayerHQ

| # | Pakke | Skjermer (ruter) | Hovedkort | Toppbilde |
|---|---|---|---|---|
| P1 | **Plan** | `/portal/planlegge` med Uke, År, Periode og Måned, og Målsetninger | Uka: lagt inn mot fordelt | `slag-putting.jpg` |
| P2 | **Stats** | `/portal/analysere` med de fire delene, og dybdesidene (resultater, Strokes Gained, trening, tester) | Snittscore med endring | `stats-topp.jpg` |
| P3 | **Meg** | `/portal/meg` og undersidene (profil, fasiliteter, utstyr, helse, foreldre, abonnement, innstillinger, deling) | Det som venter på deg (deling, betaling), ellers ingen | `spill-bane.jpg` |
| P4 | **Treningsøkta** | Øktark, brief og etter økta. Live-økta får **ingen topp**: den er alltid lys og i full skjerm (§LIVE-ØKTENE ER ALLTID LYSE) | Økta | `naerspill-wedge.jpg` |
| P5 | **Runder og tester** | Runderegistrering, scorekort, testregistrering og resultat | Siste runde eller test | `turn-tee.jpg` |
| P6 | **Resten** | Øvelsesbank, hjelp, utfordringer, kommunikasjon og booking | Ingen eller ett per side | etter innhold |

Skissene for P1–P3 finnes allerede: https://claude.ai/artifact/3pZpUhaDhqzmFRyLz7N2xM. De må få Anders' ok før bygging. Hovedkortet er lagt til etter at skissene ble laget, så de oppdateres først.

### AgencyOS

| # | Pakke | Skjermer (ruter) | Hovedkort | Toppbilde |
|---|---|---|---|---|
| A1 | **Innboks** | `/admin/innboks` (liste og sak) | Saken som haster mest | `slag-simulator.jpg` |
| A2 | **Stall og Spiller 360** | `/admin/spillere` og `/admin/spillere/[id]` med alle fanene | Stall: «Trenger deg». Spiller 360: neste økt eller det som krever coach | `slag-utslag.jpg` |
| A3 | **Kalender og Booking** | `/admin/kalender`, `/admin/booking` | Neste økt | `tek-video.jpg` |
| A4 | **Workbench for coach** | `/admin/workbench/[playerId]` | Ingen. Arbeidsflaten trenger plassen; bare lav topp | ingen bilde, lav topp |
| A5 | **Grupper og Tester** | `/admin/grupper`, `/admin/tester` og de eldre `.pa-card`-sidene | Neste testdag eller samling | `slag-putting.jpg` |
| A6 | **Drift** | Økonomi (bare head coach), Oppsett, Data Golf (bare ADMIN), Jarvis, Teknisk plan | Ingen | `stats-topp.jpg` |

Bildene er AK Golfs egne og ligger i `public/images/playerhq/` (11 stk.). Ingen skjerm skal ha samme toppbilde som skjermen ved siden av i menyen. Trengs flere bilder, er det Anders som skaffer dem. Vi bruker aldri Team Norway-bilder eller stockbilder.

### Felles, underveis

| # | Hva | Når |
|---|---|---|
| F1 | **Lav topp** (`SkraTopp` uten tall, lavere) for undersider og detaljsider, som Team Norway sin `TnSkraTopp` | Før P2. Egen liten PR |
| F2 | **Gamle CSS-regler** som portering har gjort ubrukt, ryddes per pakke (for eksempel `.phn-idag2 .start2`, `.tre-tall`) | I hver pakke |
| F3 | **Globale tokens:** `--ak-r-kort` 12 → 18 og `--shadow-card` fra `none` til myk skygge | Når P1–P3 og A1–A3 er ferdige (punkt 2 i beslutningen) |
| F4 | **Mørk grå flate under menyen** på sider som ikke er portert: i dag hvit side mot hvit meny, skilt med en strek | Kommer av seg selv etter hvert som sidene porteres |

## 4. Rekkefølge og samtidighet

1. **Nå:** F1 (lav topp), samtidig som skissene for P1–P3 oppdateres med hovedkort og vises Anders.
2. **Bølge 1** (maks 3 samtidig): P1 Plan, A1 Innboks, A2 Stall og Spiller 360.
3. **Bølge 2:** P2 Stats, P3 Meg, A3 Kalender og Booking.
4. **Bølge 3:** P4, P5, A4, A5.
5. **Bølge 4:** P6, A6, F3.

Ferdig når alle hovedsider i `/portal` og `/admin` bruker byggeklossene, er målt i 390 og 1280 px, og Anders har sett dem.

## 5. Åpne spørsmål til Anders

- **Overskriftsskrift** (punkt 7 i beslutningen): IBM Plex beholdes nå. Det tas opp igjen når P1–P3 er ferdige.
- **Toppbilder:** de 11 bildene holder for første runde. Skal noen sider ha egne bilder (for eksempel fra Mulligan eller styrkerommet)?
- **Workbench for coach (A4):** lav topp uten bilde er anbefalt, fordi arbeidsflaten trenger plassen.
