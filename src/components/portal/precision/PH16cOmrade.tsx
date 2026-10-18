/**
 * Ett område i nytt design (PlayerHQ pakke 13, Stats resten, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «omrade». Stil: playerhq-ny-statsresten-omrade.css.
 * To utgaver: et SG-område (Utslag, Innspill, Nærspill, Putting) og en akse (FYS, TEK, SLAG, SPILL, TURN).
 * Ett stort tall, utviklingen og hva som trekker ned. Tabellene og «Snitt A1» fra den gamle siden er borte.
 *
 * Avvik:
 *   - SG sammenlignes med PGA Tour, ikke Kategori B: referansen per A–K-kategori er ikke satt (som Stats). Merket «Estimat».
 *   - «Per avstand» viser antall runder i snittet, ikke slag per runde fra avstanden (lagres ikke per runde).
 *     Nærhet til hullet («9 m mot 7 m») lagres ikke og står ikke i teksten.
 *   - Trening på et SG-område er gjennomførte Workbench-økter merket med treningsområdet, siste fire uker.
 *     Andelen av SLAG-tiden og «dagens økt» vises ikke.
 *   - Akse: «fordelt» er planlagte minutter i Plan med passert sluttid (perioden fordeler ikke timer per akse ennå,
 *     jf. §PLANNIVÅENE HENGER SAMMEN). Periodenavnet («Spesialperiode til uke 43») vises ikke.
 *     Ukene er fire bolker à sju dager bakover fra i dag, navngitt etter ISO-uka til siste dag.
 *   - «Øvelser for …» åpner Øvelsesbanken uten forhåndsvalgt filter (banken tar ikke filter i adressen).
 *     «Be coachen om mer fokus her» bruker den samme meldingslenken som før, ikke coachens navn.
 *   - Valget «SG-område / Akse» øverst i utkastet er bare for å vise begge utgavene; i appen velger adressen utgaven.
 */
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterVarighet } from "@/lib/format-tall";
import { formaterDesimal, formaterSg } from "@/lib/portal-analyse/ph16-stats-data";
import { AKSE_INFO, SG_GRUPPE_INFO, type MaanedPunkt, type OmradeAkseData, type OmradeSgData } from "@/lib/portal-analyse/omrade-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten-omrade.css";

export type PH16cOmradeData =
  | { type: "sg"; sg: OmradeSgData; fokusHref: string }
  | { type: "akse"; akse: OmradeAkseData };

export function PH16cOmrade({ data }: { data: PH16cOmradeData }) {
  return data.type === "sg" ? <SgOmrade d={data.sg} fokusHref={data.fokusHref} /> : <AkseOmrade d={data.akse} />;
}

/** «6<small>t 40 min</small>»: timene stort, resten lite. */
function StorTid({ min }: { min: number }) {
  const m = Math.max(0, Math.round(min)), t = Math.floor(m / 60), r = m % 60;
  if (t === 0) return <>{r}<small>min</small></>;
  return <>{t}<small>{r ? `t ${r} min` : "t"}</small></>;
}

function Topp({ dato, tittel }: { dato: string; tittel: string }) {
  return (
    <div className="phn-om-topp">
      <div><div className="phn-dato">{dato}</div><h1 className="phn-tittel">{tittel}</h1></div>
    </div>
  );
}

/* ───────────── SG-område ───────────── */

function SgOmrade({ d, fokusHref }: { d: OmradeSgData; fokusHref: string }) {
  const info = SG_GRUPPE_INFO[d.gruppe];
  const navnLite = info.navn.toLowerCase();
  const svakRad = d.rader.find((r) => r.id === d.svakestRad);
  const skala = Math.max(0.3, ...d.rader.map((r) => Math.abs(r.v ?? 0)));
  const periode = d.grunnlag.fra && d.grunnlag.til ? `${d.grunnlag.antall} runder slag for slag` : null;

  let tekst: string;
  if (d.verdi == null) tekst = "Registrer minst 4 runder slag for slag, så ser du hva du vinner og taper her.";
  else if (d.taperMest) tekst = `${info.navn} er der du taper mest.${svakRad ? ` Mest ${d.gruppe === "naer" ? "på" : "fra"} ${svakRad.navn.toLowerCase()}.` : ""}`;
  else if (d.verdi < 0) tekst = `${info.navn} koster deg ${formaterDesimal(Math.abs(d.verdi), 1)} slag per runde.${svakRad ? ` Mest ${d.gruppe === "naer" ? "på" : "fra"} ${svakRad.navn.toLowerCase()}.` : ""}`;
  else tekst = `${info.navn} gir deg ${formaterDesimal(d.verdi, 1)} slag per runde.`;

  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere?del=sg" tekst="Stats" />
      <Topp dato="Strokes Gained · område" tittel={info.navn} />
      <div className="phn-to-kol">
        <div className="phn-om-kol">
          <section className="phn-fylt slag" aria-label={`${info.navn}, slag per runde`}>
            <span className="phn-om-fylt-etikett">Slag per runde mot PGA Tour <span className="phn-om-merke">Estimat</span>{d.forelopig && <span className="phn-om-merke">Foreløpig</span>}</span>
            <div className="phn-hoved">
              <strong>{formaterSg(d.verdi)}</strong>
              {d.endring && d.endring.v !== 0 && (
                <span className="phn-trend">
                  {d.endring.v > 0 ? <TrendingUp className="phn-ikon" aria-hidden /> : <TrendingDown className="phn-ikon" aria-hidden />}
                  {formaterDesimal(Math.abs(d.endring.v), 1)} {d.endring.v > 0 ? "bedre" : "dårligere"} siden {d.endring.fra}
                </span>
              )}
            </div>
            <p>{tekst}</p>
          </section>

          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Utviklingen</h2><span className="phn-kilde">Snitt per måned</span></div>
            {d.maaneder.length >= 2 ? <Linje punkter={d.maaneder} /> : <p className="phn-forklar">Kurven tegnes når du har runder fra minst to måneder.</p>}
          </section>

          {d.rader.length > 1 && (
            <section className="phn-seksjon">
              <div className="phn-sek-topp"><h2>{info.rader}</h2></div>
              <div className="phn-om-sg-liste">
                {d.rader.map((r) => {
                  const bredde = r.v == null ? 0 : Math.min(Math.abs(r.v) / skala * 50, 50);
                  return (
                    <div key={r.id} className={`phn-om-sgr${r.id === d.svakestRad ? " svakest" : ""}`}>
                      <span className="phn-om-sgn"><b>{r.navn}</b><small>{r.n} {r.n === 1 ? "runde" : "runder"}</small></span>
                      <span className="phn-om-sgbar" aria-hidden><i /><span style={{ left: `${r.v != null && r.v < 0 ? 50 - bredde : 50}%`, width: `${bredde}%` }} /></span>
                      <span className="phn-om-sgv">{formaterSg(r.v)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="phn-kilde">Snitt av siste 10 runder, minst 4 · mot PGA Tour-referansen, estimat</p>
            </section>
          )}
          <p className="phn-kilde">{[periode, d.grunnlag.fra && d.grunnlag.til ? `${tmKort(d.grunnlag.fra)}–${tmKort(d.grunnlag.til)}` : "Ingen runder slag for slag ennå", "brutto"].filter(Boolean).join(" · ")}</p>
        </div>

        <aside className="phn-om-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Trening på {navnLite}</h2><span className="phn-kilde">Siste 4 uker</span></div>
            <div className="phn-hoved"><strong style={{ fontSize: 40 }}>{d.trening && d.trening.okter ? <StorTid min={d.trening.min} /> : "—"}</strong></div>
            <p className="phn-forklar">
              {d.trening && d.trening.okter
                ? `${d.trening.okter} ${d.trening.okter === 1 ? "økt" : "økter"} gjennomført med ${navnLite} som treningsområde.`
                : `Ingen gjennomførte økter med ${navnLite} som treningsområde de siste fire ukene.`}
            </p>
            <p className="phn-kilde">Gjennomført tid · {d.treningPeriode}</p>
          </section>
          <div className="phn-om-knapper">
            <Link className="phn-knapp pri" href="/portal/drills">Øvelser for {navnLite}</Link>
            <Link className="phn-knapp sek" href={fokusHref}>Be coachen om mer fokus her</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const tmKort = (d: Date) => KORT.format(d);

/** Snitt per måned som linje i SLAG-fargen, med verdien over hvert punkt. */
function Linje({ punkter }: { punkter: MaanedPunkt[] }) {
  const v = punkter.map((p) => p.v);
  const min = Math.min(...v) - 0.1, max = Math.max(...v) + 0.1, W = 320, H = 120;
  const xy = v.map((y, i) => [30 + i * (W - 50) / (v.length - 1), 22 + (max - y) / (max - min) * (H - 32)] as const);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const d = `M${xy.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" L")}`;
  return (
    <svg className="phn-graf" viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label={`Snitt per måned fra ${formaterSg(v[0])} i ${punkter[0]!.langt} til ${formaterSg(v[v.length - 1])} i ${punkter[punkter.length - 1]!.langt}`}>
      <line x1={30} x2={W - 10} y1={H} y2={H} stroke="var(--phn-sand-300)" />
      <path className="phn-tegn" d={d} fill="none" stroke="var(--phn-slag)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {xy.map(([x, y], i) => (
        <g key={punkter[i]!.navn + i}>
          <circle cx={x} cy={y} r={i === xy.length - 1 ? 5 : 3.5} fill="var(--phn-slag)" />
          <text className="gt" x={x} y={H + 16} textAnchor="middle">{punkter[i]!.navn}</text>
          <text className="gt" x={x} y={y - 9} textAnchor="middle">{formaterDesimal(v[i], 2)}</text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────── Akse ───────────── */

function AkseOmrade({ d }: { d: OmradeAkseData }) {
  const info = AKSE_INFO[d.akse];
  const maks = Math.max(60, ...d.uker.flatMap((u) => [u.gjort, u.plan]));
  const W = 320, H = 130, b = 44;
  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere?del=tren" tekst="Stats" />
      <Topp dato="Trening · akse" tittel={`${info.kode} ${info.navn}`} />
      <div className="phn-to-kol">
        <div className="phn-om-kol">
          <section className={`phn-fylt ${d.akse}`} aria-label={`${info.kode}, gjennomført siste fire uker`}>
            <span className="phn-om-fylt-etikett">Gjennomført siste 4 uker</span>
            <div className="phn-hoved">
              <strong>{d.gjortMin > 0 || d.planMin > 0 ? <StorTid min={d.gjortMin} /> : "—"}</strong>
              {d.pct != null && <span className="phn-trend">{d.pct} % av plan</span>}
            </div>
            <p>{d.planMin > 0 ? `Av ${formaterVarighet(d.planMin)} planlagt i Plan.` : `Ingen planlagte ${info.kode}-økter de siste fire ukene.`}</p>
          </section>

          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Uke for uke</h2><span className="phn-kilde">Gjennomført mot planlagt</span></div>
            <svg className="phn-graf" viewBox={`0 0 ${W} ${H + 20}`} role="img" aria-label={`${info.kode} per uke: ${d.uker.map((u) => `${u.navn} ${formaterVarighet(u.gjort)} av ${formaterVarighet(u.plan)}`).join(", ")}`}>
              {d.uker.map((u, i) => {
                const cx = 40 + i * 80, h = u.gjort / maks * H, hp = H - u.plan / maks * H;
                return (
                  <g key={u.navn + i}>
                    <rect x={cx - b / 2} y={H - h} width={b} height={Math.max(h, 0)} rx={3} fill={`var(--phn-${d.akse})`} />
                    {u.plan > 0 && <line x1={cx - b / 2 - 6} x2={cx + b / 2 + 6} y1={hp} y2={hp} stroke="var(--phn-g900)" strokeWidth={2} />}
                    <text className="gt" x={cx} y={H + 14} textAnchor="middle">{u.navn}</text>
                  </g>
                );
              })}
            </svg>
            <div className="phn-lg-rad">
              <span className="phn-lg"><i style={{ background: `var(--phn-${d.akse})` }} />Gjennomført</span>
              <span className="phn-lg"><i style={{ background: "var(--phn-g900)", height: 2 }} />Planlagt i Plan</span>
            </div>
          </section>
        </div>

        <aside className="phn-om-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Mest brukte øvelser</h2></div>
            {d.ovelser.length ? (
              <ul className="phn-om-liste">
                {d.ovelser.map((o) => (
                  <li key={o.navn}><span>{o.navn}</span><b>{formaterVarighet(o.min)}</b><span className="phn-kilde">{o.ganger} {o.ganger === 1 ? "gang" : "ganger"}</span></li>
                ))}
              </ul>
            ) : <p className="phn-forklar">Ingen gjennomførte øvelser i {info.kode} de siste fire ukene.</p>}
            <p className="phn-kilde">Fra gjennomførte økter · {d.periode}</p>
          </section>
          <div className="phn-om-knapper"><Link className="phn-knapp pri" href="/portal/planlegge">Til Plan</Link></div>
        </aside>
      </div>
    </div>
  );
}
