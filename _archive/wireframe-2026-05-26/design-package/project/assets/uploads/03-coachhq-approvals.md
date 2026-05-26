# AK Golf Platform — CoachHQ — Godkjenninger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/approvals`
- **Arketype:** B — List + filter (agent-inbox)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/approvals.html`
- **Audit:** `wireframe/audit/coachhq-approvals.md`
- **Tilhørende modaler:** `PlanActionDetailModal`, `BulkApproveModal`, `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Godkjenninger er coach sin agent-inbox. Hver rad er en anbefaling fra en av Signal→Skill→Agent-pipelinens agenter (periodisering, deload, escalation). Coach må håndtere disse løpende — aksepter, avslå med årsak, eller bla opp detaljer. Tomtilstanden («Alt godkjent») er målet.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Hver rad er en agent-anbefaling med 6 kolonner:

| Kolonne | Innhold |
|---|---|
| Severity | Pill: `Info` (muted) / `Warning` (amber) / `Urgent` (destructive). Pulsende prikk på Urgent. |
| Spiller | Avatar (32px) + navn |
| Action-type | Tekst med ikon: «Endre periodisering», «Pauseuke anbefalt», «Eskalering til hovedcoach», «Plan trenger ny fase» |
| Agent | Liten badge: «Periodisering-agent» / «Deload-agent» / «Escalation-agent» |
| Tidsstempel | Relativt: «for 8 minutter siden», JetBrains Mono |
| Aksjoner | 3 knapper: `Aksepter` (primary), `Avslå` (secondary), `Detaljer →` (ghost) |

## KPI-strip (4 kort)

1. Venter: 7 (3 urgent, 2 warning, 2 info)
2. Godkjent siste 7d: 23
3. Avslått siste 7d: 4
4. Snitt responstid: 2t 14m

## Filter-bar — UNIKT

- Søk: «Søk spiller eller action»
- Chip: Severity (Info / Warning / Urgent)
- Chip: Agent (Periodisering / Deload / Escalation)
- Chip: Spiller (multi-select)
- Sort: Nyeste / Eldste / Severity
- Primary CTA: `Velg flere` → bulk-mode → `BulkApproveModal`
- Sekundær: `Send agent-feedback →` → `AgentFeedbackModal`

## Eksempel-rader (4 første)

| Severity | Spiller | Action | Agent | Tid |
|---|---|---|---|---|
| Urgent | Joachim Tangen | Eskalering til hovedcoach (skade-flagg) | Escalation | for 14 min siden |
| Warning | Markus R Pedersen | Pauseuke anbefalt før Sørlandsåpent | Deload | for 2t siden |
| Warning | Emma Solberg | Endre TEK-volum fra 40% til 28% | Periodisering | i går 16:42 |
| Info | Lina Hellesund | Ny fase klar — «Sommer-toppform» | Periodisering | i går 11:08 |

## Klikkbare elementer

Se `wireframe/audit/coachhq-approvals.md`. UNIKT:

| Element | States |
|---|---|
| Severity-pill | default per severity, pulse-animasjon på Urgent |
| Aksepter-knapp | default, hover, loading (spinner), success (grønn flash + fade-out av rad) |
| Avslå-knapp | default, hover, klikk → inline-textarea «Hvorfor?» med send-knapp |
| Detaljer-knapp | default, hover, klikk → `PlanActionDetailModal` |
| Agent-badge | default, hover (info-popover med agent-beskrivelse) |
| Velg flere | default, klikk → bulk-mode (checkboxes vises på alle rader) |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty (ingen venter):** Stor sentrert «Alt godkjent. Bra jobba!» med Lucide `CheckCircle2` (accent) + sub «Snitt responstid: 2t 14m»
- **Loading:** 5 skeleton-rader
- **Error per rad:** Inline rød tekst «Kunne ikke godkjenne. Prøv igjen.» + retry-link

## Ønsket output fra Claude Design

1. Lyst tema, 7 venter (mix av severity)
2. Mørkt tema, samme
3. Hover-state på Aksepter (én rad)
4. Bulk-mode aktiv: 3 valgt, sticky bar med «Aksepter alle (3)» + «Avslå alle (3)»
5. Empty (alt godkjent)
6. Mobil ≤640px — hver rad blir card, severity-pill øverst, aksjoner stables vertikalt

## Ikke-mål

- Ikke designe `PlanActionDetailModal`, `BulkApproveModal`, `AgentFeedbackModal` (egen pakke — `BulkApproveModal` er allerede planlagt som pakke 20)
- Ikke designe agent-konfig-skjerm
- Ikke designe historikk-view (egen sub-skjerm)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
