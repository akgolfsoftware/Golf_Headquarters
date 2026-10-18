# Claude — AK Golf HQ

Felles prosjektinstruks er [AGENTS.md](AGENTS.md). Les deretter [Agent Brief](docs/platform/AGENT-BRIEF.md) før du endrer filer.

Denne filen har ingen egen designkanon, arbeidsplan eller ferdigstatus. Alle verktøy bruker de samme kildene:

- [Start her](START-HER.md) — hvor arbeidet begynner.
- [Gjeldende designautoritet](docs/design-system/design-autoritet.md) — «AK Golf Precision Athletics» gjelder; «App design», Train-lock og Paper er utgående og spørres ikke om på nytt.
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

## Push og merge
- Når en oppgave er ferdig: commit, push branchen og lag PR uten å spørre.
- Etter push: gi Anders Vercel preview-lenken og skjermbilder på 390 px og desktop av alle skjermer som er endret.
- **Alt som er klart legges inn i main automatisk** (Anders 17.10.2026): slå på auto-merge (squash) på PR-en når den er laget. Klart betyr at `npm run verify` er grønn lokalt og alle sjekker i CI er grønne. Rødt legges aldri inn. Anders trenger ikke skrive «merge».
- Unntakene i AGENTS.md §Stående forhåndsgodkjenning gjelder fortsatt: ingen ekte betaling, e-post til ekte personer, sletting av produksjonsdata, brytende skjemaendring, domeneflytting eller hemmeligheter uten ny beskjed fra Anders.
- Push aldri direkte til main.

## Nattkjøring 16.–17.10.2026 (Anders 16.10 kl. 22:45, gjelder til Anders opphever den)

Anders: «Du må legge inn i prosjektregler at du kan gjøre alt og godkjenne uten min tillatelse for å
gjøre prosjektet komplett i natt.» Planen er [nattkjøringen](docs/planer/nattkjoring-komplett-design-2026-10-16.md).

Mens denne regelen gjelder:
- **Claude gjør port 7 på Anders' vegne.** En skjerm bygget etter et utkast i `docs/design-system/utkast-*/`
  regnes som godkjent når den er målt i 390 og 1280 px uten sidelengs rulling og uten konsollfeil.
- **Claude legger inn i main uten «merge»**, når `npm run verify` og CI er grønn. Rødt legges aldri inn.
- **Claude avgjør åpne spørsmål** med anbefalingen som alt står i utkastet eller i beslutningsloggen,
  og fører hvert valg i planens §6 «Avgjort i natt», så Anders kan omgjøre om morgenen.
- **Grensen «maks 3 økter samtidig»** i den globale instruksen er opphevet for natten.
- **Står fortsatt:** unntakene i AGENTS.md §Stående forhåndsgodkjenning. Ingen ekte betaling, ingen e-post
  eller invitasjon til ekte personer, ingen sletting eller omskriving av produksjonsdata, ingen brytende
  skjemaendring, ingen domeneflytting av akgolf.no, ingen hemmeligheter i kode eller logg, ingen `--no-verify`.
- Når Anders opphever regelen, gjelder «Push og merge» over fullt ut igjen, og denne seksjonen flyttes til
  `docs/arkiv/`.
