/**
 * AgencyOS · Sesjon-opptak — Train-lock (T9, 27.08.2026).
 *
 * Ingen egen Train-lock-fasit finnes for denne flaten (verifisert mot
 * SCREEN-INDEX.md/HANDOFF.md — ingen treff på "opptak"/"recording"). Portet
 * etter Klasse A/B-mønsteret («kjedelig er riktig», jf. AG-13/AG-18): samme
 * struktur og funksjonalitet som `AdminRecordingV2` (Paper), kun visningslag
 * byttet til TL.* — CLAUDE.md invariant 2.
 *
 * PII-vurdering (T9, se docs/natt/T9-DONE.md): lydopptak av coaching-økter er
 * PII-tungt. Samtykke-gaten (`hentLydSamtykkeKart`, kun status GITT tillater
 * opptak) og rollegaten (COACH/ADMIN, håndhevet i page.tsx) er UENDRET —
 * denne filen endrer KUN visning, aldri hvem som får se transkript/lyd eller
 * hvem som kan starte opptak. `retentionUntil` på `SessionRecording` styres
 * av datalaget, ikke UI.
 *
 * Statusfarger følger DESIGN-SYSTEM §1: «Fullført = TL.warm + hake» (DONE),
 * «Feil er caps danger, aldri fylt flate» (FAILED — tekst, ingen bakgrunn),
 * alt annet er caps mute uten fargekoding (RECORDING/PROCESSING/ABORTED).
 * TL.ok brukes ALDRI her — den er reservert «godkjent av coach»-merker.
 */

import { Check, CircleDot, Loader2, Mic } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { RecordingControls } from "@/components/admin/recording-controls";
import { RecordingAnalyzeButton } from "@/components/admin/recording-analyze-button";
import type { AnalyseResultat } from "@/lib/coaching-analysis";

type PipelineStatus = "done" | "active" | "idle";
type PipelineStep = { label: string; meta: string; status: PipelineStatus };

const STATUS_LABEL: Record<string, string> = {
  RECORDING: "Tar opp",
  PROCESSING: "Behandles",
  DONE: "Ferdig",
  FAILED: "Feilet",
  ABORTED: "Avbrutt",
};

/** De fem kategoriene i rekkefølgen coach leser dem. */
const KATEGORIER: { key: keyof AnalyseResultat; label: string; icon: string }[] = [
  { key: "teknisk", label: "Teknisk", icon: "wrench" },
  { key: "taktisk", label: "Taktisk", icon: "target" },
  { key: "mental", label: "Mental", icon: "lightbulb" },
  { key: "fysisk", label: "Fysisk", icon: "activity" },
  { key: "hjemmelekse", label: "Hjemmelekse", icon: "check-check" },
];

const IKKE_BERORT = "Ikke spesielt fokus denne økten.";

const wave: number[] = Array.from({ length: 120 }, (_, i) => {
  const h = 6 + Math.abs(Math.sin(i * 0.4) * 40) + Math.abs(Math.sin(i * 0.13) * 30);
  return Math.round(h);
});

function formatVarighet(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function CapsLabel({ children, color = TL.mute }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color }}>
      {children}
    </span>
  );
}

function Kort({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "16px 18px", ...style }}>
      {children}
    </div>
  );
}

function KpiTile({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
      <CapsLabel color={tone === "warn" ? TL.warn : TL.mute}>{label}</CapsLabel>
      <span style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function PipelineNode({ step }: { step: PipelineStep }) {
  const ferdig = step.status === "done";
  const aktiv = step.status === "active";
  const ringFarge = ferdig ? TL.warm : aktiv ? TL.text : TL.hair;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 92 }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: 48,
          height: 48,
          borderRadius: 9999,
          border: `2px solid ${ringFarge}`,
          background: TL.elev,
          color: ferdig ? TL.warm : aktiv ? TL.text : TL.mute,
        }}
      >
        {aktiv ? <Loader2 size={18} strokeWidth={1.5} className="animate-spin" /> : ferdig ? <Check size={18} strokeWidth={1.5} /> : <CircleDot size={18} strokeWidth={1.5} />}
      </div>
      <CapsLabel>{step.label}</CapsLabel>
      <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: step.status === "idle" ? TL.mute : TL.text }}>{step.meta}</div>
    </div>
  );
}

/** Analysekortet — selve leveransen fra økten. Ikke-berørte kategorier dempes. */
function AnalyseKort({ analyse, spillerNavn }: { analyse: AnalyseResultat; spillerNavn: string | null }) {
  return (
    <Kort>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <CapsLabel>Sammendrag</CapsLabel>
        {spillerNavn && <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{spillerNavn}</span>}
      </div>

      <p style={{ marginTop: 10, fontFamily: TL.font.sans, fontSize: 15, lineHeight: 1.6, color: TL.text }}>{analyse.oppsummering}</p>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {KATEGORIER.map(({ key, label, icon }) => {
          const tekst = analyse[key];
          const berort = tekst.trim() !== IKKE_BERORT;
          return (
            <div
              key={key}
              style={{
                borderRadius: 10,
                border: `1px solid ${TL.hair}`,
                background: berort ? TL.dim : "transparent",
                padding: "13px 15px",
                opacity: berort ? 1 : TL.opasitet.muted,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name={icon} size={14} style={{ color: berort ? TL.text : TL.mute }} />
                <CapsLabel color={berort ? TL.text : TL.mute}>{label}</CapsLabel>
              </div>
              <p style={{ marginTop: 7, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: berort ? TL.text : TL.mute, whiteSpace: "pre-wrap" }}>{tekst}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <div style={{ borderRadius: 10, border: `1px solid ${TL.hair}`, background: TL.dim, padding: "13px 15px" }}>
          <CapsLabel color={TL.text}>Coach-analyse</CapsLabel>
          <p style={{ marginTop: 7, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.text, whiteSpace: "pre-wrap" }}>{analyse.coachAnalyse}</p>
        </div>
        <div style={{ borderRadius: 10, border: `1px solid ${TL.hair}`, background: TL.dim, padding: "13px 15px" }}>
          <CapsLabel color={TL.text}>Neste økt</CapsLabel>
          <p style={{ marginTop: 7, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.text, whiteSpace: "pre-wrap" }}>{analyse.nesteOktAnbefaling}</p>
        </div>
      </div>
    </Kort>
  );
}

export type AdminRecordingRad = {
  id: string;
  dato: string;
  status: string;
  spillerNavn: string | null;
  varighetMin: number | null;
  audioUrl: string | null;
  transcript: string | null;
  analyse: AnalyseResultat | null;
};

export type AdminRecordingTLData = {
  coachNavn: string;
  harTranskriberingsNokkel: boolean;
  activeRecordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAtLabel: string | null;
  spillere: { id: string; navn: string; lydSamtykkeGitt: boolean }[];
  aktiv: {
    id: string;
    status: string;
    durationSec: number | null;
    transcript: string | null;
    spillerNavn: string | null;
    analyse: AnalyseResultat | null;
  } | null;
  pipeline: PipelineStep[];
  totalt: number;
  ferdig: number;
  behandles: number;
  feilet: number;
  recordings: AdminRecordingRad[];
  okt?: { sessionId: string; playerId: string; tittel: string } | null;
};

export function AdminRecordingTrainLock({ data }: { data: AdminRecordingTLData }) {
  const aktiv = data.aktiv;
  const aktivProsesserer = !!aktiv && aktiv.status === "PROCESSING";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <CapsLabel>AgencyOS · Opptak</CapsLabel>
        <h1 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: TL.storrelse.tittel, fontWeight: 700, color: TL.text }}>Lytter mens du coacher</h1>
        <p style={{ marginTop: 6, maxWidth: 620, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
          Velg spiller og ta opp økten. Når du avslutter, transkriberes lyden og du får et strukturert sammendrag med hjemmelekse og anbefaling til neste økt.
        </p>
      </div>

      {!data.harTranskriberingsNokkel && (
        <Kort style={{ boxShadow: `inset 0 0 0 1px ${TL.warnHair}`, background: TL.dim }}>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.warn }}>Transkribering ikke konfigurert</div>
          <p style={{ marginTop: 6, fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.55 }}>
            Automatisk transkripsjon krever en{" "}
            <code style={{ fontFamily: TL.font.mono, fontSize: 12, background: TL.elev, borderRadius: 4, padding: "2px 5px" }}>OPENAI_API_KEY</code> i .env.local. Inntil videre kan opptak
            lastes opp manuelt og transkripsjon limes inn for hånd.
          </p>
        </Kort>
      )}

      {data.spillere.length === 0 && (
        <Kort style={{ boxShadow: `inset 0 0 0 1px ${TL.warnHair}`, background: TL.dim }}>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.warn }}>Ingen spillere registrert</div>
          <p style={{ marginTop: 6, fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.55 }}>
            Opptak knyttes til en spiller for å gi riktig kontekst i sammendraget. Registrer en spiller i stallen først.
          </p>
        </Kort>
      )}

      <RecordingControls
        recordingId={data.activeRecordingId}
        recoveryRecordingId={data.recoveryRecordingId}
        recoveryStartedAt={data.recoveryStartedAtLabel}
        spillere={data.spillere}
        okt={data.okt ?? null}
        topbar={
          <>
            {aktivProsesserer ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, boxShadow: `inset 0 0 0 1px ${TL.warnHair}`, padding: "5px 11px", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color: TL.warn }}>
                <Loader2 size={11} className="animate-spin" />
                Behandler {formatVarighet(aktiv?.durationSec ?? null)}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid ${TL.hair}`, background: TL.elev, padding: "5px 11px", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color: TL.mute }}>
                <Icon name="circle" size={12} />
                Ingen aktiv økt
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.text }}>
              <span style={{ display: "grid", placeItems: "center", width: 20, height: 20, borderRadius: 9999, background: TL.avatar, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.onAvatar }}>
                {(data.coachNavn || "?").trim().charAt(0).toUpperCase()}
              </span>
              <span style={{ fontWeight: 600 }}>{data.coachNavn}</span>
              <span style={{ color: TL.mute }}>— coach</span>
            </div>
          </>
        }
        stage={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "32px 16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center", gap: 16 }}>
              {data.pipeline.map((step) => (
                <PipelineNode key={step.label} step={step} />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 96, width: "100%", maxWidth: 720, overflow: "hidden" }}>
              {wave.map((h, i) => (
                <span key={i} style={{ display: "block", width: 4, borderRadius: 9999, height: Math.round(h * 0.7), background: TL.mute, opacity: aktivProsesserer ? 0.6 + (i % 5) * 0.08 : 0.25 + (i % 5) * 0.08, flexShrink: 0 }} />
              ))}
            </div>

            <div style={{ width: "100%", maxWidth: 720, minHeight: 60, padding: "0 8px", fontFamily: TL.font.mono, fontSize: 13, lineHeight: 1.6 }}>
              {aktiv?.transcript ? (
                <div style={{ maxHeight: 140, overflowY: "auto", color: TL.text }}>
                  {aktiv.transcript
                    .split(/\n+/)
                    .slice(-4)
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                </div>
              ) : (
                <div style={{ fontStyle: "italic", color: TL.mute, textAlign: "center" }}>Transkripsjon vises her når opptaket er behandlet …</div>
              )}
            </div>
          </div>
        }
      />

      {aktiv?.analyse && <AnalyseKort analyse={aktiv.analyse} spillerNavn={aktiv.spillerNavn} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <KpiTile label="Totalt opptak" value={String(data.totalt)} />
        <KpiTile label="Ferdig" value={String(data.ferdig)} />
        <KpiTile label="Behandles" value={String(data.behandles)} />
        <KpiTile label="Feilet" value={String(data.feilet)} tone={data.feilet > 0 ? "warn" : undefined} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CapsLabel color={TL.text}>Historikk · siste 30 opptak</CapsLabel>
          <span style={{ borderRadius: 9999, background: TL.dim, padding: "2px 8px", fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>{data.recordings.length}</span>
          <span style={{ flex: 1, height: 1, background: TL.hair }} />
        </div>

        {data.recordings.length === 0 ? (
          <EmptyState icon={Mic} titleItalic="Ingen opptak" titleTrail="registrert" sub="Opptak fra coaching-økter dukker opp her når du har tatt opp din første økt." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recordings.map((r) => {
              const statusFarge = r.status === "DONE" ? TL.warm : r.status === "FAILED" ? TL.danger : TL.mute;
              return (
                <Kort key={r.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: r.spillerNavn ? TL.text : TL.mute }}>{r.spillerNavn ?? "Ukjent spiller"}</span>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{r.dato}</span>
                    <CapsLabel color={statusFarge}>{STATUS_LABEL[r.status] ?? r.status}</CapsLabel>
                    {r.varighetMin !== null && <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{r.varighetMin} min</span>}
                    {(r.status === "PROCESSING" || r.status === "FAILED") && <RecordingAnalyzeButton recordingId={r.id} harTranskripsjon={!!r.transcript && r.transcript.trim().length > 0} />}
                  </div>

                  {r.analyse && (
                    <>
                      <p style={{ marginTop: 10, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.text }}>{r.analyse.oppsummering}</p>
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: "pointer" }}>
                          <CapsLabel color={TL.text}>Vis hele sammendraget</CapsLabel>
                        </summary>
                        <div style={{ marginTop: 10 }}>
                          <AnalyseKort analyse={r.analyse} spillerNavn={r.spillerNavn} />
                        </div>
                      </details>
                    </>
                  )}

                  {r.transcript && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: "pointer" }}>
                        <CapsLabel>Vis transkripsjon</CapsLabel>
                      </summary>
                      <pre style={{ marginTop: 8, maxHeight: 320, overflow: "auto", whiteSpace: "pre-wrap", background: TL.dim, borderRadius: 8, padding: 14, fontFamily: TL.font.mono, fontSize: 12, color: TL.text }}>{r.transcript}</pre>
                    </details>
                  )}
                </Kort>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
