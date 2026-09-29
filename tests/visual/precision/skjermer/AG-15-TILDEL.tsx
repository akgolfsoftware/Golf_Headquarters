/** Prøvefil for AG-15 Tester › Tildel. Syntetiske data, ingen ekte spillere. */
import { ClipboardX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { AG15Tildel } from "@/components/admin/precision/AG15Tildel";
import type { AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";

export const sti = "/admin/tester/tildel/p1";

const data: AdminTildelTestV2Data = {
  spillerId: "p1", spillerNavn: "Test Spiller En", kategori: "D", hcpLabel: "HCP 12,4", fullforte: 5, totalt: 8, tilbakeHref: "/admin/tester",
  tester: [
    { id: "a", name: "9 hull lengde", description: "Total lengde på ni driver-slag", pyramidArea: "SLAG" },
    { id: "b", name: "Putt Speed med et langt navn som må brytes riktig", description: "Hastighet på putt fra 3 m og et enda lengre beskrivende avsnitt som også må brytes", pyramidArea: "SPILL" },
    { id: "c", name: "Knebøy 1RM", description: "", pyramidArea: "FYS" },
    { id: "d", name: "Wedge Gate", description: "Lengdekontroll 50–100 m", pyramidArea: "TEK" },
  ],
};
const Vis = (d: AdminTildelTestV2Data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AG15Tildel data={d} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const natt = ["data-natt"];
export const tilstander = {
  data: Vis(data),
  "data-natt": Vis(data),
  tom: Vis({ ...data, tester: [], kategori: null, hcpLabel: "HCP —", fullforte: 0, totalt: 0 }),
  laster: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter testene …" /></div></AgencyOSSkall></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={ClipboardX} title="Testene kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="FEIL 502 · TESTER" /></div></AgencyOSSkall></AdminRolleProvider>,
};
