"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Coachens per-økt live-visning. Paper-fasit: fase1/agencyos-live-session.html.
 * «UNDER-flata mens økta pågår», søsterflate til FangstSheet.
 *
 * «Start opptak» sender coachen til opptaksverktøyet med økta i URL-en
 * (/admin/recording?okt=<id>). Opptaket knyttes da til økta, og transkript
 * + analyse dukker opp på denne flata når det er ferdig behandlet.
 */

import Link from "next/link";
import { Caps, Kort, TomTilstand } from "@/components/v2";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

const MMILJO_LABEL: Record<string, string> = {
  M0: "M0", M1: "M1", M2: "M2", M3: "M3", M4: "M4", M5: "M5",
};

function linje(k: string, v: string) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{k}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text }}>{v}</span>
    </div>
  );
}

function fmtVarighet(sec: number | null): string {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LiveOktCoachV2({ data }: { data: LiveOktData }) {
  return (
    <div
      data-paper-agencyos-live-session
      data-paper-wave-f="live-session"
      data-od-id="agencyos-live-session" data-paper-slug="agencyos-live-session"
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 1080 }}
    >
      <div>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>{data.tittel}</h1>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
          {new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
          {new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}–
          {MMILJO_LABEL[data.miljo] ?? data.miljo}
        </span>
      </div>

      {!data.opptak && (
        <Kort
          pad="16px 18px"
          style={{
            border: `1px solid color-mix(in srgb, ${TL.fill} 35%, ${TL.hair})`,
            borderLeft: `3px solid ${TL.fill}`,
            background: `color-mix(in srgb, ${TL.fill} 6%, ${TL.elev})`,
          }}
        >
          <Caps size={9} color={TL.fill}>Én ting nå</Caps>
          <div style={{ marginTop: 8, fontFamily: TL.font.sans, fontSize: 18, fontWeight: 600, color: TL.text }}>
            Start opptaket før du sier noe
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Alt du sier fra du trykker og til du stopper blir til transkript, analyse og hjemmelekse. Starter du sent,
            mister spilleren begynnelsen av det du forklarte.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link
              href={`/admin/recording?okt=${data.id}`}
              className="v2-press v2-focus"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, minHeight: 56, padding: "10px 16px",
                borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14,
                fontWeight: 600, textDecoration: "none",
              }}
            >
              Start opptak
            </Link>
          </div>
        </Kort>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Økta">
            {linje("Spiller", data.spillerNavn ?? "ikke satt")}
            {linje("Coach", data.coachNavn ?? "—")}
            {linje("Sted", data.sted ?? "ikke satt")}
            {linje("Miljø", MMILJO_LABEL[data.miljo] ?? data.miljo)}
            {linje("Type", data.type)}
            {linje("Status", data.status)}
            {data.malsetning && (
              <p style={{ margin: "12px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                {data.malsetning}
              </p>
            )}
          </Kort>

          <Kort eyebrow="Løpet">
            {data.driller.length === 0 ? (
              <TomTilstand icon="list" title="Ingen driller på denne økta" sub="Driller dukker opp her når de er lagt inn på økta." />
            ) : (
              data.driller.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0",
                    borderBottom: i === data.driller.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  }}
                >
                  <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{d.navn}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{d.pyramide} · {d.varighetMin} min</span>
                </div>
              ))
            )}
          </Kort>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Opptak">
            <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>Lyd fra økta</div>
            {data.opptak ? (
              <>
                <p style={{ margin: "8px 0 0", fontFamily: TL.font.mono, fontSize: 24, fontWeight: 600, color: TL.text }}>
                  {fmtVarighet(data.opptak.durationSec)}
                </p>
                <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>status: {data.opptak.status.toLowerCase()}</p>
              </>
            ) : (
              <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                Ingen opptak på denne økta ennå. Opptaket startes fra Én ting nå øverst.
              </p>
            )}
          </Kort>

          <Kort eyebrow="Siste analyse">
            {data.opptak?.coachAnalyse ? (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>{data.opptak.coachAnalyse}</p>
            ) : (
              <>
                <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>Ingen analyse for denne økta</div>
                <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                  {data.opptak
                    ? "Analysen lages av opptaket. Kjøres når opptaket er ferdig transkribert."
                    : "Analysen lages av opptaket. Start opptaket øverst, så kommer analysen hit når den er ferdig."}
                </p>
              </>
            )}
          </Kort>

          <Kort eyebrow="Transkript">
            {data.opptak?.transcript ? (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {data.opptak.transcript}
              </p>
            ) : (
              <TomTilstand icon="file-text" title="Ingen transkript ennå" sub="Kommer når opptaket er ferdig behandlet." />
            )}
          </Kort>
        </div>
      </div>
    </div>
  );
}
