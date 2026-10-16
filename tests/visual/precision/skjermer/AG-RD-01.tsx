/** Prøvefil for AG-RD-01 Rundeanalyse. Syntetiske data, oppdiktede navn. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AGRD01Runder, type RunderData } from "@/components/admin/precision/AGRD01Runder";
import Loading from "@/app/admin/runder/loading";
import Feil from "@/app/admin/runder/error";

export const sti = "/admin/runder";

const data: RunderData = {
  vist: 3, total: 128, spillere: 2, snittBrutto: 75.5, snittTilPar: 3.5, tellende: 2,
  beste: { brutto: 74, tilPar: 3, spiller: "Eira Solvang", bane: "Nordre golfbane" },
  sgSnitt: -0.6, sgRunder: 1, kilde: "RUNDER · BRUTTO · 27.09.2026",
  runder: [
    { id: "r1", spiller: "Eira Solvang", spillerId: "u1", hcp: "6,1", bane: "Nordre golfbane", dato: "27.09.2026", brutto: 74, tilPar: 3, hull: 18, sg: -0.6, type: "Turnering", grunnlag: "Slag for slag" },
    { id: "r2", spiller: "Mathias Tveit", spillerId: "u2", hcp: "12,4", bane: "Bane med et veldig langt navn golfklubb og country club", dato: "25.09.2026", brutto: 77, tilPar: 4, hull: null, sg: null, type: "Trening", grunnlag: "Scorekort" },
    { id: "r3", spiller: "Mathias Tveit", spillerId: "u2", hcp: "12,4", bane: "Søndre golfbane", dato: "20.09.2026", brutto: 41, tilPar: 5, hull: 9, sg: null, type: "Trening", grunnlag: "Hullkort" },
  ],
};
const S = (p: { tilstand: "data" | "tom"; data: RunderData }) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><AGRD01Runder {...p} /></AgencyOSSkall></AdminRolleProvider>;
export const tilstander = {
  data: <S tilstand="data" data={data} />,
  tom: <S tilstand="tom" data={{ ...data, total: 0, vist: 0, runder: [] }} />,
  laster: <AdminRolleProvider erAdmin><Loading /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><Feil error={Object.assign(new Error("prøve"), { digest: "502" })} reset={() => {}} /></AdminRolleProvider>,
};
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
