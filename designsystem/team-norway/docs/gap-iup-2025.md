# Gap: IUP-arket vs. TN-skjermene

Kryssjekk av alle 18 faner i `uploads/team-norway-iup-2025.xlsx` mot de 15 TN-skjermene og de 8 generelle malene. Kun manglene er listet.

Kilde-utdrag per fane: `docs/iup-2025-faneutdrag.md`.

## Mangler — skjerm for skjerm

| # | Fane i arket | Skjerm som mangler | Hvorfor den ikke er dekket |
|---|---|---|---|
| G-01 | 9. Utviklingssjekk 5 Prosesser | Utviklingssjekk — 4 nivåer × 7 kategorier | Arkets største struktur: Ung (13–15) / Junior (–19) / Amatør (19–24) / Pro (21–) med egne spørsmålssett for Sosial, Mentalt, Fysisk, Strategisk, Teknisk, Golfutvikling, Neste trinn. Ingen skjerm har nivåbytte eller kategoristruktur. TN-03 er tester, ikke selvvurdering. |
| G-02 | 3. Målsetting og oppfølging | Måltavle — historikk mot mål, per kvartal | 2022/23/24-historikk + fire kvartaler + mål 2024/25/26 på ~35 rader (SG-splitt, PEI-splitt per avstand, FT/GIR/scrambling, driving distance, antall konkurranser, treningstid). TN-07 er rangliste mellom utøvere, ikke egen utvikling mot eget mål. |
| G-03 | 4. Prosessmål | Prosessmål — mål, handling, måling, hjelp | 25 rader med kolonnene handling, hvilken prosess, start/slutt, målemetode, utstyr, hvem jeg trenger hjelp fra, evaluering. Ingen skjerm eier prosessmål. |
| G-04 | 8. Treningsøkter | Øktmaler per slagtype | Basisøkt for Sving / Putt / Nærspill / Wedge med 10 innholdslinjer + tid + totaltid, koblet til Turnering/Spill/Golfslag/Teknikk/Fys. Årsplan-malen viser én økt i sesongkonteksten, men har ikke øktmalene som gjenbrukbart bibliotek. |
| G-05 | 8. Treningsøkter (rad 1) | Oppvarmingsprogram | Eget krav i arket: skrevet oppvarmingsrutine, med fem referanserutiner. Finnes ingen steder. |
| G-06 | 7. Ukeplan | Ukemaler — fire typer | Grunn / Spesial / Uke med turnering / Uke uten turnering, hver med morgen–ettermiddag–kveld × 7 dager og øktteller. Årsplan har ukevisning for én uke, ikke fire navngitte maler man velger mellom. |
| G-07 | Teknikkplan | Teknisk plan per slagtype | Ballflight i dag vs. ønsket (høyde, sidespinn, spinn, launch, spredning), impact i dag vs. ønsket (path, face, impact location, attack, dynamic loft, speed), GOBBS-liste, bevegelsesliste, driller, ukefrist. Ingen skjerm. |
| G-08 | Teknikktest | Teknikktest — launchmonitor-innlegging | Driver / J7 / Wedge, del A (carry, målt lengde, side) og del B (til hull, PEI, club path, face angle, attack angle, dynamic loft, impact location, speed). TN-03 viser resultat, ikke slag-for-slag-innlegging. |
| G-09 | Fystester | Fystester — 5 tester + vektet fysscore | Trapbarmarkløft, benkpress, stille lengde, ballkast knestående, CHS. Vektingen (1 / 1 / 0,5 / 0,166 / 1) er en regel som må vises der scoren vises. Ingen skjerm. |
| G-10 | Treningsdagbok | Treningsdagbok — daglig logg + månedsaggregat | Én rad per dag over hele året med Konkurranse / Spill / Golfslag / Teknikk / Fysikk / antall pass, aggregert per måned (pivot i arket). Ingen skjerm logger dager. |
| G-11 | 6. Turneringsplan | Turneringsplan — utøverens egen | WAGR power, antall hull, uke, start/slutt, totalt antall dager, land, tour, sum dager. TN-13 er trenerens turneringsoversikt (påmeldte, historikk); utøverens egen planlegging og dagsbudsjett mangler. |
| G-12 ✅ | Statistics | Referansenivåer — tour-benchmark — **tegnet 08.09 som TN-16** | SGA/SGS-tabeller, median-PEI per avstandsbånd, avstandstabell tee/fairway/rough/sand/recovery, topp-40-snitt og PGA-snitt. Utøverdashboardet sier «mot referansenivå» men referansen finnes ikke som egen skjerm. |
| G-13 | 1. Person info | Mitt støtteapparat + helseopplysninger | «My Team» (golftrener, fysisk, mental, putting-trener, foresatte med e-post/mobil) og skader / medisinske forhold / allergier. Spiller-arket i TN-00 har ikke disse feltene. Merk: helsedata krever egen tilgangsregel. |
| G-14 ✅ | TN Coaches | Trenerkatalog — **tegnet 08.09 som TN-15** | Ni navngitte roller med mobil og e-post (idrettssjef, coach menn/gutter, coach kvinner/jenter, coach junior, physical/physio, laglege, kommunikasjonssjef, to coach ung). Ingen skjerm viser apparatet. |

## Delvis dekket — trenger utvidelse, ikke ny skjerm

- **2. Evaluering spørsmål** → `templates/evaluering`. Har fritekst og skala, men mangler arkets 10 selvvurderingspåstander på 1–4, tidsfordeling i prosent (2024 vs. 2025) og «minst tre ting som krever mest forbedring».
- **5. Årsplan** → `templates/arsplan`. Har uke 40→39 og perioder, men mangler arkets kodesystem: prio 3/2/1 (utvikling / bibehålla / sämre) per rad, og sted H / TN / SN / TI / SI per uke.
- **TN Tester Tot** → `templates/tester`. Har protokollene, men mangler resultat per test over 23 datokolonner — altså testhistorikken som tidsserie.

## Ingen skjerm nødvendig

Intro (tom), Ref (skjult SG-oppslagstabell).


---

# Player HQ-dekning

Kryssjekk av gap-punktene mot Player HQ (`src/app/portal/*` i `akgolfsoftware/Golf_Headquarters@main`, 169 ruter). Vurdert på konsept, ikke ordlyd. Lest 08.09.2026.

Konklusjon: **Player HQ dekker konseptet i 6 av 14 punkter helt, 6 delvis, 2 ikke i det hele tatt.** Regnet i vekt er det meste av arket allerede bygget — men de tre tyngste utøverpunktene (utviklingssjekk, måltavle, prosessmål) er nettopp de som bare er delvis dekket.

## Dekket — konseptet finnes, ofte mer utviklet enn i arket

| Gap | Player HQ | Merknad |
|---|---|---|
| G-04 Øktmaler | `/portal/mal/bygger`, `/portal/tren/ovelser`, `/portal/drills`, `applyWorkbenchTemplate` | Malbibliotek + drill-katalog + AI-forslag (`/portal/ai/foresla-drill`). Arkets fire faste slagmaler er en delmengde. |
| G-06 Ukemaler | `/portal/planlegge/workbench` | `applyTemplate`, `duplicateWeek`, `lagrePeriode`, AI-ukeforslag. Arkets fire navngitte uketyper er malvalg her. |
| G-07 Teknisk plan | `/portal/tren/teknisk-plan/[planId]` | Betydelig mer utviklet enn arket: P1–P10-posisjoner, krav per posisjon, læringstrapp (L_KROPP→L_AUTO), CS-nivå, reps mot mål, TrackMan-mål per krav. Arkets ballflight/impact-matrise er en enklere form av samme sak. |
| G-09 Fystester | `/portal/tren/fys-plan`, `/portal/fysisk`, `src/lib/fys-data.ts` | Alle fem testene ligger i datamodellen med samme navn: Trapbar Deadlift, Benkpress, Standing Long Jump, Ball Throw, CHS — og `fys-score.ts` regner samlet FYS-score. Én reell forskjell: Player HQ normaliserer mot stallens spenn, arket bruker fast vekting (1 / 1 / 0,5 / 0,166 / 1). |
| G-10 Treningsdagbok | `/portal/trening/logg`, `/portal/gjennomfore/[id]`, `/portal/(fullscreen)/live/[sessionId]/logger` | Logger per økt, live-logging under økt, og ukesdigest. Arkets én-rad-per-dag med fem kategorier er samme data i annen form. |
| G-11 Turneringsplan | `/portal/tren/turneringer` | «Planen din + katalogen». `loadMinTurneringsplan` er nøyaktig arkets fane 6. Pluss `/portal/ai/foresla-turnering`. |

## Delvis dekket — datamodellen finnes, arkets form gjør ikke

| Gap | Finnes i Player HQ | Det som mangler |
|---|---|---|
| G-01 Utviklingssjekk | `TalentTracking` med fem akser (fysisk, teknikk, taktikk, mental, motivasjon), radar i `/portal/utviklingsplan` og `/portal/talent/mitt-niva` | Aksene finnes som **tall**, ikke som **spørsmål utøveren svarer på**. Arkets 4 nivåer (Ung / Junior / Amatør / Pro) med egne spørsmålssett per kategori har ingen motstykke — og de sju kategoriene er ikke de samme fem aksene (Sosial, Strategisk, Golfutvikling, Neste trinn finnes ikke). Nærmeste er `/portal/utenfor-banen`, som er fysisk/lag/utfordringer, ikke selvvurdering. |
| G-02 Måltavle | `Goal` med typene HCP_TARGET, ROUNDS_PER_MONTH, SG_AREA, SESSION_FREQUENCY, TEST_SCORE, FREE_TEXT + fremdrift og `Achievement` | Mål per stykke, ikke arkets **matrise**: 2022/23/24-historikk × fire kvartaler × mål 2025/26 over ~35 rader samtidig. SG-splitten finnes (`/portal/mal/sg-hub`, `Round.sgTotal/sgApp/sgArg/sgPutt`), men PEI-splitt per avstandsbånd, FT %, GIR %, scrambling og treningstid-totaler står ikke som målbare rader. |
| G-03 Prosessmål | `Goal FREE_TEXT`, krav (`tasks`) i teknisk plan med reps og status | Arkets kolonner *hvilken handling*, *hvordan måler du framskrittet*, *hvilket utstyr*, *hvem trenger jeg hjelp fra*, *evaluering* finnes ikke. Prosessmål er i praksis modellert som tekniske krav, ikke som egne mål med eget måleopplegg. |
| G-08 Teknikktest | `/portal/trackman`, `/portal/analysere/trackman/[id]`, `/portal/mal/trackman/gapping`, TM-mål per krav (spredning, spinnakse, smash, carry, ballhastighet, kølleblad-stabilitet) | Slag-for-slag-innlegging finnes for TrackMan-økter, men arkets faste protokoll — Driver / J7 / Wedge, del A og del B med *til hull* og *PEI* per slag — er ikke en test man gjennomfører. `/portal/tren/tester/[testId]/gjennomfor` har PEI som scoring-kind, men ikke launchmonitor-kolonnene. |
| G-12 Referansenivåer | `benchmarkLabel` per test i talentprofilen, `/portal/talent/sammenligning` (mot kohort), `/portal/datagolf`, `(marketing)/stats/pga` | Sammenligning skjer mot **andre i samme nivå**, ikke mot **tour-nivå**. Arkets tabeller — median-PEI per avstandsbånd, topp-40-snitt, PGA-snitt, avstandstabell tee/fairway/rough/sand/recovery — finnes ikke som referanse utøveren kan måle seg mot. |
| G-13 Støtteapparat + helse | Helse er dekket godt: `/portal/meg/helse` med HealthEntry, skade via `Leave.isInjury`, belastning, og eksplisitt art. 9-samtykke. `/portal/meg/foreldre`, `/portal/coach` | Helsedelen er bedre løst enn i arket. Men «My Team» mangler: Player HQ kjenner **én** coach (`getCoachProfile`) pluss foresatte — ikke arkets fire roller (golf, fysisk, mental, putting) som hver sin person med kontaktinfo. Allergier finnes ikke som felt. |

## Ikke dekket

| Gap | Status |
|---|---|
| G-05 Oppvarmingsprogram | Finnes ingen steder som egen ting. Ett hardkodet søk-treff (`admin/gjennomfore/okter/[id]`: «Oppvarming · 5m putts» som øvelsesrad). Arkets krav om et *skrevet* oppvarmingsprogram med referanserutiner har ingen flate. |
| G-14 Trenerkatalog | `/portal/coach` viser spillerens egen coach, ikke apparatet. Arkets ni TN-roller med mobil og e-post (idrettssjef, coach menn/gutter, coach kvinner/jenter, coach junior, physical/physio, laglege, kommunikasjonssjef, to coach ung) finnes ikke. Naturlig hjemsted er Team Norway-flaten, ikke Player HQ. |

## Konsekvens for TN-skjermene

Fire punkter bør ikke tegnes her i det hele tatt — de er Player HQ og eies av Train-lock: G-04, G-06, G-07, G-10. Kryss dem av som løst.

Tre punkter er delvis dekket der Player HQ har datamodellen men ikke formen — G-01, G-02, G-03. Her er spørsmålet om Team Norway trenger sin *egen* visning av samme data (trenerens blikk på tvers av utøvere) eller om utøverflaten skal utvides. Det er en arbeidsdelingsavgjørelse, ikke en designavgjørelse.

To punkter er reelt ubygget og hører hjemme på TN-flaten: G-14 Trenerkatalog og G-12 Referansenivåer (tour-benchmark som trenere setter og utøvere måles mot).

To punkter er ubygget og hører hjemme i Player HQ: G-05 Oppvarmingsprogram og utvidelsen av G-13 til fire coach-roller.
