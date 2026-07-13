/**
 * Delte konstanter for AgencyOS Marketing (M1). Egen fil fordi actions.ts er
 * "use server" (kan kun eksportere async-funksjoner).
 */

export const MARKETING_KANALER = ["IG", "FB", "LINKEDIN", "TIKTOK"] as const;
export type MarketingKanal = (typeof MARKETING_KANALER)[number];

export const MARKETING_STATUSER = ["UTKAST", "KLAR", "PUBLISERT"] as const;
export type MarketingStatus = (typeof MARKETING_STATUSER)[number];

/** Visningsnavn per kanal (UI viser aldri råkodene). */
export const KANAL_NAVN: Record<MarketingKanal, string> = {
  IG: "Instagram",
  FB: "Facebook",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
};
