/**
 * AG-A03 Gruppeanalyse i nytt design (designbrevet 13.10.2026) — /admin/grupper/[id]/analyse.
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-A03 Gruppeanalyse».
 *
 * Snitt for gruppa: gjennomført tid mot planlagt (siste 4 uker, forfalte økter),
 * per akse, og datadekning uten navn. Rangerer aldri spillerne.
 *
 * Avvik:
 *   - «Nivå» (snittscore og kategori for gruppa) og «Belastning» (snitt «hvor tungt»)
 *     har ingen spørring på gruppenivå ennå og er utelatt, ikke anslått.
 *   - Datadekning bygger på økter i Workbench, ikke runder.
 */
import { Topp, Tom } from "@/components/admin/agencyos-ny/ny";
import { GruppeFanerNy } from "@/components/admin/precision/AG16Gruppe";
import type { EnGruppeAnalyse } from "@/lib/admin/analyse/gruppe-analyse";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-gruppe-resten.css";

const pst = (p: number | null) => (p == null ? "—" : `${p} %`);
const timer = (min: number) => `${formaterTall(min / 60, 1)} t`;

export function AGA03Gruppeanalyse({ groupId, navn, analyse }: { groupId: string; navn: string; analyse: EnGruppeAnalyse }) {
  const medData = analyse.dekning.filter(Boolean).length;
  const forLite = analyse.antallSpillere === 0 || analyse.etterlevelsePct == null;
  return <div className="agn-s">
    <Topp tilbake={{ href: `/admin/grupper/${groupId}`, tekst: navn }}
      dato={`${navn} · ${analyse.antallSpillere} spillere · siste ${analyse.uker} uker`} tittel="Gruppeanalyse" />
    <GruppeFanerNy groupId={groupId} aktiv="stats" />
    {forLite
      ? <Tom tittel="For lite data" tekst="Gruppeanalysen kommer når spillerne i gruppa har forfalte økter i Workbench de siste fire ukene." />
      : <>
      <div className="teller-rad ga-tellere">
        <div className="teller"><span className="e">Gjennomført mot planlagt</span><b className="t">{pst(analyse.etterlevelsePct)}</b><span className="s">snitt for gruppa, {analyse.uker} uker</span></div>
        <div className="teller"><span className="e">Spillere med data</span><b className="t">{medData} av {analyse.antallSpillere}</b><span className="s">har forfalte økter</span></div>
        <div className="teller"><span className="e">Gjennomført</span><b className="t">{timer(analyse.gjennomfortMin)}</b><span className="s">av {timer(analyse.planlagtMin)} planlagt</span></div>
        <div className="teller"><span className="e">Datadekning</span><b className="t">{analyse.antallSpillere ? Math.round((medData / analyse.antallSpillere) * 100) : 0} %</b><span className="s">spillere med økter</span></div>
      </div>
      <div className="to-del">
        <div>
          <section className="kort" aria-label="Gjennomført mot planlagt">
            <div className="hoved"><strong>{pst(analyse.etterlevelsePct)}</strong><span className="forklar">gjennomført tid mot planlagt, snitt for gruppa</span></div>
            <div style={{ display: "grid", gap: 10 }}>
              {analyse.perAkse.map((a) => <div key={a.akse} className="ga-rad">
                <span>{a.akse}</span>
                <div className="stolpe" aria-hidden><span className={`a-${a.akse.toLowerCase()}`} style={{ width: `${a.pct ?? 0}%` }} /></div>
                <span className="v">{pst(a.pct)}</span>
              </div>)}
            </div>
            <p className="kilde">{timer(analyse.gjennomfortMin)} gjennomført av {timer(analyse.planlagtMin)} planlagt. Fremtidige økter teller ikke.</p>
          </section>
          {analyse.planlagtMin > 0 && <section className="seksjon" aria-label="Planlagt tid per akse">
            <div className="sek-topp"><h2>Planlagt tid per akse</h2><span className="kilde">Siste {analyse.uker} uker</span></div>
            <div className="ga-stripe" role="img" aria-label={`Planlagt tid per akse: ${analyse.perAkse.filter((a) => a.planlagtMin > 0).map((a) => `${a.akse} ${timer(a.planlagtMin)}`).join(", ")}`}>
              {analyse.perAkse.filter((a) => a.planlagtMin > 0).map((a) => <i key={a.akse} className={`a-${a.akse.toLowerCase()}`} style={{ flex: a.planlagtMin }} />)}
            </div>
            <div className="ga-tegn">{analyse.perAkse.filter((a) => a.planlagtMin > 0).map((a) => <span key={a.akse}><i className={`a-${a.akse.toLowerCase()}`} aria-hidden />{a.akse} <b className="mono">{timer(a.planlagtMin)}</b></span>)}</div>
          </section>}
        </div>
        <div>
          <section className="seksjon" aria-label="Datadekning">
            <div className="sek-topp"><h2>Datadekning</h2><span className="kilde">Siste {analyse.uker} uker</span></div>
            <div className="dekning" role="img" aria-label={`${medData} av ${analyse.antallSpillere} spillere har økter registrert`}>
              {analyse.dekning.map((ja, i) => <i key={i} className={ja ? "ja" : undefined} />)}
            </div>
            <p className="forklar">{medData} av {analyse.antallSpillere} har økter i planen som er forfalt. Ingen navn i denne visningen.</p>
          </section>
          <p className="kilde">Gruppeanalysen viser snitt. Den rangerer ikke spillerne.</p>
        </div>
      </div></>}
  </div>;
}
