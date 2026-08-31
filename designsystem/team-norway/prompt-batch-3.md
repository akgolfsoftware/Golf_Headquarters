# Bestilling: TN-Workdesk batch 3 — kommunikasjon og deling

Skrevet 31.08.2026. Skal limes inn i Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
(`a03bf94a-c923-4c04-82ff-415773557e37`), ikke i et nytt prosjekt.

---

## LIM INN FRA OG MED HER

Fortsett i dette designsystemet. Ikke start på nytt, ikke tegn nye tokens, ikke innfør en ny
stil. `readme.md` og `tokens/` er fasit — **ikke `SKILL.md`**, som er utdatert (se batch 2-
bestillingen for hvorfor).

Du har allerede tegnet årsplan, periodeplan, samling, workbench, grupper, tester, kalender,
utøverdashboard, evaluering, presentasjon, organisasjonsskall, oversikt, fellestesting,
protokollbibliotek, protokolldetalj, uttaksliste, rangliste og skoleoversikt (batch 1+2). Denne
bestillingen er de tre siste skjermene som gjenstår før Team Norway-trenere kan legge bort
Messenger, e-post og Word helt — kommunikasjon og deling.

## Avgjort siden batch 2 — dette endrer omfanget

**Analyse og DataGolf tegnes IKKE i denne pakken, aldri.** Anders bekreftet 31.08.2026 at disse
skjermene (AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt, DataGolfProfil,
TruthLayer) forblir Train-lock-fasit — Team Norway arver kun logo og skinnefarge oppå, ikke egne
Claw-tegninger. Grunn: en TN-spiller er samtidig vanlig PlayerHQ-bruker med ett DataGolf-kort —
to fasiter for samme funksjon ville gitt to ulike skjermer avhengig av inngang. Ikke foreslå
disse skjermene i denne eller senere batcher. Se `.claude/rules/beslutninger.md` §ANALYSE OG
DATAGOLF FOR TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN.

**Dette gjør arbeidsdelingen med Train-lock endelig:** dette systemet tegner `/team-norway/*` og
alt som er unikt for Team Norway (test-føring, uttak, kommunikasjon, deling). Alt som er samme
funksjon spilleren allerede har andre steder i PlayerHQ/AgencyOS, er Train-lock — uansett hvilken
dør TN-menyen lenker til den fra.

## Konteksten som styrer alt i denne batchen

**Poster, ikke chat.** Fri meldingsutveksling mellom trener og spiller finnes ikke i dette
produktet. En trener poster — til en gruppe eller til én utøver — med tekst, bilde, video, lenke
eller vedlegg (flybillett, hotellreservasjon, uttakskriterier). Spilleren leser og kan reagere,
men det er en oppslagstavle, ikke en samtale. Dette er bevisst: det gjør kommunikasjonen sporbar
og søkbar i ettertid, og det fjerner forventningen om at trener svarer med en gang.

**1:1 til mindreårige er ALDRI privat mellom trener og barn.** Idrettens åpenhetsprinsipp krever
at en post til en enkeltutøver under 18 år er synlig for forelder/foresatt i samme øyeblikk den
publiseres. Dette er ikke en innstilling brukeren kan skru av — det er strukturelt i hvem som
kan se posten. Design det slik at det er synlig i selve skjermen hvem som ser en gitt post, ikke
bare i en hjelpetekst.

**Lesekvittering er per person, ikke et samlet prosenttall alene.** «12 av 14 har åpnet
uttakskriteriene» er oppsummeringen en trener trenger på ett blikk, men hun må også kunne se
*hvem* som mangler — ellers kan hun ikke følge opp riktig person.

**To delingstrinn per organisasjon** (fra §FORRETNINGSMODELL: SPILLERLISENSER): en spiller/
foresatt styrer separat om organisasjonen (her: Team Norway) får (1) tester + turneringer +
statistikk, eller (2) komplett profil — treningsplan, TrackMan, analyse, fremgang. To brytere,
aldri ti, og kan trekkes tilbake når som helst.

**TruthLayer og «systemet konkluderer aldri» gjelder fortsatt** — se batch 2-bestillingen, samme
regler, ikke gjenta dem her men ikke bryt dem heller.

## Skjermene

### TN-09 · Grupper med poster (`/team-norway/[gruppeId]`)
Tidslinjen for én gruppe. Treneren poster til hele gruppen: tekst, bilde/video, lenke, eller
vedlegg med tydelig filtype-ikon og størrelse (flybillett.pdf, hotellbekreftelse.pdf). Hver post
viser hvem som postet, når, og — hvis relevant — hvem posten gjelder (f.eks. «Til: Landslags-
samling Marbella»). Ingen svarfelt for fri tekst fra spilleren; en enkel reaksjon (f.eks. «sett»)
er nok til at treneren vet posten er mottatt. Tom tilstand for en helt ny gruppe: forklar at dette
er stedet trenerens poster til gruppen samles, ikke en feilmelding.

### TN-10 · Post til enkeltspiller
Samme postmekanikk som TN-09, men rettet mot én utøver. Skjermen MÅ vise, ikke fortelle,
hvem som kan se denne posten: er utøveren mindreårig, står forelder/foresatt synlig som mottaker
ved siden av spilleren — ikke skjult bak et «i-info»-ikon. Er utøveren myndig, vises kun
utøveren selv. Dette skillet er selve poenget med skjermen; ikke design det bort som en detalj.

### TN-11 · Dokumentdeling per gruppe
Filene delt til en gruppe: navn, type, hvem som lastet opp, «sist oppdatert»-dato, og en
lesekvittering-rad som viser brøken («12 av 14») OG kan åpnes til navnelisten med hvem som
mangler. Utøvere under 18: bruk kun fornavn + forbokstav på en flate flere kan se samtidig
(samme aggregat/navn-regel som TN-08 Skoleoversikt).

### TN-12 · Samtykke — deling per organisasjon
Spillerens (eller foresattes, for mindreårig) egen skjerm: liste over organisasjoner spilleren
er koblet til (her: Team Norway), med de to bryterne — «tester og resultater» og «komplett
profil» — og en tydelig «trekk tilbake»-handling per organisasjon. Vis alltid hva som faktisk
deles akkurat nå, ikke bare hva som er mulig å dele. Dette er en PlayerHQ-skjerm sett fra
spillersiden, ikke en TN-trenerskjerm — tegn den i dette systemets stil likevel, siden det er
TN-relasjonen den forklarer, men merk i designnotatet at den til slutt må leve i PlayerHQ/
Forelder, ikke under `/team-norway/*`.

## Slik leveres hver skjerm

1. Mac 1440 — suksess
2. Mobil 390 — **suksess, tom, laster, feil**
3. Kort designnotat: hvilken beslutning skjermen løser, hvilke tall/navn som er eksempler, hva
   du var usikker på

Mørk flate brukes kun der systemet allerede bruker den — hero og seksjonsskille. Skjema,
tidslinje og dokumentliste er lyse.

## Regler som ikke kan brytes

- **Ingen fri chat noe sted.** Finner du deg selv i ferd med å tegne et tekstfelt for spillerens
  svar, stopp — det er ikke denne batchens skjerm.
- **1:1-post til mindreårig uten synlig forelder-mottaker er en feil**, ikke en variant.
- **Ingen mindreårige ved navn** på en flate flere brukere ser samtidig (gruppeoversikt,
  dokumentliste) — kun i enkeltvisning man har tilgang til.
- **Merkevarerød `#D70232` er identitet:** logo, skinne, «denne utøveren». Aldri statusfarge —
  status bruker `#C2352B`.
- **Ingen emoji.** Trenger en skjerm ikoner, bruk Lucide og si det i designnotatet.
- **Ingen lorem ipsum.** Ekte norsk skjermtekst overalt.
- **Ingen nye tokens.** Mangler du en verdi, skriv det i designnotatet framfor å finne på en.

## Ikke design dette i denne batchen

- Analyse, DataGolf, testbatteri, cockpit — Train-lock, aldri Claw (se over)
- Kartlegging av norsk juniorgolf — venter fortsatt på Anders' MD-fil med turneringer og lenker
- Innlogging, betaling, kontoadministrasjon

## Start med

TN-10 Post til enkeltspiller. Det er skjermen med det harde kravet (forelder-synlighet for
mindreårige) — får du strukturen riktig der, er TN-09 en enklere variant av samme mønster.
Vis den til meg før du går videre til de tre andre.

## SLUTT PÅ PROMPT

---

## Kjent gap i datamodellen som IKKE løses av denne batchen

Ingen kobling mellom en samling (`GroupSchedule`) og spillernes `WorkbenchSession`, og ingen
modell for hvem som konkret er tatt ut til én samling. Tegn skjermene som om dataene finnes —
dette er en byggejobb i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 17, ikke noe designet skal løse.
