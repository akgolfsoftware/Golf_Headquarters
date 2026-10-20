# AK Golf HQ — skill-prioritet

Impeccable, Emil Kowalski (`emil-design-eng`) og Taste (`design-taste-frontend`) ligger i `~/.claude/skills/` og er hjelpepass for håndverk, ikke designfasit. Prosjektet har ingen egne kopier av dem.

`shadcn/` er den offisielle shadcn/ui-skillen, kopiert uendret fra [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn) (commit `ba1503c`, 20.10.2026). Den er et hjelpepass for komponentene i `src/components/ui/`, ikke designfasit. Prosjektet har ingen `components.json`, så CLI-kommandoene i skillen (`npx shadcn@latest …`) virker ikke før det er satt opp. Oppdateres ved å kopiere mappen på nytt.

`frontend-design/` er Anthropics frontend-design-skill, kopiert uendret fra [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (commit `41bbe19`, 20.10.2026). Den ber om et eget, særpreget uttrykk per oppdrag. I AK Golf HQ er uttrykket allerede bestemt, så den brukes bare til håndverket (typografi, skrift i grensesnittet, selvkritikk), aldri til å velge ny farge, skrift eller layout.

Ved konflikt vinner:
1. [Gjeldende designautoritet](../../docs/design-system/design-autoritet.md) — «AK Golf Precision Athletics» (`7d7c2994`) — og `ak-hq-design`
2. Siste beslutning i [beslutninger.md](../rules/beslutninger.md)
3. Deretter polish-skillsene
