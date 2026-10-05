> **Status 04.10.2026:** Claude Code eier implementeringen (tok over etter Codex og Gemini). Porteringskø: [design-handoff/regler/claude-code.md](../design-handoff/regler/claude-code.md). **Godkjent av Anders: PH-01 (visuelt) og PH-IUP-01 (for lansering, 04.10).** Alle andre skjermer er kandidater til Anders har sett dem i appen. Kilde for denne lista: [design-handoff/regler/skjermliste.md](../design-handoff/regler/skjermliste.md) (IA 28.09 og IUP-radene 04.10). Beslutning: [beslutninger.md](../../.claude/rules/beslutninger.md) §PRECISION ATHLETICS.

# Skjermliste — AK Golf Precision Athletics (26.09.2026 · IA 28.09.2026)

Hentet fra appens `page.tsx`-filer 26.09.2026 av Claude Code. Omfang: PlayerHQ (`/portal`), AgencyOS (`/admin`), forelder, innlogging/onboarding, booking, statistikk, innsyn, GFGK Junior og systemsider.
Utenfor: Team Norway, WANG, markedssidene (venter) og `/demos`.

**Tall:** 443 sider · 163 videresendinger · 280 ekte skjermer · **108 skjermtyper** (74 fra rutene + 16 analyse + 4 Workbench fysisk/turnering + 11 runde-registrering + 3 teknisk plan 27.09.2026) (PlayerHQ 26 · AgencyOS 24 · forelder 6 · konto 6 · booking 3 · statistikk 6 · GFGK Junior 2 · system 1). Én skjermtype = én tegning som dekker alle rutene i raden.

**Hver tegning leveres i:** mobil 390 · iPad 768 og 1024 · desktop 1280 (1440 for AgencyOS) · lyst tema · natt der «Natt» er merket · tilstandene tom, laster og feil. Kontroll: `scrollWidth === clientWidth` i alle bredder.

**Ny informasjonsarkitektur 28.09.2026 (Anders, grillingen runde 8).** PlayerHQ: I dag · Plan · Stats · Meg. AgencyOS: Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Hurtigknapp og bjelle i begge skall. Plassering per skjerm og «Utgår 28.09» står i `oversikt.html` og `ui_kits/_shared/ia.js`. Skall og meny er endret; enkeltskjermene tegnes om i runde 20–30.

**Låste regler 26.09 (bekreftet 29.09, runde 34):** grafitt primærknapp; rust kun signal (destruktivt/haster, Live-pille, tellere som krever coach), maks én per skjerm; lyst tema standard, natt bare der merket; aldri sidelengs rulling.

## PlayerHQ (`/portal`) — fire faner: I dag · Plan · Stats · Meg (28.09)

Stats: Snittscore · Strokes Gained · Trening · Tester. Hurtigknapp: Spør Caddie · Ny økt · Registrer runde · Start økt. Bjelle øverst åpner innboksen (PH-21). Utgår fra menyen 28.09 (gamle adresser sender videre): egen kalender, egen fysisk-side, egne turneringssider (alt inn i Plan), talent «Min plan», roadmap, ukesdigest (melding i innboksen), «Utenfor banen» (PH-26). Utfordringer og venner flyttes til Meg.

| ID | Skjermtype | Ruter | Må vise | Natt |
|---|---|---|---|---|
| PH-01 | I dag (runde 20) | `/portal`, `/portal/gjennomfore`, `/portal/tren/wb`, `/portal/live` | Dagens økter som like store kort i tidsrekkefølge, neste først, aksestripe og «Start». Under: dagsform · agenda med oppgaver fra coach · neste fysiske økt · neste turnering med nedtelling · treningstid per akse mot pyramiden («Du trener 5 % TEK, planen sier 20 %») · fullførte økter mot plan (uke, rekke over 70 %, milepæler 10/50/100). Pop-up bare for melding fra coach eller endring i dagens plan (Les · Ignorer). Innboks bak bjella: forslag (Godta · Avvis), coach, varsler. Tom: «Bygg økter i Workbench», «Registrer runde», «Velg treningsplan». Runde 31: fireukerssjekk som kort (prosessmål, målsetninger, utviklingssjekk Ung/Junior/Amatør/Profesjonell); sesongevaluering uke 42. Ingen IUP-fane for spilleren. Fireukerssjekk bare for spillere i WANG-gruppe (Ung eller Toppidrett) eller Team Norway-gruppe; variant PH-01-AK uten. Nivå: Ung = 8.–10. klasse skoleåret 2026/27 (født 2011–2013, 34 spørsmål), eldre Junior (41). Variant PH-01-UNG. Neste turnering = neste offisielle turnering; interne konkurranser er økter i agenda og Plan | Runde 37: «Start» bærer sessionId og økttype (golf → PH-04, fysisk → PH-06); PH-01-visningen Anders godkjente (390 px, lyst, Data, dialogen Endring i dagens plan åpen) er ikke endret. |
| PH-02 | ~~Gjør nå~~ **Utgår 28.09** | `/portal/gjennomfore`, `/portal/tren/wb`, `/portal/live` → `/portal` | Slått sammen med PH-01 (gjentok dagens økter). Oppgaver fra coach ligger i agendaen på PH-01 | |
| PH-03 | Øktark | `/portal/gjennomfore/[id]`, `/portal/tren/wb/[sessionId]` | Start, fullfør eller hopp over, øvelser med AK-formel | |
| PH-04 | Live-økt: før start (runde 24) | `/portal/live/[id]/brief` | Overskrift: hvem, hva, pyramide, AK-formel, tid. Liste over alle øvelser med reps og minutter. «Start økt» | Natt |
| PH-05 | Live-økt: aktiv (runde 24) | `/portal/live/[id]/active` | Klokke for hele økta. Første øvelse åpnes med detaljert beskrivelse. Teknisk oppgave fra teknisk plan (bilde, video, tekst fra coach; egen video/bilde, B6). Hver øvelse: egen klokke, fire tellere Uten ball · Lav hastighet · Automatikk · Slag med −1/+1/+5 og «40 av 60» (A5). «Ferdig» stopper klokka og viser reps mot plan, neste øvelse åpnes automatisk. Hopp over og bytt rekkefølge fra lista | Natt |
| PH-06 | Live-økt: fysisk (runde 24 · erstatter slagtelleren) | `/portal/live/[id]/tapper` | Følger programmet. Spilleren fyller inn vekt og kan endre reps og serier. Erstatter skjermen for sett og kilo som forsvant i runde 21. Slagtelleren er slått inn i øvelsen i PH-05 | Natt |
| PH-07 | Etter økt (runde 24 · runde 36: tid, reps og status per øvelse leses fra samme økt som PH-05 skrev (window.PHQ_SESSION); «Gjennomført» skilt fra «Lagret») | `/portal/live/[id]/summary`, `/portal/tren/feiring/[planId]` | Golføkt: tid totalt og per øvelse mot plan, reps mot plan, Belastning 1–10 og Fokus 1–10 (1 ukonsentrert, 10 helt til stede i hvert slag). Fysisk økt (PH-07-FYS): tid og serier, «Hvor tungt» 1–10 (1 svært lett, 10 maks). «Coach ser økta.» | Natt |
| PH-08 | Runde live | `/portal/runde/live`, `/portal/mal/runder/[id]/slag` | Hull 1–18, lie, meter til flagg, putter i fot | Natt |
| PH-09 | Registrer runde | `/portal/runde/logg`, `/portal/mal/runder/ny`, `/portal/mal/runder/[id]/hull` | Dato, bane, score per hull, brutto | |
| PH-10 | Plan (runde 21) | `/portal/planlegge`, `/portal/kalender`, `/portal/kalender/opptatt`, `/portal/tren/fys-plan`, `/portal/tren/turneringer*` | Én flate. Se-modus i zoom År · Måned · Uke · Dag (mobil åpner i Uke). Golf, fysisk, turneringer og treningssamlinger i samme plan; opptatt tid (skole, jobb, reise, booking) og Google-kalender som lag. «Koble Google-kalender» (inn og ut, Apple senere). Trykk økt: se eller start. Turneringsreise (B3), treningssamling (B7), «Be coach endre planen» (B8). Forslag ved over 130 % / under 70 % to uker på rad, aldri sperre. Veileder første gang, «?» per nivå. Diskré coach-varsel. Runde 31: WANG-morgenøkter som arvet gruppeplan; spilleren registrerer oppmøte og gjennomføring. Ingen egen WANG-fane. Kort: teknisk plan → PH-TP-01 (runde 35: aktiv · utkast fra coach · ingen plan = ikke vist; ingen egen primærknapp). | |
| PH-11 | Workbench (spiller, runde 29) | `/portal/planlegge/workbench` | Nivåer År · Periode · Måned · Uke · Økt og Målsetninger (bytter ut kalenderen i midtfeltet). Dra pyramideakse ut og slipp på klokkeslett (eller trykk akse, så klokkeslett) → Gjenta: ikke · hver uke · annenhver · valgte dager · til dato · ut perioden. Senere endring av gjentatt økt: bare denne eller alle framover. Sidefelt: øvelsesbank (pyramide først, banken filtreres, «+» egen øvelse med AK-formel v2: pyramide, område (19), læringssteg, treningsmiljø, press) · fysisk program · øktmaler · turneringer · ny teknisk plan · målsetninger. Målsetning: resultat- eller prosessmål, start/slutt, knyttet til år/periode/måned/uke/økt, målbar på alle parametere, fremdrift automatisk. Gruppeøkter arves automatisk; tilpasning = «Egen». B7 treningssamling som blokk (uke 41) | |
| PH-12 | Velg treningsplan (28.09 · tegnet om 30.09, runde 36; ikke lenger firestegsbygger) | `/portal/planlegge/bygger`, `/portal/ai/mal-bygger` (utgår 28.09 → bygger) | Fem standardplaner: Weekend Warrior · Klubbspilleren · Junior-aspirant · Konkurransespilleren · Practice like the pros, tilpasset kategori A–K. Alder begrenser aldri plan eller mengde. Ingen AI-planbygger ved lansering | |
| PH-13 | Øvelsesbank | `/portal/drills`, `/portal/drills/[id]`, `/portal/coach/ovelser`, `/portal/ai/foresla-drill` | Liste med filter per akse, øvelsesdetalj, Caddie-forslag. Break-tabell under putting (flyttet fra PH-26) | |
| PH-14 | Stats › Tester (runde 22) | `/portal/tren/tester`, `/portal/tren/tester/[testId]`, `…/ny`, `…/ny/egen`, `…/team-norway` | Delen Tester i PH-16: siste resultat, snitt, progresjon, nivå mot Kategori C («—» der normen mangler). Vitnegodkjenning kommer senere. Team Norway-tester med poengskala fra TN-scorekortarket | |
| PH-15 | Test: gjennomfør | `/portal/tren/tester/[testId]/gjennomfor` | Scorekort, live-registrering. Team Norway-tester med poengskala: PH-15-TN (8-ball, 9 hull lengde automatisk; Nærspill Gate og VISA Express for hånd, appen summerer; Wedge Gate uavklart). Runde 29: Nærspill Gate og VISA Express har 9 slag og fritt poengfelt per slag. Wedge Gate: 9 slag, launch lav <26° · medium 28–30° · høy >32° × carry 40/50/60 m ±3, Treff eller Bom, resultat «X / 9 treff» (TeknikTester A26:F38) | Natt |
| PH-16 | Stats (runde 22) | `/portal/analysere`, `/portal/analysere/historikk`, `/portal/analysere/trening*`, `/portal/analysere/kilder`, `/portal/toppidrett` | Fire deler: Snittscore · Strokes Gained · Trening · Tester. Øverst i hver del: positiv trend (siste 10 mot 10 før), så flest tapte slag synkende. Sammenligning: neste kategori (Broadie, ESTIMAT), PGA Tour kan slås på. Snittscore: kategori A–K med «X slag til neste kategori» Ytelsesbilde samlet (krever samtykke), Tiger 5 per runde og sesong, runder med scorekort og Ytelsesbilde, turneringsresultater fra AK Golf pipelines. SG per avstand (tee, innspill 200+/150–200/100–150/50–100, nærspill chip/pitch/lob/bunker, putting 0–3 til 40+ fot), nærhet mot PGA. Trening: mengde mot SG, spredning og TrackMan-parametere, pyramide mot ønsket, én Filter-knapp med brikker. Tester: siste, snitt, progresjon, nivå mot neste kategori. Nok data: under 4 runder «Registrer X runder til», foreløpig til 12 (tee/innspill) og 24 (nærspill/putting). Runde 31: Tester er ett batteri for AK Golf, WANG og Team Norway. Kontrollert (coachregistrert) / Egenregistrert (spillerregistrert). Nivå A–K, TN-spillere ser landslagsnivå for klassen, «—» uten norm | |
| PH-17 | Stats › Trening · TrackMan (runde 22) | `/portal/analysere/trackman`, `…/[id]`, `/portal/mal/trackman/gapping`, `/portal/mal/sg-hub/equipment`, `/portal/analysere/datagolf/stasjon`, `/portal/mal/trackman*` | Øktliste, spredningskart, gapping, utstyrshelse | |
| PH-18 | Stats › Snittscore · runder (runde 22) | `/portal/mal/runder`, `…/[id]`, `/portal/statistikk/[metric]`, `/portal/statistikk/runder/[runId]/del`, `/portal/analysere/hull`, `/portal/analysere/turneringer`, `/portal/analysere/datagolf` | Scorekort, metrikk over tid, hull-analyse, til-par-kurve, etter-runden-gjennomgang (SG, putting, noter, kilde) | |
| PH-19 | ~~Målsetning~~ → Workbench › Målsetninger (runde 29) | `/portal/mal`, `/portal/mal/goal/[id]`, `/portal/mal/leaderboard`, `/portal/talent/*`, `/portal/utviklingsplan`, `/portal/tren/teknisk-plan/[planId]` | Åpner Workbench med Målsetninger i midtfeltet (PH-11-MAL) | |
| PH-20 | Gameplan og banekart | `/portal/gameplan`, `…/[baneId]`, `…/hull/[nr]`, `/portal/baneguide*` (videresending) | Banekart (eksempeldata ved lansering), hull-for-hull, slagvalg. Komplett baneguide etter lansering | |
| PH-21 | Innboks | `/portal/coach`, `…/melding`, `…/melding/ny`, `…/sporsmal*`, `…/tilbakemelding*`, `…/videoer`, `…/plans`, `…/sg-hub*`, `/portal/mal/sg-hub/coach/[spillerId]*`, `/portal/onskeligokt*` | Meldingstråd, spørsmål, tilbakemelding, videoer, ønsket økt. Runde 31: forslag fra WANG og Team Norway merket med avsender (Godta · Avvis). AK-coachens direkte endringer med Angre. Heter Innboks (28.09) | |
| PH-22 | Caddie-chat | `/portal/coach/ai`, `/portal/ai/foresla-turnering` | Chat, forslag som utkast, kilder | |
| PH-23 | Booking (spiller) | `/portal/booking`, `…/ny`, `…/ny/bekreft`, `…/bekreftet`, `…/[bookingId]`, `…/coach/[coachId]`, `…/anlegg/[anleggId]`, `/portal/meg/bookinger*` | Klippekort, tjeneste, tid, bekreft, flytt time | |
| PH-24 | Meg (runde 23) | `/portal/meg`, `…/profil`, `…/utstyr`, `…/resultater`, `…/helse*`, `…/foreldre`, `…/dokumenter`, `/portal/spiller/[id]`, `/portal/venner*` | Profil (navn, personalia, HCP, hjemmeklubb, lenke til Målsetninger) · fasiliteter (skjema ett spørsmål om gangen, dekning av 19 treningsområder, hva mangler) · bookinger · abonnement og betalingskort («Bytt kort og se kvitteringer» → Stripe-kundeportalen) · foreldre (inviter, se tilgang) · deling (PH-27) · helse og fravær (skade, sykdom, ferie) · utstyr · min coach (hvem, avtale, videoer, tilbakemeldinger; meldinger i innboksen) · venner og utfordringer · hjelp · innstillinger. Talentradar vises aldri. Eksport av årsplan kommer senere. Fasilitetsspørsmålene gjelder alle spillere | |
| PH-27 | Deling (runde 31) | `/portal/meg/deling` | Hvem har tilgang (AK-coach, WANG, Team Norway) og hva de ser. Innsyn er alt, også helse og meldinger. Delingslenke bare til @wang.no og @golfforbundet.no. Godta/Avslå forespørsler. «Trekk tilgang» (rust) med ett trykk. Under 16: «Venter på forelder» (variant PH-27-U16). WANG-spiller: «Del testene med Team Norway» (bare tester, krever ja; under 16 også forelder). Felles testdag krever ikke samtykke (05.10) | |
| PH-IUP-01 | Fireukerssjekk (04.10, runde 38 · bare WANG-/TN-gruppe) | `/portal/iup/fireukerssjekk` | Fra kortet i PH-01. Steg: prosessmål (Ja · Delvis · Nei) → sju områder (IUP 2027, skala 1–5, Ung 34 · Junior 43 · Amatør 47 · Profesjonell 38) → lever. Autolagring, lagringsfeil i kø med «Prøv igjen», forrige svar per spørsmål. Levert: snitt per område mot forrige runde; 2025-historikk vises for seg, sammenlignes ikke. Varianter -UNG, -KO, -LEVERT | |
| PH-IUP-02 | Sesongevaluering (04.10, runde 38 · bare WANG-/TN-gruppe) | `/portal/iup/sesongevaluering` | Fra kortet i PH-01 uke 42 (PH-01-SESONG). 3 åpne spørsmål, 10 påstander 1–4, tidsfordeling faktisk/ønsket på fem pyramideområder (begge 100 %), minst tre forbedringspunkter; merket «Prosessmål» legges i Målsetninger. Variant -LEVERT | |
| PH-11-MAL-IUP | Workbench › Målsetninger · IUP-måltall (04.10, runde 38 · tillegg) | `/portal/planlegge/workbench?vis=malsetninger&iup=1` | 37 måltall i ni grupper, K1–K4 2026/27, årsresultat bare med fire kvartaler, auto/egen med kilde. «Sett mål» per rad. Filter Alle · Med mål · Uten mål | |
| PH-25 | Abonnement og innstillinger (runde 23) | `/portal/meg/abonnement*`, `/portal/oppgrader` (`?fra=laast`), `/portal/meg/innstillinger/*`, `/portal/meg/sikkerhet/2fa`, `/portal/varsler`, `/portal/meg/help*`, `/portal/meg/feedback` | Abonnement, «Bytt kort og se kvitteringer» (Stripe-kundeportalen), samtykker Ytelsesbilde og opptak i coachingøkt, varsler, 2FA, hjelp, «Slett konto» (skriv SLETT) | |
| PH-26 | ~~Utenfor banen~~ **Utgår 28.09** | `/portal/utenfor-banen`, `/portal/fysisk`, `/portal/tren/fys-plan`, `/portal/utfordringer*`, `/portal/trening/*`, `/portal/ukesdigest`, `/portal/tren/turneringer*` | FYS-økt, utfordringer, putte-lab, break-tabell, turneringsplan, ukesdigest | |

## AgencyOS (`/admin`) — Cockpit · Innboks · Stall · Kalender · Workbench · Mer (28.09)

Cockpit er startskjerm. Kø og oppfølgingskø ligger i Innboks. Caddie-chatten ligger under Mer og i hurtigknappen. Innsikt er fordelt til Stall, Spiller 360 og Stats. Mer: Caddie · Booking · Tester · Turneringer · TrackMan og video · Rapporter · Økonomi · Oppgaver · Oppsett · Drift. Hurtigknapp: Ny økt i Workbench · Ny melding til spiller · Registrer runde · Spør Jarvis · Ny booking. Bjelle øverst åpner Innboks.

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| AG-01 | Cockpit (runde 25 · startskjerm) | `/admin/agencyos`, `/meg` | Tellerrad (meldinger venter, følger ikke planen, turneringer denne uka, forslag venter) · dagens kalender 05:00–22:00 med coaching- og gruppeøkter, spiller/gruppe, sted, «Start live» · venter på svar (egne grupper, nyeste først, kort svar i raden, hele samtalen i Innboks) · oppgaver fra Notion (forfalt og frist i dag, huk av) · turneringer denne uka (egne grupper, dager til start, etterpå brutto og plassering) · følger ikke planen (under 70 % to uker på rad, laveste først, lenke til Spiller 360) · nøkkeltall (aktive spillere, økter i stallen denne uka, snitt etterlevelse; ingen økonomi)
| AG-02 | Kø (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/admin/ko` | Slått inn i AG-04
| AG-03 | ~~Oppfølgingskø~~ **Utgår 28.09** → Innboks › Oppfølging | `/admin/queue` | Kolonnene Risiko · Følg med · Sjekk · Løst er filter under Oppfølging i AG-04
| AG-04 | Innboks (runde 26) | `/admin/kommunikasjon`, `/admin/email-templates/[id]/rediger` | Én liste for alt: e-post fra post@akgolf.no og akgolfgroup@gmail.com, meldinger/videoer/spørsmål fra spillere, oppfølging, godkjenninger og forslag fra motoren, varsler om planendringer og turneringer, sammendrag fra opptak, leads, planendringsønsker (B8), forslag til nye gruppeøkter. Haster først, deretter nyeste. Filterbrikker Alle · Spillere · E-post · Godkjenn · Oppfølging · Varsler; under Oppfølging Risiko · Følg med · Sjekk · Løst · Leads (A12, A7). Utkast fra Jarvis og AI åpne i raden med Send · Rediger · Forkast. «Ferdig» tar saken ut. Spørsmål fra spiller ubesvart 24 t = Haster. Tom: «Alt er håndtert.» Jarvis-chatten er AG-19. «Svar» uten utkast: tomt skrivefelt i saken + «Lag utkast» (Jarvis), coach sender. Variant AG-04-HASTER
| AG-05 | Kalender (runde 28) | `/admin/kalender`, `/admin/kalender/hendelse/[id]`, `…/ny`, `/admin/availability` | Alle bookinger i AK Golf: dag · uke · måned · år. Alle coacher synlige, filter på coach. Dag: kolonne per coach. Økta viser initialer, tjeneste og påmeldte mot plasser; farge = akse, aldri coach. Gruppeøkter faste og åpne for booking. Forslag til ny gruppeøkt (B1) som stiplet skisse og i Innboks. Flytt økt → «Varsler X spillere · Angre» i 10 s (push, ellers EP-02). Head coach ser alt; assistant coach egne økter og gruppeøkter (AG-05-ASS). Google koblet begge veier; spillernes private hendelser bare «Opptatt». Treningssamling (B7) egen blokk. Varianter AG-05-UKE, -MND, -AR. Runde 29: alle coacher har økter mandag; synk og nålinje 08:20; «Se forslag» som knapp
| AG-06 | Booking (runde 30 · Mer) | `/admin/bookinger/[id]`, `/admin/bookinger/ny`, `/admin/services` | «Ny booking» øverst og i hurtigknappen: spiller → tjeneste → tid → bekreft (AG-06-NY). Test-tjeneste tildeler testen automatisk. Tjenester og priser fra data med kilde. Offentlig booking bekreftes automatisk; coach kan avlyse (Angre)
| AG-07 | Stall (runde 27) | `/admin/spillere`, `/admin/spillere/ny` | Tre bånd: I dag (spillere du coacher i dag, klokkeslett) · Trener nå (økt i gang, hvilken økt og hvor langt, «Send melding» som hurtigmelding eller fritekst-varsel, spilleren svarer med ett trykk; følg repetisjonene uten å endre) · Hele stallen (stall-matrisen: Trenger deg · Følger planen · Hviler). Rad per spiller: navn, kategori, etterlevelse 4 uker, SG-trend 30 dager, siste økt, neste turnering, grunn til oppfølging, «plan slutter om X dager», avtale (klipp igjen, fornyes), ACWR «—». Sortert etter hvem som trenger deg først. Kortrader på mobil. Stall-matrisen Trenger deg · Følger planen · Hviler og hurtigmeldingene OK · Spørsmål · Ikke nå bekreftet 28.09
| AG-08 | Spiller 360 (runde 27) | `/admin/spillere/[id]`, `…/rediger`, `…/turnering-kobling` | Spillerkort og «Dette krever deg nå» · Send melding · Åpne Workbench · Start live · IUP-samtale (alle spillere). Faner Plan (uke, turneringsoversikt uten bekreftelse av påmelding, B2 «Hvilken standardplan virker» ESTIMAT) · Stats (samme som spilleren, PGA alltid på, sammenligning med stallen) · Teknisk plan (A10 TrackMan-baseline) · Tester · IUP (AG-08-IUP) · Samtaler (IUP, opptak, notater, videoer; B5 Caddie husker, coach kan slette) · Talent (talentradar 1–10, bare coach). Varianter AG-08-PLAN, AG-08-TALENT. Talentradar med stiplet Kategori C bekreftet 28.09 (bare coach)
| AG-09 | ~~Spilleranalyse~~ **Utgår 28.09** → Spiller 360 › Stats | `/admin/spillere/[id]/analyse`, `/admin/analyse`, `/admin/runder` | Slått inn i Stats-fanen i AG-08
| AG-10 | Teknisk plan | `/admin/plan/teknisk`, `/admin/spillere/[id]/plan`, `…/plan/[planId]` | Posisjoner P1.0–P10.0, oppgaver, rep per læringssteg og miljø, TrackMan-mål på skala, treffprotokoll, kvalitetssjekk, siste registreringer (utvidet 27.09) |. Runde 27: også som fane Teknisk plan i Spiller 360 med TrackMan-baseline «Bruk som startverdi» (A10). Eies av AG-TP.jsx; bare posisjonene P1.0–P10.0 gjelder (ingen mellomposisjoner, ingen konstruert uketyperekkefølge). «Legg i økt» velger oppgave (taskId, revisjon, snapshot) inn i konkret økt i AG-11 Økt. |
| AG-11 | Workbench (coach, runde 29) | `/admin/workbench/[playerId]`, `/admin/grupper/[id]/workbench` | Samme Workbench som spilleren, pluss velgere for Gruppe og Spiller med søk, Forrige/Neste og sist brukte. Enkeltspillere og grupper på alle nivåer. Gruppeplanen er grunnmuren (A4): endring slår gjennom til alle uten egen versjon. A3: Dupliser uke · Dupliser økt · Bruk mal på spiller · Coachnotat · Søk i tekniske oppgaver. B4 «Planforslag for gruppa» (Skjult ved lansering). Nivåer År · Periode · Måned · Uke · Økt og Målsetninger (bytter ut kalenderen i midtfeltet). Dra pyramideakse ut og slipp på klokkeslett (eller trykk akse, så klokkeslett) → Gjenta: ikke · hver uke · annenhver · valgte dager · til dato · ut perioden. Senere endring av gjentatt økt: bare denne eller alle framover. Sidefelt: øvelsesbank (pyramide først, banken filtreres, «+» egen øvelse med AK-formel v2: pyramide, område (19), læringssteg, treningsmiljø, press) · fysisk program · øktmaler · turneringer · ny teknisk plan · målsetninger. Målsetning: resultat- eller prosessmål, start/slutt, knyttet til år/periode/måned/uke/økt, målbar på alle parametere, fremdrift automatisk. Gruppeøkter arves automatisk; tilpasning = «Egen». B7 treningssamling som blokk (uke 41). Varianter AG-11-GRUPPE, -AR, -OKT, -MAL, -FYS. Runde 30: AK-formel v2 rettet etter src/lib/domain/ak-formel-v2.ts (19 områder, 3 motorikk, 4 belastning, 4 press; putt uten motorikk). Mobil: Forrige/Neste rundt velgeren, snarveier bak «Mer», dagrad med alle sju dager
| AG-12 | Øktark etter live (runde 25) | `/admin/gjennomfore/okter/[id]` | Sammendrag som utkast til coach, godkjent går rett til spilleren. «Navn tas ut før teksten sendes til AI.» Hjemmelekse i planen. TrackMan-baseline med «Bruk som startverdi» (A10). Filer fra økta. Avgjort 28.09: sammendraget etter live-økta, utkast til coach, godkjent går til spilleren
| AG-13 | Live coachingøkt (runde 25) | `/admin/agencyos/live/[sessionId]` | Fra «Start live»: spillerkort (navn, kategori, HCP, siste runde med SG, aktive målsetninger) · teknisk plan (P1.0–P10.0, oppgaver, bilde, video) · video, bilde og målbilde fra iPhone · opptak og notater (A2). Opptak krever samtykke fra oppstart; spilleren ser «Opptak pågår». Uten samtykke er opptak sperret med forklaring (variant AG-13-U). Hjemmelekse i planen med ett trykk
| AG-14 | Plan-hub, maler og øvelser | `/admin/plan`, `/admin/plan/maler`, `/admin/plan-templates/[id]`, `…/rediger`, `…/ny` | Ukemaler, program, standardøkter, aksefordeling, opprett/rediger øvelse. 19 treningsområder, 6 puttebånd (rettet 27.09) |. Runde 29: øvelsesbank, øktmaler og egen øvelse ligger også i Workbench-sidefeltet
| AG-15 | Tester (runde 30 · Mer) | `/admin/tester`, `/admin/tester/benchmarks`, `/admin/tester/tildel/[spillerId]`, `/admin/spillere/[id]/tester` | Tildel, normer (A–K «Referanse ikke satt»), TN-poengskala, TrackMan-økter tildelt
| AG-16 | Grupper (runde 30 · Mer) | `/admin/grupper`, `/admin/grupper/[id]`, `…/timeplan`, `…/arsplan`, `…/arsplan/skoledata`, `/admin/agencyos/ak-stigen` | Søk opp spillere med PlayerHQ og hak av gruppene. Tildel tester og TrackMan-økter til gruppa. Medlemmer, faste tider, skoledata. Gruppeplanen: lenke til Workbench (AG-11-GRUPPE)
| AG-17 | Turneringer (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/admin/turnering`, `/admin/tournaments/[id]`, `/admin/tournaments/ny` | Påmeldinger bekreftes ikke
| AG-18 | TrackMan og video (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/admin/trackman`, `…/[sessionId]`, `/admin/videoer`, `/admin/recording` | TrackMan-økter tildeles i Tester og Grupper
| AG-19 | Jarvis-chat (fra hurtigknappen) | `/admin/jarvis`, `/admin/agents/[agentId]` | Egen side, nås fra hurtigknappen «Spør Jarvis». Ikke i Mer
| AG-20 | Økonomi (runde 30) · **Bare head coach** | `/admin/agencyos/okonomi` | Budsjett og regnskap fordelt på AK Golfs tjenester: Coaching privat · Grupper · GFGK-avtalen · Gruppetimer · Andre tjenester fra AK Golf. Budsjett legges inn, Tripletex-eksport lastes opp hver måned, Stripe leses for betalinger. Tall fra kilden med dato, «—» der tallet mangler. Bare head coach (bekreftet 28.09): assistant coach ser verken punktet i Mer eller siden (AG-20-ASS)
| AG-21 | Oppgaver (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/admin/oppgaver`, `/admin/workspace/notion` | Oppgaver fra Notion (Tasks og Prosjekter) ligger i Cockpit
| AG-22 | Innsikt og talent (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/innsyn/talent/radar`, `…/discovery`, `…/sammenligning`, `…/wagr-import` | Talentradar 1–10 i Talent-fanen i AG-08. Vises aldri for spilleren
| AG-23 | Oppsett (runde 30 · Mer · AG-24 slått inn · runde 36: én komponent, gamle AG-23.jsx/AG-24.jsx arkivert i arkiv/2026-09-30/) | `/admin/oppsett`, `/admin/profile`, `/admin/team/ekstern`, `/admin/team/inviter`, `/admin/marketing` | Profil · team og invitasjoner · GDPR · logger · markedsføring · hjelp. Roller: head coach og assistant coach (AG-23-TEAM)
| AG-24 | Drift (beholdes, Anders 04.10: «De skal med». Kan fjernes senere) | `/admin/audit-log`, `/admin/feillogg`, `/admin/gdpr`, `/admin/hjelp` | Logger og GDPR er faner i AG-23

## Runde-registrering for Strokes Gained (nytt 27.09.2026)

Erstatter PH-09 som byggegrunnlag for runde-registrering. PH-09 og PH-18 består som oversikt.

| ID | Skjermtype | Rute | Må vise | Natt |
|---|---|---|---|---|
| PH-RD-01 | Registrer runde · velg nivå | `/portal/mal/runder/ny` | Tre nivå (rask score, import/manuell SG, slag-for-slag) med «Hva får du ut av dette?» og datakvalitet; fortsett kladd |  |
| PH-RD-02 | Registrer runde · oppsett | `/portal/runde/logg` | Bane, dato, tee/lengdemal, start-hull, 9/18, turnering/trening, gjenopprett/forkast kladd, lokal lagring |  |
| PH-RD-03 | Live runde · slag (runde 24) | `/portal/runde/live` | Per slag påkrevd: avstand (m), underlag, kølle. Straffeslag med ett trykk. «I hull» avslutter hullet. Går automatisk til neste slag; trykk et tall for å rette. Ingen GPS eller banekart | Natt |
| PH-RD-04 | Live runde · putt (runde 24) | `/portal/mal/runder/[id]/slag` | Putt påkrevd: lengde i fot, break (venstre→høyre, høyre→venstre, oppover, nedover), resultat, fart (kort/lang) og hvor man bommer | Natt |
| PH-RD-05 | SG hittil | `/portal/runde/live (ark)` | Natt, bare fullførte hull, dekning, estimat, OTT/APP/ARG/PUTT symmetrisk | Natt |
| PH-RD-06 | Etterregistrering · rask score | `/portal/mal/runder/ny` | Total eller hull for hull, 9 hull krever hull for hull, putter/FW/GIR, manuell SG egen seksjon med sumkontroll, datakvalitet |  |
| PH-RD-07 | Import fra annen app | `/portal/mal/runder/ny?kilde=import` | CSV last opp/lim inn, kolonnemapping, påkrevde/valgfrie, forhåndsvisning, hva ble lagret og hva mangler |  |
| PH-RD-08 | Runde gjennomført (runde 24) | `/portal/mal/runder/[id]` | Brutto score, SG per kategori og Tiger 5 med en gang. «Planen din oppdateres» (runde-agentene, A1) |  |
| PH-RD-09 | Rediger runde | `/portal/mal/runder/[id]/rediger` | Scorekort, manuell SG (beskyttet), slag-for-slag, revisjon og kilde |  |
| AG-RD-01 | Rundeanalyse | `/admin/runder` | Runder per spiller, datakvalitet og kilde, filter, forslag som utkast til Workbench | |
| AG-RD-02 | Manglende SG-grunnlag | `/admin/runder?fane=kvalitet` | Runder uten SG-grunnlag i vanlig språk; be om slagdata, importer, godta scorekort, ignorer | |

## Teknisk plan og progresjon (nytt 27.09.2026)

Utvider AG-10. Ingen regel sperrer noe; status vises, neste steg låses aldri. Spesifikasjon: `overlevering/teknisk-plan-progresjon-2026-09-27.md`.

| ID | Skjermtype | Rute | Må vise |
|---|---|---|---|
| AG-TP-01 | Oppgaveskjema | `/admin/spillere/[id]/plan/[planId]?oppgave=[taskId]` | AK-formel øverst, posisjon · slag · område · læringssteg · teknisk fokus · kølle · miljø og press · måleutstyr · TrackMan-mål · rep-mål · treffprotokoll. Inspektør 340, ark ≤ 1024. «Lagret 08:41 · ikke publisert» Runde 35: DS-komponentene i components/plan. Runde 37: høyde 3×3 og skru, før og etter, teknisk fokus uten datatap. Posisjon P1.0–P10.0, én om gangen. |
| AG-TP-02 | Før og nå per posisjon | `/admin/spillere/[id]/plan/[planId]/for-og-na` | To daterte bilder, side om side og delelinje (dra, piltaster, knapper), coachnotat, tom ramme. Krever tillegg i datamodellen: to daterte bilder per oppgave. I dag finnes ett bilde og én video Runde 35: DS-komponentene i components/plan. Runde 37: to mediespor (før og etter), bilde eller video, alle tilstander. |
| PH-TP-01 | Teknisk plan (spiller) | `/portal/tren/teknisk-plan/[planId]` | Leser planen, Start økt, Registrer repetisjoner (Stepper xl, +10/+25, video, kommentar), kvalitetssjekk, svingtidslinje med tekniske krav, milepæler, før og nå, siste registreringer. Utkast-tilstand. Lenket fra PH-10 og PH-11-MAL. Runde 37: før og etter (les), Start økt bærer sessionId. |
## Workbench · fysisk plan og turneringer (nytt 27.09.2026)

Underflater av AG-11 og PH-11. Samme motor for coach og spiller.

| ID | Skjermtype | Rute (forslag) | Må vise |
|---|---|---|---|
| AG-WB-FYS | Workbench · fysisk plan | `/admin/workbench/[playerId]?pille=fys` | Spiller/gruppe, uke/blokk/sesong, status inkl. «Endret etter publisering», inspektør med belastning, respons og historikk, trekk tilbake. Blokk (mål, uker, deload, test), ukevolum, fysiske økter per dag, øvelser (serier, reps, kg, RIR, hvile, tempo, varighet, sone), planlagt mot gjennomført, publiser |. Runde 29: sidefelt «Fysisk program» i Workbench legger programmet inn og lenker hit
| AG-WB-TURN | Workbench · turneringer | `/admin/workbench/[playerId]?pille=turn` | Konfliktstripe, format, reisedager, flytt turnering (uke). Turneringer i perioden med type, forberedelse dag for dag, runder, mål og strategi, etter-turnering med brutto og kilde, publiser/trekk tilbake |. Runde 29: sidefelt «Turneringer» i Workbench lenker hit
| PH-WB-FYS | ~~Fysisk plan (spiller)~~ **Lag i Plan (28.09)** | `/portal/tren/fys-plan` → Plan | Laget Fysisk i PH-10. Økta åpnes i Plan; sett registreres når økta startes |
| PH-WB-TURN | ~~Turneringsplan (spiller)~~ **Lag i Plan (28.09)** | `/portal/tren/turneringer/[id]` → Plan | Laget Turneringer i PH-10. Turneringsreisen (forberedelse → runder → brutto score → evaluering) åpnes som ark i Plan |

## Workbench over uka · årsplan, periode, måned (runde 33 · Anders 28.09.2026, bindende)

Samme Workbench for spiller (PH-11) og coach (AG-11). Kode: `ui_kits/_shared/WB3-ar.jsx`, data `WB3.yr` i `data-wb3.js`. Tom: «Opprett årsplan» er eneste handling (sidefelt og snarveier skjules).

| ID | Skjermtype | Rute (forslag) | Må vise |
|---|---|---|---|
| PH-11-AR · AG-11-AR | Årsplan | `…/workbench?niva=ar` | Periodene som tynt tekstbånd over året (ikke fylte blokker; farge = bare akse). To lag: perioder · samlinger/testuker/ferie. Månedene er knapper til måned. Periodeliste med kilde (FRA GRUPPA / FRA ANDERS / EGEN). «Opprett årsplan» (grafitt) og «Ny periode» |
| PH-11-NY · AG-11-NY | Opprett årsplan (veileder) | `…?niva=ar&ny=1` | 1 Utgangspunkt: kopi av fjoråret · standardplan (alle fem i alle kategorier, tilpasses kategori) · gruppas årsplan · tom plan. 2 Tidsrom fritt, forslag skoleår aug–jun for WANG, ellers kalenderår. 3 Navn og sammendrag → «Opprett årsplan». Coach: for spiller eller gruppe fra velgeren |
| AG-11-GRUPPE-AR | Gruppas årsplan | `/admin/grupper/[id]/workbench?niva=ar` | Rulles ut til medlemmene; de med egne perioder beholder dem |
| PH-11-PER · AG-11-PER | Periode | `…?niva=periode` | Fokus, timer per uke per akse FYS · TEK · SLAG · SPILL · TURN, notat, ukene med fordelte timer |
| PH-11-PERSKJEMA · AG-11-PERSKJEMA | Periodeskjema | `…?niva=periode&rediger=[id]` | Ark på mobil, dialog på desktop. Type, start/slutt, fokus, timer per akse, notat. «Slett periode» = rust (eneste). Coach kan legge inn, endre og slette spillerens perioder |
| PH-11-MND · AG-11-MND | Måned | `…?niva=maned` | Eget innhold: fokus og mål (Målsetninger), timer per akse fordelt på ukene (periodene gir / fordelt), tester og turneringer, notat, evaluering når måneden er over (coach og spiller hver sin) |
| PH-11-MNDSKJEMA · AG-11-MNDSKJEMA | Månedsskjema | `…?niva=maned&rediger=1` | Samme felt redigerbare. Uka arver fordelingen: Uke viser planlagt mot fordelt per akse |

## PlayerHQ · Stats › Trening (nytt 27.09.2026 · utgår 28.09, slått inn i PH-16 runde 22)

Under Stats-fanen (tidligere Analyse). Inngang fra PH-16. Alle sider: periode, sammenligning, kilde/dato/n, graf ↔ tabell, tom = «for lite data» med neste handling.

| ID | Skjermtype | Rute (forslag) | Må vise |
|---|---|---|---|
| PH-A01 | ~~Treningsanalyse · oversikt~~ **Utgår 28.09** → Stats › Trening | `/portal/analysere/trening` | Hva utvikler seg, hva haster, neste handling, innganger til alle deler |
| PH-A02 | ~~Treningsbelastning~~ **Utgår 28.09** → Stats › Trening | `/portal/analysere/trening/belastning` | Volum per akse per uke mot plan, ACWR, RPE og dagsform, graf ↔ tabell |
| PH-A03 | ~~Øktkvalitet~~ **Utgår 28.09** → Stats › Trening | `/portal/analysere/trening/okter` | Planlagt mot gjennomført, hoppet over, avbrutt, RPE og dagsform per økt |
| PH-A04 | ~~Slagdata~~ **Utgår 28.09** → Stats › Trening | `/portal/analysere/trackman (fane Analyse)` | Kølle-filter, carry-trend, spredning, gapping, datakvalitet |
| PH-A05 | ~~Nærspill og putting~~ **Utgår 28.09** → Stats › Strokes Gained | `/portal/analysere/trening/naerspill` | Putting per sone i fot mot referanse, 3-putter, treffvindu wedger |
| PH-A06 | ~~Rundeanalyse~~ **Utgår 28.09** → Stats › Snittscore | `/portal/analysere/historikk (fane Runder)` | Brutto, SG OTT/APP/ARG/PUTT symmetrisk, kilde/dato per runde, manuell/annen app |
| PH-A07 | ~~Tester · utvikling~~ **Utgår 28.09** → Stats › Tester | `/portal/tren/tester (fane Utvikling)` | Siste resultat, trend, gyldighet, neste test. Historikk, testsignal, coachens valg som status, Gjennomfør test på nytt (utvidet 27.09) |
| PH-A08 | ~~Datagrunnlag~~ **Utgår 28.09** → Stats › nok data-merking i hver del | `/portal/analysere/kilder` | Kilder, sist oppdatert, n, hva mangler, handling per kilde |

## AgencyOS · tidligere Innsikt (nytt 27.09.2026, fordelt 28.09)

Ikke eget menypunkt fra 28.09. A01 → Stall › Trenger oppfølging, A02/A04 → Spiller 360 › Stats, A03 → Stall › Grupper, A05 → Innboks › Datakvalitet, A06 → Workbench › Tiltak, A07 → Mer › Rapporter, A08 → Innboks › Caddie-forslag. Erstatter ikke AG-09; AG-09 er spillerens SG-flate, AG-A02 samler alt.

| ID | Skjermtype | Rute | Må vise |
|---|---|---|---|
| AG-A01 | ~~Innsikt · oversikt~~ **Utgår 28.09** → Spiller 360 og Grupper | `/admin/analyse` | Ingen egen Stats-side for coach under Mer
| AG-A02 | Spilleranalyse samlet | `/admin/analyse?fane=spiller, /admin/spillere/[id]/analyse` | Én spiller: SG, TrackMan, økter, tester, runder, coachnotater |
| AG-A03 | Gruppeanalyse | `/admin/analyse?fane=stall` | Gruppesnitt: nivå, datadekning, belastning, gjennomføring. Ingen rangering |
| AG-A04 | Plan mot faktisk | `/admin/analyse?fane=etterlevelse` | Avvik per akse og volum, konkurranseperiode |
| AG-A05 | Datakvalitet | `/admin/analyse?fane=data` | Importstatus, manuell data til kontroll, dubletter, manglende kilder |
| AG-A06 | Tiltaksverksted | `/admin/analyse?fane=tiltak` | Analyse → forslag → rediger → publiser, trekk tilbake |
| AG-A07 | ~~Rapportbygger~~ **Utgår 28.09** | `/admin/reports` | Fjernes. Ikke i navigasjonen i Spiller 360 eller Grupper
| AG-A08 | Caddie-forslag | `/admin/analyse?fane=caddie, /admin/jarvis` | Forslag med kilde og konsekvens, godkjenn/rediger/avvis, angre |

## Forelder (`/forelder`)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| FO-01 | Forelder i dag | `/forelder`, `/forelder/ukerapport`, `/forelder/varsler` | Dagens økt, neste booking, uke, ACWR-varsel |
| FO-02 | Barn | `/forelder/barn`, `/forelder/barn/[childId]` | Koblede barn, utviklingsprofil |
| FO-03 | Booking for barn | `/forelder/bookinger*` | Velg barn, tjeneste, tid, bekreft |
| FO-04 | Økonomi | `/forelder/okonomi`, `/forelder/fakturaer` | Abonnement, neste trekk, fakturaer |
| FO-05 | Samtykke | `/forelder/samtykke`, `/forelder/samtykke/deling/[childId]` | Under 16 år, deling, revisjonshistorikk |. Runde 31: godkjenn eller avslå deling for barn under 16
| FO-06 | Coach og innstillinger | `/forelder/coach`, `/forelder/innstillinger` | Coach, siste melding, egen kontakt |

## Konto, innlogging og onboarding

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| AU-01 | Logg inn | `/auth/login`, `/auth/bankid`, `/auth/logget-ut` | E-post/passord, Google, BankID-plassholder |
| AU-02 | Registrer | `/auth/signup`, `/auth/check-email`, `/auth/checkout-resume` | Pakke, samtykke, sjekk e-post |
| AU-03 | Passord | `/auth/forgot-password`, `/auth/reset-password` | Be om lenke, nytt passord |
| AU-04 | Oppstart (runde 23 · audit alle steg) | `/auth/onboarding`, `/auth/onboarding/forelder` | Spiller: alder, HCP, snittscore, turneringsnivå, SG i år og forrige sesong · fasiliteter (kan fullføres senere) · finn deg i turneringsresultatene (golf-ID eller navn + fødselsår, mellomnavn ignoreres, kan hoppes over) · teknikktest (anbefalt, Inspill Basic: sandwedge, 7-jern, driver, carry og avstand fra mål; med TrackMan spredning og variasjon i seks parametere; viser største svakhet, setter ikke nivå) · samtykker (Ytelsesbilde, opptak; under 16 gir forelderen samtykket) · velg treningsplan (fem standardplaner tilpasset A–K). Coach og forelder som før. Audit kjører alle sju steg (AU-04, AU-04-2 til AU-04-7). Fasilitetsspørsmålene gjelder alle spillere. Treningsplan anbefales etter turneringsnivå (Region/Nasjonalt/Internasjonalt → Konkurransespilleren, ellers Klubbspilleren); spilleren velger selv. Alle fem standardplaner kan velges i alle kategorier A–K; innholdet tilpasses kategorien (28.09)
| AU-05 | Samtykke via lenke | `/auth/guardian-consent/[token]`, `/auth/lyd-samtykke/[token]`, `/auth/samtykke-venter`, `/inviter/forelder/[token]` | Forelder bekrefter, spiller venter |
| AU-06 | Innsyn (ekstern leser) | `/innsyn`, `/innsyn/[spillerId]` | Samtykkede resultater per gruppe og spiller |

## Booking (offentlig)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| BK-01 | Velg tjeneste | `/booking` | Fire steg i én flyt, pauset-tilstand |
| BK-02 | Velg tid og betal | `/booking/[slug]`, `/booking/[slug]/bekreft` | Dag/uke, tidsluker, Stripe, Vipps |
| BK-03 | Kvittering | `/booking/kvittering/[bookingId]` | Referanse i mono, .ics, opprett konto |

## Statistikk (`/stats`, `/turneringer`)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| ST-01 | Stats-hub og søk | `/stats`, `/stats/sok`, `/stats/uka`, `/stats/2026`, `/stats/leaderboards`, `/stats/norske` | Live-snapshot, innganger, «Powered by Data Golf» |
| ST-02 | Liste med filter | `/stats/spillere`, `/stats/klubber`, `/stats/baner`, `/stats/turneringer`, `/stats/aargang*`, `/stats/regions`, `/stats/pga/spillere`, `/stats/blogg`, `/turneringer` | Tabell → kortrader, filter som bryter linje |
| ST-03 | Profil/detalj | `/stats/spillere/[slug]`, `/stats/klubber/[slug]`, `/stats/baner/[slug]`, `/stats/regions/[slug]`, `/stats/tour/[slug]`, `/stats/pga/spillere/[dg_id]`, `/stats/blogg/[slug]` | Nøkkeltall, trend, resultater |
| ST-04 | Turnering | `/stats/turneringer/[slug]`, `…/statistikk`, `/turneringer/[slug]` | Leaderboard live, scorefordeling |
| ST-05 | PGA-kategori og utforskere | `/stats/pga`, `/stats/pga/*` (6 kategorier), `/stats/pga/putt-explorer`, `/stats/sammenlign-spillere`, `/stats/sg-sammenlign*`, `/stats/min-progresjon` | Percentil, sammenligning, egne tall |
| ST-06 | Verktøy og moro | `/stats/verktoy*` (6), `/stats/quiz`, `/stats/wrapped/[slug]` | Kalkulatorer, quiz, sesongoppsummering |

## GFGK Junior og system

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| GJ-01 | GFGK Junior forside og grupper | `/gfgk-junior`, `/gfgk-junior/gruppe/[gruppe]`, `/gfgk-junior/treningsplaner`, `/gfgk-junior/kalender` | AK-stigen (fire trinn), gruppeplan, kalender |
| GJ-02 | GFGK veileder | `/gfgk-junior/veileder`, `/gfgk-junior/veileder/[slug]` | Kategorier, artikkel |
| SY-01 | Systemtilstander | `/offline`, `/vedlikehold`, 404, 500 | Feilkode i mono, hva nå |

## Kodekontroll mot GitHub 27.09.2026

Kontrollert mot `akgolfsoftware/Golf_Headquarters@main` (se `github.md`). Alle 74 skjermtyper har rute i koden. Nye ruter uten egen rad er enten videresendinger (lagt til i raden de lander i) eller utenfor omfang:

- `/portal/toppidrett` (Presisjonsanalyse, sju faner) — egen analyseflate. Tegnes ikke; Claude Code videresender til `/portal/analysere` (PH-16 Stats).
- **Kildemateriale · Toppidrett-moduler (`ui_kits/toppidrett/`) er råstoff, ikke egen app (28.09):** Ytelsesbilde og Kategori A–K → Stats › Snittscore · SG → Stats › Strokes Gained · Treningsanalyse og TrackMan → Stats › Trening · Ferdighetstest → Stats › Tester · Baseline og Onboarding → oppstart (AU-04) · Stall-matrise → Stall · Øvelse → Workbench · Banekart → senere.
- `/team-norway/*`, `/team-wang/*` — egne designsystemer. Bare grenseflater (se codex §8).
- `/skjermer`, `/demos/*`, `/team-gfgk` — interne eller slått av.
- Markedssidene (`/`, `/coaching`, `/priser` m.fl.) venter. Utkastet i `ui_kits/marked/` bruker TALENT/FULL som navn på coaching-medlemskap med egne priser. Det bryter produktregelen (Gratis/Full er app-nivå, coaching heter Performance/Performance Pro) og må rettes før markedssidene bygges.

## Workbench-forslag D1 (nytt 01.10.2026 · designkandidater, IKKE visuelt godkjent, IKKE valgt for bygging)

Tre isolerte kandidater for kalender, årsplan og periodisering (AG-05, AG-11-AR, AG-11-PER, måned/uke, PH-11). Erstatter ikke valgt master. Codex – ikke Grok – koder appen. Bare PH-01 er visuelt godkjent. Syntetiske data (Tobias Lindvik, Sesong 2026/27, i dag 01.10.2026, valgt fredag 02.10.2026).

| ID | Skjermtype | Fil | Status |
|---|---|---|---|
| WB-FORSLAG | Sammenligningsside, tre kandidater × 1440/390 | `ui_kits/workbench-forslag/index.html` | Utkast, ikke godkjent |
| WB-FORSLAG-1 | Tidslinje (sesong, månedsakse, detalj ved valg) | `ui_kits/workbench-forslag/kandidat.html?k=tidslinje` | Utkast, ikke godkjent |
| WB-FORSLAG-2 | Planbord (perioder/uker som kolonner, Flytt eller dra) | `…/kandidat.html?k=planbord` | Utkast, ikke godkjent |
| WB-FORSLAG-3 | Fokus (én flate, brødsmule, lag ved behov) | `…/kandidat.html?k=fokus` | Utkast, ikke godkjent |

## Merknader

- `/team-gfgk` er slått av (juniorresultater uten samtykke). Tegnes ikke.
- `/portal/tren/tester/team-norway` tegnes som del av PH-14 i dette systemet.
- Sider med flere faner (`/admin/ko`, `/admin/kommunikasjon`, `/admin/oppsett`, `/admin/turnering`, `/admin/jarvis`) tegnes med alle faner i samme skjermtype.
- Alle navn og tall i tegningene er oppdiktet. Barn under 16 vises aldri med fullt navn på åpne flater.
