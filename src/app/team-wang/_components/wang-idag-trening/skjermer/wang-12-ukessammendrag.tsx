import Link from "next/link";
import { Lock } from "lucide-react";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { hendelserMellom, hentElevOkter, hentGruppeElever, hentGruppeplan } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  OMRADE_NAVN,
  DAG_LANG,
  ddmm,
  ddmmaaaa,
  gruppeokter,
  isoUke,
  leggTilDager,
  lesHeltall,
  mandagI,
  osloIso,
  perOmrade,
  summer,
  timer,
  ukedag,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { uke?: string | string[] };

/** WANG-12 Ukessammendrag. Fasit: «WANG Golf Batch 4.dc.html» #uke (6cfa623c). Rute: /team-wang/i-dag/ukessammendrag */
export async function WangUkessammendrag({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  // Standard: forrige uke (sammendraget skrives når uka er ferdig). 0 = inneværende uke.
  const forskyvning = lesHeltall(sok.uke, -1, -12, 0);
  const denneMandag = mandagI(idag);
  const mandag = leggTilDager(denneMandag, forskyvning * 7);
  const sondag = leggTilDager(mandag, 6);
  const nesteMandag = leggTilDager(mandag, 7);
  const uke = isoUke(mandag);
  const meta = `WANG-12 · ${gruppe.name} · uke ${uke} · ${ddmm(mandag)}–${ddmmaaaa(sondag)}`;

  const last = await lastTrygt(async () => {
    const [elever, plan] = await Promise.all([hentGruppeElever(gruppe.id), hentGruppeplan(gruppe.id, idag)]);
    const okter = await hentElevOkter(elever.map((e) => e.id), leggTilDager(denneMandag, -7 * 6), leggTilDager(denneMandag, 6));
    return { elever, plan, okter };
  });

  const las = (
    <span className={s.lock}>
      <Lock size={14} strokeWidth={1.5} aria-hidden="true" />
      Publisering til foresatte finnes ikke i appen ennå
    </span>
  );

  if (!last.ok) {
    return (
      <div className={s.stabel16} style={{ gap: 20 }}>
        <Sidehode meta={meta} tittel="Ukessammendrag" hoyre={las} />
        <WangFeil tittel="Vi fikk ikke hentet uka." tekst="Ingenting er borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-12")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const { elever, plan, okter } = last.data;
  const n = Math.max(1, elever.length);
  const iUke = okter.filter((o) => o.dato >= mandag && o.dato <= sondag);
  const sum = summer(iUke, naa);
  const omr = perOmrade(iUke).filter((o) => o.planlagtMin > 0).sort((a, b) => b.planlagtMin - a.planlagtMin);
  const slots = gruppeokter(iUke);
  const titler = [...new Set(slots.map((g) => g.tittel))];

  const jobbet =
    slots.length === 0
      ? "Ingen økter i uka."
      : [
          `${slots.length} ${slots.length === 1 ? "økt" : "økter"}, i snitt ${timer(sum.gjennomfortMin / n)} av ${timer(sum.planlagtMin / n)} timer gjennomført per elev.`,
          omr.length ? `Mest tid på ${omr.slice(0, 3).map((o) => `${OMRADE_NAVN[o.omrade].toLowerCase()} (${Math.round((o.planlagtMin / sum.planlagtMin) * 100)} %)`).join(", ")}.` : "",
          titler.length ? `Øktene: ${titler.slice(0, 5).join(", ")}${titler.length > 5 ? " med flere" : ""}.` : "",
        ]
          .filter(Boolean)
          .join("\n");

  const nesteUke = hendelserMellom(plan.hendelser, nesteMandag, leggTilDager(nesteMandag, 6)).filter((h) => !h.ukentlig);
  const nesteSkole = plan.skoledager.filter((d) => d.dato >= nesteMandag && d.dato <= leggTilDager(nesteMandag, 6));
  const praktisk = [
    ...nesteUke.map((h) => `${DAG_LANG[ukedag(h.dato)]} ${ddmm(h.dato)}: ${erTurneringstittel(h.tittel) ? h.tittel.replace(/^Turnering:\s*/, "Turnering: ") : h.tittel}${h.sted ? ` (${h.sted})` : ""}`),
    ...[...new Set(nesteSkole.map((d) => d.tittel))].map((t) => `Skole: ${t}`),
  ];

  const ukeRader = Array.from({ length: 7 }, (_, i) => -i).map((f) => {
    const m = leggTilDager(denneMandag, f * 7);
    const antall = gruppeokter(okter.filter((o) => o.dato >= m && o.dato <= leggTilDager(m, 6))).length;
    return { f, m, antall };
  });

  return (
    <div className={s.stabel16} style={{ gap: 20 }}>
      <Sidehode meta={meta} tittel="Ukessammendrag" hoyre={las} />
      {erDemo ? <WangDemoMerknad /> : null}

      <div className={s.split}>
        <section className={s.kort} style={{ padding: 24, display: "grid", gap: 18 }}>
          <div>
            <h2 className={s.h2stor}>Uke {uke} i golfgruppa</h2>
            <p className={s.tall} style={{ margin: "4px 0 0", fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>Utkast satt sammen fra ukas økter · {ddmm(mandag)}–{ddmmaaaa(sondag)}</p>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>Dette jobbet gruppa med</p>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--wtr-blue)", whiteSpace: "pre-line" }}>{jobbet}</p>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>Praktisk neste uke</p>
            {praktisk.length ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 16, lineHeight: 1.6, color: "var(--wtr-blue)" }}>
                {praktisk.map((p) => <li key={p}>{p}</li>)}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--wtr-text-muted)" }}>Ingen samlinger, turneringer eller skoledager i gruppas kalender neste uke.</p>
            )}
          </div>
          <div style={{ display: "grid", gap: 8, padding: "12px 14px", borderRadius: 4, background: "var(--wtr-blue-tint)" }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--wtr-blue)" }}>
              Teksten er et utgangspunkt. Den inneholder ingen elevnavn og ingen tall om enkeltelever. Å skrive, lagre og publisere posten til foresatte krever en ukespost i appen, som ikke finnes ennå.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            <WangKnapp href={wangHref("WANG-13")}>Til gruppeposter</WangKnapp>
            <WangKnapp variant="primar" disabled>Publiser</WangKnapp>
          </div>
        </section>

        <section className={`${s.kort} ${s.kortSkjult}`}>
          <div style={{ padding: "18px 20px 12px" }}><h2 className={s.h2}>Uker</h2></div>
          {ukeRader.map((r) => (
            <Link key={r.m} href={wangHref("WANG-12", {}, { uke: String(r.f) })} scroll={false} className={s.prow} aria-current={r.f === forskyvning ? "true" : undefined} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <span style={{ flex: 1, minWidth: 150 }}>
                <span style={{ display: "block", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>Uke {isoUke(r.m)}{r.f === 0 ? " · pågår" : ""}</span>
                <span className={s.tall} style={{ display: "block", fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(r.m)}–{ddmm(leggTilDager(r.m, 6))} · {r.antall} {r.antall === 1 ? "økt" : "økter"}</span>
              </span>
              <WangStatus tone="planlagt">Ikke publisert</WangStatus>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
