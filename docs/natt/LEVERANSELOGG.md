# Leveranselogg — natt-sporet (Train-lock/Workbench)

Komprimert 27.08.2026 fra 24 enkeltstående DONE-rapporter + `LOOP-1-PROMPT.md` (opprydding,
se `docs/OPPRYDDING-PLAN-2026-08-27.md`). Full detalj per leveranse lever i git-historikken
(commit-meldinger + PR-beskrivelser) — denne loggen er en ett-linjes kvittering, ikke en spec.

Status er som skrevet i den opprinnelige DONE-rapporten på leveransetidspunktet — for
GJELDENDE merge-status, se `docs/STATUS-NÅ.md`.

| Rad | Hva | Gren | Status ved levering |
|---|---|---|---|
| Loop 1 | Domain + persistens + actions for Workbench-kjernen (ingen UI) | `claude/...` | Ferdig |
| Loop 2 | Agency Workbench uke-UI: se · opprett · flytt · publiser | `claude/agency-workbench-uke-ui-c4d2a4` | Ferdig, ikke merget da |
| Loop 2S | Drill-editor i SessionInspector (legg til/reorder/fjern) | `claude/sessioninspector-drill-ui-125d70` | Ferdig, ikke merget da |
| Loop 3S | Spiller Start / Fullfør / Hopp over på publisert økt | `claude/agency-workbench-uke-ui-c4d2a4` | Ferdig, ikke merget da |
| LOOP-B2-Release | Release-gren for Workbench bølge 1 satt sammen fra main | `release/workbench-b1` | Ferdig |
| LOOP-B2-Smoke | Bølge 1 smoke-test, manuelt grønn i prod | — | Grønn (Anders verifiserte) |
| B3 | Agency-herding for Workbench (coach-siden) | `feat/wb-b3-agency-herding` | Ferdig |
| B4 | «I dag» leser ekte Workbench-data | `feat/wb-b4-ekte-i-dag` | Ferdig |
| B5 | Kilder, drag, serie — inkl. additiv DDL kjørt mot prod | `feat/wb-b5-kilder-serie` (PR #601) | Ferdig, verify+test grønn |
| B6 | Godta/avvis + «ikke delta» (kalt Loop 3T i original plan) | `claude/wb-b6-godkjenning` (#604/#611) | Merget |
| B7 | TrackMan DispersionMap (TM-11 økt-detalj, TM-08f slag-ark) | `feat/wb-b7-trackman` | Merget |
| B8 | Train-lock design-pass Player (økt-ark + I dag-workbench) | — (#612) | Merget, DELVIS (ikke full fasit-1:1) |
| T1 | AgencyOS-skall portet til Train-lock | `claude/t1-agency-skall-tl` (#596) | Merget |
| T2 | Cockpit (`/admin/agencyos`) portet til Train-lock | — (#602) | Merget |
| T3 | Innboks + godkjenninger til Train-lock | `claude/t3-innboks-godkjenninger-tl` (#609) | Merget |
| T4 | Stall + Spiller 360 + fys til Train-lock | `claude/t4-stall-spiller360-tl` (#608) | Merget, DELVIS |
| T5 | Workbench-designpass til Train-lock (audit) | — | Allerede portet via D3/B5/B6 — ingen kodeendring |
| T13 | Oppsett + Meg til Train-lock | `claude/t13-oppsett-meg-tl` (#613) | Merget |
| D2-Tokens | Train-lock-tokens utledet til kode | — (#586, font #597) | Ferdig |
| D3 | Workbench uke (Mac) portet til Train-lock | `design/d3-workbench-uke` | Ferdig |
| N1 | Pipelines flyttet til `akgolfsoftware/ak-golf-pipelines` (`public_db.py` + cron) | eget repo | Ferdig 26.08, kjører mot prod |
| N2 | Dashboard-data-bro (talenthq → akgolf-hq) | `claude/n2-dashboard-data-bridge` | Ferdig |
| N3 | Scorekort- og PEI-beregningsmotor høstet fra talenthq | `claude/n3-pei-scorekort-motor` | Ferdig, ikke merget da |
| N5 | Team Norway som egen organisasjon | `claude/n5-team-norway-org` | Ferdig |
| RLS-Workbench | RLS på `workbench_sessions`/`workbench_drills` | — (#593) | Kjørt og verifisert aktiv i prod |
| T7 | Kalender + booking-lag samlet til én TL-flate (`/admin/kalender`); lista og uka-tavla redirect | `claude/natt-lansering-2026-08-28` | Merget #629 |
| T8 | Grupper til Train-lock (liste, detalj, timeplan, AK-stigen) + workbench-fane | `claude/natt-lansering-2026-08-28` | Merget #629 |
| QA-1 | Web-hygiene: admin-toast, tel-lenke, årstall, hub-titler, én e-post på kontakt | `claude/natt-lansering-2026-08-28` | Merget #629 |
| C6 | Jarvis-merge eval-gate + proveniens (Filip åpen / Jonas stengt). Ikke `src/lib/jarvis/` | `claude/natt-lansering-2026-08-28` | Merget #629 |
| C7 | AgenticOS godkjenningspolicy A3/B1/C3 (ren funksjon) | `claude/natt-lansering-2026-08-28` | Merget #629 |
| C9 | FO-01 neste økt-kort på wb-domenet (aldri DRAFT, kun fornavn) | `claude/natt-lansering-2026-08-28` | Merget #629 |
| T12 | J-A `/meg` under Meg (ADMIN) + ⌘K. J-B utkast (ingen send). J-C Kø = godkjenninger. Caddie-redirect | `claude/t12-agenticos-ia-2026-08-28` | IA merget #630 |
| T12 visuell | AO-00/01 cockpit, kø, godkjenn, skills, runtimes, projects, run-detalj mot Train-lock | `claude/t12-visuell-ao-00-01-2026-08-28` | Se `docs/natt/T12-VISUELL-DONE.md` |
| TL-port | T→TL på PlayerHQ, AgencyOS, Meg, Forelder (380 filer). Marketing/auth urørt | `claude/tl-port-alle-skjermer-2026-08-28` | Merget #631 — token, ikke piksel-1:1 |
| F1-bug | Mandagsøkter i ukesrapport telles ikke lenger dobbelt (`lt` mot `endOfWeek`) | samme som #631 | Merget #631 |
| C1 | Workbench måned + år (leseflate; klikk dag→uke; gammel rute redirect) | `claude/c1-workbench-maned-aar-2026-08-28` | Merget #632 |
| PX-6 | AgencyOS-resten mot Train-lock (PIKSELPLAN): siterte 21 av 32 udekkede AG/AO/JV/S3/KA/EC/DG/FY/TU/GP/BO/ME-filer — de fleste var allerede token-rene (T12/T13/#631), kun siteringskommentaren manglet. Dekning 105→126 (204 totalt). Gjenstår som DOKUMENTERT gap (ny funksjonalitet, ikke bare visuell justering): AG-11 (dag-tidsakse m/ overlapp+nå-linje), AG-19 (varsel-senter), AO-13 (routing-hub), JV-01/02/03 (Jarvis-merge-kø — domenet finnes i `src/lib/domain/jarvis-merge/`, null UI-konsumenter), S3-01L/02/03 (Spiller 360 er fortsatt Paper, avvik dokumentert av T4), FY-01 (ACWR-stall-oversikt, ingen datamodell), TU-02 (turnering-detalj mangler klasse/felt/cut-felter + gameplan-lenke) | `px/6-agency-rest` | Draft PR, ikke merget |

Se `docs/natt/README.md` for hvilke natt-dokumenter som fortsatt er levende (LAUNCH-PLAN,
ACCESS-AND-GROUPS, SKJERM-STATUS, D-beslutningene) vs. denne loggen (historikk).
