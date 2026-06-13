"use client";

/**
 * TrackManView — oversikt over køller med snittdata.
 * Klikk kølle for å se detaljer (V2: alle slag + spredning).
 */

import { useState } from "react";
import { Radar, Target, Activity } from "lucide-react";
import type { TrackManData } from "@/app/portal/analysere/actions";

export type TrackManViewProps = {
  data: TrackManData;
};

export function TrackManView({ data }: TrackManViewProps) {
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const selected = data.clubs.find((c) => c.club === selectedClub);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.clubs.map((club) => (
          <button
            key={club.club}
            type="button"
            onClick={() => setSelectedClub(club.club)}
            className={
              "rounded-xl border p-4 text-left transition-all " +
              (selectedClub === club.club
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40")
            }
          >
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">{club.club}</span>
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {club.avgTotal != null ? `${club.avgTotal} m` : "—"}
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              {club.shots} slag · snitt total
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {selected.club} · detaljer
            </h3>
            <button
              type="button"
              onClick={() => setSelectedClub(null)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Lukk
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Snitt total" value={selected.avgTotal != null ? `${selected.avgTotal} m` : "—"} icon={Target} />
            <Kpi label="Smash factor" value={selected.avgSmash != null ? String(selected.avgSmash) : "—"} icon={Activity} />
            <Kpi label="Ballhastighet" value={selected.avgBallSpeed != null ? `${selected.avgBallSpeed} mph` : "—"} icon={Radar} />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Spredningsplott og alle enkeltlag for denne køllen kommer i V2.
          </p>
        </div>
      )}

      {data.clubs.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Radar className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">Ingen TrackMan-data registrert ennå.</p>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
