# docs/port/ — designport-dokumenter

Fase 0–4-dokumentene her (`fase0`–`fase4`, `steg5-kontroll`, kontroll-filene) er
**frosset underlag** — historikk fra kartleggingen, vedlikeholdes ikke.

## Levende dokumenter (les disse)

| Fil | Rolle |
|---|---|
| **`portstatus-paper.md`** | **Hva er designet, portet og godkjent i main** — oppdater ved hver batch |
| `fasit-liste-paper.md` | Fasit-fil ↔ rute (hva finnes i Claude Design) |
| `plan-designport-alle-skjermer.md` | Arbeidsplan / steg 1–10 |
| `GROK-BUILD-BRIEF.md` | Instruks for trygg skjermport |

`portstatus-paper.md` er sannhetskilden for «er denne skjermen inne?».  
`fasit-liste-paper.md` er sannhetskilden for «finnes det en tegnet fasit?».

Én levende plan: `plan-designport-alle-skjermer.md` — full Paper-port av skjermene, **i gang**
siden Anders overstyrte invariant 2 eksplisitt 2026-08-03 (se
`.claude/rules/beslutninger.md` §Tema/design).

**Status 2026-08-06:** Alle Paper-fasitskjermer med rute er portet og merget (#307–#345).
Gjenstår: PR-E (testantall) og PR-F (DataGolf) som beslutninger, pluss ~300 app-skjermer
uten fasit (ny designrunde).

**`designsystem/paper/` er et lokalt speil av Claude Design-prosjektet** (hentet ned i PR #254,
02.08.2026). Det er IKKE kilden — Claude Design-prosjektet `605a48cc` er. Speilet re-synkes
ved design-endring. Visual seeds: `tests/e2e/paper-visual/`.
