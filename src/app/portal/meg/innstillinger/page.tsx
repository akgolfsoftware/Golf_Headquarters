import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { NotifToggles } from "./notif-toggles";

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Innstillinger
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Endringer lagres automatisk.
        </p>
      </div>

      <NotifToggles initial={prefs} />
    </div>
  );
}
