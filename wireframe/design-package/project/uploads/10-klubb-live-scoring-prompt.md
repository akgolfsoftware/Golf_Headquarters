# Redesign: Klubb Live-scoring Board

**Last opp før prompten:** Ingen wireframe finnes for denne. Bruk `wireframe/screen-deck/coachhq/tournaments.html` som kontekst.

---

## ANTI-MØNSTER

Forrige levering var en mini-mockup som del av katalog. **ÉN fullbleed produksjons-skjerm i klubb-admin-stil.**

---

## MÅL

Live-scoring-board for klubb-turneringer. Brukes på storskjerm i klubbhuset under turnering — viser leaderboard i sanntid. Også tilgjengelig som visning på admin-PC.

**Canvas: 1920×1080** (TV-format). Designet for storskjerm-visning.

---

## LAYOUT (eksakte mål)

### Topp-bar (80px høy, bg `#0A1F18` mørk, padding 24px 48px)

- **Venstre:** "GFGK · Klubbmesterskap 2026" Inter Tight 24px bold hvit
- **Senter:** "RUNDE 2 · 14:32" JetBrains Mono 18px (live klokke)
- **Høyre:** Live-pill (lime, pulserende) + "● LIVE" + lukk-X for admin-view

### Hovedinnhold — Leaderboard-tabell (resterende plass)

Stor lesbar tabell — for-storskjerm-optimalisert.

**Kolonner:**

| Pos | Spiller | Klubb | Hull | Score | Total | Trend |
|---|---|---|---|---|---|---|

- Pos: 32px JetBrains Mono bold
- Spiller: 28px Inter medium
- Klubb: 18px muted
- Hull: 24px JetBrains Mono
- Score: 32px JetBrains Mono (lime hvis -par, hvit hvis par, oransje hvis +1-3, rød hvis +4+)
- Total: 32px JetBrains Mono bold
- Trend: pil-ikon (lucide `arrow-up` lime, `arrow-down` rød, `minus` muted) + endring siste 3 hull

**12 rader med innhold:**

1. 1. Mads Rønning · GFGK · 18/18 · -4 · 68 · ↑ +2
2. 2. Joachim Tangen · Bossum · 18/18 · -2 · 70 · ↑ +1
3. 3. Anna Karlsen · GFGK · 17/18 · -1 · 71 · ↑ +2
4. 4. Markus R. Pedersen · GFGK · 18/18 · E · 72 · = 0
5. 5. Henrik Nilsen · WANG · 16/18 · +1 · 73 · ↓ -1
6. 6. Lise Sandberg · GFGK · 18/18 · +2 · 74 · ↓ -2
7. 7. Emma Sørensen · Bossum · 17/18 · +2 · 74 · = 0
... fortsett til 12

**Topp-3 fremhevet:**
- Bg lime gradient (rgba(209,248,67,0.10)) for pos 1
- Subtil bg for pos 2-3

### Live-strip nederst (88px høy, bg `#0A1F18`)

Karusell med siste 3 hull-resultater fra tabellen:
- "Hull 18 · Mads R · BIRDIE -1 · 14:32"
- "Hull 17 · Anna K · BIRDIE -1 · 14:31"
- "Hull 18 · Markus P · PAR · 14:30"

Hver oppføring 320px bredde, glider rolig sideveis.

---

## DEFAULT-STATE

- **Turnering:** GFGK Klubbmesterskap 2026
- **Runde:** 2 av 2
- **Tid:** 14:32, live
- **12 spillere** vist i topp av tabellen (kan scroll for resten)
- **Mads R leder** med -4 etter 18 hull (ferdig)
- **3 ferdige live-events** i strip nederst

---

## STATES SOM SEPARATE FILER

- `10-klubb-live-scoring-default.html` — DENNE (mid-runde)
- `10-klubb-live-scoring-finished.html` — Runde ferdig, "VINNER: Mads R."-banner topp
- `10-klubb-live-scoring-pause.html` — Pause-banner (regn, lyn, etc.) overlay
- `10-klubb-live-scoring-empty.html` — Før runde starter, "Starter 09:00" stort sentrert
- `10-klubb-live-scoring-mobile.html` — Mobil-versjon: kompakte rader, scroll

---

## ANTI-MØNSTER-LISTE

❌ Captioned mini-states
❌ Liten font — dette er storskjerm-format, tekst må være lesbar på 5 meter
❌ Sidebar synlig (fullscreen, ikke admin-shell)
❌ Generic "list-stil" — dette skal være DRAMATISK leaderboard
❌ Manglende live-feedback (strip nederst er essensielt)

---

## OUTPUT

Ett HTML-dokument 1920×1080. Lim design-link tilbake.
