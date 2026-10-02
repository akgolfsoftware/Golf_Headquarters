# AK Golf SG-baseline — fullføring og kontroll

Status 02.10.2026: Pipeline-sperren og den isolerte modelljobben er merget i
`ak-golf-pipelines` som [PR #25](https://github.com/akgolfsoftware/ak-golf-pipelines/pull/25).
Opphavstype for 100 % egne, blandede og lisensierte modeller ble merget som
[PR #26](https://github.com/akgolfsoftware/ak-golf-pipelines/pull/26).
Ingen ekstern kurve er trent, publisert eller vist til kunder.

HQ-grenen `codex/ak-sg-runtime-2026-10-02` har nå en SG-motor som bare leser
`app_public` gjennom en særskilt leserolle, lagrer modellversjon per runde og
viser tom SG-tilstand uten aktiv modell. Direkte DataGolf-kall fra HQ, de
tilhørende cron-jobbene og kjente kundevisninger med DataGolf/tour-tabeller
er sperret i grenen. Dette er foreløpig ikke produksjonssatt.
Sperren på `/stats/verktoy` stenger midlertidig også WHS- og
avstandskalkulatoren fordi de deler klientmodul med Broadie-estimatoren;
trygge verktøy må skilles ut før dette kan slippes bredt.
Lokal `npm run verify` er grønn: 3 968 kodetester, 18 komponenttester,
statisk kontroll og produksjonsbygg. `npm run prosjekt:sjekk` er også grønn.
Dette er ikke en målt spillerreise eller produksjonskontroll.

## Beslutning om datagrunnlag

- Ingen DataGolf- eller Broadie/ShotLink-punkter kan brukes til kommersiell
  kundemodell før dokumentert avtale dekker modelltrening og kundevisning.
  Kurvetilpasning alene løser ikke lisensspørsmålet.
- DataGolf-API-ets observerte SG-tall er ikke det samme som forventede slag
  fra en bestemt avstand og lie. En verifisert `E[slag til hull]`-kilde må
  finnes før ekstern treningsjobb kan fylles.
- Read-only kontroll av HQ 02.10 viste 162 `Shot`-rader fra 2 runder og 0
  `HoleScore`-rader. Dette er ikke nok til å lære en troverdig egen kurve.
  Ingen ekte spilleridentitet ble lest eller lagret i kontrollen.

## Teknisk løype

1. **Kildesone:** Kjør `drizzle/source-migrations/0001_ak_sg_external_raw.sql`
   i en egen databaseinstans. HQ får aldri dette prosjektets tilkobling.
   Registrer bare signerte rettigheter. Importer kun validerte forventede
   slag, ikke runde-SG eller SG per slag.
2. **App-sone:** Kjør `drizzle/migrations/0018_ak_sg_app_public.sql` og så
   `drizzle/migrations/0019_ak_sg_first_party_origin.sql` i HQ-databasen.
   Opprett en innloggingsrolle med kun medlemskap i
   `ak_sg_app_reader`; legg bare denne URL-en i HQ som
   `AK_SG_READER_DATABASE_URL`. Rådata-skjemaet skal ikke finnes der.
3. **Modell:** Pipeline tilpasser kurven, lagrer en inaktiv versjon og
   avviser både ugyldig lisens og kilde/app-skjema i samme database.
   Publisering krever en egen kontroll av avtale, kurvekvalitet og
   database-tilganger. Behold inaktiv status ved manglende bevis.
4. **HQ-runtime:** Les bare aktiv versjon gjennom begrenset rolle. Beregn
   `E(start) − E(slutt) − 1 − straffeslag` fra lagrede meteravstander.
   Hull er `E(slutt)=0`; avstand utenfor kurven gir «ikke beregnet».
   Straffeslag på `Shot.isPenalty` trekkes én gang. Lagre kurveversjon
   sammen med beregnede runder.
5. **Gammel visning:** Steng eksisterende DataGolf-råoppslag, tour-snitt,
   bøttetabeller og statiske Broadie-beregninger på kundeviste flater til
   dokumentert rett/egen kurve finnes. Ikke slett historiske data som del av
   visningssperren. Inventer også `dashboard.dg_*`, `public.sg_baselines`,
   `public.pga_*`, Storage og alle relevante HQ-cronruter.
6. **Førsteparts flyhjul:** Ukentlig jobb bygger utfallsobservasjoner bare
   fra komplette hull: alle faktiske slag, startlie/avstand, brutto score
   og straffer må stemme. Aggreger anonymt per lie og avstandssone. Tren
   bare ved minste utvalgsstørrelse og dekning; mål feil på holdout-runder.
   Bland egen kurve med en lovlig ekstern startmodell etter effektivt antall
   slag per sone, for eksempel `vekt_eget = n_eff/(n_eff + k)`, ikke etter uke.
   Med `k=90` gir 10 gyldige egne observasjoner 10 %, og 90 gir 50 %.
   Uten ekstern bruksrett må modellen læres bare fra egne data.
   Publiser 100 % egen modell først når alle viste soner har stabil dekning;
   ellers vis «ikke beregnet» der.

## Aksept før HQ-merge og aktivering

- Lokal DB-prøve: approllen får ikke brukt eller lest råskjemaet, og ser
  bare aktiv versjon. Forsøk med `postgres` eller et råskjema i appdatabasen
  må avvises av SG-leseren.
- Syntetiske tester: to underlag, inn/ut av green, hull, straff én gang,
  ukjent lie, manglende hull og avstand utenfor dekning.
- `npm run verify`, GitHub CI og en målt PlayerHQ-reise bestått. Gamle
  kundeviste DataGolf- og statiske SG-tall må være utilgjengelige.
- Ingen publisering av modell uten signert kildeavtale eller en validert
  førstepartsmodell. Ingen produksjonsmigrasjon eller miljøhemmelighet
  er satt i denne planen.

## Åpne sperrer per 02.10

- Rettighet til kommersiell trening og visning av en avledet DataGolf-modell
  er ikke dokumentert. Ingen verifisert DataGolf-kilde for forventede slag
  per lie og avstand er identifisert.
- De 162 lagrede slagene har ingen komplette `HoleScore`-rader. En egen modell
  kan derfor ikke trenes eller kvalitetssikres ennå.
- Legacy-tabellene i HQ (`public.sg_baselines`, `dashboard.dg_*`,
  `public.pga_*`) og eldre SG-baserte innsikter/RAG-tekster må revideres for
  gjenstående kundeveier før HQ-merge. RAG-samlingen
  `src/lib/masterbrain/rag-corpus/sg-baselines/` inneholder blant annet
  numeriske tour- og putteverdier. Det må avklares om denne samlingen eller
  dens lagrede embedding kan hentes av kunde-AI. De slettes ikke automatisk.
- Andre SG-konsumenter i admin, foreldreeksport, AI-agenter og gamle innsikter
  må gjennomgås før en fullstendig «kun AK-algoritmen»-garanti. Aggregater må
  skille mellom manuell SG og hver enkelt modellversjon. Den nåværende
  visningssperren skjuler historiske beregninger uten versjon, men en gammel
  versjon kan fremdeles være uegnet etter at lisensretten opphører.
- Før HQ-koden kan deployes, må den additive `sgModelVersionId`-kolonnen
  legges på HQ-databasen. `app_public` kan opprettes uten aktiv modell;
  leser-URL konfigureres først når egen rolle er testet i produksjon.
