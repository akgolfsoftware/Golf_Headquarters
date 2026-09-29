import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkElevVelger } from "@/components/wang/tester-konkurranse/tk-elev-velger";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangChips, WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { hentElever, hentNesteTestdag, hentOffentligeResultater, hentResultater } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, forsteParam, motParTekst } from "@/lib/wang/tester-konkurranse/format";
import { bruttoRunder } from "@/lib/wang/tester-konkurranse/konkurranse";
import { resultaterHref, testdagHref, turneringHref } from "@/lib/wang/tester-konkurranse/lenker";
import { endringTekst, erNgfTest, FYS_KILDE, lavereErBedre, protokollTekst, resultatTekst } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

type Filter = "fysisk" | "ngf" | "turneringer";

/**
 * WANG-23 Resultater per elev. Tegning: «WANG Golf Batch 8.dc.html» #tester.
 * Eleven velges med ?elev=<id>, visningen med ?vis=fysisk|ngf|turneringer.
 * Ekte data: elevens testresultater og offentlige turneringsresultater.
 */
export default async function WangResultaterSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const sok = await searchParams;
  const elever = await hentElever(gruppe.id);
  const elev = elever.find((e) => e.id === forsteParam(sok.elev)) ?? elever[0] ?? null;
  const visParam = forsteParam(sok.vis);
  const filter: Filter = visParam === "ngf" || visParam === "turneringer" ? visParam : "fysisk";

  if (!elev) {
    return (
      <WangSide>
        <WangSidehode skjermId="WANG-23" tittel="Resultater per elev" />
        {erDemo ? <WangDemoMerknad /> : null}
        <WangKort><WangTom tittel="Ingen elever i gruppa ennå" tekst="Resultatene vises her når elevene er lagt inn i WANG-gruppa." /></WangKort>
      </WangSide>
    );
  }

  const naa = new Date();
  const [resultater, neste, turn] = await Promise.all([
    hentResultater([elev.id]),
    hentNesteTestdag(gruppe.id, elev.id, naa),
    filter === "turneringer" ? hentOffentligeResultater([elev]) : Promise.resolve(null),
  ]);

  // Én gruppe per test, i rekkefølgen testen sist ble tatt.
  const perTest = new Map<string, typeof resultater>();
  for (const r of resultater) {
    const erNgf = erNgfTest(r.testId);
    if (filter === "ngf" ? !erNgf : filter === "fysisk" ? erNgf || r.test.pyramidArea !== "FYS" : true) continue;
    perTest.set(r.testId, [...(perTest.get(r.testId) ?? []), r]);
  }
  const kort = [...perTest.values()].map((rader) => {
    const def = rader[0].test;
    const vist = rader.map((r) => ({ r, vis: resultatTekst(def, r.score, r.details) }));
    const siste = vist.at(-1)!;
    const forrigeFerdig = vist.slice(0, -1).reverse().find((x) => x.vis.tall !== null);
    let endring = forrigeFerdig ? "" : "Første måling";
    if (siste.vis.tall !== null && forrigeFerdig && forrigeFerdig.vis.tall !== null) {
      const d = siste.vis.tall - forrigeFerdig.vis.tall;
      endring = `${endringTekst(d, siste.vis.enhetKode)} siden ${datoTekst(forrigeFerdig.r.takenAt)}${lavereErBedre(def) ? " · lavere er bedre" : ""}`;
    }
    if (siste.vis.tall === null) endring = "Vises bare som utkast · skala ikke avklart i NGF-arket";
    const maks = Math.max(0, ...vist.map((x) => x.vis.tall ?? 0));
    return {
      id: def.id, navn: def.name, prot: protokollTekst(def), stor: siste.vis.verdi, enhet: siste.vis.enhet, endring,
      meta: `${datoTekst(siste.r.takenAt)} · målt av ${siste.r.recordedBy ? siste.r.recordedBy.name?.trim() || siste.r.recordedBy.email : "eleven selv"}${siste.r.witnessStatus === "ATTESTED" ? " · kontrollert" : ""}`,
      hist: vist.toReversed().map((x) => ({ id: x.r.id, dato: datoTekst(x.r.takenAt), verdi: x.vis.enhet ? `${x.vis.verdi} ${x.vis.enhet}` : x.vis.verdi, bredde: x.vis.tall !== null && maks > 0 ? Math.round((x.vis.tall / maks) * 100) : 0, meta: x.r.recordedBy ? `ført av ${x.r.recordedBy.name?.trim() || x.r.recordedBy.email}` : "ført av eleven" })),
    };
  });

  const fornavn = elev.navn.split(" ")[0];
  const velgHref = (vis: Filter) => wangHref("WANG-23", {}, vis === "fysisk" ? { elev: elev.id } : { elev: elev.id, vis });

  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-23"
        undertittel={`${elev.navn}${elev.klasse ? ` · ${elev.klasse}` : ""} · ${gruppe.name}`}
        tittel={elev.navn}
        handling={<div className={s.velgerRad}><TkElevVelger elever={elever} valgt={elev.id} basisHref={resultaterHref(elev.id)} /></div>}
      />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.split17}>
        <div className={s.stabel}>
          <WangChips
            etikett="Filter"
            valg={[
              { href: velgHref("fysisk"), etikett: FYS_KILDE, aktiv: filter === "fysisk" },
              { href: velgHref("ngf"), etikett: "NGF-arket", aktiv: filter === "ngf" },
              { href: velgHref("turneringer"), etikett: "Turneringer", aktiv: filter === "turneringer" },
            ]}
          />
          {filter !== "turneringer" ? (
            kort.length === 0 ? (
              <WangKort>
                <WangTom tittel="Ingen målinger ennå" tekst={`Ingen tester i denne gruppa er målt for ${fornavn} ennå.${neste ? ` Neste testdag er ${datoTekst(neste.scheduledAt)} · ${neste.title}.` : ""}`} />
              </WangKort>
            ) : (
              <div className={s.kortRutenett}>
                {kort.map((k) => (
                  <article key={k.id} className={s.resKort}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <h2 className={s.h2liten}>{k.navn}</h2>
                      <span className={s.meta} style={{ fontSize: 12 }}>{k.prot}</span>
                    </div>
                    <p style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 10px" }}>
                      <span className={s.resStor}>{k.stor}</span>
                      {k.enhet ? <span className={s.tall} style={{ fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{k.enhet}</span> : null}
                      <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{k.endring}</span>
                    </p>
                    <p className={s.tall} style={{ margin: 0, fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{k.meta}</p>
                    <div style={{ display: "grid" }}>
                      {k.hist.map((h) => (
                        <div key={h.id} className={s.hrow}>
                          <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{h.dato}</span>
                          <span className={s.bar} aria-hidden="true"><span className={s.barFyll} style={{ width: `${h.bredde}%` }} /></span>
                          <span className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)", textAlign: "right" }}>{h.verdi}</span>
                          <span className={s.tall} style={{ gridColumn: "1 / -1", fontSize: 11.5, color: "var(--wtr-text-muted)" }}>{h.meta}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <section className={s.kort}>
              <div style={{ padding: "16px 20px", display: "grid", gap: 4 }}>
                <h2 className={s.h2liten}>Turneringer</h2>
                <span className={s.meta}>Fra turneringsbasen · turneringsresultat, ikke test · brutto</span>
              </div>
              {!turn || turn.koblet === 0 ? (
                <p className={s.tomLinje}>{fornavn} er ikke koblet til turneringsbasen ennå, så ingen turneringer kan vises.</p>
              ) : turn.rader.length === 0 ? (
                <p className={s.tomLinje}>Ingen turneringer registrert for {fornavn}.</p>
              ) : (
                turn.rader.map((t) => (
                  <div key={t.turnering.id} style={{ borderTop: "1px solid var(--wtr-border-subtle)", padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "baseline" }}>
                    <Link href={turneringHref(t.turnering.id)} style={{ flex: 1, minWidth: 160, fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-pink)" }}>{t.turnering.name}</Link>
                    <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{datoTekst(t.turnering.startDate)} · {bruttoRunder(t.runder).join(" · ") || "—"}</span>
                    <span className={s.tall} style={{ fontSize: 15, fontWeight: 700, color: "var(--wtr-blue)" }}>{t.brutto ?? "—"}{t.motPar !== null ? ` (${motParTekst(t.motPar)})` : ""}</span>
                  </div>
                ))
              )}
            </section>
          )}
        </div>

        <aside className={s.stabel}>
          <section className={`${s.kort} ${s.kortPolstret}`} style={{ padding: "18px 20px", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 500, fontSize: 17, color: "var(--wtr-blue)" }}>Tallene følger eleven, ikke skolen.</p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--wtr-blue)" }}>Bytter {fornavn} skole eller klubb, følger testhistorikken med i PlayerHQ. WANG ser bare tallene så lenge {fornavn} går her.</p>
          </section>
          <section className={`${s.kort} ${s.kortPolstret}`} style={{ padding: "16px 20px", gap: 4 }}>
            <span className={s.meta}>Neste testdag</span>
            {neste ? (
              <Link href={testdagHref(neste.id)} className={s.radLenke} style={{ fontSize: 14 }}>{datoTekst(neste.scheduledAt)} · {neste.title}{neste.location ? ` · ${neste.location}` : ""}<ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" /></Link>
            ) : (
              <span className={s.tall} style={{ fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>—</span>
            )}
          </section>
        </aside>
      </div>
    </WangSide>
  );
}
