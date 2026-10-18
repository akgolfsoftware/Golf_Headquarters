/** Prøvefil for AG-A03 Gruppeanalyse. Syntetiske tall. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AGA03Gruppeanalyse } from "@/components/admin/precision/AGA03Gruppeanalyse";
import type { EnGruppeAnalyse } from "@/lib/admin/analyse/gruppe-analyse";

export const sti = "/admin/grupper/g1/analyse";

const data: EnGruppeAnalyse = {
  uker: 4, antallSpillere: 12, etterlevelsePct: 88, gjennomfortMin: 2640, planlagtMin: 3000,
  perAkse: [{ akse: "FYS", pct: 91, planlagtMin: 600 }, { akse: "TEK", pct: 84, planlagtMin: 900 }, { akse: "SLAG", pct: 90, planlagtMin: 800 }, { akse: "SPILL", pct: null, planlagtMin: 0 }, { akse: "TURN", pct: 96, planlagtMin: 700 }],
  dekning: [true, true, true, false, true, true, true, true, true, false, true, true],
};

const Vis = (d: EnGruppeAnalyse) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AGA03Gruppeanalyse groupId="g1" navn="Testgruppe Toppidrett" analyse={d} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis(data),
  tom: Vis({ ...data, antallSpillere: 0, etterlevelsePct: null, dekning: [] }),
};
