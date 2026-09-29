import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangStatus, WangTom } from "@/components/wang/trener/wang-ui";
import { ukenummer } from "@/lib/uke-helpers";
import { hentSamling } from "@/lib/wang/tester-konkurranse/data";
import { datoMedUkedag, datoTekst, osloIso } from "@/lib/wang/tester-konkurranse/format";
import { samlingStatus } from "@/lib/wang/tester-konkurranse/konkurranse";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/**
 * WANG-09 Samling — detalj. Tegning: «WANG Golf Batch 3.dc.html» #samling.
 * Ekte data: kalenderhendelsen (GroupSchedule). Kriterium, uttak, venteliste,
 * svar og publisering er tegnet, men har ingen datamodell ennå — skjermen
 * sier det i stedet for å vise oppdiktede lister.
 */
export default async function WangSamlingSide({ params }: { params: Promise<{ samlingId: string }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const { samlingId } = await params;
  const sm = await hentSamling(gruppe.id, samlingId);
  if (!sm) notFound();
  const st = samlingStatus(sm.startAt, sm.endAt, new Date());
  const flereDager = osloIso(sm.startAt) !== osloIso(sm.endAt);

  return (
    <WangSide>
      <Link href={wangHref("WANG-09")} className={s.tilbake}><ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />Samlinger</Link>
      <div className={s.rad} style={{ alignItems: "flex-end", marginTop: -12 }}>
        <div style={{ minWidth: 0 }}>
          <p className={s.meta} style={{ margin: "0 0 6px", fontSize: 12 }}>WANG-09 · Uke {ukenummer(sm.startAt)} · {flereDager ? `${datoTekst(sm.startAt)}–${datoTekst(sm.endAt)}` : datoMedUkedag(sm.startAt)}</p>
          <h1 style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: "clamp(28px, 5vw, 40px)", letterSpacing: "var(--wtr-tracking-display)", color: "var(--wtr-blue)", lineHeight: 1.1 }}>{sm.title}</h1>
          <p style={{ margin: "8px 0 0", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{sm.location ?? "Sted mangler"}{sm.kind === "HELDAGSSAMLING" ? " · heldagssamling" : ""}</p>
        </div>
        <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
      </div>
      {erDemo ? <WangDemoMerknad /> : null}

      {sm.description ? (
        <section className={`${s.kort} ${s.kortPolstret}`}>
          <h2 className={s.h2}>Om samlingen</h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--wtr-blue)", whiteSpace: "pre-line", maxWidth: 760 }}>{sm.description}</p>
        </section>
      ) : null}

      <section className={`${s.kort} ${s.kortPolstret}`}>
        <h2 className={s.h2}><span className={s.stegNr}>1</span>  Kriterium for uttak</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--wtr-text-muted)" }}>Kriteriet skrives før lista settes opp, og låses ved publisering.</p>
        <p style={{ margin: 0, fontSize: 17, color: "var(--wtr-blue)" }}>—</p>
      </section>

      <section className={s.kort}>
        <div className={s.kortHode} style={{ padding: "20px 24px 12px" }}>
          <h2 className={s.h2}><span className={s.stegNr}>2</span>  Uttak</h2>
          <span className={s.meta} style={{ fontSize: 13 }}>{sm.maxParticipants ? `${sm.maxParticipants} plasser` : "Antall plasser mangler"}</span>
        </div>
        <p className={s.bandTittel}>Tatt ut</p>
        <WangTom tittel="Uttak kan ikke føres ennå" tekst="Uttak, venteliste, elevenes svar og publisering har ingen lagring i AK Golf HQ ennå. Når det er på plass, settes lista opp her og låses ved publisering." />
      </section>
    </WangSide>
  );
}
