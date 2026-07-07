# Design-bølgeplan — hele plattformen til v13

> Skrevet 2026-07-06. Underordnet [`skjermplan-master.md`](skjermplan-master.md) (som eier scope og
> produkt-bølgene 0–7). Denne planen dekker DESIGN-sporet: hvordan alle skjermer kommer på v13,
> i hvilken rekkefølge, og hva som er montering vs. ekte designarbeid.
> Strategivalg (Anders 2026-07-06): **komponér fra v13 — ikke ny Claude Design-runde, ikke fargeflikk.**

## Fakta-grunnlag (målt 2026-07-06)

- **Kit:** 103 komponenter i `public/design-handover/components/` (data 19 · domain 22 · golfdata 14
  · forms 12 · struktur 9 · overlays 8 · calendar 8 · core 7 · trackman 4 · feedback 4 · kategori 3
  · nav 2 · marketing 1). **25 portert** til `src/components/athletic/golfdata/` — 78 gjenstår,
  portes just-in-time per skjerm (aldri på forskudd).
- **Skjermer:** 387 ekte skjermer i dekningskartet. Bekreftet på v13 i dag: PlayerHQ Hjem/Planlegge/
  Gjennomføre/Analysere/Meg + AgencyOS Spillere/Spiller-analyse. Resten måles på nytt i D0.
- **MASTER-SKJERMPLAN.md er stale:** «Design=✓» måler mot en død gate. Må rebaselines før vi
  stoler på tallene.
- **Claude Design brukes KUN til ⬜-skjermene** i DEKNINGSKART.md (genuint nye mønstre: wizard-flyter,
  kart/region, SG-Hub-underanalyser, live-tavler). Alt annet er montering fra kit + de to templatene.

## Lån fra AK Golf Intelligence DS (eget produkt — kun komponenter)

Samme token-kjede (forest/lime, JetBrains Mono, samme tema-modell) → ren kopi inn i kit-et, ingen
re-skinning. Kandidater (tas inn i den bølgen som trenger dem, ikke før):

| Komponent | Hva | Inn i bølge |
|---|---|---|
| ProtocolScorecard | Testprotokoll-scorekort (entry/compact/print, live input) | D3 (tester/coach) |
| SGRadarChart | 5-akse SG-radar m/ PGA-benchmark | D2 (analyse-dybde) |
| TeeStrategyPlanner | 18-hulls tee-strategi m/ SG-effekt | D2/D3 (DECADE-flater) |
| StatBox m/ delta | KPI-tile med endrings-chip | D1 (sammenlign mot kit-KpiTile først) |
| TournamentCard + SessionHistoryList | Turneringskort + rundehistorikk | D2 |

## Bølgene

**D0 — Rebaseline + fundament (1 økt)**
Mål: sann måling før vi bygger.
1. MASTER-SKJERMPLAN.md: nullstill «Design»-kolonnen mot v13-kriteriet (komponert fra kit/golfdata),
   re-merk kun bekreftede skjermer. Fjern stale-varselet når gjort.
2. Verifiser at alle fire tema-matriser (PlayerHQ lys/mørk + AgencyOS mørk/lys) er komplette i
   `globals.css`-tokens — PORTING.md steg 1.
3. Kopiér de 5 Intelligence-komponentene inn i kit-et (`components/` + prompt.md-stubber) så de er
   tilgjengelige når bølgene trenger dem.
→ verify: skjermplan-dashboardet viser ærlige tall; tsc + build grønt.

**D1 — Kjerneloopen ferdig (2–3 økter) — speiler produkt-bølge 3+4**
Loopen ER produktet: Workbench v2 visuell redesign + Live-økt v2 på v13. Dette er de eneste
skjermene der design og funksjon bygges samtidig (produkt-bølgene er alt i gang her).
Skjermer: Workbench 7 faner (spiller + coach-speil), Live-økt (spiller + coach).
→ verify: ak-designekspert-dom per skjerm, mobil 390px + desktop, begge temaer der relevant.

**D2 — AgencyOS komplett (2–3 økter)**
Desktop-first. ~26 nav-skjermer har paritet fra Fase 3/4 — de re-dømmes mot v13 (mange blir godkjent
som de er, det er ikke omkamp). Ekte jobb: Innsikt-hub, Runder, Analytics, Økonomi (delvis mock),
Godkjenninger, Innboks, Gjennomføre-undersider, Workspace, Admin/org-sidene.
Montering fra `agencyos-dashboard`-templaten. Claude Design kun for ⬜-merkede.
→ verify: alle AgencyOS-rader grønne i skjermplanen.

**D3 — PlayerHQ undersider + Coach-seksjonen (2 økter)**
Mobile-first 390px. Coach-seksjonens 7 skjermer (alle Design=– i dag: Coach-hub, Meldinger,
Meldingstråd, Coach-planer, Coach-øvelser, Coach-videoer, Spørsmål) + analyse-undersider, tester,
drills, mål. Montering fra `playerhq-skjerm`-templaten. ProtocolScorecard inn her.
→ verify: alle PlayerHQ-rader grønne.

**D4 — Booking + Forelder + Auth (1–2 økter)**
Booking-flyt (detalj, bekreft, wizard), Forelderportalens 11 skjermer, Auth-flatene (38 ruter, mange
er varianter av samme mal). Mest montering; Forelder-skjermene har hybrid-design i Final-eksporten
som referanse for IA (ikke fasit — v13 er fasit).
→ verify: booking ende-til-ende i preview + forelder-samtykkeflyt.

**D5 — Marketing (1–2 økter)**
72 sider, men lav kompleksitet og èn marketing-komponentkategori i kit-et som må vokse. Prioriteres
sist MEN før 1. august (betaling starter — forsidene må konvertere). Avhenger av at akgolf.no-DNS
pekes om (P0-blocker, eget spor).
→ verify: Lighthouse + tekst mot `docs/skjermtekst/`.

## Regler som gjelder hele planen

1. **Ingen skjerm uten rad:** finn raden i MASTER-SKJERMPLAN.md, oppdater hakene i samme commit.
2. **Porting just-in-time:** aldri port komponenter en bølge ikke trenger.
3. **Gap meldes, ikke improviseres** (skjermkomposisjons-kontrakten). Mangler kit-et noe → ⬜-liste
   → egen Claude Design-bestilling, aldri frihånds-design i kode.
4. **ak-designekspert dømmer hver ferdig skjerm** før raden merkes grønn.
5. **Diff-to-null:** tokens, aldri rå hex; lime aldri på lys flate.
6. **Én bølge om gangen.** Detaljplan per bølge lages i plan-mode mot faktisk repo-tilstand når
   bølgen starter (masterplan-regelen).

## Estimat

| Bølge | Økter | Kan starte |
|---|---|---|
| D0 | 1 | nå |
| D1 | 2–3 | etter D0 |
| D2 | 2–3 | etter D1 (eller parallelt i egen worktree) |
| D3 | 2 | etter D1 |
| D4 | 1–2 | etter D3 |
| D5 | 1–2 | når som helst etter D0, senest før 1. aug |
| **Sum** | **9–13 økter** | |

## Endringslogg
- 2026-07-06: Opprettet. Strategivalg låst: v13-komposisjon, ikke ny designrunde. Intelligence-DS
  identifisert som komponentkilde (samme tokens), 5 lånekandidater.
