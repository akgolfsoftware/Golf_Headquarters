import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkLaas, TkSeg } from "@/components/wang/tester-konkurranse/tk-ui";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { grupperGjennomforte, hentElever, hentKommende, hentOffentligeResultater } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, forsteParam, osloIso, tallTekst } from "@/lib/wang/tester-konkurranse/format";
import { erPameldt, fristTone, gruppeSnitt, spilte } from "@/lib/wang/tester-konkurranse/konkurranse";
import { turneringHref } from "@/lib/wang/tester-konkurranse/lenker";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

const FRIST_FARGE = { passert: "var(--wtr-text-muted)", snart: "var(--wtr-pink)", ok: "var(--wtr-blue)", mangler: "var(--wtr-text-muted)" } as const;

/**
 * WANG-10 Turneringer. Tegning: «WANG Golf Batch 4.dc.html» #turneringer.
 * Kommende: turneringene elevene har på planen (TournamentEntry).
 * Gjennomført: offentlige resultater fra turneringsbasen (pipelines), brutto.
 */
export default async function WangTurneringerSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const vis = forsteParam((await searchParams).vis) === "gjennomfort" ? "gjennomfort" : "kommende";
  const naa = new Date();
  const elever = await hentElever(gruppe.id);
  const [kommende, offentlig] = await Promise.all([hentKommende(elever, naa), hentOffentligeResultater(elever)]);
  const idag = osloIso(naa);
  const gjennomforte = grupperGjennomforte(offentlig.rader.filter((r) => osloIso(r.turnering.startDate) < idag));
  const sistHentet = offentlig.rader.map((r) => r.kildeDato).filter((d): d is Date => d !== null).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-10" undertittel={`${gruppe.name} · Sesong ${idag.slice(0, 4)}`} tittel="Turneringer" handling={<TkLaas>Kun innlogget · trener ved WANG</TkLaas>} />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.stabel}>
        <div className={s.rad}>
          <TkSeg
            etikett="Turneringer"
            valg={[
              { href: wangHref("WANG-10"), etikett: <>Kommende <span className={s.tall} style={{ opacity: 0.8 }}>{kommende.length}</span></>, aktiv: vis === "kommende" },
              { href: wangHref("WANG-10", {}, { vis: "gjennomfort" }), etikett: <>Gjennomført <span className={s.tall} style={{ opacity: 0.8 }}>{gjennomforte.length}</span></>, aktiv: vis === "gjennomfort" },
            ]}
          />
          <span className={s.meta} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className={`${s.prikk} ${offentlig.koblet > 0 ? s.pKontrollert : s.pPlanlagt}`} aria-hidden="true" />
            AK Golf Pipeline · {offentlig.koblet === 0 ? "ingen elever koblet til turneringsbasen" : sistHentet ? `sist hentet ${datoTekst(sistHentet)}` : "hentetidspunkt mangler"}
          </span>
        </div>

        {vis === "kommende" ? (
          <section className={s.kort}>
            {kommende.length === 0 ? (
              <WangTom tittel="Ingen kommende turneringer" tekst="Ingen av elevene har en kommende turnering på planen sin ennå. Turneringer elevene legger inn i PlayerHQ, dukker opp her." />
            ) : (
              <div role="table" aria-label="Kommende turneringer">
                <div role="row" className={`${s.turRad} ${s.turHode}`}>
                  <span role="columnheader">Dato</span><span role="columnheader">Turnering</span><span role="columnheader">Påmeldt</span><span role="columnheader">Påmeldingsfrist</span><span role="columnheader" className={s.kolX}>På planen</span>
                </div>
                {kommende.map((t, i) => {
                  const tone = fristTone(t.frist, naa);
                  const pameldt = t.pameldinger.filter((p) => erPameldt(p.status)).length;
                  return (
                    <div role="row" key={t.turneringId ?? `m-${i}`} className={s.turRad}>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>{datoTekst(t.startDato)}</span>
                      <span role="cell">
                        {t.turneringId ? (
                          <Link href={turneringHref(t.turneringId)} className={s.turNavn}>
                            <span className={s.turNavnTekst}>{t.navn}<ArrowRight size={14} strokeWidth={1.5} className={s.turNavnPil} aria-hidden="true" /></span>
                            <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{t.sted ?? "—"}</span>
                          </Link>
                        ) : (
                          <span className={s.turNavn}><span className={s.turNavnTekst}>{t.navn}</span><span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>Egen turnering · ikke i turneringsbasen</span></span>
                        )}
                      </span>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}><span className={s.lblM}>Påmeldt: </span>{pameldt}</span>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: FRIST_FARGE[tone] }}><span className={s.lblM}>Frist: </span>{t.frist ? `${datoTekst(t.frist)}${tone === "passert" ? " · passert" : ""}` : "—"}</span>
                      <span role="cell" className={s.kolX} style={{ fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}><span className={s.lblM}>På planen: </span>{t.pameldinger.length} {t.pameldinger.length === 1 ? "elev" : "elever"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className={s.kort}>
            {gjennomforte.length === 0 ? (
              <WangTom
                tittel="Ingen gjennomførte turneringer"
                tekst={offentlig.koblet === 0 ? "Ingen elever i gruppa er koblet til turneringsbasen ennå, så resultatene kan ikke hentes." : "Ingen resultater for elevene i turneringsbasen ennå."}
              />
            ) : (
              <div role="table" aria-label="Gjennomførte turneringer">
                <div role="row" className={`${s.turRad} ${s.turHode}`}>
                  <span role="columnheader">Dato</span><span role="columnheader">Turnering</span><span role="columnheader">Spilte</span><span role="columnheader">Gruppas snitt</span><span role="columnheader" className={s.kolX}>Kilde</span>
                </div>
                {gjennomforte.map((t) => {
                  const snitt = gruppeSnitt(t.deltakere);
                  return (
                    <div role="row" key={t.turneringId} className={s.turRad}>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>{datoTekst(t.startDato)}</span>
                      <span role="cell">
                        <Link href={turneringHref(t.turneringId)} className={s.turNavn}>
                          <span className={s.turNavnTekst}>{t.navn}<ArrowRight size={14} strokeWidth={1.5} className={s.turNavnPil} aria-hidden="true" /></span>
                          <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{t.sted ?? "—"}</span>
                        </Link>
                      </span>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}><span className={s.lblM}>Spilte: </span>{spilte(t.deltakere)}</span>
                      <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>
                        <span className={s.lblM}>Gruppas snitt: </span>{snitt.snitt === null ? "—" : tallTekst(snitt.snitt, 1)}{" "}
                        <span style={{ color: "var(--wtr-text-muted)", fontWeight: 400 }}>brutto · {snitt.runder} {snitt.runder === 1 ? "runde" : "runder"}</span>
                      </span>
                      <span role="cell" className={s.kolX} style={{ fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{t.kilde ?? "Kilde mangler"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        <p className={s.fot} style={{ fontSize: 12 }}>Brutto score. Turneringer som mangler i datagrunnlaget, vises ikke før de er i turneringsbasen.</p>
      </div>
    </WangSide>
  );
}
