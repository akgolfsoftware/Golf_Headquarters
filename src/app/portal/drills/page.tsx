/**
 * /portal/drills — PlayerHQ Drill-bibliotek
 *
 * TODO(prisma-extension): Prisma-modellen for drill-bibliotek mangler felter
 * vi trenger for biblioteket. Per nå har vi to delvise modeller:
 *   - DrillMal: coach-eid mal med pyramide + life-kode + kategorier
 *   - TrainingDrillV2: brukes i en konkret økt (har sessionId, sortOrder)
 *
 * Ingen av dem har: ngfCategoryRange, csMal, fasilitetskrav, tags eller
 * timesTrained. Inntil vi får en ren `Drill`-modell med disse feltene
 * brukes mock-data midlertidig. Beta-spillere ser et representativt
 * utvalg av drills som ikke avslører personlige data.
 */

import { Filter, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DrillGrid, type DrillCardData, type DrillDetailData } from "@/components/drills";
import "@/components/drills/drill.css";

export const dynamic = "force-dynamic";

// TODO(prisma-extension): Erstatt med prisma.drill.findMany() når Drill-
// modellen finnes med feltene over.
const MOCK_DRILLS: DrillCardData[] = [
  {
    id: "gate-drill-50",
    skillArea: "PUTTING",
    title: "Gate-drill 50cm",
    duration: 15,
    intensity: 7,
    ngfCategoryRange: "D–G",
    timesTrained: 0,
    isCoachRecommended: true,
  },
  {
    id: "avstand-50m",
    skillArea: "NÆRSPILL",
    title: "Avstandskontroll 50m",
    duration: 20,
    intensity: 6,
    ngfCategoryRange: "C–F",
    timesTrained: 0,
  },
  {
    id: "iron-tempo",
    skillArea: "JERNSLAG",
    title: "Tempo-jernslag 7-iron",
    duration: 25,
    intensity: 5,
    ngfCategoryRange: "D–G",
    timesTrained: 0,
    isCoachRecommended: true,
  },
  {
    id: "driver-launch",
    skillArea: "DRIVER",
    title: "Launch-vinkel driver",
    duration: 30,
    intensity: 8,
    ngfCategoryRange: "B–E",
    timesTrained: 0,
  },
  {
    id: "wedge-spinn",
    skillArea: "NÆRSPILL",
    title: "Wedge-spinn fra rough",
    duration: 18,
    intensity: 7,
    ngfCategoryRange: "C–F",
    timesTrained: 0,
  },
  {
    id: "putt-rutine",
    skillArea: "PUTTING",
    title: "Putt-rutine 4–8 fot",
    duration: 12,
    intensity: 4,
    ngfCategoryRange: "D–H",
    timesTrained: 0,
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
      "Plasser to tees 50 cm fra hverandre, 1,5 m fra hullet. Putt 10 baller gjennom porten med jevn tempo. Fokus på sentrert kontakt og lik retning på balle ut og inn.",
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
    fasilitetskrav: [{ name: "Practice green" }, { name: "Markering 50m" }],
    description:
      "5 slag fra 50m, 40m, 30m, 20m og 10m. Mål: alle baller innenfor 3m fra hullet. Variér klubbvalg (50° til 60°) og rull-mot-fly-balanse.",
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
    description:
      "15 svinger med 7-iron, fokus på tempo 3:1 (oppsving:nedsving). Bruk metronom på 75 BPM. Sjekk smash-faktor 1.40+.",
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
    description:
      "Mål launch-vinkel 13-15°, spin 2200-2600 rpm. 10 svinger per tee-høyde (lav/middels/høy). Notér beste 3 i sett.",
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
    description:
      "Fra 30m i lett rough — generer spinn 5000+ rpm. Test ulik grip-trykk (light/medium/firm) og sjekk hvilken som gir mest kontroll.",
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
    description:
      "20 putts på 4-8 fot rundt hullet i klokken-mønster. Mål: 75% gjennomgang. Notér miss-mønster (push/pull).",
    coachNotes:
      "Konsentrer deg om første putt — den setter rytmen for sesjonen.",
    tags: ["pre-shot-rutine", "kortputt", "konsistens"],
  },
};

export default async function DrillBibliotekPage() {
  await requirePortalUser();

  const drills = MOCK_DRILLS;
  const loadDetail = (id: string) => MOCK_DETAILS[id] ?? null;

  return (
    <div className="drill-scope">
      <div className="drill-page">
        <header className="drill-head">
          <div>
            <div className="eyebrow">PLAYERHQ · TREN</div>
            <h1>
              Drill <em>-bibliotek</em>
            </h1>
            <p className="drill-sub">
              Søk og utforsk drills tilpasset ditt nivå. Klikk en drill for å se
              detaljer og be om å få den i neste plan.
            </p>
          </div>
          <div className="drill-head-actions">
            <button type="button" className="drill-filter-pill">
              <Search size={12} strokeWidth={1.75} aria-hidden /> Søk
            </button>
            <button type="button" className="drill-filter-pill">
              <Filter size={12} strokeWidth={1.75} aria-hidden /> Filter
            </button>
          </div>
        </header>

        <div className="drill-filter-row">
          <span className="drill-filter-pill active">Alle</span>
          <span className="drill-filter-pill">Putting</span>
          <span className="drill-filter-pill">Nærspill</span>
          <span className="drill-filter-pill">Jernslag</span>
          <span className="drill-filter-pill">Driver</span>
          <span className="drill-filter-pill">Coach anbefalt</span>
        </div>

        <DrillGrid drills={drills} loadDetail={loadDetail} />
      </div>
    </div>
  );
}
