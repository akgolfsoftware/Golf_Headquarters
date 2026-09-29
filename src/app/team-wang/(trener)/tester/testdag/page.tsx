import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkLaas } from "@/components/wang/tester-konkurranse/tk-ui";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangStatus, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { hentTestdager } from "@/lib/wang/tester-konkurranse/data";
import { datoMedUkedag } from "@/lib/wang/tester-konkurranse/format";
import { testdagHref } from "@/lib/wang/tester-konkurranse/lenker";

export const dynamic = "force-dynamic";

const DAG_STATUS: Record<string, { tekst: string; tone: WangStatusTone }> = {
  PLANNED: { tekst: "Planlagt", tone: "planlagt" },
  ACTIVE: { tekst: "Pågår", tone: "pagar" },
  COMPLETED: { tekst: "Ferdig", tone: "ferdig" },
  CANCELLED: { tekst: "Avlyst", tone: "fravaer" },
};

/**
 * WANG-08 Testdag — oversikt over gruppas testdager. Tegning: «WANG Golf
 * Batch 3.dc.html» #testdag. Ekte data: TestDay for gruppa.
 */
export default async function WangTestdagerSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  const dager = await hentTestdager(gruppe.id);

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-08" undertittel="Testdager" tittel="Testdag" handling={<TkLaas>Kun innlogget · trener ved WANG</TkLaas>} />
      {erDemo ? <WangDemoMerknad /> : null}
      <section className={s.kort}>
        <div className={s.kortHode}>
          <h2 className={s.h2}>Testdager</h2>
          <span className={s.meta}>{dager.length === 1 ? "1 testdag" : `${dager.length} testdager`}</span>
        </div>
        {dager.length === 0 ? (
          <WangTom tittel="Ingen testdager satt opp" tekst="Når en testdag er satt opp for gruppa, står den her med køen og hvor mange som er ført." />
        ) : (
          <div role="table" aria-label="Testdager">
            <div role="row" className={`${s.dagRad} ${s.thead}`}>
              <span role="columnheader">Dato</span><span role="columnheader">Testdag</span><span role="columnheader">Ført</span><span role="columnheader">Status</span>
            </div>
            {dager.map((d) => {
              const fort = d.participants.filter((p) => p.status === "DONE").length;
              const st = DAG_STATUS[d.status] ?? DAG_STATUS.PLANNED;
              return (
                <div role="row" key={d.id} className={s.dagRad}>
                  <span role="cell" className={`${s.tall} ${s.helMobil}`} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>{datoMedUkedag(d.scheduledAt)}</span>
                  <span role="cell" className={s.helMobil}>
                    <Link href={testdagHref(d.id)} className={s.turNavn}>
                      <span className={s.turNavnTekst}>{d.title}<ArrowRight size={14} strokeWidth={1.5} className={s.turNavnPil} aria-hidden="true" /></span>
                      <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{d.testDefinition.name}{d.location ? ` · ${d.location}` : ""}</span>
                    </Link>
                  </span>
                  <span role="cell" className={s.tall} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{fort} av {d.participants.length}</span>
                  <span role="cell"><WangStatus tone={st.tone}>{st.tekst}</WangStatus></span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </WangSide>
  );
}
