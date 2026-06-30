# AK Golf HQ — Tekst-plan (levende dokument)

> **Hva dette er:** Autoritativ kilde for all copy i plattformen — marketing, app, e-post, knapper, feilmeldinger.
> Rediger direkte i denne filen. Implementering skjer fra dette dokumentet.
>
> **Sist oppdatert:** 2026-06-19
>
> **Hvem eier det:** Anders Kristiansen — godkjenner alle endringer.

---

## Innhold

1. [Skriveøgler (regler som aldri brytes)](#1-skriveøgler)
2. [Globale strenger — navn, priser, steder](#2-globale-strenger)
3. [akgolf.no — Hjem](#3-akgolfno--hjem)
4. [akgolf.no — PlayerHQ-landingssiden](#4-akgolfno--playerhq)
5. [akgolf.no — Coaching-pakker / Priser](#5-akgolfno--coaching-pakker)
6. [akgolf.no — Coacher](#6-akgolfno--coacher)
7. [akgolf.no — Om oss / Anlegg](#7-akgolfno--om-oss--anlegg)
8. [PlayerHQ — kjerneskjermer](#8-playerhq--kjerneskjermer)
9. [AgencyOS — kjerneskjermer](#9-agencyos--kjerneskjermer)
10. [Forelderportal — kjerneskjermer](#10-forelderportal--kjerneskjermer)
11. [Auth — innlogging, signup, passord](#11-auth--innlogging-signup-passord)
12. [Tomtilstander (empty states)](#12-tomtilstander)
13. [Feilmeldinger](#13-feilmeldinger)
14. [Knapper og CTA-er (universell liste)](#14-knapper-og-cta-er)
15. [E-postvarsler](#15-e-postvarsler)

---

## 1. Skriveøgler

Disse brytes aldri — gjelder marketing OG app.

| Regel | Riktig | Feil |
|---|---|---|
| Tiltale | «du» (liten d) | «De», «Dere» |
| Overskrifter | Sentence-case | Tittel Case |
| Labels / eyebrows | MONO CAPS | Sentence case |
| Tall | Komma-desimal: `+1,8` | Punktum: `+1.8` |
| Tusenskille | Mellomrom: `8 240` | Komma: `8,240` |
| Prosent | Mellomrom: `12 %` | Ingen: `12%` |
| Tid | 24-timers: `14:30` | `2:30 PM` |
| Delta | Pil + farge: `▲ 0,4` / `▼ 0,6` | `+0.4 / -0.6` |
| Produktnavn | PlayerHQ, AgencyOS | PlayerHQ-appen, Coach-appen |
| Coach-appen | AgencyOS | CoachHQ (gammelt — aldri bruk) |
| Tier | GRATIS / PRO | Gratis / Premium / Elite |
| Coaching-pakke | Performance / Performance Pro | Starter / Business / Enterprise |
| Demo-spiller | Øyvind Rohjan | Magnus, Markus, Andreas |
| Demo-coach | Anders Kristiansen | (marketing-coachen er ekte: Markus Røinås Pedersen) |
| Emoji i UI | Aldri | — |
| Ikon-bibliotek | Lucide (stroke 1,5px) | — |

---

## 2. Globale strenger

Disse brukes konsistent overalt — aldri variasjoner.

### Selskap og produkter
```
Selskap:          AK Golf Group AS
Academy:          AK Golf Academy
Coach-appen:      AgencyOS
Spiller-appen:    PlayerHQ
Simulator:        Mulligan Indoor Golf
Idrettsskole:     WANG Toppidrett Fredrikstad
Klubb 1:          GFGK (Gamle Fredrikstad GK)
```

### Coacher (marketing — ekte navn)
```
Hoved-coach:      Anders Kristiansen
Tilknyttet:       Markus Røinås Pedersen
```

### Demo-spillere (app — aldri på marketing-sider)
```
Spiller:          Øyvind Rohjan  (initialer: ØR, HCP: 4,2)
Coach:            Anders Kristiansen
```

### Priser (bekreftes av Anders — rediger her hvis endring)
```
PlayerHQ GRATIS:      0 kr (30 dager, ingen kort)
PlayerHQ PRO:         300 kr/mnd
Performance:          1 200 kr/mnd  (2 coaching-kreditter)
Performance Pro:      2 220 kr/mnd  (4 coaching-kreditter)
Drop-in 20 min:       300 kr
Drop-in 50 min:       1 300 kr
```

> ⚠️ **REDIGER HER** om prisene endres — implementeringen henter herfra.

### Nøkkeltall (verifiser regelmessig — oppdater om tallene endres)
```
Aktive spillere:      312
Loggede runder:       18 240
SG-forbedring snitt:  −1,8 (12 mnd)
Drill-fullføring:     91 %
Team Norway ref:      kalibrert mot IUP Referanse-ark
```

### Steder
```
Adresse GFGK:     Gamle Fredrikstad GK, Borge, Fredrikstad
Adresse Mulligan: Mulligan Indoor Golf, Sarpsborg
WANG-adresse:     WANG Toppidrett Fredrikstad, St. Croix vgs.
```

---

## 3. akgolf.no — Hjem

### 3.1 — Meta
```
<title>       AK Golf Academy — Coaching i Fredrikstad og Sarpsborg
<description> Personlig golfcoaching basert på Strokes Gained. Vi finner
              nøyaktig hva som koster deg slag og bygger en plan rundt det.
```

### 3.2 — Hero
```
Overskrift:   De fleste golfscoach-kunder trener mer.
              De beste vet hva de trener på.

Ingress:      Vi bruker Strokes Gained til å finne ut nøyaktig hvilken del
              av spillet ditt som koster deg flest slag. Ikke en følelse.
              Ikke en gjetting. Et tall du kan jobbe mot.

CTA primær:   Start her →
CTA sekundær: Hva er coaching-pakkene? →
```

### 3.3 — Ticker (scrollende tall-stripe under hero)
```
+1,8 SG snitt siste 30 d · 248 m gjennomsnittlig drive carry ·
HCP 4,2 etter 6 mnd coaching · 19 dager aktiv streak ·
Team Norway SG-kalibrert · 91 % av planlagte driller fullført
```

### 3.4 — Slik jobber vi (3 kort)
```
[Kort 1]
Eyebrow:  STEG 1 · DATA
Tittel:   Først finner vi ut hva som faktisk skjer.
Tekst:    Etter hver runde ser du SG fordelt på driver, innspill,
          kortspill og putt. Sammenlignet med Team Norway-referansen.
          Ikke et snitt fra ingensteds. En standard du vet hva er.

[Kort 2]
Eyebrow:  STEG 2 · PLAN
Tittel:   Coachen din ser akkurat det du ser.
Tekst:    Anders og Markus følger treningsdataen din løpende. Oppdaterer
          de planen din, ser du det med en gang. Ingen møter der du
          forklarer hva du har gjort siden sist. De vet allerede.

[Kort 3]
Eyebrow:  STEG 3 · FREMGANG
Tittel:   Planen holder takt med livet ditt.
Tekst:    Sesongplan, ukeplan og neste økt bor på samme sted.
          Så når noe skjer og planen må justeres, skjer det der.
          Du er ikke alene om å holde styr på det.
```

### 3.5 — Pyramiden (5-søyle-seksjon)
```
Overskrift:   Fem områder. Én sammenheng.

Ingress:      Vi deler all trening i fem søyler. Det gjør at du alltid vet
              om du bruker nok tid på riktig ting, og om det fysiske
              grunnlaget faktisk holder takt med det tekniske arbeidet.

[Søyle 1 — FYS]
Label:    FYSISK GRUNNLAG
Tekst:    Vi bruker 30 standardiserte tester for å måle kondisjon,
          styrke og mobilitet. Ikke fordi vi vil at du skal bli
          idrettsutøver, men fordi kroppen setter grenser for svingen.

[Søyle 2 — TEK]
Label:    TEKNISK BASIS
Tekst:    Svingarbeid med konkrete mål, ikke «det ser bedre ut».
          Vi filmer, vi måler, og vi vet hva vi ser etter.

[Søyle 3 — SLAG]
Label:    SLAGØVELSER
Tekst:    Her treffer du faktiske slag mot faktiske mål med SG-loggføring.
          Det er stor forskjell på å øve på driving range og å faktisk
          flytte SG-tallene sine.

[Søyle 4 — SPILL]
Label:    SPILLFORSTÅELSE
Tekst:    Valg under press. Kursmanagement. Å score lavere enn du
          slår. Dette er en ferdighet som må trenes for seg.

[Søyle 5 — TURN]
Label:    TURNERINGSFORM
Tekst:    De siste dagene før en turnering er sin egen greie.
          Vi forbereder deg konkret, ikke generelt.
```

### 3.6 — Sitat
```
Sitat:    «Jeg visste at innspillet mitt var svakt. Men jeg visste ikke
          at det var grunnen til at jeg ikke kom under 75. Det er
          lettere å trene på noe når du vet at det faktisk betyr noe.»

Kilde:    Øyvind Rohjan, fra HCP 7,4 til 4,2 på ett år
```

### 3.7 — Tall-band (count-up animasjon)
```
312          aktive spillere
18 240       loggede runder
−1,8 SG      gjennomsnittsforbedring på 12 mnd
91 %         av planlagte driller fullført
```

### 3.8 — Pris-teaser
```
Overskrift:   Kom i gang.

[PlayerHQ]
Label:    SPILLERAPP
Tittel:   PlayerHQ
Tekst:    Prøv gratis i 30 dager. Etterpå 300 kr per måned,
          eller inkludert om du har en coaching-pakke.
CTA:      Prøv gratis →

[Coaching]
Label:    PERSONLIG COACHING
Tittel:   Fra 1 200 kr per mnd
Tekst:    To coaching-økter i måneden, sesongplan og PlayerHQ
          PRO inkludert. Du betaler for tid med coach, ikke for
          en app i tillegg.
CTA:      Se pakker →
```

### 3.9 — Steder
```
Overskrift:   Vi holder til i Fredrikstad og Sarpsborg.

[GFGK]
Navn:     Gamle Fredrikstad GK
Tekst:    18-hulls bane ved Borge. Her gjennomføres de fleste
          baneøktene og runderundene.

[Mulligan]
Navn:     Mulligan Indoor Golf, Sarpsborg
Tekst:    TrackMan-simulatorer innendørs. Viktigste for teknisk
          arbeid og slaganalyse, spesielt om vinteren.

[WANG]
Navn:     WANG Toppidrett Fredrikstad
Tekst:    Eliteidrettslinje for juniorspillere. AK Golf leverer
          coaching og treningssystem til WANG-spillerne.
```

---

## 4. akgolf.no — PlayerHQ

### 4.1 — Meta
```
<title>       PlayerHQ · AK Golf Academy
<description> Appen der treningsplanen, SG-analysen og coachen din
              bor på samme sted. Gratis i 30 dager.
```

### 4.2 — Hero
```
Eyebrow:    SPILLERAPP
Overskrift: Appen der coachen og du ser det samme.

Ingress:    Når Anders oppdaterer planen din, ser du det umiddelbart.
            Når du logger en runde, ser han SG-tallene. Dere jobber
            ikke parallelt. Dere jobber på det samme.

CTA primær:   Prøv gratis i 30 dager →
CTA sekundær: Logg inn →

Metainfo:   Ingen betalingskort.
```

### 4.3 — Feature-bento (6 kort)
```
[1 — Workbench]
Eyebrow:  PLAN
Tittel:   Du vet hva som er neste økt. Alltid.
Tekst:    Coachen setter opp sesongplanen i Workbench. Du ser
          hva som er planlagt i dag, denne uka og mot neste
          turnering. Du trenger ikke spørre.

[2 — Strokes Gained]
Eyebrow:  ANALYSE
Tittel:   SG splittet på fire kategorier etter hver runde.
Tekst:    Du ser OTT, innspill, kortspill og putt sammenlignet med
          Team Norway-referansen. Ikke et snitt fra et ukjent felt.
          En standard du vet hva betyr.

[3 — Driller]
Eyebrow:  TRENING
Tekst:    Coachen tildeler driller med instruks og konkrete suksessmål.
          Du logger om du traff sonen. Det er forskjell på å øve
          og å faktisk flytte tallene sine.

[4 — FYS-tester]
Eyebrow:  FYSISK
Tittel:   30 tester som kobler kroppen til golfprestasjonen din.
Tekst:    Kondisjon, styrke, balanse og mobilitet, alle med tall du
          kan sammenligne over tid. Du ser om drive-distansen din
          faktisk henger sammen med core-styrken.

[5 — TrackMan]
Eyebrow:  TRACKMAN
Tittel:   Fra Mulligan og inn i samme sted som alt annet.
Tekst:    Carry, ballhastighet, smash factor og dispersion loggføres
          fra simulatoren og havner i appen din. Slik at en vinterøkt
          på Mulligan faktisk teller i trendsporet ditt.

[6 — Coach-meldinger]
Eyebrow:  COACHING
Tittel:   Tilbakemelding fra coachen der du ser treningstallene.
Tekst:    Anders eller Markus skriver direkte i appen, ikke på
          e-post eller i en chat-tråd uten kontekst. Meldingen
          er koblet til øvelsen eller runden du nettopp fullførte.
```

### 4.4 — Hvem er det for
```
Overskrift:   For deg som vil vite om det du gjør faktisk virker.

Tekst:        PlayerHQ er for deg som allerede trener, men gjerne vil
              se det i tallene. Du trenger ikke coach for å bruke appen.
              Men mye av det som gjør den god, er at coachen og du ser
              det samme grunnlaget.

              Prøv den i 30 dager. Logg noen runder, se SG-analysen,
              og avgjør selv.
```

### 4.5 — Priser
```
Overskrift:   To valg. Ingen skjulte kostnader.

[GRATIS — 0 kr]
Badge:    GRATIS
Tittel:   30 dager full tilgang
Punkter:
  Full tilgang til alle skjermer
  Ingen betalingskort kreves
  Inkludert så lenge du har en aktiv coaching-pakke

Under-tekst:  Etter 30 dager fortsetter du på PRO, eller du beholder
              GRATIS hvis du har coaching-pakke.

CTA:      Start gratis →

[PRO — 300 kr per mnd]
Badge:    PRO
Tittel:   For deg som trener uten coach
Punkter:
  Ubegrenset historikk og SG-analyse
  Full trendvisning over tid
  Workbench med sesong- og ukesplan
  FYS-testbatteri og progresjon
  TrackMan-logging

CTA:      Kom i gang →
```

---

## 5. akgolf.no — Coaching-pakker

### 5.1 — Meta
```
<title>       Coaching-pakker · AK Golf Academy
<description> Personlig coaching fra Anders Kristiansen og Markus Røinås
              Pedersen. SG-basert, med PlayerHQ inkludert. Fra 1 200 kr per mnd.
```

### 5.2 — Hero
```
Eyebrow:    AK GOLF ACADEMY · FREDRIKSTAD
Overskrift: To coaching-timer i måneden endrer mer enn du tror.

Ingress:    Ikke fordi én time er magi. Men fordi coachen ser hva
            du har gjort mellom øktene, og neste time starter der
            dataen slutter. Vi bruker PlayerHQ til å holde tråden,
            og den er inkludert i begge pakker.
```

### 5.3 — Pakker
```
[Performance — 1 200 kr/mnd]
Eyebrow:  MEST POPULÆR
Tittel:   Performance
Pris:     1 200 kr per mnd
Undertittel: 2 coaching-kreditter per mnd

Punkter:
  PlayerHQ PRO inkludert
  Personlig sesongplan
  SG-gjennomgang etter loggede runder
  Tilgang til GFGK og Mulligan
  1 måneds oppsigelse

CTA:      Start Performance →

Hjelpetekst: For deg som vil ha struktur og oppfølging, men trener
             mye alene mellom øktene.

---

[Performance Pro — 2 220 kr/mnd]
Eyebrow:  FOR DEN SOM VIL RASKERE
Tittel:   Performance Pro
Pris:     2 220 kr per mnd
Undertittel: 4 coaching-kreditter per mnd

Punkter:
  Alt i Performance
  TrackMan-analyse på alle øktene
  Coachen ser dataen din ukentlig
  Turneringspriming og bane-prep
  Prioritert svartid
  Hjemmebase Mulligan Sarpsborg

CTA:      Søk opptak →

Hjelpetekst: For deg som trener 4 til 5 ganger i uka og vil at
             coachen skal følge med mellom øktene, ikke bare på dem.
```

### 5.4 — Hva som er annerledes
```
Overskrift:   Neste coaching-time starter ikke på null.

Tekst:        De fleste timer med en golfcoach starter på samme sted.
              Du varmer opp, coachen ser på, du får tilbakemelding,
              du drar hjem. Neste gang husker ingen av dere hva dere
              faktisk jobbet med sist.

              Hos oss ser Anders hva du har gjort siden sist. Hvilke
              driller du fullførte. Hvilke runder du spilte. Hva
              SG-en din gjorde. Timen begynner der dataen slutter.
```

### 5.5 — WANG-boks
```
Eyebrow:    FOR JUNIORSPILLERE
Overskrift: Vurderer du WANG Toppidrett?

Tekst:      AK Golf er koblet mot WANG-programmet i Fredrikstad.
            Vi hjelper med opptaksforberedelse, fysisk grunnlag
            og teknisk grunnlag. Ta kontakt for en uforpliktende prat.

CTA:        Ta kontakt →
```

### 5.6 — FAQ
```
Spørsmål 1:
Q: Er PlayerHQ PRO inkludert i begge pakker?
A: Ja. Du trenger ikke betale 300 kr per mnd i tillegg
   så lenge du har en aktiv coaching-pakke hos oss.

Spørsmål 2:
Q: Kan jeg prøve appen uten å kjøpe coaching?
A: Ja. PlayerHQ er gratis i 30 dager uten betalingskort.
   Prøv den, logg noen runder, og se SG-analysen din.
   Bestem deg etterpå.

Spørsmål 3:
Q: Hva er en coaching-kreditt?
A: En kreditt er en 20 minutters coaching-økt. Du booker
   selv i PlayerHQ fra kreditt-saldoen din. Performance
   gir deg to per måned, Pro gir deg fire.

Spørsmål 4:
Q: Hva er forskjellen på Performance og Pro?
A: Antall kreditter og hvor tett oppfølgingen er mellom
   øktene. Performance passer deg som trener mye alene og
   vil ha struktur og plan. Pro er for deg som vil at
   coachen ser dataen din oftere og bruker TrackMan jevnlig.

Spørsmål 5:
Q: Er det bindingstid?
A: Nei. En måneds oppsigelse på begge pakker.

Spørsmål 6:
Q: Hvem er coachene?
A: Anders Kristiansen er hoved-coach og daglig leder.
   Markus Røinås Pedersen er tilknyttet coach. Begge
   bruker AgencyOS til å følge opp spillerne sine
   mellom øktene.
```

---

## 6. akgolf.no — Coacher

### 6.1 — Anders Kristiansen
```
Tittel:   Hoved-coach · AK Golf Academy
Ingress:  Anders begynte å bruke Strokes Gained i coaching da de
          fleste norske coacher fortsatt baserte tilbakemeldingene
          sine på hva de så på driving range. Han coacher spillere
          fra HCP 18 til elitejunior, og metodikken er den samme
          uavhengig av nivå.

Metodikk: SG-basert planlegging, 5-søyle-pyramiden, periodisering
          mot konkurranse-peaks. Teknisk arbeid på TrackMan ved
          Mulligan, rundearbeid på GFGK.

Sitat:    «Jeg vil at spillerne mine skal vite hva de jobber med
          og hvorfor. Det er lettere å holde motivasjonen oppe
          når du ser at tallene faktisk beveger seg.»
```

### 6.2 — Markus Røinås Pedersen
```
Tittel:   Tilknyttet coach · AK Golf Academy
Ingress:  Markus har bakgrunn fra NHF og regionalt toppgolf.

[⚡ REDIGER HER — Anders fyller inn fribiografi og eventuelt sitat]
```

---

## 7. akgolf.no — Om oss / Anlegg

### 7.1 — Om oss
```
Overskrift:   Vi laget appen fordi vi ikke fant en god nok.

Tekst:        AK Golf Academy startet i Fredrikstad fordi vi mente
              at datadrevet coaching ikke var forbeholdt de som
              spilte på Tour. Strokes Gained er allerede standard
              der. Det burde det være her også.

              Vi bygde PlayerHQ fordi ingenting vi fant faktisk
              koblet coachen og spillerens data i sanntid. Nå
              bruker vi det selv med alle spillerne våre, og
              åpner det for alle.

Verdier (labels i UI, ikke punktliste):
  Data over magefølelse
  Fem søyler, én plan
  Ingen isolerte timer
  SG kalibrert mot Team Norway
```

### 7.2 — Anlegg
```
[GFGK]
Navn:     Gamle Fredrikstad GK
Tekst:    18-hulls bane, kortspillsone og putting green ved Borge.
          Hjemmebane for de fleste AK Golf-spillere.
Adresse:  [Legg til faktisk adresse]

[Mulligan]
Navn:     Mulligan Indoor Golf · Sarpsborg
Tekst:    To TrackMan-simulatorer. Fullt dekkende slaganalyse inne,
          hele året. Viktigste anlegg for vintertrening og teknisk arbeid.
Adresse:  [Legg til faktisk adresse]

[WANG]
Navn:     WANG Toppidrett Fredrikstad · St. Croix vgs.
Tekst:    Eliteidrettslinje med golfspesialisering. AK Golf leverer
          coaching og treningssystem til WANG-spillerne.
Adresse:  [Legg til faktisk adresse]
```

---

## 8. PlayerHQ — kjerneskjermer

### 8.1 — Hjem (Dashboard)
```
Eyebrow:      PLAYERHQ · HJEM
Hilsen:       God {morgen|ettermiddag|kveld}, {fornavn}.
Undertittel:  Du har {N} økt{er} planlagt i dag.  [eller: Ingen økt planlagt i dag.]

Neste økt-kort:
  Eyebrow:  NESTE ØKT
  Tom:      Ingen økt planlagt. Vil du logge en runde eller legge til en drill?

Fokus-kort:
  Eyebrow:  DENNE UKENS FOKUS
  Tom:      Coachen din har ikke satt ukefokus ennå.

Siste runde-kort:
  Eyebrow:  SISTE RUNDE
  Tom:      Logg din første runde for å se SG-analyse.
```

### 8.2 — Analyse
```
Eyebrow:      PLAYERHQ · ANALYSE
Tittel:       Din *utvikling*.   [italic på «utvikling»]

Faner:
  Strokes Gained | Runder | TrackMan | Tester

SG-hero-kort:
  Eyebrow:  SG TOTALT · SISTE {N} RND
  Tom:      Logg minst én runde for å se SG-analyse.

AI Caddie-kort:
  Eyebrow:  AI CADDIE
  Tittel:   Mønster oppdaget
  Tom:      Logg 5+ runder for AI-innsikt.

TrendBand-legend:
  — Team Norway-bånd
  — Din linje
  — Personlig rekord (PB)

Tom-tilstand (ingen runder):
  Tittel:   Ingen runder logget ennå.
  Tekst:    Logg din første runde for å se SG-analyse og trender.
  CTA:      Logg runde →
```

### 8.3 — Gjennomføre
```
Eyebrow:      PLAYERHQ · GJENNOMFØRE
Tittel:       Dagens *program*.   [italic på «program»]

Undertittel:  {Ukedag} {dato} · {N} økt{er} · {tid} totalt

Neste-seksjon:
  Eyebrow:  NESTE
  Tom:      Ingen økt planlagt i dag.
  CTA:      Legg til økt →

Resten-av-dagen:
  Eyebrow:  RESTEN AV DAGEN
  Tom:      (skjules om tom)

Fullført-seksjon:
  Eyebrow:  FULLFØRT I DAG
  Tom:      (skjules om tom)
```

### 8.4 — Talent
```
Eyebrow:      PLAYERHQ · TALENT
Tittel:       Din *utviklingsvei*.

Nivå-badge:   Nivå {kode} · {beskrivelse}   (f.eks. «Nivå D · Toppjunior 72–74 snitt»)

JourneyMap:
  Steg:  Klubb → Regional → Nasjonal → Internasjonal → Tour

Mastery Rings:
  Eyebrow: FERDIGHETSSONER

Mål-seksjoner:
  Eyebrow: AKTIVE MÅL
  Tom:     Coachen din har ikke satt mål ennå.

Streak:
  Eyebrow: AKTIV STREAK
  Tom:     {N} dager · Start en streak ved å fullføre en økt i dag.
```

### 8.5 — Varsler
```
Eyebrow:      PLAYERHQ · VARSLER
Tittel:       Varsler *nå*.

Badge (uleste): {N} nye

Gruppe-header: I DAG / I GÅR / DENNE UKA

Tom-tilstand:
  Tekst:    Ingen varsler.
  Undertekst: Varsler fra coach og appen vises her.
```

### 8.6 — Meg
```
Eyebrow:      PLAYERHQ · MEG
Tittel:       {fullt navn}

Tier-pill:    PlayerHQ · GRATIS  /  PlayerHQ · PRO

Seksjoner:
  KONTO       — E-post, passord, abonnement
  TRENING     — Hjemmeklubb, HCP, kategori
  VARSLER     — Varslingsinnstillinger
  PERSONVERN  — Dataeksport, slett konto

Abonnement-kort (GRATIS):
  Tekst:    Du er på GRATIS-planen.
  CTA:      Oppgrader til PRO — 300 kr/mnd →

Abonnement-kort (PRO via coaching):
  Tekst:    PRO er inkludert i din {Performance/Performance Pro}-pakke.
  Sub:      Fornyes {dato}.
```

---

## 9. AgencyOS — kjerneskjermer

### 9.1 — Cockpit (dashboard)
```
Eyebrow:      AGENCYOS · COCKPIT
Tittel:       Kontrolltårnet.

Undertittel:  {Ukedag} {dato} · {N} aktive spillere · {M} forespørsler venter

KPI-labels (MONO CAPS):
  AKTIVE SPILLERE | FORESPØRSLER | ØKTER I DAG | STALL-SG | PLAN-ADHERENCE

Timeline-eyebrow:  DAGENS ØKTPLAN
Kø-eyebrow:        HVEM TRENGER MEG NÅ
Innboks-eyebrow:   INNBOKS
```

### 9.2 — Stall (spillerliste)
```
Eyebrow:      AGENCYOS · STALL
Tittel:       Spillere · {N}

Filter-chips: Alle · Aktive · Trenger oppfølging · Junior

Tabell-kolonner:
  SPILLER | HCP | SG | SISTE ØKT | STATUS

Detalj-panel-eyebrow:  360° · {spillernavn}

Pyramid-eyebrow:  PYRAMIDEBALANSE

Statuser:
  up    → Aktiv
  warn  → Trenger oppfølging
  down  → Inaktiv

Tom-tilstand:
  Tekst:  Ingen spillere ennå.
  CTA:    Legg til spiller →
```

### 9.3 — Handlingssenter
```
Eyebrow:      AGENCYOS · HANDLINGSSENTER
Tittel:       Oppgaver.

View-toggle:  Kanban | Tabell | Liste

Filter-chips: Alle · Haster · Mine · Ferdig

Kolonne-labels (Kanban):
  KØ | Å GJØRE | PÅGÅR | FERDIG

Tom-tilstand:
  Tekst:  Ingen oppgaver.
  CTA:    Opprett oppgave →
```

### 9.4 — Planlegging
```
Eyebrow:      AGENCYOS · PLANLEGGING
Tittel:       Sesongplan.

Spiller-velger-label: Spiller

Gantt-periode-labels (MONO CAPS):
  JAN | FEB | MAR | APR | MAI | JUN | JUL | AUG | SEP | OKT | NOV | DES

Fase-labels:
  Grunntrening | Oppbygging | Konkurranse | Topping | Hvile

Periode-KPI-eyebrow:  AKTIV PERIODE · {FASE}

Tidslinje-eyebrow:    MILEPÆLER

Tom-tilstand:
  Tekst:  Ingen sesongplan for denne spilleren.
  CTA:    Opprett sesongplan →
```

### 9.5 — Tester
```
Eyebrow:      AGENCYOS · TESTER
Tittel:       Tester.

Undertittel:  FYS · teknikk · resultatmatrise

Søkefelt-placeholder:  Søk spiller eller test...

Knapp:        + Registrer test

Fane-chips:   Alle · FYS · Teknikk · TrackMan

KPI-labels:   TESTER UTFØRT | SNITTSCORE | SIST UKE | FORBEDRING

Tabell-kolonner:  SPILLER | TEST | RESULTAT | DELTA | DATO | STATUS

Status-chips:
  Bedre   (lime)
  Stabilt (nøytral)
  Svakere (rød)
```

### 9.6 — Økonomi
```
Eyebrow:      AGENCYOS · ØKONOMI
Tittel:       Økonomi.

Periode-faner:  Mai · Juni · Q2 · Egendefinert

Knapp:        + Ny faktura

KPI-labels:   INNTEKT {MND} | UTESTÅENDE | BETALT | AKTIVE SPILLERE

Tabell-kolonner:  SPILLER | BESKRIVELSE | BELØP | FORFALL | STATUS

Faktura-statuser:
  Betalt      (grønn)
  Venter      (gul)
  Ikke sendt  (nøytral)
  Forfalt     (rød)
```

---

## 10. Forelderportal — kjerneskjermer

### 10.1 — Hjem
```
Eyebrow:      FORELDERPORTAL · HJEM
Badge:        LESEMODUS

Hilsen:       God {morgen|ettermiddag|kveld}, {fornavn}.
Undertekst:   {barnets fornavn} har {trent X dager / ikke trent} denne uka.

KPI-labels:   HCP | NESTE ØKT | STREAK

Fokus-eyebrow:  DENNE UKENS FOKUS · {barnets fornavn}
Rapport-eyebrow: UKESRAPPORT FRA COACH

Bookinger-eyebrow: KOMMENDE BOOKINGER
Tom-bookinger:    Ingen kommende bookinger.
```

### 10.2 — Ukerapport
```
Eyebrow:      FORELDERPORTAL · UKERAPPORT
Tittel:       Ukes*rapport*.

Tom-tilstand:
  Tekst:    Ingen ukerapport denne uka.
  Undertekst: Rapporten skrives av coachen etter siste økt i uka.
```

### 10.3 — Samtykke (GDPR)
```
Eyebrow:      FORELDERPORTAL · SAMTYKKE
Tittel:       Samtykke og personvern.

Intro:        Som foresatt har du rett til å se, endre og trekke tilbake
              samtykker for {barnets navn}.

Samtykke-labels:
  Treningsdata            — Lagring av driller, runder og testresultater
  Coaching-kommunikasjon  — Meldinger fra coach i appen
  Analyse og SG           — SG-beregning og benchmarking
  Bildedeling             — Bilder fra coaching-økter i appen

Status:
  Aktiv    → Gitt {dato}
  Trukket  → Trukket tilbake {dato}

CTA trekk tilbake:  Trekk tilbake samtykke
CTA gi:             Gi samtykke
```

---

## 11. Auth — innlogging, signup, passord

### 11.1 — Innlogging
```
Overskrift:   Logg inn på PlayerHQ.   [eller: Logg inn på AgencyOS.]
CTA:          Logg inn →
Glemt-lenke:  Glemt passordet?

Feilmeldinger:
  Feil e-post/passord:  E-posten eller passordet stemmer ikke.
  Konto ikke funnet:    Vi finner ingen konto med denne e-posten.
  For mange forsøk:     For mange forsøk. Vent {N} minutter og prøv igjen.
```

### 11.2 — Signup / Opprett konto
```
Overskrift:   Opprett konto.
Undertekst:   Gratis i 30 dager. Ingen betalingskort.

Felter:
  Fullt navn (placeholder: «Fornavn Etternavn»)
  E-postadresse
  Passord (min. 8 tegn)

CTA:          Opprett konto →
Innlogging:   Har du allerede konto? Logg inn →
```

### 11.3 — Glemt passord
```
Overskrift:   Tilbakestill passord.
Tekst:        Skriv inn e-postadressen din, så sender vi en lenke.
CTA:          Send tilbakestillingslenke →
Tilbake:      ← Tilbake til innlogging

Bekreftelse:
  Tittel:   Sjekk innboksen.
  Tekst:    Vi har sendt en lenke til {e-post}. Gyldig i 60 minutter.
```

### 11.4 — Tilbakestill passord
```
Overskrift:   Velg nytt passord.
CTA:          Lagre nytt passord →

Bekreftelse:
  Tittel:   Passord oppdatert.
  Tekst:    Du kan nå logge inn med ditt nye passord.
  CTA:      Logg inn →
```

### 11.5 — Onboarding (ny spiller)
```
Steg 1 — Hvem er du?
  Overskrift:   Kom i gang.
  Tekst:        Noen raske spørsmål så vi kan sette opp profilen din.
  Felter:       Fullt navn · Fødselsdato · Hjemmeklubb (valgfritt)

Steg 2 — Ditt nivå
  Overskrift:   Hva er ditt utgangspunkt?
  Felter:       Nåværende HCP · Mål-HCP (valgfritt)

Steg 3 — Klar
  Overskrift:   Velkommen til PlayerHQ, {fornavn}.
  Tekst:        Coachen din vil sette opp planen din. Du kan utforske
                appen i mellomtiden.
  CTA:          Åpne PlayerHQ →
```

---

## 12. Tomtilstander

Konsistent mønster: **hva som mangler** + **neste steg** (alltid med CTA der det er mulig).

| Skjerm | Tom-tittel | Tom-undertekst | CTA |
|---|---|---|---|
| Analyse — ingen runder | Ingen runder logget | Logg din første runde for å se SG-analyse | Logg runde → |
| Analyse — ingen tester | Ingen tester registrert | FYS-tester og teknikk-tester vises her | — |
| Gjennomføre — ingen økt | Ingen økt planlagt i dag | Vil du logge en runde eller legge til en drill? | Logg runde → |
| Varsler — ingen | Ingen varsler | Varsler fra coach og appen vises her | — |
| Talent — ingen mål | Ingen aktive mål | Coachen din har ikke satt mål ennå | — |
| Stall — ingen spillere | Ingen spillere ennå | Legg til din første spiller | Legg til spiller → |
| Handlingssenter — tom | Ingen åpne oppgaver | Alt er i rute | — |
| Økonomi — ingen fakturaer | Ingen fakturaer denne perioden | — | + Ny faktura |
| Bookinger — ingen | Ingen kommende bookinger | — | Book økt → |
| Innboks — tom | Ingen meldinger | Meldinger fra spillerne dine vises her | — |

---

## 13. Feilmeldinger

Konsistent mønster: **hva som gikk galt** (kort) + **hva brukeren kan gjøre** (konkret).

| Situasjon | Melding |
|---|---|
| Noe gikk galt (generisk) | Noe gikk galt. Prøv igjen, eller kontakt support. |
| Manglende tilgang | Du har ikke tilgang til denne siden. |
| Tidsavbrudd | Tilkoblingen tok for lang tid. Prøv å laste siden på nytt. |
| Feil e-post/passord | E-posten eller passordet stemmer ikke. |
| Duplikat e-post | En konto med denne e-posten finnes allerede. |
| Under 18 — mangler foreldreinfo | Foreldres navn og e-post er påkrevd for spillere under 18 år. |
| Ugyldig HCP | HCP må være mellom −10 og 54. |
| Lagring feilet | Vi klarte ikke å lagre endringen. Prøv igjen. |
| Booking — ikke tilgjengelig | Dette tidspunktet er ikke lenger tilgjengelig. Velg et annet. |
| Stripe-betaling feilet | Betalingen ble ikke gjennomført. Sjekk kortopplysningene og prøv igjen. |

---

## 14. Knapper og CTA-er

Universell liste. Kortform, verb-første, ingen tegnsetting.

| Handling | Knapp-tekst |
|---|---|
| Primær start | Kom i gang → |
| Prøv gratis | Prøv gratis i 30 dager → |
| Logg inn | Logg inn → |
| Opprett konto | Opprett konto → |
| Se alle pakker | Se coaching-pakker → |
| Book økt | Book økt → |
| Start økt | Start økt |
| Logg runde | Logg runde → |
| Lagre | Lagre |
| Avbryt | Avbryt |
| Slett | Slett |
| Legg til | Legg til |
| Tilbake | ← Tilbake |
| Neste steg | Neste → |
| Se alle | Se alle → |
| Kontakt oss | Ta kontakt → |
| Søk opptak (Performance Pro) | Søk opptak → |
| Oppgrader til PRO | Oppgrader til PRO — 300 kr/mnd → |

---

## 15. E-postvarsler

### 15.1 — Velkomst (ny spiller)
```
Emne:     Velkommen til AK Golf Academy, {fornavn}.
Ingress:  Du har nå tilgang til PlayerHQ. Coachen din setter opp
          planen din og tar kontakt.
CTA:      Åpne PlayerHQ →
```

### 15.2 — Invitasjon (ny spiller opprettet av coach)
```
Emne:     {Coach-navn} har lagt deg til i AK Golf Academy.
Ingress:  Du er invitert til å bruke PlayerHQ. Opprett passord
          for å komme i gang.
CTA:      Opprett passord →
Utløper:  Lenken er gyldig i 48 timer.
```

### 15.3 — Booking bekreftet
```
Emne:     Booking bekreftet — {dato} kl. {tid}.
Ingress:  Din coaching-økt med {coach-navn} er bekreftet.
Detaljer: {Dato} · {tid} · {sted}
CTA:      Se booking i PlayerHQ →
```

### 15.4 — Ukerapport tilgjengelig
```
Emne:     Ukesrapporten din er klar.
Ingress:  {Coach-navn} har skrevet ukesrapporten for uke {N}.
CTA:      Les rapporten →
```

### 15.5 — Ny faktura
```
Emne:     Ny faktura fra AK Golf Academy — {beløp} kr.
Ingress:  Forfallsdato: {dato}.
CTA:      Se faktura →
```

---

> **Rediger direkte i denne filen.**
> Implementering henter tekst herfra — ikke fra koden direkte.
> Merk gjerne endringer med ⚡ so det er lett å skanne hva som er nytt.
