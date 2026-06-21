# BYGGELOGG — flaggede avgjørelser & blokkeringer (autonom skjermbygg)

> Samlet liste over ting den autonome skjermbygg-loopen har FLAGGET (ikke fabrikert/gjettet)
> — for Anders' gjennomgang. Loopen bygger det klart fasit-bestemte og flagger resten her.
> Oppdateres per iterasjon. Branch: `feat/terminal-lys-build`.

---

## BLOKKERT på parkerte/ubygde funksjoner (krever Anders' input + ny logikk)

### B-1 · Statistikk «diagnose-først» blokkert på A–K-nivåsystem
- **Skjerm:** `/portal/statistikk` (Fase 3.3). Fasit: «PlayerHQ Statistikk-SG (terminal-lys).dc.html».
- **Problem:** Ny fasit er «diagnose-først» — dominante elementer er **«SITT NIVÅ NÅ»** (nivå «Nordic», «82 % til neste · Challenge Tour», mot tour-baseline) + **«LUKK DISSE TIL NESTE NIVÅ»** (3 rangerte slag-gevinst-gap). Begge krever:
  1. **A–K snittscore-nivåstige** — PARKERT, 0 kode, venter på dine 11 grenser ([KONFLIKTER K-04]).
  2. **«Neste nivå»-motor** — finnes ikke (DATA-INVENTORY §4); `diagnostiserSg()` finnes men er frakoblet.
- **Handling:** Ikke fabrikert nivå/prosent. Skjerm står på dagens «Statistikk-hub» (fungerende, eldre layout). Markert ⚠ i SKJERM-STATUS.
- **Trenger fra deg:** (a) de 11 A–K-grensene, (b) grønt lys til å bygge nivå/neste-nivå-motoren (stort, egen oppgave). Til da kan ikke diagnose-først-skjermen fullføres.
- **Sannsynlig bredere:** flere PlayerHQ-skjermer (Statistikk, evt. Dashboard-nivåhint, talent) bruker samme nivå-stige → samme blokkering.

---

## DATA-GRENSER (bygd det mulige, utelatt fabrikert data)

### D-1 · Analyse 4-KPI-grid + tour-snitt + SG-trend-stil
- **Skjerm:** `/portal/analysere` (commit 15e2087b). SG-modulen portet ✅.
- **Utelatt (ikke fabrikert):** 4-KPI-grid (GIR%/PUTTS/UP&DOWN — finnes i statistikk-datalaget fra HoleScore, kan kobles senere), «VS TOUR-SNITT»-toggle (ingen tour-sammenligningsdata), SG-trend som søylediagram (app har TrendBand-linje).
- **Handling:** Markert 🔨. Kan kobles når/hvis ønsket — krever datalag-utvidelse, ikke ny beslutning.

---

## IA-NOTATER (bygd per låst beslutning, men verdt et blikk)

- **Analyse-faner:** app har 4 (SG/Runder/TrackMan/Tester), fasit viser 5 (Analyse/TrackMan/Runder/SG/Tester). Bygd som 4 per låst «Analyse = én flate med faner» — «ANALYSE» vs «SG» som separate faner virker redundant i fasiten. Ikke restrukturert unilateralt.

---
*Loopen fortsetter med skjermer som IKKE er blokkert. Blokkerte/parkerte føres her til du tar stilling.*
