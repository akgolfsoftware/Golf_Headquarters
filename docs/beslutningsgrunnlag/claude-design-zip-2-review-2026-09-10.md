# Kontroll av Player HQ Train lock (2)

Kontrollert 10.09.2026 mot ZIP-en Anders leverte, forrige ZIP, aktuelt kodeinventar og original Team Norway-arbeidsbok. Originalpakken er uendret. Import-, slettings- og publiseringsinstrukser inni pakken er vurdert som underlag, ikke utført.

**Vurdering: brukbart og omfattende designarbeid, men ikke en komplett eller entydig pakke for pikselnøyaktig portering.** Neste leveranse bør samordne kildene og lukke konkrete hull. Det er ikke nødvendig å starte designet på nytt.

## Kontrollens omfang

- Alle 495 filer inventert. 301 HTML, 83 Markdown, 37 TypeScript, 36 JSX, 8 CSS, 6 JavaScript og øvrige ressurser/inventarer/arbeidsbøker.
- Mot ZIP (1): 76 nye filer, 30 endrede, 389 identiske, ingen fjernede. Ny eksportdato betyr altså ikke at alle skjermer er oppdatert.
- Alle 301 HTML-filer åpnet i lokal Chromium: 243 i roten og 58 i undermapper. Fire av de eldre prototypene fikk JavaScript-feil. To rotfiler er strukturelt tomme. Lokal åpning er ikke bevis på at alle kontroller eller tilstander fungerer.
- Nettverk var blokkert. React-filene som allerede er innebygd i standalone-pakken ble brukt ved behov. Separate referansebrett kan dermed bruke reservefont når fonten kun hentes eksternt. Dette er en gjengivelseskontroll, ikke en godkjenning av fontpiksler.
- Visuelt inspisert blant annet PH-01 I dag v2, A-01 Mac Uke Pro, Systemkart v3 og H2-03. H2-03-logikken ble også kjørt isolert med syntetiske registreringer. Ikke alle rammer, nettlesere, tastaturforløp eller kombinasjoner av størrelse/tema er visuelt gjennomgått.
- Begge Excel-kopiene i ZIP-en har samme SHA-256 som brukerens original: `f9f8ddfeb411b7e2dc84e1935588e7ed950266dda53046e733cbc2d516d03664`.

## Prioriterte funn

| ID | Prioritet | Funn og bevis | Nødvendig retting |
|---|---|---|---|
| Z01 | Før samlet portering | `tokens/colors.css` er v3 Warm med lys scene `#F2F1ED`, mens `DESIGN-SYSTEM.md` er v2 med lys scene `#FFFFFF`. `handover/LES-MEG.md` sier fortsatt at v3 avventes. PH-01 v2 viser den eldre retningen. | Én navngitt versjon må samordne dokumenter, designverdier, komponenter, bilder og skjermer. Registrer hvilke eldre brett som erstattes. |
| Z02 | Før samlet portering | `handover/LES-MEG.md` beskriver 304 ruter, 96 tegnet, 142 mønster og 66 som skal slettes. Nytt H1-register har 478 ruter, mens repoet nå har 479. Systemkartet viser fortsatt 304 og 500 rammer uten komplett rute-/tilstandskobling. | Bruk H1 som utgangspunkt, legg til `/portal/tren/tester/team-norway`, og fjern gamle slettings-/omfangspåstander fra aktiv overlevering. Ingen rute slettes på grunnlag av dette dokumentet. |
| Z03 | Før samlet portering | H1: 193 `venter-design`, 127 `arvet-monster`, 102 `tegnet`, 50 `videresending-undersokt`, 6 `intern-ikke-ui`. Status er pakkens egen påstand. Mønsterarv er ikke dokumentasjon på at hver rutes felter og tilstander er tegnet. | Lever faktisk dekning per rute/mønster/tilstand. Ikke kall 478 rader ferdig UI. Videresendinger må fortsatt verifiseres mot aktuell kode. |
| Z04 | Før bygging av disse skjermene | `AX-01 Skall v3.dc.html` og `PH-17 Meg v2.dc.html` har tomt `<x-dc>`. | Lever innhold eller merk eksplisitt som manglende. Filnavnet er ikke en leveranse. |
| Z05 | Faglig feil | H2-03 W-7 sier at PGA-mål i AG33:AG35 mangler. Direkte lesing av både formler og lagrede verdier viser **120, 105, 90**. | Rett kontrollrapport, testregister og oppsett. PGA27 har 27 kildebekreftede mål. |
| Z06 | Faglig feil | H2-03 W-3 hevder at wedge-målene ligger i BH, og BJ er tom. Arbeidsboken viser **BH4=Carry, BH5:BH13 tomme**, **BJ4=Mål Avstand, BJ5:BJ13=58/37/87/63/48/57/33/66/54**. | Rett kildebeskrivelsen. Carry skal fortsatt være råregistrering og målet fast protokollverdi. Ikke flytt felter basert på feil kildepåstand. |
| Z07 | Feil variant | H2-03 tilbyr Blocked, men `start()` kaller `t.mal(i)` uten variant. Kjørt kontroll gir første seks mål **10,30,20,40,15,25** også med Blocked valgt. Riktig blokkert rekkefølge begynner **10,10,10,30,30,30**. | Variant må styre rekkefølge, ID, navn, kildeområde og sammenligningsgrunnlag. |
| Z08 | Feil fullføringskontrakt | Isolert kjøring av `fullfor()` på tom test setter `fullfort`. Deretter kan `settRad()` fjerne en verdi og beholde `fullfort`. Dette viser manglende kontroll i tilstandslogikken; vanlig UI kan skjule enkelte utløsere. | Valider i selve overgangen. Rettede resultater krever ny revisjon eller eksplisitt tilbakeføring til utkast, med sporbarhet. Fullført må aldri bli stående på ufullstendige data. |
| Z09 | Misvisende lagring | `componentDidUpdate()` svelger faktisk localStorage-feil. `markSync()` kan likevel vise `synket` etter 1,1 sekund. Manuelt feilscenario er ikke det samme som håndtering av virkelig lagringsfeil. | Skill simulering, lagret lokalt, venter og bekreftet på server. Behold rådata ved feil, og vis faktisk feil. |
| Z10 | Ufullstendig overlevering | Fire eldre prototyper under `proto/` feiler ved direkte lokal åpning: Index, Mac, iPad og iPhone. Feilen er relativ import av `./proto-core.js` fra en `about:blank`-base. | Lever dokumentert startmiljø eller fungerende standalone-eksport. Feilen ved lokal filåpning beviser ikke at de også feiler i Claude-miljøet. |
| Z11 | Komponentkontrakt spriker | `Button.jsx` har `leadingIcon`, men `Button.d.ts` mangler egenskapen. JSX bruker 15/600, mens tegningen omtales som 16/700 og forskjellen er akseptert i gamle dokumenter. Under lasting fjernes teksten og erstattes av en strek uten eksplisitt tilgjengelig navn. | Samordne typer, komponent og referanse. Behold tilgjengelig navn og angi opptatt tilstand. En dokumentert forskjell er fortsatt en forskjell ved pikselkontroll. |
| Z12 | Ressurser og gjengivelse | `fonts/fonts.css` henter Geist fra Google; separate fontfiler mangler. Mange eldre HTML-brett bruker systemfont. Standalone-eksporter kan ha innebygde fontressurser, men det finnes ingen samlet ressurs-/skjermbildemanifest for portering. | Lever font-/ressursmanifest og reproducerbare referansebilder med eksakte data, størrelser, tema og gjengivelsesmiljø. |
| Z13 | Feil filkobling | `handover/LES-MEG.md` peker først til `../KODEFASIT.md`, som ikke finnes i rot. Filen ligger i `uploads/KODEFASIT.md`. Importprompt og eksportdokument bruker også ulike målmappemønstre. | Én gyldig leserekkefølge og ett versjonert mappekart. Ikke flett inn gamle byggeordre i prosjektets regler. |
| Z14 | Kilderegister | H2-03 plasserer Standard sving og Innspill 120/160/Variation i `Teknikktest`. De aktuelle cellene ligger i `PEI Tester`. | Rett arknavn og kildeområder. Behold skillet mellom teknikkmålinger og PEI-testfamilier. |

## Det som er forbedret

H2-03 i denne ZIP-en er en annen versjon enn den tidligere separate eksporten. Den har hele den grove puttereferansen, riktige 25 putteavstander, alle fem distansesnitt og riktig fortegn. Tallkonverteringen avviser Infinity; carry lik null er nå mulig. Disse gamle avvikene skal ikke gjentas som om de fortsatt finnes.

Det nye H1-registeret dekker den tidligere skanningen med 478 ruter og synliggjør mange designhull. V3-verdiene forsøker å skille varm fremdrift, valgt mål, egne data og feil. Dette er nyttig grunnarbeid, men implementeringen av det nye uttrykket er ikke samordnet på tvers av skjermene.

## Vurdering av bruk og visuelt design

PH-01 har tydelig hovedhandling og gode forsøk på store tekstvarianter. Likevel vises «41 min igjen» og fremdrift sammen med «Start økt»; planlagt, pågående og avsluttet tilstand må avklares. Caddie-feltet og bunnmenyen opptar mye høyde. På liten skjerm bør nødvendig treningsinformasjon prioriteres, og innholdet må kunne rulles helt fri av faste elementer.

Coachens ukeplan gir reell oversikt med arbeidskilder, kalender og valgt økt. Men små, svake etiketter, mange forkortelser og svært nedtonet negativt analysetall øker lesearbeidet. Ikke demp et viktig negativt resultat fordi det er negativt. Det trengs også tydeligere betydning av varighet, mål, registrering og gjennomføring på tvers av plan og live.

Systemkartet er en oversiktstavle, ikke bevis på komplett UI. H2-03 er mer direkte og oppgaveorientert enn mange eldre brett. Samtidig er testvelgeren lang, og registrene har flere rader som bare dokumenterer fremtidig arbeid. Behold ærlig status, og gi brukeren søk/filtrering eller relevante tildelte tester når faktisk katalog bygges. Dette er et designforslag, ikke en ny produktlås.

## Skill-kontroll og anbefalt neste leveranse

`ak-prompt-master` og `prompt-engineer` er oppdatert til versjon 3: udokumenterte modell-/prisråd er fjernet; motstridende råd om automatisk verifisering og generelle godkjenningsstopp er erstattet med kildekontroll og gjeldende autorisasjon. `ak-hq-design` er oppdatert til versjon 2 med ferskt inventar og versjonskontroll. `verify-og-commit` er også revidert til versjon 2: automatisk push/PR er fjernet som standardordre, og lokal kontroll, CI, designvurdering og produksjonsstatus skilles. De historiske kopiene i ZIP-ens uploads-mappe er ikke endret; bruk den nye pakken.

Designinventarets fire tester består. Inventaret er regenerert til 479 sidefiler. De daterte, historiske tellingene i referansedokumentene er fortsatt merket som historiske.

Bruk [den oppdaterte overleveringsprompten](../design-system/claude-design-komplett-overlevering.md) til å lukke Z01–Z14 og levere ferdige familier fortløpende. Én valgt familie kan portes mens resten ferdigstilles. Hele pakken skal ikke masseimporteres som gjeldende design før konfliktene er løst.

Veien videre til lansering står i [gjennomføringsløpet](../design-system/lanseringslop-2026-09-10.md). Denne kontrollen godkjenner ikke produksjonsfunksjoner, betaling, personvern, alle skjermtilstander eller hele appens design.
