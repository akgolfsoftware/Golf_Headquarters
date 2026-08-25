# LOOP 1 — Domain + actions

Kilde: `docs/natt/OVERNIGHT-CODING-LOOP.md` (full plan). Workbench-spec: `docs/natt/workbench/`.

## Loop 1 — Domain + persistens + actions (90–120 min)

**Fasitskjermer:** ingen UI ennå. Kontrakt: `store/actions.ts`, `domain/operations.ts`.

**Søk først:** `prisma/schema.prisma` (Session / Plan / Workbench), `app/actions/`, auth-helpers for `coachId`/`playerId`.

**Bygg**

1. Port `types.ts` `operations.ts` `labels.ts` `operations.test.ts` → `src/domain/workbench/`
2. Kjør `operations.test.ts` — alle grønne.
3. Server actions (gjenbruk tabell hvis den matcher; ellers minimal modell). Hele økt-kontrakten:
   - `loadWeek` · `loadSession` · `loadSources` (tom liste OK i Loop 1)
   - `createSession` → DRAFT
   - `moveSession`
   - `publishSessions` / `unpublishSession`
   - `addDrill` · `reorderDrills` · `removeDrill`
   - `deleteSession`
   - `startSession` · `completeSession` · `skipSession`
   - `loadPlayerDay` — **kun** PUBLISHED | IN_PROGRESS | COMPLETED
   - `resolvePlayerApproval` kan være not-implemented til Loop 3T
4. Overlap = warn, ikke hard block. VEGG (to redigerbare overlapper) sperrer Publiser — det kan vente til Loop 2 hvis schema mangler felt.

**Ferdig når**

```
npx tsx --test src/domain/workbench/operations.test.ts
npx tsc --noEmit
```

Manuell / script-smoke: create → move → publish → `loadPlayerDay` ser den, DRAFT-søsken usynlig.

**Commit:** `feat(workbench): domain + create/move/publish + loadPlayerDay`

**Ikke:** UI. Drag-library. Sources-innhold (skall kommer i 2T). Player-side UI.

---

## Loop 1 — lim-inn-prompt

```xml
<role>
Du er senior full-stack på AK Golf HQ.
Stack: Next.js 16.2 + React 19 + TypeScript strict + Prisma 7 + Supabase + Tailwind v4 + shadcn.
Repo: Golf_Headquarters. Gren: claude/natt-a1-a4-2026-08-24 (eller ny gren fra main).
Dette er Loop 1 av 14 i natt-planen docs/natt/OVERNIGHT-CODING-LOOP.md. Bølge 1.
</role>

<mission>
Port Workbench-domain og wire server actions. Ingen UI i denne loopen.

1. Les eksisterende kode FØRST. Søk Session, Plan, Workbench, prisma schema, app/actions, auth helpers.
2. Port domain/types.ts, operations.ts, operations.test.ts, ui/labels.ts til src/domain/workbench/.
3. Kjør testene. Alle grønne før du går videre.
4. Implementer hele økt-kontrakten: loadWeek, loadSession, createSession, moveSession, publishSessions, unpublishSession, addDrill, reorderDrills, removeDrill, deleteSession, startSession, completeSession, skipSession, loadSources (tom liste OK), loadPlayerDay.
5. loadPlayerDay returnerer ALDRI DRAFT.
6. Skriv docs/natt/LOOP-1-DONE.md med gap-tabell, filer, hvordan kjøre smoke, hva Loop 2 arver.
7. Commit. Ikke start Loop 2. Ikke åpne PR ennå.
</mission>

<constraints>
- Gjenbruk Prisma-tabell hvis den matcher. Minimal migration ellers, dokumentert.
- Domain er pure. Side-effects bare i actions.
- Auth: eksisterende helpers. Ingen hardkodede IDs.
- GDPR: logg IDs, ikke navn. Ingen ekte junior-data i fixtures.
- Anti-scope: uke-UI, drag-lib, kilder-innhold, Player-side, måned/år/stall, Google, nye tokens.
- Scene-token røres ikke i denne loopen.
- Spec-filer: docs/natt/workbench/
</constraints>

<verification>
- operations.test.ts grønn
- tsc --noEmit grønn
- create → DRAFT rad
- move → date + startMinute
- publish → PUBLISHED + publishedAt
- addDrill / removeDrill muterer drills
- startSession → IN_PROGRESS · completeSession → COMPLETED
- loadPlayerDay: 0 DRAFT
</verification>
```
