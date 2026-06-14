# Claude Design-prompter — Pulje F + restende udesignede skjermer

Generert 2026-05-30. Disse skjermene har **ingen preview ennå** og må tegnes i
**Claude Design** før de kan bygges i kode. (Alt som allerede har preview bygges
rett i kode — se `component-prompts.md`.)

Hver blokk under er klar til å lime inn i Claude Design. Tegn i samme disiplin som
refinement-sporet: diagnose → lever → maks 3 skjermer per runde.

---

## Felles kontekst — lim inn øverst i Claude Design-økten

```
Designsystemet er LÅST (se README i design-pakken). Hold deg til det:
- "DataGolf møter The Athletic, på Linear." Editorial sport-analytics.
- Farger: forest #005840 (primær), lime #D1F843 (kun signatur/aksent), cream #FAFAF7
  (sidebg, ikke hvit — hvit er kort), forest #0F2A22 (dark-mode bg). Pyramide-akser:
  pyr-fys/tek/slag/spill/turn. Ingen nye hex.
- Fonter: Inter (UI) · Inter Tight (display + editorial italic på <em>, text-primary) ·
  JetBrains Mono (alle tall, eyebrows, KPI). Ingen andre.
- 8pt-grid. Radius 8/12/16/20/24/full. Lucide-ikoner 1.5px. INGEN emoji, ingen unicode-symboler.
- Norsk bokmål (æ ø å). Engelske golfbegreper står (Strokes Gained, SG, drive distance).
  Tall: komma-desimal, mellomrom tusenskille, "48 %". 24-t klokke.
- Tone: datadrevet, tall først, tørr/direkte, ingen hype-ord.
- Match stilen til de eksisterende AgencyOS-previewene (agency-dashboard, agency-inbox,
  agency-player-panel) — samme tetthet, samme kort, samme mono-eyebrows.
- ÉN versjon per skjerm, lås. Maks 3 skjermer per runde.

Spillernavn-kanon: bruk ÉN konsekvent form (Berg ELLER R.P.) — lås den før du tegner,
ellers arver alle disse skjermene driften.
```

---

# RUNDE 40 — Coach-Workbench-laget (3 skjermer)

Coach-siden av Plan A. Bygger oppå PlayerHQ-workbenchen (kalender-sporet, retning A),
men legger på coach-handlinger. Hold canvas-metaforen; legg coach-laget *oppå*.

## 40.1 — Coach-Workbench (coach-visning av en spillers plan)

```
Tegn "Coach-Workbench" — coachens visning av én spillers Plan A.

Layout: samme workbench-canvas som PlayerHQ (zoom år/periode/uke/dag, akse-fokus
FYS/TEK/SLAG/SPILL/TURN, periodisering-bånd), MEN med et coach-overlay til høyre:
en "Review"-skinne (320 px) som inneholder:
  1. GODKJENNINGSKØ — spiller-foreslåtte endringer som venter (kort med VAR → FORESLÅTT,
     Godkjenn/Foreslå endring/Avvis). Gjenbruk VAR→FORESLÅTT-mønsteret fra agency-inbox.
  2. KOMMENTARER — coach kan feste en kommentar på en valgt økt i canvas (tråd med
     avatar + tid + tekst, lime venstrekant på aktiv).
  3. PLAN-HISTORIKK — versjons-diff: "Plan A v3 · endret 26. mai" med ekspander til
     hva som ble flyttet/lagt til/fjernet.
Topp: spiller-hero-strip (avatar + navn + WANG/GFGK + neste turnering + 2 KPI: SG-trend,
treningstimer denne uka). En "Rediger på vegne av"-toggle som låser opp drag-drop for coach.

Interaksjon: klikk en økt i canvas → den markeres + Review-skinnen scroller til
kommentarene for den økten. Pågående endring vises som lime puls i køen.
Mobil: Review-skinnen blir en bottom-sheet.
```

## 40.2 — Spiller-varsler (coachens signal-feed)

```
Tegn "Spiller-varsler" — coachens feed av signaler om spillerne i stallen.

Layout: enkeltkolonne liste, gruppert etter hastighet (KREVER HANDLING / FØLG OPP /
INFORMASJON), mono-caps gruppe-labels. Hvert varsel-kort:
  - venstre: spiller-avatar med presence-dot
  - midt: signal-type (mono caps: "2 ØKTER BAK", "ØNSKER VEILEDNING", "TEST FORFALT",
    "5 DG INAKTIV", "PR PÅ CMJ") + én setnings begrunnelse med tall ("Taper −0,42 SG i
    innspill, kun 2 av 6 t SLAG denne uka").
  - høyre: signal-pille (alert rød / warn amber / lime) + tidsstempel
  - bunn: 2–3 quick-actions (Legg til økt / Book / Melding / Profil), primary først.
Topp: filter-pill-bar (Alle · Ytelse · Oppmøte · Kommunikasjon · Test) + "AUTO"-sortering.
Hør på agency-dashboard "Trenger oppmerksomhet"-kortene — samme kort-DNA, men full-side
liste med flere signaltyper og gruppering.
```

## 40.3 — Spiller-historikk (handlings-tidsserie)

```
Tegn "Spiller-historikk" — en tidslinje over alt som har skjedd med én spiller.

Layout: vertikal tidslinje (mono dato-akser venstre, 1 px linje, hendelses-kort høyre),
nyeste øverst, gruppert per uke. Hendelses-typer med eget ikon + akse-farge:
  - Økt logget (pyramide-akse-farge på venstrekant), SG-utfall
  - Test tatt (verdi + delta + over/under mål)
  - Plan-endring (VAR → FORESLÅTT-mini)
  - Kommunikasjon (melding/godkjenning)
  - Milepæl (PR, turneringsresultat, HCP-endring) — lime-markert
Topp: spiller-hero-strip (gjenbruk fra 40.1) + filter-pill-bar (Alt · Økter · Tester ·
Plan · Kommunikasjon · Milepæler) + tidsrom-velger (30d / 90d / sesong / alt).
Venstre marg kan ha en tynn SG-sparkline som "ryggrad" langs tidslinjen.
Editorial: bruk ghost-number for måned-skille (stor dempet "MAI" bak hendelsene).
```

---

# RUNDE 41 — Coach-til-coach (1 skjerm)

## 41.1 — Coach-til-coach innboks

```
Tegn "Coach-til-coach innboks" — der coacher spør hverandre om råd, med spiller-kontekst.

Layout: to-pane.
  VENSTRE (320 px): tråd-liste. Hver rad: andre coachens avatar + navn + rolle-badge
    (HEAD COACH/FYS/COACH), tråd-emne, preview, ulest lime-prikk, tid. Filter-pill-bar
    øverst (Alle · Mine · Uleste · Om spiller).
  HØYRE: aktiv tråd. Øverst en EMBEDDED SPILLER-KONTEKST-kort (når tråden gjelder en
    spiller): mini-avatar + navn + WANG/GFGK + 3 mini-KPI (SG-trend, HCP, neste turn) +
    mini-pyramide vs plan + "Åpne full profil". Under: meldings-tråd (coach-bobler,
    venstre/høyre, avatar + tid), der man kan sitere en økt eller et testresultat inline
    (lite kort i bobla). Nederst: MessageComposer (To-felt forhåndsfylt med coachen,
    body, "Fest spiller-kontekst"-toggle, send).
Tone: kollegialt, kortfattet. "Hva ville du gjort med Markus' lavpunkt-vandring?"
Match agency-inbox sin rad-tetthet og agency-player-panel sin mini-KPI-stil.
```

---

# PULJE E — feilsider (2 skjermer)

## E.404 / E.500 — feilsider med emosjonell vekt

```
Tegn to feilsider: 404 og 500. Editorial, on-brand, tørr humor — ikke gymsalg-energi.

Felles: cream-bakgrunn, sentrert, stor Inter Tight display-overskrift med editorial
italic i lime/primary, mono-eyebrow over, kort brødtekst, én primary-CTA tilbake.
Valgfritt: et dempet stort ghost-tall ("404"/"500") bak teksten, eller et atmosfærisk
golf-foto (golden hour, ruff) med gradient.

404: eyebrow "FEIL · 404". Overskrift typ "Denne ballen havnet i <em>ruffen</em>."
  Brødtekst: "Siden finnes ikke — eller ble flyttet. La oss spille den tilbake på fairway."
  CTA: "Til forsiden" (primary) + sekundær "Til PlayerHQ".
500: eyebrow "FEIL · 500". Overskrift typ "Vi <em>shanket</em> denne."
  Brødtekst: "Noe gikk galt hos oss, ikke hos deg. Vi er varslet og jobber med det."
  CTA: "Prøv igjen" (primary) + sekundær "Meld fra". Liten mono-linje: feil-ID + tidsstempel.
Begge: AK-logo diskret øverst. Ingen emoji.
```

---

# Samlet status — hva trenger hva

| Pulje / del | Skjerm/komponent | Design | Kode-prompt |
|---|---|---|---|
| D | Daglig brief | ✅ preview | ✅ bygget (`r35-brief-demo`) |
| D | AgencySidebar, DataTable, indicators | ✅ preview | ✅ **bygget (Bolk 1)** |
| D | Inbox-kit, TestMatrix, FilterPillBar | ✅ preview | ✅ **bygget (Bolk 2a)** |
| D | Bookinger-form | ✅ preview | ⬜ `component-prompts.md` #6 |
| D | Team/Drift-kit | ✅ preview | ⬜ `component-prompts.md` #7 |
| D | Spiller-detalj-panel | ✅ preview | ⬜ `component-prompts.md` #8 |
| D | Multi-compare | ✅ preview | ⬜ `component-prompts.md` #9 |
| D | CommandPalette | ✅ preview | ⬜ `component-prompts.md` #10 |
| E | Foreldre (ApprovalCard, MinorGate, komm) | ✅ preview | ⬜ `component-prompts.md` #11–12 |
| E | **404 / 500** | ⬜ **design her** | etter design |
| F | **Coach-Workbench (40.1)** | ⬜ **design her** | etter design |
| F | **Spiller-varsler (40.2)** | ⬜ **design her** | etter design |
| F | **Spiller-historikk (40.3)** | ⬜ **design her** | etter design |
| F | **Coach-til-coach innboks (41.1)** | ⬜ **design her** | etter design |

**Flyt for Pulje F/E-feilsider:** design i Claude Design (prompter over) → eksporter
preview til `docs/agency-build/preview/` → bygg i kode med samme mønster som Bolk 1/2a.
