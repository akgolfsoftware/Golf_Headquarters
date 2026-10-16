/**
 * PH-16 Stats i nytt design (designbrevet 13.10.2026): fire deler på én flate, ett stort tall per del.
 * Fasit: docs/design-system/utkast-playerhq/stats.html. Stil: src/styles/playerhq-ny-statshub.css.
 * «Per område» åpner dybden (PH16Stats med ?del=sg). «Alle runder» åpner Resultater, «Mot planen» Trening (PH-17)
 * og «Alle tester» Tester (PH-14), alle fra pakke 6 (stats-dybde.html).
 *
 * Avvik:
 *   - Periodevalget (Siste 5 runder · Siste 20 · Sesong) er ikke med: snittet regnes alltid av siste 10 runder.
 *   - Kategori og «snitt under X gir Kategori B» vises ikke: A–K-nivåtallene er ikke vedtatt (§Åpent).
 *   - Strokes Gained sammenlignes med PGA Tour, ikke neste kategori: kategorireferansen finnes ikke ennå.
 *     Setningen om hvilken økt som trener det svakeste området vises ikke.
 *   - Testene vises fra testbatteriet når det er koblet til Stats; i dag er lista tom og delen viser «—».
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-16.
 */
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import { formaterTall, formaterVarighet } from "@/lib/format-tall";
import { formaterDesimal, formaterSg, MIN_RUNDER_FOR_KONKLUSJON, type PH16StatsData } from "@/lib/portal-analyse/ph16-stats-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-statshub.css";

export type PH16Trening = {
  gjortMin: number; planMin: number; pct: number | null;
  akser: { akse: "fys" | "tek" | "slag" | "spill" | "turn"; gjortMin: number }[];
  periode: string;
};

const GRUPPE: Record<string, { navn: string; kode: string; sikker: number }> = {
  tee: { navn: "Utslag", kode: "OTT", sikker: 12 },
  innspill: { navn: "Innspill", kode: "APP", sikker: 12 },
  naer: { navn: "Nærspill", kode: "ARG", sikker: 24 },
  putt: { navn: "Putting", kode: "PUTT", sikker: 24 },
};
const AKSE_KODE = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" } as const;

function Del({ tittel, lenke, href, children }: { tittel: string; lenke: string; href: string; children: React.ReactNode }) {
  return <section className="del" aria-label={tittel}>
    <div className="del-topp"><h2>{tittel}</h2><Link href={href}>{lenke}<Ikon icon={ArrowRight} size={16} name="arrow-right" /></Link></div>
    {children}
  </section>;
}

function Linje({ verdier }: { verdier: number[] }) {
  if (verdier.length < 2) return null;
  const min = Math.min(...verdier), maks = Math.max(...verdier), spenn = maks - min || 1;
  const pkt = verdier.map((v, i) => `${Math.round(i / (verdier.length - 1) * 300)},${Math.round(8 + (v - min) / spenn * 64)}`);
  return <svg className="graf" viewBox="0 0 300 80" preserveAspectRatio="none" role="img" aria-label={`Score per runde, fra ${verdier[0]} til ${verdier[verdier.length - 1]}`}>
    <polyline points={pkt.join(" ")} fill="none" stroke="var(--phn-g900)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function PH16StatsOversikt({ data, trening }: { data: PH16StatsData; trening: PH16Trening | null }) {
  const s = data.spiller;
  const endring = s.snittBrutto != null && s.forrigeSnitt != null ? Math.round((s.forrigeSnitt - s.snittBrutto) * 10) / 10 : null;

  const grupper = data.sg.map((g) => {
    const rader = g.rows.filter((r) => r.pga != null);
    const n = Math.max(0, ...g.rows.map((r) => r.n));
    return { g: g.g, verdi: rader.length ? Math.round(rader.reduce((a, r) => a + (r.pga ?? 0), 0) * 10) / 10 : null, n };
  });
  const medVerdi = grupper.filter((g) => g.verdi != null);
  const total = medVerdi.length ? Math.round(medVerdi.reduce((a, g) => a + (g.verdi ?? 0), 0) * 10) / 10 : null;
  const skala = Math.max(1, ...medVerdi.map((g) => Math.abs(g.verdi ?? 0)));
  const svakest = [...medVerdi].sort((a, b) => (a.verdi ?? 0) - (b.verdi ?? 0))[0];
  const sterkest = [...medVerdi].sort((a, b) => (b.verdi ?? 0) - (a.verdi ?? 0))[0];

  const tester = data.tester.filter((t) => t.hist.length > 0);
  const forsteTest = tester[0];
  const sistTest = (t: (typeof tester)[number]) => t.hist[t.hist.length - 1]!;

  return <div className="phn phn-statshub"><div className="hub">
    <div className="s-hode">
      <div><div className="phn-dato">Stats · siste {SNITT_TEKST(s.antallSnittRunder)}</div><h1 className="phn-tittel">Stats</h1></div>
      {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
      <img src="/images/playerhq/stats-topp.jpg" alt="" width={1600} height={1067} />
    </div>

    <div className="deler">
      <Del tittel="Snittscore" lenke="Alle runder" href="/portal/analysere/resultater">
        <div className="phn-hoved"><strong>{s.snittBrutto != null ? formaterDesimal(s.snittBrutto, 1) : "—"}</strong>
          {endring != null && endring !== 0 && <span className={`phn-trend ${endring > 0 ? "opp" : "ned"}`}><Ikon icon={endring > 0 ? TrendingUp : TrendingDown} size={16} name="trend" />{formaterDesimal(Math.abs(endring), 1)} {endring > 0 ? "bedre" : "dårligere"} enn de 10 før</span>}</div>
        <p className="phn-forklar">{s.antallSnittRunder < MIN_RUNDER_FOR_KONKLUSJON ? `Registrer minst ${MIN_RUNDER_FOR_KONKLUSJON} runder, så regnes snittet ut.` : `Snitt av siste ${s.antallSnittRunder} runder, brutto.`}</p>
        <Linje verdier={s.trend} />
        <p className="phn-kilde">Brutto · 18-hullsrunder · GolfBox og egne registreringer</p>
      </Del>

      <Del tittel="Strokes Gained" lenke="Per område" href="/portal/analysere?del=sg">
        <div className="phn-hoved"><strong>{total != null ? formaterSg(total) : "—"}</strong></div>
        <p className="phn-forklar">Slag per runde mot PGA Tour. <span className="estimat">Estimat</span></p>
        {medVerdi.length === 0 ? <p className="phn-forklar">Registrer runder slag for slag, så ser du hvor du vinner og taper slag.</p> :
          <div className="sg-liste">{grupper.map((g) => {
            const v = g.verdi, info = GRUPPE[g.g]!;
            const bredde = v == null ? 0 : Math.abs(v) / skala * 50;
            return <div key={g.g} className={`sgr${g === svakest && v != null && v < 0 ? " svakest" : ""}${g === sterkest && v != null && v > 0 ? " sterkest" : ""}`}>
              <span className="sgn"><b>{info.navn}</b> <small>{info.kode}</small>{v != null && g.n < info.sikker && <span className="forelopig">Foreløpig</span>}</span>
              <span className="sgbar" aria-hidden><i className="null" /><span style={{ left: `${v != null && v < 0 ? 50 - bredde : 50}%`, width: `${bredde}%` }} /></span>
              <span className="sgv">{v == null ? "—" : formaterSg(v)}</span>
            </div>;
          })}</div>}
        {svakest && svakest.verdi != null && svakest.verdi < 0 && <div className="uthev"><span><b>{GRUPPE[svakest.g]!.navn} taper mest:</b> {formaterDesimal(Math.abs(svakest.verdi), 1)} slag per runde.</span></div>}
        <p className="phn-kilde">Siste 10 runder med slag for slag · nærspill og putting er sikre fra 24 runder</p>
      </Del>

      <Del tittel="Trening" lenke="Mot planen" href="/portal/analysere?del=tren">
        <div className="phn-hoved"><strong>{trening ? <StorTid min={trening.gjortMin} /> : "—"}</strong>{trening?.pct != null && <span className="phn-trend">{trening.pct} % av plan</span>}</div>
        <p className="phn-forklar">{trening ? `Siste 4 uker, av ${formaterVarighet(trening.planMin)} planlagt.` : "Ingen planlagte økter de siste fire ukene."}</p>
        {trening && trening.gjortMin > 0 && <>
          <div className="phn-fordeling" aria-hidden>{trening.akser.filter((a) => a.gjortMin > 0).map((a) => <i key={a.akse} className={`akse-${a.akse}`} style={{ width: `${a.gjortMin / trening.gjortMin * 100}%` }} />)}</div>
          <div className="phn-lg-rad">{trening.akser.filter((a) => a.gjortMin > 0).map((a) => <span key={a.akse} className="phn-lg"><i className={`akse-${a.akse}`} />{AKSE_KODE[a.akse]} {formaterVarighet(a.gjortMin)}</span>)}</div>
        </>}
        <p className="phn-kilde">{trening ? `Gjennomført tid · ${trening.periode}` : "Øktlogg"}</p>
      </Del>

      <Del tittel="Tester" lenke="Alle tester" href="/portal/tren/tester">
        {!forsteTest ? <>
          <div className="phn-hoved"><strong>—</strong></div>
          <p className="phn-forklar">Ingen testresultater her ennå. Gjennomfør en test, så ser du utviklingen.</p>
          <div><Link className="phn-knapp sek" href="/portal/tren/tester">Gå til tester</Link></div>
        </> : <>
          <div className="test-topp"><div><strong>{forsteTest.name}</strong><span className="stor">{formaterTall(sistTest(forsteTest), 1)}<small>{forsteTest.unit}</small></span><small>{[forsteTest.dates[forsteTest.dates.length - 1], forsteTest.by].filter(Boolean).join(" · ")}</small></div></div>
          {tester.slice(1, 4).map((t) => <div key={t.id} className="tr"><div><strong>{t.name}</strong><small>{[t.dates[t.dates.length - 1], t.by].filter(Boolean).join(" · ")}</small></div><span className="tv">{formaterTall(sistTest(t), 1)} {t.unit}</span></div>)}
        </>}
        <p className="phn-kilde">Testbatteri AK Golf</p>
      </Del>
    </div>
  </div></div>;
}

/** «48<small>t 10 min</small>» som i tegningen: timene stort, resten lite. */
function StorTid({ min }: { min: number }) {
  const m = Math.max(0, Math.round(min)), t = Math.floor(m / 60), r = m % 60;
  if (t === 0) return <>{r}<small>min</small></>;
  return <>{t}<small>{r ? `t ${r} min` : "t"}</small></>;
}

function SNITT_TEKST(n: number) { return n === 1 ? "1 runde" : `${n} runder`; }
