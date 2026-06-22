import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { extractClubs, extractShots } from "@/lib/sg-hub/extract-shots";
import {
  computeClubFit,
  type ClubFitReport,
  type FitStatus,
} from "@/lib/sg-hub/equipment-fit";

const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW",
];

function sortClubs(clubs: string[]): string[] {
  return [...clubs].sort((a, b) => {
    const ai = CLUB_ORDER.indexOf(a);
    const bi = CLUB_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default async function EquipmentPage() {
  const user = await requirePortalUser();
  return <EquipmentView userId={user.id} backHref="/portal/mal/sg-hub" />;
}

// Felles visning — gjenbrukt av coach-proxy-ruten.
export async function EquipmentView({
  userId,
  backHref,
  spillerNavn,
}: {
  userId: string;
  backHref: string;
  spillerNavn?: string;
}) {
  const sessions = await prisma.trackManSession.findMany({
    where: { userId },
    select: { rawJson: true },
  });

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }
  const clubs = sortClubs([...clubSet]);

  const reports: ClubFitReport[] = clubs
    .map((clubId) => {
      const shots = sessions.flatMap((s) => extractShots(s.rawJson, clubId));
      // Vi kjører fit-beregning mot første rawJson som inneholder denne køllen
      // for å lese launch/spin-felter (best-effort).
      const sourceRaw =
        sessions.find((s) => extractShots(s.rawJson, clubId).length > 0)
          ?.rawJson ?? null;
      return computeClubFit(clubId, shots, sourceRaw);
    })
    .filter((r) => r.shotCount > 0 && r.category !== "putter");

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG-hub
      </Link>

      {/* Editorial header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Fase 5 · equipment fit
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
          Utstyr
          <em className="italic font-medium text-primary">
            -helsesjekk
          </em>
          {spillerNavn ? (
            <span className="text-muted-foreground"> · {spillerNavn}</span>
          ) : null}
        </h1>
        <p className="max-w-2xl pt-1 text-sm text-muted-foreground">
          Launch, spin og smash sjekkes mot optimale target-vinduer per
          kølletype. Avvik kan tyde på feil køllevalg, oppsett eller
          ball-fitting — og er ofte raskere å fikse enn teknikk.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 text-xs shadow-sm">
        <LegendItem status="ok" label="I target" />
        <LegendItem status="warn" label="Utenfor target" />
        <LegendItem status="critical" label="Kritisk avvik" />
        <LegendItem status="missing" label="Data mangler" />
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Ingen TrackMan-data ennå.{" "}
            <Link
              href="/portal/mal/trackman"
              className="text-primary underline-offset-2 hover:underline"
            >
              Importer din første økt
            </Link>{" "}
            for å aktivere equipment-helsesjekk.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <ClubFitCard key={r.clubId} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClubFitCard({ report }: { report: ClubFitReport }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {categoryLabel(report.category)}
          </p>
          <p className="mt-1 font-display text-lg font-bold tracking-[-0.01em] text-foreground">
            {report.clubId}
          </p>
        </div>
        <StatusBadge status={report.overall} large />
      </div>

      <div className="space-y-2">
        {report.metrics.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Ingen target-vinduer definert for denne køllen.
          </p>
        ) : (
          report.metrics.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={m.status} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {m.label}
                </span>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {m.value === null ? "—" : `${formatValue(m.value, m.unit)}${m.unit}`}
                </p>
                {m.target && (
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Target: {m.target.min}-{m.target.max}
                    {m.unit}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        Basert på {report.shotCount} slag
      </p>
    </div>
  );
}

function formatValue(value: number, unit: string): string {
  if (unit === "rpm") return Math.round(value).toString();
  if (unit === "°") return value.toFixed(1);
  return value.toFixed(2);
}

function categoryLabel(category: ClubFitReport["category"]): string {
  switch (category) {
    case "driver":
      return "Driver";
    case "iron":
      return "Jern";
    case "wedge":
      return "Wedge";
    case "wood":
      return "Trefelg";
    case "putter":
      return "Putter";
    default:
      return "Annet";
  }
}

function StatusBadge({
  status,
  large = false,
}: {
  status: FitStatus;
  large?: boolean;
}) {
  const size = large ? "h-5 w-5" : "h-4 w-4";

  switch (status) {
    case "ok":
      return <CheckCircle2 className={`${size} text-primary`} />;
    case "warn":
      return <AlertCircle className={`${size} text-warning`} />;
    case "critical":
      return <XCircle className={`${size} text-destructive`} />;
    case "missing":
    default:
      return <HelpCircle className={`${size} text-muted-foreground`} />;
  }
}

function LegendItem({ status, label }: { status: FitStatus; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <StatusBadge status={status} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
