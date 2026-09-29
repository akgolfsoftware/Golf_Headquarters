import Link from "next/link";

import { dagerMellom, leggTilDager, MND_LANG } from "@/app/team-wang/_data/wang-trening-beregning";

import s from "./it.module.css";
import type { Periodekode } from "./it-ui";

export type Tidslinjeblokk = {
  key: string;
  type: Periodekode;
  fra: string;
  til: string;
  kort: string;
  aria: string;
  /** Rad-toppen i px og høyden i px. */
  topp: number;
  hoyde: number;
  href?: string;
  valgt?: boolean;
};

/**
 * Årstidslinja (wg-tl): blokker plassert i prosent av skoleårets spenn, en
 * strek for i dag og månedsnavn under. Bare på desktop — mobil får lista.
 */
export function PeriodeTidslinje({ fra, til, idag, blokker, hoyde, naaFarge = "blaa", visNaaMerke = true }: { fra: string; til: string; idag: string; blokker: Tidslinjeblokk[]; hoyde: number; naaFarge?: "blaa" | "rosa"; visNaaMerke?: boolean }) {
  const lengde = Math.max(1, dagerMellom(fra, til) + 1);
  const pst = (iso: string) => Math.min(100, Math.max(0, (dagerMellom(fra, iso) / lengde) * 100));
  const mnd: string[] = [];
  for (let d = `${fra.slice(0, 7)}-01`; d <= til; ) {
    mnd.push(MND_LANG[Number(d.slice(5, 7)) - 1].slice(0, 3).replace(/^./, (c) => c.toUpperCase()));
    const [a, m] = d.split("-").map(Number);
    d = new Date(Date.UTC(a, m, 1)).toISOString().slice(0, 10);
  }
  const naa = idag >= fra && idag <= til ? pst(idag) : null;
  const strekFarge = naaFarge === "rosa" ? "var(--wtr-pink)" : "var(--wtr-blue)";
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div className={s.tl} style={{ height: hoyde }}>
        {blokker.map((b) => {
          const venstre = pst(b.fra);
          const bredde = Math.max(0.8, pst(leggTilDager(b.til, 1)) - venstre);
          const stil = { left: `${venstre}%`, width: `${bredde}%`, top: b.topp, height: b.hoyde };
          const klasse = `${s.tlb} ${s[`tlb-${b.type}`]} ${b.valgt ? s.tlbPa : ""}`;
          return b.href ? (
            <Link key={b.key} href={b.href} scroll={false} className={klasse} style={stil} aria-label={b.aria} title={b.aria} aria-current={b.valgt ? "true" : undefined}>
              <span>{b.kort}</span>
            </Link>
          ) : (
            <span key={b.key} className={klasse} style={stil} title={b.aria}>
              <span>{b.kort}</span>
            </span>
          );
        })}
        {naa !== null ? (
          <>
            <span aria-hidden="true" className={s.tlStrek} style={{ top: -6, bottom: -6, left: `${naa}%`, background: strekFarge }} />
            {visNaaMerke ? <span className={`${s.naa} ${s.tlNaa}`} style={{ left: `${naa}%` }}>Nå</span> : null}
          </>
        ) : null}
      </div>
      <div className={s.mndSkala} style={{ gridTemplateColumns: `repeat(${mnd.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {mnd.map((m, i) => <span key={`${m}-${i}`}>{m}</span>)}
      </div>
    </div>
  );
}
