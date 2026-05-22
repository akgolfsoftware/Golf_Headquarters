import { AlertTriangle, Plus, Activity, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { HelseForm } from "./helse-form";

export default async function HelsePage() {
  const user = await requirePortalUser();

  // Siste 14 dagers logg, nyest først.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);

  const entries = await prisma.healthEntry.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const siste = entries[0];
  const iDagIso = new Date().toISOString().slice(0, 10);
  const initial = {
    date: iDagIso,
    restingHr: siste?.restingHr ?? null,
    sleepHours: siste?.sleepHours ?? null,
    weightKg: siste?.weightKg ?? null,
    notes: siste?.notes ?? null,
  };

  // Hvilepuls-serie kronologisk for sparkline.
  const hrSerie = entries
    .filter(
      (e): e is typeof e & { restingHr: number } => e.restingHr !== null,
    )
    .map((e) => ({ date: e.date, value: e.restingHr }))
    .reverse();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Helse"
        titleLead="Kroppen din,"
        titleItalic="dataen din"
        sub="Manuelle helse-data brukes til å justere treningsbelastning. Apple Health og Garmin-integrasjoner kommer i v2."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Pågående skader" value="0" sub="Ingen registrert" />
        <Kpi
          label="Hvilepuls"
          value={siste?.restingHr != null ? String(siste.restingHr) : "—"}
          unit={siste?.restingHr != null ? "bpm" : undefined}
          sub={
            siste?.restingHr != null
              ? `Sist: ${formatDato(siste.date)}`
              : "Logg manuelt under"
          }
        />
        <Kpi
          label="Søvn (siste logg)"
          value={
            siste?.sleepHours != null
              ? String(siste.sleepHours).replace(".", ",")
              : "—"
          }
          unit={siste?.sleepHours != null ? "t" : undefined}
          sub={
            siste?.sleepHours != null
              ? `Sist: ${formatDato(siste.date)}`
              : "Logg manuelt under"
          }
        />
        <Kpi label="Avlyste økter" value="—" sub="Helse-relatert · v2" />
      </div>

      <Section title="Integrasjoner" aux="Apple Health, Garmin · v2">
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Integration
            navn="Apple Health"
            beskrivelse="iOS Health-data automatisk"
          />
          <Integration
            navn="Garmin"
            beskrivelse="Hvilepuls + søvn fra klokke"
          />
        </div>
      </Section>

      <Section
        title="Skader"
        aux="Sortert nyest først"
        rightAction={
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground opacity-60"
            title="Tilgjengelig i v2"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} />
            Logg ny skade
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Activity className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">
            Ingen registrerte skader. Skade-logging kommer i v2.
          </p>
        </div>
      </Section>

      <Section title="Daglig logg" aux="Manuelt — coach leser">
        <div className="p-6">
          <HelseForm initial={initial} />
        </div>
      </Section>

      <Section title="Hvilepuls siste 14 dager" aux="Trend">
        <div className="p-6">
          <HvilepulsSparkline data={hrSerie} />
        </div>
      </Section>

      <Section title="Historikk" aux="Siste 14 dager">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">
              Ingen helse-logger ennå. Logg din første over.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Dato</th>
                  <th className="px-4 py-4 font-medium">Hvilepuls</th>
                  <th className="px-4 py-4 font-medium">Søvn</th>
                  <th className="px-4 py-4 font-medium">Vekt</th>
                  <th className="px-6 py-4 font-medium">Notater</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-mono tabular-nums text-foreground">
                      {formatDato(e.date)}
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-foreground">
                      {e.restingHr ?? "—"}
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-foreground">
                      {e.sleepHours != null
                        ? String(e.sleepHours).replace(".", ",")
                        : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-foreground">
                      {e.weightKg != null
                        ? String(e.weightKg).replace(".", ",")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {e.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Coach-tilgang til helsedata
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            v2
          </span>
        </header>
        <div className="flex items-center gap-4 px-6 py-6">
          <AlertTriangle
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">
            Detaljert kontroll over hva coach ser kommer i v2. Inntil videre ser
            tilknyttet coach all helse-logg.
          </p>
        </div>
      </section>
    </div>
  );
}

function formatDato(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function HvilepulsSparkline({
  data,
}: {
  data: Array<{ date: Date; value: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ingen hvilepuls-data i perioden. Logg minst én verdi for å se trend.
      </p>
    );
  }

  const width = 640;
  const height = 160;
  const padX = 32;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xPos = (i: number) =>
    data.length === 1
      ? padX + innerW / 2
      : padX + (i / (data.length - 1)) * innerW;
  const yPos = (v: number) => padY + (1 - (v - min) / range) * innerH;

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d.value)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full min-w-[480px]"
        role="img"
        aria-label="Hvilepuls siste 14 dager"
      >
        <line
          x1={padX}
          x2={width - padX}
          y1={height - padY}
          y2={height - padY}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xPos(i)}
            cy={yPos(d.value)}
            r={3}
            fill="hsl(var(--primary))"
          />
        ))}
        <text
          x={padX}
          y={padY - 8}
          className="fill-muted-foreground font-mono"
          fontSize={10}
        >
          {max} bpm
        </text>
        <text
          x={padX}
          y={height - padY + 16}
          className="fill-muted-foreground font-mono"
          fontSize={10}
        >
          {min} bpm
        </text>
      </svg>
    </div>
  );
}

function Section({
  title,
  aux,
  rightAction,
  children,
}: {
  title: string;
  aux?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          {aux && (
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {aux}
            </span>
          )}
        </div>
        {rightAction}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-4 font-mono text-3xl font-medium leading-none tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-sm text-muted-foreground/70">{unit}</span>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Integration({
  navn,
  beskrivelse,
}: {
  navn: string;
  beskrivelse: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{navn}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          v2
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{beskrivelse}</p>
    </div>
  );
}
