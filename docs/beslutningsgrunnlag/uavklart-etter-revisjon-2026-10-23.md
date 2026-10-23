# Beslutningsgrunnlag: sju uavklarte punkter etter revisjonen 23.10.2026

Til: Anders Kristiansen
Kilde: uavhengig revisjon 23.10.2026 av `origin/main` ved commit `50e52dd`. Alle fil:linje-henvisninger under er kontrollert i den samme commiten.
Slik svarer du: «1 ja, 2 ja, 3 B …». «Ja» betyr anbefalingen. En bokstav betyr det alternativet.

Punkt 1–3 stopper videre arbeid. Punkt 4–7 kan tas senere.

Disse er allerede besluttet og spørres ikke om igjen: Plan er kalenderen, én innboks bak bjella, Målsetning bor i Workbench, Data Golf er bare for ADMIN, én spillerprofil (AG-08), etterlevelse er tid mot plan siste 4 uker, coach som avlyser gir full refusjon, WorkbenchSession er økt-tabellen som overlever (OW-3), trenere i WANG og Team Norway foreslår og skriver aldri direkte, og Team Norway-treneren ser navn, klubb, fødselsår og WAGR uten deling.

Avvik fra revisjonen er merket **«Endret siden revisjonen»** eller **«Avviker fra revisjonen»**.

---

## BLOKKERER

### 1. Hvilken live-skjerm er den riktige for en treningsøkt?

**Hva avgjøres:** hvilken av skjermene spilleren bruker mens økta pågår. Alle andre veier inn sendes dit.

**Hva du merker i dag:** spilleren kan starte samme økt fra fire steder og havne på to forskjellige skjermer. Logger spilleren økta på den ene, kan oppsummeringen etterpå bli tom, og da ser treneren heller ikke noe.

**Fakta (kontrollert):**
- Det finnes fire skjermer for samme økt:
  - `/portal/live/[id]/active`
  - `/portal/live/[id]/tapper` (slagtelleren)
  - øktarket `/portal/tren/wb/[sessionId]` (`src/app/portal/(fullscreen)/tren/wb/[sessionId]/page.tsx`)
  - `WorkbenchLive` (`src/app/portal/planlegge/workbench/page.tsx:136`)
- «Fortsett» på I dag går til `/tapper`:
  - `idagNaaCta` (`src/lib/portal/idag-visning.ts:145-146`) gjør «i gang» om til `ACTIVE` (`src/lib/portal/session-hrefs.ts:41-43`).
  - `planSessionStartHref` sender `ACTIVE` til `/tapper` (`session-hrefs.ts:61-62`).
  - Lenken brukes på I dag (`src/app/portal/page.tsx:69`).
- Hurtigstart og Plan går til `/active`:
  - `liveHrefForStatus` sender en Workbench-økt i gang til `/active` (`src/lib/portal-live/live-route.ts:56`).
  - Den brukes av `src/app/portal/tren/start/page.tsx:21` og `src/lib/portal/plan-visning.ts:25`.
- Tre datamodeller, det vil si tre tabeller i databasen for økter: `TrainingPlanSession` (`prisma/schema.prisma:1552`), `TrainingSessionV2` (`:4471`) og `WorkbenchSession` (`:7147`).
- Skjermene skriver og leser i hver sin tabell:
  - `/active` skriver øvelseslogg i `WorkbenchDrillLog` (`src/lib/portal-live/wb-live-actions.ts:76`).
  - `/tapper` skriver ballogg i `SessionBallLog` (`src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions.ts:63`).
  - Oppsummeringen (`loadPH07SummaryData`, `src/lib/portal-live/load-ph04-07.ts:327`) leser bare `SessionBallLog` (`:335`).
  - En økt som er logget på `/active` gir derfor tom oppsummering.

**Alternativer:**
- **A.** `/active` på `WorkbenchSession` er den eneste live-skjermen. Slagtelleren blir et verktøy inne i den, og de andre veiene sender videre dit. *Konsekvens:* én vei inn og én logg, og oppsummeringen må lese øvelsesloggen.
- **B.** `/tapper` er den eneste live-skjermen. *Konsekvens:* bare balltelling, ikke logg per øvelse. Det strider mot kravet fra 09.10 om logg per øvelse (sitert i `live-route.ts:54-55`).
- **C.** Behold begge, og la oppsummeringen lese begge loggene. *Konsekvens:* minst endring nå, men to skjermer for samme jobb og to sannheter som kan gli fra hverandre.

**Anbefaling: A.** Den følger OW-3 (én økt-tabell) og kravet om logg per øvelse. Den lukker også feilen der oppsummeringen er tom.

**Arbeidet dette utløser:**
1. Alle «Start» og «Fortsett» for en Workbench-økt går til `/active`: I dag (`idag-visning.ts`), Plan, hurtigstart og øktarket. Ferdig når en test låser at alle fire inngangene gir samme adresse.
2. `/tapper` for en Workbench-økt sender videre til `/active`, og slagtelleren åpnes derfra. Ferdig når direkte besøk på `/tapper` havner på `/active`.
3. Oppsummeringen leser `WorkbenchDrillLog`. Ferdig når en test viser at en økt logget på `/active` gir utfylt oppsummering.
4. Trenerens oppfølging leser samme logg. Ferdig når treneren ser de samme øvelsene som spilleren logget.
5. `WorkbenchLive` viser økta og lenker til `/active` i stedet for å være en egen loggeflate. Ferdig når den ikke har egne skriveknapper.
6. Gamle økter i `TrainingPlanSession` og `TrainingSessionV2` kan bare leses. Ingen nye skrivinger går dit. Ferdig når et søk i koden ikke finner nye `create`/`upsert` mot disse fra live-flyten.

---

### 2. WANG: får treneren se navn og klasse for elever som ikke har delt?

**Hva avgjøres:** om en WANG-trener ser navnet og klassen til en elev før eleven har delt noe med WANG.

**Hva du merker i dag:** treneren ser alle elevene i gruppa med navn og klasse i Elever-lista, søket, Meldinger, Samtykke og Konkurranse › Per elev, også elever som ikke har delt noe. HCP, kategori, plan og tester vises bare for dem som har delt.

**Fakta (kontrollert):**
- Navnene hentes med `hentWangGruppe({ medElevnavn: true })` (`src/app/team-wang/_data/hent-wang-gruppe.ts:175` og `:233-242`). Det skjer på trenersiden (`src/app/team-wang/coach/page.tsx:89`) og på skjermoversikten (`src/app/team-wang/skjermer/page.tsx:35`).
- Lista brukes her:
  - søket (`src/app/team-wang/coach/WangCoachKlient.tsx:92`)
  - Elever (`src/components/wang/WangElever.tsx:122-129`)
  - Meldinger (`src/components/wang/WangMeldinger.tsx:80-84`)
  - Samtykke (`src/components/wang/WangAdmin.tsx:304`)
  - Konkurranse › Per elev (`src/components/wang/WangKonkurranse.tsx:212-223`)
- Klasse hentes for alle elever (`src/app/team-wang/_data/wang-elevdata.ts:66-75`). Skjermen sier selv: «Uten deling ser du bare navn og klasse» (`WangElever.tsx:167`).
- **Avviker fra revisjonen:** setningen «Gruppemedlemskap alene gir verken innsyn eller skriverett» står i beslutningen fra **06.10**, ikke 28.09 (`.claude/rules/beslutninger.md:955-956`).
- Team Norway har en uttrykkelig beslutning om å åpne navn, klubb og fødselsår (22.10). WANG har ingen tilsvarende. Elevene er mindreårige.

**Alternativer:**
- **A.** Ja, navn og klasse som i Team Norway. Alt annet krever deling. *Konsekvens:* koden stemmer allerede, og det som gjenstår er å skrive regelen inn og låse den med test.
- **B.** Nei, bare antall elever og klassefordeling til eleven har delt. *Konsekvens:* treneren kan ikke skrive til eller finne en bestemt elev før deling. Meldinger, Samtykke og Per elev må bygges om.
- **C.** Navn ja, klasse bare etter deling. *Konsekvens:* liten gevinst for personvernet, og klassefilteret i Elever slutter å virke for elever som ikke har delt.

**Anbefaling: A.** Treneren er elevenes lærer på skolen og kjenner allerede navn og klasse. Uten navn virker ikke Meldinger og Samtykke. Det som faktisk er følsomt (plan, tester, HCP) står fortsatt bak deling.

**Arbeidet dette utløser:**
1. Regelen skrives inn i `beslutninger.md` og `.claude/rules/wang-toppidrett.md`. Ferdig når begge peker på samme regel.
2. En test låser at en elev som ikke har delt bare viser navn og klasse i Elever, søket, Meldinger, Samtykke og Per elev. Ferdig når testen feiler hvis HCP, kategori, plan eller tester lekker.
3. Behandlingsregisteret for personopplysninger får en linje om at WANG-trenere ser navn og klasse uten deling. Ferdig når linja står i registeret.

---

### 3. Team Norway: skal Fellestesting og Gruppeanalyse følge delingslåsen?

**Hva avgjøres:** om spillere som ikke har delt med Team Norway skal vises med navn og resultat i Fellestesting og Gruppeanalyse.

**Hva du merker i dag:** på en testdag ser treneren alle deltakerne med navn og resultat, uansett deling. Gruppeanalysen viser «beste resultat», tar med WANG-elever og har ingen nedre grense for antall.

**Fakta (kontrollert):**
- Disse funksjonene leser rett fra databasen, uten å gå gjennom delingssperren `medNavngittProfil`, og tar med spillernavn:
  - `hentTnTestdager` (`src/lib/domain/tn-arbeidsflate.ts:437-481`)
  - `hentTnTestdag` (`:482-561`, navn på deltakere `:491-495`)
  - `hentTnTestdagDeltaker` (`:562-640`, navn `:568`)
- Gruppeanalysen (`hentTnGruppeanalyseResultat`, `:1016`):
  - Når den bygger på en testdag, leser den rett fra databasen (`:1021-1052`).
  - Når den bygger på en testprotokoll, går Team Norway-spillerne gjennom sperren (`lesNavngitteProfiler`, `:1062`).
  - I begge tilfeller regnes «beste» (`:1073` og `:1098`).
  - WANG-elever tas med fra `hentWangTestresultatSkolerForTeamNorway` (`:1079-1105`).
  - Det finnes ingen grense på fem.
- **Avviker fra revisjonen:** beslutningen 22.10 (median, ingen «beste», «—» under fem, ikke WANG-elever) gjelder uttrykkelig **Referanse › Tester** (`beslutninger.md:59` og `:68`), ikke Gruppeanalysen. Spørsmålet er derfor om samme regel skal gjelde her.
- Ikke kontrollert: om `hentWangTestresultatSkolerForTeamNorway` sjekker samtykket fra WANG til Team Norway.

**Alternativer:**
- **A.** Ja. Spilleren kan føres med navn på testdagen, men bare i selve føringsskjermen. I analysen vises spilleren uten navn og teller bare i median og antall. «Beste» fjernes, og det vises «—» under fem. WANG-elever er med bare når samtykke til Team Norway finnes. *Konsekvens:* samme regel som Referanse › Tester, og treneren kan fortsatt registrere resultater.
- **B.** Lås alt, også føringen. *Konsekvens:* treneren kan ikke føre resultat for en spiller som står foran ham, så testdagen virker ikke.
- **C.** La det være som i dag. *Konsekvens:* navn og resultater for spillere som ikke har delt vises bredt, og det strider mot delingsprinsippet.

**Anbefaling: A.** Den holder testdagen praktisk og gir én regel for alle testoversikter i Team Norway.

**Arbeidet dette utløser:**
1. Fellestesting: navn vises bare i føringen av den aktuelle testdagen. Testdagslister og deltakerdetaljer går gjennom delingssperren. Ferdig når en test låser at en spiller som ikke har delt ikke står med navn utenfor føringsskjermen.
2. Gruppeanalysen regner median av siste resultat, som Referanse › Tester. Ferdig når «beste» ikke finnes i `tn-arbeidsflate.ts`.
3. Grensen på fem: «—» under fem. Ferdig når en test låser grensen.
4. WANG-elever er med bare med samtykke til Team Norway. Ferdig når en test viser at en WANG-elev uten samtykke ikke telles.

---

## KAN TAS SENERE

### 4. Skal WANG-skoleplattformen `/team-wang/app/*` ut av AK Golf HQ?

**Hva avgjøres:** om skoleplattformen (egen database, egne roller, helsevarsler) skal bo i AK Golf HQ eller flyttes ut.

**Hva du merker i dag:** ingenting i appen lenker dit, men den ligger i samme kodebase og publiseres sammen med HQ.

**Fakta (kontrollert):**
- **Avviker fra revisjonen:** det er 9 sider, ikke 8. Det er 8 innholdssider pluss innlogging (`src/app/team-wang/app/`).
- Plattformen har egen Supabase-database via `NEXT_PUBLIC_WANG_SUPABASE_URL` (`src/lib/wang-supabase/server.ts:7`, `proxy.ts:14`).
- Den har ti roller, blant annet `student`, `guardian` (foresatt) og `club_coach` (`src/lib/wang-supabase/types.ts:2-13`). Den har også en egen modul for trivsel og helsevarsler (`src/lib/wang-supabase/wellbeing.ts`).
- Ruteren sender til egen innlogging (`src/proxy.ts:190`). Innloggingen er uttrykkelig «fortsatt uavklart» (`beslutninger.md:438`).
- **Ikke kontrollert: ekte eller syntetiske data.** WANG-databasen er ikke koblet til denne økta. Bare Golf_Headquarters-basen er tilgjengelig, så jeg har ikke lest i den. Koden peker mot syntetiske data:
  - `synthetic-profiles.ts`
  - `test-account-linking.ts:4-7`, som låser kjøring til demoprosjektet `uwuhkgkaqnuerlkqvrpw`, krever syntetisk e-post og har en egen test som avviser andre databaser (`test-account-linking.test.ts`, «låser kjøring til korrekt WANG-URL»)
- Merk: 30.08 sa du at de ulenkede `/team-wang/*`-flatene skal *inn* i appen. Den beslutningen står ikke i `beslutninger.md`. Et «ut» her vil overstyre den for akkurat `/team-wang/app/*`.

**Alternativer:**
- **A.** Flytt skoleplattformen ut til eget repo, det vil si egen kodebase med egen publisering. WANG-trenerflatene i HQ (`/team-wang/coach`, `/wang`) blir der de er. *Konsekvens:* HQ slipper roller for foresatte, skoleledelse og helsevarsler om mindreårige som HQ ikke har avtale for.
- **B.** Behold i HQ, men frys: ingen lenker og ingen videreutvikling til det finnes en avtale med WANG. *Konsekvens:* ingen jobb nå, men koden må fortsatt vedlikeholdes ved hver oppdatering.
- **C.** Bygg den inn i HQ med samme skall som resten. *Konsekvens:* stor jobb, og helsedata om mindreårige kommer inn i HQ.

**Anbefaling: A.** Plattformen er et eget produkt med egen database og egne roller. Det er enklere og tryggere å holde den adskilt.

**Arbeidet dette utløser:**
1. Les WANG-databasen (bare antall og om profilene er merket syntetiske, ingen persondata). Ferdig når det står skrevet om basen er ekte eller syntetisk.
2. Flytt `src/app/team-wang/app/*` og `src/lib/wang-supabase/*` til eget repo. Ferdig når HQ bygger uten dem og `/team-wang/app` gir videresending eller «finnes ikke».
3. Fjern WANG-Supabase-nøklene fra HQ-miljøet. Ferdig når de ikke står i HQ-oppsettet på Vercel.

---

### 5. Hva betyr «snitt» på I dag?

**Hva avgjøres:** **Endret siden revisjonen.** Hva brutto snitt betyr er allerede besluttet 22.10: turneringsrunder i kalenderåret, bare brutto, likt i IUP, Rangliste, Uttak og PlayerHQ (`beslutninger.md:60` og `:68` punkt 2). Det som gjenstår er hva I dag skal vise, og hva de andre «siste 10 runder»-tallene skal hete.

**Hva du merker i dag:** samme spiller kan ha tre ulike snitt på tre skjermer.

**Fakta (kontrollert):**
- Den felles funksjonen finnes: `beregnBruttoSnitt` (`src/lib/domain/brutto-snitt.ts:56`). Den brukes av IUP- og profilkoblingen, A–K-kategorien og WANG.
- I dag regner sitt eget snitt: siste 10 av alle runder, uten filter på 9 eller 18 hull eller på trening eller turnering (`src/app/portal/actions.ts:529-561`).
- Stats regner siste 10 runder med 18 hull, minst 4 (`src/lib/portal-analyse/ph16-stats-data.ts:87-92` og `:335`).
- **Avviker fra revisjonen:** Spiller 360 bruker ikke «alle runder», men siste 10 tellende runder (`src/lib/admin-spiller/spiller360-visning.ts:111-114`). Det gjelder selv om toppen av `brutto-snitt.ts` sier at Spiller 360 leser derfra.
- Skisse-skjermen «I dag» A+C i skjelettprosjektet sier «Snittscore brutto · siste 10 runder». Den må rettes om du velger A eller B.

**Alternativer:**
- **A.** I dag viser bare «Brutto snitt 2026», den felles definisjonen. Stats beholder sitt tall under navnet «Form siste 10 runder (18 hull)». Treningsrunder står på egen linje. *Konsekvens:* ett snitt-tall på I dag, og formtallet bor i Stats.
- **B.** I dag viser både «Brutto snitt 2026» og «Form siste 10». *Konsekvens:* mer informasjon, men to tall som ligner hverandre side om side.
- **C.** La det være som i dag. *Konsekvens:* bryter beslutningen 22.10.

**Anbefaling: A.** Ett tall, én betydning, og det følger det du allerede har bestemt.

**Arbeidet dette utløser:**
1. I dag bytter til den felles funksjonen. Ferdig når `actions.ts` ikke regner eget snitt.
2. Stats-tallet får navnet «Form siste 10 runder (18 hull)». Ferdig når ordet «snitt» alene ikke står på det tallet.
3. Spiller 360 bytter til den felles funksjonen for brutto snitt. Ferdig når en test låser at samme spiller får samme snitt i Spiller 360, IUP og PlayerHQ.
4. Skisse-skjermen «I dag» A+C rettes til «Brutto snitt 2026». Ferdig når teksten er byttet.

---

### 6. Skal `/admin/oppgaver` og `/admin/innsikt` fjernes?

**Hva avgjøres:** om to AgencyOS-sider som alltid står tomme skal tas bort.

**Hva du merker i dag:** begge sidene viser tom tilstand uansett data. Oppgaver vises allerede fra Notion på Cockpit, og talent vises i Spiller 360.

**Fakta (kontrollert):**
- `/admin/oppgaver` rendrer `tilstand="tom"` fast (`src/app/admin/oppgaver/page.tsx:41`). Det samme gjør `/admin/innsikt` (`src/app/admin/innsikt/page.tsx:24`).
- Cockpit henter oppgaver fra Notion (`src/app/admin/agencyos/page.tsx:8`).
- Talent finnes i Spiller 360 (`src/components/admin/precision/AG08Spiller360.tsx`).
- Beslutningen 04.10 beholdt AG-21 og AG-22 til lansering, «kan fjernes senere» (`beslutninger.md:1032-1034`).
- Caddie-hubben lenker til `/admin/oppgaver` (`src/components/admin/precision/AG19CaddieHub.tsx:216`).

**Alternativer:**
- **A.** Fjern begge. `/admin/oppgaver` sender videre til Cockpit, og `/admin/innsikt` til spillerlista. Lenken i Caddie rettes. *Konsekvens:* to tomme sider forsvinner, og ingen lenke blir død.
- **B.** Behold og fyll med data. *Konsekvens:* dobbelt opp med Cockpit og Spiller 360.
- **C.** Fjern bare Innsikt. *Konsekvens:* Oppgaver står fortsatt tom.

**Anbefaling: A.** Innholdet finnes allerede et annet sted. Tomme sider gir inntrykk av at noe er i stykker.

**Arbeidet dette utløser:**
1. Begge sidene erstattes med videresending. Ferdig når et besøk havner på Cockpit eller spillerlista.
2. Lenken i Caddie-hubben går til Cockpit. Ferdig når et søk ikke finner `/admin/oppgaver` som lenke.
3. `docs/MASTER-SKJERMPLAN.md` markerer AG-21 og AG-22 som utgått. Ferdig når radene er oppdatert.

---

### 7. Team Norway Referanse › Planlegger: direkte endring eller forslag?

**Hva avgjøres:** om trenerne endrer referanseplanen for WAGR-spillere uten HQ-konto direkte, eller sender forslag.

**Hva du merker i dag:** skjermen sier «Du endrer direkte» (`src/components/turneringsplan/Turneringsplanlegger.tsx:30`), mens planen fra 23.10 sier «Treneren foreslår» (`docs/planer/tn-referanse-og-planlegger-i-tre-flater-2026-10-23.md:27`). Spilleren har ingen konto, så ingen kan godta et forslag.

**Fakta (kontrollert):** som over. Regelen fra 06.10 om at trenere foreslår, gjelder spillerens egen plan (`beslutninger.md:955-957`). Referanseplanen er en delt arbeidsplan for trenerne, ikke spillerens plan.

**Alternativer:**
- **A.** Direkte endring for spillere uten konto, med logg over hvem som endret hva. Når spilleren får HQ-konto, gjelder forslagsregelen. *Konsekvens:* planen kan faktisk brukes, og regelen fra 06.10 står.
- **B.** Forslag. *Konsekvens:* forslagene blir liggende fordi ingen kan godta dem.
- **C.** Forslag som én ansvarlig trener godtar. *Konsekvens:* krever en ny rolle og en ny godkjenningsflyt.

**Anbefaling: A.** Forslag uten mottaker er en blindvei. Loggen gir sporbarheten.

**Arbeidet dette utløser:**
1. Planfila fra 23.10 rettes til «direkte endring for spillere uten konto». Ferdig når den og skjermteksten sier det samme.
2. Endringslogg på referanseplanen (hvem og når). Ferdig når en endring vises med trenernavn og tid.
3. Overgang når spilleren får konto: referanseplanen kobles til spilleren, og forslagsregelen gjelder. Ferdig når en test viser at en spiller med konto får forslag, ikke direkte endring.
