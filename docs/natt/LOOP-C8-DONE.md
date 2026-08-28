# C8 — Lys-pass — DONE (28.08.2026)

Gren: `feat/c8-lys-pass`. Loop 12 i `docs/natt/OVERNIGHT-CODING-LOOP-BOLGE2.md`,
rad C8 i `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md`.

Mekanisme urørt: `html[data-v2-tema="dark"]` + cookie `ak-v2-tema`.
Ingen `className="dark"` innført. `tema-default.ts` uendret (tester grønne).

## Åtte nøkkelskjermer

| Skjerm | Fil | Lys |
|---|---|---|
| I dag | `PortalChatHjem.tsx` | Allerede TL.* — stale T-kommentarer ryddet |
| Plan-uke | `PlanV2.tsx` + `DagStripe` | Allerede TL.* |
| TM-detalj | `DispersionMap.tsx` | Valgt-ring `#FFFFFF` → `TL.fill`. Ellipse-unntak står |
| Workbench-uke | `WorkbenchV2.tsx` + sheets | `T.ax` vekk — kort/prikker er `TL.dock`/`TL.text` |
| Kalender-uke | `AgencyKalenderV2.tsx` + `v2/kalender.tsx` | `T.ax` vekk |
| Live runde | `runde-live-klient.tsx` | Allerede TL.* |
| Gate | `gate-live-artefakt.tsx` | Allerede TL.* |
| Login | `LoginV2.tsx` | Låst lys (PP-A/A4): strip `data-v2-tema` som VeiviserFlate. Hairline i stedet for mørk-rgba |

Død `PuttModell` slettet fra `src/components/v2/datavis.tsx`.

Pyramide-stolper: `TL.text` med opasitet 1 → 0,28, aldri farge per nivå.

## TM-unntak (står)

1σ-ellipse og hullkart er kun tegnet i mørk. Tokenene speiler alfa i lys
(`#00000029` / `#00000008`); hullkart-flater er mørke i begge varianter.

## Mekanisk lys ellers

Skjermer som allerede leser `--tl-*` får lys via `:root`. Tegnet lys-fasit
mangler for det meste av Agency — T-S5 (a) gjelder.

## Fortsatt knekk i lys (ikke C8-scope)

- Auth-søsken (signup, glemt passord, BankID, …) har fortsatt `rgba(238,240,236,0.05)`-sirkler — usynlige på hvit. W5-auth.
- `T.ax` lever på flater utenfor de åtte (KalenderV2, TekniskPlan, MalBygger, AdminPlanMal, spesialviz, fysisk).
- `LPHASE_FARGE_KANON` på Workbench måned (C1, ikke uke).
- `PP_RAMP` i `v2/kalender.tsx` er hardkodet skogsgrønn (Periodeplan, ikke uke).
- V2Shell har fortsatt `className={tema}` (`dark`/`light`) som shadcn-belte — ikke ny mekanisme, følger `data-v2-tema`.
- Innlogging med dark-cookie: SSR kan tegne mørk én frame før `useEffect` stripper. Cookie vinner i `onsketTema` (testene krever det); login-siden tvinger lys etter mount.
