# `designsystem/team-norway/` — lokalt speil

Speil av Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
(namespace `ClawDesignTeamNorwayGolf_a03bf9`). Importert 30.08.2026 fra
`~/Downloads/Claw Design — Team Norway Golf.zip`.

**Dette er IKKE kilden.** Samme regel som `designsystem/wang/`: Claude Design-prosjektet er
fasiten, dette speilet ligger her for rask lesing og for at designet skal være synlig i PR-en.
Det oppdateres ikke automatisk. `uploads/` (6 MB skjermbilder) og thumbnails er utelatt.

## Hva som gjelder hvor

| Mappe | Innhold |
|---|---|
| `readme.md` | Systemets egen dokumentasjon — **fasit for stil og regler** |
| `tokens/` | colors · typography · spacing · effects. Koden er fasit for verdier |
| `styles.css` | Eneste fil en konsument trenger å linke |
| `components/` | core (Button/Badge/Card/Input/Select) · data (MetricTile/StatBar/ScaleRating/DataTable) · brand (Logo/Hero/SectionHeader/PyramidDiagram) |
| `guidelines/` | 15 foundation-kort |
| `templates/` | 12 skjermmaler, `.dc.html` |
| `docs/team-norway-workdesk-skjermplan.md` | Skjermplanen — hva som er bestilt, hva som gjenstår |
| `assets/logo/` | Offisiell logo (PNG beskåret fra JPEG) |

## Kjerneverdier (målt i `tokens/`, ikke gjenfortalt)

- Navy `#012B5D`, merkevarerød `#D70232` — begge målt fra logofilen
- Statusrød er en ANNEN farge: `#C2352B`. Merkevarerød er identitet, aldri status
- Schibsted Grotesk (display + body) · IBM Plex Mono (alt som måles)
- Radius 6 · 10 · 14 · 20 · 28 · 999. Skygger sm/md/lg. Romskala 2→128 (4px-basis)
- Lys flate er standard. Mørk (`#06111F`) er en ROLLE: hero, seksjonsskille, presentasjon
- `--ink-400` (`#647280`) er lyseste gråtone som får bære tekst. `--ink-300` og lysere er
  kanter og linjer, aldri tekst
- Diagonalen (`--clip-diagonal-b/-t`, 56px) er systemets ene bevegelse — hero og
  seksjonsskille, aldri kort eller kontroller
- Aldri `ease-in` på grensesnitt

## TRE KONFLIKTER — alle avgjort 30.08.2026

**1. `SKILL.md` motsier `readme.md` og tokens. Readme + tokens vinner.**
`SKILL.md` sier «ingen skygger, ingen gradienter, ingen avrundede piller» og oppgir Jost +
Public Sans som skrifter. Ingen av delene stemmer med systemet slik det faktisk er bygget:
`tokens/effects.css` har tre skyggenivaer og `--radius-full`, og `tokens/typography.css` har
Schibsted Grotesk + IBM Plex Mono. `SKILL.md` er en tidligere generasjon av samme prosjekt.
Koden er fasit — ikke bygg etter `SKILL.md`.

**2. TN-rødt — AVGJORT: `#D70232`.** (Anders 30.08.2026.) Målt fra logofilen, eneste verdi med
sporbar opprinnelse i merket. Overstyrer `#D50431` i N-D2, som er rettet i MASTERPLAN.
`#BA0C2F` og `#EF2B2D` i `talenthq` er henholdsvis det norske og det amerikanske flaggets
rødfarge — plassholdere, ikke logoen.

**3. Myndighet — AVGJORT: dette systemet eier `/team-norway/*`.** (Anders 30.08.2026.)
Train-lock eier plattformflatene (PlayerHQ, AgencyOS, Forelder). Ingen skjerm har to fasiter.
Overstyrer N7-formuleringen «tegn organisasjonsflaten i Train-lock» for Team Norways del.
**WANG-flatens stil er IKKE avgjort av dette** — se MASTERPLAN beslutningskø punkt 22.

## Status per 30.08.2026

Bygget i Claw-stil: årsplan · periodeplan · samling · workbench · grupper · tester · kalender ·
utøverdashboard · evaluering · presentasjon. Skallet (`templates/app/`) og kommunikasjon er tynne.

**`templates/tn-workdesk/TnBatch1.dc.html` er i FEIL STIL.** Speilet i denne mappen er fra
zip-en (206 bytes, tom), men live i Claude Design er filen 21 741 bytes og inneholder tre
skjermer — TN-01 Hjem, TN-02 Gruppe/spillerliste, TN-03 Spiller-ark — tegnet i **Train-lock
mørk** (`#000000`, Poppins, `#8E8E93`, rail 232px). De skal tegnes om i Claw-stil, se
MASTERPLAN STEG 11 rad N7b.

**Speilet kan henge etter det levende prosjektet.** Verifiser mot Claude Design
(`a03bf94a-c923-4c04-82ff-415773557e37`) før du stoler på en fil her.

Neste bestilling: `prompt-batch-2.md` i denne mappen.
