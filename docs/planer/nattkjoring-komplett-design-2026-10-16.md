# Nattkjøring 16.–17.10.2026: alle flater i nytt design, booking og konto virker

Bestilt av Anders 16.10 kl. 22:45: «Alle sider i PlayerHQ, AgencyOS, Team Norway og WANG og
nettsidene skal ha komplett nytt design som vi har jobbet med. Alt skal fungere og være fullt
operativt for booking og opprettelse av konto.» Anders ga samtidig Claude fullmakt til å
godkjenne og legge inn uten å spørre i natt (CLAUDE.md §Nattkjøring, beslutninger.md
§NATTKJØRING 16.–17.10).

Status: **plan, venter på «kjør» fra Anders.**

---

## 1. Slik står det nå (målt 16.10 kl. 22:50 mot main 2e52e2c81)

| Flate | Sider | I nytt design | Gjenstår | Tegning (utkast) |
|---|---|---|---|---|
| PlayerHQ `/portal` | 186 | 52 + 19 (pakke 11–12, #1364) + Workbench-øvelser (#1365) | pakke 2, 8, 13–17, PH-01 utkast 4, PH-16, steg 8 videresendinger (49 videresendinger er alt OK) | Alt tegnet. Pakke 14–17 i PR #1370 (ikke lagt inn). Port 7 mangler på pakke 2, 8, 14–17, PH-01, PH-16 |
| AgencyOS `/admin` | 168 | 42 bruker nytt skall (menyvariant C, #1374); 43 Precision-komponenter fra september | Alle pakkene i `utkast-agencyos/` (1–8, 10, 11) må bygges etter utkastene 15.10 | Alt tegnet, **ingen pakke har port 7** |
| Team Norway `/team-norway` | 36 | ingenting etter utkast 2 | pakke 1–7 og 9 | Alt tegnet og **godkjent 16.10**. Pakke 1–2 bygges nå i økta «Team Norway pakke 1–2» |
| WANG `/team-wang` | 20 | ingenting etter utkast 2 | pakke 2–8 og 10, tokens (hjørner 0, vinrød, Quattrocento) | Alt tegnet og **godkjent 16.10**. Pakke 2 bygges nå i økta «WANG pakke 2 I dag» |
| Marked `(marketing)` | 73 | 2 | 67 bruker `marketing/v2`; nettstedsplanen steg 1–8 | `marked.html` utkast 1, port 7 mangler. Ingen utkast 2 med reisen |
| Innlogging `/auth` | 17 | 9 delvis | AU-01–06 etter `innlogging.html` | utkast 1, port 7 mangler |
| Forelder `/forelder` | 16 | skall (ForelderSkall) | innhold FO-01–06 etter `forelder.html` | utkast 1, port 7 mangler |
| Offentlig booking, e-post, stats, GFGK, system | ~20 | BK-01 | BK-02–03, EP-01–06, ST-01–06, GJ-01–02, SY-01 | utkast 1, port 7 mangler |
| Booking i AgencyOS | — | steg 1 (#1338) og 2 (#1344) | steg 3–9 i bookingplanen | AG-05/AG-06 i `kalender.html` |
| Konto | — | Google + passord, oppstart, forelder, fødselsdato (#1357) | ikke prøvd ende til ende i nytt design | `innlogging.html` |

Kjører nå (ikke rør): «WANG pakke 2 I dag» (`claude/sharp-nobel-a0b0a5`) og «Team Norway pakke 1–2»
(`claude/sad-keller-2be87e`). Åpne PR-er: #1370 (utkast pakke 14–17, bare dokumenter), #1369 (bildeplan).
#1083 og #1024 røres ikke.

**Ærlig anslag:** rundt 290 sider skal bygges om på én natt. Det går bare med mange økter samtidig,
og det siste som blir ferdig er markedssidene og de tyngste bookingstegene (duo, gavekort). Planen er
derfor ordnet slik at hovedveiene (innlogging → oppstart → booking → betaling → bekreftelse, og
coachens dag i AgencyOS) er ferdige og røyktestet først, og sidene fylles på i bølger etterpå.

---

## 2. Reglene for natten

1. **Fullmakt:** Claude gjør port 7 på Anders' vegne, legger inn (merge) uten «merge», og avgjør
   åpne spørsmål med den anbefalingen som alt står i utkastet eller beslutningsloggen. Hvert valg
   føres i §6 «Avgjort i natt», så Anders kan omgjøre om morgenen.
2. **Unntakene i AGENTS.md står:** ingen ekte betaling, ingen e-post til ekte kunder, ingen sletting
   av produksjonsdata, ingen brytende skjemaendring, ingen domeneflytting, ingen hemmeligheter.
3. **Én gren og én PR per pakke.** Grønn `npm run verify` før merge, aldri `--no-verify`. Rødt
   rettes, aldri legges inn. CI feiler på Google Fonts iblant; kjør på nytt én gang før det regnes som rødt.
4. **Én skriver per fil.** Delte filer (`skjermregister.*`, `beslutninger.md`, `precision-ia.ts`,
   felles CSS, `proxy.ts`) endres bare etter rebase mot `origin/main` rett før PR. Koordinatorøkta
   (denne) legger inn i rekkefølge og løser konflikter.
5. **Fast oppskrift per skjerm** (fra porteringsplanen 14.10): komponent i `precision/`-mappa for
   flaten, stil i flatens `-ny.css`, funksjonen som finnes i dag beholdes, det utkastet viser som
   appen ikke kan står som avvik øverst i komponenten, prøvefil målt i 390/360/1280 uten sidelengs
   rulling, ingen demodata (bruk «—»).
6. **Demodata og gjetning er forbudt.** Mangler et tall, vises «—». Ingen hardkodet spiller.
7. **Ved sesjonsslutt** oppdaterer hver økt `~/ak-brain/prosjekter/akgolf-hq.md`, og koordinatoren
   skriver morgenrapporten (§7).

---

## 3. Planen: ti steg

| # | Steg | Hvem | Ferdig når |
|---|---|---|---|
| 1 | **Regel og plan inn** (denne PR-en). #1370 legges inn (bare dokumenter). | koordinator | main har regelen |
| 2 | **Bølge A, PlayerHQ (3 økter):** A1 pakke 2 Treningsøkta + PH-01 I dag utkast 4 + PH-16 Stats · A2 pakke 8 Meg + 13 Stats resten · A3 pakke 14–17 + steg 8 videresendinger + funnene i #1370 (proxy for turneringer, tofaktor-koder, symptom, tilgangssjekk på utfordringer) | 3 økter | ingen `/portal`-side har gammelt innhold; kontrollskriptet fra 16.10 gir 0 |
| 3 | **Bølge A, AgencyOS (4 økter):** A4 pakke 1–2 Cockpit, Innboks, Stall, Spiller 360 · A5 pakke 3 Kalender og Booking **sammen med bookingplanen steg 3–5** (tilgjengelighet, bookinglista, gjestelenke) · A6 pakke 4–6 Workbench coach, Live, Teknisk · A7 pakke 7, 8, 10, 11 Mer, Jarvis, Data Golf, resten | 4 økter | alle 168 `/admin`-sider bruker nytt skall og nye skjermer; Data Golf bak `kanSeDataGolf` |
| 4 | **Bølge A, TN og WANG (2 økter, starter når de kjørende øktene er ferdige):** A8 TN pakke 3–7 og 9 · A9 WANG tokens + pakke 3–8 og 10 | 2 økter | `/team-norway/*` og `/team-wang/*` følger utkast 2; fellessiden `/team-wang` urørt |
| 5 | **Bølge B, flater (2 økter):** B1 innlogging og oppstart (AU-01–06) + forelder (FO-01–06) + system (SY-01) · B2 offentlig booking BK-02–03 + e-postene EP-01–06 + statistikk ST-01–06 + GFGK GJ-01–02 | 2 økter | konto kan opprettes med Google og passord, forelder godkjenner, fødselsdato spørres; e-postene bruker ny mal |
| 6 | **Bølge B, booking resten (1 økt, etter A5):** steg 6 duo, 7 gavekort, 8 kundekort og takk-e-post, 9 rydding av gamle sider | 1 økt | bookingplanens ferdigkriterier 1–5; ingen bookingfunksjon utenfor AgencyOS |
| 7 | **Bølge C, markedssidene (2 økter):** C1 nettstedsplanen steg 2–4 (bevegelse, forsiden akt 1–8) · C2 steg 5–6 (undersidene til Precision, innhold og SEO). Ingen `marketing/v2` igjen | 2 økter | 73 sider i Precision; Lighthouse ≥ 90 mobil på forsiden |
| 8 | **Røyktest i testmodus (koordinator):** opprett konto → oppstart → book time → betal med Stripe-testkort → bekreftelse i AgencyOS, e-post og Google; coach flytter og avlyser; klippbooking; forelder booker for barn. E2E i `tests/e2e/` låser kjeden | koordinator | alle kjedene grønne lokalt med `LOCAL_E2E=1` og `LOCAL_STRIPE_E2E=1` |
| 9 | **Sluttkontroll alle ruter:** Playwright i 390 og 1280, lys, tom/laster/feil: `scrollWidth === clientWidth`, ingen konsollfeil, ingen demodata, ingen «Pro», «Vipps», «kartleggingsøkt». `npm run verify` grønn på main. Deploy til `akgolf-hq.vercel.app` | koordinator | kontrollrapport i `docs/design-audit/2026-10-17-nattkontroll.md` |
| 10 | **Morgenrapport** med skjermbilder 390 og 1280 per flate, lista «Avgjort i natt», det som ikke ble ferdig, og de tre tingene bare Anders kan gjøre (§5) | koordinator | rapport som Artifact + `~/ak-brain` oppdatert |

Rekkefølge og samtidighet: steg 1 først. Steg 2, 3 og 5 starter samtidig (9 økter). Steg 4 starter
når de to kjørende øktene har lagt inn. Steg 6 starter når A5 er inne. Steg 7 starter når det er
ledig kapasitet, senest når bølge A er halvveis. Steg 8–10 gjør koordinatoren til slutt. Overstiger
regelen «maks 3 økter samtidig» i `~/.claude/CLAUDE.md` §Forbruk, med Anders' uttrykkelige beslutning.

---

## 4. Prioritet hvis natta ikke strekker til

1. Innlogging, oppstart, booking og betaling (steg 5 B1, 3 A5, 8).
2. Coachens dag: Cockpit, Innboks, Stall, Kalender (A4, A5).
3. PlayerHQ resten (A1–A3).
4. TN og WANG (A8, A9).
5. Booking resten (steg 6), flater B2.
6. Markedssidene (steg 7). Blir disse ikke ferdige, står de i gammel Precision-forside + v2, som i dag, og domenet rører vi uansett ikke.

---

## 5. Det bare Anders kan gjøre (ikke i natt)

- **Stripe live-røyktest:** ett ekte kjøp av hver type (kort, klipp, duo, gavekort), deretter refusjon. Bookingplanen steg 10.
- **Apple Pay:** slå på i Stripe og bekrefte domenet.
- **Flytte akgolf.no** fra Acuity til Vercel (nettstedsplanen steg 10). Venter til hele siden er godkjent.
- **Se gjennom «Avgjort i natt»** (§6) og omgjøre det han er uenig i.
- Mappa `design/` i hovedmappa (57 MB, symlink til Downloads, fra 19.09): lagre eller slette.

---

## 6. Avgjort i natt

Fylles av øktene underveis. Hvert punkt: hva, hvilken anbefaling som ble valgt, hvor det står.

- **PlayerHQ pakke 8 Meg (A2):** skjermene var allerede bygget i #1324. Port 7 gjort ved måling. Raden «Venner og utfordringer» på Meg er byttet til «Utfordringer» (lenke `/portal/utfordringer`), etter §VENNER SKJULES TIL NESTE VERSJON. `PH24Meg.tsx`, `src/app/portal/meg/page.tsx`.

- **B1 · SY-01 systemsidene:** utkastets faste feilreferanse, klokkeslett for vedlikehold og «3 slag venter» er demodata og vises ikke. 500 viser Next sin digest som referanse; vedlikehold viser ekte telefon og e-post. (`src/components/system/precision-tilstand.tsx`)
- **B1 · Ikke tilgang (403):** ny side `/ikke-tilgang` etter utkastet. Innloggingsvakten sender fortsatt rett til egen hjemmeside ved rollefeil, som før (unngår løkker, endrer ingen sikkerhetsvakt i natt). (`src/app/ikke-tilgang/page.tsx`)
- **B1 · Grunnmur for utkast-flater:** `src/styles/flater-ny.css` (generert av `scripts/lag-flater-ny-css.mjs`, avgrenset til `.fln`, klassenavn fra utkastet) brukes av alle grupper i `utkast-flater/`. (`src/components/flater/FlateRamme.tsx`)

- **B1 · SY-01 systemsidene:** utkastets faste feilreferanse, klokkeslett for vedlikehold og «3 slag venter» er demodata og vises ikke. 500 viser Next sin digest som referanse; vedlikehold viser ekte telefon og e-post. (`src/components/system/precision-tilstand.tsx`)
- **B1 · Ikke tilgang (403):** ny side `/ikke-tilgang` etter utkastet. Innloggingsvakten sender fortsatt rett til egen hjemmeside ved rollefeil, som før (unngår løkker, endrer ingen sikkerhetsvakt i natt). (`src/app/ikke-tilgang/page.tsx`)
- **B1 · Grunnmur for utkast-flater:** `src/styles/flater-ny.css` (generert av `scripts/lag-flater-ny-css.mjs`, avgrenset til `.fln`, klassenavn fra utkastet) brukes av alle grupper i `utkast-flater/`. (`src/components/flater/FlateRamme.tsx`)

- **B1 · Innlogging (AU-01–03):** bare Google og e-post med passord; magisk lenke, engangskode og SMS-plassholderen er tatt bort. Nye passord krever minst 10 tegn (utkastet); gamle passord på 8–9 tegn virker fortsatt. (`src/components/auth/precision/KontoSkjermer.tsx`)
- **B1 · «Velg nivå» ved registrering:** alle starter på Gratis; Full betales i Stripe Checkout etter oppstarten (plan «pro»). Årspris velges i Meg › Abonnement.
- **B1 · Bekreftelseslenken beholder rollen:** `oauth-callback` oppretter brukeren med rollen fra registreringen (bare PLAYER eller PARENT) og TALENT for spillere, som `ensureUser`. Før ble en forelder som bekreftet e-posten opprettet som spiller.
- **B1 · Oppstarten (AU-04):** utkastets sju steg. Fasilitetene velges som områder og steder; teknikktesten fører snitt av fem slag per kølle; planene er merket «Eksempel» til innholdet er skrevet.
- **B1 · Forelder (AU-04/05):** forelderen godkjenner fra lenken og oppretter deretter egen konto med samme e-post. Kobling via barnets e-post (utkastet) finnes ikke i appen og er ikke bygget. Forelderoppstarten har to steg; betaling velges ved booking.
- **B1 · `?next=` etter innlogging:** `safeRedirectPath` avviser kontrolltegn og normaliserte «//»-mål (sikkerhetsfunn under arbeidet).

**A5 Kalender og Booking (pakke 3, natt 17.10):**
- Head coach er ADMIN-rollen, assistant coach COACH-rollen (samme regel som Økonomi). Assistant coach ser andre coachers bookinger som «Opptatt» uten navn, og andre coachers enkeltøkter ikke i det hele tatt.
- Flytting med angre i kalenderen gjelder enkeltøkter fra Workbench. Bookinger får «Foreslå ny tid» (spilleren godtar), gruppeøkter flyttes i gruppas plan.
- Coachkolonnene i Dag viser bookinger og gruppeøkter; spillernes egne økter, skole, turneringer og tester står i «Ellers i dag».
- Åpent V8 i utkastet: knappen heter «Bekreft booking» for alle betalingsmåter, fordi AgencyOS ikke sender betalingslenke. «Stripe» merker bookingen med tjenestens pris og «Ikke betalt».
- Avlysning i Bookingen har ikke «Angre i 10 sekunder»: refusjonen i Stripe kan ikke trekkes tilbake.
- Påmeldte mot plasser på gruppeøkter vises som antall spillere; privattimer viser ingenting (utkastets anbefaling).
- `/admin/bookinger/ny` (gammel veiviser med gruppebooking) beholdes til gruppebooking finnes i AG-06-NY.
- **Fullført 18.10 (A5-resten):** bookingplanens steg 3 (vinduer, hel uke og fridager i Kalender › Tilgjengelighet) og steg 4 (søk og filter i lista, «Merk gjennomført» og notat på Bookingen) er bygget uten skjemaendring.
- **Avvik, venter på Anders:** buffer per coach (krever `users.bookingBufferMin`, skriptet fra natt-A5 er ikke tatt med) og «No-show» (krever ny status `NO_SHOW`). Steg 5 gjestelenke er ikke bygget: den krever en ny hemmelig nøkkel i Vercel og endrer e-posten til ekte kunder.
- `/admin/availability` sender ikke videre ennå: Google-synk og årsoversikten finnes bare der. Kalenderen lenker dit som «Google-synk og årsoversikt».


---

- **A4 · AgencyOS pakke 1 (Cockpit og Innboks):** AI-dispatch («Jarvis: én ting nå») står på Cockpit under dagens kalender, selv om utkastet ikke har det (skill agenticos-cockpit sier det skal beholdes). «Lag utkast» virker for e-post (Jarvis lager utkast, coachen sender); for spørsmål fra spillere er knappen fortsatt av, fordi det ikke finnes en navnevasket utkastlager for dem. Leads vises under Oppfølging bare for head coach, som e-posten, med «Skriv e-post» som åpner e-postprogrammet. E-postkonto nr. 2 (akgolfgroup@gmail.com) kommer ikke inn i innboksen ennå; det krever en ny inntakskobling.
- **A3 · PlayerHQ pakke 15 (Hjelp):** De 16 artiklene fra `hjelpeartikler.md` ligger i appen (`src/lib/portal-hjelp/artikler.ts`). «Koble til TrackMan» er ikke publisert, fordi importknappen ikke finnes i Stats › Trening ennå. Tre artikler er rettet mot appen: passordbyttet ber ikke om nåværende passord, målsetninger lages fra Plan › Målsetninger, og tofaktor lover ikke kode ved innlogging. Kontakt og tilbakemelding er ett skjema, «Skriv til oss», uten «Send anonymt» og uten «Tillat innsyn»; meldingen lagres på kontoen og går til post@akgolf.no. «Spør Anders» heter «Skriv til coachen».
- **A3 · PlayerHQ pakke 17a (Turneringer) og steg 1:** Turneringer og Én turnering i nytt design. Regelen i `tren-workbench-redirect.ts` som sendte `tren/turneringer/[id]` til Workbench er rettet, låst med test. «Neste turnering» er første turnering i GolfBox-kalenderen fra i dag. Påmelding er fortsatt to trykk («Jeg har meldt meg på», så «Bekreft»), ikke én avkrysning. Videresendt: ukesdigest, talent/sammenligning og mitt-niva, mal/leaderboard, mal/sg-hub/equipment (coachens visning beholdes), trening/break-tabell, gjennomfore, ai/foresla-drill, ai/foresla-turnering, utviklingsplan, kalender. Ikke videresendt ennå: `fysisk`, `tren/fys-plan`, `kalender/opptatt`, `tren/feiring/[planId]` og `ai/mal-bygger`, fordi skjermene Fysisk program, Opptatt tid, Perioden er ferdig og Ny målsetning ikke er bygget; de kommer i pakke 17b. Slettet ubrukte V2-komponenter etter #1364 og etter videresendingene.
- **A3 · PlayerHQ pakke 16 (Utfordringer):** Deltakere velges bare fra egne grupper; coach og ADMIN også fra stallen. Venner leses ikke lenger, og `/portal/venner` og `/portal/venner/[spillerId]` sender til Meg (logikken i `src/lib/venner` står til neste versjon). Én utfordring og «Bli med» slipper bare inn eier, valgte deltakere og ADMIN; andre får 404. Øvelsen i en ny utfordring må finnes i spillerens Øvelsesbank (før kunne enhver øvelse velges). Fargen på kortet kommer fra øvelsens pyramide; uten øvelse er kortet grafitt. Låst med tester i `actions.test.ts`.
- **Koordinator · AgencyOS pakke 7 Oppsett (AG-23):** fanen som i utkastet `mer.html` heter «Markedsføring og hjelp», heter «Maler og hjelp», fordi markedsføringssiden er fjernet (§MARKEDSFØRINGSSIDEN I AGENCYOS FJERNES, #1377). Fanen lenker til E-postmaler og Hjelp og viser Virksomhet. (`src/components/admin/precision/AG23Oppsett.tsx`)
- **A3 · PlayerHQ pakke 14 (Meg, resten):** Tofaktor-reservekodene er fjernet, ikke lagret hashet: innloggingen i appen ber ikke om tofaktorkoden i det hele tatt (ingen side krever nivå aal2), så lagrede reservekoder ville ikke hatt noe å låse opp. Skjermen lover ikke at innloggingen ber om koden. Egen oppfølging: tofaktor ved innlogging. Kvitteringer og kortbytte går til Stripe (kvitteringen for betalingen og kundeportalen). Dokumenter sendes til Hjelp (vedtak 16.10). Turneringsresultater (`/portal/meg/resultater`) beholdes i nytt design i stedet for å sendes til Profil, fordi Profil ikke kan koble kontoen til GolfBox; «Plass i kullet» er tatt ut (ingen sammenligning med andre). `helse/symptom/ny` sender til Helse, og `logSymptom` (som ikke lagret noe) er fjernet. Varsler, språk, integrasjoner og personvern sendes ikke videre ennå: Innstillinger lenker til dem og de lagrer ekte innstillinger; de flyttes når Innstillinger har funksjonene (pakke 8).

## 7. Morgenrapport

Skrives av koordinatoren som siste steg. Lenke legges her.
