# ARKIV — frossen spec, IKKE fasit

Flyttet hit 25.08.2026 (docs-opprydding, jf. `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` Del 1).

**Koden er eneste sannhet:**

- Domain: `src/lib/domain/workbench/` (types, operations, schemas, labels, tester)
- Server actions: `src/lib/workbench/wb-actions.ts` (WbResultat-mønsteret)

Filene her var Loop 1-spesifikasjonen. De har allerede driftet fra koden
(labels.ts mangler Loop 3S-strengene; `state-machine.ts` ble aldri portert — UI bruker
component-state, ikke reducer). Ikke lim inn noe herfra i src/ — det overskriver nyere kode.
`CLAUDE-CODE-PROMPT.md` var en alternativ Loop 1-prompt; Loop 1 er FERDIG.
