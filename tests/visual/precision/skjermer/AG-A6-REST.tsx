/** Prøvefil for bølge 3 (A6): sider som bygger toppen selv på siden. Syntetiske data, oppdiktede navn. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { EksterneLesere } from "@/components/admin/agencyos-ny/EksterneLesere";
import { NotionTilkobling, type NotionTilkoblingData } from "@/components/admin/agencyos-ny/NotionTilkobling";
import { AG23InviterCoach } from "@/components/admin/precision/AG23InviterCoach";
import { AG17TurneringNy } from "@/components/admin/precision/AG17TurneringNy";
import { AG19AgentDetalj } from "@/components/admin/precision/AG19AgentDetalj";
import { AG17Fellesmelding } from "@/components/admin/precision/AG17Fellesmelding";
import type { AgentDetaljData } from "@/lib/agencyos/agent-detalj-typer";
import { TrackManSessionDetail } from "@/components/trackman/TrackManSessionDetail";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";

export const sti = "/admin/team/ekstern";

const S = ({ children }: { children: React.ReactNode }) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><div className="agn-s agn-a6">{children}</div></AgencyOSSkall></AdminRolleProvider>;

const grupper = [{ id: "g1", name: "GFGK Junior Elite U16" }, { id: "g2", name: "Gruppe med et veldig langt navn som må brytes over flere linjer" }];
const notion: NotionTilkoblingData = {
  tilstand: "connected", isAdmin: true, harInternalToken: true, feilmelding: null, workspaceName: "AK Golf Group",
  tilkobletSiden: new Date("2026-09-01T10:00:00Z"), sistSynket: new Date(Date.now() - 12 * 60000),
  databaser: [{ id: "d1", navn: "Tasks", type: "database", syncMode: "auto", pagesCount: 214, lastSyncAt: new Date() }, { id: "d2", navn: "Prosjekter", type: "database", syncMode: "auto", pagesCount: 31, lastSyncAt: null }],
};
const slag = Array.from({ length: 14 }, (_, i) => ({ id: `s${i}`, shotNumber: i + 1, club: "7i", side: (i % 7) - 3, carryDistance: 140 + (i % 5) * 2, totalDistance: 150, smashFactor: 1.35, launchAngle: 18 }));
const resultat = computeTrackManDispersionMap(slag as Parameters<typeof computeTrackManDispersionMap>[0]);

const agent: AgentDetaljData = {
  agentId: "a1", navn: "Ukesrapport-agent", beskrivelse: "Samler uka for hver spiller og lager utkast til coach.", trigger: "Mandag 06:00", statusBadge: "aktiv", tilstand: "aktiv",
  agentDetaljHref: "/admin/agents/a1", godkjenningerHref: "/admin/innboks", feilloggHref: "/admin/feillogg",
  kpi: { kjoringer30d: 31, kjoringerSub: "siste 30 dager", snittTidTekst: "42 s", forslagLaget: 12, forslagSub: "9 godkjent" },
  kjoringer: [{ id: "k1", naar: "man 06:00", varighetTekst: "38 s", ok: true, outputTekst: "6 briefer · 2 varsler" }, { id: "k2", naar: "man 06:00", varighetTekst: "44 s", ok: false, outputTekst: null }],
  kjoringerVindusTekst: "Siste 30 dager",
  sisteSteg: { naarTekst: "man 06:00", steg: [{ rolle: "Henter", tekst: "Runder og økter", ok: true }, { rolle: "Skriver", tekst: "Utkast per spiller", ok: true }] },
  forslag: [{ id: "f1", actionTypeLabel: "Juster intensitet", statusLabel: "Venter", tone: "warn", brukerNavn: "Eira Solvang", playerId: "u1", naar: "i dag", forklaring: "Belastningen har vært høy to uker på rad, så uka foreslås lettere.", pending: true }],
  panel: { godkjentRateTekst: "75 %", godkjentSub: "siste 30 dager", eldsteIKoTekst: "2 d", eldsteSub: "eldste forslag" },
  feil: null, manuell: { plans: [{ id: "p1", label: "Plan 2026" }], players: [{ id: "u1", label: "Eira Solvang" }], tournaments: [{ id: "t1", label: "Norgescup 1" }] },
};

export const tilstander = {
  agent: <S><Topp flat tilbake={{ href: "/admin/jarvis", tekst: "Jarvis" }} dato="Jarvis · agent · Mandag 06:00" tittel="Ukesrapport-agent" /><AG19AgentDetalj data={agent} /></S>,
  fellesmelding: <S><Topp tilbake={{ href: "/admin/turnering", tekst: "Turneringer" }} dato="Turnering · Olyo Juniortour" tittel="Norgescup 1" />
    <AG17Fellesmelding turneringId="t1" turneringNavn="Norgescup 1" deltakere={[{ userId: "u1", navn: "Eira Solvang", status: "CONFIRMED" }, { userId: "u2", navn: "Mathias Tveit", status: "PENDING" }] as never} autoApen /></S>,
  ekstern: <S><Topp tilbake={{ href: "/admin/oppsett?fane=team", tekst: "Oppsett" }} dato="Oppsett · team og tilgang" tittel="Eksterne lesere" ingress="Eksterne lesere ser bare det spilleren selv har delt. Gruppemedlemskap alene gir ikke innsyn." />
    <EksterneLesere grupper={grupper} lesere={[{ id: "u1", navn: "Kari Lesersen", epost: "kari@eksempel.no", grupper: ["GFGK Junior Elite U16"] }]} /></S>,
  inviter: <S><Topp tilbake={{ href: "/admin/oppsett?fane=team", tekst: "Oppsett" }} dato="Oppsett · team og tilgang" tittel="Inviter coach" /><AG23InviterCoach kanTildeleTilganger /></S>,
  notion: <S><Topp tilbake={{ href: "/admin/oppsett?fane=integr", tekst: "Oppsett" }} dato="Oppsett · integrasjoner" tittel="Notion" ingress="Oppgaver og prosjekter kommer bare fra Notion." /><NotionTilkobling data={notion} /></S>,
  turneringNy: <S><Topp tilbake={{ href: "/admin/turnering", tekst: "Turneringer" }} dato="Turneringer · ny" tittel="Ny turnering" ingress="Fem steg." /><AG17TurneringNy courses={[{ id: "c1", name: "Nordre golfbane" }]} /></S>,
  trackman: <S><Topp tilbake={{ href: "/admin/trackman", tekst: "TrackMan og video" }} dato="TrackMan · 22.10.2026 · csv" tittel="Eira Solvang" ingress="HCP 6,1 · 7i" />
    <div className="agn-legacy"><TrackManSessionDetail club="7i" dateText="22.10.2026" sourceLabel="csv" result={resultat} allShotsHref="#alle-slag" /></div></S>,
};
