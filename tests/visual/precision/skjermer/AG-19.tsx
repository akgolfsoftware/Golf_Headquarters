/** Prøvefil for AG-19 Jarvis (alle fem faner). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG19Jarvis, type AG19Props, type AG19Tilstand } from "@/components/admin/precision/AG19Jarvis";
import { JARVIS_FANER, type JarvisFaneId } from "@/lib/admin/jarvis/faner";
import { AGENTICOS_RUNTIMES, AGENTICOS_SKILLS } from "@/lib/agencyos/agenticos-ia";

export const sti = "/admin/jarvis";

const kjoringer: AG19Props["kjoringer"] = [
  { id: "r1", agentSlug: "ukesforslag", navn: "Ukesforslag for stallen med et langt navn som må brytes riktig", naar: "29.09 06:00", varighet: "4,2 s", ok: true, utdrag: "12 spillere · 3 endringer — Flytt en økt fra torsdag til fredag for å gi restitusjon før turnering.", href: "/admin/agents/ukesforslag" },
  { id: "r2", agentSlug: "booking-optimizer", navn: "Booking-optimalisering", naar: "29.09 05:00", varighet: "1,1 s", ok: false, utdrag: "Tidsavbrudd mot kalenderen etter 30 sekunder. Ingenting er endret.", href: "/admin/agents/booking-optimizer" },
  { id: "r3", agentSlug: "signaler", navn: "Signalberegning", naar: "28.09 22:00", varighet: "0,8 s", ok: true, utdrag: null, href: "/admin/agents/signaler" },
];

const cockpit: AG19Props["cockpit"] = {
  naTekst: "Man 29.09 · 07:10",
  neste: { kind: "godkjenn", id: "pa1", tittel: "Foreslå uke 40 for Test Spiller A", meta: "Akademi · Ukesforslag", beskrivelse: "Bevegelighet 30 min i stedet for innspill torsdag. Skriver ingenting før du godkjenner." },
  venterPaDeg: 3,
  klarCount: 3,
  pagarCount: 0,
  researchCount: 14,
  godkjentIDag: 1,
  feilende: [{ navn: "Booking-optimalisering", slug: "booking-optimizer", detaljHref: "/admin/agents/booking-optimizer" }],
  runtimeLinje: "3 kjøringer i dag",
};

const prosjekter: AG19Props["prosjekter"] = {
  grupper: [
    { area: "AKADEMI", label: "Akademi", rader: [
      { id: "p1", tittel: "Sesongplan junior 2027", meta: "12 tasks · 2 kjører", href: "/admin/workspace", area: "AKADEMI" },
      { id: "p2", tittel: "Prosjekt med et veldig langt navn som må brytes uten å sprenge kortet", meta: "4 tasks", href: "/admin/workspace", area: "AKADEMI" },
    ] },
    { area: "PRODUKT", label: "Produkt", rader: [{ id: "p3", tittel: "PlayerHQ lansering", meta: "31 tasks", href: "/admin/workspace", area: "PRODUKT" }] },
  ],
  tomme: "Personlig · Drift — ingen aktive prosjekter",
};

const samtale: NonNullable<AG19Props["samtale"]> = {
  conversationId: "c1",
  utkastVenter: 1,
  historikk: [
    { id: "m1", rolle: "coach", tid: "29.09 07:02", tekst: "Hvem trenger meg mest denne uka?" },
    { id: "m2", rolle: "caddie", tid: "29.09 07:02", tekst: "Test Spiller B ligger 32 % bak planen siste fire uker (kilde: økter, 01.09–28.09). Jeg har laget et utkast til melding. Ingenting er sendt." },
  ],
};

function Vis(over: Partial<AG19Props> & { tilstand: AG19Tilstand; fane: JarvisFaneId }, natt = false) {
  const p: AG19Props = {
    faner: JARVIS_FANER, antall: { ko: 3, prosjekter: 3, skills: AGENTICOS_SKILLS.length, runtimes: 1 },
    cockpit, kjoringer, valgtKjoringId: "r1", prosjekter, skills: AGENTICOS_SKILLS, runtimes: AGENTICOS_RUNTIMES, kjoringerIdag: 3, samtale,
    ...over,
  };
  return <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach" natt={natt}><AG19Jarvis {...p} /></AgencyOSSkall></AdminRolleProvider>;
}

const tomCockpit = { ...cockpit, neste: null, venterPaDeg: 0, feilende: [], klarCount: 0, researchCount: 0, runtimeLinje: "Ingen kjøringer i dag" };

const lys = {
  data: { tilstand: "data", fane: "ko" },
  "data-feilet": { tilstand: "data", fane: "ko", valgtKjoringId: "r2" },
  tom: { tilstand: "tom", fane: "ko", cockpit: tomCockpit, kjoringer: [] },
  laster: { tilstand: "laster", fane: "ko" },
  feil: { tilstand: "feil", fane: "ko" },
  prosjekter: { tilstand: "data", fane: "prosjekter" },
  "prosjekter-tom": { tilstand: "data", fane: "prosjekter", prosjekter: { grupper: [], tomme: "" } },
  skills: { tilstand: "data", fane: "skills" },
  runtimes: { tilstand: "data", fane: "runtimes" },
  samtale: { tilstand: "data", fane: "samtale" },
  "samtale-tom": { tilstand: "data", fane: "samtale", samtale: { conversationId: "c2", historikk: [], utkastVenter: 0 } },
  "samtale-last": { tilstand: "data", fane: "samtale", samtale: null },
} satisfies Record<string, Parameters<typeof Vis>[0]>;

// Nattema går gjennom skallets egen natt-prop (data-theme="night" på .pa-root).
export const tilstander: Record<string, React.ReactNode> = {};
for (const [navn, over] of Object.entries(lys)) {
  tilstander[navn] = Vis(over);
  tilstander[`natt-${navn}`] = Vis(over, true);
}
export const natt: string[] = Object.keys(lys).map((n) => `natt-${n}`);
