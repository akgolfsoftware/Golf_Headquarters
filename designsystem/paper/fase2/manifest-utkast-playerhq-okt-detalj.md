# Manifest — `fase2/playerhq/playerhq-okt-detalj.html`

> **UTKAST — krever Anders' godkjenning.** Generert 20.08.2026 fra malinnholdet (brief «treningsplanlegging» 20.08.2026). Ikke fasit før godkjent.

| Felt | Verdi |
|---|---|
| Fil | `fase2/playerhq/playerhq-okt-detalj.html` |
| Fidelitet | PIXEL-FASIT — tokens verbatim i fila, alle tilstander i fila |
| Rute | /portal/gjennomfore/[id] (dekker også gamle /portal/tren/[sessionId]/planlagt) |

## Nytt siden forrige zip (16.08.2026 21:11)
- Rediger-tilstand (demo-knapp R): navn, sted, start/slutt, målsetning, reps-stepper per drill, «Fjern drill», «Legg til drill», «Lagre endringer»/«Avbryt». Lagre varsler coach — aldri en forespørsel.
- Teknikk-dimensjon (VOKABULAR §3.4): ÉN per drill, vist i drill-listen og valgbar som segmentvalg i rediger-tilstanden. Valglisten følger områdegruppen.
- Motorikk-velger i rediger-tilstanden — rendres KUN på fullsving-drills; på andre områder finnes blokken ikke (ikke grået, ikke tom).

## Tilstander tegnet
planlagt (F) · gjennomført (G) · rediger (R) · tom (T) · laster (L) · feil (E) — lys og mørk

## NYE komponenter (finnes ikke i biblioteket — Sonnet må bygge dem)
- **TallStepper** — numerisk stepper (− / verdi / +, 44 px mål). Deles med live-øktas FYS-justering og onboarding-tillegget.

## Avvik per rute
Rediger er en tilstand av samme skjerm, ikke egen rute. Teknikk-dimensjonens valgliste per områdegruppe står i VOKABULAR.md §3.4.
