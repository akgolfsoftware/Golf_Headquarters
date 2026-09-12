# Status nå — AK Golf HQ

Oppdatert 12.09.2026. Appen er fortsatt under arbeid og ikke klarert for åpen lansering. [Masterplanen](MASTERPLAN-GJENSTAAENDE.md) eier prioritert neste arbeid og den komplette restlisten.

## Denne samlingen

- **Entydig masterplan:** Train-lock er ikke lenger låst som visuell autoritet i styringsdokumentene. Når Anders velger en komplett Claude-pakke med `selectedForBuilding: true`, er den eneste visuelle fasiten for registrert omfang. PlayerHQ, AgencyOS, Team Norway og WANG er obligatoriske kjerner; alle øvrige brukerflater må bruke samme fundament gjennom navngitte profiler/mønstre. Masterplanen har nå P0-, D0–D6- og L0–L8-porter samt [sporbarhet for 35 funksjonsfamilier og 17 hovedreiser](planer/masterplan-dekning-2026-09-12.md).
- **Ny designretning:** Siste Claude-pakke har AgencyOS v0.3.3, AgencyOS Hjem v0.3.2, PlayerHQ v0.3.2 og Stall/spillerkort v0.1. Reisene er klikkbare på mobil og desktop, men pakken har fortsatt `selectedForBuilding: false` og `eksportert: false`. Eksisterende UI bevares som funksjons- og implementasjonsgrunnlag, ikke som visuell fasit. [Pakkekontroll](design-audit/claude-design-v0-3-3-2026-09-12.md).
- **Grok-start:** Grok 4.6 kan starte med innlogget spillerreise, tilgangstester, serverregler og teknisk skjermkartlegging uten å låse det nye uttrykket. [Avgrenset Terminal-plan og startprompt](planer/grok-4-6-start-2026-09-12.md).
- **R-E del 1:** Enhetstester følger samme økt gjennom I dag → Plan → øktark → Live → oppsummering for V2, Workbench og eldre plan, med avviste roller. Isolert testdatabase og innlogget Next-reise er blokkert uten Docker. [Kontroll](design-audit/playerhq-r-e-spillerreise-2026-09-12.md).
- **Caddie-kø/AI-grense:** AgencyOS-kø og telling viser bare Caddie-utkast eieren kan godkjenne. Ukjent databasefritekst sendes ikke til ekstern modell uten tillatt feltliste. Innlogget kontroll gjenstår.
- **P0-TEST:** Isolert testdatabase kan ikke startes her (ingen Docker). [Blokkering](design-audit/p0-test-blokkering-2026-09-12.md).
- **D2-AO teknisk:** Stall bruker samme spillerporte som spillerkort og Workbench. Oversiktsdata lastes ikke uten tilgang. [Kontroll](design-audit/agencyos-d2-ao-teknisk-2026-09-12.md).
- **Grenkontroll:** GitHub `main` er grunnlaget. PR #843 er lukket uten helfletting; språk-/ordbokarbeidet er samlet via PR #844, og Groks R-E del 1 via PR #845. Groks ferdige worktree er fjernet. [Grenregnskap](vedlikehold/grengjennomgang-2026-09-12.md).
- **Plan:** eldre godtatte planøkter uten V2-speil inngår i ukeoversikt og progresjon uten dobbelttelling. Separate øktmodeller og eksisterende statusregler er bevart. [Plan-kontroll](design-audit/plan-legacy-2026-09-11.md).
- **PH-06:** valgt resultathierarki er bygget. Lagrede notater og vurderinger er synlige, feil bevarer feltene, og samtidige lagringer oppdaterer separate JSON-felt. Appskall/Geist, åtte datatilstander, fire bredder og to temaer er komponentprøvd. Egen isolert PostgreSQL-prøve bestod. [PH-06-kontroll](design-audit/playerhq-ph06-2026-09-11.md).
- **Planleggingsarbeid:** funksjonsregister, funksjonskort og produktintervju er bevart fra den separate arbeidsgrenen. De er arbeidsunderlag, ikke nye godkjente produktbeslutninger.
- **Opprydding:** ferdige grener og arbeidskopier avstemmes med GitHub; nåstatus, masterplan, dokument-/filregister og arbeidsdeling er samordnet. [Samlingsrapport og sluttkontroll](vedlikehold/samling-og-opprydding-2026-09-11.md).
- **Sikkerhet, lokal lagring og import:** Caddie-oppslag har ressurskontroll og minimerte modellgrenser, abonnementshenting feiler lukket, TrackMan bevarer eksplisitte enheter gjennom forhåndsvisning, lagring og analyse, og lokale utkast er avgrenset per serververifisert bruker. Dette er i main og komponent-/kodeprøvd; innlogget kontroll og produksjonsbevis føres separat. [Kontroll og begrensninger](vedlikehold/sikkerhet-og-enheter-2026-09-11.md).
- **Team Norway/WANG-grunnlag:** Team Norway har en medlemsavgrenset oversikt, og WANG bruker samme konkrete Toppidrett-gruppe gjennom trenerliste, IUP-lesing og IUP-lagring. Trygg retursti og ærlig databasefeil er prøvd i PR #842. Full skjermreise, innlogget og visuell kontroll føres separat. [Kontroll og restarbeid](design-audit/tn-wang-tilgang-2026-09-11.md).

## Allerede i main

DataGolf/GolfBox og tidligere rettinger er samlet via PR #833/#834. Seks porteringspakker er samlet via PR #835. Manuell SG er samlet via PR #836. Claude Codes første PH-06-testpakke er samlet via PR #837, merge `97ff9b1bb`; både main-CI og produksjonens automatiske røyktest bestod for denne versjonen. Røyktesten er ikke en komplett innlogget brukerreise.

Tidligere kontroll av Vercel bekreftet `2807d4d08` som publisert kode og prøvde utlogget innlogging/videresending. Dette er et datert bevis, ikke en påstand om nåværende produksjonsversjon. Ingen manuell utrulling, miljøendring eller åpning av offentlig booking inngår i denne samlingen.

## Det som gjenstår

1. Bestå P0-TEST, deretter fullfør isolert, innlogget Next-/databasereise gjennom I dag, Plan, økt og oppsummering. Enhetstestene for de tre øktmodellene og avviste roller er i main; tom lokal testdatabase mangler fortsatt.
2. Kjør innlogget kontroll av Caddie-, TrackMan-, lokal lagrings- og abonnementspakken. Serverregelen for Caddie-eier og tillatt modell-felt er bygget; bredere AI-bruk venter på innlogget bevis.
3. Resterende PlayerHQ-, AgencyOS-, Team Norway- og WANG-skjermer, koblet til valgte kilder og reelle handlinger.
4. Testvarianter/mål, foreldreinnsyn, booking-/betalingsreise og konkrete produktavklaringer fra funksjonsregisteret.
5. Visuell vurdering med Anders, kontrast/tilgjengelighet, full alarm-/gjenopprettingsprøve og dokumentert faktisk produksjonsreise før lansering.

Stripe-testmiljø og innloggede testroller trengs for betalingsreisen. Tidligere avvist produksjonsendring for funksjonssikkerhet krever konkret miljøautorisasjon. Ingen reell betaling, varslingsutsending, migrasjon eller databaseoppsettsendring er gjennomført i denne pakken.

## Kilder og historikk

Aktiv designutforsking: nytt Design System v0.1 med «Atletisk intelligens» for hele den brukerrettede appen, med fire obligatoriske kjerner og navngitte profiler/mønstre for øvrige flater. Train-lock, Claw/Team Norway, WANG-speilet og dagens kode bevarer funksjon, historikk og tidligere portering, men er ikke visuell fasit for den nye retningen. [Designstatus](../designsystem/README.md) og [port-audit](design-audit/portering-fire-flater-2026-09-10.md). Det siste kontrollerte ruteinventaret har 480 sideruter; dette er ikke antall ferdige design.

[Historisk status](arkiv/opprydding-2026-09-10/status-nå.md), [tidligere teknisk kontroll](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md) og Git-historikken bevarer tidligere hendelser. Bygget, testet, sett av Anders, flettet og publisert kontrollert er ulike statuser.
