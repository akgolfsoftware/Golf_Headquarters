/**
 * Rundeserie: SG total per runde (punkter) med rullerende snitt (linje), eldst til venstre.
 * Runder uten SG-tall blir hull i serien, ikke nullpunkter. Snittet vises først når det er
 * minst TREND_MIN_GRUNNLAG runder bak det.
 */
import { formaterFortegn } from "@/lib/format-tall";
import { byggTrend, TREND_MIN_GRUNNLAG, type DgSgRunde, type DgVisning } from "@/lib/datagolf/visning";
import { DgRamme } from "./DgRamme";

const rund = (n: number) => Math.round(n * 10) / 10;
const B = 640, H = 220, PX = 36, PY = 16;

function sti(pts: ReadonlyArray<{ x: number; y: number | null }>) {
  let d = "", ned = false;
  for (const p of pts) {
    if (p.y === null) { ned = false; continue; }
    d += `${ned ? "L" : "M"}${rund(p.x)} ${rund(p.y)} `;
    ned = true;
  }
  return d.trim();
}

export function RundeTrend({ resultat, vindu = 10, tittel = "Rundeserie" }: { resultat: DgVisning<readonly DgSgRunde[]>; vindu?: number; tittel?: string }) {
  const trend = resultat.tilstand === "klar" ? byggTrend(resultat.data, vindu) : [];
  const medVerdi = trend.filter(t => t.verdi !== null);
  const tom = resultat.tilstand === "klar" && medVerdi.length === 0;
  const tilstand = tom ? "tom" : resultat.tilstand;

  let innhold = null;
  if (tilstand === "klar") {
    const alle = trend.flatMap(t => [t.verdi, t.snitt]).filter((v): v is number => v !== null);
    const maks = Math.max(1, Math.ceil(Math.max(...alle))), min = Math.min(-1, Math.floor(Math.min(...alle)));
    const x = (i: number) => PX + (trend.length > 1 ? (i / (trend.length - 1)) * (B - PX - 8) : (B - PX - 8) / 2);
    const y = (v: number) => PY + ((maks - v) / (maks - min)) * (H - 2 * PY);
    const siste = [...trend].reverse().find(t => t.snitt !== null)?.snitt ?? null;
    const f = trend.find(t => t.dato)?.dato, t = [...trend].reverse().find(p => p.dato)?.dato;
    innhold = <>
      <svg className="dgk-trend" viewBox={`0 0 ${B} ${H}`} role="img"
        aria-label={`SG total for ${medVerdi.length} runder${siste !== null ? `, rullerende snitt nå ${formaterFortegn(siste, 2)}` : ""}`}>
        {[min, 0, maks].filter((v, i, a) => a.indexOf(v) === i).map(v => <g key={v}>
          <line x1={PX} x2={B - 8} y1={y(v)} y2={y(v)} className={v === 0 ? "null" : "rutenett"} />
          <text x={PX - 6} y={y(v) + 4} textAnchor="end" className="akse">{formaterFortegn(v, 0)}</text>
        </g>)}
        {trend.map(p => p.verdi !== null && <circle key={p.indeks} cx={x(p.indeks)} cy={y(p.verdi)} r={3} className="punkt">
          <title>{`${p.arrangement ?? "Runde"}${p.dato ? `, ${p.dato}` : ""}: ${formaterFortegn(p.verdi, 2)}`}</title>
        </circle>)}
        <path d={sti(trend.map(p => ({ x: x(p.indeks), y: p.snitt === null ? null : y(p.snitt) })))} className="snitt" />
      </svg>
      <p className="kilde">
        {f && t ? `${f} til ${t} · ` : ""}{medVerdi.length} runder med SG{trend.length > medVerdi.length ? `, ${trend.length - medVerdi.length} uten tall (hull i serien)` : ""}.
        {siste === null ? ` Rullerende snitt vises fra ${TREND_MIN_GRUNNLAG} runder.` : ` Linjen er snittet over de ${vindu} siste rundene.`}
      </p>
    </>;
  }
  return <DgRamme tittel={tittel} tilstand={tilstand} tomTittel="Ingen runder med SG" lasteHoyder={[220]}>{innhold}</DgRamme>;
}
