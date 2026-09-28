# Teknisk plan og progresjon — 27.09.2026

Bestilt av Anders 27.09.2026. Utvider AG-10 og legger til AG-TP-01, AG-TP-02 og PH-TP-01. Funksjonen er hentet fra prototypen «AK Golf Training Motor»; utseendet følger Precision Athletics (readme «Faste regler» 1–11).

## Skjermer

| ID | Navn | Rute | Kilde |
|---|---|---|---|
| AG-10 | Teknisk plan (utvidet) | `/admin/spillere/[id]/plan/[planId]` (+ `/admin/plan/teknisk`) | `ui_kits/agencyos/screens/AG-10.jsx` |
| AG-TP-01 | Oppgaveskjema | `/admin/spillere/[id]/plan/[planId]?oppgave=[taskId]` | `ui_kits/agencyos/screens/AG-TP.jsx` |
| AG-TP-02 | Før og nå per posisjon | `/admin/spillere/[id]/plan/[planId]/for-og-na` | `ui_kits/agencyos/screens/AG-TP.jsx` |
| PH-TP-01 | Teknisk plan (spiller) | `/portal/tren/teknisk-plan/[planId]` | `ui_kits/playerhq/screens/PH-TP.jsx` |

Delte deler: `ui_kits/_shared/tp-parts.jsx` (PosLine, RepBars, EnvGrid, TMScale, TMBlock, Protocol, QualityCheck, QCSheet, BeforeAfter, TaskCard, Summary). Demodata: `ui_kits/_shared/data-tp.js`. PH-19-kortet «Teknisk plan» lenker til PH-TP-01.

## Faste regler for disse fire
- Demodata: spiller Tobias Lindvik, coach Anders Kristiansen. Ingen andre navn.
- «Coach», aldri «trener». MORAD, Mac O'Grady og «Mekanisme 7» står ikke på skjerm. Seksjonsoverskrift: «Posisjoner P1.0–P10.0».
- Posisjonsnavn følger ordmasteren §5 (avklart av Anders 27.09.2026): P1.0 Adresse / Oppstilling · P2.0 Kølle parallell i baksving · P3.0 Venstre arm parallell i baksving · P4.0 Toppen av baksvingen · P5.0 Venstre arm parallell i nedsving · P6.0 Kølle parallell i nedsving · P7.0 Treffpunktet · P8.0 Kølle parallell i gjennomføring · P9.0 Høyre arm parallell i oppfølging · P10.0 Fullføring og balanse. Kilde i kode: `AK_VOCAB.P`. Faser: Baksving P1–P4 · Nedsving P5–P7 · Gjennomsving P8–P10.
- Posisjonslinjen ruller aldri sidelengs: 10 kolonner ≥ 600 px, 2 × 5 under. Fasene som overskrift over kolonnene ≥ 600, som mono-linje under på mobil.
- Fremdriftsstreker grafitt. Valgt posisjon = grafitt ramme. Ingen rust.
- Læringssteg bare fullsving (Utslag, Innspill): Uten ball · Lav hastighet 25/50/75 % · Automatikk. Bunker: Uten ball i sanden · Med ball. Nærspill og putting: én rep-strek.
- Ingen regel sperrer noe. Rep-mål, treffprotokoll og kvalitetssjekk viser status og låser aldri neste steg (avklart av Anders 27.09.2026).

## AG-10
1. Oppsummering: plannavn (tittel), planstatus («Aktiv») og publisering («Publisert 18.09.2026») hver for seg, hovedfokus P6.0 · P7.0, samlet fremdrift «702 / 1 450 repetisjoner» med kilde og dato.
2. Posisjonslinje: antall oppgaver per posisjon, «FOKUS»-merke på hovedfokus. Trykk filtrerer; trykk igjen eller «Vis alle posisjoner» nullstiller. Posisjonsstatus (Ikke startet · Jobber med · Godkjent) vises for valgt posisjon og kan byttes av coach.
3. Oppgavekort: posisjon og tittel · slag (fritekst) · område · ett teknisk fokus · AK-formelen i mono · status. Lukket kort viser samlet fremdrift og protokoll; «Vis detaljer» åpner resten.
4. Repetisjoner per læringssteg (gjort / mål) og fordeling per miljø (Innendørs · Treningsområde · Bane · Konkurranse). Miljø uten mål: «—» og «IKKE I PLANEN». Kilde og dato under.
5. TrackMan-mål, ett eller flere: egen skala per parameter med tre merker — Utgangspunkt (hul ring), Målboks (ramme fra–til), Måling nå (fylt prikk). Legende med tall for hver. Under: kølle, n, kilde, dato, dato for utgangspunkt. Uten måling: «—» og «Ingen TrackMan-økt registrert». Uten radar: «UTEN MÅLEUTSTYR».
6. Treffprotokoll i én setning + nåtall: Rullende vindu («16 av de siste 20 slagene innenfor målboksen» · «Nå 12 av 20») · Beste av N · Streak · Økt-gate.
7. Kvalitetssjekk: «7 av 10 · 24.09.2026 · TrackMan». «Ny kvalitetssjekk» åpner ark: Innenfor/Utenfor per slag, Angre siste, Lagre når serien er full. Avbrutt serie gir ikke resultat (toast sier det).
8. Handlinger: «Legg i økt» (øvelse som utkast i Workbench, koblet til oppgaven) · «Rediger» (AG-TP-01) · «Før og nå» (AG-TP-02). Primærknapp: «Ny oppgave».
9. Siste registreringer: dato, repetisjoner, læringssteg, miljø, kilde, spillerens kommentar, coachens svar (eller «Svar» → felt → «Send svar»).

## AG-TP-01 Oppgaveskjema
- Over 1024: forhåndsvisning av kortet til venstre + inspektør 340 (docked). 1024 og smalere: ark nedenfra, «Åpne skjemaet» gjenåpner.
- AK-formelen øverst (sticky) og oppdateres for hvert valg. Ledd som ikke gjelder, utelates (motorikk bare fullsving).
- **Regel (avklart av Anders 27.09.2026):** når en oppgave har flere læringssteg og flere miljøer, viser AK-formelen steget spilleren er på nå (`task.currentStep`) og hovedmiljøet (`task.primaryEnvironment`). Rep-mål per steg og per miljø lagres hver for seg. Når spilleren går til neste steg, får oppgaven ny formel; den gamle står i historikken.
- Rekkefølge: posisjon · tittel · slag · område (familie → område) · læringssteg/sandtrinn · teknisk fokus (listen følger området, maks ett) · kølle · miljø og press · måleutstyr (TrackMan · FlightScope · Garmin R10 · Mevo+ · Annet · Uten) · TrackMan-mål (bare radar; nedre/øvre med Stepper, utgangspunkt fra siste økt) · rep-mål per steg og per miljø (sum vises, ulik sum lagres likevel) · treffprotokoll med antall slag og treff.
- Bunnlinje: status i mono («Lagret 08:41 · ikke publisert», «Endret · ikke lagret», «Publisert 18.09.2026 · ingen endringer»), «Lagre oppgave» (primær), «Publiser til spiller» (sekundær, aktiv etter lagring).

## AG-TP-02 Før og nå
- To daterte bilder av samme posisjon. «Side om side» og «Før og nå» med delelinje.
- Delelinjen: dra (pointer), piltaster ±5 %, Home/End, og knapper uten dra: «Bare før» · «Midt» · «Bare nå». `role="slider"` med verdi.
- Mangler ett bilde: tom ramme med «Ingen bilde registrert» og «Last opp bilde»; delelinje er av («FØR OG NÅ KREVER TO BILDER»).
- Coachens notat med navn og dato under. Ingen referansefigur, ingen vinkeltall som ikke er målt.
- **Krever tillegg i datamodellen: to daterte bilder per oppgave. I dag finnes ett bilde og én video.**

## PH-TP-01 Teknisk plan (spiller)
- Leser: oppsummering, posisjonslinje, oppgaver med teknisk fokus, rep-streker, TrackMan-mål, treffprotokoll, før og nå. Ingen redigering.
- Primær «Start økt», sekundær «Registrer repetisjoner» → ark: oppgave, læringssteg (bare steg i oppgaven), miljø, antall (Stepper xl + «+10» og «+25»), kommentar til coachen. Kvittering: «Registrert 27.09 · 40 repetisjoner · Lav hastighet» (toast og grønn melding øverst).
- Spilleren kan også registrere kvalitetssjekk (samme ark som coach; 56 px knapper i natt).

## Datamodell (tillegg, må godkjennes av Anders før migrering)
- `TechnicalPlan`: status (planstatus) og `publishedAt` hver for seg, `focusPositions[]`.
- `TechnicalTask`: `position`, `title`, `shot` (fritekst), `area`, `focus` (én), `club`, `learningSteps[]`, `environments[]`, `press`, `device`, `status`.
- `TaskRepTarget`: per (oppgave, læringssteg) og per (oppgave, miljø): `target`. Gjort summeres fra `RepLog`.
- `RepLog`: dato, oppgave, antall, læringssteg, miljø, kilde (Live-økt · TrackMan · Manuelt), spillerkommentar, coachsvar + dato.
- `TrackmanTarget`: per oppgave, flere: parameter, `lo`, `hi`, utgangspunkt (verdi + økt-id/dato). «Nå» = snitt fra siste økt med kølle og n.
- `HitProtocol`: type (rolling · best_of · streak · session_gate), `shots`, `hits`.
- `QualityCheck`: oppgave, dato, kilde, `hits`, `of`, registrert av (coach/spiller). Avbrutt serie lagres ikke.
- `TaskImage` × 2: `before` og `now`, hver med dato og opplaster, + coachnotat med navn og dato.

## Ikke tegnet (ikke avklart)
Milepæler mot måldato · mellomposisjoner (P4.1 osv.) · ballbane sett ovenfra.

## Audit 27.09.2026
`ui_kits/audit.html?bad&only=AG,PHQ&ag=AG-10,AG-TP-01,AG-TP-02,AG-WB-TURN&ph=PH-TP-01,PH-19`: 144 tilfeller, 0 avvik (AG 4 skjermer × 4 tilstander × 390/768/1024/1280/1440; PHQ 2 skjermer × 4 tilstander × lyst/natt × 390/768/1024/1280). Hardkodede farger i skjermfilene: 0.
