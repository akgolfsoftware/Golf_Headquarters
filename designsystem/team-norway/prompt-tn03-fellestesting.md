# Bestilling: TN-03 Fellestesting — én skjerm, i dybden

Skrevet 31.08.2026. Limes inn i Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
(`a03bf94a-c923-4c04-82ff-415773557e37`). Utdyper TN-03 i `docs/bestilling-batch-2.md` —
den bestillingen gjelder fortsatt for kontekst og regler, denne går i dybden på selve skjermen.

Alle protokolldata under er lest ut av `prisma/seed-data/ngf-test-battery.json` i AK Golf HQ
30.–31.08.2026. Enheter, målemetoder og referanseverdier er ekte, ikke oppdiktet.

---

## LIM INN FRA OG MED HER

# Tegn TN-03 Fellestesting

Én skjerm, i dybden. Dette er skjermen som ikke finnes noe sted i dag, og som avgjør om en
testdag i det hele tatt kan føres i appen. Bygg i dette designsystemet — `readme.md` og
`tokens/` er fasit, ikke `SKILL.md`.

## Situasjonen skjermen skal tåle

Det er testdag. Anders står på treningsfeltet eller i styrkerommet med 11 til 14 utøvere som
skal gjennom **samme** protokoll etter tur. Han har telefonen i én hånd. Den andre holder en
klubb, en vekt eller en stoppeklokke. Det er ofte kaldt, ofte vått, av og til hansker. Utøverne
står i kø og venter — hvert unødvendige trykk er ti sekunder ganger fjorten.

Skjermen skal fungere der. Alt annet er sekundært.

Tre ting som ødelegger en testdag, og som designet må gjøre umulige:
1. **En dialogboks mellom hver utøver.** Fjorten bekreftelser er fjorten avbrudd.
2. **At man mister oversikten over hvem som er ført.** Da måles noen to ganger og andre aldri.
3. **At en feiltasting krever at man går ut av flyten for å rette.** Retting må skje der man er.

## Flyten

**Velg protokoll → velg gruppe → før utøver for utøver i kø → avslutt økten.**

Tegn alle fire stegene. Det første og siste er raske; steget i midten er der skjermen lever, og
det er der du skal bruke mest omhu.

### Steg 1 · Velg protokoll
Trener velger én protokoll for hele økten. Vis nylig brukte øverst — på testdager kjøres samme
protokoll om igjen. Per protokoll: navn, hva som måles, enhet, og hvilken versjon som er
gjeldende. Versjonen låses når økten starter, så alle målingene i økten peker på samme versjon.

### Steg 2 · Velg gruppe
Trener velger gruppen. Vis hvor mange utøvere det er, og hvor mange av dem som allerede har en
måling på denne protokollen i inneværende testperiode — det er informasjonen som avgjør om økten
er en ny runde eller en opphenting.

### Steg 3 · Køen — skjermens kjerne
Én utøver av gangen, med køen synlig rundt. Utøveren som står for tur skal eie skjermen: navn
stort, inntastingen rett under, og en tydelig «neste».

Du skal kunne se, uten å scrolle:
- Hvem som står for tur nå
- Hvor mange som er ført og hvor mange som gjenstår
- Hvem som kommer etter, minst de neste to

Fire ting må kunne gjøres uten å forlate køen:
- **Hoppe over** en utøver som ikke er der ennå — hen går bakerst, ikke ut
- **Gå tilbake** til en som allerede er ført, og rette tallet
- **Markere ikke møtt** — forskjellig fra «ikke ført ennå», og det skillet må være synlig
- **Legge til en utøver** som ikke sto på lista

Når siste utøver er ført, skal skjermen si det tydelig og tilby å avslutte økten — ikke bare bli
stående tom.

### Steg 4 · Oppsummering
Hva som ble målt, av hvem, på hvilken protokollversjon, hvem som mangler, og hva som skjer nå.
Attestering hører hjemme her: hvem som var vitne til målingene. Tilstandene er
**venter · attestert · avvist**.

## De fire protokolltypene — ekte data, bruk dem

Inntastingen er ikke én form. Fire arketyper, og hver av dem trenger sitt eget felt.

### Type 1 · Tall — én måleverdi
Den enkleste og den vanligste på fysiske testdager.

| Protokoll | Enhet | Retning |
|---|---|---|
| Benkpress | kg | høyere er bedre |
| Trapbarmarkløft | kg | høyere er bedre |
| Clubhead Speed (CHS) | mph | høyere er bedre |
| Stille lengde | — | høyere er bedre |
| Ballkast knestående | — | høyere er bedre |

Feltet skal være stort nok til å treffes med kalde fingre. Tallet vises i IBM Plex Mono med
tabulære tall. Enheten står ved siden av feltet, ikke som plassholder inni — plassholdere
forsvinner i det øyeblikket man trenger dem.

**CHS har ekte referanseverdier** som kan vises som kontekst mens man fører: PGA-snitt 115 mph,
PGA topp 40 121 mph, norsk elitejunior 108 mph, scratch 102 mph. Merk at bare de to PGA-tallene
er `reference` i kilden — resten er `estimated` og **skal merkes som estimat**. Se
TruthLayer-avsnittet.

**Benkpress og Trapbarmarkløft har ingen referanseverdier ennå** («Fysisk norm hentes fra
NGF/Olympiatoppen i v2»). Tegn hvordan skjermen ser ut når normen mangler — den skal si det, ikke
skjule det med en tom graf.

### Type 2 · Port — bestått eller ikke, per forsøk
Trener registrerer treff/bom raskt etter hverandre.

| Protokoll | Hva som måles |
|---|---|
| Putt Gate | 10 putter gjennom en 40 cm gate. Resultat: antall gjennom av 10 |
| Driver Gate · Nærspill Gate · Wedge Gate | samme prinsipp, ulike avstander |
| VISA Express | portserie på tid |

Dette er den ene inntastingen der **mange raske trykk er riktig** — ti forsøk etter hverandre.
Tegn den slik at treff og bom kan slås inn uten å se på skjermen mellom hvert. Løpende telling
synlig. Angre siste forsøk må være ett trykk unna.

Putt Gate har ingen tour-referanse — kilden sier «Teknisk test uten tour-motstykke. Intern norm
settes fra elevdata i v2.» PGA-benchmarken som finnes er kvalitativ: startlinje-presisjon over
90 %.

### Type 3 · Stige — flere steg med økende krav

**Putt Speed Control** kjøres i to varianter: 1×5 på 3 meter, og 3×3 på 3, 5 og 7 meter. Det som
registreres er **avstand fra hull etter putten**, ikke om den gikk i. Referanse: leave under
0,5 meter fra hull.

**8-Ball Variation** er 24 slag: chip på 10 og 30 meter, wedge på 20 og 40, lobb på 15 og 25,
bunker på 10 og 20 — i varierende rekkefølge. Poeng 0–4 per slag, maks 96.

For stigen må skjermen vise hvilket steg man er på, hva som er registrert så langt, og hva som
gjenstår — uten at det tar plassen fra selve inntastingen. En utøver som avbryter midt i skal
kunne fortsette senere; tegn hvordan en halvferdig stige ser ut i køen.

### Type 4 · PEI — nærhet delt på lengde
**PEI Test Bane**: 18 hull, der hvert innspill gir lengde og avstand til hull.

**PEI er en prosent, og lavere er bedre.** Dette er det letteste å tegne feil i hele systemet.
En større søyle, en høyere posisjon eller en grønnere farge for et høyere tall er direkte
misvisende. Referanseverdiene: PGA topp 40 5,0 % · PGA-snitt 5,7 % · Challenge Tour 6,8 % ·
norsk elitejunior 8,2 % · scratch 9,0 %. En junior på 8,2 % ligger altså på elitenivå for sin
gruppe — skjermen må ikke få det til å se ut som en svak prestasjon.

## TruthLayer på denne skjermen

Hver måling skal bære **dato, protokollversjon og hvem som målte**. På føringsskjermen betyr det
at det er synlig hvem økten føres av, og at det følger med når målingen lagres.

**Referanseverdier merkes etter troverdighet.** Kilden skiller mellom `reference` (målt, sikker)
og `estimated` (avledet). Bare PGA-tallene for CHS og PEI er `reference`; alle nivåene under —
DP World, Challenge Tour, Nordic League, norsk elitejunior, scratch — er `estimated`. Tegn en
visuell forskjell mellom de to. En junior som sammenligner seg med «norsk elitejunior 108 mph»
skal se at det er et anslag, ikke en fasit.

## Tilstander du skal tegne

Mobil 390, alle:
1. **Kø, midt i økten** — noen ført, én for tur, flere igjen
2. **Tom** — økt startet, ingen ført ennå
3. **Laster** — henter gruppen
4. **Feil** — måling ble ikke lagret. Hva skjer med tallet som ble tastet inn? Det må ikke
   forsvinne. Vis hvordan skjermen holder på det.
5. **Ferdig** — siste utøver ført, oppsummeringen

Mac 1440: køen midt i økten. På stor skjerm er det plass til hele gruppen ved siden av
inntastingen — bruk den, ikke strekk mobilkolonnen.

Alle fem i lys flate. Mørk brukes ikke her; dette er et skjema.

## Regler

- Merkevarerød `#D70232` kun på logo, skinne og «denne utøveren» i køen. Status bruker `#C2352B`,
  grønn og ravgul — et rødt element skal aldri kunne feiltolkes som en advarsel.
- Trykkflater store nok for kalde fingre ute. Systemets `--press-scale` på pointer-down.
- Ekte norsk skjermtekst. Ingen emoji. Ingen lorem ipsum.
- Tall i IBM Plex Mono med tabulære tall — de skal ikke hoppe når de endres.
- Ingen nye tokens. Mangler du en verdi, skriv det i designnotatet.
- Ingen mindreårige ved navn utenfor innlogget flate.

## To ting jeg ikke har svar på — tegn ditt forslag og si hva du valgte

1. **Offline.** Testdager er ute, og dekningen på en golfbane er ujevn. Skal skjermen kunne føre
   en hel økt uten nett og synkronisere etterpå? Det er ikke besluttet. Tegn hva brukeren ser
   hvis nettet forsvinner midt i en økt, og si i designnotatet hva du forutsatte.
2. **Hvem som kan føre.** Kan en assistenttrener føre på Anders' vegne, og skal det i så fall
   vises på målingen? Foreslå, og merk det som forslag.

## SLUTT PÅ PROMPT

---

## Til Anders

De to spørsmålene nederst er ekte hull, ikke retoriske. Offline-spørsmålet er det viktigste:
svarer vi ja, får det konsekvenser for datamodellen, ikke bare for designet — en måling som
lages uten nett må ha en id som ikke krasjer med andres når den synkroniserer.

Kilden for alle protokolldata: `prisma/seed-data/ngf-test-battery.json`. Benkpress og
Trapbarmarkløft har fortsatt ingen referanseverdier — de venter på NGF/Olympiatoppen, jf.
FYS-formelen som står som uavklart i beslutningene.
