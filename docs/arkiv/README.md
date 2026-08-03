# Arkiv — historiske bygg-/handover-dokumenter

Disse dokumentene var arbeids-spor under den autonome skjermbygg-fasen (juni 2026).
De er **utdaterte** og beholdt kun for historikk. Ikke bygg mot dem.

| Arkivert dok | Var | Erstattet av (levende kilde) |
|---|---|---|
| `SKJERM-STATUS.md` | Per-rad bygg-gate (Phase 0-tabell + 2026-06-22-audit) | `docs/MASTER-SKJERMPLAN.md` |
| `SKJERM-BYGGEPLAN.md` | Fase 3→8 bygge-rekkefølge | `docs/PLAN-GJENSTAENDE.md` |
| `BYGGELOGG-FLAGG.md` | Flaggede avgjørelser fra bygg-loopen | `docs/AAPNE-SPORSMAAL.md` + `docs/PLAN-GJENSTAENDE.md` |
| `KONFLIKTER.md` | Design-vs-kode-avvik (handover steg 2) | Beslutningene er låst; se `docs/AAPNE-SPORSMAAL.md` |
| `ak-formel-review-2026-06-28.md` | AK-formel-gjennomgang (skrevet før designsystem-revisjonen) | `.claude/rules/design-system-regel.md` |
| `akformel-pposisjon-drillniva-plan-2026-06-30.md` | Pre-implementasjonsplan for P-posisjon/teknisk-plan-automatikk | Funksjonen er bygget (runde 2, 2026-07-14) — se `docs/MASTER-SKJERMPLAN.md` |
| `workbench-diff-audit-2026-06-30.md` | Punkt-i-tid Workbench-audit (read-only, 30. juni) | `docs/redesign-v2/workbench-fasit-analyse-2026-07-12.md` |
| `workbench-statusrapport-2026-06-30.md` | Samme batch/punkt-i-tid som diff-audit | `docs/redesign-v2/workbench-fasit-analyse-2026-07-12.md` |

> Merk (2026-08-02): «Erstattet av»-kolonnen over er historisk — flere av målene
> (`PLAN-GJENSTAENDE.md`, `docs/redesign-v2/`, `design-system-regel.md`) er senere
> selv slettet eller flyttet. Fasit i dag er alltid listen nederst i denne fila.

## 2026-08-02-docs-rydding/ — stor docs-opprydding

Arkivert 2026-08-02 etter bevis-sveip (null levende referanser per fil):

| Undermappe/fil | Var |
|---|---|
| `opprydding/` (9 filer) | Kjørebøker og gap-register fra juli-oppryddingen — gjennomført |
| `plans/` (9 filer) | Arbeidsplaner juli 2026 (redesign, kvalitet, feilfiks) — gjennomført. `plans/` i rot beholder kun levende planer |
| `flyt-inventar/` (5 filer) | Flyt-inventar 17.06 — avløst av `docs/platform/user-flows.md` |
| `user-flows/` (3 html) | Genererte flyt-visualiseringer — ikke lenket fra levende docs |
| `design-bestillinger/` (2 filer) | D2/D3-bestillinger til Claude Design — levert 27.07 |
| `rot/` (3 filer) | `WORKLOG.md` (avløst av ak-brain), `LAUNCH-CHECKLIST.md` (mai-launch gjennomført), `SYNC.md` (dekket av globale regler) |
| Enkeltfiler i rot av mappen | AgencyOS-/plattform-visjoner, workbench-fasit (30.06), handoffs og planer — alle avløst av `docs/platform/` + MASTER-SKJERMPLAN |

Samtidig ble 10 dokumenter slettet helt (innhold dekket av levende fasit-filer) —
se commit `chore(docs): slett 10 utdaterte dokumenter` for listen.

## 2026-08-03-forenkling-bolge2/ — pekere og dokument-råte (forenklings-bølge 2)

Arkivert 2026-08-03. Alle innlenker fra levende filer er pekt hit i samme commit:

| Fil | Var | Levende erstatning |
|---|---|---|
| `pilot-status-autonom-2026-07-31.md` + `-for-etter.md` | Pilot-status-duplikater | `docs/STATUS-NÅ.md` |
| `funksjonsinventar-2026-07-29.md` | Funksjonsinventar-snapshot (se RETTELSE øverst i fila) | `docs/MASTER-SKJERMPLAN.md` |
| `designdekning-2026-07-29.md` | Designdeknings-snapshot | `docs/MASTER-SKJERMPLAN.md` |
| `AGENCYOS-INVENTAR.md` | Skjerm-/funksjonsinventar 2026-07-12 | `docs/MASTER-SKJERMPLAN.md` |
| `komponentinventar-gammelt-designsystem-2026-07-31.md` | Komponentinventar-snapshot | `docs/MASTER-SKJERMPLAN.md` |
| `legacy-portering-prioritet.md` | Porteringsliste (historisk 17.07); åpent punkt flyttet til `docs/AAPNE-SPORSMAAL.md` B5 | `docs/MASTER-SKJERMPLAN.md` |
| `design-forbedring-plattform-2026-07-24.md` | Gjennomført designplan (GO V1–V3) | MASTER-SKJERMPLAN endringslogg |
| `ordbok-evaluering-2026-07.md` + `ak-ordliste-gjennomgang.html` | Ordbok-evaluering juli | `docs/ordbok-ak-golf-konsept.md` |

## De levende kildene (én av hver rolle)

- **`docs/STATUS-NÅ.md`** — snapshot: hvor plattformen står akkurat nå.
- **`docs/MASTER-SKJERMPLAN.md`** — autoritativ skjerm-liste + 6 haker per skjerm.
- **`docs/AAPNE-SPORSMAAL.md`** — register over alt uavklart/parkert/løst.
- **`docs/platform/BUSINESS-RULES.md`** — låste forretningsregler (fasit).
- **`docs/gjenstaaende-plan-2026-07-31.md`** — prioritert liste over gjenstående arbeid.
