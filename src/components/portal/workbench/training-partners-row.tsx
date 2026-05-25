/**
 * TrainingPartnersRow — viser kommende treningsøkter med kompiser.
 *
 * Bruk i Player Workbench (PlayerHQ Hjem). Lister opp planlagte økter
 * der spilleren har felles økt med andre spillere (eller har fått invitasjon).
 *
 * TODO: når SessionParticipant-modellen er på plass i Prisma, hentes data
 * via prisma.trainingSessionParticipant.findMany({...}). Inntil videre tar
 * komponenten ferdigformaterte props fra siden.
 *
 * Referanse: Spor C i Sprint 1 (Player Workbench v2).
 */
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

// ---------- Types ----------

export type TrainingPartnerPyramid = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type TrainingPartnerStatus = "INVITED" | "JOINED" | "PENDING";

export type TrainingPartner = {
  userId: string;
  name: string;
  avatarUrl?: string;
  okt: {
    id: string;
    title: string;
    startAt: Date;
    pyramid: TrainingPartnerPyramid;
    location?: string;
    status: TrainingPartnerStatus;
  };
};

export type TrainingPartnersRowProps = {
  partners: TrainingPartner[];
  inviteHref?: string;
  className?: string;
};

// ---------- Helpers ----------

const PYRAMID_LABEL: Record<TrainingPartnerPyramid, string> = {
  FYS: "FYS-økt",
  TEK: "TEK-økt",
  SLAG: "SLAG-økt",
  SPILL: "SPILL-økt",
  TURN: "TURN-økt",
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function relativeDayLabel(date: Date, now: Date): string {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  if (days > 1 && days < 7) {
    return target.toLocaleDateString("nb-NO", { weekday: "long" });
  }
  return target.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function statusPillStyle(status: TrainingPartnerStatus): string {
  switch (status) {
    case "JOINED":
      return "bg-primary/10 text-primary border-primary/20";
    case "INVITED":
      return "bg-accent/30 text-accent-foreground border-accent/40";
    case "PENDING":
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

function statusLabel(status: TrainingPartnerStatus): string {
  switch (status) {
    case "JOINED":
      return "Bekreftet";
    case "INVITED":
      return "Invitert";
    case "PENDING":
    default:
      return "Ingen bekreftelse";
  }
}

// ---------- Komponent ----------

export function TrainingPartnersRow({
  partners,
  inviteHref = "/portal/tren/ny-okt?invite=true",
  className,
}: TrainingPartnersRowProps) {
  const now = new Date();

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className
      )}
      aria-labelledby="training-partners-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          id="training-partners-heading"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Treningskompiser
        </h2>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-secondary/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen felles økter denne uka
          </p>
          <Link
            href={inviteHref}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Inviter en kompis
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {partners.map((partner) => (
            <li
              key={`${partner.userId}-${partner.okt.id}`}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              {/* Avatar + info */}
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white sm:h-12 sm:w-12"
                  style={{ background: avatarBg(partner.name) }}
                  aria-hidden="true"
                >
                  {initialsFromName(partner.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {partner.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      {relativeDayLabel(partner.okt.startAt, now)}{" "}
                      {formatTime(partner.okt.startAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {PYRAMID_LABEL[partner.okt.pyramid]}
                    {partner.okt.location ? ` på ${partner.okt.location}` : ""}
                  </p>
                  <span
                    className={cn(
                      "mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
                      statusPillStyle(partner.okt.status)
                    )}
                  >
                    {statusLabel(partner.okt.status)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex sm:ml-auto sm:shrink-0">
                {partner.okt.status === "INVITED" ? (
                  <Link
                    href={`/portal/tren/${partner.okt.id}`}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
                  >
                    Bli med
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href={`/portal/tren/${partner.okt.id}`}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary sm:w-auto"
                  >
                    Se økt
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {partners.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <Link
            href={inviteHref}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary transition hover:underline"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Inviter en kompis
          </Link>
        </div>
      ) : null}
    </section>
  );
}
