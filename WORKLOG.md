# WORKLOG — AK Golf HQ

> Kronologisk oversikt over arbeid utført per sesjon.
> Nyeste øverst.

---

## 2026-06-10 — AgencyOS Fase 3: desktop-fasit-paritet (design/agencyos)

**Branch:** `design/agencyos` · Pulje A–D ferdig (20 skjermer, 0 avvik via kritiker-gate), Pulje E bygges.

### KOORDINERING → PlayerHQ-sporet (design/komplett) — globals.css er endret

Fire delte endringer som påvirker portal-flatene ved merge:
1. **`* { border-color }` flyttet inn i `@layer base`** — den lå unlayered og overstyrte ALLE
   border-fargeklasser (border-primary, border-accent, …) i hele appen. Nå virker de.
   Portal-kode som har border-fargeklasser vil vise dem for første gang.
2. **`input/textarea/select { font-size:16px }` flyttet inn i `@layer base`** — samme mekanisme;
   tekststørrelse-utilities på inputs virker nå (iOS-zoom-vernet består som base-default).
3. **`.dark`-tokens satt til fasit-paletten** (success #56C59A, info #84A9FF, border #2B4F42,
   secondary/muted = card, muted-fg #9CA39E, destructive #F2908C) — påvirker kun mørke flater (admin).
4. **Nye chip/tint-tokens i @theme** (--color-chip-*, --color-alert-coral, coach-sidebar-justeringer).

→ PlayerHQ bør re-screenshotte sine 5 godkjente mobilskjermer etter merge (særlig pga. 1 og 2).
Demo-databasen: coach-demo-data ligger nå på EGEN Øyvind (oyvind-rohjan@stall.akgolf.test) —
screentest@akgolf.test er verifisert urørt (en tidlig lekkasje ble reversert samme dag).

---

## 2026-05-16 — Fase 2: Admin-konsolidering

**Branch:** `feat/admin-konsolidering`

### Fase 2.1 — Hub + AgencyOS-fusjon
- `src/app/admin/page.tsx` — ren redirect til `/admin/agencyos`
- `src/components/admin/sidebar.tsx` — fjernet "AgencyOS"-oppføring, omdøpt rute til "Hub" som peker til `/admin/agencyos`
- Resultat: én "Hub"-oppføring i sidemenyen, AgencyOS-utseendet er nå Hub

### Fase 2.2 — Spillere + Trener-tavle-fusjon
- 🆕 `src/components/admin/spillere-tabs.tsx` — tab-bar [Tabell | Tavle]
- `src/app/admin/elever/page.tsx` — `<SpillereTabs aktiv="tabell" />` lagt til
- `src/app/admin/board/page.tsx` — `<SpillereTabs aktiv="tavle" />` lagt til, eyebrow oppdatert til "Tavle"-modus
- `src/components/admin/sidebar.tsx` — fjernet "Trener-tavle"-oppføring; "Spillere" peker til `/admin/elever` med tab-toggle
- Resultat: én "Spillere"-oppføring, brukeren kan veksle mellom Tabell og Tavle med tab

### Fase 2.3 — Mapbox på anlegg
- `prisma/schema.prisma` — `Location` utvidet med `latitude` + `longitude` (begge nullable)
- 🆕 `prisma/migrations/20260516000004_location_coords/migration.sql`
- `npm install mapbox-gl @types/mapbox-gl`
- 🆕 `src/components/admin/anlegg-mapbox.tsx` — klient-komponent som:
  - Bruker `mapboxgl` med lyst light-v11-style
  - Faller tilbake til "token mangler"-placeholder hvis `NEXT_PUBLIC_MAPBOX_TOKEN` ikke er satt
  - Henter koordinater fra DB; faller tilbake til navn-basert mapping (Fredrikstad, Drøbak, Miklagard, etc.)
  - Markers med popup (navn, adresse)
  - Klikk på marker scroller til tilsvarende LocationCard via `data-loc-id`
- `src/app/admin/anlegg/page.tsx` — erstattet `MapStub` med `<AnleggMapbox locations={…} />`, fjernet `MapStub`-funksjonen
- Klar når token legges inn

### Verifikasjon
- `npx tsc --noEmit` — 0 feil
- Visuelt verifisert: /admin redirecter til /admin/agencyos, "Hub" i meny, Tabell/Tavle-toggle på Spillere-sidene, Mapbox-placeholder vises på /admin/anlegg

### Commit
`feat: sprint 2 — admin-konsolidering (Hub, Spillere, Mapbox)`


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
