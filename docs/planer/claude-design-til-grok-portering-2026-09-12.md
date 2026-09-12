# Claude Design → Grok 4.6 — komplett design- og porteringskontrakt

Denne planen beskriver hva Claude Design må levere, og hvordan Grok porter det valgte designet effektivt til AK Golf HQ. Den gjelder PlayerHQ, AgencyOS, Team Norway og WANG.

## Én visuell fasit

Når Anders har valgt en komplett og ferdig Claude Design-leveranse med status `selectedForBuilding: true`, er denne versjonen **eneste visuelle autoritet** for de berørte flatene.

Det betyr:

- gamle fonter, farger, tokens, radius, skygger, navigasjonsmønstre, komponentgeometri og visuelle designregler skal ikke videreføres uten at de finnes i den valgte Claude-versjonen;
- Train-lock, Paper, v2/v3, tidligere ZIP-er og dagens UI brukes bare til å finne funksjoner, data, tilstander og tekniske avhengigheter;
- Grok skal ikke lage et kompromiss som blander gammel og ny visuell grammatikk;
- gammel styling og gamle designkomponenter slettes først når den tilsvarende reisen er erstattet, ingen importer gjenstår, og funksjons- og visuell kontroll består;
- når hele omfanget er portert, skal automatiske kontroller avvise forbudte gamle designimporter, tokens og stilark. Historiske referanser arkiveres eller merkes tydelig som historikk.

Den nye designfasiten overstyrer **visuelle regler**, ikke produkt-, fag-, data-, tilgangs-, personvern-, sikkerhets- eller betalingsregler. Slike regler kan bare endres gjennom egne, uttrykkelige beslutninger.

## Må Claude designe alle skjermene?

Ikke som 480 separate, detaljerte tegninger. Men ingen rute eller synlig tilstand kan være uforklart.

Claude Design må levere tre dekningsnivåer:

1. **Alle ruter kartlegges:** Hver inventarrad kobles til `egen-skjerm`, et navngitt `felles-mønster`, en undersøkt videresending/internflate eller en konkret uavklart beslutning.
2. **Alle unike og kritiske reiser detaljdesignes:** Fullt UI og klikkbar prototype for alle skjermer, overlegg, handlinger og feilgrener som ikke trygt kan arve et felles mønster.
3. **Gjenbruk dokumenteres:** Et mønster kan dekke mange ruter når registeret oppgir felter, handlinger, tilstander og konkrete unntak per rute.

En skjermfamilie er ikke komplett fordi én pen normaltilstand finnes. Relevante tomme, lastende, delvise, feil-, offline-, tilgangsavviste, redigerende, lagrende, lagrede, avbrutte og fullførte tilstander må være tegnet eller eksplisitt arvet.

## Nødvendige formater

Claude trenger ikke tegne hvert pikselmål som et eget brett. Hver skjermfamilie må ha eksplisitte responsive regler og representative utgaver:

| Bruk | Representativt design | Må faktisk prøves i nettleser/app |
|---|---|---|
| Smal mobil | 320 eller 360 px | 320 px, ombrekking og 200 % tekst |
| Vanlig mobil | 390/393 px | 390 px, én hånd, skjermtastatur og safe-area |
| Nettbrett | 768 eller 834 px | 834 px stående; berøring og tastatur |
| Bredt nettbrett | 1024 eller 1180 px | Liste/detalj, inspektør og liggende bruk |
| Laptop/desktop | 1280 eller 1440 px | 1440 px, tastatur, fokus og effektiv oversikt |
| Stor desktop | Regel for 1920/2560 px | Maksbredde, datatetthet og tomrom uten utstrakte kort |

Mobil, iPad og desktop skal vise samme funksjon og status. Tilpasning kan endre rekkefølge, navigasjon, liste/detalj og overlegg, men skal ikke skjule nødvendig funksjon. Tegnede 320 px- eller stor-tekst-eksempler er ikke testbevis; de må kontrolleres i en faktisk nettleser eller app.

## Skjermfamilier som må dekkes

### PlayerHQ

- I dag → Plan → øktark → Live → oppsummering → gjenåpning.
- Opprette, redigere, flytte og avbryte økt.
- Analyse, mål, datagrunnlag og manglende data.
- Tester, fysisk trening, TrackMan/DataGolf, runde/score og gameplan/baneguide.
- Coachkontakt, meldinger, video og varsler.
- Booking, abonnement/credits, Meg, hjelp, personvern og sikkerhet.

### AgencyOS

- Hjem, kalender og prioriteringer.
- Stall, spillerkort, grupper og spillerkontekst.
- Workbench: planlegge, kontrollere, publisere og følge opp.
- Live, øvelser/tester, runder og analyse.
- Innboks, meldinger, godkjenninger og delvis feil.
- Booking, tjenester, tilgjengelighet og økonomi.
- AgenticOS-forslag → vurder/rediger/avvis → kjører/feiler/utført med sporbarhet.
- Organisasjon, innhold, integrasjoner, oppsett og historikk.

### Team Norway

- Riktig organisasjons-/rolleinngang og oversikt.
- Spiller-/gruppevalg med avgrenset innsyn.
- Testtildeling → variantbundet registrering → kontroll/korrigering → resultat og historikk.
- Mål, talent/sammenligning og Analyse med kilde, enhet og skala.
- Plan/økt, innlegg, dokumenter, varsler og tilgangsavslag.

### WANG

- Riktig skole-/gruppeinngang og Hjem.
- Skoleuke/treningsuke → økt → elev/gruppe → oppfølging.
- Elevkort, IUP/utviklingsplan, mål og rapport.
- Årsplan, testdag, styrkeprogram og gruppeaktivitet.
- Innlegg, dokumenter, varsler, tilgang og organisasjonskontekst.

Team Norway og WANG skal bruke det nye systemet bare når Anders' valgte byggepakke uttrykkelig inkluderer disse flatene. De kan ha profilforskjeller, men må dele systemets komponentlogikk, statusbetydning og tilgjengelighetsnivå.

## Hva den ferdige Claude-pakken må inneholde

1. Én versjon, dato, `selectedForBuilding: true` og en entydig visuell autoritets-ID.
2. Samordnet skjermregister der filnavn, versjon, mønster, ruter, formater og tilstander stemmer.
3. Grunnverdier → betydningsverdier → komponentverdier for lys operativ modus og mørk fokusmodus.
4. Fonter, ikoner, foto og øvrige faktiske ressurser med filer og kjent bruksrett.
5. Komponentkontrakter: anatomi, data, varianter, alle relevante tilstander, interaksjon, tastatur, skjermleser og responsiv oppførsel.
6. Wireframes for informasjonsrekkefølge og navigasjon, detaljert UI for representanter og alle unike unntak.
7. Klikkbare prototyper med konsistente syntetiske data gjennom hele reisen.
8. Tilstands- og formatmatrise samt faktiske kontroller ved 320, 390, 834, 1180/1440 og 200 % tekst.
9. Maskinlesbare designverdier og en endringslogg fra forrige valgte versjon.
10. Kjente avvik og produktbeslutninger som fortsatt blokkerer bestemte skjermer. En åpen beslutning kan ikke skjules som ferdig design.

## Groks mest effektive portering

### 0. Lås kilden

- Start fra fersk `origin/main` i egen worktree/gren.
- Kontroller versjon, autoritets-ID, filhash og at registeret peker til samme filer.
- Ta et inventarøyeblikk og frys Claude-pakken som referanse for denne porteringen.

### 1. Lag kartet før komponentene

- Koble hver rute til skjerm-ID, brukerreise, mønster, data/handlinger, tilstander og formater.
- Klassifiser eksisterende kode som `behold funksjon`, `tilpass presentasjon`, `ny delt komponent` eller `fjern etter erstatning`.
- Finn felles mønstre først; ikke porter 480 ruter enkeltvis.

### 2. Bygg fundamentet én gang

- Implementer valgte fonter, ressurser og designverdier med grunnverdi → betydning → komponent.
- Bygg app-ramme, navigasjon, typografi, handlinger, felt, lister, overlegg, status, lasting/feil og datavisning som delte komponenter.
- Ingen gammel token-fallback i nye komponenter. En midlertidig bro må være navngitt, avgrenset og ha en slettedato/-betingelse.

### 3. Porter vertikale brukerreiser

Porter én sammenhengende reise gjennom faktisk data og handlinger, ikke lag for lag over hele appen:

1. PlayerHQ J02: I dag → Plan → økt → Live → oppsummering.
2. AgencyOS Hjem og J04: Stall/spiller → planlegg/publiser → følg opp.
3. Team Norway: oversikt → test → resultat/historikk.
4. WANG: Hjem → uke/økt → elev/IUP/rapport.
5. Deretter de øvrige familiene etter masterplanen.

Hver del leverer mobil, iPad og desktop sammen med relevante tilstander. Den gamle varianten fjernes først etter at reisen er godkjent i kode.

### 4. Kontroller hvert snitt

- Funksjon: samme objekt, status, tall og tilgang gjennom hele reisen.
- Visuelt: app ved siden av valgt Claude-referanse ved representative bredder og modi.
- Robusthet: tom, lasting, delvis data, feil, offline, lagring, avbrutt og tilgangsavslag.
- Tilgjengelighet: tastatur, synlig fokus, skjermlesernavn, kontrast, 320 px og 200 % tekst.
- Automatisering: komponent-/reiseprøver og visuelle skjermbildesammenligninger med dokumenterte toleranser.

### 5. Fjern gammelt design kontrollert

- Søk etter alle importer og brukere før sletting.
- Fjern erstattede CSS-filer, tokens, fonter, komponentvarianter og gamle designvakter per ferdig reise.
- Legg til en prosjektvakt som feiler dersom forbudte gamle designreferanser gjeninnføres.
- Når siste familie er portert: kjør full rute-/mønsteravstemming, full kvalitetsgate og visuell sluttkontroll. Først da kan gammel designkode erklæres borte.

## Ferdigkriterium

Porteringen er komplett når alle inventarrader og overlegg er forklart, alle valgte skjermfamilier bruker den valgte Claude-versjonen, ingen forbudte gamle designavhengigheter gjenstår, funksjoner og tilgang er bevart, og kritiske reiser er kontrollert på mobil, iPad og desktop. `Implementert`, `visuelt kontrollert`, `sett av Anders` og `publisert` føres som separate statuser.
