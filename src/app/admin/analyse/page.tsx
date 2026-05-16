/**
 * Treningsanalyse — Bølge 4 av Masterplan.
 *
 * Krysstabulering av all logget aktivitet. Tre-panel layout:
 *   - venstre: AnalyseSidebar (spiller/periode/visning)
 *   - midt: hovedvisning
 *   - høyre (kun for krysstabell): drill-down panel
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyseSidebar } from "@/components/analyse/AnalyseSidebar";
import { AnalyseOversikt } from "@/components/analyse/AnalyseOversikt";
import { AnalyseKrysstabell } from "@/components/analyse/AnalyseKrysstabell";
import { AnalyseTrender } from "@/components/analyse/AnalyseTrender";
import { AnalyseSG } from "@/components/analyse/AnalyseSG";
import { AnalyseFys } from "@/components/analyse/AnalyseFys";
import { AnalysePlanFaktisk } from "@/components/analyse/AnalysePlanFaktisk";
import {
  getAnalysisOverview,
  getKrysstabulering,
  getDrillUsage,
  getPlanVsActual,
  getSGCoupling,
  getTrendData,
  getFysProgression,
} from "./actions";
import {
  DEMO_OVERSIKT,
  DEMO_KRYSSTABELL,
  DEMO_DRILL_USAGE,
  DEMO_PLAN_VS_ACTUAL,
  DEMO_SG,
  DEMO_FYS,
  lagDemoTrend,
} from "./__demoData";

export const dynamic = "force-dynamic";

type View =
  | "oversikt"
  | "krysstabell"
  | "trender"
  | "sg"
  | "fys"
  | "plan-faktisk";

const GYLDIGE_VIEWS: View[] = [
  "oversikt",
  "krysstabell",
  "trender",
  "sg",
  "fys",
  "plan-faktisk",
];

function parsePeriode(s: string | undefined): {
  from: Date;
  to: Date;
  label: string;
} {
  const to = new Date();
  const from = new Date();
  let label = "Siste 30 dager";
  switch (s) {
    case "7d":
      from.setDate(from.getDate() - 7);
      label = "Siste 7 dager";
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      label = "Siste 90 dager";
      break;
    case "365d":
      from.setDate(from.getDate() - 365);
      label = "Siste 365 dager";
      break;
    case "30d":
    default:
      from.setDate(from.getDate() - 30);
  }
  return { from, to, label };
}

type SearchParams = Promise<{
  view?: string;
  periode?: string;
  studentId?: string;
  dim1?: string;
  dim2?: string;
  agg?: string;
}>;

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const params = await searchParams;
  const view: View = GYLDIGE_VIEWS.includes(params.view as View)
    ? (params.view as View)
    : "oversikt";
  const periode = parsePeriode(params.periode);

  // Liste alle aktive spillere (rolle PLAYER)
  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true, avatarUrl: true, hcp: true },
    orderBy: { name: "asc" },
  });

  // Hvis ingen studentId valgt → velg første spiller eller send til tom-state
  const studentId = params.studentId ?? spillere[0]?.id;
  if (!studentId) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="CoachHQ · treningsanalyse"
          titleLead="Krysstabuler"
          titleItalic="all aktivitet"
          sub="Ingen spillere funnet. Opprett en spiller for å begynne."
        />
      </div>
    );
  }

  // Verifiser at studentId er gyldig
  if (!spillere.find((s) => s.id === studentId)) {
    redirect(`/admin/analyse?view=${view}&periode=${params.periode ?? "30d"}`);
  }

  // Hent alle data parallelt
  const erKrysstabell = view === "krysstabell";
  const dim1 = (params.dim1 ?? "omraade") as
    | "omraade"
    | "pyramide"
    | "miljo"
    | "praksistype"
    | "lFase"
    | "csNivaa"
    | "prPress"
    | "componentFocus";
  const dim2 = (params.dim2 ?? "pyramide") as typeof dim1;
  const agg = params.agg === "maaned" ? "maaned" : "uke";

  const [oversikt, kryss, drillBruk, planFaktisk, sg, trend, fys] =
    await Promise.all([
      getAnalysisOverview(studentId, periode).catch(() => DEMO_OVERSIKT),
      erKrysstabell
        ? getKrysstabulering(studentId, periode, dim1, dim2).catch(
            () => DEMO_KRYSSTABELL,
          )
        : Promise.resolve(DEMO_KRYSSTABELL),
      getDrillUsage(studentId, periode).catch(() => DEMO_DRILL_USAGE),
      view === "plan-faktisk"
        ? getPlanVsActual(studentId, periode).catch(() => DEMO_PLAN_VS_ACTUAL)
        : Promise.resolve(DEMO_PLAN_VS_ACTUAL),
      view === "sg"
        ? getSGCoupling(studentId, periode).catch(() => DEMO_SG)
        : Promise.resolve(DEMO_SG),
      view === "trender"
        ? getTrendData(studentId, periode, "pyramide", agg).catch(() =>
            lagDemoTrend("pyramide"),
          )
        : Promise.resolve(lagDemoTrend("pyramide")),
      view === "fys"
        ? getFysProgression(studentId, periode).catch(() => DEMO_FYS)
        : Promise.resolve(DEMO_FYS),
    ]);

  // Fallback til demo hvis tom
  const trygOversikt = oversikt.totalMinutes === 0 ? DEMO_OVERSIKT : oversikt;
  const trygDrillBruk = drillBruk.length === 0 ? DEMO_DRILL_USAGE : drillBruk;
  const trygPlan =
    planFaktisk.length === 0 ? DEMO_PLAN_VS_ACTUAL : planFaktisk;
  const trygSg = sg.length === 0 ? DEMO_SG : sg;
  const trygTrend = trend.length === 0 ? lagDemoTrend("pyramide") : trend;
  const trygFys = fys.length === 0 ? DEMO_FYS : fys;
  const trygKryss = kryss.celler.length === 0 ? DEMO_KRYSSTABELL : kryss;

  const valgtSpiller = spillere.find((s) => s.id === studentId)!;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CoachHQ · treningsanalyse · ${periode.label}`}
        titleLead="Krysstabuler"
        titleItalic="all aktivitet"
        sub={`Hva har ${valgtSpiller.name} faktisk trent på — i hvilken signatur?`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AnalyseSidebar
          spillere={spillere}
          valgtStudentId={studentId}
          valgtPeriode={params.periode ?? "30d"}
          valgtView={view}
        />

        <main className="min-w-0 space-y-6">
          {view === "oversikt" && (
            <AnalyseOversikt data={trygOversikt} drillBruk={trygDrillBruk} />
          )}
          {view === "krysstabell" && (
            <AnalyseKrysstabell
              studentId={studentId}
              periodeKey={params.periode ?? "30d"}
              initData={trygKryss}
              initDim1={dim1}
              initDim2={dim2}
            />
          )}
          {view === "trender" && (
            <AnalyseTrender
              data={trygTrend}
              valgtAgg={agg}
              studentId={studentId}
              periodeKey={params.periode ?? "30d"}
            />
          )}
          {view === "sg" && <AnalyseSG data={trygSg} />}
          {view === "fys" && (
            <AnalyseFys
              data={trygFys}
              muskelfordeling={trygOversikt.fysMuskelgruppeFordeling}
            />
          )}
          {view === "plan-faktisk" && <AnalysePlanFaktisk data={trygPlan} />}
        </main>
      </div>
    </div>
  );
}
