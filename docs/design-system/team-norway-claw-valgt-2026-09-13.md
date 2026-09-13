# Team Norway — Claw valgt for bygging

Dato: 13.09.2026
Beslutningseier: Anders Kristiansen

## Beslutning

Claw-pakken «Claw Design — Team Norway Golf» er visuell fasit for alle egne Team Norway-skjermer under `/team-norway/*`.

- Den ekte logoen fra `designsystem/team-norway/assets/logo/team-norway-golf.png` brukes fra fil. Merket gjenskapes aldri med tekst eller CSS.
- Claw styrer farger, typografi, kort, navigasjon, tabeller, tilstander, mobilmønstre og grafisk temperament.
- AK Golf HQ styrer funksjon, data, datatilgang, roller, samtykke, personvern og serverhandlinger.
- Eksisterende AK Golf HQ-funksjoner gjenbrukes. Team Norway får ikke parallelle kopier av test-, turnerings-, plan- eller samtykkemotorer.
- «Datatilgang: alltid ja» betyr at autoriserte skjermer skal lese reelle AK Golf HQ-data der modellen finnes. Det betyr ikke å fjerne innlogging, gruppetilhørighet, spillerscope eller foresattsamtykke.
- Manglende data er `Ukjent` eller en navngitt tomtilstand, aldri null eller oppdiktet demoinnhold.

Denne beslutningen erstatter den generelle formuleringen «blått organisasjonsmerke der PlayerHQ har rust» for Team Norway. En senere samlet Claude Design-kandidat kan ikke erstatte Claw-profilen uten en ny, uttrykkelig beslutning fra Anders.

## Implementert skjermomfang

TN-00 til TN-21 er representert gjennom egne ruter eller den eksisterende, funksjonelle AK Golf HQ-flaten skjermen tilhører:

- Organisasjonsskall, oversikt og spillerutvikling
- Fellestesting, protokollbibliotek og protokolldetalj
- Gruppeposter, enkeltspillerpost og dokumentdeling
- Samtykke i PlayerHQ/Forelder
- Uttak, rangliste og skoleoversikt
- Samlingspunkt, Collegegruppen og månedsplan
- Turneringsoversikt og manuell registrering
- Trenere/tilgang, spillerinvitasjon og trenerkatalog
- Referansenivåer

Presentasjon og systemkart er dokumentasjons-/eksportflater i Claw-registeret og er ikke app-ruter.

## Bevisgrense

Kode, typografi, tokens, logoressurs og ruter er kontrollert teknisk. Skjermene er i tillegg kontrollert i faktisk app på 390 px mobil og 1440 px desktop med syntetiske testbrukere for trener, Team Norway-spiller og spiller uten Team Norway-tilgang.

Kontrollen dekket 32 kombinasjoner av rute, rolle og skjermbredde:

- 30 autoriserte visninger lastet korrekt
- 2 avviste visninger viste forventet «Denne siden finnes ikke»
- 0 horisontale sidebredde-feil
- 0 konsollfeil
- spillerens meny inneholder ikke trenerflater

Visuell produksjonsgodkjenning tilhører fortsatt Anders. Den tekniske og rollebaserte skjermkontrollen er bestått.
