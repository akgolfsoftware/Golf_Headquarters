# Claude — AK Golf HQ

Felles prosjektinstruks er [AGENTS.md](AGENTS.md). Les deretter [Agent Brief](docs/platform/AGENT-BRIEF.md) før du endrer filer.

Denne filen har ingen egen designkanon, arbeidsplan eller ferdigstatus. Alle verktøy bruker de samme kildene:

- [Start her](START-HER.md) — hvor arbeidet begynner.
- [Gjeldende designautoritet](docs/design-system/design-autoritet.md) — AK Golf Design System og «App design» gjelder; Train-lock og Paper er utgående og spørres ikke om på nytt.
- [Designarbeid og referanser](designsystem/README.md) — status, leveranser og historiske kilder.
- [Status nå · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/b700ce0089a8bf48f6b269c9682af2373e696287/docs/STATUS-N%C3%85.md) og [arbeidsliste · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/a235444b0f7287b0ce7270c28b32d34517711a2f/docs/MASTERPLAN-GJENSTAAENDE.md).
- [Beslutninger](.claude/rules/beslutninger.md) og [tekniske fallgruver](.claude/rules/gotchas.md).

## Skjermarbeid

Følg AGENTS.md §Skjermarbeid. En skjerm er ikke ferdig før Anders har sett den mot den valgte designversjonen.

## Kommandoer

`npm run dev` · `npm run verify` · `npm test` · `npm run prosjekt:sjekk`.
Kommandoenes innhold eies av [package.json](package.json).

## Git-arbeidsflyt

Følg AGENTS.md §Git-arbeidsflyt. Bestilt lokalt arbeid gir ikke i seg selv tillatelse til publisering.
