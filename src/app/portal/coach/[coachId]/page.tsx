import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachDetalj({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const user = await requirePortalUser();
  if (user.tier === "GRATIS") {
    return <p className="text-sm text-muted-foreground">Krever Pro-abonnement.</p>;
  }

  const { coachId } = await params;
  const coach = await prisma.user.findUnique({
    where: { id: coachId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      ambition: true,
    },
  });
  if (!coach || coach.role !== "COACH") notFound();

  const initial = coach.name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <Link
        href="/portal/coach"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tilbake
      </Link>

      <div className="flex items-start gap-5 rounded-lg border border-border bg-card p-6">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            {coach.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{coach.email}</p>
          {coach.ambition && (
            <p className="mt-3 text-sm text-foreground">{coach.ambition}</p>
          )}
        </div>
      </div>

      <section className="rounded-lg border border-dashed border-border bg-muted/40 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Booking
        </span>
        <p className="mt-2 text-sm text-foreground">
          Direkte booking mot coach er knyttet til Booking-modellen, men UI
          for ledige tider bygges i Fase 1.10/1.11. Send en melding via
          AI-coach hvis du vil avtale en time, så formidler den videre.
        </p>
      </section>
    </div>
  );
}
