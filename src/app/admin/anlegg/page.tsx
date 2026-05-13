/**
 * CoachHQ — Anlegg (samle-side).
 *
 * Slår sammen Lokasjoner, Fasiliteter og Tilgjengelighet til én side med tabs.
 * Dyperutene /admin/locations/[id], /admin/facilities/[id] og /admin/availability
 * er urørte og fungerer som før.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { TabStrip } from "@/components/admin/tab-strip";
import LocationsPage from "@/app/admin/locations/page";
import FacilitiesPage from "@/app/admin/facilities/page";
import AvailabilityPage from "@/app/admin/availability/page";
import { LocationForm } from "@/app/admin/locations/location-form";

type TabKey = "lokasjoner" | "fasiliteter" | "tilgjengelighet";

const TABS = [
  { key: "lokasjoner", label: "Lokasjoner" },
  { key: "fasiliteter", label: "Fasiliteter" },
  { key: "tilgjengelighet", label: "Tilgjengelighet" },
];

type Search = {
  tab?: string;
  coach?: string;
};

export default async function AnleggPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab: TabKey =
    params.tab === "fasiliteter" || params.tab === "tilgjengelighet"
      ? params.tab
      : "lokasjoner";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Planlegge"
        titleLead="Anlegg og"
        titleItalic="tilgjengelighet"
        sub="Lokasjoner, fasiliteter og trener-tilgjengelighet samlet."
        actions={<LocationForm triggerLabel="+ Ny lokasjon" />}
      />
      <TabStrip basePath="/admin/anlegg" tabs={TABS} active={tab} />
      <div>
        {tab === "lokasjoner" && <LocationsPage />}
        {tab === "fasiliteter" && <FacilitiesPage />}
        {tab === "tilgjengelighet" && (
          <AvailabilityPage
            searchParams={Promise.resolve({ coach: params.coach })}
          />
        )}
      </div>
    </div>
  );
}
