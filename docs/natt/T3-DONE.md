# T3 — Innboks + godkjenninger til Train-lock (26.08.2026)

Gren: `claude/t3-innboks-godkjenninger-tl`. Fasit: `designsystem/train-lock/AG-03 Innboks.dc.html`,
`AG-10 Godkjenning Merge.dc.html`, `AG-10b Godkjenning Merge 3 skall.dc.html`.

## Levert

1. **`/admin/godkjenninger`** portet til Train-lock.
   - Ny komponent `src/components/admin/v2/godkjenninger/AdminGodkjenningerTrainLock.tsx`
     erstatter `AdminGodkjenningerV2` (Paper) på ruten. Samme datakontrakt
     (`AdminGodkjenningerV2Data`/`Row`, re-eksportert) og SAMME server actions
     (`acceptPlanAction`/`rejectPlanAction`/`godkjennCaddieDraft`/`avvisProaktivtForslag`/
     `markerSomPlanlagt`/`avslaaForespørsel`/`batchApproveLowRisk`/`delUkesdigestAction`)
     — dette er en designport, ikke en funksjonsendring.
   - Master–detalj på desktop (A2, ≥1024px): gjenbruker `MasterDetalj`/`useInspektorSynlig`
     fra `src/components/v2/inspektorpanel.tsx` (token-fri, trygg å dele mellom Paper- og
     Train-lock-skjermer). Selve panelinnholdet er en NY `TlInspektorpanel`/`TlInspektorBlokk`/
     `TlInspektorKpi` i `src/components/admin/v2/godkjenninger/tl-inspektor.tsx` — den
     eksisterende `Inspektorpanel` (`src/components/v2/inspektorpanel.tsx`) bruker Paper-tokens
     (`T.*`) og kan derfor ikke gjenbrukes i en Train-lock-skjerm (invariant 2: bland aldri
     `T.*`/`TL.*`).
   - Mobil: fullt kort inline (uendret prinsipp fra AdminGodkjenningerV2 — ingen egen
     detaljrute trengs).
   - **Copy-avvik (bevisst, jf. fasit):** agent-kildens primærhandling heter **«Merge»**
     (fasitens ord), ikke «Godkjenn». Handlingen er den samme (`acceptPlanAction`). Caddie
     («Send») og forespørsel («Legg i kalenderen») beholder sine egne verb — de er ikke
     «merger» i fasitens forstand.
   - **«Endre først»-knappen er fjernet** (pekte tidligere til den nå-fjernede
     detaljruten). Full detalj vises allerede i kortet/inspektørpanelet — ingen
     funksjonalitet tapt, kun ett unødvendig trykk fjernet (Enkelhet-prinsippet).
   - Én hvit primær per skjerm er håndhevet i kode: kun det **fremhevede** kø-kortet
     (valgt, eller første i lista når ingenting er valgt) får `variant="primaer"`
     på hovedhandlingen — resten er `sekundaer` (dim), matcher fasitens
     «Merge er primær på første kø-kort · resten opacity 0.55».

2. **`/admin/(legacy)/godkjenninger/[id]`** → ren redirect til `/admin/godkjenninger`.
   Master–detalj-mønsteret i (1) dekker samme informasjon (kort på mobil, inspektørpanel
   på desktop) — det finnes ikke lenger noen egen id-drevet detaljside å vise.
   `AdminGodkjenningDetaljV2.tsx` (klientkomponenten den gamle siden rendret) er slettet —
   ingen andre steder importerte den.

3. **`/admin/innboks`** portet til Train-lock.
   - Ny komponent `src/components/admin/v2/innboks/InnboksSakerTrainLock.tsx` erstatter
     `InnboksSaker` (Paper, `ArtefaktPanel`-basert) på ruten. Samme datakilde
     (`loadInnboksSaker`/`InnboksData`) og SAMME server action (`avgjorInnboksSak`).
   - Fasitens to seksjoner («Godkjenninger» / «Meldinger») er generalisert fra
     `InnboksSakType` i stedet for hardkodet til ukeplan-scenariet i fasit-skjermbildet:
     - **Godkjenninger** = `forslag` + `forespørsel` (krever en avgjørelse fra deg)
     - **Meldinger** = `drift` + `varsel` (systemvarsler/informasjon)
     Fasitens tomtekst «Ingen uleste meldinger» er ordrett kopiert til Meldinger-seksjonens
     tomtilstand.
   - Master–detalj på desktop, samme mønster som (1) (`TlInspektorpanel` med kontrakt-
     feltene Hvorfor/Hva/Forventet effekt/Hvorfor nå, foreslått svar for Jarvis-saker,
     og grunnlag/proveniens).

4. **Varsler-fletting.** `/admin/varsler` er nå en ren redirect til
   `/admin/innboks?filter=varsler` (viser kun Meldinger-seksjonen). Duplikat-flaten
   `VarslerClientV2.tsx` + loaderen `src/lib/admin/load-varsler.ts` er slettet — begge var
   fullstendig orphanet etter redirect-endringen (verifisert med grep, ingen andre
   importer). `godtaPlanAction`/`avvisPlanAction` i `src/app/admin/varsler/actions.ts` har
   nå ingen kalleres (kun `markerVarselLest` brukes fortsatt, av `innboks/actions.ts`) —
   latt stå urørt for å ikke risikere unødvendig kode-churn; kandidat for opprydding i en
   senere økt.

## Avvik fra brief/fasit (med begrunnelse)

- **Desktop-panelbredden på Godkjenninger/Innboks er IKKE 380px fast.** `MasterDetalj`
  bruker det etablerte PP-A2-grid-mønsteret (`minmax(0,1fr) 380px`) — dette ER 380px, så
  ingen avvik der. Det som avviker fra `AG-10b3 Merge Mac`-fasiten er at fasiten der tegner
  en egen 300px kø-KOLONNE til venstre for en full-bredde diff (ikke en 380px-detalj til
  høyre for en liste). Jeg valgte å beholde den etablerte 380px-høyre-panel-normen
  (samme som Cockpit/andre A2-skjermer) i stedet for å bygge en tredje layoutvariant, fordi
  (a) det er IA-mønsteret hele resten av AgencyOS bruker, og (b) fasitens 300px+full-bredde-
  variant er spesifikt tegnet for ÉN sak av gangen (Filip-eksempelet), mens
  Godkjenninger/Innboks viser en FLAT kø av mange forskjellige saks-TYPER — ikke bare
  ukeplan-differ. Anders bør se skjermbildet og si om 380px-normen holder her, eller om
  denne skjermen trenger fasitens bredere layout (skjermbilde-gaten, se under).
- **Ingen egen dag-for-dag før/etter-tabell** (AG-10/AG-10b sin «Man/Tir/Ons…»-liste med
  Ny/Uendret/Fjernet). Datamodellen (`buildDiffPreview`) leverer én sammenhengende
  diff-streng («Dette endres»), ikke en strukturert liste av økter med individuell
  ny/uendret/fjernet-status. Å bygge det ville krevd å utvide `PlanAction`-diff-motoren
  (`src/lib/admin/plan-action-diff.ts`) — utenfor scope for en designport. Nåværende
  «Dette endres»-boks viser samme informasjon i prosaform.
- **KoHubNav (Paper-subnav Innboks/Godkjenning/Varsler/Oppfølging/Oppgaver) er fjernet**
  fra begge skjermene. Den er Paper-stylet (`T.*`) og kan derfor ikke stå i en Train-lock-
  skjerm. AX-01-railen (allerede implementert i `V2Shell`, A1-beslutningen) dekker samme
  overordnede navigasjon via «Kø»-destinasjonen; sub-navigasjonen mellom de fem gamle rutene
  er ikke gjenoppbygd i Train-lock siden ingen av fasitskjermene (AG-03/AG-10/AG-10b) viser
  en slik pille-rad.
- **Filter-UI på Innboks («Alle» / «Meldinger») er IKKE tegnet i noen fasit-fil.** Lagt til
  som to enkle piller (samme mønster som kildefiltrene i Godkjenninger) fordi
  varsler-flettingen krever EN mekanisme for å vise kun Meldinger-seksjonen. Minimal,
  følger knappe-matrisen (aktiv = fyll, resten dim).
- **Error/loading-skjelettene** (`error.tsx`/`loading.tsx` i alle tre rutene) er URØRT —
  de bruker delte `V2Feil`/`V2Laster`-komponenter (`src/components/v2/feil-laste.tsx`) som
  er Paper-stylet og brukes av dusinvis av andre ruter. Å reskinne dem hører til en egen,
  app-bred Train-lock-port av feil/laste-tilstander, ikke denne sesjonen.
- **`AdminGodkjenningerV2.tsx` (Paper) er IKKE slettet** — den eksporterer fortsatt
  `AdminUkesrapportKort`-typen som `src/lib/admin/ukesrapport.ts` importerer, og min nye fil
  re-eksporterer typene derfra i stedet for å duplisere dem. Selve komponentfunksjonen
  (`AdminGodkjenningerV2`) rendres ikke lenger noe sted — død kode, men harmløs. Forslag til
  senere opprydding: flytt typene til en egen `types.ts` og slett komponentfunksjonen.

## Verifikasjon kjørt i denne worktreen

- `npx tsc --noEmit` — grønt.
- `npx eslint --quiet` på alle endrede mapper — grønt.
- `node scripts/check-token-gap.mjs` — grønt (ingen hex/Presis-farger).
- `node scripts/check-action-auth.mjs` — grønt.
- `node scripts/check-critical-imports.mjs` — **FEILER i denne worktreen**, men
  ikke pga. denne PR-en: `node_modules/esbuild/bin/esbuild` mangler i worktreens
  `node_modules` (ENOENT ved spawnSync), et kjent worktree-miljøproblem (jf.
  `.claude/rules/gotchas.md` §«Aldri kopier .env* inn i en worktree»). CI kjører i et rent
  miljø og bør ikke ha dette problemet.
- `npm test` — kjørte til slutt (exit 0), ingen `✖`/feilmarkører i loggen. Full
  test-oppsummering (siste linjer med tellinger) ble ikke fanget i loggen — stol på CI som
  fasit for full dekning, jf. gotchas §Token-økonomi punkt 3.
- `npm run build` — **IKKE kjørt** i denne worktreen (krever ekte secrets/DB-tilkobling
  utover dummy-verdiene; kjent worktree-begrensning). CI kjører full `npm run verify`.

## Skjermbilde-gaten (gjenstår, FAST REGEL)

Ingen av disse tre skjermene er sett av Anders ennå. Før merge trengs: mobil 390px +
desktop 1280px, lys OG mørk modus, for `/admin/innboks` og `/admin/godkjenninger`
(mobil-detalj dekkes av kortet, ingen egen detaljskjerm å vise for
`/admin/(legacy)/godkjenninger/[id]` siden den nå kun redirecter).
