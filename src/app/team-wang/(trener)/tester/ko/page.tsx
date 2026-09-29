import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { kontrollerResultat } from "@/app/team-wang/(trener)/tester/actions";
import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkStatus } from "@/components/wang/tester-konkurranse/tk-ui";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangChips, WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { hentElever, hentTestkoKilder } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, forsteParam } from "@/lib/wang/tester-konkurranse/format";
import { resultaterHref, testdagHref } from "@/lib/wang/tester-konkurranse/lenker";
import { byggTestko, KO_STATUSER, testkoTellere, type KoStatus } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/**
 * WANG-37 Testkø — alt som gjenstår etter testdagene. Tegning: «WANG Golf
 * Batch 14.dc.html» #tester. Ekte data: deltakere på gruppas testdager og
 * åpne testtildelinger. «Kontroller» attesterer resultatet.
 */
export default async function WangTestkoSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, rolle, erDemo } = await krevWangTrener();
  const sok = await searchParams;
  const naa = new Date();
  const elever = await hentElever(gruppe.id);
  const { deltakere, oppdrag } = await hentTestkoKilder(gruppe.id, elever.map((e) => e.id));
  const alle = byggTestko(deltakere, oppdrag, naa);
  const tellere = testkoTellere(alle, naa);

  const filterParam = forsteParam(sok.status);
  const filter: KoStatus | "alle" = KO_STATUSER.includes(filterParam as KoStatus) ? (filterParam as KoStatus) : "alle";
  const rader = filter === "alle" ? alle : alle.filter((r) => r.status === filter);
  const elevEtterId = new Map(elever.map((e) => [e.id, e]));
  const scope = `${rolle === "SPORTSSJEF" ? "Sportssjef" : "Trener"} · ${gruppe.name}`;

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-37" undertittel={scope} tittel="Testkø" />
      {erDemo ? <WangDemoMerknad /> : null}
      {alle.length === 0 ? (
        <WangKort>
          <WangTom
            tittel="Ingenting gjenstår"
            tekst="Ingenting gjenstår etter testdagene, og ingen tester er tildelt. Alle resultater er kontrollert."
            handling={<Link href={wangHref("WANG-08")} className={s.radLenke}>Se testdagene<ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" /></Link>}
          />
        </WangKort>
      ) : (
        <div className={s.stabel}>
          <p className={s.ingress}>Alt som gjenstår etter testdagene (WANG-08). Når du kontrollerer et resultat, flyttes det til elevens resultater (WANG-23) med kildelinje.</p>
          <section className={`${s.kort} ${s.cnt}`}>
            {[["Ført, ikke kontrollert", tellere.ikkeKontrollert], ["Mangler", tellere.mangler], ["Planlagt neste fire uker", tellere.planlagtFireUker]].map(([etikett, n]) => (
              <div key={etikett} className={s.cntCelle}>
                <span className={s.cntEtikett}>{etikett}</span>
                <span className={s.cntTall}>{n}</span>
              </div>
            ))}
          </section>
          <WangChips
            etikett="Status"
            valg={(["alle", ...KO_STATUSER] as const).map((k) => ({
              href: k === "alle" ? wangHref("WANG-37") : wangHref("WANG-37", {}, { status: k }),
              etikett: `${k === "alle" ? "Alle" : k} · ${k === "alle" ? alle.length : alle.filter((r) => r.status === k).length}`,
              aktiv: filter === k,
            }))}
          />
          <section className={s.kort}>
            <div role="table" aria-label="Testkø">
              <div role="row" className={`${s.trow} ${s.thead}`}>
                <span role="columnheader">Elev</span><span role="columnheader">Test</span><span role="columnheader">Dato</span><span role="columnheader">Målt av · status</span><span role="columnheader" />
              </div>
              {rader.map((r) => {
                const elev = elevEtterId.get(r.elevId);
                return (
                  <div role="row" key={r.id} className={s.trow}>
                    <span role="cell" style={{ display: "grid", gap: 1 }}>
                      <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14.5, fontWeight: 500, color: "var(--wtr-blue)" }}>{elev?.navn ?? "—"}</span>
                      <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{elev?.klasse ?? "—"}</span>
                    </span>
                    <span role="cell" className={s.helMobil} style={{ display: "grid", gap: 1 }}>
                      <span style={{ fontSize: 15, color: "var(--wtr-blue)" }}>
                        {r.test}
                        {r.verdi ? <span className={s.tall} style={{ fontWeight: 700 }}> · {r.verdi}</span> : null}
                      </span>
                      <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{r.protokoll}</span>
                    </span>
                    <span role="cell" className={s.tall} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{datoTekst(r.dato)}</span>
                    <span role="cell" className={s.helMobil} style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", alignItems: "center" }}>
                      <TkStatus status={r.status} />
                      <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{r.meta}</span>
                    </span>
                    <span role="cell" className={s.helMobil} style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                      {r.status === "Ført" && !r.utkast && r.resultatId ? (
                        <form action={kontrollerResultat}>
                          <input type="hidden" name="resultatId" value={r.resultatId} />
                          <button type="submit" className={s.kbtn}>Kontroller</button>
                        </form>
                      ) : null}
                      {r.status === "Kontrollert" ? (
                        <Link href={resultaterHref(r.elevId)} className={s.radLenke}>WANG-23<ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" /></Link>
                      ) : null}
                      {r.status === "Mangler" && r.testdagId ? (
                        <Link href={testdagHref(r.testdagId)} className={s.radLenke}>Testdagen<ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" /></Link>
                      ) : null}
                    </span>
                  </div>
                );
              })}
              {rader.length === 0 ? <p className={s.tomLinje}>Ingen tester med denne statusen.</p> : null}
            </div>
          </section>
        </div>
      )}
    </WangSide>
  );
}
