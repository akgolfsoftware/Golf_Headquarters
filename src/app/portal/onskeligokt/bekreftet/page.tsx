/**
 * PlayerHQ · Ønskelig økt · Bekreftet
 *
 * Bekreftelses-side etter at en spiller har sendt ønske til coach.
 * Migrert fra public/design/batch3/onske-bekreftet.html.
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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Send size={24} strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Ønske sendt · 19. mai 14:42
        </span>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal italic text-primary">Sendt til coach</em>
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Anders K har fått ønsket ditt og svarer normalt innen{" "}
          <strong className="text-foreground">24 timer på hverdager</strong>. Du får
          varsel i appen og på e-post når han har foreslått tider.
        </p>
      </section>

      {/* Sammendrag */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Ditt ønske
        </h2>
        <dl className="mt-4 space-y-3">
          <SumRow label="Type" value="Performance Coaching · 60 min" />
          <SumRow
            label="Coach"
            value={
              <>
                Anders Kristiansen{" "}
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  · Head coach
                </span>
              </>
            }
          />
          <SumRow
            label="Dager"
            value={
              <span className="flex flex-wrap gap-2">
                <Pill>Tirsdag</Pill>
                <Pill>Torsdag</Pill>
              </span>
            }
          />
          <SumRow
            label="Tidspunkt"
            value={
              <span className="flex flex-wrap gap-2">
                <Pill mono>16:00 — 18:00</Pill>
              </span>
            }
          />
          <SumRow
            label="Notat"
            value={
              <span className="block rounded-md border-l-2 border-primary/40 bg-muted/40 px-4 py-3 text-sm italic text-foreground">
                Vil jobbe med iron contact før Olyo 5. juni — særlig CS70 → CS80-
                overgangen som har vært ujevn i mai.
              </span>
            }
          />
        </dl>
      </section>

      {/* Timeline */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Hva skjer nå
        </h2>
        <ol className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === steps.length - 1;
            return (
              <li key={i} className="relative grid grid-cols-[36px_1fr] gap-4 py-4">
                {!isLast && (
                  <span
                    className={`absolute left-[17px] top-[42px] bottom-[-4px] w-[1.5px] ${
                      s.state === "done" ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    s.state === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : s.state === "active"
                        ? "border-primary bg-card text-primary"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon size={15} strokeWidth={s.state === "done" ? 2.5 : 1.75} />
                </span>
                <div className="pt-1">
                  <div
                    className={`font-display text-base font-semibold leading-tight ${
                      s.state === "pending" ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.meta}</div>
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
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Home size={14} strokeWidth={1.75} />
          Tilbake til hjem
        </Link>
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/40"
        >
          <MessageSquare size={14} strokeWidth={1.75} />
          Send melding til Anders
        </Link>
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/40"
        >
          <Users size={14} strokeWidth={1.75} />
          Se andre coacher
        </Link>
      </div>

      <p className="text-center font-mono text-[11px] text-muted-foreground">
        Ombestemt deg?{" "}
        <Link
          href="/portal/onskeligokt"
          className="text-primary underline decoration-primary/30"
        >
          Trekk tilbake ønsket
        </Link>{" "}
        · Lagret som{" "}
        <span className="font-semibold text-foreground">REQ-2026-0519-MR</span>
      </p>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Pill({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs ${
        mono ? "font-mono tabular-nums" : ""
      } text-foreground`}
    >
      {children}
    </span>
  );
}
