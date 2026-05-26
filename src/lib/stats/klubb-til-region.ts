/**
 * Klubb-til-region mapping
 *
 * Mapping av norske golfklubber til én av 5 geografiske regioner.
 * Basert på klubbens fylke/kommune.
 *
 * Regioner:
 *   ost  — Oslo, Akershus, Buskerud, Vestfold, Telemark, Innlandet
 *   vest — Vestland, Rogaland
 *   midt — Trøndelag, Møre og Romsdal
 *   nord — Nordland, Troms, Finnmark
 *   sor  — Agder
 */

export type RegionSlug = "ost" | "vest" | "midt" | "nord" | "sor";

export interface RegionInfo {
  slug: RegionSlug;
  navn: string;
  fylker: string[];
  /** Svak farge brukt i kart og region-cards */
  farge: string;
  fargeStrong: string;
}

export const REGIONER: RegionInfo[] = [
  {
    slug: "ost",
    navn: "Øst-Norge",
    fylker: ["Oslo", "Akershus", "Buskerud", "Vestfold", "Telemark", "Innlandet"],
    farge: "rgba(0, 88, 64, 0.12)",
    fargeStrong: "hsl(var(--primary))",
  },
  {
    slug: "vest",
    navn: "Vest-Norge",
    fylker: ["Vestland", "Rogaland"],
    farge: "rgba(209, 248, 67, 0.25)",
    fargeStrong: "#8CA015",
  },
  {
    slug: "midt",
    navn: "Midt-Norge",
    fylker: ["Trøndelag", "Møre og Romsdal"],
    farge: "rgba(30, 100, 200, 0.10)",
    fargeStrong: "#1E64C8",
  },
  {
    slug: "nord",
    navn: "Nord-Norge",
    fylker: ["Nordland", "Troms", "Finnmark"],
    farge: "rgba(120, 60, 180, 0.10)",
    fargeStrong: "#783CB4",
  },
  {
    slug: "sor",
    navn: "Sør-Norge",
    fylker: ["Agder"],
    farge: "rgba(200, 80, 30, 0.10)",
    fargeStrong: "#C8501E",
  },
];

/**
 * Nøkkelord i klubbnavn → region-slug
 * Prioritert søk: lengste match vinner.
 */
const KLUBB_KEYWORDS: Array<{ keywords: string[]; region: RegionSlug }> = [
  // Øst
  { keywords: ["oslo", "bærum", "akershus", "romerike", "follo", "asker", "nesodden", "ski gk", "nordre follo", "hvam", "kongsvinger", "hamar", "gjøvik", "lillehammer", "brumunddal", "hedmark", "oppland", "ringerike", "drammen", "lier", "holmestrand", "horten", "tønsberg", "sandefjord", "larvik", "skien", "porsgrunn", "notodden", "telemark", "vestfold", "numedal", "numedal", "prestfoss", "hallingdal"], region: "ost" },
  // Vest
  { keywords: ["bergen", "stavanger", "sandnes", "haugesund", "jæren", "ryfylke", "hardanger", "voss", "sunnhordland", "forde", "sogndal", "florø", "volda", "ålesund", "molde", "kristiansund", "vestland", "rogaland"], region: "vest" },
  // Midt
  { keywords: ["trondheim", "trøndelag", "steinkjer", "namsos", "verdal", "levanger", "røros", "oppdal"], region: "midt" },
  // Nord
  { keywords: ["bodø", "narvik", "tromsø", "harstad", "sortland", "hammerfest", "alta", "nordland", "troms", "finnmark"], region: "nord" },
  // Sør
  { keywords: ["kristiansand", "arendal", "grimstad", "lillesand", "mandal", "farsund", "flekkefjord", "agder", "vennesla"], region: "sor" },
];

/**
 * Bestem region for et klubbnavn.
 * Returnerer "ost" som fallback hvis ingen match.
 */
export function klubbTilRegion(klubbNavn: string): RegionSlug {
  const lower = klubbNavn.toLowerCase();

  for (const entry of KLUBB_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.region;
    }
  }

  // GFGK = Gamle Fredrikstad GK → spesialcase (Øst)
  if (lower.includes("fredrikstad") || lower.includes("gfgk") || lower.includes("østfold")) {
    return "ost";
  }

  return "ost"; // Fallback
}

export function regionForSlug(slug: string): RegionInfo | undefined {
  return REGIONER.find((r) => r.slug === slug);
}
