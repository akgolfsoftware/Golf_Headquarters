# Design-resources for AK Golf HQ

Klonet fra 3 åpne repoer for å gi rask referanse til ulike design-systemer og stiler.

## Innhold

### `../../.claude/skills/design-vendor/` (68 skills)
**Aktiverbare via Claude Code's Skill-tool.**
Hver mappe har `SKILL.md` (AI-instruks) + `DESIGN.md` (human-readable rationale).

Eksempler på inkluderte stiler:
- **dashboard** — for analytiske skjermer (relevant for `/admin/analytics`, `/admin/analyse`)
- **clean** — minimalistisk
- **bento** — kort-grid-layout (relevant for `/portal`)
- **brutalism**, **claymorphism**, **cosmic**, **dithered** — eksperimentelle
- **claude**, **codex**, **agentic** — AI-app-stilers
- **corporate**, **contemporary**, **creative**, **doodle**, og 50+ til

**Slik bruker du dem:**
```
"Bruk dashboard-design-skill og redesign /admin/analytics"
```
Jeg loader skill-en automatisk fra `.claude/skills/design-vendor/dashboard/SKILL.md`.

Kilde: https://github.com/VoltAgent/awesome-design-skills

---

### `./brand-references/` (71 DESIGN.md-filer)
Brand-DNA fra kjente selskap, til inspirasjon når du ber Claude Design om å lage UI i en bestemt stil.

Eksempler:
- `apple/DESIGN.md` — Apple-aktig
- `linear/DESIGN.md` — Linear-aktig (relevant for CoachHQ?)
- `stripe/DESIGN.md` — Stripe-aktig
- `airbnb`, `airtable`, `bmw`, `bugatti`, `cal`, `claude`, `notion`, `vercel`, og 60+ til

**Slik bruker du dem:**
1. Åpne f.eks. `brand-references/linear/DESIGN.md`
2. Lim inn innholdet i en Claude Design-prompt som "stil-DNA"
3. Be Claude Design bygge AK Golf HQ-skjerm i den stilen

Kilde: https://github.com/VoltAgent/awesome-design-md

---

### `./claude-design-starters/`
Ferdige `DESIGN.md`-filer som Claude Design ekspanderer til hele UI-scaffolds med ett trykk.

Kilde: https://github.com/VoltAgent/awesome-claude-design

---

## Anbefalt arbeidsflyt for AK Golf HQ-redesign

1. **Velg stil-DNA** fra `brand-references/` (f.eks. Linear for CoachHQ, Cal.com for booking, Apple for marketing)
2. **Bruk relevant skill** fra `.claude/skills/design-vendor/` (f.eks. `dashboard` for analytics)
3. **Iterér med Claude Design** — eksisterende prompter ligger i `../design-prompts/`

## Total disk-bruk
- Skills: 560 KB
- Design-resources: 2.4 MB
- **Total: ~3 MB**

Alle filene er committet til git.
