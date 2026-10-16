/** Prøvefil for PH-TP-01 Teknisk plan (spiller), pakke 4 i nytt design. Syntetiske data. */
import { PHTP01TekniskPlan } from "@/components/portal/precision/PHTP01TekniskPlan";
import Loading from "@/app/portal/tren/teknisk-plan/[planId]/loading";
import Feil from "@/app/portal/tren/teknisk-plan/[planId]/error";
import { planVisning } from "@/lib/teknisk-plan/tp-visning";
import { tpPlan, tpPlanInn, tpTom } from "./_tp-data";

export const sti = "/portal/planlegge";
const okt = { href: "#", label: "Start økt torsdag kl. 15:30" };
const utkast = planVisning({ ...tpPlanInn, status: "DRAFT" });

export const tilstander = {
  data: <PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} />,
  ark: <PHTP01TekniskPlan plan={tpPlan} uleste={2} okt={okt} startMedArk />,
  utkast: <PHTP01TekniskPlan plan={utkast} uleste={0} okt={okt} />,
  ingenOppgaver: <PHTP01TekniskPlan plan={tpTom} uleste={0} okt={{ href: "#", label: "Planlegg økt" }} />,
  tom: <PHTP01TekniskPlan plan={null} uleste={0} okt={okt} />,
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "503" })} reset={() => {}} />,
};
// Feilsiden rapporterer feilen med vilje. Det er ikke en konsollfeil i prøven.
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") { console.error = () => {}; window.fetch = async () => new Response("{}"); }
