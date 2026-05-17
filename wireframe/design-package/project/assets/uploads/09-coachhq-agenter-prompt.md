# Redesign: CoachHQ Agent-konfigurasjon

**Last opp før prompten:** `wireframe/screen-deck/coachhq/agenter.html`

---

## STATUS

Denne skjermen var **bedre enn de andre** (0 captioned states i forrige levering), men trenger fortsatt evaluering for å sikre at den passer som produksjons-skjerm.

---

## MÅL

Anders' kontroll over alle 5 agenter — tune dem opp/ned, A/B-test, se hva de har gjort siste 30d. Power-user-flate.

**Canvas: 1440×900.** CoachHQ-shell med to-lags sidebar.

---

## LAYOUT (eksakte mål)

### Sidebar (256px)

CoachHQ to-lags. "Verktøy → Agenter" aktivt.

### Topp-bar i hovedinnhold (104px)

- **Eyebrow:** "VERKTØY · AGENTER" muted
- **Italic editorial-tittel:** *"Agenter. 5."* Inter Tight 36px italic regular
- **Sub:** "Fem agenter du faktisk stoler på. Tune, test, eller pause." Inter 14px muted

### Hovedinnhold — Agent-cards (5 store cards i 2-kolonne grid, asymmetrisk)

Layout: 3 cards venstre kolonne + 2 cards høyre kolonne (eller motsatt — varier asymmetri).

Hver card:
- Bredde: ~640px
- Høyde: ~260px
- Bg: hvit, border 1px `#E5E3DD`, radius 20px, padding 24px
- Shadow: shadow-card

#### Per card-struktur:

**Topp (60px):**
- Venstre: Agent-ikon 40×40 i fargekodet sirkel (Plan-watcher=primary, Test-påminner=warning, etc.)
- Navn: "Plan-watcher" Inter Tight 20px bold
- Sub: "Justerer plan basert på fremdrift" Inter 13px muted
- Høyre: Status-toggle (Active / Pause) — pill med dot-indikator

**Midt (120px) — Stats grid 4 mini-stats:**
- "Aksjoner 30d: **47**" — JetBrains Mono
- "Godkjent: **42** (89 %)" — lime tekst på 89%
- "Avvist: **3**"
- "I kø: **2**"

**Bunn (40px) — Sliders + footer:**
- Slider: "Aggressivitet" 0-10, default 6 (lime fyll-bar)
- Mini-footer: "A/B test mot v0,9 · Aktiv siden 12. mai"

**5 cards med ulike default-verdier:**

1. **Plan-watcher** — Active · 47 aksjoner · Aggressivitet 6
2. **Test-påminneren** — Active · 23 aksjoner · Aggressivitet 8
3. **Coach-allokator** — Pause · 0 aksjoner · Aggressivitet 3
4. **Tournament-watch** — Active · 12 aksjoner · Aggressivitet 5
5. **Faktura-følger** — Active · 18 aksjoner · Aggressivitet 9

### Footer-rad (72px)

- Venstre: "Sist deployment: 11.05.26 14:32 · v1.4.2 · ML-confidence 0,86"
- Høyre: "Globalstopp"-knapp (destructive, rød) — pauser alle 5 agenter

---

## DEFAULT-STATE

- **Status:** 4 av 5 agenter aktive, Coach-allokator pauset
- **Total aksjoner 30d:** 100 (47+23+0+12+18)
- **Godkjent ratio:** 89 % globalt
- **Versjon:** v1.4.2 deployment 11. mai 14:32

---

## STATES SOM SEPARATE FILER

- `09-coachhq-agenter-default.html` — DENNE (alle synlige)
- `09-coachhq-agenter-globalstopp.html` — Alle 5 pauset etter klick på "Globalstopp"
- `09-coachhq-agenter-edit.html` — Én card expanded for detaljert tuning (slidere for trigger-window, confidence-threshold, etc.)
- `09-coachhq-agenter-deploy.html` — Deployment-pågående med progress

---

## ANTI-MØNSTER-LISTE

❌ For komplekse sliders som tar opp hele cardet
❌ Manglende stats-grid (det er hovedverdien i kortet)
❌ Generic "settings"-stil — dette er power-user-konsoll
❌ "Welcome back, Anders" — bruk italic editorial som spec'et

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
