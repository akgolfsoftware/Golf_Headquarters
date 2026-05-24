"use client";

import Link from "next/link";
import { useState } from "react";
import { CancelButton } from "./cancel-button";

type BookingRowData = {
  id: string;
  startAt: Date;
  status: string;
  priceOre: number;
  subscriptionId: string | null;
  serviceType: { name: string; durationMin: number };
  location: { name: string };
};

type Props = {
  kommende: BookingRowData[];
  historikk: BookingRowData[];
  nyBookingHref: string;
};

export function BookingerTabs({ kommende, historikk, nyBookingHref }: Props) {
  const [aktivFane, setAktivFane] = useState<"kommende" | "historikk">(
    "kommende",
  );

  const faner = [
    { id: "kommende" as const, label: "Kommende", antall: kommende.length },
    { id: "historikk" as const, label: "Historikk", antall: historikk.length },
  ];

  const visListe = aktivFane === "kommende" ? kommende : historikk;

  return (
    <div className="space-y-6">
      {/* Tab-header */}
      <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
        {faner.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setAktivFane(f.id)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              aktivFane === f.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {f.antall > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
                  aktivFane === f.id
                    ? "bg-primary/10 text-primary"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {f.antall}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Innhold */}
      {visListe.length === 0 ? (
        <TomFane fane={aktivFane} nyBookingHref={nyBookingHref} />
      ) : (
        <ul className="space-y-4">
          {visListe.slice(0, aktivFane === "historikk" ? 20 : undefined).map(
            (b) => (
              <BookingRad
                key={b.id}
                booking={b}
                kommende={aktivFane === "kommende"}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function TomFane({
  fane,
  nyBookingHref,
}: {
  fane: "kommende" | "historikk";
  nyBookingHref: string;
}) {
  if (fane === "kommende") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          Ingen kommende bookinger
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Book din første coaching-time og kom i gang.
        </p>
        <Link
          href={nyBookingHref}
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Book ny time
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-12 text-center">
      <p className="text-sm font-medium text-foreground">Ingen historikk</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Gjennomførte og avbestilte bookinger vises her.
      </p>
    </div>
  );
}

function BookingRad({
  booking,
  kommende,
}: {
  booking: BookingRowData;
  kommende?: boolean;
}) {
  // eslint-disable-next-line react-hooks/purity
  const tidTilStart = booking.startAt.getTime() - Date.now();
  const kanRefunderes = tidTilStart > 24 * 60 * 60 * 1000;
  const kanAvbestille = booking.status !== "CANCELLED" && tidTilStart > 0;

  return (
    <li className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            {booking.serviceType.name}
          </h3>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
            {booking.startAt.toLocaleDateString("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            kl{" "}
            {booking.startAt.toLocaleTimeString("nb-NO", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            &middot; {booking.serviceType.durationMin} min
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.location.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={booking.status} />
          {booking.subscriptionId ? (
            <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              Abonnement
            </span>
          ) : (
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {booking.priceOre / 100} kr
            </span>
          )}
        </div>
      </div>

      {kommende && kanAvbestille && (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/50 pt-4">
          {kanRefunderes && (
            <Link
              href={`/portal/meg/bookinger/reschedule/${booking.id}`}
              className="rounded-md border border-input bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Bytt tid
            </Link>
          )}
          <CancelButton bookingId={booking.id} canRefund={kanRefunderes} />
          {!kanRefunderes && (
            <span className="text-xs text-muted-foreground">
              Mindre enn 24 t igjen — ingen refusjon eller flytting.
            </span>
          )}
        </div>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { tekst: string; klasser: string }> = {
    CONFIRMED: { tekst: "Bekreftet", klasser: "bg-primary/10 text-primary" },
    PENDING: {
      tekst: "Behandler",
      klasser: "bg-muted text-muted-foreground",
    },
    CANCELLED: {
      tekst: "Avbestilt",
      klasser: "bg-destructive/10 text-destructive",
    },
    COMPLETED: { tekst: "Gjennomført", klasser: "bg-muted text-foreground" },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${c.klasser}`}
    >
      {c.tekst}
    </span>
  );
}
