# Prompt til Claude Design — Team Norway Workdesk

Lim inn alt under linjen i Claude Design, i prosjektet som har Train-lock-
designsystemet: https://claude.ai/design/p/a03bf94a-c923-4c04-82ff-415773557e37?via=share

---

Du skal tegne alle skjermene i **Team Norway Workdesk** for AK Golf HQ. Bruk
designsystemet i dette prosjektet (Train-lock) som eneste fasit for utseende.
Skriv all skjermtekst på **norsk bokmål**. Ingen emojier, ingen lorem ipsum.

## 1. Hva produktet er

Team Norway Workdesk er arbeidsområdet til trenerne i Team Norway (Norges
Golfforbunds toppidrettssatsing). Det **erstatter Messenger-grupper, e-post og
Word/Excel**. Trenerne er travle folk som jobber fra mobil, ofte stående på et
treningsfelt eller på reise. Anders Kristiansen (sportssjef, AK Golf Group) eier
plattformen; Team Norway er pilotkunde høsten 2026 med 2–5 trenere.

Spillerne er unge golfspillere, mange under 18. Foreldre har innsyn. Dette er
ikke et sosialt nettverk — det er et arbeidsverktøy med sporbarhet.

## 2. Låste produktregler (må styre designet)

1. **Poster, ikke chat.** Det finnes ingen fri chat noe sted. En trener
   publiserer poster til en gruppe eller til én enkelt spiller. Poster kan ha
   tekst, bilde, video, lenke og vedlegg (flybilletter, hotellreservasjoner,
   uttakskriterier). Spilleren kan svare på en post, men det er en tråd under en
   post — aldri en meldingsboks.
2. **1:1-post til mindreårig er alltid synlig for forelder.** Dette skal stå
   synlig i komponisten før posten sendes, ikke gjemt i innstillinger.
3. **Dokumenter har lesekvittering.** «12 av 14 har åpnet uttakskriteriene» og
   «Sist oppdatert 24. august».
4. **Testprotokoller deles på tvers av AK Golf, WANG og Team Norway.** En
   protokoll opprettes én gang. Den er **versjonert og låses ved første bruk** —
   resultater peker på versjonen; en endring gir en ny versjon;
   eierorganisasjonen endrer, delte mottakere bruker. Versjonen skal være synlig
   overalt hvor et testresultat vises.
5. **Deling skjer i to trinn per organisasjon, aldri flere:**
   - Trinn 1 (gratis): tester + turneringer + statistikk.
   - Trinn 2 (krever betalt PlayerHQ): komplett profil — treningsplan, TrackMan,
     analyse, fremgang.
   Spilleren, eller forelder for mindreårige, styrer trinnet og kan trekke det
   når som helst. Skjermene må skille tydelig mellom **«ikke delt med deg»** og
   **«ikke målt»**. De to skal aldri se like ut.
6. **TruthLayer:** hvert eneste tall om et menneske vises med **dato og kilde**.
   Er tallet et estimat, står ordet «estimat» ved siden av. Har vi ikke tallet,
   står det «mangler» — aldri en gjetning, aldri en tom strek som ser ut som
   null.
7. **Trener godkjenner alt som forlater huset.** Systemet kan forberede, sortere
   og skrive utkast, men aldri sende, publisere eller dele av seg selv.
8. **Ingenting som identifiserer ekte mindreårige.** Bruk oppdiktede navn i
   tegningene. Demo-spilleren heter Øyvind Rohjan; ellers bruk vanlige norske
   fornavn + etternavn du finner på.
9. **Ikke tegn:** fri chat, rangering av spillere mot hverandre vist til spiller
   eller forelder, prognoser/odds, skolekarakterer, regionkart, kolonner med
   påfunne tall der vi ikke har data.

## 3. Merkevare

Train-lock er fasit for alt utseende. Team Norway-rødt `#D50431` brukes **kun**
på logoen og på selve navigasjonsskinnen — aldri som statusfarge, aldri på
knapper, aldri i grafer. Bruk en enkel plassholder-logo («Team Norway»-ordmerke i
hvitt/rødt); det endelige brandingsystemet kommer senere.

## 4. Designverdier (bruk disse eksakt)

Mørk er hovedvarianten. Lys er samme geometri med inverterte flater.

**Mørk:** scene `#000000` · kort/ark `#161616` · dock/rail/felt `#1C1C1E` ·
hårlinje `#FFFFFF14` · dim `#2C2C2E` · tekst `#F5F5F5` · dempet tekst `#8E8E93` ·
primærhandling fyll `#FFFFFF` på `#000000` tekst.

**Lys:** scene `#FFFFFF` · kort `#F2F2F2` · dock `#E9E9EB` · hårlinje `#00000014` ·
dim `#DDDDDE` · tekst `#111111` · dempet `#6E6E73` · primærhandling `#000000` med
hvit tekst.

**Felles i begge:** avatar `#B08968` · warm `#B85C3D` (fullført = warm hake/ring,
aldri grønn) · warn `#FFD60A` (varsel som ikke sperrer) · danger `#FF453A` /
`#FF3B30` (bare ekte feil) · ok-grønn `#30D158` **kun** på «Godta» og
PUBLISERT-merket.

**Geometri:** kort/ark radius 20 · piller 999 · rader 12 · felt 16 · ark 20 20 0 0.
Avstander 8 / 12 / 16 / 20. Treffmål minimum 44 px, primærknapp 48 px.
Mac-rail 232 px med tekst. Høyre panel 380 px.

**Typografi:** Poppins (sans) og IBM Plex Mono (tall i tabeller der det trengs).
Titler 34/700 (tracking −0.02em) · korttall 26/700 · knapp 16/700 · brødtekst
15/600 · meta 13/400 dempet · versal-etikett 11/600 med tracking 0.08em. Store
nøkkeltall 56–104/700. Alle tall bruker tabular-nums.

**Tilstand uttrykkes som opasitet, ikke som farge:** negativ verdi 0.4 · uteligger
0.45 · dempet rad 0.5 · sekundært kort 0.55.

## 5. Skjermene som skal tegnes

Tegn hver skjerm som egen artboard. Navngi dem med koden foran, f.eks.
«TN-04 Poster gruppe — mobil mørk».

**TN-01 Hjem.** Det trener møter først. Øverst: hva som krever ham nå (poster som
venter på svar, dokumenter uten kvittering, samtykker som mangler). Under: neste
samling med dato, sted og deltakerantall. Skal kunne skannes stående på et
treningsfelt.

**TN-02 Gruppe / spillerliste.** Rad per spiller: navn, siste aktivitet, hvilket
delingstrinn spilleren har gitt Team Norway, og én varselprikk (fylt = trenger
deg, åpen = følg med, ingen = alt i orden). Ingen tallvegg i lista — detaljer bor
i spillerkortet.

**TN-03 Spiller-ark.** Åpnes fra lista. Viser kun det spilleren faktisk har delt.
Testresultater med protokollversjon, dato og kilde. Turneringshistorikk. Er trinn
2 ikke delt, vises et tydelig, rolig felt: «Treningsplan og analyse er ikke delt
med Team Norway» — ikke en feilmelding, ikke en oppsalgsplakat.

**TN-04 Poster — gruppestrøm.** Kronologisk liste over poster i gruppen, med
vedleggsmerker, hvem som har lest, og svar-tråder som er kollapset som standard.

**TN-05 Ny post.** Velg mottaker (hele gruppen eller én spiller), skriv, legg ved
fil/bilde/video/lenke. Primærknappen er «Publiser» og skal alltid kreve et bevisst
trykk. Vis hvem posten når, i klartekst, over knappen.

**TN-06 Ny post til én mindreårig spiller.** Samme skjerm som TN-05, men med et
synlig felt: «Denne posten er synlig for foresatt (åpenhetsprinsippet).» Tegn
denne som egen artboard, ikke som variant i teksten.

**TN-07 Dokumenter.** Liste per gruppe: filnavn, sist oppdatert, og kvittering
som tall («12 av 14 har åpnet»). Sorterbar på det som mangler kvittering.

**TN-08 Dokument-detalj.** Selve fila + hvem som har åpnet og hvem som ikke har.
Handling «Purre de som mangler» — men den skal se ut som noe treneren bekrefter,
ikke noe systemet gjør selv.

**TN-09 Testprotokoller.** Bibliotek over delte protokoller. Per rad: navn, hvilken
organisasjon som eier den (AK Golf / WANG / Team Norway), gjeldende versjon, og om
den er låst.

**TN-10 Protokoll-detalj med versjonshistorikk.** Steg i protokollen, versjonsliste
med dato og hvem som endret, og dialogen for «Lag ny versjon» som forklarer i
klartekst at gamle resultater blir liggende på den gamle versjonen.

**TN-11 Testføring på testdag.** Hovedcaset er fysiske tester der 10+ spillere tar
samme øvelse etter tur. Flyt: velg protokoll → før spiller for spiller i kø, med
stort inntastingsfelt, tydelig «neste spiller», og oversikt over hvem som gjenstår.
Skal fungere med én hånd på mobil.

**TN-12 Testresultater for gruppen.** Tabell per protokoll, med versjonsmerke,
dato og kilde. Manglende resultat står som «mangler», aldri som 0.

**TN-13 Samling.** Program time for time, deltakerliste med oppmøte, og
reisedokumenter som vedlegg. Dette er skjermen som skal erstatte
Word-dokumentet som i dag sendes på e-post.

**TN-14 Kartlegging.** Landskapsbilde av norsk juniorgolf: antall turneringer,
antall spillere og antall deltakelser per år. Bruk disse ekte, målte tallene:
2018 → 187 turneringer, 1 989 spillere, 10 705 deltakelser; 2026 → 177
turneringer, 2 984 spillere, 13 212 deltakelser. **Rett under grafen skal det stå
en advarsel som ikke kan overses:** veksten i U19 (328 i 2024 → 1 006 i 2025)
skyldes at en ny datakilde kom inn, ikke at det ble flere spillere; volumveksten
oppgis som +24,3 % målt på én kilde. Tegn også de blokkerte dimensjonene —
klubbfordeling og lenker per turnering — som ærlige «ikke tilgjengelig ennå»-felt,
ikke som utfylte eksempler.

**TN-15 Innsikt per spiller.** Kun tilgjengelig når spilleren har delt trinn 2.
Svarer på: utvikler spilleren seg raskt nok målt mot seg selv, og er gapet mellom
turneringsscore og treningsnivå på vei opp eller ned. Ingen sammenligning mot
andre navngitte spillere.

**TN-16 Tilgang og samtykke.** Hvem har konto i Team Norway-flaten, hvilke grupper
de ser, og hva de får se. Inviter ny trener. Per spiller: hvilket trinn som er
delt, hvem som ga samtykket (spiller selv eller foresatt), og når.

**TN-17 Spillerens Team Norway-flate (i PlayerHQ).** To brytere: trinn 1 og trinn
2, med klartekst om hva hver av dem gir Team Norway innsyn i, og en «trekk
tilbake»-vei som ikke er gjemt. Under: poster fra Team Norway.

**TN-18 Forelderens flate.** Samtykke på vegne av barnet, og de 1:1-postene barnet
har fått fra treneren.

**TN-19 Lisens.** Team Norway betaler spillerlisensene, ikke plattformen. Vis
antall lisenser, hvilke spillere de dekker, og at piloten 2026/27 er gratis med
overgang til betalt fra 2027. Dette skal stå åpent, ikke som liten skrift.

**TN-20 Innlogging og onboarding for ny TN-trener.** Innlogging, deretter et kort
oppstartsløp: hvilke grupper du har fått, hva du har lov til å se, hvordan poster
fungerer. Maks tre steg.

## 6. Varianter per skjerm

- **Mobil 390 px, mørk:** alle 20 skjermene. Dette er den viktigste visningen.
- **Mac 1440 px, mørk:** TN-01, TN-02, TN-03, TN-04, TN-07, TN-08, TN-09, TN-10,
  TN-12, TN-13, TN-14, TN-16. På Mac brukes 232 px rail med tekst til venstre, og
  master–detalj med 380 px panel til høyre der skjermen har en detaljvisning.
- **Lys variant:** TN-01, TN-02, TN-04, TN-07, TN-11 og TN-14 — mobil og Mac.
- **Tomme tilstander (egne artboards):** TN-01 uten noe som venter, TN-04 uten
  poster, TN-07 uten dokumenter, TN-12 før første testdag, TN-16 uten samtykker.
  Den tomme tilstanden er den treneren møter oftest når arbeidet er unnagjort —
  den skal se rolig og ferdig ut, ikke ødelagt.
- **Feiltilstander:** én artboard som viser hvordan «kunne ikke laste» og «du har
  ikke tilgang til denne gruppen» ser ut.

## 7. Navigasjon

Fem faste destinasjoner, identiske på mobil og Mac:
**Hjem · Spillere · Poster · Dokumenter · Tester.**
Samling, Kartlegging, Tilgang og Lisens er rader inne i disse — aldri egne faner.
Regelen er én adresse per funksjon: finnes en funksjon to steder, er det feil.

## 8. Leveranse

Legg alle artboards på ett lerret, gruppert per skjerm med mobil og Mac ved siden
av hverandre. Skriv skjermkoden (TN-01 osv.) som etikett over hver artboard.
Tall som ikke er hentet fra kartleggingsdelen over, merkes som eksempeltall.
