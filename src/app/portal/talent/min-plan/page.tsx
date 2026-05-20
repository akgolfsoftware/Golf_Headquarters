/**
 * PlayerHQ — Talent · Min plan
 *
 * Spillerens egen utviklingsplan:
 *  - Hero med eyebrow + italic-tittel
 *  - Status-kort (nivå, klubb, region, i programmet siden)
 *  - 5 KPI-kort med radar-akser + bar-graf 1–10
 *  - Milepæler-timeline (fra TalentTracking.milepaeler JSON)
 *  - "Neste mål" — første ufullførte milepæl eller hardkodet placeholder
 */

import { BookOpen, CheckCircle2, Circle, Target, TrendingUp } from "lucide-react";

import { TalentHero } from "@/components/portal/talent/talent-hero";
import { AXIS_KEYS, AXIS_LABELS, type AxisKey } from "@/components/portal/talent/radar-chart";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type Milepael = {
  tittel: string;
  dato?: string;
  beskrivelse?: string;
  fullfort?: boolean;
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

  // Layout har allerede bekreftet at tracking finnes — men typescript trenger
  // garantien her også.
  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });

  if (!tracking) {
    return null;
  }

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 sm:py-8 md:px-8 md:py-12 md:pb-12">
      <TalentHero
        eyebrow="PlayerHQ · Talent · Min plan"
        italic="Min"
        rest="utviklingsplan"
        lead="Sporet på de fem aksene som coachen din bruker for å plassere deg på nivå og bygge programmet ditt."
      />

      {/* Status-kort */}
      <section
        aria-label="Status i talent-programmet"
        className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <StatusCard label="Nivå" value={tracking.niva} />
        <StatusCard label="Klubb" value={tracking.klubb ?? "Ikke registrert"} />
        <StatusCard label="Region" value={tracking.region ?? "Ikke registrert"} />
        <StatusCard label="I programmet siden" value={iProgrammetSiden} />
      </section>

      {/* KPI-kort 5 akser */}
      <section aria-label="Mine fem utviklingsakser" className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp size={20} strokeWidth={1.5} className="text-primary" aria-hidden />
          <h2 className="font-display text-2xl font-medium tracking-tight">
            Mine fem akser
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AXIS_KEYS.map((k) => (
            <AxisCard key={k} label={AXIS_LABELS[k]} value={values[k]} />
          ))}
        </div>
      </section>

      {/* Neste mål */}
      <section
        aria-label="Neste mål"
        className="mb-12 overflow-hidden rounded-lg border border-border bg-card p-6 md:p-8"
      >
        <div className="flex items-start gap-4">
          <span
            className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden
          >
            <Target size={24} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Neste mål
            </span>
            {nesteMal ? (
              <>
                <h3 className="mt-2 font-display text-2xl font-medium leading-tight tracking-tight">
                  {nesteMal.tittel}
                </h3>
                {nesteMal.beskrivelse ? (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {nesteMal.beskrivelse}
                  </p>
                ) : null}
                {nesteMal.dato ? (
                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    Frist {formatDato(nesteMal.dato)}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h3 className="mt-2 font-display text-2xl font-medium leading-tight tracking-tight">
                  Ingen aktive milepæler
                </h3>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  Coachen din legger inn neste milepæl etter neste evaluering. I
                  mellomtiden: hold tråden i ukeplanen.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Milepæler-timeline */}
      <section aria-label="Milepæler" className="mb-8">
        <div className="mb-6 flex items-center gap-3">
          <BookOpen size={20} strokeWidth={1.5} className="text-primary" aria-hidden />
          <h2 className="font-display text-2xl font-medium tracking-tight">
            Milepæler
          </h2>
        </div>
        {milepaeler.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
            Ingen milepæler registrert ennå. Coachen din legger til milepæler
            etter hvert som planen utvikles.
          </div>
        ) : (
          <ol className="space-y-4">
            {milepaeler.map((m, i) => (
              <li
                key={`${m.tittel}-${i}`}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-6"
              >
                <span
                  className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    m.fullfort
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                  aria-hidden
                >
                  {m.fullfort ? (
                    <CheckCircle2 size={18} strokeWidth={1.5} />
                  ) : (
                    <Circle size={18} strokeWidth={1.5} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-medium leading-snug">
                      {m.tittel}
                    </h3>
                    {m.dato ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatDato(m.dato)}
                      </span>
                    ) : null}
                  </div>
                  {m.beskrivelse ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {m.beskrivelse}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold leading-tight">{value}</div>
    </div>
  );
}

function AxisCard({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const pct = Math.max(0, Math.min(100, (v / 10) * 100));
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-3xl font-medium tabular-nums">
          {value === null ? "—" : v.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">/ 10</span>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
