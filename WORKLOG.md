# WORKLOG — AK Golf HQ

> Kronologisk oversikt over arbeid utført per sesjon.
> Nyeste øverst.

---

## 2026-05-16 — Fase 1: Sprint 1 (rask QoL + UI-pussing)

**Branch:** `main`

### Fase 1.1 — Tekst-endringer
- `src/app/portal/mal/runder/ny-runde-modal.tsx` — `Felt label="Skår"` → `"Score"`
- `src/app/portal/tren/tester/page.tsx` — fane "NGF-standard" → "Team Norway"
- `src/app/portal/meg/utstyrsbag/page.tsx` — `Min utstyrsbag` → `Mitt utstyr`
- `src/app/portal/coach/layout.tsx` — sub-nav norske tegn: "Ovelser" → "Øvelser", "Onske om okt" → "Ønske om økt", "Book okt" → "Book økt"
- `src/app/portal/coach/ovelser/ny/page.tsx` + `[id]/rediger/page.tsx` — eyebrow/titleItalic norsk-tegn-fiks

### Fase 1.2 — Profilbilde-flyt
Verifisert at `src/components/shared/avatar-upload.tsx` + `src/lib/storage/avatar.ts` virker. Anders kan klikke avataren på `/portal/meg` og laste opp eget bilde via UI.

### Fase 1.3 — Test-sortering + filter
- 🆕 `src/components/portal/tester-liste.tsx` — ny klient-fil med:
  - Sortering TEK → SLAG → FYS → SPILL → TURN (custom rekkefølge)
  - Filter: Kategori (Alle/TEK/SLAG/FYS/SPILL/TURN), Status (Alle/Aldri tatt/Tatt), Sortér (Kategori/Sist tatt/Navn)
  - Søkefelt med onChange + tekst-match
- `src/app/portal/tren/tester/page.tsx` — server-side henter data, sender til klient-komponent som serialiserbare props

### Fase 1.4 — Utvidede SG-felter
- `prisma/schema.prisma` — `Round` utvidet med 16 nye nullable Float-felter (sgTee, sgApp200–50, sgChip/Pitch/Lob/Bunker, sgPutt0_3–40plus)
- `prisma/migrations/20260516000003_add_granular_sg/migration.sql` — manuell SQL-migrasjon
- `src/app/portal/mal/runder/actions.ts` — `RoundInput` utvidet med alle 16 felter
- `src/app/portal/mal/runder/ny-runde-modal.tsx` — fire kollapsbare under-grupper: Tee / Approach (per distanse) / Nærspill (Chip/Pitch/Lob/Bunker) / Putt (per distanse)

### Fase 1.5 — Gruppe-snarveier i kalender
- 🆕 `src/components/admin/gruppe-snarveier.tsx` — server-komponent som henter `Group`-modellen og rendrer chips med lenke til `/admin/elever?group={id}`. Fallback til hardkodet WANG/GFGK Junior.
- `src/app/admin/calendar/page.tsx` — erstattet `PyramideLegendCard` med `<GruppeSnarveier>` i sidebar. Fjernet `PyramideLegendCard`-funksjonen.

### Verifikasjon
- `npx tsc --noEmit` — 0 feil
- Lint — ingen nye feil i endrede filer (pre-existing problemer beholdt)
- Visuelt verifisert: Team Norway-fane, sortering, filter, "Mitt utstyr", Score-label, utvidet SG-modal, GruppeSnarveier i admin-kalender

### Commit
`feat: sprint 1 — tekst-pussing, test-filter, granulær SG, gruppe-snarveier`

---

## 2026-05-16 — Fase 0: Bug-fiks på `/portal/coach/ovelser`

**Branch:** `feature/coachhq-rebrand`

Sentry-feil `Event handlers cannot be passed to Client Component props.` Server Component (`page.tsx`) sendte inline JSX med `onClick`-handlers som `actions`-prop til `<ExerciseCard>` (client).

Løst ved å lage `src/components/portal/exercise-card-actions.tsx` (client) som tar serialiserbar string-id og bygger event handlers internt. Norsk-tegn-fiks i samme fil.

Commit: `fix: client component boundary på ovelser-siden`

---
