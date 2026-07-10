/**
 * PlayerHQ · Book direkte med coach (/portal/booking/coach/[coachId])
 *
 * Ekte data (ingen hardkodede COACHES/SERVICES, ingen faux datepicker):
 * - Coach hentes fra prisma.user (role COACH) — navn, initialer, øktteller.
 * - Tjenester hentes fra prisma.serviceType (where coachUserId = coach.id, active).
 * - Booking går gjennom den ekte credit-flyten (/portal/booking/ny). Denne siden
 *   er et inngangspunkt: «Bekreft»/«Velg tid» lenker dit med tjeneste forhåndsvalgt.
 *   Selve ledige-tider + credit-trekk skjer i wizarden (SlotGrid → createCreditBooking).
 *
 * [coachId]-oppløsning: aksepterer både cuid (som /portal/coach/[coachId]) og
 * fornavn-slug (inngående lenker fra anlegg-siden bruker f.eks. «anders»). Se NB nederst.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

type Props = {
  params: Promise<{ coachId: string }>;
};

const WIZARD = "/portal/booking/ny";

/** Initialer fra ekte navn (maks 2 ledd) — samme regel som AgencyOS-avatarer. */
function initialsFrom(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Slår opp coach på [coachId]. Prøver cuid-oppslag først (kanonisk, brukt av
 * /portal/coach/[coachId]); faller tilbake til fornavn-match blant COACH-brukere
 * fordi inngående lenker fra anlegg-siden sender fornavn-slug (f.eks. «anders»).
 */
async function resolveCoach(coachId: string) {
  const byId = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  if (byId && byId.role === "COACH") return byId;

  const coaches = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  const slug = coachId.toLowerCase();
  return (
    coaches.find((c) => c.name.split(" ")[0]?.toLowerCase() === slug) ?? null
  );
}

export default async function BookingCoachPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { coachId } = await params;

  const coach = await resolveCoach(coachId);
  if (!coach) notFound();

  // Ekte øktteller (delte coaching-sesjoner) — samme kilde som /portal/coach/[coachId].
  const sesjoner = await prisma.coachingSession.count({
    where: { userId: user.id, coachId: coach.id },
  });

  // Ekte tjenester for denne coachen.
  const services = await prisma.serviceType.findMany({
    where: { coachUserId: coach.id, active: true },
    orderBy: { durationMin: "asc" },
  });

  const initialer = initialsFrom(coach.name);

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/portal/booking"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til booking
      </Link>

      {/* HERO */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-start">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary font-display text-[26px] font-semibold text-primary-foreground sm:h-24 sm:w-24 sm:text-[30px]">
            {initialer}
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Coach · AK Golf Academy
            </div>
            <h1 className="font-display text-[28px] font-medium leading-[1.1] -tracking-[0.02em] text-foreground sm:text-[34px]">
              {coach.name}
            </h1>
            {coach.ambition && (
              <p className="max-w-[640px] font-sans text-[14px] leading-[1.55] text-muted-foreground">
                {coach.ambition}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-primary p-4 text-primary-foreground sm:min-w-[200px]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
              Felles økter
            </div>
            <div className="font-display text-[28px] font-semibold -tracking-[0.01em] tabular-nums">
              {sesjoner}
            </div>
            <div className="font-mono text-[10px] uppercase opacity-70">
              Mellom deg og {coach.name.split(" ")[0]}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* VENSTRE: tjenester */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
              Velg type økt
            </h2>

            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center font-sans text-[13px] text-muted-foreground">
                {coach.name.split(" ")[0]} har ingen bookbare tjenester akkurat
                nå. Send en melding via AI-coach for å avtale en time.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    href={`${WIZARD}?coachId=${coach.id}&service=${s.slug}`}
                    className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                  >
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
                      <Clock
                        className="h-4 w-4 text-foreground"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                          {s.name}
                        </h3>
                        <span className="font-mono text-[10.5px] text-muted-foreground">
                          · {s.durationMin} min
                        </span>
                      </div>
                      {s.description && (
                        <p className="mt-0.5 font-sans text-[12.5px] leading-[1.4] text-muted-foreground">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div className="font-mono text-[15px] font-semibold text-foreground tabular-nums">
                        {s.priceOre > 0
                          ? `${(s.priceOre / 100).toLocaleString("nb-NO")} kr`
                          : "1 credit"}
                      </div>
                      <ChevronRight
                        className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                        strokeWidth={2}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* HØYRE: bekreft-inngang til ekte booking-flyt */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Book med {coach.name.split(" ")[0]}
            </div>
            <p className="font-sans text-[13px] leading-[1.5] text-muted-foreground">
              Velg type økt til venstre, eller gå rett til booking for å se ledige
              tider og bekrefte.
            </p>

            <Link
              href={`${WIZARD}?coachId=${coach.id}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-[14px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Velg tid og bekreft
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Link>

            <Link
              href="/portal/coach/melding"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 font-sans text-[12.5px] font-medium text-foreground hover:border-foreground/30"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
              Send melding i stedet
            </Link>

            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3" strokeWidth={2} />
              Gratis avbestilling 24t før
            </div>
          </div>

          {user.tier === "GRATIS" && (
            <div className="rounded-2xl border border-accent bg-accent/30 p-6">
              <div className="flex items-start gap-2">
                <Zap
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-foreground"
                  strokeWidth={2}
                />
                <div>
                  <div className="font-sans text-[13px] font-semibold text-foreground">
                    Booking krever Pro
                  </div>
                  <p className="mt-1 font-sans text-[12.5px] leading-[1.45] text-muted-foreground">
                    Oppgrader for å bruke forhåndsbetalte timer mot coach.
                  </p>
                  <Link
                    href="/portal/meg/abonnement"
                    className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-primary hover:underline"
                  >
                    Oppgrader til Pro
                    <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Kontakt
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5 font-sans text-[12.5px] text-foreground">
                <MapPin
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                {coach.email}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/*
 * NB — slug vs cuid:
 * /portal/coach/[coachId] bruker cuid (prisma.user.id). Men inngående lenker fra
 * /portal/booking/anlegg/[anleggId] sender fornavn-slug ("anders", "markus") fordi
 * den siden fortsatt har hardkodede coach-navn. resolveCoach() håndterer begge,
 * men den ekte fiksen er å gi anlegg-siden ekte coach-data + cuid-lenker. Flagget
 * til Anders i leveranse-sammendraget.
 */
