# Redesign: PlayerHQ Live Session

**Last opp før prompten:** `wireframe/screen-deck/playerhq/live-session.html` (IA-referanse)

---

## ANTI-MØNSTER (det forrige design var feil slik)

Forrige levering var en **state-katalog** med 7 captioned mini-mockups på samme HTML:
- "1 — Idle, før første tap"
- "2 — Aktiv mid-økt, 24/30"
- "3 — Pause, PAUSE-overlay"
- ... og 4 flere

Dette skal IKKE skje igjen. Jeg vil ha ÉN fullbleed produksjons-skjerm.

---

## MÅL

Implementerbar React-komponent for `/portal/live/:sessionId`. Fullscreen, mørk bg `#0A1F18`. Ingen sidebar. Tap-mode for å logge reps under aktiv treningsøkt.

**Canvas: 1440×900 minimum.** Fullbleed.

---

## LAYOUT (eksakte mål)

### Topp-bar (56px høy, padding 16px 24px)

- **Venstre (240px):** Pulserende lime "● LIVE"-pill + "TEK · DRIVER" i JetBrains Mono 12px uppercase letterspacing 0.10em
- **Senter:** "Økt 12 av 18 — Sommer-toppform" i Inter 13px muted (#9C9990)
- **Høyre (40×40px):** Lukk-X i sirkel, border 1px rgba(255,255,255,0.20), hover rgba(255,255,255,0.10) bg

### Senter (counter-zone, ca 720px tall)

Vertikalt sentrert innhold:

1. **Pyramide-fokus-pill** (40px gap fra topp-bar):
   - Tekst: "TEK · DRIVER"
   - Border: 2px `#005840` (FYS=`#16A34A`, TEK=`#005840`, SLAG=`#D1F843`, SPILL=`#F4C430`, TURN=`#5E5C57`)
   - Padding: 8px 16px
   - Radius: 100px
   - Font: Inter 12px uppercase letterspacing 0.10em

2. **Counter** (32px gap under pill):
   - Tall: "24"
   - Font: JetBrains Mono 140px medium, tabular-nums
   - Farge: `#D1F843` (lime accent)
   - Mini-progress-ring rundt counter: 320px diameter, 6px stroke, lime fyll 80% (24/30)

3. **Sub-tekst** (24px gap under counter):
   - "av 30 rep"
   - Font: Inter 16px, opacity 0.65, hvit

4. **Pyramide-stripe** (under sub, valgfri):
   - 3 prikker hvorav den midterste er lime: "○ ● ○" (viser plass i sekvens)

### Bunn-bar (88px høy, padding 16px 24px)

- **Venstre 30% (~430px):** "Pause"-knapp
  - Bg: transparent
  - Border: 1px rgba(255,255,255,0.20)
  - Tekst: "Pause" hvit Inter 16px medium
  - Høyde: 56px
  
- **Høyre 70% (~990px):** "Neste rep →"-CTA
  - Bg: `#D1F843` (lime)
  - Tekst: `#0A1F18` (mørk grønn) Inter 18px semibold
  - Høyde: 88px (større — primær handling)
  - Subtle shadow: `0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)`

---

## DEFAULT-STATE (det som vises)

Konkret innhold:

- **Spiller:** Markus Roinaas Pedersen (kun "Markus" vises i kontekst)
- **Plan:** Sommer-toppform
- **Lag:** TEK
- **Øvelse:** Driver-presisjon (sesjon 12 av 18)
- **Reps:** 24 av 30 logget (counter viser 24, ring 80% fylt)
- **Tid:** Ingen pause aktiv
- **Pyramide-sekvens:** Andre rep av tre i denne stasjonen

---

## STATES SOM SEPARATE FILER (hvis spec ber om)

Hvis du vil designe andre states, lever som **separate HTML-filer**:
- `01-live-session-default.html` — DENNE (24/30 aktivt)
- `01-live-session-idle.html` — Counter 0/30, "Tap for første rep ↓"-instruks pulserer
- `01-live-session-pause.html` — Counter dempet 40%, "PAUSE" italic Instrument Serif 96px sentrert overlay
- `01-live-session-ferdig.html` — Counter 30/30 lime glow, "Neste øvelse →"-CTA
- `01-live-session-mislykket.html` — Destructive ring rundt counter, "Rep markert mislykket ✗"

ALDRI legg disse som captioned mini-mockups på samme side.

---

## ANTI-MØNSTER-LISTE

❌ Captioned "1 — Idle, 2 — Aktiv ..."
❌ Flere mini-states side-om-side
❌ "PAUSE & SUMMARY"-knapper sammen i bunn-bar (kun Pause + Neste rep)
❌ Sidebar synlig (dette er fullscreen)
❌ Sidebar-shell-elementer (avatar, breadcrumbs, etc.)
❌ Placeholder-tall (12.4 i stedet for 12,4 — bruk komma)

---

## OUTPUT

Levér **ett HTML-dokument** 1440×900+, klart for screenshot eller iframe-embed. Bruker `colors_and_type.css`-tokens som er lastet opp som system-kontekst.

Lim design-link tilbake til Claude Code når ferdig.
