"use client";

/**
 * AgencyOS Agent-team — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Flere AI-er jobber sekvensielt. T.* only.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Inndata,
  Velger,
  TomTilstand,
  CTAPill,
  Icon,
  T,
  type StatusTone,
} from "@/components/v2";
import { KOMMANDO_TEAM, getKommandoModel } from "@/lib/kommando/models";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export interface AgentTeamStepView {
  index: number;
  model: string;
  role: string;
  status: string;
  output: string | null;
}
export interface AgentTeamRunView {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  projectName: string | null;
  steps: AgentTeamStepView[];
}
export interface AdminAgentTeamV2Data {
  projects: { id: string; name: string }[];
  pastRuns: AgentTeamRunView[];
}

// ── NDJSON-strøm (verbatim fra kommando/agent-team) ─────────────
type StreamEvent =
  | { type: "run"; runId: string }
  | { type: "step-start"; index: number }
  | { type: "step-done"; index: number; output: string }
  | { type: "step-skip"; index: number; note: string }
  | { type: "step-error"; index: number; message: string }
  | { type: "done"; runId: string };

function applyEvent(steps: AgentTeamStepView[], evt: StreamEvent): AgentTeamStepView[] {
  if (evt.type === "step-start")
    return steps.map((s) => (s.index === evt.index ? { ...s, status: "running" } : s));
  if (evt.type === "step-done")
    return steps.map((s) => (s.index === evt.index ? { ...s, status: "done", output: evt.output } : s));
  if (evt.type === "step-skip")
    return steps.map((s) => (s.index === evt.index ? { ...s, status: "skipped", output: evt.note } : s));
  if (evt.type === "step-error")
    return steps.map((s) => (s.index === evt.index ? { ...s, status: "failed", output: evt.message } : s));
  return steps;
}

// ── Status → v2-visning ─────────────────────────────────────────
const STEG_META: Record<string, { icon: string; color: string; tone: StatusTone; label: string; spin?: boolean }> = {
  pending: { icon: "circle", color: T.mut, tone: "info", label: "I kø" },
  running: { icon: "rotate-cw", color: T.warn, tone: "warn", label: "Kjører", spin: true },
  done: { icon: "check-circle", color: T.up, tone: "up", label: "Ferdig" },
  skipped: { icon: "minus", color: T.mut, tone: "info", label: "Hoppet over" },
  failed: { icon: "triangle-alert", color: T.down, tone: "down", label: "Feil" },
};

const RUN_META: Record<string, { tone: StatusTone; label: string }> = {
  completed: { tone: "up", label: "Fullført" },
  done: { tone: "up", label: "Fullført" },
  running: { tone: "warn", label: "Kjører" },
  failed: { tone: "down", label: "Feil" },
};

const UTEN_PROSJEKT = "Uten prosjekt";

/** Ett agent-/steg-kort: rolle · modell · status (+ output når det finnes). */
function StegKort({ step }: { step: AgentTeamStepView }) {
  const label = getKommandoModel(step.model)?.label ?? step.model;
  const meta = STEG_META[step.status] ?? STEG_META.pending;
  return (
    <Kort pad="14px 16px">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Icon
          name={meta.icon}
          size={16}
          style={{ color: meta.color }}
          className={meta.spin ? "animate-spin" : undefined}
        />
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{step.role}</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut }}>
          {label}
        </span>
        <span style={{ flex: 1 }} />
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      </div>
      {step.output && (
        <p
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${T.border}`,
            fontFamily: T.ui,
            fontSize: 12,
            lineHeight: 1.6,
            color: T.fg2,
            whiteSpace: "pre-wrap",
          }}
        >
          {step.output}
        </p>
      )}
    </Kort>
  );
}

/** Historikk-rad: utvidbart kort med kjøringens steg. */
function HistorikkKort({ run }: { run: AgentTeamRunView }) {
  const [open, setOpen] = useState(false);
  const meta = RUN_META[run.status];
  const dato = new Date(run.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  return (
    <Kort pad="4px 16px">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 0",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Icon name={open ? "chevron-down" : "chevron-right"} size={16} style={{ color: T.mut, flex: "none" }} />
        <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {run.title}
        </span>
        {run.projectName && (
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut }} className="hidden md:inline">
            {run.projectName}
          </span>
        )}
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none", fontVariantNumeric: "tabular-nums" }}>{dato}</span>
        {meta && <StatusPill tone={meta.tone}>{meta.label}</StatusPill>}
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 14px" }}>
          {run.steps.length === 0 ? (
            <TomTilstand icon="circle" title="Ingen steg" sub="Denne kjøringen har ingen lagrede steg." />
          ) : (
            run.steps.map((s) => <StegKort key={s.index} step={s} />)
          )}
        </div>
      )}
    </Kort>
  );
}

export function AdminAgentTeamV2({ data }: { data: AdminAgentTeamV2Data }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [prosjektNavn, setProsjektNavn] = useState(UTEN_PROSJEKT);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<AgentTeamStepView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const oppskrift = KOMMANDO_TEAM.map((s) => s.role).join("  →  ");

  async function run() {
    const t = title.trim();
    if (!t || running) return;
    const projectId = data.projects.find((p) => p.name === prosjektNavn)?.id ?? null;
    setRunning(true);
    setError(null);
    setLive(KOMMANDO_TEAM.map((s, i) => ({ index: i, model: s.model, role: s.role, status: "pending", output: null })));

    try {
      const res = await fetch("/api/kommando/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, projectId }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: StreamEvent;
          try {
            evt = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }
          setLive((prev) => (prev ? applyEvent(prev, evt) : prev));
        }
      }
      setTitle("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setRunning(false);
    }
  }

  // ── Hode — B: status ───────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Agent-team</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="team.">Agent</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 8, maxWidth: 520, lineHeight: 1.55 }}>
          Flere AI-er jobber sekvensielt på én oppgave. Output fra ett steg mates inn i neste.
        </p>
      </div>
      <StatusPill tone={running ? "warn" : data.pastRuns.length > 0 ? "lime" : "info"}>
        {running ? "Teamet jobber" : data.pastRuns.length === 0 ? "Klar" : `${data.pastRuns.length} kjøringer`}
      </StatusPill>
    </div>
  );

  // ── Ny oppgave (skjema) — B: én primær CTAPill ──────────────────
  const skjema = (
    <Kort eyebrow="Ny oppgave" action={<Caps size={9}>{oppskrift}</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Inndata
          label="Hva skal teamet jobbe med?"
          value={title}
          placeholder="F.eks. «Lag markedsplan for Q3»"
          onChange={setTitle}
        />
        {data.projects.length > 0 && (
          <Velger
            label="Prosjekt"
            options={[UTEN_PROSJEKT, ...data.projects.map((p) => p.name)]}
            value={prosjektNavn}
            onChange={setProsjektNavn}
          />
        )}
        <button
          type="button"
          disabled={running || title.trim().length === 0}
          onClick={run}
          style={{
            all: "unset",
            cursor: running || title.trim().length === 0 ? "not-allowed" : "pointer",
            opacity: running || title.trim().length === 0 ? 0.55 : 1,
            display: "block",
            width: "100%",
          }}
        >
          <CTAPill icon="play" full>
            {running ? "Kjører team …" : "Kjør team"}
          </CTAPill>
        </button>
        {error && (
          <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0 }}>{error}</p>
        )}
      </div>
    </Kort>
  );

  // ── Live / resultat ─────────────────────────────────────────────
  const resultat = live && (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Caps>{running ? "Teamet jobber …" : "Resultat"}</Caps>
      {live.map((s) => (
        <StegKort key={s.index} step={s} />
      ))}
    </div>
  );

  // ── Historikk ───────────────────────────────────────────────────
  const historikk = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Caps>Historikk</Caps>
      {data.pastRuns.length === 0 ? (
        <Kort>
          <TomTilstand icon="history" title="Ingen kjøringer ennå" sub="Definer en oppgave over for å sette teamet i gang." />
        </Kort>
      ) : (
        data.pastRuns.map((r) => <HistorikkKort key={r.id} run={r} />)
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {skjema}
      {resultat}
      {historikk}
    </div>
  );
}
