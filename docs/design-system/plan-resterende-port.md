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
- [ ] Admin `/admin/kalender` bruker v2-toolbar/mønstre (Bølge 12)
- [x] Komponenter på `T`-tokens (CSS-vars)

**Gren:** `feat/ds-f-wave8-10-rest-port` (denne)

---

### Bølge 9 · Golfdata / SG (showroom `familie-golfdata.html` + `familie-data.html`)
**Mål:** Lab viser SgTotal, SgKategorier, Diagnose, NesteFokus, ProgresjonsBar, MiniSpark.  
**Kode finnes:** `datavis.tsx`.  
**DoD:**
- [x] Lab-seksjon «Golfdata · SG · Fase 9»
- [x] Admin stall-analyse (`AdminAnalyseV2`) bruker allerede v2 TallHero/DataTabell
- [ ] PlayerHQ SG-hub full v2-port (Bølge 12 — bytter athletic → v2)

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
| Flate | Rute | Mål |
|-------|------|-----|
| Admin kalender uke | `/admin/kalender` | Notion-grid chrome + v2 tokens |
| SG / analyse | PlayerHQ analysere | SgTotal + Diagnose v2 |
| TrackMan detalj | `/portal/mal/trackman/[id]` | Visuelt i tråd med showroom |
| Booking admin | booking-lister | BookingKort v2 |

**Regel:** layout/chrome først — ikke ny forretningslogikk.

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
Ferdig   → Bølge 11 feedback/structure   ← forrige PR
Nå       → Bølge 12 én flate om gangen (kalender → SG → TM)
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
