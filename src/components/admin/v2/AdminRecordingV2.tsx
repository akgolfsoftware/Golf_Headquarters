/**
 * AgencyOS · Sesjon-opptak — v2. Flyttet ut av (legacy) 2026-07-27.
 *
 * Viser hele kjeden: velg spiller → ta opp → transkriber → AI-sammendrag.
 * Sammendraget (5 kategorier + coach-analyse + hjemmelekse + neste økt) er
 * hovedleveransen og vises på skjermen — tidligere lå den kun i databasen og
 * Notion, mens skjermen bare viste rå transkripsjon.
 *
 * `RecordingControls` eier selve opptaket (MediaRecorder/wake-lock/batteri),
 * `RecordingAnalyzeButton` er fallback når den automatiske kjeden feiler.
 */

import { Check, CircleDot, Loader2, Mic, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Caps, Tittel, Kort, KpiFlis } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
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

const STATUS_TONE: Record<string, string> = {
  RECORDING: T.down,
  PROCESSING: T.warn,
  DONE: T.up,
  FAILED: T.down,
  ABORTED: T.mut,
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

function PipelineNode({ step }: { step: PipelineStep }) {
  const on = step.status === "active" || step.status === "done";
  const IconCmp: LucideIcon = step.status === "active" ? Loader2 : step.status === "done" ? Check : CircleDot;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 92 }}>
      <div
        style={{
          display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 9999, border: `2px solid ${on ? T.lime : T.border}`,
          background: on ? `color-mix(in srgb, ${T.lime} 12%, transparent)` : T.panel,
          color: on ? T.lime : T.mut,
        }}
      >
        <IconCmp size={18} strokeWidth={1.5} className={step.status === "active" ? "animate-spin" : undefined} />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut, textAlign: "center" }}>
        {step.label}
      </div>
      <div style={{ fontSize: 12, color: step.status === "idle" ? T.mut : T.lime }}>{step.meta}</div>
    </div>
  );
}

/**
 * Analysekortet — selve leveransen fra økten. Kategorier som ikke ble berørt
 * dempes, så coach ser med én gang hva økten faktisk handlet om.
 */
function AnalyseKort({ analyse, spillerNavn }: { analyse: AnalyseResultat; spillerNavn: string | null }) {
  return (
    <Kort>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.lime }}>
          Sammendrag
        </span>
        {spillerNavn && (
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{spillerNavn}</span>
        )}
      </div>

      <p style={{ marginTop: 10, fontFamily: T.ui, fontSize: 15, lineHeight: 1.6, color: T.fg }}>
        {analyse.oppsummering}
      </p>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {KATEGORIER.map(({ key, label, icon }) => {
          const tekst = analyse[key];
          const berort = tekst.trim() !== IKKE_BERORT;
          return (
            <div
              key={key}
              style={{
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: berort ? T.panel2 : "transparent",
                padding: "13px 15px",
                opacity: berort ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name={icon} size={14} style={{ color: berort ? T.lime : T.mut }} />
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: berort ? T.fg : T.mut }}>
                  {label}
                </span>
              </div>
              <p style={{ marginTop: 7, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: berort ? T.fg2 : T.mut, whiteSpace: "pre-wrap" }}>
                {tekst}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "13px 15px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg }}>
            Coach-analyse
          </div>
          <p style={{ marginTop: 7, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg2, whiteSpace: "pre-wrap" }}>
            {analyse.coachAnalyse}
          </p>
        </div>
        <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "13px 15px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg }}>
            Neste økt
          </div>
          <p style={{ marginTop: 7, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg2, whiteSpace: "pre-wrap" }}>
            {analyse.nesteOktAnbefaling}
          </p>
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

export type AdminRecordingV2Data = {
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
};

export function AdminRecordingV2({ data }: { data: AdminRecordingV2Data }) {
  const aktiv = data.aktiv;
  const aktivProsesserer = !!aktiv && aktiv.status === "PROCESSING";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Opptak</Caps>
        <div style={{ marginTop: 8 }}>
          <Tittel em="mens du coacher.">Lytter</Tittel>
        </div>
        <p style={{ marginTop: 6, maxWidth: 620, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55 }}>
          Velg spiller og ta opp økten. Når du avslutter, transkriberes lyden og du får et
          strukturert sammendrag med hjemmelekse og anbefaling til neste økt.
        </p>
      </div>

      {!data.harTranskriberingsNokkel && (
        <Kort style={{ borderColor: `color-mix(in srgb, ${T.warn} 40%, transparent)`, background: `color-mix(in srgb, ${T.warn} 6%, transparent)` }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Transkribering ikke konfigurert</div>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55 }}>
            Automatisk transkripsjon krever en <code style={{ fontFamily: T.mono, fontSize: 12, background: T.panel2, borderRadius: 4, padding: "2px 5px" }}>OPENAI_API_KEY</code> i
            .env.local. Inntil videre kan opptak lastes opp manuelt og transkripsjon limes inn for hånd.
          </p>
        </Kort>
      )}

      {data.spillere.length === 0 && (
        <Kort style={{ borderColor: `color-mix(in srgb, ${T.warn} 40%, transparent)`, background: `color-mix(in srgb, ${T.warn} 6%, transparent)` }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen spillere registrert</div>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55 }}>
            Opptak knyttes til en spiller for å gi riktig kontekst i sammendraget. Registrer en
            spiller i stallen først.
          </p>
        </Kort>
      )}

      <RecordingControls
        recordingId={data.activeRecordingId}
        recoveryRecordingId={data.recoveryRecordingId}
        recoveryStartedAt={data.recoveryStartedAtLabel}
        spillere={data.spillere}
        topbar={
          <>
            {aktivProsesserer ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.warn} 35%, transparent)`, background: `color-mix(in srgb, ${T.warn} 10%, transparent)`, padding: "5px 11px", fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.warn }}>
                <Loader2 size={11} className="animate-spin" />
                Behandler {formatVarighet(aktiv?.durationSec ?? null)}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel, padding: "5px 11px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
                <Icon name="circle" size={12} />
                Ingen aktiv økt
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.fg }}>
              <span style={{ display: "grid", placeItems: "center", width: 20, height: 20, borderRadius: 9999, background: T.lime, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.onLime }}>
                {(data.coachNavn || "?").trim().charAt(0).toUpperCase()}
              </span>
              <span style={{ fontWeight: 600 }}>{data.coachNavn}</span>
              <span style={{ color: T.mut }}>— coach</span>
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
                <span
                  key={i}
                  style={{
                    display: "block", width: 4, borderRadius: 9999, height: Math.round(h * 0.7),
                    background: aktivProsesserer ? T.lime : T.mut,
                    opacity: 0.4 + (i % 5) * 0.12,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>

            <div style={{ width: "100%", maxWidth: 720, minHeight: 60, padding: "0 8px", fontFamily: T.mono, fontSize: 13, lineHeight: 1.6 }}>
              {aktiv?.transcript ? (
                <div style={{ maxHeight: 140, overflowY: "auto", color: T.fg2 }}>
                  {aktiv.transcript
                    .split(/\n+/)
                    .slice(-4)
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                </div>
              ) : (
                <div style={{ fontStyle: "italic", color: T.mut, textAlign: "center" }}>
                  Transkripsjon vises her når opptaket er behandlet …
                </div>
              )}
            </div>
          </div>
        }
      />

      {aktiv?.analyse && <AnalyseKort analyse={aktiv.analyse} spillerNavn={aktiv.spillerNavn} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <KpiFlis label="Totalt opptak" value={String(data.totalt)} />
        <KpiFlis label="Ferdig" value={String(data.ferdig)} />
        <KpiFlis label="Behandles" value={String(data.behandles)} tint={data.behandles > 0} />
        <KpiFlis label="Feilet" value={String(data.feilet)} varsle={data.feilet > 0} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg }}>
            Historikk · siste 30 opptak
          </span>
          <span style={{ borderRadius: 9999, background: T.panel2, padding: "2px 8px", fontFamily: T.mono, fontSize: 9, color: T.mut }}>{data.recordings.length}</span>
          <span style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {data.recordings.length === 0 ? (
          <EmptyState icon={Mic} titleItalic="Ingen opptak" titleTrail="registrert" sub="Opptak fra coaching-økter dukker opp her når du har tatt opp din første økt." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recordings.map((r) => (
              <Kort key={r.id} pad="14px 16px">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: r.spillerNavn ? T.fg : T.mut }}>
                    {r.spillerNavn ?? "Ukjent spiller"}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{r.dato}</span>
                  <span
                    style={{
                      borderRadius: 9999, padding: "2px 9px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
                      color: STATUS_TONE[r.status] ?? T.mut,
                      background: `color-mix(in srgb, ${STATUS_TONE[r.status] ?? T.mut} 14%, transparent)`,
                    }}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  {r.varighetMin !== null && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{r.varighetMin} min</span>}
                  {(r.status === "PROCESSING" || r.status === "FAILED") && (
                    <RecordingAnalyzeButton recordingId={r.id} harTranskripsjon={!!r.transcript && r.transcript.trim().length > 0} />
                  )}
                </div>

                {r.analyse && (
                  <>
                    <p style={{ marginTop: 10, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg }}>
                      {r.analyse.oppsummering}
                    </p>
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: "pointer", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.lime }}>
                        Vis hele sammendraget
                      </summary>
                      <div style={{ marginTop: 10 }}>
                        <AnalyseKort analyse={r.analyse} spillerNavn={r.spillerNavn} />
                      </div>
                    </details>
                  </>
                )}

                {r.transcript && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
                      Vis transkripsjon
                    </summary>
                    <pre style={{ marginTop: 8, maxHeight: 320, overflow: "auto", whiteSpace: "pre-wrap", background: T.panel2, borderRadius: 8, padding: 14, fontFamily: T.mono, fontSize: 12, color: T.fg }}>{r.transcript}</pre>
                  </details>
                )}
              </Kort>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
