/** Prøvefil for AG-07-NY Ny spiller (skjema). Syntetiske data, ingen ekte personer. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG07Ny, AG07_NY_TOM } from "@/components/admin/precision/AG07Ny";
import Loading from "@/app/admin/spillere/ny/loading";
import Feil from "@/app/admin/spillere/ny/error";

export const sti = "/admin/spillere/ny";
export const natt: string[] = ["dataNatt", "tomNatt"];

const fylt = { ...AG07_NY_TOM, program: "AK_ACADEMY_JUNIOR" as const, navn: "Eira Solvang", epost: "eira@eksempel.no", fodselsdato: "2011-03-14", hcp: "18,4", hjemmeklubb: "Nordre GK", foreldreNavn: "Kari Solvang", foreldreEpost: "kari@eksempel.no" };
const S = (initial = AG07_NY_TOM) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><AG07Ny initial={initial} /></AgencyOSSkall></AdminRolleProvider>;
export const tilstander = {
  data: S(fylt),
  dataNatt: S(fylt),
  tomNatt: S(),
  tom: S(),
  laster: <AdminRolleProvider erAdmin><Loading /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><Feil error={Object.assign(new Error("prøve"), { digest: "502" })} reset={() => {}} /></AdminRolleProvider>,
};
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
