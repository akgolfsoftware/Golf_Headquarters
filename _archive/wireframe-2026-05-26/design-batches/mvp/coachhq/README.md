# MVP-blokk 1 — CoachHQ-kjerne

17 CoachHQ-skjermer fordelt paa 4 mini-batches. Hver mini-batch kjoeres som
EEN samlet Claude Design-sesjon med felles vedlegg og prompt.

Hovedcoach er **Anders Kristiansen** (NGF Trener IV). Spillere som vises:
**Markus Roinaas Pedersen** (Kat A, Elite, +2,4), **Henrik Nilsen** (Kat B,
Pro, 8,7), **Anna Karlsen** (Free, 16,8), **Mads Roenning** (Pro, 9,4),
**Lise Sandberg** (Free, 19,5), **Joachim Tangen** (Pro, 14,2 - skadet).

CoachHQ-sidebar er **TO-LAGS** (56px moerk rail + 200px lys nav, total 256px)
- viktig forskjell fra PlayerHQs enkelt-lag lys 220px sidebar.

---

## Rekkefoelge

Anbefalt sekvens (logisk avhengighet og kompleksitet):

1. **coachhq-A** — Plan-management (360-profil, Plan-bygger, Plan-detalj, Plan-edit, Plan-templates)
2. **coachhq-B** — Operative dashboards (Daglig brief, Fasiliteter, Analytics V2, Audit, Reports)
3. **coachhq-C** — Kalender + lister (Kalender, Kapasitet, Lag-snitt, Meldinger, Oppfoelgings-koe)
4. **coachhq-D** — Spesial (Talent-pipeline, Spiller-detalj light)

Mini-batch A og B kan kjoeres parallelt hvis du har to vinduer. C bygger paa
patterns etablert i A og B. D er kortest (2 skjermer) og kan kjoeres til slutt.

---

## Innhold per mini-batch

### coachhq-A — Plan-management (5 skjermer)

Plan-byggeren og plan-management-flatene:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | 360-spillerprofil | C (7 tabs deep-dive) | Ikke relevant |
| 2 | Plan-bygger | D (6-step wizard) | Pro+ for AI |
| 3 | Plan-detalj | C (5 tabs) | Ikke relevant |
| 4 | Plan-redigering | C (5 tabs edit-mode) | Ikke relevant |
| 5 | Plan-templates (mal-bibliotek) | B (kort-grid) | Ikke relevant |

**Filer:** `coachhq-A.md`, `coachhq-A-prompt.md`, `coachhq-A-vedlegg.txt`

### coachhq-B — Operative dashboards (5 skjermer)

Aggregerte rapporter og admin-flater:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Daglig brief | G (sekvensielt narrativ) | Ikke relevant |
| 2 | Fasiliteter | G (master-detail 30/70) | Admin |
| 3 | Analytics V2 | G (multi-pane 4 kvadranter) | Pro+ |
| 4 | Revisjonslogg (audit) | G (timeline + filter) | Admin (audit.read) |
| 5 | Rapporter | G (mal-katalog + right-rail) | Hovedcoach + admin |

**Filer:** `coachhq-B.md`, `coachhq-B-prompt.md`, `coachhq-B-vedlegg.txt`

### coachhq-C — Kalender + lister (5 skjermer)

Tids- og kommunikasjons-flater:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Kalender | G (uke/maaned/agenda) | Pro+ for parallelle |
| 2 | Kapasitet | G (heatmap-grid) | Admin |
| 3 | Lag-sammenligning | C (5x6 matrise) | Ikke relevant |
| 4 | Meldinger | G (2-kolonne chat) | Pro+ for grupper |
| 5 | Oppfoelgings-koe | G (4-kolonne board) | Ikke relevant |

**Filer:** `coachhq-C.md`, `coachhq-C-prompt.md`, `coachhq-C-vedlegg.txt`

### coachhq-D — Spesial (2 skjermer)

Spesialiserte detail-flater:

| # | Skjerm | Arketype | Tier |
|---|---|---|---|
| 1 | Talent-pipeline | C (5 tabs kanban + drawer) | Ikke relevant |
| 2 | Spiller-detalj (light) | C (6 tabs kompakt) | Ikke relevant |

**Filer:** `coachhq-D.md`, `coachhq-D-prompt.md`, `coachhq-D-vedlegg.txt`

---

## Slik kjoerer du EEN mini-batch

1. **Aapne ny Claude Design-sesjon** (claude.ai/design)
2. **Last opp vedleggene** listet i `coachhq-{A|B|C|D}-vedlegg.txt`:
   - branding-style-guide.html + design-system-v2.md + alle 20 .woff2-fonts
   - felles-instruks.md (anti-state-katalog-regel)
   - coachhq-{X}.md (selve mini-batch-spec)
   - HTML-hovedskjermer + tilhoerende modaler
3. **Lim inn prompt** fra `coachhq-{X}-prompt.md` (alt fra og med "# PROMPT"-linja)
4. **Vent** mens Claude Design genererer alle skjermer i ett loep
5. **Lim design-links** tilbake til Claude Code naar ferdig

---

## Anti-state-katalog (kritisk!)

Foelg `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` eksakt:

- EEN produksjons-skjerm per HTML-fil — ikke captioned mini-mockups
- Default-state rendret i full stoerrelse (minimum 1440x900 desktop)
- Flere states (empty, moerkt tema, mobil, drawer, hover) som SEPARATE HTML-filer
- Wizard-steg (Plan-bygger i coachhq-A) leveres som SEPARATE HTML-filer per steg

---

## Sprink-regler (felles for alle 4)

- Norsk bokmaal, AE/OE/AA, komma som desimal (12,4), mellomrom som tusenseparator (1 600 kr, 142 800 kr)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, stroke 1.75
- ALDRI "God morgen, Anders" eller "Welcome back" — bruk italic observasjons-fragment
- CoachHQ-sidebar er TO-LAGS (56px moerk rail #061210 + 200px lys nav #FAFAF7) — ALDRI enkelt-lag som PlayerHQ
- Pyramide-farger: FYS `#16A34A` · TEK `#005840` · SLAG `#D1F843` · SPILL `#F4C430` · TURN `#5E5C57`

---

## Etter alle 4 mini-batches

Du har 17 CoachHQ-skjermer i produksjonsklar visuell tilstand. Sammen med
MVP-blokk 2 (PlayerHQ-kjerne, 15 skjermer) utgjoer dette MVP-runden for
AK Golf Platform.
