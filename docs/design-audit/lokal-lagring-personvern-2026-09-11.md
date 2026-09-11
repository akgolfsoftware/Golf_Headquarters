# Lokal lagring og personvern — 11.09.2026

## Resultat

Sensitive utkast og ventende opplastinger i nettleseren er avgrenset til den
serververifiserte, innloggede bruker-ID-en. Bytte av bruker på samme enhet gir
derfor ikke tilgang til forrige brukers lokale data gjennom appen.

Omfanget er:

- tapper-kø og liveøkt-kø i IndexedDB
- ventende lydklipp i IndexedDB
- rundekladd, testutkast og Caddie-fangst i localStorage
- øktnotater i sessionStorage
- private sider og Next.js-data i service worker-cache

## Sikker overgang

De gamle eierløse IndexedDB-butikkene og lagringsnøklene blir ikke lest eller
automatisk migrert. De beholdes urørt på enheten fordi appen ikke kan fastslå
hvilken bruker de tilhører. Ny lagring bruker egne versjonerte butikker og
nøkler med bruker-ID.

Serveren kontrollerer fortsatt tilgang ved synk. Bruker-ID-en i nettleseren er
bare et lokalt navnerom og erstatter ikke tilgangskontroll på serveren.

## Feilhåndtering

Når både nettverk og lokal lagring svikter, viser appen en vedvarende melding og
ber brukeren holde siden åpen. Fangstarket nekter å lukke hvis et usendt notat
verken kan leveres eller lagres lokalt.

## Cache-kontroll

Service workeren bruker bare nettverk for autentiserte ruter under blant annet
`/portal`, `/admin`, `/meg`, `/forelder`, `/innsyn`, `/team-norway` og den
innloggede WANG-coach-delen. Offentlige mikrosider omfattes ikke.

## Kontroll

- `npm test`: 2 378 tester besto, 0 feil
- `npm run verify`: besto, inkludert typesjekk, lint, prosjektkontroller,
  designvakter, produksjonsbygg og Serwist-service worker
- enhetstester dekker nøkkelbygging, eierskille, private cache-ruter og
  eksisterende retry-regler
- nettlesertest med syntetiske brukere bekrefter at to brukere med samme
  økt-/opptaks-ID ikke kan lese eller sende hverandres data
- den gamle eierløse tapper-raden ble bevart og var utilgjengelig for begge
  testbrukerne

## Åpne begrensninger

- Eldre eierløse data kan ikke gjenopprettes automatisk uten risiko for å gi
  dem til feil bruker.
- Endringen er ikke en krypteringsløsning for en kompromittert enhet eller en
  person med direkte tilgang til nettleserens utviklerverktøy.
- Autentisert ende-til-ende-kontroll i en ekte brukerøkt gjenstår til pakken er
  integrert og et egnet testmiljø er tilgjengelig.
