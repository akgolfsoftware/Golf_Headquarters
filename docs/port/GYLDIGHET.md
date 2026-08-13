# GYLDIGHET — hvilke dokumenter som styrer skjermbygging (12.08.2026)

**Legges som `docs/port/GYLDIGHET.md`.** Én rangordning, så ingen gammel plan kan
overstyre designet. Ved konflikt vinner høyere nummer ALDRI over lavere.

## Styrende (i denne rekkefølgen)

| # | Dokument | Rolle |
|---|---|---|
| 1 | `designsystem/paper/` | **Fasiten selv** — speil av Claude Design `605a48cc`. Vinner alltid på layout, CTA, logo, tokens |
| 2 | `docs/port/PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| 3 | `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| 4 | `docs/port/rutefasit.md` | **Alle ruter UTEN egen fasit-fil** — rute → mal → avvikslinje. NY 12.08 |
| 5 | `docs/port/PP-W3/W4/W5-VARIANTS.md` | Kvittering per variantrute (m390 + d1280) |
| 6 | `docs/port/portstatus-paper.md` + `fasit-liste-paper.md` | Levende status/oppslagslister |

## UTGÅTT — styrer IKKE bygging (stemples, slettes ikke)

Hver av disse får denne linjen øverst i fila:

```
> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.
```

| Fil | Hvorfor utgått |
|---|---|
| `PAPER-PATTERN-CHECKLIST.md` | Erstattet av `rutefasit.md` (samme jobb, talt mot kode) |
| `skjermplan-tegnet-og-wireframe.md` | Rutetallene erstattet av konsolideringsgatene (kart/w3–w6 + drift) |
| `plan-designport-alle-skjermer.md` | Erstattet av PIXEL-PERFECT-PLAN |
| `WAVE-STATUS-MASTER.md` | Chrome-historikk (Wave A–I) — underordnet PP; «PORT» ≠ DONE |
| `GROK-BUILD-BRIEF.md`, `GROK-NATTORDRE-*` | Historiske ordrer — metoden bor i PP-planen |
| `OVERNIGHT-*`, `NATTPLAN-*`, `NATTRAPPORT-*`, `MORGENSJEKK-*`, `IPHONE-*`, `AUTONOMOUS-*` | Kjøringslogger, ikke plan |
| `CLAUDE-DESIGN-PROMPT-*` | Bestillinger til designprosjektet — levert |
| `fase0–fase4`, `steg5-kontroll`, kontroll-filene | Alt frosset (README sier det selv) |
| `PP-0/1/2-STATUS.md`, `PP-0-ROUTE-MAP.md`, `PAPER-ZIP*-SYNC-*.md` | Øyeblikksbilder — riktig da, status bor i checklisten |

## Konfliktregler (uendret fra PP §8)

1. **Fasit vinner** på layout, CTA-disiplin, logo, tokens.
2. **Data som mangler i fasit:** ærlig tomtilstand — aldri finn opp UI eller tall.
3. **Fasit mot vedtatt IA:** stopp, én-linjes beslutning til Anders, oppdater fasit ELLER rute — aldri to sannheter.
4. **Én-linje-testen** (rutefasit.md): kan ikke avviket sies i én setning, er ruten en egen skjerm — meld, ikke improviser.
5. Ingen agent setter `[x]`, ingen agent senker en gate.
