# Design-porting-gate (LÅST regel)

Når en skjerm portes fra det ferske designet (`docs/design-handover-2026-06-24/`) til kode, MÅ denne gaten følges. En skjerm er IKKE «ferdig» og vises IKKE til Anders før gaten er bestått. Dette finnes fordi porting «fra minne/eksisterende kode» gir «nesten»-resultater som avviker fra fasit.

## Gaten — 5 steg per skjerm

1. **Bygg FRA design-kilden, ikke fra eksisterende kode.**
   Les kilden under `docs/design-handover-2026-06-24/`: `SKJERMER.md` (billedkatalog) + `NAVIGASJON-knapp-til-rute.md` (knapp→skjerm-kart) + matchende skjermbilder.
   Lag en **element-liste** (hero-topp, hero-bunn, hver seksjon, hvert tall/tekst, rekkefølge).
   Bygg implementeringen fra lista — ikke ved å modifisere det som allerede finnes.

## Låst kilde-regel (MÅ følges)

All design-referanse i kode, kommentarer, commits, prompts og interne dokumenter **MÅ** peke til den gjeldende design-kilden:

- `docs/design-handover-2026-06-24/` (Claude Design-handover, juni — eneste git-sporede kilde, se `README.md` der)

**Forbudt:**
- `public/design-handover/` — kun en lokal maskin-cache (gitignored). Den følger IKKE med repoet til andre maskiner/sesjoner og skal aldri være fasit i en regel eller et diff-oppdrag. Hvis noe herfra trengs, flytt det inn i en git-sporet `docs/design-handover-*/`-mappe først.
- `wireframe/`
- `design-package/`
- `design-files-v2/`
- `docs/design-handoff-komplett/`
- Gamle wireframe-HTML eller arkiverte handoffs

Gamle referanser skal enten fjernes, flyttes til `_archive/` eller oppdateres ved første touch av filen. Diff-agenter og kode-review skal flagge brudd på denne regelen.

Bruk kun gjeldende design-handover som fasit for porting.

Ved en NY handover (zip/tar.gz fra Claude Design): pakk ut til en fersk, dato-stemplet `docs/design-handover-YYYY-MM-DD/`-mappe, commit den, og oppdater datoen i denne regelen + i CLAUDE.md sin «Ferskt design»-linje i samme commit.

2. **Screenshot implementeringen.**
   Playwright mot riktig bredde (PlayerHQ 430px, AgencyOS ~1280px), full-page.

3. **ADVERSARIAL diff — egen agent, ikke meg selv.**
   Spawn en subagent med: design-screenshot (fra handover) + min screenshot + element-lista.
   Oppgaven er å **FINNE avvik** — den er kritiker, ikke heiagjeng. Den lister hvert avvik
   (topp, rekkefølge, farge, tekst, manglende/ekstra element, layout). Default: anta avvik
   finnes til den har lett grundig.

4. **Fiks til 0 avvik.**
   Rett hvert avvik, re-screenshot, kjør diff på nytt. Loop til agenten finner **0 avvik**.

5. **FØRST DA** vises skjermen til Anders / merkes ferdig.

## Bevisste unntak (Anders-beslutninger som overstyrer designet)

Dokumenteres her så diff-agenten måler mot riktig fasit:

- **PlayerHQ-hjem hero:** beholder **profilbilde + tier-pill** øverst (Anders' valg 2026-06-02),
  selv om designet har dato-eyebrow + vær der. Resten av hero (greeting + samlet headline) følger designet.
- **Tier-pill-tekst (alle hero-pills, mobil + desktop):** viser **«PlayerHQ · {tier}»** (+ «· HCP {hcp}» på desktop),
  IKKE designets «Performance Pro». Performance/Performance Pro er **coaching-pakker, ikke app-nivåer** (CLAUDE.md låst beslutning) — skal aldri vises som app-nivå. Vær-linje i hero-topp utelates der appen ikke har vær-data.
- **Undersider mobil-topbar (2026-06-10):** appen bruker den globale PortalShell-topbaren (hamburger + PLAYERHQ) på
  undersider, IKKE fasitens sub-topbar med tilbake-pil + sidetittel. Delt shell-chrome-unntak (samme linje som
  hovedskjermene); tilbake-navigasjon skjer via nettleser/bunn-nav. Diff-agenter skal ikke flagge dette.

- **Knappestil (2026-06-10):** appens etablerte knapp-idiom er **rounded-full pill + mono 12px bold uppercase**
  (samme på alle portede skjermer), der fasit-CSS har radius-12 + display-font 14px sentence-case.
  Godkjent som app-bredt mønster — diff-agenter skal ikke flagge knapp-form/typografi som følger idiomet.
  (Farger/høyder/innhold skal fortsatt matche fasit.)

### AgencyOS (Fase 3, 2026-06-10)

- **Initialer følger navnet, ikke fasit-JSX:** fasiten hardkoder «MB» som Øyvind Rohjans avatar-initialer
  (levning fra gammelt navn Markus Berg). AKDATA (kanonisk kilde i samme fasit) sier `initials: "ØR"`.
  Appen avleder initialer fra ekte navn → **ØR**. Alle avatar-initialer = ekte initialer fra DB-navn.
- **Demo-tekster er data, ikke UI:** fasit-tekster (meldinger, oppgaver, navn) kommer fra seedet DB-innhold.
  Avvik i KONKRETE tekstinnhold (annen ordlyd i en melding) er IKKE design-avvik — struktur, rekkefølge,
  typografi, farger og element-typer er det som måles.
- **Forespørsler-typer:** appens /admin/foresporsler viser kun SessionRequest (alle «Booking»-chip).
  Fasitens blanding Booking/Melding/Råd kommer når meldinger/råd unionnes inn (IA-beslutning utestår).
- **Oppgaver-skjermen beholder arbeidsverktøyet:** view-toggle (liste/kanban/kalender), WorkspaceTabs og
  full kolonne-tabell beholdes (Notion-synket funksjon) — fasitens enkle 5-raders liste er underlag for
  header/stil, ikke funksjonsnedskjæring.
- **Topbar-avatar har ekte meny** (Innstillinger/Logg ut) — fasiten har toast-demo.
- **Dashboard-underruter** (live/uka/økonomi/caddie/spillere) har fane-rad rendret fra
  `src/app/admin/agencyos/layout.tsx` (fasiten har ingen) — IA-beslutning tatt (docs/ux-arkitektur.md
  Del 5). Diff-agenter skal ikke flagge fane-raden som avvik.
- **Haster-chip har lesbar tekst:** fasit-CSS `chip-lime` gir lime tekst på lime flate i mørkt tema
  (render-bug — chipen ser tom ut i fasit-PNG). Appen bruker lime bakgrunn + mørk tekst. Tilsiktet.
- **Avatar-toner i lister er regelstyrt:** lime = spilleren har økt i dag, pri = haster-kort, ellers
  nøytral m/ subtil ring (fasit-utseendet). Fasit hardkoder tonene per rad — appen avleder fra data,
  så HVILKE rader som er lime kan avvike fra fasit-PNG (data, ikke design).
- **Tildelt meg-ikon:** topp-/venstrejustert i 36px-felt (fasit-PNG-utseende; fasit-JSX hadde sentrert boks).
- **Knappebredder ±2-7 css px:** next/font-rendret Inter Tight måler marginalt smalere enn fasitens
  CDN-font på identisk tekst/da samme cap-høyde — godtatt font-pipeline-avvik, ikke design-avvik.
- **Tester-skjermens tittel/lead følger datamodellen:** fasitens «Test-uke pågår» og «Tour-baseline»
  har ingen modell — appen viser «{N} tester siste 30 d» og dropper baseline-leddet. Resultat-chips er
  nøytrale (FYS-formelen er ikke låst — referanseverdier ville vært påfunn).
- **Rapporter-tiles uten generator lenker til riktig flate** («Åpne →») i stedet for liksom-generering;
  CSV-tilene bruker ekte eksport-endepunkter.
- **Drill-filterchips følger fasit-settet (6), kategoriene kommer fra ekte bibliotek:** drills med
  kategorier utenfor fasit-settet (f.eks. «Spill») vises i grid men har ingen egen chip — data, ikke design.
- **Tekst-wrap-punkter kan avvike ±1 linje:** next/font-bredden gjør at lange lead-/delta-tekster
  bryter på andre steder enn fasitens CDN-font (samme rotårsak som knappebredde-unntaket). Innholds-
  forskyvningen som følger (~20css) er font-pipeline, ikke design-avvik.
- **Plan-kanban er statisk (ingen drag-and-drop):** status-flyt skjer i Workbench/plan-detalj
  (låst beslutning: planlegging bor i Workbench). Kolonne-strukturen følger fasit; flytting gjør ikke.
- **Status uten aktivitetsdata viser «Inaktiv» (warn):** fasit-vokabularet «N dg inaktiv» krever
  kjent siste-aktivitet; spillere helt uten innlogging/booking-historikk kan ikke dateres. Data-grense.
- **KPI-korthøyde følger delta-wrap:** fasitens «Økter i dag»-delta wrapper til 2 linjer (smalere
  CDN-font-kolonne) og strekker alle grid-kortene +13css; appens font holder samme tekst på 1 linje.
  Wrap-følsom høyde = konsekvens av font-unntaket over, ikke design-avvik. (Målt runde 6, 2026-06-10.)

### Workbench lanserings-hub (2026-06-25)

- **7 hub-faner erstatter fasitens enkle zoom-only topbar:** Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt (År) · Uke · Økt i `HubTabRail` — diff skal ikke kreve tilbake til 5-pills-only uten hub-rail.
- **Mobil zoom-rail (Årsplan/År/Måned/Uke/Dag)** vises under hub-railen på planleggings-zoom — tilleggs-IA for touch, ikke i fasit-PNG.
- **KPI-strip + innsiktsstripe** på Gantt/Uke/Økt-zoom er bevisst (data-tetthet); fasit-PNG for enkelte faner mangler dem — ikke avvik.
- **Tom tilstand når valgfri data mangler** (ingen teknisk plan, sesongmål, Gantt-faser): ærlig empty state er OK — gate må også screenshotte seedet scenario (`scripts/seed-screentest.ts`) for paritet.
- **Hub-fane «Økt»** viser inline `OktDetailTab` (ikke fullskjerm overlay) — samme innhold som fasit wb-10, annen chrome.
- **Økt v1 (inline OktDetailTab):** Coach får redigeringspanel (AK-FORMEL/pyramide/øvelser); spiller får øvelsesliste uten separat COACH-NOTAT/SG-KOBLING-kolonne fra wb-10-PNG — kobles når notat/SG er seedet post-lansering.
- **Std spiller-mobil:** Ingen «+ Ny standardøkt» eller «Rediger» — kun «Legg i plan» (coach-only affordances, som Maler).
- **Maler/Std:** filterchips + kortgrid fra lansering 25. juni; konkrete malnavn = seed-data.
- **Uke time-grid (ikke kolonne-stack):** `UkeView` bruker vertikal time-akse (07–22) med posisjonerte kort — fasit wb-09-PNG viser enklere dagkolonner. Bevisst v10-planleggingsvisning for coach; diff skal ikke kreve kolonne-only layout.
- **Uke overlapp-lanes:** Økter som overlapper i tid får side-by-side lanes med eget grip-håndtak — ikke fasit, men nødvendig for drag på time-grid.
- **FORRIGE/NESTE uke:** Knapper rendres i header; week-offset API finnes ikke i v1 (kun inneværende kalenderuke i `load-workbench`). Klikk uten datoflyt er forventet til post-lansering.
- **Maler match-% badge:** Fasit-demo har hardkodede prosenter; appen har ikke `PlanEffectiveness` på Maler-kort ennå — viser fase + bruksteller i stedet.
- **Maler kortanatomi:** lPhase-ikon + «Brukt N×»/metadata fra DB erstatter fasitens kategori-pill + Anders-demo-copy.
- **Std DRILL-PROGRAM:** Kort viser 2-linjers preview fra `paletteItems` (mal-økter) inntil full `drillsJson`-parsing fra PlanTemplateSession.
- **Spiller uten PaletteSidebar:** Coach-only venstre panel; spiller ser ren ukeflate (player-1280-uke).
- **Turneringsbanner i uke:** Kommer fra ekte `TournamentEntry` når seedet — fasit-PNG uten banner er tom-demo, ikke fasit for seedet scenario.
- **Coach REDIGER på mal-kort:** Coach-affordance til `/admin/plan-templates` — ikke i spiller-fasit.
- **Above-panel hero (desktop):** Eyebrow + display-tittel + lead over det mørke panelet (f.eks. «Uke N — dra økter inn») — v10 Workbench-chrome utenfor fasit-PNG som kun viser panel-innhold.
- **Zoom-switcher i Topbar (desktop):** Årsplan/År/Måned/Uke/Dag-pills i panel-topbar — samme IA som mobil zoom-rail, ikke i enkelte fasit-PNG.
- **Plan-status-pill:** Ekte `PlanStatus` fra DB (f.eks. «Venter svar», «Utkast») — data, ikke design-demo.
- **Spiller-handlinger i topbar:** «AI-periodiser» og «Ny økt» er planlagte affordances — ikke i statisk fasit-PNG.
- **Ukestatistikk-rad:** `{weekLabel} · N økter · X t` under hub-rail fra `weekHead` — ekte summary-data.
- **InsightsStripe:** Gruppe-/plan-innsikt under KPI på Gantt/Uke/Økt — bevisst data-tetthet.
- **MobileStatusbar:** Sticky volum-bar + kategori-chips (FYS/TEK/SLAG/SPILL) på mobil — ikke i fasit-PNG.
- **«—» på mal-kort (øvre høyre):** Plassholder for match-% til `PlanEffectiveness` finnes — ikke collapse-kontroll.
- **«+ Ny mal» coach-only:** Skjules i spiller-mobil; coach får CTA til `/admin/plan-templates/ny`.
- **FORRIGE/NESTE pill-stil:** Følger app-bredt rounded-full pill + mono uppercase-idiom — ikke fasitens tekst-lenke-stil.
- **Mobil action-topbar:** `MobileTopbar` med WORKBENCH-ordmerke + ikon-handlinger (publiser, AI, palette, ny økt) — net-new touch-chrome uten desktop-fasit-PNG.
- **Maler filterchips inaktiv:** Inaktive pills på mørk panel-flate bruker `cardBg` + border — ikke fasitens transparente outline på lys demo-bakgrunn.
- **HCP i workbench-topbar:** v1 viser navn/avatar uten HCP-sub-label — data finnes i DB, UI kobles etter lansering.
- **Uke dag-header på time-grid:** Typografisk hierarki (dag vs. dato) følger vertikal time-akse — ikke fasit kolonne-header.
- **Mal-kategori = L-fase:** Chips viser GRUNN/SPES/TURN (ikke drill-kategori-farger fra desktop-demo).

### AgencyOS mobil (Fase 4, net-new — 2026-06-11)

- **Gate-form:** ingen fasit → brand-vokter-review (tokens/typografi/lucide/8pt/lime-disiplin/44px) i stedet for pikseldiff.
- **Touch-mål:** alle knapper får 44px på mobil via «max-md:h-11» i agBtnClass + komponent-løft — desktop-høyder (fasit) uendret.
- **Fasit-arvet lime på delte komponenter** (Caddie-brødtekst, avatar-toner, flere fylte lime-knapper på cockpit/spiller/innboks)
  aksepteres på mobil inntil en egen mobil-designrunde i Claude Design — å stramme dem ville brutt desktop-fasit-pariteten.
  Mobil-NYE flater (bunnbar, Mer) håndhever streng lime-disiplin (kun aktiv/NÅ).
- **Kjent skjørhet:** i .dark er primary=accent (begge lime) — par som «bg-primary text-accent» rendres riktig i dag,
  men er flaks; ny kode skal bruke -foreground-parene.

## Hvorfor dette (ikke bare «vær nøye»)

Jeg har bias mot å bekrefte mitt eget arbeid. En uavhengig diff-agent hvis *jobb* er å finne feil,
fanger det jeg overser (f.eks. hero-topp avatar≠vær, headline rendret som eyebrow). Gaten flytter
godkjenningen bort fra meg selv.
