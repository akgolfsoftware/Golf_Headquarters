# Drift/AgenticOS-sporet — konsolideringsgate og manifest, 2026-08-12

Sporet ble skilt ut i W4 (vedtak 8) med anslag ~14 ruter. Talt mot kode på `main` 12.08:
**19 `page.tsx`**, hvorav 6 under `/kommando/*` er redirect-stubber (270–672 B, B8-vedtaket
16.07 peker alt på `/admin/agent-team`) og `meg/dispatch` + `meg/morgenbrief` er tynne
wrappere (715–826 B). **Reelle skjermer: 9.**

## Konsolidering — vedtak til Anders

1. **`/admin/agenticos` er NY samleflate** (vedtatt, jf. nattrapport 12.08 spm. 3):
   agentliste + siste kjøringer + innganger til verktøyene. `/admin/agents` (liste) og
   `/admin/agent-team` (oversikt) blir redirects hit — det løser slug-konflikten.
   `agents/[agentId]` består som detaljrute. — *Tegnet slik.*
2. **Agent-detalj er ÉN mal** for cron-, hendelses- og manuelle agenter (`plan-revisjon`,
   `peaking` får kjøringsskjema i samme mal). Agent-team-kjøringers steg (modell/rolle/status)
   vises i «Siste kjøring i detalj»-blokka. — *Tegnet slik.*
3. **Brief, opptak, workspace, marketing og rapporter beholder egne ruter**; huben er
   inngangen. Brief og opptak har allerede gode V2-flater — de trenger pixel-pass, ikke
   ny fasit. — *Anbefalt ja.*
4. **To oppgavesystemer:** `KommandoTask` (agent-team) og Notion-cachen (workspace) er
   duplikater i praksis. Flaten tegner ikke begge — **Anders må velge hjem** før
   agent-team-redirecten kodes.
5. **Kost/modell/prompt kan ikke vises — UTDATERT 17.08:** `AiCost` FINNES nå som tabell
   (`prisma/schema.prisma` · agenter logger via `registrerAiKost` i `src/lib/agencyos/ai-kost.ts`),
   og huben viser aggregatene. `AiModel`/`RoutingRule`/`AiPrompt` finnes fortsatt ikke.

## Tegnet i denne økten

| Fil | Rute(r) den er fasit for | Tilstander |
|---|---|---|
| `fase2/agencyos/agencyos-agenticos-hub.html` | `/admin/agenticos` (ny) + redirects fra `agents`, `agent-team`, `kommando/*`; innganger til `brief`, `recording`, `workspace`, `marketing`, `reports` | Normal · Agentfeil · Tom · Laster |
| `fase2/agencyos/agencyos-agent-detalj.html` | `/admin/agents/[agentId]` + agent-team-kjøringer med steg | Aktiv · Feilet · Manuell · Ingen data |

Begge på `w4-base.css` + `w4-demo.js` (delt W4-skall, akhq-tokens v3.1 verbatim). CTA er
blekk; ingen oransje — agentfeil er varsel (`--dn`-kant), ikke «Én ting nå». Innhold er
grunnet i de ekte loaderne: `AGENT_INFO` (13 agenter), `agentRun`-aggregering, brief- og
recording-pipelinen, workspace-selskapene.

## Status 17.08.2026 (målt mot kode)

- `/admin/agenticos` er BYGGET (`AdminAgenticosHubV2`, ekte data: 13 agenter, 30 siste
  `AgentRun`, `PlanAction`-tellinger, `AiCost`-aggregater).
- Redirects: `agent-team` ✅ · `agents` ✅ (detaljruta `agents/[agentId]` består bevisst) ·
  **`godkjenninger` ❌ (fortsatt egen side)** · **konsollens AI-panel ❌ (lever i `KonsollChat`)**.
- Kjent bug: `/kommando/agenter` redirecter til `/admin/agenter` som ikke finnes (404).
- Jarvis/`/meg` er kommet til som eget spor siden dette dokumentet ble skrevet — se
  `docs/plan-agenticos-jarvis-2026-08-17.md` (samleplanen som eier restene herfra).

## Åpne punkter til Anders

1. Oppgavesystem: KommandoTask eller Notion-cache (punkt 4)? — **fortsatt åpent, blokkerer
   siste del av konsolideringen.**
2. `meg/dispatch` + `meg/morgenbrief` → redirect til `/admin/brief`? (NB: `/meg` er nå
   Jarvis-flaten — spørsmålet må ses sammen med Jarvis-planen.)
3. Marketing/rapporter: holder inngang fra huben, eller skal de ha egne fasiter?
4. ~~AiCost-datamodellen~~ — LEVERT, se status over.
