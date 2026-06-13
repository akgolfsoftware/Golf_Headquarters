# Konsolidert plan — Workbench, Analyse-hubs, coachingregel, hybrid, Elite Fase 2 og veien videre

> Konsolidering av skjerm-manifestene (PlayerHQ, AgencyOS, Elite Fase 2, alle 2026-06-01) + beslutninger tatt 2026-06-02.
> Intensjonen i underlaget er bevart; der Anders har tatt nye beslutninger, er disse anvendt og markert som «erstatter tidligere».
> **Tiltenkt permanent lagring:** `~/Developer/akgolf-hq/docs/konsolidert-plan-2026-06-02.md` (flyttes dit når vi er ute av plan-modus).

---

## Beslutninger låst i denne runden

| # | Beslutning |
|---|---|
| D1 | **IA-konsolidering:** Workbench = den konkrete Claude Design-frontenden **`Workbench.html`**, brukt som **delt frontend-flate for spiller (PlayerHQ) og trener (CoachHQ)**, og er planleggings-hovedstaden (all planlegging). SG-Hub flyttes inn under **Analyse**-hubene. |
| D2 | **Coachingregel:** booking krever **IKKE** aktivt gruppemedlemskap. Uavhengig abonnent kan booke; **forhåndsbetaling i tråd med landingssiden**. *(Erstatter tidligere antakelse om gruppe-betinget booking.)* |
| D3 | **Hybrid fokus-spiller:** lanseres med **manuell pin**. AI-forslag-laget flyttes til **neste versjon**, aktiveres først **etter at AI-forslag er perfeksjonert**. |
| D4 | **Elite Fase 2 rekkefølge:** **dispersjon → video → mental**. *(Erstatter manifestets «video først».)* |
| D5 | **Live-økt i lanseringsscope:** de **fem live-skjermene** (brief → active → logger → tapper → summary) er innenfor lansering. |

---

## 1. IA-konsolidering: Workbench + Analyse (D1)

### Workbench = delt frontend-design + planleggings-hovedstaden
**Kanonisk design:** Workbench er Claude Design-fila **`Workbench.html`** (Claude Design-prosjekt `ab3b3c28-…`). Denne er **fasit for frontend-designet** og implementeres som **én delt frontend-komponent for både spiller (PlayerHQ) og trener (CoachHQ)** — samme flate, to innganger, coach-endring propagerer til spiller. Portes via design-porting-gaten (bygg fra design → screenshot → adversarial diff → 0 avvik) før den vises/merkes ferdig.

**Design-kilde (lokalisert 2026-06-02):** Hele «AK Golf HQ Design System» er eksportert til Google Drive — `AK Golf HQ Design System.zip` (155 MB) + mappestruktur med token-previews og skjerm-mapper (`analysere-admin`, `dashboard-innboks`, `stall-talent`, `DispersionTool.html`, `assets/`, `fonts/`). **Porting-vei (Fase 0, krever ut av plan-modus):** kopier design-systemet inn i `public/design-handover/ak-design-system/`, port `Workbench.html` først til den delte Workbench-komponenten (`/portal/planlegge/workbench` + `/admin/spillere/[id]/workbench`), behold ekte data/auth/Prisma, deretter CoachHQ-skjermene — hver via porting-gaten.

**All planlegging skjer i Workbench.** Workbench (`/portal/planlegge/workbench`, delt kjerne med coach via `/admin/spillere/[id]/workbench`) er ett verktøy med zoom År/Periode/Måned/Uke/Dag, og eier:
- Årsplan og **periodisering** (Grunn/Spesialisering/Turnering)
- Måneds-, uke- og dagsplan
- Treningsplaner og **teknisk plan** (P-posisjoner)
- **Fysisk trening** (fys-plan)
- Mål kobles inn som planleggings-kontekst

**Navnekollisjon løst:** hjem-skjermen (`/portal`) er **«Oversikt / I dag»** (daglig cockpit), ikke «Workbench». Begrepet **Workbench** betyr utelukkende planleggings-verktøyet. Eksisterende planleggings-ruter (`/tren/aarsplan`, `/tren/teknisk-plan`, `/tren/fys-plan`, perioder) eksponeres/administreres gjennom Workbench i stedet for som løsrevne sider.

### Analyse-hubene absorberer SG-Hub
**SG-Hub flyttes ut av `/portal/mal` og inn under Analyse.** Analyse-laget (PlayerHQ «Analysere», AgencyOS «Innsikt») samler all etteranalyse:
- **SG-Hub** (OTT/APP/ARG/PUTT vs PGA, per-kølle, benchmark, best-vs-now, equipment, yardage, conditions, strategy)
- Runder + shot-by-shot, TrackMan/dispersjon, statistikk, tester

**Konsekvens — ren tredeling:** **Planlegg (Workbench)** vs **Analysér (Analyse-hub m/ SG-Hub)** vs **Gjennomfør (live-økt)** — pluss Coach, Meg og Booking. `/portal/mal`-stien beholder kun mål; analyse-innhold rutes under Analysere.

---

## 2. Coachingregel for booking (D2)

**Regel:** Booking av coaching krever **ikke** aktivt gruppemedlemskap. Enhver utøver/kunde med et **uavhengig plattformabonnement** kan velge å booke en time. Betaling skjer som **forhåndsbetaling i tråd med prisene/vilkårene på landingssiden**.

**Konsekvenser for produktet:**
- Booking-CTA vises for **alle innloggede abonnenter** — ingen enrollment-gate.
- Forhåndsbetaling kreves før timen bekreftes; **landingssidens priser er fasit** for pris/vilkår.
- Eksisterende atomiske bookingflyt (`createCreditBooking` / Stripe checkout) gjenbrukes; betaling skjer før bekreftelse.
- **Erstatter** den tidligere antakelsen (PRD/review) om at kun gruppemedlemmer kan booke.

**Åpent punkt:** `[FILL: avklar samspill credits ↔ forhåndsbetaling]` — for abonnement som inkluderer timer (Performance=2/Performance Pro=4), brukes credits; øvrige forhåndsbetaler per landingsside. Bekreft at dette er ønsket tolkning.

---

## 3. Hybrid fokus-spiller (D3)

**Lansering (nå):** Fokus-spiller-blokken i AgencyOS-cockpiten kjøres som **manuell pin** — coach pinner spiller(e), deterministisk og forutsigbart. Ingen AI-rangering ved lansering.

**Neste versjon:** AI-forslag-laget (oppfølging, ubesvarte, hastespørsmål → automatisk rangering av hvem som trenger coachen) legges til **oppå** den manuelle pinnen (pin har alltid prioritet).

**Flytte-/aktiveringskriterium:** AI-laget aktiveres **først når AI-forslag er perfeksjonert**. Konkret terskel `[FILL: definer "perfeksjonert"]` — forslag:
- treffrate/presisjon på forslag over `[FILL: %]` mot coach-fasit,
- coach godkjenner forslagene i `[FILL: antall]` påfølgende uker uten vesentlige feil.
Inntil terskelen er nådd: kun manuell pin i produksjon.

---

## 4. Elite Fase 2 (D4)

Rekkefølge: **1) Dispersjon → 2) Video → 3) Mental.** Bygges **etter** at kjerne-redesignet (PlayerHQ + AgencyOS mot manifest) er ferdig. Hver funksjon krever nye datamodeller (ikke ren UI).

| Rekkefølge | Funksjon | Nye skjermer | Nye datamodeller |
|---|---|---|---|
| 1 | **Dispersjon-motor** (størst moat) | dispersjon-oversikt, sikte-planlegger (EV-varmekart), hull-for-hull game plan | `DispersionProfile`, `AimStrategy` (avledes fra TrackMan/Shot via cron) |
| 2 | **Video-analyse** | bibliotek, frame-analyse + annotering, synk-sammenligning, coach-versjon | `VideoAnnotation`, `VideoComparison` (SessionVideo finnes) |
| 3 | **Mental** | hub, pre-shot-rutine, dagbok, ferdighets-radar, pressure-kobling | `MentalLog`, `RoutineLog`, `MentalAssessment` |

*Readiness/recovery (HRV, søvn, ACWR, wearable) = egen fase etter disse tre.*

---

## 5. Live-økt i lanseringsscope (D5)

Bekreftet: **live-økt er i lanseringsscope.** De fem skjermene leveres:
`/brief` (pre-økt: mål/fokus/coach-kommentar) → `/active` (timer + dagens drills) → `/logger` (reps/resultat) → `/tapper` (slag-for-slag) → `/summary` (statistikk + følelse). Coach-perspektiv: `/admin/live/[sessionId]/brief|active|summary` (vurdering 1–5). *Dette løfter live fra «demo/preview» til lanseringsleveranse.*

---

## 6. Veien videre (faseplan)

> Rekkefølge er avhengighetsdrevet. `[FILL: tidsramme]` og `[FILL: ansvarlig]` per fase.

### Fase 0 — Lansering (nå)
- Kjerne-redesign PlayerHQ + AgencyOS mot manifestene.
- **IA-konsolidering (D1):** Workbench som planleggings-hovedstad; SG-Hub flyttet under Analyse; hjem omdøpt til «Oversikt/I dag».
- **Coachingregel (D2):** åpen booking + forhåndsbetaling per landingsside; fjern enrollment-gate.
- **Hybrid (D3):** fokus-spiller manuell pin.
- **Live-økt (D5):** fem live-skjermer + coach-perspektiv.
- **Klart før neste:** kjerneflyter grønne i verifikasjon; booking tar betaling før bekreftelse; manifest-skjermene bestått design-gate.

### Fase 1 — AI-forslag + egen statistikk
- Perfeksjoner AI-forslag → **aktiver hybrid AI-lag (D3)** når terskel nås.
- Egen statistikk-innlegging (spiller-UI for manuell SG/runde) + **ekstern import** (AppGame/Golf GameBook, eksportfil-mønster fra TrackMan/Upgame/GolfBox).
- **Klart før neste:** AI-treffrate over terskel; import vises i Analyse-hub.

### Fase 2 — Elite (D4)
- Dispersjon → video → mental, hver med datamodell-migrasjon først.
- **Klart før neste:** dispersjon-cron stabil; modeller migrert uten brudd.

### Senere (backlog)
- Full to-veis Google-synk, talent på ekte data, readiness/recovery, multi-tenant, mobilapp, tredjeparts-API. `[FILL: prioriter inn i fase 3+]`

### Verifikasjon
Per leveranse: `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build` grønt; RLS på nye tabeller i samme migrasjon; design-gate (adversarial diff mot manifest) bestått; ende-til-ende-test av booking (forhåndsbetaling), live-økt (5 skjermer) og Analyse-hub (SG-Hub flyttet).

---

## Åpne avklaringer
- `[FILL]` Credits ↔ forhåndsbetaling-samspill (pkt. 2).
- `[FILL]` Definisjon av «perfeksjonert AI-forslag» + terskel (pkt. 3).
- `[FILL: tidsramme/ansvarlig]` per fase i pkt. 6.
- `[FILL]` Skal hjem-skjermen hete «Oversikt» eller «I dag»?
- `[FILL]` Bekreft at SG-Hub-flytting ikke skal beholde redirect fra gammel `/portal/mal/sg-hub`-sti.

---

# DEL 7 — Glemte/parkerte funksjoner inn i hoveddatastrømmen

> Komplett gjennomgang av de tidligere identifiserte glemte/parkerte funksjonene. Hver er verifisert mot dagens kode (status nå), klassifisert inn/ut, og koblet til en fase. **Ved tvil prioriteres eksklusjon** (jf. do-nots).

## Hva som er gjort
Verifisert dagens status i kode for de usikre postene (CoachHQ-sider, drill-fasilitet, coaching-watcher, SG-putt-branch, Gruppe C-branches). Flere «glemte» poster viste seg allerede bygget. Resultatet er klassifisert: **INN** i hoveddatastrømmen (akgolf-hq) vs. **EKSKLUDERT** (separate prosjekter + talent dashboard).

## Ekskludert (holdes utenfor — do-nots)
- **Talent dashboard / `golf-talent-dashboard`-migrering** — eksplisitt ekskludert.
- **In-platform talent-modul** (`TalentTracking`, `/portal/talent`, `/admin/talent`) — grensetilfelle; ekskluderes foreløpig under samme «talent»-paraply (eksklusjon prioriteres ved tvil). Reverseres hvis kun det eksterne dashboardet skulle holdes utenfor. `[FILL: bekreft]`
- **GFGK-app** (`/gfgk-app`) — separat prosjekt/repo.

## Inkludert — per komponent (hva · status nå · behandling)

### A. Allerede bygget (lukk/kvalitetssikre — ikke nybygg)
- **CoachHQ-arbeidsflater** (`/admin/planlegge`, `/admin/gjennomfore`, `/admin/analysere`) — *Hva:* coachens hub-sider, var stubs ved audit 24. mai. *Status nå:* bygget (167–180 linjer). *Behandling:* kvalitetssikre mot manifest i Fase 0.
- **Coaching auto-trigger** — *Hva:* auto-prosessering av opptak → transkripsjon → Notion + ak-second-brain. *Status nå:* `coaching-watcher.sh` + `com.akgolf.coaching-watcher.plist` finnes (deployet). *Behandling:* bekreft drift + koble til fast session-MAL (Fase 0).
- **Drill-fasilitet (datamodell)** — *Hva:* fasilitetsfilter for drills. *Status nå:* `DrillFasilitet`-enum + `tilgjengeligeFasiliteter[]` i schema. *Behandling:* koble filter-UI + verifiser kategoridekning på 833 drills (Fase 1).

### B. Parkert — krever handling
- **SG-putt-baseline-kalibrering** — *Hva:* feil putte-SG (forretningskritisk). *Status nå:* parkert på `fix/sg-putt-baseline` (lokal+remote, uflettet); test skippet på main. *Behandling:* rekalibrer mot Broadie, flett, reaktiver test (Fase 0 — kritisk).
- **Vault-kunnskap i AI-plan** — *Hva:* MORAD/AK-metodikk inn i plangenerator (`feat/vault-knowledge-tools`). *Status nå:* uflettet; prod-blokker (lokal filbane). *Behandling:* løs vault-kilde for prod, rebase, flett (Fase 1).
- **Self-service plan-generering** — *Hva:* fritekst→AI-plan fra PlayerHQ (`feat/sprint1-player-selfservice`). *Status nå:* uflettet. *Behandling:* re-koble mot Workbench/`portal/planlegge`, flett (Fase 1).
- **SG-overvåking + treningslogg/korrelasjon** — *Hva:* SG-fall-varsel + treningslogg + fremgang-dashboard (`feat/sprint2-plan-monitor`, `feat/sprint3-trening-sg`). *Status nå:* uflettet; DB-migrasjon `TrainingLog`. *Behandling:* slott inn migrasjon, flett; mater hybrid AI-lag (Fase 1).

### C. Delvis — fullfør
- **FYS-program: Coach-UI for maler** — *Hva:* trener-flate for fys-maler (25 tester/20 øvelser/12 maler finnes). *Status nå:* innhold bygget, coach-UI mangler. *Behandling:* bygg coach-forvaltning av fys-maler (Fase 1).
- **E-posttekster for kundelivsløpet** — *Hva:* transaksjonelle + CRM-triggede e-poster (`EmailTemplate`-modell finnes). *Status nå:* booking-e-post finnes; livsløp ufullstendig. *Behandling:* onboarding/booking → Fase 0; CRM/progresjon/winback → Fase 1.
- **Samarbeidsklubb-sider `/anlegg/[slug]`** — *Hva:* visuelle klubbsider (2 bilder + 3 highlights). *Status nå:* `/anlegg` markert «preview». *Behandling:* fullfør redesign (Fase 0/1 marketing). Avklar visuell vs. booking-variant.

### D. Preview → backlog
- **Reach/social + personvern** — *Hva:* synlighet/connections/feed. *Status nå:* hardkodet prototype. *Behandling:* ekte datamodell + personvern senere (backlog).
- **Helse/wellness-sporing** — *Hva:* søvn/skade/energi. *Status nå:* modell finnes, feature venter. *Behandling:* samles med Elite readiness/recovery (etter Elite Fase 2).

### E. Innhold (borderline)
- **Trenerutviklingsprogram (portal-dokument)** — *Hva:* konsolidere 8 HTML-filer (~17 600 l.) til ett portal-dokument (Academy-innhold). *Status nå:* løse filer utenfor plattformen. *Behandling:* inn som innholdsleveranse (Fase 2/backlog), ikke kjernedatastrøm.

## Konfliktlogg
- **Talent inn vs. ut:** «alt data skal inn» vs. «talent dashboard ut». Løst ved å prioritere eksklusjon: talent (dashboard + in-platform-modul) holdes utenfor, dokumentert over, reverserbart ved bekreftelse.
- **Anlegg-sider:** ny visuell variant (mai) vs. eksisterende booking-fokusert variant — avklares i Fase 0.
