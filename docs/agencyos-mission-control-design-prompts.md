# AgencyOS Mission Control — design-prompts (alle skjermer + komponenter)

Til å lime inn i Claude Design, én og én. Samme stil som `/admin/agencyos/live`.
Eksporter ferdige design til Google Drive Inbox → portes gjennom porting-gaten.

---

## FELLES — lim på toppen av hver prompt

AK Golf HQ Mission Control-stil. Behold AK-fargene: bakgrunn sand-hvit `#FAFAF7`,
hvite kort `#FFFFFF`, skoggrønn `#005840`, lime `#D1F843`, sand `#F1EEE5`, tekst `#0A1F17`,
sekundær `#5E5C57`, korall for haster `#FF8A8A`. Mørke cockpit-paneler `#0A1F18`/`#0F2A22`.

Mission Control-lag: JetBrains Mono på ALLE tall og etiketter; versal konsoll-labels
(`MODUL // STATUS`); status-lys som pulserende prikker (grønn ok / amber følg-opp / korall haster);
hårfine linjer + presist rutenett; lime kun som ett signal/glød-element. Inter Tight på overskrifter.

FETE komponenter: kraftige 1,5px borders, store mono display-tall, sjenerøse trykkflater,
glød på aktive/live-elementer, lagdelte paneler med dybde, store seksjonsoverskrifter. Selvsikkert, ikke sart.

Interaktiv prototype: inkluder hover/aktiv/fokus-states, klikkbare filtre/faner, simulerte
live-oppdateringer (tellere som tikker, puls på live-rader, stream-inn-animasjon), skuffer/modaler
som åpnes ved klikk. Mockdata skal føles levende.

Lucide-ikoner, INGEN emoji, all tekst norsk bokmål (æ ø å). Mobil 430px + desktop ~1280px.

---

# DEL 1 — KOMMUNIKASJON

## P1 · Samlet innboks (inbox-zero)
Lag en samlet innboks som slår sammen ALL e-post + ALLE meldinger (Beeper: Instagram/Messenger/
WhatsApp/Slack + iMessage) i én strøm sortert etter hastegrad. Basér på "Prioritetsfeed"-mønsteret.
- Venstre: filter-skinne (Alle / Haster / Følg opp / Ubesvart / E-post / Meldinger) med tellere i mono.
- Midt: feed av rader, hver med venstre fargekant (korall=haster, amber=følg opp, grå=ubesvart),
  avatar, navn, kilde-chip (mono), forhåndsvisning, tid, ulest-badge. Live: nye drypper inn med stream-inn + puls.
- Hver rad: hover viser hurtighandlinger (Svar / Utsett / Arkiver). Klikk åpner tråd-skuff til høyre.
- Topp: "INNBOKS // X UBEHANDLET" readout + "Inbox zero"-framdrift.
DESKTOP: tre-kolonne (filter / feed / kontekst-skuff). MOBIL: feed full bredde, filter som horisontal chips, tråd åpner fullskjerm.

## P2 · E-post-tråd (lese + svare)
Lag lesevisning for én e-posttråd.
- Header: emne (Inter Tight), avsender + etikett-tag, tid, prioritet-pill.
- Tråd: meldinger stablet, sitater kollapsbare.
- Svar-felt nederst (mørkt panel) med "AI-utkast i din tone"-knapp (lime) som fyller inn et forslag du kan redigere.
- Sidehandlinger: Arkiver / Følg opp / Merk haster.
DESKTOP: tråd midt, høyre skinne med avsender-kontekst (siste samtaler, relaterte). MOBIL: én kolonne, svar-felt sticky bunn.

## P3 · Melding-tråd (Beeper/iMessage)
Lag en chat-tråd-visning for én samtale på tvers av kanaler.
- Header: navn, kilde-chip (Instagram/WhatsApp/iMessage…), online-puls.
- Chat-bobler (dine høyre lime-tonet, andres venstre nøytral), tidsstempler i mono.
- Svar-felt med AI-utkast-knapp + hurtigsvar-chips.
DESKTOP: tråd midt maks 720px, høyre kontekst (hvem er dette, bookinghistorikk). MOBIL: fullskjerm chat.

---

# DEL 2 — TID & OPPGAVER

## P4 · Kalender (full)
Lag full kalender med Acuity-bookinger + interne avtaler.
- Visningsbryter: Dag / Uke / Måned (pills, aktiv = grønn).
- Hendelser med akse-farget venstrekant (slag=blå, tek=ochre, fys, spill, mental), kilde-chip, sted (map-pin), NESTE-pill med blink på neste avtale.
- Uke-visning: tidsrutenett med hendelsesblokker; måned: rutenett med prikker.
- Klikk hendelse → detalj-skuff (deltaker, sted, kilde, handlinger).
DESKTOP: full kalender + smal venstre mini-måned + dagens agenda. MOBIL: dag-visning default, swipe mellom dager.

## P5 · Oppgavetavle (Notion-synket)
Lag en kanban-oppgavetavle synket fra Notion.
- Kolonner: Backlog / Pågår / Venter / Ferdig — hver med mono-teller.
- Oppgavekort (fete): tittel, prioritet-pill (P1 korall / P2 amber), tag (SOFTWARE etc.), forfaller (mono nedtelling), framdrift.
- Dra-og-slipp mellom kolonner (interaktiv). Topp: filter på prosjekt + "FORFALLER I DAG"-snarvei.
DESKTOP: horisontale kolonner. MOBIL: én kolonne om gangen med kolonne-velger øverst.

---

# DEL 3 — FOKUS

## P6 · Dagens tre — fokusmodus
Lag en utfør-visning av de tre ikke-forhandlingsbare for dagen (Svare opp / Følge opp / Være tilstede).
- Stor, rolig fullskjerm: ett fokus om gangen, nummerert (01/02/03) i stor mono.
- Aktivt fokus midt (stort kort med beskrivelse + relaterte elementer å handle på), de to andre dempet over/under.
- "Fullfør"-knapp (lime, fet) → neste glir inn. Framdrift-prikker.
- Valgfri timer/body-doubling-følelse: subtil pulserende ring.
MOBIL + DESKTOP: samme sentrerte fokus, maks 720px. Mørk-til-sand bakgrunn, behersket glød.

---

# DEL 4 — SYSTEM / STYRING

## P7 · Datakilder & integrasjoner (motoren)
Lag kontrollpanelet for live-datakildene (fra blueprinten).
- Ett panel per kilde: Gmail, Google Kalender, Notion (prosjekt + oppgaver), Beeper, iMessage.
- Hver rad: ikon, navn, status-lys (grønn TILKOBLET / amber DEGRADERT / rød NEDE), sist synket (mono "SYNK 05:12"),
  oppdateringsmetode (mono "PUSH" / "CRON 5 MIN"), rate-limit-måler, "Koble til"/"Test"/"Synk nå"-knapper.
- Topp: samlet system-helse-readout (grønn/X kilder oppe) + sirkelbryter-status.
- Seksjon "Sikkerhet": TLS, audit-logg på skrivehandlinger, per-kilde isolasjon (kort tekst).
DESKTOP: 2-kolonne panel-grid + helse-header full bredde. MOBIL: paneler stablet.

## P8 · Varsler / aktivitetslogg
Lag varslingssenter (bjelle-ikonet).
- To faner: "Krever deg" (handlingsbare) og "Aktivitet" (hva systemet har gjort).
- Rader med ikon, status-lys, kort tekst, tid (mono), evt. handling-knapp.
- Topp: "X krever deg"-readout. Live: nye drypper inn med puls.
DESKTOP: skuff fra høyre eller egen side, to-kolonne. MOBIL: fullskjerm liste med fane-velger.

## P9 · Kommandopalett (Cmd+K)
Lag en global kommandopalett-overlay.
- Sentrert mørkt panel som flyter over dimmet bakgrunn, stort søkefelt med mono-prompt "Hopp eller handle…".
- Grupperte resultater: Naviger (skjermer), Handlinger (svar, ny oppgave, logg), Spillere, Søk i alt.
- Tastatur-hint i mono (↑↓ naviger, ↵ velg, esc lukk), aktiv rad med lime venstrekant.
DESKTOP + MOBIL: samme overlay, maks 640px bredde.

---

# DEL 5 — LIVE TURNERING (NY)

## P10 · Turneringsoversikt (live)
Lag oversikt over turneringer mine spillere deltar i (Olyo Tour, Srixon Tour, Garmin Tour, m.fl.).
- Seksjon "LIVE NÅ" øverst: store fete kort per aktiv turnering med pulserende LIVE-pill,
  turneringsnavn + tour-logo-plass, bane, "RUNDE 2", vær-ikon, og readouts: "MINE SPILLERE: 4",
  "BESTE NÅ: T3 (-2)". Klikk → leaderboard. Live: posisjons-tall tikker.
- Seksjon "KOMMENDE": liste med dato (mono nedtelling "OM 3 DAGER"), turnering, påmeldte av mine spillere (avatarer).
- Seksjon "FULLFØRT": siste resultater komprimert.
- Tom-tilstand (ingen aktiv turnering): rolig "Ingen live turnering nå — neste: …".
DESKTOP: LIVE-kort i bento øverst + to kolonner under. MOBIL: kort stablet, LIVE øverst.

## P11 · Live leaderboard (per turnering)
Lag live-leaderboard for én turnering, med mine spillere fremhevet.
- Header: turneringsnavn + tour, bane, "RUNDE 2 · LIVE" med pulserende klokke, vær.
- Bryter: "MINE SPILLERE" / "HELE FELTET" (toggle).
- Leaderboard-rader (fete): posisjon (stor mono, "T3"), spiller-navn + klubb, TO PAR stor mono
  (rød over par / grønn under / nøytral E), THRU ("12" eller "F"), I DAG, TOTALT.
  MINE spillere: lime venstrekant + subtil glød + liten "på banen nå"-pulsprikk.
- Live: rad blinker/animerer når score endres; rader reordnes mykt ved posisjonsbytte.
- Klikk rad → spillerens live-scorecard.
DESKTOP: full leaderboard + smal høyre "MINE SPILLERE"-sammendrag. MOBIL: kompakte rader, sticky header.

## P12 · Live scorecard (hull-for-hull)
Lag en spillers live-scorecard med hull-for-hull-oppdatering.
- Header: spiller + klubb, turnering, posisjon (stor mono "T3"), TO PAR stor mono, "THRU 12".
- Hull-rutenett 1–18 (Front 9 / Back 9): hver celle viser hull-nr, par (lite mono), og score med farge —
  eagle/birdie = lime, par = nøytral, bogey = amber, dobbel+ = korall. Løpende to-par under hver ni.
- "NÅ PÅ HULL 13"-indikator med puls; spilte hull fylt, kommende dempet. Live: ny score popper inn med animasjon.
- Runde-velger (R1/R2/R3/R4). Valgfri Strokes Gained-mini-stripe hvis data finnes.
DESKTOP: full 18-hulls rad + statistikk-sidepanel. MOBIL: Front 9 / Back 9 som to rader, stablet.

## P13 · Dashboard-panel "LIVE NÅ" (komponent til /admin/agencyos/live)
Lag et kompakt panel som dukker opp på Mission Control-dashboardet KUN når en turnering er live.
- Mørkt fett panel: "LIVE NÅ — Srixon Tour · R2" med pulserende LIVE-pill.
- Mine spillere på banen: kompakte rader (navn, TO PAR mono, THRU, posisjon) med live-puls.
- Mini-ticker nederst: siste hendelse ("Jakob birdie hull 11 → -3"). Klikk → full leaderboard.
- Plassering: i bento-grid på dashboardet, fremtredende når aktivt; skjult ellers.
Responsivt: full bredde-bånd på mobil, bento-celle på desktop.

---

# DEL 6 — FETE KOMPONENTER (bibliotek)

## P14 · Komponentark — Mission Control
Lag ett komponentark (component sheet) som viser alle gjenbrukskomponenter i Mission Control-stil,
hver med states (default / hover / aktiv / live), på både lyst kort og mørkt cockpit-panel:

1. StatusPill — live / ok / følg-opp / haster, med pulserende prikk.
2. TelemetryReadout — stor mono-tall + enhet + delta-pil (opp grønn / ned korall).
3. ToParBadge — golf to-par (−3 grønn / E nøytral / +2 korall), liten og stor variant.
4. LeaderboardRow — posisjon + spiller + to-par + thru, med "mine spillere"-fremhevet variant.
5. HoleCell — golf-scorecard-celle (hull-nr, par, score-farge).
6. InboxRow — venstre fargekant, avatar, kilde-chip, forhåndsvisning, ulest-badge.
7. TaskCard — kanban-kort med prioritet-pill + forfall-nedtelling.
8. CalendarEventRow — akse-farget kant, tid, sted, NESTE-pill.
9. SourceStatusCard — integrasjon: status-lys, sist synket, rate-limit-måler.
10. CommandItem — kommandopalett-rad med ikon + tastatur-hint.
11. ModuleTile — app-flis (forest flate + lime glyf) + ekstern-flis (grå).
12. GlowCTA — primær lime-knapp med glød, og sekundær outline.
13. PulseDot — status-lys i grønn/amber/korall.
14. SectionEyebrow — versal mono konsoll-label.

Vis hver komponent stor og tydelig med navn i mono over. Rutenett-layout. Dette er fasit-biblioteket
alle skjermene bygger på.
