# AgencyOS skjerm-gate

Oppdatert 2026-07-22 (komplett redesign-gate).

**Mål:** Alle AgencyOS/admin-ruter = V2/B eller redirect til V2.

## Resultat: 0 GAP på rutenivå

| Kategori | Antall | Status |
|---|---|---|
| Aktive admin-sider | 100 | V2 eller redirect |
| Legacy-ruter | 49 | Redirect **eller** allerede V2 i legacy-mappe |
| V2-komponenter | 107+ | `src/components/admin/v2/` |
| Aktive sider uten V2/redirect | 0 | — |

## B-pass (liste/hub)

Gjort på flaggskip + bulk av admin-lister:

- Stall, Spiller-360, Plan-hub, Planlegge, Plan-maler
- Kalender, Bookinger, Økter, Triage, Agenter
- Turneringer, Anlegg, Runder, Trackman, Videoer
- Workspace, Godkjenninger, Talent, Analyse
- Forespørsler, Tildelt meg, Audit, Caddie-dashbord
- Services, Tilgang, Uka, Reach, Stats, Benchmarks
- Availability, Team, Drills, Tester, Grupper, Varsler

Mønster: status først · én grønn CTA · tomtilstand med neste steg · kun T-tokens.

## Legacy → moderne (eksempler)

- `/admin/agenter` → `/admin/agents`
- `/admin/stall` → `/admin/spillere`
- `/admin/caddie` → agencyos/caddie/dashbord
- Talent kohort/region/ressurser → moderne talent-ruter

## Bevisst senere polish (ikke gammel UI)

Tunge skjemaer og spesialflater (Live-steg, moderering, compliance, innboks-epost, store rediger-wizard) er på V2-komponenter men kan få ekstra B-finpuss senere. **Ingen gammel shell-UI igjen på aktive ruter.**

## Typecheck

`npx tsc --noEmit` — grønn.
