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
5. **Kost/modell/prompt kan ikke vises:** `AiModel`, `RoutingRule`, `AiPrompt`, `AiCost`
   finnes ikke som tabeller (rødt i portplanen 02.08). Hub-panelet sier det eksplisitt i
   stedet for å vise fabrikerte tall. Datamodellen er en egen kodeleveranse.

## Tegnet i denne økten

| Fil | Rute(r) den er fasit for | Tilstander |
|---|---|---|
| `fase2/agencyos/agencyos-agenticos-hub.html` | `/admin/agenticos` (ny) + redirects fra `agents`, `agent-team`, `kommando/*`; innganger til `brief`, `recording`, `workspace`, `marketing`, `reports` | Normal · Agentfeil · Tom · Laster |
| `fase2/agencyos/agencyos-agent-detalj.html` | `/admin/agents/[agentId]` + agent-team-kjøringer med steg | Aktiv · Feilet · Manuell · Ingen data |

Begge på `w4-base.css` + `w4-demo.js` (delt W4-skall, akhq-tokens v3.1 verbatim). CTA er
blekk; ingen oransje — agentfeil er varsel (`--dn`-kant), ikke «Én ting nå». Innhold er
grunnet i de ekte loaderne: `AGENT_INFO` (13 agenter), `agentRun`-aggregering, brief- og
recording-pipelinen, workspace-selskapene.

## Åpne punkter til Anders

1. Oppgavesystem: KommandoTask eller Notion-cache (punkt 4)?
2. `meg/dispatch` + `meg/morgenbrief` → redirect til `/admin/brief`?
3. Marketing/rapporter: holder inngang fra huben, eller skal de ha egne fasiter?
4. AiCost-datamodellen: bygges før eller etter at huben portes?
