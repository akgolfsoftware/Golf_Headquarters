import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/shared/page-header";
import { NotifToggles } from "./notif-toggles";

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Innstillinger"
        titleLead="Slik portalen"
        titleItalic="oppfører seg"
        sub="Endringer lagres automatisk."
      />

      <NotifToggles initial={prefs} />
    </div>
  );
}
