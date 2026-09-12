# Status nå — AK Golf HQ

Oppdatert 12.09.2026. Appen er fortsatt under arbeid og ikke klarert for åpen lansering. [Masterplanen](MASTERPLAN-GJENSTAAENDE.md) eier prioritert neste arbeid og den komplette restlisten.

## Denne samlingen

- **Ny designretning:** Claude Design lager AK Golf HQ Design System v0.1 fra blankt lerret med «Atletisk intelligens». Ingen ny versjon er valgt for bygging ennå. Eksisterende UI bevares som funksjons- og implementasjonsgrunnlag, ikke som visuell fasit.
- **Grok-start:** Grok 4.6 kan starte med innlogget spillerreise, tilgangstester, serverregler og teknisk skjermkartlegging uten å låse det nye uttrykket. [Avgrenset Terminal-plan og startprompt](planer/grok-4-6-start-2026-09-12.md).
- **Grenkontroll:** Fersk `origin` hadde `main` og én åpen Claude-gren. PR #843 konkurrerer med nyere arbeid i `main` og ga 17 konflikter i simulert merge; den skal ikke flettes som helhet. Den lokale PR #841-rettelsen er en ren kandidat etter full kontroll. [Grenregnskap](vedlikehold/grengjennomgang-2026-09-12.md).
- **Plan:** eldre godtatte planøkter uten V2-speil inngår i ukeoversikt og progresjon uten dobbelttelling. Separate øktmodeller og eksisterende statusregler er bevart. [Plan-kontroll](design-audit/plan-legacy-2026-09-11.md).
- **PH-06:** valgt resultathierarki er bygget. Lagrede notater og vurderinger er synlige, feil bevarer feltene, og samtidige lagringer oppdaterer separate JSON-felt. Appskall/Geist, åtte datatilstander, fire bredder og to temaer er komponentprøvd. Egen isolert PostgreSQL-prøve bestod. [PH-06-kontroll](design-audit/playerhq-ph06-2026-09-11.md).
- **Planleggingsarbeid:** funksjonsregister, funksjonskort og produktintervju er bevart fra den separate arbeidsgrenen. De er arbeidsunderlag, ikke nye godkjente produktbeslutninger.
- **Opprydding:** ferdige grener og arbeidskopier avstemmes med GitHub; nåstatus, masterplan, dokument-/filregister og arbeidsdeling er samordnet. [Samlingsrapport og sluttkontroll](vedlikehold/samling-og-opprydding-2026-09-11.md).
- **Sikkerhet, lokal lagring og import:** Caddie-oppslag har ressurskontroll og minimerte modellgrenser, abonnementshenting feiler lukket, TrackMan bevarer eksplisitte enheter gjennom forhåndsvisning, lagring og analyse, og lokale utkast er avgrenset per serververifisert bruker. Dette er bygget og testet på samlingsgrenen; GitHub-fletting og innlogget kontroll føres separat. [Kontroll og begrensninger](vedlikehold/sikkerhet-og-enheter-2026-09-11.md).
- **Team Norway/WANG-grunnlag:** Team Norway har en medlemsavgrenset oversikt, og WANG bruker samme konkrete Toppidrett-gruppe gjennom trenerliste, IUP-lesing og IUP-lagring. Trygg retursti og ærlig databasefeil er prøvd i PR #842. Full skjermreise, innlogget og visuell kontroll føres separat. [Kontroll og restarbeid](design-audit/tn-wang-tilgang-2026-09-11.md).

## Allerede i main

DataGolf/GolfBox og tidligere rettinger er samlet via PR #833/#834. Seks porteringspakker er samlet via PR #835. Manuell SG er samlet via PR #836. Claude Codes første PH-06-testpakke er samlet via PR #837, merge `97ff9b1bb`; både main-CI og produksjonens automatiske røyktest bestod for denne versjonen. Røyktesten er ikke en komplett innlogget brukerreise.

Tidligere kontroll av Vercel bekreftet `2807d4d08` som publisert kode og prøvde utlogget innlogging/videresending. Dette er et datert bevis, ikke en påstand om nåværende produksjonsversjon. Ingen manuell utrulling, miljøendring eller åpning av offentlig booking inngår i denne samlingen.

## Det som gjenstår

1. Isolert, innlogget spillerreise gjennom I dag, Plan, økt og oppsummering med alle tre øktmodeller og avviste roller.
2. Kjør innlogget kontroll av Caddie-, TrackMan-, lokal lagrings- og abonnementspakken og lukk den dokumenterte fritekst-/køgrensen før bredere AI-bruk.
3. Resterende PlayerHQ-, AgencyOS-, Team Norway- og WANG-skjermer, koblet til valgte kilder og reelle handlinger.
4. Testvarianter/mål, foreldreinnsyn, booking-/betalingsreise og konkrete produktavklaringer fra funksjonsregisteret.
5. Visuell vurdering med Anders, kontrast/tilgjengelighet, full alarm-/gjenopprettingsprøve og dokumentert faktisk produksjonsreise før lansering.

Stripe-testmiljø og innloggede testroller trengs for betalingsreisen. Tidligere avvist produksjonsendring for funksjonssikkerhet krever konkret miljøautorisasjon. Ingen reell betaling, varslingsutsending, migrasjon eller databaseoppsettsendring er gjennomført i denne pakken.

## Kilder og historikk

Aktiv designutforsking: nytt Design System v0.1 med «Atletisk intelligens» for PlayerHQ, AgencyOS og AgenticOS. Train-lock, Claw/Team Norway, WANG-speilet og dagens kode bevarer funksjon, historikk og tidligere portering, men er ikke automatisk visuell fasit for den nye retningen. [Designstatus](../designsystem/README.md) og [port-audit](design-audit/portering-fire-flater-2026-09-10.md). Det siste kontrollerte ruteinventaret har 480 sideruter; dette er ikke antall ferdige design.

[Historisk status](arkiv/opprydding-2026-09-10/status-nå.md), [tidligere teknisk kontroll](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md) og Git-historikken bevarer tidligere hendelser. Bygget, testet, sett av Anders, flettet og publisert kontrollert er ulike statuser.
