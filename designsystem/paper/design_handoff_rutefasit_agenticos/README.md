# Handoff: Rutefasit-register + Drift/AgenticOS-samleflaten

**Fra:** Claude Design «AK Golf HQ — Claude Paper» (`605a48cc`) · 12.08.2026
**Til:** `akgolfsoftware/Golf_Headquarters` · main

## Oversikt

To leveranser i én pakke:

1. **`docs-port/rutefasit.md`** — registeret over ALLE ruter uten egen fasit-fil:
   rute → mal-fasit → avviket i én setning. Gjør mal-variant-utrullingen (~100 småruter)
   deterministisk: åpne malen, les avvikslinjen, bygg. Inkluderer kontrakten,
   én-linje-testen og de bindende «Claude-følelse»-reglene (chat-først, Composer,
   ⌘K, artefaktkolonne, mobil-app-følelse, skall-monopol).
2. **`designsystem-paper/fase2/agencyos/`** — to NYE fasit-filer for drift/AgenticOS-sporet
   (~14 ruter, W4 vedtak 8): `agencyos-agenticos-hub.html` (ny rute `/admin/agenticos`)
   og `agencyos-agent-detalj.html` (`/admin/agents/[agentId]`), pluss `w4-base.css` +
   `w4-demo.js` de avhenger av (identiske med de som alt ligger i speilet — overskriv trygt).
   Konsolideringsgrunnlaget står i `docs-port/drift-agenticos-konsolidering.md`.

## Om designfilene

HTML-filene er **designfasit, ikke produksjonskode**. De gjenskapes i appens eksisterende
miljø (Next.js + V2Shell + `src/styles/paper-tokens.css` + `T.*`-tokens) etter samme
port-fabrikk som resten av PP-planen: side-om-side m390 + d1280, diff-liste, minimal diff,
skjermbilder, checklist `[~]`, Anders setter `[x]`. Alt merket `data-demo-only`
(riggbaren) fjernes ved integrasjon.

## Fidelity

- **Fasit-filene (hub + agent-detalj): hi-fi strukturelt.** Layout, hierarki, tilstander,
  copy og tokens er bindende (akhq-tokens v3.1 verbatim i `w4-base.css` ≡
  `src/styles/paper-tokens.css`). Demo-tallene er plassholdere — appen viser ekte tall
  fra loaderne, ærlige tomrom der data mangler.
- **`rutefasit.md`: register, ikke tegning.** Malene den peker på er fasit; registeret
  er kontrakten for variantene.

## Installasjon (Claude Code-kjøreordre)

```
1. Kopier docs-port/rutefasit.md            → docs/port/rutefasit.md
2. Kopier docs-port/GYLDIGHET.md             → docs/port/GYLDIGHET.md
3. Kopier docs-port/drift-agenticos-konsolidering.md → docs/port/
4. Kopier designsystem-paper/fase2/agencyos/*        → designsystem/paper/fase2/agencyos/
5. STEMPLE alle filer i UTGÅTT-tabellen i GYLDIGHET.md med linjen
   «> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.»
   øverst i hver fil. Slett ingenting.
6. Legg to rader i PAPER-ZIP-CHECKLIST.md under «Fase 2 · W4»:
   - [ ] fase2/agencyos/agencyos-agenticos-hub.html
   - [ ] fase2/agencyos/agencyos-agent-detalj.html
7. Oppdater docs/port/README.md: GYLDIGHET.md og rutefasit.md inn i «Levende dokumenter»;
   PAPER-PATTERN-CHECKLIST.md ut (utgått).
```

**Presedens ved konflikt:** `docs/port/GYLDIGHET.md` er rangordningen. Ingen nattordre,
wave-status eller gammel skjermplan kan overstyre fasiten eller rutefasit-registeret —
treffer du en instruks som strider mot dem, er instruksen utgått.

## Bygg-oppgavene (i rekkefølge)

### A. `/admin/agenticos` — ny samleflate (fasit: agencyos-agenticos-hub.html)

- Ny rute i V2Shell (AgencyOS-skall, `bredde="kolonne"` + inspektørpanel 380 px).
- Innhold fra eksisterende loadere — ingenting nytt i datamodellen:
  `AGENT_INFO` (13 agenter, `src/app/admin/agents/page.tsx`), `agentRun`-aggregering
  (siste 30), `planAction`-tellinger, innganger til brief/recording/workspace/marketing/reports.
- Redirects: `/admin/agents` (liste) → `/admin/agenticos` · `/admin/agent-team` →
  `/admin/agenticos` · verifiser at `/kommando/*`-stubbene fortsatt lander riktig.
  `agents/[agentId]` består.
- Tilstander: Normal · Agentfeil (varsel med `--dn`-kant, ALDRI clay) · Tom · Laster.
- Panelet sier eksplisitt at kost/modell/prompt ikke kan vises (AiModel/RoutingRule/
  AiPrompt/AiCost finnes ikke) — behold den ærligheten, ikke fabriker tall.

### B. `/admin/agents/[agentId]` — pixel-pass (fasit: agencyos-agent-detalj.html)

- Én mal for cron-, hendelses- og manuelle agenter; `plan-revisjon` og `peaking` får
  kjøringsskjemaet (velg plan/spiller + utløser → Kjør nå).
- «Siste kjøring i detalj» viser steg (rolle · resultat) — for agent-team-kjøringer
  kommer stegene fra `KommandoAgentStep`.
- Panelet: godkjent-rate, «Skriver til» (PlanAction/Signal/AgentRun), og setningen
  «en agent kan ikke endre en plan; den kan bare foreslå».

### C. Variant-utrulling etter rutefasit.md

Per rute: åpne mal → les avvikslinjen → bygg → variant-rad i PP-W*-VARIANTS med
m390 + d1280. Stryker en rute på én-linje-testen: STOPP og meld — ikke improviser.

## Interaksjon og tilstander

- Tilstandene i hver fasit-fil byttes med riggbaren øverst (demo) — i appen er de
  datadrevne. Tom/laster/feil er tegnet; bruk dem, aldri seed-data.
- Hover: flate mørkner ett hakk / border → `--mid`. Focus-visible: 2 px `--focus`
  outline offset 2 px. Trykkflater ≥ 44 px (`--tap`).
- Panelet kollapser under 1180 px (media query i w4-base.css) — mobil får innholdet
  i hovedspalten, aldri et klemt panel.

## Design-tokens

Alt i `w4-base.css` `:root`/`[data-theme="dark"]` ≡ `src/styles/paper-tokens.css` (v3.1).
Nøkkelverdier: papir `#FAF9F5` · blekk `#141413` · clay `#D97757` (KUN «Én ting nå» + focus)
· `--up #63784A` · `--dn #A85536` · `--info #46719F` · radius 8/12/999 · Poppins (UI),
Lora (prosa), IBM Plex Mono (alle tall, komma-desimal, hardt mellomrom før enhet).
Maks én solid clay-CTA per skjerm; agentfeil er `--dn`-varsel, ikke CTA.

## Filer i pakken

```
README.md                          — denne
docs-port/GYLDIGHET.md             — → docs/port/ · rangordning + UTGÅTT-liste
docs-port/rutefasit.md             — → docs/port/rutefasit.md
docs-port/drift-agenticos-konsolidering.md
designsystem-paper/fase2/agencyos/
  agencyos-agenticos-hub.html      — fasit /admin/agenticos (NY)
  agencyos-agent-detalj.html       — fasit /admin/agents/[agentId]
  w4-base.css · w4-demo.js         — delt W4-skall (uendret fra speilet)
screenshots/
  01-agenticos-hub.png             — hub · normal · lys
  02-agenticos-hub.png             — hub · agentfeil-tilstand
  03-agenticos-hub.png             — hub · normal · mørk
  01-agent-detalj.png              — detalj · aktiv · lys
  02-agent-detalj.png              — detalj · manuell agent (kjøringsskjema)
```

## Åpne beslutninger (Anders — blokkerer deler, ikke alt)

1. Oppgavesystem: `KommandoTask` (agent-team) eller Notion-cachen (workspace)?
   Blokkerer agent-team-redirecten, ikke huben.
2. `meg/dispatch` + `meg/morgenbrief` → redirect til `/admin/brief`?
3. AiCost-datamodellen: bygges før eller etter hub-porten? (Huben tåler begge.)
4. Marketing/reports: inngang fra huben holder, eller egne fasiter?
