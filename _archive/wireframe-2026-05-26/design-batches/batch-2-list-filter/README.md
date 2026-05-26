# Batch 2 — List + filter (Arketype B)

**Antall pakker:** 22 (18 skjermer + 4 tilhørende modaler)
**Status:** Klar for claude.ai/design
**Estimert tid:** 4–6 timer

## Hvorfor denne batchen nå

Arketype B (List + filter) er det mest brukte mønsteret i hele plattformen — dominerer både CoachHQ og PlayerHQ. Når dette mønsteret er stabilt, kan resterende lister i batch 6+ bruke samme grunnmal. Pilot-batch 1 (Dashboard) etablerte estetikken; denne batchen etablerer **interaksjonsmønstre for tabell-data**.

## Arketype B — felles spec (gjelder alle 18 skjermer)

Disse mønstrene skal være konsistente på tvers av alle list-skjermer. Vis variasjon i innhold og kolonner, ikke i layout.

### Layout

```
┌─────────────────────────────────────────────┐
│  Sidebar  │  Hero (italic editorial title)  │
│           ├─────────────────────────────────┤
│           │  KPI-strip (4 kort, valgfritt)  │
│           ├─────────────────────────────────┤
│           │  Filter-bar:                    │
│           │  [Søk] [Chip 1] [Chip 2] [Sort] │
│           │                          [+ Ny] │
│           ├─────────────────────────────────┤
│           │  Tabell / kort-grid             │
│           │  ┌──┬─────────┬─────┬────┬───┐  │
│           │  │  │ navn    │ ... │... │ → │  │
│           │  └──┴─────────┴─────┴────┴───┘  │
│           ├─────────────────────────────────┤
│           │  Pagination eller "Last mer ↓"  │
│           └─────────────────────────────────┘
```

### Kolonner som ALLTID må designes

| Element | States å designe |
|---|---|
| Søk-felt | default, focus, with-text, clear-button, no-results |
| Filter-chip (multi-select) | default, hover, selected, disabled, count-badge |
| Sort-dropdown | default, open, item-hover, item-selected (med pil) |
| Sort-icon på kolonne-header | default, hover, sort-asc, sort-desc |
| Rad | default, hover (subtil bg-shift), selected, klikk → detail |
| Status-pill (per status) | unike farger per status — bruk pyramide-paletten |
| "..."-aksjons-meny per rad | default, hover, popover-open |
| Bulk-checkbox | uvalgt, valgt, partial (hvis grupperinger) |
| "+ Ny X" CTA (primary) | default, hover, active, focus, disabled, loading |
| Pagination | default per side, hover, active page, disabled (forrige/neste) |

### Empty / loading / error / count-states

- **Empty (ingen data ennå):** Stort sentrert område med ikon + "Ingen {ressurs} ennå. Lag din første →" CTA
- **Empty (filter gir 0):** "Ingen treff for filteret. Tilbakestill →"
- **Loading:** 5 grå skeleton-rader
- **Error:** Per-tabell-error med retry
- **Count:** "Viser 12 av 38" eller "12 spillere" etter filter

### Mobil-versjon

- Filter-bar collapser til en "Filter (3) ↓"-knapp som åpner bottom-sheet
- Tabell konverterer til kort (én kort per rad, alle kolonner stables vertikalt)
- Bulk-actions skjules; "..."-meny per rad bevares

### Responsive breakpoints

- Desktop: ≥1024px — full tabell, alle filtre synlige
- Tablet: 768–1023px — tabell med kondenserte kolonner, filtre delvis synlige
- Mobil: ≤640px — kort-layout

---

## Per-skjerm-pakker (18)

### CoachHQ (10)
1. `01-coachhq-plans.html.md` — Treningsplaner (kanban-variant)
2. `02-coachhq-elever.md` — Elever (spillerliste, primary-list)
3. `03-coachhq-approvals.md` — Godkjenninger
4. `04-coachhq-bookings.md` — Bookinger (kalender + liste-toggle)
5. `05-coachhq-sessions.md` — Økter (uke-kalender + pyramide-fokus)
6. `06-coachhq-services.md` — Tjenester
7. `07-coachhq-locations.md` — Lokasjoner (kart + liste)
8. `08-coachhq-team.md` — Coach-team
9. `09-coachhq-groups.md` — Grupper
10. `10-coachhq-tournaments.md` — Turneringer

### PlayerHQ (8)
11. `11-playerhq-ovelser.md` — Øvelses-bibliotek
12. `12-playerhq-tester.md` — Tester
13. `13-playerhq-runder.md` — Runde-historikk (ScoreCard-rader)
14. `14-playerhq-trackman.md` — TrackMan-økter
15. `15-playerhq-baner.md` — Baner (kart + liste)
16. `16-playerhq-coaching-planer.md` — Coaching-planer
17. `17-playerhq-coach-notes.md` — Coach-notater (feed-stil)
18. `18-playerhq-mal-leaderboard.md` — Leaderboard (Pro-låst for Free)

## Modal-pakker (4) — som åpnes fra list-skjermer

19. `19-modal-new-plan.md` — NewPlanModal (åpnes fra plans-list "+ Ny plan")
20. `20-modal-bulk-approve.md` — BulkApproveModal (åpnes fra approvals "Velg flere")
21. `21-modal-log-round.md` — LogRoundModal (åpnes fra runder "+ Logg runde")
22. `22-modal-template-selector.md` — TemplateSelectorModal (åpnes fra plans/maler)

## Slik bruker du hver pakke

Samme oppskrift som batch 1:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (engang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Gate

Alle 22 pakker må være `APPROVED` før vi går til batch 3 (Detail+tabs).
