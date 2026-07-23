---
name: agencyos-arkitektur
description: >
  Komplett arkitektur for AgencyOS — coach/admin i AK Golf HQ (/admin).
  Bruk ALLTID ved AgencyOS, admin, stall, cockpit, coach-workbench, godkjenninger,
  AI-hub, Caddie, booking-admin, sidemeny/hub, "bygg i AgencyOS", ny admin-side.
  FORBUDT i UI: CoachHQ. Les ALLTID før admin-kode. Versjon 2026-07-23.
---

# AgencyOS — arkitektur

**App-navn i UI:** AgencyOS. Aldri «CoachHQ».

## Hva det er

Coach/eier-flaten for å drive stallen: spillere, planer (Workbench), bookinger, analyse, AI-forslag du godkjenner.

- Adresse: `/admin/*`
- Hjem (cockpit): `/admin/agencyos`
- Spillerportal er **PlayerHQ** (`/portal`) — ikke bland

## Stack (fasit)

Next.js 16 App Router · Prisma 7 · Supabase · Tailwind v4 · v2-komponenter (`src/components/v2`) · Lucide · npm

Kanon: `docs/platform/AGENT-BRIEF.md`, `docs/MASTER-SKJERMPLAN.md`, `docs/design-system/FASIT.md`.

## Navigasjon (praktisk)

| Område | Eksempel-ruter |
|--------|----------------|
| Cockpit | `/admin/agencyos` |
| Stall | `/admin/spillere` |
| Workbench / plan | `/admin/planlegge`, spiller-workbench |
| Godkjenninger | `/admin/godkjenninger` |
| Caddie | `/admin/caddie` |
| Agenter | `/admin/agents` |
| Agent-team | `/admin/agent-team` |
| Kalender / bookinger | `/admin/kalender`, `/admin/bookinger` |
| Innboks e-post | `/admin/innboks-epost` |

Chrome: `V2Shell` + `AGENCYOS_NAV` (`src/components/v2/shell.tsx`).

## AI-laget (AgenticOS i produktet) — LÅST

**AgenticOS er en del av AgencyOS coach-funksjon — ikke en egen app, ikke gjemt under «Mer» alene.**

Låst plassering (PR #122, 2026-07-24):

| Hvor coach ser det | Hva |
|--------------------|-----|
| **Hjem** `/admin/agencyos` | AI-dispatch-panel («AgenticOS · AI-dispatch»), «én ting NÅ» |
| **Kø** `/admin/godkjenninger` | Godkjenn AI-forslag (PlanAction, CaddieDraft) — merket AgenticOS |
| **Mer → gruppe «AgenticOS»** | Kø, Caddie, AI-agenter, Agent-team, Daglig brief |
| Cockpit-eyebrow | `AgencyOS · AgenticOS` |

```
Cron/agenter → PlanAction / CaddieDraft → /admin/godkjenninger
Cockpit AI-dispatch → lenker til kø / team / caddie
Agent-team: Grok → Claude → Gemini (/admin/agent-team)
```

Skills: `agenticos`, `agenticos-cockpit`, `hq-godkjenning`, `playerhq-agents` (pipeline; kode i `src/lib/agents/`).

**Regel:** AI foreslår, coach godkjenner, system utfører. Aldri stille auto-publiser plan.

**Aldri:** fjern AgenticOS-branding fra Hjem/Kø, lag 7. primær-nav bare for AI, eller bygg AI-kø utenfor AgencyOS.

## Viktige filer

| Tema | Sti |
|------|-----|
| Cockpit UI | `src/components/admin/v2/CockpitV2.tsx` |
| Cockpit data | `src/lib/agencyos/daily-brief-data.tsx` |
| AI-dispatch | `src/lib/agencyos/ai-dispatch-data.ts`, `AiDispatchPanelV2.tsx` |
| Agenter | `src/lib/agents/*`, cron i `vercel.json` |
| Caddie | `src/lib/caddie/*`, `src/app/api/caddie/*` |
| Auth | `requirePortalUser`, `canAccessMissionControl`, CBAC i `src/lib/auth/cbac.ts` |

## Design

- AgencyOS: mørk default (v2 tokens `--v2-*`)
- Kun `src/components/v2` for nye flater
- Ingen emoji i UI — Lucide
- Norsk bokmål

## Scope-grense

Ikke bygg spillerportal her (PlayerHQ). Ikke marketing. Ikke ny app ved siden av `/admin`.

## Deprecated

`coachhq-arkitektur` / `coachhq-agents` peker hit / til `agenticos`. Ikke utvid de gamle skillene.
