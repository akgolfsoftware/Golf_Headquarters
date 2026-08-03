# START HER — AK Golf HQ

Én plattform, fire produkter (Marketing · Booking · **PlayerHQ** `/portal` · **AgencyOS** `/admin`).

**Én inngang:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md) — full kontekst
(stack, prosjektkart, sannhets-hierarki) på 5 min. **Les den før du rører kode.** Deretter:
`docs/STATUS-NÅ.md` (hvor vi er) og `docs/MASTER-SKJERMPLAN.md` (før skjermarbeid).

Design: se `.claude/rules/beslutninger.md` §Tema/design — appen følger v2-tokens + C smalt;
Claude Paper er designfasit i Open Design; full port etter pilot.

**Ikke stol på** `docs/arkiv/` (historikk). Ved tvil vinner `AGENT-BRIEF.md`.

## Kjør lokalt

```bash
npm run dev                # http://localhost:3000
```

Verifikasjon før commit: `npm run verify && npm test`
