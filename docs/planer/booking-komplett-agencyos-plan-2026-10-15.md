# Komplett bookingsystem i AgencyOS før lansering — gap mot Acuity og plan (15.10.2026)

Bestilling (Anders 15.10): «Komplett booking system og alle funksjoner til booking systemet må
være fungerende i AgencyOS før vi lanserer. Lag en kopi av Acuity funksjoner om vi enda ikke har
dette i booking systemet.» Henger sammen med [nettstedsplanen](akgolf-no-nettsted-reise-plan-2026-10-15.md):
dette må være ferdig før steg 9 (røyktest) og steg 10 (domenet flyttes).

Status: **godkjent av Anders 15.10** med anbefalingene i §5 (én betaler duo, gavekort for alle
tjenester, no-show belastes med overstyring, SMS utsettes). Steg 1 pågår i annen økt, steg 2 starter.

Kilder: Acuity-oppsettet lest på `akgolfgroup.as.me` 15.10 (offentlig side, ikke admin), og
koden i repoet lest samme dag (inventaret står i §2).

---

## 1. Det Acuity gjør for AK Golf i dag

Lest fra den offentlige bookingsiden:

- **Seks avtaletyper** i kategorien «Drop in - Privat Coaching»: Flex 20 min med Markus (300 kr),
  Flex 20 min (600 kr), Flex 50 min (1 500 kr), Flex Duo 50 min (1 700 kr), Flex 90 min
  (2 500 kr), Flex Duo 90 min (2 700 kr). Kalenderen heter «Gamle Fredrikstad Golfklubb -
  Anders Kristiansen».
- **Gavekort:** «Gavekort coaching m/ Anders», 1 500 kr, med handlevogn.
- **Vilkår på forsiden:** avbestilling og endring senest 24 timer før, ellers faktureres timen.
- **Tidsvelger:** tidssone kan byttes, luker hvert 20. minutt, «Flere tidspunkter», «Velg og
  legg til et nytt klokkeslett» (flere timer i én bestilling) og «Velg og gjør til gjentakende».
- **Skjema:** fornavn, etternavn, telefon med landkode, e-post (flere mottakere), avkrysning for
  vilkår og SMS-varsler. Deretter betaling.
- **Standard i Acuity, trolig i bruk:** bekreftelse og påminnelse på e-post og SMS, kundens egen
  lenke for å endre eller avbestille, kundeliste med historikk og notater, admin-kalender med
  blokkert tid, synk til Google-kalender, kuponger og pakker, no-show-merking.

Det Acuity **ikke** gir: kobling til PlayerHQ, klipp fra Performance-pakkene, booking for barn
med forelder som kjøper, og alt som gjør at timen lever videre som trening i appen.

---

## 2. Det bookingsystemet vårt har i dag

Lest i koden 15.10. Kort versjon av inventaret.

**På plass og låst med tester:** Stripe Checkout med slot-hold og idempotens, webhook som
bekrefter booking etter betaling, klippbooking fra Performance-pakkene, 24-timersregel med
automatisk refusjon når kunden avbestiller selv, bekreftelse og påminnelse på e-post (23 til 25
timer før), kundens egen avbestilling og flytting i PlayerHQ, Google-kalender begge veier
(push, opptatt-tid, og endringer i Google som flytter bookingen), dobbeltbookingsvern i
databasen, tjenester med maks deltakere, manuell booking fra AgencyOS, dagsplan og blokkert tid i
kalenderen, varsel til coach og admin ved ny booking, og sletting av gjestedata etter 365 dager.

**Den offentlige flyten er åpen** på `akgolf-hq.vercel.app/booking` (sjekket uten innlogging
15.10). Men akgolf.no peker til Acuity, så kundene bruker fortsatt Acuity.

**Delvis eller mangler** (det som må bygges):

| Område | Mangel | Alvor |
|---|---|---|
| Admin avlyser eller flytter | `cancelSession` og `moveSession` setter bare status. Kunden får ingen e-post, ingen refusjon, klipp gis ikke tilbake, Google-hendelsen blir stående. | Høy: dette er det coachen gjør oftest |
| Bookinglista i AgencyOS | Siste 300, uten søk og fritt filter. Detaljsiden har ingen handlinger. Notat kan ikke endres. | Høy |
| Tjenester | Kan bare redigeres på en gammel side utenfor AgencyOS, og bare navn, pris, varighet, aktiv. Sted, buffer, minste varsel, maks dager fram og kategori finnes ikke på tjenesten. Stedet gjettes ut fra navnet. | Høy |
| Tilgjengelighet | AgencyOS-fanen kan bare slå vinduer av og på. Opprette, endre og slette ligger på gammel side. Ingen buffer mellom timer, ingen egen fridag. | Høy |
| Gjest uten konto | Ingen lenke i e-posten for å endre eller avbestille. Acuity har det. | Høy |
| Duo-timer | Én deltaker per booking. Acuity selger Flex Duo i dag. | Høy |
| Gavekort | Finnes ikke. Acuity selger det i dag. | Middels |
| No-show | Finnes ikke som status. Bare masse-merking «gjennomført». | Middels |
| Endret time-e-post | Malen finnes, men kalles aldri. | Middels |
| Kundekort for gjester | Bare spillere med konto har historikk. | Middels |
| Flere timer i én bestilling, gjentakende | Finnes ikke. | Lav: Performance-pakkene dekker behovet |
| Kuponger, SMS, venteliste, intake-skjema, eksport, inntekt per tjeneste | Finnes ikke. | Lav til middels |
| Takk etter time (EP-05) | Finnes ikke. Vedtatt 27.09 (§BOOKING BEKREFTES AUTOMATISK). | Middels |
| Feil lenke | Admin-e-posten lenker til `/admin/bookings` (omdirigeres, men bør rettes). | Lav |

---

## 3. Hva «komplett» betyr (ferdigkriterier)

Bookingsystemet er komplett når coachen kan gjøre **alt** i AgencyOS uten å åpne en gammel side
eller Acuity, og kunden kan gjøre alt Acuity lot dem gjøre, i tillegg til det Acuity ikke kunne:

1. Opprette, endre og slå av tjenester, med sted, pris, varighet, antall deltakere, buffer og
   minste varsel.
2. Sette og endre egen tilgjengelighet, fridager og buffer.
3. Se, søke, filtrere, åpne, flytte, avlyse, merke gjennomført og no-show, og skrive notat på
   en booking. Flytting og avlysning varsler kunden og rydder betaling, klipp og Google.
4. Se kundekort med historikk for alle kunder, også gjester.
5. Kunden booker én eller to deltakere, betaler med kort, Apple Pay, klipp eller gavekort, får
   bekreftelse med kalenderfil, påminnelse, og kan endre eller avbestille fra en lenke i e-posten
   uten konto.
6. Alt er dekket av tester, og en ekte betalt booking er røyktestet i Stripe live.

Utenfor «komplett» til senere: SMS, venteliste, kuponger, intake-skjema, gjentakende booking,
eksport. Tas bare om Anders ber om det.

---

## 4. Plan — ti steg

Hvert steg er egen gren og PR, lagret etter hvert ferdig steg, grønn `npm run verify` før merge.
Designet følger utkast 1 for booking (BK-01 til BK-03 i PR #1317) og AG-05/AG-06 i Precision.
Databaseendringer er additive via `db execute` (gotchas §Database), aldri `migrate`.

| # | Steg | Ferdig når |
|---|---|---|
| 1 | **Flytt og avlys fra AgencyOS, riktig.** Én server-handling for flytting og én for avlysning (admin), som: varsler kunden (endret time-malen som finnes, og avbestillingsmalen), refunderer eller gir klipp tilbake etter 24-timersregelen med mulighet for coach til å overstyre, og oppdaterer Google. Kobles til kalenderarket og bookinglista. | Test låser at admin-avlysning gir e-post, refusjon og fjernet Google-hendelse. |
| 2 | **Tjenester i AgencyOS.** Nye felter på `ServiceType`: `locationId`, `bufferForMin`, `bufferEtterMin`, `minVarselTimer`, `maksDagerFram`, `kategori`. Skjema i AG-06-fanen «Tjenester og pris» med alt, også `maxDeltakere` og coach. Gammel side `/admin/services` sender videre. Stedet gjettes ikke lenger fra navnet. | De seks Acuity-tjenestene og Performance-pakkene er lagt inn med riktig sted og pris, uten kode. |
| 3 | **Tilgjengelighet i AgencyOS.** Opprette, endre og slette vinduer i fanen Tilgjengelighet, fridager (dato-unntak som fjerner tid), buffer per coach. Gammel side `/admin/availability` sender videre. | Coach setter en hel uke og en fridag uten å forlate AgencyOS, låst med test. |
| 4 | **Bookinglista og detaljsiden.** Søk på navn, e-post og telefon, filter på coach, tjeneste, sted, status og periode. Detaljsiden får handlingene fra steg 1, «Gjennomført», «No-show» (ny status `NO_SHOW`) og redigerbart notat. | Alle handlinger virker fra detaljsiden, låst med test. |
| 5 | **Gjest uten konto kan endre og avbestille.** Signert lenke med utløp i bekreftelses- og påminnelses-e-posten, til en side som viser bookingen og lar gjesten flytte (innenfor tilgjengelighet) eller avbestille etter 24-timersregelen. | Gjest flytter og avbestiller uten innlogging, låst med test. Lenken kan ikke gjettes. |
| 6 | **Duo og flere deltakere.** «Legg til deltaker» i BK-01 (navn, e-post), pris per tjeneste for duo, begge får bekreftelse. Bygger på `maxDeltakere` og `plassNr`. | Flex Duo 50 og 90 kan bookes med to navn, begge får e-post. |
| 7 | **Gavekort.** Produkt i Stripe, kode sendes på e-post til kjøper eller mottaker, innløses i BK-01-betalingssteget og i AgencyOS ved manuell booking. Restverdi følger koden. | Gavekort kjøpes, innløses delvis, og resten står igjen, låst med test. |
| 8 | **Kundekort og e-poster.** Kundekort i Stall for gjester (samlet på e-post), med historikk og notater. Takk-e-post (EP-05) som utkast til coach innen 24 timer, oppfølging (EP-06) etter 14 dager. Kalenderfil vedlagt bekreftelsen. Lenken `/admin/bookings` rettes. | Hvert punkt låst med test; e-postene følger utkastet i PR #1317. |
| 9 | **Rydding.** Gamle sider under `src/app/admin/(legacy)/` for services, availability, calendar og bookinger slettes når ingen kaller dem. E2E-testene for booking kjøres med `LOCAL_E2E=1` og `LOCAL_STRIPE_E2E=1` i CI eller dokumentert lokalt. | Ingen bookingfunksjon ligger utenfor AgencyOS. E2E er grønn og dokumentert. |
| 10 | **Røyktest i Stripe live.** Anders gjør ett ekte kjøp av hver type (kort, klipp, gavekort, duo), coachen flytter og avlyser én, alt sjekkes i AgencyOS, e-post og Google. Deretter refusjon. | Dokumentert i `docs/`. Først da kan nettstedsplanens steg 10 (domenet) gjøres. |

**Pågår alt (15.10):** grenen `claude/booking-avlys-flytt` (en annen økt) bygger steg 1: coach
avlyser med full refusjon, foreslår ny tid, betalingsmåte og avvisning som utkast. Steg 1 her
fullføres der; denne planen tar ikke over arbeidet, bare sjekker at ferdigkriteriet nås.

Rekkefølgen er valgt slik at det coachen gjør hver dag (steg 1 til 4) kommer først, det kunden
mangler fra Acuity (5 til 7) deretter, og det som gjør systemet bedre enn Acuity (8) til slutt.

---

## 5. Valg som trengs fra Anders

1. **Duo-prisen:** én betaler alt (som i Acuity, 1 700 og 2 700 kr), eller delt betaling?
   (Anbefalt: én betaler, som i dag. Delt betaling kan komme senere.)
2. **Gavekort:** bare for Anders (som i Acuity) eller for alle coacher og alle tjenester?
   (Anbefalt: alle tjenester, verdi i kroner, ikke bundet til én coach.)
3. **No-show:** skal kunden belastes etter 24-timersregelen når coachen merker no-show?
   (Anbefalt: ja, timen er alt betalt eller klippet trukket; coach kan overstyre og refundere.)
4. **SMS:** utsettes til etter lansering, eller må med? (Anbefalt: utsettes. E-post dekker, og SMS
   krever egen leverandør og samtykke.)
