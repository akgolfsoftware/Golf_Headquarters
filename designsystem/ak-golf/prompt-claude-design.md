# Bestilling til Claude Design — AK Golf designsystem

Kopier alt under streken inn i et nytt Claude Design-prosjekt. Prompten er
selvstendig: hver låst verdi står i teksten, så ingenting må gjettes eller
slås opp.

Skrevet 01.09.2026, lagt om til verkstedet samme dag.
Grunnlag: `designsystem/ak-golf/` og `.claude/rules/beslutninger.md`.

---

Du skal bygge det komplette designsystemet for **AK Golf** — paraplymerket over
et norsk golfkonsern. Fundamentet er lagt og **låst**: rom, farger, typografi,
romskala, logo og språkregler er bestemt og målt. Din jobb er å bygge det ut til
et system man kan lage ting med.

Dette prosjektet blir **masteren**. Det speiles til `designsystem/ak-golf/` i
kodebasen.

## 1 · Hva AK Golf er

> **Langsiktig utvikling, oppfølging, og å trene optimalt og spesifikt —
> uavhengig av hvilket nivå spilleren er på.**

Løftet, ordrett:

> **Du skal aldri lure på hva du skal trene på, eller hvorfor.**

Hovedlinjen som brukes i materiell:

> **Uansett hvor du står, vet du hva du trener på.**

Alt du lager måles mot disse tre.

**Primærpublikum:** junioren som vil noe — og forelderen som betaler. Den
ambisiøse voksne følger etter, med samme løfte. Forelderen bestemmer, så
materiell rettet mot foreldre er salgsmateriell, ikke bare informasjon.

**Fire ting merket kan bevise, som alle finnes allerede:**

1. **Langsiktig, ikke time for time.** Arbeid over sesonger, ikke enkelttimer.
2. **Oppfølging mellom øktene.** Spilleren vet hva som skal gjøres på onsdag.
3. **Optimalt og spesifikt.** Målingene bestemmer neste steg, ikke hva som er vanlig.
4. **Nivået er ikke en inngangsbillett.** Samme metode for nybegynner og
   Norgescup-spiller. Bare ulikt innhold.

## 2 · Rommet — les denne før du tegner noe

Merket hører hjemme i et **verksted**, ikke i et klubbhus. Valgt av Anders
01.09.2026, og det følger direkte av punkt 4 over.

De fleste golfmerker signaliserer eksklusivitet: dyp grønn, gull, marmor,
seriffer. Det sier «her må du være god nok» før noen har lest et ord. AK Golf
sier det motsatte, og da kan ikke formen motsi teksten.

**Ingenting i dette systemet er premium, og det er meningen.** Et godt verktøy
er ikke pyntet. Det er nøyaktig.

Praktisk betyr det:

- Ser ut som et sted der noe blir **gjort**, ikke der noen blir **servert**.
- Hard kontrast. Flate mot flate. Ingen forsiktige mellomtoner.
- **Typografien er motivet**, ikke en etikett over et bilde.
- **Tallene er hovedpersoner.** Et målt tall, stort, i mono, med dato og kilde.
- Ingen energi-retorikk: ikke revet papir, ikke skrå bånd, ikke
  bevegelsesuskarphet. Et merke som sier «vi måler, vi synser ikke» roper ikke.

## 3 · Familien

Én paraply, fem varianter. Hver arver samme skjelett.

| Variant | Navn skrives | Rolle |
|---|---|---|
| **AK Golf Academy** | `AK Golf Academy` | Kjernen. Dette *er* AK Golf |
| **AK Golf Junior Academy** | `Junior Academy` | Bærer det sentrale målet |
| **AK Golf HQ** | `AK Golf HQ` | Plattformen. Beviset |
| **Organisasjon** | `WANG Toppidrett Fredrikstad — coaching ved AK Golf` | Kunden står FØRST |
| **Skarpnord Golf Products** | `Skarpnord Golf Products` | Utstyr. Lav profil |

**Mulligan Indoor Golf står UTENFOR paraplyen.** Ingen «en del av AK
Golf»-avsender. AK Golf promoterer anlegget, men merkene blandes ikke. Lag ikke
Mulligan-materiell i dette systemet.

**Team Norway Golf er også utenfor.** De har eget designsystem.

## 4 · Låst fundament — endre ingenting her

### Farge

Grunnen er **varm betonggrå `#E8E4DC`**. Ikke hvitt, ikke krem, ikke grønt.

```
Grunn             #E8E4DC
Grunn, senket     #DDD8CE
Ark og kort       #FFFFFF
Tekst             #1F1D1A   13,3:1 på grunn · 16,8:1 på ark
Dempet tekst      #57534B   6,0:1
Svak              #8B857A   2,9:1 — ALDRI brødtekst, kun etiketter og kanter
Linje             #D2CCC0
Linje, hard       #B8B1A3
```

**Signalet — merkets ene aksent:**

```
Signal, tekst     #B83217   4,7:1 på grunn
Signal, fyll      #C4361B   for hele flater
Tekst på fyllet   #FFFFFF   6,0:1
```

> **Regelen som bærer paletten: rødt betyr «se her».** En måling, et tall, en
> handling. Aldri dekor, aldri stemning, aldri fem røde ting på samme flate.
> Mister rødt den betydningen, mister paletten poenget sitt.

**Fagfargen `#2C6E63`** (4,7:1), dyp grønnblå. Sjelden brukt, for det som hører
til **metoden** framfor **målingen**: pyramiden, periodene, langsiktige linjer.

**Varianttoner** — dempede arbeidstoner, ikke fem glade farger:

```
Junior Academy    #4A6B33   4,8:1
AK Golf Academy   låner signalet
AK Golf HQ        #2B5F87   5,4:1
Organisasjon      #4A4F58   6,5:1
Skarpnord         #7A5A22   5,0:1
```

**Verkstedet om kvelden** — mørk variant, varm mørk grå. **Lys er standard:**

```
Grunn             #22201C      Ark #2C2925      Senket #1A1815
Tekst             #F2EFE8      14,2:1
Dempet            #A8A196      6,4:1
Signal            #E8654A      5,0:1
Fag               #5FA89A      5,9:1
```

**Status er aldri identitet:** i orden `#2E6B45` · følg med `#8A6410` · feil
`#A62B1C`. Feilrød er mørkere enn signalet med vilje, så «noe er galt» ikke kan
forveksles med «se her».

Alle kontrasttall er **målt** med WCAG-formelen 01.09.2026, ikke anslått.

### Typografi

**Hele IBM Plex-familien. Ingen andre fonter.**

- **IBM Plex Sans Condensed** (600, 700) — overskrifter
- **IBM Plex Sans** (400, 500, 600) — brødtekst, knapper, skjema
- **IBM Plex Mono** (400, 500) — alt som er målt

Én familie, tre roller. Plex er tegnet som et industrielt system, ikke som et
markedsføringsalfabet — det er verkstedets språk.

**700 er kun Condensed.** Plex Sans går aldri over 600.

Skala, ti trinn: `11 · 13 · 15 · 17 · 21 · 26 · 34 · 48 · 72 · 112`.
11 px er kun mono-caps med `0.2em` sperring.

Display fra 48 px og opp har linjeavstand **0,94**. Brødtekst 1,5, stopper på
65 tegn. Sperring `-0.035em` display, `-0.02em` titler, `0` brødtekst.

Display settes i **VERSALER** når den står alene som utsagn. Aldri caps på en
hel setning i brødtekst.

### Instrumentlaget

Merkets grafiske element. Ikke dekor, ikke valgfritt — hentet fra det AK Golf
faktisk gjør: spredningsellipsen, pyramideaksene, avstanden fra pinnen.

- **Rutenettet:** 56 px ruter (7 × 8, samme åtte-basis som romskalaen), én
  piksel. `rgba(31,29,26,.075)` på lys grunn, `rgba(242,239,232,.11)` på mørk.
  24 px på små flater og i kort.
- **Målestokken:** merker hver 12 px, et langt hvert femte, 42 % styrke.
- **Krysset:** 11 px, der to akser møtes.

> **Regelen som holder det ærlig:** instrumentlaget skal aldri gi inntrykk av å
> vise data som ikke finnes. Et rutenett i bakgrunnen er tekstur. Et rutenett
> **med tall på aksene** er en påstand — og da må tallene være målt, med dato og
> kilde. Ingen kurver uten data, ingen spredninger uten målinger, ingen akser
> uten enhet.

Én flate har sjelden mer enn **ett** instrumentelement.

### Rom, form og bevegelse

Romskala, 4-basis: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Er svaret
22 px, er det feil.

Radius — merket er **rolig, ikke rundt**: knapp og felt 6 px · kort 10 px ·
panel 16 px · pill 999 px kun på knapper og filter.

Bevegelse: 120 ms hover og fokus · 220 ms panel · 420 ms seksjon ved rull.
Kurve `cubic-bezier(0.2, 0, 0.2, 1)`. Aldri `ease-in` alene.

Alt som kan trykkes er minst **44 × 44 px**.

### Logoen

En `ak`-ligatur i `#1F1D1A` med en signalrød sirkel `#B83217` over k-en.
Sirkelen er ballen, og det eneste fargede elementet.

**Logoen er ukrenkelig.** Rendres fra fil, aldri gjenskapt i markup, aldri
farget om, strukket, rotert eller satt i annen skrift.

- Klaringssone: **halve logoens høyde** på alle fire sider.
- Minstemål: 24 px skjerm, 12 mm trykk. Faviconen er egen fil, tåler 16 px.
- Navnelås: logo, hårlinje `#D2CCC0`, navn i **Plex Sans 400 satt i 40 % av
  logoens høyde**. Navnet står **aldri** i identitetsfargen.

Ferdige filer finnes i `public/logos/` — bygg aldri en lås for hånd.

## 5 · Språket

AK Golf høres ut som Anders Kristiansen. Det er den ene tingen ingen konkurrent
kan kopiere.

**Slik snakker vi:** Direkte, poenget først. Presist — «åtte av ti 7-jern lander
høyre for pinnen» slår «du sliter med retningen». Faguttrykk beholdes, men
forklares i setningen etter. Korte setninger.

**Slik snakker vi aldri:**

| Aldri | Fordi |
|---|---|
| «Ta golfen din til neste nivå» | Sier ingenting |
| «Vi brenner for golf» | Alle sier det. Ingen tror det |
| «Unlock your potential» | Engelsk floskel i norsk tekst |
| «Garantert 5 slag lavere» | Umulig å måle rettferdig, og ulovlig å love |
| Utropstegn og emoji | Skriker |

### To harde språkregler

**1 · TrackMan-parametere skrives på engelsk med STOR FORBOKSTAV.** Det heter
**Attack Angle** — aldri «angrepsvinkel», og aldri «attack angle».

Samme gjelder Club Path, Face Angle, Face to Path, Dynamic Loft, Smash Factor,
Ball Speed, Club Speed, Launch Angle, Spin Rate, Spin Axis, Carry, Total,
Dispersion, Landing Angle, Low Point, Swing Direction.

Det engelske navnet ER navnet — spilleren ser det på skjermen i økta og i
rapporten. Stor forbokstav bryter med norsk rettskriving med vilje: den viser at
dette er navnet på en **måling**, ikke et vanlig ord.

Behold parameteren, forklar hva den betyr i setningen etter:

> Attack Angle −3,2° med driver. Køllehodet går nedover i treffet.

Gjelder ikke golfspråket ellers — kølle, sving, green, tee og fairway er norsk.

**2 · Merket bruker ikke vitnesbyrd.** Ingen spillersitater, ingen anmeldelser,
ingen stjerner. Ikke fordi vi er beskjedne — fordi et sitat er per definisjon
synsing, og et merke som sier «vi måler, vi synser ikke» blir svakere av å be
folk om ros. **Vis målingen i stedet.**

Alt skrives på **norsk bokmål**. **Aldri lorem ipsum** — bruk ekte tekst overalt.
Tall som ikke er målt, merkes eksplisitt som eksempel.

## 6 · Grensen mot produktet — les to ganger

| System | Eier |
|---|---|
| **AK Golf** (dette) | Merket: logo, farge, tone, foto, marked, materiell |
| **Train-lock** | Hver skjerm i PlayerHQ, AgencyOS og Forelder |
| **Claw** | Team Norways egne skjermer |

**Du designer ikke produktskjermer.** Ingen dashbord, ingen treningsplan, ingen
spillerprofil, ingen coach-arbeidsflate. De finnes i Train-lock og skal ikke røres.

Du designer alt som ligger **utenpå og rundt** produktet. Trenger du å vise
appen, vis den som et bilde eller en ramme — tegn den ikke om.

## 7 · Absolutte forbud

- **MORAD og Mac O'Grady nevnes ALDRI** i noe publikumsvendt.
- **Ingen bilder av mindreårige uten skriftlig foreldresamtykke** — hvert
  identifiserbart barn, også i gruppebilder.
- **WANG, GFGK og Team Norway er relasjoner, ikke produkter.** Aldri framstilt
  som noe man kan kjøpe tilgang til.
- Ingen vitnesbyrd. Ingen emoji — ikoner er Lucide.
- Ingen farge utenfor paletten. Ingen gradienter. Ingen rødt som dekor.
- Ingen falske instrumenter: kurver uten data, akser uten enhet.
- Ingen navngitte konkurrenter hengt ut.

## 8 · Det du skal levere

### A · Komponentbibliotek

I **lys og mørk**, med alle tilstander (hvile, hover, fokus, aktiv, deaktivert,
laster, tom, feil):

Knapper (primær, sekundær, tekst, ikon) · felt og skjema med validering · kort i
tre tyngder · navigasjon (topp, mobilmeny, brødsmuler, faner) · merkelapper og
status · tabell og liste · fakta- og talleblokk i mono · akkordeon · varsel og
melding · paginering · fotokort med bildetekst.

### B · Maler

Hver i **Mac 1440 og mobil 390**, i **lys og mørk**:

1. **Markedsside** — hero, seksjoner, fotobruk, avslutning med én handling
2. **Landingsside for én kampanje** — ett budskap, ett skjema
3. **Presentasjon** — forside, innholdsside, tallside, avslutning. Til
   foreldremøter, klubbstyrer og forbund
4. **Dokument** — brevark, tilbud, sportsplan. Det som sendes som PDF
5. **E-post** — nyhetsbrev, transaksjonsmal (bekreftelse, påminnelse,
   kvittering), og signatur per variant
6. **Sosiale medier** — kvadrat 1080, stående 1080×1350, story 1080×1920.
   Minst seks innleggstyper: fremgangstall · «slik leser du tallet» · før/etter ·
   tips fra coach · turneringsresultat · påmelding åpen
7. **Fysisk** — roll-up 850×2000, skilt i simulatorhallen, plakat A3/A2,
   visittkort 85×55, bag-tag
8. **Kontor og salg** — brevark, tilbud, faktura, presentasjonsmal
9. **Profilklær** — plassering og størrelse av merket på pique, softshell, caps
   og bag. Se merknaden om PUMA under
10. **Rapportside for forelder** — hvordan et målt tall presenteres utenfor
    appen, med dato og kilde

### C · Variantene demonstrert

Vis **samme mal i tre varianter** — Junior Academy, Academy og Organisasjon — så
det er tydelig hva som endres og hva som består. Dette er systemets viktigste
prøve: klarer det å se ut som én familie og fem forskjellige tilbud samtidig?

### D · Foto — arkivet finnes allerede

**Ikke finn på fotoretning, og ikke bruk stockbilder.** Det ligger 43
profesjonelle bilder i `public/brand/foto/`, katalogisert i
`designsystem/ak-golf/foto/katalog.md` med motiv og bruksområde per bilde.

De fem sterkeste: **#9** (coach og spiller foran Trackman — hele merket i ett
bilde) · **#42** (analysen innendørs) · **#24** (ball i luften) · **#44**
(ovenfra, lange skygger) · **#28** (mørk bakgrunn, bygget for tekst over).

**To ting du må forholde deg til:**

**PUMA-logoen er synlig på coach-klærne** i alle nærbilder. Et konkurrerende
merke i AK Golfs eget materiell. Ta hensyn i bildevalget, og se leveranse 9.

**Arkivet mangler to ting:** ingen bilder av yngre juniorer — motivet som betyr
mest når junior er primærpublikum. Og bare ett portrett (#41, Anders
Kristiansen). Design juniormateriellet så det virker med det som finnes, og si
tydelig hva en ny fotosesjon må skaffe.

Vis også tekst på foto med mørkt sjikt, og hvordan kontrastkravet 4,5:1 holdes
mot det bildepartiet teksten faktisk ligger på — ikke mot bildets gjennomsnitt.

### E · Trykk

Fargene over er skjermverdier. For alt som trykkes på annet enn digitaltrykk
trengs **CMYK og Pantone for signal `#B83217` og tekst `#1F1D1A`**, som minimum.

**Ikke konverter matematisk fra RGB og oppgi resultatet som fasit** — en mettet
rød skifter merkbart mellom skjerm og papir. Foreslå utgangsverdier, og skriv at
de skal bekreftes mot et fysisk prøvetrykk før første opplag.

Oppgi også: minste trykkstørrelse for logoen (12 mm), varianter for brodering og
gravering (enfarget, ingen halvtoner), og hvordan merket settes på mørkt tekstil.

### F · Pakke

`readme.md` · `tokens/` · `components/` · `templates/` · `guidelines/` — samme
struktur som Team Norway-pakken, så begge kan leses av samme person uten
omstilling.

## 9 · Slik vil jeg at du jobber

- **Mobil 390 er den viktigste visningen**, ikke desktop. Materiellet skannes
  stående, ute, ofte i sollys.
- **Lys og mørk er begge obligatoriske.** Ikke lag mørk ved å invertere lys.
- **Vis alltid tom tilstand** der en flate kan være tom.
- **Skriv ekte norsk tekst i hver eneste flate.**
- **Foreslå, ikke gjett stille.** Er noe uavklart, still spørsmålet tydelig i
  leveransen med et konkret forslag.

## 10 · To ting jeg vil at du tar stilling til

1. **Hvordan ser et målt tall ut når det står alene?** En KPI på en plakat, et
   resultat i en presentasjon, et fremgangstall til en forelder. Mono er gitt —
   men hvordan bæres dato og kilde uten at det blir en fotnote ingen leser? Dette
   er merkets signatur, og den finnes ikke ennå.

2. **Hvor langt skal rutenettet gå på fysiske flater?** På skjerm er det tekstur
   under innholdet. På en roll-up, en bag-tag, et visittkort — skal det være der
   i det hele tatt, eller blir det gimmick i trykk? Foreslå med begrunnelse.

## 11 · Hva som IKKE er del av bestillingen

**Innhold og drift er ikke design.** Du lager *malen* for et innlegg — ikke
innleggene, ikke publiseringskalenderen, ikke tekstene som skal ut uke for uke.

**Produktskjermene.** Se punkt 6.

**Mulligan Indoor Golf og Team Norway Golf.** Begge utenfor paraplyen.

**Selve trykkbestillingen.** Du foreslår verdier; noen andre bekrefter dem mot
et fysisk prøvetrykk.

---

**Tekstgrunnlaget er skrevet.** Ferdig tekst for seks markedssider, seks
innleggstyper, seks e-postmaler og sju toneregler ligger i
`docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md`. Bruk den — ikke skriv ny
tekst der den allerede finnes.
