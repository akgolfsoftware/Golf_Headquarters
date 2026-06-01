/**
 * Register over norske GolfBox-kunder vi henter terminliste + resultater fra.
 *
 * Verifisert ved enumerering av GolfBox customer-rommet (2026-06-01):
 * customer 18 = Norges Golfforbund lister alle nasjonale tourer (Srixon,
 * Garmin Norgescup, NM, Jr NM, Para Norgescup …) — IKKE klubbturneringer.
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
};

// Kuraterte norske tour-/føderasjonskunder. Utvides når flere tourer kartlegges
// (f.eks. Olyo regionskunder).
export const NO_TOUR_CUSTOMERS: GolfBoxCustomerSource[] = [
  { customerId: 18, label: "Norges Golfforbund", defaultTour: "amateur-no" },
  { customerId: 154, label: "Norsk Senior Golf", defaultTour: "amateur-no" },
  { customerId: 184, label: "Mid Am Tour", defaultTour: "amateur-no" },
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
 */
export function classifyTour(
  name: string,
  fallback: GolfBoxCustomerSource["defaultTour"],
): TourClassification {
  const n = name.toLowerCase();

  const isJunior =
    /\bjr\b|junior|future camp|\bgu\d|\bju\d|gutter|jenter|norgeslekene/.test(n);

  if (/srixon/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "SRIXON", playerTier: isJunior ? "junior" : "amateur" };
  if (/norgescup|norges ?cup/.test(n))
    return { tour: isJunior ? "junior-no" : "amateur-no", sourceOrigin: "NORGESCUP", playerTier: isJunior ? "junior" : "amateur" };
  if (/olyo/.test(n))
    return { tour: "junior-no", sourceOrigin: "OLYO", playerTier: "junior" };
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
