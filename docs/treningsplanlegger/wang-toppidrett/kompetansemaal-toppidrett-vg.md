# Toppidrett VG1–VG3 — kompetansemål (Udir, offisiell læreplan)

Kilde: [udir.no/lk20/idr05-02](https://www.udir.no/lk20/idr05-02) · Fagkode **IDR05-02** (LK20, gjeldende).
Faget «Toppidrett» gis som programfag Toppidrett 1 (VG1), Toppidrett 2 (VG2), Toppidrett 3 (VG3)
i utdanningsprogram for idrettsfag. Hentet 2026-07-07.

## Kjerneelementer (gjelder alle tre nivå)

1. **Ferdighetsutvikling i egen idrett** — elevene skal få kjennskap til hva som skal til for å
   holde seg skadefri, og hvordan de kan opprettholde motivasjon for omfattende trening.
   Individuelle holdninger og adferd påvirker treningsmiljøet; elevene lærer gjennom
   prøving-og-feiling som del av naturlig ferdighetsprogresjon.
2. **Kunnskap om ferdighetsutvikling** — elevene lærer om faktorer som påvirker prestasjon
   gjennom praktisk erfaring, identifisering, fordypning og refleksjon. Vekt på systematisk,
   målrettet trening, eget ansvar for utvikling, og å identifisere hva som skaper motivasjon.

## Toppidrett 1 (VG1) — kv283

Eleven skal kunne:
1. vise og utvikle ferdigheter i idretten og gjennomføre systematisk og målrettet trening
2. dokumentere og evaluere en valgt treningsperiode
3. kjenne til ulike treningsformer, metoder, tester og øvelser som er relevant for
   ferdighetsutvikling i idretten, og bruke disse til å utvikle egne ferdigheter
4. gjennomføre basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning
5. forstå forholdet mellom totalbelastning og restitusjon
6. beskrive mentale forberedelser til trening og konkurranse
7. bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for
   å stimulere til økt motivasjon
8. vise god samhandling og respektfull treningsatferd

## Toppidrett 2 (VG2) — kv284

Eleven skal kunne:
1. vise og videreutvikle ferdigheter som er sentrale for å prestere i konkurranser i idretten
2. gjennomføre systematisk og målrettet trening, og dokumentere og analysere resultatet av
   denne treningen
3. gjøre rede for og gjennomføre relevante tester
4. utvikle basisegenskaper og integrere skadeforebyggende tiltak i de daglige treningsrutinene
5. gjøre rede for hvordan økt treningsmengde og totalbelastning stiller krav til organisering,
   planlegging, restitusjon og ernæring
6. beskrive et utviklingsløp fra eget utgangspunkt og til ønsket nivå på kort og lang sikt
7. reflektere over egne mentale behov og rutiner før, under og etter trening og i forbindelse
   med konkurranse
8. gjøre rede for og bruke lyst- og lekbetonte aktiviteter, øvelser, treningsformer og
   konkurranser som kan stimulere til økt motivasjon
9. utforske hvordan aktiviteter, øvelser, trening og konkurranse påvirker motivasjon og
   ferdighetsutvikling
10. opptre på en måte som bidrar til et godt lærings- og utviklingsmiljø

## Toppidrett 3 (VG3) — kv285

Eleven skal kunne:
1. vise og utvikle ferdigheter som kan forbedre prestasjonen i konkurransesituasjoner
2. dokumentere, analysere og reflektere over gjennomført trening i lys av egne mål og resultater
3. utarbeide planer og gjennomføre langsiktig, systematisk og målrettet trening i idretten med
   utgangspunkt i idrettens krav og egen kapasitet
4. videreutvikle basisegenskaper som er sentrale for ferdighetsutvikling
5. anvende skadeforebyggende øvelser og vurdere hvordan disse kan integreres i trening og
   forberedelse til konkurranse
6. gjennomføre mentale forberedelse og mental trening, og reflektere over hvordan dette kan
   påvirke ferdighetsutvikling
7. utforske og reflektere over hvordan aktiviteter, øvelser, trening og konkurranse påvirker
   motivasjon og ferdighetsutvikling
8. opptre på en måte som fremmer treningsarbeidet og samhandlingen, og som bidrar til et trygt,
   positivt og godt utviklingsmiljø

## Progresjon VG1→VG3 (for øktmalen)

Samme drill, ulikt kompetansemål — matcher `wang-treningsokt`-skillens differensieringsprinsipp:
- **VG1:** kjenne til / bli kjent med treningsformer og gjennomføre basistrening
- **VG2:** gjennomføre systematisk trening, analysere resultat, beskrive utviklingsløp
- **VG3:** utarbeide egne langsiktige planer, reflektere over prestasjon i konkurransesituasjoner

## Kode-konvensjon i AK Golf HQ

Lagres i ny tabell `competence_goals` (additiv, se `scripts/create-wang-treningsplanlegger-tables-2026-07-07.ts`)
med felt: `classYear` (VG1/VG2/VG3), `curriculumCode` ("IDR05-02"), `goalNumber` (1-indeksert som over),
`text` (målteksten ordrett). Økter i Workbench kan lenkes til ett eller flere mål via `goalIds`.
