# AK HQ Design — start her

Oppdatert 30.09.2026. Viderefør **AK Golf Precision Athletics**. **Training Motor → Precision Athletics** er funksjonsoverføringen Anders har bestilt. Utgående materiale arkiveres i både designprosjekt og repo. Bevar nyere skjermrettinger og fungerende appfunksjoner.

| Neste behov | Inngang |
|---|---|
| Hva gjelder visuelt? | [Designautoritet](design-autoritet.md) og [aktive kilder](../../designsystem/README.md) |
| Hvordan arbeider vi? | [AK HQ Design v7](../../.claude/skills/ak-hq-design/SKILL.md) |
| Hva viste kildeanalysen? | [Precision mot Training Motor og kode](../design-audit/precision-training-motor-2026-09-30.md) |
| Hva skal tegnes/flyttes i Claude Design? | [Konkret konsolideringsbestilling](claude-design-konsolidering-2026-09-30.md) |
| Hvordan godkjenner Anders skjermene? | [Skjermkontrakt](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml), koblet til nøyaktig eksport |
| Hva skal Codex og Grok Build kunne lese? | [Overlevering](grok-build-overlevering.md) og [hovedprompt](../../.claude/skills/ak-hq-design/assets/hovedprompt.md) |
| Hvilke ruter finnes? | [Generert kodeinventar](../../.claude/skills/ak-hq-design/assets/ruteinventar.json) |

Kodeinventaret beviser filer og ruter, ikke at funksjonene virker eller at alle skjermene er tegnet. Designprosjektets meny er heller ikke dokumentasjon på full kodedekning. Koble ruter, overlegg og funksjoner til konkrete skjermversjoner; registrer uavklarte rader.

Anders godkjenner de konkrete skjermene før ferdig bygging. Deretter sammenlignes fungerende app med valgt referanse. Allerede avklart designarbeid fortsetter uten gjentatte spørsmål om systemvalget.

## Vedlikehold

Rediger den felles skillen i `.claude/skills/ak-hq-design/`; `.agents/skills` peker dit. Etter kodeendringer:

```sh
node .claude/skills/ak-hq-design/scripts/kartlegg-skjermer.mjs --write
node .claude/skills/ak-hq-design/scripts/kartlegg-skjermer.mjs --check
npm run prosjekt:sjekk
```

Arbeidsrekkefølge kommer fra gjeldende bestilling og [.claude/rules/beslutninger.md](../../.claude/rules/beslutninger.md). Den fjernede masterarbeidslisten er ikke en aktiv kilde. [Tidligere innganger](../arkiv/designkonsolidering-2026-09-30/README.md) bevares kun som historikk.
