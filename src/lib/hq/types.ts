export type AdminRole = "COACH" | "ADMIN";
export type PortalRole = "SP" | "FO" | "GRATIS";

export type UiState =
  | "normal"
  | "tom"
  | "laster"
  | "feil"
  | "frakoblet"
  | "tilgang"
  | "lagrer"
  | "lagret"
  | "ukjent"
  | "pauset"
  | "delvis"
  | "gjennomfort"
  | "planlagt"
  | "pagar"
  | "offline"
  | "ekstra";

export type AdminScreenId =
  | "hjem"
  | "kalender-dag"
  | "okt-individuell"
  | "okt-gruppe"
  | "live-coach"
  | "live-gruppe"
  | "oppsummering-coach"
  | "live-oversikt"
  | "stall"
  | "kalender-uke"
  | "kalender-maned"
  | "stall-analyse"
  | "ops-feillogg"
  | "ops-triage"
  | "ops-kontroll"
  | "ops-restore"
  | "ops-resultat"
  | "ops-kvittering"
  | "spor"
  | "spor-detalj"
  | "innboks"
  | "trad"
  | "planlegge"
  | "workbench"
  | "publiser"
  | "gruppe"
  | "arsplan"
  | "periode"
  | "maned"
  | "oktbygger"
  | "stall-dag"
  | "ovelsesbibliotek"
  | "ovelse"
  | "program"
  | "ko"
  | "forslag"
  | "bekreft"
  | "resultat-caddie"
  | "forkast"
  | "publiser-ovelse"
  | "moderering"
  | "versjon"
  | "avpubliser"
  | "abonnement"
  | "min-uke"
  | "oppsett";

export type PortalScreenId =
  | "i-dag"
  | "plan"
  | "oktoppskrift"
  | "live-slag"
  | "live-ovelse"
  | "oppsummering"
  | "analyse"
  | "live-desktop"
  | "datakilder"
  | "forhold"
  | "datagolf"
  | "stasjon"
  | "kurve"
  | "talent"
  | "banegrunnlag"
  | "mal"
  | "fremgang"
  | "varsler"
  | "coachkontakt"
  | "runder"
  | "scorekort"
  | "aerlig"
  | "trackman"
  | "trackman-okt"
  | "bag"
  | "gameplan"
  | "hull"
  | "posisjon"
  | "offline"
  | "utfordringer"
  | "utfordring"
  | "tek-plan"
  | "meg";

export const ADMIN_SCREENS: AdminScreenId[] = [
  "hjem",
  "kalender-dag",
  "okt-individuell",
  "okt-gruppe",
  "live-coach",
  "live-gruppe",
  "oppsummering-coach",
  "live-oversikt",
  "stall",
  "kalender-uke",
  "kalender-maned",
  "stall-analyse",
  "ops-feillogg",
  "ops-triage",
  "ops-kontroll",
  "ops-restore",
  "ops-resultat",
  "ops-kvittering",
  "spor",
  "spor-detalj",
  "innboks",
  "trad",
  "planlegge",
  "workbench",
  "publiser",
  "gruppe",
  "arsplan",
  "periode",
  "maned",
  "oktbygger",
  "stall-dag",
  "ovelsesbibliotek",
  "ovelse",
  "program",
  "ko",
  "forslag",
  "bekreft",
  "resultat-caddie",
  "forkast",
  "publiser-ovelse",
  "moderering",
  "versjon",
  "avpubliser",
  "abonnement",
  "min-uke",
  "oppsett",
];

export const PORTAL_SCREENS: PortalScreenId[] = [
  "i-dag",
  "plan",
  "oktoppskrift",
  "live-slag",
  "live-ovelse",
  "oppsummering",
  "analyse",
  "live-desktop",
  "datakilder",
  "forhold",
  "datagolf",
  "stasjon",
  "kurve",
  "talent",
  "banegrunnlag",
  "mal",
  "fremgang",
  "varsler",
  "coachkontakt",
  "runder",
  "scorekort",
  "aerlig",
  "trackman",
  "trackman-okt",
  "bag",
  "gameplan",
  "hull",
  "posisjon",
  "offline",
  "utfordringer",
  "utfordring",
  "tek-plan",
  "meg",
];

export const ADMIN_TITLES: Record<AdminScreenId, string> = {
  hjem: "Hjem",
  "kalender-dag": "Kalender · dag",
  "okt-individuell": "Øktdetalj · individuell",
  "okt-gruppe": "Øktdetalj · gruppe",
  "live-coach": "Gjennomføring · individuell",
  "live-gruppe": "Gjennomføring · gruppe",
  "oppsummering-coach": "Oppsummering · coach",
  "live-oversikt": "Live-oversikt",
  stall: "Stall",
  "kalender-uke": "Kalender · uke",
  "kalender-maned": "Kalender · måned",
  "stall-analyse": "Stall · analyse",
  "ops-feillogg": "Feillogg",
  "ops-triage": "Triage",
  "ops-kontroll": "Kontrolløkt",
  "ops-restore": "Restore mot klon",
  "ops-resultat": "Restore-resultat",
  "ops-kvittering": "Hendelseskvittering",
  spor: "AgenticOS-spor",
  "spor-detalj": "Kjøringsdetalj",
  innboks: "Innboks",
  trad: "Tråd",
  planlegge: "Planlegge",
  workbench: "Workbench · uke",
  publiser: "Publiser",
  gruppe: "Gruppeøkt",
  arsplan: "Årsplan",
  periode: "Periode",
  maned: "Måned",
  oktbygger: "Øktbygger",
  "stall-dag": "Stall-dag",
  ovelsesbibliotek: "Øvelsesbibliotek",
  ovelse: "Øvelse ØV-2105",
  program: "Program Ø-4401",
  ko: "Godkjenningskø",
  forslag: "Forslag CD-8401",
  bekreft: "Bekreft før mutasjon",
  "resultat-caddie": "Resultat NTF-8401",
  forkast: "Forkast",
  "publiser-ovelse": "Publiser øvelse",
  moderering: "Moderering",
  versjon: "Versjonering",
  avpubliser: "Avpublisering",
  abonnement: "Abonnement",
  "min-uke": "Min uke",
  oppsett: "Oppsett",
};

export const PORTAL_TITLES: Record<PortalScreenId, string> = {
  "i-dag": "I dag",
  plan: "Plan · uke 38",
  oktoppskrift: "Øktoppskrift",
  "live-slag": "Live · slag",
  "live-ovelse": "Live · øvelse",
  oppsummering: "Oppsummering",
  analyse: "Analyse · slag spart",
  "live-desktop": "Live · desktop",
  datakilder: "Datakilder",
  forhold: "Forholdssimulering",
  datagolf: "DataGolf",
  stasjon: "Stasjon",
  kurve: "Min kurve",
  talent: "Talent",
  banegrunnlag: "Banegrunnlag",
  mal: "Mål",
  fremgang: "Fremgang",
  varsler: "Varsler",
  coachkontakt: "Coachkontakt",
  runder: "Runder",
  scorekort: "Scorekort R-6201",
  aerlig: "Ærlig grunnlag",
  trackman: "TrackMan-import",
  "trackman-okt": "TrackMan-økt TM-7301",
  bag: "Min bag",
  gameplan: "Banebibliotek",
  hull: "Hulldetalj",
  posisjon: "Posisjon",
  offline: "Frakoblet kø",
  utfordringer: "Utfordringer",
  utfordring: "Utfordring UTF-4407",
  "tek-plan": "Teknisk plan",
  meg: "Meg",
};

export function isAdminScreen(value: string): value is AdminScreenId {
  return (ADMIN_SCREENS as string[]).includes(value);
}

export function isPortalScreen(value: string): value is PortalScreenId {
  return (PORTAL_SCREENS as string[]).includes(value);
}

export function isUiState(value: string): value is UiState {
  return (
    [
      "normal",
      "tom",
      "laster",
      "feil",
      "frakoblet",
      "tilgang",
      "lagrer",
      "lagret",
      "ukjent",
      "pauset",
      "delvis",
      "gjennomfort",
      "planlagt",
      "pagar",
      "offline",
      "ekstra",
    ] as string[]
  ).includes(value);
}
