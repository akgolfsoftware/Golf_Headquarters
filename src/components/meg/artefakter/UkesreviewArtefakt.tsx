"use client";

/**
 * Ukesreview-artefaktet — ukas fasit. Fasit: jarvis/meg-ukesreview.html
 * (SLA-KPI-er, token-forbruk, saker per kanal som flate barer, kalenderavvik).
 *
 * Ren aggregat-statistikk, ingen AI-tekst — se UkesreviewData sin doc-
 * kommentar i types.ts for hvorfor «tre ting som gledet»/«til neste uke»
 * og fasitens «118,4 M av 150 M tokens»-budsjett er utelatt. Barene er
 * fasitens egen enkle flate stil (ingen ny chart-komponent — designprompten
 * ber uttrykkelig om å ikke dikte opp chart-stil den ikke finner belegg for).
 */
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { SakKanal } from "@/lib/jarvis/types";
import type { UkesreviewData } from "@/lib/jarvis/types";

const KANAL_LABEL: Record<SakKanal, string> = {
  [SakKanal.EPOST]: "E-post",
  [SakKanal.SMS]: "SMS",
  [SakKanal.IMESSAGE]: "iMessage",
  [SakKanal.TELEGRAM]: "Telegram",
  [SakKanal.ANROP]: "Anrop",
  [SakKanal.KALENDER]: "Kalender",
  [SakKanal.TASK]: "Oppgave",
  [SakKanal.LYD]: "Lydopptak",
};

function KpiKort({ tall, label, delta }: { tall: string; label: string; delta: string | null }) {
  return (
    <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rTag, padding: "12px 14px" }}>
      <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: T.fg }}>{tall}</div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.07em", textTransform: "uppercase", color: T.mut, marginTop: 2 }}>
        {label}
      </div>
      {delta && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.up, marginTop: 2 }}>{delta}</div>}
    </div>
  );
}

export function UkesreviewArtefakt({ data }: { data: UkesreviewData }) {
  const { slaEtterlevelse, sakerPerKanal, aiKost } = data;
  const periodeLabel = `uke ${data.ukenummer} · ${new Date(data.periodeStart).toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" })}`;
  const maksKanal = Math.max(1, ...sakerPerKanal.map((k) => k.antall));
  const delta =
    slaEtterlevelse.prosentUnderFrist != null && slaEtterlevelse.prosentUnderFristForrigeUke != null
      ? Math.round((slaEtterlevelse.prosentUnderFrist - slaEtterlevelse.prosentUnderFristForrigeUke) * 10) / 10
      : null;

  return (
    <div data-od-id="panel-ukesreview" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginBottom: 12 }}>{periodeLabel}</div>

      <div data-od-id="panel-sla-uke" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <KpiKort
          tall={slaEtterlevelse.prosentUnderFrist != null ? `${slaEtterlevelse.prosentUnderFrist} %` : "—"}
          label={`under 6t · ${slaEtterlevelse.avgjorteMedFrist} saker`}
          delta={delta != null ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)} pp vs forrige uke` : null}
        />
        <KpiKort
          tall={slaEtterlevelse.medianSvartidMin != null ? `${Math.floor(slaEtterlevelse.medianSvartidMin / 60)}t ${slaEtterlevelse.medianSvartidMin % 60}m` : "—"}
          label="median svartid"
          delta={null}
        />
      </div>

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>AI-kostnad denne uken</h2>
      {aiKost.antallKall === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginBottom: 16 }}>Ingen AI-kostnad registrert for Jarvis denne uken.</p>
      ) : (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, marginBottom: 16 }}>
          <span style={{ fontFamily: T.mono }}>
            {(aiKost.inputTokens + aiKost.outputTokens).toLocaleString("nb-NO")} tokens
          </span>{" "}
          over <span style={{ fontFamily: T.mono }}>{aiKost.antallKall}</span> kall
          {aiKost.costUsd != null && (
            <>
              {" · "}
              <span style={{ fontFamily: T.mono }}>${aiKost.costUsd.toFixed(2)}</span>
            </>
          )}
        </p>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>Saker per kanal</h2>
      {sakerPerKanal.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginBottom: 16 }}>Ingen saker mottatt denne uken.</p>
      ) : (
        <div data-od-id="panel-kanalfordeling" style={{ marginBottom: 16 }}>
          {sakerPerKanal.map(({ kanal, antall }) => (
            <div key={kanal} style={{ display: "grid", gridTemplateColumns: "88px 1fr 32px", gap: 8, alignItems: "center", padding: "3px 0", fontSize: 12.5, fontFamily: T.ui, color: T.fg }}>
              <span>{KANAL_LABEL[kanal]}</span>
              <span style={{ height: 8, background: T.panel2, borderRadius: T.rPill, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${(antall / maksKanal) * 100}%`, background: T.info, borderRadius: T.rPill }} />
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{antall}</span>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>Kalenderavvik fanget</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", border: `1px dashed ${T.border}`, borderRadius: T.rTag, padding: "8px 10px" }}>
        <Icon name="shield-check" size={14} strokeWidth={1.8} style={{ color: T.mut, flex: "none", marginTop: 1 }} />
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
          Vaktens funn lagres ikke, så en ukes-telling kan ikke gjøres ærlig — dette står som 0 inntil funnene
          persisteres. Aktive avvik akkurat nå ser du i Kalendervakt-artefaktet.
        </span>
      </div>
    </div>
  );
}
