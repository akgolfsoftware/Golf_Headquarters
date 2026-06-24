# AK Golf Testbatteri — Komplett referanse

> **Formål:** Komplett kilde til sannhet for Claude Design, scorekort-design, leaderboards, coach-analyse og spillerflyt.
> Oppdatert: 2026-06-19. Kilde: `prisma/seed-data/ngf-test-battery.json` + `prisma/scripts/seed-ngf-test-protocols.ts` + `src/lib/portal-tester/test-scoring.ts`.

## Pyramiden — 5 søyler
| Søyle | Kode | Innhold |
|---|---|---|
| Fysisk | FYS | Styrke, eksplosivitet, klubbhodehastighet |
| Teknisk | TEK | Gate-tester, mekanikk, presisjonskontroll |
| Slagteknikk | SLAG | PEI-baserte slag mot mål på range/bane |
| Spillforståelse | SPILL | Putting, scoring, beslutninger |
| Turneringsmodus | TURN | PEI-test i reell runde på bane |

## PEI-formelen (kjernen)
**PEI = Nærhet til hull ÷ Slagavstand.** Nærspill: spiller taster resultatM direkte. Fullslag: nærhet = √((lengde − carry)² + side²); PEI = nærhet / lengde. Snitt-PEI = gjennomsnitt per slag. Lavere er bedre. PGA topp 40 ≈ 5 % på innspill.

## Benchmark-nivåer (beste → svakeste)
pga_top40 (PGA topp 40) · pga_avg (PGA-snitt) · dpw_kft (DP World / Korn Ferry) · challenge (Challenge Tour) · nordic (Nordic League) · elite_junior (Norsk elitejunior) · scratch (Scratch). Kilde: DataGolf v1, 2026-06.

## ALLE 20 TESTER (oversikt)
| # | Navn | Søyle | Scoring-type | Enhet | Retning | Benchmarks |
|---|---|---|---|---|---|---|
| 1 | Driver Basic | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 2 | Driver Gate | TEK | hit_rate | % | høyere | DataGolf v1 |
| 3 | Inspill Basis | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 4 | Inspill 120 m | SLAG | distance_average | m | lavere | DataGolf v1 |
| 5 | Inspill 160 m | SLAG | distance_average | m | lavere | DataGolf v1 |
| 6 | Inspill Variation | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 7 | Wedge Variation | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 8 | TN Wedge Gate | TEK | points_total | poeng | høyere | intern v2 |
| 9 | 8-Ball Variation | SLAG | points_total | poeng | høyere | DataGolf v1 |
| 10 | TN Nærspill Gate | TEK | points_total | poeng | høyere | intern v2 |
| 11 | Putt 1–3 m | SPILL | hit_rate | % | høyere | DataGolf v1 |
| 12 | TN Putt Gate | TEK | hit_rate | % | høyere | intern v2 |
| 13 | Putt Speed Control | SPILL | average | m | lavere | intern v2 |
| 14 | TN VISA Express | TEK | points_total | poeng | høyere | intern v2 |
| 15 | Trapbar Deadlift | FYS | value_max | kg | høyere | Olympiatoppen v2 |
| 16 | Benkpress | FYS | value_max | kg | høyere | Olympiatoppen v2 |
| 17 | Standing Long Jump | FYS | value_max | cm | høyere | Olympiatoppen v2 |
| 18 | Ball Throw | FYS | value_max | cm | høyere | Olympiatoppen v2 |
| 19 | Clubhead Speed (CHS) | FYS | value_max | mph | høyere | DataGolf v1 |
| 20 | PEI Test Bane | TURN | pei_average | PEI % | lavere | DataGolf v1 |

> **Full detalj per test** (gjennomføring, inputfelter, scoring-formel, benchmark-tabeller) ligger i prosjektets `claude-code-handoff/TESTBATTERI.md` (844 linjer). Denne Drive-versjonen er sammendraget; bygg scorekort/leaderboards mot prosjektfila.

## Scorekort-design — hva hvert scorekort MÅ vise
- **Per slag (live):** slagtype/situasjon · instruksjon · dynamiske inputfelter · live PEI/poeng-beregning.
- **Oppsummering:** total score m/enhet · snitt per slag · benchmark-badge · sparkline/historikk · delta mot forrige (farge) · pyramide-tilhørighet.
- **Leaderboard:** navn + avatar · score m/enhet · benchmark-badge · delta mot eget beste · dato · auto-sortering etter retning.

## Viktig: FYS-resultatformel AVVENTER
FYS-testene (15–18) scores i dag som rå beste verdier (`value_max`). En samlet FYS-indeks-formel er **ikke låst** — venter på Anders. Tegn FYS-scorekort med plassholder-verdier. Ikke hardkod FYS-indeks-referanser.
