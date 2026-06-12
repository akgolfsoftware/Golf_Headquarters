/**
 * /portal/gjennomfore/[id] — spillerens økt-detalj for TrainingSessionV2 (Spor B).
 *
 * NY 2026-06-11 (kodegjennomgang-funn #1): Hjem/Planlegge/Gjennomføre har lenket
 * hit hele tiden, men ruten manglet → 404 på alle økt-lenker. Dette er en ren
 * lese-flate for V2-økter (Spor B: coach-styrte økter fra Workbench/admin-live);
 * Spor A (/portal/tren/[sessionId] + /portal/live) er urørt per dual-track-regelen.
 *
 * Eierskap: findFirst({ id, studentId: user.id }) — andre spilleres økter → 404.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageSquare, Target } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticBadge } from "@/components/athletic/badge";

export const dynamic = "force-dynamic";

const PYR_LABEL: Record<string, string> = { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };

function fmtTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}
function fmtDato(d: Date): string {
  const s = d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function OktDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser();
  const { id } = await params;

  const okt = await prisma.trainingSessionV2.findFirst({
    where: { id, studentId: user.id },
    select: {
      id: true, title: true, startTime: true, endTime: true, status: true, miljo: true, notes: true, completedSummary: true,
      drills: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, description: true, durationMinutes: true, repetitions: true, pyramide: true } },
    },
  });
  if (!okt) notFound();

  const varighet = Math.max(0, Math.round((okt.endTime.getTime() - okt.startTime.getTime()) / 60_000));

  // Coach-brief sendes fra /admin/live/[id]/brief og lagres i completedSummary.
  // Dette er spillerens eneste visning av den — hent melding-strengen trygt.
  const rawSummary: unknown = okt.completedSummary;
  let coachBrief: string | null = null;
  if (rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)) {
    const brief = (rawSummary as Record<string, unknown>).coachBrief;
    if (brief && typeof brief === "object" && !Array.isArray(brief)) {
      const melding = (brief as Record<string, unknown>).melding;
      if (typeof melding === "string" && melding.trim().length > 0) coachBrief = melding;
    }
  }
  const chip =
    okt.status === "COMPLETED" ? { variant: "ok" as const, label: "Fullført" }
    : okt.status === "IN_PROGRESS" ? { variant: "lime" as const, label: "Pågår" }
    : okt.status === "CANCELLED" ? { variant: "urgent" as const, label: "Avlyst" }
    : { variant: "neutral" as const, label: "Planlagt" };

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Link href="/portal/gjennomfore" className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Gjennomføre
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>{fmtDato(okt.startTime)}</AthleticEyebrow>
          <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
            {okt.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {fmtTid(okt.startTime)}–{fmtTid(okt.endTime)} · {varighet} min
          </p>
        </div>
        <AthleticBadge variant={chip.variant}>{chip.label}</AthleticBadge>
      </div>

      {coachBrief && (
        <div className="mt-4 max-w-[680px] rounded-xl border border-border border-l-[3px] border-l-primary bg-card p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">Fra coach</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">{coachBrief}</p>
        </div>
      )}

      {okt.notes && (
        <div className="mt-4 max-w-[680px] rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
          {okt.notes}
        </div>
      )}

      <section className="mt-5 max-w-[680px]">
        <div className="mb-2 flex items-baseline justify-between">
          <AthleticEyebrow>Innhold · {okt.drills.length} {okt.drills.length === 1 ? "drill" : "drills"}</AthleticEyebrow>
        </div>
        {okt.drills.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Ingen drills lagt inn ennå.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {okt.drills.map((d) => (
              <div key={d.id} className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Target className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">{d.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                    {PYR_LABEL[d.pyramide] ?? d.pyramide} · {d.durationMinutes} min{d.repetitions ? ` · ${d.repetitions} reps` : ""}
                  </span>
                  {d.description && <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{d.description}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-5 flex max-w-[680px] flex-wrap gap-2.5">
        <Link href="/portal/coach/melding" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90">
          <MessageSquare className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Kontakt coach
        </Link>
        <Link href="/portal/planlegge" className="inline-flex h-11 items-center rounded-full border border-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-primary/5">
          Se i planen
        </Link>
      </div>
    </div>
  );
}
