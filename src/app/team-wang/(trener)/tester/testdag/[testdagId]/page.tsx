import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkLaas } from "@/components/wang/tester-konkurranse/tk-ui";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangStatus, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { hentTestdag } from "@/lib/wang/tester-konkurranse/data";
import { datoMedUkedag, datoTekst } from "@/lib/wang/tester-konkurranse/format";
import { protokollTekst, resultatTekst } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

const DELTAKER: Record<string, { tekst: string; tone: WangStatusTone }> = {
  PENDING: { tekst: "Venter", tone: "planlagt" },
  DONE: { tekst: "Ført", tone: "ferdig" },
  SKIPPED: { tekst: "Hoppet over", tone: "varsel" },
  ABSENT: { tekst: "Fravær", tone: "fravaer" },
};

/**
 * WANG-08 Testdag — én testdag med kø og protokoll. Tegning: «WANG Golf
 * Batch 3.dc.html» #testdag. Ekte data: TestDay, deltakerne og resultatene
 * deres. Føring av forsøk (tastatur, uten nett) er ikke bygget i WANG-flaten.
 */
export default async function WangTestdagSide({ params }: { params: Promise<{ testdagId: string }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const { testdagId } = await params;
  const dag = await hentTestdag(gruppe.id, testdagId);
  if (!dag) notFound();

  const fort = dag.deltakere.filter((d) => d.status === "DONE").length;
  const gjenstar = dag.deltakere.filter((d) => d.status === "PENDING").length;
  const laast = dag.deltakere.some((d) => d.resultat !== null);

  return (
    <WangSide>
      <Link href={wangHref("WANG-08")} className={s.tilbake}><ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />Testdager</Link>
      <div className={s.rad} style={{ alignItems: "flex-end", marginTop: -12 }}>
        <div style={{ minWidth: 0 }}>
          <p className={s.meta} style={{ margin: "0 0 6px", fontSize: 12 }}>WANG-08 · Testdag · {datoMedUkedag(dag.scheduledAt)}{dag.location ? ` · ${dag.location}` : ""}</p>
          <h1 style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: "clamp(28px, 5vw, 40px)", letterSpacing: "var(--wtr-tracking-display)", color: "var(--wtr-blue)", lineHeight: 1.1 }}>{dag.title}</h1>
        </div>
        <TkLaas>Kun innlogget · trener ved WANG</TkLaas>
      </div>
      {erDemo ? <WangDemoMerknad /> : null}

      <section className={`${s.kort} ${s.kortPolstret}`} style={{ gap: 10, padding: "16px 20px" }}>
        <div className={s.rad} style={{ alignItems: "baseline" }}>
          <h2 className={s.h2} style={{ fontSize: 15 }}>Protokoll · {dag.testDefinition.name}</h2>
          {laast ? (
            <span className={s.meta} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Lock size={14} strokeWidth={1.5} aria-hidden="true" />Låst ved første føring</span>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: 16, color: "var(--wtr-blue)" }}>{protokollTekst(dag.testDefinition)}</p>
      </section>

      <div className={s.tsplit}>
        <section className={s.kort}>
          <div style={{ padding: "16px 20px 12px" }}>
            <h2 className={s.h2}>Kø</h2>
            <p className={s.meta} style={{ margin: "4px 0 0" }}>{fort} av {dag.deltakere.length} ført · {gjenstar} gjenstår</p>
          </div>
          {dag.deltakere.length === 0 ? (
            <WangTom tittel="Ingen elever i køen" tekst="Testdagen har ingen deltakere ennå." />
          ) : (
            dag.deltakere.map((d) => {
              const st = DELTAKER[d.status] ?? DELTAKER.PENDING;
              const vis = d.resultat ? resultatTekst(dag.testDefinition, d.resultat.score, d.resultat.details) : null;
              return (
                <div key={d.id} className={s.koRad}>
                  <span className={s.koNr}>{d.nr}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className={s.koNavn}>{d.elev.navn}</span>
                    <span className={s.koMeta}>
                      {[d.elev.klasse, vis ? (vis.enhet ? `${vis.verdi} ${vis.enhet}` : vis.verdi) : null, d.resultat ? `målt av ${d.resultat.maltAv ?? "—"} ${datoTekst(d.resultat.takenAt)}` : null].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </span>
                  <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
                </div>
              );
            })
          )}
        </section>

        <section className={`${s.kort} ${s.kortAktiv} ${s.kortPolstret}`} style={{ padding: 20, gap: 14 }}>
          <p className={s.meta} style={{ margin: 0 }}>Føring · {dag.testDefinition.name}</p>
          <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: 26, letterSpacing: "var(--wtr-tracking-display)", color: "var(--wtr-blue)" }}>
            {gjenstar === 0 && dag.deltakere.length > 0 ? "Alle i køen er ferdige" : `${gjenstar} ${gjenstar === 1 ? "elev" : "elever"} igjen`}
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--wtr-text-muted)" }}>
            Føring av forsøk gjøres ikke fra WANG-flaten ennå. Resultater som er ført, står i køen og går videre til testkøen for kontroll.
          </p>
          <Link href={wangHref("WANG-37")} className={s.radLenke}>Til testkøen</Link>
        </section>
      </div>
    </WangSide>
  );
}
