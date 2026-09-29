import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkElevVelger } from "@/components/wang/tester-konkurranse/tk-elev-velger";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { hentElevRunder, hentElever } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, forsteParam, motParTekst, tallTekst } from "@/lib/wang/tester-konkurranse/format";
import { rundeOppsummering, sisteRunder } from "@/lib/wang/tester-konkurranse/konkurranse";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/**
 * WANG-27 Golfstatistikk — én elevs siste ti runder, brutto. Tegning: «WANG
 * Golf Batch 9.dc.html» #statistikk. Ekte data: turneringsrunder fra
 * turneringsbasen (GolfBox via pipelines). Egne treningsrunder tas ikke med.
 */
export default async function WangStatistikkSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const onsket = forsteParam((await searchParams).elev);
  const elever = await hentElever(gruppe.id);
  const elev = elever.find((e) => e.id === onsket) ?? elever[0] ?? null;

  if (!elev) {
    return (
      <WangSide>
        <WangSidehode skjermId="WANG-27" tittel="Golfstatistikk" />
        {erDemo ? <WangDemoMerknad /> : null}
        <WangKort><WangTom tittel="Ingen elever i gruppa ennå" tekst="Statistikken vises her når elevene er lagt inn i WANG-gruppa." /></WangKort>
      </WangSide>
    );
  }

  const { koblet, runder: alle, hentet } = await hentElevRunder(elev);
  const runder = sisteRunder(alle);
  const { snitt, beste } = rundeOppsummering(runder);
  const maks = Math.max(0, ...runder.map((r) => r.brutto));
  const min = runder.length ? Math.min(...runder.map((r) => r.brutto)) : 0;
  // Som tegningen: søylene starter fire slag under beste runde.
  const bunn = Math.max(0, min - 4);
  const fornavn = elev.navn.split(" ")[0];

  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-27"
        undertittel={`${elev.navn}${elev.klasse ? ` · ${elev.klasse}` : ""} · ${gruppe.name}`}
        tittel="Golfstatistikk"
        handling={
          <div className={s.velgerRad}>
            <TkElevVelger elever={elever} valgt={elev.id} basisHref={wangHref("WANG-27", {}, { elev: elev.id })} />
            <Link href={elevprofilHref(elev.id, "stats")} className={s.radLenke}><ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />Elevprofilen · WANG-44</Link>
          </div>
        }
      />
      {erDemo ? <WangDemoMerknad /> : null}

      {runder.length === 0 ? (
        <WangKort>
          <WangTom
            tittel="Ingen runder å vise"
            tekst={koblet ? `Turneringsbasen har ingen 18-hullsrunder med brutto score for ${fornavn} ennå.` : `${fornavn} er ikke koblet til turneringsbasen ennå, så rundene kan ikke hentes.`}
          />
        </WangKort>
      ) : (
        <div className={s.stabel}>
          <section className={s.kort}>
            <div className={s.kortHode}>
              <h2 className={s.h2}>Siste {runder.length} runder · brutto</h2>
              <span className={s.meta}>{datoTekst(runder[0].dato)}–{datoTekst(runder.at(-1)!.dato)}</span>
            </div>
            <div className={s.cnt} style={{ borderTop: "1px solid var(--wtr-border-subtle)" }}>
              <div className={s.cntCelle} style={{ padding: "14px 16px" }}>
                <span className={s.cntEtikett}>Snitt</span>
                <span className={s.tall} style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: "var(--wtr-blue)" }}>{tallTekst(snitt, 1)}</span>
              </div>
              <div className={s.cntCelle} style={{ padding: "14px 16px" }}>
                <span className={s.cntEtikett}>Beste</span>
                <span className={s.cntTall}>{beste?.brutto ?? "—"}</span>
                <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{beste ? `${datoTekst(beste.dato)} · ${beste.turnering}` : "—"}</span>
              </div>
              <div className={s.cntCelle} style={{ padding: "14px 16px" }}>
                <span className={s.cntEtikett}>Antall</span>
                <span className={s.cntTall}>{runder.length}</span>
                <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{alle.length} runder totalt i basen</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--wtr-border-subtle)", padding: "18px 16px 12px" }}>
              <div className={s.chart} role="img" aria-label={`Brutto per runde, eldst først: ${runder.map((r) => `${datoTekst(r.dato)} ${r.brutto}`).join(", ")}`}>
                {runder.map((r, i) => (
                  <div key={i} className={s.chartSoyle}>
                    <span className={s.tall} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--wtr-blue)" }}>{r.brutto}</span>
                    <span className={`${s.chartFyll} ${beste && r === beste ? s.chartBeste : ""}`} style={{ height: `${maks > bunn ? Math.max(4, Math.round(((r.brutto - bunn) / (maks - bunn)) * 100)) : 100}%` }} />
                  </div>
                ))}
              </div>
              <div className={s.chartEtiketter} aria-hidden="true">
                {runder.map((r, i) => <span key={i} className={s.tall} style={{ textAlign: "center", fontSize: 10.5, color: "var(--wtr-text-muted)", overflow: "hidden", whiteSpace: "nowrap" }}>{datoTekst(r.dato).slice(0, 5)}</span>)}
              </div>
              <p className={s.fot} style={{ margin: "8px 4px 0", fontSize: 12 }}>Brutto score per runde, eldst til venstre. Den lyse søylen er beste runde.</p>
            </div>
          </section>

          <section className={s.kort}>
            <div style={{ padding: "14px 20px" }}><h2 className={s.h2}>Runde for runde</h2></div>
            <div className={`${s.statRad} ${s.thead} ${s.kunDesk}`}>
              <span>Dato</span><span>Turnering eller bane</span><span className={s.hoyre}>Score</span><span className={s.hoyre}>Til par</span>
            </div>
            {runder.toReversed().map((r, i) => (
              <div key={i} className={s.statRad}>
                <span className={`${s.tall} ${s.helMobil}`} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{datoTekst(r.dato)}</span>
                <span style={{ display: "grid", gap: 1 }}>
                  <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{r.turnering}</span>
                  <span style={{ fontSize: 13.5, color: "var(--wtr-text-muted)" }}>{r.sted ?? "—"}</span>
                </span>
                <span className={`${s.tall} ${s.hoyre}`} style={{ fontSize: 16, fontWeight: 700, color: "var(--wtr-blue)" }}>{r.brutto}</span>
                <span className={`${s.tall} ${s.hoyre}`} style={{ fontSize: 13.5, fontWeight: 500, color: "var(--wtr-blue)" }}>{motParTekst(r.motPar)}</span>
              </div>
            ))}
            <p className={s.fot} style={{ padding: "12px 20px 14px", borderTop: "1px solid var(--wtr-border-subtle)", display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
              <span>GolfBox · {hentet ? `hentet ${datoTekst(hentet)}` : "hentetidspunkt mangler"}</span>
              <span>Alle score er brutto.</span>
              <span>Treneren ser alle elevene i gruppa.</span>
            </p>
          </section>
        </div>
      )}
    </WangSide>
  );
}
