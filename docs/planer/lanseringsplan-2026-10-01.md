# Lanseringsplan for AK Golf HQ

Bestilt av Anders 01.10.2026. Kontrollgrunnlag: GitHub/main `3d8818238`, lokal Git-kartlegging og direkte avlesning av prosjektøktene ca. kl. 16.10–16.36 norsk tid. Dette er en datert plan; aktive økter kan ha kommet videre etter avlesningen.

**Prosjektet er ikke klart for åpen lansering.** Treningskjernen har nå dokumenterte, sammenhengende lokale prøver, men drift, betaling, personvern, øvrige brukerreiser og valgt skjermdesign har åpne kontrollpunkter. Antall filer, grønne enhetstester eller ferdige prototyper er ikke en ferdigprosent.

Planen oppdaterer rekkefølgen i [fullføringsplanen](codex-fullforing-claude-design-2026-09-30.md). [Produktreglene](../platform/BUSINESS-RULES.md), [beslutningene](../../.claude/rules/beslutninger.md), [treningsplanleggingen](../treningsplanlegging.md) og [designautoriteten](../design-system/design-autoritet.md) beholder sin myndighet. Claude Design eier designet, Codex appkode og tester, Anders produktvalg og lanseringsbeslutning. WANG og Team Norway beholder egne designprofiler. Ingen funksjonsfamilie er tatt ut av omfanget.

## Hva som er ryddet og kan samles

- Lokal main var ni commits bak GitHub og er oppdatert. De to eksisterende endringene i `.claude/commands/pr.md` og `.claude/settings.json` er bevart byte for byte.
- [PR #1005](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1005) er sammenslått: WANG-fellessiden leser nå navigasjonslisten fra en delt modul, slik at serveren slipper å lese en verdi fra en nettlesermodul. Tre filer, ingen endring i design, data, skjema eller tilgang. Eksakt PR-versjon hadde grønn full CI; diff og sammenslåing mot main ble kontrollert.
- Lokale grenpekere `codex/design-konsolidering-2026-09-30` og `codex/lokal-brukertest-2026-10-01` er slettet. Begge pekte på `c8e97c66b`, som allerede finnes i main. Ekstra gjenopprettingspekere finnes under `refs/archive/cleanup-2026-10-01/`.
- Ingen økter, oppgaver, midlertidig lagrede endringer (stash) eller andres arbeidskopier er slettet. Den lokale brukertestkopien har samme sporede filinnhold som main før #1005, men inneholder privat testoppsett og kontrollfiler. Den beholdes som testressurs.
- De 48 opprinnelige åpne PR-ene er kartlagt. Etter #1005 gjenstår 47 av disse. Redis-økten opprettet samtidig et nytt utkast, #1065. Full tabell og konkrete stoppunkter finnes i [oppryddingsrapporten](../design-audit/main-worktrees-lansering-2026-10-01.md).

**Neste sammenslåinger:** Redis når drift og tester er bekreftet, deretter de tre aktive kjerneoppgavene etter kontroll av overlapp. Skjerm-PR-er kobles til den faktisk valgte designleveransen før sammenslåing. #1010 berører databaseskjema; #1004 har konflikt og mangler visuell gjennomgang; #1060 bygger på #1004 og har rød kontroll. Disse er egne leveranser, ikke automatisk opprydding.

## Aktive økter og ansvar

Titlene nedenfor er lest direkte fra Codex. Ingen ny bestilling er sendt til dem fra denne oppgaven.

| Økt | Arbeid ved avlesning | Ferdigbevis som skal hentes |
|---|---|---|
| «Klargjør Precision Athletics for Gro» | AG10-prototypereisen rapporteres nå grønn med 22/0 og relevante regresjoner 70/0, 34/0, 19/0 og 32/0. Eksporterer for uavhengig kildekontroll; samlet designoverlevering gjenstår | Versjonert eksport, knapp-/skjermkart, rettede feil og valgte skjermreferanser. Prototypekontroll føres separat fra appkontroll |
| «Kjør denne prompten» | Ny Redis-kobling via `REDIS_URL` er prøvd med appens klient og svarer korrekt. Retter felles konfigurasjon for fire lesere. Målrettede tester/prosjektkontroll grønne; full kontroll før preview/produksjon pågår i #1065 | Full kodekontroll og faktisk driftskontroll med riktig variabel-/klientkobling; fungerende gjenforsøk etter avbrudd |
| «Samle etterlevelse på tvers av roller» | Sammenhengende test gir samme 50 % hos åtte lesere med alle tre øktmodeller. Type- og komponentkontroll grønne; retter to filhoder etter stopp i samlet kontroll | Samme tall for samme spiller hos spiller, coach, forelder, stall, rapport og motor; 28-dagersgrenser og duplikater prøvd; full kontroll bestått |
| «Koble teknisk og FYS til resultater» | Resultatlagring bevarer nå øvelse-ID, kilde, revisjon og måleenhet ifølge økten. Prøver korrigering nedover, samtidige kall, fremmed eier og fullført økt mot lokal database i ny Developer-kopi | Kilde-ID/revisjon, mengde, dose og resultat beholdes; ny innlasting og gjentatte lagringer gir korrekt telling; full kontroll bestått |
| «Verifiser gruppeflyt fra plan til analyse» | Lokale prøver bekrefter mottakerutvalg, faste identiteter og historievern. Retter testoppsett og varig fravalg, slik at en slettet gruppekopi ikke kommer tilbake ved neste publisering | Riktige medlemmer får én økt; utenforstående avvises; gjennomført historikk beholdes. Eventuelle endrede tilgangsregler må være konkret autorisert |

«Planlegg Codex’ kodeansvar» startet de tre siste oppgavene. Siste avlesning viser at koordinatorchatten deretter ble arkivert i sin egen økt; denne oppryddingen har ikke arkivert eller slettet den. De tre oppgavene er kontrollert direkte, også da de ikke kom med i sidepanelets samlede liste.

## Det vi allerede har bevis for

| Leveranse | Dokumentert bevis | Avgrensning |
|---|---|---|
| Innlogging, roller og lokale treningsreiser, PR #1062/#1064 | 26 nettleserprøver på 390/1440 px, 14 lagringsprøver, 20 miljøkontroller; full lokal kontroll med 3 876 enhetsprøver + 14 komponentprøver | Egen syntetisk database. Nettleserprøven åpner briefen med kjent økt-ID; alle kortknapper er ikke bevist mot ferdig design |
| Publisering → spiller → Live → oppsummering/analyse | Samme Workbench-ID, faktisk slagtelling, skjult utkast, tilbaketrekking og avvist fremmed eier prøvd | FYS, teknisk resultat, gruppe, offline og detaljanalyse gjenstår |
| Eksportfeil, betalingskøfeil, øktstatus, SG-lesing og Oslo-tid, PR #1063 | Fem avgrensede rettinger og 58 nye feiltester. [Kodebaserevisjonen](../design-audit/kodebase-audit-2026-10-01.md) skiller rettet fra åpent | Eksportens omfang og varig betalingsbehandling er fortsatt åpne |
| GitHub CI på main før denne oppryddingen | [Full CI på 89b757464](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36873500550) bestått | CI kjører ikke de innloggede lokale nettleserreisene |
| GitHub CI etter WANG-rettingen | [Full CI på 3d8818238](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36875104252) bestått | Bekrefter hovedgrenens kodekontroll etter sammenslåingen; egen produksjonstest er et annet kontrollpunkt |
| Produksjonstest på samme hovedgren | [222 bestått, 6 feilet, 72 utelatt](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36873500557) | Feilene gjelder tre innloggingsforventninger i Chromium og WebKit. Avklar faktisk skjermfeil mot foreldet test; ikke fjern krav for å få grønt |
| Produksjonstest etter WANG-rettingen | [Samme resultat: 222/6/72](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36875104233) | Kodekontroll og produksjonsreiser er fortsatt ulike kontrollpunkter |

Tallene over er kildeavlest tidligere kontroll, ikke nye funksjonsprøver utført i planleggingsøkten. Ny lokal kvalitetskontroll av planleveransen og main-grunnlaget registreres i oppryddingsrapporten.

## Rekkefølge fram til lansering

P0 betyr at punktet sperrer åpen lansering. P1 må også fullføres for avklart produktomfang før lansering, men kommer etter kjerne og risiko. «Ufordelt» betyr at oppgaven ikke har en verifisert aktiv eier; planen oppretter ikke nye økter.

| ID / prioritet | Arbeid og nåstatus | Eier og avhengighet | Målbart ferdigkriterium |
|---|---|---|---|
| L01 / P0 | Stabil drift: Redis, feil i produksjonstesten og reproduserbar publisering. [Manuell deploy-jobb feilet](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36869358488); tidligere CLI-publisering er separat bevis | Redis: aktiv økt. Tester/publiseringsoppskrift: ufordelt. Kan gjøres før design | Redis virker etter feil/gjenforsøk. Kjerneinnganger virker i begge nettlesere. Manglende deploy-oppsett er rettet eller erstattet av en dokumentert og prøvd publiseringsvei. Versjon og tilbakeføring kan verifiseres |
| L02 / P0 | Samle etterlevelse, teknisk/FYS og gruppeflyt | De tre aktive kodeøktene. Samordnes etter L01 uten å overskrive hverandres endringer | Alle tre deler består egne prøver og én samlet trener → spiller → Live → analyse-reise på nyeste main. Samme eier, ID, kilde og faktiske tall hele veien |
| L03 / P0 | Fullfør treningsmotorens øvrige grener: år/periode/måned/uke, kopi/serie/flytting, teknisk revisjon, FYS, turnering, samtidige endringer og offline/gjenopptakelse | Codex, foreløpig ufordelt utover L02. Bygger på L02 og vedtatte regler | Ingen tap, dobbelttelling, falsk lagring eller stille overskriving i kontrollerte feilforløp; publisert versjon og historikk bevares |
| L04 / P0 | Lås og bygg valgte designreiser. Ta inn nyttig arbeid fra de eksisterende skjerm-PR-ene etter forskjellskontroll mot ny eksport | Aktiv designøkt → Codex → Anders. Kan leveres reisevis parallelt med L02–03 | Navngitt designversjon per reise; alle knapper koblet til virkelige handlinger. App og referanse vist side om side på 390 px og desktop, avtalte temaer og tom/lastende/feil/fullført. Anders' vurdering registrert |
| L05 / P0 | Booking, kalender, klippekort, abonnement og betaling. Undersøk gjest → konto-kobling og betalingskvitteringer; #1010 har skjemaavhengighet | Codex, ufordelt. Eksisterende regler først; konkret skjema-/produksjonsendring krever separat bestilling | Ledig tid → reservasjon → betaling/klipp → bekreftelse → endring/avbestilling gir riktig saldo og status. To samtidige kall, gjentatte og omvendt ordnede hendelser, prosessavbrudd og gjenforsøk prøvd i testmodus. Ingen betaling må se ferdig ut uten å være behandlet |
| L06 / P0 | Konto og personvern: Google/OTP/gjenoppretting, foresattgodkjenning, deling/tilbaketrekking, eksportomfang og sletting i alle berørte lagre | Codex, ufordelt. Bruk oppdatert kode og datakart; eldre gaplister er ikke fasit | Egne/andres data prøvd på serveren; barn stopper fram til gyldig samtykke; eksport inkluderer dokumentert omfang og varsler feil; sletting/gjenforsøk prøvd uten tap av lovpålagt historikk. Alle tilbudte innloggingsvalg virker |
| L07 / P1 | Resten av PlayerHQ: runder/slag, tester, SG, TrackMan, mål, turneringsresultater, gameplan, utfordringer/venner og Meg | Codex, ufordelt; L02 og valgte skjermer fra L04 | Hver registrering kan spores til analyse med korrekt brutto score, enhet og kilde. Dobbelimport, tomme/mangelfulle data, redigering og sletting prøvd |
| L08 / P1 | AgencyOS/AgenticOS: stall, Spiller 360, oppfølging, meldinger/varsler, kalender, maler/tester, økonomi, drift/oppsett og AI | Codex, ufordelt; L02/L05/L06 og valgt design | Coach ser riktig omfang. AI-forslag krever gyldig godkjenning og utføres én gang; utdatert kilde avvises. Meldinger og lenkemål treffer riktig mottaker. Økonomidata hentes fra faktiske godkjente kilder |
| L09 / P1 | Forelder, GFGK, WANG og Team Norway. Én spillerprofil/IUP/testkilde, kontrollert deling og riktige ansattroller. Behandle #1004 → #1060 som avhengig kjede | Codex, ufordelt; L02/L06. Egne designprofiler og konkrete tilgangs-/skjemavalg | Hele organisasjonsreisen virker med separate syntetiske medlemskap. Spillerens IUP i PlayerHQ må virke før WANG-innstramming. Ingen innsyn i andre grupper eller i helse/coachnotater via ekstern deling |
| L10 / P1 | Filer og integrasjoner: Storage/video/lyd, kalender, e-post, varsler, resultatimport og personlige/interne flater med separat ME-database. Offentlig nettsted/bookinginngang ferdigstilles mot valgt design | Codex, ufordelt; L05/L06. Markedsdesign må leveres. Leverandørtester følger konkret autorisasjon | Filtilgang, format/størrelse, utløp og feil prøvd; ikke persondata i logger/AI. Kalender/import tåler gjentakelse og feil. Offentlige lenker, innhold, metadata og aldersfilter kontrollert |
| L11 / P0 | Samlet kvalitet: innloggede obligatoriske reiser i automatisk kontroll, avhengighetsvarsler, mobil/tastatur/kontrast, ytelse, backup og gjenoppretting | Codex, ufordelt; bygges underveis, avsluttes etter L02–10 | Full verify og relevante reiser på samme kodeversjon; ingen utelatte kritiske tester. Eksponering bak sikkerhetsvarsler undersøkt og håndtert. Ingen kritiske åpne feil. Gjenoppretting prøvd i separat miljø |
| L12 / P0 | Pilot → konkret lanseringspakke → lanseringsbeslutning | Anders + Codex; L01–11 | Pilotaktivering og foresattflyt virker. Trener, spiller og forelder fullfører avtalte reiser. Lanseringsversjon, konfigurasjon, datasteg, driftsansvar, overvåking og tilbakeføring er dokumentert. Anders bestiller publisering; faktisk produksjonskontroll følger etterpå |

## Praktisk samordning

1. Fullfør eksisterende fem arbeidsstrømmer. Ingen ny etterlevelses-, FYS-, gruppe- eller designoppgave skal startes ved siden av dem.
2. Neste ledige kodekapasitet tar først L01s røde innloggingsprøver, deretter L05 betaling/booking og L06 personvern. Disse er de viktigste hullene uten en bekreftet aktiv eier.
3. De tre kjernegrenene kan berøre felles øktlesere og analyse. Før hver sammenslåing: hent ny main, les overlapping, bevar begge rettinger og kjør samlet reise. En tidligere grønn gren er ikke bevis for kombinasjonen.
4. Oppdater hvert punkt med kodeversjon, designversjon, testbevis, åpne feil og ansvarlig. Bruk [eksisterende reiseregister](design-lagring-brukerreiser-2026-10-01.md) og kildekart; ikke lag konkurrerende produktregler.
5. Behold brukertestriggen til andre arbeidskopier har prøvd samme oppskrift. Fjern en arbeidskopi først når endringer er integrert, eieren er ferdig og ignorerte/private ressurser er ivaretatt. Oppgavechatten skal fortsatt beholdes.

Kritisk rekkefølge: fungerende driftsgrunnlag → sammenhengende trenings-, betalings- og personvernreiser → valgt design koblet til appen → samlet kontroll → pilot → lanseringsvedtak. Design og backend kan gå samtidig; endelig dato settes når de åpne P0-punktene har kjent omfang. Ingen ubegrunnet dato eller ferdigprosent oppgis.

Første avgrensede testjobb er allerede lokalisert: de tre røde innloggingsprøvene forventer passordfelt/glemt-passord-lenke i startvisningen, mens `LoginView` viser dem etter «Logg inn med passord». Prøv og kontroller denne overgangen i begge nettlesere; behold kravene om fungerende innlogging og gjenoppretting. Ingen test er endret i planarbeidet.

## Beslutninger som fortsatt må knyttes til konkret leveranse

- Godkjenn den faktiske skjermversjonen reise for reise; Precision Athletics som designsystem er allerede bestemt.
- Avklar bare dokumenterte nye skjema-/tilgangsbehov, blant annet varig betalingsbehandling (A07) og #1010. Ikke kjør historiske migrasjonsinstrukser automatisk.
- SMS er i dagens app merket utilgjengelig. Før lansering må et reelt tilbud være koblet og prøvd, eller tilbudet uttrykkelig tas ut av det avtalte lanseringsomfanget. Planen tar ikke det produktvalget.
- Redis-økten har installert integrasjonen og prøvd tilkoblingen med appens klient. Full kontroll og publisering fullføres i eierøkten; planen oppretter ingen konkurrerende integrasjon.
- Pilotkontoer er opprettet ifølge tidligere kontroll; faktisk aktivering, innlogging, avtalte coachingrettigheter og eventuelt foreldresamtykke er egne bevispunkter. Ingen invitasjoner sendes som del av planarbeidet.

## Lanseringsbeslutningen

Lansering kan anbefales når alle P0-punkter er lukket, avklart produktomfang er gjennomgått uten ukjente kritiske handlinger, og alle reiser har riktig funksjon, tilgang, lagring, feilbehandling og designbevis. Et område kan bare flyttes til senere ved en uttrykkelig omfangsbeslutning fra Anders. Godkjenning av planen er ikke automatisk godkjenning av databaseendringer, tilgangsendringer eller produksjonspublisering.
