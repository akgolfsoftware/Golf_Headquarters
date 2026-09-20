# Fasit — AK Golf HQ

Rekkefølge når kilder krangler. Øverst vinner.

1. Ordbok — `docs/ordbok-master-trening.md` + `docs/ordbok-ak-golf-konsept.md`
2. Chrome-lov — denne filen
3. Workbench-master fra Claude Design (én fil, åtte pills)
4. ds-core / `src/components`

PNG er bevis, ikke lov.

## Chrome

- Topp 56 px. Seks nav: Hjem · Innboks · Kalender · Stall · Workbench · Godkjenninger
- Ingen søk i Agency-baren
- Inspector 340 ±8
- Kildepanel 236 kun i Workbench (år/periode/måned/uke + økt-bank + stall)
- Radius 2. Treff 44. Rust `#9B2415` bare Publiser / Godkjenn / START ØKT
- Logo: `logo-ak-golf-hq.svg` 30 px. Live: `logo-ak-golf-hq-negative.svg` på `[data-surface=live]` for hele rammen

## Workbench-pills

År · Periode · Måned · Uke · Økt · Stall · Live · Min kalender

Alle bytter kropp i én fil. Ingen WB-08/09/10-søsken.
Min kalender skjuler utkast, også på 390.

## Formel (åtte felt + ?)

Pyramide · Område · Motorikk · Belastning · Press · Hensikt · Måte · Målsetning

Belastning = miljø (innendørs → treningsområde → bane → konkurranse), ikke kg.
Hensikt bare FYS: øke styrke · vedlikehold · restitusjon.

Forbudt på skjerm: session, drill, range, tee, approach, elev, atlet, deload, build, Ferdighet, L-fase.

## Port

Claude Design → én HTML-master → React i `src/` → preview i appen.
Godkjenning skjer i appen, ikke i en zip.

## Utgått (skal vekk fra repo)

`designsystem/` · `.design-sync/previews` · `docs/arkiv` · `docs/design-audit` · `docs/natt` · `docs/planer` · `scripts/arkiv` · `public/kino`
