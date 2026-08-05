# START HER — AK Golf HQ

Én plattform, fire produkter (Marketing · Booking · **PlayerHQ** `/portal` · **AgencyOS** `/admin`).

**Én inngang:** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md) — full kontekst
(stack, prosjektkart, sannhets-hierarki) på 5 min. **Les den før du rører kode.** Deretter:
`docs/STATUS-NÅ.md` (hvor vi er) og — før skjermarbeid — `docs/port/fasit-liste-paper.md`
(designdekning) + `docs/port/plan-designport-alle-skjermer.md` (plan og ferdig-definisjon).

Design: Claude Paper (Claude Design-prosjekt `605a48cc`, skjermer i `fase1/`) er designfasit.
Full port til `src/` kjører nå — se `docs/port/plan-designport-alle-skjermer.md` og
`.claude/rules/beslutninger.md` §Tema/design.

`docs/arkiv/` er slettet 05.08.2026 (lå kun historikk der — den lever i git). Ved tvil vinner `AGENT-BRIEF.md`.

## Kjør lokalt

```bash
npm run dev                # http://localhost:3000
```

Verifikasjon før commit: `npm run verify && npm test`
