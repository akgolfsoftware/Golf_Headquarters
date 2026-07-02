import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { CalendarSyncSection } from "./calendar-sync-section";

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function CalendarSettings({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ok, error } = await searchParams;
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Innstillinger · Google Calendar"
        titleLead="Google"
        titleItalic="Calendar"
        titleTrail="2-way sync"
        sub="Koble din Google-konto og velg hvilke kalendere som skal pushe bookinger og blokkere tider. Endringer i Google Calendar reflekteres tilbake hit."
      />
      <CalendarSyncSection userId={user.id} ok={ok} error={error} />
    </div>
  );
}
