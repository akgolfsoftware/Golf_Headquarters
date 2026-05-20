# Mini-batch playerhq-C - Wizards + kalender

**5 skjermer i denne mini-batchen.** Felles moenster: PlayerHQ-flytene hvor
Markus aktivt planlegger eller dokumenterer trening. Ny-oekt-wizard (6 steg),
OEnskeligOekt (single form til coach), Coach-melding-compose (rik form),
Tren-kalender (visuell uke-oversikt), og Treningsdetalj (post-oekt review).
Tier-gating styrer kvota (3 oekter/mnd Free), Pro-features (maaned-view, ical).

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups. Wizard-steg leveres som SEPARATE HTML-filer per steg.

---

## Felles for PlayerHQ-skjermer

- **Sidebar:** LYS, 220px (#FFFFFF), enkelt-lag. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI moerk rail som i CoachHQ.
- **Wizard-form-bredde:** sentrert i hoved-content, max-width 720px (Ny-oekt + OEnskeligOekt) eller 800px (Coach-melding for plass til vedlegg-preview).
- **Steg-indikator (wizard):** dots, ikke numbers. PlayerHQ er mer "lekent" enn CoachHQ.
- **Pyramide-farger:** FYS groenn `#16A34A`, TEK darker primary `#005840`, SLAG lime accent `#D1F843`, SPILL gold `#F4C430`, TURN graa `#5E5C57`.
- **Event-farger (kalender):** Coaching=lime accent + pyramide-stripe, Selvtrening=border-only dashed + pyramide-stripe, Gruppe=primary fylt med Users-ikon, Runde=gold med Flag-ikon, Turnering=secondary full bredde, Fysio=muted med Heart-ikon.
- **Status-prikk paa kalender-blokk:** Planlagt=accent, Gjennomfoert=success-groenn, Hoppet over=destructive, Forsinket=gold.
- **Tier-gating:** Free 3 oekter/mnd (Ny-oekt), 1 forespoersel/mnd (OEnskeligOekt), 5 meldinger/mnd (Coach-melding). Pro = ubegrenset. Elite = automatisk live-coach-tilbud, ubegrenset meldinger.
- **Coach-status:** Anders K avatar med groenn online-prikk eller muted offline med "Sist sett: ..."-tekst.

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: Ny økt-wizard (6 steg)

# AK Golf Platform — PlayerHQ — Ny økt-wizard

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/min/okt/ny`
- **Arketype:** D — Wizard / Form (6-step økt-wizard)
- **Tier-gating:** Free får 3 økter/mnd. Pro+ ubegrenset. Elite får automatisk live-coach-tilbud.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/ny-okt-wizard.html`
- **Audit:** `wireframe/audit/playerhq-ny-okt-wizard.md`
- **Tilhørende skjermer:** Tren-kalender (batch 6), Live Session (batch 5)
- **Tilhørende modaler:** BookingConfirmationModal (pakke 18) hvis økten krever fasilitet

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar venstre (én-lags, lys). Wizard sentrert i hoved-content (max-width 720px). **Steg-indikator (dots, ikke numbers)** — PlayerHQ er mer "lekent" enn CoachHQ.

## Spec — hva skjermen er for

Markus vil legge til en egendefinert økt utenfor coach-planen — typisk fordi han har en luke i kalenderen, eller fordi han har en spesifikk del han vil jobbe med. 6 steg fra mål → fasilitet → øvelser → bekreft. Hvis fasiliteten krever booking, åpner BookingConfirmationModal (pakke 18) etter steg 6. Forskjellig fra OnskeligOkt (pakke 10): denne er for økter Markus gjør selv; OnskeligOkt er for å be coach om en planlagt økt.

## Layout — UNIKT for denne skjermen

PlayerHQ-sidebar venstre. Hoved-content sentrert.

### Steg-indikator (dots, sticky 56px topp)

6 dots: ● — ● — ● — ○ — ○ — ○ med tekst under "Steg 3 av 6 · Velg fasilitet"

### Steg 1 — Hva skal du trene?

3 store kategori-kort:
- **Fokusert** — "Jobbe med én ting (TEK / SLAG / SPILL / PUTT)"
- **Komplett økt** — "Hele runden gjennom alle fokusområder"
- **Lek og lær** — "Drills, utfordringer, leaderboard"

Etter valg: subtype-velger (eks. for "Fokusert": 4 chips TEK / SLAG / SPILL / PUTT)

### Steg 2 — Lengde og intensitet

- **Varighet:** segmentert kontroll — "30 min / 60 min / 90 min / 120 min"
- **Intensitet:** slider 1–5 (Lett → Hard) med beskrivelse under
- **Estimat-kort:** "60 min · medium intensitet · ~280 svinger"

### Steg 3 — Velg fasilitet

- **Toggle:** "Mine vanlige" / "Søk alle"
- **Mine vanlige:** liste over fasiliteter Markus har brukt før (Mulligan Studio 1, GFGK Range, Bossum)
- **Søk alle:** søkefelt + kart-thumbnail + liste m/ avstand
- **"Hjemme/Egen tid":** alternativ uten fasilitet (hage, garasje, tom dag)
- Per fasilitet: ledig tid-strip nederst (i dag, kommende 3 dager) — klikkbar

### Steg 4 — Tid

- **Dato:** dato-velger (default i dag)
- **Klokkeslett:** time-picker (15-min interval)
- Ledig-status vises live for valgt fasilitet: "Ledig" (accent) / "Opptatt" (destructive)
- Hvis opptatt: forslag for nærmeste ledige tider (3 chips)

### Steg 5 — Øvelser (fra bibliotek + foreslåtte)

- **Auto-foreslått fra Coach-plan:** 4 øvelser hentet fra Markus' aktive plan som matcher fokus
- **Legg til fra bibliotek:** søke-felt → grid med øvelser (samme komponent som /min/ovelser, batch 2)
- Per øvelse i listen: drag-handle + tittel + varighet + "✕" fjern
- Sum: "5 øvelser · 58 min" + warning hvis varighet >valgt total

### Steg 6 — Bekreft og start

Sammendrags-card:
- Type + fokus
- Fasilitet + tid (eller "Hjemme")
- 5 øvelser (mini-liste)
- Sjekkbokser:
  - "Del med coach Anders K. (anbefalt)" (default ✓)
  - "Sett påminnelse 30 min før" (default ✓)
  - "Logg automatisk i tren-kalender" (default ✓)

CTA-knapper (footer):
- `Lagre som planlagt` (sekundær)
- `Start nå →` (primary, accent — kun synlig hvis tid = nå/innen 15 min)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake |
| Kategori-kort (steg 1) | default, hover (lift), valgt |
| Subtype-chip | uvalgt, valgt, hover |
| Varighet-segmentert | default, hover, valgt |
| Intensitet-slider | default, dragging, fokus |
| Fasilitet-toggle (Mine/Alle) | default, aktiv |
| Fasilitet-rad | default, hover, valgt (accent ring), opptatt (dempet) |
| Ledig-tid-chip | default, hover, klikk → setter tid + går til steg 4 |
| Dato-velger | default, open kalender |
| Tid-stepper | default, hover, valgt |
| Øvelse-rad | default, hover (drag-handle synlig), drag-active |
| `+ Legg til øvelse`-link | default, hover, klikk → bibliotek-overlay |
| Sjekkbokser | uvalgt, valgt, focus |
| `Lagre som planlagt` | default, hover, focus, loading |
| `Start nå →` | default, hover, active, accent-pill, loading ("Starter live …") |

## Empty / loading / error / success-states

- **Steg 3 ingen fasiliteter:** "Du har ikke brukt noen fasilitet før. [Søk alle →]"
- **Steg 4 opptatt:** Inline warning + 3 forslag-chips
- **Steg 5 sum-warning:** "Øvelsene tar 78 min, men du valgte 60 min — Forleng eller fjern øvelser?"
- **Submit "Lagre som planlagt" loading:** Spinner i CTA, "Lagrer …"
- **Submit "Start nå" loading:** Full-screen "Starter live-økt …" → redirect til /min/live
- **Booking-confirmation:** BookingConfirmationModal (pakke 18) åpnes hvis fasilitet krever betaling
- **Tier-gating:** Free + 3 økter brukt denne mnd → blokk på steg 1: "Du har brukt 3 av 3 free-økter denne mnd. [Oppgrader →]"

## Mobile (≤640px)

Sidebar kollapser til hamburger. Wizard tar full bredde. Steg-indikator komprimerer. Fasilitet-rad blir kort med kart-thumbnail øverst. Footer-knapper stables.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (3 kategori-kort, "Fokusert" hover)
2. Steg 2 lyst tema (60 min, intensitet 3)
3. Steg 3 lyst tema (Mine vanlige, 3 fasiliteter + ledig-tid-strip)
4. Steg 4 lyst tema, opptatt-warning + 3 forslag
5. Steg 5 lyst tema (5 øvelser + sum)
6. Steg 6 lyst tema (sammendrag + CTA-er)
7. Tier-gating Free-blokk
8. Mørkt tema (steg 3)
9. Mobil ≤640px (steg 1)

## Ikke-mål

- Ikke designe BookingConfirmationModal (pakke 18)
- Ikke designe Live Session (batch 5)
- Ikke designe Tren-kalender (batch 6)
- Ikke designe OnskeligOkt — be om økt fra coach (pakke 10)

---

## Pakke 2/5: OnskeligOkt (single form)

# AK Golf Platform — PlayerHQ — Be om økt (OnskeligOkt)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/min/onskeligokt`
- **Arketype:** D — Wizard / Form (single form med rik inputs)
- **Tier-gating:** Free får 1 forespørsel/mnd. Pro får 4. Elite ubegrenset.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/onskeligokt.html`
- **Audit:** `wireframe/audit/playerhq-onskeligokt.md`
- **Tilhørende skjermer:** Coach-detalj (batch 3), Coach-meldinger (pakke 11)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar venstre. Form sentrert (max-width 720px). Single form — ingen multi-step, men generøs spacing og tydelige seksjoner.

## Spec — hva skjermen er for

Markus vil be coachen Anders om en planlagt 1:1-økt. Forskjellig fra ny-økt-wizard (pakke 9) som er for økter Markus gjør selv. Her sender Markus et forslag til Anders som så kan godkjenne, avslå eller foreslå alternativ tid. Skjermen er en form med 5 seksjoner: hva, hvorfor, ønsket tid, fasilitet, melding.

## Layout — UNIKT for denne skjermen

PlayerHQ-sidebar venstre. Hoved-content sentrert.

### Hero-strip (96px)

- Tittel italic Instrument Serif 32px: *"Be om økt med Anders"*
- Sub: "Anders svarer typisk innen 4 timer på hverdager"
- Coach-info-pill høyre: avatar (32px) + "Anders K. — Hovedcoach" + status-prikk ("Online" accent / "Borte" muted)

### Form-seksjoner (vertikal stack med visuelle skiller)

**Seksjon 1 — Type økt:**
- Radio-kort:
  - "1:1 Coaching (60 min)" — standard
  - "Mini-økt (30 min)" — for spesifikt tema
  - "Range-besøk sammen" (90 min) — Anders observerer
  - "Spille runde sammen" (4 timer) — kun synlig for Pro+

**Seksjon 2 — Hva vil du jobbe med?**
- Multi-select chips: TEK / SLAG / SPILL / PUTT / FYS / Mental / Turneringsforberedelse / Annet
- Tekstboks (valgfritt): "Beskriv mer hvis du vil … (eks. 'Jeg sliter med høyre-misser fra 100m')" — placeholder

**Seksjon 3 — Når passer det best?**
- 3 dato-tid-felter (du foreslår 1–3 alternativ): "Alternativ 1" / "Alternativ 2" / "Alternativ 3"
- Hver: dato-velger + tid-stepper
- "+ Legg til alternativ"-link (max 3)
- "Helt fleksibel"-sjekkboks → skjuler dato-felt og sender beskjed med åpen tid

**Seksjon 4 — Fasilitet:**
- Radio:
  - "Mulligan Studio (din vanlige)" — default
  - "GFGK Range"
  - "Bossum"
  - "Du velger"
  - "Online video-økt"

**Seksjon 5 — Melding til Anders (valgfritt):**
- Tekstboks (5 rader): "Skriv en kort melding hvis du vil … "
- Tegn-teller nederst-høyre (max 500)

**Footer (sticky):**
- Venstre: `Avbryt`
- Høyre: `Send forespørsel →` (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| Type-kort radio | uvalgt, hover (lift), valgt (accent border + ring) |
| Pro-only-kort (runde sammen) | dempet for Free + tooltip "Krever Pro" |
| Tema-chips (multi) | uvalgt, hover, valgt (accent bg) |
| Tekstboks (valgfritt) | default, focus, with-text, max-length-warning |
| Dato-velger | default, open kalender, valgt |
| Tid-stepper | default, hover, valgt |
| "+ Legg til alternativ" | default, hover, focus, disabled (3 alt allerede) |
| Helt-fleksibel-checkbox | uvalgt, valgt, focus |
| Fasilitet-radio | uvalgt, valgt, hover |
| Melding-tekstboks | default, focus, tegn-teller (rød ved >450) |
| `Send forespørsel →`-CTA | default, hover, disabled (validering feil), loading ("Sender …"), success-flash |
| `Avbryt`-knapp | default, hover, klikk → confirm hvis endringer |

## Empty / loading / error / success-states

- **Idle:** Default valg (1:1 60 min, Mulligan Studio), ingen alternativ-tider valgt
- **Validering:** Krav minst 1 alternativ tid (med mindre "Helt fleksibel" er valgt) + minst 1 tema-chip
- **Submit loading:** CTA spinner, "Sender til Anders …"
- **Submit success:** Full-screen confirmation: stort `Send`-ikon (accent), "Forespørsel sendt", subtekst "Anders svarer typisk innen 4 timer. Du får varsel her og på e-post." + CTA `Til oversikten →`
- **Submit error:** Toast: "Kunne ikke sende. Prøv igjen."
- **Tier-gating:** Free + 1 forespørsel brukt → blokk øverst i form: "Du har brukt 1 av 1 free-forespørsler denne mnd. [Oppgrader til Pro →]"
- **Coach offline:** Sub i hero endres til "Anders er borte til {dato}. Du kan fortsatt sende forespørsel — han svarer ved retur."

## Mobile (≤640px)

Sidebar hamburger. Hero-strip kollapser, coach-info-pill går under tittel. Type-kort stables. Dato-tid-felter stables vertikalt.

## Ønsket output fra Claude Design

1. Lyst tema, idle (default valg)
2. Lyst tema, mid-fyllt (1:1, 2 tema-chips, 2 alternativ-tider)
3. Lyst tema, "Helt fleksibel" valgt (dato-felt skjult)
4. Lyst tema, submit-loading
5. Lyst tema, submit success ("Forespørsel sendt")
6. Lyst tema, tier-gating Free-blokk
7. Mørkt tema
8. Mobil ≤640px

## Ikke-mål

- Ikke designe Coach-detalj-skjerm hvor man finner coach (batch 3)
- Ikke designe Coach-meldinger compose (pakke 11)
- Ikke designe coach-side hvor han svarer på forespørselen (egen pakke i CoachHQ)
- Ikke designe Ny-økt-wizard for selvtrening (pakke 9)

---

## Pakke 3/5: Coach-melding compose

# AK Golf Platform — PlayerHQ — Coach-melding (compose)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/min/coach/melding/ny` (eller modal i `/min/coach/:id`)
- **Arketype:** D — Wizard / Form (single send-form med rik content)
- **Tier-gating:** Free får 5 meldinger/mnd. Pro+ ubegrenset.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-message-compose.html`
- **Audit:** `wireframe/audit/playerhq-coach-message-compose.md`
- **Tilhørende skjermer:** Coach-meldinger-tråd (batch 3 / batch 6), Coach-detalj (batch 3)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar venstre. Form sentrert (max-width 800px) — bredere enn andre forms for å gi plass til preview av vedlegg. **Inkluderes i batch 4 som send-form-arketype** (kan også brukes som referanse for relaterte send-forms). Maks 3 lime per skjerm.

## Spec — hva skjermen er for

Markus vil sende en melding til coach Anders med tekst, evt. video-klipp, screenshot fra TrackMan, eller spørsmål om en spesifikk plan. Forskjellig fra OnskeligOkt (pakke 10) som er strukturert forespørsel — denne er fri-form chat-init. Etter send opprettes en tråd som vises i Coach-meldinger-tråd (batch 3).

## Layout — UNIKT for denne skjermen

PlayerHQ-sidebar venstre. Hoved-content sentrert.

### Hero-strip (80px)

- "← Tilbake"-link venstre
- Sentrert: "Ny melding til **Anders K.**" + avatar (24px)
- Status-prikk høyre: "Online" (accent) / "Borte" (muted) + "Svarer typisk innen 4t"

### Form-body

**Mottaker-info-bar (sticky øverst i form, 56px):**
- Avatar (40px) + navn + rolle + status-prikk
- Klikkbar → åpner Coach-detalj (batch 3)

**Emne (valgfritt):**
- Tekstfelt: "Emne (valgfritt)" — placeholder
- Hjelpe-tekst under: "Hjelper Anders prioritere — kan stå tom"

**Hovedinnhold (rik tekstboks):**
- Min-høyde 200px, auto-grow
- Toolbar over: **B** _I_ liste-bullet · liste-num · `link` · `code` · `image` · `video` · `paperclip`
- Placeholder: "Skriv meldingen din … (du kan dra-og-slippe filer hit også)"
- Inline emoji-picker (`Smile`-ikon i toolbar)

**Vedlegg-strip (under tekstboks, vises ved drag-drop eller via toolbar):**
- Hver vedlegg som chip:
  - Tumbnail (50×50px hvis bilde/video) eller fil-ikon
  - Filnavn + størrelse
  - Lukk-X
- Drag-drop område synlig ved hover på toolbar-paperclip

**Konteksts-koblinger (valgfritt):**
- "Koble til:" expandable seksjon
  - Klikkbart: "Koble til en plan-uke" / "Koble til en TrackMan-økt" / "Koble til en runde"
  - Hver åpner mini-velger (popover) → setter en context-pill i melding (kan fjernes)
- Eks: pill "📋 Plan: Sommer-toppform · Uke 22"

**Footer (sticky bunn):**
- Venstre: `Avbryt` + `Lagre som utkast` (sekundær link)
- Høyre: `Send →` (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| "← Tilbake"-link | default, hover, focus |
| Mottaker-bar | default, hover (lift), klikk → Coach-detalj |
| Emne-felt | default, focus, with-text |
| Tekstboks | default, focus, with-text, drag-over (accent border) |
| Toolbar-knapp (B/I/etc.) | default, hover, active (når tekst-format aktiv), focus |
| `link`-knapp | klikk → mini-popover med URL-felt |
| `image`/`video`/`paperclip` | klikk → fil-velger |
| `image`-knapp | klikk → fil-velger ELLER ta bilde (mobil) |
| Emoji-picker | klikk → emoji-grid popover |
| Vedlegg-chip | default, hover (X synlig), klikk-X → fjern, klikk-thumbnail → preview-overlay |
| Drag-drop område | default (skjult), drag-over (synlig + accent border) |
| "Koble til"-expandable | collapsed, expanded |
| Context-velger-rad | default, hover, klikk → setter pill |
| Context-pill | default, hover, klikk-X → fjern |
| `Lagre som utkast` | default, hover, focus, loading, success ("Lagret som utkast") |
| `Send →`-CTA | default, hover, disabled (tom melding), loading ("Sender …"), success (accent flash + redirect) |
| `Avbryt`-knapp | default, hover, klikk → confirm hvis endringer |

## Empty / loading / error / success-states

- **Idle:** Tom melding, CTA disabled
- **Validering:** Send krever minst tekst eller minst 1 vedlegg
- **Drag-over:** Tekstboks får accent border + overlay "Slipp filer her"
- **Vedlegg-upload loading:** Per-fil progress-bar i vedlegg-chip
- **Vedlegg-error:** Inline error per chip: "Filen er for stor (max 50 MB)" / "Ugyldig format"
- **Submit loading:** CTA spinner, "Sender til Anders …", form disabled
- **Submit success:** Accent-flash + redirect til Coach-meldinger-tråd (batch 3) med ny melding scrollet inn
- **Submit error:** Toast: "Kunne ikke sende. Sjekk forbindelsen og prøv igjen." — melding beholdes
- **Tier-gating:** Free + 5 brukt denne mnd → banner øverst: "Du har brukt 5 av 5 free-meldinger denne mnd. [Oppgrader til Pro →]" — form disabled
- **Coach offline:** Banner: "Anders er borte til {dato}. Han ser meldingen ved retur — eller kontakt ved haste-saker [Send som haste →]"

## Mobile (≤640px)

Sidebar hamburger. Mottaker-bar sticky. Tekstboks tar full bredde. Toolbar komprimerer (færre knapper, "..."-meny for resten). Vedlegg-strip blir 1-kolonne. Footer-knapper fyller bredden.

## Ønsket output fra Claude Design

1. Lyst tema, idle (tom)
2. Lyst tema, mid-typing m/ formatert tekst (B + I + bullet)
3. Lyst tema, 2 vedlegg synlig (1 bilde-thumbnail, 1 video-tumbnail)
4. Lyst tema, "Koble til" ekspandert med plan-pill satt
5. Lyst tema, drag-over (accent border + overlay)
6. Lyst tema, submit-loading
7. Lyst tema, tier-gating Free-blokk
8. Mørkt tema
9. Mobil ≤640px (toolbar komprimert)

## Ikke-mål

- Ikke designe Coach-meldinger-tråd-skjerm (batch 3)
- Ikke designe Coach-detalj (batch 3)
- Ikke designe video-opptak in-app (egen pakke)
- Ikke designe send-form fra coach til spiller (egen CoachHQ-pakke — speilet her)

---

## Pakke 4/5: Tren-kalender

# AK Golf Platform — PlayerHQ — Treningskalender

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/tren/kalender`
- **Arketype:** G — Other (uke-kalender, spillerens egen)
- **Tier-gating:** Free får uke-view, Pro får måned-view + iCal-eksport
- **HTML-referanse:** `wireframe/screen-deck/playerhq/tren-kalender.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `SessionDetailModal`, `RescheduleSessionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Treningskalender er Markus' visuelle oversikt over alle planlagte og gjennomførte økter. Forskjellig fra `/tren` (treningsplan-detalj for én plan) — denne aggregerer **alt** Markus har: planlagte økter fra Anders, selvtrenings-økter, gruppe-økter med WANG, turneringer, fysio-time. Kombineres med GolfBox-data for runder.

## Layout — UNIKT for denne skjermen

### Toggle øverst-høyre

`Uke / Måned / Liste` (Free har Uke + Liste; Måned er Pro-låst).

### Uke-view (default)

- 7 kolonner (Mandag–Søndag), 06:00–22:00 grid
- Event-blokker:
  - **Coaching-økt** (lime accent) — pyramide-stripe venstre
  - **Selvtrening** (border-only, dashed) — pyramide-stripe venstre
  - **Gruppe** (primary) — fylt med ikon `Users`
  - **Runde** (gold) — ikon `Flag`
  - **Turnering** (secondary, full bredde)
  - **Fysio/restitusjon** (muted) — ikon `Heart`
- Status-prikk på blokk:
  - Planlagt — accent
  - Gjennomført — success-grønn
  - Hoppet over — destructive
  - Forsinket — gold
- Klikk → `SessionDetailModal` med "Start →" eller "Marker ferdig"

### Pro-låst måned-view

Hvis Free: vis hele måned-view som blurred ut + sentrert tier-gate-card "Få måned-oversikt med Pro · Oppgrader →" (lime CTA).

### Right-rail: Ukens fokus

- "Ukens pyramide": donut med FYS/TEK/SLAG/SPILL/TURN-fordeling
- "Volum: 8t 30m planlagt · 5t 12m gjennomført"
- "Streak: 23 dager"
- Knapp: `Eksporter til iCal →` (Pro-låst)

## KPI-strip (4 kort)

1. Økter denne uka: 6 (4 coaching, 2 selvtrening)
2. Volum: 8t 30m
3. Gjennomført: 4 av 6
4. Neste opp: "Onsdag 14:00 — 1:1 med Anders"

## Filter-bar — UNIKT

- Chip: Type (Coaching / Selvtrening / Gruppe / Runde / Turnering)
- Chip: Status (Planlagt / Gjennomført / Hoppet over)
- Naviger: `← Forrige uke / I dag / Neste uke →`

## Klikkbare elementer

| Element | States |
|---|---|
| Event-blokk | default, hover (lift + ring), klikk → `SessionDetailModal` |
| Pyramide-stripe | tooltip på hover |
| Status-prikk | tooltip "Gjennomført 14:32" |
| Måned-toggle (Free) | default, hover viser "Pro-låst", klikk → tier-gate-modal |
| Eksporter til iCal | Pro-knapp (default), Free viser låst-state med oppgrader-CTA |

## Empty / loading / error

- **Empty (ingen økter denne uka):** "Ingen planlagte økter. Snakk med coachen din eller logg en selvtrening →"
- **Loading:** Skeleton tids-grid
- **Sync-error (GolfBox):** Banner "Kunne ikke hente runder fra GolfBox. Viser cached →"

## Ønsket output fra Claude Design

1. Lyst tema, uke-view (uke 19, 11.–17. mai 2026)
2. Mørkt tema, samme
3. Måned-view med tier-gate (Free-bruker ser blurred + oppgrader-CTA)
4. SessionDetailModal åpen på en coaching-økt
5. Mobil ≤640px — 1-dag-view, swipe mellom dager, right-rail blir bottom-sheet

## Ikke-mål

- Ikke designe `SessionDetailModal`, `RescheduleSessionModal` (egen batch)
- Ikke designe iCal-eksport-flyten
- Ikke designe selvtrenings-logging-wizard

---

## Pakke 5/5: Treningsdetalj (post-økt)

# AK Golf Platform — PlayerHQ — Treningsdetalj (post-økt)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/sessions/:id`
- **Arketype:** C — Detail + tabs (4 tabs, post-økt review)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/treningsdetalj.html`
- **Audit:** `wireframe/audit/playerhq-treningsdetalj.md`
- **Tilhørende modaler:** `ActionableItemsModal`, `ShareWithPeerModal`, `ReflectionLogModal`, `StationDetailModal`, `AgentInsightDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Etter en gjennomført live-økt går spilleren hit for å se sammendrag, øvelser, resultater og notater fra coach. Hovedhandling er `Logg refleksjon` (1-10-skala + tekst) — det er hva som lukker økt-loopen.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `CheckCircle2` på success-grønn
- **H1:** `TEK 1:1 — Pitch 50-100m` (Geist 28px)
- **Subtittel:** `Med Anders K · 8. mai 14:00 – 15:30 · Mulligan Studio 2`
- **Stat-pills (4):** `2t siden` · `4/4 øvelser` · `1 åpen action` (klikk → ActionableItemsModal) · `Anders K avatar 28px`
- **Primary CTA:** `Logg refleksjon` (lime, åpner ReflectionLogModal)
- **Sekundær:** `Del med peer` (åpner ShareWithPeerModal) · `...`-meny (Eksporter PDF)

## Tab-strip (4 tabs)

| Tab | Innhold |
|---|---|
| **Sammendrag** (default) | "Hva gikk bra" + "Hva må forbedres" + agent-insight |
| **Øvelser** | Liste 4 øvelser med faktisk vs plan |
| **Resultater** | Carry-tabell + Sammenliknet med snitt-bar |
| **Notater** | Coach-notat + spillerens refleksjon |

## Layout — Sammendrag-tab (default)

- **2 hero-cards (12-col):** "Hva gikk bra" (lime accent strip) + "Hva må forbedres" (warning amber strip), hvert med 3 bullet-points
- **Agent-insight panel (12-col):** "Pyramide-agent: Konsistens på 50m forbedret 12 % vs forrige uke" + "Se full agent-rapport →" (åpner AgentInsightDetailModal)
- **Anbefalt neste øvelse-card (8-col):** "Sand-shot 30m fra grøntside" med "Se økt-detaljer →"
- **Coach-notat-snippet (4-col):** italic Instrument Serif quote + `Les hele notatet →`

## Layout — Resultater-tab

Carry-tabell, kolonner: `Slag | Klubb | Carry | Spin | Mål-distanse | Avvik`. 4 rader klikkbare → StationDetailModal.

Under: "Sammenliknet med snitt"-bar (progress-bar med din verdi vs gruppens snitt).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Logg refleksjon` CTA | default, hover, loading, success-toast |
| `Del med peer` | default, hover, modal-trigger |
| Action-strip "1 åpen action" | klikk → ActionableItemsModal |
| Carry-tabell-rad | default, hover, klikk → StationDetailModal |
| Agent-insight panel | klikk → AgentInsightDetailModal |
| `Les hele notatet →` | default, hover (underline) |

## Empty / loading / error

- **Empty (rå økt uten notater):** "Anders har ikke skrevet notat ennå. Sjekk tilbake senere."
- **Per tab empty:** Kontekst-spesifikk dempet ikon + tekst
- **Loading:** Skeleton hero-cards + carry-tabell
- **Refleksjon-logget:** Toast "Refleksjon lagret" + endre primary CTA til `Endre refleksjon`

## Eksempel-data

- **Økt:** TEK 1:1 — Pitch 50-100m, 8. mai 2026
- **Coach:** Anders Kristiansen
- **Sted:** Mulligan Studio 2
- **Hva gikk bra:** Kontakt på 70m, balanse i finish, tempo
- **Hva må forbedres:** Spin-konsistens på 100m, lav ball-flight på 50m
- **Carry-data:** 4 rader (Wedge, Pitching, 9-jern, Sand)

## Ønsket output fra Claude Design

1. Lyst tema, Sammendrag-tab default
2. Mørkt tema, samme
3. Tab-bytte til Resultater (carry-tabell)
4. ReflectionLogModal åpen (1-10 slider + tekstarea)
5. Empty: rå økt
6. Refleksjon-logget-state (CTA endret)
7. Mobil ≤640px — hero-cards stables, tabs scroll horisontalt

## Ikke-mål

- Ikke designe `ReflectionLogModal`, `ShareWithPeerModal` (egne pakker)
- Ikke designe live-session (egen Fase 5)
