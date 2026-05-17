"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  QuickAddSessionModal,
  type FacilityOption,
  type LocationOption,
  type QuickAddSlot,
  type ServiceTypeOption,
  type SpillerOption,
} from "@/components/admin/quick-add-session-modal";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

type Booking = {
  id: string;
  startAt: string; // ISO
  endAt: string; // ISO
  status: string;
  facilityId: string | null;
  user: { id: string; name: string } | null;
  serviceType: { name: string };
};

type Facility = {
  id: string;
  name: string;
  locationId: string;
  capacity: number;
};

type Props = {
  locationName: string;
  facilities: Facility[];
  bookings: Booking[];
  ukeStartIso: string; // ISO mandag-dato
  spillere: SpillerOption[];
  serviceTypes: ServiceTypeOption[];
  locations: LocationOption[];
  facilityOptions: FacilityOption[];
  kanBooke: boolean;
};

export function MultiFacilityWeek({
  locationName,
  facilities,
  bookings,
  ukeStartIso,
  spillere,
  serviceTypes,
  locations,
  facilityOptions,
  kanBooke,
}: Props) {
  const ukeStart = new Date(ukeStartIso);
  const [slot, setSlot] = useState<QuickAddSlot | null>(null);
  const [valgtFacility, setValgtFacility] = useState<Facility | null>(null);

  // 7 dager
  const dager: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ukeStart);
    d.setDate(ukeStart.getDate() + i);
    dager.push(d);
  }

  // Grupper bookinger per (facilityId, dag-index)
  const perFacilityPerDag = new Map<string, Booking[][]>();
  for (const f of facilities) {
    perFacilityPerDag.set(
      f.id,
      Array.from({ length: 7 }, () => []),
    );
  }
  for (const b of bookings) {
    const start = new Date(b.startAt);
    const dagIdx = dager.findIndex(
      (d) =>
        d.getFullYear() === start.getFullYear() &&
        d.getMonth() === start.getMonth() &&
        d.getDate() === start.getDate(),
    );
    if (dagIdx === -1) continue;
    const facilityId = b.facilityId ?? "_uten_facility";
    if (!perFacilityPerDag.has(facilityId)) {
      perFacilityPerDag.set(
        facilityId,
        Array.from({ length: 7 }, () => []),
      );
    }
    perFacilityPerDag.get(facilityId)![dagIdx].push(b);
  }

  const ukeNr = ukenummer(ukeStart);
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  function aapneSlot(facility: Facility, dag: Date) {
    // Default-tid: 12:00 på valgt dag
    const start = new Date(dag);
    start.setHours(12, 0, 0, 0);
    setValgtFacility(facility);
    setSlot({
      startIso: start.toISOString(),
      datoLabel: start.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      tidLabel: "12:00",
      ukedag: start.toLocaleDateString("nb-NO", { weekday: "long" }),
    });
  }

  const forrigeUke = new Date(ukeStart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukeStart);
  nesteUke.setDate(nesteUke.getDate() + 7);
  const datoFormat = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  });

  return (
    <section className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {locationName} <em className="font-normal text-primary md:italic">uke {ukeNr}</em>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {datoFormat.format(dager[0])} – {datoFormat.format(dager[6])} ·{" "}
            {bookings.length} bookinger
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
          <Link
            href={`/admin/anlegg?tab=fasiliteter&uke=${isoDate(forrigeUke)}`}
            aria-label="Forrige uke"
            className="grid h-7 w-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href={`/admin/anlegg?tab=fasiliteter`}
            className="rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            I dag
          </Link>
          <Link
            href={`/admin/anlegg?tab=fasiliteter&uke=${isoDate(nesteUke)}`}
            aria-label="Neste uke"
            className="grid h-7 w-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card px-4 py-4 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Fasilitet
              </th>
              {dager.map((d, i) => {
                const erIdag =
                  d.getFullYear() === idag.getFullYear() &&
                  d.getMonth() === idag.getMonth() &&
                  d.getDate() === idag.getDate();
                const ukedag = (d.getDay() + 6) % 7;
                return (
                  <th
                    key={i}
                    className={`border-l border-border px-2 py-4 text-center ${
                      erIdag ? "bg-accent/15" : ""
                    }`}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {DAGER[ukedag]}
                    </div>
                    <div
                      className={`mt-0.5 font-display text-sm font-semibold tabular-nums ${
                        erIdag ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => {
              const ukeBookinger = perFacilityPerDag.get(f.id) ?? [];
              return (
                <tr
                  key={f.id}
                  className="border-t border-border/60 align-top"
                >
                  <td className="sticky left-0 z-10 bg-card px-4 py-4">
                    <div className="font-display text-sm font-semibold">
                      {f.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Kapasitet {f.capacity}
                    </div>
                  </td>
                  {dager.map((d, i) => {
                    const dagBookinger = ukeBookinger[i] ?? [];
                    return (
                      <td
                        key={i}
                        className="border-l border-border/60 align-top"
                        style={{ minWidth: 110 }}
                      >
                        <div className="flex flex-col gap-1 p-1.5">
                          {dagBookinger
                            .sort(
                              (a, b) =>
                                new Date(a.startAt).getTime() -
                                new Date(b.startAt).getTime(),
                            )
                            .map((b) => (
                              <BookingPiller key={b.id} booking={b} />
                            ))}
                          {kanBooke && (
                            <button
                              type="button"
                              onClick={() => aapneSlot(f, d)}
                              className="rounded border border-dashed border-border/40 px-1.5 py-1 text-left font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-primary"
                              aria-label={`Ny booking ${f.name} ${DAGER[(d.getDay() + 6) % 7]} ${d.getDate()}`}
                            >
                              + Ny
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <QuickAddSessionModal
        slot={slot}
        onClose={() => {
          setSlot(null);
          setValgtFacility(null);
        }}
        spillere={spillere}
        serviceTypes={serviceTypes}
        locations={locations}
        facilities={facilityOptions}
        defaultLocationId={valgtFacility?.locationId}
        defaultFacilityId={valgtFacility?.id}
      />
    </section>
  );
}

function BookingPiller({ booking }: { booking: Booking }) {
  const start = new Date(booking.startAt);
  const tid = start.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const farge =
    booking.status === "CANCELLED"
      ? "bg-secondary text-muted-foreground line-through"
      : booking.status === "PENDING"
        ? "bg-[rgba(166,101,30,0.16)] text-[#7a4910]"
        : "bg-primary/10 text-primary";

  return (
    <Link
      href={`/admin/bookings`}
      className={`rounded px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity hover:opacity-80 ${farge}`}
      title={`${booking.user?.name ?? "Gjest"} · ${booking.serviceType.name}`}
    >
      <span className="block font-mono tabular-nums">{tid}</span>
      <span className="block truncate">{booking.user?.name ?? "Gjest"}</span>
    </Link>
  );
}

function ukenummer(d: Date): number {
  const date = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  );
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isoDate(d: Date): string {
  // Returner YYYY-MM-DD for mandag-uke
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
