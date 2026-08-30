# Claude Design-prompt — WANG Toppidrett + Team Norway (delt testdatabase)

Skrevet 30.08.2026. Alle tokenverdier under er lest ut av koden samme dag
(`src/styles/wang-tokens.css`, `src/styles/train-lock-tokens.css`, `prisma/schema.prisma`,
`prisma/seed-data/ngf-test-battery.json`). Ikke endre en verdi uten å endre den i koden i
samme PR.

---

## LIM INN FRA OG MED HER

# Oppdrag: designsystem + skjermer for WANG Toppidrett og Team Norway

Du designer to organisasjonsflater i AK Golf HQ som deler ett testbibliotek og én
testresultatbase. Alt skal være produksjonsklart design, ikke skisse. Norsk bokmål i all
skjermtekst. Aldri emoji — ikoner er Lucide.

## 1. Hvem dette er for

**Anders Kristiansen** er sportssjef og trener ved WANG Toppidrett Fredrikstad (11 elever på
golflinjen, VG1–VG3) og har seks tilknytningspunkter i Team Norway Golf, Norges Golfforbunds
toppidrettssatsing. Han er ikke programmerer. Han jobber ofte stående på treningsfeltet med
telefonen i hånden mellom økter. Han har ADHD: skjermen må kunne skannes på fem sekunder, med
én tydelig handling om gangen.

To brukergrupper til:
- **Andre WANG-trenere og Team Norway-trenere** — leser data om spillere de har samtykke til.
- **Foreldre til mindreårige elever** — styrer hva som deles, ser hva som er delt.

Elevene er mindreårige. Det styrer design: ingen elevnavn på åpne flater, tydelig hvem som ser
hva, og samtykke som er lesbart for en forelder uten forkunnskap.

## 2. Den bærende ideen: ett testbibliotek, én resultatbase

Dette er hele poenget med leveransen, og det må være synlig i designet:

- En **testprotokoll** opprettes én gang og deles mellom AK Golf Academy, WANG Toppidrett og
  Team Norway. Ingen lager sin egen kopi av «Benkpress».
- Protokollen er **versjonert og låses ved første bruk**. Et resultat peker alltid på den
  versjonen det ble målt med. Endrer eieren protokollen, blir det versjon 2 — gamle resultater
  flytter seg ikke.
- Et **testresultat følger spilleren**, ikke organisasjonen. Måler Anders en test på WANG, ser
  Team Norway-treneren samme måling — hvis spilleren (eller foresatt) har samtykket.
- **Organisasjonen eier aldri dataene.** AK Golf er databehandler; spilleren eier profilen.

Designet må gjøre tre ting synlige uten forklaring: hvilken organisasjon som **eier**
protokollen, hvilken **versjon** et resultat er målt med, og hvem som **kan se** resultatet.

### Delingen skjer i to trinn, aldri ti brytere
- **Trinn 1 (gratis å dele):** testresultater, turneringsresultater, statistikk.
- **Trinn 2 (krever betalt profil):** komplett profil — treningsplan, TrackMan, analyse, fremgang.

Spilleren, eller forelder for mindreårige, styrer trinnene per organisasjon og kan trekke
samtykket når som helst. To brytere per organisasjon. Er samtykket trukket, forsvinner
spilleren fra organisasjonens liste — ikke en gråtonet rad, den er borte.

### TruthLayer — regelen som styrer hvert eneste tall
Alt appen påstår om et menneske skal kunne spores til en måling med **dato og kilde**.
Estimerte tall merkes eksplisitt som estimat. I praksis for deg som designer: hvert tall på en
skjerm har en liten kildelinje under eller ved siden av — «Målt 14.08.2026 · Benkpress v2 ·
Anders K.» Ingen tall svever uten opphav. Designe et tall uten plass til kilden er å bryte
regelen.

## 3. Testbatteriet — bruk disse ekte navnene

De 20 protokollene som finnes i basen i dag (Putt Speed Control har to gjennomførings-
varianter, så listene viser 21 rader):

Driver Basic · Inspill Basic · Wedge Variation · 8-Ball Variation · Putt 1-3m · Driver Gate ·
Putt Gate · Nærspill Gate · VISA Express · Putt Speed Control · Wedge Gate · Trapbarmarkløft ·
Benkpress · Stille lengde · Ballkast knestående · Clubhead Speed (CHS) · PEI Test Bane ·
Inspill 120m · Inspill 160m · Inspill Variation

De fem fysiske testene (Trapbarmarkløft, Benkpress, Stille lengde, Ballkast knestående,
Clubhead Speed) er de som føres i bulk på testdager — se skjerm W4.

Aldri lorem ipsum. Bruk ekte protokollnavn, ekte norske etiketter. Tall du ikke har fått
oppgitt, merker du som eksempel i designnotatet.

## 4. Designsystemet — to paletter, én struktur

### 4.1 WANG-flatene: eksisterende palett, uendret
WANG har allerede et designsystem i produksjon. Bygg videre på det, ikke ved siden av. Alle
verdier under er hentet fra `src/styles/wang-tokens.css`:

**Merkevarekjerne**
- Navy `#17446F` (primær), Teal `#2E857D` (suksess), Mint `#49CA9F` (aksent, også fokusring),
  Teal-tekst `#226F67`

**Kategorifarger** (brukes på pyramide/kategori-chips, aldri som status)
- Oransje `#F47B20` · Gul `#FCD700` · Rosa `#D12A5C` · Blå `#007DB1` · Lilla `#7F1975` ·
  Grå `#D2D2D2`
- Mørke tekstvarianter, kun til tekst på tonet flate: oransje `#B4571A`, blå `#00618A`,
  gul `#7A6200`

**Flater og tekst**
- App-bakgrunn `#F4F6F8` · kort `#FFFFFF` · primærtekst `#1E293B` · sekundærtekst `#475569` ·
  dyp navy `#0F172A` · hårfin kant `#E9EDF1`
- Tekst på mørk: hvit, med trinnene 0.72 / 0.78 / 0.85 opasitet

**Form**
- Radius: kort 26px, lite kort 20px, felt 16px, chip 999px, ikon-chip 14px
- Skygger, aldri kanter, på kort: `0 8px 24px rgba(23,68,111,0.08)`; liten variant
  `0 4px 14px rgba(23,68,111,0.06)`; hero `0 18px 40px rgba(15,23,42,0.22)`
- Spacing-skala: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64

**Bevegelse**
- Ease-out `cubic-bezier(0.22,1,0.36,1)`, spring `cubic-bezier(0.34,1.56,0.64,1)`
- Varighet 140ms rask / 220ms normal / 420ms treg; trykk skalerer til 0.97

**Typografi**
- Overskrift/etikett: Montserrat (variabel `--font-brand`), 700, versaletiketter 12px med
  0.08em sperring
- Brødtekst: Quattrocento Sans (variabel `--font-body`)
- Tall settes alltid med `font-variant-numeric: tabular-nums`

**WANG-flatene er enpalett lys.** De har ingen mørk variant i dag, og det er et bevisst valg.
Ikke tegn en mørk WANG-variant uten at det er bestilt.

### 4.2 Team Norway-flatene: nøytral struktur, branding kommer separat
Anders leverer et komplett Team Norway-brandingsystem selv. **Ikke oppfinn TN-farger.** Tegn
TN-skjermene på det nøytrale produkt-tokensettet (Train-lock, verdiene under), med logo og
skinne som eneste brandingpunkter, slik at Anders' system kan legges oppå uten omtegning.
Team Norway-rødt brukes kun på logo og skinne — aldri som statusfarge.

Train-lock-verdier (`src/styles/train-lock-tokens.css`), lys variant:
- Scene `#FFFFFF` · kort/ark `#F2F2F2` · dock/rail/felt `#E9E9EB` · hårfin `#00000014` ·
  spor/skjelett `#DDDDDE`
- Tekst `#111111` · dempet tekst `#6E6E73`
- Primærhandling: sort pille `#000000` med hvit tekst
- Fullført: varm `#B85C3D` med hake. Grønn `#34C759` KUN på «Godta» og «Publisert».
  Rød `#FF3B30` KUN på feil. Gul `#FFD60A` på varsel.
- Radius: kort 20px · pille 999px · rad 12px · felt 16px · ark 20px 20px 0 0
- Trykkflate minimum 44px, CTA-høyde 48px
- Typografi: Poppins (sans) og IBM Plex Mono. Tittel 34/700, korttittel 26/700, CTA 16/700,
  brødtekst 15/600, meta 13/400 dempet, versaletikett 11/600 med 0.08em sperring. Store tall
  56–104px, 700, aldri mono.
- Mac-rail 232px med tekst · artefaktpanel høyre 380px

Train-lock-flatene skal virke i **både lys og mørk** modus. WANG-flatene skal ikke.

### 4.3 Designsystem-sidene du skal levere
1. **Farger** — begge palettene side om side, med hvilken som gjelder hvor, og eksplisitt
   regel for hva som aldri er en statusfarge.
2. **Typografi** — begge skalaene, med ekte norsk tekst i hvert trinn.
3. **Flater, form og bevegelse** — kort, ark, chips, skygger, trykk-tilbakemelding.
4. **Komponentbibliotek** — hver komponent i alle sine tilstander:
   - **Testkort** (protokoll i bibliotek): navn, eierorganisasjon, versjonsmerke, hvem den er
     delt med, sist endret
   - **Resultatrad**: verdi, endring siden forrige, kildelinje med dato og protokollversjon
   - **Versjonsmerke**: «v2 · låst 14.08.2026»
   - **Kildechip** (TruthLayer): dato · protokollversjon · hvem som målte
   - **Estimatmerke**: visuelt tydelig forskjellig fra et målt tall
   - **Samtykkebryter**: to trinn, med klartekst om hva hvert trinn åpner
   - **Elevrad**: navn, klassetrinn, siste test, varselprikk (fylt = trenger deg, åpen = følg
     med, ingen = på planen)
   - **Organisasjonsmerke**: viser om noe eies av AK Golf, WANG eller Team Norway
   - **Tom, laster, feil** for hver av dem

## 5. Skjermene

Tegn hver skjerm i **fire visninger: mobil 390px og Mac 1440px**, og for Train-lock-skjermene
**både lys og mørk**. WANG-skjermene kun lys. Tom tilstand tegnes alltid — det er den Anders
møter når arbeidet er unnagjort.

### Prioritet 1 — dette er leveransen

**W1 · Elevoversikt (WANG)**
Anders' inngang. 11 elever i én liste han kan skanne stående. Per elev: navn, klassetrinn,
neste økt, siste aktivitet, én varselprikk. Ikke SG-form, ikke etterlevelse, ikke handicap —
det er lesestoff og hører hjemme i elevkortet. Filtre: klassetrinn, «trenger meg».
Tom tilstand: «Ingenting krever deg nå.»

**W2 · Elevkort med vurdering (WANG)**
Master–detalj fra W1. Øverst: hvem eleven er, klassetrinn, siste måling. Deretter faner eller
seksjoner: **Vurdering** (Anders' egen sportslige vurdering — heter «vurdering» i UI, aldri
«karakterer»; skolens karakterer finnes ikke i dette produktet), **Tester** (siste resultat per
protokoll, med utvikling), **Utvikling** (kurve over tid mot eleven selv). Hvert tall med
kildelinje. Én tydelig handling: «Skriv ukens vurdering».

**W3 · Testbibliotek (delt)**
Alle protokollene, gruppert etter pyramideområde og fysisk/golf. Per rad: navn,
eierorganisasjon, versjon, delt med hvem, sist brukt. Søk og filter på organisasjon. Dette er
skjermen som gjør delingen forståelig — en trener skal se på ett blikk at «Benkpress» eies av
AK Golf og brukes av alle tre.

**W4 · Testføring i bulk (WANG) — den viktigste nye skjermen**
På testdager føres fysiske tester i kø: én øvelse, 10+ elever etter tur. Flyt: velg protokoll →
velg gruppe → før elev for elev. Skjermen skal fungere med telefonen i én hånd på treningsfeltet:
stort inntastingsfelt, tydelig hvem som står for tur, hvem som er ført, hvem som gjenstår, og en
enkel vei tilbake for å rette. Ingen dialogboks som stjeler fokus mellom hver elev.
Tegn både mobil (primærcase) og Mac.

**W5 · Testføring 1:1**
Samme protokoll, én spiller, steg for steg gjennom protokollens steg. Vis hvilket steg man er
på, hva som er registrert, og hva som gjenstår. Avbryt skal være mulig uten å miste det som
allerede er ført.

**W6 · Testresultat-detalj**
Én måling: verdien stort, protokollversjonen den ble målt med, dato, hvem som målte, historikk
bakover for samme protokoll, og hvem denne målingen er delt med. Her skal TruthLayer være helt
konkret.

**T1 · Team Norway Workdesk — hjem**
Samlingspunktet som skal erstatte Messenger-grupper, e-post og Word. Øverst: hva som krever meg.
Under: mine grupper, kommende samlinger, siste poster. Nøytral Train-lock-struktur, TN-logo og
skinne som eneste branding.

**T2 · Team Norway — spillere**
Kun spillere med gyldig samtykke, gruppert per gruppe. Per spiller: navn, årgang, siste
testmåling, når sist oppdatert. Tydelig tekst om at listen viser samtykkede spillere, ikke alle.
Tom tilstand må forklare hvorfor listen er tom uten å virke som en feil.

**T3 · Spillerkort på tvers av organisasjon (Team Norway)**
Samme spiller, sett fra Team Norway. Viser **kun** det spilleren har samtykket til. Hvis bare
trinn 1 er delt, skal skjermen si det tydelig og ikke bare mangle innhold. Testresultatene som
vises er de samme radene Anders førte i W4 — vis at det er samme måling, med organisasjonsmerke
på hvem som målte.

**S1 · Protokoll-detalj med versjonshistorikk (delt)**
Hva protokollen måler, stegene, hvilken versjon som er gjeldende, versjonshistorikk med
låsedato, hvilke organisasjoner som bruker den, og hvor mange målinger som ligger på hver
versjon. Handling for eier: «Ny versjon». Handling for mottaker: ingen — bare bruk. Gjør den
forskjellen synlig.

**S2 · Samtykke og deling (forelder/spiller)**
Per organisasjon: to brytere, trinn 1 og trinn 2, med klarspråk om nøyaktig hva hvert trinn
åpner og hvem som får se det. Historikk over hva som er delt og når. Tydelig, ikke skremmende,
vei til å trekke samtykket. Denne skjermen leses av en forelder som aldri har sett appen før —
skriv den deretter.

### Prioritet 2 — tegn hvis prioritet 1 er komplett

**T4 · Poster til gruppe og enkeltspiller (Team Norway)**
Trener poster med tekst, video, bilder, lenker og vedlegg (flybilletter, hotellbekreftelser).
Ingen fri chat. 1:1-poster til mindreårige skal være synlig sporbare og lesbare for forelder —
vis det i selve postens design, ikke i en innstilling.

**T5 · Dokumenter med lesekvittering (Team Norway)**
Filer per gruppe, med «12 av 14 har åpnet» og «sist oppdatert».

**T6 · Samling (Team Norway)**
Én samling: dato, sted, deltakere, program, dokumenter, hvem som har bekreftet.

## 6. Slik skal hver skjerm leveres

Per skjerm, i denne rekkefølgen:
1. Mobil 390px — **suksess, tom, laster, feil**
2. Mac 1440px — suksess
3. For Train-lock-skjermene: samme i mørk
4. Kort designnotat: hvilken beslutning skjermen løser, hvilke tall som er eksempler, og hva du
   var usikker på

## 7. Regler som ikke kan brytes

- **Ingen emoji.** Ikoner er Lucide.
- **Ingen lorem ipsum.** Ekte norsk skjermtekst overalt.
- **Ingen elevnavn på åpne flater.** Alt som kan nås uten innlogging viser aggregert
  informasjon, aldri en mindreårig ved navn.
- **Fullført-tilstand** på Train-lock-flatene er varm `#B85C3D` med hake. Grønn `#34C759` er
  reservert for «Godta» og «Publisert».
- **Ett tall uten kilde er en feil.** Hvert målt tall har dato og opphav; hvert estimert tall er
  merket som estimat.
- **Én primær handling per skjerm.** Er du i tvil om hva den er, er skjermen ikke ferdig.
- **Vurdering, aldri karakterer.** Skolens karakterer finnes ikke i dette produktet.
- **Ingen nye designtokens.** Bruk verdiene over. Trenger du en verdi som ikke finnes, skriv det
  i designnotatet i stedet for å finne på en.

## 8. Ikke design dette

- Team Norway-farger eller TN-visuell identitet — Anders leverer det selv
- Fri chat mellom trener og spiller
- Rangering av spillere mot hverandre på spillerens eller forelderens flate — kohort-
  sammenligning er coachens verktøy alene
- Skolens administrasjon: karakterer, fravær, uttak, disiplinærsaker
- Innlogging, betaling og kontoadministrasjon — de finnes allerede

## Start med

Designsystem-sidene (4.3) først, deretter W1 → W2 → W3 → W4. Vis meg de fire skjermene før du
går videre til Team Norway-flatene.

## SLUTT PÅ PROMPT

---

## Til meg selv (ikke lim inn)

Forutsetninger jeg tok, som Anders kan overstyre:

1. **Skjermomfang.** 11 skjermer i prioritet 1, 3 i prioritet 2. Kan kuttes til W1–W4 + S2
   hvis det er for mye på én gang.
2. **WANG forblir enpalett lys.** Beslutningen 26.08 om lys+mørk gjelder PlayerHQ, AgencyOS og
   Forelder — ikke `.wang-tp`, som er enpalett med vilje (se `.claude/rules/gotchas.md`).
   Skal WANG også ha mørk, må prompten endres.
3. **Team Norway tegnes på Train-lock.** Fordi TN-brandingsystemet ikke foreligger ennå, og
   beslutningen 30.08 sier TN-bølgen ikke tegner noe før det er levert. Nøytral struktur er
   veien rundt uten å bryte den.
4. **Versjonerte protokoller som låses ved første bruk** er den anbefalte driftsmodellen fra
   beslutningen 30.08 punkt 6 — den er anbefalt, ikke bekreftet av Anders. Sier han noe annet,
   må W3, S1 og hele versjonsmerket tegnes om.
