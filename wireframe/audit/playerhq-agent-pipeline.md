# Audit: PlayerHQ — Agent-pipeline (transparens)

**HTML:** `screen-deck/playerhq/agent-pipeline.html`
**URL:** `/portal/agents`
**Tier:** Pro
**Antall klikkbare elementer:** 13

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Signal-rader (15) | Popover | SignalInfoPopover | NEI - ny popover |
| Skill-cards (6) | Modal | SkillDetailModal | NEI - ny modal |
| Agent-cards (5) | State-change | Inline (velger agent → drawer oppdaterer) | OK |
| PlanAction-cards (6) | Modal | PlanActionDetailModal | OK (i tracker) |
| Drawer: "Lukk" × | State-change | Inline | OK |
| Drawer: signal-bullets (4) | Popover | SignalInfoPopover | NEI - ny popover |
| Drawer: "Se alle forslag" primær | Skjerm | /portal/agents/forslag | NEI - ny skjerm |
| Drawer: "Pause agenten" | Modal | PauseAgentModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state (ingen agenter aktive)
- Selected agent-state (border + bg highlight)
- Active vs Paused agent
- PlanAction-status (venter/godkjent/avvist) med opacity
- Loading skeleton
- SignalInfoPopover (forklaring + datakilde)
- SkillDetailModal (input/output + eksempler)
- PauseAgentModal (bekreft + tidsperiode)
- Sub-skjerm "Alle forslag" (liste + filter)
