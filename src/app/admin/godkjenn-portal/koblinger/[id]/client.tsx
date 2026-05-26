"use client";

import { useState, useTransition } from "react";
import {
  setKoblingStatus,
  setConfirmedRoute,
  setNotes,
  setButtonTarget,
} from "../actions";
import { CheckCircle2, AlertCircle, XCircle, ExternalLink, Save } from "lucide-react";

type Kobling = {
  id: string;
  designFile: string;
  designTitle: string;
  status: "UNMAPPED" | "MAPPED" | "APPROVED" | "MISSING" | "BROKEN";
  suggestedRoute: string | null;
  confirmedRoute: string | null;
  notes: string | null;
  buttonCount: number;
  linkCount: number;
  confidence: number;
  buttons: Array<{
    text: string;
    href?: string;
    type: "button" | "link";
    targetRoute?: string;
  }>;
};

type RouteOpt = { route: string; label: string };

export function KoblingDetailClient({
  kobling,
  allRoutes,
}: {
  kobling: Kobling;
  allRoutes: RouteOpt[];
}) {
  const [pending, start] = useTransition();
  const [confirmedRoute, setConfirmedR] = useState(
    kobling.confirmedRoute ?? kobling.suggestedRoute ?? "",
  );
  const [notes, setN] = useState(kobling.notes ?? "");
  const [buttonTargets, setButtonTargets] = useState<Record<number, string>>(
    Object.fromEntries(
      kobling.buttons.map((b, i) => [i, b.targetRoute ?? ""]),
    ),
  );

  const appPath = confirmedRoute || kobling.suggestedRoute;
  const designSrc = `/${kobling.designFile}`;

  return (
    <div className="grid grid-cols-[1fr_1fr_360px] gap-0 h-[calc(100vh-57px)]">
      {/* Design iframe */}
      <div className="border-r border-border bg-muted/20 flex flex-col">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Design
          </span>
          <a
            href={designSrc}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Åpne <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <iframe
          src={designSrc}
          className="flex-1 w-full bg-white"
          title="Design"
        />
      </div>

      {/* App iframe */}
      <div className="border-r border-border bg-muted/20 flex flex-col">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            App {appPath ? `· ${appPath}` : ""}
          </span>
          {appPath && (
            <a
              href={appPath}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Åpne <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {appPath ? (
          <iframe src={appPath} className="flex-1 w-full bg-white" title="App" />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Koble en rute fra panelet til høyre for å se app-versjonen
          </div>
        )}
      </div>

      {/* Sidebar med koblinger */}
      <aside className="flex flex-col bg-card overflow-y-auto">
        <div className="border-b border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Status
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatusButton
              label="Mappet"
              icon={CheckCircle2}
              active={kobling.status === "MAPPED"}
              onClick={() =>
                start(() => setKoblingStatus(kobling.id, "MAPPED"))
              }
              tone="info"
            />
            <StatusButton
              label="Godkjent"
              icon={CheckCircle2}
              active={kobling.status === "APPROVED"}
              onClick={() =>
                start(() => setKoblingStatus(kobling.id, "APPROVED"))
              }
              tone="ok"
            />
            <StatusButton
              label="Mangler"
              icon={AlertCircle}
              active={kobling.status === "MISSING"}
              onClick={() =>
                start(() => setKoblingStatus(kobling.id, "MISSING"))
              }
              tone="warn"
            />
            <StatusButton
              label="Brutt"
              icon={XCircle}
              active={kobling.status === "BROKEN"}
              onClick={() =>
                start(() => setKoblingStatus(kobling.id, "BROKEN"))
              }
              tone="danger"
            />
          </div>
        </div>

        <div className="border-b border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Bekreftet rute · {kobling.confidence}% auto-match
          </p>
          <select
            value={confirmedRoute}
            onChange={(e) => setConfirmedR(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">— ikke koblet —</option>
            {allRoutes.map((r) => (
              <option key={r.route} value={r.route}>
                {r.route} — {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              start(() =>
                setConfirmedRoute(kobling.id, confirmedRoute || null),
              )
            }
            disabled={pending}
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Lagre rute
          </button>
        </div>

        <div className="border-b border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Knapper i design ({kobling.buttons.length})
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {kobling.buttons.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Ingen knapper funnet
              </p>
            ) : (
              kobling.buttons.map((b, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border p-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-muted-foreground">
                      {b.type === "button" ? "BTN" : "LNK"}
                    </span>
                    <span className="flex-1 truncate font-medium text-foreground">
                      {b.text}
                    </span>
                  </div>
                  {b.href && (
                    <p className="font-mono text-[10px] text-muted-foreground mt-1 truncate">
                      → {b.href}
                    </p>
                  )}
                  <select
                    value={buttonTargets[i] ?? ""}
                    onChange={(e) =>
                      setButtonTargets((s) => ({ ...s, [i]: e.target.value }))
                    }
                    onBlur={() =>
                      start(() =>
                        setButtonTarget(
                          kobling.id,
                          i,
                          buttonTargets[i] || null,
                        ),
                      )
                    }
                    className="mt-1.5 w-full rounded border border-border bg-background px-2 py-1 text-[11px]"
                  >
                    <option value="">— ikke koblet —</option>
                    {allRoutes.map((r) => (
                      <option key={r.route} value={r.route}>
                        {r.route}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Notater
          </p>
          <textarea
            value={notes}
            onChange={(e) => setN(e.target.value)}
            onBlur={() => start(() => setNotes(kobling.id, notes))}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="F.eks. mangler hover-state, feil ikon, knapp X går ingensteder…"
          />
        </div>
      </aside>
    </div>
  );
}

function StatusButton({
  label,
  icon: Icon,
  active,
  onClick,
  tone,
}: {
  label: string;
  icon: typeof CheckCircle2;
  active: boolean;
  onClick: () => void;
  tone: "ok" | "warn" | "info" | "danger";
}) {
  const toneActive = {
    ok: "bg-success text-white border-success",
    warn: "bg-warning text-white border-warning",
    info: "bg-info text-white border-info",
    danger: "bg-destructive text-white border-destructive",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
        active ? toneActive : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
