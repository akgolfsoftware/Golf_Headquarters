/**
 * /stats/sg-sammenlign/resultat/[id] — viser SG-sammenligning + estimat + CTA
 *
 * Server component. Henter BrukerSammenligning + BrukerSgInput + ref-spiller-data.
 * Renderer radar-chart via client component, tekst-summary, og PlayerHQ-CTA.
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { sammenlignMedReferanse } from "@/lib/stats/sg-estimator";
import { SgResultatView } from "./result-view";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function formatSg(v: number | null | undefined): string {
  if (v == null) return "—";
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

export default async function SgResultatPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/stats/sg-sammenlign");
  }

  const { id } = await params;

  const sammenligning = await prisma.brukerSammenligning.findFirst({
    where: { id, userId: user.id },
    include: { sgInput: true },
  });

  if (!sammenligning) notFound();

  // Hent ref-spillerens SG-fordeling fra PgaPlayerSeason
  const ref = await prisma.pgaPlayerSeason.findFirst({
    where: {
      dgPlayerId: sammenligning.refDgPlayerId,
      tour: sammenligning.refTour,
    },
    orderBy: { year: "desc" },
    select: {
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      sgTotal: true,
      country: true,
      driveDist: true,
    },
  });

  const sg = sammenligning.sgInput;
  const cmp = sammenlignMedReferanse(
    {
      sgOtt: sg.sgOtt,
      sgApp: sg.sgApp,
      sgArg: sg.sgArg,
      sgPutt: sg.sgPutt,
      sgTotal: sg.sgTotal,
    },
    {
      sgOtt: ref?.sgOtt ?? null,
      sgApp: ref?.sgApp ?? null,
      sgArg: ref?.sgArg ?? null,
      sgPutt: ref?.sgPutt ?? null,
      sgTotal: ref?.sgTotal ?? null,
    },
  );

  const radarData = [
    { kategori: "OTT", du: sg.sgOtt ?? 0, ref: ref?.sgOtt ?? 0 },
    { kategori: "APP", du: sg.sgApp ?? 0, ref: ref?.sgApp ?? 0 },
    { kategori: "ARG", du: sg.sgArg ?? 0, ref: ref?.sgArg ?? 0 },
    { kategori: "PUTT", du: sg.sgPutt ?? 0, ref: ref?.sgPutt ?? 0 },
  ];

  const KAT_LABEL: Record<string, string> = {
    ott: "Drive (Off The Tee)",
    app: "Innspill (Approach)",
    arg: "Kort spill (Around the Green)",
    putt: "Putting",
  };

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <Link
            href="/stats/sg-sammenlign"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til SG-sammenligning
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <AthleticEyebrow tone="lime">
              <Trophy className="mr-1.5 inline h-3 w-3" />
              Din sammenligning
            </AthleticEyebrow>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Du vs{" "}
              <em className="font-normal italic text-primary">
                {sammenligning.refPlayerName}
              </em>
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Sesong {sammenligning.refYear} · PGA Tour
            </p>
          </div>
        </div>
      </section>

      {/* KPI-strip */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              label="Din SG Total"
              value={formatSg(sg.sgTotal)}
              detail="per runde vs Tour-snitt"
              primary
            />
            <Kpi
              label={`${sammenligning.refPlayerName} SG Total`}
              value={formatSg(ref?.sgTotal)}
              detail={`Sesong ${sammenligning.refYear}`}
            />
            <Kpi
              label="Differanse"
              value={
                cmp.diff.total !== null
                  ? `${cmp.diff.total >= 0 ? "−" : "+"}${Math.abs(cmp.diff.total).toFixed(2)}`
                  : "—"
              }
              detail="strokes per runde du må ta inn"
              accent
            />
          </div>
        </div>
      </section>

      {/* RADAR */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Hvor er{" "}
              <em className="font-normal italic text-primary">gapet</em>?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Radar-graf — alle kategorier vist relativt til PGA Tour-snittet.
            </p>
          </div>

          <div className="mt-8">
            <SgResultatView
              data={radarData}
              duLabel="Du"
              refLabel={sammenligning.refPlayerName}
            />
          </div>

          {cmp.storsteGap && (
            <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Største gap
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {KAT_LABEL[cmp.storsteGap.kategori]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {cmp.storsteGap.diff >= 0 ? "−" : "+"}
                {Math.abs(cmp.storsteGap.diff).toFixed(2)} strokes per runde —
                her er det mest å hente
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ESTIMAT */}
      {sammenligning.estPgaTourScore !== null && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="text-center">
              <AthleticEyebrow tone="default">Tour-ekvivalent</AthleticEyebrow>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Din score på en{" "}
                <em className="font-normal italic text-primary">
                  PGA-bane
                </em>
              </h2>
            </div>

            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Norsk snittscore
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
                {sg.snittScore?.toFixed(1) ?? "—"}
              </p>

              <div className="my-6 mx-auto h-px w-16 bg-border" />

              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Estimert PGA Tour-score
              </p>
              <p className="mt-1 font-mono text-5xl font-semibold tabular-nums text-foreground">
                {sammenligning.estPgaTourScore.toFixed(1)}
              </p>
              {sammenligning.estHcp !== null && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Estimert HCP: {sammenligning.estHcp.toFixed(1)}
                </p>
              )}
              <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground">
                Beregnet med WHS-formel og standard PGA Tour-bane (slope 145,
                CR 74.5). Faktisk score vil variere med dagsform og banens
                konfigurasjon.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PLAYERHQ MERSALG */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <AthleticEyebrow tone="lime">
                <Sparkles className="mr-1.5 inline h-3 w-3" />
                Få faktiske tall
              </AthleticEyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Vil du følge{" "}
                <em className="font-normal italic">utviklingen</em>?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
                PlayerHQ regner ut din egen Strokes Gained automatisk hver
                gang du logger en runde. Du ser om gapet til{" "}
                {sammenligning.refPlayerName} blir mindre over tid, og AI-coachen
                gir konkrete tips for å lukke det.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/playerhq"
                  className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90"
                >
                  Prøv PlayerHQ gratis i 30 dager
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/stats/sg-sammenlign/start"
                  className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ny sammenligning
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">
                I PlayerHQ får du
              </p>
              <ul className="mt-3 space-y-2 text-sm text-primary-foreground/95">
                {[
                  "Strokes Gained per runde (automatisk)",
                  "Trend over tid vs proff-benchmark",
                  "AI-coach med kategori-spesifikke tips",
                  "Treningsplaner mot ditt største gap",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1 w-1 rounded-full bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                300 kr/mnd · Gratis under beta
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  primary,
  accent,
}: {
  label: string;
  value: string;
  detail?: string;
  primary?: boolean;
  accent?: boolean;
}) {
  const bg = primary
    ? "border-primary/30 bg-primary/5"
    : accent
      ? "border-accent/40 bg-accent/10"
      : "border-border bg-card";
  return (
    <div className={`rounded-lg border ${bg} px-4 py-4`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {detail && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
