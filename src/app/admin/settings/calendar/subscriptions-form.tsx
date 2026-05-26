"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Ban,
} from "lucide-react";
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

/**
 * Forenklet kalender-konfigurasjon:
 * - ÉN kalender velges som "her legges nye bookinger" (radio)
 * - FLERE kalendere velges som "blokker booking-tider" (checkboxes)
 *
 * En kalender med invalid_grant kan ikke kommunisere med Google og må
 * reauthentiseres — vises med tydelig advarsel.
 */
export function SubscriptionsForm({ rows }: { rows: SubscriptionRow[] }) {
  const router = useRouter();

  // Initial-state: hvilken kalender skal motta push (én eller ingen),
  // og hvilke kalendere skal pulles (sett av ID-er).
  const initialPushId = rows.find((r) => r.syncPush && r.active)?.id ?? "";
  const initialPullIds = new Set(
    rows.filter((r) => r.syncPull && r.active).map((r) => r.id),
  );

  const [pushId, setPushId] = useState<string>(initialPushId);
  const [pullIds, setPullIds] = useState<Set<string>>(initialPullIds);
  const [pending, startTransition] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [beskjed, setBeskjed] = useState<Beskjed | null>(null);

  function togglePull(id: string) {
    setPullIds((prev) => {
      const ny = new Set(prev);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });
  }

  function handleLagre() {
    setBeskjed(null);
    startTransition(async () => {
      // Bygg input: én kalender med syncPush=true, alle med pullIds får syncPull=true.
      // Active sett til true hvis kalenderen har push eller pull, ellers false.
      const input = rows.map((r) => {
        const erPush = r.id === pushId;
        const erPull = pullIds.has(r.id);
        return {
          id: r.id,
          syncPush: erPush,
          syncPull: erPull,
          active: erPush || erPull,
        };
      });

      const result = await oppdaterSubscriptions(input);
      if (result.ok) {
        setBeskjed({
          tag: "ok",
          tekst: `Lagret innstillinger for ${result.oppdatert} kalendere.`,
        });
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

  if (rows.length === 0) {
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
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
          {refreshing ? "Henter …" : "Hent kalender-liste"}
        </button>
      </section>
    );
  }

  const antallMedFeil = rows.filter((r) => r.lastError).length;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Dine kalendere
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Velg én kalender for nye bookinger og hvilke kalendere som skal
            blokkere ledige tider.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || pending}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-border disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
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
            <CheckCircle2
              className="h-5 w-5 flex-shrink-0 text-primary"
              strokeWidth={1.75}
            />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
          )}
          <span>{beskjed.tekst}</span>
        </div>
      )}

      {antallMedFeil > 0 && (
        <div className="flex items-start gap-4 rounded-md border border-warning/40 bg-warning/5 p-4 text-sm">
          <AlertTriangle
            className="h-5 w-5 flex-shrink-0 text-warning"
            strokeWidth={1.75}
          />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {antallMedFeil}{" "}
              {antallMedFeil === 1 ? "kalender" : "kalendere"} kan ikke nås
            </p>
            <p className="text-muted-foreground">
              Tilgangen er utgått (invalid_grant). Koble Google på nytt for å
              gi systemet tilgang igjen. Inntil det er fikset er ikke disse
              kalenderne med på å blokkere booking-tider.
            </p>
          </div>
        </div>
      )}

      {/* Seksjon 1 — Push (radio, én kalender) */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-4 border-b border-border/60 px-6 py-4">
          <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <h4 className="font-display text-base font-semibold tracking-tight">
              Hvor skal nye bookinger legges?
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Når en kunde booker en time, opprettes hendelsen i denne
              kalenderen. Velg den du bruker til jobb.
            </p>
          </div>
        </div>
        <ul className="divide-y divide-border/40">
          {rows.map((rad) => (
            <li
              key={rad.id}
              className="flex items-center gap-4 px-6 py-2 hover:bg-muted/30"
            >
              <input
                type="radio"
                name="push-calendar"
                id={`push-${rad.id}`}
                checked={pushId === rad.id}
                onChange={() => setPushId(rad.id)}
                disabled={!!rad.lastError}
                className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
              />
              <label
                htmlFor={`push-${rad.id}`}
                className={`flex flex-1 cursor-pointer items-center gap-2 ${
                  rad.lastError ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      rad.color ?? "var(--color-muted-foreground)",
                  }}
                  aria-hidden
                />
                <span className="flex-1 text-sm text-foreground">
                  {rad.calendarName}
                </span>
                {rad.lastError && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
                    invalid_grant
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Seksjon 2 — Pull (checkboxes, flere kalendere) */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-4 border-b border-border/60 px-6 py-4">
          <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <Ban className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <h4 className="font-display text-base font-semibold tracking-tight">
              Hvilke kalendere skal blokkere booking-tider?
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Tider med hendelser i disse kalenderne vises ikke som ledige i
              booking-systemet. Huk av alle kalendere som inneholder ting du
              ikke vil bli avbrutt på.
            </p>
          </div>
        </div>
        <ul className="divide-y divide-border/40">
          {rows.map((rad) => (
            <li
              key={rad.id}
              className="flex items-center gap-4 px-6 py-2 hover:bg-muted/30"
            >
              <input
                type="checkbox"
                id={`pull-${rad.id}`}
                checked={pullIds.has(rad.id)}
                onChange={() => togglePull(rad.id)}
                disabled={!!rad.lastError}
                className="h-4 w-4 cursor-pointer rounded accent-primary disabled:cursor-not-allowed disabled:opacity-40"
              />
              <label
                htmlFor={`pull-${rad.id}`}
                className={`flex flex-1 cursor-pointer items-center gap-2 ${
                  rad.lastError ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      rad.color ?? "var(--color-muted-foreground)",
                  }}
                  aria-hidden
                />
                <span className="flex-1 text-sm text-foreground">
                  {rad.calendarName}
                </span>
                {rad.lastError && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
                    invalid_grant
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
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
