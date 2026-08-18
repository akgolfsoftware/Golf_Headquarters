> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Sign-off-galleri — 11. august 2026

**Bilder tatt:** natt til 11.08 (10.08 kl. 23:00–23:07). App til venstre, Paper-fasit til høyre i samme bilde.
**Slik signerer du:** svar i chatten med `GODKJENN PP-x.y` eller `FIKS PP-x.y: <hva>` — én linje per skjerm holder.
**Teller:** 11 skjermer · **1 GODKJENN** · **10 FIKS FØRST**

Navn og tall SKAL avvike (testdata) — avvikene under gjelder kun layout, rekkefølge, CTA-farge, typografi og spacing.

---

## PP-1.1 · I dag (chat-hjem) · `/portal`

[Mobil 390](../../screenshots/paper/signoff/PP-1.1-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.1-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.1-m390-dark.png)

Avvik:
1. Toppen er fortsatt et kort med «Dagens økt»-pill + mikrofon; fasiten har flat header med tema-bryter (sol/måne) øverst til høyre.
2. Send-knappen er grå papirfly; fasiten har svart, rund pil-knapp. Composer ellers riktig (to linjer, mic før send, `/` og `@`, ENTER-linja).
3. Desktop: fasiten har mic + `/` + `@` INNE i composeren med svart «Send»-knapp; appen har mic/send flytende utenfor feltet.
4. Tom tilstand har fem veier videre (tre knapper + to lenker); Paper-prinsippet er én. (Kjent — venter på valg fra Anders.)
5. Mørk modus: OK, ingen lesbarhetskollisjoner.

**Anbefaling: FIKS FØRST** — header-kortet og send-knappen er strukturavvik; resten er nær fasit.

---

## PP-1.2 · Plan · `/portal/planlegge`

[Mobil 390](../../screenshots/paper/signoff/PP-1.2-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.2-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.2-m390-dark.png)

Avvik:
1. **Dagvelgeren er feil:** appen viser «SØN 10 · MAN 11 · …» — men 10. august 2026 ER mandag (appens egne andre skjermer sier «mandag 10. aug»). Uka starter på søndag OG dag-etikettene er forskjøvet én dag. Fasiten starter på MAN. Dette er en faktisk feil, ikke stil.
2. Eierskapsnotisen («Planen er din …») ligger som ren brødtekst; fasiten har den i grå notisboks med blyant-ikon.
3. «Book coachingtime» mangler «med Anders» (fasit-teksten).
4. Tema-bryter mangler i header.
5. «Sjekkpunkt»-raden i ukeoppsummeringen mangler — kjent åpent punkt (ingen datakilde), se PP-1-STATUS.

Ukeoppsummeringen som manglet 10.08 er nå på plass og matcher fasiten. Mørk modus OK.

**Anbefaling: FIKS FØRST** — punkt 1 alene er nok; en plan-skjerm som viser feil ukedag kan ikke signeres.

---

## PP-1.3 · Analyse · `/portal/analysere`

[Mobil 390](../../screenshots/paper/signoff/PP-1.3-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.3-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.3-m390-dark.png)

Avvik:
1. Informasjonsarkitektur: fasiten har ETT «SG total»-kort med de fire kategoribåndene (Tee/Innspill/Nærspill/Putt) inline; appen deler i to kort («Strokes Gained · Form» + «SG per kategori»).
2. Ekstra varselkort øverst («For lite putting-data …») med svart «Åpne putte-lab»-CTA FØR fanene — finnes ikke i fasiten, og gir to konkurrerende CTA-er (svart + oransje) på samme skjerm.
3. Fire faner («SG/Trening/Tester/Statistikk») mot fasitens tre («Strokes Gained/Trening/Tester»).
4. Disclaimer-notisen «Tallene er målinger, ikke karakterer …» mangler helt.
5. Seksjonsrekkefølge: fasit er SG total → Score → oransje CTA; appen har varsel → form → per kategori → Én ting nå → Score.

Mørk modus OK.

**Anbefaling: FIKS FØRST** — strukturen avviker fortsatt tydelig fra fasitens tre seksjoner. (Kjent åpen beslutning fra 10.08-galleriet.)

---

## PP-1.4 · Meg · `/portal/meg`

[Mobil 390](../../screenshots/paper/signoff/PP-1.4-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.4-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.4-m390-dark.png)

Avvik:
1. «Om deg» viser 2 felter og «Coach og program» mangler — men dette er **tomme testdata, ikke design** (bekreftet i PP-1-STATUS §Korreksjon: feltene finnes i koden og skjuler seg når de er tomme). Trenger seeding, ikke kodefiks.
2. Sesongmål-kortet har rosa gradientflate; Paper-flater er matte. Liten stilfiks.
3. Tema-bryter mangler i header (fasiten har måne-ikon).
4. «Én ting nå» har nå riktig clay-flate med venstre-strek — matcher fasiten.
5. Mørk modus OK, oransje CTA lesbar.

**Anbefaling: GODKJENN** — de reelle avvikene er testdata + to småting (gradient, tema-bryter) som kan tas som restfiks uten ny runde.

---

## PP-1.5 · Book time · `/portal/booking`

[Mobil 390](../../screenshots/paper/signoff/PP-1.5-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.5-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.5-m390-dark.png)

Avvik:
1. Abonnementskortet (Performance · pris · inkludert · brukt i august) mangler helt. (Kjent rest fra 10.08.)
2. Fasitens faste bunnhandling «Velg en dag» (med «Velg en dag med ledig tid» over) mangler; appen har «Se alle ledige tider» inne i et kort midt på siden i stedet.
3. Tilbakeknappen er grå pill med tekst «← Hjem»; fasiten har rund ikon-knapp med chevron.
4. Ekstra «Coacher»-seksjon nederst som ikke finnes i fasiten.
5. «Én ting nå» med klokkeslett i knappen («Ta tir 09:30») er på plass og matcher fasit-mønsteret. Mørk modus OK.

**Anbefaling: FIKS FØRST** — abonnementskortet og bunnhandlingen er fasit-seksjoner som mangler.

---

## PP-1.6 · Innlogging · `/auth/logg-inn`

[Mobil 390](../../screenshots/paper/signoff/PP-1.6-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.6-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.6-m390-dark.png)

Avvik:
1. «Hvor du havner»-seksjonen (AgencyOS/PlayerHQ/Foreldreportalen + «Du velger ikke selv …») mangler helt — det er halve fasit-siden.
2. Demo-chipsene («coach · player · guardian …») mangler.
3. Skjemaet ligger i et flytende hvitt kort med skygge; fasiten har flatt skjema rett på papirflaten, med «Vis» inne i passordfeltet.
4. Appen har elementer fasiten ikke har: «Fortsett med Google», «Fortsett med BankID», «Ny her? Opprett konto». (Funksjonelt villet? Se skjønnsspørsmål.)
5. Lenken «Jeg har fått en invitasjon» mangler.

Oransje «Logg inn»-knapp er nå på plass i begge. Mørk modus OK.

**Anbefaling: FIKS FØRST** — sidestrukturen avviker vesentlig fra fasiten.

---

## PP-1.7 · Offentlig booking · `/booking` (marketing)

[Mobil 390](../../screenshots/paper/signoff/PP-1.7-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-1.7-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-1.7-m390-dark.png)

**Korreksjon (natt, 01-tiden):** Første fotografering traff interimssiden fordi `BOOKING_PUBLIC`
kun er satt på Preview — prod viser bevisst interim til du åpner bookingen. Fasit-siden ER bygget
og merget (PR #391, klikk-verifisert 10.08). Bildene over er tatt på nytt mot preview og viser den
ekte Paper-bookingsiden (tjenestekort, fire steg, sticky handlingslinje).

Avvik (mot fasit, fra PR #391 — bevisste og dokumenterte):
1. «Svar 48 t» → «Bekreftelse straks» (appen bekrefter umiddelbart via Stripe).
2. «kr per spiller» → «kr» (ServiceType har ingen prisenhet-kolonne).
3. «Start abonnement» → «Ta kontakt om abonnement» (Stripe-abonnement åpnes ikke fra denne siden ennå).

**Anbefaling: GODKJENN** (de tre avvikene er vedtatt i PR #391). Selve lanseringsbryteren —
`BOOKING_PUBLIC` i prod + fjerning av Acuity-redirecten — er din morgenbeslutning, ikke et designavvik.

---

## PP-2.1 · Konsoll · `/admin/agencyos`

[Mobil 390](../../screenshots/paper/signoff/PP-2.1-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-2.1-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-2.1-m390-dark.png)

Ombyggingen fra oppslagstavle til samtale er landet — treffer fasiten godt i hovedstruktur (Én ting nå på clay-flate, Dagen din-logg, nøkkeltall, hvem-trenger-deg, AI-kø, artefaktkolonne på desktop).

Avvik:
1. Bunn-nav har seks faner inkl. «Mer»; fasiten har fem, med talls-badge på Innboks.
2. Composeren ligger i innholdsstrømmen på mobil; fasiten har den fast nederst over fanelinjen, med større felt.
3. Send-knappen er grå papirfly; fasiten har svart rund pil.
4. AI-resonneringsraden («viste 4 steg · 4,7 s») finnes ikke i appens svarstrøm.
5. «Én ting nå»-knappen er oransje «Gjør dette nå»; fasitens mobil viser SVART «Godkjenn» her (desktop-fasiten viser oransje) — fasiten spriker med seg selv, se skjønnsspørsmål.

Mørk modus OK.

**Anbefaling: FIKS FØRST (lett)** — punkt 1–3 er små, konkrete strukturfikser; deretter klar for godkjenning.

---

## PP-2.2 · Innboks · `/admin/innboks`

[Mobil 390](../../screenshots/paper/signoff/PP-2.2-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-2.2-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-2.2-m390-dark.png)

Liste + detaljpanel matcher fasiten godt på desktop (GJELDER/HVORFOR/GRUNNLAG-felter, Avvis + oransje «Godkjenn og send»). Layoutfeilen fra 10.08 (1681 px) er borte.

Avvik:
1. Mobil: fasiten har fast bunnstripe «Øverste ubehandlede sak: …» + oransje «Se grunnlaget og godkjenn»; appen har en grå «Se grunnlaget»-knapp i headeren og ingen oransje handling på skjermen.
2. Bunn-nav: seks faner med «Mer» mot fasitens fire/fem med badge på Innboks.
3. 30+ nesten identiske «Caddie-utkast (suggestDrillVideo)»-rader ligger ubatchet i listen — fasiten viser aggregerte saker. Teknisk sett data, men listen blir ubrukelig lang; trenger gruppering eller batching.
4. Radene ellers (ikon, tittel, chips, rød frist-tekst i mono) matcher fasiten.
5. Mørk modus OK.

**Anbefaling: FIKS FØRST (lett)** — mobil-CTA-en er fasitens viktigste grep på denne skjermen.

---

## PP-2.3 · Spillere · `/admin/spillere`

[Mobil 390](../../screenshots/paper/signoff/PP-2.3-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-2.3-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-2.3-m390-dark.png)

Avvik:
1. Grupperingen «Trenger deg nå / Følger planen / Hviler» mangler — appen viser KPI-fliser (Aktive/I rute/Trenger deg/Skylder) + flat liste. Dette er fasitens bærende idé på skjermen.
2. Søkefeltet («Søk på navn eller kategori») mangler.
3. SG TOTAL-kolonnen per spiller i listen mangler.
4. Fast oransje bunnhandling på mobil («Åpne Øyvind») mangler.
5. Filterchips avviker: fasiten filtrerer på program (Alle/AK Golf Academy/WANG/GFGK/Stille over 7 dager); appen har GRUPPE/STATUS/BETALING-rader.

(NB: testmiljøet har nesten tomme data her — men strukturavvikene over er uavhengige av data.) Mørk modus OK.

**Anbefaling: FIKS FØRST** — samsvarer med kjent status i PP-2-STATUS.

---

## PP-2.4 · Kalender · `/admin/kalender`

[Mobil 390](../../screenshots/paper/signoff/PP-2.4-m390.png) · [Desktop 1280](../../screenshots/paper/signoff/PP-2.4-d1280.png) · [Mørk](../../screenshots/paper/signoff/PP-2.4-m390-dark.png)

Belegg-tallene, Agenda-visningen og detaljkolonnen (desktop) som manglet er nå på plass. Krom-reduksjonen fra fem bånd er levert.

Avvik:
1. Kollisjonsløsningen er ikke synlig: fasiten har «Løs kollisjonen» (oransje, fast nederst på mobil) og «Flytt til 17:30–18:30» i detaljkolonnen; appen viser bare KOLLISJONER-flisen. Handlingsveien må demonstreres (velg kollisjonsavtalen i skjermbildet) eller bygges.
2. Ekstra topplinje med modulfaner (Uke/Bookinger/Tavle/Tilgjengelighet) finnes ikke i fasiten.
3. Filterchips: fasiten filtrerer på program (Alle/Akademi/WANG/GFGK/Ledige timer); appen har Alle/Anders Kristiansen.
4. Visning: fasiten åpner i Dag-visning med rekkefølgen Dag/Agenda/Uke/Måned; appen åpner i Uke med Dag/Uke/Måned/Agenda.
5. To sekundærknapper «Ny økt»/«Ny booking» øverst — fasiten har ingen handlinger i toppen (én-handling-prinsippet).

Mørk modus OK.

**Anbefaling: FIKS FØRST** — kollisjonsveien er skjermens hovedpoeng i fasiten og må bevises.

---

## Skjønnsspørsmål til Anders

1. **PP-1.1 tom tilstand:** fem veier videre i dag — hvilken ÉN skal stå? (Fasit-prinsippet er én primær.)
2. **PP-1.6 Google/BankID + «Opprett konto»:** fasiten har dem ikke. Skal de beholdes (funksjonelt behov) og fasiten oppdateres, eller fjernes fra skjermen?
3. **PP-2.1 Godkjenn-knappens farge:** fasitens mobil viser svart «Godkjenn», fasitens desktop viser oransje «Godkjenn ukeplan». Appen bruker oransje. Hvilken gjelder? (Påvirker maks-én-oransje-regelen.)
4. **PP-1.7:** fasit-siden er bygget (#391) og ligger bak `BOOKING_PUBLIC` (kun Preview). Morgenbeslutning: sett flagget i prod + fjern Acuity-redirecten når du åpner bookingen.
5. **PP-1.2 «Sjekkpunkt»-raden:** ingen datert sjekkpunkt-kilde i databasen. Hva ER et sjekkpunkt som data (dato + område)? Uten svar forblir raden utelatt.
6. **PP-2.2 Caddie-flommen:** skal like AI-utkast batches til én sak per spiller/tema? Fasiten antyder aggregering, men sier det ikke eksplisitt.
