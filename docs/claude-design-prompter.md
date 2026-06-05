# Claude Design — komplette prompter for alle skjermer (AK Golf HQ)

Slik bruker du dette dokumentet:

1. **Lim alltid inn DEL 1 (Design-DNA) først** i en ny Claude Design-samtale. Den gjør at alt får samme utseende.
2. **Lim så inn DEL 2 (mobil + desktop-regler)** under, i samme melding.
3. **Velg skjermen du vil tegne fra DEL 4** og lim prompten inn til slutt.

Da får hver skjerm samme farger, fonter, komponenter og oppførsel på mobil og data — uten at du må forklare det på nytt hver gang.

---

## DEL 1 — Design-DNA (lim inn ØVERST hver eneste gang)

```
Du designer skjermer for AK Golf HQ — en norsk golf-plattform. Følg dette
designsystemet helt nøyaktig på ALT du tegner. Ikke finn opp egne farger,
fonter eller komponenter.

SPRÅK: All tekst på norsk bokmål med æ, ø, å. Ingen engelsk i UI.

TO PRODUKTER MED FAST TEMA (aldri toggle):
- PlayerHQ (spillerens app): ALLTID lyst tema. Mobil-først.
- AgencyOS (coachens admin): ALLTID mørkt tema. Desktop-først, tett data.

FARGER (lyst tema — PlayerHQ):
- Bakgrunn #FAFAF7, tekst #0A1F17
- Kort: hvit #FFFFFF, tekst #0A1F17
- Primær (knapper/CTA): #005840 med tekst #D1F843
- Aksent (highlights/badges): #D1F843 med tekst #005840
- Sand (chips/sekundær): #F1EEE5
- Sekundær tekst: #5E5C57
- Slett/feil: #A32D2D · OK: #1A7D56 · Advarsel: #B8852A · Info: #2563EB
- Kantlinjer: #E5E3DD

FARGER (mørkt tema — AgencyOS): samme grønn/lime-logikk, men mørk bakgrunn
(nesten sort grønntonet), lyse tekster, kort i mørk grå-grønn. Lime #D1F843
er fortsatt aksent. Hold kontrasten høy og rolig — Bloomberg-aktig, ikke neon.

FONTER:
- Inter — vanlig UI og brødtekst
- Inter Tight — store overskrifter og hero (display)
- JetBrains Mono — alle tall (KPI, statistikk, tabeller) og små eyebrows
- Editorial kursiv = Inter Tight italic. Ingen andre fonter.

KOMPONENTER (bruk disse, ikke egne varianter):
- Hero øverst på sider (stor overskrift + kort kontekst)
- Kort (Card) og fremhevet kort (FeaturedCard)
- KPI-blokk for nøkkeltall (stort tall i mono + liten etikett)
- Eyebrow (liten versal etikett over en overskrift)
- Badge med varianter: ok / advarsel / haster / lime / primær / nøytral
- Knapp (primær, sekundær, ghost)
- Handlingsliste og kø-rad (action-list / queue-item)
- Avatar (sirkel), pulse-dot (liten statusprikk)
- Pyramide-progresjon (golf-ferdighetspyramide)
- Kalendere: måned, økt-planlegger, streak, dag-planlegger, varmekart, årsplan-gantt

IKONER: Kun Lucide-ikoner, 24px, tynn strek (1.5px). ALDRI emoji.

SPACING: 8-punkts grid (8/16/24/32px). På data-tette flater (tabeller,
innboks, dashboards i AgencyOS) er 12–14px tillatt for tetthet.

TONE I TEKST: kort, direkte, profesjonell. Ingen utropstegn. Ikke "Bra jobba!".
Bruk "Solid", "Sterkt". Aktiv stemme.

NAVNE-KANON (demo-data): spiller heter "Markus Berg", coach heter
"Anders Kristiansen". Alltid fulle navn.

PRODUKT-REGLER:
- Abonnement: enten gratis eller 300 kr/mnd. Ingen "tier-nivåer". Vis ALDRI ordet ELITE.
- All planlegging går gjennom "Workbench" — ett trykkpunkt, ikke en meny av kort.
- Analyse er én flate med faner (Analysere + TrackMan + Runder + SG), ikke separate moduler.
```

---

## DEL 2 — Mobil + desktop-optimalisering (lim inn rett under DEL 1)

```
Tegn HVER skjerm i to bredder, side om side, så jeg ser begge:

PLAYERHQ (mobil-først):
- Mobil: 430px bred. Dette er hovedutgaven. Bunn-navigasjon (tab-bar) med
  4–5 Lucide-ikoner. Innhold i én kolonne. Store touch-flater (min 44px høye).
  Hero på topp, så kort under hverandre.
- Desktop: 1280px bred. Samme innhold, men: venstre sidemeny i stedet for
  bunn-nav, og innholdet i 2–3 kolonner (kort i rutenett). Hero bredere.
  Ikke bare strekk mobilen — bruk plassen til flere kolonner.

AGENCYOS (desktop-først):
- Desktop: 1280px+ bred. Hovedutgaven. Venstre sidemeny (sammenleggbar),
  tett data i tabeller og paneler, flere kolonner, KPI-rad øverst.
  Bloomberg-tetthet: mye informasjon, rolig og strukturert.
- Mobil: 390–430px. Komprimert utgave: sidemeny blir bunn-nav eller hamburger,
  tabeller blir til kort-lister (én rad = ett kort), KPI-rad scroller vannrett.

FELLES RESPONSIVT:
- Samme farger, fonter og komponenter i begge bredder.
- Aldri vannrett scroll på mobil (unntatt bevisste chip-rader/KPI-strip).
- Tekststørrelser skalerer: hero mindre på mobil, tall forblir i mono.
- Knapper full bredde på mobil, naturlig bredde på desktop.
- iPad (768–1024px): følg desktop-oppsettet, men 2 kolonner i stedet for 3.

Vis alltid: mobil-rammen til venstre, desktop-rammen til høyre, med etikett over hver.
```

---

## DEL 3 — Mal for én skjerm (hvis du vil tegne noe som ikke står i DEL 4)

```
Skjerm: <navn>
Produkt: <PlayerHQ lyst / AgencyOS mørkt>
Hva skjermen er til: <én setning — hva brukeren gjør her>
Øverst (hero): <overskrift + kontekst>
Hovedinnhold (i rekkefølge): <seksjon 1, seksjon 2, ...>
Nøkkeltall som skal vises: <KPI-er>
Viktigste handling (CTA): <knapp/lenke>
Tegn mobil + desktop side om side etter reglene i DEL 2.
```

---

## DEL 4 — Ferdige prompter per skjerm

Hver prompt under forutsetter at DEL 1 + DEL 2 ligger øverst i samme samtale.
Skjermene er gruppert slik appen er bygd. ★ = hovedskjerm (prioriter disse først).

---

### PLAYERHQ (lyst tema, mobil-først) — `/portal`

**★ Hjem / Workbench-hjem** — `/portal`
```
Tegn PlayerHQ-hjem. Hero øverst med spillerens profilbilde i sirkel + navn
(Markus Berg) + tier-pill, så en samlet overskrift ("Klar for dagen").
Under hero: dagens økt-kort (hva skal trenes i dag), en KPI-rad
(handicap, SG totalt, økter denne uka), AI-innsikt-kort (kort tekst om formen),
og en handlingsliste med 2–3 neste steg. Bunn-nav på mobil, sidemeny på desktop.
```

**Varsler** — `/portal/varsler`
```
Tegn varsel-listen i PlayerHQ. Liste av varsel-rader (ikon + tittel + tid),
grupper "I dag / Tidligere". Uleste har lime prikk. Sveip/trykk for å markere lest.
```

**★ Planlegge → Workbench** — `/portal/planlegge/workbench`
```
Tegn spillerens Workbench — ett arbeidsbord for all planlegging. Venstre:
ukekalender med økter. Midten: valgt økts innhold (drills/øvelser i rekkefølge,
dra-og-slipp-følelse). Høyre: forslag fra coach + AI. Tett, men ryddig.
Dette er en kraftig flate — desktop er hovedutgaven, mobil komprimeres til faner.
```

**Årsplan** — `/portal/tren/aarsplan` (+ rediger periode `/periode/[id]/rediger`)
```
Tegn årsplanen som en sesong-tidslinje (gantt): periodene gjennom året
(grunntrening, oppbygging, konkurranse, hvile) som fargede bånd. Trykk en periode
for å se mål og økter. Lag også redigeringsvisning for én periode (datoer, fokus, mål).
```

**Teknisk plan + Fys-plan (liste + detalj/bygger)** — `/portal/tren/teknisk-plan`, `/fys-plan`
```
Tegn to liste-skjermer (tekniske planer og fys-planer) som kort-lister med
fremdrift-stripe per plan. Og en detalj/bygger-skjerm: planens oppgaver med
hit-rate (hvor ofte fullført), legg-til-øvelse, og en fremdriftsindikator øverst.
```

**Drills (bibliotek + detalj)** — `/portal/drills`, `/portal/drills/[id]`
```
Tegn drill-biblioteket: søk + filter-chips (område: driving/innspill/putting/fys),
rutenett av drill-kort (bilde, navn, varighet, vanskelighet). Og drill-detalj:
stor video/bilde øverst, beskrivelse, mål, "legg til i økt"-knapp, relaterte drills.
```

**Mål-hub + undersider** — `/portal/mal` (bygger, goal/[id], milepæler, leaderboard)
```
Tegn mål-hub: aktive mål som kort med fremdrift-ring, "nytt mål"-CTA.
Lag også: mål-bygger (wizard, steg for steg), mål-detalj (delmål + tidslinje),
milepæler (liste med datoer), og leaderboard (rangering blant spillere).
```

**Turneringer (mine + detalj + ny)** — `/portal/tren/turneringer`
```
Tegn spillerens turneringer: kommende + tidligere som kort (dato, bane, status).
Turnering-detalj: bane-info, startid, mål for runden, resultat etterpå.
Ny turnering: enkelt skjema (navn, dato, bane, type).
```

**Utfordringer** — `/portal/utfordringer` (+ ny wizard, detalj)
```
Tegn utfordringer: liste av aktive/tilgjengelige utfordringer som kort med
fremdrift og premie-merke. Ny-utfordring wizard og en detalj-skjerm med regler + rangering.
```

**AI-verktøy** — `/portal/ai/mal-bygger`, `/foresla-drill`, `/foresla-turnering`
```
Tegn tre AI-assistent-skjermer (mål-bygger, foreslå drill, foreslå turnering):
felles mønster — chat-/samtaleflate øverst, AI-forslag som kort man kan godta,
"bruk dette"-knapp. Lyst, vennlig, lime aksent på AI-svar.
```

**Gjennomføre-hub + Kalender + Ny økt** — `/portal/gjennomfore`, `/portal/kalender`, `/portal/ny-okt`
```
Tegn gjennomføre-hub (dagens + kommende økter), en kalender (måned + uke,
økter som prikker/blokker), og "ny økt"-skjerm med store handlingsvalg
(planlagt økt / fri økt / be coach om økt).
```

**Ønsket økt (be coach)** — `/portal/onskeligokt` (+ bekreftet)
```
Tegn "be coach om en økt": skjema (type, ønsket tid, notat til coach) + send-knapp,
og en bekreftet-skjerm (kvittering, "coach svarer snart").
```

**★ Live-økt (fullskjerm)** — `/portal/(fullscreen)/live/[sessionId]/...`
```
Tegn live-økt-flyten i fullskjerm (ingen nav), 4 skjermer:
1) Brief: hva økta handler om, mål, drills som kommer.
2) Aktiv: nåværende drill stor, fremdrift, neste-knapp, timer.
3) Drill-logger: tast inn resultat per drill (treff/bom, tall).
4) Score-tapper: rask tall-input med store knapper.
5) Oppsummering: hva ble gjort, SG-endring, ros, del-knapp.
Store touch-flater, rolig fokus, mørk-på-lys for konsentrasjon.
```

**Økt-detalj + planlagt + feiring** — `/portal/tren/[sessionId]`, `/planlagt`, `/feiring/[planId]`
```
Tegn økt-detalj (innhold + status), planlagt-økt (hva som kommer, start-knapp),
og en feiring-skjerm når en plan er fullført (konfetti-følelse uten emoji,
stort "Fullført", oppnådde mål, neste plan-forslag).
```

**★ Analyse-hub + Hull-analyse** — `/portal/analysere`, `/portal/analysere/hull`
```
Tegn analyse som ÉN flate med faner (Analysere · TrackMan · Runder · SG).
Standardfanen viser nøkkelgrafer (SG-trend, score-trend). Hull-analyse:
varmekart over banen + hull-for-hull tabell med hvor slag tapes/vinnes.
```

**Statistikk + undersider** — `/portal/statistikk` (metrikk/[metric], sammenlign, del runde)
```
Tegn statistikk-oversikt: KPI-rad + grafer (driving, innspill, putting).
Metrikk-detalj: én statistikk i dybden med trend. Sammenlign: to perioder side om side.
Del runde: pent delekort til sosiale medier.
```

**★ SG-Hub (Strokes Gained) + alle underfaner** — `/portal/mal/sg-hub`
```
Tegn SG-Hub: øverst totalt SG mot benchmark (stor mono-tall + søyle per område:
driving/innspill/nærspill/putting). Faner/underseksjoner: kølle-detalj, benchmark
(mot PGA/amatør), best vs nå, utstyr, avstander (yardage-bok), forhold (vær/bane),
strategi. Lag også coach-visning (coach ser spillerens SG). Tall i JetBrains Mono.
```

**Runder (liste + detalj + slag-for-slag + ny)** — `/portal/mal/runder`
```
Tegn runde-liste (kort: dato, bane, score, SG), runde-detalj (hull-for-hull),
slag-for-slag (hvert slag på et hull), og "logg ny runde" (rask inntasting,
hull for hull eller totaler).
```

**TrackMan (liste + sesjon)** — `/portal/mal/trackman` (+ [id])
```
Tegn TrackMan-liste (økter som kort med dato + nøkkeltall) og TrackMan-sesjon:
tabell over slag med ballhastighet/spinn/carry, + stabilitets- og trend-grafer.
Tette tall i mono.
```

**Tester + flyt** — `/portal/tren/tester` (detalj, katalog NGF, ny, ny egen, live, summary)
```
Tegn tester-oversikt (mine tester + resultater som kort), test-detalj (historikk + graf),
test-katalog (NGF-tester å velge), ny test + ny egen test (skjema), og test-live
(fullskjerm inntasting) + oppsummering. Bruk PLASSHOLDER-tall for resultater
(referanseformelen er ikke låst ennå — ikke hardkod fasit-verdier).
```

**Bane-bibliotek** — `/portal/mal/baner` (+ [id])
```
Tegn bane-bibliotek (søkbar liste av baner som kort) og bane-detalj
(hull-oversikt, par, lengde, kart-bilde).
```

**Coach-seksjon (PlayerHQ-siden)** — `/portal/coach/...`
```
Tegn spillerens coach-flate: coach-hub (din coach + snarveier), meldinger (innboks-liste
+ tråd + ny melding + vedlegg), coach-planer (delte planer + detalj), coach-øvelser,
coach-videoer, coach-notater, "spørsmål til coach", og coach-AI. Felles: lyst, rolig,
meldinger ligner moderne chat (bobler), coach-avatar synlig.
```

**★ Meg / profil-seksjon** — `/portal/meg/...`
```
Tegn "Meg"-seksjonen: profil (bilde, navn, handicap, klubb) + rediger profil.
Abonnement (gratis eller 300 kr/mnd — ALDRI tier-nivåer): status, oppgrader-flyt,
avbestill, nytt kort, faktura-detalj. Mine bookinger (+ endre tid). Helse (logg
symptom/skade — liste + nytt symptom). Innstillinger med underseksjoner (varsler,
personvern, sikkerhet/2FA, språk, anlegg, integrasjoner, eksport, økter).
Utstyrsbag, dokumenter, foreldre-info, feedback, hjelpesenter (artikkel/kategori/kontakt).
Felles mønster: ryddig innstillings-liste med rader (ikon + etikett + chevron),
seksjoner med eyebrow-overskrift.
```

**★ Booking (PlayerHQ)** — `/portal/booking` (+ ny wizard, detalj, coach/anlegg, bekreftet)
```
Tegn booking i PlayerHQ: hub (kommende bookinger + "ny booking"-CTA + credits-måler
"X klipp igjen"). Ny booking-wizard (velg tjeneste → coach → anlegg → tid → bekreft).
Booking-detalj, coach-profil (booking), anlegg-detalj, og bekreftet-kvittering.
```

**Talent (PlayerHQ)** — `/portal/talent/...`
```
Tegn spillerens talent-seksjon: hub, min plan, mitt nivå (pyramide-progresjon),
roadmap (vei mot neste nivå som tidslinje), og sammenligning mot benchmark.
```

---

### AGENCYOS (mørkt tema, desktop-først) — `/admin`

**★ Cockpit (hjem)** — `/admin/agencyos` (+ uka, spillere, økonomi, caddie, caddie-aktivitet)
```
Tegn AgencyOS Cockpit (mørkt, desktop-først, Bloomberg-tetthet). Coach-avatar
+ navn (Anders Kristiansen) øverst. KPI-rad: aktive spillere, økter denne uka,
MRR, utestående. Hovedpanel: "hvem trenger meg" (fokus-spillere med varsel/haster-badge).
Sidepaneler: dagens kalender, AI-Caddie-snarvei, siste aktivitet.
Lag også: "Uka" (kanban over uken), spillere-snarvei, økonomi-panel,
Caddie (AI-chat med coach), og Caddie-aktivitetslogg.
```

**★ Innboks + kommunikasjon** — `/admin/innboks`, `/admin/kommunikasjon`, `/admin/reach`
```
Tegn AgencyOS-innboks: venstre liste av tråder (avsender, utdrag, tid, ulest-prikk),
høyre åpen tråd (meldinger + svarfelt). Tett, e-postklient-aktig. Lag også
kommunikasjon-hub (fellesmelding til flere spillere/deltakere) og reach (oppsøk-verktøy).
Mobil: liste → tråd som to skjermer.
```

**Workspace (oppgaver/prosjekter/Notion)** — `/admin/workspace/...`
```
Tegn workspace: hub, "tildelt meg", oppgaver (tabell: tittel, status, prioritet,
forfaller, tildelt), oppgave-detalj, prosjekter (kort med fremdrift), og Notion-sync-status.
Statuser og prioriteter som badges. Tett tabell på desktop, kort-liste på mobil.
```

**★ Stall / Spillere** — `/admin/stall`, `/admin/spillere` (+ ny)
```
Tegn stall-oversikt + spiller-liste: tabell/rutenett av spillere (avatar, navn,
handicap, trend-pil, neste økt, varsel-badge). Filtrering + søk. "Ny spiller"-skjema.
Desktop: tett tabell. Mobil: ett kort per spiller.
```

**★ Spiller-detalj + Workbench** — `/admin/spillere/[id]` (+ profil, workbench, plan, tester, fremgang)
```
Tegn spiller-detalj (mørkt): topp med spiller-header (avatar, navn, handicap, nøkkel-KPI)
og en fane-rad (Oversikt · Workbench · Plan · Tester · Fremgang · Profil). Oversikt:
SG-sammendrag + siste runder + mål. Workbench (coach-i-spiller): samme kraftige
arbeidsbord som spilleren ser, men coach redigerer — endringer propagerer til spiller.
Fremgang: SG-sparkline + treningsvolum-søyler + korrelasjon trening↔resultat.
```

**Grupper + Talent (AgencyOS)** — `/admin/grupper`, `/admin/talent/...`
```
Tegn grupper (liste + gruppe-detalj med medlemmer). Talent-seksjon: hub, talent-detalj,
discovery (finn talenter), radar (ferdighetsradar per spiller), kohort, region,
ressurser, sammenligning (flere spillere side om side), WAGR-benchmark + import.
Mørkt, datatett, mange grafer.
```

**Planlegge / Plans / Maler** — `/admin/planlegge`, `/admin/plans/...`, `/admin/plan-templates/...`
```
Tegn plan-sentral (hub), planer (alle, som liste), ny plan (AI-wizard steg for steg),
plan-detalj, maler (mal-liste + ny + rediger + mal-effektivitet med treffstatistikk).
Wizard er hovedflyten — gjør AI-stegene tydelige.
```

**Drills + Teknisk plan (AgencyOS)** — `/admin/drills/...`, `/admin/teknisk-plan/...`
```
Tegn coach-drill-bibliotek (liste + detalj + rediger) og teknisk plan (på tvers +
per spiller). Mørkt, redigerbart.
```

**★ Turneringer (AgencyOS)** — `/admin/tournaments` (+ detalj, ny, dubletter)
```
Tegn turneringskalender for coach: uke/måned/år-visning, auto-populert. Liste +
turnering-detalj (deltakere, startider, "send fellesmelding til deltakere"-knapp).
Ny turnering + dublett-opprydding.
```

**Gjennomføre / Kalender / Bookinger / Anlegg** — `/admin/gjennomfore`, `/admin/kalender`, `/admin/bookinger`, `/admin/anlegg`
```
Tegn daglig drift: gjennomføre-hub + økt-detalj. Kalender (uke + måned, tett).
Bookinger (tabell + ny). Anlegg (liste + detalj). Tilgjengelighet, kapasitet,
tjenester/priser, fasiliteter, lokasjoner — alle som ryddige admin-tabeller/skjema.
TrackMan på tvers. Live-økt for coach (brief/aktiv/oppsummering).
```

**Analyse / Tester / Finans (AgencyOS)** — `/admin/analysere`, `/admin/tester`, `/admin/finance`
```
Tegn innsikt-hub + compliance (hvem følger planen). Stall-analyse, analytics, lag-snitt.
Tester på tvers (+ detalj, foreslåtte, tildel). Økt-forespørsler + godkjenninger
(kø + detalj). Rapporter, runder på tvers, skader/tilstander. Finans (MRR, utestående,
graf). Bruk PLASSHOLDER-tall der formler ikke er låst.
```

**Organisasjon / Innstillinger / Team / System** — `/admin/organisasjon`, `/admin/settings/...`, `/admin/team`, `/admin/agents`
```
Tegn admin-baksiden: organisasjon-hub, klubb-innstillinger, integrasjoner,
innstillinger (API, kalender, sikkerhet, tilgang), team (+ inviter), audit-log (+ detalj),
AI-agenter (+ detalj), e-postmaler (+ rediger), profil, hjelp. Felles: rolig admin-stil,
innstillings-rader og enkle tabeller.
```

---

### AUTH (begge temaer der det passer) — `/auth/...`
```
Tegn auth-flyten, sentrert kort på rolig bakgrunn: logg inn, registrer, glemt passord,
tilbakestill passord, sjekk e-post, BankID (norsk innlogging — BankID-knapp tydelig),
onboarding spiller (8 steg, fremdriftsindikator øverst), onboarding forelder,
foreldresamtykke (token-side), samtykke venter, logget ut. AK-logo øverst,
lime primær-knapp, kort og vennlig tekst.
```

---

### FORELDREPORTAL (lyst, mobil-først) — `/forelder/...`
```
Tegn foreldreportalen: forelder-hjem (barnas status i ett blikk), barn-oversikt +
barn-detalj (fremgang, økter, trygt språk for forelder), bookinger, coach-kontakt,
fakturaer, økonomi, samtykke, ukerapport (pen oppsummering), innstillinger, varsler.
Varmt, enkelt, ikke-teknisk — foreldre er ikke golfeksperter.
```

---

### MARKETING (lyst, responsivt nettsted) — `/(marketing)/...`
```
Tegn det offentlige nettstedet akgolf.no: forside (hero med video/bilde, verdiløfte,
CTA "prøv PlayerHQ"), anlegg (+ detalj), blogg (+ innlegg), booking (+ tjeneste/bekreft/
kvittering), cases, coacher (+ profil), coaching, junior, priser, PlayerHQ-salgsside,
om oss, kontakt, jobb, FAQ, suksesshistorier, treningsfilosofi, turneringer (+ detalj),
cookies, personvern, vilkår. Markedsførende men rolig — samme grønn/lime/sand-palett,
store Inter Tight-overskrifter, mye luft. Fullt responsivt (mobil + desktop).
```

---

### STATS (offentlig golf-statistikk-sider) — `/stats/...`
```
Tegn det offentlige stats-nettstedet (norsk golf-data): forside + uka + 2026-oversikt,
spillere + årgang, baner/klubber/regioner, turneringer (offentlig), leaderboards
(norske + PGA + drive-distance/fairway/gir/putting/scoring/sg-total), verktøy
(kalkulatorer: avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs), sammenlign
spillere + SG-sammenlign, blogg, søk, quiz, wrapped, min progresjon. Data-tungt men
lekkert — tabeller med mono-tall, ledertavle-stil, grafer. Responsivt.
```

---

## Slik holder du det konsistent over tid

- Tegn **hovedskjermene (★) først** — de setter mønsteret resten følger.
- Lim **alltid** DEL 1 + DEL 2 øverst. Det er disse to blokkene som gjør at skjerm nr. 50 ser ut som skjerm nr. 1.
- Når en skjerm er godkjent: be Claude Design eksportere den, så porter vi til kode etter design-porting-gaten (`.claude/rules/design-porting-gate.md`).
- Oppdater `docs/MASTER-SKJERMPLAN.md` når en skjerm er ferdig.
```
