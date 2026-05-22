/**
 * PlayerHQ · Ønskelig økt · Bekreftet
 *
 * Bekreftelses-side etter at en spiller har sendt ønske til coach.
 * Pixel-perfekt mot design-bundle: Ønske bekreftet.html
 */
import Link from "next/link";
import {
  Send,
  Check,
  Clock,
  CalendarDays,
  Circle,
  Home,
  MessageSquare,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type TimelineStep = {
  state: "done" | "active" | "pending";
  icon: typeof Check;
  title: string;
  meta: string;
  when?: string;
};

const steps: TimelineStep[] = [
  {
    state: "done",
    icon: Check,
    title: "Du sendte ønske",
    meta: "Anders K har mottatt ønsket ditt",
    when: "19. MAI · 14:42",
  },
  {
    state: "active",
    icon: Clock,
    title: "Coach foreslår tider",
    meta: "Anders sjekker kalenderen sin og sender 2–3 alternative tidspunkter tilbake",
    when: "FORVENTET INNEN 24 T · SENEST 20. MAI 14:42",
  },
  {
    state: "pending",
    icon: Circle,
    title: "Du bekrefter",
    meta: "Velg et av alternativene Anders foreslår, eller be om et nytt forslag",
  },
  {
    state: "pending",
    icon: CalendarDays,
    title: "Time er booket",
    meta: "Vises i kalenderen din. Anders får automatisk siste TrackMan-tall.",
  },
];

export default async function OnskeligOktBekreftetPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-7 py-16 pb-24">
      {/* Hero — ingen card-wrapper, sentrert på siden */}
      <section className="flex flex-col items-center gap-4 text-center">
        {/* Accent-ikon med glow */}
        <div
          className="relative inline-flex h-[88px] w-[88px] items-center justify-center rounded-full"
          style={{
            background: "var(--accent)",
            color: "var(--foreground)",
            boxShadow: "0 0 0 4px rgba(209,248,67,0.25)",
          }}
        >
          <Send size={36} strokeWidth={2} />
          {/* radial glow */}
          <span
            className="pointer-events-none absolute inset-0 -z-10 rounded-full"
            style={{
              margin: "-32px",
              background:
                "radial-gradient(circle, rgba(209,248,67,0.30), transparent 60%)",
            }}
          />
        </div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          PlayerHQ · Ønske sendt · 19. mai 14:42
        </span>
        <h1 className="max-w-[460px] font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.015em]">
          <em className="font-serif not-italic italic font-normal text-primary">
            Sendt til coach
          </em>
        </h1>
        <p className="max-w-[480px] text-[15px] leading-[1.55] text-muted-foreground">
          Anders K har fått ønsket ditt og svarer normalt innen{" "}
          <strong className="font-semibold text-foreground">24 timer på hverdager</strong>. Du
          får varsel i appen og på e-post når han har foreslått tider.
        </p>
      </section>

      {/* Sammendrag */}
      <section
        className="flex flex-col gap-4 rounded-[18px] border border-border bg-card px-7 py-6"
        aria-labelledby="sum-h"
      >
        <h2
          id="sum-h"
          className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Ditt ønske
        </h2>
        <dl className="flex flex-col gap-0">
          <SumRow label="Type" value="Performance Coaching · 60 min" />
          <SumRow
            label="Coach"
            value={
              <>
                Anders Kristiansen{" "}
                <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] text-muted-foreground">
                  · HEAD COACH
                </span>
              </>
            }
          />
          <SumRow
            label="Dager"
            value={
              <span className="flex flex-wrap gap-1.5">
                <Pill>Tirsdag</Pill>
                <Pill>Torsdag</Pill>
              </span>
            }
          />
          <SumRow
            label="Tidspunkt"
            value={
              <span className="flex flex-wrap gap-1.5">
                <Pill time>16:00 — 18:00</Pill>
              </span>
            }
          />
          <SumRow
            label="Notat"
            value={
              <span
                className="block border-l-2 border-primary pl-3.5 py-0.5 font-serif italic text-[15px] leading-[1.45] text-foreground"
              >
                Vil jobbe med iron contact før Olyo 5. juni — særlig CS70 → CS80-overgangen som
                har vært ujevn i mai.
              </span>
            }
            last
          />
        </dl>
      </section>

      {/* Timeline */}
      <section
        className="rounded-[18px] border border-border px-7 py-6"
        style={{ background: "var(--background)" }}
      >
        <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Hva skjer nå
        </div>
        <ol className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === steps.length - 1;
            return (
              <li key={i} className="relative grid grid-cols-[36px_1fr] gap-3.5 py-3.5">
                {!isLast && (
                  <span
                    className="absolute bottom-[-14px] left-[17px] top-[42px] w-[1.5px]"
                    style={{
                      background: s.state === "done" ? "var(--primary)" : "var(--border)",
                    }}
                  />
                )}
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
                  style={
                    s.state === "done"
                      ? {
                          borderColor: "var(--primary)",
                          background: "var(--primary)",
                          color: "var(--accent)",
                        }
                      : s.state === "active"
                        ? {
                            borderColor: "var(--primary)",
                            background: "var(--card)",
                            color: "var(--primary)",
                          }
                        : {
                            borderColor: "var(--border)",
                            background: "var(--card)",
                            color: "var(--muted-foreground)",
                          }
                  }
                >
                  <Icon size={15} strokeWidth={s.state === "done" ? 3 : 2} />
                </span>
                <div className="pt-1">
                  <div
                    className={`font-display text-[15px] font-semibold leading-tight ${
                      s.state === "pending" ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">{s.meta}</div>
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

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[13.5px] font-semibold text-primary-foreground hover:opacity-90"
        >
          <Home size={14} strokeWidth={1.75} />
          Tilbake til hjem
        </Link>
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[13.5px] font-semibold text-foreground hover:bg-muted/40"
        >
          <MessageSquare size={14} strokeWidth={1.75} />
          Send melding til Anders
        </Link>
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[13.5px] font-semibold text-foreground hover:bg-muted/40"
        >
          <Users size={14} strokeWidth={1.75} />
          Se andre coacher
        </Link>
      </div>

      <p className="text-center font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
        Ombestemt deg?{" "}
        <Link
          href="/portal/onskeligokt"
          className="text-primary underline decoration-primary/30"
        >
          Trekk tilbake ønsket
        </Link>{" "}
        · Lagret som{" "}
        <span className="font-mono font-semibold text-foreground">REQ-2026-0519-MR</span>
      </p>
    </div>
  );
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
      className={`grid items-baseline gap-4 pb-3.5 ${last ? "" : "mb-0 border-b border-border/50"}`}
      style={{ gridTemplateColumns: "110px 1fr" }}
    >
      <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-display text-[14.5px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Pill({
  children,
  time = false,
}: {
  children: React.ReactNode;
  time?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums"
      style={
        time
          ? { background: "rgba(209,248,67,0.30)", color: "#4A5418" }
          : { background: "rgba(0,88,64,0.08)", color: "var(--primary)" }
      }
    >
      {children}
    </span>
  );
}
