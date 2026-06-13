# Fase 1 — Bolk 1+4 Screen Porting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port all 43 preview-screens to canonical addresses with real Prisma data, run design-porting-gate on each, and remove duplicate route pairs (Bolk 4). All six checkboxes green per screen in MASTER-SKJERMPLAN.

**Architecture:** Multi-agent Workflow. Discovery maps current state → parallel porting pipeline per product area → Bolk 4 duplicate cleanup in parallel → MASTER-SKJERMPLAN update.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Supabase Postgres, Tailwind v4, shadcn/ui, TypeScript strict, Playwright screenshots via scripts/app-shot.mjs

**Reference files:**
- Design JSX source: `public/design-handover/AK Golf HQ Design System/playerhq-app/ph-screens.jsx`, `agencyos-app/screens-*.jsx`
- Design rules: `.claude/rules/design-porting-gate.md`
- MASTER-SKJERMPLAN: `docs/MASTER-SKJERMPLAN.md`
- Platform context: `docs/platform/AGENT-BRIEF.md`

---

## Screen Priority Groups

### Group A: PlayerHQ — Already have data, need address+verification (7 screens)
| Screen | Address | Issue |
|---|---|---|
| Statistikk | `/portal/statistikk` | Adresse=~, needs canonical route fix |
| SG-Hub | `/portal/mal/sg-hub` | Adresse=~, needs canonical route fix |
| Runder (liste) | `/portal/mal/runder` | Adresse=~, needs canonical route fix |
| TrackMan (liste) | `/portal/mal/trackman` | Adresse=~, needs canonical route fix |
| Booking-hub | `/portal/booking` | Adresse=~, needs canonical route fix |
| Ny booking | `/portal/booking/ny` | Adresse=~, needs canonical route fix |
| Live-økt: summary | `/portal/(fullscreen)/live/[sessionId]/summary` | Adresse=~, has data |

### Group B: PlayerHQ — Design=✓, need real data connected (6 screens)
| Screen | Address | Data needed |
|---|---|---|
| Årsplan | `/portal/tren/aarsplan` | TrainingPlan + sessions |
| Drills detalj | `/portal/drills/[id]` | Drill from DB |
| Live-økt: brief | `/portal/(fullscreen)/live/[sessionId]/brief` | TrainingSession |
| Live-økt: aktiv | `/portal/(fullscreen)/live/[sessionId]/active` | TrainingSession |
| Foreldre | `/portal/meg/foreldre` | User.guardians relation |
| Varsler | `/portal/varsler` | Notification model |

### Group C: AgencyOS — Design=✓, need real data (4 screens)
| Screen | Address | Data needed |
|---|---|---|
| Caddie (AI-chat) | `/admin/agencyos/caddie` | AI provider integration |
| Compliance | `/admin/analysere/compliance` | Player risk/compliance flags |
| Kalender: uke | `/admin/kalender/uke` | Booking/session week view |
| Kalender: måned | `/admin/kalender/maned` | Booking/session month view |

### Group D: Auth + Forelder — Design=✓, need real connection (4 screens)
| Screen | Address | Data needed |
|---|---|---|
| Onboarding | `/auth/onboarding` | User creation flow |
| Logget ut | `/auth/logget-ut` | Static, just needs canonical address |
| Forelder barn | `/forelder/barn` | Children via guardianship |
| Forelder hjem | `/forelder` | Aggregated child data |

### Group E: Marketing forside — Design=✓, need real data (1 screen)
| Screen | Address | Data needed |
|---|---|---|
| Forside | `/(marketing)` (root) | Coaches, facilities, testimonials |

---

## Bolk 4: Duplicate Route Cleanup (parallel)

Canonical URL wins — set up redirects and remove duplicates:

| Duplicate | Canonical | Action |
|---|---|---|
| `/admin/finance` | `/admin/okonomi` | Redirect finance→okonomi |
| `/admin/calendar` | `/admin/kalender` | Redirect calendar→kalender |
| `/admin/messages` | `/admin/innboks` | Redirect messages→innboks |
| `/admin/approvals` | `/admin/godkjenninger` | Redirect approvals→godkjenninger |
| `/admin/plans/templates` | `/admin/plan-templates` | Redirect plans/templates→plan-templates |
| `/portal/stats` | `/portal/statistikk` | Redirect stats→statistikk |
| `/portal/analyse` | `/portal/analysere` | Redirect analyse→analysere |
| `/portal/tren/ovelser` | `/portal/drills` | Redirect ovelser→drills |

---

## Design-Porting-Gate (per screen)

Each screen goes through these 5 steps:
1. Read design JSX from `public/design-handover/`
2. Connect real Prisma data (replace placeholder calls)
3. Screenshot via `node scripts/app-shot.mjs [path] [width]`
4. Adversarial diff: independent agent compares screenshot vs JSX design — finds every deviation
5. Fix all deviations, loop until 0

---

## Task 1: Workflow Execution

- [ ] **Run the Fase 1 Workflow** (see Workflow script embedded in `docs/superpowers/plans/2026-06-11-fase1-workflow.js`)
- [ ] **Monitor progress** — each agent reports completion with updated MASTER-SKJERMPLAN hake
- [ ] **Verify build** — `npx tsc --noEmit && npm run build` after all agents complete
- [ ] **Commit** — one commit per screen group with descriptive message

---

## Kvalitetslov

```
Per screen:
  - 0 deviations from JSX design (adversarial diff)  
  - Real data — no placeholder or mock
  - All 6 checkboxes green in MASTER-SKJERMPLAN
  - tsc + build green

Per Bolk 4:
  - No broken links (old URL redirects with 301)
  - Canonical URL tested and working
```
