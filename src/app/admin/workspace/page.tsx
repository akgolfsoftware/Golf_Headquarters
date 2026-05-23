/**
 * /admin/workspace — Min uke (default).
 *
 * Placeholder mens Claude Design genererer pixel-perfekt design
 * (workspace-prompt.md i fillagring). Kobles mot OppgaveCache når
 * Prisma-modeller er på plass.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow, AthleticButton } from "@/components/athletic";
import { TabBar } from "@/components/ds/tab-bar";
import { WorkspacePlaceholder } from "./placeholder";

export const dynamic = "force-dynamic";

export default async function WorkspaceMinUkePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const erHovedCoach = user.role === "ADMIN" || user.email === "akgolfgroup@gmail.com";

  return (
    <div className="space-y-6">
      <header>
        <AthleticEyebrow>CoachHQ · Workspace</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Min{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              color: "#005840",
            }}
          >
            uke
          </em>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {erHovedCoach
            ? "Alle dine oppgaver og prosjekter — Notion + manuelle."
            : "Dine tildelte oppgaver fra hovedcoach."}
        </p>
      </header>

      <TabBar
        tabs={[
          { id: "min-uke", label: "Min uke" },
          { id: "oppgaver", label: "Oppgaver" },
          { id: "prosjekter", label: "Prosjekter" },
          { id: "tildelt-meg", label: "Tildelt meg" },
          { id: "notion", label: "Notion-tilkobling" },
        ]}
        defaultTab="min-uke"
      />

      <WorkspacePlaceholder
        title="Min uke"
        description="3-kol view (I dag · Denne uka · Senere). Brenner-strip sticky om noen oppgaver er BRENNER-prioritet."
        nextSteps={[
          "Vent på Claude Design-output for s1-workspace-min-uke.jsx",
          "Lim inn workspace-prompt.md i Claude Design",
          "Implementer fra Variant A når designet er klart",
        ]}
        cta={<AthleticButton variant="lime" size="md">Ny oppgave</AthleticButton>}
      />
    </div>
  );
}
