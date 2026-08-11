# W4 AgencyOS maler — variant tracking (overnight, PP-7)

Status: **mal-pixel finpuss + variant-pass 2026-08-12** (natt-økt, `feat/natt-w4-planbibliotek-turneringer`).
Alle rader: m390/d1280 sign-off = Anders.

## agencyos-planbibliotek (Planer/maler/teknisk plan-familien)

| Rute | Kode-komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/plans` | `AdminPlansV2` | ja (allerede) | «Planer» | ja (`TomTilstand`, vei til Workbench/mal) | «Ny plan» (`enTing`) | [ ] |
| `/admin/plan-templates` | `AdminPlanMalerV2` | **lagt til i natt** | «Planmaler» | ja (`TomTilstand`) | «Ny mal» (`enTing`) | [ ] |
| `/admin/teknisk-plan` | `AdminTekniskPlanV2` | **lagt til i natt** (kun tagging — layout uendret) | «Teknisk plan.» | ja, to lister (spillere/maler) | «Ny mal» (ghost, ikke enTing — sekundær) | [ ] |
| `/admin/plans/[planId]` | bespoke (`_timeline`, `_phase-card`, `_kpi-card`, `_pyramide-fordeling`, `_completed-sessions`) | nei | ja (`Tittel`) | delvis — ikke sjekket i denne runden | ikke sjekket | [ ] — **åpent: ikke v2-komponentisert, egen fil-familie i `plans/[planId]/`** |
| `/admin/plan-templates/[id]` | `AdminPlanMalDetaljV2` | nei | ja | ja | ja (`CTAPill`) | [ ] |
| `/admin/plan-templates/[id]/rediger` | (skjema, ikke sjekket i detalj) | nei | ikke sjekket | n/a (skjema) | lagre-knapp forventet | [ ] |
| `/admin/plan-templates/ny` | `AdminPlanMalNyV2` | nei | ja (veiviser) | n/a (veiviser) | ja | [ ] |
| `/admin/spillere/[id]/plan` | ikke undersøkt i denne runden | — | — | — | — | [ ] — **åpent: verifiser mot samme mal ved neste pass** |

**Diff-punkter implementert i natt (planbibliotek):**
1. `plan-templates/page.tsx`: hentet `approved`-feltet fra `PlanTemplate` (fantes i skjema, ble ikke brukt).
2. `AdminPlanMalerV2`: nytt felt `godkjent` i datakontrakten.
3. `AdminPlanMalerV2`: `data-paper-slug="agencyos-planbibliotek"` på hode (manglet — familien deler fasit).
4. `AdminPlanMalerV2`: «Utkast»-status-pille på malkort som ikke er godkjent (matcher fasitens
   «Godkjent 18 / Utkast 6»-skille — reell data, ikke fabrikert).
5. `AdminPlanMalerV2`: ny «Status»-filterrad (Godkjent/Utkast) ved siden av eksisterende fase-filter.
6. `AdminPlanMalerV2`: KPI-rad utvidet fra 3 til 4 fliser — lagt til «Godkjent»-telling.
7. `AdminTekniskPlanV2`: `data-paper-slug="agencyos-planbibliotek"` på hode (kun tagging, ingen
   visuell endring — allerede riktig struktur/lister).

**Ikke gjort i natt (bevisst utelatt, minimal-diff-prinsippet):**
- `/admin/plans/[planId]` er ikke v2-komponentisert (egen fil-familie, ikke `admin/v2/`). Å bygge
  den om til master–detalj-mønsteret i fasiten er en egen skjerm-jobb, ikke en variant-fiks.
- Fasitens master–detalj-panel (liste + inspektørpanel på samme flate) er IKKE bygget inline — appen
  bruker konsekvent liste-side → egen detalj-rute (samme mønster som Godkjenninger/Bookinger). Dette er
  en arkitekturbeslutning som allerede gjelder resten av AgencyOS, ikke noe denne PR-en endret.

## agencyos-turneringer

| Rute | Kode-komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/tournaments` | `AdminTurneringerV2` | ja (allerede) | «Turneringer» | ja | «Ny turnering» | [ ] |
| `/admin/tournaments/[id]` | detalj + `FellesmeldingFlyt` | nei | ikke sjekket i detalj | n/a | fellesmelding-flyt | [ ] |
| `/admin/tournaments/ny` | `TurneringWizardV2` | nei | ja (veiviser) | n/a | ja | [ ] |
| `/admin/tournaments/dubletter` | `MergeDubletterListe` | nei | ja | ja (`TomTilstand`, «Ingen ventende dubletter») | «Slå sammen» per rad | [ ] |

**Diff-punkter implementert i natt (turneringer):**
1. `tournaments/page.tsx`: fjernet filteret som skjulte alle turneringer før inneværende uke — nå
   lastes hele sesongen, klassifisert med `erKommende` (ekte dato-sammenligning, Oslo-uke via
   `startOfWeek`).
2. `AdminTurneringerV2`: nye `PillTabs` «Kommende / Spilte» (matcher fasitens filterrad), med reelle
   tellinger per fane.
3. `tournaments/page.tsx`: ny spørring `prisma.tournament.count({ sourceOrigin: MANUAL, mergedIntoId:
   null })` — samme datagrunnlag som `/admin/tournaments/dubletter` bruker allerede.
4. `AdminTurneringerV2`: «Én ting nå»-banner (tint-kort) vises når dublett-kandidater finnes, lenker
   til den eksisterende dubletter-siden — matcher fasitens duplikat-varsel 1:1 i funksjon, ekte data.
5. `AdminTurneringerV2`: hode-undertekst utvidet med «sesong {år} · N registrerte» (fasitens mønster).

**Ikke gjort i natt:**
- Fasitens dublett-sammenligningstabell («Beholdes/Slettes» side ved side) er IKKE flyttet inn på
  hovedsiden — den ligger fortsatt på egen rute `/admin/tournaments/dubletter`, som allerede har en
  fullverdig implementasjon (algoritme + UI). Banneren over lenker dit i stedet for å duplisere UI-en.
- `/admin/tournaments/[id]` og `/admin/tournaments/ny` er ikke pixel-sjekket i denne runden (kun
  strukturelt bekreftet at de bruker v2-komponenter).

Oppdateres fortløpende under overnight.
