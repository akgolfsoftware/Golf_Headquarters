# GYLDIGHET — hvilke dokumenter som styrer skjermbygging

> **SUPERSEDERT 25.08.2026 (Anders, i økt): Train-lock er designfasit for ALLE skjermer i
> PlayerHQ og AgencyOS.** Rangordningen under (Paper som #1) er HISTORIKK og skal ikke
> følges for produktflatene. Gjeldende styring: `CLAUDE.md` invariant 2 +
> `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` + `.claude/rules/beslutninger.md` (øverste
> beslutning). Filen beholdes som arkivreferanse for den avsluttede Paper-porten.

**Legges som `docs/port/GYLDIGHET.md`.** Én rangordning, så ingen gammel plan kan
overstyre designet. Ved konflikt vinner høyere nummer ALDRI over lavere.

## Styrende (i denne rekkefølgen)

| # | Dokument | Rolle |
|---|---|---|
| 1 | `designsystem/paper/` | **Fasiten selv** — speil av Claude Design `605a48cc` (+ `jarvis/`-skjermene). Vinner alltid på layout, CTA, logo, tokens |
| 2 | `docs/port/PAPER-ZIP-CHECKLIST.md` | Status per fasit-fil. `[x]` settes kun av Anders |
| 3 | `docs/port/PORTPLAN.md` | **Rekkefølgen og blokkeringen** — én sesjon per mal-fasit, hva som kan startes nå. NY 17.08 |
| 4 | `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` | Metoden: D1–D12, PP-faser, fabrikk-løypa |
| 5 | `docs/port/rutefasit.md` | **Alle ruter UTEN egen fasit-fil** — rute → mal → avvikslinje → komponenter (v2, 16.08). ⚠ «Utgår»-linjene er IKKE en slettliste — les PORTPLAN §A0 først |
| 6 | `docs/port/PP-W3/W4/W5-VARIANTS.md` | Kvittering per variantrute (m390 + d1280) |
| 7 | `docs/port/arkiv/portstatus-paper.md` (arkivert 25.08) + `fasit-liste-paper.md` | Historiske status/oppslagslister |

Kontrakten (slik en rute bygges fra en mal-fasit) og skjermbilde-gaten bor i
`CLAUDE.md` §Skjermarbeid — de gjentas ikke her.

## UTGÅTT — slettes, ikke stemples (regel endret av Anders 17.08.2026)

Tidligere regel var «stemples, slettes ikke». Anders ba 17.08.2026 om at gamle og
utgåtte dokumenter **slettes** — git-historikken bevarer alt. Samme dato ble hele
UTGÅTT-lista fra 12.08 slettet (33 stemplede filer), sammen med kjøringslogger,
nattrapporter, signeringsgallerier, Wave-statusfilene og erstattede planer
(~78 filer totalt — se PR-en «plan-opprydding 17.08» for full liste).

**Regelen fremover:** når et dokument erstattes, slett det i samme PR som innfører
erstatteren, og rett alle pekere. Ikke la to sannheter om samme tema leve samtidig.
Unntak: ingenting under `designsystem/` slettes — det er speil av Claude Design og
skal være byte-identisk med siste zip.

## Konfliktregler (uendret fra PP §8)

1. **Fasit vinner** på layout, CTA-disiplin, logo, tokens.
2. **Data som mangler i fasit:** ærlig tomtilstand — aldri finn opp UI eller tall.
3. **Fasit mot vedtatt IA:** stopp, én-linjes beslutning til Anders, oppdater fasit ELLER rute — aldri to sannheter.
4. **Én-linje-testen** (rutefasit.md): kan ikke avviket sies i én setning, er ruten en egen skjerm — meld, ikke improviser.
5. Ingen agent setter `[x]`, ingen agent senker en gate.
