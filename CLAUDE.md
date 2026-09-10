# Claude — AK Golf HQ

Felles prosjektinstruks er [AGENTS.md](AGENTS.md). Les deretter [Agent Brief](docs/platform/AGENT-BRIEF.md) før du endrer filer.

Denne filen har ingen egen designkanon, arbeidsplan eller ferdigstatus. Alle verktøy bruker de samme kildene:

- [Start her](START-HER.md) — hvor arbeidet begynner.
- [Designarbeid og referanser](designsystem/README.md) — eksisterende design er ikke låst; alle skjermer revideres i Claude Design.
- [Status nå](docs/STATUS-NÅ.md) og [arbeidsliste](docs/MASTERPLAN-GJENSTAAENDE.md).
- [Beslutninger](.claude/rules/beslutninger.md) og [tekniske fallgruver](.claude/rules/gotchas.md).

## Skjermarbeid

Følg AGENTS.md §Skjermarbeid. En skjerm er ikke ferdig før Anders har sett den mot den valgte designversjonen.

## Kommandoer

`npm run dev` · `npm run verify` · `npm test` · `npm run prosjekt:sjekk`.
Kommandoenes innhold eies av [package.json](package.json).

## Git-arbeidsflyt

Følg AGENTS.md §Git-arbeidsflyt. Bestilt lokalt arbeid gir ikke i seg selv tillatelse til publisering.
