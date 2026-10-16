# akgolf.no som animert reise — revisjon og plan (15.10.2026)

Bestilling (Anders 15.10): nettsted i verdensklasse for akgolf.no. Først revisjon av dagens
landingssider og bookingsystem, så forbedring. Rullingen skal ta kunden gjennom en reise som
ender i at kunden vil ha coaching. Innhold: Coaching med AK Golf Academy · Anders Kristiansen og
Markus Røinås Pedersen · Reisen med AK Golf · Coaching og appen i kombinasjon for alle golfere ·
Beta-periode nå. Designsystem: AK Golf Precision Athletics.

Status: **plan, ikke bygget.** Anders 15.10: «ikke flytt domene før siden er godkjent». Domenet
flyttes derfor sist, etter port 7 og røyktest. Alt bygges og vises på `akgolf-hq.vercel.app`.

---

## 1. Revisjon — slik er det i dag

Sjekket 15.10 mot `akgolf.no`, `akgolf-hq.vercel.app`, koden i `src/app/(marketing)` og
`src/components/marketing`, og markedsutkastet i PR #1317.

### Det som stopper alt (må løses først)

1. **akgolf.no er ikke nettsiden.** Domenet svarer med en omdirigering til Acuity
   (`akgolfgroup.as.me`). Den som skriver akgolf.no i dag lander på en bookingside med Times
   New Roman, uten merke, uten tekst om coaching og uten app. Domenet er ikke koblet til
   Vercel-prosjektet `akgolf-hq` (eneste produksjonsdomene der er `akgolf-hq.vercel.app`).
   Konsekvens: uansett hvor bra nettsiden blir, ser ingen den før domenet flyttes.
2. **Bookingen er klar, men bor på feil adresse.** Den innebygde bookingen (BK-01, Precision,
   fire steg, Stripe) er åpen for alle på `akgolf-hq.vercel.app/booking` (sjekket uten innlogging
   15.10). Alle «Book time»-knapper på nettsiden går dit, ikke til Acuity. Men siden akgolf.no
   peker til Acuity, bruker kundene fortsatt Acuity. To bookingsystemer lever side om side til
   domenet flyttes.

### Forsiden og landingssidene

3. **Forsiden er ren og riktig i Precision, men står stille.** Ingen bevegelse, ingen
   fortelling: hero, to kort, fem lister, bilder i rutenett. Den forklarer, den overbeviser ikke.
   Ingen video brukes selv om `public/brand/motion/hero-loop.mp4` (3,5 MB) og
   `hero-loop-trackman.mp4` (5,1 MB) ligger klare.
4. **Bare 3 av 24 markedssider er i Precision** (forside, booking, bookingkvittering).
   Resten (coaching, coacher, priser, om oss, kontakt, junior, cases, suksess, blogg, faq,
   juridisk) rendrer fortsatt de gamle `v2`-komponentene, som bare får Precision-farger gjennom
   `marked-precision.css`. Typografi, avstander og kort spriker fra side til side.
5. **Markus står som «Head Coach»** på `/coaching` (bildetekst) mens `/coacher` sier
   «Assistent». Anders er head coach. Faktafeil på den viktigste salgssiden.
6. **Ingen reise.** Menyen har fem likestilte punkter. Ingen side forteller «slik blir det å
   trene med oss»: første time → plan → økter i appen → måling → fremgang. Kunden må sette det
   sammen selv.
7. **Beta-perioden nevnes ingen steder.** Nettsiden selger appen som ferdig (299 kr/mnd), mens
   bestillingen sier beta nå. Det er en mulighet (få være med tidlig) som ikke brukes.
8. **Ingen bevis.** Merkereglene forbyr sitater og stjerner, med rette. Men nettsiden viser
   heller ikke det som er lov: målinger. Ingen tall om timer coachet, spillere i stallen, slag
   målt på TrackMan, uker med plan. Precisions «ett stort tall i Plex Mono» brukes ikke.
9. **Teknisk er grunnmuren god:** ingen sidelengs rulling i 390 eller 1024, `prefers-reduced-motion`
   respekteres, bilder lastes lat, IBM Plex Sans og Mono er på plass. Det er ikke her problemet
   ligger. Ingen animasjonsbibliotek finnes i prosjektet (verken GSAP, Motion eller Lenis).

### Bookingsystemet

10. **BK-01 i Precision er riktig bygget og åpen** (tjeneste → tid → deg → bekreft og betal),
    bekreftes automatisk etter betaling (§BOOKING BEKREFTES AUTOMATISK). Flyten videre til
    AgencyOS (webhook → booking CONFIRMED → varsel til coach → AG-06 Bookinger og AG-05 Kalender)
    er låst med 88 tester, alle grønne 15.10. Ikke verifisert: en ekte betalt booking i Stripe
    live. Ingen røyktest er dokumentert.
11. **Utkast 1 for booking (BK-01 til BK-03) og markedssidene finnes alt** i PR #1317
    (`docs/design-system/utkast-flater/booking.html` og `marked.html`, 15.10). Ingen av dem er
    godkjent (port 7). Markedsutkastet er statisk og uten reise. Planen under bygger videre på
    det i stedet for å starte på nytt.

### Dom

Dagens nettside er en ryddig brosjyre bak et domene som peker feil vei. Et selskap betaler ikke
10 000 dollar for en brosjyre. De betaler for at besøkende forstår på 20 sekunder hva de får,
kjenner det i kroppen mens de ruller, og booker uten å forlate siden.

---

## 2. Målet — hva «verdensklasse» betyr her

Innenfor Precision Athletics, ikke på tvers av det. Reglene står: lyst tema, grafitt primærknapp,
rust bare som signal (høyst én per skjerm), farge betyr akse, radius 8, ingen skygger, IBM Plex
Sans og Mono, aldri sidelengs rulling, ingen sitater. Verdensklasse er da **presisjon i
bevegelse**, ikke partikler og filmkorn:

- Rolig, tung og tydelig. Bevegelse som i en målt sving: én ting beveger seg om gangen.
- Tall som teller opp i Plex Mono. Linjer som tegnes. Bilder som avslører seg. Tekst som kommer
  linje for linje, aldri bokstav for bokstav.
- Rullingen er reisen. Hvert trinn får sin «stopp» der innholdet fester seg (festet seksjon),
  før neste trinn tar over.
- 60 bilder i sekundet på mobil. Bare `transform` og `opacity` animeres. Reduced motion gir
  samme side uten bevegelse.

Målbart: Lighthouse ytelse ≥ 90 på mobil, LCP < 2,0 s, ingen layout-hopp (CLS < 0,05),
`scrollWidth === clientWidth` i 360, 390, 768, 1280 og 1440, og én vei til booking som aldri
forlater akgolf.no.

---

## 3. Reisen — storyboard for forsiden

Én lang side. Hver akt er en festet seksjon (pinnes mens du ruller gjennom den), med unntak av
akt 1 og 8. Menyen blir en tynn linje med «Book time» som eneste handling.

| Akt | Overskrift (utkast) | Hva kunden ser | Bevegelse |
|---|---|---|---|
| 1 Åpning | **Bedre golf, over tid.** | Hero-video (`hero-loop.mp4`, dempet, uten lyd) under tekst. Ett stort tall: «Siden 2018». «Book time» grafitt, «Se reisen» tekstknapp. | Tekst inn linje for linje. Video med lett parallakse. Pil som pulserer én gang. |
| 2 Problemet | **Du har fått tips nok.** | Tre korte setninger om hvorfor tilfeldig trening ikke gir fremgang. | Setningene bytter plass mens du ruller (festet). Grafitt på sand. |
| 3 Coachene | **Anders og Markus.** | To portretter, Anders Kristiansen (Head Coach, PGA Pro) og Markus Røinås Pedersen (coach). Rolle, område, ett tall hver (år som coach, timer coachet). | Portrettene avsløres med maske. Tallene teller opp. |
| 4 Første time | **Alt starter med én time.** | Hva som skjer i timen: måling på TrackMan, samtale, plan. Tre kort som bygger seg opp. | Festet. Kortene stabler seg ett for ett. |
| 5 Reisen med AK Golf | **Så fortsetter det, hver uke.** | Fem trinn: Time → Plan → Økt → Måling → Fremgang. Hver med akse-farge der det passer (FYS · TEK · SLAG · SPILL · TURN). | Festet. En linje tegnes gjennom trinnene mens du ruller; aktivt trinn er fylt, de andre dempet. Dette er sidens hjerte. |
| 6 Appen | **Coaching og app, sammen.** | Telefon med PlayerHQ (I dag · Plan · Stats · Meg) ved siden av coach-teksten. Ekte skjermbilder fra appen, aldri attrapp. | Festet. Telefonen bytter skjerm per trinn i teksten. |
| 7 Beta | **Vi er i beta. Bli med nå.** | Hva beta betyr (tidlig tilgang, du former appen, pris i beta). Ett tall: antall plasser eller spillere i beta. Rust-pille «Beta» er sidens ene rust. | Linje tegnes, tallet teller. |
| 8 Booking | **Book første time.** | BK-01 bakt inn i siden: velg tjeneste og tid her, betal, ferdig. Aldri ut til Acuity. | Rolig. Ingen animasjon utover kortenes trykk. |

Undersidene (coaching, priser, om oss, junior, kontakt) får samme bevegelsesspråk i mindre dose:
hero-avsløring, linje-tegning og talltelling. Ingen festede seksjoner der.

---

## 4. Slik bygges bevegelsen (innenfor Precision)

- **Bibliotek:** GSAP med ScrollTrigger og `@gsap/react` (`useGSAP`). Valgt fordi festede
  seksjoner og rulledrevne tidslinjer er kjernen, og fordi prosjektet har ferdige
  arbeidsregler for det (`gsap-core`, `gsap-react`, `gsap-performance`). Ingen Lenis: nettleserens
  egen rulling, så tilgjengelighet og «aldri sidelengs rulling» står urørt.
- **Ett bevegelsesark:** `src/styles/marked-bevegelse.css` med varighet og easing som tokens
  (`--dur-reise`, `--ease-reise`), lagt oppå Precisions `--dur-*`/`--ease-*`. Komponenter i
  `src/components/marketing/reise/` (Akt, Avsloer, Tell, Linje, Festet).
- **Regler:** bare `transform` og `opacity`; `will-change` bare mens animasjonen går;
  `prefers-reduced-motion` slår av alt unntatt opacity; alt innhold er i DOM uten JavaScript
  (SEO og skjermleser ser hele siden).
- **Video:** `hero-loop.mp4` komprimeres til under 1,5 MB (720p, uten lyd) + WebM, med
  stillbilde som plakat. Lastes først etter at tekst og knapper er synlige.
- **Tall:** alle tall hentes fra basen eller skrives som «—». Ingen gjettede tall (regel:
  manglende verdi blir aldri antakelse).

---

## 5. Plan — ti steg

Hvert steg er en egen gren og PR, lagret etter hvert ferdig steg, grønn `npm run verify` før
merge. Alt bygges på `akgolf-hq.vercel.app`; akgolf.no rører vi ikke før steg 10. Port 7 (Anders har sett skjermen i 390 og desktop) gjelder
hvert steg som lager skjerm.

| # | Steg | Ferdig når |
|---|---|---|
| 1 | **Utkast 2 av markedssidene med reisen.** Bygg videre på `marked.html` fra PR #1317: ny forside etter storyboardet, bevegelse spesifisert per akt, Markus rettet til coach, beta-akt inn. Publiseres som Artifact til Anders. | Anders har sett utkastet i 390 og desktop og sagt ja (port 7). |
| 2 | **Bevegelsesgrunnmuren i koden.** GSAP + ScrollTrigger inn, `marked-bevegelse.css`, de fem reise-komponentene, reduced motion, test som låser at alt innhold finnes uten JavaScript. | Et testark med alle fem komponentene går i 60 fps på iPhone i Safari. |
| 3 | **Forsiden, akt 1 til 4.** Hero med video, Problemet, Coachene, Første time. Ekte tall fra basen eller «—». | Port 7, Lighthouse ≥ 90 mobil, ingen sidelengs rulling. |
| 4 | **Forsiden, akt 5 til 8.** Reisen (linjen), Appen (telefon med ekte PlayerHQ-skjermer), Beta, Booking bakt inn. | Port 7. Booking fra forsiden går hele veien til betalt. |
| 5 | **Undersidene til Precision med lett bevegelse.** Coaching, priser, om oss og coacher, junior, kontakt skrives om fra `v2` til Precision-komponenter. Gamle `v2`-filer slettes når ingen rute bruker dem. | Ingen markedsrute importerer `marketing/v2` (stats unntatt). Port 7 per side. |
| 6 | **Innhold og SEO.** Tekst etter ordboka (`docs/treningsplanlegging.md`), Beta-budskap, metadata og Open Graph-bilder per side, `sitemap`, strukturerte data for lokal virksomhet. Språkvask med slopmonster. | Søk etter forbudte ord gir 0 treff; OG-bilde vises riktig ved deling. |
| 7 | **Måling og kontroll.** Playwright-sjekk av alle markedsruter i 360/390/768/1280/1440, lys, tom/laster/feil: `scrollWidth === clientWidth`, kontrast, treffmål 44 px. Plausible-mål på «Book time»-trykk og fullført booking. | Kontrollskriptet er grønt og kjører i `npm run verify`. |
| 8 | **Godkjenning av hele siden.** Anders går gjennom alle markedssider på `akgolf-hq.vercel.app` i mobil og desktop. Rettelser tas her. | Anders sier «godkjent» for hele siden, ikke bare forsiden. |
| 9 | **Komplett booking i AgencyOS, deretter røyktest.** Først [bookingplanen](booking-komplett-agencyos-plan-2026-10-15.md) steg 1–9 (Anders 15.10: alle bookingfunksjoner må virke i AgencyOS før lansering). Deretter røyktest: Én ekte booking med betaling i Stripe live (Anders gjør kjøpet), sjekk AG-06 Bookinger, kalenderen, coach-varsel og kvitterings-e-post. Deretter refusjon. Stripe-live sjekkes sist (regel). | Bookingen står i AgencyOS og e-postene kom. Dokumentert i `docs/`. |
| 10 | **Flytt akgolf.no til appen.** Først nå: legg domenet på Vercel-prosjektet `akgolf-hq`, fjern omdirigeringen til Acuity. Acuity holdes åpen en periode for gamle lenker. Oppdater `beslutninger.md` og `docs/design-system/utkast-flater/README.md`. | `https://akgolf.no` viser den godkjente siden; `curl -I` gir 200, ikke 307. |

Anslag: steg 1 er én designøkt. Steg 2 til 5 er hoveddelen av arbeidet. Steg 6 til 9 er to til tre
økter. Steg 10 er under en time.

---

## 6. Valg som trengs fra Anders før steg 1

1. **Domenet.** Avgjort 15.10: akgolf.no flyttes ikke før hele siden er godkjent (steg 10).
2. **Beta.** Hva betyr beta på nettsiden: samme pris (299 kr/mnd) med «du er tidlig ute», eller
   egen beta-pris? Og finnes det et tall vi kan vise (plasser, spillere i beta)? (Anbefalt: samme
   pris, tydelig «beta» og et ekte tall; mangler tallet, vises det ikke.)
3. **Språk.** Bestillingen er på engelsk; nettsiden er på norsk. Planen antar norsk tekst og
   norske kunder, med engelsk senere bare om det bestilles. (Anbefalt: norsk.)

Alt annet i planen følger gjeldende beslutninger og trenger ikke nytt ja.
