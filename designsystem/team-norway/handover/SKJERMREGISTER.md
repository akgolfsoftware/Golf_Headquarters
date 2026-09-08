# SKJERMREGISTER — TN-00 til TN-21 og de generelle malene

Én rad per skjerm. Sortert slik at det som kan bygges nå står øverst.
Alle designfiler ligger under `designsystem/team-norway/templates/`.

Rollekolonnen bruker forkortelsene fra `TILGANGSMATRISE.md`:
**SS** sportssjef · **TR** trener på gruppen (`GroupMember.role = COACH`) ·
**HJ** hjelpetrener (`ASSISTANT`) · **SP** spiller (`PLAYER`) ·
**FO** foresatt (`ParentRelation`) · **EL** ekstern leser (`EksternLeserGruppe`).

Tilstandskolonnen: **S** suksess · **T** tom · **L** laster · **F** feil.
Alle 21 TN-skjermer har alle fire.

---

## Kan bygges nå

Modellen finnes, tilgangen er avklart, ingen beslutning venter.

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander | Komponenter | Merknad |
|---|---|---|---|---|---|---|---|
| TN-18 | Trenere og tilgang | `tn-trenere-tilgang/TnTrenereTilgang.dc.html` | `/team-norway/tilgang` | SS | S T L F | `DataTable`, `TnPille`, `TnKnapp`, `Input`, `TnAvatarInitialer` | `GroupMember.role` + `joinedAt`/`endedAt` dekker alt. **Bygg denne først** |
| TN-09 | Gruppeposter | `tn-gruppeposter/TnGruppeposter.dc.html` | `/team-norway/[groupId]` | SS TR HJ SP | S T L F | `TnPostTidslinje`, `TnPostKomponer`, `TnKort` | **Bygget.** Sammenlign mot fasit — designet er ryddet til tokens siden porten |
| TN-10 | Post til enkeltspiller | `tn-post-enkeltspiller/TnPostEnkeltspiller.dc.html` | `/team-norway/spiller/[spillerId]` | SS TR HJ SP FO | S T L F | samme som TN-09 | **Bygget.** Foresatt i mottakerlinjen; posting sperret uten foresatt |
| TN-11 | Dokumentdeling | `tn-dokumentdeling/TnDokumentdeling.dc.html` | `/team-norway/[groupId]/dokumenter` | SS TR HJ SP | S T L F | `TnDokumentTabell`, `TnDokumentOpplasting` | **Bygget.** Kvitteringsbrøk fra `TnPostLesekvittering` |
| TN-01 | Organisasjonsskall | `tn-skall/TnSkall.dc.html` + `TnMerMobil.dc.html` | `/team-norway/*` (layout) | alle | S T L F | `TnRail`, `TnRailMobil`, `Logo` | Seks menygrupper. Tom = «ingen grupper tildelt». Rett `TnRail` til 252 px |
| TN-20 | Trenerkatalog | `tn-trenerkatalog/TnTrenerkatalog.dc.html` | `/team-norway/apparatet` | SS TR HJ SP | S T L F | `DataTable`, `TnPille` | Navnene er ekte data fra IUP-arket, ikke eksempler. Katalogen gir **ingen** tilgang |
| TN-12 | Samtykke | `tn-samtykke/TnSamtykke.dc.html` | `/portal/samtykke` (spiller/foresatt) | SP FO | S T L F | `TnKort`, toggle | `DelingsSamtykke` finnes og er append-only. Trekk = ny rad, aldri update |
| TN-19 | Inviter spiller | `tn-inviter-spiller/TnInviterSpiller.dc.html` | `/team-norway/inviter` | SS | S T L F | `DataTable`, `Input`, `TnPille`, `TnKnapp` | Kan bygges nå **hvis** `ParentInvitation`-mønsteret gjenbrukes for spiller — se `DATAMODELL.md` §2 |

## Venter på datamodell

Skjermen er tegnet ferdig; feltene finnes ikke.

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander | Komponenter | Mangler |
|---|---|---|---|---|---|---|---|
| TN-13 | Turneringsoversikt | `tn-turneringer/TnTurneringer.dc.html` | `/team-norway/turneringer` | SS TR HJ SP | S T L F | `DataTable`, `TnPille` | Rundescore og feltsnitt per runde. `TournamentResult` har bare `position`/`score` — se `DATAMODELL.md` §1 |
| TN-17 | Legg til turnering manuelt | `tn-turnering-manuell/TnTurneringManuell.dc.html` | `/team-norway/turneringer/ny` | SS TR SP | S T L F | `Input`, `TnPille`, `TnKnapp` | Kildemerking og belegg på resultatraden. §1 |
| TN-07 | Rangliste | `tn-rangliste/TnRangliste.dc.html` | `/team-norway/rangliste` | SS TR HJ | S T L F | `DataTable`, `StatBar`, `MetricTile` | Samme rundedata som TN-13, pluss protokollversjon på testtall. §1, §3 |
| TN-04 | Protokollbibliotek | `tn-protokollbibliotek/TnProtokollbibliotek.dc.html` | `/team-norway/protokoller` | SS TR HJ | S T L F | `DataTable`, `TnPille` | Versjon, eier-organisasjon og deling på tvers av organisasjoner. §3 |
| TN-05 | Protokolldetalj | `tn-protokolldetalj/TnProtokolldetalj.dc.html` | `/team-norway/protokoller/[id]` | SS TR | S T L F | `TnKort`, `DataTable`, `ScaleRating` | Versjonshistorikk og låsedato. Attestering finnes (`TestResult.witnessStatus`). §3 |
| TN-03 | Fellestesting | `tn-fellestesting/TnFellestesting.dc.html` | `/team-norway/fellestesting` | SS TR HJ | S T L F | `Input`, `Select`, `ScaleRating`, `DataTable` | Kø-tilstand for føring av flere spillere i én seanse. `TestSession` er per spiller. §3 |
| TN-14 | Samlingspunkt | `tn-samlingspunkt/TnSamlingspunkt.dc.html` | `/team-norway/samlinger/[id]` | SS TR HJ SP | S T L F | `TnKort`, `TnPille`, `DataTable` | Samling på gruppenivå med uttak og bekreftelse. `TrainingCamp` er per spiller. §4 |
| TN-06 | Uttaksliste | `tn-uttak/TnUttak.dc.html` | `/team-norway/uttak` | SS TR | S T L F | `ScaleRating`, `DataTable`, `PyramidDiagram` | Uttak som modell — hvem er vurdert til hva, og svar fra spiller. §4 |
| TN-02 | Oversikt | `tn-oversikt/TnOversikt.dc.html` + `TnOversiktMobil.dc.html` | `/team-norway` | alle | S T L F | `CoverageCard`, `MetricTile`, `Hero` | Dekningsgraden kan telles nå; «kommende samlinger» krever §4 |
| TN-16 | Månedsplan | `tn-manedsplan/TnManedsplan.dc.html` | `/team-norway/manedsplan` | SS TR HJ SP | S T L F | `MetricTile`, `DataTable`, `StatBar` | Avvik målt mot **publisert** plan. `TrainingPlan.publishedSnapshot` finnes; avviksberegningen gjør ikke. §5 |
| TN-21 | Referansenivåer | `tn-referansenivaer/TnReferansenivaer.dc.html` | `/team-norway/referansenivaer` | SS TR HJ SP | S T L F | `DataTable`, `StatBar` | Referansesettet mangler sesong i kilden; TN-junior-kolonnen står tom med vilje. §3 |
| TN-00 | Workdesk pulje 1 | `tn-workdesk/TnBatch1.dc.html` | `/team-norway/spillere` | SS TR HJ | S T L F | `TnRail`, `TnKort`, `TnPille`, `MetricTile` | Tre rammer: hjem, spillerliste, spiller-ark. «Krever handling»-listen trenger §4 og §5; spillerlisten kan bygges nå |
| TN-08 | Skoleoversikt | `tn-skoler/TnSkoler.dc.html` | `/team-norway/skoler` | SS TR HJ EL | S T L F | `CoverageCard`, `StatBar`, `DataTable` | `User.school`/`schoolYear` er fritekst. Aggregatet kan bygges; terskelen på tre krever normaliserte skolenavn. §6. **Navn-varianten er låst — se matrisen** |

## Venter på beslutning

Tegnet, men ruten eller regelen er en antakelse.

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander | Komponenter | Venter på |
|---|---|---|---|---|---|---|---|
| TN-15 | Collegegruppen | `tn-collegegruppen/TnCollegegruppen.dc.html` | `/team-norway/college` | SS TR SP | S T L F | `Hero`, `DataTable`, `TnPille` | Om studieår og NCAA-kollisjon skal være egen modell eller felt på gruppen. `APNE-BESLUTNINGER.md` B4 |
| TN-17 | Legg til turnering manuelt | (over) | (over) | SS TR SP | S T L F | (over) | Om **spilleren selv** får legge inn, ikke bare treneren. B1 |
| TN-18 | Trenere og tilgang | (over) | (over) | SS | S T L F | (over) | Om bare sportssjef kan gi tilgang, eller trener kan legge til hjelpetrener i egen gruppe. B2 |
| TN-19 | Inviter spiller | (over) | (over) | SS | S T L F | (over) | Om «åpnet» skal måles, og hvem invitasjonen går til når spilleren er under 15. B3 |
| TN-13 | Turneringsoversikt | (over) | (over) | SS TR HJ SP | S T L F | (over) | Om skjermen bor i Claw under Data eller er en Train-lock-rute. B5 |

Merk at TN-13, TN-17, TN-18 og TN-19 står i to tabeller: de har både et datahull og en
åpen beslutning. TN-18 kan likevel bygges nå — beslutningen B2 utvider hvem som kan
bruke skjermen, den endrer ikke skjermen.

## Generelle maler

Ikke TN-skjermer. De er startpunkter for planleggingsflater og har ingen `/team-norway/*`-rute
i seg selv; flere av dem er allerede dekket av Train-lock i PlayerHQ.

| Navn | Designfil | Status | Merknad |
|---|---|---|---|
| Workbench | `workbench/Workbench.dc.html` + `WorkbenchMobil.dc.html` | Venter på beslutning | Coach-modus: kilderail, ukerutenett, publisering. Overlapper Train-locks `WB-*`. Avklar eierskap før porting |
| Årsplan | `arsplan/Arsplan.dc.html` | Venter på datamodell | Svømmebaner, ACWR, volum. `SeasonPlan` + `GroupPeriodBlock` finnes; ACWR-beregningen ikke |
| Periodeplan | `periodeplan/Periodeplan.dc.html` | Venter på datamodell | Månedsrutenett med ukebelastning. Samme som TN-16 §5 |
| Samling | `samling/Samling.dc.html` | Venter på datamodell | Time for time, fellesøkter + egentid. §4 |
| Grupper | `grupper/Grupper.dc.html` | Kan bygges nå | Gruppeuke som materialiseres per spiller. `GroupSchedule` + `TrainingPlanSession.sourceGroupId` finnes |
| Tester | `tester/Tester.dc.html` | Kan bygges nå | Liste per område, resultat, trend, forsøk. `TestDefinition`/`TestResult` dekker det |
| Kalender | `kalender/Kalender.dc.html` | Kan bygges nå | Uke med minikalender, nålinje, detaljpanel. `Booking`, `CalendarEvent`, `GroupSchedule`, `PlayerBusyBlock` |
| Utøverdashboard | `utover-dashboard/UtoverDashboard.dc.html` | Delvis | Hero + nøkkeltall + pyramide kan bygges; statustabellen trenger §3 |
| Evaluering | `evaluering/Evaluering.dc.html` | Kan bygges nå | Egenevaluering, de fire trinnene. Målbilde → Planer → Gjennomføring → Evaluering |
| Presentasjon | `presentasjon/Presentasjon.dc.html` | Porteres ikke | Mørkt slidedekk, 1920×1080. Eksportformat, ikke en app-flate |
| Systemkart | `tn-systemkart/TnSystemkart.dc.html` | Porteres ikke | Dokumentasjonsflate for designsystemet selv |

## Sammendrag

- **8 skjermer kan bygges nå** (3 av dem er allerede bygget og bør sammenlignes mot rettet fasit).
- **13 skjermer venter på datamodell.**
- **5 skjermer har en åpen beslutning** som ikke nødvendigvis blokkerer bygging.
- Av de generelle malene kan **4** bygges nå, **1** venter på eierskapsavklaring, **2** porteres ikke.
