# Plan — komplett AgenticOS-system med Jarvis (17.08.2026)

**Rolle:** samleplanen for hele AI-laget — AgencyOS' AgenticOS-flate, agent-flåten, Kommando,
Telegram og Jarvis (`/meg`). Erstatter spredningen der status lå i fire dokumenter med ulik
ferskhet. Detaljhistorikk: `docs/port/drift-agenticos-konsolidering.md` (flate-tegningen) og
`natt-rapport.md` i repo-rot (Jarvis-portens arbeidslogg, eies av PR #532/#547-kjeden).
Alt under «Nåtilstand» er målt mot `main` @ `1f3e127` (17.08), ikke antatt.

---

## 1. Nåtilstand — hva som faktisk finnes

### 1.1 AgenticOS (AgencyOS-siden)

- **`/admin/agenticos`** er bygget (`AdminAgenticosHubV2`): 13 agenter fra `AGENT_INFO`,
  30 siste `AgentRun`, `PlanAction`-tellinger, `AiCost`-aggregater. Gated på `Capability.USE_AGENTS`.
- **Konsolideringen (beslutning 04.08) er ~60 % gjennomført:** `agent-team` ✅ og `agents` ✅
  redirecter; **`/admin/godkjenninger` er fortsatt egen side** og **konsollens AI-panel**
  (`AiDispatchPanelV2` i `KonsollChat`) lever fortsatt.
- **Agent-flåten:** 63 filer i `src/lib/agents/` (57 kode + 6 tester), 59 cron-oppføringer i
  `vercel.json`. Mønster: signal → forslag → godkjenning → utførelse, med `provenance` og tre
  guards i `plan-action-executor.ts`. **Kun 13 av agentene er registrert i `AGENT_INFO`** og
  synlige i huben; 8 agenter logger ikke via `runAgent()` og finnes derfor ikke i `AgentRun`.
- **Kommando:** `src/lib/kommando/` (KommandoTask DB-persistert, 4 modeller i `models.ts`),
  men inngangsruten er redirect — og **`/kommando/agenter` redirecter til `/admin/agenter`
  som ikke finnes (404)**.
- **Telegram:** `src/lib/meg/telegram.ts` (webhook-secret, allowlist, rate-limit) brukt av
  (1) toveis Jarvis-bot, (2) godkjenningskanalen (`pending.ts`/`confirm.ts`), (3) utgående
  agent-varsling (`agent-notify.ts` — in-app + push + Telegram, SG-eskalering).

### 1.2 Jarvis (`/meg`)

Jarvis er produktnavnet; koden ligger under `meg`/`saker`/`jarvis`:

- **Sak-køen («venter på deg»):** `Sak`-modell (#518) · Gmail- og iMessage-innsamlere på
  Mac Mini via LaunchAgent (#526) · triage-agent hvert 30. min: Ollama klassifiserer lokalt,
  navn anonymiseres deterministisk før Claude skriver utkast, navn settes tilbake lokalt (#546).
  Godkjenning fra tre innganger (innboks-knapp, Telegram-BEKREFT, `/meg`) — oppretter
  Gmail-UTKAST, sender aldri selv.
- **Samtale:** Telegram-bot + `POST /api/meg/shortcut` (Siri/Watch/CarPlay, #545 —
  driftshåndbok i `docs/jarvis-shortcut.md`) → 27 verktøy i `src/lib/meg/tools.ts`
  (Notion, Gmail, Kalender, Drive, Stripe, Perplexity `nett_sok` #544, minne, lønn/vaskeliste/
  ballplukking-bekreftelser).
- **Skjermene:** designfasit for **alle 12** ligger i `designsystem/paper/jarvis/`
  (én rute `/meg`, 11 artefakter i panel med deep-link `?artefakt=`). Portet: hjem, saker,
  sak (#532) — **maskinrommet ligger i draft #547** (med ekte `AgentRun`-helse for
  innsamlerne). Gjenstår: kalendervakt, dagen, morgenbrief, kveldsjournal, ukesreview,
  historikk, innstillinger, fangst (8 skjermer — design finnes for alle).

### 1.3 Kjente hull (målt)

| # | Hull | Hvor |
|---|---|---|
| H1 | `/meg` er **ulenket** — ingen `href="/meg"` i appen; nås kun ved å skrive URL | IA-beslutning |
| H2 | **To ulike `godkjennSak`**: `src/app/meg/actions.ts` setter kun status; `src/lib/saker/godkjenn.ts` (innboks + Telegram) oppretter Gmail-utkast. Samme knapp, to sideeffekter | Samles til én |
| H3 | Telegram-godkjenning holder kun ÉN ventende handling per person (`getLatestPending`) — ved flere saker i samme triage-runde er bare siste BEKREFT-bar | `src/lib/meg/pending.ts` |
| H4 | Godkjenn-flyten mangler Gmail-**send**-scope (fasiten tegner «Sendt via Gmail»; appen kan bare lage utkast) | Google-tilkoblingen |
| H5 | `/kommando/agenter` → `/admin/agenter` = 404 | Død redirect |
| H6 | Agent-registeret (13) dekker ikke flåten (57) — huben underrapporterer | `agent-registry.ts` |
| H7 | 8 agenter logger ikke `AgentRun` → usynlige i maskinrom/hub | `runAgent()`-adopsjon |
| H8 | Jarvis' 12 skjermer står utenfor rutefasit/checklist-regnskapet | PORTPLAN §B6 eier dem |
| H9 | **Jarvis-masterplanen ligger UTENFOR repoet** (`~/Documents/Claude/akgolf-hq/kunnskap/jarvis-masterplan.md`, referert fra `scripts/saker-innsamling/`) | Må inn i `docs/` |

---

## 2. Planen — i rekkefølge

### Fase J1 — Jarvis-skjermene ferdig (design finnes, ingen blokkeringer)

1. Merge **#547** (maskinrommet) etter skjermbilde-gate.
2. Port de 8 gjenværende skjermene i naturlige par (rekkefølgen fra #547):
   kalendervakt + dagen → morgenbrief + kveldsjournal + ukesreview (kan gjenbruke
   `hentBriefer`/`hentNylige` i `src/lib/meg/read.ts`) → historikk + innstillinger → fangst.
   Kalendervakt trenger i tillegg en **kalendervakt-agent** (avvik-detektor) — i dag returnerer
   `hentAvvik()` bevisst tom liste.
3. Samle `godkjennSak` (H2) til `src/lib/saker/godkjenn.ts` som eneste implementasjon.
4. Utvid Telegram-pending til kø (H3) — eller vis «N saker venter, åpne innboksen» ved >1.

### Fase J2 — AgenticOS-konsolideringen fullført (beslutning 04.08)

5. `/admin/godkjenninger` → inn i AgenticOS-flaten/inspektørpanelet (NB: PORTPLAN §A1 har
   det åpne spørsmålet «godkjenninger én flate eller fem» — avklar med Anders først).
6. Konsollens AI-panel → flytt til `/admin/agenticos` (resten av 04.08-beslutningen).
7. Fiks H5 (død redirect) — pek `/kommando/agenter` til `/admin/agenticos`.
8. Registry-løft: utvid `AGENT_INFO` til å dekke flåten (H6) og la de 8 siste agentene
   logge via `runAgent()` (H7) — da blir maskinrommet og huben sanne.

### Fase J3 — grunnlag og styring

9. Hent **Jarvis-masterplanen inn i repoet** (H9) — `docs/jarvis-masterplan.md`; til den er
   hentet er dette dokumentet + `natt-rapport.md` eneste sporbare plan.
10. IA-beslutning for `/meg` (H1): egen flate (dagens design forutsetter det) — og hvor lenkes
    den fra? (Forslag: AgencyOS-railens «Oppsett»-område eller ⌘K. Ren Anders-beslutning.)
11. Gmail-send-scope (H4): utvid Google-tilkoblingen (`/api/google-calendar/connect?meg=1`)
    hvis «Sendt via Gmail» skal bli sann; ellers rettes fasit-teksten til «Utkast opprettet».
12. KommandoTask vs. Notion-cache (drift-agenticos pkt. 4) — fortsatt Anders' valg; blokkerer
    siste konsolideringssteg.

### Beslutninger som trengs fra Anders (oppsummert)

| # | Spørsmål | Blokkerer |
|---|---|---|
| J-A | Hvor lenkes `/meg` fra (rail, ⌘K, egen)? | H1 |
| J-B | Gmail-send-scope: ja/nei? | H4 / fasit-teksten |
| J-C | Godkjenninger: én flate i AgenticOS eller fortsatt egen? (= PORTPLAN §A1) | Fase J2 pkt. 5 |
| J-D | KommandoTask eller Notion-cache? | Fase J3 pkt. 12 |

---

## 3. Prinsipper (uendret, fra beslutningene)

- **Ingen agent endrer kode direkte** — agenter produserer forslag; menneske merger.
- **Ingen mutasjon uten eksplisitt godkjenning** (Jarvis-fasitens regel; 10 s angrefrist).
- **PII lokalt:** navn anonymiseres FØR sky-prompt, settes tilbake lokalt (triage-mønsteret).
- **Jarvis sender aldri selv** — godkjenning gir utkast (til J-B evt. endrer det).
- Familie-Jarvis skal IKKE inn (fasit-prompten er eksplisitt).
