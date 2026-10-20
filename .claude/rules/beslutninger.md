# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Gamle overstyrte valg er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## TESTBATTERIET ER TEAM NORWAYS 14 TESTER PLUSS FYSISK, PÅ ALLE FLATER (Anders 20.10.2026, bindende)

Anders 20.10, med Team Norways testbeskrivelse og scorekort-arket som vedlegg: «Dette er testene som gjelder.» Og om de fysiske testene: «Ja. Behold de fysiske testene (benkpress, markløft trapbar, lengdehopp, rotasjonskast, Club Speed) som en egen del Fysisk ved siden av Golfslag og Teknikk.» Svar på at designøktene viste ulikt antall tester (15 og 18) for det som skal være ett batteri.

- **Ett testbatteri i tre deler, i denne rekkefølgen, på alle flater** (PlayerHQ, AgencyOS, WANG, Team Norway):
  - **Golfslag:** Driver Basic · Inspill Basic · Wedge Variation · 8-balls variation · Putt 1–3 m · Golfslag på banen · 18 hulls inspill · 9 hull lengde.
  - **Teknikk:** Driver Gate · Wedge Gate · Putt Gate · Nærspill Gate · VISA Express · Putt Speed 1 × 5.
  - **Fysisk:** benkpress · markløft trapbar · lengdehopp · rotasjonskast · Club Speed. Fysisk test hver sjette uke i grunnperioden (uendret fra 28.09).
- **Fem prioriterte tester** med minsteantall: Driver Basic (1) · Inspill Basic (2) · Wedge Variation (2) · 8-balls variation (2) · Putt 1–3 m (4). Skjermene viser fremdrift som «1 av 2».
- **Fasit for protokoll, slag og poeng:** «Team Norway Golf – Tester» (`beskrivelse-av-tester-2026.pdf`) og scorekort-arket `team-norway-treningsprotokoll-og-tester-for-spillerv3`, arkene Scorekort GolfslagTester, Scorekort TeknikTester og Referens. Filene ligger hos Anders (Desktop/Team Norway) og må legges i repoet før koden endres.
- Uendret: PEI med carry og side, gate-testene som Godkjent/Bom (§PEI-TESTER FØRES MED CARRY OG SIDE, 14.10), en test teller bare med alle slag, Egenført/Kontrollert, nivå A–K.

**Overstyrer:** «alle NGF-testene fra 6-årsløpet» i §ÉN IUP OG ETT TESTBATTERI (28.09) for golfdelen. Fysisk-delen derfra står.

**Arbeidet dette utløser:**

1. **Kildene inn i repoet:** PDF-en og arket legges i `docs/design-system/utkast-tn/tester/` (eller tilsvarende) så øktene og koden kan lese dem. Ferdig når begge filene er i main og lenket herfra.
2. **Designøktene** (PlayerHQ, AgencyOS, WANG, Team Norway, 20.10) tegner testskjermene med de 19 testene i tre deler. Ferdig når alle fire flatenes Tester-oversikt viser samme navn, rekkefølge og antall, og Anders har godkjent dem.
3. **Katalogen i koden:** `src/lib/portal-tester/tn-catalog.ts` har i dag flere tester enn batteriet (bl.a. PEI-variantene, 8-ball blocked, Standard sving) og egne varianter per lengde og kjønn (Driver basic 220/270 m, Innspill Basis gutter/jenter). Batteriet vises som de 19 testene; varianter blir oppsett inne i én test, og tester utenfor batteriet flyttes ut av batterivisningen uten at lagrede resultater slettes. Ferdig når testoversikten på alle flater leser én felles liste, låst med test som sjekker antall og rekkefølge.
4. **Prioriterte tester med minsteantall** i datamodellen eller som konstant i koden, og fremdrift «X av N» per spiller. Ferdig når en test låser at Inspill Basic tatt én gang gir «1 av 2».
5. **Fysisk-delen:** de fem fysiske testene finnes i `src/lib/domain/fys-score.ts` og `src/lib/portal-fysisk/`. De kobles inn som tredje del i samme testoversikt. Ferdig når testoversikten viser Fysisk med siste resultat per test.
6. **Uavklart:** avvikene designøktene fant mellom PDF-en/arket og beslutningene (Team Norway-økta: seks, i den oransje lappen på canvaset https://claude.ai/artifact/5uuJLVhHxsmMpV44Eakid2; AgencyOS-økta: tre, i rapporten sin). Legges fram for Anders samlet, og hvert svar føres inn her før katalogen endres.

## TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY OG BYTTER TIL SCHIBSTED GROTESK (Anders 20.10.2026, bindende)

Anders 20.10 valgte anbefalingen på begge de uavklarte punktene i §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ» (punkt 7 og 8): navy sidemeny på PC, og Schibsted Grotesk fra Team Norway Golf-merket. Begrunnelse: sidemenyen har plass til alle menypunktene TN trenger, og skriften gjør appen lik resten av Team Norway sitt materiell.

- **PC: navy sidemeny** (`TnShell`/`TnRail`, `src/components/team-norway/tn-shell.tsx`), ikke hvit topplinje med piller fra Skrå-utkastet. Mobil er uendret (navy topplinje og meny som hel flate, `rail-mobil.tsx`).
- **Skrift: Schibsted Grotesk** i overskrifter og tekst under `/team-norway/*` og `/teamnorway`. IBM Plex Mono står på tall som før. Jost og Lato brukes ikke lenger i Team Norway.
- Resten av Skrå (bilde, skråkutt, myke kort, navy-skygger, farger) er uendret.

**Overstyrer:** «Jost display, Lato brødtekst» i §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (22.09), og menyen i Skrå-utkastet `docs/design-system/utkast-tn/nye-veier.html`.

**Arbeidet dette utløser:**

1. **Skriften i koden:** `src/app/team-norway/layout.tsx` og `src/app/teamnorway/layout.tsx` laster `Schibsted_Grotesk` fra `next/font/google` i stedet for `Jost` og `Lato`; `--tn-font-display` og `--tn-font-body` i `src/styles/team-norway-tokens.css` peker dit. Kommentarene som sier Jost/Lato (`tn-flate.tsx`, `tn-handlinger.tsx`, `tn-innlogging.module.css`, `tn-oversikt-skjerm.tsx`) rettes. Ferdig når et søk etter «Jost» og «Lato» i `src/app/team-norway`, `src/app/teamnorway`, `src/components/team-norway` og `team-norway-tokens.css` gir 0 treff, og 390 og 1280 px er målt uten sidelengs rulling.
2. **Utkastene:** `docs/design-system/utkast-tn/felles/tn.css` og `README.md` bytter til Schibsted Grotesk. Ferdig når README ikke lenger sier Jost/Lato.
3. **Pakkene i Skrå starter** (lanseringsplanen A6, punkt 5 i §SKRÅ): spillere og IUP først, med navy sidemeny og ny skrift. Ingen pakke venter lenger på Anders' svar.

## DATA GOLF ER ANDERS' PRIVATE VERKTØY: BARE ADMIN, PÅ ALLE FLATER, ALDRI UTAD (Anders 20.10.2026, bindende)

Anders 20.10, om #1450 (Data Golf bare for ADMIN, 19.10): «Jeg jobber både for Wang Toppidrett, Team Norway og AK Golf. Så dette er privat. Dette bruker vi i privat regi. Jeg godkjenner at det skal brukes, men ikke noe utover å publisere det og bruke det utad.»

- **Data Golf vises bare for ADMIN (Anders)**, i AgencyOS, `/team-wang` og `/team-norway`. Anders bruker det i alle tre rollene sine.
- **Ingen andre ser det:** ikke AK Golf-coacher, ikke WANG- eller Team Norway-trenere, ikke spillere, foreldre eller uinnloggede.
- **Aldri utad:** ingen publisering, ingen eksport, ingen Data Golf-tall i rapporter, e-post eller materiell som går ut av huset. «Powered by Data Golf» står der tallene vises.

**Overstyrer:** «Coacher ser dem» i §DATA GOLF VISES ALDRI TIL KUNDER (16.10) og «Data Golf er bare for coacher» i §KODEGJENNOMGANGEN 06.10.

Krever ingen kodeendring for tilgangen — bekrefter dagens tilstand: `DATAGOLF_ROLLER = ["ADMIN"]` (`src/lib/auth/datagolf-regel.ts:17`, #1450).

**Arbeidet dette utløser:**

1. **(haster, lisens) Bare Anders har ADMIN:** lesespørring mot `users` der `role = 'ADMIN'`. Ferdig når hver ADMIN-konto er Anders' egen, eller de andre er lagt fram for Anders.
2. **Ingen vei utad:** markedssidene lenker ikke til `/stats/pga` (punkt 12 i §KODEGJENNOMGANGEN 06.10), og ingen eksport, PDF eller e-post tar med Data Golf-tall. Ferdig når et søk i `src/app/(marketing)` etter `/stats/pga` gir 0 treff og en test låser at eksportene ikke leser `dg_`-data.
3. **Demoen 21.10:** Data Golf vises bare innlogget som Anders, aldri med demokontoene for WANG og Team Norway (`docs/planer/demo-lansering-2026-10-21.md` §5).

## TEAM NORWAY-APPEN FÅR RETNING «SKRÅ», OG HJØRNER OG SKYGGER ER IKKE LENGER FORBUDT (Anders 19.10.2026, bindende)

Anders 19.10, etter tre nye retninger for trenerens hjem bygget fra Team Norway Golf-merket (`docs/design-system/utkast-tn/nye-veier.html`, https://claude.ai/artifact/KoFx3JHEDs9KvRPvUVYbwk): «Gå for 1 Skrå. Før det som beslutning, også at regelen om hjørner 0–4 px og ingen skygger oppheves for Team Norway-appen.»

- **Retning 1 «Skrå» er visuell fasit for `/team-norway/*`.** Ekte banebilde i navy toner øverst, kuttet 4° nedover mot høyre med rød kant, og lyse kort som ligger over kanten.
- **Hjørner og skygger er tillatt:** myke kort med radius og lagdelte navy-skygger, slik utkastet viser. Runde avatarer og pilleknapper følger med.
- **Skråkuttet brukes bare på store flater** (toppen av en skjerm, seksjonsskiller), aldri på kort eller knapper. Bildene kommer fra `public/team-norway/bilder/`, ingen stockbilder.
- **Bildene er Team Norway Golf sine egne** (Anders 19.10: «du må bruke referansebilder fra Claude Design-prosjektet til Team Norway Golf»): fra «Team Norway Golf Design System» (`3416f258`, `assets/images/`), aldri kopier av PlayerHQ-bildene. De fire PlayerHQ-kopiene i `public/team-norway/bilder/` er byttet ut.
- **Uendret:** navy `#012B5D`, rød `#D70232` som identitet og aldri status, TN-aksefargene (14.10), logoen fra fil, IBM Plex Mono på tall, og lys arbeidsflate. Meny og skrift: §TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY (20.10).

**Overstyrer:** «hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar» i §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (22.09), og «Rammene er låst» for TN i `docs/planer/tn-wang-designloft-2026-10-16.md`.

**Arbeidet dette utløser:**

1. **Utkastet i repoet:** `docs/design-system/utkast-tn/nye-veier.html`, retning 1. Gjort i samme PR.
2. **Tokens:** `src/styles/team-norway-tokens.css` og speilet `src/lib/v2/team-norway.ts` får radiusskala, tre lagdelte skyggenivåer i navy og skråkuttet (4°). Ferdig når toppkommentaren ikke lenger sier 0 · 2 · 4 og ingen skygger, og verdiene finnes i begge filer.
3. **Komponentene:** `src/components/team-norway/core.tsx`, `tn-flate.tsx`, `tn-stall.module.css`, `tn-skjerm.module.css`, `tn-skall.module.css` og `src/app/teamnorway/tn-innlogging.module.css` bruker de nye tokenene; avataren blir rund. Ferdig når et søk etter «ingen skygger» i `src/components/team-norway` gir 0 treff, og 390 og 1280 px er uten sidelengs rulling.
4. **Trenerens hjem (TN-01):** `src/components/team-norway/skjermer/tn-oversikt-skjerm.tsx` får skråtoppen med bilde, kortene over kanten (saker som venter, neste samling med nedtelling, gruppas trening, turnering nå) og bevegelsen fra utkastet, med tidene fra TN-merket og `prefers-reduced-motion`. Ferdig når ingen tall er faste i koden og manglende data vises som «—».
5. **Resten av skjermene** i denne rekkefølgen, én PR per pakke: spillere og IUP · samlinger og fellestesting · uttak, rangliste, turneringer og live · månedsplan og Workbench · analyse, Data Golf og administrasjon. Ferdig når ingen TN-side bruker 0 · 2 · 4-flatene.
6. **Port 7:** Anders ser hjem og hver pakke i 390 og 1280 px på forhåndsvisningen.
7. **Menyen:** avgjort 20.10, navy sidemeny på PC (§TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY).
8. **Skriften:** avgjort 20.10, Schibsted Grotesk (§TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY).

## FYS STÅR ALLTID NEDERST I PYRAMIDEN, PÅ ALLE FLATER (Anders 19.10.2026, bindende)

Anders 19.10, etter å ha sett skjermgalleriet med alle tegningene: «Endre i alle visninger for pyramiden. Fysisk skal alltid vises nederst, ALDRI øverst. Gjør denne endringen over alle flater.»

- **Der pyramiden tegnes eller lagene står loddrett som en pyramide, er rekkefølgen ovenfra TURN · SPILL · SLAG · TEK · FYS.** FYS er grunnmuren og står aldri øverst.
- Gjelder PlayerHQ, AgencyOS, forelder, Team Norway, WANG, GFGK Junior, markedssidene, PDF-eksport og tegningene i `docs/design-system/utkast-*/`.
- **Gjelder ikke** vanlige lister, valgknapper, vannrette bånd, søyler side om side, tabeller og ukefordeling. Der står FYS først som før (`PYR_REKKEFOLGE`).
- Felles kilde i koden: `PYR_TOPP_TIL_BUNN` og `sorterPyramideOvenfra` i `src/lib/pyramide.ts`, låst i `src/lib/pyramide.test.ts`.

**Overstyrer:** ingenting. Rekkefølgen var ikke bestemt før.

**Arbeidet dette utløser:**

1. **Appen:** «Pyramiden mot planen» i Stats › Trening (`PH17Trening.tsx`), «Pyramiden i perioden» i WANG-årsplanen (`fane-trening.tsx`), pyramideartikkelen i Hjelp (`PHHjelpArtikkel.tsx`, `portal-hjelp/artikler.ts`), PDF-ens «Pyramide-fordeling» (`lib/pdf/plan-document.tsx`), og de delte `Pyramide` (`v2/datavis.tsx`) og `TidsPyramide` (`v2/spesialviz.tsx`) som nå sorterer selv. Gjort i samme PR.
2. **Tegningene:** `utkast-playerhq/stats-dybde.html` og `hjelp.html`, og `hjelpeartikler.md`. Gjort i samme PR.
3. **Nye pyramider** bruker `sorterPyramideOvenfra` eller `PYR_TOPP_TIL_BUNN`. Ferdig når hver ny pyramidevisning er laget slik.

## NATTKJØRING 18.–19.10: AUTOMATISK GODKJENNING I HELE PROSJEKTET, WANG OG TEAM NORWAY FULLFØRES (Anders 18.10.2026, bindende)

Anders 18.10: «fullfør nå alle oppgaver nå. legg til at auto godkjenning i hele prosjektet i natt så alle sessions kan jobbe.»
Svar på gjennomgangen samme dag, som viste at WANG og Team Norway er bygget i nytt design, men at flere funksjoner står tomme fordi dataene ikke finnes.

- **Fullmakten fra 16.–17.10 gjelder igjen, for hele prosjektet og alle økter:** Claude gjør port 7, legger inn i main når verify og CI er grønn, avgjør åpne spørsmål og fører valgene i planens §4. Grensen på tre samtidige økter er opphevet.
- **Additive skjemaendringer** kjøres av økta selv etter AGENTS.md §Stående forhåndsgodkjenning.
- **Står fortsatt:** ingen ekte betaling, ingen e-post eller invitasjon til ekte personer, ingen sletting eller omskriving av produksjonsdata, ingen brytende skjemaendring, ingen domeneflytting, ingen hemmeligheter, ingen `--no-verify`. Elevdata om mindreårige behandles etter `ak-personvern`.

**Overstyrer:** at datamodellen for WANG og Team Norway venter på Anders' ja (§ÉN IUP OG ETT TESTBATTERI punkt 5, §WANG: FEM ANSATTROLLER punkt 4), for natten.

**Arbeidet dette utløser:** arbeidspakkene W1–W4 og T1–T3 i `docs/planer/nattkjoring-wang-tn-funksjoner-2026-10-18.md`, én økt og én PR per pakke, og kontrollen K til slutt. Ferdig når hver pakke er lagt inn eller står med grunn i planens §3, og morgenrapporten (§5) finnes.

## SLAG I WANG ER MINT, IKKE ORANSJE (Anders 18.10.2026, bindende)

Anders 18.10: «Vi må bytte ut orange fargen med den grønne WANG-fargen på alle flater.» Valgt: bare WANG-flatene, og mint `#49CA9F` (ikke teal, som ligger for nær TEK `#226F67`).

- Oransje `#F47B20` i `/team-wang` og `docs/design-system/utkast-wang/` er byttet til mint `#49CA9F`; tekstvarianten er `#226F67`.
- **Advarselsfargen (`--color-warning`) forblir oransje**, fordi grønn betyr OK.
- PlayerHQ, AgencyOS og Team Norway er ikke berørt.

**Overstyrer:** SLAG = oransje i `utkast-wang/README.md` §Aksefargene (godkjent 14.10).

## PORT 7 ER GITT FOR ALLE UTKASTENE I OVERSIKTEN 18.10 (Anders 18.10.2026, bindende)

Anders 18.10 fikk en oversikt over skjermene han ikke selv hadde godkjent og svarte «Godkjent».

- **Omfatter:** AgencyOS utkast 1 (Stall og Spiller 360, Workbench for coach, Live coachingøkt, Teknisk plan og runder), flatene (Forelder, Offentlig booking, Statistikk, e-postene etter booking, Markedssidene, GFGK Junior og systemsider, Innlogging og oppstart), nattbyggene som fikk ja på hans vegne (AgencyOS Cockpit, Kalender, Mer, Jarvis, Data Golf, Resten; PlayerHQ I dag, Stats, Treningsøkta, Meg, Meg resten, Hjelp, Utfordringer, Plan-hjelpere, Stats resten), og Team Norway og WANG utkast 2 med Data Golf.
- **Gjelder designet i utkastene.** Appskjermene Anders ikke har sett i nettleseren, må fortsatt måles i 390 og 1280 og vises på Vercel-forhåndsvisningen.
- **Åpent:** `/wang` og `/teamnorway` starter mørke uten lagret temavalg (ikke i `erLysFlate`, `src/lib/v2/tema-default.ts`). Ikke avgjort om det er ønsket.

**Overstyrer:** «venter på port 7» i README-ene under `docs/design-system/utkast-*/` for skjermene over.

**Arbeidet dette utløser:** statuslinjene i README-ene settes til «Godkjent 18.10» når pakken porteres, ikke i denne PR-en. Ferdig per skjerm når den er porteret og målt uten sidelengs rulling.

## WANG OG TEAM NORWAY FÅR EGNE INNLOGGINGSADRESSER, OG HELE /TEAM-NORWAY ER STENGT FOR UINNLOGGEDE (Anders 18.10.2026, bindende)

Anders 18.10: «Logg inn via akgolf.no … www.akgolf.no/wang og www.akgolf.no/teamnorway», valgte alternativ A (egen inngang, felles konto), og «Ingen team Norway sider skal være åpne». Rangeringen: «legg rangering bak innloggingen for nå».

- **`/wang` og `/teamnorway` er innloggingssider** med eget utseende (WANG; Team Norway-språket: Jost/Lato, navy skinne), men samme AK Golf-konto og samme Supabase-innlogging som `/auth/login`. Ingen ny brukerdatabase og ingen landingsside. Innlogget sendes rett til returstien (`/team-wang` hhv. `/team-norway`).
- **Hele `/team-norway/*` krever innlogging**, også rangliste (`/team-norway/rangliste`, som `ngf-spillerranking`-adressen sender forsiden til). Uinnloggede sendes til `/teamnorway?next=…`. «For nå»: en åpen rangering kan komme tilbake som egen beslutning.
- **Gamle `/team-wang/logg-inn` videresender til `/wang`.** `/team-wang`-fellessiden er uendret åpen.

**Overstyrer:** punkt 2 («Åpent, ikke avgjort») i blokken under, og «innlogging fra `/auth/login`» for WANG og TN i den: de har nå egne innganger, men ikke egen konto.

**Arbeidet dette utløser** (PR #1412 gjør 1–3; resten er åpent):

1. **Innloggingsadressene og proxy-stengingen** bygget i #1412 (`src/app/wang`, `src/app/teamnorway`, `src/lib/auth/team-norway-sperre.ts`, `src/proxy.ts`). Ferdig når PR-en er i main.
2. **Port 7:** Anders ser `/wang` og `/teamnorway` i 390 og 1280 px. Ikke målt i nettleser ennå.
3. **Rydding:** trenerflatene under `/team-wang/coach` og `/team-wang/skjermer` peker fortsatt på `/team-wang/logg-inn?next=…` i `redirectTo` og i `wang-reise.ts`; det fungerer via videresendingen, men en runde ekstra. Pek rett på `/wang`.
4. **Åpent, ikke avgjort:** (a) `/wang` og `/teamnorway` er ikke unntatt vedlikeholdsmodus (`src/lib/vedlikehold.ts`), som den gamle WANG-innloggingen heller ikke var; skal de være åpne mens vedlikehold står på? (b) `/team-wang/app/logg-inn` (skoleplattform-varianten) har fortsatt egen side; skal den også til `/wang`? (c) Skal rangeringen åpnes igjen offentlig, og i så fall hvor?
5. **Domenet:** `www.akgolf.no/wang` og `/teamnorway` virker først når akgolf.no flyttes fra Acuity til appen (§AKGOLF.NO FLYTTES IKKE FØR HELE NETTSIDEN ER GODKJENT). Til da: `akgolf-hq.vercel.app/wang` og `/teamnorway`.

## TEAM NORWAY OG WANG FÅR INGEN EGNE LANDINGSSIDER, OG INNLOGGING SKJER FRA AKGOLF (Anders 18.10.2026, bindende)

Anders 18.10: «Vi trenger ikke landing sider for disse. Innlogging gjøre fra akgolf.»

- **Ingen markeds- eller landingssider for Team Norway og WANG.** Markedssidene (73 sider, 58 filer med `marketing/v2`) gjelder bare AK Golf.
- **Innlogging skjer fra AK Golf HQ** (`/auth/login`, Google eller e-post og passord, §INNLOGGING BARE MED GOOGLE OG PASSORD). Trenere lander på sin flate etter innlogging (demokontoene: #1359).
- **Sperren «landingssidene venter til TN og WANG er ferdige» (Anders 18.10) er opphevet.**
- Den åpne fellessiden `/team-wang` er en egen avgjørelse (§WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER, punkt 2) og røres ikke av denne.

**Overstyrer:** «Landingssidene venter til Team Norway og WANG er ferdige» (muntlig 18.10, i sesjonsminnet).

**Arbeidet dette utløser:**

1. **Markedssidene starter nå**, uavhengig av TN og WANG, sammen med BK-02/03 og e-postene EP-01–06. Ferdig når kartlegging og plan er lagt fram for Anders.
2. **Avgjort samme dag:** WANG og Team Norway får egne innloggingsadresser, `/wang` og `/teamnorway`, med felles konto (se blokken over). Skoleplattform-varianten `/team-wang/app/logg-inn` er fortsatt uavklart.

Anders 18.10: «Det er viktig at alle Wang skjermene bruker Wang bilder fra Wang toppidrett design systemet.»

- **Alle bilder i `/team-wang/*` kommer fra fotobiblioteket i Claude Design «WANG Toppidrett Designsystem»** (`3580374e`, `assets/photo/` og `uploads/wang-stills/`). Ingen PlayerHQ-, AK Golf- eller stockbilder.
- Bildene ligger i `public/team-wang/hero/`. I trenerflaten: `trening-golf.jpg` (golfutslag fra wang.no), `golf-putt.jpg` (still fra WANGs film) og `styrke-eleiko.jpg` (still med WANG-logo).

**Overstyrer:** bildene fra PlayerHQ i `docs/design-system/utkast-wang/bilder/` (README §Slik lages en skjerm).

**Arbeidet dette utløser:** pakke 3–8 og 10 bruker bare disse bildene. Ferdig når et søk etter `/images/playerhq` i `src/components/wang` og `src/app/team-wang` gir 0 treff.

## ALT SOM ER KLART LEGGES INN I MAIN AUTOMATISK (Anders 17.10.2026, bindende)

Anders 17.10: «kan du legge til regel at alt som er klart auto merges til main».

- **Claude slår på auto-merge (squash) på hver PR** når den er laget. GitHub legger den inn i main når alle sjekker er grønne.
- **Klart betyr:** `npm run verify` grønn lokalt og alle CI-sjekker grønne. Rødt legges aldri inn, og `--no-verify` brukes aldri.
- Skjermbilder i 390 og desktop og Vercel-lenken sendes fortsatt etter push, så Anders kan se designet i etterkant og be om endring.
- **Står fortsatt:** unntakene i AGENTS.md §Stående forhåndsgodkjenning (ekte betaling, e-post til ekte personer, sletting av produksjonsdata, brytende skjemaendring, domeneflytting, hemmeligheter).

**Overstyrer:** «Merge ALDRI til main før Anders har skrevet «merge»» i `CLAUDE.md` §Push og merge, også etter at nattkjøringen er opphevet.

**Arbeidet dette utløser:** `CLAUDE.md` §Push og merge er rettet i samme PR. Ferdig når regelen står der.

## NATTKJØRING 16.–17.10: CLAUDE GODKJENNER OG LEGGER INN SELV TIL ALLE FLATER ER I NYTT DESIGN (Anders 16.10.2026, bindende)

Anders 16.10 kl. 22:45: «Alle sider i PlayerHQ, AgencyOS, Team Norway og WANG og nettsidene skal ha
komplett nytt design som vi har jobbet med. Alt skal fungere og være fullt operativt for booking og
opprettelse av konto.» Og: «Du må legge inn i prosjektregler at du kan gjøre alt og godkjenne uten min
tillatelse for å gjøre prosjektet komplett i natt.» Bekreftet kl. 23:10: «Legg inn #1376 og start
nattkjøringen etter planen.»

- **Fullmakt for natten:** Claude gjør port 7 på Anders' vegne, legger inn i main uten «merge» når verify
  og CI er grønn, avgjør åpne spørsmål med anbefalingen som alt står i utkastet eller her, og fører hvert
  valg i planens §6 «Avgjort i natt». Grensen på tre samtidige økter er opphevet. Regelen står i
  `CLAUDE.md` §Nattkjøring til Anders opphever den.
- **Står fortsatt:** ingen ekte betaling, ingen e-post til ekte personer, ingen sletting av produksjonsdata,
  ingen brytende skjemaendring, ingen domeneflytting, ingen hemmeligheter (AGENTS.md §Stående forhåndsgodkjenning).
- **Målet:** alle sider under `/portal`, `/admin`, `/team-norway`, `/team-wang`, `/forelder`, `/auth`,
  markedssidene og de øvrige flatene bygget etter utkastene i `docs/design-system/utkast-*/`, og kjeden
  opprett konto → oppstart → book → betal (testmodus) → bekreftelse virker og er låst med E2E-test.

**Overstyrer (midlertidig):** «Merge ALDRI til main før Anders har skrevet «merge»» i `CLAUDE.md`, og
port 7 som Anders' egen gjennomgang, for alt som bygges i nattkjøringen.

**Arbeidet dette utløser:** de ti stegene i `docs/planer/nattkjoring-komplett-design-2026-10-16.md`.
Ferdig når morgenrapporten (planens §7) finnes, `npm run verify` er grønn på main, og lista «Avgjort i
natt» er lagt fram for Anders. Det bare Anders kan gjøre etterpå står i planens §5: Stripe live-røyktest,
Apple Pay, domeneflytting, og gjennomgang av «Avgjort i natt».

## AGENCYOS-MENYEN BLIR VARIANT C: SØK FØRST, TRE GRUPPER OG IKONSKINNE (Anders 16.10.2026, bindende)

Anders valgte variant C av tre menyforslag (`docs/design-system/utkast-agencyos/meny.html`, PR #1368): «C skal bygges». Underveis bestemte han at menyen skal kunne legges sammen til ikoner som glir ut ved trykk, at et ikon går rett til siden, og at klokkeslettet i ikonvisning skal være stort.

- **PC:** sidemeny med søk øverst (⌘K), neste økt som fylt kort i aksefargen, og punktene i tre grupper: **Daglig** Cockpit · Innboks · Kalender · **Spillere** Stall · Workbench · Grupper · Tester · **Drift** Booking · Økonomi · Data Golf · Oppsett. Coachen nederst.
- **Ikonskinne:** menyen kan legges sammen til 72 px. Trykk på et ikon går rett til siden. Trykk på merket, søk, neste økt eller tomt sted glir hele menyen ut over innholdet; valg av punkt går dit og legger den inn igjen. Klokkeslettet for neste økt står stort.
- **Mobil:** søkefelt i topplinja; menyen åpner som hel flate med søk og de tre gruppene.
- Økonomi vises bare for head coach. Data Golf vises bare for `kanSeDataGolf`, og først når coach-siden DG-01 finnes i AgencyOS.

**Overstyrer:** seks hovedpunkter med Mer i §SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8 (28.09) og §MER I AGENCYOS FÅR ET SJETTE PUNKT (16.10). Data Golf står i Drift, ikke i Mer.

**Arbeidet dette utløser:**

1. **Menylista** i `src/lib/agencyos/precision-ia.ts` blir tre grupper; `/admin/mer` fortsetter å virke. Ferdig når `precision-ia.test.ts` låser gruppene, rekkefølgen og at Økonomi bare vises for head coach.
2. **Skallet** `src/components/precision/AgencyOSSkall.tsx` får bred meny, ikonskinne og mobilflate etter utkastet. Ferdig når et ikon-trykk går rett til siden, menyen glir ut ved trykk på merket, og 390 og 1280 px er uten sidelengs rulling.
3. **Neste økt i menyen:** lett henting av coachens neste økt i dag; «—» når ingen finnes. Ferdig når kortet viser ekte økt eller «—», aldri demodata.
4. **Data Golf i Drift** når DG-01 er bygget under `/admin` (pakke 10). Ferdig når punktet åpner DG-01 og ikke vises uten coach-rolle, låst med test.
5. **Port 7:** Anders ser menyen i appen i 390 og desktop.

## STATS-RESTEN: TURNERINGER BLIR DEL AV RESULTATER, OG ØKT LOGGET I ETTERKANT TELLER BARE I TOTALEN (Anders 16.10.2026, bindende)

Svar på punkt 1, 3 og 4 i utkastet til PlayerHQ pakke 13 (PR #1367). Punkt 1 og 3: «Ja». Punkt 4: «Logg i etterkant går på totalen men ikke inforhold til plan».

- **«Sammenlign med coach» finnes ikke.** Spilleren sammenlignes ikke med coachens tall.
- **Turneringer er en del av Resultater** (pakke 6), med kurven over til par øverst. `/portal/analysere/turneringer` blir ikke egen side.
- **En økt logget i etterkant teller i total treningstid** (Stats › Trening, akse og område). **Den teller ikke mot planen:** verken i «lagt inn mot fordelt» eller i etterlevelsen (§KARTLEGGINGSØKT FJERNES).

**Overstyrer:** ingenting. Presiserer «Oppover» i §PLANNIVÅENE HENGER SAMMEN: der gjelder økter som ligger i planen.

**Arbeidet dette utløser** (når pakke 13 porteres):

1. **Turneringer inn i Resultater:** kurven fra `stats-resten.html` legges øverst i Turneringer-visningen i Resultater (`/portal/analysere/resultater`). `/portal/analysere/turneringer` sender dit, med sesongvalget med. Ferdig når turneringene vises én gang, ikke to (i dag gjør `MinKurveTrainLock` og `TurneringshistorikkTrainLock` det begge).
2. **Logg økt i totalen, ikke i planen:** `TreningLoggV2` lagrer i `trainingLog`. Total treningstid i Stats leser den med; etterlevelse og «lagt inn mot fordelt» gjør det ikke. Ferdig når en test låser at en logget økt øker totalen og lar etterlevelsen stå.
3. **«Sammenlign med coach» sendes til Stats** (punkt 1, Anders 16.10: «Ja»): `/portal/coach/sg-hub` blir videresending til Stats › Strokes Gained, og de faste tallene `COACH_SG` (`src/app/portal/coach/sg-hub/page.tsx:21`) og `CoachSgHubV2` fjernes. Ferdig når adressen sender videre og ingen lenke peker dit.

## DEL RUNDE FINNES VED LANSERING, VENNER MED INVITASJON, FØLGING OG FEED KOMMER I NESTE VERSJON (Anders 16.10.2026, bindende)

Svar på punkt 2 i utkastet til PlayerHQ pakke 13 (`docs/design-system/utkast-playerhq/stats-resten.html`, PR #1367):
«Vi må ha del runde funksjon, men opprette Venner funksjoner så man kan invitere venner og følge hverandre i en form for feed. Men dette er i neste versjon.»

- **Del runde er med ved lansering:** bilde for story eller innlegg, eller PDF med scorekortet. Synlig for «Bare deg» eller «Coach kan se», slik utkastet viser.
- **Ingen offentlig rundeside og ingen delingslenke ved lansering.** Bildet deles der spilleren selv vil.
- **Venner kommer i neste versjon, ikke ved lansering:** invitere venner, følge hverandre og en feed.

**Overstyrer:** ingenting. Pakke 16 «Venner og utfordringer» i `docs/planer/playerhq-alle-sider-nytt-design-2026-10-16.md` er delt (rettet i samme PR).

**Arbeidet dette utløser:**

1. **Del runde virker:** `DelRundeV2` (`src/components/portal/v2/DelRundeV2.tsx`) lager i dag ingen fil (`lastNed` er bare en `setTimeout`) og lagrer ikke synligheten. «Kopier lenke» peker til `/r/[id]`, som ikke finnes. Bygges etter `stats-resten.html` når pakke 13 porteres. Ferdig når «Lagre bildet» gir et ekte bilde eller PDF, synligheten lagres på runden, og lenkevalget er borte, låst med test.
2. **Venner i neste versjon:** tegnes og bygges etter lansering. Grunnlaget finnes: `Friendship` (PENDING, ACCEPTED, BLOCKED) og `/portal/venner`. Feed og følging finnes ikke.
3. **Uavklart:** hva `/portal/venner` og `/portal/venner/[spillerId]` gjør ved lansering (beholdes som i dag eller skjules), og om utfordringer fortsatt skal kunne velge deltakere blant venner (§UTFORDRINGER SKAL LEVE). Spørres Anders om før pakke 16 tegnes.
4. **Uavklart:** samtykke for mindreårige i feeden. Avklares når Venner tegnes, etter `ak-personvern`.

## WORKBENCH FÅR SØK I ALLE ØVELSER, MEST BRUKT FØRST, «NY ØVELSE» MED ALLE PARAMETRE OG LENKE TIL HELE ØVELSESBANKEN (Anders 16.10.2026, bindende)

Anders 16.10, etter pakke 11 og 12: «Det skal være et sted i workbenchen hvor man kan klikke seg inn og se en komplett egen side med alle øvelsene i øvelsesbanken, og filtrere på ulike ting.» Og: man skal kunne søke opp øvelsen, «som standard vises øvelsene som er gjort flest ganger», og trykke på pluss for å legge inn en egen øvelse med alle parametrene. Planen ble godkjent samme dag («ok»), og utkast 1 (`docs/design-system/utkast-playerhq/workbench-ovelser.html`) fikk ja: «Mest brukt teller alle økter, og coachen får samme bank-side i AgencyOS.»

- **Lenke fra Workbench til hele Øvelsesbanken** med filtrene (akse, treningsområde, miljø, press, søk). Spilleren går til `/portal/drills`; coachen får samme bank-side i AgencyOS.
- **Søket i Workbench leter i alle øvelser** brukeren har tilgang til, ikke bare de 60 første.
- **Uten søkeord vises de mest brukte øvelsene først**, talt i alle spillerens økter i Workbench (ikke et tidsvindu).
- **Pluss åpner «Ny øvelse»** med de åtte trinnene (pyramide, område, sted, måleutstyr, gjennomføring, press, mengde, mål) pluss navn, beskrivelse og video. Øvelsen lagres i Øvelsesbanken og legges samtidig i økta.
- **Synlighet:** en spillers egen øvelse ser spilleren og coachen. En øvelse coachen lager, ser alle coachens spillere.
- Gjelder både spillerens og coachens Workbench.

**Overstyrer:** at «Egen øvelse» i Workbench bare lagres i økta (`addDrill`, `src/lib/workbench/wb-actions.ts`), og arket «Ny egen øvelse» i `docs/design-system/utkast-playerhq/ovelser.html` (bare akse, område og navn).

**Arbeidet dette utløser:**

1. **Utkast:** `docs/design-system/utkast-playerhq/workbench-ovelser.html`. **Godkjent 16.10** (port 7).
2. **Søk i alle øvelser:** `loadSources` (`src/lib/workbench/wb-actions.ts`) henter i dag `take: 60` sortert på navn. Søket må gå mot hele banken (serverside). Ferdig når en øvelse som ligger etter de 60 første kan søkes fram, låst med test.
3. **Mest brukt først:** telling av `WorkbenchDrill` per `exerciseId` for spilleren (finnes ikke i koden i dag; `bruktSiste30()` i `src/lib/portal-drills/ovelser-data.ts` teller den gamle `TrainingDrillV2`). Ferdig når standardlista er sortert etter antall, låst med test.
4. **«Ny øvelse» lagres i banken:** skjemaet (`src/components/workbench/OvelseSkjema.tsx`) oppretter en `ExerciseDefinition` (spiller: `PLAYER`/`PRIVATE` synlig for coach; coach: `COACH_PLAYERS`) og legger den i økta med `exerciseId`. Ferdig når øvelsen finnes i Øvelsesbanken etterpå.
5. **Lenke «Hele øvelsesbanken»** i spillerens og coachens Workbench. Coachen får samme bank-side som spilleren, i AgencyOS-skallet. Ferdig når begge lenkene åpner banken med filtrene.
6. **PR med skjermbilder** i 390 og 1280 px og full `npm run verify`. Ikke merge før Anders skriver «merge».

## PRØVEUKE FØR FØRSTE TREKK, CLAUDE SKRIVER HJELPEARTIKLENE, ANBEFALINGENE I PAKKE 14–17 OG AGENCYOS-RESTEN GJELDER (Anders 16.10.2026, bindende)

Svar på «Åpent hos Anders» i `meg-resten.html`, `hjelp.html`, `utfordringer.html`, `plan-hjelpere.html` (PlayerHQ pakke 14–17, PR #1370) og `utkast-agencyos/resten.html` (AgencyOS pakke 11, #1372): «dine anbefalinger», «Hjelpeartiklene … skal du lage», «Nei, prøveuke».

- **Prøveuke:** første gang en spiller velger Full, får hen én uke Full før første trekk (kort kreves, som i BUSINESS-RULES §Abonnement). Ingen «30 dagers angrerett» i skjermtekst.
- **Claude skriver hjelpeartiklene.** Utkast: `docs/design-system/utkast-playerhq/hjelpeartikler.md` (16 artikler). «Slik bytter du coach» og «Be om videoanalyse» tas ut, fordi funksjonene ikke finnes.
- **Anbefalingene gjelder:**
  - Hjelp: «Send anonymt» fjernes · kontakt og tilbakemelding blir ett skjema, «Skriv til oss» · avkrysningen «Tillat at support ser profilen min» fjernes · én adresse, post@akgolf.no · ingen svartid lovet.
  - Meg: tofaktor-reservekodene fjernes til de lagres · dokumenter sendes til Stripe-portalen (kvitteringer) og Hjelp (vilkår) · ordet er «kvittering», ikke «faktura».
  - Utfordringer: «Opprett utfordring» er grafitt; rust bare i «Avslutt utfordringen» · coach velger deltakere fra gruppene og stallen, spiller bare fra gruppene.
  - Plan: «Neste turnering» er Norgescup 1 (neste offisielle), og Klubbmesterskap innendørs er en økt, ikke en turnering · spilleren foreslår prioritet A/B/C, coachen kan endre · «Perioden er ferdig» vises for alle perioder · fri fysisk økt lages med hurtigknappen «Ny økt».
  - AgencyOS: normer fra Data Golf venter til A–K-nivåtallene er vedtatt (siden sendes til AG-15 › Normer) · eksterne lesere ser bare det spilleren har delt · bare head coach inviterer coach.
- **Uavklart:** markedsføringssiden i AgencyOS (`/admin/marketing`, innholdskalender for sosiale medier). Anders spurte hva den er; svaret er gitt, beslutningen gjenstår.

**Overstyrer:** «30 dagers angrerett» i `oppgrader-flyt-wizard.tsx`, og «Klubbmesterskap innendørs» som neste turnering i `plan.html` (pakke 3, godkjent 14.10).

**Arbeidet dette utløser:**

1. **Hjelpeartiklene inn i appen** når pakke 15 bygges: `src/app/portal/meg/help/data.ts` får de 16 artiklene. Hver artikkel publiseres først når det den beskriver, virker (lista øverst i `hjelpeartikler.md`). Ferdig når ingen artikkel viser «ikke skrevet ferdig».
2. **Prøveuke i teksten:** Velg Full (pakke 14) og Gratis og Full-artikkelen sier én uke. Ferdig når et søk etter «angrerett» i `src/` gir 0 treff i skjermtekst.
3. **Plan rettes ved portering av pakke 3:** neste turnering fra `Tournament` (offisielle), ikke interne konkurranser.
4. **Resten** bygges med pakkene, etter fila for hver pakke.

## VENNER SKJULES TIL NESTE VERSJON, UTFORDRINGER SENDES BARE TIL GRUPPA (Anders 16.10.2026, bindende)

Svar på punkt 3 i §DEL RUNDE FINNES VED LANSERING, stilt før pakke 16 Utfordringer ble tegnet: «Skjul venner, bare gruppa».

- **`/portal/venner` og `/portal/venner/[spillerId]` skjules ved lansering.** Venner tegnes og bygges i neste versjon, med invitasjon, følging og feed.
- **Deltakere i en utfordring velges bare blant medlemmene i gruppene spilleren selv er med i** (`GroupMember`, `endedAt: null`). En coach velger i tillegg fra stallen sin.
- Ingen delbar lenke, som før. Bare valgte deltakere kan åpne og bli med.

**Overstyrer:** «Deltakere velges fra venner og gruppa» i §UTFORDRINGER SKAL LEVE (22.09), for venner. Punkt 3 i §DEL RUNDE FINNES VED LANSERING er avklart for venner-sidene og utfordringene.

**Arbeidet dette utløser:**

1. **Skjul venner:** `/portal/venner` og `/portal/venner/[spillerId]` sender videre til `/portal/meg`, og ingen meny eller lenke viser dem. Ferdig når et søk etter `/portal/venner` i `src/` bare treffer videresendingen.
2. **Deltakere bare fra gruppa:** `hentGyldigeDeltakerIder` (`src/app/portal/(legacy)/utfordringer/actions.ts`) og `PH24dNy` slutter å hente `Friendship`. Ferdig når en test låser at en venn utenfor gruppene avvises.
3. **Tilgang til én utfordring:** `/portal/utfordringer/[id]` og `bliMed` slipper bare inn eier og valgte deltakere (i dag kan alle innloggede åpne og bli med). Ferdig når en test låser at en annen spiller avvises.
4. **Tegning:** pakke 16, `docs/design-system/utkast-playerhq/utfordringer.html` (utkast 1, 16.10). Port 7 gjenstår.

## MARKEDSFØRINGSSIDEN I AGENCYOS FJERNES (Anders 16.10.2026, bindende)

Svar på det uavklarte punktet etter AgencyOS pakke 11 (`docs/design-system/utkast-agencyos/resten.html`): «Fjern markedsføringssiden i AgencyOS.»

- **`/admin/marketing` (innholdskalender og post-kø for sosiale medier) fjernes.** Adressen sender til `/admin/oppsett`.
- **Fanen «Markedsføring» i Oppsett (AG-23) og søkeoppføringen «Marketing» fjernes.**
- Tabellen `MarketingPost` blir stående; ingen data slettes.

**Overstyrer:** markedsføringsfanen i AG-23 og «Markedsføring og hjelp» i `mer.html`.

**Arbeidet dette utløser:**

1. **Kode:** videresending, fane og søk fjernet, og den døde koden (`AdminMarketingTrainLock`, `AdminMarketingV2`, `src/lib/admin-marketing/`) slettet. Gjort i samme PR.
2. **Utkastet `mer.html`** (AgencyOS pakke 7): fanen «Markedsføring og hjelp» i Oppsett blir «Hjelp» når pakken rettes neste gang.

## WANG-TRENERFLATEN FØLGER STILEN PÅ WANG.NO (Anders 16.10.2026, bindende)

Anders 16.10 etter utkast 2: «WANG må litt nærmere stilen som er på www.wang.no», og etter justeringen: «Ja, WANG-stilen er riktig nå.» Gjelder trenerflaten i `/team-wang` (Trener og Sportssjef); fellessiden `/team-wang` er uendret.

- **Firkantede hjørner overalt.** Bare avatarer og statusprikker er runde.
- **Hovedknappen er vinrød `#AE0034`** med store bokstaver i Montserrat. Sekundærknapp har vinrød kant. I lister med flere saker har bare den mest akutte fylt knapp.
- **Brødtekst i Quattrocento (serif)**, overskrifter i Montserrat, sidetittel vinrød. Bakgrunn `#FCFAFA`, tekst `#222` og `#444`.
- **Helteflaten har wang.nos gradient** `#17446F` → `#2E857D` med store tall i lettere vekt. «Les mer →»-lenker i rosa tekstfarge `#A81F49`.
- Aksefargene (14.10) og statusfargene (mint, gul, rosa, grå) er uendret. Fasit: `docs/design-system/utkast-wang/felles/wang.css` §Nærmere wang.no og README samme sted.

**Overstyrer:** «navy er handling» og 14 px kort / 10 px knapper i §Nærmere AgencyOS (15.10) i `docs/design-system/utkast-wang/README.md` (rettet i samme PR).

**Arbeidet dette utløser:**

1. **Port 7 per pakke:** stilen er godkjent, men hver pakke (2–8 og 10) i utkast 2 venter fortsatt på Anders' ja. Ferdig når README-tabellen har «Godkjent» per pakke.
2. **Tokens i koden når pakkene porteres:** `src/styles/wang-app.css` har `--wg-r-kort: 14px`, `--wg-r-knapp: 10px` og `.wg-btn-primary` i navy; `src/styles/wang-tokens.css` har `--radius-card: 26px` og ingen vinrød. Hjørner til 0, `--wang-vinrod: #AE0034` som primærknapp, bakgrunn `#FCFAFA`. Ferdig når trenerflaten i 390 og 1280 ser ut som utkastet, og fellessiden `/team-wang` er urørt.
3. **Brødtekst i Quattrocento:** `src/app/team-wang/layout.tsx` laster `Quattrocento_Sans`. Legg til `Quattrocento` (serif) for brødtekst i trenerflaten. Ferdig når skjermkontrollen viser Quattrocento i `/team-wang/coach`.

## MER I AGENCYOS FÅR ET SJETTE PUNKT: DATA GOLF (Anders 16.10.2026, bindende)

Svar på punkt 1 i `docs/design-system/datagolf-coach-datakart-og-skjermliste.md` §Åpent hos Anders: «mer meny skal ha et punkt til».

- ~~**Mer har seks punkter:** Booking · Grupper · Tester · Økonomi · Oppsett · Data Golf.~~ Overstyrt 16.10: Data Golf står i Drift (§AGENCYOS-MENYEN BLIR VARIANT C).
- Data Golf (DG-01 Oversikt) vises bare for dem `kanSeDataGolf` slipper inn (§DATA GOLF VISES ALDRI TIL KUNDER).
- Inngangene fra Spiller 360 › Stats og Workbench-øvelsen «Fra Data Golf» beholdes i tillegg.

**Overstyrer:** «Mer har fem punkter» i §SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8 (28.09).

**Arbeidet dette utløser:**

1. **Datakartet** sier at punktet er avgjort. Gjort i samme PR.
2. ~~**Mer-menyen i koden** får «Data Golf» som sjette punkt~~ Erstattet av punkt 4 i §AGENCYOS-MENYEN BLIR VARIANT C; når AgencyOS pakke 10 porteres. Ferdig når punktet står i Mer,
   åpner DG-01, og ikke vises for en bruker uten coach-rolle, låst med test.

## DATA GOLF VISES ALDRI TIL KUNDER, BARE TIL COACHER I AK GOLF, WANG TOPPIDRETT OG TEAM NORWAY (Anders 16.10.2026, bindende)

Svar på punkt 2 (lisens) i `docs/design-system/datagolf-coach-datakart-og-skjermliste.md` §Åpent hos Anders:
«nei ikke til kunder, men kun coacher i team norway og wang toppidrett».

- **Data Golf-tall vises aldri til kunder:** ikke spillere, foreldre, uinnloggede eller markedssidene.
- ~~**Coacher ser dem:** AK Golf-coacher i AgencyOS, og trenerne i WANG Toppidrett og Team Norway.~~ Overstyrt 20.10: bare ADMIN (§DATA GOLF ER ANDERS' PRIVATE VERKTØY).
- Uendret: «Powered by Data Golf» der tallene vises, og ingen eksport (DG-09).

**Arbeidet dette utløser:**

1. **Datakartet** sier at lisensen er avklart for coacher. Gjort i samme PR.
2. **WANG- og TN-utkastene for Data Golf (DG-01–09) kan bygges** etter AgencyOS, når Anders har sett dem (port 7).
   Ferdig når skjermene ligger under `/team-wang` og `/team-norway` bak `kanSeDataGolf`, og en spiller avvises, låst med test.

## COACH SOM AVLYSER GIR ALLTID FULL REFUSJON ELLER KLIPPET TILBAKE (Anders 15.10.2026, bindende)

Svar på utkast-PR #1010 (kalender og booking), som Anders sa ja til 15.10.

- **Avlyser coachen en booking, får kunden alltid alt tilbake**, uansett hvor nær timen er: hele beløpet i Stripe
  (AK Golf dekker gebyret) eller klippet tilbake til pakken. 24-timersfristen gjelder bare spillerens egen avbestilling.
  `cancelOutcome` (`src/lib/booking/policy.ts`) gjør dette allerede for staff; det som mangler, er knappen i AgencyOS.
- **Betalingsmåte på booking:** Stripe · Klipp · Faktura · Gratis. Faktura er bare et merke; fakturaen lages i Tripletex av Anders.
- **Coach foreslår ny tid** på en booket time. Tiden endres først når spilleren godtar i PlayerHQ. Spilleren flytter
  fortsatt selv innenfor coachens tilgjengelighet (§SPILLEREN FLYTTER TIMEN SELV, 14.10).
- **Avvisning med begrunnelse blir et utkast i Innboks.** Ingenting sendes automatisk; coachen sender selv.

**Arbeidet dette utløser:**

1. **Tre tillegg i basen**, additivt via `db execute` (gotchas §Database): `bookings."paymentMethod"`
   (`BookingPaymentMethod`), `bookings."proposedStartAt"`/`"proposedEndAt"`/`"proposedAt"`/`"proposedById"` og
   `innboks_epost."bookingId"`. Skriptet `scripts/add-booking-betaling-flytting-utkast-2026-09-29.ts` fra #1010.
   Ferdig når Anders har kjørt det og feltene finnes. Koden som leser feltene legges ikke inn før det.
2. **Avlys i AG-06 Booking** (`src/components/admin/precision/AG06Booking.tsx`): ny handling som avlyser, refunderer
   eller fører klippet tilbake i én transaksjon, med varig refusjonsjobb ved Stripe-feil. Ferdig når en test låser full
   refusjon under 24 timer for coach.
3. **Betalingsmåte i coachens booking** (`bookIKalender`, `src/app/admin/kalender/booking-actions.ts`): Klipp trekker
   ett klipp atomisk, Faktura og Gratis merkes.
4. **Flytteforslag:** coach foreslår i AG-05 Kalender, spilleren godtar eller avslår i PlayerHQ-bookingen.
5. **Avvis med utkast i Innboks**, og GDPR-anonymisering vasker utkastene (`src/lib/gdpr/anonymiser-bruker.ts`).
## INNLOGGING BARE MED GOOGLE OG PASSORD, BETALING BARE MED KORT OG APPLE PAY (Anders 15.10.2026, bindende)

Anders 15.10, etter utkastene til innlogging og offentlig booking: «Kun innlogging med Google og passord. Betaling via kortbetaling og Apple Pay».

- **Innlogging:** Google eller e-post og passord. **Ingen BankID.**
- **Betaling:** kort og Apple Pay, gjennom Stripe. **Ingen Vipps og ingen faktura.**
- Gjelder alle flater: PlayerHQ, AgencyOS, forelder, offentlig booking og markedssidene.

**Overstyrer:** BankID-plassholderen i AU-01 og «Stripe, Vipps» i BK-02 (`docs/design-handoff/regler/skjermliste.md`, rettet), og spørsmålet om innlogging og betaling i punkt 10 (1i) under §KODEGJENNOMGANGEN 06.10.

Design er rettet i samme PR: `docs/design-system/utkast-flater/innlogging.html` og `booking.html`.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **BankID ut av koden:** `src/app/auth/bankid/page.tsx` og `src/components/portal/v2/BankIDV2.tsx` fjernes, lenken i `src/components/portal/v2/LoginV2.tsx:545` tas bort, og `/auth/bankid` sender til `/auth/login`. Ferdig når ingen side lenker til BankID og adressen sender videre.
2. **Vipps og faktura ut av forelderoppstarten:** `src/app/auth/onboarding/forelder/forelder-wizard.tsx` har i dag `VIPPS` (forhåndsvalgt og «anbefalt») og `FAKTURA`. Bare kort står igjen, betalt gjennom Stripe. Sjekk at `saveForelderOnboardingStep` ikke lagrer andre verdier. Ferdig når valget ikke finnes og en test låser det.
3. **Teksten om Vipps:** `src/app/portal/meg/help/data.ts:83`, `src/app/portal/meg/help/kategori/[slug]/page.tsx:159` («betale med Vipps eller kort») og `src/components/marketing/booking/BookingPrecisionFlow.tsx:460` («Sikker betaling med Stripe eller Vipps») sier «kort eller Apple Pay». Ferdig når et søk etter «Vipps» i `src/` gir 0 treff i skjermtekst.
4. **Apple Pay i Stripe (Anders):** Stripe Checkout (`src/lib/booking/payment-start.ts`, `src/app/api/stripe/checkout/route.ts`) setter ikke betalingsmåter selv, så Apple Pay vises når det er slått på i Stripe og domenet er bekreftet. Anders slår på Apple Pay og bekrefter domenet i Stripe. Ferdig når Apple Pay vises i Checkout på en iPhone, verifisert sist sammen med Stripe-live (§Produkt og tilgang).

## SPILLERPROFILEN HETER IUP I TEAM NORWAY (Anders 15.10.2026, bindende)

Anders 15.10: «For Team Norway skjerm skal det hete IUP som spiller profil.»

- **Under `/team-norway/*` heter spillerprofilen «IUP».** Menyvalg, tilbakelenker og overskrifter sier IUP, ikke «Profil» eller spillerens navn alene.
- Fanen som i koden heter «Evaluering», heter **«Fireukerssjekk»**, fordi hele profilen nå er IUP-en.
- Gjelder Team Norway. Spiller 360 i AgencyOS og WANG er ikke endret av dette.

**Arbeidet dette utløser:** når TN-skjermene porteres, får `/team-norway/spiller/[spillerId]` tittelen IUP og fanene i
`TnSpillerFaner` (`src/components/team-norway/tn-shell.tsx`) bytter «Evaluering» til «Fireukerssjekk». Utkastene i
`docs/design-system/utkast-tn/spillere.html` og `gruppe.html` er rettet (utkast 2).

## TEAM NORWAY FÅR EGNE AKSEFARGER FRA TN-PALETTEN (Anders 14.10.2026, bindende)

Anders 14.10: «Ja til aksefargene», etter grunnmuren for Team Norway (PR #1256, `docs/design-system/utkast-tn/grunnmur.html`).

- **Under `/team-norway/*` har aksene egne farger:** FYS `#0D6E6A` · TEK `#0A5199` · SLAG `#4B3F9E` · SPILL `#8A2A72` · TURN `#A80126`.
  Lyse varianter på navy: `#6FD3C9` · `#8DBDF0` · `#B9B0F2` · `#EBA3D8` · `#FF9CB0`. Alle målt over 4,5 : 1.
- **Ingen AK Golf-farger i Team Norway**, heller ikke i pyramiden. Logorøden `#D70232` er aldri akse.
- **TURN blir i mørk rød**, ikke navy. Statusrød vises alltid med ordet ved seg.

**Arbeidet dette utløser:**

1. **Trenerskjermene tegnes** pakke for pakke etter `docs/design-system/utkast-tn/README.md` (pakke 2–8), én PR per pakke.
2. **Kode når skjermene porteres:** `--tn-akse-*` i `src/styles/team-norway-tokens.css` og speil i `src/lib/v2/team-norway.ts`.
   Ferdig når pyramiden under `/team-norway/*` vises i disse fargene og ingen TN-fil bruker AK-aksefargene.

## SPILLERENS WORKBENCH FÅR NIVÅENE, COACHEN BEHOLDER DE FIRE FLATENE (Anders 14.10.2026, bindende)

Svar på avklaringen i `docs/planer/portering-godkjente-skjermer-2026-10-14.md`: «Spilleren får nivåene
År · Periode · Måned · Uke · Målsetninger fra det godkjente designet i stedet for de fire flatene.
Coachen beholder de fire flatene.»

- **PlayerHQ:** Workbench (`/portal/planlegge/workbench`) har nivåene År · Periode · Måned · Uke ·
  Målsetninger, tegnet etter pakke 3 (`docs/design-system/utkast-playerhq/plan.html`, godkjent 14.10).
- **AgencyOS:** coachens Workbench (`/admin/workbench/[playerId]`) beholder Sesongkart · Ukeverksted ·
  Trenerbord · Stats (`WorkbenchSamlet`).
- Ingen funksjon forsvinner for spilleren: det de fire flatene gir i dag, skal finnes i et nivå eller i
  Plan, Stats eller Meg.

**Overstyrer:** «Workbench beholder de fire visningene fra 02.10» i §KODEGJENNOMGANGEN 06.10, for spilleren.

**Arbeidet dette utløser** (steg i porteringsplanen):

1. **År:** `PH11Aarsplan` (#1255). Ferdig når `?niva=ar` viser den og Anders har sett den (port 7).
2. **Periode og periodeskjema** (steg 3), **måned og månedsskjema** (steg 4), **opprett årsplan** (steg 5):
   nye komponenter i `src/components/portal/precision/`, koblet i `src/app/portal/planlegge/workbench/page.tsx`.
3. **Uke og Gjenta** (steg 6): spilleren slutter å bruke `WorkbenchSamlet`. `brukSamletWorkbench`
   (`src/lib/workbench/samlet-url.ts`) gjelder da bare coach. Ferdig når ingen `/portal`-adresse viser
   `WorkbenchSamlet`, og gamle `flate=`-lenker for spilleren sender til riktig nivå, låst med test.
4. **Målsetninger og IUP-måltall** (steg 7).
5. **Mer-registeret** (`samletMerRegister`, 18 innganger) og «Trenerbord»/«Stats» for spilleren: hver inngang
   får et sted i nivåene eller i Plan, Stats eller Meg før steg 6 legges inn. Ferdig når lista er gått
   gjennom og ingen inngang mangler.

## AKGOLF.NO FLYTTES IKKE FØR HELE NETTSIDEN ER GODKJENT (Anders 15.10.2026, bindende)

Anders 15.10, etter revisjonen av markedssidene: «ikke flytt domene før siden er godkjent.» Svar på
planen for akgolf.no som animert reise, der domeneflytting sto som steg 1.

- **akgolf.no peker i dag til Acuity** (`akgolfgroup.as.me`) og er ikke koblet til Vercel-prosjektet
  `akgolf-hq`. Det forblir slik til hele nettsiden er godkjent.
- **Godkjent betyr:** Anders har sett alle markedssidene på `akgolf-hq.vercel.app` i mobil og
  desktop (port 7) og sagt ja til helheten, og bookingen er røyktestet med én ekte betaling.
- **Alt arbeid med den nye markedssiden bygges og vises på `akgolf-hq.vercel.app`.** Ingen
  omdirigering, DNS- eller domeneendring underveis.

**Overstyrer:** steg 1 i første utkast av `docs/planer/akgolf-no-nettsted-reise-plan-2026-10-15.md`
(rettet i samme PR; domenet er nå steg 10).

**Arbeidet dette utløser:**

1. **Planen følges i rekkefølgen 1–10** i `docs/planer/akgolf-no-nettsted-reise-plan-2026-10-15.md`:
   utkast 2 med reisen → bevegelsesgrunnmur → forsiden → undersidene → innhold → kontroll →
   godkjenning → røyktest → domene. Ferdig når hvert steg har Anders' ja der planen krever det.
2. **Bookingsystemet er komplett i AgencyOS før lansering** (Anders 15.10: «komplett booking system
   og alle funksjoner … må være fungerende i AgencyOS før vi lanserer. Lag en kopi av Acuity
   funksjoner om vi enda ikke har dette»). Gap mot Acuity og ti steg står i
   `docs/planer/booking-komplett-agencyos-plan-2026-10-15.md`. Ferdig når coachen gjør alt uten gamle
   sider eller Acuity, gjesten kan endre og avbestille fra e-postlenke, duo og gavekort kan bookes,
   og én ekte betaling av hver type er røyktestet. **Planen er godkjent 15.10** med disse valgene:
   duo betales av én person (som i Acuity: 1 700 og 2 700 kr) · gavekort gjelder alle tjenester og
   alle coacher, verdi i kroner · no-show belastes etter 24-timersregelen, coach kan overstyre og
   refundere · SMS utsettes til etter lansering. Steg 1 bygges i `claude/booking-avlys-flytt`;
   steg 2 (tjenester i AgencyOS) starter 15.10.
3. **Domeneflytting (steg 10)** gjøres først når punkt 2 og nettstedsplanens steg 8 er dokumentert. Ferdig når
   `curl -I https://akgolf.no` gir 200 fra appen, ikke 307 til Acuity, og Acuity-lenkene er
   borte fra nettsiden.
4. **Uavklart:** hvor omdirigeringen fra akgolf.no til Acuity faktisk ligger (ikke i `vercel.json`,
   `next.config.ts` eller `proxy.ts`; svaret kommer fra Vercel, men domenet står ikke på
   `akgolf-hq`). Må finnes før steg 10.

## SPILLEREN FLYTTER TIMEN SELV, INNENFOR COACHENS TILGJENGELIGHET (Anders 14.10.2026, bindende)

Svar på spørsmålet etter utkast 1 av pakke 7 Kommunikasjon (PH-23): «Spiller skal kunne booke om timen sin om det er ledig i bookingsystemet. Men det er kun innenfor tilgjengeligheten som er satt hos coach.»

- **Spilleren flytter en booket time selv** til en ledig tid. Det er ingen forespørsel som coachen må godkjenne.
- **Bare tider innenfor coachens tilgjengelighet** vises og kan velges.
- Coachen får beskjed om den nye tiden. Flytting trekker ikke klipp.

Krever ingen kodeendring, fordi koden gjør dette allerede: `rescheduleBooking` (`src/app/portal/meg/bookinger/actions.ts`) sjekker at tiden er ledig og innenfor coachens tilgjengelighet (`isSlotStillAvailable`). Den krever i tillegg mer enn 24 timer til opprinnelig start (`rescheduleOutcome`), samme frist som gratis avbestilling. Utkastet `docs/design-system/utkast-playerhq/kommunikasjon.html` er tegnet slik.

## PEI-TESTER FØRES MED CARRY OG SIDE, 8-BALL MED METER FRA HULLET OG 5 POENG I HULL, TREFF HETER GODKJENT (Anders 14.10.2026, bindende)

Anders 14.10, etter utkast 1 av pakke 6 Stats i dybden (`docs/design-system/utkast-playerhq/stats-dybde.html`, PR #1251).

- **8-ball føres med meter fra hullet**, for eksempel 2,4, og «I hull» når ballen går i på ett slag. Ingen høyre eller
  venstre (Anders 14.10, kommentar på utkastet: «Kun PEI på hvor langt unna hullet i avstand»). Feltet godtar alltid både
  komma og punktum («2,4» og «2.4»). Appen regner PEI = meter fra hullet / slaglengde, og poeng.
- **8-ball-poeng:** i hull på ett slag 5 · innenfor 1 m 3 · innenfor 2 m 2 · innenfor 3 m 1 · lenger unna 0.
- **Alle PEI-tester føres med carry og side.** Appen regner selv ut avstand fra hullet og feilprosenten
  (PEI = avstand fra hullet / slaglengde). Eksempel: riktig lengde, 5 m til høyre, gir 5 m fra hullet.
- **Tester med treff eller ikke føres som «Godkjent» eller «Bom»**, og resultatet heter «X / 9 godkjent».

**Overstyrer:** 8-ball-skalaen (under 0,1 m = 4 · 0,1–0,99 = 3 · 1–1,99 = 2 · 2–2,99 = 1 · 3 m+ = 0) i
§Åpne punkter etter runde 19–26, og «Treff eller Bom» / «X / 9 treff» for Wedge Gate (skjermlista PH-15 og
§ØKONOMI BARE FOR HEAD COACH).

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **8-ball i koden:** `POENG_8BALL` (`src/lib/domain/pei/poeng-tabeller.ts`) får den nye skalaen med 5 for i hull.
   `attBall` (`src/lib/domain/pei/protokoll-definisjoner.ts`) beholder «Resultat, meter fra hull», og legger til «I hull».
   Tallfeltet godtar komma og punktum. Ferdig når en test låser 5 / 3 / 2 / 1 / 0, at «2,4» og «2.4» gir samme resultat, og PEI = meter / slaglengde.
   Lagrede 8-ball-resultater med gammel skala beholdes og merkes med regelversjon.
2. **PEI-testene** (`pei-*` i `src/lib/portal-tester/tn-catalog.ts`) bruker allerede carry og side; kontroller at
   alle viser avstand fra hullet og PEI rett etter hvert slag.
3. **Ordet «Godkjent»** i stedet for «Treff» / «Ja» i gate-testene (`tn-catalog.ts`, `choice("ok", …)`) og
   skjermtekst. Ferdig når ingen gate-test viser «treff» som resultatord.
4. **Nærspill Gate og VISA Express føres også som godkjent eller bom** (Anders 14.10: «Ja»), ikke med poeng for hånd.
   Overstyrer «poeng føres for hånd per slag og appen summerer» (§Åpne punkter etter runde 19–26) og runde 29 i
   skjermlista PH-15. `tn-catalog.ts` får `kind: "gate"` med `choice("ok", …)` for begge. Ferdig når
   `tn-scoring.test.ts` låser «X / 9 godkjent» for begge.

## LIVE-ØKTENE ER ALLTID LYSE, INGEN MØRK MODUS (Anders 14.10.2026, bindende)

Anders 14.10 under pakke 2 Treningsøkten: «Fjern mørk modus på live øktene», og senere: «La alltid lyst tema».

- **Live-økt (PH-04 brief, PH-05 aktiv, PH-06 fysisk, PH-07 etter økten), Øktark (PH-03) og slagregistrering
  ute tegnes og bygges lyse** (slagregistrering bekreftet av Anders 14.10). Ingen nattvelger og ingen automatisk natt. Fasit er `docs/design-system/utkast-playerhq/treningsokt.html`
  (utkast 1, PR #1230; port 7 gjenstår).

**Overstyrer:** natt i Live-økt og slagregistrering ute i §PRECISION ATHLETICS punkt 4 (26.09) og i §Design under (21.09).

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Live-sidene i appen** bruker i dag `data-theme="night"`: `src/app/portal/(fullscreen)/live/[sessionId]/tapper/page.tsx:66`
   og `tapper-shell.tsx:265`, `.../live/[sessionId]/loading.tsx:6`, `.../summary/loading.tsx:6`,
   `.../summary/error.tsx:28`, og `src/app/admin/agencyos/live/[sessionId]/loading.tsx:9` (coachens Live-økt).
   Bytt til lyst. Ferdig når ingen av dem har `data-theme="night"` og skjermene er sett i 390 og desktop (port 7).
2. **Porteringen av PH-04 til PH-07** bygges lys fra første linje, etter utkastet i punkt over.
3. **Slagregistrering ute:** `src/components/portal/runde-logg/ShotEntryNumpad.tsx:90` bytter fra
   `data-theme="night"` til lyst. Ferdig når numpaden er lys i 390 og desktop (port 7).
4. **Natt-tokens kan fjernes** (`--night-*`, `.pa-root[data-theme="night"]` i `src/styles/precision-athletics.css`
   og `precision-komponenter.css`) når punkt 1 og 3 er gjort og ingen annen flate bruker dem.
   Team Norway-scorekortet bruker natt-bryteren sin (`src/app/portal/tren/tester/team-norway/scorecard.tsx:24`),
   så sjekk den først.
5. **Ikke berørt:** Team Norway-scorekortet har egen natt-bryter (`src/app/portal/tren/tester/team-norway/scorecard.tsx:24`).

## PLANNIVÅENE HENGER SAMMEN: EN ENDRING ETT STED OPPDATERER ALLE DE ANDRE (Anders 14.10.2026, bindende)

Anders 14.10: «Månedsplanen og ukeplaner er basert på periodiseringen i årsplanen. Når en endring gjøres
i enten årsplan, periodisering, månedsplan, ukeplan og øktplaner så må alle deler oppdateres.»
Bekreftet som beslutning samme dag, etter at pakke 3 Plan og Workbench (utkast 2) ble godkjent (port 7).

- **Kjeden er årsplan → periode → måned → uke → økt.** Måned og uke bygger på periodiseringen i årsplanen.
- **Nedover:** endres årsplanen, en periode eller en måned, får nivåene under nye timer per akse. Endringen
  gjelder fra og med inneværende uke. Uker som er gått, endres aldri; gjennomført tid står.
- **En uke måneden har tilpasset, beholder månedens tall** når perioden senere endres. Den merkes «Endret i måneden».
- **Oppover:** økter som legges inn, flyttes, gjentas eller slettes, teller med en gang i uka, måneden, perioden,
  årsplanen og Plan. Gjentatte økter teller i hver uke de ligger i.
- **Brukeren ser hva som ble oppdatert** når en endring lagres (f.eks. «8 uker, oktober og november og
  årsplanen er oppdatert»). Endrer spilleren noe coachen la inn, får coachen beskjed (§SKJERMENE … RUNDE 8).
- **Uka viser «lagt inn mot fordelt»**, der fordelt alltid kommer fra nivået over, aldri fra et fast tall.
  Forslag er fortsatt ikke sperrer (§Treningsfag): Workbench sier fra om avvik, men stopper ingenting.

Fasit for oppførselen er `docs/design-system/utkast-playerhq/plan.html` (`lagrePeriode`, månedsskjemaets
Lagre, `lagtInn`).

**Arbeidet dette utløser** (i dag henger nivåene ikke sammen i appen):

1. **Perioden fordeler timer per akse.** `PeriodBlock` har bare `weeklyVolMin`/`weeklyVolMax` og øktbudsjett
   (`weeklySessionBudget`), ikke minutter per akse. Additivt felt via `db execute` (gotchas §Database).
   Ferdig når en periode lagrer FYS · TEK · SLAG · SPILL · TURN per vanlig uke og per lett uke.
2. **Månedsplanen** (`MonthPlan`, punkt 3 i §Workbench over uka, 28.09) får timer per akse per uke, arvet fra
   perioden og overstyrbar per uke.
3. **Lagring av periode og måned skriver nedover** til `WeekPlan.plannedHours*` fra inneværende uke, uten å røre
   gåtte uker eller uker måneden har overstyrt. I dag oppdaterer ingen periodehandling (`periode-core.ts`,
   `gruppe-periode-actions.ts`) ukeplanene. Ferdig når en test låser at en endret periode gir nye timer i
   kommende uker og uendrede tall i gåtte uker.
4. **Gruppas årsplan** følger samme kjede: endres gruppeperioden, oppdateres medlemmenes arvede perioder og
   uker, men ikke det spilleren har merket «Egen».
5. **Én sum oppover:** uke, måned, periode, årsplan, Plan og I dag leser lagt inn og gjennomført fra
   `WorkbenchSession`, med samme regel som etterlevelse (§KARTLEGGINGSØKT FJERNES, punkt 4).
6. **Kvittering ved lagring** som lister nivåene som ble oppdatert, og beskjed til coach når spilleren endrer
   noe coachen la inn.

## FYLTE ØKTKORT, ØKTA ÅPNES MED ETT TRYKK, OG «OPP OG NED» BRUKES IKKE (Anders 14.10.2026, bindende)

Svar etter utkast 2 og 3 av I dag (PH-01), https://claude.ai/artifact/8qmhVSf3pQ5L5xUpKuKTmP.

- **Øktkort er fylte flater i aksefargen.** Anders 13.10: ja til fylte øktkort, bekreftet 14.10.
- **Øktkortet er en forhåndsvisning med nøkkelinfo:** akse, tid, navn, varighet, sted og antall
  øvelser. Trykk på kortet åpner hele økta med hvorfor, utstyr og alle øvelser.
- **Progresjonen står øverst på I dag** (målsetninger, prosessmål og uka), med snarvei til neste
  økt rett under tittelen.
- **«Opp og ned» og «opp-og-ned» brukes ikke i skjermtekst. Ordet er «up and down»** (Anders
  14.10). Står i masteren `docs/treningsplanlegging.md` §3. Tiger 5-regelen heter
  «Bom på enkel up and down».

**Overstyrer:** «Øktkort er nøytrale med aksefarget stripe på venstre kant» i §FARGE BETYR AKSE (26.09).

**Arbeidet dette utløser:** PH-01 tegnes etter utkast 3 i Precision (`7d7c2994`) og porteres når
Anders har godkjent den (port 7). «opp-og-ned» er rettet i `hjelpetekster.ts` og to
toppidrett-visninger. Den publiserte GFGK Junior-teksten (`src/app/gfgk-junior/_data/`) venter til
Anders sier fra, som for periodenavnene.

## TRENERE I AK-GRUPPER SKRIVER I MEDLEMMENES PLAN (Anders 14.10.2026, bindende)

Svar på spørsmålet etter PR 1a (#1206): «Trenere i AK-grupper (GFGK) mister skriverett i spillerens plan — riktig?» Anders: «Feil.»

- **COACH-medlem i en AK-gruppe (GFGK, Academy, Junior Academy) kan skrive i medlemmenes plan.** Regelen gjelder bare gruppetyper utenfor WANG og Team Norway.
- **WANG- og Team Norway-trenere er uendret:** de leser bare det spilleren har delt og sender forslag (§KODEGJENNOMGANGEN 06.10).
- **Assistent-medlemskap gir fortsatt bare lesing.** Uavklart: skal Assist Coach i en AK-gruppe også skrive? Spørres Anders om.
- **Overstyrer:** D-25 («trener-medlemskap gir aldri skriverett») for AK-grupper, og punkt 1 i §KODEGJENNOMGANGEN 06.10.

**Arbeidet dette utløser:** `coachSkrivbarPlayerWhere` (`src/lib/auth/coached.ts`) har en tredje gren, låst i `coached.test.ts` og `coach-tilgang-org.test.ts`. Uavklart: `canWriteMemberPlans` (`src/lib/workbench/group-scope.ts`) lar fortsatt bare gruppeeieren rulle ut i medlemmenes planer; vurderes når Anders har svart på spørsmålet om gruppeplanen.

**Gjenstår (14.10):** spør Anders (1) om Assist Coach i en AK-gruppe også skal skrive i medlemmenes plan, og (2) om COACH-medlem skal kunne rulle ut gruppeplanen i medlemmenes egne planer (`canWriteMemberPlans`).

## ORDBOKA DEKKER HELE AK GOLF HQ, AVVIKENE VENTER PÅ ANDERS (14.10.2026, bestilt)

Bestilling 14.10: `docs/treningsplanlegging.md` er masteren for alle ord i hele appen, ikke bare trening. §22–§28 og MASTER-STATUS er lagt til (PR #1227).

**Arbeidet dette utløser:**

1. **Anders tar valgene V1–V18** og de fire mindre valgene i `docs/ordbok-avvik-2026-10-14.md`. Ferdig når hvert valg har svar og masteren er rettet etter dem.
2. **Retting i koden** av A1–A32, i små PR-er per flate etter Anders' ja. Publisert tekst (marked, GFGK Junior) rettes bare med eget ja.
3. **Faktafeil F1–F4:** fristen i forelder-e-posten (F1), Caddies instruks (F2), seed-e-postene (F3) og sitatfeltene på leaderboards (F4).
4. **Ikke kartlagt ennå:** e-postmalenes brødtekst, sidetitler og metadata, Stripe-portalen, push-varsler og `hjelpetekster.ts` mot §2.3.

## KODEGJENNOMGANGEN 06.10: TRENERE FORESLÅR, FORELDER GODKJENNER INNEN SJU DAGER, DATA GOLF BARE FOR COACHER (Anders 06.10.2026, bindende)

Svar på funnene og spørsmålene i `docs/review/kodegjennomgang-2026-10-06.md` (grenen `review/kodegjennomgang`).

- **WANG- og Team Norway-trenere kan bare anbefale endringer.** De ser bare det spilleren har delt,
  og skriver aldri direkte i spillerens plan. Gruppemedlemskap alene gir verken innsyn eller skriverett.
  Endringer går som forslag spilleren godtar eller avviser (`lagTrenerforslag`).
- **Coachvideo, AI-samtaler og andre spillerdata krever eiersjekk.** En coach når bare egne spillere.
  En bruker når bare egne samtaler.
- **Under 16 år: forelder må godkjenne innen sju dager etter at kontoen er opprettet.** Barnet kan
  bruke appen fullt ut de sju dagene. Er forelder ikke godkjent innen da, låses kontoen til
  godkjenningen kommer. Deling og opptak er alltid sperret til forelder har godkjent. Fødselsdato
  kreves for spillere og kan ikke skrives om av spilleren selv.
- ~~**Data Golf er bare for coacher**: alle med coach-rollen, også WANG- og Team Norway-trenere, og
  ADMIN.~~ Overstyrt 20.10: bare ADMIN (§DATA GOLF ER ANDERS' PRIVATE VERKTØY). Spillere ser det aldri, heller ikke Talent-profilen. `/stats/pga` og annen Data Golf-visning
  flyttes bak innlogging for coacher; det åpne søket viser ikke Data Golf-tall.
- **Forelderens innsyn fortsetter etter 16 år**, til spilleren selv fjerner forelderen.
- **Gamle filer som ingen levende kode bruker, slettes** (432 filer, liste i
  `docs/review/vedlegg/doedkode-filliste.txt`), i små samlede endringer på høyst 20 filer.
- **Coachens Workbench beholder de fire visningene fra 02.10** (Sesongkart · Ukeverksted · Trenerbord · Stats).
  Detaljene fra nivåtegningene (Gjenta-arket, «Egen»-merket, øktarket, periode- og månedsskjema)
  tegnes inn i dem. Svar på M1 i Workbench-beskrivelsen. Spilleren får nivåene i stedet
  (§SPILLERENS WORKBENCH FÅR NIVÅENE, 14.10).
- **Tilgangsreglene kan endres i fase 2** av kodegjennomgangen, etter planen i dokumentet.

**Overstyrer:** «DataGolf vises aldri for andre enn Anders» i §PIPELINES ER ENESTE KILDE og D-19
(«bare analytiker»), «DataGolf-sammenligning» i Talent-profilen (BUSINESS-RULES §TALENT),
«Powered by Data Golf på alle offentlige statistikkflater» under §Data, den automatiske
gruppetilgangen for trenermedlemmer i `src/lib/auth/coached.ts` (G5, tredje gren), og
nivåtegningene som Workbench-ramme i `docs/workbench-handover.md` og handoff 04.10.

**Arbeidet dette utløser** (fase 2 i kodegjennomgangen, én PR per punkt, ingen legges inn uten Anders' ja):

1. **Org-trenere foreslår, skriver ikke** (PR 1a): `coachScopedPlayerWhere` og `editableGroupWhere`
   skiller AK-grupper fra WANG/TN-grupper; org-grupper krever `DelingsSamtykke` for innsyn og
   bruker forslag for endring. Testen `coached.test.ts:78` skrives om. Ferdig når en WANG-trener
   uten deling avvises i AgencyOS, låst med test (funn TO-01, TO-02, TO-04, TO-12).
2. **Eiersjekk** på AI-samtale (PR 1b, TA-01), coachvideo (PR 1c, TP-01), talenotat og slag
   (PR 1d, TP-06, TP-05).
3. **Sju dagers forelderfrist** (PR 1e): fødselsdato påkrevd for PLAYER, ikke redigerbar for
   spilleren, lås etter sju dager uten godkjent forelder, lydsamtykke for under 16 bare via forelder.
   Ferdig når en 13-åring uten godkjenning låses dag 8, og coach ikke kan registrere «SELV» for et barn
   (TA-03, TA-04, TP-02). Krever additivt felt eller bruk av `createdAt`; avklares i PR-en.
4. **Data Golf-port `kanSeDataGolf`** (PR 2): bare ADMIN fra 20.10 (#1450). Brukes på
   `/portal/analysere/datagolf*`, `/stats/pga*`, `/api/stats/search` og inngangene i Analyse og
   TN-menyen. Ferdig når en spiller og en uinnlogget avvises, låst med test (TO-07, TO-08, TA-06).
5. **Forelderinnsyn etter 16:** krever ingen kodeendring — bekrefter dagens tilstand (TA-08).
   Spilleren må kunne fjerne forelderen selv; finnes ikke den knappen, bygges den i PR 1g.
6. **Sletting av døde filer** (PR 5a–5v) etter lista i vedlegget.
7. **Workbench-dokumenter** for nivåene merkes utgått og slettes i PR 9b.

**Status 14.10.2026:** PR 1a (#1206, rettet av #1224), 1b, 1c, 1d, 1e (#1211), 1h (#1213), 2 (#1207) og 3c er lagt inn. Gjenstår, i denne rekkefølgen:

8. **Fødselsdato for eksisterende spillere** (punkt 3): nye spillere må fylle den inn i oppstarten. Spillere som har fullført oppstarten uten dato, er bare sperret fra deling og opptak. Anders 14.10: alle uten fødselsdato, også voksne, skal fylle den inn. Krever en enkel skjerm som spør om datoen før portalen åpnes (venter på designbrevet). Ferdig når en spiller uten dato sendes dit og slipper inn etter lagring, låst med test.
9. **Kjent gjeld i vaktskriptet:** TA-01 (`api/coach/ai-chat`) og TA-21 (`api/portal/swing-video/upload`) står fortsatt i `KJENT_GJELD` (`scripts/check-tilgang-vakt.mjs`), fordi skriptet ikke ser eiersjekken som vakt. Ferdig når begge er ute av lista og skriptet er grønt.
10. **Resten av fase 2:** 1f TN testdag, 1g småhull (TA-05, TA-07, TP-…), S5 IUP-kø uten spiller-ID, gruppe 3 (sesong, demotall, «—», dato, stille feil, netto, putt), 4 tester, 5 døde filer, 6 avhengigheter, 8, 9. 1i Google-innlogging og betaling: avgjort 15.10, se §INNLOGGING BARE MED GOOGLE OG PASSORD.
11. **Typesjekken i pre-commit går tom for minne** (4 GB) på Anders' maskin. Lagring krever i dag `NODE_OPTIONS=--max-old-space-size=8192`. Ferdig når hooken setter minnet selv eller sjekker bare endrede filer.
12. **Oppfølging fra #1207:** markedssidene lenker til `/stats/pga`; TN-arbeidsflate og rangliste mangler Data Golf-filter; `/stats/sammenlign-spillere` mangler barnevernsfilter.

## CLAUDE CODE PORTERER, IUP BARE FOR AKTIVE WANG-/TN-MEDLEMMER, BARE PH-01 ER GODKJENT (Anders 04.10.2026, bindende)

Bestilling 04.10 med design-handoff i `docs/design-handoff/` (porteringskø `regler/claude-code.md`).

- **Claude Code porterer** skjermene fra Precision Athletics til appen fra 04.10. Claude Design er fortsatt designkilde.
- **IA 28.09 gjelder.** AG-02 Kø, AG-17 Turneringer, AG-18 TrackMan og video og PH-26 Utenfor banen bygges ikke. Skjermlista i `docs/design-handoff/regler/skjermliste.md` er fasit for hva som finnes.
- **Bare PH-01 er visuelt godkjent.** Alt annet er kandidat til Anders har sett det i appen.
- **PH-IUP-01 Fireukerssjekk er godkjent for lansering** (Anders 04.10, etter skjermbilder 390 og 1280 px): «Det ser veldig kjedelig ut, men vi godkjenner.»
- **Lansering først, designløft etterpå** (Anders 04.10): skjermer som virker, godkjennes for lansering selv om uttrykket er nøkternt. Videre designutvikling skjer i bakgrunnen etter lansering, og endres når demospillere har testet noen uker.
- **IUP er et tillegg i PlayerHQ** (samme skall, ingen egen fane), og vises bare for spillere med PlayerHQ-profil som er aktive medlemmer i en WANG Toppidrett- eller Team Norway-gruppe. Ender medlemskapet, skjules IUP med en gang, også tidligere svar.
- **Trenerinnsyn uten ja fra spiller/forelder venter** (Anders 04.10: «Del opp»). Handoffen sier at gruppen får innsyn automatisk, men kravet om samtykke, og foresattes samtykke under 16, står til Anders har avklart det juridisk.
- **Regi per spiller i AgencyOS** (Privat · GFGK · WANG · Team Norway) bygges ikke før designet finnes.

**Overstyrer:** «Codex fullfører resterende prosjekt» i §CLAUDE DESIGN EIER DESIGNET, og at tidligere IUP-besvarelser gir inngang etter utmelding (`harEgenIupInngang`).

**Arbeidet dette utløser:** porteringskøen i `docs/design-handoff/regler/claude-code.md`, punkt 1–12. Juridisk avklaring av automatisk trenerinnsyn før `navngittTrenerHarTilgang` endres.

## LANSERING 05.10: SEKS AG-SKJERMER BEHOLDES, MARKEDSSIDENE FÅR PRECISION (Anders 04.10.2026, bindende)

Anders 04.10 kl. 23: «De skal med. Så tar vi det heller bort igjen.» Og bestilling om at PlayerHQ,
AgencyOS, markedssidene og innloggingen skal være lanseringsklare med riktig design 05.10.

- **AG-02 Kø, AG-17 Turneringer, AG-18 TrackMan og video, AG-21 Oppgaver, AG-22 Innsikt og talent
  og AG-24 Drift beholdes** som egne skjermer i Precision, selv om IA 28.09 sa at de utgår. De kan
  fjernes senere. PH-26 Utenfor banen er fortsatt utgått og sender til Meg.
- **Markedssidene får Precision Athletics** (Anders 04.10: «Bytt til Precision»). Det finnes ingen
  tegninger for dem, så de bygges med Precision-komponentene og blir kandidater til Anders har sett dem.
- **Lansering** betyr at hovedveiene virker og følger designet, og at ingen side krasjer, ruller sidelengs
  eller viser demodata. Port 7 (Anders har sett skjermen) gjøres fra morgenrapporten.
- IUP-køen (PH-IUP-02 og videre) kommer etter lanseringen.

**Overstyrer:** «Markedssidene venter» (23.09) under §PRECISION ATHLETICS, og «Utgår 28.09» for de
seks AG-skjermene i skjermlisten.

**Arbeidet dette utløser:** nattkjøring 04.–05.10 etter planen i økten: samle ferdige grener,
maskinsjekk av alle sider, rette røde funn med hovedveiene først, markedssidene til Precision,
prøvekjøring og morgenrapport.

## CLAUDE DESIGN EIER DESIGNET, CODEX EIER KODEN (Anders 30.09.2026, bindende)

Anders: «Claude Design er ansvarlig for design fra nå og Codex tar kode.» Anders ønsker at
Codex fullfører resterende prosjekt, og har i denne økten bestilt en plan for gjennomføringen.
Viderefører Precision Athletics og erstatter eldre omtale av Grok eller Claude Code som
kodeansvarlig. Ingen nye produkt-, skjema-, tilgangs- eller publiseringsvalg følger av rollebyttet.

**Arbeidet dette utløser:** [fullføringsplanen](../../docs/planer/codex-fullforing-claude-design-2026-09-30.md):
fersk kartlegging → felles grunnlag → komplett treningskjede → øvrige spillerverktøy →
booking/coaching → AgencyOS/AI → forelder/organisasjoner → sluttkontroll → autorisert lansering.
Codex bruker valgte, versjonerte designleveranser, bevarer funksjoner og viser app/design
side om side. Nye konkrete produktvalg avklares; allerede bestilt arbeid videreføres.
Denne økten leverer planen. Implementasjons- og kontrollstatus føres separat.

**Presisering i samme økt:** Anders vil at Codex planlegger arbeidet før Claude Design er
ferdig, undersøker alle funksjoner og kontrollerer at de virker sammen. Planens PRE-01–08
dekker funksjonsregister, isolert testmiljø, fersk teststatus, avtaler mellom moduler,
treningskjeden, roller/booking/AI, gjenoppretting og teknisk overlevering. Endelig skjermarbeid
følger valgt design; uavhengig funksjonsarbeid kan gjennomføres først.

## ORDBOKA ER LÅST: AVVIKENE MOT PRECISION ER AVGJORT (Anders 30.09.2026, bindende)

Svar på punkt 3 i §APPENS ORDBOK VINNER: alle avvik mellom masteren `docs/treningsplanlegging.md`
og Precisions `guidelines/ordmaster.md` er lagt fram og avgjort. Masteren er rettet i samme PR.

- **Stats** er fanen i PlayerHQ; i løpende tekst skrives «statistikk».
- **Målsetning** er det spilleren sikter mot. «Mål» brukes bare om måltall (TrackMan-mål, rep-mål, resultatkrav).
- **Venter på coach** er plan-status (bekrefter 26.09).
- **Nivåene heter Gratis og Full** på skjerm. Pro, Premium og Plus brukes ikke; «Pro» forveksles
  med coaching-pakken Performance Pro. TALENT / FULL / INGEN er interne tilgangsutfall.
- **Aksene:** FYS Fysisk · TEK Teknisk · SLAG Golfslag · SPILL Spill · TURN Turnering. Banespill er
  bare treningsområdet.
- **Nytt i masteren:** menyene (§2.6), kategorier A–K, SG-kategorier og dagsform (§2.7), fem
  standardplaner (§2.8), turneringstyper (§10).
- **Kondisjon** angis med pulssone S1–S5. **Styrke** skrives «4 × 6 @ 90 kg · RIR 2».
- **Teknisk fokus:** fortsatt ett per øvelse; en økt kan ha flere øvelser valgt fra spillerens
  tekniske plan. TrackMan-parametere foreslås ut fra valgt fokus.
- **Fysisk program** legger økter i planen; hver økt kan endres.

**Overstyrer:** «Gratis / Pro» i masteren §2.5, «Stats → Statistikk» og «Goal → Mål» i masteren §3.

**Arbeidet dette utløser:**

1. **Precision (`7d7c2994`):** hele prosjektet rettes etter masteren; `guidelines/ordmaster.md` og
   `assets/ak-vocabulary.js` blir avledede speil. Ferdig når et søk etter de forbudte ordene i
   masteren §3 gir 0 treff i skjermtekst, og ingen fil kaller ordmasteren autoritativ.
2. **Koden:** skjermtekst som viser nivånavn bruker Gratis / Full. Ferdig når ingen brukervendt
   tekst viser «Pro», «TALENT» eller «FULL» som nivå.
3. **TrackMan-forslag per fokus:** tabell legges fram for Anders før den bygges.
4. **Fysisk program:** datamodell og flyt planlegges når fysisk trening bygges.

## APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER (Anders 29.09.2026, bindende)

Anders: «docs/ordbok.md vinner». Svar på det uavklarte punktet i §PRECISION ATHLETICS om to ordlister.

- **Språket eies av repoet.** `docs/ordbok.md` peker til masteren `docs/treningsplanlegging.md`, som
  er eneste kilde for ord, statuser, posisjonsnavn og treningsbegreper.
- **`guidelines/ordmaster.md` i Claude Design «AK Golf Precision Athletics» (`7d7c2994`) er avledet.**
  Den er et speil for tegningene, ikke fasit. Sier den noe annet enn masteren, rettes ordmasteren.
- Posisjonsnavnene fra §POSISJONSNAVN FØLGER ORDMASTEREN (27.09) står nå i masteren §14.4, så
  navnene er de samme og kilden er repoet.

**Overstyrer:** Precisions `readme.md`, som kaller `guidelines/ordmaster.md` autoritativ.

**Arbeidet dette utløser:**

1. **Posisjonsnavn i masteren:** P1.0–P10.0 inn i `docs/treningsplanlegging.md` §14.4. Gjort i samme PR.
2. **Precision (`7d7c2994`):** `readme.md` og toppen av `guidelines/ordmaster.md` sier at masteren i
   repoet gjelder og at ordmasteren er avledet. Ferdig når ingen fil i prosjektet kaller ordmasteren
   autoritativ.
3. **Avvik mellom ordmasteren og masteren:** sammenlign ordene, legg avvikene fram for Anders, og rett
   ordmasteren etter svaret. Ferdig når de to sier det samme om hvert ord de begge har.

## Workbench over uka: årsplan, periode og måned (Anders 28.09.2026, bindende)

Anders vil ha knapper og skjema for ny årsplan, periodisering og månedsplan i Workbench.
I dag lages en årsplan bare i det skjulte ved første periode (`opprettPeriodeCore`,
`src/lib/workbench/periode-core.ts`), alltid 1. jan–31. des, og måneden kan bare leses.

- **Både coach og spiller kan opprette årsplan.** Coach for en spiller eller en gruppe; spilleren
  for seg selv. Coachen ser spillerens plan.
- **Tidsrommet velges ved opprettelse.** Forslaget er skoleåret (aug–jun) for WANG og
  kalenderåret ellers.
- **Måneden får eget innhold:** fokus og mål (koblet til Målsetninger), timer per akse
  FYS · TEK · SLAG · SPILL · TURN fordelt på ukene, tester og turneringer, og notat og evaluering
  når måneden er over.
- **«Ny årsplan» kan starte fra** kopi av fjoråret, standardplan A–K, gruppas årsplan eller tom plan.

**Arbeidet dette utløser:**

1. **Design i Precision (`7d7c2994`):** veileder «Opprett årsplan» (utgangspunkt, tidsrom, navn),
   årsplanen med perioder, periodeskjema, månedsskjema, og coachens og gruppas inngang. Samme
   Workbench for spiller (PH-11) og coach (AG-11), jf. `ui_kits/_shared/WB3.jsx`, som i dag bare
   dekker uka. Ferdig når skjermene er i `audit.html` med 0 avvik og Anders har sett dem (port 7).
2. **Årsplan i basen:** `SeasonPlan` (`prisma/schema.prisma`) har ingen `createdById` og er unik på
   `[userId, year]`. Legg til `createdById`, la `year` bety startåret og ta start/slutt fra skjemaet.
   Additivt via `db execute` (gotchas §Database). Ferdig når en plan aug 2026–jun 2027 kan lagres.
3. **Ny tabell `MonthPlan`** (finnes ikke): spiller, årsplan, år og måned, fokus, timer per akse,
   notat og evaluering; mål kobles via Målsetninger. Additivt via `db execute`. Ferdig når
   månedsskjemaet lagrer og ukene viser timene fra måneden.
4. **Opprett årsplan i koden:** én server-handling som oppretter planen fra de fire utgangspunktene.
   Kopi av fjoråret og standardplan A–K finnes ikke i dag (malene i `PlanTemplate` er 4-ukersblokker);
   gruppas plan gjenbruker `coachRullUtGruppeAarsplan` (`src/lib/workbench/gruppe-periode-actions.ts`).
   Ferdig når alle fire er låst med test.
5. **Coachen kan redigere spillerens perioder:** `coachLagrePeriode` og `coachSlettPeriode`
   (`src/lib/workbench/session-actions.ts`) har ingen kaller, og `/admin/workbench/[playerId]`
   viser år og måned uten redigering. Ferdig når coachen kan legge inn, endre og slette en periode der.
6. **Åpent:** innholdet i standardårsplanene per kategori A–K (faglig, fra Anders), jf. punkt 4 i
   §ØKONOMI BARE FOR HEAD COACH.

## ØKONOMI BARE FOR HEAD COACH, WEDGE GATE TELLER TREFF, ALLE STANDARDPLANER FOR ALLE KATEGORIER (Anders 28.09.2026, bindende)

Svar på de sju åpne spørsmålene etter fase 4 (runde 27–30 i Precision).

- **Økonomi (AG-20) vises bare for head coach.** Assistant coach ser verken menypunktet eller siden.
- **Wedge Gate teller treff.** Hvert forsøk føres som treff eller bom; resultatet er antall treff.
- **Stall-matrisen** Trenger deg · Følger planen · Hviler: bekreftet.
- **Talentradaren** får stiplet linje for Kategori C: bekreftet (bare coach, §Data).
- **Hurtigmeldingene** OK · Spørsmål · Ikke nå: bekreftet.
- **Alle fem standardplaner kan velges i alle kategorier A–K.** Spilleren velger selv; innholdet
  tilpasses kategorien (§SKJERMENE … RUNDE 8, Motoren).
- **Bildet for tellerne i live-økt** sender Anders senere. Punktet står åpent til da.

**Overstyrer:** «Wedge Gate … beholder sperren» under §Åpne punkter etter runde 19–26, og
«Hvilke fem planer som passer hvilke kategorier A–K er ikke skrevet» i §SKJERMENE … RUNDE 8 punkt 10.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`):** de fem bekreftede punktene fjernes som «Uavklart» i
   `ui_kits/katalog.js`; AG-20 merkes «Bare head coach». Ferdig når oversikt.html ikke har dem som uavklart. **Gjort 28.09** (runde 32 og 32b; Wedge Gate også i WANG 20f og Team Norway 1e–1f, med 9 slag etter arket).
2. **Tilgang i koden:** `src/app/admin/agencyos/okonomi/page.tsx:18` slipper i dag inn `ADMIN` og
   `COACH`. Begrens til head coach-rollen, også i Mer-menyen. Ferdig når en assistant coach sendes
   bort fra siden og ikke ser menypunktet, låst med test.
3. **Wedge Gate i koden:** `src/lib/portal-tester/tn-catalog.ts` har Wedge Gate som `points` med
   poengfelt og sperre. Bytt til treff/bom per forsøk og fjern sperren. Ferdig når
   `tn-scoring.test.ts` låser at resultatet er antall treff.
4. **Standardplanene** skrives for alle kategorier A–K (faglig innhold fra Anders), jf. RUNDE 8 punkt 8.

## SLETTEDIALOG KAN VÆRE RUST, ØKONOMI FØLGER AK GOLFS TJENESTER, RAPPORTBYGGEREN FJERNES (Anders 28.09.2026, bindende)

Svar på spørsmålene etter runde 28–30 i Precision Athletics og Team Norway 1c.

- **En dialog er en egen flate.** Slett, trekk tilbake og avslutt i en dialog kan være rust selv
  når bjella er rust. «Høyst én rust» gjelder innholdsflaten. Anders: «JA».
- **Økonomi (AG-20) fordeler budsjett og regnskap på AK Golfs tjenester:** Coaching privat ·
  Grupper · GFGK-avtalen · Gruppetimer · Andre tjenester fra AK Golf. Resultat per virksomhet i
  månedsavslutningen (`.claude/rules/admin-tripletex.md`) er uendret.
- **Rapportbyggeren (AG-A07) fjernes.** Anders: «Fjern den».
- **Nivå i Team Norways utviklingssjekk:** i Norge er man junior til og med det året man fyller
  19. Spilleren får Junior-spørsmålene ut det året. Der internasjonal klasse vises, står Amatør.

**Overstyrer:** «Regelen «høyst én rust» får ikke unntak» under §Åpne punkter etter runde 19–26,
og designets plassering av AG-A07 under Spiller 360 og Grupper.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`):** readme regel 2 (dialog er egen flate), AG-20 med de
   fem tjenestene, AG-A07 merket «Utgår 28.09» og ute av navigasjonen. Ferdig når oversikt.html
   ikke har disse som uavklart.
2. **Retting til Team Norway (`bc3e41fc`):** en spiller som fyller 19 i år står som Junior (41
   spørsmål), med Amatør som internasjonal klasse. Ferdig når demospilleren på 19 viser det.
3. **Kode når Økonomi porteres:** `/admin/reports` sender i dag til
   `/admin/agencyos/okonomi#rapporter` (`src/app/admin/reports/page.tsx`). Rapportdelen tas ut og
   adressen sender til Økonomi. Ferdig når ingen meny eller lenke viser rapportbyggeren.

## Åpne punkter etter runde 19–26 og Team Norways poengskala (Anders 28.09.2026, bindende)

Anders svarte selv på tre punkter og sa «ok» til Claudes anbefaling på resten.

- **«Neste turnering»** på I dag er neste offisielle golfturnering. Interne konkurranser
  (KjippeConk o.l.) er økter i agenda og plan, ikke turneringer.
- **Fasilitetsspørsmålene gjelder alle spillere** (oppstart og Meg), med dekning av de 19
  treningsområdene.
- **AG-12 er sammendraget etter live-økta:** utkast til coach, godkjent går det til spilleren.
- **«Svar» på innbokssak uten utkast** åpner et tomt skrivefelt og «Lag utkast» (Jarvis). Coach sender.
- **Konkurransespilleren** anbefales etter turneringsnivået fra oppstarten, ikke etter kategori.
  Spiller som ikke spiller turneringer får Klubbspilleren anbefalt. Spilleren velger selv.
- **PlayerHQ-innboksen bak bjella (PH-21) heter «Innboks».**
- **Break-tabellen** flyttes til Plan › Øvelsesbank, under putting.
- **Bjelletallet er grafitt**, rust bare når innboksen har en sak som haster (Risiko, eller
  spillerspørsmål ubesvart over 24 timer). En dialog er egen flate og kan ha rust (§SLETTEDIALOG).
- **Referanseverdi for testnivå (AG-15)** vises som «—» og «Referanse ikke satt» til A–K-nivåtallene
  er vedtatt (§Åpent).
- **Ingen egen Stats-side for coach under Mer.** Stats bor i Spiller 360 og Grupper.
- **Team Norways poengskala** kommer fra scorekort-arket på Drive («Team Norway Tester
  Treningsprotokoll Spiller.xlsx», fanen Referens). 8-ball: avstand til mål under 0,1 m = 4 ·
  0,1–0,99 = 3 · 1–1,99 = 2 · 2–2,99 = 1 · 3 m+ = 0. Putt (9 hull lengde, restavstand i fot):
  senket (0–0,1) = 6 · til 1 = 3 · til 2 = 1 · til 4 = 0,5 · over = 0. **Nærspill Gate og VISA
  Express:** arket har ingen skala; poeng føres for hånd per slag og appen summerer.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`)** sendes med runde 28: alle punktene over fjernes som
   «Uavklart» i `ui_kits/katalog.js` og tegnes slik. Ferdig når oversikt.html viser 0 av dem.
2. **TN-poeng i koden:** `src/lib/portal-tester/tn-catalog.ts` sperrer Nærspill Gate og VISA
   Express («Poengskala og treffkriterier må bekreftes») og 9 hull lengde («poeng ved senket
   putt … må bekreftes»). Fjern sperren for disse: Gate-testene summerer førte poeng, 9 hull
   lengde bruker skalaen over. Ferdig når `tn-scoring.test.ts` låser begge, og testen
   «ukjente gate-regler produserer ikke falsk standardscore» er skrevet om.
3. **Wedge Gate teller treff** (§ØKONOMI BARE FOR HEAD COACH, 28.09). **Uavklart:** Måleenheten for målavstand i 9 hull lengde er ikke avgjort av arket.

## ÉN IUP OG ETT TESTBATTERI FOR AK GOLF, WANG OG TEAM NORWAY, OG SPILLEREN DELER SELV (Anders 28.09.2026, bindende)

Grillingen runde 9: Anders bekreftet alle seks områder og mulighetskartets anbefaling («Send dette
til de riktige Claude Design-prosjektene»). Kjernen: «Spiller står ansvarlig for å gjøre sin
individuelle IUP og dele deretter med Wang og Team Norway coach.» Fasit for detaljene er «Slik vil
du ha det» per område i `docs/beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md`;
mulighetene står i `docs/beslutningsgrunnlag/mulighetskart-wang-tn-2026-09-28.md`.

- **Én IUP** med Team Norways IUP-ark som mal. Spilleren eier den; AK Golf kan bruke dataene
  anonymisert (står i vilkårene). **Ingen IUP-fane i PlayerHQ** — delene ligger i Plan, Stats,
  Målsetning og Meg. Trenerne får fanen «IUP» i Spiller 360, WANG og Team Norway, i arkets
  rekkefølge, hentet fra PlayerHQ.
- **Fireukerssjekk** i I dag (prosessmål, målsetninger og alle utviklingssjekkens 41 spørsmål på
  spillerens nivå: Ung, Junior, Amatør eller Profesjonell) erstatter WANGs halvårsevaluering.
  **Bare for spillere i en WANG-gruppe (Ung eller Toppidrett) eller Team Norway-gruppe** (Anders
  28.09: «Alle andre brukere skal ikke ha disse spørsmålssjekkene»). Sesongevaluering uka før uke 43.
  **Nivå Ung** = spilleren går i 8., 9. eller 10. klasse dette skoleåret (skoleåret 2026/27: født
  2011–2013), med arkets 34 Ung-spørsmål; eldre spillere bruker Junior (41) og videre.
- **Ett testbatteri** for alle tre, med ~~alle NGF-testene fra 6-årsløpet~~ (overstyrt 20.10: Team Norways 14 tester, §TESTBATTERIET ER TEAM NORWAYS 14 TESTER PLUSS FYSISK) og fysisk etter
  6-årsløpet (benkpress, markløft trapbar, lengdehopp, rotasjonskast, Club Speed). Spiller og
  trener fører («Egenført» · «Kontrollert»). Nivå er AK A–K; TN-spillere ser i tillegg
  landslagsnivå per klasse. Fysisk test hver sjette uke i grunnperioden.
- **Deling:** spilleren sender delingslenke fra Meg til trenerens e-post, bare @wang.no og
  @golfforbundet.no; forelder godkjenner under 16. Innsyn er alt, også helse og meldinger, og
  samtykkesiden sier det rett ut. Trekkes tilgangen, forsvinner treneren med en gang. Spilleren
  betaler PlayerHQ selv. WANG-elevers testresultater deles automatisk med Team Norway, med navn
  (opptaksavtalen).
  Delingslenken gjelder i sju dager (Anders 28.09).
- **Ranking i IUP:** WAGR og NGFs juniorranking (Anders 28.09).
- **Poengskala** for gate-testene, VISA Express, Putt Speed og 8-ball hentes fra Team Norways
  scorekort-ark, som Anders sender. Til da vises «—»; ingen skala lages på antakelse.
- **WANG og Team Norway foreslår, spilleren bestemmer** (plan, IUP, vurdering, samtale).
  AK-coachen endrer direkte; spilleren kan angre.
- **Bare trenerskjermer** i WANG- og TN-designet; spilleren ser det samme som i PlayerHQ. Alle
  TN-trenerskjermene blir og gjøres komplette, og TN får en kartleggingsskjerm for WANG-skolenes
  testdata. Kompetansemål fra Udir bare på WANG-skjermene. Kategori A–K erstatter WANGs E–A+.

**Overstyrer:** WANGs halvårsevaluering og kategori E–A+ i `6cfa623c`, TN-tegningens fysiske
protokoller (3000 m, knebøy, CMJ, medisinball) og spillerrolle i `bc3e41fc`, og at WANG- og
TN-trenere får tilgang gjennom gruppemedlemskap.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Personvern først (haster):** WANG- og TN-tilgang må kreve delingssamtykke.
   `hentWangCoachGruppeId`/`hentWangElevGruppeId` (`src/app/team-wang/_data/wang-tilgang.ts`) og
   `hentTnSpillerTilgang` (`src/lib/domain/tn-arbeidsflate.ts`) sjekker i dag bare gruppe og
   rolle, mens `DelingsSamtykke` er et eget system. Ferdig når en trener uten samtykke ikke ser
   spilleren, og det låses med test (mulighetskart WC1–WC3).
2. **Bestillinger sendt 28.09:** WANG runde 20 (`6cfa623c`), Team Norway (`bc3e41fc`) og Precision
   runde 31 (`7d7c2994`). Ferdig når alle tre har levert og Anders har sett skjermene (port 7).
3. **Delingslenke med domenesjekk** (@wang.no, @golfforbundet.no) og forelders godkjenning under
   16. I dag finnes bare plassholdertekst (`src/components/team-norway/tn-tilgang-handlinger.tsx`).
4. **Samtykkeoversikt** for sportssjef og TN: koble `beregnDekningsgrad`
   (`src/lib/domain/deling/dekningsgrad.ts`, 0 kallere) til en skjerm.
5. **Fireukerssjekk og utviklingssjekk** i PlayerHQ, med visning for trener. Utviklingssjekk finnes
   ikke i koden. Datamodell additivt via `db execute` (gotchas §Database), først når skjermene er
   godkjent.
6. **WANG-demoøkter** blandes med ekte data uten merking (`src/app/team-wang/_data/live-sesong.ts`).
   Ferdig når demo er merket eller fjernet.
7. **Venter:** invitasjon til PlayerHQ fra WANG/TN, landslagsnivå per klasse (tallene må komme fra
   Team Norway) og kjønn i TN-ranglisten — til delingen virker.

## SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8 (Anders 28.09.2026, bindende)

Anders gikk gjennom alle elleve områder og bekreftet hvert sammendrag. Anders: «Ting som nå evt
er låst kan endres.» Fasit for detaljene er «Slik vil du ha det» per område i
`docs/beslutningsgrunnlag/grillingen-runde8-skjermer-2026-09-28.md`; valgene i mulighetskartet
står i `docs/beslutningsgrunnlag/mulighetskart-playerhq-agencyos-2026-09-28.md`. Her står bare
reglene.

**Motoren (planforslag)**
- Ved lansering finnes ingen AI-planbygger. Spilleren velger én av fem standardplaner (Weekend
  Warrior, Klubbspilleren, Junior-aspirant, Konkurransespilleren, Practice like the pros),
  tilpasset kategori A–K, og kan alltid bygge økter selv i Workbench.
- Alder begrenser aldri plan eller mengde.
- Oppstart: alder, HCP, snittscore, turneringsnivå, SG i år og forrige sesong, fasiliteter.
  Teknikktesten (bygger på Inspill Basic) anbefales, er ikke påkrevd, og viser største svakhet
  uten å sette nivå.
- Justeringsforslag kommer bare når: SG viser gap til neste nivå (Broadie per HCP, merket
  estimat) · tre turneringsrunder på rad er minst tre slag over snittet av de ti siste tellende ·
  gjennomført tid er under 70 % av plan to uker på rad · over 130 % to uker på rad (lettere uke).
  Aldri etter én runde eller én turnering. Forslag er forslag, ikke sperrer (§Treningsfag).
- Spilleren godkjenner AI-forslag selv; «Send til coach» på forslag fjernes. Coach kan endre
  planen uten spillerens godkjenning, men spilleren kan angre. Spiller uten coach: Anders ser
  ikke planen og kan ikke skrives til.

**PlayerHQ**
- Fanene heter **I dag · Plan · Stats · Meg**.
- **I dag:** pop-up bare for melding fra coach eller endring i dagens plan. Dagens økter øverst
  med «Start». Bjella åpner én innboks med forslag, meldinger og varsler.
- **Plan** er én flate: se-modus (År · Måned · Uke · Dag) og «Rediger» som åpner komplett
  Workbench. Fysisk trening og turneringer ligger i samme plan; egne kalender-, fysisk- og
  turneringssider utgår (gamle adresser sender videre). Coach varsles når spilleren endrer en
  turnering eller en økt coachen la inn.
- **Google-kalender begge veier.** Coach ser bare opptatt tid, aldri tittel. Apple senere.
- **Stats** har fire deler: Snittscore · Strokes Gained · Trening · Tester. Standard
  sammenligning er neste kategori (Broadie, merket estimat); spilleren kan slå på PGA Tour, coach
  ser alltid begge. Nok data: under 4 runder ingen konklusjon, 4–7 «foreløpig», tee og innspill
  sikre fra 12, nærspill og putting fra 24.
- **Ytelsesbilde** (søvn, mat, energi) krever samtykke i onboarding. Banekart, GPS og
  vitnegodkjenning av tester kommer senere.
- **Meg:** «Mål» heter **Målsetning** og ligger i Workbench (start, slutt, resultat- eller
  prosessmål, fremdrift fra ekte data). Fasilitetsskjema med dekning av de 19 treningsområdene.
  Nytt onboardingsteg «Finn deg i turneringsresultatene». Talent «Min plan», roadmap,
  ukesdigest (blir melding) og «Utenfor banen» utgår.
- **Spilleren får ingen sammenligning av snittscoren mot andre, verken anonymiserte snitt eller
  navngitte spillere** (Anders 28.09 etter runde 22: «fjern sammenligning for nå»). Sammenligning
  med andre spillere og talentradaren er bare for coach (§Data uendret). Sammenligning mot neste
  kategori (Broadie, ESTIMAT) og PGA Tour i Stats består.
- **Tiger 5-reglene** «Bogey fra innenfor 130 m» og «Bom på enkel up and down» er bekreftet (28.09, ordet rettet 14.10).
- **Live-økt:** økt- og drillklokke, fire tellere per drill (Uten ball · Lav hastighet ·
  Automatikk · Slag) mot plan, neste drill åpnes automatisk. Fysisk økt: spilleren fører vekt,
  reps og serier. Etter økta (Anders 28.09): fysisk økt får «Hvor tungt» 1–10 (opplevd belastning);
  golføkt får belastning 1–10 og fokus 1–10 (hvor konsentrert spilleren var).
- **Runderegistrering:** per slag påkrevd avstand, underlag og kølle; putt påkrevd lengde i fot,
  break, fart og miss. SG, brutto score og Tiger 5 vises rett etter runden.
  Bom på putt: Venstre · Høyre · På linja (Anders 28.09).
- **Hurtigknappen gjelder også PlayerHQ:** Spør Caddie · Ny økt · Registrer runde · Start økt.

**AgencyOS**
- ~~Menyen: Cockpit · Innboks · Stall · Kalender · Workbench · Mer.~~ Overstyrt 16.10 (§AGENCYOS-MENYEN BLIR VARIANT C). Cockpit er startskjerm, med
  dagens kalender 05–22. Hurtigknappen får også «Ny booking».
- **Oppgaver kommer bare fra Notion** (Tasks og Prosjekter); oppgavelista i appen utgår.
- **Live coachingøkt** med opptak, teknisk plan og sammendrag. Opptak krever samtykke fra
  onboarding og spilleren ser «Opptak pågår». Sammendraget er utkast til coach; godkjent går det
  til spilleren. Navn tas ut før tekst sendes til AI.
- **Én innboks** for all kommunikasjon og alle godkjenninger: begge e-postkontoene
  (post@akgolf.no, akgolfgroup@gmail.com), spillermeldinger, forslag, varsler, leads og
  oppfølgingssaker. Kø, godkjenninger og oppfølgingskøen slås inn; kolonnene Risiko · Følg med ·
  Sjekk · Løst blir filter. Spillerspørsmål ubesvart etter 24 timer haster. Jarvis-chatten er
  egen side.
- **«Følger ikke planen»** i Cockpit viser de to siste ukene, med lenke til hele planen (Anders 28.09).
- **Stall i tre bånd:** I dag · Trener nå · Hele stallen. Coach kan sende melding under økta.
  Raden viser når planen og avtalen utløper.
- **Spiller 360** har IUP-samtale for alle spillere og fanene Plan · Stats · Teknisk plan ·
  Tester · Samtaler · Talent (bare coach).
- **Kalender:** alle coachers bookinger samlet, filter på coach. Head coach ser alt, assistant
  coach egne økter og gruppeøkter. Flytting av økt varsler spillerne automatisk, med angre i 10
  sekunder. Forslag til nye gruppeøkter med inntektsanslag kommer i Innboks; coach godkjenner.
- **Workbench:** gruppeplanen er grunnmuren og arves av medlemmene; tilpasning merkes «Egen».
  «Gjenta» ved slipp. **Pyramiden velges først og styrer kategoriseringen og øvelsesbanken.**
  Coach kan lage egne øvelser.
- ~~**Mer** har fem punkter~~ Overstyrt 16.10: punktene står i gruppene Daglig · Spillere · Drift (§AGENCYOS-MENYEN BLIR VARIANT C). Økonomi leses fra
  budsjett, Tripletex-eksport og Stripe, aldri anslått. Turneringspåmeldinger bekreftes ikke.

**Mulighetskartet:** A1–A8, A10–A12 og B1–B8 tegnes inn. A9 (skadevarsel på køllehastighet)
er valgt bort.

**Overstyrer:** fanenavnet «Analyse» (§Produkt og tilgang), «Pyramiden er veiledende»
(§Treningsfag), «Ikke avklart: om den også gjelder PlayerHQ» (§Hurtigknappen), og de fire
hurtighandlingene i AgencyOS (nå fem med «Ny booking»).

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bestillinger runde 19–30 til Precision Athletics (`7d7c2994`)**, én per område, lagret i
   `~/ak-brain/claude-code/prompter/precision-runde19-bestilling.txt` og videre. Ferdig når alle
   er sendt og statusraden i grillingsfila er oppdatert.
2. **Port 7:** Anders ser de nye tegningene i 390 og desktop. Ingen porting til kode før det.
3. **Personvern før annen kode (haster).** Gjort 28.09: ukeforslaget, vinn-tilbake,
   live-økt-chatten og avskriften av coachingopptak sender ikke lenger spillernavn til Anthropic,
   låst med tester. Slett konto finnes allerede: Meg › Personvern › «Slett kontoen min» sender en
   forespørsel som coach eller admin godkjenner (`opprettGdprForesporsel`); `deleteUserAccount`
   er en eldre, ubrukt vei. **Gjenstår:** fritekst brukeren selv skriver (chatmeldinger i
   coach-AI og portal-chat, øktnotater, coachnotater, AI-minne) sendes uvasket, og Caddies
   navnedetektor (`src/lib/caddie/privacy.ts`) brukes bare i Caddie-chatten. Anders' egne verktøy
   (Meg-agenten, innboksutkast, Kommando) sender navn fra e-post, kalender og Stripe; det er
   Anders' egne data, men bør vurderes.
4. **Riktighet i planforslaget:** hardkodede fasilitetsflagg (`src/lib/ai-plan/context.ts`,
   `hasBunker: false`, `hasNetAndMat: false`) og signalnavn som ikke matcher
   (`plan-builder/index.ts`, `SG_AREA`). Ferdig når fasilitetsskjemaet styrer flaggene og
   spillerens svakhet kommer med i forslaget.
5. **ACWR i stallen** er hardkodet. Vis «—» til tallet regnes ut.
6. **Runde-agentene** starter ikke etter `logRoundManual` eller turneringsrunder (mulighet A1).
7. **Fanenavnet i koden:** «Analyse» → «Stats» i `src/components/v2/shell.tsx:86` når Stats
   porteres. Adressen `/portal/analysere` beholdes eller sender videre.
8. **AI-planbyggeren skjules** for spillere ved lansering; de fem standardplanene må skrives
   (faglig innhold fra Anders, per kategori A–K).
9. **Datamodell** for målsetning med start, slutt og type, samtykke til opptak og Ytelsesbilde i
   onboarding, «Egen»-merke på arvede gruppeøkter og gjentakelse — additivt via `db execute`
   (gotchas §Database), først når skjermene er godkjent.
10. **Uavklart:** bildet Anders nevnte for tellerne i live-økt kommer senere. Alle fem planene gjelder
    alle kategorier A–K (§ØKONOMI BARE FOR HEAD COACH, 28.09).

## PERIODENE HETER GRUNNPERIODE, SPESIALPERIODE, TURNERINGSPERIODE, EVALUERING, FERIE OG RESTITUSJON (Anders 28.09.2026, bindende)

Svar på at språkmasteren sa «Spesialperiode» mens Masterbrain og teksten AI-agentene får, sa
«Spesialiseringsperiode». Anders ga lista: Grunnperiode, Spesialperiode, Turneringsperiode,
Evaluering, Ferie, Restitusjon.

- **Synlige navn:** Grunnperiode · Spesialperiode · Turneringsperiode · Evaluering · Ferie ·
  Restitusjon. «Spesialisering», «Spesialiseringsperiode» og «Evalueringsperiode» brukes ikke.
- **Kodenavnene endres ikke:** `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `FERIE`.
- **Restitusjon er ny periodetype** (Anders 28.09: ja til ny verdi i databasen). Rent tillegg:
  `RESTITUSJON` i `PeriodeType` og `LPhase`. Ingen rader endres.
- **Testuke, Treningssamling og Heldagssamling beholdes** (Anders 28.09). De er hendelser i
  årsplanen, ikke treningsperioder.
- **Lista gjelder også WANG.** Den offentlige GFGK Junior-teksten venter, fordi den er publisert.

**Overstyrer:** navnene «Spesialiseringsperiode» og «Evalueringsperiode» i koden, og raden
«Evalueringsperiode» i `docs/treningsplanlegging.md` kapittel 6.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Navnene i PlayerHQ og AgencyOS.** Gjort 28.09 i samme PR som beslutningen: tolv filer med
   periodenavn, teksten AI-agentene får (`src/lib/masterbrain/hent-kunnskap.ts`) og
   `docs/treningsplanlegging.md` kapittel 6.
2. **Restitusjon i databasen og koden.** Gjort 28.09.2026: Anders kjørte
   `scripts/add-restitusjon-periode-2026-09-28.ts` selv, og `RESTITUSJON` finnes i `PeriodeType`
   og `LPhase` (bekreftet med lesespørring). Skjema, navn, farge og ikon er lagt inn i koden.
   Antall økter per uke låses ikke (Anders 28.09): spiller og coach setter det selv, og
   plan-motoren har ikke standardtall for Restitusjon. Gjenstår: Anders ser skjermen (port 7).
3. **Masterbrain-kilden** (`akgolfsoftware/masterbrain`). Gjort 28.09 (masterbrain#13):
   «Spesialperiode» i `REDIGER-HER.md` og `canon-methodology.json`. Kodenavnet SPESIALISERING
   der oversettes fortsatt av appen.
4. **WANG.** Gjort 28.09: «Spesialperiode» i WANG-årsplanen og IUP-siden
   (`src/app/team-wang/`). Også rettet i Team Norway-månedsplanen, plan-motoren og hjelpetekstene.
5. **GFGK Junior venter.** Den offentlige teksten (`src/app/gfgk-junior/_data/`) sier
   «Spesialisering» og er publisert. Endres når Anders sier fra.

## POSISJONSNAVN FØLGER ORDMASTEREN, OG TEKNISK PLAN SPERRER INGENTING (Anders 27.09.2026, bindende)

Avklart etter to designrunder i Claude Design «AK Golf Precision Athletics» (`7d7c2994`), der
funksjoner fra prototypen «AK Golf Training Motor» (`4917465a`) ble tegnet inn. Prototypen er
idékilde, ikke visuell fasit: den bruker det gamle designsystemet `87aa23fb`.

- **Posisjonsnavn: ordmasteren gjelder.** Anders: «Ordlisten gjelder.» P1.0 Adresse / Oppstilling ·
  P2.0 Kølle parallell i baksving · P3.0 Venstre arm parallell i baksving · P4.0 Toppen av
  baksvingen · P5.0 Venstre arm parallell i nedsving · P6.0 Kølle parallell i nedsving · P7.0
  Treffpunktet · P8.0 Kølle parallell i gjennomføring · P9.0 Høyre arm parallell i oppfølging ·
  P10.0 Fullføring og balanse. Står i `docs/treningsplanlegging.md` §14.4 (kilde fra 29.09,
  §APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER).
- **Kvalitetssjekken vises bare.** Anders: «Bare vises.» Den er aldri krav for å gå videre til
  neste læringssteg. Rep-mål og treffprotokoll viser også bare status (§Treningsfag).
- **AK-formelen når en oppgave har flere læringssteg og miljøer:** formelen viser steget spilleren
  er på og hovedmiljøet. Rep-mål per steg og per miljø lagres hver for seg.
- **Demospilleren i koden heter Magnus Aasheim** (#980), samme navn som i designet.

**Overstyrer:** navnene i `src/components/teknisk-plan/constants.ts` fra 22.09.2026. De var hentet
fra `wiki/concepts/morad-posisjonssystem.md` i ak-second-brain, som har venstre arm på P9.0.
Kildene i samme kunnskapsbase (`wiki/sources/2026-05-11-morad-kb-terminology.md`) har høyre arm.
For posisjonsnavn avgjør dette også spørsmålet om to ordlister i §PRECISION ATHLETICS.

**Gjort i samme PR:** navnene er rettet i `constants.ts`, `src/lib/taxonomy.ts`,
`src/lib/domain/workbench/labels.ts` og de to utviklingsplan-visningene, med tester. Teksten «MORAD-arbeid» er fjernet fra `/admin/plan`.
Lagrede posisjonsnavn i basen leses ikke: `medFasitNavn` henter navnet fra koden.

**Arbeidet dette utløser** — detaljene står i
[porteringsplanen §9](../../docs/planer/portering-skjermer-2026-09-27.md):

1. **Portering av sju skjermtyper:** AG-10 (utvidet), AG-TP-01 Oppgaveskjema, AG-TP-02 Før og nå,
   PH-TP-01 Teknisk plan (spiller), AG-15 med testdetalj, PH-A07 og kilde på øktkort i AG-11.
   Ferdig per skjerm etter oppskriften i porteringsplanen §5, og Anders har sett den (port 7).
2. **Sju tillegg i datamodellen.** Hvert krever Anders' ja før det legges i basen (additivt via
   `db execute`, gotchas §Database): to daterte bilder per oppgave, logg for kvalitetssjekk,
   coachens svar på en registrering, publiseringstidspunkt på planen, testforhold på
   testresultatet, coachens valg per test og opphav på øvelse i økt.
3. **Navn som står igjen:** `PeriodeplanPyramideView.tsx` (demoskjerm under `/portal/toppidrett`,
   som skal videresendes) og `ak-kategorisystem.ts` (hovednavn og underposisjoner, ikke i bruk
   utenfor egen test). Rettes når filene porteres eller fjernes. Nøkkelordene i `src/lib/voice/whisper-transcribe.ts` er talegjenkjenning og
   beholdes.
4. **ak-second-brain:** P9.0 i `wiki/concepts/morad-posisjonssystem.md` rettes til høyre arm i en
   egen økt i den kunnskapsbasen.

## WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER, OG MENYEN FÅR SEKS HOVEDPUNKTER (Anders 27.09.2026, bindende)

Anders: «WANG Toppidrett-skjermene som er delt via AK Golf, så skal det være Sportssjef og Trener
skjermer, spiller har egne skjermer ved bruk av AK Golf – Player HQ.» Og om menyen: den skal ikke
«drukne i muligheter».

- **`/team-wang` har to roller: Sportssjef og Trener.** Elev, Foresatt, Åpen, Kontaktlærer, Rektor,
  Toppidrettssjef og Helsepersonell er ikke roller i `/team-wang`. Eleven bruker PlayerHQ (`/portal`).
- **Menyen har seks hovedpunkter med faner inni**, ikke 43 menypunkter. Trener: I dag · Trening ·
  Tester · Konkurranse · Meldinger · Elever. Sportssjef får i tillegg Administrasjon (trenere og
  roller, samtykke, timeplanføring, opptak). Dagens skjermer blir faner under et hovedpunkt.
- **Trening får en oversikt (WANG-42):** planlagt og gjennomført tid siste fire uker, etterlevelse
  (tid mot plan, §KARTLEGGINGSØKT FJERNES), oppmøte på morgentrening, per område og per elev.
- **Ut av WANG-menyen:** Hjem/fellesside (WANG-28, lever videre som egen åpen side, punkt 2), Foresattflaten (WANG-36), Skolefanen (WANG-25),
  Alle idretter (WANG-40), Helse og belastning (WANG-35). Tegningene beholdes.

**Overstyrer:** rollelinjen i §WANG: FEM ANSATTROLLER (26.09) for `/team-wang`, og rollelinjen i
`designsystem/wang/TILGANGSMATRISE.md`. Svarer på punkt 3 der: Rektor og Toppidrettssjef finnes
ikke i `/team-wang`, og Admins oppgaver (D2, D4, D11) ligger hos Sportssjef. Kontaktlærer-spørsmålet
fra runde 17 faller bort.

**Arbeidet dette utløser:**

1. **Design, runde 17–18 i `6cfa623c`:** ny meny, WANG-42 og bare to roller i alle filer (runde 17
   ferdig 27.09, runde 18 sendt 27.09). Ferdig når Designs måling er 0 avvik i 390/1280 og Anders
   har sett skjermene i «WANG Golf Gjennomgang» (port 7).
2. **Fellessiden `/team-wang` (`src/app/team-wang/page.tsx`) beholdes uendret og separat**
   (Anders 27.09: «den siden skal fortsatt holdes separat, den har ingenting med samarbeidssidene
   for WANG Fredrikstad å gjøre ennå»). Den er åpen uten innlogging for elever og foreldre og er
   ikke en del av trener- og sportssjefflaten. Ikke flytt, lås eller slå den sammen med menyen.
3. **Tilgang i koden:** `hentWangElevGruppeId` (`src/app/team-wang/_data/wang-tilgang.ts`) gir i dag
   eleven tilgang til egen IUP under `/team-wang`. Når elevens IUP finnes i PlayerHQ, skal
   `/team-wang` bare slippe inn trener og sportssjef. Ferdig når en elev som åpner
   `/team-wang/coach/iup/[elevId]` sendes til PlayerHQ, med test som låser det.
4. **Skjermene for elev og forelder** (WANG-28, 36, 25, og elevens side av WANG-42, WG-02, WANG-18)
   hører til PlayerHQ og tegnes i Precision Athletics (`7d7c2994`) når de trengs, ikke i WANG-systemet.

## ÉN SPILLERPROFIL (AG-08), OG PGA-SAMMENLIGNINGEN BRUKER BARE EKTE DATA GOLF-TALL (Anders 27.09.2026, bindende)

Svar på de to siste uavklarte punktene i Claude Design «AK Golf Precision Athletics» (`7d7c2994`).

- **Én spillerprofil: AG-08 Spiller 360.** Kortet i AG-03 Oppfølgingskø lenker dit. PS-01 finnes
  ikke i skjermlista og strykes. Overstyrer spørsmålet om PS-01 i §AG-03b punkt 3.
- **ST-05 PGA-sammenligning:** ekte PGA-navn fra Data Golf i appen (offentlige proffspillere).
  «Egne tall» bruker bare Data Golfs ekte fordeling, aldri en formel vi har laget selv. Mangler
  tallet, vises «—».

Krever ingen kodeendring — bekrefter dagens tilstand. `src/lib/datagolf/player-tool-data.ts`
bruker allerede ekte Data Golf-data og egne registrerte runder. Formelen fantes bare i designet
og rettes i runde 18.

## BOOKING BEKREFTES AUTOMATISK, OG BOOKINGE-POSTENE FÅR DESIGN (Anders 27.09.2026, bindende)

**Offentlig booking bekreftes automatisk når tiden er ledig og betalingen er gjennomført.**
Kunden skal ikke vente på coachen. Ingen «Venter på bekreftelse fra coach» for offentlig
booking eller flexkunder. Svar på spørsmålet etter runde 11 i Claude Design «AK Golf Precision
Athletics» (`7d7c2994`), der BK-flyten var tegnet med ventestatus.

Koden gjør dette allerede: Stripe-webhooken setter bookingen fra `PENDING` til bekreftet og
sender bekreftelsen (`src/lib/stripe/handle-event.ts`, `bookingBleBekreftet`). Ventestatusen
fantes bare i designet.

**Alle bookinge-postene skal designes, og bekreftelsen er første sted for mersalg.** Anders:
«Allerede her kan vi gjøre et mersalg på å starte i Player HQ.» Noen booker i appen (AK Golf
Academy), andre er flexkunder som booker én time på nett uten konto og trenger alt på e-post.

- **Bekreftelse:** tid, sted, tjeneste, pris og avbestillingsfrist, legg i kalender. Flexkunde
  (gjest) får lenke til å opprette PlayerHQ-konto. Appbruker får lenke til bookingen i appen.
- **Endret time:** gammel og ny tid tydelig.
- **Takk etter coachingtime** til kunde uten PlayerHQ-konto: takk for timen og treningen, og
  tilbud om å fortsette i PlayerHQ. Jarvis forbereder, et menneske sender (§Produkt og tilgang).
- Påminnelse og avbestilling sendes også i dag (`sendBookingReminder`,
  `sendBookingCancellation`) og tegnes i samme runde, så alle bookinge-postene er like.

**Overstyrer:** AG-03b punkt 4 om bookingbekreftelse i AgencyOS (AG-06) gjelder ikke offentlig
booking med betaling. Coach kan fortsatt avlyse.

**Arbeidet dette utløser:**

1. **Design, runde 16 i `7d7c2994`:** BK-03 og PH-23 bekreftet uten ventestatus og med
   PlayerHQ-tilbud til gjest. E-postene EP-01 bekreftelse (gjest og appbruker), EP-02 endret
   time, EP-03 påminnelse, EP-04 avbestilling, EP-05 takk etter coachingtime, EP-06 oppfølging.
   Ferdig når alle er i `audit.html` med null avvik og Anders har sett dem (port 7).
2. **Ny e-postmal i koden:** `tilHtml` i `src/lib/email/booking-emails.ts` bruker gamle
   hardkodede farger. Bytt til malen fra runde 16. Ferdig når alle fire bookinge-postene bruker den.
3. **Kontolenke i bekreftelsen til gjest** (`guestEmail` satt, `userId` null). Ferdig når
   lenken fører til registrering med e-posten ferdig utfylt.
4. **Takk-e-post som utkast til coachen:** bygg på `src/lib/agents/lead-oppfolging.ts`, som i
   dag bare gir coachen kopierbar tekst. Ferdig når en gjennomført gjestebooking gir et ferdig
   e-postutkast i AgencyOS-køen, som coachen sender med ett trykk (rust «Send»).

5. **Tidligere bookinger hentes inn på kontoen** når en flexkunde registrerer seg med samme
   e-post (Anders 27.09). Finnes ikke i koden i dag. Ferdig når gjestebookinger med samme
   `guestEmail` får `userId` ved registrering og vises i PlayerHQ. Kvitteringen lenker i dag til
   `/auth/signup?epost=…` med e-posten i adressen
   (`src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx`); bytt til en løsning uten
   e-post i lenken.
6. **Tidspunkt for e-postene etter coachingtime** (Anders 27.09): takk (EP-05) klar som utkast
   hos coachen innen 24 timer etter timen. Én oppfølging (EP-06) etter 14 dager, bare hvis kunden
   verken har booket ny time eller kjøpt PlayerHQ. Deretter ingenting mer.

Bookinger fra appen bekreftes også automatisk (Anders 27.09): de lagres som `PENDING` til
betalingen er gjennomført (`src/app/portal/booking/actions.ts`), deretter bekreftet.

## WANG: FEM ANSATTROLLER, OG SKOLENE DELER ÉN KOORDINERINGSSIDE (Anders 26.09.2026, bindende)

Svar på spørsmålene etter runde 14 i Claude Design «WANG Golf UI prototype» (`6cfa623c`).

- **Rollene i `/team-wang` er Sportssjef og Trener** — se §WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF
  OG TRENER (27.09), som erstatter rollelinjen herfra. **Assist Coach og Admin brukes ikke i WANG.**
  «Assist Coach» (§AK-stigen, 22.09) gjelder fortsatt AK Golf utenfor `/team-wang`.
- **Skolene deler én felles side** (D3 / WANG-33). Der ser hver WANG-skole hvem som har
  stjernemerket hvilken spiller, og hvem ved hvilken skole som har kommunisert med eleven eller de
  foresatte, og når. Innholdet i kommunikasjonen, vurderingstall, notater og skolekarakterer blir
  hos skolen som eier dem (uendret fra `designsystem/wang/TILGANGSMATRISE.md`).

**Overstyrer:** `Admin`-rollen i `designsystem/wang/TILGANGSMATRISE.md`, Mia Holts Assist Coach-rolle
i prototypens batch 7, og «personvern mellom skoler er ikke avklart» i
`designsystem/wang/APNE-BESLUTNINGER.md` §6.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Prototypen, runde 15** (`6cfa623c`): ferdig 27.09 (Assist Coach og Admin fjernet, WANG-33 er
   felles side). Anders har ikke sett skjermen ennå (port 7).
2. **Tilgangsmatrisen** (`designsystem/wang/TILGANGSMATRISE.md`): rollelinjen, D2, D4 og D11 er
   rettet 27.09 til Sportssjef og Trener.
3. **Avklart 27.09:** Admins oppgaver ligger hos Sportssjef; Rektor og Toppidrettssjef finnes ikke
   i `/team-wang` (§WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER).
4. **Datamodell før D3 kan bygges:** stjernemarkering per skole og en kontaktlogg per kandidat
   (skole, person, tidspunkt, mottaker elev/foresatt) — additivt via `db execute`, se gotchas
   §Database. Kontaktloggen lagrer aldri meldingsinnhold.

## KARTLEGGINGSØKT FJERNES, OG ETTERLEVELSE ER TID MOT PLAN (Anders 26.09.2026, bindende)

Svar på de åpne punktene etter runde 6 og 7 i Precision Athletics (AG-06, AG-09, PH-23).

- **Kartleggingsøkt finnes ikke lenger.** Anders: «Fjern alt som heter kartleggingsøkt.» Ingen
  tjeneste, knapp, pris, klipp eller tekst skal hete kartleggingsøkt — verken i appen, på
  markedssidene eller i Claude Design-prosjektet (`7d7c2994`). Det avgjør også spørsmålet om
  kartleggingsøkt trekker klipp: den finnes ikke.
- **Etterlevelse er gjennomført tid mot planlagt tid, siste fire uker.** Anders: «Ja jeg ønsker
  gjennomført til planlagt.» Minutter på gjennomførte økter delt på minutter på planlagte økter
  med passert sluttid. Fremtidige økter teller ikke. Mangler forfalte økter, vises «—».

**Overstyrer:** «Kartleggingsøkt er ikke gratis: 90 min til vanlig timepris» under §Merke og
tekst (flyttet til arkivet). Og telle-regelen i `src/lib/domain/etterlevelse.ts` («4/5 ·
publiserte økter med passert slutt», uten tidsvindu) som etterlevelsestall.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Claude Design (`7d7c2994`):** fjern kartleggingsøkt fra alle skjermer, data og
   `oversikt.html` (bl.a. AG-06 tjenester og pris, PH-23 klipp). Merk etterlevelse som avklart
   i AG-09. Ferdig når et søk etter «kartlegging» i prosjektet gir 0 treff i skjermfilene.
2. **Markedssidene:** fjern «kartleggingsøkt»/«kartleggings-økt» fra `MarkedNav.tsx` (hoved-
   knappen «Book kartleggingsøkt», to steder), `MarkedCasesV2.tsx`, `MarkedSuksessV2.tsx`,
   `MarkedKontaktV2.tsx`, `MarkedBookingV2.tsx` og metadata i `src/app/(marketing)/suksess/page.tsx`.
   Hovedknappen heter «Book time» (Anders 26.09). **Gjort 26.09** i samme PR som beslutningen.
3. **Tjenestelista i basen:** sjekk om `ServiceType` (og Stripe-produktene) har en
   kartleggingsøkt. Finnes den: deaktiver, ikke slett (eksisterende bookinger peker på den).
   Ferdig når den ikke kan bookes.
4. **Én etterlevelse i koden:** i dag finnes to mål — `etterlevelse()` teller økter uten
   tidsvindu (ukesrapport, digest, forelder), og `adherencePct()` i
   `src/lib/workbench/compliance.ts` vekter minutter (Workbench, plan-motoren). Samle dem på
   minutt-regelen med fire ukers vindu, og vis samme tall på alle flater. Ferdig når
   ukesrapport, digest, forelder, stall og Workbench viser samme prosent for samme spiller, med
   tester som låser fire-ukersvinduet.

Treff på «kartlegging» i betydningen *kartlegge noe* (arkitektur-kartlegging, datakartlegging,
kolonnekartlegging, GFGK-sesongens testperiode, øvelsestags) er ikke tjenesten og røres ikke.

## Klippekort, rust i avslutt-dialoger og «Følg med» (Anders 26.09.2026, bindende)

Svar på de åpne punktene etter runde 5 i Precision Athletics (PH-23, PH-25, AG-03).

- **Klippekortet gjelder coaching-pakkene Performance og Performance Pro**, ikke bare privattime
  60 min. Anders: «Klippekort er for subscription Performance og Pro». Klippene er pakkens
  credits (Performance 2, Performance Pro 4 per måned, BUSINESS-RULES §Coaching-pakker); én
  coachet økt trekker ett klipp. Pakkene vises aldri som app-nivå.
- **Farger følger gjeldende designsystem.** Anders: «Vil ha farger til gjeldende design system».
  Bekreftknappen i avslutt-dialogene (Avbestill i PH-23, Avslutt abonnement i PH-25) er rust,
  fordi rust er signalet for det som avslutter eller ødelegger (§PRECISION ATHLETICS).
- **Oppfølgingskøens kolonne heter «Følg med»**, ikke «Watch». Avgjør det første av fire
  navnevalg i AG-03b-blokken under.

Krever ingen kodeendring — bekrefter dagens tilstand: `src/app/admin/queue/status.ts` har
allerede etiketten «Følg med», og booking trekker klipp fra `Subscription.creditsRemaining`
(`src/lib/portal-booking/bekreft-data.ts`). I Claude Design-prosjektet (`7d7c2994`) rettes
antakelsen om klippekort i PH-23 og merket «Uavklart» på «Følg med» fjernes.

## FARGE BETYR AKSE, OG INGENTING ANNET (Anders 26.09.2026, bindende)

Workbench blandet svart-hvitt (årskurve, periodefelt) med sterke farger (ukefordeling, øktkort).
Anders: «den ser både svart hvit og med farger». Regelen gjelder hele Precision Athletics.

- Farge betyr alltid aksen FYS · TEK · SLAG · SPILL · TURN.
- Årskurven viser aksefordelingen per uke i aksefargene, dempet. Periodene er et tynt tekstbånd,
  ikke fylte blokker.
- ~~Øktkort er nøytrale med aksefarget stripe på venstre kant, ikke fargede flater.~~ Overstyrt 14.10: fylte øktkort (§FYLTE ØKTKORT).
- Fremdriftsstreker er grafitt. Grønt og rødt er bare statussignal.

**Arbeidet dette utløser:** rettes i Claude Design-prosjektet `7d7c2994` i runde 5 (alle tegnede
skjermer + guidelines). I koden gjelder regelen når Workbench-skjermene porteres (AG-11, PH-11).

## «Venter på coach» er et statusord, og en test teller bare med alle slag (Anders 26.09.2026, bindende)

Avklart etter runde 3 i Precision Athletics (PH-11, PH-12, PH-15).

- **«Venter på coach»** er statusen på en plan spilleren har sendt til coach for godkjenning.
  Det står ved siden av «Venter på spiller» i `docs/ordbok.md` §5, rad Plan.
- **En test teller bare når alle slag er registrert.** Avsluttes testen før, blir det ikke noe
  resultat. PH-15 er tegnet med 10 slag. Koden gjør dette allerede for Team Norway-scorekortet:
  `saveTnTest` lagrer et `TestResult` bare når `tnValidate` godtar alle forsøk, ellers blir
  økten `ABORTED` uten resultat.

Krever ingen kodeendring — bekrefter dagens tilstand. Ordboka er rettet i samme PR. I Claude
Design-prosjektet (`7d7c2994`) fjernes merket «Uavklart — venter på Anders» på begge punktene.

## PIPELINES ER ENESTE KILDE FOR TURNERINGSRESULTATER (Anders 26.09.2026, bindende)

**`ak-golf-pipelines` er det eneste som henter inn turneringsresultater. HQ sin egen
GolfBox-skraper slutter å skrive resultater.** Anders: «Så vi ikke gjør dobbelt med arbeid i
fremtiden.» Bakgrunn: analysen 26.09 fant at to systemer skriver samme GolfBox-turnering til
`public.tournaments` med ulik nøkkel (HQ: GolfBox-RID; pipelines: internt løpenummer), og at
nivåtallene (mot feltet, slag bak vinner, justert for vanskelighet) bare finnes i pipelines'
rålager. Kilde: `docs/beslutningsgrunnlag/turneringsdata-spillerprofiler-analyse-2026-09-26.md`.

- **Resultater** (deltakelser, runder, plassering, score, nivåtall) skrives til `public.*` kun
  av `pipelines/golfbox/writers/public_db.py`, hver mandag. HQ-jobben
  `.github/workflows/scrape-golfbox.yml` (hver time 06–20 UTC, `syncGolfBoxLeaderboards`)
  skal ikke lenger skrive resultater.
- **Kalender og frister** (kommende turneringer, `entryCloses`, `registrationUrl`) beholdes i
  HQ: Vercel-cron `turneringer-ngf` (`syncGolfBoxSchedules`) og `norge-mandag-sync`. De henter
  ikke resultater i dag heller.
- **WANG-profiler vises i HQ `/team-wang`**, mot samme base. `wang-toppidrett` er et annet
  prosjekt med egen base og holdes utenfor. Anders: «WANG Toppidrett-appen er et komplett annet
  prosjekt som ikke har med WANG-skjermen i AK Golf å gjøre.»
- **«AK12»** i bestillingen 26.09 utgår — Anders vet ikke selv hva det var. Skjermlisten er
  PlayerHQ, AgencyOS, Team Norway, WANG og rangskjermene.

**Overstyrer:** «to eiere»-oppsettet fra 15.09 i `docs/turnering-datakilder.md` (HQ-cron eide rå
GolfBox-resultater) og «Kodet»-raden for GolfBox i `docs/PLATTFORM-KART.md`. Begge rettet 26.09.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her.
Rekkefølge og kontroller står i analysen §7; her er det beslutningen krever:

1. **Mål dublettene før byttet.** Spørringen i analysen §4b mot `public.tournaments`. Ferdig
   når tallet er kjent og eksisterende dubletter er slått sammen via `mergedIntoId`
   (`/admin/tournaments/dubletter`).
2. **Pipelines bruker samme nøkkel som HQ:** GolfBox-RID som `sourceId`, funn på tvers av
   opphav, i `pipelines/golfbox/writers/public_db.py` (i dag: `dashboard.tournaments.id`).
   Ferdig når spørringen i §4b gir 0 rader etter en mandagskjøring.
3. **Identitet og beregning inn i mandagsjobben:** `pipelines.identity` → `pipelines.sg` →
   `refresh_views` i `junior-tours-sync.yml`. Ferdig når `dashboard.modell_kjoring` får ny rad
   hver mandag.
4. **Pipelines dekker det HQ-skraperen dekket:** `SOURCE_TO_ORIGIN` utvides med ren «golfbox»
   (NM, senior, midam, klubb), `regions_tour` og `manual`; `tour` settes per kilde, ikke fast
   `junior-no`. Ferdig når hvert `sourceOrigin` HQ skrev i dag har en pipelines-kilde.
5. **HQ slutter å skrive resultater:** `scrape-golfbox.yml` settes til `--mode=schedule`
   (eller slås av), `syncGolfBoxLeaderboards` fjernes fra `scripts/scrape-golfbox.ts`, og
   `scripts/backfill-golfbox-results.ts` arkiveres. Skjer først når 1–4 er grønne, ikke før.
   Ferdig når ingen `public_player_entries` får `updatedAt` fra HQ etter byttet.
6. **Vakt:** HQ `sync-vaktbikkje` (mandag 08:00) varsler når pipelines' mandagskjede mangler
   eller er rød. Ferdig når simulert rød kjøring gir varsel.
7. **WANG-profil i `/team-wang`** bygges fra samme datamodul som PlayerHQ og AgencyOS
   (analysen §6 og §7 steg 6 og 10). Ingen kobling mot `wang-toppidrett`.

Uendret: `public.*` er fortsatt det appen leser; Prisma eier kolonnene, og pipelines legger
aldri til kolonner. DataGolf vises bare for coacher (§KODEGJENNOMGANGEN 06.10).

## PRECISION ATHLETICS ER DESIGNSYSTEMET FOR AK GOLF HQ (Anders 26.09.2026, bindende)

**Claude Design-prosjektet «AK Golf Precision Athletics» (`7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`)
er visuell fasit for AK Golf HQ** — PlayerHQ (`/portal`), AgencyOS (`/admin`), forelder, `/auth`,
booking og statistikk. Anders: «det designsystemet er for selve AK Golf HQ, både player og
agency OS». Det erstatter «AK Golf Design System» (`87aa23fb`) og «App design» (`830e7bce`) som
fasit. «App design» finnes ikke lenger i Claude Design (`get_project`: not found, 26.09.2026).
Team Norway og WANG er utenfor; de har egne systemer og egne arbeidsmapper.

- **Rust er signal, ikke handling.** Primærknappen er grafitt `#141413` med hvit tekst. Rust
  `#9B2415` brukes bare på det som haster eller ødelegger (sletting, trekk tilbake), Live-pillen
  og tellere som krever coachens handling — maks én per skjerm. Overstyrer «Rust følger
  handlingen, ikke ordet» (22.09).
- **Lyst tema er standard** i `/portal` og `/admin`. ~~Nattema brukes i Live-økt og slagregistrering ute.~~
  Overstyrt 14.10: Live-økt og slagregistrering ute er alltid lyse (§LIVE-ØKTENE ER ALLTID LYSE).
  Overstyrer «Mørk er standard på `/portal` og `/admin`» (21.09).
- Markedssidene venter fortsatt (23.09); de beholder verksted-uttrykket til Anders sier noe annet.
- Ordlister: `docs/ordbok.md` (masteren `docs/treningsplanlegging.md`) vinner over prosjektets
  `guidelines/ordmaster.md` (§APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER, 29.09).
- Uendret: aldri sidelengs rulling, port 7 (Anders har sett skjermen), Codex bygger i appkoden.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Fullfør designsystemet** i `7d7c2994`: rett knapper/tema etter punktene over, legg til
   manglende komponenter (tabell som blir kortrader, ark, tidslinje, graf-grunnstykker, felt med
   feilmelding, tom/laster/feil). Fjern Toppidrett- og WANG-kitene fra prosjektet. Ferdig når
   `readme.md` og komponentkortene dekker alt skjermene under trenger.
2. **Skjermliste fra appen:** alle `page.tsx` under `/portal`, `/admin`, `/forelder`, `/auth`,
   booking og `/stats` som ikke er videresendinger, gruppert i skjermtyper. Ferdig når hver rute
   peker på én skjermtegning i prosjektet.
3. **Tegn alle skjermene** i mobil 390, iPad 768/1024 og desktop 1280/1440, lys og natt, tom,
   laster og feil. Claude Code styrer prosjektet via Chrome. Ferdig per skjerm når målingen viser
   `scrollWidth === clientWidth` i alle bredder og Anders har sett den (port 7).
4. **Temastandard i koden:** `erMorkFlate()` i `src/lib/v2/tema-default.ts` gjør `/admin` mørk
   uten lagret valg — skal bli lys. Nattema for Live-økt og slagregistrering er utgått (14.10, §LIVE-ØKTENE ER ALLTID LYSE).
5. **38 skjermer fra «App design» må tegnes på nytt.** Blokken «AG-03b» under viser til dem,
   men prosjektet er borte. Funksjonsfunnene i den blokken (datamodell, navnevalg, hull) står
   fortsatt; bare tegningene mangler. Dekkes av punkt 3.

Pekerne er rettet i samme PR: `design-autoritet.md`, `designsystem/README.md`, `ak-hq-design`-skillen.

## FORELDER-SKALLET BRUKER FELLES NAVIGASJON (Anders 23.09.2026, bindende)

`/forelder` skal bruke samme navigasjonsmønster som AgencyOS og PlayerHQ: hamburgermeny
på mobil og topplinje med fire mål og «Mer» på desktop. FO-01 til FO-04 skal bruke ett
delt skall, ikke fire ulike navigasjoner. Dette produktvalget gjelder innen gjeldende
designautoritet «AK Golf Precision Athletics»; eldre «App design»-tegninger er historikk.

**Arbeidet dette utløser:** Samordne FO-01 til FO-04 i gjeldende designprosjekt, bygg
skallet én gang i appen og kontroller mobil, desktop og relevante temaer. Dagens
`src/components/v2/shell.tsx` har fortsatt `BunnNavLenker`/`IkonRailNav` for forelder;
denne dokumentbeslutningen er ikke en ferdig skjermimplementasjon. Anders må se de
oppdaterte skjermene før port 7 kan regnes som bestått.

## AG-03b Oppfølgingskø: «Løst» blir egen status, og designrunden for PlayerHQ/AgencyOS er ferdig (Anders 23.09.2026, bindende)

**Oppfølgingskøens «Løst»-kolonne får en eksplisitt status på saken i basen, satt av coach
med ett trykk — aldri avledet automatisk av at spilleren igjen følger planen.** Kolonnen har
stått tom siden AG-03b ble kartlagt, fordi ingen modell fanger at en sak er løst. Foreslått
til Codex: én additiv tabell `FollowUpCase` (`userId` unik, `status`:
`RISK | WATCH | CHECK | RESOLVED`, `reasonKey`, `setById`, `setAt`, `resolvedAt`,
`resolvedById`), opprettet kirurgisk med `CREATE TABLE IF NOT EXISTS` — se gotchas §Database.
Detaljer og ytterligere fjorten funn (bl.a. at dagens `Signal`-baserte tilnærming glemmer en
løst sak etter sju dager, og ikke vet hvem som satte statusen): `agencyos-handover/AG-03b-manifest.md`.

**Samtidig: designrunden startet 21.09 er nå ferdig for tre av fem områder.** PlayerHQ (18
skjermer), AgencyOS (19 skjermer) og Lag-og-skole-koblingen (LS-03 GFGK Junior) har alle
bevis for de seks første portene i `DEKNINGSREGISTER.md` (Claude Design-prosjektet
«App design», `830e7bce`) — 38 skjermer totalt. Markedsområdet (MK-01–06, ~70 ruter) er
bevisst ikke tegnet ennå (Anders 23.09: «vent med markedssidene») og blokkerer ikke
porting av de tre ferdige områdene.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Port 7 må gjøres først, skjerm for skjerm.** Ingen av de 38 skjermene har Anders' ja
   ennå. Gjennomgangen skjer i Claude Design-prosjektet «App design» (`830e7bce`) — mobil
   390 px og desktop, lys og mørk, tom/laster/feil. Uten dette kan Codex ikke starte porting
   av en gitt skjerm, uansett hvor ferdig designet er.
2. **Fire datamodell-tillegg må inn før tilhørende skjerm kan kobles til ekte data**
   (additive, kirurgisk `db execute`, aldri `migrate`/`db push` — se gotchas §Database):
   - `FollowUpCase`-tabellen over, for AG-03b.
   - `ExerciseDefinition`: nye felt for treningsområde, motorikk, belastning og press (AK-formel
     v2), som i dag ligger på økten, ikke på øvelsen — kreves for AG-11b.
   - GFGK Junior: `hent-gfgk-data.ts` må slå opp på kanonisk gruppe-slug fra `bootstrap.ts`,
     ikke på tekststrengen «GFGK Junior Mini U10» — ellers faller fire offentlige sider
     stille tilbake til designtekst ved en omdøping. Se `gfgk-handover/LS-03-manifest.md`.
   - Caddie-samtale: `getOrCreateActiveConversation()` har null kallere i dag, og eneste
     chat-kaller sender tom `conversationId` — uten dette kan forslagsflyten i AG-14 aldri
     lagre et utkast. Se `agencyos-handover/AG-14-manifest.md`.
3. **Navnevalg som venter på Anders (ett avgjort 26.09) før tekst fryses i kode** — hver er én linje å rette
   når svaret foreligger:
   - ~~«Watch»-kolonnen i AG-03b~~ — avgjort 26.09: «Følg med» (§Klippekort, rust i avslutt-dialoger og «Følg med»).
   - Caddie-navnet i UI: koden sier «Coach AI», «AI-coach» og «AI om {fornavn}» om hverandre
     for samme funksjon (PH-16). Ordboken sier «Caddie».
   - «Merge» (AG-04) vs. «Slå sammen» (AG-10) er samme handling med to navn og to rust-svar.
   - PS-01: avgjort 27.09 — én spillerprofil (AG-08), se §ÉN SPILLERPROFIL.
4. **Fire «ingen kan gjøre X»-hull må bygges sammen med skjermen, ikke bare tegnes rundt**,
   ellers ser skjermen ferdig ut uten å virke:
   - Administrator-Caddie (AG-14): fire API-ruter og seksten verktøy finnes i koden, men
     ingen side har noensinne rendret dem.
   - Øvelsesredigering (AG-11b): ingen kan i dag opprette eller endre en øvelse noe sted i
     appen, verken admin eller coach.
   - Bookingbekreftelse i AgencyOS (AG-06): offentlig booking bekreftes automatisk etter
     betaling — se §BOOKING BEKREFTES AUTOMATISK (27.09). Coach kan fortsatt avlyse.
   - Utfordringer (PH-15): kodesiden er bygget (PR #948), men selve ny-skjermen fra
     tegningen er ikke portert ennå.
5. **Selve portingen:** hver av de 38 skjermene bygges fra sitt manifest
   (`playerhq-handover/`, `agencyos-handover/`, `auth-handover/`, `gfgk-handover/` i
   Claude Design-prosjektet) til ekte Next.js-kode, koblet til de delte skallmodulene som
   allerede er spesifisert (`fo-skall.js`, `ag-mobilmeny.css/.js`, `ag-hurtigknapp.css/.js`).
6. **Etter porting, før lansering:** full `npm run verify`, skjermsammenligning mot valgt
   Claude Design-versjon (`designsystem/README.md`-mønsteret), og Stripe-live/røyktest
   sist, som BUSINESS-RULES krever.

## Utfordringer skal leve (Anders 22.09.2026, bindende)

**Utfordringsfunksjonen beholdes og bygges ferdig.** I dag er den død: `opprettUtfordring`
i `src/app/portal/(legacy)/utfordringer/actions.ts` er ferdig skrevet med revisjonsspor og
automatisk deltakelse for eier, men **har ingen kallere** — `/portal/utfordringer/ny` er en
videresending rett tilbake til lista. Ingen kan opprette en utfordring, og finnes det ingen
utfordringer, er hele flaten tom.

- **Deltakere velges fra venner og gruppa, aldri ved delt lenke.** Du huker av hvem som skal
  få utfordringen, og de får varsel i appen. Kilder: `Friendship` med `status = "ACCEPTED"`,
  og `GroupMember` med `endedAt: null` i gruppene du selv er med i. En coach kan i tillegg
  velge fra stallen sin. **Ingen lenke som åpner en utfordring for hvem som helst** — de
  fleste deltakerne er mindreårige, og en delbar lenke omgår samtykket.
- **Scoren får en retning.** `reberegnRanger` sorterer i dag alltid synkende, og skjemaet sier
  «Høyere er bedre». Det gjør «færrest putter» og «kortest samlet avstand» umulig å rangere
  riktig. `DrillChallenge` trenger et felt som sier om høyest eller lavest vinner, satt når
  utfordringen lages.
- **«Opprett utfordring» bærer rust.** Handlingen forplikter: den lager noe andre blir med i
  og rangert i, på linje med Publiser og Send. Dette er en anvendelse av
  §Rust følger handlingen, ikke ordet — ikke et unntak fra den. **Avslutt utfordring er
  grafitt** i et kort med rustkant, som alle avslutninger.
- **En avsluttet utfordring heter «Avsluttet», ikke «Fullført».** Den er avsluttet av eieren;
  den er ikke nødvendigvis fullført av deg.
- **Utfordringer teller ikke som trening.** De går ikke inn i planen, ikke i analysene og ikke
  til coachen. Registrert score lever bare i utfordringen.

Tegningen er PH-15 i Claude Design-prosjektet «App design» (`830e7bce`), med manifest i
`playerhq-handover/PH-15-manifest.md`. Port 7 gjenstår.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bygg `/portal/utfordringer/ny` som ekte skjerm** og kall `opprettUtfordring`. Fjern
   videresendingen i `src/app/portal/(legacy)/utfordringer/ny/page.tsx`. Ferdig når en spiller
   kan lage en utfordring og lande på detaljen for den, som deltaker.
2. **Legg til deltakervelgeren** i ny-skjermen: venner (`Friendship` ACCEPTED) og medlemmer av
   egne grupper (`GroupMember`, `endedAt: null`), med varsel via `notify()` til hver valgt.
   Coach ser i tillegg stallen sin. Ferdig når ingen kan bli med uten å ha blitt valgt.
3. **Gi scoren en retning** i `DrillChallenge` (additiv kolonne via `db execute`, se
   gotchas §Database), og la `reberegnRanger` sortere etter den. Ferdig når en utfordring der
   lavest vinner får riktig resultatliste.
4. **Legg en inngang fra Meg.** `/portal/utfordringer` har tilbakelenke til `/portal/meg`, men
   ingenting i Meg lenker dit — eneste veier inn er Cmd+K og `/portal/utenfor-banen`.
5. **Rett språket:** «Fullført» → «Avsluttet» i `UtfordringerV2` og `UtfordringDetaljV2`;
   manglende plassering vises som tankestrek, ikke bindestrek; fjern «Del utfordringen og
   inviter andre til å bli med» fra tomteksten, som lover noe som ikke finnes.
6. **Notatfeltet over flere linjer.** Et notat på to setninger kan i dag skrives, men ikke
   leses tilbake — feltet er enlinjes og ruller sitt eget innhold.

Port 7 (Anders har sett skjermen) gjelder som for alle andre skjermer.

## TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (Anders 22.09.2026, bindende)

**Det skarpe Team Norway-språket eier `/team-norway/*`. Claw er utgående for appen.** Fasit blir et nytt Claude Design-prosjekt «Team Norway App», avledet av «Team Norway Golf Design System» (`3416f258`): ~~Jost display, Lato brødtekst~~ (overstyrt 20.10: Schibsted Grotesk), IBM Plex Mono på tall, ~~hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar~~ (overstyrt 19.10, §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ»), lukket ikonsett på 20.

- **Rød er `#D70232`** — målt fra logofilen. Kommunikasjonssystemets `#d40e3a` gjelder ikke i appen og rettes ved avledningen. Navy `#012B5D` er uendret i begge.
- **Sidemenyen er full navy `#012B5D`**, hvit tekst, lysere navy bak aktiv rad, rød markør. Den bor bare i `TnShell`/`TnRail` — aldri bygget på nytt per side.
- «Team Norway Golf Design System» beholder kommunikasjonsflatene (brev, e-post, plakat, presentasjon, rapport, sosiale). App-UI hører ikke hjemme der; dets egen beslutningslogg forbyr det.
- Claw (`a03bf94a`) og speilet `designsystem/team-norway/` er funksjonsinventar og historikk for appen, ikke visuell fasit. Spør ikke om dette på nytt.

**Overstyrer:** «Team Norway: eget Claw-system» under §Merke og tekst, og `designsystem/team-norway/LES-MEG.md` §Myndighet. Rødverdien er uendret fra 30.08.2026.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. Nytt prosjekt «Team Norway App»: tokens avledet av `3416f258` med rød rettet, skall TN-01 med navy sidemeny, mobil 390 px.
2. De fire internskjermene (Venter på meg, Analyse, Lisens og økonomi, Organisasjonsoppsett) tegnes om mot skallet — tokens i stedet for ~150 hardkodede farger, responsiv i stedet for fast 1440 px, menypunkter som matcher `tnHovedmeny`.
3. `src/styles/team-norway-tokens.css`: skrifter, hjørner, skygger, farger. ~~Jost og Lato lastes i stedet for Schibsted Grotesk.~~ Overstyrt 20.10: Schibsted Grotesk.
4. `src/components/team-norway/core.tsx`: de 18 `radius.full`-formene blir firkantede, avataren kvadratisk, `TnRail` navy.
5. Fem skjermer bygger skallet for hånd og spriker — `/team-norway`, `[groupId]`, `[groupId]/dokumenter`, `spiller/[spillerId]`, `tilgang`: to organisasjonsnavn, fire undertitler, tre innholdsbredder. Alle over på `TnShell`.
6. Maskinell måling av alle 21 TN-ruter i 390 px og desktop, tom/laster/feil: ingen sidelengs rulling, ingen node utenfor rammen, treffmål minst 44 px, kontrast godkjent på navy.
7. Rett `designsystem/team-norway/LES-MEG.md` og `ak-merkevare`-skillen — begge peker i dag på Claw for TN.

Ferdig skjerm krever fortsatt at Anders har sett den (port 7).

## AK-stigen har fire trinn, og Knøtt får egen gruppe (Anders 22.09.2026, bindende)

**Knøtt (11–12 år) er ikke et trinn i AK-stigen.** Stigen er Mini → Basis → Utvikling →
Elite. Aldersgruppen skal likevel ha sin egen gruppe, og den gruppen hører hjemme **ved siden
av stigen** — sammen med WANG Toppidrett — ikke som et hull i den.

**Rollen ASSISTANT heter «Assist Coach» på skjerm.** Tidligere sto det «Hjelpecoach» og
«Hjelpetrener» om hverandre i koden. Coach heter «Coach», spiller heter «Spiller».

Gjennomført i denne beslutningen: `AK_STIGEN_TRINN` har fire trinn, `vedSidenAv` erstatter
`overStigen` (liste, ikke ett felt), og rolleordene i `GruppeDetaljV2` er rettet. Tegningen er
AG-03c i Claude Design-prosjektet «App design».

**Gjenstår:** gruppen «GFGK Junior Knøtt U12» finnes ikke i basen ennå. Den må opprettes —
enten manuelt, eller ved at den legges inn i `GFGK_BOOTSTRAP_GRUPPER` med egen kanonisk slug.
Uavklart: om den offentlige juniorsiden (`/junior`), som i dag beskriver **fem** trinn med
Knøtt som det andre, skal skrives om. Den endrer publisert markedstekst og venter på Anders.

## Design (Anders 21.09.2026, bindende)

**Designsystemet er «AK Golf Precision Athletics» — se §PRECISION ATHLETICS øverst.** Train-lock og Paper er utgående: ingen visuell fasit, bare funksjonsinventar. Spør aldri på nytt om dette. Kilde og ID-er: [design-autoritet.md](../../docs/design-system/design-autoritet.md).
- Kode med Train-lock-/Paper-/`v2`-navn beholdes til funksjonene er flyttet. Navnene gir ingen autoritet.
- Claude Code/Design eier designet; Codex bygger det i appkoden.
- Konkret skjermvariant innen systemet kan Anders fortsatt velge før bygging.
- Ferdig skjerm = funksjonen virker og Anders har sett den (mobil 390 px + desktop, lys og mørk, tom/laster/feil).
- Paper er fjernet fra plattformen; vakten `scripts/check-ingen-paper.mjs` kjører i `npm run verify`.
- Ingen `className="dark"`; tema styres bare av `data-v2-tema` på `<html>`. Lys er standard overalt, også i Live-økt og slagregistrering (§LIVE-ØKTENE ER ALLTID LYSE, 14.10; `src/lib/v2/tema-default.ts`).
- Ikke bruk `accent` som tekstfarge på `primary`; bruk `-foreground`-paret.

## Aldri sidelengs rulling (Anders 22.09.2026, bindende)

Ingen skjerm, flate, rad, liste eller egen struktur skal kreve at brukeren drar skjermen
sidelengs. Gjelder alle områder (`/portal`, `/admin`, `/forelder`, marked, `/auth`, WANG,
Team Norway), alle bredder og alle tilstander — også piller, faner, tabeller, kortrader og
verktøyrader vi bygger selv.

- Løsningen er ombrekking (`flex-wrap`), stabling, kortere kolonner eller oppdeling.
  Aldri `overflow-x:auto` på en rad brukeren må se hele.
- Flex- og grid-beholdere med tekst som ikke brytes MÅ ha `minWidth: 0` (se gotchas §UI).
- Kontrolleres maskinelt per skjerm i begge bredder og hver tilstand: ingen node utenfor
  rammen, og `scrollWidth === clientWidth`. Bevis føres i skjermens manifest, port 4.
- Trengs sidelengs rulling likevel, er det et avvik som legges fram for Anders før det
  bygges — ikke et valg som tas underveis.

## Hurtigknappen gjelder alle AgencyOS-skjermer (Anders 22.09.2026, bindende)

Den flyttbare svarte hurtigknappen skal finnes på **alle skjermer i AgencyOS**, ikke bare Hjem.
Fem hurtighandlinger: ny økt i Workbench · ny melding til spiller · registrer runde · spør
Jarvis · ny booking (§SKJERMENE … RUNDE 8).

- Den bor i **én delt modul**, ikke som kopiert kode per skjerm: i designprosjektet
  `agencyos-handover/ag-hurtigknapp.css` og `.js`. Bygges den i appen, skal den være én
  komponent brukt av skallet — ikke én per side.
- Faste regler: 56 × 56 px grafitt, radius 2 · kan dras hvor som helst og klemmes 8 px fra
  hver kant · drag åpner ikke menyen (under fem piksler er et trykk) · menyen snur når den
  ellers ville gått utenfor flaten.
- **Gjelder også PlayerHQ** (28.09): Spør Caddie · Ny økt · Registrer runde · Start økt.
  Se §SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8.

Byggeoppgave når AgencyOS-skallet bygges: knappen hører til skallet (`src/components/v2/shell.tsx`),
ikke til den enkelte siden. Ferdig når den står på hver `/admin`-side, husker posisjonen sin,
og ikke kan dras ut av syne.

## Treningsfag

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk (18.08). Vokabularet består som frie merkelapper. Gjeninnfør aldri en regel uten ny beslutning.
- AK-formel v2: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`. Motorikk UTEN_BALL/LAV_HAST/AUTO, press ALENE/OBSERVERT/KONKURRANSE/TURNERING. L-faser, CS-koder (CS0, CS20–CS100), M0–M5 og PR1–PR5 er utgått. v3 er skrotet.
- Hastighet i læringssteg er 25, 50, 75 og 100 prosent av Club Speed (Lav hastighet 25/50/75 %, Automatikk 100 %, Uten ball ingen). Bekreftet av Anders 21.09.2026. Ikke den utgåtte CS-skalaen.
- Én master for språk og treningsplanlegging: `docs/treningsplanlegging.md` (21.09.2026). `docs/ordbok.md` er bare en peker; `docs/ordbok.json` genereres.
- Øvelsen planlegges i åtte trinn (pyramide, område, sted, måleutstyr, gjennomføring, press, mengde, mål). Pyramiden velges først og styrer kategoriseringen og øvelsesbanken (28.09, §SKJERMENE … RUNDE 8); området styrer feltene. Valgene lagres som `detaljer` i `akFormel`, uten databaseendring.
- **STANDARD ÅRSPLAN JUNIOR 16, TURNERINGSUKER 50/50 (Anders 22.09.2026, i økt):** Uke 17–42 fordeles fast 50/50 mellom langsiktig spor (neste steg i teknisk utviklingsplan) og kortsiktig spor (området med mest slag tapt). Hvorfor: «Begge sporene må få tid hele sesongen.» Valgt mot Claudes anbefaling (kortsiktig i selve turneringsuka). Uavklart: A-turneringer beholder nedtrapping og ingen ny teknikk siste 2–4 uker, så langsiktig halvdel må da bety vedlikehold. Krever ingen kodeendring ennå — ingenting bygges før hele dokumentet er godkjent. Arbeid: `docs/treningsplanlegger/junior-16/arsplan-standard.md` §7 og §13 punkt 1.
- **PERIODEGRENSER I ÅRSPLAN ER INDIVIDUELLE PER SPILLER (Anders 22.09.2026, i økt):** GRUNN/SPES/TURN-grenser settes per spiller; WANG-årshjulet og Team Norways grenser er utgangspunkt, ikke fasit. Krever ingen kodeendring ennå — ingenting bygges før årsplandokumentet er godkjent; datamodellen må senere la periode variere per spiller. Kilde: `docs/treningsplanlegger/junior-16/arsplan-standard.md` §3.
- TrackMan-parametere på engelsk med stor forbokstav (Attack Angle, Club Path, Smash Factor).
- Valgtreet fra årsplan til øvelse (åtte trinn) eies av `docs/treningsplanlegging-og-sprak-gjennomgang.md` (22.09). Puttingavstand i fot, meter kan vises i parentes. Måleutstyr er en fast liste (TrackMan og annen radar). Teknisk fokus per område er eget felt på oppgaven i teknisk plan.
- Tester planlegges i Workbench; resultat synkes til talentprofilen.

## Workbench

- Spillerens `WorkbenchV2` er den ene motoren; coach får samme komponent med stall-velger og gruppe-modus. `WorkbenchUke` bygges ikke videre.
- `WorkbenchSession` er den ene økt-tabellen (OW-3).
- Ny uke starter aldri tom: «kopier forrige uke» er standard.
- Flytting av økt skal være ekte dra-og-slipp, også på mobil (17.09).

## Produkt og tilgang

- Nivåer FULL / TALENT / INGEN, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`. FULL: 299 kr/mnd eller 2 690 kr/år for alle spillere (ingen 199 kr juniorpris, Anders 24.09.2026). ELITE finnes ikke. Detaljer: BUSINESS-RULES §Abonnement.
- PlayerHQ har fire faner: I dag · Plan · Stats · Meg (28.09). Coach-menyen er variant C med tre grupper (§AGENCYOS-MENYEN BLIR VARIANT C, 16.10).
- Én inngang per funksjon: én adresse, gamle adresser blir redirects, ingenting fjernes.
- Coachflaten kalles AgencyOS (`/admin`), aldri CoachHQ. Demo: spiller Øyvind Rohjan, coach Anders Kristiansen.
- Jarvis forbereder alt og sender ingenting. Alt som forlater huset eller endrer noe for et menneske krever Anders' ja.
- Forelderen er kjøperen for juniorer; forelder kan booke for barnet.
- Stripe-live og ekte kjøp verifiseres sist, rett før røyktesten.

## Merke og tekst

- MORAD og Mac O'Grady nevnes aldri offentlig. P-posisjoner som internt fagspråk består.
- Ingen vitnesbyrd, sitater eller stjerner. Vis målingen.
- Priser leses fra `ServiceType.priceOre`, aldri hardkodet. Kartleggingsøkt er fjernet (§KARTLEGGINGSØKT FJERNES).
- Mulligan knyttes ikke direkte til AK Golf-merket; AK Golf promoterer bare.
- Ingen «Vi svarer innen én virkedag» før Jarvis er i drift.
- Team Norway: eget system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*` — visuell fasit er §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ» (19.10) og §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, ikke Claw. Team Norway får kun interne skjermer gratis mot at de promoterer appen (Anders 24.09.2026). Analyse og DataGolf for TN er delte plattformflater.
- WANG har eget system (`src/styles/wang-tokens.css`). Junior Academy og GFGK Junior er ulike ting.

## Data (brytes disse, blir tallene feil)

- Kun brutto. Netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N».
- Til-par fra `public_player_entries.scoreToPar`; par utledes aldri fra baneregisteret.
- `position` er aldri persentil. Aldersstige bare fra 16 år.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri åpent; manglende fødselsår vises ikke.
- Alt appen sier om en spiller skal ha måling, dato og kilde (TruthLayer); estimat merkes.
- Kohortsammenligning er kun coachens verktøy. «Powered by Data Golf» der Data Golf-tall vises; de vises bare for ADMIN (§DATA GOLF ER ANDERS' PRIVATE VERKTØY, 20.10).
- Økonomitall leses fra Tripletex-eksport, aldri estimert.

## Åpent (ikke besluttet, ikke bygg som fasit)

- FYS-formel og A–K-nivåtall. Dosefelter på `WorkbenchDrill` før OW-3 fase 3.
- WANG-/TN-felles kjerne (menystruktur foreslått av Codex 21.09, ikke vedtatt).
