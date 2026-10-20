# Knapp → skjerm, dialog og handling

Dette er Grok Builds navigasjonskontrakt. Status 30.09.2026: første kildekartlegging, ikke komplett eller frosset byggepakke. [JSON-registeret](knapp-og-skjermkart.json) inneholder samme rader, kildefil/kontrollsum, nødvendige objekt-ID-er og konkrete byggekrav. Kartet beskriver observert prototype; kjente feil skal rettes før den berørte referansen fryses.

## For hver trykkbar kontroll

Registrer stabil kontroll-ID, nøyaktig skjerm/versjon og plassering, knappetekst/ikon, rolle og tilstand, mål-ID/versjon, faktisk apprute, nødvendig spiller-/plan-/økt-/oppgave-ID, kodehandling, tilgang og hva som skjer ved suksess, feil og avbryt. Registrer også tilbakevei, nettleserens Tilbake, fokus, rulleposisjon og ulagrede endringer. Kort, faner, ikoner, bjelle, hurtigmeny, dialoger og lenker inngår på samme måte som knapper.

En knapp kan åpne en skjerm, åpne/lukke en dialog, bytte fane eller utføre en handling på stedet. Betingede mål får én konkret regel per gren. Samme tekst på to kort er to ulike kontrollinstanser. «Start» skal bruke økt-ID-en fra kortet som ble trykket; «Publiser» skal bruke riktig revisjon og faktisk publiseringshandling.

Grok må kontrollere hver kobling med samme syntetiske objekt gjennom reisen. Uavklart mål eller `null` i appkoblingen er en restoppgave, ikke noe Grok kan gjette. Det aktuelle skjermarbeidet kan ikke ferdigmeldes før alle dets trykkbare kontroller har kobling og kontrollbevis.

## Kartlagte koblinger

«På stedet» betyr at skjermen beholdes. Overleggs-ID-ene er logiske navn innført i dette registeret; de er ikke egne eksisterende appruter. Kildekontroll er ikke automatisk Anders' godkjenning eller appprøve.

| Kontroll-ID | Fra / plassering | Knapp | Observert mål | Viktig byggekrav |
|---|---|---|---|---|
| ph-nav-idag | PH-SKALL · hovedmeny | I dag | PH-01 · screen | Samme skjerm-ID i mobil- og desktopmeny; dokumenter valgt undermeny og tilbakevei. |
| ph-nav-plan | PH-SKALL · hovedmeny | Plan | PH-10 · screen | Samme skjerm-ID i mobil- og desktopmeny; dokumenter valgt undermeny og tilbakevei. |
| ph-nav-stats | PH-SKALL · hovedmeny | Stats | PH-16 · screen | Samme skjerm-ID i mobil- og desktopmeny; dokumenter valgt undermeny og tilbakevei. |
| ph-nav-meg | PH-SKALL · hovedmeny | Meg | PH-24 · screen | Samme skjerm-ID i mobil- og desktopmeny; dokumenter valgt undermeny og tilbakevei. |
| ph-hurtig-caddie | PH-SKALL · hurtigmeny | Spør Caddie | PH-22 · screen | Lukk hurtigmenyen ved overgang. |
| ph-hurtig-nyokt | PH-SKALL · hurtigmeny | Ny økt | PH-11 · screen | Lukk hurtigmenyen ved overgang. |
| ph-hurtig-runde | PH-SKALL · hurtigmeny | Registrer runde | PH-RD-01 · screen | Lukk hurtigmenyen ved overgang. |
| ph-hurtig-start | PH-SKALL · hurtigmeny | Start økt | PH-04 · screen | Lukk hurtigmenyen ved overgang; avklar øktvalg dersom ingen økt er valgt. |
| ph-01-okt-start | PH-01 · kort for ikke gjennomført økt | Start | PH-04 · screen | Åpne før-start for den valgte økta. Neste start må gå til riktig slag-/fysisk økt. Alle kort kan ikke vise samme demo. **Avvik:** Valgt økt sendes ikke i prototypens go-kall. |
| ph-01-okt-se | PH-01 · kort for gjennomført økt | Se økta | PH-03 · screen | Vis akkurat den gjennomførte økta og dens lagrede resultater. |
| ph-01-fys | PH-01 · Neste fysiske økt | Registrer sett | PH-WB-FYS · screen | Viderefør valgt objekt; bruk aktiv målversjon. |
| ph-01-turn | PH-01 · Neste turnering | Se forberedelser | PH-WB-TURN · screen | Viderefør valgt objekt; bruk aktiv målversjon. |
| ph-01-turn-tom | PH-01 · Neste turnering · tom | Legg til turnering | PH-WB-TURN · screen | Viderefør valgt objekt; bruk aktiv målversjon. |
| ph-01-plan-tom | PH-01 · Treningstid · tom | Velg treningsplan | PH-12 · screen | Viderefør valgt objekt; bruk aktiv målversjon. **Avvik:** R01: PH-12 tegner gammel planbygger. |
| ph-01-wb-tom | PH-01 · Dagens økter · tom | Bygg økter i Workbench | PH-11 · screen | Viderefør valgt objekt; bruk aktiv målversjon. |
| ph-01-runde-tom | PH-01 · Dagens økter · tom | Registrer runde | PH-RD-01 · screen | Viderefør valgt objekt; bruk aktiv målversjon. |
| ph-01-dagsform | PH-01 · Dagsform | 1–5 | PH-01 · på stedet | Registrer valgt dagsform. Bli på skjermen; feil beholder valget og tilbyr nytt forsøk. |
| ph-01-endring-les | PH-01/OV-PLANENDRING · dialog Endring i dagens plan | Les | PH-21 · screen | Les må åpne riktig melding. Ignorer lukker uten å slette meldingen. Lukk returnerer til samme bakgrunn. |
| ph-01-endring-ignorer | PH-01/OV-PLANENDRING · dialog Endring i dagens plan | Ignorer | PH-01 · close-overlay | Les må åpne riktig melding. Ignorer lukker uten å slette meldingen. Lukk returnerer til samme bakgrunn. |
| ph-01-endring-lukk | PH-01/OV-PLANENDRING · dialog Endring i dagens plan | Lukk | PH-01 · close-overlay | Les må åpne riktig melding. Ignorer lukker uten å slette meldingen. Lukk returnerer til samme bakgrunn. |
| ph-04-start | PH-04 · før start · Data | Start økt | PH-05 · screen | Start valgt økt med riktig kodehandling; fysisk økt må ha sin avklarte variant. Feil blir på før-start med nytt forsøk. |
| ph-04-lukk | PH-04 · topp | Lukk | PH-01 · screen | Avklar om økta ennå ikke er startet; bevar valgt økt i tilbakevisningen. |
| ph-04-tom | PH-04 · ingen øvelser | Åpne Workbench | PH-11 · screen | Åpne den samme økta for redigering. |
| ph-05-pause | PH-05 · topp | Pause / Fortsett | PH-05 · på stedet | Endre pause-/klokketilstand; bevar reps og øvelse. |
| ph-05-teller | PH-05 · teller per læringssteg | −1 / +5 / +1 | PH-05 · på stedet | Oppdater bare valgt teller. Negative antall er ikke gyldige. Bevar faktisk korrigering og lagringsstatus. |
| ph-05-avslutt | PH-05 · topp | Avslutt | PH-05/OV-AVSLUTT · overlay | Åpne bekreftelsen med faktisk status. Oppsummering åpnes først ved bekreftet avslutning. |
| ph-05-avslutt-fortsett | PH-05/OV-AVSLUTT · bekreftelsesdialog | Fortsett | PH-05 · close-overlay | Lukk dialogen og fortsett samme økt uten tap av tid/reps. |
| ph-05-avslutt-lagre | PH-05/OV-AVSLUTT · bekreftelsesdialog | Avslutt og lagre | PH-07 · screen | Avslutt valgt økt og vis dens faktiske resultat. Dokumenter om gjennomføring eller vurdering lagres her; ikke bruk demoens etter-tall. **Avvik:** R02: oppsummeringen bruker separat demo. |
| ph-05-ferdig | PH-05 · aktiv øvelse | Ferdig med øvelsen | PH-05 eller PH-07 · conditional | Neste åpne øvelse: bli på PH-05 og bytt drill. Ingen åpne øvelser: PH-07 med samme resultat. Tegn og test begge grenene. |
| ph-05-rekkefolge | PH-05 · øvelsesliste | Rekkefølge og hopp over | PH-05/OV-REKKEFOLGE · overlay | Bevar gjennomførte øvelser og faktiske målinger ved omrekkefølge/hopp over. |
| ph-07-lagre | PH-07 · bunn | Lagre økta | PH-01 · screen | Returner etter bekreftet lagring, med oppdatert gjennomføringsstatus. Feil/nettbrudd beholder resultat og tilbyr nytt forsøk. Fysisk variant har andre relevante vurderingsfelt. |
| ph-07-lukk | PH-07 · topp | Lukk | PH-01 · screen | Avklar håndtering av ulagret vurdering; lukk må ikke stille forkaste resultat. |
| ag-tp-01-tilbake | AG-TP-01 · topp | Teknisk plan | AG-10 · screen | Tilbake til samme spiller og plan; ulagrede endringer må håndteres. |
| ag-tp-02-tilbake | AG-TP-02 · topp | Teknisk plan | AG-10 · screen | Tilbake til samme spiller og plan; ulagrede endringer må håndteres. |
| ag-tp-01-skjema | AG-TP-01 · mobil forhåndsvisning | Åpne skjemaet | AG-TP-01/OV-SKJEMA · overlay | Åpne oppgaveskjemaet som bunnark på mobil; desktop viser samme oppgave i sidepanel. |
| ag-tp-01-lagre | AG-TP-01 · skjemafot | Lagre oppgave | AG-TP-01 · på stedet | Valider og lagre utkast. Bli på samme skjerm; skill lagret fra publisert. **Avvik:** R08: prototype simulerer bare lagring. |
| ag-tp-01-publiser | AG-TP-01 · skjemafot | Publiser til spiller | AG-TP-01 · på stedet | Publiser eksakt lagret revisjon etter tilgangskontroll. Resultatet blir synlig i PH-TP-01; coachen blir her. **Avvik:** Eksakt eksisterende publiseringshandling er ikke verifisert per knapp. |
| ag-tp-02-upload | AG-TP-02 · tom medievisning | Last opp bilde | AG-TP-02 · system-picker | Åpne avklart bilde-/videovelger for før eller etter. Avbryt, filfeil og lagringsfeil skal være tegnet. **Avvik:** R04/R08: riktig før-/ettermedieflyt mangler. |

## Særlig viktige avvik

- I dag-kortene bruker faste mål og sender ikke valgt økt-ID. Fysisk økt og slagøkt må åpne riktig innhold og variant gjennom hele reisen.
- PH-05 → PH-07 viser i dagens prototype andre demotall enn den avsluttede økta. Mål-ID alene er derfor utilstrekkelig.
- PH-12 og AG-23 har utgående varianter; en riktig lenke til feil variant er fortsatt feil overlevering.
- Publiseringsknapper må skilles etter oppgave, økt eller plan. Tegnet toast og synlighet i spillerens skjerm er to forskjellige bevis.

Fullfør kartet for resten av appen etter konsolideringen. Ta også med historiske videresendinger som egen kategori; ingen aktive knapper skal peke til en arkivert variant. Frys kart og skjermpakke sammen. Ved senere endring i mål, tilstand eller kontekst oppdateres kartet og berørte reiser prøves igjen.

[Byggeoverlevering](grok-build-overlevering.md) · [kontrollrapport](../design-audit/precision-gjennomgang-2026-09-30.md) · [skjermkontrakt](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml).

## Tillegg: kildeverifiserte appkoblinger

[Appkoblinger](appkoblinger-precision-athletics.md) og [JSON](appkoblinger-precision-athletics.json) viser 15 separate observasjoner fra faktisk kode, inkludert tre øktmodeller, oppgave-ID som mistes på vei til Workbench og publisering som aktiverer hele planen. De erstatter ikke kontroll av valgt ny designversjon. Prototypeavvikene over beskriver opprinnelig eksport; [mellomkontrollen](../design-audit/precision-mellomkontroll-2026-09-30.json) gjelder eksporten under pågående retting.
