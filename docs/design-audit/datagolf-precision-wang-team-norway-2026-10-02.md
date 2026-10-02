# DataGolf — designkontroll 02.10.2026

Status: tre klikkbare designmoduler, ikke kundeklar dataintegrasjon. Bestilt rekkefølge er fulgt: Precision først, deretter Team Norway og WANG med egne designsystemer. Ingen API-nøkkel, ekte spillerdata eller Excel-besvarelser er sendt til designverktøyet.

## Kilder og presis dekning

Lokalt kildegrunnlag: `ak-golf-pipelines/pipelines/datagolf/schema.py`, SHA-256 `2fbca8d38218c4bf73df85e0318f2553b25c89094d7bc1fb9cb8736d5cb3677f`. 16 modeller har totalt 135 felt. Klienten har 21 implementerte endepunktmetoder. Dette er ikke 135 sportslige mål og ikke et bevis på all informasjon i DataGolfs API, faktisk kontodekning eller kundelisens.

Egen strukturell kontroll av de eksporterte modulene mot kildegrunnlaget fant 135/135 felt i alle tre, uten manglende eller ekstra felt. Precision/TN ble også kontrollert mot rå datatyper. WANG bruker forkortede typer i kilden og rekonstruerer visningen; feltidentiteten er kontrollert, ikke hver rekonstruert råtype.

24 felt gjelder odds/fantasy og fire interne driftsfelt skal ikke vises til WANG/TN-trenere. Feltkatalogen viser derfor 107 felt. TNs interne analytikerprototype viser 131, med alle fire interne felter fortsatt skjult. Designverktøyets sluttrapport skrev feilaktig 132; egen kontroll av den faktiske skjermen viste 131.

## Designreferanser og private eksporter

| Flate | Claude Design | Eksport / SHA-256 |
|---|---|---|
| Precision | [Precision Athletics](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70) | eksport80 · `8c7f23c6dde39343d94be919ac438f8a4775bee73df6f497a086d39892dc9080` |
| Team Norway | [Team Norway DataGolf](https://claude.ai/design/p/bc3e41fc-0386-4624-9b14-27355b64e2f7?file=Team+Norway+DataGolf.dc.html) | eksport2 · `f8664a1fc848ce974b6a8643f63771d51055f64756142917feefb1967ae9659d` |
| WANG | [WANG DataGolf](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335?file=WANG+Golf+DataGolf.dc.html) | eksport2 · `1b9a166358824011bb677b3e5d3e8e258f2c42d98b00864632e243c49bebd5d6` |

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

## Åpne integrasjonskrav

1. Dokumenter konto-/kundebruksrett før aktivering eller eksport. Ingen aktivering er utført.
2. Live-/field-updates-metoder mangler lokal lagringsmodell. Banepassform/feltstyrke/hullstatistikk kan ikke påstås integrert fra eksisterende modeller.
3. Kontroller hver endepunkt–modell-kobling og faktiske API-responser. Navnelikhet er ikke kildebevis.
4. Offentlig pipelineprofil må aldri bli privat PlayerHQ-profil ved navnelikhet. Kobling og navngitt samtykke må prøves i serverlaget.
5. Egen TN-klikkprøve fulgte SG innspill/2026/amatører → Aksel Demo → sammenligning → forslag. Utvalg fulgte med; ett sendt forslag endret ikke planen før simulert godkjenning. Avvik: valget2økter/uke×4uker ga kvitteringen «Én økt lagt inn». Dette er sendt til retting i Claude Design og er ikke bekreftet rettet i denne eksporten. DG-16 er en prototype. Forslag må anvendes én gang i spillerens faktiske Workbench etter godkjenning, med revisjonskonflikt og avvisning prøvd i databasen.
6. Portering må beholde gjeldende rollegrenser, egne WANG/TN-merker og kilde-/tidspunktmerking. Ikke vis sammenligning med andre på spillerflaten.
