# Grillingen runde 9 — WANG Toppidrett og Team Norway (28.09.2026)

Mål: hvordan WANG, Team Norway og PlayerHQ henger sammen på testbatteri og IUP, og hvordan
spilleren deler tilgang slik at WANG og Team Norway ser spilleren komplett, som AgencyOS gjør.
Ingen kode i denne runden. Metode som [runde 8](https://github.com/akgolfsoftware/Golf_Headquarters/pull/988).

Kilder fra Anders 28.09 (lokalt, ikke i repoet — inneholder kontaktinfo):
`~/ak-brain/claude-code/prompter/vedlegg/team-norway-iup-2025.xlsx` (IUP-malen WANG og Team
Norway har avtalt å bruke) og `wang-golf-6-ars-lop.xlsx` (WANGs 6-årsløp: 8. klasse–VG3,
treningsmengde, turneringsrunder, leiruker, kompetansemål, testbatteri).

## Status

| # | Område | Grillet | Bekreftet av Anders | Bestilling sendt |
|---|---|---|---|---|
| 1 | IUP — felles modell fra PlayerHQ | ja | ja, 28.09 | — |
| 2 | Testbatteri | — | — | — |
| 3 | Deling og tilgang | — | — | — |
| 4 | WANG: trener og sportssjef | — | — | — |
| 5 | Team Norway: coach | — | — | — |
| 6 | Spillerens side i PlayerHQ | — | — | — |

## Kartlegging (målt 28.09)

**Kode**
- Ett felles testlager for AK, WANG og Team Norway (`TestDefinition`/`TestResult`/`TestSession`,
  `prisma/schema.prisma`), seedet med 20 tester (`prisma/seed-data/ngf-test-battery.json`).
  TN v3-katalogen i `src/lib/portal-tester/tn-catalog.ts` lagrer i samme tabeller.
- IUP finnes bare i WANG (`/team-wang/coach/iup/[elevId]`), lagret som `GroupPeriodGoal`
  (mål per periode med egen- og trenervurdering). Ingen IUP i PlayerHQ. Mangler resultat- mot
  prosessmål, årsplan per spiller, evaluering og utviklingssjekk.
- Samtykke til deling finnes (`DelingsSamtykke`: TEST_RESULTATER, STATS, KOMPLETT_PROFIL; forelder
  under 16). **WANG- og TN-trenernes tilgang sjekker ikke samtykke** — gruppemedlemskap holder
  (`src/app/team-wang/_data/wang-tilgang.ts`, `tn-arbeidsflate.ts` `hentTnSpillerTilgang`).
- KOMPLETT_PROFIL åpner ingen skjerm i dag.

**Claude Design**
- WANG `6cfa623c`: 45 skjermer, roller Sportssjef og Trener. IUP per elev (WG-02) med tre
  måltyper, målbane, treningsvolum og samtalelogg. Samtykke per organisasjon som lesevisning
  (WANG-34). 11 NGF-tester merket uavklart. Noen skjermer nevner fortsatt roller fjernet 27.09.
- Team Norway `bc3e41fc` («Team Norway App delivery»): 19 skjermer. Ingen IUP. Driver Basic,
  Inspill Basic, Wedge Variation og 8-ball mangler; bare fysiske protokoller og to utkast.
  Deling med PlayerHQ er ikke tegnet.

## 1. IUP

### Anders forteller
WANG og Team Norway har avtale om å bruke samme IUP (Team Norways ark). PlayerHQ skal dekke alle
parameterne. Kategoriene er AK Golf A–K etter snittscore, ikke WANGs E–A+. Pyramidenavnene er
AK sine. Testbatteriene er de samme.

### Spørsmål og svar
- 9.1/9.7/9.8 Egen IUP-side i PlayerHQ? Anders: «Hvorfor trenger vi en egen IUP-fane? Treffer vi
  ikke alle punktene allerede i PlayerHQ?» → Ingen fane for spilleren; samlevisning bare for
  trenerne (9.8 a).
- 9.2 Eier: spilleren. «AK Golf står fritt til å fortsette å analysere og bruke data» uten navn.
- 9.3 IUP-året starter uke 43 (ny grunnperiode). Evaluering hver fjerde uke.
- 9.4 Utviklingssjekkens spørsmål brukes også i AK Golf.
- 9.5 Kompetansemål bare på WANG-skjermene, ikke AK Golf og ikke Team Norway.
- 9.6 a Kort sjekk hver fjerde uke (prosessmål og så videre), full sesongevaluering årlig.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Én IUP** for AK Golf, WANG og Team Norway, med Team Norways IUP-ark som mal.
- **Spilleren eier IUP-en.** AK Golf kan analysere og bruke dataene anonymisert; det står i
  vilkårene.
- **Ingen egen IUP-fane i PlayerHQ.** Delene finnes i Plan, Stats, Målsetninger og Meg.
- **Nytt i PlayerHQ:** kort sjekk hver fjerde uke i I dag og innboksen (prosessmål,
  målsetninger, utviklingssjekk). Sesongevaluering uka før uke 43.
- **Utviklingssjekken** bruker arkets spørsmål (Ung, Junior, Amatør, Profesjonell) for alle
  spillere i AK Golf.
- **Samlet IUP for trenerne:** fanen «IUP» i Spiller 360, WANG og Team Norway, i samme rekkefølge
  som arket. Alt hentes fra PlayerHQ, ingenting føres to ganger.
- **Kategorier** AK Golf A–K etter snittscore. **Pyramiden** FYS, TEK, SLAG, SPILL, TURN.
  **Testbatteriet** er det samme for alle tre.
- **Kompetansemål fra Udir** bare på WANG-skjermene, brutt ned på pyramiden.
