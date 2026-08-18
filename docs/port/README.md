# docs/port/ — designport-dokumenter

Rangordningen over hvilke dokumenter som styrer skjermbygging: **`GYLDIGHET.md`**.
Alt annet som tidligere lå i denne mappen (nattkjøringer, bølgestatus, gamle planer)
er flyttet til `arkiv/` 18.08.2026 — stemplet UTGÅTT, ikke slettet.

## Levende dokumenter (les disse)

| Fil | Rolle |
|---|---|
| **`GYLDIGHET.md`** | **Rangordningen** — hvilke dokumenter som styrer, hvilke som er utgått |
| `PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| `PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| `rutefasit.md` | Alle ruter uten egen fasit-fil — rute → mal → avvikslinje |
| `fasit-liste-paper.md` | Fasit-fil ↔ rute (hva finnes i Claude Design) |
| `monsterdokument-paper.md` | Eneste designkilde for skjermer uten egen Paper-fasit |
| `AVVIKSRAPPORT-2026-08-13.md` | Siste målte avviksrapport mot fasiten |
| `AAPNE-SPORSMAL.md` | Levende liste over ubesvarte spørsmål |

`fasit-liste-paper.md` er sannhetskilden for «finnes det en tegnet fasit?».

`designsystem/paper/` er arbeidsfasiten — lokalt speil av Claude Design-prosjektet
`605a48cc` (siste sync: se `designsystem/paper/SYNC-STATUS.md`). Originalen vinner ved
uenighet; speilet resynkes når Anders leverer ny zip. Visual seeds: `tests/e2e/paper-visual/`.

`BOOKING-POLICY.md` og `BOOKING-SLOT-HOLD.md` ligger i denne mappen men er
kodereferanser for booking-motoren, ikke porteringsdokumenter — ikke arkivert, men
riktig sted for dem er trolig `docs/platform/`.
