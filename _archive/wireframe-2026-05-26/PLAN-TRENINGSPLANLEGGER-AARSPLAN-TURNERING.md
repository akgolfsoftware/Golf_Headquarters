# Plan: Treningsplanlegger + Årsplan + Turneringsplanlegger

Generert 2026-05-18. Etter 9 bølger redesign + 3-visninger-leveranse.

## Kontekst

Tre relaterte system må knyttes sammen:
1. **Treningsplanlegger** (`TrainingPlan`) — eksisterer, har 3 visninger (kanban/tidslinje/split)
2. **Årsplan med periodisering** (`SeasonPlan` + `PeriodBlock`) — modell finnes, UI er delvis bygget
3. **Turneringsplanlegger** (`Tournament` + `TournamentEntry`) — modell finnes, men **databasen er tom**

Brukerens behov: importere turneringer fra ekstern kilde, slik at de vises i årsplan-periodisering og spilleren kan melde seg på direkte.

---

## Status: hva finnes per i dag

### Database (Prisma)

| Modell | Eksisterer | Felter |
|---|---|---|
| `TrainingPlan` | ✓ | id, userId, name, startDate, endDate, sessions[] |
| `SeasonPlan` | ✓ | id, userId, year, name, startDate, endDate |
| `PeriodBlock` | ✓ | id, seasonPlanId, lPhase (GRUNN/SPESIAL/TURNERING), startDate, endDate, focus, weeklyVolMin/Max |
| `Tournament` | ✓ | id, name, startDate, endDate, courseId, format, notes — **tom tabell** |
| `TournamentEntry` | ✓ | id, userId, seasonPlanId?, tournamentId?, manualName?, category, priority |
| `TournamentResult` | ✓ | id, tournamentId, userId, position, score |

### Ruter

| Rute | Status |
|---|---|
| `/admin/plans` + 3 views | ✓ Komplett |
| `/admin/plans/[planId]` | ✓ Komplett |
| `/admin/plans/new` (wizard) | ✓ Komplett |
| `/admin/plans/templates` | ✓ Komplett |
| `/admin/tournaments` | ✓ Liste eksisterer (men tom DB) |
| `/admin/tournaments/[id]` | ✓ Detalj eksisterer |
| `/admin/tournaments/new` | ? Sjekk |
| `/portal/tren/aarsplan` | ✓ Eksisterer (sjekk innhold) |
| `/portal/tren/turneringer` | ✓ Eksisterer |

### Gap

1. **Tournament-tabellen er TOM** — ingen seed eller import-script
2. **Ingen kobling Tournament → SeasonPlan** visuelt — periode-blokker viser ikke turneringer som "pin"
3. **Årsplan-UI** mangler full periodiserings-editor (drag-drop, fase-bytte, dato-justering)
4. **Importmodul** for turneringer eksisterer ikke

---

## Fase 1 — Importer turneringer (1-2 timer)

**Mål:** Fyll `Tournament`-tabellen med faktiske 2026-turneringer.

### Kilde-alternativer (velg én)

| Kilde | Pro | Con |
|---|---|---|
| **GolfBox API** (norsk) | Offisielle data, oppdateres | Krever API-nøkkel, kompleks auth |
| **NGF terminliste** (HTML/PDF scrape) | Gratis, offentlig | Skjør, krever vedlikehold |
| **Manuell CSV-import** | Full kontroll, enkel | Krever manuelt arbeid hver sesong |
| **Hard-coded seed** | Raskest å starte | Må oppdateres manuelt |

**Anbefaling: CSV-import**
- Lag `scripts/import-tournaments.ts` som leser fra `data/tournaments-2026.csv`
- Format: `name,startDate,endDate,courseId?,format,category,priority,notes`
- Coach kan eksportere fra GolfBox/NGF til CSV én gang per sesong
- Senere kan dette utvides til scraper hvis nødvendig

### Implementering

```typescript
// scripts/import-tournaments.ts
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import fs from "fs";

async function main() {
  const csv = fs.readFileSync("data/tournaments-2026.csv", "utf-8");
  const rows = parse(csv, { columns: true });
  for (const row of rows) {
    await prisma.tournament.upsert({
      where: { id: row.id || `t-${row.name}-${row.startDate}` },
      create: { ...row },
      update: { ...row },
    });
  }
  console.log(`✓ Importerte ${rows.length} turneringer`);
}
main();
```

### Initial CSV (50-100 turneringer 2026)

Lag `data/tournaments-2026.csv` med:
- Major norske turneringer (Sør-, Vestlandet, NM, junior NM)
- Lokale klubb-turneringer (Bossum, Onsøy, Borre, Halden, GFGK)
- Internasjonale junior-events (Faldo, US Kids, Audi quattro Tour)
- Mesterskap-runder (a-rekke, b-rekke, klasse-snitt)

Eller: bruk seed-script med 30 typiske 2026-turneringer hard-coded for å komme i gang.

### CLI-kommando

```bash
npx tsx scripts/import-tournaments.ts
```

Legg til som npm-script i `package.json`: `"db:import-tournaments": "tsx scripts/import-tournaments.ts"`

---

## Fase 2 — Aktiver Turneringsplanlegger UI (2-3 timer)

**Mål:** `/admin/tournaments` blir aktiv med ekte data + ny `/admin/tournaments/new`-flyt.

### Endringer

1. **`/admin/tournaments/page.tsx`** — allerede leser fra `prisma.tournament`. Verifiser at den viser data riktig når DB er fylt.

2. **`/admin/tournaments/new/page.tsx`** — bygg ny rute hvis ikke finnes:
   - Form: navn, dato, slutt-dato, kurs (CourseDefinition-velger), format (STROKE/MATCH/STABLEFORD/OTHER), notater
   - Action: `prisma.tournament.create()`

3. **`/admin/tournaments/[id]/page.tsx`** — utvid med:
   - Påmeldingsliste (`TournamentEntry` per spiller)
   - Resultater-tabell (`TournamentResult`)
   - "Meld på spillere"-modal
   - Knapp: "Lag periode-blokk i alle aktive årsplaner" (skaper PeriodBlock med lPhase=TURNERING rundt turnering)

4. **Filter/søk:** legg til datofilter (denne mnd / neste mnd / hele sesongen) og format-filter

### Nye komponenter

- `src/components/coachhq/tournament-entry-modal.tsx` — meld på spillere
- `src/components/coachhq/tournament-card.tsx` — kompakt visning til lister

---

## Fase 3 — Bygg ut Årsplan med periodisering (3-4 timer)

**Mål:** `/portal/tren/aarsplan` blir en full periodiserings-editor med turnerings-pins.

### Layout (inspirert av `wireframe/design-package/project/01-aarsplan.html`)

```
┌─────────────────────────────────────────────────────────────┐
│ Årsplan 2026 — Markus Røinas-Pedersen               [Rediger]│
│ HCP 4,2 · Sesong: 1. apr – 31. okt                          │
├─────────────────────────────────────────────────────────────┤
│ ░░░░░░░ GRUNN ░░░░░░  ▓▓▓▓ SPESIAL ▓▓▓▓  ████ TURNERING ████│
│  Jan Feb Mar │ Apr Mai Jun │ Jul Aug Sep │ Okt Nov Des      │
│              │             │ ▲    ▲   ▲ │                  │
│              │             │ NM   KM  KM│                  │
└─────────────────────────────────────────────────────────────┘
```

### Komponenter å bygge

1. **`SeasonPeriodBar.tsx`** — horisontal tidslinje, 12 mnd, fase-blokker som farget rektangel
2. **`TournamentPin.tsx`** — pin på tidslinjen, klikk → detalj-popover
3. **`PeriodEditor.tsx`** — modal for å redigere PeriodBlock (dato, fase, fokus, weeklyVolMin/Max)
4. **`ToggleTrainingOverlay.tsx`** — overlay av TrainingPlan-økter på samme tidslinje

### Data-flyt

```typescript
// page.tsx
const seasonPlan = await prisma.seasonPlan.findUnique({
  where: { userId_year: { userId, year: 2026 } },
  include: {
    periodBlocks: { orderBy: { startDate: "asc" } },
    tournamentEntries: {
      include: { tournament: true },
      orderBy: { tournament: { startDate: "asc" } },
    },
  },
});

// Hvis ingen seasonPlan: "Opprett årsplan 2026"-CTA → wizard
```

### Auto-generering av perioder

Når en ny SeasonPlan opprettes, foreslå standard 3-faser:
- **GRUNN:** apr-mai (8 uker)
- **SPESIAL:** jun-jul (8 uker)
- **TURNERING:** aug-okt (12 uker)

Coach kan overstyre/justere senere.

---

## Fase 4 — Integrasjon: Treningsplan ↔ Årsplan ↔ Turnering (2-3 timer)

**Mål:** De tre systemene snakker sammen.

### Datakobling

1. **TrainingPlan kan referere til SeasonPlan** — legg til `seasonPlanId String?` på TrainingPlan-modellen (krever migrasjon)

2. **TournamentEntry kobler til SeasonPlan** — allerede på plass

3. **PeriodBlock med lPhase=TURNERING** — auto-genereres rundt store turneringer i SeasonPlan

### Visuell integrasjon

- **`/admin/plans/[planId]` (plan-detalj):** Vis "Tilhører årsplan 2026" hvis koblet, med lenke
- **`/admin/plans?view=tidslinje` (Gantt):** Vis turnerings-pins (▲) over plan-baren for hver spiller
- **`/portal/tren/aarsplan`:** Vis aktive treningsplan-blokker som horisontal stripe under periode-baren
- **`/admin/tournaments/[id]`:** Vis alle påmeldte spillere + deres aktive treningsplan

### Nye server actions

- `koblePlanTilAarsplan(planId, seasonPlanId)` — koble eksisterende plan
- `genererPeriodeFraTurnering(tournamentId, seasonPlanId)` — auto-create PeriodBlock
- `meldPaSpiller(tournamentId, userId, priority)` — TournamentEntry

---

## Fase 5 — UI for ny treningsplanlegger som ÅRSPLAN-aware (2 timer)

**Mål:** Plan-bygger wizard får et nytt valgfritt steg for å koble til årsplan.

### Endring i wizard

Legg til **steg 0** (før Spiller-steg):
- "Skal denne planen være del av en årsplan?" Ja/Nei
- Hvis ja: velg eksisterende SeasonPlan eller opprett ny
- Hvis nei: standalone-plan

Eller: gjør det som **valgfri kobling** på steg 6 (Bekreft):
- "Koble til [seasonPlanId] årsplan" toggle

### Visning

I `/admin/plans/[planId]` legg til seksjon "Årsplan-kontekst":
- Hvilken fase planen ligger i (GRUNN/SPESIAL/TURNERING)
- Kommende turneringer i samme periode
- Fokus fra PeriodBlock som overstyring

---

## Implementeringsrekkefølge (10-14 timer total)

```
Fase 1   Importer turneringer (CSV + script)        1-2 timer
Fase 2   Aktiver /admin/tournaments UI              2-3 timer
Fase 3   Bygg ut /portal/tren/aarsplan editor       3-4 timer
Fase 4   Integrasjon mellom de 3 systemene          2-3 timer
Fase 5   Wizard-utvidelse (årsplan-kobling)         2 timer
```

---

## Beslutninger Anders må ta

1. **Turnerings-kilde:** Manuell CSV-import (anbefalt) eller GolfBox-API eller hard-coded seed?
2. **Hvor får jeg CSV/data fra?** Har du en eksport fra GolfBox/NGF jeg kan bruke?
3. **Auto-perioder:** Skal standard 3-faser (GRUNN/SPESIAL/TURNERING) være default, eller alltid manuell?
4. **Migrasjon:** OK å legge til `seasonPlanId String?` på TrainingPlan? (Prisma migrate dev)
5. **Wizard-steg:** Lagre årsplan-kobling som steg 0 (før spiller) eller steg 6 (bekreft)?

---

## Filer som vil endres

### Nye filer
- `scripts/import-tournaments.ts`
- `data/tournaments-2026.csv` (eller seed-data)
- `src/app/admin/tournaments/new/page.tsx` (hvis mangler)
- `src/components/coachhq/tournament-entry-modal.tsx`
- `src/components/coachhq/tournament-card.tsx`
- `src/components/portal/season-period-bar.tsx`
- `src/components/portal/tournament-pin.tsx`
- `src/components/portal/period-editor.tsx`
- `src/components/portal/season-plan-editor.tsx`

### Endrede filer
- `prisma/schema.prisma` (legge til `seasonPlanId` på TrainingPlan)
- `src/app/admin/tournaments/page.tsx`
- `src/app/admin/tournaments/[id]/page.tsx`
- `src/app/portal/tren/aarsplan/page.tsx`
- `src/app/admin/plans/[planId]/page.tsx` (vis årsplan-kobling)
- `src/components/admin/add-session-wizard.tsx` eller plan-wizard (årsplan-steg)

---

## Verifikasjon

```bash
# 1. Importer turneringer
npm run db:import-tournaments

# 2. Sjekk DB
npx prisma studio  # se Tournament-tabellen er fylt

# 3. Verifiser visning
# - Åpne /admin/tournaments — se liste med turneringer
# - Åpne /portal/tren/aarsplan — opprett årsplan 2026
# - Se turnerings-pins på årsplan-tidslinjen
# - Klikk en pin → detalj
# - Koble plan til årsplan i wizard
# - Se plan-detalj viser "Tilhører årsplan"

# 4. Build
npx tsc --noEmit && npm run build
```

---

## Risiko og avhengigheter

| Risiko | Mitigering |
|---|---|
| Tournament-modell mangler felt (kategori, klubb, etc.) | Sjekk schema før Fase 1, evt. migrasjon |
| GolfBox-format ikke kompatibel | Manuell CSV mapping |
| Mange TournamentEntry per spiller | Indeks på userId allerede på plass |
| Prisma-migrasjon på prod | Test i preview branch først |
| Performance på Gantt med 50+ spillere | Paginere / virtualisere |
