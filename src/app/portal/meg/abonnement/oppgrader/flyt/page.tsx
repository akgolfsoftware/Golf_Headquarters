import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { OppgraderFlytWizard } from "./oppgrader-flyt-wizard";

export default async function OppgraderFlytPage() {
  const user = await requirePortalUser();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pro · Oppgraderingsflyt"
        titleLead="Bli"
        titleItalic="Pro"
        titleTrail="— gå dypere med spillet ditt"
        sub="AI-coach hele døgnet, ubegrenset video-analyse og komplett historikk. Bygd for spillere som har en plan."
      />
      <OppgraderFlytWizard
        bruker={{
          navn: user.name ?? "Markus Røinås Pedersen",
          epost: user.email ?? "markus.rp@example.com",
        }}
      />
    </div>
  );
}
