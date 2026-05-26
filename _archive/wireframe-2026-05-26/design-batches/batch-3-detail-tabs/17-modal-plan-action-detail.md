# AK Golf Platform — Modal — PlanActionDetailModal

## Identitet

- **Type:** Modal (sentrert, 720px bred — har mer innhold enn vanlig confirm)
- **Åpnes fra:** Approvals-list `Detaljer →` · Plan-detalj agent-historikk · Spiller-detalj agent-strip · PlayerHQ treningsplan agent-card
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-action-detail.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Detaljvisning av én konkret agent-anbefaling med full begrunnelse. Brukes når coach (eller spiller) trenger å forstå hvorfor agenten foreslår noe før de godkjenner. Inneholder: konteksten, agentens analyse, foreslått endring (diff), forventet effekt, konfidens-score, og 3 handlingsknapper (Godkjenn / Avvis / Rediger).

## Layout

### Header (modal-top)
- Severity-pill: `Urgent` (destructive med pulse) / `Warning` (amber) / `Info` (muted)
- Tittel: `Pauseuke anbefalt før Sørlandsåpent` (Geist 20px)
- Spiller-mini: avatar + navn + kategori
- `×`-lukk høyre

### Body (3 seksjoner)

#### 1. Kontekst (12-col)
*"Markus har trent 14 dager på rad uten pause. Adherence 91 %, men SG-trend flater ut siste 5 dager."*
- Liten data-tabell: Volum siste 4u / Pulsdata / SG-trend / Søvn (hvis koblet)

#### 2. Foreslått endring (diff-style, 12-col)
- **Før:** Uke 22 — TEK 4 økter, FYS 3 økter
- **Etter:** Uke 22 — TEK 1 økt (lett), FYS 0 økter, fri 6 dager
- Diff visualisert: rød strek-gjennom på "før", grønn på "etter"

#### 3. Forventet effekt (12-col)
- Bullet-points med Lucide `TrendingUp`-ikoner:
  - "Reduser tretthet før peak"
  - "+0,3 SG på første turneringsdag (basert på 12 lignende casegrupper)"
  - "Senke skadrisiko fra 14 % til 4 %"

#### 4. Konfidens-bar (12-col)
- Horizontal bar: `87 % konfidens` med Lucide `BarChart3`
- "Basert på 412 lignende sesong-cases siste 3 år"
- Link: `Se agent-modell-info →` (åpner AgentModelInfoModal)

### Footer (sticky)
- `Avvis` (ghost, venstre)
- `Rediger forslag` (secondary, midt)
- `Godkjenn` (lime CTA, høyre)

## States

| State | Beskrivelse |
|---|---|
| Default | Pre-fyllt med agent-anbefaling |
| Loading | Skeleton 3 seksjoner |
| Avvis-state | Inline tekstarea "Hvorfor avslår du?" + `Send avslag` |
| Godkjent-state | Success-flash på modal + auto-close 1,5s |
| Edit-state | Bytter til redigerbart diff-view (egen modal-versjon) |
| Pulse på severity-pill | Urgent (destructive) pulserer |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| `Avvis`-knapp | default, hover, klikk → inline-avvis-form |
| `Rediger`-knapp | default, hover, klikk → bytter til EditAgentSuggestionModal |
| `Godkjenn`-knapp | default, hover, loading (spinner), success-flash |
| `Se agent-modell-info →` | default, hover (underline) |
| Diff-blokk | default, hover (highlight rad) |

## Eksempel-data

- **Action:** Pauseuke anbefalt før Sørlandsåpent
- **Spiller:** Markus Roinås Pedersen
- **Severity:** Warning
- **Agent:** Deload-agent v2.4
- **Konfidens:** 87 %
- **Forventet effekt:** +0,3 SG, -10 % skadrisiko

## Ønsket output fra Claude Design

1. Lyst tema, default Warning-anbefaling
2. Mørkt tema, samme
3. Urgent-state (destructive severity med pulse)
4. Avvis inline-form aktivert
5. Godkjent success-flash
6. Loading-state
7. Mobil ≤640px — modal full screen, footer sticky

## Ikke-mål

- Ikke designe `EditAgentSuggestionModal`, `AgentModelInfoModal` (egne pakker)
- Ikke designe approvals-list (i batch 2)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
