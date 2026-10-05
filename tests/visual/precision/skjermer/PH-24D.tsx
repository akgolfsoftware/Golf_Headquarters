/** Prøvefil for PH-24d Utfordringer (liste, detalj, ny). Syntetiske data (demo: Øyvind Rohjan), ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24dDetalj, PH24dListe, PH24dNy, type PH24dDetaljData, type PH24dKort, type PH24dTilstand } from "@/components/portal/precision/PH24dUtfordringer";
import { Natt } from "./_natt";

export const sti = "/portal/utfordringer";
export const natt = ["liste-natt", "detalj-natt", "ny-natt"];

const ingen = async () => {};
const aktive: PH24dKort[] = [
  { id: "u1", navn: "Putting 3 fot · 20 putter", antall: 4, avsluttet: false, slutter: "30.09", minPlass: "2" },
  { id: "u2", navn: "Et veldig langt utfordringsnavn som må brytes på smal skjerm uten å sprenge kortet", antall: 3, avsluttet: false, slutter: null, minPlass: "—" },
];
const avsluttede: PH24dKort[] = [{ id: "u4", navn: "Puttingduell september", antall: 3, avsluttet: true, slutter: "15.09", minPlass: "1" }];

const detalj = (o: Partial<PH24dDetaljData> = {}): PH24dDetaljData => ({
  id: "u1", navn: "Putting 3 fot · 20 putter", beskrivelse: "Tjue putter fra tre fot. Flest i hull vinner. Registrer beste økt.", eierNavn: "Øyvind Rohjan",
  ovelseNavn: "Putting 3 fot · 20 putter", avsluttet: false, start: "21.09.2026", slutt: "30.09.2026", erEier: true, erDeltaker: true, higherIsBetter: true, minScore: 16, minNotes: null,
  deltakere: [
    { id: "p1", navn: "Ida Solheim", erMeg: false, rank: 1, score: 18, notes: "Rolig tempo hele veien." },
    { id: "p2", navn: "Øyvind Rohjan", erMeg: true, rank: 2, score: 16, notes: "Bommet to på slutten.\nNy runde i morgen." },
    { id: "p3", navn: "Mats Berg", erMeg: false, rank: 3, score: 14.5, notes: null },
    { id: "p4", navn: "Jonas Dahl", erMeg: false, rank: null, score: null, notes: null },
  ], ...o,
});
const actions = { bliMed: ingen, avslutt: ingen, registrerScore: async () => {} };
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const L = (tilstand: PH24dTilstand, a = aktive, v = avsluttede) => <S><PH24dListe tilstand={tilstand} aktive={a} avsluttede={v} /></S>;
const D = (tilstand: PH24dTilstand = "data", o?: Partial<PH24dDetaljData>) => <S><PH24dDetalj tilstand={tilstand} data={tilstand === "data" ? detalj(o) : null} actions={actions} /></S>;
const valg = [
  { id: "v1", navn: "Mats Berg", kilde: "Venn" as const, detaljer: "Venn" }, { id: "v2", navn: "Ida Solheim", kilde: "Venn" as const, detaljer: "Venn" },
  { id: "g1", navn: "Sander Roll", kilde: "Gruppe" as const, detaljer: "AK-stigen Utvikling" },
];
const ovelser = [{ id: "o1", navn: "Putting 3 fot · 20 putter", higherIsBetter: true }, { id: "o2", navn: "Putting 9 hull · færrest putter", higherIsBetter: false }, { id: "o3", navn: "Fri øvelse", higherIsBetter: null }];
const N = (tilstand: PH24dTilstand = "data", d = valg) => <S><PH24dNy tilstand={tilstand} deltakere={d} ovelser={ovelser} opprett={async () => {}} /></S>;

export const tilstander = {
  liste: L("data"), "liste-tom": L("data", [], []), "liste-laster": L("laster"), "liste-feil": L("feil"), "liste-natt": <Natt>{L("data")}</Natt>,
  detalj: D(), "detalj-avsluttet": D("data", { avsluttet: true }), "detalj-ikke-med": D("data", { erEier: false, erDeltaker: false, eierNavn: "Nora Lund" }),
  "detalj-tom": D("data", { deltakere: detalj().deltakere.map((p) => ({ ...p, score: null, rank: null, notes: null })), minScore: null }),
  "detalj-laster": D("laster"), "detalj-feil": D("feil"), "detalj-natt": <Natt>{D()}</Natt>,
  ny: N(), "ny-tom": N("data", []), "ny-laster": N("laster"), "ny-feil": N("feil"), "ny-natt": <Natt>{N()}</Natt>,
};
