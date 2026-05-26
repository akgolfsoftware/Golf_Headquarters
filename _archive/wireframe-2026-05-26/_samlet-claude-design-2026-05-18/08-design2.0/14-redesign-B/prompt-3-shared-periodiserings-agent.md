# Redesign: Periodiserings-Agent

**Last opp før prompten:** `wireframe/screen-deck/shared/cross-cutting/periodiserings-agent.html`

---

## ANTI-MØNSTER

Forrige levering var 6 captioned mini-mockups. **ÉN fullbleed produksjons-skjerm.**

---

## MÅL

Periodiserings-agentens beslutnings-stack — viser HVA agenten foreslår for en spiller + HVORFOR. Coach kan godkjenne/avvise. 4-lags decision-stack: Data → Analyse → Forslag → Output.

**Canvas: 1440×900.** CoachHQ-shell med to-lags sidebar.

---

## LAYOUT (eksakte mål)

### Sidebar (256px)

CoachHQ to-lags. "Verktøy → Agenter → Periodiserings-agent" aktivt.

### Topp-bar i hovedinnhold (88px)

- **Breadcrumb:** "Verktøy → Agenter → Periodiserings-agent → Markus R" muted
- **Tittel:** "Periodiserings-agent" Inter Tight 28px bold
- **Sub:** "Markus Roinaas Pedersen · Sommer-toppform · uke 19" Inter 14px
- **Høyre:**
  - "Avvis"-knapp (ghost) + "Godkjenn alle 5 →"-CTA (primary lime, 56px høy)

### Hovedinnhold — Decision-stack (4 horisontale lag stablet vertikalt)

Hvert lag er en kort med 16px gap:
- Bredde: full bredde minus 48px padding
- Bg: `#FFFFFF`
- Border: 1px `#E5E3DD`
- Radius: 20px
- Padding: 24px
- Layer-label til venstre, innhold i grid til høyre

#### Lag 1 — DATA INN (180px høy)

- Layer-label: "1 · DATA INN" Inter 12px uppercase opacity 0.50
- Layer-tittel: "Hva agenten leser" Inter Tight 18px bold
- Grid 4 mini-stats:
  - "HCP: **12,4 → 11,8**" (siste 30d) — JetBrains Mono
  - "Volum: **4,2/uke**" (gjennomsnitt)
  - "SG-trend: **+0,4**" (lime tekst)
  - "Søvn-snitt: **7,2t**"

#### Lag 2 — ANALYSE (200px høy, expanded i default)

- Layer-label: "2 · ANALYSE"
- Layer-tittel: "Hva agenten tenker"
- Pyramide-mini-chart (5 ringer FYS/TEK/SLAG/SPILL/TURN med fordelinger venstre)
- Tre tekst-punkter høyre:
  - "Sterk fremgang på TEK (+15 % volum). Kan øke press."
  - "SLAG er underrepresentert siste 14d. Bør prioriteres."
  - "Søvn-data viser god restitusjon — kan tåle høyere intensitet."

#### Lag 3 — FORSLAG (240px høy)

- Layer-label: "3 · FORSLAG"
- Layer-tittel: "Hva agenten anbefaler"
- 5 forslag som rader (52px hver, med checkbox til venstre + tekst + impact-pill høyre):

1. ☑ "Øk SLAG-volum fra 20 % → 30 % neste 2 uker" · pill "Høy impact"
2. ☑ "Reduser TEK-press fra PR4 → PR3" · pill "Medium"
3. ☑ "Legg til 1x putte-fokus-økt i uke 20" · pill "Medium"
4. ☑ "Test-batch: NGF-100m i uke 21" · pill "Lav"
5. ☑ "Anbefal mental-økt før Sørlandsåpent (2 uker før)" · pill "Lav"

Default: alle 5 valgt (checkbox-haker).

#### Lag 4 — OUTPUT (120px høy)

- Layer-label: "4 · OUTPUT"
- Layer-tittel: "Hva som skjer ved godkjenning"
- Tre konsekvenser i en rad:
  - "Plan-fil oppdatert i `plans/markus-r-19.json`"
  - "Spiller varslet (push + e-post)"
  - "Coaching-board oppdatert"

### Footer-bar (48px)

- Status: "Foreslått av plan-watcher 06:00 · ML-confidence 0,87 · Brukt 4 mnd historikk"

---

## DEFAULT-STATE

- **Spiller:** Markus Roinaas Pedersen
- **Plan:** Sommer-toppform, uke 19
- **5 forslag**, alle valgt
- **Status:** Pending godkjenning (lime "Godkjenn alle 5"-CTA er primary)
- **Sist analysert:** 06:00 i dag

---

## STATES SOM SEPARATE FILER

- `07-periodiserings-agent-default.html` — DENNE
- `07-periodiserings-agent-collapsed.html` — Lag 2-4 collapsed, bare lag 1 + headers synlige
- `07-periodiserings-agent-godkjent.html` — Alle 5 forslag akseptert, success-banner
- `07-periodiserings-agent-avvist.html` — Avvist med årsak-felt
- `07-periodiserings-agent-mobil.html` — Vertikal swipe-collapse per lag

---

## ANTI-MØNSTER-LISTE

❌ Captioned mini-states
❌ Tom plass / placeholder-tekst
❌ Manglende "Godkjenn alle"-CTA (det er hovedhandlingen)
❌ Pyramide-chart med feil farger (sjekk FYS=`#005840`, TEK=`#1A7D56`, SLAG=`#D1F843`, SPILL=`#B8852A`, TURN=`#5E5C57`)

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
