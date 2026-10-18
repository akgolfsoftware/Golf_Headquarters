# Konkret bestilling til Claude Design — 30.09.2026

Status: **sendt til den eksisterende Precision Athletics-chatten 30.09.2026 etter Anders' uttrykkelige autorisasjon «Ja, oppdater også Claude Design»**. Mottak og påbegynt behandling er observert i nettleseren. Ferdige endringer må undersøkes separat; sending er ikke fullføring. Gjeldende bestilling fra Anders: Training Motor → Precision Athletics, konsistens og gjenstående designarbeid. Begge prosjektene skal ryddes ved å arkivere utgående materiale. Precision er valgt hoveddesign; konkrete skjermer skal gjennomgås før Grok Build ferdigstiller appen.

## Bestilling som kan sendes samlet

```text
Arbeid i eksisterende AK Golf Precision Athletics (7d7c2994-cf63-4c5f-9bdc-fdaf67655a70) og AK Golf Training Motor (4917465a-5671-4e1a-9b89-3c80adada899). Konsolider funksjonene i Precision. Bevar siste rettinger, godkjent språk/planlegging og all fungerende funksjon. Ingen permanent sletting, ny profil eller endring av Team Norway/WANG.

Start med å sammenligne dagens filer med kontrollgrunnlaget 30.09.2026. Ikke overskriv samtidige nyere rettinger. Registrer avvik før flytting. Les AK Arbeidsdokument.dc.html i Training Motor. Dets aktive lenker viser at AK Treningsmotor.dc.html og Teknisk Plan v2.dc.html gjelder; v2-navnet på AK Treningsmotor v2.dc.html er ikke bevis på nyeste versjon.

Rett de bekreftede flytavvikene først. PH-12 heter Velg treningsplan i katalogen, men tegner fortsatt den gamle firestegsplanbyggeren med fire andre maler og Caddie-forslag. Den skal vise språk-masterens fem planer tilpasset kategori A–K. PH-04/05/07 må bruke samme syntetiske øktresultat: i kontrollen ga avslutning med én av fire øvelser gjennomført likevel faste 73:06 og 172/190 reps fra L().after. Overfør faktisk tid, reps og gjennomføringsstatus til oppsummeringen, og skill gjennomføring fra lagring. AG-23 lastes fra den eldre enkeltfilen etter AG-mer og viser åtte gamle faner i stedet for det samlede oppsettet. Velg siste avklarte variant én gang, og kontroller AG-23-TEAM og AG-24-videresendingen mot samme komponent. Bevar PH-01-visningen Anders har godkjent; den godkjenningen gjelder bare 390 px, lyst, Data, med dialogen Endring i dagens plan åpen.

AG-TP-01 viser et eksisterende teknisk fokus som ikke finnes i valgene for området. Kontroller historiske og nåværende fokusverdier, vis valgt fokus entydig, og unngå stille tap ved områdeendring. Bruk ikke demoverdier som datamigreringsregler.

Presisions _kilde/Treningsmotor2.html er en kopi av feil aktive motorversjon. _kilde/TekniskPlan.html er den gamle kortvisningen. Bevar disse som historikk og hent de faktisk aktive funksjonskildene. Bevar aktive Spilleranalyse v2.dc.html og Teknisk Progresjon.dc.html som funksjonskilder. AK-formelen.dc.html og AK Systemkart.dc.html er faglig underlag; AK Masterutforsker.dc.html er uttrykkelig arkiv. Bilder/personnavn fra kildene erstattes med syntetiske eksempler i nye skjermer.

Gjør teknisk plan til én sammenhengende flyt: liste over P1.0–P10.0 og mellomposisjoner, prioriterte arbeidsoppgaver per uketype, oppgaveskjema, før-/ettermedier, rep/progresjon og innsetting i Workbench. Viderefør AG-10, AG-TP-01, AG-TP-02 og PH-TP-01 som innganger fremfor et parallelt system.

Ta med følgende fra Teknisk Plan v2:
- Egen oppgaveutvelgelse og rekkefølge for Treningsuke, Utviklingsuke og Prestasjons-/turneringsuke. Samme oppgave kan være med i flere uketyper. Vis «Ikke med» uten å slette oppgaven.
- Mellomposisjoner, flytt opp/ned som alternativ til dra, og tomme posisjoner.
- Kølle, starthøyde/toppunkt i 3×3-valg, skru/startretning og målutstyr. Høyde/skru gjelder ikke putting. Begreper og områdefokus følger treningsplanlegging-master.md, ikke gamle fritekstlister.
- To daterte mediespor: før og etter, hver med bilde eller video, last opp/erstatt/fjern/bytt og tilgjengelig sammenligning. Tegn filfeil, tilgang, lasting og manglende medie; ikke bruk en toast som bevis på opplasting.
- Formelkode, målbokser, repmål og overgang til planlagt økt med oppgavekobling.

Fullfør også aktive motorfunksjoner: sammenhengende årsplan/periode/uke/økt, planlagt og faktisk akkumulert volum, ukebudsjett/fordeling, øvelsesdesign, testens egen protokoll og analyse → coachens tiltaksutkast → Workbench. Bruk eksisterende Precision-komponenter i components/plan/. Ikke lag konkurrerende definisjoner i ds-plan.jsx eller generert bundle.

Teknisk Progresjons «bestått før neste steg»-regler skal ikke videreføres som sperrer. Godkjent master gjør repmål/læringssteg veiledende. Coach bekrefter tiltak og publisering. Demoens årsbudsjett, ukemål, datoer, ACWR-grenser eller skaderisikopåstander er ikke fastsatte produktregler. Manglende målinger vises som —, ikke 0.

Rydd deretter hver fil og definisjon med register: opprinnelig plassering, erstatter, brukte hjelpere/imports, status og begrunnelse. Undersøk hvem som registrerer skjerm-ID sist. I AgencyOS screen.html lastes AG-mer før AG-23 og AG-24; eldre filer kan derfor vinne over nyere. PlayerHQ og AgencyOS har flere slike dobbeltregistreringer. Velg siste avklarte oppførsel, trekk ut brukte hjelpere, oppdater vertsfilene og flytt ubrukte definisjoner til arkiv/2026-09-30/. Bevar nødvendige videresendinger uten egne gamle navigasjonspunkter. Ikke flytt en hel fil bare fordi én definisjon blir overstyrt.

I Training Motor samles tidligere kortvisning, første Spilleranalyse, Masterutforsker og erstattede utkast i arkivet. Etter at funksjonsoverføringen er kontrollert, marker Training Motor som historisk funksjonsunderlag med lenke til Precision. Først da tas det ut av den aktive designoversikten. Bevar originaler og tilbakevei.

Oppdater readme, SKILL, skjermliste, oversikt, kilde-/arkivregister og overlevering samtidig. Skill filinventar, tegnet skjerm, simulert prototype, fungerende kode, Anders' designvalg og appkontroll. Ikke oppgi kode som undersøkt uten faktisk kodegrunnlag. Kodekontrollgrunnlaget er Git 110b4ec8f og må oppdateres ved videre bygging.

Generer aktiv testliste fra skjermregisteret. Dagens audit.html utelater PH-24D, PH-24D-DETALJ, PH-24D-INVITERT, PH-24D-AVSLUTTET, PH-24D-NY og PH-26B, men teller 20 historiske ID-er. Test videresendinger separat, og merk PH-26B som uavklart forslag. Krev feil dersom skjerm-ID mangler, rendering feiler eller ready-kontrollen går ut på tid. Layouttesten skal suppleres med reiser som kontrollerer samme økt/data, redigering, lagring, tastatur og relevante dialoger. Dokumenter eksportversjon, antall tilfeller og faktiske feil; en grønn gammel testliste er ikke full dekning.

Lag skjermpakke til Anders: nøyaktig skjerm-ID/versjon, brukeroppgave, navigasjon, felt, handlinger, 390 px og desktop, temaer, tomt/lasting/feil og relevante redigerings-, lagrings- og publiseringstilstander. Start gjennomgangen med I dag → Plan → økt → Live → oppsummering, deretter coachens Stats → teknisk plan → Workbench → publisering.

Anders krever at Grok Build vet eksakt hvilken skjerm hver knapp åpner. Fullfør et knapp- og skjermkart for alle trykkbare kontroller, inkludert kort, faner, ikoner, bjelle, hurtigmeny og dialogknapper. Hver rad har stabil kontroll-ID, fra-skjerm/versjon og plassering, tekst/ikon, rolle/tilstand, mål-ID/versjon eller handling/overlegg, nødvendige objekt-ID-er, betingelser, tilbakevei, avbryt/feil og håndtering av ulagrede endringer. «Start» på I dag må bevare hvilken økt som ble valgt og gi riktig fysisk-/slagvariant; dagens faste go(PH-04) uten øktkontekst er ikke nok. Gjør samme syntetiske objekt klikkbart gjennom hele reisen. Ikke merk en kobling bekreftet bare fordi knappen har en etikett. Kildekartleggingen i repoet har 38 innledende rader; fullfør resten og frys kartet med valgt eksport.

Til Grok Build leveres frosset eksport med kontrollsum, komponentkilder, ressurser, faktisk responsiv oppførsel, felt- og handlingskoblinger, tilgang, lagring og publisering. Vis manglende lagringsstøtte uttrykkelig: nåværende PositionTask har én global sortOrder og én bildeUrl/videoUrl; før-/etterpar, prioritet per uketype og strukturerte høyde/skru-felt er ikke dokumentert støttet. Ikke endre database eller tilgang for å skjule disse hullene. Grok må gjenbruke eksisterende kode og beskrive konkret nødvendig endring separat.

Rapporter kort hva som faktisk ble flyttet/arkivert, oppdaterte skjerm-ID-er, kontrollbevis og resterende avvik. Ingen merking som godkjent av Anders uten hans konkrete vurdering.
```

## Kontrollgrunnlag

[Kildeanalyse](../design-audit/precision-training-motor-2026-09-30.md), [oppfølgende gjennomgang med konkrete flytavvik](../design-audit/precision-gjennomgang-2026-09-30.md), [Grok-kontrakt](grok-build-overlevering.md) og [AK HQ Design v7](../../.claude/skills/ak-hq-design/SKILL.md). Ingen produksjonskode, database, betalinger eller eksterne meldinger inngår i denne designbestillingen.

## Levering og oppfølging i Claude Design

30.09.2026: Første bestilling er mottatt og behandlet. Claude rapporterer PH-12 med fem planer, øktdata fra Live til oppsummering og ett samlet AG-23-oppsett. Synlig `reisetest.html` viser 23 kontroller / 0 feil; dette er Claudes test og dekker bare den første arbeidsdelen. Tre eldre AgencyOS-filer er rapportert flyttet til arkiv. Ny eksport og uavhengig kontroll gjenstår.

Claude oppga uttrykkelig at «Start»-kontekst, Teknisk Plan v2, fokusavvik, motorfunksjoner, konsistens, aktiv audit og fullstendig knappkart ikke var gjort. Codex sendte fortsettelse innen Anders' eksisterende autorisasjon. Ingen ny godkjenning ble spurt om, og ingen gjenstående punkt er merket ferdig. PH-26B/PH-27/markedsprofil forblir uavklart. Andre chattens AG-15-NORMER/PH-16b bevares.

[Egen konsistens- og kontrastkontroll av før-eksporten](../design-audit/precision-konsistenskontroll-2026-09-30.md) er tillegg til det opprinnelige kontrollgrunnlaget.

### Uavhengig mellomkontroll kl. 12:51

Mellomeksport: 559 filer, SHA-256 `c6bd087257130f40a2e625fc05bdbeab2147673abd734f9e9f459ca1a641d916`. Eksporten ble tatt under aktiv redigering og er **ikke frosset byggegrunnlag**. Tre riktige Training Motor-kilder og tre arkiverte AgencyOS-originaler er byteidentiske med før-eksporten. 278 JS/JSX og 47 JavaScript/Babel/module-inline-script ble undersøkt uten syntaksfeil.

[Egen kilde- og reisekontroll](../design-audit/precision-mellomkontroll-2026-09-30.json) registrerer ti punkter. Lokal nettleserprøve bekreftet dobbel oppretting ved ny oppgave → lagre → endre → lagre (listen økte fra 6 til 8). «Legg i økt» ble også prøvd og viste bare toast. Ny-oppgave-forhåndsvisningen viste en arvet kvalitetssjekk. Dette er konkrete restpunkter, ikke godkjente oppførsel.

To filtrerte layoutvisninger åpnet feil filnavn med query i `file` og viste tomt canvas. Codex åpnet først faktisk audit-fil via prosjektmenyen; senere stoppet Codex den fastlåste filtrerte målingen og sendte korrigert kjøremåte sammen med åtte kildefunn og kontrastkontrollen. Designoppgaven ble videreført innen samme autorisasjon. Observerte layoutresultater før nye rettinger: 312 tilfeller/12 avvik (skjulte filfelt), deretter 320/16 (32 px brede vurderingsknapper). Ingen av disse er sluttkontroll eller full dekning.

## Tidligere venting og ekstra funn

Nettleseren var en periode i bruk til et annet prosjekt og hadde åpen filvelger. Ingen klikk eller skriving i denne ble utført. Denne ventingen er løst, og alle oppfølgingene nedenfor er sendt.

To ekstra kildeavvik i mellomeksporten må kontrolleres mot neste leveranse: før/etter-komponenten viser videoUrl som teksten VIDEO uten videokontroller (M09), og ny oppgaves forhåndsvisning arver kvalitetsmåling fra den første eksisterende demooppgaven (M10). Ny oppgave skal ha egne tomme verdier; bilde/video og blandede par skal vises og kunne betjenes tilgjengelig.

[Appkoblingene](appkoblinger-precision-athletics.md) avdekker også tap av taskId ved Legg i økt, planpublisering i stedet for oppgaverevisjon og at dagens oppsummeringsknapp bare lagrer tekst. Dette er kodegap til Grok Build. Ingen av dem ble rettet i appkoden i denne designoppgaven.

## Fullføring bestilt i eksisterende Precision-chat

Anders ba uttrykkelig «Fullfør alt i design prosjektet». Direkte tilgang til Precision-fanen ble gjenopprettet uten å flytte brukerens aktive side. Fullføringsbestillingen er sendt og «Processing project files» observert. Den tidligere ventingen på ledig nettleser er dermed løst.

Siste delrapport fra Claude: 52 reisetester, 0 feil, alle .1–.9-posisjoner, faktisk oppgavekoblet Workbench-utkast, samme taskId ved gjentatt lagring, revisjonsbasert prototypepublisering, sikrere parallelle medievalg, riktigere sessionId og forbedrede kontrasttokens. Dette er Claudes rapport, ikke selvstendig sluttkontroll eller appbevis. Layoutmålingen var fortsatt ikke fullført. Motor, ds-plan, 697 ubekreftede kontrollrader, skjermpakke, dokumenter og historikk gjenstod.

Fullføringsbestillingen inkluderer M09/M10, de 15 kontrollerte appobservasjonene, felles motor-/komponentarbeid, alle konkrete knappmål, trygg arkivering i begge prosjektene, aktiv audit, skjermgjennomgang og Grok-inngang. Ingen ny godkjenning for samme arbeid kreves; avgrensede produktvalg forblir uavklart. PH-01s opprinnelige godkjente bilde er bevart; endrede kontrastverdier lager en ny skjermvariant.

## Observert kontroll under fullføring

Codex leste kontrollsiden direkte i Precision-fanen: reisetest-tp viste **60 kontroller / 0 feil**. Nye kontrollrader omfattet tom forhåndsvisning for ny oppgave, videoavspiller, blandet bilde/video-par, samtidig opplasting og oppgavebytte, akkumulert volum og analyse → coachutkast → Workbench → bekreftet prototypepublisering. Bevis er bevart privat. Testens kilde og samlet eksport skal undersøkes separat; dette er ikke en innlogget appreise.

Layoutmålingen viste **368 tilfeller / 6 med avvik**: PHQ- og AG-vert manglet klar-signal på 390/1280, og AG-10 natt/data ga 47 kontrasttreff under 4,5 i hver bredde. Funnene er sendt som oppfølging til den pågående jobben. Avtalte nattflater skal brukes i dekningslisten; testfeil ved manglende ID/render/klar-signal skal beholdes. Publisering må også prøves på spillerens side med samme oppgave-ID/revisjon/økt, ikke bare en toast hos coachen.

## Egen kontroll av mellomkopi kl. 14:11

Privat ZIP SHA-256 `bc7a946e68e2ace944f58cf550fe5810f082328700e5210d85e79e5770e35332`, 568 filer. Egen parsing: 279 JS/JSX og 48 kvalifiserte inline-script uten syntaksfeil. Knappkart: 901 unike kontroll-ID-er med gyldige kildefiler/linjer; 704 aktive, 622 utledet og 82 delvis. Disse 82 er restarbeid, ikke komplett navigasjonskontrakt.

Rootårsak til fire klar-signal-avvik funnet i audit-tp linje 5: `ready` returnerte `undefined` også ved suksess. Konkret retting og negative kontroller er bestilt. Øvelsesdesign/testsignal/Spilleranalyse v2 og gjenstående arkivering står også eksplisitt i mellomeksportens restliste og er bestilt fullført. Training Motor er skrivebeskyttet fra Precision-chatten; Codex må vedlikeholde den andre prosjektflaten etter kontrollert overføring.

**Ny manuell feil M11:** AG-10 t1 → Legg i økt åpner faktisk AG-11 med t1/revisjon0. Oppgaven åpnes derfra, tittel endres, gyldig Startretning velges med Treffpunkt bevart som historikk, lagring gir samme t1/revisjon1, og publisering bekreftes. I en separat spillervert viser banneret den nye tittelen/revisjonen, men det faktiske oppgavekortet, prioriteringsknappen og registreringsvalgene viser gammel tittel. PH-TP initialiserer fra D.tasks; publisert metadata blir bare InlineAlert. Dette er sendt til retting med krav om publisert innhold per spiller/plan/oppgave/revisjon, nye oppgaver, uendrede publiserte versjoner ved ulagret utkast og kontroll i separate verter etter omlasting. Privat bevis bevart. Lokal kontrollfane lukket og HTTP-testserver stoppet.

## Arkivkontroll og ny måling under fullføring

Training Motor-eksport etter første arkivering: 61 filer, ZIP SHA-256 `1ef87de7e44c8e1e2bd0b11f12440b595c89eecc54b421a6a89897a60392b324`. Fire eldre HTML-varianter finnes i `arkiv/2026-09-30/`, og er fjernet fra roten. Egen kildekontroll finner 85 relative ressurs-/lenkereferanser i arkivfilene, alle med eksisterende mål. Endrede linjeblokker gjelder ressursstier, tilbakeknapp til historikken og Masterutforskerens motorlenke. Originale sikkerhetskopier er bevart privat. Filregisterets korte «hash» mangler algoritme og skal erstattes med full SHA-256. Prosjektet er ennå merket overføring pågår.

Precision-audit er observert ferdig: **368 tilfeller / 0 med avvik**, med synlige negative selvtester for 390/1280 som bekrefter timeout→false og oppdagelse av manglende skjerm-ID. Privat tekst- og bildebevis er bevart. Dette dokumenterer denne prototypemålingen; endelig kilde-, deknings- og reisekontroll gjenstår. Reisekontrollen viste tidligere 74/0 etter publiseringsretting, men senere kjøring fikk to utkastlekkasjefunn. Disse behandles før sluttstatus; en tidligere grønn kjøring overstyrer dem ikke.

### Training Motor-historikken ferdigstilt og kontrollert

Prosjektnavn **AK Golf Training Motor – historikk** er observert etter omdøping i prosjektmenyen. `historikk.dc.html` og Arbeidsdokument/README skiller bevarte funksjonskilder, faglig historikk og fire arkiverte utkast. Seks kildefiler har historikkmarkering og lenke til Precision; ingen konkurrerende aktiv designautoritet. Ingen permanent sletting eller endring av deling/tilgang.

[Selvstendig arkivkontroll](../design-audit/training-motor-arkivkontroll-2026-09-30.json): 61 filer, ZIP SHA-256 `e8f5335557115f343939c9cedb32aeae9195a123907fb10ad89e177ec034d215`; fire av fire før-/etter-SHA-256 samsvarer med registeret, og 85/85 relative referanser har eksisterende mål. Alle fire arkivfiler åpnet i nettleseren, motorens tilbakevei til historikken prøvd. Privat kilde-/originaleksport og bildebevis er bevart. Denne historikkstatusen betyr ikke visuell godkjenning eller fungerende app; funksjonsoverføringens siste kontroll foregår i Precision.

### Gjentatt publiseringsprøve og siste kartavvik

Siste synlige reisetest: **to kjøringer, 156 kontroller, 0 feil**, med separat syntetisk testlagring og negativ injeksjonstest for feil snapshot. Privat bilde-/tekstbevis bevart. Dette erstatter den tidligere ustabile enkeltkjøringen.

Kildekontroll av 569-filers mellomkopi avdekket utdaterte Grok-/overføringstekster og feilaktige kartcallbacker (PH-11 Cell, spiller→coachvert, utfasede analyse-ID-er). Konkret retting sendt; kildeverifisert Spilleranalyse-v2-inventar sendt uten persondata eller nye terskelregler. Samlet `audit-alle.html` kjører på aktive grupper og flere bredder; observerte avvik ved 320 px skal rettes før sluttstatus. Ingen frysing foreløpig.

## Avgrensede sluttjobber etter bred kontroll

Ny mellomkopi: 572 filer, ZIP SHA-256 `30591fe2b847e5c21ac11dc63a50889abb74e2d6573aa388629b0c80914565f3`. Egen parsing: 279 JS/JSX og 49 kvalifiserte inline-script uten syntaksfeil. 71 lokale PlayerHQ- og 62 AgencyOS-scriptreferanser peker til eksisterende filer, ingen til arkivet. Spilleranalyse-v2-kopien i `_kilde/Spilleranalyse2.html` er byteidentisk med originalen (SHA-256 `8ede25bc3bb9e1f3dbe6b4d7f84127a95a7aac9f7760ba076be067f257dbeca7`).

846 kildekart-rader ble rapportert utledet, men egen kontroll fant 44 med måltype ukjent og 56 generiske foreldermål. Etter oppfølging feiler registeret fortsatt på 10 generiske mål og 441 delte rader uten konkret hosting/instans. «Fortsett å redigere» var feilaktig beskrevet som forkast; reell Host-callback lukker dialogen og bevarer utkast. Status utledet er derfor ikke i seg selv komplett kontrakt.

Ytterligere rotårsak: `_ds_bundle.js` eksporterer de kanoniske `components/*`-komponentene før `ds-next.jsx`. Reservefilen returnerer straks ved eksisterende SortableList/InsightCard og er da inaktiv. Dagens kart utelater kanoniske komponentkilder og teller reservefilen. Konkret korrigering bestilt: følg bundle-manifest/guard og faktiske instanser, samt fil/linje/SHA og hele callback-bindingen.

Designarbeidet er nå delt i nødvendige sluttjobber for å sikre faktisk utførelse: A) rett resterende layoutavvik og mål alle avtalte bredder/tilstander, B) fullfør alle konkrete komponentinstanser og mål i kartet, C) kontroller og frys samlet eksport/overlevering. Del A pågår. Siste rapporterte brede måling var 968/57 etter første retting (tidligere 968/83); endelig visuell kontroll og ny reisekontroll etter attributtendringer gjenstår. Andre chatters PH-16b/PH-26B-funn står adskilt, fortsatt synlige i totalen. Ingen ferdigmelding eller visuell godkjenning.

### Kontrollstatus kl. 16:16

Reisetesten etter flytting av rå taskId/revisjon fra produkttekst til data-attributter er observert på nytt: to kjøringer, **156/0**, inklusive negativ snapshot-test. Ingen appbevis eller visuell godkjenning. Siste fulle layoutmåling står fortsatt på **968/46**; nyere HoursRow-retting er ikke målt. Auditens kode er utvidet til sju bredder og fire tilstander, men utvidet kjøring er ennå ikke utført.

Egen kildekontroll identifiserer en tredje aktiv vert: `ui_kits/_shared/screen.html`, med FO_SCREENS for FO/AU/BK/GJ/ST/SY. Den skal inngå i layout, skjermpakke og knappkart. Bare PlayerHQ/AgencyOS er ikke hele prosjektet. Konkret videreføring sendt for månedsukeåpner, AG-A07/gruppe-år-overløp, faktisk måling av tidligere rettinger og deterministisk renderkontroll som ikke skjuler manglende ID/tilstand/tema eller timeout. Del A/B/C er fortsatt pågående.

### Utvidet måling og konkret siste retting

Codex observerte `audit-alle.html` ferdig på **4 228 tilfeller, 47 med avvik**, hvorav 17 merket andre-eier/uavklart. Den første utvidede kjøringen hadde tre feilende negative ID-selvtester; dette er registrert, ikke oversett. Etter retting viste ny full kjøring **4 228 / 41**, fortsatt 17 hos andre eiere/uavklart og 24 i eget omfang; negative selvtester var da rapportert OK i alle tre verter.

Månedsukevelger og AU-01-lenker er rettet/målt. Egne restgrupper: tallfelt i PH/AG periode-/månedsskjema, årsbåndets tidsproporsjonale små knapper, AG-A07-overløp og ST-02-tabellsortering. Egen kildeanalyse sporet årsakene til wrapperpadding i Input, absolutte periodsegmenter i YearBand og de kanoniske `pa-table__sort`/`pa-table__sortchip`-klassene. Tallfeltene ble deretter målt 48×44 i PH-periodeskjema på 320, men resten var ikke målt. En videreføring som bare retter de tre siste kodefamiliene før ny full måling er sendt. Designet er fortsatt ikke frosset.

### Siste layoutrettinger og ny sluttkontroll kl. 16:54

YearBand har beholdt tidsskalaen som visuell oversikt og fått separate periodeknapper med samme onP-ID. Tabellsortering er rettet i de faktiske pa-table-klasser. AG-A07-overløpet kom fra en segmentert kontroll og er rettet med wrapping. Disse tre er målrettet rapportert målt uten avvik. Ny samlet kontroll er selvstendig observert: **4 228 / 21**, hvorav 17 andre-eier/uavklart. Negative selvtester er synlig OK i alle tre verter. Fire egne gjenstående tilfeller var input42×44 på 360 i PH/AG periode-/månedsskjema. Presis bredderetting og kontroll sendt; ny samlet måling pågår.

PH-07: eksisterende app krever Kvalitet1–5 og RPE1–10 ved lagring av spillervurderingen, mens prototypen bare har Belastning1–10/Fokus1–10. Et konkret produktspørsmål om eget valgfritt Fokus er sendt til Anders; foreløpig kandidatvalg er å bevare Fokus valgfritt og legge Kvalitet inn separat. Ingen automatisk omregning mellom skalaene eller databaseskrivning. Endelig kandidat, knappkart og kildefrysing gjenstår.

### Samlet layoutkontroll bestått i eget omfang

Codex observerte ny full måling ferdig etter feltrettingen: **4 228 visninger / 17 med avvik**, alle 17 merket andre-eier/uavklart; **0 egne restavvik**. Sju bredder320/360/390/768/1024/1280/1440, data/tom/laster/feil, tre verter og målingens valgte temaer. Negative timeout-/feil-ID-selvtester er synlig OK for PHQ/AG/FO. Privat tekst- og bildebevis lagret. De17 består av PH-16b tre småbredder og PH-26B fjorten lyst data/tom-tilfeller; de er ikke endret eller skjult.

Dette er layoutmåling av prototypen i denne versjonen, ikke full tilgjengelighetssertifisering, innlogget appkontroll eller Anders' visuelle godkjenning. Reiseetterkontroll, egen visuell stikkprøve, PH-07-vurderingskandidat og DelB/C gjenstår.

### Presisering av kildeversjon og etterkontroll

Claude sluttførte DelA-rapporten med en presis deling: fullmåling **4 228/17**, 0 egne, etter pa-seg/YearBand/DataTable/HoursRow-CSS; deretter én siste endring, HoursRow-grid80→100px. Egen målrettet `audit-skjema.html` ble rapportert **112/0** (fire berørte skjermer×sju bredder×fire tilstander), selvtester OK. Ikke ny full4 228-kjøring etter denne ene endringen. Reisekontrollen etter gridendringen er selvstendig observert **to kjøringer156/0**; nytt privat tekst-/bildebevis er lagret. Målingene skal stå separat, og kontrolleres mot eksporten.

PH-07-kandidatbestillingen er sendt etter DelA: egne Kvalitet1–5/RPE1–10-verdier, valgfritt Fokus som egen vurdering, lagring uten vurdering med bevart øktdata, ingen skalaomregning eller automatisk egenvurdering. Kandidaten innebærer ingen app-/databaseskrivning; eget lagringsgap for Fokus skal fortsatt være synlig. Målrettet toskjerms×sju bredder×fire tilstander×to temaer-etterkontroll og nye reisetester er bestilt før kartet regenereres.

### PH-07-kandidat og eksport etter layoutretting

Claude Design avsluttet PH-07/PH-07-FYS-delen med separate Kvalitet 1–5 og RPE 1–10, valgfritt separat Fokus i golfvarianten, samt «Lagre uten vurdering». Fokus er en foreløpig kandidat; Anders har ikke besluttet nytt appfelt. Appen mangler egen lagring for dette. Lokal prototypelagring er fortsatt simulering.

Codex observerte reisetestens sluttresultat **180 kontroller / 0 feil**, to isolerte kjøringer med 89 steg og én dekningskontroll hver. Claude rapporterte målrettet PH-07-layout **112/0** på begge temaer; ingen ny full 4228-kjøring. Kontrolldekning og visuell godkjenning er separate.

Ny eksport 17:54 har **574 filer**, ZIP-SHA-256 `2a09920ca168a5fd77fcfb58a5820b7c6fe1143a4a4f1356357dcf95f2b13f97`. Egen kontroll: 279 aktive JS/JSX/inline-skript (48 inline) uten syntaksfeil, ingen manglende aktive lokale skript. 76 manglende referanser er i historiske kildefiler/arkiv, som ikke er aktive demoer. Knappkartet har fortsatt 74 kilde-/kontraktfunn i kontrollen og er ikke endelig.

Codex har sett PH-07 på 390 px lyst og 1280 px natt, trykket kvalitet 3/RPE 8/Fokus 7 og kontrollert at lagreknappen blir aktiv. Årsplan 768 px lyst er sett; «Spesialperiode» åpnet valgt periode med riktige datoer/uker. Dette er begrenset egen visuell kontroll, ikke Anders' godkjenning eller innlogget appprøve. Private skjermbilder er holdt utenfor Git og public.

Del B-bestillingen er sendt til den eksisterende Precision-chatten: effektiv kildeorden i tre verter, faktiske komponentinstanser, transitive handlerkoblinger, objektbindinger, retur/avbryt, kildehash og negativ registertest. Arbeidet pågår. Eksporten er en mellomversjon, ikke frosset byggepakke.

### Egen etterkontroll og kartgenerator

Codex kjørte den eksporterte 17:54-versjonens `audit-oppsummering.html` lokalt: **112/0**, med negativ timeout-/ID-selvtest. Den samme eksportens `reisetest-tp.html` ble også kjørt lokalt: **180/0**, to isolerte kjøringer, begge dekningsmarkører 89/89. Dette bekrefter prototypen i denne eksporten, ikke serverlagring eller appfunksjon.

Del B2s første regex-generator ga 17 PH-01-rader og tre duplikater. Egen kildekontroll avdekket også ufullstendig dekning, avskårne handleruttrykk og feil gjentakelsesobjekt (`s.axes` i stedet for `ss.map(s)`/`s.id`). Den utelot bundledefinisjoner og flere canonical-komponenter. Resultatet er forkastet som endelig overlevering. Claude bygger nå et parserbasert verktøy; første versjon hadde en konkret syntaksfeil, som er sendt tilbake for retting. Ingen grønn registerkontroll eller ferdigmelding er gitt.

Bundlekontrollen må også se etter arkiverte **moduler inne i bundle**, ikke bare script-src. Bundleren tar med historiske kildefiler; det avgjørende er om en historisk definisjon faktisk forblir aktiv etter guards og siste overstyringer. Dette er fortsatt under kontroll.

### Utvidet bestilling: komplett Workbench fra tom plan

Anders bestilte uttrykkelig parallelt Workbench-arbeid: opprette årsplan, periodisering, måneds-/ukeplan, antall økter fra pyramiden og videre øktoppretting med teknisk plan, golfslag, spill og turneringer fra kalender. To parallelle kildegjennomganger er utført. [Arbeidsgrunnlaget](../design-audit/workbench-fra-tom-plan-2026-09-30.md) skiller designhull, eksisterende kode i 110b4ec8 og nyere appendringer i 4b55352. Ingen app-/databaseendring er bestilt eller gjort.

WB1 er sendt til autorisert eksisterende Claude-chat: stabilt spiller/gruppe-/plan-/periode-/måned-/uke-/økt-scope, virkelig tom plan, planvelger, korrekte datoer og malvalg, øktantall/tid per pyramide, arv/overstyringer, alle kalenderuker og synlige videreknapper. Deretter følger WB2 (valgt økt, bank/maler/teknisk oppgave/program/turneringskalender) og WB3 (serie/kopi/flytt/angre/publisering/kontroller). Knappkart og frosset pakke ferdigstilles først etter disse nye skjermene.

Gjeldende hovedcheckout-master har åtte periodetyper uten ny Restitusjon. Gamle registreringer bevares som historikk. Pyramiden foreslår hensikt/område uten å sperre; dominerende pyramide brukes som synlig tellegrunnlag for hver økt. Ingen automatisk normfordeling eller omregning fra reps/tid til øktantall blir funnet på. Uke med flere berørte perioder får uttrykkelig valg av budsjettgrunnlag, ingen skjult prioritering. Dette er kandidater til Anders' gjennomgang, ikke godkjente nye produktregler.

## Workbench: første UI-kobling og videre bestilling kl. 18:48

Claude har levert og synlig kontrollside viser 26/0 gjennom årsplan-/periodeknapper i PH-11 og AG-11, pluss modelltesten 27/0. Ny `WB3-lokal.jsx` leser den lokale modellen for planvelger, Tom plan/mal og periodeskjemaets fem øktantall med separate minutter. Dette er observert rapport/kontrollside, ikke selvstendig kilde-/visuell sluttkontroll.

Rapporterte rester er tydelige: Måned/Uke leser fortsatt demo, egne perioder mangler i årsbåndet, endret periode ikke UI-prøvd, ingen ny layoutmåling, lagring kun i minnet. Det er sendt en ny konkret bestilling på modellkoblet årsbånd, alle måneder/ISO-uker, arv/overstyring/tilbakestilling og synlig budsjettgrunnlag ved flere perioder. Den gamle demoflyten bevares som eget eksempel, men skal aldri vises som innholdet i en egen ny plan.

Parallelt er [Workbench-kontrakten](workbench-fra-tom-plan.md)/[JSON](workbench-fra-tom-plan.json) ferdig som **bestilt kandidat**: 72 skjerm-/overleggs-ID-er, 169 rollekoblede kontrollregler. Den er ikke ferdigdekning av Claude-prototypen. [Ny kildeverifisert appkobling](../design-audit/workbench-appkoblinger-2026-09-30.json) har 15 observasjoner, 20 fullstendig kontrollerte nåværende kildefiler og fire historiske fjernede filer. Nyere kodegrunnlag er `4b553524585f6eec26037930800f355e78caba89`; den første koblingstabellen på `110b4ec8` er merket historisk i Grok-overleveringen.

### Egen WB1-mellomeksport og testbegrensninger

582 filer, ZIP SHA-256 `f2d7ebbc67afe578835f76941c22cbd5e15772f653f21332503499606a830653`, hentet før WB2. Ingen aktive scriptmål mangler. Egen lokal reisetest viste **64/0**, men kildekontrollen avdekket at økta på ett punkt settes direkte i modellen, en tilbakestillingskontroll kan passere med feil operatorprioritet, og en kontroll bruker `|| true`. Testen sjekker ikke faktisk valgt nivå etter demobytte. Disse punktene gjør at 64/0 ikke er komplett UI-bevis. De skal rettes og kjøres igjen.

Manuell egen nettleserprøve bekreftet Tom plan → opprett årsplan med eget navn/tidsrom → Ny periode → Grunnperiode med 2 TEK/3 SLAG/1 SPILL/0 TURN og 90 min SLAG → lagre. Lagrede verdier ble vist på riktig periode, med FYS som —. Demoens ubetingede WANG-gruppebanner vises fortsatt i egen plan, og periode-/ukeåpnere mangler knappsemantikk i lesbar DOM. Sidefelt og øvrige nivåer må fortsatt bindes til valgt plan. Dette er restpunkter, ikke designgodkjenning.

### Videre øktkobling og egen rettingsbestilling

Claude rapporterer Ny økt, valgt sessionId, bankøvelser med drillInstanceId og øktmaler gjennom faktiske knapper: først100/0, deretter106/0 etter felles8-trinns skjema (`WB3-ex.jsx`), valgt planens Økt/Volum/Målsetninger, demobanner og første testrettinger. Dette er ikke ny egen kilde- eller visuell sluttkontroll. Golfspillfelt, tidsrutenett og teknisk-/fys-/turneringskilder gjenstår.

[Egen WB1-kildekontroll](../design-audit/workbench-wb1-mellomkontroll-2026-09-30.json) har15 funn og4 positive observasjoner. Ny konkret retting er sendt for editorisolasjon ved samme måned/uke i ulike planer, perioderedigeringens rammesjekk, ukjent varighet, synlig månedskilde ved grensuke, riktig malsammendrag, periodId som kontrollinstans og én opprettingsvei. Nye reiser skal gjennom faktiskUI og prøve valgte nivå/dato/økt, med negativekontroller som oppdagerfeil. Ingen samlet frys eller godkjenning.

Knappkartets nåværende ASTverktøy er uavhengig kontrollert og fortsatt ufullstendig. En isolert offlinegenerator bygges parallelt som rent designverktøy med effektiv kildeorden, bundle-/eksportkobling, instansstier og callback-/objektbinding. Ufullstendige mål skal registreres som avvik; kildehash eller stor radtelling gir ikke ferdigmelding. Ingen appkode/databaseendring følger av dette.

### Senere modellretting og måned-/kalenderrest

Claude har rapportert retting av kildekontrollens editorisolasjon, redigert periodes rammesjekk, nullvarighet med kjent sum+ukjent antall, synlig månedsgrunnlag, malsammendrag, periodId og én opprettingsvei. Før sluttkontroll må dette bekreftes i ny egen eksport. Restbestilling er sendt for månedens separate ukeflater, første standardmal i veileder, tastatur-/knappkontroll og ekte dato/tid i kalenderens tidsrutenett. Interne ID-/bindingsfelt skal ligge i metadata og kontrollverktøy, ikke i produktets brukerflyt. Teknisk plan, fys og kalenderturnering følger deretter.

### WB2-kilder bestilt etter måned-/slotkobling

Månedsflaten er rapportert med ukekort, ukeoverstyring/tilbakestill og datert ledig-slot → Ny økt → åpning av samme sessionId. SPILL kan oppgi bane og planlagt antall hull uten scoreberegning. Ny test ble først rettet etter seks feil fordi en tidligere valgt økt sto åpen. Rester er full varighetsplassering i kalenderens eksisterende tidsrutenett, native fokus/tastatur og samlet layout. Egen ny eksportkontroll gjenstår.

Neste konkrete bestilling er sendt for teknisk plan med taskId/revisjon til valgt plan/økt, valgte fysiske programøkter på flere daterte dager, og kalender/manuell turnering med tournamentEntryId, fra-/tildato, valgte rundedatoer, forberedelse og reise. Publisering følger separat WB3; det skal ikke skje som bivirkning av innsetting eller lagring.

### Teknisk plan i egen Workbench – revisjonskontroll

Første kildeinnsetting er rapportert156/0, men hadde publiseringsdato som oppgaverevisjon og manglet AG10s plan-/uke-/øktvalg. Dette er bestilt rettet til faktisk task.rev, valgte plan-/øktobjekter og eierisolasjon. Senere delrapport oppgir innsettingsark og en syntetisk nyere oppgaverevisjon, men kompaktvisningen gjenbrukte ikke eksisterende TP-/før-etter-komponenter.

Et eget avgrenset steg er sendt for faktisk gjenbruk, bundet taskId/revisjon og lokal uforanderlig innhold-/mediesnapshot per øvelsesinstans. Oppgaveendring skal ikke stille overskrive allerede planlagt økt. Begge verters åpning/før-etter/retur skal prøves. Fysisk program og turnering er ennå ikke levert. Ingen designgodkjenning eller appbevis følger av rapportene.

### Teknisk plan 171 og egen ny eksport

Claude rapporterte 171 kontroller / 0 feil etter gjenbruk av TaskCard og MediaTrack i Workbench, med oppgave- og mediesnapshot per øvelsesinstans. Dette er foreløpig rapportert prototypekontroll. Codex eksporterte deretter 584 filer (ZIP-SHA-256 `ff40a5af2cca27754354f32e4976f6bf628ef9001c94e40a1c9df054e9382d18`) og undersøkte 285 skript, herav 49 inline, uten syntaksfeil. Egen reisetest og kontroll av de 15 tidligere Workbench-funnene pågår. Pakken er ikke fryst eller godkjent.

FYS-delen rapporterte deretter 191/0, men hadde en separat syntetisk programmodell, manglet programrevisjonsvalg og hadde ufullstendig planisolasjon. En konkret retting er sendt: bruk eksisterende programkilde der den finnes, stabile kildereferanser, valgfri revisjonsoppdatering bare for valgt økt, retur til samme økt og kontroll av to planer / to eiere. Ingen appkode eller database er endret.

### Egen reisetest bestått, manuell kontroll avdekket mangler

Codex kjørte den eksporterte tekniskversjonens `wb1-reise.html` lokalt: **171 kontroller / 0 feil**, privat råbevis lagret. En egen manuell reise opprettet Tom plan, satte egne datoer, lagret og opprettet Grunnperiode med TEK2/SLAG3/SPILL1. Skjemaets åtte periodetyper og separate antall/tid/nullverdier var synlige.

Den samme manuelle reisen avdekket foreldet planvelger, demobanner og sidefelt rett etter lagring, deretter både gammel og egen ukeoverskrift ved første nivåbytte. Kilden bekrefter manglende oppdatering av foreldrens `own` etter lokal planlagring og gammel ukeblokk uten egenplan-guard. Måneds-/ukechips mister knappsemantikk gjennom `role=listitem`. Testens 171 grønne kontroller dekker ikke disse kravene; ingen ferdigmelding. Teknisk kildekontroll avdekket dessuten PH-medievisning som coach og manglende validering av faktisk kildeeier/revisjon. En konkret retteliste er klar for Claude når FYS-jobben er ferdig.

Prosjektets dokumentkontroll er kjørt: `npm run prosjekt:sjekk` bestått, 184 vedlikeholdte dokumenter. Ingen appkontroll eller full `npm run verify` er utført som del av denne designkontrollen.

### Kritiske rettinger: egen eksport og avgrenset kontroll

Claude rapporterte 217/0 i to påfølgende kjøringer etter parentvarsling, egenplan-guard, knappsemantikk, publisert PH-kilde og mal-erstatning ved simulert lagringsfeil. Testkanalen var ikke isolert mellom Claude-kjøringene; revisjonstall samlet seg opp. Ny privat mellomkopi har 584 filer og ZIP-SHA-256 `cdec7d5d4b96e2e70628d35d859acb52b64902ce9e1523864f3d1ebe310e3b3a`; 285 skript / 49 inline uten syntaksfeil. Codex kjørte denne lokalt på egen opprinnelse: **217/0**. Manuell oppretting bekrefter nå riktig planvelger og sidefelt straks etter lagring, tilgjengelige månedsknapper og én egen ukeoverskrift ved første nivåbytte.

Videre kilde-/modellkontroll finner fortsatt PH-oppdatering fra upublisert global kandidat, hardkodet TP-kildeeier, FYS-eierskap via navn, førsteplan/mandag som AG10-standard, uke/måned-kontekst, dato utenfor årsplan, samme forespørsels-ID for neste nye øvelse og delvis malinnsetting ved manglende senere bankkilde. Disse ligger i konkrete viderebestillinger og skal lukkes før frysing. 217/0 er derfor ikke en komplett designgodkjenning.

Turneringsdelen er nå sendt til den autoriserte Precision-chatten: valgt kalender/manuell deltakelse, konkrete runder også samme dag, separat forberedelse/reise og faktisk års-/måned-/uke-/øktkobling. Ingen appkode eller databaseendring.


TURN-mellomkontroll: egen eksport med 587 filer, ZIP SHA-256 `5d3df35881bc5b49f9f87e0febac40a557b843bac7e17ef10a5f34c8ac3b0c6a`, 286 skript og 49 inline-skript uten syntaksfeil. Egen lokal knappreise: 293 kontroller / 0 feil. Dette er ikke sluttbevis: en separat kilde- og modellkontroll fant sju avvik, blant annet angre etter ny planlegging, omgått rundeguard, feil økttelling og PH-inngang uten objektidentitet. Se [TURN-kontrollen](../design-audit/workbench-wb2-turn-kontroll-2026-09-30.json). Avvikene er lagt i neste WB3-bestilling, ikke bekreftet rettet. Kilderevisjonsjobben pågår; kalender, lagring/publisering, visuell kontroll og endelig knappkart gjenstår.


Kildejobb etter TURN: Claude rapporterer 308 kontroller / 0 feil, inkludert tre mutasjonskontroller. Nyere PH-revisjon hentes fra publisert kilde; sourceTaskRev og publicationRev er separate. FYS med ukjent kildeeier krever merket eksempelvalg; AG10 bruker valgt kontekst og samme øktskjema. TP2 har fortsatt én p1-eksempelkilde, ikke ekte flere kildeeiere. Full testisolering gjenstår og er bestilt sammen med WB3-kalender. Denne rapporten er ennå ikke kontrollert i egen ny slutteksport. Kalenderjobben er sendt med serie/kopi/flytt/angre, atomiske tillegg og sju TURN-avvik. [Knappkartets format og kontroll](knappkart-kontroll-og-format.md) er dokumentert; 27 generatortester og prosjektets 184 dokumentlenker består.


WB3-kalenderens første eksport: 588 filer, ZIP SHA-256 `a95ca73e46adb8b83e7def9e04d7556a87df7341f2d50a2301c92664660c9ffc`. Egen syntakskontroll: 288 parserte skript, hvorav 50 inline, ingen feil. Claude rapporterer 54 modellkontroller / 0 feil og 346 knappkontroller / 0 feil. Egen isolert modellkontroll: 14 PASS / 1 FAIL / 0 SKIPPED / 0 ERROR; sistefeilen er stale roundId utenfor aktuell deltakelsesramme i planRounds. [Kilde- og modellbevis](../design-audit/workbench-wb3-kalender-kontroll-2026-09-30.json). Egen lokal knappreise pågår. Flytt-UI, reise/TURN-knappbevis, testnamespace og desktop-rutenett er bestilt i en aktiv restjobb; ikke ferdig frys eller visuell godkjenning.

Egen lokal knappreise på den samme a95ca-kalenderetappen er ferdig: **346 kontroller / 0 feil** på et nytt lokalt opphav. Dette opphever ikke modellfeilen planRounds eller de bestilte restene i neste skyversjon.

### TEK-antall – egen mellomkontroll 23:20

Eksport590filer ZIP `1cd6961e869ff55bcf6068d0ae5a80afb926082d792bab2e7873745ac937801b` har290parserte skript hvorav50inline og0syntaksfeil. Egen uavhengig kontroll gir15PASS/0FAIL/0SKIPPED/0ERROR og bekrefter rettingen av stale `planRounds`. De15tilfellene gjelder tidligere modellvakter, ikke full nyTEKfunksjon. Skyrapport891UI/0 og78modell/0; egen eksportreise kjører nå. [Kontrollgrunnlaget](../design-audit/workbench-wb3-tek-kontroll-2026-09-30.json) skiller bevisene. Måned/periode/annen eier og reell coach→PH-antallspublisering er ikke ennå fullført UI. Tre kalenderrester er nå bestilt som en egen smal jobb. Ingenfrys eller Andersgodkjenning. Arbeidsdeling samordnet med senere beslutning: ClaudeDesign=design, Codex=appkode; underlaget er også lesbart for GrokBuild.

TEK-kildekontrollen fant fire reelle feil utover de15 eldre modellprøvene: coachutkast skjuler tidligere publisert antall, import overskrives av gamle editorfelt, feil TEK-kildemerking ved andre/manuelle endringer, og samme TP-kilde lagres separat i hver mottakende årsplan. De grønne tallene er derfor ikke fullføringsbevis. Smal retteliste er klar og sendes etter de tre kalenderreisene.
