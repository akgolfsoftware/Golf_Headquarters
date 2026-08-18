# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. **Skrives alltid
> komplett på nytt fra regnskapet** (`docs/port/PAPER-ZIP-CHECKLIST.md` +
> `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`) — aldri lagvis. Se CLAUDE.md §Arbeidsregler.

**Sist oppdatert:** 2026-08-18 (full regenerering — gamle motstridende snapshots fjernet,
se `docs/feillogg.md`).

## Designport — regnskap (kilde: PAPER-ZIP-CHECKLIST.md, sync 16.08.2026)

| Blokk | `[x]` signert | `[~]` bygget/ikke signert | `[ ]` ikke portet | Ute (`[-]`) |
|---|---:|---:|---:|---:|
| Fase 1 (33 rader) | 28 | 3 | 0 | 2 |
| W1 PlayerHQ (11) | 0 | 11 | 0 | — |
| W2 Analysere-dybde (12) | 0 | 12 | 0 | — |
| W3 Meg/Booking/Talent/Coach (7) | 1 | 6 | 0 | — |
| W4 AgencyOS (8) | 8 | 0 | 0 | — |
| W5 Marketing/Auth/Forelder/System (6) | 2 | 4 | 0 | — |
| W6 WANG + GFGK (4) | 1 | 2 | 1 | — |
| D1–D6 Funksjonspotensial (6) | 0 | 3 | 3 | — |
| Templates (8) | — | — | — | 8 |
| **SUM (85 aktive rader)** | **40** | **41** | **4** | **10** |

**Mal-varianter:** 72 rader gjenstår i `docs/port/arkiv/PP-W3/W4/W5-VARIANTS.md`
(W3 9 · W4 38 · W5 25), 0 kvittert. Disse ble arkivert 18.08 (dokumenthygiene i
`docs/port/`, se GYLDIGHET.md) — filene finnes fortsatt, kun flyttet.

**Blokkert / venter på beslutning:**
- D1 Workbench F4 — delvis blokkert: `SessionStatusV2` mangler utkast-tilstand.
- D2 Booking→faktura — avklart 15.08 (Stripe ved visning), ingen blokker igjen, ikke bygget ennå.
- D4 Test→drill+forfall — blokkert: `TestDefinition` mangler områdekode, krever additivt felt + Anders' backfill av 36 testdefinisjoner.
- W6 `wang-logg-inn.html` — blokkert: eies av åpen PR #406 + OTP-flyt er produktbeslutning.

**Definisjon «pixel-perfekt DONE»:** D1–D12-kriteriene i `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`
§0. Sign-off (`[x]`) settes KUN av Anders (D12).

## Bygg og tester

Verifiser alltid selv med `npm run verify && npm test` før du stoler på et tall her —
dette feltet er ikke re-kjørt automatisk ved hver STATUS-NÅ-regenerering.

## Verktøystatus

| Verktøy | Status |
|---|---|
| `scripts/signoff-gallery.mjs` | Virker (app+fasit side om side, m390/d1280, lys/mørk). Krever `SCREENTEST_PASSWORD`. |
| `tests/e2e/paper-visual/` (100+ specs) | Snapshot-diff, `maxDiffPixelRatio: 0.04`, kjøres kun med `PAPER_SEED=1`. |
| `scripts/check-typografi.mjs` | Warning-modus (`--diff`/`--alle`). |
| `scripts/check-token-gap.mjs` | Blokkerende i `npm run verify` + CI. |
| Preview-miljø | OK siden 10.08; prod = `akgolf.no`. |

## Åpne PR-er (per 16.08, kilde: PIXEL-PERFECT-PLAN-COMPLETE.md)

Kun #406 og #490 (begge WANG-deling/elevnavn). Merge-køen ellers tom da dette ble talt —
sjekk `gh pr list` for gjeldende tall, ikke stol blindt på denne linjen over tid.

## Fasit og styringsdokumenter

Full rangordning: `docs/port/GYLDIGHET.md`. Åpne spørsmål: `docs/port/AAPNE-SPORSMAL.md`.
Siste målte avviksrapport: `docs/port/AVVIKSRAPPORT-2026-08-13.md`.
