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

## Når du er ferdig

Lim design-link tilbake til Claude Code.
