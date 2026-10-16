---
name: playerhq-agents
description: Arbeid med PlayerHQs signaler, domeneregler, agenter og forslag til treningsplaner (PlanAction). Bruk ved endring i src/lib/agents, src/lib/training/skills, plan-watcher, runde-, test-, TrackMan- og turneringsagenten, eller godkjenningskøen. Les koden før du stoler på beskrivelsen.
metadata:
  version: "2"
  reviewed: "2026-10-15"
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# Signal → Skill → Agent → Plan-handling

Flyttet fra `~/.claude/skills/` 15.10.2026, fordi alt den beskriver ligger i dette repoet. Kontroller faktisk kode før du bruker tabellene under; de beskriver hva koden gjør, ikke hva som er bestilt.

## Gjeldende regler (beslutninger.md §Treningsfag)

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk. Gjeninnfør aldri en sperre uten ny beslutning.
- AK-formel v2 gjelder: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS` med motorikk `UTEN_BALL` / `LAV_HAST` / `AUTO` og press `ALENE` / `OBSERVERT` / `KONKURRANSE` / `TURNERING`. L-faser, CS-koder, M0–M5 og PR1–PR5 er utgått; feltene som fortsatt finnes i koden (`LFase` i `progression.ts`) er arv, ikke noe å bygge videre på.
- Justeringsforslag kommer bare ved de fire utløserne i §SKJERMENE … RUNDE 8 (SG-gap, tre turneringsrunder over snitt, under 70 % eller over 130 % gjennomført to uker på rad). Aldri etter én runde. Forslag er forslag, ikke sperrer.
- AI foreslår, coach godkjenner, system utfører. Aldri stille auto-publisering av plan.

## Arkitektur-prinsipp

Fire lag med ett ansvar hver:

```
DATA-KILDER → SIGNALER → SKILLS → AGENTER → PLAN-HANDLINGER
(hendelser)   (tall)    (regler)  (beslutninger) (utkast)
```

- **Signaler**: ren matematikk. Ingen AI, ingen beslutninger.
- **Skills**: deterministiske domeneregler.
- **Agenter**: kombinerer signaler og skills. Bruker AI bare til tekst.
- **Plan-handlinger**: utkast som venter godkjenning.

## Lag 1: Signaler

Det finnes ingen egen `signals/`-mappe eller `computeSignals()`/`evaluateAgents()` i `src/lib/` (kontrollert 15.10.2026). Agentene regner det de trenger selv fra runder, tester, TrackMan-import og gjennomførte økter. Signaltypene under er vokabularet agentene bruker, ikke en implementert modul:

`SG_TOTAL` · `SG_BREAKDOWN` · `SG_AREA_DETAIL` · `TRAINING_INDEX` · `COMPLETION_RATE` · `PYRAMIDE_ADHERENCE` · `COMPOSITE_TEST` · `TEST_DELTA` · `DISPERSION_TREND` · `TRACKMAN_METRIC` · `TOURNAMENT_PROXIMITY` · `HCP_DELTA` · `INJURY_FLAG` · `STREAK`

## Lag 2: Skills (domeneregler) — `src/lib/training/skills/`

| Fil | Gjør |
|-----|------|
| `weakness.ts` | Primær svakhet fra SG-fordeling og pyramidedekning: området med mest negativ SG og lavest dekning først |
| `periodization.ts` | Uketype fra turneringer, skader og periode. Turnering trumfer alt unntatt skade; skade trumfer alt |
| `pyramid.ts` | Pyramidefordeling FYS · TEK · SLAG · SPILL · TURN (sum 100) fra kategori A–K og periodetype, vektet mot svakhet |
| `progression.ts` | Progresjon i perioden. Bruker fortsatt `LFase`-typen fra Prisma; utgått vokabular, ikke bygg nytt på den |
| `drill-selection.ts` | Velger øvelser per område, uten de siste fire øktenes øvelser, øvelser med benchmark først |
| `morad-fault.ts` | Teknisk feilkobling (MORAD, internt fagspråk, aldri i UI-tekst) |
| `types.ts`, `index.ts` | Felles typer og eksport. Tester i `skills.test.ts` |

Det finnes ingen `junior-guard.ts`; aldersbegrensninger er fjernet med beslutningen 18.08 (alder begrenser aldri plan eller mengde).

## Lag 3: Agenter — `src/lib/agents/`

| Agent | Fil | Utløser |
|-------|-----|---------|
| Plan-vakten | `plan-watcher.ts` | cron `/api/cron/plan-watcher` (`vercel.json`) |
| Runde-agenten | `round-agent.ts` | etter fullført runde |
| Turnering-agenten | `turnering-agent.ts` | cron `/api/cron/turnering-agent` |
| Test-agenten | `test-agent.ts` | etter registrert test |
| TrackMan-agenten | `trackman-agent.ts` | etter TrackMan-import |

Felles: `agent-runner.ts`, `agent-notify.ts`, `plan-action-executor.ts`, `accept-plan-action.ts`, `notify-plan-action.ts`, `plan-action-spor.ts`. Kjent hull: runde-agentene starter ikke etter `logRoundManual` eller turneringsrunder (beslutninger.md §SKJERMENE … RUNDE 8, punkt 6).

## Lag 4: Plan-handlinger

`PlanActionType` i `prisma/schema.prisma`: pyramidejustering, ny/endret/fjernet økt, forskjøvet uke, byttet periode, justert belastning, endret fokus, byttet øvelse, hviledag. Les enum-en i skjemaet før du legger til en type.

Levering: PlanAction → `/admin/godkjenninger` (coach godkjenner, endrer eller avviser) → plan oppdateres → spiller varsles. Spiller uten coach godkjenner AI-forslag selv (28.09); «Send til coach» på forslag er fjernet.

Auto-apply uten godkjenning gjelder bare: øvelsesbytte innenfor samme område (self-serve), hviledag ved aktivt skadeflagg, og belastning ned ved over 130 % gjennomført. Alt annet krever godkjenning.

## AI-laget

Caddie og verktøy: `src/lib/ai/` (egen `README.md`), `src/lib/caddie/`. Navn tas ut før tekst sendes til AI (§SKJERMENE … RUNDE 8, punkt 3). Se `agencyos-arkitektur` for hvor coachen ser køen.
