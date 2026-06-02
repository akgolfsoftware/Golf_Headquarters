# Oppfølging K10 — Prisma-modeller for drill-direktiv, mestring og rating

Opprettet 2026-06-02 fra MVP-auditen. **Status: krasj-guardet, ikke ferdig.**

## Bakgrunn

Tre features har ferdig backend-kode (server actions) og er wiret til UI, men
**Prisma-modellene de skriver til finnes ikke i schemaet**. Inntil migrasjonen er
kjørt returnerer actionene en ryddig feil ("Denne funksjonen aktiveres i en
kommende oppdatering.") i stedet for å krasje. Funksjonene virker først når
modellene + migrasjonen er på plass.

Berørte features:
1. **Coach-drill-direktiv** (PIN/BLOCK/PRIORITER en drill for en spiller) — CoachHQ
2. **Drill-mestrings-logg** (spiller logger mestrings-økt med csScore) — PlayerHQ
3. **Drill-rating** (spiller rater en drill: aha/utfordrende/...) — PlayerHQ

## Modeller som må legges til i `prisma/schema.prisma`

Felt-shapene er allerede fastlåst av koden — følg disse eksakt.

### CoachDrillDirectiv
Fra `src/app/admin/spillere/[id]/actions.ts` (`lagreCoachDirektiv`):
- `id` String @id @default(cuid())
- `coachId` String — relasjon til User (coach)
- `userId` String — relasjon til User (spiller)
- `drillId` String — relasjon til ExerciseDefinition
- `type` enum `PIN | BLOCK | PRIORITER` (lag enum `DrillDirektivType`)
- `kommentar` String?
- `gyldigTil` DateTime?
- `createdAt` / `updatedAt`
- **Unik-constraint:** `@@unique([coachId, userId, drillId, type])` (navn: `coachId_userId_drillId_type`)

### DrillMestringsLogg
Fra `src/app/portal/drills/[id]/actions.ts` (`registrerMestringsOkt`):
- `id` String @id @default(cuid())
- `drillId` String — relasjon til ExerciseDefinition
- `userId` String — relasjon til User
- `csScore` Float? (nullable)
- `kommentar` String?
- `mestret` Boolean
- `dato` DateTime

### DrillRating
Fra `src/app/portal/drills/[id]/actions.ts` (`rateDrill`):
- `id` String @id @default(cuid())
- `drillId` String — relasjon til ExerciseDefinition
- `userId` String — relasjon til User
- `rating` Int (1–5)
- `type` String ("aha" | "utfordrende" | "passe" | "kjedelig" | "for_vanskelig")
- `kommentar` String?
- `kategori` String? (spillerkategori fra hcp)

## RLS — OBLIGATORISK i samme migrasjon

Per prosjektets RLS-arkitektur (deny-all + Prisma service-role): alle tre nye
tabeller MÅ få `ENABLE ROW LEVEL SECURITY` i samme migrasjon, ellers lekker de via
PostgREST. Ingen policies trengs (Prisma bruker service-role), men RLS må være på.
Verifiser med Supabase advisor etterpå (0 ERROR).

## Etter migrasjonen — fjern guardene (15 steder)

Når `prisma generate` har laget typene, fjern disse (de blir overflødige og
`@ts-expect-error` vil da selv feile som "unused directive"):

**`src/app/admin/spillere/[id]/actions.ts`:**
- `coachDirektivModellKlar()` + `MODELL_IKKE_KLAR` (modul-helper)
- 2 `if (!coachDirektivModellKlar()) return ...`-guards
- 3 `// @ts-expect-error – CoachDrillDirectiv ...`-linjer

**`src/app/portal/drills/[id]/actions.ts`:**
- `drillModellKlar()` + `MODELL_IKKE_KLAR` (modul-helper)
- 2 `if (!drillModellKlar(...)) return ...`-guards
- 2 `// @ts-expect-error – DrillMestringsLogg/DrillRating ...`-linjer

## Verifikasjon

```bash
npx prisma validate && npx prisma generate
npx tsc --noEmit        # @ts-expect-error skal nå være borte
npm run build
```
Test deretter: opprett direktiv (CoachHQ), logg mestrings-økt + rate drill (PlayerHQ).
