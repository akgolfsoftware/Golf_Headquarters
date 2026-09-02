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
};

export const SKJERM_MAPPING: SkjermMapping[] = [
  {
    label: "PH-01 I dag",
    rute: "/portal",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    seedScript: "scripts/seed-ph01-signoff-fixture.ts",
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
    kalibrertAvvikPst: 10.88,
    status: "kalibrert",
    notat: "Strukturelt tett — kortlayout matcher. Avvik er reelt datavolum: screentest har 16 ekte TrackMan-økter i historikken mot fasitens eksempel på 2.",
  },
  {
    label: "P-05 Player agenda",
    rute: "/portal/planlegge",
    tema: "dark",
    cropTop: 54,
    status: "ukalibrert",
    notat: "Fasiten bruker CS/M-vokabular (CS60·M3, CS90·M3) fra FØR 18.08.2026-beslutningen «ALLE TRENINGSPLANREGLER LÅST OPP», og tegner en helt annen IA (ukenavigasjon 33/34/35, dag-grupperte økter, ÅRSPLAN/MÅNED/UKE/ØKT-faner) enn dagens enkle ukestripe på /portal/planlegge. Fasiten må tegnes om FØR pixel-diff gir mening her — ikke noe seeding kan lukke gapet. Beslutning D1 (Anders 02.09.2026): PH-07/PH-08 er fasit for /portal/planlegge — raden byttes til «PH-07 Plan» og kalibreres i Ø4.",
  },
  {
    label: "RU-04 Etterregistrering",
    rute: "/portal/runde/logg",
    tema: "dark",
    cropTop: 54,
    status: "ukalibrert",
    notat: "Allerede dokumentert kjent avvik (revisjonsrapportens statusmatrise, kategori c): fasiten er et bunn-ark over «I dag», koden er en egen helside med hull-for-hull-rutenett. Feltgeometrien matcher — layout-typen gjør ikke.",
  },
  {
    label: "ME-03 Abonnement",
    rute: "/portal/meg/abonnement",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    status: "ukalibrert",
    notat: "Fasiten viser pakken «AK Academy · Elite» med egen kr/måned-pris og fornyelsesdato, som en Stripe-lignende enkeltfaktura. «Elite» er et dødt Prisma-enum CLAUDE.md eksplisitt forbyr i UI, og ingen pakke har egen kr/måned-visning i dagens modell (16.08.2026-omleggingen: coaching-pakke gir gratis PlayerHQ-tilgang UTEN pris vist på denne siden, PlayerHQ alene koster 299/2690 kr). Fasiten er altså fra FØR omleggingen — samme klasse avvik som P-05 og AO-01. Målt pixel-diff (9,93 %) ser lavt/normalt ut, men er IKKE et meningsfullt tall her: strukturen matcher tilfeldig (mørkt kort øverst, linjeliste under), ikke fordi innholdsmodellen er den samme. /oppgrader/flyt (kjøpsflyten) har ingen egen fasit-ramme og kunne ikke vises for screentest (som allerede er PRO+pakke → redirectes til denne siden) uten TALENT-tier-sonden Anders ikke har godkjent ennå (se docs/MASTERPLAN-GJENSTAAENDE.md Ø1). Kodegjennomgang av oppgrader-flyt-wizard.tsx fant og rettet én reell feil: funksjons-chippene (\"AI-coach\" m.fl.) hadde identisk tekst- og bakgrunnsfarge (usynlig tekst) — se PR.",
  },
  {
    label: "AO-01 Cockpit 1440",
    rute: "/admin/agenticos",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    status: "ukalibrert",
    notat: "Fasiten viser en utdatert AgenticOS-spesifikk rail (Cockpit/Kø/Godkjenn/Projects/Runtimes/Skills). Appen har allerede AX-01s fem-destinasjoners rail (Stall/Workbench/Kø/Jarvis/Meg — dagens kanon, se beslutninger.md). Fasiten må tegnes om mot AX-01 før dette er en meningsfull sjekk.",
  },
  {
    label: "AO-03 Ko 1440",
    rute: "/admin/agenticos/ko",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    status: "ukalibrert",
    notat: "Fasit-rammen er 760×640 — et INNEBYGD panel tegnet for visning inni en større 1440-canvas, ikke en full viewport-bredde. Satt direkte som browser-viewport trigger appens MOBIL-breakpoint (bunn-tab-bar i stedet for sidebar). Riggen må rendre app ved ekte 1440 og klippe ut det tilsvarende panelet — ikke bygget ennå.",
  },
  {
    label: "AO-08 Godkjenn 1440",
    rute: "/admin/agenticos/godkjenn",
    tema: "dark",
    cropTop: 0,
    bruker: "coachtest",
    status: "ukalibrert",
    notat: "Samme innebygd-panel-metodikkhull som AO-03 (620px bredde, ingen fast høyde i fasiten).",
  },
  {
    label: "AG-04 Stall",
    rute: "/admin/spillere",
    tema: "dark",
    cropTop: 54,
    bruker: "coachtest",
    seedScript: "scripts/seed-screentest-coach.ts (kjør med --kun-enrollering hvis stallen er tom)",
    kalibrertAvvikPst: 15.3,
    status: "ukalibrert",
    notat: "Ø14 (MASTERPLAN STEG 1B), målt 02.09.2026: 15,29 % etter at demo-stallen fikk enrolleringer (første måling ga 18,8 % mot en TOM stall — de 37 demo-spillerne manglet PlayerEnrollment, som loadStallen krever; rettet i seed-scriptet samme dag). Restavviket er BEVISST, ikke en port-feil: (1) fasiten tegner den pensjonerte railen (Cockpit/Innboks/Stall/Kalender/Workbench) — appen har AX-01s fem destinasjoner (kanon 25.08); (2) fasiten er en flat liste med HCP + SG-delta per rad, mens beslutning 6.5 (Anders 30.08, levert i 15.11/PR #710) fjernet SG/hcp fra raden og innførte bolkene «Trenger deg nå»/«Følger planen» + én prikk — fasiten (24.–26.08) er fra FØR den beslutningen. Ny tegning av AG-04 mot 6.5 + AX-01 er det som gjenstår, ikke kode. Sett fra riggen: raden på 390 px er trang («Ingen økt…» klippes ved siden av «innlogget 10 dg siden») — verdt å ta i omtegningen.",
  },
  {
    label: "AG-03 Innboks",
    rute: "/admin/kommunikasjon",
    tema: "dark",
    cropTop: 54,
    bruker: "coachtest",
    kalibrertAvvikPst: 15.3,
    status: "ukalibrert",
    notat: "Ø15 (MASTERPLAN STEG 1B), målt 02.09.2026: 15,29 %. Innholdsstrukturen matcher (seksjonene «Godkjenninger · N» med kort og «Meldinger» under), men to bevisste lag ligger oppå: (1) pensjonert rail i fasiten vs. AX-01 i appen (samme som AG-04); (2) 15.7-konsolideringen (PR #702) ga skjermen fane-raden Innboks/Utkast/Sendt/Maler + Alle/Meldinger-filteret og tittelen «Kommunikasjon» — fasiten heter «Innboks» og har ingen faner. Kø-fanen i bunn-navigasjonen er markert aktiv på /admin/kommunikasjon (ikke Stall/Meg) — verifiser om det er riktig destinasjon for Kommunikasjon i AX-01 når skjermen tegnes om.",
  },
];
