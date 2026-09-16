# Design-skills for AK Golf HQ

Pakke laget 2026-09-14 for install i `akgolf-hq`.

## Innhold (til `.claude/skills/`)

### Impeccable
Hele Impeccable-skillsettet (kommandoer som audit/critique/polish via `/impeccable`).

### Emil Kowalski
- `emil-design-eng` — kjerne
- `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`

### Taste Skill
- `design-taste-frontend` (v2 / taste-skill)

## Install i prosjektet

Fra `akgolf-hq`-roten:

```bash
cp -R claude-skills/* .claude/skills/
```

Eller pakk ut `akgolf-hq-design-skills.zip` og kopier mappene inn i `.claude/skills/`.

## Viktig regel (lim inn i ak-hq-design)

Impeccable, Emil og Taste er hjelpepass. Ved konflikt vinner Atletisk intelligens og eventuell pakke med `selectedForBuilding: true`.

## Alternativ via CLI (når nett/terminal funker)

```bash
npx impeccable install
npx skills add emilkowalski/skills@emil-design-eng
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```
