/** Prøvefil for PH-IUP-02 Sesongevaluering i nytt design. Bare syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHIupEvaluering } from "@/components/portal/precision/iup-evaluering";
import { PHIupFeil, PHIupLaster } from "@/components/portal/precision/PHIupTilstand";
import type { IupSesongevaluering } from "@/lib/iup/sesongevaluering";

export const sti = "/portal/mal/evaluering";

const id = (n: number) => `iup-2027-sesong-b${n}`;
const svar = (over: Partial<IupSesongevaluering> = {}): IupSesongevaluering => ({
  versjon: "iup-2027", sesongStart: "2026-01-01", sesongSlutt: "2026-10-31", status: "UTKAST",
  fritekst: { [id(2)]: "Jeg har trent jevnt hele året og fått mer ut av innspillet." },
  vurderinger: { [id(11)]: 3, [id(12)]: 3, [id(13)]: 4, [id(14)]: 3, [id(15)]: 3 },
  fordelingFaktisk: { FYS: 18, TEK: 22, SLAG: 34, SPILL: 18, TURN: 8 },
  fordelingPlanlagt: { FYS: 20, TEK: 20, SLAG: 30, SPILL: 20, TURN: 5 },
  forbedringspunkter: ["Innspill 100–150 m: flere slag innenfor 8 m", "Fast rutine før hver putt", ""],
  ...over,
});
const levertSvar = svar({
  status: "LEVERT",
  fritekst: { [id(2)]: "Jevn trening.", [id(4)]: "Mer turneringstrening.", [id(6)]: "God innsats, rundt 15 timer i uka." },
  vurderinger: Object.fromEntries([11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n, i) => [id(n), [3, 3, 4, 3, 3, 2, 3, 3, 4, 3][i]])),
  fordelingPlanlagt: { FYS: 20, TEK: 20, SLAG: 30, SPILL: 20, TURN: 10 },
  forbedringspunkter: ["Innspill 100–150 m: flere slag innenfor 8 m", "Fast rutine før hver putt", "Sove 8 timer før turneringsdager", "Bedre plan for skolearbeid i turneringsuker"],
});

const historikk = (s: IupSesongevaluering, revisjon: number) => ({
  id: "syn-sesong", type: "SESONGEVALUERING", versjon: "iup-2027", niva: "ALLE", periodeStart: "2026-01-01", periodeSlutt: "2026-10-31",
  revisjon, levertRevisjon: s.status === "LEVERT" ? revisjon : null, nesteRevisjon: null,
  revisjoner: [
    { revisjon, status: s.status, createdAt: "2026-10-18T12:00:00.000Z", innhold: s, kildeEllerFormatAvviker: false },
    { revisjon: revisjon - 1, status: "UTKAST", createdAt: "2026-10-12T12:00:00.000Z", innhold: svar(), kildeEllerFormatAvviker: false },
  ],
});
const oversikt = {
  kanSvare: true, nesteSide: null,
  besvarelser: [
    { id: "syn-sesong", type: "SESONGEVALUERING", versjon: "iup-2027", niva: "ALLE", periodeStart: "2026-01-01", periodeSlutt: "2026-10-31", revisjon: 4, levertRevisjon: null, sistLagret: "2026-10-12T12:00:00.000Z", status: "UTKAST" },
    { id: "syn-sjekk", type: "UTVIKLINGSSJEKK", versjon: "iup-2025", niva: "JUNIOR", periodeStart: "2025-03-01", periodeSlutt: "2025-03-28", revisjon: 2, levertRevisjon: 2, sistLagret: "2025-03-30T12:00:00.000Z", status: "LEVERT" },
  ],
};

const Vis = ({ s, steg = 0 }: { s: IupSesongevaluering; steg?: number }) =>
  <PHIupEvaluering oversikt={oversikt} historikk={historikk(s, 4)} nyType={null} uleste={0} startSteg={steg} />;

export const tilstander = {
  data: <Vis s={svar()} />,
  pastander: <Vis s={svar()} steg={1} />,
  fordeling: <Vis s={svar()} steg={2} />,
  forbedring: <Vis s={svar()} steg={3} />,
  levert: <Vis s={levertSvar} />,
  tom: <PHIupEvaluering oversikt={{ ...oversikt, besvarelser: [] }} historikk={null} nyType={null} uleste={0} />,
  oversikt: <PHIupEvaluering oversikt={oversikt} historikk={null} nyType={null} uleste={0} />,
  laster: <PlayerHQSkall innboksHref="#" uleste={0}><PHIupLaster tekst="Henter besvarelsene dine …" /></PlayerHQSkall>,
  feil: <PlayerHQSkall innboksHref="#" uleste={0}><PHIupFeil tittel="Evalueringen kunne ikke hentes" tekst="Prøv igjen. Hvis du var i ferd med å lagre, kontroller siste lagrede revisjon før du fortsetter." onProvIgjen={() => {}} /></PlayerHQSkall>,
};
