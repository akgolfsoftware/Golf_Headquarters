import type { WangRole } from "./types";

export type WangModuleId =
  | "overview"
  | "schools"
  | "school-overview"
  | "sports"
  | "workbench"
  | "athletes"
  | "analysis"
  | "camps"
  | "messages"
  | "my-week"
  | "school"
  | "my-training"
  | "competitions"
  | "calendar"
  | "plans"
  | "contacts"
  | "test-profiles";

export interface WangRoleDefinition {
  label: string;
  heading: string;
  description: string;
  privacyNotice: string;
  modules: WangModuleId[];
}

export const WANG_MODULES: Record<
  WangModuleId,
  { label: string; href: string | null; description: string }
> = {
  overview: {
    label: "Oversikt",
    href: "/team-wang/app",
    description: "Startside med rolle, omfang og neste handling.",
  },
  schools: {
    label: "Skoler og idretter",
    href: null,
    description: "Samlet status per skole og idrett bygges i neste modul.",
  },
  "school-overview": {
    label: "Skoleoversikt",
    href: null,
    description: "Alle idretter ved egen skole bygges i neste modul.",
  },
  sports: {
    label: "Idretter",
    href: "/team-wang/demo",
    description: "Golf-demoen viser mønsteret før de øvrige idrettene kobles på.",
  },
  workbench: {
    label: "Workbench",
    href: "/team-wang/app/workbench",
    description: "Årsplan, periode, måned, uke og økt for tildelte grupper.",
  },
  athletes: {
    label: "Utøvere",
    href: "/team-wang/app/utovere",
    description: "Rolleavgrenset elevliste for egen skole eller tildelt idrett.",
  },
  analysis: {
    label: "Analyse og tester",
    href: "/team-wang/demo",
    description: "Golf-demoen viser struktur uten oppdiktet fagmodell.",
  },
  camps: {
    label: "Samlinger",
    href: "/team-wang/app/kalender?visning=samlinger",
    description: "Samlinger i kalenderen for tildelte grupper eller delt elev.",
  },
  messages: {
    label: "Meldinger",
    href: "/team-wang/app/meldinger",
    description: "Rolleavgrenset, skrivebeskyttet innboks. Sending og e-post er ikke aktivert.",
  },
  "my-week": {
    label: "Min uke",
    href: "/team-wang/app/kalender",
    description: "Skole, WANG-trening, konkurranser og egen trening samlet.",
  },
  school: {
    label: "Skole",
    href: "/team-wang",
    description: "Åpen årsplan og skoleinformasjon uten elevnavn.",
  },
  "my-training": {
    label: "Min trening",
    href: "/team-wang/app/kalender?visning=trening",
    description: "WANG-, egen- og klubbtrening i elevens kalender.",
  },
  competitions: {
    label: "Konkurranser",
    href: "/team-wang/app/kalender?visning=konkurranser",
    description: "Kommende konkurranser i den delte kalenderen.",
  },
  calendar: {
    label: "Kalender",
    href: "/team-wang/app/kalender",
    description: "Avgrenset lesevisning uten søvn, dagsform eller helseopplysninger.",
  },
  plans: {
    label: "Planer",
    href: "/team-wang",
    description: "Publiserte planer kan leses uten sensitive opplysninger.",
  },
  contacts: {
    label: "Kontakter",
    href: null,
    description: "Inviterte kontakter og tilgangsperiode bygges i neste modul.",
  },
  "test-profiles": {
    label: "Testprofiler",
    href: "/team-wang/app/testprofiler",
    description: "Sikre, fiktive rolleprofiler uten kontoer, e-post eller ekte persondata.",
  },
};

export const WANG_ROLE_DEFINITIONS: Record<WangRole, WangRoleDefinition> = {
  central_admin: {
    label: "Eier / sentral admin",
    heading: "Hele WANG i ett bilde",
    description: "Samlet status for skoler, idretter og planer.",
    privacyNotice:
      "Du ser samlet status. Navngitte elever åpnes ikke automatisk for sentral admin.",
    modules: ["overview", "schools", "plans", "test-profiles"],
  },
  school_leader: {
    label: "Skoleleder",
    heading: "Skoleoversikt",
    description: "Alle idretter og planer ved egen skole.",
    privacyNotice: "Morgeninnsjekk og søvndata er begrenset til sportssjef og trener.",
    modules: ["overview", "school-overview", "sports", "athletes", "calendar", "plans", "messages"],
  },
  principal: {
    label: "Rektor",
    heading: "Skoleoversikt",
    description: "Alle idretter, planer og elevprofiler ved egen skole.",
    privacyNotice: "Morgeninnsjekk og søvndata er begrenset til sportssjef og trener.",
    modules: ["overview", "school-overview", "sports", "athletes", "calendar", "plans", "messages"],
  },
  head_of_sports: {
    label: "Toppidrettssjef",
    heading: "Skoleoversikt",
    description: "Alle idretter, planer og elevprofiler ved egen skole.",
    privacyNotice: "Morgeninnsjekk og søvndata er begrenset til sportssjef og trener.",
    modules: ["overview", "school-overview", "sports", "athletes", "calendar", "plans", "messages"],
  },
  sports_director: {
    label: "Sportssjef",
    heading: "Idrettsoversikt",
    description: "Planlegging, oppfølging og analyse for tildelt idrett.",
    privacyNotice: "Du ser bare utøvere og morgeninnsjekk i idretter du er tildelt.",
    modules: ["overview", "workbench", "athletes", "analysis", "camps", "messages"],
  },
  coach: {
    label: "Trener",
    heading: "Idrettsoversikt",
    description: "Planlegging, oppfølging og analyse for tildelt idrett.",
    privacyNotice: "Du ser bare utøvere og morgeninnsjekk i idretter du er tildelt.",
    modules: ["overview", "workbench", "athletes", "analysis", "camps", "messages"],
  },
  student: {
    label: "Elev / utøver",
    heading: "Min uke",
    description: "Skole, WANG-trening, konkurranser og egen trening samlet.",
    privacyNotice:
      "Skole- og WANG-hendelser er låst. Egen- og klubbtrening du oppretter selv kan endres.",
    modules: ["overview", "my-week", "school", "my-training", "competitions", "messages"],
  },
  guardian: {
    label: "Foresatt",
    heading: "Elevens uke",
    description: "Planer og praktisk informasjon for eleven du er invitert til.",
    privacyNotice: "Søvn og dagsform vises aldri i foresattvisningen.",
    modules: ["overview", "calendar", "plans", "camps", "messages", "contacts"],
  },
  club_coach: {
    label: "Klubbtrener",
    heading: "Samarbeid rundt utøveren",
    description: "Avtalt trening og konkurranser innenfor elevens aktive invitasjon.",
    privacyNotice:
      "Tilgangen har sluttdato og kan trekkes tilbake av eleven. Søvn og dagsform er ikke delt.",
    modules: ["overview", "calendar", "plans", "competitions", "messages", "contacts"],
  },
  readonly: {
    label: "Lesetilgang",
    heading: "Delt oversikt",
    description: "Bare innhold som er uttrykkelig delt med kontoen.",
    privacyNotice: "Ingen personopplysninger vises uten en aktiv og avgrenset relasjon.",
    modules: ["overview", "plans"],
  },
};

export function hentWangRolledefinisjon(role: WangRole): WangRoleDefinition {
  return WANG_ROLE_DEFINITIONS[role];
}

export function hentWangModulHref(moduleId: WangModuleId, preview: boolean): string | null {
  const href = WANG_MODULES[moduleId].href;
  if (preview && href?.startsWith("/team-wang/app")) return "/team-wang/demo";
  return href;
}
