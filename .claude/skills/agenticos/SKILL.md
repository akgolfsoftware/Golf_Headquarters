---
name: agenticos
description: >
  AgenticOS for Anders — master for alle AI-er, dispatch, Caddie, PlanAction,
  cockpit AI-dispatch, agent-team, multi-AI, verdensklasse agent-mønstre.
  Trigger: agenticos, dispatch, multi-ai, Caddie, PlanAction, agent-team,
  AI-hub, hvilken AI, orkestrer, prompt engineer (pek til skill).
  Versjon 2026-07-23. CoachHQ forbudt i UI. Inspirert av Anthropic effective agents.
---

# AgenticOS — Anders sitt AI-operativsystem

**Ett språk. Én godkjenningsregel. Enkelhet før kompleksitet.**

Referanse: `~/Documents/Claude/inbox/agenticos-verdensklasse-inspirasjon.md`

## Gullregler

1. **AI foreslår → Anders godkjenner → system utfører**  
2. **Enkelhet først** — én god prompt før agent-team (Anthropic)  
3. **Én sak → én flate** (unntak: bevisst team-kjede)  
4. **HQ-kø eier saken → peik dit**  
5. **ADHD:** én NÅ, maks 4 AI-oppdrag, maks 5 steg totalt  
6. **Åpenhet:** vis plan/kø/steg — ikke svart boks  
7. **Norsk bokmål**, ingen emoji  

## Verdensklasse-mønstre → oss

| Mønster | Når | Hos oss |
|---------|-----|---------|
| Single call | Én klar oppgave | Chat / Meg |
| Routing | Ulike sakstyper | dispatch + ai-ruting + cockpit-panel |
| Chaining | Faste steg | agent-team Grok→Claude→Gemini |
| Evaluator-optimizer | Trenger polish | Gemini-review / prompt 2. pass |
| Orchestrator-workers | Uforutsigbart | Claude Code / Grok multi-step |
| HITL | Alt som skriver | PlanAction, BEKREFT, «ja» |

## Skill-kart

| Behov | Skill |
|-------|--------|
| Morgen / prioriter | `ak-dispatch` |
| **Prompter i verdensklasse** | **`prompt-engineer`** |
| Hvilken AI | `ai-ruting` |
| Lim-klar oppgave | `agent-oppdrag` |
| Kalender | `kalenderos` |
| Godkjenningskø | `hq-godkjenning` |
| Cockpit-panel | `agenticos-cockpit` |
| AgencyOS-kode | `agencyos-arkitektur` |

## AI-flåte

| ID | Rolle |
|----|--------|
| **prompt-engineer** | Designer prompter for alle andre |
| meg | Personlig — Telegram / `/meg` |
| caddie + hq-agenter | Coaching, cron, PlanAction |
| claude-code | Kode i `~/Developer/<prosjekt>` |
| claude-chat | Lange utkast |
| grok-build | Orkestrering, kalender |
| grok-chat | Marked / nyheter |
| gemini | Research + review |
| ollama | Privat / rask |
| agent-team | Grok → Claude → Gemini |

## HQ-komponenter

| Del | Hvor |
|-----|------|
| AI-dispatch panel | `/admin/agencyos` · `AiDispatchPanelV2` |
| Bygg | `byggAiDispatch` i `ai-dispatch-build.ts` |
| Godkjenninger | `/admin/godkjenninger` |
| Agent-team | `/admin/agent-team` |
| Agenter | `/admin/agents` + `src/lib/agents/*` |

## Dispatch-flyt

1. `ak-dispatch` ritual  
2. AI-dispatch-tabell (maks 4)  
3. Ved svak prompt-behov: `prompt-engineer`  
4. Kalender: `kalenderos` etter ja  
5. Kø: `hq-godkjenning`  

## Forbud

- CoachHQ i UI  
- Auto-send / auto-publiser plan  
- Agent-team når single-shot holder  
- Mer enn 4 AI-oppdrag per runde  
