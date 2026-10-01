# Fullføring av AK Golf HQ — Claude Design og Codex

Dato: 30.09.2026. Bestilt av Anders i denne økten.

**Arbeidsdeling:** Claude Design eier designet. Codex eier appkode, datakoblinger, tester og teknisk kontroll. Anders eier nye produktbeslutninger, valg mellom skjermvarianter og publisering. Målet er en komplett app med sammenhengende brukerreiser og dokumentert kvalitet.

Planen viderefører [designautoriteten](../design-system/design-autoritet.md) og [produktreglene](../platform/BUSINESS-RULES.md). Den erstatter byggerekkefølgen i planene fra [24.09](prosjektplan-og-lanseringsplan-2026-09-24.md) og [25.09](plan-portering-claude-design-til-kode-2026-09-25.md). Eldre funksjonsbeskrivelser er underlag som må kontrolleres mot gjeldende beslutninger og kode. Dette er ingen ny designretning, prisbeslutning eller lanseringsdato.

## Hva vi vet, og hva som må undersøkes

- Repoets utgangspunkt i denne økten er commit `4b5535245`, på en egen `codex/`-gren. Eksisterende lokale endringer i kommando- og innstillingsfiler tilhører annet arbeid og bevares.
- «AK Golf Precision Athletics» (`7d7c2994`) styrer PlayerHQ, AgencyOS, forelder, innlogging, booking og statistikk. Team Norway og WANG beholder egne designprofiler. Markedsdesign venter ifølge designautoriteten.
- Siste prosjektminne beskriver pågående Workbench-kontroller: kalender, teknisk øktantall, lagring/publisering, skjermkontroll og komplett handlingskart. Dette er sesjonsstatus, ikke en ny kontroll av designprosjektet i denne økten.
- Samlet restmengde, dagens antall ferdige reiser og teststatus er ennå ikke målt på nytt. Tidligere prosenttall og testantall brukes ikke som bevis. Framdrift måles i kontrollerte brukerreiser.

## Ansvar og overlevering

| Ansvarlig | Leverer | Grense |
|---|---|---|
| Claude Design | Skjermer, komponenter, visuelle verdier, responsive varianter, tilstander og klikkbare flyter | Designets eksempeldata og simulert lagring er underlag for Codex |
| Codex | Fungerende app, serverlogikk, datalagring, tilgangskontroll, tester og appbilder | Bygger valgt design; sender konkrete designavvik tilbake som underlag |
| Anders | Nye produktvalg, konkret skjermvalg der det finnes alternativer, visuell vurdering og lanseringsbeslutning | Allerede bestemte valg tas ikke opp på nytt |

For hver reise må overleveringen angi designprosjekt, eksportdato, versjon og kontrollsum; skjermer/ruter og roller; komponenter og ressurser; mobil og desktop; avtalte temaer; tom, lastende, feil og fullført tilstand; samt hva hver knapp gjør og hvilke data den trenger. Bruk [overleveringsoppskriften](../../.claude/skills/ak-hq-design/references/overlevering.md).

Codex knytter pakken til en bestemt kodeversjon. Endrer Claude Design pakken under bygging, registreres endringen som en ny versjon med konkret forskjell. En gjennomgått reise kan bygges mens andre reiser fortsatt tegnes. Ingen venting på at hele designprosjektet skal være ferdig.

## Arbeid før Claude Design er ferdig

**Utføring startet 01.10.2026, brukere først:** Egen arbeidskopi `codex-funksjon-brukere`, gren `codex/funksjon-brukere-2026-10-01`, base `4b5535245`. Fire anonyme testspillere, to trenere og én foresatt er etablert i isolert lokal Supabase. 24 brukerprøver på mobil/desktop, 20 miljø-/hemmelighetskontroller og 3 727 enhets-/komponenttester består; separat appbygg består. Rollelanding og innloggingslenkens kodeveksling/retur er rettet, og falsk SMS-bekreftelse er fjernet. Samlet `verify` stopper på seks eksisterende gamle designreferanseavvik; ingen commit/push/merge/deploy er utført. Anders har deretter bestilt nye pilotkontoer. Alle fire bestilte kontoer er opprettet i den eksisterende hostede tjenesten, og koblingen mellom innlogging og spillerprofil er kontrollert for hver. Én konto har foreldresamtykkesperre; for øvrige er aldersgrunnlaget kontrollert mot privat kilde eller Anders' direkte bekreftelse. Eksakt fødselsdato er ikke oppgitt for disse to og er derfor ikke lagret. E-postaktivering gjenstår; ingen invitasjon eller betalt abonnement er opprettet. Kontaktgrunnlaget for alle fire er avklart. Persondata og opprettingsjournal ligger utenfor Git.

**Bestilt publisering 01.10.2026:** Anders har bedt om at arbeidet skal til hovedgrenen på GitHub. Arbeidskopien er samordnet med `origin/main` på `110b4ec8f`, og den samlede lokale kvalitetsporten er nå bestått med 3 829 enhets-/komponenttester og appbygg. De seks gamle referanseavvikene gjaldt den tidligere, avvikende kodeversjonen; kontrollene er beholdt. Innloggingssiden fra denne jobbens utgangspunkt er videreført, og den lokale databasen er samordnet med hovedgrenens skjema. Siste brukerprøver og kontroll etter samordning registreres i PR-en. GitHub CI og faktisk produksjonskontroll er egne kontrollpunkter.

PRE-01 har nå et kildeinventar og et kontrollert brukerregister, men er ikke fullført. PRE-02 er klar for brukerprøvene; Storage, booking og øvrige integrasjoner gjenstår. PRE-03 har ferske målte resultater, og lokal kvalitetsport er grønn etter samordning. Rapport og inventar ligger i arbeidskopiens `docs/design-audit/brukere-funksjonskontroll-2026-10-01.md` og `funksjonsinventar-2026-10-01.json`. Neste uavhengige del er trenerendring/publisering → spiller → Live → oppsummering/analyse med de samme syntetiske eierne. Hele prosjektet regnes ikke som 100 prosent funksjonelt.

**Presisering fra Anders 30.09.2026:** Lag en plan for arbeidet som kan gjøres mens designet fullføres i en annen økt, og undersøk alle funksjoner og at de virker sammen. Codex prioriterer derfor funksjonsgrunnlaget og bevis for sammenheng før endelig skjermportering.

### Ferske observasjoner i denne planleggingsøkten

Den lesende kartleggingen fant **517 sidefiler, 770 komponentfiler, 204 Prisma-modeller, 534 enhetstestfiler og 41 nettlesertestfiler** på gjeldende arbeidskopi. Målt med `kartlegg-skjermer.mjs` og `prosjekt-register.mjs`, uten `--write`. Dette er fil- og modellantall, ikke antall ferdige funksjoner eller beståtte tester.

Ruteinventaret fordeler sidefilene slik: PlayerHQ 175, AgencyOS 163, marked/offentlig 70, lag/skole 49, inngang/konto 18, forelder 16, delt innsyn 11, interne eksempler 6, offentlig booking 4, personlig arbeidsflate 3 og systemtilstander 2. Alle områdene tas med i dekningen; sidene kan dele funksjoner og designmønstre.

Konkrete kontrollhull funnet ved lesing:

- `tests/e2e/auth-guard.spec.ts`, `coach-scope-idor.spec.ts` og `kjerne-klikk.spec.ts` hopper over innloggede prøver uten nødvendige syntetiske testkontoer.
- `tests/e2e/credit-booking.spec.ts` har både betinget utelatelse og en eksplisitt deaktivert full booking-/avbestillingsreise.
- `.github/workflows/ci.yml` kjører `npm run verify`, men har uttrykkelig tatt innloggede nettlesertester ut av PR-kontrollen. Et grønt resultat der beviser derfor ikke disse reisene.
- [Den gamle lokale databaseoppskriften](../utvikling/lokal-testdatabase.md) gjelder en tom Cursor-VM. Den kan ikke kopieres direkte til Anders' Mac. Dens bruk av en databaseadministrator beviser heller ikke at databasens egne tilgangsregler virker.

Observasjonene er ikke en full funksjons- eller sikkerhetsgjennomgang. Ingen app- eller databasetest er kjørt i denne planleggingsøkten.

### Oppgaver Codex kan utføre uten endelige designverdier

| ID / rekkefølge | Oppgave og kodeområder | Konkret leveranse / ferdigkriterium |
|---|---|---|
| PRE-01 | Kartlegg alle funksjoner fra aktive ruter, serverhandlinger, `src/lib/domain/`, beslutninger og eksisterende tester. Spor også oppgaver som ingen rute ennå dekker | Ett dekningsregister koblet til denne planen: funksjon → reise → rolle → faktisk kode → designavhengighet → testbevis → rest. Hver registrerte rute er undersøkt eller tydelig merket ikke undersøkt |
| PRE-02 | Etabler separat lokal Supabase med egen identitet, egne porter, ignorert testkonfigurasjon og kun syntetiske data. Les sikkerhets-/personvernskills og databasefallgruver først | To adskilte coacher/spillere, relevante foresatt- og organisasjonsroller samt avtalte tilgangsnivåer. App, database, Auth og Storage peker lokalt; ekte e-post, betaling og integrasjonsjobber er sperret i testmiljøet. Eksisterende miljøfiler bevares |
| PRE-03 | Mål dagens kodekontroll og reisedekning: `npm run verify` samt relevante tester i `tests/e2e/` med lokalt oppsett | Rapport med bestått, feilet og hoppet over separat. Kritiske innloggede prøver som ikke kan kjøres står som kontrollhull. Rett oppsettet før en utelatt prøve regnes som dekket |
| PRE-04 | Kartlegg og presiser avtalen om data mellom moduler: eier, stabile ID-er, kilderevisjon, tidspunkt, tilstander, inndata/utdata og feil. Bruk eksisterende `src/lib/workbench/`, `src/lib/teknisk-plan/`, `src/lib/auth/` og berørte API-er | For hver viktig overgang er det klart hvem som skriver, hvem som leser, hva som skjer ved feil og når en kildeendring skal slå gjennom. Ingen nye skjema- eller produktvalg bygges på antakelser |
| PRE-05 | Kontroller treningsmotoren gjennom hele kjeden. Prøv års-/periode-/ukegrunnlag, tekniske oppgaver, FYS, turnering, økt, Live, oppsummering og analyser mot ekte lokal lagring | Koblede tester følger de samme ID-ene og forventede tallene på begge sider av en overgang. Kontroller nullverdier, perioder som møtes, årsskifte, Oslo/sommertid, kopier/serier og endret kilde. Rett verifiserte feil innen avklart bestilling |
| PRE-06 | Kontroller roller, booking, abonnement, samtykke og AI-godkjenning: `src/lib/auth/`, `booking/`, `stripe/`, `gdpr/`, `caddie/` og faktiske serverhandlinger | Tillatt og avvist tilgang prøves med separate eiere. Dobbelt bookingkall og gjentatte/omvendt ordnede hendelser gir korrekt resultat. Lokal lagring prøves; leverandørtest i separat testmodus gjøres først når konkret tilgang/autorisasjon foreligger |
| PRE-07 | Kontroller feil og gjenoppretting på tvers: avbrutt forespørsel, dobbel innsending, to samtidige redigeringer, gammel kilde, manglende data og ny innlasting | Ingen falsk lagringsbekreftelse, dobbeltregistrering eller stille overskriving i prøvde flyter. Ukjent utfall etter tidsavbrudd håndteres før forsøk gjentas. Endringer som krever nytt skjema klargjøres som konkret forslag |
| PRE-08 | Samle fungerende funksjonsgrunnlag og klargjør koblingen til Claude Design | Kontrollrapport på bestemt kodeversjon, gjenværende feil med prioritet, og rute/handling/data-kart som den endelige designpakken kan kobles til. Eventuelle CI-forbedringer klargjøres for gjennomgang; lokal test og GitHub-kontroll rapporteres separat |

PRE-01 og PRE-02 kommer først. PRE-03 etablerer utgangspunktet. PRE-04 styrer hvilke sammenhenger PRE-05–07 skal prøve. PRE-08 samler bevisene. Kartlegging og testoppsett kan gå framover mens designarbeidet pågår, uten å sende nye instrukser til den andre økten fra denne chatten.

### Slik kontrolleres at alt virker sammen

Hver funksjon spores i begge retninger: **brukerhandling → tilgang → regel/beregning → lagring → neste leser/skjerm**, og **vist tall/status → beregning → opprinnelig registrering og kilde**. Et korrekt kort på én skjerm er utilstrekkelig hvis neste skjerm leser en annen øktmodell eller gamle data.

| Sammenheng som skal prøves | Forventet resultat |
|---|---|
| Coach endrer og publiserer plan → PlayerHQ uke/I dag → Live | Riktig spiller, riktig utgitt versjon og samme økt. Utkast vises ikke utilsiktet |
| Teknisk oppgave/FYS-program/turnering → planlagt økt | Riktig kilde, revisjon, antall og dato. Ny kilderevisjon behandles etter avklart regel |
| Live → oppsummering → teknisk framgang → analyse → coach | Registrering telles én gang, samme status og datagrunnlag gjenbrukes, avbrutt økt behandles korrekt |
| Grupper/medlemskap → plan/kalender → spillerens tilgang | Riktig personomfang, ingen duplikater eller innsyn i andre gruppers data |
| Booking → tilgjengelighet → kalender → credits → avbestilling | Tid reserveres riktig; dobbelttrykk gir ingen dobbel booking eller dobbelt trekk. Tilbakeføring følger produktregelen |
| Abonnement/betalingshendelse → tilgang → konto/booking | Rettigheter følger korrekt abonnementstilstand, også ved forsinket eller gjentatt hendelse |
| Runde/slag/import/test → analyse og sammenligning | Brutto score, avtalt enhet og kilde beholdes; mangelfulle data merkes og dobbelimport prøves |
| AI-forslag → godkjenning → plan → spiller | Bare godkjent og fortsatt gyldig forslag utføres, med riktig eier og omfang |
| Foresatt/samtykke/delt innsyn → visning, tilbaketrekking og eksport/sletting | Tillatt omfang er likt hos alle lesere; trukket innsyn avvises, og personvernhandlinger håndterer berørte lagre |
| Handling → varsel/e-postutkast → mottaker → lenkemål | Riktig mottaker og kontekst; gjentatt hendelse skaper ikke utilsiktet dobbeltutsending. Eksterne utsendinger erstattes med lokal oppsamling under test |

Dette er startmatrisen. PRE-01 utvider den for samtlige registrerte funksjoner, inkludert WANG, Team Norway og interne flater. Bruk eksisterende regler og syntetiske scenarier; ikke innfør nye sportslige formler, økonomiregler eller personvernvalg for å fylle et hull.

### Hva som trenger designleveransen

Endelig typografi, mellomrom, skjermstruktur, navigasjon, diagramutforming, responsiv finjustering og visuell godkjenning gjøres fra valgt Claude Design-versjon. Codex bygger ikke et midlertidig alternativt designsystem mens vi venter.

Ferdige og allerede valgte reiser kan porteres før resten av designet er ferdig. Uavklarte designvalg blokkerer bare berørt skjermarbeid. Rene beregninger, eksisterende datalagring, kildeavtaler og funksjonstester kan gjøres først når produktreglene er avklart. Hvis designet introduserer nye data eller handlinger, oppdateres den berørte avtalen før koblingen bygges.

**Leveransen før designet er ferdig:** kjent funksjonsdekning, fungerende lokal testrigg, dokumentert sammenheng gjennom kjernen, rettede avklarte feil og et konkret kart for skjermkoblingen. «Perfekt» erstattes av etterprøvbare ferdigkriterier; begrensninger og uprøvde områder står synlig.

## Byggerekkefølge

Rekkefølgen under er anbefalt av Codex. Fersk kartlegging kan flytte uavhengige oppgaver, men skal bevare hele omfanget. Hver del leveres gjennom grensesnitt, server og lokal datalagring samlet.

| Del | Arbeid | Bevis før delen regnes som ferdig |
|---|---|---|
| 0. Fersk kartlegging | Registrer alle aktive ruter, funksjoner, roller, designreferanser, reelle kodehull og kjente feil. Kontroller eksisterende tester. Kartlegg krav fra beslutningsblokkene og identifiser faktisk monterte komponenter | Alle ruter og relevante dialoger har kobling til en reise, et navngitt mønster eller en undersøkt teknisk forklaring. Restene er konkrete, med kilde og kontrollpunkt |
| 1. Felles grunnlag | Koble valgte designverdier til delte komponenter, navigasjon, skjemaer, dialoger, temaer og systemtilstander. Etabler isolert lokal testdatabase og syntetiske kontoer | Valgte referanser stemmer på mobil og desktop; tillatt og avvist tilgang virker i lokale prøver |
| 2. Hele treningskjeden | AgencyOS/Workbench: tom årsplan → perioder → måned → uke → økt. Koble teknisk plan, fysisk program, golfslag/spill og turnering. PlayerHQ: I dag → Plan → Live → oppsummering → coachoppfølging | Samme økt og tall gjennom hele kjeden. Lagring overlever ny innlasting. Kopi, flytting, serier, sletting/angre og kontrollert publisering fungerer; feil eier avvises |
| 3. Spillerens øvrige verktøy | Runde/slag, tester, Strokes Gained, analyse, mål, turneringsresultater, baneguide/gameplan, utfordringer, venner, varsler og Meg — etter vedtatt omfang | Brutto score, riktig kilde/enhet/status og korrekt sammenheng mellom registrering og analyse. Tomme og ufullstendige data gir forståelig resultat |
| 4. Booking og coaching | Offentlig og innlogget booking, tilgjengelighet, kalender, credits/klippekort, bekreftelse, endring/avbestilling, abonnement og designede e-postmaler | Kollisjoner og dobbeltinnsending håndteres. Betalingsflyt verifiseres i godkjent testmodus. Ingen ekte e-post eller betaling i lokal test |
| 5. AgencyOS og AgenticOS | Stall, grupper, Spiller 360, oppfølgingskø, analyse, kalender, maler/øvelser/tester, drift, oppsett, økonomivisning og AI-arbeid | Coachens hovedreiser fungerer med egne data og riktige roller. AI foreslår → coach godkjenner → system utfører; ingen stille publisering |
| 6. Forelder og organisasjoner | Forelder, samtykke og delt innsyn; GFGK, WANG og Team Norway etter gjeldende rolle- og designvalg. Kontroller også registrerte interne/personlige flater og behold skillet mot separat ME-database | Rolleprøver dekker både tillatelser og avvisning. WANG-eleven bruker PlayerHQ; WANG-fellessiden bevares separat. Organisasjonsprofiler blandes ikke |
| 7. Samlet sluttkontroll | Konto, innlogging/gjenoppretting, personverneksport/sletting, nettfeil, ytelse, tilgjengelighet og alle rester fra registeret. Fullfør marked når valgt design foreligger | Hele registrerte omfanget er forklart og kontrollert. Ingen kritiske åpne feil, døde handlinger eller ukjente dataskriver. App/design er vist til Anders |
| 8. Pilot og lansering | Klargjør konkret lanseringspakke, separat plan for nødvendige produksjonsendringer, tilbakeføring, drift og pilotreiser | Anders bestiller de konkrete produksjonsstegene. Faktisk pilot/produksjonskontroll føres etter gjennomføring |

Treningskjeden prioriteres fordi den forbinder coachens planlegging med spillerens gjennomføring og analyse. Booking og tilgang er med før åpen lansering. Tidligere øktmodellarbeid (OW-3) videreføres bare fra verifisert nåsituasjon; ingen generell sammenslåing eller oppfunnet datamodell som del av designportering.

## Arbeidsmåte for hver leveranse

1. Les relevant kode og valgt designpakke. Definer reisen, roller, handlinger og ferdigkriterier.
2. Arbeid på egen `codex/`-gren. Bevar andres endringer; bruk separat arbeidskopi ved konflikt.
3. Bygg på eksisterende motor og delte komponenter. Kontroller rammeverksbruk mot installert dokumentasjon.
4. Prøv reisen med syntetiske data i det isolerte lokale miljøet, inkludert feiltrykk, feil eier, nett-/lagringsfeil og ny innlasting der relevant.
5. Sammenlign faktisk app med den valgte designversjonen. Registrer avvik med bilder og målinger; rett avklarte avvik.
6. Kjør nødvendig kvalitetskontroll og les diffen før lagring. Lever kort resultat: ferdig, testet, uverifisert og neste del.

Codex fortsetter med avklart arbeid uten gjentatte tillatelsesspørsmål. Nye produktvalg og konkrete endringer i databaseskjema, tilgangsregler eller produksjonsoppsett avklares før avhengig arbeid. Andre deler kan fortsette. Hosting, push, merge og deploy følger Anders' konkrete bestilling.

Oppgavenes kilde og arbeidspunkter ligger i [beslutningsblokkene](../../.claude/rules/beslutninger.md). Framdriftsregisteret knytter hvert punkt til rute, designversjon, kodeversjon, bevis, åpne avvik og neste handling; det introduserer ingen konkurrerende produktregler. Sesjonsminnet i ak-brain fører nøyaktig hvor arbeidet skal gjenopptas.

## Skills og slash-kommandoer

Codex velger relevante skills per oppgave. Du trenger ikke kjøre hver oppskrift manuelt. Disse er konkrete, tilgjengelige kilder i prosjektet:

| Skill | Bruk |
|---|---|
| [ak-hq-design](../../.claude/skills/ak-hq-design/SKILL.md) | Designoverlevering, skjermdekning og sammenligning med valgt Claude Design-versjon |
| [playerhq-arkitektur](../../.claude/skills/playerhq-arkitektur/SKILL.md) og [agencyos-arkitektur](../../.claude/skills/agencyos-arkitektur/SKILL.md) | Riktig plassering av spiller- og coachfunksjoner |
| [ak-sikkerhet](../../.claude/skills/ak-sikkerhet/SKILL.md) og [ak-personvern](../../.claude/skills/ak-personvern/SKILL.md) | Før kodeendringer som reglene omfatter; bevis for data, tilgang og personvern |
| [webapp-testing](../../.claude/skills/webapp-testing/SKILL.md) og [web-design-guidelines](../../.claude/skills/web-design-guidelines/SKILL.md) | Faktiske nettleserreiser, mobilkontroll, tastatur og tilgjengelighet |
| [vercel-react-best-practices](../../.claude/skills/react-best-practices/SKILL.md) | Målrettet kontroll av React/Next.js-ytelse mot installerte versjoner |
| [verify-og-commit](../../.claude/skills/verify-og-commit/SKILL.md) | Kvalitetskontroll og kontrollert lagring |
| [api-and-interface-design](../../.claude/skills/api-and-interface-design/SKILL.md) | Tydelige avtaler om data og feil mellom moduler, server og skjerm |
| [source-command-db-check](../../.claude/skills/source-command-db-check/SKILL.md) og [source-command-pr](../../.claude/skills/source-command-pr/SKILL.md) | Databasesammenligning og klargjøring av kodeforslag når oppgaven krever det |

Spesialskills for filopplasting, AI, Stripe eller Supabase lastes bare når aktuell kode berøres. Nye eksterne integrasjoner følger gjeldende integrasjonsoppskrift før valg eller installering. Designskills som foreslår en annen estetikk overstyrer ikke Claude Design.

De eksisterende slash-kommandoene er Claude-oppskrifter i `.claude/commands/`; de er ikke dokumentert som innebygde Codex-kommandoer. Codex bruker tilsvarende skills eller leser oppskriften direkte:

- [`/feature`](../../.claude/commands/feature.md): avgrens og gjennomfør én sammenhengende reise. Følg gjeldende `codex/`-grenregel og eksisterende autorisasjon foran eldre kommandoformuleringer.
- [`/web-design-guidelines`](../../.claude/commands/web-design-guidelines.md): konkret kontroll av grensesnittet; norsk språk og valgt design styrer foran generiske skriveregler.
- [`/db-check`](../../.claude/commands/db-check.md): lesende sammenligning av forventet og faktisk skjema; en rapport autoriserer ingen databaseskriving.
- [`/pr`](../../.claude/commands/pr.md): klargjør et kodeforslag for gjennomgang. Kjør kvalitetskravene i AGENTS.md; bevar skillet mellom lokal kontroll og ekstern publisering.
- [`/beslutning`](../../.claude/commands/beslutning.md): registrer nye valg. Oppskriftens henvisning til fjernet MASTERPLAN er utgått; arbeidet føres i beslutningens egen blokk som AGENTS.md krever.

## Hva «verdensklasse» betyr i denne leveransen

- **Sammenheng:** Alle synlige handlinger har riktig virkning. Samme data, eier, kilde og status følger brukeren gjennom reisen.
- **Designpresisjon:** Mobil 390 px og desktop sammenlignes med valgt referanse; nettbrett og avtalte temaer kontrolleres. Ingen sidelengs rulling. Berøringsmål, tastatur, fokus, stor tekst og kontrast virker.
- **Robust lagring:** Ingen falsk «lagret»-melding. Dobbelttrykk, avbrudd, ny innlasting og samtidige endringer prøves der de kan skade data. Offline-støtte bygges bare for avtalt omfang.
- **Riktig tilgang:** Innlogging og sidevakter beholdes. Prøver dekker egne/andres data og de relevante spiller-, coach-, foresatt- og organisasjonsrollene.
- **Faglig riktighet:** Brutto score, avtalte måleenheter og kildegrunnlag. Ingen konstruerte resultater, økonomitall eller faglige formler.
- **Ytelse:** Mål faktisk lasting og respons i sentrale mobilreiser med representativ syntetisk datamengde. Registrer utgangspunkt og forbedring; et enkelt laboratorietall beviser ikke god opplevelse i felt.
- **Kontroll:** `npm run verify` er prosjektets fullkontroll og inkluderer tester og bygg. Kjør relevante innloggede nettlesertester i tillegg. Dokument-/mappeendringer kontrolleres med `npm run prosjekt:sjekk`. En hoppet over prøve oppgis som uverifisert.
- **Etterprøvbarhet:** Design ferdig, kode implementert, test bestått, sett av Anders og kontrollert i produksjon er separate statuser. Ingen av dem settes på grunnlag av en annen.

## Første arbeidsøkt etter planen

Codex starter med PRE-01–03: fersk funksjonskartlegging, isolert lokal testrigg og målt teststatus. Følg deretter PRE-04–08 mens Claude Design fullfører sin versjonerte pakke. Arbeidet krever ikke at endelig skjermdesign er ferdig.

Deretter bygges grunnlaget og den første komplette treningsreisen. Mangler en konkret designvariant eller et produktvalg, klargjør Codex et avgrenset, reviewbart underlag og fortsetter uavhengige deler. Tidsanslag gis først etter kartleggingen; abonnementets pris brukes ikke som mål på kodekapasitet eller ferdigstatus.

## Utført i planleggingsøkten

Plan, eksisterende kommandoer og relevante skills er lest og knyttet til gjeldende kilder. Arbeidsdelingen er registrert. Ingen appkode, database, integrasjon eller produksjon er endret. Dokumentkontroll rapporteres i øktens sluttmelding; kodetester og full byggkontroll er ikke kjørt som del av denne planleggingen.
