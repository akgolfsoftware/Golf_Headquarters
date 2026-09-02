# Bestilling: TN-Workdesk batch 2 — de fem TN-egne rutene + testkjernen

Skrevet 30.08.2026, oppdatert samme dag etter tilkobling til det levende prosjektet.
Skal limes inn i Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
(`a03bf94a-c923-4c04-82ff-415773557e37`), ikke i et nytt prosjekt.

**Merk:** `templates/tn-workdesk/TnBatch1.dc.html` er ikke tom slik zip-speilet antyder. Den
inneholder tre skjermer tegnet i **Train-lock mørk** — feil stil per Anders' beslutning
30.08.2026. De tegnes om som del av denne batchen, se TN-00 under.

---

## LIM INN FRA OG MED HER

Fortsett i dette designsystemet. Ikke start på nytt, ikke tegn nye tokens, ikke innfør en ny
stil. `readme.md` og `tokens/` er fasit — **ikke `SKILL.md`**, som er fra en tidligere
generasjon av dette prosjektet og motsier både readme og tokens (den sier «ingen skygger,
ingen piller» og oppgir Jost + Public Sans; systemet har tre skyggenivåer, `--radius-full`,
Schibsted Grotesk og IBM Plex Mono). Bygg etter tokens.

Du har allerede tegnet årsplan, periodeplan, samling, workbench, grupper, tester, kalender,
utøverdashboard, evaluering og presentasjon. Denne bestillingen er de skjermene som gjenstår
for at Team Norway-trenere kan legge bort Messenger, e-post og Word.

## Konteksten som styrer alt i denne batchen

**Ett testbibliotek, én resultatbase.** AK Golf Academy, WANG Toppidrett Fredrikstad og Team
Norway deler protokollene og målingene. En protokoll opprettes én gang, er versjonert, og
**låses ved første bruk** — et resultat peker alltid på versjonen det ble målt med. Endrer
eieren protokollen, blir det versjon 2; gamle målinger flytter seg ikke. Et resultat følger
spilleren, ikke organisasjonen: måler Anders en test på WANG, ser TN-treneren samme måling —
hvis spilleren, eller foresatt for mindreårige, har samtykket.

Tre ting må være avlesbare uten forklaring på hver skjerm som viser et testtall: hvilken
organisasjon som **eier** protokollen, hvilken **versjon** målingen er gjort med, og hvem som
**kan se** den.

**TruthLayer.** Alt systemet påstår om et menneske skal kunne spores til en måling med dato og
kilde. Estimerte tall merkes eksplisitt som estimat. Praktisk: hvert tall har plass til en
kildelinje — «Målt 14.08.2026 · TN-batteri Q3 v2 · Anders K.». Et tall uten plass til kilden er
et designfeil, ikke en detalj.

**Systemet konkluderer aldri.** Uttak er alltid underlag. Coach-vurderingen heter «vurdering»,
aldri «karakterer»; skolens karakterer finnes ikke i dette produktet.

## Skjermene

### TN-00 · Tegn om de tre eksisterende Workdesk-skjermene
`templates/tn-workdesk/TnBatch1.dc.html` inneholder TN-01 Hjem, TN-02 Gruppe/spillerliste og
TN-03 Spiller-ark, tegnet i Train-lock mørk (svart flate, Poppins, rail 232px). Anders har
besluttet at Team Norways egne skjermer følger dette designsystemet, ikke Train-lock. Tegn de
tre om i Claw-stil: lys flate, Schibsted Grotesk, navy `#012B5D`, merkevarerød `#D70232` kun på
logo, skinne og «denne utøveren». Behold informasjonsarkitekturen — den er god. Det er formen
som skal endres, ikke innholdet.

De fem TN-egne rutene er hentet fra faktisk kode (`CoachShell.tsx` i `akgolfsoftware/talenthq`),
ikke rekonstruert. Menyens gruppestruktur er **Daglig · Uttak · Skoler · Data**.

### TN-01 · Organisasjonsskall
`templates/app/` er for tynn til å bygge på. Tegn skallet ordentlig: TN-logo på hvit plate,
navigasjonen i sine fire grupper, hvilken gruppe brukeren står i, og hvordan man bytter mellom
gruppene man har tilgang til. Piloten høsten 2026 er Anders + 2–5 TN-trenere med tilgang **kun
til egne grupper** — skallet må gjøre det tydelig hvilket avgrenset utsnitt du ser.
Mac 1440 og mobil 390. Skinnen er eneste sted merkevarerød opptrer utenfor logoen.

### TN-02 · Oversikt (`/team-norway`)
Landingsflaten. **Dekningsgrad-kortet er obligatorisk her** — «4 av 11 med profil» — og skal
være det første øyet finner, fordi det er tallet som forteller om satsingen faktisk har data å
jobbe med. Under: hva som krever meg nå, kommende samlinger, siste testperiode, siste poster.
Ikke en dashbordvegg — dette skannes stående på treningsfeltet.
Tom tilstand: ingen spillere har samtykket ennå. Den må forklare hvorfor uten å se ut som feil.

### TN-03 · Fellestesting (`/team-norway/fellestesting`) — batchens viktigste skjerm
Dette er det ekte skjermgapet. Én trener fører mange spillere gjennom **samme** protokoll på en
testdag. Flyt: velg protokoll → velg gruppe → før spiller for spiller i kø.

Fysiske tester er primærcase: 10+ utøvere etter tur på samme øvelse. Skjermen må fungere med
telefonen i én hånd ute: stort inntastingsfelt, tydelig hvem som står for tur, hvem som er ført,
hvem som gjenstår, og en rolig vei tilbake for å rette. Ingen dialogboks som stjeler fokus
mellom hver utøver. Ingen bekreftelsessteg som må trykkes bort ti ganger.

Tre arketyper av protokoll må dekkes, pluss PEI:
- **Port** — bestått/ikke bestått per forsøk (Putt Gate, Driver Gate, Nærspill Gate, Wedge Gate,
  VISA Express)
- **Tall** — én måleverdi (Clubhead Speed, Stille lengde, Benkpress, Trapbarmarkløft)
- **Stige** — flere steg med økende krav (Putt Speed Control, 8-Ball Variation)
- **PEI** — nærhet delt på lengde. **Lavere er bedre.** Tegn den slik at ingen tror høyere er
  bedre.

Tegn mobil 390 først og grundigst. Mac 1440 etter.

### TN-04 · Testprotokollbibliotek (delt)
Alle protokollene, gruppert etter område. Per rad: navn, **eierorganisasjon**, gjeldende
versjon, hvilke organisasjoner som bruker den, sist brukt. Søk og filter på organisasjon og
område. Dette er skjermen som gjør delingen forståelig — en TN-trener skal se på ett blikk at
«Benkpress» eies av AK Golf og brukes av alle tre.

Merk et tallsprik du skal vise, ikke skjule: kildene oppgir 16 TN-protokoller i talenthq mot
«11 tester × 3 kjøringer» i AK Golf HQ. Tegn plass til en linje som sier hvilket batteri en
protokoll tilhører, så spriket blir synlig i stedet for skjult.

### TN-05 · Protokolldetalj med versjonshistorikk og attestering
Hva protokollen måler, stegene, gjeldende versjon, versjonshistorikk med låsedato, hvor mange
målinger som ligger på hver versjon, og hvilke organisasjoner som bruker den.
Handling for eieren: «Ny versjon». Handling for en mottakerorganisasjon: ingen — bare bruk.
Gjør den forskjellen synlig i selve designet, ikke i en hjelpetekst.
Attestering: hvem som var vitne til målingen, og tilstandene venter / attestert / avvist.

### TN-06 · Uttaksliste (`/team-norway/uttak`)
Vurderingsmatrisen. Kriteriene er **Resultater · Prestasjoner · Prosess/adferd** — bruk dem
ordrett. To harde regler som må være synlige i designet, ikke bare i en fotnote:
systemet konkluderer aldri, og uttak er alltid underlag for en menneskelig beslutning.
Ingen totalscore som ser ut som en dom. Hver rad skal kunne åpnes til hva vurderingen bygger på,
med dato og kilde.

### TN-07 · Rangliste (`/team-norway/view`)
Rangering på målte størrelser, med kildelinje per tall og tydelig hva som rangeres på og for
hvilken periode. Merkevarerød brukes her til å markere «denne utøveren» — aldri som status,
aldri som varsel. Kohort-sammenligning er trenerens verktøy: denne skjermen finnes ikke på
spillerens eller forelderens flate.

### TN-08 · Skoleoversikt (`/team-norway/skoler`)
Toppidrettsgymnasene og hvor mange TN-utøvere hver har, med dekningsgrad per skole. WANG
Toppidrett Fredrikstad er én av dem. Ingen navngitte mindreårige på en flate som kan deles ut
av rommet — aggregat på skolenivå, navn først når man går inn i en gruppe man har tilgang til.

## Slik leveres hver skjerm

1. Mac 1440 — suksess
2. Mobil 390 — **suksess, tom, laster, feil**
3. Kort designnotat: hvilken beslutning skjermen løser, hvilke tall som er eksempler, hva du var
   usikker på

Mørk flate brukes kun der systemet allerede bruker den — hero og seksjonsskille. Skjema og
tabell er lyse. Ikke lag en mørk variant av disse skjermene.

## Regler som ikke kan brytes

- **Merkevarerød `#D70232` er identitet:** logo, skinne, «denne utøveren» i data. Status bruker
  `#C2352B` sammen med grønn og ravgul. Et rødt element skal aldri kunne feiltolkes som advarsel.
- **Ingen emoji.** Systemet har ikke noe ikonsett ennå — trenger en skjerm ikoner, bruk Lucide
  og si det i designnotatet.
- **Ingen lorem ipsum.** Ekte norsk skjermtekst overalt.
- **Ingen mindreårige ved navn** på flater som kan nås uten innlogging.
- **Ingen nye tokens.** Mangler du en verdi, skriv det i designnotatet framfor å finne på en.
- **«TN-batteri Q3»**, aldri «PEI Q3 · X av 8 stasjoner».
- **«Vurdering»**, aldri «karakterer».
- Periodisering: **GRUNN** uke 44–11 · **SPES** uke 12–16 · **TURN** uke 17–42 · test/eval uke
  43. TN-testperiode uke 34–36. Periodegrensene er fortsatt uavklarte i kildene — behold
  uke 11/12 og la punktet stå åpent.
- Pyramiden i kanoniske kortformer: **FYS → TEK → SLAG → SPILL → TURN**.
- De fem TN-prosessene: Strategisk · Teknisk · Fysisk · Mentalt · Sosialt.

## Ikke design dette i denne batchen

- Fri chat mellom trener og spiller — kommunikasjon er poster, og kommer i batch 3
- Innlogging, betaling, kontoadministrasjon
- Skolens administrasjon: karakterer, fravær, disiplinærsaker
- Kartlegging av norsk juniorgolf — venter på Anders' MD-fil med turneringer og lenker

## Start med

TN-03 Fellestesting. Det er skjermen som ikke finnes noe sted i dag og som avgjør om en testdag
kan føres i appen i det hele tatt. Vis den til meg før du går videre til de andre sju.

## SLUTT PÅ PROMPT

---

## Batch 3, når batch 2 er godkjent

Poster til gruppe og enkeltspiller (1:1 til mindreårige må være sporbart og synlig for
forelder) · dokumentdeling med lesekvittering («12 av 14 har åpnet uttakskriteriene») ·
samtykkeskjermen for forelder og spiller, med de to delingstrinnene per organisasjon.

## Til Anders — tre ting som må avgjøres

1. **TN-rødt.** Designsystemet bruker `#D70232`, målt fra logofilen. `.claude/rules/beslutninger.md`
   N-D2 sier `#D50431` uten oppgitt kilde. To gjeldende verdier for samme farge er en driftsfelle.
2. ~~Hvem eier `/team-norway/*`?~~ **AVGJORT 31.08.2026** — Train-lock eier plattformflatene
   (Analyse, DataGolf), dette systemet eier `/team-norway/*` og alle TN-egne skjermer. Se
   `.claude/rules/beslutninger.md` §ANALYSE OG DATAGOLF FOR TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN.
3. **16 protokoller eller 11 tester?** Kildene spriker. Avstemmes før føringsskjermen kodes.
