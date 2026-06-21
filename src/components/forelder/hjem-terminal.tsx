/**
 * Foreldreportal · hjem (/forelder) — terminal-lys-fasit.
 * Fasit: «Forelderportal (terminal-lys).dc.html».
 *
 * Read-only, forklarende forelder-visning (GDPR). Rekkefølge fra fasiten:
 *   1. Samtykke-status-kort (prominent, lime-flate)
 *   2. Ukerapport — narrativ + 3 KPI (oppmøte / SG-trend / streak)
 *   3. Fremgang — 8-ukers SG-søylediagram
 *   4. Coach-notat
 *
 * Alle tall kommer fra ForelderUkerapport (avledet fra barnets ekte data).
 */

import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import type { ForelderUkerapport } from "@/lib/forelder";

const nf1 = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function byggNarrativ(d: ForelderUkerapport): React.ReactNode {
  const deler: React.ReactNode[] = [];

  if (d.oktPlanlagt > 0) {
    deler.push(
      <span key="okter">
        {d.childFirstName} trente{" "}
        <strong className="font-semibold text-primary">
          {d.oktFullfort} av {d.oktPlanlagt}
        </strong>{" "}
        planlagte økter denne uka.
      </span>
    );
  } else {
    deler.push(
      <span key="okter">
        Ingen planlagte økter er registrert for {d.childFirstName} denne uka.
      </span>
    );
  }

  if (d.fokusOmrade) {
    deler.push(<span key="fokus"> Mest tid gikk til {d.fokusOmrade}.</span>);
  }

  if (d.sgRetning === "opp") {
    deler.push(
      <span key="sg">
        {" "}
        <strong className="font-semibold text-primary">
          SG-utviklingen peker oppover.
        </strong>
      </span>
    );
  } else if (d.sgRetning === "ned") {
    deler.push(<span key="sg"> SG-utviklingen har falt litt den siste tiden.</span>);
  } else if (d.sgRetning === "stabil") {
    deler.push(<span key="sg"> SG-utviklingen holder seg stabil.</span>);
  }

  return deler;
}

export function ForelderHjemTerminal({ data }: { data: ForelderUkerapport }) {
  const sgTekst =
    data.sgTrendDelta == null
      ? "—"
      : `${data.sgTrendDelta > 0 ? "▲" : data.sgTrendDelta < 0 ? "▼" : "■"} ${nf1.format(
          Math.abs(data.sgTrendDelta)
        )}`;

  return (
    <div className="mx-auto w-full max-w-[440px] px-4 py-5">
      {/* Barn-identitet */}
      <header className="mb-4">
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Forelderportal · uke {data.ukenummer}
        </span>
        <h1 className="mt-1 font-display text-[22px] font-bold leading-[1.04] tracking-[-0.02em] text-foreground">
          {data.childName}
          {data.childAge != null && (
            <span className="text-muted-foreground"> · {data.childAge} år</span>
          )}
        </h1>
      </header>

      {/* 1. Samtykke-status */}
      <div
        className={`mb-4 flex items-start gap-3 rounded-xl border p-4 ${
          data.consentActive
            ? "border-border bg-accent/15"
            : "border-warning/30 bg-warning/10"
        }`}
      >
        <span
          className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full ${
            data.consentActive ? "bg-primary" : "bg-warning"
          }`}
        >
          {data.consentActive ? (
            <CheckCircle2
              className="h-[17px] w-[17px] text-primary-foreground"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <ShieldAlert
              className="h-[17px] w-[17px] text-white"
              strokeWidth={2}
              aria-hidden
            />
          )}
        </span>
        <div className="flex-1">
          <div className="mb-0.5 text-[13.5px] font-semibold text-foreground">
            {data.consentActive ? "Samtykke aktivt" : "Samtykke kreves"}
          </div>
          <div className="text-[11.5px] leading-[1.45] text-muted-foreground">
            {data.consentActive
              ? `Du har godkjent databehandling for ${data.childFirstName}. `
              : `Godkjenn databehandling for ${data.childFirstName}. `}
            <Link
              href="/forelder/samtykke"
              className="font-semibold text-primary hover:underline"
            >
              Administrer
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Ukerapport */}
      <div className="mb-3.5 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Ukerapport · uke {data.ukenummer}
          </span>
          <span className="font-mono text-[9.5px] tabular-nums text-muted-foreground">
            {data.oktFullfort} {data.oktFullfort === 1 ? "økt" : "økter"}
          </span>
        </div>
        <p className="mb-3.5 text-[13.5px] leading-[1.55] text-foreground">
          {byggNarrativ(data)}
        </p>
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border">
          <Kpi label="Oppmøte" value={data.oppmotePct != null ? `${data.oppmotePct} %` : "—"} />
          <Kpi
            label="SG-trend"
            value={sgTekst}
            tone={data.sgRetning === "opp" ? "ok" : undefined}
            border
          />
          <Kpi label="Streak" value={String(data.streak)} />
        </div>
      </div>

      {/* 3. Fremgang */}
      <div className="mb-3.5 rounded-xl border border-border bg-card p-4">
        <span className="mb-3 block font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Fremgang · siste 8 uker
        </span>
        <div className="flex h-[70px] items-end gap-[5px]">
          {data.trend8uker.map((h, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-[3px]"
                style={{
                  height: `${h}%`,
                  background:
                    "linear-gradient(180deg, hsl(var(--accent)), hsl(var(--primary)))",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 text-center font-mono text-[9px] text-muted-foreground">
          Strokes gained totalt, ukentlig
        </div>
      </div>

      {/* 4. Coach-notat */}
      {data.coachNote && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
          <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground">
            AK
          </span>
          <div className="flex-1">
            <div className="mb-0.5 text-[12.5px] font-semibold text-foreground">
              {data.coachNote.author} · coach
            </div>
            <div className="text-[12px] leading-[1.5] text-muted-foreground">
              {data.coachNote.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
  border,
}: {
  label: string;
  value: string;
  tone?: "ok";
  border?: boolean;
}) {
  return (
    <div className={`px-3 py-2.5 ${border ? "border-x border-border" : ""}`}>
      <div className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[18px] font-semibold tabular-nums ${
          tone === "ok" ? "text-success" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
