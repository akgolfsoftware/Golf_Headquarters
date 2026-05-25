/**
 * TrainingPartnersRow — viser kommende treningsøkter med kompiser.
 *
 * Bruk i Player Workbench (PlayerHQ Hjem). Lister opp planlagte økter
 * der spilleren har felles økt med andre spillere (eller har fått invitasjon).
 *
 * Athletic editorial: større avatarer, dramatisk meta-rad, prominent CTA.
 *
 * TODO: når SessionParticipant-modellen er på plass i Prisma, hentes data
 * via prisma.trainingSessionParticipant.findMany({...}). Inntil videre tar
 * komponenten ferdigformaterte props fra siden.
 *
 * Referanse: Spor C i Sprint 1 (Player Workbench v2).
 */
import Link from "next/link";
import { ArrowRight, UserPlus, Users } from "lucide-react";
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
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

const PYRAMID_STYLE: Record<TrainingPartnerPyramid, string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-warning/10 text-warning",
  SLAG: "bg-info/10 text-info",
  SPILL: "bg-accent/30 text-accent-foreground",
  TURN: "bg-destructive/10 text-destructive",
};

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
      return "bg-primary/10 text-primary";
    case "INVITED":
      return "bg-accent text-accent-foreground";
    case "PENDING":
    default:
      return "bg-secondary text-muted-foreground";
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
      return "Avventer";
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
        "rounded-2xl border border-border bg-card p-6 sm:p-7",
        className,
      )}
      aria-labelledby="training-partners-heading"
    >
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Tren sammen
          </p>
          <h2
            id="training-partners-heading"
            className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Treningskompiser
          </h2>
        </div>
        <Link
          href={inviteHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition hover:border-foreground/20 hover:bg-secondary"
        >
          <UserPlus className="size-3" strokeWidth={2} aria-hidden />
          Inviter
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-foreground/5 text-foreground/60">
            <Users className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Ingen felles økter denne uka. Inviter en kompis og tren sammen.
          </p>
          <Link
            href={inviteHref}
            className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-foreground px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-background transition hover:bg-foreground/90"
          >
            <UserPlus className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Inviter kompis
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {partners.map((partner) => (
            <li
              key={`${partner.userId}-${partner.okt.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-background/50 p-4 transition hover:border-foreground/20 sm:flex-row sm:items-center sm:gap-4"
            >
              {/* Avatar + info */}
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white shadow-sm sm:size-14"
                  style={{ background: avatarBg(partner.name) }}
                  aria-hidden="true"
                >
                  {initialsFromName(partner.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-display text-base font-bold text-foreground">
                      {partner.name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em]",
                        PYRAMID_STYLE[partner.okt.pyramid],
                      )}
                    >
                      {PYRAMID_LABEL[partner.okt.pyramid]}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    <span className="font-bold uppercase tracking-[0.06em] text-foreground/80">
                      {relativeDayLabel(partner.okt.startAt, now)}
                    </span>{" "}
                    {formatTime(partner.okt.startAt)}
                    {partner.okt.location ? ` · ${partner.okt.location}` : ""}
                  </p>
                  <span
                    className={cn(
                      "mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em]",
                      statusPillStyle(partner.okt.status),
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
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-background transition hover:bg-foreground/90 sm:w-auto"
                  >
                    Bli med
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/portal/tren/${partner.okt.id}`}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground transition hover:bg-secondary sm:w-auto"
                  >
                    Se økt
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
