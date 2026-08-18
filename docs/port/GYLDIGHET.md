# GYLDIGHET — hvilke dokumenter som styrer skjermbygging (18.08.2026)

**Legges som `docs/port/GYLDIGHET.md`.** Én rangordning, så ingen gammel plan kan
overstyre designet. Ved konflikt vinner høyere nummer ALDRI over lavere.

**Slanket 18.08.2026:** `docs/port/` hadde 80 dokumenter, hvorav de fleste var
øyeblikksbilder (nattkjøringer, bølgestatus, gamle planer) som aldri ble ryddet etter at
noe nyere erstattet dem. 69 er flyttet til `docs/port/arkiv/` (stemplet, ikke slettet).
Kun de sju filene under, pluss `AAPNE-SPORSMAL.md` (åpne spørsmål, se `docs/port/arkiv/`-
uavhengig levende fil) og `README.md` (denne mappens indeks), står igjen i roten.

## Styrende (i denne rekkefølgen)

| # | Dokument | Rolle |
|---|---|---|
| 1 | `designsystem/paper/` | **Fasiten selv** — speil av Claude Design `605a48cc`. Vinner alltid på layout, CTA, logo, tokens |
| 2 | `docs/port/PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| 3 | `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| 4 | `docs/port/rutefasit.md` | Alle ruter UTEN egen fasit-fil — rute → mal → avvikslinje |
| 5 | `docs/port/fasit-liste-paper.md` | Fasit-fil ↔ rute (hva finnes i Claude Design) |
| 6 | `docs/port/monsterdokument-paper.md` | Eneste designkilde for skjermer uten egen Paper-fasit |
| 7 | `docs/port/AVVIKSRAPPORT-2026-08-13.md` | Siste målte avviksrapport mot fasiten |

`docs/port/AAPNE-SPORSMAL.md` er den levende lista over ubesvarte spørsmål — ikke
styrende for bygging, men skal sjekkes før noe antas.

## UTGÅTT — arkivert i `docs/port/arkiv/` (stemples, slettes ikke)

Alle 69 filer flyttet 18.08.2026 fikk denne linjen øverst:

```
> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.
```

Dette dekker alle tidligere kategorier (Wave-historikk, PP-status-øyeblikksbilder,
GROK-/OVERNIGHT-/NATT-/IPHONE-kjøringslogger, CLAUDE-DESIGN-PROMPT-bestillinger,
fase0–fase4/steg5-kontroll, `plan-designport-alle-skjermer.md`,
`skjermplan-tegnet-og-wireframe.md`, `PAPER-PATTERN-CHECKLIST.md`,
`portstatus-paper.md`, `PP-W3/W4/W5-VARIANTS.md` m.fl.) — se `docs/port/arkiv/`
for fullstendig liste. `BOOKING-POLICY.md` og `BOOKING-SLOT-HOLD.md` ble IKKE arkivert
selv om de lå i `docs/port/` — de er aktuelle kodereferanser for booking-motoren, ikke
porteringsstatus, og feilaktig plassert her. Flytting til riktig mappe er ikke gjort
i denne ryddingen (utenfor scope) — flagget i PR.

## Konfliktregler (uendret fra PP §8)

1. **Fasit vinner** på layout, CTA-disiplin, logo, tokens.
2. **Data som mangler i fasit:** ærlig tomtilstand — aldri finn opp UI eller tall.
3. **Fasit mot vedtatt IA:** stopp, én-linjes beslutning til Anders, oppdater fasit ELLER rute — aldri to sannheter.
4. **Én-linje-testen** (rutefasit.md): kan ikke avviket sies i én setning, er ruten en egen skjerm — meld, ikke improviser.
5. Ingen agent setter `[x]`, ingen agent senker en gate.
