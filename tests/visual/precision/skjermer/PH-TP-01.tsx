/** Prøvefil for PH-TP-01 Teknisk plan (spiller). Syntetiske data. */
import { PHTP01TekniskPlan } from "@/components/portal/precision/PHTP01TekniskPlan";
import Loading from "@/app/portal/tren/teknisk-plan/[planId]/loading";
import Feil from "@/app/portal/tren/teknisk-plan/[planId]/error";
import { tpPlan, tpTom } from "./_tp-data";
import { Natt } from "./_natt";

export const sti = "/portal/planlegge";
const okt = { href: "#", label: "Start økt" };

export const tilstander = {
  data: <PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} />,
  ark: <PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} startMedArk />,
  ingenOppgaver: <PHTP01TekniskPlan plan={tpTom} uleste={0} okt={{ href: "#", label: "Planlegg økt" }} />,
  tom: <PHTP01TekniskPlan plan={null} uleste={0} okt={okt} />,
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "503" })} reset={() => {}} />,
  nattData: <Natt><PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} /></Natt>,
  nattArk: <Natt><PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} startMedArk /></Natt>,
};
export const natt = ["nattData", "nattArk"];
// Feilsiden logger feilen med vilje (console.error). Det er ikke en konsollfeil i prøven.
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
