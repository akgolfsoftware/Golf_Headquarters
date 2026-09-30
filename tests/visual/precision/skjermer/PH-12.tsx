/** Prøvefil for PH-12 Velg treningsplan. Syntetiske data. */
import { PH12VelgPlan, type VelgPlanMal } from "@/components/portal/precision/PH12VelgPlan";
import Loading from "@/app/portal/planlegge/bygger/loading";
import Feil from "@/app/portal/planlegge/bygger/error";
import { Natt } from "./_natt";

export const sti = "/portal/planlegge";
const maler: VelgPlanMal[] = [
  { id: "a", navn: "Sesongplan junior", sub: "52 uker · 5 økter per uke", uker: 52, fordeling: { fys: 25, tek: 25, slag: 30, spill: 15, turn: 5 } },
  { id: "b", navn: "Grunnperiode vinter", sub: "12 uker · 4 økter per uke", uker: 12, fordeling: { fys: 20, tek: 20, slag: 20, spill: 20, turn: 20 } },
  { id: "c", navn: "Turneringsforberedelse", sub: "4 uker · 6 økter per uke", uker: 4, fordeling: { fys: 10, tek: 15, slag: 35, spill: 30, turn: 10 } },
];
const startUker = [
  { verdi: "2026-10-05", label: "Uke 41", mandag: "2026-10-05" },
  { verdi: "2026-10-12", label: "Uke 42", mandag: "2026-10-12" },
  { verdi: "2026-10-19", label: "Uke 43", mandag: "2026-10-19" },
];
const send = async () => ({ ok: true as const, planId: "p1" });
const p = { startUker, uleste: 2, onSend: send, workbenchHref: "#" };

export const tilstander = {
  mal: <PH12VelgPlan {...p} maler={maler} />,
  tom: <PH12VelgPlan {...p} maler={[]} />,
  maal: <PH12VelgPlan {...p} maler={maler} startSteg={1} />,
  volum: <PH12VelgPlan {...p} maler={maler} startSteg={2} />,
  oppsummering: <PH12VelgPlan {...p} maler={maler} startSteg={3} />,
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "500" })} reset={() => {}} />,
  nattMal: <Natt><PH12VelgPlan {...p} maler={maler} /></Natt>,
  nattVolum: <Natt><PH12VelgPlan {...p} maler={maler} startSteg={2} /></Natt>,
};
export const natt = ["nattMal", "nattVolum"];
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
