# Team Norway-trenerflaten: struktur og wireframes (utkast 1, 21.10.2026)

Etappe 2 i [prompt-tn-trenerflate-2026-10-21.md](../../../planer/prompt-tn-trenerflate-2026-10-21.md).
Beslutning: `.claude/rules/beslutninger.md` §TEAM NORWAY-TRENERFLATEN BYGGES I HQ ETTER TEAMNORWAYREF.
Registeret med én rad per side: [tn-trenerflate-register-2026-10-21.md](../../../planer/tn-trenerflate-register-2026-10-21.md).

Status: **klarsignal til bygging 21.10** (§TEAM NORWAY ER BARE FOR TRENERE). Utkast 2 (22.10, §6) venter på port 7.

Wireframes: [index.html](index.html) (privat artifact: https://claude.ai/artifact/DJHq9dKNNs8iCoyHZDptbF), svart-hvitt, syntetiske spillere og trenere. Hver skjerm i 1280 og 390 px med
samme innhold. Målt 21.10 i 390, 1280 og 1920 px: ingen sidelengs rulling, ingen konsollfeil.

## 1. Menyen (seks hovedpunkter)

| Hovedpunkt | Faner | Hvorfor her |
|---|---|---|
| Hjem | I dag · Gruppeposter · Dokumenter | Gruppeposter og dokumenter er kommunikasjon med hele gruppa og hører til dagen, ikke til fag |
| Spillere | Spillere · Skoler · College og USA | Alt som er lister over spillere. Trykk på navnet åpner IUP |
| Samlinger og testing | Samlinger · Månedsplan · Fellestesting · Gruppeanalyse · WANG-tester | Testdagene skjer på samlingene; månedsplanen viser samlingene i måneden. WANG-tester får menyplass (i dag bare lenket fra Skoler) |
| Turneringer | Turneringer · Live Watch · Uttak · Rangliste | Uttak og rangliste bygger på turneringsresultatene |
| Referanse | WAGR · Sammenlign · Søk · Planlegger · Norsk golf · HCP Norge · Tester | Det som i dag ligger på teamnorwayref; samlede tall og offentlig ranking |
| Fag og administrasjon | Årsplan · Testprotokoller · Fagapparat · Lisens og status · Trenere og tilgang · Inviter spiller · Data Golf | Det treneren bruker sjeldnere. Tilgang og Inviter bare for sportssjef, Data Golf bare for ADMIN |

Min profil (`/team-norway/profil`, ny) nås fra navnet nederst i menyen. Navy sidemeny på PC, navy topplinje og meny
som hel flate på mobil (uendret, §TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY).

**Avvik fra utgangspunktet i prompten:** Månedsplan står under Samlinger og testing (ikke under fag), fordi den
viser samlinger og gruppeøkter. Rangliste står under Turneringer, ikke Referanse: den gjelder bare TN-gruppas
spillere og leser HQ-resultatene. Workbench heter «Årsplan» i menyen, fordi det er gruppas årsplan treneren åpner der.

## 2. Spillerprofilen (IUP)

`/team-norway/spiller/[id]` med fanene i IUP-arkets rekkefølge:

Oversikt · Turneringsplan · Ranking · Turneringer · Trening · Tester · Teknisk plan · Fireukerssjekk

- Dagens fane «Post» blir seksjonen «Poster» i Oversikt; «Profil» slås inn i Oversikt og Turneringer; «Analyse»
  blir visningen «Utvikling» i Tester; «Plan» (`workbench?spiller=`) blir Trening.
- Ranking, Turneringer og Trening er nye faner. NGF-juniorranking finnes ikke i appen og vises «—».
- Uten deling: alle faner viser samme lås, med navn, klubb og WAGR-plass og hvordan spilleren deler. I dag gir de 404.
- Treneren foreslår. Knappene sier «Foreslå endring», aldri «Endre» (§KODEGJENNOMGANGEN 06.10).

## 3. Sidekart og videresendinger

Sidekartet står i wireframes under «Meny og sidekart». Gamle adresser som sender videre:

| Gammel | Ny |
|---|---|
| `/team-norway/spiller/[id]/oversikt` | `/team-norway/spiller/[id]` |
| `/team-norway/spiller/[id]/profil` | `/team-norway/spiller/[id]` |
| `/team-norway/spiller/[id]/analyse` | `/team-norway/spiller/[id]/tester?visning=utvikling` |
| `/team-norway/workbench?spiller=[id]` | `/team-norway/spiller/[id]/trening` |
| `/team-norway/referansenivaer` | `/team-norway/referanse/tester` |
| `/team-norway/apparatet` | `/team-norway/fagapparat` (som i dag) |
| `/team-norway/turneringer/ny` | PlayerHQ `/portal/tren/turneringer` (venter på svar) |
| teamnorwayref.vercel.app | `/team-norway/referanse` (når Anders sier fra) |

## 4. Fordeling per skjerm (ett hovedtall)

| Skjerm | Hovedtall | Rekkefølge |
|---|---|---|
| Hjem | Saker som venter | Saker som venter · neste samling med nedtelling · turnering nå · gruppas trening · siste gruppepost |
| Min profil | Spillere som deler med deg | Kontakt · spillere med delingsnivå · grupper · egne saker (forslag, uttak) |
| Spillere | Spillere i gruppa (og hvor mange som deler) | Søk · filter (gruppe, klasse, kjønn, deling) · liste med WAGR og delingsnivå |
| IUP · Oversikt | Ingen stort tall; stripe med WAGR, NGF junior, brutto snitt, kategori | Haster · siste tester · neste turneringer · trening fire uker · poster |
| IUP · Turneringer | Brutto snitt i år mot i fjor | Graf til-par per turnering · sesong for sesong · tabell |
| Spiller uten deling | — | Lås med forklaring · offentlig ranking |
| Referanse | Norske herrer på WAGR | Gruppe og visning · leaderboard · graf · sammenlign · søk · kilde |

## 5. Uavklart (til Anders)

Står i registeret, punkt 1–4: spillere i `/team-norway`, hvor PlayerHQ-lenken går, barnevern i Referanse
(HCP Norge og Norsk golf viser navngitte juniorer), og om «beste» per test skal bort. Avgjort 22.10: PlayerHQ-lenken går til «Se hva Team Norway ser», og «beste» tas bort i Referanse › Tester.

## 6. Utkast 2 (22.10.2026): de resterende skjermene

Wireframes: [utkast-2.html](utkast-2.html) (privat artifact: https://claude.ai/artifact/EvAKJdcygRpfMSKUPjGw1Y). Samme stil som
utkast 1. 31 skjermer: IUP › Turneringsplan, Ranking, Trening, Tester, Teknisk plan, Fireukerssjekk · Samlinger og
testing (fem faner) · Turneringer (fire faner) · Referanse › Sammenlign, Søk, Planlegger, Norsk golf, HCP Norge,
Tester, WAGR-visningene Turneringer og Sesong · Fag og administrasjon (sju faner) · PlayerHQ › «Se hva Team Norway ser» · Tom, laster og feil. Funksjonene følger funksjonsplanen 22.10 (https://claude.ai/artifact/1i2fcpao7BW2m7UvF9dcPf). Målt 22.10 i 390, 1280 og 1920 px: ingen sidelengs
rulling, ingen node utenfor rammen, ingen konsollfeil.

Plan, kartlegging og hvilke skjermer kodeøkta kan bygge etter nå: [tn-designloft-plan-2026-10-22.md](../../../planer/tn-designloft-plan-2026-10-22.md).

## 7. Utkast 3 (22.10.2026): testøkt, TrackMan-kobling og testvisning

Wireframes: [utkast-3.html](utkast-3.html) (privat artifact: https://claude.ai/artifact/TAhfpQJPqeKiwp2zTxxKft). Tolv skjermer:
testøkt med én spiller (start, ett slag om gangen, gate med store knapper, uten nett og pause, ferdig), TrackMan-import med
kobling til testslag (kobling, slag som ikke passer, Club Speed) og testvisning (PEI med spredning, gate med port og sone, putt
med avstandsbånd, uten TrackMan). Hva kodeøkta må bygge og datamodelltilleggene: planfila §6.
