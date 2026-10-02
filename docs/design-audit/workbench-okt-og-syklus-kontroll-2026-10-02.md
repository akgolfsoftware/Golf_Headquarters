# Øktinnhold og treukerssyklus — kontroll 2. oktober 2026

Pakken bygger videre på [samlet Workbench](workbench-samlet-kontroll-2026-10-02.md), valgt Precision Athletics eksport77 og eksisterende [planleggingsregler](../treningsplanlegging.md). Arbeidsgren `codex/workbench-okt-og-syklus-2026-10-02`, første kodefrys kl.06:29 og siste retting fryst kl.06:48:04 Oslo. Main til `57a641291` er samordnet før samlet kvalitetskontroll. Ingen ny databasekolonne eller produksjonsmigrasjon.

## Implementert innhold

Øktformål, sted og målsetning følger oppretting, redigering/tømming, lesing, mal/forrige økt, serie og gruppe-/medlemskopier. En selvstendig øvelsesmålsetning ligger i `akFormel.detaljer.mal.malsetning`. Historisk P-posisjon i `techniqueFocus` er bevart og merket nøytralt. Rå JSON, referanser, dose, null/0 og egne drill-ID-er beholdes ved redigering; kopier får nye ID-er uten gjennomføringshistorikk. Serieendringer bruker status- og tidsvakt, gruppers lokale overstyringer beholdes.

Treukerssyklusen kobler tre konkrete sammenhengende ISO-uker. Eksisterende WeekPlan-rader er den ene sannheten; valgfri metadata kobler dem. Hver uke redigeres med Precision UkeplanArk og fritt valgt uketype, opphold, test-/notatmerker, fokus, timer og øktbudsjett. Ingen oppfunnet typefølge eller automatisk belastningsregel.

Lesing/skriving skjer etter eksisterende innlogging, samtykke og eier-/coach-vakt. Serializable transaksjon og avstemte kilde-/målfingeravtrykk avviser samtidig endring uten delvis skriv. Kopiering krever konkret målmandag og konsekvensvisning, med eksplisitt bekreftelse før fylte ukeplaner erstattes. Eksisterende måløkter og lokale gruppeoverstyringer beholdes. Nye egne økter blir DRAFT med rå planinnhold og nye ID-er; actual/RPE/live/logger/publisering og gruppeoriginalenes koblinger følger ikke med. Gruppe-, skjulte, avventende, aktive og maløkter utelates synlig.

Samme operasjons-ID tåler gjenforsøk uten doble økter eller overskriving av nyere redigering. Gamle ukeplanklienter uten cyclefelt bevarer koblingen; bare eksplisitt oppløsning fjerner den. Ukjent/fremtidig uke-JSON og uavklarte historiske mengde-/ISO-felt avvises og bevares.

## Målrettet bevis

- Øktmetadata:34 enhetsprøver,14 faktiske komponentprøver og7 ekte separate lokale DB/Auth-prøver grønne. De omfatter fem øvelsesgrener, oppretting/redigering/tømming, stale/fremmed, rå kopier uten logger, serieavgrensning og gruppepublisering med lokal overstyring.
- Syklus:10 enhetsprøver,13 komponentprøver og5 ekte lokale DB/Auth-prøver grønne. De omfatter ISO52→53→1, frie typer, null/0, egen/faktisk coach/fremmed, gammel klient, forventet tom målrad, stale, atomisk rollback, gjenforsøk, rå kopiering uten historikk og eksplisitt oppløsning.
- Komponentreisene bruker faktiske komponenter; de er ikke visuell godkjenning. Root sin samlede kontroll, synkroniserte nettleserreise, CI og produksjon registreres under etter faktisk resultat.

Separat prosjekt `ak-hq-workbench-20261002`, bare DB127.0.0.1:55722/Auth55721/app3072 og syntetiske data. Private logger/rapport/bilder ligger utenfor Git. Originalcheckout og andre økters endringer er bevart; sikkerhetsstash før main-samordning er beholdt.

## Sikkerhet og personvern

1. Fremmed lesing/skriving avvises på serveren før personlesing. Egen spiller og faktisk coach er prøvd mot lokal Auth/DB. Foresatt/ekstern leser får ingen ny skriverett.
2. Ingen ny AI-overføring, PII-logg eller ekte invitasjon. Offentlig dokumentasjon inneholder bare feltnavn, kontrollresultater og syntetiske forhold.
3. Eksisterende mindreårig-/samtykkevakter er bevart. Eksport av rå egne felt finnes; anonymisering nuller øktfritekst og fjerner hele drillmålobjektet samt cyclemetadata. Numerisk 0/dose og eierfilter/idempotens er prøvd. Datakartet er oppdatert i samme pakke; øvrige eksport-/file-/foresattehull forblir åpne.

## Åpne grenser

En datofri syklusmal, automatisk progresjon, oppvarmings-/variantregler og full hendelseskalender er ikke implementert her. Komplett WANG/TN-profil-/forslags-/samling-/testdagreise, DataGolf-rett og alle Excel-beregningers kobling er egne restkrav. Anders sin vurdering av appen ved siden av valgt skisse er ikke registrert. Ingen fullføringspåstand for alle82 oppgaver.

## Avgrenset sluttgjennomgang og designoverlevering

To materialfunn ble rettet før ny fullgate: vanlig sykluslagring erstattet eksplisitt sesong/null, og faktisk Ark sendte urørte sted-/målfelt ved serieendring. En ny ekte DB-prøve med to overlappende sesonger beviser bevart null/eldre valgt sesong ved lagring og beregnet målsesong ved kopi. En faktisk komponentprøve beviser formål alene for hele serien og eksplisitt stedtømming uten andre felter. Ny skrivefri gjennomgang bekrefter begge lukket.

Den konkrete R06.3/R07.1-kontrakten ble sendt i Claude Design i rekkefølgen [Precision](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70), eksisterende [WANG Golf UI prototype](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335), [Team Norway](https://claude.ai/design/p/bc3e41fc-0386-4624-9b14-27355b64e2f7). Synlig sendt melding og pågående arbeid er bekreftet; ferdige eksportfiler og egen designkontroll av dette tillegget er ennå ikke bekreftet. Ingen nytt WANG-prosjekt opprettet. Bare felt-/handlingskontrakt og syntetiske scenarier ble sendt, ingen persondata eller rå arbeidsbok. Privat kvitteringsbilde er lagret utenfor Git.

Nettleserprøven fant i tillegg at rutenes nøkkel inkluderte valgt økt-ID. Den faktiske URL-oppdateringen kunne derfor remontere Workbench og lukke åpent redigeringsark; en desktopprøve bestod etter navigasjonsventing, mens mobil mistet detaljarket. Dette behandles som en reell feil, ikke som ferdig reise. Fem eksisterende ukeplanhandlingstester feilet fordi testdoblene ikke hadde den nye CAS/create-kontrakten; endelig samlet kontroll registreres først etter retting. De fire øvrige coach/spiller×390/1440-reisene bestod på den synkroniserte pakken, men nye økt-/syklusreiser må gjentas etter siste kildeendring.

Siste kodefrys kl.06:48:04 Oslo retter begge ruters nøkkel ved å beholde spiller/flate/uke/år/måned/periode/nivå og utelate valgt økt-ID. Ukeverksted synkroniserer bekreftet nytt valg og tilbake/frem uten å miste åpne ark ved samme økt. 14 faktiske samlekomponentprøver bestod, inkludert begge ruters nøkkel og mobilvalg→detaljer→redigering→serverbekreftelse. De gamle ukeplantestdoblene støtter nå create/unik nøkkel/CAS og snapshot;11 handlingstester samt10 relevante skjemaprøver består, med avvist stale/tom-konflikt og bevart futureJSON. Ingen produktvakt ble svekket. Ny fullgate er startet etter denne frysen. QA-kopien er igjen avstemt med3636 ikke-genererte src-filers SHA-256 og samme genererte Prisma-klient.

## Samlet lokal sluttkontroll

Endelig kilde etter kl.06:48:04:4189 kildeprøver og94 faktiske komponentprøver bestod. Mobil390 px: alle tre nye/eksisterende spiller-/coachreiser bestod. Desktop1440 px: alle tre bestod i separat oppvarmet kjøring. Første desktopstart fikk ERR_CONNECTION_REFUSED før appen var klar, og første coachnavigasjon gikk tilbake til uke; sistnevnte lot seg ikke gjenskape i oppvarmet kjøring. Ingen forventning ble svekket. Begge nye økt-/syklusreiser bekrefter faktisk oppretting, endring, lagring, reload, kopiering og bevaring av null/0. Skjermbilder er sett på begge bredder; ingen horisontal overflyt eller sidefeil i de beståtte reisene. Dette er ikke Anders sin visuelle godkjenning eller full tema-/tilstandskontroll.

`npm run verify` fullført med exit0 kl.06:56 Oslo: statiske kontroller,4189 kildeprøver,94 komponentprøver, Next-produksjonsbygg og Serwist bestod. CI og faktisk produksjon for denne nye pakken er ennå ikke bekreftet.

Skrivefri kontroll fant ingen konkret automatisk uke-tilbakeføring i de berørte rutene; URL endres til uke bare ved eksplisitt øktvalg. Flate forblir i nøkkelen. Kald coachfeil har uavklart årsak uten navigasjonsspor; oppvarmet kontroll bestod uten produkt- eller testendring. Prosjektstruktur og lokale Markdown-lenker i178 vedlikeholdte dokumenter bestod etter dokumentoppdateringen. Målrettet hemmelighetskontroll av48 endrede filer fant ingen nøkler.

## Bekreftet publisering ved fortsettelse09:18

PR1094 head18e4b5a48fda271efb2da4f25ee4140b40728a60 er merget til f9f328bef21da49217fe68713519c058a5c9efda. CI36966904236 bestod4189 kildeprøver og94 komponentprøver samt bygg. Produksjonsdeploy6801885972 er bekreftet success02.10.2026 kl.07:21 Oslo på eksakt merge-SHA. Den nye fortsettelsesgrenen baseres på maina9a27dd07; øvrige restkrav beholdes åpne.

Ved faktisk Claude Design-kontroll09:17 var uke-/syklustillegget stoppet av bruksgrense, uten nye designfiler. Den sendte kontrakten skal derfor ikke omtales som tegnet eller visuelt godkjent. Ingen abonnementendring eller kjøp er utført.
