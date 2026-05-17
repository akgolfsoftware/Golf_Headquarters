# Redesign: Live Session Empty-state

**Last opp før prompten:** `wireframe/screen-deck/playerhq/live-session.html` + `wireframe/screen-deck/system/states/empty-detail.html`

---

## ANTI-MØNSTER

Forrige levering var mini-mockup som del av en katalog. **ÉN fullbleed empty-state-skjerm.**

---

## MÅL

Vises når spilleren går til `/portal/live/:sessionId` men sesjonen ikke finnes / ikke har data / er ferdig. Mørk fullscreen som matcher arketype-E. Mål: gi tydelig vei tilbake til app-en.

**Canvas: 1440×900 minimum.** Fullbleed. Mørk bg `#0A1F18`.

---

## LAYOUT (eksakte mål)

### Topp-bar (56px)

- **Venstre:** "AVSLUTTET · 14:42" i muted (ingen aktiv LIVE-pill)
- **Høyre:** Lukk-X

### Senter (sentrert)

1. **Ikon-sirkel** (160×160px sentrert):
   - Bg: rgba(255,255,255,0.05)
   - Border: 1px rgba(255,255,255,0.10)
   - Ikon: lucide `Inbox` 64×64px stroke 1.5px, opacity 0.40, hvit

2. **Italic tittel** (40px gap under ikon):
   - Tekst: *"Ingen aktiv økt her."* (italic editorial, observasjons-fragment)
   - Font: Inter Tight 36px italic regular, hvit, tabular -0.02em

3. **Sub-tekst** (16px gap):
   - "Økten er enten ferdig eller ikke startet enda."
   - Font: Inter 16px opacity 0.70 hvit

4. **Forslag** (32px gap, sentrert kort 480px bredde):
   - Tre forslag som ghost-knapper på rad:
     - "Tilbake til hjem →" → `/portal/hjem`
     - "Se planen →" → `/portal/tren/plan`
     - "Logg ny økt →" → `/portal/sessions/new`
   - Hver: bg rgba(255,255,255,0.05), border 1px rgba(255,255,255,0.15), padding 12px 20px, radius 12px, font Inter 14px, full bredde i sin tredjedel

---

## DEFAULT-STATE

Konkret innhold:

- **Tid avsluttet:** 14:42 (kan stå i topp-bar)
- **Spillerkontekst:** Markus, men ikke nødvendig å nevne — tom state
- **Ingen reps-data, ingen pause, ingen aktivt øvelses-navn**

---

## STATES SOM SEPARATE FILER

- `04-edge-live-empty-not-started.html` — Økten finnes men er ikke startet ennå
- `04-edge-live-empty-finished.html` — Økten er ferdig (samme layout, annen sub-tekst: "Du fullførte denne 14:42.")
- `04-edge-live-empty-not-found.html` — Sesjon-ID finnes ikke (sub: "Vi finner ikke denne sesjonen.")

---

## ANTI-MØNSTER-LISTE

❌ Vise reps-counter eller progress-ring (det er empty)
❌ Vise hoved-CTAs som "Start økt" (det er ingen økt å starte)
❌ Vise sidebar (fullscreen-arketype)
❌ "Welcome back, Markus!" (anti-AI-regel)
❌ Vise mock-data som tilhører populated state

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
