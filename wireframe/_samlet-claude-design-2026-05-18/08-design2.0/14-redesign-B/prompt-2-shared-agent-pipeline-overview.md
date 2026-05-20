# Redesign: Admin Agent-pipeline Overview

**Last opp før prompten:** `wireframe/screen-deck/shared/cross-cutting/agent-pipeline-overview.html`

---

## ANTI-MØNSTER

Forrige levering var 5 captioned mini-mockups med "1 — Live aktivitet ... 5 — Mobil". Tekst overlappet, linjer routet gjennom labels. **ÉN fullbleed produksjons-skjerm.**

---

## MÅL

Admin/coach-versjon av agent-pipeline — mer detaljert enn PlayerHQ. Viser HELE systemet på tvers av alle spillere. Tillit + debugging for coach + Anders som admin.

**Canvas: 1440×900.** CoachHQ-shell med to-lags sidebar (56px mørk rail + 200px lys nav).

---

## LAYOUT (eksakte mål)

### Sidebar (256px total, to-lags)

Standard CoachHQ to-lags sidebar. "Verktøy → Agenter" aktivt.

### Topp-bar i hovedinnhold (72px)

- **Breadcrumb:** "Verktøy → Agenter → Pipeline" Inter 13px muted
- **Tittel:** "Agent-pipeline — System Overview" Inter Tight 28px bold
- **Sub:** "Hvordan signaler blir til handling"
- **Høyre side:**
  - Toggle: "Live | Statisk | Replay" pill-rad (lime active state)
  - "Sist oppdatert 14:32 · 3 aktive ruter" muted

### Hovedinnhold — Pipeline-board

3-kolonne grid med 8 signaler, 5 skills, 5 agenter.

#### Kolonne 1 — SIGNALER · 8 (~340px bredde)

8 signaler vertikalt stablet (gap 16px). Hver node:
- Størrelse: 300×60px
- Radius 14px
- Bg `#FFFFFF`
- Border 1px `#E5E3DD`
- Inni: lucide-ikon (24px) + navn (Inter 14px medium) + lite sub (Inter 12px muted)

Eksempler:
1. `Trending-up` "HCP-trend" · "12 spillere"
2. `Activity` "Aktivitets-data" · "Live"
3. `Target` "Mål-status" · "30 mål tracked"
4. `Calendar` "Booking-mønster" · "Siste 90d"
5. `Award` "Test-resultater" · "NGF-batch"
6. `MapPin` "Bane-data" · "47 runder"
7. `Heart` "Helse-tracker" · "12 koblet"
8. `Trophy` "Konkurranse-resultater" · "Siste 12mnd"

Aktiv-indikator: lime ring 2px rundt nodene som fyrer (sett 3-4 stk aktive).

#### Kolonne 2 — SKILLS · 5 (~340px bredde)

5 skills vertikalt stablet (gap 24px). Hver node:
- 300×80px, radius 14px, bg `#FAFAF7`
- Skill-navn + kort beskrivelse + "Sist anbefalt: 8 min siden"

1. "Plan-analyse" · "Fremdrift mot mål" · "Sist: 8m"
2. "Volum-analyse" · "Rep-tetthet over tid" · "Sist: 15m"
3. "Talent-projeksjon" · "6mnd HCP-estimat" · "Sist: 2t"
4. "Konkurranse-vekting" · "Topp-form-timing" · "Sist: 1d"
5. "Klubb-kapasitet" · "Coach-belegg" · "Sist: 22m"

#### Kolonne 3 — AGENTER · 5 (~340px bredde)

5 agenter vertikalt stablet (gap 32px). Hver node:
- 300×100px, radius 14px, bg `#FFFFFF`, border 2px (lime hvis nylig anbefalt)
- Agent-navn (Inter 16px bold) + en-liner forklaring + "X aksjoner i kø"

1. **Plan-watcher** · "Justerer plan basert på fremdrift" · "3 aksjoner i kø"
2. **Test-påminneren** · "Forvarsler tester" · "7 ute"
3. **Coach-allokator** · "Foreslår coach-bytte" · "0 i kø"
4. **Tournament-watch** · "Påmelding + taper-fase" · "1 i kø"
5. **Faktura-følger** · "Forsinket-betaling" · "2 i kø"

#### Linjer mellom kolonner

- SVG-paths, stroke 1.5px
- Inaktive (de fleste): rgba(0,0,0,0.08)
- Aktive: lime `#D1F843` med subtil dash-animation
- **z-index BAK nodene** — kritisk
- Path-geometri: Bezier-kurver fra høyre-kant av source-node til venstre-kant av target-node

### Footer-rad (48px)

- Kontekst: "Live · 14:32:18 · 3 aktive ruter · 7 anbefalinger ventet siden 06:00"
- Høyre: "Eksporter snapshot →" og "Send agent-feedback →"

---

## DEFAULT-STATE

- **Live mode:** aktiv (lime pill)
- **Sist oppdatert:** 14:32:18
- **Aktive ruter:** 3 (mellom signaler og skills)
- **Aksjoner ventet:** 7 totalt fordelt over agentene
- **Spiller-kontekst:** Stallen samlet (Anders K admin-view)

---

## STATES SOM SEPARATE FILER

- `06-agent-pipeline-overview-default.html` — DENNE (live aktivitet)
- `06-agent-pipeline-overview-rolig.html` — "Pipeline er rolig nå" (alle noder 30% opacity, sentrert melding)
- `06-agent-pipeline-overview-trigger.html` — Hover-tooltip åpen på en node (opplærings-modus)
- `06-agent-pipeline-overview-pause.html` — Periodisering-agent popover åpen, andre noder dempet
- `06-agent-pipeline-overview-mobil.html` — Vertikal stack, kolonner blir rader

---

## ANTI-MØNSTER-LISTE

❌ Tekst-overlapp (sjekk hver linje)
❌ Linjer som går gjennom labels
❌ Avskårede kolonner (AGENT-LAG må vises fullt)
❌ Captioned mini-states på samme side
❌ Empty-state og populated-state blandet i samme view

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
