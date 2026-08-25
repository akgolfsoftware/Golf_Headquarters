# D3 — Workbench uke (Mac) portet til Train-lock

**Dato:** 25.08.2026 · **Gren:** `design/d3-workbench-uke` · **Omfang:** ÉN skjerm
(Workbench uke, coach/admin, Mac) + delt Agency-rail (forventet spredning).

Fasit: `designsystem/train-lock/A-01 Mac Uke Pro.dc.html` (skjermen) +
`AG-00 LOCK.dc.html` (skallet) + `HANDOFF.md` + `docs/natt/D2-UNDERLAG-2026-08-25.md`.

---

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/components/workbench/wb-tl-scope.ts` | **NY.** `TL_SCOPE` — skygger `--v2-*`, `--p-*` og shadcn-basens `--color-*`/`--font-*` til Train-lock-verdier, lokalt på Workbench-ukas treet. Gjør at delte komponenter (Knapp, Inspektorpanel, BunnArk, TimeGrid, Input, Select, Dialog, DrillListEditor, CreateSessionModal, PublishConfirmDialog, SourcesPanel) automatisk arver Train-lock-farge og SF Pro-skrift UTEN at noen av de filene er endret (CLAUDE.md §Design: «Port HTML 1:1: nei. Gjenbruk Button/Modal/TimeGrid/SessionCard»). |
| `src/app/admin/workbench/[playerId]/page.tsx` | `TL_SCOPE` lagt rundt hele `<V2Shell>` (rail + innhold, ikke bare innholdskolonnen). `aktiv="planlegge"` (var `"spillere"` — feil fane var tent før). |
| `src/components/v2/shell.tsx` | `AGENCYOS_NAV` punkt 5: `"Plan"` → `"Workbench"`, href `/admin/plans` → `/admin/planlegge` (D2-beslutning 1, overstyrer A1 16.08). Ny `TrainLockAgencyRail` (44×44 r12-punkter, trafikklys, AK-avatar warm, ingen tekst i railen — D2-UNDERLAG §4 K5) brukt for `erAgency` i `IkonRailNav`. PlayerHQ-railen (72px/4-ikon) er urørt — ikke Train-lock-portet ennå. |
| `src/components/workbench/WorkbenchUke.tsx` | `TL_SCOPE` på rot-wrapper (dobbel sikring, harmløs). Kolonnebredder `--wb-kilder` (220) / `--wb-artefakt` (380) fra `TL.skall.*` — var 220/360. «+ Ny økt» endret fra solid til `ghost` (fasitens hairline-sekundær) — kun `Publiser` er hvit primær nå (D2 §Farger: «én hvit primær per skjerm»). |
| `src/components/workbench/WeekGrid.tsx` | Økt-blokken bruker nå `TL.radius.row` (12), `TL.dock`/`TL.hair`/`TL.draftBorder`/`TL.text` direkte — ingen fargekoding per pyramide-område lenger (fjernet `pyramideFarge`; HANDOFF §MAT: «Danger bare feil, ok bare godkjent — ingen farge på data»). Valgt økt = `inset 0 0 0 2px TL.text` (var warm ring — warm er reservert fullført). |
| `src/components/workbench/SessionInspector.tsx` | Pyramide-raden viser kun caps-tekst, ingen fargeprikk (samme regel som WeekGrid). |
| `src/components/workbench/wb-visuelt.ts` | `WARM` peker nå på `var(--tl-warm)` (var `--p-accent-fg`). `pyramideFarge()` fjernet (eneste bruk var de to fargekodings-stedene over). |
| `src/app/layout.tsx` | `onsketMorkTema`: `/portal` og `/admin` er nå MØRK default (samme regel som "resten": `!lysCk`) — snudd i denne leveransen per D2-UNDERLAG §5.4 («snus sammen med første portede skjerm»). `/forelder` og `/auth` er URØRT (fortsatt lys default, ikke Train-lock-portet). Landingssider urørt (alltid lys). |

**Ingen nye tokens.** Alt bruker `TL`/`--tl-*` fra D2 (`src/lib/v2/train-lock.ts`,
`src/styles/train-lock-tokens.css`) — ingen verdi er skrevet fra hukommelse.

---

## Kjent grense — geometri kan ikke CSS-var-skygges

`TL_SCOPE` fikser farge og skrift på alle delte komponenter, men IKKE geometri:
`T.rCard = 12`, `T.rTag = 8` osv. i `src/lib/v2/tokens.ts` er **tall**, ikke CSS-
variabler — de er bakt inn i JS ved rendring og kan ikke overstyres fra utsiden.

Konsekvens: Knapp/Inspektorpanel/Input/Select/Dialog beholder Paper-radius
(12/8) der Train-lock ber om 20/999/16 på disse komponenttypene. Egen markup
(WeekGrid-blokken, railen, topplinjens kolonnebredder) bruker `TL.radius.*`
direkte og er derfor pikselriktig. Å rette geometrien i de delte komponentene
er en egen jobb (ville endret radius på HELE appen, ikke bare denne skjermen)
— foreslått neste steg, ikke gjort her (anti-scope).

Andre kjente avvik fra fasiten, bevisst latt stå (anti-scope: kun denne
skjermen + skallet):
- Kilder-panelets mini-måned/Kontekst/Sett inn-innhold er urørt (kun
  fargen/skriften er Train-lock via `TL_SCOPE`) — layout/innhold er samme
  som før D3.
- Topplinjens Coach/Spiller- og Standard/Pro-segmenterte piller fra fasiten
  finnes ikke i koden (ingen tilsvarende funksjon bygget ennå) — ikke lagt til,
  det ville vært ny funksjonalitet, ikke en visuell port.
- `Dialog`-primitiven (`ui/dialog.tsx`) bruker fortsatt `backdrop-blur-sm` på
  scrimmet — Train-lock forbyr `backdrop-filter` («Material = opaque»). Delt
  på tvers av HELE appen; å fjerne den er utenfor denne skjermens scope.

---

## Tema-flippen — funn (ikke fikset, kun observert)

`onsketMorkTema` gir nå mørk default på `/portal` og `/admin`. Jeg kunne
**ikke** verifisere dette visuelt i denne økten: worktreet mangler
`.env.local` (bevisst, jf. `.claude/rules/gotchas.md` — aldri kopier `.env*`
mellom worktrees), og har derfor ingen databasetilkobling. `npm run dev` mot
en ekte innlogget bruker var ikke mulig herfra. Det jeg HAR verifisert:

- `npm run verify` (som inkluderer full `next build` av alle ~450 rutene)
  er grønt — ingen bygge-/type-/lint-feil av flippet.
- `npm test` — 1605/1605 grønt, ingen regresjon i domenelogikk.

**Risikoen fra `docs/natt/D2-TOKENS-DONE.md`** («et tidlig bytte ville gjort
200+ uportede skjermer mørke før de er tegnet for det») **er reell og
uverifisert av meg** — jeg kan ikke bekrefte eller avkrefte om Paper-styrte
skjermer (som fortsatt bruker lyse Paper-farger med harde antakelser om lys
bakgrunn) ser synlig ødelagt ut under mørk default, inkludert den kjente
primary=accent-kollisjonen i mørkt tema (gotchas.md). **Dette MÅ sjekkes av
noen med ekte DB-tilgang (Anders, eller neste økt i hovedmappa) før merge til
main** — skjermbilde-gaten i `beslutninger.md` krever uansett at Anders har
SETT skjermen, så Vercel-previewen fra denne PR-en er uansett veien inn.

---

## Verifisering

```
npx tsc --noEmit          → 0 feil
npm run lint               → 0 errors, 81 warnings (alle forhåndseksisterende
                              + 2 nye ubrukte-var-varsler jeg selv rettet)
npm run verify              → grønt (prisma validate/generate, tsc, eslint,
                              check-action-auth, check-token-gap,
                              check-critical-imports, full next build ~450 ruter)
npm test                    → 1605/1605 grønt, 0 feil
```

**Ikke gjort (miljøbegrensning, ikke hoppet over med vilje):**
Playwright-skjermbilder av den faktiske innloggede skjermen (mobil 390px +
Mac 1280px, lys + mørk). Worktreet har ingen `.env.local`/DB-tilkobling, og
`.env*` skal aldri kopieres mellom worktrees. Anders må se den ekte
Vercel-preview-lenken fra PR-en under — det er uansett kravet i
skjermbilde-gaten, uavhengig av om jeg hadde tatt egne skjermbilder.

---

## Anti-scope holdt

Kun Workbench-uke + det delte Agency-skallet (rail, forventet spredning per
oppdrag) rørt. Ingen serie/GROUP-propagasjon, ingen Google, ingen
drag-lib-endring, ingen nye server actions eller domenetyper — `wb-actions.ts`
og `src/lib/domain/workbench/` er urørt. Kilder-panelets innhold, drill-editor
og publiseringslogikk er funksjonelt uendret — kun visuelt reskinnet via
`TL_SCOPE`.
