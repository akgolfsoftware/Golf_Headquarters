# AK Golf HQ — ordbok og språk (MASTER)

> Dokumentet eier språk, ikke utseende. [Gjeldende designautoritet](design-system/design-autoritet.md)
> styrer alle nye skjermer. [Treningsplanlegging](treningsplanlegging.md) forklarer hvordan
> begrepene brukes i årsplan, perioder, økter og øvelser.

**Status 21.09.2026:** Dette er den eneste gjeldende masteren for språk, begreper,
treningsmodell, planlegging, statuser, staving og skjermtekst i AK Golf HQ. Uavklarte
enkeltvalg er merket i dokumentet og gjør ikke andre ordbøker til parallelle fasiter.

`docs/ordbok.json` er maskinlesbar, avledet data og ikke et eget styrende dokument.

Dette dokumentet inneholder bare gjeldende språk for PlayerHQ, AgencyOS, AgenticOS,
booking, forelder og tilhørende markeds- og e-postflater. Historiske modeller, gamle
skjermtekster, kildeutdrag, konflikttabeller og ferdigbehandlede avklaringer ligger ikke her.

## Innhold

1. Bruk av masteren
2. Felles språk og skrivemåte
3. Gjeldende treningsspråk og viktige skiller
4. Handlinger, statuser og meldinger
5. Faste statusord
6. Ord som ikke skal brukes

## 1. Bruk av masteren

Denne masteren styrer ordvalg i appen.

| Spørsmål | Styrende kilde |
|---|---|
| Nytt uttrykk eller konkret valg | Anders' uttrykkelige beslutning for den aktuelle flaten |
| Treningsmodell og faglige definisjoner | Denne masterens treningsdel og senere uttrykkelige beslutninger fra Anders |
| Planleggingsbegreper og dimensjoner | [Treningsplanlegging](treningsplanlegging.md) |
| Produktnavn, abonnement, booking og tilgang | Denne masteren og gjeldende produktregler |
| Vanlige appord og staving | Denne masterens ordregister og skriveregler |
| Tall, enheter og knappeord | Denne masterens regler for tall, enheter, handlinger og statuser |
| TrackMan-parameternes skrivemåte | Denne masterens TrackMan-del |
| Markedsføringens tone og tekst | Denne masterens skriveregler og godkjent merkespråk |
| Visuelt design | Den Claude Design-versjonen Anders velger. Denne ordboken fastsetter ingen farger, fonter eller navigasjon |
| Faktisk funksjon og levering | Kode og prøvd brukerreise; dokumenttekst alene er ikke bevis |

**Instruks til Claude Design:** Bruk ordene i denne masteren. Ikke hent språk fra eldre
designfiler eller arkiv. Ikke endre tekniske identifikatorer eller produktregler som del av
språkarbeid.

## 2. Felles språk og skrivemåte

### 2.1 Tone

Gjeldende retning:

- Norsk bokmål med æ, ø og å.
- Poenget først. Korte setninger, én tanke om gangen.
- Konkret beskrivelse fremfor vage dommer. Tall trenger datagrunnlag; ikke finn på data for å få teksten til å virke presis.
- Faguttrykk beholdes når de har en bestemt betydning, og forklares på norsk.
- Fortell hva som skjedde, hva som er bevart og hva brukeren kan gjøre videre.
- Ikke lov resultat, lagring, sending eller utført handling uten grunnlag.
- Ingen emoji i brukergrensesnittet. Ikoner erstatter ikke nødvendig tekst.
- Ingen floskler, resultatgarantier eller utropstegn i systemtekst og markedsføring.

### 2.2 Roller, produkter og standardord

| Bruk / betydning | Unngå / avgrensning |
|---|---|
| Spiller | «Elev» eller «atlet» som standard approlle |
| Coach, hovedcoach | «Trener» alene om AK Golfs coach i UI |
| Forelder / foreldre | Bruk «foresatt» bare når den juridiske rollen er poenget |
| PlayerHQ | Spillervendt produktnavn |
| AgencyOS | Ikke «CoachHQ» i ny UI |
| AgenticOS | AI-arbeid i AgencyOS; ikke synonym for Caddie |
| Caddie | Navnet på AI-assistenten |
| AK Golf HQ | Hele plattformen i publikumsvendt tekst |
| AK Golf Academy | Offisielt publikumsnavn; skriv AK med store bokstaver |
| AK Golf Junior Academy / Junior Academy | Ikke «Juniorakademiet» som merkenavn |
| Økt / treningsøkt | Ikke «session» eller «workout» |
| Mål, resultatmål, prosessmål | Ikke «goal» i UI |
| Statistikk, snitt, trend | Ikke «stats»; bruk «snitt» |
| Plan / kalender | Ikke «schedule» |
| Abonnement | Ikke «subscription» |
| Nærspill | Ikke «kortspill», «kort spill» eller «rundt green» som etikett |
| Restitusjon | Ikke «recovery» når det betyr hvile og restitusjon |
| I dag, i går, i morgen, denne uka | Skriv uttrykkene samlet |

**Øvelse er standardordet i brukergrensesnittet.** Bruk «øvelse», «øvelser» og
«øvelsesbibliotek». «Drill» kan stå i tekniske identifikatorer, men ikke i skjermtekst.

### 2.3 TrackMan og måleparametere

TrackMan-parameteren beholder sitt engelske navn og stor forbokstav, også i norsk tekst.
Norsk forklaring følger etter.

Eksempel med syntetisk tall: «Attack Angle −3,2°. Køllehodet går nedover i treffet.» Tallet er ikke et dokumentert spillerresultat eller en generell diagnose.

| Parameternavn | Norsk forklaring, ikke erstatningsnavn |
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

Bruk **TrackMan** som produktnavn. Den generelle norske termen «spredning» kan brukes utenfor
et navngitt parameterfelt.

### 2.4 Tall, tid og enheter

| Innhold | Regel / eksempel |
|---|---|---|
| Desimal | Komma: 72,4 |
| Tusenskille | Mellomrom: 1 247 |
| Prosent | Mellomrom: 73 % |
| Tid | 24-timers klokke: kl. 09:00 |
| Varighet | 60 min, 1 t 30 min, 20 sek |
| Tall og enhet | Mellomrom: 5 sett, 150 m, 104 mph |
| Dato | 19. mai 2026; månedsnavn med liten forbokstav |
| SG | Fortegn og komma: +1,2 / −0,4; oppgi referanse og periode |
| HCP | Behold faktisk HCP og fortegn; ikke utled HCP fra score |
| Putting | Fot som primær visningsenhet |
| Øvrige treningsavstander | Meter |
| Club Speed / Ball Speed | mph |
| Vinkler / spinn | Grader / rpm |
| Manglende verdi | — med forklaring, ikke oppdiktet null |
| Reell null | 0 er et faktisk resultat |
| Score og spillerkategori | Brutto score, aldri netto |

### 2.5 Produkt, booking og tilgang

Disse ordene beskriver produktet. Faktiske priser og rettigheter styres av produktreglene.

| Begrep | Betydning og språklig grense |
|---|---|
| Gratis / Pro | Appens brukerrettede nivånavn i produktreglene; ikke Premium eller Plus |
| FULL / TALENT / INGEN | Interne tilgangsutfall, ikke automatisk etiketter som brukeren skal se |
| Talentprofil | Gratis profil med avgrenset funksjonstilgang; ikke synonym for aktiv prøveperiode |
| Performance / Performance Pro | Coaching-pakker, ikke appnivåer |
| Coaching-time | Brukerrettet enhet for coaching-bookinger; ikke «credit» |
| GFGK Elite | Gruppenavn, ikke appnivå |
| Prøveperiode | Tidsavgrenset tilgang etter gjeldende produktregler |
| Oppsigelse | Avslutter abonnement etter gjeldende regler; ikke automatisk tap av allerede betalt tilgang |
| Avbestilling | Gjelder en booking; må ikke blandes med oppsigelse av abonnement |
| Lokasjon | Overordnet sted som bookingen er knyttet til |
| Fasilitet | Et bestemt rom, simulator eller treningssted under en lokasjon; ikke synonym for lokasjon |
| Booking | Bestilling av tid eller tjeneste; bekreftelse, betaling og gjennomføring er ulike forhold |
| Oppmøte / deltakelse | Om en bestemt spiller deltok; ikke det samme som gruppens gjennomføringsstatus |
| Privat / delt | Hvem innhold er tilgjengelig for; synlighet må følge faktisk tilgang, ikke en etikett alene |

Beløp, rabatter og besparelser hentes alltid fra gjeldende tilbudskilde.

## 3. Gjeldende treningsspråk og viktige skiller

- **Pyramiden:** FYS Fysisk → TEK Teknisk → SLAG Golfslag → SPILL Spill → TURN Turnering. Dette er visningsrekkefølge, ikke en begrensning på hva spilleren får trene.
- **19 treningsområder:** Utslag; Innspill ~50/~100/~150/~200 m; Chip; Pitch; Lob; Bunker; seks puttebånd; Styrke; Kondisjon; Bevegelighet; Banespill.
- **Puttebånd:** 0–3, 3–5, 5–10, 10–25, 25–40 og 40+ fot.
- **Læringssteg:** Uten ball, Lav hastighet, Automatikk. Læringssteg gjelder bare fullsving.
  Det historiske interne feltnavnet `motorikk` kan bestå under kontrollert overgang, men skal
  ikke brukes som synlig overskrift i Workbench.
- **Treningsmiljø:** Innendørs, Treningsområde, Bane, Konkurranse. Dette beskriver hvor og i
  hvilken situasjon treningen gjennomføres. Det historiske interne feltnavnet `belastning` kan
  bestå under kontrollert overgang. **Belastning** brukes synlig om fysisk treningsbelastning,
  intensitet eller motstand.
- **Press:** Alene, Observert, Konkurranse, Turnering.
- **AK-formelen:** PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS. Formelen merker den enkelte øvelsen eller testen.
- **Spillerkategori:** A–K, 11 nivåer, A er best. Kategorien beskriver brutto snittscore, ikke tilgang til trening. HCP er ikke samme måling.
- **Perioder og treningsblokker:** Frie merkelapper, ikke automatiske treningsforbud. Bruk fulle periodenavn i skjermen.
- **Økt, øvelse, repetisjon, sett og resultat:** Dette er ulike nivåer. Ett registrert trykk eller oppmøte er ikke automatisk én fullført øvelse eller et prestasjonsresultat.
- **Planlagt, registrert, gjennomført, lagret og delt:** Beskriver forskjellige forhold. Ikke bruk dem som synonymer.
- **Gruppeøkt og individuell økt:** Skill felles gjennomføring, individuelt oppmøte og privat notat. Ordvalg alene endrer ikke hvem som har tilgang.

## 4. Handlinger, statuser og meldinger

### 4.1 Handlingsord

Lagre · Ferdig · Bekreft · Fortsett · Send · Gjenoppta · Importer · Marker oppnådd · Avbryt · Lukk · Tilbake · Pause · Endre · Rediger · Vis · Skjul · Last ned · Eksporter · Be om hjelp · Marker som lest · Slett · Neste · Forrige · Be om økt · Registrer ny økt · Start økt · Avslutt · Se mer · Se alle · Åpne · Send melding · Oppgrader til Pro.

Bruk ordet som beskriver den faktiske handlingen. «Ferdig» sier ikke om noe også lagres.

**Registrere er standardordet for å føre data inn i appen.** Bruk «registrer», «registrert»
og «registrering» for resultat, oppmøte og gjennomføring. «Lagre» betyr at innhold bevares.
«Gjennomført» er statusen på en økt som er utført. «Logg inn» og «logg ut» beholdes.

**Blokktrening og variasjonstrening er treningsmetoder.** Bruk «øvelse» når grensesnittet
teller innholdet i økten, for eksempel «1 av 3 øvelser». En «treningsblokk» er et datospenn.

### 4.2 Tydelig betydning

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

### 4.3 Meldingsmønstre

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

Private arbeidsnotater, spillerens innhold og det delte sammendraget skal ha tydelige navn.

## 5. Faste statusord

| Gjelder | Bruk |
|---|---|
| Plan | Utkast · Venter på spiller · Godtatt · Avvist · Aktiv · Arkivert |
| Økt | Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over |
| Publisering | Ikke publisert · Publiserer · Publisert · Trukket tilbake |
| Lagring | Ikke lagret · Lagrer · Lagret · Kunne ikke lagres |
| AI-forslag | Forslag · Godkjent · Kjører · Utført · Feilet |
| Mål | Ikke startet · På vei · Nådd |

Bruk **Gjennomført** som øktstatus. Bruk **fullført** bare i naturlig brødtekst om noe som er
ført helt til slutt, for eksempel «Skjemaet er fullført». Bruk **Låst** når noe finnes, men
ikke kan åpnes eller endres med brukerens tilgang. Bruk **Åpen** om tilgjengelighet, aldri som
en generell erstatning for publisert eller aktiv.

## 6. Ord som ikke skal brukes

| Ikke bruk i ny skjermtekst | Bruk i stedet |
|---|---|
| Drill | Øvelse |
| Logge / føre data | Registrere |
| Session / workout | Økt |
| Goal | Mål |
| Stats | Statistikk |
| Schedule | Plan eller kalender |
| Subscription | Abonnement |
| Kortspill / rundt green | Nærspill |
| Ferdig som universell status | Den presise statusen: lagret, publisert, gjennomført eller utført |
| Premium / Plus | Gjeldende produktnivå |
| Emoji i UI | Tekst eller et relevant ikon |
