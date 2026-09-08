# Kildekobling

repo: akgolfsoftware/Golf_Headquarters
branch: main
path: src/app/team-norway, src/lib/domain, docs

## Last sync

date: 2026-09-08T10:15:00Z

### Updated in this project

- **Handover-pakke for portering** i `handover/`: eksportmanifest, `PORTING.md`, skjermregister for TN-00–TN-21, datamodell-samling, tilgangsmatrise og åpne beslutninger.
- Tokenbroen verifisert mot `src/styles/team-norway-tokens.css`: alle 97 tokens skjermene bruker finnes i `--tn-*`-speilet. `--angle-cut`, `--spring-ui` og `--spring-momentum` mangler i speilet, men brukes ikke av noen skjerm.
- Lest fra repoet: `GroupMember.role` (PLAYER/ASSISTANT/COACH + `endedAt`), `DelingsSamtykke`, `EksternLeserGruppe`, `TnPost*`, `ParentInvitation`, `TournamentResult`, `TestDefinition`/`TestResult`, `TrainingCamp`, `TrainingPlan.publishedSnapshot`.
- Kjent divergens funnet i koden: `TnKnapp` er 40px (designet krever 44/48/56) og `TnRail` er 232px (designet 252px). Ført i `handover/PORTING.md` §3.

### Forrige sync (2026-09-08, tidligere på dagen)

- TN-15 Trenerkatalog og TN-16 Referansenivåer tegnet fra `uploads/team-norway-iup-2025.xlsx` (fanene «TN Coaches» og «Statistics») etter dekningsanalyse mot Player HQ (`src/app/portal/*`, 169 ruter).
- Logobruken rettet i 13 skjermer: falske lockups (rød strek + tekst) byttet til `assets/logo/team-norway-golf.png`.
- `docs/gap-iup-2025.md`: 14 manglende skjermer, hvorav 6 dekket av Player HQ, 6 delvis, 2 ikke.

### Forrige sync (2026-09-07)

- TN-13 Turneringsoversikt tegnet mot GolfBox-feltene i `docs/turnering-datakilder.md` (`Position.Calculated`, `ScoringToPar.ToParText`, `Rounds[]`, `Wagr`) — rader uten kilde sier «venter på data».
- TN-14 Samlingspunkt tegnet med uttak per samling som merket hull i datamodellen.
- TN-01 Organisasjonsskall rettet etter repoet: Kommunikasjon som egen femte menygruppe, Turneringer flyttet fra Uttak til Data, Samlingspunkt under Daglig.
- Rutene i systemkartet rettet til de faktiske: `/team-norway/:groupId`, `/team-norway/:groupId/dokumenter`, `/team-norway/spiller/:spillerId`.

## Screen map

| Skjerm i dette prosjektet | Filer i repoet |
|---|---|
| `templates/tn-skall/` (TN-01) | `src/lib/domain/tn-skall.ts`, `src/app/team-norway/layout.tsx` |
| `templates/tn-gruppeposter/` (TN-09) | `src/app/team-norway/[groupId]/page.tsx`, `src/lib/domain/tn-post.ts` |
| `templates/tn-post-enkeltspiller/` (TN-10) | `src/app/team-norway/spiller/[spillerId]/page.tsx` |
| `templates/tn-dokumentdeling/` (TN-11) | `src/app/team-norway/[groupId]/dokumenter/page.tsx` |
| `templates/tn-turneringer/` (TN-13) | `docs/turnering-datakilder.md`, `src/lib/turneringer/golfbox-sync.ts` |
| `templates/tn-samlingspunkt/` (TN-14) | `templates/samling/` (intern), ingen ruter i repoet ennå |
| `templates/tn-trenerkatalog/` (TN-20) | `uploads/team-norway-iup-2025.xlsx` fane «TN Coaches»; ingen ruter i repoet |
| `templates/tn-referansenivaer/` (TN-21) | `uploads/team-norway-iup-2025.xlsx` fane «Statistics»; `src/app/portal/datagolf` (kandidatkilde) |
| `handover/` (hele pakken) | `designsystem/train-lock/PORTING.md` (mønster), `src/styles/team-norway-tokens.css`, `src/lib/v2/team-norway.ts`, `src/components/team-norway/*`, `prisma/schema.prisma` |

Arbeidsdelingen: Claw eier `/team-norway/*`, Train-lock eier PlayerHQ, AgencyOS og Forelder (`.claude/rules/beslutninger.md`). Analyse- og DataGolf-skjermene tegnes aldri her.
