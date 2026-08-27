/**
 * AgencyOS · Sesjon-opptak — Train-lock (T9, 27.08.2026).
 *
 * Viser hele kjeden: velg spiller → ta opp → transkriber → AI-sammendrag.
 * Sammendraget (5 kategorier + coach-analyse + hjemmelekse + neste økt) er
 * hovedleveransen og vises på skjermen.
 *
 * PII: lydsamtykke håndheves i page.tsx (`hentLydSamtykkeKart`) FØR data
 * når hit — Start-knappen er skjult per spiller uten GITT samtykke
 * (`RecordingControls`), og serveren avviser uansett. Uendret av denne
 * porten.
 *
 * Skopepresisering (T9, ingen egen fasit-ID for denne PII-tunge flaten,
 * §0 punkt 6 i D-LYS-OG-5T-BESLUTNING.md): kun skallet her — topptekst,
 * varsler, sammendragskort, KPI-rad, historikk — er portet til
 * `--tl-*`/TL. `RecordingControls` (MediaRecorder/wake-lock/batteri,
 * 773 linjer) og `RecordingAnalyzeButton` er IKKE rørt: de er hardware-nær
 * (mic-opptak) og styrer seg selv med Tailwinds semantiske
 * card/border/primary-klasser (en TREDJE, eldre tokenfamilie — verken
 * T.* eller TL.*). Full TL-port av dem er en egen, mindre oppfølgingsøkt
 * — se docs/natt/T9-DONE.md. Ingen forretningslogikk er endret her.
 */

import { Check, CircleDot, Loader2, type LucideIcon } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlBadge, TlCaps, TlInspektorKpi, TlKort, TlTomTilstand, type TlBadgeTone } from "./oppsett/tl-kit";
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

/** Ingen generell fargekoding (train-lock.ts §Signal) — kun `fare` for reell feiltilstand. */
const STATUS_TONE: Record<string, TlBadgeTone> = {
  RECORDING: "nøytral",
  PROCESSING: "varsel",
  DONE: "nøytral",
  FAILED: "fare",
  ABORTED: "nøytral",
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
          display: "grid",
          placeItems: "center",
          width: 48,
          height: 48,
          borderRadius: 9999,
          boxShadow: `inset 0 0 0 2px ${on ? TL.text : TL.hair}`,
          background: on ? TL.dim : "transparent",
          color: on ? TL.text : TL.mute,
        }}
      >
        <IconCmp size={18} strokeWidth={1.5} className={step.status === "active" ? "animate-spin" : undefined} />
      </div>
      <TlCaps size={10}>{step.label}</TlCaps>
      <div style={{ fontSize: 12, color: step.status === "idle" ? TL.mute : TL.text }}>{step.meta}</div>
    </div>
  );
}

/**
 * Analysekortet — selve leveransen fra økten. Kategorier som ikke ble berørt
 * dempes, så coach ser med én gang hva økten faktisk handlet om.
 */
function AnalyseKort({ analyse, spillerNavn }: { analyse: AnalyseResultat; spillerNavn: string | null }) {
  return (
    <TlKort>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <TlCaps>Sammendrag</TlCaps>
        {spillerNavn && <span style={{ fontSize: 13, fontWeight: 600, color: TL.text }}>{spillerNavn}</span>}
      </div>

      <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: TL.text }}>{analyse.oppsummering}</p>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {KATEGORIER.map(({ key, label, icon }) => {
          const tekst = analyse[key];
          const berort = tekst.trim() !== IKKE_BERORT;
          return (
            <div
              key={key}
              style={{
                borderRadius: 10,
                boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                background: berort ? TL.dim : "transparent",
                padding: "13px 15px",
                opacity: berort ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name={icon} size={14} style={{ color: berort ? TL.text : TL.mute }} />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: berort ? TL.text : TL.mute }}>
                  {label}
                </span>
              </div>
              <p style={{ marginTop: 7, fontSize: 13, lineHeight: 1.55, color: berort ? TL.mute : TL.mute, whiteSpace: "pre-wrap" }}>{tekst}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <div style={{ borderRadius: 10, boxShadow: `inset 0 0 0 1px ${TL.hair}`, background: TL.dim, padding: "13px 15px" }}>
          <TlCaps size={10}>Coach-analyse</TlCaps>
          <p style={{ marginTop: 7, fontSize: 13, lineHeight: 1.55, color: TL.mute, whiteSpace: "pre-wrap" }}>{analyse.coachAnalyse}</p>
        </div>
        <div style={{ borderRadius: 10, boxShadow: `inset 0 0 0 1px ${TL.hair}`, background: TL.dim, padding: "13px 15px" }}>
          <TlCaps size={10}>Neste økt</TlCaps>
          <p style={{ marginTop: 7, fontSize: 13, lineHeight: 1.55, color: TL.mute, whiteSpace: "pre-wrap" }}>{analyse.nesteOktAnbefaling}</p>
        </div>
      </div>
    </TlKort>
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
  /** Satt når opptaket startes fra en treningsøkt (?okt=) — se RecordingControls. */
  okt?: { sessionId: string; playerId: string; tittel: string } | null;
};

export function AdminRecordingV2({ data }: { data: AdminRecordingV2Data }) {
  const aktiv = data.aktiv;
  const aktivProsesserer = !!aktiv && aktiv.status === "PROCESSING";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <TlCaps>AgencyOS · Opptak</TlCaps>
        <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Lytter mens du coacher</h1>
        <p style={{ marginTop: 6, maxWidth: 620, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
          Velg spiller og ta opp økten. Når du avslutter, transkriberes lyden og du får et
          strukturert sammendrag med hjemmelekse og anbefaling til neste økt.
        </p>
      </div>

      {!data.harTranskriberingsNokkel && (
        <TlKort>
          <div style={{ fontWeight: 700, fontSize: 15, color: TL.text }}>Transkribering ikke konfigurert</div>
          <p style={{ marginTop: 6, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
            Automatisk transkripsjon krever en{" "}
            <code style={{ fontFamily: TL.font.mono, fontSize: 12, background: TL.dim, borderRadius: 4, padding: "2px 5px" }}>OPENAI_API_KEY</code> i
            .env.local. Inntil videre kan opptak lastes opp manuelt og transkripsjon limes inn for hånd.
          </p>
        </TlKort>
      )}

      {data.spillere.length === 0 && (
        <TlKort>
          <div style={{ fontWeight: 700, fontSize: 15, color: TL.text }}>Ingen spillere registrert</div>
          <p style={{ marginTop: 6, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
            Opptak knyttes til en spiller for å gi riktig kontekst i sammendraget. Registrer en
            spiller i stallen først.
          </p>
        </TlKort>
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
              <TlBadge tone="varsel">
                <Loader2 size={11} className="animate-spin" style={{ marginRight: 6 }} />
                Behandler {formatVarighet(aktiv?.durationSec ?? null)}
              </TlBadge>
            ) : (
              <TlBadge tone="nøytral">
                <Icon name="circle" size={12} style={{ marginRight: 6 }} />
                Ingen aktiv økt
              </TlBadge>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.text }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: TL.avatar,
                  color: TL.onAvatar,
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
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
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 4,
                    borderRadius: 9999,
                    height: Math.round(h * 0.7),
                    background: aktivProsesserer ? TL.text : TL.mute,
                    opacity: 0.4 + (i % 5) * 0.12,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>

            <div style={{ width: "100%", maxWidth: 720, minHeight: 60, padding: "0 8px", fontFamily: TL.font.mono, fontSize: 13, lineHeight: 1.6 }}>
              {aktiv?.transcript ? (
                <div style={{ maxHeight: 140, overflowY: "auto", color: TL.mute }}>
                  {aktiv.transcript
                    .split(/\n+/)
                    .slice(-4)
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                </div>
              ) : (
                <div style={{ fontStyle: "italic", color: TL.mute, textAlign: "center" }}>
                  Transkripsjon vises her når opptaket er behandlet …
                </div>
              )}
            </div>
          </div>
        }
      />

      {aktiv?.analyse && <AnalyseKort analyse={aktiv.analyse} spillerNavn={aktiv.spillerNavn} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <TlInspektorKpi label="Totalt opptak" verdi={String(data.totalt)} sub="" />
        <TlInspektorKpi label="Ferdig" verdi={String(data.ferdig)} sub="" />
        <TlInspektorKpi label="Behandles" verdi={String(data.behandles)} sub="" />
        <TlInspektorKpi label="Feilet" verdi={String(data.feilet)} sub="" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TlCaps>Historikk · siste 30 opptak</TlCaps>
          <span style={{ borderRadius: 9999, background: TL.dim, padding: "2px 8px", fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
            {data.recordings.length}
          </span>
          <span style={{ flex: 1, height: 1, background: TL.hair }} />
        </div>

        {data.recordings.length === 0 ? (
          <div style={{ background: TL.elev, borderRadius: TL.radius.card }}>
            <TlTomTilstand icon="mic" title="Ingen opptak registrert" sub="Opptak fra coaching-økter dukker opp her når du har tatt opp din første økt." />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recordings.map((r) => (
              <TlKort key={r.id} pad="14px 16px">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.spillerNavn ? TL.text : TL.mute }}>{r.spillerNavn ?? "Ukjent spiller"}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{r.dato}</span>
                  <TlBadge tone={STATUS_TONE[r.status] ?? "nøytral"}>{STATUS_LABEL[r.status] ?? r.status}</TlBadge>
                  {r.varighetMin !== null && <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{r.varighetMin} min</span>}
                  {(r.status === "PROCESSING" || r.status === "FAILED") && (
                    <RecordingAnalyzeButton recordingId={r.id} harTranskripsjon={!!r.transcript && r.transcript.trim().length > 0} />
                  )}
                </div>

                {r.analyse && (
                  <>
                    <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: TL.text }}>{r.analyse.oppsummering}</p>
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.text }}>
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
                    <summary style={{ cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
                      Vis transkripsjon
                    </summary>
                    <pre style={{ marginTop: 8, maxHeight: 320, overflow: "auto", whiteSpace: "pre-wrap", background: TL.dim, borderRadius: 8, padding: 14, fontFamily: TL.font.mono, fontSize: 12, color: TL.text }}>
                      {r.transcript}
                    </pre>
                  </details>
                )}
              </TlKort>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
