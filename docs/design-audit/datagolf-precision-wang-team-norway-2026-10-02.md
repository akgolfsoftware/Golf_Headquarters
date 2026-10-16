# DataGolf — designkontroll 02.10.2026

Status: tre klikkbare designmoduler, ikke kundeklar dataintegrasjon. Bestilt rekkefølge er fulgt: Precision først, deretter Team Norway og WANG med egne designsystemer. Ingen API-nøkkel, ekte spillerdata eller Excel-besvarelser er sendt til designverktøyet.

## Kilder og presis dekning

Lokalt kildegrunnlag: `ak-golf-pipelines/pipelines/datagolf/schema.py`, SHA-256 `2fbca8d38218c4bf73df85e0318f2553b25c89094d7bc1fb9cb8736d5cb3677f`. 16 modeller har totalt 135 felt. Klienten har 21 implementerte endepunktmetoder. Dette er ikke 135 sportslige mål og ikke et bevis på all informasjon i DataGolfs API, faktisk kontodekning eller kundelisens.

Egen strukturell kontroll av de eksporterte modulene mot kildegrunnlaget fant 135/135 felt i alle tre, uten manglende eller ekstra felt. Precision/TN ble også kontrollert mot rå datatyper. WANG bruker forkortede typer i kilden og rekonstruerer visningen; feltidentiteten er kontrollert, ikke hver rekonstruert råtype.

24 felt gjelder odds/fantasy og fire interne driftsfelt skal ikke vises til WANG/TN-trenere. Feltkatalogen viser derfor 107 felt. TNs interne analytikerprototype viser 131, med alle fire interne felter fortsatt skjult. Designverktøyets sluttrapport skrev feilaktig 132; egen kontroll av den faktiske skjermen viste 131.

## Designreferanser og private eksporter

| Flate | Claude Design | Eksport / SHA-256 |
|---|---|---|
| Precision | [Precision Athletics](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70) | eksport82 · `7c2c711720f0272a4bd9f3f2a006122d529949815d9910ab067b954eb83de8d7` |
| Team Norway | [Team Norway DataGolf](https://claude.ai/design/p/bc3e41fc-0386-4624-9b14-27355b64e2f7?file=Team+Norway+DataGolf.dc.html) | eksport4 · `3f5a4c7d9ffc6a348a426fe49d034b5dc33a0278e3dede4f21d662aa02b0ad12` |
| WANG | [WANG DataGolf](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335?file=WANG+Golf+DataGolf.dc.html) | eksport3 · `7da7d9ab1b62d61ac6b01e1a22875b47d597a54e7da7adde4ed91794391b7b6d` |

Eksporter, feltkontroller og skjermbilder er private under `Documents/Claude/akgolf-hq/datagolf-kontroll-2026-10-02`. Designene er ikke publisert offentlig. WANGs overlevering ligger i eksportens `kildemateriale/WANG-datagolf-DG01-17-overlevering.md`; TN har en egen Overlevering-skjerm.

## Skjermpakke i alle tre

| ID | Innhold |
|---|---|
| DG-01 | Analyseoversikt, datadekning og lagrede utvalg |
| DG-02 | Spillerkatalog, søk, filtre og identitetskobling |
| DG-03 | Spillerprofil med kilde, periode og datagrunnlag |
| DG-04 | Topplister per kategori, sesong, tour og minstegrunnlag |
| DG-05 | Sammenligning for trener |
| DG-06 | Innspill per avstand og nærhet |
| DG-07 | Turnerings-/runde-/resultathistorikk, brutto score |
| DG-08 | Turneringskalender |
| DG-09 | Turneringsanalyse |
| DG-10 | Live-resultater med tidspunkt og feilbevaring |
| DG-11 | Modellanalyse, skilt fra målte resultater |
| DG-12 | Bane og felt, eksplisitte hull i kildegrunnlaget |
| DG-13 | Trend, referanse og utvalgsbygger |
| DG-14 | Feltkatalog med type, enhet, null, kilde og skjerm |
| DG-15 | Endepunkter, synk og datadekning |
| DG-16 | Funn → mål → forslag → spillerens beslutning |
| DG-17 | Spesialistregister med rolle-/avtalesperrer |

## Egen kontroll og rettelser

- Precision: rettet «undefined»-kolonne, feltdekning, rollefilter og sammenligning som ikke skal ligge hos spilleren. Datautforsker kontrollert i 390/1440 px, ingen sidelengs rulling eller «undefined». Trener viste 107 felt; markedsfelt skjult.
- TN: fant at substring-regel ga landkode enheten «heltall», spiller-ID «tekst» og boolsk amatørstatus «tekst». Designet er rettet med eksplisitt enhetskart. De tre feltene ble kontrollert i faktisk UI. Ny eksport matcher fortsatt 135/135 felt. Datautforsker i 390/1440 px: ingen sidelengs rulling eller «undefined», trener107/analytiker131. Eksportknappen er sperret.
- WANG: Datautforsker viser 107/135 og 21 klientmetoder. Søk etter `params_json` og `open_odds` ga null felt. 390/1440 px hadde ingen sidelengs rulling eller «undefined». Eksport er sperret uten eksportrett; simulerte avtalevalg er tydelig merket prototype.

Claude Design rapporterte egne større tilstands-/klikkmatriser (TN342; WANG20 ruter × flere bredder og tilstander). Disse er ikke lik egen uavhengig kontroll. Full tastaturrunde, alle tilstander og ende-til-ende integrasjon med app/database er ikke verifisert her. WANGs prototype har dessuten kjent overskriving mellom to åpne faner; dette kan ikke brukes som produksjonslagring. Anders har ikke gitt visuell sluttgodkjenning.

Tilleggskontroll av TN eksport4: alle DG01–17 navigert i390/1440 px uten sidelengs rulling eller «undefined». På begge bredder er dessuten alle17×9 simulerte datatilstander målt,306 tilfeller uten disse to avvikene. Dette måler layout og tekst, ikke alle handlinger, tastaturbruk eller tilgang i en ekte app. Private JSON-målinger er lagret sammen med eksportene.

Egen WANG-prøve fant først at to økter/uke i fire uker ble kvittert som «1 elementer». Eksport3 er rettet og prøvd på nytt: to økter/uke i seks uker gir 12 udaterte økter. Gjentatt test krever eksplisitt første testuke; uten valg er sending sperret. Valgt første uke 3 og gjentakelse hver tredje uke gir to tester, i relative uker 3 og 6. Sending endret ikke planen; godkjenning ga 12 økter og to tester én gang, beholdt etter ny innlasting. Mobil 390 px og desktop 1440 px hadde ingen sidelengs rulling. Eldre prototypeforslag er merket med at mengden ikke kan bekreftes. Dette er fortsatt syntetisk nettleserlagring og udaterte økter, ikke ferdig kalenderintegrasjon.

Precision eksport82: egen prøve fant først at korrekt 12-øktersgodkjenning forsvant ved ny innlasting. Rettelsen er prøvd med et nytt forslag: to økter/uke i seks uker, null økter før godkjenning, 12 etter godkjenning, planversjon v4 og samme 12 etter ny innlasting. Skjermen viser gjenoppretting fra lokal lagring og ingen ny Godta-knapp. 390/1440 px ble målt uten sidelengs rulling. Nullstill-knappen gjelder bare syntetiske prototypedata.

## Åpne integrasjonskrav

1. Dokumenter konto-/kundebruksrett før aktivering eller eksport. Ingen aktivering er utført.
2. Live-/field-updates-metoder mangler lokal lagringsmodell. Banepassform/feltstyrke/hullstatistikk kan ikke påstås integrert fra eksisterende modeller.
3. Kontroller hver endepunkt–modell-kobling og faktiske API-responser. Navnelikhet er ikke kildebevis.
4. Offentlig pipelineprofil må aldri bli privat PlayerHQ-profil ved navnelikhet. Kobling og navngitt samtykke må prøves i serverlaget.
5. Egen TN-klikkprøve fulgte SG innspill/2026/amatører → Aksel Demo → sammenligning → forslag. Utvalg fulgte med; ett sendt forslag endret ikke planen før simulert godkjenning. Egen kontroll fant først at to økter per uke i fire uker ga kvitteringen «Én økt lagt inn». Rettingen er kontrollert med en ny reise: åtte udaterte økter vises etter godkjenning. Eldre lagrede prototypeforslag ga deretter en misvisende nullkvittering; eksport4 er kontrollert ved ny innlasting og viser nå «Eldre prototypeforslag – mengden kan ikke bekreftes», uten kvittering eller økter. Ny egen prøve bekreftet 3×4=12 og uendret kvittering etter ny innlasting. Valget2×6 viste12 før sending; simulert nyere spillerplan ga konflikt og null nye økter. Avvisning er ennå ikke uavhengig etterprøvd i denne runden. DG-16 er en prototype. Forslag må anvendes én gang i spillerens faktiske Workbench etter godkjenning, med revisjonskonflikt og avvisning prøvd i databasen.
6. Portering må beholde gjeldende rollegrenser, egne WANG/TN-merker og kilde-/tidspunktmerking. Ikke vis sammenligning med andre på spillerflaten.
