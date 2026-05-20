# PlayerHQ Hjem — Status

Sist verifisert: 2026-05-20

## Sammendrag

`page.tsx` (~1100 linjer) er **solid** og følger AK Golf-prinsippene v2.
Ingen oppgradering nødvendig i denne iterasjonen.

## Hva siden inneholder

| Seksjon | Komponent | Notat |
|---|---|---|
| Hero med datostempel | `Hero` | Inter Tight + italic på hilsen, profil-avatar, HCP og klubb |
| Voice-memo varsel | `CoachAnalysisBanner` | Vises kun når siste opptak har AI-analyse |
| Quick actions | `QuickActions` | Coaching-credits, åpen sesjon, prio |
| KPI-strip | `KpiStrip` | 4 kort: snittscore (gradient), SG, streak (14d), pyramide-mini |
| Pending plan-actions | `PlanActionsCard` | Vises kun ved actions |
| Dagens fokus | `DagensFokus` | Sesjons-card med pyramide-aksent og start-CTA |
| Pyramide-progresjon | `PyramideProgresjon` | 5 SVG-ringer (FYS/TEK/SLAG/SPILL/TURN), Pro-gated |
| SG-fordeling | `SgFordeling` | 4 SG-områder med bar-visualisering, Pro-gated |
| Sist registrert | `SistRegistrert` | Siste 5 hendelser (runder, økter, tester) |
| Kommende turneringer | `KommendeTurneringerCard` | Hentes per spiller |
| Coach-melding | `CoachMelding` | Dark banner med italic-quote |

## Designsystem-sjekkliste

- [x] Inter + Inter Tight + JetBrains Mono via `font-sans`/`font-display`/`font-mono`
- [x] Italic Inter Tight på hero-h1 og dagens-fokus-tittel
- [x] Tokens via Tailwind-utilities (ingen hardkodede hex)
- [x] Lucide-ikoner kun, stroke 1.75 - 2
- [x] Ingen emojier i UI
- [x] Norsk bokmål
- [x] Rolle-redirect (COACH/ADMIN -> /admin, GUEST -> /admin/calendar)

## Hva som kunne vært bedre (ikke prioritert nå)

- Hero kunne fått "Eksporter PDF / Del / Sammenlign"-actions tilsvarende `/portal/statistikk`
- HCP-mini-trendgraf direkte i KPI-strip (nå kun snittscore-tall)
- 3 mål-trackers kunne erstattet eller komplementert `PlanActionsCard`
- Kalender-preview (neste 3 kommende) har egen card men kunne vært tettere på hero

Disse er ikke kritiske gap — siden fungerer som hub for hele PlayerHQ.

## Relaterte filer

- `src/app/portal/page.tsx` — selve siden
- `src/lib/dashboard-data.ts` — datalast
- `src/components/portal/quick-actions.tsx` — quick-actions widget
- `src/components/portal/plan-actions-card.tsx` — pending actions
- `src/lib/pyramide.ts` + `src/lib/sg.ts` + `src/lib/streak.ts` — domene-helpers
