# Bestilling til Claude Design — AK Golf designsystem

Kopier alt under streken inn i et nytt Claude Design-prosjekt. Prompten er
selvstendig: den inneholder hver verdi designeren trenger, så ingenting må
gjettes eller slås opp.

Opprettet 01.09.2026. Grunnlag: `designsystem/ak-golf/` (STEG 18.3–18.7) og
`.claude/rules/beslutninger.md`.

---

Du skal bygge det komplette designsystemet for **AK Golf** — paraplymerket over
et norsk golfkonsern. Fundamentet er allerede lagt og **låst**: farger,
typografi, romskala og logoregler er bestemt og målt. Din jobb er å bygge det ut
til et system man kan lage ting med: komponenter, maler og ekte flater.

Dette prosjektet blir **masteren**. Det speiles til `designsystem/ak-golf/` i
kodebasen.

## 1 · Hva AK Golf er

Et utviklingssystem for golfspillere der hver anbefaling er forankret i en
måling — ikke i en følelse. Ikke en golfpro som selger timer. Ikke en app.

Løftet, ordrett:

> **Du skal aldri lure på hva du skal trene på, eller hvorfor.**

Alt du lager måles mot den setningen.

**Primærpublikum:** junioren som vil noe — og forelderen som betaler. Den
ambisiøse voksne følger etter, med samme løfte. Forelderen er den som
bestemmer, så materiell rettet mot foreldre er salgsmateriell, ikke bare
informasjon.

**Fire ting merket kan bevise, som alle finnes allerede:** Trackman i hver økt
og tjue standardiserte testprotokoller · én metodikk med eget språk · AK-stigen
som tar junioren fra golfskole til turnering i navngitte trinn · sportssjef i
Gamle Fredrikstad GK, coach ved WANG Toppidrett, tilknytning til Team Norway
Golf.

## 2 · Familien du designer for

Én paraply, fem varianter. Hver arver samme skjelett og får én identitetsfarge.

| Variant | Navn skrives | Rolle |
|---|---|---|
| **AK Golf Academy** | `AK Golf Academy` | Kjernen. Dette *er* AK Golf |
| **AK Golf Junior Academy** | `Junior Academy` | Bærer det sentrale målet |
| **AK Golf HQ** | `AK Golf HQ` | Plattformen. Beviset |
| **Organisasjon** | `WANG Toppidrett Fredrikstad — coaching ved AK Golf` | Kontraktsarbeid. Kunden står FØRST |
| **Skarpnord Golf Products** | `Skarpnord Golf Products` | Utstyr. Lav profil |

**Mulligan Indoor Golf står UTENFOR paraplyen.** Ingen «en del av AK
Golf»-avsender, ingen felles logobruk. AK Golf promoterer anlegget, men merkene
blandes ikke. Lag ikke Mulligan-materiell i dette systemet.

**Team Norway Golf er også utenfor.** De har eget designsystem. Rør dem ikke.

## 3 · Låst fundament — endre ingenting her

### Farge

Grunnen er **krem `#FAF9F5`**, ikke hvitt. Merkets mørke er **blekk `#141413`**,
ikke svart. Samme varme i begge. Ren `#000000` hører til produktskjermene og
skal ikke brukes.

```
Flate, lys        #FAF9F5
Flate, senket     #F0EEE6
Kort på krem      #FFFFFF
Tekst             #141413
Underordnet       #5E5D59   (6,4:1 på krem)
Etikett           #B0AEA5   ALDRI brødtekst
Kant              #E8E6DC
Hårlinje          #D1CFC5
```

Identitetsfargene har tre verdier hver — flate, tekst (mørk nok for krem), og
lys (for blekk). Alle kontrasttall er **målt**, ikke anslått:

```
                flate      tekst/krem        lys/blekk
Junior          #5B8450    #4F7343 5,16:1    #8FB37F 7,83:1
Academy (clay)  #D97757    #A9512F 5,10:1    #E08B69 7,08:1
HQ              #3F7CB3    #356B9C 5,34:1    #7FB0DA 8,01:1
Organisasjon    #4E6A7E    #42596B 6,94:1    #93AEC0 7,95:1
Products        #9C7A33    #8A6A2A 4,77:1    #C9A755 8,03:1
```

Rekkefølgen er ikke en fargevifte — den følger spillerens vei gjennom huset:
Junior er vekst, Academy er kjernen, HQ er systemet, Organisasjon er kravet,
Products er utstyret.

**Status er aldri identitet:** i orden `#2E7D51` · følg med `#9A6B10` · feil
`#B3261E`. Statusgrønn er kjøligere enn Junior-grønn med vilje, så «godkjent»
ikke kan forveksles med juniorprogrammet.

**Aksentflatene er store.** Clay og de andre identitetsfargene bæres av hele
flater — et panel, en kolonne, en seksjon — og dekker minst 18 % av visningen
når de brukes. (Den tidligere 5 %-regelen ble opphevet 01.09.2026 med
instrument-retningen.)

Det som består: **én identitetsfarge om gangen**, aldri to i samme visning, og
aldri farge som eneste bærer av informasjon.

### Typografi

Tre fonter. **Ingen fjerde, noensinne.**

- **Archivo Narrow** (600, 700) — overskrifter. Alt som skal dominere en flate.
- **Poppins** (400, 500, 600) — brødtekst, knapper, skjema.
- **IBM Plex Mono** (400, 500) — alt som er målt.

Archivo Narrow ble valgt 01.09.2026 av en praktisk grunn: **kondensert type får
plass til flere tegn per linje på 390 px**, og mobil er merkets viktigste flate.
Testet mot Archivo, Barlow Condensed, Oswald, Saira Condensed, Chivo og Anton i
norsk tekst.

**Lora er ute.** En serif sier «les langsomt»; instrumentet sier «her er tallet».
Det er ikke plass til begge stemmene. Ingress settes i Poppins 400 / 21 px, sitat
i Archivo Narrow 600.

**700 er kun Archivo Narrow.** Poppins går aldri over 600.

**Den viktigste regelen i hele systemet:** et tall som kommer fra en måling
settes i mono. Et tall som ikke gjør det, settes ikke i mono. Dette er ikke
stil — det er løftet gjort synlig. Står det i mono, er det etterprøvbart, med
dato og kilde. Står det ikke i mono, er det en påstand. Estimater merkes som
estimat i teksten.

Skala, ti trinn: `11 · 13 · 15 · 17 · 21 · 26 · 34 · 48 · 72 · 112`. 11 px er
kun mono-caps med `0.2em` sperring.

Display fra 48 px og opp har linjeavstand **0,94** — linjene skal låse seg til
hverandre og bli en blokk. Brødtekst 1,5, og stopper på 65 tegn.
Sperring `-0.035em` display, `-0.02em` titler, `0` brødtekst.

Display settes i **VERSALER** når den står alene som utsagn. Aldri caps på en
hel setning i brødtekst.

### Rom, form og bevegelse

Romskala, 4-basis: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Er svaret
22 px, er det feil — velg 20 eller 24.

Radius — merket er **rolig, ikke rundt**. Jo større flaten er, desto mindre skal
hjørnet merkes: knapp og felt 6 px · kort 10 px · panel 16 px · pill 999 px kun
på knapper og filter.

Tre dybdenivåer, alle bygget på blekk (ikke svart) så de ikke blir grå flekker
på kremen.

Bevegelse: 120 ms hover og fokus · 220 ms panel og innholdsbytte · 420 ms
seksjon ved rull. Kurve `cubic-bezier(0.2, 0, 0.2, 1)`. Aldri `ease-in` alene.
En animasjon skal svare på «hvor kom dette fra» eller «hva skjedde nå» — aldri
på «se her».

### Instrumentlaget — merkets grafiske element

Dette er ikke dekor, og det er ikke valgfritt. **Rutenettet, målestokken og
krysset er hentet fra det AK Golf faktisk gjør** — spredningsellipsen,
pyramideaksene, avstanden fra pinnen.

- **Rutenettet:** 56 px ruter (7 × 8, samme åtte-basis som romskalaen), én
  piksel, svært lav styrke — `rgba(20,20,19,.075)` på krem,
  `rgba(250,249,245,.11)` på blekk. 24 px på små flater og i kort.
- **Målestokken:** merker hver 12 px, et langt hvert femte, 42 % styrke.
- **Krysset:** 11 px, der to akser møtes.

**Regelen som holder det ærlig:** instrumentlaget skal aldri gi inntrykk av å
vise data som ikke finnes. Et rutenett i bakgrunnen er tekstur. Et rutenett
**med tall på aksene** er en påstand — og da må tallene være målt, med dato og
kilde. Ingen kurver uten data, ingen spredninger uten målinger, ingen akser uten
enhet. Bryter du dette, er merket løgn i formen selv om teksten er sann.

Én flate har sjelden mer enn **ett** instrumentelement.

### Logoen

En `ak`-ligatur i blekk med en clay-sirkel over k-en. Sirkelen er ballen, og
det eneste fargede elementet.

**Logoen er ukrenkelig.** Den rendres fra fil, aldri gjenskapt i markup, aldri
farget om, strukket, rotert eller satt i annen skrift.

- Klaringssone: **halve logoens høyde** på alle fire sider.
- Minstemål: 24 px skjerm, 12 mm trykk. Faviconen er en egen fil som tåler 16 px.
- Navnelåsen: logo, hårlinje `#D1CFC5`, navn i **Poppins 400 satt i 40 % av
  logoens høyde**. Navnet står **aldri** i identitetsfargen.

Ferdige filer finnes — bygg aldri en lås for hånd.

## 4 · Grensen mot produktet — les denne to ganger

Huset har tre designsystemer:

| System | Eier |
|---|---|
| **AK Golf** (dette) | Merket: logo, farge, tone, foto, marked, materiell |
| **Train-lock** | Hver skjerm i PlayerHQ, AgencyOS og Forelder |
| **Claw** | Team Norways egne skjermer |

**Du designer ikke produktskjermer.** Ingen dashbord, ingen treningsplan, ingen
spillerprofil, ingen coach-arbeidsflate. De finnes allerede i Train-lock og
skal ikke røres.

Du designer alt som ligger **utenpå og rundt** produktet: markedsflater,
presentasjoner, materiell, dokumenter, annonser, skilt.

Trenger du å vise appen i en presentasjon eller på en markedsside, vis den som
et **bilde eller en ramme** — tegn den ikke om i AK Golf-stil.

## 5 · Tonen — dette er halve merket

AK Golf høres ut som Anders Kristiansen, og det er den ene tingen ingen
konkurrent kan kopiere.

**Slik snakker vi:** Direkte, poenget først. Presist — «åtte av ti 7-jern lander
høyre for pinnen» slår «du sliter med retningen». Faguttrykk beholdes, men
oversettes i samme setning. Vi sier ifra når noe ikke virker. Korte setninger,
én tanke om gangen.

**Slik snakker vi aldri:**

| Aldri | Fordi |
|---|---|
| «Ta golfen din til neste nivå» | Sier ingenting. Kunne stått hos hvem som helst |
| «Vi brenner for golf» | Alle sier det. Ingen tror det |
| «Unlock your potential» | Engelsk floskel i norsk tekst |
| «Garantert 5 slag lavere» | Umulig å måle rettferdig, og ulovlig å love |
| Utropstegn og emoji | Skriker. AK Golf trenger ikke skrike |

**Prøven:** les setningen høyt. Ville en erfaren coach sagt den til en spiller på
rangen? Nei — skriv den om.

**Alt skrives på norsk bokmål**, med æ, ø og å. **Aldri lorem ipsum** — bruk ekte
norsk tekst overalt. Tall som ikke er målt, merkes eksplisitt som eksempel.

## 6 · Absolutte forbud

- **MORAD og Mac O'Grady skal ALDRI nevnes** i noe publikumsvendt: ikke
  nettsider, ikke annonser, ikke coach-biografier, ikke presentasjoner. Dette er
  en hard regel med forretningsbegrunnelse.
- **Ingen bilder av mindreårige uten skriftlig foreldresamtykke** — i
  gruppebilder gjelder det hvert identifiserbart barn.
- **WANG, GFGK og Team Norway er relasjoner, ikke produkter.** De skal aldri
  framstilles slik at en leser tror hen kjøper tilgang til dem.
- Ingen emoji. Ikoner er Lucide.
- Ingen farge utenfor paletten. Ingen gradient over merkefarger.
- Ingen navngitte konkurrenter hengt ut — beskriv situasjonen, ikke personen.

## 7 · Det du skal levere

### A · Komponentbibliotek

Bygget på fundamentet over, i **lys og mørk**, med alle tilstander (hvile,
hover, fokus, aktiv, deaktivert, laster, tom, feil):

Knapper (primær, sekundær, tekst, ikon) · felt og skjema med validering ·
kort i tre tyngder · navigasjon (topp, mobilmeny, brødsmuler, faner) ·
merkelapper og status · tabell og liste · sitat · fakta- og talleblokk (mono) ·
akkordeon · varsel og melding · paginering · fotokort med bildetekst.

**Alt som kan trykkes er minst 44 × 44 px.** Merket leses stående, ofte på et
treningsfelt, ofte med hansker.

### B · Maler — det systemet faktisk skal produsere

Hver mal i **Mac 1440 og mobil 390**, i **lys og mørk**:

1. **Markedsside** — hero, seksjoner, fotobruk, avslutning med én handling
2. **Landingsside for én kampanje** — ett budskap, ett skjema
3. **Presentasjon** — forside, innholdsside, tallside, sitatside, avslutning.
   Til foreldremøter, klubbstyrer og forbund
4. **Dokument** — brevark, tilbud, sportsplan. Det som sendes som PDF
5. **E-postsignatur** — for hver variant
6. **Sosiale medier** — kvadrat 1080, stående 1080×1350, story 1080×1920.
   Minst seks innleggstyper: fremgangstall · sitat fra spiller · før/etter ·
   tips fra coach · turneringsresultat · påmelding åpen. Med og uten foto
7. **E-post** — nyhetsbrev (topp, artikkel, handling, bunn med avmelding),
   transaksjonsmal (bekreftelse, påminnelse, kvittering), og signatur per variant
8. **Fysisk** — roll-up 850×2000, skilt i simulatorhallen, plakat A3/A2,
   visittkort 85×55, bag-tag
9. **Kontor og salg** — brevark, tilbud, faktura, sportsplan som PDF,
   presentasjonsmal for foreldremøte og klubbstyre
10. **Profilklær** — plassering og størrelse av merket på pique, softshell,
    caps og bag. Se punkt 11 om hvorfor dette haster
11. **Rapportside for forelder** — vis hvordan et målt tall presenteres
    utenfor appen, med dato og kilde

### C · Variantene demonstrert

Vis **samme mal i tre varianter** — Junior Academy, Academy og Organisasjon — så
det er tydelig hva som endres og hva som består. Dette er systemets viktigste
prøve: klarer det å se ut som én familie og fem forskjellige tilbud samtidig?

### D · Foto — arkivet finnes allerede

**Ikke finn på fotoretning, og ikke bruk stockbilder.** Det ligger 43
profesjonelle bilder i `public/brand/foto/`, katalogisert i
`designsystem/ak-golf/foto/katalog.md` med motiv og bruksområde per bilde.

De fem sterkeste, om du trenger å velge raskt:

- **#9** — coach og spiller foran Trackman. Hele merket i ett bilde
- **#42** — analysen innendørs foran skjermen. Det ingen konkurrent har
- **#24** — ball i luften. Bevegelse som overlever et lite format
- **#44** — ovenfra, lange skygger. Eneste uventede vinkel i arkivet
- **#28** — spiller mot mørk bakgrunn. Bygget for tekst over

**To ting du må forholde deg til:**

**PUMA-logoen er synlig på coach-klærne** i alle nærbilder (tydeligst #3, #8,
#9, #14, #41, #42). Et konkurrerende merke står på brystet i AK Golfs eget
materiell. Ta hensyn til det i bildevalget der merket skal være tydelig, og se
punkt 10 i leveransen om profilklær.

**Arkivet mangler to ting.** Det finnes ingen bilder av yngre juniorer — altså
motivet som betyr mest når junior er primærpublikum. Og det finnes bare ett
portrett: **#41, Anders Kristiansen**. Markus Røinås Pedersen har ingen.

Design juniormateriellet og coach-flatene slik at de virker med det som
faktisk finnes, og si tydelig hva en ny fotosesjon må skaffe.

Vis også tekst på foto med mørkt sjikt, og hvordan kontrastkravet på 4,5:1
holdes mot det bildepartiet teksten faktisk ligger på — ikke mot bildets
gjennomsnitt.

### E · Trykk

Fargene over er skjermverdier. For alt som skal trykkes på annet enn
digitaltrykk trengs **CMYK og Pantone for clay `#D97757` og blekk `#141413`**,
som minimum.

**Ikke konverter matematisk fra RGB og oppgi resultatet som fasit** — clay er en
mettet oransje som skifter merkbart mellom skjerm og papir. Foreslå
utgangsverdier, og skriv eksplisitt at de skal bekreftes mot et fysisk
prøvetrykk før første opplag.

Oppgi også: minste trykkstørrelse for logoen (12 mm), hvilke varianter som
gjelder for brodering og gravering (enfarget, ingen halvtoner), og hvordan
merket settes på mørkt tekstil.

### F · Pakke

`readme.md` (hva som gjelder hvor) · `tokens/` · `components/` · `templates/` ·
`guidelines/` — samme struktur som Team Norway-pakken, så de to kan leses av
samme person uten omstilling.

## 8 · Temperamentet

Merket er **et instrument, ikke et sportsmerke.** Det er den viktigste
enkeltføringen i hele bestillingen, valgt 01.09.2026 etter gjennomgang av
seksten referanser Anders leverte.

Praktisk betyr det:

- **Hard kontrast.** Krem mot blekk, full flate mot full flate. Ingen
  forsiktige mellomtoner.
- **Typografien er motivet**, ikke en etikett over et bilde. En hero er en
  tekstblokk i 112 px, ikke et foto med en linje på.
- **Tallene er hovedpersoner.** Et målt tall i mono, stort, med dato og kilde
  under — det er merkets signatur.
- **Ingen energi-retorikk.** Ikke revet papir, ikke skrå bånd, ikke
  bevegelsesuskarphet, ikke «PLAY LOUD». Et merke som sier «vi måler, vi synser
  ikke» kan ikke rope.

Referansene som traff: POLYMER 48, Thegrafx, Design Signals, Narka. Referansene
som ble valgt bort, selv om de er godt håndverk: GRO, Nike «PLAY LOUD»,
gym-plakatene.

## 9 · Slik vil jeg at du jobber

- **Mobil 390 er den viktigste visningen**, ikke desktop. Materiellet skannes
  stående, ute, ofte i sollys.
- **Lys og mørk er begge obligatoriske.** Ikke lag mørk ved å invertere lys —
  gi den samme omtanke.
- **Vis alltid tom tilstand** der en flate kan være tom.
- **Skriv ekte norsk tekst i hver eneste flate.**
- **Foreslå, ikke gjett stille.** Er noe uavklart, still spørsmålet tydelig i
  leveransen med et konkret forslag — ikke velg i det stille og la det se
  bestemt ut.

## 10 · To ting jeg vil at du tar stilling til

Disse er bevisst ikke avgjort. Foreslå, med begrunnelse:

1. **Hvordan ser et målt tall ut når det står alene?** En KPI på en plakat, et
   resultat i en presentasjon, et fremgangstall til en forelder. Mono er gitt —
   men hvordan bæres dato og kilde uten at det blir en fotnote ingen leser?
   Dette er merkets signatur, og den finnes ikke ennå.

2. **Hvor langt skal rutenettet gå på fysiske flater?** På skjerm er det tekstur
   under innholdet. På en roll-up i en simulatorhall, på en bag-tag, på et
   visittkort — skal det være der i det hele tatt, eller er det et skjermelement
   som blir gimmick i trykk? Foreslå, med begrunnelse.

*(Det tredje spørsmålet — om merket trenger et grafisk element utover logoen —
er besvart 01.09.2026. Svaret er instrumentlaget, se §3.)*

## 11 · Hva som IKKE er del av denne bestillingen

Sagt eksplisitt, så det ikke oppstår tvil om hvem som eier hva:

**Innhold og drift er ikke design.** Du lager *malen* for et innlegg i sosiale
medier — ikke innleggene, ikke publiseringskalenderen, ikke tekstene som skal
ut uke for uke. Det er en egen jobb med en egen rytme, og den bør ikke ligge i
et designsystem som skal stå i årevis.

**Produktskjermene.** Se punkt 4. Dette er den enkleste feilen å gjøre.

**Mulligan Indoor Golf og Team Norway Golf.** Begge står utenfor paraplyen.

**Selve trykkbestillingen.** Du foreslår CMYK- og Pantone-verdier; noen andre
bekrefter dem mot et fysisk prøvetrykk.
