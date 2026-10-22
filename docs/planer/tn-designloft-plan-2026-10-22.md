# Team Norway-trenerflaten: plan for designløftet og de resterende wireframes (22.10.2026)

Bestilt 22.10 fra hovedøkta for TN-trenerflaten. Gjelder `/team-norway/*` etter
§TEAM NORWAY-TRENERFLATEN BYGGES I HQ, §TEAM NORWAY ER BARE FOR TRENERE, §SKRÅ (19.10),
navy sidemeny og Schibsted Grotesk (20.10), §DESKTOP-SKJERMER BRUKER FULL BREDDE (21.10) og
TN-aksefargene (14.10). Bilder bare fra `public/team-norway/bilder/`.

Denne planen rører ikke `src/`. Koden bygges av kodeøkta («tn-kode-ferdig») etter wireframes i
`docs/design-system/utkast-tn/trenerflate/`.

- Utkast 1 (meny, hjem, profil, spillere, IUP Oversikt og Turneringer, uten deling, Referanse › WAGR):
  [index.html](../design-system/utkast-tn/trenerflate/index.html), https://claude.ai/artifact/DJHq9dKNNs8iCoyHZDptbF
- Funksjonsgrunnlag: Team Norway funksjonsplan 22.10, https://claude.ai/artifact/1i2fcpao7BW2m7UvF9dcPf. Planen og utkast 2 sier det samme som den om menyen, de åtte IUP-fanene og PlayerHQ-koblingen.
- Utkast 2 (resten): [utkast-2.html](../design-system/utkast-tn/trenerflate/utkast-2.html), https://claude.ai/artifact/EvAKJdcygRpfMSKUPjGw1Y

## 1. Kartlegging

Grunnlag: alle `page.tsx` under `src/app/team-norway` på `origin/main` 22.10 (df49c25b9), skjermkomponentene i
`src/components/team-norway/skjermer/`, og registeret
[tn-trenerflate-register-2026-10-21.md](tn-trenerflate-register-2026-10-21.md). Kartlagt fra koden, ikke sett
i nettleser (krever innlogget trener mot basen). Det er punkt 2 i planen under.

Kolonnene: **Ny flate** = bygget i den nye trenerflaten (pakke a–d, i main). **Skrå** = har bildetoppen
(`TnSkraTopp` eller `tn-iup-topp`). **WF** = wireframe (1 = utkast 1, 2 = utkast 2).

| Skjerm | Adresse | Ny flate | Skrå | WF | Svakt i designet i dag |
|---|---|---|---|---|---|
| Hjem › I dag | `/team-norway` | ja | egen topp | 1 | Mange like kort; «Saker som venter» konkurrerer med samling og turnering om å være hovedtall |
| Hjem › Gruppeposter | `/[groupId]` | delvis | ja | — | Tidslinjen er smal kolonne på 1920; ingen tom-tilstand i komponenten |
| Hjem › Dokumenter | `/[groupId]/dokumenter` | delvis | nei | — | Ingen bildetopp; filliste uten tom-tilstand |
| Min profil | `/profil` | ja (b) | ja | 1 | — |
| Spillere | `/spillere` | ja (c) | ja | 1 | Ingen loading per side; delt `loading.tsx` på roten |
| Spillere › Skoler | `/skoler` | nei | ja | — | Gruppert liste uten hovedtall |
| Spillere › College og USA | `/college` | nei | nei | — | Ingen bildetopp |
| IUP › Oversikt | `/spiller/[id]` | ja (d) | ja | 1 | — |
| IUP › Turneringsplan | `/spiller/[id]/turneringsplan` | delvis | ja | 2 | Planleggeren har eget uttrykk; mangler ett hovedtall over |
| IUP › Ranking | ny | nei | — | 2 | Finnes ikke |
| IUP › Turneringer | ny | nei | — | 1 | Finnes ikke; data ligger i gamle `/profil` |
| IUP › Trening | ny (`workbench?spiller=`) | nei | — | 2 | Finnes ikke; Workbench er 894 linjer med egen skall-logikk |
| IUP › Tester | `/spiller/[id]/tester` | delvis | ja | 2 | Lang liste uten «X av N» øverst; «Utvikling» ligger i egen gammel side |
| IUP › Teknisk plan | `/spiller/[id]/teknisk-plan` | delvis | ja | 2 | Ingen før og nå side om side; knappetekst sier ikke «Foreslå» |
| IUP › Fireukerssjekk | `/spiller/[id]/evaluering` | nei | via IUP-topp | 2 | Gammel side (107 linjer) uten trenerkommentar |
| Samlinger | `/samlinger` | nei | ja | 2 | Årshjul og liste uten hovedtall (dager til neste) |
| Månedsplan | `/manedsplan` | nei | ja | 2 | Kalender bryter ikke til liste på 390 i dag; må måles |
| Fellestesting | `/fellestesting` | nei | ja | 2 | «X av N» per deltaker mangler som hovedtall |
| Gruppeanalyse | `/analyse` | nei | ja | 2 | Har egen `maxWidth` (brudd på full bredde) |
| WANG-tester | `/wang-resultater` | nei | ja | 2 | Ikke i menyen før pakke a; «Ingen tilgang» må være egen tilstand |
| Turneringer | `/turneringer` | nei | ja | 2 | Ingen frist-sortering |
| Live Watch | `/live-watch` | nei | nei | 2 | Ingen bildetopp; ingen «oppdatert kl.» |
| Uttak | `/uttak` | nei | ja | 2 | Kriterium 3 (1–5) mangler i skjermen |
| Rangliste | `/rangliste` | nei | ja | 2 | — |
| Referanse › WAGR | `/referanse` | ja | ja | 1 | — |
| Referanse › Sammenlign, Søk, Planlegger, Norsk golf, HCP Norge | nye | nei | — | 2 | Finnes ikke; data må inn i basen (registeret B2–B11) |
| Referanse › Tester | `/referansenivaer` | nei | ja | 2 | Viser «beste» per test (skal bort, B13) |
| Årsplan | `/workbench` | nei | ja | 2 | Stor egen side; perioder ikke som bånd |
| Testprotokoller | `/protokoller` | nei | ja | 2 | — |
| Fagapparat | `/fagapparat` | nei | nei | 2 | Ingen bildetopp |
| Lisens og status | `/lisens-okonomi` | nei | ja | 2 | Adressen heter fortsatt økonomi |
| Trenere og tilgang | `/tilgang` | nei | nei | 2 | Egen gammel skall-bygging; ingen bildetopp |
| Inviter spiller | `/inviter` | nei | nei | 2 | Gjenbruker admin-skjerm |
| Data Golf | `/datagolf` | nei | delvis | 2 | Bare ADMIN, uendret |

Tverrgående svakheter:

1. **Tom, laster og feil:** hele `/team-norway` har bare tre `loading.tsx`/`error.tsx` (roten, `tilgang`,
   `[groupId]`). Andre skjermer viser rotens laster, som ikke ligner skjermen. Tom-tilstand mangler i bl.a.
   dokumenter, gruppeposter, fellestesting, testprotokoller og trenerprofil.
2. **Ett hovedtall:** bildetoppen er der på de fleste sider, men ofte uten tall. Utkast 2 gir hver skjerm ett.
3. **Full bredde:** `tn-analyse-visning`, `tn-gruppe-visning`, `tn-iup-laast-visning` og
   `tn-oversikt-skjerm` har egne `maxWidth`. På 1920 skal kortene bli flere kolonner, ikke bredere linjer.
4. **Bevegelse:** TN har ingen innkomst-bevegelse på kort eller faner i dag. `prefers-reduced-motion` er
   håndtert i åtte stilark, så grunnmuren er der.
5. **Seks sider uten bildetopp:** dokumenter, college, live-watch, fagapparat, tilgang, inviter.

## 2. Planen (prioritert)

| # | Steg | Ferdig når |
|---|---|---|
| 1 | **Utkast 2 sett av Anders** (port 7, eller Claude på hans vegne etter nattregelen): de 31 skjermene i `utkast-2.html`. | Anders har sagt ja, eller rettelsene er tegnet inn. |
| 2 | **Se dagens skjermer i nettleser** med demotrener i 390, 1280 og 1920, og legg skjermbilder ved registeret. | Hver rad i tabellen over har skjermbilde, og påstandene om 390 (særlig Månedsplan) er bekreftet eller rettet. |
| 3 | **Felles tilstander:** én tom-, laster- og feilkomponent for TN etter «Tom, laster og feil» i utkast 2, og `loading.tsx` per hovedpunkt. | Alle seks hovedpunkter har egen laster i skjermens form, og et søk etter skjermer uten tom-tilstand gir 0. |
| 4 | **IUP-fanene** (kodeøkta, én PR per fane): Turneringer, Ranking, Trening, Tester med «X av N», Teknisk plan, Fireukerssjekk, Turneringsplan. | Alle åtte fanene finnes, gamle adresser sender videre, og hver fane er målt i 390/1280/1920 uten sidelengs rulling. |
| 5 | **Samlinger og testing** og **Turneringer** etter utkast 2: hovedtall i bildetoppen, uttak med kriterium 3 (1–5), Live Watch med «oppdatert kl.». | Ni skjermer har hovedtall og bildetopp; testen for kriterium 3 låser 1–5. |
| 6 | **Fag og administrasjon** etter utkast 2: bildetopp på fagapparat, tilgang og inviter; Årsplan med periodebånd. | Ingen TN-side mangler bildetopp. |
| 7 | **Referanse resten**, etter at dataene er i basen (registeret B2–B13, beslutningen punkt 5): Sammenlign og Søk først (data finnes), så Planlegger, Norsk golf, HCP Norge. Referanse › Tester uten «beste». | Tallene er de samme som på teamnorwayref for samme uke, med kilde og dato. |
| 8 | **Full bredde rydding:** fjern de fire `maxWidth` i TN-skjermene, unntatt løpende tekst og dialoger. | Et søk etter `maxWidth` i `src/components/team-norway/skjermer` treffer bare tekst og dialoger, og skjermene er målt i 1920. |
| 9 | **Bevegelse:** kort glir inn ved første visning, faner bytter uten hopp, med TN-tidene og `prefers-reduced-motion`. | Bevegelsen er lik på alle hovedpunkter og slås av med «reduser bevegelse». |
| 10 | **Hjem-fanene og Spillere-fanene** som mangler wireframe (Gruppeposter, Dokumenter, Skoler, College og USA): tegnes i utkast 3 når 1–6 er gjort. | Utkast 3 finnes og er målt. |

## 3. Wireframes: hva finnes, hva mangler

**Utkast 2 dekker (31):** IUP › Turneringsplan, Ranking, Trening, Tester, Teknisk plan, Fireukerssjekk ·
Samlinger og testing › Samlinger, Månedsplan, Fellestesting, Gruppeanalyse, WANG-tester · Turneringer ›
Turneringer, Live Watch, Uttak, Rangliste · Referanse › Sammenlign, Søk, Planlegger, Norsk golf, HCP Norge,
Tester · Fag og administrasjon › Årsplan, Testprotokoller, Fagapparat, Lisens og status, Trenere og tilgang,
Inviter spiller, Data Golf · Referanse › WAGR, visningene Turneringer og Sesong · PlayerHQ › «Se hva Team Norway ser» · Tom, laster og feil (med lite data og låsen som gjelder alle åtte IUP-fanene). IUP › Turneringer står i utkast 1.

**Mangler fortsatt (steg 10):** Hjem › Gruppeposter og Dokumenter, Spillere › Skoler og College og USA,
og undersidene (én samling, én turnering, én testprotokoll, én test, én teknisk oppgave, scorekort for føring).

**Kodeøkta kan bygge etter nå** (data finnes i HQ): IUP › Tester, Teknisk plan, Fireukerssjekk, Trening,
Turneringer, Turneringsplan; alle i Samlinger og testing, Turneringer og Fag og administrasjon; Referanse ›
Sammenlign, Søk og Tester; WAGR-visningene Turneringer og Sesong; PlayerHQ › «Se hva Team Norway ser». **Venter på data:** IUP › Ranking (WAGR per uke er i basen fra 22.10, NGF-junior
«—»), Referanse › Planlegger, Norsk golf og HCP Norge (pipelines må skrive til basen først).

## 4. Åpne spørsmål til Anders

1. **Hovedtall på IUP › Tester:** prioriterte tester tatt («7 av 11») eller siste testdag? Anbefaling: «7 av 11»,
   fordi det sier hva spilleren mangler før neste samling.
2. **Trenerkommentar i Fireukerssjekk:** skal treneren kunne skrive en kommentar spilleren ser i PlayerHQ?
   Anbefaling: ja, som en post til spilleren (samme lesekvittering som gruppeposter), ikke et eget felt.
3. **Live Watch:** automatisk oppdatering hvert minutt, eller knappen «Oppdater»? Anbefaling: knappen, så radene
   ikke flytter seg mens treneren leser.

Avgjort av Anders 22.10 (registreres i beslutningene av kodeøkta): PlayerHQ-lenken går til «Se hva Team Norway ser»,
og «beste» tas bort i Referanse › Tester. Utkast 2 er tegnet slik; se også svarene i §5.4.

## 5. Datakart og sammenheng (22.10.2026)

Lest fra koden på `origin/main` 22.10. «Deling» betyr navngitt deling til treneren (`medTnSpillerData`,
`src/lib/domain/tn-arbeidsflate.ts:659` → `navngittTrenerHarTilgang`, `src/lib/deling/navngitt.ts:171`).
**Deling er ett nivå i Team Norway: alt eller ingenting.** Gruppenivåene «Tester og resultater» og «Komplett profil»
fra PlayerHQ leses ikke av noen TN-skjerm. Wireframene er rettet til dette (se §5.3).

### 5.1 Felt per fane

**IUP › Oversikt**

| Felt | Kilde | Fører | Deling |
|---|---|---|---|
| WAGR-plass | `wagr_ref_players.rank` via `public_players.wagrId`; `hentWagrPlass` (`tn-iup-oversikt.ts:18`) | Pipeline (ukejobb) | Nei, offentlig |
| NGF juniorranking | finnes ikke («—») | – | – |
| Brutto snitt | `dashboard.player_profile_for_user` → `aggregerRangliste` (`tn-rangliste.ts:12`), inneværende år i Oslo-tid, nettoklasser fjernet | Pipeline | Ja |
| Kategori A–K | finnes ikke i TN («—»); finnes i PlayerHQ (`hentSpillerAkKategori`, `spiller-kategori.ts:65`) | Beregnet | Ja |
| Haster | `byggIupHaster` (`tn-iup-oversikt-regler.ts:40`): avslåtte Workbench-forslag 14 dager, prioriterte tester under minsteantall, lisens/helseattest innen 30 dager | Blandet | Ja |
| Siste tester | `TestResult` `tn-v3-*`; `hentTnSpillerTester` (`tn-arbeidsflate.ts:867`), tre nyeste | Spiller eller trener | Ja |
| Neste turneringer | `TournamentEntry` PLANNED/CLAIMED/CONFIRMED, tre neste med dato | Spiller | Ja |
| Trening fire uker | `WorkbenchSession`; `summerAksefordeling` (`tn-aksefordeling.ts:16`), rullerende 28 døgn | Spiller (trener foreslår) | Ja |
| Poster og lesekvittering | `TnPost`, `TnPostLesekvittering`; `hentSpillerpostTidslinje` (`tn-post.ts:359`) | Trener | Ja |

**IUP › Turneringsplan** (`byggPlanvisning`, `src/lib/turneringsplan/data.ts:118`)

| Felt | Kilde | Fører | Deling |
|---|---|---|---|
| Planlagte starter | `TournamentEntry` + `WagrPlanEvent` | Spiller | Ja |
| Nivå og topp 10-sjanse | `merkelapp`/`sjanser` (`wagr-modell.ts`), `WagrPlayerStrength` og `WagrModelRun`; sesong fast 2027 | Pipeline, ESTIMAT | Ja |
| WAGR-plass og poengsnitt i toppen | `WagrPlayerStrength.rank`/`pointsAvg` (modellkjøringen, ikke `wagr_ref`) | Pipeline | Ja |
| Trenerforslag | `PlanAction` `TOURNAMENT_PLAN_PROPOSAL`, bare PENDING; `foreslaaTurnering` | Trener, spiller godtar | Ja |

**IUP › Ranking:** WAGR-plass per uke og endring finnes ikke i HQ (`wagr_ref_results.rankBefore/rankAfter` finnes, men leses ikke).
Poengsnitt finnes i `wagr_ref_players.pointsAvg`. NGF juniorranking finnes ikke.

**IUP › Turneringer:** til-par per turnering finnes ikke i TN-visning (`motPar` regnes i `turneringsresultat.ts:32`). Plass og runder:
`hentTnSpillerProfil` (`tn-arbeidsflate.ts:1386`), bare inneværende år. Sesongsnitt: SQL `snitt_score` i
`dashboard.player_profile_for_user` (regelen ligger ikke i repoet). WAGR-poeng per turnering: `wagr_ref_results.points`, leses ikke.

**IUP › Trening:** gjennomført mot planlagt og akser som Oversikt. «Logget i etterkant» og «lagt inn mot fordelt» finnes ikke
(nærmest: `GroupPeriodBlock.axisMinutes` i Månedsplan).

**IUP › Tester** (`tn-spiller-tester-visning.tsx`)

| Felt | Kilde | Fører | Deling |
|---|---|---|---|
| «X av N» | `PRIORITERTE`/`fremdrift` (`portal-tester/testbatteri.ts:54,73`), minsteantall 1/2/2/2/4, alle gyldige forsøk | – | Ja |
| Siste resultat | `hentTnSpillerTester` og `hentTnSpillerOvrigeTester` | Spiller eller trener | Ja |
| Egenført / Kontrollert | `TestResult.recordedById` (`tn-arbeidsflate.ts:986`), vises bare i detaljkurven | Trener = Kontrollert | Ja |
| Nivå A–K | finnes ikke («—») | – | – |

**IUP › Teknisk plan** (`tn-teknisk-plan.ts`): oppgaver, P-posisjon og reps fra `TechnicalPlan` → `PositionTask`. Læringssteg ligger i
`PositionTask.lFase`, men leses ikke. Kvalitetssjekk, før og nå-bilder og trenerforslag finnes ikke (datamodelltilleggene i
§POSISJONSNAVN 27.09, punkt 2).

**IUP › Fireukerssjekk:** levert dato, nivå og svar fra `IupBesvarelse` (`lesLeverteIupForProfil`, `iup/trener-profil-lesing.ts:25`),
ført av spilleren. Prosessmål og målsetninger finnes bare i PlayerHQ (`Goal`, `fireukerssjekk-data.ts:56`). Trenerkommentar finnes ikke.

**Referanse**

| Kort | Kilde | Status |
|---|---|---|
| WAGR leaderboard | `wagr_ref_*`; `hentWagrReferanse` (`tn-referanse-wagr.ts:13`); endring mot årsslutt | Finnes |
| Graf, Turneringer, Sesong | `wagr_ref_players.yearStats`, `wagr_ref_results.power/rankBefore/rankAfter` | Data finnes, leses ikke |
| Sammenlign, Søk | `alle_norske_sok`/`alle_norske_profil` (RPC i basen) | Ikke bygget |
| Planlegger | `WagrReferencePlan` | Modell finnes, leses ikke |
| Norsk golf, HCP Norge | – | Finnes ikke i basen |
| Tester | `hentTnGruppeanalyseResultat` (`tn-arbeidsflate.ts:1069`): hver spillers **beste** resultat noensinne, også WANG-elever, ingen grense på 5 | Må endres |

**PlayerHQ › «Se hva Team Norway ser»:** finnes ikke. `/portal/meg/deling/innsyn` er en side for trenere og viser bare leverte
utviklingssjekker.

### 5.2 Sammenheng: samme tall på flere skjermer

- **Test →** Tester (siste resultat, «X av N») · Oversikt (siste tester, Haster «mangler 1») · Fireukerssjekk (nyeste tester) ·
  Gruppeanalyse og Referanse › Tester (samlet). Ett resultat, samme verdi og dato overalt.
- **Turneringsresultat →** Turneringer (til-par, plass) · Oversikt og Rangliste (brutto snitt) · Uttak (kriterium 1) · Ranking (WAGR etter
  turneringen) · Turneringsplan (WAGR-plass og sjanser).
- **Trenings­økt →** Trening (uke, akser, etterlevelse) · Oversikt (fire uker) · Spillere og Hjem («Trenger deg», gruppas trening).
- **WAGR-plass →** Oversikt · Spillere · Ranking · Turneringsplan · Referanse · uten-deling-låsen.

### 5.3 Avvik

| # | Avvik | Hvor | Forslag | Hvem |
|---|---|---|---|---|
| A1 | **Personvern:** `hentTnTekniskPlaner`/`Detalj` og `hentTnEvalueringGrunnlag` leser med global `prisma`, utenfor delingslåsen | `tn-teknisk-plan.ts`, `tn-evaluering.ts:40` | Les via `tx` fra `medTnSpillerData`, med test | Kode, haster |
| A2 | TN-trener skriver rett i spillerens tekniske plan (`tnLoggRep`, `tnOpprettOppgave`) | `tn-teknisk-plan.ts:202,240` | Bli forslag spilleren godtar (§KODEGJENNOMGANGEN 06.10) | Kode |
| A3 | WAGR-plass har tre kilder: `wagr_ref_players` (Oversikt, Spillere), `WagrPlayerStrength` (Turneringsplan), `WagrSnapshot` (AgencyOS) | se 5.1 | `wagr_ref_players` med uke overalt i TN; modellen bare for sjanser | Kode |
| A4 | Brutto snitt har fem definisjoner (Oversikt/Rangliste, Profil 365 dager med treningsrunder, SQL-sesong, IUP-måltall, A–K) | `tn-arbeidsflate.ts:1385`, `profil-kobling/komplett.ts:78`, `maaltall.ts:97`, `spiller-kategori.ts:48` | Én: turneringsrunder, bare brutto, uten treningsrunder (svar 3) | Kode |
| A5 | Etterlevelse har tre definisjoner (PlayerHQ `etterlevelse.ts:32`, IUP `tn-aksefordeling.ts:16`, TN gruppetrening `tn-trenger-deg.ts:65`) | se over | Samme som PlayerHQ (§KARTLEGGINGSØKT FJERNES punkt 4) | Kode |
| A6 | Turneringsresultater fra to kilder: `/turneringer` leser `Tournament.results`, IUP og Rangliste leser offentlige resultater | `lesTnTurneringer` `:189` | `public_player_entries` overalt (§PIPELINES ER ENESTE KILDE) | Kode |
| A7 | Kategori vises «—» i TN, men PlayerHQ har A–K; `WagrSnapshot.ngfCategory` er A–I | `tn-spillerprofil-visning.tsx:255` | Les `hentSpillerAkKategori`; samme tall som PlayerHQ | Kode |
| A8 | Avslåtte turneringsforslag vises aldri i Haster (leser bare Workbench-forslag) | `tn-iup-oversikt.ts:77` | Ta med `TOURNAMENT_PLAN_PROPOSAL` | Kode |
| A9 | Neste turneringer: Oversikt utelater oppføringer uten dato, Turneringsplan tar dem med | `data.ts:172` | Lik regel; uten dato vises «Dato —» nederst | Kode |
| A10 | Testantall: Profil teller alle `TestResult`, også ugyldige; Tester og Haster teller gyldige | `komplett.ts:88` | Gyldige overalt | Kode |
| A11 | Referanse › Tester bruker hver spillers beste resultat og tar med WANG-elever | `tn-arbeidsflate.ts:1069` | Median og antall for alle TN-spillere; navn og alle forsøk bare for dem som har delt; WANG-elever under WANG-tester (svar 2) | Kode, wireframe rettet |
| A12 | Delingsteksten i PlayerHQ sier «foreløpig leverte utviklingssjekker», mens TN leser tester, trening, planer og lisens med samme deling | `navngitt-deling.tsx:165` | Teksten sier det TN faktisk ser; «Se hva Team Norway ser» bygges for spilleren | Kode |
| A13 | Wireframene viste to delingsnivåer («Tester og resultater», «Komplett profil»); koden har ett | utkast 1 og 2 | Rettet: «Delt / Venter på svar / Ikke delt» (svar 1) | Wireframe, rettet |
| A14 | Wireframene: vannrett aksebånd sto TURN først, Putt 1–3 m «—» på Oversikt men 7/10 på Tester, poengsnitt lik WAGR-plassen, dager til fireukerssjekk feil, målsetning 2027 mot tall fra 2026 | utkast 1 og 2 | Rettet: FYS først i vannrette bånd, like tall, riktig periode | Wireframe, rettet |

Felt som wireframene viser, men som ikke finnes i koden ennå (bygges etter beslutningene, ikke avvik): NGF juniorranking («—»),
WAGR per uke, til-par per turnering, logget i etterkant, lagt inn mot fordelt, kvalitetssjekk, før og nå-bilder, trenerkommentar.

**«Se hva Team Norway ser» mot trenerens IUP:** samme åtte faner, samme stripe (WAGR, NGF junior, brutto snitt, kategori) og
samme tall i Oversikt. Ingen knapper: «Foreslå endring», «Skriv post» og «Før teknikktest» er borte; eneste lenke er
«Endre deling i Meg › Deling». Listen «Hvem ser dette» erstatter velgeren mellom delingsnivåer.

### 5.4 Svar fra Anders 22.10

1. **Deling:** «Alt skal deles.» Ett nivå: når spilleren deler, ser treneren alt. Wireframene viser Delt / Venter på svar / Ikke delt.
2. **Referanse › Tester:** «Spillerens testresultater. Men Team Norway har komplett oversikt over alle spillere og alle tester som er
   gjort.» Presisert samme dag: «Komplett testoversikt med navn for alle som har delt. Spillere som ikke har delt teller bare i
   median og antall, uten navn.» Referanse › Tester viser median og antall per test for alle TN-spillere, og en navnetabell med alle
   forsøk bare for dem som har delt. Ingen tidsgrense og ingen «beste»-kolonne. Wireframen er tegnet om (utkast 2, Referanse › Tester).
3. **Brutto snitt:** «Alle turneringer er brutto resultat.» Brutto snitt er turneringsrunder, bare brutto, likt i IUP, Rangliste,
   Uttak og PlayerHQ. Treningsrunder er ikke med.

Beslutningen står i #1614 (`.claude/rules/beslutninger.md` §TEAM NORWAY: DELING ER ALT ELLER INGENTING).

## 6. Utkast 3: testøkt, TrackMan-kobling og testvisning (22.10.2026)

Bestilt av Anders 22.10: «tegne testøkta med spiller, TrackMan-importen med kobling til testslag, og testvisningen med
spredningsplott og slagdata, som utkast 3.» Wireframes: [utkast-3.html](../design-system/utkast-tn/trenerflate/utkast-3.html),
https://claude.ai/artifact/TAhfpQJPqeKiwp2zTxxKft. 17 skjermer i fire grupper, målt i 390, 1280 og 1920 px uten sidelengs rulling og uten konsollfeil.

### 6.1 Hva kodeøkta må bygge

1. **Testøkt uten testdag.** «Start test» fra IUP › Tester og fra en samling: én spiller, flere tester i ett løp. I dag krever
   `saveTnTestSomCoach` en aktiv testdag og tar én test per testdag; testdagen blir bare rammen når hele gruppa tester. Bare
   tester treneren kan føre (`trenerKanFore`) kan velges; resten vises grå med «Spilleren fører i PlayerHQ».
2. **Ett slag om gangen** for carry og side, med talltastatur, avstand fra hullet og PEI rett etter slaget, «Angre siste» og
   fremdrift «Test 2 av 4 · slag 3 av 5». Gjenbruk mønsteret fra `PH15TnTest`/`PH15TnGenerell` i stedet for feltlista i
   `tn-testdag-scorecard.tsx`. Gate-testene beholder de store knappene (0/1/4 poeng; OK/Bom for Driver Gate og Putt Gate).
3. **Uten nett og pause:** utkast lagres på telefonen per slag (gjenbruk `use-tn-draft.ts`) og sendes når nettet er tilbake.
   En test teller fortsatt bare når alle slag er ført.
4. **TrackMan-import for trener** i TN (og AgencyOS): knapp i IUP › Tester og i testøkta, som kaller `importTrackMan` med
   `onBehalfOfUserId`. Krever deling.
5. **Kobling testslag ↔ TrackMan-slag.** Forslaget går i rekkefølge, med riktig kølle; treneren bekrefter alle eller bytter
   ett og ett. Carry og Side fylles inn fra TrackMan, og slaget merkes «TM». Tilstandene: passer ikke (mer enn 15 m fra målet, 30 m i Driver Basic),
   for få slag (resten føres for hånd), feil kølle (hoppes over).
6. **Club Speed i Fysisk:** beste av de fem første driverslagene i fila, som treneren bekrefter.
7. **Testvisning:** hovedtall per test (PEI eller poeng, «1 av 2» på prioriterte), spredningsplott mot målet for PEI-testene
   (`DispersionMap` finnes bare for TrackMan-økter og kan gjenbrukes), port og sone for gate-testene, avstandsbånd for putt,
   panel med TrackMan-tallene per slag, og kurve over tid med fylt prikk for Kontrollert og åpen for Egenført. Uten TrackMan
   viser panelet bare Carry og Side og «—» for resten.

### 6.2 Datamodelltillegg (additivt via `db execute`, gotchas §Database)

- **Kobling testslag → TrackMan-slag:** ny tabell `TestShotTrackManLink` (`testResultId`, `forsokIndeks`, `trackManShotId`,
  `kobletAvId`, `kobletAt`, unik på `testResultId` + `forsokIndeks`), eller valgfritt felt `trackManShotId` per forsøk hvis
  forsøkene allerede ligger i egen tabell. Kolonnene kartlegges mot `TestResult` før skriptet skrives.
- **Testøkt:** `TestSession` (`spillerId`, `trenerId`, `samlingId` valgfri, `startetAt`, `avsluttetAt`, `status`) med kobling fra
  `TestResult`, så flere tester kan høre til ett løp uten testdag.
- **Kølle per TrackMan-slag** finnes allerede i `TrackManShot`; mangler den, vises «—».

### 6.2b TrackMan-statistikk og sammenheng med spill (tillegg fra Anders 22.10)

Anders: «Fra Trackman slag rapport ønsker vi snitt, median og ytterpunkter på de ulike parametere (Clubpath, face angle, også
videre). Og andre potensielle verdi full data og statistikk. Også mulighet til å sammen ligne Trackman data og tendsener til SG og
stats fra treningsrunder og turneringsrunder.» Tegnet som gruppa «TrackMan-statistikk» i utkast 3 (fem skjermer).

| Visning | Felt | Kilde | Status |
|---|---|---|---|
| Statistikk per kølle | snitt, median, min, maks, standardavvik for 17 parametere | `TrackManShot` (`clubSpeed`, `ballSpeed`, `smashFactor`, `attackAngle`, `clubPath`, `faceAngle`, `faceToPath`, `dynamicLoft`, `launchAngle`, `launchDirection`, `spinRate`, `spinAxis`, `carryDistance`, `totalDistance`, `side`, `apexHeight`, `landAngle`), gruppert på `club` | Feltene finnes. Snitt per økt finnes i `oppsummerOkt` (`trackman/okt-oppsummering.ts:46`); standardavvik bare for Ball Speed i `club-trend-aggregator.ts:27`. **Median, min/maks og standardavvik per parameter finnes ikke** |
| Ytterpunkt åpner slaget | slag-id per min/maks | `TrackManShot.id`, `outlier` | Feltet `outlier` finnes; kobling fra ytterpunkt til slag finnes ikke |
| Andel i målvindu | % slag innenfor vindu per parameter | – | **Finnes ikke** (standardvinduer og egne mål, §6.3) |
| Treffpunkt-sky | `strikePatternX/Y` | `computeStrikePattern` (`sg-hub/strike-pattern.ts:46`) | Finnes |
| Gapping | carry-snitt og spredning per kølle | `buildYardageRows` (`sg-hub/yardage-calc.ts:98`) | Finnes for carry; spredning per kølle finnes ikke |
| Tendens over tid | snitt og spredning per økt for valgt parameter og kølle | `getClubTrend`/`detectDrift` (`sg-hub/drift-detection.ts:88`) | Finnes bare for Club Path, Face Angle og Total; **andre parametere og spredningsbånd finnes ikke** |
| SG per kategori | tee, innspill, nærspill, putting | `Round.sgOtt/sgApp/sgArg/sgPutt` (registrerte runder); estimat fra snitt i `estimerSgFordelingFraSnitt` (`stats/sg-estimator.ts:183`) | Finnes; turneringsrunder uten slagdata får ESTIMAT |
| Treningsrunder og turneringsrunder hver for seg | `Round.roundType` (`turnering`/`trening`, `null` = ukjent) og offentlige resultater | `maaltall-data.ts:51` | Finnes; umerkede runder (`null`) må enten spørres om eller holdes utenfor |
| Greenhit og andre runde-stats | – | `Round`/`HoleScore` | Delvis; kartlegges når skjermen bygges |

Krever deling (alt eller ingenting). Bygges som visningene «Statistikk», «Tendens» og «Sammenheng» i IUP › Tester, og
«Statistikk» rett etter TrackMan-importen. Nytt i koden: én modul som regner snitt, median, min, maks, standardavvik og andel i
målvindu per parameter og kølle, med «for få slag» under 5.

### 6.3 Avgjort 22.10 (`.claude/rules/beslutninger.md` §TRACKMAN I TEAM NORWAY-TESTENE, #1629)

Anders sa ja til anbefalingene og slo sammen svarene («Begge»):

1. **Report-lenke:** importen tar Report-lenke i tillegg til fil og bilde.
2. **«Passer ikke»:** mer enn 15 m fra målet i wedge- og inspilltestene, 30 m i Driver Basic. Slaget merkes og kobles ikke;
   treneren kan koble det likevel.
3. **TEK eller SLAG** er påkrevd ved import, og statistikken kan filtreres på aksen. **Club Speed** er beste av de fem første
   driverslagene.
4. **Mål og vinduer:** standardvinduene gjelder (Face to Path, Club Path og Face Angle ±2°, Smash Factor ≥ 1,35 jern og ≥ 1,45
   driver, Attack Angle −5 til −3° jern og 0 til +4° driver, Carry og Side ±5 m jern og ±15 m driver). Trener og spiller kan sette
   egne mål og vinduer per parameter og kølle; hver endring viser hvem og når.

Utkast 3 er tegnet slik.

### 6.4 Datamodelltillegg fra svarene (additivt via `db execute`)

- `TrackManSession.akse` (`TEK` | `SLAG`), påkrevd ved ny import. Gamle økter uten akse vises som «—» og kan merkes i etterkant.
- `TrackManMaal` (`spillerId`, `kolle`, `parameter`, `maal`, `vinduMin`, `vinduMax`, `settAvId`, `settAt`), unik på spiller,
  kølle og parameter. Spiller og trener kan skrive; endringer logges med hvem og når.
- Import fra Report-lenke: ny parser ved siden av `parse-csv.ts`, `parse-html-report.ts` og `parse-photo.ts`.
