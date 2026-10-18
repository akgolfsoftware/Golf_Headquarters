---
name: agencyos-arkitektur
description: >
  Komplett arkitektur for AgencyOS — coach/admin i AK Golf HQ (/admin).
  Bruk ALLTID ved AgencyOS, admin, stall, cockpit, coach-workbench, godkjenninger,
  AI-hub, Caddie, booking-admin, sidemeny/hub, "bygg i AgencyOS", ny admin-side.
  FORBUDT i UI: CoachHQ. Les ALLTID før admin-kode. Versjon 2026-10-15.
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# AgencyOS — arkitektur

**App-navn i UI:** AgencyOS. Aldri «CoachHQ».

## Hva det er

Coach/eier-flaten for å drive stallen: spillere, planer (Workbench), bookinger, analyse, AI-forslag du godkjenner.

- Adresse: `/admin/*`
- Hjem (cockpit): `/admin/agencyos`
- Spillerportal er **PlayerHQ** (`/portal`) — ikke bland

## Stack (fasit)

Next.js 16 App Router · Prisma 7 · Supabase · Tailwind v4 · v2-komponenter (`src/components/v2`) · Lucide · npm

Kanon: `docs/platform/AGENT-BRIEF.md`. Design og meny følger `designsystem/README.md` og siste beslutning i `.claude/rules/beslutninger.md`.

## Navigasjon (praktisk)

Menyen er variant C (beslutninger.md §AGENCYOS-MENYEN BLIR VARIANT C, 16.10): søk først, neste økt, og tre grupper — **Daglig** Cockpit · Innboks · Kalender · **Spillere** Stall · Workbench · Grupper · Tester · **Drift** Booking · Økonomi (head coach) · Data Golf (`kanSeDataGolf`, når DG-01 finnes) · Oppsett. Kan legges sammen til ikonskinne 72 px.

| Menypunkt | Rute |
|-----------|------|
| Cockpit | `/admin/agencyos` |
| Innboks | `/admin/innboks` (e-post: `/admin/innboks-epost`) |
| Stall | `/admin/stall` (spillerliste også på `/admin/spillere`) |
| Kalender | `/admin/kalender`, bookinger `/admin/bookinger` |
| Workbench | `/admin/workbench`, planlegging `/admin/planlegge` |
| Spillere / Drift | Grupper (`/admin/grupper`) · Tester (`/admin/tester`) · Booking (`/admin/bookinger`) · Økonomi (`/admin/agencyos/okonomi`) · Oppsett (`/admin/oppsett`); `/admin/mer` virker fortsatt |

Utenfor menyen: Godkjenninger `/admin/godkjenninger`, Caddie `/admin/agencyos/caddie`, Agenter `/admin/agents`, Agent-team `/admin/agent-team`.

**Oppgaver kommer bare fra Notion** (Tasks og Prosjekter). Oppgavelista i appen (`/admin/oppgaver`) utgår; ikke bygg videre på den.

Skall: Precision-skallet `AgencyOSSkall` (`src/components/precision/AgencyOSSkall.tsx`). `V2Shell` + `AGENCYOS_NAV` (`src/components/v2/shell.tsx`) lever videre for eldre sider.

## AI-laget (AgenticOS i produktet) — LÅST

**AgenticOS er en del av AgencyOS coach-funksjon — ikke en egen app, ikke gjemt under «Mer» alene.**

Låst plassering (PR #122, 2026-07-24):

| Hvor coach ser det | Hva |
|--------------------|-----|
| **Hjem** `/admin/agencyos` | AI-dispatch-panel («AgenticOS · AI-dispatch»), «én ting NÅ» |
| **Kø** `/admin/godkjenninger` | Godkjenn AI-forslag (PlanAction, CaddieDraft) — merket AgenticOS |
| **Mer** (`/admin/mer`) | AI-inngangene Caddie (`/admin/agencyos/caddie`), AI-agenter, Agent-team og Daglig brief |
| Cockpit-eyebrow | `AgencyOS · AgenticOS` |

```
Cron/agenter → PlanAction / CaddieDraft → /admin/godkjenninger
Cockpit AI-dispatch → lenker til kø / team / caddie
Agent-team: Grok → Claude → Gemini (/admin/agent-team)
```

Skills: `agenticos`, `agenticos-cockpit`, `playerhq-agents` (pipeline; kode i `src/lib/agents/`). Køens regler står her, i §AI-laget; det finnes ingen egen kø-skill.

**Regel:** AI foreslår, coach godkjenner, system utfører. Aldri stille auto-publiser plan.

**Aldri:** fjern AgenticOS-branding fra Hjem/Kø, lag 7. primær-nav bare for AI, eller bygg AI-kø utenfor AgencyOS.

## Viktige filer

| Tema | Sti |
|------|-----|
| Cockpit UI | `src/components/admin/precision/AG01Cockpit.tsx` (montert i `src/app/admin/agencyos/page.tsx`) |
| Cockpit data | `src/lib/agencyos/daily-brief-data.tsx`, `src/lib/agencyos/cockpit-precision.ts`, `src/lib/agencyos/cockpit-tillegg.ts` |
| AI-dispatch | `src/lib/agencyos/ai-dispatch-data.ts`, `src/lib/agencyos/ai-dispatch-build.ts`, `src/lib/agencyos/cockpit-view.ts`; vist i `src/components/admin/v2/konsoll/KonsollChat.tsx` |
| Agenter | `src/lib/agents/*`, cron i `vercel.json` |
| Caddie | `src/lib/caddie/*`, `src/app/api/caddie/*` |
| Auth | `requirePortalUser`, `canAccessMissionControl`, CBAC i `src/lib/auth/cbac.ts` |

## Design

- Bruk `ak-hq-design` ved design og UI. Designsystemet er Claude Design «AK Golf Precision Athletics» (`7d7c2994`), valgt 26.09.2026 og låst: `docs/design-system/design-autoritet.md`.
- AgencyOS er den rolige, operative modusen i samme designsystem som PlayerHQ. Lyst tema er standard; grafitt primærknapp, rust bare som signal (maks én per skjerm).
- Ingen mørk modus av vane. Live-øktene er alltid lyse (beslutninger.md §LIVE-ØKTENE ER ALLTID LYSE, 14.10.2026).
- Ved implementering porteres den godkjente tegningen fra Precision til faktiske delte komponenter; eksisterende komponentmapper er teknisk underlag, ikke designordre. En skjerm er ferdig når Anders har sett den (port 7).
- Ingen emoji i UI — Lucide
- Norsk bokmål

## Scope-grense

Ikke bygg spillerportal her (PlayerHQ). Ikke marketing. Ikke ny app ved siden av `/admin`.
