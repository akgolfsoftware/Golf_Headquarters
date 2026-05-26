"use client";

// Filter-bar for /admin/drills.
// Synker state inn i URL via searchParams. Server-renderer leser disse og
// filtrerer i Prisma. Collapsible på mobile.

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { startTransition, useState } from "react";
import type {
  PyramidArea,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";

type InitialFilters = {
  q: string;
  disipliner: PyramidArea[];
  skills: SkillArea[];
  envs: SessionEnvironment[];
  minNgf?: NgfKategori;
  maxNgf?: NgfKategori;
  morad: boolean;
};

const DISIPLINER: { v: PyramidArea; label: string }[] = [
  { v: "FYS", label: "FYS" },
  { v: "TEK", label: "TEK" },
  { v: "SLAG", label: "SLAG" },
  { v: "SPILL", label: "SPILL" },
  { v: "TURN", label: "TURN" },
];

const SKILLS: { v: SkillArea; label: string }[] = [
  { v: "TEE_TOTAL", label: "Tee" },
  { v: "TILNAERMING", label: "Tilnaerming" },
  { v: "AROUND_GREEN", label: "Rundt green" },
  { v: "PUTTING", label: "Putt" },
  { v: "SPILL", label: "Spill" },
];

const ENVS: { v: SessionEnvironment; label: string }[] = [
  { v: "RANGE", label: "Range" },
  { v: "BANE", label: "Bane" },
  { v: "STUDIO", label: "Studio" },
  { v: "HJEM", label: "Hjem" },
  { v: "SIMULATOR", label: "Sim" },
];

const NGF: NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

export function DrillFilterBar({ initial }: { initial: InitialFilters }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState(initial.q);

  function commit(next: Partial<InitialFilters & { q?: string }>) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    const set = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    const current = {
      q,
      disipliner: initial.disipliner,
      skills: initial.skills,
      envs: initial.envs,
      minNgf: initial.minNgf,
      maxNgf: initial.maxNgf,
      morad: initial.morad,
      ...next,
    };
    set("q", current.q ?? "");
    set("disiplin", current.disipliner.join(","));
    set("skill", current.skills.join(","));
    set("env", current.envs.join(","));
    set("minNgf", current.minNgf ?? "");
    set("maxNgf", current.maxNgf ?? "");
    set("morad", current.morad ? "1" : "");
    startTransition(() => {
      router.push(`/admin/drills?${params.toString()}`);
    });
  }

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function reset() {
    setQ("");
    startTransition(() => router.push("/admin/drills"));
  }

  const filterAktive =
    initial.disipliner.length +
    initial.skills.length +
    initial.envs.length +
    (initial.minNgf ? 1 : 0) +
    (initial.maxNgf ? 1 : 0) +
    (initial.morad ? 1 : 0) +
    (q ? 1 : 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit({ q });
          }}
          className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm"
        >
          <Search size={14} strokeWidth={1.75} className="text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sok drill-navn, beskrivelse eller tag"
            className="h-7 flex-1 bg-transparent text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground sm:text-sm"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                commit({ q: "" });
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fjern sok"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-11 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium hover:border-border sm:h-9"
            aria-expanded={expanded}
          >
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            Filter
            {filterAktive > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                {filterAktive}
              </span>
            )}
          </button>
          {filterAktive > 0 && (
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-md px-4 text-xs text-muted-foreground hover:text-foreground sm:h-9"
            >
              Tilbakestill
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <Group label="Disiplin">
            {DISIPLINER.map((d) => (
              <Pill
                key={d.v}
                active={initial.disipliner.includes(d.v)}
                onClick={() =>
                  commit({ disipliner: toggle(initial.disipliner, d.v) })
                }
              >
                {d.label}
              </Pill>
            ))}
          </Group>

          <Group label="Skill area">
            {SKILLS.map((s) => (
              <Pill
                key={s.v}
                active={initial.skills.includes(s.v)}
                onClick={() => commit({ skills: toggle(initial.skills, s.v) })}
              >
                {s.label}
              </Pill>
            ))}
          </Group>

          <Group label="Environment">
            {ENVS.map((e) => (
              <Pill
                key={e.v}
                active={initial.envs.includes(e.v)}
                onClick={() => commit({ envs: toggle(initial.envs, e.v) })}
              >
                {e.label}
              </Pill>
            ))}
          </Group>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              NGF-kategori
            </span>
            <div className="flex items-center gap-2">
              <select
                value={initial.minNgf ?? ""}
                onChange={(e) =>
                  commit({
                    minNgf: e.target.value
                      ? (e.target.value as NgfKategori)
                      : undefined,
                  })
                }
                className="h-11 rounded-md border border-input bg-card px-4 text-base sm:h-9 sm:text-sm"
              >
                <option value="">Fra (A)</option>
                {NGF.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">→</span>
              <select
                value={initial.maxNgf ?? ""}
                onChange={(e) =>
                  commit({
                    maxNgf: e.target.value
                      ? (e.target.value as NgfKategori)
                      : undefined,
                  })
                }
                className="h-11 rounded-md border border-input bg-card px-4 text-base sm:h-9 sm:text-sm"
              >
                <option value="">Til (L)</option>
                {NGF.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={initial.morad}
              onChange={(e) => commit({ morad: e.target.checked })}
              className="accent-primary"
            />
            <span>Kun MORAD-drills</span>
          </label>
        </div>
      )}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:min-w-[100px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
