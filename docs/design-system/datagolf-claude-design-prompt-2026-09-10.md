# DataGolf – komplett prompt til den pågående Claude Design-samtalen

Bestilt av Anders 10.09.2026. Lim inn hele blokken i samtalen der den aktuelle designretningen for AK Golf HQ allerede utvikles. Prompten beskriver funksjon og datakrav; den velger ikke en ny visuell retning.

Grunnlag: [implementert spillerverktøy](../planer/datagolf-spillerverktoy-2026-09-10.md) og [dataanalyse](../beslutningsgrunnlag/datagolf-analyse-og-anbefaling-2026-09-10.md). Eksempeltallene nedenfor er syntetiske. Dokumentet er en designbestilling, ikke en visuell godkjenning eller produksjonskontroll.

```xml
<oppgave>
Design hele DataGolf-verktøyet for spillere i AK Golf HQ / PlayerHQ, innenfor designretningen vi allerede arbeider med i denne Claude Design-samtalen.

Viderefør den siste versjonen vi har valgt eller aktivt utvikler her: appskall, navigasjon, typografi, farger, avstander, komponenter, ikoner, bevegelse og avtalte temaer. Bruk eksisterende Analyse- og Tren-skjermer som nærmeste referanser. Oppgi kort hvilken konkret versjon eller hvilke skjermer du bygger videre på.

Funksjonene nedenfor skal bevares. Organiser dem slik at de passer naturlig inn i vårt nåværende design. Tidligere Train-lock-skjermer og dagens kodeoppsett er arbeidsunderlag, ikke bindende visuell fasit.

Lever faktiske skjermdesign, en klikkbar prototype og en komplett overlevering til utvikling. Gjennomfør hele skjermfamilien; en plan eller én pen startskjerm er ikke hele leveransen.
</oppgave>

<kontekst>
Verktøyet skal hjelpe spilleren med å forstå hvor gode proffene er, sammenligne seg med dem og utforske konkrete ferdigheter.

Hovedreisen er:
Velg proff → forstå nivået → sammenlign med meg eller en annen proff → utforsk innspill og turneringsresultater → prøv selv → se egen historikk.

Utforsking skal fungere uten egne registrerte runder og uten egen DataGolf-ID. Egne tall gir mer verdi når de finnes. Språket skal være norsk bokmål, kort, motiverende og faglig presist.

DataGolf-funksjonene er allerede implementert i prosjektet. Denne bestillingen gjelder design, samspill og overlevering til den nye designretningen. Datadekningen varierer: en proff kan ha ferdighetsprofil og resultater, men mangle detaljerte innspillstall.

Plassering: PlayerHQ → Analyse → DataGolf.
Hovedadresse: /portal/analysere/datagolf
Prøv selv: /portal/analysere/datagolf/stasjon
Registrer egen runde: /portal/mal/runder/ny
Egen turneringskalender: /portal/tren/turneringer

Dette er et spillerverktøy. Utforsking skal ikke automatisk endre spillerens treningsplan. Bevar eksisterende tilgang; ikke legg til nye abonnementskrav eller en obligatorisk veiviser.
</kontekst>

<skjermer_og_brukerreise>
Punktene er logiske visninger. Bruk sider, faner, paneler eller dialoger etter det etablerte designet; de trenger ikke hver sin adresse.

DG-01 – Inngang og proffvalg
• Gjør hensikten forståelig med én kort setning og et tydelig neste steg.
• Søk og velg proff fra en liste som kan romme flere hundre profiler.
• Vis hvem som er valgt, og gjør det enkelt å bytte.
• Design søk uten treff, tom datakilde, lasting og feil med nytt forsøk.
• Ikke krev at spilleren registrerer egne data før utforsking.

DG-02 – Proffens profil
• Vis navn, dato på ferdighetsmodellen, samlet forventet SG og fire områder: utslag, innspill, nærspill og putting.
• Fremhev proffens største relative styrke med forståelig tekst.
• Vis tilgjengelige driververdier og faktiske runder med riktig enhet og referanse.
• Tilby naturlige innganger til sammenligning, innspill og resultater.

DG-03 – Meg mot proff
• Velg 12, 24 eller 50 siste registrerte runder. Vis hvor mange som faktisk inngår, og tidsrommet for hver spiller.
• Sammenlign brutto rundesnitt, fairwaytreff og greentreff i regulært antall slag, forklart som GIR ved behov.
• Hver måling har sitt eget datagrunnlag. Vis manglende verdi som «—» med kort forklaring.
• Bruk bare dokumenterte komplette 18-hullsrunder til egne fullrundemål. Delvis hullstatistikk skal ikke bli et fullstendig rundetall.
• Egne historiske DataGolf-runder kan være kilde når ordinære komplette runder mangler. Vis den faktiske kilden.
• Ved manglende egne data: behold proffens verdier og gi en diskret inngang til å registrere en runde.
• Ikke beregn et justert nivågap fra rundesnitt spilt på forskjellige baner.

DG-04 – Proff mot proff
• Velg en andre proff og sammenlign samme målinger i samme enheter.
• Gjør bytte av proff enkelt. Bevar valgene og rundeutvalget når brukeren går tilbake.
• Vis modellprofil og historiske resultater med hver sin referanse og periode.
• Utform også en variant hvor den ene proffen mangler en måling eller har en annen kildedato.

DG-05 – Innspill
• Velg fairway eller rough og ett av de faktiske avstandsintervallene nedenfor.
• Vis justert nærhet til hullet i meter som hovedmåling, med SG per slag, greentreff, gode slag og antall slag som utdyping.
• Vis periode og kildedato. En sammenligning krever samme intervall og leie.
• Forklar enkelt at tallene er justert for hvor vanskelig slaget var.
• La spilleren gå direkte til «Prøv selv» med valgt proff og gyldig intervall.
• Design manglende innspillsdata uten å gjøre resten av proffprofilen utilgjengelig.

DG-06 – Turneringsresultater
• Vis turneringer i omvendt datoorden, med detaljvisning av tilgjengelige runder.
• Bruk faktisk brutto score, score mot par, tilgjengelig SG og dokumentert plassering/status.
• Skill turneringsdato fra når data ble hentet. Ikke merk historiske resultater som «live».
• Et begrenset rundeutvalg kan vise bare deler av en turnering. Ikke gjett sluttscore, plassering eller at turneringen er fullført.
• Bevar spillerens egne importerte og manuelt registrerte turneringsstarter med kilde og lenke til egen kalender.

DG-07 – Sett opp «Prøv selv»
• Vis hva spilleren skal gjøre, valgt proff eller egen treningsregel, slagtype, relevant avstand og leie, og konkret mål.
• For innspill må avstanden ligge i proffreferansens faktiske intervall og leiet stemme.
• Bruk proffens justerte nærhet som radius på et treningsmål. Radiusen skaleres ikke proporsjonalt med spillerens carry.
• Forklar at sirkelen er et treningsmål basert på et gjennomsnitt. Den beskriver ikke proffens treffprosent eller spredning.
• Bevar de eksisterende slagvalgene gjennom en oversiktlig, gruppert velger: tee; fire innspillsgrupper fra fairway og de to kildeintervallene fra rough; chip, pitch, lob og bunker; putting 0–3, 3–5, 5–10, 10–40 og 40+ fot.
• Tee, kortspill og putting uten individuell DataGolf-måling merkes «Egen treningsregel». Putting har fot som hovedenhet. En eventuell 30-meters korridor for tee er en egen regel, ikke proffens målte spredning.

DG-08 – Gjennomfør forsøket
• Registrer ti baller som innenfor eller utenfor målet. Uregistrert er en egen tilstand.
• Vis tydelig fremdrift, og la spilleren rette et feiltrykk.
• Alle ti må være registrert før lagring. Skill «10 av 10 registrert» fra «Lagret».
• Design lagring pågår, lagret og lagring feilet. Ved feil beholdes alle registreringene, og spilleren kan prøve igjen.
• Gjentatt trykk på lagre skal ikke fremstå som flere forsøk.
• Bytte av proff, avstand eller leie må ikke ta med gamle registreringer inn i et nytt mål. Gjør det tydelig at dette starter et nytt forsøk.

DG-09 – Resultat og egen historikk
• Eksempel på korrekt resultattekst: «7 av 10 innenfor treningsmålet».
• Vis mål, kilde/proff, avstand, leie og dato, samt «Prøv igjen».
• Vis de siste 20 lagrede forsøkene med forståelige detaljer og en nyttig tomtilstand.
• Egen utvikling kan sammenlignes når oppgave, avstand, leie og mål er like. Endret referanse må fremgå.
• Unngå udokumenterte påstander som «Du slo proffen», «tour-nivå» eller en oppdiktet verdenspersentil.

DG-10 – Forklaringer og datatilstander
• Lag korte, kontekstuelle forklaringer på SG, justert nærhet, periode, utvalg og kilde.
• Dekk delvis datadekning, få observasjoner, gammel kildedato, manglende egne data, lasting, innlastingsfeil og nytt forsøk.
• La status fremgå nær de berørte tallene. Behold tilgjengelig innhold når bare én del mangler.
• Skill ingen registrerte resultater fra resultater som ikke kunne lastes.
</skjermer_og_brukerreise>

<datakrav>
Disse kravene gjelder uavhengig av visuell løsning:

1. SG betyr «slag vunnet eller tapt mot en referanse». Skill mellom DataGolfs forventede ferdighet, rå SG fra en turneringsrunde og egne øvrige SG-modeller. De kan ikke automatisk slås sammen eller trekkes fra hverandre.

2. Forskjell mellom forventede ferdigheter krever samme kildedato. En egen ferdighetsprognose må faktisk finnes før «meg mot proff» kan vise dette. Rå SG-forskjell krever samme turnering, rundenummer og bane. Brutto score på ulike baner er en beskrivende sammenligning.

3. SG-grafer har tydelig nullpunkt og samme skala for positive og negative verdier og for begge spillere. Negative tall skal være like lesbare som positive. Ikke bland ulike enheter i en normalisert radar uten dokumentert sammenligningsgrunnlag.

4. Relative driververdier er relative: eksempelvis «+12 yards mot referansen» og «−3 prosentpoeng treffsikkerhet». De er ikke absolutt slaglengde eller faktisk fairwayprosent. Ferdighetsprofiler skal heller ikke fremstilles som separate årssnitt per tour.

5. Faktiske innspillsintervaller:
   Fairway: 50–100, 100–150, 150–200 og over 200 yards.
   Rough: under 150 og over 150 yards.
   100–150 yards tilsvarer 91,44–137,16 meter.
   Bruk meter som hovedvisning for innspill og behold kildens yards i detaljene. Ikke oppfinn smalere intervaller eller en øvre grense på åpne intervaller. Avrunding i teksten skal ikke endre hvilket kildeintervall en avstand tilhører.

6. Innspillsperioden er de siste 24 månedene frem til kildens dato. Justert nærhet er et gjennomsnitt, ikke faktiske enkeltballer eller en spredningsfordeling. Ikke tegn oppdiktede slagpunkter eller påstå at en bestemt andel av proffens slag ligger innenfor gjennomsnittsradiusen. «Gode slag» følger kildens definisjon; ikke finn på en ny grense.

7. Hver måling trenger riktig enhet, periode, kilde og antall runder eller slag. Hold forklaringene tilgjengelige uten å fylle hovedflaten med metodeprosa. Manglende verdi er ikke null. Ikke finn på sikkerhetsintervaller eller kvalitetsstempler.

8. Alle scorer er brutto. Ikke innfør netto score, oppdiktet handicap, «True SG» eller «Rest» som kombinerer uforenlige tall. Treningsresultater gir ingen automatisk rangering mot proffene.

9. Vis «Data powered by DataGolf» med lenke til https://datagolf.com på et naturlig sted. Egne runder og egne treningsregler merkes med sin faktiske kilde.
</datakrav>

<syntetiske_prototypedata>
Bruk fiktive profiler «Proff A» og «Proff B». Ikke sett oppdiktede tall på navngitte virkelige spillere. Oppgi i prototypeoversikten at dataene er syntetiske, og bruk samme tall gjennom hele reisen.

Felles kildedato: 10.09.2026.
Proff A: SG totalt +2,10; utslag +0,70; innspill +1,20; nærspill +0,40; putting −0,20.
Proff B: SG totalt +1,30; utslag +0,30; innspill +0,70; nærspill −0,20; putting +0,50.

Meg: 12 komplette runder, brutto snitt 84,2, fairwaytreff 45 %, GIR 33 %, periode 01.06.–08.09.2026. Ingen egen DataGolf-ferdighetsprognose.
Proff A: 12 runder, brutto snitt 69,8, fairwaytreff 64 %, GIR 72 %, periode 13.08.–06.09.2026. Ingen påstand om like baner eller forhold.

Innspill Proff A: fairway 100–150 yards; justert nærhet 6,1 m; SG per slag +0,028; greentreff 72 %; gode slag 28 %; 180 slag; siste 24 måneder frem til kildedatoen.
Prøv selv: 110 m fra fairway; samme mål med radius 6,1 m; ti baller, sju innenfor og tre utenfor. Lagret resultat og historikk skal vise disse samme verdiene.

Suppler med tydelig syntetiske turneringsrunder som har sammenhengende score, par og dato. Lag egne demonstrasjonstilstander for en ny spiller uten runder, en proff uten innspillsdata og en lagringsfeil. Prototypens kildefeil og lagringsfeil skal kunne åpnes uten å gjøre hele normalreisen ubrukelig.
</syntetiske_prototypedata>

<design_og_formater>
• Bruk vår aktuelle designretning konsekvent. Nye nødvendige komponenter skal bygge på de samme designverdiene og interaksjonsmønstrene.
• Prioriter forståelse og enkelt samspill. Vis oversikt først og utdyping ved behov; bevar alle funksjonene på mobil.
• Bruk norsk desimalkomma og riktige enheter. Forklar fagbegreper ved første relevante bruk. Ingen emoji i grensesnittet.
• Tegn hovedreisen på mobil 390 px og desktop 1440 px, og vis hvordan sammenligning og registrering tilpasses nettbrett 834 px.
• Kontroller at løsningen også fungerer ved 320 px uten horisontal sideflyt. Beskriv oppførsel mellom størrelsene.
• Bruk temaene vi arbeider med her. Dersom både lyst og mørkt inngår, lever begge med alle kritiske tilstander.
• Bruk lesbare tabeller/grafer, tydelige tekstetiketter, synlig tastaturfokus og trykkflater på minst 44 × 44 px. Farge alene skal ikke formidle status.
• Kontroller kontrast, lange navn, stor tekst, negative tall, små skjermer og meldinger ved feil. Skill det som faktisk er kontrollert fra det som bare er spesifisert.
</design_og_formater>

<leveranse>
1. Kort identifikasjon av designversjonen som videreføres, og et enkelt kart over spillerreisen.
2. Ferdig tegnede visninger DG-01 til DG-10 med relevante tomme, lastende, delvise og feilede tilstander. Vis hvilke som er sider, faner, paneler eller dialoger.
3. En sammenhengende klikkbar prototype: proffvalg → sammenligning → innspill → oppsett → ti registreringer → lagring → historikk. Turneringsresultater, proff mot proff og reisen uten egne data skal også kunne prøves.
4. Et skjermregister med identifikator, tilstand, format, inngang/utgang og gjenbrukte komponenter.
5. En samlet, versjonert overlevering med redigerbare designartefakter og eksportene verktøyet støtter. Beskriv komponentvarianter, designverdier, avstander, størrelser, responsiv oppførsel, tekst, datakoblinger og samspill. Bruk eksisterende komponentnavn der de finnes.
6. Kort kontrolliste med faktiske kontroller, eventuelle avvik og åpne spørsmål. Hold status for designet prototype, valgt design og implementert app adskilt.

Leveransen skal gi utvikleren nok informasjon til å bygge samme resultat uten å gjette på manglende skjermtilstander, databetydning eller mobiloppførsel.
</leveranse>

<ferdigkriterier>
• En ny spiller kan forstå og utforske proffnivå uten egne data.
• Begge sammenligningsreisene fungerer, og like tall bruker like skalaer og riktige referanser.
• Manglende data, ulike perioder og delvise turneringsresultater blir forståelige.
• «Prøv selv» bruker riktig intervall, leie og mål, og feiltrykk kan rettes.
• Ti registrerte baller blir ikke vist som lagret før lagringen er bekreftet. Ved feil kan samme resultat forsøkes lagret på nytt.
• Resultatet og historikken stemmer med registreringene og lover ikke at spilleren har slått en proff.
• Hele familien fremstår som en naturlig del av designet vi allerede arbeider med, på alle bestilte formater og temaer.
</ferdigkriterier>

<arbeidsmate>
Start med å bruke designkonteksten og artefaktene i denne samtalen, og gjennomfør arbeidet. Ta vanlige detaljvalg selv innenfor den retningen vi arbeider med.

Denne prompten gir funksjonsgrunnlaget. Ikke anta tilgang til kodebasen, lokale filstier eller andre samtaler. Dersom denne samtalen faktisk mangler designreferansen, si presist hvilken referanse som mangler, og fortsett med innhold og brukerreise mens det avklares. Ikke presenter en oppfunnet stil som vårt eksisterende design.

Presenter resultatet med korte begrunnelser for vesentlige valg. Hold tekniske lagringsdetaljer i utvikleroverleveringen, og bruk spillerens språk i skjermene.
</arbeidsmate>
```
