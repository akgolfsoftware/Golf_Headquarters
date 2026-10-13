# Oppgraderingsstatus · 13.10.2026

**SATT PÅ VENT AV ANDERS:** Ingen videre designarbeid, skjermportering, ny pakkeversjon, skjerm-PR eller publisering før nytt designbrev. Påbegynt arbeid sikres som uferdig arbeidsversjon. Se [pause og åpne grener/PR-er](../planer/hq-designpause-2026-10-13.md). Statusen nedenfor er arbeidsstatus før stopp, ikke en ny kjøreordre.

Oppdatert kl. 22.28 norsk tid. Oppgraderingen er ikke publisert. En designvisning er tilgjengelig lokalt, men komplett funksjonell demo og ferdig plattform er ikke bekreftet.

## Versjon og lagring

Riktig hovedapp er Next.js-kopien på `codex/hq-complete-upgrade`. Arbeidssteget `59423acab` er lastet opp og inkluderer WANG-hovedversjon `736670954`. Nyere hovedarbeid `c87f7f76d` (sikre, syntetiske WANG-rolleprofiler) er tatt inn i en bevart, uavsluttet samordning. Ingen andres stash, elevdata eller WANG Auth er erstattet. De separate WANG Auth-/demo-/testprofilrutene overfører ikke automatisk rettigheter til HQ-innloggingen.

Siste avsluttede fulle kontroll sluttet kl. 18.43: 4 881 server-tester, 206 komponenttester, statiske kontroller, typer, lint og Next/Serwist-produksjonsbygg passerte. Den gjelder samordningen med `c87f7f76d`, før de nyeste rettingene av medieopplasting og lokal tjenesteisolasjon. Et tidligere grønt resultat er ikke sluttstatus for nyere kildekode.

## Bekreftet design

- Spiller, coach, WANG og Team Norway er samordnet etter den valgte Precision-/NTC-retningen. WANG og Team Norway beholder egne fonter, farger og rammer. I dag, mørk Live, Cockpit, Spiller 360, grupper, IUP, planhorisonter og støtteflater har navngitte kodekoblinger.
- [Alle 198 innganger](hq-198-innganger-2026-10-13.json) er koblet til eksisterende kode. Registeret påstår ikke 198 visuelt godkjente skjermer.
- Fem ferske visuelle funn er rettet og lukket av samme uavhengige vurderer. [Sluttvurderingen](sluttvurdering-2026-10-13.md) dekker 45 syntetiske fangster på 390, 1440 og 1882 px. Dommen gjelder de undersøkte rettingene, ikke hele plattformen.
- Den samlede designvisningen er åpen på denne enheten ved `http://127.0.0.1:3320/`. Den viser bilder fra faktisk komponentkode med syntetiske data. Den er en lesende designoversikt, ikke en app med lagringshandlinger. Team Norway-bildene viser gruppeoppfølging, ikke hele landslagsoversikten.
- DESIGN.md og .impeccable/design.json beskriver faktisk bygget system. Ingen bildepakke er lastet opp som offentlig spillerdata; private fangster er utelatt fra Git og Vercel-kilden.

## Faktiske lokale funksjonsprøver

Prøvene bruker bare den separate, lokale Supabase-stacken med egne syntetiske kontoer og appens virkelige tilgangsvakter. Ingen ekte e-post, betaling, invitasjon eller ekstern AI-tjeneste er brukt. HTTP-/serverhandlingsprøver dokumenterer lagring og tilgang; de er ikke tastatur-, telefon- eller nettleserprøver.

- 19 av 19 svar-/tilgangsprøver: tillatt WANG-/TN-innsyn, foresatt/spiller og avvisning av utenforstående. Ingen persondata vises ved avvisning.
- 38 av 38 organisasjonsprøver: WANG IUP-vurdering lagres, neste periode endres først når spilleren godtar, lagringsretry lager ett forslag; begge organisasjoners egne månedsplaner, coachforslag, spilleraksept, gruppeplan med spillerens lesetilgang, avsluttet måneds evaluering og godkjente øktforslag er bekreftet mot faktiske databaserader.
- 10 av 10 gruppeoppgaveprøver: egen coach tilpasser individuell oppgave, gruppetid og kildeøkt beholdes, fremmed coach/gammel versjon/fullført oppgave avvises. Testavlesningens tidssone ble rettet til UTC; appens versjonsvakt ble ikke svekket.
- 20 av 20 medieprøver: spillerens private MOV-video lagres byteidentisk, faktisk Live-kobling og retry gir én rad; falskt videoinnhold avvises. Coachens samtykkede lydstart, eiergrense, rekkefølge, manglende del, retry, fullføringskvittering og byteidentisk lydfil er prøvd. Ekstern AI er bekreftet avstengt i testmiljøet.
- Store, eldre lydbiter er nå sendt som små fragmenter med opprinnelig indeks og helkvittering. Faktisk lokal 7 MiB-transport bevarer alle bytes; originalkøen fjernes ikke etter bare en delkvittering. Dette er en transportprøve, ikke en lydavspillings- eller mikrofonprøve.

Private bevis ligger i ignorert `tmp/upgrade/local/*-results.json` og `tmp/upgrade/logs/`. Ingen private innloggingsverdier eller signerte filadresser skal inn i dokumentasjon eller Git.

## Åpne funn og ferdigkrav

1. Coachens tomme videogalleri er erstattet med faktisk avgrenset videoopplasting, liste, signert avspilling og bekreftet sletting. Fem direkte opplastings-/READY-prøver og seks innsyns-/sletteprøver bestod lokalt. Opptaksinngangen bruker eksisterende samtykkekontrollert coaching-lyd. To-kamerastudioet er fortsatt uttrykkelig frakoblet og er ikke påstått levert. Tolv nye breddeprøver bestod; tre visuelle funn er rettet i én batch og scoret resolved av samme vurderer, med avgrenset ship-dom.
2. Lydfragmenters opprydding ved gjeldende lagringsfrist er rettet. Åtte målrettede tester og fem faktiske lokale lager-/bevaringsprøver bestod; bare lydfiler og lydhenvisninger fjernes. Transkript og analyse bevares. Den samlede mediekontrollen bestod 62 tester; fullkontrollen må fortsatt kjøres på siste versjon.
3. Kjør full sluttkontroll etter siste kilde- og dokumentendring. Deretter sikre samordningen, laste opp, opprette samlet endring og kontrollere CI for samme versjon.
4. Fullføre faktisk gjennomgående nettleserreise, relevante nettfeil, tastatur, zoom og skjermleser. Tidligere lokale browserprøver dekker deler av spillerreisen, ikke alle org-funksjoner. En nettlesernavigasjon ble avvist av verktøyets URL-policy; den er ikke omgått. Den etterspurte manuelle åpningen av WANG-siden er ennå ikke bekreftet.
5. Anders' samlede visuelle vurdering og avtalt fysisk telefonprøve er fortsatt ubekreftet. Breddeprøver med 390 px er ikke fysisk telefonbevis.
6. Produksjonens nye månedsplantabell mangler fortsatt ved nyeste lesekontroll. Riktig Supabase-prosjekt er bekreftet. Coaching-videoenes private bucket har 500 MiB-grense og riktige MIME-typer; spillerens bucket har 50 MiB. Prosjektets globale opplastingsgrense og stor faktisk nettfil er ikke prøvd.
7. Minimal godkjent produksjonskonfigurasjon, nettversjon for telefonprøve, innlegging i hovedversjonen og bekreftet Vercel-publisering gjenstår. Ingen PR, CI eller produksjonsleveranse er påstått for de nyeste rettingene.

Det opprinnelige publiseringsmålet kl. 21.30 er passert. Reserve til kl. 23.00 er et arbeidsmål, ikke et løfte eller grunn til å kalle uverifisert arbeid grønt. Anders har uttrykkelig godkjent videre arbeid i samme økt og over midnatt.

Kilder: [godkjent dagsplan](../planer/hq-fullforing-2026-10-13.md), [retning og krav](retning-og-kvalitetskrav-2026-10-12.md), [org-dekning](org-ferdigstilling-2026-10-13.md), [PH/AG-dekning](../planer/hq-ph-ag-dekning.md).
