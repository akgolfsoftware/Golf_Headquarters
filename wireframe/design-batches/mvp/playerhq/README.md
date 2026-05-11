# MVP-blokk 2 — PlayerHQ-kjerne

15 PlayerHQ-skjermer fordelt paa 3 mini-batches a 5 skjermer. Hver mini-batch
kjoeres som EEN samlet Claude Design-sesjon med felles vedlegg og prompt.

Spilleren er **Markus Roinaas Pedersen** (HCP 12,4 - eller +2,4 i Maal-detalj
HCP-trend). Hovedcoach er **Anders Kristiansen** (NGF Trener IV).
Hjemmebane: GFGK (Gamle Fredrikstad Golfklubb).

PlayerHQ-sidebar er **LYS** (#FFFFFF, enkelt-lag 220px) — viktig forskjell fra
CoachHQs to-lags moerke rail.

---

## Rekkefoelge

Anbefalt sekvens (kortere foerst, langsom-tunge til slutt):

1. **playerhq-A** — Maal-data (Baner, Maal-detalj, Leaderboard, Test-detalj, TrackMan-analyse)
2. **playerhq-B** — Coach-samhandling (Coach-detalj, Coaching-planer, Coaching-detail, Coach-notes, Notater-detalj)
3. **playerhq-C** — Wizards + kalender (Ny-oekt-wizard, OEnskeligOekt, Coach-melding-compose, Tren-kalender, Treningsdetalj)

Mini-batch A og B kan kjoeres parallelt hvis du har to vinduer. C bygger paa
patterns etablert i A og B, saa kjoer den sist.

---

## Innhold per mini-batch

### playerhq-A — Maal-data

5 skjermer som dekker spillerens egne data og maal:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Baner | B (kart + tabs) | Alle (Anbefalt-tab Pro-AI) |
| 2 | Maal-detalj (HCP-trend) | C (3 tabs) | Pro for projeksjon |
| 3 | Leaderboard | B (rang-tabell) | Pro/Elite (Free=full lock) |
| 4 | Test-detalj | C (3 tabs) | Pro for historikk |
| 5 | TrackMan-analyse | C (4 tabs) | Pro for alt, Elite for coach-review |

**Filer:** `playerhq-A.md`, `playerhq-A-prompt.md`, `playerhq-A-vedlegg.txt`

### playerhq-B — Coach-samhandling

5 skjermer som dekker spillerens dialog med coach:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Coach-detalj | C (5 tabs) | Pro (fanen skjult for Free) |
| 2 | Coaching-planer (kanban) | B | Pro/Elite (Free=full lock) |
| 3 | Coaching-plan-detalj | C (5 tabs) | Pro |
| 4 | Coach-notater (feed) | B (feed) | Pro/Elite (Free=full lock) |
| 5 | Notater-detalj | C (4 tabs) | Pro |

**Filer:** `playerhq-B.md`, `playerhq-B-prompt.md`, `playerhq-B-vedlegg.txt`

### playerhq-C — Wizards + kalender

5 skjermer som dekker spillerens planlegging og dokumentasjon:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Ny-oekt-wizard | D (6 steg, dots) | Free=3/mnd, Pro+=ubegrenset |
| 2 | OEnskeligOekt | D (single form) | Free=1/mnd, Pro=4/mnd |
| 3 | Coach-melding compose | D (rik form) | Free=5/mnd, Pro+=ubegrenset |
| 4 | Tren-kalender | G (uke-view) | Maaned-view + iCal er Pro |
| 5 | Treningsdetalj (post-oekt) | C (4 tabs) | Pro |

**Filer:** `playerhq-C.md`, `playerhq-C-prompt.md`, `playerhq-C-vedlegg.txt`

---

## Slik kjoerer du EEN mini-batch

1. **Aapne ny Claude Design-sesjon** (claude.ai/design)
2. **Last opp vedleggene** listet i `playerhq-{A|B|C}-vedlegg.txt`:
   - branding-style-guide.html + design-system-v2.md + alle 20 .woff2-fonts
   - felles-instruks.md (anti-state-katalog-regel)
   - playerhq-{X}.md (selve mini-batch-spec)
   - 5 HTML-hovedskjermer + tilhoerende modaler
3. **Lim inn prompt** fra `playerhq-{X}-prompt.md` (alt fra og med "# PROMPT"-linja)
4. **Vent** mens Claude Design genererer alle 5 skjermer i ett loep
5. **Lim design-links** tilbake til Claude Code naar ferdig

---

## Anti-state-katalog (kritisk!)

Foelg `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` eksakt:

- EEN produksjons-skjerm per HTML-fil — ikke captioned mini-mockups
- Default-state rendret i full stoerrelse (minimum 1440x900 desktop)
- Flere states (Pro vs Free-lock, empty, moerkt tema, mobil) som SEPARATE HTML-filer
- Wizard-steg (Ny-oekt-wizard i C) leveres som SEPARATE HTML-filer per steg

---

## Sprink-regler (felles for alle 3)

- Norsk bokmaal, AE/OE/AA, komma som desimal (12,4), mellomrom som tusenseparator (1 600 kr)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- ALDRI "God morgen, Markus" eller "Welcome back" — bruk italic observasjons-fragment
- PlayerHQ-sidebar er LYS (#FFFFFF), enkelt-lag — ALDRI moerk rail som i CoachHQ

---

## Etter alle 3 mini-batches

Du har 15 PlayerHQ-skjermer i produksjonsklar visuell tilstand. Sammen med
MVP-blokk 1 (CoachHQ-kjerne) utgjoer dette MVP-runden for AK Golf Platform.
