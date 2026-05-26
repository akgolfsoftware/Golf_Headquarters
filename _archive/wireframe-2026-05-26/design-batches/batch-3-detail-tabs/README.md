# Batch 3 — Detail + tabs (Arketype C)

**Antall pakker:** 23 (15 skjermer + 8 tilhørende modaler)
**Status:** Klar for claude.ai/design
**Estimert tid:** 5–7 timer

## Hvorfor denne batchen nå

Arketype C (Detail + tabs) er det andre store mønsteret etter list+filter — det er hva både coach og spiller ser når de klikker fra en liste til "én ting". Spillerprofil, plan-detalj, test-detalj, coach-detalj. Når dette mønsteret er stabilt har vi dekket 90 % av navigasjonstrafikken i plattformen. Modalene som hører hjemme her er dypere drill-ins (RoundDetail, ComparisonModal, EditPlan) — egne pakker i samme batch for kontekst-bevaring.

## Arketype C — felles spec (gjelder alle 15 skjermer)

Disse mønstrene skal være konsistente på tvers av alle detail-skjermer. Vis variasjon i innhold per tab, ikke i layout.

### Layout

```
┌────────────────────────────────────────────────┐
│  Sidebar  │  Breadcrumb (Liste › Navn)         │
│           │  ┌──────────────────────────────┐  │
│           │  │  Header-blokk:               │  │
│           │  │  Avatar (64px) + Navn (H1)   │  │
│           │  │  + Subtittel + 4 stat-pills  │  │
│           │  │  + Primary CTA + Action-meny │  │
│           │  └──────────────────────────────┘  │
│           │  Tab-strip (sticky):               │
│           │  [Aktiv]  Tab 2   Tab 3   Tab 4    │
│           │  ───────                           │
│           │  ┌──────────────────────────────┐  │
│           │  │  Tab-innhold                 │  │
│           │  │  (asymmetrisk grid, bento)   │  │
│           │  │                              │  │
│           │  └──────────────────────────────┘  │
│           │  Sticky bottom action-strip        │
│           │  (når relevant)                    │
└────────────────────────────────────────────────┘
```

### Header-blokk — UNIKT for arketype C

Header er det første en bruker ser når de lander på detail-skjermen. Den fungerer som visittkort + raske aksjoner. Default:

- **Avatar/ikon:** 64px (sirkel for personer, rounded-lg for ting)
- **H1-tittel:** Geist 32px, eller Instrument Serif italic for hero-effekt
- **Subtittel:** muted 14px (rolle, kategori, dato — relevant kontekst)
- **Stat-pills (3–4):** små chips med JetBrains Mono for tall (HCP, %, kr, dato)
- **Primary CTA:** høyre side, eksempel "Send melding", "Start dagens økt"
- **Action-meny `...`:** sekundære handlinger (Eksporter, Rediger, Slett)

### Tab-strip

- Horisontal liste, default 4–7 tabs
- **Aktiv tab:** 2px stripe under tab-tekst (primary), tekst i `foreground`
- **Inaktiv:** muted-foreground, ingen stripe
- **Hover:** subtil bg-shift
- **Sticky** ved scroll — tab-strip flytter til top-edge etter header forsvinner

### Tab-innhold — generelle prinsipper

- **Asymmetrisk grid** (12-col, ikke 3×1 uniform)
- **Bento-card-mønster:** 2 store kort + 3-4 små kort, evt. en bred chart-stripe
- **States per tab:** loading skeleton, empty (med dempet ikon + CTA), error med retry
- **Tab-bytte:** instant (ingen page-reload), tab-state lagret i URL hash

### Stat-rich-cards (kommer igjen i alle detail-skjermer)

- Stor verdi (Geist 32px, tabular-nums)
- Liten label over (muted 12px)
- Sparkline eller delta-indikator under
- Klikk → drill-in til relatert tab eller drawer

### Sticky action-strip

For skjermer med tunge handlinger (plan-edit, coach-detalj):
- Sticky nederst, full bredde minus sidebar
- 1–3 knapper, primary høyre
- Border-top, bg = `background`

### States å designe

| State | Hvor |
|---|---|
| Loading per tab | Skeleton-blokker i samme grid som tab-innhold |
| Empty per tab | Dempet ikon + "Ingen X ennå. Lag din første →" |
| Error per tab | Per-tab-feilmelding med retry-knapp |
| Tab-bytte-animasjon | Crossfade 150ms |
| Header-collapse på scroll | Komprimer header til 56px sticky bar |
| Print/PDF-versjon | Skjul sidebar + tab-strip, vis alt innhold |

### Mobil-versjon

- Header: avatar + tittel stables, stat-pills i horisontal scroll-rad
- Tab-strip: horisontal scroll, sticky
- Tab-innhold: 1-kolonne, alle cards stables
- Sticky action-strip: bunn-festet, full bredde

### Responsive breakpoints

- Desktop: ≥1024px — full 12-col grid, alle tabs synlige
- Tablet: 768–1023px — 8-col grid, tab-strip scroller hvis nødvendig
- Mobil: ≤640px — 1-col, tabs scroll horisontalt

---

## Per-skjerm-pakker (15)

### CoachHQ (6)
1. `01-coachhq-360-profil.md` — 360-spillerprofil med 7 tabs (Pyramide / SG / TrackMan / Tester / Plan / Tournaments / Notater)
2. `02-coachhq-spiller-detalj.md` — Light spillerdetalj (hurtigvisning, 6 tabs)
3. `03-coachhq-plan-detalj.md` — Plan-detalj med 5 tabs (Faser / Økter / Pyramide / Tester / Mål)
4. `04-coachhq-plan-edit.md` — Plan-redigering (5 tabs, inline edit + agent-godkjenning)
5. `05-coachhq-talent.md` — Talent-pipeline (5 tabs, kanban + drag-drop)
6. `06-coachhq-lag-snitt.md` — Lag-sammenligning (5 tabs, matrise + drawer)

### PlayerHQ (9)
7. `07-playerhq-treningsplan.md` — Treningsplan (5 faser, ukens 5 økter)
8. `08-playerhq-treningsdetalj.md` — Post-økt detalj (4 tabs: Sammendrag/Øvelser/Resultater/Notater)
9. `09-playerhq-test-detalj.md` — Test-detalj (Beskrivelse + Resultater + Historikk)
10. `10-playerhq-mal-detalj.md` — HCP-trend detalj med projeksjon
11. `11-playerhq-trackman-analyse.md` — TrackMan-trender (per-kølle, Pro-låst)
12. `12-playerhq-coach-detalj.md` — Coach-info (5 tabs: Om/Mine økter/Meldinger/Notater/Plan)
13. `13-playerhq-coaching-detail.md` — Coaching-plan fra spiller-side (5 tabs)
14. `14-playerhq-notater-detalj.md` — Notat-detalj med kommentar-tråd
15. `15-playerhq-coach-message-compose.md` — Send melding til coach (compose-view)

### Modal-pakker (8) — drill-ins fra detail-skjermer

16. `16-modal-edit-plan.md` — EditPlanModal (åpnes fra plan-detalj `Rediger`)
17. `17-modal-plan-action-detail.md` — PlanActionDetailModal (åpnes fra approvals + plan-detalj)
18. `18-modal-round-detail.md` — RoundDetailModal (åpnes fra runder + 360-profil)
19. `19-modal-round-insight.md` — RoundInsightModal (åpnes fra runde-card)
20. `20-modal-comparison.md` — ComparisonModal (åpnes fra TrackMan-analyse + lag-snitt)
21. `21-modal-message-detail.md` — MessageDetailModal (åpnes fra coach-detalj + meldinger)
22. `22-modal-plan-share.md` — PlanShareModal (åpnes fra plan-detalj `Del`)
23. `23-modal-facility-detail.md` — FacilityDetailModal (åpnes fra lokasjon + booking)

## Slik bruker du hver pakke

Samme oppskrift som batch 1 og 2:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (én gang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Gate

Alle 23 pakker må være `APPROVED` før vi går til batch 4 (Form-flows / wizards).
