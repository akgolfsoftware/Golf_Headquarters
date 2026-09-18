import type { TnScreen } from "./access";

export type NavItem = { id: TnScreen; label: string; badge?: string };
export type NavGroup = { heading: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Daglig",
    items: [
      { id: "oversikt", label: "Oversikt" },
      { id: "spillere", label: "Workdesk" },
      { id: "iup", label: "IUP i dag" },
      { id: "iup-kart", label: "IUP-modulkart" },
      { id: "iup-samtale", label: "IUP-samtale" },
      { id: "maltavle", label: "Måltavle" },
      { id: "live", label: "Live" },
      { id: "fellestesting", label: "Fellestesting" },
      { id: "samling", label: "Samlingspunkt", badge: "1" },
      { id: "college", label: "Collegegruppen" },
      { id: "manedsplan", label: "Månedsplan", badge: "2" },
      { id: "utviklingssjekk", label: "Utviklingssjekk" },
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
      { id: "utoverpost", label: "Post til spiller" },
      { id: "dokumenter", label: "Dokumenter", badge: "2" },
      { id: "samtykke", label: "Samtykke" },
      { id: "samtykke-reise", label: "Samtykkereise" },
    ],
  },
  {
    heading: "Data",
    items: [
      { id: "protokoller", label: "Protokollbibliotek" },
      { id: "protokolldetalj", label: "Protokolldetalj" },
      { id: "turneringer", label: "Turneringer" },
      { id: "ny-turnering", label: "Legg til turnering" },
      { id: "referanse", label: "Referansenivåer" },
      { id: "testreise", label: "Testreise" },
      { id: "prosessmal", label: "Prosessmål" },
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

export const MOBILE_TABS: { id: TnScreen | "mer"; label: string }[] = [
  { id: "oversikt", label: "Oversikt" },
  { id: "samling", label: "Samling" },
  { id: "uttak", label: "Uttak" },
  { id: "poster", label: "Poster" },
  { id: "mer", label: "Mer" },
];

/** SP/FO — Claw spillerblikk. Ikke trenerens dekning som hjem. */
export const PLAYER_NAV_GROUPS: NavGroup[] = [
  {
    heading: "Meg",
    items: [
      { id: "iup", label: "IUP i dag" },
      { id: "live", label: "Live" },
      { id: "manedsplan", label: "Månedsplan" },
      { id: "maltavle", label: "Måltavle" },
      { id: "utviklingssjekk", label: "Utviklingssjekk" },
    ],
  },
  {
    heading: "Gruppe",
    items: [
      { id: "samling", label: "Samlingspunkt", badge: "1" },
      { id: "poster", label: "Gruppeposter", badge: "3" },
      { id: "utoverpost", label: "Post til meg" },
      { id: "dokumenter", label: "Dokumenter" },
    ],
  },
  {
    heading: "Data",
    items: [
      { id: "turneringer", label: "Turneringer" },
      { id: "referanse", label: "Referansenivåer" },
      { id: "apparatet", label: "Trenerkatalog" },
    ],
  },
  {
    heading: "Samtykke",
    items: [
      { id: "samtykke", label: "Samtykke" },
      { id: "samtykke-reise", label: "Samtykkereise" },
    ],
  },
];

export const PLAYER_MOBILE_TABS: { id: TnScreen | "mer"; label: string }[] = [
  { id: "iup", label: "IUP" },
  { id: "samling", label: "Samling" },
  { id: "poster", label: "Poster" },
  { id: "turneringer", label: "Tour" },
  { id: "mer", label: "Mer" },
];


export const SCREEN_TITLES: Record<TnScreen, string> = {
  oversikt: "Oversikt",
  spillere: "Workdesk",
  fellestesting: "Fellestesting",
  samling: "Samlingspunkt",
  college: "Collegegruppen",
  manedsplan: "Månedsplan",
  uttak: "Uttaksliste",
  rangliste: "Rangliste",
  skoler: "Skoleoversikt",
  poster: "Gruppeposter",
  utoverpost: "Post til spiller",
  dokumenter: "Dokumenter",
  samtykke: "Samtykke",
  "samtykke-reise": "Samtykkereise",
  protokoller: "Protokollbibliotek",
  protokolldetalj: "Protokolldetalj",
  turneringer: "Turneringer",
  "ny-turnering": "Legg til turnering",
  referanse: "Referansenivåer",
  tilgang: "Trenere og tilgang",
  inviter: "Inviter spiller",
  apparatet: "Trenerkatalog",
  live: "Live",
  iup: "IUP i dag",
  "iup-kart": "IUP-modulkart",
  "iup-samtale": "IUP-samtale",
  maltavle: "Måltavle",
  prosessmal: "Prosessmål",
  testreise: "Testreise",
  utviklingssjekk: "Utviklingssjekk",
};
