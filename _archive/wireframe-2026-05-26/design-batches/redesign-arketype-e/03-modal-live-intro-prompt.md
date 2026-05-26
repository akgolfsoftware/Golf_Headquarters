# Redesign: LiveIntroModal (Screen 1 av 4)

**Last opp før prompten:** `wireframe/screen-deck/shared/modals/live-intro.html` (IA-referanse)

---

## ANTI-MØNSTER

Forrige levering var 4 captioned mini-modaler på samme side. **ÉN fullbleed modal i default-state.**

---

## MÅL

Pre-flight intro-modal som vises NÅR spilleren trykker "Start økt". Eneste handling: "Start økt →". Konseptuelt feil i forrige levering: blandet plan-info og økt-info — fiksen er at HOVEDFOKUS skal være den konkrete ØKTEN, ikke planen.

**Canvas: 1024×768.** Modal er fullscreen overlay over PlayerHQ-app.

---

## LAYOUT (eksakte mål)

### Topp-bar (56px høy, padding 16px 24px)

- **Venstre (~300px):** Mini-progress 1/4
  - Track: 200px bredde, 4px høyde, bg rgba(255,255,255,0.15), radius pill
  - Fill: 25% av bredden, lime `#D1F843`
  - Label til høyre: "1 / 4 · forberedelse" Inter 12px muted

- **Høyre:** Lukk-X 40×40 sirkel

### Senter — Innhold (sentrert vertikalt i ~600px area)

1. **Eyebrow** (font Inter 12px uppercase letterspacing 0.10em, opacity 0.60):
   - Format: `PLAN-NAVN · PYRAMIDE-LAG`
   - Eksempel: "SOMMER-TOPPFORM · TEK"

2. **Stor tittel** (24px gap fra eyebrow):
   - Tekst: "Putte-økt" (DETTE ER ØKT-NAVNET, ikke plan-navnet)
   - Font: Inter Tight 72px bold, tabular -0.03em
   - Farge: hvit

3. **Sub-tittel** (16px gap under tittel):
   - Tekst: "3 stasjoner"
   - Font: Inter 24px regular, opacity 0.75

4. **Meta-strip** (32px gap under sub, sentrert inline):
   - "~**30 min**" · "**60 reps** planlagt"
   - Font: Inter 16px, sub-tall i Inter 18px bold

5. **Coach-tip** (48px gap under meta, valgfri):
   - Liten kort 480px bredde sentrert
   - Bg: rgba(255,255,255,0.05), border 1px rgba(255,255,255,0.10), radius 16px
   - Padding 16px 20px
   - Avatar 32×32 (Anders K, lime-bg, initialer AK)
   - Label: "COACH-TIP" Inter 10px uppercase opacity 0.50
   - Quote: "Hold tempo gjennom hele putten — ikke akselerer på treffpunktet." italic Inter Tight 14px
   - Author: "— Anders K · 2 dager siden" Inter 12px opacity 0.50

### Bunn-bar (88px høy)

- **Sentrert primary CTA:**
  - Tekst: "Start økt →" Inter 18px semibold
  - Bg: `#D1F843` (lime)
  - Farge: `#0A1F18`
  - Høyde: 72px
  - Bredde: 280px sentrert
  - Subtle glow: `0 0 0 1px rgba(209,248,67,0.5), 0 16px 32px rgba(209,248,67,0.18)`

---

## DEFAULT-STATE

Konkret innhold:

- **Plan:** Sommer-toppform (vises som eyebrow)
- **Pyramide-lag:** TEK (eyebrow)
- **Økt-navn:** "Putte-økt" (HOVEDFOKUS)
- **Sub:** "3 stasjoner"
- **Meta:** ~30 min, 60 reps planlagt
- **Coach-tip:** Anders K, 2 dager siden, putte-relatert
- **Progress:** 1/4 (forberedelse)

---

## STATES SOM SEPARATE FILER

- `03-modal-live-intro-default.html` — DENNE (med coach-tip)
- `03-modal-live-intro-ren.html` — UTEN coach-tip (mer luftig)
- `03-modal-live-intro-loading.html` — Skeleton over økt-tittel og meta
- `03-modal-live-intro-cancel.html` — Bekreftelse-popover "Avlys oppstart?"

---

## KONSEPTUELT VIKTIG

**Tittel = øktens navn. IKKE plan-navnet.**

Forrige levering hadde "Sommer-toppform" som hovedtittel — dette er FEIL. Det er HVA økten er om (drill-navn) som skal være tittel. Plan-navnet er kontekstuelt og hører hjemme i eyebrow.

❌ Feil: Hovedtittel "Sommer-toppform" / "6 øvelser, 150 reps"
✅ Riktig: Eyebrow "Sommer-toppform · TEK" / Tittel "Putte-økt" / Meta "3 stasjoner, ~30 min, 60 reps"

---

## OUTPUT

Ett HTML-dokument 1024×768. Lim design-link tilbake.
