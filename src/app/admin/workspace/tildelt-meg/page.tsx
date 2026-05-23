import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic";
import { WorkspacePlaceholder } from "../placeholder";

export const dynamic = "force-dynamic";

export default async function WorkspaceTildeltMegPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <div className="space-y-6">
      <header>
        <AthleticEyebrow>CoachHQ · Workspace · Tildelt meg</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Tildelt{" "}
          <em
            className="font-normal not-italic"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#005840" }}
          >
            meg
          </em>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Alle oppgaver hvor &laquo;{user.name}&raquo; står i Tildelt-feltet i Notion.
        </p>
      </header>
      <WorkspacePlaceholder
        title="Default-view for Junior Coaches"
        description="Markus (og andre Junior Coaches) lander her som default i stedet for Min uke. Viser kun oppgaver der hans navn matcher Notion `Tildelt`-feltet."
        nextSteps={[
          "Vent på Claude Design — kan dele s1-mønster",
          "Default-rute for ikke-ADMIN coaches",
          "Filtrering: navn-match mot Notion `Tildelt`-property (tekst-sammenligning)",
        ]}
      />
    </div>
  );
}
