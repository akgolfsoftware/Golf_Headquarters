# Treningsplanlegger — prosjekthjem

> Opprettet 2026-07-07. Dette er «hjemmet» for treningsplanlegger-arbeidet: sportslig plan
> og offisiell treningsplanlegger for **WANG Toppidrett** og **GFGK Junior**.
> Selve koden lever i akgolf-hq (Workbench, admin/grupper, portal/tren, team-gfgk).
> Denne mappa holder spec, beslutninger og sync-regler — ikke kode.

## Kjernen i én setning
Du planlegger alt **ett sted** — AgencyOS i AK Golf HQ. Endringer på gruppenivå (uke, økt, måned)
sendes automatisk ut til (1) hver spillers personlige plan og (2) de åpne gruppe-sidene.
Ingen dobbeltføring, ingen «to sannheter».

## Struktur
- [`spec-design.md`](spec-design.md) — designbeslutninger og scope (les denne først)
- [`wang-toppidrett/`](wang-toppidrett/) — WANG-spesifikke notater (grupper, tider, mapping)
- [`gfgk-junior/`](gfgk-junior/) — GFGK-spesifikke notater (grupper, gfgkjunior.no-kobling)

## Relaterte kilder i akgolf-hq
- `docs/audit-treningsplanlegger-2026-07-05.md` — fersk gjennomgang av Workbench/driller/tester
- `docs/MASTER-SKJERMPLAN.md` — autoritativ skjermliste (oppdater hakene når skjermer bygges)
- `.claude/rules/arkitektur.md` — produkter og mappestruktur
