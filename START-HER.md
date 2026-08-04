# START HER — AK Golf HQ

Én plattform, fire produkter (Marketing · Booking · **PlayerHQ** `/portal` · **AgencyOS** `/admin`).

**Én inngang:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md) — full kontekst
(stack, prosjektkart, sannhets-hierarki) på 5 min. **Les den før du rører kode.** Deretter:
`docs/STATUS-NÅ.md` (hvor vi er) og `docs/MASTER-SKJERMPLAN.md` (før skjermarbeid).

**Design:** Claude Paper 1:1 (`designsystem/paper/fase1/`) — se `.claude/rules/beslutninger.md`.  
**Sperre-lås (P0/KOMMER, `/traad`, tokens):** [`docs/port/sperre-og-beslutninger.md`](docs/port/sperre-og-beslutninger.md).  
**Port-plan:** [`docs/port/plan-designport-alle-skjermer.md`](docs/port/plan-designport-alle-skjermer.md).

**Ikke stol på** `docs/arkiv/` (historikk). Ved tvil vinner `AGENT-BRIEF.md`.

## Kjør lokalt

```bash
npm run dev                # http://localhost:3000
```

Verifikasjon før commit: `npm run verify && npm test`
