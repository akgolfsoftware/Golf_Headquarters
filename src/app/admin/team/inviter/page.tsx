/**
 * CoachHQ — Inviter coach
 * Enkelt invitasjonsskjema. Bruker eksisterende server action
 * `inviterCoach` i `src/app/admin/team/actions.ts`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { InviterCoachForm } from "./inviter-coach-form";

export default async function InviterCoachPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/team/inviter"
        titleLead="Inviter"
        titleItalic="coach"
        sub="Coachen får en e-post med innloggingslink og kan logge inn umiddelbart med samme e-post."
      />

      <div className="max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <InviterCoachForm />
      </div>
    </div>
  );
}
