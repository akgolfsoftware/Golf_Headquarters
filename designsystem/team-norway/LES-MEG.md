# `designsystem/team-norway/` — lokalt speil

Speil av Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
(namespace `ClawDesignTeamNorwayGolf_a03bf9`). Sist synket **08.09.2026** fra
`~/Downloads/Claw Design — Team Norway Golf.zip` (22:03). Forrige synk: 30.08.2026.

**Dette er IKKE kilden.** Samme regel som `designsystem/wang/`: Claude Design-prosjektet er
fasiten, dette speilet ligger her for rask lesing og for at designet skal være synlig i PR-en.
Det oppdateres ikke automatisk. `uploads/` (6,6 MB: IUP-regneark med trenernavn + skjermbilder)
er holdt utenfor — repoet er offentlig.

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
| `handover/` | Porteringspakke 08.09: PORTING, skjermregister TN-00–TN-21, datamodell, tilgang, åpne beslutninger |
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

**1. `SKILL.md` motsa `readme.md` og tokens. RETTET 08.09.2026 (ferdigstilling A1).**
`SKILL.md` peker nå bare til `tokens/`, `components/` og `readme.md`. De gamle påstandene
(Jost + Public Sans, «ingen skygger, ingen piller») er borte. Readme + tokens vinner fortsatt
ved konflikt.

**2. TN-rødt — AVGJORT: `#D70232`.** (Anders 30.08.2026.) Målt fra logofilen, eneste verdi med
sporbar opprinnelse i merket. Overstyrer `#D50431` i N-D2, som er rettet i MASTERPLAN.
`#BA0C2F` og `#EF2B2D` i `talenthq` er henholdsvis det norske og det amerikanske flaggets
rødfarge — plassholdere, ikke logoen.

**3. Myndighet — AVGJORT: dette systemet eier `/team-norway/*`.** (Anders 30.08.2026.)
Train-lock eier plattformflatene (PlayerHQ, AgencyOS, Forelder). Ingen skjerm har to fasiter.
Overstyrer N7-formuleringen «tegn organisasjonsflaten i Train-lock» for Team Norways del.
**WANG-flatens stil er IKKE avgjort av dette** — se MASTERPLAN beslutningskø punkt 22.

## Status per 08.09.2026

Synket inn: ferdigstilling (token-pass i malene, trykkmål 44 px, kildelinje, tom/laster/feil),
handover-pakke, nye skjermer (bl.a. TN-13 turneringer, TN-14 samlingspunkt, TN-15/TN-20
trenerkatalog, TN-16/TN-21 referansenivåer, TN-17 manuell turnering, TN-18 trenere/tilgang,
systemkart, inviter, månedsplan). Navy `#012B5D` og merkevarerød `#D70232` uendret (målt
identisk mot forrige speil).

Beholdt fra repoet, fantes ikke i zip: `prompt-batch-2.md`, `prompt-batch-3.md`,
`prompt-tn03-fellestesting.md`, `templates/app/`, `templates/kommunikasjon/` (tynne maler).

**Speilet kan henge etter det levende prosjektet.** Verifiser mot Claude Design
(`a03bf94a-c923-4c04-82ff-415773557e37`) før du stoler på en fil her.

Porteringskontrakt: `handover/PORTING.md` + `handover/SKJERMREGISTER.md`. Åpne spørsmål til
Anders: `handover/APNE-BESLUTNINGER.md`.
