# Komplett prompt — Claude Design / Claw / Team Norway

Kopier hele XML-blokken inn i det eksisterende Claw-prosjektet. Dette er en videreføring av Team Norway, ikke en ny visuell retning for hele AK Golf HQ. Kildekontroll: faktisk appkode 14.09.2026; siste filer i Claude Design må undersøkes i prosjektet.

```xml
<oppgave>
Viderefør dette eksisterende Claude Design-/Claw-prosjektet til en komplett, klikkbar Team Norway-arbeidsflate som dekker trenerens arbeid med spilleroversikt, Workbench, kalender, teknisk plan, tester, analyse og evaluering. Fullfør alle avklarte skjermfamilier og sidegrener. Lever faktiske skjermer og sammenhengende reiser, ikke bare et skjermregister eller nye oversiktskort.

Bruk siste faktiske prosjektfiler, bevar mine manuelle justeringer og velg neste ledige versjonsnummer. Begynn med en kort bekreftelse av hvilken versjon og hvilke filer du faktisk kan se. Ikke start blankt eller erstatt nyere kalenderarbeid med en eldre eksport.
</oppgave>

<produkt_og_forretning>
AK Golf HQ har PlayerHQ for spilleren, AgencyOS for AK Golfs drift og Team Norway som egen organisasjonsflate. Team Norway skal kunne bruke trenerflatene tilnærmet gratis. Spillerlisensene koster penger og er den betalte delen av tilbudet.

Trenerens gruppetilgang, spillerens gruppemedlemskap, samtykke og spillerlisens er ulike forhold. Vis dem separat. Ikke sett pris, betalingstermin, betaler eller rabatt uten en faktisk avklaring. «Tilnærmet gratis» betyr ikke at nullpris er fastsatt. Ikke vis «gratis PlayerHQ» bare fordi spilleren er medlem av Team Norway.

Den samme spilleren, planen, økten og testen brukes på tvers av Team Norway og PlayerHQ. Unngå å designe en ny parallell spillerapp. Treneren skal kunne følge valgt spiller uten at handlinger eller analyse plutselig gjelder trenerens egen konto. Spilleren gjennomfører egne økter i PlayerHQ; treneren fører test på vegne av spiller bare når rollen tillater det.
</produkt_og_forretning>

<visuell_autoritet>
Team Norway-pakken «Claw Design — Team Norway Golf», valgt 13.09.2026, styrer profilen: ekte logoressurs, fonter, palett, tabeller, navigasjon, felter og mobilmønstre. Viderefør denne identiteten. Bruk samme designsystem med presise, dokumenterte utvidelser der manglende skjermer krever det.

Bruk eksisterende Claw-referanser for Workbench, Workbench mobil, kalender, årsplan, periodeplan, tester, evaluering og utøveroversikt hvis de finnes i prosjektet. Filnavn eller et ferdigmerke er ikke bevis for full handlingsdekning. Sjekk innholdet. Kodearbeid pågår parallelt; en designprototype er ikke dokumentasjon på ferdig app eller lagring.
</visuell_autoritet>

<verifisert_utgangspunkt>
I appen finnes Team Norway-skall, oversikt, spillerliste, posttidslinje, gruppemeldinger, dokumenter, samlinger, turneringer, invitasjon og tilgang, testprotokoller, referansenivåer og uttaks-/ranglistegrunnlag.

Testdag kan opprettes med protokoll og spillere. Treneren kan føre, lagre utkast, gjenåpne, avbryte, hoppe over, markere ikke møtt, føre og gå videre til neste spiller med blanke felt, og avslutte dagen. Bevar hele denne reisen. Dette er prøvd lokalt; det er ikke publisert produksjonsstatus.

Dagens månedsplan er lesetabeller, ikke full Workbench. Spillerens detaljrute er hovedsakelig posttidslinje. Analyse-lenken åpner egen PlayerHQ-analyse, ikke valgt spillers analyse. Disse gapene skal løses i designet.

PlayerHQ har allerede funksjoner for Workbench år/måned/uke/dag, periodisering, opprett/rediger/flytt/kopier økt, øvelsesbibliotek, maler, publiseringsgjennomgang, tekniske planer, testføring, testhistorikk/trend, analyse, Live og oppsummering. Gjenbruk de faktiske funksjonsbegrepene og bevar eksisterende funksjoner.
</verifisert_utgangspunkt>

<skjermomfang>
Gi nye skjermer stabile ID-er med prefikset TNX slik at eldre TN-ID-er ikke kolliderer. En skjerm kan ha faner og overlegg; ikke lag nye sider bare for å øke antallet.

TNX-01 Spillerarbeidsflate:
Spillerliste med søk/filter og en komplett spillerside. Vis valgt spiller og gruppe vedvarende. Faner/veier til oversikt, plan, teknisk plan, tester, analyse, evaluering og kommunikasjon. Prioriter neste oppfølging og datagrunnlag. Bevar eksisterende spillerpost.

TNX-02 Workbench og kalender:
Gruppe-/spillerkontekst, årsoversikt, periodevisning, måned, uke, dag/agenda og øktdetalj. Bevar manuelle kalenderjusteringer. Vis trening, testdag, samling og turnering med tydelig kilde og status. Naviger mellom datoer og tilbake til i dag uten å miste valgt spiller. Skill gruppeplan fra personlig plan og planlagt fra gjennomført. Samme økt skal ha samme identitet og status overalt.

TNX-03 Planlegging og overlegg:
Opprett/rediger økt, flytt med berøring og tastatur, kopier økt/uke, velg øvelser/maler, legg teknisk oppgave i økt, rediger periode og åpne øktdetalj. Vis endringer før publisering, bekreftelse, godta/avvis der det finnes, lagringsfeil og samtidighetskonflikt. Dra-og-slipp må ha et tilgjengelig alternativ. Ikke skjul disse funksjonene på mobil.

TNX-04 Teknisk plan:
Planoversikt, plandetalj og oppgavevisning med mål, fokus, øvelse, kilde/vedlegg, status og tidligere endringer. Ta med opprett/rediger oppgave, fremdrift og vei til neste økt. Bevar fagbegreper fra kilden. Ikke oppfinn tekniske måleverdier eller lov tilgang til private notater/helse.

TNX-05 Testoversikt og protokoll:
Skill testkatalog/protokoll, planlagt testdag, pågående føring og utført resultat. Filtrer på spiller, protokoll og periode. Vis siste test og historikk, gjenåpning av utkast og vei til protokollens instruksjoner. Opprettelse av egen test vises som en separat funksjon der kildene støtter den.

TNX-06 Testdag og gjennomføring:
Opprett testdag, velg spillere/protokoll, deltakerkø, føringsskjerm, lagret utkast, fortsett, avbryt/start tomt, før og neste, hopp over, ikke møtt og avslutt. Resultatvisning må skille lesing fra redigering. Vis hvem resultatet gjelder og hvem som fører. Ikke la neste spiller arve forrige spillers verdier. Vis feil ved ufullstendig registrering og konflikt ved samtidig føring.

TNX-07 Testanalyse:
Spillerens testdetalj med dato, måleenhet, protokollversjon, forsøk, siste/forrige/beste når sammenlignbart, historikk og utvikling over tid. Referansegrunnlag skal være eksplisitt. Skill sammenlignbare fra inkompatible tester; aldri summer ulike måleenheter eller protokoller til en oppdiktet totalscore.

TNX-08 Gruppeanalyse og treneroversikt:
Velg gruppe, testdag og protokoll. Vis hvem som har gjennomført, mangler resultat eller ikke møtte. Sammenlign kompatible resultater, åpne valgt spiller og gå tilbake med filtrene bevart. Rangering krever tydelig beregningsgrunnlag; gruppesammenligning er en utvidelse, ikke bevis på en allerede ferdig PlayerHQ-funksjon.

TNX-09 Analyse og evaluering:
Analyseinngang for valgt spiller med relevante tester, runder/turneringer, TrackMan og DataGolf der data og tilgang finnes. Fra måling til trenerens vurdering, konkret neste tiltak og oppdatert teknisk oppgave/plan. Vis kilde og dato. Hvis en egen lagret evalueringsmodell ikke er avklart, merk lagringen som avhengighet i leveranseregisteret; ikke påstå at den finnes.

TNX-10 Spillerens sammenhengende reise:
Vis overgangen Team Norway-oppfølging → spillerens PlayerHQ-plan → planlagt økt/test → gjennomføring → lagring → oppsummering → tilbake til plan og treneroppfølging. Dette kan gjenbruke PlayerHQ-skjermer med en tydelig overgang. Ikke overta trenerens konto eller lage en separat datakopi.

TNX-11 Medlemskap og spillerlisens:
Treneroversikt med medlemskap og kjent lisensstatus; invitasjon → riktig mottaker → samtykke ved behov → lisensaktivering → PlayerHQ. Skisser tilstander aktiv, utløpt, mangler og ukjent uten å vedta nye rettigheter. Betaling/fornyelse er et forslag inntil pris, betaler og lisensregler er avklart. Hvem som kan se fakturadetaljer må ikke utledes av vanlig trenerrolle.

Bevar eksisterende Team Norway-funksjoner for dokumenter, kommunikasjon, samlinger, uttak, skoler, turneringer, referanser og tilgang. Registrer hvordan de er koblet til den nye navigasjonen.
</skjermomfang>

<roller_data_og_tilstander>
Bruk tydelig syntetiske spillere og demoresultater. Ingen ekte personopplysninger, hemmeligheter eller identifiserbare juniorer.

Vis hovedtrener, hjelpetrener med begrensede handlinger, spiller med egne data, foresatt og ekstern leser som forskjellige roller. Eksisterende tilgangs- og samtykkeregler styrer; et nytt design gir aldri automatisk nye rettigheter. Skjul eller forklar handlinger rollen ikke kan utføre, og tegn avvist direkteåpning.

Hver relevant skjerm trenger tom, lastende, feil, manglende datatilgang og normal tilstand. Skriveflater trenger lagrer, lagret, lagringsfeil, ufullstendige felt og konflikt. Gjennomføring skiller planlagt, pågående, fullført og avbrutt. Vis nettbrudd/offline der relevant uten å love frakoblet lagring som appen ikke støtter.

Manglende data er ukjent, ikke null. Bruk brutto score. Vis kilde, periode, enhet og sammenligningsgrunnlag. Strokes Gained har symmetrisk skala rundt null. Ikke bruk farge som eneste statusmarkør.
</roller_data_og_tilstander>

<kvalitetsrunde>
Bruk AK HQ Design som arbeidsmåte hvis skillen er tilgjengelig. Bruk Impeccable audit/critique til hierarki og konsistens, adapt til mobil og polish til slutt. Bruk Emil Kowalski / emil-design-eng til felt, dialoger, fokus, berøring, tilbakemelding og eventuell bevegelse. Ikke påstå å ha brukt en skill som ikke er tilgjengelig; utfør da de konkrete kontrollene nedenfor.

Claw-valget går foran generelle smakspreferanser og eventuelle gamle Train-lock-instrukser i skills. Gjør én samlet kontroll på mobil390 og desktop1440, rett funn samlet og gjør én bekreftende runde.

Kontroller konsistent spacing-skala, typografihierarki, justering, kontrast, tabelltetthet, berøringsmål, tastaturfokus, redusert bevegelse og samme navn for samme handling. Fjern dekorative målekort, gjentatte overskrifter, overdreven avrunding, tilfeldige aksentfarger og generiske AI-formuleringer. Ikke fjern nødvendig funksjon for å gjøre skjermen renere. Hyppig testføring og kalenderarbeid skal svare raskt, uten unødvendig animasjon.
</kvalitetsrunde>

<leveranse_og_ferdigkrav>
Lever én sammenhengende versjon med:
1. Tydelig startside og klikkbar prototype med alle hovedreiser og avbrudd/feilgrener.
2. Mobil390 og desktop1440; forklar gjenbruk for øvrige bredder og temaer.
3. Komponenter og faktiske designverdier, inkludert varianter, tilstander, ikon-/font-/logoressurser.
4. Skjermregister: ID, rute eller foreslått rute, rolle, inngang, handling, datakilde, tilstand, referansefil og hva som gjenbrukes.
5. Separat status for tegnet, klikkbart, kontrollert i prototype og avklart for bygging. Ikke merk nye tillegg som visuelt godkjent av Anders. Bevar tidligere Claw-valg for eksisterende omfang.
6. Endringslogg mot versjonen du faktisk startet fra, konkret restliste og produktspørsmål som fortsatt blokkerer pris, tilgang eller lagring.
7. Komplett eksport hvis miljøet støtter det: README/startfil, nødvendige ressurser, register og kontrollrapport. Verifiser filene og interne lenker; oppgi ikke en ZIP som levert før den faktisk finnes.

Ferdig betyr at hver registrert funksjon har en konkret skjerm/tilstand/handling eller en navngitt avhengighet. Én representativ skjerm teller ikke som dekning av en hel familie. Ikke stopp etter første pilot; fortsett gjennom hele det avklarte omfanget.
</leveranse_og_ferdigkrav>
```
