/** Prøvefil for Live-tavla (/admin/agencyos/live). AG-13.jsx «Live-tavle» er overstyrt
 * i katalogen av AG-cockpit.jsx (AG-13 = Live coachingøkt), derfor egen ID. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG13LiveTavle } from "@/components/admin/precision/AG13LiveTavle";
import type { LiveTavleData } from "@/lib/agencyos/live-tavle-data";

export const sti = "/admin/agencyos/live";

const data: LiveTavleData = {
  liveOkter: [
    { id: "s1", tittel: "Wedge 50–90 m", spillerNavn: "Testspiller Én", startTime: "2026-09-29T13:00:00.000Z", endTime: "2026-09-29T14:00:00.000Z", varighetTotalMin: 60, minIgjen: 22, fremdriftPct: 63 },
    { id: "s2", tittel: "Putting under press", spillerNavn: "Testspiller To med et navn som er ganske langt", startTime: "2026-09-29T13:15:00.000Z", endTime: "2026-09-29T14:15:00.000Z", varighetTotalMin: 60, minIgjen: 5, fremdriftPct: 92 },
  ],
  kommerIDag: [
    { id: "s3", tittel: "Privattime", spillerNavn: "Testspiller Tre", startTime: "2026-09-29T15:00:00.000Z" },
    { id: "s4", tittel: "Gruppeøkt", spillerNavn: null, startTime: "2026-09-29T16:30:00.000Z" },
  ],
};

const Vis = (d: LiveTavleData) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG13LiveTavle data={d} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis(data),
  tom: Vis({ liveOkter: [], kommerIDag: [] }),
};
