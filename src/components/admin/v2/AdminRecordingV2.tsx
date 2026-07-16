/**
 * AgencyOS · Sesjon-opptak — v2 (retning C «Presis»). Erstatter hand-Tailwind
 * med v2-primitiver (Kort/Caps/Tittel/KpiFlis). `RecordingControls` (ekte
 * MediaRecorder-opptak/wake-lock/batteri-varsel) og `RecordingAnalyzeButton`
 * er URØRT — kun topbar/stage/historikk-visningen restyles.
 *
 * Rettet en reell bug samtidig: varselbanneret sjekket `DEEPGRAM_API_KEY`,
 * men selve transkriberingen (`src/lib/transcribe.ts`) bruker OpenAI Whisper
 * og gates på `OPENAI_API_KEY` — banneret sjekket altså feil variabel og
 * kunne både vise falskt varsel og unnlate å varsle ved reell feilkonfig.
 * Copy endret fra "Deepgram" til nøytralt "talegjenkjenning" siden dette er
 * et kjent navn-vs-kode-avvik (Deepgram er aldri integrert), ikke avklart
 * med Anders om produktteksten skal si Whisper i stedet.
 */

import { Check, CircleDot, Loader2, Mic, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Caps, Tittel, Kort, KpiFlis } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { RecordingControls } from "@/app/admin/(legacy)/recording/recording-controls";
import { RecordingAnalyzeButton } from "@/components/admin/recording-analyze-button";

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

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function PipelineNode({ step }: { step: PipelineStep }) {
  const on = step.status === "active" || step.status === "done";
  const IconCmp: LucideIcon = step.status === "active" ? Loader2 : step.status === "done" ? Check : CircleDot;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 200 }}>
      <div
        style={{
          display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: 9999, border: `2px solid ${on ? T.lime : T.border}`,
          background: on ? `color-mix(in srgb, ${T.lime} 12%, transparent)` : T.panel,
          color: on ? T.lime : T.mut,
        }}
      >
        <IconCmp size={20} strokeWidth={1.5} className={step.status === "active" ? "animate-spin" : undefined} />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
        {step.label}
      </div>
      <div style={{ fontSize: 12, color: step.status === "idle" ? T.mut : T.lime }}>{step.meta}</div>
    </div>
  );
}

export type AdminRecordingRad = {
  id: string;
  dato: string;
  status: string;
  varighetMin: number | null;
  audioUrl: string | null;
  transcript: string | null;
};

export type AdminRecordingV2Data = {
  coachNavn: string;
  harTranskriberingsNokkel: boolean;
  activeRecordingId: string | null;
  recoveryRecordingId: string | null;
  recoveryStartedAtLabel: string | null;
  aktiv: { id: string; status: string; durationSec: number | null; transcript: string | null } | null;
  pipeline: PipelineStep[];
  totalt: number;
  ferdig: number;
  behandles: number;
  feilet: number;
  recordings: AdminRecordingRad[];
};

export function AdminRecordingV2({ data }: { data: AdminRecordingV2Data }) {
  const harAktivt = !!data.aktiv;
  const aktivProsesserer = harAktivt && data.aktiv!.status === "PROCESSING";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Opptak</Caps>
        <div style={{ marginTop: 8 }}>
          <Tittel em="mens du coacher.">Lytter</Tittel>
        </div>
        <p style={{ marginTop: 6, maxWidth: 620, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55 }}>
          Last opp lyd-fil og talegjenkjenning transkriberer i bakgrunnen. Pipeline trekker ut
          nøkkelpunkter til slutt og foreslår oppfølging.
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

      <RecordingControls
        recordingId={data.activeRecordingId}
        recoveryRecordingId={data.recoveryRecordingId}
        recoveryStartedAt={data.recoveryStartedAtLabel}
        topbar={
          <>
            {aktivProsesserer ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "5px 11px", fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.down }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.down }} />
                REC {formatVarighet(data.aktiv!.durationSec ?? null)}
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
          <div style={{ position: "relative", display: "grid", gridTemplateRows: "auto auto 1fr", alignItems: "start", gap: 32, minHeight: 480, padding: "48px 32px 128px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
              {data.pipeline.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <PipelineNode step={step} />
                  {i < data.pipeline.length - 1 && (
                    <div style={{ width: 56, height: 1, background: data.pipeline[i].status === "done" ? T.lime : T.border }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 140, width: "100%", maxWidth: 720 }}>
              {wave.map((h, i) => (
                <span
                  key={i}
                  style={{
                    display: "block", width: 4, borderRadius: 9999, height: h,
                    background: aktivProsesserer ? T.lime : T.mut,
                    opacity: 0.4 + (i % 5) * 0.12,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                pointerEvents: "none", position: "absolute", bottom: 104, left: "50%", transform: "translateX(-50%)",
                width: 720, maxWidth: "90%", maxHeight: 200, overflow: "hidden", padding: "16px 24px",
                fontFamily: T.mono, fontSize: 13, lineHeight: 1.6,
                maskImage: "linear-gradient(to top, #000 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, #000 70%, transparent 100%)",
              }}
            >
              {data.aktiv?.transcript ? (
                <div style={{ color: T.fg }}>
                  {data.aktiv.transcript
                    .split(/\n+/)
                    .slice(-4)
                    .map((line, i) => (
                      <div key={i} style={{ color: T.mut }}>
                        {line}
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{ fontStyle: "italic", color: T.mut }}>Transkripsjon vises her når opptak starter …</div>
              )}
            </div>
          </div>
        }
      />

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
          <EmptyState icon={Mic} titleItalic="Ingen opptak" titleTrail="registrert" sub="Opptak fra coaching-økter dukker opp her etter opplasting." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recordings.map((r) => (
              <Kort key={r.id} pad="14px 16px">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
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
                  {r.audioUrl ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{r.audioUrl}</span>
                  ) : (
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontStyle: "italic", color: T.mut }}>Lyd ikke klar</span>
                  )}
                  {r.status === "PROCESSING" && (
                    <RecordingAnalyzeButton recordingId={r.id} harTranskripsjon={!!r.transcript && r.transcript.trim().length > 0} />
                  )}
                </div>
                {r.transcript && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: "pointer", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
                      Vis transkripsjon
                    </summary>
                    <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", background: T.panel2, borderRadius: 8, padding: 14, fontFamily: T.mono, fontSize: 12, color: T.fg }}>{r.transcript}</pre>
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
