# SKJERM-BYGGEPLAN — Fase 3→8 (bygge alle skjermer til riktig design)

> Hvordan vi bygger ~150 skjermer fra design-fasiten til lanseringsklart, med 0 avvik.
> Bygger på: `BYGGEORDRE-komplett.md` (rekkefølgen), `design-porting-gate.md` (kvaliteten per skjerm),
> `SKJERM-STATUS.md` (sporingen). Laget 2026-06-21 etter at Fase 2 (struktur-opprydding) ble ferdig.

---

## 0 · Mål & «ferdig»

**Mål:** Hver skjerm bygget i terminal-lys-design fra fasiten, koblet (ingen døde knapper), responsiv (375/768/1280), med 4 tilstander (innhold·tom·laster·feil), 0 avvik mot fasit-skjermbildet.

**Ferdig per skjerm = alle 6 hakene i `SKJERM-STATUS.md` grønne** (Bygget · Knapper · 375 · 768 · 1280 · 4-states · DoD). **Ferdig totalt = live på domenet** (Fase 8).

Utgangspunkt nå: skjermene finnes allerede i koden, men mot et ELDRE design. Jobben er å **porte hver til den nye 21.juni-fasiten** og verifisere.

---

## 1 · Kvalitetsmotoren — design-porting-gaten (gjelder HVER skjerm)

Dette er det som hindrer «nesten riktig». 5 steg per skjerm:

1. **Bygg FRA fasiten, ikke fra minne.** Les `.dc.html`-referansen + skjermbildet. Lag element-liste (hero, hver seksjon, hvert tall, rekkefølge). Bygg fra lista.
2. **Skjermbilde av min versjon** (Playwright, riktig bredde: PlayerHQ 430px, AgencyOS ~1280px).
3. **Uavhengig kritiker-agent** får fasit-bilde + min-bilde + element-lista. Oppgave: FINNE avvik (topp, rekkefølge, farge, tekst, manglende/ekstra element, layout). Den er kritiker, ikke heiagjeng.
4. **Fiks hvert avvik → re-screenshot → re-diff. Loop til 0 avvik.**
5. **Først da:** marker grønt i `SKJERM-STATUS.md` + commit.

**Effektivisering:** når en klynge er bygget, kjøres kritiker-agentene **parallelt** (én per skjerm) — så fiks-runden samles.

---

## 2 · Oppsett (engangs, før første skjerm)

- [ ] **Verifiser/juster screenshot-harness** til den nye flate handover-en. Dagens `design-shot.mjs` peker på gammel (tom) `AK Golf HQ Design System/`-mappe og en React-prototype. Nye fasit-filer er selvstendige `.dc.html` (bruker `ds/tokens.css` + `support.js`) — serveres direkte. Lag/juster ett script som tar fasit-bilde av en `.dc.html` + ett som tar app-bilde av en rute.
- [ ] **Testspiller-data** seedet (screentest@akgolf.test finnes) så app-skjermene har ekte innhold i alle 4 tilstander.
- [ ] **Primitiver (BYGGEORDRE Fase 1) verifisert til stede:** Ticker, KpiGrid/KpiCell, DataCard (mørk), SgBar, Avatar (lime-ring), Logo-slot, 4-states, Command Palette. Disse arves av alle skjermer — bygg/fiks først hvis avvik.
- [ ] **Skall + responsiv-rigg (Fase 2) verifisert:** PlayerHQ 5-fane (bunn<md / sidebar≥md), AgencyOS 54px-rail, 6 responsmønstre (tabell→kort, KPI 4→2×2, master-detalj, kanban→liste, kalender→agenda, wizard sticky-CTA). Nav-ruter er allerede ryddet (Fase 2 ✓).

---

## 3 · Byggrekkefølge (klynger — fra BYGGEORDRE DEL 2)

Bygg ovenfra og ned. Hver klynge = én arbeids-bolk med felles commit.

### FASE 3 — PlayerHQ flate for flate (kjernen, ~55–65 skjermer)
1. Dashboard/Hjem `/portal`
2. Analyse `/portal/analysere` (+hull, sammenlign, putting)
3. Statistikk `/portal/statistikk` (faner SG·Runder·TrackMan·Tester·Trend)
4. Datainntak: TrackMan-økt · manuell SG-import · on-course logging
5. Plan/Workbench *(kun visuell skinn — STOPP og spør Anders ved kollisjon)*
6. Gjennomføre & Live (+ L-faser, fullskjerm live)
7. Coach-hub (melding, notater, Q&A, planer, øvelser, AI)
8. Talent & utfordringer (mot proffene)
9. Turneringer (+detalj, ny)
10. Tester & drills
11. Meg-hub + ~30 undersider (abonnement, helse/sikkerhet, utstyr/dok/innstillinger)
12. Varsler

### FASE 4 — AgencyOS flate for flate (~45–55 skjermer)
Cockpit · Stall & spiller · Planlegge & planer · Teknisk-plan/drills/tester · Kalender & booking · Gjennomføre & opptak · **Handlingssenter (samle-skjerm — K-14 Fase-4-bygg)** · **Analyse-fane-flate (K-18 Fase-4-bygg)** · Talent-modul · Caddie & agenter · Workspace · Økonomi · Admin & innstillinger.
*Inkluderer de utestående KONFLIKTER-skjermbyggene: anlegg-kalender, handlingssenter-samleflate, analyse-faner.*

### FASE 5 — Auth · Forelder · Booking · Marketing
Auth/onboarding · Booking ende-til-ende (wizard) · Forelderportal (lesemodus, mobil-først) · Marketing-sider (editorial beholdes, fullfør STUB-er).

### FASE 6 — Stats-plattform `/(marketing)/stats/*` (eget spor, ~30 sider)
Eget visuelt uttrykk, DataGolf-drevet. Mange STUB-er å fullføre. Kan kjøres parallelt etter Fase 1.

### FASE 7 — Døde knapper, QA & komplett-gate
Lenke-revisjon (hver href/router.push → levende mål), ordbok-sjekk, Lucide-sjekk, 4 states × 3 bredder per skjerm. Lever `SKJERM-STATUS.md` 100% grønn.

### FASE 8 — Deploy til Vercel & live
`90-DEPLOY-VERCEL.md`. **STOPP og spør Anders før første prod-deploy + før live Stripe-nøkler.**

---

## 4 · Arbeidstakt (per økt)

- **Én klynge om gangen** (f.eks. «Dashboard» eller «Meg-undersider»). Bygg alle skjermene i klyngen → kjør kritiker-agentene parallelt → fiks til 0 avvik → oppdater `SKJERM-STATUS.md` → **én commit per klynge** (build-verifisert: `tsc --noEmit && npm run build`).
- **Etter Fase 3 (PlayerHQ) og Fase 4 (AgencyOS):** rute-for-rute-status til Anders (✓ eller ⚠ + hva som mangler).
- **Alt på branch `feat/terminal-lys-build`** til en fase er komplett + verifisert, så merge til main i kontrollerte bolker (merge-disiplin).

## 5 · Sporing

`docs/SKJERM-STATUS.md` (325 rader) er fremdrifts-tavlen. Oppdateres i SAMME commit som skjermen bygges. Dashboard-tall + endringslogg oppdateres per klynge. **Ingen skjerm «ferdig» før alle 6 haker er grønne.**

## 6 · Stopp-porter (jeg spør, velger ikke selv)

1. **Workbench** — enhver funksjonskollisjon (kun visuell skinn ellers).
2. **FYS-resultatformel** — plassholder-tall, ingen referanseverdier hardkodes (parkert).
3. **A–K snittscore-bånd** — venter på Anders' 11 grenser.
4. **Før første prod-deploy + før live Stripe.**

## 7 · Omfang & ærlig estimat

- **~150 unike skjermer** (325 ruter gruppert), 95 pikseltegnede fasiter + resten via mønster.
- **Fler-økts-arbeid.** Takt: 1–3 klynger per økt avhengig av størrelse. Grovt: PlayerHQ (Fase 3) ~5–8 økter, AgencyOS (Fase 4) ~5–8 økter, Fase 5–6 ~4–6 økter, Fase 7 QA ~2–3 økter, Fase 8 deploy 1 økt + dine go-er.
- Dette er ikke «ferdig på et øyeblikk» — men hver økt gir committet, verifisert fremgang du kan se i `SKJERM-STATUS.md`.

---
*Neste konkrete steg: Oppsett (§2) → FASE 3 klynge 1 (PlayerHQ Dashboard `/portal`).*
