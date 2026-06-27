"use client";

// Agent-team (Etappe 3): definer en oppgave, kjør teamet, se fremdrift live.
// Leser NDJSON-strømmen fra /api/kommando/team og oppdaterer steg-status
// fortløpende. Historikk hentes fra serveren (router.refresh etter kjøring).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, Check, SkipForward, AlertTriangle, Circle } from "lucide-react";
import { KOMMANDO_TEAM, getKommandoModel } from "@/lib/kommando/models";

export type AgentTeamStepView = {
  index: number;
  model: string;
  role: string;
  status: string;
  output: string | null;
};

export type AgentTeamRunView = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  projectName: string | null;
  steps: AgentTeamStepView[];
};

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

function StepIcon({ status }: { status: string }) {
  if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={1.5} />;
  if (status === "done") return <Check className="h-4 w-4 text-success" strokeWidth={2} />;
  if (status === "skipped") return <SkipForward className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
  if (status === "failed") return <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={1.5} />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />;
}

function StepCard({ step }: { step: AgentTeamStepView }) {
  const label = getKommandoModel(step.model)?.label ?? step.model;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2.5">
        <StepIcon status={step.status} />
        <span className="font-display text-[13px] font-semibold text-foreground">{step.role}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">{label}</span>
      </div>
      {step.output && (
        <p className="mt-2 whitespace-pre-wrap border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
          {step.output}
        </p>
      )}
    </div>
  );
}

export function AgentTeam({
  projects,
  pastRuns,
}: {
  projects: { id: string; name: string }[];
  pastRuns: AgentTeamRunView[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<AgentTeamStepView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || running) return;
    setRunning(true);
    setError(null);
    setLive(KOMMANDO_TEAM.map((s, i) => ({ index: i, model: s.model, role: s.role, status: "pending", output: null })));

    try {
      const res = await fetch("/api/kommando/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, projectId: projectId || null }),
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

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hva skal teamet jobbe med? (f.eks. «Lag markedsplan for Q3»)"
            className="h-11 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
          />
          <button
            type="submit"
            disabled={running || title.trim().length === 0}
            className="flex h-11 items-center gap-2 rounded-lg bg-accent px-4 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-accent-foreground transition-opacity disabled:opacity-40"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
            Kjør team
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-accent"
            aria-label="Prosjekt"
          >
            <option value="">Uten prosjekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            {KOMMANDO_TEAM.map((s) => s.role).join(" → ")}
          </span>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>

      {live && (
        <section className="space-y-2">
          <h2 className="font-display text-[13px] font-semibold text-foreground">
            {running ? "Teamet jobber…" : "Resultat"}
          </h2>
          {live.map((s) => (
            <StepCard key={s.index} step={s} />
          ))}
        </section>
      )}

      {pastRuns.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-[13px] font-semibold text-foreground">Historikk</h2>
          {pastRuns.map((r) => (
            <details key={r.id} className="rounded-lg border border-border bg-card p-3">
              <summary className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <span className="flex-1 truncate font-medium">{r.title}</span>
                {r.projectName && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    {r.projectName}
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                </span>
              </summary>
              <div className="mt-3 space-y-2">
                {r.steps.map((s) => (
                  <StepCard key={s.index} step={s} />
                ))}
              </div>
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
