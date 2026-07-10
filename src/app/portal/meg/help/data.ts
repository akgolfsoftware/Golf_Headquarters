/**
 * Hjelpesenter — statisk redaksjonelt innhold (datakontrakt for MegHelpV2).
 *
 * Dette er IKKE spillerens egne data: det er hjelpe-artikler/FAQ som
 * hjelpesenteret bærer. Verdiene er kopiert 1:1 fra de eksisterende rutene så
 * datakontrakten er bevart:
 *  - FAQ: tidligere src/app/portal/meg/help/page.tsx (FAQ-konstanten)
 *  - Kategorier + artikler: src/app/portal/meg/help/kategori/[slug]/page.tsx (KATEGORIER)
 *
 * Lenkene peker på de EKTE, eksisterende rutene (kategori/{slug},
 * artikkel/{slug}, kontakt) — ingen nye adresser oppfunnet.
 */

export type HjelpFaq = { q: string; a: string };

export type HjelpKategori = {
  slug: string;
  /** Sammensatt tittel (navn + kursiv-del fra kilden). */
  tittel: string;
  beskrivelse: string;
  /** v2 Icon-navn (Lucide via @/components/v2/icon). */
  ikon: string;
  antall: number;
};

export type HjelpArtikkel = {
  slug: string;
  tittel: string;
  kategori: string;
  lesetid: number;
};

/** Ofte stilte spørsmål — 1:1 fra help/page.tsx. */
export const HJELP_FAQ: HjelpFaq[] = [
  {
    q: "Hvordan logger jeg en runde?",
    a: "Gå til Analysere → Runder → «Loggfør runde». Legg inn score hull-for-hull, så beregnes to-par og Strokes Gained automatisk.",
  },
  {
    q: "Hvor planlegger jeg trening?",
    a: "All planlegging bor i Workbench (Planlegge-fanen). Bytt mellom årsplan, treningsplan, fysplan, mål, drills og ny økt i venstre rail.",
  },
  {
    q: "Hva koster appen?",
    a: "Appen er gratis så lenge du har en aktiv coaching-pakke. Uten pakke koster den 299 kr/mnd. Det finnes ingen nivåer.",
  },
  {
    q: "Hvordan kontakter jeg coachen?",
    a: "Åpne Coach i menyen for å se meldinger, planer, videoer og AI-Caddie.",
  },
];

/** Kategorier — navn/beskrivelse/antall speiler KATEGORIER i kategori-ruten. */
export const HJELP_KATEGORIER: HjelpKategori[] = [
  {
    slug: "komme-i-gang",
    tittel: "Komme i gang",
    beskrivelse:
      "Førstegangs-oppsett og de viktigste tingene du må vite for å komme raskt i gang med PlayerHQ.",
    ikon: "sparkles",
    antall: 3,
  },
  {
    slug: "trening",
    tittel: "Trening",
    beskrivelse:
      "Pyramide-systemet, øktstruktur, drills og hvordan du bruker statistikk for å trene smartere.",
    ikon: "dumbbell",
    antall: 4,
  },
  {
    slug: "coaching",
    tittel: "Coaching",
    beskrivelse:
      "Hvordan jobbe med din coach gjennom PlayerHQ — booking, meldinger, notater og videoanalyse.",
    ikon: "message-circle",
    antall: 3,
  },
  {
    slug: "booking",
    tittel: "Booking + betaling",
    beskrivelse:
      "Reservere fasiliteter, kjøpe credits, betale med Vipps eller kort, og forstå abonnement-detaljer.",
    ikon: "calendar",
    antall: 3,
  },
  {
    slug: "konto",
    tittel: "Kontoinnstillinger",
    beskrivelse:
      "Profil, sikkerhet, personvern, varslinger og hvordan du eksporterer eller sletter dataen din.",
    ikon: "settings",
    antall: 3,
  },
  {
    slug: "statistikk",
    tittel: "Statistikk",
    beskrivelse:
      "SG-tall, strokes-gained, kart over slag, og hvordan du tolker rapporten etter hver runde.",
    ikon: "trending-up",
    antall: 2,
  },
];

/** Alle artikler (flatet) — brukes til søk. Titler/lesetid 1:1 fra KATEGORIER. */
export const HJELP_ARTIKLER: HjelpArtikkel[] = [
  { slug: "logg-din-forste-runde", tittel: "Logg din første runde", kategori: "Komme i gang", lesetid: 3 },
  { slug: "koble-til-trackman", tittel: "Koble til Trackman", kategori: "Komme i gang", lesetid: 4 },
  { slug: "sett-ditt-forste-mal", tittel: "Sett ditt første mål", kategori: "Komme i gang", lesetid: 5 },
  { slug: "pyramide-systemet", tittel: "Hva er pyramide-systemet?", kategori: "Trening", lesetid: 5 },
  { slug: "bygg-din-treningsuke", tittel: "Bygg din treningsuke", kategori: "Trening", lesetid: 7 },
  { slug: "drills-for-svake-omrader", tittel: "Drills for svake områder", kategori: "Trening", lesetid: 6 },
  { slug: "tolke-trackman-data", tittel: "Tolke Trackman-data", kategori: "Trening", lesetid: 8 },
  { slug: "slik-bytter-du-coach", tittel: "Slik bytter du coach", kategori: "Coaching", lesetid: 2 },
  { slug: "be-om-videoanalyse", tittel: "Be om videoanalyse", kategori: "Coaching", lesetid: 3 },
  { slug: "forbered-coaching-okt", tittel: "Forbered en coaching-økt", kategori: "Coaching", lesetid: 4 },
  { slug: "book-trackman-bay", tittel: "Book en Trackman-bay", kategori: "Booking + betaling", lesetid: 3 },
  { slug: "credits-forklart", tittel: "Credits forklart", kategori: "Booking + betaling", lesetid: 4 },
  { slug: "oppgrader-til-pro", tittel: "Hvordan oppgrader til Pro?", kategori: "Booking + betaling", lesetid: 2 },
  { slug: "endre-passord", tittel: "Endre passord", kategori: "Kontoinnstillinger", lesetid: 2 },
  { slug: "to-faktor-autentisering", tittel: "Slå på to-faktor-autentisering", kategori: "Kontoinnstillinger", lesetid: 3 },
  { slug: "eksporter-data", tittel: "Eksporter all din data (GDPR)", kategori: "Kontoinnstillinger", lesetid: 3 },
  { slug: "hva-er-sg", tittel: "Hva betyr SG-tallene?", kategori: "Statistikk", lesetid: 4 },
  { slug: "lese-runde-rapport", tittel: "Lese runde-rapporten", kategori: "Statistikk", lesetid: 5 },
];
