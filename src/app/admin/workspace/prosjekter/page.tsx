import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic";
import { WorkspacePlaceholder } from "../placeholder";

export const dynamic = "force-dynamic";

export default async function WorkspaceProsjekterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <div className="space-y-6">
      <header>
        <AthleticEyebrow>CoachHQ · Workspace · Prosjekter</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Mine{" "}
          <em
            className="font-normal not-italic"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#005840" }}
          >
            prosjekter
          </em>
        </h1>
      </header>
      <WorkspacePlaceholder
        title="Prosjekt-grid med selskaps-fargekoder"
        description="3-kol grid (desktop). Per card: top-strip i selskaps-farge, eyebrow med SELSKAP · STATUS, tittel, beskrivelse, stats (open/doing/done/total), progress-bar, tildelt-avatar-stack, forfaller-dato, synlighet-ikon."
        nextSteps={[
          "Vent på s4-workspace-prosjekter.jsx",
          "Bruk samme card-mønster som /admin/spillere",
          "Sync prosjekter fra Notion-database `AK Golf · Prosjekter`",
        ]}
      />
    </div>
  );
}
