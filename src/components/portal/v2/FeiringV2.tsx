"use client";

/**
 * PlayerHQ · Plan-feiring — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-feiring.html.
 *
 * Ett formål: anerkjenne arbeidet med EKTE tall og peke videre. Ingen
 * konfetti-løgn — tallene bærer feiringen. Fasitens tilstander: fullført
 * (hero + KPI + «perioden i tall» + CTA-rad) og ikke-ferdig (ærlig
 * fremdrift i stedet for fest). Alle tall kommer fra planens egne økter.
 */

import Link from "next/link";
import { T, Caps, Kort, HvorforDette } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

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

function fmtDelta(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

const CLAY_CTA: React.CSSProperties = {
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 56,
  borderRadius: T.rCard,
  background: T.handling,
  color: T.onHandling,
  fontFamily: T.ui,
  fontSize: 14,
  fontWeight: 600,
};

export function FeiringV2({ data }: { data: FeiringV2Data }) {
  const diff =
    data.forrigeEtterlevelse === null ? null : data.prosent - data.forrigeEtterlevelse;

  return (
    <div
      data-paper-slug="playerhq-feiring"
      data-od-id="playerhq-feiring"
      style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}
    >
      {/* Topp — fasit: Plan fullført + planens navn */}
      <div>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
          {data.ikkeFerdig ? "Planen din" : "Plan fullført"}
        </h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {data.planNavn}
        </span>
      </div>

      {data.ikkeFerdig ? (
        /* Fullført-guarden — fasit: ærlig fremdrift, ingen fest */
        <div style={{ padding: "24px 16px", background: T.panel2, border: `1px dashed ${T.border}`, borderRadius: T.rCard }}>
          <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            Planen er ikke ferdig ennå
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
            Du har fullført {data.ferdige} av {data.total} økter. Feiringen venter til siste økt er
            logget — den kommer av seg selv.
          </p>
          <div style={{ height: 8, background: T.track, borderRadius: 9999, overflow: "hidden", margin: "8px 0 12px" }}>
            <div style={{ height: "100%", width: `${data.prosent}%`, background: T.mut, borderRadius: 9999 }} />
          </div>
          <Link href="/portal/tren" data-od-id="feiring-tom-plan" className="v2-press v2-focus" style={{ ...CLAY_CTA, width: "100%" }} data-paper-en-ting="true">
            Åpne neste økt
          </Link>
        </div>
      ) : (
        <>
          {/* Hero — den fullførte planen */}
          <div style={{ textAlign: "center", padding: "32px 16px 24px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 16px",
                borderRadius: 9999,
                display: "grid",
                placeItems: "center",
                background: T.handlingSoft,
                color: T.handling,
              }}
            >
              <Icon name="trophy" size={26} />
            </div>
            <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 22, fontWeight: 600, color: T.fg }}>
              {data.planNavn} er fullført
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "44ch", fontFamily: T.bodyFont, fontSize: 14.5, color: T.mut }}>
              {data.uker !== null ? `${data.uker} uker, ` : ""}
              {data.ferdige} økter{data.timer !== null ? `, ${data.timer} timer` : ""}. Dette er
              arbeidet som flytter tallene — og du gjorde det.
            </p>
          </div>

          {/* KPI-rutenett */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 16, textAlign: "center" }}>
              <Caps>økter</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: T.fg }}>
                {data.ferdige} av {data.total}
              </div>
            </div>
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 16, textAlign: "center" }}>
              <Caps>etterlevelse</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: T.fg }}>
                {data.prosent} %
              </div>
              {diff !== null && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 8px",
                    borderRadius: 9999,
                    fontFamily: T.mono,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    color: diff >= 0 ? T.up : T.down,
                  }}
                >
                  {diff >= 0 ? "+" : "−"}
                  {Math.abs(diff)} vs forrige plan
                </span>
              )}
            </div>
          </div>

          {/* Rekord — reelt tall uten fasit-motpart, beholdt (ærlig motivasjon) */}
          {data.erRekord && data.sgTotalDelta !== null && (
            <Kort tint>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="star" size={18} style={{ color: T.handling, flex: "none" }} />
                <div style={{ minWidth: 0 }}>
                  <Caps color={T.handling}>Personlig rekord</Caps>
                  <div style={{ fontFamily: T.bodyFont, fontSize: 12.5, color: T.fg2, marginTop: 3 }}>
                    Beste SG-Total-utvikling av planene dine hittil.
                  </div>
                </div>
              </div>
            </Kort>
          )}

          {/* Perioden i tall */}
          <Kort eyebrow="perioden i tall">
            <div>
              {(
                [
                  ["Periode", data.planNavn],
                  data.timer !== null ? ["Treningstimer", `${data.timer} t`] : null,
                  data.pyramideTopp ? ["Størst volum", data.pyramideTopp] : null,
                  data.sgTotalDelta !== null ? ["SG Total-utvikling", fmtDelta(data.sgTotalDelta)] : null,
                  data.publisertAv ? ["Publisert av", data.publisertAv] : null,
                ].filter(Boolean) as [string, string][]
              ).map((pr, i, arr) => (
                <div
                  key={pr[0]}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}`,
                    fontSize: 13,
                    color: T.fg,
                  }}
                >
                  <span>{pr[0]}</span>
                  <span style={{ marginLeft: "auto", fontFamily: T.mono, textAlign: "right" }}>{pr[1]}</span>
                </div>
              ))}
            </div>
            <HvorforDette
              kilde={`alle øktene i planen «${data.planNavn}» — ${data.ferdige} fullført, ${data.total - data.ferdige} ikke fullført.`}
              beregning={`etterlevelse er fullførte økter delt på planlagte — ${data.ferdige} av ${data.total} er ${data.prosent} prosent.`}
              forbehold="droppede økter teller ikke negativt utover brøken — å droppe med beskjed er en del av eierskapet, ikke et avvik."
            />
          </Kort>

          {/* Kontrakt §3: én aksenthandling — neste periode. Analysen er lesing. */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 24 }}>
            <Link
              href="/portal/planlegge/workbench?zoom=uke"
              data-od-id="feiring-neste"
              className="v2-press v2-focus"
              style={{ ...CLAY_CTA, flex: 1 }}
              data-paper-en-ting="true"
            >
              Åpne neste periode
            </Link>
            <Link
              href="/portal/analysere"
              data-od-id="feiring-analyse"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                padding: "0 16px",
                borderRadius: T.rCard,
                border: `1px solid ${T.border}`,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Se analysen
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
