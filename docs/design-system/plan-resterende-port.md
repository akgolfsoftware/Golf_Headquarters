# Plan · Resterende designport (Open Design → akgolf-hq)

**Dato:** 2026-07-26  
**Fasit:** Open Design «Designsystem-plan komplett»  
**Repo:** `~/Developer/akgolf-hq`  
**Auto-yes:** Orkestrator kjører uten stopp mellom bølger; merge til main bare når Anders sier merge.

---

## Hvor vi er (etter Fase 7 / PR #148)

| Ferdig | Innhold |
|--------|---------|
| Tokens + lys default | `--v2-*`, lime-disiplin |
| Core + forms | knapper, kort, skjemafelt |
| Domain top 5 | SpillerKort, OktKort, Anbefaling, Oppgave, LiveBar |
| 3 flaggskip-flater | cockpit, player uke, coach workbench (kablet) |
| Overlays + nav | Modal, Ark, Skuff, Toast, Banner, FAB, 44px |

**MVP-redesign = ferdig.** Resten er full showroom-port + flere produktflater.

---

## Gullregler (uforandret)

1. AgencyOS — aldri «CoachHQ» i UI  
2. Lys default · lime bare mørk primær-CTA · delta = up/down  
3. Mono-tall · tom = — · demo merkes «eksempel»  
4. Lucide stroke 1.5 · touch ≥ 44px · norsk  
5. Showroom er fasit — ikke «forbedre» design  
6. Én PR per bølge · verify før merge  

---

## Resterende bølger

### Bølge 8 · Kalender (showroom `familie-calendar.html`)
**Mål:** Lab viser UkeGrid, TidsGrid, MndKalender, DagStripe, AgendaRad, VisningsVelger.  
**Kode finnes:** `src/components/v2/kalender.tsx` (bruker allerede `T` / CSS-vars).  
**DoD:**
- [x] Lab-seksjon «Kalender · Fase 8»
- [x] Admin `/admin/kalender` bruker v2-toolbar/mønstre (levert i Bølge 12a)
- [x] Komponenter på `T`-tokens (CSS-vars)

**Gren:** `feat/ds-f-wave8-10-rest-port` (denne)

---

### Bølge 9 · Golfdata / SG (showroom `familie-golfdata.html` + `familie-data.html`)
**Mål:** Lab viser SgTotal, SgKategorier, Diagnose, NesteFokus, ProgresjonsBar, MiniSpark.  
**Kode finnes:** `datavis.tsx`.  
**DoD:**
- [x] Lab-seksjon «Golfdata · SG · Fase 9»
- [x] Admin stall-analyse (`AdminAnalyseV2`) bruker allerede v2 TallHero/DataTabell
- [x] PlayerHQ **analysere** (kanonisk analyse-flate) bruker fasit-kortene (Bølge 12b)
- [ ] PlayerHQ **SG-hub** under `(legacy)/mal/sg-hub` er fortsatt athletic-basert —
      egen jobb, ikke dekket av 12b (10+ underruter, `components/portal/sg-hub/`)

---

### Bølge 10 · TrackMan (showroom `familie-trackman.html`)
**Mål:** Lab viser DispersionPlot, TrajectoryPlot, TrackmanSammendrag, KolleStatKort, LaunchWindow.  
**Kode finnes:** `spesialviz.tsx` + `datavis.tsx`.  
**DoD:**
- [x] Lab-seksjon «TrackMan · Fase 10»
- [ ] Produksjons-TM-side gjenbruker v2-plot (Bølge 12 — rådata-format er annerledes)

---

### Bølge 11 · Feedback + structure rest
**Fasit:** `familie-feedback.html`, `familie-structure.html`  
**Scope:** AiTipCard, hjelp-boble, stepper, filter-pills, skeleton parity  
**Kode:** ny `src/components/v2/tilbakemelding.tsx` (AiTipKort, TipTall, ListeIkon,
UlestPrikk, RadMeta) + `Stegviser`/`Skilje` i `struktur.tsx`. HjelpPopover,
ValideringsChip, Skjelett, Trekkspill, FilterChips og MeldingsTraad fantes fra før.

**DoD:**
- [x] Lab-seksjon «Feedback · struktur · Bølge 11»
- [x] Barrel eksporterer `tilbakemelding.tsx`
- [x] Lime-disiplin: AI-tipsets merke + nøkkeltall er lime-jobben, handlingen er forest
  (verifisert i nettleser: mørk metrikk `#D1F843`, CTA `#005840`; lys metrikk `#005840`)
- [x] 44px på AI-tipsets CTA · em-dash for tomt tall · 390px uten sidescroll
- [x] Emoji fjernet fra lab-statuslisten (invariant 4) — Lucide-ikoner i stedet

---

### Bølge 12 · Produktflater (dypere enn Fase 3)
| Flate | Rute | Mål | Status |
|-------|------|-----|--------|
| Admin kalender uke | `/admin/kalender` | Notion-grid chrome + v2 tokens | ✅ 12a |
| SG / analyse | PlayerHQ analysere | SgTotal + Diagnose v2 | ✅ 12b |
| TrackMan detalj | `/portal/mal/trackman/[id]` | Visuelt i tråd med showroom | ⬜ 12c |
| Booking admin | booking-lister | BookingKort v2 | ⬜ 12d |

**Regel:** layout/chrome først — ikke ny forretningslogikk.

#### 12a · Admin kalender (levert)
Fasit: `familie-calendar.html` `.cal-toolbar` — «Visning først», «Segmentert — ikke lime».

- [x] Toolbar i fasit-rekkefølge: «I dag» · piler · periode-tittel · spacer · segmentert velger
      (erstatter hjemmesnekret PillVelger-rad uten periode-tittel)
- [x] Piler/«I dag»: 32px firkant m/ radius 8 som fasit — 44px på mobil for touch
- [x] `periode` lagt til `KalenderData` («20.–26. juli 2026») — kun chrome-tekst, ingen ny logikk
- [x] `SegmentertFaner`: valgt segment = panel + `--v2-seg-skygge`, **ikke** lime
      (fasit `.seg button[aria-selected="true"]`). Lime-jobben er «Ny økt».
- [x] Nytt token `--v2-seg-skygge` (lys `0 1px 4px rgba(23,27,24,.12)` / mørk `…rgba(0,0,0,.25)`)
- [x] `ariaLabel` på `SegmentertFaner` — skjermleser-navn uten synlig feltetikett
- [x] Uke-KPI-ene satt til `instant`: tell-opp-fra-0 var umulig å skille fra ekte 0
      (og stod fast på 0 hvis fanen lastes i bakgrunnen). Verifisert 5 · 2 · 1.
- [x] Verifisert lys + mørk + 390px: forest CTA i lys, ingen sidescroll, TimeGrid urørt
- [ ] Månedsvisning er fortsatt ærlig tom tilstand — krever egen måneds-loader (ikke chrome)

#### 12b · SG / analyse (levert)
Fasit: `familie-golfdata.html`. `/portal/analysere` var alt v2, men brukte hjemmesnekret
SG-nedbrytning og «Resept»-kort i stedet for fasit-kortene.

- [x] `SgKategorier` erstatter `FordelingRad`-loopen — nullinje i midten
      (gevinst høyre / tap venstre) + «størst tap»-markør, som showroomet
- [x] `Diagnose` erstatter det ad-hoc «Resept»-kortet — symptom → bevis → resept
- [x] `NesteFokus` erstatter `InnsiktChip`-fallbacken
- [x] `SlagLekkasje` koblet til `nesteFokus.lekkasjeBaand` — data loaderen alt
      regnet ut, men som aldri ble vist noe sted
- [x] `bevis={null}` på Diagnose: kontrakten bærer ingen spiller-vs-baseline-verdi,
      og fabrikkerte bevis-søyler er verre enn ingen

**Presisjon (viktig):** fasit-kortene formaterte SG med 1 desimal. Ekte per-område-SG
ligger så tett at det gir «−0,0» på alle fire og skjuler rangeringen — nettopp det den
fjernede `fmtSg2`-hjelperen fanget. `SgKategorier` og `SlagLekkasje` har derfor fått
`desimaler?: 1 | 2` (default 1 = fasit), og flaten sender 2. I SlagLekkasje pekte
1-desimal-tallet og heat-fargen i praksis i ulik retning.

**Døde knapper:** `Diagnose`/`NesteFokus` rendret en `CTAPill` uten handling — en ekte
`<button>` uten onClick. Nye `ctaHref`/`handlingHref` gjør knappen til en lenke; utelates
de, rendres ingen knapp. Labben sender ekte href.

**Én primær handling:** begge kortene pekte til samme `handlingHref`, altså to like
lime-CTA-er. Når Diagnose vises eier DEN handlingen; uten diagnose er NesteFokus sin
CTA den eneste.

**Bevisst avvik fra fasit:** SG-total beholder `TallHero` + `Trend` framfor
showroomets enklere `SgTotal`-kort. `SgTotal` har ingen trendgraf, og flaten har
ekte `trendPunkter` — å bytte ville fjernet reelle data for å matche et bilde.

---

### Bølge 13 · Marketing (`familie-marketing.html`)
Forside/coaching er delvis levert (PR #139). Rest: priser, kontakt, blogg-chrome.  
**Lav prioritet** vs AgencyOS/PlayerHQ.

---

### Bølge 14 · Hardening
- CoachHQ-grep = 0 i UI  
- Lime/lys CTA-audit  
- 44px pass  
- Oppdater `REACT-PORT.md` + denne planen  
- Visuell stikkprøve lab lys+mørk  

---

### Utenfor denne porten
- Dommerskjermer (eget OD-prosjekt)  
- Alle 361 ruter pixel-perfect  
- Live data i Open Design-showroom  
- Ny merkevare / palette  

---

## Rekkefølge (anbefalt)

```
Ferdig   → Bølge 8–10 (lab + parity)
Ferdig   → Bølge 11 feedback/structure
Ferdig   → Bølge 12a admin-kalender
Ferdig   → Bølge 12b SG/analyse            ← forrige PR
Nå       → Bølge 12c TrackMan → 12d booking
Sist     → Bølge 13 marketing + 14 hardening
```

**ADHD-minimal:** 8 → 9 → 10 lab grønn · deretter bare admin-kalender · deretter ferdig for «synlig progress».

---

## Suksessbilde (når ALT er ferdig)

1. `/design-system` viser alle showroom-familier i lab  
2. Kalender, SG-diagnose og TrackMan i app føles som showroom  
3. Null CoachHQ · lime-disiplin · mono · 44px  
4. Denne filen har alle DoD avkrysset  

---

## Statuslogg

| Dato | Hva |
|------|-----|
| 2026-07-26 | Plan skrevet · Bølge 8–10 lab startet på `feat/ds-f-wave8-10-rest-port` |
| 2026-07-26 | Bølge 8–10 merget (PR #149) |
| 2026-07-26 | Bølge 11 levert på `feat/ds-f-wave11-feedback-struktur`: `tilbakemelding.tsx`, Stegviser, Skilje, lab-seksjon, emoji-fiks. Neste: Bølge 12 admin-kalender |
| 2026-07-26 | Bølge 12a levert på `feat/ds-f-wave12a-kalender-toolbar`: Notion-toolbar på `/admin/kalender`, segment ikke lime (`--v2-seg-skygge`), `periode` i KalenderData, KPI `instant`. Neste: 12b SG/analyse |
| 2026-07-26 | Bølge 12b levert på `feat/ds-f-wave12b-sg-analyse`: SgKategorier/Diagnose/NesteFokus/SlagLekkasje på `/portal/analysere`, `desimaler`-prop mot «−0,0»-kollaps, ekte CTA-lenker. Neste: 12c TrackMan |
