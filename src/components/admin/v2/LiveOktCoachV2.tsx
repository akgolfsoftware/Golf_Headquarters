"use client";

/**
 * Coachens per-økt live-visning. Paper-fasit: fase1/agencyos-live-session.html.
 * «UNDER-flata mens økta pågår», søsterflate til FangstSheet.
 *
 * Opptak er ikke koblet til denne økta i dag — /api/recording/start setter
 * aldri sessionId på SessionRecording, kun bookingId eller fritt playerId.
 * «Start opptak» lenker derfor til det ekte, frie opptaksverktøyet
 * (/admin/recording) i stedet for å late som en kobling som ikke finnes.
 */

import Link from "next/link";
import { T, Caps, Kort, TomTilstand } from "@/components/v2";
import { AnalyseResultatSchema } from "@/lib/coaching-analysis";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

const MMILJO_LABEL: Record<string, string> = {
  M0: "M0", M1: "M1", M2: "M2", M3: "M3", M4: "M4", M5: "M5",
};

function linje(k: string, v: string) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{k}</span>
      <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{v}</span>
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
  const analyse = AnalyseResultatSchema.safeParse(data.opptak?.aiAnalysis);
  const varighet = `${data.varighetPlanlagtMin} min planlagt`;

  return (
    <div
      data-paper-agencyos-live-session
      data-paper-wave-f="live-session"
      data-od-id="agencyos-live-session" data-paper-slug="agencyos-live-session"
      style={{ display: "flex", flexDirection: "column", gap: T.gap, width: "100%", maxWidth: 1080 }}
    >
      <div>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>{data.tittel}</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
          {new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}–
          {MMILJO_LABEL[data.miljo] ?? data.miljo}
        </span>
      </div>

      {!data.opptak && (
        <Kort
          pad="16px 18px"
          style={{
            border: `1px solid color-mix(in srgb, ${T.handling} 35%, ${T.border})`,
            borderLeft: `3px solid ${T.handling}`,
            background: `color-mix(in srgb, ${T.handling} 6%, ${T.panel})`,
          }}
        >
          <Caps size={9} color={T.handling}>Én ting nå</Caps>
          <div style={{ marginTop: 8, fontFamily: T.disp, fontSize: 18, fontWeight: 600, color: T.fg }}>
            Start opptaket før du sier noe
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
            Alt du sier fra du trykker og til du stopper blir til transkript, analyse og hjemmelekse. Starter du sent,
            mister spilleren begynnelsen av det du forklarte.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/admin/recording"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, minHeight: 56, padding: "10px 16px",
                borderRadius: 12, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 14,
                fontWeight: 600, textDecoration: "none",
              }}
            >
              Start opptak
            </Link>
          </div>
        </Kort>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Økta">
            {linje("Spiller", data.spillerNavn ?? "ikke satt")}
            {linje("Coach", data.coachNavn ?? "—")}
            {linje("Sted", data.sted ?? "ikke satt")}
            {linje("Miljø", MMILJO_LABEL[data.miljo] ?? data.miljo)}
            {linje("Type", data.type)}
            {linje("Status", data.status)}
            {data.malsetning && (
              <p style={{ margin: "12px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
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
                    borderBottom: i === data.driller.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{d.navn}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>{d.pyramide} · {d.varighetMin} min</span>
                </div>
              ))
            )}
          </Kort>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Opptak">
            <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>Lyd fra økta</div>
            {data.opptak ? (
              <>
                <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 24, fontWeight: 600, color: T.fg }}>
                  {fmtVarighet(data.opptak.durationSec)}
                </p>
                <p style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 12, color: T.mut }}>status: {data.opptak.status.toLowerCase()}</p>
              </>
            ) : (
              <p style={{ margin: "10px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
                Ingen opptak på denne økta. Opptaket startes fra Én ting nå øverst.
              </p>
            )}
          </Kort>

          <Kort eyebrow="Siste analyse">
            {analyse.success ? (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>{analyse.data.coachAnalyse}</p>
            ) : (
              <>
                <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>Ingen analyse for denne økta</div>
                <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
                  {data.opptak
                    ? "Analysen lages av opptaket. Kjøres når opptaket er ferdig transkribert."
                    : "Analysen lages av opptaket. Denne økta har ikke noe opptak knyttet til seg ennå."}
                </p>
              </>
            )}
          </Kort>

          <Kort eyebrow="Transkript">
            {data.opptak?.transcript ? (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
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
