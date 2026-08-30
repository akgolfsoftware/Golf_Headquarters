/**
 * Register over norske GolfBox-kunder vi henter terminliste + resultater fra.
 *
 * Verifisert ved enumerering av GolfBox customer-rommet (2026-06-01):
 * customer 18 = Norges Golfforbund lister alle nasjonale tourer (Srixon,
 * Garmin Norgescup, NM, Jr NM, Para Norgescup …) — IKKE klubbturneringer.
 *
 * Olyo- og Østlandstour-kundene kartlagt 2026-07-18: NGF har én GolfBox-kunde
 * per region (873 Midt, 874 Vestland, 875 Rogaland, 876 Sør, 877 Viken Vest,
 * 878 Øst), og Østlandstour er en egen serie-kunde (895). Region-kundene lister
 * BÅDE Olyo Juniortour OG "Region Tour"-kval (til Garmin Norgescup) o.l., så
 * onlyMatching begrenser dem til Olyo-eventene.
 *
 * Vi holder oss bevisst til føderasjons- og tour-kunder, ikke de ~135 klubbene,
 * fordi vi IKKE skal ha lokale klubbturneringer.
 *
 * Pure module (ingen DB/prisma) — kan importeres fra både app og scripts.
 */

export type GolfBoxCustomerSource = {
  customerId: number;
  /** Visningsnavn (kun for logging/admin). */
  label: string;
  /** Default tour-kode hvis event-navnet ikke matcher en mer spesifikk regel. */
  defaultTour: "amateur-no" | "junior-no";
  /**
   * Olyo-regionsnavn. Festes i Tournament.notes (krets) så regionale Olyo-
   * turneringer kan filtreres per region (f.eks. "Øst" = Østlandet Øst).
   */
  region?: string;
  /**
   * Hvis satt: hopp over events i kundens schedule som IKKE matcher. Brukes på
   * Olyo-region-kundene, som også inneholder Region Tour-kval o.l. vi ikke vil ha.
   */
  onlyMatching?: RegExp;
};

// Kuraterte norske tour-/føderasjonskunder.
export const NO_TOUR_CUSTOMERS: GolfBoxCustomerSource[] = [
  { customerId: 18, label: "Norges Golfforbund", defaultTour: "amateur-no" },
  { customerId: 154, label: "Norsk Senior Golf", defaultTour: "amateur-no" },
  { customerId: 184, label: "Mid Am Tour", defaultTour: "amateur-no" },
  // Olyo Juniortour — én kunde per NGF-region. onlyMatching holder disse kundene
  // til Olyo + Region Tour (Garmin Norgescup-kvalifisering, verifisert 2026-08-17
  // å faktisk ligge her — se docs/turnering-datakilder.md); region festes i notes
  // for regionfiltrering.
  { customerId: 878, label: "Olyo Region Øst", defaultTour: "junior-no", region: "Øst", onlyMatching: /olyo|region.?tour/i },
  { customerId: 877, label: "Olyo Region Viken Vest", defaultTour: "junior-no", region: "Viken Vest", onlyMatching: /olyo|region.?tour/i },
  { customerId: 876, label: "Olyo Region Sør", defaultTour: "junior-no", region: "Sør", onlyMatching: /olyo|region.?tour/i },
  { customerId: 875, label: "Olyo Region Rogaland", defaultTour: "junior-no", region: "Rogaland", onlyMatching: /olyo|region.?tour/i },
  { customerId: 874, label: "Olyo Region Vestland", defaultTour: "junior-no", region: "Vestland", onlyMatching: /olyo|region.?tour/i },
  { customerId: 873, label: "Olyo Region Midt", defaultTour: "junior-no", region: "Midt", onlyMatching: /olyo|region.?tour/i },
  // Østlandstour — egen serie-kunde (amatør/junior, flere WAGR-tellende runder).
  { customerId: 895, label: "Østlandstour", defaultTour: "amateur-no" },
  // Region Nord Norge — egen serie-kunde for Region Tour (herrer/damer), samme
  // mønster som Østlandstour. Kartlagt 2026-08-30 (manglet helt frem til da).
  { customerId: 1442, label: "Region Nord Norge", defaultTour: "amateur-no" },
];

export type TourClassification = {
  /** tour-kode brukt på Tournament.tour */
  tour: string;
  /** sourceOrigin på Tournament (organisator/serie) */
  sourceOrigin: string;
  /** PublicPlayer.tier for deltakere */
  playerTier: "amateur" | "junior";
};

/**
 * Klassifiser en turnering ut fra navnet til riktig tour/origin/tier.
 * Junior-signaler (Jr NM, GU/JU-klasser, "junior") → junior-no.
 *
 * Narvesen Tour (NGFs nasjonale juniortour) ligger under NGF-kunden (18) i
 * GolfBox — samme kunde som Srixon/Norgescup — og fanges derfor på navn her,
 * ikke via egen customerId. Dekningen må verifiseres mot ekte GolfBox-data
 * ved neste scraper-kjøring (customer-rommet er ikke re-enumerert for
 * Narvesen spesifikt).
 */
export function classifyTour(
  name: string,
  fallback: GolfBoxCustomerSource["defaultTour"],
): TourClassification {
  const n = name.toLowerCase();

  const isJunior =
    /\bjr\b|junior|future camp|\bgu\d|\bju\d|gutter|jenter|norgeslekene/.test(n);

  // Region Tour (Garmin Norgescup-kvalifisering, kartlagt 2026-08-17): sjekkes FØR
  // norgescup/nm-mønstrene, fordi navn som "Region Tour 4 - Kval til Garmin
  // Norgescup 5 - NM" ellers ville truffet NORGESCUP/NM-grenen i stedet.
  if (/region.?tour/.test(n))
    return { tour: "junior-no", sourceOrigin: "REGIONTOUR", playerTier: "junior" };
  if (/srixon/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "SRIXON", playerTier: isJunior ? "junior" : "amateur" };
  if (/norgescup|norges ?cup/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "NORGESCUP", playerTier: isJunior ? "junior" : "amateur" };
  if (/olyo/.test(n))
    return { tour: "junior-no", sourceOrigin: "OLYO", playerTier: "junior" };
  // Narvesen Tour er alltid junior — uavhengig av junior-signal i navnet.
  if (/narvesen/.test(n))
    return { tour: "junior-no", sourceOrigin: "NARVESEN", playerTier: "junior" };
  if (/østlandstour|ostlandstour/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "OSTLANDS", playerTier: isJunior ? "junior" : "amateur" };
  if (/mid ?am/.test(n))
    return { tour: "amateur-no", sourceOrigin: "MIDAM", playerTier: "amateur" };
  if (/senior/.test(n))
    return { tour: "amateur-no", sourceOrigin: "SENIOR", playerTier: "amateur" };
  if (/\bnm\b|mesterskap/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "NM", playerTier: isJunior ? "junior" : "amateur" };

  const tour = isJunior ? "junior-no" : fallback;
  return {
    tour,
    sourceOrigin: "GOLFBOX",
    playerTier: tour === "junior-no" ? "junior" : "amateur",
  };
}

/** Slug for Tournament/PublicPlayer — samme normalisering som øvrig sync. */
export function golfboxSlugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[æå]/g, "a")
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

/** Avled turneringsstatus fra datoer (UTC-dag-granularitet). */
export function deriveStatus(
  start: Date | null,
  end: Date | null,
  now: Date,
): "UPCOMING" | "IN_PROGRESS" | "COMPLETED" {
  if (!start) return "UPCOMING";
  const dayMs = 24 * 60 * 60 * 1000;
  const endOfEnd = (end ?? start).getTime() + dayMs; // hele sluttdagen teller
  if (now.getTime() < start.getTime()) return "UPCOMING";
  if (now.getTime() > endOfEnd) return "COMPLETED";
  return "IN_PROGRESS";
}
