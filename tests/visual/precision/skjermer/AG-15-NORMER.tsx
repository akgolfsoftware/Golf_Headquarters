/** Prøvefil for AG-15 Tester › Normer. Syntetiske data, ingen ekte spillere. */
import { ClipboardX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { AG15Normer } from "@/components/admin/precision/AG15Normer";
import type { AdminBenchmarksV2Data } from "@/components/admin/v2/AdminBenchmarksV2";

export const sti = "/admin/tester/benchmarks";

const data: AdminBenchmarksV2Data = {
  sisteKjoring: "28.09.26",
  ventende: [{
    id: "t1", navn: "9 hull lengde med et ganske langt navn", endringPct: "4,2", årsak: "Drift over 3 %-grensen fra mandagskjøringen",
    nivaer: [
      { id: "n1", label: "Nivå 1", verdi: "180", nesteVerdi: "184", endret: true },
      { id: "n2", label: "Nivå 2", verdi: "200", nesteVerdi: "200", endret: false },
      { id: "n3", label: "Nivå 3", verdi: "220", nesteVerdi: "226", endret: true },
    ],
  }],
  alle: [
    { id: "t1", navn: "9 hull lengde med et ganske langt navn", mode: "auto", kilde: "datagolf-godkjent-2026-09-21", verdier: "180 · 200 · 220" },
    { id: "t2", navn: "Putt Speed", mode: "follow", kilde: "ngf-2026", verdier: "1,6 · 1,8 · 2,0" },
    { id: "t3", navn: "Wedge Gate", mode: "static", kilde: "referanse", verdier: "10 · 14 · 18" },
  ],
};
const ingen = async () => {};
const Vis = (d: AdminBenchmarksV2Data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AG15Normer data={d} onApprove={ingen} onReject={ingen} onSyncNow={ingen} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const natt = ["data-natt"];
export const tilstander = {
  data: Vis(data),
  "data-natt": Vis(data),
  tom: Vis({ sisteKjoring: "aldri", ventende: [], alle: [] }),
  laster: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter testene …" /></div></AgencyOSSkall></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={ClipboardX} title="Testene kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="FEIL 502 · TESTER" /></div></AgencyOSSkall></AdminRolleProvider>,
};
