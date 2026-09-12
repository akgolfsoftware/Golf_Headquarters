# AK HQ Design — start arbeidet her

**Opprettet 10.09.2026 og oppdatert 11.09.2026.** Én prosjektspesifikk arbeidsmåte for hele appens design. Anders starter blankt i Claude Design og lager Design System v0.1 med retningen [Atletisk intelligens](../../.claude/skills/ak-hq-design/references/atletisk-intelligens.md). Eksisterende visuelle valg er arbeidsunderlag, ikke fasit. Målet om komplett app før åpen lansering med booking og betaling står ved lag.

## Bruk i prosjektet

[SKILL.md](../../.claude/skills/ak-hq-design/SKILL.md) er den felles inngangen. Claude leser `.claude/skills/ak-hq-design`; Codex finner samme innhold gjennom `.agents/skills`. Andre verktøy følger henvisningen i AGENTS.md. Ny skill kan kreve ny sesjon eller oppdatert skill-liste før navnet vises i verktøyets meny.

Skillen støtter full plattformdesign, en enkelt brukerreise, komponentarbeid og vurdering. Små oppgaver skal ikke utløse full redesign. Ingen globale skills eller eksisterende designleveranser er erstattet.

## Bruk i Claude Design

Last inn ferdighetspakken, Anders' visuelle smaksreferanser og [hovedprompten](../../.claude/skills/ak-hq-design/assets/hovedprompt.md). Den er skrevet for hele appen med gjennomførbare etapper og ber Claude skape både Design System v0.1 og representative skjermer. Dersom Claude Design ikke har en egen skill-funksjon, fungerer innholdet som vedlagte prosjektinstrukser og referanser. Pakken er ikke installert inne i Claude Design av denne oppgaven.

Kort inngang når pakken er lagt ved:

```text
Bruk den vedlagte AK HQ Design-pakken og Anders' smaksreferanser. Les SKILL.md, references/atletisk-intelligens.md og kjør oppgaven i assets/hovedprompt.md. Start blankt og skap AK Golf HQ Design System v0.1 sammen med pilotskjermene. Eksisterende design er bare funksjonelt og teknisk arbeidsunderlag. Dokumenter skjermdekning, tilstander og formater.
```

## Dette følger med

| Innhold | Kilde |
|---|---|
| Full bestilling til Claude Design | [Hovedprompt](../../.claude/skills/ak-hq-design/assets/hovedprompt.md) |
| Aktiv smaksretning og systemprinsipper | [Atletisk intelligens](../../.claude/skills/ak-hq-design/references/atletisk-intelligens.md) |
| Produkt, brukerroller og foreslått designretning | [Produkt og retning](../../.claude/skills/ak-hq-design/references/produkt-og-retning.md) |
| 40 komponentfamilier og kontrakt for varianter/tilstander | [Komponenter](../../.claude/skills/ak-hq-design/references/komponenter.md) |
| 17 brukerreiser og wireframe-metode | [Flyter og wireframes](../../.claude/skills/ak-hq-design/references/flyter-og-wireframes.md) |
| Hele appens flater og regler for dekning | [Skjermomfang](../../.claude/skills/ak-hq-design/references/skjermomfang.md) |
| Mobil, nettbrett, desktop, temaer og tilgjengelighet | [Formater og kvalitet](../../.claude/skills/ak-hq-design/references/formater-og-kvalitet.md) |
| Versjonering, prototyper, kontroll og overlevering | [Overlevering](../../.claude/skills/ak-hq-design/references/overlevering.md) |
| Faktiske sidefiler og komponentfiler | [JSON-inventar](../../.claude/skills/ak-hq-design/assets/ruteinventar.json), [CSV](../../.claude/skills/ak-hq-design/assets/ruteinventar.csv) |
| Mal for manuelt designregister | [Skjermkontrakt](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml) |

Inventaret omfatter ved kontroll 11.09.2026 480 sidefiler, 703 komponentfiler og 230 layout-/tilstandsfiler. Det beviser ikke at hver side trenger et unikt design eller at funksjonen virker. Overlegg, betaling hos leverandør og andre mellomtilstander må kartlegges i tillegg. Genererte filer brukes som observasjoner; manuelle valg legges i leveransens eget register.

## Vedlikehold

Rediger bare den felles skill-mappen. Fra prosjektroten oppdateres kodeinventaret med:

```sh
node .claude/skills/ak-hq-design/scripts/kartlegg-skjermer.mjs --write
node .claude/skills/ak-hq-design/scripts/kartlegg-skjermer.mjs --check
npm run prosjekt:register
npm run prosjekt:sjekk
```

Dette kjører ingen app, database eller integrasjon. Inventarskriptet overskriver bare sine to genererte filer, aldri manuelle designvalg. Pakkens testfil kan kjøres med `node --test .claude/skills/ak-hq-design/scripts/kartlegg-skjermer.test.mjs`.

Videre designstatus og rekkefølge føres i [arbeidslisten](../MASTERPLAN-GJENSTAAENDE.md). En ferdig regelpakke er ikke ferdig UI; faktisk wireframing, tegning, prototyping og brukervurdering gjenstår.
