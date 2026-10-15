/** Prøvefil for PH-03 Øktark i nytt design (pakke 2). Syntetiske data fra utkastet: mandag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH03Oktark } from "@/components/portal/precision/PH03Oktark";
import type { OktDetaljData } from "@/lib/portal-okt/okt-detalj-data";

export const sti = "/portal/gjennomfore/o1";

const DRILLS = [
  ["Oppvarming · Halv swing fra 50 m", "10 slag", 10, "SLAG_INNSPILL-50-100_LAV_HAST_TRENINGSOMRADE_ALENE"],
  ["Innspill 100–150 m · Lengdekontroll", "30 slag", 20, "SLAG_INNSPILL-100-150_AUTO_TRENINGSOMRADE_OBSERVERT"],
  ["Innspill 50–100 m · Lengdekontroll", "40 slag", 20, "SLAG_INNSPILL-50-100_AUTO_TRENINGSOMRADE_OBSERVERT"],
  ["Pitch · Landingspunkt", "30 slag", 15, null],
  ["Putting 3–5 fot · Ballstart", "50 putter", 10, "SLAG_PUTTING-3-5_AUTO_TRENINGSOMRADE_ALENE"],
] as const;

const data = (status: "planned" | "done"): OktDetaljData => ({
  found: true, id: "o1", tittel: "SLAG · Innspill og nærspill", emTittel: "Innspill og nærspill", pyramide: "SLAG",
  dagTekst: "Mandag 5.10", ukeNr: 41, tidTekst: "15:30–16:45", varighetMin: 75, sted: "Range 3 · Fredrikstad GK",
  status, statusLabel: status === "done" ? "Gjennomført" : "Planlagt", statusTone: "lime",
  kanStarte: status !== "done", startLabel: "Start økten", startHref: "#",
  publisertAv: "Anders Kristiansen · 03.10", maal: "7 av 10 innspill 50–100 m innenfor 4 m",
  hvorfor: "Hold samme rytme på alle lengder. Kort baksving, full gjennomføring.",
  drills: DRILLS.map(([navn, volum, tidMin, formel], i) => ({ id: `d${i}`, navn, volum, tidMin, formel, pyramide: "SLAG", gjort: status === "done" && i < 4 })),
  resultat: status === "done" ? { fullfortKl: "16:41", totalReps: 160, drillsFullfort: 4, antallDrills: 5 } : null,
  notat: status === "done" ? "Bedre lengdekontroll på 54°." : null,
  deltakere: [], invite: null,
} as unknown as OktDetaljData);

const Vis = ({ d }: { d: OktDetaljData }) => <PlayerHQSkall innboksHref="#" uleste={2}><PH03Oktark data={d} userId="u1" nesteTekst={null} nesteHref="#" harNeste /></PlayerHQSkall>;

export const tilstander = {
  planlagt: <Vis d={data("planned")} />,
  gjennomfort: <Vis d={data("done")} />,
  tom: <Vis d={{ ...data("planned"), drills: [], maal: null, hvorfor: null } as OktDetaljData} />,
  feil: <Vis d={{ found: false }} />,
};
