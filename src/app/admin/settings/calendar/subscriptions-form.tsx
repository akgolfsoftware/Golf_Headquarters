"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { oppdaterSubscriptions, refreshCalendarList } from "./actions";

export type SubscriptionRow = {
  id: string;
  googleCalendarId: string;
  calendarName: string;
  color: string | null;
  syncPush: boolean;
  syncPull: boolean;
  active: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  watchExpiresAt: string | null;
};

type Beskjed = { tag: "ok" | "feil"; tekst: string };

export function SubscriptionsForm({ rows }: { rows: SubscriptionRow[] }) {
  const router = useRouter();
  const [state, setState] = useState<SubscriptionRow[]>(rows);
  const [pending, startTransition] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [beskjed, setBeskjed] = useState<Beskjed | null>(null);

  function toggleRad(id: string, felt: "syncPush" | "syncPull" | "active") {
    setState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [felt]: !r[felt] } : r)),
    );
  }

  function handleLagre() {
    setBeskjed(null);
    startTransition(async () => {
      const result = await oppdaterSubscriptions(
        state.map((r) => ({
          id: r.id,
          syncPush: r.syncPush,
          syncPull: r.syncPull,
          active: r.active,
        })),
      );
      if (result.ok) {
        setBeskjed({ tag: "ok", tekst: `Lagret ${result.oppdatert} kalendere.` });
        router.refresh();
      } else {
        setBeskjed({ tag: "feil", tekst: result.error });
      }
    });
  }

  function handleRefresh() {
    setBeskjed(null);
    startRefresh(async () => {
      const result = await refreshCalendarList();
      if (result.ok) {
        setBeskjed({
          tag: "ok",
          tekst: `Hentet ${result.found} kalendere (${result.upserted} oppdatert, ${result.skipped} hoppet over).`,
        });
        router.refresh();
      } else {
        setBeskjed({ tag: "feil", tekst: result.error });
      }
    });
  }

  if (state.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ingen kalendere funnet. Klikk &quot;Hent kalender-liste&quot; for å forsøke
          igjen.
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-border disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.75} />
          {refreshing ? "Henter …" : "Hent kalender-liste"}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Dine kalendere
        </h3>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || pending}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-border disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.75} />
          {refreshing ? "Henter …" : "Hent på nytt"}
        </button>
      </div>

      {beskjed && (
        <div
          className={
            beskjed.tag === "ok"
              ? "flex items-start gap-4 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground"
              : "flex items-start gap-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          }
        >
          {beskjed.tag === "ok" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={1.75} />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
          )}
          <span>{beskjed.tekst}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <tr>
              <th className="px-4 py-4">Kalender</th>
              <th className="px-4 py-4 text-center">Push</th>
              <th className="px-4 py-4 text-center">Pull</th>
              <th className="px-4 py-4 text-center">Aktiv</th>
              <th className="px-4 py-4">Sist sync</th>
            </tr>
          </thead>
          <tbody>
            {state.map((rad) => (
              <tr key={rad.id} className="border-t border-border/40">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: rad.color ?? "var(--color-muted-foreground)" }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">
                        {rad.calendarName}
                      </div>
                      {rad.lastError && (
                        <div className="mt-1 truncate text-xs text-destructive">
                          {rad.lastError}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle
                    checked={rad.syncPush}
                    onChange={() => toggleRad(rad.id, "syncPush")}
                    disabled={!rad.active}
                    label="Push booking til kalender"
                  />
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle
                    checked={rad.syncPull}
                    onChange={() => toggleRad(rad.id, "syncPull")}
                    disabled={!rad.active}
                    label="Blokker tider fra kalender"
                  />
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle
                    checked={rad.active}
                    onChange={() => toggleRad(rad.id, "active")}
                    label="Aktiv"
                  />
                </td>
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {rad.lastSyncAt
                    ? new Date(rad.lastSyncAt).toLocaleString("nb-NO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "Aldri"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={handleLagre}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {pending ? "Lagrer …" : "Lagre"}
        </button>
      </div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={[
        "relative inline-flex h-6 w-10 flex-shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
