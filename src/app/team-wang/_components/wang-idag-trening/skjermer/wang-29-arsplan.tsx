import type { ReactNode } from "react";
import Link from "next/link";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { ferier, hendelserMellom, hentAarsgrunnlag, type WangPeriode } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  OMRADER,
  ddmm,
  ddmmaaaa,
  dagerMellom,
  forsteVerdi,
  isoUke,
  osloIso,
  periodeVolum,
  timer,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { NaaMerke, Omradeprikk, Periodemerke, Sidehode, it as s, lastTrygt, periodeInfo } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { PeriodeTidslinje, type Tidslinjeblokk } from "@/app/team-wang/_components/wang-idag-trening/periode-tidslinje";
import { WangDemoMerknad, WangFeil, WangKnapp, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { periode?: string | string[] };

const erTest = (tittel: string) => /^test|testkonkurranse|fysiske tester/i.test(tittel.replace(/^heldag:\s*/i, ""));

/** WANG-29 Årsplan og periode. Fasit: «WANG Golf Batch 10.dc.html» #trening (6cfa623c). Rute: /team-wang/trening/arsplan */
export async function WangArsplan({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const last = await lastTrygt(() => hentAarsgrunnlag(gruppe.id, idag));
  const meta = (fra?: string, til?: string) => `WANG-29 · ${gruppe.name}${fra && til ? ` · ${fra.slice(0, 4)}/${til.slice(2, 4)}` : ""}`;

  if (!last.ok) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={meta()} tittel="Årsplan og periode" />
        <WangFeil tittel="Vi fikk ikke hentet årsplanen." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-29")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const g = last.data;
  const perioder = g.perioder.filter((p) => ["GRUNN", "SPESIAL", "TURNERING", "EVALUERING", "RESTITUSJON"].includes(p.fase));
  const testuker = g.perioder.filter((p) => p.fase === "TESTUKE");
  const ferieListe = ferier(g.skoledager);
  const tester = hendelserMellom(g.hendelser, g.fra, g.til).filter((h) => !h.ukentlig && erTest(h.tittel) && !erTurneringstittel(h.tittel));

  if (perioder.length === 0) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={meta()} tittel="Årsplan og periode" />
        {erDemo ? <WangDemoMerknad /> : null}
        <section className={s.kort}>
          <WangTom tittel="Ingen årsplan ennå." tekst={`${gruppe.name} har ingen perioder lagt inn for skoleåret. Periodene legges inn i Periodeplan.`} handling={<WangKnapp href={wangHref("WANG-16")}>Åpne periodeplan</WangKnapp>} />
        </section>
      </div>
    );
  }

  const naaP = perioder.find((p) => idag >= p.fra && idag <= p.til) ?? null;
  const valgtId = forsteVerdi(sok.periode);
  const valgt = perioder.find((p) => p.id === valgtId) ?? naaP ?? perioder[0];
  const href = (p: WangPeriode) => wangHref("WANG-29", {}, { periode: p.id });

  const blokker: Tidslinjeblokk[] = [
    ...perioder.map((p, i) => {
      const info = periodeInfo(p.fase);
      const bred = dagerMellom(p.fra, p.til) > 30;
      return { key: p.id, type: info.kode, fra: p.fra, til: p.til, kort: bred ? `P${i + 1} ${info.kort}` : `P${i + 1}`, aria: `Periode ${i + 1} · ${info.navn} · ${ddmmaaaa(p.fra)}–${ddmmaaaa(p.til)}`, topp: 8, hoyde: 36, href: href(p), valgt: p.id === valgt.id };
    }),
    ...ferieListe.map((f) => ({ key: `f-${f.fra}`, type: "ANNET" as const, fra: f.fra, til: f.til, kort: dagerMellom(f.fra, f.til) > 12 ? f.navn : "", aria: `${f.navn} · ${ddmm(f.fra)}–${ddmm(f.til)}`, topp: 52, hoyde: 20 })),
    ...testuker.map((t) => ({ key: `t-${t.id}`, type: "ANNET" as const, fra: t.fra, til: t.til, kort: "", aria: `Testuke · ${ddmm(t.fra)}–${ddmm(t.til)}`, topp: 78, hoyde: 18 })),
  ];

  type Rad = { sort: string; key: string; node: ReactNode };
  const rader: Rad[] = [
    ...perioder.map((p, i) => {
      const v = periodeVolum(p, g.okter, g.elever.length, naa);
      const tot = v.sum.planlagtMin;
      const pa = p.id === valgt.id;
      const timerTekst = tot > 0 ? `Planlagt ${timer(tot / v.n)} t · ≈ ${timer(tot / v.n / v.uker)} t per uke` : p.ukevolMin !== null ? `Planlagt ${timer(p.ukevolMin)}–${timer(p.ukevolMaks ?? p.ukevolMin)} t per uke · ingen økter lagt inn ennå` : "Ingen økter lagt inn ennå";
      return {
        sort: p.fra,
        key: p.id,
        node: (
          <Link href={href(p)} scroll={false} className={s.prow} aria-current={pa ? "true" : undefined}>
            <span style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", alignItems: "center" }}>
              <Periodemerke fase={p.fase} />
              <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14.5, fontWeight: 500, color: "var(--wtr-blue)" }}>Periode {i + 1} av {perioder.length}</span>
              {p === naaP ? <NaaMerke /> : null}
            </span>
            <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(p.fra)}–{ddmmaaaa(p.til)} · {v.uker} uker</span>
            <span style={{ display: "grid", gap: 6 }}>
              {p.fokus ? <span style={{ fontSize: 15, lineHeight: 1.45, color: "var(--wtr-blue)" }}>{p.fokus}</span> : null}
              <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{timerTekst}</span>
              {tot > 0 ? (
                <>
                  <span className={s.pbar} aria-hidden="true">
                    {v.omr.map((o) => <span key={o.omrade} className={s[`kal-${o.omrade}`]} style={{ width: `${(o.planlagtMin / tot) * 100}%` }} />)}
                  </span>
                  <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{v.omr.map((o) => `${o.omrade} ${Math.round((o.planlagtMin / tot) * 100)} %`).join(" · ")}</span>
                </>
              ) : null}
            </span>
          </Link>
        ),
      };
    }),
    ...ferieListe.map((f) => ({
      sort: f.fra,
      key: `f-${f.fra}`,
      node: (
        <div className={s.prow}>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", alignItems: "center" }}>
            <span className={`${s.ty} ${s["ty-ANNET"]}`}>Ferie</span>
            <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14.5, fontWeight: 500, color: "var(--wtr-blue)" }}>{f.navn}</span>
            {idag >= f.fra && idag <= f.til ? <NaaMerke /> : null}
          </span>
          <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{f.fra === f.til ? ddmmaaaa(f.fra) : `${ddmm(f.fra)}–${ddmmaaaa(f.til)}`}</span>
        </div>
      ),
    })),
    ...testuker.map((t) => ({
      sort: t.fra,
      key: `t-${t.id}`,
      node: (
        <div className={s.prow}>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", alignItems: "center" }}>
            <span className={`${s.ty} ${s["ty-ANNET"]}`}>Testuke</span>
            <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14.5, fontWeight: 500, color: "var(--wtr-blue)" }}>Testuke</span>
          </span>
          <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(t.fra)}–{ddmmaaaa(t.til)} · uke {isoUke(t.fra)}</span>
        </div>
      ),
    })),
  ].sort((a, b) => (a.sort < b.sort ? -1 : 1));

  // ---- Detaljpanelet ----
  const v = periodeVolum(valgt, g.okter, g.elever.length, naa);
  const nr = perioder.indexOf(valgt) + 1;
  const status =
    idag < valgt.fra
      ? `Starter om ${dagerMellom(idag, valgt.fra)} dager`
      : idag > valgt.til
        ? "Ferdig"
        : `Pågår · uke ${Math.floor(dagerMellom(valgt.fra, idag) / 7) + 1} av ${v.uker}`;
  const testerI = tester.filter((t) => t.dato >= valgt.fra && t.dato <= valgt.til);
  const maks = Math.max(1, ...v.omr.map((o) => o.planlagtMin));

  return (
    <div className={s.stabel16} style={{ gap: 20 }}>
      <Sidehode meta={meta(g.fra, g.til)} tittel="Årsplan og periode" />
      {erDemo ? <WangDemoMerknad /> : null}
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "var(--wtr-blue)", maxWidth: 760 }}>Dette er lesevisningen av årsplanen. Periodene endres i Periodeplan (WANG-16), ukene i Månedsplan (WANG-17).</p>

      <section className={`${s.kort} ${s.kunDesk}`} style={{ padding: "18px 20px", gap: 8 }}>
        <PeriodeTidslinje fra={g.fra} til={g.til} idag={idag} blokker={blokker} hoyde={104} />
        <p className={s.meta} style={{ margin: 0, fontSize: 12 }}>Øverst perioder, i midten ferier, nederst testuker. Trykk på en periode for detaljer.</p>
      </section>

      <div className={s.split8}>
        <section className={`${s.kort} ${s.kortSkjult}`}>
          <div style={{ padding: "14px 20px" }}><h2 className={s.h2}>Skoleåret</h2></div>
          {rader.map((r) => <div key={r.key}>{r.node}</div>)}
          <p style={{ margin: 0, padding: "12px 20px", borderTop: "1px solid var(--wtr-grey-line)", display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            {OMRADER.map((o) => <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Omradeprikk omrade={o} palett="kal" />{o}</span>)}
          </p>
        </section>

        <section className={`${s.kort} ${s.kortSkjult}`} aria-label="Valgt periode">
          <div style={{ padding: "18px 20px", display: "grid", gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Periodemerke fase={valgt.fase} />
              <span className={s.tall} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>Periode {nr} av {perioder.length} · {periodeInfo(valgt.fase).navn}</span>
            </div>
            <h2 className={s.tall} style={{ margin: 0, fontWeight: 300, fontSize: 26, letterSpacing: "-0.015em", color: "var(--wtr-blue)" }}>{ddmm(valgt.fra)}–{ddmmaaaa(valgt.til)}</h2>
            <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontSize: 15, fontWeight: 500, color: "var(--wtr-blue)" }}>{status}</p>
          </div>
          <div className={s.seksjon}>
            <span className={s.seksjonTittel}>Mål for perioden</span>
            {valgt.fokus ? <span className={s.brodtekst}>{valgt.fokus}</span> : <span style={{ fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen mål skrevet ennå.</span>}
          </div>
          <div className={s.seksjon}>
            <span className={s.seksjonTittel}>Tester i perioden</span>
            {testerI.length ? (
              testerI.map((t) => (
                <span key={`${t.id}-${t.dato}`} style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 15, color: "var(--wtr-blue)" }}>
                  <span className={s.tall} style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{ddmm(t.dato)}</span>
                  {t.tittel}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen testdager i perioden.</span>
            )}
          </div>
          <div className={s.seksjon} style={{ gap: 10, paddingBottom: 18 }}>
            <span className={s.seksjonTittel}>Planlagt og gjennomført per område · snitt per elev</span>
            {v.sum.planlagtMin === 0 ? <span style={{ fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen økter lagt inn i perioden ennå.</span> : null}
            {v.sum.planlagtMin > 0
              ? v.omr.map((o) => (
                  <div key={o.omrade} style={{ display: "grid", gap: 4 }}>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 700, color: "var(--wtr-blue)" }}><Omradeprikk omrade={o.omrade} palett="kal" />{o.omrade}</span>
                      <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-blue)" }}>{timer(o.gjennomfortMin / v.n)} av {timer(o.planlagtMin / v.n)} t</span>
                    </span>
                    <span className={`${s.vbar} ${s[`kal-${o.omrade}`]}`} aria-hidden="true">
                      <span className={s.vbarPlan} style={{ width: `${(o.planlagtMin / maks) * 100}%` }} />
                      <span className={s.vbarGjort} style={{ width: `${(o.gjennomfortMin / maks) * 100}%` }} />
                    </span>
                  </div>
                ))
              : null}
          </div>
          <p style={{ margin: 0, padding: "12px 20px 14px", borderTop: "1px solid var(--wtr-grey-line)", fontFamily: "var(--wtr-font-display)", fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            Planlagt er publiserte økter. Gjennomført er økter eleven har registrert i PlayerHQ.
          </p>
        </section>
      </div>
    </div>
  );
}
