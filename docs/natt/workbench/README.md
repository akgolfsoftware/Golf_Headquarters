# Workbench — komplett spesifikasjon

**Dato:** 24.08.2026  
**Scope:** Komplett Workbench (mobil · iPad · desktop) + todelt tilgangsmodell.

## Hva som er levert her

| Fil | Innhold |
|-----|---------|
| `ACCESS-AND-GROUPS.md` | **Låst** todelt plattform, multi-gruppe, lisens vs self-serve, GDPR-gate, gruppe→privat propagasjon |
| `domain/types.ts` | Domain-typer inkl. Group, GroupMembership, Entitlement, SessionOrigin, approval |
| `domain/operations.ts` | Pure funksjoner: create, move, publish, addDrill, budget, week assembly |
| `ui/labels.ts` | Norske UI-strenger |
| `ui/state-machine.ts` | UI-state + events + reducer |
| `ui/components.md` | Kontrakt for UI-komponenter |
| `store/actions.ts` | Server-action / API-kontrakt + Prisma-skisse |
| `integration/player-hq.md` | Player HQ ↔ Workbench (approval, materialisering, tilgang) |
| `CLAUDE-CODE-PROMPT.md` | Prompt for implementering i repoet |
| `STEP-1-EXECUTION.md` | Steg 1 sjekkliste |

## Kjerneregler

1. **Todelt plattform + tilgang** — se `ACCESS-AND-GROUPS.md` (vinner). Gruppe-medlemmer (GFGK, WANG, Performance, Academy, …) har lisens inkludert. Self-serve uten kjøpt coach-produkt er **usynlig** for Agency/coach.
2. **Multi-gruppe** — en spiller kan være i flere grupper samtidig (many-to-many membership).
3. **Gruppeplan → privat profil** — create/update/delete i GROUP-modus materialiseres/propageres til hvert aktivt medlems private uke. Lokal spiller-edit gir godkjenning, ikke silent overwrite.
4. **Spiller eier privat profil fritt** — kan alltid redigere. Coach-endring på individ krever spiller-godkjenning.
5. **Én motor, tre moduser** (PLAYER / GROUP / AGENCY).
6. **Ingen AI/Caddie inne i Workbench** (egne flater).
7. **Ingen treningsregler** i domain (vokabular ja).

## Hvordan gå videre

1. Les `ACCESS-AND-GROUPS.md` først.
2. Les `STEP-1-EXECUTION.md` og utvid med entitlement-filter + GROUP materialise.
3. Lim inn oppdatert Claude Code-prompt mot repoet.
4. Design: bruk den komplette Claude Design-prompten (mobil/iPad/desktop + approval-UI).

## Avhengigheter

- VOKABULAR.md
- Train-lock design (Player HQ Train lock.zip)
- HANDOFF.md (look/IA; access vinner ACCESS-AND-GROUPS.md)
