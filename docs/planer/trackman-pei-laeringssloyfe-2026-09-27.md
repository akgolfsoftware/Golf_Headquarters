# TrackMan, PEI og læringssløyfen — metodeutkast v0.1

**Status:** Til faglig godkjenning. Ikke en ny master for treningsplanlegging og ikke en aktiv diagnose- eller anbefalingsregel. Masterbrain `knowledge/` skal eie en eventuell godkjent, versjonert metode. AK Golf HQ eier spillerdata, tilgang og beregning; treneren eier beslutningen om teknisk endring.

## Formål

Knytt samme spillers målinger, trening og resultater over tid: utgangsnivå → konkret hypotese → planlagt og faktisk trening → sammenlignbar TrackMan-/PEI-retest → flere banerunder → trenerens vurdering. En forbedring i brutto score på tre slag er et signal om å undersøke forløpet, ikke bevis for at én øvelse forårsaket forbedringen.

PEI er en egen motor: avstand til mål delt på slaglengde; lavere er bedre. PEI, strokes gained og TrackMan-parametere beholdes som ulike mål. Sammenlign aldri PEI-testresultater uten samme protokoll, målavstand, beregningsmåte og måleforhold.

## Obligatorisk datagrunnlag

| Nivå | Må ha | Hvis det mangler |
|---|---|---|
| Slag | Spiller-ID lokalt i HQ, tidspunkt, kilde, kølle, tilsiktet mål/slagform, sikte- og målretning, innendørs/utendørs, gyldig/avvikende slag | Ikke tolk høyre/venstre som teknisk feil |
| Ball | Launch Direction, Side/landingspunkt, Spin Axis, carry og enhet | Beskriv bare de delene som faktisk er målt |
| Klubb/treff | Face Angle, Club Path, Face to Path og treffpunkt når tilgjengelig | Ikke navngi svingfeil eller anbefal teknisk endring |
| Test | Test-ID, protokollversjon, råslag, fullstendighet, målavstander, vitnestatus og PEI-beregning | Ikke sammenlign testskårer |
| Trening | Teknisk oppgave, øvelse, dato, antall med/uten ball, hastighet, miljø (inkludert speil hvis relevant), planlagt og faktisk utførelse | Ikke tilskriv endring en treningsdose |
| Bane | Flere daterte brutto-runder, baneforhold/kontekst og sammenlignbart statistikkgrunnlag | Vis trend som usikker, ikke årsak |

Ukjent er `null`, aldri `0`. Ekte spiller-ID, helse og video blir i HQ og sendes ikke til eksterne AI-prompter eller Masterbrain-korpus. Avledede, anonymiserte mønstre kan først vurderes for metodeforbedring etter personvern- og fagkontroll.

## Beslutningsrekkefølge for sideveis spredning

1. Verifiser målretning, sikting, kølle, ønsket slagform og sammenlignbare slag. Del per kølle og oppgave. Skill mellom konsekvent sideforskyvning og bred høyre/venstre-varians; vis både antall, fordeling og enkeltavvik.
2. Sammenlign `Launch Direction` med målet: hvor starter ballen? Sammenlign deretter `Side` med startretningen: hvor mye av sluttavviket kommer fra start, og hvor mye fra kurve? Ikke bruk bare totalspredning.
3. Sammenhold startretning med `Face Angle`, deretter kurve/`Spin Axis` med `Face to Path` og `Club Path`. Sjekk treffpunkt ved avvik mellom forventet og observert ballflukt. Dette er testbare forklaringer, ikke diagnoser.
4. Prioriter den **første godt støttede, påvirkbare forklaringen** som kan redusere spilleren sitt relevante avvik. Ikke velg automatisk parameteren med størst numerisk utslag; grad, meter og spinn kan ikke rangeres som samme skala.
5. Vis for trener: målinger, kilde, antall, usikkerhet, alternative forklaringer og foreslått retest. Treneren kan bekrefte, avvise eller utsette hypotesen. Ingen teknisk planendring publiseres av agenten alene.

TrackMans egne beskrivelser: [Launch Direction](https://www.trackman.com/blog/what-is-launch-direction), [Face Angle](https://www.trackman.com/blog/what-is-face-angle), [Face to Path](https://www.trackman.com/blog/face-to-path), [Spin Axis](https://www.trackman.com/blog/spin-axis) og [måleparametere/utstyr](https://www.trackman.com/golf/launch-monitors/tech-specs). Merk at innendørs `Spin Axis` kan være beregnet fra klubbmålinger, slik at den ikke er et uavhengig bevis for samme forklaring.

## Læring av spillerforløp

Forløpet «10 000 repetisjoner uten ball foran speil + 300 med ball → bedre PEI/TrackMan → tre slag lavere brutto snitt» registreres som en **observasjon med tidslinje**. Kontroller loggkvalitet, hvilken oppgave repetisjonene gjaldt, andre samtidige endringer, testens sammenlignbarhet og variasjon i baneresultatene. Sammenlign med tidligere perioder og, etter godkjenning, anonymiserte lignende forløp. Bruk resultatet til å foreslå en ny hypotese eller treningsvariant, ikke til å omskrive Masterbrain automatisk.

AI skal skille `målt`, `avledet`, `hypotese`, `trenerbekreftet` og `effekt ikke avklart`. Hver vurdering skal kunne spores til metodeversjon og datakilder. Dårlige tester over tid i forhold til spillerens nivå kan utløse **varsel om vurdering**, ikke automatisk mer volum eller teknisk omlegging. Skade/fysisk form håndteres under egne tilgangs- og personvernregler.

## Verifisert status i HQ 27.09.2026

- `TrackManShot` har nå felt for Launch Direction og målavstand per slag; HTML-, CSV- og fotoimporten fører avlest startretning gjennom normalisering og lagring. `TrackManSession` har manuelt bekreftet mållinjestatus og valgfri felles målavstand. Ukjent sikting blir ikke automatisk bekreftet; tilsiktet slagform er fortsatt ikke modellert. Den additive SQL-migrasjonen er skrevet, men ikke kjørt mot en hostet database.
- `PositionTaskLog` og `DrillLogV2` lagrer antall/typer repetisjoner og kan knyttes til teknisk oppgave. Speil er ikke et entydig registrert miljø i disse loggene. Koblingen fra hver rep til retest og baneresultat er ikke en ferdig analysekjede.
- `TestResult`/`TestShot` og `src/lib/domain/pei/` har PEI-resultater og beregning. Eksisterende kilder beskriver ulike PEI-protokoller; lik test-ID og versjon må være et vilkår før trendanalyse.
- `trackman-agent.ts` har inntil nå koblet få Face to Path-slag til en MORAD-feil og foreslått fast intensitetsendring etter én økt. Denne automatiske slutningen stoppes i denne leveransen; målesignalene beholdes per kølle.

## Syntetisk akseptpakke før faglig godkjenning

| Tilfelle | Forventet utfall |
|---|---|
| Samme kølle, start konsekvent høyre, liten kurve | Vis startretning/blad som hypotese; ikke påstå MORAD-feil |
| Start nær målet, stor høyrekurve | Se Face to Path, Spin Axis og treffpunkt før hypotese |
| Face to Path og Spin Axis peker ulikt | Flag mulig treffpunkt-/måleforklaring; ingen automatisk teknisk endring |
| Blandet driver/7-jern eller feil målretning | Separate køller eller «utilstrekkelig grunnlag» |
| To PEI-tester med ulik protokoll/målavstand | Ikke beregn forbedring mellom dem |
| 10 000 tørre speilreps, 300 med ball, bedre retest og score | Vis korrelasjon, tidslinje og alternative forklaringer; ikke årsaksbevis |
| Én svak test eller manglende verdi | Ikke lag planvarsel; ikke erstatt manglende med null |

**Port for «godkjent»:** Anders/fagansvarlig bekrefter fagregler og protokoller; importen bevarer nødvendige felt; syntetiske og anonymiserte, samtykkede før/etter-caser består uten falske diagnoser; trenerflyt for bekreftelse/avvisning er testet; tilgang og sletting/innsyn er kontrollert. Først da versjoneres reglene i Masterbrain `knowledge/`, synkes til HQ og kan påvirke anbefalinger.

**Uavklart arbeid:** Den nye databasen må få de additive kolonnene gjennom prosjektets godkjente, kontrollerte kjøreprosedyre før import kan brukes der. Importen lagrer ikke tilsiktet slagform eller faktisk kompassretning; dette må avklares faglig før diagnoseregler. Ekte spillerforløp er ikke hentet eller testet i dette utkastet; ingen produksjonsdata skal brukes som snarvei til godkjenning.
