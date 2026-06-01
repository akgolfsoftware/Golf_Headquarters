/**
 * PlayerHQ · Ønskelig økt · Bekreftet
 *
 * Bekreftelses-side etter at spilleren har sendt ønske til coach. Leser
 * spillerens SISTE SessionRequest (ekte data) — ingen oppdiktede navn, tider
 * eller referansenummer. Statusen i tidslinjen styres av faktisk request-status.
 * DS-tokens hele veien (tidligere hardkodede rgba/hex er fjernet).
 */
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Circle,
  Clock,
  Home,
  MessageSquare,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { SessionRequestStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

type TimelineStep = {
  state: "done" | "active" | "pending";
  icon: LucideIcon;
  title: string;
  meta: string;
  when?: string;
};

/** Plukker ut «Melding: …» / «Detalj: …» fra den pakkede reason-teksten. */
function extractNote(reason: string): string | null {
  const lines = reason.split("\n").map((l) => l.trim());
  const msg = lines.find((l) => l.startsWith("Melding:"))?.slice("Melding:".length).trim();
  const detail = lines.find((l) => l.startsWith("Detalj:"))?.slice("Detalj:".length).trim();
  return msg || detail || null;
}

/** Plukker ut «Type: …» hvis formet pakket den inn. */
function extractType(reason: string): string | null {
  const line = reason
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("Type:"));
  return line ? line.slice("Type:".length).trim() : null;
}

export default async function OnskeligOktBekreftetPage() {
  const user = await requirePortalUser();

  const request = await prisma.sessionRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { coach: { select: { name: true } } },
  });

  // Ingen forespørsel funnet — vis nøktern tomstate (ingen falske data).
  if (!request) {
    return (
      <div className="mx-auto max-w-[430px] px-4 py-16 text-center">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Send size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          <em className="font-normal italic text-primary">Ingen ønsker</em> ennå
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[14px] text-muted-foreground">
          Du har ikke sendt noe ønske om økt. Send et ønske, så hjelper coachen deg å finne en tid.
        </p>
        <Link
          href="/portal/onskeligokt"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
        >
          <Send size={15} strokeWidth={1.75} aria-hidden />
          Be om økt
        </Link>
      </div>
    );
  }

  const coachName = request.coach?.name ?? null;
  const coachFirst = coachName?.split(" ")[0] ?? "coachen";
  const sentLabel = request.createdAt
    .toLocaleString("nb-NO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
  const note = extractNote(request.reason);
  const oktType = extractType(request.reason);
  const status = request.status as SessionRequestStatus;

  const steps = buildSteps(status, coachFirst, request.createdAt);
  const shortId = request.id.slice(-8).toUpperCase();

  return (
    <div className="mx-auto flex max-w-[430px] flex-col gap-7 px-4 py-10 pb-24">
      {/* Hero */}
      <section className="flex flex-col items-center gap-3 text-center">
        <div className="relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-foreground ring-4 ring-accent/25">
          <Send size={30} strokeWidth={2} aria-hidden />
          <span
            className="pointer-events-none absolute inset-0 -z-10 -m-7 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--accent) / 0.30), transparent 60%)",
            }}
            aria-hidden
          />
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          PlayerHQ · Ønske sendt · {sentLabel}
        </span>
        <h1 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.015em]">
          <em className="font-normal italic text-primary">Sendt til coach</em>
        </h1>
        <p className="max-w-[360px] text-[14px] leading-[1.55] text-muted-foreground">
          {coachName ? (
            <>
              <strong className="font-semibold text-foreground">{coachName}</strong> har fått ønsket ditt og
              svarer normalt innen{" "}
              <strong className="font-semibold text-foreground">24 timer på hverdager</strong>.
            </>
          ) : (
            <>
              Ønsket ditt er mottatt. En coach svarer normalt innen{" "}
              <strong className="font-semibold text-foreground">24 timer på hverdager</strong>.
            </>
          )}{" "}
          Du får varsel i appen når en tid er foreslått.
        </p>
      </section>

      {/* Sammendrag — kun ekte felter */}
      <section
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4"
        aria-labelledby="sum-h"
      >
        <h2
          id="sum-h"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Ditt ønske
        </h2>
        <dl className="flex flex-col">
          {oktType && <SumRow label="Type" value={oktType} />}
          {coachName && <SumRow label="Coach" value={coachName} />}
          {request.preferredArea && (
            <SumRow
              label="Område"
              value={
                <span className="inline-flex items-center rounded-full bg-[var(--color-pyr-spill-track)] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
                  {AREA_LABEL[request.preferredArea] ?? request.preferredArea}
                </span>
              }
            />
          )}
          {request.preferredDate && (
            <SumRow
              label="Ønsket tid"
              value={
                <span className="inline-flex items-center rounded-full bg-accent/30 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums text-accent-foreground">
                  {request.preferredDate.toLocaleString("nb-NO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              }
            />
          )}
          {note && (
            <SumRow
              label="Notat"
              value={
                <span
                  className="block border-l-2 border-primary py-0.5 pl-3 text-[14px] italic leading-[1.45] text-foreground"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
                >
                  {note}
                </span>
              }
              last
            />
          )}
        </dl>
      </section>

      {/* Tidslinje */}
      <section className="rounded-2xl border border-border bg-background px-5 py-4">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Hva skjer nå
        </div>
        <ol className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === steps.length - 1;
            return (
              <li key={i} className="relative grid grid-cols-[36px_1fr] gap-3.5 py-3">
                {!isLast && (
                  <span
                    className={cn(
                      "absolute bottom-[-12px] left-[17px] top-[40px] w-[1.5px]",
                      s.state === "done" ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                    s.state === "done" && "border-primary bg-primary text-accent",
                    s.state === "active" && "border-primary bg-card text-primary",
                    s.state === "pending" && "border-border bg-card text-muted-foreground",
                  )}
                >
                  <Icon size={15} strokeWidth={s.state === "done" ? 3 : 2} aria-hidden />
                </span>
                <div className="pt-0.5">
                  <div
                    className={cn(
                      "font-display text-[14px] font-semibold leading-tight",
                      s.state === "pending" ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{s.meta}</div>
                  {s.when && (
                    <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {s.when}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Handlinger */}
      <div className="flex flex-col gap-2">
        <Link
          href="/portal"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
        >
          <Home size={15} strokeWidth={1.75} aria-hidden />
          Tilbake til hjem
        </Link>
        <div className="flex gap-2">
          <Link
            href="/portal/coach"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-foreground hover:bg-secondary"
          >
            <MessageSquare size={15} strokeWidth={1.75} aria-hidden />
            Melding
          </Link>
          <Link
            href="/portal/coach"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-foreground hover:bg-secondary"
          >
            <Users size={15} strokeWidth={1.75} aria-hidden />
            Coacher
          </Link>
        </div>
      </div>

      <p className="text-center font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        Ombestemt deg?{" "}
        <Link href="/portal/onskeligokt" className="text-primary underline decoration-primary/30">
          Send et nytt ønske
        </Link>{" "}
        · Ref. <span className="font-semibold text-foreground">REQ-{shortId}</span>
      </p>
    </div>
  );
}

function buildSteps(
  status: SessionRequestStatus,
  coachFirst: string,
  createdAt: Date,
): TimelineStep[] {
  const sentWhen = createdAt
    .toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(",", " ·")
    .toUpperCase();

  const approved = status === "APPROVED";
  const declined = status === "DECLINED";
  const cancelled = status === "CANCELLED";

  return [
    {
      state: "done",
      icon: Check,
      title: "Du sendte ønske",
      meta: `${cap(coachFirst)} har mottatt ønsket ditt`,
      when: sentWhen,
    },
    {
      state: approved || declined ? "done" : cancelled ? "pending" : "active",
      icon: Clock,
      title: declined ? "Coach kunne ikke" : "Coach foreslår tider",
      meta: declined
        ? `${cap(coachFirst)} hadde ikke ledig tid denne gangen — prøv et nytt ønske.`
        : `${cap(coachFirst)} sjekker kalenderen og sender alternative tidspunkter tilbake.`,
      when: cancelled ? undefined : "FORVENTET INNEN 24 T PÅ HVERDAGER",
    },
    {
      state: approved ? "done" : "pending",
      icon: Circle,
      title: "Du bekrefter",
      meta: "Velg et av tidspunktene coachen foreslår, eller be om et nytt forslag.",
    },
    {
      state: approved ? "active" : "pending",
      icon: CalendarDays,
      title: "Time er booket",
      meta: "Vises i kalenderen din når den er bekreftet.",
    },
  ];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SumRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[90px_1fr] items-baseline gap-3 py-2.5",
        !last && "border-b border-border/60",
      )}
    >
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-[14px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}
