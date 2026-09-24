# AK Golf HQ — Prosjekt- og lanseringsplan

Dato: 24. september 2026  
Status: Oppdatert masterplan etter fullført teknisk oppgradering (gren `antigravity-forbedring`, commit `064fb2106`)  
Forretningsansvarlig: Anders Kristiansen, CEO i AK Golf Group AS  

---

## 1. Kommersiell visjon og forretningsmodell

AK Golf HQ bygges for å bli verdens ledende coaching- og treningsplattform for seriøse golfspillere og trenere.

### 1.1 Inngangsporten: Norges Golfforbund (NGF) og Team Norway
* **Målgruppe:** De cirka 1 000 aktive konkurransejuniorene i Norge (Srixon Tour, Narvesen Tour, WANG Toppidrett, NTG og forbundsgrupper).
* **Tilbud:** Forbundsmodell til **199 kr/mnd** (`PLAYERHQ_JUNIOR_MND`). En rimelig månedssum som foreldre og spillere enkelt aksepterer, med en verdi som langt overgår konkurrentene.
* **Verdiproposisjon:**
  * Komplett teknisk plan fra P1 til P10 (MORAD-standard) med automatisk milepælsbekreftelse fra TrackMan.
  * Live-registrering på treningsfeltet med Whisper tale-til-tekst.
  * Vår egen forbedrede versjon av UpGame: statistikk og rundelogg med putting i fot og registrering av planlagt landingsmål mot flagg.
  * Automatisk synkronisering av historiske resultater fra GolfBox, NGF og den internasjonale amatørrankingen (WAGR).
  * 6-ukers periodisert fysisk styrketrening (FYS) med automatisk beregning av belastning og 1RM.

---

## 2. Nåstatus: Hva som er 100 % ferdig bygget og testet

Per 24. september 2026 er kodebasen fullt kvalitetssikret med **3 445 automatiserte tester bestått** og alle kvalitetsgater grønne:

### 2.1 Teknisk Plan: P1 til P10, dra-og-slipp og øvelsesbank
* **MORAD P1 til P10:** Full struktur fra P1.0 (Adresse) til P10.0 (Finish).
* **Dra-og-slipp prioritering:** Ekte sortering (`@dnd-kit/sortable`) der trener og spiller kan ta tak i gripehåndtaket og dra arbeidsoppgaver opp og ned innen hver posisjon. Lagres umiddelbart til databasen.
* **Rik oppgavebeskrivelse:** Støtte for videoopplasting, direkte videolenker (YouTube/Vimeo-embed eller MP4) og bildelenker.
* **Øvelsesbank-kobling:** Søk i øvelsesbanken direkte fra oppgaveskjemaet, og tilknytting av system- og egne drills.
* **Rep-mål per hastighet:** Separate måltall for tørrtrening uten ball (*DRY*), lav hastighet (*LAV*) og full fart med ball (*FULL / AUTO*), for eksempel 1 000 reps på hver.
* **«Start økt på oppgaven»:** Ett-klikks oppstart som låser live-økta til oppgaven. Repetisjoner logget i økta overføres automatisk til den tekniske planen.

### 2.2 TrackMan og Satellitt-dispersjon
* **Svingleveringsvinkler:** CSV- og rapportimport leser og lagrer svingbane (*club path*), bladvinkel (*face angle*), blad mot bane (*face to path*), angrepsvinkel (*attack angle*), utgangsvinkel og spinn.
* **2-spors milepælsbekreftelse:** Når TrackMan-tall importeres, oppdateres svingmålene automatisk. Oppnås målene samtidig som repsmålet er nådd, settes oppgaven til ferdig.
* **Satellitt-dispersjonskart:** Naturtro spredningskart i UpGame-stil med satellittgress, fargekodede slag (grønn/gul/rød), 1σ- og 2σ-spredningsellipser og rødt siktepunkt.

### 2.3 Live-økt og Whisper tale-til-tekst
* **Range-opptaker (`VoiceRangeRecorder`):** Mikrofonknapp som transkriberer tale via Whisper og trekker ut kølle, P-posisjon og reps automatisk.
* **Fleksibel live-økt:** Mulighet til å legge til, bytte og fjerne øvelser midt i økta, samt sende notater direkte til trenerens innboks.

### 2.4 UpGame Rundelogg
* **Puttingavstand i fot:** Hurtigknapper for 3, 6, 10, 15, 25 og 40 fot, med lagring i meter bak kulissene.
* **Mål vs Flagg (Target vs Pin):** Eget felt for planlagt landingsavstand mot faktisk pinneplassering.
* **Sanntids slaglengde:** Regner automatisk ut slaglengde i meter idet neste ballposisjon velges.

### 2.5 FYS: 6-ukers styrkeprogram
* **Periodisering:** Beregner belastning og kg for Markløft, Benkpress og Knebøy basert på testbatteri og kroppsvekt.
* **Epley-formel:** Trygg estimering av 1RM fra 3RM- og 5RM-sett uten behov for maksløft.

### 2.6 Automatisk turneringsinnhenting
* Profiler kobles automatisk mot offentlige resultater i GolfBox, NGF og WAGR ved onboarding og profilendring.

### 2.7 AgencyOS: Trener-automatiseringer
* **Stallhelsekontroll (`runStallHealthCheck`):** Overvåker stagnerende oppgaver (>14 dager), bekrefter TrackMan-milepæler og minner om kommende turneringer.

---

## 3. Lanseringsplan i 4 faser

### Fase 1: Lukket pilot (Uke 39–40 · Nå)
* **Formål:** Verifisere helheten i felt med et utvalg spillere og trenere fra WANG Toppidrett og Team Norway.
* **Oppgaver:**
  1. Kjøre gjennom teknisk plan og live-økt på mobil (iPhone 390 px) på driving rangen.
  2. Teste Whisper taleopptak i vind og med bakgrunnsstøy fra baller.
  3. Importere TrackMan-økter fra innendørs radarer og verifisere automatisk milepælsevaluering.
  4. Finpusse oppgave-rekkefølge med den nye dra-og-slipp-funksjonen.

### Fase 2: Kommersiell lansering mot konkurransejuniorer (Uke 41–43)
* **Formål:** Rulle ut tilbudet om 199 kr/mnd til Norges ~1 000 konkurransejuniorer via NGF-samarbeid og Team Norway.
* **Oppgaver:**
  1. Åpne landingssiden for juniorer (`/junior`) med Stripe-betaling for månedsabonnement.
  2. Sende ut velkomst- og onboardinglenke via trenere og forbundskanaler.
  3. Automatisk hente spillernes historiske turneringsresultater idet de logger inn.
  4. Sikre at foresatte godkjenner samtykke i tråd med personvernreglene for idrettsutøvere.

### Fase 3: Direktebooking og Forelderportal (Uke 44–46)
* **Formål:** Fjerne avhengigheten av eksterne verktøy (Acuity) og la foreldre administrere betaling for juniorene.
* **Oppgaver:**
  1. Lansere den integrerte bookingreisen i det nye designspråket (`/booking` og `/portal/booking`).
  2. Åpne Forelderportalen (`/forelder`) slik at foresatte kan se barnas planer, booke privattimer og betale fakturaer samlet.
  3. Knytte coach-tilgjengelighet og kalendersynk direkte mot treningsplanleggeren.

### Fase 4: Full offentlig lansering (Uke 47+)
* **Formål:** Åpne AK Golf HQ for alle norske og internasjonale spillere, akademier og proer.
* **Oppgaver:**
  1. Lansere AgencyOS for eksterne trenere som vil administrere egne staller.
  2. Markedsføringskampanje mot klubber og trenere.
  3. Løpende oppfølging av stabilitet, ytelse og automatisk sikkerhetskopiering.

---

## 4. Kvalitetskontroll og driftskrav

1. **Ingen kodeendring uten grønne porter:** Alle endringer skal passere `npm run verify` (typekontroll, linter, sikkerhets- og kontrasttester samt 3 445 enhetstester).
2. **Design-konsistens:** Alt nytt arbeid følger AK Golf Design System. Ingen hardkodede farger eller stiler utenfor token-systemet.
3. **Data og personvern:** Persondata og junior-informasjon håndteres strengt i henhold til GDPR. Ingen persondata i offentlige logger eller eksterne sky-prompts.
4. **Trygg publisering:** Koden vedlikeholdes på kontrollerte arbeidsgrener. Deploy og produksjonsmigreringer utføres kun etter uttrykkelig bestilling fra Anders.
