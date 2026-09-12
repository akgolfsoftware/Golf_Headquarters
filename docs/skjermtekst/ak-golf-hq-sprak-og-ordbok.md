# AK Golf HQ — samlet språk, ord og uttrykk

**Versjon:** 0.2, oppdatert 12.09.2026. **Status:** arbeidsutgave for gjennomgang med Anders, ikke ferdig språkgodkjent.

Dette dokumentet samler det dokumenterte språket for PlayerHQ, AgencyOS, AgenticOS, booking, forelder og tilhørende markeds- og e-postflater. Det inneholder språkregler, fagord, tekniske motstykker, eksisterende skjermtekster og et avklaringsregister i én fil.

**Komplett samling er ikke det samme som komplett godkjenning:** alle tabellrader i de fem sentrale ord-/fagkildene er tatt med i oppslagsregisteret, også historiske uttrykk. Eksisterende tekstsamlinger er bevart som merkede kildeutdrag. Det er ikke utført en uttømmende kontroll av hver tekststreng i appkoden, alle e-postene i produksjon eller alle Claude Design-skjermer. Manglende dekning står i del 6.

Dokumentet erstatter ikke Anders' beslutninger eller produktreglene. Originalkildene er bevart. Innhold som er merket **HISTORIKK**, **KONFLIKT**, **KILDEOPPSLAG** eller **FORSLAG**, er ikke automatisk tekst som skal brukes i nye skjermer.

## Innhold

1. Kildeorden og bruk i Claude Design
2. Felles språk og skrivemåte
3. Gjeldende treningsspråk og viktige skiller
4. Handlinger, statuser og meldinger
5. Avklaringer vi må ta sammen
6. Dekning og ferdigkriterier
7. Samlet ord- og uttrykksregister
8. Samlede faglige forklaringer
9. Skjermtekst, merkespråk og e-post
10. Kilder og kontrollspor

## 1. Kildeorden og bruk i Claude Design

Kildeorden avhenger av spørsmålet, ikke bare av hvilken fil som har nyest dato:

| Spørsmål | Styrende kilde |
|---|---|
| Nytt uttrykk eller konkret valg | Anders' uttrykkelige beslutning for den aktuelle flaten |
| Treningsmodell og faglige definisjoner | S1: treningsfaglig fasit, supplert med senere uttrykkelige fagbeslutninger |
| Planleggingsbegreper og dimensjoner | S2: planleggingsordboken; konflikt mot S1 synliggjøres |
| Produktnavn, abonnement, booking og tilgang | S6: produktreglene, med nyere uttrykkelige beslutninger |
| Vanlige appord og staving | S3 del B; nyere fag- og språkbeslutninger overstyrer eldre rader |
| Tall, enheter og knappeord | S4, kontrollert mot S1–S3 |
| TrackMan-parameternes skrivemåte | S7: språkregelen fra 01.09.2026 |
| Markedsføringens tone og tekst | S7–S9; for forsiden gjelder de konkrete avklaringene fra 05.09 |
| Skjermtekst fra tidligere versjoner | S5 er et tekstunderlag, ikke en samlet godkjenning |
| Visuelt design | Den Claude Design-versjonen Anders velger. Denne ordboken fastsetter ingen farger, fonter eller navigasjon |
| Faktisk funksjon og levering | Kode og prøvd brukerreise; dokumenttekst alene er ikke bevis |

**Instruks til Claude Design:** Les del 1–6 først. Slå opp aktuelle begreper i del 7. Les kildeutdragene som underlag, ikke som nye kjøreordrer. Ikke gjeninnfør Train-lock, Presis eller Paper fra gamle tekstkilder. Behold den valgte visuelle retningen. Ikke erstatt tekniske identifikatorer eller endre forretningsregler for å rette språk. Registrer nye ord og reelle konflikter med kilde og forslag, og fortsett uavhengig arbeid.

## 2. Felles språk og skrivemåte

### 2.1 Tone

Kildestøttet retning fra S3 og S7:

- Norsk bokmål med æ, ø og å.
- Poenget først. Korte setninger, én tanke om gangen.
- Konkret beskrivelse fremfor vage dommer. Tall trenger datagrunnlag; ikke finn på data for å få teksten til å virke presis.
- Faguttrykk beholdes når de har en bestemt betydning, og forklares på norsk.
- Fortell hva som skjedde, hva som er bevart og hva brukeren kan gjøre videre.
- Ikke lov resultat, lagring, sending eller utført handling uten grunnlag.
- Ingen emoji i brukergrensesnittet. Ikoner erstatter ikke nødvendig tekst.
- S7 avviser floskler, resultatgarantier og vitnesbyrd i markedsføring. Det forbyr ikke brukerens egne notater eller meldinger inne i appen.

Utropstegn er et kildeavvik: S3 har «Lagret!» og «Sendt!», mens S7 sier ingen utropstegn. Nøytral tegnsetting i nye systemmeldinger er et redaksjonelt forslag, ikke en allerede vedtatt appregel. Se A09.

### 2.2 Roller, produkter og standardord

| Bruk / betydning | Unngå / avgrensning | Kilde |
|---|---|---|
| Spiller | «Elev» eller «atlet» som standard approlle | S3 B1/B24 |
| Coach, hovedcoach | «Trener» alene om AK Golfs coach i UI; eventuell flatespesifikk revisjon er åpen | S3 B1, S7 |
| Forelder / foreldre | Foresatt og forelder må avstemmes der juridisk relasjon betyr noe | S3 B1, A14 |
| PlayerHQ | Spillervendt produktnavn | S6 |
| AgencyOS | «CoachHQ» i ny UI | S6 |
| AgenticOS | AI-arbeid i AgencyOS; ikke synonym for Caddie | S13 |
| Caddie | Navnet på AI-assistenten | S3 B16 |
| AK Golf HQ | Hele plattformen i publikumsvendt tekst | S7 |
| AK Golf Academy | Offisielt publikumsnavn; skriv AK med store bokstaver. Eldre programkoder kan beholdes internt | S7; A04 |
| AK Golf Junior Academy / Junior Academy | «Juniorakademiet» som merkenavn | S7 |
| Økt / treningsøkt | «Session», «workout», «ny session» | S3 B5/B24 |
| Mål, resultatmål, prosessmål | «Goal» i UI | S3 B6 |
| Statistikk, snitt, trend | «Stats»; S3 foretrekker «snitt» fremfor «gjennomsnitt» | S3 B10 |
| Plan / kalender | «Schedule» | S3 B24 |
| Abonnement | «Subscription» | S3 B15/B24 |
| Nærspill | «Kortspill», «kort spill», «rundt green» som ARG-label | S3 B24 |
| Utslag, innspill, nærspill, putting | Skill treningsområde fra statistikkategori; ikke endre beregningen ved navnebytte | S1–S4 |
| Restitusjon | «Recovery» når det betyr hvile/restitusjon; et golfslag fra trøbbel er en annen betydning | S3 B17/§10 |
| I dag, i går, i morgen, denne uka | Sammenskriving; S3 velger «denne uka» | S3 B9 |

**Øvelse er standardordet i brukergrensesnittet.** Bruk «øvelse», «øvelser» og «øvelsesbibliotek». «Drill» kan fortsatt stå i tekniske identifikatorer, eldre kilder og egennavn, men skal ikke innføres som vanlig skjermtekst. Besluttet av Anders 12.09.2026 (A01).

### 2.3 TrackMan og måleparametere

Nyere regel fra 01.09.2026 (S7/S8): Parameteren beholder sitt engelske navn og stor forbokstav, også i norsk tekst. Norsk forklaring følger etter. Eldre oversettelser og små forbokstaver i S3/S4 overstyrer ikke dette.

Eksempel med syntetisk tall: «Attack Angle −3,2°. Køllehodet går nedover i treffet.» Tallet er ikke et dokumentert spillerresultat eller en generell diagnose.

| Parameternavn i S7 | Norsk forklaring, ikke erstatningsnavn |
|---|---|
| Attack Angle | Køllehodets retning opp eller ned i treffet |
| Club Path | Køllebanens retning gjennom treffet |
| Face Angle | Køllebladets vinkel mot mållinjen |
| Face to Path | Forholdet mellom køllebladets retning og køllebanen |
| Dynamic Loft | Køllens faktiske loft i treffet |
| Smash Factor | Forholdet mellom Ball Speed og Club Speed; ikke treffprosent |
| Ball Speed | Ballens utgangshastighet |
| Club Speed | Køllehodets hastighet |
| Launch Angle | Ballens utgangsvinkel |
| Spin Rate | Ballens rotasjonshastighet |
| Spin Axis | Spinnaksens helning |
| Carry | Flydistanse frem til første landing |
| Total | Total distanse, inkludert rull |
| Dispersion | Spredning i målingene |
| Landing Angle | Ballens vinkel ved landing |
| Low Point | Laveste punkt i svingbuen |
| Swing Direction | Svingretning |

S3 har også «Total Distance», «Land Angle» og «Apex Height». Endelig samsvar mellom kildenes navnevarianter og det faktiske parameterfeltet må kontrolleres; ikke slå sammen ulike felt ved antakelse. Se A05. Den generelle norske termen «spredning» kan fortsatt brukes utenfor et navngitt TrackMan-parameterfelt.

S7 skiller uttrykkelig mellom **Trackman** i publikumsvendt merketekst og **TrackMan** i produktkoden. S3 bruker TrackMan i appen. Bevar konteksten; et globalt navnebytte er ikke bestilt.

### 2.4 Tall, tid og enheter

| Innhold | Regel / eksempel | Kilde og forbehold |
|---|---|---|
| Desimal | Komma: 72,4 | S3/S4 |
| Tusenskille | Mellomrom: 1 247 | S3/S4 |
| Prosent | 73 % | S4; S3 tillater også kompakt variant, se A10 |
| Tid | 24-timers klokke: kl. 09:00 | S3/S4 |
| Varighet | 60 min, 1 t 30 min, 20 sek | S3 |
| Tall og enhet | Mellomrom: 5 sett, 150 m, 104 mph | S3/S4 |
| Dato | 19. mai 2026; månedsnavn med liten forbokstav | S3 |
| SG | Fortegn og komma: +1,2 / −0,4; oppgi referanse og periode | S3/S4 |
| HCP | Behold faktisk HCP og fortegn; ikke utled HCP fra score eller omvendt | S3, S1 |
| Putting | Fot som primær visningsenhet; fot/ft, ikke meter som standard | S1/S2/S6 |
| Øvrige treningsavstander | Meter | S1/S2; en kildebundet analyse i yards må merkes særskilt |
| Club Speed / Ball Speed | mph i de dokumenterte TrackMan-feltene | S3 §11 |
| Vinkler / spinn | Grader / rpm der målefeltet bruker det | S3 §11 |
| Manglende verdi | — med forklaring, ikke oppdiktet null | S4 §10 |
| Reell null | 0 er et faktisk resultat, ikke synonym for manglende data | Presisering av skillet i S4 |
| Score og spillerkategori | Brutto score, aldri netto som grunnlag | S1 |

Avstandsintervaller og datointervaller bruker ulike tankestrektegn i kildene. Tegnvalg samordnes i A10; ikke endre selve avstandsgrensene som tegnsettingsopprydding.

### 2.5 Produkt, booking og tilgang

Disse definisjonene kommer fra S6. De beskriver produktbegreper, ikke ny kontroll av betaling, rettigheter eller produksjonsoppsett.

| Begrep | Betydning og språklig grense |
|---|---|
| Gratis / Pro | Appens brukerrettede nivånavn i produktreglene; ikke Premium eller Plus |
| FULL / TALENT / INGEN | Interne tilgangsutfall, ikke automatisk etiketter som brukeren skal se |
| Talentprofil | Gratis profil med avgrenset funksjonstilgang; ikke synonym for aktiv prøveperiode |
| Performance / Performance Pro | Coaching-pakker, ikke appnivåer |
| Credit | Enhet for coaching-bookinger i produktreglene. Om UI skal si credit, klipp eller coaching-time er ikke avgjort her |
| ELITE | Historisk appnivå som ikke skal vises. Ikke et forbud mot godkjente programnavn som GFGK Elite |
| Prøveperiode | Tidsavgrenset full tilgang. S6 beskriver én uke, kortkrav og første abonnement; gammel tekst om én gratis måned er utgått |
| Oppsigelse | Avslutter abonnement etter gjeldende regler; ikke automatisk tap av allerede betalt tilgang |
| Avbestilling | Gjelder en booking; må ikke blandes med oppsigelse av abonnement |
| Lokasjon | Overordnet sted som bookingen er knyttet til |
| Fasilitet | Et bestemt rom, simulator eller treningssted under en lokasjon; ikke synonym for lokasjon |
| Booking | Bestilling av tid eller tjeneste; bekreftelse, betaling og gjennomføring er ulike forhold |
| Oppmøte / deltakelse | Om en bestemt spiller deltok; ikke det samme som gruppens gjennomføringsstatus |
| Privat / delt | Hvem innhold er tilgjengelig for; synlighet må følge faktisk tilgang, ikke en etikett alene |

Beløp, rabatter og besparelsesformuleringer er ikke faste ordlisteverdier. Hent dem fra gjeldende tilbudskilde når skjermen bygges. At tidligere kilder viser 299 kr/mnd eller 2 690 kr/år er ikke en ny prisverifisering. Denne samlingen bestiller ingen betaling eller endring av tilgang.

## 3. Gjeldende treningsspråk og viktige skiller

S1/S2 er styrende for denne delen. Alle de detaljerte tabellene er samlet i del 7, og forklarende fagtekst følger i del 8.

- **Pyramiden:** FYS Fysisk → TEK Teknisk → SLAG Golfslag → SPILL Spill → TURN Turnering. Dette er visningsrekkefølge, ikke en begrensning på hva spilleren får trene.
- **19 treningsområder:** Utslag; Innspill ~50/~100/~150/~200 m; Chip; Pitch; Lob; Bunker; seks puttebånd; Styrke; Kondisjon; Bevegelighet; Banespill.
- **Puttebånd:** 0–3, 3–5, 5–10, 10–25, 25–40 og 40+ fot. Eldre bånd kan beskrive historiske analyser, men skal ikke brukes som dagens planleggingstaksonomi.
- **Motorikk:** Uten ball, Lav hastighet, Automatikk. S2 avgrenser motorikk til fullsving. Club Speed-trening klassifiseres AUTO; uten ball kan der være en øvelsesegenskap.
- **Belastning i AK-formelen:** Innendørs, Treningsområde, Bane, Konkurranse. Dette beskriver miljø, ikke en anstrengelsesskala.
- **Press:** Alene, Observert, Konkurranse, Turnering.
- **AK-formelen:** PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS. S2 knytter den til den enkelte drill/øvelse/test. S1 sier «på en økt»; forskjellen er registrert i A06.
- **Spillerkategori:** A–K, 11 nivåer, A er best. Kategorien beskriver brutto snittscore, ikke tilgang til trening. HCP er ikke samme måling.
- **Perioder og treningsblokker:** Frie merkelapper, ikke automatiske treningsforbud. Periodenavnene Grunnperiode og Turneringsperiode skal ikke forkortes til de gamle kodene GRUNN/TURNERING i nye datamerker.
- **Økt, øvelse, repetisjon, sett og resultat:** Dette er ulike nivåer. Ett registrert trykk eller oppmøte er ikke automatisk én fullført øvelse eller et prestasjonsresultat.
- **Planlagt, registrert, gjennomført, lagret og delt:** Beskriver forskjellige forhold. Ikke bruk dem som synonymer.
- **Gruppeøkt og individuell økt:** Skill felles gjennomføring, individuelt oppmøte og privat notat. Ordvalg alene endrer ikke hvem som har tilgang.

L-faser, CS-prosentnivåer, M0–M5, PR1–PR5, gamle prosentkrav, CS-tak og «invariantbrudd» er historikk. Club Speed som faktisk måling er ikke historikk. FYS-undertyper, statistikkens distansebånd og treningsområder er ulike inndelinger og må ikke slås sammen ved navnelikhet.

## 4. Handlinger, statuser og meldinger

### 4.1 Handlingsord fra eksisterende kilder

Lagre · Ferdig · Bekreft · Fortsett · Send · Gjenoppta · Importer · Marker oppnådd · Avbryt · Lukk · Tilbake · Pause · Endre · Rediger · Vis · Skjul · Last ned · Eksporter · Be om hjelp · Marker som lest · Slett · Neste · Forrige · Be om økt · Registrer ny økt · Start økt · Avslutt · Se mer · Se alle · Åpne · Send melding · Oppgrader til Pro.

Kilde: S4 §5. Ordene er ikke fullstendige handlingskontrakter: «Ferdig» sier for eksempel ikke i seg selv om noe også lagres. «Se alle» og «Vis alle», samt «Fortsett» og «Gjenoppta», må harmoniseres per handling (A12).

**Registrere er standardordet for å føre data inn i appen** (A02). Bruk «registrer», «registrert» og «registrering» når spilleren eller coachen fører inn resultat, oppmøte eller gjennomføring. «Lagre» beskriver at innholdet bevares, og «fullført» beskriver at aktiviteten er gjennomført. «Logg inn» og «logg ut» beholder sitt etablerte innloggingsbegrep; interne logger og tekniske modellnavn endres ikke av denne språkregelen.

**Blokktrening og variasjonstrening er treningsmetoder** (A03): De beskriver hvordan en øvelse trenes. De er ikke tellbare deler av en økt. Bruk «øvelse» når grensesnittet teller innholdet i økten, for eksempel «1 av 3 øvelser». En «treningsblokk» i kalenderen er et datospenn og et annet begrep.

### 4.2 Tydelig betydning — forslag til felles kontrakt

Tabellen er en redaksjonell sammenstilling for gjennomgang, basert på dokumenterte funksjonsskiller og prototypefunn i denne samtalen. De nøyaktige tekstene er **FORSLAG**, ikke en påstand om implementert funksjon eller ny produktbeslutning.

| Handling / tilstand | Hva teksten må bety |
|---|---|
| Lagre | Bevare innholdet; ikke automatisk dele det |
| Lagret | Den aktuelle innholdsversjonen er bekreftet lagret |
| Lagrer | Lagringsforsøket pågår, ikke ferdig |
| Ikke lagret | Siste endringer mangler lagringsbekreftelse |
| Del / Send | Gjøre konkret innhold tilgjengelig for en oppgitt mottaker |
| Delt / Sendt | Den konkrete versjonen er bekreftet delt/sendt i det faktiske systemet; simulering må merkes i prototypen |
| Oppdatering ikke delt | Forrige delte versjon kan fortsatt være synlig; siste endringer er ikke bekreftet delt |
| Fortsett / Gjenoppta | Åpne samme arbeid med beholdt identitet og registreringer |
| Avslutt | Avslutte aktiv gjennomføring; om den er fullført eller delvis er et eget forhold |
| Avbryt | Stoppe den aktuelle dialogen eller handlingen; ikke implisitt slette innhold |
| Avbestill | Avbestille en booking etter gjeldende vilkår, ikke bare lukke skjermen |
| Avvis | Ikke godta et forslag; ikke det samme som å angre en utført handling |
| Angre | Reversere den angitte handlingen der dette faktisk støttes |
| Slett | Fjerne angitt innhold med tydelig konsekvens; ikke synonym for avvis |

### 4.3 Meldingsmønstre til gjennomgang

| Situasjon | Foreslått tekst / krav |
|---|---|
| Lagringsforsøk feiler | «Endringene kunne ikke lagres. Prøv igjen.» Oppgi bare at de er beholdt dersom dette faktisk er sikkert |
| Ny redigering under lagring | «Du har nye endringer som ikke er lagret.» Ikke naviger som om siste versjon er lagret |
| Første deling feiler | «Beskjeden kunne ikke deles. Prøv igjen.» Ikke påstå at mottakeren har fått noe |
| Oppdatert deling feiler | «Oppdateringen kunne ikke deles. Spilleren ser fortsatt versjonen fra {tid}.» Bare når en tidligere versjon faktisk er bekreftet delt |
| Offline | Forklar hvilken handling som venter, og hvor innholdet er bevart; ikke lov lokal lagring uten bekreftelse |
| Ingen målinger | «Ingen målinger ennå.» Vis —, ikke oppdiktede verdier |
| Ingen søketreff | «Ingen spillere passer søket.» Skill dette fra en tom stall |
| Ingen tilgang | Forklar relevant neste steg uten å røpe private data |
| AI-forslag | «Forslag» før godkjenning. «Godkjent» er ikke det samme som «Utført» |
| AI-arbeid | Skill foreslått, godkjent, kjører, feilet og utført; ikke bruk «Ferdig» for alle |

Private arbeidsnotater, innholdet til spilleren og det faktisk delte sammendraget må ha tydelige navn. «Registrere» er besluttet for dataføring, og «øvelse» er den tellbare delen av en økt. Valget mellom «beskjed» og «melding» står fortsatt i A20.

## 5. Avklaringer vi må ta sammen

Ingen av forslagene under blir godkjent bare fordi dokumentet er samlet. Gjeldende, uttrykkelig vedtatte regler i del 1–3 skal ikke godkjennes på nytt.

| ID | Tema / konflikt | Hva som må avgjøres eller kontrolleres | Status |
|---|---|---|---|
| A01 | Drill / øvelse | Bruk «øvelse», «øvelser» og «øvelsesbibliotek» i UI. Tekniske identifikatorer endres ikke automatisk | **Besluttet 12.09.2026** |
| A02 | Føre / registrere / logge | Bruk «registrere» for å føre data inn i appen. Hold dette atskilt fra lagring og fullføring. «Logg inn/ut» beholdes | **Besluttet 12.09.2026** |
| A03 | Bolk / blokk / øvelse | Blokktrening og variasjonstrening beskriver hvordan man trener. De er ikke tellbare deler; tell «øvelser». Treningsblokk i kalenderen er et eget tidsbegrep | **Besluttet 12.09.2026** |
| A04 | AK Academy og programnavn | Offisielt publikumsnavn er «AK Golf Academy». Eldre programkoder kan beholdes internt; dette er ikke en datamigrering | **Besluttet 12.09.2026** |
| A05 | TrackMan-navnevarianter | TrackMan-parametere skrives på engelsk med stor forbokstav. Total/Total Distance, Landing Angle/Land Angle og Apex/Apex Height må fortsatt kobles til riktig faktisk felt | **Skrivemåte besluttet 12.09.2026; feltkontroll gjenstår** |
| A06 | AK-formel og CHIP-eksempel | S1 sier økt; S2 sier drill. Begge bruker CHIP + LAV_HAST, mens S2 sier motorikk kun fullsving. Ikke kopier et selvmotsigende eksempel | Faglig avklaring |
| A07 | Turneringsstatus | DNF = «Ikke fullført» i S1, «Startet, men trakk» i S2. Påmeldt må skilles fra bekreftet | Faglig avklaring; S1 er hovedkilden |
| A08 | Test- og kategoritall | Historiske 31/21 tester og kildepåstander om A–L i kode er ikke fersk kodekontroll. A–K med A som best er avklart | Verifiser dynamiske påstander før bruk |
| A09 | Utropstegn og sammensatte ord | S3 har Lagret!, video-analyse, test-batteri m.m.; S7 har rolig tegnsetting. Samordne uten å late som gamle stavelister er ferdig korrekturlest | Språkvask gjenstår |
| A10 | Tegn og kortformer | fot/ft, prosentmellomrom, en-/em-tankestrek, datoformat og store bokstaver i forkortelser | Samordning gjenstår |
| A11 | Belastning og press | AK-formelens miljø, fysisk anstrengelse/RPE og sosialt press er forskjellige begreper. S3 bruker overlappende navn | Klargjør forklaring per felt |
| A12 | Knapper og navigasjon | Se/Vis alle, Fortsett/Gjenoppta, Endre/Rediger; Hjem/I dag, Stall/Spillere, Gameplan/Baneguide må følge valgt reise | Ingen ny navngodkjenning i denne filen |
| A13 | Markeds- og pristilbud | S5 sier én måneds prøve og to måneder gratis. S6 har nyere regler. Gamle løfter, eksempelpriser og besparelser må ikke kopieres | Gamle tekster sperret; kontroller aktuell tilbudskilde |
| A14 | Roller på ulike flater | Coach er dagens appord. Forelder/foresatt og eventuell WANG-spesifikk elevterminologi må ha et definert omfang | Flatespesifikk avklaring |
| A15 | AI- og tekniske ord | AgenticOS, Caddie, agent, forslag, godkjenning og kjøring trenger full kobling til faktiske skjermer. Interne modellnavn er ikke automatisk etiketter | Dekning gjenstår |
| A16 | E-postløfter og lenkevarighet | Maler oppgir 24 timer / 1 time. Faktisk innstilling og leveranse er ikke kontrollert her. Tekstkonseptets sendetidspunkter er ikke implementasjonsbevis | Verifisering før publisering |
| A17 | Faglige forklaringer | «Treffpunkt = Face-to-Path» i S2 kan ikke uten videre likestilles med S3s treffmønster på køllebladet. P-posisjonsnavn varierer også | Bevar ulike begreper; faglig avklaring |
| A18 | Brede kategoriforbud | ELITE er forbudt som appnivå, ikke som ord i GFGK Elite eller eliteidrett. MORAD er internt fagspråk, ikke markedsnavn | Omfang presisert, ikke global søk/erstatt |
| A19 | Credit / klipp / coaching-time | Produktreglene bruker credit; endelig forståelig visningsnavn og entall/flertall må velges uten å endre trekkreglene | Åpen ordavklaring |
| A20 | Beskjed / melding | Velg standardord for innhold coachen sender til spilleren, og skill det fra systemvarsel og meldingstråd | Åpen ordavklaring |

### Beslutningslogg

| Dato | Beslutning | Godkjent av | Konsekvens |
|---|---|---|---|
| 12.09.2026 | Samle eksisterende språk, ord og uttrykk i ett dokument | Anders, bestilling i samtalen | Kildene samles; ingen uavklarte ordvalg godkjennes automatisk |
| 12.09.2026 | A01: «Øvelse» er standardordet i brukergrensesnittet | Anders | «Drill» beholdes bare i tekniske identifikatorer, eldre kilder og eventuelle egennavn |
| 12.09.2026 | A02: «Registrere» brukes når data føres inn | Anders | Skilles fra lagre, fullføre og logg inn/logg ut |
| 12.09.2026 | A03: Blokktrening og variasjonstrening beskriver hvordan man trener | Anders | Tellbare deler i en økt kalles øvelser; kalenderens treningsblokk er et annet begrep |
| 12.09.2026 | A04: Offisielt publikumsnavn er «AK Golf Academy» | Anders | Eldre interne programkoder endres ikke som språkvask |
| 12.09.2026 | A05: TrackMan-parametere skrives på engelsk med stor forbokstav | Anders | Feltvariantene må fortsatt kontrolleres mot faktisk datakilde |

Ved videre gjennomgang: fyll inn beslutningen, hvilke flater den gjelder og kilden. Oppdater berørt originalkilde og denne samlingen kontrollert. Ikke gjør globale navnebytter i databasen som språkvask.

## 6. Dekning og ferdigkriterier

| Område | Med i denne samlingen | Hva som ikke er bevist |
|---|---|---|
| Fag- og UI-ordbøker | Alle tabelloppføringer fra S1–S4 og S7, med kilde og vurderingsstatus | At hver eldre forklaring er faglig riktig i dag |
| Treningsplanlegging | Fagfasit og utfyllende planleggingstekst | At alle modeller og skjermer bruker samme ord |
| PlayerHQ / AgencyOS | Eksisterende hovedskjermtekster og prototypebaserte statusforslag | Full kontroll av valgt Claude Design-eksport og hele appen |
| AgenticOS | Overordnede språk- og statusskiller | Komplett skjermtekst og alle agentforløp |
| Forelder, WANG, Team Norway | Relevante roller, fagbegreper og tekstmaler | Fullstendige flatespesifikke tekstsamlinger |
| Booking og abonnement | Terminologi og kildekonflikter | Oppdaterte vilkår, prisvisning og faktisk kjøpsreise |
| Markedsføring | Språkguide, tekstkonsept og nyere forsidetekst | Ny godkjenning av alle faktapåstander eller publisering |
| E-post | Tre innloggingsrelaterte maltekster og tekstkonseptets e-poster | Alle aktive e-post-/varselmaler i kode og produksjon |
| Dyp fagkunnskap | Begrepene dokumentert i prosjektets ordbøker | Hele MORAD-/Masterbrain-/ak-second-brain-biblioteket |

Språket er gjennomgått komplett først når relevante tekster per skjermfamilie er registrert, uavklarte ordvalg er besluttet og tekstene er kontrollert i normal-, tom-, lastende-, feil-, offline- og fullført-tilstand. Kontrollen må også omfatte tastaturnavn, hjelpetekst, dialoger, varsler og e-post. Korte mobiltekster skal bevare betydningen, ikke skjule konsekvenser.

Foreslått gjennomgangsrekkefølge: produkt/roller → treningsstruktur → føring/status → golf/analyse → kalender/booking → meldinger/hjelpetekst → flatespesifikke avvik. Dette er rekkefølgen for språkarbeidet, ikke en ny produktmasterplan.

---

## 7. Samlet ord- og uttrykksregister

**945 kildeoppføringer**, sortert alfabetisk. Dette er tabellrader, ikke 945 unike godkjente begreper. Synonymer i samme kilderad er beholdt, og samme ord fra forskjellige kilder vises separat slik at motsetninger ikke forsvinner. Kolonnen «Kildens forklaring» gjengir kildeinnhold, ikke en ny bekreftelse på funksjon, regel eller korrekt språk.

**Les statuskolonnen før bruk.** Historiske ord er med for å kunne finne og fjerne dem fra nye design. Stilopplysninger som følger enkelte ord er kildehistorikk, ikke visuell instruks. Navngitte person-eksempler er erstattet med tydelige plassholdere.

| Oppslagsord i kilden | Kildens øvrige felt / forklaring | Vurderingsstatus | Kilde og opprinnelig linje |
|---|---|---|---|
|     | Bruk i stedet: Lucide SVG-ikoner | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1098 · B24. Forbudt-liste |
| «[Tall] [substantiv] [verb]» | Eksempel: 38 spillere venter | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:138 · 7. Hero-titler (flyttet fra ordbok B20) |
| «Garantert 5 slag lavere» | Fordi: Umulig å måle rettferdig, og ulovlig å love | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:21 · Slik snakker vi aldri |
| «God morgen, [navn]» | Eksempel: God morgen, {spiller A} | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:137 · 7. Hero-titler (flyttet fra ordbok B20) |
| «Lag *ny plan*» / «Mine *mål*» / «Din *innboks*» | Eksempel: italic (Familjen Grotesk) på nøkkelordet | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:140 · 7. Hero-titler (flyttet fra ordbok B20) |
| «Min [italic]workbench[/italic]» | Eksempel: Min *workbench* | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:139 · 7. Hero-titler (flyttet fra ordbok B20) |
| «Ta golfen din til neste nivå» | Fordi: Sier ingenting. Kunne stått hos hvem som helst | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:18 · Slik snakker vi aldri |
| «Unlock your potential» | Fordi: Engelsk floskel i norsk tekst | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:20 · Slik snakker vi aldri |
| «Vi brenner for golf» | Fordi: Alle sier det. Ingen tror det | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:19 · Slik snakker vi aldri |
| **{coachnavn}** | Detaljer: Head coach AK Golf, 38 aktive spillere | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:147 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {offentlig coachnavn} | Detaljer: **Ekte coach på markedssidene — ALDRI demo-spiller** | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:148 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| **{spiller A}** | Detaljer: Spiller, HCP +3,5, A1 — **demo-kanon** (alltid fullt navn) | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:146 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller B} | Detaljer: Spiller, HCP +1,2, A1 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:149 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller C} | Detaljer: Spiller, HCP 4,8, A2 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:150 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller D} | Detaljer: Spiller, HCP 8,2, B1 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:151 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller E} | Detaljer: Spiller, HCP 12,4, B2 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:152 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller F} | Detaljer: Spiller, HCP +0,4, A1 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:153 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| {spiller G} | Detaljer: Spiller, HCP 3,1, A2 | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:154 · 8. Personas — demo-data (flyttet fra ordbok B21) |
| 1-og-1 | Bokmål: 1-og-1 · Notater: bindestrek, en rep om gangen | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:854 · Trenings-modus & metoder |
| 1-putt / 2-putt / 3-putt | Bokmål: 1-putt · 2-putt · 3-putt · Notater: bindestrek; prosentform «1-putt-%» osv. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:698 · B3G. Putting-statistikk (SG-PUTT data) |
| 3-foot make rate | Bokmål: 3-fot innslagsprosent · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:701 · B3G. Putting-statistikk (SG-PUTT data) |
| 3-putt avoidance | Bokmål: 3-putt unngåelse · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:699 · B3G. Putting-statistikk (SG-PUTT data) |
| 9-hulls / 18-hulls snitt | Bokmål: 9-hulls snitt / 18-hulls snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:775 · B3X-D. Spesielle metrics |
| 9-hulls spill / 18-hulls spill | Bokmål: 9-hulls spill · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:553 · B2D. SPILL — spillsimuleringskategorier |
| A | Snittscore: under 68 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:23 · Spillerkategorier |
| A | Snittscore: under 68 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:207 · 8. Spillerkategori — hvor spilleren er |
| Abonnement | Bokmål: abonnement · Notater: aldri «subscription» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1002 · B15. Tier & abonnement |
| Abonnementsnivå | Teknisk term: `Tier` · Definisjon & bruk: GRATIS eller PRO (299 kr/mnd). **ELITE er dødt enum — aldri i UI** (låst juni 2026). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:356 · 15. Datamodell & status-enums |
| Abonnementsstatus | Teknisk term: `SubscriptionStatus` · Definisjon & bruk: ACTIVE, PAST_DUE, CANCELLED, TRIALING — livssyklus for PRO-abonnementet. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:357 · 15. Datamodell & status-enums |
| Admin | Bokmål: admin · Notater: systembruker | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:422 · B1. Roller |
| AI | Bokmål: AI · Notater: «AI-foreslå», «AI-coach», «AI-generert» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1013 · B16. AI & coach-hjelpere |
| AI Caddie | Teknisk term: `Caddie` / `PlanSuggestion` · Definisjon & bruk: Analyserer TM-/SG-data periodisk og foreslår planendringer coach godkjenner (etter TM-import + søndag-batch; payload + evidence + reason). | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:328 · 14. Planleggingshjernen |
| AK Academy |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:202 · Grupper og programmer |
| AK Academy |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:233 · 9. Grupper og programmer |
| AK Academy Junior |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:203 · Grupper og programmer |
| AK Academy Junior |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:234 · 9. Grupper og programmer |
| AK Golf | Galt: AK-Golf, AKGolf, ak golf | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:98 · Navn og skrivemåte |
| AK Golf Academy | Galt: Akademiet, AK Academy | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:99 · Navn og skrivemåte |
| AK Golf HQ | Galt: PlayerHQ i publikumsvendt tekst om hele plattformen | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:101 · Navn og skrivemåte |
| AK Golf Junior Academy · kort: Junior Academy | Galt: Juniorakademiet | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:100 · Navn og skrivemåte |
| AK-formelen | Teknisk term: (CS · L-fase · M · PR) · Definisjon & bruk: Firedelt koding av slag/drill: hvor hardt, hvor innlært, hvor virkelighetsnært, hvor mye press. Felles «adresse» for enhver øvelse. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:401 · 16. Andre sentrale begreper |
| Akademi-coach | Bokmål: akademi-coach · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:423 · B1. Roller |
| Akse / Etikett / Legende | Bokmål: akse / etikett / legende · Notater: x-/y-akse; label; legend | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:787 · B3X-E. Visualiserings-uttrykk |
| Aktiv / Inaktiv | Bokmål: aktiv / inaktiv · Notater: flertall: aktive/inaktive | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1038 · B18. Tilstander & feedback-ord |
| Aktiv hvile | Bokmål: aktiv hvile · Notater: uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:458 · B2A. FYS — fysiske underkategorier |
| Aktivering | Teknisk term: `AKTIVERING` · Definisjon & bruk: Aktivering/oppvarming før belastning. Felter: reps, sett. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:189 · 7. FYS — fysiske underkategorier |
| ALENE | Navn: Alene | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:112 · AK-formelen |
| ALENE | Navn: Alene | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:102 · 3.3 Press (hvem som ser på) |
| Alignment / Sikt | Bokmål: sikte / sikt · Notater: «Sikt mot flagg»; også «sikting» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:486 · B2B. TEK — tekniske underkategorier |
| All / Show all | Bruk i stedet: Alle / Vis alle | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1095 · B24. Forbudt-liste |
| Anbefalt CS per L-fase | Teknisk term: `LFASE_ANBEFALT_CS` · Definisjon & bruk (canon v3.5): Kart L-fase → anbefalte CS-nivåer. Kode-status: kodens CS50–100-mapper er nå FASIT (Anders 2026-07-07, CS50-gulv). CS-intervallene på L-radene over (CS20–40 m.fl.) er stale og venter rekalibrering mot CS50-gulvet — avklar nye bånd med Anders før de skrives om. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:74 · 2. L-faser (læringsfaser) |
| Anbefalt for deg | Bokmål: Anbefalt for deg · Notater: lime stripe | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1015 · B16. AI & coach-hjelpere |
| Angle of attack / Attack angle | Bokmål: attack angle · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:497 · B2B. TEK — tekniske underkategorier |
| Anker | Bokmål: anker · Notater: «lower body anchor» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:448 · B2A. FYS — fysiske underkategorier |
| Anleggstype | Teknisk term: `FacilityType` · Definisjon & bruk: STUDIO, RANGE_1F, RANGE_2F, PUTTING_GREEN, SHORT_GAME (nærspillsområde), COURSE_9H, COURSE_18H, SPECIFIC_HOLES, GENERAL. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:376 · 15. Datamodell & status-enums |
| Apex | Bokmål: apex · Notater: toppunkt; «apex-høyde» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:665 · B3D. Driving-statistikk (SG-OTT data) |
| Apex Height | Teknisk term: `apexHeight` · Definisjon & bruk: Ballbanens høyeste punkt (meter). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:264 · 11. TrackMan-parametere |
| Approach proximity | Bokmål: innspill-nærhet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:770 · B3X-D. Spesielle metrics |
| Approach quality | Bokmål: approach-kvalitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:677 · B3E. Approach-statistikk (SG-APP data) |
| Approach-snitt / Innspill-snitt | Bokmål: approach-snitt / innspill-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:680 · B3E. Approach-statistikk (SG-APP data) |
| Approach-spill / Innspill | Bokmål: innspill · Notater: «approach» på norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:518 · B2C. SLAG — slag-spesifikke kategorier |
| Arbeidsoppgave | Teknisk term: `PositionTask` · Definisjon & bruk: Konkret teknisk oppgave med L-fase, CS, M, PR. Auto-oppdateres av matchede TrackMan-slag; `diagnosticOverride` lar coach lukke uten TM-evidens. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:333 · 14. Planleggingshjernen |
| Arbeidsoppgave-status | Teknisk term: `PositionTaskStatus` · Definisjon & bruk: PENDING, ACTIVE (logger reps), DONE, ARCHIVED. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:381 · 15. Datamodell & status-enums |
| Around-green-snitt | Bokmål: around-green-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:690 · B3F. Around-green-statistikk (SG-ARG data) |
| Attack Angle | Teknisk term: `attackAngle` · Definisjon & bruk: Køllehodets vinkel opp/ned i treff (grader). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:267 · 11. TrackMan-parametere |
| Attack Angle | Aldri: angrepsvinkel, angle of attack | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:49 · De vanligste |
| AUTO | Navn: Automatikk | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:97 · AK-formelen |
| AUTO | Navn: Automatikk | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:83 · 3.1 Motorikk (læringssteg — gjelder KUN fullsving) |
| Av Anders | Bokmål: av Anders · Badge-stil: mono forest badge | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:890 · Status på økter |
| Avbestill / Pause-abonnement | Bokmål: Avbestill Pro / pause-abonnement · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1005 · B15. Tier & abonnement |
| Avbrutt | Bokmål: avbrutt · Badge-stil: rød | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:894 · Status på økter |
| Avbryt / Lukk / Tilbake / Pause / Endre / Rediger / Vis / Skjul / Last ned / Eksporter / Be om hjelp / Marker som lest | Tekst: — · Stil: outline (Lukk kan være X-ikon) | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:114 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Avslutt | Tekst: Avslutt · Stil: outline (live-modus: lime) | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:120 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Avstandsmål | Bokmål: avstandsmål · Notater: «50–100 m» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:546 · B2C. SLAG — slag-spesifikke kategorier |
| B | Snittscore: 68–72 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:24 · Spillerkategorier |
| B | Snittscore: 68–72 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:208 · 8. Spillerkategori — hvor spilleren er |
| Backspin / Sidespin | Bokmål: backspin / sidespin · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:664 · B3D. Driving-statistikk (SG-OTT data) |
| Balanse | Bokmål: balanse · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:450 · B2A. FYS — fysiske underkategorier |
| Balanse (i swingen) | Bokmål: balanse · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:478 · B2B. TEK — tekniske underkategorier |
| Ball speed | Bokmål: ballhastighet · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:660 · B3D. Driving-statistikk (SG-OTT data) |
| Ball Speed | Teknisk term: `ballSpeed` · Definisjon & bruk: Ballens utgangshastighet (mph). Inngår i smash; spredning aggregeres som `sigmaBall`. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:256 · 11. TrackMan-parametere |
| Ball Speed · Club Speed | Aldri: ballfart, køllefart | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:55 · De vanligste |
| BANE | Navn: Banespill | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:76 · Treningsområder |
| BANE | Navn: Bane | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:105 · AK-formelen |
| BANE | Navn: Banespill · Familie: Bane · Enhet: — · Hva en rep er: Hull | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:58 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| BANE | Navn: Bane | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:95 · 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1) |
| Baneguide | Teknisk term: `/portal/baneguide/*` (redirects), `docs/baneguide-produktdokument-2026-08-02.md` · Definisjon & bruk: Paraplybegrep for F{initialer}/UNDER/ETTER-sløyfen på banen (Gameplan + live kart-føring + analyse). Rutene redirecter til `/portal/gameplan`. Om «Baneguide» skal tilbake som UI-navn er åpen beslutning (B1 i produktdokumentet §13 / PB5 i `docs/plan-baneguide-sg-app-2026-08-16.md`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:405 · 16. Andre sentrale begreper |
| Banerecon / Bane-vandring | Bokmål: banerecon · Notater: «course recon» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:586 · B2E. TURN — turnerings-spesifikke kategorier |
| Baseline / Retest | Bokmål: baseline / retest · Notater: engelsk-norsk / ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:875 · Tester & måling |
| Be om | Tekst: Be om økt · Stil: aldri «request» | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:117 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Beinstyrke | Bokmål: beinstyrke · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:451 · B2A. FYS — fysiske underkategorier |
| Bekreft / Fortsett / Send / Gjenoppta / Importer / Marker oppnådd | Tekst: — · Stil: primary | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:113 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Belastning | Bokmål: belastning · Notater: «low/medium/high» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:818 · B5. Trening — økter & drills |
| Belastning / Volum / Intensitet | Bokmål: belastning / volum / intensitet · Notater: «Belastning: Lav/Medium/Høy» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:805 · B4. Treningsplanlegging — periodisering |
| Belastning / Volum / Intensitet | Bokmål: belastning / volum / intensitet · Notater: volum = timer × intensitet | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:861 · Belastning-skala |
| Belastnings-zone / Optimal-zone | Bokmål: belastnings-zone / optimal-zone · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:865 · Belastning-skala |
| Benchmark | Teknisk term: `BenchmarkGroup` · Definisjon & bruk: Forventet antall slag fra gitt posisjon/distanse, per kategori (8–15 distansegrupper). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:240 · 10. Strokes Gained (SG) og benchmarks |
| Benchmark | Bokmål: benchmark · Notater: engelsk-norsk akseptert | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:628 · B3B. SG-benchmark & sammenligning |
| Best ever / Personlig best / PR | Bokmål: beste resultat / personlig best / PR · Notater: «Personal Record» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:883 · Tester & måling |
| Best-ball / Worst-ball | Bokmål: best-ball / worst-ball · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:563 · B2D. SPILL — spillsimuleringskategorier |
| Beste runde | Bokmål: beste runde · Notater: «personlig rekord» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:715 · B3X-A. Score-statistikk |
| Betalingsstatus | Teknisk term: `PaymentStatus` · Definisjon & bruk: PENDING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:364 · 15. Datamodell & status-enums |
| Betalingstype | Teknisk term: `PaymentType` · Definisjon & bruk: BOOKING, SUBSCRIPTION, INVOICE, OTHER. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:365 · 15. Datamodell & status-enums |
| Bevegelighet | Teknisk term: `BEVEGELIGHET` · Definisjon & bruk: Tøyetrening. Felter: sett, tid, bevegelighetstype. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:186 · 7. FYS — fysiske underkategorier |
| BEVEGELIGHET | Navn: Bevegelighet (fysisk) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:75 · Treningsområder |
| BEVEGELIGHET | Navn: Bevegelighet · Familie: FYS · Enhet: — · Hva en rep er: Tid (enkel timer, ingen segmenter) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:57 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Bevegelighetstype | Teknisk term: `BEVEGELIGHET_TYPER` · Definisjon & bruk: Tøyemetode: STATISK, DYNAMISK, PNF, MYOFASCIAL. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:193 · 7. FYS — fysiske underkategorier |
| Birdie / Eagle / Albatross | Bokmål: birdie / eagle / albatross · Notater: flertall: birdies, eagles | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:717 · B3X-A. Score-statistikk |
| Birdie-% / Par-% / Bogey-% | Bokmål: birdie-% osv. · Notater: bindestrek + prosent; bogey-or-worse-% = «bogey-eller-værre-%» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:722 · B3X-A. Score-statistikk |
| Blokk (B) | Teknisk term: `BLOKK` · Definisjon & bruk: Samme oppgave repeteres — isolert innlæring. Dominerer grunnperiode (70 %) og ferie (80 %). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:203 · 8. Praksistyper |
| Blokk-praksis / Random-praksis | Bokmål: blokk-praksis / random-praksis · Notater: bindestrek (samme drill gjentas / randomiseres) | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:843 · Trenings-modus & metoder |
| Blokk-praksis / Random-praksis / Differensiell-praksis | Bokmål: blokk-praksis / random-praksis / differensiell-praksis · Notater: bindestrek; «variabel praksis» uten | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:802 · B4. Treningsplanlegging — periodisering |
| Booking | Merknad: Coachtime/fasilitet, fra booking-systemet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:182 · Blokk-typer i kalenderen |
| Booking | Merknad: Coachtime/fasilitet, fra booking-systemet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:187 · 7. Blokk-typer i kalenderen |
| Booking-status | Teknisk term: `BookingStatus` · Definisjon & bruk: PENDING, CONFIRMED, CANCELLED, COMPLETED. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:363 · 15. Datamodell & status-enums |
| Bossum Golfklubb | Forkortelse: Bossum GK · Lokasjon: Bærum | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:164 · 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22) |
| Bounce-back % | Bokmål: bounce-back-% · Notater: rett etter bogey | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:766 · B3X-D. Spesielle metrics |
| Break | Bokmål: break · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:535 · B2C. SLAG — slag-spesifikke kategorier |
| Breaking Point | Teknisk term: *(ikke i koden)* · Definisjon & bruk: Punktet der teknikken bryter sammen når hastigheten økes — tren like under, skyv gradvis opp. Håndteres i praksis via `csMax` + CS-progresjon. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:402 · 16. Andre sentrale begreper |
| Brukerrolle | Teknisk term: `UserRole` · Definisjon & bruk: ADMIN, COACH, PLAYER, PARENT, GUEST. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:360 · 15. Datamodell & status-enums |
| Bunker | Teknisk term: `BUNKER` · Definisjon & bruk: Sandslag rundt green. SG-kategori `KORT_SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:121 · 4. Treningsområder |
| BUNKER | Navn: Bunker | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:66 · Treningsområder |
| BUNKER | Navn: Bunker · Familie: Bunker · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:48 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Bunker / Greenside bunker / Fairway-bunker | Bokmål: bunker / greenside bunker / fairway-bunker · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:829 · Områder (på driving range / golfbane) |
| Bunker-spill / Greenside bunker | Bokmål: bunker · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:524 · B2C. SLAG — slag-spesifikke kategorier |
| C | Snittscore: 72–74 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:25 · Spillerkategorier |
| C | Snittscore: 72–74 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:209 · 8. Spillerkategori — hvor spilleren er |
| Caddie | Bokmål: Caddie · Notater: AI-assistent-navn | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1018 · B16. AI & coach-hjelpere |
| Cancel | Bruk i stedet: avbryt / avbestill | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1085 · B24. Forbudt-liste |
| Carry | Teknisk term: `carryDistance` · Definisjon & bruk: Flydistanse før landing (meter). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:262 · 11. TrackMan-parametere |
| Carry · Total | Aldri: bærelengde | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:59 · De vanligste |
| Centre of green | Bokmål: sentrum av green · Notater: norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:675 · B3E. Approach-statistikk (SG-APP data) |
| Chip | Teknisk term: `CHIP` · Definisjon & bruk: Lavt rullende nærspill. SG-kategori `KORT_SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:118 · 4. Treningsområder |
| Chip | Bokmål: chip · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:521 · B2C. SLAG — slag-spesifikke kategorier |
| CHIP | Navn: Chip | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:63 · Treningsområder |
| CHIP | Navn: Chip · Familie: Nærspill · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:45 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Chip-snitt / Pitch-snitt | Bokmål: chip-snitt / pitch-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:689 · B3F. Around-green-statistikk (SG-ARG data) |
| Chipping-område / Pitching-område | Bokmål: chipping-område / pitching-område · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:828 · Områder (på driving range / golfbane) |
| CLAIMED_REGISTERED | Navn: Påmeldt | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:166 · Turneringer |
| CLAIMED_REGISTERED | Navn: Påmeldt (venter dobbel bekreftelse) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:170 · 6. Turneringer |
| Click | Bruk i stedet: klikk (norsk, ikke "click here") | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1090 · B24. Forbudt-liste |
| Club path | Bokmål: club path · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:496 · B2B. TEK — tekniske underkategorier |
| Club Path | Teknisk term: `clubPath` · Definisjon & bruk: Køllebane gjennom treff, in-to-out/out-to-in (grader). Snitt = `avgClubPath`; med Face Angle gir D-plane. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:268 · 11. TrackMan-parametere |
| Club Path | Aldri: køllebane, svingbane | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:50 · De vanligste |
| Club Speed | Teknisk term: `clubSpeed` · Definisjon & bruk: Køllehodets hastighet i treff (mph). Klassifiserer rep-hastighet; overvåkes i fatigue og CS-progresjon. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:257 · 11. TrackMan-parametere |
| Club Speed (målt) | Visning: mph · Eksempel: `104 mph` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:71 · 2. Tall, enheter og formatering |
| coach | Galt: trener, når det er AK Golfs egne | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:104 · Navn og skrivemåte |
| Coach | Bokmål: coach · Notater: aldri «trener» alene i UI (ok i «hovedcoach») | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:419 · B1. Roller |
| Coach-direktiv | Teknisk term: `CoachDirektivType` · Definisjon & bruk: PIN, BLOCK, PRIORITER — coach styrer drill-anbefalinger. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:388 · 15. Datamodell & status-enums |
| Combine / TrackMan-combine | Bokmål: combine / TrackMan-combine · Notater: engelsk fagterm; bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:876 · Tester & måling |
| Comeback | Bokmål: comeback · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:593 · B2E. TURN — turnerings-spesifikke kategorier |
| COMPLETED | Navn: Gjennomført | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:169 · Turneringer |
| COMPLETED | Navn: Gjennomført | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:173 · 6. Turneringer |
| Compression | Bokmål: compression · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:502 · B2B. TEK — tekniske underkategorier |
| CONFIRMED | Navn: Bekreftet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:167 · Turneringer |
| CONFIRMED | Navn: Bekreftet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:171 · 6. Turneringer |
| Constraint-based / Game-based | Bokmål: constraint-based / game-based · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:845 · Trenings-modus & metoder |
| Core | Bokmål: core · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:452 · B2A. FYS — fysiske underkategorier |
| Core-stabilitet | Bokmål: core-stabilitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:447 · B2A. FYS — fysiske underkategorier |
| Course management / Banespill | Bokmål: banespill · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:554 · B2D. SPILL — spillsimuleringskategorier |
| Course Rating / CR / Slope | Bokmål: course rating / CR / slope · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:930 · B8. HCP & score-termer |
| CS-maks | Bokmål: CS-maks · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:803 · B4. Treningsplanlegging — periodisering |
| CS-nivå | Teknisk term: `CSNivaa` / `CS_NIVAER` · Definisjon & bruk: Seks treningstempoer CS50–CS100 (fasit 2026-07-07, matcher Prisma). Begrenses av `csMax` per periode; klassifiserer rep-hastighet (LAV/FULL). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:96 · 3. CS — Club Speed |
| CS-nivå (trening) | Visning: CS + prosent-tall, ni nivåer · Eksempel: `CS80` (aldri CS75) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S4:72 · 2. Tall, enheter og formatering |
| CS-nivåer (CS20–CS100) | Erstattet av: Ingenting — uavklart, ute av bruk | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S1:122 · AK-formelen |
| CS-nivåer (CS50–CS100) | Erstattet av: Ingenting — uavklart, ute av bruk. Spør deg før noe nytt bruker CS. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S2:124 · 3.5 Utgått — skal ALDRI brukes i noe nytt |
| CS-nivåer i tekst | Bokmål: CS20 … CS100 · Notater: UPPERCASE + tall, ingen mellomrom. Ni nivåer (canon v3.5) — CS75 o.l. finnes ikke | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:804 · B4. Treningsplanlegging — periodisering |
| CS-progresjon | Teknisk term: `beregnCsProgresjon()` / `CsProgresjon` · Definisjon & bruk: CS-utvikling (mph) som 4-ukers rullende snitt over 8 uker, med endring, trend og skadevarsel. Fra TrackMan-økter. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:104 · 3. CS — Club Speed |
| CS-tak | Teknisk term: `csMax` · Definisjon & bruk: Øktens CS kan aldri overstige periodens maks (GRUNN 70 %, SPESIALISERING 90 %, TURNERING 100 %). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:312 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| CS-trend | Teknisk term: `CsTrend` · Definisjon & bruk: OPP / FLAT / NED. FLAT ved \|endring\| ≤ 2 % (`TREND_TERSKEL_PCT`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:105 · 3. CS — Club Speed |
| CS100 | Teknisk term: `CS100` · Definisjon & bruk: 100 % — maks hastighet. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:103 · 3. CS — Club Speed |
| CS20 / CS30 / CS40 | Teknisk term: `CS20` `CS30` `CS40` · Definisjon & bruk: UTGÅTT (Anders 2026-07-07) — finnes ikke i UI eller kode. Bevegelses-/saktedriller uttrykkes innenfor CS50. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:97 · 3. CS — Club Speed |
| CS50 | Teknisk term: `CS50` · Definisjon & bruk: 50 % — minimum for balltrening. LAV-klassifisering (CS50–CS70). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:98 · 3. CS — Club Speed |
| CS60 | Teknisk term: `CS60` · Definisjon & bruk: 60 % — moderat balltrening. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:99 · 3. CS — Club Speed |
| CS70 | Teknisk term: `CS70` · Definisjon & bruk: 70 % — kontrollert full swing. Grense LAV/FULL rep-hastighet. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:100 · 3. CS — Club Speed |
| CS80 | Teknisk term: `CS80` · Definisjon & bruk: 80 % — full swing med kontroll. FULL-klassifisering (CS80–CS100). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:101 · 3. CS — Club Speed |
| CS90 | Teknisk term: `CS90` · Definisjon & bruk: 90 % — tour-speed trening. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:102 · 3. CS — Club Speed |
| Cut | Bokmål: cut · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:920 · B7. Turneringer |
| D | Snittscore: 74–76 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:26 · Spillerkategorier |
| D | Snittscore: 74–76 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:210 · 8. Spillerkategori — hvor spilleren er |
| D-plane | Teknisk term: `computeDPlane()` / `D_PLANE_DRIFT` · Definisjon & bruk: Ballflukt fra face + path: PULL_HOOK, PULL_FADE, PUSH_DRAW, PUSH_FADE, STRAIGHT (toleranse 0,5°). Drift overvåkes. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:286 · 12. TrackMan-analyser og innsikt |
| Daglig / Ukentlig / Månedlig | Bokmål: daglig / ukentlig / månedlig · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:958 · B10. Statistikk-termer |
| DataGolf | Bokmål: DataGolf · Notater: merkenavn, CamelCase; «DataGolf-snitt» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:632 · B3B. SG-benchmark & sammenligning |
| DataGolf-benchmark-sync | Teknisk term: `benchmark-sync` · Definisjon & bruk: Henter DataGolf-referanser. Cron mandag 08:00; coach godkjenner på `/admin/tester/benchmarks`. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:247 · 10. Strokes Gained (SG) og benchmarks |
| Dato kort / lang | Bokmål: `19/5` eller `19. mai` / `19. mai 2026` · Eksempel: månedsnavn lowercase | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1064 · B23. Tall, dato, tid — formatering |
| Deltakelse (gruppeøkt) | Teknisk term: `ParticipationStatus` · Definisjon & bruk: INVITED, ACCEPTED, DECLINED, MAYBE, ATTENDED, NO_SHOW. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:371 · 15. Datamodell & status-enums |
| Denne uka | Bokmål: denne uka · Notater: aldri «denne uken» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:941 · B9. Kalender & tid |
| Design-kobling QA | Teknisk term: `DesignKoblingStatus` / `ApprovalStatus` · Definisjon & bruk: UNMAPPED/MAPPED/APPROVED/MISSING/BROKEN · PENDING/APPROVED/MINOR_AVVIK/MAJOR_AVVIK/SKIP (design→kode-sporing). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:390 · 15. Datamodell & status-enums |
| Desimaltall | Bokmål: komma som desimalskille · Eksempel: `+3,5`, `72,4`, `0,42 SG` | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1061 · B23. Tall, dato, tid — formatering |
| Desimaltall | Visning: komma, aldri punktum · Eksempel: `+3,5` · `0,42 SG` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:66 · 2. Tall, enheter og formatering |
| Dispersion | Aldri: spredning | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:60 · De vanligste |
| Dispersion / spredning | Teknisk term: `src/lib/gameplan/dispersion.ts` · Definisjon & bruk: Spillerens spredningsmønster (kovarians-ellipse, bias side/lengde) fra bane-GPS (`Shot`) og TrackMan (`side`/`carryDistance`). Begge norske former OK (jf. B3-vokabularet). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:406 · 16. Andre sentrale begreper |
| Distance bucket / Distanse-zone | Bokmål: distanse-bucket / distanse-zone · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:642 · B3C. SG per distanse / situasjon |
| Distance-kontroll / Avstandskontroll | Bokmål: lengdekontroll · Notater: ett ord, norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:533 · B2C. SLAG — slag-spesifikke kategorier |
| Distansegap | Teknisk term: `evaluateDistanceGapping` / `DISTANCE_GAPPING` · Definisjon & bruk: For små/store avstandshull mellom køller. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:289 · 12. TrackMan-analyser og innsikt |
| Distribusjon / Fordeling | Bokmål: fordeling · Notater: norsk form foretrukket | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:738 · B3X-B. Statistikk-uttrykk |
| DNF | Navn: Ikke fullført | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S1:170 · Turneringer |
| DNF | Navn: Startet, men trakk | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S2:174 · 6. Turneringer |
| Double / Triple bogey | Bokmål: double bogey / triple bogey · Notater: uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:720 · B3X-A. Score-statistikk |
| Draw | Bokmål: draw · Notater: venstre-buet (høyrehendt) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:538 · B2C. SLAG — slag-spesifikke kategorier |
| Drift-deteksjon | Teknisk term: `detectDrift()` / `evaluateDPlaneDrift` · Definisjon & bruk: Gradvis drift i path/face over uker (`slopePerWeek`); flagger verste kølle. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:292 · 12. TrackMan-analyser og innsikt |
| Drill / Drill-bibliotek | Bokmål: drill / drill-bibliotek · Notater: flertall: drills; bindestrek | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:813 · B5. Trening — økter & drills |
| Drill-fasilitet | Teknisk term: `DrillFasilitet` · Definisjon & bruk: Utstyrs-/anleggskrav (14 verdier: RADAR, SIMULATOR, BUNKER, SHORT_GAME_AREA, DRIVING_RANGE, PUTTING_GREEN m.fl.). Matches mot `tilgjengeligeFasiliteter`. Tom = ingen krav. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:354 · 15. Datamodell & status-enums |
| Drill-malkategori | Teknisk term: `DRILL_MAL_KATEGORIER` · Definisjon & bruk: 11 malkategorier som hver mapper til ett pyramide-område (TEKNIKK→TEK, PUTT_DRILL→SLAG, MENTAL_DRILL→TURN …). | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:57 · 1. Pyramiden |
| Drillmodus | Teknisk term: `DrillModus` (`FYS`\|`GOLF`) · Definisjon & bruk: FYS gir reps/sett/kg/tid/sone; GOLF gir treningsområde/L-fase/P-posisjoner/miljø. Via `getDrillModus()` / `isFysDrill()`. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:53 · 1. Pyramiden |
| Drive | Bokmål: drive · Notater: «tee-shot» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:516 · B2C. SLAG — slag-spesifikke kategorier |
| Driver / Putter / Hybrid | Bokmål: driver / putter / hybrid · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:972 · B12. Kølle-typer |
| Driver-snitt / Tee-snitt | Bokmål: driver-snitt / tee-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:666 · B3D. Driving-statistikk (SG-OTT data) |
| Driving accuracy | Bokmål: driving-treff · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:667 · B3D. Driving-statistikk (SG-OTT data) |
| Driving distance / Carry distance | Bokmål: driving-distanse / carry-distanse · Notater: bindestrek; «carry» alene ok | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:656 · B3D. Driving-statistikk (SG-OTT data) |
| Driving range / Range | Bokmål: driving range / range · Notater: mellomrom, anglisisme OK; «range matte 4», «gress-tee», «range target» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:826 · Områder (på driving range / golfbane) |
| Dynamic loft | Bokmål: dynamisk loft · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:499 · B2B. TEK — tekniske underkategorier |
| Dynamic Loft | Teknisk term: `dynamicLoft` · Definisjon & bruk: Faktisk loft i treff (grader). Med attack angle: launch/spinn. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:271 · 11. TrackMan-parametere |
| Dynamic Loft | Aldri: dynamisk loft | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:53 · De vanligste |
| Dynamisk oppvarming | Bokmål: dynamisk oppvarming · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:460 · B2A. FYS — fysiske underkategorier |
| E | Snittscore: 76–78 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:27 · Spillerkategorier |
| E | Snittscore: 76–78 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:211 · 8. Spillerkategori — hvor spilleren er |
| Eksplosiv styrke | Bokmål: eksplosiv styrke · Notater: uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:435 · B2A. FYS — fysiske underkategorier |
| Eksport | Bokmål: eksport · Notater: «Eksporter til CSV/PDF» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:790 · B3X-E. Visualiserings-uttrykk |
| Elev | Bruk i stedet: spiller | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1077 · B24. Forbudt-liste |
| Elite | Bokmål: — · Notater: **DØDT enum — vises ALDRI i UI** (låst beslutning juni 2026; jf. §15 Tier) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1001 · B15. Tier & abonnement |
| Error | Bruk i stedet: Noe gikk galt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1089 · B24. Forbudt-liste |
| EVALUERING | Typisk innhold (veiledende): Testing, analyse, planlegging av neste år | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:135 · Periodisering |
| EVALUERING | Typisk innhold (veiledende, ikke krav): Testing, analyse, planlegging av neste år | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:140 · 4. Periodisering — årets rytme |
| Evalueringsperiode | Teknisk term: `EVALUERING` · Definisjon & bruk: Test og vurdering — mye simulert spill. TURN 30–65 %, SPILL 20–45 %. 100 % L_AUTO. 180–360 min/uke. (Kun i `PeriodeType`.) | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:222 · 9. Periodisering |
| Expected strokes / Forventet slag | Bokmål: forventet slag · Notater: norsk form; også «forventet putts» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:633 · B3B. SG-benchmark & sammenligning |
| F | Snittscore: 78–80 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:28 · Spillerkategorier |
| F | Snittscore: 78–80 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:212 · 8. Spillerkategori — hvor spilleren er |
| Face angle | Bokmål: face angle · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:495 · B2B. TEK — tekniske underkategorier |
| Face Angle | Teknisk term: `faceAngle` · Definisjon & bruk: Køllebladets vinkel mot mållinjen (grader). Snitt = `avgFaceAngle`; overvåkes i D-plane-drift. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:269 · 11. TrackMan-parametere |
| Face Angle | Aldri: bladvinkel, køllefjes | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:51 · De vanligste |
| Face to Path | Teknisk term: `faceToPath` · Definisjon & bruk: Face − path (grader) — hovedforklaring på kurven. | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S3:270 · 11. TrackMan-parametere |
| Face to Path | Aldri: — | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S7:52 · De vanligste |
| Fade | Bokmål: fade · Notater: høyre-buet (høyrehendt) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:539 · B2C. SLAG — slag-spesifikke kategorier |
| Fairway / Rough / Semi-rough / Green | Bokmål: fairway / rough / semi-rough / green · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:831 · Områder (på driving range / golfbane) |
| Fairway-bunker | Bokmål: fairway-bunker · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:525 · B2C. SLAG — slag-spesifikke kategorier |
| Fairways hit | Bokmål: fairways truffet · Notater: norsk; FH-% med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:654 · B3D. Driving-statistikk (SG-OTT data) |
| Fatigue-mønster | Teknisk term: `evaluateFatiguePattern` / `FATIGUE_PATTERN` · Definisjon & bruk: Fall i Club Speed utover økten (tretthet). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:291 · 12. TrackMan-analyser og innsikt |
| Feedback-loop | Bokmål: feedback-loop · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:851 · Trenings-modus & metoder |
| Feil | Bokmål: Noe gikk galt · Notater: aldri «Error» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:993 · B14. Notifikasjoner & feedback |
| FERIE | Typisk innhold (veiledende): Fri | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:137 · Periodisering |
| FERIE | Typisk innhold (veiledende, ikke krav): Fri | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:142 · 4. Periodisering — årets rytme |
| Ferieperiode | Teknisk term: `FERIE` · Definisjon & bruk: Vedlikehold, fysisk fokus, lavt volum. FYS ≥ 40 %. L_KROPP/L_ARM. 60–240 min/uke. (Kun i `PeriodeType`.) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:223 · 9. Periodisering |
| Filter | Bokmål: filter · Notater: flertall: filtre | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:789 · B3X-E. Visualiserings-uttrykk |
| Flop shot / Lob shot | Bokmål: lob · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:522 · B2C. SLAG — slag-spesifikke kategorier |
| Fokus-mal | Teknisk term: `TEMPLATE_FOCUS` · Definisjon & bruk: Forhåndsdefinerte øktfokus (Full bag, Nærspill, Putting, Langt spill, Tilnærming, Bunker, Turneringsprep) → sett av treningsområder via `getOmraaderForFokus()`. Kode-enum heter `KORT_SPILL`; UI-tekst «Nærspill». | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:131 · 4. Treningsområder |
| Fokus-trigger | Bokmål: fokus-trigger · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:597 · B2E. TURN — turnerings-spesifikke kategorier |
| Follow-through | Bokmål: follow-through · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:507 · B2B. TEK — tekniske underkategorier |
| Forbedring / Tilbakegang / Vedlikehold | Bokmål: forbedring / tilbakegang / vedlikehold · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:882 · Tester & måling |
| Forbered meg | Bokmål: Forbered meg · Notater: AI-knapp | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1019 · B16. AI & coach-hjelpere |
| FORBEREDELSER | Typisk fokus (veiledende): Spissing mot kommende turnering | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:151 · Treningsblokk-merker |
| FORBEREDELSER | Typisk fokus (veiledende): Spissing mot kommende turnering | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:160 · 5. Treningsblokk-merker (nye 20.08.2026) |
| Forelder | Bokmål: forelder / foreldre · Notater: flertall: foreldre | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:421 · B1. Roller |
| Foreldre-relasjon | Teknisk term: `ParentLinkRelation` · Definisjon & bruk: FATHER, MOTHER, GUARDIAN (foreldre-invitasjon, V2 Spor 3). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:370 · 15. Datamodell & status-enums |
| Forfalt / Betalt | Bokmål: forfalt / betalt · Notater: «800 kr forfalt» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1004 · B15. Tier & abonnement |
| Form (snitt × trend) | Bokmål: form · Notater: «Pro-form» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:759 · B3X-C. Tidsperioder & sammenligning |
| Form / Friskhet / Tretthet / Skarphet | Bokmål: form / friskhet / tretthet / skarphet · Notater: TSB-resultat; freshness/fatigue/sharpness | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:868 · Belastning-skala |
| Forrige / Neste uke | Bokmål: forrige uke / neste uke · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:942 · B9. Kalender & tid |
| Forslag / Anbefaling | Bokmål: forslag / anbefaling · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1014 · B16. AI & coach-hjelpere |
| Forslagsstatus | Teknisk term: `SuggestionStatus` · Definisjon & bruk: PENDING, ACCEPTED, REJECTED, EDITED (EDITED = godkjent etter justering). | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:331 · 14. Planleggingshjernen |
| Forslagstype | Teknisk term: `SuggestionType` · Definisjon & bruk: NEW_TASK, ARCHIVE_TASK, RE_PRIORITIZE, CHANGE_CUE, ADJUST_GOAL, ADD_CLUB_TARGET — styrer payload-tolkning. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:330 · 14. Planleggingshjernen |
| Friskhet / Skarphet | Bokmål: friskhet / skarphet · Notater: «freshness» / «sharpness» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:760 · B3X-C. Tidsperioder & sammenligning |
| Front 9 / Back 9 | Bokmål: ut 9 / front 9 · inn 9 / back 9 · Notater: begge OK | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:774 · B3X-D. Spesielle metrics |
| Full swing | Bokmål: fulle slag · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:515 · B2C. SLAG — slag-spesifikke kategorier |
| Fullført | Bokmål: ✓ fullført · Badge-stil: grønn checkmark | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:892 · Status på økter |
| FYS | Navn: Fysisk · Dekker: Styrke, kondisjon, mobilitet, hurtighet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:43 · Pyramiden |
| FYS | Navn: Fysisk · Dekker: Styrke, kondisjon, mobilitet, hurtighet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:24 · 1. Pyramiden — de fem treningsområdene |
| FYS | Lys flate (`--pyr-*` i globals.css): `#005840` (forest) · Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts): `#56C59A` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:26 · Pyramiden — TO fargesett (velg etter flate) |
| FYS-muskelgruppe | Teknisk term: `FYS_MUSKELGRUPPER` · Definisjon & bruk: 9 muskelgrupper med golfrelevans (flervalg via `muskelgrupper`): Hoftefleksorer (`HOFTEFLEKSORER`, hofterotasjon i nedsving) · Gluteus (`GLUTEUS`, kraft/stabilitet) · Core (`CORE`, rotasjonsstabilitet/X-faktor) · Skuldre (`SKULDRE`, armplan) · Thorax (`THORAX`, brystrotasjon/holdning) · Hamstrings (`HAMSTRINGS`, benstabilitet) · Underarmer (`UNDERARMER`, grep/håndledd) · Rygg (`RYGG`, holdning/rotasjon) · Quadriceps (`QUADRICEPS`, benstyrke/balanse). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:191 · 7. FYS — fysiske underkategorier |
| FYS-parametersett | Teknisk term: `FysParameters` · Definisjon & bruk: Feltene en FYS-drill logger (fysType, muskelgrupper, sone, reps, sett, kg, tid). Valideres automatisk (Zod) i `parametersJson`. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:54 · 1. Pyramiden |
| FYS-parametersett | Teknisk term: `FysParameterSett` · Definisjon & bruk: Bool-sett per treningstype: hvilke felter (reps/sets/kg/tid/sone/type) som er relevante. Styrer live-økt og plan-bygger. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:190 · 7. FYS — fysiske underkategorier |
| FYS-treningstype | Teknisk term: `FYS_TRENINGSTYPER` · Definisjon & bruk: Fem typer, hver med eget parametersett (velges via `fysType`; styrer input-feltene i UI). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:184 · 7. FYS — fysiske underkategorier |
| Fysisk | Teknisk term: `FYS` · Definisjon & bruk: Styrke, kondisjon, bevegelighet. Eneste område med drillmodus FYS (reps/sett/kg/tid/sone). Tyngst i grunn-/ferieperioder (FERIE ≥ 40 % FYS). Farge `pyr-fys`. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:48 · 1. Pyramiden |
| G | Snittscore: 80–85 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:29 · Spillerkategorier |
| G | Snittscore: 80–85 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:213 · 8. Spillerkategori — hvor spilleren er |
| Gameplan | Teknisk term: `/portal/gameplan`, `GameplanHull`, `GameplanSone` · Definisjon & bruk: F{initialer}-runden-flaten: banebibliotek → banekart → hull-detalj med spillerens dispersjonsellipse, sikte og bra/aldri-soner. Het «Baneguide» frem til 16.07.2026. UI-navnet i dag. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:404 · 16. Andre sentrale begreper |
| Gamle Fredrikstad Golfklubb | Forkortelse: GFGK · Lokasjon: Fredrikstad | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:163 · 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22) |
| Genererer... | Bokmål: Genererer... · Notater: progress-indicator | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1017 · B16. AI & coach-hjelpere |
| GFGK Bredde |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:199 · Grupper og programmer |
| GFGK Bredde |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:230 · 9. Grupper og programmer |
| GFGK Elite |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:201 · Grupper og programmer |
| GFGK Elite |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:232 · 9. Grupper og programmer |
| GFGK Jenter |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:200 · Grupper og programmer |
| GFGK Jenter |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:231 · 9. Grupper og programmer |
| GFGK Mini |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:198 · Grupper og programmer |
| GFGK Mini |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:229 · 9. Grupper og programmer |
| Goal | Bruk i stedet: mål | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1079 · B24. Forbudt-liste |
| GOLF-parametersett | Teknisk term: `GolfParameters` · Definisjon & bruk: Feltene en golf-drill logger: treningsområde, L-fase, P-posisjoner, miljø. Lagres i `parametersJson`. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:55 · 1. Pyramiden |
| Gratis / Pro | Bokmål: Gratis / Pro · Notater: aldri «Premium»/«Plus» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1000 · B15. Tier & abonnement |
| Green hits | Bokmål: green-treff · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:674 · B3E. Approach-statistikk (SG-APP data) |
| Greenlesning | Bokmål: greenlesning · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:702 · B3G. Putting-statistikk (SG-PUTT data) |
| Greens in regulation | Bokmål: greens i regulering · Notater: norsk form; GIR / GIR-% | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:673 · B3E. Approach-statistikk (SG-APP data) |
| Grep | Bokmål: grep · Notater: hånd på køllen | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:483 · B2B. TEK — tekniske underkategorier |
| Grunnperiode | Teknisk term: `GRUNN` · Definisjon & bruk: Fysisk basis + tekniske grunnferdigheter. CS-tak 70 %. FYS 25–40 %, TEK 25–40 %. L_KROPP/L_ARM/L_KOLLE. 420–720 min/uke. Min. 2 hviledager. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:219 · 9. Periodisering |
| GRUNNPERIODE | Typisk innhold (veiledende): Fundament, fysisk og teknisk byggearbeid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:132 · Periodisering |
| GRUNNPERIODE | Typisk innhold (veiledende, ikke krav): Fundament, fysisk og teknisk byggearbeid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:137 · 4. Periodisering — årets rytme |
| Gruppeøkt | Merknad: Fellesøkt, coach eier | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:188 · Blokk-typer i kalenderen |
| Gruppeøkt | Merknad: Fellesøkt, coach eier | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:193 · 7. Blokk-typer i kalenderen |
| H | Snittscore: 85–90 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:30 · Spillerkategorier |
| H | Snittscore: 85–90 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:214 · 8. Spillerkategori — hvor spilleren er |
| Hands ahead | Bokmål: shaft lean · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:506 · B2B. TEK — tekniske underkategorier |
| HCP | Bokmål: HCP · Notater: aldri «handicap» i UI-labels (ok i løpende tekst) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:928 · B8. HCP & score-termer |
| HCP | Visning: fortegn på pluss-hcp; ekte minus-tegn (−) · Eksempel: `+3,5` · `−2,1` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:68 · 2. Tall, enheter og formatering |
| HCP / handicap | Teknisk term: `hcp` · Definisjon & bruk: Spillerens offisielle handicap. Grunnlag for HCP-forventet SG, krise-diagnose og nivå-differensiering. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:396 · 16. Andre sentrale begreper |
| HCP-fortegn (pluss-/minus-prefix) | Bokmål: `+3,5` / `−3,5` · Eksempel: pluss alltid med; minus-tegn (−), ikke bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1069 · B23. Tall, dato, tid — formatering |
| HCP-forventet SG | Teknisk term: `forventetSg()` · Definisjon & bruk: Forventet SG per kategori for gitt handicap (Broadie-avledet tabell; HCP 0→0, HCP 36→ca −16 APP). Grunnlag for krise-diagnose. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:244 · 10. Strokes Gained (SG) og benchmarks |
| HCP-utvikling / HCP-mål | Bokmål: HCP-utvikling / HCP-mål · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:929 · B8. HCP & score-termer |
| Heatmap / Varmekart | Bokmål: heatmap / varmekart · Notater: begge OK | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:739 · B3X-B. Statistikk-uttrykk |
| Heatmap-grid / Radar-chart / Edderkopp-chart / Område-chart | Bokmål: heatmap-grid / radar-chart … · Notater: bindestrek; område-chart = «area chart» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:785 · B3X-E. Visualiserings-uttrykk |
| HELDAGSSAMLING | Typisk innhold (veiledende): Samling (heldagsformat) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:139 · Periodisering |
| HELDAGSSAMLING | Typisk innhold (veiledende, ikke krav): Samling (heldagsformat) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:144 · 4. Periodisering — årets rytme |
| Helse | Merknad: Helse/restitusjon | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:187 · Blokk-typer i kalenderen |
| Helse | Merknad: Helse/restitusjon | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:192 · 7. Blokk-typer i kalenderen |
| Helse / Skade / Symptom / Smerte | Bokmål: helse / skade / symptom / smerte · Notater: flertall: symptomer; smerteskala 1–10 | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1025 · B17. Helse & skader |
| High ball | Bokmål: høyt slag · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:543 · B2C. SLAG — slag-spesifikke kategorier |
| Hip rotation | Bokmål: hofterotasjon · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:488 · B2B. TEK — tekniske underkategorier |
| Hip-shoulder separation | Bokmål: hofte-skulder-separasjon · Notater: bindestreker | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:490 · B2B. TEK — tekniske underkategorier |
| Histogram / Boxplot | Bokmål: histogram / boksplot · Notater: boksplot norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:740 · B3X-B. Statistikk-uttrykk |
| Hofte-mobilitet | Bokmål: hofte-mobilitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:443 · B2A. FYS — fysiske underkategorier |
| Hofterotasjon | Bokmål: hofterotasjon · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:455 · B2A. FYS — fysiske underkategorier |
| Hole-in-one | Bokmål: hole-in-one · Notater: bindestreker | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:718 · B3X-A. Score-statistikk |
| Holed-from-X / Holed-out | Bokmål: hullet fra X / hullet ut · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:771 · B3X-D. Spesielle metrics |
| Hook | Bokmål: hook · Notater: over-draw | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:540 · B2C. SLAG — slag-spesifikke kategorier |
| Hoppet over | Bokmål: hoppet over · Badge-stil: grå | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:893 · Status på økter |
| Hovedbane / Korthullsbane | Bokmål: hovedbane / korthullsbane · Notater: ett ord; korthullsbane = «pitch and putt» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:832 · Områder (på driving range / golfbane) |
| Hovedcoach | Bokmål: hovedcoach · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:420 · B1. Roller |
| Hull | Bokmål: hull · Notater: flertall: hull; «9 hull / 18 hull» med mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:933 · B8. HCP & score-termer |
| Hvile / Rest-timer | Bokmål: hvile / rest-timer · Notater: mellom sett; bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:816 · B5. Trening — økter & drills |
| Hviledager | Teknisk term: `minHviledager` · Definisjon & bruk: Minste hviledager/uke (GRUNN/TURNERING 2; SPESIALISERING 1). | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:316 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Hvorfor? / Begrunnelse | Bokmål: «Hvorfor?» / begrunnelse · Notater: italic begrunnelse | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1016 · B16. AI & coach-hjelpere |
| Hånd-banen | Bokmål: hand path · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:492 · B2B. TEK — tekniske underkategorier |
| I | Snittscore: 90–95 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:31 · Spillerkategorier |
| I | Snittscore: 90–95 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:215 · 8. Spillerkategori — hvor spilleren er |
| I dag / I går / I morgen | Bokmål: i dag / i går / i morgen · Notater: mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:940 · B9. Kalender & tid |
| I gang | Bokmål: i gang · Badge-stil: lime puls | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:895 · Status på økter |
| Idealfordeling | Teknisk term: `idealFordeling` / `disciplinFordeling` · Definisjon & bruk: Planlagt fordeling over fem områder (sum 1,0); måles i `vurderPyramide()`. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:336 · 14. Planleggingshjernen |
| Impact | Bokmål: impact · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:508 · B2B. TEK — tekniske underkategorier |
| INNEND{initialer}S | Navn: Innendørs | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:103 · AK-formelen |
| INNEND{initialer}S | Navn: Innendørs | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:93 · 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1) |
| Innendørs / Utendørs | Bokmål: innendørs / utendørs · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:835 · Områder (på driving range / golfbane) |
| Innsiktskategori | Teknisk term: `InsightCategory` · Definisjon & bruk: DISTANCE_GAPPING, CONSISTENCY_LEAK, TRAINING_GAP, D_PLANE_DRIFT, STRIKE_QUALITY, FATIGUE_PATTERN, EQUIPMENT_FIT, TEMPO_VARIANCE, PROGRESSION_TREND, SAME_DISTANCE_OPPORTUNITY (jf. §12). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:379 · 15. Datamodell & status-enums |
| Innsiktsmotor | Teknisk term: `insight-engine` · Definisjon & bruk: Kjører alle evaluatorene og produserer rangerte innsikter med severity. Driver «hva sier dataene mine». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:299 · 12. TrackMan-analyser og innsikt |
| Innspill 0–50 m | Teknisk term: `INN50` · Definisjon & bruk: Nærspill-innspill. SG-kategori `KORT_SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:117 · 4. Treningsområder |
| Innspill 150–200 m / 100–150 m / 50–100 m | Teknisk term: `INN200` `INN150` `INN100` · Definisjon & bruk: Innspill etter avstand (meter i dagens kode; yards i intelligence-taksonomien). SG-kategori `TILNAERMING`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:116 · 4. Treningsområder |
| INNSPILL_100 | Navn: Innspill ~100 m | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:60 · Treningsområder |
| INNSPILL_100 | Navn: Innspill ~100 m · Familie: Fullsving · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:43 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| INNSPILL_150 | Navn: Innspill ~150 m | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:61 · Treningsområder |
| INNSPILL_150 | Navn: Innspill ~150 m · Familie: Fullsving · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:42 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| INNSPILL_200 | Navn: Innspill ~200 m | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:62 · Treningsområder |
| INNSPILL_200 | Navn: Innspill ~200 m · Familie: Fullsving · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:41 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| INNSPILL_50 | Navn: Innspill ~50 m | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:59 · Treningsområder |
| INNSPILL_50 | Navn: Innspill ~50 m · Familie: Fullsving · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:44 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Innspill-avstander | Visning: meter i dagens kode; yards i intelligence-taksonomien · Eksempel: `100–150 m` / `Innspill 150y` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:70 · 2. Tall, enheter og formatering |
| Innspill-buckets | Bokmål: 50–100 · 100–125 · 125–150 · 150–175 · 175–200 · 200+ m innspill · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:644 · B3C. SG per distanse / situasjon |
| Internal / External cue | Bokmål: indre fokus / ytre fokus · Notater: norsk form; «cue-ord» = swing-tanke; «tanke-spor»; «mental cue» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:852 · Trenings-modus & metoder |
| Intervall | Bokmål: intervall · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:441 · B2A. FYS — fysiske underkategorier |
| Invariant | Teknisk term: — · Definisjon & bruk: Regel som må holde for gyldig plan/økt; brudd gir advarsel, auto-generering unngår. Sjekkes av `validerPeriodBlock()` / `validateSessionConstraints()`. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:311 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Iron 7 / Jern 7 | Bokmål: jern 7 · Notater: eller «I7» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:973 · B12. Kølle-typer |
| Iron-spill / Jern-spill | Bokmål: jern-slag · Notater: norsk form med bindestrek; «Iron-spill» er engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:517 · B2C. SLAG — slag-spesifikke kategorier |
| J | Snittscore: 95–100 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:32 · Spillerkategorier |
| J | Snittscore: 95–100 | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:216 · 8. Spillerkategori — hvor spilleren er |
| K | Snittscore: 100+ | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:33 · Spillerkategorier |
| K | Snittscore: 100+ | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:217 · 8. Spillerkategori — hvor spilleren er |
| Kalender / Dag / Uke / Måned / Sesong | Bokmål: kalender / dag / uke / måned / sesong · Notater: «uke 21» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:939 · B9. Kalender & tid |
| Kategori-benchmark | Bokmål: kategori-benchmark · Notater: A1/A2/B1/B2 | OVERSTYRT – dagens kategori er A–K, A best, brutto snittscore | S3:629 · B3B. SG-benchmark & sammenligning |
| Kinematisk kjede | Bokmål: kinematisk kjede · Notater: «kinetic chain» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:468 · B2B. TEK — tekniske underkategorier |
| Klar / Ikke klar | Bokmål: klar / ikke klar · Notater: «Klar til start» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1037 · B18. Tilstander & feedback-ord |
| Klokken | Bokmål: kl. · Notater: «kl. 09:00»; tid alltid 24h «09:00» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:945 · B9. Kalender & tid |
| Klubbflate | Bokmål: kølleblad · Notater: «face angle» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:494 · B2B. TEK — tekniske underkategorier |
| Klubbhastighet | Bokmål: køllehastighet · Notater: ett ord, mph eller m/s | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:493 · B2B. TEK — tekniske underkategorier |
| Klubbhus / Locker-rom / Pro-shop | Bokmål: klubbhus / locker-rom / pro-shop · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:837 · Områder (på driving range / golfbane) |
| Komparativ/Konkurranse (K) | Teknisk term: `KONKURRANSE` · Definisjon & bruk: Scorer mot krav under press. Øker mot turnering/evaluering. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:205 · 8. Praksistyper |
| Kondisjon | Teknisk term: `KONDISJON` · Definisjon & bruk: Utholdenhet. Felter: tid, sone, aktivitet. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:187 · 7. FYS — fysiske underkategorier |
| Kondisjon | Bokmål: kondisjon · Notater: utholdenhet | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:439 · B2A. FYS — fysiske underkategorier |
| KONDISJON | Navn: Kondisjon (fysisk) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:74 · Treningsområder |
| KONDISJON | Navn: Kondisjon · Familie: FYS · Enhet: — · Hva en rep er: Segmenter (f.eks. «5 drag á 4 min i sone 4», ikke ett varighetstall) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:56 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Kondisjonsaktivitet | Teknisk term: `KONDISJON_AKTIVITETER` · Definisjon & bruk: Treningsform: GANGE, LØPING, SYKKEL, ROING, SVØMMING, SKIERG, INTERVALL, ANNET. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:194 · 7. FYS — fysiske underkategorier |
| Kondisjonssone | Teknisk term: `KONDISJON_SONER` · Definisjon & bruk: Fem HR-/RPE-soner: Sone 1 Restitusjon (`SONE_1`, HR 50–60 %, RPE 1–2) · Sone 2 Aerob base (`SONE_2`, 60–70 %, 3–4) · Sone 3 Terskel (`SONE_3`, 70–80 %, 5–6) · Sone 4 VO2max (`SONE_4`, 80–90 %, 7–8) · Sone 5 Anaerob (`SONE_5`, 90–100 %, 9–10). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:192 · 7. FYS — fysiske underkategorier |
| KONKURRANSE | Navn: Konkurranse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:106 · AK-formelen |
| KONKURRANSE | Navn: Konkurranse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:114 · AK-formelen |
| KONKURRANSE | Typisk fokus (veiledende): Turneringsspill | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:152 · Treningsblokk-merker |
| KONKURRANSE | Navn: Konkurranse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:96 · 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1) |
| KONKURRANSE | Navn: Konkurranse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:104 · 3.3 Press (hvem som ser på) |
| KONKURRANSE | Typisk fokus (veiledende): Turneringsspill | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:161 · 5. Treningsblokk-merker (nye 20.08.2026) |
| Konkurranse-simulering | Bokmål: konkurranse-simulering · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:574 · B2D. SPILL — spillsimuleringskategorier |
| Konsentrasjon | Bokmål: konsentrasjon · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:596 · B2E. TURN — turnerings-spesifikke kategorier |
| Konsistens | Bokmål: konsistens · Notater: «konsistens-score» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:747 · B3X-B. Statistikk-uttrykk |
| Konsistens / Variasjon / Median / Persentil | Bokmål: konsistens / variasjon / median / persentil · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:957 · B10. Statistikk-termer |
| Konsistens-lekkasje | Teknisk term: `evaluateConsistencyLeak` / `CONSISTENCY_LEAK` · Definisjon & bruk: Høy spredning i smash (σ > 0,05) eller distanse per kølle. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:288 · 12. TrackMan-analyser og innsikt |
| Konsistens-score | Bokmål: konsistens-score · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:648 · B3C. SG per distanse / situasjon |
| Kontakt / Treff-punkt | Bokmål: balltreff · Notater: «Konsistent kontakt» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:473 · B2B. TEK — tekniske underkategorier |
| Koordinasjon | Bokmål: koordinasjon · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:449 · B2A. FYS — fysiske underkategorier |
| Korrelasjon / Regresjon | Bokmål: korrelasjon / regresjon · Notater: regresjon også «tilbakegang» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:745 · B3X-B. Statistikk-uttrykk |
| Kort spill / kortspill | Bruk i stedet: nærspill (kode-enum `KORT_SPILL` beholdes) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1096 · B24. Forbudt-liste |
| Kort-putt | Bokmål: kort-putt · Notater: bindestrek, 0–3 ft | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:529 · B2C. SLAG — slag-spesifikke kategorier |
| KPI-/tabulære tall | Visning: JetBrains Mono (`font-mono`) · Eksempel: alle store tall og eyebrows | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:78 · 2. Tall, enheter og formatering |
| Krise / kriseområde | Teknisk term: `erIKrise()` / `KriseSjekk` · Definisjon & bruk: Faktisk SG ≥ 1,0 slag svakere enn HCP-forventet i et område. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:245 · 10. Strokes Gained (SG) og benchmarks |
| Kølle-metrikk-trend | Teknisk term: `ClubMetricTrend` · Definisjon & bruk: Ukentlige snitt per kølle (avgClubPath, avgFaceAngle, avgSmash, avgTotal, sigmaBall, shotCount). Nøkkel (userId, club, weekStart). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:295 · 12. TrackMan-analyser og innsikt |
| Kølle-mål-status | Teknisk term: `ClubTargetStatus` · Definisjon & bruk: OPPNAADD, PAA_VEI_KT, IKKE_BEGYNT. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:387 · 15. Datamodell & status-enums |
| Kølle-trend-aggregator | Teknisk term: `runClubTrends()` / `aggregateClubTrendsForUser()` · Definisjon & bruk: Ukentlig cron (man 03:00 UTC) → snitt per spiller/kølle/uke i `ClubMetricTrend`. Krever ≥ 3 slag/kølle/uke (`MIN_SHOTS_PER_WEEK`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:294 · 12. TrackMan-analyser og innsikt |
| Køllehastighet | Bokmål: køllehastighet · Notater: «club speed», norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:661 · B3D. Driving-statistikk (SG-OTT data) |
| L-Arm | Teknisk term: `L_ARM` · Definisjon & bruk (canon v3.5): Armer uten kølle — arm-/håndposisjon, grep. CS20–50 · M1–M2 · TEK 50–70 % · minimal ball. Utstyr: alignment-sticks, impact-bag. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:70 · 2. L-faser (læringsfaser) |
| L-Auto | Teknisk term: `L_AUTO` · Definisjon & bruk (canon v3.5): Automatikk + miljø + variasjon — overføring til bane/press/random. CS80–100 · M4–M5 · TEK 20–40 %. Eneste fase i TURNERING; 100 % i EVALUERING. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:73 · 2. L-faser (læringsfaser) |
| L-Ball | Teknisk term: `L_BALL` · Definisjon & bruk (canon v3.5): Ball + økende hastighet — konsistens og kontakt. CS60–80 · M3–M4 · TEK 30–50 %. SG relevant, fortsatt teknikk-fokus. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:72 · 2. L-faser (læringsfaser) |
| L-fase | Teknisk term: `LFase` / `L_FASER` · Definisjon & bruk (canon v3.5): Fem trinn: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO. Styrer CS-intervall, miljø og TEK-andel; begrenses per periode via `lFaserTillatt`. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:68 · 2. L-faser (læringsfaser) |
| L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Erstattet av: Motorikk (3 steg) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S1:121 · AK-formelen |
| L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Erstattet av: Motorikk (3 steg, §3.1) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S2:123 · 3.5 Utgått — skal ALDRI brukes i noe nytt |
| L-Kropp | Teknisk term: `L_KROPP` · Definisjon & bruk (canon v3.5): Kun kropp — rotasjon, vektoverføring, ryggradsposisjon. CS20–40 · M0–M1 · TEK 60–80 % · ingen ball. Utstyr: speil, alignment-sticks. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:69 · 2. L-faser (læringsfaser) |
| L-Kølle | Teknisk term: `L_KOLLE` · Definisjon & bruk (canon v3.5): Med kølle, uten ball — kølle-følelse, path, face control. CS50–70 · M2–M3 · TEK 40–60 %. Kode-id uten ø. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:71 · 2. L-faser (læringsfaser) |
| Lag | Bokmål: lag · Notater: «Bevare lag» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:504 · B2B. TEK — tekniske underkategorier |
| Lag-putt | Bokmål: lag-putt · Notater: «speed putting» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:532 · B2C. SLAG — slag-spesifikke kategorier |
| Lag-putt-snitt | Bokmål: lag-putt-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:704 · B3G. Putting-statistikk (SG-PUTT data) |
| Lagre / Ferdig | Tekst: Lagre / Ferdig · Stil: primary lime | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:112 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Land Angle | Teknisk term: `landAngle` · Definisjon & bruk: Nedslagsvinkel (grader) — stopp-evne på green. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:265 · 11. TrackMan-parametere |
| Landing Angle | Aldri: landingsvinkel | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:61 · De vanligste |
| Lang jern / Mellomjern / Kort jern | Bokmål: lang-jern / midtjern / kort-jern · Notater: bindestrek (midtjern ett ord) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:975 · B12. Kølle-typer |
| Lang-putt | Bokmål: lang-putt · Notater: 6 ft+ | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:531 · B2C. SLAG — slag-spesifikke kategorier |
| Last 5 / 10 / 30 days / 90 days | Bokmål: siste 5 / siste 10 / siste 30 dager / siste 90 dager · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:753 · B3X-C. Tidsperioder & sammenligning |
| Launch angle | Bokmål: launch-vinkel · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:663 · B3D. Driving-statistikk (SG-OTT data) |
| Launch Angle | Teknisk term: `launchAngle` · Definisjon & bruk: Utgangsvinkel (grader). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:259 · 11. TrackMan-parametere |
| Launch Angle | Aldri: utgangsvinkel | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:56 · De vanligste |
| LAV_HAST | Navn: Lav hastighet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:96 · AK-formelen |
| LAV_HAST | Navn: Lav hastighet | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:82 · 3.1 Motorikk (læringssteg — gjelder KUN fullsving) |
| Lavest / Høyest score | Bokmål: lavest score / høyest score · Notater: aldri «min»/«max» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:716 · B3X-A. Score-statistikk |
| Lavpunkt | Bokmål: lowpoint · Notater: «bottom of arc» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:474 · B2B. TEK — tekniske underkategorier |
| Layup | Bokmål: layup · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:558 · B2D. SPILL — spillsimuleringskategorier |
| Lead arm | Bokmål: lead arm · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:503 · B2B. TEK — tekniske underkategorier |
| Lead protection | Bokmål: beskytte ledelse · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:592 · B2E. TURN — turnerings-spesifikke kategorier |
| Leder | Bokmål: leder · Notater: enkel form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:921 · B7. Turneringer |
| LIFE-koder | Teknisk term: `LIFE_KODER` · Definisjon & bruk: Fem livsferdigheter: Resiliens, Fokus, Selvtillit, Kommunikasjon, Eget ansvar. Knyttes til drills (særlig TURN). | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:400 · 16. Andre sentrale begreper |
| Linje-kontroll / Lese green / Green-lesing | Bokmål: greenlesning · Notater: «green reading» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:534 · B2C. SLAG — slag-spesifikke kategorier |
| Linjegraf / Søylediagram / Stolpediagram | Bokmål: linjegraf / søylediagram / stolpediagram · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:781 · B3X-E. Visualiserings-uttrykk |
| Live | Bokmål: LIVE · Badge-stil: rød puls | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:896 · Status på økter |
| Live økt | Bokmål: live økt · Notater: mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:812 · B5. Trening — økter & drills |
| Loading... | Bruk i stedet: Laster... | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1088 · B24. Forbudt-liste |
| Lob | Teknisk term: `LOB` · Definisjon & bruk: Høyt slag med rask stopp. SG-kategori `KORT_SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:120 · 4. Treningsområder |
| LOB | Navn: Lob | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:65 · Treningsområder |
| LOB | Navn: Lob · Familie: Nærspill · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:47 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Loft | Bokmål: loft · Notater: køllens loft | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:498 · B2B. TEK — tekniske underkategorier |
| Logg | Tekst: Logg ny økt · Stil: aldri «log new» | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S4:118 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Low ball | Bokmål: lavt slag · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:544 · B2C. SLAG — slag-spesifikke kategorier |
| Low Point | Aldri: lavpunkt | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:62 · De vanligste |
| M0 — Kontrollert, uten ball | Teknisk term: `M0` · Definisjon & bruk: Kontrollert range/rom, ingen mål, ingen ball. Hjemmet til L_KROPP. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:144 · 5. Miljø (M) og Press (PR) |
| M0–M5 | Erstattet av: Belastning | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S1:123 · AK-formelen |
| M0–M5 | Erstattet av: Belastning (§3.2) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S2:125 · 3.5 Utgått — skal ALDRI brukes i noe nytt |
| M1 — Kontrollert, enkelt mål | Teknisk term: `M1` · Definisjon & bruk: Kontrollert range med ett enkelt mål. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:145 · 5. Miljø (M) og Press (PR) |
| M2 — Range med mål og distanser | Teknisk term: `M2` · Definisjon & bruk: Driving range med definerte mål og distanser. Default for auto-genererte økter. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:146 · 5. Miljø (M) og Press (PR) |
| M3 — Baneøving uten konkurranse | Teknisk term: `M3` · Definisjon & bruk: Greenside, treningsgreen, bane uten konkurranse. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:147 · 5. Miljø (M) og Press (PR) |
| M4 — Bane med scoringsfokus | Teknisk term: `M4` · Definisjon & bruk: Simulert konkurranse på bane. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:148 · 5. Miljø (M) og Press (PR) |
| M5 — Turneringsforhold | Teknisk term: `M5` · Definisjon & bruk: Faktiske turneringsforhold. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:149 · 5. Miljø (M) og Press (PR) |
| Mac O'Grady-fasene | Bokmål: Mac O'Grady-fasene · Notater: apostrof beholdes. Seks faser: grunntrening (base) · oppbygging (build) · spesialisering (specific) · konkurranse (peak) · overgang (transition) · hvile (recovery). Skjema-enum uppercase: GRUNNTRENING/OPPBYGGING/SPESIALISERING/KONKURRANSE/OVERGANG/HVILE. NB: eget vokabular — ikke det samme som `PeriodeType` i §9 | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:801 · B4. Treningsplanlegging — periodisering |
| Make rate | Bokmål: innslagsprosent · Notater: norsk form. Avstander i FOT: «innslagsprosent 3 ft» osv. (gamle meter-varianter 1/2/3/5/10 m fases ut per putting-i-ft-regelen) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:700 · B3G. Putting-statistikk (SG-PUTT data) |
| Maks-styrke | Bokmål: maks-styrke · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:434 · B2A. FYS — fysiske underkategorier |
| Mandal Golfklubb | Forkortelse: Mandal GK · Lokasjon: Mandal | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:165 · 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22) |
| Match-spill / Match play | Bokmål: match-spill · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:566 · B2D. SPILL — spillsimuleringskategorier |
| Median / Modus | Bokmål: median / modus · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:733 · B3X-B. Statistikk-uttrykk |
| Melding / Tråd | Bokmål: melding / tråd · Notater: flertall: meldinger; meldingstråd | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:987 · B14. Notifikasjoner & feedback |
| Mental forberedelse | Bokmål: mental forberedelse · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:581 · B2E. TURN — turnerings-spesifikke kategorier |
| Mental praksis / Dry swing / Slow motion | Bokmål: mental praksis / dry swing / slow motion · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:847 · Trenings-modus & metoder |
| Mental ro | Bokmål: mental ro · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:594 · B2E. TURN — turnerings-spesifikke kategorier |
| Mentaltrening | Bokmål: mentaltrening · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:600 · B2E. TURN — turnerings-spesifikke kategorier |
| Metrikk-retning | Teknisk term: `direction` (`higher`/`lower`/`lower-abs`) · Definisjon & bruk: Hva som er «bedre» per metrikk (clubPath = `lower-abs`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:298 · 12. TrackMan-analyser og innsikt |
| Mid-putt | Bokmål: mid-putt · Notater: 3–6 ft | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:530 · B2C. SLAG — slag-spesifikke kategorier |
| Milepæl | Bokmål: milepæl · Notater: flertall: milepæler | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:908 · B6. Mål & måltyper |
| Miljø-kode | Teknisk term: `M_MILJO` / `MMiljo` · Definisjon & bruk: 6-trinns skala M0–M5, settes på øktnivå (`miljo`). Auto-genererte økter får M2. AK-formel-akse. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:143 · 5. Miljø (M) og Press (PR) |
| Min / Maks | Bokmål: minste / største · Notater: aldri «min»/«max» som forkortelse | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:736 · B3X-B. Statistikk-uttrykk |
| Mirror practice | Bokmål: speil-praksis · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:849 · Trenings-modus & metoder |
| Missed green left/right/short/long | Bokmål: bom venstre / bom høyre / bom kort / bom langt · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:679 · B3E. Approach-statistikk (SG-APP data) |
| Mitt hovedmål | Bokmål: mitt hovedmål · Notater: lime stjerne | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:915 · B7. Turneringer |
| Mobilitet | Teknisk term: `MOBILITET` · Definisjon & bruk: Leddbevegelighet under kontroll. Felter: reps, sett, tid. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:188 · 7. FYS — fysiske underkategorier |
| Mobilitet | Bokmål: mobilitet · Notater: bevegelighet | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:442 · B2A. FYS — fysiske underkategorier |
| Moderat / Lav / Høy | Bokmål: moderat / lav / høy · Notater: gul / gul-rød | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1035 · B18. Tilstander & feedback-ord |
| MORAD-halvtrinn | Teknisk term: `P4.5` `P5.5` `P6.5` `P7.5` · Definisjon & bruk: Halvposisjoner fra MORAD-metodikken (Transition, Shaft parallell DS, Shaft parallell FT, Arm over skulder). Konsept-termer — finnes IKKE i kodens posisjonssett i dag. | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:176 · 6. P-systemet (svingposisjoner) |
| Mulligan Indoor | Forkortelse: — · Lokasjon: Innendørs simulator-fasilitet (AK Golf) | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:167 · 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22) |
| Mulligan Indoor Golf | Galt: Mulligan Golf, Mulligan Simulator | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:102 · Navn og skrivemåte |
| MVA | Bokmål: MVA · Notater: 25 % | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1007 · B15. Tier & abonnement |
| Mål | Bokmål: mål · Notater: «70 %», «10 reps» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:820 · B5. Trening — økter & drills |
| Mål | Bokmål: mål · Notater: aldri «goal» i UI; «aktivt mål», flertall: aktive mål | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:902 · B6. Mål & måltyper |
| Mål-CS per kategori | Teknisk term: `csTargetByKategori` · Definisjon & bruk: JSON-kart NGF-kategori (A–L) → mål-CS i plan-maler. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:359 · 15. Datamodell & status-enums |
| Mål-fremdrift / Mål-progresjon | Bokmål: mål-fremdrift / mål-progresjon · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:906 · B6. Mål & måltyper |
| Målkategori | Teknisk term: `GoalCategory` · Definisjon & bruk: OUTCOME (resultatmål) vs PROCESS (prosessmål) — vises hver for seg i Workbench. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:358 · 15. Datamodell & status-enums |
| Måneder | Bokmål: januar … desember · Notater: lowercase; kort: Jan, Feb, Mar, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Des | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:944 · B9. Kalender & tid |
| Neste / Forrige | Tekst: Neste → / ← Forrige · Stil: primary / outline | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:116 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Net / Gross score | Bokmål: netto-score / brutto-score · Notater: bindestrek. NB golf-data: alltid brutto (se CLAUDE.md) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:725 · B3X-A. Score-statistikk |
| NGF-kategori (eldre kode) | Teknisk term: `NgfKategori` · Definisjon & bruk: Eldre A–L-skala i datamodellen der A = verdenselite — motsatt av canon. `minKategori`/`maxKategori` på øvelser, nøkkel i `csTargetByKategori`. Skal migreres. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:398 · 16. Andre sentrale begreper |
| Nivåer | Bokmål: lav / moderat / medium / høy / maks · Notater: grønn-/gul-/rød-zone | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:862 · Belastning-skala |
| Notion-kobling | Teknisk term: `NotionLinkType` / `NotionSyncMode` · Definisjon & bruk: OPPGAVER/PROSJEKTER · AUTO/MANUELL/PAUSED (workspace-synk). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:389 · 15. Datamodell & status-enums |
| Ny økt | Bokmål: ny økt · Notater: aldri «ny session» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:814 · B5. Trening — økter & drills |
| OBSERVERT | Navn: Observert | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:113 · AK-formelen |
| OBSERVERT | Navn: Observert | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:103 · 3.3 Press (hvem som ser på) |
| Område | Bokmål: område · Notater: hvor drillen utføres | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:817 · B5. Trening — økter & drills |
| On plane | Bokmål: på plan · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:471 · B2B. TEK — tekniske underkategorier |
| Oppgave-kategori | Teknisk term: `TaskKategori` · Definisjon & bruk: TEKNISK, TAKTISK, MENTALT, SOSIALT — eget klassifiseringsfelt på `PositionTask` ved siden av pyramide-aksen (runde 2 · 2026-07-14, Anders: «Begge — legg til som eget felt»). Nullable — aldri en sperre. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:382 · 15. Datamodell & status-enums |
| Oppgrader | Tekst: Oppgrader til Pro · Stil: primary lime | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:123 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Oppgrader / Nedgrader | Bokmål: oppgrader / nedgrader · Notater: «Oppgrader til Pro» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1006 · B15. Tier & abonnement |
| Oppnådd / Avbrutt mål | Bokmål: oppnådd / avbrutt mål · Notater: aldri «abandoned» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:905 · B6. Mål & måltyper |
| Oppvarming | Bokmål: oppvarming · Notater: «Pre-round warmup» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:584 · B2E. TURN — turnerings-spesifikke kategorier |
| Optimal / God | Bokmål: optimal / god · Notater: grønn | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1034 · B18. Tilstander & feedback-ord |
| Other (4+ over) | Bokmål: other · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:721 · B3X-A. Score-statistikk |
| Outlier | Teknisk term: `outlier` · Definisjon & bruk: Ekstremverdi ekskludert fra trender (bool på `TrackManShot`). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:274 · 11. TrackMan-parametere |
| Outlier / Avviker | Bokmål: outlier / avviker · Notater: begge OK | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:744 · B3X-B. Statistikk-uttrykk |
| Overkroppstyrke | Bokmål: overkroppstyrke · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:453 · B2A. FYS — fysiske underkategorier |
| Overload / Under-trent | Bokmål: overload / under-trent · Notater: advarsel-zone / bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:866 · Belastning-skala |
| P-system | Teknisk term: `P_POSISJONER` / `P_POSITIONS` · Definisjon & bruk: Posisjonsnomenklatur P1.0–P10.0. Markerer hvilke posisjoner en teknisk drill jobber med (`pPosisjoner`, lagres som strenger). | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:165 · 6. P-systemet (svingposisjoner) |
| P1 — Adresse | Teknisk term: `P1.0` · Definisjon & bruk: Oppstilling før svingen starter. | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:166 · 6. P-systemet (svingposisjoner) |
| P1.0 | Navn: Address | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:219 · P-posisjoner (MORAD) |
| P10 — Finish | Teknisk term: `P10.0` · Definisjon & bruk: Holder finish-stillingen. MORAD-navn: «Hold finish». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:175 · 6. P-systemet (svingposisjoner) |
| P10.0 | Navn: Finish | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:228 · P-posisjoner (MORAD) |
| P2 — Takeaway | Teknisk term: `P2.0` · Definisjon & bruk: Tidlig tilbakesving, kølle parallell med bakken. | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:167 · 6. P-systemet (svingposisjoner) |
| P2.0 | Navn: Skaft parallelt tilbake | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:220 · P-posisjoner (MORAD) |
| P3 — Halvveis tilbake | Teknisk term: `P3.0` · Definisjon & bruk: Ledende arm parallell med bakken (backswing). MORAD-navn: «Arm parallell (BS)». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:168 · 6. P-systemet (svingposisjoner) |
| P3.0 | Navn: Venstre arm parallell tilbake | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:221 · P-posisjoner (MORAD) |
| P4 — Topp | Teknisk term: `P4.0` · Definisjon & bruk: Toppen av tilbakesvingen. | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:169 · 6. P-systemet (svingposisjoner) |
| P4.0 | Navn: Topp | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:222 · P-posisjoner (MORAD) |
| P5 — Transisjon | Teknisk term: `P5.0` · Definisjon & bruk: Overgang tilbakesving→nedsving. MORAD-navn: «Arm parallell (DS)». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:170 · 6. P-systemet (svingposisjoner) |
| P5.0 | Navn: Venstre arm parallell ned | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:223 · P-posisjoner (MORAD) |
| P6 — Halvveis ned | Teknisk term: `P6.0` · Definisjon & bruk: Kølle parallell i nedsving. MORAD-navn: «Treff». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:171 · 6. P-systemet (svingposisjoner) |
| P6.0 | Navn: Skaft parallelt ned | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:224 · P-posisjoner (MORAD) |
| P7 — Impact | Teknisk term: `P7.0` · Definisjon & bruk: Trefføyeblikket. MORAD-navn: «Arm parallell (FT)». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:172 · 6. P-systemet (svingposisjoner) |
| P7.0 | Navn: Impact | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:225 · P-posisjoner (MORAD) |
| P8 — Tidlig oppfølging | Teknisk term: `P8.0` · Definisjon & bruk: Rett etter treff. MORAD-navn: «Finish». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:173 · 6. P-systemet (svingposisjoner) |
| P8.0 | Navn: Skaft parallelt gjennom | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:226 · P-posisjoner (MORAD) |
| P9 — Kølle parallell etter impact | Teknisk term: `P9.0` · Definisjon & bruk: Oppfølging, kølle parallell. MORAD-navn: «Rebalance». | FAGKONFLIKT – P-posisjoner må leses mot S1 | S3:174 · 6. P-systemet (svingposisjoner) |
| P9.0 | Navn: Høyre arm parallell gjennom | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:227 · P-posisjoner (MORAD) |
| Pace of play | Bokmål: spilletempo · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:590 · B2E. TURN — turnerings-spesifikke kategorier |
| Par / Bogey | Bokmål: par / bogey · Notater: flertall: pars, bogeys | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:719 · B3X-A. Score-statistikk |
| Par / Bogey / Birdie / Eagle | Bokmål: par / bogey / birdie / eagle · Notater: «par 72» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:931 · B8. HCP & score-termer |
| Par-3 bane / 9-hulls bane / 18-hulls bane / Mini-bane | Bokmål: par-3 bane / 9-hulls bane … · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:833 · Områder (på driving range / golfbane) |
| Password | Bruk i stedet: passord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1094 · B24. Forbudt-liste |
| Pausert / Avsluttet | Bokmål: pausert / avsluttet · Notater: aldri «paused» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1039 · B18. Tilstander & feedback-ord |
| Penalty strokes / Lost balls | Bokmål: straffeslag / mistede baller · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:768 · B3X-D. Spesielle metrics |
| Periode / Range | Bokmål: `19—25 mai` / `100—150 m` · Eksempel: tankestrek (—), ikke bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1066 · B23. Tall, dato, tid — formatering |
| Periode pyramide-min/max | Teknisk term: `minPyramide` / `maxPyramide` · Definisjon & bruk: Min-/maks-prosent per område per periode; brudd flagges per økt og uke. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:318 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Periode-constraints | Teknisk term: `PERIODE_CONSTRAINTS` / `PERIODE_TYPER` · Definisjon & bruk: Reglene per periode (pyramide-min/max, L-fordeling, praksis, volum, csMax, hviledager). Håndheves av `validateSessionConstraints` / `validerPeriodBlock`. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:224 · 9. Periodisering |
| Periode-farger | Teknisk term: `PERIODE_FARGER` · Definisjon & bruk: UI-fargekart per periode (GRUNN mørk grønn, FERIE stripe …). Konsistent i lys/mørk. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:226 · 9. Periodisering |
| Periode-type | Teknisk term: `PeriodeType` · Definisjon & bruk: GRUNN, SPESIALISERING, TURNERING, EVALUERING, FERIE. Brukes i `PERIODE_CONSTRAINTS`. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:217 · 9. Periodisering |
| Periodeblokk | Teknisk term: `PeriodBlock` · Definisjon & bruk: Tidsspenn i sesongplanen (`SeasonPlan`) med én L-fase og ukentlige volum-grenser; `weeklyVolMin/Max` valideres mot fasens `maxVolumMin`. Kan ha `TechnicalPlan` og coach-fokus (`focus`). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:225 · 9. Periodisering |
| Perioder/ranges | Visning: tankestrek (—), ikke bindestrek · Eksempel: `19—25 mai` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:77 · 2. Tall, enheter og formatering |
| Periodisering | Teknisk term: — · Definisjon & bruk: Treningsåret i faser; hver periode har CS-tak, volum-tak, tillatte L-faser og pyramide-/praksis-fordeling. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:216 · 9. Periodisering |
| Periodisering / Periode | Bokmål: periodisering / periode · Notater: flertall: perioder; «periode-blokk», «periode-fase» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:800 · B4. Treningsplanlegging — periodisering |
| Periodiseringsfase | Teknisk term: `LPhase` · Definisjon & bruk: Parallelt 3-verdis enum: GRUNN, SPESIAL, TURNERING. På `PeriodBlock`/`PlanTemplate`. Ikke læringsfasen `LFase`! | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:218 · 9. Periodisering |
| Permisjonsgrunn | Teknisk term: `LeaveReason` · Definisjon & bruk: SKADE, SYKDOM, REISE, JOBB, STUDIER, ANNET (på `Leave`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:362 · 15. Datamodell & status-enums |
| Persentil | Bokmål: persentil · Notater: «75. persentil»; «persentil-rang» med bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:635 · B3B. SG-benchmark & sammenligning |
| PGA Tour Top 40-baseline | Teknisk term: `BENCHMARK_OTT/APP/ARG` · Definisjon & bruk: Referanser interpolert fra Mark Broadie, *Every Shot Counts* (2014). Fasit for tee/approach/nærspill. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:241 · 10. Strokes Gained (SG) og benchmarks |
| Pin-seeking | Bokmål: flagg-jaging · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:676 · B3E. Approach-statistikk (SG-APP data) |
| Pitch | Teknisk term: `PITCH` · Definisjon & bruk: Høyere, mykere nærspill. SG-kategori `KORT_SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:119 · 4. Treningsområder |
| Pitch | Bokmål: pitch · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:520 · B2C. SLAG — slag-spesifikke kategorier |
| PITCH | Navn: Pitch | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:64 · Treningsområder |
| PITCH | Navn: Pitch · Familie: Nærspill · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:46 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Plan | Bokmål: plan · Notater: engelsk fagterm (swing plane) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:469 · B2B. TEK — tekniske underkategorier |
| Plan-effektivitet | Teknisk term: `plan-effectiveness` / `PlanEffectiveness` · Definisjon & bruk: Hvor godt en gjennomført plan traff målene (faktisk vs planlagt); knyttes til `TrainingPlan`. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:327 · 14. Planleggingshjernen |
| Plan-forslag | Teknisk term: `PlanSuggestion` · Definisjon & bruk: Ett endringsforslag med begrunnelse/evidens; PENDING → coach ACCEPT/REJECT/EDIT (logges med `decidedById`, `decisionNote`). | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:329 · 14. Planleggingshjernen |
| Plan-justering | Teknisk term: `PlanAdjustmentStatus` · Definisjon & bruk: PENDING, APPROVED, DECLINED. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:368 · 15. Datamodell & status-enums |
| Plan-status | Teknisk term: `PlanStatus` · Definisjon & bruk: DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE → ARCHIVED (REJECTED/PAUSED ved behov). REJECTED bærer `playerComment`. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:345 · 15. Datamodell & status-enums |
| Planlagt | Bokmål: planlagt · Badge-stil: grå/forest | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:889 · Status på økter |
| PLANNED | Navn: Planlagt | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:165 · Turneringer |
| PLANNED | Navn: Planlagt | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:169 · 6. Turneringer |
| Plassering | Bokmål: plassering · Notater: «Ball-plassering» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:559 · B2D. SPILL — spillsimuleringskategorier |
| Plassering | Bokmål: plassering · Notater: «14. plass» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:918 · B7. Turneringer |
| Platform only |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:204 · Grupper og programmer |
| Platform only (selvbetjent, ingen coachrelasjon) |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:235 · 9. Grupper og programmer |
| Pliometrisk | Bokmål: pliometrisk · Notater: trening | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:438 · B2A. FYS — fysiske underkategorier |
| Plugged lie / Buried lie | Bokmål: plugget lie · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:526 · B2C. SLAG — slag-spesifikke kategorier |
| Pluss-score | Bokmål: pluss-score · Notater: over par | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:723 · B3X-A. Score-statistikk |
| Posisjon | Bokmål: posisjon · Notater: «Topp-posisjon» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:479 · B2B. TEK — tekniske underkategorier |
| Posture | Bokmål: positur · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:485 · B2B. TEK — tekniske underkategorier |
| Power | Bokmål: power · Notater: engelsk-norsk akseptert | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:436 · B2A. FYS — fysiske underkategorier |
| PR1 — Minimalt press | Teknisk term: `PR1` · Definisjon & bruk: Ren teknikk-drill, ingen konsekvens. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:151 · 5. Miljø (M) og Press (PR) |
| PR1–PR5 | Erstattet av: Press | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S1:124 · AK-formelen |
| PR1–PR5 | Erstattet av: Press (§3.3) | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S2:126 · 3.5 Utgått — skal ALDRI brukes i noe nytt |
| PR2 — Lett press | Teknisk term: `PR2` · Definisjon & bruk: Mål definert, ingen konkurranse. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:152 · 5. Miljø (M) og Press (PR) |
| PR3 — Moderat press | Teknisk term: `PR3` · Definisjon & bruk: Scoringssystem eller partner involvert. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:153 · 5. Miljø (M) og Press (PR) |
| PR4 — Høyt press | Teknisk term: `PR4` · Definisjon & bruk: Simulert turneringsrunde eller poeng/økonomi på spill. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:154 · 5. Miljø (M) og Press (PR) |
| PR5 — Maksimalt press | Teknisk term: `PR5` · Definisjon & bruk: Faktisk turneringssituasjon. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:155 · 5. Miljø (M) og Press (PR) |
| Praksistype | Teknisk term: `PracticeType` / `PRAKSISTYPER` · Definisjon & bruk: Øktnivå, kortkoder B/R/K/S. `praksisFordeling` per periode angir anbefalt miks. Auto-genererte økter = BLOKK. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:202 · 8. Praksistyper |
| Praksistype | Bokmål: praksistype · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:819 · B5. Trening — økter & drills |
| Pre-round / Post-round | Bokmål: pre-round / post-round · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:585 · B2E. TURN — turnerings-spesifikke kategorier |
| Pre-shot rutine / Post-shot rutine / Tee-off rutine | Bokmål: pre-shot rutine · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:583 · B2E. TURN — turnerings-spesifikke kategorier |
| Press | Bokmål: press · Notater: «under press» (rettet fra tastefeilen «pres») | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:569 · B2D. SPILL — spillsimuleringskategorier |
| Press handling | Bokmål: takle press · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:570 · B2D. SPILL — spillsimuleringskategorier |
| Press-nivå | Teknisk term: `PR_PRESS` / `PressureLevel` / `PRPress` · Definisjon & bruk: 5-trinns skala PR1–PR5, settes på øktnivå sammen med M. Samme skala som `PressureLevel` (Spor A) og `PRPress` (V2). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:150 · 5. Miljø (M) og Press (PR) |
| Pressure-shot | Bokmål: press-slag · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:568 · B2D. SPILL — spillsimuleringskategorier |
| Prioritet | Bokmål: PRIO 1 · MAJOR · NORMAL · LOCAL · Notater: uppercase i pill | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:916 · B7. Turneringer |
| Pris / Faktura / Betaling | Bokmål: pris / faktura / betaling · Notater: «299 kr/mnd» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1003 · B15. Tier & abonnement |
| Progresjons-trend | Teknisk term: `evaluateProgressionTrend` / `PROGRESSION_TREND` · Definisjon & bruk: Positiv innsikt: kølle forbedres over 12 uker (lineær regresjon; ≥ 4 datapunkter; distanse-slope > 0,5, smash-slope > 0,005). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:296 · 12. TrackMan-analyser og innsikt |
| Prosent | Bokmål: `%` med mellomrom · Eksempel: `73 %` (formelt) eller `73%` (kompakt) — VELG ÉN | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1063 · B23. Tall, dato, tid — formatering |
| Prosent | Visning: mellomrom før % (formelt) · Eksempel: `73 %` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:74 · 2. Tall, enheter og formatering |
| Proximity to hole / Avstand fra flagg | Bokmål: nærhet til flagg / avstand fra flagg · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:646 · B3C. SG per distanse / situasjon |
| Punch shot / Knockdown / Stinger | Bokmål: lavt slag · Notater: engelske fagtermer | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:523 · B2C. SLAG — slag-spesifikke kategorier |
| Pust-rutine | Bokmål: pust-rutine · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:595 · B2E. TURN — turnerings-spesifikke kategorier |
| Putt | Bokmål: putt · Notater: enkelt slag | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:528 · B2C. SLAG — slag-spesifikke kategorier |
| Putt 0–3 ft | Teknisk term: `PUTT0_3` · Definisjon & bruk: Korte putter. SG-kategori `PUTTING`. Kode-labels med «m» er feil og rettes. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:122 · 4. Treningsområder |
| Putt 10–20 ft | Teknisk term: `PUTT10_20` · Definisjon & bruk: Lange putter / lag-putt. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:125 · 4. Treningsområder |
| Putt 20–40 ft | Teknisk term: `PUTT20_40` · Definisjon & bruk: Svært lange putter. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:126 · 4. Treningsområder |
| Putt 3–6 ft | Teknisk term: `PUTT3_6` · Definisjon & bruk: Mellomdistanse-putter. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:123 · 4. Treningsområder |
| Putt 40 ft+ | Teknisk term: `PUTT40P` · Definisjon & bruk: Ekstreme lag-putter. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:127 · 4. Treningsområder |
| Putt 6–10 ft | Teknisk term: `PUTT6_10` · Definisjon & bruk: Lengre putter. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:124 · 4. Treningsområder |
| PUTT_0_3 | Navn: Putt 0–3 fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:67 · Treningsområder |
| PUTT_0_3 | Navn: Putt 0–3 fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:49 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| PUTT_10_25 | Navn: Putt 10–25 fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:70 · Treningsområder |
| PUTT_10_25 | Navn: Putt 10–25 fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:52 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| PUTT_25_40 | Navn: Putt 25–40 fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:71 · Treningsområder |
| PUTT_25_40 | Navn: Putt 25–40 fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:53 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| PUTT_3_5 | Navn: Putt 3–5 fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:68 · Treningsområder |
| PUTT_3_5 | Navn: Putt 3–5 fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:50 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| PUTT_40_PLUSS | Navn: Putt 40+ fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:72 · Treningsområder |
| PUTT_40_PLUSS | Navn: Putt 40+ fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:54 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| PUTT_5_10 | Navn: Putt 5–10 fot | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:69 · Treningsområder |
| PUTT_5_10 | Navn: Putt 5–10 fot · Familie: Putt · Enhet: ft · Hva en rep er: Putter | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:51 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Putting | Bokmål: putting · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:527 · B2C. SLAG — slag-spesifikke kategorier |
| Putting green / Practice green / Chipping green | Bokmål: putting green / practice green / chipping green · Notater: mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:827 · Områder (på driving range / golfbane) |
| Putting-avstander | Bokmål: `3–6 ft` · Eksempel: ALLTID fot (ft), aldri meter | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1068 · B23. Tall, dato, tid — formatering |
| Putting-avstander | Visning: **ALLTID fot (ft)** · Eksempel: `Putt 3–6 ft` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:69 · 2. Tall, enheter og formatering |
| Putting-buckets | Bokmål: 0–3 ft · 3–6 ft · 6–10 ft · 10 ft+ putting · Notater: tankestrek. Putting ALLTID i fot (ft), aldri meter | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:643 · B3C. SG per distanse / situasjon |
| Putting-test / Chipping-test | Bokmål: putting-test / chipping-test · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:878 · Tester & måling |
| Putts per runde / per GIR | Bokmål: putts per runde / putts per GIR · Notater: snitt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:697 · B3G. Putting-statistikk (SG-PUTT data) |
| Pyramide | Teknisk term: `PYRAMIDE` / `PyramidArea` · Definisjon & bruk: De fem områdene FYS, TEK, SLAG, SPILL, TURN. Idealfordeling summerer til 1,0; styres av periode-min/max. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:47 · 1. Pyramiden |
| Pyramide-balanse / Pyramide-fordeling | Bokmål: pyramide-balanse / pyramide-fordeling · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:954 · B10. Statistikk-termer |
| Pyramide-fordeling | Teknisk term: `vurderPyramide()` / `PyramidFordeling` · Definisjon & bruk: Faktisk øktfordeling målt mot idealfordeling, med avvik og tekstlig anbefaling. Avvik < 5 pp = «på plan». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:56 · 1. Pyramiden |
| Pyramide-fordeling summerer til 1,0 | Teknisk term: `idealFordeling` · Definisjon & bruk: Idealfordelingen over fem områder må summere til 1,0. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:317 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Påmeldt / Avregistrert / Trukket / Bekreftet | Bokmål: påmeldt / avregistrert / trukket / bekreftet · Notater: aldri «registrert» for påmeldt; trukket = «withdrew» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:917 · B7. Turneringer |
| Random (R) | Teknisk term: `RANDOM` · Definisjon & bruk: Tilfeldig variasjon mellom oppgaver (interleaving). Øktnivå-motstykke til VARIABEL. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:204 · 8. Praksistyper |
| Reise | Merknad: Reisetid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:184 · Blokk-typer i kalenderen |
| Reise | Merknad: Reisetid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:189 · 7. Blokk-typer i kalenderen |
| Rekord / Beste runde | Bokmål: rekord / beste runde · Notater: «personlig rekord» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:956 · B10. Statistikk-termer |
| Release | Bokmål: release · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:505 · B2B. TEK — tekniske underkategorier |
| Rep-hastighet | Teknisk term: `RepHastighet` · Definisjon & bruk: Slag klassifisert LAV eller FULL mot spillerens maks. LAV ≈ CS50–70, FULL ≈ CS80–100. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:273 · 11. TrackMan-parametere |
| Rep-type (volummåling) | Teknisk term: `RepType` · Definisjon & bruk: Hvordan volum logges per drill: SVINGER_UTEN_BALL (antall svinger uten ball), BALLER_SLATT (antall baller slått), TID (minutter), SETT_REPS (sett × reps). Brukes i live-økt-logging. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:208 · 8. Praksistyper |
| Repetisjon / Sett / Reps | Bokmål: repetisjon / sett / reps · Notater: flertall: repetisjoner; sett uendret | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:853 · Trenings-modus & metoder |
| Reset-rutine | Bokmål: reset-rutine · Notater: bindestrek, etter dårlig slag | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:598 · B2E. TURN — turnerings-spesifikke kategorier |
| Restitusjon | Bokmål: restitusjon · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:457 · B2A. FYS — fysiske underkategorier |
| Restitusjon | Bokmål: restitusjon · Notater: aldri «recovery» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1027 · B17. Helse & skader |
| Resultatmål / Prosessmål | Bokmål: resultatmål / prosessmål · Notater: ett ord; «outcome/process goal» på engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:903 · B6. Mål & måltyper |
| Ring-progress / Progresjon-bar | Bokmål: ring-progress / progresjon-bar · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:784 · B3X-E. Visualiserings-uttrykk |
| Risk-reward / Risiko-belønning | Bokmål: risiko-belønning · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:557 · B2D. SPILL — spillsimuleringskategorier |
| Roll-out | Bokmål: roll-out · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:658 · B3D. Driving-statistikk (SG-OTT data) |
| Rolling average / Bevegelig snitt | Bokmål: rullerende snitt / bevegelig snitt · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:758 · B3X-C. Tidsperioder & sammenligning |
| Rotasjon | Bokmål: rotasjon · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:487 · B2B. TEK — tekniske underkategorier |
| Rotasjonsstyrke | Bokmål: rotasjonsstyrke · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:454 · B2A. FYS — fysiske underkategorier |
| Round dispersion | Bokmål: runde-spredning · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:767 · B3X-D. Spesielle metrics |
| Round management | Bokmål: runde-strategi · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:591 · B2E. TURN — turnerings-spesifikke kategorier |
| Round score | Bokmål: runde-score · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:773 · B3X-D. Spesielle metrics |
| RPE | Bokmål: RPE · Notater: «Rate of Perceived Exertion», 1–10; «anstrengelse» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:863 · Belastning-skala |
| Rundt green (som ARG-label) | Bruk i stedet: nærspill (engelsk fagvisning «SG Around-green» beholdes) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1097 · B24. Forbudt-liste |
| Rygg-mobilitet | Bokmål: rygg-mobilitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:445 · B2A. FYS — fysiske underkategorier |
| Rytme | Bokmål: rytme · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:477 · B2B. TEK — tekniske underkategorier |
| Samme-distanse-mulighet | Teknisk term: `evaluateSameDistanceOpportunity` / `SAME_DISTANCE_OPPORTUNITY` · Definisjon & bruk: SG-gevinst ved bedre køllevalg på 100/125/150 yd; flagg når SG-delta > 0,05. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:293 · 12. TrackMan-analyser og innsikt |
| Sand save | Bokmål: sand-save · Notater: bindestrek; sand-save-% | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:688 · B3F. Around-green-statistikk (SG-ARG data) |
| Sand saves | Bokmål: sand-saves · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:769 · B3X-D. Spesielle metrics |
| Sannsynlighet | Bokmål: sannsynlighet · Notater: «38 % sannsynlig» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:907 · B6. Mål & måltyper |
| Save | Bruk i stedet: lagre | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1086 · B24. Forbudt-liste |
| Save par / Save bogey | Bokmål: save par / save bogey · Notater: redning | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:562 · B2D. SPILL — spillsimuleringskategorier |
| Schedule | Bruk i stedet: plan / kalender | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1083 · B24. Forbudt-liste |
| Score | Bokmål: score · Notater: engelsk-norsk; snittscore ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:712 · B3X-A. Score-statistikk |
| Score / Percentil / Persentil-rang | Bokmål: score / percentil / persentil-rang · Notater: tall fra test; sammenligning | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:881 · Tester & måling |
| Score / Snittscore | Bokmål: score / snittscore · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:919 · B7. Turneringer |
| Scoring | Bokmål: scoring · Notater: «Scoring-drill» | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:573 · B2D. SPILL — spillsimuleringskategorier |
| Scrambling | Bokmål: scrambling · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:560 · B2D. SPILL — spillsimuleringskategorier |
| Scrambling | Bokmål: scrambling · Notater: engelsk fagterm; scrambling-% | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:686 · B3F. Around-green-statistikk (SG-ARG data) |
| Scratch-benchmark | Bokmål: scratch · Notater: mot HCP 0 | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:631 · B3B. SG-benchmark & sammenligning |
| Se mer / Se alle / Åpne | Tekst: Se mer → / Se alle → / Åpne → · Stil: text-button forest | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:121 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Sektor-diagram / Kake-diagram | Bokmål: sektor-diagram / kake-diagram · Notater: «pie chart» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:782 · B3X-E. Visualiserings-uttrykk |
| Sekvens | Bokmål: sekvens · Notater: hvordan kroppen jobber; «kinematisk sekvens» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:467 · B2B. TEK — tekniske underkategorier |
| Selvplanlagt | Bokmål: selvplanlagt · Badge-stil: lime badge | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:891 · Status på økter |
| Selvprat / Self-talk | Bokmål: selvprat / self-talk · Notater: ett ord / engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:599 · B2E. TURN — turnerings-spesifikke kategorier |
| Send melding | Tekst: Send melding · Stil: primary lime | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:122 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Sesjon / TrackMan-økt | Bokmål: sesjon / TrackMan-økt · Notater: bindestrek | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:966 · B11. TrackMan-termer |
| Sesong-snitt / Karriere-snitt | Bokmål: sesong-snitt / karriere-snitt · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:713 · B3X-A. Score-statistikk |
| Sesongplan / Årsplan | Bokmål: sesongplan / årsplan · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:799 · B4. Treningsplanlegging — periodisering |
| Session | Bruk i stedet: økt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1080 · B24. Forbudt-liste |
| Sett / Reps / Repetisjoner / Serie | Bokmål: sett / reps / repetisjoner / serie · Notater: flertall: sett (uendret), serier | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:815 · B5. Trening — økter & drills |
| Setup | Bokmål: P1.0 · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:482 · B2B. TEK — tekniske underkategorier |
| SG approach | Teknisk term: `APP` · Definisjon & bruk: SG for innspill mot green. Norsk: «Innspill». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:236 · 10. Strokes Gained (SG) og benchmarks |
| SG Approach | Bokmål: SG-APP · Notater: norsk: innspill | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:613 · B3A. SG-kjerneord |
| SG Around-green | Bokmål: SG-ARG · Notater: norsk UI-tekst: «Nærspill» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:614 · B3A. SG-kjerneord |
| SG around-the-green | Teknisk term: `ARG` · Definisjon & bruk: SG for nærspill rundt green (chip/pitch/bunker). Norsk: «Nærspill». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:237 · 10. Strokes Gained (SG) og benchmarks |
| SG fra fairway / rough / sand / recovery | Bokmål: SG fairway / SG rough / SG sand / SG recovery · Notater: sand = bunker; recovery = trøbbel | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:645 · B3C. SG per distanse / situasjon |
| SG off-the-tee | Teknisk term: `OTT` · Definisjon & bruk: SG for driving/utslag. Norsk fokus-tekst: «Tee-slag». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:235 · 10. Strokes Gained (SG) og benchmarks |
| SG Off-the-tee | Bokmål: SG-OTT · Notater: sjelden norsk; bruk OTT | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:612 · B3A. SG-kjerneord |
| SG per runde / per slag / per hull | Bokmål: SG/runde · SG/slag · SG/hull · Notater: beregnede snitt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:616 · B3A. SG-kjerneord |
| SG putting | Teknisk term: `PUTT` · Definisjon & bruk: SG for putting. Norsk: «Putting». | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:238 · 10. Strokes Gained (SG) og benchmarks |
| SG Putting | Bokmål: SG-PUTT · Notater: putting | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:615 · B3A. SG-kjerneord |
| SG Tee-to-Green | Bokmål: SG-T2G · Notater: «Total uten putting» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:611 · B3A. SG-kjerneord |
| SG Total | Bokmål: SG-Total · Notater: bindestrek; forkortelse SG-T | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:610 · B3A. SG-kjerneord |
| SG-baseline (tabell) | Teknisk term: `SgBaseline` · Definisjon & bruk: Prisma-modell med `expectedStrokes` per `distanceBucket`/kategori — leses av strategi-/innsiktsmotoren. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:243 · 10. Strokes Gained (SG) og benchmarks |
| SG-diagnose | Teknisk term: `diagnostiserSg()` / `SgDiagnose` · Definisjon & bruk: Diagnose av alle fire kategorier med krisestatus og prioritert rekkefølge (`prioritertRekkefølge`). Null hvis et SG-felt mangler. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:246 · 10. Strokes Gained (SG) og benchmarks |
| SG-differanse | Bokmål: SG-differanse · Notater: mellom to spillere/perioder | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:622 · B3A. SG-kjerneord |
| SG-ferdighetsområde | Teknisk term: `SkillArea` · Definisjon & bruk: Statistikk-enum: TEE_TOTAL, TILNAERMING, AROUND_GREEN, PUTTING, SPILL. TEE_TOTAL ≠ TEE; AROUND_GREEN ≠ KORT_SPILL. Norsk UI-tekst for AROUND_GREEN = «Nærspill». | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:130 · 4. Treningsområder |
| SG-gap | Bokmål: SG-gap · Notater: avstand til benchmark | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:621 · B3A. SG-kjerneord |
| SG-kategori (taksonomi) | Teknisk term: `SGKategori` · Definisjon & bruk: Grov gruppe: TEE, TILNAERMING, KORT_SPILL, PUTTING, SPILL. Avledes fra `TRENINGSOMRADER`. Ikke identisk med SkillArea eller SgCategory. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:129 · 4. Treningsområder |
| SG-potensial | Bokmål: SG-potensial · Notater: «potensial», ikke «potential» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:620 · B3A. SG-kjerneord |
| SG-snitt | Bokmål: snitt-SG · Notater: bruk «snitt» foran | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:617 · B3A. SG-kjerneord |
| SG-svakhet / SG-styrke | Bokmål: SG-svakhet / SG-styrke · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:619 · B3A. SG-kjerneord |
| SG-Total test | Bokmål: SG-Total test · Notater: mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:879 · Tester & måling |
| SG-trend / SG-utvikling / SG-bevegelse | Bokmål: SG-trend / SG-utvikling / SG-bevegelse · Notater: utvikling over tid; bevegelse = endring siden baseline | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:618 · B3A. SG-kjerneord |
| SG-verdier | Visning: fortegn ALLTID (+/−), komma, 1–2 desimaler · Eksempel: `SG +1,2` · `−0,4` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:67 · 2. Tall, enheter og formatering |
| Shoulder rotation | Bokmål: skulderrotasjon · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:489 · B2B. TEK — tekniske underkategorier |
| Side / dispersion | Teknisk term: `side` · Definisjon & bruk: Avstand fra mållinjen ved landing (meter, offline) — treffsikkerhet/spredning. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:266 · 11. TrackMan-parametere |
| Sign in | Bruk i stedet: logg inn | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:1091 · B24. Forbudt-liste |
| Sign out | Bruk i stedet: logg ut | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:1092 · B24. Forbudt-liste |
| Simulator / TrackMan-studio | Bokmål: simulator / TrackMan-studio · Notater: bindestrek; merkenavn GC Quad, Foresight, Mulligan Indoor | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:834 · Områder (på driving range / golfbane) |
| Simulator/Test (S) | Teknisk term: `SPILL_TEST` · Definisjon & bruk: Test eller simulert spill mot standard. Kobles til test-/benchmark-flyt. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:206 · 8. Praksistyper |
| Siste 10 runder / Siste 30 dager / Siste sesong | Bokmål: siste 10 runder … · Notater: snitt-vinduer | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:714 · B3X-A. Score-statistikk |
| Sjekkpunkt | Merknad: Avtale/merkedag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:186 · Blokk-typer i kalenderen |
| Sjekkpunkt | Merknad: Avtale/merkedag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:191 · 7. Blokk-typer i kalenderen |
| Skadevarsel | Teknisk term: `MULIG_SKADE` / `CsVarsel` · Definisjon & bruk: Flagg når siste ukes CS-snitt faller > 3 mph under nest-siste uke (mulig skade/overbelastning). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:106 · 3. CS — Club Speed |
| Skins | Bokmål: skins · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:564 · B2D. SPILL — spillsimuleringskategorier |
| Skole | Merknad: Vises dimmet og låst | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:181 · Blokk-typer i kalenderen |
| Skole | Merknad: Vises dimmet og låst | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:186 · 7. Blokk-typer i kalenderen |
| Skulder-mobilitet | Bokmål: skulder-mobilitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:444 · B2A. FYS — fysiske underkategorier |
| Slag | Teknisk term: `SLAG` · Definisjon & bruk: Slagøvelser (putt, chip, bunker, fulle slag mot mål). Øker mot spesialisering/turnering. Farge `pyr-slag`. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:50 · 1. Pyramiden |
| SLAG | Navn: Golfslag · Dekker: Fokus på å slå spesifikke golfslag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:45 · Pyramiden |
| SLAG | Navn: Golfslag · Dekker: Fokus på å slå spesifikke golfslag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:26 · 1. Pyramiden — de fem treningsområdene |
| SLAG | Lys flate (`--pyr-*` i globals.css): `#2563EB` (blå) · Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts): `#84A9FF` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:28 · Pyramiden — TO fargesett (velg etter flate) |
| Slag på green | Bokmål: slag på green · Notater: etter approach | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:678 · B3E. Approach-statistikk (SG-APP data) |
| Slag-matching | Teknisk term: `matchSource` / `matchConfidence` · Definisjon & bruk: Slag → oppgave via `auto-drill`/`auto-club`/`manual` med high/medium/low; usikre koblinger kan overstyres. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:335 · 14. Planleggingshjernen |
| Slag-type | Teknisk term: `ShotType` · Definisjon & bruk: DRIVE, APPROACH, CHIP, PITCH, PUTT, BUNKER, RECOVERY, DROP (ved slag-logging). | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:373 · 15. Datamodell & status-enums |
| Slag-underlag | Teknisk term: `ShotLie` · Definisjon & bruk: TEE, FAIRWAY, SEMI_ROUGH, ROUGH, DEEP_ROUGH, BUNKER, GREEN, WATER, OOB, TREES (hvor ballen lå). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:372 · 15. Datamodell & status-enums |
| Slag-utfall | Teknisk term: `SgOutcome` · Definisjon & bruk: Hvor slaget endte: FAIRWAY, ROUGH, GREEN, SAND, RECOVERY, HOLED. Avgjør benchmark for sluttposisjon. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:239 · 10. Strokes Gained (SG) og benchmarks |
| Slett | Tekst: Slett · Stil: danger | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:115 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Slice | Bokmål: slice · Notater: over-fade | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:541 · B2C. SLAG — slag-spesifikke kategorier |
| Slutt-posisjon | Bokmål: P10.0 · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:481 · B2B. TEK — tekniske underkategorier |
| Smart spill | Bokmål: smart spill · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:556 · B2D. SPILL — spillsimuleringskategorier |
| Smash factor | Bokmål: smash · Notater: «smash 1,48» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:659 · B3D. Driving-statistikk (SG-OTT data) |
| Smash Factor | Teknisk term: `smashFactor` · Definisjon & bruk: Ball speed / club speed — treffeffektivitet. Snitt = `avgSmash`; spredning > 0,05 flagges som konsistens-lekkasje. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:258 · 11. TrackMan-parametere |
| Smash Factor | Aldri: treffprosent | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:54 · De vanligste |
| Smash-kurve | Teknisk term: `computeSmashCurve()` · Definisjon & bruk: Andregradskurve smash vs club speed → optimal hastighet. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:285 · 12. TrackMan-analyser og innsikt |
| Snitt | Bokmål: snitt · Notater: aldri «gjennomsnitt» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:732 · B3X-B. Statistikk-uttrykk |
| Snitt / Trend / Trendlinje | Bokmål: snitt / trend / trendlinje · Notater: aldri «gjennomsnitt»; trendlinje ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:953 · B10. Statistikk-termer |
| Sparkline | Bokmål: sparkline · Notater: mini-graf | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:783 · B3X-E. Visualiserings-uttrykk |
| Speed | Bokmål: speed · Notater: «puttingspeed» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:536 · B2C. SLAG — slag-spesifikke kategorier |
| Speed control | Bokmål: tempo-kontroll · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:703 · B3G. Putting-statistikk (SG-PUTT data) |
| Spenn | Bokmål: spenn · Notater: range | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:737 · B3X-B. Statistikk-uttrykk |
| Spenstighet | Bokmål: spenstighet · Notater: hopp + pliometrisk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:437 · B2A. FYS — fysiske underkategorier |
| SPESIALISERING | Typisk innhold (veiledende): Slag og spissing mot sesong | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:133 · Periodisering |
| SPESIALISERING | Typisk innhold (veiledende, ikke krav): Slag og spissing mot sesong | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:138 · 4. Periodisering — årets rytme |
| Spesialiseringsperiode | Teknisk term: `SPESIALISERING` · Definisjon & bruk: Teknikk integreres i slag og spill. CS-tak 90 %. SLAG 20–40 %, SPILL 15–35 %. L_BALL/L_AUTO. 480–840 min/uke. Maks 6 økter/uke. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:220 · 9. Periodisering |
| Spill | Teknisk term: `SPILL` · Definisjon & bruk: Spilltrening (simulert spill på bane). Øker mot turnering/evaluering. Farge `pyr-spill`. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:51 · 1. Pyramiden |
| SPILL | Navn: Spill · Dekker: Banespill, strategi, scoring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:46 · Pyramiden |
| SPILL | Navn: Spill · Dekker: Banespill, strategi, scoring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:27 · 1. Pyramiden — de fem treningsområdene |
| SPILL | Lys flate (`--pyr-*` i globals.css): `#D1F843` (lime) · Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts): `#D1F843` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:29 · Pyramiden — TO fargesett (velg etter flate) |
| Spill (simulert) | Teknisk term: `SPILL` · Definisjon & bruk: Helhetlig simulert spill. SG-kategori `SPILL`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:128 · 4. Treningsområder |
| Spill mot motstander | Bokmål: spill mot motstander · Notater: match play | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:572 · B2D. SPILL — spillsimuleringskategorier |
| Spill mot scorekort | Bokmål: spill mot scorekort · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:571 · B2D. SPILL — spillsimuleringskategorier |
| Spillbasert læring | Bokmål: spillbasert læring · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:846 · Trenings-modus & metoder |
| Spiller | Bokmål: spiller · Notater: aldri «elev» eller «atlet» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:418 · B1. Roller |
| Spiller-benchmark / Tour-benchmark | Bokmål: spiller-benchmark / tour-benchmark · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:630 · B3B. SG-benchmark & sammenligning |
| Spiller-status | Teknisk term: `UserStatus` · Definisjon & bruk: AKTIV, PERMISJON, SKADET, INAKTIV — permisjon/skade/retur til spill. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:361 · 15. Datamodell & status-enums |
| Spillerkategori (eldre taksonomi) | Teknisk term: `SPILLERKATEGORIER` · Definisjon & bruk: Eldre A–K i taxonomy.ts (A = aspirerende Tour) — motsatt av canon. Skal migreres. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:399 · 16. Andre sentrale begreper |
| Spillerkategori A–K (canon v3.5) | Teknisk term: `categories` (canon-methodology.json) · Definisjon & bruk: **Gjeldende kanon:** 11 nivåer, **A = komplett nybegynner (HCP 54+) → K = tour-proff (+4 eller bedre)**. Per kategori: HCP-ekvivalent, LTAD-fase, pyramide-default, typisk L-fase. NB: motsatt retning av eldre skalaer under — kode-migrering utestår. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:397 · 16. Andre sentrale begreper |
| Spillerprogram | Teknisk term: `PlayerProgram` · Definisjon & bruk: Coaching-/akademiprogram (WANG_TOPPIDRETT, GFGK_ELITE, GFGK_BREDDE, GFGK_JENTER, GFGK_MINI, AK_ACADEMY, AK_ACADEMY_JUNIOR m.fl.). `PLATFORM_ONLY` = selvbetjent uten coach (GDPR-skille i AgencyOS). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:355 · 15. Datamodell & status-enums |
| Spillsimulering | Bokmål: spillsimulering · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:552 · B2D. SPILL — spillsimuleringskategorier |
| Spin Axis | Teknisk term: `spinAxis` · Definisjon & bruk: Spinn-aksens helning (grader) — sidespinn (draw/fade). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:261 · 11. TrackMan-parametere |
| Spin Axis | Aldri: spinnakse | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:58 · De vanligste |
| Spin rate | Bokmål: spinrate · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:501 · B2B. TEK — tekniske underkategorier |
| Spin rate | Bokmål: spinrate · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:662 · B3D. Driving-statistikk (SG-OTT data) |
| Spin Rate | Teknisk term: `spinRate` · Definisjon & bruk: Spinn (rpm). Sentral for utstyr/ballflukt. | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:260 · 11. TrackMan-parametere |
| Spin Rate | Aldri: spinn, spinnmengde | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:57 · De vanligste |
| Spin-akse | Bokmål: spin-akse · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:500 · B2B. TEK — tekniske underkategorier |
| Spinal-mobilitet | Bokmål: spinal-mobilitet · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:456 · B2A. FYS — fysiske underkategorier |
| Spor A / Spor B (live-økt) | Teknisk term: `TrainingPlanSession` / `TrainingSessionV2` · Definisjon & bruk: To live-økt-systemer som sameksisterer BEVISST (PlayerHQ `/portal/live` vs Workbench `/admin/live`). Skal ikke merges uoppfordret. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:403 · 16. Andre sentrale begreper |
| Spor-status (teknisk mål) | Teknisk term: `TrackStatus` · Definisjon & bruk: PAA_VEI (begge spor positive), STAGNERER, FERDIG, INAKTIV (ingen reps > 14 d), AVSLAATT. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:383 · 15. Datamodell & status-enums |
| Spredning / Dispersion | Bokmål: spredning / dispersion · Notater: begge akseptert | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:647 · B3C. SG per distanse / situasjon |
| Stabilitet | Bokmål: stabilitet · Notater: core + leddstabilitet | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:446 · B2A. FYS — fysiske underkategorier |
| Stableford | Bokmål: stableford · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:565 · B2D. SPILL — spillsimuleringskategorier |
| Stableford-poeng | Bokmål: stableford-poeng · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:726 · B3X-A. Score-statistikk |
| Stacked bar / Box plot | Bokmål: stablet søyle / boksplot · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:786 · B3X-E. Visualiserings-uttrykk |
| Stagnering | Bokmål: stagnering · Notater: flat trend/utvikling | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:743 · B3X-B. Statistikk-uttrykk |
| Stance | Bokmål: oppstilling · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:484 · B2B. TEK — tekniske underkategorier |
| Standardavvik | Bokmål: standardavvik · Notater: «stdev» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:734 · B3X-B. Statistikk-uttrykk |
| Start økt | Tekst: Start økt · Stil: lime primary med play-ikon | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:119 · 5. Knapper & CTA-er (flyttet fra ordbok B13) |
| Stasjon / Sirkel-trening / Superset | Bokmål: stasjon / sirkel-trening / superset · Notater: «Stasjon 1, 2, 3» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:855 · Trenings-modus & metoder |
| Statisk tøyning | Bokmål: statisk tøyning · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:459 · B2A. FYS — fysiske underkategorier |
| Statistikk | Bokmål: statistikk · Notater: aldri «stats» i UI | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:952 · B10. Statistikk-termer |
| Stats | Bruk i stedet: statistikk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1082 · B24. Forbudt-liste |
| Steep / Shallow | Bokmål: brattere / flatere · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:472 · B2B. TEK — tekniske underkategorier |
| Stigning | Bokmål: stigning · Notater: «slope» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:742 · B3X-B. Statistikk-uttrykk |
| Straight | Bokmål: rett · Notater: «Rett ball» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:542 · B2C. SLAG — slag-spesifikke kategorier |
| Strategi | Bokmål: strategi · Notater: «Strategi-trening» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:555 · B2D. SPILL — spillsimuleringskategorier |
| Streak / Lengste streak | Bokmål: streak / lengste streak · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:955 · B10. Statistikk-termer |
| Streak-mål | Bokmål: streak-mål · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:904 · B6. Mål & måltyper |
| Strekkvalitet | Teknisk term: `evaluateStrikeQuality` / `STRIKE_QUALITY` · Definisjon & bruk: Treffkvalitet via smash + treffmønster. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:287 · 12. TrackMan-analyser og innsikt |
| Strike location | Bokmål: impact location · Notater: engelsk-norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:475 · B2B. TEK — tekniske underkategorier |
| Strike pattern | Teknisk term: `strikePatternX` / `strikePatternY` · Definisjon & bruk: Treffpunkt på bladet: X toe–heel, Y low–high (−1..1). Avdekker miss-tendenser. | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S3:272 · 11. TrackMan-parametere |
| Stroke play / Match play | Bokmål: stroke play / match play · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:932 · B8. HCP & score-termer |
| Stroke-spill | Bokmål: stroke-spill · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:567 · B2D. SPILL — spillsimuleringskategorier |
| Strokes Gained | Teknisk term: SG / `beregnSg()` · Definisjon & bruk: Beregnes fra slag-data (kategori, distanse, utfall, distanse etter). Vises i SG-hub og statistikk. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:234 · 10. Strokes Gained (SG) og benchmarks |
| Strokes Gained | Bokmål: strokes gained · Notater: engelsk fagterm beholdt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:609 · B3A. SG-kjerneord |
| Strokes gained over benchmark | Bokmål: SG over benchmark · Notater: norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:634 · B3B. SG-benchmark & sammenligning |
| Strokes lost / Strokes gained | Bokmål: tapte slag / gained-slag · Notater: mot benchmark | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:772 · B3X-D. Spesielle metrics |
| Styrke | Teknisk term: `STYRKE` · Definisjon & bruk: Styrketrening med motstand. Felter: reps, sett, kg. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:185 · 7. FYS — fysiske underkategorier |
| Styrke | Bokmål: styrke · Notater: generell | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:433 · B2A. FYS — fysiske underkategorier |
| STYRKE | Navn: Styrke (fysisk) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:73 · Treningsområder |
| STYRKE | Navn: Styrke · Familie: FYS · Enhet: — · Hva en rep er: Serier/reps | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:55 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Styrke-/spenst-tester | Bokmål: smith machine squat / knebøy / vertikalt hopp / standlengde-hopp / medisinball-kast / 60m sprint / Y-balance / overhead squat / en-bens-balanse (single leg balance) · Notater: norske former der de finnes | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:880 · Tester & måling |
| Submit | Bruk i stedet: send | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1087 · B24. Forbudt-liste |
| Subscription | Bruk i stedet: abonnement | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1084 · B24. Forbudt-liste |
| Suksess | Bokmål: Sendt! / Lagret! / Bekreftet! · Notater: korte beskjeder | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:992 · B14. Notifikasjoner & feedback |
| Swing Direction | Aldri: svingretning | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:63 · De vanligste |
| Swing-direction | Bokmål: swing-direction · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:470 · B2B. TEK — tekniske underkategorier |
| Søvn / Stress / Belastning | Bokmål: søvn / stress / belastning · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1028 · B17. Helse & skader |
| Takeaway | Bokmål: takeaway · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:509 · B2B. TEK — tekniske underkategorier |
| Tall + enhet | Bokmål: `60 min`, `21 dager`, `5 sett` · Eksempel: mellomrom | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1067 · B23. Tall, dato, tid — formatering |
| Team Norway IUP Ref-ark | Teknisk term: `BENCHMARK_PUTT` · Definisjon & bruk: Putting-benchmark (NGF/Team Norway 2025). Kalibrert 2026-06-10 (1 m → 1,13 forventet slag). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:242 · 10. Strokes Gained (SG) og benchmarks |
| TEE_TOTAL | Navn: Utslag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:58 · Treningsområder |
| TEE_TOTAL | Navn: Utslag · Familie: Fullsving · Enhet: m · Hva en rep er: Slag | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:40 · 2. Treningsområder — hvor på banen/anlegget (19 stk) |
| Tee-område | Bokmål: tee-område · Notater: bindestrek; «tee 1» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:830 · Områder (på driving range / golfbane) |
| Tee-slag | Teknisk term: `TEE` · Definisjon & bruk: Utslag fra tee. SG-kategori `TEE`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:115 · 4. Treningsområder |
| TEK | Navn: Teknisk · Dekker: Teknisk arbeid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:44 · Pyramiden |
| TEK | Navn: Teknisk · Dekker: Teknisk svingarbeid | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:25 · 1. Pyramiden — de fem treningsområdene |
| TEK | Lys flate (`--pyr-*` i globals.css): `#B8852A` (ochre) · Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts): `#E8A33D` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:27 · Pyramiden — TO fargesett (velg etter flate) |
| Teknikk | Bokmål: teknikk · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:466 · B2B. TEK — tekniske underkategorier |
| Teknisk | Teknisk term: `TEK` · Definisjon & bruk: Teknisk svingarbeid. Knyttes til L-faser og P-posisjoner. Maks 40 % i GRUNN/SPESIALISERING. Farge `pyr-tek`. | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:49 · 1. Pyramiden |
| Teknisk plan | Teknisk term: `TechnicalPlan` · Definisjon & bruk: Spillerens tekniske utviklingsplan med arbeidsoppgaver; kan knyttes til periodeblokk. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:332 · 14. Planleggingshjernen |
| Teknisk plan-status | Teknisk term: `TechPlanStatus` · Definisjon & bruk: DRAFT, ACTIVE, ARCHIVED. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:380 · 15. Datamodell & status-enums |
| Tempo | Bokmål: tempo · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:476 · B2B. TEK — tekniske underkategorier |
| Tempo (putting) | Bokmål: tempo · Notater: i putting-kontekst | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:537 · B2C. SLAG — slag-spesifikke kategorier |
| Tempo-ratio | Teknisk term: `computeTempo()` / `avgRatio` · Definisjon & bruk: Tilbakesving:nedsving, optimal 3:1. `sigmaRatio` = spredning. Kun CSV-eksport. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:283 · 12. TrackMan-analyser og innsikt |
| Tempo-variasjon | Teknisk term: `evaluateTempoVariance` / `TEMPO_VARIANCE` · Definisjon & bruk: Flagger ustabil rytme: σ > 0,15 (krever ≥ 8 slag/kølle med tempo). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:284 · 12. TrackMan-analyser og innsikt |
| Test | Merknad: Testgjennomføring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:185 · Blokk-typer i kalenderen |
| Test | Merknad: Testgjennomføring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:190 · 7. Blokk-typer i kalenderen |
| Test / Test-batteri / Protokoll | Bokmål: test / test-batteri / protokoll · Notater: flertall: tester; bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:874 · Tester & måling |
| Test-synlighet | Teknisk term: `TestVisibility` · Definisjon & bruk: PRIVATE (skaperen), COACH, GROUP, ACADEMY. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:377 · 15. Datamodell & status-enums |
| Test-tildeling | Teknisk term: `TestAssignmentStatus` · Definisjon & bruk: OPEN, COMPLETED, CANCELLED — coach tildeler test, begge varsles. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:378 · 15. Datamodell & status-enums |
| Test-økt-status | Teknisk term: `TestSessionStatus` · Definisjon & bruk: IN_PROGRESS, COMPLETED, ABORTED. Committes til `TestResult` ved COMPLETED. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:351 · 15. Datamodell & status-enums |
| TESTUKE | Typisk innhold (veiledende): Samlet testgjennomføring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:136 · Periodisering |
| TESTUKE | Typisk innhold (veiledende, ikke krav): Samlet testgjennomføring | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:141 · 4. Periodisering — årets rytme |
| Tid | Bokmål: `09:00` · Eksempel: 24h ALLTID | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1065 · B23. Tall, dato, tid — formatering |
| Tid | Visning: 24-timers, kolon · Eksempel: `09:00` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:75 · 2. Tall, enheter og formatering |
| Tier | Bokmål: tier · Notater: eller «nivå» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:999 · B15. Tier & abonnement |
| Tilbakegang / Forbedring | Bokmål: tilbakegang / forbedring · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:746 · B3X-B. Statistikk-uttrykk |
| Tilbakemelding | Bokmål: tilbakemelding · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:990 · B14. Notifikasjoner & feedback |
| Tillatte L-faser | Teknisk term: `lFaserTillatt` · Definisjon & bruk: Kun visse L-faser per periode (TURNERING: kun L_AUTO; GRUNN: L_KROPP/L_ARM/L_KOLLE). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:314 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| TM-mål-protokoll | Teknisk term: `TmGoalProtocol` · Definisjon & bruk: ROLLING_WINDOW, BEST_OF_N, STREAK, SESSION_GATE — hvordan målet måles. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:385 · 15. Datamodell & status-enums |
| TM-mål-sammenligning | Teknisk term: `TmGoalComparison` · Definisjon & bruk: LESS_THAN, GREATER_THAN, RANGE, EQUAL. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:386 · 15. Datamodell & status-enums |
| TM-mål-type | Teknisk term: `TmGoalType` · Definisjon & bruk: PRIMARY, SECONDARY, CAUSAL, HIT_RATE (jf. §14 TrackMan-mål). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:384 · 15. Datamodell & status-enums |
| TM-parametere i UI | Bokmål: club speed · ball speed · smash factor · carry · total distance · launch angle · spin rate · attack angle · club path · face angle · apex · deviation · Notater: engelske fagtermer beholdes (betydning: §11) | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:965 · B11. TrackMan-termer |
| Toast | Bokmål: toast · Notater: UI-feedback | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:991 · B14. Notifikasjoner & feedback |
| Tooltip / Drill-down / Zoom | Bokmål: tooltip / drill-down / zoom · Notater: engelsk-norsk | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:788 · B3X-E. Visualiserings-uttrykk |
| Top 10 % / Bunn 25 % | Bokmål: topp 10 % / bunn 25 % · Notater: mellomrom før % | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:636 · B3B. SG-benchmark & sammenligning |
| Topp-posisjon | Bokmål: P4.0 · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:480 · B2B. TEK — tekniske underkategorier |
| Total distance | Bokmål: total distanse · Notater: uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:657 · B3D. Driving-statistikk (SG-OTT data) |
| Total Distance | Teknisk term: `totalDistance` · Definisjon & bruk: Total distanse inkl. rull (meter). Snitt = `avgTotal`; distansegap-analyse (1 m = 1,09361 yd). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:263 · 11. TrackMan-parametere |
| Total putts | Bokmål: totalt antall putts · Notater: norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:696 · B3G. Putting-statistikk (SG-PUTT data) |
| Trackman | Galt: TrackMan, trackman *(i publikumsvendt tekst; produktkoden bruker TrackMan)* | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:103 · Navn og skrivemåte |
| TrackMan | Bokmål: TrackMan · Notater: CamelCase merkenavn | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:964 · B11. TrackMan-termer |
| TrackMan-miljø | Teknisk term: `TrackManEnvironment` · Definisjon & bruk: Hvor en TrackMan-måling ble gjort: SIMULATOR_INDOOR, NET_INDOOR, RANGE_OUTDOOR_MAT, RANGE_OUTDOOR_GRASS, COURSE_PRACTICE, COURSE_COMPETITION. Påvirker tolkning. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:157 · 5. Miljø (M) og Press (PR) |
| TrackMan-mål | Teknisk term: `PositionTaskTmGoal` · Definisjon & bruk: Målbart TM-mål på oppgave: PRIMARY eller SECONDARY (smash mean, ball speed, carry). `currentValue` fra matchede slag. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:334 · 14. Planleggingshjernen |
| TrackMan-økt | Teknisk term: `TrackManSession` · Definisjon & bruk: Importert måleøkt (CSV/API) med mange `TrackManShot`. Rådata i `rawJson`; `extractShots()`/`extractClubs()`. HTML-rapport mangler tempo (kun CSV). | PARAMETERKILDE – navneformen må følge nyere S7; se A05 | S3:275 · 11. TrackMan-parametere |
| Trajectory / Ballbane | Bokmål: ballbane · Notater: norsk ett ord; «lav trajectory» = low ball flight | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:545 · B2C. SLAG — slag-spesifikke kategorier |
| Treffprosent | Bokmål: treffprosent · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:655 · B3D. Driving-statistikk (SG-OTT data) |
| Trendlinje | Bokmål: trendlinje · Notater: ett ord; «trend opp ↑ / trend ned ↓» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:741 · B3X-B. Statistikk-uttrykk |
| Trener (alene) | Bruk i stedet: coach | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1078 · B24. Forbudt-liste |
| Trenger oppmerksomhet / justering | Bokmål: trenger oppmerksomhet / trenger justering · Notater: gul-oransje | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1036 · B18. Tilstander & feedback-ord |
| Treningsbelastning | Bokmål: treningsbelastning · Notater: ett ord, «training load»; daglig/ukens belastning | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:864 · Belastning-skala |
| Treningsdrill V2 | Teknisk term: `TrainingDrillV2` · Definisjon & bruk: Øvelse i V2-økt med AK-formel-parametere + FYS-felter (pyramide, L-fase, CS, M, PR, fysOvelse …). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:348 · 15. Datamodell & status-enums |
| Treningshelse / Energinivå | Bokmål: treningshelse / energinivå · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1026 · B17. Helse & skader |
| Treningsområde | Teknisk term: `TRENINGSOMRADER` / `Treningsomrade` · Definisjon & bruk: De 16 områdene under. Settes på GOLF-drills (`treningsomrade`); grupperes til fokus via `TEMPLATE_FOCUS`. | OVERSTYRT for planlegging av S1/S2; teknisk kode er kun kildeopplysning | S3:114 · 4. Treningsområder |
| TRENINGSOMRÅDE | Navn: Treningsområde | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:104 · AK-formelen |
| TRENINGSOMRÅDE | Navn: Treningsområde | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:94 · 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1) |
| Treningsplan | Teknisk term: `TrainingPlan` · Definisjon & bruk: Spillerens periodiserte plan (startdato, økter, godkjenningsstatus). Kan være AI-generert. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:344 · 15. Datamodell & status-enums |
| Treningsrom / Gym / Restitusjonsrom | Bokmål: treningsrom / gym / restitusjonsrom · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:836 · Områder (på driving range / golfbane) |
| TRENINGSSAMLING | Typisk innhold (veiledende): Samling (dagsformat) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:138 · Periodisering |
| TRENINGSSAMLING | Typisk innhold (veiledende, ikke krav): Samling (dagsformat) | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:143 · 4. Periodisering — årets rytme |
| Treningstempo / Game speed | Bokmål: treningstempo / game speed · Notater: ett ord / engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:848 · Trenings-modus & metoder |
| Treningstype (drill) | Teknisk term: `DrillPracticeType` · Definisjon & bruk: Drillnivå: BLOKK, VARIABEL, KONKURRANSE, SPILL_TEST. Settes på `ExerciseDefinition.treningstype`. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:207 · 8. Praksistyper |
| Treningsøkt (Spor A) | Teknisk term: `TrainingPlanSession` · Definisjon & bruk: Planlagt PlayerHQ-økt (tid, varighet, pyramide, drills). Live-fremdrift i `liveSnapshot`. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:346 · 15. Datamodell & status-enums |
| Treningsøkt / Økt | Bokmål: treningsøkt / økt · Notater: ett ord; økt = kort form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:811 · B5. Trening — økter & drills |
| Treningsøkt V2 (Spor B) | Teknisk term: `TrainingSessionV2` · Definisjon & bruk: Coach-/Workbench-økt med miljø, treningstype, deltakere (`/admin/live`). Sameksisterer bevisst med Spor A. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:347 · 15. Datamodell & status-enums |
| Trondheim Golfklubb | Forkortelse: Trondheim GK · Lokasjon: Trondheim | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:166 · 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22) |
| TSS / CTL / ATL / TSB | Bokmål: TSS / CTL / ATL / TSB · Notater: Training Stress Score · Chronic (fitness) · Acute (fatigue) · Balance (form) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:867 · Belastning-skala |
| TURN | Navn: Turnering · Dekker: Konkurranse og turneringsforberedelse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:47 · Pyramiden |
| TURN | Navn: Turnering · Dekker: Konkurranse og turneringsforberedelse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:28 · 1. Pyramiden — de fem treningsområdene |
| TURN | Lys flate (`--pyr-*` i globals.css): `#A32D2D` (rød) · Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts): `#F2908C` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:30 · Pyramiden — TO fargesett (velg etter flate) |
| Turnering | Merknad: Turneringsdeltakelse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:183 · Blokk-typer i kalenderen |
| Turnering | Merknad: Turneringsdeltakelse | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:188 · 7. Blokk-typer i kalenderen |
| Turnering | Teknisk term: `TURN` · Definisjon & bruk: Toppen: kamp-/mental trening, reelt konkurransespill. Maks 45 % i TURNERING, 65 % i EVALUERING. Farge `pyr-turn`. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:52 · 1. Pyramiden |
| TURNERING | Navn: Turnering | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:115 · AK-formelen |
| TURNERING | Navn: Turnering | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:105 · 3.3 Press (hvem som ser på) |
| Turnering / Konkurranse | Bokmål: turnering / konkurranse · Notater: flertall: turneringer | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:914 · B7. Turneringer |
| Turnerings-eksempler (demo) | Bokmål: Sørlandsåpent (Mandal GK, 54 hull) · Bossum Open (36 hull) · NM Slag (72 hull) · Trondheim Open (54 hull) · GFGK Mesterskap · Notater: default-data | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:922 · B7. Turneringer |
| Turneringsforberedelse | Bokmål: turneringsforberedelse · Notater: ett ord | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:580 · B2E. TURN — turnerings-spesifikke kategorier |
| Turneringslås | Teknisk term: `turneringsLaas` · Definisjon & bruk: I turneringsperiode låses planen (kun L_AUTO, ingen ny innlæring). | HISTORIKK / AVVIK – utgåtte treningsledd; bruk S1/S2 | S3:315 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Turneringsperiode | Teknisk term: `TURNERING` · Definisjon & bruk: Automatisering + turneringsforberedelse. CS-tak 100 %. TURN 20–45 %. Kun L_AUTO; turneringslås på. 240–480 min/uke. Maks 5 økter/uke. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:221 · 9. Periodisering |
| TURNERINGSPERIODE | Typisk innhold (veiledende): Konkurranse og vedlikehold | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:134 · Periodisering |
| TURNERINGSPERIODE | Typisk innhold (veiledende, ikke krav): Konkurranse og vedlikehold | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:139 · 4. Periodisering — årets rytme |
| Turneringspåmelding | Teknisk term: `TournamentEntryStatus` · Definisjon & bruk: PLANNED (meldt på), CONFIRMED, WITHDRAWN, COMPLETED, DNF. | KONTEKST / FAGKONTROLL – se A05/A07/A17 | S3:366 · 15. Datamodell & status-enums |
| Tusenseparator | Bokmål: mellomrom · Eksempel: `47 250 kr`, `1 247 reps` | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1062 · B23. Tall, dato, tid — formatering |
| Tusenskille | Visning: mellomrom · Eksempel: `47 250 kr` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:73 · 2. Tall, enheter og formatering |
| Ukedag | Teknisk term: `Ukedag` · Definisjon & bruk: MAN, TIR, ONS, TOR, FRE, LOR, SON. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:375 · 15. Datamodell & status-enums |
| Ukedager | Bokmål: mandag … søndag · Notater: lowercase; kort: Man, Tir, Ons, Tor, Fre, Lør, Søn | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:943 · B9. Kalender & tid |
| Uleste | Bokmål: uleste · Notater: «5 uleste» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:988 · B14. Notifikasjoner & feedback |
| Under-par / Over-par | Bokmål: under-par / over-par · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:724 · B3X-A. Score-statistikk |
| Up-and-down | Bokmål: up-and-down · Notater: engelsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:561 · B2D. SPILL — spillsimuleringskategorier |
| Up-and-down | Bokmål: up-and-down · Notater: engelsk; up-and-down-% | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:687 · B3F. Around-green-statistikk (SG-ARG data) |
| Username | Bruk i stedet: brukernavn | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1093 · B24. Forbudt-liste |
| UTEN_BALL | Navn: Uten ball | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:95 · AK-formelen |
| UTEN_BALL | Navn: Uten ball | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:81 · 3.1 Motorikk (læringssteg — gjelder KUN fullsving) |
| Utholdenhet | Bokmål: utholdenhet · Notater: aerob + anaerob | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:440 · B2A. FYS — fysiske underkategorier |
| Utropstegn og emoji | Fordi: Skriker. AK Golf trenger ikke skrike | SPRÅKKILDE 01.09 – skill parameter, app og markedsflate | S7:22 · Slik snakker vi aldri |
| Utstyrstilpasning | Teknisk term: `evaluateEquipmentFit` / `EQUIPMENT_FIT` · Definisjon & bruk: Køller med store målavvik (critical/warn). Krever ≥ 8 slag/kølle; flagg ved ≥ 2 critical eller 1 critical + 1 warn. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:290 · 12. TrackMan-analyser og innsikt |
| UTVIKLING | Typisk fokus (veiledende): Utviklingsarbeid — tekniske oppgaver, volum | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:150 · Treningsblokk-merker |
| UTVIKLING | Typisk fokus (veiledende): Utviklingsarbeid — tekniske oppgaver, volum | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:159 · 5. Treningsblokk-merker (nye 20.08.2026) |
| Variabel / Differensiell praksis | Bokmål: variabel praksis / differensiell praksis · Notater: uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:844 · Trenings-modus & metoder |
| Variasjon / Variansavstand | Bokmål: variasjon / variansavstand · Notater: spredningsmål | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:735 · B3X-B. Statistikk-uttrykk |
| Varighet | Bokmål: varighet · Notater: «60 min» / «1 t 30 min»; forkortelser: min (minutter), t (timer), sek (sekund) | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:946 · B9. Kalender & tid |
| Varighet | Visning: min / t · Eksempel: `60 min` · `1 t 30 min` | VISNINGSKILDE – ord/tall til kontroll; ikke farger eller fonter | S4:76 · 2. Tall, enheter og formatering |
| Varsel / Notifikasjon | Bokmål: varsel / notifikasjon · Notater: flertall: varsler; notifikasjon mer formell | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:986 · B14. Notifikasjoner & feedback |
| Vedlegg / Spørsmål / Svar | Bokmål: vedlegg / spørsmål / svar · Notater: flertall uendret | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:989 · B14. Notifikasjoner & feedback |
| Video-analyse / Video-review / Bilde-analyse | Bokmål: video-analyse / video-review / bilde-analyse · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:850 · Trenings-modus & metoder |
| Vind-spill | Bokmål: vind-spill · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:588 · B2E. TURN — turnerings-spesifikke kategorier |
| Vindretning | Teknisk term: `WindDir` · Definisjon & bruk: STILLE, MEDVIND, MOTVIND, VENSTRE, HOYRE (kontekst på loggede slag). | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:374 · 15. Datamodell & status-enums |
| Visualisering | Bokmål: visualisering · Notater: «Se slaget før det skjer» | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:582 · B2E. TURN — turnerings-spesifikke kategorier |
| Visualiseringsøvelse | Bokmål: visualiseringsøvelse · Notater: ett ord | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:601 · B2E. TURN — turnerings-spesifikke kategorier |
| Volum-tak | Teknisk term: `maxVolumMin` / `volumPerUke` · Definisjon & bruk: Ukentlig volum (min) innenfor periodens min/maks; valideres per ISO-uke. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:313 · 13. Invarianter (systemets harde regler — versjonert, kan endres) |
| Vs. forrige uke/måned/sesong | Bokmål: mot forrige uke / måned / sesong · Notater: norsk | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:756 · B3X-C. Tidsperioder & sammenligning |
| Vær-tilpasning | Bokmål: vær-tilpasning · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:589 · B2E. TURN — turnerings-spesifikke kategorier |
| WAGR-benchmark | Teknisk term: `seed-wagr-benchmark` · Definisjon & bruk: World Amateur Golf Ranking-referanser; talent-/kohort-sammenligning (`/admin/talent/wagr-benchmark`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:248 · 10. Strokes Gained (SG) og benchmarks |
| WANG Toppidrett |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:196 · Grupper og programmer |
| WANG Toppidrett |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:227 · 9. Grupper og programmer |
| WANG Ung |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:197 · Grupper og programmer |
| WANG Ung |  | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:228 · 9. Grupper og programmer |
| Wedge / Sand-wedge | Bokmål: wedge / sand-wedge · Notater: engelsk akseptert; bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:976 · B12. Kølle-typer |
| Wedge matrix | Bokmål: wedge matrix · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:877 · Tester & måling |
| Wedge-spill | Bokmål: wedge-slag · Notater: bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:519 · B2C. SLAG — slag-spesifikke kategorier |
| WITHDRAWN | Navn: Trukket | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:168 · Turneringer |
| WITHDRAWN | Navn: Trukket | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:172 · 6. Turneringer |
| Woods | Bokmål: wood 3 · Notater:  | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:974 · B12. Kølle-typer |
| Workout | Bruk i stedet: økt | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:1081 · B24. Forbudt-liste |
| X-factor | Bokmål: X-factor · Notater: engelsk fagterm | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:491 · B2B. TEK — tekniske underkategorier |
| Yardage-book / Avstandsbok | Bokmål: avstandsbok · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:587 · B2E. TURN — turnerings-spesifikke kategorier |
| Year-over-year / YoY | Bokmål: år-over-år · Notater: bindestreker | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:755 · B3X-C. Tidsperioder & sammenligning |
| YTD | Bokmål: i år / hittil i år · Notater: norsk form | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:754 · B3X-C. Tidsperioder & sammenligning |
| Økt | Merknad: Treningsøkt | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S1:180 · Blokk-typer i kalenderen |
| Økt | Merknad: Treningsøkt | FAGKILDE – les kildeorden og avklaringer i del 1–5 | S2:185 · 7. Blokk-typer i kalenderen |
| Økt-forespørsel | Teknisk term: `SessionRequestStatus` · Definisjon & bruk: PENDING, APPROVED, DECLINED, CANCELLED («ønsk økt»-flyten). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:367 · 15. Datamodell & status-enums |
| Økt-sammenligning (best vs. nå) | Teknisk term: `session-diff` (`summarizeSession`/`diffSessions`) · Definisjon & bruk: 7 aggregat-metrikker mot «beste økt»; ny personlig beste ved ≥ 3 forbedret. `/portal/mal/sg-hub/best-vs-now`. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:297 · 12. TrackMan-analyser og innsikt |
| Økt-status (PlayerHQ) | Teknisk term: `SessionStatus` · Definisjon & bruk: PLANNED, ACTIVE, PAUSED, COMPLETED, ABANDONED, SKIPPED, CANCELLED (på `TrainingPlanSession`). | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:349 · 15. Datamodell & status-enums |
| Økt-status V2 | Teknisk term: `SessionStatusV2` · Definisjon & bruk: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED — IN_PROGRESS i stedet for ACTIVE/PAUSED; atskilt for å unngå migrasjonskonflikt. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:350 · 15. Datamodell & status-enums |
| Øktgenerator | Teknisk term: `session-generator` · Definisjon & bruk: Auto-genererer økter innenfor invariantene; alltid M2 + BLOKK. | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:326 · 14. Planleggingshjernen |
| Øktmiljø (sted) | Teknisk term: `SessionEnvironment` · Definisjon & bruk: Konkret STEDTYPE en økt logges på: RANGE, BANE, STUDIO, HJEM, SIMULATOR, GYM. Chip ved øktlogging. Sted ≠ konkurransenærhet (M). | HISTORISK MODELL – ord beholdt for oppslag, ikke regelgrunnlag | S3:156 · 5. Miljø (M) og Press (PR) |
| Øktnotat-type | Teknisk term: `SessionNoteType` · Definisjon & bruk: SELF, COACH_QUESTION, VIDEO. | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:369 · 15. Datamodell & status-enums |
| Øvelses-synlighet | Teknisk term: `ExerciseVisibility` · Definisjon & bruk: PRIVATE, COACH_PLAYERS m.fl. — hvem ser en coach-/spiller-øvelse. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:353 · 15. Datamodell & status-enums |
| Øvelseskilde | Teknisk term: `ExerciseSource` · Definisjon & bruk: SYSTEM (seedet, låst), COACH, PLAYER. | KILDEOPPSLAG – UI følger A01–A03; tekniske identifikatorer og historisk ordlyd er bevart | S3:352 · 15. Datamodell & status-enums |
| Δ (delta) | Bokmål: endring · Notater: Δ-symbol kan brukes; «endring i prosent»; «prosent endring» uten bindestrek | KILDEOPPSLAG – eldre ordlyd, ikke ny samlet godkjenning | S3:757 · B3X-C. Tidsperioder & sammenligning |

## 8. Samlede faglige forklaringer

Denne delen bevarer forklaringene rundt tabellene, inkludert kjente motsetninger og historiske statuspåstander. Del 1–5 styrer hvordan de brukes.

### 8.1 Treningsfaglig hovedkilde

**FAGKILDE – tabeller gjelder etter kildeorden; AK-formel-eksemplet og testantall har forbehold i A06/A08.**

Kilde: S1, `docs/FASIT-AK-GOLF-HQ.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # Treningsfaglig fasit — AK Golf HQ
>
> **Omfang: treningsfag og begreper, ikke visuelt design eller lanseringsstatus.** Design velges i `designsystem/README.md`.
>
> **Status: GJELDENDE FAGLIG FASIT.** Redigert og levert av Anders 19.08.2026 (via Google Doc).
> Appen, Masterbrain og ak-second-brain rettes etter denne. Ingenting under er en regel eller
> et krav — spilleren og coachen planlegger fritt (bestemt 18.08.2026).
>
> Endringer Anders gjorde i redigeringen (bevisste valg, ikke mangler):
> - Spillerkategorier er **A–K (11 nivåer)** — L er fjernet.
> - Koden for utslag er **TEE_TOTAL**.
> - Periodenavnene er **GRUNNPERIODE** og **TURNERINGSPERIODE** (fulle navn).
> - AK-stigen, Voksen-modellen, LIFE-kodene og datastruktur-seksjonen er tatt UT av fasiten.
>
> ---
>
> ## Spillerkategorier
>
> A–K, 11 nivåer. A er best (elite). Målt på snittscore (brutto, aldri netto).
>
> | Kategori | Snittscore |
> |---|---|
> | A | under 68 |
> | B | 68–72 |
> | C | 72–74 |
> | D | 74–76 |
> | E | 76–78 |
> | F | 78–80 |
> | G | 80–85 |
> | H | 85–90 |
> | I | 90–95 |
> | J | 95–100 |
> | K | 100+ |
>
> Kategorien beskriver kun hvor spilleren er — den bestemmer ingenting om hva spilleren får trene.
>
> ## Pyramiden
>
> Nedenfra og opp. Visningsrekkefølge, ikke viktighets-hierarki.
>
> | Kode | Navn | Dekker |
> |---|---|---|
> | FYS | Fysisk | Styrke, kondisjon, mobilitet, hurtighet |
> | TEK | Teknisk | Teknisk arbeid |
> | SLAG | Golfslag | Fokus på å slå spesifikke golfslag |
> | SPILL | Spill | Banespill, strategi, scoring |
> | TURN | Turnering | Konkurranse og turneringsforberedelse |
>
> ## Treningsområder
>
> Putteavstander i fot, resten i meter. **Rettet 20.08.2026 (Anders, fase 0-korrigering):**
> putt er nå **seks** bånd (var fem — 10–40 delt i to), og FYS er nå **tre** områder (var to
> — kondisjon lagt til, mobilitet omdøpt bevegelighet). Listen er dermed **19 områder**, ikke
> 17 — «17-listen» er et historisk navn og oppdateres ikke lenger etter antallet.
>
> | Kode | Navn |
> |---|---|
> | TEE_TOTAL | Utslag |
> | INNSPILL_50 | Innspill ~50 m |
> | INNSPILL_100 | Innspill ~100 m |
> | INNSPILL_150 | Innspill ~150 m |
> | INNSPILL_200 | Innspill ~200 m |
> | CHIP | Chip |
> | PITCH | Pitch |
> | LOB | Lob |
> | BUNKER | Bunker |
> | PUTT_0_3 | Putt 0–3 fot |
> | PUTT_3_5 | Putt 3–5 fot |
> | PUTT_5_10 | Putt 5–10 fot |
> | PUTT_10_25 | Putt 10–25 fot |
> | PUTT_25_40 | Putt 25–40 fot |
> | PUTT_40_PLUSS | Putt 40+ fot |
> | STYRKE | Styrke (fysisk) |
> | KONDISJON | Kondisjon (fysisk) |
> | BEVEGELIGHET | Bevegelighet (fysisk) |
> | BANE | Banespill |
>
> Merk: koden har fortsatt en eldre liste (egen INNSPILL_0_50, putt i sju bånd, kun
> STYRKE/MOBILITET på FYS). Denne tabellen vinner — koden oppdateres til den i fase 1.
>
> ## AK-formelen
>
> Merkelappen på en økt — beskriver hva økten er, aldri et krav.
>
> ```
> PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
> ```
>
> Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRÅDE_ALENE`
>
> **Motorikk (læringssteg):**
>
> | Kode | Navn |
> |---|---|
> | UTEN_BALL | Uten ball |
> | LAV_HAST | Lav hastighet |
> | AUTO | Automatikk |
>
> **Belastning (miljø):**
>
> | Kode | Navn |
> |---|---|
> | INNEND{initialer}S | Innendørs |
> | TRENINGSOMRÅDE | Treningsområde |
> | BANE | Bane |
> | KONKURRANSE | Konkurranse |
>
> **Press (hvem som ser på):**
>
> | Kode | Navn |
> |---|---|
> | ALENE | Alene |
> | OBSERVERT | Observert |
> | KONKURRANSE | Konkurranse |
> | TURNERING | Turnering |
>
> **Utgått — skal aldri brukes i noe nytt:**
>
> | Utgått | Erstattet av |
> |---|---|
> | L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Motorikk (3 steg) |
> | CS-nivåer (CS20–CS100) | Ingenting — uavklart, ute av bruk |
> | M0–M5 | Belastning |
> | PR1–PR5 | Press |
>
> ## Periodisering
>
> Merkelapper på kalenderen — begrenser ikke hva som kan planlegges.
>
> | Kode | Typisk innhold (veiledende) |
> |---|---|
> | GRUNNPERIODE | Fundament, fysisk og teknisk byggearbeid |
> | SPESIALISERING | Slag og spissing mot sesong |
> | TURNERINGSPERIODE | Konkurranse og vedlikehold |
> | EVALUERING | Testing, analyse, planlegging av neste år |
> | TESTUKE | Samlet testgjennomføring |
> | FERIE | Fri |
> | TRENINGSSAMLING | Samling (dagsformat) |
> | HELDAGSSAMLING | Samling (heldagsformat) |
>
> 4-ukers rytme (valgfritt mønster, ikke regel): BYGG → BYGG → TOPP → DELOAD
>
> ## Treningsblokk-merker
>
> Lagt til 20.08.2026 (Anders, spec-intervjuet treningsplanlegging). Merker for strekninger
> mellom holdepunkter — typisk ukene mellom to turneringer. Frie merkelapper, aldri krav.
>
> | Merke | Typisk fokus (veiledende) |
> |---|---|
> | UTVIKLING | Utviklingsarbeid — tekniske oppgaver, volum |
> | FORBEREDELSER | Spissing mot kommende turnering |
> | KONKURRANSE | Turneringsspill |
>
> Settes i kalenderen med **fritt datospenn** — ikke låst til kalenderuker. Eksempel: torsdag
> 20.08 til fredag 28.08 merkes UTVIKLING; strekningen kan deles opp (f.eks. 4 dager
> FORBEREDELSER, deretter KONKURRANSE). Fokusområdene skifter med merket — hva det øves på er
> forskjellig i de tre.
>
> ## Turneringer
>
> **Påmeldingsstatus:**
>
> | Status | Navn |
> |---|---|
> | PLANNED | Planlagt |
> | CLAIMED_REGISTERED | Påmeldt |
> | CONFIRMED | Bekreftet |
> | WITHDRAWN | Trukket |
> | COMPLETED | Gjennomført |
> | DNF | Ikke fullført |
>
> **Forberedelsesvariant:** konservativ · standard · aggressiv
>
> **Datakilder:** NGF · GolfBox-scraper (Olyo, Østlandstour, GJGT). Hentes alltid, estimeres aldri.
>
> ## Blokk-typer i kalenderen
>
> | Type | Merknad |
> |---|---|
> | Økt | Treningsøkt |
> | Skole | Vises dimmet og låst |
> | Booking | Coachtime/fasilitet, fra booking-systemet |
> | Turnering | Turneringsdeltakelse |
> | Reise | Reisetid |
> | Test | Testgjennomføring |
> | Sjekkpunkt | Avtale/merkedag |
> | Helse | Helse/restitusjon |
> | Gruppeøkt | Fellesøkt, coach eier |
>
> ## Grupper og programmer
>
> **Programmer:**
>
> | Program |
> |---|
> | WANG Toppidrett |
> | WANG Ung |
> | GFGK Mini |
> | GFGK Bredde |
> | GFGK Jenter |
> | GFGK Elite |
> | AK Academy |
> | AK Academy Junior |
> | Platform only |
>
> ## Tester
>
> 31 testprotokoller i databasen. Spilleren ser 21 CANON-rader + egne tester.
> Frivillige verktøy — aldri et krav for å trene noe.
>
> Mangler: liste over hvilke 21 av 31 spilleren ser, og hvorfor 10 er skjult.
>
> ## P-posisjoner (MORAD)
>
> Beskrivende teknisk språk — ikke krav til spilleren.
>
> | Posisjon | Navn |
> |---|---|
> | P1.0 | Address |
> | P2.0 | Skaft parallelt tilbake |
> | P3.0 | Venstre arm parallell tilbake |
> | P4.0 | Topp |
> | P5.0 | Venstre arm parallell ned |
> | P6.0 | Skaft parallelt ned |
> | P7.0 | Impact |
> | P8.0 | Skaft parallelt gjennom |
> | P9.0 | Høyre arm parallell gjennom |
> | P10.0 | Finish |
>
> Faste kjennetegn (fagkunnskap, ikke krav): venstre albue rett frem til P8 · release via
> sentrifugalkraft, ikke bevisst innsats · hoftene leder nedsvingen P6–P8 · venstre hæl i
> bakken gjennom alle posisjoner.
>

### 8.2 Utfyllende planleggingsvokabular

**FAGKILDE – senere uttrykkelige beslutninger beholdes. Påstander om hva kode/databasen inneholdt 08.09 er historiske observasjoner, ikke ny verifisering.**

Kilde: S2, `docs/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # Ordbok — treningsplanlegging i AK Golf HQ
>
> **Laget:** 08.09.2026. **Dette er nå den nyeste og eneste ordforråds-fasiten** for hvordan
> trening merkes og planlegges i plattformen — den erstatter `vokabular-planlegging-2026-08-18.md`
> og §4 i `ordbok-ak-golf-konsept.md`, som viste seg utdatert (se `AUDIT-DOCS-2026-09-08.md`).
>
> Kilde: `docs/FASIT-AK-GOLF-HQ.md` (levert av deg 19.08.2026, rettet 20.08.2026) + verifisert
> direkte mot `prisma/schema.prisma` og `src/lib/domain/ak-formel-v2.ts` i dag. Der noe var
> uklart eller motstridende, står det markert under.
>
> **Grunnprinsippet, uforandret siden 18.08.2026: ingenting her er en regel eller et krav.**
> Det er ordforrådet plattformen bruker for å merke og organisere planlegging — ikke tak, ikke
> minimumskrav, ikke noe som stopper deg eller spilleren fra å planlegge fritt.
>
> ---
>
> ## 1. Pyramiden — de fem treningsområdene
>
> Grunnmuren. Rekkefølgen (FYS nederst, TURN øverst) er en visningsrekkefølge — ikke et
> viktighets-hierarki, og ingen prosentgrenser håndheves lenger.
>
> | Kode | Navn | Dekker |
> |---|---|---|
> | FYS | Fysisk | Styrke, kondisjon, mobilitet, hurtighet |
> | TEK | Teknisk | Teknisk svingarbeid |
> | SLAG | Golfslag | Fokus på å slå spesifikke golfslag |
> | SPILL | Spill | Banespill, strategi, scoring |
> | TURN | Turnering | Konkurranse og turneringsforberedelse |
>
> ## 2. Treningsområder — hvor på banen/anlegget (19 stk)
>
> **Rettet av deg 20.08.2026:** putt ble seks bånd (var fem — 10–40 fot delt i to), og FYS ble
> tre områder (var to — kondisjon lagt til, mobilitet omdøpt bevegelighet). Antallet er **19**,
> ikke 17 — det gamle tallet er historisk og skal ikke siteres lenger.
>
> Putteavstander i fot, resten i meter.
>
> | Kode | Navn | Familie | Enhet | Hva en rep er |
> |---|---|---|---|---|
> | TEE_TOTAL | Utslag | Fullsving | m | Slag |
> | INNSPILL_200 | Innspill ~200 m | Fullsving | m | Slag |
> | INNSPILL_150 | Innspill ~150 m | Fullsving | m | Slag |
> | INNSPILL_100 | Innspill ~100 m | Fullsving | m | Slag |
> | INNSPILL_50 | Innspill ~50 m | Fullsving | m | Slag |
> | CHIP | Chip | Nærspill | m | Slag |
> | PITCH | Pitch | Nærspill | m | Slag |
> | LOB | Lob | Nærspill | m | Slag |
> | BUNKER | Bunker | Bunker | m | Slag |
> | PUTT_0_3 | Putt 0–3 fot | Putt | ft | Putter |
> | PUTT_3_5 | Putt 3–5 fot | Putt | ft | Putter |
> | PUTT_5_10 | Putt 5–10 fot | Putt | ft | Putter |
> | PUTT_10_25 | Putt 10–25 fot | Putt | ft | Putter |
> | PUTT_25_40 | Putt 25–40 fot | Putt | ft | Putter |
> | PUTT_40_PLUSS | Putt 40+ fot | Putt | ft | Putter |
> | STYRKE | Styrke | FYS | — | Serier/reps |
> | KONDISJON | Kondisjon | FYS | — | Segmenter (f.eks. «5 drag á 4 min i sone 4», ikke ett varighetstall) |
> | BEVEGELIGHET | Bevegelighet | FYS | — | Tid (enkel timer, ingen segmenter) |
> | BANE | Banespill | Bane | — | Hull |
>
> Området er uavhengig av pyramiden — en BANE-drill kan stå under TEK, SLAG, SPILL eller TURN.
> «Familie» styrer kun hvilke felter området har (relevans-matrise), ikke pyramide-tilhørighet.
>
> **Kjent, ikke rettet:** en eldre 16–17-liste (`src/lib/taxonomy.ts`) driver fortsatt deler av
> eksisterende UI med andre koder (`TEE`, `INN200`, `PUTT0_3` i andre grenser). Denne tabellen
> er fasiten — den gamle listen skal fases ut, ikke siteres som gjeldende.
>
> ## 3. AK-formelen — merkelappen på en økt/drill
>
> ```
> PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
> ```
>
> Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRÅDE_ALENE`
>
> Bæres av hver enkelt drill/øvelse/test — ikke av økten som helhet.
>
> ### 3.1 Motorikk (læringssteg — gjelder KUN fullsving)
>
> | Kode | Navn |
> |---|---|
> | UTEN_BALL | Uten ball |
> | LAV_HAST | Lav hastighet |
> | AUTO | Automatikk |
>
> *Club Speed-unntak (01.09.2026): Club Speed-trening klassifiseres alltid AUTO. «Uten ball» der
> er en egenskap ved øvelsen (hastighetstrening med stav/kølle), ikke motorikk-steget UTEN_BALL —
> ikke bland disse to.*
>
> ### 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1)
>
> | Kode | Navn |
> |---|---|
> | INNEND{initialer}S | Innendørs |
> | TRENINGSOMRÅDE | Treningsområde |
> | BANE | Bane |
> | KONKURRANSE | Konkurranse |
>
> ### 3.3 Press (hvem som ser på)
>
> | Kode | Navn |
> |---|---|
> | ALENE | Alene |
> | OBSERVERT | Observert |
> | KONKURRANSE | Konkurranse |
> | TURNERING | Turnering |
>
> ### 3.4 Egne teknikk-dimensjoner (analysens sjette akse — erstatter/supplerer motorikk)
>
> Lagt til 20.08.2026. En drill bærer kun ÉN av disse. Fullsving-kodene matcher TrackMan-
> parametrene 1:1 (Truth Layer-kobling uten oversettelseslag): startretning = Launch Direction,
> kurve = Spin Axis, høyde = Apex, treffpunkt = Face-to-Path.
>
> SIKTE · STARTRETNING · KURVE · HØYDE · TREFFPUNKT · LENGDEKONTROLL · SPINN · LANDINGSPUNKT ·
> UTRULLING · KØLLEVALG · BOUNCE_BRUK · SANDINNGANG · LIE_VARIASJON · GREENLESING · BALLSTART ·
> SPILLEFORMAT · STRATEGIOPPGAVE
>
> **Sand-trappen** (bunkerens motstykke til motorikk): UTEN_BALL_I_SAND → MED_BALL.
>
> ### 3.5 Utgått — skal ALDRI brukes i noe nytt
>
> | Utgått | Erstattet av |
> |---|---|
> | L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Motorikk (3 steg, §3.1) |
> | CS-nivåer (CS50–CS100) | Ingenting — uavklart, ute av bruk. Spør deg før noe nytt bruker CS. |
> | M0–M5 | Belastning (§3.2) |
> | PR1–PR5 | Press (§3.3) |
>
> Disse fire ligger fortsatt i databasen som **historiske lesefelter** (gamle rader har dem) —
> koden er eksplisitt merket «bruk aldri i ny kode».
>
> ## 4. Periodisering — årets rytme
>
> Merkelapper på kalenderen — begrenser ikke hva som kan planlegges i dem.
>
> | Kode | Typisk innhold (veiledende, ikke krav) |
> |---|---|
> | GRUNNPERIODE | Fundament, fysisk og teknisk byggearbeid |
> | SPESIALISERING | Slag og spissing mot sesong |
> | TURNERINGSPERIODE | Konkurranse og vedlikehold |
> | EVALUERING | Testing, analyse, planlegging av neste år |
> | TESTUKE | Samlet testgjennomføring |
> | FERIE | Fri |
> | TRENINGSSAMLING | Samling (dagsformat) |
> | HELDAGSSAMLING | Samling (heldagsformat) |
>
> 4-ukers rytme (valgfritt mønster, ikke regel): BYGG → BYGG → TOPP → DELOAD.
>
> **Merk:** periodenavnene er de FULLE ordene (GRUNNPERIODE, TURNERINGSPERIODE) — ikke GRUNN/
> TURNERING som en tidligere versjon av dokumentet sa.
>
> ## 5. Treningsblokk-merker (nye 20.08.2026)
>
> Merker for **strekninger** mellom holdepunkter — typisk ukene mellom to turneringer. Frie
> merkelapper, aldri krav. Settes i kalenderen med fritt datospenn, ikke låst til kalenderuker
> — en strekning kan deles opp (f.eks. 4 dager FORBEREDELSER, deretter KONKURRANSE).
>
> | Merke | Typisk fokus (veiledende) |
> |---|---|
> | UTVIKLING | Utviklingsarbeid — tekniske oppgaver, volum |
> | FORBEREDELSER | Spissing mot kommende turnering |
> | KONKURRANSE | Turneringsspill |
>
> ## 6. Turneringer
>
> **Påmeldingsstatus:**
>
> | Kode | Navn |
> |---|---|
> | PLANNED | Planlagt |
> | CLAIMED_REGISTERED | Påmeldt (venter dobbel bekreftelse) |
> | CONFIRMED | Bekreftet |
> | WITHDRAWN | Trukket |
> | COMPLETED | Gjennomført |
> | DNF | Startet, men trakk |
>
> **Forberedelsesvariant:** konservativ · standard · aggressiv.
>
> **Datakilder:** NGF · GolfBox-scraper (Olyo, Østlandstour, GJGT). Hentes alltid, estimeres
> aldri.
>
> ## 7. Blokk-typer i kalenderen
>
> | Type | Merknad |
> |---|---|
> | Økt | Treningsøkt |
> | Skole | Vises dimmet og låst |
> | Booking | Coachtime/fasilitet, fra booking-systemet |
> | Turnering | Turneringsdeltakelse |
> | Reise | Reisetid |
> | Test | Testgjennomføring |
> | Sjekkpunkt | Avtale/merkedag |
> | Helse | Helse/restitusjon |
> | Gruppeøkt | Fellesøkt, coach eier |
>
> ## 8. Spillerkategori — hvor spilleren er
>
> ** Uavklart mellom fasit og kode akkurat nå (funnet 08.09.2026, se AUDIT-DOCS-2026-09-08.md):**
>
> - `FASIT-AK-GOLF-HQ.md` (din redigering 19.08): **A–K, 11 nivåer** — du fjernet L bevisst.
> - Koden (`NgfKategori`-enum i skjemaet, brukes til nivådifferensiering av drills/plan-maler):
>   fortsatt **A–L, 12 nivåer** — ikke rettet ennå.
>
> Fasitens 11-nivå-tabell (målt på brutto snittscore, aldri netto):
>
> | Kategori | Snittscore |
> |---|---|
> | A | under 68 |
> | B | 68–72 |
> | C | 72–74 |
> | D | 74–76 |
> | E | 76–78 |
> | F | 78–80 |
> | G | 80–85 |
> | H | 85–90 |
> | I | 90–95 |
> | J | 95–100 |
> | K | 100+ |
>
> Kategorien beskriver kun hvor spilleren er — den bestemmer ingenting om hva spilleren får trene.
> **Bruk denne 11-nivå-tabellen som riktig inntil du har avgjort om koden skal rettes til A–K
> eller fasiten tilbake til A–L.**
>
> ## 9. Grupper og programmer
>
> | Program |
> |---|
> | WANG Toppidrett |
> | WANG Ung |
> | GFGK Mini |
> | GFGK Bredde |
> | GFGK Jenter |
> | GFGK Elite |
> | AK Academy |
> | AK Academy Junior |
> | Platform only (selvbetjent, ingen coachrelasjon) |
>
> **AK-stigen (juniorutvikling, implementert i kode):** Mini (under 10) → Basis (10–12) →
> Utvikling (13–15) → Elite (16–19).
>
> **Voksen-modellen «Veien til lavere score» (kun beskrivende, ikke funnet i kode/data ennå):**
> Nybegynner → D (120–110) → C (100–90) → B (90–80) → A (80–70).
>
> ## 10. Tester
>
> 31 testprotokoller i databasen. Spilleren ser 21 CANON-rader + egne tester. Frivillige
> verktøy — aldri et krav for å trene noe.
>
> **Åpent hull, ikke noe du trenger å gjøre noe med nå:** hvilke 21 av 31 spilleren faktisk ser,
> og hvorfor de resterende 10 er skjult, står uspesifisert selv i fasit-dokumentet.
>
> ## 11. P-posisjoner (MORAD — teknisk språk)
>
> Beskrivende språk til teknisk plan og videoanalyse — ikke krav til spilleren.
>
> P1.0 Address → P2.0 Skaft parallelt tilbake → P3.0 Venstre arm parallell tilbake →
> P4.0 Topp → P5.0 Venstre arm parallell ned → P6.0 Skaft parallelt ned → P7.0 Impact →
> P8.0 Skaft parallelt gjennom → P9.0 Høyre arm parallell gjennom → P10.0 Finish
>
> Faste kjennetegn (fagkunnskap, ikke krav): venstre albue rett frem til P8 · release via
> sentrifugalkraft, ikke bevisst innsats · hoftene leder nedsvingen P6–P8 · venstre hæl i
> bakken gjennom alle posisjoner.
>
> ## 12. LIFE-koder (mennesket i treningen)
>
> **Kun beskrivende — null treff i kode per 08.09.2026, ikke implementert som data noe sted.**
>
> LIFE-SELV (selvfølelse) · LIFE-SOS (sosialt) · LIFE-EMO (emosjonelt) · LIFE-KAR (karakter) ·
> LIFE-RES (resiliens)
>
> ---
>
> ## Det som IKKE lenger finnes (opplåst 18.08.2026 — gjenta aldri uten ny beslutning fra deg)
>
> - De 9 invariantene (TEK-minimum, CS-tak, aldersregel, L-fase-begrensninger, volum-tak,
>   pyramide-maks, hviledager, svingendrings-tak, CS50-krav)
> - PERIODE_CONSTRAINTS (min/maks-prosenter per periode, ukevolum-grenser, praksistype-fordeling)
> - Plan-validering av AI-forslag mot regler, «Invariantbrudd»-varsler, «Overstyr med
>   begrunnelse»-mekanikken
> - CANON som overstyrende fasit-begrep
>
> Spilleren og coachen planlegger fritt. Systemets jobb er å gjøre planlegging enkel og
> oversiktlig — ikke å vokte den.
>
> ---
>
> ## Utenfor dette dokumentet
>
> Dette dekker **planleggings-vokabularet** — det plattformen faktisk bruker til å merke og
> organisere trening. To ting er bevisst holdt utenfor, fordi de er noe annet:
>
> - **Dyp MORAD-fagkunnskap** (svingfeil, drill-bibliotek, diagnostiske regler) ligger i
>   `~/Developer/ak-second-brain/wiki/concepts/morad-*` — coaching-metodikk, ikke planleggings-taksonomi.
> - **AI-lagets kunnskapsbase** (`src/lib/masterbrain/knowledge/concepts/`: canon-methodology,
>   LTAD-rammeverk, SG-prinsipper m.fl.) er det Caddie/AI-agentene faktisk leser — egen kilde,
>   egen oppdateringssyklus.
>
> Si ifra hvis du vil ha disse to også kartlagt i eget dokument — det er en annen jobb enn denne.
>

## 9. Skjermtekst, merkespråk og e-post

Ordlyd fra tidligere leveranser er bevart for at gjennomgangen skal dekke konkrete setninger, ikke bare substantiver. Eksempeltall er ikke reelle spillerresultater eller økonomidata. Ikke publiser dem som fakta. Eldre statusord som «FERDIG» og «låst» gjelder kildens egen daterte kontekst, ikke automatisk dagens app.

### 9.1 Hovedskjermtekster fra tidligere leveranse

**BLANDET / HISTORISK TEKSTUNDERLAG – ikke kopier utgått prøveperiode, prisfordeler, kategorieksempler, treningskoder, fasitfonter eller navigasjon ukritisk. S6/S7/S9 og dagens designvalg overstyrer.**

Kilde: S5, `docs/skjermtekst/skjerm-tekst-hovedskjermer.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # Skjerm-tekst — alle flater (copy-deck)
>
> > **DESIGN-REFERANSENE SUPERSEDERT 25.08.2026:** Train-lock er designfasit for alle
> > PlayerHQ/AgencyOS-skjermer — «Claude Paper vinner alltid»- og font-linjene under er
> > historikk. Selve UI-COPYEN (norsk tekst, ordbok-basert) gjelder fortsatt som copy-kilde.
>
> Den faktiske norske teksten som står PÅ skjermene, for **PlayerHQ** (spiller),
> **AgencyOS** (coach) og **markedsflatene** (akgolf.no). Styrt av ordboken
> (`docs/design-guide-terminologi.md` lag 2 + `docs/ordbok-ak-golf-konsept.md` lag 1).
> Skrevet 5. juli 2026. Kopier rett inn i design/implementasjon.
>
> > ** Dette dokumentet eier TEKST, ikke utseende (presisert 05.08.2026; utseende-regelen
> > oppdatert 25.08.2026).** Punktene om font, knappeform og farge under er fra den avviklede
> > Presis-æraen. Utseende styres nå av **Train-lock** (25.08.2026 — alle PlayerHQ/AgencyOS-
> > skjermer; 05.08-regelen «Claude Paper vinner alltid» er historikk). Bruk denne fila kun til
> > ordlyd, tallformat og rolle-regler.
>
> > **UTGÅTT (se `.claude/rules/beslutninger.md`, «ALLE TRENINGSPLANREGLER LÅST OPP», 2026-08-18):**
> > drill-kode-eksemplene med L-BALL/CS70/M2/PR2 under viser et pensjonert format. Gjeldende
> > v2-format er `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS` (motorikk UTEN_BALL/LAV_HAST/AUTO,
> > press ALENE/OBSERVERT/KONKURRANSE/TURNERING). Club Speed (Anders, 2026-09-01): motorikk AUTO,
> > «uten ball» er en egenskap ved øvelsen, ikke eget motorikk-steg.
>
> **Rolle-regel (viktig):** Spiller ser KUN klarspråk (Innspill/Nærspill, «% av maksfart»).
> Coach ser kode + navn (`TEK · INN150 · L-BALL · CS70 · M2 · PR2`). Markedsflatene bruker
> ekte coach **{offentlig coachnavn}** (aldri demo-spilleren), humanisert tekst uten em-strek.
>
> ## Fasit-regler brukt her (fra ordboken)
> - **Demo-spiller:** {spiller A} · HCP **+3,5** · **Kategori A** (A = beste, tour-nær — governing beslutning fra design-handoveren i juni 2026 — mappa `public/design-handover/` er siden
> slettet, beslutningen står ved lag; ordbokens «A=nybegynner» er forkastet).
> - **SG:** fortegn ALLTID (+/−), komma, ekte minus «−», klarspråk-label: Tee-slag · Innspill · Nærspill · Putting.
> - **Avstander:** innspill i **meter**, putting i **fot (ft)**.
> - **Tall:** komma-desimal, mellomrom-tusenskille, `73 %` (mellomrom før %), 24-t klokke, tankestrek i perioder.
> - **Tomtilstand:** verdi `—` + ærlig subtekst, aldri oppdiktet tall.
> - **Knapper:** tekst per ordbok-tabell. Form og størrelse følger Train-lock
>   (`DESIGN-SYSTEM.md` knappe-matrise) — Paper `--r-sm` 8px og «rounded-full pill, mono 12px» er utgått.
> - **Font:** Poppins (UI/titler), Lora (prosa), IBM Plex Mono (tall). Familjen Grotesk,
>   Inter og Inter Tight er utgått.
> - **Ingen emoji.** Lucide-ikoner.
>
> ---
>
> ## 1. HJEM (`/portal`)
>
> **Tier-pill:** `PlayerHQ · PRO`
> **Eyebrow (dato):** `SØN 6. JULI · 08:20`
> **Hero-tittel:** God morgen, *{spiller A}.*  (italic på fornavn)
> **Undertekst:** Én økt i dag. Største gevinst ligger fortsatt i innspill.
>
> **NesteFokusKort (dommen):**
> - Eyebrow: `NESTE FOKUS`
> - Verdikt (display): Innspill 50–100 m er største lekkasje
> - Bevis: ` −0,8 slag` · Innspill · mot Broadie scratch
> - Forklaring: Du taper mest fra kort avstand inn. Én innspill-økt i uka lukker mesteparten av gapet mot Tour-snitt.
> - Benchmark (elite): `Tour-snitt: +0,4 slag`
> - Handling (knapp): Legg inn innspill-økt
>
> **Start-CTA (lime primary + play):** Start økt
>
> **SgTotalKort:**
> - Eyebrow: `SG TOTAL`
> - Verdi: `+2,4` `slag` · trend ` +0,4`
> - Meta: siste 12 runder · mot Broadie scratch
> - Forklaring: Formen stiger — du henter mest på tee og putting.
>
> **KPI-strip (mono):** `SG TOTALT +2,4` · `RUNDER 12` (siste 90 d) · `SNITTSCORE 72,4`
>
> **Dagens plan:**
> - Eyebrow: `DAGENS PLAN`
> - Økt-rad: Innspill 200–50 · `09:00 · 2 drills · 60 min`
>
> **Coach-notat:**
> - Eyebrow: `COACH`
> - Navn: {coachnavn} · `HEAD COACH` · `3 t`
> - Melding: «Denne uka prioriterer vi innspill fra 50–100 meter — der ligger den største SG-gevinsten din nå.»
>
> **Tomtilstander:**
> - Ingen økt i dag: «Ingen økt planlagt i dag.» + knapp «Planlegg økt →»
> - Ingen SG ennå: verdi `—` + «Spill din første runde for å se hvor slagene tapes og vinnes.»
>
> ---
>
> ## 2. ANALYSE — «Min golf» (`/portal/analysere`)
>
> **Eyebrow:** `ANALYSE · NIVÅ-DIAGNOSE`
> **Hero-tittel:** Strokes gained *i dybden*
> **Undertekst:** {spiller A} · HCP +3,5
>
> **Faner:** Oversikt · Strokes gained · TrackMan · Runder · Tester · Nivå
>
> **SgKategoriBar (SG per kategori):**
> - Eyebrow: `SG PER KATEGORI` · `mot Broadie scratch`
> - Rader: Tee-slag `+0,6` · Innspill `−0,8` *(størst tap)* · Nærspill `+0,3` · Putting `+1,1`
>
> **Nivå-diagnose:**
> - Eyebrow: `DITT NIVÅ NÅ`
> - Nivå (display): Kategori A · tour-nær
> - Meta: snittscore 72,4 · siste sesong
> - (Ingen «til neste nivå» når spilleren er på toppkategori — vis i stedet «Hold nivået»-benchmark mot Tour.)
>
> **Tomtilstand (ingen runder i år):** `DITT NIVÅ NÅ` + «Logg runder denne sesongen for å se nivået ditt og hva som skal til videre.»
>
> ---
>
> ## 3. GJENNOMF{initialer}E (`/portal/gjennomfore`)
>
> **Eyebrow:** `GJENNOMF{initialer}E`
> **Hero-tittel:** Dagens *program*
> **Metalinje:** Lørdag 6. juli · 3 økter · 2 t 15 min totalt
>
> **Neste økt (forest-hero):**
> - Eyebrow: `PÅGÅR · 09:00` (eller `NESTE · 09:00 · OM 40 MIN`)
> - Tittel: Innspill 200–50 *med {coachnavn}*
> - Meta: Coach: {coachnavn} · Sted: Oslo GK · Drills: 2
> - Knapp: Fortsett økt / Start økt
>
> **Seksjoner:** `RESTEN AV DAGEN` · `FULLF{initialer}T I DAG`
> - Rad-knapper: Start · Logg
> - Status: `Logget` (grønn hake)
>
> **Tomtilstand:** «Ingen økter planlagt i dag.» + «Planlegg i Workbench →»
>
> ---
>
> ## 4. PLANLEGGE (Workbench-inngang)
>
> **Eyebrow:** `MIN WORKBENCH`
> **Hero-tittel:** Min *plan*
> **Undertekst:** Teknisk plan, sesongmål og uke — lagt av Anders, gjennomført av deg.
>
> **Knapper:** Åpne uke → · Se teknisk plan → · Se sesongmål →
> **Tomtilstand:** «Ingen aktiv plan ennå. Coachen setter opp din første plan.»
>
> ---
>
> ## 5. MEG (`/portal/meg`)
>
> **Avatar-pill:** `PlayerHQ · PRO`
> **Navn:** {spiller A} · `HCP +3,5 · Oslo GK`
> **Stat-fliser:** `HCP +3,5` · `STREAK 6 d` · `RUNDER 12`
>
> **Seksjoner (eyebrow):** `KONTO` · `VARSLER` · `TRENING` · `MER` · `ABONNEMENT`
> - Konto: Rediger profil (Navn, e-post, foto) · Sikkerhet (Passord, 2FA, aktive økter)
> - Varsler: Push-varsler (Nye meldinger fra coach) · E-postvarsler (Ukessammendrag)
> - Trening: Utstyrsbag · Helse · Dokumenter · Bookinger
> - Abonnement: Oppgrader til Pro — `299 kr/mnd · Video + prioritet`
> - Knapp: Logg ut
>
> ---
>
> ---
>
> # AgencyOS (coach — `/admin/*`)
>
> Mørkt tema, data-tett (Bloomberg-tetthet), desktop-først. Coach ser fagkoder + navn.
> **To tall, aldri blandet:** PLAN-KVALITET (0–100) og GJENNOMF{initialer}ING (%) er separate hero-tall.
>
> ## A1. Cockpit (`/admin/agencyos`)
> **Eyebrow:** `COACH BRIEFING · MANDAG`
> **Hero-tittel:** God morgen, *Anders.*
> **Undertekst:** 38 spillere i stallen. 3 trenger oppfølging i dag.
> **KPI-strip (mono):** `STALL-SG +0,8` · `PLAN-KVALITET 86` · `GJENNOMF{initialer}ING 73 %` · `AKTIVE PLANER 24`
> **Handlingssenter-kort:** `HANDLINGSSENTER` · «3 spillere trenger oppfølging» · knapp «Åpne →»
> **Neste økt-rad:** `NESTE · 09:00` · Innspill 200–50 · med {spiller A} · Oslo GK
> **Tomtilstand:** verdi `—` + «Ingen forfalte oppgaver.»
>
> ## A2. Stall (`/admin/stall`)
> **Eyebrow:** `MIN STALL`
> **Hero-tittel:** Min *stall*
> **Undertekst:** 38 aktive spillere · sortert etter oppfølgingsbehov
> **Spillerkort:** {spiller A} · `HCP +3,5 · KAT A` · SG-tilstand-prikk (lime = økt i dag, coral = haster)
> **Filter:** Alle · Trenger oppfølging · NM-spor · Junior
> **Tomtilstand:** «Ingen spillere i stallen ennå.»
>
> ## A3. Workbench (`/admin/coach-workbench`)
> **Eyebrow:** `MIN WORKBENCH`
> **Hero-tittel:** Min *workbench*
> **Undertekst:** Bygg og følg planer for hele stallen.
> **7 hub-faner:** Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt · Uke · Økt
> **Drill-koder (coach ser fagkode):** `TEK · INN150 · L-BALL · CS70 · M2 · PR2` — UTGÅTT format,
> se `.claude/rules/beslutninger.md` 2026-08-18. Gjeldende: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`.
> **Compliance-badge:** hake (på plan) · kryss (avvik) · minus (ikke gjennomført)
> **Knapper:** Lagre · Dupliser uke · Legg til drill
>
> ## A4. Handlingssenter / Oppgaver (`/admin/handlingssenter`)
> **Eyebrow:** `HANDLINGSSENTER`
> **Hero-tittel:** Dine *oppgaver*
> **View-toggle:** Liste · Kanban · Kalender
> **Kolonner:** Å gjøre · Pågår · Venter · Ferdig
> **Tomtilstand:** «Ingen åpne oppgaver. Godt jobba.»
>
> ## A5. Varsler (`/admin/varsler`)
> **Eyebrow:** `MINE VARSLER`
> **Hero-tittel:** Dine *varsler*
> **Varsel-eksempel:** «Sterkt avvik: {spiller A} droppet innspill-økt i går.» · `HASTER`
> **Regel:** Avvik informerer Plan-kvalitet; sterkt avvik varsler coach automatisk. Aldri sperre.
>
> ## A6. Økonomi (`/admin/okonomi`)
> **Eyebrow:** `ØKONOMI`
> **Hero-tittel:** Din *oversikt*
> **KPI:** `MRR COACHING 47 250 kr` · `AKTIVE ABONNEMENT 32` · `FORFALT 3`
> **Pakker:** GRATIS · PRO `299 kr/mnd` · PRO årlig `2 690 kr`
> **Tomtilstand:** verdi `—` + «Ingen transaksjoner ennå.»
>
> ## A7. Kalender · Innboks (kort)
> **Kalender-eyebrow:** `KALENDER · UKE 27` — Hero: Din *uke*
> **Innboks-eyebrow:** `INNBOKS` — Hero: Din *innboks* · «Ingen uleste meldinger.»
>
> ---
>
> # Markedsflater (akgolf.no)
>
> Humanisert, salgs-tekst, **ingen em-strek** som setnings-kobling. Ekte coach **{offentlig coachnavn}**.
> Aldri demo-spilleren her. Priser: GRATIS · PRO 299 kr/mnd · PRO årlig 2 690 kr.
>
> ## M1. Forside (`/`)
> **Eyebrow:** `AK GOLF`
> **Hero-tittel:** Tren på det du *trenger*
> **Undertekst:** Strokes gained, plan og coach i samme app. Se hvor du taper slag, og få en plan som lukker gapet.
> **Primær-CTA:** Kom i gang gratis
> **Sekundær:** Se hvordan det virker →
> **Bevis-linje:** Brukt av spillere fra junior til aspirerende Tour.
>
> ## M2. PlayerHQ-produktside (`/playerhq`)
> **Eyebrow:** `PLAYERHQ`
> **Hero-tittel:** Din golf, *målt og planlagt*
> **Undertekst:** Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke generiske råd.
> **Seksjoner:** Strokes gained i dybden · Plan fra coachen din · Følg fremgangen
> **CTA:** Prøv gratis i én måned
>
> ## M3. Coaching (`/coaching`)
> **Eyebrow:** `COACHING`
> **Hero-tittel:** Coaching som *ser hele spilleren*
> **Coach-navn:** {offentlig coachnavn} · Head Coach, AK Golf Academy
> **Undertekst:** Personlig oppfølging bygget på data, ikke magefølelse.
> **CTA:** Book en samtale
>
> ## M4. Priser (`/priser`)
> **Eyebrow:** `PRISER`
> **Hero-tittel:** Enkelt og *ærlig*
> **Gratis:** `0 kr` — «Prøveperiode, eller inkludert i coaching-pakke.»
> **Pro:** `299 kr/mnd` — «Full app: strokes gained, plan, video, prioritet.»
> **Pro årlig:** `2 690 kr/år` — «To måneder gratis.»
> **Note:** Coaching-pakker (antall økter) kjøpes separat. Ikke app-nivåer.
> **CTA:** Velg Pro
>
> ## M5. Booking (`/booking`)
> **Eyebrow:** `BOOK TID`
> **Hero-tittel:** Book en *time*
> **Undertekst:** Velg coach, dag og ledig tid.
> **CTA:** Bekreft booking
> **Tomtilstand:** «Ingen ledige tider denne uka. Prøv neste uke →»
>
> ---
>
> ## Forbudte ord (ordbok B24) — bruk aldri i UI-tekst
> «kortspill» (→ Nærspill) · «øving» (→ trening) · «request/log new» (norsk) · «Performance/Performance Pro» som app-nivå · «ELITE» · «brudd/overstyr/krever begrunnelse» (anbefaling, aldri sperre) · emoji.
>

### 9.2 Merkets språk og parameterregler

**SPRÅKKILDE – parameterregelen gjelder på tvers av norsk tekst; øvrige markedsregler har sitt angitte omfang. Juridiske og faglige påstander er kildens ordlyd, ikke ny juridisk/faglig vurdering.**

Kilde: S7, `designsystem/ak-golf/guidelines/08-sprak.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # 8 · Språket
>
> AK Golf høres ut som Anders. Det er den ene tingen ingen konkurrent kan kopiere.
>
> ## Slik snakker vi
>
> - **Direkte.** Poenget først, forklaringen etter.
> - **Presist.** «Åtte av ti 7-jern lander høyre for pinnen» slår «du sliter med
>   retningen».
> - **Faguttrykk beholdes, men forklares i setningen etter.**
> - **Vi sier ifra når noe ikke virker.** Nyttig motstand foran høflig enighet.
> - **Korte setninger.** Én tanke om gangen.
>
> ## Slik snakker vi aldri
>
> | Aldri | Fordi |
> |---|---|
> | «Ta golfen din til neste nivå» | Sier ingenting. Kunne stått hos hvem som helst |
> | «Vi brenner for golf» | Alle sier det. Ingen tror det |
> | «Unlock your potential» | Engelsk floskel i norsk tekst |
> | «Garantert 5 slag lavere» | Umulig å måle rettferdig, og ulovlig å love |
> | Utropstegn og emoji | Skriker. AK Golf trenger ikke skrike |
>
> ## TrackMan-parametere skrives på engelsk
>
> Låst av Anders 01.09.2026. **Alle TrackMan-parametere beholder sitt engelske
> navn og skrives med stor forbokstav**, også i norsk løpende tekst. Det heter
> **Attack Angle**, aldri «angrepsvinkel» og aldri «attack angle».
>
> Grunnen er at det engelske navnet er navnet. Spilleren ser det på skjermen i
> økta, det står i rapporten, og det er ordet coacher over hele verden bruker.
> En norsk oversettelse skaper et andre vokabular som ingen andre bruker — og
> gjør spilleren dårligere rustet neste gang hen står foran en TrackMan.
>
> **Slik gjøres det:** behold parameteren på engelsk, forklar hva den betyr på
> norsk i setningen etter.
>
> > Attack Angle −3,2° med driver. Køllehodet går nedover i treffet.
>
> Ikke:
>
> > ~~Angrepsvinkelen din er −3,2°.~~
> > ~~attack angle −3,2°~~
>
> ### De vanligste
>
> | Parameter | Aldri |
> |---|---|
> | Attack Angle | angrepsvinkel, angle of attack |
> | Club Path | køllebane, svingbane |
> | Face Angle | bladvinkel, køllefjes |
> | Face to Path | — |
> | Dynamic Loft | dynamisk loft |
> | Smash Factor | treffprosent |
> | Ball Speed · Club Speed | ballfart, køllefart |
> | Launch Angle | utgangsvinkel |
> | Spin Rate | spinn, spinnmengde |
> | Spin Axis | spinnakse |
> | Carry · Total | bærelengde |
> | Dispersion | spredning |
> | Landing Angle | landingsvinkel |
> | Low Point | lavpunkt |
> | Swing Direction | svingretning |
>
> **Skrivemåte: stor forbokstav overalt** (Anders 01.09.2026) — i løpende tekst,
> i tabeller, i etiketter, i dataflater. *Attack Angle*, ikke *attack angle*.
>
> Norsk bruker normalt ikke versaler i substantiv, og det er et bevisst brudd:
> stor forbokstav gjør det tydelig at dette er **navnet på en måling**, ikke et
> vanlig ord. Leseren ser på ett blikk hva som kommer fra instrumentet og hva
> som er vår forklaring.
>
> **Dette gjelder TrackMan-parametere — ikke golfspråket ellers.** Kølle, sving,
> green, tee og fairway skrives på norsk som før.
>
> ## Merket bruker ikke vitnesbyrd
>
> Låst av Anders 01.09.2026. **Ingen spillersitater, ingen anmeldelser, ingen
> «beste coachen jeg har hatt».** Ikke på nettsidene, ikke i sosiale medier,
> ikke i presentasjoner.
>
> Det er ikke beskjedenhet — det er konsistens. Et sitat er per definisjon
> synsing, og et merke som sier «vi måler, vi synser ikke» blir svakere av å be
> folk om ros.
>
> **Vi viser målingen i stedet.** «Spredningen gikk fra 14,2 til 6,8 m» gjør mer
> enn ti fornøyde kunder, og det kan etterprøves.
>
> ## Prøven
>
> Les setningen høyt. **Ville Anders sagt den til en spiller på rangen?**
> Nei — skriv den om.
>
> ## Navn og skrivemåte
>
> | Riktig | Galt |
> |---|---|
> | AK Golf | AK-Golf, AKGolf, ak golf |
> | AK Golf Academy | Akademiet, AK Academy |
> | AK Golf Junior Academy · kort: Junior Academy | Juniorakademiet |
> | AK Golf HQ | PlayerHQ i publikumsvendt tekst om hele plattformen |
> | Mulligan Indoor Golf | Mulligan Golf, Mulligan Simulator |
> | Trackman | TrackMan, trackman *(i publikumsvendt tekst; produktkoden bruker TrackMan)* |
> | coach | trener, når det er AK Golfs egne |
>
> Norsk bokmål med æ, ø og å. Alltid.
>
> ## Tall i tekst
>
> Et tall om en spiller skal ha **dato og kilde** eller være merket som estimat.
> Det gjelder også i markedsføring — særlig der. Se `05-typografi.md` om mono.
>

### 9.3 Tekstkonsept, kanaltoner og e-posteksempler

**DATERT TEKSTKILDE – tall er eksempler. Svartidsløftet er utsatt. Markedsrollen er senere rettet i S9. Gamle produksjonstall, sendetidspunkter og løfter er ikke kontrollert på nytt.**

Kilde: S8, `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # AK Golf Academy — konsept og tekst
>
> Skrevet 01.09.2026. STEG 18 i `docs/MASTERPLAN-GJENSTAAENDE.md`.
> Lesbar utgave: `designsystem/ak-golf/tekstkonsept.html`
>
> Dette er tekst som kan limes rett inn. Ingen plassholdere.
>
> > **To regler som gjelder alt under** (Anders 01.09.2026):
> > **TrackMan-parametere skrives på engelsk med stor forbokstav** — *Attack Angle*,
> > aldri «angrepsvinkel» og aldri «attack angle».
> > **Merket bruker ikke vitnesbyrd** — ingen spillersitater, ingen anmeldelser.
> > Begge er forklart i `designsystem/ak-golf/guidelines/08-sprak.md`.
>
> ---
>
> ## 1 · Kjernen
>
> **Posisjon:** AK Golf Academy driver langsiktig utvikling og oppfølging — og lar deg trene optimalt og spesifikt, uavhengig av hvilket nivå du er på.
>
> **Løftet:** Du skal aldri lure på hva du skal trene på, eller hvorfor.
>
> **Hovedlinje:** Uansett hvor du står, vet du hva du trener på.
>
> ### Fire ting vi kan bevise
>
> **Langsiktig, ikke time for time.** Vi jobber over sesonger, ikke over enkelttimer. Planen bygger på forrige måling og peker mot neste.
>
> **Oppfølging mellom øktene.** Arbeidet slutter ikke når timen er over. Du vet hva du skal gjøre på onsdag, og vi ser om det ble gjort.
>
> **Optimalt og spesifikt for deg.** Ikke en standardplan med navnet ditt på. Målingene bestemmer hva som er ditt neste steg — ikke hva som er vanlig.
>
> **Nivået er ikke en inngangsbillett.** Samme metode for den som slår sine første baller og den som spiller Norgescup. Bare ulikt innhold.
>
> ### Hva vi er alternativet til
>
> | Alternativet | Hva som er galt med det |
> |---|---|
> | Timen hos proffen | Slutter når timen slutter. Neste gang begynner på nytt, ofte med et nytt fokus. |
> | Å lære av video | Uendelig med råd, null diagnose. Du vet ikke hvilket av tusen råd som gjelder deg. |
> | En app uten coach | Registrerer hva du gjorde. Sier ingenting om hva du burde gjort. |
>
> ## 2 · Markedssidene
>
> ### Forsiden — `/`
>
> **Hero**
> > Uansett hvor du står, vet du hva du trener på.
>
> Vi måler svingen din, tallene dine og spillet ditt. Så får du en plan som holder mellom øktene — og oppfølging som gjør at den faktisk blir fulgt.
>
> *Knapp:* Book kartleggingsøkt
>
> **Under heroen**
>
> Første økt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du står, og du går derfra med en skriftlig plan.
>
> **Seksjon: problemet**
> > De fleste vet ikke hva de trener på.
>
> Ikke fordi de er late. Fordi ingen har målt. Du slår en bøtte baller, det føles bedre eller verre, og neste uke starter du på nytt. Det er ikke trening — det er håp.
>
> **Seksjon: løsningen**
> > Vi begynner med et tall.
>
> Trackman måler hva køllehodet faktisk gjør. Testbatteriet viser hvor du står i forhold til deg selv sist. Deretter legger vi planen — og den ligger i appen, så du vet hva onsdagsøkta skal inneholde.
>
> **Seksjon: nivå**
> > Det spiller ingen rolle hvor du starter.
>
> Metoden er den samme for den som slår sine første baller og for den som spiller Norgescup. Det som er ulikt, er innholdet i planen — ikke hvor grundig vi jobber.
>
> **Avslutning**
> > Klar for å finne ut hvor du faktisk står?
>
> 90 minutter, vanlig timepris. Du går derfra med en plan.
>
> *Knapp:* Book kartleggingsøkt
>
> ### Coaching — `/coaching`
>
> **Hero**
> > En coach som følger deg over år.
>
> Ikke én time på rangen. Måling, plan og økter som henger sammen — over sesonger, ikke over uker.
>
> *Knapp:* Se pakkene
>
> **Seksjon**
> > Slik jobber vi
>
> Første økt kartlegger. Så setter vi ett mål av gangen, med et tall som viser om vi nærmer oss. Planen justeres når målingene sier at den bør justeres — ikke når det har gått en måned.
>
> **Avslutning**
> > Vil du vite om dette passer deg?
>
> Book en kartleggingsøkt, så finner vi det ut sammen. Ingen binding.
>
> *Knapp:* Book kartleggingsøkt
>
> ### Junior — `/junior`
>
> **Hero**
> > Barnet ditt skal vite hva det jobber med.
>
> AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
>
> *Knapp:* Meld interesse
>
> **Seksjon: for forelderen**
> > Du slipper å spørre hvordan det går.
>
> Foreldreportalen viser hva som er trent, hva som er målt og hva som er neste steg. Ingen ukentlige meldinger fra deg som må besvares — du ser det selv.
>
> **Seksjon: gruppene**
> > Fire veier inn
>
> Gruppene er satt etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart.
>
> **Avslutning**
> > Lurer du på hvilken gruppe som passer?
>
> Send oss alder og litt om erfaringen, så tar vi kontakt innen én virkedag.
>
> > *Svartidsløftet holdes tilbake til Jarvis er i drift (Anders 05.09.2026, MASTERPLAN 18.34).
> > Bygg runde 2 med: «Send oss alder og litt om erfaringen, så tar vi kontakt.»*
>
> *Knapp:* Meld interesse
>
> ### Priser — `/priser`
>
> **Hero**
> > Enkelt og ærlig.
>
> Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Coaching kjøpes separat, i pakker.
>
> **Presisering**
>
> Coaching-pakkene er antall økter — ikke nivåer i appen. Har du pakke, følger appen med.
>
> **Avslutning**
> > Usikker på hva du trenger?
>
> Start med kartleggingsøkta. Etterpå vet både du og vi hva som er riktig.
>
> *Knapp:* Book kartleggingsøkt
>
> ### Om oss — `/om-oss`
>
> **Hero**
> > Coaching bygget på måling.
>
> AK Golf Academy drives av {coachnavn} — golfcoach, sportssjef i Gamle Fredrikstad Golfklubb og coach ved WANG Toppidrett Fredrikstad.
>
> **Seksjon**
> > Hvorfor vi jobber slik
>
> Det finnes ingen mangel på golfråd. Det finnes en mangel på diagnose. Vi bruker Trackman og standardiserte tester for å finne ut hva som gjelder akkurat deg — og lar tallene bestemme rekkefølgen.
>
> ### Kontakt — `/kontakt`
>
> **Hero**
> > Vi svarer innen én virkedag.
>
> > *Holdes tilbake til Jarvis er i drift (Anders 05.09.2026, MASTERPLAN 18.34). Runde 6
> > trenger en annen hero — forslag, ikke vedtatt: «Skriv noen ord, så tar vi kontakt.»*
>
> Spørsmål om coaching, juniorprogram eller bedriftsarrangement? Skriv noen ord, så tar vi kontakt.
>
> ## 3 · Sosiale medier
>
> ### Fremgangstall
>
> *Målt fremgang hos en spiller. Alltid med dato, kilde og antall.*
>
> ```
> +12,4 m på driver etter 14 uker.
>
> Vi endret ikke svingen først. Vi målte i seks økter, fant at Attack Angle var problemet, og jobbet bare med den.
>
> Trackman · 12.05–18.08 · 38 målinger
> ```
>
> **Regel:** Tallet må være målt. Aldri rundet oppover, aldri «opptil».
>
> ### Slik leser du tallet
>
> *Én måling forklart. Gir bort fagkunnskap ingen kan kopiere uten å faktisk måle.*
>
> ```
> Attack Angle −3,2° med driver.
>
> Køllehodet går nedover i treffet. Det gir høy Spin Rate og lav Launch Angle — du taper lengde uten å slå svakere.
>
> Du kjenner det ikke. Det er derfor vi måler det.
> ```
>
> **Regel:** TrackMan-parameteren beholdes på engelsk. Forklar hva den BETYR på norsk, i setningen etter.
>
> ### Før og etter
>
> *En konkret endring, vist som to tall.*
>
> ```
> Dispersion på 7-jern, samme spiller:
>
> April: 14,2 m sideveis
> August: 6,8 m sideveis
>
> Ingenting av dette er magi. Det er én ting av gangen, målt hver gang.
>
> Trackman · 22 økter
> ```
>
> **Regel:** Begge tall fra samme måleoppsett. Ellers er sammenligningen verdiløs.
>
> ### Tips fra coach
>
> *Fagkunnskap gitt bort. Ingen salgslinje til slutt.*
>
> ```
> Åtte av ti amatører sikter feil på puttene under to meter.
>
> Ikke fordi de leser greenen galt. Fordi de stiller opp skuldrene mot hullet i stedet for mot startlinja.
>
> Test det: legg en kølle langs skuldrene og se hvor den peker.
> ```
>
> **Regel:** Skal kunne brukes uten å kjøpe noe. Det er hele poenget.
>
> ### Turneringsresultat
>
> *Resultat for spillere i programmet.*
>
> ```
> Tre spillere fra Academy spilte NM junior denne helga.
>
> Resultatene ligger i turneringsoversikten vår — vi legger dem ut uansett hvordan det gikk.
>
> Det er også en del av å måle.
> ```
>
> **Regel:** Legg ut svake runder også. Ellers er det reklame, ikke måling.
>
> ### Påmelding åpen
>
> *Praktisk beskjed. Ingen hausing.*
>
> ```
> Juniorgruppene starter 1. mai. Vi har plass i U10 og U14.
>
> Send alder og litt om erfaringen, så finner vi riktig gruppe.
> ```
>
> *«Svar innen én virkedag» er tatt ut av malen 05.09.2026 — løftet holdes tilbake til Jarvis
> er i drift (MASTERPLAN 18.34).*
>
> **Regel:** Si hva som faktisk er ledig. Aldri «få plasser igjen» hvis det ikke stemmer.
>
> ## 4 · E-post
>
> Krøllparenteser er felter som fylles automatisk.
>
> ### Velkommen — ny gratis konto
>
> *Sendes ved registrering.*
>
> ```
> Emne: Kontoen din er klar
>
> Hei {fornavn},
>
> Du har nå tilgang til testbatteriet, statistikken og verktøyene. Det koster ingenting, og det utløper ikke.
>
> Det enkleste første steget: kjør én test. Da har du et tall å måle mot senere.
>
> {lenke: Start en test}
>
> Anders
> ```
>
> ### Etter kartleggingsøkta
>
> *Sendes samme dag som økta.*
>
> ```
> Emne: Planen din fra i dag
>
> Hei {fornavn},
>
> Her er det vi fant i dag, og hva vi gjør med det:
>
> {tre punkter fra økta}
>
> Planen ligger i appen. Neste måling er {dato} — da ser vi om vi er på rett vei.
>
> Spør hvis noe er uklart.
>
> Anders
> ```
>
> ### Til forelder — ukentlig
>
> *Sendes søndag kveld, kun når det finnes noe å si.*
>
> ```
> Emne: {barnets fornavn} denne uka
>
> Hei,
>
> {Barnets fornavn} har trent {antall} økter denne uka. Vi har jobbet med {område}.
>
> Neste steg på stigen er {trinn}. Det som gjenstår: {krav}.
>
> Du ser detaljene i foreldreportalen.
>
> Hilsen Anders
> ```
>
> ### Påminnelse om økt
>
> *Sendes dagen før.*
>
> ```
> Emne: Økt i morgen kl. {tid}
>
> Hei {fornavn},
>
> Vi møtes {sted} kl. {tid} i morgen.
>
> Ta med {det som trengs}. Må du flytte, svar på denne så finner vi ny tid.
>
> Anders
> ```
>
> ### Ingen aktivitet på en stund
>
> *Sendes etter 30 dager uten innlogging. Én gang.*
>
> ```
> Emne: Alt ligger der fortsatt
>
> Hei {fornavn},
>
> Det er en måned siden sist. Ingen bekymring — planen og tallene dine ligger der de lå.
>
> Skal vi ta en ny måling og se hvor du står nå? Det er ofte enklere å komme i gang når man har et tall å forholde seg til.
>
> Anders
> ```
>
> ### Nyhetsbrev
>
> *Månedlig. Én sak, ikke fem.*
>
> ```
> Emne: {én konkret ting, ikke «Nyhetsbrev mars»}
>
> Én sak per utsendelse. Den saken skal være noe leseren kan bruke — en måling vi har gjort, noe vi har lært, en endring i programmet.
>
> Avslutt med én lenke. Ikke fem.
>
> Avmelding nederst, uten å gjøre det vanskelig.
> ```
>
> ## 5 · Tonen
>
> Prøven: ville en erfaren coach sagt dette til en spiller på rangen?
>
> **Skriv tallet, ikke følelsen**
>
> - Slik: ««Åtte av ti 7-jern lander høyre for pinnen»»
> - Ikke: ~~««Du sliter med retningen»»~~
>
> **Sett kilden ved siden av**
>
> - Slik: ««+12,4 m · Trackman · 38 målinger»»
> - Ikke: ~~««Opptil 15 meter lengre»»~~
>
> **Si hva det koster**
>
> - Slik: ««90 minutter, vanlig timepris»»
> - Ikke: ~~««Kontakt oss for pris»»~~
>
> **Én handling per flate**
>
> - Slik: ««Book kartleggingsøkt»»
> - Ikke: ~~««Book · Les mer · Meld deg på · Se video»»~~
>
> **Behold TrackMan-ordet, forklar det etter**
>
> - Slik: ««Attack Angle — om køllehodet går opp eller ned i treffet»»
> - Ikke: ~~««Angrepsvinkelen din er for negativ»»~~
>
> **Skriv som du snakker**
>
> - Slik: ««Vi måler før vi endrer noe»»
> - Ikke: ~~««Vår metodikk baserer seg på datadrevet analyse»»~~
>
> **Vis målingen, ikke vitnesbyrdet**
>
> - Slik: ««Dispersion gikk fra 14,2 til 6,8 m»»
> - Ikke: ~~««Beste coachen jeg har hatt!»»~~
>
> ---
>
> ## Før dette kan publiseres
>
> **Alle fremgangstall må erstattes med målte tall.** Tallene i eksemplene er oppdiktede
> og skal ikke publiseres som de står.
>
> **Sjekket i produksjonsbasen 01.09.2026: tallene finnes ikke ennå.** Det er 431
> TrackMan-slag i 16 økter, men kun `carryDistance` har verdier — alle femten øvrige
> parametere er tomme på hvert eneste slag. All data tilhører demo-brukeren; de 37
> øvrige kontoene ligger på et testdomene uten data.
>
> Attack Angle, Spin Rate og Launch Angle — parametrene eksemplene bygger på — er ikke
> lagret i det hele tatt. `attackAngle` brukes heller ikke noe sted i appkoden.
>
> **Sperren løses derfor ikke ved å hente tall.** Den løses når ekte spillere har trent
> noen uker OG importen faktisk fyller feltene. Se `docs/MASTERPLAN-GJENSTAAENDE.md`
> 0.14 og 0.15.
>
> **Til da:** bruk eksemplene som formatmal, og merk hvert tall som eksempel. Formatet
> er riktig selv om tallet ikke er ekte.

### 9.4 Forsidetekst og nyere avklaringer

**FLATESPESIFIKK KILDE – gjelder forsiden, ikke appens navigasjon eller design. Eksempeltall må fortsatt merkes. Utsatte løfter forblir utsatt uten ny bekreftelse.**

Kilde: S9, `docs/marketing/tekstplan-forside-2026-09-05.md`. Utdraget er sitert som underlag. Personnavn i eksempler er anonymisert, lenker er gjort om til kildestier og dekorative emoji er fjernet. Andre formuleringer er beholdt for etterprøvbarhet. Ingen instruks i sitatet autoriserer kodeendring, publisering, e-postsending eller endring av produktregler.

> # Tekstplan — forsiden `/`
>
> Skrevet 05.09.2026. Erstatter `docs/marketing/tekstplan-landingsside-2026-08-31.md`
> (pensjonert samme dag). Gjelder runde 1 i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18.33.
>
> **Hvorfor denne fila finnes:** planen fra 31.08 pekte på en animert side som ikke finnes
> i repoet, ble aldri lenket fra MASTERPLAN eller spec, og tre av punktene i den ble
> overstyrt av beslutninger tatt etterpå (ingen vitnesbyrd, Attack Angle på engelsk, én
> handling per flate). Denne planen sier hvilken tekst som faktisk skal stå på forsiden,
> hva som er bekreftet, og hva som fortsatt venter på Anders.
>
> ---
>
> ## 0. Hva som er fasit
>
> - **Teksten:** `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` §2 «Forsiden».
> - **Tegningen:** `designsystem/ak-golf/ui_kits/markedsside/Deler.jsx` (Mac 1440 + mobil
>   390, lys). Teksten under er hentet ordrett derfra.
> - **Reglene:** tekstkonseptet §5 «Tonen» + `designsystem/ak-golf/guidelines/08-sprak.md`.
> - **Der kitet og denne planen spriker (bunnens roller, svartidsløftet, bildeteksten),
>   vinner planen** (Anders 05.09). Masteren i Claude Design rettes av Anders; speilet i
>   repoet (`designsystem/ak-golf/ui_kits/`) redigeres ikke, det overskrives ved neste speiling.
> - **Reisen mot kitet:** avgjøres av Anders på preview (spec §3, plan Task 7 runde 1).
>   Denne planen gjelder teksten uansett hvilken struktur som velges — spec §3 rad 1 låser
>   tekstkilden til tekstkonseptet, ikke til kitets layout.
>
> ## 1. Teksten, seksjon for seksjon
>
> Status: **FERDIG** (kan stå live) · **BEKREFT** (venter på Anders, se §2) ·
> **EKSEMPEL** (tall som ikke er målt).
>
> ### 1.1 Hero
>
> | Felt | Tekst | Status |
> |---|---|---|
> | Overskrift | Uansett hvor du står, vet du hva du trener på. | FERDIG |
> | Ingress | Vi måler svingen din, tallene dine og spillet ditt. Så får du en plan som holder mellom øktene — og oppfølging som gjør at den faktisk blir fulgt. | FERDIG |
> | Knapp | Book kartleggingsøkt | FERDIG |
> | Under heroen | Første økt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du står, og du går derfra med en skriftlig plan. | FERDIG — bekreftet 05.09 |
> | Bildetekst | ~~Trackman står i hver økt. Det er der planen begynner.~~ Tatt ut (Anders 05.09). Bildet står uten bildetekst; alt-teksten beholdes. | FERDIG |
>
> ### 1.2 Problemet
>
> > De fleste vet ikke hva de trener på.
>
> Ikke fordi de er late. Fordi ingen har målt. Du slår en bøtte baller, det føles bedre
> eller verre, og neste uke starter du på nytt. Det er ikke trening — det er håp.
>
> **FERDIG.** Erstatter coach-sitatet fra 31.08 («Vi trener ikke på det du liker»), som
> ikke er med i kitet. Denne gjør samme jobb uten å legge ord i munnen på Anders.
>
> ### 1.3 Slik jobber vi
>
> > Vi begynner med et tall.
>
> Trackman måler hva køllehodet faktisk gjør. Testbatteriet viser hvor du står i forhold
> til deg selv sist. Deretter legger vi planen — og den ligger i appen, så du vet hva
> onsdagsøkta skal inneholde.
>
> **FERDIG.**
>
> ### 1.4 Slik leser du tallet
>
> | Felt | Tekst | Status |
> |---|---|---|
> | Talleblokk | Carry, driver · **+12,4 m** · Trackman · 12.05–18.08.2026 · 38 målinger | EKSEMPEL — bygges med synlig «Eksempel»-merke (Anders 05.09) |
> | Forklaring under tallet | Vi endret ikke svingen først. Vi målte i seks økter, fant at Attack Angle var problemet, og jobbet bare med den. | EKSEMPEL — bygges med synlig «Eksempel»-merke (Anders 05.09) |
> | Fagtekst | Attack Angle beskriver om køllehodet går opp eller ned i treffet. Går det nedover med driver, får du høy Spin Rate og lav Launch Angle — du taper lengde uten å slå svakere. | FERDIG |
> | Avslutning | Du kjenner det ikke. Det er derfor vi måler det. | FERDIG |
>
> Tallet, datoene og antallet er oppdiktet. Tekstkonseptet §«Før dette kan publiseres»
> slår fast (målt i basen 01.09) at Attack Angle ikke lagres i det hele tatt — kun
> `carryDistance` har verdier. Fagteksten er sann uavhengig av tallet.
>
> **Avgjort 05.09:** blokken vises, med merkelappen «Eksempel» synlig ved tallet. Byttes til
> målt tall når basen har det (MASTERPLAN 0.14 og 0.15).
>
> ### 1.5 Junior Academy
>
> > Barnet ditt skal vite hva det jobber med.
>
> AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn
> med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
>
> *Knapp:* Meld interesse
>
> **FERDIG.** Dette er kitets eneste andre handling på forsiden, og den peker på et annet
> publikum (forelderen) — det bryter ikke «én handling per flate».
>
> ### 1.6 Det foreldre spør om
>
> | Spørsmål | Svar | Status |
> |---|---|---|
> | Hva koster kartleggingsøkta? | 90 minutter til vanlig timepris. Du går derfra med en skriftlig plan. Ingen binding etterpå. | FERDIG — bekreftet 05.09 |
> | Må barnet ha eget utstyr? | Nei. Vi har køller til lån i alle gruppene til og med U12. | FERDIG — bekreftet 05.09 |
> | Hva koster appen? | Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Har du coaching-pakke, følger appen med. | FERDIG — stemmer med `docs/platform/BUSINESS-RULES.md` §Abonnement |
> | Hvordan settes gruppene? | Etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart. | FERDIG |
>
> ### 1.7 Avslutning
>
> > Klar for å finne ut hvor du faktisk står?
>
> 90 minutter, vanlig timepris. Du går derfra med en plan.
>
> *Knapp:* Book kartleggingsøkt
>
> **FERDIG.**
>
> ### 1.8 Bunn
>
> | Felt | Tekst | Status |
> |---|---|---|
> | Beskrivelse | AK Golf Academy drives av {coachnavn} — golfcoach, sportslig ansvarlig i Gamle Fredrikstad Golfklubb og sportssjef ved WANG Toppidrett Fredrikstad. | FERDIG — Anders 05.09. Kitet sier «sportssjef i GFGK og coach ved WANG»; planen vinner. Rettet i live bunn samme dag |
> | Lenker | AK Golf HQ · Skarpnord · Kontakt | FERDIG |
> | E-post | post@akgolf.no | FERDIG — adressen finnes (05.09) |
> | Svartid | ~~Vi svarer innen én virkedag.~~ Holdes tilbake til Jarvis er i drift (Anders 05.09). Tatt ut av live bunn samme dag. | UTSATT — MASTERPLAN 18.34 |
> | Sted | Gamle Fredrikstad GK, Fredrikstad | FERDIG — bekreftet 05.09 |
> | Telefon / org.nr | ikke i kitet | Ikke svart 05.09. Holdes ute som i kitet til Anders sier noe annet |
>
> ## 2. Sju spørsmål — svart av Anders 05.09.2026
>
> | # | Spørsmål | Svar | Konsekvens |
> |---|---|---|---|
> | 1 | GFGK og WANG i bunnen? | Ja: **sportslig ansvarlig GFGK, sportssjef WANG Toppidrett Fredrikstad** | 1.8 rettet; live bunn og hero-rollene i Reisen rettet samme dag |
> | 2 | Finnes `post@akgolf.no`? Telefon og org.nr? | Ja, adressen finnes. Telefon/org.nr ikke svart | 1.8; telefon/org.nr holdes ute |
> | 3 | «Vi svarer innen én virkedag»? | «Når komplette Jarvis-systemet er oppe så gjør vi det» | Løftet holdes tilbake på alle markedsflater, MASTERPLAN 18.34 |
> | 4 | Skriftlig plan hver gang? | Ja | 1.1 og 1.6 FERDIG |
> | 5 | Talleblokk med «Eksempel»-merke eller vent? | Anbefalingen: merke | 1.4 bygges med synlig merke |
> | 6 | Køller til lån t.o.m. U12? | Ja | 1.6 FERDIG |
> | 7 | «Trackman står i hver økt»? | Ta bort | 1.1 bildetekst ut |
>
> Teksten er låst. Ingenting i §2 blokkerer runde 1 lenger. Registrert i
> `.claude/rules/beslutninger.md` §FORSIDETEKSTEN LÅST.
>
> ## 3. Tatt ut fra planen 31.08, og hvorfor
>
> - **Spillersitat.** Strøket 01.09 (merket bruker ikke vitnesbyrd). Canvasen
>   `designsystem/canvas/landingsside-akgolf/Main.dc.html` har fortsatt en tom
>   `[SITAT FRA SPILLER]`-blokk — canvasen er Retning A fra 28.08 og ikke fasit lenger;
>   den ryddes bort når runde 1 lander.
> - **«Spillere fulgt gjennom sesongen».** Basen ble nullstilt 30.08; kitet viser ikke tallet.
> - **Tallraden i heroen** (20 testprotokoller · 10 P-posisjoner · 6 simulatorer). Ute —
>   kitet har ingen tallrad, og tall uten kilde og dato er TruthLayer-brudd.
> - **Sesong (april–oktober) og Mulligan 07–24.** Hører til `/anlegg` (runde 8) og
>   `/mulligan` (runde 12). Kitets forside har ingen Mulligan-seksjon, i tråd med
>   31.08-beslutningen om at Mulligan ikke knyttes til merket.
> - **Seks tilbudsruter og sju knapper.** Ute — én handling per flate (tekstkonsept §5).
> - **Coach-sitatet i 1.2.** Ikke i kitet, se 1.2 over.
> - **«angrepsvinkel».** Nå Attack Angle, med norsk forklaring etter (08-sprak.md).
> - **Pris per økt og pakkepriser.** STEG 18.9. Forsiden sier «vanlig timepris» og
>   lenker til booking — ingen tall hardkodes.
> - **Svartidsløftet på de gamle sidene.** «Innen 1 virkedag» står fortsatt live i
>   `MarkedKontaktV2.tsx`, `MarkedJuniorV2.tsx`, `kontakt/page.tsx` (meta) og
>   `kontakt/actions.ts` (kvittering). De bygges om i runde 2 og 6 — løftet tas ut der,
>   se MASTERPLAN 18.34.
>
> ## 4. Skal ikke skrives (uendret fra 31.08, gjelder fortsatt)
>
> - Ingen resultatgaranti («senk handicapet med 5 slag»).
> - Ingen sammenligning med navngitte konkurrenter.
> - Ingen tall om mindreårige på åpen flate, ingen barn nevnt med navn uten samtykke.
> - Ingen «AI-drevet»-språk. Plattformen selges på hva den gjør, ikke teknologien bak.
> - Ingen prisantydning som ikke finnes i Stripe eller på prissiden.
> - MORAD og Mac O'Grady nevnes aldri (31.08).
>
> ## 5. Rekkefølge
>
> 1. ~~Anders svarer på de sju i §2.~~ Gjort 05.09.
> 2. Reisen mot kitet avgjøres på preview (plan Task 7, runde 1-særregelen).
> 3. Teksten bygges inn ordrett fra denne fila. Ingen ny tekst diktes opp i koden.
> 4. Siden leses høyt én gang. Skurrer en setning når den sies, skrives den om her først.
>

### 9.5 Innloggingsrelaterte e-poster

Tekst trukket ut av de tre lokale HTML-malene, med malvariabler beholdt. Ingen konfigurasjon er lest eller endret. Oppgitt lenkevarighet er **KILDETEKST / IKKE VERIFISERT** (A16), ikke en bekreftelse på faktisk innstilling. Visuelt oppsett er utelatt.

#### Bekreft e-postadresse

Kilde: S14; emne fra S10.

**Emne:** Bekreft e-postadressen din — AK Golf

> Bekreft e-postadressen din for å fullføre registreringen hos AK Golf.
>
> AK Golf
>
> Bekreft e-postadressen din
>
> Hei,
>
> Takk for at du registrerte deg hos AK Golf. Klikk knappen under for å bekrefte e-postadressen din og aktivere kontoen.
>
> Bekreft e-postadresse
>
> Lenken er gyldig i 24 timer.
>
> Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren:
>
> {{ .ConfirmationURL }}
>
> Ba du ikke om denne kontoen? Se bort fra denne e-posten.
>
> AK Golf Academy · Bossumveien 6, 1605 Fredrikstad
>
> post@akgolf.no

#### Tilbakestill passord

Kilde: S15; emne fra S10.

**Emne:** Tilbakestill passordet ditt — AK Golf

> Tilbakestill passordet ditt hos AK Golf.
>
> AK Golf
>
> Tilbakestill passordet ditt
>
> Hei,
>
> Vi har mottatt en forespørsel om å tilbakestille passordet for kontoen din hos AK Golf. Klikk knappen under for å velge et nytt passord.
>
> Velg nytt passord
>
> Lenken er gyldig i 1 time.
>
> Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren:
>
> {{ .ConfirmationURL }}
>
> Ba du ikke om dette? Da kan du trygt se bort fra denne e-posten — passordet ditt er ikke endret.
>
> AK Golf Academy · Bossumveien 6, 1605 Fredrikstad
>
> post@akgolf.no

#### Endre e-postadresse

Kilde: S16; emne fra S10.

**Emne:** Bekreft ny e-postadresse — AK Golf

> Bekreft den nye e-postadressen din hos AK Golf.
>
> AK Golf
>
> Bekreft ny e-postadresse
>
> Hei,
>
> Du har bedt om å endre e-postadressen på AK Golf-kontoen din fra {{ .Email }} til {{ .NewEmail }}. Klikk knappen under for å bekrefte endringen.
>
> Bekreft ny e-postadresse
>
> Lenken er gyldig i 24 timer.
>
> Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren:
>
> {{ .ConfirmationURL }}
>
> Ba du ikke om denne endringen? Kontakt oss umiddelbart på post@akgolf.no.
>
> AK Golf Academy · Bossumveien 6, 1605 Fredrikstad
>
> post@akgolf.no


## 10. Kilder og kontrollspor

### 10.1 Kilderegister

Kildefilene er lest lokalt. Fingeravtrykket identifiserer nøyaktig kildeinnhold ved samlingen, ikke om innholdet er korrekt eller godkjent. Relativ lenke virker i repoet; kilde-ID, filsti og innholdet i denne filen gjør samlingen lesbar også som eget vedlegg.

| ID | Kilde | SHA-256 |
|---|---|---|
| S1 | [Treningsfaglig fasit](../FASIT-AK-GOLF-HQ.md) · `docs/FASIT-AK-GOLF-HQ.md` | `bfaf5a6714dcd5697bb5141863352867c35fe8abd0a86f75a3ce544f0b8a5dfb` |
| S2 | [Planleggingsordbok 08.09](../ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md) · `docs/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md` | `8832b1e34fb659fead6c683a4ca7abf15cad5a68501d395e108ce4621e2d7f77` |
| S3 | [Konsept- og UI-ordbok](../ordbok-ak-golf-konsept.md) · `docs/ordbok-ak-golf-konsept.md` | `4d1be1453803a3c2b95731f1d0d9ac31d71cdf369553ab6c18fdb17d86dd17ce` |
| S4 | [Visning, tall og knappeord](../design-guide-terminologi.md) · `docs/design-guide-terminologi.md` | `1aefdff152a6c59043235673b181cc026d0173240cfb55399bf22644bdc92ade` |
| S5 | [Tidligere hovedskjermtekster](skjerm-tekst-hovedskjermer.md) · `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` | `137884164f840565015d216da04f38a3d5487f06fb4bcfb9baa5a038ae9d30de` |
| S6 | [Produktregler](../platform/BUSINESS-RULES.md) · `docs/platform/BUSINESS-RULES.md` | `ff648c8fe840b160ea1fd63186ab08bc248bbdb0e11f031dffaf05e455d2bf19` |
| S7 | [Merkespråk og TrackMan-navn](../../designsystem/ak-golf/guidelines/08-sprak.md) · `designsystem/ak-golf/guidelines/08-sprak.md` | `b303458145a9f8d6986b8f7fc113f193cdf0ab8cf083b8982c45277035e9b220` |
| S8 | [Tekstkonsept og e-posteksempler](../merkevare/ak-golf-tekstkonsept-2026-09-01.md) · `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` | `053c2803cecf1acd702aac50e3924978a655318a220f0932dc8952095a07bf19` |
| S9 | [Forsidetekst og avklaringer](../marketing/tekstplan-forside-2026-09-05.md) · `docs/marketing/tekstplan-forside-2026-09-05.md` | `1e2e3ef74f07d7f2c7c2e9ae38d5875123a64eb0104306de091b47e3ac8384a4` |
| S10 | [Emnefelt i e-postmaler](../epost-maler/LES-MEG.md) · `docs/epost-maler/LES-MEG.md` | `1464f8f769cbb23825b828f9269a9f690008e7acbb9869b0a67371ca43d9c65e` |
| S11 | [Åpen språkgjennomgang](../beslutningsgrunnlag/sprak-og-treningskvalitet-2026-09-10.md) · `docs/beslutningsgrunnlag/sprak-og-treningskvalitet-2026-09-10.md` | `62337312497a1ddc9a846070083ac76e6bb626cff9a6923a10f77dda0b5fdafc` |
| S12 | [Historisk maskinlesbar kopi, ikke ny fasit](../ordbok.json) · `docs/ordbok.json` | `89c802e76a22044eebbea9fed9405ce0c3b3c8665474779cc90068271e0b6fdf` |
| S13 | [Aktiv retning og AI-statusskiller](../../.claude/skills/ak-hq-design/references/atletisk-intelligens.md) · `.claude/skills/ak-hq-design/references/atletisk-intelligens.md` | `1e7dff4e5eb4e90cc371f936de686af37e4830f1d4c63b790b48bde7be16f904` |
| S14 | [Bekreft e-postadresse](../epost-maler/bekreft-epost.html) · `docs/epost-maler/bekreft-epost.html` | `0e3f5c454a096c0c7ccde3cae537c0b96f7ef7d13aa4a70f063da6e8217fbf78` |
| S15 | [Tilbakestill passord](../epost-maler/tilbakestill-passord.html) · `docs/epost-maler/tilbakestill-passord.html` | `8bca8728d3783c492cabf3401b81414ec5b4870936306a961440bc3ac51096cd` |
| S16 | [Endre e-postadresse](../epost-maler/endre-epost.html) · `docs/epost-maler/endre-epost.html` | `3049c8e6e6ca24bfe1ba4cd335ca1103574e2f8094fba1b9fd0a5ef75c47c0fe` |

### 10.2 Kontroll av ordregisterets dekning

| Kilde | Tabellrader med innhold |
|---|---|
| S1 | 95 |
| S2 | 85 |
| S3 | 690 |
| S4 | 48 |
| S7 | 27 |
| Sum | 945 |

Metode: alle Markdown-tabellrader med tilhørende tabellhode i S1, S2, S3, S4 og S7 er tatt inn. Overskrifts- og skillelinjer telles ikke. Hver rad beholder kilde-ID, opprinnelig linjenummer og seksjon. Klassifiseringene er forsiktige redaksjonelle flagg; faglige avklaringer står i del 5. Tabellen er ikke et nytt sett kodeverdier.

S12 (`docs/ordbok.json`) er kontrollert som avledet historisk kilde og **ikke importert som en ekstra fasit**. Den beskriver fortsatt utgåtte L-/CS-/M-/PR-ledd og feil kategoriretning. S3s ordregister og nyere S1/S2 er bevart i stedet. S6 er brukt for produktavklaringer, ikke kopiert som juridisk håndbok. S11 dokumenterer at full språkrevisjon fortsatt er åpen. Dyp fagkunnskap utenfor disse dokumentene og alle tekststrenger i kildekoden er ikke eksportert.

Ingen appkode, database, e-postinnstilling eller originalordbok er endret ved samlingen. Ingen uavklarte ordvalg er markert godkjent. Dokumentet kan brukes som arbeidsvedlegg i Claude Design med kildeorden og avklaringsregister intakt.
