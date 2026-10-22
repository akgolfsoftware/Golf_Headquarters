/** Prøvefil for Stall › Ny spiller (AG07SpillerNy) i Skrå-drakten. Ingen data; skjemaet starter tomt. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG07SpillerNy } from "@/components/admin/precision/AG07SpillerNy";

export const sti = "/admin/spillere/ny";
export const tilstander = {
  data: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><div className="agn-s">
    <Topp tilbake={{ href: "/admin/spillere", tekst: "Stall" }} dato="Stall · ny spiller" tittel="Ny spiller"
      ingress="Fire steg. Spilleren får invitasjon på e-post hvis du sender den nå." />
    <div className="a2-under"><AG07SpillerNy /></div>
  </div></AgencyOSSkall></AdminRolleProvider>,
};
