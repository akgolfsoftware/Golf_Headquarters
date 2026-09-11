# Status nå — AK Golf HQ

Oppdatert 11.09.2026. Appen er fortsatt under arbeid og ikke klarert for åpen lansering. [Masterplanen](MASTERPLAN-GJENSTAAENDE.md) eier prioritert neste arbeid og den komplette restlisten.

## Denne samlingen

- **Plan:** eldre godtatte planøkter uten V2-speil inngår i ukeoversikt og progresjon uten dobbelttelling. Separate øktmodeller og eksisterende statusregler er bevart. [Plan-kontroll](design-audit/plan-legacy-2026-09-11.md).
- **PH-06:** valgt resultathierarki er bygget. Lagrede notater og vurderinger er synlige, feil bevarer feltene, og samtidige lagringer oppdaterer separate JSON-felt. Appskall/Geist, åtte datatilstander, fire bredder og to temaer er komponentprøvd. Egen isolert PostgreSQL-prøve bestod. [PH-06-kontroll](design-audit/playerhq-ph06-2026-09-11.md).
- **Planleggingsarbeid:** funksjonsregister, funksjonskort og produktintervju er bevart fra den separate arbeidsgrenen. De er arbeidsunderlag, ikke nye godkjente produktbeslutninger.
- **Opprydding:** ferdige grener og arbeidskopier avstemmes med GitHub; nåstatus, masterplan, dokument-/filregister og arbeidsdeling er samordnet. [Samlingsrapport og sluttkontroll](vedlikehold/samling-og-opprydding-2026-09-11.md).

## Gren `grok/r-c-d-h-d2-2026-09-11` (ikke flettet)

Bygget, enhetstestet. Ikke innlogget prøvd. Ikke sett av Anders.

- **R-C:** Privat flate i SW, eier-merket IndexedDB/runde-kladd, utlogging tømmer Cache Storage og fjerner aktiv-peker — sletter ikke ulagrede rader. Banner på `/auth/logget-ut`.
- **R-D:** TrackMan-enhet fra hode/enhetsrad/rapporttekst, aldri fra tallstørrelse. Carry kopieres ikke fra total. 70 m/s og 330 m beholdes. Ukjent enhet → null.
- **R-H:** Abonnementsoppslag som feiler er `TilgangHentefeil` → `/auth/tjeneste-utilgjengelig`, ikke betalingskrav og ikke utvidet tilgang.
- **D2-AO:** Ingen oppdiktet DNA/kohort på spillerkortet. Kø har laste-/feiltilstand og én kolonne på mobil.
- **D2-TN:** `/team-norway` oversikt fra GroupMember, proxy sperrer uautentiserte, layout binder bruker. Testføring lenkes til PlayerHQ. Samlinger er ærlig ukoblet.
- **D2-WANG:** Innlogging ærer `?next=` kun under `/team-wang`. Coach krever WANG-gruppemedlemskap. IUP krever coach-for-eleven. DB-feil viser feil, ikke demo-elever. Innlogget navn kommer fra sesjonen.

## Allerede i main

DataGolf/GolfBox og tidligere rettinger er samlet via PR #833/#834. Seks porteringspakker er samlet via PR #835. Manuell SG er samlet via PR #836. Claude Codes første PH-06-testpakke er samlet via PR #837, merge `97ff9b1bb`; både main-CI og produksjonens automatiske røyktest bestod for denne versjonen. Røyktesten er ikke en komplett innlogget brukerreise.

Tidligere kontroll av Vercel bekreftet `2807d4d08` som publisert kode og prøvde utlogget innlogging/videresending. Dette er et datert bevis, ikke en påstand om nåværende produksjonsversjon. Ingen manuell utrulling, miljøendring eller åpning av offentlig booking inngår i denne samlingen.

## Det som gjenstår

1. Isolert, innlogget spillerreise gjennom I dag, Plan, økt og oppsummering med alle tre øktmodeller og avviste roller.
2. Caddie-tilgang/dataminimering avstemt mot dagens kode.
3. Resterende PlayerHQ-, AgencyOS-, Team Norway- og WANG-skjermer (uke/økt/rapport, øvrig AgencyOS-reise), koblet til valgte kilder og reelle handlinger.
4. Testvarianter/mål, foreldreinnsyn, booking-/betalingsreise og konkrete produktavklaringer fra funksjonsregisteret.
5. Visuell vurdering med Anders, kontrast/tilgjengelighet, full alarm-/gjenopprettingsprøve og dokumentert faktisk produksjonsreise før lansering.

Stripe-testmiljø og innloggede testroller trengs for betalingsreisen. Tidligere avvist produksjonsendring for funksjonssikkerhet krever konkret miljøautorisasjon. Ingen reell betaling, varslingsutsending, migrasjon eller databaseoppsettsendring er gjennomført i denne pakken.

## Kilder og historikk

Valgt design: Trainlock ZIP (4) for PlayerHQ/AgencyOS, Claw Team Norway for interne TN-skjermer og WANG-speilet. [Port-auditen](design-audit/portering-fire-flater-2026-09-10.md) knytter kilder til kode og bevis. Det siste ruteinventaret har 479 sideruter; dette er ikke antall ferdige design.

[Historisk status](arkiv/opprydding-2026-09-10/status-nå.md), [tidligere teknisk kontroll](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md) og Git-historikken bevarer tidligere hendelser. Bygget, testet, sett av Anders, flettet og publisert kontrollert er ulike statuser.
