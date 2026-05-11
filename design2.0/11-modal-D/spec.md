# Mini-batch modal-D - Round / Stats / Agent

**6 modaler i denne mini-batchen.** Felles moenster: Modaler som handler om
runde-data, statistikk, TrackMan-import og agent-handlinger. Spenner over
PlayerHQ (spiller analyserer) og CoachHQ (coach godkjenner i bulk).

**Generer alle 6 modaler i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` - EEN produksjons-modal per HTML.

---

## Felles for modal-D

- **Modal-container:** Sentrert, max-width 560-880px, `rounded-xl`, bakdrop blur(4px)
- **Header:** Italic tittel + sub + lukk-X
- **Footer:** Avbryt venstre, primary CTA hoeyre (accent lime)
- **Spiller:** Markus Roinaas Pedersen, HCP 12,4
- **Coach:** Anders Kristiansen
- **Bane-eksempler:** GFGK (par 71), Borre Golfklubb (par 71, beste 74), Bossum
- **Pyramide-farger:** FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`
- **Lower-is-better:** Score, putt-snitt, HCP - nedgang = success-groenn
- **Higher-is-better:** SG, carry, ball-speed, antall oekter - oppgang = success-groenn

---

## Pakker i denne mini-batchen

---

## Pakke 1/6: RoundDetailModal

# AK Golf Platform - Modal - RoundDetailModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Klikk paa runde-rad i runde-liste eller dashboard-card
- **Type:** Detalj-modal med tabs
- **Bredde:** 880px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/round-detail.html`

## Spec

Markus ser komplett runde-data: hull-for-hull score, fairways/greens/putts,
SG-breakdown og notater. Mulig aa eksportere eller dele.

## Layout

- **Header:** Italic "Borre - 1. mai 2026" + sub "74 (-1) - 18 hull - 4t 12m" + lukk-X
- **Hero-stats-rad:** 4 mini-stat-cards
  - "Score: 74 (-1)" (gold accent, hoyere er bedre tjener gold)
  - "Putts: 28" (lower-is-better, success-groenn fordi <30)
  - "FIR: 11/14"
  - "GIR: 13/18"
- **Tabs (4):** `Scorekort` (default) - `SG-breakdown` - `Notater` - `Bilder`
- **Scorekort-tab:**
  - Hull-for-hull tabell (18 rader): Hull-nr - Par - Score - +/- - FIR - GIR - Putts
  - Fargekoding: Eagle gold-bg, Birdie accent-bg, Par naturlig, Bogey light-amber, Double+ light-red
  - Subtotaler etter 9 hull og 18 hull (uthevet, JetBrains Mono)
- **SG-breakdown-tab:**
  - Bar-chart: SG: Off-tee +0,8 - SG: Approach -0,4 - SG: Around-green +0,2 - SG: Putting +1,1 (totalt SG +1,7)
- **Notater-tab:**
  - Textarea (read-only): "Putte bra, men slet med driver fairway 7 og 12. Vind fra venstre paa back nine."
  - Edit-knapp toggler til redigerbar
- **Bilder-tab:**
  - Grid 3x2 placeholder bilder + opplastknapp
- **Footer:** `Eksporter PDF` (sekundaer, Lucide `Download`) + `Send til Anders ->` (primary accent)

## OEnsket output

1. Lyst tema default (Scorekort-tab)
2. Lyst tema SG-tab aktiv
3. Lyst tema Notater-tab i edit-modus
4. Moerkt tema
5. Loading (skeleton tabell)
6. Mobile full-screen (tabs scrollbar)

## Anti-moenster

- IKKE bare totalscore - hull-for-hull er kjerne-data
- IKKE skjul SG-data bak Pro-lock paa Detail (det er paa egen leaderboard-skjerm)
- IKKE Lorem ipsum-notater - bruk konkret golf-tekst

---

## Pakke 2/6: RoundInsightModal

# AK Golf Platform - Modal - RoundInsightModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Innsikt"-CTA paa runde-detalj eller agent-card "Ny innsikt fra Anders"
- **Type:** Single-modal med agent-analyse
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/round-insight.html`

## Spec

Etter en runde har Insight-agenten (eller Anders manuelt) generert en kort
analyse av hva som gikk bra/daarlig + anbefaling for neste oekt. Markus
leser, godkjenner eller ber om utdyping fra Anders.

## Layout

- **Header:** Lucide `Sparkles` (accent) + italic "Innsikt fra runden" + sub "Borre - 1. mai 2026 - 74 (-1)" + lukk-X
- **Body - 3 seksjoner:**
  1. **Hva gikk bra:** Lucide `TrendingUp` (success) + tekst
     - *"Putting var sterkeste del - 28 putts, SG +1,1. Spesielt godt paa breaks fra venstre."*
     - Mini-stat-rad: "+1,1 SG putting", "8 av 10 single-putts"
  2. **Hva kan bli bedre:** Lucide `Target` (warning amber) + tekst
     - *"Driver-konsistens svinger - 79% FIR foerste 9 vs 64% siste 9. Maa jobbe med tempo paa lange hull."*
     - Mini-stat-rad: "Hull 7: drive 230m off-line", "Hull 12: drive 200m off-line"
  3. **Anbefaling for neste oekt:** Lucide `Compass` (primary) + tekst
     - *"Foreslaar 30 min driver-tempo i blokk 2 av neste TEK-oekt. Bruk Mevo for kalibrering."*
     - CTA-inline: `Bok TEK-oekt -> ` (lime accent link)
- **Footer:** `Avbryt` venstre + `Be Anders utdype ->` (sekundaer) + `Godkjenn anbefaling ->` (primary accent) hoeyre

## OEnsket output

1. Lyst tema default
2. Lyst tema "Be Anders utdype" mini-form aapen (textarea + send)
3. Lyst tema success (godkjent - "Lagt til neste TEK-oekt")
4. Moerkt tema
5. Loading initial (skeleton)
6. Mobile full-screen

## Anti-moenster

- IKKE bare hyggelig tekst uten data - hver seksjon skal ha mini-stat
- IKKE skjul agent-source (det er klart at dette er fra Insight-agent)
- IKKE harde tall uten kontekst - bruk konkrete hull-eksempler

---

## Pakke 3/6: TrackManImportModal (NY)

# AK Golf Platform - Modal - TrackManImportModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Importer fra TrackMan"-CTA paa /portal/trackman-analyse
- **Type:** 3-step wizard
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/trackman-import.html`

## Spec

Markus importerer TrackMan-data fra siste session - enten via CSV-fil eller
screenshot (OCR). 3-step: velg metode -> last opp -> verifiser data.

## Layout

- **Header:** Italic "Importer TrackMan-data" + sub "Steg {n} av 3" + lukk-X
- **Steg-indikator:** 3 prikker
- **Steg 1 - Velg metode:**
  - 2 store cards side-om-side:
    - **CSV-opplasting** (Lucide `FileSpreadsheet` 48px) - "Last opp .csv eksportert fra TrackMan Performance Studio"
    - **Screenshot OCR** (Lucide `Image` 48px) - "Last opp screenshot av session-summary - vi henter ut data automatisk"
  - Klikk velger metode (accent-border + sjekk)
- **Steg 2 - Last opp:**
  - **CSV-modus:** Drag-drop-zone (full bredde, dashed border)
    - "Slipp .csv her, eller klikk for aa velge"
    - Naar lastet: filnavn + filstoerrelse + sjekk-ikon
  - **OCR-modus:** Drag-drop for bilde
    - Preview av opplastet bilde
    - "Analyserer ..." (5 sek loading m/ spinner)
- **Steg 3 - Verifiser:**
  - Ekstraherte data i redigerbar tabell:
    - Kolle | Carry | Total | Ball-speed | Spin | Launch
    - 14 koeller-rader, redigerbar
  - Info-tekst: "Sjekk at dataene stemmer foer du importerer. Korrigeringer lagres."
  - Confidence-pill paa OCR-modus per rad: "98%" / "87%" osv (lavt confidence = warning amber)
- **Footer:**
  - Steg 1-2: `Avbryt` + `Neste ->` (accent, disabled til opplasting fullfoert)
  - Steg 3: `Avbryt` + `<- Tilbake` + `Importer (14 koeller) ->` (accent)

## OEnsket output

1. Steg 1 lyst tema (2 cards, CSV valgt)
2. Steg 2 CSV-modus med fil opplastet
3. Steg 2 OCR-modus med bilde + spinner
4. Steg 3 lyst tema (verifiser-tabell, alle koeller)
5. Steg 3 OCR med lav-confidence-rader markert
6. Moerkt tema (steg 2)
7. Error-state (fil ikke gyldig - "Kunne ikke lese .csv - sjekk format")
8. Mobile full-screen (steg 3 tabell scrollbar)

## Anti-moenster

- IKKE bare et fil-input - drag-drop med visuell zone er kjerne
- IKKE skip verifiser-steget - OCR har feil
- IKKE skjul confidence-score
- IKKE Lorem ipsum-koeller - bruk konkrete (Driver, 3-wood, 4-iron osv)

---

## Pakke 4/6: ComparisonModal

# AK Golf Platform - Modal - ComparisonModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Sammenlign"-CTA paa runde-liste, TrackMan-analyse, test-detalj
- **Type:** Side-by-side compare-modal
- **Bredde:** 880px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/comparison.html`

## Spec

Sammenlign 2 datasett - to runder, to TrackMan-sessions, to tester. Velger
hva som skal sammenlignes i toppen, viser side-by-side data + diff-kolonne.

## Layout

- **Header:** Italic "Sammenlign" + sub "Velg datasett aa sammenligne" + lukk-X
- **Velger-rad:** 2 dropdown-felter side-om-side: "Foer: [Borre 1. mai 74 v]" - "Etter: [GFGK 8. mai 76 v]"
- **Body - sammenligning-tabell:**
  - Kolonner: Metrikk - Foer - Etter - Diff (+/- og %)
  - Rader (eksempel runde-sammenligning):
    - Total score: 74 vs 76 (+2, +2,7%)
    - Putts: 28 vs 31 (+3 PUR, daarlig)
    - FIR: 11/14 vs 9/14 (-2)
    - GIR: 13/18 vs 11/18 (-2)
    - SG Putting: +1,1 vs -0,3 (-1,4)
    - SG Approach: -0,4 vs +0,8 (+1,2)
  - Diff-kolonne fargekodet:
    - Lower-is-better metric forbedring (negativ diff) = success-groenn
    - Higher-is-better metric forbedring (positiv diff) = success-groenn
    - Motsatt = danger-roed
- **Mini-graf nederst:** SG-sammenligning som radar-chart (2 polygoner overlaid)
- **Footer:** `Lukk` venstre + `Send til Anders ->` (primary accent) hoeyre

## OEnsket output

1. Lyst tema default (runde-sammenligning)
2. Lyst tema TrackMan-sammenligning (Driver-data)
3. Lyst tema test-sammenligning (NGF-test)
4. Moerkt tema
5. Loading (skeleton tabell)
6. Mobile (tabell scrollbar)

## Anti-moenster

- IKKE skjul diff-tegnet (+/-) - alltid synlig
- IKKE bare graa diff-kolonne - fargekoding er kritisk
- IKKE 3+ sammenlignings-datasett (det er bulk-analyse, ikke compare)

---

## Pakke 5/6: BulkApproveModal

# AK Golf Platform - Modal - BulkApproveModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** "Aksepter alle (N)"-knapp i Approvals-bulk-mode (>=1 valgt)
- **Type:** Confirm-modal med liste + valgfri merknad
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/bulk-approve.html`

## Spec

Anders har valgt 5 agent-anbefalinger og vil godkjenne alle. Modal viser
sammendrag av valgte + lar ham legge til en felles merknad (valgfri).

## Layout

- **Header:** Italic "Godkjenn 5 anbefalinger" + sub "Sender til 5 spillere" + lukk-X
- **Body - 2 seksjoner:**
  1. **Liste over valgte (5 rader):**
     - Severity-pill + spiller-avatar + spiller-navn + action-tittel + agent-badge
     - Eksempel: "Warning - Markus R Pedersen - Pauseuke anbefalt - Deload-agent"
     - Klikk paa rad ekspanderer detaljer inline (Lucide chevron)
  2. **Felles merknad (valgfri):**
     - Textarea "Vil du legge til en merknad som sendes til alle? (valgfri)"
     - Tegn-teller: 0/280
- **Info-blokk nederst:** "5 spillere faar varsel umiddelbart. Du kan ikke angre etter aa ha bekreftet."
- **Footer:** `Avbryt` venstre + `Godkjenn alle (5) ->` (primary accent) hoeyre

## OEnsket output

1. Lyst tema default (5 valgte synlige)
2. En rad ekspandert (viser action-detalj inline)
3. Med felles-merknad fylt ut
4. Loading ("Godkjenner 5 ...")
5. Success (toast "5 godkjent - varsel sendt" + lukker modal)
6. Moerkt tema
7. Partial failure (4 av 5 godkjent, en feilet - viser inline error)
8. Mobile full-screen

## Anti-moenster

- IKKE skjul listen - coach maa kunne dobbeltsjekke
- IKKE krav om merknad (skal vaere valgfri)
- IKKE multi-step (bulk er rask aksjon, ikke wizard)

---

## Pakke 6/6: AgentFeedbackModal (NY)

# AK Golf Platform - Modal - AgentFeedbackModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** "Send agent-feedback ->" i Approvals topp-bar / etter aa ha godkjent/avvist en anbefaling
- **Type:** Single-step feedback-form
- **Bredde:** 640px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/agent-feedback.html`

## Spec

Anders gir feedback til agent etter aksjon (godkjent/avvist) saa agenten kan
laere. Form med aarsak + valgfri fri-tekst + submit -> bekreftelse.

## Layout

- **Header:** Lucide `MessageSquare` + italic "Tilbakemelding til agent" + sub "Hjelper agenten bli bedre" + lukk-X
- **Body:**
  - **Kontekst-card:** Hva ble gjort - "Avviste: Pauseuke anbefalt for Markus R Pedersen (Deload-agent)" + tidsstempel
  - **Hvorfor avviste du? (radio-knapper):**
    - "For aggressiv anbefaling"
    - "Feil timing"
    - "Ikke relevant for spilleren"
    - "Manglet kontekst"
    - "Annet"
  - **Detaljer (valgfri textarea):**
    - "Beskriv hva som var galt og hva som ville vaere bedre. Max 500 tegn."
    - Tegn-teller: 0/500
  - **Forbedre-toggle:** Sjekkboks "Lar agenten bruke denne feedbacken til aa forbedre fremtidige anbefalinger" (default paa)
- **Footer:** `Avbryt` venstre + `Send tilbakemelding ->` (primary accent) hoeyre

## OEnsket output

1. Lyst tema default (etter aa ha avvist en anbefaling)
2. Lyst tema variant for "Godkjent men kunne vaert bedre" (annet sett radio-knapper: "Korrekt men kunne presenteres bedre", "OK men forventet hoyere konfidens", osv)
3. Med "Annet" valgt + textarea fylt
4. Loading ("Sender ...")
5. Success (toast "Takk - agenten laerer av dette" + lukker)
6. Moerkt tema
7. Mobile full-screen

## Anti-moenster

- IKKE bare fri-tekst - radio-knapper gir struktur agenten kan parse
- IKKE skjul hva som ble gjort (kontekst-card oeverst)
- IKKE flere steg - skal vaere rask (under 30 sek)
