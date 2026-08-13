# docs/port/ — designport-dokumenter

Rangordningen over hvilke dokumenter som styrer skjermbygging: **`GYLDIGHET.md`**.
Fase 0–4-dokumentene her (`fase0`–`fase4`, `steg5-kontroll`, kontroll-filene) er
**frosset underlag** — historikk fra kartleggingen, vedlikeholdes ikke (stemplet UTGÅTT).

## Levende dokumenter (les disse)

| Fil | Rolle |
|---|---|
| **`GYLDIGHET.md`** | **Rangordningen** — hvilke dokumenter som styrer, hvilke som er utgått |
| `PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| `PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| **`rutefasit.md`** | **Alle ruter uten egen fasit-fil** — rute → mal → avvikslinje |
| `PP-W3/W4/W5-VARIANTS.md` | Kvittering per variantrute (m390 + d1280) |
| `portstatus-paper.md` | Hva er designet, portet og godkjent i main |
| `fasit-liste-paper.md` | Fasit-fil ↔ rute (hva finnes i Claude Design) |

`portstatus-paper.md` er sannhetskilden for «er denne skjermen inne?».
`fasit-liste-paper.md` er sannhetskilden for «finnes det en tegnet fasit?».
`PAPER-PATTERN-CHECKLIST.md` er **utgått** — erstattet av `rutefasit.md`.

**`designsystem/paper/` er arbeidsfasiten** — lokalt speil av Claude Design-prosjektet
`605a48cc` (siste sync: se `designsystem/paper/SYNC-STATUS.md`). Originalen vinner ved
uenighet; speilet resynkes når Anders leverer ny zip. Visual seeds: `tests/e2e/paper-visual/`.
