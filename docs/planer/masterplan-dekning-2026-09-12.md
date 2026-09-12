# Masterplan — dekningsregister

Opprettet 12.09.2026. Dette er sporbarhetsregisteret under [masterplanen](../MASTERPLAN-GJENSTAAENDE.md), ikke en ny konkurrerende plan. Status betyr ikke ferdig før det finnes lenket bevis for kode, test, visuell kontroll, Anders-godkjenning og publisering der det er relevant.

## Funksjonsfamilier P01–P11, G01–G11 og O01–O13

| ID | Familie | Ansvarlig arbeidspakke | Før bygging / gjeldende status |
|---|---|---|---|
| P01 | Registrering, introduksjon, profil | Konto/onboarding | Åpen; førstegangsnytte og nivåquiz avklares |
| P02 | I dag | P0-TEST → R-E/J02 | Del 1 i main via PR #845; innlogget isolert reise blokkert uten Docker/testbase |
| P03 | Planlegging | R-E + Workbench | Tre modeller beholdes. Frekvens teller speil én gang. Innlogget ny/rediger/flytt gjenstår. [Kontroll](../design-audit/plan-live-p02-p05-2026-09-12.md) |
| P04 | Gjennomføring/Live | R-E/J02 | Avbrutt skilles fra lagret. Innlogget reise blokkert uten Docker |
| P05 | Mål/fremgang | R-F | Frekvens uten dobbelttelling bygget; startverdi/periode for øvrige måltyper gjenstår |
| P06 | Øvelsesbank/program | D2-PH + O02 | Delvis; faglige merkelapper er frie |
| P07 | Tester | D2-TN + testfag | Delvis; samme TN-protokoll og versjon følger resultatet. Enhet/retning/historikk utenom v3 gjenstår |
| P08 | Fysisk trening/helse | D2-WANG + R-I | Fys-logg bruker samme spiller-tilgang. Helseskriving krever manuelt samtykke; under 16 kan ikke samtykke selv. [Kontroll](../design-audit/handlingstilgang-helse-2026-09-13.md). Styrkeinnhold avklares |
| P09 | Coachkontakt | PlayerHQ-rest | Åpen; kobling til økt/resultat og svartid |
| P10 | Kalender/turnering | PlayerHQ-rest + AgencyOS | Åpen; styrende kalender og konfliktregler |
| P11 | Venner/utfordringer | P0-PRODUKT | Uavklart nytte/målgruppe; ikke utvid før beslutning |
| G01 | Runderegistrering | Runde/SG | Manuell korrigering, nullstilling og gjenåpning prøvd. Innsatsnivå avklares. [Kontroll](../design-audit/runde-sg-trackman-g01-g10-2026-09-12.md) |
| G02 | Gameplan | BG-01 | Delvis; banedekning, lagring og brukerreise prøves |
| G03 | GPS/live avstander | BG-03 | Planlagt; tillatelse og datakvalitet før bygging |
| G04 | Offline baneguide | BG-04 | Planlagt; omfang, oppbevaring og kartvilkår først |
| G05 | Vind/spilleforhold | P0-PRODUKT | Uavklart: manuell trening, værkilde eller fysisk måler |
| G06 | Bag/gapping | BG-05 | TrackMan-enheter: ukjent enhet og manglende felt gir null. Innlogget bag-reise gjenstår |
| G07 | Analyse/SG | Analysepakken | Manuell kilde overskrives ikke. Samme skala i beregnet vs manuell |
| G08 | TrackMan | Import/Analyse | Enhet og manglende felt prøvd. Innlogget import gjenstår |
| G09 | DataGolf/GolfBox | Import/Analyse | Manglende referanse skrives ikke. Produksjonsimport ikke kjørt |
| G10 | Turnering/talent | Talentpakken | Identitet i sesonghelper prøvd. Produksjonsimport krever autorisasjon |
| G11 | Banedata/trener | BG-06 | Planlagt/delvis; datakvalitet og delingsregler først |
| O01 | AgencyOS hjem/stall | D2-AO/D3 | Teknisk stall-porte og kort-tilgang rettet; visuell pilot venter på D0 |
| O02 | Workbench | D2-AO | Delvis; publisering uten dublett/bortfall |
| O03 | WANG/GFGK | D2-WANG/D3 | Teknisk uke/elev-reise bygget; IUP krever coach/admin og samme Toppidrett-gruppe. Innlogget og visuell kontroll gjenstår. [Kontroll](../design-audit/wang-d2-wang-teknisk-reise-2026-09-12.md) |
| O04 | Team Norway | D2-TN/D3 | Teknisk reise bygget; poster/dokumenter låst til kanonisk gruppe. Innlogget og visuell kontroll gjenstår. [Kontroll](../design-audit/team-norway-d2-tn-teknisk-reise-2026-09-12.md) |
| O05 | Forelder/delt innsyn | Forelderpakken | Godkjent eierskap, barnbytte uten identitetsblanding, avvist skriving, ugyldig/utløpt lenke og tilbakekalling er prøvd. Betaling for barn og innlogget reise gjenstår. [Kontroll](../design-audit/forelder-o05-delt-innsyn-2026-09-12.md) |
| O06 | Booking/betaling | Booking R4/R5/R9 | Kollisjon, idempotens, credits, avbestilling/refusjon og oppsigelse prøvd med mocket Stripe. Innlogget checkout og reell testnøkkel gjenstår. [Kontroll](../design-audit/booking-o06-betaling-2026-09-12.md) |
| O07 | Tilgang/konto | P0-TEST + R-I + O05 + R-J | Handlingstester for avvist skriving, ugyldig/utløpt invitasjon, trukket ekstern leser, opptatt tid, profil og mål. Deling og helse bruker samme 16-årsregel. Innlogget isolert reise blokkert uten Docker. [R-I](../design-audit/handlingstilgang-r-i-2026-09-12.md) · [O05](../design-audit/forelder-o05-delt-innsyn-2026-09-12.md) · [R-J](../design-audit/samtykke-r-j-2026-09-13.md) |
| O08 | Caddie/AI Coach | Caddie-kø/AI-grense | Eierregel og tillatt modell-felt bygget; innlogget kontroll gjenstår |
| O09 | AgenticOS/Jarvis | AgencyOS/AgenticOS | Delvis; faktisk kjøring, godkjenning og sporbarhet |
| O10 | Marked/salg | Marked → booking | Åpen; ønsket omfang og fungerende overgang |
| O11 | Økonomi/personlig | P0-PRODUKT | Uavklart; kun autorisert Tripletex-eksport |
| O12 | Familie-OS/sideprosjekter | Utenfor aktiv app | Ikke aktivert; krever uttrykkelig ny bestilling |
| O13 | Felles kvalitet/drift | D0–D6 + L0–L8 | Lokal `pg_restore` og 11 lanseringsreiser prøvd 12.09 kveld. L7 ikke bestått. [Kontroll](../design-audit/docker-launch-tester-2026-09-12.md) |

Detaljert innhold og kildegrunnlag står i [funksjonsregisteret](funksjonsregister-2026-09-11.md). Dette registeret eier koblingen til gjennomføring og må oppdateres ved hver leveranse.

## Hovedreiser J01–J17

| Reise | Kobling |
|---|---|
| J01 konto → første nytte | P01, O07 |
| J02 I dag → Plan → økt → Live → oppsummering | P02–P04; R-E og D3 |
| J03 mål → plan → faktisk fremgang | P03, P05, G07 |
| J04 coach ser behov → planlegger → publiserer → følger opp | O01–O02, P09 |
| J05 test tildeles → føres → korrigeres → historikk | P07, O04 |
| J06 WANG uke → økt → elev/IUP → rapport | P08, O03 |
| J07 melding/råd → relevant økt eller resultat | P09, O01 |
| J08 kalender/booking → pris → betaling → bekreftelse | P10, O06 |
| J09 forelder bytter barn → innsyn → samtykke/betaling | O05–O07 |
| J10 runde → korrigering → analyse | G01, G07 |
| J11 Gameplan → Live/GPS → offline/synk → etterlevelse | G02–G06, G11 |
| J12 import → kildevalidering → analyse | G06–G10 |
| J13 Caddie-forslag → menneskelig valg → resultat | O08 |
| J14 AgenticOS-forslag → godkjenning → kjøring/feil → spor | O09 |
| J15 marked → tilbud → booking → oppfølging | O06, O10 |
| J16 delt lenke → korrekt innsyn → utløpt/tilbakekalt | O05, O07 |
| J17 alarm → håndtering → backup/restore/rollback | O13; L7–L8. Lokal `pg_restore` prøvd; produksjonsrestore ikke kjørt. [Kontroll](../design-audit/docker-launch-tester-2026-09-12.md) |

## Rute- og tilstandsdekning

Siste kontrollerte inventar har 480 sidefiler i designinventaret. Målt 12.09.2026 mot `page.tsx`: 479 sideruter (PlayerHQ 171, AgencyOS 162, Team Norway 5, WANG 4, forelder 16, delt innsyn 11, inngang/booking 22, marked/offentlig 50, øvrig 38). 103 lastefiler og 93 feilfiler finnes; det er ikke dekning for alle manuelle overlegg. [Teknisk rute- og tilstandskart](teknisk-rute-tilstandskart-2026-09-12.md). D1 skal koble hver rad til `egen-skjerm`, `felles-mønster`, undersøkt videresending/internflate eller en konkret blokkering.

Overlegg må registreres i tillegg: ark/dialog, meny, tooltip, toast, bekreftelse, konflikt, tomt søk, betalingens leverandørsteg, opplasting, varsling, tilgangsavslag og nettfeil. Ingen rute eller komponent slettes ut fra inventaret alene.
