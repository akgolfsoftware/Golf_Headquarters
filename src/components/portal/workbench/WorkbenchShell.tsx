"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { WorkbenchTopbar } from "./WorkbenchTopbar";
import { WorkbenchSidebar } from "./WorkbenchSidebar";
import { WorkbenchCalendar } from "./WorkbenchCalendar";
import { WorkbenchInspector } from "./WorkbenchInspector";
import { WorkbenchStatusbar } from "./WorkbenchStatusbar";
import {
  createSession,
  updateSessionTime,
  addStandardSessionToCalendar,
} from "@/app/portal/planlegge/actions";
import type {
  WorkbenchData,
  WorkbenchSession,
  WorkbenchView,
} from "./types";

import "./workbench-portal.css";

type WorkbenchShellProps = {
  data: WorkbenchData;
};

export function WorkbenchShell({ data }: WorkbenchShellProps) {
  const [view, setView] = useState<WorkbenchView>("week");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sessionsById = useMemo(() => {
    const map = new Map<string, WorkbenchSession>();
    for (const s of data.sessions) map.set(s.id, s);
    return map;
  }, [data.sessions]);

  const selectedSession = selectedId ? sessionsById.get(selectedId) ?? null : null;

  const handleSelectSession = (session: WorkbenchSession) => {
    setSelectedId(session.id);
  };

  const handleDropSession = (sessionId: string, dateIso: string) => {
    const session = sessionsById.get(sessionId);
    if (!session) return;
    const d = new Date(dateIso);
    const orig = new Date(session.scheduledAt);
    d.setHours(orig.getHours(), orig.getMinutes(), 0, 0);
    const scheduledAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
      2,
      "0",
    )}`;

    startTransition(async () => {
      const form = new FormData();
      form.append("sessionId", sessionId);
      form.append("scheduledAt", scheduledAt);
      form.append("durationMin", String(session.durationMin));
      await updateSessionTime(form);
    });
  };

  const handleDragStartStandard = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("standardSessionId", id);
  };

  const handleDropStandard = (malId: string, dateIso: string) => {
    if (!data.activePlanId) return;
    const d = new Date(dateIso);
    d.setHours(12, 0, 0, 0);
    const scheduledAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
      2,
      "0",
    )}`;
    startTransition(async () => {
      const form = new FormData();
      form.append("malId", malId);
      form.append("planId", data.activePlanId!);
      form.append("scheduledAt", scheduledAt);
      await addStandardSessionToCalendar(form);
    });
  };

  return (
    <div className="ph-workbench flex h-[calc(100vh-7rem)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <WorkbenchTopbar
        plans={data.plans}
        activePlanId={data.activePlanId}
        view={view}
        weekNumber={data.weekNumber}
        onViewChange={setView}
        onNewSession={() => setIsNewSessionOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <WorkbenchSidebar
          standardSessions={data.standardSessions}
          tournaments={data.tournaments}
          goals={data.goals}
          axisHours={data.axisHours}
          onDragStartStandard={handleDragStartStandard}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <WorkbenchCalendar
            view={view}
            sessions={data.sessions}
            selectedId={selectedId}
            onSelectSession={handleSelectSession}
            onDropSession={handleDropSession}
            onDropStandardSession={handleDropStandard}
            weekStart={data.weekStart}
          />
        </main>

        <WorkbenchInspector session={selectedSession} weekNumber={data.weekNumber} />
      </div>

      <WorkbenchStatusbar
        weekNumber={data.weekNumber}
        sessionCount={data.summary.sessionCount}
        plannedHours={data.summary.plannedHours}
        axisHours={data.axisHours}
        pendingAdjustments={data.pendingAdjustments}
      />

      <NewSessionDialog
        open={isNewSessionOpen}
        onOpenChange={setIsNewSessionOpen}
        planId={data.activePlanId}
        isPending={isPending}
      />
    </div>
  );
}

// ───────── Ny økt dialog ─────────
function NewSessionDialog({
  open,
  onOpenChange,
  planId,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  isPending: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    if (!planId) {
      setError("Ingen aktiv plan. Opprett en plan først.");
      return;
    }
    formData.append("planId", planId);
    const result = await createSession(formData);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.error ?? "Noe gikk galt");
    }
  };

  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}T09:00`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ny økt</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Tittel
              </label>
              <Input name="title" placeholder="f.eks. Innspill 50–80 m" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Dato / tid
                </label>
                <Input name="scheduledAt" type="datetime-local" defaultValue={defaultDate} required />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Varighet (min)
                </label>
                <Input name="durationMin" type="number" min={5} max={480} defaultValue={60} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Pyramide-akse
                </label>
                <Select name="pyramidArea" defaultValue="SLAG" required>
                  <option value="FYS">Fysisk</option>
                  <option value="TEK">Teknikk</option>
                  <option value="SLAG">Golfslag</option>
                  <option value="SPILL">Spill</option>
                  <option value="TURN">Turnering</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Miljø
                </label>
                <Select name="environment" defaultValue="RANGE">
                  <option value="">—</option>
                  <option value="RANGE">Range</option>
                  <option value="BANE">Bane</option>
                  <option value="STUDIO">Studio</option>
                  <option value="HJEM">Hjem</option>
                  <option value="SIMULATOR">Simulator</option>
                  <option value="GYM">Gym</option>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost-light"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Avbryt
            </Button>
            <Button type="submit" variant="primary" disabled={isPending || !planId}>
              {isPending ? "Lagrer…" : "Opprett økt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
