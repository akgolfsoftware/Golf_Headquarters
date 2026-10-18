import { redirect } from "next/navigation";

/**
 * /admin/analyse sendes videre (utkast-agencyos/resten.html, «Sendes videre»): stall-oversikten er
 * Stall, spillerens tall er Spiller 360 › Stats, og gruppetallene er Gruppeanalysen (AG-A03, i hver
 * gruppe). /admin/analysere/compliance sender hit og følger med videre.
 */
export default function AnalyseVideresending(): never {
  redirect("/admin/spillere");
}
