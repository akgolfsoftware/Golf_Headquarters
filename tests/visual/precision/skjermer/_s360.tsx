/** Felles oppsett for Spiller 360-prøvene: skall, rolle og visning med syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG08Spiller360, type AG08Props } from "@/components/admin/precision/AG08Spiller360";
import Loading from "@/app/admin/spillere/[id]/loading";
import Feil from "@/app/admin/spillere/[id]/error";
import { hode, plan } from "./_s360-data";

export function S360(p: Partial<AG08Props>) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke">
        <AG08Spiller360 tilstand="data" hode={hode} fane="plan" faneData={{ fane: "plan", data: plan }} rail={null} {...p} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const laster = <AdminRolleProvider erAdmin><Loading /></AdminRolleProvider>;
export const feil = <AdminRolleProvider erAdmin><Feil error={Object.assign(new Error("prøve"), { digest: "502" })} reset={() => {}} /></AdminRolleProvider>;

// Feilsiden logger feilen med vilje (console.error). Det er ikke en konsollfeil i prøven.
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
