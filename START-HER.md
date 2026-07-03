# START HER — AK Golf HQ

Én plattform, fire produkter (Marketing · Booking · **PlayerHQ** `/portal` · **AgencyOS** `/admin`).

## Les dette først (i rekkefølge)
1. **[`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md)** — full kontekst på 5 min. **KANON.** Les før du rører kode.
2. **[`docs/STATUS-NÅ.md`](docs/STATUS-NÅ.md)** — hvor vi er akkurat nå (ferdig / i arbeid / blokkert).
3. **[`docs/MASTER-SKJERMPLAN.md`](docs/MASTER-SKJERMPLAN.md)** — skjermstatus. Les før du bygger/endrer en skjerm.

## Sannhets-hierarki (hvor bor svaret)
| Spørsmål | Fasit |
|---|---|
| Hva er låst (navn, tema, abonnement, demo-navn)? | `docs/platform/BUSINESS-RULES.md` |
| Hva er uavklart / ikke bestemt? | `docs/AAPNE-SPORSMAAL.md` |
| Produkt- og dataspec | `docs/platform/PLATFORM-PRD.md` + `DATA-MODEL.md` |
| Designregler + porting | Ingen låst kilde/gate akkurat nå — design under aktiv utvikling, se `CLAUDE.md` |
| Arbeidsregler / stack / gotchas | `CLAUDE.md` + `AGENT-BRIEF.md` |

**Ikke stol på:** `docs/_arkiv/` (historikk, kan være utdatert) eller `wireframe/` (arkiv). Ved tvil — `AGENT-BRIEF.md` vinner.

## Kjør lokalt
```bash
npm run dev                # http://localhost:3000
```
Verifikasjon før commit: `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`
