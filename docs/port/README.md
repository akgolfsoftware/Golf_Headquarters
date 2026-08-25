# docs/port/ — designport-dokumenter

> **SUPERSEDERT 25.08.2026:** Train-lock er designfasit for alle PlayerHQ/AgencyOS-skjermer
> (Anders, i økt) — `designsystem/paper/` er IKKE lenger arbeidsfasit, og GYLDIGHET.md-
> rangordningen er historikk. Denne mappen er arkiv for den avsluttede Paper-porten.
> Gjeldende plan: `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`.

Rangordningen over hvilke dokumenter som styrer skjermbygging: **`GYLDIGHET.md`**.
Historikk (fase 0–4, Wave-filer, nattrapporter, gallerier, gamle ordrer) er **slettet
17.08.2026** etter Anders' beslutning — alt lever i git-historikken.

## Levende dokumenter (les disse)

| Fil | Rolle |
|---|---|
| **`GYLDIGHET.md`** | **Rangordningen** — hvilke dokumenter som styrer |
| `PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| **`PORTPLAN.md`** | **Rekkefølgen** — én sesjon per mal-fasit, blokkeringer, hva som kan startes nå |
| `PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| **`rutefasit.md`** | **Alle ruter uten egen fasit-fil** — rute → mal → avvikslinje → komponenter |
| `PP-W3/W4/W5-VARIANTS.md` | Kvittering per variantrute (m390 + d1280) |
| `portstatus-paper.md` | Samlet portstatus (tall fra checklisten) |
| `fasit-liste-paper.md` | Fasit-fil ↔ rute (hva finnes i Claude Design) |
| `monsterdokument-paper.md` | Designkilde for skjermer uten fasit |
| `typografi-skala-paper.md` | Kanonisk fontskala |
| `drift-agenticos-konsolidering.md` | AgenticOS-konsolideringen (se også `docs/plan-agenticos-jarvis-2026-08-17.md`) |
| `masterplan-lansering-2026-08-12.md` | Lanseringsplanen (P0/Stripe/1. sept) |
| `plan-design-wang-arsplan.md` | WANG-designplanen (B4/B5 fortsatt åpne) |
| `BOOKING-POLICY.md` + `BOOKING-SLOT-HOLD.md` | Booking-domenedokumenter |

`PAPER-ZIP-CHECKLIST.md` er sannhetskilden for «er denne skjermen inne?».
`fasit-liste-paper.md` er sannhetskilden for «finnes det en tegnet fasit?».
Samlet gjenstående-plan på tvers av alle spor: `docs/MASTERPLAN-GJENSTAAENDE.md`.

**`designsystem/paper/` er arbeidsfasiten** — lokalt speil av Claude Design-prosjektet
`605a48cc` (siste sync: se `designsystem/paper/SYNC-STATUS.md`). Originalen vinner ved
uenighet; speilet resynkes når Anders leverer ny zip. Visual seeds: `tests/e2e/paper-visual/`.
