/**
 * AG-11 Ukeverksted, designløftet 20.10.2026 (canvas «AgencyOS nøkkelskjermer», rad 6
 * Workbench, godkjent av Anders): «Lagt inn mot fordelt» per akse og linja om gruppeplanen.
 *
 * Fordelt kommer alltid fra nivået over (ukeplanens timer per akse, fylt fra perioden),
 * aldri fra et fast tall (§PLANNIVÅENE HENGER SAMMEN). Mangler fordelingen, står «—».
 * Forslag, ikke sperre: avvik vises, men stopper ingenting.
 */
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { AKSER, fordeltPerAkse, gruppeTelling, lagtInnPerAkse, timer } from "@/lib/agencyos/workbench-budsjett";

export function AG11Budsjett({ uke, okter, periodeTekst }: { uke: WeekViewModel; okter: readonly WorkbenchSession[]; periodeTekst?: string }) {
  const fordelt = fordeltPerAkse(uke);
  const lagt = lagtInnPerAkse(okter);
  const sumLagt = AKSER.reduce((s, a) => s + lagt[a], 0);
  const sumFordelt = fordelt ? AKSER.reduce((s, a) => s + fordelt[a], 0) : 0;
  const g = gruppeTelling(okter);
  return <div className="ws-budsjett-blokk">
    <section className="ws-budsjett" aria-label="Lagt inn mot fordelt">
      <div className="ws-budsjett-topp">
        <h2>Lagt inn mot fordelt <span className="ws-num">{fordelt ? `${timer(sumLagt)} av ${timer(sumFordelt)} t` : `${timer(sumLagt)} t lagt inn`}</span></h2>
        <span className="ws-muted">{fordelt ? `Fordelt kommer fra ${periodeTekst ?? "perioden"}` : "Ingen timer fordelt fra perioden ennå"}</span>
      </div>
      <div className="ws-budsjett-akser">
        {AKSER.map((a) => {
          const f = fordelt?.[a] ?? 0;
          const pct = f > 0 ? Math.min(100, Math.round((lagt[a] / f) * 100)) : 0;
          return <div key={a} className="ws-budsjett-akse" role="img" aria-label={`${a}: lagt inn ${timer(lagt[a])} av ${f ? `${timer(f)} timer` : "ikke fordelt"}`}>
            <span className="ws-budsjett-navn"><b>{a}</b><span className="ws-num">{timer(lagt[a])} / {f ? timer(f) : "—"} t</span></span>
            <span className="ws-budsjett-spor"><i className={`ws-budsjett-fyll a-${a.toLowerCase()}`} style={{ width: `${pct}%` }} /></span>
          </div>;
        })}
      </div>
    </section>
    {g.fraGruppa > 0 && <p className="ws-gruppelinje"><b>Gruppeplanen arves</b> · {g.fraGruppa} {g.fraGruppa === 1 ? "økt" : "økter"} fra gruppa{g.egen > 0 ? `, ${g.egen} endret for spilleren («Egen»)` : ""}</p>}
  </div>;
}
