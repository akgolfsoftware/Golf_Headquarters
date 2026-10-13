# WANG og Team Norway · sammenhengende skjermpakke 13. oktober 2026

Arbeidet er gjort fra kontrollert checkpoint `9b45145c4a35659411e74b77df92286ca8864417` i en separat arbeidskopi. Denne rapporten beskriver egne org-filer. Den er ikke en visuell godkjenning eller en påstand om publisert plattform.

## Faktiske endringer

WANG beholder Montserrat/Quattrocento Sans, egne farger og eksisterende funksjoner. Trenerens IUP-samtale, testresultater og konkurransehistorikk bruker nå samme WANG-skall som spilleroversikten. Dobbelt «Golf» i merkevaren er fjernet. Spillerprofilens Plan, Teknisk plan og Stats viser faktisk valgt fane. Hovedtittelen kommer før gruppekonteksten.

IUP beholder evaluering, egen- og trenervurdering, status, målinger, eksisterende kommentarer, nye fokusområder, egentid og målemetode. Tallvalgene 1–5 har 44 px treffflater og fylt valgt verdi. Kommentar til vurderingen var allerede et lagret felt, men var ikke synlig i den gamle skjermen; samme felt vises nå med den eksisterende lagringshandlingen. Nye fokusområder sendes fortsatt som forslag og endrer ikke årsplanen før spillerens godkjenning.

Spiller og forelder får en uttrykkelig lesevisning av den samtykkede IUP-samtalen. Vurderinger og fokusområder vises som tekst uten endringskontroller; tilbakeveien går til spillerportalen eller foreldreflaten. Trener/admin beholder redigeringen. Seksjonene har faktiske overskrifter for skjermleser; en manglende neste periode forklares med lenke til gruppeperiodene. Testresultatflaten ligger innenfor én hovedlandmark i WANG-skallet. Serverens rolle-, gruppe- og samtykkekontroller er uendret. Ved nettfeil vises forklaring og utkastet beholdes på skjermen; samme requestId brukes ved nytt lagringsforsøk.

Team Norway beholder Jost/Lato og organisasjonens tokenverdier. Workbench er synlig for trenerrollen i «Plan og fag». Delingsoversikt, organisasjonsoppsett og nasjonal testoversikt får egne aktive menyområder. Skjermtitler, seksjonstitler, kildeføtter, filterknapper og statusord har vanlig lesbar typografi; tall og målinger beholder tallskriften. Feltetiketter og kildeopplysninger er minst 13 px i de berørte skjermfamiliene. Flategruppering bruker eksisterende navy-toner fremfor gjentatte hårstreksrammer.

TN-datorader beholder innhold og handlinger på liten skjerm ved å plassere handlingen under radteksten. Tabellenes mobile etiketter bruker vanlig ordskrift. Feilvisningen har en tydelig overskrift og én eksisterende «Forsøk på nytt»-handling. Statusetiketter for økter avstemmes med språk-masterens «Gjennomført»; testgjennomføring er fortsatt «Fullført» der teststatusen er poenget.

## Dekning og grenser

WANG-familier: I dag, treningens fem horisonter, spilleroversikt, delt plan/teknisk plan/Stats, IUP, testresultater, konkurranse, meldinger og administrasjonsinnganger. TN-familier: oversikt, spillerutvikling/profil, gruppeplan og personlige forslag, oppgaver/belastning, tester/resultater, samlinger, turneringer, rangliste, referansenivåer, uttak, college, dokumenter/poster og tilgangsflater. Alle viderefører faktisk eksisterende innhold; felles primitiver og skjermetiketter er samordnet gjennom familiene.

De nye separate WANG-rutene `/team-wang/app` og `/team-wang/demo`, WANG Auth, databaser og migrasjoner er utenfor denne skrivepakken og er bevart av hovedagenten. Ingen automatisk overføring av innlogging eller elevrettigheter er bygget. Gruppens felles Workbench, årsplan, timeplan og skoledata eies av hovedagenten. Spillerens økt/Live/PlayerHQ-overganger kontrolleres samlet der.

Live Watch har fortsatt ingen tilkoblet hull-for-hull-kilde og viser dette ærlig. Strukturert samlingsøkonomi/overnatting er fortsatt uten egen eksisterende modell; registrert program-/reisetekst beholdes. Ingen ny vurderingsmodell, helseopplysninger, ekte invitasjon, e-post, betaling eller produksjonsdata er behandlet.

## Kontrollbevis

- Målrettet lint er grønt for org-sidene, komponentene og egen IUP-test.
- IUP-tallvalgets teal ble målt til 4,40:1 mot hvit talltekst. Den eksisterende mørkere WANG-teksttokenen brukes nå og gir 5,94:1. TN-sekundærtekst på eksisterende navy-tone er målt til 4,74:1.
- Typekontroll er grønn etter generering av ignorert Prisma-klient; genereringen endrer ikke databasen. Kontrollen trenger den samme 8 GB arbeidsminnerammen som hovedappen.
- 31 målrettede komponenttester var grønne før siste kommentar-/etikettbatch. Nye kontroller dekker elev/forelder som lesevisning, riktig tilbakevei og beholdte trenerkontroller. Disse kjøres også i samlet sluttkontroll.
- Første syntetiske skjermrunde: 14 av 14 kombinasjoner ved 390 og 1440 px, uten vannrett overflyt, små treffmål, tom rendering eller konsollfeil. Faktiske komponenter er brukt for IUP utfylt/tom/leser, TN plan/tom/spiller og TN feil.
- Bildene avdekket gjenstående gammel kapitalisering i IUP og for liten forskjell mellom TN-side og arbeidsflate. Dette ble rettet samlet; bekreftelsesrunden var også 14 av 14 uten avvik.
- Private skjermbilder og logger ligger utenfor Git. De er syntetiske designbevis, ikke autentisert ende-til-ende-test eller fysisk telefonkontroll.

Full kontroll av arbeidskopien og den senere integrerte hovedappen er ulike kjøringer. En tidligere arbeidskopikontroll passerte alle 4 835 server- og 206 komponenttester, men bygget avviste dependency-symlinken utenfor Turbopack-roten. Dette er løst med en lokal APFS-klone av nøyaktig samme installasjon; felles config og kildeinstallasjonen er urørt. En ny full kontroll kjøres på den fryste, kontrastrettede koden. Den innledende IUP-rutetesten har også fått korrekt mock av klientskallet under Reacts serverbetingelse; alle 16 ressursgrense-/handlingstester passerer med de opprinnelige avvisningskontrollene beholdt.

Integrert faktisk nettleserreise, fysisk telefon, Anders' visuelle vurdering og produksjonskontroll rapporteres som egne resultater. Ingen av dem skal utledes fra de syntetiske skjermmålingene alene.

## Sluttkontroll og samordning

Sluttkontrollen bestod typer, lint, statiske kontroller, 4 835 server- og 206 komponenttester. Turbopack kom forbi pakke-symlinken etter lokal APFS-klone, men stoppet i Montserrat-importen med «next/font/google queries have exactly one entry». Fonter, felles config og kildeinstallasjonen er bevart. Organisasjonspakken er tatt inn uten commit i hovedarbeidskopien, hvor siste samlede verify må bli grønn før lagring. Ingen produksjon, tilgangsutvidelse eller ekte elevhandling er utført.

Etter integrasjon er de fem avsluttende designfunnene rettet og lukket. Se [sluttvurderingen](sluttvurdering-2026-10-13.md). Det nye root-bygget kom forbi Montserrat-importen uten å endre fontene. Fullt bygg-/sluttresultat rapporteres først ved avsluttet kontroll.

## Faktisk lokal lagring etter samordning

Root prøvde appens ekte serverhandlinger og separate lokale testdatabase: 38/38 IUP-, månedsplan-, godkjennings- og øktforslagsprøver samt 10/10 gruppeoppgaveprøver bestod. Neste IUP-periode/egen plan endres først ved spilleraksept. Fremmed coach, gammel versjon og gjennomført gruppeoppgave ble avvist. Dette er tilgangs- og lagringsbevis med syntetiske data, ikke full nettleserreise, fysisk telefon eller produksjonsprøve. Nyeste samlede status står i [oppgraderingsstatus](oppgraderingsstatus-2026-10-13.md).
