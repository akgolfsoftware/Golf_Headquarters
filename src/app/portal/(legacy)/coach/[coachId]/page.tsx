import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Calendar,
  ChevronLeft,
  MessageSquare,
  Quote,
  Send,
} from "lucide-react";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachDetalj({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const user = await requirePortalUser();
  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Coach-profilen er en del av Pro-abonnementet."
        />
      </div>
    );
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

  // Tell delte coaching-sesjoner mellom denne brukeren og coachen.
  const sesjoner = await prisma.coachingSession.count({
    where: { userId: user.id, coachId: coach.id },
  });

  const initial = coach.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <Link
        href="/portal/coach"
        className="inline-flex h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til oversikt
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Coach"
        titleLead="Din coach"
        titleItalic={coach.name.split(" ")[0]}
        titleTrail={coach.name.split(" ").slice(1).join(" ") || undefined}
        sub={coach.email}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal/coach/melding"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Send size={16} strokeWidth={1.5} />
              Send melding
            </Link>
            <Link
              href={`/portal/booking/ny?coachId=${coachId}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Calendar size={16} strokeWidth={1.5} />
              Be om økt
            </Link>
          </div>
        }
      />

      {/* Profilkort + stats */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8">
          <Quote size={24} strokeWidth={1.5} className="text-accent-foreground" />
          {coach.ambition ? (
            <p className="mt-4 font-display text-xl italic leading-snug text-foreground">
              «{coach.ambition}»
            </p>
          ) : (
            <p className="mt-4 font-display text-xl italic leading-snug text-muted-foreground">
              «Vi jobber med det som gir lavest score når det betyr noe.»
            </p>
          )}
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-semibold leading-tight">
                {coach.name}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{coach.email}</p>
              <p className="mt-4 text-sm text-foreground">
                Hovedcoach i AK Golf Academy. Bygger personlige planer rundt
                pyramide-modellen — fundament før spiss, konsistens før spektakulært.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid gap-4">
            <Stat label="Felles økter" value={String(sesjoner)} />
          </div>
        </div>
      </section>

      {/* Sertifiseringer (statisk inntil videre) */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Award
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sertifiseringer
          </span>
        </div>
        <ul className="divide-y divide-border rounded-md border border-border">
          {CERTIFICATIONS.map((c) => (
            <li
              key={c.name}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary/60"
            >
              <div>
                <div className="text-sm font-semibold leading-none">
                  {c.name}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {c.org}
                </div>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {c.year}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Booking-info */}
      <section className="rounded-lg border border-dashed border-border bg-card/40 p-6">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquare
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Booking
          </span>
        </div>
        <p className="text-sm text-foreground">
          Direkte booking mot coach er knyttet til Booking-modellen, men UI
          for ledige tider bygges i en senere fase. Send en melding via
          AI-coach hvis du vil avtale en time, så formidler den videre.
        </p>
      </section>
    </div>
  );
}

const CERTIFICATIONS = [
  { name: "NGF Trener IV", org: "Norges Golfforbund", year: "2018" },
  { name: "TPI Level 3", org: "Titleist Performance Institute", year: "2020" },
  { name: "TrackMan Master Coach", org: "TrackMan A/S", year: "2021" },
  { name: "Mac O'Grady MORAD", org: "MORAD Institute", year: "2019" },
];

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums leading-none">
        {value}
        {suffix ? (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
