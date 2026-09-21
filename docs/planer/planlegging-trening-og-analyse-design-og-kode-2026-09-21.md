# Planlegging, trening og analyse: design- og kodeplan

**Status 21.09.2026:** Aktiv gjennomføringsplan. Fagvalg og begreper eies fortsatt av
[`docs/treningsplanlegging.md`](../treningsplanlegging.md) og
[`docs/ordbok.md`](../ordbok.md). Visuell retning eies av AK Golf Design System og siste valgte
versjon i Claude Design-prosjektet «App design».

Første sammenhengende del er bygget:

- PlayerHQ skiller mellom **resultatmål** og **prosessmål** ved oppretting, redigering,
  oversikt og visning i målwidgeten.
- Aktive resultatmål og prosessmål følger spilleren inn i coachens Workbench på nivåene
  år, periode, måned, uke og økt.
- Synlige Workbench-begreper er presisert til **Læringssteg** og **Treningsmiljø**.

Neste byggetrinn er å la målene knyttes til konkrete perioder, uker og økter, og deretter
koble gjennomført trening og analyse tilbake til samme målspor.

## 1. Produktmålet

AK Golf HQ skal vise én sammenhengende utviklingsreise:

```text
Mål og analyse
  → Årsplan
    → Periode
      → Månedsplan
        → Ukeplan
          → Øktplan
            → Gjennomføring
              → Resultat og treningsdata
                → Analyse
                  → Neste tiltak i planen
```

Brukeren skal alltid kunne svare på fire spørsmål:

1. Hva prøver vi å utvikle?
2. Hva skal gjøres nå?
3. Ble det gjennomført som planlagt?
4. Virket treningen, og hva gjør vi videre?

## 2. Hovedprinsipper

- Samme mål, periode, økt og resultat følger brukeren mellom visningene.
- Høyere nivå viser retning og fordeling. Lavere nivå viser handling og detaljer.
- Brukeren går ned i detalj ved å velge et objekt, ikke ved å møte et nytt system.
- Planlagte og gjennomførte tall vises sammen, men blandes aldri.
- Analyse skal ende i en forståelig anbefaling eller handling, ikke bare en graf.
- Pyramidegrenene FYS, TEK, SLAG, SPILL og TURN har egne detaljfelt.
- Et valg i én pyramidegren påvirker ikke feltene eller verdiene i en annen gren.
- Mobil prioriterer én oppgave om gangen. Desktop gir sammenligning og oversikt.

## 3. Felles struktur på alle plannivåer

Hver planvisning bruker samme grunnrekkefølge:

1. **Kontekst:** spiller, tidsrom og gjeldende periode.
2. **Mål:** hva tidsrommet skal utvikle.
3. **Plan mot gjennomført:** tid, økter og pyramidefordeling.
4. **Viktigste innhold:** perioder, uker, dager eller øvelser.
5. **Avvik og signaler:** manglende trening, belastning, test eller trend.
6. **Neste handling:** åpne, opprette, endre, publisere eller evaluere.

På desktop ligger detaljen i et høyrepanel. På mobil åpnes den som en egen side eller et
bunnark med tydelig tilbakevei til samme utvalg.

## 4. Årsplan

### Funksjon

Årsplanen skal kunne:

- opprette, endre og flytte perioder med fritt datospenn
- vise turneringer, tester, samlinger, ferie og viktige datoer
- angi sesongmål og periodemål
- angi planlagt ukevolum og pyramidefordeling
- vise planlagt mot gjennomført hittil
- åpne valgt periode uten å miste årskonteksten
- varsle om tomrom, overlapp og urealistisk samlet volum uten å blokkere coachen

### Visning

- Øverst: år, sesongmål og samlet fremdrift.
- Midten: vannrett årslinje med måneder, periodebånd og viktige hendelser.
- Under: tabell med periode, uker, fokus, planlagt/gjennomført og turneringer.
- Høyrepanel: valgt periode med mål, fordeling, tester og handlingen **Åpne periode**.
- Mobil: perioder som kronologisk liste; årslinjen er en kompakt oversikt, ikke en krympet
  desktop-tabell.

## 5. Periodeplan

### Funksjon

- velge periodetype, dato, fokus og periodemål
- angi ukevolum og fordeling mellom pyramidegrenene
- planlegge tester og forventede kontrollpunkter
- fordele fokus på uker uten å måtte opprette alle økter
- kopiere en tidligere periode som utkast
- sammenligne planlagt og gjennomført per uke og pyramidegren

### Visning

- Periodeoverskrift med mål, datospenn og hovedfokus.
- Uker som én lesbar tidslinje med volum og dominant pyramide.
- Fordelingstabell med planlagt, gjennomført og avvik.
- Tester, turneringer og kontrollpunkter ligger på samme tidsakse.
- Et analysefelt viser kun signaler som påvirker perioden: trend, testresultat og etterlevelse.

## 6. Månedsplan

### Funksjon

- oversette periodens retning til fire til seks konkrete uker
- vise økter, tester, turneringer, skole, reise og andre kapasitetsblokker
- flytte økter mellom uker
- se månedsvolum og pyramidefordeling
- oppdage overbelastede eller tomme uker
- åpne uke eller økt direkte

### Visning

- Kalenderen viser hendelser kompakt; den skal ikke forsøke å vise hele øktinnholdet.
- Ukesummer viser timer, antall økter, dominant pyramide og viktige avvik.
- Valgt uke åpnes i høyrepanelet med mål, økter og handlingen **Åpne uke**.
- På mobil vises ukene kronologisk med dato, volum og neste viktige hendelse.

## 7. Ukeplan

### Funksjon

- opprette, flytte, kopiere, gjenta og slette økter
- planlegge individuelle økter og gruppeøkter
- se tilgjengelig tid, skole, booking, reise og turnering
- kontrollere ukebudsjett og fordeling per pyramidegren
- bruke maler og tidligere økter
- lagre som utkast og publisere valgte økter
- vise konflikter og endringer før publisering

### Visning

- Desktop: tidsrutenett i midten, kilder til venstre og valgt økt til høyre.
- Øktkort viser navn, tid, varighet, pyramide og status. Detaljer åpnes ved valg.
- Ukesammendrag viser planlagt/gjennomført, fordeling og mål, ikke dekorative nøkkeltall.
- Mobil: dagvisning som standard med dagvelger, dagsliste og én fast handling for ny økt.
- Publisering er tydelig adskilt fra vanlig lagring.

## 8. Øktplan

### Felles felt

- navn, dato, starttid, varighet og status
- hensikt/pyramide
- målsetning og kort begrunnelse
- sted når relevant
- ansvarlig coach og deltakere når relevant
- øvelser i rekkefølge
- planlagt total mengde
- notat og publiseringsstatus

### Grenstyrte felt

| Valg | Egne neste steg |
|---|---|
| FYS | Styrke/kondisjon/bevegelighet → fysiske øvelser → serier/reps/tid/intensitet → mål |
| TEK | Golfområde → teknisk fokus → læringssteg ved behov → sted/måleutstyr → mengde → mål |
| SLAG | Golfområde → konkret slag → treningsmåte → sted/måleutstyr → press → antall → resultatkrav |
| SPILL | Arena → spilleformat/situasjon → press → hull/tid/poeng → spillmål |
| TURN | Turnering/runde → bane og forberedelse → spilleplan → mål → evaluering |

Øktbyggeren viser bare feltene som gjelder valgt gren og område. Ved bytte av gren beholdes
tidligere innhold som et eksplisitt utkast, men skjules fra den aktive grenen til brukeren
eventuelt bytter tilbake.

## 9. Gjennomføring av trening

### Før økten

- vis mål, varighet, sted, nødvendig utstyr og første øvelse
- vis hvorfor økten finnes når coachen har skrevet en begrunnelse
- hovedhandling: **Start økt**

### Under økten

- én aktiv øvelse om gangen
- store registreringshandlinger tilpasset oppgaven: repetisjon, treff/bom, tid, sett eller hull
- synlig fremdrift mot planlagt mengde og resultatkrav
- pause, hopp over, legg til notat og angre siste registrering
- tydelig lokal lagrings- og synkestatus
- TrackMan-data kan kobles til økten, men erstatter ikke spillerens øktstatus

### Etter økten

- faktisk varighet og gjennomført mengde
- resultat mot øktens mål
- enkel opplevd belastning og kommentar når relevant
- avvik: endret, hoppet over eller avbrutt
- spillerens refleksjon og coachens oppfølging holdes adskilt
- hovedhandling: **Fullfør økt**; senere status vises som **Gjennomført**

## 10. Data og analyse

### Datakilder

- planlagte og gjennomførte økter
- fysisk treningsmengde
- tester
- banerunder og Strokes Gained
- TrackMan-økter og slagdata
- turneringsresultater
- spillerens refleksjon og coachens vurdering

Kilde, periode, enhet, datamengde og sammenligningsgrunnlag skal alltid være synlig eller ett
trykk unna.

### Analysehierarki

```text
Oversikt
  → Hva har endret seg?
    → Hvor kommer endringen fra?
      → Hvilke økter, slag, runder eller tester er grunnlaget?
        → Hva bør gjøres videre?
          → Legg tiltaket inn i planen som utkast
```

### Analysevisninger

1. **Utvikling:** trend over valgt periode for SG, tester og relevante treningsmål.
2. **Trening:** planlagt mot gjennomført, kontinuitet, pyramidefordeling og måloppnåelse.
3. **Spill:** Strokes Gained, hull, situasjoner og turneringer.
4. **Slagdata:** TrackMan, køller, spredning, startretning, kurve, høyde og lengdekontroll.
5. **Sammenheng:** hvilke treningsområder som er fulgt av målbar endring. Dette vises som
   sammenfall, ikke som sikker årsak, med mindre datagrunnlaget faktisk beviser det.

### Fra analyse til plan

Et analysefunn kan opprette et **tiltaksutkast** med:

- begrunnelse og datakilde
- foreslått pyramide og treningsområde
- foreslått periode eller uke
- målekriterium
- utløpsdato for ny evaluering

Coach eller spiller må godkjenne og redigere før tiltaket blir en økt. Et forslag vises aldri
som gjennomført arbeid.

## 11. Visuell modell

- Bruk samme tidsgrammatikk fra år til økt: valgt tidsrom, innhold, mål og avvik.
- Behold navigasjonen stabil mens detaljnivået endres.
- Bruk farge på pyramiden som identifikasjon, ikke som store fargelagte flater.
- Bruk tabeller og tidslinjer der sammenligning er oppgaven; kort brukes bare for selvstendige
  objekter eller handlinger.
- Tall står nær forklaringen, med enhet og datagrunnlag.
- Grafer bruker samme nullpunkt og skala ved sammenligning. Positive og negative SG-tall skal
  være like lesbare.
- Tomme tilstander forteller hvilken data eller handling som mangler.
- Lasting, lagringsfeil, konflikt og publiseringsfeil får egne tilstander.

## 12. Kodearkitektur

### Behold og utvid

- Coach-ruten i `src/app/admin/workbench/[playerId]/page.tsx` er inngangen.
- Eksisterende `WorkbenchAar`, `WorkbenchPeriode`, `WorkbenchManed`, `WorkbenchUke` og
  `WorkbenchOkt` videreutvikles kontrollert.
- `src/lib/workbench/wb-actions.ts` fortsetter som serverkontrollert lese- og skrivelag.
- Domeneord og rene typer ligger i `src/lib/domain/workbench/`.
- Analyseberegninger ligger i egne domene-/datamoduler, ikke inne i React-komponentene.

### Nye delte kontrakter

- `PlanContext`: spiller, tidsrom, periode, mål og rolle.
- `PlanProgress`: planlagt, gjennomført og avvik per tid og pyramide.
- `PlanningSignal`: type, alvor, datakilde, forklaring og foreslått handling.
- `TrainingOutcome`: faktisk mengde, resultat, avvik og refleksjon.
- `PlanActionDraft`: analysebasert forslag som må godkjennes før lagring i planen.

Kontraktene innføres mot eksisterende modeller. Øktmodellene slås ikke sammen som en snarvei;
den gjeldende OW-3-planen og testene må følges.

## 13. Byggerekkefølge

### Etappe 1: Sammenheng i planen

- felles kontekstlinje og stabil overgang år → periode → måned → uke → økt
- samme mål og valgt tidsrom gjennom URL og visningsmodeller
- planlagt/gjennomført på alle nivåer
- tomme, lastende og feiltilstander

### Etappe 2: Komplett øktbygger

- separate pyramidegrener
- relevante treningsområder og detaljvalg
- sted, måleutstyr, press, mengde og mål
- utkast, validering og publiseringskontroll

### Etappe 3: Gjennomføring

- planlagt → pågående → gjennomført/avbrutt
- logging per øvelsestype
- angre, pause, offline/synk og oppsummering

### Etappe 4: Analysegrunnlag

- treningsetterlevelse og plan mot gjennomført
- kobling til runder, tester og TrackMan
- felles periode- og kildefilter
- datakvalitet og manglende datagrunnlag

### Etappe 5: Analyse til tiltak

- signaler og forklaringer
- tiltak som redigerbart utkast
- kobling tilbake til periode, uke og økt
- evaluering etter valgt tidsrom

## 14. Ferdigkriterier

En etappe er ikke ferdig før:

- funksjonen virker med syntetiske data i lokal testdatabase
- coach- og spillerrettigheter er prøvd, inkludert avviste handlinger
- desktop og 390 px mobil er kontrollert mot valgt designversjon
- tom, lastende, feil, lagring og konflikt er kontrollert
- samme økt og tall stemmer i plan, gjennomføring og analyse
- relevante tester og `npm run verify` er grønne
- Anders har sett den faktiske appen, ikke bare dokument eller skjermbilde

## 15. Første konkrete leveranse

Første byggesnitt er **sammenheng i planen**:

1. Årsplan velger en periode.
2. Perioden åpner riktig datospenn og ukefordeling.
3. En uke åpner med samme spiller, periode og mål.
4. En økt åpner med samme kontekst og kan returnere til nøyaktig samme uke.
5. Alle nivåer viser planlagt mot gjennomført fra samme beregningsgrunnlag.

Dette gir fundamentet som komplett øktbygger, gjennomføring og analyse kan kobles på uten nye
parallelle navigasjons- eller datamønstre.
