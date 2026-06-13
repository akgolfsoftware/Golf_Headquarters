# AgencyOS — avviks-tabell (design-fasit vs. faktisk app)

> Laget 5. juni 2026. Sammenligner Claude Designs skjermliste-fasit
> (`AgencyOS - skjermliste og Workbench-oppsett.html`) mot hva appen faktisk gjør i koden i dag.
> Bruk denne mens du tar skjermopptak av coach-appen (`/admin`). Mørkt tema overalt.
>
> Tegn: ✗ = avvik (må fikses) · ⚠ = delvis · ✓ = stemmer.

---

## Det store bildet (les dette først)

Den gode nyheten: AgencyOS-menyen (sidebaren) ligger **nærmere** fasiten enn PlayerHQ — de 6
seksjonene (Oversikt · Stall · Planlegge · Gjennomføre · Innsikt · Admin) stemmer stort sett.
Den dårlige: kjernen — **at all planlegging skjer i ÉN Workbench** — er ikke på plass, de tre nye
flytene er halvferdige, og det ligger 134 sider med dobbeltadresser under.

| # | Hva designet sier | Hva appen gjør i dag | Alvor |
|---|---|---|---|
| 1 | Klikk spiller → rett inn i **Workbench** (ett trykk) | Klikk spiller → **profil-side**. Du må videre derfra for å planlegge | ✗ Stor |
| 2 | ÉN Workbench-master for all planlegging | **To rivaliserende Workbench-er** + 3 andre planleggings-sider per spiller | ✗ Stor |
| 3 | Fokus-spiller: manuell **pin** + 3 **AI-forslag** | Panel finnes, men pin + AI-forslag mangler | ⚠ Delvis |
| 4 | **Spiller↔gruppe-veksler** fast i toppen | Mangler helt | ✗ Stor |
| 5 | **Fellesmelding** fra Turneringer (velg→skriv→send) | UI finnes, men **Send-knappen sender ingenting** | ⚠ Delvis |
| 6 | «Ny plan»-wizard skal **fjernes** (gjøres i Workbench) | Wizarden lever fortsatt som egen side | ✗ Middels |
| 7 | Én adresse per funksjon | Mange dobbeltadresser lever parallelt | ✗ Middels |
| 8 | App-navn = **AgencyOS** | Gammelt navn **«CoachHQ»** står igjen 130+ steder i tekst | ✗ Liten |

---

## Seksjon 1 — OVERSIKT / Cockpit (`/admin/agencyos`)

**Designet sier:** Dashboard med dagens timeline, innboks-teller, stall-KPI, og to NYE ting:
(1) fokus-spiller-panel med manuell **pin** + 3 **AI-forslag** (haster / ubesvart / frafall-fare),
(2) en **spiller↔gruppe-veksler** fast i toppen.

**Appen har:** Cockpit i riktig 3-kolonne-form (timeline + innboks + «Trenger oppmerksomhet» + KPI) ✓.
Men de to nye tingene er ikke ferdige:

| Element | Skal være (design) | Faktisk i appen | Status |
|---|---|---|---|
| Fokus-panel | Pin øverst + 3 AI-forslag med begrunnelse | Enkel liste over spillere, ingen pin, ingen AI-forslag | ⚠ |
| «Workbench»-knapp fra fokus | Knapp rett inn i Workbench | Knappene går til booking/innboks/profil i stedet | ✗ |
| Spiller↔gruppe-veksler | Fast i toppen, med søk + nylig sett | Finnes ikke i toppen | ✗ |
| Antall dashboards | Ett (Cockpit) | Også `/admin/board` (videresender) og `/admin/queue` (egen oppfølgingskø) | ⚠ |

**Se etter i opptaket:** Står det en spiller/gruppe-bryter øverst på skjermen? Har fokus-panelet en «pin»?

---

## Seksjon 2 — STALL → WORKBENCH (det viktigste avviket)

**Designet sier:** Coachens viktigste arbeidsflyt. Klikk et spillernavn hvor som helst → **rett inn i
den spillerens Workbench**. Workbench er masteren for ALT: årsplan, treningsplan, fysplan, mål,
økt-planlegging, tildele drill/test. «Ny målsetning» lages KUN her.

**Appen har:** ✗ Dette er ikke på plass:

| Avvik | Detalj |
|---|---|
| ✗ Spiller-klikk → profil, ikke Workbench | Klikk i Stall går til `/admin/spillere/[id]` (profilside). Du må manuelt videre til Workbench |
| ✗ To rivaliserende Workbench-er | Det finnes en gammel («v10») på `/admin/spillere/[id]/workbench` OG en ny på `/admin/coach-workbench`. De er ikke slått sammen |
| ✗ Planlegging spredt på flere sider | I tillegg: egen teknisk-plan-side (`/admin/teknisk-plan/[id]`), plan-detalj (`/admin/spillere/[id]/plan/[planId]`) og global plan-side (`/admin/plans/[planId]`) — alle planlegger litt hver |
| ⚠ «Ny målsetning» kun i Workbench | Ikke bekreftet at mål lages der — uavklart |

**Dette er kjernen designeren ville rydde, og det er ikke gjort.** Planlegging bor minst 5 steder
i stedet for ett.

**Se etter i opptaket:** Klikk en spiller i Stall. Havner du i Workbench, eller på en profilside?

---

## Seksjon 3 — PLANLEGGE (planer, maler, drills) + wizards

**Designet sier:** Treningsplaner = oversikt. Plan-maler + Drill-bibliotek = byggeklosser som brukes
INN i Workbench. «Ny plan»-wizard og «Ny økt»-wizard skal **fjernes** — handlingen bor i Workbench.

**Appen har:**

| Avvik | Detalj |
|---|---|
| ✗ «Ny plan»-wizard lever | `/admin/plans/new` er en full 6-stegs wizard, og «Ny plan»-knappen går dit (ikke til Workbench) |
| ⚠ «Ny plan»-knapp på Planlegge-hub er død | Knappen finnes, men gjør ingenting (mangler lenke) |
| ✗ To «Ny mal»-sider | `/admin/plan-templates/ny` (ferdig skjema) og `/admin/plans/templates/ny` (placeholder, «kommer Q3»). Forvirrende |
| ✓ «Ny økt»-wizard finnes ikke som egen side | Bra — ingenting å fjerne der |
| ✓ plan-templates dobbeltadresse løst | `/admin/plan-templates` videresender allerede |

**Se etter i opptaket:** Trykk «Ny plan» i Planlegge — får du en wizard, eller Workbench?

---

## Seksjon 4 — GJENNOMFØRE (drift) + Fellesmelding

**Designet sier:** Kalender, Bookinger, Anlegg, Tilgjengelighet, Tjenester = drift (beholdes). Ny
booking som wizard er OK. NY flyt: **Fellesmelding** fra Turneringer (velg turnering → deltakere →
skriv + AI → kanaler → send → bekreftelse).

**Appen har:**

| Element | Status | Detalj |
|---|---|---|
| Fellesmelding-UI | ⚠ | Modalen finnes på Turneringer (mottakere + tekst), men **Send-knappen lukker bare vinduet — ingenting sendes** |
| Turneringer | ✓ | Oversikt + ny + detalj + en smart «dubletter»-sammenslåing. Bra |
| Bookinger | ✓ | 5-stegs ny-booking-wizard. OK per design |
| Kalender | ✗ | Dobbeltadresse: BÅDE `/admin/calendar` (eldre) OG `/admin/kalender` (ny v10) lever parallelt |

**Se etter i opptaket:** Åpne Fellesmelding på en turnering, trykk Send — skjer det noe?

---

## Seksjon 5 — DOBBELTADRESSER (rydd til én av hver)

Appen har flere adresser for samme funksjon. Noen er ufarlige (videresender allerede), andre er to
ekte sider som lever side om side og må ryddes:

| Funksjon | Adresser i appen | Status |
|---|---|---|
| Godkjenninger | `/admin/approvals` + `/admin/godkjenninger` | ✓ Alias (peker videre) |
| Plan-maler | `/admin/plans/templates` + `/admin/plan-templates` | ✓ Alias |
| **Kalender** | `/admin/calendar` + `/admin/kalender` | ✗ To ekte sider |
| **Økonomi** | `/admin/finance` + `/admin/agencyos/okonomi` | ✗ To ekte sider |
| **Innboks** | `/admin/innboks` + `/admin/messages` + `/admin/foresporsler` | ✗ Tre sider (delvis ulik bruk) |
| **Spillere/Stall** | `/admin/spillere` + `/admin/agencyos/spillere` + `/admin/stall` | ✗ Tre visninger |
| **Analyse** | `/admin/analyse` + `/admin/analysere` + `/admin/analytics` | ✗ Tre visninger |
| **Dashboard** | `/admin/agencyos` + `/admin/board` + `/admin/queue` | ⚠ Board videresender; queue er egen |

> Merk: noen av disse «duplikatene» har litt ulik funksjon i dag (f.eks. innboks vs. forespørsler).
> Vi avgjør per par hva som beholdes når vi rydder — ikke bare slette blindt.

---

## Seksjon 6 — Tema + gammelt navn

| Funn | Detalj | Status |
|---|---|---|
| «CoachHQ»-tekst | Gammelt navn står igjen 130+ steder (eyebrow-tekst på analyse, stall, godkjenninger m.fl.) | ✗ Skal være «AgencyOS» |
| Lyse flater | Noen få: e-postmal-editor og en innebygd godkjenn-portal-ramme er hvite | ⚠ Bør mørklegges |
| Workbench-tema | Designeren spurte: skal coachens Workbench være lys (cream) eller mørk? | ⚠ **Din beslutning** |

---

## Hva skjer videre

1. Du tar skjermopptak av AgencyOS og går gjennom de 6 seksjonene med denne ved siden av.
2. Bekreft/korriger — særlig: spiller-klikk → Workbench, fokus-pin+AI, veksler, fellesmelding.
3. Jeg lager en samlet bygge-plan for begge apper, i rekkefølge: nav-struktur først, så de tre nye
   flytene, så dobbeltadresser + CoachHQ-rydding.
4. To beslutninger jeg trenger fra deg: **(a)** skal coach-Workbench være lys eller mørk?
   **(b)** hvilken av de to Workbench-ene beholder vi (gammel v10 vs. ny)?
