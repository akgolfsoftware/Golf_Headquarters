"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ChevronDown, Filter } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";

type TestRow = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  protocol: unknown;
};

type StatRow = {
  takenAt: string; // ISO
  beste: number;
  antall: number;
};

type Props = {
  tests: TestRow[];
  stats: Record<string, StatRow | undefined>;
};

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-primary/12 text-primary",
  SLAG: "bg-accent/40 text-accent-foreground",
  SPILL: "bg-accent/20 text-accent-foreground",
  TURN: "bg-secondary text-muted-foreground",
};

const PYR_DOT: Record<PyramidArea, string> = {
  FYS: "bg-primary/80",
  TEK: "bg-primary",
  SLAG: "bg-accent-foreground",
  SPILL: "bg-accent",
  TURN: "bg-muted-foreground",
};

// Sorterings-rekkefølge for kategorier: TEK → SLAG → FYS → SPILL → TURN
const KATEGORI_REKKEFOLGE: Record<PyramidArea, number> = {
  TEK: 0,
  SLAG: 1,
  FYS: 2,
  SPILL: 3,
  TURN: 4,
};

type KategoriFilter = "ALLE" | PyramidArea;
type StatusFilter = "ALLE" | "ALDRI" | "TATT";
type SorteringValg = "KATEGORI" | "SIST_TATT" | "NAVN";

const KATEGORIER: { value: KategoriFilter; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "TEK", label: "Teknisk" },
  { value: "SLAG", label: "Slag" },
  { value: "FYS", label: "Fysisk" },
  { value: "SPILL", label: "Spill" },
  { value: "TURN", label: "Turnering" },
];

const STATUSER: { value: StatusFilter; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "ALDRI", label: "Aldri tatt" },
  { value: "TATT", label: "Tatt" },
];

const SORTERINGER: { value: SorteringValg; label: string }[] = [
  { value: "KATEGORI", label: "Kategori" },
  { value: "SIST_TATT", label: "Sist tatt" },
  { value: "NAVN", label: "Navn" },
];

export function TesterListe({ tests, stats }: Props) {
  const [sok, setSok] = useState("");
  const [kategori, setKategori] = useState<KategoriFilter>("ALLE");
  const [status, setStatus] = useState<StatusFilter>("ALLE");
  const [sortering, setSortering] = useState<SorteringValg>("KATEGORI");
  const [kategoriAapen, setKategoriAapen] = useState(false);
  const [statusAapen, setStatusAapen] = useState(false);
  const [sorteringAapen, setSorteringAapen] = useState(false);

  const filtrerte = useMemo(() => {
    let liste = tests.filter((t) => {
      if (kategori !== "ALLE" && t.pyramidArea !== kategori) return false;
      const stat = stats[t.id];
      if (status === "TATT" && !stat) return false;
      if (status === "ALDRI" && stat) return false;
      if (sok && !t.name.toLowerCase().includes(sok.toLowerCase())) return false;
      return true;
    });

    liste = [...liste].sort((a, b) => {
      if (sortering === "KATEGORI") {
        const diff =
          KATEGORI_REKKEFOLGE[a.pyramidArea] - KATEGORI_REKKEFOLGE[b.pyramidArea];
        return diff !== 0 ? diff : a.name.localeCompare(b.name, "nb");
      }
      if (sortering === "NAVN") return a.name.localeCompare(b.name, "nb");
      // SIST_TATT
      const sa = stats[a.id]?.takenAt;
      const sb = stats[b.id]?.takenAt;
      if (sa && sb) return sb.localeCompare(sa);
      if (sa) return -1;
      if (sb) return 1;
      return a.name.localeCompare(b.name, "nb");
    });

    return liste;
  }, [tests, stats, sok, kategori, status, sortering]);

  return (
    <>
      {/* Filter-row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            aria-label="Søk i tester"
            placeholder="Søk test..."
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
          />
        </div>

        <Dropdown
          label={`Kategori: ${KATEGORIER.find((k) => k.value === kategori)?.label}`}
          open={kategoriAapen}
          onToggle={() => {
            setKategoriAapen((v) => !v);
            setStatusAapen(false);
            setSorteringAapen(false);
          }}
          options={KATEGORIER}
          selected={kategori}
          onSelect={(v) => {
            setKategori(v as KategoriFilter);
            setKategoriAapen(false);
          }}
        />

        <Dropdown
          label={`Status: ${STATUSER.find((s) => s.value === status)?.label}`}
          open={statusAapen}
          onToggle={() => {
            setStatusAapen((v) => !v);
            setKategoriAapen(false);
            setSorteringAapen(false);
          }}
          options={STATUSER}
          selected={status}
          onSelect={(v) => {
            setStatus(v as StatusFilter);
            setStatusAapen(false);
          }}
        />

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => {
              setSorteringAapen((v) => !v);
              setKategoriAapen(false);
              setStatusAapen(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground hover:border-primary"
          >
            <Filter size={13} strokeWidth={1.75} />
            Sortér: {SORTERINGER.find((s) => s.value === sortering)?.label}
            <ChevronDown size={11} strokeWidth={1.75} />
          </button>
          {sorteringAapen && (
            <ul className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-md border border-border bg-card shadow-md">
              {SORTERINGER.map((s) => (
                <li key={s.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setSortering(s.value);
                      setSorteringAapen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-secondary ${
                      sortering === s.value ? "font-semibold text-primary" : "text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Resultat-tabell */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className="hidden border-b border-border bg-muted/40 px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid"
          style={{
            gridTemplateColumns: "1.7fr 1fr 0.9fr 1fr 110px",
            gap: "14px",
          }}
        >
          <div>Test</div>
          <div>Sist tatt</div>
          <div>Beste</div>
          <div>Forsøk</div>
          <div />
        </div>

        {filtrerte.length === 0 ? (
          <div className="px-6 py-12 text-center font-mono text-sm text-muted-foreground">
            Ingen tester matcher filtrene.
          </div>
        ) : (
          <ul>
            {filtrerte.map((t) => {
              const stat = stats[t.id];
              const totalShots = (t.protocol as { totalShots?: number } | null)?.totalShots;
              return (
                <li key={t.id} className="border-b border-border/60 last:border-0">
                  <Link
                    href={`/portal/tren/tester/${t.id}`}
                    className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1.7fr_1fr_0.9fr_1fr_110px]"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-foreground">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] ${PYR_PILL[t.pyramidArea]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${PYR_DOT[t.pyramidArea]}`}
                            aria-hidden="true"
                          />
                          {PYR_LABEL[t.pyramidArea]}
                        </span>
                        {totalShots && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {totalShots} slag
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground tabular-nums">
                      {stat ? (
                        new Date(stat.takenAt).toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="italic">Aldri tatt</span>
                      )}
                    </div>
                    <div className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {stat ? (
                        stat.beste.toFixed(1).replace(".", ",")
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground tabular-nums">
                      {stat ? `${stat.antall} forsøk` : "Ingen forsøk"}
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                      Ta test →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function Dropdown<T extends string>({
  label,
  open,
  onToggle,
  options,
  selected,
  onSelect,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground hover:border-primary"
      >
        {label} <ChevronDown size={11} strokeWidth={1.75} />
      </button>
      {open && (
        <ul className="absolute left-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-md border border-border bg-card shadow-md">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => onSelect(o.value)}
                className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-secondary ${
                  selected === o.value ? "font-semibold text-primary" : "text-foreground"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
