# CoachHQ — Komplett Screen Inventory

**Dokumentasjonsdato:** Mai 2026  
**Kilder:** 
- coachhq-moduler.md (19 modules, 41 action files)
- coachhq-screen-map.jsx (complete screen routing)
- coachhq-feature-audit-v2.md (18 new features, status flags)
- coachhq-komplett-funksjonsoversikt.md (function integration mapping)
- coachhq-design-brief.md (all 37 screens, architectural specifications)

---

## Summary

| Metrikk | Verdi |
|---------|-------|
| **Total screens** | 37 |
| **Modal count** | 38+ (spesifikke modals dokumentert per screen) |
| **Server action files** | 41 across 19 modules |
| **Server actions** | ~180 |
| **Sidebar sections** | 6 |
| **Module groups** | 19 |
| **CoachHQDarkShell screens** | 13 |
| **MCLayout screens** | 19+ |
| **CBAC capabilities** | 43 across 12 groups |

### Screen Count by Module Group

| Seksjon | Antall | Moduler |
|---------|--------|---------|
| **I dag** | 4 | Hub, Denne uken, Fokus, Daglig Brief |
| **Planlegg** | 7 | Treningsplaner, Ny plan (4 steg), Maler, Kalender, Kapasitet, Økter |
| **Følg opp** | 5 | Elever, Spillerprofil 360°, Coaching Board, Godkjenninger, Oppfølgingskø |
| **Analyse** | 4 | Talent, Analytics, Rapporter, Turneringer |
| **Drift** | 6 | Bookinger, Tilgjengelighet, Tjenester, Økonomi, Fasiliteter, Lokasjoner |
| **Verktøy** | 5+ | Team, Meldinger, E-postmaler, Agenter, Teknisk Plan, Grupper |

**Totalt:** 31 named screens + ~6 expanded/detail screens = **37 total screens**

### Identified Gaps Between Sources

1. **Session Recording UI** — Beskrevet i feature-audit (Deepgram + Claude pipeline), men detailed screen specs ikke i design-brief
2. **Oppfølgingskø** — Kort reference i funksjonsoversikt, men full UI-spec ikke dokumentert
3. **AI Chat (Coach Agent)** — Referenced i 360-profil og funksjonsoversikt, aber full interaction design missing
4. **Brief Display (Daily Brief)** — Listeert som NY modul, specs exists but limited in design-brief
5. **Teknisk Plan Detail Screens** — CRUD-operasjoner dokumentert, men layout/interaction specs partial

---

## SEKSJON 1: I DAG

### 1.1 Hub Dashboard

**URL/Route:** `/admin/hub`  
**Module:** Hub  
**Shell Type:** CoachHQDarkShell  
**Status (feature-audit):** ✅ Ferdig

**Formål:** Kommandosentral. «Hva skjer akkurat nå?»

**Main Sections:**

| Seksjon | Felter | Kilde |
|---------|--------|-------|
| KPI-stripe (4 kort) | Aktive spillere, bookinger i dag, ventende meldinger, omsetning denne måneden | Aggregert |
| Modul-kort (6 stk) | Antall per modul: ventende godkjenninger, uleste meldinger, spillere uten plan, osv. | Hub-actions |
| Siste aktivitet (feed) | Tidslinje: bookinger, meldinger, plan-endringer, tester | Hub-actions |

**Primary Actions:**
- Klikk modulkort → navigerer til modul
- Klikk aktivitets-element → navigerer til relevant skjerm

**Secondary Actions:** Ikke spesifisert

**Filters:** Ikke spesifisert

**Modals:** Ikke spesifisert

**States:**
- **Normal:** Full dashboard med data
- **Ny bruker (ingen data):** Velkomst + onboarding-sjekkliste («Opprett din første spiller», «Sett tilgjengelighet», «Konfigurer tjenester»)
- **Feil ved lasting:** Feilkort med «Prøv igjen»

**Tier-gating:** Ikke spesifisert (antatt: team-wide)

**Connections:** Alle moduler (cross-module navigation via kort)

---

### 1.2 Denne uken

**URL/Route:** `/admin/denne-uken`  
**Module:** Denne uken  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Ukeoversikt for planlegging.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Ukens bookinger | Dag-for-dag liste: tid, spiller, tjeneste, instruktør, status |
| Instruktør-oversikt | Per instruktør: antall timer, ledig kapasitet |
| Ukestatistikk | Totalt booket, kansellert, omsetning, no-shows |

**Primary Actions:**
- Klikk booking → kalender-detalj
- Klikk instruktør → tilgjengelighet

**Secondary Actions:** Ikke spesifisert

**Filters:** Dag, instruktør (antatt)

**Modals:** Booking-detalj (fra kalender-actions)

**States:**
- **Med bookinger:** Full visning
- **Ingen bookinger:** «Ingen bookinger denne uken»
- **Helg/stengt:** Viser kun relevante dager

**Tier-gating:** Ikke spesifisert

**Connections:** Kalender, Tilgjengelighet, Bookinger

---

### 1.3 Fokus

**URL/Route:** `/admin/focus`  
**Module:** Fokus  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Oppgaveliste (tasks) og divisjonsstatistikk.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Oppgaveliste | Tittel, beskrivelse, frist, prioritet (høy/medium/lav), status (åpen/ferdig) |
| Divisjonsstats | Per divisjon: antall spillere, bookinger, omsetning |
| Dagens bookinger per divisjon | Fordelt på akademiets divisjoner |

**Primary Actions:**
- Opprett oppgave → modal med tittel, beskrivelse, frist, prioritet
- Endre oppgavestatus → klikk/dra
- Rediger oppgave → modal
- Slett oppgave → bekreftelse

**Secondary Actions:** Filter, sortering

**Filters:** Status (åpen/ferdig), prioritet, divisjon

**Modals:**
- Opprett oppgave (tittel, beskrivelse, frist, prioritet dropdown)
- Rediger oppgave (samme felter)
- Bekreft sletting

**States:**
- **Med oppgaver:** Liste med filtrering
- **Ingen oppgaver:** «Ingen oppgaver. Opprett din første»

**Tier-gating:** Ikke spesifisert

**Connections:** Bookinger (viser divisjonsdata)

---

### 1.4 Daglig Brief (NY)

**URL/Route:** `/admin/brief`  
**Module:** Daglig Brief  
**Shell Type:** CoachHQDarkShell  
**Status:** 🔨 Skal bygges

**Formål:** Daglig oppsummering av prioriterte handlinger (AI-generert).

**Main Sections:** Ikke detaljert spesifisert

**Primary Actions:** Ikke spesifisert

**Secondary Actions:** Ikke spesifisert

**Filters:** Ikke spesifisert

**Modals:** Ikke spesifisert

**States:** Ikke spesifisert

**Tier-gating:** Ikke spesifisert

**Connections:** Agenter (AI-generering)

---

## SEKSJON 2: PLANLEGG

### 2.1 Treningsplaner — Oversikt

**URL/Route:** `/admin/treningsplan`  
**Module:** Treningsplaner  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (legacy, delvis)

**Formål:** Se og administrere alle treningsplaner.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Spillerliste (venstre panel) | Avatar, navn, HCP, aktiv plan-status, completion-rate |
| Filter | Søk, status (DRAFT/ACTIVE/PAUSED/ARCHIVED), instruktør |
| Plan-header (topp) | Spillernavn, A-K-kategori, HCP, periodetype, uke X av Y |
| Uke-velger | Navigasjon mellom uker (piler + dropdown) |
| Dag-grid | 7 kolonner, økt-kort per dag |

**Økt-kort i dag-grid:**

| Felt | Beskrivelse |
|------|-------------|
| Navn | Økttittel |
| Pyramidekode | FYS/TEK/SLAG/SPILL/TURN med fargekode |
| Varighet | Minutter |
| L-fase | KROPP/ARM/KØLLE/BALL/AUTO |
| Status | Ikke startet / Fullført / Hoppet over |
| CS/M/PR | Intensitetsnivåer |

**Økt-detalj (klikk økt-kort):**

| Felt | Beskrivelse |
|------|-------------|
| Øvelsesliste | Navn, varighet, treningsområde, L-fase, CS |
| Drills | Spesifikke drills med benchmark |
| Coach-feedback | Fritekst (coach skriver) |
| Spiller-kommentar | Fritekst (spiller skriver i PlayerHQ, coach leser) |
| Ukefokus | Fritekst for hele uken |

**Primary Actions:**
- Velg spiller → se plan
- Klikk økt → detalj/rediger
- Legg til/fjern økt
- Endre dag, varighet, fokusområde
- Legg til/fjern drills
- Skriv coach-feedback
- Sett ukefokus
- Dupliser plan til annen spiller
- Endre plan-status: publiser, paus, arkiver

**Secondary Actions:** Sortering, visningsalternativer

**Filters:** Spiller-navn (søk), plan-status, instruktør

**Modals:**
- Økt-detalj (med feedback, kommentarer, drills)
- Rediger økt
- Dupliser plan til spiller

**States:**
- **Aktiv plan (ACTIVE):** Full visning, redigerbar
- **Utkast (DRAFT):** «Utkast — ikke synlig for spiller» banner + «Publiser»-knapp
- **Pauset (PAUSED):** «Pauset» banner + «Gjenoppta»-knapp
- **Arkivert (ARCHIVED):** Read-only + «Dupliser»-knapp
- **Ingen plan for spiller:** «Ingen plan. Opprett ny» + CTA
- **AI-generert økt (aiGenerated=true):** Blå «AI»-badge + «Godkjenn»/«Endre»-knapp

**Tier-gating:** Ikke spesifisert (antatt: coach + admin)

**Connections:** Ny plan wizard, Maler, Drill library, Agenter (AI)

---

### 2.2 Ny plan — Wizard (4 steg)

**URL/Route:** `/admin/treningsplan/ny`  
**Module:** Ny plan (wizard)  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Opprett ny treningsplan.

**Main Sections — Steg 1: Spiller og periode**

| Felt | Type | Beskrivelse |
|------|------|-------------|
| Spiller | Autocomplete-søk | Velg spiller (individuell) |
| Gruppe | Toggle | Bytt til gruppemodus |
| Periodetype | 3 knapper | GRUNN / SPESIALISERING / TURNERING |
| Lengde | Dropdown | 4 / 8 / 12 / 16 / 24 uker (12 default) |
| Startdato | Datepicker | Auto-beregner sluttdato |
| Mål | Textarea | Fritekst mål for perioden |

**Main Sections — Steg 2: Pyramide og svakhet**

| Felt | Type | Beskrivelse |
|------|------|-------------|
| Pyramide (5 sliders) | Sliders 0-100 | FYS/TEK/SLAG/SPILL/TURN, sum=100 |
| AI-forslag | Pre-utfylt | Basert på A-K-tabell × periodetype |
| SG-vekting | Auto | ±15% forskyvning basert på SG-data |
| Svakheter | Checkboxes | Driver SG:OTT, Putt 5-10ft, Wedge 50-100m, etc. |
| Legg til egne | Input | Coach kan legge til egne svakhetsområder |
| Coach-overstyring | Manuell | Coach kan justere alle verdier |

**Pyramide-defaults (for AI-forslag):** [Ref. design-brief for full A-K × periodetype tabell]

**Main Sections — Steg 3: Mal eller AI**

| Valg | Beskrivelse |
|------|-------------|
| Start fra mal | Liste over tilgjengelige maler med forhåndsvisning |
| AI-generer utkast | Genererer basert på pyramide + svakheter (10-stegs pipeline) |
| Bygg fra blank | Tom plan med riktig struktur |
| Dupliser fra eksisterende | Velg spiller + plan å duplisere |

**Main Sections — Steg 4: Forhåndsvis og lagre**

Viser plan i samme grid som plan-detalj. Coach kan justere.

**Primary Actions:**
- Navigere mellom steg (next/previous)
- «Lagre som utkast»
- «Publiser til spiller»

**Secondary Actions:** «Avbryt» (exit wizard)

**Filters:** Ikke relevant for wizard

**Modals:**
- Mal-velger (hvis step 3: Start fra mal)
- AI-generer-sammendrag (hvis step 3: AI)
- Spiller-velger (step 1)

**States:**
- **Step 1 — ugyldige felter:** Next-knapp disabled
- **Step 2 — summen != 100:** Varsel + disabled next
- **Step 4 — klar til lagre:** To aktive knapper

**Tier-gating:** Ikke spesifisert (antatt: coach + admin)

**Connections:** Treningsplaner (oversikt), Maler, Drill library, AI agents

---

### 2.3 Maler

**URL/Route:** `/admin/treningsplan/maler`  
**Module:** Maler  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Administrer plan-maler.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Mal-liste | Navn, A-K-kategori, periodetype, status (aktiv/inaktiv), antall ganger brukt |
| Mal-detalj | Uke-grid med økt-kort (som plan-detalj) |

**Primary Actions:**
- Opprett mal
- Rediger mal
- Aktiver/deaktiver mal
- Slett mal
- Bruk mal som utgangspunkt (navigerer til wizard step 3)

**Secondary Actions:** Sortering, søk

**Filters:** Status (aktiv/inaktiv), A-K-kategori, periodetype

**Modals:**
- Opprett/rediger mal (navn, A-K, periodetype, uke-grid editor)
- Bekreft sletting

**States:**
- **Med maler:** List med kort
- **Ingen maler:** «Opprett din første mal»
- **Inaktiv mal:** Grayed out med «Inaktiv»-badge

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Treningsplaner (ny plan wizard step 3), Elever

---

### 2.4 Kalender

**URL/Route:** `/admin/kalender`  
**Module:** Kalender  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Booking-kalender for alle instruktører.

**Main Sections:**

| Visning | Innhold |
|---------|---------|
| Dagsvisning | Tidslinje (08-20), bokser per booking med spiller, tjeneste, status |
| Ukevisning | 7 kolonner × instruktører, komprimerte bokser |
| Periodevisning | Oversikt over lengre tidsrom |

**Booking-boks:**

| Felt | Beskrivelse |
|------|-------------|
| Tid | Start-slutt |
| Spiller | Navn + avatar |
| Tjeneste | Type coaching |
| Status-farge | Planlagt (blå), Fullført (grønn), No-show (rød), Kansellert (grå) |
| Instruktør | Hvem som har timen |

**Primary Actions:**
- Klikk booking → detalj-panel/modal
- Marker fullført / no-show
- Legg til admin-notat
- Klikk ledig tid → opprett booking
- Naviger: dag ↔ uke ↔ periode
- Filtrer på instruktør

**Secondary Actions:** Flytt booking (drag), dupliser booking

**Filters:** Instruktør, status, tjenestetype, dato

**Modals:**
- Booking-detalj (spillerinfo, booking-info, status, admin-notater, handlinger)
- Opprett ny booking
- Rediger booking

**Booking-detalj modal:**

| Felt | Beskrivelse |
|------|-------------|
| Spillerinfo | Navn, HCP, siste besøk, kontakt |
| Booking-info | Tjeneste, tid, instruktør, fasilitet |
| Status | Planlagt/Fullført/No-show/Kansellert |
| Admin-notater | Fritekst |
| Handlinger | Marker fullført, marker no-show, kanseller, flytt |

**States:**
- **Med bookinger:** Fullt satt kalender
- **Ingen bookinger:** «Ingen bookinger denne perioden»
- **Blokkert tid:** Grå blokk fra tilgjengelighet-modulen

**Tier-gating:** Ikke spesifisert (antatt: coach + admin)

**Connections:** Tilgjengelighet, Bookinger, Tjenester, Instrukør-profil

---

### 2.5 Kapasitet

**URL/Route:** `/admin/kapasitet`  
**Module:** Kapasitet  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Kapasitetsstyring og utnyttelse.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Utnyttelsesgrad | Prosent utnyttet per instruktør, per uke |
| Uke-overstyring | Manuell justering av kapasitet |
| Pakkeetterspørsel | Etterspørsel per tjenestetype |

**Primary Actions:**
- Se uke → overstyr → lagre
- Justering av kapasitet (manuell input eller slider)

**Secondary Actions:** Kopier uke-overstyring til neste uke

**Filters:** Instruktør, uke

**Modals:**
- Overstyr uke-kapasitet (tall-input eller slider)

**States:**
- **Normal:** Kalkulert kapasitet basert på tilgjengelighet
- **Overstyrt:** Manuell verdi vises, indikator på override

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Tilgjengelighet, Kalender, Bookinger

---

## SEKSJON 3: FØLG OPP

### 3.1 Elever — Spillerliste

**URL/Route:** `/admin/elever`  
**Module:** Elever  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Alle spillere. Inngangen til alt spillerrelatert.

**Main Sections:**

| Kolonne | Beskrivelse |
|---------|-------------|
| Avatar + Navn | Profilbilde, fullt navn |
| HCP | Nåværende handicap |
| A-K | Kategoribadge |
| Siste booking | Dato og tjeneste |
| Plan-status | Aktiv/Utløpt/Ingen |
| Completion | Ukens completion-rate (bar) |
| Signaler | Antall aktive signaler (badge) |

**Primary Actions:**
- Søk (fritekst)
- Filtrer: status, instruktør, A-K-kategori, aldersgruppe
- Sorter: navn, HCP, siste aktivitet
- Klikk spiller → 360-profil
- «Ny spiller» → opprett-skjema

**Secondary Actions:** Bulk-actions (ikke spesifisert)

**Filters:** Status, instruktør, A-K-kategori, aldersgruppe, søk

**Modals:**
- Ny spiller-skjema (fornavn, etternavn, e-post, telefon, fødselsdato, HCP, hjemmeklubb, foresatt)

**Ny spiller-skjema:**

| Felt | Type | Påkrevd |
|------|------|---------|
| Fornavn | Tekst | Ja |
| Etternavn | Tekst | Ja |
| E-post | E-post | Ja |
| Telefon | Telefon | Nei |
| Fødselsdato | Dato | Nei |
| HCP | Tall | Nei |
| Hjemmeklubb | Tekst | Nei |
| Foresatt | Koble/opprett | Nei (ja hvis u/18) |

**States:**
- **Med spillere:** List med filtrering
- **Ingen spillere:** «Opprett din første spiller»
- **Søk aktiv:** Filtrert list

**Tier-gating:** Ikke spesifisert

**Connections:** Spillerprofil 360°, Booking, Foresatt-modul

---

### 3.2 Spillerprofil 360°

**URL/Route:** `/admin/elever/[id]`  
**Module:** Spillerprofil 360°  
**Shell Type:** CoachHQDarkShell (V2.0)  
**Status:** ✅ Ferdig (delvis)

**Formål:** Alt om én spiller. Kjernen i coaching.

**Main Sections:**

**Layout:** 4-raders grid med 9 kort. Hvert kort ekspanderbart.

**Kort 1: Identity**

| Felt | Beskrivelse |
|------|-------------|
| Avatar + Navn | Profilbilde, fullt navn |
| Alder | Beregnet fra fødselsdato |
| HCP | Nåværende |
| A-K-kategori | Badge |
| Kontakt | E-post, telefon |
| Foresatt | Navn, relasjon, kontakt (junior) |
| Medlemskap | Academy-type, tier |

**Kort 2: Golf**

| Felt | Beskrivelse |
|------|-------------|
| SG-breakdown | Radar-chart: OTT, APP, ARG, PUTT |
| HCP-trend | Linjegraf: 30d/90d/1år |
| Siste 5 runder | Dato, bane, score, SG-total |
| Gjennomsnitt | Score, SG, FIR%, GIR%, Putts/runde |

**NB:** SG-breakdown er foreløpig stub. DataGolf-integrasjon: ikke dokumentert.

**Kort 3: Coaching**

| Felt | Beskrivelse |
|------|-------------|
| Aktiv plan | Navn, periode, uke X av Y, status |
| Siste sesjonsnotat | 5-felts notat (teknisk fokus, observasjoner, etc.) |
| Neste booking | Dato, tid, tjeneste |
| Siste 5 coaching-sesjoner | Dato, varighet, coach-notater |
| Coach-feedback | Siste feedback-tekst |

**Kort 4: Training**

| Felt | Beskrivelse |
|------|-------------|
| Completion-rate | Prosent-bar: denne uken, siste 4 uker |
| Pyramide-adherence | 5 ringer: faktisk vs. planlagt (FYS/TEK/SLAG/SPILL/TURN) |
| Timer trent/uke | Snitt og trend |
| Treningslogg | Siste 10 økter med dato, type, varighet |
| Drill-benchmarks | Beste scores på key drills |

**Kort 5: Mental**

| Felt | Beskrivelse |
|------|-------------|
| Mental load | Snitt M/PR i gjennomførte økter |
| Trykktoleranse | Selvrapportert + coach-vurdering |
| Selvtillit | Score |
| Aksept | Score |
| Fokus | Score |

**Kort 6: Forecast**

| Felt | Beskrivelse |
|------|-------------|
| Prognose | Forventet HCP-utvikling |
| Degradation | Degradation-tracking med risiko |
| Neste milepæl | «HCP < 10 innen [dato]» |

**Kort 7: Tests**

| Felt | Beskrivelse |
|------|-------------|
| Testresultater | Per test: score, PB, dato, delta |
| Composite score | Aggregert med trend-pil |
| Retest-status | Hvilke tester er forfalte |

**Kort 8: Economy**

| Felt | Beskrivelse |
|------|-------------|
| Betalingshistorikk | Siste transaksjoner |
| Abonnement | Type, status, neste faktura |
| Utestående | Ubetalte beløp |

**Kort 9: Signals**

| Felt | Beskrivelse |
|------|-------------|
| Aktive signaler | Type, verdi, trend, urgency |
| Auto-varsler | Ikke booket 3 uker, plan utløpt, etc. |
| PlanAction-forslag | Ventende forslag fra agenter |

**Signal-visninger:**

| Signal | Visningskomponent |
|--------|-------------------|
| SG_BREAKDOWN | Radar-chart med delta-markering |
| COMPLETION_RATE | Prosent-bar per uke |
| PYRAMIDE_ADHERENCE | 5 ringer (faktisk vs. planlagt) |
| COMPOSITE_TEST | Score med trend-pil |
| DISPERSION_TREND | Per-kølle graf |
| TOURNAMENT_PROXIMITY | Countdown-badge |
| HCP_DELTA | Trend-chip (grønn/rød) |
| INJURY_FLAG | Rød varsel-badge |
| STREAK | Flamme-ikon med tall |

**Ekstra paneler fra 360-profilen:**

| Panel | Innhold | Status |
|-------|---------|--------|
| Coach-notater | Fritekst, synlighet-toggle (synlig for spiller ja/nei) | ✅ |
| Kommunikasjonslogg | All kommunikasjon med spilleren, kronologisk | ✅ |
| Testregister | Alle tester gjennomført | ✅ |
| Coach Agent (AI-chat) | AI-chat kontekstualisert til denne spilleren | 🔨 |
| Foresatt-panel | Foresatte koblet til spilleren (junior) | ✅ |

**Primary Actions:**
- Klikk kort → ekspander detalj
- Rediger coach-notater inline
- Legg til kommunikasjonslogg-entry
- Åpne Coach Agent AI-chat
- Visualiser signals

**Secondary Actions:**
- Endre plan-status
- Trigger degradation-analyse
- Send melding til spiller/foresatt

**Filters:** Panel-navigering, signal-type

**Modals:**
- Coach-notat rediger
- Kommunikasjonslogg nytt-innlegg
- Signal-detalj
- Coach Agent chat

**States:**
- **Full profil (med data):** Alle 9 kort synlige
- **Mangel data (ny spiller):** Kort viser «Ingen data»-melding + CTA
- **Loading:** Skeleton-loading per kort
- **Active plan:** Plan-kortet uthevet med blå border
- **Signals pending:** Signaler-kortet har «!»-badge

**Tier-gating:** Ikke spesifisert (antatt: coach + admin)

**Connections:** Elever (liste), Treningsplaner, Booking, Agenter, AI Coach

---

### 3.3 Coaching Board

**URL/Route:** `/admin/coaching-board`  
**Module:** Coaching Board  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Kanban-oversikt over alle spillere.

**Main Sections:**

**Layout:** 4-kolonne kanban-board: Ny → Aktiv → Oppfølging → Avsluttet

**Spillerkort i kanban:**

| Felt | Beskrivelse |
|------|-------------|
| Avatar + Navn | |
| HCP + A-K | Badges |
| Siste aktivitet | Dato + type |
| Status-indikator | Grønn (OK), gul (trenger oppfølging), rød (kritisk) |
| Signal-badges | Aktive signaler |

**Primary Actions:**
- Dra kort mellom kolonner
- Klikk kort → 360-profil

**Secondary Actions:** Filtrer kort, sorter per kolonne

**Filters:** A-K-kategori, instruktør, status-indikator

**Modals:** 360-profil (modal eller side-panel)

**States:**
- **Normal:** Full 4-kolonne kanban
- **Filtrert:** Viser bare relevant kort
- **Tom kolonne:** «Ingen spillere i denne fasen»

**Tier-gating:** Ikke spesifisert

**Connections:** Elever, Spillerprofil 360°, Godkjenninger

---

### 3.4 Godkjenninger

**URL/Route:** `/admin/godkjenninger`  
**Module:** Godkjenninger  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Ventende bookinger, aktiviteter, OG agent-forslag (PlanActions).

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Ventende bookinger | Spiller, tjeneste, tid, booking-kilde |
| Ventende aktiviteter | Type, spiller, beskrivelse |
| Agent-innboks (NY) | PlanAction-forslag fra agenter |

**Agent-innboks:**

| Felt | Beskrivelse |
|------|-------------|
| Prioritet-sortering | urgent → high → medium → low |
| Gruppering | Per spiller med avatar og siste aktivitet |
| PlanAction-kort | Type, prioritet-badge, rationale-tekst, signal-kilde |
| Handlingsknapper | Godkjenn / Endre og godkjenn / Avvis / Utsett |
| Detalj-ekspander | Payload, signal-snapshot, foreslåtte endringer |
| Badge-teller | Antall ventende i sidebar |

**Batch-godkjenning:**

| Element | Beskrivelse |
|---------|-------------|
| «Godkjenn alle lave-risiko» | Auto-godkjenner DRILL_SWAP + REST_DAY_ADD |
| Per-spiller «Godkjenn alle» | Godkjenner alle for én spiller |
| Individuelle handlinger | Per PlanAction |

**Mål:** 30 spillere håndtert på under 10 minutter.

**PlanAction-typer med prioritet:**

| Type | Prioritet | Handling |
|------|----------|----------|
| PERIOD_SWITCH | Urgent | Bytt periodetype |
| SESSION_REMOVE | High | Fjern økt (skade) |
| REST_DAY_ADD | High | Legg til hvile |
| PYRAMID_ADJUST | Medium-high | Endre pyramide |
| FOCUS_CHANGE | Medium-urgent | Endre ukefokus |
| SESSION_MODIFY | Medium | Endre drills/intensitet |
| WEEK_SHIFT | Medium | Forskyv uke |
| INTENSITY_ADJUST | Medium | Endre CS/PR |
| SESSION_ADD | Low-medium | Ny økt |
| DRILL_SWAP | Low-medium | Bytt drill |

**Primary Actions:**
- Godkjenn PlanAction
- Endre og godkjenn (redigering før godkjenning)
- Avvis PlanAction
- Utsett (revisit later)

**Secondary Actions:** Batch-godkjenning, filtrer per prioritet

**Filters:** Prioritet, spiller, PlanAction-type, signal-kilde

**Modals:**
- PlanAction-detalj (med rationale, payload, signal-snapshot)
- Endre-og-godkjenn modal (editing interface for en spesifikk action)

**States:**
- **Med ventende:** Liste sortert etter prioritet
- **Tom:** «Ingen ventende godkjenninger»
- **Loading agent-innboks:** Skeleton-kort

**Tier-gating:** Ikke spesifisert (antatt: coach + admin)

**Connections:** Agenter, Treningsplaner, Spillerprofil 360°

---

### 3.5 Oppfølgingskø (Signals follow-up queue)

**URL/Route:** Ikke spesifisert (mulig `/admin/oppfølging` eller sub-modul av Godkjenninger)  
**Module:** Oppfølgingskø  
**Shell Type:** Ikke spesifisert (antatt CoachHQDarkShell)  
**Status:** ❓ Trenger verifisering (dokumentert i komplett-funksjonsoversikt, men begrenset UI-spec)

**Formål:** Ventende meldinger med SLA-indikatorer. Prioriteringsalgoritmene basert på signal-type og tid.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Meldinger-liste | Spiller, signal-type, mottat-tid, SLA-status |
| SLA-indikator | Farge: grønn < 12h, gul 12-24h, rød > 24h |
| Auto-gruppering | Per spiller med avatar |

**Primary Actions:**
- Klikk melding → detalj-panel
- Marker som håndtert
- Utsett til senere

**Secondary Actions:** Sortér etter SLA-status, urgency

**Filters:** SLA-status, signal-type

**Modals:** Signal-detalj, sammendrag av spiller-situasjon

**States:**
- **Normal:** Sortert etter urgency + SLA
- **Alle håndtert:** «Ingen ventende oppfølginger»

**Tier-gating:** Ikke spesifisert (antatt: coach)

**Connections:** Spillerprofil 360°, Agenter, Signals

---

## SEKSJON 4: ANALYSE

### 4.1 Talent

**URL/Route:** `/admin/talent`  
**Module:** Talent  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis)

**Formål:** Talentidentifikasjon og pipeline-styring.

**Main Sections:** Talentspillere med utvidet profil, utviklingsløp, potensialvurdering

**Primary Actions:** Ikke detaljert spesifisert

**Secondary Actions:** Ikke spesifisert

**Filters:** Ikke spesifisert (antatt: A-K, alder, potensial-score)

**Modals:** Ikke spesifisert

**States:** Ikke spesifisert

**Tier-gating:** Ikke spesifisert

**Connections:** Elever, Spillerprofil 360°

---

### 4.2 Analytics

**URL/Route:** `/admin/analytics`  
**Module:** Analytics  
**Shell Type:** MCLayout  
**Status:** 🔨 Skal bygges (delvis)

**Formål:** Forretningsanalyse.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| KPI-kort | Aktive spillere, bookinger/mnd, omsetning/mnd, snitt-HCP |
| Grafer | Booking-trend, omsetning-trend, spillervekst |
| Konverteringstrakt (NY) | Besøk → booking → gjennomført → gjenkjøp |
| Retention (NY) | Churn-rate, spillerlevetid, kohorter |
| Prognose (NY) | 30/60/90-dagers omsetning |
| Coach-produktivitet (NY) | Timer/instruktør, utnyttelse, omsetning/time |

**Primary Actions:** Ingen (read-only)

**Secondary Actions:** Filtrer periode, eksporter

**Filters:** Periode, instruktør

**Modals:** Detalj-drilldowner (antatt)

**States:** Loading, data-ready, no-data

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Bookinger, Økonomi, Rapporter

---

### 4.3 Rapporter

**URL/Route:** `/admin/rapporter`  
**Module:** Rapporter  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis)

**Formål:** Eksporterbare rapporter.

**Main Sections:**

| Rapport-type | Felter |
|--------------|--------|
| Bookinger | Filtrer på periode, instruktør, tjeneste → CSV-eksport |
| Omsetning | Filtrer på periode, kilde → CSV-eksport |
| Spillere | Filtrer på status, kategori → CSV-eksport |

**Primary Actions:**
- Velg rapport-type
- Sett filter
- «Eksporter CSV»

**Secondary Actions:** Forhåndsvisning

**Filters:** Periode, instruktør, tjeneste, status, kategori

**Modals:** Ikke spesifisert

**States:**
- **Normal:** Rapport-velger med filtrer
- **Eksportert:** Bekreftelse + download-link

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Bookinger, Økonomi, Elever

---

### 4.4 Turneringer

**URL/Route:** `/admin/turneringer`  
**Module:** Turneringer  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis)

**Formål:** Turneringsoversikt og deltaker-administrasjon.

**Main Sections:** Turneringsliste, opprett/slett, oversikt med deltakere

**Primary Actions:**
- Opprett turnering
- Slett turnering
- Legg til/fjern deltakere

**Secondary Actions:** Rediger turnering-detalj

**Filters:** Status, type

**Modals:**
- Opprett turnering
- Rediger turnering
- Legg til deltakere

**States:**
- **Med turneringer:** Liste
- **Ingen turneringer:** «Opprett din første turnering»

**Tier-gating:** Ikke spesifisert

**Connections:** Elever, Spillerprofil 360°

---

## SEKSJON 5: DRIFT

### 5.1 Bookinger

**URL/Route:** `/admin/bookinger`  
**Module:** Bookinger  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Administrasjon av alle bookinger. Hub for booking-fulfiiment.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Søk/filter | Fritekst, periode, status, instruktør, tjeneste |
| Booking-liste | Dato, tid, spiller, tjeneste, instruktør, status |
| Bulk-handlinger | Kanseller flere, send påminnelser |

**Ny booking-skjema:**

| Felt | Type |
|------|------|
| Spiller | Autocomplete-søk |
| Tjeneste | Dropdown |
| Instruktør | Dropdown (med «Standard»-fasilitet auto) |
| Dato/tid | Datepicker + tidvelger |
| Fasilitet | Auto-fylt eller manuell |
| Med betaling | Toggle → Stripe-flyt |

**Primary Actions:**
- Søk
- Opprett
- Kanseller
- Flytt
- Marker fullført/no-show
- Bulk-kanseller
- Bulk-påminnelse

**Secondary Actions:** Filtrer, sorter

**Filters:** Periode, status (planlagt/fullført/no-show/kansellert), instruktør, tjeneste, spiller

**Modals:**
- Opprett/rediger booking
- Bekreft kansellering
- Marker no-show
- Admin-notat

**States:**
- **Normal:** List med bookinger
- **Ingen bookinger:** «Ingen bookinger i perioden»
- **Betaling kreves:** Stripe-feilmelding + retry

**Tier-gating:** Ikke spesifisert

**Connections:** Kalender, Tjenester, Instrukør-profil, Økonomi (auto-charge pipeline)

---

### 5.2 Tilgjengelighet

**URL/Route:** `/admin/tilgjengelighet`  
**Module:** Tilgjengelighet  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Instruktoeres arbeidstider. Grunnlaget for alt som kan bookes.

**Main Sections:**

**Layout:** Venstre panel: instruktoer-liste (avatar + navn + status-dot). Høyre: uke-grid.

**Uke-grid (hovedvisning):**

| Element | Beskrivelse |
|---------|-------------|
| 7 kolonner | Mandag-søndag |
| Tidsakse (Y) | 06:00-21:00, 30-min inkrementer |
| Grønne blokker | Tilgjengelig tid (drabar i høyde for å justere) |
| Røde blokker | Blokkerte tider med grunn-label |
| Grå blokker | Stengte perioder (ferie, helligdag) |
| Blå overlay | Eksisterende bookinger (read-only, viser at tiden er brukt) |
| Google Calendar-ikon | Synk-status med siste synk-tidsstempel |

**Instruktoer-liste (venstre panel):**

| Felt | Beskrivelse |
|------|-------------|
| Avatar | 36px, sirkulær |
| Navn | body, text-primary |
| Status-dot | Grønn (tilgjengelighet satt), gul (delvis), rød (ikke satt) |
| Timer/uke | Caption: «32t/uke» |
| Google-ikon | Vises hvis Google-synk er aktiv |

**Primary Actions:**
- Dra for å opprette tilgjengelig blokk (klikk + dra vertikalt på dag)
- Dra kant for å justere start/slutt-tid
- Høyreklikk blokk → Rediger / Slett / Gjenta ukentlig
- «Blokker tid» knapp → modal
- «Stengt periode» knapp → modal
- «Synk Google Calendar» → henter opptatte tider, oppretter automatiske blokker
- Kopier uke → bruk på neste uke/alle fremtidige uker
- Bytt instruktør → venstre panel

**Secondary Actions:** Bulk-edit, import fra Google

**Filters:** Instruktør, søk

**Modals:**
- Blokker-tid modal (dato, start-tid, slutt-tid, grunn, gjentagende)
- Stengt periode modal (fra-dato, til-dato, grunn)
- Googl-synk-status

**Blokker-tid modal:**

| Felt | Type |
|------|------|
| Dato | Datepicker (enkelt eller rekkevidde) |
| Start-tid | Tidvelger (30-min inkrementer) |
| Slutt-tid | Tidvelger |
| Grunn | Dropdown: Personlig, Møte, Sykdom, Ferie, Annet + fritekst |
| Gjentagende | Toggle + frekvens (ukentlig/månedlig/engangss) |

**States:**
- **Satt opp:** Grønne blokker viser tilgjengelige tider, blå viser bookinger
- **Ikke satt opp:** Tom grid med «Sett opp tilgjengelighet for [Navn]» CTA
- **Google-synk aktiv:** Automatisk oppdatert med siste synk-tidsstempel + «Synk nå»-knapp
- **Konflikt:** Gul varseltrekant når booking overlapper blokkert tid

**Tier-gating:** Ikke spesifisert

**Connections:** Kalender, Bookinger, Kapasitet, Google Calendar (ekstern)

---

### 5.3 Tjenester

**URL/Route:** `/admin/tjenester`  
**Module:** Tjenester  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Definer hva akademiet tilbyr. Grunnlaget for booking og økonomi.

**Main Sections:**

**Layout:** Kort-grid (3 per rad) + «Ny tjeneste» CTA øverst.

**Tjenestekort:**

| Felt | Plassering | Beskrivelse |
|------|------------|-------------|
| Tjenestenavn | Tittel (h4) | «Privattime 60 min», «Gruppetrening 90 min» |
| Varighet | Badge (topp høyre) | «60 min», «90 min» |
| Pris | Stor tekst | «kr 1 200» |
| Beskrivelse | body-sm, 2 linjer | «Individuell coaching med video-analyse» |
| Instruktoerer | Avatar-stack | Hvem som tilbyr tjenesten |
| Lokasjoner | Pills | Hvor tjenesten er tilgjengelig |
| Aktiv-status | Toggle (topp høyre) | Grønn=aktiv, grå=inaktiv |
| Bookinger/mnd | Caption | «23 bookinger siste 30 dager» |
| Omsetning/mnd | Caption | «kr 27 600 siste 30 dager» |

**Primary Actions:**
- «Ny tjeneste» → opprett-modal
- Klikk kort → rediger-modal
- Toggle aktiv/inaktiv → umiddelbar effekt

**Secondary Actions:** Sorter (navn, pris, popularitet), søk

**Filters:** Status (aktiv/inaktiv), instruktør, lokasjon

**Modals:**
- Opprett/rediger tjeneste

**Opprett/rediger-modal:**

| Felt | Type | Påkrevd |
|------|------|---------|
| Navn | Tekst | Ja |
| Beskrivelse | Textarea | Ja |
| Varighet | Dropdown: 30/45/60/90/120 min | Ja |
| Pris | Tall (NOK) | Ja |
| Farge | Fargevelger (for kalender) | Ja |
| Instruktoerer | Multi-select | Ja |
| Lokasjoner | Multi-select | Ja |
| Krev godkjenning | Toggle | Nei |
| Maks deltakere | Tall (for gruppe) | Nei |
| Synlig i bookingflyt | Toggle | Ja |

**States:**
- **Med tjenester:** Kort-grid med metrikkene
- **Ingen tjenester:** «Opprett din første tjeneste for å starte booking»
- **Inaktiv tjeneste:** Kortet dimmet med «Inaktiv»-badge

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Bookinger, Kalender, Økonomi

---

### 5.4 Økonomi

**URL/Route:** `/admin/okonomi`  
**Module:** Økonomi  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis), 🔨 Skal bygges (Revenue drill-down ny)

**Formål:** Økonomisk oversikt.

**Main Sections:**

**KPI-stripe (alltid synlig):**

| KPI | Beskrivelse |
|-----|-------------|
| Omsetning denne måneden | Total, trend-pil |
| Gjennomsnittlig booking-verdi | Pris per booking |
| Antall betalinger | Fullført + utestående |
| Netto MRR | Monthly Recurring Revenue |

**Tabs:**

| Tab | Innhold |
|-----|---------|
| Oversikt | Grafer: omsetning-trend, booking-volum, pakke-split |
| Transaksjoner | Liste: dato, beløp, spiller, status, betalingsmetode |
| Abonnement (NY) | Aktive abonnementer, churn-rate, LTV |
| Utestående | Ubetalte beløp, aged schedule, påminnelser |

**Transaksjoner-liste:**

| Kolonne | Beskrivelse |
|---------|-------------|
| Dato | Dato og tid |
| Beløp | NOK, status-farge |
| Spiller | Avatar + navn |
| Tjeneste | Servicetype |
| Status | Godkjent / Venter / Feilet / Refundert |
| Betalingsmetode | Kort-4-sifre eller abonnement |

**Primary Actions:**
- Filtrer periode
- Søk etter spiller/transaksjon
- Refunder betaling (antatt)
- Send påminnelse for utestående

**Secondary Actions:** Eksporter CSV, drill-down i transaksjoner

**Filters:** Periode, status, betalingsmetode, instruktør

**Modals:**
- Transaksjon-detalj
- Refund-skjema (antatt)

**States:**
- **Normal:** KPI-stripe + tabs
- **Ingen data:** «Ingen transaksjoner i perioden»
- **Loading:** Skeleton-kort

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Bookinger (auto-charge), Abonnement-motoren (Stripe), Analytics

**PIPELINE MAPPING:**
Auto-charge pipeline: mark booking complete (kalender) → check saved payment method (player-db) → Stripe PaymentIntent → receipt → update dashboard (økonomi)

---

### 5.5 Fasiliteter

**URL/Route:** `/admin/fasiliteter`  
**Module:** Fasiliteter  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Fasilitetsoversikt og ressurs-disponering.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Live-status per fasilitet | Ledig/opptatt |
| Ukebookinger per fasilitet | Oversikt over timing |

**Primary Actions:**
- Opprett fasilitetsbooking
- Slett fasilitetsbooking

**Secondary Actions:** Filtrer periode

**Filters:** Fasilitet, periode

**Modals:**
- Opprett fasilitet
- Rediger fasilitet

**States:**
- **Med fasiliteter:** Liste med status
- **Ingen fasiliteter:** «Opprett din første fasilitet»

**Tier-gating:** Ikke spesifisert (antatt: admin)

**Connections:** Kalender (auto-assignment), Tjenester (lokasjon-kobling), Bookinger

---

### 5.6 Lokasjoner

**URL/Route:** `/admin/lokasjoner`  
**Module:** Lokasjoner  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig

**Formål:** Lokasjonsstyring.

**Main Sections:** Lokasjonsliste med konfigurasjonsdata

**Primary Actions:**
- Opprett lokasjon
- Rediger lokasjon
- Sett instruktoer-lokasjon
- Sett tjenester per lokasjon

**Secondary Actions:** Slett lokasjon

**Filters:** Status (aktiv/inaktiv)

**Modals:**
- Opprett/rediger lokasjon (navn, adresse, telefon, åpningstider)
- Tildel instruktoer
- Tildel tjenester

**States:**
- **Med lokasjoner:** Liste
- **Ingen lokasjoner:** «Opprett din første lokasjon»

**Tier-gating:** Ikke spesifisert (antast: admin)

**Connections:** Fasiliteter, Tjenester, Tilgjengelighet (instruktoer-lokasjon)

---

## SEKSJON 6: VERKTØY

### 6.1 Team

**URL/Route:** `/admin/team`  
**Module:** Team  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Team-administrasjon og RBAC.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Teammedlemmer-liste | Navn, rolle, capabilities, status (aktiv/deaktivert) |
| Inviter medlem | E-post, rolle-velger |
| Audit log | Handlinger, hvem, når |

**Primary Actions:**
- Inviter nytt medlem
- Oppdater brukerrolle
- Oppdater capabilities per bruker
- Appliser preset (ferdigdefinert rollepakke)
- Deaktiver/reaktiver bruker
- Se audit log

**Secondary Actions:** Søk medlem

**Filters:** Rolle, status, capabilities

**Modals:**
- Inviter medlem-skjema
- Rediger brukerrolle
- Bekreft sensitiv handling

**Invite-skjema:**

| Felt | Type |
|------|------|
| E-post | E-post |
| Rolle | Dropdown: Admin, Coach, Instruktør, Viewer |
| Tilsendt dato | Auto |

**RBAC-capabilities (43 total i 12 grupper):**
[Ref. coachhq-komplett-funksjonsoversikt for full CBAC-matrise]

**States:**
- **Med medlemmer:** Liste
- **Ingen medlemmer:** «Inviter ditt første teammedlem»
- **Bekreftelse ventende:** «Invitasjon sent» status

**Tier-gating:** Admin-only

**Connections:** Godkjenninger (admin), Alle moduler (RBAC-sjekk på alle actions)

---

### 6.2 Meldinger

**URL/Route:** `/admin/meldinger`  
**Module:** Meldinger  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig (delvis), 🔨 Skal bygges (Quick reply templates ny)

**Formål:** Innboks for all kommunikasjon.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Innboks | Alle meldinger, sortert etter nyest |
| Direktechat | Samtaler per spiller |
| E-postmaler | Ferdigdefinerte svar-templates (NY) |

**Innboks-liste:**

| Kolonne | Beskrivelse |
|---------|-------------|
| Fra | Spiller-avatar + navn |
| Melding | Snippet av innhold |
| Dato | Når meldingen ble mottatt |
| Status | Ulest / Godkjent / Avvist / Venter svar |
| AI-svar | «AI har foreslått svar»-indikator |

**Primary Actions:**
- Åpne melding
- Godkjenn AI-generert svar
- Avvis AI-svar
- Regenerer AI-svar
- Send direktemelding

**Secondary Actions:** Søk, filtrer

**Filters:** Status (ulest/godkjent/avvist), fra-spiller, dato

**Modals:**
- Melding-detalj (med AI-svar-preview, godkjennelse-knapper)
- Send melding (spiller-søk, tekst-editor)
- Quick reply template-velger (antatt)

**Direktechat (sub-view):**

| Felt | Beskrivelse |
|------|-------------|
| Samtale-liste | Per spiller, siste melding-snippet |
| Chat-vindu | Kronologisk liste over meldinger |
| Input-felt | Send direktemelding |

**E-postmaler (sub-view):**

| Felt | Beskrivelse |
|------|-------------|
| Mal-liste | Navn, bruksfrekvens |
| Mal-editor | Tittel, emne-linje, body (WYSIWYG) |

**States:**
- **Med meldinger:** Innboks-liste
- **Tom innboks:** «Ingen meldinger»
- **AI-svar venter godkjenning:** Highlight i listen

**Tier-gating:** Ikke spesifisert

**Connections:** Agenter (AI-svar), Spillerprofil 360° (kommunikasjonslogg), E-postmaler

---

### 6.3 E-postmaler

**URL/Route:** `/admin/e-postmaler`  
**Module:** E-postmaler  
**Shell Type:** CoachHQDarkShell (antatt MCLayout)  
**Status:** ✅ Ferdig

**Formål:** CRUD for e-postmaler (templates for aut-responding).

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Mal-liste | Navn, type (welcome/reminder/feedback), status |
| Mal-detalj | Tittel, emne-linje, body-template |

**Primary Actions:**
- Opprett mal
- Rediger mal
- Slett mal
- Forhåndsvis rendering

**Secondary Actions:** Duplikar mal, sorter

**Filters:** Type, status (aktiv/inaktiv)

**Modals:**
- Opprett/rediger mal-skjema (navn, type, emne, body med {{variable}}-support)
- Forhåndsvis

**States:**
- **Med maler:** Liste
- **Ingen maler:** «Opprett din første mal»

**Template variables (antatt):**
- {{spiller_navn}}
- {{coaching_coach_navn}}
- {{neste_booking_tid}}
- {{plan_status}}
- osv.

**Tier-gating:** Admin

**Connections:** Meldinger, Agenter (auto-emails)

---

### 6.4 Agenter

**URL/Route:** `/admin/agenter`  
**Module:** Agenter  
**Shell Type:** CoachHQDarkShell  
**Status:** ✅ Ferdig

**Formål:** Administrer AI-agenter og deres triggere.

**Main Sections:**

| Seksjon | Felter |
|---------|--------|
| Agent-liste | Navn, type, status (aktiv/inaktiv), antall kjøringer |
| Agent-stat | Stats: kjøringer denne måneden, feil, success-rate |

**Primary Actions:**
- List alle agenter med stats
- Toggle agent av/på
- Se agent-logg

**Secondary Actions:** Rediger agent-instruksjoner (antatt)

**Filters:** Status, type

**Modals:**
- Agent-detalj (instruksjoner, trigger-betingelser, siste kjøringer)

**Known agents:**
- Oppfølgingskø-agent (prioritering av meldinger)
- PlanAction-agent (foreslår plan-endringer basert på signaler)
- Session-notat-agent (strukturer coaching-notater med Claude)
- Daily Brief-agent (AI-oppsummering av dagens prioriteter)
- Degradation-agent (advarer om risiko for skillattering)

**States:**
- **Med agenter:** Liste med status
- **Ingen agenter:** «Ingen agenter konfigurert»
- **Agent feiler:** Rød status-dot + error-melding i logg

**Tier-gating:** Admin

**Connections:** Godkjenninger (PlanAction-forslag), Meldinger (AI-svar), Signals, Treningsplaner

---

### 6.5 Økter (Session Recording)

**URL/Route:** `/admin/okter` eller `/admin/okter/recording`  
**Module:** Økter (Sesjonsopptak)  
**Shell Type:** MCLayout (antatt)  
**Status:** 🔨 Skal bygges

**Formål:** iPad/iPhone coaching-session recording + Deepgram transcription + Claude structuring.

**Main Sections:**

| Seksjon | Felter | Status |
|---------|--------|--------|
| Opptak-liste | Spiller, dato, varighet, status (recording/transcribing/processed) | 🔨 |
| Live-opptak monitor | Real-time Deepgram-transkripsjonstatus | 🔨 |
| Strukturert notat | 5-felts output (teknisk fokus, observasjoner, etc.) | 🔨 |
| Auto-delete (48h) | Opptak slettes etter 48 timer | 🔨 |

**Pipeline:**
iPad/iPhone recording → Supabase (temp storage) → Deepgram Nova-3 (Norwegian transcription) → Claude (note structuring) → 5-field note → Postgres → delete after 48h

**Cost model:** ~$50/month for 40 hrs/week coaching

**Primary Actions (antatt):**
- Start opptak (iPad-app trigger)
- Stopp opptak
- Manuelt trigger transkripsjonsstart
- Godkjenn strukturert notat

**Secondary Actions:** Rediger notat, slette opptak manuelt

**Filters:** Status, spiller, dato

**Modals:**
- Strukturert notat-detalj
- Rediger notat

**States:**
- **Recording:** Live-status indicator
- **Transcribing:** Progress-bar (Deepgram)
- **Processed:** Strukturert notat klar for review
- **Auto-deleted:** Grayed out with «Deleted»-label

**Tier-gating:** Coach

**Connections:** Spillerprofil 360° (kommunikasjonslogg), Coaching Board

---

## Additional Modules (Beyond Main 31 Screens)

### Teknisk Plan (sub-module under Planlegg)

**URL/Route:** `/admin/teknisk-plan`  
**Module:** Teknisk Plan  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis)

**Formål:** Fasebasert teknisk plan CRUD.

**Main Sections:** CRUD for fasebaserte planer, drill-valg, spiller-valg

**Primary Actions:**
- Opprett teknisk plan
- Rediger fase innenfor plan
- Slett fase
- Velg drills
- Velg spillere

**Secondary Actions:** Dupliser plan

**Filters:** Spiller, A-K-kategori

**Modals:** Plan-editor, fase-editor, drill-velger

**States:** Ikke spesifisert

**Tier-gating:** Coach + admin

**Connections:** Drill library, Treningsplaner, Elever

---

### Grupper (sub-module under Planlegg)

**URL/Route:** `/admin/grupper`  
**Module:** Grupper  
**Shell Type:** MCLayout  
**Status:** ✅ Ferdig (delvis)

**Formål:** Group (akademi-divisjon) administration.

**Main Sections:**
- Gruppeliste (Junior Academy, Academy Pro, etc.)
- Medlemshåndtering
- Gruppeplan
- Planmaler for grupper
- Gruppeøkter

**Primary Actions:**
- CRUD grupper
- Legg til/fjern medlemmer
- List tilgjengelige spillere
- Hent gruppeplan, synkroniser til alle medlemmer
- CRUD gruppeøkter + occurrence-overrides

**Secondary Actions:** Utvidet visning av gruppeøkter

**Filters:** Gruppe, status

**Modals:** Opprett/rediger gruppe, medlems-velger, plan-editor

**States:** Ikke spesifisert

**Tier-gating:** Admin

**Connections:** Elever, Treningsplaner, Økter

---

## Summary of Identified Gaps

1. **Session Recording UI** — Functional spec detailed in feature-audit, but detailed screen layout/states missing from design-brief
2. **Oppfølgingskø** — Brief reference in funcsjonsoversikt, full UI interaction spec needed
3. **Coach Agent (AI Chat)** — Referenced in 360-profil, but UI details (prompt structure, response handling, history) not documented
4. **Daily Brief Display** — Listed as ny modul, but full screen spec limited
5. **Auto-Charge Payment Flow** — Pipeline documented, but exact error states + user-facing recovery flows not detailed
6. **Teknisk Plan Detail Screens** — CRUD operations listed, but layout and interaction patterns (especially drill-velger modal) need clarification
7. **Google Calendar Sync** — Tilgjengelighet-modul references Google synk, but exact UI for conflict-resolution not documented
8. **Signal-to-Action Mapping** — Godkjenninger modul lists PlanAction-typer, but exact signal-trigger-logic not detailed
9. **PlayerHQ Integration** — Spillerprofil references comments/feedback from PlayerHQ, but sync-mechanism not documented
10. **Push Notifications** — Listed as new feature in feature-audit, but UI/trigger-points not specified in design-brief

---

## DESIGN SYSTEM REFERENCE

| Element | Value |
|---------|-------|
| Hovedbakgrunn | #F4F6F4 (--color-surface) — lys |
| Sidebar/contrast | #0F1F18 (--color-sidebar) — mørk |
| Ink/tekst | #0A1F18 (--color-ink) |
| Primary | #005840 |
| Accent | #D1F843 |
| Grid basis | 8pt |
| Card radius | 16px |
| Layout pattern | Tre-panel: sidebar (mørk) → liste (lys) → detaljpanel (lys) |

---

**End of inventory — mai 2026**
