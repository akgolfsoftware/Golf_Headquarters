import type { ScreenId } from "./access";

export type NavItem = {
  id: ScreenId;
  label: string;
  badge?: string;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Daglig",
    items: [
      { id: "oversikt", label: "Oversikt" },
      { id: "spillere", label: "Spillere" },
      { id: "fellestesting", label: "Fellestesting" },
      { id: "samling", label: "Samlingspunkt", badge: "1" },
      { id: "college", label: "Collegegruppen" },
      { id: "manedsplan", label: "Månedsplan", badge: "2" },
    ],
  },
  {
    heading: "Uttak",
    items: [
      { id: "uttak", label: "Uttaksliste", badge: "2" },
      { id: "rangliste", label: "Rangliste" },
    ],
  },
  {
    heading: "Skoler",
    items: [{ id: "skoler", label: "Skoleoversikt", badge: "4" }],
  },
  {
    heading: "Kommunikasjon",
    items: [
      { id: "poster", label: "Gruppeposter", badge: "3" },
      { id: "utoverpost", label: "Poster til utøver" },
      { id: "dokumenter", label: "Dokumenter", badge: "2" },
      { id: "samtykke", label: "Samtykke" },
    ],
  },
  {
    heading: "Data",
    items: [
      { id: "protokoller", label: "Protokollbibliotek" },
      { id: "turneringer", label: "Turneringer" },
      { id: "ny-turnering", label: "Legg til turnering" },
      { id: "referanse", label: "Referansenivåer" },
    ],
  },
  {
    heading: "Administrasjon",
    items: [
      { id: "tilgang", label: "Trenere og tilgang" },
      { id: "inviter", label: "Inviter spiller", badge: "2" },
      { id: "apparatet", label: "Trenerkatalog" },
    ],
  },
];

export const MOBILE_TABS: { id: ScreenId | "mer"; label: string }[] = [
  { id: "oversikt", label: "Oversikt" },
  { id: "samling", label: "Samling" },
  { id: "uttak", label: "Uttak" },
  { id: "poster", label: "Poster" },
  { id: "mer", label: "Mer" },
];

export const SCREEN_TITLES: Record<ScreenId, string> = {
  oversikt: "Oversikt",
  spillere: "Spillere",
  fellestesting: "Fellestesting",
  samling: "Samlingspunkt",
  college: "Collegegruppen",
  manedsplan: "Månedsplan",
  uttak: "Uttaksliste",
  rangliste: "Rangliste",
  skoler: "Skoleoversikt",
  poster: "Gruppeposter",
  utoverpost: "Poster til utøver",
  dokumenter: "Dokumenter",
  samtykke: "Samtykke",
  protokoller: "Protokollbibliotek",
  protokolldetalj: "Protokolldetalj",
  turneringer: "Turneringer",
  "ny-turnering": "Legg til turnering",
  referanse: "Referansenivåer",
  tilgang: "Trenere og tilgang",
  inviter: "Inviter spiller",
  apparatet: "Trenerkatalog",
};
