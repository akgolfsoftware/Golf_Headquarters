# WANG/TN/PlayerHQ — leveransekontroll 02.10.2026

Kontrollgrunnlag: hovedplanen, de to lokale originalfilene, HQ main `226acab39`, inkludert merget trenerliste #1090 og Workbench #1091. Denne kontrollen er ikke en ferdigattest. Den samlede leveransen er **ikke kundeklar**.

## Faktisk resultat

| Del | Bevis | Grense |
|---|---|---|
| Originalspørsmål | 2025: 154 utviklingsspørsmål; 2027: 162. Begge: 13 sesongspørsmål. `scripts/check-iup-original.py` sjekker originalens hash, celle, kategori, ordlyd og skala. | Alle 18 ark, 1 692 formler, 25 diagrammer, én pivottabell og kjente avvik er inventert i [felt- og beregningsregisteret](iup-2027-felt-og-beregningsregister-2026-10-02.md). Det beviser ikke felt-til-kode-paritet. |
| Spillerens utfylling | PR #1084. Faktisk lokal innlogging, lagre, gjenåpne, levere, revisjoner og feilprøver. | Fireukersfrister, påminnelser og full sesongorkestrering gjenstår. |
| Lagring og historikk | PR #1080. Eiergrense, kildevalidering, samtidighet, gjenforsøk, eksport og anonymisering. | Ikke en ny lagringsmodell for hele IUP-arbeidsboken. |
| Navngitt deling | PR #1087 og #1089. Foresatt for å gi under 16; barnet kan trekke. Riktig bekreftet treneradresse og aktiv tilknytning; WANG→TN uten TN-medlemskap. | Skoleavtalen for obligatorisk WANG-testdeling er et separat, uferdig spor. |
| Trenerleser | PR #1089 gir trygg lesing; PR #1104 (`63242f9e3`) monterer siste kildevaliderte leverte svar i WANG-IUP og TN-02 under eksisterende navngitte tilgangsporter. Utkast skjules. | Full dekning av alle Excel-felt, profilens øvrige avtalte innhold og visuell godkjenning gjenstår. |
| Trenerliste | PR #1090. 20 databaseprøver, 53 komponentprøver i fullkontrollen, syntetisk faktisk innlogging og liste→besvarelse. | Merget etter grønn CI og deploy. Ikke en komplett skole-/landslagsoversikt. |
| Eldre WANG/TN-lesere | PR #1096 (`c8a44556a`). 24 syntetiske databaseprøver og 24 innloggede rutekontroller; fersk GitHub CI og Vercel bestod. | Navngitt deling er koblet til de beskrevne eldre personlige leserne, inkludert lister, analyse, poster, lesekvitteringer og vedlegg. Dette beviser ikke full Excel-dekning, skolebasert testdeling eller visuell godkjenning. |
| Samlingsprogram og invitasjon | PR #1099. WANG/TN-trener publiserer for valgt gruppe; spilleren får privat invitasjon, ser kalenderkollisjoner og kan legge økter med øvelser i egen Workbench-kalender. Full CI: 4 328 enhets- og 101 komponenttester; Vercel Preview bestod. | Rom- og pakkeliste er utenfor omfanget. Visuell sluttgodkjenning fra Anders er ikke registrert. |
| DataGolf | Tre Claude Design-prosjekter med DG01–17. 135/135 feltidentiteter mot lokalt pipelines-skjema. Feltutforsker målt 390/1440. | Design, ikke produksjonsintegrasjon. Ingen kundelisens dokumentert eller aktivert. |
| IUP-feltregister | PR #1107 (`7413ce739`) er merget. Originalarbeidsbøkene er inventert uten å lagre elevsvar: 18 ark, 1 692 formler, 25 diagrammer, pivottabell og pakkemedier. 2025/2027-spørsmål kontrolleres mot kildehash, celle og ordlyd. | Dette er kildeinventar, ikke felt-for-felt-paritet eller formelverifisering i PlayerHQ. |
| Godkjenning av IUP-fokus | PR #1109 (`49dcc5459`) er merget. WANG-trenerens periodevurdering skilles fra forslag til neste periodes fokus; spilleren må godkjenne før årsplanen endres. Lokal fullkontroll bestod med 4 183 kodeprøver, 101 komponentprøver og produksjonsbygg. Fersk PR-CI, Vercel Preview og produksjonsrøyktest (236/236) bestod. | Main-CI kjørte fortsatt ved siste kontroll. Visuell sluttkontroll og bredere Excel-paritet gjenstår. |

## Alle 18 Excel-ark — gjenværende kontroll

«Delvis» betyr at byggesteiner finnes, men hele kjeden fra original til spiller og begge trenerflater ikke er bevist. Arbeid i andre grener regnes ikke som levert før merge og kontroll.

| Krav | Spiller | WANG og TN | Neste nødvendige bevis |
|---|---|---|---|
| IUP-01 Intro | Delvis | Delvis | Samlet fremdrift og veiledet reise gjennom hele IUP-en. |
| IUP-02 TN Coaches | Delvis | Delvis | Komplett spillerstyrt fagapparat, roller og kontaktfelt. |
| IUP-03 Person info | Delvis | Delvis | Feltregister, avgrenset helseinnsyn og egne/felles støttepersoner. |
| IUP-04 Evaluering spørsmål | Utfylling, lagring og levering prøvd | Leveringene vises i WANG-IUP og TN-02; kildeår beholdes | Forbedringspunkt→prosessmål og full originalarkavstemming. |
| IUP-05 Målsetting og oppfølging | Delvis | Delvis | Samtlige måltallsrader, kvartaler og historikk med samme definisjoner. |
| IUP-06 Prosessmål | Delvis | Delvis | Hele kjeden resultat→handling→prosess→måling→hjelper→evaluering. |
| IUP-07 Årsplan | Nytt sesongkart/ukeverksted fra #1091, fortsatt delvis Excel-dekning | Delvis | Samordnet WANG/TN-lesing og godkjente endringer; all ukeprioritet og oppholdssted må avstemmes. |
| IUP-08 Turneringsplan | Delvis | Delvis | WAGR Power, hull/dager, reise og nivåfordeling uten blanding av mål. |
| IUP-09 Ukeplan | Delvis | Delvis | Fire uketyper, treukerssyklus og testplassering i samme spillerreise. |
| IUP-10 Treningsøkter | Delvis | Delvis | Alle øktfelter, utstyr/antall, oppvarming og progresjon mot press. |
| IUP-11 Utviklingssjekk | Begge kilder, alle nivåer og riktig 1–5-skala | Leveringene vises i WANG-IUP og TN-02 | Samordnet fireukersoppfølging og full felt-/beregningsavstemming. |
| IUP-12 TN Tester Tot | Delvis | Delvis | Avstem merget testbatteri #1086 mot hver originalprotokoll, rådata og testdag. |
| IUP-13 Teknikktest | Delvis | Delvis | Alle målefelt, A/B, PEI og diagrammenes innhold; ikke bytt kildeversjon stilltiende. |
| IUP-14 Teknikkplan | Delvis | Delvis | Strukturert før/etter og godkjente oppgaveforslag til Workbench. |
| IUP-15 TN Fystester | Delvis / erstattede krav | Delvis | Skill originalen fra vedtatt seksårsløp; dokumenter hver erstatning. |
| IUP-16 Treningsdagbok | Delvis | Delvis | Faktisk tid, øktantall og summer uten dobbelttelling mellom øktmodeller. |
| IUP-17 Statistics | Delvis | Delvis | Hver tabell/bildereferanse med enhet, utvalg og kilde; lisensavgrensning. |
| IUP-18 Ref | Delvis | Delvis | Grenseverdier og intervaller mot originalen og valgt beregningsregel. |

Det finnes ikke grunnlag for en prosent som «100 % Excel-dekning». Et fullstendig felt-/beregningsregister for hele arbeidsboken gjenstår. Originaltro spørsmålskatalog er konkret bevis for spørsmålene, ikke for resten av arkene.

## Funksjonsmatrise for bestillingens viktigste brukerreiser

De fullstendige funksjonsfamiliene PH-01–34 og TR-01–24 står i [hovedplanen](wang-team-norway-playerhq-komplett-plan-2026-10-02.md#6-komplett-funksjonsliste-for-playerhq).

| Reise | PlayerHQ | WANG-trener | TN-trener |
|---|---|---|---|
| Opprette, lagre, levere utviklingssjekk/sesongevaluering | Funksjonstestet | Leser samme leverte grunnlag ved navngitt deling | Leser samme leverte grunnlag ved navngitt deling |
| Alle Excel-felt i samlet spillerprofil | Delvis | Delvis | Delvis |
| Gi/trekke full profildeling | Spiller-/foresattreise prøvd | IUP, turneringsprofil og eldre personlige lesere koblet (#1096) | Personlige profiler, samlelister, analyse, planinnsyn, personpost, kvitteringer og vedlegg koblet (#1096) |
| Obligatorisk testdeling fra alle WANG-skoler til TN | Avtalespor gjenstår | Ikke ferdig | Ikke ferdig |
| Treningsforslag→godta/avvis→Workbench | Spillerens innboks i PlayerHQ; godkjenning av økter anvender atomisk én gang, avvisning gir null planendring. WANG-IUP-fokusforslag godkjennes i PlayerHQ før neste periodes fokus endres; syntetiske tester, lokal fullkontroll og PR-CI bestod; PR #1109 er merget. | WANG trenerflate oppretter øktforslag under navngitt profiltilgang; IUP-samtalen oppretter fokusforslag. | TN Workbench oppretter øktforslag under navngitt profiltilgang. Visuell sluttkontroll gjenstår. |
| Samling publisert→invitasjon→kalender/Workbench | Invitasjon og spillerens Workbench-import merget (#1099) | Invitasjon og spillerens Workbench-import merget (#1099) | Visuell godkjenning og akseptanse i WANG/TN-flater; rom- og pakkeliste er ikke med. |
| Felles testdag med flere skoler/grupper | Delvis | Delvis | Delvis |
| Automatisk turneringsresultat til riktig konto | Delvis; se datakjede under | Delvis | Delvis |
| Alle pipelineprofiler | Eksisterende offentlige data skilt fra privat profil | Samlet oversikt ikke bevist | Samlet oversikt ikke bevist |
| DataGolf DG01–17 | Precision-design | Eget WANG-design | Eget TN-design |

Workbench #1091 ble merget kl.06:17:51 med grønn CI/Vercel. PR #1099 senere utvidet Workbench med samlingspublisering og private invitasjoner. [Workbench-kontrollen](../design-audit/workbench-samlet-kontroll-2026-10-02.md) dokumenterer de tidligere fire visningene; #1099 beskriver den nye invitasjonsflyten. Kodekontroll av `TrenerforslagSkjema`, spillerens `/portal`-innboks og `svarPaTrenerforslag` bekrefter forslag fra både WANG og TN. Godkjenning og planendring skjer i samme serialiserbare transaksjon; avvisning endrer ikke økten. Syntetiske tester dekker én anvendelse, idempotent gjenforsøk, samtidig versjonsendring, trukket deling og utløpt dato. Dette lukker funksjonsgapet i den nye Workbench-flyten; gammel PR #1060 er fortsatt et separat, ikke-mergeklart spor og må ikke brukes til å opprette parallell IUP-/forslagslogikk. Visuell kontroll av trener- og spillerreisen gjenstår. Nasjonal testdeling, felles testdag og full Excel-feltdekning er fortsatt åpne.

## Turneringsdata — fersk driftskontroll og konkret hull

Fersk GitHub-kontroll viste grønn [Junior Tours-kjøring 28.09](https://github.com/akgolfsoftware/ak-golf-pipelines/actions/runs/36408970127) på `1e4d1ce49`. GolfBox-steget, personkobling, nivåberegning og oppdatering av lesetabeller var alle grønne. [Nordic League-kjøringen 01.10](https://github.com/akgolfsoftware/ak-golf-pipelines/actions/runs/36849987006) var også grønn. Ingen ny synk eller produksjonsdataendring ble startet under kontrollen.

Koden viser denne veien for GolfBox: pipelines skriver `public.tournaments`, `public_player_entries` og `public_player_rounds`; `hentTurneringshistorikk` i HQ leser disse via `User.publicPlayerId`. Speiling til egne resultat-/påmeldingsmodeller ligger i `materialize-entry.ts` og etterfyllingen i `link-public-players.ts`.

PR #1101 (`e6cee1b9b`) fjernet automatisk kontokobling basert bare på normalisert navn. `linkPublicPlayersByExactName` teller nå mulige kandidater uten å skrive `User.publicPlayerId`; nye ubekreftede kandidater speiles ikke til kontoen. Eksisterende koblinger ble ikke revidert eller omskrevet. Neste identitetsarbeid er derfor å kontrollere opprinnelsen til eldre koblinger og etablere dokumentert identitetsbevis før nye koblinger; navn alene er utilstrekkelig. Grønne innhentingsjobber beviser ikke kontoeierskap.

Pipelines er fortsatt eneste innhenter av resultater. DataGolf-sperrer skal ikke åpnes for å tette denne kjeden. En skrivebeskyttet SQL-kontroll mot riktig HQ-prosjekt bekreftet deltakelser fra OLYO, SRIXON, NORGESCUP, OSTLANDS og REGIONTOUR i appens lesetabeller. Bare antall og siste oppdatering per kilde ble lest; aggregatbeviset er lagret privat. Ingen personnavn, individuelle resultatrader eller logger med spilleropplysninger er hentet fra produksjon i denne kontrollen.

## Eksisterende oppfølgingspakke må samordnes

[PR #1060](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060), head `49db54b169d298f5f8c283e69cafbb627fc29bf3`, er kontrollert som gjenbruksgrunnlag. Den har rød CI, definerer åtte utviklingsspørsmål på 1–4, lagrer sjekk per gruppe/flate og lar «godtatt» endre status uten å anvende planen i Workbench. Den er ikke merget. Videre arbeid må gjenbruke relevante skjema-/samtalekomponenter, erstatte avvikende spørsmål med den kanoniske spillereide katalogen og bruke atomisk spillerbeslutning med før/etter og revisjonskonflikt. Ikke legg en ny parallell IUP ved siden av den leverte.

## Neste gjennomføringsrekkefølge

1. Bruk [profiltilgangskontrollen](wang-tn-profiltilgang-kontroll-2026-10-02.md) som bevis for eldre WANG/TN-lesere koblet i #1096. Full IUP-feltdekning og visuell innbygging gjenstår; søke-/eksport- og testdagsreisene må fortsatt vurderes hver for seg.
2. Bevar den nye Workbench-forslagsflyten som kanonisk: spillerens godkjenning anvender én gang, avvisning anvender null, og nyere spillerendring gir konflikt. Ikke merge PR #1060 uten en eksplisitt gjennomgang mot den allerede leverte `WORKBENCH_COACH_PROPOSAL`-flyten. Kontroller begge trenerflatene visuelt.
3. Fullfør skoleavtalens separate testdeling og felles testdag. Avtale-/fagregler som mangler dokumentasjon må ikke oppfinnes.
4. Kontroller PR #1099s samlingsinvitasjon mot akseptert WANG/TN-reise og få visuell godkjenning; utvid bare manglende felt etter dokumentert behov. Rom- og pakkeliste er utenfor nåværende bestilling.
5. Fullfør identitetsbevis og automatisk turneringskjede; oppdater deretter feltregisteret med konkret PlayerHQ-lagring/-skriver, WANG/TN-leser, tilgangsgrunnlag og tester for hver aktiv feltgruppe.
6. Porter DataGolf-design først når kundebruksrett er dokumentert. Kontroller ekte datadekning mot endepunktene; 135 lokale modellfelt er ikke hele API-et.

Visuell sluttgodkjenning fra Anders gjenstår. Lokal kontroll, CI, deploy og visuell godkjenning er separate bevis.
