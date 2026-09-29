/** Prøvefil for AG-19 kjøringsdetalj (/admin/agents/[agentId]). Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG19Kjoringsdetalj } from "@/components/admin/precision/AG19Kjoringsdetalj";
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

const Vis = (d: AgentDetaljData) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG19Kjoringsdetalj data={d} /></AgencyOSSkall></AdminRolleProvider>;

export const tilstander = {
  data: Vis(data),
  feilet: Vis({ ...data, tilstand: "feilet", feil: { naarTekst: "29.09 06:00 etter 1,0 s", sidenTekst: "Forrige vellykkede kjøring var 22.09.26. Forslagene derfra står fortsatt i køen", melding: "Tidsavbrudd mot kalenderen." } }),
  tom: Vis({ ...data, tilstand: "ingen", kjoringer: [], forslag: [], sisteSteg: null, kpi: { kjoringer30d: 0, kjoringerSub: "0 OK · 0 feil", snittTidTekst: "—", forslagLaget: 0, forslagSub: "0 godkjent · 0 avvist" }, panel: { godkjentRateTekst: "—", godkjentSub: "Ingen avgjort ennå", eldsteIKoTekst: "—", eldsteSub: "Ingen venter" } }),
};

const nattNavn = ["data", "feilet", "tom"] as const;
for (const n of nattNavn) (tilstander as Record<string, React.ReactNode>)[`natt-${n}`] = tilstander[n];
export const natt: string[] = nattNavn.map((n) => `natt-${n}`);
