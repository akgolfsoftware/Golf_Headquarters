# AK Golf HQ — komplett funksjonsliste + plan (10. juli 2026, kveld)

> **Hva dette er:** alt som FINNES i appen nå (per produkt, med adresser), alt som er
> UNDER BYGGING, og alt som er PLANLAGT — kort og lang sikt. Skrevet etter v2-mergen
> til main + dagens leveranser (Workbench-flytpakke, stats-pakke, baneguide-design).
> Søsterdokumenter: `docs/STATUS-NÅ.md` (snapshot), `docs/MASTER-SKJERMPLAN.md`
> (skjerm-haker), `docs/redesign-v2/baneguide-designplan.md` (aktiv designplan).

---

## 1 · PlayerHQ — spillerappen (`/portal`) — alt i v2-design

### Hjem (`/portal`)
- Dagens økt med «Start dagens økt»-CTA · dagens plan (alle økter med tid/akse)
- SG-form-hero med 12-ukers trend · dagens fokus med «hvorfor»-forklaring
- Streak, uke-gjennomføring, 12-ukers treningsheatmap
- Workbench-inngang (ett trykkpunkt — NY 10/7) · AI-innsiktslinje

### Planlegge (`/portal/planlegge` + `/portal/planlegge/workbench`)
- Plan-oversikt: ukeplan dag for dag, ukas belastning per akse (FYS/TEK/SLAG/SPILL/TURN)
- **Workbench** (planleggingsflaten, delt kjerne med coach):
  - Opprett økt (tittel/dag/tid/varighet/akse) · flytt (dag-piller, tid beholdes) · slett m/ bekreftelse
  - **Alle 7 dager** inkl. helg (helgebug fikset 10/7)
  - Publiser plan → coach-godkjenning (DRAFT → PENDING_PLAYER → ACCEPTED/ACTIVE)
  - «Gjenta forrige uke» — kopierer forrige ukes økter m/ drills (NY for spiller 10/7)
  - Øktbibliotek m/ søk: **ett klikk på en økt → ferdig utfylt skjema** (NY 10/7)
  - Planmaler vises (antall økter/fase/varighet)
  - «Start økt» / «Fortsett økt» / «Se økt» rett fra valgt økt (NY 10/7)
  - Zoom (Årsplan/Uke/Økt) + valgt økt huskes i adressen — overlever refresh/deling (NY 10/7)
  - Uke-navigasjon ±52 uker · plan-etterlevelse-% · turneringsvarsel · årsplan-visning m/ sesongblokker

### Gjennomføre (`/portal/gjennomfore` + `/portal/live/[økt]`)
- Øktliste + øktdetalj med drills (rep-typer, CS-nivå, press)
- **Live-økt**: brief → aktiv logging (sett/reps per drill, legg til sett/drill, notater) → oppsummering (fryses)
- **Range-tapper** (fullskjerm): ball-telling per kølle m/ pause og haptikk — **lagres nå til databasen**
  (debounce + ved pause/avslutt, gjenopptak etter refresh — NY 10/7)

### Registrering av data
- **Runder** (`/portal/mal/runder`): hurtigskjema (bane/dato/score/hull-scores/valgfri SG),
  slag-for-slag-veiviser (kølle/lie/avstand/vind/straffe/mentalt per slag),
  GolfBox-import m/ forhåndsvisning, UpGame-import, deling (coach/offentlig lenke), CSV/PDF-eksport
- **SG autoberegnes fra komplett slag-kjede** (NY 10/7): scorekortet bekrefter hole-out,
  håndtastet SG overskrives ALDRI (`sgSource`), ufullstendig kjede → ærlig ingen tall
- **TrackMan** (`/portal/mal/trackman`): CSV- og HTML-import → økter m/ slag, analyse per kølle
- **Tester** (`/portal/tren/tester`): tildelte tester, gjennomføring m/ live scorekort (3 steg), resultathistorikk
- **Fysisk** (`/portal/fysisk`): økter m/ sett×reps×vekt-logging, intervall/puls, tonnasje-beregning

### Analysere (`/portal/analysere`) — ÉN flate, 5 faner
- Trening (volum per akse) · Tester · TrackMan · SG (Broadie-grafer, 16 SG-felter der de finnes) · Runder/statistikk
- Faner i adressen (`?tab=`) · SG-hub m/ dybdesider (kølle, utstyr, forhold, strategi, yardage)

### Baneguide (`/portal/baneguide`)
- Bane-bibliotek i v2 (KPI-er: baner/kartlagt/spilte runder; «Kommer»-pill uten geometri)
- Banekart-oversikt + hull-detalj m/ **ekte satellitt** (Mapbox — LIVE 10/7 etter CSP-fiks),
  hull-liste m/ slagteller, Utslag/Innspill/Putt-segmenter, ærlige tomtilstander
  — *fortsatt gammelt lyst design; v2-redesign er designet og venter godkjenning (se §5)*
- Datamodell + dispersjonsmotor (80 %-ellipse, bias/spredning) ferdig i koden · Onsøy importert fra OSM

### Resten av portalen
- **Kalender** (uke/agenda) · **Mål** (`/portal/mal`) m/ målbygger og achievements · **Utviklingsplan**
  (radar, milepæler, P1–P10-posisjoner) · **Talent/nivå**-visninger
- **Booking** (`/portal/meg/bookinger` + booking-hub): book coachtid, ombooking, kreditter
- **Coach-dialog** (`/portal/coach/*`): meldinger, delte planer, øvelser, videoer, Q&A
- **AI-Caddie-chat** (Claude-drevet) · **Varsler** · **Global søk** (⌘K)
- **Meg**: helse, dokumenter, utstyrsbag, sikkerhet/2FA, feedback, foreldrekobling, abonnement, hjelpesenter m/ «?»-hjelp overalt

---

## 2 · AgencyOS — coach/admin (`/admin`) — v2

### Drift
- **Cockpit** (`/admin/agencyos`): dagsbrief, KPI-er, køer
- **Stall** (`/admin/spillere`): alle spillere m/ SG-form, trend, hcp, gruppe, plan-etterlevelse
  per akse, alvorlighetskø i klarspråk; «Åpne Workbench»/«Se profil» (ekte lenker — 10/7)
- **Spillerprofil 360°**: oversikt, plan-fane, analyse, tester, fremgang, meldinger
- **Coach-Workbench per spiller**: samme funksjoner som spillerens + «Gjenta forrige uke»;
  spillerbytter i toppbaren (fikset 10/7 — bytter via adressen, uke bevares)
- **Planlegge-hub**: ett trykkpunkt til spiller-Workbench · plan-godkjenning (godta/avvis m/ varsel)

### Booking & økonomi
- **Bookinger** (`/admin/bookinger`): ukeliste m/ status-filter, bekreft/avvis enkeltvis og i bulk,
  kapasitets-heatmap (time×dag per anlegg), ny booking-veiviser,
  **booking-detaljside** (NY 10/7 — kalender/søk-lenkene som ga 404)
- **Kalender** uke + måned m/ klikkbare bookinger · **Økonomi**-hub · fakturaoversikt

### Faglig
- **Tester** + benchmark-godkjenning (DataGolf-fasiter auto-synkes mandager 08:00)
- **Runder**-dashboard · **Analyse-huber** (SG per spiller m.m.) · **Turneringer** · **Drills/øvelsesbank**
- **Live**-oppfølging av økter · **Uka**-oversikt

### System
- **Innboks** (post@ → e-post inn, AI skriver utkast, coach sender manuelt) — *venter
  INBOX_WEBHOOK_SECRET + RESEND_API_KEY fra Anders*
- **Godkjenninger**-kø · **Varsler** (`/admin/varsler`) · **Agent-OS** (AgentRun, kjørelogg,
  `/admin/agents/[id]`) · **Audit-logg** · **Team/organisasjon** · **Workspace** · CBAC-tilgangsstyring
- **Beta-utvalg**: 14 spillere seedet m/ coach-kobling og 3 booking-kreditter hver (10/7)

---

## 3 · Forelder (`/forelder`)
- Barnets bookinger · fakturaer · økonomi · GDPR-samtykkeflyt (art. 8, venterom til samtykke)
- Ukerapport · varsler · innstillinger · claiming via verifisert e-post

## 4 · Marketing + auth + plattform
- **akgolf.no-flater**: forside, tjenester, coacher (Markus Røinås Pedersen), anlegg m/ kart,
  priser, om oss, cases, suksesshistorier, treningsfilosofi, junior, kontakt, FAQ, jobb,
  kataloger (coacher/anlegg/turneringer/blogg), juridisk (personvern/vilkår/cookies)
- **Booking-flyt** m/ Stripe-betaling + gjest-booking + kvittering (i (mlegacy), bevisst urørt)
- **Offentlig stats-hub** (`/stats`): DataGolf-data, norske spillere, turneringer, årganger
  (*prototype-undersider med fake data er skjult i prod via proxy*)
- **Auth**: innlogging (v2, live Supabase), registrering, glemt/reset passord, e-postbekreftelse,
  foreldresamtykke, rolledispatch etter innlogging (spiller→/portal, coach→/admin)
- **Plattform**: automatisk prod-deploy fra main (10/7) · CSP m/ nonce · GDPR-behandlingsregister ·
  WHS-handicapmotor · SG-motor (kalibrert, 350 tester grønne) · PWA-ikoner · GolfBox/DataGolf/Stripe/
  Resend-integrasjoner · Vercel cron-agenter

---

## 5 · UNDER BYGGING — baneguide-pakken (godkjent plan, C-delen)

| Steg | Innhold | Status |
|---|---|---|
| C0 | Mapbox-token i Vercel + lokalt | ✅ 10/7 |
| C1 | Kartfarger samlet som dokumentert canvas-unntak | ✅ 10/7 |
| CSP | Mapbox-domener tillatt (kartet var blankt) | ✅ 10/7 |
| Design | 4 mockups m/ ekte Onsøy-satellitt: Banekart · Hull-detalj (80 %-ellipse, bias «4 m V», hull-velger-pill) · Plott (trådkors) · **Gameplan INTERAKTIV** (dra sikte, mal soner bra/aldri, live % + levende avstandsmåling carry/igjen) | ✅ venter Anders' godkjenning |
| C2 | ~10 Østfold-baner via OSM-import (+dry-run/validering) | ⏳ venter baneliste fra Anders |
| C3 | v2-port av banekart + hull-detalj (fullskjerms kart, atomisk flytt+slett av legacy) | etter godkjenning |
| C4 | 80 %-ellipsen tegnet på Mapbox + legende + ≥5-slag-terskel | etter C3 |
| C5 | **Slag-plotting**: kartsteg i veiviseren + etterregistrering `/plott` (trådkors, «Bruk min posisjon», valgfri siktelinje/target) — avstander MÅLES (aldri tastes), `distanceToPin` autofylles → SG-motoren tar over | etter C4 |
| C6 | Dispersion per kølle på hullet (`?kolle=`) | etter C5 |
| C7 | **Gameplan-modus** (navn avgjøres: «Gameplan» anbefalt vs «Innspill»): hull-for-hull sikteplanlegging m/ egne ellipser, soner (auto fra kartdata + malte bra/aldri), notat, sammendrag; datamodell `GameplanHull` + `GameplanSone` (additiv migrasjon) | etter C5 |

**Rettighetsvern (låst):** DECADE-navnet aldri i produktet; metodikken heter
**Presisjonsstrategi**; vurdering + sjekkliste i `docs/juridisk/presisjonsstrategi-rettigheter.md`.

---

## 6 · PLANLAGT — kort sikt (konkret backlog)

- **Innlogget UAT-runde** av dagens leveranser på mobil (Playwright-verifisert på desktop 10/7)
- **Live-coach-branchen** (`feature/live-coach-session`) merges + testes
- **Innboks-nøkler** [DU]: INBOX_WEBHOOK_SECRET + RESEND_API_KEY + inbound-webhook → innboksen live
- **Service worker-fiks** (/sw.js 404 → konsollstøy; oppgave-chip ligger klar)
- **Tapper-lesevisning**: ballantall per kølle inn i økt-oppsummeringen (skrivesiden er live)
- **«Bruk mal»-flyt** i Workbench-biblioteket (kopier malens økter inn i uka) — egen mockup først
- **Granulære SG-felter** (16) fra slag-kjeden (i dag: de 5 hovedfeltene autoberegnes)
- **(mlegacy)-restene** migreres gradvis (tunge stats-sider: spillere/[slug], tour, leaderboards, regions)
- **Betalings-golive 1. august**: abonnement 299 kr/mnd + gratisregler (BUSINESS-RULES), Stripe live-modus
- **akgolf.no-domenet** pekes til appen [DU/Domeneshop]

## 7 · PLANLAGT — nye features (besluttet retning, ikke påbegynt)

- **«Optimaliser sikte»** i Gameplan: appen prøver siktepunkter og foreslår lavest rød-andel (ren geometri)
- **Coach-baneguide** (`/admin/spillere/[id]/baneguide` + dispersion): coachens visning + soner
  som låst anbefaling (aldri sperre) · **Bane-admin** m/ korreksjonseditor for OSM-geometri
- **TrackMan-import-fiks**: alltid skrive slag-rader (i dag delvis kun rå-JSON) → range-dispersjon per kølle
- **Pin-posisjon per runde** (flyttbar pin på green — egen modell)
- **Polygon-soner** (male frie former, ikke bare sirkler)
- **AI-rundeinnsikt** (auto-oppsummering etter føring — kobles på agent-OS-et)
- **AI «Foreslå uke»** i Workbench (stub finnes, gjeninnkobles med ekte Claude-kall + nøkkel)
- **Øvelsesbank-generatoren**: agenter søker web/YouTube/IG → AI lager driller/tester → coach godkjenner
  (fundamentet finnes i øvelsesbanken)
- **Voice-statistikk** på banen (~1 kr/runde i talegjenkjenning)
- **Onboarding**: intro-video + interaktiv førstegangs-tur (kombinasjon besluttet)
- **Vær/forhold-kort** i baneguiden (krever værkilde — designet holder plassen)
- **Lys modus** for begge apper (mørk er kanon nå; lys designes som egen jobb)
- **Innebygd booking erstatter Acuity** fullt ut ved lansering

## 8 · Venter på DEG (Anders)

1. **Godkjenn baneguide-mockupene** (+ si navnevalg: «Gameplan» eller annet)
2. **Banelisten** for OSM-import (forslag: Onsøy ✅, Gamle Fredrikstad, Huseby & Hankø,
   Borregaard, Skjeberg, Moss & Rygge, Mørk, Askim, Halden + én til)
3. **Innboks-nøkler** (Resend + webhook-secret)
4. **Beskjed til v2natt-økten**: jobb på main, aldri `vercel deploy` manuelt
5. akgolf.no-domenepeking

## 9 · Bevisst IKKE planlagt
- Tier-nivåer i abonnement (gratis eller 299 — ELITE finnes ikke) · sperre-mekanismer
  (anbefalinger sperrer aldri) · netto score (alltid brutto) · emoji i UI · DECADE-navnet
