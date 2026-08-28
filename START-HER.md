# START HER — AK Golf HQ

Én plattform, fire produkter (Marketing · Booking · **PlayerHQ** `/portal` · **AgencyOS** `/admin`).

**Les i denne rekkefølgen:**
1. [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md) — stack, prosjektkart, sannhets-hierarki (5 min). Les før du rører kode.
2. [`docs/STATUS-NÅ.md`](docs/STATUS-NÅ.md) — hvor prosjektet står nå.
3. [`docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`](docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md) — gjeldende lanseringsspor.

**Design:** Train-lock (`designsystem/train-lock/`) er designfasit for ALLE skjermer i
PlayerHQ, AgencyOS og Forelder — se `CLAUDE.md` invariant 2 og `.claude/rules/beslutninger.md`.
Claude Paper (`designsystem/paper/`) er historikk/arkiv, aldri bygg-fasit. Ny kode bruker
`--tl-*` / `TL`, aldri Paper-tokens (`T` / `--p-*`), cream `#FAF9F5` eller Inter/Familjen.

## Kjør lokalt

```bash
npm run dev                # http://localhost:3000
```

Verifikasjon før commit: `npm run verify && npm test`
