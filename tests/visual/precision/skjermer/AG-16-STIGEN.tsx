/** Prøvefil for AK-stigen (/admin/agencyos/ak-stigen). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG16AkStigen } from "@/components/admin/precision/AG16AkStigen";
import { AK_STIGEN_TRINN, type AkStigenData } from "@/lib/agencyos/ak-stigen-data";

export const sti = "/admin/agencyos/ak-stigen";

const gruppe = (id: string, navn: string, medlemmer: number) => ({ id, navn, level: null, coachNavn: "Test Coach", medlemmer, tider: ["Tor 16:00"] });
const data: AkStigenData = {
  trinn: AK_STIGEN_TRINN,
  grupper: Object.fromEntries(AK_STIGEN_TRINN.slice(0, 3).map((t, i) => [t.gruppeNavn, gruppe(`g${i}`, t.gruppeNavn, i === 2 ? 0 : 6 + i)])),
  vedSidenAv: [gruppe("w", "WANG Toppidrett Fredrikstad", 11), gruppe("k", "GFGK Junior Knøtt U12", 5)],
  rester: [{ id: "r1", navn: "Gammel testgruppe", level: null, maks: null }],
  ukartlagt: [],
};

const Vis = (d: AkStigenData) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <div className="agn-s agn-a5-under">
        <Topp tilbake={{ href: "/admin/grupper", tekst: "Grupper" }} dato="Grupper · junior" tittel="AK-stigen" bilde="/images/playerhq/slag-putting.jpg"
          ingress="Mini, Basis, Utvikling og Elite, med gruppene som står ved siden av stigen." />
        <AG16AkStigen data={d} />
      </div>
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = { data: Vis(data), tom: Vis({ ...data, grupper: {}, vedSidenAv: [], rester: [] }) };
