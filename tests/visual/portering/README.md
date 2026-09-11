# Komponentprøver for porteringen

TN-18 prøves med de faktiske appkomponentene, syntetiske personer og kontrollerte serversvar. Next-ruting simuleres. Dette er ikke en innlogget ende-til-ende-prøve eller visuell godkjenning av hele skjermen.

Kjør fra prosjektroten, med Python Playwright og Chromium installert:

```sh
python3 .claude/skills/webapp-testing/scripts/with_server.py --server "node tests/visual/portering/server.mjs" --port 5441 -- python3 tests/visual/portering/tn-tilgang.py
```

Prøven dekker 320, 390, 834 og 1440 piksler; liste, valgt person, tom, lasting og feil; navigasjon, tastaturmeny, sperret dobbeltlagring, nettfeil og nytt forsøk, siste trener, feltnavn og redusert bevegelse. Resultat og bilder lagres lokalt under `_archive/portering-kontroll-2026-09-10/`, utenfor Git.

Riggserveren lytter bare på `127.0.0.1`. Den laster ingen miljøfiler og kontakter ingen database. Nettleserprøven blokkerer eksterne nettadresser. Reservefonter brukes frem til en separat prøve mot appens faktiske fontlast er gjennomført.

Train-lock, WANG C7 og PlayerHQs nye navigasjon inngår også. Kjør alle prøvene med:

```sh
python3 .claude/skills/webapp-testing/scripts/with_server.py --server "node tests/visual/portering/server.mjs" --port 5441 -- python3 tests/visual/portering/kjor-alle.py
```

Train-lock prøver Nå-kortets start/pågår/fullført/lang tekst i 32 kombinasjoner av tema og bredde; lagret tema, navigasjon uten V2Shell og kalenderarkets tastatur/fokus. WANG prøver 12 skjema-/feilvarianter, innsendte felt, dobbel innsending, nettfeil, nytt forsøk og vis/skjul passord. WANG-prøven sender aldri faktiske innloggingskall.

Next Link og navigasjon simuleres i alle prøvene; Next Image erstattes av et vanlig bildeelement. Dette kontrollerer ikke bildeoptimalisering, fontnedlasting, faktiske sesjonscookies eller tilgang i den innloggede appen.

## Bygget WANG-app

`wang-next.py` kjører mot den isolerte kontrollkopien `.worktrees/portering-kontroll-2026-09-10`, bygget med syntetiske miljøverdier. `next-server.py` avviser aktive miljøfiler og setter bare syntetiske verdier i prosessen. Kjør etter at kontrollkopiens bygg er ferdig:

```sh
python3 .claude/skills/webapp-testing/scripts/with_server.py --server "python3 tests/visual/portering/next-server.py" --port 5452 -- python3 tests/visual/portering/wang-next.py
```

Prøven beholder CSP (nettleserens skriptregel), sjekker ny nonce per forespørsel og samsvar med Next-skriptene, faktiske Montserrat-skrifter, mobil/desktop og at utfylte felt når Supabase-SDK-en. Innloggingsforespørselen avskjæres lokalt og får et syntetisk feilsvar. Den logger ikke inn mot Supabase eller beviser tilgang med en virkelig konto. Originale C7-rammer rendres med de samme fontfilene til lokal sammenligning; desktoprammen i kilden er 980 px selv om overskriften sier 1280.

PlayerHQ-navigasjonen prøves i åtte kombinasjoner (320, 390, 834, 1440 × lys/mørk). Prøven kontrollerer fem sirkler, 48 px trykkflater, lenker, aktiv fane, fast plassering, siste handling over menyen, Caddie-dialog, fokusretur, bevart kladd og stemmeark i riktig nettleserlag. Ingen chat sendes og mikrofonstøtte er slått av i prøven. Dette er komponentkontroll, ikke innlogget navigasjon mellom alle PlayerHQ-sidene.

## Hel I dag-komponent

`idag.py` utvider prøven med 64 kombinasjoner av bredde, tema og tilstand, dagskalender/fokus, faktiske øktlenker, fullført-merking og mobil/Mac-oppsett. Riggserveren leser Geist/Geist Mono fra den allerede bygde kontrollkopien. Til referanserammene bruker den valgt PH-01 v3 under `_archive/design-kilder-2026-09-10/playerhq-train-lock-4/` og lokale kopier av React 18.3.1s to UMD-filer i `_archive/portering-kontroll-2026-09-10/vendor/`. Disse private forutsetningene kreves bare av den hele I dag-/referanseprøven; andre komponentprøver kan kjøres uten Next-fontkopien. Originalene er ikke endret. Neste-ruting og sideskinnen er simulert, og ingen innlogget databasereise påstås.

## Plan v3

`plan.py` bruker de samme lokale Geist-/React-referansefilene som I dag. Den prøver fire bredder × to temaer × fylt/tom/lang tekst/overlapp, pluss godkjenning, avvisning, serverfeil, flytting, fokus og store bokstaver. Lasting prøves separat på mobil, iPad og Mac. Original PH-07 v3 rendres til tre private referansebilder. Serverhandlinger er erstattet bare i riggen; ingen virkelig lagring eller varsling skjer. Navigasjon til ny/rediger kontrolleres som lenkekontrakter, ikke som ferdig innlogget reise.

## Øktark PH-04

`brief.py` prøver felles øktark med faktiske Workbench-/plan-/V2-adaptere og syntetiske verdier. 84 varianter omfatter 320/390/834/1440, begge temaer, planlagt/pågående/pauset/fullført/avlyst, coach/PRO/forslag, tomt og langt innhold. Stor tekst, tastatur, oppstartsfeil, nytt forsøk og dobbeltinnsending prøves separat. Start-handlingen og Nexts `unstable_rethrow` er simulert kun i riggen. Dette beviser ikke faktisk innlogget start eller Nexts redirect-håndtering. Direkte rute bruker eget sentrert ark på Mac; kildens panel over en bevart bakgrunn gjenstår.


## Live-trening PH-05

`live.py` bruker faktisk LiveActive, rep-logger, lokal klokke og nettleserens IndexedDB. 40 varianter dekker fire bredder, to temaer og normal/tom/lang/lasting/startfeil. Separate reiseprøver dekker StrictMode, raske trykk, angre og nullkorrigering, pause/gjenåpning, notater, dialogfokus/Escape, dobbel fullføring, frakobling, lokal lagringsnekt, mislykket sending, tapt fullføringssvar og to faner med Web Locks. Next-ruting og serverhandlinger er avskåret, og Caddie-panelet er erstattet av en tydelig merket prøveknapp. Ingen AI-samtale, autentisert lagring eller faktisk databasetransaksjon prøves her. Golfregistrering prøves; den eldre FYS-loggeren har fortsatt egne åpne avvik.
