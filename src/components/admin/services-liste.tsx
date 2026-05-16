"use client";

import { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceForm } from "@/app/admin/services/service-form";

type Category = "coach" | "studio" | "green" | "group" | "event";

const CATEGORY_LABEL: Record<Category, string> = {
  coach: "Coaching",
  studio: "Studio",
  green: "Greenfee",
  group: "Gruppe",
  event: "Event",
};

const CATEGORY_STYLE: Record<Category, { bg: string; dot: string }> = {
  coach: { bg: "bg-primary/15 text-primary", dot: "bg-primary" },
  studio: {
    bg: "bg-[rgba(91,124,184,0.15)] text-[#3b5994]",
    dot: "bg-[#3b5994]",
  },
  green: {
    bg: "bg-[rgba(22,163,74,0.14)] text-[#0f7536]",
    dot: "bg-[#16A34A]",
  },
  group: {
    bg: "bg-[rgba(244,196,48,0.22)] text-[#7a5a08]",
    dot: "bg-[#F4C430]",
  },
  event: {
    bg: "bg-[rgba(217,84,123,0.16)] text-[#8a2f55]",
    dot: "bg-[#d9547b]",
  },
};

function deriveCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes("studio") || n.includes("trackman") || n.includes("range")) {
    return "studio";
  }
  if (n.includes("green") || n.includes("18 hull") || n.includes("9 hull")) {
    return "green";
  }
  if (n.includes("grupp") || n.includes("wang") || n.includes("dame")) {
    return "group";
  }
  if (n.includes("camp") || n.includes("event") || n.includes("turnering")) {
    return "event";
  }
  return "coach";
}

export type ServiceListItem = {
  id: string;
  name: string;
  description: string | null;
  priceOre: number;
  durationMin: number;
  active: boolean;
  _count: { bookings: number };
};

type KategoriFilter = "ALLE" | Category;
type StatusFilter = "ALLE" | "AKTIV" | "INAKTIV";
type Sortering = "navn" | "pris-lav" | "pris-hoy";

export function ServicesListe({ services }: { services: ServiceListItem[] }) {
  const [sok, setSok] = useState("");
  const [kategori, setKategori] = useState<KategoriFilter>("ALLE");
  const [status, setStatus] = useState<StatusFilter>("ALLE");
  const [sortering, setSortering] = useState<Sortering>("navn");

  const filtered = useMemo(() => {
    const q = sok.trim().toLowerCase();
    let liste = services.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (status === "AKTIV" && !s.active) return false;
      if (status === "INAKTIV" && s.active) return false;
      if (kategori !== "ALLE" && deriveCategory(s.name) !== kategori) return false;
      return true;
    });

    if (sortering === "navn") {
      liste = [...liste].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return a.name.localeCompare(b.name, "nb");
      });
    } else if (sortering === "pris-lav") {
      liste = [...liste].sort((a, b) => a.priceOre - b.priceOre);
    } else if (sortering === "pris-hoy") {
      liste = [...liste].sort((a, b) => b.priceOre - a.priceOre);
    }

    return liste;
  }, [services, sok, kategori, status, sortering]);

  const totalCount = services.length;
  const sorteringsTekst =
    sortering === "navn"
      ? "Aktiv → Navn ↑"
      : sortering === "pris-lav"
        ? "Pris ↑"
        : "Pris ↓";

  return (
    <div className="space-y-4">
      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Søk tjeneste"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        {/* Kategori */}
        <SelectChip
          label="Kategori"
          value={kategori}
          onChange={(v) => setKategori(v as KategoriFilter)}
          options={[
            { value: "ALLE", label: "Alle kategorier" },
            { value: "coach", label: "Coaching" },
            { value: "studio", label: "Studio" },
            { value: "green", label: "Greenfee" },
            { value: "group", label: "Gruppe" },
            { value: "event", label: "Event" },
          ]}
        />

        {/* Status */}
        <SelectChip
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
          options={[
            { value: "ALLE", label: "Alle" },
            { value: "AKTIV", label: "Aktiv" },
            { value: "INAKTIV", label: "Inaktiv" },
          ]}
        />

        {/* Sortering */}
        <SelectChip
          label="Sortering"
          value={sortering}
          onChange={(v) => setSortering(v as Sortering)}
          options={[
            { value: "navn", label: "Navn (A→Å)" },
            { value: "pris-lav", label: "Pris ↑" },
            { value: "pris-hoy", label: "Pris ↓" },
          ]}
        />
      </div>

      {/* Liste */}
      {services.length === 0 ? (
        <EmptyState
          icon={Package}
          titleItalic="Ingen tjenester"
          titleTrail="ennå"
          sub="Lag din første tjeneste for å åpne booking. Vi anbefaler å starte med 1:1 Coaching 60 min — så kan du legge til flere etter hvert."
          cta={<ServiceForm triggerLabel="+ Lag første tjeneste" />}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-mono text-[12px] text-muted-foreground">
            Ingen tjenester matcher filteret.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            <span>
              Viser{" "}
              <b className="font-semibold text-foreground">{filtered.length}</b>{" "}
              av {totalCount}
            </span>
            <span className="text-foreground">Sortert: {sorteringsTekst}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="border-b border-border bg-secondary/30 text-left">
                <tr>
                  <Th>Tjeneste</Th>
                  <Th>Varighet</Th>
                  <Th className="text-right">Pris</Th>
                  <Th>Kategori</Th>
                  <Th>Bookinger</Th>
                  <Th>Aktiv</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const cat = deriveCategory(s.name);
                  const catStyle = CATEGORY_STYLE[cat];
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">
                          {s.name}
                        </div>
                        {s.description && (
                          <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                            {s.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold tabular-nums text-foreground">
                        {s.durationMin} min
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                        {(s.priceOre / 100).toLocaleString("nb-NO")} kr
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${catStyle.bg}`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${catStyle.dot}`}
                          />
                          {CATEGORY_LABEL[cat]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {s._count.bookings}
                          </span>
                          <Sparkline />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <ToggleVisual on={s.active} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <ServiceForm
                          initial={{
                            id: s.id,
                            name: s.name,
                            description: s.description,
                            priceOre: s.priceOre,
                            durationMin: s.durationMin,
                            active: s.active,
                          }}
                          triggerLabel="Endre"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectChip<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em]">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="cursor-pointer bg-transparent text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Sparkline() {
  return (
    <svg
      width="56"
      height="18"
      viewBox="0 0 60 20"
      aria-hidden="true"
      className="text-primary"
    >
      <polyline
        points="0,15 10,12 20,14 30,8 40,10 50,6 60,4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleVisual({ on }: { on: boolean }) {
  return (
    <span
      role="img"
      aria-label={on ? "Aktiv" : "Inaktiv"}
      className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? "left-4" : "left-0.5"
        }`}
      />
    </span>
  );
}

function Th({
  children = null,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
