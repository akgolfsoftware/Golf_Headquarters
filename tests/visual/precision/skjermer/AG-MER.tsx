/** Prøvefil for Mer i AgencyOS. Ingen data utover menyen. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { MerSide } from "@/components/admin/agencyos-ny/MerSide";

export const sti = "/admin/mer";

export const tilstander = {
  headcoach: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><MerSide erHeadCoach /></AgencyOSSkall></AdminRolleProvider>,
  coach: <AdminRolleProvider erAdmin={false}><AgencyOSSkall navn="Test Assistent"><MerSide erHeadCoach={false} /></AgencyOSSkall></AdminRolleProvider>,
};
