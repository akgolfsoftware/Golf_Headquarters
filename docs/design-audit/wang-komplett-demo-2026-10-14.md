# WANG — kontroll av selvstendig demo, 14. oktober 2026

Kontrolldato: 14.10.2026. Samlet i repoet 21.10.2026 fra lagrede kontrollbevis.
Dette er en historisk kontroll av en selvstendig Claude Design-demo med fiktive data.
Det er ikke en ny nettleserkontroll eller godkjenning av den innloggede WANG-appen.

## Leveransen

Én sammenhengende, klikkbar demo for golf, fotball og svømming, med åtte roller:
admin, rektor, toppidrettssjef, sportssjef, trener, elev/utøver, forelder og klubbtrener.

Hovedfilen i designprosjektet heter `WANG komplett demo - tre idretter og atte roller.dc.html`.
Den selvstendige eksporten heter `wang-komplett-demo.html`. Den siste kontrollerte eksporten
startet med Rektor/Golf og hadde innebygde logoer og scripts. Alle personer, kontaktdata og tall
var merket fiktive. Fotball og svømming viste illustrative fagdata, ikke godkjente fagplaner.

[Visningsrekkefølge på ni minutter](../planer/wang-komplett-demo-visningsrekkefolge-2026-10-14.md).

## Dekning i den lagrede skjermkontrollen

72 menyvisninger per idrett gir 216 kombinasjoner av rolle, idrett og meny. Dette er ikke
216 forskjellige skjermtyper. De samme kombinasjonene ble kontrollert ved begge bredder.

| Rolle | Menyvisninger per idrett |
|---|---:|
| Admin | 7 |
| Rektor | 8 |
| Toppidrettssjef | 7 |
| Sportssjef | 13 |
| Trener | 12 |
| Elev/utøver | 12 |
| Forelder | 7 |
| Klubbtrener | 6 |
| Sum | 72 |

| Kontroll | 1280 piksler | 390 piksler |
|---|---:|---:|
| Rolle/idrett/meny-kombinasjoner | 216 | 216 |
| Vannrett overflyt | 0 | 0 |
| Ødelagte bilder | 0 | 0 |
| Visninger uten overskrift | 0 | 0 |

Menydekning viser at visningene åpner. Den dokumenterer ikke alene at alle handlinger virker.
Handlingene nedenfor ble kontrollert særskilt.

## Kontrollerte handlinger

- Trener opprettet og publiserte en økt. Eleven måtte gjøre morgeninnsjekk før kalender og plan
  ble tilgjengelig. Samme økt kunne registreres gjennomført med refleksjon, og registreringen
  vistes både hos trener og i elevens Dagbok.
- Elevens egentrening kunne opprettes og endres. Skole- og WANG-hendelser var låst for eleven.
- Daglig gjentakelse, valgte ukedager, ukentlig, hver n-te uke og månedlig gjentakelse viste
  datoer i forhåndsvisningen før publisering. Dette er ikke bevis for alle serieendringer.
- Forelder og trener så samme sendte melding begge veier i alle tre idretter. Klubbtrener
  mottok samme samtale om den delte eleven i alle tre idretter.
- Send-knappen og Enter åpnet bekreftelse for ekstern mottaker før lokal lagring. Avbryt
  bevarte avsenderens utkast. Usendt tekst var ikke synlig i mottakerens skrivefelt.
- En gruppe som admin fjernet fra treneren, forsvant fra trenerens oversikt og gruppevalg.
  Utløpt klubbdeling sperret innsyn. Forelderoversikten fulgte avtalt delingsomfang.
- Admin-import med feil blokkerte oppretting. Gyldig eksempelfil ga forhåndsvisning og lokalt utkast.
- Planveien år → periode → måned → uke → økt ble kontrollert direkte i golf. Alle tre idretter
  ble også gjennomgått i Claude Design; dette er et annet kontrollbevis enn den direkte golftesten.
- Førstefeltfokus, Escape og retur til åpningsknappen virket i siste eksport. Mobilmenyens
  fokusfelle ble kontrollert. Den siste eksporten hadde ingen konsollfeil i en ren fane.

Den tidligere `componentDidUpdate`-feilen ble rettet ved å lagre forrige dialogstatus eksplisitt.
Runtime ga ikke det andre argumentet som den opprinnelige koden forventet. Kildekontroll
bekreftet at fokusreturen og meldingsrettingene var bevart i siste eksport.

## Identitet og etterprøvbarhet

Rå kontrollfiler og skjermbilder er bevart i den lokale leveransen
`2026-10-14-komplett-demo`. Lokale skjermbilder og private prosjektlenker er ikke lagt i Git.
De to filene nedenfor ble lest og summene kontrollert på nytt 21.10.2026.

- `menykontroll-final-1280.jsonl`: 216 rader, SHA-256
  `90b2171d437bc330b2fe4d6a7e9a2f185a8506357d3dcbeaaf169febe45f8832`.
- `menykontroll-final-390.jsonl`: 216 rader, SHA-256
  `7fdbe67641d0f03930b22feebd428edb60743eff1fbfec8c88caf1b9f9610ec6`.

Supplerende bevis er `flytkontroll-v2.json`, `meldingskontroll-v3.json`,
`utkast-klubbkontroll-v4.json`, `klubbmeldinger-v4.json`, `delingskontroll-v2.json`
og `trenertilgang-v2.json`. Versjonsnavnene angir hvilken rettingsrunde handlingen ble prøvd i.
Den samlede skjermkontrollen gjelder siste eksport.

## Avgrensning mot faktisk app og publisering

Den selvstendige demoen lagret bare demonstrasjonsendringer i nettleseren, frem til Nullstill demo.
Ingen ekte melding, e-post, konto eller databaserad ble opprettet som del av denne kontrollen.

Ved avslutningen 14.10 var offentlig publisering av den selvstendige demoen ikke gjennomført.
En offentlig lenke uten innlogging var derfor ikke kontrollert. Publiseringsstatusen i Claude
Design er ikke kontrollert på nytt 21.10. Denne samlingen av dokumentasjon publiserer ikke demofilen.

Den nedlastede HTML-eksporten fra den opprinnelige kontrollen er ikke tilgjengelig i den lokale
leveransemappen eller de tidligere kjente kontrollstiene ved samlingen 21.10. Den er ikke kopiert
inn eller gjenskapt fra skjermbilder. Ny appintegrasjon må starte fra en fersk, identifisert eksport.

Den faktiske appens Golf-demo, rollevisninger og produksjonsporter beskrives i
[appens demoreise og produksjonsplan](../planer/wang-fredrikstad-demoreise-og-produksjonsplan-2026-10-14.md).
Sikker innlogget sluttkontroll er klargjort gjennom
[PR #1476](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1476), men dokumentasjonen i
hovedversjonen sier at faktisk kjøring fortsatt venter på tilgang til riktig WANG-database.
Ingen av disse åpne punktene markeres ferdige av den historiske demokontrollen.
