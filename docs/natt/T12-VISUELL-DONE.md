# T12 visuell — AO-00 / AO-01 (28.08.2026)

Gren: `claude/t12-visuell-ao-00-01-2026-08-28`

IA fra #630 er urørt (Kø-fane = `/admin/godkjenninger`, `/meg` under Meg, Caddie-redirect, J-B ingen autosend). C7-policyen er urørt. `src/lib/jarvis/` er urørt.

## Matcher fasit

| Label | Rute | Hva |
|---|---|---|
| AO-00 LOCK | indre rail i alle AgenticOS-flater | Cockpit · Kø · Godkjenn · Projects · Runtimes · Skills. Warm prikk + AgenticOS. Desktop 216 px, mobil piller. |
| AO-01 Cockpit 1440/393 | `/admin/agenticos` | Nå · neste task · venter på deg · tasks i kø · research-badge. Én hvit Kjør eller Godkjenn. |
| AO-03 Kø | `/admin/agenticos/ko` | Filter Alle/Akademi/Produkt/Drift. Klar · Pågår · Venter. Tom = «Køen er tom». |
| AO-08 Godkjenn | `/admin/agenticos/godkjenn` | Én hvit Godkjenn. Avvis dim. Warm hake «Godkjent i dag». Tom = «Ingen som venter. Research lander i Cockpit.» |
| AO-04 Run-detalj | `/admin/agents/[agentId]` | Steg-logg, Godkjenn resultat når forslag venter. Feil = AO-11-kort. |
| AO-09 Skills | `/admin/agenticos/skills` | Fem rader. E-post og publiser av/låst. Ingen hvit primær. |
| AO-02 / AO-10 | `/admin/agenticos/runtimes` | Sju runtimes. Hvit prikk = på. Bare Claude koblet. Ollama ærlig av (lokal Mac Mini). |
| AO-05 Projects | `/admin/agenticos/projects` | Gruppert på Area. Tom uten oppdiktede tall. |
| AO-11 tom/feil | kø tom + runtime-feil-kort | Copy fra fasit. |

Tokens: kun `TL.*`. Ok-grønn brukes ikke. Agent skriver aldri uten godkjenning.

## Ærlige avvik (data, ikke look)

- Ingen `RUNNING`-status på AgentRun — «Kjørende run» vises ikke (ikke funnet på).
- Ingen start-vs-resultat-splitt i PlanAction — A3 «Venter start» tegnes ikke som egen kø.
- Research-badge = antall Signal siste 7 dager (C3-les, ikke godkjenn-kø).
- Runtimes: Grok/Gemini/Cowork/OpenCode/Ollama er av i denne appen. Ingen oppdiktet helse.
- «Kjør» treffer bare ADMIN + manuelle agenter (`triggerAgentManually`). Cron-agenter har ingen bruker-trigger.

## Gjenstår

- AO-12a–e start-dialog / pause / avvist-tilstander som egne rammer (krever start-status i data).
- AO-06/07 project-ark og task-ark (krever project/task-modell utover Notion-cache).
- Piksel-diff-rigg mot `.dc.html` (skjermbilde-gate: Anders må se 390 + desktop, lys + mørk).
- `AdminAgenticosHubV2` (Paper-hub) ligger igjen ubrukt.

tsc grønn. Tester: `agenticos-ia.test.ts` + C7-policy + capability-kontrakt.
