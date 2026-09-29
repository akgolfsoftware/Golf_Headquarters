import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkLaas } from "@/components/wang/tester-konkurranse/tk-ui";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangStatus, WangTom } from "@/components/wang/trener/wang-ui";
import { resultatKilde } from "@/lib/domain/turneringsresultat";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { ukenummer } from "@/lib/uke-helpers";
import { hentElever, hentKnyttetTil, hentKommende, hentOffentligeResultater, hentTurneringInfo } from "@/lib/wang/tester-konkurranse/data";
import { dagerMellom, datoTekst, motParTekst, osloIso, tallTekst } from "@/lib/wang/tester-konkurranse/format";
import { fristTone, gruppeSnitt, pameldingEtikett, sorterResultater, spilte } from "@/lib/wang/tester-konkurranse/konkurranse";
import { testdagHref } from "@/lib/wang/tester-konkurranse/lenker";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/**
 * WANG-11 Turneringsdetalj. Tegning: «WANG Golf Batch 4.dc.html» #turnering.
 * Gjennomført: den offisielle resultatlista for WANG-elevene (brutto, fra
 * turneringsbasen). Kommende: nedtelling, frist og hvem som er påmeldt.
 */
export default async function WangTurneringSide({ params }: { params: Promise<{ turneringId: string }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const { turneringId } = await params;
  const turnering = await hentTurneringInfo(turneringId);
  if (!turnering) notFound();

  const naa = new Date();
  const elever = await hentElever(gruppe.id);
  const erGjennomfort = osloIso(turnering.startDate) < osloIso(naa);
  const [offentlig, kommende, knyttet] = await Promise.all([
    hentOffentligeResultater(elever, turnering.id),
    erGjennomfort ? Promise.resolve([]) : hentKommende(elever, naa, turnering.id),
    hentKnyttetTil(gruppe.id, turnering.startDate),
  ]);
  const deltakere = sorterResultater(offentlig.rader);
  const pameldinger = kommende.flatMap((k) => k.pameldinger);
  const snitt = gruppeSnitt(deltakere);
  const maksRunder = Math.min(3, Math.max(0, ...deltakere.map((d) => d.runder.length)));
  const sted = turnering.course?.name ?? turnering.location;
  const lest = deltakere.map((d) => d.kildeDato).filter((d): d is Date => d !== null).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const dager = dagerMellom(naa, turnering.startDate);
  const tone = fristTone(turnering.entryCloses, naa);
  const uke = ukenummer(turnering.startDate);

  return (
    <WangSide>
      <Link href={wangHref("WANG-10", {}, erGjennomfort ? { vis: "gjennomfort" } : undefined)} className={s.tilbake}><ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />Turneringer</Link>
      <div className={s.rad} style={{ alignItems: "flex-end", marginTop: -12 }}>
        <div style={{ minWidth: 0 }}>
          <p className={s.meta} style={{ margin: "0 0 6px", fontSize: 12 }}>WANG-11 · {turnering.sourceOrigin ? resultatKilde(turnering.sourceOrigin) : "Turnering"} · {datoTekst(turnering.startDate)}</p>
          <h1 style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: "clamp(28px, 5vw, 40px)", letterSpacing: "var(--wtr-tracking-display)", color: "var(--wtr-blue)", lineHeight: 1.1 }}>{turnering.name}</h1>
          <p style={{ margin: "8px 0 0", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{sted ?? "Bane mangler"}{maksRunder ? ` · ${maksRunder} ${maksRunder === 1 ? "runde" : "runder"}` : ""}</p>
        </div>
        <div className={s.radVenstre}>
          <WangStatus tone={erGjennomfort ? "ferdig" : "planlagt"}>{erGjennomfort ? "Gjennomført" : "Kommende"}</WangStatus>
          <TkLaas>Kun innlogget · trener ved WANG</TkLaas>
        </div>
      </div>
      {erDemo ? <WangDemoMerknad /> : null}

      <div className={s.split15}>
        <div className={s.stabel20}>
          {erGjennomfort ? (
            deltakere.length === 0 ? (
              <section className={s.kort}>
                <WangTom tittel="Ingen resultater for WANG-elevene" tekst={offentlig.koblet === 0 ? "Ingen elever i gruppa er koblet til turneringsbasen, så resultatene kan ikke vises." : "Turneringsbasen har ingen resultater for elevene i denne turneringen."} />
              </section>
            ) : (
              <>
                <p className={s.merknad}>
                  <Info size={18} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} />
                  <span>Plassering er ikke en vurdering. <span className={s.merknadSvak}>Lista viser den offisielle resultatlista for WANG-elevene. Den sier ingenting om form eller utvikling.</span></span>
                </p>
                <section className={s.kort}>
                  <div style={{ padding: "18px 20px 12px", display: "grid", gap: 4 }}>
                    <h2 className={s.h2}>Resultater · {spilte(deltakere)} WANG-elever · snitt {snitt.snitt === null ? "—" : tallTekst(snitt.snitt, 1)} brutto</h2>
                    <p className={s.meta} style={{ margin: 0 }}>{resultatKilde(turnering.sourceOrigin)}{lest ? ` · hentet ${datoTekst(lest)}` : ""} · brutto</p>
                  </div>
                  <div role="table" aria-label="Resultatliste">
                    <div role="row" className={`${s.resRad} ${s.resHode}`}>
                      <span role="columnheader">Elev</span>
                      <span role="columnheader" className={s.kolD}>R1</span><span role="columnheader" className={s.kolD}>R2</span><span role="columnheader" className={s.kolD}>R3</span>
                      <span role="columnheader" className={s.kolD}>Totalt</span><span role="columnheader">Til par</span><span role="columnheader">Plass</span>
                    </div>
                    {deltakere.map((d) => {
                      const r = [0, 1, 2].map((i) => d.runder[i]?.brutto ?? null);
                      return (
                        <div role="row" key={d.elevId} className={s.resRad}>
                          <span role="cell">
                            <span style={{ display: "block", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{d.navn}</span>
                            <span style={{ display: "block", fontSize: 13, color: "var(--wtr-text-muted)" }}>{d.klasse ?? "—"}</span>
                            <span className={`${s.mobilMeta} ${s.tall}`} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{d.runder.map((x) => x.brutto ?? "—").join(" · ") || "—"} · {d.brutto ?? "—"}</span>
                          </span>
                          {r.map((v, i) => <span role="cell" key={i} className={`${s.kolD} ${s.tall}`} style={{ fontSize: 14, color: "var(--wtr-blue)" }}>{v ?? "—"}</span>)}
                          <span role="cell" className={`${s.kolD} ${s.tall}`} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-blue)" }}>{d.brutto ?? "—"}</span>
                          <span role="cell" className={s.tall} style={{ fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{motParTekst(d.motPar)}</span>
                          <span role="cell" className={s.tall} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-blue)" }}>{d.plasseringTekst ?? "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )
          ) : (
            <>
              <section className={`${s.kort} ${s.kortAktiv} ${s.kortPolstret}`} style={{ padding: 24, gap: 16 }}>
                <p className={s.nedtelling}>
                  <span className={s.nedtellingTall}>{dager}</span>
                  <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 15, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{dager === 1 ? "dag" : "dager"} til første runde · {datoTekst(turnering.startDate)}</span>
                </p>
                <div style={{ display: "grid", borderTop: "1px solid var(--wtr-border-subtle)" }}>
                  <div className={s.infoRad}>
                    <span className={s.infoNokkel}>Påmeldingsfrist</span>
                    <span className={`${s.infoVerdi} ${s.tall}`} style={{ fontSize: 14, fontWeight: 500, color: tone === "snart" ? "var(--wtr-pink)" : undefined }}>{turnering.entryCloses ? `${datoTekst(turnering.entryCloses)}${tone === "passert" ? " · passert" : ""}` : "—"}</span>
                  </div>
                  <div className={s.infoRad}>
                    <span className={s.infoNokkel}>Skolefri</span>
                    <span className={s.infoVerdi}>— <Link href={wangHref("WANG-05")} className={s.radLenke} style={{ minHeight: 0, fontSize: 14 }}>Søk eller se status i WANG-05</Link></span>
                  </div>
                </div>
              </section>
              <section className={s.kort}>
                <div className={s.kortHode} style={{ padding: "18px 20px 12px" }}>
                  <h2 className={s.h2}>Påmeldt</h2>
                  <span className={s.meta} style={{ fontSize: 13 }}>{pameldinger.length} {pameldinger.length === 1 ? "elev" : "elever"} har turneringen på planen</span>
                </div>
                {pameldinger.length === 0 ? (
                  <p className={s.tomLinje}>Ingen WANG-elever har denne turneringen på planen.</p>
                ) : (
                  pameldinger.map((p) => {
                    const e = pameldingEtikett(p.status);
                    return (
                      <div key={p.elevId} className={s.person}>
                        <span style={{ flex: 1, minWidth: 160 }}>
                          <span style={{ display: "block", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{p.navn}</span>
                          <span style={{ display: "block", fontSize: 13, color: "var(--wtr-text-muted)" }}>{p.klasse ?? "—"}</span>
                        </span>
                        <WangStatus tone={e.tone}>{e.tekst}</WangStatus>
                      </div>
                    );
                  })
                )}
              </section>
            </>
          )}
        </div>

        <aside className={s.knyttet}>
          <h2 className={s.h2} style={{ marginBottom: 8 }}>Knyttet til</h2>
          <div className={s.knyttetRad}>
            <span className={s.meta}>Periode</span>
            <span style={{ fontSize: 15, color: "var(--wtr-blue)" }}>{knyttet.periode ? `${LPHASE_LABEL[knyttet.periode.lPhase]}${knyttet.periode.focus ? ` · ${knyttet.periode.focus}` : ""}` : "—"}</span>
          </div>
          <div className={s.knyttetRad}>
            <span className={s.meta}>Uke</span>
            <span className={s.tall} style={{ fontSize: 15, color: "var(--wtr-blue)" }}>Uke {uke}</span>
            <Link href={wangHref("WANG-12")} className={s.radLenke} style={{ fontSize: 14 }}>Ukessammendrag<ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" /></Link>
          </div>
          <div className={s.knyttetRad}>
            <span className={s.meta}>Siste testrunde før turneringen</span>
            {knyttet.testdag ? (
              <Link href={testdagHref(knyttet.testdag.id)} className={s.radLenke} style={{ fontSize: 14 }}>{knyttet.testdag.title} · {datoTekst(knyttet.testdag.scheduledAt)}</Link>
            ) : (
              <span style={{ fontSize: 15, color: "var(--wtr-blue)" }}>—</span>
            )}
          </div>
        </aside>
      </div>
    </WangSide>
  );
}
