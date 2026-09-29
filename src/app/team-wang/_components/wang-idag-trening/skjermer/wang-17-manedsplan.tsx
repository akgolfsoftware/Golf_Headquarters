import { Flag, NotebookPen } from "lucide-react";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { hendelserMellom, hentAarsgrunnlag } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  MND_LANG,
  OMRADE_NAVN,
  ddmm,
  forsteVerdi,
  isoUke,
  leggTilDager,
  mandagI,
  osloIso,
  perOmrade,
  summer,
  timer,
  type OmradeSum,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Chips, Periodemerke, Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { mnd?: string | string[] };

const stor = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function andeler(omr: OmradeSum[], felt: "planlagtMin" | "gjennomfortMin"): Map<string, number | null> {
  const tot = omr.reduce((a, o) => a + o[felt], 0);
  return new Map(omr.map((o) => [o.omrade, tot > 0 ? (o[felt] / tot) * 100 : null]));
}

const pst = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${Math.round(v)} %`);
const avvik = (a: number | null | undefined, b: number | null | undefined) => {
  if (a === null || a === undefined || b === null || b === undefined) return "—";
  const d = Math.round(a - b);
  return d === 0 ? "0" : `${d > 0 ? "+" : "−"}${Math.abs(d)}`;
};

/** WANG-17 Månedsplan. Fasit: «WANG Golf Batch 6.dc.html» #maned (6cfa623c). Rute: /team-wang/trening/maned */
export async function WangManedsplan({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const meta = `WANG-17 · ${gruppe.name}`;
  const last = await lastTrygt(() => hentAarsgrunnlag(gruppe.id, idag));

  if (!last.ok) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={meta} tittel="Månedsplan" />
        <WangFeil tittel="Vi fikk ikke hentet månedsplanen." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-17")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const g = last.data;

  // Månedene i skoleåret.
  const maneder: string[] = [];
  for (let d = `${g.fra.slice(0, 7)}-01`; d <= g.til; ) {
    maneder.push(d.slice(0, 7));
    const [a, m] = d.split("-").map(Number);
    d = new Date(Date.UTC(a, m, 1)).toISOString().slice(0, 10);
  }
  const onsket = forsteVerdi(sok.mnd);
  const valgt = maneder.find((m) => m === onsket) ?? maneder.find((m) => m === idag.slice(0, 7)) ?? maneder[0];
  const [aar, mndNr] = valgt.split("-").map(Number);
  const start = `${valgt}-01`;
  const slutt = new Date(Date.UTC(aar, mndNr, 0)).toISOString().slice(0, 10);
  const n = Math.max(1, g.elever.length);

  const iMnd = g.okter.filter((o) => o.dato >= start && o.dato <= slutt);
  const sum = summer(iMnd, naa);
  const perioderIMnd = g.perioder.filter((p) => p.til >= start && p.fra <= slutt && !["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"].includes(p.fase));
  const hendelser = hendelserMellom(g.hendelser, mandagI(start), leggTilDager(mandagI(slutt), 6)).filter((h) => !h.ukentlig);
  const prover = g.skoledager.filter((d) => ["PROVE", "HELDAGSPROVE", "EKSAMEN"].includes(d.kategori));

  const uker: string[] = [];
  for (let m = mandagI(start); m <= slutt; m = leggTilDager(m, 7)) uker.push(m);

  const chips = maneder.map((m) => ({ href: wangHref("WANG-17", {}, { mnd: m }), etikett: stor(MND_LANG[Number(m.slice(5, 7)) - 1].slice(0, 3)), aktiv: m === valgt }));

  // Avvik: periodens, månedens og det førte i andeler per område.
  const hovedperiode = perioderIMnd.find((p) => p.fra <= start && p.til >= start) ?? perioderIMnd[0] ?? null;
  const periodeOmr = hovedperiode ? perOmrade(g.okter.filter((o) => o.dato >= hovedperiode.fra && o.dato <= hovedperiode.til)) : null;
  const mndOmr = perOmrade(iMnd);
  const aP = periodeOmr ? andeler(periodeOmr, "planlagtMin") : null;
  const aM = andeler(mndOmr, "planlagtMin");
  const aF = andeler(mndOmr, "gjennomfortMin");

  return (
    <div className={s.stabel16} style={{ gap: 20 }}>
      <Sidehode meta={meta} tittel="Månedsplan" />
      {erDemo ? <WangDemoMerknad /> : null}
      <Chips valg={chips} etikett="Måned" />

      <section className={s.kort} style={{ padding: "20px 24px", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: 30, letterSpacing: "-0.015em", color: "var(--wtr-blue)" }}>
            {stor(MND_LANG[mndNr - 1])} {aar}
          </h2>
          {perioderIMnd.map((p) => (
            <span key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Periodemerke fase={p.fase} />
              <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(p.fra)}–{ddmm(p.til)}</span>
            </span>
          ))}
        </div>
        {sum.planlagtMin > 0 ? (
          <p style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            <span><span className={s.tall} style={{ fontSize: 18, fontWeight: 700, color: "var(--wtr-blue)" }}>{uker.length}</span> uker</span>
            <span><span className={s.tall} style={{ fontSize: 18, fontWeight: 700, color: "var(--wtr-blue)" }}>{timer(sum.planlagtMin / n)} t</span> planlagt</span>
            <span><span className={s.tall} style={{ fontSize: 18, fontWeight: 700, color: "var(--wtr-blue)" }}>{timer(sum.gjennomfortMin / n)} t</span> ført</span>
            <span>snitt per elev</span>
          </p>
        ) : null}
      </section>

      {sum.planlagtMin === 0 ? (
        <section className={s.kort} style={{ padding: "28px 24px", display: "grid", gap: 14, justifyItems: "start" }}>
          <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 500, fontSize: 17, color: "var(--wtr-blue)" }}>Ikke planlagt ennå</p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--wtr-text-muted)" }}>
            Ingen publiserte økter i {MND_LANG[mndNr - 1]}. Økter planlegges i Workbench. Ny uke starter med en kopi av forrige uke.
          </p>
        </section>
      ) : (
        <>
          <section className={`${s.kort} ${s.kortSkjult}`}>
            <div className={`${s.wrow} ${s.whead}`}>
              <span>Uke</span><span>Datoer</span><span>Periode</span><span>Timer</span><span>Fokus</span><span className={s.cxKol}>Prøver og turneringer</span>
            </div>
            {uker.map((m) => {
              const sondag = leggTilDager(m, 6);
              const iUke = g.okter.filter((o) => o.dato >= m && o.dato <= sondag);
              const us = summer(iUke, naa);
              const omr = perOmrade(iUke).filter((o) => o.planlagtMin > 0).sort((a, b) => b.planlagtMin - a.planlagtMin);
              const periode = g.perioder.find((p) => p.fra <= m && p.til >= m && !["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"].includes(p.fase)) ?? null;
              const turn = hendelser.filter((h) => h.dato >= m && h.dato <= sondag && erTurneringstittel(h.tittel));
              const andre = hendelser.filter((h) => h.dato >= m && h.dato <= sondag && !erTurneringstittel(h.tittel));
              const prov = prover.filter((p) => p.dato >= m && p.dato <= sondag);
              const merker = turn.length + andre.length + prov.length;
              return (
                <div key={m} className={s.wrow}>
                  <span className={s.tall} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-blue)" }}>Uke {isoUke(m)}</span>
                  <span className={s.tall} style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{ddmm(m)}–{ddmm(sondag)}</span>
                  <span>{periode ? <Periodemerke fase={periode.fase} /> : <span style={{ color: "var(--wtr-text-disabled)" }}>—</span>}</span>
                  <span className={s.tall} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>
                    {us.planlagtMin > 0 ? (
                      <><strong>{timer(us.planlagtMin / n)} t</strong> plan · {timer(us.gjennomfortMin / n)} t ført</>
                    ) : "—"}
                  </span>
                  <span className={s.full} style={{ fontSize: 15, lineHeight: 1.4, color: "var(--wtr-blue)" }}>
                    {omr.length ? omr.slice(0, 3).map((o) => `${o.omrade} ${Math.round((o.planlagtMin / us.planlagtMin) * 100)} %`).join(" · ") : "Ingen økter"}
                  </span>
                  <span className={`${s.cx} ${s.cxKol}`}>
                    {prov.map((p) => <span key={`${p.dato}-${p.tittel}`} style={{ color: "var(--wtr-blue)", display: "flex", alignItems: "center", gap: 4 }}><NotebookPen size={14} strokeWidth={1.5} aria-hidden="true" />{p.tittel}</span>)}
                    {turn.map((t) => <span key={t.id} style={{ color: "var(--wtr-blue)", display: "flex", alignItems: "center", gap: 4 }}><Flag size={14} strokeWidth={1.5} aria-hidden="true" className={s.flagg} />{t.tittel.replace(/^Turnering:\s*/, "")}</span>)}
                    {andre.map((t) => <span key={t.id} style={{ color: "var(--wtr-text-muted)" }}>{t.tittel}</span>)}
                    {merker === 0 ? <span style={{ color: "var(--wtr-text-disabled)" }}>—</span> : null}
                  </span>
                </div>
              );
            })}
          </section>

          <section className={`${s.kort} ${s.kortSkjult}`}>
            <div style={{ padding: "18px 20px 12px", display: "grid", gap: 4 }}>
              <h2 className={s.h2}>Periode mot måned mot ført</h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--wtr-text-muted)" }}>Avviket er en opplysning. Det krever ingen godkjenning og sperrer ingenting.</p>
            </div>
            <div className={`${s.arow} ${s.ahead}`}><span>Område</span><span>Periode</span><span>Måned</span><span>Ført</span><span>Avvik</span></div>
            {mndOmr.map((o) => (
              <div key={o.omrade} className={s.arow}>
                <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 700, color: "var(--wtr-blue)" }}>{o.omrade} <span className={s.cxNavn}>{OMRADE_NAVN[o.omrade]}</span></span>
                <span className={s.tall} style={{ color: "var(--wtr-text-muted)" }}>{pst(aP?.get(o.omrade))}</span>
                <span className={s.tall} style={{ color: "var(--wtr-blue)" }}>{pst(aM.get(o.omrade))}</span>
                <span className={s.tall} style={{ color: "var(--wtr-blue)" }}>{pst(aF.get(o.omrade))}</span>
                <span className={s.tall} style={{ fontWeight: 700, color: "var(--wtr-blue)" }}>{avvik(aF.get(o.omrade), aM.get(o.omrade))}</span>
              </div>
            ))}
            <p style={{ margin: 0, padding: "12px 20px 16px", borderTop: "1px solid var(--wtr-grey-line)", fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
              Andel av tiden per område. Periode er hele {hovedperiode ? "perioden" : "perioden (ingen periode lagt inn)"}, måned er publiserte økter i {MND_LANG[mndNr - 1]}, ført er det elevene har registrert. Avvik er ført minus måned, i prosentpoeng.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
