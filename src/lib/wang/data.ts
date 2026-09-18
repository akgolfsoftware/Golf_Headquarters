import type {
  ConsentRow,
  Membership,
  ParentRelation,
  Player,
  Role,
  School,
} from "./access";

export const GROUPS = [
  { id: "g-golf", name: "WANG Golf 2026" },
  { id: "g-u16", name: "WANG Golf U16" },
  { id: "g-jenter", name: "TN Jenter Øst" },
  { id: "g-gutter", name: "TN Gutter Øst" },
  { id: "g-college", name: "Collegegruppen" },
  { id: "g-samling", name: "Høstsamling Halmstad" },
] as const;

export const SCHOOLS: School[] = [
  { id: "s-wang", name: "WANG Toppidrett Fredrikstad" },
  { id: "s-glemmen", name: "Glemmen vgs" },
  { id: "s-olav", name: "St. Olav vgs" },
  { id: "s-kirke", name: "Kirkeparken vgs" },
];

export const USERS = {
  anders: { id: "u-anders", name: "Anders Kristiansen", role: "SS" as Role },
  marte: { id: "u-marte", name: "Marte Berg", role: "TR" as Role },
  jonas: { id: "u-jonas-trener", name: "Jonas Nilsen", role: "HJ" as Role },
  emma: { id: "u-emma", name: "Emma Larsen", role: "SP" as Role },
  ida: { id: "u-ida", name: "Ida Strand", role: "SP" as Role },
  kari: { id: "u-kari", name: "Kari Larsen", role: "FO" as Role },
  per: { id: "u-per", name: "Per Holm", role: "EL" as Role, schoolId: "s-wang" },
};

export const PLAYERS: Player[] = [
  {
    id: "u-emma",
    name: "Emma Larsen",
    age: 16,
    requiresGuardianConsent: true,
    schoolId: "s-wang",
    groupIds: ["g-golf", "g-jenter"],
    parentId: "u-kari",
  },
  {
    id: "u-ida",
    name: "Ida Strand",
    age: 15,
    requiresGuardianConsent: true,
    schoolId: "s-wang",
    groupIds: ["g-golf", "g-u16"],
    parentId: null,
  },
  {
    id: "u-marius",
    name: "Marius Dahl",
    age: 18,
    requiresGuardianConsent: false,
    schoolId: "s-wang",
    groupIds: ["g-golf", "g-college"],
    parentId: null,
  },
  {
    id: "u-sofie",
    name: "Sofie Holm",
    age: 17,
    requiresGuardianConsent: true,
    schoolId: "s-wang",
    groupIds: ["g-golf"],
    parentId: "u-kari2",
  },
  {
    id: "u-noah",
    name: "Noah Berg",
    age: 16,
    requiresGuardianConsent: true,
    schoolId: "s-wang",
    groupIds: ["g-golf", "g-gutter"],
    parentId: "u-berg",
  },
  {
    id: "u-lea",
    name: "Lea Moen",
    age: 17,
    requiresGuardianConsent: true,
    schoolId: "s-kirke",
    groupIds: ["g-jenter"],
    parentId: "u-moen",
  },
  {
    id: "u-isak",
    name: "Isak Nygård",
    age: 18,
    requiresGuardianConsent: false,
    schoolId: "s-kirke",
    groupIds: ["g-gutter"],
    parentId: null,
  },
  {
    id: "u-thea",
    name: "Thea Vik",
    age: 16,
    requiresGuardianConsent: true,
    schoolId: "s-kirke",
    groupIds: ["g-jenter"],
    parentId: "u-vik",
  },
  {
    id: "u-elias",
    name: "Elias Ruud",
    age: 17,
    requiresGuardianConsent: true,
    schoolId: "s-kirke",
    groupIds: ["g-gutter"],
    parentId: "u-ruud",
  },
  {
    id: "u-ada",
    name: "Ada Solberg",
    age: 16,
    requiresGuardianConsent: true,
    schoolId: "s-glemmen",
    groupIds: ["g-u16"],
    parentId: "u-solberg",
  },
  {
    id: "u-felix",
    name: "Felix Hauge",
    age: 15,
    requiresGuardianConsent: true,
    schoolId: "s-glemmen",
    groupIds: ["g-u16"],
    parentId: "u-hauge",
  },
  {
    id: "u-sara",
    name: "Sara Lien",
    age: 17,
    requiresGuardianConsent: true,
    schoolId: "s-olav",
    groupIds: ["g-jenter"],
    parentId: "u-lien",
  },
];

export const MEMBERSHIPS: Membership[] = [
  { userId: "u-anders", groupId: "g-golf", role: "COACH", endedAt: null },
  { userId: "u-anders", groupId: "g-u16", role: "COACH", endedAt: null },
  { userId: "u-anders", groupId: "g-jenter", role: "COACH", endedAt: null },
  { userId: "u-anders", groupId: "g-gutter", role: "COACH", endedAt: null },
  { userId: "u-anders", groupId: "g-college", role: "COACH", endedAt: null },
  { userId: "u-anders", groupId: "g-samling", role: "COACH", endedAt: null },
  { userId: "u-marte", groupId: "g-golf", role: "COACH", endedAt: null },
  { userId: "u-marte", groupId: "g-u16", role: "COACH", endedAt: null },
  { userId: "u-jonas-trener", groupId: "g-golf", role: "ASSISTANT", endedAt: null },
  { userId: "u-emma", groupId: "g-golf", role: "PLAYER", endedAt: null },
  { userId: "u-emma", groupId: "g-jenter", role: "PLAYER", endedAt: null },
  { userId: "u-ida", groupId: "g-golf", role: "PLAYER", endedAt: null },
  { userId: "u-marius", groupId: "g-golf", role: "PLAYER", endedAt: null },
  {
    userId: "u-gammel",
    groupId: "g-golf",
    role: "COACH",
    endedAt: "2026-06-01T00:00:00+02:00",
  },
];

export const PARENTS: ParentRelation[] = [
  { parentId: "u-kari", childId: "u-emma", approved: true },
  { parentId: "u-kari2", childId: "u-sofie", approved: true },
];

export const CONSENTS: ConsentRow[] = [
  {
    userId: "u-emma",
    scope: "skole-navn-ngf",
    mottakerGruppeId: "ngf",
    gitt: false,
    gittAvRolle: "FORESATT",
    at: "2026-08-01T10:00:00+02:00",
  },
  {
    userId: "u-emma",
    scope: "deling-tn",
    mottakerGruppeId: "g-golf",
    gitt: true,
    gittAvRolle: "FORESATT",
    at: "2026-09-01T10:00:00+02:00",
  },
];

export const TOURNAMENTS = [
  {
    playerId: "u-emma",
    playerName: "Emma Larsen",
    event: "Titleist Tour · Onsøy",
    rounds: "73 · 71",
    toPar: "+4",
    felt: "+1,2",
    kilde: "GOLFBOX" as const,
    utkast: false,
  },
  {
    playerId: "u-marius",
    playerName: "Marius Dahl",
    event: "Titleist Tour · Onsøy",
    rounds: "70 · 69",
    toPar: "−1",
    felt: "−3,8",
    kilde: "GOLFBOX" as const,
    utkast: false,
  },
  {
    playerId: "u-ida",
    playerName: "Ida Strand",
    event: "Junior Open Halmstad",
    rounds: "76",
    toPar: "+5",
    felt: null,
    kilde: "LAGT_INN_SELV" as const,
    utkast: true,
  },
];

export const COACHES = [
  { name: "Anders Kristiansen", title: "Sportssjef golf", groups: "Alle 6" },
  { name: "Marte Berg", title: "Hovedtrener", groups: "Golf 2026, U16" },
  { name: "Jonas Nilsen", title: "Hjelpetrener", groups: "Golf 2026" },
  { name: "Silje Aas", title: "Fysisk", groups: "—" },
  { name: "Thomas Wiik", title: "Mental", groups: "—" },
];

export const PROTOCOLS = [
  { id: "p-pei", name: "PEI nærspill", version: "v3", owner: "WANG Golf", locked: true },
  { id: "p-driver", name: "Driver basic", version: "v2", owner: "WANG Golf", locked: false },
  { id: "p-putt", name: "Putt 1–3 m", version: "v4", owner: "NGF delt", locked: true },
];

export const ROLE_ACTORS: { role: Role; userId: string; label: string; hint: string }[] = [
  { role: "SS", userId: "u-anders", label: "Sportssjef", hint: "Anders · alle 6 grupper" },
  { role: "TR", userId: "u-marte", label: "Trener", hint: "Marte · Golf + U16" },
  { role: "HJ", userId: "u-jonas-trener", label: "Hjelpetrener", hint: "Jonas · innsyn, ikke publisere" },
  { role: "SP", userId: "u-emma", label: "Elev", hint: "Emma · 16 år, foresatt koblet" },
  { role: "FO", userId: "u-kari", label: "Foresatt", hint: "Kari · ser Emma" },
  { role: "EL", userId: "u-per", label: "Ekstern leser", hint: "Per · kun WANG-aggregat" },
];
