import Link from "next/link";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangStatus, WangTom } from "@/components/wang/trener/wang-ui";
import { ukenummer } from "@/lib/uke-helpers";
import { hentSamlinger } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, osloIso } from "@/lib/wang/tester-konkurranse/format";
import { samlingStatus } from "@/lib/wang/tester-konkurranse/konkurranse";
import { samlingHref } from "@/lib/wang/tester-konkurranse/lenker";

export const dynamic = "force-dynamic";

/**
 * WANG-09 Samlinger og uttak — liste. Tegning: «WANG Golf Batch 3.dc.html»
 * #samlinger. Ekte data: gruppas kalenderhendelser av typen SAMLING og
 * HELDAGSSAMLING (GroupSchedule). Uttak og publisering har ingen modell ennå.
 */
export default async function WangSamlingerSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  const samlinger = await hentSamlinger(gruppe.id);
  const naa = new Date();

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-09" undertittel={`${gruppe.name} · Skoleåret`} tittel="Samlinger" />
      {erDemo ? <WangDemoMerknad /> : null}
      <section className={s.kort}>
        {samlinger.length === 0 ? (
          <WangTom tittel="Ingen samlinger i kalenderen" tekst="Samlinger og heldagssamlinger som legges inn i gruppas kalender, står her." />
        ) : (
          <div role="table" aria-label="Samlinger">
            <div role="row" className={`${s.srow} ${s.shead}`}>
              <span role="columnheader">Uke</span><span role="columnheader">Samling</span><span role="columnheader">Dato</span><span role="columnheader" className={s.kolSted}>Plasser</span><span role="columnheader">Status</span>
            </div>
            {samlinger.map((sm) => {
              const st = samlingStatus(sm.startAt, sm.endAt, naa);
              const flereDager = osloIso(sm.startAt) !== osloIso(sm.endAt);
              return (
                <Link role="row" key={sm.id} href={samlingHref(sm.id)} className={s.srow}>
                  <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 700, color: "var(--wtr-blue)" }}>U{ukenummer(sm.startAt)}</span>
                  <span role="cell">
                    <span style={{ display: "block", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{sm.title}</span>
                    <span style={{ display: "block", fontSize: 13, color: "var(--wtr-text-muted)" }}>{sm.location ?? "Sted mangler"}{sm.kind === "HELDAGSSAMLING" ? " · heldag" : ""}</span>
                  </span>
                  <span role="cell" className={`${s.tall} ${s.kolS}`} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{flereDager ? `${datoTekst(sm.startAt)}–${datoTekst(sm.endAt)}` : datoTekst(sm.startAt)}</span>
                  <span role="cell" className={`${s.tall} ${s.kolSted}`} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{sm.maxParticipants ?? "—"}</span>
                  <span role="cell" className={s.kolS}><WangStatus tone={st.tone}>{st.tekst}</WangStatus></span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </WangSide>
  );
}
