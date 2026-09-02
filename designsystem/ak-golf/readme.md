# AK Golf — designsystem

**Versjon 1.0.0 · 02.09.2026 · eier: Anders Kristiansen.** Endringer: se §10 og
`CHANGELOG.md`.

Masteren for AK Golf-merket. Speiles til `designsystem/ak-golf/` i kodebasen
med `node scripts/speil-ak-golf.mjs`.

Alt her er bygget på kildepakken Anders leverte 01.09.2026: nitten logo-SVG-er,
fem token-filer, elleve kapitler retningslinjer, 43 katalogiserte foto og ferdig
tekst for seks markedssider, seks innleggstyper og seks e-postmaler. **Ingenting
er funnet på.** Der kildene var uenige med hverandre, ble den nyeste beslutningen
lagt til grunn — og 02.09.2026 ble kildefilene selv rettet, så ingen fil i
systemet lenger motsier en annen (se §5).

---

## 1 · Hva AK Golf er

> **Du skal aldri lure på hva du skal trene på, eller hvorfor.**

AK Golf er et utviklingssystem for golfspillere der hver anbefaling er forankret
i en måling — ikke i en følelse. Ikke en golfpro som selger timer, ikke en app.
Coachen tolker målingene, planen bærer arbeidet mellom øktene.

Hovedlinjen i materiell: **Uansett hvor du står, vet du hva du trener på.**

**Primærpublikum:** junioren som vil noe — og forelderen som bestemmer og
betaler. Foreldreflaten er derfor en *salgsflate*, ikke bare en innsynsflate.
Den ambisiøse voksne følger etter, med samme løfte.

**Fire ting merket kan bevise** (alle finnes allerede): Trackman i hver økt og
tjue standardiserte testprotokoller · én metodikk med eget språk · AK-stigen fra
golfskole til turnering · sportssjef i Gamle Fredrikstad GK, coach ved WANG
Toppidrett, tilknytning til Team Norway Golf.

### Familien

| Variant | Navnet skrives | Identitetsfarge | Rolle |
|---|---|---|---|
| AK Golf Academy | `AK Golf Academy` | låner signalet `#B83217` | Kjernen. Dette *er* AK Golf |
| AK Golf Junior Academy | `Junior Academy` | `#4A6B33` | Bærer det sentrale målet |
| AK Golf HQ | `AK Golf HQ` | `#2B5F87` | Plattformen. Beviset |
| Organisasjon | `WANG Toppidrett Fredrikstad — coaching ved AK Golf` | `#4A4F58` | Kunden står først |
| Skarpnord Golf Products | `Skarpnord Golf Products` | `#7A5A22` | Utstyr. Lav profil |

**Utenfor paraplyen:** Mulligan Indoor Golf (egen identitet, ingen «en del
av»-avsender) og Team Norway Golf (eget designsystem, Claw).

### Grensen mot produktet — les to ganger

| System | Eier |
|---|---|
| **AK Golf** (dette) | Merket: logo, farge, tone, foto, marked, materiell |
| **Train-lock** | Hver skjerm i PlayerHQ, AgencyOS og Forelder |
| **Claw** | Team Norways egne skjermer |

Dette systemet designer **utenpå og rundt** produktet. Ingen dashbord, ingen
treningsplan, ingen spillerprofil, ingen coach-arbeidsflate. Skal appen vises,
vises den som et bilde eller en ramme — den tegnes ikke om. `--ak-*`-tokens skal
aldri inn i en produktskjerm.

---

## 2 · CONTENT FUNDAMENTALS — hvordan tekst skrives

Alt skrives på **norsk bokmål** med æ, ø og å. **Aldri lorem ipsum** — det ligger
ferdig tekst for hver flate i `guidelines/tekstkonsept.md`. Bruk den framfor å
skrive ny.

**Stemmen.** AK Golf høres ut som Anders Kristiansen. Prøven på hver setning:
*ville Anders sagt den til en spiller på rangen?* Nei — skriv om.

**Fem regler:**

1. **Direkte.** Poenget først, forklaringen etter.
2. **Presist.** «Åtte av ti 7-jern lander høyre for pinnen» slår «du sliter med
   retningen» — men bare når åtte av ti faktisk er talt.
3. **Faguttrykk beholdes, men forklares i setningen etter.**
4. **Nyttig motstand foran høflig enighet.** Vi sier ifra når noe ikke virker.
5. **Korte setninger.** Én tanke om gangen.

**Person:** «du» om leseren, «vi» om AK Golf. Aldri «man». Til forelderen:
«barnet ditt», aldri «deres barn». Signaturen på e-post er `Anders` — ikke
«Teamet i AK Golf».

**Casing:** vanlig norsk setningscasing i brødtekst og knapper («Book
kartleggingsøkt»). VERSALER kun i display som står alene som utsagn, og i
mono-etiketter på tre ord eller mindre. **Aldri caps på en hel setning i
brødtekst.**

**Tall:** norsk desimalkomma (`12,4`), mellomrom som tusenskille. Hvert tall om
en spiller har **dato og kilde**, eller er merket ESTIMAT. Et tall som kommer fra
en måling settes i mono; et tall som ikke gjør det, settes ikke i mono. **Et tall
om «folk flest» («åtte av ti amatører…») er også en påstand** — uten kilde
skrives det om til en instruksjon uten tall.

**To harde regler:**

- **TrackMan-parametere skrives på engelsk med stor forbokstav.** *Attack Angle*
  — aldri «angrepsvinkel», aldri «attack angle». Samme for Club Path, Face
  Angle, Face to Path, Dynamic Loft, Smash Factor, Ball Speed, Club Speed,
  Launch Angle, Spin Rate, Spin Axis, Carry, Total, Dispersion, Landing Angle,
  Low Point, Swing Direction. Behold navnet, forklar det etter:
  *«Attack Angle −3,2° med driver. Køllehodet går nedover i treffet.»*
  Golfspråket ellers er norsk: kølle, sving, green, tee, fairway.
- **Merket bruker ikke vitnesbyrd.** Ingen spillersitater, ingen anmeldelser,
  ingen stjerner. Et sitat er per definisjon synsing. **Vis målingen i stedet:**
  «Dispersion gikk fra 14,2 til 6,8 m».

**Ingen emoji. Ingen utropstegn.** Ikoner er Lucide (`13-ikoner.md`).

**Aldri disse:** «Ta golfen din til neste nivå» · «Vi brenner for golf» ·
«Unlock your potential» · «Garantert 5 slag lavere» · «Kontakt oss for pris» ·
«Opptil 15 meter lengre» · «Få plasser igjen» når det ikke stemmer.

**Én handling per flate.** «Book kartleggingsøkt» — ikke «Book · Les mer · Meld
deg på · Se video».

**Eksempler, ordrett fra `tekstkonsept.md`:**

> Uansett hvor du står, vet du hva du trener på.

> De fleste vet ikke hva de trener på. Ikke fordi de er late. Fordi ingen har
> målt. Du slår en bøtte baller, det føles bedre eller verre, og neste uke
> starter du på nytt. Det er ikke trening — det er håp.

> 90 minutter, vanlig timepris. Du går derfra med en plan.

---

## 3 · VISUAL FOUNDATIONS

### Rommet: verkstedet, ikke klubbhuset

De fleste golfmerker signaliserer eksklusivitet — dyp grønn, gull, marmor,
serifer — og sier dermed «her må du være god nok» før noen har lest et ord. Når
løftet er *uavhengig av nivå*, kan ikke formen motsi teksten. **Ingenting i dette
systemet er premium, og det er meningen.** Et godt verktøy er ikke pyntet. Det er
nøyaktig.

Praktisk: hard kontrast, flate mot flate, ingen forsiktige mellomtoner.
**Typografien er motivet**, ikke en etikett over et bilde. **Tallene er
hovedpersoner.** Ingen energi-retorikk — ikke revet papir, ikke skrå bånd, ikke
bevegelsesuskarphet.

### Farge

**Fasit er `tokens.json`.** Grunnen er **varm betonggrå `#E8E4DC`** — ikke hvitt,
ikke krem, ikke grønt. Ark og kort er `#FFFFFF`, senket seksjon `#DDD8CE`. Tekst
`#1F1D1A` (13,3:1 på grunn), dempet `#57534B` (6,0:1), svak `#8B857A` (2,9:1 —
aldri brødtekst).

**Signalet `#B83217` er merkets ene aksent, og regelen som bærer paletten:
rødt betyr «se her».** En måling, et tall, en handling. Aldri dekor, aldri
stemning, aldri fem røde ting på samme flate. Fyllvariant `#C4361B` for hele
flater, hvit tekst på (5,4:1). Som tekst kun på grunn og ark; på senket flate og
på mørk ark kun som tall fra 21 px.

Fagfargen `#2C6E63` er andrestemme for det som hører til *metoden* framfor
*målingen*. Varianttonene er dempede arbeidstoner — én per visning, aldri to.
Status (`#2E6B45` / `#755608` / `#A62B1C`) er aldri identitet; feilrød er
mørkere enn signalet med vilje.

Mørk variant er varm mørk grå `#22201C` med egne målte tall for alt — også
status og varianttoner. **Lys er standard**, og mørk lages ikke ved å invertere.

**Ingen gradienter. Ingen farge utenfor `tokens.json`. Aldri farge som eneste
bærer av informasjon.** Alle kontrasttall måles av generatoren og står i
`tokens/kontrast.md` — 52 par, lys og mørk, og et brudd stopper `npm run verify`.

### Typografi

Én familie, tre roller, ingen fjerde font: **IBM Plex Sans Condensed** 600/700
(display og titler), **IBM Plex Sans** 400/500/600 (brødtekst, knapper, skjema),
**IBM Plex Mono** 400/500 (alt som er målt). 700 er kun Plex Sans Condensed.
Valgt 01.09.2026 (kveld) framfor Archivo Narrow + Poppins: Plex Sans er tettere,
brødtekst som brøt til tre linjer klarer seg på to, og én familie holder flaten
rolig. Produktskjermene bruker fortsatt Poppins gjennom Train-lock — annen fasit.

Skala: `11 · 13 · 15 · 17 · 21 · 26 · 34 · 48 · 72 · 112`, pluss to flytende:
`--ak-t-hero` (72 på 390 → 112 på 1440) og `--ak-t-seksjon` (26 → 34). Display
fra 48 px har linjeavstand 0,94 så linjene låser seg til en blokk. Brødtekst
1,5, stopper på 65 tegn. Sperring `-0.035em` display, `-0.02em` titler, `0`
brødtekst, `0.2em` mono-caps (`0.24em` på mørk flate). Tall i kolonne får
`tabular-nums`. Ingen serif noe sted.

### Rom, form, dybde

4-basis: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Er svaret 22 px, er
det feil. Seksjonsavstand 96 mobil / 128 Mac. Lesebredde 65ch, sidebredde
1180 px. Brekkpunkter 390 (mobil), 768 (tablet), 1180 (Mac).

Radius — **rolig, ikke rundt**: knapp og felt 6 px, kort 10 px, panel 16 px, pill
999 px kun på knapper og filter-piller. Aldri pill på et kort. Aldri sirkel på
en person (`Initialer` er kvadrat).

Tre skyggenivåer, alle varme (bygget på blekk, ikke sort, så de ikke blir grå
flekker på betongen): loft 1 kort i ro, loft 2 trykkbart kort og hover, loft 3
panel og dialog. Et fjerde nivå er egentlig et eget lag.

Alt som kan trykkes er minst **44 × 44 px**.

### Kort, kanter, transparens

Kort er hvitt ark på betonggrunn: 10 px radius, hårlinje `#D2CCC0` i tyngde 1,
skyggebåret i tyngde 2 og 3. Identitetsfarge kan stå som **3 px skinne i topp** —
aldri som farget venstrekant, og aldri to varianttoner i samme visning.

Transparens brukes tre steder, ikke flere: rutenettet (7 % på lys, 13 % på mørk),
det mørke sjiktet under tekst på foto, og `--ak-signal-myk` (10 %) som svakt
underlag for en signalmarkering. **Ingen blur, ingen frostet glass** — verkstedet
er flatt. Ingen protection-kapsler; tekst på foto løses med gradering fra bunnen.

### Instrumentlaget — merkets grafiske element

Hentet fra det AK Golf faktisk gjør: spredningsellipsen, pyramideaksene,
avstanden fra pinnen.

- **Rutenettet:** 56 px ruter (7 × 8), én piksel, `rgba(20,20,19,.07)` på lys og
  `rgba(250,249,245,.13)` på mørk. 24 px på små flater og i kort.
- **Målestokken:** merker hver 12 px, et langt hvert femte, 42 % styrke.
- **Krysset:** 11 px der to akser møtes. Ett kryss er presisjon; fire er en ramme.

> **Regelen som holder det ærlig:** instrumentlaget skal aldri gi inntrykk av å
> vise data som ikke finnes. Et rutenett i bakgrunnen er tekstur. Et rutenett
> **med tall på aksene** er en påstand — og da må tallene være målt, med dato og
> kilde. Ingen kurver uten data, ingen spredninger uten målinger, ingen akser
> uten enhet.

**Målinger som grafikk finnes nå som komponenter** — `Spredning`, `Tidsserie`,
`Fordeling`, `Akse` — og alle fire nekter å rendre uten kilde og dato. Det er
regelen over gjort til kode.

Én flate har sjelden mer enn **ett** instrumentelement. Aksentflater dekker minst
18 % av visningen når de brukes (5 %-regelen fra 31.08 er opphevet).

### Bevegelse, hover, trykk

120 ms hover, fokus og trykk · 220 ms panel og innholdsbytte · 420 ms seksjon ved
rull. Kurve `cubic-bezier(0.2, 0, 0.2, 1)`. Aldri `ease-in` alene. Alle tre
settes til 0 ved `prefers-reduced-motion`.

- **Hover:** primærknapp går fra fyll `#C4361B` til signal `#B83217` (litt
  mørkere, ikke lysere). Sekundærknapp får `#DDD8CE`-flate. Kort løftes fra loft
  1 til loft 2. Radrader får hvit arkflate. Aldri opacity-hover, aldri skalering.
- **Fokus:** 2 px signalring med 2 px offset, via `:focus-visible` i
  `tokens/samspill.css`. Synlig overalt, aldri fjernet — en komponent som setter
  `outline: none` uten å sette ringen i stedet, er en feil.
- **Trykk:** ingen shrink, ingen bounce. Fargeskiftet er trykkbekreftelsen.
- **Deaktivert:** 42 % opacity, `not-allowed`.

En animasjon skal svare på «hvor kom dette fra» eller «hva skjedde nå» — aldri på
«se her». Et system som påstår at det måler, kan ikke oppføre seg som en reklame.

### Foto

43 profesjonelle bilder i `assets/foto/`, katalogisert i
`assets/foto/katalog.md` med motiv, bruksområde og retusjstatus per bilde. Én
sesjon, sommer, lavt sollys, ekte økter, Trackman synlig i mange. Fargestemningen
er **varm og naturlig** — grønt gress, blå himmel, gyllent motlys. Ikke kjølig,
ikke gradert, ikke kornet.

Behandling: ingen tunge filtre, ingen sterk vignett, ingen sort-hvitt som
stemning. Løft skyggene lett så bildet møter betongen uten å bli et hull i siden.
**Beskjæring per flate, fokuspunkt og aldri-reglene står i `14-fotobrief.md`.**

Tekst på foto: hvit logo og hvit tekst med et **mørkt sjikt fra bunnen** — en
gradering, ikke et lag over hele bildet. Kontrastkravet 4,5:1 gjelder mot det
bildepartiet teksten faktisk ligger på, ikke mot bildets gjennomsnitt. Er teksten
fortsatt vanskelig å lese, er det feil bilde.

De fem sterkeste: **#9** (coach og spiller foran Trackman — hele merket i ett
bilde, renset) · **#29** (coach leser linja) · **#24** (ball i luften) · **#44**
(ovenfra, lange skygger) · **#28** (mørk bakgrunn, bygget for tekst over).

**Sponsorlogoen** på coach-klærne er fjernet i #3, #9, #12, #14 og #41 (ligger
i `public/brand/foto/renset/`). Tretten bilder gjenstår — til de er rene brukes
bilder der coachen står langt fra kamera, i silhuett eller ikke er med.

**Aldri stockbilder. Aldri bilder av mindreårige uten skriftlig
foreldresamtykke** — hvert identifiserbart barn, også i gruppebilder.
Samtykketeksten står i `14-fotobrief.md`.

**To hull i arkivet** som ikke kan designes bort: **ingen bilder av juniorer**
(motivet som betyr mest når junior er primærpublikum), og bare ett portrett
(#41, Anders Kristiansen — Markus Røinås Pedersen mangler). Briefen for neste
sesjon som lukker begge står i `14-fotobrief.md`.

### Layout

Sidebredde 1180 px sentrert, 32 px kantmarg på Mac og 16 px på mobil. Toppnav er
80 px på Mac og 64 px på mobil, hårlinje under, **ikke fast (sticky)** — merket
har ingen elementer som følger rullingen. Aktiv navlenke merkes med 2 px
signalstrek, ikke med farget flate. **Mobil 390 er den viktigste visningen**, ikke
desktop: materiellet skannes stående, ute, ofte i sollys.

---

## 4 · ICONOGRAPHY

**Ikoner er Lucide, og settet finnes: 24 ikoner i `assets/ikon/` og i
komponenten `Ikon`.** Regler og liste i `guidelines/13-ikoner.md`.

- 24 × 24 viewBox, `stroke-width: 2`, `fill: none`, `stroke: currentColor`.
- `stroke-linecap: square` og `stroke-linejoin: miter` — merket er rolig, ikke
  rundt. Dette avviker fra Lucides `round`-standard, med vilje.
- Ikonstørrelse følger typeskalaen: 16, 18, 20 eller 22 px. 8 px mellom ikon og
  tekst.
- Ikonet er aldri eneste bærer av mening: alene krever det `merkelapp`.

**Trenger du flere ikoner:** hent fra Lucide, sett square/miter, legg til i
`Ikon.jsx` OG `assets/ikon/`. Aldri tegn et eget.

**Ingen emoji noe sted.** Ingen unicode-tegn brukt som ikon — med ett unntak:
skilletegnene `·` og `/` i mono-linjer (kildelinjer, brødsmuler) er typografi,
ikke ikonografi. Ingen png-ikoner. Ingen illustrasjoner — merket har ingen
illustrasjonsstil, og skal ikke få en uten at Anders bestemmer det.

**Logofilene i `assets/logo/`** (19 SVG-er) er ukrenkelige og rendres fra fil:

| Fil | Brukes på |
|---|---|
| `ak-golf-logo-primary-on-light.svg` | Betonggrå og hvit flate — **standard** |
| `ak-golf-logo-primary-on-dark.svg` | Mørk flate |
| `ak-golf-logo-white-on-dark.svg` | Foto og film, mørk bakgrunn |
| `ak-golf-logo-white-mono.svg` | Én farge hvit — brodering, gravering |
| `ak-golf-logo-black-mono.svg` | Én farge sort — stempel, faks, avis |
| `ak-golf-logo-primary-mono.svg` | Én farge signalrød |
| `ak-golf-merke-kvadrat.svg` | Profilbilder, 78 % dekning, skarpe hjørner |
| `ak-golf-favicon.svg` | Nettleserfane, leses ned til 16 px |
| `ak-golf-laas-<variant>[-pa-morkt].svg` | Logo + virksomhetsnavn, låst. Fem varianter × 2 |

`ak-golf-logo-white-on-green.svg` er historisk og er **ikke** med i pakken.

---

## 5 · Konflikter i kildene — løst 02.09.2026

Kildepakken ble skrevet over to dager, og verksted-omleggingen 01.09.2026 rakk
ikke alle filene. Fram til 02.09 lot dette systemet uenighetene stå i kildene og
valgte nyeste beslutning. **02.09.2026 ble kildefilene selv rettet**, i masteren
og i repoet, så tabellen under er historikk — ingen av sprikene finnes lenger:

| Sprik (til 02.09) | Løst slik |
|---|---|
| `03-logo.md` og `09-varianter.md` sa clay `#B85C3D` og blekk `#141413` | Begge sier nå signal `#B83217`, tekst `#1F1D1A` |
| `05-typografi.md`, `10-forbudt.md` og denne readme-en sa Archivo Narrow + Poppins | Alle sier nå IBM Plex-familien, som `type.css` |
| `02-arkitektur.md` oppga lyse varianttoner (clay/grønn/blå/skifer/oker) | Sier nå `farge.css`s målte toner (`#4A6B33`, `#2B5F87`, `#4A4F58`, `#7A5A22`) |
| `09-varianter.md` sa hårlinje `#D1CFC5` | Sier nå `#D2CCC0` |
| `03-logo.md` sa seks låsefiler | Sier nå fem varianter × lys/mørk |
| `samspill.css` satte `scale(0.98)` på trykk; §3 sa «ingen shrink» | Skaleringen er fjernet |
| `Felt.jsx` satte `outline: none` og fjernet fokusringen | Ringen kommer nå fra `.ak-felt:focus-visible` |
| `instrument.css` bruker `rgba(20,20,19,.07)`; bestillingen skrev `rgba(31,29,26,.075)` | Koden er fasit; bestillingen er slettet |
| Varsel `#8A6410` var 4,2:1 på grunn; §3 sa «alle par målt» | `#755608` (5,4:1), og generatoren måler alle 52 par |

`uploads/` (kildepakken, 100 filer) er slettet 02.09.2026 — den dupliserte alt
og lå ved siden av fasiten som om den var fasit. Kilden er repoet.

---

## 6 · To spørsmål bestillingen ba om svar på

**1 · Hvordan ser et målt tall ut når det står alene?**

Svaret ligger i komponenten `Talleblokk`, og det er merkets signatur:

```
CARRY, DRIVER              ← mono-caps 11 px, 0.2em sperring
+12,4 m                    ← mono 500, 72–112 px, tabular-nums
▎▏▏▏▏▎▏▏▏▏▎                ← målestokk, 240 px, 42 % styrke
Vi målte i seks økter…     ← Plex Sans 17 px, én setning
Trackman · 12.05–18.08.2026 · 38 målinger   ← mono 13 px, dempet
```

**Målestokken mellom tallet og kilden er hele poenget.** Uten den blir dato og
kilde en fotnote, og fotnoter leses ikke. Med den blir de fortsettelsen av en
strek som allerede sier «dette kommer fra et instrument» — leseren følger streken
ned til kildelinja i stedet for å hoppe over den. Signalrødt brukes på tallet
selv, og på ett tall per flate. `estimat`-flagget setter ESTIMAT i `--ak-varsel`
foran kilden, i samme linje — ikke som en parentes lenger ned.

**2 · Hvor langt skal rutenettet gå på fysiske flater?**

Forslag: **rutenettet stopper ved A3.**

- **Roll-up og skilt i simulatorhallen:** ja, i 24 px rute (ikke 56). På to meter
  høyde leses 56 px-ruter som en tabell; 24 px leses som tekstur. Rutenettet
  gjør at flaten tåler å være nesten tom, og en roll-up med lite tekst er bedre
  enn en full.
- **Plakat A3/A2:** ja, men bare i det partiet der tallet står — ikke over hele
  arket.
- **Visittkort 85 × 55 mm og bag-tag:** **nei.** På en flate under A5 blir
  rutenettet moiré i trykk, og på tekstil forsvinner det helt. Der bæres merket
  av målestokken langs én kant i stedet — samme signal, én strek, ingen
  trykkrisiko.
- **Brevark og tilbud:** nei i tekstpartiet. Målestokk langs venstremargen.

Begrunnelsen er den samme som holder instrumentlaget ærlig: teksturen skal kunne
fjernes uten at flaten slutter å virke. Klarer den ikke det i trykk, skal den
ikke være der.

---

## 7 · Trykk — utgangsverdier, ikke fasit

**Disse skal bekreftes mot et fysisk prøvetrykk før første opplag.** En mettet
rød skifter merkbart mellom skjerm og papir, og en matematisk RGB-konvertering
oppgitt som fasit er en feil som først synes når opplaget er levert.

| Farge | Skjerm | CMYK, forslag | Pantone, forslag |
|---|---|---|---|
| Signal | `#B83217` | 12 / 88 / 100 / 3 | 1795 C eller 179 C |
| Signal, fyll | `#C4361B` | 10 / 88 / 100 / 1 | 1795 C |
| Tekst / blekk | `#1F1D1A` | 62 / 58 / 62 / 72 | Black 6 C eller Neutral Black C |
| Grunn, betonggrå | `#E8E4DC` | 7 / 7 / 12 / 0 | Warm Gray 1 C |

Pantone-forslagene er nærmeste standardfarge, ikke en måling. **Be trykkeriet
måle mot prøvetrykk.**

- **Minste trykkstørrelse for logoen: 12 mm bredde.** Under det forsvinner ballen.
- **Brodering og gravering:** kun enfarget, ingen halvtoner —
  `ak-golf-logo-white-mono.svg` eller `ak-golf-logo-black-mono.svg`. Ballen må
  broderes som fylt sirkel, ikke som kontur; minste broderistørrelse er 20 mm
  fordi ligaturen tetter seg under det.
- **Mørkt tekstil:** hvit enfarget logo. Ikke primærlogoen med rød ball — rødt
  på mørk bomull mister metningen og leses brunt.
- **Papir:** ubestrøket, 120 g brevark / 300 g visittkort. Betonggrå skal ikke
  trykkes som flate på hvitt papir i store partier; velg et ubestrøket papir som
  ligger nær `#E8E4DC` i stedet.

---

## 8 · Index — hva som ligger hvor

**Rot**

| Fil | Hva det er |
|---|---|
| `readme.md` | Denne. Merkeforståelse, innhold, visuelle fundament, ikonografi, trykk, styring |
| `CHANGELOG.md` | Hva som endret seg, når, og hvem som bestemte |
| `tokens.json` | **Den ene kilden.** W3C-format. Alt i `tokens/` som er merket GENERERT kommer herfra |
| `ak-golf-tokens.ts` | Generert TS-speil — peker på `var(--ak-*)`, dupliserer ingen hex |
| `styles.css` | Systemets ene inngang. Kun `@import`-linjer |
| `SKILL.md` | Gjør pakken brukbar som Agent Skill i Claude Code |
| `thumbnail.html` | Tegnet til hjemmesida. Ikke innhold |

**`tokens/`** — `farge.css` · `type.css` · `rom.css` · `bevegelse.css` ·
`instrument.css` · `tailwind-theme.css` (Tailwind v4 `@theme`) · `kontrast.md`
(52 målte par) — alle **generert fra `tokens.json`**, aldri redigert for hånd.
Håndskrevne: `fonter.css` (Google Fonts) · `semantikk.css` (rollenavn) ·
`grunnlag.css` (basisregler, `.ak-maalt`, `.ak-etikett`) · `samspill.css`
(hover, trykk, fokus, det som kommer til syne).

**`guidelines/`** — fjorten kapitler (`01-merket.md` … `14-fotobrief.md`),
pluss `merkeplattform.md` og `tekstkonsept.md`. **`tekstkonsept.md` er ferdig
tekst — ikke skriv ny der den finnes.** I tillegg ligger 25 `kort-*.html`-spesimen
her; de fyller Designsystem-fanen og er ikke lesestoff.

**`assets/`** — `logo/` (19 SVG-er, ukrenkelige) · `ikon/` (24 SVG-er) · `foto/`
(43 bilder + `katalog.md`, som er nødvendig for å velge bilde).

**`components/`** — 37 komponenter i sju grupper. Alle leser `--ak-*`-tokens, har
`.d.ts` med props og `.prompt.md` med bruk.

| Gruppe | Komponenter |
|---|---|
| `merke/` | `Logo` · `Navnelaas` · `Instrumentflate` · `Maalestokk` · `Ikon` · `Initialer` |
| `handling/` | `Knapp` · `IkonKnapp` · `Paginering` |
| `skjema/` | `Felt` · `Velger` · `Avkrysning` · `Radiogruppe` · `Datovelger` |
| `flate/` | `Kort` · `Fotokort` · `Akkordeon` · `Dialog` · `Skjelett` |
| `maaling/` | `Talleblokk` · `Faktarad` · `Tabell` (sorterbar) · `Liste` · **`Spredning` · `Tidsserie` · `Fordeling` · `Akse`** |
| `navigasjon/` | `Toppnav` · `Mobilmeny` · `Brodsmuler` · `Faner` |
| `melding/` | `Merkelapp` · `Status` · `Varsel` · `TomTilstand` · `Melding` + `Meldingsstakk` · `Hint` |

**`ui_kits/`** — malene, hver som en klikkbar flate:

| Mappe | Hva det er |
|---|---|
| `markedsside/` | Forsiden og junior-siden i Mac 1440 og mobil 390, lys og mørk. Tekst fra tekstkonsept.md |
| `booking/` | Kartleggingsøkt i fire steg: økt, dag og tid, kontakt, bekreftelse. Feiltilstand. Pris fra basen |
| `feilside/` | 404 og 500. Feilkoden i mono, én vei videre |
| `kampanje/` | Landingsside for én kampanje — ett budskap, ett skjema, ingen navigasjon |
| `presentasjon/` | Forside, innholdsside, tallside, avslutning. Til foreldremøter, klubbstyrer og forbund |
| `dokument/` | Brevark, tilbud og sportsplan — det som sendes som PDF |
| `epost/` | Nyhetsbrev, transaksjonsmal og signatur per variant |
| `sosialt/` | Kvadrat 1080, stående 1080×1350, story 1080×1920. Seks innleggstyper |
| `fysisk/` | Roll-up 850×2000, plakat A3, visittkort 85×55, bag-tag, skilt |
| `foreldrerapport/` | Hvordan et målt tall presenteres utenfor appen, med dato og kilde |
| `varianter/` | Samme mal i Junior Academy, Academy og Organisasjon — systemets viktigste prøve |

**`templates/`** — `presentasjon/` er lagt inn som en redigerbar mal et annet
prosjekt kan starte fra (fire sider: forside, innhold, tallside, avslutning).
De øvrige malene ligger som `ui_kits/`; si fra hvilke av dem som skal gjøres om
til redigerbare maler, så flyttes de.

**Fonter.** `tokens/fonter.css` laster IBM Plex Sans Condensed, IBM Plex Sans og
IBM Plex Mono fra Google Fonts i nøyaktig de vektene merket bruker. Skal systemet
være selvforsynt (offline, e-post, trykkeri), må woff2-filene kopieres til
`assets/font/` og `@font-face`-regler skrives i `tokens/fonter.css`.

---

## 9 · Kilder

Materialet ble levert 01.09.2026 som «AK Golf — kildepakke til Claude Design»
(`LES-MEG.md` og `BESTILLING.md`), og lå i `uploads/` fram til 02.09.2026, da
mappen ble slettet fordi den dupliserte alt som nå ligger på plass i `tokens/`,
`guidelines/` og `assets/`. Kilden er kodebasen: `designsystem/ak-golf/`,
`public/logos/`, `public/brand/foto/`, `docs/MASTERPLAN-GJENSTAAENDE.md` og
`.claude/rules/beslutninger.md`. Speilet dit oppdateres fra denne masteren.

---

## 10 · Styring — hvem, hvordan, når

**Eier:** Anders Kristiansen. Han låser verdier (farge, font, romskala, logo) og
regler. Alt annet kan foreslås av hvem som helst som jobber i systemet.

**Én sannhet, to steder.** Masteren er dette Claude Design-prosjektet
(`3e5c851c-4b78-41ab-8ced-7b11048838f9`). Speilet er `designsystem/ak-golf/` i
kodebasen, hentet med `node scripts/speil-ak-golf.mjs`. Verdiene bor i
`tokens.json`; CSS, Tailwind, TS og kontrasttabellen genereres av
`scripts/ak-golf-tokens.mjs`, og `npm run verify` feiler hvis noe har sklidd.
**Rediger aldri en generert fil. Rediger aldri speilet direkte** — endre
masteren, speil, verifiser.

**Versjon.** `$version` i `tokens.json` og øverst i denne fila. **Major** når en
låst verdi endres eller en komponent fjernes · **minor** når noe legges til ·
**patch** når noe rettes uten at verdier eller API endres. Hver endring får en
rad i `CHANGELOG.md`: hva, hvorfor, hvem.

**Slik foreslår du en endring:**

1. Sjekk `10-forbudt.md` og `CHANGELOG.md` — er det bestemt før?
2. Er det en verdi: endre `tokens.json`, kjør `ak-golf-tokens.mjs --write`, les
   `kontrast.md`. Holder ikke 4,5:1, er forslaget dødt før det er sendt.
3. Er det en komponent: `.jsx` + `.d.ts` + `.prompt.md`, og et kort som viser
   alle tilstander — hvile, hover, fokus, feil, tom. Tastatur først.
4. Er det tekst: mål den mot §2. Har den et tall, har den en kilde.
5. Render kortet, se på det i lys og mørk, 390 og 1440. Skriv raden i
   `CHANGELOG.md`. Anders sier ja eller nei.

**Vaktene** (kjører i `npm run verify`): `ak-golf-tokens.mjs` (sklidde filer,
kontrast) · `check-ak-golf-kits.mjs` (konsollfeil, overflow på 390/768/1440,
font lastet, lorem, «angrepsvinkel», utropstegn, emoji, fokusring — i lys og
mørk) · `_adherence.oxlintrc.json` i Claude Design (rå hex, rå px, fremmed font).

**Det som fortsatt ikke er målt:** trykkverdiene i §7 (venter på prøvetrykk),
fokuspunkt per foto (`katalog.md`), og hvordan systemet oppfører seg i en ekte
e-postklient — kitene i `epost/` er tegnet, ikke testet i Outlook og Gmail.
