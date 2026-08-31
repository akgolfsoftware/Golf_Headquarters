# Låste beslutninger — AK Golf HQ

Gjeldende beslutninger fra Anders. Gjelder til han endrer dem. Nyeste først.

**Historikk og supersederte beslutninger:** `docs/arkiv/beslutninger-historikk.md`. Denne fila
lastes i hver eneste økt — hold den til det som gjelder NÅ. Blir en beslutning overstyrt, flytt
den til arkivet, ikke la den ligge merket «SUPERSEDERT».

**Ny beslutning registreres med `/beslutning`** — den skriver både hit OG inn i
`docs/MASTERPLAN-GJENSTAAENDE.md` som nummerert arbeid. En beslutning som bare står her, blir
aldri bygget (målt 30.08.2026: sju av ni beslutninger fra 26.–30.08 fantes ikke i planen).

> **Eierskap (Anders 2026-08-03):** `docs/platform/BUSINESS-RULES.md` eier **produkt- og
> forretningsregler** — for slike er listen under sammendrag, og ved konflikt vinner
> BUSINESS-RULES.md. Denne fila eier **arbeids- og designprosess-beslutninger**. Ikke dupliser
> regler på tvers.

> **PAPER ER FJERNET FRA HELE PLATTFORMEN (Anders 30.08.2026).** Ordrett: «Paper skal ett hundre
> prosent bort fra hele plattformen, uansett hva regler og diverse sier.» Utført samme dag:
> `designsystem/paper/`, `src/lib/v2/tokens.ts` (`T`) og alle Paper-CSS-filene slettet, `--p-*`
> erstattet med `--tl-*` i hele `src/`. Domeneverdier (pyramideakser, tee-farger, merkefarger) er
> flyttet ORDRETT til `src/lib/v2/ak-palett.ts` (`AK`) — ingen verdi endret.
> **Vakt:** `scripts/check-ingen-paper.mjs` kjører i `npm run verify`. Ikke deaktiver den uten ny
> beslutning. Paper-omtaler i eldre dokumenter er historikk, aldri byggeordre.

> ⚠ **FYS-formel + A–K-nivåtall** er ikke avklart (deltråder: onboarding steg 6 + drill-retag) —
> ikke håndhev som låst. De tre andre klyngene fra 2026-06-22 er avklart og bygget.

## Beslutningene (august 2026)

- **ANALYSE OG DATAGOLF FOR TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN, IKKE EGNE CLAW-SKJERMER
  (Anders 31.08.2026, i økt):** løser presist den uavklarte «arbeidsdelingen mot Train-lock» i
  `designsystem/team-norway/readme.md` (skrevet der som «en anbefaling som må bekreftes»), og
  presiserer N7/N12 i MASTERPLAN STEG 11.

  **Analyse** (AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt) og **DataGolf**
  (DataGolfProfil, TruthLayer) skal IKKE tegnes som egne Claw-skjermer for Team Norway. De er
  Train-lock-fasit, som resten av PlayerHQ/AgencyOS — Team Norway arver kun logo, skinnefarge
  (navy `#012B5D` / rød `#D70232`) og handlingsfarge oppå. Ingen egen tegning av selve
  analyse-/DataGolf-innholdet.

  **Begrunnelse (Anders' avveining, etter side-ved-side-sammenligning publisert som artifact
  31.08.2026):** en TN-spiller er samtidig vanlig PlayerHQ-bruker med ett DataGolf-kort/én
  analyseflate — to fasiter for samme funksjon ville gitt spilleren to ulike skjermer avhengig av
  inngang (`/portal` vs. `/team-norway`), og dobbel vedlikeholdsjobb hver gang datamodellen
  (f.eks. `hentDataGolf()`) endres. Train-lock-versjonen finnes allerede i kode og er live
  (`src/components/portal/v2/DataGolfV2.tsx`, `src/app/portal/analysere/datagolf/page.tsx`,
  levert som del av T6 16.08.2026) — «Train-lock med TN-skinn» krever ingen ny tegnejobb for
  selve innholdet, kun at organisasjonens logo/aksentfarge legges oppå.

  **Upåvirket:** de 8 TN-egne skjermene levert 31.08 (Oversikt, Fellestesting, Uttak, Rangliste,
  Skoleoversikt, Protokollbibliotek/-detalj, org-skallet) har intet PlayerHQ/AgencyOS-motstykke —
  de forblir egne Claw-tegninger, uendret av denne beslutningen.

  **Arbeid:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 11, rad N12 (utvidet) og ny rad N12b
  (TN-skinn på Analyse/DataGolf-rutene).

- **SG-STIGEN: NORSK JUNIORSCORE KALIBRERES MOT EKTE DATAGOLF-SG (Anders 31.08.2026, i økt):**
  norsk turneringsscore skal plasseres på **samme SG-skala som proffene**, kalibrert gjennom
  spillere som faktisk har spilt begge steder — ikke gjennom en publisert tabell.
  **Overstyrer bruken av `src/lib/stats/sg-estimator.ts` som referanse:** den bygger på
  Broadie (2014) «Every Shot Counts», en hardkodet HCP-tabell med sju rader og forutsetning
  «standard PGA-bane, par 72, ~7 200 yds» (verifisert i koden 31.08). Den er et ballpark-estimat
  om en gjennomsnittlig amatør, ikke en måling av en norsk junior. Filen slettes ikke — den
  beholdes til den er erstattet, og alt den produserer merkes **estimat** (TruthLayer, PRODUKTRETNING
  pkt. 7) inntil kalibreringen er på plass.
  - **Broen finnes allerede i basen (målt 30.08):** alle **22 529 Nordic League-rader har `dg_id`**,
    og `dashboard.dg_rounds` har **komplett SG på 962 208 runder** fordelt på 21 tourer.
    Kalibreringen går derfor gjennom ekte mennesker med data på begge sider, ikke gjennom antakelser.
  - **Grunnvalutaen er feltstyrke-justert score:** spillerens til-par mot feltsnittet i samme
    turnering, lest fra `dashboard.mv_topar_grunnlag` (STEG 16.1, 123 257 rader). Dette er den
    eneste størrelsen som er sammenlignbar på tvers av bane, tee, klasse og år.
    **Plassering er fortsatt forbudt som persentil** (uendret fra DATAKARTLEGGING).
  - **Hvorfor dette er fortrinnet:** DataGolf kan kjøpes av hvem som helst og GolfBox-resultater er
    offentlige. Det ingen andre har, er at begge lagene ligger i samme base om de samme menneskene.
    Koblingen er produktet — ikke datakilden.
  - **Tre grenser som SKAL sies i UI, ikke skjules:** (a) norsk data har score, aldri SG-fordeling —
    vi kan si «hvor», aldri «hvorfor» fra en GolfBox-runde; fordelingen finnes kun for egne spillere
    (TrackMan/runderegistrering) og for proffer. (b) Jenter har ingen proffreferanse: alle 26 tourer
    i lageret er herretourer. (c) Aldersstigen gjelder fra 16 år og oppover.
  - **Tallet oppgis alltid med usikkerhet.** Ett punktestimat uten spenn er TruthLayer-brudd —
    samme grunn som opprykksanalysen ble lukket 30.08.
  - **Arbeid:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 16.9–16.11.

- **TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN, IKKE TRAIN-LOCK (Anders 30.08.2026, i økt):**
  Anders leverte TN-brandingsystemet han varslet 30.08 (17.6), og valgte det som fasit for Team
  Norways egne skjermer. Fasit er Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
  (`a03bf94a-c923-4c04-82ff-415773557e37`), speilet i repoet som `designsystem/team-norway/`.
  - **Verdier:** navy `#012B5D` + rød `#D70232` (begge målt fra logofilen) · Schibsted Grotesk
    (display + body) + IBM Plex Mono (alt som måles) · lys flate er standard, **mørk `#06111F` er
    en ROLLE** — hero, seksjonsskille, presentasjon — aldri et tema · radius 6/10/14/20/28/999 ·
    tre skyggenivåer · romskala 2→128 · diagonalen (56px) på hero og seksjonsskille, aldri på kort
    eller kontroller · aldri `ease-in` på grensesnitt.
  - **`--ink-400` (`#647280`) er lyseste gråtone som får bære tekst.** `--ink-300` og lysere er
    kanter og linjer. Gjelder også 9–11px etiketter.
  - **Merkevarerød er identitet, aldri status.** Logo, skinne, «denne utøveren» i data. Status
    bruker `#C2352B` sammen med grønn og ravgul. Dette er samme regel som N-D2 — de to systemene
    landet uavhengig på den.
  - **Konsekvens:** `templates/tn-workdesk/TnBatch1.dc.html` (TN-01 Hjem, TN-02 Gruppe/spillerliste,
    TN-03 Spiller-ark) er tegnet i Train-lock mørk og **skal tegnes om** i Claw-stil. Verifisert
    i prosjektet 30.08: filen bruker `#000000`, Poppins, `#8E8E93` og rail 232px.
  - **Arbeidsdelingen mot Train-lock:** Train-lock eier plattformflatene (PlayerHQ, AgencyOS,
    Forelder). Claw eier `/team-norway/*`. **Ingen skjerm har to fasiter.** Dette overstyrer
    N7-formuleringen «tegn organisasjonsflaten i Train-lock» for Team Norways del.
    **Presisert 31.08.2026** for Analyse og DataGolf spesifikt — se §ANALYSE OG DATAGOLF FOR
    TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN over: de er delte plattformflater (Train-lock), ikke
    `/team-norway/*`-egne skjermer, selv om TN-menyen lenker til dem.
  - **`SKILL.md` i Claw-pakken er UTDATERT og skal ikke følges.** Den sier «ingen skygger, ingen
    piller» og oppgir Jost + Public Sans. Systemet slik det faktisk er bygget har tre skyggenivåer,
    `--radius-full` og Schibsted Grotesk. `readme.md` + `tokens/` er fasit.
  - **Uavklart, ikke antatt:** WANG-flatenes stil er IKKE avgjort av denne beslutningen. WANG har
    eget system (`src/styles/wang-tokens.css`, `.wang-tp`, enpalett lys). Se beslutningskøen.

- **TN-RØDT LÅST TIL `#D70232` (Anders 30.08.2026, i økt):** målt fra logofilen
  (`designsystem/team-norway/assets/logo/team-norway-golf-original.jpg`) — eneste verdi med
  sporbar opprinnelse i selve merket. **Overstyrer N-D2s `#D50431`**, som ikke har oppgitt kilde
  og ligger 2 % unna. Navy er `#012B5D` av samme grunn.
  De to andre verdiene som sirkulerer i `akgolfsoftware/talenthq` er **plassholdere, ikke logoen**:
  `#BA0C2F`/`#00205B` er Pantone 200/281 — det norske flaggets spesifikasjon, ordrett. `#EF2B2D`/
  `#002868` er «Old Glory Red»/«Old Glory Blue» — det amerikanske flagget. Begge SVG-ene er
  dessuten håndtegnede tilnærminger med feil strekproporsjoner.
  **Gjenstår:** ekte vektorlogo fra NGF. Dagens PNG er beskåret fra en JPEG med
  kompresjonsartefakter. Til da er den fasit.

- **TEGN SKJERMEN FØR DU BYGGER DEN (Anders 30.08.2026, i økt):** hver skjerm som skal
  bygges eller bygges om, tegnes først som en Claude Design-canvas Anders ser og godkjenner.
  Ordrett: «Dette du nå har gjort skal vi gjøre for alle skjermer videre.» Utløst av
  Kø-canvasen (MASTERPLAN 15.1) — den ble tegnet fordi det ikke fantes noen Train-lock-fasit
  for en samlet Kø-side, og Anders valgte tegning framfor at det ble bygget på gjetning.

  **Slik gjøres det, hver gang:**
  1. **Verdiene hentes fra koden, ikke fra hukommelsen** — `src/styles/train-lock-tokens.css`
     og komponenten som allerede finnes for nærmeste skjerm. Aldri en farge eller et mål
     «omtrent».
  2. **Fire visninger på en BYGGEKLAR canvas:** Mac 1440 og mobil 390, lys og mørk.
     Beslutningen 26.08 («alle skjermer skal ha lys og mørk») gjør begge obligatoriske,
     og 6.1 gjør mobil til den viktigste — Anders skanner stående på treningsfeltet.
     **Et RETNINGSUTKAST** — bredt, mange skjermer, for å velge inndeling før noe bygges —
     klarer seg med Mac, pluss mobil for skjermene Anders bruker daglig. Får utkastet ja,
     tegnes det ferdig i bygge-PR-en. Skillet er presisert 30.08.2026 og står i
     `designsystem/canvas/README.md`; uten det ville regelen stoppet bredden.
  3. **Tom tilstand tegnes på byggeklar canvas.** Det er den han møter når arbeidet er
     unnagjort.
  4. **Ekte norsk skjermtekst.** Aldri lorem ipsum. Tall som ikke er målt i basen,
     sies eksplisitt å være eksempler.
  5. **Arbeidsfilene bor i repoet**, `designsystem/canvas/<skjerm>/` — ikke i en
     scratchpad. Uten det dør tegningen ved neste `/clear` og neste økt starter på nytt.
  6. **URL-en sendes i samtalen.** Anders jobber ofte fra mobil; en filsti når ham ikke.

  **Forholdet til de to andre design-reglene:** finnes en tegnet Train-lock-fasit for
  skjermen, er den fortsatt fasit (CLAUDE.md invariant 2) — canvasen gjenskaper den i den
  sammenhengen skjermen faktisk skal stå i. Skjermbilde-gaten (04.08) gjelder uendret, men
  ETTER bygging: canvas før, skjermbilde av den kjørende appen etter. De erstatter ikke
  hverandre.

  **Konsekvens for planen:** STEG 2.6 var blokkert av «Anders + designer» fordi 38 ruter
  manglet design. Tegningen skjer nå i økten, så den blokkeringen faller bort for skjermer
  uten fasit. Se MASTERPLAN STEG 2.6 og 2.11.

- **DATAKARTLEGGING — fire svar + bindende dataregler (Anders 2026-08-30, i økt):**
  fullt grunnlag med alle måletall: `docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md`.
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 16 — bygg derfra.**

  **Anders' fire svar:** (1) `/stats/aargang` flyttes bak innlogging — den er en åpen
  kohort-utforsker for 2000–2012, altså nøyaktig det barnevern-regelen forbyr; den slettes ikke,
  men flyttes til gratis-konto-laget. (2) **Kjønn SKAL legges til som felt** — først i
  datamodellen, så manuelt for Anders' egne spillere (WANG, GFGK, Academy), så utledning fra
  klassekode som EKSPLISITT MERKET supplement (dekker kun 26 % og gir systematisk skjevhet:
  200 jenter mot 2 066 gutter), med NGF/GolfBox som mål. Uten kjønn er enhver kullsammenligning
  villedende for halve gruppen. (3) **Fail-closed på fødselsår gjelder KUN ikke-DataGolf-spillere**
  — norske turneringsspillere må ha fødselsår OG være myndige for åpen visning; DataGolf-proffer
  er voksne på offentlige tourer og unntas. (4) **Stripe-koblingen sikres framover, historikken
  godtas** — webhooken fikses nå; de 49 betalingene før 1. sep forblir uten kobling.

  **Bindende dataregler — brytes disse, blir tallene feil:**
  - **Til-par leses fra `public_player_entries.scoreToPar`** (utfylt på 97,5 % av gyldige norske
    runder, allerede banenormalisert). **Par skal ALDRI utledes fra `public.baner` og påføres
    juniorrunder** — treffer i 39,7 %, systematisk avvik −1,02 slag fordi juniorer spiller kortere
    tee. Ville framstilt juniorer 1–7 slag dårligere.
  - **Netto-filter er en HVITLISTE av 13 faktiske nettokoder, aldri mønsteret «ender på N».**
    Mønsteret treffer også `Open` (22 529 rader), `Mann` og `A-klassen` — 26 % av tabellen.
    Klassekode finnes KUN i `dashboard.tournament_results`, ikke i `public`-tabellene appen leser.
  - **`position` skal ALDRI brukes som persentil** — det er plassering INNEN KLASSE, og 1 976 av
    2 044 norske turneringer har flere enn én på plass 1. Bruk feltstyrke-justert score.
  - **Aldersstige bygges fra 16 år og oppover** — under 16 er den ikke monoton (tee-effekt).
  - **Volumtall til NGF sies som +24,3 %** (målt på OLYO alene), ikke +54 % som flerkilde-tallet gir.
  - **Datahelse leses fra `public.agent_runs`**, ikke `dg_sync_state` (sistnevnte rapporterer 0 %
    feil og er ikke til å stole på).
  - **`mv_cohort_baselines` skal IKKE vises før den er rettet** — flerrundetotaler behandlet som
    enkeltrunder (J19 2025: snitt 155,3).
  - **Klubb og klassekode kastes i scraperen** (`src/lib/scrapers/golfbox.ts:223` parser
    `ClubName` og forkaster det). Én pipeline-endring gir både klubbdimensjonen og ekte
    brutto-garanti.

  **Ikke bygg:** plassering som persentil · par påført fra baneregisteret · aldersstige under
  16 år · sesongform som populasjonskurve · regionkart presentert som nasjonalt · banevanskelighets-
  indeks per bane · kohort-persentil til spiller/forelder/åpen flate (svar 3 i PRODUKTRETNING) ·
  odds/prognoser/fantasy. Proffreferanse for jenter er ikke mulig — alle 26 tourer i lageret er
  herretourer; det er et produktvalg, ikke en skjerm som kan bygges.

  **Opprykksanalysen — LUKKET 30.08.2026, skal ikke bygges som tall.** Etterprøvd i basen samme
  dag: valget «ett nivå eller flere per spiller-år» var ikke problemet. Juniorer forbedrer seg
  hvert år uansett nivå — opprykkere −1,64 slag, men de som ble værende −1,13 og de som rykket ned
  −1,14. Netto effekt ~0,5 slag, ikke 2, og med alder inne **skifter den fortegn** (+1,99 ved 14 år,
  −1,16 ved 18, 10–96 spillere per alderstrinn). Å publisere ett tall her ville vært TruthLayer-brudd.
  Står nå på «Ikke bygg». Ønskes den likevel: kontrollgruppe + aldersjustering + usikkerhet oppgitt.

  **Venter på Anders:** MD-fila med turneringer og lenker. Blokkerer nå KUN lenkene per turnering
  (`dashboard.tournament_links` er tom) — resten av landskapsanalysen kan bygges uten den, se
  MASTERPLAN 17.5a.
- **GRILLINGEN RUNDE 6 — Anders' arbeidsdag og AgencyOS-arkitekturen (Anders 2026-08-30, i økt):**
  ni svar som låser hva AgencyOS skal være. Fullt grunnlag med alle måletall og begrunnelser:
  `docs/beslutningsgrunnlag/grillingen-runde6-2026-08-30.md`.
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 15 — bygg derfra.**

  **Forbehold Anders ga:** ingenting i AgencyOS-/PlayerHQ-arkitekturen er låst — heller ikke
  railens fem punkter. Svarene er retningsgivende produktbeslutninger, ikke en fredet IA.

  1. **Mandagen begynner ikke foran en skjerm.** 08:00–10:00 trening med WANG, ettermiddag/kveld
     privattimer. Maskinen åpnes i mellomrommene. **AgencyOS' morgenflate er en mobilflate** —
     den skal kunne skannes stående på treningsfeltet, ikke være en dashboard-vegg.
  2. **Kø = alt som krever Anders i dag.** Ikke bare ja/nei-saker: e-post, SMS, forespørsler,
     tilbakemeldinger, oppfølginger og godkjenninger. Stedet han kommer à jour.
  3. **Spillerplanen er alltid kanonisk; gruppe er en planleggingsmodus.** Gruppeøkta planlegges
     i grupperegi, men lagres i hver spillers plan med alle detaljer. **Én økt kan være delt** —
     WANG 08:00–10:00 kan ha første time individuell og siste 45 min felles. Hver blokk
     spesifiserer ansvarlig trener (AK Golf Academy / Team Norway / annen WANG-trener).
  4. **Workbench åpner på spillerlisten med ukestatus** (uendret fra PRODUKTRETNING pkt. 6).
  5. **Stall-lista: navn, neste økt, siste aktivitet, én varsel-prikk.** SG-form, plan-etterlevelse,
     hcp, pakke og skyldig beløp flyttes inn i spillerkortet — de er lese-informasjon, ikke
     skanne-informasjon. Prikk: fylt = trenger deg, åpen = følg med, ingen = på planen.
  6. **Oppgaver og Kø er to ulike ting, skilt av TID.** Kø = i dag, krever meg. **Oppgaver** =
     prosjektstyring og rutiner (Notion-modellen): oppgaver knyttet til prosjekt, pluss
     gjentakende rutiner (daglig/ukentlig/månedlig) som «rydd driving range». Hver rutine merkes
     **kan automatiseres** eller **må gjøres fysisk**. `/admin/queue` (spiller-signaler) er verken
     Kø eller Oppgaver — det er oppfølging, og hører hjemme i Stall.
  7. **Jarvis forbereder alt, sender ingenting.** Gjør selv uten å spørre: sortere e-post/SMS inn
     i Kø, skrive svarutkast, foreslå økter, oppdage avvik, forberede møteunderlag, rydde data.
     **Krever ALLTID Anders' ja:** sende e-post/SMS, bekrefte booking, publisere økt til spiller,
     dele noe med forelder, og alt som koster penger. Regelen i én setning: **alt som forlater
     huset eller endrer noe for et menneske, krever ja.**
  8. **Push-varsler til coach — tre kategorier:** (a) noen venter på svar nå, (b) dagen endrer seg,
     (c) penger. **Spillerens fremgang og avvik skal IKKE pushes** — det haster aldri i minutter
     og hører hjemme i Stall.
  9. **ÉN INNGANG PER FUNKSJON.** Anders avviste kutt som mål: «målet er ikke nødvendigvis å
     kutte, men at vi har alt forenklet, slik at det ikke er fem forskjellige innganger til samme
     funksjon». **Regel: hver funksjon har nøyaktig én adresse. Det som i dag er egne sider blir
     faner eller paneler inne i den ene siden. Ingen funksjonalitet fjernes; alle gamle adresser
     blir redirects.** Konsolideringslista (42 skjermer → 10 funksjoner) og rekkefølgen står i
     MASTERPLAN STEG 15. `/admin/talent/*` er per beslutningen 26.08 uansett feilplassert —
     talent-flatene skal bo under `/innsyn`, aldri i AgencyOS-menyen.
- **GRILLINGEN RUNDE 2 — fire svar + nullstilt base (Anders 2026-08-30, i økt):**
  **Arbeidet er ført inn i MASTERPLAN: bruksmåling = STEG 16.3, foreldre-booking = STEG 9.8,
  DataGolf-attribusjon = STEG 0.9 (gjort). Nullstillingen er utført og krever ingen bygging.**
  oppfølging av 112-spørsmålsdokumentet («Grillingen», artifact `6ef6f807`). Alle
  målinger verifisert i produksjonsdatabasen 30.08.2026 før beslutning.

  1. **BRUKERBASEN ER NULLSTILT FØR LANSERING (utført 30.08.2026).** Alle brukere
     slettet unntatt Anders (`akgolfgroup@gmail.com`), Markus (`markus@akgolf.no`)
     og demo-spilleren Øyvind Rohjan (`screentest@akgolf.test`, beholdt fordi
     skjermbilde-gaten krever innlogget testbruker med data). 42 app-brukere,
     28 auth-kontoer og all eid data (runder, tester, TrackMan-økter, bookinger,
     abonnement-rader) er slettet; foreldreløse testbookinger ryddet i samme økt.
     Grunnlag: hele basen var verifisert testdata — 0 av 38 spillere innlogget
     siste døgn, 0 Stripe-abonnement, eneste spiller med treningsdata var
     demo-brukeren. Turneringsbasen (7 274 turneringer, 941 245 resultater)
     er uberørt. Konsekvens: 1. september starter med reell base = 0, og
     spørsmålet «hva skjer med eksisterende gratisbrukere» (grillingen 11.5)
     er bortfalt. Kjent skavank fra før: screentest-brukerens `authId` peker
     ikke på noen auth-konto — skjermtest-innlogging må verifiseres ved neste
     skjerm-PR.
  2. **Bruksmåling bygges nå (grillingen 1.7).** Minimal daglig aktiv-måling:
     én rad per bruker per aktiv dag (userId + dato), skrevet ved innlasting av
     `/portal`, pluss et lite kort i AgencyOS («X brukte appen i går / denne uka /
     ikke åpnet på 30 dager»). Ingen tredjepartsverktøy, ingen cookies. Motivasjon:
     aktivering og frafall må måles fra dag én av betalt drift, ikke gjettes.
  3. **DataGolf-attribusjon fikses denne uka (grillingen 9.8).** «Powered by
     Data Golf» inn på alle offentlige statistikksider (~45) og på spillerens
     DataGolf-kort. Dette er et løpende lisenskrav uavhengig av live-siden.
  4. **Foreldre skal kunne booke time for barnet (grillingen 11.2).** Full
     booking-opprettelse fra forelderportalen (ikke bare forespørsel), bygges
     etter 1. september. Forelderen er ofte den som faktisk administrerer
     juniorens timer, og booking av enkelttimer ligger i gratisnivået.

- **LIVE-SIDEN: TO-LAGS-MODELL (Anders 2026-08-30, i økt):** besvarer grillingen
  9.1, 9.2, 9.5, 9.6 og 9.7 i én beslutning.

  1. **Åpent lag (uten innlogging):** DataGolf-proffdata (alltid med «Powered by
     Data Golf»), egne spillere med aktivt samtykke, og myndige spillere. Formål:
     rekruttering og synlighet — siden skal selge gratisnivået, ikke være en
     nøytral resultattjeneste.
  2. **Barnevern-regel på ALLE åpne flater:** spillere født 2008 eller senere
     uten aktivt samtykke vises aldri offentlig; mangler fødselsår → vises ikke.
     Gjelder også de eksisterende ~45 offentlige statistikksidene, som må få
     samme filter.
  3. **Gratis konto-laget:** norske turneringer i bredden, juniorresultater og
     «følg spiller» ligger bak gratis innlogging. Registreringen er trakten mot
     299 kr/mnd, og innlogget visning til berørte (forelder/trener/spiller) er
     juridisk en tjeneste, ikke masse-republisering.
  4. **GolfBox:** offisiell avtale søkes via Anders' NGF-kontaktpunkter FØR bred
     åpen visning av GolfBox-data. Intern/innlogget bruk fortsetter som i dag.
     Begrunnelse: databasevernet beskytter GolfBox' samling selv om hvert
     resultat er offentlig, og en konflikt ville truffet Team Norway-relasjonene.
     E-postutkast til NGF: Anders ba om det senere, ikke i denne økten.
  5. **Datahygiene (grillingen 9.10) anses løst:** selvhelbredende
     turneringsstatus virker — 30.08 står 5 turneringer som pågående, ingen med
     passert sluttdato, og «AVLYST»-raden er korrekt CANCELLED.

- **FORRETNINGSMODELL: SPILLERLISENSER (Anders 2026-08-30, i økt):** binder
  sammen PlayerHQ-abonnementet og organisasjonene (WANG/Team Norway). Kjernen:
  spilleren eier profilen og abonnementet — organisasjonene betaler aldri for
  plattformen, kun for spillerlisenser.

  1. **Gratis PlayerHQ-profil** = testdata, turneringsdata og statistikk — og
     det er GRATIS å dele dette trinnet til organisasjoner. Plattformen fungerer
     dermed som kartleggingsverktøy for WANG/TN uten betalingsterskel.
  2. **FULL (299 kr/mnd)** = alle funksjoner + mulighet for komplett
     profildeling.
  3. **Deling i to trinn per organisasjon** (grillingen 7.4 avgjort): trinn 1 =
     tester + turneringer + statistikk (gratis å dele); trinn 2 = komplett
     profil — treningsplan, TrackMan, analyse, fremgang (krever FULL). Spilleren
     (forelder for mindreårige) styrer trinn per organisasjon og kan trekke når
     som helst. To brytere, aldri ti.
  4. **Team Norway-spillere har KRAV om komplett PlayerHQ (FULL).** TN eller
     WANG kan betale lisensen for spilleren — organisasjonsbetalt abonnement er
     lisensmodellen. Organisasjonene betaler aldri for Workdesk/plattform i seg
     selv.
  5. **WANG Fredrikstad er gratis** — Anders jobber der og har private spillere
     der; inkludert i kontrakten. **Alle andre WANG-skoler betaler** —
     spillerlisenser til øvrige WANG-skoler er et eget B2B-marked.
  6. TN-farge/branding: Anders lager komplett brandingsystem selv (leveres
     separat, samme dag) — TN-bølgen tegner ingenting før det foreligger.

- **INNSIKT PER SPILLER — de fire spørsmålene (Anders 2026-08-30, grillingen
  10.1):** coach-flaten Innsikt bygges for å svare på disse, i denne rekkefølgen.
  Alle fire har ferdigbygd eller eksisterende datagrunnlag.

  1. **Utvikler hen seg raskt nok?** Vekstrate år for år mot eget utgangspunkt,
     med kohortens snitt som coachens (skjulte) referanse — analysen ligger
     ferdigbygd uten skjerm.
  2. **Hvor kan hen nå?** Spillerens bane lagt oppå historiske løp («slik lå
     Hovland/Reitan da de var 17») — godkjent for spillerflaten i
     produktretning pkt. 4, bygges også i coach-visning.
  3. **Tåler hen konkurranse?** Gapet mellom turneringsscore og trenings-/
     testnivå, og om gapet øker eller minker over tid.
  4. **Riktig turneringsprogram?** Konkurransevolum og motstandsnivå målt mot
     utviklingen, koblet til A/B/C-prioriteringen som finnes i modellen.

- **TEAM NORWAY-WORKDESK — spesifikasjon (Anders 2026-08-30, i økt):**
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 17 — bygg derfra.** TN-siden
  utvikles til et komplett arbeidsområde som erstatter Messenger-grupper, e-post
  og Word/Excel. Bygger på org-flate-grunnmuren fra bølge N og samtykke-stakken
  (`src/lib/auth/ekstern-leser-scope.ts`).

  1. **Pilot høsten 2026:** Anders + 2–5 navngitte TN-trenere får konto, med
     tilgang kun til egne grupper; spillere inn via samtykke. Bevis på én
     samling før utrulling.
  2. **Forretningsmodell: gratis pilot 2026/27 → avtale fra 2027** hvis TN tar
     den i bruk — sies høyt fra start. NGF som referansekunde er inngangen til
     klubbmarkedet (Fredrikstad Total-sporet). PRESISERT senere samme økt:
     avtalen gjelder SPILLERLISENSER, ikke plattformleie — se blokken
     «FORRETNINGSMODELL: SPILLERLISENSER».
  3. **Dataansvar: AK Golf eier alt.** (Anders valgte bort «organisasjonen
     eier»-modellen.) Konsekvens: hver TN-spiller/forelder samtykker direkte til
     AK Golf, og GolfBox-bruken forblir AK Golfs ansvar (innlogget bruk = lav
     risiko; avtale søkes per live-siden-beslutningen). Dataansvaret må
     avtalefestes når lisensavtalen kommer i 2027.
  4. **Rekkefølge: egen TN-bølge ETTER bølge N-kjernen.** Lansering 1. sep og
     bølge N går først; denne spesifikasjonen er byggeordren for TN-bølgen.
     WANG-elevene onboardes i september uavhengig av dette (PlayerHQ, ikke
     Workdesk).
  5. **Kommunikasjon: poster, ikke chat.** Trener poster til gruppe og til
     enkeltspiller — med video, bilder, lenker og vedlegg (flybilletter,
     hotellreservasjoner o.l.). Coach jobber direkte i plattformen, aldri via
     Word-vedlegg. Ingen fri chat. 1:1-poster til mindreårige skal være
     sporbare og synlige for forelder (idrettens åpenhetsprinsipp).
  6. **Testprotokoller deles på tvers av AK Golf, WANG og Team Norway:** en ny
     protokoll (f.eks. putt- eller TrackMan-test) opprettes én gang og deles
     mellom organisasjonene. Driftsmodellen for endringer SKAL spesifiseres i
     planen (Anders eksplisitt): anbefalt løsning er versjonerte protokoller
     som låses ved første bruk — resultater peker på versjonen, endring gir ny
     versjon, eierorganisasjonen endrer, delte mottakere bruker.
  7. **«Kartlegging av spillere» = landskapsanalyse av norsk juniorgolf**, ikke
     internt register: antall Olyo Tour-/Srixon Tour-spillere per region, nivå,
     konkurranser per år, hvilke klubber som har flest spillere per klasse.
     Datagrunnlaget finnes (941k resultater + ferdigbygde klubbaggregater og
     kohortanalyser uten skjerm). Anders leverer MD-fil med alle turneringer og
     lenker som spesifikasjon — bygging venter på den.
  8. **Dokumenter: fildeling per gruppe MED lesekvittering** («12 av 14 har
     åpnet uttakskriteriene») og «sist oppdatert»-merking.

- **WANG/TEAM NORWAY — fire svar (Anders 2026-08-30, i økt):** grillingen runde 7.

  1. **WANG-elevene og GFGK-juniorene blir fulle PlayerHQ-brukere i høst (7.2):**
     foreldresamtykke først, deretter invitasjon til gratisnivået; Anders
     planlegger øktene deres i Workbench; organisasjonsflaten leser via
     samtykkemodellen. De er de første ekte brukerne, før markedsføringen starter.
  2. **«Karaktermatrisen» er Anders' egen sportslige vurdering — IKKE
     skolekarakterer (7.7).** Bygges som coach-vurdering i elevoppfølgingen.
     Heter «vurdering» i UI, aldri «karakterer». Skolens karakterer holdes helt
     utenfor appen (skolens domene).
  3. **Test-føringsskjermen bygges, med fysiske tester som primærcase (7.5):**
     på testdager føres fysiske tester i bulk — 10+ elever etter tur på samme
     øvelse (benkpress-eksempelet). Øvrige protokoller føres oftest én-til-én,
     men parallellføring skal være mulig for alle protokoller. Design: velg
     protokoll → før spiller for spiller i kø.
  4. **NGF-samarbeidet er produktleveranse, ikke rapportplikt (7.3):** ingen har
     bestilt data av Anders. Produktet lages på vegne av WANG Toppidrett og
     NGF-samarbeidet, der Anders er ressurs for begge. Ambisjonen: Team
     Norway-siden utvikles til et komplett arbeidsområde («Workdesk») — tester,
     DataGolf-integrering, GolfBox-resultater, kartlegging av spillere, grupper
     med kommunikasjon, egne tester, dokumentdeling, samlingspunkt — som
     erstatter e-post/Word/Excel. Egen grilling/spesifikasjon kjørt samme økt;
     svarene låses i egen blokk.

- **PRODUKTRETNING — åtte svar (Anders 2026-08-30, i økt):**
  **Datagrunnlaget er STEG 16; Innsikt-skjermene er N12 (STEG 11).** Grunnlaget for Innsikt
  (AgencyOS) og Analyse (PlayerHQ). Bygg mot disse, ikke mot gjetning.

  1. **Coachens hovedspørsmål er «hvor taper spilleren slag».** Innsikt bygges rundt
     slagfordeling som oversettes til trening — ikke rundt etterlevelse, ikke rundt
     rangering. De andre spørsmålene kan finnes, men de eier ikke skjermen.
  2. **Slagtapet måles mot SPILLEREN SELV over tid**, ikke mot proffnivå, ikke mot
     jevnaldrende, ikke mot coach-satte mål. «Hvor har hen blitt bedre eller
     dårligere enn seg selv.» Konsekvens: kjernen i Innsikt trenger KUN spillerens
     egne runder — den er ikke blokkert av identitetslaget.
  3. **Kohort-sammenligning er coachens verktøy alene.** Spilleren ser ikke sin
     persentil i årskullet. Foreldre og eksterne lesere ser den ikke. Anders
     formidler den muntlig når han vil.
  4. **Spillerens «hvor står jeg» = egen utvikling + egen turneringshistorikk +
     veien til de som lyktes.** Historiske baner for navngitte spillere (Hovland,
     Reitan: «slik lå de da de var 17») er GODKJENT for spillerflaten. Det er ikke
     i strid med punkt 3: å speile seg i en historisk karriere er noe annet enn å
     bli rangert mot sitt eget kull.
  5. **AgencyOS-morgenskjerm: kø øverst, dagens plan under.** Kø er handlingslista
     og hovedsaken; dagen er orientering. Avvik nås via Stall, ikke her.
  6. **Workbench åpner på spillerlisten med ukestatus** (planlagt/utkast/publisert
     per spiller), ikke på en mellomside og ikke på sist brukte spiller.
  7. **TruthLayer = målte tall, aldri synsing.** Ikke en skjerm og ikke et
     produkt: et kvalitetsprinsipp for hele plattformen. Alt appen påstår om en
     spiller skal kunne spores til en måling med **dato og kilde**, og estimerte
     tall skal merkes eksplisitt som estimat. Gjelder Innsikt, Analyse, tester,
     fys-score og alt annet som viser et tall om et menneske.
  8. **Prøveuka krever kort og bor i Stripe** (samme dag, se BUSINESS-RULES
     §Abonnement). Gratisnivået — testbatteri, DataGolf-verktøy, runde- og
     statistikkføring, booking av enkelttimer — er permanent og er
     hovedbudskapet i markedsføringen, ikke prøveperioden.

  **Rekkefølge-konsekvens:** fordi referansen er spilleren selv (punkt 2), kan
  Innsikt bygges FØR identitetslaget. Identitetslaget kreves fortsatt for punkt 4
  (spillerens egen turneringshistorikk + historiske baner) og for coachens
  kohorttall (punkt 3), men det blokkerer ikke kjernen lenger.

- **TALENTHQ AVVIKLES SOM EGET PRODUKT — ALT SAMLES I PLAYERHQ (Anders 26.08.2026,
  rest-låst 28.08):** den gamle appen (`akgolfsoftware/talenthq`, mappe
  `~/Developer/ak-golf-talenthq`) skal ikke utvikles videre. Merkenavn: alt heter
  PlayerHQ; «talent» kun som ord på skjermer. Gratis-brukeren er PlayerHQ sitt
  TALENT-nivå (`resolveTilgang`). WANG og Team Norway får **egne flater** (utvidelse
  av `/innsyn`), aldri AgencyOS-menyen. PEI = nærhet ÷ lengde, lavere er bedre.
  Pipelines bor i `akgolfsoftware/ak-golf-pipelines`. Team Norway-rød kun på logo
  og skinne (ikke som status). ~23 skjermer skal med, ikke 70. **Arkiveres ikke** før
  datahenting har kjørt grønt minst én uke fra pipeline-repoet og skjermene er inne.
  Fasit og 10-stegs rekkefølge: `natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`.
- **ALLE SKJERMER I PLAYERHQ, AGENCYOS OG FORELDER SKAL HA LYS OG MØRK MODUS
  (Anders 2026-08-26, i økt):** løser forelder-omfangsspørsmålet (T4 i AAPNE-SPORSMAAL) —
  forelder-appen er IKKE unntatt Train-lock, hele appen porter med fungerende
  lys/mørk-toggle, ikke bare ett kort. Konsekvens for T-bølgens lys-spørsmål (T-S5):
  siden bare 9 av 39 AgencyOS-skjermer med fasit har tegnet lys, er **mekanisk avledet
  lys fra `--tl-*`-tokensettet godkjent** som metode der ingen tegnet lys-fasit finnes —
  å vente på 30+ nye tegninger er ikke forenlig med kravet om lys+mørk overalt. Se
  `docs/natt/D-LYS-OG-5T-BESLUTNING.md` for grunnlaget. Denne beslutningen sier at BEGGE
  moduser må virke — den endrer ikke hvilken modus som er *default* uten cookie noe sted.
- **MØRK DEFAULT PÅ /portal OG /admin (Anders 2026-08-25, i økt):** produktflatene er
  mørke uten cookie. Train-lock er mørk-først (scene `#000000`, lys er varianten), og
  lys-defaulten fra 25.07 — begrunnet med «mørk skjerm er vanskelig å lese utendørs i
  sollys» — er nå brukerens valg via bryteren, ikke appens default. Dette besvarer åpent
  spørsmål 1 i `natt/D2-TOKENS-DONE.md`. Regelen bor i **`src/lib/v2/tema-default.ts`**
  (`onsketTema`), kalt av både rot-layout (SSR) og `V2Shell` (rute-veksling) — den var
  duplisert i to filer, som er en driftsfelle. **Uendret:** `/auth` er LYS (låst PP-A/A4
  16.08), landingssidene alltid lyse, resten mørk som før. `/forelder` er fortsatt LYS
  som default uten cookie (uendret av 26.08-beslutningen over — kun kravet om at mørk
  MÅ virke der også, er nytt). Bryteren (`ak-v2-tema`) vinner over defaulten begge veier.
  Låst av `src/lib/__tests__/tema-default.test.ts`.
- **FONT: POPPINS BEHOLDES — OGSÅ I PRODUKTET (Anders 2026-08-25, i økt):** fasitens
  «SF Pro Display/Text» tas IKKE i bruk. Poppins/Lora/IBM Plex Mono består som appens
  eneste fonter; fra Train-lock arves skala, vekter og tracking, ikke familien.
  `--tl-font-sans` → `var(--font-poppins)`, `--tl-font-mono` → `var(--font-ibm-plex-mono)`
  (`src/styles/train-lock-tokens.css`). Dette overstyrer #588-svaret «SF Pro i produktet»
  (D2-UNDERLAG §5) fra tidligere samme dag. Ikke gjeninnfør en fjerde font.
  Train-lock er eneste designfasit for hele produktet — både PlayerHQ og AgencyOS, alle
  skjermer. Claude Paper (`605a48cc` / `designsystem/paper/`) er HISTORIKK/arkiv, aldri
  bygg-fasit. Dette superseder «Design-fasit er Claude Paper 1:1» (04.08), «Design-kilde —
  PAPER VINNER ALLTID» (05.08) og look/palett-delene av PP-A (16.08) — PP-A sine
  IA-/strukturbeslutninger (A1 rail-struktur, A2 master–detalj-mønsteret, desktop=fasitens
  visning, landscape-overlay) står inntil Train-lock-fasiten sier noe annet. Skjermbilde-gaten
  (04.08) og «Enkelhet/færrest trykk» gjelder uendret. **Begge forutsetningene er levert 25.08:**
  fasiten ligger i `designsystem/train-lock/` (D3, 180 skjermer), og tokensettet i kode
  (D2, PR #586) — `src/styles/train-lock-tokens.css` + `src/lib/v2/train-lock.ts`, med kilder
  og ti åpne spørsmål i `natt/D2-TOKENS-DONE.md`. Selve skjermporten gjenstår (B8 +
  bølge T), og mørk-som-default er fortsatt uavklart (åpent spørsmål 1 der). Marketing/
  landingssider beholder egen fasit (ak-golf-website). Forelder-portalens omfang: uavklart,
  spør Anders. Konfliktregel: sier et dokument/skill noe annet enn Train-lock for
  produktflatene, vinner Train-lock — og dokumentet rettes.
- **ALLE TRENINGSPLANREGLER LÅST OPP (Anders 2026-08-18, i økt — «Ingenting skal være låst
  eller canon. Spiller står helt fritt»):** All regel-håndheving i planlegging er SLETTET fra
  koden (gren `feat/laas-opp-alle-regler`): de 9 invariantene (`src/lib/canon/` — hele mappen),
  PERIODE_CONSTRAINTS med min/maks-prosenter/volumtak/CS-tak/L-fase-fordeling,
  plan-validering av AI-forslag mot regler, junior-guard-sperren, admin-siden for
  periode-fordeling, og «CANON anbefaler»-hint. **CANON som overstyrende fasit-begrep er
  pensjonert.** Vokabularet består (pyramide, områder, motorikk/belastning/press, perioder,
  blokk-typer, kategorier) — som frie merkelapper, aldri krav. Eneste regler som gjenstår er
  tekniske forretningsregler (dobbelbooking-sperre, credits, GDPR) — de er ikke treningsregler.
  Fasit for ordforrådet: `docs/vokabular-planlegging-2026-08-18.md`. Gjeninnfør ALDRI en
  treningsregel (tak, minimum, sperre, «invariant», validering av plan mot metodikk) uten ny,
  eksplisitt beslutning fra Anders. Utgått samtidig: L-fasene (både L-CTRL/L-BALL/L-COMP og
  L_KROPP…L_AUTO som UI-begrep), CS-nivåer, M0–M5, PR1–PR5 — formelen er
  `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS` med motorikk UTEN_BALL/LAV_HAST/AUTO og press
  ALENE/OBSERVERT/KONKURRANSE/TURNERING.
- **Beslutningsgaten PP-A besvart (Anders 2026-08-16, i økt — låser pixel-portens systemfikser):**
  - **A1 · Admin-rail = FASE2-railen.** ⚠ **HELT OVERSTYRT 25.08.2026 (kveld):** railen
    følger nå **`AX-01 Skall rail og tabbar.dc.html`** i Train-lock-fasiten, ikke fase2-railen.
    **Fem destinasjoner, identisk på mobil og Mac: Stall · Workbench · Kø · Jarvis · Meg.**
    Konsoll, Økonomi og Kalender er rader under Meg, aldri faner. **Mac-rail 232 px med
    tekst** (`#1C1C1E`, aktiv = tekst `#F5F5F5` på `#2C2C2E`), ingen kollapset variant.
    De sju punktene under, og rail-en i A-/AG-skjermene (7 ikoner i 64 px), er UTDATERT.
    Fasit og begrunnelse: `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6.
    Opprinnelig tekst: Fase2-fasitenes rail (7 punkter, Cockpit/Stall/Plan…,
    fasitens casing) vinner over fase1-railen/dagens kode. Implementeres én gang i `V2Shell`
    (PP-B1) — alle admin-flater arver. Fase1-fasitenes rail-avvik er dermed avgjort, ikke en
    konflikt: admin-skjermer måles heretter mot fase2-skallet.
  - **A2 · Master–detalj = fasitens inspektørpanel.** Godkjenninger, planbibliotek og bookinger
    bygger 380px-inspektørpanelet (desktop) slik fasitene tegner det; mobil beholder
    liste→detalj. Ikke tegn fasitene om.
  - **A3 · Clay-normen bekreftet.** Clay `#D97757` KUN i «Én ting nå»-kortet + fokus-tilstander.
    Skjermens øvrige handlinger («Ny plan», «Ny booking» osv.) er ink-knapper i topplinjen.
    `enTing`-som-liste-CTA er et brudd — sweep (PP-B2) + variant-dokumentene rettes.
  - **A4 · Innlogging/auth = LYS** (Paper `#FAF9F5`, slik prod er — målt i #484).
  - **Desktop-bredde = fasitens d1280 per skjerm.** «Full bredde» betyr å bygge nøyaktig
    fasitens desktop-visning (paneler/kolonner der fasiten har det) — aldri strekke innhold
    utover det fasiten tegner, og aldri smalere enn fasiten.
  - **iPhone landscape = «Vri telefonen»-overlay.** Mobil i liggende (Safari-fane) får et
    Paper-stilet overlay; innholdet designes alltid for stående. PWA-manifestets
    `orientation: "portrait"` består (og legges også i team-wang/gfgk-manifestene).
    Overlayet treffer kun lav høyde (telefon-landscape), aldri iPad.
- **Navigasjon følger Paper: FIRE PlayerHQ-faner (Anders 2026-08-05).** «I dag · Plan ·
  Analyse · Meg» — per `fase1/KONTRAKT.md` §10. Fanen **«Gjør» utgår som egen fane**;
  gjennomføring (live-økt, runde, test) åpnes fra Hjem eller Plan, ikke fra bunn-navigasjonen.
  **IMPLEMENTERT (verifisert mot kode 17.08.2026):** `PLAYERHQ_NAV` i `src/components/v2/shell.tsx`
  har nøyaktig de fire fanene. (`PORTAL_TABS`-symbolet finnes ikke lenger.)
  Bakgrunn: navnene spriker i tre kilder (KONTRAKT §10 · fasit-HTML · `kodeordre-agencyos.md`),
  og skallet ligger på hver eneste skjerm — spriket måtte lukkes før skjerm-PR-ene kunne kjøre.
  AgencyOS-railen er nå avklart: se **A1-beslutningen 2026-08-16** øverst (fase2-railen vinner).
- **Kort-ramme (K2): golfdata-kortene er rammeløse (Anders 2026-08-05).** `Panel` eier flaten;
  kortene er innholdslag uten egen ramme. Dette er allerede byggets standard i alle 12
  golfdata-komponenter, så beslutningen bekrefter tilstanden framfor å endre den. Aldri legg
  ramme på et golfdata-kort som ligger i et Panel — det gir dobbel kant.
- **LFaseBadge tas IKKE i bruk (Anders 2026-08-05).** Den viser de 5 L-fasene, som er
  AK-formel v1. v2 (bekreftet 2026-08-03) har ikke L-faser. Appen har allerede riktig
  erstatning: de tre motorikk-stegene i `src/lib/ak-formel-visning.ts` (Vei B). Komponenten
  blir liggende ubrukt i Paper-biblioteket — ikke plasser den på noen flate.
- **AK-formel v2 — press-navnene følger Paper (Anders 2026-08-05):** `ALENE · OBSERVERT ·
  KONKURRANSE · TURNERING` (hvem som ser på), IKKE appens gamle `FRI · KRAV · UTFORDRING ·
  KONKURRANSE`. Fire nivåer begge steder, så det er ren omdøping.
  **Motorikk-stegene er allerede riktige:** Paper skriver `UTEN_BALL / LAV_HAST / AUTO`, appens
  Vei B har `UTEN_BALL / LAV_HASTIGHET / AUTO` — samme tre steg, kun `LAV_HAST`-skrivemåten
  skiller. Full v2-formel: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks.
  `TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE` (kilde: `fase1/workbench-mobil.html`).
  Databasen beholder de finkornede enum-verdiene — `ak-formel-visning.ts` er fortsatt broen.
- **Skjermbilde-gate (Anders 2026-08-04, FAST REGEL — presisert samme dag):** ingen skjerm-PR
  i designporten merges uten at Anders har SETT skjermen. Konkret leveranse per ferdig skjerm:
  (1) faktisk skjermbilde av den kjørende appen (Vercel-preview, innlogget testbruker med ekte
  data) — **sendes direkte i samtalen** slik at det er synlig fra iPhone (Anders jobber ofte
  remote fra mobil; en GitHub-lenke alene er ikke nok), (2) mobil **390px** ALLTID (det er
  førsteinntrykket på iPhone) + desktop 1280px, (3) lys OG mørk modus (kjent felle:
  primary=accent-kollisjonen), (4) fasitens tilsvarende skjerm ved siden av. CI måler typer og
  bygg — ikke layout. Dette tetter hullet som lot PR1–PR4 passere som «ferdige».
  Ferdig-definisjonen per skjerm er denne blokken selv (§Skjermarbeid i `CLAUDE.md` finnes ikke —
  død referanse rettet 30.08.2026). Fra 30.08 gjelder i tillegg §TEGN SKJERMEN FØR DU BYGGER DEN:
  canvas godkjent FØR koding, skjermbilde-gaten ETTER.
- **Tester planlegges i Workbench, resultat synces til spillerens talentprofil
  (Anders 2026-08-04, oppdatert 28.08):** TalentHQ som eget produkt er avviklet
  (se beslutningen øverst). Når en test logges (`/portal/tren/tester/[testId]/gjennomfor`),
  skrives resultatet til `TalentTracking.testNivaaer` via `src/lib/talent/test-sync.ts` +
  `src/lib/domain/talent-sync.ts` (T4, 16.08). `/portal/talent/mitt-niva` leser feltet.
  Huben `/portal/talent` redirecter til «Mitt nivå». Workbench testbatteri-ark gjenstår
  (N8/N10 i `natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`).
  **Protokoll-avklaringen er LØST 2026-08-16 (T5):** spilleren ser 21 CANON-rader (20 protokoller;
  Putt Speed Control har to gjennomføringsvarianter) + egne tester — kodet i
  `src/lib/portal-tester/test-tilgang.ts`. **Fasit for test-gjennomføringsskjermen finnes nå**
  (`playerhq-test-gjennomfor.html`, levert 2026-08-04, viser TN Putt Gate) — men avklaringen over
  blokkerer fortsatt PR-en, se `kart/status-gjennomfore-2026-08-04.md` i Claude Design-prosjektet.
- **AI-laget samles på ÉN adresse (Anders 2026-08-04, Fase 1):** fasiten
  `agencyos-agenticos.html` bygges som ny samleflate som erstatter spredningen over
  `/admin/agent-team`, `/admin/agents`, `/admin/godkjenninger` og AI-panelet på konsollen —
  de gamle adressene blir redirects dit. Kun redesign av agent-team alene er IKKE beslutningen.
  **Status 17.08.2026:** `/admin/agenticos` er bygget; `agent-team` og `agents` redirecter.
  Gjenstår: `/admin/godkjenninger` (fortsatt egen side) og konsollens AI-panel — se
  `plan-agenticos-jarvis-2026-08-17.md`.
- **Turneringsplanlegging inn i Workbench (Anders 2026-08-04, Fase 1):** fasiten
  `workbench-turnering.html` bygges som del av `WorkbenchV2` (coach planlegger turnering samme
  sted som trening) — ikke som ombygging av `/admin/tournaments`.
- **DataGolf-skjermene skal inn i PlayerHQ (Anders 2026-08-04):** i dag ligger de under
  marketing (`/stats/*` — spillere, turneringer, sg-sammenlign, verktøy m.fl.); `/portal/stats`
  er kun en redirect ut av portalen, og `/portal/datagolf` er én enkelt side. Skjermene skal
  finnes i PlayerHQ. Omfang/plassering (egen flate vs. faner i Analyse) er ikke avgjort — legges
  inn i porteringsplanens steg 7-omfang som egen avklaring.
  **Status 17.08.2026:** første skjerm flyttet (T6, 16.08) — `/portal/analysere/datagolf` er ekte
  skjerm med SG-bro fra runder; `/portal/stats` redirecter nå inn i portalen. Resten av
  `/stats/*`-flyttingen venter fortsatt på PR-F-plasseringsbeslutningen (PORTPLAN §A1).

## Beslutningene (juni–juli 2026)
- **Invarianter er anbefalinger, aldri sperrer:** ingenting i appen blokkerer trening. Avvik fra
  plan/regel vises i klarspråk til brukeren; sterkt avvik varsler coach. Aldri skriv «kan ikke
  brytes»-kode eller -tekst.
- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle
  navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene,
  ikke bytt ham ut.
- **Enkelhet og færrest trykk (2026-07-21, fortsatt gjeldende produktprinsipp):** Behold alle
  funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å forstå = feil design
  (ikke «brukeren er dum»). Én primær CTA per skjerm; 5-sekunders-test; tom tilstand med én vei videre.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt**
  dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate
  moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement og tilgang (OPPDATERT 2026-08-16 — fasit er BUSINESS-RULES §Abonnement og tilgang):**
  tre tilgangsnivåer **FULL / TALENT / INGEN**, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`
  (eneste sannhetskilde). **TALENT** (gratis, utløper aldri) åpner KUN testbatteriet (CANON),
  stats-/analyse-lesing, SG-/runderegistrering, DataGolf-sammenligning, talent-flatene, booking av
  enkelttimer og konto — alt annet låst med oppgraderingsvei (fail-closed i `requirePortalUser`).
  Pris FULL: **299 kr/mnd eller 2 690 kr/år**. FULL gratis ved: 1 mnd prøveperiode, ELLER
  coaching-pakke (Performance / Performance Pro), ELLER AK-administrert gruppe, ELLER
  lanseringsvinduet til 1. sep 2026 (`gratisForAlle`). «Performance / Performance Pro» er
  **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum —
  vis aldri i UI). Én `Subscription`-rad per `(userId, kind)` — COACHING og PLAYERHQ kan sameksistere.
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod
  referanseverdier før Anders gir grønt lys.
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm +
  design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i
  produksjonsfiler — disse er slettet fra prosjektet.
- **Skill-rensing (2026-07-19, Agentic OS):** generiske design-skills (`frontend-design`,
  `design-vendor`) er fjernet fra repoets `.claude/skills/`. **Oppdatering 2026-07-25:** også
  `ak-designekspert` og `ak-design-evolution` er fjernet — de var låst til den gamle kanonen.
  `webapp-testing` beholdes for e2e.
