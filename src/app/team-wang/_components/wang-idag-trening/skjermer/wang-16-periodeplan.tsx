import Link from "next/link";

import { hentAarsgrunnlag, type WangPeriode } from "@/app/team-wang/_data/wang-idag-trening-data";
import { OMRADE_NAVN, ddmm, ddmmaaaa, forsteVerdi, leggTilDager, osloIso, periodeVolum, timer } from "@/app/team-wang/_data/wang-trening-beregning";
import { Periodemerke, Sidehode, it as s, lastTrygt, periodeInfo } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { PeriodeTidslinje } from "@/app/team-wang/_components/wang-idag-trening/periode-tidslinje";
import { WangDemoMerknad, WangFeil, WangKnapp, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { periode?: string | string[] };

const TRENINGSPERIODER = ["GRUNN", "SPESIAL", "TURNERING", "EVALUERING", "RESTITUSJON", "FERIE"];

/** WANG-16 Periodeplan. Fasit: «WANG Golf Batch 6.dc.html» #periode (6cfa623c). Rute: /team-wang/trening/periode */
export async function WangPeriodeplan({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const last = await lastTrygt(() => hentAarsgrunnlag(gruppe.id, idag));

  if (!last.ok) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={`WANG-16 · ${gruppe.name}`} tittel="Periodeplan" />
        <WangFeil tittel="Vi fikk ikke hentet periodeplanen." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-16")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const g = last.data;
  const meta = `WANG-16 · ${gruppe.name} · Skoleåret ${g.fra.slice(0, 4)}/${g.til.slice(2, 4)}`;
  const perioder = g.perioder.filter((p) => TRENINGSPERIODER.includes(p.fase));

  if (perioder.length === 0) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={meta} tittel="Periodeplan" />
        {erDemo ? <WangDemoMerknad /> : null}
        <section className={s.kort}>
          <WangTom tittel="Ingen perioder ennå." tekst={`${gruppe.name} har ingen perioder for skoleåret. Perioder legges inn i gruppas årsplan i AgencyOS.`} />
        </section>
      </div>
    );
  }

  const naaP = perioder.find((p) => idag >= p.fra && idag <= p.til) ?? null;
  const valgt = perioder.find((p) => p.id === forsteVerdi(sok.periode)) ?? naaP ?? perioder[0];
  const href = (p: WangPeriode) => wangHref("WANG-16", {}, { periode: p.id });
  const sisteTil = perioder.reduce((m, p) => (p.til > m ? p.til : m), perioder[0].til);
  const ledig = sisteTil < g.til ? `Ikke planlagt: ${ddmm(leggTilDager(sisteTil, 1))}–${ddmmaaaa(g.til)}` : "Hele skoleåret har perioder";

  const v = periodeVolum(valgt, g.okter, g.elever.length, naa);
  const maks = Math.max(1, ...v.omr.map((o) => o.planlagtMin));
  const nr = perioder.indexOf(valgt) + 1;

  return (
    <div className={s.stabel16} style={{ gap: 20 }}>
      <Sidehode meta={meta} tittel="Periodeplan" />
      {erDemo ? <WangDemoMerknad /> : null}

      <section className={s.kort} style={{ padding: "20px 24px", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
          <h2 className={s.h2}>Årsoversikt</h2>
          <span className={s.tall} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{ddmmaaaa(g.fra)}–{ddmmaaaa(g.til)} · trykk på en periode</span>
        </div>
        <div className={s.kunDesk} style={{ gap: 6 }}>
          <PeriodeTidslinje
            fra={g.fra}
            til={g.til}
            idag={idag}
            hoyde={64}
            naaFarge="rosa"
            visNaaMerke={false}
            blokker={perioder.map((p) => {
              const info = periodeInfo(p.fase);
              return { key: p.id, type: info.kode, fra: p.fra, til: p.til, kort: info.kort, aria: `${info.navn} · ${ddmmaaaa(p.fra)}–${ddmmaaaa(p.til)}`, topp: 8, hoyde: 48, href: href(p), valgt: p.id === valgt.id };
            })}
          />
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            <span aria-hidden="true" style={{ width: 2, height: 12, background: "var(--wtr-pink)" }} />I dag {ddmmaaaa(idag)} · {ledig}
          </p>
        </div>
        <div className={s.kunMobil} style={{ borderTop: "1px solid var(--wtr-grey-line)" }}>
          {perioder.map((p) => (
            <Link key={p.id} href={href(p)} scroll={false} className={s.prow} style={{ padding: "10px 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }} aria-current={p.id === valgt.id ? "true" : undefined}>
              <Periodemerke fase={p.fase} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{periodeInfo(p.fase).navn}</span>
              <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(p.fra)}–{ddmm(p.til)}</span>
            </Link>
          ))}
          <p style={{ margin: 0, padding: "10px 0", borderTop: "1px solid var(--wtr-grey-line)", fontSize: 14, color: "var(--wtr-text-muted)" }}>{ledig}</p>
        </div>
      </section>

      <section className={s.kort} style={{ padding: "22px 24px", display: "grid", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", alignItems: "center" }}>
          <Periodemerke fase={valgt.fase} />
          <span className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>Periode {nr} av {perioder.length} · {periodeInfo(valgt.fase).navn}</span>
        </div>
        <h2 className={s.tall} style={{ margin: 0, fontWeight: 300, fontSize: 30, letterSpacing: "-0.015em", color: "var(--wtr-blue)", lineHeight: 1.2 }}>
          {ddmmaaaa(valgt.fra)}–{ddmmaaaa(valgt.til)} · {v.uker} uker
        </h2>
        <p style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 16px" }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className={s.meta}>Planlagt</span>
            <span className={s.tall} style={{ fontSize: 22, fontWeight: 700, color: "var(--wtr-blue)" }}>{v.sum.planlagtMin ? `${timer(v.sum.planlagtMin / v.n)} t` : "—"}</span>
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className={s.meta}>Ført</span>
            <span className={s.tall} style={{ fontSize: 44, fontWeight: 800, color: "var(--wtr-blue)", lineHeight: 1 }}>{v.sum.planlagtMin ? `${timer(v.sum.gjennomfortMin / v.n)} t` : "—"}</span>
          </span>
        </p>
        <p className={s.meta} style={{ margin: 0, fontSize: 12.5 }}>
          Ukevolum i planen: {valgt.ukevolMin !== null ? `${timer(valgt.ukevolMin)}–${timer(valgt.ukevolMaks ?? valgt.ukevolMin)} t per uke` : "—"} · snitt per elev
        </p>
      </section>

      <div className={s.split}>
        <section className={`${s.kort} ${s.kortSkjult}`}>
          <div style={{ padding: "18px 20px 12px" }}><h2 className={s.h2}>Mål for perioden</h2></div>
          {valgt.fokus ? (
            <div style={{ borderTop: "1px solid var(--wtr-grey-line)", padding: "14px 20px", display: "grid", gap: 4 }}>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45, color: "var(--wtr-blue)" }}>{valgt.fokus}</p>
              <p className={s.meta} style={{ margin: 0, fontSize: 12 }}>Fra periodens fokus i årsplanen</p>
            </div>
          ) : (
            <p style={{ margin: 0, padding: "14px 20px", borderTop: "1px solid var(--wtr-grey-line)", fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen mål skrevet for perioden.</p>
          )}
        </section>

        <section className={s.kort} style={{ padding: "18px 20px", display: "grid", gap: 12 }}>
          <div>
            <h2 className={s.h2}>Volum per område</h2>
            <p className={s.meta} style={{ margin: "4px 0 0", fontSize: 12.5 }}>Planlagt er en beskrivelse, ikke fasit · snitt per elev</p>
          </div>
          {v.sum.planlagtMin === 0 ? <p style={{ margin: 0, fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen økter lagt inn i perioden ennå.</p> : null}
          {v.sum.planlagtMin > 0
            ? v.omr.map((o) => (
                <div key={o.omrade} style={{ display: "grid", gap: 6, paddingTop: 10, borderTop: "1px solid var(--wtr-grey-line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 700, color: "var(--wtr-blue)" }}>
                      {o.omrade} <span style={{ fontWeight: 500, color: "var(--wtr-text-muted)" }}>· {OMRADE_NAVN[o.omrade]}</span>
                    </span>
                    <span className={s.tall} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>
                      {timer(o.planlagtMin / v.n)} t planlagt · <strong>{timer(o.gjennomfortMin / v.n)} t</strong> ført
                    </span>
                  </div>
                  <div className={s.vbar} aria-hidden="true">
                    <span className={s.vbarPlan} style={{ width: `${(o.planlagtMin / maks) * 100}%` }} />
                    <span className={s.vbarGjort} style={{ width: `${(o.gjennomfortMin / maks) * 100}%` }} />
                  </div>
                </div>
              ))
            : null}
          <p style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 999, background: "var(--wtr-status-planned-bg)", boxShadow: "inset 0 0 0 1px var(--wtr-text-disabled)" }} />Planlagt</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 999, background: "var(--wtr-blue)" }} />Ført</span>
          </p>
        </section>
      </div>
      <p className={s.fot}>Periodene, typen og fokuset endres i gruppas årsplan i AgencyOS. Planlagt tid er publiserte økter i perioden, ført tid er økter elevene har registrert i PlayerHQ.</p>
    </div>
  );
}
