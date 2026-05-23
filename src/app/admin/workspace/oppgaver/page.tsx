import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic";
import { WorkspacePlaceholder } from "../placeholder";

export const dynamic = "force-dynamic";

export default async function WorkspaceOppgaverPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <div className="space-y-6">
      <header>
        <AthleticEyebrow>CoachHQ · Workspace · Oppgaver</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Alle{" "}
          <em
            className="font-normal not-italic"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#005840" }}
          >
            oppgaver
          </em>
        </h1>
      </header>
      <WorkspacePlaceholder
        title="Liste · Kanban · Kalender"
        description="View-toggle på toppen. Filter-bar med søk, status-pills, prosjekt-dropdown, prioritet, synlighet. Drag-drop endrer status både i visningen og pushes til Notion."
        nextSteps={[
          "Vent på s2-workspace-oppgaver.jsx",
          "Implementer Liste-view først, Kanban etterpå",
          "Kalender-view kan vente til v1.1",
        ]}
      />
    </div>
  );
}
