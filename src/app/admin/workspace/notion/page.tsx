import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic";
import { WorkspacePlaceholder } from "../placeholder";

export const dynamic = "force-dynamic";

export default async function WorkspaceNotionPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <div className="space-y-6">
      <header>
        <AthleticEyebrow>CoachHQ · Workspace · Notion-tilkobling</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Koble til{" "}
          <em
            className="font-normal not-italic"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#005840" }}
          >
            Notion
          </em>
        </h1>
      </header>
      <WorkspacePlaceholder
        title="OAuth + database-velger + feltkartlegging"
        description="Kun ADMIN (Anders) kobler Notion. Markus og andre coaches bruker Anders' tilkobling — de filtreres på Tildelt-feltet. Sync-cron hvert 5. min, toveis (status-endringer pushes tilbake)."
        nextSteps={[
          "Vent på s5-workspace-notion.jsx",
          "Prisma-modeller: NotionConnection + NotionDatabaseLink + OppgaveCache",
          "Implementer OAuth med Notion Internal Integration token",
          "Toveis sync via Notion Pages API (PATCH) — pushes status/prioritet/forfaller-endringer",
        ]}
      />
    </div>
  );
}
