# MVP Mini-batches — 14 Claude Design-sesjoner til 69 skjermer i mål

**Status:** Klar for kjøring i Claude Design.

## Hva som ligger her

| Mappe | Mini-batches | Skjermer | Tema |
|---|---|---|---|
| `coachhq/` | 4 (A-D) | 17 | CoachHQ-kjerne |
| `playerhq/` | 3 (A-C) | 15 | PlayerHQ-kjerne |
| `modaler/` | 5 (A-E) | 27 | Alle modaler |
| `../redesign-arketype-e/` | 2 (A-B) | 10 | Redesign av broken live/agent-skjermer |
| **TOTAL** | **14 mini-batches** | **69 skjermer** | **MVP komplett** |

## Anbefalt rekkefølge

| Dag | Mini-batch | Tema | Forventet tid |
|---|---|---|---|
| 1 | coachhq-A | Plan-management (360-profil, Plan-builder, Plan-detalj/edit/templates) | 60 min |
| 1 | coachhq-B | Operative dashboards (Daglig brief, Facilities, Analytics-v2, Audit, Reports) | 60 min |
| 2 | coachhq-C | Kalender + lister (Kalender, Kapasitet, Lag-snitt, Meldinger, Oppfolgingsko) | 60 min |
| 2 | coachhq-D | Spesial (Talent + Spiller-detalj light) | 30 min |
| 3 | playerhq-A | Mål-data (Baner, Mal-detalj, Leaderboard, Test-detalj, TrackMan-analyse) | 60 min |
| 3 | playerhq-B | Coach-samhandling (Coach-detalj, Coaching-planer, Coach-notes, Notater-detalj) | 60 min |
| 4 | playerhq-C | Wizards + kalender (Ny-okt-wizard, Onskeligokt, Compose, Tren-kalender, Treningsdetalj) | 60 min |
| 4 | modal-A | Plan-modaler (7 stk) | 60 min |
| 5 | modal-B | Live Session 2-4 (3 stk) | 30 min |
| 5 | modal-C | Booking-modaler (4 stk inkl. 2 nye) | 45 min |
| 6 | modal-D | Round/Stats/Agent (6 stk inkl. 2 nye) | 60 min |
| 6 | modal-E | Social/Tier/Other (7 stk inkl. 4 nye) | 60 min |
| 7 | redesign-A | Live Session redesign (5 skjermer) | 60 min |
| 7 | redesign-B | Agent/Pipeline redesign (5 skjermer) | 60 min |

**Anslått total: 13-14 timer Claude Design-arbeid over 7 dager** (2-3 mini-batches per dag).

## Per mini-batch — slik gjør du

### Steg 1: Start ny Claude Design-sesjon

Last opp 4 systemfiler **én gang per sesjon**:

1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. **Alle 20 .woff2-filer** fra `wireframe/brain/for-claude-design/fonts/`
4. **`wireframe/design-batches/redesign-arketype-e/felles-instruks.md`** ← KRITISK anti-state-katalog-regel

Bekreft: "Designsystem + felles-instruks lastet. Bekreft at du har lest."

### Steg 2: Last opp mini-batch-filer

Åpne aktuell mini-batch-mappe (eks. `mvp/coachhq/`):

1. Last opp `coachhq-A.md` (spec)
2. Last opp HTML-vedleggene listet i `coachhq-A-vedlegg.txt` (5-10 stk)

### Steg 3: Lim inn prompten

Åpne `coachhq-A-prompt.md`, kopier hele PROMPT-blokken, lim inn som første melding.

### Steg 4: Generer

Claude Design genererer alle 5 skjermer i mini-batchen. Per skjerm:
- Sjekk at innholdet er konkret (Markus, Anders, 12,4, mai 2026)
- Sjekk at det er ÉN skjerm per HTML (ikke captioned mini-mockups)

### Steg 5: Lim design-link tilbake

For hver godkjent skjerm: kopier design-link og lim tilbake til Claude Code (meg). Jeg verifiserer og oppdaterer tracker.

## Felles-instruks — anti-state-katalog

`redesign-arketype-e/felles-instruks.md` lastes opp i HVER session. Den sier eksplisitt:

> Generer ÉN produksjons-skjerm per HTML-fil i full bredde (1440px+).
> Aldri "state-katalog" med flere mini-mockups på samme side.
> Hvis spec ber om flere states, lever som separate HTML-filer.

Dette forhindrer at vi får 60 % broken-leveranser igjen.

## Hvis noe går galt

Hvis en mini-batch leverer >2/5 broken-skjermer (state-katalog, generic placeholder-tekst, manglende konkretisering):
1. Si fra til meg
2. Vi bytter til **Plan B: direkte React-generering med Claude Code** (samme som `/hub-v2`-piloten)

Beslutning gjøres etter første mini-batch (coachhq-A).

## Etter alle 14 mini-batches er APPROVED

Klart for React-implementering i:
- `src/app/admin/*` (CoachHQ-skjermer)
- `src/app/portal/*` (PlayerHQ-skjermer)
- `src/components/modals/*` (alle modaler)
- `src/app/live/*` (redesignede live/agent-skjermer)

Claude Code bygger pixel-perfekt React fra de godkjente Claude Design-skjermene.

---

**Klar for kjøring nå.** Start med `coachhq/coachhq-A` — åpne `coachhq-A-prompt.md` og følg stegene over.
