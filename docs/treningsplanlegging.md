# AK Golf HQ — språk og treningsplanlegging (MASTER)

**Status 21.09.2026:** Dette er den eneste masteren for språk, begreper, treningsmodell og
planlegging i AK Golf HQ. Den erstatter tidligere `ordbok.md`, gjennomgangsdokumentet fra
Teams-demoen og den forrige versjonen av denne fila. Det finnes ingen parallelle fasiter.
`docs/ordbok.md` er bare en peker hit. `docs/ordbok.json` er avledet, maskinlesbar data
generert av `scripts/ordbok-json.ts`, og er ikke et styrende dokument.

Dokumentet eier språk og fag, ikke utseende. [Gjeldende designautoritet](design-system/design-autoritet.md)
styrer alle skjermer. Gjennomføringen i kode og design styres av
[gjennomføringsplanen](planer/planlegging-trening-og-analyse-design-og-kode-2026-09-21.md).

**Regel for hele dokumentet:** planleggingen er veiledende. Ingen fordeling, periode, treningsform
eller pyramidegren er et automatisk krav eller en sperre (Anders 18.08.2026). Workbench foreslår
og viser bare relevante felt. Coachen og spilleren bestemmer.

## Innhold

1. Bruk av masteren
2. Språk og skrivemåte
3. Ord og uttrykk
4. Handlinger, statuser og meldinger
5. Planleggingsrekken og mål
6. Perioder
7. Uke og kalender
8. Økten
9. Øvelsen i åtte trinn
10. Trinn 1: pyramide (hensikt)
11. Trinn 2: treningsområde
12. Trinn 3: sted og treningsmiljø
13. Trinn 4: måleutstyr
14. Trinn 5: gjennomføring
15. Trinn 6: press
16. Trinn 7: mengde
17. Trinn 8: mål
18. Hele hierarkiet samlet
19. Låste verdier
20. Kodenøkler og overgang
21. Åpne punkter

## 1. Bruk av masteren

| Spørsmål | Styrende kilde |
|---|---|
| Ordvalg, staving, tall, enheter, meldinger | Kapittel 2–4 |
| Hvordan årsplan, periode, uke, økt og øvelse planlegges | Kapittel 5–18 |
| Verdier som er bekreftet og låst | Kapittel 19 |
| Interne kodenøkler og enum-verdier | Kapittel 20 |
| Produktnavn, abonnement, booking og tilgang | Kapittel 2.5 og gjeldende produktregler |
| Visuelt design | Den Claude Design-versjonen Anders velger. Masteren fastsetter ingen farger, fonter eller navigasjon |
| Faktisk funksjon | Kode og prøvd brukerreise. Dokumenttekst alene er ikke bevis |

**Instruks til Claude Design:** bruk ordene i denne masteren. Ikke hent språk fra eldre
designfiler eller arkiv. Ikke endre tekniske identifikatorer eller produktregler som del av
språkarbeid.

## 2. Språk og skrivemåte

### 2.1 Tone

- Norsk bokmål med æ, ø og å.
- Poenget først. Korte setninger, én tanke om gangen.
- Konkret beskrivelse fremfor vage dommer. Tall trenger datagrunnlag; ikke finn på data.
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
| Nærspill | Slag innenfor 50 m: chip, pitch, lob og bunker. Ikke «kortspill», «kort spill» eller «rundt green» som etikett |
| Restitusjon | Ikke «recovery» når det betyr hvile og restitusjon |
| I dag, i går, i morgen, denne uka | Skriv uttrykkene samlet |

**Øvelse er standardordet i brukergrensesnittet:** «øvelse», «øvelser», «øvelsesbibliotek».
«Drill» kan stå i tekniske identifikatorer, men ikke i skjermtekst.

### 2.3 TrackMan og måleparametere

TrackMan-parameteren beholder sitt engelske navn og stor forbokstav, også i norsk tekst.
Norsk forklaring følger etter. Eksempel med syntetisk tall: «Attack Angle −3,2°. Køllehodet
går nedover i treffet.» Tallet er ikke et dokumentert spillerresultat.

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
| Launch Direction | Ballens startretning i forhold til mållinjen |
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
|---|---|
| Desimal | Komma: 72,4 |
| Tusenskille | Mellomrom: 1 247 |
| Prosent | Mellomrom: 73 % |
| Tid | 24-timers klokke: kl. 09:00 |
| Varighet | 60 min, 1 t 30 min, 20 sek |
| Tall og enhet | Mellomrom: 5 sett, 150 m, 104 mph |
| Dato | 19. mai 2026; månedsnavn med liten forbokstav |
| SG | Fortegn og komma: +1,2 / −0,4; oppgi referanse og periode |
| HCP | Behold faktisk HCP og fortegn; ikke utled HCP fra score |
| Putting | Fot |
| Øvrige treningsavstander | Meter |
| Club Speed / Ball Speed | mph |
| Hastighet i læringssteg | Prosent av Club Speed (kapittel 19) |
| Vinkler / spinn | Grader / rpm |
| Manglende verdi | — med forklaring, ikke oppdiktet null |
| Reell null | 0 er et faktisk resultat |
| Score og spillerkategori | Brutto score, aldri netto |

### 2.5 Produkt, booking og tilgang

Faktiske priser og rettigheter styres av produktreglene. Beløp, rabatter og besparelser
hentes alltid fra gjeldende tilbudskilde.

| Begrep | Betydning og språklig grense |
|---|---|
| Gratis / Pro | Appens brukerrettede nivånavn i produktreglene; ikke Premium eller Plus |
| FULL / TALENT / INGEN | Interne tilgangsutfall, ikke automatisk etiketter brukeren skal se |
| Talentprofil | Gratis profil med avgrenset funksjonstilgang; ikke synonym for aktiv prøveperiode |
| Performance / Performance Pro | Coaching-pakker, ikke appnivåer |
| Coaching-time | Brukerrettet enhet for coaching-bookinger; ikke «credit» |
| GFGK Elite | Gruppenavn, ikke appnivå |
| Prøveperiode | Tidsavgrenset tilgang etter gjeldende produktregler |
| Oppsigelse | Avslutter abonnement etter gjeldende regler; ikke automatisk tap av betalt tilgang |
| Avbestilling | Gjelder en booking; må ikke blandes med oppsigelse av abonnement |
| Lokasjon | Overordnet sted som bookingen er knyttet til |
| Fasilitet | Et bestemt rom, simulator eller treningssted under en lokasjon |
| Booking | Bestilling av tid eller tjeneste; bekreftelse, betaling og gjennomføring er ulike forhold |
| Oppmøte / deltakelse | Om en bestemt spiller deltok; ikke det samme som gruppens gjennomføringsstatus |
| Privat / delt | Hvem innhold er tilgjengelig for; synlighet må følge faktisk tilgang |

## 3. Ord og uttrykk

| Tema | Valg | Betyr |
|---|---|---|
| Utført økt | **Gjennomført** | Økten er utført |
| Fullført | Bare i vanlig tekst | «Skjemaet er fullført» |
| Ikke tilgjengelig | **Låst** | Finnes, men kan ikke åpnes eller endres med brukerens tilgang |
| Tilgjengelig | **Åpen** | Kan åpnes eller brukes. Aldri erstatning for publisert eller aktiv |
| Dataføring | **Registrere** | Føre resultat, oppmøte eller aktivitet inn i appen |
| Bevare innhold | **Lagre** | Innholdet er bevart |
| Gjøre synlig | **Publisere** | Plan eller økt blir synlig for spilleren |
| Treningsinnhold | **Øvelse** | Tellbar del av en økt |
| Person som trener | **Spiller** | Standardrollen i appen |
| Fagperson | **Coach** | Standardrollen i appen |
| Kort spill rundt green | **Nærspill** | Felles navn for chip, pitch, lob og bunker |
| Spillervendt produkt | **PlayerHQ** | Spillerens appflate |
| Coachens arbeidsflate | **AgencyOS** | Coach- og organisasjonsflate |
| AI-assistent | **Caddie** | Assistenten i appen |
| Bevegelsesstiger | **Læringssteg** | Synlig navn i Workbench. Internt felt `motorikk` |
| Hvor treningen skjer | **Treningsmiljø** | Synlig navn. Internt felt `belastning` |
| Fysisk anstrengelse | **Belastning** | Bare om intensitet, vekt og motstand |
| Hvem som ser på | **Press** | Alene, Observert, Konkurranse, Turnering |

### Ord som ikke skal brukes i ny skjermtekst

| Ikke bruk | Bruk i stedet |
|---|---|
| Drill | Øvelse |
| Logge / føre data | Registrere |
| Session / workout | Økt |
| Goal | Mål |
| Stats | Statistikk |
| Schedule | Plan eller kalender |
| Subscription | Abonnement |
| Kortspill / rundt green | Nærspill |
| Motorikk som overskrift | Læringssteg |
| Belastning om treningsstedet | Treningsmiljø |
| Ferdig som universell status | Den presise statusen: lagret, publisert, gjennomført eller utført |
| Premium / Plus | Gjeldende produktnivå |
| Emoji i UI | Tekst eller et relevant ikon |

## 4. Handlinger, statuser og meldinger

### 4.1 Handlingsord

Lagre · Ferdig · Bekreft · Fortsett · Send · Gjenoppta · Importer · Marker oppnådd · Avbryt ·
Lukk · Tilbake · Pause · Endre · Rediger · Vis · Skjul · Last ned · Eksporter · Be om hjelp ·
Marker som lest · Slett

Bruk ordet som beskriver den faktiske handlingen. «Ferdig» sier ikke om noe også lagres.

**Registrere er standardordet for å føre data inn i appen:** «registrer», «registrert»,
«registrering» for resultat, oppmøte og gjennomføring. «Lagre» betyr at innhold bevares.
«Gjennomført» er statusen på en økt som er utført. «Logg inn» og «logg ut» beholdes.

**Blokktrening og variasjonstrening er treningsmåter.** Bruk «øvelse» når grensesnittet teller
innholdet i økten, for eksempel «1 av 3 øvelser». En «treningsblokk» er et datospenn.

| Handling / tilstand | Hva teksten må bety |
|---|---|
| Lagre | Bevare innholdet; ikke automatisk dele det |
| Lagret | Den aktuelle innholdsversjonen er bekreftet lagret |
| Lagrer | Lagringsforsøket pågår, ikke ferdig |
| Ikke lagret | Siste endringer mangler lagringsbekreftelse |
| Del / Send | Gjøre konkret innhold tilgjengelig for en oppgitt mottaker |
| Delt / Sendt | Den konkrete versjonen er bekreftet delt/sendt i det faktiske systemet |
| Oppdatering ikke delt | Forrige delte versjon kan fortsatt være synlig; siste endringer er ikke bekreftet delt |
| Fortsett / Gjenoppta | Åpne samme arbeid med beholdt identitet og registreringer |
| Avslutt | Avslutte aktiv gjennomføring; fullført eller delvis er et eget forhold |
| Avbryt | Stoppe dialogen eller handlingen; ikke implisitt slette innhold |
| Avbestill | Avbestille en booking etter gjeldende vilkår |
| Avvis | Ikke godta et forslag; ikke det samme som å angre |
| Angre | Reversere den angitte handlingen der dette faktisk støttes |
| Slett | Fjerne angitt innhold med tydelig konsekvens; ikke synonym for avvis |

### 4.2 Meldingsmønstre

| Situasjon | Tekst / krav |
|---|---|
| Lagring lykkes | «Lagret.» |
| Lagring feiler | «Endringene kunne ikke lagres. Prøv igjen.» Si at de er beholdt bare når det er sikkert |
| Ny redigering under lagring | «Du har nye endringer som ikke er lagret.» |
| Første deling feiler | «Beskjeden kunne ikke deles. Prøv igjen.» |
| Oppdatert deling feiler | «Oppdateringen kunne ikke deles. Spilleren ser fortsatt versjonen fra {tid}.» Bare når en tidligere versjon faktisk er delt |
| Plan er ikke delt | «Oppdateringen er ikke publisert.» |
| Økt er utført | «Økten er gjennomført.» |
| Ingen målinger | «Ingen målinger ennå.» Vis —, ikke oppdiktede verdier |
| Ingen økter | «Ingen økter denne uken.» |
| Ingen søketreff | «Ingen spillere passer søket.» Skill fra en tom stall |
| Offline | Forklar hvilken handling som venter og hvor innholdet er bevart |
| AI-forslag | «Forslag» før godkjenning. «Godkjent» er ikke det samme som «Utført» |

### 4.3 Faste statusord

| Gjelder | Bruk |
|---|---|
| Plan | Utkast · Venter på spiller · Godtatt · Avvist · Aktiv · Arkivert |
| Økt | Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over |
| Publisering | Ikke publisert · Publiserer · Publisert · Trukket tilbake |
| Lagring | Ikke lagret · Lagrer · Lagret · Kunne ikke lagres |
| AI-forslag | Forslag · Godkjent · Kjører · Utført · Feilet |
| Mål | Ikke startet · På vei · Nådd |

## 5. Planleggingsrekken og mål

```text
Mål og analyse
  → Årsplan
    → Periode
      → Måned
        → Uke
          → Økt
            → Øvelse
              → Pyramide
              → Treningsområde
              → Relevante valg for området
              → Mengde og mål
            → Gjennomføring
              → Resultat og treningsdata
                → Analyse
                  → Neste tiltak i planen
```

| Nivå | Hva planlegges |
|---|---|
| Årsplan | Sesong, perioder, turneringer, tester og samlet mengde |
| Periode | Datospenn, fokus, ukevolum, øktbudsjett og mål |
| Måned | Fire til seks uker ut fra periodens retning |
| Uke | Tidspunkt, økter, skole, booking, reise og annet opptatt |
| Økt | Navn, tid, varighet, pyramide, sted, øvelser og notater |
| Øvelse | Pyramide, område, relevante valg, mengde og mål |

### 5.1 Årsplan

En årsplan inneholder år og sesong, perioder med fra- og til-dato, turneringer og tester,
planlagte og gjennomførte timer, og fordeling mellom FYS, TEK, SLAG, SPILL og TURN.

### 5.2 Målsetninger i PlayerHQ

| Måltype | Beskriver | Eksempel |
|---|---|---|
| Resultatmål | Resultatet spilleren ønsker å oppnå | Topp 10 i NM · HCP under 5 · SG Putting til 0,0 |
| Prosessmål | Handlingene spilleren skal gjennomføre jevnlig | Tre putteøkter per uke · to FYS-økter per uke |

Et resultatmål kan støttes av flere prosessmål. De vises hver for seg i PlayerHQ, men samlet
når spilleren vurderer om treningen fører mot resultatet. Prosessmål kan knyttes til
pyramidegren, test eller treningsområde når det finnes et faktisk datagrunnlag. Systemet skal
aldri fremstille sammenfall som bevist årsak.

### 5.3 Mål på planleggingsnivå

Et mål hører til ett nivå: år, periode, måned, uke eller økt. Valget lagres som `planNivaa` i
målets `payload`. Uten valg foreslås nivået fra fristen (ingen frist: år; inntil 1 dag: økt;
inntil 7 dager: uke; inntil 35: måned; inntil 120: periode; ellers år). Visningen skiller alltid
mellom valgt og foreslått nivå. I Workbench viser hvert mål type, frist, nivå, fremdrift og
planlagt/gjennomført/uteblitt. Sporet regnes bare for mål koblet til et pyramide-område.

## 6. Perioder

| Periodetype | Brukes til |
|---|---|
| Grunnperiode (`GRUNN`) | Bygge kapasitet, teknisk grunnlag og treningsvaner |
| Spesialperiode (`SPESIAL`) | Spesifikk trening mot spillerens behov |
| Turneringsperiode (`TURNERING`) | Forberedelse og gjennomføring rundt turneringer |
| Evalueringsperiode (`EVALUERING`) | Oppsummering, analyse og justering |
| Testuke (`TESTUKE`) | Tester og målinger |
| Ferie (`FERIE`) | Ferie, pause eller redusert plan |
| Treningssamling (`TRENINGSSAMLING`) | Samling over flere økter eller dager |
| Heldagssamling (`HELDAGSSAMLING`) | Samling med heldagsformat |

| Felt | Betydning |
|---|---|
| Fra og til | Fritt datospenn; ikke låst til hele kalenderuker |
| Fokus | Hva perioden handler om |
| Ukevolum | Planlagt mengde per uke, i minutter eller timer |
| Øktbudsjett per uke | Antall økter per pyramide |
| Fordeling på pyramiden | FYS, TEK, SLAG, SPILL og TURN |
| Periodemål | Hva spilleren skal utvikle eller oppnå |
| Notater | Fritekst |

## 7. Uke og kalender

Uken er arbeidsflaten der økter opprettes, flyttes, gjentas og publiseres.

| Kalenderinnhold | Betydning |
|---|---|
| Økt (`OEKT`) | Individuell treningsøkt |
| Gruppeøkt (`GRUPPEOEKT`) | Felles økt for en gruppe |
| Skole (`SKOLE`) | Skoletid eller skoleblokk |
| Booking (`BOOKING`) | Coachtime eller bestilt fasilitet |
| Turnering (`TURNERING`) | Turneringsdeltakelse |
| Reise (`REISE`) | Reisetid |
| Test (`TEST`) | Testgjennomføring |
| Sjekkpunkt (`SJEKKPUNKT`) | Avtale eller kontrollpunkt |
| Helse (`HELSE`) | Helse, restitusjon eller oppfølging |

Skole, booking, reise og andre opptattblokker gir kontekst. De bestemmer ikke automatisk hva
spilleren får planlegge.

## 8. Økten

Når en økt opprettes, velges: dato og starttid, varighet, navn, dominerende pyramide, type
kalenderinnhold, sted når det er relevant, øvelser og notater. Økten er et utkast til den
publiseres. En publisert økt kan starte, pågå og bli gjennomført.

## 9. Øvelsen i åtte trinn

```text
1. Hensikt          Hva slags trening er dette?      Fys · Tek · Slag · Spill · Turn
2. Treningsområde   Hva trener spilleren på?          Utslag · Innspill · Nærspill · Putting · Fysisk · Spill
3. Sted og miljø    Hvor gjennomføres øvelsen?        Range · Treningsområde · Bane, korthullsbane · TM Simulator · Treningsrom · Hjemme
4. Måleutstyr       Hvordan måles øvelsen?            Med TrackMan · Uten TrackMan · Annen radar · Ikke relevant
5. Gjennomføring    Hvordan skal spilleren trene?     Læringssteg · Treningsmåte · Teknisk fokus
6. Press            Hvem ser på?                      Alene · Observert · Konkurranse · Turnering
7. Mengde           Hvor mye skal gjøres?             Slag · Putter · Hull · Tid · Serier · Repetisjoner
8. Mål              Hva skal øvelsen flytte?          Målsetning · Målemetode · Resultatkrav · Notat
```

**Eksempel, teknikkøvelse:**

```text
TEK → Innspill 100–150 m → Simulator → Med TrackMan → Lav hastighet (50 % av Club Speed)
    → Lengdekontroll → Observert → 30 slag → Minst 20 innenfor valgt målområde
```

**Pyramidegrenene er separate.** Felter som hører til Fysisk vises ikke i Teknikk. Et valg i én
gren overskriver ikke lagrede valg i en annen. Det er en regel om hva som vises og lagres, ikke
en sperre: alle områder kan fortsatt velges under alle pyramidegrener.

## 10. Trinn 1: pyramide (hensikt)

| Valg | Betyr |
|---|---|
| FYS (`FYS`) Fysisk | Utvikle fysisk kapasitet |
| TEK (`TEK`) Teknisk | Utvikle bevegelse og teknisk utførelse |
| SLAG (`SLAG`) Golfslag | Utvikle et bestemt golfslag |
| SPILL (`SPILL`) Spill | Bruke ferdighetene i en spillsituasjon |
| TURN (`TURN`) Turnering | Forberede eller gjennomføre turneringsspill |

Pyramiden beskriver **hensikten**. Den foreslår område og felt, men låser dem ikke.

| Valgt pyramide | Første valg | Felter som vises | Felter som ikke vises |
|---|---|---|---|
| Fysisk | Styrke · Kondisjon · Bevegelighet | Fysiske parametere for valgt område | Læringssteg · teknisk fokus · TrackMan |
| Teknikk | Utslag · Innspill · Nærspill · Putting | Læringssteg der det gjelder · teknisk fokus · sted · måleutstyr · mengde · mål | Serier, RIR og intensitetssoner |
| Golfslag | Utslag · Innspill · Nærspill · Putting | Slagtype · treningsmåte · sted · måleutstyr · press · mengde · resultatkrav | Fysiske parametere · læringssteg som standard |
| Spill | Banespill og spilløvelse | Spilleformat · situasjon · sted · press · hull eller tid · resultat | Fysiske parametere · læringssteg |
| Turnering | Konkret turnering eller turneringsøkt | Turnering · runde · forberedelse · press · mål · evaluering | Fysiske parametere · læringssteg |

**FYS:** velg Styrke, Kondisjon eller Bevegelighet. Treningsmiljø og press skjules når de ikke
er relevante.
**TEK:** golfområde → eventuelt læringssteg → eventuelt ett teknisk fokus → sted og måleutstyr →
press → mengde og mål.
**SLAG:** slagområde → eventuelt én dimensjon → treningsmåte → sted og måleutstyr → press →
antall slag eller putter og resultatkrav.
**SPILL:** Banespill foreslås; arena velges under sted. Velg Spilleformat eller Strategioppgave,
press og hull, tid eller oppgaver.
**TURN:** knytt økten til turneringen, velg runde og bane, forberedelse eller spilleplan, mål og
fokus, og evaluer runden etterpå. Treningsmiljø settes vanligvis til Konkurranse og press til
Turnering. «Vanligvis» betyr forslag, ikke tvang.

## 11. Trinn 2: treningsområde

Alle fem pyramidegrener kan kombineres med alle områder. Workbench kan foreslå et naturlig
startpunkt, men skal ikke sperre andre valg.

| Familie | Valg |
|---|---|
| Utslag | Utslag (`TEE_TOTAL`), også kalt Tee Total |
| Innspill | 200 m og lengre (`INNSPILL_200`) · 150–200 m (`INNSPILL_150`) · 100–150 m (`INNSPILL_100`) · 50–100 m (`INNSPILL_50`) |
| Nærspill (slag innenfor 50 m) | Chip (`CHIP`) · Pitch (`PITCH`) · Lob (`LOB`) · Bunker (`BUNKER`) |
| Putting | 0–3 fot (`PUTT_0_3`) · 3–5 fot (`PUTT_3_5`) · 5–10 fot (`PUTT_5_10`) · 10–25 fot (`PUTT_10_25`) · 25–40 fot (`PUTT_25_40`) · 40+ fot (`PUTT_40_PLUSS`) |
| Fysisk | Styrke (`STYRKE`) · Kondisjon (`KONDISJON`) · Bevegelighet (`BEVEGELIGHET`) |
| Spill | Banespill (`BANE`) og spilløvelse. Spill er ikke det samme som bane: en spilløvelse kan gjennomføres på bane, i simulator eller på treningsområde. Arenaen velges i trinn 3 |

Det er området, ikke pyramiden, som bestemmer hvilke detaljvalg som kommer videre:

| Valgt område | Neste valg |
|---|---|
| Utslag og Innspill | Læringssteg · teknisk fokus · sted · måleutstyr · press · mengde |
| Chip, pitch eller lob | Teknisk fokus · sted · måleutstyr · press · mengde |
| Bunker | Sandtrinn · teknisk fokus · sted · måleutstyr · press · mengde |
| Putting | Puttingfokus · sted · måleutstyr · press · antall putter |
| Styrke | Serier · repetisjoner · belastning (vekt) · RIR · pause · mål |
| Kondisjon | Aktivitet · varighet eller distanse · intensitetssone · intervaller og pauser · mål |
| Bevegelighet | Område eller øvelse · tid · repetisjoner · mål |
| Banespill | Spilleformat eller strategioppgave · sted · press · antall hull |

## 12. Trinn 3: sted og treningsmiljø

Valget beskriver hvor og i hvilket miljø øvelsen gjennomføres. Det er atskilt fra hva spilleren
trener på og fra måleutstyret. Synlig navn: **Treningsmiljø**. **Belastning** brukes ikke om
stedet.

```text
TRENINGSMILJØ
├── Utendørs treningsområde
│   ├── Driving range → Matte · Gress · Overdekket · Åpent
│   ├── Nærspillsområde → Chip · Pitch · Lob · Bunker · Innspill
│   ├── Puttinggreen → Flat · Helling · Kort putt · Lang putt
│   └── Korthullsbane
├── Golfbane
│   ├── Hele banen · Første ni · Siste ni · Valgte hull
│   ├── Ett hull eller gjentatt situasjon
│   └── Treningsrunde · Turneringsrunde
├── Innendørs golf
│   ├── Simulator → Spill · Range · Nærspill · Putting · Test · Konkurranse
│   ├── Golfstudio → Nett · Matte · Speil · Kamera · Puttingflate
│   └── Innendørs treningshall
├── Fysisk treningssted
│   ├── Treningsrom · Styrkerom · Kondisjonsområde
│   └── Bevegelighetsområde · Utendørs · Hjemme
├── Hjemme / eget sted
│   └── Inne · Ute · Puttingmatte · Nett · Speil · Uten utstyr
└── Annet sted
    └── Skole · Treningssamling · Annen klubb · Fritekst
```

| Hovedmiljø | Detaljvalg som kan vises | Aktuelle grener |
|---|---|---|
| Utendørs treningsområde: Driving range | Matte/gress · overdekket/åpent · målgreen · avstandsmerker · egen/delt plass | TEK · SLAG · SPILL |
| Utendørs treningsområde: Nærspillsområde | Chip · pitch · lob · bunker · innspill · green · ulike lies | TEK · SLAG · SPILL |
| Utendørs treningsområde: Puttinggreen | Flat/helling · korte/lange putter · hullplassering · treningsstasjon | TEK · SLAG · SPILL |
| Utendørs treningsområde: Korthullsbane | Antall hull · valgte hull · utslagssted · spillformat | SLAG · SPILL · TURN |
| Golfbane | Bane · tee · hull · antall hull · starttid · treningsrunde eller turneringsrunde | TEK · SLAG · SPILL · TURN |
| Innendørs golf: Simulator | Anlegg · program/bane · virtuell range, spill eller test · antall hull · spilleroppsett | TEK · SLAG · SPILL · TURN |
| Innendørs golf: Golfstudio | Nett · matte · speil · kamera · puttingflate · tilgjengelig måleutstyr | TEK · SLAG |
| Innendørs golf: Treningshall | Stasjon · mål · nett · matte · fysisk område | FYS · TEK · SLAG · SPILL |
| Fysisk treningssted: Treningsrom/styrkerom | Tilgjengelig utstyr · treningssone · program · veiledning | FYS |
| Fysisk treningssted: Utendørs | Underlag · løype · bakke · distanse · værforhold | FYS |
| Hjemme | Plass · puttingmatte · nett · speil · fysisk utstyr · uten utstyr | FYS · TEK · SLAG |
| Annet | Stedsnavn · adresse · rom eller område · fasiliteter · fritekst | Alle |

Valg som følger etter sted, alle valgfrie og bare når de er relevante: konkret lokasjon,
delområde (utslagsplass, green, bunker, hull, stasjon), underlag (gress, matte, sand, kunstgress,
gulv), oppsett (nett, speil, kamera, kjegler), fasilitet (booket, delt, coachområde, egen plass)
og forhold (inne/ute, vær, vind, temperatur, greenhastighet, lie).

**Forslag per pyramide:**

| Pyramide | Foreslås først | Fortsatt mulig |
|---|---|---|
| Fysisk | Treningsrom · styrkerom · utendørs · hjemme | Treningshall · annet |
| Teknikk | Range · nærspill · puttinggreen · studio · simulator | Bane · hjemme · annet |
| Golfslag | Range · nærspill · puttinggreen · simulator | Bane · studio · korthullsbane |
| Spill | Bane · korthullsbane · simulator · treningsområde | Puttinggreen · nærspill · annet |
| Turnering | Konkret bane · simulatorturnering | Korthullsbane · annet konkurransested |

Arenaen endrer ikke pyramidevalget: en simulatorøvelse valgt som SPILL forblir SPILL, og en
turneringsøkt i simulator forblir TURN.

**Eksempler:**

```text
TEK → Innspill 100–150 m → Utendørs treningsområde → Driving range → Gress → Åpent
      (måleutstyr velges separat i trinn 4)
SPILL → Banespill → Innendørs golf → Simulator → Valgt bane → 18 hull → Konkurranseform
FYS → Styrke → Fysisk treningssted → Styrkerom → Tilgjengelig utstyr
```

## 13. Trinn 4: måleutstyr

| Valg | Betyr |
|---|---|
| Med TrackMan | Slagene måles med TrackMan |
| Uten TrackMan | Øvelsen gjennomføres uten TrackMan-data |
| Annen radar | FlightScope, R10, Mevo+ eller annet utstyr |
| Ikke relevant | Øvelsen trenger ikke måleutstyr |

TrackMan er et tydelig valg i planleggingen. Coachen skal ikke måtte gjette det ut fra om
øvelsen er inne eller ute.

## 14. Trinn 5: gjennomføring

Tre ulike ting: læringssteg, treningsmåte og teknisk fokus.

### 14.1 Læringssteg (bare Utslag og Innspill)

Synlig navn er **Læringssteg**. Det interne feltet heter `motorikk`.

| Steg | Betyr | Hastighet |
|---|---|---|
| Uten ball (`UTEN_BALL`) | Bevegelsen øves uten ball | Ingen hastighet oppgis |
| Lav hastighet (`LAV_HAST`) | Bevegelsen utføres rolig med ball | 25 %, 50 % eller 75 % av Club Speed |
| Automatikk (`AUTO`) | Bevegelsen utføres i normal golfhastighet | 100 % av Club Speed |

Hastigheten oppgis alltid som **prosent av spillerens Club Speed**: 25, 50, 75 eller 100 %. Se
kapittel 19. Feltet vises bare for Utslag og Innspill.

### 14.2 Treningsmåte

| Valg | Betyr |
|---|---|
| Blokktrening | Samme oppgave gjentas |
| Variasjonstrening | Oppgaven eller situasjonen varierer |
| Konkurranseform | Poeng, duell, krav eller resultat |
| Spill/test | Spillnær oppgave eller testprotokoll |

### 14.3 Teknisk fokus (ett valgfritt fokus per øvelse)

| Område | Valg |
|---|---|
| Utslag | Sikte og oppstilling (`SIKTE`) · Startretning (`STARTRETNING`) · Kurve (`KURVE`) · Treffpunkt (`TREFFPUNKT`) |
| Innspill 200 m og lengre | Startretning · Kurve · Høyde (`HOYDE`) · Treffpunkt |
| Innspill 150–200 m | Startretning · Kurve · Høyde · Lengdekontroll (`LENGDEKONTROLL`) |
| Innspill 100–150 m | Lengdekontroll · Startretning · Høyde |
| Innspill 50–100 m | Lengdekontroll · Høyde · Spinn (`SPINN`) |
| Chip | Landingspunkt (`LANDINGSPUNKT`) · Utrulling (`UTRULLING`) · Treffpunkt · Køllevalg (`KOLLEVALG`) |
| Pitch | Lengdekontroll · Landingspunkt · Høyde · Spinn |
| Lob | Høyde · Landingspunkt · Bruk av bounce (`BOUNCE_BRUK`) · Treffpunkt |
| Bunker | Sandinngang (`SANDINNGANG`) · Lengdekontroll · Høyde · Lie-variasjon (`LIE_VARIASJON`) |
| Putting | Greenlesing (`GREENLESING`) · Ballstart (`BALLSTART`) · Sikte · Lengdekontroll |
| Banespill | Spilleformat (`SPILLEFORMAT`) · Strategioppgave (`STRATEGIOPPGAVE`) |

**Sandtrinn (bare bunker):** Uten ball i sanden (`UTEN_BALL_I_SAND`) · Med ball (`MED_BALL`).

## 15. Trinn 6: press

Feltet heter **Press** og svarer på hvem som ser på og hvilken situasjon som trenes.

| Valg | Betyr |
|---|---|
| Alene (`ALENE`) | Ingen observerer eller konkurrerer |
| Observert (`OBSERVERT`) | Coach, medspiller eller gruppe ser på |
| Konkurranse (`KONKURRANSE`) | Resultatet sammenlignes eller konkurreres om |
| Turnering (`TURNERING`) | Reell turneringssituasjon |

**Konkurranse** forekommer på to steder med ulik betydning: som press (hvem som ser på og
sammenligner) og som treningsmåte (Konkurranseform: øvelsen er bygget opp med poeng, duell eller
krav). De kan brukes sammen eller hver for seg.

## 16. Trinn 7: mengde

| Område | Mengde registreres som |
|---|---|
| Utslag, innspill og nærspill | Antall slag |
| Putting | Antall putter |
| Banespill | Hull, tid eller antall oppgaver |
| Styrke | Serier, repetisjoner, pause, RIR og vekt |
| Kondisjon | Segmenter med tid og intensitetssone |
| Bevegelighet | Tid |

## 17. Trinn 8: mål

| Felt | Eksempel |
|---|---|
| Målsetning | Bedre startretning med driver |
| Målemetode | TrackMan: Launch Direction |
| Resultatkrav | 20 av 30 innenfor målområdet |
| Notat | Fokus på samme oppstilling før hvert slag |

Målfeltene vises som en del av alle grener. Resultatkrav og målemetode oppgis bare når det
finnes et datagrunnlag.

## 18. Hele hierarkiet samlet

```text
ØKT
└── ØVELSE
    └── 1. Hensikt / pyramide
        ├── FYS
        │   └── Fysisk område → fysiske parametere → mengde → mål
        ├── TEK
        │   └── Golfområde → teknisk fokus → læringssteg ved behov
        │       → sted → måleutstyr → treningsmåte → press → mengde → mål
        ├── SLAG
        │   └── Golfområde → konkret slag → treningsmåte
        │       → sted → måleutstyr → press → mengde → resultatkrav
        ├── SPILL
        │   └── Arena → spilleformat eller situasjon → press → hull eller tid → mål
        └── TURN
            └── Turnering → runde og bane → forberedelse → mål → evaluering
```

Ingen gren arver detaljfeltene fra en annen. Bare relevante fellesfelt (navn, dato og starttid,
varighet, sted, mengde, mål og notat) gjenbrukes.

## 19. Låste verdier

| Verdi | Låst | Dato |
|---|---|---|
| Hastighet i læringssteg | **25, 50, 75 og 100 prosent av Club Speed.** Lav hastighet er 25, 50 eller 75 %; Automatikk er 100 %. Uten ball har ingen hastighet | Bekreftet av Anders 21.09.2026 |
| Press | Alene · Observert · Konkurranse · Turnering | 05.08.2026 |
| Regelhåndheving | Ingen treningsregel er sperre; alt er veiledende | 18.08.2026 |
| Score | Brutto, aldri netto | Fast regel |
| Avstander | Fot for putting, meter ellers | Fast regel |

Den gamle CS-skalaen (CS0, CS20–CS100 som koder), L-fasene, miljøkodene M0–M5 og presskodene
PR1–PR5 er utgått og skal ikke gjeninnføres. Prosentene over er hastighet i forhold til
spillerens egen Club Speed, ikke en kodet skala.

## 20. Kodenøkler og overgang

Nøklene under er interne og endres ikke som del av språkarbeid.

| Synlig navn | Internt felt | Verdier |
|---|---|---|
| Læringssteg | `motorikk` | `UTEN_BALL` · `LAV_HAST` · `AUTO` |
| Treningsmiljø | `belastning` | `INNENDORS` · `TRENINGSOMRAADE` · `BANE` · `KONKURRANSE` |
| Press | `press` | `ALENE` · `OBSERVERT` · `KONKURRANSE` · `TURNERING` |
| Teknisk fokus | `dimensjon` | Se 14.3 |
| Treningsmåte | `practiceType` | `BLOKK` · `VARIABEL` · `KONKURRANSE` · `SPILL_TEST` |

**Overgang for Treningsmiljø.** Databasen lagrer i dag fire grove verdier. Det nye
sted-hierarkiet i kapittel 12 legges til som ekstra, ikke-obligatoriske valg uten endring av
databaseskjemaet. Den grove verdien utledes slik: Innendørs golf og innendørs fysisk sted gir
`INNENDORS`; Utendørs treningsområde, hjemme og annet gir `TRENINGSOMRAADE`; Golfbane gir
`BANE`. `KONKURRANSE` som miljøverdi beholdes for eksisterende data; i ny planlegging uttrykkes
konkurranse som Press og Treningsmåte (kapittel 15).

**Overgang for Innspill.** Nøklene beholdes. `INNSPILL_200` viser «200 m og lengre»,
`INNSPILL_150` «150–200 m», `INNSPILL_100` «100–150 m», `INNSPILL_50` «50–100 m». Ingen
datamigrering.

**Hastighet i prosent.** Lagres som `detaljer.hastighetProsent` (25, 50, 75 eller 100) på
øvelsens `akFormel`, uten databaseendring. Se `HASTIGHET_PROSENT` i
`src/lib/domain/ak-formel-v2.ts` og `src/lib/domain/workbench/ovelse-detaljer.ts`, som også eier
sted, måleutstyr, treningsmåte, mengde og målfelt.

**Stavemåte i koden.** Workbench skriver miljøverdien `TRENINGSOMRADE` (én A), mens
AK-formelen skriver `TRENINGSOMRAADE`. Skjemaet skriver Workbench-varianten.

**AK-formelen:** `PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS`. Den merker den enkelte øvelsen
eller testen. Databasen beholder de finkornede enum-verdiene; `ak-formel-v2.ts` er broen.

## 21. Åpne punkter

| Punkt | Status |
|---|---|
| Kobling mellom fysisk økt og fysisk plan eller program | Ikke avklart |
| Hvilke TrackMan-parametere som foreslås per teknisk fokus | Ikke avklart |
| Om intensitet i Fysisk angis med sone, RPE, puls eller flere | Ikke avklart |
| Om flere tekniske fokus per øvelse skal tillates | Nei i dag: maksimalt ett |
| Øvelsesskjemaet for kapittel 9–17 | Bygget i Workbench Økt (`OvelseSkjema.tsx`): inspektør på desktop, bunnark på mobil under 1024 px. Sett i komponentprøve, ikke i innlogget app |
| Redigering av eksisterende øvelse med de nye feltene | Ikke bygget: skjemaet legger til nye øvelser |
| Flytt opp/ned og fjern øvelse på mobil | Ikke bygget: bare «Legg til øvelse» har mobilvei |
| Kondisjon: intensitetssone og segmenter | Ikke bygget, venter på avklaring av sone, RPE eller puls |
