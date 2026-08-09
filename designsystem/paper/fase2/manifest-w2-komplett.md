# W2 — samlemanifest (komplett)

W2-bølgen er lukket. 12 flater totalt, fordelt på tre leveranser. `fase1/` urørt.

| # | Fil (`fase2/playerhq/`) | Rute | Mal | Tilstander | Én ting nå |
|---|---|---|---|---|---|
| 1 | `playerhq-analyse-hull.html` | `/portal/analysere/hull` | §12 todelt | Suksess · Tom (per fane) | — |
| 2 | `playerhq-runder-liste.html` | `/portal/mal/runder` | §9 liste + KPI | Suksess · Tom | — (ink) |
| 3 | `playerhq-runde-detalj.html` | `/portal/mal/runder/[id]` | §12 detalj | Suksess · Tom (hurtigregistrert) | — |
| 4 | `playerhq-gameplan-liste.html` | `/portal/gameplan` | §9 liste | Suksess · Tom | — |
| 5 | `playerhq-gameplan-banekart.html` | `/portal/gameplan/[baneId]` | §12 detalj | Suksess · Tom | — |
| 6 | `playerhq-trackman-liste.html` | `/portal/mal/trackman` | §9 liste | Suksess · Tom | — (ink) |
| 7 | `playerhq-trackman-detalj.html` | `/portal/mal/trackman/[id]` | §12 detalj | Suksess · Tom | — |
| 8 | `playerhq-datagolf.html` | `/portal/datagolf` | §12 hero+kategori | Suksess · Tom | — |
| 9 | `playerhq-historikk-filter-sheet.html` | `/portal/analysere/historikk` | §9 + bunn-sheet | Suksess · Tomt treff | — (ink «Vis N treff») |
| 10 | `playerhq-hjem-varsler.html` | `/portal/varsler` | §11 fangst-hub | Suksess · Alt lest · Tom kategori | **Bekreft flyttet time** |
| 11 | `playerhq-putte-lab.html` | `/portal/analysere/putting` | §12 m/ faner | Suksess · Tom (datakrav) | — |
| 12 | `playerhq-talent-stige.html` | `/portal/talent` | §12 m/ faner | Suksess · Ikke plassert | — |
| 13 | `playerhq-hjem-rest.html` | `/portal/utenfor-banen` | §11 hub m/ faner | Suksess · Ingenting aktivt | **Start dagens fysiske økt** |

## Konsolideringsvedtak i W2

- `/portal/analyse` → redirect, ikke tegnet.
- `/portal/mal/runder/ny` og `/portal/gameplan/[bane]/hull/[nr]` → editorflater, ikke visninger; egen mini-batch når §8-skjemamønsteret er avklart.
- **Fysisk, venner og utfordringer slått sammen** til én flate «Utenfor banen» (3 faner) i stedet for tre lister — de deler datagrunnlag og har lavt volum hver for seg.
- **Talent-undersidene** slått sammen til én flate med Stigen / Krav / Neste trinn — undersidene i koden er faner, ikke ruter.
- **DataGolf** tegnet som egen rute (ikke fane i Analyse); nav-plassering fortsatt blokkert av PR-F.

## Fargeregel holdt gjennom hele bølgen

Maks én solid clay per tilstand — kun flate 10 og 13 har en. Alt annet er ink/ghost.
`--up`/`--up-raw`/`--dn` for data, aldri lime/grønn. Referansestreker er `--hairline`.

## Porte først — topp 5

1. `playerhq-hjem-varsler.html` — fangst av ubesvart, finnes ikke i dag
2. `playerhq-historikk-filter-sheet.html` — delt sheet-mønster som låser opp alle lister
3. `playerhq-runder-liste.html` + `-runde-detalj.html` — datagrunnlaget alt annet peker på
4. `playerhq-putte-lab.html` — størst SG-gevinst per innsats
5. `playerhq-trackman-liste.html` / `-detalj.html` — importflyten som mater resten

## Neste

W3 Meg/Booking/Coach · W4 AgencyOS multi-coach legend+wizard · W5 Auth/Forelder · W6 WANG/GFGK.
