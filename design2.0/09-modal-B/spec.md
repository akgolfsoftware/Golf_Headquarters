# Mini-batch modal-B - Live Session 2-4

**3 modaler i denne mini-batchen.** Felles moenster: Live Session-flytens
midt-/sluttsteg - aktiv rep-logging, mellom oevelser, og ferdig-summary.
Alle er fullscreen-modaler (ingen sidebar) med moerk bakgrunn `#0A1F18`.

**Generer alle 3 modaler i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` - EEN produksjons-modal per HTML. States leveres som
separate HTML-filer.

---

## Felles for Live Session-modaler

- **Fullscreen-modal:** Ingen sidebar, bakgrunn `#0A1F18` (mork primary)
- **Topp-bar (56px):** Live-pill (lime pulserende) + kontekst-tekst venstre, mini-progress-bar senter, lukk-X 40x40px hoeyre
- **Counter-typografi:** JetBrains Mono 120px lime accent for tall
- **Bunn-bar (88px):** `rounded-full` knapper, lime primary CTA hoeyre, sekundaer venstre
- **Spiller:** Markus Roinaas Pedersen (HCP 12,4)
- **Coach:** Anders Kristiansen
- **OEkt-eksempel:** "Putte-oekt onsdag" eller "TEK Driver - oekt 3 av 6"
- **Pyramide-farger:** FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`
- **Transitions:** Mellom modalene faar 200-800ms transitions (intro -> active -> between -> active -> summary)

---

## Pakker i denne mini-batchen

---

## Pakke 1/3: LiveActiveModal

# AK Golf Platform - Modal - LiveActiveModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Aapnes fra LiveIntroModal (Start-CTA) eller LiveBetweenModal (Neste oevelse)
- **Type:** Fullscreen rep-logging
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-active.html`

## Spec

Screen 2 i Live Session-flyten - selve rep-logging-flaten. Markus tapper
midten av skjermen for hver rep, eller bruker long-press for "ikke godkjent".

## Layout

- **Topp-bar:** Live-pill (lime pulserende) + "OEvelse 3 av 6 - TEK - DRIVER" + mini-progress senter + lukk-X
- **Senter counter-zone:**
  - Pyramide-fokus-pill: `TEK - DRIVER` (primary border)
  - Counter: JetBrains Mono 120px lime "12"
  - Sub: "av 25 reps"
  - Mini-ring rundt counter (4px stroke, lime fyller seg opp)
  - Tap-instruks (kun foerste rep): "Tap for aa logge v" pulserer
- **Bunn-bar:** `Pause` (sekundaer 56px) venstre 40% + `Logg rep` (primary lime 88px) hoeyre 60%
- Long-press paa `Logg rep` = "Markert som mislykket"

## States

1. Idle (0/25, instruks pulserer)
2. Aktiv mid-rep (12/25, ring 48% fylt)
3. Long-press feedback (destructive ring + "Mislykket rep" toast)
4. Pause (counter dempes 40% opasitet, "PAUSE" overlay italic Instrument Serif 96px)
5. Connection lost (toast oeverst "Tilkobling tapt - reps lagres lokalt", lime ring)
6. Ferdig (25/25, counter glows lime, transition til Between etter 800ms)

## OEnsket output

Hver state som SEPARAT HTML-fil (5-6 separate filer).

## Anti-moenster

- IKKE state-katalog - hver state er sin egen HTML
- IKKE plan-info eller meny - counter er ENESTE fokus
- IKKE coach-info (Markus er alene i oekta)
- IKKE smaa knapper - bunn-bar skal vaere thumb-vennlig (88px hoeyde)

---

## Pakke 2/3: LiveBetweenModal

# AK Golf Platform - Modal - LiveBetweenModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Etter at en oevelse er ferdig (25/25) i LiveActiveModal
- **Type:** Fullscreen transisjon mellom oevelser
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-between.html`

## Spec

Screen 3 i Live Session-flyten - mellomstopp mellom oevelser. Viser
sammendrag for oevelsen som ble ferdigstilt + countdown/oversikt over neste
oevelse. Markus kan ta pause her, hoppe over neste, eller starte neste rett.

## Layout

- **Topp-bar:** "OEvelse 3 av 6 fullfoert" + mini-progress (50% fyllt) + lukk-X
- **Senter - 2 seksjoner stable:**
  - **OEvelse-ferdig-sammendrag:**
    - Stor lime-prikk (Lucide `CheckCircle2` 64px) + tekst "TEK - DRIVER fullfoert"
    - Stat-rad (3 mini-kort): "25 reps", "18 godkjent", "Snitt-konfidens 78%"
  - **Neste oevelse-preview:**
    - "Neste: SLAG - WEDGE 50m"
    - Pyramide-pill (lime accent)
    - Beskrivelse: "20 reps - fokus paa konsistent ballflight"
    - Countdown-ring (60 sek pause-default), tekst "Starter automatisk om 42 sek"
- **Bunn-bar:** `Avslutt oekt` (ghost) venstre 30% + `Pause lengre` (sekundaer 30%) senter + `Start neste ->` (primary lime 40%) hoeyre

## States

1. Default (countdown loeper, 42 sek igjen)
2. Pause-forlenget (countdown frosset, "Pause - trykk Start naar du er klar")
3. Siste oevelse (countdown skjult, knapp endres til `Ferdig - se sammendrag ->`)
4. Skip-confirm (popover "Hoppe over neste oevelse?" m/ confirm + cancel)

## OEnsket output

Hver state som SEPARAT HTML-fil (4 filer).

## Anti-moenster

- IKKE bare en spinner - skal vaere rik sammendrag + preview
- IKKE tom "Klar?" - vis konkret data fra forrige oevelse
- IKKE coach-feedback (det kommer i summary, ikke her)

---

## Pakke 3/3: LiveSummaryModal

# AK Golf Platform - Modal - LiveSummaryModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Etter at siste oevelse er ferdig, eller "Avslutt oekt" trykket
- **Type:** Fullscreen post-session summary
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-summary.html`

## Spec

Screen 4 (siste) i Live Session-flyten - feiring + sammendrag etter ferdig
oekt. Markus ser hva han akkurat fullfoerte, badges/achievements, og kan
sende feedback til coach. Confetti-animasjon ved foerste loading.

## Layout

- **Topp-bar:** "OEkt fullfoert" + lukk-X (ingen progress-bar)
- **Senter - 3 seksjoner:**
  - **Hero (italic Instrument Serif 40px):** *"6 av 6 oevelser. Bra jobba, Markus."*
  - Sub-rad: "Putte-oekt onsdag - 42 minutter - 142 reps totalt"
  - **Pyramide-donut 160px** + tall-legend (FYS 0%, TEK 60%, SLAG 30%, SPILL 10%, TURN 0%)
  - **Stat-grid 2x2:**
    - "142 reps" / "118 godkjent (83%)"
    - "Snitt-konfidens 81%" / "Beste streak 14 reps"
  - **Achievement-banner (hvis utloest):** Lucide `Award` accent + "Ny badge: 30-dagers streak!" 
- **Footer-seksjon (collapsible):** "Send rask feedback til Anders" - 3 emoji-knapper (smiley / noeytral / sur) + valgfri textinput
- **Bunn-bar:** `Detaljert post-oekt ->` (sekundaer) venstre + `Til min hjem ->` (primary lime) hoeyre

## States

1. Default lyst-tema-ish (skjermen er moerk men content highlightet)
2. Confetti-state (200ms inn-animasjon med accent-confetti)
3. Achievement utloest (banner synlig)
4. Feedback sendt (knapper disabled + "Sendt - takk!" tekst)
5. No-achievement default (banner skjult)
6. Mobile (stat-grid stables vertikalt)

## OEnsket output

Hver state som SEPARAT HTML-fil (5-6 filer).

## Anti-moenster

- IKKE bare et "OK, ferdig" - skal vaere FEIRENDE og data-rik
- IKKE "Welcome back" eller "Klar for neste?" - bruk italic observasjons-fragment
- IKKE coach-melding-thread (det er separat MessageDetailModal)
- IKKE neste-oekt-foreslag her (det hoerer hjemme paa hjemskjerm)
