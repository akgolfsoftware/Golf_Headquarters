# Manifest — `fase2/playerhq/playerhq-onboarding-tillegg.html`

> **UTKAST — krever Anders' godkjenning.** Generert 20.08.2026 fra malinnholdet (brief «treningsplanlegging» 20.08.2026). Ikke fasit før godkjent.

| Felt | Verdi |
|---|---|
| Fil | `fase2/playerhq/playerhq-onboarding-tillegg.html` |
| Fidelitet | MAL — NY skjerm 20.08.2026; mørk modus og tilstander i `w3-base.css` |
| Rute | /portal/onboarding/trening — NY rute (steg 4 av 5) |

## Nytt siden forrige zip (16.08.2026 21:11)
- Hele skjermen er ny: treningstid (timer per uke + foretrukne dager) og fasiliteter med fysiske mål (rangelengde i meter, maks puttelengde i fot, muligheter som flervalg).
- Alt kan hoppes over — «Hopp over — fyll ut senere» står ved siden av Fortsett.
- Tallene brukes av planleggingen (drillforslag innenfor anleggets mål) og begrenser aldri hva spilleren kan planlegge.

## Tilstander tegnet
forhåndsutfylt (F) · tom (T, klubb uten anleggsdata) · laster (L) · feil (E) — lys og mørk

## NYE komponenter (finnes ikke i biblioteket — Sonnet må bygge dem)
- **DagVelger** — 7-dagers flervalgsrad (min. 44 px per dag) for foretrukne treningsdager
- **TallStepper** — delt med okt-detalj og live-økt
- **MaaleFelt** — tallfelt med enhetsetikett (m/fot) og forklaringslinje

## Avvik per rute
Putteavstander i fot, alt annet i meter (VOKABULAR §2). Standard/Tour-bryteren bor i innstillinger, ikke her.
