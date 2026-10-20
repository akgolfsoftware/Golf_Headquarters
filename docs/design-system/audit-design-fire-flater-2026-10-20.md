# Kritisk designaudit: PlayerHQ, AgencyOS, WANG Toppidrett og Team Norway (20.10.2026)

Hvordan: appen kjørt lokalt mot samme database som produksjon, innlogget med demokontoene (spiller `screentest`, coach `coachtest`, `demo@wang.no`, `demo@golfforbundet.no`), hovedskjermene målt i 390 og 1280 px. WANG og Team Norway er i tillegg sjekket på `akgolf-hq.vercel.app`. Ingen skjerm ruller sidelengs, ingen konsollfeil. Funnene under handler om det som står igjen når det tekniske er grønt.

Skjermbildene ligger i økta (sendt som filer). Forrige analyse (`analyse-frontend-playerhq-agencyos-2026-10-20.md`) dekker koden bak; denne dekker det brukeren ser.

## Dommen i tre setninger

PlayerHQ er den flaten som er ferdigst: I dag, Plan, Stats og Meg henger sammen, bruker aksefargene riktig og er like på mobil og PC. AgencyOS har riktig skall og meny, men innholdet er fylt av demo-støy og gamle sider som bryter stilen, og Cockpit bruker 30 til 59 sekunder på å laste. WANG og Team Norway kan ikke vurderes som trenerflater i dag, fordi demokontoene får feilside på hver eneste skjerm, både lokalt og i produksjon.

## A. Stoppere (ødelegger inntrykket før designet får sjansen)

| # | Flate | Funn | Bevis |
|---|---|---|---|
| A1 | AgencyOS | **Cockpit laster i 29 til 59 sekunder** (applikasjonskode, ikke Next). Skjermen viser skjelett så lenge at en coach vil tro appen er død. Innboks, Stall og Kalender laster på ca. 1 sekund. | `GET /admin/agencyos 200 in 59s (application-code: 59s)` i dev-loggen, fire målinger |
| A2 | Team Norway | **Hver side viser «Siden finnes ikke, eller spilleren har ikke delt»** for demotreneren, også Rangliste og Workbench som ikke handler om én spiller. Sidemenyen står igjen som navy skjelett uten menypunkter. Samme i produksjon. | `prod-tn-pc-team-norway.png` og sju andre |
| A3 | WANG | **Trenerflaten gir AK Golf-404** («Til forsiden · Til PlayerHQ») for demotreneren, lokalt og i produksjon. `/team-wang/demo` sier «Golf-demoen er ikke tilgjengelig». Trenerflaten viser bare fellessiden. | `prod-wang-pc-team-wang_coach.png` |
| A4 | AgencyOS | **Innboksen har 3 766 saker, 3 692 av dem «Godkjenn»**, alle fra «Anders Skarpnord Kristiansen · Forslag fra motoren» med tom tekst («—»). Cockpit sier «Tøm godkjenningskøen (3643)». En coach kan ikke bruke innboksen før motoren slutter å produsere tomme forslag hvert 20. minutt. | `coach-pc-admin_innboks.png`, `coach-pc-admin_agencyos-2.png` |

**A1+A4: gjort 20.10 i PR #1466** (lagt inn i main). Cockpit målt til 1,0–1,1 s applikasjonskode (fra 30,9–33,4 s). Vakten mot tomme forslag er låst med test; ryddeskriptet `scripts/avvis-tomme-proactive-booking-2026-10-20.ts` er kjørt mot produksjon: 3 498 forslag merket avvist, ingenting slettet, 148 ventende saker igjen.

**A2+A3: gjort 20.10 i PR #1465** (lagt inn i main). Demotrenerne slipper inn på WANG og Team Norway, TN-404 er nøytral med ekte meny, og `/team-wang` har WANG-stilet 404.

A2 og A3 har samme rot: demokontoene er koblet til `wang-toppidrett-demo` og `team-norway-demo` (PR #1347 og #1359), og tilgangssjekkene finner ikke gruppa. Det er ikke undersøkt om gruppene mangler i basen eller om medlemskapet mangler. Uansett er det disse kontoene Anders og eksterne skal vise flatene med.

## B. Designbrudd mot egne regler

| # | Flate | Regel | Brudd |
|---|---|---|---|
| B1 | AgencyOS Stall | «Rust bare som signal, høyst én per skjerm» | 37 av 62 spillere har rød tekst «Trenger deg · Bak plan» eller «Trenger deg · Inaktiv». Når alt er rødt, betyr rødt ingenting. Tallet «37 Trenger deg · 0 Følger planen · 0 Hviler» viser at regelen for «trenger deg» er feil kalibrert, ikke at stallen er i krise. |
| B2 | WANG | «Firkantede hjørner overalt, hovedknapp vinrød #AE0034» (16.10) | Innloggingssiden `/wang` har 24 px avrundede felt og knapper, navy hovedknapp og rosa lenker. Det er stilen fra før 16.10. Feilsiden på `/team-wang/demo` har teal knapp. |
| B3 | Team Norway | «Hjørner 0 · 2 · 4, ingen sirkler» | Feilsiden («Til Spillerutvikling») har pilleformet knapp. |
| B4 | Alle | Cookie-banneret er AK Golf-stilet (IBM Plex, svart knapp, 12 px kort) | Det ligger over WANG- og Team Norway-sidene i AK Golfs merke. En WANG-trener ser AK Golf før hen ser WANG. |
| B5 | AgencyOS | Variant C-menyen har gruppene Daglig · Spillere · Drift | Kickeren øverst på Grupper, Tester og Oppsett sier fortsatt «MER · …», og Data Golf sier «DRIFT · DATA GOLF · BARE ADMIN» selv om coacher skal se den (16.10). Små ting, men de sier til brukeren at menyen og siden ikke er enige. |
| B6 | AgencyOS Workbench | Precision: lyst, ett skall | `/admin/plan` («Maler og øvelser») er gammel port: grå topplinje, «← Cockpit»-lenke, andre kortstiler. Malteksten sier «Bygger MORAD-grunnposisjoner», «CS 50 %» (utgått skala) og «elite-amateur». MORAD skal ikke stå i skjermtekst, og CS er avgjort utgått. |
| B7 | PlayerHQ Workbench | «Spilleren får nivåene År · Periode · Måned · Uke» (14.10) | Spilleren har fortsatt coachens fire flater (Sesongkart · Ukeverksted · Trenerbord · Stats), med egen toppmeny og «Mer». På mobil er det tre rader kontroller og tabs før kalenderen, og kalenderen ruller inni seg selv. Det er den eneste PlayerHQ-siden som ser ut som en annen app. Grenen finnes (økt «wb-nivaer»), ikke i main. |

## C. Svakheter i selve designet (det som er bygget etter utkast, men likevel ikke sitter)

**PlayerHQ**

- **Stats på PC har et løst bilde.** Heltebildet ligger alene øverst til høyre, med tom luft til venstre før tittelen. På mobil er bildet et bånd over kortene og fungerer. PC-varianten ser ut som et bilde som ikke fant plassen sin.
- **Samme stockbilde på begge dagens økter.** To TEK-økter, samme golfbilde, samme fargeflate. Bildet tilfører ingenting kortet ikke alt sier. Enten ett bilde per akse eller ingen.
- **Meg viser motstridende tall.** «Deling 0 organisasjoner ser profilen din» og «WANG-gruppen» som pille på samme skjerm. «Kategori —» ved siden av «Kategori C» i Stats.
- **«0 % av uka» som første tall tirsdag morgen** er sant, men demotiverende. Utkastet viser det samme. Vurder «Uke 43 · 0 av 20 t» med donuten dempet til første økt er gjennomført.
- **Live-økta viser «0 av —»** når øvelsen mangler mål. Streken er riktig regel, men «av —» leser som feil. Skjul «av» når målet mangler.

**AgencyOS**

- **Stall på PC er delt i to halvdeler der venstre er tom.** «I dag: Ingen» og «Trener nå: Ingen» tar halve bredden; alle spillerkortene står i høyre halvdel. Når venstre er tom, bør listen ta hele bredden.
- **Booking har fire kontrollag før første booking:** faner, søkefelt med egen etikett, «Filter»-knapp, og statuspiller. «Ny booking» finnes både som knapp og som fane.
- **Kalender gjentar «Uke 43 · 19.10.–25.10.» tre ganger** (kicker, navigasjon, overskrift i tabellen).
- **Cockpit har «Skriv ut» og «Eksporter rapport»** som de to synlige handlingene øverst. Ingen beslutning ber om dem, og Jarvis-blokken under er det coachen faktisk skal gjøre.
- **«Neste økt i dag»-kortet i menyen er tomt grått** mens Cockpit laster, uten tekst. Det ser ut som en feil.
- **Mobil Innboks** viser samme avsender og «Forslag fra motoren» tjue ganger nedover. Uten gruppering av like saker er listen ubrukelig på telefon.

**WANG og Team Norway**

- Kan ikke vurderes før A2 og A3 er løst. Det som er synlig: innloggingssidene følger hvert sitt merke (WANG blå og rosa med Montserrat, TN navy med Lato), men begge har AK Golfs cookie-banner og AK Golfs 404.

## D. Hva som er bra og ikke skal røres

- PlayerHQ I dag og Plan er de to beste skjermene i hele appen: ett tall, fylte øktkort i aksefarge, økta ett trykk unna, identisk logikk på mobil og PC.
- AgencyOS-skallet (variant C) er ferdig: søk, neste økt, tre grupper, coach nederst, mobilmeny som hel flate.
- Innloggingssidene for WANG og Team Norway er egne merker med felles konto, som avgjort 18.10.
- Ingen sidelengs rulling på noen av 40 målte skjermer, ingen konsollfeil.

## E. Rekkefølge, rangert etter det brukeren merker først

1. **A2 + A3: få demokontoene inn på WANG- og TN-flatene** (sjekk at gruppene finnes og at demotrenerne er medlemmer; kjør `scripts/seed-demo-wang-tn-2026-10-15.ts` på nytt om de mangler). Uten dette kan ingen se de to flatene.
2. **A1: Cockpit under 2 sekunder.** Finn hvilken henting som tar 30 til 59 sekunder (sannsynligvis godkjenningskøen eller innbokstellingen over 3 700 rader) og flytt den bak en teller.
3. **A4: stopp motoren som lager tomme forslag**, og rydd de 3 692 i køen. Innboksen er ellers riktig tegnet.
4. **B1: kalibrer «Trenger deg»** i Stall, så rust betyr noe igjen.
5. **B7: legg inn grenen med nivåene** i PlayerHQ Workbench.
6. **B2 + B4: WANG-innlogging i vinrød og firkantet**, og cookie-banner som følger flatens merke.
7. **B5 + B6:** kickere rettet, og `/admin/plan` portert eller tekstene rettet (MORAD, CS, engelsk).
8. Resten av C som småretting når skjermene uansett åpnes.
