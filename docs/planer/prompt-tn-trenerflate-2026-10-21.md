# Prompt: ny Team Norway-trenerflate etter teamnorwayref (21.10.2026)

Bestilt av Anders 21.10.2026. Hører til steg 15 i
[Team Norway-planen](team-norway-komplett-redesign-skra-2026-10-21.md). Kopier alt mellom strekene inn i en
fersk Claude Code-økt i `~/Developer/akgolf-hq`.

**Anbefalt arbeidsmåte:** én økt per etappe. Etappe 0–2 i én økt (lesing, register, wireframes), så stopp for
Anders' ja. Byggingen (etappe 3–4) går i egne økter, én PR per pakke. Ingen agent-team.

---

```xml
<oppgave>
Lag en ny struktur for Team Norway-trenerflaten og bygg den. Den nye Team Norway-siden vi har laget
(teamnorwayref, https://teamnorwayref.vercel.app) skal erstatte dagens interne sider for Team Norway-trenere
under /team-norway. Hver trener har sin egen profil. Treneren går til Spillere, velger en spiller, og trykk på
navnet åpner den komplette spillerprofilen: komplett IUP, turneringsplanlegger, ranking, progresjon i
turneringer, trening, tester, teknisk plan og fireukerssjekk. PlayerHQ lenker til den nye siden fra stedet der
Team Norway-spillere registrerer deling med Team Norway.

Arbeidet går i fem etapper. Etappe 0–2 ender i wireframes som Anders må si ja til før noe bygges.
</oppgave>

<forutsetning>
teamnorwayref er i dag en statisk HTML-side bygget av ak-golf-pipelines (scripts/referansespillere_html.py,
scripts/bygg_teamnorwayref.sh, maler i scripts/maler/teamnorwayref/) bak ETT felles passord (middleware.js).
En statisk side med felles passord kan ikke gi hver trener egen profil, og kan ikke vise en spillers IUP,
tester eller trening bare til trenere spilleren har delt med. De fleste spillerne er mindreårige.

Arkitekturen Anders har valgt (fyll inn før start, se beslutninger.md):
  A (anbefalt): Den nye trenerflaten bygges i AK Golf HQ under /team-norway med HQ-innloggingen
     (/teamnorway), med teamnorwayrefs menystruktur, innhold og utseende. De samlede, offentlige delene
     (WAGR-leaderboard, Sammenlign, Søk «Alle norske», HCP Norge, Norsk golf, samlede testtall uten navn)
     blir en del av samme flate. teamnorwayref.vercel.app sender videre til den nye flaten når Anders
     sier at den kan erstattes.
  B: teamnorwayref blir en egen app med innlogging mot HQ-basen. Mer arbeid, to steder å sikre.

Valget overstyrer §REFERANSESPILLERE NORDEN BOR PÅ TEAMNORWAYREF (21.10) i .claude/rules/beslutninger.md
(«HQ får ingen egen referanseflate»). Står valget ikke registrert der når du starter: stopp, still Anders
dette ene spørsmålet, og registrer svaret med /beslutning før etappe 2.
</forutsetning>

<les_forst>
- AGENTS.md, docs/platform/AGENT-BRIEF.md, CLAUDE.md
- .claude/rules/beslutninger.md, særlig: §REFERANSESPILLERE NORDEN (21.10), §DESKTOP-SKJERMER BRUKER FULL
  BREDDE (21.10), §TURNERINGSPLANLEGGEREN MED WAGR-ANSLAG (20.10), §TESTBATTERIET ER TEAM NORWAYS 14 TESTER
  PLUSS FYSISK (20.10), §TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY (20.10), §DATA GOLF ER ANDERS' PRIVATE
  VERKTØY (20.10), §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ» (19.10), §WANG OG TEAM NORWAY FÅR EGNE
  INNLOGGINGSADRESSER (18.10), §SPILLERPROFILEN HETER IUP I TEAM NORWAY (15.10), §TEAM NORWAY FÅR EGNE
  AKSEFARGER (14.10), §KODEGJENNOMGANGEN 06.10, §ÉN IUP OG ETT TESTBATTERI (28.09), §Data
- .claude/rules/gotchas.md
- docs/planer/team-norway-komplett-redesign-skra-2026-10-21.md (steg 1–15)
- Dagens flate: src/app/team-norway/** (39 sider), src/components/team-norway/** (tn-shell.tsx med
  tnHovedmeny, tn-skra-topp.tsx, core.tsx), src/styles/team-norway-tokens.css
- Tilgang: src/lib/domain/tn-arbeidsflate.ts (hentTnSpillerTilgang), src/lib/deling/navngitt.ts,
  src/lib/deling/treneroversikt.ts, DelingsSamtykke i prisma/schema.prisma
- teamnorwayref i ~/Developer/ak-golf-pipelines (origin/main): scripts/referansespillere_html.py
  (gruppene: referansegrupper, «Alle norske», «HCP Norge», «Norsk golf», «Tester», «Team Norway i HQ»),
  scripts/maler/referansespillere.html, docs/plan-teamnorwayref-komplett.md
- PlayerHQ-delingen: src/app/portal/meg/deling/page.tsx (NavngittDeling, trenerens e-post @golfforbundet.no),
  src/app/portal/meg/innstillinger/personvern/deling/page.tsx (PH27Deling, nivåene «Tester og resultater» og
  «Komplett profil»), src/app/portal/meg/deling/innsyn/page.tsx
- Skillene ak-hq-design, ak-personvern og ak-sikkerhet før kode som rører persondata eller tilgang
Påstå ingenting om en fil du ikke har åpnet.
</les_forst>

<etappe nr="0" navn="Avklaring">
Sjekk at arkitekturvalget står i beslutninger.md (se forutsetning). Sjekk origin/main og åpne PR-er for
TN-filer før du starter; ta ikke filer en annen økt jobber i.
</etappe>

<etappe nr="1" navn="Funksjonsregister">
Lag docs/planer/tn-trenerflate-register-2026-10-21.md: én rad per dagens TN-side (alle 39 under
src/app/team-norway) og per teamnorwayref-del. Kolonner: adresse, hva den gjør, data den leser, hvem som
ser den, ny plass i strukturen, og utfall (beholdes · flyttes · slås sammen · blir videresending). Ingen
funksjon forsvinner uten at registeret sier hvor den går. Ferdig når hver side har én rad og ett utfall.
</etappe>

<etappe nr="2" navn="Struktur og wireframes">
1. Menyen: høyst seks hovedpunkter, med faner inni. Utgangspunkt (juster etter registeret og begrunn):
   Hjem · Spillere · Samlinger og testing · Turneringer · Referanse (WAGR, Sammenlign, Søk, HCP Norge,
   Norsk golf, samlede testtall) · Fag og administrasjon. Min profil nås fra navnet nederst i menyen.
   Navy sidemeny på PC, navy topplinje og meny som hel flate på mobil (uendret fra 20.10).
2. Sidekart: hvilke sider finnes, hvordan man går mellom dem, og hvilke gamle adresser som sender videre.
3. Fordeling: hva som står på hver side, i hvilken rekkefølge, ett hovedtall per flate.
4. Wireframes i 390 og 1280 px (svart-hvitt, ekte innhold fra syntetiske spillere) for:
   - Trenerens hjem: saker som venter, neste samling, turnering nå.
   - Trenerprofilen: navn, rolle, kontakt, gruppene og spillerne treneren har tilgang til, egne saker.
   - Spillere: liste med søk og filter (gruppe, klasse, kjønn, delingsstatus); trykk på navnet åpner profilen.
   - Spillerprofilen (heter «IUP» i Team Norway): topp med navn, klasse, WAGR-plass og NGF-juniorranking,
     og fanene Oversikt · Turneringsplan · Ranking · Turneringer (progresjon over tid) · Trening ·
     Tester · Teknisk plan · Fireukerssjekk. IUP-arket fra Team Norway er malen for rekkefølgen.
   - Referanse-delen: leaderboard, graf, Sammenlign og Søk fra teamnorwayref.
   - Spiller uten deling: hva treneren ser (bare navn og offentlig ranking, og hvordan spilleren deler).
5. Legg wireframes i docs/design-system/utkast-tn/trenerflate/ og publiser dem som privat artifact.
STOPP her. Vis Anders lenken og et kort sammendrag av menyen, og vent på ja (port 7).
</etappe>

<etappe nr="3" navn="Bygging">
Én PR per pakke, i denne rekkefølgen: (a) skall og meny, (b) trenerprofil, (c) spillerliste,
(d) spillerprofilens topp og Oversikt, (e) én PR per fane, (f) Referanse-delen, (g) videresendinger fra
gamle adresser. Bygg i Skrå-drakten etter docs/design-system/utkast-tn/nye-veier.html og wireframes:
Schibsted Grotesk, IBM Plex Mono på tall, navy #012B5D, rød #D70232 bare som identitet, TN-aksefargene,
bilder fra public/team-norway/bilder/, full bredde på desktop. Gjenbruk det som finnes: turneringsplanleggeren
(/team-norway/spiller/[id]/turneringsplan), testene, teknisk plan, fireukerssjekken og analysen. Ikke bygg
dem på nytt.
Referanse-delen leser de samme tallene som teamnorwayref fra pipelines' tabeller; kartlegg kolonnene mot
basen før du skriver en spørring, og vis kilde og dato: «World Amateur Golf Ranking (WAGR), The R&A».
</etappe>

<etappe nr="4" navn="Lenke fra PlayerHQ">
Der Team Norway-spilleren deler med Team Norway (PH27Deling på
/portal/meg/innstillinger/personvern/deling, og /portal/meg/deling for navngitt trener på
@golfforbundet.no) kommer en lenke til den nye Team Norway-siden, med én setning om hva treneren ser.
Lenken vises bare for spillere i en Team Norway-gruppe. Uavklart: siden er bak trenerinnlogging, så
spilleren kan ikke åpne trenerdelen. Anbefaling til Anders: lenken går til «Se hva Team Norway ser»
(/portal/meg/deling/innsyn) og til den offentlige Referanse-delen. Still spørsmålet før pakken bygges.
</etappe>

<regler>
- Tilgang: en trener ser bare spillere med gyldig delingssamtykke til Team Norway, og bare det nivået
  spilleren har gitt («Tester og resultater» eller «Komplett profil»). Gruppemedlemskap alene gir ikke
  innsyn. Treneren foreslår endringer; spilleren godtar. Treneren skriver aldri direkte i planen.
- Trener og coach fører bare teknikk- og PEI-tester. Testbatteriet er de 19 testene i tre deler.
- Data Golf vises bare for ADMIN, aldri for trenere.
- Kun brutto score. Mangler et tall: vis «—», aldri et anslag. Estimat merkes ESTIMAT.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri utenfor innlogging.
- Syntetiske spillere i wireframes, tester og skjermbilder. Ingen ekte elevnavn i sky-prompter.
- Aldri sidelengs rulling. Flex/grid med tekst som ikke brytes har minWidth: 0.
- Skjemaendringer bare additive via db execute (gotchas §Database), med RLS på nye tabeller.
- teamnorwayref.vercel.app i produksjon erstattes eller videresendes først når Anders sier det.
- Git: egen gren fra origin/main, aldri git add -A, ikke rør skjermregister.*, verify grønn før PR,
  auto-merge (squash) på. Vercel-lenke og skjermbilder i 390 og 1280 px til Anders etter hver PR.
</regler>

<ferdig_nar>
- Arkitekturvalget og menyen står i beslutninger.md.
- Registeret har én rad per side og per teamnorwayref-del, med utfall.
- Anders har sagt ja til wireframes.
- Hver trener har en profilside. Spillerlisten åpner spillerprofilen med alle faner, og de viser ekte data
  eller «—».
- En test låser at en trener uten delingssamtykke ikke ser spillerens IUP, tester eller trening.
- Alle gamle /team-norway-adresser åpner riktig ny side eller sender videre. Ingen gir 404.
- PlayerHQ-lenken finnes for Team Norway-spillere og ikke for andre, låst med test.
- Alle nye skjermer er målt i 390, 1280 og 1920 px uten sidelengs rulling og uten konsollfeil.
- npm run verify og CI er grønne for hver PR.
</ferdig_nar>

<rapport>
Etter hver etappe: hva som er gjort, hvor det ligger (filsti, PR, lenke), hva som er målt, og hva som er
uavklart. Kort og på norsk bokmål.
</rapport>
```

---

**Test av prompten:** etappe 2 skal ende i en artifact-lenke med wireframes i 390 og 1280 px og et register
uten tomme utfall. Hvis økta begynner å bygge før Anders har sagt ja, eller før arkitekturvalget står i
beslutninger.md, følger den ikke prompten.
