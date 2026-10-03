"use client";

/**
 * PH07Feiring — plan-feiring i Precision Athletics.
 * Samme tall som før: etterlevelse, timer, uker, pyramide, SG og rekord.
 * Ikke ferdig viser ærlig fremdrift, ikke fest. Tallene kommer fra planens egne økter.
 * Tegningsfilen ui_kits/playerhq/screens/PH-07.jsx ligger ikke i git.
 */

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Ikon, Sidehode, StatusPille } from "@/components/precision/pa";
import { formaterFortegn, formaterProsent } from "@/lib/format-tall";
import "@/styles/precision-athletics.css";

export type FeiringV2Data = {
  planNavn: string;
  prosent: number;
  ferdige: number;
  total: number;
  /** Sum treningstimer fra fullførte økter — null når varighet mangler. */
  timer: number | null;
  /** Antall uker i planperioden — null uten sluttdato. */
  uker: number | null;
  /** Pyramideområdet med størst planlagt volum — null uten økter. */
  pyramideTopp: string | null;
  /** Navn på coachen som publiserte planen — null når ukjent. */
  publisertAv: string | null;
  /** Forrige plans etterlevelse i prosent — null uten tidligere planer. */
  forrigeEtterlevelse: number | null;
  erRekord: boolean;
  /** SG-Total-delta fra PlanEffectiveness — null = ikke beregnet. */
  sgTotalDelta: number | null;
  /** Planen er ikke ferdig — vis ærlig fremdrift i stedet for fest. */
  ikkeFerdig: boolean;
};

export function FeiringV2({ data }: { data: FeiringV2Data }) {
  const diff =
    data.forrigeEtterlevelse === null ? null : data.prosent - data.forrigeEtterlevelse;
  const prosent = Math.max(0, Math.min(100, data.prosent));
  const rader = (
    [
      ["Periode", data.planNavn],
      data.timer !== null ? ["Treningstimer", `${data.timer} t`] : null,
      data.pyramideTopp ? ["Størst volum", data.pyramideTopp] : null,
      data.sgTotalDelta !== null ? ["SG Total-utvikling", formaterFortegn(data.sgTotalDelta)] : null,
      data.publisertAv ? ["Publisert av", data.publisertAv] : null,
    ].filter(Boolean) as [string, string][]
  );

  return (
    <div className="ph-feiring" data-od-id="playerhq-feiring">
      <Sidehode
        kicker={data.planNavn}
        title={data.ikkeFerdig ? "Planen din" : "Plan fullført"}
      />

      {data.ikkeFerdig ? (
        <section className="pa-card ph-feiring-kort">
          <h2>Planen er ikke ferdig ennå</h2>
          <p>
            Du har fullført {data.ferdige} av {data.total} økter. Feiringen venter til siste økt er
            logget — den kommer av seg selv.
          </p>
          <div
            className="ph-feiring-spor"
            role="progressbar"
            aria-valuenow={prosent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fremdrift i planen"
          >
            <span style={{ width: `${prosent}%` }} />
          </div>
          <Link href="/portal/tren" data-od-id="feiring-tom-plan" className="pa-btn pa-btn--primary pa-btn--full">
            Åpne neste økt
          </Link>
        </section>
      ) : (
        <>
          <section className="pa-card ph-feiring-hero">
            <span className="ph-feiring-merke" aria-hidden>
              <Ikon icon={Trophy} size={26} name="trophy" />
            </span>
            <h2>{data.planNavn} er fullført</h2>
            <p>
              {data.uker !== null ? `${data.uker} uker, ` : ""}
              {data.ferdige} økter{data.timer !== null ? `, ${data.timer} timer` : ""}. Dette er
              arbeidet som flytter tallene — og du gjorde det.
            </p>
          </section>

          <div className="ph-feiring-kpi">
            <section className="pa-card ph-feiring-kort">
              <p className="ph-feiring-kicker">Økter</p>
              <p className="ph-feiring-tall">{data.ferdige} av {data.total}</p>
            </section>
            <section className="pa-card ph-feiring-kort">
              <p className="ph-feiring-kicker">Etterlevelse</p>
              <p className="ph-feiring-tall">{formaterProsent(data.prosent)}</p>
              {diff !== null && (
                <StatusPille tone={diff >= 0 ? "ok" : "warn"}>
                  {formaterFortegn(diff, 0)} vs forrige plan
                </StatusPille>
              )}
            </section>
          </div>

          {data.erRekord && data.sgTotalDelta !== null && (
            <section className="pa-card ph-feiring-kort">
              <p className="ph-feiring-kicker">Personlig rekord</p>
              <p>Beste SG-Total-utvikling av planene dine hittil.</p>
            </section>
          )}

          <section className="pa-card ph-feiring-kort">
            <p className="ph-feiring-kicker">Perioden i tall</p>
            <dl className="ph-feiring-rader">
              {rader.map(([navn, verdi]) => (
                <div key={navn} className="ph-feiring-rad">
                  <dt>{navn}</dt>
                  <dd>{verdi}</dd>
                </div>
              ))}
            </dl>
            <details className="ph-feiring-hvorfor">
              <summary>Hvorfor dette tallet</summary>
              <ul>
                <li>
                  <strong>Kilde: </strong>
                  alle øktene i planen «{data.planNavn}» — {data.ferdige} fullført, {data.total - data.ferdige} ikke fullført.
                </li>
                <li>
                  <strong>Beregning: </strong>
                  etterlevelse er fullførte økter delt på planlagte — {data.ferdige} av {data.total} er {formaterProsent(data.prosent)}.
                </li>
                <li>
                  <strong>Forbehold: </strong>
                  droppede økter teller ikke negativt utover brøken — å droppe med beskjed er en del av eierskapet, ikke et avvik.
                </li>
              </ul>
            </details>
          </section>

          <div className="ph-feiring-handlinger">
            <Link href="/portal/planlegge/workbench?zoom=uke" data-od-id="feiring-neste" className="pa-btn pa-btn--primary">
              Åpne neste periode
            </Link>
            <Link href="/portal/analysere" data-od-id="feiring-analyse" className="pa-btn pa-btn--secondary">
              Se analysen
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
