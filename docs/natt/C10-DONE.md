# C10 — DataGolf-spillerkort + økonomiflate — DONE

Gren: `claude/c10-datagolf-okonomi`

## Levert

- **DG-01** på `/portal/analysere/datagolf` — Skill / True SG / Rest, faner Felt · Skill · Innspill · Starter. Kun DataGolf-motor (PublicPlayerRound.source = DATAGOLF + PgaPlayerSeason). Broadie-SG og PEI vises ikke. Negative tall = opacity, aldri rødt. PGA-putt merket som Broadie-tabell. «Tren mot» = UTKAST.
- **EC-01** på `/admin/agencyos/okonomi` — YTD (Tripletex-resultat, budsjett = mangler), faktura-rader, timeklipp. **FORFALT** er eneste danger (`TL.danger`) og kommer fra Stripe PAST_DUE / FAILED. Ingen simulator-omsetning. Ingen gjettede USD-tall.
- **`/admin/reports`** redirecter til `/admin/agencyos/okonomi#rapporter`. Rapport-fliser og månedsrapporter er flettet inn.
- D2 booking→faktura: Invoice-modell **ikke** innført. Forfalt leses fra Stripe ved visning.

## Motor-skille (verifisert i tester)

`klassifiserKilde` / `kunDataGolf` dropper Broadie og PEI. `fmtDgTall(null)` og `fmtKrNb(null)` er «mangler», aldri 0.

## Ikke i denne jobben

- Full `/stats/*`-flytting (utsatt etter lansering).
- Invoice-modell / booking→faktura-kjede (krever Anders + ev. kirurgisk DDL).
- Tripletex-budsjett (ingen budsjettkilde i API-klienten).
- Skjermbilde-gate (Anders må se 390 + 1280, lys + mørk).
- Stripe live-cutover, DNS, DKIM.

## Verifikasjon

- `npx tsc --noEmit` grønn
- eslint på rørte filer grønn
- tester: `datagolf-kort.test.ts` + `okonomi-visning.test.ts` 14/14
