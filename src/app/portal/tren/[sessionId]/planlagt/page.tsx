/**
 * PlayerHQ · Tren · Økt-detalj (planlagt)
 *
 * Migrert fra public/design/batch3/okt-detalj-planlagt.html.
 * Pre-økt-visning med mål, plan, utstyrs-sjekkliste og coach-notat.
 * Eksisterende /portal/tren/[sessionId] gjenstår som standard-visning;
 * denne ruten brukes når økten er PLANNED og spilleren skal forberede seg.
 */
import Link from "next/link";
import {
  Clock,
  MapPin,
  Target,
  Play,
  Pencil,
  X,
  ChevronDown,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OktPlanlagtPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser();
  const { sessionId } = await params;
  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
  });
  if (!session) notFound();

  return (
    <div className="space-y-8 pb-32">
      {/* Hero */}
      <section className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Planlagt 14:00 i dag
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
          <em className="italic text-primary">Wedge-presisjon</em> 50–80m
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-foreground px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
            Privat coaching
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.75} />
            <strong className="font-mono uppercase tracking-[0.06em] text-foreground">
              60 min
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.75} />
            <strong className="font-mono uppercase tracking-[0.06em] text-foreground">
              GFGK Performance Studio
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              HB
            </span>
            <strong className="font-mono uppercase tracking-[0.06em] text-foreground">
              Hans Brennum
            </strong>
          </span>
        </div>
      </section>

      {/* Tre mål */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Tre mål for økten
        </h2>
        <div className="space-y-2">
          {[
            { strong: "Treff GIR 7/10 fra 60m", rest: "— konsistent landing innenfor 5 meter fra pin" },
            { strong: "Konsistens i tempo", rest: "— 1:3-forhold mellom backswing og downswing" },
            { strong: "Identifisere mønster i misser", rest: "— venstre / høyre / kort / langt fordeling" },
          ].map((g) => (
            <div
              key={g.strong}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-4"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Target size={14} strokeWidth={1.75} />
              </span>
              <p className="text-sm">
                <strong className="text-foreground">{g.strong}</strong>{" "}
                <span className="text-muted-foreground">{g.rest}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Plan · 60 min
        </h2>
        <ol className="space-y-3">
          {[
            { time: "14:00", title: "Oppvarming", meta: "Dynamisk · 20 svinger · alignment", min: "10 min" },
            { time: "14:10", title: "Putting", meta: "Rhythm · 4 baller × 5 avstander", min: "20 min" },
            { time: "14:30", title: "Wedge 50–80m", meta: "Hoved-blokk · 30 baller · TrackMan", min: "25 min" },
            { time: "14:55", title: "Cool-down + review", meta: "Refleksjon · coach-feedback", min: "5 min" },
          ].map((r) => (
            <li
              key={r.time}
              className="grid grid-cols-[70px_12px_1fr_60px] items-start gap-3 rounded-md border border-border bg-card p-4"
            >
              <span className="font-mono text-sm font-semibold tabular-nums">
                {r.time}
              </span>
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <div className="font-display text-sm font-semibold">
                  {r.title}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {r.meta}
                </div>
              </div>
              <span className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                {r.min}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Utstyr */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Utstyr · sjekkliste
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Pitching wedge",
            "Gap wedge (50°)",
            "Sand wedge",
            "Lob wedge (60°)",
            "Alignment sticks × 2",
            "Target-disks × 3",
          ].map((e) => (
            <span
              key={e}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* Øvelser */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Øvelser · klikk for detaljer
        </h2>
        <div className="space-y-2">
          {[
            {
              n: "01",
              title: "Distanse-stigning · 50m → 80m",
              reps: "3 × 10 baller",
              body: "Setup: 3 target-disks plassert på 50m, 65m, 80m. Spill 10 baller per disk, samme klubbe (PW eller GW). Logg landing-distanse, ikke svinget — målet er å treffe avstand presist med kontrollert sving. Måling: antall baller innenfor 5m rundt disk + standardavvik.",
              open: true,
            },
            {
              n: "02",
              title: "Tempo-locking · metronom 1:3",
              reps: "15 svinger",
              body: "Bruk metronom-app eller telling. Backswing 3 takter, downswing 1. Ingen ball. Fokus på rytme og kropp-balanse.",
            },
            {
              n: "03",
              title: "Miss-mønster-kartlegging",
              reps: "20 baller · TM-tagget",
              body: "20 wedges til pin 70m, normal innstilling. TrackMan logger spinn / launch / landing. Etter økt: se fordeling for å identifisere tendens.",
            },
          ].map((d) => (
            <details
              key={d.n}
              open={d.open}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                  {d.n}
                </span>
                <span className="flex-1 font-display text-sm font-semibold">
                  {d.title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {d.reps}
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className="text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="grid grid-cols-[120px_1fr] gap-4 border-t border-border px-4 py-4">
                <div className="flex h-20 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Play size={20} strokeWidth={1.5} />
                </div>
                <p className="text-sm leading-relaxed text-foreground">{d.body}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Coach-notat */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
          Coach-notat
        </h2>
        <div className="grid grid-cols-[32px_1fr] gap-4 rounded-lg border border-border border-l-[3px] border-l-primary bg-card p-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
            HB
          </span>
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Hans Brennum · 21. mai 09:14
            </div>
            <p className="mt-2 italic text-foreground">
              &ldquo;Husk fokus på tempo — vi snakket sist om at backswing ble
              for kort under press. Bruk metronom-drillen i blokk 2 hvis du
              føler at rytmen forsvinner.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Action bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Starter om <strong className="text-foreground">3 t 18 min</strong> · kan
            startes innen ±15 min av tid
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
            >
              <Pencil size={12} strokeWidth={1.75} /> Endre tid
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-card px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <X size={12} strokeWidth={1.75} /> Avlys
            </button>
            <Link
              href={`/portal/tren/${sessionId}`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              <Play size={14} strokeWidth={2} /> Start økt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
