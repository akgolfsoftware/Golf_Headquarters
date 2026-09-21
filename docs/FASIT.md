# Fasit — AK Golf HQ

Rekkefølge når kilder krangler. Øverst vinner.

1. Designautoritet — `docs/design-system/design-autoritet.md`
2. Ordbok og språk — `docs/ordbok.md` (eneste master)
3. Treningsplanlegging — `docs/treningsplanlegging.md`
4. Chrome-lov — denne filen
5. Gjeldende skjermleveranse fra Claude Design
6. ds-core / `src/components`

AK Golf Design System og «App design» gjelder. Train-lock og Paper er utgående og kan ikke
overstyre denne filen gjennom eldre dokumenter, minne eller kode. Denne beslutningen skal ikke
spørres om på nytt.

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

## Historikk og gjeldende bestilling

Eldre tegninger, planer og rapporter er historiske referanser, ikke en ny
arbeidsordre. Anders' bestilling 20.09 krever at historikken bevares.
Den kontrollerte Workbench-pakken og aktive arbeidsrekkefølgen nås fra
[overleveringen](workbench-handover.md). Nye daterte planer og målinger følger
mappeplasseringen i AGENTS.md. Denne filen gir ingen slettetillatelse.
