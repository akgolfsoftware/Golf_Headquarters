"use client";

/**
 * Bookinger-oversikt — pixel-perfekt PR5.
 *
 * - Stat-strip topp: i dag · denne uka · brennende avbestillinger
 * - Filter-strip: status (PENDING/CONFIRMED/AVLYST) + coach + type + dato-range
 * - Sortable liste: dato, spiller, type, coach, betaling
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Flame, Calendar, Users2, ChevronRight } from "lucide-react";

export type BookingRow = {
  id: string;
  startTime: string; // ISO
  spillerNavn: string;
  type: string; // ServiceType-navn
  coachNavn: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  prisOre: number | null;
  betalt: boolean;
};

export type BookingerViewProps = {
  bookinger: BookingRow[];
  coachListe: { id: string; navn: string }[];
};

type SortKey = "dato" | "spiller" | "type" | "coach" | "betaling";

const STATUS_PILL: Record<BookingRow["status"], { bg: string; fg: string; label: string }> = {
  PENDING: { bg: "rgba(184,133,42,0.20)", fg: "#B8852A", label: "Venter" },
  CONFIRMED: { bg: "rgba(44,125,82,0.20)", fg: "#2C7D52", label: "Bekreftet" },
  CANCELLED: { bg: "rgba(163,45,45,0.18)", fg: "#A32D2D", label: "Avlyst" },
};

export function BookingerView({ bookinger, coachListe }: BookingerViewProps) {
  const [statusFilter, setStatusFilter] = useState<"alle" | BookingRow["status"]>("alle");
  const [coachFilter, setCoachFilter] = useState<string>("alle");
  const [typeFilter, setTypeFilter] = useState<string>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("dato");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const typer = Array.from(new Set(bookinger.map((b) => b.type)));

  const filtrert = useMemo(() => {
    return bookinger.filter((b) => {
      if (statusFilter !== "alle" && b.status !== statusFilter) return false;
      if (coachFilter !== "alle" && b.coachNavn !== coachFilter) return false;
      if (typeFilter !== "alle" && b.type !== typeFilter) return false;
      return true;
    });
  }, [bookinger, statusFilter, coachFilter, typeFilter]);

  const sortert = useMemo(() => {
    const a = [...filtrert];
    a.sort((x, y) => {
      let cmp = 0;
      switch (sortKey) {
        case "dato": cmp = new Date(x.startTime).getTime() - new Date(y.startTime).getTime(); break;
        case "spiller": cmp = x.spillerNavn.localeCompare(y.spillerNavn, "nb-NO"); break;
        case "type": cmp = x.type.localeCompare(y.type, "nb-NO"); break;
        case "coach": cmp = x.coachNavn.localeCompare(y.coachNavn, "nb-NO"); break;
        case "betaling": cmp = (x.betalt ? 1 : 0) - (y.betalt ? 1 : 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return a;
  }, [filtrert, sortKey, sortDir]);

  // Stat-strip
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const imorgen = new Date(idag);
  imorgen.setDate(idag.getDate() + 1);
  const uke = new Date(idag);
  uke.setDate(idag.getDate() + 7);

  const iDag = bookinger.filter((b) => {
    const d = new Date(b.startTime);
    return d >= idag && d < imorgen;
  }).length;
  const denneUka = bookinger.filter((b) => {
    const d = new Date(b.startTime);
    return d >= idag && d < uke;
  }).length;
  const brennendeAvbestillinger = bookinger.filter(
    (b) => b.status === "CANCELLED" && new Date(b.startTime) >= idag,
  ).length;

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKort
          label="I dag"
          val={iDag}
          sub="bookinger"
          icon={Calendar}
          featured
        />
        <StatKort
          label="Denne uka"
          val={denneUka}
          sub="kommende"
          icon={Users2}
        />
        <StatKort
          label="Brennende"
          val={brennendeAvbestillinger}
          sub="avbestillinger"
          icon={Flame}
          warn
        />
      </div>

      {/* Filter-strip */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Filtre
          </span>

          <FilterPills
            label="Status"
            value={statusFilter}
            options={[
              { key: "alle", label: "Alle" },
              { key: "PENDING", label: "Venter" },
              { key: "CONFIRMED", label: "Bekreftet" },
              { key: "CANCELLED", label: "Avlyst" },
            ]}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
          />

          {coachListe.length > 1 && (
            <FilterPills
              label="Coach"
              value={coachFilter}
              options={[
                { key: "alle", label: "Alle" },
                ...coachListe.map((c) => ({ key: c.navn, label: c.navn })),
              ]}
              onChange={setCoachFilter}
            />
          )}

          {typer.length > 1 && (
            <FilterPills
              label="Type"
              value={typeFilter}
              options={[
                { key: "alle", label: "Alle" },
                ...typer.map((t) => ({ key: t, label: t })),
              ]}
              onChange={setTypeFilter}
            />
          )}

          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {sortert.length} av {bookinger.length}
          </span>
        </div>
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_0.8fr_0.8fr_40px] gap-4 border-b border-border bg-secondary px-5 py-3">
          <SortHeader k="dato" label="Dato" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} />
          <SortHeader k="spiller" label="Spiller" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} />
          <SortHeader k="type" label="Type" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} />
          <SortHeader k="coach" label="Coach" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Status</span>
          <SortHeader k="betaling" label="Betaling" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} />
          <span />
        </div>
        {sortert.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>Ingen bookinger som matcher filtrene.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sortert.map((b) => (
              <li
                key={b.id}
                className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_0.8fr_0.8fr_40px] items-center gap-4 px-5 py-4 transition hover:bg-secondary/40"
              >
                <div className="font-mono text-xs tabular-nums text-foreground">
                  {fmtDato(b.startTime)}
                </div>
                <div className="text-sm font-medium text-foreground">{b.spillerNavn}</div>
                <div className="text-sm text-muted-foreground">{b.type}</div>
                <div className="text-sm text-muted-foreground">{b.coachNavn}</div>
                <div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
                    style={{
                      background: STATUS_PILL[b.status].bg,
                      color: STATUS_PILL[b.status].fg,
                    }}
                  >
                    {STATUS_PILL[b.status].label}
                  </span>
                </div>
                <div className="font-mono text-xs tabular-nums">
                  {b.prisOre != null ? (
                    <span className={b.betalt ? "text-foreground" : "text-[#B8852A]"}>
                      {(b.prisOre / 100).toLocaleString("nb-NO")} kr
                      {!b.betalt && <span className="ml-1 text-[10px]">(venter)</span>}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <Link
                  href={`/admin/bookinger/${b.id}`}
                  className="flex items-center justify-center text-muted-foreground transition hover:text-foreground"
                  aria-label="Detaljer"
                >
                  <ChevronRight size={16} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Komponenter ---

function StatKort({
  label,
  val,
  sub,
  icon: Icon,
  featured,
  warn,
}: {
  label: string;
  val: number;
  sub: string;
  icon: React.ElementType;
  featured?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        featured
          ? "border-transparent bg-gradient-to-br from-primary to-[#003A2A] text-primary-foreground"
          : warn
          ? "border-[#B8852A]/30 bg-[#FFFBF5]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
            featured ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <Icon size={16} className={featured ? "text-primary-foreground/60" : warn ? "text-[#B8852A]" : "text-muted-foreground"} />
      </div>
      <div className={`mt-2 font-display text-3xl font-semibold tabular-nums ${warn ? "text-[#B8852A]" : ""}`}>
        {val}
      </div>
      <div
        className={`mt-0.5 text-xs ${
          featured ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

function FilterPills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">{label}</span>
      <div className="inline-flex gap-1 rounded-full bg-secondary p-1">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              value === o.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortHeader({
  k,
  label,
  sortKey,
  sortDir,
  toggle,
}: {
  k: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  toggle: (k: SortKey) => void;
}) {
  const aktiv = sortKey === k;
  return (
    <button
      type="button"
      onClick={() => toggle(k)}
      className={`group flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
        aktiv ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      <ArrowUpDown size={10} className={aktiv ? "opacity-100" : "opacity-40"} />
      {aktiv && <span className="ml-0.5 text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

function fmtDato(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
