/**
 * Prøvefil for Workbench, øvelser (beslutning 16.10.2026): «Legg til øvelse» med søk i alle øvelser,
 * mest brukt først, søk uten treff, «Ny øvelse» og biblioteket i smal kolonne. Syntetiske data.
 * Fasit: docs/design-system/utkast-playerhq/workbench-ovelser.html.
 */
import { useState, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Knapp } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { NyOvelseArk, OktOvelser, OvelseVelgerVisning } from "@/components/workbench/OvelseVelger";
import type { PyramidArea, WorkbenchSession } from "@/lib/domain/workbench/types";
import { velgOvelser, type VelgerOvelse, type VelgerResultat } from "@/lib/workbench/ovelse-velger";

export const sti = "/portal/planlegge/workbench";

const OKT: WorkbenchSession = {
  id: "o1", playerId: "p1", coachId: "c1", date: "2026-10-06", startMinute: 16 * 60, durationMinutes: 60, title: "Innspill med TrackMan", pyramid: "SLAG",
  status: "DRAFT", blockType: "OEKT", origin: "COACH", createdBy: "COACH", createdAt: "2026-09-20T00:00:00Z", updatedAt: "2026-09-20T00:00:00Z", location: "Simulator 2",
  drills: [
    { id: "d1", title: "Innspill 100–150 m, stigen", durationMinutes: 20, order: 0, akFormel: { pyramid: "SLAG", area: "INNSPILL_100", label: "SLAG · 100 m" } },
    { id: "d2", title: "Wedge til tre lengder", durationMinutes: 15, order: 1, akFormel: { pyramid: "SLAG", area: "INNSPILL_50", label: "SLAG · 50 m" } },
  ],
};
const o = (id: string, navn: string, pyramide: PyramidArea, omraade: string | null, brukt: number, egen = false): VelgerOvelse => ({ id, navn, pyramide, omraade, egen, brukt, min: 15 });
const ALLE = [
  o("e1", "Innspill 100–150 m, stigen", "SLAG", "Innspill 100–150 m", 14), o("e2", "Wedge til tre lengder", "SLAG", "Pitch", 11),
  o("e3", "P6.0 med pinne langs skaftet", "TEK", "Utslag", 9), o("e4", "Putting 3–10 fot, sirkelen", "SPILL", "Putt 5–10 fot", 8),
  o("e5", "Markløft trapbar 4 × 6", "FYS", "Styrke", 7), o("e6", "Chip til tre mål", "SLAG", "Chip", 5, true),
  o("e7", "P7.0 Face to Path, 50 % med en lang tittel som må brytes over flere linjer", "TEK", "Innspill 50–100 m", 4),
  o("e8", "Ni hull med én ball, to køller", "SPILL", "Banespill", 2), o("e9", "Bunker, landing på håndkle", "SLAG", "Bunker", 0),
  o("e10", "Forberedelse første tee", "TURN", null, 0),
];
const skall = (n: ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;

function Velger({ startQ = "", res, feil = null, okt = OKT, plasser = false }: { startQ?: string; res?: VelgerResultat | null; feil?: string | null; okt?: WorkbenchSession | null; plasser?: boolean }) {
  const [q, setQ] = useState(startQ);
  const [akse, setAkse] = useState<PyramidArea | null>(null);
  const data = res === undefined ? velgOvelser(ALLE, { q, pyramide: akse, grense: 40 }) : res;
  return <OvelseVelgerVisning rolle="player" q={q} onQ={setQ} akse={akse} onAkse={setAkse} okt={okt} travel={false}
    onLeggIOkt={(_s, ferdig) => ferdig()} onPlasser={plasser ? () => undefined : undefined} onNy={() => undefined} res={data} feil={feil} onHentPaaNytt={() => undefined} />;
}
const iArk = (n: ReactNode) => skall(<Ark open title="Legg til øvelse" kicker="Workbench · tirsdag 6. oktober" onClose={() => undefined} footer={<Knapp variant="ghost">Ferdig</Knapp>}>
  <OktOvelser okt={OKT} />{n}
</Ark>);
const TOM: VelgerResultat = { treff: [], antall: 0, total: 0 };

export const tilstander = {
  velger: iArk(<Velger />),
  sok: iArk(<Velger startQ="lob 30" />),
  sokTreff: iArk(<Velger startQ="wedge" />),
  ny: skall(<NyOvelseArk playerId="p1" rolle="player" okt={OKT} startNavn="Innspill 120 m, tre lengder" standardPyramide="SLAG" onLukk={() => undefined} onLagret={() => undefined} />),
  nyCoachUtenOkt: skall(<NyOvelseArk playerId="p1" rolle="coach" okt={null} startNavn="" standardPyramide="TEK" onLukk={() => undefined} onLagret={() => undefined} />),
  bibliotek: skall(<div className="pa-side"><aside style={{ width: "min(100%, 248px)" }}><Velger okt={null} plasser /></aside></div>),
  tom: iArk(<Velger res={TOM} />),
  laster: iArk(<Velger res={null} />),
  feil: iArk(<Velger res={null} feil="Øvelsene kunne ikke hentes." />),
};
