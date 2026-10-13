import { SideHode, FanerLenker } from "@/components/precision/pa-a4";
import { analyseHref, type AnalyseFane, type AnalyseFaneId } from "@/lib/admin/analyse/faner";
export function AnalyseHode({ faner, aktiv, antall }: { faner: AnalyseFane[]; aktiv: AnalyseFaneId; antall: Partial<Record<AnalyseFaneId, number>> }) {
  return <><SideHode title="Innsikt" sub="Registrerte resultater, trening og utvikling. Sammenligningsgrunnlaget står ved tallene." />
    <FanerLenker faner={faner.map(f => ({ href: analyseHref(f.id), navn: `${f.label}${antall[f.id] !== undefined ? ` · ${antall[f.id]!.toLocaleString("nb-NO")}` : ""}`, aktiv: f.id === aktiv }))} />
  </>;
}
