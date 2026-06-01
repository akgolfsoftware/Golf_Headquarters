"use client";

/**
 * Venstre sidebar for /admin/analyse.
 *
 * Spillervelger + periodevelger + visningsvelger + eksport-knapper.
 * Bruker URL-state slik at lenker er delbare og siden er server-rendret.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  BarChart3,
  Grid3X3,
  LineChart,
  Activity,
  Dumbbell,
  ClipboardCheck,
  Download,
  Printer,
  Target,
} from "lucide-react";

type Spiller = {
  id: string;
  name: string;
  avatarUrl: string | null;
  hcp: number | null;
};

type View =
  | "oversikt"
  | "krysstabell"
  | "trender"
  | "sg"
  | "fys"
  | "plan-faktisk"
  | "compliance";

const VIEWS: { kode: View; label: string; ikon: React.ElementType }[] = [
  { kode: "oversikt", label: "Oversikt", ikon: BarChart3 },
  { kode: "krysstabell", label: "Krysstabell", ikon: Grid3X3 },
  { kode: "trender", label: "Trender", ikon: LineChart },
  { kode: "sg", label: "Strokes Gained", ikon: Activity },
  { kode: "fys", label: "Fysisk", ikon: Dumbbell },
  { kode: "plan-faktisk", label: "Plan vs faktisk", ikon: ClipboardCheck },
  { kode: "compliance", label: "Compliance", ikon: Target },
];

const PERIODER = [
  { kode: "7d", label: "7 d" },
  { kode: "30d", label: "30 d" },
  { kode: "90d", label: "90 d" },
  { kode: "365d", label: "1 år" },
];

export function AnalyseSidebar({
  spillere,
  valgtStudentId,
  valgtPeriode,
  valgtView,
}: {
  spillere: Spiller[];
  valgtStudentId: string;
  valgtPeriode: string;
  valgtView: View;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  function naviger(patch: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) params.set(k, v);
    startTransition(() => {
      router.push(`/admin/analyse?${params.toString()}`);
    });
  }

  return (
    <aside
      aria-label="Analysefilter"
      className="space-y-4 lg:sticky lg:top-6 lg:self-start"
    >
      {/* Spillervelger */}
      <section className="rounded-lg border border-border bg-card p-4">
        <label
          htmlFor="analyse-spiller"
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
        >
          Spiller
        </label>
        <select
          id="analyse-spiller"
          value={valgtStudentId}
          onChange={(e) => naviger({ studentId: e.target.value })}
          disabled={pending}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        >
          {spillere.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.hcp !== null ? ` (hcp ${s.hcp})` : ""}
            </option>
          ))}
        </select>
      </section>

      {/* Periode */}
      <section className="rounded-lg border border-border bg-card p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Periode
        </span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {PERIODER.map((p) => {
            const aktiv = valgtPeriode === p.kode;
            return (
              <button
                key={p.kode}
                type="button"
                onClick={() => naviger({ periode: p.kode })}
                disabled={pending}
                className={`rounded-md border px-2 py-1.5 font-mono text-xs tabular-nums transition ${
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Visningsvelger */}
      <section className="rounded-lg border border-border bg-card p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Visning
        </span>
        <nav className="mt-2 space-y-1" aria-label="Visningstyper">
          {VIEWS.map(({ kode, label, ikon: Icon }) => {
            const aktiv = valgtView === kode;
            return (
              <button
                key={kode}
                type="button"
                onClick={() => naviger({ view: kode })}
                disabled={pending}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                  aktiv
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Eksport */}
      <section className="rounded-lg border border-border bg-card p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Eksporter
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40"
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
            Skriv ut
          </button>
          <button
            type="button"
            disabled
            title="Kommer snart"
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            CSV
          </button>
        </div>
      </section>
    </aside>
  );
}
