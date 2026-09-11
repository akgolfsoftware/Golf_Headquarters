# Arbeidsliste — AK Golf HQ

Oppdatert 11.09.2026. Denne filen eier rekkefølge og gjenstående arbeid. [Status nå](STATUS-NÅ.md) oppsummerer leveransen. [Funksjonsregisteret](planer/funksjonsregister-2026-09-11.md) bevarer hele produktbredden; eldre bestillinger er samlet i [planarkivet](arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md).

## Gjeldende bestilling og design

Anders ønsker en komplett app før åpen lansering med booking og betaling. Han har bestilt videre arbeid, samling av ferdige oppgaver til main, prosjektopprydding og denne oppdaterte restlisten. En merge betyr at kode er samlet; den er ikke visuell godkjenning eller lanseringsvedtak.

Valgt byggegrunnlag: **Trainlock ZIP (4) for PlayerHQ og AgencyOS**, levert **Claw Team Norway-pakke for interne TN-skjermer**, og **designsystem/wang for WANG**. PlayerHQ/AgencyOS viderefører felles Geist/v3. Valgene skal ikke avklares på nytt for disse oppgavene. Andre designområder er fortsatt under revisjon. [Kildeidentitet og skjermstatus](design-audit/portering-fire-flater-2026-09-10.md).

## Samlet arbeid og hva kontrollene beviser

| Pakke | Resultat | Status og bevis |
|---|---|---|
| DataGolf/GolfBox og tidligere rettinger | Kode fra tidligere arbeidsgrener samlet | I main via PR #833/#834. [Grenregnskap](beslutningsgrunnlag/grener-og-main-2026-09-10.md) |
| D2 grunnlag, navigasjon, I dag, Plan, PH-04/PH-05, TN-18/WANG C7 | Første seks porteringspakker | I main via PR #835. Kode- og komponentprøver; alle skjermfamilier er ikke ferdige |
| Manuell SG | Manuell runde-/SG-registrering og dokumentert skjermarbeid | I main via PR #836. Ingen ny måling eller innlogget godkjenning er utledet av flettingen |
| Claude PH-06-testpakke | Seks enhetstester og første visuelle rigg | I main via PR #837. Den pakken endret ikke skjermen; den opprinnelige ferdigpåstanden er korrigert i [PH-06-rapporten](design-audit/playerhq-ph06-2026-09-11.md) |
| D2-PLAN | Eldre godtatte planøkter uten V2-speil kommer med i Plan/ukeprogresjon, uten dobbelttelling | Samlet i denne leveransen fra `0c060141c`. 11 målrettede kontrolltilfeller; [rapport](design-audit/plan-legacy-2026-09-11.md). Innlogget reise gjenstår |
| D2-PH06 / R2 | Valgt resultathierarki, lesbare lagrede notater/vurdering, ekte appskrifter, feil/venting/nytt forsøk, trygg feltskriving | Bygget og komponentprøvd i denne leveransen. Fem nye handlingstester, 64 skjermvarianter, interaktive feilprøver og isolert PostgreSQL-prøve. [Rapport og begrensninger](design-audit/playerhq-ph06-2026-09-11.md) |
| Produktplan/intervju | Funksjonsregister, funksjonskort og intervjuguide bevart fra separat gren | Dokumentene er integrert som arbeidsunderlag. Intervjuet og de foreslåtte produktbeslutningene er ikke erklært ferdige |
| Prosjektopprydding | Ferdige grener/arbeidskopier avstemt, gjeldende innganger og register oppdatert | [Samlingsrapport](vedlikehold/samling-og-opprydding-2026-09-11.md). Historiske sikkerhetskopier og originaldesign bevares |

Siste samlede testresultat og flettepunkt skal leses i samlingsrapporten og tilhørende GitHub PR. Innlogget produksjonsreise, faktisk betaling og Anders' visuelle vurdering er egne kontroller som fortsatt gjenstår.

## Neste oppgaver, i rekkefølge

| Prioritet / ID | Konkret neste leveranse | Inngang | Ferdig når |
|---|---|---|---|
| 1 · R-E / R1–R3 | **Delvis — komponentprøvd, IKKE innlogget prøvd.** `canAccessPlayer` (den delte eierskaps-primitiven bak alle tre øktmodellenes tilgang) fikk 6 nye enhetstester, mutasjonstestet. Full logget inn Playwright-reise er BLOKKERT (ingen kjørende lokal Postgres/Supabase i denne økten) — se [kontrollrapport](beslutningsgrunnlag/2026-09-11-fem-pakker-kontroll.md) | `tests/e2e/`, `src/lib/portal-live/`, `src/lib/portal/`, `src/lib/auth/own-or-coached.ts` | **Gjenstår:** samme økt/tall gjennom en FAKTISK innlogget reise, gjenåpning, ingen dubletter mellom modellene — krever provisjonert test-DB |
| 2 · R-A/R-B | **Komponentprøvd.** Eierskapssjekk lagt til i alle direkte ID-oppslag (read + write). Navn/e-post pseudonymisert/fjernet ved tool-grensen; ekte navn skrives tilbake KUN i det som persisteres, etter Anthropic-kallet. 15 tester, mutasjonstestet 2 steder | `src/lib/caddie/tools/read.ts`, `src/lib/caddie/tools/write.ts`, `src/app/api/caddie/chat/route.ts`, `src/lib/ai/anonymiser.ts`, `src/lib/caddie/tools/minimering.ts` (ny) | Ferdig for det som var kontrollerbart uten DB. IDOR var IKKE en bekreftet ordinær coach-lekkasje (hele inngangen er ADMIN-gated i dag) — presisert, ikke overdrevet |
| 3 · R-C | **Komponentprøvd.** Offline-kø-rader (tapper, live-drill) stemples nå med eier-userId; portal-wide auto-flush filtrerer til kun innlogget brukers rader — stale rader fra forrige bruker på delt enhet flushes/sendes aldri. 8 tester, mutasjonstestet | `src/app/sw.ts`, `src/lib/offline-queue/` | `recording-chunk-queue` er IKKE brukerstemplet (smalere overflate, egen skjerm). Ingen tidsstyrt sletting innført — åpent spørsmål, produktreglene oppgir ingen frist |
| 4 · R-D | **Ferdig, komponentprøvd.** Enhet er nå eksplisitt (aldri gjettet fra tallstørrelse); to bekreftede regresjoner rettet (CSV 70 m/s, CSV 330 m) + en tredje funnet og rettet i AI-bildeavlesningen (wedge <60 mph feilkonvertert). Manglende carry i HTML-rapport settes til `null`, aldri = total | `src/lib/trackman/canonical.ts` | 15 tester dekker mph/m/s og yards/meter eksplisitt, mutasjonstestet |
| 5 · R-H | **Ferdig, komponentprøvd.** `Promise.allSettled` + ny `TilgangDriftsfeil` skiller driftsfeil fra ekte manglende abonnement; fail-closed bevart, et bekreftet FULL-signal overlever en annen feilet spørring | `src/lib/auth/getCurrentUser.ts`, `src/lib/feature-flags.ts` | 5 tester (timeout, kastet feil, retry, sterkt signal), mutasjonstestet |
| 6 · D2-AO | Port AgencyOS-hjem → spillerliste → spillerkort → plan/tildeling → oppfølging fra valgt Trainlock | `src/components/admin/`, `src/components/workbench/`, valgte AX/AO-kilder | Mobil/desktop og temaer stemmer; reelle handlinger, tomt/feil/lagring og tilgang er prøvd |
| 7 · D2-TN | Fullfør Team Norway-skall/oversikt → testføring → resultat/historikk → dokumenter/poster | `src/app/team-norway/`, `src/components/team-norway/`, valgt TN-pakke | Samme testvariant og resultat gjennom reisen, korrekt spiller-/coach-/organisasjonsinnsyn og ærlig manglende data |
| 8 · D2-WANG | Fullfør WANG-hjem → skole-/treningsuke → økt → elev/gruppe → rapport | `src/app/wang/`, WANG-komponenter og `designsystem/wang/` | Innlogging og skole-/gruppeavgrensning virker; ingen demonstrasjonsdata fremstilles som faktiske elevdata |

R-A–R-J og REV-F1–F11 er forklart i [produktplanen](planer/produktplan-og-intervju-2026-09-11.md). Funn fra den eldre gjennomgangen må kontrolleres mot dagens kode før endring. R-G «neste økt» er allerede rettet i porteringen og skal verifiseres i prioritet 1, ikke bygges på nytt.

## Resterende oppgaver etter neste pakker

| Område / ID | Konkret restarbeid | Avhengighet / ferdigkriterium |
|---|---|---|
| PlayerHQ · D2-PH | Resterende Analyse, mål, kalender, øvelsesbank/program, profil, meldinger, deling, test/retest og sosiale reiser | Knytt hver skjerm til valgt kilde og appdata. Fullfør relevante tom-/laste-/feiltilstander. [Funksjonene P01–P11](planer/funksjonsregister-2026-09-11.md) |
| Plan/Live | Full ny/rediger/flytt-reise, FYS-standardverdier/detaljgjenoppretting, Caddie i live, frekvensmål på tvers av øktmodeller | Separate modeller beholdes. Ingen dubletter, gjenopplivede avlyste økter eller oppfunnet målt treningstid |
| Mål · R-F / F1 | Startverdi, periode og faktisk gjennomføring; TN-mål med variant, antall, enhet og retning | Faglige definisjoner før avhengige beregninger. Eventuelle nye databasefelt krever konkret autorisasjon |
| Team Norway-tester | Avstem testbatteriet mot Excel v3, variantbundet føring, korrigering/angre og historikk | [Fagkontroll](beslutningsgrunnlag/team-norway-excel-v3-kontroll.md). Ugyldige resultater avvises, og lagringsfeil bevarer registreringen |
| WANG/GFGK | Årsplan, juniorgrupper, testdager, styrkeprogram, rapporter og foresatte | Virkelige rollegrenser og avklarte fagregler; P08/O03 i funksjonsregisteret |
| Booking · R4/R5/R9 | Valgt bookingdesign og samlet coach/sted/tid → pris → betaling → bekreftelse → administrasjon | Bookingens designversjon må identifiseres for den konkrete byggepakken. Testnøkler og innloggede testroller trengs for betalingsreisen; ingen reell betaling er bestilt |
| Betaling/tilgang · R6/R8 | Credits, abonnement, oppsigelse/refusjon, TALENT/FULL og publisering av flere økter | Tillatte/avviste roller og hendelser i vilkårlig rekkefølge; ingen skjult delpublisering |
| Forelder/delt innsyn | Bytte mellom barn, plan/mål/booking, betaling og tilbakekalling av tilgang | Formål og rettigheter må stemme for hver rolle; samtykke og datadeling følges gjennom hele reisen |
| Runde/SG/DataGolf | Full runde-/slagreise, manuell korrigering, importkilder, datadekning og gjenåpning | Manuell SG i PR #836 er et delresultat. Sammenligningsgrunnlag, rå brutto score og kilder må være tydelige |
| Baneguide · BG-01–06 | Gameplan/kart/soner, samme slagkjede i kart og liste, GPS, offline, bag/spredning og coachvisning | Seks konkrete delpakker står i funksjonsregisteret. Avklar datakilde, bruker, offline-omfang og valgt design ved oppstart |
| Vindverktøy | Avklar treningsberegning, værkilde eller fysisk måler; bygg deretter én valgt funksjon | Ingen sensor- eller værintegrasjon er bekreftet som valgt. Usikkerhet og datakilde skal vises |
| AgenticOS/Jarvis | Innkurv, utkast, godkjenning, rutiner, oppgaver og kalender koblet til faktisk kjøring | Ingen editor-agentkopier som runtime. Utsending til andre krever gjeldende eksplisitt autorisasjon |
| Marked/salg | Nettsider, tilbud, coachprofiler, innhold og fungerende overgang til booking | Avstem bestilt omfang; ikke aktiver et historisk markedsføringssystem automatisk |
| Økonomi/personlig | Beslutningsstøtte, rapportgrunnlag og egne oppgaver | Avklar konkret behov; økonomitall kun fra autorisert Tripletex-eksport |
| Samtykke · R-J | Formål, opplysningstype, alder, rolle, deling, lagringssted og historikk | Verifiser regelgrunnlaget før tekst/tilgang endres. Ingen automatisk bytting av aldersgrense |
| Kodekontroll · R-I | Styrk tester av faktisk handlingstilgang og ressursavgrensning | En importert, men ubrukt tilgangsvakt må ikke være tilstrekkelig for grønn kontroll |
| Felles design/kvalitet | Avstem alle 479 sideruter og deres mønstre, visuell kontroll, kontrast, fokus, mobil og stor tekst | 479 ruter er inventar, ikke 479 unike ferdige design. Ingen ny kontrastbaseline for å skjule brudd |
| Drift/lansering | Produksjonens innloggings-/funksjonsvern, alarmprøve, gjenoppretting med filer og full kundereise | Konkret miljøautorisasjon for tidligere avvist funksjonssikkerhetsendring; testoppsett for betaling og varsling; dokumentert faktisk publisert versjon |
| Produktintervju | Avklar mål, prioriteringsregel og åpne produkt-/fagspørsmål med Anders | [Intervjuguide](planer/produktplan-og-intervju-2026-09-11.md). Familie-OS/eldre sideprosjekter er bevart som underlag, ikke automatisk aktivert |

## Arbeidsmåte og oppdatering

Arbeid på egen gren, bevar andres endringer, og bruk én ansvarlig oppgave per filområde. Kjør relevante tester, full `npm run verify` og `npm run prosjekt:sjekk` før commit. Anders har bestilt fletting av denne samlingen; senere oppgaver følger sin gjeldende autorisasjon. Ikke kjør migrasjoner, seed/import, reelle betalinger eller utsending som opprydding.

Marker separat: **bygget**, **komponentprøvd**, **innlogget prøvd**, **sett av Anders**, **flettet** og **publisert kontrollert**. Arkiv inneholder historiske oppgaver og målinger; dokumentert intensjon er ikke bevis på ferdig funksjon. Oppdater denne listen etter hver sammenhengende leveranse, uten en konkurrerende masterplan.
