/** Prøvefil for AgencyOS-skallet. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Sidehode } from "@/components/precision/pa";

export const sti = "/admin/spillere/x";

const Innhold = () => <div className="pa-side">
  <Sidehode kicker="Stall · 12 spillere" title="Stall" sub="Innhold i skallet. Lang tekst som skal brytes pent i smale bredder uten å dytte siden sidelengs." />
  <div className="pa-card" style={{ padding: 16 }}>Kort</div>
</div>;

export const tilstander = {
  headcoach: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><Innhold /></AgencyOSSkall></AdminRolleProvider>,
  assistent: <AdminRolleProvider erAdmin={false}><AgencyOSSkall navn="Test Assistent" uleste={7}><Innhold /></AgencyOSSkall></AdminRolleProvider>,
  haster: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach" uleste={128} haster><Innhold /></AgencyOSSkall></AdminRolleProvider>,
};
