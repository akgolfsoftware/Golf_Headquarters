# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Gamle overstyrte valg er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

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
  spillerspørsmål ubesvart over 24 timer). Regelen «høyst én rust» får ikke unntak.
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
3. **Uavklart:** Wedge Gate står i koden (`A26:F38`) men ikke i arket på Drive; den beholder
   sperren. Måleenheten for målavstand i 9 hull lengde er ikke avgjort av arket.

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
- **Tiger 5-reglene** «Bogey fra innenfor 130 m» og «Bom på enkel opp-og-ned» er bekreftet (28.09).
- **Live-økt:** økt- og drillklokke, fire tellere per drill (Uten ball · Lav hastighet ·
  Automatikk · Slag) mot plan, neste drill åpnes automatisk. Fysisk økt: spilleren fører vekt,
  reps og serier. Etter økta (Anders 28.09): fysisk økt får «Hvor tungt» 1–10 (opplevd belastning);
  golføkt får belastning 1–10 og fokus 1–10 (hvor konsentrert spilleren var).
- **Runderegistrering:** per slag påkrevd avstand, underlag og kølle; putt påkrevd lengde i fot,
  break, fart og miss. SG, brutto score og Tiger 5 vises rett etter runden.
  Bom på putt: Venstre · Høyre · På linja (Anders 28.09).
- **Hurtigknappen gjelder også PlayerHQ:** Spør Caddie · Ny økt · Registrer runde · Start økt.

**AgencyOS**
- Menyen: Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Cockpit er startskjerm, med
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
- **Mer** har fem punkter: Booking · Grupper · Tester · Økonomi · Oppsett. Økonomi leses fra
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
3. **Personvern før annen kode (haster):** ukeforslaget sender ekte spillernavn til Anthropic
   (`src/lib/ai-plan/week-suggest.ts:194`, `ctx.name`); sjekk om opptak og avskrift gjør det
   samme; slett konto (`deleteUserAccount`) har ingen knapp. Ferdig når ingen prompt inneholder
   navn, med test som låser det, og spilleren kan slette kontoen fra Meg.
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
10. **Uavklart:** bildet Anders nevnte for tellerne i live-økt kom ikke med. Hvilke fem planer som
    passer hvilke kategorier A–K er ikke skrevet.

## PERIODENE HETER GRUNNPERIODE, SPESIALPERIODE, TURNERINGSPERIODE, EVALUERING, FERIE OG RESTITUSJON (Anders 28.09.2026, bindende)

Svar på at språkmasteren sa «Spesialperiode» mens Masterbrain og teksten AI-agentene får, sa
«Spesialiseringsperiode». Anders ga lista: Grunnperiode, Spesialperiode, Turneringsperiode,
Evaluering, Ferie, Restitusjon.

- **Synlige navn:** Grunnperiode · Spesialperiode · Turneringsperiode · Evaluering · Ferie ·
  Restitusjon. «Spesialisering», «Spesialiseringsperiode» og «Evalueringsperiode» brukes ikke.
- **Kodenavnene endres ikke:** `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `FERIE`.
- **Restitusjon er ny periodetype.** Den finnes ikke i databasen i dag (`PeriodeType` og `LPhase`
  har åtte verdier, ingen `RESTITUSJON`).
- **Ikke avklart:** Testuke, Treningssamling og Heldagssamling står ikke i lista. De beholdes
  uendret til Anders har sagt om de skal bort. Ingenting fjernes på antakelse.

**Overstyrer:** navnene «Spesialiseringsperiode» og «Evalueringsperiode» i koden, og raden
«Evalueringsperiode» i `docs/treningsplanlegging.md` kapittel 6.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Navnene i PlayerHQ og AgencyOS.** Gjort 28.09 i samme PR som beslutningen: tolv filer med
   periodenavn, teksten AI-agentene får (`src/lib/masterbrain/hent-kunnskap.ts`) og
   `docs/treningsplanlegging.md` kapittel 6.
2. **Restitusjon i databasen.** Additiv ny verdi `RESTITUSJON` i `PeriodeType` og `LPhase`,
   kirurgisk via `db execute` (gotchas §Database). Krever Anders' ja til akkurat den endringen.
   Deretter navn, farge og ikon i de samme tolv filene. Ferdig når coach kan legge en
   restitusjonsperiode i årsplanen og spilleren ser den.
3. **Masterbrain-kilden** (`akgolfsoftware/masterbrain`). Gjort 28.09 (masterbrain#13):
   «Spesialperiode» i `REDIGER-HER.md` og `canon-methodology.json`. Kodenavnet SPESIALISERING
   der oversettes fortsatt av appen.
4. **WANG og GFGK Junior er ikke endret.** WANG-årsplanen (`src/app/team-wang/_data/`) og den
   offentlige GFGK-teksten (`src/app/gfgk-junior/_data/`) sier «Spesialisering». Endres bare hvis
   Anders sier at lista også gjelder der.

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
- Øktkort er nøytrale med aksefarget stripe på venstre kant, ikke fargede flater.
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
aldri til kolonner. DataGolf vises aldri for andre enn Anders.

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
- **Lyst tema er standard** i `/portal` og `/admin`. Nattema (`data-theme="night"`) brukes i
  Live-økt og slagregistrering ute; brukeren kan bytte tema selv. Overstyrer «Mørk er standard på
  `/portal` og `/admin`» (21.09).
- Markedssidene venter fortsatt (23.09); de beholder verksted-uttrykket til Anders sier noe annet.
- Uavklart: prosjektets `guidelines/ordmaster.md` (25.09) og `docs/ordbok.md` er to ordlister.
  Til Anders har valgt, gjelder `docs/ordbok.md` (§Treningsfag).
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
   uten lagret valg — skal bli lys. Nattema for Live-økt og slagregistrering bygges sammen med
   de skjermene.
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

**Det skarpe Team Norway-språket eier `/team-norway/*`. Claw er utgående for appen.** Fasit blir et nytt Claude Design-prosjekt «Team Norway App», avledet av «Team Norway Golf Design System» (`3416f258`): Jost display, Lato brødtekst, IBM Plex Mono på tall, hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar, lukket ikonsett på 20.

- **Rød er `#D70232`** — målt fra logofilen. Kommunikasjonssystemets `#d40e3a` gjelder ikke i appen og rettes ved avledningen. Navy `#012B5D` er uendret i begge.
- **Sidemenyen er full navy `#012B5D`**, hvit tekst, lysere navy bak aktiv rad, rød markør. Den bor bare i `TnShell`/`TnRail` — aldri bygget på nytt per side.
- «Team Norway Golf Design System» beholder kommunikasjonsflatene (brev, e-post, plakat, presentasjon, rapport, sosiale). App-UI hører ikke hjemme der; dets egen beslutningslogg forbyr det.
- Claw (`a03bf94a`) og speilet `designsystem/team-norway/` er funksjonsinventar og historikk for appen, ikke visuell fasit. Spør ikke om dette på nytt.

**Overstyrer:** «Team Norway: eget Claw-system» under §Merke og tekst, og `designsystem/team-norway/LES-MEG.md` §Myndighet. Rødverdien er uendret fra 30.08.2026.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. Nytt prosjekt «Team Norway App»: tokens avledet av `3416f258` med rød rettet, skall TN-01 med navy sidemeny, mobil 390 px.
2. De fire internskjermene (Venter på meg, Analyse, Lisens og økonomi, Organisasjonsoppsett) tegnes om mot skallet — tokens i stedet for ~150 hardkodede farger, responsiv i stedet for fast 1440 px, menypunkter som matcher `tnHovedmeny`.
3. `src/styles/team-norway-tokens.css`: skrifter, hjørner, skygger, farger. Jost og Lato lastes i `src/app/team-norway/layout.tsx` i stedet for Schibsted Grotesk.
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
- Ingen `className="dark"`; tema styres bare av `data-v2-tema` på `<html>`. Lys er standard overalt; natt i Live-økt og slagregistrering (`src/lib/v2/tema-default.ts`, se §PRECISION ATHLETICS punkt 4).
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
- PlayerHQ har fire faner: I dag · Plan · Stats · Meg (28.09). Coach-menyen følger prototypen fra 02.09 (Cockpit, Innboks, Stall, Kalender, Workbench + Mer).
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
- Team Norway: eget system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*` — visuell fasit er §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, ikke Claw. Team Norway får kun interne skjermer gratis mot at de promoterer appen (Anders 24.09.2026). Analyse og DataGolf for TN er delte plattformflater.
- WANG har eget system (`src/styles/wang-tokens.css`). Junior Academy og GFGK Junior er ulike ting.

## Data (brytes disse, blir tallene feil)

- Kun brutto. Netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N».
- Til-par fra `public_player_entries.scoreToPar`; par utledes aldri fra baneregisteret.
- `position` er aldri persentil. Aldersstige bare fra 16 år.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri åpent; manglende fødselsår vises ikke.
- Alt appen sier om en spiller skal ha måling, dato og kilde (TruthLayer); estimat merkes.
- Kohortsammenligning er kun coachens verktøy. «Powered by Data Golf» på alle offentlige statistikkflater.
- Økonomitall leses fra Tripletex-eksport, aldri estimert.

## Åpent (ikke besluttet, ikke bygg som fasit)

- FYS-formel og A–K-nivåtall. Dosefelter på `WorkbenchDrill` før OW-3 fase 3.
- WANG-/TN-felles kjerne (menystruktur foreslått av Codex 21.09, ikke vedtatt).
