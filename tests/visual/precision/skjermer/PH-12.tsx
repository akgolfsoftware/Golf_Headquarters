/** Prøvefil for PH-12 Velg treningsplan, pakke 4 i nytt design. Syntetiske data. */
import { PH12VelgPlan, type VelgPlanMal } from "@/components/portal/precision/PH12VelgPlan";
import Loading from "@/app/portal/planlegge/bygger/loading";
import Feil from "@/app/portal/planlegge/bygger/error";

export const sti = "/portal/planlegge";
const maler: VelgPlanMal[] = [
  { id: "a", navn: "Klubbspilleren", beskrivelse: "Fire økter i uka, mest nærspill og putting.", uker: 12, okterPerUke: 4, fordeling: { fys: 15, tek: 15, slag: 45, spill: 25, turn: 0 }, anbefalt: false },
  { id: "b", navn: "Konkurransespilleren", beskrivelse: "Periodisert mot turneringene dine, med testuker.", uker: 16, okterPerUke: 6, fordeling: { fys: 20, tek: 20, slag: 35, spill: 15, turn: 10 }, anbefalt: true },
  { id: "c", navn: "Practice like the pros", beskrivelse: null, uker: 8, okterPerUke: 9, fordeling: { fys: 20, tek: 25, slag: 35, spill: 10, turn: 10 }, anbefalt: false },
];
const startUker = [
  { verdi: "2026-10-12", label: "Uke 42", mandag: "2026-10-12" },
  { verdi: "2026-10-19", label: "Uke 43", mandag: "2026-10-19" },
  { verdi: "2026-10-26", label: "Uke 44", mandag: "2026-10-26" },
];
const send = async () => ({ ok: true as const, planId: "p1" });
const p = { startUker, uleste: 2, onSend: send, workbenchHref: "#" };
const kat = { navn: "Kategori C", snitt: 73.1 };

export const tilstander = {
  data: <PH12VelgPlan {...p} maler={maler} kategori={kat} />,
  ark: <PH12VelgPlan {...p} maler={maler} kategori={kat} startMedArk />,
  ingenMaler: <PH12VelgPlan {...p} maler={[]} kategori={kat} />,
  tom: <PH12VelgPlan {...p} maler={[]} kategori={null} />,
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "500" })} reset={() => {}} />,
};
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") { console.error = () => {}; window.fetch = async () => new Response("{}"); }
