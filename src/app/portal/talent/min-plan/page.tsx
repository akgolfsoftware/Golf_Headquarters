/**
 * PlayerHQ — Talent · Min plan (MOBILE-FIRST 430px)
 *
 * Spillerens egen utviklingsplan. Athletic-editorial re-styl mot DS-tokens:
 *  - Mono-eyebrow m/pulse + italic display-tittel
 *  - Status-strip (nivå, klubb, region, i programmet siden)
 *  - 5 akse-kort (1–10) farget per pyramide-token + progress-bar
 *  - "Neste mål"-kort (lime-glød) fra første ufullførte milepæl
 *  - Milepæler-tidslinje fra TalentTracking.milepaeler (DB)
 *
 * All data fra TalentTracking — ingen falske tall (tomstate når null).
 */

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Target } from "lucide-react";

import {
  AXIS_KEYS,
  AXIS_LABELS,
  type AxisKey,
} from "@/components/portal/talent/radar-chart";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

type Milepael = {
  tittel: string;
  dato?: string;
  beskrivelse?: string;
  fullfort?: boolean;
};

// Talent-akse → pyramide-token-klasser (gir hver akse en farge-identitet).
const AXIS_BAR: Record<AxisKey, string> = {
  fysisk: "bg-pyr-fys",
  teknikk: "bg-pyr-tek",
  taktikk: "bg-pyr-slag",
  mental: "bg-pyr-turn",
  motivasjon: "bg-pyr-spill",
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m) => ({
      tittel: typeof m.tittel === "string" ? m.tittel : "",
      dato: typeof m.dato === "string" ? m.dato : undefined,
      beskrivelse: typeof m.beskrivelse === "string" ? m.beskrivelse : undefined,
      fullfort: typeof m.fullfort === "boolean" ? m.fullfort : false,
    }))
    .filter((m) => m.tittel.length > 0);
}

function formatDato(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function MinPlanPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });
  if (!tracking) return null;

  const values: Record<AxisKey, number | null> = {
    fysisk: tracking.fysisk,
    teknikk: tracking.teknikk,
    taktikk: tracking.taktikk,
    mental: tracking.mental,
    motivasjon: tracking.motivasjon,
  };

  const milepaeler = parseMilepaeler(tracking.milepaeler);
  const nesteMal = milepaeler.find((m) => !m.fullfort);

  const iProgrammetSiden = tracking.inkludertFra.toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
  });

  const statusKort: { label: string; value: string }[] = [
    { label: "Nivå", value: tracking.niva },
    { label: "Klubb", value: tracking.klubb ?? "Ikke registrert" },
    { label: "Region", value: tracking.region ?? "Ikke registrert" },
    { label: "I programmet", value: iProgrammetSiden },
  ];

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      {/* Tilbake */}
      <Link
        href="/portal/talent"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Tilbake til talent
      </Link>

      {/* Header */}
      <header>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
          </span>
          TALENT · MIN PLAN · {tracking.niva}
        </span>
        <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Min{" "}
          <em className="font-normal italic text-primary">utviklingsplan</em>.
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
          Sporet på de fem aksene coachen din bruker for å plassere deg på nivå
          og bygge programmet ditt.
        </p>
      </header>

      {/* Status-strip 2x2 */}
      <section
        aria-label="Status i talent-programmet"
        className="grid grid-cols-2 gap-3"
      >
        {statusKort.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5"
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              {s.label}
            </span>
            <span className="text-sm font-semibold capitalize leading-tight text-foreground">
              {s.value}
            </span>
          </div>
        ))}
      </section>

      {/* 5 akse-kort */}
      <section aria-label="Mine fem utviklingsakser" className="flex flex-col gap-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Mine fem akser
        </span>
        <div className="grid grid-cols-1 gap-3">
          {AXIS_KEYS.map((k) => (
            <AxisCard key={k} label={AXIS_LABELS[k]} value={values[k]} barClass={AXIS_BAR[k]} />
          ))}
        </div>
      </section>

      {/* Neste mål (lime-glød) */}
      <section
        aria-label="Neste mål"
        className="rounded-xl border border-l-[3px] border-accent/55 border-l-accent bg-accent/10 p-4"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
            aria-hidden
          >
            <Target className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Neste mål
            </span>
            {nesteMal ? (
              <>
                <h3 className="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.01em] text-foreground">
                  {nesteMal.tittel}
                </h3>
                {nesteMal.beskrivelse && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {nesteMal.beskrivelse}
                  </p>
                )}
                {nesteMal.dato && (
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                    Frist {formatDato(nesteMal.dato)}
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 className="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.01em] text-foreground">
                  Ingen aktive milepæler
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  Coachen din legger inn neste milepæl etter neste evaluering. I
                  mellomtiden: hold tråden i ukeplanen.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Milepæler-tidslinje */}
      <section aria-label="Milepæler" className="flex flex-col gap-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Milepæler
        </span>
        {milepaeler.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
            Ingen milepæler registrert ennå. Coachen din legger til milepæler
            etter hvert som planen utvikles.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {milepaeler.map((m, i) => (
              <li
                key={`${m.tittel}-${i}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    m.fullfort
                      ? "bg-primary text-accent"
                      : "bg-secondary text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {m.fullfort ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Circle className="h-4 w-4" strokeWidth={2} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug text-foreground">
                      {m.tittel}
                    </h3>
                    {m.dato && (
                      <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                        {formatDato(m.dato)}
                      </span>
                    )}
                  </div>
                  {m.beskrivelse && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {m.beskrivelse}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function AxisCard({
  label,
  value,
  barClass,
}: {
  label: string;
  value: number | null;
  barClass: string;
}) {
  const v = value ?? 0;
  const pct = Math.max(0, Math.min(100, (v / 10) * 100));
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[18px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
          {value === null ? "—" : v.toFixed(1)}
          <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
            / 10
          </span>
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
