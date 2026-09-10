---
name: agenticos-cockpit
description: >
  AI-dispatch-panelet på AgencyOS-cockpit (/admin/agencyos). Bruk ved endring av
  AI-dispatch, cockpit AI-kø, «én ting NÅ», AgenticOS-panel, AiDispatchPanelV2,
  loadAiDispatch, byggAiDispatch. Versjon 2026-07-23.
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# AgenticOS cockpit — AI-dispatch

## Formål

På hjemskjermen (`/admin/agencyos`) se **hva som haster** og **hvilken AI-flate** som eier det — uten å lete i tre menyer.

## Filer (kanon)

| Fil | Ansvar |
|-----|--------|
| `src/lib/agencyos/ai-dispatch-build.ts` | `byggAiDispatch` (ren, testbar) |
| `src/lib/agencyos/ai-dispatch-data.ts` | `loadAiDispatch` (Prisma) |
| `src/components/admin/v2/AiDispatchPanelV2.tsx` | UI (v2 Kort/Rad/CTAPill) |
| `src/app/admin/agencyos/page.tsx` | Loader → props til CockpitV2 |
| `src/components/admin/v2/CockpitV2.tsx` | Plasserer panelet under KPI |
| `src/lib/__tests__/ai-dispatch-data.test.ts` | Tester for bygg-logikk |

## UI-kontrakt

Bruk gjeldende cockpit og fasit via `designsystem/README.md`. Den tidligere Paper-kontrakten fra juli er utgått. Bruk `TL` og eksisterende komponenter. Verifiser filstiene og importene i tabellen over mot dagens kode før endring; cockpit har siden blitt omorganisert.

Hold køen forståelig: hva haster, hva krever handling, og hvor skal coachen gå videre. Ingen fabrikkerte tellinger. Én tydelig primærhandling. Følg godkjent meny fra beslutningen 09.09.2026.

## Datakilder (ekte)

| Telling | Modell / kilde |
|---------|----------------|
| planActions | PlanAction PENDING |
| caddieDrafts | CaddieDraft PENDING (ADMIN) |
| sessionRequests | SessionRequest PENDING |
| agentRunsRunning | KommandoAgentRun status=running |
| agentRunsFailed | KommandoAgentRun failed siste 24t |
| innboksNye | loadInnboksSammendrag.antallNye |
| fokusSpillere | pinnet + forslag fra loadFokusSpillere |

## Prioritet ved bygg

1. planActions  
2. caddieDrafts  
3. sessionRequests  
4. innboksNye  
5. agentRunsFailed  
6. agentRunsRunning  
7. fokusSpillere  
8. always: agent-team-start · agenter (admin) · workbench  

## Endringsregler

- Ny rad-type → utvid `AiDispatchTil` + `TIL_LABEL` + test  
- Ikke vis fabrikkerte tall  
- Coach ser ikke CaddieDraft (load sender 0)  
- Etter endring:  
  `npx tsx --test src/lib/__tests__/ai-dispatch-data.test.ts`  
  `npx tsc --noEmit`  

## Relatert

- `agencyos-arkitektur` — admin-shell  
- `agenticos` — multi-AI språk  
- `hq-godkjenning` — hva som skjer i køen  
