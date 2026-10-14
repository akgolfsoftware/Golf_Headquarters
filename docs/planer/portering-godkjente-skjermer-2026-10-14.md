# Portering av godkjente PlayerHQ-skjermer (14.10.2026)

Bestilling fra Anders 14.10: «Lag nå en plan for alle skjermene som er godkjent med det nye designet, og start å portere dem til kode, slik at de blir live i appen.»

## Hva er godkjent

Kilde: `docs/design-system/utkast-playerhq/README.md`. Godkjent av Anders 14.10 (port 7 i designet):

| Pakke | Fasit | Skjermer |
|---|---|---|
| 3 Plan og Workbench | `plan.html` | PH-10, PH-11 (uke), PH-11-GJENTA, -AR, -NY, -PER, -PERSKJEMA, -MND, -MNDSKJEMA, -MAL, -MAL-IUP |
| 4 Øvelser og teknikk | `ovelser.html` | PH-12, PH-13 (+ øvelse, break-tabell), PH-TP-01 (+ utkast fra coach) |
| 5 Runder | `runder.html` | PH-18, PH-RD-01–09 |

Ikke med: pakke 2 Treningsøkta, PH-01 I dag (utkast 4), PH-16 Stats og pakke 6–7 er utkast som venter på Anders.

## Fast oppskrift per steg

1. Ny skjermkomponent i `src/components/portal/precision/`, stil i `src/styles/playerhq-ny.css` (avgrenset til `.phn`). AgencyOS endres ikke.
2. Funksjonene som finnes i dag beholdes. Det utkastet viser som appen ikke kan, står som avvik øverst i komponenten.
3. Prøvefil i `tests/visual/precision/skjermer/<ID>.tsx`, målt med `node tests/visual/precision/maal.mjs <ID> --bredder 390,360,1440`: ingen sidelengs rulling, treffmål, ingen konsollfeil.
4. `npm run verify:static` og `npm test` grønne, én PR per steg, legges inn i main når CI er grønn.
5. Ferdig først når Anders har sett skjermen i appen (port 7).

## Rekkefølge

| Steg | Skjerm | Status |
|---|---|---|
| 1 | PH-10 Plan | Lagt inn (#1247) |
| 2 | PH-11-AR Årsplan | Denne PR-en |
| 3 | PH-11-PER Periode og PH-11-PERSKJEMA | |
| 4 | PH-11-MND Måned og PH-11-MNDSKJEMA | |
| 5 | PH-11-NY Opprett årsplan (veileder) | Kopi av fjoråret og standardplan finnes ikke i koden |
| 6 | PH-11 Workbench uke og Gjenta | Størst; erstatter Ukeverkstedet for spilleren |
| 7 | PH-11-MAL Målsetninger og IUP-måltall | |
| 8 | PH-12, PH-13, PH-TP-01 (pakke 4) | |
| 9 | PH-18 og PH-RD-01–09 (pakke 5), lyst også ute på banen | |
| 10 | Samlet kontroll og README-status | |

## Avklart 14.10

Spilleren får nivåene År · Periode · Måned · Uke · Målsetninger; coachen beholder de fire flatene.
Se `.claude/rules/beslutninger.md` §SPILLERENS WORKBENCH FÅR NIVÅENE.
