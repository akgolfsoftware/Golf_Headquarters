---
name: agenticos-cockpit
description: >
  AI-dispatch-panelet på AgencyOS-cockpit (/admin/agencyos). Bruk ved endring av
  AI-dispatch, cockpit AI-kø, «én ting NÅ», AgenticOS-panel, AiDispatchPanelV2,
  loadAiDispatch, byggAiDispatch. Versjon 2026-07-23.
---

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

## UI-kontrakt (komplett polish 2026-07-23)

1. **Én ting NÅ** — hero, clay-markering (`--p-handling` #D97757 — Paper-monopolet), display-type, CTA «Gjør dette»  
2. **Mini-status** — tallfliser for plan/caddie/forespørsel/e-post/team (kun >0)  
3. **Haster** vs **Valgfritt** — seksjoner; haster med warn-strek + tint  
4. **Agent-team** — chips `1·Research · 2·Utkast · 3·Review`  
5. **Maks 4 rader** — `tilLabel` · oppgave · ferdig når · prioritet  
6. Hurtiglenker med antall: godkjenninger · agent-team · agenter · caddie · innboks  
7. Badge «N i kø» / «Klar»  
8. Ingen emoji · kun tokens (`--p-*` / `T.*` — `--v2-*` er broet til Paper) · clay KUN på «Én ting nå» + fokus (A3-beslutning 16.08); øvrige handlinger er ink-knapper  

Samme kø-språk på: cockpit «Trenger deg nå», innboks-kort, `/admin/godkjenninger` SakKort.

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
