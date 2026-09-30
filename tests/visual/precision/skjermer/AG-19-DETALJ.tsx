/** Prøvefil for AG-19 kjøringsdetalj (/admin/agents/[agentId]). Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG19Kjoringsdetalj } from "@/components/admin/precision/AG19Kjoringsdetalj";
import { CircleAlert } from "lucide-react";
import { FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import type { AgentDetaljData } from "@/components/admin/v2/AdminAgentDetaljV2";

export const sti = "/admin/agents/ukesforslag";

const data: AgentDetaljData = {
  agentId: "ukesforslag",
  navn: "Ukesforslag med et langt navn som må brytes riktig på smal skjerm",
  beskrivelse: "Foreslår ukens økter for hver spiller med plan. Skriver ingenting før du godkjenner i køen.",
  trigger: "Hver mandag 06:00",
  statusBadge: "aktiv",
  tilstand: "aktiv",
  agentDetaljHref: "/admin/jarvis",
  godkjenningerHref: "/admin/godkjenninger",
  feilloggHref: "/admin/audit-log",
  kpi: { kjoringer30d: 4, kjoringerSub: "3 OK · 1 feil", snittTidTekst: "4,2 s", forslagLaget: 12, forslagSub: "7 godkjent · 2 avvist" },
  kjoringer: [
    { id: "k1", naar: "29.09 06:00", varighetTekst: "4,2 s", ok: true, outputTekst: "12 spillere · 3 endringer — Flytt en økt fra torsdag til fredag." },
    { id: "k2", naar: "22.09 06:00", varighetTekst: "1,0 s", ok: false, outputTekst: "Tidsavbrudd mot kalenderen. Ingenting er endret." },
  ],
  kjoringerVindusTekst: "siste 30 dager",
  sisteSteg: { naarTekst: "29.09 06:00 · 4,2 s", steg: [{ rolle: "kjøring", tekst: "12 spillere · 3 endringer", ok: true }] },
  forslag: [
    { id: "f1", actionTypeLabel: "Juster intensitet", statusLabel: "Venter", tone: "warn", brukerNavn: "Test Spiller A", playerId: "p1", naar: "29.09.26", forklaring: "Tre økter over 130 % siste to uker.", pending: true },
    { id: "f2", actionTypeLabel: "Legg til hvile", statusLabel: "Godkjent", tone: "up", brukerNavn: "Test Spiller B", playerId: "p2", naar: "22.09.26", forklaring: null, pending: false },
  ],
  panel: { godkjentRateTekst: "78 %", godkjentSub: "7 av 9 avgjorte", eldsteIKoTekst: "1 dg", eldsteSub: "1 forslag venter" },
  feil: null,
  manuell: null,
};

const Vis = (d: AgentDetaljData, natt = false) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach" natt={natt}><AG19Kjoringsdetalj data={d} /></AgencyOSSkall></AdminRolleProvider>;
// Samme uttrykk som agents/loading.tsx og agents/error.tsx.
const Laster = (natt = false) => <AgencyOSSkall navn="Coach" natt={natt}><div className="pa-side"><LasterTilstand text="Henter agenten …" /></div></AgencyOSSkall>;
const Feil = (natt = false) => <AgencyOSSkall navn="Coach" natt={natt}><div className="pa-side"><FeilTilstand icon={CircleAlert} title="Jarvis svarer ikke" text="Ingen utkast er sendt eller slettet. Prøv igjen." /></div></AgencyOSSkall>;

const tom: AgentDetaljData = { ...data, tilstand: "ingen", kjoringer: [], forslag: [], sisteSteg: null, kpi: { kjoringer30d: 0, kjoringerSub: "0 OK · 0 feil", snittTidTekst: "—", forslagLaget: 0, forslagSub: "0 godkjent · 0 avvist" }, panel: { godkjentRateTekst: "—", godkjentSub: "Ingen avgjort ennå", eldsteIKoTekst: "—", eldsteSub: "Ingen venter" } };
const feilet: AgentDetaljData = { ...data, tilstand: "feilet", feil: { naarTekst: "29.09 06:00 etter 1,0 s", sidenTekst: "Forrige vellykkede kjøring var 22.09.26. Forslagene derfra står fortsatt i køen", melding: "Tidsavbrudd mot kalenderen." } };
const lys: Record<string, (natt: boolean) => React.ReactNode> = {
  data: (n) => Vis(data, n),
  feilet: (n) => Vis(feilet, n),
  tom: (n) => Vis(tom, n),
  laster: (n) => Laster(n),
  feil: (n) => Feil(n),
};
export const tilstander: Record<string, React.ReactNode> = {};
for (const [navn, f] of Object.entries(lys)) { tilstander[navn] = f(false); tilstander[`natt-${navn}`] = f(true); }
export const natt: string[] = Object.keys(lys).map((n) => `natt-${n}`);
