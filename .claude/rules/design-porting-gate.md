# Design-porting-gate (LÅST regel)

Når en skjerm portes fra det ferske designet (`public/design-handover/AK Golf HQ Design System/`) til kode, MÅ denne gaten følges. En skjerm er IKKE «ferdig» og vises IKKE til Anders før gaten er bestått. Dette finnes fordi porting «fra minne/eksisterende kode» gir «nesten»-resultater som avviker fra fasit.

## Gaten — 5 steg per skjerm

1. **Bygg FRA design-kilden, ikke fra eksisterende kode.**
   Les kilden under `public/design-handover/AK Golf HQ Design System/`: `playerhq-app/`/`agencyos-app/` screen-JSX + matchende `screenshots/*.png`.
   Lag en **element-liste** (hero-topp, hero-bunn, hver seksjon, hvert tall/tekst, rekkefølge).
   Bygg implementeringen fra lista — ikke ved å modifisere det som allerede finnes.

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
- **Dashboard-underruter** (uka/økonomi/caddie/spillere) har mistet fane-raden (fasiten har ingen) —
  rutene lever på egne adresser og nås via ⌘K til IA-beslutning tas.
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
