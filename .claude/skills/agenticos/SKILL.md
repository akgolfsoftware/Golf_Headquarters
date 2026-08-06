---
name: agenticos
description: >
  AgenticOS for Anders — master for alle AI-er, dispatch, Caddie, PlanAction,
  cockpit AI-dispatch, agent-team, multi-AI, verdensklasse agent-mønstre.
  Trigger: agenticos, dispatch, multi-ai, Caddie, PlanAction, agent-team,
  AI-hub, hvilken AI, orkestrer, prompt engineer (pek til skill), worktree,
  checkpoint, hvor jobbes hva, veileder-rolle, Claude Code-arbeidsdisiplin.
  Versjon 2026-08-06 (la til §Claude Code — arbeidsdisiplin). CoachHQ forbudt
  i UI. Inspirert av Anthropic effective agents.
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

## HQ-komponenter (inntil AgencyOS coach — LÅST)

**AgenticOS lever inne i AgencyOS coach-flaten.** Ikke egen app. Ikke bare under Mer.

| Del | Hvor coach ser det |
|-----|-------------------|
| AI-dispatch panel | **Hjem** `/admin/agencyos` · `AiDispatchPanelV2` · eyebrow «AgenticOS · AI-dispatch» |
| Godkjenningskø | **Kø** `/admin/godkjenninger` · merket «AgenticOS · Kø · AgencyOS» |
| Mer-gruppe | Første gruppe i Mer-skuffen: **AgenticOS** (Kø, Caddie, agenter, agent-team, brief) |
| Bygg | `byggAiDispatch` i `ai-dispatch-build.ts` |
| Agent-team | `/admin/agent-team` |
| Agenter | `/admin/agents` + `src/lib/agents/*` |
| Caddie | `/admin/agencyos/caddie` |

Ved all AgencyOS-arbeid: behold AgenticOS synlig på Hjem + Kø.

## Dispatch-flyt

1. `ak-dispatch` ritual  
2. AI-dispatch-tabell (maks 4)  
3. Ved svak prompt-behov: `prompt-engineer`  
4. Kalender: `kalenderos` etter ja  
5. Kø: `hq-godkjenning`  

## Claude Code — arbeidsdisiplin (claude-code-raden i AI-flåten, utdypet)

Claude Code er én rad i AI-flåten over, men den eneste som rører kode og git —
den trenger egne driftsregler de andre AI-ene ikke gjør. Nytt 2026-08-06, ikke
en duplikat av eksisterende kilder: hver linje peker til kilden i stedet for å
kopiere tall/regler som allerede finnes der.

1. **Én økt = én worktree.** Hovedmappa (`~/Developer/<prosjekt>`) er kun for
   én-økt-arbeid. Åpnes økt nummer to: `git worktree add` først, alltid. Maks
   3 samtidige økter.
2. **Checkpoint-commit** minst hvert 30. minutt i aktivt arbeid, og FØR hvert
   risikabelt steg (grenbytte, migrasjon, større refaktorering) — Claude
   committer lokalt selv, uten å spørre. En økt som avsluttes med ucommittet
   arbeid er en feilet økt. Selve branch→commit→push→PR-flyten og push-timingen
   («committ ofte, push samlet») eies av `CLAUDE.md` §Arbeidsregler — ikke
   duplisert her.
3. **Modell + effort for selve kodejobben** følger samme ruting som når en
   prompt designes for den — se `prompt-engineer` §«Claude-flåten i detalj»
   (Sonnet 5 / Opus 5 / Fable 5 + effort-nivåer). Ikke to tabeller med samme
   informasjon; denne skillen refererer, `prompt-engineer` eier tallene.
4. **Hvor jobbes hva:**

   | Sted | Brukes til |
   |------|------------|
   | Cloud-økt | Repo-only: docs/rename/tester, isolert API-logikk uten UI-verifisering |
   | Lokal maskin (dev-server, DB-tilkobling) | Alt som trenger visuell verifisering, migrasjoner, UI-bygging |
   | Telefon | Styring/godkjenning — aldri primær arbeidsflate |

5. **Veileder-rolle:** Anders forklarer HVA (intensjon, hverdagsspråk); Claude
   eier HVORDAN. Åpne produktspørsmål er fullverdige arbeidsordrer — undersøk
   faktisk tilstand først, kom med anbefaling og plan, ikke be om tekniske
   presiseringer Anders ikke har forutsetning for å gi. Skap aldri en
   rot-mulighet: farlige operasjoner utfører Claude selv med verifisering; et
   nødvendig manuelt steg er ÉN trygg kopier-lim-blokk. Ser Claude et
   suboptimalt valg (modell, sted, kostnad): si fra og foreslå riktig vei.
6. **Feillogg:** samme retro-prinsipp som resten av AgenticOS-flåten — se
   `CLAUDE.md` §Feillogg og `docs/feillogg.md` i det aktuelle prosjektet.

## Forbud

- CoachHQ i UI  
- Auto-send / auto-publiser plan  
- Agent-team når single-shot holder  
- Mer enn 4 AI-oppdrag per runde  
