/** Prøvefil for AG-15 Tester. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG15Tester } from "@/components/admin/precision/AG15Tester";
import type { AdminTesterV2Data } from "@/components/admin/v2/AdminTesterV2";

export const sti = "/admin/tester";

const data: AdminTesterV2Data = {
  kpis: [
    { label: "Tester utført", value: "24" },
    { label: "Tester i bruk", value: "6", accent: true },
    { label: "Sist uke", value: "5" },
    { label: "Pågår nå", value: "1", varsle: true },
  ],
  tester: ["9 hull lengde", "Putt Speed", "Wedge Gate"],
  rader: [
    { key: "s1", spillerId: "p1", navn: "Test Spiller En", test: "Wedge Gate", resultat: "—", delta: null, deltaDir: null, dato: "28.09", status: "Pågår" },
    { key: "r1", spillerId: "p2", navn: "Test Spiller To", test: "9 hull lengde", resultat: "212 m", delta: "+4 m", deltaDir: "up", dato: "24.09", status: "Bedre" },
    { key: "r2", spillerId: "p3", navn: "Ingrid Berg med et langt navn som må brytes", test: "Putt Speed", resultat: "1,8 m/s", delta: "−0,1 m/s", deltaDir: "down", dato: "20.09", status: "Svakere" },
    { key: "r3", spillerId: "p4", navn: "Emil Solberg", test: "9 hull lengde", resultat: "198 m", delta: null, deltaDir: null, dato: "18.09", status: "Stabilt" },
  ],
};

const tom: AdminTesterV2Data = { ...data, rader: [] };

const Vis = (d: AdminTesterV2Data = data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG15Tester data={d} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

const valg = {
  tester: [{ id: "t1", navn: "Nærspill Gate" }, { id: "t2", navn: "Driver Basic" }, { id: "t3", navn: "Putt 1–3 m" }],
  spillere: [{ id: "p1", navn: "Test Spiller A" }, { id: "p2", navn: "Test Spiller B" }],
};

export const tilstander = {
  data: Vis(),
  tom: Vis(tom),
  tildel: (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Test Coach">
        <AG15Tester data={data} valg={valg} tildelSpillerId="p1" />
      </AgencyOSSkall>
    </AdminRolleProvider>
  ),
};
