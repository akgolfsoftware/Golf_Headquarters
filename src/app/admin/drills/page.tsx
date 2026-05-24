/**
 * /admin/drills — CoachHQ Drill-bibliotek (samme UI som /portal/drills)
 * Design: plan Del 6
 *
 * Coach-versjon: samme grid + slide-in panel, men med "Rediger drill" + "Ny drill"-knapper.
 * NB: Bruker mock-data foreløpig — koble til Prisma når drill-modellen er utvidet.
 */

import { Filter, Plus, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DrillGrid, type DrillCardData, type DrillDetailData } from "@/components/drills";
import "@/components/drills/drill.css";

export const dynamic = "force-dynamic";

const MOCK_DRILLS: DrillCardData[] = [
  {
    id: "gate-drill-50",
    skillArea: "PUTTING",
    title: "Gate-drill 50cm",
    duration: 15,
    intensity: 7,
    ngfCategoryRange: "D–G",
    timesTrained: 47,
    isCoachRecommended: true,
  },
  {
    id: "avstand-50m",
    skillArea: "NÆRSPILL",
    title: "Avstandskontroll 50m",
    duration: 20,
    intensity: 6,
    ngfCategoryRange: "C–F",
    timesTrained: 132,
  },
  {
    id: "iron-tempo",
    skillArea: "JERNSLAG",
    title: "Tempo-jernslag 7-iron",
    duration: 25,
    intensity: 5,
    ngfCategoryRange: "D–G",
    timesTrained: 89,
    isCoachRecommended: true,
  },
  {
    id: "driver-launch",
    skillArea: "DRIVER",
    title: "Launch-vinkel driver",
    duration: 30,
    intensity: 8,
    ngfCategoryRange: "B–E",
    timesTrained: 23,
  },
  {
    id: "wedge-spinn",
    skillArea: "NÆRSPILL",
    title: "Wedge-spinn fra rough",
    duration: 18,
    intensity: 7,
    ngfCategoryRange: "C–F",
    timesTrained: 41,
  },
  {
    id: "putt-rutine",
    skillArea: "PUTTING",
    title: "Putt-rutine 4–8 fot",
    duration: 12,
    intensity: 4,
    ngfCategoryRange: "D–H",
    timesTrained: 312,
  },
];

const MOCK_DETAILS: Record<string, DrillDetailData> = {
  "gate-drill-50": {
    id: "gate-drill-50",
    title: "Gate-drill 50cm",
    skillArea: "PUTTING",
    pyramidArea: "TEK",
    duration: 15,
    intensity: 7,
    setsReps: "3×10",
    environment: "Driving range",
    csMal: 78,
    csMalNivaa: "D",
    treningsfaser: ["Grunnfase", "Spesialfase"],
    fasilitetskrav: [
      { name: "Driving range" },
      { name: "Radar" },
      { name: "Kamera" },
    ],
    description:
      "Plasser to tees 50 cm fra hverandre, 1,5 m fra hullet. Putt 10 baller gjennom porten med jevn tempo.",
    coachNotes:
      "Standard rutine for D-G. Coach-anbefalt for spillere som mangler putting-konsistens.",
    tags: ["slag-kontroll", "avstand", "blokktrening"],
  },
  "avstand-50m": {
    id: "avstand-50m",
    title: "Avstandskontroll 50m",
    skillArea: "NÆRSPILL",
    pyramidArea: "SLAG",
    duration: 20,
    intensity: 6,
    setsReps: "4×5",
    environment: "Practice green",
    csMal: 72,
    csMalNivaa: "D",
    treningsfaser: ["Spesialfase"],
    fasilitetskrav: [{ name: "Practice green" }],
    description: "5 slag per avstand (50/40/30/20/10m). Mål: alle baller innenfor 3m fra hullet.",
    tags: ["distanse", "kontroll", "wedge"],
  },
  "iron-tempo": {
    id: "iron-tempo",
    title: "Tempo-jernslag 7-iron",
    skillArea: "JERNSLAG",
    pyramidArea: "TEK",
    duration: 25,
    intensity: 5,
    setsReps: "3×15",
    environment: "Driving range",
    csMal: 85,
    csMalNivaa: "C",
    treningsfaser: ["Grunnfase", "Spesialfase"],
    fasilitetskrav: [{ name: "Driving range" }, { name: "Radar" }],
    description: "Tempo 3:1 (opp:ned), metronom 75 BPM. Smash-faktor 1.40+.",
    tags: ["tempo", "rytme", "swing-mekanikk"],
  },
  "driver-launch": {
    id: "driver-launch",
    title: "Launch-vinkel driver",
    skillArea: "DRIVER",
    pyramidArea: "SLAG",
    duration: 30,
    intensity: 8,
    setsReps: "5×10",
    environment: "Driving range",
    csMal: 102,
    csMalNivaa: "B",
    treningsfaser: ["Spesialfase", "Konkurransefase"],
    fasilitetskrav: [
      { name: "Driving range" },
      { name: "Radar" },
      { name: "Kamera" },
    ],
    description: "Launch 13-15°, spin 2200-2600 rpm. 10 svinger per tee-høyde.",
    tags: ["distanse", "launch", "spin"],
  },
  "wedge-spinn": {
    id: "wedge-spinn",
    title: "Wedge-spinn fra rough",
    skillArea: "NÆRSPILL",
    pyramidArea: "SLAG",
    duration: 18,
    intensity: 7,
    setsReps: "3×8",
    environment: "Practice green med rough",
    csMal: 80,
    csMalNivaa: "C",
    treningsfaser: ["Spesialfase"],
    fasilitetskrav: [{ name: "Practice green" }, { name: "Radar" }],
    description: "Generer spinn 5000+ rpm fra lett rough. Test grip-trykk.",
    tags: ["spinn", "rough", "wedge"],
  },
  "putt-rutine": {
    id: "putt-rutine",
    title: "Putt-rutine 4–8 fot",
    skillArea: "PUTTING",
    pyramidArea: "TEK",
    duration: 12,
    intensity: 4,
    setsReps: "5×4",
    environment: "Practice green",
    csMal: 70,
    csMalNivaa: "D",
    treningsfaser: ["Grunnfase"],
    fasilitetskrav: [{ name: "Practice green" }],
    description: "20 putts på 4-8 fot i klokken-mønster. Mål: 75% gjennomgang.",
    tags: ["pre-shot-rutine", "kortputt", "konsistens"],
  },
};

export default async function CoachDrillsPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const drills = MOCK_DRILLS;
  const loadDetail = (id: string) => MOCK_DETAILS[id] ?? null;

  return (
    <div className="drill-scope">
      <div className="drill-page">
        <header className="drill-head">
          <div>
            <div className="eyebrow">COACHHQ · DRILLS</div>
            <h1>
              Drill <em>-bibliotek</em>
            </h1>
            <p className="drill-sub">
              Administrér ditt drill-bibliotek. Klikk en drill for å se hvor mye
              den er brukt og redigere coach-notater.
            </p>
          </div>
          <div className="drill-head-actions">
            <button type="button" className="drill-filter-pill">
              <Search size={12} strokeWidth={1.75} aria-hidden /> Søk
            </button>
            <button type="button" className="drill-filter-pill">
              <Filter size={12} strokeWidth={1.75} aria-hidden /> Filter
            </button>
            <button
              type="button"
              className="drill-filter-pill active"
              style={{
                background: "#005840",
                color: "#D1F843",
                borderColor: "#005840",
              }}
            >
              <Plus size={12} strokeWidth={2} aria-hidden /> Ny drill
            </button>
          </div>
        </header>

        <div className="drill-filter-row">
          <span className="drill-filter-pill active">Alle (247)</span>
          <span className="drill-filter-pill">Putting (62)</span>
          <span className="drill-filter-pill">Nærspill (51)</span>
          <span className="drill-filter-pill">Jernslag (84)</span>
          <span className="drill-filter-pill">Driver (28)</span>
          <span className="drill-filter-pill">Coach anbefalt (28)</span>
        </div>

        <DrillGrid drills={drills} loadDetail={loadDetail} />
      </div>
    </div>
  );
}
