# Arbeidsdeling — Codex og Claude Code

11.09.2026. Bestilt av Anders etter samling av ferdig kode til main. Målet er fortsatt hele appen; oppdelingen under fordeler neste to leveranser og hindrer samtidig endring av samme filer.

| Pakke | Ansvar | Omfang | Ferdigkriterium |
|---|---|---|---|
| D2-PH06 / R2 | Claude Code, brukerens valgte Sonnet 5 | PH-06, oppsummeringen etter trening: faktiske resultater, egne ord/vurdering, lagringsfeil og tilbake til I dag | Valgt Trainlock er fulgt, eksisterende funksjoner bevart, kildeverdier er ikke oppdiktede data, og relevante kontroller/sammenligninger er dokumentert |
| D2-PLAN / R3 | Codex i denne oppgaven | Eldre TrainingPlanSession uten V2-speil i Plan og ukeprogresjon; synlighet, Oslo-uke, status og deduplisering mellom eksisterende modeller | Samme økt telles én gang, synlige eldre økter inngår, skjulte/ikke godtatte økter utelates, og regressjonstester bekrefter regelen |

## Filer og arbeidsmapper

Claude bruker `.worktrees/claude-ph06-2026-09-11` og grenen `claude/playerhq-ph06-2026-09-11`, opprettet fra den samlete main-versjonen. [Komplett prompt](claude-code-sonnet-5-ph06-prompt.md) beskriver kilder, eierskap og kontroll.

Claude eier `SessionSummary.tsx`, `SpillerVurderingForm.tsx`, nye PH-06-komponenter/stilfiler, `summary/page.tsx`, `live-summary.ts` og sammendragsrelaterte typer/tester. Eventuelle nødvendige rettinger i V2-handlingsfilen begrenses til `lagreDineOrd` og `lagreSpillerVurdering`. Start, løpende logging, fullføring og offlinekø er utenfor denne pakken. Delte skall og globale designverdier beholdes. Egen nettleserrigg plasseres i `tests/visual/playerhq-summary/`, egen rapport i `docs/design-audit/playerhq-ph06-2026-09-11.md`.

Codex bruker prosjektets hovedarbeidsmappe på `codex/plan-legacy-2026-09-11`. Codex eier ukelesingen i `src/app/portal/actions.ts`, `src/lib/portal/week-progress.ts`, `workbench-week.ts`, `visible-v2.ts`, nødvendige nye Plan-adaptere og deres tester. Nye funksjoner utenfor ukelesingen, inkludert SG-beregninger i samme handlingsfil, skal ikke endres som del av denne pakken.

Bare samlingsoppgaven oppdaterer masterplanen og den samlede port-auditen. Begge pakker leverer en egen rapport som kan føres inn etterpå. Ingen av dem endrer databasen, tilgangsroller, produksjonsoppsett eller CI som del av porteringen. Separat eksisterende arbeid med produktplan/intervju og manuell SG beholdes i sine egne grener.

## Status og kontroll

De seks ferdig testede kodepakkene gjennom `2bd5a052c` inngår i main-samlingen 11.09. De har full lokal verify, 2 326 beståtte tester og 292 syntetiske skjermvarianter. Dette er kode-/testbevis, ikke godkjenning av alle skjermene eller en innlogget produksjonsreise. [Port-auditen](../design-audit/portering-fire-flater-2026-09-10.md) eier detaljene.

Claude-pakken er klargjort for Anders og er ikke startet av Codex. Codex fortsetter D2-PLAN etter at main-samlingen er bekreftet. Nye pakker lagres på hver sin gren og blandes ikke inn i samlingen av allerede ferdig arbeid. Full verify og nødvendige tester kjøres én gang på sluttkoden og igjen ved reelle endringer eller feil. Miljøer, genererte Prisma-klienter og byggmapper skal ikke deles mellom samtidige bygg.
