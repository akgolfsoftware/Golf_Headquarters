/** Prøvefil for AG-10 Teknisk plan (coach). Syntetiske data. */
import { AG10TekniskPlan } from "@/components/admin/precision/AG10TekniskPlan";
import Loading from "@/app/admin/spillere/[id]/plan/[planId]/loading";
import Feil from "@/app/admin/spillere/[id]/plan/[planId]/error";
import { tpPlan, tpTom } from "./_tp-data";

export const sti = "/admin/spillere/u1/plan/plan1";
const spiller = { id: "u1", navn: "Testspiller" };

export const tilstander = {
  data: <AG10TekniskPlan coachNavn="Testcoach" spiller={spiller} plan={tpPlan} planAktiv />,
  utkast: <AG10TekniskPlan coachNavn="Testcoach" spiller={spiller} plan={{ ...tpPlan, status: "Utkast", statusTone: "neutral" }} planAktiv={false} />,
  tom: <AG10TekniskPlan coachNavn="Testcoach" spiller={spiller} plan={tpTom} planAktiv={false} />,
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "502" })} reset={() => {}} />,
};
// Feilsiden logger feilen med vilje (console.error). Det er ikke en konsollfeil i prøven.
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
