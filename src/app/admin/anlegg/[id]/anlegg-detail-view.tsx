"use client";

/**
 * Anlegg-detalj — KART + KALENDER tab-view.
 *
 * Client component for tab-toggle og kart-tooltip-interaksjon.
 * SVG-kart med hotspots (mapX/mapY i 0-100 %) som åpner drawer ved klikk.
 */

import { useMemo, useState } from "react";
import { Calendar, Map as MapIcon } from "lucide-react";

import type { FacilityType } from "@/generated/prisma/client";

type Booking = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  notes: string | null;
  userName: string | null;
  serviceName: string | null;
};

type Facility = {
  id: string;
  name: string;
  type: FacilityType;
  capacity: number;
  isIndoor: boolean;
  description: string | null;
  mapX: number | null;
  mapY: number | null;
  bookings: Booking[];
};

export type AnleggDetailData = {
  location: { id: string; name: string; address: string };
  facilities: Facility[];
  stats: {
    total: number;
    opptattNaa: number;
    bookingerIDag: number;
    ledigNaa: number;
  };
  dagISO: string;
};

type Mode = "kart" | "kalender";

const TYPE_LABEL: Record<FacilityType, string> = {
  STUDIO: "Studio",
  RANGE_1F: "Range 1. etg",
  RANGE_2F: "Range 2. etg",
  PUTTING_GREEN: "Putting Green",
  SHORT_GAME: "Nærspill",
  COURSE_9H: "9-hullsbane",
  COURSE_18H: "18-hullsbane",
  SPECIFIC_HOLES: "Hull-scenario",
  GENERAL: "Generell",
};

export function AnleggDetailView({ data }: { data: AnleggDetailData }) {
  const [mode, setMode] = useState<Mode>("kart");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => data.facilities.find((f) => f.id === selectedId) ?? null,
    [data.facilities, selectedId],
  );

  // Kun fasiliteter med koordinater på kartet
  const mapFacilities = data.facilities.filter(
    (f) => f.mapX != null && f.mapY != null,
  );
  const calendarFacilities = data.facilities;

  return (
    <div className="space-y-6">
      {/* Mode-bar */}
      <nav
        aria-label="Visningsmodus"
        className="flex gap-1 border-b border-border"
      >
        <ModeTab
          active={mode === "kart"}
          onClick={() => setMode("kart")}
          icon={<MapIcon size={14} strokeWidth={1.75} />}
          label="Kart"
        />
        <ModeTab
          active={mode === "kalender"}
          onClick={() => setMode("kalender")}
          icon={<Calendar size={14} strokeWidth={1.75} />}
          label="Kalender"
        />
      </nav>

      {/* Status-strip */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-lg border border-border bg-card px-4 py-2 sm:px-4 sm:py-4">
        <Stat
          label="Fasiliteter"
          value={String(data.stats.total)}
          tone="default"
        />
        <Stat
          label="Opptatt nå"
          value={String(data.stats.opptattNaa)}
          tone="busy"
        />
        <Stat
          label="Bookinger i dag"
          value={String(data.stats.bookingerIDag)}
          tone="booked"
        />
        <Stat
          label="Ledig nå"
          value={String(data.stats.ledigNaa)}
          tone="free"
        />
      </div>

      {mode === "kart" && (
        <KartView
          facilities={mapFacilities}
          allCount={data.facilities.length}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      )}

      {mode === "kalender" && (
        <KalenderView
          facilities={calendarFacilities}
          dagISO={data.dagISO}
          onSelect={setSelectedId}
        />
      )}

      {selected && (
        <FasilitetsDrawer
          facility={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative inline-flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />
      )}
    </button>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "busy" | "booked" | "free";
}) {
  const dotColor =
    tone === "busy"
      ? "bg-destructive"
      : tone === "booked"
        ? "bg-primary"
        : tone === "free"
          ? "bg-accent"
          : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden />
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

// ============ KART VIEW ============

function KartView({
  facilities,
  allCount,
  onSelect,
  selectedId,
}: {
  facilities: Facility[];
  allCount: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  if (facilities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Ingen fasiliteter har kart-koordinater ennå. Legg til mapX/mapY på
        fasiliteten for å vise den her.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        <strong className="text-foreground">{facilities.length}</strong> av{" "}
        {allCount} fasiliteter på kartet — resten vises kun i kalender.
      </div>

      {/* SVG-kart med bakgrunn og hotspots */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/90 via-primary to-foreground">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Anlegg-illustrasjon (forenklet) */}
          <defs>
            <pattern
              id="grass"
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
            >
              <rect width="4" height="4" fill="currentColor" opacity="0.05" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grass)" />
          {/* Fairway-band */}
          <path
            d="M 10 60 Q 40 50 65 55 T 95 50"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Range-felt */}
          <rect
            x="35"
            y="40"
            width="12"
            height="20"
            rx="2"
            fill="rgba(209,248,67,0.10)"
          />
        </svg>

        {facilities.map((f, idx) => {
          const isSelected = f.id === selectedId;
          const aktivBooking = f.bookings.find((b) => {
            const now = new Date();
            return new Date(b.startAt) <= now && new Date(b.endAt) >= now;
          });
          const tone = aktivBooking
            ? "busy"
            : f.bookings.length > 0
              ? "booked"
              : "free";
          const bg =
            tone === "busy"
              ? "bg-destructive text-destructive-foreground"
              : tone === "booked"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground";

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              aria-label={`${f.name} — ${f.bookings.length} bookinger i dag`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
                isSelected ? "z-20 scale-110" : "z-10"
              }`}
              style={{ left: `${f.mapX}%`, top: `${f.mapY}%` }}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold shadow-lg ring-2 ring-background ${bg}`}
              >
                {idx + 1}
              </span>
              <span className="mt-1 block whitespace-nowrap rounded-sm bg-background/95 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-foreground shadow">
                {f.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <LegendDot tone="busy" label="Opptatt nå" />
        <LegendDot tone="booked" label="Reservert i dag" />
        <LegendDot tone="free" label="Ledig" />
      </div>
    </div>
  );
}

function LegendDot({
  tone,
  label,
}: {
  tone: "busy" | "booked" | "free";
  label: string;
}) {
  const c =
    tone === "busy"
      ? "bg-destructive"
      : tone === "booked"
        ? "bg-primary"
        : "bg-accent";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${c}`} />
      {label}
    </span>
  );
}

// ============ KALENDER VIEW ============

const TIME_START_H = 7; // 07:00
const TIME_END_H = 22; // 22:00
const SLOTS = TIME_END_H - TIME_START_H; // 15 timer
const SLOT_WIDTH = 60; // 60 px per time → totalt 900 px

function KalenderView({
  facilities,
  dagISO,
  onSelect,
}: {
  facilities: Facility[];
  dagISO: string;
  onSelect: (id: string) => void;
}) {
  const dag = new Date(dagISO);
  const dagLabel = dag.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold capitalize">
          {dagLabel}
        </h2>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {TIME_START_H}:00 – {TIME_END_H}:00
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        {/* Header: time-akse */}
        <div className="flex border-b border-border bg-muted/40">
          <div className="w-[200px] shrink-0 border-r border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Fasilitet
          </div>
          <div
            className="relative h-10"
            style={{ width: `${SLOTS * SLOT_WIDTH}px` }}
          >
            {Array.from({ length: SLOTS + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-border font-mono text-[10px] text-muted-foreground"
                style={{ left: `${i * SLOT_WIDTH}px` }}
              >
                <span className="ml-1 mt-2 inline-block">
                  {String(TIME_START_H + i).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rader: én per fasilitet */}
        {facilities.map((f, idx) => (
          <div
            key={f.id}
            className="flex border-b border-border last:border-b-0 hover:bg-muted/20"
          >
            <button
              type="button"
              onClick={() => onSelect(f.id)}
              className="flex w-[200px] shrink-0 flex-col items-start gap-1 border-r border-border px-4 py-2 text-left transition-colors hover:bg-muted/30"
            >
              <span className="flex items-center gap-2 font-display text-sm font-semibold">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {idx + 1}
                </span>
                {f.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {TYPE_LABEL[f.type]} · {f.capacity} pl
              </span>
            </button>
            <div
              className="relative h-16"
              style={{ width: `${SLOTS * SLOT_WIDTH}px` }}
            >
              {/* Time-grid linjer */}
              {Array.from({ length: SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-border/60"
                  style={{ left: `${i * SLOT_WIDTH}px` }}
                />
              ))}
              {/* Bookinger */}
              {f.bookings.map((b) => {
                const start = new Date(b.startAt);
                const end = new Date(b.endAt);
                const startH =
                  start.getHours() + start.getMinutes() / 60;
                const endH = end.getHours() + end.getMinutes() / 60;
                const leftPx = (startH - TIME_START_H) * SLOT_WIDTH;
                const widthPx = (endH - startH) * SLOT_WIDTH;
                if (widthPx <= 0) return null;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelect(f.id)}
                    className="absolute top-2 flex h-12 flex-col items-start justify-center overflow-hidden rounded-md border border-primary/30 bg-primary/15 px-2 text-left transition-colors hover:bg-primary/25"
                    style={{
                      left: `${leftPx}px`,
                      width: `${Math.max(40, widthPx - 4)}px`,
                    }}
                  >
                    <span className="truncate font-mono text-[10px] font-semibold text-primary">
                      {b.userName ?? "Uten spiller"}
                    </span>
                    <span className="truncate font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      {b.serviceName ?? b.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {facilities.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Ingen fasiliteter på dette anlegget.
          </div>
        )}
      </div>
    </div>
  );
}

// ============ DRAWER ============

function FasilitetsDrawer({
  facility,
  onClose,
}: {
  facility: Facility;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label={facility.name}
      className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-40 flex w-full md:max-w-md flex-col gap-4 overflow-y-auto border-l border-border bg-card p-4 sm:p-6 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {TYPE_LABEL[facility.type]} · {facility.isIndoor ? "Innendørs" : "Utendørs"}
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold">
            {facility.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          Lukk ×
        </button>
      </div>

      {facility.description && (
        <p className="text-sm text-muted-foreground">{facility.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <DrawerStat label="Kapasitet" value={`${facility.capacity} plasser`} />
        <DrawerStat
          label="Bookinger i dag"
          value={String(facility.bookings.length)}
        />
      </div>

      <div className="space-y-2">
        <h4 className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Bookinger i dag
        </h4>
        {facility.bookings.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            Ingen bookinger i dag.
          </div>
        )}
        {facility.bookings.map((b) => {
          const start = new Date(b.startAt);
          const end = new Date(b.endAt);
          return (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-md border border-border bg-background p-4"
            >
              <div>
                <div className="text-sm font-medium">
                  {b.userName ?? "Uten spiller"}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {start.toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  –
                  {end.toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]">
                {b.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DrawerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}
