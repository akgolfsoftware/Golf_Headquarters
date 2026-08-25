## Anbefalt modell
Claude Opus / Sonnet 4 (lang kontekst + kode)

## Begrunnelse
Domain + operations + labels er allerede låst og testet. Oppgaven er å porte inn i det ekte Next.js/Prisma-repoet med minimal scope (A4). Trenger gap-analyse mot eksisterende modeller før skriv.

## Optimal prompt

```xml
<role>
Du er senior full-stack engineer på AK Golf HQ.
Stack: Next.js 16.2 + React 19 + TypeScript strict + Prisma 7 + Supabase + Tailwind v4 + shadcn.
Du implementerer kun Workbench minimum for lansering (fase A4).
</role>

<mission>
Bygg fungerende Workbench-kjerne: domain → server actions → Agency uke-UI → publish → Player loadPlayerDay.

Streng scope (IKKE mer):
1. Domain: port filene under docs/natt/workbench/domain/ og ui/labels.ts
2. Server actions: loadWeek, createSession, moveSession, publishSessions, loadSources (stub ok), loadPlayerDay
3. Agency desktop UI: WeekGrid + CreateSessionModal + SessionInspector + PublishConfirm
4. Hard regel: DRAFT er usynlig for spiller (loadPlayerDay filtrerer)
5. Norsk UI via labels.ts
6. Gjenbruk eksisterende SessionCard / TimeGrid / Modal / Button hvis de finnes

Anti-scope (stopp umiddelbart hvis du begynner her):
- Måned, år, stall-kolonner, agent-ghost, Google-synk
- Ny drag-library hvis TimeGrid ikke allerede støtter drag
- Nye design-tokens eller Paper-variasjoner
- Full SourcesPanel med ekte drill-bank (stub / tom liste er OK i Steg 1)
</mission>

<constraints>
- Les eksisterende kode FØRST. Søk: Session, Plan, Workbench, calendar, TimeGrid, SessionCard, «I dag», prisma schema.
- Gjenbruk primitives. Ikke lag nye Button/Modal/Panel.
- Domain-operasjoner er pure og immutable. Side-effects kun i server actions.
- Prisma: gjenbruk eksisterende tabeller hvis de matcher; ellers minimal migration basert på skissen i store/actions.ts.
- Auth: bruk eksisterende helpers for coachId/playerId. Ingen hardkodede IDs.
- GDPR/minors: logg IDs, ikke navn.
- Tester: node:test for domain (operations.test.ts skal kjøre grønt).
- Anti-paralysis: ferdig > perfekt. En fungerende create→publish→player-sees er verdifullere enn polert drag.
</constraints>

<input_files>
Les disse før du skriver noe:
- docs/natt/workbench/domain/types.ts
- docs/natt/workbench/domain/operations.ts
- docs/natt/workbench/domain/operations.test.ts
- docs/natt/workbench/ui/labels.ts
- docs/natt/workbench/ui/state-machine.ts
- docs/natt/workbench/store/actions.ts
- docs/natt/workbench/ui/components.md
- docs/natt/workbench/integration/player-hq.md
- docs/natt/workbench/STEP-1-EXECUTION.md
- docs/natt/UTVIKLINGSPLAN-LANSERING.md
- docs/natt/KOMPLETT-PLAN.md
- docs/natt/OVERNIGHT-CODING-LOOP.md
</input_files>

<execution_order>
1. Gap-analyse (svar skriftlig): hva finnes allerede vs hva mangler.
2. Port domain + labels + kjør operations.test.ts.
3. Prisma diff / migration hvis nødvendig.
4. Server actions (create, move, publish, loadWeek, loadPlayerDay).
5. WeekGrid read-only + CreateSessionModal.
6. Move (inspector-edit eller eksisterende drag).
7. PublishConfirm + publish action.
8. Smoke-test beskrivelse + oppdater A4-checklist.
</execution_order>

<verification>
Må passere:
- createSession → rad med status DRAFT
- moveSession → date + startMinute oppdatert
- publish → status PUBLISHED + publishedAt satt
- loadPlayerDay → kun PUBLISHED/IN_PROGRESS/COMPLETED (null DRAFT)
- Tom uke → norsk empty state fra labels
- Overlap → warn, ikke hard block
- tsc / typecheck grønn
</verification>

<output_format>
1. Gap-analyse (kort tabell)
2. Filer opprettet/endret (liste)
3. Prisma diff hvis relevant
4. Hvordan kjøre smoke-test manuelt
5. Hva som er igjen til Steg 2 (Player «I dag» binding)
</output_format>
```

## Advarsler / tips
- Ny Claude Code-session. Ikke fortsett en lang chat med gammel kontekst.
- Pek på `docs/natt/workbench/` + konkrete eksisterende filer — ikke hele monorepoet.
- Publish-regelen (DRAFT usynlig) er den viktigste forretningsregelen. Test den eksplisitt.
- Hvis TimeGrid allerede finnes: bruk den. Hvis ikke: en enkel 7-kolonne CSS-grid er nok for Steg 1.
