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
