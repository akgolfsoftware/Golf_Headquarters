"use client";

/**
 * Venstre sidebar for /portal/analyse.
 *
 * Forskjell fra <AnalyseSidebar/> (AgencyOS):
 *   - Ingen spillervelger — innlogget spiller er alltid valgt
 *   - Visningslisten respekterer Standard/Avansert-modus
 *   - Navigerer til /portal/analyse (ikke /admin/analyse)
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
  Printer,
} from "lucide-react";
import { useViewMode } from "@/components/shared/ViewModeContext";

type View =
  | "oversikt"
  | "krysstabell"
  | "trender"
  | "sg"
  | "fys"
  | "plan-faktisk";

type ViewItem = {
  kode: View;
  label: string;
  ikon: React.ElementType;
  avansert?: boolean;
};

const VIEWS: ViewItem[] = [
  { kode: "oversikt", label: "Oversikt", ikon: BarChart3 },
  { kode: "trender", label: "Trender", ikon: LineChart },
  { kode: "sg", label: "Strokes Gained", ikon: Activity },
  { kode: "fys", label: "Fysisk", ikon: Dumbbell, avansert: true },
  { kode: "plan-faktisk", label: "Plan vs faktisk", ikon: ClipboardCheck, avansert: true },
  { kode: "krysstabell", label: "Krysstabell", ikon: Grid3X3, avansert: true },
];

const PERIODER = [
  { kode: "7d", label: "7 d" },
  { kode: "30d", label: "30 d" },
  { kode: "90d", label: "90 d" },
  { kode: "365d", label: "1 år" },
];

export function PortalAnalyseSidebar({
  valgtPeriode,
  valgtView,
}: {
  valgtPeriode: string;
  valgtView: View;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { mode } = useViewMode();

  function naviger(patch: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) params.set(k, v);
    startTransition(() => {
      router.push(`/portal/analyse?${params.toString()}`);
    });
  }

  const synligeViews =
    mode === "standard" ? VIEWS.filter((v) => !v.avansert) : VIEWS;

  return (
    <aside
      aria-label="Analysefilter"
      className="space-y-4 lg:sticky lg:top-6 lg:self-start"
    >
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
          {synligeViews.map(({ kode, label, ikon: Icon, avansert }) => {
            const aktiv = valgtView === kode;
            return (
              <button
                key={kode}
                type="button"
                onClick={() => naviger({ view: kode })}
                disabled={pending}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                  aktiv
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{label}</span>
                {avansert && (
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    AV
                  </span>
                )}
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
        <div className="mt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40"
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
            Skriv ut
          </button>
        </div>
      </section>
    </aside>
  );
}
