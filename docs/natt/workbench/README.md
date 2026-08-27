# Workbench — kontrakt/arkiv

**Dato:** 24.08.2026 (opprydding 27.08.2026: implementeringsprompter og frosne domain/ui-spec-
duplikater fjernet — koden i `src/lib/domain/workbench/` + `src/lib/workbench/wb-actions.ts`
er fasit, ikke disse filene).

## Hva som fortsatt gjelder

| Fil | Innhold |
|-----|---------|
| `ACCESS-AND-GROUPS.md` | **Låst** todelt plattform, multi-gruppe, lisens vs self-serve, GDPR-gate, gruppe→privat propagasjon |
| `ui/components.md` | Kontrakt for UI-komponenter (ikke portert 1:1) |
| `integration/player-hq.md` | Player HQ ↔ Workbench (approval, materialisering, tilgang) |

## Kjerneregler

1. **Todelt plattform + tilgang** — se `ACCESS-AND-GROUPS.md` (vinner). Gruppe-medlemmer (GFGK, WANG, Performance, Academy, …) har lisens inkludert. Self-serve uten kjøpt coach-produkt er **usynlig** for Agency/coach.
2. **Multi-gruppe** — en spiller kan være i flere grupper samtidig (many-to-many membership).
3. **Gruppeplan → privat profil** — create/update/delete i GROUP-modus materialiseres/propageres til hvert aktivt medlems private uke. Lokal spiller-edit gir godkjenning, ikke silent overwrite.
4. **Spiller eier privat profil fritt** — kan alltid redigere. Coach-endring på individ krever spiller-godkjenning.
5. **Én motor, tre moduser** (PLAYER / GROUP / AGENCY).
6. **Ingen AI/Caddie inne i Workbench** (egne flater).
7. **Ingen treningsregler** i domain (vokabular ja).

## Avhengigheter

- VOKABULAR.md
- Train-lock design: **`designsystem/train-lock/`** (committet 25.08.2026 — D3 løst)
- HANDOFF.md: **`designsystem/train-lock/HANDOFF.md`** (look/IA-kontrakten;
  access vinner ACCESS-AND-GROUPS.md)
