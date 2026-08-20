# Rutefasit for Claude Code — tillegg 20.08.2026

> **Fullregisteret bor i repoet:** `docs/port/rutefasit.md` (Rutefasit v2, 16.08.2026 —
> speilet fra «Rutekart v2 - portering og komponentfasit.html» på rot). Den lokale kopien
> ble flyttet dit 17.08 og slettet her; denne fila gjenoppstår som **tillegget** for
> treningsplanleggings-skjermene 20.08.2026. Sonnet: les repoets rutefasit først, og legg
> radene under inn i den. Samme fire kolonner, samme én-linje-test for avvik.

## Nye og endrede ruter (siden zip 16.08.2026 21:11)

| Rute | Mal-fasit | Avvik (hele forskjellen) | Komponenter |
|---|---|---|---|
| /portal/onboarding/trening **(NY)** | `fase2/playerhq/playerhq-onboarding-tillegg.html` | — (egen mal) | TallStepper (NY), DagVelger (NY), MaaleFelt (NY) |
| /portal/meg/innstillinger **(endret)** | `fase2/playerhq/playerhq-innstillinger.html` | Ny Visning-gruppe med Standard/Tour-radiovalg — ellers uendret. | — (RadioGroup-rader finnes) |
| /portal/meg/profil **(endret)** | `fase2/playerhq/playerhq-profil.html` | Nå eneste profil-fasit (fase1/spillerprofil.html utgått); + «hvem ser deg», testhistorikk og grupper som tre nye kort. | — |
| /portal/gjennomfore/[id] **(endret)** | `fase2/playerhq/playerhq-okt-detalj.html` | + rediger-tilstand og teknikk-dimensjon per drill (motorikk-velger KUN på fullsving). | TallStepper (NY) |
| /portal/tren/teknisk-plan/[planId] **(endret)** | `fase2/playerhq/playerhq-teknisk-plan.html` | + målmatrise (motorikk × miljø), rep-telling per fokus og statusrapport med spredning i tre kontekster. | MaalMatrise (NY) |
| Sløyfa UNDER **(endret)** | `fase1/playerhq-live-okt.html` | + hurtigtapp +5/+10/+25, FYS-serielogging, kondisjon per sone-segment, spontan drill og pausetelling. | HurtigTapper (NY), SettLogger (NY), SoneSegmentLogger (NY), TallStepper (NY) |
| Sløyfa ETTER **(endret)** | `fase1/playerhq-live-summary.html` | + tre stjernerader (fokus/gjennomføring/mestring) og total pausetid. | StjerneRad (NY) |
| /admin/grupper/[id] **(endret)** | `fase2/agencyos/agencyos-gruppe-detalj.html` | + «denne økta blir nå din egen»-tilstanden (frigi ved avlysing), hovedcoach-begrepet, og laster/feil-tilstand. | — (ConfirmDialog finnes) |
| Workbench · periodemal **(avklart)** | `fase1/workbench-periodemal.html` | Eneste fasit for flyten (antall økter per pyramide → skall-økter → kø av ufylte); `fase2/agencyos/agencyos-periodemal.html` er utgått. | — |
| Workbench · kalender **(uendret 20.08-fasit)** | `fase1/workbench-desktop.html` | Årstidslinje + skall-økter finnes allerede i både d1280 og m390; ingen ny utvidelse i denne runden. | — |

## Nye komponenter samlet (Sonnet må bygge disse — de finnes IKKE i `_ds_bundle.js`)
- **TallStepper** — numerisk stepper (− / verdi / +, 44 px mål). Brukes i okt-detalj rediger, live-øktas FYS-logging og onboarding-tillegget.
- **MaalMatrise** — rutenett motorikk × miljø, reps gjort/mål per celle, «—» = ikke planlagt, nådd = --up. Ordet «belastning» vises aldri.
- **HurtigTapper** — +5/+10/+25-rad under hovedtapperne i live-økt.
- **SettLogger** — FYS-serielogging: reps + vekt (2,5 kg-steg), «Logg sett», sett-liste.
- **SoneSegmentLogger** — kondisjonssegmenter: Oppvarming/Drag/Hvile, sone 1–5, tid per segment.
- **StjerneRad** — 1–5-vurdering med SVG-stjerner (fylt = --fg, aldri oransje).
- **DagVelger** — 7-dagers flervalgsrad for foretrukne treningsdager.
- **MaaleFelt** — tallfelt med enhetsetikett (m/fot) og forklaringslinje.

Detaljene per skjerm står i `fase2/manifest-utkast-*.md` (ett manifest per ny/utvidet skjerm, 20.08.2026).
