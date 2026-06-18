# Audit — samlet slette/behold/fiks-liste (Fase 1 komplett)

> Syntese av fire audit-sveip (struktur · komponenter · data · config), 17. juni 2026. **Grep-verifisert.** Der agentene var uenige, vinner det som er bekreftet mot koden/next.config.

## ⚠️ Viktige korreksjoner (tidligere antakelser var feil)

1. **`/portal/mal/*` er LEVENDE, ikke død.** 84 eksterne referanser (manifest, `portal/actions.ts`, ny-okt-wizard, trackman, statistikk). Den *ser* «v10/gammel» ut, men er fullt wiret. → **Skal redesignes/portes, IKKE slettes.** Den tidligere «kutt 27 ruter»-påstanden i `skjerm-inventar-konsolidering.md` er feil.
2. **`admin/anlegg` er den levende ruten.** `next.config.ts` 301-redirecter `/admin/locations` og `/admin/facilities` → `/admin/anlegg`. (Motsatt av første flyt-agents antakelse.) → Behold `anlegg`; facilities/locations-page-mappene er uoppnåelige.
3. **`design-system/` skal IKKE slettes.** Struktur-auditen flagget den som «forbudt token-fil utenfor globals.css, 0 importer» — det er en falsk positiv. Mappa er vårt NYE designsystem + Claude Design-synk-kilde; den er bevisst ikke importert i appen. Unntatt fra regelen.
4. **Konsekvens for scope:** Færre ruter er faktisk kuttbare enn antatt. Skjermtallet å redesigne er noe høyere enn det tidligere estimatet (~150–180) — `portal/mal`-treet må portes, ikke fjernes.

## ✅ Trygt å slette (grep-verifisert dødt)

| Post | Hva | Gevinst |
|---|---|---|
| `_archive/` | 71 git-sporede filer, 412 MB rene dato-arkiver (allerede gitignored) | Stor — rydder repoet |
| `content/blog/` + `src/lib/blog.ts` | Gammelt blogg-system, 0 importer (levende = `content/blogg/*.mdx`) | Fjerner dublett |
| `src/app/admin/facilities/` + `src/app/admin/locations/` | Uoppnåelige (301 → anlegg i next.config) | Dødt page-tre |
| ~20 døde komponenter | athletic/{pagination, queue-item, modals/stub-modal, data/{lphase-distribution, practice-type-distribution, skill-area-bands}, calendars/{compare-calendar, load-calendar}}, shared/{overview-shell, overview-card, fullscreen-template}, ui/empty-state (dublett), portal/{analyse, live-okt}-komp | 0 eksterne imports |
| ~135 foreldreløse filer | Diverse uimporterte filer (se `audit-struktur.md`) | Opprydding |

## 🔎 Undersøk / beslutt (ikke blind sletting)

- **Redirect-stubber** (bevisste): `admin/calendar|messages|approvals`, `portal/analyse|stats`, `portal/tren/ovelser*`. Behold som tynne redirects, eller fjern når lenker er oppdatert.
- **Parallelle gamle sett (største duplikat-risiko):**
  - `coachhq/` (eldre flate, brukt av `/admin/plans`, `/admin/coach-workbench`, `/admin/brief`) parallelt med `admin/agencyos/`.
  - `admin/inbox/` vs `admin/innboks/`.
  - Tre workbench-sett · fem pyramide-bar-varianter.
  - → Konsolideres under porting (velg én, migrer call-sites, slett resten).
- **Thin-wrappers** (`shared/modal` @deprecated, `shared/page-header`, `shared/sheet`): slett etter at få gjenværende call-sites er migrert.

## 🧱 Komponent-klassifisering for redesign
- **RE-SKIN** (behold API, nytt utseende): athletic-primitiver, levende data-viz, ui-primitiver, stats/sg-hub, shared/calendar.
- **BYGG NY:** gamification-laget (✅ allerede bygget i `design-system/`); data-viz §3/§5/§6 oppgraderes fra statisk → interaktiv (re-skin, ikke fra null). `HeatmapCalendar` finnes.
- **SLETT:** se over.

## 🗃️ Data & config (fra de to andre auditene)
- **Data:** modne (~124/126 modeller aktive) — redesign er primært frontend-bytte. ELITE-lekkasjer ✅ fikset. DrillMal-mock utsatt (ikke lanseringskritisk). Kommunikasjon-union venter på IA-beslutning.
- **Config:** token-migrasjonsdelta (dagens globals.css → hybrid `tokens.css`) kartlagt i `audit-config.md`. Tailwind v4 @theme.

## Rekkefølge (når porting starter)
1. Slett `_archive/` + gammelt blogg + døde komponenter + facilities/locations-page-mapper (rask, trygg gevinst).
2. Migrer tokens (globals.css ← hybrid) — Fase 2.
3. Port skjermer (inkl. hele `portal/mal`-treet — det skal IKKE kuttes).
4. Konsolider parallelle sett (coachhq/agencyos, inbox/innboks, workbench) underveis.
