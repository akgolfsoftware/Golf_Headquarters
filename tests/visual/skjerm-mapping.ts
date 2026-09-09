/**
 * Mapping-fil for Train-lock sign-off-riggen (scripts/train-lock-pixel-diff.mjs).
 *
 * Kartlegger data-screen-label (fasit) → app-rute → viewport → cropTop
 * (fasitens bakte-inn statuslinje, kun mobil-rammer med dynamic island har
 * dette — desktop-rammer har cropTop 0). Status "kalibrert" betyr et MÅLT,
 * reproduserbart restavvik med kjent, dokumentert årsak til det som gjenstår
 * — IKKE nær-null. Status "ukalibrert" betyr at pixel-diff ikke er en
 * meningsfull sjekk for skjermen ennå, av en av to grunner: fasiten selv er
 * utdatert (viser en IA/vokabular appen bevisst har forbigått), eller fasit-
 * rammen representerer et INNEBYGD panel (mindre enn full viewport-bredde)
 * som trigger en annen breakpoint enn den var tegnet i — se README.md.
 */
export type SkjermMapping = {
  label: string;
  rute: string;
  tema: "dark" | "light";
  cropTop: number;
  bruker?: "screentest" | "coachtest";
  /** Script som setter opp data slik at appen matcher fasitens tilstand. */
  seedScript?: string;
  /** Kjent, forventet gjenstående avvik etter kalibrering. */
  kalibrertAvvikPst?: number;
  status: "kalibrert" | "ukalibrert";
  notat: string;
  /**
   * "Nå"-tidspunktet raden er MÅLT/SKAL måles med, som ISO-datotid i samme
   * format som TEST_NAA i scripts/train-lock-pixel-diff.mjs (f.eks.
   * "2026-08-22T07:10:00Z"). Dokumentasjon, ikke automatikk: riggen leser
   * IKKE dette feltet selv ennå — sett miljøvariabelen SHOT_DATO til samme
   * verdi manuelt før du kjører pixel-diff for raden (mønster: SHOT_BRUKER).
   * Mangler feltet: raden måles med riggens egen TEST_NAA-standard
   * (22.08.2026) — de fleste rader trenger derfor ALDRI dette eksplisitt.
   */
  testDato?: string;
  /**
   * Siste endring av fasitfila i repoet (YYYY-MM-DD):
   * `git log -1 --format=%ad --date=short -- "designsystem/train-lock/<fil>"`.
   * Grunnlag for gyldighetssjekken i README.md. NB: 2026-08-25 er
   * bulk-importdatoen (PR #581) — en fil med den datoen kan være tegnet
   * 23.–24.08. Datoen betyr «ikke nyere enn», aldri «tegnet den dagen».
   */
  fasitDato?: string;
  /** Målt tid brukt på raden (seed + måling + notat), i minutter. Måles, anslås aldri. */
  minutter?: number;
  /** Påkrevd når status er "ukalibrert": hvorfor pixel-diff ikke er et signal ennå. */
  aarsak?: "fasit-utdatert" | "innebygd-panel" | "kjent-layoutavvik";
  /**
   * Panel-modus (README.md §Panel-modus). Fasitrammen er et innebygd panel,
   * ikke en skjerm: appen rendres i `viewport`, og utsnittet klippes fra
   * `selector`-elementets øvre venstre hjørne med fasitrammens bredde/høyde.
   * Begge eller ingen.
   */
  viewport?: { bredde: number; hoyde: number };
  selector?: string;
};

export const SKJERM_MAPPING: SkjermMapping[] = [
  {
    label: "PH-01 I dag",
    rute: "/portal",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    seedScript: "scripts/seed-ph01-signoff-fixture.ts",
    fasitDato: "2026-08-28",
    kalibrertAvvikPst: 11.07,
    status: "kalibrert",
    notat: "Restavvik er SG-verdi/ukentlig øktantall/neste-økt-kort — avledet fra annen historikk enn seed-fixturen.",
  },
  {
    label: "TE-01 Tester hub",
    rute: "/portal/tren/tester",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-25",
    kalibrertAvvikPst: 14.38,
    status: "kalibrert",
    notat: "App har en ekstra «← Analyse»-tilbakelenke fasiten ikke tegner (~44px forskyvning) — mulig bevisst tillegg, ikke sjekket mot HANDOFF. Rekkefølge/PEI-tall differ pga. ekte vs. ingen testresultat-data.",
  },
  {
    label: "TM-04a Analyse-hub iPhone",
    rute: "/portal/analysere",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-25",
    kalibrertAvvikPst: 5.56,
    status: "kalibrert",
    notat: "Samme datoavhengighet som PH-01 (dato-override ikke koblet inn her ennå — «i vindu i dag» / SG-tall er dato-avledet dypere i kallkjeden enn page.tsx).",
  },
  {
    label: "TM-01a Liste iPhone",
    rute: "/portal/analysere/trackman",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-25",
    kalibrertAvvikPst: 10.88,
    status: "kalibrert",
    notat: "Strukturelt tett — kortlayout matcher. Avvik er reelt datavolum: screentest har 16 ekte TrackMan-økter i historikken mot fasitens eksempel på 2.",
  },
  {
    label: "PH-07 Plan",
    rute: "/portal/planlegge",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-28",
    kalibrertAvvikPst: 17.26,
    status: "kalibrert",
    notat: "Ø4 (MASTERPLAN, D1 02.09.2026): erstatter utgåtte «P-05 Player agenda» — PH-07/PH-08 er fasit for /portal/planlegge, og PlanV2.tsx er allerede bygget mot dem. Restavvik er IKKE en layout-feil (uke-stripe, kort, «Åpne økt»-knapp og bunn-nav treffer piksel-for-piksel): `getDashboardData()`/`getWeekOverview()` (src/app/portal/actions.ts) leser rå `new Date()` og har `hentEffektivNaa()`-dato-overstyringen (kun koblet inn i /portal/page.tsx) IKKE koblet inn — samme kjente gap som TM-04a. Riggens frosne testdato (22.08.2026) treffer derfor en tom, ekte uke i stedet for PH-01-fixturens fylte uke, og appen viser PH-08s tomme-uke-kort i stedet for PH-07s fylte kort. Å koble inn overstyringen ville krevd å tre en valgfri dato gjennom `getDashboardData` og alle underfunksjonene som bruker `new Date()` — større endring enn selve sign-off-en, ikke gjort her.",
  },
  {
    label: "ME-04 Coach-hub",
    rute: "/portal/coach",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    notat: "Ø8 (MASTERPLAN STEG 20.2), lagt til 09.09.2026 (fase 1/batch 1 — bevis at PH-01/PH-07/PH-08/ME-04 er ferdig): CoachHubV2.tsx er bygget mot ME-04 (PR #750, filhode siterer fasiten korrekt), men IKKE kalibrert her ennå. Riggen krever innlogget kjøring (SHOT_BRUKER=screentest@akgolf.test + SCREENTEST_PASSWORD) enten lokalt mot en ekte .env.local eller mot prod (BASE default https://akgolf-hq.vercel.app) — begge var utilgjengelige i økten som la til denne raden (worktree uten .env.local, jf. gotchas.md §Aldri kopier .env* inn i en worktree; SCREENTEST_PASSWORD ikke i shell-miljøet). Kjør `npm run signoff:train-lock -- \"ME-04 Coach-hub\" /portal/coach dark 54` fra en økt med ekte credentials for å kalibrere; bytt status til \"kalibrert\" og fyll kalibrertAvvikPst når målt.",
  },
  {
    label: "RU-04 Etterregistrering",
    rute: "/portal/runde/logg",
    tema: "dark",
    cropTop: 54,
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    aarsak: "kjent-layoutavvik",
    notat: "Allerede dokumentert kjent avvik (revisjonsrapportens statusmatrise, kategori c): fasiten er et bunn-ark over «I dag», koden er en egen helside med hull-for-hull-rutenett. Feltgeometrien matcher — layout-typen gjør ikke.",
  },
  {
    label: "ME-03 Abonnement",
    rute: "/portal/meg/abonnement",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    aarsak: "fasit-utdatert",
    notat: "Fasiten viser pakken «AK Academy · Elite» med egen kr/måned-pris og fornyelsesdato, som en Stripe-lignende enkeltfaktura. «Elite» er et dødt Prisma-enum CLAUDE.md eksplisitt forbyr i UI, og ingen pakke har egen kr/måned-visning i dagens modell (16.08.2026-omleggingen: coaching-pakke gir gratis PlayerHQ-tilgang UTEN pris vist på denne siden, PlayerHQ alene koster 299/2690 kr). Fasiten er altså fra FØR omleggingen — samme klasse avvik som P-05 og AO-01. Målt pixel-diff (9,93 %) ser lavt/normalt ut, men er IKKE et meningsfullt tall her: strukturen matcher tilfeldig (mørkt kort øverst, linjeliste under), ikke fordi innholdsmodellen er den samme. /oppgrader/flyt (kjøpsflyten) har ingen egen fasit-ramme og kunne ikke vises for screentest (som allerede er PRO+pakke → redirectes til denne siden) uten TALENT-tier-sonden Anders ikke har godkjent ennå (se docs/MASTERPLAN-GJENSTAAENDE.md Ø1). Kodegjennomgang av oppgrader-flyt-wizard.tsx fant og rettet én reell feil: funksjons-chippene (\"AI-coach\" m.fl.) hadde identisk tekst- og bakgrunnsfarge (usynlig tekst) — se PR.",
  },
  {
    label: "AO-01 Cockpit 1440",
    rute: "/admin/jarvis",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    aarsak: "fasit-utdatert",
    notat: "Rute byttet 08.09 (fase 1, økt 4) fra redirect-adressen /admin/agenticos til /admin/jarvis (MASTERPLAN 15.5, PR #701; Kø er standardfanen). Fasiten viser en utdatert AgenticOS-spesifikk rail (Cockpit/Kø/Godkjenn/Projects/Runtimes/Skills). Appen har allerede AX-01s fem-destinasjoners rail (Stall/Workbench/Kø/Jarvis/Meg — dagens kanon, se beslutninger.md). Fasiten må tegnes om mot AX-01 før dette er en meningsfull sjekk.",
  },
  {
    label: "AO-03 Ko 1440",
    rute: "/admin/ko?fane=agentko",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts",
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    kalibrertAvvikPst: 4.76,
    aarsak: "kjent-layoutavvik",
    minutter: 3,
    viewport: { bredde: 1440, hoyde: 900 },
    selector: '[data-screen-label="AO-03 Ko"]',
    notat: "Målt 08.09.2026 mot prod i panel-modus (fase 1, økt 4): 4,76 % (23 140/486 400 px, ramme 760×640). Rute byttet samme dag fra redirect-adressen /admin/agenticos/ko til /admin/ko?fane=agentko (MASTERPLAN 15.1). Fasit-rammen er et INNEBYGD panel tegnet for visning inni en større 1440-canvas; måles derfor med app ved 1440×900 og utsnitt fra AdminAgenticosKo-elementet. Hodet («Kø» + filterpillene) treffer fasitens plassering, men alt under forskyves: appen har ingen Pågår-seksjon (seed gir 0 pågående) der fasiten viser 2, og radenes høyre metadata/handling faller utenfor utsnittet fordi panelet er 1144 px bredt i skallet mot fasitens 760. Derfor ukalibrert, ikke kalibrert — tallet er dokumentasjon, ikke signal. Full avviksliste i filhodet til AdminAgenticosKo.tsx; bilder i docs/design-audit/2026-09-08/rigg-panelmodus-ao/.",
  },
  {
    label: "AO-08 Godkjenn 1440",
    rute: "/admin/ko?fane=agentgodkjenn",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts (gir 3 PENDING PlanAction — uten dem viser appen AO-12f tom, og selectoren finnes ikke)",
    fasitDato: "2026-08-25",
    status: "ukalibrert",
    kalibrertAvvikPst: 6.65,
    aarsak: "kjent-layoutavvik",
    minutter: 3,
    viewport: { bredde: 1440, hoyde: 900 },
    selector: '[data-screen-label="AO-08 Godkjenn"]',
    notat: "Målt 08.09.2026 mot prod i panel-modus (fase 1, økt 4): 6,65 % (24 377/366 300 px). Rute byttet samme dag fra redirect-adressen /admin/agenticos/godkjenn til /admin/ko?fane=agentgodkjenn (MASTERPLAN 15.1). Fasit-rammen måler 660×555 (620 px innhold + 20 px padding) og har ingen fast høyde i tegningen. Kortstrukturen stemmer (uthevet sak med Godkjenn/Avvis, deretter kompakte kort), men appens panel starter på x=0 i skallets innhold, så alt ligger forskjøvet 20 px opp og til venstre, og panelet er bredere enn 620 px så kortenes høyre kant faller utenfor utsnittet. Antall PENDING-saker er ekte coachtest-data, ikke fasitens 1+3. Derfor ukalibrert. Full avviksliste i filhodet til AdminAgenticosGodkjenn.tsx; bilder i docs/design-audit/2026-09-08/rigg-panelmodus-ao/.",
  },
  {
    label: "AG-04 Stall",
    rute: "/admin/spillere",
    tema: "dark",
    cropTop: 54,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts (kjør med --kun-enrollering hvis stallen er tom)",
    fasitDato: "2026-08-25",
    kalibrertAvvikPst: 15.3,
    status: "ukalibrert",
    aarsak: "fasit-utdatert",
    notat: "Ø14 (MASTERPLAN STEG 1B), målt 02.09.2026: 15,29 % etter at demo-stallen fikk enrolleringer (første måling ga 18,8 % mot en TOM stall — de 37 demo-spillerne manglet PlayerEnrollment, som loadStallen krever; rettet i seed-scriptet samme dag). Restavviket er BEVISST, ikke en port-feil: (1) fasiten tegner den pensjonerte railen (Cockpit/Innboks/Stall/Kalender/Workbench) — appen har AX-01s fem destinasjoner (kanon 25.08); (2) fasiten er en flat liste med HCP + SG-delta per rad, mens beslutning 6.5 (Anders 30.08, levert i 15.11/PR #710) fjernet SG/hcp fra raden og innførte bolkene «Trenger deg nå»/«Følger planen» + én prikk — fasiten (24.–26.08) er fra FØR den beslutningen. Ny tegning av AG-04 mot 6.5 + AX-01 er det som gjenstår, ikke kode. Sett fra riggen: raden på 390 px er trang («Ingen økt…» klippes ved siden av «innlogget 10 dg siden») — verdt å ta i omtegningen.",
  },
  {
    label: "AG-03 Innboks",
    rute: "/admin/kommunikasjon",
    tema: "dark",
    cropTop: 54,
    bruker: "coachtest",
    fasitDato: "2026-08-28",
    kalibrertAvvikPst: 15.3,
    status: "ukalibrert",
    aarsak: "fasit-utdatert",
    notat: "Ø15 (MASTERPLAN STEG 1B), målt 02.09.2026: 15,29 %. Innholdsstrukturen matcher (seksjonene «Godkjenninger · N» med kort og «Meldinger» under), men to bevisste lag ligger oppå: (1) pensjonert rail i fasiten vs. AX-01 i appen (samme som AG-04); (2) 15.7-konsolideringen (PR #702) ga skjermen fane-raden Innboks/Utkast/Sendt/Maler + Alle/Meldinger-filteret og tittelen «Kommunikasjon» — fasiten heter «Innboks» og har ingen faner. Kø-fanen i bunn-navigasjonen er markert aktiv på /admin/kommunikasjon (ikke Stall/Meg) — verifiser om det er riktig destinasjon for Kommunikasjon i AX-01 når skjermen tegnes om.",
  },
  {
    label: "PH-21a Min kurve iPhone",
    rute: "/portal/analysere/turneringer",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    seedScript: "scripts/seed-ph21-signoff-fixture.ts",
    fasitDato: "2026-09-01",
    kalibrertAvvikPst: 12.32,
    status: "kalibrert",
    notat: "Ø19 (MASTERPLAN 2.13 spor A), målt 05.09.2026 mot lokal dev: 12,32 %. Restavvik: appens tilbake-pille («← Analyse», CTAPill ghost) vs fasitens tekstrad; appens bunn-nav (ikon + tekst) vs fasitens 9px-caps; demo-dataene (6 turneringer 2026) har andre verdier enn fasitens eksempeltall, så kurven og y-etikettene avviker. Geometri (kort 20, tall 56/700, svg 180, legende) følger fasiten.",
  },
  {
    label: "PH-21b Min kurve desktop 1280",
    rute: "/portal/analysere/turneringer",
    tema: "dark",
    cropTop: 0,
    bruker: "screentest",
    seedScript: "scripts/seed-ph21-signoff-fixture.ts",
    fasitDato: "2026-09-01",
    kalibrertAvvikPst: 13.12,
    status: "kalibrert",
    notat: "Ø19, målt 05.09.2026: 13,12 % (10,03 % før toppraden ble lagt om til fasitens 58px-bar med sesongpiller — økningen er V2Shells toppluft på ~40 px som nå forskyver hele strukturen, ikke en strukturfeil). Fasit-rammen er 1280×800. Øvrig restavvik: samme datasett-forskjell som PH-21a; høyrekolonnen (340) og tabellkolonnene (100/flex/90/120/150) er fasitens.",
  },
  {
    label: "PH-21c Min kurve tom iPhone",
    rute: "/portal/analysere/turneringer",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    seedScript: "scripts/seed-ph21-signoff-fixture.ts --tom",
    fasitDato: "2026-09-01",
    kalibrertAvvikPst: 18.39,
    status: "kalibrert",
    notat: "Ø19, målt 05.09.2026: 18,39 %. Tom tilstand = koblet identitet uten turneringer (seedens --tom). Restavvik: tilbake-pille + bunn-nav som PH-21a, og tittelen står ~20 px høyere enn fasitens fordi appen ikke har fasitens 54px statuslinje-luft under toppen. Tekst og akseskall er fasitens.",
  },
  {
    label: "S3-03a Spiller profil Mac",
    rute: "/admin/spillere/<spillerId>",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts (demo-stall; spillerId hentes fra første rad i /admin/spillere)",
    fasitDato: "2026-08-28",
    kalibrertAvvikPst: 14.34,
    status: "kalibrert",
    notat: "A0/Ø12-rest (MASTERPLAN 2.13), målt 05.09.2026 mot prod: 14,34 %. Fasit-rammen er 1440×900, ikke 1280. Tre kjente årsaker: (1) fasiten tegner den pensjonerte 64px-ikonrailen, appen AX-01 (232px m/tekst); (2) demo-spilleren har ingen økter denne uken → tom-tilstand-kort der fasiten viser 72 %-måler, teknisk plan og Nå-kort (dataavhengig, ikke port-feil); (3) portrett-plassholder og minikalender bevisst utelatt (Ø12, PR #766). Under bentoen ligger de tre eldre profilpanelene med en ANDRE hvit primær («Åpne i Workbench») — utenfor fasit-rammens høyde, men et §6-brudd som Ø13 (PR #771) rydder.",
  },
  {
    label: "S3-03b Spiller profil iPhone",
    rute: "/admin/spillere/<spillerId>",
    tema: "dark",
    cropTop: 54,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts (demo-stall)",
    fasitDato: "2026-08-28",
    kalibrertAvvikPst: 15.15,
    status: "kalibrert",
    notat: "A0/Ø12-rest, målt 05.09.2026 mot prod: 15,15 %. Samme tre årsaker som S3-03a, pluss: fasiten har fire nøkkeltall (Handicap/SG 12 uker/Økter/Snittrunde) og appen tre (SG og snittrunde mangler datagrunnlag for demo-spilleren → utelatt, ikke plassholdertall); fasitens bunn-tabbar er den pensjonerte (Cockpit/Innboks/Stall/Kalender/Mer), appen AX-01.",
  },
];
